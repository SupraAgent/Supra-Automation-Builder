"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DynamicList } from "@/components/ui/dynamic-list";
import { COMMUNICATION_STYLES, type CommunicationStyle } from "@/lib/agent-personas";
import type { UnifiedDraft } from "@/lib/unified-builder";

type Props = {
  draft: UnifiedDraft;
  onChange: (patch: Partial<UnifiedDraft>) => void;
};

export function StepMindset({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Strategic Mindset
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          What principles guide this persona? How do they think and communicate?
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Core Beliefs
          </label>
          <DynamicList
            value={
              draft.coreBeliefs.length > 0 ? draft.coreBeliefs : [""]
            }
            onChange={(coreBeliefs) =>
              onChange({ coreBeliefs: coreBeliefs.filter(Boolean) })
            }
            placeholder="e.g. Ship fast, measure everything, iterate based on data"
            addLabel="Add belief"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            What They Optimize For
          </label>
          <Input
            value={draft.optimizeFor}
            onChange={(e) => onChange({ optimizeFor: e.target.value })}
            placeholder="e.g. 30-day retention rate"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            What They Push Back On
          </label>
          <DynamicList
            value={draft.pushBackOn.length > 0 ? draft.pushBackOn : [""]}
            onChange={(pushBackOn) =>
              onChange({ pushBackOn: pushBackOn.filter(Boolean) })
            }
            placeholder="e.g. Building features without data to support the decision"
            addLabel="Add item"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Decision-Making Style
          </label>
          <Textarea
            value={draft.decisionMakingStyle}
            onChange={(e) =>
              onChange({ decisionMakingStyle: e.target.value })
            }
            placeholder="How do they evaluate trade-offs?"
            className="min-h-[80px]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Communication Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {COMMUNICATION_STYLES.map((style) => {
              const selected = draft.communicationStyle?.id === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      communicationStyle: selected
                        ? null
                        : (style as CommunicationStyle),
                    })
                  }
                  className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                    selected
                      ? "border-primary/60 bg-primary/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="text-sm font-medium text-foreground">
                    {style.label}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {style.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
