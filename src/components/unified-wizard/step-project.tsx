"use client";

import { Textarea } from "@/components/ui/textarea";
import { DynamicList } from "@/components/ui/dynamic-list";
import type { UnifiedDraft } from "@/lib/unified-builder";

type Props = {
  draft: UnifiedDraft;
  onChange: (patch: Partial<UnifiedDraft>) => void;
};

export function StepProject({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Project Perspective
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How would this persona approach your project?
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            How They&apos;d Approach This Build
          </label>
          <Textarea
            value={draft.approach}
            onChange={(e) => onChange({ approach: e.target.value })}
            placeholder="What would they prioritize first? How would they structure the work?"
            className="min-h-[80px]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Key Questions They&apos;d Ask
          </label>
          <DynamicList
            value={draft.keyQuestions.length > 0 ? draft.keyQuestions : [""]}
            onChange={(keyQuestions) =>
              onChange({ keyQuestions: keyQuestions.filter(Boolean) })
            }
            placeholder="e.g. What's the target audience's current behavior?"
            addLabel="Add question"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Red Flags to Watch For
          </label>
          <DynamicList
            value={draft.redFlags.length > 0 ? draft.redFlags : [""]}
            onChange={(redFlags) =>
              onChange({ redFlags: redFlags.filter(Boolean) })
            }
            placeholder="e.g. Building without user research"
            addLabel="Add red flag"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Success Metrics
          </label>
          <DynamicList
            value={
              draft.successMetrics.length > 0 ? draft.successMetrics : [""]
            }
            onChange={(successMetrics) =>
              onChange({ successMetrics: successMetrics.filter(Boolean) })
            }
            placeholder="e.g. Week 1 retention > 60%"
            addLabel="Add metric"
          />
        </div>
      </div>
    </div>
  );
}
