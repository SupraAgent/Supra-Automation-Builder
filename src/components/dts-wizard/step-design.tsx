"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateDesignSystem, type DesignToShipDraft } from "@/lib/design-to-ship";

type Props = {
  draft: DesignToShipDraft;
  onChange: (patch: Partial<DesignToShipDraft>) => void;
};

export function StepDesign({ draft, onChange }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!draft.designSystem) {
      onChange({ designSystem: generateDesignSystem(draft) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function regenerate() {
    onChange({ designSystem: generateDesignSystem(draft) });
    setEditing(false);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(draft.designSystem);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Design System</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Generated from your atmosphere and team. Edit or regenerate as needed.
        </p>
      </div>

      {/* Preview/Edit */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        {editing ? (
          <Textarea
            value={draft.designSystem}
            onChange={(e) => onChange({ designSystem: e.target.value })}
            rows={20}
            className="font-mono text-xs"
          />
        ) : (
          <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap text-xs text-muted-foreground font-mono leading-relaxed">
            {draft.designSystem || "Generating..."}
          </pre>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={copyToClipboard}>
          {copied ? "Copied!" : "Copy to clipboard"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Preview" : "Edit"}
        </Button>
        <Button variant="ghost" size="sm" onClick={regenerate}>
          Regenerate
        </Button>
      </div>
    </div>
  );
}
