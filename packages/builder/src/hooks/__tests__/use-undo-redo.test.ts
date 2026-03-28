import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Node, Edge } from "@xyflow/react";
import { useUndoRedo } from "../use-undo-redo";

// ── Helpers ───────────────────────────────────────────────────

function node(id: string): Node {
  return { id, type: "actionNode", position: { x: 0, y: 0 }, data: { label: id } };
}

/** Rerender + flush the 300ms debounce timer so the snapshot is captured */
function changeAndFlush(
  rerender: () => void,
) {
  rerender();
  act(() => {
    vi.advanceTimersByTime(350);
  });
}

describe("useUndoRedo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with canUndo=false and canRedo=false", () => {
    const nodes = [node("a")];
    const edges: Edge[] = [];

    const { result } = renderHook(() =>
      useUndoRedo(nodes, edges, () => {}, () => {})
    );

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("tracks changes and enables undo after state changes", () => {
    let nodes = [node("a")];
    let edges: Edge[] = [];
    const setNodes = vi.fn((n: Node[]) => { nodes = n; });
    const setEdges = vi.fn((e: Edge[]) => { edges = e; });

    const { result, rerender } = renderHook(() =>
      useUndoRedo(nodes, edges, setNodes, setEdges)
    );

    // Flush initial snapshot
    act(() => { vi.advanceTimersByTime(350); });

    // Initial render — no undo
    expect(result.current.canUndo).toBe(false);

    // Simulate a change: add a node
    nodes = [node("a"), node("b")];
    changeAndFlush(rerender);

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("undo restores previous state and enables redo", () => {
    let nodes = [node("a")];
    let edges: Edge[] = [];
    const setNodes = vi.fn((n: Node[]) => { nodes = n; });
    const setEdges = vi.fn((e: Edge[]) => { edges = e; });

    const { result, rerender } = renderHook(() =>
      useUndoRedo(nodes, edges, setNodes, setEdges)
    );

    // Flush initial snapshot
    act(() => { vi.advanceTimersByTime(350); });

    // Change 1
    nodes = [node("a"), node("b")];
    changeAndFlush(rerender);

    // Undo
    act(() => {
      result.current.undo();
    });

    // setNodes should have been called with the previous state
    expect(setNodes).toHaveBeenCalled();
    const restoredNodes = setNodes.mock.calls[setNodes.mock.calls.length - 1][0];
    expect(restoredNodes).toHaveLength(1);
    expect(restoredNodes[0].id).toBe("a");
  });

  it("redo restores the undone state", () => {
    let nodes = [node("a")];
    let edges: Edge[] = [];
    const setNodes = vi.fn((n: Node[]) => { nodes = n; });
    const setEdges = vi.fn((e: Edge[]) => { edges = e; });

    const { result, rerender } = renderHook(() =>
      useUndoRedo(nodes, edges, setNodes, setEdges)
    );

    // Flush initial snapshot
    act(() => { vi.advanceTimersByTime(350); });

    // Change: add node b
    nodes = [node("a"), node("b")];
    changeAndFlush(rerender);

    // Undo
    act(() => {
      result.current.undo();
    });

    // Rerender with undone state
    nodes = [node("a")];
    rerender();
    act(() => { vi.advanceTimersByTime(350); });

    // Redo
    act(() => {
      result.current.redo();
    });

    // setNodes should restore the [a, b] state
    const lastCall = setNodes.mock.calls[setNodes.mock.calls.length - 1][0];
    expect(lastCall).toHaveLength(2);
  });

  it("respects MAX_HISTORY boundary (50 entries)", () => {
    let nodes = [node("init")];
    let edges: Edge[] = [];
    const setNodes = vi.fn((n: Node[]) => { nodes = n; });
    const setEdges = vi.fn((e: Edge[]) => { edges = e; });

    const { result, rerender } = renderHook(() =>
      useUndoRedo(nodes, edges, setNodes, setEdges)
    );

    // Flush initial snapshot
    act(() => { vi.advanceTimersByTime(350); });

    // Push 60 changes (exceeding MAX_HISTORY of 50)
    for (let i = 0; i < 60; i++) {
      nodes = [node(`step-${i}`)];
      changeAndFlush(rerender);
    }

    // canUndo should be true
    expect(result.current.canUndo).toBe(true);

    // Undo as many times as possible
    let undoCount = 0;
    for (let i = 0; i < 60; i++) {
      if (!result.current.canUndo) break;
      act(() => {
        result.current.undo();
      });
      // Simulate the state change from undo
      const lastSetNodes = setNodes.mock.calls[setNodes.mock.calls.length - 1][0];
      nodes = lastSetNodes;
      rerender();
      act(() => { vi.advanceTimersByTime(350); });
      undoCount++;
    }

    // Should have been able to undo at most 50 times (MAX_HISTORY)
    expect(undoCount).toBeLessThanOrEqual(50);
  });

  it("undo with no history is a no-op", () => {
    const nodes = [node("a")];
    const edges: Edge[] = [];
    const setNodes = vi.fn();
    const setEdges = vi.fn();

    const { result } = renderHook(() =>
      useUndoRedo(nodes, edges, setNodes, setEdges)
    );

    act(() => {
      result.current.undo();
    });

    // setNodes should not have been called
    expect(setNodes).not.toHaveBeenCalled();
  });

  it("redo with no future is a no-op", () => {
    const nodes = [node("a")];
    const edges: Edge[] = [];
    const setNodes = vi.fn();
    const setEdges = vi.fn();

    const { result } = renderHook(() =>
      useUndoRedo(nodes, edges, setNodes, setEdges)
    );

    act(() => {
      result.current.redo();
    });

    expect(setNodes).not.toHaveBeenCalled();
  });

  it("new change after undo clears redo stack", () => {
    let nodes = [node("a")];
    let edges: Edge[] = [];
    const setNodes = vi.fn((n: Node[]) => { nodes = n; });
    const setEdges = vi.fn((e: Edge[]) => { edges = e; });

    const { result, rerender } = renderHook(() =>
      useUndoRedo(nodes, edges, setNodes, setEdges)
    );

    // Flush initial
    act(() => { vi.advanceTimersByTime(350); });

    // State 1
    nodes = [node("a"), node("b")];
    changeAndFlush(rerender);

    // State 2
    nodes = [node("a"), node("b"), node("c")];
    changeAndFlush(rerender);

    // Undo once
    act(() => {
      result.current.undo();
    });
    nodes = setNodes.mock.calls[setNodes.mock.calls.length - 1][0];
    rerender();
    act(() => { vi.advanceTimersByTime(350); });

    // Now make a new change (diverging from the redo path)
    nodes = [node("a"), node("d")];
    changeAndFlush(rerender);

    // Redo should no longer be possible
    expect(result.current.canRedo).toBe(false);
  });
});
