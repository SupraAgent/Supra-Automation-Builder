"use client";

import { Button } from "@/components/ui/button";
import {
  TECH_CATEGORIES,
  DEPLOY_TARGETS,
  MOBILE_FRAMEWORK_OPTIONS,
  generatePlan,
  type LaunchKitDraft,
  type TechChoice,
  type DeployTarget,
} from "@/lib/launch-kit";

type Props = {
  draft: LaunchKitDraft;
  onChange: (patch: Partial<LaunchKitDraft>) => void;
};

export function StepStack({ draft, onChange }: Props) {
  function selectChoice(category: string, choice: string) {
    const next: TechChoice[] = draft.techChoices.filter(
      (tc) => tc.category !== category
    );
    next.push({ category, choice });
    onChange({ techChoices: next });
  }

  function getChoice(category: string): string {
    return (
      draft.techChoices.find((tc) => tc.category === category)?.choice ?? ""
    );
  }

  function handleGeneratePlan() {
    const phases = generatePlan(draft);
    onChange({ buildPhases: phases, planGenerated: true });
  }

  const showMobile = draft.deployTarget !== "web_only";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Tech Stack</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your deployment target and technology for each layer.
        </p>
      </div>

      {/* Deploy Target */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Deployment Target
        </label>
        <div className="grid grid-cols-3 gap-3">
          {DEPLOY_TARGETS.map((target) => {
            const active = draft.deployTarget === target.id;
            const isRecommended = target.id === "web_ios_android";
            return (
              <button
                key={target.id}
                type="button"
                onClick={() => onChange({ deployTarget: target.id as DeployTarget })}
                className={`relative rounded-xl border p-4 text-left transition cursor-pointer ${
                  active
                    ? "border-primary/60 bg-primary/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                {isRecommended && (
                  <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Recommended
                  </span>
                )}
                <div className="text-sm font-medium text-foreground">{target.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{target.description}</div>
                <div className="mt-2 text-[10px] text-muted-foreground/60">{target.techNote}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Framework (conditional) */}
      {showMobile && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Mobile Framework
          </label>
          <div className="flex flex-wrap gap-2">
            {MOBILE_FRAMEWORK_OPTIONS.map((option) => {
              const active = draft.mobileFramework === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange({ mobileFramework: option })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition cursor-pointer ${
                    active
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tech Categories */}
      <div className="space-y-5">
        {TECH_CATEGORIES.map((cat) => {
          const selected = getChoice(cat.id);
          return (
            <div key={cat.id}>
              <label className="mb-2 block text-sm font-medium text-foreground">
                {cat.label}
              </label>
              <div className="flex flex-wrap gap-2">
                {cat.options.map((option) => {
                  const active = selected === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectChoice(cat.id, option)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition cursor-pointer ${
                        active
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stack Summary */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-2">
          Selected Stack
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs text-primary">
            {DEPLOY_TARGETS.find((d) => d.id === draft.deployTarget)?.label}
          </span>
          {showMobile && draft.mobileFramework && (
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-foreground">
              {draft.mobileFramework}
            </span>
          )}
          {draft.techChoices.map((tc) => (
            <span
              key={tc.category}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-foreground"
            >
              {tc.choice}
            </span>
          ))}
        </div>
      </div>

      {/* Generate Plan */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Auto-generate MVP roadmap</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Creates a build plan from your brief, team, and stack choices.
            </p>
          </div>
          <Button size="sm" onClick={handleGeneratePlan}>
            {draft.planGenerated ? "Regenerate" : "Generate Plan"}
          </Button>
        </div>
        {draft.planGenerated && (
          <p className="mt-2 text-xs text-primary">
            Plan generated with {draft.buildPhases.reduce((sum, p) => sum + p.features.length, 0)} items across {draft.buildPhases.length} phases. Edit in the next step.
          </p>
        )}
      </div>
    </div>
  );
}
