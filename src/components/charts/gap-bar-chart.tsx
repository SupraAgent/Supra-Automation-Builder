"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CHART_COLORS, TOOLTIP_CONTENT_STYLE } from "@/lib/chart-config";

type GapItem = { category: string; gap: number; priority: string };

const PRIORITY_FILLS: Record<string, string> = {
  CRITICAL: "hsl(0, 72%, 60%)",
  HIGH: "hsl(30, 90%, 55%)",
  MED: "hsl(45, 90%, 55%)",
  LOW: CHART_COLORS.primary,
};

type Props = { gaps: GapItem[]; height?: number };

export function GapBarChart({ gaps, height = 200 }: Props) {
  if (gaps.length === 0) return null;

  const data = [...gaps].sort((a, b) => b.gap - a.gap).map((g) => ({
    name: g.category.length > 12 ? g.category.slice(0, 12) + "\u2026" : g.category,
    fullName: g.category, gap: g.gap, priority: g.priority,
  }));

  const topGap = data[0];

  return (
    <div role="img" aria-label={`Gap analysis: ${data.length} categories. Largest gap: ${topGap.fullName} at ${topGap.gap}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <XAxis type="number" domain={[0, "auto"]} tick={{ fontSize: 11, fill: CHART_COLORS.axisText }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: CHART_COLORS.axisText }} width={100} />
          <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} formatter={(v) => [`${v}`, "Gap"]} labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""} />
          <Bar dataKey="gap" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (<Cell key={i} fill={PRIORITY_FILLS[entry.priority] ?? CHART_COLORS.primary} fillOpacity={0.8} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
