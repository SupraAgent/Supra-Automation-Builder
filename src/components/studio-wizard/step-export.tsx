"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getPersonaPrompt,
  generateExportFile,
  generateAgentJson,
  generateConsensusBlock,
  generateStudioTeamMd,
  generateStudioNorthStar,
  studioToExportJson,
  type StudioDraft,
} from "@/lib/studio";
import { inferRoleIcon, slugify, downloadFile as download } from "@/lib/utils";
import {
  saveBuilderTemplate,
  type BuilderTemplate,
} from "@supra/builder";

type Props = {
  draft: StudioDraft;
  onChange: (patch: Partial<StudioDraft>) => void;
};

export function StepExport({ draft, onChange }: Props) {
  const [copied, setCopied] = React.useState<number | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(0);
  const [saveDone, setSaveDone] = React.useState(false);
  const [templateSaved, setTemplateSaved] = React.useState(false);

  const context = {
    projectName: draft.projectName,
    description: draft.description,
    targetUser: draft.targetUser,
    problem: draft.problem,
  };

  async function copyPrompt(index: number) {
    const prompt = getPersonaPrompt(draft.personas[index], context);
    await navigator.clipboard.writeText(prompt);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadFile(index: number) {
    const persona = draft.personas[index];
    const content = generateExportFile(persona, context, draft.grillQuestions, index);
    const slug = slugify(draft.projectName);
    const roleSlug = slugify(persona.role);
    download(content, `${slug}-${roleSlug}.md`, "text/markdown");
  }

  function downloadAgentJsonFile(index: number) {
    const persona = draft.personas[index];
    const content = generateAgentJson(persona, context);
    const slug = slugify(draft.projectName);
    const roleSlug = slugify(persona.role);
    download(content, `${slug}-${roleSlug}-agent.json`, "application/json");
  }

  function downloadAll() {
    const slug = slugify(draft.projectName);
    draft.personas.forEach((persona, i) => {
      setTimeout(() => {
        const content = generateExportFile(persona, context, draft.grillQuestions, i);
        const roleSlug = slugify(persona.role);
        download(content, `${slug}-${roleSlug}.md`, "text/markdown");
      }, i * 200);
    });
    // Also download consensus
    setTimeout(() => {
      const consensus = generateConsensusBlock(draft);
      download(consensus, `${slug}-consensus.md`, "text/markdown");
    }, draft.personas.length * 200);
  }

  function downloadTeamMd() {
    const content = generateStudioTeamMd(draft);
    download(content, "team.md", "text/markdown");
  }

  function downloadJson() {
    const content = studioToExportJson(draft);
    const slug = slugify(draft.projectName);
    download(content, `${slug}-team.json`, "application/json");
  }

  async function saveAll() {
    setSaving(true);
    setSaved(0);
    setSaveDone(false);

    let count = 0;
    for (const persona of draft.personas) {
      if (!persona.role) continue;
      const prompt = getPersonaPrompt(persona, context);
      try {
        const res = await fetch("/api/personas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: persona.role,
            role: persona.company
              ? `${persona.role} (modeled after ${persona.company})`
              : persona.role,
            system_prompt: prompt,
            capabilities: ["scoring"],
            output_format: "structured_report",
            review_focus: ["general"],
            icon: inferRoleIcon(persona.role),
          }),
        });
        if (res.ok) {
          count++;
          setSaved(count);
        }
      } catch {
        // continue
      }
    }
    setSaveDone(true);
    setSaving(false);
  }

  function handleCreateTemplate() {
    const content = generateStudioTeamMd(draft);
    const name = draft.projectName
      ? `${draft.projectName} — Persona Team`
      : "Persona Team";
    const template: BuilderTemplate = {
      id: `persona-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      description: `${draft.personas.length} advisors${draft.projectName ? ` for ${draft.projectName}` : ""}`,
      source: "persona-studio",
      content,
      metadata: {
        source: "persona-studio",
        data: {
          projectName: draft.projectName,
          description: draft.description,
          targetUser: draft.targetUser,
          problem: draft.problem,
          personas: draft.personas.map((p) => ({
            role: p.role,
            company: p.company,
            focus: p.focus,
            emoji: inferRoleIcon(p.role),
          })),
          consensusThreshold: draft.consensusThreshold,
        },
      },
      createdAt: new Date().toISOString(),
    };
    saveBuilderTemplate(template);
    setTemplateSaved(true);
    setTimeout(() => setTemplateSaved(false), 3000);
  }

  const grillAnswered = draft.grillQuestions.filter((q) => q.status === "answered").length;
  const grillAcknowledged = draft.grillQuestions.filter((q) => q.status === "acknowledged").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Export Advisors</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each advisor&apos;s prompt is a standalone file you can use in any AI tool —
          Claude, ChatGPT, Cursor, or anything else.
        </p>
      </div>

      {/* North Star */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white/70">North Star</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ northStar: generateStudioNorthStar(draft) })}
          >
            Generate
          </Button>
        </div>
        <Textarea
          value={draft.northStar}
          onChange={(e) => onChange({ northStar: e.target.value })}
          placeholder="Team mission statement..."
          className="bg-white/5 border-white/10 text-sm"
        />
      </div>

      {/* Per-persona export cards */}
      {draft.personas.map((persona, i) => {
        const prompt = getPersonaPrompt(persona, context);
        const myQuestions = draft.grillQuestions.filter((q) => q.personaIndex === i);
        const myAnswered = myQuestions.filter((q) => q.status === "answered").length;

        return (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{inferRoleIcon(persona.role)}</span>
                <h3 className="text-sm font-medium text-foreground">
                  {persona.role}
                  {persona.company && (
                    <span className="text-muted-foreground font-normal">
                      {" "}({persona.company})
                    </span>
                  )}
                </h3>
                {persona.promptOverride !== null && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    custom
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyPrompt(i)}
                  className="text-xs px-2.5 py-1 rounded-md border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition"
                >
                  {copied === i ? "Copied!" : "Copy prompt"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadFile(i)}
                  className="text-xs px-2.5 py-1 rounded-md border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition"
                >
                  Download .md
                </button>
                {draft.advancedMode && (
                  <button
                    type="button"
                    onClick={() => downloadAgentJsonFile(i)}
                    className="text-xs px-2.5 py-1 rounded-md border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition"
                  >
                    Agent JSON
                  </button>
                )}
              </div>
            </div>

            {/* Prompt preview */}
            <div className="p-4 max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-mono leading-relaxed">
                {prompt}
              </pre>
            </div>

            {/* Grill results summary */}
            {myQuestions.length > 0 && (
              <div className="px-4 py-2 border-t border-white/5 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>Grill: {myAnswered} answered, {myQuestions.length - myAnswered} acknowledged</span>
                <span>{prompt.length} chars</span>
                {persona.triggers.length > 0 && (
                  <span>{persona.triggers.length} triggers</span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Consensus summary */}
      {draft.personas.length > 1 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          <h3 className="text-sm font-medium text-foreground">Consensus Protocol</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <span className="text-foreground font-medium">Threshold:</span>{" "}
              {draft.consensusThreshold}% agreement
            </p>
            {draft.personas.find((p) => p.isCeo) && (
              <p>
                <span className="text-foreground font-medium">Tiebreaker:</span>{" "}
                {draft.personas.find((p) => p.isCeo)?.role}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground/60">
              When advisors disagree, use confidence-weighted voting. Deadlocks go to the CEO.
            </p>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <span>{draft.personas.length} advisors</span>
          <span>{grillAnswered} questions answered</span>
          <span>{grillAcknowledged} acknowledged</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={downloadAll} variant="secondary">
          Export All
        </Button>
        <Button onClick={downloadTeamMd} variant="secondary">
          Download team.md
        </Button>
        <Button onClick={downloadJson} variant="secondary">
          Download JSON
        </Button>
        <Button
          onClick={saveAll}
          disabled={saving || draft.personas.length === 0}
        >
          {saving
            ? `Saving... (${saved}/${draft.personas.length})`
            : saveDone
              ? `Saved ${saved} advisors`
              : "Save to SupraVibe"}
        </Button>
        <Button
          onClick={handleCreateTemplate}
          variant="secondary"
          disabled={draft.personas.length === 0}
        >
          {templateSaved ? "Template Created!" : "Create Template"}
        </Button>
      </div>

      {templateSaved && (
        <p className="text-xs text-primary">
          Template saved! Find it in{" "}
          <Link href="/builder" className="underline hover:text-foreground">
            Workflow Builder → My Templates
          </Link>
        </p>
      )}

      {saveDone && saved > 0 && (
        <p className="text-xs text-primary">
          {saved} advisor{saved !== 1 ? "s" : ""} saved.{" "}
          <Link href="/personas" className="underline hover:text-foreground">
            View in My Personas
          </Link>
        </p>
      )}
    </div>
  );
}

