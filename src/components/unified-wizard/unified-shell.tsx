"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StepIdentity } from "./step-identity";
import { StepExpertise } from "./step-expertise";
import { StepMindset } from "./step-mindset";
import { StepCapabilities } from "./step-capabilities";
import { StepProject } from "./step-project";
import { StepReview } from "./step-review";
import { EMPTY_UNIFIED_DRAFT, type UnifiedDraft } from "@/lib/unified-builder";

const STEPS = [
  { label: "Identity" },
  { label: "Expertise" },
  { label: "Mindset" },
  { label: "Capabilities" },
  { label: "Project" },
  { label: "Review" },
];

export function UnifiedShell() {
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState<UnifiedDraft>(EMPTY_UNIFIED_DRAFT);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [direction, setDirection] = React.useState(1);

  function patchDraft(patch: Partial<UnifiedDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    setSaved(false);
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
    setDraft(EMPTY_UNIFIED_DRAFT);
    setStep(0);
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { unifiedToSupabase } = await import("@/lib/unified-builder");
      const payload = unifiedToSupabase(draft);
      const res = await fetch("/api/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  }

  const canProceed =
    step === 0
      ? Boolean(draft.name && draft.title)
      : step === 1
        ? Boolean(draft.primaryDomain)
        : step === 2
          ? Boolean(draft.coreBeliefs.length > 0 || draft.optimizeFor)
          : step === 3
            ? Boolean(draft.skills.length > 0)
            : true;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Unified Builder</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Expert persona + agent capabilities in one
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/personas"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            My Personas
          </Link>
          {(draft.name || step > 0) && (
            <Button variant="ghost" size="sm" onClick={reset}>
              Start over
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <button
              onClick={() => {
                setDirection(i > step ? 1 : -1);
                setStep(i);
              }}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
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
              <span className="hidden sm:inline">{s.label}</span>
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
          {step === 0 && <StepIdentity draft={draft} onChange={patchDraft} />}
          {step === 1 && <StepExpertise draft={draft} onChange={patchDraft} />}
          {step === 2 && <StepMindset draft={draft} onChange={patchDraft} />}
          {step === 3 && <StepCapabilities draft={draft} onChange={patchDraft} />}
          {step === 4 && <StepProject draft={draft} onChange={patchDraft} />}
          {step === 5 && (
            <StepReview
              draft={draft}
              onChange={patchDraft}
              onSave={handleSave}
              saving={saving}
              saved={saved}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step < 5 && (
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
