"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  generateGrillQuestions,
  type LaunchKitDraft,
  type GrillQuestion,
} from "@/lib/launch-kit";

type Props = {
  draft: LaunchKitDraft;
  onChange: (patch: Partial<LaunchKitDraft>) => void;
  onSkip?: () => void;
};

export function StepGrill({ draft, onChange, onSkip }: Props) {
  // Auto-generate questions on first mount if none exist
  React.useEffect(() => {
    if (draft.grillQuestions.length === 0 && draft.team.length > 0) {
      onChange({ grillQuestions: generateGrillQuestions(draft) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateQuestion(index: number, patch: Partial<GrillQuestion>) {
    const next = [...draft.grillQuestions];
    next[index] = { ...next[index], ...patch };
    onChange({ grillQuestions: next });
  }

  function regenerate() {
    onChange({ grillQuestions: generateGrillQuestions(draft) });
  }

  // Group questions by persona
  const grouped = React.useMemo(() => {
    const map = new Map<number, { question: GrillQuestion; globalIndex: number }[]>();
    draft.grillQuestions.forEach((q, i) => {
      const existing = map.get(q.personaIndex) || [];
      existing.push({ question: q, globalIndex: i });
      map.set(q.personaIndex, existing);
    });
    return map;
  }, [draft.grillQuestions]);

  const answered = draft.grillQuestions.filter((q) => q.status === "answered").length;
  const acknowledged = draft.grillQuestions.filter((q) => q.status === "acknowledged").length;
  const total = draft.grillQuestions.length;
  const allDone = total > 0 && draft.grillQuestions.every((q) => q.status !== "unanswered");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Persona Grill</h2>
          <p className="text-sm text-white/50">Challenge your personas with hard questions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={regenerate}>
            Regenerate
          </Button>
          {onSkip && (
            <Button variant="ghost" size="sm" className="text-white/40" onClick={onSkip}>
              Skip — I'll validate later
            </Button>
          )}
        </div>
      </div>

      {total > 0 && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="text-green-400">{answered} answered</span>
          <span className="text-yellow-400">{acknowledged} acknowledged</span>
          <span>{total - answered - acknowledged} remaining</span>
          {allDone && (
            <span className="ml-auto text-primary font-medium">All done</span>
          )}
        </div>
      )}

      {Array.from(grouped.entries()).map(([personaIndex, questions]) => {
        const member = draft.team[personaIndex];
        if (!member) return null;

        return (
          <div
            key={personaIndex}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {personaIndex + 1}
              </span>
              <h3 className="text-sm font-medium text-foreground">
                {member.role}
                {member.company && (
                  <span className="text-muted-foreground font-normal">
                    {" "}({member.company})
                  </span>
                )}
              </h3>
            </div>

            {questions.map(({ question: q, globalIndex }) => (
              <div
                key={globalIndex}
                className={`rounded-lg border p-3 space-y-2 ${
                  q.status === "answered"
                    ? "border-green-500/20 bg-green-500/[0.03]"
                    : q.status === "acknowledged"
                      ? "border-yellow-500/20 bg-yellow-500/[0.03]"
                      : "border-white/10 bg-white/[0.01]"
                }`}
              >
                <p className="text-sm text-foreground">{q.question}</p>

                {q.status !== "acknowledged" && (
                  <Textarea
                    value={q.response}
                    onChange={(e) => {
                      updateQuestion(globalIndex, {
                        response: e.target.value,
                        status: e.target.value.trim() ? "answered" : "unanswered",
                      });
                    }}
                    placeholder="Your response..."
                    rows={2}
                    className="text-sm"
                  />
                )}

                <div className="flex items-center gap-2">
                  {q.status === "acknowledged" ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(globalIndex, { status: "unanswered" })
                      }
                      className="text-xs text-yellow-400 hover:text-yellow-300 cursor-pointer"
                    >
                      Reopen
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(globalIndex, {
                          status: "acknowledged",
                          response: "",
                        })
                      }
                      className="text-xs text-muted-foreground hover:text-yellow-400 cursor-pointer"
                    >
                      Acknowledge without answering
                    </button>
                  )}

                  {q.status === "answered" && (
                    <span className="ml-auto text-xs text-green-400">Answered</span>
                  )}
                  {q.status === "acknowledged" && (
                    <span className="ml-auto text-xs text-yellow-400">
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {total === 0 && draft.team.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-muted-foreground">
          Add team members in the Team step to generate grill questions.
        </div>
      )}
    </div>
  );
}
