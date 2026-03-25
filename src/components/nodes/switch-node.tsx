"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { SwitchNodeData } from "../../core/types";
import { cn } from "../../core/utils";

export function SwitchNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as SwitchNodeData;
  const cfg = nodeData.config;
  const expressionPreview = cfg.expression
    ? cfg.expression.length > 40
      ? cfg.expression.slice(0, 40) + "\u2026"
      : cfg.expression
    : "No expression";

  const cases = cfg.cases ?? [];
  const hasDefault = !!cfg.defaultCase;
  const totalHandles = cases.length + (hasDefault ? 1 : 0);

  return (
    <div
      className={cn(
        "rounded-xl border bg-white/[0.035] px-4 py-3 min-w-[180px] max-w-[280px] transition-all",
        selected ? "border-cyan-400/60 shadow-lg shadow-cyan-500/10" : "border-cyan-500/20"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-cyan-900"
      />

      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
          <svg className="h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M16 12H8" /><path d="M12 8v8" /><path d="m8 8 8 8" /><path d="M16 8 8 16" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {nodeData.label || "Switch"}
          </p>
          <p className="text-[10px] text-cyan-400/70">Multi-way branch</p>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground truncate">{expressionPreview}</p>

      {totalHandles > 0 && (
        <div className="flex justify-between mt-2 text-[9px] text-muted-foreground px-1 gap-1 flex-wrap">
          {cases.map((c) => (
            <span key={c.value} className="text-cyan-400 truncate max-w-[60px]">{c.label || c.value}</span>
          ))}
          {hasDefault && (
            <span className="text-gray-400">Default</span>
          )}
        </div>
      )}

      {cases.map((c, i) => {
        const handleCount = totalHandles;
        const position = handleCount <= 1 ? 50 : (((i + 1) / (handleCount + 1)) * 100);
        return (
          <Handle
            key={`case_${c.value}`}
            type="source"
            position={Position.Bottom}
            id={`case_${c.value}`}
            className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-cyan-900"
            style={{ left: `${position}%` }}
          />
        );
      })}
      {hasDefault && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-gray-900"
          style={{ left: `${totalHandles <= 1 ? 50 : ((totalHandles) / (totalHandles + 1)) * 100}%` }}
        />
      )}
    </div>
  );
}
