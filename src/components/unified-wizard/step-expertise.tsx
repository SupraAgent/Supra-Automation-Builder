"use client";

import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import type { UnifiedDraft } from "@/lib/unified-builder";

type Props = {
  draft: UnifiedDraft;
  onChange: (patch: Partial<UnifiedDraft>) => void;
};

export function StepExpertise({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Expertise & Skills
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          What does this persona know deeply? What tools and methods define their
          approach?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Primary Domain
          </label>
          <Input
            value={draft.primaryDomain}
            onChange={(e) => onChange({ primaryDomain: e.target.value })}
            placeholder="e.g. Gamification & behavioral design for learning"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Secondary Skills
          </label>
          <TagInput
            value={draft.secondarySkills}
            onChange={(secondarySkills) => onChange({ secondarySkills })}
            placeholder="Type a skill and press Enter"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Signature Methodology
          </label>
          <Input
            value={draft.signatureMethodology}
            onChange={(e) =>
              onChange({ signatureMethodology: e.target.value })
            }
            placeholder="e.g. Data-driven experimentation with rapid A/B testing"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Tools & Frameworks
          </label>
          <TagInput
            value={draft.toolsAndFrameworks}
            onChange={(toolsAndFrameworks) => onChange({ toolsAndFrameworks })}
            placeholder="Type a tool/framework and press Enter"
          />
        </div>
      </div>
    </div>
  );
}
