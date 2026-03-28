"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { UnifiedDraft } from "@/lib/unified-builder";

type Props = {
  draft: UnifiedDraft;
  onChange: (patch: Partial<UnifiedDraft>) => void;
};

const ICON_OPTIONS = [
  "\uD83D\uDC54",
  "\uD83C\uDFA8",
  "\uD83D\uDD27",
  "\uD83E\uDDEA",
  "\uD83D\uDE80",
  "\uD83D\uDD12",
  "\uD83D\uDCCB",
  "\uD83D\uDCC8",
  "\uD83D\uDD04",
  "\uD83D\uDCCA",
  "\uD83E\uDD16",
  "\uD83D\uDCA1",
];

export function StepIdentity({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Identity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define who this persona is. Model them after a specific expert at a
          real company.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Persona Name
          </label>
          <Input
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Sarah Chen"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Title
            </label>
            <Input
              value={draft.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="e.g. VP of Design"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Company
            </label>
            <Input
              value={draft.company}
              onChange={(e) => onChange({ company: e.target.value })}
              placeholder="e.g. Duolingo"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Years of Experience
          </label>
          <Input
            type="number"
            value={draft.yearsExperience ?? ""}
            onChange={(e) =>
              onChange({
                yearsExperience: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="e.g. 12"
            className="max-w-[120px]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Background Summary
          </label>
          <Textarea
            value={draft.backgroundSummary}
            onChange={(e) => onChange({ backgroundSummary: e.target.value })}
            placeholder="2-3 sentences about their career arc and what makes them the right model for this role..."
            className="min-h-[80px]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => onChange({ icon })}
                className={`h-10 w-10 rounded-lg border text-lg transition cursor-pointer ${
                  draft.icon === icon
                    ? "border-primary/60 bg-primary/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
