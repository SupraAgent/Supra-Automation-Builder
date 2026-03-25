"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { TryCatchNodeData } from "../../core/types";
import { cn } from "../../core/utils";

export function TryCatchNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as TryCatchNodeData;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white/[0.035] px-4 py-3 min-w-[180px] max-w-[240px] transition-all",
        selected ? "border-orange-400/60 shadow-lg shadow-orange-500/10" : "border-orange-500/20"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-orange-400 !border-2 !border-orange-900"
      />

      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
          <svg className="h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M3.586 3.586A2 2 0 0 1 5 3h14a2 2 0 0 1 1.414.586l.001.001A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 .586-1.414z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {nodeData.label || "Try / Catch"}
          </p>
          <p className="text-[10px] text-orange-400/70">Error handler</p>
        </div>
      </div>

      <div className="flex justify-between mt-2 text-[9px] text-muted-foreground px-1">
        <span className="text-emerald-400">Success</span>
        <span className="text-red-400">Error</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-emerald-900"
        style={{ left: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="error"
        className="!w-3 !h-3 !bg-red-400 !border-2 !border-red-900"
        style={{ left: "70%" }}
      />
    </div>
  );
}
