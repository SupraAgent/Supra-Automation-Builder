"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Persona } from "@/lib/personas";

export function PersonaSelector({
  agentId,
  currentPersonaId,
  personas,
  onUpdate,
}: {
  agentId: string;
  currentPersonaId: string | null;
  personas: Persona[];
  onUpdate: () => void;
}) {
  const [saving, setSaving] = React.useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const personaId = e.target.value || null;
    setSaving(true);
    try {
      if (personaId) {
        const res = await fetch(`/api/agents/${agentId}/persona`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personaId }),
        });
        if (!res.ok) throw new Error();
        toast.success("Persona assigned");
      } else {
        const res = await fetch(`/api/agents/${agentId}/persona`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        toast.success("Persona removed");
      }
      onUpdate();
    } catch {
      toast.error("Failed to update persona");
    } finally {
      setSaving(false);
    }
  };

  const current = personas.find((p) => p.id === currentPersonaId);

  return (
    <div className="flex items-center gap-2">
      {current && (
        <span className="text-sm">{current.icon ?? "🤖"}</span>
      )}
      <select
        value={currentPersonaId ?? ""}
        onChange={handleChange}
        disabled={saving}
        className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none disabled:opacity-50"
      >
        <option value="">No persona</option>
        {personas.map((p) => (
          <option key={p.id} value={p.id}>
            {p.icon ?? "🤖"} {p.name}{p.isBuiltIn ? " (built-in)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
