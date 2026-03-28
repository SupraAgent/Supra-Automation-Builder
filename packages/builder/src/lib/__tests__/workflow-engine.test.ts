import { describe, it, expect } from "vitest";
import type { Node, Edge } from "@xyflow/react";
import {
  getExecutionOrder,
  validateWorkflow,
  getDownstream,
  getUpstream,
  findTriggerNodes,
  findTerminalNodes,
  createExecution,
} from "../workflow-engine";

// ── Helpers ───────────────────────────────────────────────────

function node(id: string, type = "actionNode", data: Record<string, unknown> = {}): Node {
  return { id, type, position: { x: 0, y: 0 }, data: { label: id, ...data } };
}

function edge(source: string, target: string, sourceHandle?: string): Edge {
  return { id: `${source}-${target}`, source, target, ...(sourceHandle ? { sourceHandle } : {}) };
}

// ── getExecutionOrder ─────────────────────────────────────────

describe("getExecutionOrder", () => {
  it("returns nodes in topological order for a linear chain", () => {
    const nodes = [node("a"), node("b"), node("c")];
    const edges = [edge("a", "b"), edge("b", "c")];

    const order = getExecutionOrder(nodes, edges);
    const ids = order.map((n) => n.id);

    expect(ids).toEqual(["a", "b", "c"]);
  });

  it("handles a diamond merge (A -> B, A -> C, B -> D, C -> D)", () => {
    const nodes = [node("a"), node("b"), node("c"), node("d")];
    const edges = [edge("a", "b"), edge("a", "c"), edge("b", "d"), edge("c", "d")];

    const order = getExecutionOrder(nodes, edges);
    const ids = order.map((n) => n.id);

    // "a" must come first, "d" must come last, "b" and "c" in between
    expect(ids[0]).toBe("a");
    expect(ids[ids.length - 1]).toBe("d");
    expect(ids).toHaveLength(4);
  });

  it("detects a cycle by returning fewer nodes than provided", () => {
    const nodes = [node("a"), node("b"), node("c")];
    const edges = [edge("a", "b"), edge("b", "c"), edge("c", "a")];

    const order = getExecutionOrder(nodes, edges);

    // Kahn's algorithm drops nodes still in the cycle
    expect(order.length).toBeLessThan(nodes.length);
  });

  it("returns disconnected nodes (they have inDegree 0)", () => {
    const nodes = [node("a"), node("b"), node("c")];
    // a -> b, c is disconnected
    const edges = [edge("a", "b")];

    const order = getExecutionOrder(nodes, edges);
    const ids = order.map((n) => n.id);

    expect(ids).toHaveLength(3);
    // "a" comes before "b"
    expect(ids.indexOf("a")).toBeLessThan(ids.indexOf("b"));
    // "c" is included (inDegree 0)
    expect(ids).toContain("c");
  });

  it("returns empty array for empty input", () => {
    expect(getExecutionOrder([], [])).toEqual([]);
  });
});

// ── validateWorkflow ──────────────────────────────────────────

describe("validateWorkflow", () => {
  it("reports error when there are no nodes", () => {
    const result = validateWorkflow([], []);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Workflow has no nodes");
  });

  it("reports error when there is no trigger node", () => {
    const nodes = [node("a", "actionNode"), node("b", "outputNode")];
    const edges = [edge("a", "b")];

    const result = validateWorkflow(nodes, edges);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Trigger"))).toBe(true);
  });

  it("reports cycle error", () => {
    const nodes = [
      node("t", "triggerNode"),
      node("a", "actionNode"),
      node("b", "actionNode"),
    ];
    const edges = [edge("t", "a"), edge("a", "b"), edge("b", "a")];

    const result = validateWorkflow(nodes, edges);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("cycle"))).toBe(true);
  });

  it("reports disconnected nodes", () => {
    const nodes = [
      node("t", "triggerNode"),
      node("a", "actionNode"),
      node("lonely", "actionNode"),
    ];
    const edges = [edge("t", "a")];

    const result = validateWorkflow(nodes, edges);

    expect(result.errors.some((e) => e.includes("not connected"))).toBe(true);
  });

  it("does not report noteNode as disconnected", () => {
    const nodes = [
      node("t", "triggerNode"),
      node("a", "actionNode"),
      node("n", "noteNode"),
    ];
    const edges = [edge("t", "a")];

    const result = validateWorkflow(nodes, edges);

    expect(result.errors.some((e) => e.includes("not connected"))).toBe(false);
  });

  it("reports LLM node without provider", () => {
    const nodes = [
      node("t", "triggerNode"),
      node("llm", "llmNode", { label: "My LLM" }),
    ];
    const edges = [edge("t", "llm")];

    const result = validateWorkflow(nodes, edges);

    expect(result.errors.some((e) => e.includes("provider"))).toBe(true);
  });

  it("returns valid for a correct workflow", () => {
    const nodes = [
      node("t", "triggerNode"),
      node("a", "actionNode"),
      node("o", "outputNode"),
    ];
    const edges = [edge("t", "a"), edge("a", "o")];

    const result = validateWorkflow(nodes, edges);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ── Helper functions ──────────────────────────────────────────

describe("getDownstream", () => {
  it("returns target nodes for a given source", () => {
    const edges = [edge("a", "b"), edge("a", "c"), edge("b", "c")];
    expect(getDownstream("a", edges)).toEqual(["b", "c"]);
    expect(getDownstream("b", edges)).toEqual(["c"]);
    expect(getDownstream("c", edges)).toEqual([]);
  });
});

describe("getUpstream", () => {
  it("returns source nodes for a given target", () => {
    const edges = [edge("a", "c"), edge("b", "c")];
    expect(getUpstream("c", edges)).toEqual(["a", "b"]);
    expect(getUpstream("a", edges)).toEqual([]);
  });
});

describe("findTriggerNodes", () => {
  it("filters only triggerNode type", () => {
    const nodes = [node("t", "triggerNode"), node("a", "actionNode")];
    const triggers = findTriggerNodes(nodes);
    expect(triggers).toHaveLength(1);
    expect(triggers[0].id).toBe("t");
  });
});

describe("findTerminalNodes", () => {
  it("returns nodes with no outgoing edges", () => {
    const nodes = [node("a"), node("b"), node("c")];
    const edges = [edge("a", "b")];
    const terminals = findTerminalNodes(nodes, edges);
    const ids = terminals.map((n) => n.id);
    expect(ids).toContain("b");
    expect(ids).toContain("c");
    expect(ids).not.toContain("a");
  });
});

// ── createExecution ───────────────────────────────────────────

describe("createExecution", () => {
  it("creates pending steps in topological order, skipping noteNodes", () => {
    const nodes = [
      node("t", "triggerNode"),
      node("a", "actionNode"),
      node("n", "noteNode"),
    ];
    const edges = [edge("t", "a")];

    const exec = createExecution(nodes, edges);

    expect(exec.status).toBe("idle");
    expect(exec.steps).toHaveLength(2); // noteNode excluded
    expect(exec.steps[0].nodeId).toBe("t");
    expect(exec.steps[1].nodeId).toBe("a");
    expect(exec.steps.every((s) => s.status === "pending")).toBe(true);
  });
});
