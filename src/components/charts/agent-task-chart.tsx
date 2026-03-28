"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_COLORS, CHART_DEFAULTS, ChartTooltip } from "@/lib/chart-config";
import type { AgentTask } from "@/lib/agent-tasks";

type DayBucket = {
  date: string;
  completed: number;
  failed: number;
  timed_out: number;
};

function bucketTasks(tasks: AgentTask[]): DayBucket[] {
  const map = new Map<string, DayBucket>();

  for (const task of tasks) {
    const day = task.createdAt.slice(0, 10);
    if (!map.has(day)) {
      map.set(day, { date: day, completed: 0, failed: 0, timed_out: 0 });
    }
    const bucket = map.get(day)!;
    if (task.status === "completed") bucket.completed++;
    else if (task.status === "failed") bucket.failed++;
    else if (task.status === "timed_out") bucket.timed_out++;
  }

  // Fill in missing days over last 30 days
  const buckets: DayBucket[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.push(map.get(key) ?? { date: key, completed: 0, failed: 0, timed_out: 0 });
  }

  return buckets;
}

function formatTick(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload) return null;
  const formatted = formatTick(label ?? "");
  return (
    <ChartTooltip
      active={active}
      label={formatted}
      items={payload
        .filter((p) => p.value > 0)
        .map((p) => ({
          name: p.name === "completed" ? "Completed" : p.name === "failed" ? "Failed" : "Timed out",
          value: p.value,
          color:
            p.name === "completed"
              ? CHART_COLORS.completed
              : p.name === "failed"
                ? CHART_COLORS.failed
                : CHART_COLORS.timedOut,
        }))}
    />
  );
}

export function AgentTaskChart({ tasks }: { tasks: AgentTask[] }) {
  if (tasks.length < 3) return null;

  const data = bucketTasks(tasks);

  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="mb-2 text-sm font-medium text-muted-foreground">Task history</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data}>
          <XAxis
            dataKey="date"
            tickFormatter={formatTick}
            interval={6}
            tick={{ fill: CHART_COLORS.axisText, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: CHART_COLORS.axisText, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="completed"
            stackId="tasks"
            fill={CHART_COLORS.completed}
            radius={[0, 0, 0, 0]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="failed"
            stackId="tasks"
            fill={CHART_COLORS.failed}
            radius={[0, 0, 0, 0]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="timed_out"
            stackId="tasks"
            fill={CHART_COLORS.timedOut}
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
