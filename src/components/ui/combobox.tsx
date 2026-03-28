"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
};

export function Combobox({
  value,
  onChange,
  suggestions,
  placeholder = "Search or type...",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const ref = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listboxId = React.useId();

  const filtered = React.useMemo(() => {
    if (!search) return suggestions.slice(0, 12);
    const q = search.toLowerCase();
    return suggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, 12);
  }, [search, suggestions]);

  const hasCustomOption = search.trim() !== "" && !filtered.some((f) => f.toLowerCase() === search.toLowerCase());
  const totalOptions = filtered.length + (hasCustomOption ? 1 : 0);

  React.useEffect(() => { setActiveIndex(-1); }, [search]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function select(item: string) {
    onChange(item);
    setSearch("");
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) { setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); if (totalOptions > 0) setActiveIndex((p) => (p + 1) % totalOptions); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (totalOptions > 0) setActiveIndex((p) => (p <= 0 ? totalOptions - 1 : p - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) select(filtered[activeIndex]);
      else if (activeIndex === filtered.length && hasCustomOption) select(search.trim());
      else if (search.trim()) select(search.trim());
    } else if (e.key === "Escape") { setOpen(false); setActiveIndex(-1); }
  }

  const activeDescendant = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  React.useEffect(() => {
    if (activeIndex >= 0) {
      document.getElementById(`${listboxId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, listboxId]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={activeDescendant}
        value={open ? search : value}
        onChange={(e) => { setSearch(e.target.value); if (!open) setOpen(true); }}
        onFocus={() => { setOpen(true); setSearch(value); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-foreground placeholder:text-muted-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur outline-none transition hover:border-white/15 focus:border-primary/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/15"
      />
      {open && (filtered.length > 0 || hasCustomOption) && (
        <ul id={listboxId} role="listbox" className="absolute z-50 mt-1 w-full max-h-[240px] overflow-y-auto rounded-xl border border-white/10 bg-card shadow-lg">
          {filtered.map((item, i) => (
            <li key={item} id={`${listboxId}-option-${i}`} role="option" aria-selected={i === activeIndex}
              onMouseDown={(e) => e.preventDefault()} onClick={() => select(item)}
              className={cn("w-full px-3 py-2 text-left text-sm transition cursor-pointer",
                i === activeIndex ? "bg-primary/10 text-primary" : item === value ? "bg-white/5 text-primary" : "text-foreground hover:bg-white/5"
              )}>{item}</li>
          ))}
          {hasCustomOption && (
            <li id={`${listboxId}-option-${filtered.length}`} role="option" aria-selected={activeIndex === filtered.length}
              onMouseDown={(e) => e.preventDefault()} onClick={() => select(search.trim())}
              className={cn("w-full px-3 py-2 text-left text-sm cursor-pointer border-t border-white/5",
                activeIndex === filtered.length ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5"
              )}>Use &quot;{search}&quot;</li>
          )}
        </ul>
      )}
    </div>
  );
}

type ComboboxTagsProps = {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
};

export function ComboboxTags({
  value, onChange, suggestions,
  placeholder = "Search or type and press Enter...",
  className,
}: ComboboxTagsProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const ref = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listboxId = React.useId();

  const available = React.useMemo(() => {
    const existing = new Set(value.map((v) => v.toLowerCase()));
    const pool = suggestions.filter((s) => !existing.has(s.toLowerCase()));
    if (!search) return pool.slice(0, 10);
    const q = search.toLowerCase();
    return pool.filter((s) => s.toLowerCase().includes(q)).slice(0, 10);
  }, [search, suggestions, value]);

  const hasCustomOption = search.trim() !== "" && !available.some((a) => a.toLowerCase() === search.toLowerCase()) && !value.some((v) => v.toLowerCase() === search.toLowerCase());
  const totalOptions = available.length + (hasCustomOption ? 1 : 0);

  React.useEffect(() => { setActiveIndex(-1); }, [search]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function add(item: string) {
    if (!value.some((v) => v.toLowerCase() === item.toLowerCase())) onChange([...value, item]);
    setSearch(""); setActiveIndex(-1);
  }

  function remove(index: number) { onChange(value.filter((_, i) => i !== index)); }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) { setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); if (totalOptions > 0) setActiveIndex((p) => (p + 1) % totalOptions); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (totalOptions > 0) setActiveIndex((p) => (p <= 0 ? totalOptions - 1 : p - 1)); }
    else if (e.key === "Enter" && (activeIndex >= 0 || search.trim())) {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < available.length) add(available[activeIndex]);
      else if (activeIndex === available.length && hasCustomOption) add(search.trim());
      else if (search.trim()) add(search.trim());
    } else if (e.key === "Backspace" && !search && value.length > 0) { onChange(value.slice(0, -1)); }
    else if (e.key === "Escape") { setOpen(false); setActiveIndex(-1); }
  }

  const activeDescendant = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  React.useEffect(() => {
    if (activeIndex >= 0) {
      document.getElementById(`${listboxId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, listboxId]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15"
        onClick={() => inputRef.current?.focus()}>
        {value.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-xs text-foreground">
            {tag}
            <button type="button" onClick={(e) => { e.stopPropagation(); remove(i); }} aria-label={`Remove ${tag}`}
              className="ml-0.5 text-muted-foreground hover:text-foreground cursor-pointer">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input ref={inputRef} role="combobox" aria-expanded={open} aria-haspopup="listbox"
          aria-controls={open ? listboxId : undefined} aria-autocomplete="list" aria-activedescendant={activeDescendant}
          value={search} onChange={(e) => { setSearch(e.target.value); if (!open) setOpen(true); }}
          onFocus={() => setOpen(true)} onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
      </div>
      {open && (available.length > 0 || hasCustomOption) && (
        <ul id={listboxId} role="listbox" className="absolute z-50 mt-1 w-full max-h-[200px] overflow-y-auto rounded-xl border border-white/10 bg-card shadow-lg">
          {available.map((item, i) => (
            <li key={item} id={`${listboxId}-option-${i}`} role="option" aria-selected={i === activeIndex}
              onMouseDown={(e) => e.preventDefault()} onClick={() => add(item)}
              className={cn("w-full px-3 py-2 text-left text-sm cursor-pointer",
                i === activeIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
              )}>{item}</li>
          ))}
          {hasCustomOption && (
            <li id={`${listboxId}-option-${available.length}`} role="option" aria-selected={activeIndex === available.length}
              onMouseDown={(e) => e.preventDefault()} onClick={() => add(search.trim())}
              className={cn("w-full px-3 py-2 text-left text-sm cursor-pointer border-t border-white/5",
                activeIndex === available.length ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5"
              )}>Add &quot;{search}&quot;</li>
          )}
        </ul>
      )}
    </div>
  );
}
