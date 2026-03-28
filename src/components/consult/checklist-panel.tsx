"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  SKILL_TARGETS,
  exportChecklistToJson,
  exportChecklistToMarkdown,
  type SkillTarget,
  type ChecklistItem,
  type AutoresearchLoopResult,
  type AutoresearchRound,
} from "@/lib/auto-research";

const MODEL_BADGES: Record<string, string> = {
  "claude-sonnet-4-6": "Recommended",
  "claude-haiku-4-5": "Fast",
  "claude-opus-4-6": "Deepest",
};

export function ChecklistPanel() {
  const [backend, setBackend] = React.useState<"anthropic" | "ollama">("anthropic");
  const [model, setModel] = React.useState("claude-sonnet-4-6");
  const [selectedTarget, setSelectedTarget] = React.useState<SkillTarget | null>(null);
  const [outputToScore, setOutputToScore] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AutoresearchLoopResult | null>(null);
  const [rounds, setRounds] = React.useState<AutoresearchRound[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [showHistory, setShowHistory] = React.useState(false);
  const [checklistHistory, setChecklistHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    try {
      setChecklistHistory(JSON.parse(localStorage.getItem("checklist-history") || "[]"));
    } catch {
      setChecklistHistory([]);
    }
  }, []);

  React.useEffect(() => {
    if (result) {
      try {
        const hist = JSON.parse(localStorage.getItem("checklist-history") || "[]");
        hist.unshift({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          skillTarget: selectedTarget?.label || "",
          score: result.score,
          passedCount: result.results.filter((r: any) => r.passed).length,
          totalCount: result.results.length,
        });
        const trimmed = hist.slice(0, 20);
        localStorage.setItem("checklist-history", JSON.stringify(trimmed));
        setChecklistHistory(trimmed);
      } catch {
        // localStorage unavailable (private browsing)
      }
    }
  }, [result]);

  async function runScoring() {
    if (!selectedTarget || !outputToScore) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backend,
          model,
          skillTargetId: selectedTarget.id,
          outputToScore,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data: AutoresearchLoopResult = await res.json();
      setResult(data);

      // Track as a round
      setRounds((prev) => [
        ...prev,
        {
          round: prev.length + 1,
          changeDescription: prev.length === 0 ? "Baseline" : "Re-scored after change",
          previousScore: prev.length > 0 ? prev[prev.length - 1].newScore : 0,
          newScore: data.score,
          kept: true,
          failedItems: data.failedItems,
        },
      ]);
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
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { setBackend("anthropic"); setModel("claude-sonnet-4-6"); }}
            className={`rounded-xl border p-4 text-left transition cursor-pointer ${
              backend === "anthropic" ? "border-primary/60 bg-primary/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <div className="text-sm font-medium text-foreground">Claude API</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Best quality. Requires ANTHROPIC_API_KEY</div>
          </button>
          <button
            type="button"
            onClick={() => { setBackend("ollama"); setModel("llama3.1"); }}
            className={`rounded-xl border p-4 text-left transition cursor-pointer ${
              backend === "ollama" ? "border-primary/60 bg-primary/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <div className="text-sm font-medium text-foreground">Ollama (Local GPU)</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Free, private. Requires Ollama running.</div>
          </button>
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Model</label>
          {backend === "anthropic" ? (
            <div className="flex gap-2">
              {(["claude-sonnet-4-6", "claude-haiku-4-5", "claude-opus-4-6"] as const).map((m) => {
                const badgeLabel = MODEL_BADGES[m];
                return (
                  <button key={m} type="button" onClick={() => setModel(m)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                      model === m ? "border-primary/60 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20"
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
                <button key={m} type="button" onClick={() => setModel(m)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                    model === m ? "border-primary/60 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Skill Target Selection */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Skill Target</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select which skill output to score against its checklist.
        </p>
        <div className="mt-3 space-y-2">
          {SKILL_TARGETS.map((target) => (
            <button
              key={target.id}
              type="button"
              onClick={() => setSelectedTarget(target)}
              className={`w-full rounded-xl border p-3 text-left transition cursor-pointer ${
                selectedTarget?.id === target.id
                  ? "border-primary/60 bg-primary/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-foreground">{target.label}</div>
                <span className="text-[10px] text-muted-foreground">{target.checklist.length} checks</span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{target.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Checklist Preview */}
      {selectedTarget && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Checklist: {selectedTarget.label}</h3>
          <div className="space-y-1">
            {selectedTarget.checklist.map((item, i) => (
              <div key={item.id} className="flex items-start gap-2 text-xs">
                <span className="text-muted-foreground w-4 text-right">{i + 1}.</span>
                <span className="text-foreground flex-1">{item.question}</span>
                <span className="text-muted-foreground italic">{item.catches}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output to Score */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Output to Score</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste the output you want to evaluate against the checklist.
        </p>
        <Textarea
          value={outputToScore}
          onChange={(e) => setOutputToScore(e.target.value)}
          placeholder="Paste the persona profile, CLAUDE.md, project brief, or any skill output here..."
          className="mt-3 min-h-[150px] font-mono text-xs"
        />
      </div>

      {/* Run */}
      <div className="flex items-center gap-3">
        <Button
          onClick={runScoring}
          disabled={loading || !selectedTarget || !outputToScore}
          size="lg"
        >
          {loading ? "Scoring..." : rounds.length === 0 ? "Run Baseline" : "Re-Score"}
        </Button>
        {loading && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Running checklist evaluation...
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="text-sm font-medium text-red-400">Error</div>
          <div className="mt-1 text-xs text-red-300">{error}</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <ChecklistResults result={result} rounds={rounds} />
      )}

      {/* Checklist History */}
      <div className="mt-6">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-white/50 hover:text-white/70 flex items-center gap-1"
        >
          {showHistory ? "\u25BC" : "\u25B6"} Score History ({checklistHistory.length} runs)
        </button>
        {showHistory && (
          <div className="mt-2 space-y-1">
            {checklistHistory.map((h: any) => (
              <div key={h.id} className="flex items-center justify-between text-xs text-white/40 py-1 border-b border-white/5">
                <span>{new Date(h.timestamp).toLocaleDateString()}</span>
                <span>{h.skillTarget}</span>
                <span className={`font-mono ${h.score >= 80 ? "text-green-400" : h.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                  {h.score}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistResults({
  result,
  rounds,
}: {
  result: AutoresearchLoopResult;
  rounds: AutoresearchRound[];
}) {
  const [copied, setCopied] = React.useState(false);
  const [copiedSuggestion, setCopiedSuggestion] = React.useState(false);
  const passed = result.results.filter((r) => r.passed).length;
  const total = result.results.length;

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
    downloadFile(exportChecklistToJson(result), `checklist-report-${ts}.json`, "application/json");
  }

  function handleDownloadMarkdown() {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    downloadFile(exportChecklistToMarkdown(result), `checklist-report-${ts}.md`, "text/markdown");
  }

  function handleCopyScore() {
    const text = `Score: ${result.score}% (${passed}/${total} passed)`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-6 border-t border-white/10 pt-6">
      {/* Score */}
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
          <span
            className={`text-3xl font-bold ${
              result.score >= 80
                ? "text-green-400"
                : result.score >= 60
                  ? "text-yellow-400"
                  : result.score >= 40
                    ? "text-orange-400"
                    : "text-red-400"
            }`}
          >
            {result.score}%
          </span>
        </div>
        <div>
          <div className="text-lg font-semibold text-foreground">Checklist Score</div>
          <div className="text-sm text-muted-foreground">
            {passed}/{total} checks passed
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Results</h3>
        <div className="space-y-1">
          {result.results.map((r, i) => (
            <div
              key={r.itemId}
              className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                r.passed
                  ? "bg-green-500/5 border border-green-500/20"
                  : "bg-red-500/5 border border-red-500/20"
              }`}
            >
              <span
                className={`font-medium ${r.passed ? "text-green-400" : "text-red-400"}`}
              >
                {r.passed ? "PASS" : "FAIL"}
              </span>
              <span className="text-foreground flex-1">{r.question}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Change */}
      {result.suggestedChange && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Suggested Change</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(result.suggestedChange);
                setCopiedSuggestion(true);
                setTimeout(() => setCopiedSuggestion(false), 2000);
              }}
            >
              {copiedSuggestion ? "Copied!" : "Copy"}
            </Button>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-muted-foreground">
            {result.suggestedChange}
          </div>
        </div>
      )}

      {/* Rounds History */}
      {rounds.length > 1 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Score History</h3>
          <div className="space-y-1">
            {rounds.map((r) => (
              <div
                key={r.round}
                className="flex items-center gap-3 text-xs text-muted-foreground"
              >
                <span className="w-16">Round {r.round}</span>
                <span className="font-medium text-foreground">{r.newScore}%</span>
                {r.round > 1 && (
                  <span
                    className={
                      r.newScore > r.previousScore
                        ? "text-green-400"
                        : r.newScore < r.previousScore
                          ? "text-red-400"
                          : "text-muted-foreground"
                    }
                  >
                    {r.newScore > r.previousScore ? "+" : ""}
                    {r.newScore - r.previousScore}%
                  </span>
                )}
                <span>{r.changeDescription}</span>
              </div>
            ))}
          </div>
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
        <Button variant="outline" size="sm" onClick={handleCopyScore}>
          {copied ? "Copied!" : "Copy Score"}
        </Button>
      </div>
    </div>
  );
}
