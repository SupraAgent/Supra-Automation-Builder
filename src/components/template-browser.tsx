"use client";

import * as React from "react";
import type { ShareableTemplate } from "../core/types";

// ── Props ───────────────────────────────────────────────────────

export interface TemplateBrowserProps {
  templates: ShareableTemplate[];
  onInstall: (template: ShareableTemplate) => void;
  onClose: () => void;
  /** Optional set of installed connector IDs — used to show compatibility badges */
  installedConnectors?: string[];
}

// ── Component ───────────────────────────────────────────────────

export function TemplateBrowser({
  templates,
  onInstall,
  onClose,
  installedConnectors,
}: TemplateBrowserProps) {
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  // Derive unique categories from the templates list
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    for (const t of templates) {
      if (t.category) cats.add(t.category);
    }
    return Array.from(cats).sort();
  }, [templates]);

  // Filter templates by search text + category
  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();

    return templates.filter((t) => {
      // Category filter
      if (activeCategory && t.category !== activeCategory) return false;

      // Text search across name, description, tags
      if (q) {
        const haystack = [
          t.name,
          t.description,
          ...t.tags,
          t.author,
          t.category,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [templates, search, activeCategory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[85vh] rounded-2xl border border-white/10 bg-[#0a0a0f] shadow-2xl overflow-hidden">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between shrink-0 border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Template Library
            </h2>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {filtered.length} template{filtered.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-7 w-7 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
            aria-label="Close template browser"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Search + Filters ────────────────────────────────── */}
        <div className="shrink-0 border-b border-white/10 px-6 py-3 space-y-3">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates by name, tag, or description..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.02] pl-9 pr-3 py-2 text-xs outline-none placeholder:text-muted-foreground/40 focus:border-white/20 transition-colors"
            />
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <CategoryPill
                label="All"
                active={activeCategory === null}
                onClick={() => setActiveCategory(null)}
              />
              {categories.map((cat) => (
                <CategoryPill
                  key={cat}
                  label={cat}
                  active={activeCategory === cat}
                  onClick={() =>
                    setActiveCategory((prev) => (prev === cat ? null : cat))
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Template Grid ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
              <svg
                className="h-10 w-10 mb-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-xs">No templates match your search</p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory(null);
                }}
                className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onInstall={onInstall}
                  installedConnectors={installedConnectors}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Subcomponents ───────────────────────────────────────────────

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        rounded-full px-3 py-1 text-[10px] font-medium transition-colors capitalize
        ${
          active
            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
            : "bg-white/[0.03] text-muted-foreground/60 border border-white/5 hover:bg-white/[0.06] hover:text-muted-foreground"
        }
      `}
    >
      {label}
    </button>
  );
}

function TemplateCard({
  template,
  onInstall,
  installedConnectors,
}: {
  template: ShareableTemplate;
  onInstall: (template: ShareableTemplate) => void;
  installedConnectors?: string[];
}) {
  const installedSet = React.useMemo(
    () => new Set(installedConnectors ?? []),
    [installedConnectors]
  );

  const missingConnectors = React.useMemo(
    () => template.requiredConnectors.filter((c) => !installedSet.has(c)),
    [template.requiredConnectors, installedSet]
  );

  const hasMissing = missingConnectors.length > 0;

  return (
    <div className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-colors">
      {/* Card body */}
      <div className="flex-1 p-4 space-y-2.5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xs font-semibold text-foreground leading-tight line-clamp-2">
            {template.name}
          </h3>
          {template.popularity !== undefined && template.popularity > 0 && (
            <span className="shrink-0 flex items-center gap-0.5 text-[9px] text-muted-foreground/50">
              <svg
                className="h-2.5 w-2.5"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {template.popularity.toLocaleString()}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed line-clamp-3">
          {template.description}
        </p>

        {/* Author + version */}
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground/50">
          <span>{template.author}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
          <span>v{template.version}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
          <span>{template.nodes.length} node{template.nodes.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[9px] text-muted-foreground/60"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 5 && (
              <span className="text-[9px] text-muted-foreground/40 py-0.5">
                +{template.tags.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Required connectors */}
        {template.requiredConnectors.length > 0 && (
          <div className="space-y-1">
            <p className="text-[9px] text-muted-foreground/40">Connectors:</p>
            <div className="flex flex-wrap gap-1">
              {template.requiredConnectors.map((connector) => {
                const isMissing = !installedSet.has(connector);
                return (
                  <span
                    key={connector}
                    className={`rounded-full px-2 py-0.5 text-[9px] border ${
                      isMissing
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400/80"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400/80"
                    }`}
                  >
                    {connector}
                    {isMissing && " (missing)"}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="shrink-0 border-t border-white/[0.06] px-4 py-3">
        <button
          onClick={() => onInstall(template)}
          className={`
            w-full rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors
            ${
              hasMissing
                ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                : "bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/20"
            }
          `}
        >
          {hasMissing ? "Install (missing connectors)" : "Install Template"}
        </button>
      </div>
    </div>
  );
}
