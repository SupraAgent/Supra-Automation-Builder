"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PersonaImportModal({
  onImported,
  onClose,
}: {
  onImported: () => void;
  onClose: () => void;
}) {
  const [markdown, setMarkdown] = React.useState("");
  const [importing, setImporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<{ name: string; role: string; promptPreview: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setMarkdown(text);
    extractPreview(text);
  };

  const handlePaste = (text: string) => {
    setMarkdown(text);
    if (text.length > 50) extractPreview(text);
  };

  const extractPreview = (md: string) => {
    const nameMatch = md.match(/^#\s*Persona:\s*(.+)$/m);
    const subtitleMatch = md.match(/>\s*\*\*(.+?)\*\*\s*at\s*\*\*(.+?)\*\*/);
    const promptMatch = md.match(/## Consultation Prompt[\s\S]*?```\s*\n([\s\S]*?)```/);

    if (nameMatch) {
      setPreview({
        name: nameMatch[1].trim(),
        role: subtitleMatch ? `${subtitleMatch[1].trim()} at ${subtitleMatch[2].trim()}` : "",
        promptPreview: promptMatch ? promptMatch[1].trim().slice(0, 150) + "..." : "(will be assembled from profile sections)",
      });
    } else {
      setPreview(null);
    }
  };

  const handleImport = async () => {
    if (!markdown.trim()) {
      setError("Paste or upload a Persona Builder .md file");
      return;
    }
    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/personas/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "markdown", markdown }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed");
        return;
      }
      toast.success(`Imported "${data.persona?.name ?? "persona"}"`);
      onImported();
      onClose();
    } catch {
      setError("Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[hsl(var(--background))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-sm font-medium text-foreground">Import from Persona Builder</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Instructions */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs text-muted-foreground">
              Paste the contents of a Persona Builder <code className="rounded bg-white/[0.06] px-1 py-0.5 text-[10px]">.md</code> file
              or drag-drop it below. The persona profile will be parsed and mapped to a SupraOS persona with inferred capabilities and review focus.
            </p>
          </div>

          {/* File upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center hover:border-white/30 hover:bg-white/[0.03] transition"
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} className="text-muted-foreground">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-xs text-muted-foreground">
                Click to upload a <code className="rounded bg-white/[0.06] px-1 py-0.5 text-[10px]">.md</code> file or paste below
              </p>
            </button>
          </div>

          {/* Textarea */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Persona markdown {markdown && <span className="text-muted-foreground/60">({markdown.length} chars)</span>}
            </label>
            <textarea
              value={markdown}
              onChange={(e) => handlePaste(e.target.value)}
              placeholder={"# Persona: Marcus Rivera\n\n> **Chief Retention Officer** at **Duolingo** | Modeled for: Retention Lead\n\n---\n\n## Core Identity\n..."}
              rows={10}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none resize-y"
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-4 space-y-2">
              <p className="text-xs font-medium text-primary">Detected persona</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{preview.name}</p>
                  {preview.role && <p className="text-xs text-muted-foreground">{preview.role}</p>}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{preview.promptPreview}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleImport} disabled={importing || !markdown.trim()}>
              {importing ? "Importing..." : "Import persona"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
