"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { generateWhitepaper, type LaunchKitDraft } from "@/lib/launch-kit";

type Props = {
  draft: LaunchKitDraft;
  onChange: (patch: Partial<LaunchKitDraft>) => void;
};

export function StepWhitepaper({ draft, onChange }: Props) {
  const [showPreview, setShowPreview] = React.useState(false);

  function handleGenerate() {
    const wp = generateWhitepaper(draft);
    onChange({ whitepaper: wp });
    setShowPreview(true);
  }

  function handleDownload() {
    const blob = new Blob([draft.whitepaper], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(draft.projectName)}-whitepaper.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">North Star & Whitepaper</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define your project&apos;s mission, then generate a whitepaper from everything you&apos;ve built so far.
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

      {/* Generate */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Generate Whitepaper</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Combines your brief, team, stack, roadmap, and North Star into a structured document.
            </p>
          </div>
          <Button size="sm" onClick={handleGenerate} disabled={!draft.northStar}>
            {draft.whitepaper ? "Regenerate" : "Generate"}
          </Button>
        </div>
      </div>

      {/* Whitepaper Editor */}
      {draft.whitepaper && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Whitepaper
            </label>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Edit" : "Preview"}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleDownload}>
                Download .md
              </Button>
            </div>
          </div>

          {showPreview ? (
            <div className="max-h-[500px] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground font-mono">
                {draft.whitepaper}
              </pre>
            </div>
          ) : (
            <Textarea
              value={draft.whitepaper}
              onChange={(e) => onChange({ whitepaper: e.target.value })}
              className="min-h-[400px] font-mono text-xs"
            />
          )}

          <p className="text-xs text-muted-foreground">
            {draft.whitepaper.split("\n").length} lines | Edit freely, then download or proceed to review.
          </p>
        </div>
      )}
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
}
