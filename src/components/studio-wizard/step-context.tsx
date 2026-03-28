"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { StudioDraft } from "@/lib/studio";

type Props = {
  draft: StudioDraft;
  onChange: (patch: Partial<StudioDraft>) => void;
};

export function StepContext({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Project Context</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Just enough context to generate useful advisor prompts. Keep it short.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Project Name
          </label>
          <Input
            value={draft.projectName}
            onChange={(e) => onChange({ projectName: e.target.value })}
            placeholder="e.g. SupraVibe"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            What does it do?
          </label>
          <Textarea
            value={draft.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="One sentence. e.g. A marketplace for AI-generated art."
            rows={2}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Who is it for?
          </label>
          <Input
            value={draft.targetUser}
            onChange={(e) => onChange({ targetUser: e.target.value })}
            placeholder="e.g. Indie game developers who need concept art fast"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            What problem does it solve?
          </label>
          <Textarea
            value={draft.problem}
            onChange={(e) => onChange({ problem: e.target.value })}
            placeholder="e.g. Concept art takes weeks and costs thousands — most indie devs can't afford it."
            rows={2}
          />
        </div>

        {/* Advanced Mode toggle */}
        <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              role="switch"
              aria-checked={draft.advancedMode}
              onClick={() => onChange({ advancedMode: !draft.advancedMode })}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
                draft.advancedMode
                  ? "bg-primary border-primary/60"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  draft.advancedMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <div>
              <span className="text-sm font-medium text-foreground">
                Advanced Mode
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Build deep expert personas with agent capabilities
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
