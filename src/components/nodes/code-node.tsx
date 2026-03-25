"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { CodeNodeData } from "../../core/types";
import { cn } from "../../core/utils";

export function CodeNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as CodeNodeData;
  const cfg = nodeData.config;
  const languageLabel = cfg.language === "typescript" ? "TS" : "JS";
  const codePreview = cfg.code
    ? cfg.code.length > 50
      ? cfg.code.slice(0, 50).replace(/\n/g, " ") + "\u2026"
      : cfg.code.replace(/\n/g, " ")
    : "No code configured";

  return (
    <div
      className={cn(
        "rounded-xl border bg-white/[0.035] px-4 py-3 min-w-[180px] max-w-[240px] transition-all",
        selected ? "border-violet-400/60 shadow-lg shadow-violet-500/10" : "border-violet-500/20"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-violet-400 !border-2 !border-violet-900"
      />

      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
          <svg className="h-4 w-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {nodeData.label || "Code"}
          </p>
          <p className="text-[10px] text-violet-400/70">Run code</p>
        </div>
        <span className="ml-auto shrink-0 rounded bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-violet-300">
          {languageLabel}
        </span>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground truncate font-mono">{codePreview}</p>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-violet-400 !border-2 !border-violet-900"
      />
    </div>
  );
}
