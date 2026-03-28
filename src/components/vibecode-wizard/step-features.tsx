"use client";

import { DynamicList } from "@/components/ui/dynamic-list";
import type { VibeCodeDraft } from "@/lib/vibecode";

type Props = {
  draft: VibeCodeDraft;
  onChange: (patch: Partial<VibeCodeDraft>) => void;
};

export function StepFeatures({ draft, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Key Features</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          List the features your project needs. These will be included in your scaffold spec.
        </p>
      </div>

      <DynamicList
        value={draft.features}
        onChange={(features) => onChange({ features })}
        placeholder="e.g. User authentication, Dashboard, API endpoints..."
        addLabel="+ Add feature"
      />

      <p className="text-xs text-muted-foreground">
        {draft.features.filter(Boolean).length} feature{draft.features.filter(Boolean).length !== 1 ? "s" : ""} defined
      </p>
    </div>
  );
}
