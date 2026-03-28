"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  generateUnifiedPrompt,
  generateNorthStar,
  unifiedToExportJson,
  unifiedToMarkdown,
  type UnifiedDraft,
} from "@/lib/unified-builder";

type Props = {
  draft: UnifiedDraft;
  onChange: (patch: Partial<UnifiedDraft>) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
};

export function StepReview({ draft, onChange, onSave, saving, saved }: Props) {
  const [exportOpen, setExportOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const prompt = generateUnifiedPrompt(draft);

  // Auto-generate north star if empty
  React.useEffect(() => {
    if (!draft.northStar && draft.title) {
      onChange({ northStar: generateNorthStar(draft) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function downloadJson() {
    const json = JSON.stringify(unifiedToExportJson(draft), null, 2);
    download(json, `${slugify(draft.name)}.json`, "application/json");
    setExportOpen(false);
  }

  function downloadMarkdown() {
    const md = unifiedToMarkdown(draft);
    download(md, `${slugify(draft.name)}.md`, "text/markdown");
    setExportOpen(false);
  }

  function copyPrompt() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setExportOpen(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Review</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the combined system prompt, set your North Star, and save.
        </p>
      </div>

      <div className="space-y-5">
        {/* Display Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Display Name
          </label>
          <Input
            value={draft.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            placeholder={draft.name || "Agent display name"}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            How this persona appears in the dashboard. Defaults to persona name
            if empty.
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
            placeholder="The guiding principle for this persona..."
            className="min-h-[80px]"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Auto-generated from your inputs. Edit freely.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-xs text-muted-foreground">Identity</div>
            <div className="mt-1 text-sm font-medium text-foreground">
              {draft.name || "---"}
            </div>
            <div className="text-xs text-muted-foreground">
              {draft.title}
              {draft.company ? ` at ${draft.company}` : ""}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-xs text-muted-foreground">Domain</div>
            <div className="mt-1 text-sm font-medium text-foreground">
              {draft.primaryDomain || "---"}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-xs text-muted-foreground">
              Communication
            </div>
            <div className="mt-1 text-sm font-medium text-foreground">
              {draft.communicationStyle?.label || "Not set"}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-xs text-muted-foreground">Skills</div>
            <div className="mt-1 text-sm font-medium text-foreground">
              {draft.skills.length} selected
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 col-span-2">
            <div className="text-xs text-muted-foreground">LLM</div>
            <div className="mt-1 text-sm font-medium text-foreground">
              {draft.llmProvider} / {draft.llmModel}
            </div>
          </div>
        </div>

        {/* System Prompt */}
        {prompt && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Generated System Prompt
            </label>
            <div className="max-h-[300px] overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground font-mono">
                {prompt}
              </pre>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {prompt.length}/2000 characters
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={onSave} disabled={saving || !draft.name}>
            {saving ? "Saving..." : saved ? "Saved!" : "Save to SupraVibe"}
          </Button>

          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setExportOpen(!exportOpen)}
            >
              Export
            </Button>
            {exportOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-48 rounded-lg border border-white/10 bg-card p-1 shadow-lg z-10">
                <button
                  onClick={downloadJson}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-white/5 cursor-pointer"
                >
                  Download JSON
                </button>
                <button
                  onClick={downloadMarkdown}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-white/5 cursor-pointer"
                >
                  Download Markdown
                </button>
                <button
                  onClick={copyPrompt}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-white/5 cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy System Prompt"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "persona"
  );
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
