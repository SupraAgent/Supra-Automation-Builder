"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AutoResearchResult, PersonaScorecard, TeamGap } from "@/lib/auto-research";
import {
  exportResearchToJson,
  exportResearchToMarkdown,
  exportResearchToCsv,
} from "@/lib/auto-research";

type PersonaInput = {
  name: string;
  role: string;
  company: string;
  systemPrompt: string;
  style?: string;
};

type SavedPersona = {
  id: string;
  name: string;
  role: string;
  system_prompt: string;
  capabilities: string[];
  icon: string | null;
};

const MODEL_BADGES: Record<string, string> = {
  "claude-sonnet-4-6": "Recommended",
  "claude-haiku-4-5": "Fast",
  "claude-opus-4-6": "Deepest",
};

export function ResearchPanel() {
  const [backend, setBackend] = React.useState<"anthropic" | "ollama">("anthropic");
  const [model, setModel] = React.useState("claude-sonnet-4-6");
  const [projectContext, setProjectContext] = React.useState("");
  const [sampleDecision, setSampleDecision] = React.useState("");
  const [personas, setPersonas] = React.useState<PersonaInput[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingLibrary, setLoadingLibrary] = React.useState(false);
  const [libraryFeedback, setLibraryFeedback] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<AutoResearchResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showHistory, setShowHistory] = React.useState(false);
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem("autoresearch-history") || "[]"));
    } catch {
      setHistory([]);
    }
  }, []);

  React.useEffect(() => {
    if (result) {
      try {
        const hist = JSON.parse(localStorage.getItem("autoresearch-history") || "[]");
        hist.unshift({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          projectContext: projectContext.substring(0, 100),
          teamScore: result.teamScore,
          personaCount: result.scorecards.length,
          gapCount: result.gaps.length,
          result,
        });
        // Keep last 20 runs
        const trimmed = hist.slice(0, 20);
        localStorage.setItem("autoresearch-history", JSON.stringify(trimmed));
        setHistory(trimmed);
      } catch {
        // localStorage unavailable (private browsing)
      }
    }
  }, [result]);

  async function loadFromLibrary() {
    setLoadingLibrary(true);
    setLibraryFeedback(null);
    try {
      const res = await fetch("/api/personas");
      const data = await res.json();
      const personaList = data.personas?.length ? data.personas : Array.isArray(data) ? data : [];
      if (personaList.length) {
        const loaded = personaList.map((p: any) => ({
          name: p.name || "",
          role: p.role || p.title || "",
          company: p.company || (typeof p.role === "string" && p.role.includes(" at ") ? p.role.split(" at ")[1] : ""),
          systemPrompt: p.system_prompt || "",
          style: "",
        }));
        setPersonas(loaded);
        setLibraryFeedback(`Loaded ${loaded.length} persona${loaded.length === 1 ? "" : "s"} from library`);
        setTimeout(() => setLibraryFeedback(null), 3000);
      } else {
        setLibraryFeedback("No personas found in library");
        setTimeout(() => setLibraryFeedback(null), 3000);
      }
    } catch (e) {
      console.error("Failed to load personas", e);
      setLibraryFeedback("Failed to load personas");
      setTimeout(() => setLibraryFeedback(null), 3000);
    }
    setLoadingLibrary(false);
  }

  // Saved personas from library
  const [savedPersonas, setSavedPersonas] = React.useState<SavedPersona[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [loadingPersonas, setLoadingPersonas] = React.useState(true);

  React.useEffect(() => {
    async function fetchPersonas() {
      try {
        const res = await fetch("/api/personas");
        if (res.ok) {
          const data = await res.json();
          setSavedPersonas(data);
        }
      } catch {
        // silently fail — user can still create personas
      } finally {
        setLoadingPersonas(false);
      }
    }
    fetchPersonas();
  }, []);

  function togglePersona(p: SavedPersona) {
    const next = new Set(selectedIds);
    if (next.has(p.id)) {
      next.delete(p.id);
      setPersonas((prev) => prev.filter((x) => x.name !== p.name || x.role !== p.role));
    } else {
      next.add(p.id);
      setPersonas((prev) => [
        ...prev,
        { name: p.name, role: p.role, company: "", systemPrompt: p.system_prompt, style: "" },
      ]);
    }
    setSelectedIds(next);
  }

  async function runResearch() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backend,
          model,
          projectContext,
          personas: personas.filter((p) => p.name && p.role),
          sampleDecision: sampleDecision || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data: AutoResearchResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Backend Selection */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Compute Backend</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose where to run the research — Claude API (cloud) or Ollama (your GPU).
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { setBackend("anthropic"); setModel("claude-sonnet-4-6"); }}
            className={`rounded-xl border p-4 text-left transition cursor-pointer ${
              backend === "anthropic"
                ? "border-primary/60 bg-primary/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <div className="text-sm font-medium text-foreground">Claude API</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Best quality. Requires ANTHROPIC_API_KEY in .env.local
            </div>
          </button>
          <button
            type="button"
            onClick={() => { setBackend("ollama"); setModel("llama3.1"); }}
            className={`rounded-xl border p-4 text-left transition cursor-pointer ${
              backend === "ollama"
                ? "border-primary/60 bg-primary/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <div className="text-sm font-medium text-foreground">Ollama (Local GPU)</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Free, private. Requires Ollama running locally.
            </div>
          </button>
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Model</label>
          {backend === "anthropic" ? (
            <div className="flex gap-2">
              {(["claude-sonnet-4-6", "claude-haiku-4-5", "claude-opus-4-6"] as const).map((m) => {
                const badgeLabel = MODEL_BADGES[m];
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModel(m)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                      model === m
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    {m.replace("claude-", "").replace("-4-6", " 4.6").replace("-4-5", " 4.5")}
                    {badgeLabel && (
                      <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                        badgeLabel === "Recommended" ? "bg-green-500/20 text-green-400" :
                        badgeLabel === "Fast" ? "bg-blue-500/20 text-blue-400" :
                        "bg-purple-500/20 text-purple-400"
                      }`}>
                        {badgeLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {["llama3.1", "llama3.1:70b", "mistral", "mixtral", "qwen2.5"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    model === m
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Context */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Project Context</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe the project so the research can evaluate personas against it.
        </p>
        <Textarea
          value={projectContext}
          onChange={(e) => setProjectContext(e.target.value)}
          placeholder="e.g. A mobile-first learning app for language learners. Target market: 18-35 year olds. Competing with Duolingo and Babbel. Freemium model with premium subscription."
          className="mt-3 min-h-[100px]"
        />
      </div>

      {/* Personas */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Personas to Evaluate</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select personas from your library — the research will score, find gaps, and suggest improvements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={loadFromLibrary} disabled={loadingLibrary}>
              {loadingLibrary ? "Loading..." : "Load from Library"}
            </Button>
            {libraryFeedback && (
              <span className="text-xs text-green-400 animate-pulse">{libraryFeedback}</span>
            )}
            <Link href="/personas">
              <Button variant="ghost" size="sm" className="text-xs">
                + Create New Persona
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-3">
          {loadingPersonas ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <span className="text-sm text-muted-foreground animate-pulse">Loading personas...</span>
            </div>
          ) : savedPersonas.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center space-y-3">
              <div className="text-sm text-muted-foreground">
                No personas yet. Create one to get started.
              </div>
              <Link href="/personas">
                <Button size="sm">Create Your First Persona</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savedPersonas.map((p) => {
                const selected = selectedIds.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePersona(p)}
                    className={`rounded-xl border p-4 text-left transition cursor-pointer ${
                      selected
                        ? "border-primary/60 bg-primary/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selected && (
                        <svg className="h-4 w-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {p.icon && <span className="mr-1.5">{p.icon}</span>}
                        {p.name}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{p.role}</div>
                    {p.system_prompt && (
                      <div className="mt-1.5 text-xs text-muted-foreground/60 line-clamp-2">
                        {p.system_prompt}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sample Decision (Promoted) */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold text-white/70">Sample Decision</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">Recommended</span>
        </div>
        <p className="text-xs text-white/40 mb-2">See how your team would debate a real decision</p>
        <Textarea
          value={sampleDecision}
          onChange={(e) => setSampleDecision(e.target.value)}
          placeholder="e.g., Should we use SSR or CSR for the main app?"
          className="bg-white/5 border-white/10 text-sm"
        />
      </div>

      {/* Run Button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={runResearch}
          disabled={loading || !projectContext || personas.filter((p) => p.name && p.role).length === 0}
          size="lg"
        >
          {loading ? "Running Research..." : "Run Auto-Research"}
        </Button>
        {loading && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Calling {backend === "anthropic" ? "Claude API" : "Ollama"} — this may take 30-60s...
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="text-sm font-medium text-red-400">Error</div>
          <div className="mt-1 text-xs text-red-300">{error}</div>
        </div>
      )}

      {/* Results */}
      {result && <ResearchResults result={result} />}

      {/* Evaluation History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 mt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full text-sm font-semibold text-white/70 flex items-center gap-1"
          >
            {showHistory ? "\u25BC" : "\u25B6"} Evaluation History ({history.length} runs)
          </button>
          {showHistory && (
            <>
              <div className="mt-3 space-y-2">
                {history.map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between text-xs text-white/50 py-1 border-b border-white/5">
                    <span>{new Date(h.timestamp).toLocaleDateString()}</span>
                    <span className="truncate max-w-[200px]">{h.projectContext}...</span>
                    <span className={`font-mono ${h.teamScore >= 80 ? "text-green-400" : h.teamScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                      {h.teamScore}
                    </span>
                    <span>{h.personaCount} personas</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="mt-2 text-xs text-white/30" onClick={() => {
                try { localStorage.removeItem("autoresearch-history"); } catch {}
                setHistory([]);
              }}>
                Clear History
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResearchResults({ result }: { result: AutoResearchResult }) {
  const [copied, setCopied] = React.useState(false);

  function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadJson() {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    downloadFile(exportResearchToJson(result), `team-evaluation-${ts}.json`, "application/json");
  }

  function handleDownloadMarkdown() {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    downloadFile(exportResearchToMarkdown(result), `team-evaluation-${ts}.md`, "text/markdown");
  }

  function handleCopySummary() {
    const personaLines = result.scorecards
      .map((c) => `  ${c.personaName}: ${c.overall}/100`)
      .join("\n");
    const summary = `Team Score: ${result.teamScore}/100\n\nPersonas:\n${personaLines}`;
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-6 border-t border-white/10 pt-6">
      {/* Team Score */}
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
          <span className={`text-3xl font-bold ${scoreColor(result.teamScore)}`}>
            {result.teamScore}
          </span>
        </div>
        <div>
          <div className="text-lg font-semibold text-foreground">Team Score</div>
          <div className="text-sm text-muted-foreground">
            Average across all personas ({result.scorecards.length} evaluated)
          </div>
        </div>
      </div>

      {/* Individual Scorecards */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Individual Scorecards</h3>
        <div className="space-y-3">
          {result.scorecards.map((card) => (
            <ScorecardCard key={card.personaName} card={card} />
          ))}
        </div>
      </div>

      {/* Gaps */}
      {result.gaps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Team Gaps</h3>
          <div className="space-y-2">
            {result.gaps.map((gap, i) => (
              <GapCard key={i} gap={gap} />
            ))}
          </div>
        </div>
      )}

      {/* Consensus Simulation */}
      {result.consensusSimulation && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Consensus Simulation</h3>
          <ConsensusCard sim={result.consensusSimulation} />
        </div>
      )}

      {/* Export Bar */}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <span className="text-xs font-medium text-muted-foreground mr-auto">Export</span>
        <Button variant="outline" size="sm" onClick={handleDownloadJson}>
          Download JSON
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadMarkdown}>
          Download Report
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopySummary}>
          {copied ? "Copied!" : "Copy Summary"}
        </Button>
      </div>
    </div>
  );
}

function ScorecardCard({ card }: { card: PersonaScorecard }) {
  const [expanded, setExpanded] = React.useState(false);
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);
  const metrics = [
    { label: "Relevance", value: card.scores.relevance },
    { label: "Specificity", value: card.scores.specificity },
    { label: "Coverage", value: card.scores.coverage },
    { label: "Differentiation", value: card.scores.differentiation },
    { label: "Actionability", value: card.scores.actionability },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition"
      >
        <div className="flex items-center gap-3">
          <span className={`text-xl font-bold ${scoreColor(card.overall)}`}>
            {card.overall}
          </span>
          <span className="text-sm font-medium text-foreground">{card.personaName}</span>
        </div>
        <svg
          className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {expanded && (
        <div className="border-t border-white/10 px-4 py-4 space-y-4">
          {/* Score bars */}
          <div className="space-y-2">
            {metrics.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="w-28 text-xs text-muted-foreground">{m.label}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(m.value)}`}
                    style={{ width: `${m.value}%` }}
                  />
                </div>
                <span className={`w-8 text-xs font-medium text-right ${scoreColor(m.value)}`}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          {/* Strengths */}
          {card.strengths.length > 0 && (
            <div>
              <div className="text-xs font-medium text-green-400 mb-1">Strengths</div>
              <ul className="space-y-0.5">
                {card.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground">+ {s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {card.weaknesses.length > 0 && (
            <div>
              <div className="text-xs font-medium text-red-400 mb-1">Weaknesses</div>
              <ul className="space-y-0.5">
                {card.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-muted-foreground">- {w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {card.improvements.length > 0 && (
            <div>
              <div className="text-xs font-medium text-blue-400 mb-1">Suggested Improvements</div>
              <ul className="space-y-1">
                {card.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start justify-between gap-2 text-xs text-muted-foreground">
                    <span className="flex-1">{imp}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1.5 text-[10px] text-white/30 hover:text-white/70 shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(imp).then(() => {
                          setCopiedIdx(i);
                          setTimeout(() => setCopiedIdx(null), 2000);
                        });
                      }}
                    >
                      {copiedIdx === i ? "Copied!" : "Copy"}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GapCard({ gap }: { gap: TeamGap }) {
  const severityColors = {
    critical: "border-red-500/30 bg-red-500/5",
    moderate: "border-yellow-500/30 bg-yellow-500/5",
    minor: "border-blue-500/30 bg-blue-500/5",
  };
  const severityText = {
    critical: "text-red-400",
    moderate: "text-yellow-400",
    minor: "text-blue-400",
  };

  return (
    <div className={`rounded-xl border p-3 ${severityColors[gap.severity]}`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium uppercase ${severityText[gap.severity]}`}>
          {gap.severity}
        </span>
        <span className="text-sm font-medium text-foreground">{gap.area}</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{gap.suggestion}</div>
    </div>
  );
}

function ConsensusCard({ sim }: { sim: NonNullable<AutoResearchResult["consensusSimulation"]> }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
      <div>
        <div className="text-xs font-medium text-muted-foreground">Decision</div>
        <div className="text-sm font-medium text-foreground mt-1">{sim.decision}</div>
      </div>

      <div className="space-y-2">
        {sim.votes.map((vote, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-t border-white/5">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{vote.personaName}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  vote.confidence === "high"
                    ? "bg-green-500/10 text-green-400"
                    : vote.confidence === "medium"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-red-500/10 text-red-400"
                }`}>
                  {vote.confidence}
                </span>
              </div>
              <div className="text-xs text-primary mt-0.5">{vote.position}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{vote.reasoning}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-3">
        <div className="text-xs font-medium text-foreground">Outcome: {sim.outcome}</div>
        {sim.insights.length > 0 && (
          <div className="mt-2 space-y-1">
            {sim.insights.map((insight, i) => (
              <div key={i} className="text-xs text-muted-foreground">
                {insight}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function barColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}
