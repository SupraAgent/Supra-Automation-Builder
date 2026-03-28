"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StepContext } from "./step-context";
import { StepTeam } from "./step-team";
import { StepGrill } from "./step-grill";
import { StepExport } from "./step-export";
import { EMPTY_STUDIO_DRAFT, type StudioDraft } from "@/lib/studio";

const STEPS = [
  { label: "Context" },
  { label: "Team" },
  { label: "Grill" },
  { label: "Export" },
];

export function StudioShell() {
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState<StudioDraft>(EMPTY_STUDIO_DRAFT);
  const [direction, setDirection] = React.useState(1);

  function patchDraft(patch: Partial<StudioDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function goNext() {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(step + 1);
    }
  }

  function goBack() {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  }

  function reset() {
    setDraft(EMPTY_STUDIO_DRAFT);
    setStep(0);
  }

  const canProceed =
    step === 0
      ? Boolean(draft.projectName && draft.description)
      : step === 1
        ? draft.personas.length > 0 && draft.personas.some((p) => p.isCeo)
        : step === 2
          ? draft.grillQuestions.length > 0 &&
            draft.grillQuestions.every((q) => q.status !== "unanswered")
          : true;

  const lastStep = STEPS.length - 1;
  const isWide = step === 1; // Team step uses wider layout

  return (
    <div className={`mx-auto px-4 py-8 ${isWide ? "max-w-5xl" : "max-w-2xl"}`}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Persona Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create AI advisors with ready-to-use consultation prompts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(draft.projectName || step > 0) && (
            <Button variant="ghost" size="sm" onClick={reset}>
              Start over
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <button
              onClick={() => {
                if (i <= step) {
                  setDirection(i > step ? 1 : -1);
                  setStep(i);
                }
              }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                i === step
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : i < step
                    ? "bg-white/5 text-foreground border border-white/10"
                    : "bg-white/[0.02] text-muted-foreground border border-white/5"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary/20 text-primary"
                      : "bg-white/5 text-muted-foreground"
                }`}
              >
                {i < step ? "\u2713" : i + 1}
              </span>
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 ${i < step ? "bg-primary/30" : "bg-white/10"}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ x: direction * 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -30, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && <StepContext draft={draft} onChange={patchDraft} />}
          {step === 1 && <StepTeam draft={draft} onChange={patchDraft} />}
          {step === 2 && <StepGrill draft={draft} onChange={patchDraft} />}
          {step === 3 && <StepExport draft={draft} onChange={patchDraft} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step < lastStep && (
        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={goBack} disabled={step === 0}>
            Back
          </Button>
          <Button onClick={goNext} disabled={!canProceed}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
