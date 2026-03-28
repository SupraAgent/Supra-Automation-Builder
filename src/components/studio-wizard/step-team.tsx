"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { DynamicList } from "@/components/ui/dynamic-list";
import {
  EMPTY_PERSONA,
  getPersonaPrompt,
  inferRoleIcon,
  PROJECT_PHASES,
  SUGGESTED_TEAM_SIZES,
  type StudioDraft,
  type StudioPersona,
  type StudioAdvancedFields,
} from "@/lib/studio";
import { LLM_PROVIDERS } from "@/lib/agent-personas";
import { CONFIDENCE_WEIGHTS, type ConfidenceLevel } from "@/lib/launch-kit";
import {
  ROLE_SUGGESTIONS,
  COMPANY_SUGGESTIONS,
  FOCUS_SUGGESTIONS,
} from "@/lib/suggestions";

type Props = {
  draft: StudioDraft;
  onChange: (patch: Partial<StudioDraft>) => void;
};

const ICON_OPTIONS = [
  "\uD83D\uDC54", "\uD83C\uDFA8", "\uD83D\uDD27", "\uD83E\uDDEA", "\uD83D\uDE80",
  "\uD83D\uDD12", "\uD83D\uDCCB", "\uD83D\uDCC8", "\uD83D\uDD04", "\uD83D\uDCCA",
  "\uD83E\uDD16", "\uD83D\uDCA1",
];

const COMM_STYLE_OPTIONS = [
  "Direct", "Collaborative", "Balanced", "Data-Driven", "Empathetic", "Visionary",
];

const LLM_PROVIDER_OPTIONS = ["Anthropic", "OpenAI", "Google", "Local"];

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div
      className={`rounded-lg border transition ${
        open ? "border-white/10 bg-white/5" : "border-white/10 bg-transparent"
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-medium text-foreground cursor-pointer"
      >
        {title}
        <span
          className={`text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      )}
    </div>
  );
}

export function StepTeam({ draft, onChange }: Props) {
  const [editingPrompt, setEditingPrompt] = React.useState(false);

  const activePersona = draft.personas[draft.activePersonaIndex] ?? null;
  const context = {
    projectName: draft.projectName,
    description: draft.description,
    targetUser: draft.targetUser,
    problem: draft.problem,
  };

  function updatePersona(index: number, patch: Partial<StudioPersona>) {
    const next = [...draft.personas];
    next[index] = { ...next[index], ...patch };
    onChange({ personas: next });
  }

  function updateAdvanced(index: number, patch: Partial<StudioAdvancedFields>) {
    const next = [...draft.personas];
    next[index] = {
      ...next[index],
      advanced: { ...next[index].advanced, ...patch },
      promptOverride: null,
    };
    onChange({ personas: next });
  }

  function addPersona() {
    onChange({
      personas: [...draft.personas, { ...EMPTY_PERSONA }],
      activePersonaIndex: draft.personas.length,
    });
  }

  function removePersona(index: number) {
    const next = draft.personas.filter((_, i) => i !== index);
    onChange({
      personas: next,
      activePersonaIndex: Math.min(draft.activePersonaIndex, Math.max(0, next.length - 1)),
    });
  }

  function setCeo(index: number) {
    const next = draft.personas.map((p, i) => ({
      ...p,
      isCeo: i === index,
    }));
    onChange({ personas: next });
  }

  function addTrigger(index: number) {
    const next = [...draft.personas];
    next[index] = { ...next[index], triggers: [...next[index].triggers, ""] };
    onChange({ personas: next });
  }

  function updateTrigger(personaIndex: number, triggerIndex: number, value: string) {
    const next = [...draft.personas];
    const triggers = [...next[personaIndex].triggers];
    triggers[triggerIndex] = value;
    next[personaIndex] = { ...next[personaIndex], triggers };
    onChange({ personas: next });
  }

  function removeTrigger(personaIndex: number, triggerIndex: number) {
    const next = [...draft.personas];
    next[personaIndex] = {
      ...next[personaIndex],
      triggers: next[personaIndex].triggers.filter((_, i) => i !== triggerIndex),
    };
    onChange({ personas: next });
  }

  const livePrompt = activePersona ? getPersonaPrompt(activePersona, context) : "";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Build Your Team</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add advisors and watch their consultation prompt generate in real time.
        </p>
      </div>

      {/* Quick-start team sizes */}
      {draft.personas.length === 0 && (
        <div className="flex gap-3">
          {SUGGESTED_TEAM_SIZES.map((size) => (
            <button
              key={size.id}
              type="button"
              onClick={() => {
                const newPersonas: StudioPersona[] = size.roles.map((role, i) => ({
                  ...EMPTY_PERSONA,
                  role,
                  isCeo: i === 0,
                }));
                onChange({ personas: newPersonas, activePersonaIndex: 0 });
              }}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left hover:border-primary/30 hover:bg-primary/[0.02] transition"
            >
              <span className="text-sm font-medium text-foreground">{size.label}</span>
              <p className="text-[10px] text-muted-foreground mt-1">{size.description}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        {/* Left column — persona cards */}
        <div className="flex-1 min-w-0 space-y-4">
          {draft.personas.map((persona, i) => (
            <div
              key={i}
              onClick={() => {
                onChange({ activePersonaIndex: i });
                setEditingPrompt(false);
              }}
              className={`rounded-xl border p-4 space-y-3 cursor-pointer transition ${
                i === draft.activePersonaIndex
                  ? "border-primary/40 bg-primary/[0.03]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{inferRoleIcon(persona.role)}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {persona.role || `Advisor ${i + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCeo(i);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                      persona.isCeo
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-white/10 text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    {persona.isCeo ? "CEO" : "Set CEO"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePersona(i);
                    }}
                    className="text-xs text-muted-foreground hover:text-red-400"
                  >
                    remove
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Role</label>
                <Combobox
                  value={persona.role}
                  onChange={(v) => updatePersona(i, { role: v, promptOverride: null })}
                  suggestions={ROLE_SUGGESTIONS}
                  placeholder="Search roles..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Company to Model
                  </label>
                  <Combobox
                    value={persona.company}
                    onChange={(v) => updatePersona(i, { company: v, promptOverride: null })}
                    suggestions={COMPANY_SUGGESTIONS}
                    placeholder="Search companies..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Focus Area
                  </label>
                  <Combobox
                    value={persona.focus}
                    onChange={(v) => updatePersona(i, { focus: v, promptOverride: null })}
                    suggestions={FOCUS_SUGGESTIONS}
                    placeholder="Search focus areas..."
                  />
                </div>
              </div>

              {/* Confidence */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Confidence:</span>
                {(["high", "medium", "low"] as ConfidenceLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePersona(i, { confidence: level });
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                      persona.confidence === level
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-white/10 text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    {level} ({CONFIDENCE_WEIGHTS[level]}x)
                  </button>
                ))}
              </div>

              {/* LLM Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    LLM Provider <span className="text-white/30">(optional)</span>
                  </label>
                  <select
                    value={persona.llmProvider}
                    onChange={(e) => {
                      e.stopPropagation();
                      const provider = LLM_PROVIDERS.find((p) => p.id === e.target.value);
                      updatePersona(i, {
                        llmProvider: e.target.value,
                        llmModel: provider?.models[0]?.id || "",
                      });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full h-8 rounded-md border border-white/10 bg-white/5 px-2 text-xs text-foreground"
                  >
                    <option value="">— none —</option>
                    {LLM_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Model
                  </label>
                  <select
                    value={persona.llmModel}
                    onChange={(e) => {
                      e.stopPropagation();
                      updatePersona(i, { llmModel: e.target.value });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    disabled={!persona.llmProvider}
                    className="w-full h-8 rounded-md border border-white/10 bg-white/5 px-2 text-xs text-foreground disabled:opacity-40"
                  >
                    <option value="">— select —</option>
                    {LLM_PROVIDERS.find((p) => p.id === persona.llmProvider)?.models.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Skills <span className="text-white/30">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {(persona.skills || []).map((skill, si) => (
                    <span
                      key={si}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-foreground"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updatePersona(i, {
                            skills: (persona.skills || []).filter((_, j) => j !== si),
                          });
                        }}
                        className="text-muted-foreground hover:text-red-400 ml-0.5"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  placeholder="Type a skill and press Enter"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !(persona.skills || []).includes(val)) {
                        updatePersona(i, { skills: [...(persona.skills || []), val] });
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50"
                />
              </div>

              {/* Triggers */}
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Consult When...
                </label>
                {persona.triggers.map((trigger, ti) => (
                  <div key={ti} className="flex items-center gap-2 mb-1.5">
                    <input
                      value={trigger}
                      onChange={(e) => updateTrigger(i, ti, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50"
                      placeholder="e.g. Feature prioritization decisions"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrigger(i, ti);
                      }}
                      className="text-xs text-muted-foreground hover:text-red-400 px-1"
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addTrigger(i);
                  }}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  + Add trigger
                </button>
              </div>

              {/* Advanced Mode Accordions */}
              {draft.advancedMode && (
                <div className="space-y-2 pt-2 border-t border-white/5">
                  {/* Identity */}
                  <Accordion title="Identity">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Persona Name</label>
                      <Input
                        value={persona.advanced.name}
                        onChange={(e) => updateAdvanced(i, { name: e.target.value })}
                        placeholder="e.g. Sarah Chen"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Years of Experience</label>
                      <Input
                        type="number"
                        value={persona.advanced.yearsExperience ?? ""}
                        onChange={(e) =>
                          updateAdvanced(i, {
                            yearsExperience: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="e.g. 12"
                        className="max-w-[120px]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Background Summary</label>
                      <Textarea
                        value={persona.advanced.backgroundSummary}
                        onChange={(e) => updateAdvanced(i, { backgroundSummary: e.target.value })}
                        placeholder="2-3 sentences about their career arc..."
                        className="min-h-[60px]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Icon</label>
                      <div className="flex flex-wrap gap-1.5">
                        {ICON_OPTIONS.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAdvanced(i, { icon });
                            }}
                            className={`h-8 w-8 rounded-md border text-sm transition cursor-pointer ${
                              persona.advanced.icon === icon
                                ? "border-primary/60 bg-primary/10"
                                : "border-white/10 bg-white/5 hover:border-white/20"
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Accordion>

                  {/* Expertise */}
                  <Accordion title="Expertise">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Primary Domain</label>
                      <Input
                        value={persona.advanced.primaryDomain}
                        onChange={(e) => updateAdvanced(i, { primaryDomain: e.target.value })}
                        placeholder="e.g. Gamification & behavioral design"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <label className="mb-1 block text-xs text-muted-foreground">Secondary Skills</label>
                      <TagInput
                        value={persona.advanced.secondarySkills}
                        onChange={(secondarySkills) => updateAdvanced(i, { secondarySkills })}
                        placeholder="Type a skill and press Enter"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Signature Methodology</label>
                      <Input
                        value={persona.advanced.signatureMethodology}
                        onChange={(e) => updateAdvanced(i, { signatureMethodology: e.target.value })}
                        placeholder="e.g. Data-driven experimentation with rapid A/B testing"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <label className="mb-1 block text-xs text-muted-foreground">Tools & Frameworks</label>
                      <TagInput
                        value={persona.advanced.toolsAndFrameworks}
                        onChange={(toolsAndFrameworks) => updateAdvanced(i, { toolsAndFrameworks })}
                        placeholder="Type a tool/framework and press Enter"
                      />
                    </div>
                  </Accordion>

                  {/* Mindset */}
                  <Accordion title="Mindset">
                    <div onClick={(e) => e.stopPropagation()}>
                      <label className="mb-1 block text-xs text-muted-foreground">Core Beliefs</label>
                      <DynamicList
                        value={persona.advanced.coreBeliefs.length > 0 ? persona.advanced.coreBeliefs : [""]}
                        onChange={(coreBeliefs) => updateAdvanced(i, { coreBeliefs: coreBeliefs.filter(Boolean) })}
                        placeholder="e.g. Ship fast, measure everything"
                        addLabel="Add belief"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Optimize For</label>
                      <Input
                        value={persona.advanced.optimizeFor}
                        onChange={(e) => updateAdvanced(i, { optimizeFor: e.target.value })}
                        placeholder="e.g. 30-day retention rate"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <label className="mb-1 block text-xs text-muted-foreground">Push Back On</label>
                      <DynamicList
                        value={persona.advanced.pushBackOn.length > 0 ? persona.advanced.pushBackOn : [""]}
                        onChange={(pushBackOn) => updateAdvanced(i, { pushBackOn: pushBackOn.filter(Boolean) })}
                        placeholder="e.g. Building without data"
                        addLabel="Add item"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Decision-Making Style</label>
                      <Textarea
                        value={persona.advanced.decisionMakingStyle}
                        onChange={(e) => updateAdvanced(i, { decisionMakingStyle: e.target.value })}
                        placeholder="How do they evaluate trade-offs?"
                        className="min-h-[60px]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Communication Style</label>
                      <div className="flex flex-wrap gap-1.5">
                        {COMM_STYLE_OPTIONS.map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAdvanced(i, {
                                communicationStyle: persona.advanced.communicationStyle === style ? "" : style,
                              });
                            }}
                            className={`text-[11px] px-2.5 py-1 rounded-md border transition cursor-pointer ${
                              persona.advanced.communicationStyle === style
                                ? "border-primary/50 bg-primary/10 text-primary"
                                : "border-white/10 text-muted-foreground hover:border-white/20"
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Accordion>

                  {/* Agent */}
                  <Accordion title="Agent">
                    <div onClick={(e) => e.stopPropagation()}>
                      <label className="mb-1 block text-xs text-muted-foreground">Skills</label>
                      <TagInput
                        value={persona.advanced.skills}
                        onChange={(skills) => updateAdvanced(i, { skills })}
                        placeholder="Type a skill and press Enter"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">LLM Provider</label>
                      <div className="flex flex-wrap gap-1.5">
                        {LLM_PROVIDER_OPTIONS.map((provider) => (
                          <button
                            key={provider}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAdvanced(i, {
                                llmProvider: persona.advanced.llmProvider === provider ? "" : provider,
                              });
                            }}
                            className={`text-[11px] px-2.5 py-1 rounded-md border transition cursor-pointer ${
                              persona.advanced.llmProvider === provider
                                ? "border-primary/50 bg-primary/10 text-primary"
                                : "border-white/10 text-muted-foreground hover:border-white/20"
                            }`}
                          >
                            {provider}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">LLM Model</label>
                      <Input
                        value={persona.advanced.llmModel}
                        onChange={(e) => updateAdvanced(i, { llmModel: e.target.value })}
                        placeholder="e.g. claude-sonnet-4-6"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </Accordion>
                </div>
              )}
            </div>
          ))}

          <Button type="button" variant="ghost" size="sm" onClick={addPersona}>
            + Add advisor
          </Button>

          {/* Consensus threshold */}
          {draft.personas.length > 1 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  Consensus Threshold
                </label>
                <span className="text-xs text-foreground font-medium">
                  {draft.consensusThreshold}%
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={draft.consensusThreshold}
                onChange={(e) =>
                  onChange({ consensusThreshold: parseInt(e.target.value, 10) })
                }
                className="w-full accent-primary"
              />
              <p className="text-[10px] text-muted-foreground">
                When advisors disagree, {draft.consensusThreshold}% weighted agreement
                is needed. Deadlocks go to the CEO tiebreaker.
              </p>
            </div>
          )}

          {/* Phase Authority */}
          {draft.personas.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-black/30 p-4 mt-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3">
                Phase Authority <span className="text-white/40 font-normal">(optional)</span>
              </h3>
              <p className="text-[10px] text-muted-foreground mb-3">
                Assign a lead persona for each project phase. Lead gets 1.5x voting weight in that phase.
              </p>
              <div className="space-y-2">
                {PROJECT_PHASES.map((phase) => {
                  const assignment = draft.phaseAuthority.find((pa) => pa.phase === phase.index);
                  return (
                    <div key={phase.index} className="flex items-center gap-3">
                      <span className="w-36 text-xs text-muted-foreground truncate">
                        Phase {phase.index}: {phase.name}
                      </span>
                      <select
                        value={assignment?.personaIndex ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          let next: typeof draft.phaseAuthority;
                          if (val === "") {
                            next = draft.phaseAuthority.filter((pa) => pa.phase !== phase.index);
                          } else {
                            const existing = draft.phaseAuthority.filter((pa) => pa.phase !== phase.index);
                            next = [...existing, { phase: phase.index, personaIndex: parseInt(val, 10) }];
                          }
                          onChange({ phaseAuthority: next });
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 rounded-md border border-white/10 bg-white/5 px-2 text-xs text-foreground flex-1 min-w-0"
                      >
                        <option value="">— none —</option>
                        {draft.personas.map((p, pi) => (
                          <option key={pi} value={pi}>
                            {p.role || `Advisor ${pi + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expected Conflicts */}
          {draft.personas.length >= 2 && (
            <div className="rounded-xl border border-white/10 bg-black/30 p-4 mt-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3">
                Expected Conflicts <span className="text-white/40 font-normal">(optional)</span>
              </h3>
              <p className="text-[10px] text-muted-foreground mb-3">
                Document where personas might disagree to prepare resolution strategies.
              </p>
              <div className="space-y-2">
                {draft.expectedConflicts.map((conflict, ci) => (
                  <div key={ci} className="flex items-center gap-2">
                    <select
                      value={conflict.betweenIndices[0]}
                      onChange={(e) => {
                        const next = [...draft.expectedConflicts];
                        next[ci] = {
                          ...next[ci],
                          betweenIndices: [parseInt(e.target.value, 10), next[ci].betweenIndices[1]],
                        };
                        onChange({ expectedConflicts: next });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 rounded-md border border-white/10 bg-white/5 px-2 text-xs text-foreground"
                    >
                      {draft.personas.map((p, pi) => (
                        <option key={pi} value={pi}>
                          {p.role || `Advisor ${pi + 1}`}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <select
                      value={conflict.betweenIndices[1]}
                      onChange={(e) => {
                        const next = [...draft.expectedConflicts];
                        next[ci] = {
                          ...next[ci],
                          betweenIndices: [next[ci].betweenIndices[0], parseInt(e.target.value, 10)],
                        };
                        onChange({ expectedConflicts: next });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 rounded-md border border-white/10 bg-white/5 px-2 text-xs text-foreground"
                    >
                      {draft.personas.map((p, pi) => (
                        <option key={pi} value={pi}>
                          {p.role || `Advisor ${pi + 1}`}
                        </option>
                      ))}
                    </select>
                    <input
                      value={conflict.topic}
                      onChange={(e) => {
                        const next = [...draft.expectedConflicts];
                        next[ci] = { ...next[ci], topic: e.target.value };
                        onChange({ expectedConflicts: next });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Topic of disagreement"
                      className="flex-1 h-7 rounded-md border border-white/10 bg-white/5 px-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange({
                          expectedConflicts: draft.expectedConflicts.filter((_, i) => i !== ci),
                        });
                      }}
                      className="text-xs text-muted-foreground hover:text-red-400 px-1"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  onChange({
                    expectedConflicts: [
                      ...draft.expectedConflicts,
                      { betweenIndices: [0, Math.min(1, draft.personas.length - 1)] as [number, number], topic: "" },
                    ],
                  });
                }}
                className="text-xs text-primary hover:text-primary/80 mt-2"
              >
                + Add conflict
              </button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {draft.personas.length} advisor{draft.personas.length !== 1 ? "s" : ""}{" "}
            {draft.personas.some((p) => p.isCeo) ? "" : "— select a CEO to proceed"}
          </p>
        </div>

        {/* Right column — live prompt preview */}
        <div className="w-[380px] shrink-0 hidden lg:block">
          <div className="sticky top-8">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xs font-medium text-foreground">
                  {activePersona
                    ? `Prompt: ${activePersona.role || "Untitled"}`
                    : "Prompt Preview"}
                </h3>
                {activePersona && (
                  <div className="flex items-center gap-2">
                    {activePersona.promptOverride !== null && (
                      <button
                        type="button"
                        onClick={() =>
                          updatePersona(draft.activePersonaIndex, {
                            promptOverride: null,
                          })
                        }
                        className="text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingPrompt(!editingPrompt)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition ${
                        editingPrompt
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-white/10 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {editingPrompt ? "Preview" : "Edit"}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {activePersona ? (
                  editingPrompt ? (
                    <div className="space-y-2">
                      {activePersona.promptOverride !== null && (
                        <p className="text-[10px] text-yellow-400">
                          Custom prompt — changes to role/company/focus won't update this.
                        </p>
                      )}
                      <Textarea
                        value={
                          activePersona.promptOverride ??
                          getPersonaPrompt(activePersona, context)
                        }
                        onChange={(e) =>
                          updatePersona(draft.activePersonaIndex, {
                            promptOverride: e.target.value,
                          })
                        }
                        rows={20}
                        className="text-xs font-mono"
                      />
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-mono leading-relaxed">
                      {livePrompt}
                    </pre>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Add an advisor to see the live prompt preview.
                  </p>
                )}
              </div>

              {activePersona && !editingPrompt && (
                <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {livePrompt.length} chars
                    {activePersona.promptOverride !== null && (
                      <span className="ml-2 text-yellow-400">custom</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
