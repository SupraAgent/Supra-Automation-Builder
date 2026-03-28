"use client";

import * as React from "react";
import { DynamicList } from "@/components/ui/dynamic-list";
import { Input } from "@/components/ui/input";
import type { LaunchKitDraft } from "@/lib/launch-kit";

type Props = {
  draft: LaunchKitDraft;
  onChange: (patch: Partial<LaunchKitDraft>) => void;
};

export function StepRoadmap({ draft, onChange }: Props) {
  // Auto-populate Foundation phase from MVP features if not plan-generated
  React.useEffect(() => {
    if (
      !draft.planGenerated &&
      draft.mvpFeatures.length > 0 &&
      draft.buildPhases[0]?.features.length === 0
    ) {
      const next = [...draft.buildPhases];
      next[0] = { ...next[0], features: [...draft.mvpFeatures] };
      onChange({ buildPhases: next });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updatePhaseName(index: number, phase: string) {
    const next = [...draft.buildPhases];
    next[index] = { ...next[index], phase };
    onChange({ buildPhases: next });
  }

  function updatePhaseFeatures(index: number, features: string[]) {
    const next = [...draft.buildPhases];
    next[index] = { ...next[index], features: features.filter(Boolean) };
    onChange({ buildPhases: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">MVP Roadmap</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Plan your initial build phases. Focus on what ships for MVP.
        </p>
      </div>

      {draft.planGenerated && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          Auto-generated from your brief and team. Edit as needed.
        </div>
      )}

      <div className="space-y-5">
        {draft.buildPhases.map((phase, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {i + 1}
              </span>
              <Input
                value={phase.phase}
                onChange={(e) => updatePhaseName(i, e.target.value)}
                placeholder="Phase name"
                className="max-w-[240px]"
              />
            </div>
            <DynamicList
              value={phase.features.length > 0 ? phase.features : [""]}
              onChange={(features) => updatePhaseFeatures(i, features)}
              placeholder="e.g. User auth, database schema, API routes"
              addLabel="Add feature"
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {draft.buildPhases.reduce((sum, p) => sum + p.features.length, 0)}{" "}
        features across {draft.buildPhases.length} phases
      </p>
    </div>
  );
}
