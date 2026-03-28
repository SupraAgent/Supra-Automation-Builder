"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type Template = {
  label: string;
  description: string;
  templatePath: string;
  defaultDir: string;
  icon: string;
};

const TEMPLATES: Template[] = [
  {
    label: "Persona",
    description: "Expert persona profile with consultation prompts",
    templatePath: "templates/persona_template.md",
    defaultDir: "docs/personas",
    icon: "\uD83E\uDDE0",
  },
  {
    label: "Decision",
    description: "Decision log with persona positions and consensus",
    templatePath: "templates/decision_template.md",
    defaultDir: "docs/decisions",
    icon: "\u2696\uFE0F",
  },
  {
    label: "Blank",
    description: "Empty markdown document with frontmatter",
    templatePath: "",
    defaultDir: "docs",
    icon: "\uD83D\uDCC4",
  },
];

type TemplatePickerProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (templatePath: string, targetPath: string) => void;
};

export function TemplatePicker({ open, onClose, onCreate }: TemplatePickerProps) {
  const [selected, setSelected] = useState<Template | null>(null);
  const [filename, setFilename] = useState("");

  if (!open) return null;

  const handleCreate = () => {
    if (!selected || !filename.trim()) return;
    const safeName = filename.trim().toLowerCase().replace(/\s+/g, "-").replace(/\.md$/, "");
    const targetPath = `${selected.defaultDir}/${safeName}.md`;
    onCreate(selected.templatePath, targetPath);
    setSelected(null);
    setFilename("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground">New Document</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!selected ? (
          <div className="space-y-2">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.label}
                onClick={() => setSelected(tmpl)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 transition-all text-left"
              >
                <span className="text-xl">{tmpl.icon}</span>
                <div>
                  <div className="text-sm font-medium text-foreground">{tmpl.label}</div>
                  <div className="text-xs text-muted-foreground">{tmpl.description}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{selected.icon}</span>
              <span>{selected.label}</span>
              <span className="text-xs opacity-60">{"\u2192"} {selected.defaultDir}/</span>
            </div>
            <Input
              autoFocus
              placeholder="filename (without .md)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Back
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={!filename.trim()}>
                Create
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
