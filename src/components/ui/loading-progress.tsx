"use client";

import * as React from "react";

type LoadingProgressProps = {
  active: boolean;
  label?: string;
  estimatedMs?: number;
};

/**
 * Shows an animated loading bar with elapsed time for long AI operations.
 * Uses an asymptotic curve (exponential decay) approaching 90%.
 * Updates once per second to avoid excessive re-renders of parent tree.
 */
export function LoadingProgress({
  active,
  label = "Processing...",
  estimatedMs = 10000,
}: LoadingProgressProps) {
  const [seconds, setSeconds] = React.useState(0);
  const safeEstimate = Math.max(estimatedMs, 1000);

  React.useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }

    setSeconds(0);
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  // Asymptotic: exponential decay curve -> approaches 90% smoothly, never 100%
  const elapsedMs = seconds * 1000;
  const progress = 90 * (1 - Math.exp(-elapsedMs / safeEstimate));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground animate-pulse">{label}</p>
        <p className="text-xs text-muted-foreground tabular-nums">{seconds}s</p>
      </div>
      <div
        className="h-1 rounded-full bg-white/[0.06] overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-primary/60 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
