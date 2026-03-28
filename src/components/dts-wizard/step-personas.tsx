"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import {
  SUGGESTED_DESIGN_ROLES,
  type DesignToShipDraft,
  type DesignPersona,
} from "@/lib/design-to-ship";

type Props = {
  draft: DesignToShipDraft;
  onChange: (patch: Partial<DesignToShipDraft>) => void;
};

const EMPTY_PERSONA: DesignPersona = { role: "", company: "", focus: "" };

const ROLE_SUGGESTIONS = SUGGESTED_DESIGN_ROLES.map((r) => r.role);
const COMPANY_SUGGESTIONS = [
  "Apple",
  "Stripe",
  "Linear",
  "Vercel",
  "Figma",
  "Airbnb",
  "Notion",
  "Arc",
  "Spotify",
  "Google",
];

export function StepPersonas({ draft, onChange }: Props) {
  function updatePersona(index: number, patch: Partial<DesignPersona>) {
    const next = [...draft.personas];
    next[index] = { ...next[index], ...patch };
    onChange({ personas: next });
  }

  function addPersona() {
    onChange({ personas: [...draft.personas, { ...EMPTY_PERSONA }] });
  }

  function removePersona(index: number) {
    onChange({ personas: draft.personas.filter((_, i) => i !== index) });
  }

  function addSuggested(suggestion: (typeof SUGGESTED_DESIGN_ROLES)[0]) {
    const exists = draft.personas.some(
      (p) => p.role === suggestion.role && p.company === suggestion.company
    );
    if (!exists) {
      onChange({ personas: [...draft.personas, { ...suggestion }] });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Design Personas</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Assemble a design team to guide visual decisions.
        </p>
      </div>

      {/* Suggestions */}
      {draft.personas.length < 3 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Suggested roles:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_DESIGN_ROLES.map((s) => (
              <button
                key={`${s.role}-${s.company}`}
                onClick={() => addSuggested(s)}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-white/20 transition"
              >
                {s.role} ({s.company})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Persona List */}
      <div className="space-y-3">
        {draft.personas.map((persona, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Persona {i + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePersona(i)}
                className="text-red-400 hover:text-red-300 h-6 px-2 text-xs"
              >
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Role</label>
                <Combobox
                  value={persona.role}
                  onChange={(v) => updatePersona(i, { role: v })}
                  suggestions={ROLE_SUGGESTIONS}
                  placeholder="Design Lead..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Company</label>
                <Combobox
                  value={persona.company}
                  onChange={(v) => updatePersona(i, { company: v })}
                  suggestions={COMPANY_SUGGESTIONS}
                  placeholder="Apple..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Focus</label>
                <Input
                  value={persona.focus}
                  onChange={(e) => updatePersona(i, { focus: e.target.value })}
                  placeholder="Visual direction..."
                  className="h-10"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="ghost" onClick={addPersona}>
        + Add persona
      </Button>

      <p className="text-xs text-muted-foreground">
        {draft.personas.length} persona{draft.personas.length !== 1 ? "s" : ""} on team
      </p>
    </div>
  );
}
