"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  PROJECT_TYPES,
  TECH_CATEGORIES,
  PROJECT_PHASES,
  CONFIDENCE_WEIGHTS,
  generateBriefMarkdown,
  generateTeamMarkdown,
  generateConsensusMarkdown,
  generateGrillMarkdown,
  generateStackMarkdown,
  generateRoadmapMarkdown,
  generateClaudeMd,
  generateWhitepaper,
  type LaunchKitDraft,
} from "@/lib/launch-kit";
import { inferRoleIcon, slugify, downloadFile as download } from "@/lib/utils";
import {
  saveBuilderTemplate,
  type BuilderTemplate,
} from "@supra/builder";

type Props = {
  draft: LaunchKitDraft;
  onChange: (patch: Partial<LaunchKitDraft>) => void;
};

export function StepReview({ draft, onChange }: Props) {
  const [creatingPersonas, setCreatingPersonas] = React.useState(false);
  const [personasCreated, setPersonasCreated] = React.useState(0);
  const [personasDone, setPersonasDone] = React.useState(false);
  const [claudeMdCopied, setClaudeMdCopied] = React.useState(false);
  const [templateSaved, setTemplateSaved] = React.useState(false);

  function handleCreateTemplate() {
    const content = generateClaudeMd(draft);
    const name = draft.projectName
      ? `${draft.projectName} — Launch Kit`
      : "Launch Kit";
    const template: BuilderTemplate = {
      id: `launch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      description: `${draft.team.length} team members, ${draft.techChoices.length} tech choices${draft.projectType ? `, ${draft.projectType}` : ""}`,
      source: "launch-kit",
      content,
      metadata: {
        source: "launch-kit",
        data: {
          projectName: draft.projectName,
          description: draft.description,
          targetUser: draft.targetUser,
          problem: draft.problem,
          team: draft.team.map((t) => ({
            role: t.role,
            company: t.company,
            focus: t.focus,
          })),
          techChoices: draft.techChoices,
          projectType: draft.projectType,
        },
      },
      createdAt: new Date().toISOString(),
    };
    saveBuilderTemplate(template);
    setTemplateSaved(true);
    setTimeout(() => setTemplateSaved(false), 3000);
  }

  const projectType = PROJECT_TYPES.find((p) => p.id === draft.projectType);
  const claudeMd = generateClaudeMd(draft);

  function handleGenerateWhitepaper() {
    const wp = generateWhitepaper(draft);
    onChange({ whitepaper: wp });
  }

  function downloadWhitepaper() {
    if (!draft.whitepaper) return;
    download(draft.whitepaper, `${slugify(draft.projectName)}-whitepaper.md`, "text/markdown");
  }

  function downloadClaudeMd() {
    download(claudeMd, "CLAUDE.md", "text/markdown");
  }

  async function exportAll() {
    const slug = slugify(draft.projectName);
    const brief = generateBriefMarkdown(draft);
    const team = generateTeamMarkdown(draft);
    const consensus = generateConsensusMarkdown(draft);
    const grill = generateGrillMarkdown(draft);
    const stack = generateStackMarkdown(draft);
    const roadmap = generateRoadmapMarkdown(draft);

    download(brief, `${slug}-brief.md`, "text/markdown");
    setTimeout(() => download(team, `${slug}-team.md`, "text/markdown"), 200);
    setTimeout(() => download(consensus, `${slug}-consensus.md`, "text/markdown"), 400);
    if (draft.grillQuestions.length > 0) {
      setTimeout(() => download(grill, `${slug}-grill.md`, "text/markdown"), 600);
    }
    setTimeout(() => download(stack, `${slug}-stack.md`, "text/markdown"), 800);
    setTimeout(() => download(roadmap, `${slug}-roadmap.md`, "text/markdown"), 1000);
  }

  async function createPersonas() {
    setCreatingPersonas(true);
    setPersonasCreated(0);
    setPersonasDone(false);

    let count = 0;
    for (const member of draft.team) {
      if (!member.role) continue;

      const systemPrompt = buildTeamMemberPrompt(member, draft);
      try {
        const res = await fetch("/api/personas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: member.role,
            role: member.company
              ? `${member.role} (modeled after ${member.company})`
              : member.role,
            system_prompt: systemPrompt,
            capabilities: ["scoring"],
            output_format: "structured_report",
            review_focus: ["general"],
            icon: inferRoleIcon(member.role),
          }),
        });
        if (res.ok) {
          count++;
          setPersonasCreated(count);
        }
      } catch {
        // continue with next
      }
    }
    setPersonasDone(true);
    setCreatingPersonas(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Review &amp; Export</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your project, set your North Star, then export everything.
        </p>
      </div>

      {/* North Star */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          North Star
        </label>
        <Textarea
          value={draft.northStar}
          onChange={(e) => onChange({ northStar: e.target.value })}
          placeholder="What is the single mission that drives this project? e.g. Make learning accessible to everyone through personalized, AI-driven experiences that adapt to each learner's pace and style."
          className="min-h-[100px]"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          This becomes the guiding vision for the entire project and every persona consultation.
        </p>
      </div>

      {/* ── Exports ── */}
      <div className="border-t border-white/10 my-2 pt-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Exports</h3>

        {/* CLAUDE.md — primary export */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold">CLAUDE.md</h3>
              <p className="text-xs text-white/40">Complete project instructions for AI agents</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => {
                navigator.clipboard.writeText(claudeMd);
                setClaudeMdCopied(true);
                setTimeout(() => setClaudeMdCopied(false), 2000);
              }}>
                {claudeMdCopied ? "Copied!" : "Copy"}
              </Button>
              <Button size="sm" onClick={downloadClaudeMd}>Download</Button>
            </div>
          </div>
          <pre className="text-xs text-white/50 whitespace-pre-wrap max-h-64 overflow-y-auto mt-2 bg-white/5 rounded p-3">
            {claudeMd.slice(0, 800)}...
          </pre>
        </div>

        {/* Whitepaper */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Whitepaper</h3>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleGenerateWhitepaper}>
                {draft.whitepaper ? "Regenerate" : "Generate"}
              </Button>
              <Button variant="secondary" size="sm" onClick={downloadWhitepaper} disabled={!draft.whitepaper}>
                Download
              </Button>
            </div>
          </div>
          {draft.whitepaper && (
            <pre className="text-xs text-white/50 whitespace-pre-wrap max-h-48 overflow-y-auto mt-2 bg-white/5 rounded p-3">
              {draft.whitepaper.slice(0, 500)}...
            </pre>
          )}
        </div>
      </div>

      {/* Project Brief */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
        <h3 className="text-sm font-medium text-foreground">
          {draft.projectName || "Untitled Project"}
        </h3>
        {projectType && (
          <span className="inline-block rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
            {projectType.label}
          </span>
        )}
        {draft.description && (
          <p className="text-sm text-muted-foreground">{draft.description}</p>
        )}
        {draft.targetUser && (
          <p className="text-xs text-muted-foreground">
            Target: {draft.targetUser}
          </p>
        )}
        {draft.platforms.length > 0 && (
          <div className="flex gap-1.5">
            {draft.platforms.map((p) => (
              <span
                key={p}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Team */}
      {draft.team.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">Team</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Company
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Focus
                  </th>
                </tr>
              </thead>
              <tbody>
                {draft.team.map((t, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2 text-foreground">{t.role}</td>
                    <td className="py-2 text-muted-foreground">
                      {t.company || "---"}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {t.focus || "---"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consensus */}
      {draft.team.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            Consensus Protocol
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            {draft.consensus.ceoIndex !== null && draft.team[draft.consensus.ceoIndex] && (
              <p>
                <span className="text-foreground font-medium">CEO:</span>{" "}
                {draft.team[draft.consensus.ceoIndex].role}
                {draft.team[draft.consensus.ceoIndex].company &&
                  ` (${draft.team[draft.consensus.ceoIndex].company})`}
              </p>
            )}
            <p>
              <span className="text-foreground font-medium">Threshold:</span>{" "}
              {draft.consensus.consensusThreshold}% agreement required
            </p>
            {Object.entries(draft.consensus.confidenceLevels).some(
              ([, v]) => v !== "high"
            ) && (
              <div>
                <span className="text-foreground font-medium">
                  Custom confidence:
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {draft.team.map((t, i) => {
                    const conf =
                      draft.consensus.confidenceLevels[i] || "high";
                    return (
                      <span
                        key={i}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5"
                      >
                        {t.role}: {conf} ({CONFIDENCE_WEIGHTS[conf]}x)
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {Object.entries(draft.consensus.phaseAuthority).filter(
              ([, v]) => v !== null
            ).length > 0 && (
              <div>
                <span className="text-foreground font-medium">
                  Phase leads:
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {Object.entries(draft.consensus.phaseAuthority)
                    .filter(([, v]) => v !== null)
                    .map(([phaseId, idx]) => {
                      const phase = PROJECT_PHASES.find(
                        (p) => p.id === phaseId
                      );
                      const member =
                        idx !== null ? draft.team[idx] : null;
                      return phase && member ? (
                        <span
                          key={phaseId}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5"
                        >
                          {phase.label}: {member.role}
                        </span>
                      ) : null;
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grill Results */}
      {draft.grillQuestions.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <h3 className="text-sm font-medium text-foreground">Persona Grill</h3>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="text-green-400">
              {draft.grillQuestions.filter((q) => q.status === "answered").length} answered
            </span>
            <span className="text-yellow-400">
              {draft.grillQuestions.filter((q) => q.status === "acknowledged").length} acknowledged
            </span>
          </div>
          <div className="space-y-1.5 mt-2">
            {draft.grillQuestions
              .filter((q) => q.status === "answered" && q.response)
              .slice(0, 3)
              .map((q, i) => {
                const member = draft.team[q.personaIndex];
                return (
                  <div key={i} className="text-xs">
                    <span className="text-muted-foreground">{member?.role}: </span>
                    <span className="text-foreground">{q.response.slice(0, 120)}{q.response.length > 120 ? "..." : ""}</span>
                  </div>
                );
              })}
            {draft.grillQuestions.filter((q) => q.status === "answered").length > 3 && (
              <p className="text-[10px] text-muted-foreground/60">
                +{draft.grillQuestions.filter((q) => q.status === "answered").length - 3} more responses
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tech Stack */}
      {draft.techChoices.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">
            Tech Stack
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Choice
                  </th>
                </tr>
              </thead>
              <tbody>
                {draft.techChoices.map((tc) => {
                  const cat = TECH_CATEGORIES.find(
                    (c) => c.id === tc.category
                  );
                  return (
                    <tr key={tc.category} className="border-b border-white/5">
                      <td className="py-2 text-muted-foreground">
                        {cat?.label || tc.category}
                      </td>
                      <td className="py-2 text-foreground">{tc.choice}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roadmap */}
      {draft.buildPhases.some((p) => p.features.length > 0) && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">
            Build Roadmap
          </h3>
          <div className="space-y-3">
            {draft.buildPhases.map((phase, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {phase.phase}
                  </span>
                </div>
                {phase.features.length > 0 ? (
                  <ul className="ml-7 space-y-0.5">
                    {phase.features.map((f, fi) => (
                      <li
                        key={fi}
                        className="text-xs text-muted-foreground"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="ml-7 text-xs text-muted-foreground italic">
                    No features defined
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* North Star */}
      {draft.northStar && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <h3 className="text-sm font-medium text-foreground">North Star</h3>
          <p className="text-sm text-muted-foreground">{draft.northStar}</p>
        </div>
      )}

      {/* Whitepaper */}
      {draft.whitepaper && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Whitepaper</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                download(draft.whitepaper, `${slugify(draft.projectName)}-whitepaper.md`, "text/markdown");
              }}
            >
              Download .md
            </Button>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-4">
            {draft.whitepaper.slice(0, 300)}...
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            {draft.whitepaper.split("\n").length} lines
          </p>
        </div>
      )}

      {/* Orchestrator */}
      {draft.orchestrator && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <h3 className="text-sm font-medium text-foreground">
            Agent Orchestration
          </h3>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">Model:</span>{" "}
              {draft.orchestrator.orchestratorModel}
            </p>
            <p>
              <span className="text-foreground font-medium">
                Max Concurrent Agents:
              </span>{" "}
              {draft.orchestrator.maxConcurrentAgents}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {draft.orchestrator.consensusRequired && (
                <span className="rounded-md border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-green-400">
                  Consensus Required
                </span>
              )}
              {draft.orchestrator.autoConsultOnPR && (
                <span className="rounded-md border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-green-400">
                  Auto-consult on PR
                </span>
              )}
              {draft.orchestrator.autoConsultOnDeploy && (
                <span className="rounded-md border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-green-400">
                  Auto-consult on Deploy
                </span>
              )}
              {draft.orchestrator.weeklyRetroEnabled && (
                <span className="rounded-md border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-green-400">
                  Weekly Retros
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={() => {
            const md = generateClaudeMd(draft);
            download(md, "CLAUDE.md", "text/markdown");
          }}
          className="w-full"
        >
          Download CLAUDE.md
        </Button>

        <div className="flex items-center gap-3">
          <Button onClick={exportAll} variant="secondary">
            Export All
          </Button>

          <Button
            onClick={createPersonas}
            disabled={creatingPersonas || draft.team.length === 0}
            variant="secondary"
          >
            {creatingPersonas
              ? `Creating... (${personasCreated}/${draft.team.length})`
              : personasDone
                ? `Created ${personasCreated} personas`
                : "Create Personas in SupraVibe"}
          </Button>
          <Button
            onClick={handleCreateTemplate}
            variant="secondary"
          >
            {templateSaved ? "Template Created!" : "Create Template"}
          </Button>
        </div>
      </div>

      {templateSaved && (
        <p className="text-xs text-primary">
          Template saved! Find it in{" "}
          <Link href="/builder" className="underline hover:text-foreground">
            Workflow Builder → My Templates
          </Link>
        </p>
      )}

      {personasDone && personasCreated > 0 && (
        <p className="text-xs text-primary">
          {personasCreated} persona{personasCreated !== 1 ? "s" : ""} saved.{" "}
          <Link href="/personas" className="underline hover:text-foreground">
            View in My Personas
          </Link>
        </p>
      )}
    </div>
  );
}

function buildTeamMemberPrompt(
  member: { role: string; company: string; focus: string },
  draft: LaunchKitDraft
): string {
  const parts: string[] = [];

  parts.push(`You are a ${member.role}.`);
  if (member.company) {
    parts.push(
      `Your approach is modeled after how ${member.company} operates.`
    );
  }
  if (member.focus) {
    parts.push(`Your primary focus: ${member.focus}`);
  }

  if (draft.projectName) {
    parts.push(`\nProject: ${draft.projectName}`);
  }
  if (draft.description) {
    parts.push(draft.description);
  }
  if (draft.targetUser) {
    parts.push(`Target user: ${draft.targetUser}`);
  }
  if (draft.problem) {
    parts.push(`Problem: ${draft.problem}`);
  }

  if (draft.techChoices.length > 0) {
    parts.push(
      `\nTech stack: ${draft.techChoices.map((tc) => tc.choice).join(", ")}`
    );
  }

  return parts.join("\n");
}

