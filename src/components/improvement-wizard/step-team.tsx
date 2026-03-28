"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { StepHint } from "@/components/ui/step-hint";
import type { ImprovementDraft, TeamMember } from "@/lib/improvement";

type Props = {
  draft: ImprovementDraft;
  onChange: (patch: Partial<ImprovementDraft>) => void;
};

const ROLE_ICONS: Record<string, string> = {
  product_lead: "📋",
  eng_lead: "⚙️",
  design_lead: "🎨",
  growth_lead: "📈",
  qa_lead: "🛡️",
};

export function StepTeam({ draft, onChange }: Props) {
  const [expanded, setExpanded] = React.useState<number>(0);

  function patchMember(index: number, patch: Partial<TeamMember>) {
    const next = [...draft.team];
    next[index] = { ...next[index], ...patch };
    onChange({ team: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Build Your Team
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          5 AI personas cover product, engineering, design, growth, and QA.
          Customize their profiles or use the defaults.
        </p>
      </div>

      <StepHint title="Why this matters">
        Each team member votes on improvement priorities with weighted influence.
        The <strong className="text-foreground">Product Lead</strong> identifies what to build,
        the <strong className="text-foreground">Eng Lead</strong> evaluates feasibility,
        <strong className="text-foreground">Design</strong> scores UX quality,
        <strong className="text-foreground">Growth</strong> considers market impact, and
        <strong className="text-foreground">QA</strong> ensures reliability.
        Customizing their expertise makes feedback more relevant to your domain.
      </StepHint>

      <div className="space-y-3">
        {draft.team.map((member, i) => {
          const isOpen = expanded === i;
          return (
            <div
              key={member.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition"
            >
              {/* Header */}
              <button
                onClick={() => setExpanded(isOpen ? -1 : i)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-white/[0.02] transition"
              >
                <span className="text-lg">
                  {ROLE_ICONS[member.id] ?? "👤"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.name || "Unnamed"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.role}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  Weight: {member.vote_weight}
                </span>
                <svg
                  className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>

              {/* Expandable body */}
              {isOpen && (
                <div className="border-t border-white/5 px-4 py-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Name
                      </label>
                      <Input
                        value={member.name}
                        onChange={(e) =>
                          patchMember(i, { name: e.target.value })
                        }
                        placeholder="Persona name"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Role
                      </label>
                      <Input
                        value={member.role}
                        onChange={(e) =>
                          patchMember(i, { role: e.target.value })
                        }
                        placeholder="e.g. Head of Product"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Modeled After
                    </label>
                    <Input
                      value={member.modeled_after}
                      onChange={(e) =>
                        patchMember(i, { modeled_after: e.target.value })
                      }
                      placeholder="e.g. VP Product at Notion"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Expertise
                    </label>
                    <TagInput
                      value={member.expertise}
                      onChange={(expertise) => patchMember(i, { expertise })}
                      placeholder="Add expertise and press Enter"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Personality
                    </label>
                    <Textarea
                      value={member.personality}
                      onChange={(e) =>
                        patchMember(i, { personality: e.target.value })
                      }
                      placeholder="How this persona thinks and acts"
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Reviews
                    </label>
                    <TagInput
                      value={member.reviews}
                      onChange={(reviews) => patchMember(i, { reviews })}
                      placeholder="What this persona reviews"
                    />
                  </div>

                  <div className="max-w-[200px]">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Vote Weight
                    </label>
                    <Input
                      type="number"
                      min={0.1}
                      max={2.0}
                      step={0.1}
                      value={member.vote_weight}
                      onChange={(e) =>
                        patchMember(i, {
                          vote_weight: parseFloat(e.target.value) || 0.8,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
