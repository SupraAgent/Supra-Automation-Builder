"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
type TeamMember = { id: string; name: string; avatar_url?: string; isAgent?: boolean; displayName?: string; githubUsername?: string; [key: string]: unknown };

export function AssignToAgent({
  deploymentId,
  forkId,
  className,
}: {
  deploymentId?: string;
  forkId?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [agents, setAgents] = React.useState<TeamMember[]>([]);
  const [selectedAgent, setSelectedAgent] = React.useState("");
  const [instructions, setInstructions] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    fetch("/api/team/members")
      .then((r) => (r.ok ? r.json() : { members: [] }))
      .then((data) => {
        const agentMembers = (data.members ?? []).filter((m: TeamMember) => m.isAgent);
        setAgents(agentMembers);
      })
      .catch(() => {});
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSubmit = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/agents/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: instructions.trim().slice(0, 80) || "Agent task",
          taskType: "custom",
          agentUserId: selectedAgent || undefined,
          deploymentId: deploymentId || undefined,
          forkId: forkId || undefined,
          instructions: instructions.trim() || undefined,
        }),
      });
      if (res.ok) {
        setSent(true);
        setTimeout(() => {
          setSent(false);
          setOpen(false);
          setInstructions("");
          setSelectedAgent("");
        }, 1500);
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-white/10"
      >
        {sent ? "Assigned!" : "Assign to Agent"}
      </button>

      {open && !sent && (
        <div className="absolute right-0 top-full z-40 mt-1 w-72 rounded-xl border border-white/10 bg-[hsl(var(--background))] p-3 shadow-xl">
          <p className="mb-2 text-xs font-medium text-foreground">Assign task to an agent</p>

          {agents.length > 0 ? (
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground focus:border-primary/50 focus:outline-none"
            >
              <option value="">Any available agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.displayName || a.githubUsername}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-muted-foreground">No agent accounts found. Mark a team member as an agent in settings.</p>
          )}

          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="What should the agent do?"
            rows={3}
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
          />

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={sending}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {sending ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
