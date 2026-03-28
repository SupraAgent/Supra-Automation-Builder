"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS, TOOLTIP_CONTENT_STYLE } from "@/lib/chart-config";

type Props = {
  rounds: { number: number; overallAfter: number }[];
  height?: number;
};

export function ScoreSparkline({ rounds, height = 48 }: Props) {
  if (rounds.length < 2) return null;

  const data = rounds.map((r) => ({ round: r.number, score: r.overallAfter }));
  const first = rounds[0].overallAfter;
  const last = rounds[rounds.length - 1].overallAfter;

  return (
    <div role="img" aria-label={`Score trend: ${first} to ${last} over ${rounds.length} rounds`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <Tooltip contentStyle={TOOLTIP_CONTENT_STYLE} labelFormatter={(v) => `Round ${v}`} formatter={(v) => [`${v}`, "Score"]} />
          <Line type="monotone" dataKey="score" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} activeDot={{ r: 3, fill: CHART_COLORS.primary }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
