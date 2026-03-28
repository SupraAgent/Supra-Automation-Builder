"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FrontmatterEditor } from "./frontmatter-editor";
import { Badge } from "@/components/ui/badge";

type DocData = {
  path: string;
  filename: string;
  frontmatter: Record<string, unknown>;
  content: string;
  links: string[];
  lastModified: string;
};

type DocEditorProps = {
  doc: DocData | null;
  onSave: (frontmatter: Record<string, unknown>, content: string) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function DocEditor({ doc, onSave, onDelete }: DocEditorProps) {
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>({});
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (doc) {
      setFrontmatter(doc.frontmatter);
      setContent(doc.content);
      setDirty(false);
    }
  }, [doc]);

  const handleFrontmatterChange = useCallback((fm: Record<string, unknown>) => {
    setFrontmatter(fm);
    setDirty(true);
  }, []);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    setDirty(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(frontmatter, content);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <div className="text-4xl opacity-20">{"\uD83D\uDCC4"}</div>
          <p className="text-sm">Select a document or create a new one</p>
        </div>
      </div>
    );
  }

  // Simple markdown-to-html for preview (handles headings, bold, links, lists)
  const renderPreview = (md: string) => {
    // Sanitize: strip HTML tags to prevent XSS from stored content
    const safe = md.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return safe
      .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-4 mb-1 text-foreground">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold mt-5 mb-2 text-foreground">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold mt-6 mb-2 text-foreground">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, '<span class="text-primary cursor-pointer">[[$1]]</span>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm text-muted-foreground">$1</li>')
      .replace(/^---$/gm, '<hr class="border-white/10 my-3" />')
      .replace(/\n\n/g, '<div class="h-3"></div>')
      .replace(/\n/g, "<br />");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-muted-foreground truncate">{doc.path}</span>
          {dirty && (
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
              unsaved
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-md border border-white/10 overflow-hidden">
            <button
              onClick={() => setView("edit")}
              className={`px-2.5 py-1 text-xs transition-colors ${
                view === "edit" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setView("preview")}
              className={`px-2.5 py-1 text-xs transition-colors ${
                view === "preview" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Preview
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={onDelete}
          >
            Delete
          </Button>
          <Button size="sm" className="text-xs" onClick={handleSave} disabled={!dirty || saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {view === "edit" ? (
          <>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <FrontmatterEditor frontmatter={frontmatter} onChange={handleFrontmatterChange} />
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Content
              </h4>
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Write your markdown content here..."
              />
            </div>
          </>
        ) : (
          <div
            className="prose prose-invert max-w-none text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
          />
        )}
      </div>
    </div>
  );
}
