"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// ── Types ───────────────────────────────────────────────────

export type WizardStep = {
  label: string;
  subtitle?: string;
};

export type WizardShellProps = {
  title: string;
  subtitle: string;
  steps: WizardStep[];
  step: number;
  direction: number;
  canProceed: boolean;
  validationMessage?: string | null;
  maxWidth?: "max-w-2xl" | "max-w-3xl" | "max-w-4xl" | "max-w-5xl";
  headerActions?: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  onStepClick?: (index: number) => void;
  children: React.ReactNode;
};

// ── Hook ────────────────────────────────────────────────────

/** Shallow merge only — always pass complete nested objects when patching. */
export function useWizardState<T>(opts: {
  emptyDraft: T;
  storageKey?: string;
}) {
  const { storageKey } = opts;
  const emptyRef = React.useRef(opts.emptyDraft);
  const hasHydrated = React.useRef(false);

  const [step, setStep] = React.useState(() => {
    if (!storageKey) return 0;
    try {
      const s = typeof window !== "undefined" ? localStorage.getItem(`${storageKey}_step`) : null;
      return s ? parseInt(s, 10) : 0;
    } catch { return 0; }
  });

  const [draft, setDraft] = React.useState<T>(() => {
    if (!storageKey) return emptyRef.current;
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
      if (stored) return JSON.parse(stored) as T;
    } catch { /* ignore */ }
    return emptyRef.current;
  });

  const [direction, setDirection] = React.useState(1);

  // Persist draft — skip initial hydration write
  React.useEffect(() => {
    if (!storageKey) return;
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      return;
    }
    try { localStorage.setItem(storageKey, JSON.stringify(draft)); } catch { /* ignore */ }
  }, [draft, storageKey]);

  React.useEffect(() => {
    if (!storageKey) return;
    try { localStorage.setItem(`${storageKey}_step`, String(step)); } catch { /* ignore */ }
  }, [step, storageKey]);

  /** Shallow merge only — always pass complete nested objects. */
  function patchDraft(patch: Partial<T>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function goNext(totalSteps: number) {
    setStep((prev) => {
      if (prev < totalSteps - 1) {
        setDirection(1);
        return prev + 1;
      }
      return prev;
    });
  }

  function goBack() {
    setStep((prev) => {
      if (prev > 0) {
        setDirection(-1);
        return prev - 1;
      }
      return prev;
    });
  }

  function goToStep(i: number) {
    setStep((prev) => {
      setDirection(i > prev ? 1 : -1);
      return i;
    });
  }

  function reset() {
    if (typeof window !== "undefined" && !window.confirm("Start over? All progress will be lost.")) return;
    if (storageKey) {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_step`);
    }
    setDraft(emptyRef.current);
    setStep(0);
  }

  return { step, draft, direction, patchDraft, goNext, goBack, goToStep, reset, setDraft };
}

// ── Component ───────────────────────────────────────────────

export function WizardShell({
  title,
  subtitle,
  steps,
  step,
  direction,
  canProceed,
  validationMessage,
  maxWidth = "max-w-2xl",
  headerActions,
  onNext,
  onBack,
  onStepClick,
  children,
}: WizardShellProps) {
  const wizardId = React.useId();
  const lastStep = steps.length - 1;
  const tablistRef = React.useRef<HTMLDivElement>(null);

  function handleStepClick(i: number) {
    if (onStepClick && i <= step) {
      onStepClick(i);
    }
  }

  return (
    <div className={`mx-auto px-4 py-8 ${maxWidth}`}>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {headerActions && (
          <div className="flex items-center gap-2">{headerActions}</div>
        )}
      </div>

      {/* Progress — mobile compact */}
      <div className="mb-8 flex items-center justify-between sm:hidden">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={step === 0}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Button>
        <div className="flex items-center gap-2">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
            step < lastStep ? "bg-primary/20 text-primary" : "bg-primary text-primary-foreground"
          }`}>
            {step + 1}
          </span>
          <div className="text-sm font-medium text-foreground">
            {steps[step].label}
            <span className="text-xs text-muted-foreground ml-1">of {steps.length}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onNext} disabled={step >= lastStep || !canProceed}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Button>
      </div>

      {/* Progress — desktop full pills */}
      <div
        className="mb-8 hidden sm:flex items-center gap-2"
        role="tablist"
        aria-label="Wizard steps"
        ref={tablistRef}
        onKeyDown={(e) => {
          let next = -1;
          if (e.key === "ArrowRight" && step < lastStep && onStepClick) { e.preventDefault(); next = step + 1; onStepClick(next); }
          else if (e.key === "ArrowLeft" && step > 0 && onStepClick) { e.preventDefault(); next = step - 1; onStepClick(next); }
          if (next >= 0) {
            requestAnimationFrame(() => {
              tablistRef.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(`${wizardId}-tab-${next}`)}`)?.focus();
            });
          }
        }}
      >
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <button
              id={`${wizardId}-tab-${i}`} role="tab" aria-controls={`${wizardId}-tabpanel`}
              tabIndex={i === step ? 0 : -1}
              aria-selected={i === step}
              aria-disabled={i > step}
              onClick={() => handleStepClick(i)}
              disabled={i > step}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                i <= step ? "cursor-pointer" : "cursor-not-allowed"
              } ${
                i === step
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : i < step
                    ? "bg-white/5 text-foreground border border-white/10"
                    : "bg-white/[0.02] text-muted-foreground border border-white/5"
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary/20 text-primary"
                    : "bg-white/5 text-muted-foreground"
              }`}>
                {i < step ? "\u2713" : i + 1}
              </span>
              <div className="text-left">
                <div>{s.label}</div>
                {i === step && s.subtitle && (
                  <div className="text-xs text-muted-foreground font-normal">
                    {s.subtitle}
                  </div>
                )}
              </div>
            </button>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 ${i < step ? "bg-primary/30" : "bg-white/10"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content with animation */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          id={`${wizardId}-tabpanel`} role="tabpanel" aria-labelledby={`${wizardId}-tab-${step}`} tabIndex={0}
          initial={{ x: direction * 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -30, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Navigation — always visible, Next hidden on last step */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} disabled={step === 0}>
          Back
        </Button>
        {step < lastStep && (
          <div className="flex items-center gap-3">
            {validationMessage && !canProceed && (
              <p className="text-xs text-amber-400 max-w-xs text-right">
                {validationMessage}
              </p>
            )}
            <Button onClick={onNext} disabled={!canProceed}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
