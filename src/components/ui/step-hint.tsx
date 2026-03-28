"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, ChevronDown } from "lucide-react";

type StepHintProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

/**
 * Collapsible contextual hint shown at the top of wizard steps.
 * Provides "why this matters" context for progressive disclosure.
 */
export function StepHint({ title, children, defaultOpen = false }: StepHintProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const contentId = React.useId();

  return (
    <div className="rounded-xl border border-primary/10 bg-primary/[0.03] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left cursor-pointer hover:bg-primary/[0.02] transition"
        aria-expanded={open}
        aria-controls={contentId}
      >
        <Info className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="text-xs font-medium text-primary flex-1">{title}</span>
        <ChevronDown
          className={`h-3 w-3 text-primary/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-primary/5 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
