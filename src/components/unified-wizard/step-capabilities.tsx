"use client";

import * as React from "react";
import {
  AGENT_SKILLS,
  SKILL_CATEGORIES,
  LLM_PROVIDERS,
} from "@/lib/agent-personas";
import type { UnifiedDraft } from "@/lib/unified-builder";

type Props = {
  draft: UnifiedDraft;
  onChange: (patch: Partial<UnifiedDraft>) => void;
};

export function StepCapabilities({ draft, onChange }: Props) {
  const [selectedProvider, setSelectedProvider] = React.useState<string>(
    draft.llmProvider || "anthropic"
  );

  function toggleSkill(skillId: string) {
    const next = draft.skills.includes(skillId)
      ? draft.skills.filter((s) => s !== skillId)
      : [...draft.skills, skillId];
    onChange({ skills: next });
  }

  function selectProvider(providerId: string) {
    setSelectedProvider(providerId);
    const provider = LLM_PROVIDERS.find((p) => p.id === providerId);
    if (provider && provider.models.length > 0) {
      onChange({
        llmProvider: providerId,
        llmModel: provider.models[0].id,
      });
    }
  }

  function selectModel(modelId: string) {
    onChange({ llmModel: modelId });
  }

  const activeProvider = LLM_PROVIDERS.find((p) => p.id === selectedProvider);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Capabilities</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          What can this agent do? Select skills and choose an LLM.
        </p>
      </div>

      {/* Skills multi-select grouped by category */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-foreground">
          Agent Skills
        </label>
        {SKILL_CATEGORIES.map((cat) => {
          const skills = AGENT_SKILLS.filter((s) => s.category === cat.id);
          if (skills.length === 0) return null;
          return (
            <div key={cat.id}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {cat.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const active = draft.skills.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                        active
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground"
                      }`}
                      title={skill.description}
                    >
                      {skill.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">
          {draft.skills.length} skill{draft.skills.length !== 1 ? "s" : ""}{" "}
          selected
        </p>
      </div>

      {/* LLM Provider + Model */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          LLM Provider
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LLM_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => selectProvider(provider.id)}
              className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                selectedProvider === provider.id
                  ? "border-primary/60 bg-primary/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div className="text-sm font-medium text-foreground">
                {provider.label}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                {provider.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeProvider && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Model
          </label>
          <div className="grid grid-cols-2 gap-2">
            {activeProvider.models.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => selectModel(model.id)}
                className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                  draft.llmModel === model.id
                    ? "border-primary/60 bg-primary/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="text-sm font-medium text-foreground">
                  {model.label}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {model.context} context
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
