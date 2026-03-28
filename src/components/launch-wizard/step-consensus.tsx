"use client";

import * as React from "react";
import {
  type LaunchKitDraft,
  type ConfidenceLevel,
  type ConsensusConfig,
  type AgentOrchestratorConfig,
  CONFIDENCE_WEIGHTS,
  PROJECT_PHASES,
  CEO_TIEBREAKER_CRITERIA,
  ORCHESTRATOR_MODELS,
} from "@/lib/launch-kit";

type Props = {
  draft: LaunchKitDraft;
  onChange: (patch: Partial<LaunchKitDraft>) => void;
};

export function StepConsensus({ draft, onChange }: Props) {
  const { team, consensus } = draft;

  function patch(updates: Partial<ConsensusConfig>) {
    onChange({ consensus: { ...consensus, ...updates } });
  }

  function setCeo(index: number | null) {
    patch({ ceoIndex: index });
  }

  function setConfidence(teamIndex: number, level: ConfidenceLevel) {
    patch({
      confidenceLevels: { ...consensus.confidenceLevels, [teamIndex]: level },
    });
  }

  function setPhaseAuthority(phaseId: string, teamIndex: number | null) {
    patch({
      phaseAuthority: { ...consensus.phaseAuthority, [phaseId]: teamIndex },
    });
  }

  function patchOrch(updates: Partial<AgentOrchestratorConfig>) {
    onChange({ orchestrator: { ...draft.orchestrator, ...updates } });
  }

  const [orchExpanded, setOrchExpanded] = React.useState(true);

  const ceo =
    consensus.ceoIndex !== null ? team[consensus.ceoIndex] : null;

  if (team.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Consensus Protocol
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Go back to the Team step and add at least one role first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Consensus Protocol
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure how your persona team resolves disputes. When personas
          disagree, this protocol determines how decisions are made.
        </p>
      </div>

      {/* CEO / Tiebreaker */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            CEO / Dispute Resolver
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            When personas deadlock, the CEO makes the final call using weighted
            criteria.
          </p>
        </div>

        <div className="grid gap-2">
          {team.map((member, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCeo(i)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition cursor-pointer ${
                consensus.ceoIndex === i
                  ? "border-primary/40 bg-primary/5"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/5"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  consensus.ceoIndex === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 text-muted-foreground"
                }`}
              >
                {consensus.ceoIndex === i ? "\u2605" : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground">
                  {member.role || `Role ${i + 1}`}
                </span>
                {member.company && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({member.company})
                  </span>
                )}
              </div>
              {consensus.ceoIndex === i && (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  CEO
                </span>
              )}
            </button>
          ))}
        </div>

        {ceo && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
            <p className="text-xs font-medium text-primary">
              CEO Tiebreaker Criteria
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {CEO_TIEBREAKER_CRITERIA.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {c.label}
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {c.weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confidence Levels */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Confidence-Weighted Voting
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Higher confidence gives a persona more influence. High = 1.0x,
            Medium = 0.7x, Low = 0.4x.
          </p>
        </div>

        <div className="space-y-2">
          {team.map((member, i) => {
            const level = consensus.confidenceLevels[i] || "high";
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
              >
                <span className="min-w-0 flex-1 text-sm text-foreground truncate">
                  {member.role || `Role ${i + 1}`}
                </span>
                <div className="flex gap-1">
                  {(["high", "medium", "low"] as ConfidenceLevel[]).map(
                    (conf) => (
                      <button
                        key={conf}
                        type="button"
                        onClick={() => setConfidence(i, conf)}
                        className={`rounded-md px-2 py-1 text-[11px] font-medium transition cursor-pointer ${
                          level === conf
                            ? conf === "high"
                              ? "bg-green-500/15 text-green-400 border border-green-500/30"
                              : conf === "medium"
                                ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                                : "bg-red-500/15 text-red-400 border border-red-500/30"
                            : "bg-white/[0.02] text-muted-foreground border border-white/10 hover:bg-white/5"
                        }`}
                      >
                        {conf} ({CONFIDENCE_WEIGHTS[conf]}x)
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase-Based Authority */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Phase-Based Authority
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Assign a lead persona for each project phase. They get a 1.5x
            authority bonus on close calls during that phase.
          </p>
        </div>

        <div className="space-y-2">
          {PROJECT_PHASES.map((phase) => {
            const selectedIdx = consensus.phaseAuthority[phase.id] ?? null;
            return (
              <div
                key={phase.id}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-foreground">
                    {phase.label}
                  </span>
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {phase.description}
                  </span>
                </div>
                <select
                  value={selectedIdx ?? ""}
                  onChange={(e) =>
                    setPhaseAuthority(
                      phase.id,
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-foreground cursor-pointer min-w-[140px]"
                >
                  <option value="">None</option>
                  {team.map((member, i) => (
                    <option key={i} value={i}>
                      {member.role || `Role ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consensus Threshold */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Consensus Threshold
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Minimum agreement percentage needed to proceed without CEO
            intervention.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={50}
            max={100}
            step={1}
            value={consensus.consensusThreshold}
            onChange={(e) =>
              patch({ consensusThreshold: Number(e.target.value) })
            }
            className="flex-1 accent-primary"
          />
          <span className="w-12 text-right text-sm font-medium text-foreground">
            {consensus.consensusThreshold}%
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
          <span>Simple majority (50%)</span>
          <span>Default (67%)</span>
          <span>Unanimous (100%)</span>
        </div>
      </div>

      {/* Protocol Summary */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
        <h3 className="text-sm font-medium text-foreground">
          Resolution Flow
        </h3>
        <ol className="ml-4 space-y-1 text-xs text-muted-foreground list-decimal">
          <li>Each persona provides their position + confidence level</li>
          <li>
            Confidence weights adjust votes (High 1.0x, Medium 0.7x, Low 0.4x)
          </li>
          <li>
            Phase lead gets 1.5x authority bonus on close calls
          </li>
          <li>
            {consensus.consensusThreshold}%+ agreement = proceed with majority
            (dissent documented)
          </li>
          <li>
            Deadlock = {ceo ? ceo.role : "CEO"} evaluates using weighted
            criteria
          </li>
          <li>User always has final override</li>
        </ol>
      </div>

      {/* ── Agent Orchestration ── */}
      <div className="relative py-4">
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
        <button
          type="button"
          onClick={() => setOrchExpanded(!orchExpanded)}
          className="relative mx-auto flex items-center gap-2 rounded-full border border-white/10 bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <span>{orchExpanded ? "\u25BC" : "\u25B6"}</span>
          Agent Orchestration
        </button>
      </div>

      {orchExpanded && (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Configure how your AI agent team coordinates during development.
            </p>
          </div>

          {/* Orchestrator Model */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Orchestrator Model
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choose which Claude model coordinates your persona agents.
              </p>
            </div>
            <div className="space-y-2">
              {ORCHESTRATOR_MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => patchOrch({ orchestratorModel: model.id })}
                  className={`w-full rounded-lg border p-3 text-left transition cursor-pointer ${
                    draft.orchestrator.orchestratorModel === model.id
                      ? "border-primary/40 bg-primary/5"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {model.label}
                      </span>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {model.description}
                      </p>
                    </div>
                    {draft.orchestrator.orchestratorModel === model.id && (
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Max Concurrent Agents */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Max Concurrent Agents
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                How many persona agents can be consulted in parallel.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={6}
                step={1}
                value={draft.orchestrator.maxConcurrentAgents}
                onChange={(e) =>
                  patchOrch({ maxConcurrentAgents: Number(e.target.value) })
                }
                className="flex-1 accent-primary"
              />
              <span className="w-8 text-right text-sm font-medium text-foreground">
                {draft.orchestrator.maxConcurrentAgents}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span>1 agent</span>
              <span>3 (default)</span>
              <span>6 agents</span>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Automation Settings
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Control when personas are automatically consulted.
              </p>
            </div>
            <div className="space-y-2 pt-1">
              {([
                {
                  key: "consensusRequired" as const,
                  label: "Require Consensus",
                  desc: "Multi-persona decisions need 2/3 majority",
                },
                {
                  key: "autoConsultOnPR" as const,
                  label: "Auto-consult on PR",
                  desc: "Automatically consult relevant personas on pull requests",
                },
                {
                  key: "autoConsultOnDeploy" as const,
                  label: "Auto-consult on Deploy",
                  desc: "Consult personas before each deployment",
                },
                {
                  key: "weeklyRetroEnabled" as const,
                  label: "Weekly Retros",
                  desc: "Enable Phase 5 weekly persona retro cycle",
                },
              ]).map(({ key, label, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    patchOrch({ [key]: !draft.orchestrator[key] })
                  }
                  className="w-full flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 transition cursor-pointer hover:bg-white/5"
                >
                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">
                      {label}
                    </div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                  <div
                    className={`h-5 w-9 rounded-full transition-colors ${
                      draft.orchestrator[key] ? "bg-primary" : "bg-white/10"
                    } relative`}
                  >
                    <div
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        draft.orchestrator[key]
                          ? "translate-x-4"
                          : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {team.length} team member{team.length !== 1 ? "s" : ""}
        {ceo ? ` \u00b7 CEO: ${ceo.role}` : " \u00b7 No CEO selected"}
      </p>
    </div>
  );
}
