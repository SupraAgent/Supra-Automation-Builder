/**
 * Generic workflow execution engine.
 * BFS traversal of node/edge graph with pluggable action execution and persistence.
 * No database or app-specific dependencies.
 */
import type {
  FlowNode,
  FlowEdge,
  WorkflowData,
  WorkflowEvent,
  ActionContext,
  ActionResult,
  ActionExecutor,
  PersistenceAdapter,
  RunResult,
  ActionNodeData,
  ConditionNodeData,
  DelayNodeData,
  TryCatchNodeData,
  CodeNodeData,
  SwitchNodeData,
  LoopNodeData,
  CredentialStore,
  RetryConfig,
  NodeTiming,
  ExecutionLogger,
  StreamChunk,
  StreamingActionResult,
  OnStreamCallback,
} from "./types";

export interface EngineConfig {
  /** Executes action nodes — provided by consuming app */
  executeAction: ActionExecutor;
  /** Persistence adapter for run tracking */
  persistence: PersistenceAdapter;
  /** Template variable renderer. Default: simple {{var}} replacement */
  renderTemplate?: (template: string, vars: Record<string, string | number | undefined>) => string;
  /** Max retries for failed actions. Default: 2 */
  maxRetries?: number;
  /** Optional credential store for resolving secret references at execution time */
  credentialStore?: CredentialStore;
  /** Optional structured logger for execution observability */
  logger?: ExecutionLogger;
  /** Optional callback invoked for each chunk when an action returns a stream */
  onStream?: OnStreamCallback;
}

/**
 * Simple {{var}} template renderer.
 */
export function defaultRenderTemplate(
  template: string,
  vars: Record<string, string | number | undefined>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    return val == null ? "" : String(val);
  });
}

/**
 * Safely invoke a logger callback. A buggy logger must never crash a workflow.
 */
function emitLog(logger: ExecutionLogger | undefined, fn: (l: ExecutionLogger) => void): void {
  if (!logger) return;
  try {
    fn(logger);
  } catch {
    // Swallow — logger errors must never propagate
  }
}

/**
 * Execute a workflow from its data.
 */
export async function executeWorkflow(
  workflow: WorkflowData,
  event: WorkflowEvent,
  context: Partial<ActionContext>,
  config: EngineConfig
): Promise<RunResult> {
  const nodes = workflow.nodes ?? [];
  const edges = workflow.edges ?? [];

  if (nodes.length === 0) {
    emitLog(config.logger, (l) => l.onWorkflowComplete?.("", "failed", 0));
    return { runId: "", status: "failed", nodeOutputs: {}, nodeTimings: {}, error: "Workflow has no nodes" };
  }

  const runId = await config.persistence.createRun(workflow.id, event);
  const workflowStartTime = Date.now();
  emitLog(config.logger, (l) => l.onWorkflowStart?.(runId, workflow.id));
  const nodeOutputs: Record<string, unknown> = {};
  const nodeTimings: Record<string, NodeTiming> = {};

  // Build adjacency map
  const outEdges = new Map<string, FlowEdge[]>();
  for (const edge of edges) {
    const existing = outEdges.get(edge.source) ?? [];
    existing.push(edge);
    outEdges.set(edge.source, existing);
  }

  // Build node lookup map
  const nodeMap = new Map<string, FlowNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  const actionCtx: ActionContext = {
    workflowId: workflow.id,
    runId,
    vars: (context.vars ?? {}) as Record<string, string | number | undefined>,
    ...context,
  };

  // Find trigger node (entry point)
  const triggerNode = nodes.find((n) => n.type === "trigger");
  if (!triggerNode) {
    await config.persistence.updateRun(runId, "failed", nodeOutputs, "No trigger node found");
    return { runId, status: "failed", nodeOutputs, nodeTimings, error: "No trigger node found" };
  }

  const queue: string[] = [triggerNode.id];
  const visited = new Set<string>();

  try {
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) continue;

      await config.persistence.updateRun(runId, "running", nodeOutputs, undefined, nodeId);

      const startedAt = new Date();
      const data = node.data;

      // ── Trigger: pass through ──
      if (data.nodeType === "trigger") {
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "trigger", {}));
        nodeOutputs[nodeId] = { type: "trigger", triggered: true };
        recordTiming(nodeTimings, nodeId, startedAt);
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, nodeOutputs[nodeId] as Record<string, unknown>, nodeTimings[nodeId].durationMs)
        );
        const nextEdges = outEdges.get(nodeId) ?? [];
        for (const e of nextEdges) queue.push(e.target);
        continue;
      }

      // ── Action: execute via plugin ──
      if (data.nodeType === "action") {
        const actionData = data as ActionNodeData;
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "action", actionData.config));
        const result = await executeActionWithRetry(
          actionData.actionType,
          actionData.config,
          actionCtx,
          config,
          actionData.retryConfig,
          nodeId
        );
        nodeOutputs[nodeId] = result;
        recordTiming(nodeTimings, nodeId, startedAt);

        if (!result.success) {
          emitLog(config.logger, (l) => l.onNodeError?.(runId, nodeId, result.error ?? "Unknown error", false, 0));
          // Don't propagate to downstream nodes on failure (use try-catch for error handling)
          continue;
        }

        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, result.output ?? {}, nodeTimings[nodeId].durationMs)
        );
        const nextEdges = outEdges.get(nodeId) ?? [];
        for (const e of nextEdges) queue.push(e.target);
        continue;
      }

      // ── Condition: evaluate and branch ──
      if (data.nodeType === "condition") {
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "condition", (data as ConditionNodeData).config as unknown as Record<string, unknown>));
        const condResult = evaluateCondition(data as ConditionNodeData, actionCtx);
        nodeOutputs[nodeId] = { condition: condResult };
        recordTiming(nodeTimings, nodeId, startedAt);
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, { condition: condResult }, nodeTimings[nodeId].durationMs)
        );

        const nextEdges = outEdges.get(nodeId) ?? [];
        const targetHandle = condResult ? "true" : "false";
        const skippedHandle = condResult ? "false" : "true";
        for (const e of nextEdges) {
          if (e.sourceHandle === targetHandle) {
            queue.push(e.target);
          } else if (e.sourceHandle === skippedHandle) {
            emitLog(config.logger, (l) =>
              l.onNodeSkipped?.(runId, e.target, `Condition "${nodeId}" evaluated to ${condResult}`)
            );
          }
        }
        continue;
      }

      // ── Delay: pause the run ──
      if (data.nodeType === "delay") {
        const delayData = data as DelayNodeData;
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "delay", delayData.config as unknown as Record<string, unknown>));
        const cfg = delayData.config;
        const delayMs = computeDelayMs(cfg.duration, cfg.unit);

        const resumeAt = new Date(Date.now() + delayMs).toISOString();
        nodeOutputs[nodeId] = { delay: true, resumeAt, unit: cfg.unit, duration: cfg.duration };
        recordTiming(nodeTimings, nodeId, startedAt);
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, nodeOutputs[nodeId] as Record<string, unknown>, nodeTimings[nodeId].durationMs)
        );

        const nextEdges = outEdges.get(nodeId) ?? [];
        const nextNodeIds = nextEdges.map((e) => e.target);

        await config.persistence.updateRun(
          runId,
          "paused",
          { ...nodeOutputs, _resume_targets: nextNodeIds, _resume_at: resumeAt },
          undefined,
          nodeId
        );

        if (config.persistence.scheduleResume) {
          await config.persistence.scheduleResume(runId, workflow.id, resumeAt, event);
        }

        emitLog(config.logger, (l) => l.onWorkflowComplete?.(runId, "paused", Date.now() - workflowStartTime));
        return { runId, status: "paused", nodeOutputs, nodeTimings };
      }

      // ── Try-Catch: execute try branch, route to catch on failure ──
      if (data.nodeType === "try_catch") {
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "try_catch", {}));
        const allEdges = outEdges.get(nodeId) ?? [];

        // Collect try-path and catch-path targets based on sourceHandle
        const tryTargets = allEdges
          .filter((e) => e.sourceHandle === "success")
          .map((e) => e.target);
        const catchTargets = allEdges
          .filter((e) => e.sourceHandle === "error")
          .map((e) => e.target);

        let tryCatchError: string | undefined;

        // Execute try-branch nodes in BFS order
        const tryQueue = [...tryTargets];
        const tryVisited = new Set<string>();
        let tryFailed = false;

        try {
          while (tryQueue.length > 0) {
            const tryNodeId = tryQueue.shift()!;
            if (tryVisited.has(tryNodeId) || visited.has(tryNodeId)) continue;
            tryVisited.add(tryNodeId);
            visited.add(tryNodeId);

            const tryNode = nodeMap.get(tryNodeId);
            if (!tryNode) continue;

            const tryStartedAt = new Date();
            await config.persistence.updateRun(runId, "running", nodeOutputs, undefined, tryNodeId);

            if (tryNode.data.nodeType === "action") {
              const actionData = tryNode.data as ActionNodeData;
              emitLog(config.logger, (l) => l.onNodeStart?.(runId, tryNodeId, "action", actionData.config));
              const result = await executeActionWithRetry(
                actionData.actionType,
                actionData.config,
                actionCtx,
                config,
                actionData.retryConfig,
                tryNodeId
              );
              nodeOutputs[tryNodeId] = result;
              recordTiming(nodeTimings, tryNodeId, tryStartedAt);

              if (!result.success) {
                emitLog(config.logger, (l) => l.onNodeError?.(runId, tryNodeId, result.error ?? "Unknown error", false, 0));
                tryCatchError = result.error ?? `Action node ${tryNodeId} failed`;
                tryFailed = true;
                break;
              }
              emitLog(config.logger, (l) =>
                l.onNodeComplete?.(runId, tryNodeId, result.output ?? {}, nodeTimings[tryNodeId].durationMs)
              );
            } else if (tryNode.data.nodeType === "condition") {
              emitLog(config.logger, (l) => l.onNodeStart?.(runId, tryNodeId, "condition", (tryNode.data as ConditionNodeData).config as unknown as Record<string, unknown>));
              const condResult = evaluateCondition(tryNode.data as ConditionNodeData, actionCtx);
              nodeOutputs[tryNodeId] = { condition: condResult };
              recordTiming(nodeTimings, tryNodeId, tryStartedAt);
              emitLog(config.logger, (l) =>
                l.onNodeComplete?.(runId, tryNodeId, { condition: condResult }, nodeTimings[tryNodeId].durationMs)
              );

              const nextEdges = outEdges.get(tryNodeId) ?? [];
              const targetHandle = condResult ? "true" : "false";
              for (const e of nextEdges) {
                if (e.sourceHandle === targetHandle) tryQueue.push(e.target);
              }
              continue;
            } else if (tryNode.data.nodeType === "delay") {
              const delayData = tryNode.data as DelayNodeData;
              emitLog(config.logger, (l) => l.onNodeStart?.(runId, tryNodeId, "delay", delayData.config as unknown as Record<string, unknown>));
              const cfg = delayData.config;
              const delayMs = computeDelayMs(cfg.duration, cfg.unit);
              const resumeAt = new Date(Date.now() + delayMs).toISOString();
              nodeOutputs[tryNodeId] = { delay: true, resumeAt, unit: cfg.unit, duration: cfg.duration };
              recordTiming(nodeTimings, tryNodeId, tryStartedAt);
              emitLog(config.logger, (l) =>
                l.onNodeComplete?.(runId, tryNodeId, nodeOutputs[tryNodeId] as Record<string, unknown>, nodeTimings[tryNodeId].durationMs)
              );
              // Delay within try-catch pauses the entire run
              const nextEdges = outEdges.get(tryNodeId) ?? [];
              const nextNodeIds = nextEdges.map((e) => e.target);
              await config.persistence.updateRun(
                runId, "paused",
                { ...nodeOutputs, _resume_targets: nextNodeIds, _resume_at: resumeAt },
                undefined, tryNodeId
              );
              if (config.persistence.scheduleResume) {
                await config.persistence.scheduleResume(runId, workflow.id, resumeAt, event);
              }
              // Record timing for the parent try_catch node before returning
              recordTiming(nodeTimings, nodeId, startedAt);
              emitLog(config.logger, (l) => l.onWorkflowComplete?.(runId, "paused", Date.now() - workflowStartTime));
              return { runId, status: "paused", nodeOutputs, nodeTimings };
            } else {
              emitLog(config.logger, (l) => l.onNodeStart?.(runId, tryNodeId, tryNode.data.nodeType, {}));
              nodeOutputs[tryNodeId] = { type: tryNode.data.nodeType, passthrough: true };
              recordTiming(nodeTimings, tryNodeId, tryStartedAt);
              emitLog(config.logger, (l) =>
                l.onNodeComplete?.(runId, tryNodeId, nodeOutputs[tryNodeId] as Record<string, unknown>, nodeTimings[tryNodeId].durationMs)
              );
            }

            // Enqueue downstream edges of the try node (within try branch)
            if (!tryFailed) {
              const nextEdges = outEdges.get(tryNodeId) ?? [];
              for (const e of nextEdges) tryQueue.push(e.target);
            }
          }
        } catch (err) {
          tryFailed = true;
          tryCatchError = err instanceof Error ? err.message : String(err);
        }

        nodeOutputs[nodeId] = {
          type: "try_catch",
          trySucceeded: !tryFailed,
          error: tryCatchError,
        };
        recordTiming(nodeTimings, nodeId, startedAt);
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, nodeOutputs[nodeId] as Record<string, unknown>, nodeTimings[nodeId].durationMs)
        );

        if (tryFailed) {
          // Inject error into context for catch-branch nodes
          actionCtx.vars._tryCatchError = tryCatchError ?? "Unknown error";
          for (const catchTarget of catchTargets) {
            queue.push(catchTarget);
          }
        }
        // If try succeeded, no further routing — downstream from try nodes already queued
        continue;
      }

      // ── Code: execute user code in a sandbox ──
      if (data.nodeType === "code") {
        const codeData = data as CodeNodeData;
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "code", { language: codeData.config.language }));
        const codeResult = await executeCodeNode(codeData, nodeOutputs, actionCtx);
        nodeOutputs[nodeId] = codeResult;
        recordTiming(nodeTimings, nodeId, startedAt);

        if (!codeResult.success) {
          emitLog(config.logger, (l) => l.onNodeError?.(runId, nodeId, codeResult.error ?? "Code execution failed", false, 0));
          continue;
        }

        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, codeResult.output ?? {}, nodeTimings[nodeId].durationMs)
        );
        const nextEdges = outEdges.get(nodeId) ?? [];
        for (const e of nextEdges) queue.push(e.target);
        continue;
      }

      // ── Switch: evaluate expression and route to matching case ──
      if (data.nodeType === "switch") {
        const switchData = data as SwitchNodeData;
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "switch", { expression: switchData.config.expression }));
        const switchResult = executeSwitchNode(switchData, nodeOutputs, actionCtx, config);
        nodeOutputs[nodeId] = switchResult;
        recordTiming(nodeTimings, nodeId, startedAt);
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, switchResult as unknown as Record<string, unknown>, nodeTimings[nodeId].durationMs)
        );

        const matchedHandle = switchResult.matchedCase;
        if (matchedHandle) {
          const nextEdges = outEdges.get(nodeId) ?? [];
          for (const e of nextEdges) {
            if (e.sourceHandle === matchedHandle) {
              queue.push(e.target);
            } else {
              emitLog(config.logger, (l) =>
                l.onNodeSkipped?.(runId, e.target, `Switch "${nodeId}" routed to "${matchedHandle}"`)
              );
            }
          }
        }
        continue;
      }

      // ── Loop: iterate over array and execute body branch ──
      if (data.nodeType === "loop") {
        const loopData = data as LoopNodeData;
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "loop", { arrayExpression: loopData.config.arrayExpression }));
        const loopResult = await executeLoopNode(
          loopData, nodeOutputs, actionCtx, config, outEdges, nodeMap, nodeId, visited, nodeTimings, runId, startedAt
        );
        nodeOutputs[nodeId] = loopResult;
        recordTiming(nodeTimings, nodeId, startedAt);

        if (!loopResult.success) {
          emitLog(config.logger, (l) => l.onNodeError?.(runId, nodeId, loopResult.error ?? "Loop execution failed", false, 0));
          continue;
        }

        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, loopResult.output ?? {}, nodeTimings[nodeId].durationMs)
        );
        // Queue "complete" handle edges
        const nextEdges = outEdges.get(nodeId) ?? [];
        for (const e of nextEdges) {
          if (e.sourceHandle === "complete") {
            queue.push(e.target);
          }
        }
        continue;
      }

      // Unknown type — skip and continue
      emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, (data as { nodeType: string }).nodeType, {}));
      nodeOutputs[nodeId] = { type: (data as { nodeType: string }).nodeType, passthrough: true };
      recordTiming(nodeTimings, nodeId, startedAt);
      emitLog(config.logger, (l) =>
        l.onNodeComplete?.(runId, nodeId, nodeOutputs[nodeId] as Record<string, unknown>, nodeTimings[nodeId].durationMs)
      );
      const nextEdges = outEdges.get(nodeId) ?? [];
      for (const e of nextEdges) queue.push(e.target);
    }

    await config.persistence.updateRun(runId, "completed", nodeOutputs);
    if (config.persistence.onWorkflowComplete) {
      await config.persistence.onWorkflowComplete(workflow.id);
    }

    emitLog(config.logger, (l) => l.onWorkflowComplete?.(runId, "completed", Date.now() - workflowStartTime));
    return { runId, status: "completed", nodeOutputs, nodeTimings };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await config.persistence.updateRun(runId, "failed", nodeOutputs, errorMsg);
    emitLog(config.logger, (l) => l.onWorkflowComplete?.(runId, "failed", Date.now() - workflowStartTime));
    return { runId, status: "failed", nodeOutputs, nodeTimings, error: errorMsg };
  }
}

/**
 * Resume a paused workflow from stored resume targets.
 */
export async function resumeWorkflow(
  workflow: WorkflowData,
  runId: string,
  resumeTargets: string[],
  existingOutputs: Record<string, unknown>,
  event: WorkflowEvent,
  context: Partial<ActionContext>,
  config: EngineConfig
): Promise<RunResult> {
  const nodes = workflow.nodes ?? [];
  const edges = workflow.edges ?? [];
  const nodeOutputs = { ...existingOutputs };
  const nodeTimings: Record<string, NodeTiming> = {};
  const resumeStartTime = Date.now();
  emitLog(config.logger, (l) => l.onWorkflowStart?.(runId, workflow.id));

  delete nodeOutputs._resume_targets;
  delete nodeOutputs._resume_at;

  const outEdges = new Map<string, FlowEdge[]>();
  for (const edge of edges) {
    const existing = outEdges.get(edge.source) ?? [];
    existing.push(edge);
    outEdges.set(edge.source, existing);
  }

  const nodeMap = new Map<string, FlowNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  const actionCtx: ActionContext = {
    workflowId: workflow.id,
    runId,
    vars: (context.vars ?? {}) as Record<string, string | number | undefined>,
    ...context,
  };

  await config.persistence.updateRun(runId, "running", nodeOutputs);

  const queue = [...resumeTargets];
  const visited = new Set<string>(Object.keys(nodeOutputs));

  try {
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) continue;

      await config.persistence.updateRun(runId, "running", nodeOutputs, undefined, nodeId);
      const startedAt = new Date();
      const data = node.data;

      if (data.nodeType === "action") {
        const actionData = data as ActionNodeData;
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "action", actionData.config));
        const result = await executeActionWithRetry(
          actionData.actionType,
          actionData.config,
          actionCtx,
          config,
          actionData.retryConfig,
          nodeId
        );
        nodeOutputs[nodeId] = result;
        recordTiming(nodeTimings, nodeId, startedAt);
        if (!result.success) {
          emitLog(config.logger, (l) => l.onNodeError?.(runId, nodeId, result.error ?? "Unknown error", false, 0));
          // Don't propagate to downstream nodes on failure (use try-catch for error handling)
          continue;
        }
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, result.output ?? {}, nodeTimings[nodeId].durationMs)
        );
        const nextEdges = outEdges.get(nodeId) ?? [];
        for (const e of nextEdges) queue.push(e.target);
        continue;
      }

      if (data.nodeType === "condition") {
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "condition", (data as ConditionNodeData).config as unknown as Record<string, unknown>));
        const condResult = evaluateCondition(data as ConditionNodeData, actionCtx);
        nodeOutputs[nodeId] = { condition: condResult };
        recordTiming(nodeTimings, nodeId, startedAt);
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, { condition: condResult }, nodeTimings[nodeId].durationMs)
        );
        const nextEdges = outEdges.get(nodeId) ?? [];
        const targetHandle = condResult ? "true" : "false";
        const skippedHandle = condResult ? "false" : "true";
        for (const e of nextEdges) {
          if (e.sourceHandle === targetHandle) {
            queue.push(e.target);
          } else if (e.sourceHandle === skippedHandle) {
            emitLog(config.logger, (l) =>
              l.onNodeSkipped?.(runId, e.target, `Condition "${nodeId}" evaluated to ${condResult}`)
            );
          }
        }
        continue;
      }

      if (data.nodeType === "delay") {
        const delayData = data as DelayNodeData;
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "delay", delayData.config as unknown as Record<string, unknown>));
        const cfg = delayData.config;
        const delayMs = computeDelayMs(cfg.duration, cfg.unit);

        const resumeAt = new Date(Date.now() + delayMs).toISOString();
        nodeOutputs[nodeId] = { delay: true, resumeAt };
        recordTiming(nodeTimings, nodeId, startedAt);
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, nodeOutputs[nodeId] as Record<string, unknown>, nodeTimings[nodeId].durationMs)
        );

        const nextEdges = outEdges.get(nodeId) ?? [];
        const nextNodeIds = nextEdges.map((e) => e.target);

        await config.persistence.updateRun(
          runId,
          "paused",
          { ...nodeOutputs, _resume_targets: nextNodeIds, _resume_at: resumeAt },
          undefined,
          nodeId
        );

        if (config.persistence.scheduleResume) {
          await config.persistence.scheduleResume(runId, workflow.id, resumeAt, event);
        }

        emitLog(config.logger, (l) => l.onWorkflowComplete?.(runId, "paused", Date.now() - resumeStartTime));
        return { runId, status: "paused", nodeOutputs, nodeTimings };
      }

      // ── Try-Catch in resume: same logic as executeWorkflow ──
      if (data.nodeType === "try_catch") {
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "try_catch", {}));
        const allEdges = outEdges.get(nodeId) ?? [];
        const tryTargets = allEdges.filter((e) => e.sourceHandle === "success").map((e) => e.target);
        const catchTargets = allEdges.filter((e) => e.sourceHandle === "error").map((e) => e.target);

        let tryCatchError: string | undefined;
        const tryQueue = [...tryTargets];
        const tryVisited = new Set<string>();
        let tryFailed = false;

        try {
          while (tryQueue.length > 0) {
            const tryNodeId = tryQueue.shift()!;
            if (tryVisited.has(tryNodeId) || visited.has(tryNodeId)) continue;
            tryVisited.add(tryNodeId);
            visited.add(tryNodeId);

            const tryNode = nodeMap.get(tryNodeId);
            if (!tryNode) continue;

            const tryStartedAt = new Date();
            await config.persistence.updateRun(runId, "running", nodeOutputs, undefined, tryNodeId);

            if (tryNode.data.nodeType === "action") {
              const actionData = tryNode.data as ActionNodeData;
              emitLog(config.logger, (l) => l.onNodeStart?.(runId, tryNodeId, "action", actionData.config));
              const result = await executeActionWithRetry(
                actionData.actionType, actionData.config, actionCtx, config, actionData.retryConfig, tryNodeId
              );
              nodeOutputs[tryNodeId] = result;
              recordTiming(nodeTimings, tryNodeId, tryStartedAt);
              if (!result.success) {
                emitLog(config.logger, (l) => l.onNodeError?.(runId, tryNodeId, result.error ?? "Unknown error", false, 0));
                tryCatchError = result.error ?? `Action node ${tryNodeId} failed`;
                tryFailed = true;
                break;
              }
              emitLog(config.logger, (l) =>
                l.onNodeComplete?.(runId, tryNodeId, result.output ?? {}, nodeTimings[tryNodeId].durationMs)
              );
            } else if (tryNode.data.nodeType === "condition") {
              emitLog(config.logger, (l) => l.onNodeStart?.(runId, tryNodeId, "condition", (tryNode.data as ConditionNodeData).config as unknown as Record<string, unknown>));
              const condResult = evaluateCondition(tryNode.data as ConditionNodeData, actionCtx);
              nodeOutputs[tryNodeId] = { condition: condResult };
              recordTiming(nodeTimings, tryNodeId, tryStartedAt);
              emitLog(config.logger, (l) =>
                l.onNodeComplete?.(runId, tryNodeId, { condition: condResult }, nodeTimings[tryNodeId].durationMs)
              );

              const nextEdges = outEdges.get(tryNodeId) ?? [];
              const targetHandle = condResult ? "true" : "false";
              for (const e of nextEdges) {
                if (e.sourceHandle === targetHandle) tryQueue.push(e.target);
              }
              continue;
            } else if (tryNode.data.nodeType === "delay") {
              const delayData = tryNode.data as DelayNodeData;
              emitLog(config.logger, (l) => l.onNodeStart?.(runId, tryNodeId, "delay", delayData.config as unknown as Record<string, unknown>));
              const cfg = delayData.config;
              const delayMs = computeDelayMs(cfg.duration, cfg.unit);
              const resumeAt = new Date(Date.now() + delayMs).toISOString();
              nodeOutputs[tryNodeId] = { delay: true, resumeAt, unit: cfg.unit, duration: cfg.duration };
              recordTiming(nodeTimings, tryNodeId, tryStartedAt);
              emitLog(config.logger, (l) =>
                l.onNodeComplete?.(runId, tryNodeId, nodeOutputs[tryNodeId] as Record<string, unknown>, nodeTimings[tryNodeId].durationMs)
              );
              // Delay within try-catch pauses the entire run
              const nextEdges = outEdges.get(tryNodeId) ?? [];
              const nextNodeIds = nextEdges.map((e) => e.target);
              await config.persistence.updateRun(
                runId, "paused",
                { ...nodeOutputs, _resume_targets: nextNodeIds, _resume_at: resumeAt },
                undefined, tryNodeId
              );
              if (config.persistence.scheduleResume) {
                await config.persistence.scheduleResume(runId, workflow.id, resumeAt, event);
              }
              // Record timing for the parent try_catch node before returning
              recordTiming(nodeTimings, nodeId, startedAt);
              emitLog(config.logger, (l) => l.onWorkflowComplete?.(runId, "paused", Date.now() - resumeStartTime));
              return { runId, status: "paused", nodeOutputs, nodeTimings };
            } else {
              emitLog(config.logger, (l) => l.onNodeStart?.(runId, tryNodeId, tryNode.data.nodeType, {}));
              nodeOutputs[tryNodeId] = { type: tryNode.data.nodeType, passthrough: true };
              recordTiming(nodeTimings, tryNodeId, tryStartedAt);
              emitLog(config.logger, (l) =>
                l.onNodeComplete?.(runId, tryNodeId, nodeOutputs[tryNodeId] as Record<string, unknown>, nodeTimings[tryNodeId].durationMs)
              );
            }

            if (!tryFailed) {
              const nextEdges = outEdges.get(tryNodeId) ?? [];
              for (const e of nextEdges) tryQueue.push(e.target);
            }
          }
        } catch (err) {
          tryFailed = true;
          tryCatchError = err instanceof Error ? err.message : String(err);
        }

        nodeOutputs[nodeId] = { type: "try_catch", trySucceeded: !tryFailed, error: tryCatchError };
        recordTiming(nodeTimings, nodeId, startedAt);
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, nodeOutputs[nodeId] as Record<string, unknown>, nodeTimings[nodeId].durationMs)
        );

        if (tryFailed) {
          actionCtx.vars._tryCatchError = tryCatchError ?? "Unknown error";
          for (const catchTarget of catchTargets) queue.push(catchTarget);
        }
        continue;
      }

      // ── Code: execute user code in a sandbox ──
      if (data.nodeType === "code") {
        const codeData = data as CodeNodeData;
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "code", { language: codeData.config.language }));
        const codeResult = await executeCodeNode(codeData, nodeOutputs, actionCtx);
        nodeOutputs[nodeId] = codeResult;
        recordTiming(nodeTimings, nodeId, startedAt);

        if (!codeResult.success) {
          emitLog(config.logger, (l) => l.onNodeError?.(runId, nodeId, codeResult.error ?? "Code execution failed", false, 0));
          continue;
        }

        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, codeResult.output ?? {}, nodeTimings[nodeId].durationMs)
        );
        const nextEdges = outEdges.get(nodeId) ?? [];
        for (const e of nextEdges) queue.push(e.target);
        continue;
      }

      // ── Switch: evaluate expression and route to matching case ──
      if (data.nodeType === "switch") {
        const switchData = data as SwitchNodeData;
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "switch", { expression: switchData.config.expression }));
        const switchResult = executeSwitchNode(switchData, nodeOutputs, actionCtx, config);
        nodeOutputs[nodeId] = switchResult;
        recordTiming(nodeTimings, nodeId, startedAt);
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, switchResult as unknown as Record<string, unknown>, nodeTimings[nodeId].durationMs)
        );

        const matchedHandle = switchResult.matchedCase;
        if (matchedHandle) {
          const nextEdges = outEdges.get(nodeId) ?? [];
          for (const e of nextEdges) {
            if (e.sourceHandle === matchedHandle) {
              queue.push(e.target);
            } else {
              emitLog(config.logger, (l) =>
                l.onNodeSkipped?.(runId, e.target, `Switch "${nodeId}" routed to "${matchedHandle}"`)
              );
            }
          }
        }
        continue;
      }

      // ── Loop: iterate over array and execute body branch ──
      if (data.nodeType === "loop") {
        const loopData = data as LoopNodeData;
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, "loop", { arrayExpression: loopData.config.arrayExpression }));
        const loopResult = await executeLoopNode(
          loopData, nodeOutputs, actionCtx, config, outEdges, nodeMap, nodeId, visited, nodeTimings, runId, startedAt
        );
        nodeOutputs[nodeId] = loopResult;
        recordTiming(nodeTimings, nodeId, startedAt);

        if (!loopResult.success) {
          emitLog(config.logger, (l) => l.onNodeError?.(runId, nodeId, loopResult.error ?? "Loop execution failed", false, 0));
          continue;
        }

        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, nodeId, loopResult.output ?? {}, nodeTimings[nodeId].durationMs)
        );
        const nextEdges = outEdges.get(nodeId) ?? [];
        for (const e of nextEdges) {
          if (e.sourceHandle === "complete") {
            queue.push(e.target);
          }
        }
        continue;
      }

      emitLog(config.logger, (l) => l.onNodeStart?.(runId, nodeId, (data as { nodeType: string }).nodeType, {}));
      nodeOutputs[nodeId] = { type: (data as { nodeType: string }).nodeType, passthrough: true };
      recordTiming(nodeTimings, nodeId, startedAt);
      emitLog(config.logger, (l) =>
        l.onNodeComplete?.(runId, nodeId, nodeOutputs[nodeId] as Record<string, unknown>, nodeTimings[nodeId].durationMs)
      );
      const nextEdges = outEdges.get(nodeId) ?? [];
      for (const e of nextEdges) queue.push(e.target);
    }

    await config.persistence.updateRun(runId, "completed", nodeOutputs);
    if (config.persistence.onWorkflowComplete) {
      await config.persistence.onWorkflowComplete(workflow.id);
    }

    emitLog(config.logger, (l) => l.onWorkflowComplete?.(runId, "completed", Date.now() - resumeStartTime));
    return { runId, status: "completed", nodeOutputs, nodeTimings };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await config.persistence.updateRun(runId, "failed", nodeOutputs, errorMsg);
    emitLog(config.logger, (l) => l.onWorkflowComplete?.(runId, "failed", Date.now() - resumeStartTime));
    return { runId, status: "failed", nodeOutputs, nodeTimings, error: errorMsg };
  }
}

// ── Internal helpers ────────────────────────────────────────────

/**
 * Consume an async stream from a StreamingActionResult.
 * Calls onStream for each chunk, collects text chunks into a combined output,
 * and returns the final ActionResult with the combined text in output.
 * Handles errors mid-stream gracefully (partial output + error status).
 */
async function consumeStream(
  result: StreamingActionResult,
  nodeId: string,
  runId: string,
  engineConfig: EngineConfig
): Promise<ActionResult> {
  if (!result.stream) return result;

  const textParts: string[] = [];
  const onStream = engineConfig.onStream;
  const streamStartTime = Date.now();

  emitLog(engineConfig.logger, (l) =>
    l.onNodeStart?.(runId, nodeId, "stream", { streaming: true })
  );

  try {
    for await (const chunk of result.stream) {
      if (onStream) {
        try {
          onStream(nodeId, chunk);
        } catch {
          // Consumer callback errors must never crash the stream
        }
      }

      if (chunk.type === "text") {
        textParts.push(chunk.content);
      } else if (chunk.type === "error") {
        // Error chunk mid-stream: return partial output with error
        const partialText = textParts.join("");
        emitLog(engineConfig.logger, (l) =>
          l.onNodeError?.(runId, nodeId, chunk.content, false, 0)
        );
        return {
          success: false,
          error: chunk.content,
          output: {
            ...result.output,
            streamedText: partialText,
            streamCompleted: false,
          },
        };
      }
      // tool_call, tool_result, done are passed through to onStream but
      // only text chunks contribute to the combined output
    }
  } catch (err) {
    // Stream iteration threw — return partial output with error
    const partialText = textParts.join("");
    const errorMsg = err instanceof Error ? err.message : String(err);
    emitLog(engineConfig.logger, (l) =>
      l.onNodeError?.(runId, nodeId, `Stream error: ${errorMsg}`, false, 0)
    );
    return {
      success: false,
      error: `Stream error: ${errorMsg}`,
      output: {
        ...result.output,
        streamedText: partialText,
        streamCompleted: false,
      },
    };
  }

  const combinedText = textParts.join("");
  emitLog(engineConfig.logger, (l) =>
    l.onNodeComplete?.(runId, nodeId, { streamedText: combinedText, streamCompleted: true }, Date.now() - streamStartTime)
  );
  return {
    success: result.success,
    output: {
      ...result.output,
      streamedText: combinedText,
      streamCompleted: true,
    },
  };
}

/**
 * Convert a duration + unit into milliseconds.
 */
function computeDelayMs(duration: number, unit: "minutes" | "hours" | "days"): number {
  switch (unit) {
    case "hours": return duration * 60 * 60 * 1000;
    case "days": return duration * 24 * 60 * 60 * 1000;
    case "minutes":
    default: return duration * 60 * 1000;
  }
}

const CREDENTIAL_REF_PATTERN = /^credential:(.+)$/;

/**
 * Resolve credential references in action config.
 * Values matching `credential:<id>` are replaced with the real secret
 * from the credential store. Only string values are checked.
 * The resolved config is a shallow copy — the original is never mutated.
 */
async function resolveCredentials(
  config: Record<string, unknown>,
  store: CredentialStore
): Promise<Record<string, unknown>> {
  const resolved: Record<string, unknown> = { ...config };

  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value !== "string") continue;
    const match = CREDENTIAL_REF_PATTERN.exec(value);
    if (!match) continue;

    const credentialId = match[1];
    const secret = await store.resolve(credentialId);
    if (secret === undefined) {
      throw new Error(`Credential "${credentialId}" not found for config key "${key}"`);
    }
    resolved[key] = secret;
  }

  return resolved;
}

/**
 * Calculate retry delay based on backoff strategy.
 * Exponential: min(baseDelay * 2^attempt + jitter, maxDelay)
 * Linear: min(baseDelay * (attempt + 1) + jitter, maxDelay)
 */
function calculateRetryDelay(
  attempt: number,
  retryConfig: RetryConfig
): number {
  const baseDelay = retryConfig.baseDelayMs ?? 1000;
  const maxDelay = retryConfig.maxDelayMs ?? 30000;
  const backoffType = retryConfig.backoffType ?? "exponential";

  let delay: number;
  if (backoffType === "exponential") {
    delay = baseDelay * Math.pow(2, attempt);
  } else {
    delay = baseDelay * (attempt + 1);
  }

  // Cap first, then add jitter so we don't lose jitter near maxDelay
  // (prevents thundering herd when many retries hit the cap simultaneously)
  const capped = Math.min(delay, maxDelay);
  const jitter = Math.random() * Math.min(500, capped * 0.1);
  return capped + jitter;
}

/**
 * Merge per-node RetryConfig with engine defaults.
 * Per-node fields take precedence; missing fields fall back to engine/global defaults.
 */
function resolveRetryConfig(
  engineMaxRetries: number,
  nodeConfig?: RetryConfig
): Required<RetryConfig> {
  return {
    maxRetries: nodeConfig?.maxRetries ?? engineMaxRetries,
    backoffType: nodeConfig?.backoffType ?? "exponential",
    baseDelayMs: nodeConfig?.baseDelayMs ?? 1000,
    maxDelayMs: nodeConfig?.maxDelayMs ?? 30000,
  };
}

/**
 * Record timing for a node execution.
 */
function recordTiming(
  nodeTimings: Record<string, NodeTiming>,
  nodeId: string,
  startedAt: Date
): void {
  const completedAt = new Date();
  nodeTimings[nodeId] = {
    nodeId,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs: completedAt.getTime() - startedAt.getTime(),
  };
}

async function executeActionWithRetry(
  actionType: string,
  config: Record<string, unknown>,
  ctx: ActionContext,
  engineConfig: EngineConfig,
  nodeRetryConfig?: RetryConfig,
  nodeId?: string
): Promise<ActionResult> {
  const retryConfig = resolveRetryConfig(
    engineConfig.maxRetries ?? 2,
    nodeRetryConfig
  );
  const maxRetries = retryConfig.maxRetries;
  let lastResult: ActionResult = { success: false, error: "Unknown action" };

  // Resolve credential references before execution
  let resolvedConfig = config;
  if (engineConfig.credentialStore) {
    try {
      resolvedConfig = await resolveCredentials(config, engineConfig.credentialStore);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMsg };
    }
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const rawResult = await engineConfig.executeAction(actionType, resolvedConfig, ctx);

    // If the result includes a stream, consume it before proceeding
    const streamingResult = rawResult as StreamingActionResult;
    if (streamingResult.stream) {
      lastResult = await consumeStream(streamingResult, nodeId ?? "unknown", ctx.runId, engineConfig);
    } else {
      lastResult = rawResult;
    }

    if (lastResult.success) return lastResult;

    // Don't retry validation/config errors
    const err = lastResult.error ?? "";
    if (
      err.includes("not found") ||
      err.includes("No ") ||
      err.includes("Invalid") ||
      err.includes("Unknown")
    ) {
      break;
    }

    const willRetry = attempt < maxRetries;
    if (nodeId) {
      emitLog(engineConfig.logger, (l) =>
        l.onNodeError?.(ctx.runId, nodeId, err, willRetry, attempt + 1)
      );
    }

    if (willRetry) {
      const delayMs = calculateRetryDelay(attempt, retryConfig);
      if (nodeId) {
        emitLog(engineConfig.logger, (l) =>
          l.onRetry?.(ctx.runId, nodeId, attempt + 1, delayMs)
        );
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return lastResult;
}

/**
 * Evaluate a condition node against the current context vars.
 */
export function evaluateCondition(
  data: ConditionNodeData,
  ctx: ActionContext
): boolean {
  const config = data.config;

  if (config.conditions && config.conditions.length > 0) {
    const results = config.conditions.map((c) =>
      evalSingleCondition(c.field, c.operator, c.value, ctx)
    );
    return config.logic === "or" ? results.some(Boolean) : results.every(Boolean);
  }

  return evalSingleCondition(config.field, config.operator, config.value, ctx);
}

function evalSingleCondition(
  field: string,
  operator: string,
  value: string,
  ctx: ActionContext
): boolean {
  const actual = String(ctx.vars[field] ?? "");
  const expected = value;

  switch (operator) {
    case "equals": return actual === expected;
    case "not_equals": return actual !== expected;
    case "contains": return actual.toLowerCase().includes(expected.toLowerCase());
    case "not_contains": return !actual.toLowerCase().includes(expected.toLowerCase());
    case "starts_with": return actual.toLowerCase().startsWith(expected.toLowerCase());
    case "gt": return Number(actual) > Number(expected);
    case "lt": return Number(actual) < Number(expected);
    case "gte": return Number(actual) >= Number(expected);
    case "lte": return Number(actual) <= Number(expected);
    case "is_empty": return actual === "" || actual === "undefined";
    case "is_not_empty": return actual !== "" && actual !== "undefined";
    default: return false;
  }
}

// ── Code Node execution ─────────────────────────────────────────

/**
 * Build a map of upstream node outputs keyed by node ID.
 * Used as the `input` parameter for code/switch/loop nodes.
 */
function buildUpstreamInput(nodeOutputs: Record<string, unknown>): Record<string, unknown> {
  const input: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(nodeOutputs)) {
    if (key.startsWith("_")) continue; // skip internal keys
    input[key] = value;
  }
  return input;
}

/**
 * Execute a code node's user-provided code in a sandboxed Function constructor.
 * The code receives `input` (upstream outputs) and `context` (workflow vars).
 * Returns an ActionResult with the code's return value in output.result.
 */
async function executeCodeNode(
  data: CodeNodeData,
  nodeOutputs: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionResult> {
  const { code, timeout = 5000 } = data.config;

  if (!code || code.trim().length === 0) {
    return { success: false, error: "Code node has no code to execute" };
  }

  const input = buildUpstreamInput(nodeOutputs);
  const context: Record<string, unknown> = { ...ctx.vars };

  try {
    // Create a sandboxed function that blocks access to dangerous globals.
    // We shadow globals as local variables AND use .call(null, ...) to prevent
    // `this` from leaking the global object. We also block common escape hatches
    // like eval, Function constructor, import(), etc.
    //
    // NOTE: This is a best-effort sandbox using the Function constructor.
    // It is NOT equivalent to a true isolate (e.g., vm2, isolated-vm, or
    // a Web Worker). Determined attackers may find bypass vectors. For
    // production use with untrusted code, consider a process-level sandbox.

    // Reject code that attempts dynamic import (which cannot be blocked via shadowing)
    if (/\bimport\s*\(/.test(code)) {
      return { success: false, error: "Code execution error: dynamic import() is not allowed" };
    }

    const sandboxedFn = new Function(
      "input",
      "context",
      `"use strict";
      // Block access to dangerous globals
      const process = undefined;
      const require = undefined;
      const fetch = undefined;
      const globalThis = undefined;
      const global = undefined;
      const window = undefined;
      const self = undefined;
      const XMLHttpRequest = undefined;
      const importScripts = undefined;
      const eval = undefined;
      const Function = undefined;
      const constructor = undefined;
      return (async () => { ${code} })();`
    );

    // Call with null `this` to prevent global object leakage via `this`
    const resultPromise = sandboxedFn.call(null, input, context);

    // Enforce timeout using Promise.race
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Code execution timed out after ${timeout}ms`)), timeout);
    });

    const result = await Promise.race([resultPromise, timeoutPromise]);

    return {
      success: true,
      output: { result: result === undefined ? null : result },
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Code execution error: ${errorMsg}` };
  }
}

// ── Switch Node execution ───────────────────────────────────────

/**
 * Resolve a template expression against upstream outputs and context vars.
 * Supports {{nodeId.field}} notation for accessing nested outputs,
 * and simple {{varName}} for context vars.
 */
function resolveExpression(
  expression: string,
  nodeOutputs: Record<string, unknown>,
  ctx: ActionContext,
  config: EngineConfig
): string {
  const renderer = config.renderTemplate ?? defaultRenderTemplate;

  // First try resolving dot-notation references like {{nodeId.output.field}}
  let resolved = expression.replace(/\{\{([^}]+)\}\}/g, (match, path: string) => {
    const parts = path.trim().split(".");
    // Try navigating nodeOutputs first
    let current: unknown = nodeOutputs;
    for (const part of parts) {
      if (current == null || typeof current !== "object") {
        current = undefined;
        break;
      }
      current = (current as Record<string, unknown>)[part];
    }
    if (current !== undefined && current !== null) {
      return String(current);
    }
    // Fall back to simple var resolution
    return match;
  });

  // Then resolve remaining simple {{var}} patterns against context vars
  resolved = renderer(resolved, ctx.vars);
  return resolved;
}

/**
 * Execute a switch node: evaluate expression and find the matching case.
 * Returns the matched case handle name (case value) or default.
 */
function executeSwitchNode(
  data: SwitchNodeData,
  nodeOutputs: Record<string, unknown>,
  ctx: ActionContext,
  config: EngineConfig
): { type: "switch"; expressionValue: string; matchedCase: string | null } {
  const { expression, cases, defaultCase } = data.config;

  if (!expression) {
    return { type: "switch", expressionValue: "", matchedCase: defaultCase ?? null };
  }

  const resolvedValue = resolveExpression(expression, nodeOutputs, ctx, config);

  // Find matching case (trim both sides for resilience against whitespace)
  const trimmedResolved = resolvedValue.trim();
  for (const c of cases) {
    if (trimmedResolved === c.value.trim()) {
      return { type: "switch", expressionValue: resolvedValue, matchedCase: `case_${c.value}` };
    }
  }

  // No match found — use default if available
  if (defaultCase) {
    return { type: "switch", expressionValue: resolvedValue, matchedCase: "default" };
  }

  return { type: "switch", expressionValue: resolvedValue, matchedCase: null };
}

// ── Loop Node execution ─────────────────────────────────────────

/**
 * Resolve an array expression from upstream outputs or context vars.
 * Returns the resolved array, or an error if the expression does not resolve to an array.
 */
function resolveArray(
  arrayExpression: string,
  nodeOutputs: Record<string, unknown>,
  ctx: ActionContext
): unknown[] | string {
  // Try evaluating as a dot-notation path first
  const parts = arrayExpression.trim().replace(/^\{\{/, "").replace(/\}\}$/, "").split(".");
  let current: unknown = nodeOutputs;

  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      current = undefined;
      break;
    }
    current = (current as Record<string, unknown>)[part];
  }

  // If not found in nodeOutputs, try context vars
  if (current === undefined || current === null) {
    const varKey = parts[0];
    const varVal = ctx.vars[varKey];
    if (varVal !== undefined) {
      // Try parsing as JSON array
      if (typeof varVal === "string") {
        try {
          const parsed = JSON.parse(varVal);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // Not JSON, treat as error
        }
      }
    }
  }

  if (current === undefined || current === null) {
    return `Array expression "${arrayExpression}" resolved to undefined`;
  }

  if (!Array.isArray(current)) {
    return `Array expression "${arrayExpression}" resolved to non-array value: ${typeof current}`;
  }

  return current;
}

/**
 * Execute a loop node: iterate over an array and execute body branch for each item.
 * Collects iteration results into an array output.
 */
async function executeLoopNode(
  data: LoopNodeData,
  nodeOutputs: Record<string, unknown>,
  ctx: ActionContext,
  config: EngineConfig,
  outEdges: Map<string, FlowEdge[]>,
  nodeMap: Map<string, FlowNode>,
  loopNodeId: string,
  visited: Set<string>,
  nodeTimings: Record<string, NodeTiming>,
  runId: string,
  _startedAt: Date
): Promise<ActionResult> {
  const { arrayExpression, itemVariable = "item", maxIterations = 100 } = data.config;

  if (!arrayExpression || arrayExpression.trim().length === 0) {
    return { success: false, error: "Loop node has no array expression" };
  }

  const arrayResult = resolveArray(arrayExpression, nodeOutputs, ctx);
  if (typeof arrayResult === "string") {
    return { success: false, error: arrayResult };
  }

  const array = arrayResult;

  // Find "body" handle edges
  const allEdges = outEdges.get(loopNodeId) ?? [];
  const bodyTargets = allEdges
    .filter((e) => e.sourceHandle === "body")
    .map((e) => e.target);

  if (bodyTargets.length === 0) {
    // No body branch connected — just return the array as results
    return {
      success: true,
      output: { results: array, iterations: array.length },
    };
  }

  const iterationResults: unknown[] = [];
  const effectiveMax = Math.min(array.length, maxIterations);

  for (let i = 0; i < effectiveMax; i++) {
    const currentItem = array[i];
    // Set iteration variable in context
    ctx.vars[itemVariable] = typeof currentItem === "object"
      ? JSON.stringify(currentItem)
      : String(currentItem ?? "");
    ctx.vars._loopIndex = i;
    ctx.vars._loopLength = array.length;

    emitLog(config.logger, (l) =>
      l.onNodeStart?.(runId, `${loopNodeId}_iter_${i}`, "loop_iteration", { index: i, item: currentItem as Record<string, unknown> })
    );

    // Execute body branch nodes for this iteration (BFS)
    const bodyQueue = [...bodyTargets];
    const bodyVisited = new Set<string>();
    let iterationOutput: unknown = null;
    let iterationFailed = false;
    let iterationError: string | undefined;

    while (bodyQueue.length > 0) {
      const bodyNodeId = bodyQueue.shift()!;
      if (bodyVisited.has(bodyNodeId)) continue;
      bodyVisited.add(bodyNodeId);

      const bodyNode = nodeMap.get(bodyNodeId);
      if (!bodyNode) continue;

      const bodyStartedAt = new Date();
      const bodyData = bodyNode.data;

      if (bodyData.nodeType === "action") {
        const actionData = bodyData as ActionNodeData;
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, bodyNodeId, "action", actionData.config));
        const result = await executeActionWithRetry(
          actionData.actionType, actionData.config, ctx, config, actionData.retryConfig, bodyNodeId
        );
        nodeOutputs[bodyNodeId] = result;
        recordTiming(nodeTimings, bodyNodeId, bodyStartedAt);

        if (!result.success) {
          emitLog(config.logger, (l) => l.onNodeError?.(runId, bodyNodeId, result.error ?? "Unknown error", false, 0));
          iterationFailed = true;
          iterationError = result.error ?? `Action node ${bodyNodeId} failed in loop iteration ${i}`;
          break;
        }
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, bodyNodeId, result.output ?? {}, nodeTimings[bodyNodeId].durationMs)
        );
        iterationOutput = result.output;
      } else if (bodyData.nodeType === "code") {
        const codeData = bodyData as CodeNodeData;
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, bodyNodeId, "code", { language: codeData.config.language }));
        const result = await executeCodeNode(codeData, nodeOutputs, ctx);
        nodeOutputs[bodyNodeId] = result;
        recordTiming(nodeTimings, bodyNodeId, bodyStartedAt);

        if (!result.success) {
          emitLog(config.logger, (l) => l.onNodeError?.(runId, bodyNodeId, result.error ?? "Code execution failed", false, 0));
          iterationFailed = true;
          iterationError = result.error ?? `Code node ${bodyNodeId} failed in loop iteration ${i}`;
          break;
        }
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, bodyNodeId, result.output ?? {}, nodeTimings[bodyNodeId].durationMs)
        );
        iterationOutput = result.output;
      } else if (bodyData.nodeType === "condition") {
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, bodyNodeId, "condition", (bodyData as ConditionNodeData).config as unknown as Record<string, unknown>));
        const condResult = evaluateCondition(bodyData as ConditionNodeData, ctx);
        nodeOutputs[bodyNodeId] = { condition: condResult };
        recordTiming(nodeTimings, bodyNodeId, bodyStartedAt);
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, bodyNodeId, { condition: condResult }, nodeTimings[bodyNodeId].durationMs)
        );
        const nextEdges = outEdges.get(bodyNodeId) ?? [];
        const targetHandle = condResult ? "true" : "false";
        for (const e of nextEdges) {
          if (e.sourceHandle === targetHandle) bodyQueue.push(e.target);
        }
        continue;
      } else {
        emitLog(config.logger, (l) => l.onNodeStart?.(runId, bodyNodeId, bodyData.nodeType, {}));
        nodeOutputs[bodyNodeId] = { type: bodyData.nodeType, passthrough: true };
        recordTiming(nodeTimings, bodyNodeId, bodyStartedAt);
        emitLog(config.logger, (l) =>
          l.onNodeComplete?.(runId, bodyNodeId, nodeOutputs[bodyNodeId] as Record<string, unknown>, nodeTimings[bodyNodeId].durationMs)
        );
      }

      // Enqueue downstream body edges (but NOT loop "complete" edges)
      if (!iterationFailed) {
        const nextEdges = outEdges.get(bodyNodeId) ?? [];
        for (const e of nextEdges) {
          // Don't re-enter the loop node itself or escape to "complete" path
          if (e.target !== loopNodeId) {
            bodyQueue.push(e.target);
          }
        }
      }
    }

    if (iterationFailed) {
      return {
        success: false,
        error: iterationError ?? `Loop iteration ${i} failed`,
        output: { results: iterationResults, failedAtIndex: i },
      };
    }

    iterationResults.push(iterationOutput);

    emitLog(config.logger, (l) =>
      l.onNodeComplete?.(runId, `${loopNodeId}_iter_${i}`, { index: i, output: iterationOutput as Record<string, unknown> }, 0)
    );
  }

  // Clean up loop context vars
  delete ctx.vars[itemVariable];
  delete ctx.vars._loopIndex;
  delete ctx.vars._loopLength;

  return {
    success: true,
    output: {
      results: iterationResults,
      iterations: effectiveMax,
      totalItems: array.length,
      maxIterationsReached: array.length > maxIterations,
    },
  };
}
