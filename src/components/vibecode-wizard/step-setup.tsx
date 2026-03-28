"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FRAMEWORKS, CODING_VIBES, type VibeCodeDraft } from "@/lib/vibecode";

type Props = {
  draft: VibeCodeDraft;
  onChange: (patch: Partial<VibeCodeDraft>) => void;
};

export function StepSetup({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Project Setup</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Name your project, pick a framework, and choose your coding vibe.
        </p>
      </div>

      {/* Project Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Project Name</label>
        <Input
          value={draft.projectName}
          onChange={(e) => onChange({ projectName: e.target.value })}
          placeholder="My Awesome App"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Description</label>
        <Textarea
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="What does this project do?"
          rows={2}
        />
      </div>

      {/* Framework Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Framework</label>
        <div className="grid grid-cols-3 gap-2">
          {FRAMEWORKS.map((fw) => (
            <button
              key={fw.id}
              onClick={() => onChange({ framework: fw.id })}
              className={`rounded-xl border p-3 text-left transition ${
                draft.framework === fw.id
                  ? "border-primary/60 bg-primary/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div className="text-sm font-medium text-foreground">{fw.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{fw.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Vibe Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Coding Vibe</label>
        <div className="grid grid-cols-2 gap-2">
          {CODING_VIBES.map((v) => (
            <button
              key={v.id}
              onClick={() => onChange({ codingVibe: v.id })}
              className={`rounded-xl border p-3 text-left transition ${
                draft.codingVibe === v.id
                  ? "border-primary/60 bg-primary/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div className="text-sm font-medium text-foreground">{v.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{v.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
