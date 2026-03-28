"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  generateStudioGrillQuestions,
  getPersonaPrompt,
  inferRoleIcon,
  type StudioDraft,
  type StudioGrillQuestion,
} from "@/lib/studio";

type Props = {
  draft: StudioDraft;
  onChange: (patch: Partial<StudioDraft>) => void;
};

export function StepGrill({ draft, onChange }: Props) {
  const [expandedPrompt, setExpandedPrompt] = React.useState<number | null>(null);

  // Auto-generate questions on first mount if none exist
  React.useEffect(() => {
    if (draft.grillQuestions.length === 0 && draft.personas.length > 0) {
      onChange({ grillQuestions: generateStudioGrillQuestions(draft) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateQuestion(index: number, patch: Partial<StudioGrillQuestion>) {
    const next = [...draft.grillQuestions];
    next[index] = { ...next[index], ...patch };
    onChange({ grillQuestions: next });
  }

  function regenerate() {
    onChange({ grillQuestions: generateStudioGrillQuestions(draft) });
  }

  const context = {
    projectName: draft.projectName,
    description: draft.description,
    targetUser: draft.targetUser,
    problem: draft.problem,
  };

  // Group questions by persona
  const grouped = React.useMemo(() => {
    const map = new Map<number, { question: StudioGrillQuestion; globalIndex: number }[]>();
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Advisor Grill</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Each advisor challenges your idea with hard questions. Answer or
            acknowledge to proceed.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={regenerate}>
          Regenerate
        </Button>
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
        const persona = draft.personas[personaIndex];
        if (!persona) return null;
        const prompt = getPersonaPrompt(persona, context);
        const promptPreview = prompt.split("\n").slice(0, 3).join("\n");
        const isExpanded = expandedPrompt === personaIndex;

        return (
          <div
            key={personaIndex}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4"
          >
            {/* Persona header with collapsible prompt */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{inferRoleIcon(persona.role)}</span>
                <h3 className="text-sm font-medium text-foreground">
                  {persona.role}
                  {persona.company && (
                    <span className="text-muted-foreground font-normal">
                      {" "}({persona.company})
                    </span>
                  )}
                </h3>
              </div>

              {/* Collapsible prompt preview */}
              <button
                type="button"
                onClick={() =>
                  setExpandedPrompt(isExpanded ? null : personaIndex)
                }
                className="w-full text-left"
              >
                <pre className="whitespace-pre-wrap text-[10px] text-muted-foreground/60 font-mono leading-relaxed bg-white/[0.02] rounded-lg p-2 border border-white/5">
                  {isExpanded ? prompt : promptPreview + "\n..."}
                </pre>
              </button>
            </div>

            {/* Questions */}
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
                      onClick={() => updateQuestion(globalIndex, { status: "unanswered" })}
                      className="text-xs text-yellow-400 hover:text-yellow-300 cursor-pointer"
                    >
                      Reopen
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(globalIndex, { status: "acknowledged", response: "" })
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
                    <span className="ml-auto text-xs text-yellow-400">Acknowledged</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {total === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-muted-foreground">
          Add advisors in the Team step to generate grill questions.
        </div>
      )}
    </div>
  );
}
