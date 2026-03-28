"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import {
  EMPTY_CONFIG,
  MODELS,
  generateMockEvaluation,
  generateMockChecklist,
  generateResultsMarkdown,
  type ResearchConfig,
  type ResearchResults,
  type ResearchMode,
  type ComputeBackend,
  type ModelOption,
} from "@/lib/auto-research";

type PersonaRow = {
  id: string;
  name: string;
  system_prompt: string;
  capabilities: string[];
  icon: string | null;
};

function download(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ResearchPage() {
  const { user } = useAuth();
  const [config, setConfig] = React.useState<ResearchConfig>(EMPTY_CONFIG);
  const [personas, setPersonas] = React.useState<PersonaRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [results, setResults] = React.useState<ResearchResults | null>(null);

  React.useEffect(() => {
    if (!user) return;
    fetch("/api/personas")
      .then((r) => r.json())
      .then((data) => {
        setPersonas(data.personas ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  function togglePersona(id: string) {
    setConfig((prev) => ({
      ...prev,
      selectedPersonaIds: prev.selectedPersonaIds.includes(id)
        ? prev.selectedPersonaIds.filter((pid) => pid !== id)
        : [...prev.selectedPersonaIds, id],
    }));
  }

  function selectAll() {
    setConfig((prev) => ({
      ...prev,
      selectedPersonaIds: personas.map((p) => p.id),
    }));
  }

  async function runResearch() {
    setRunning(true);
    setResults(null);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const selectedPersonas = personas.filter((p) =>
      config.selectedPersonaIds.includes(p.id)
    );

    const res: ResearchResults = {
      mode: config.mode,
      evaluations: [],
      checklists: [],
      summary: "",
    };

    if (config.mode === "team_evaluation") {
      res.evaluations = selectedPersonas.map((p) =>
        generateMockEvaluation(p, config.projectContext)
      );
      const avgScore =
        res.evaluations.length > 0
          ? Math.round(
              res.evaluations.reduce((s, e) => s + e.overallScore, 0) /
                res.evaluations.length
            )
          : 0;
      res.summary = `Team average score: ${avgScore}/100 across ${res.evaluations.length} persona${res.evaluations.length !== 1 ? "s" : ""}. ${avgScore >= 80 ? "Strong team composition with good coverage." : "Consider strengthening personas with lower scores."}`;
    } else {
      res.checklists = selectedPersonas.map((p) => generateMockChecklist(p));
      const avgPass =
        res.checklists.length > 0
          ? Math.round(
              res.checklists.reduce((s, c) => s + c.passRate, 0) /
                res.checklists.length
            )
          : 0;
      res.summary = `Average pass rate: ${avgPass}% across ${res.checklists.length} persona${res.checklists.length !== 1 ? "s" : ""}. ${avgPass >= 70 ? "Most personas meet quality standards." : "Several personas need improvement — review failed checks."}`;
    }

    setResults(res);
    setRunning(false);
  }

  const canRun = config.selectedPersonaIds.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Auto-Research</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Score, evaluate, and improve your personas with AI analysis.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left Panel — Configuration */}
        <div className="col-span-2 space-y-6">
          {/* Mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Evaluation Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    id: "team_evaluation" as ResearchMode,
                    label: "Team Evaluation",
                    desc: "Score on 5 metrics + gap analysis",
                  },
                  {
                    id: "checklist_scoring" as ResearchMode,
                    label: "Checklist",
                    desc: "Yes/no quality checklist",
                  },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setConfig((prev) => ({ ...prev, mode: m.id }))}
                  className={`rounded-xl border p-3 text-left transition ${
                    config.mode === m.id
                      ? "border-primary/60 bg-primary/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="text-sm font-medium text-foreground">{m.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Backend */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Compute Backend</label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "claude_api" as ComputeBackend, label: "Claude API", desc: "Cloud — best quality" },
                  { id: "ollama" as ComputeBackend, label: "Ollama", desc: "Local GPU — free, private" },
                ] as const
              ).map((b) => (
                <button
                  key={b.id}
                  onClick={() => setConfig((prev) => ({ ...prev, backend: b.id }))}
                  className={`rounded-xl border p-3 text-left transition ${
                    config.backend === b.id
                      ? "border-primary/60 bg-primary/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="text-sm font-medium text-foreground">{b.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key / Ollama URL */}
          {config.backend === "claude_api" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">API Key</label>
              <Input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                placeholder="sk-ant-..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ollama URL</label>
              <Input
                value={config.ollamaUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, ollamaUrl: e.target.value }))}
                placeholder="http://localhost:11434"
              />
            </div>
          )}

          {/* Model */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Model</label>
            <div className="flex gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setConfig((prev) => ({ ...prev, model: m.id }))}
                  className={`flex-1 rounded-xl border p-2 text-center transition ${
                    config.model === m.id
                      ? "border-primary/60 bg-primary/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="text-xs font-medium text-foreground">{m.label}</div>
                  <div className="text-[10px] text-muted-foreground">{m.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Project Context */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project Context</label>
            <Textarea
              value={config.projectContext}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, projectContext: e.target.value }))
              }
              placeholder="Describe your project so evaluations are context-aware..."
              rows={3}
            />
          </div>

          {/* Persona Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Personas</label>
              {personas.length > 0 && (
                <button
                  onClick={selectAll}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  Select all
                </button>
              )}
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg border border-white/10 bg-white/[0.02]" />
                ))}
              </div>
            ) : personas.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center text-sm text-muted-foreground">
                No personas found. Create personas first, then come back to evaluate them.
              </div>
            ) : (
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {personas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePersona(p.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition ${
                      config.selectedPersonaIds.includes(p.id)
                        ? "border-primary/30 bg-primary/5 text-foreground"
                        : "border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-base">{p.icon || "\u{1F916}"}</span>
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Run Button */}
          <Button onClick={runResearch} disabled={!canRun || running} className="w-full">
            {running ? "Running..." : "Run Auto-Research"}
          </Button>
        </div>

        {/* Right Panel — Results */}
        <div className="col-span-3">
          {!results && !running && (
            <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-12">
              <div className="text-center">
                <div className="text-3xl">{"\u{1F50D}"}</div>
                <h3 className="mt-3 text-sm font-medium text-foreground">
                  No results yet
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Select personas and run Auto-Research to see evaluations.
                </p>
              </div>
            </div>
          )}

          {running && (
            <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-12">
              <div className="text-center">
                <div className="text-3xl animate-spin">{"\u2699\uFE0F"}</div>
                <h3 className="mt-3 text-sm font-medium text-foreground">
                  Evaluating personas...
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Analyzing {config.selectedPersonaIds.length} persona{config.selectedPersonaIds.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {results && !running && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-sm text-foreground">{results.summary}</p>
              </div>

              {/* Team Evaluation Results */}
              {results.mode === "team_evaluation" &&
                results.evaluations.map((ev) => (
                  <div
                    key={ev.personaId}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ev.personaIcon}</span>
                        <span className="font-medium text-foreground">{ev.personaName}</span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ev.overallScore >= 85
                            ? "bg-green-500/10 text-green-400"
                            : ev.overallScore >= 70
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {ev.overallScore}/100
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-2">
                      {ev.metrics.map((m) => (
                        <div key={m.name}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{m.name}</span>
                            <span className="text-foreground">{m.score}</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-white/5">
                            <div
                              className={`h-full rounded-full ${
                                m.score >= 85
                                  ? "bg-green-500"
                                  : m.score >= 70
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${m.score}%` }}
                            />
                          </div>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {m.reasoning}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-medium text-green-400 mb-1">Strengths</p>
                        {ev.strengths.map((s, i) => (
                          <p key={i} className="text-muted-foreground">
                            {"\u2022"} {s}
                          </p>
                        ))}
                      </div>
                      <div>
                        <p className="font-medium text-yellow-400 mb-1">Improvements</p>
                        {ev.improvements.map((im, i) => (
                          <p key={i} className="text-muted-foreground">
                            {"\u2022"} {im}
                          </p>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground italic">{ev.gapAnalysis}</p>
                  </div>
                ))}

              {/* Checklist Results */}
              {results.mode === "checklist_scoring" &&
                results.checklists.map((cl) => (
                  <div
                    key={cl.personaId}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cl.personaIcon}</span>
                        <span className="font-medium text-foreground">{cl.personaName}</span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          cl.passRate >= 80
                            ? "bg-green-500/10 text-green-400"
                            : cl.passRate >= 60
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {cl.passRate}% pass
                      </span>
                    </div>

                    <div className="space-y-1">
                      {cl.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className={
                              item.pass ? "text-green-400" : "text-red-400"
                            }
                          >
                            {item.pass ? "\u2713" : "\u2717"}
                          </span>
                          <span className="text-foreground">{item.item}</span>
                          <span className="text-muted-foreground">
                            — {item.note}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              {/* Download */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  download(
                    generateResultsMarkdown(results),
                    "auto-research-results.md"
                  )
                }
              >
                Download results as .md
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
