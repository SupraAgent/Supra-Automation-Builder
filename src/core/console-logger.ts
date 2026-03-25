/**
 * Ready-to-use ConsoleLogger that implements ExecutionLogger.
 * Outputs structured, timestamped log lines with emoji status indicators.
 * Automatically redacts values whose keys contain secret-like patterns.
 */
import type { ExecutionLogger } from "./types";

/** Keys matching these patterns will have their values redacted in log output. */
const SECRET_KEY_PATTERN = /token|key|secret|password/i;

/**
 * Deep-redact values in a record where the key looks like a secret.
 * Returns a new object — never mutates the input.
 */
function redactSecrets(input: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (SECRET_KEY_PATTERN.test(key)) {
      result[key] = "[REDACTED]";
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item !== null && typeof item === "object" && !Array.isArray(item)
          ? redactSecrets(item as Record<string, unknown>)
          : item
      );
    } else if (value !== null && typeof value === "object") {
      result[key] = redactSecrets(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function ts(): string {
  return new Date().toISOString();
}

function prefix(runId: string): string {
  return `[${ts()}] [run:${runId}]`;
}

export const ConsoleLogger: ExecutionLogger = {
  onWorkflowStart(runId: string, workflowId: string): void {
    console.log(`${prefix(runId)} \u{1F680} Workflow started  workflowId=${workflowId}`);
  },

  onWorkflowComplete(runId: string, status: string, durationMs: number): void {
    const icon = status === "completed" ? "\u2705" : status === "paused" ? "\u23F8\uFE0F" : "\u274C";
    console.log(`${prefix(runId)} ${icon} Workflow ${status}  duration=${durationMs}ms`);
  },

  onNodeStart(runId: string, nodeId: string, nodeType: string, input: Record<string, unknown>): void {
    const safeInput = redactSecrets(input);
    console.log(
      `${prefix(runId)} \u25B6\uFE0F  Node started  nodeId=${nodeId} type=${nodeType} input=${JSON.stringify(safeInput)}`
    );
  },

  onNodeComplete(runId: string, nodeId: string, output: Record<string, unknown>, durationMs: number): void {
    const safeOutput = redactSecrets(output);
    console.log(
      `${prefix(runId)} \u2714\uFE0F  Node completed  nodeId=${nodeId} duration=${durationMs}ms output=${JSON.stringify(safeOutput)}`
    );
  },

  onNodeError(runId: string, nodeId: string, error: string, willRetry: boolean, attempt: number): void {
    console.error(
      `${prefix(runId)} \u{1F4A5} Node error  nodeId=${nodeId} attempt=${attempt} willRetry=${willRetry} error="${error}"`
    );
  },

  onNodeSkipped(runId: string, nodeId: string, reason: string): void {
    console.log(
      `${prefix(runId)} \u23ED\uFE0F  Node skipped  nodeId=${nodeId} reason="${reason}"`
    );
  },

  onRetry(runId: string, nodeId: string, attempt: number, delayMs: number): void {
    console.log(
      `${prefix(runId)} \u{1F504} Retrying  nodeId=${nodeId} attempt=${attempt} delayMs=${Math.round(delayMs)}`
    );
  },
};
