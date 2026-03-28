"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type FrontmatterEditorProps = {
  frontmatter: Record<string, unknown>;
  onChange: (fm: Record<string, unknown>) => void;
};

export function FrontmatterEditor({ frontmatter, onChange }: FrontmatterEditorProps) {
  const [newKey, setNewKey] = useState("");

  const updateField = (key: string, value: unknown) => {
    onChange({ ...frontmatter, [key]: value });
  };

  const removeField = (key: string) => {
    const next = { ...frontmatter };
    delete next[key];
    onChange(next);
  };

  const addField = () => {
    if (newKey.trim() && !(newKey.trim() in frontmatter)) {
      onChange({ ...frontmatter, [newKey.trim()]: "" });
      setNewKey("");
    }
  };

  const renderValue = (key: string, value: unknown) => {
    if (Array.isArray(value)) {
      return (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1">
            {value.map((item, i) => (
              <Badge key={i} className="gap-1">
                {String(item)}
                <button
                  onClick={() =>
                    updateField(
                      key,
                      value.filter((_, j) => j !== i)
                    )
                  }
                  className="ml-0.5 hover:text-foreground"
                >
                  x
                </button>
              </Badge>
            ))}
          </div>
          <Input
            placeholder={`Add to ${key}...`}
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const v = (e.target as HTMLInputElement).value.trim();
                if (v) {
                  updateField(key, [...value, v]);
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
          />
        </div>
      );
    }

    return (
      <Input
        value={String(value ?? "")}
        onChange={(e) => updateField(key, e.target.value)}
        className="h-8 text-xs"
      />
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Frontmatter
        </h4>
      </div>

      <div className="space-y-2.5">
        {Object.entries(frontmatter).map(([key, value]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground">{key}</label>
              <button
                onClick={() => removeField(key)}
                className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
              >
                remove
              </button>
            </div>
            {renderValue(key, value)}
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2 border-t border-white/5">
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="New field name..."
          className="h-8 text-xs flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addField();
            }
          }}
        />
        <Button variant="ghost" size="sm" onClick={addField} className="h-8 text-xs">
          Add
        </Button>
      </div>
    </div>
  );
}
