"use client";

import * as React from "react";
import { ScoringGrid } from "./scoring-grid";
import { Badge } from "@/components/ui/badge";
import {
  recalcAverages,
  generatePersonaScores,
  calcConsensus,
  calcGapAnalysis,
  type ImprovementDraft,
  type CategoryScore,
} from "@/lib/improvement";

type Props = {
  draft: ImprovementDraft;
  onChange: (patch: Partial<ImprovementDraft>) => void;
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "border-red-500/30 bg-red-500/10 text-red-400",
  HIGH: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  MED: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  LOW: "border-green-500/30 bg-green-500/10 text-green-400",
};

export function StepSelfScore({ draft, onChange }: Props) {
  // Recompute persona scores + consensus whenever self-scores change (debounced)
  React.useEffect(() => {
    const hasScores = draft.selfScores.some((c) =>
      c.subCriteria.some((sc) => sc.score > 0)
    );
    if (!hasScores) return;

    const timer = setTimeout(() => {
      const personaScores = generatePersonaScores(draft.selfScores, draft.team);
      const consensusScores = calcConsensus(personaScores, draft.team);
      const gapAnalysis = calcGapAnalysis(consensusScores, draft.referenceApps);
      onChange({ personaScores, consensusScores, gapAnalysis });
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.selfScores, draft.team, draft.referenceApps]);

  function handleScoreChange(
    catIndex: number,
    subIndex: number,
    value: number
  ) {
    const newScores: CategoryScore[] = draft.selfScores.map((cat, ci) => {
      if (ci !== catIndex) return cat;
      const subCriteria = cat.subCriteria.map((sc, si) =>
        si === subIndex ? { ...sc, score: value } : sc
      );
      return { ...cat, subCriteria };
    });
    onChange({ selfScores: recalcAverages(newScores) });
  }

  const hasGapData = draft.gapAnalysis.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Score Your App
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Rate your app on the same criteria. Each persona will score
          independently, then we&apos;ll calculate consensus and show the gap.
        </p>
      </div>

      {/* Self-scoring grid */}
      <ScoringGrid
        scores={draft.selfScores}
        onScoreChange={handleScoreChange}
      />

      {/* Persona Scores Table */}
      {draft.personaScores.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Persona Scores (independent)
          </h3>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Category
                  </th>
                  {draft.personaScores.map((ps) => (
                    <th
                      key={ps.personaId}
                      className="px-3 py-2 text-center font-medium text-muted-foreground"
                    >
                      {ps.personaName.split(" ")[0]}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium text-primary">
                    Consensus
                  </th>
                </tr>
              </thead>
              <tbody>
                {draft.consensusScores.map((cat, catIdx) => (
                  <tr
                    key={cat.name}
                    className="border-b border-white/5 hover:bg-white/[0.01]"
                  >
                    <td className="px-3 py-2 text-foreground">{cat.name}</td>
                    {draft.personaScores.map((ps) => (
                      <td
                        key={ps.personaId}
                        className="px-3 py-2 text-center tabular-nums text-muted-foreground"
                      >
                        {ps.scores[catIdx]?.avg ?? 0}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center tabular-nums font-semibold text-primary">
                      {cat.avg}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gap Analysis */}
      {hasGapData && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Gap Analysis
          </h3>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                    Your Score
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                    Best Ref
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                    Gap
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                    Priority
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground w-40">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...draft.gapAnalysis]
                  .sort((a, b) => b.gap - a.gap)
                  .map((item) => (
                    <tr
                      key={item.category}
                      className="border-b border-white/5 hover:bg-white/[0.01]"
                    >
                      <td className="px-3 py-2 text-foreground">
                        {item.category}
                      </td>
                      <td className="px-3 py-2 text-center tabular-nums text-muted-foreground">
                        {item.yourScore}
                      </td>
                      <td className="px-3 py-2 text-center tabular-nums text-muted-foreground">
                        {item.bestRef}
                      </td>
                      <td className="px-3 py-2 text-center tabular-nums font-medium text-foreground">
                        -{item.gap}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge
                          className={PRIORITY_COLORS[item.priority] ?? ""}
                        >
                          {item.priority}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60 transition-all"
                            style={{
                              width: `${Math.max(0, 100 - item.gap)}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
