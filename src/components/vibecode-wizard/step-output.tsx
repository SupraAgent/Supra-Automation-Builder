"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { generateClaudeMd, generateScaffoldSpec, type VibeCodeDraft } from "@/lib/vibecode";

type Props = {
  draft: VibeCodeDraft;
  onChange: (patch: Partial<VibeCodeDraft>) => void;
};

function download(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function StepOutput({ draft, onChange }: Props) {
  const [copiedClaude, setCopiedClaude] = React.useState(false);
  const [copiedScaffold, setCopiedScaffold] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"claude" | "scaffold">("claude");

  // Generate on mount / when arriving at this step
  React.useEffect(() => {
    const claudeMd = generateClaudeMd(draft);
    const scaffoldSpec = generateScaffoldSpec(draft);
    onChange({ claudeMd, scaffoldSpec });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const content = activeTab === "claude" ? draft.claudeMd : draft.scaffoldSpec;

  function copyToClipboard() {
    navigator.clipboard.writeText(content);
    if (activeTab === "claude") {
      setCopiedClaude(true);
      setTimeout(() => setCopiedClaude(false), 2000);
    } else {
      setCopiedScaffold(true);
      setTimeout(() => setCopiedScaffold(false), 2000);
    }
  }

  const slug = draft.projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "project";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Generated Output</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your CLAUDE.md and scaffold spec, ready to use.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("claude")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            activeTab === "claude"
              ? "bg-primary/10 text-primary border border-primary/30"
              : "bg-white/[0.02] text-muted-foreground border border-white/5 hover:bg-white/5"
          }`}
        >
          CLAUDE.md
        </button>
        <button
          onClick={() => setActiveTab("scaffold")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            activeTab === "scaffold"
              ? "bg-primary/10 text-primary border border-primary/30"
              : "bg-white/[0.02] text-muted-foreground border border-white/5 hover:bg-white/5"
          }`}
        >
          Scaffold Spec
        </button>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-xs text-muted-foreground font-mono leading-relaxed">
          {content || "Generating..."}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={copyToClipboard}>
          {(activeTab === "claude" ? copiedClaude : copiedScaffold) ? "Copied!" : "Copy to clipboard"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            download(
              draft.claudeMd,
              `${slug}-CLAUDE.md`
            )
          }
        >
          Download CLAUDE.md
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            download(
              draft.scaffoldSpec,
              `${slug}-scaffold.md`
            )
          }
        >
          Download Scaffold
        </Button>
      </div>
    </div>
  );
}
