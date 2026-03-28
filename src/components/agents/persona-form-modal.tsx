"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CAPABILITIES, OUTPUT_FORMATS } from "@/lib/personas";
import { REVIEW_TYPES } from "@/lib/reviews";
import type { Persona, PersonaOutputFormat } from "@/lib/personas";

const SCORING_DIMENSIONS = [
  { key: "build_health", label: "Build Health", max: 25 },
  { key: "change_coherence", label: "Change Coherence", max: 20 },
  { key: "code_quality", label: "Code Quality", max: 20 },
  { key: "ux_quality", label: "UX Quality", max: 20 },
  { key: "scope_control", label: "Scope Control", max: 10 },
  { key: "commit_discipline", label: "Commit Discipline", max: 5 },
];

type FormData = {
  name: string;
  role: string;
  icon: string;
  systemPrompt: string;
  capabilities: string[];
  outputFormat: PersonaOutputFormat | "";
  reviewFocus: string[];
  scoringWeights: Record<string, number>;
};

function emptyForm(): FormData {
  return {
    name: "",
    role: "",
    icon: "",
    systemPrompt: "",
    capabilities: [],
    outputFormat: "",
    reviewFocus: [],
    scoringWeights: {},
  };
}

function personaToForm(p: Persona, copyMode: boolean): FormData {
  return {
    name: copyMode ? `Custom: ${p.name}` : p.name,
    role: p.role,
    icon: p.icon ?? "",
    systemPrompt: p.systemPrompt,
    capabilities: [...p.capabilities],
    outputFormat: (p.outputFormat as PersonaOutputFormat) ?? "",
    reviewFocus: [...p.reviewFocus],
    scoringWeights: { ...(p.scoringWeights ?? {}) },
  };
}

export function PersonaFormModal({
  persona,
  copyMode,
  onSave,
  onClose,
}: {
  persona?: Persona;
  copyMode?: boolean;
  onSave: (data: {
    name: string;
    role: string;
    icon: string;
    systemPrompt: string;
    capabilities: string[];
    outputFormat: string | null;
    reviewFocus: string[];
    scoringWeights: Record<string, number> | null;
    id?: string;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const isEdit = !!persona && !copyMode;
  const [form, setForm] = React.useState<FormData>(
    persona ? personaToForm(persona, !!copyMode) : emptyForm()
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showWeights, setShowWeights] = React.useState(
    Object.keys(form.scoringWeights).length > 0
  );

  const toggleCapability = (value: string) => {
    setForm((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(value)
        ? prev.capabilities.filter((c) => c !== value)
        : [...prev.capabilities, value],
    }));
  };

  const toggleReviewFocus = (value: string) => {
    setForm((prev) => ({
      ...prev,
      reviewFocus: prev.reviewFocus.includes(value)
        ? prev.reviewFocus.filter((r) => r !== value)
        : [...prev.reviewFocus, value],
    }));
  };

  const setWeight = (key: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      scoringWeights: { ...prev.scoringWeights, [key]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim() || !form.systemPrompt.trim()) {
      setError("Name, role, and system prompt are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const weightsToSave = Object.keys(form.scoringWeights).length > 0 ? form.scoringWeights : null;
      await onSave({
        name: form.name.trim(),
        role: form.role.trim(),
        icon: form.icon.trim() || "🤖",
        systemPrompt: form.systemPrompt.trim(),
        capabilities: form.capabilities,
        outputFormat: form.outputFormat || null,
        reviewFocus: form.reviewFocus,
        scoringWeights: weightsToSave,
        ...(isEdit ? { id: persona.id } : {}),
      });
    } catch {
      setError("Failed to save persona");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[hsl(var(--background))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-sm font-medium text-foreground">
            {isEdit ? "Edit persona" : copyMode ? "Copy & customize persona" : "Create persona"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name + Icon row */}
          <div className="flex gap-3">
            <div className="w-16">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Icon</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                placeholder="🤖"
                maxLength={4}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center text-lg text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. CEO Reviewer"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Role *</label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              placeholder="e.g. Strategic alignment, ROI, user impact"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
          </div>

          {/* System prompt */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              System prompt * <span className="text-muted-foreground/60">({form.systemPrompt.length}/2000)</span>
            </label>
            <textarea
              value={form.systemPrompt}
              onChange={(e) => setForm((p) => ({ ...p, systemPrompt: e.target.value }))}
              placeholder="You review code changes from a ... perspective. Focus on ..."
              rows={8}
              maxLength={2000}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-y"
            />
          </div>

          {/* Capabilities */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Capabilities</label>
            <div className="flex flex-wrap gap-2">
              {CAPABILITIES.map((cap) => (
                <button
                  key={cap.value}
                  type="button"
                  onClick={() => toggleCapability(cap.value)}
                  className={
                    form.capabilities.includes(cap.value)
                      ? "rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                      : "rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground hover:border-white/20"
                  }
                >
                  {cap.label}
                </button>
              ))}
            </div>
          </div>

          {/* Output format */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Output format</label>
            <select
              value={form.outputFormat}
              onChange={(e) => setForm((p) => ({ ...p, outputFormat: e.target.value as PersonaOutputFormat | "" }))}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none"
            >
              <option value="">None</option>
              {OUTPUT_FORMATS.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
              ))}
            </select>
          </div>

          {/* Review focus */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Review focus</label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TYPES.map((rt) => (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => toggleReviewFocus(rt.value)}
                  className={
                    form.reviewFocus.includes(rt.value)
                      ? "rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
                      : "rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground hover:border-white/20"
                  }
                  title={rt.description}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scoring weights (collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowWeights(!showWeights)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {showWeights ? "−" : "+"} Scoring weight overrides
            </button>
            {showWeights && (
              <div className="mt-3 space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[11px] text-muted-foreground">
                  Default weight is 1.0. Higher values increase emphasis, lower values decrease it.
                </p>
                {SCORING_DIMENSIONS.map((dim) => (
                  <div key={dim.key} className="flex items-center gap-3">
                    <span className="w-36 text-xs text-muted-foreground">{dim.label} (0-{dim.max})</span>
                    <input
                      type="range"
                      min={0.1}
                      max={3.0}
                      step={0.1}
                      value={form.scoringWeights[dim.key] ?? 1.0}
                      onChange={(e) => setWeight(dim.key, parseFloat(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="w-8 text-right text-xs text-foreground">
                      {(form.scoringWeights[dim.key] ?? 1.0).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update persona" : "Create persona"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
