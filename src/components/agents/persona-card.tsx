"use client";

import { cn } from "@/lib/utils";
import type { Persona } from "@/lib/personas";

export function PersonaCard({
  persona,
  onEdit,
  onCopy,
  onDelete,
}: {
  persona: Persona;
  onEdit?: (persona: Persona) => void;
  onCopy?: (persona: Persona) => void;
  onDelete?: (persona: Persona) => void;
}) {
  const capCount = persona.capabilities.length;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/15">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl flex-shrink-0">{persona.icon ?? "🤖"}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate">{persona.name}</span>
              {persona.isBuiltIn && (
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary flex-shrink-0">
                  Built-in
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{persona.role}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {capCount > 0 && (
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {capCount} {capCount === 1 ? "capability" : "capabilities"}
          </span>
        )}
        {persona.reviewFocus.map((rf) => (
          <span key={rf} className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {rf}
          </span>
        ))}
        {persona.outputFormat && (
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {persona.outputFormat.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {/* Prompt preview */}
      <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{persona.systemPrompt}</p>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        {persona.isBuiltIn ? (
          <button
            type="button"
            onClick={() => onCopy?.(persona)}
            className="text-xs text-primary hover:underline"
          >
            Copy &amp; customize
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit?.(persona)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(persona)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
