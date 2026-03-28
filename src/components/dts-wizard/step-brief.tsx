"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PROJECT_TYPES,
  ATMOSPHERES,
  type DesignToShipDraft,
} from "@/lib/design-to-ship";

type Props = {
  draft: DesignToShipDraft;
  onChange: (patch: Partial<DesignToShipDraft>) => void;
};

export function StepBrief({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Project Brief</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define what you&#39;re building and the visual direction.
        </p>
      </div>

      {/* Project Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Project Name</label>
        <Input
          value={draft.projectName}
          onChange={(e) => onChange({ projectName: e.target.value })}
          placeholder="My App"
        />
      </div>

      {/* Project Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Project Type</label>
        <div className="grid grid-cols-3 gap-2">
          {PROJECT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange({ projectType: t.id })}
              className={`rounded-xl border p-3 text-left transition ${
                draft.projectType === t.id
                  ? "border-primary/60 bg-primary/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div className="text-sm font-medium text-foreground">{t.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{t.description}</div>
            </button>
          ))}
        </div>
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

      {/* Target User */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Target User</label>
        <Input
          value={draft.targetUser}
          onChange={(e) => onChange({ targetUser: e.target.value })}
          placeholder="Who is this for?"
        />
      </div>

      {/* Design Atmosphere */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Design Atmosphere</label>
        <div className="grid grid-cols-3 gap-2">
          {ATMOSPHERES.map((a) => (
            <button
              key={a.id}
              onClick={() => onChange({ atmosphere: a.id })}
              className={`rounded-xl border p-3 text-left transition ${
                draft.atmosphere === a.id
                  ? "border-primary/60 bg-primary/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              {/* Color swatch */}
              <div className="mb-2 flex gap-1">
                {a.colors.slice(0, 4).map((c) => (
                  <div
                    key={c.hex}
                    className="h-4 w-4 rounded-full border border-white/10"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <div className="text-sm font-medium text-foreground">{a.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{a.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Reference URL */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Reference URL <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          value={draft.referenceUrl}
          onChange={(e) => onChange({ referenceUrl: e.target.value })}
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
}
