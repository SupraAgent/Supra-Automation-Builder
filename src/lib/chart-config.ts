"use client";

import * as React from "react";

/** Shared chart color palette matching the SupraVibe dark design system. */
export const CHART_COLORS = {
  primary: "hsl(158, 64%, 52%)",       // Supra green
  primaryFill: "rgba(12, 206, 107, 0.15)",
  secondary: "rgba(255, 255, 255, 0.3)",
  secondaryFill: "rgba(255, 255, 255, 0.05)",
  grid: "rgba(255, 255, 255, 0.05)",
  axisText: "hsl(215, 18%, 70%)",
  completed: "hsl(158, 64%, 52%)",     // green
  failed: "hsl(0, 72%, 60%)",          // red
  timedOut: "hsl(30, 90%, 55%)",       // orange
} as const;

export const TOOLTIP_CONTENT_STYLE: React.CSSProperties = {
  background: "hsl(225, 35%, 6%)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 12,
  color: "hsl(210, 40%, 98%)",
};

export const CHART_DEFAULTS = {
  strokeWidth: 1.5,
  dot: false,
  isAnimationActive: false,
} as const;

/** Styled tooltip matching card system. */
export function ChartTooltip({
  active,
  label,
  items,
}: {
  active?: boolean;
  label?: string;
  items?: { name: string; value: number; color: string }[];
}) {
  if (!active || !items) return null;
  return React.createElement(
    "div",
    {
      style: {
        background: "hsl(225, 35%, 6%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
      },
    },
    label &&
      React.createElement(
        "p",
        { style: { color: "hsl(215, 18%, 70%)", marginBottom: 4 } },
        label
      ),
    items.map((item) =>
      React.createElement(
        "div",
        {
          key: item.name,
          style: { display: "flex", alignItems: "center", gap: 6 },
        },
        React.createElement("span", {
          style: {
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: item.color,
            flexShrink: 0,
          },
        }),
        React.createElement(
          "span",
          { style: { color: "hsl(210, 40%, 98%)" } },
          `${item.name}: ${item.value}`
        )
      )
    )
  );
}
