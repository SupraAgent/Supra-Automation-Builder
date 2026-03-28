"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StepBrief } from "./step-brief";
import { StepPersonas } from "./step-personas";
import { StepDesign } from "./step-design";
import { StepScreens } from "./step-screens";
import { StepShip } from "./step-ship";
import { EMPTY_DESIGN_TO_SHIP, type DesignToShipDraft } from "@/lib/design-to-ship";

const STEPS = [
  { label: "Brief" },
  { label: "Personas" },
  { label: "Design" },
  { label: "Screens" },
  { label: "Ship" },
];

export function DtsShell() {
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState<DesignToShipDraft>(EMPTY_DESIGN_TO_SHIP);
  const [direction, setDirection] = React.useState(1);

  function patchDraft(patch: Partial<DesignToShipDraft>) {
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
    setDraft(EMPTY_DESIGN_TO_SHIP);
    setStep(0);
  }

  const canProceed =
    step === 0
      ? Boolean(draft.projectName && draft.projectType && draft.atmosphere)
      : step === 1
        ? true // personas are optional
        : step === 2
          ? Boolean(draft.designSystem)
          : step === 3
            ? true // screens are optional but encouraged
            : true;

  const lastStep = STEPS.length - 1;
  const isWide = step === 1; // Personas step uses wider layout

  return (
    <div className={`mx-auto px-4 py-8 ${isWide ? "max-w-5xl" : "max-w-2xl"}`}>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Design-to-Ship</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            From project brief through design system to shipping
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

      {/* Progress — mobile compact */}
      <div className="mb-8 flex items-center justify-between sm:hidden">
        <Button variant="ghost" size="sm" onClick={goBack} disabled={step === 0}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
        </Button>
        <div className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${step < STEPS.length - 1 ? "bg-primary/20 text-primary" : "bg-primary text-primary-foreground"}`}>
            {step + 1}
          </span>
          <div className="text-sm font-medium text-foreground">
            {STEPS[step].label}
            <span className="text-xs text-muted-foreground ml-1">of {STEPS.length}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={goNext} disabled={step >= STEPS.length - 1}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
        </Button>
      </div>

      {/* Progress — desktop full pills */}
      <div className="mb-8 hidden sm:flex items-center gap-2">
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
          {step === 0 && <StepBrief draft={draft} onChange={patchDraft} />}
          {step === 1 && <StepPersonas draft={draft} onChange={patchDraft} />}
          {step === 2 && <StepDesign draft={draft} onChange={patchDraft} />}
          {step === 3 && <StepScreens draft={draft} onChange={patchDraft} />}
          {step === 4 && <StepShip draft={draft} />}
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
