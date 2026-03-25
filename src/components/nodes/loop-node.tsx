"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LoopNodeData } from "../../core/types";
import { cn } from "../../core/utils";

export function LoopNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as LoopNodeData;
  const cfg = nodeData.config;
  const arrayPreview = cfg.arrayExpression
    ? cfg.arrayExpression.length > 40
      ? cfg.arrayExpression.slice(0, 40) + "\u2026"
      : cfg.arrayExpression
    : "No array expression";
  const itemVar = cfg.itemVariable || "item";

  return (
    <div
      className={cn(
        "rounded-xl border bg-white/[0.035] px-4 py-3 min-w-[180px] max-w-[240px] transition-all",
        selected ? "border-indigo-400/60 shadow-lg shadow-indigo-500/10" : "border-indigo-500/20"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-indigo-900"
      />

      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
          <svg className="h-4 w-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {nodeData.label || "Loop"}
          </p>
          <p className="text-[10px] text-indigo-400/70">For each {itemVar}</p>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground truncate">{arrayPreview}</p>

      <div className="flex justify-between mt-2 text-[9px] text-muted-foreground px-1">
        <span className="text-indigo-400">Body</span>
        <span className="text-emerald-400">Complete</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="body"
        className="!w-3 !h-3 !bg-indigo-400 !border-2 !border-indigo-900"
        style={{ left: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="complete"
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-emerald-900"
        style={{ left: "70%" }}
      />
    </div>
  );
}
