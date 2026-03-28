"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  generateDesignSystem,
  generateScreenSpecs,
  generateImplementationDocs,
  type DesignToShipDraft,
} from "@/lib/design-to-ship";
import { slugify, downloadFile as download } from "@/lib/utils";
import {
  saveBuilderTemplate,
  type BuilderTemplate,
} from "@supra/builder";

type Props = {
  draft: DesignToShipDraft;
};

export function StepShip({ draft }: Props) {
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);
  const [templateSaved, setTemplateSaved] = React.useState(false);

  const slug = slugify(draft.projectName);
  const designSystem = draft.designSystem || generateDesignSystem(draft);
  const screenSpecs = generateScreenSpecs(draft);
  const implDocs = generateImplementationDocs(draft);

  const artifacts = [
    { label: "Design System", filename: `${slug}-design-system.md`, content: designSystem },
    { label: "Screen Specs", filename: `${slug}-screens.md`, content: screenSpecs },
    { label: "Implementation Guide", filename: `${slug}-implementation.md`, content: implDocs },
  ];

  function copyToClipboard(content: string, index: number) {
    navigator.clipboard.writeText(content);
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  function downloadAll() {
    artifacts.forEach((a) => download(a.content, a.filename));
  }

  function handleCreateTemplate() {
    const fullContent = artifacts.map((a) => `# ${a.label}\n\n${a.content}`).join("\n\n---\n\n");
    const name = draft.projectName
      ? `${draft.projectName} — Design-to-Ship`
      : "Design-to-Ship";
    const template: BuilderTemplate = {
      id: `dts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      description: `${draft.screens.length} screens, ${draft.personas.length} personas, ${draft.atmosphere || "custom"} atmosphere`,
      source: "design-to-ship",
      content: fullContent,
      metadata: {
        source: "design-to-ship",
        data: {
          projectName: draft.projectName,
          atmosphere: draft.atmosphere,
          screens: draft.screens.map((s) => ({
            name: s.name,
            description: s.description,
          })),
          personas: draft.personas.map((p) => ({
            role: p.role,
            company: p.company,
            focus: p.focus,
          })),
        },
      },
      createdAt: new Date().toISOString(),
    };
    saveBuilderTemplate(template);
    setTemplateSaved(true);
    setTimeout(() => setTemplateSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Ship</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Export your design artifacts and implementation guides.
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-foreground">{draft.personas.length}</div>
            <div className="text-xs text-muted-foreground">Personas</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{draft.screens.length}</div>
            <div className="text-xs text-muted-foreground">Screens</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{artifacts.length}</div>
            <div className="text-xs text-muted-foreground">Documents</div>
          </div>
        </div>
      </div>

      {/* Artifact Cards */}
      <div className="space-y-3">
        {artifacts.map((artifact, i) => (
          <div
            key={artifact.label}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground text-sm">{artifact.label}</div>
                <div className="text-xs text-muted-foreground">{artifact.filename}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(artifact.content, i)}
                >
                  {copiedIdx === i ? "Copied!" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => download(artifact.content, artifact.filename)}
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={downloadAll}>Download All Artifacts</Button>
        <Button
          onClick={handleCreateTemplate}
          variant="secondary"
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
    </div>
  );
}
