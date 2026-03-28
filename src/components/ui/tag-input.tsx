"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TagInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function TagInput({ value, onChange, placeholder = "Type and press Enter", className }: TagInputProps) {
  const [input, setInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div
      className={cn(
        "flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-xs text-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); remove(i); }}
            className="ml-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            x
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />
    </div>
  );
}
