"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type DynamicListProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  addLabel?: string;
};

export function DynamicList({
  value,
  onChange,
  placeholder = "Enter item...",
  addLabel = "Add item",
}: DynamicListProps) {
  function add() {
    onChange([...value, ""]);
  }

  function update(index: number, text: string) {
    const next = [...value];
    next[index] = text;
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (value[index]?.trim()) {
        add();
        // Focus the new input after render
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>(`[data-list-input]`);
          inputs[inputs.length - 1]?.focus();
        }, 0);
      }
    }
    if (e.key === "Backspace" && !value[index] && value.length > 1) {
      e.preventDefault();
      remove(index);
    }
  }

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{i + 1}.</span>
          <input
            data-list-input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            placeholder={placeholder}
            className="h-9 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition hover:border-white/15 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-muted-foreground hover:text-red-400 text-xs px-1 cursor-pointer"
          >
            remove
          </button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={add} className="text-xs">
        + {addLabel}
      </Button>
    </div>
  );
}
