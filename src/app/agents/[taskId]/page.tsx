"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Collapsible } from "@/components/ui/collapsible";
import type { AgentTask, AgentTaskLog, AgentTaskStatus } from "@/lib/agent-tasks";

function TaskStatusBadge({ status }: { status: AgentTaskStatus }) {
  const config: Record<AgentTaskStatus, { label: string; classes: string; pulse?: boolean }> = {
    queued: { label: "Queued", classes: "bg-white/10 text-muted-foreground" },
    running: { label: "Running", classes: "bg-amber-500/20 text-amber-400", pulse: true },
    completed: { label: "Done", classes: "bg-primary/20 text-primary" },
    failed: { label: "Failed", classes: "bg-red-500/20 text-red-400" },
    cancelled: { label: "Cancelled", classes: "bg-white/10 text-muted-foreground" },
    timed_out: { label: "Timed out", classes: "bg-orange-500/20 text-orange-400" },
  };
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", c.classes)}>
      {c.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
        </span>
      )}
      {c.label}
    </span>
  );
}

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function duration(start?: string, end?: string): string {
  if (!start) return "-";
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const sec = Math.floor((e - s) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  return `${min}m ${remSec.toString().padStart(2, "0")}s`;
}

const LOG_LEVEL_COLORS: Record<string, string> = {
  info: "text-muted-foreground",
  warn: "text-amber-400",
  error: "text-red-400",
  debug: "text-blue-400/60",
};

export default function AgentTaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = React.useState<AgentTask | null>(null);
  const [logs, setLogs] = React.useState<AgentTaskLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/agent/tasks/${taskId}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Task not found" : "Failed to load");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setTask(data.task);
        setLogs(data.logs ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [taskId]);

  // Live status updates via Broadcast
  React.useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel("agent-activity")
      .on("broadcast", { event: "task_status_change" }, (payload: { payload: unknown }) => {
        const update = payload.payload as Partial<AgentTask> & { id: string };
        if (update?.id !== taskId) return;
        setTask((prev) => {
          if (!prev) return prev;
          if (update.updatedAt && prev.updatedAt >= update.updatedAt) return prev;
          return { ...prev, ...update };
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [taskId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-white/[0.03]" />
          <div className="h-40 animate-pulse rounded-xl bg-white/[0.03]" />
          <div className="h-60 animate-pulse rounded-xl bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb items={[{ label: "Agents", href: "/agents" }, { label: "Error" }]} />
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-sm text-red-400">{error ?? "Task not found"}</p>
        </div>
      </div>
    );
  }

  const isTerminal = ["completed", "failed", "cancelled", "timed_out"].includes(task.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb items={[{ label: "Agents", href: "/agents" }, { label: task.title }]} />

      {/* Task header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">{task.title}</h1>
            <TaskStatusBadge status={task.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              {task.agentAvatar ? (
                <img src={task.agentAvatar} alt="" className="h-4 w-4 rounded-full" />
              ) : (
                <svg viewBox="0 0 16 16" width={12} height={12} fill="currentColor"><path d="M8 0a1 1 0 0 1 1 1v1.07A6.002 6.002 0 0 1 14 8a6 6 0 0 1-12 0 6.002 6.002 0 0 1 5-5.93V1a1 1 0 0 1 1-1ZM6 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-2 3.5c0-.28-.22-.5-.5-.5h-3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 .5-.5Z"/></svg>
              )}
              <span>{task.agentName ?? "Agent"}</span>
            </div>
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px]">{task.taskType}</span>
            <span>Created {formatTimestamp(task.createdAt)}</span>
            {task.startedAt && (
              <span>Duration: {duration(task.startedAt, isTerminal ? task.completedAt : undefined)}</span>
            )}
          </div>
        </div>
        {task.deploymentId && (
          <Link
            href={`/deployments?highlight=${task.deploymentId}`}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground transition hover:bg-white/10"
          >
            View Deployment
          </Link>
        )}
      </div>

      {/* Collapsible sections */}
      <div className="space-y-3">
        {/* Error section — auto-expanded when present */}
        {task.errorMessage && (
          <Collapsible
            title="Error"
            status="error"
            defaultOpen
          >
            <p className="text-sm text-red-300">{task.errorMessage}</p>
          </Collapsible>
        )}

        {/* Output section */}
        {task.output && (
          <Collapsible
            title="Output"
            status={task.status === "completed" ? "success" : task.status === "failed" ? "error" : "neutral"}
            defaultOpen
          >
            <div className="space-y-3">
              {task.output.summary && (
                <p className="text-sm text-foreground">{task.output.summary}</p>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {task.output.experiment_score != null && (
                  <span>Score: <span className="text-foreground">{task.output.experiment_score}</span></span>
                )}
                {task.output.tokens_used != null && (
                  <span>Tokens: <span className="text-foreground">{task.output.tokens_used.toLocaleString()}</span></span>
                )}
                {task.output.files_changed && task.output.files_changed.length > 0 && (
                  <span>Files changed: <span className="text-foreground">{task.output.files_changed.length}</span></span>
                )}
                {task.output.diff_url && (
                  <a href={task.output.diff_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    View diff
                  </a>
                )}
              </div>
              {task.output.files_changed && task.output.files_changed.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.output.files_changed.map((f) => (
                    <span key={f} className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Collapsible>
        )}

        {/* Logs section — collapsed by default when many entries */}
        <Collapsible
          title="Logs"
          status={logs.some((l) => l.level === "error") ? "error" : task.status === "running" ? "running" : "neutral"}
          count={logs.length}
          defaultOpen={logs.length > 0 && logs.length <= 20}
        >
          {logs.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground">No log output recorded for this task.</p>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <div className="space-y-0.5 font-mono text-xs">
                {logs.map((log) => (
                  <div key={log.id} className={cn("flex gap-3 rounded px-1 -mx-1", log.level === "error" && "bg-red-500/[0.05]")}>
                    <span className="flex-shrink-0 text-white/20">
                      {new Date(log.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span className={cn("flex-shrink-0 w-10 text-right", LOG_LEVEL_COLORS[log.level] ?? "text-muted-foreground")}>
                      {log.level}
                    </span>
                    <span className="min-w-0 break-all text-foreground/80">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Collapsible>
      </div>
    </div>
  );
}
