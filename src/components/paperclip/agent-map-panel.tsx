"use client";

import * as React from "react";

type Agent = {
  id: string;
  name: string;
  role: string;
  company: string;
  description: string;
  heartbeatMinutes: number;
  monthlyBudgetUsd: number;
  reportsTo: string | null;
  triggers: string[];
  source: "supabase" | "docs";
};

type NewAgent = {
  name: string;
  role: string;
  description: string;
  triggers: string;
  heartbeatMinutes: number;
  monthlyBudgetUsd: number;
};

const emptyAgent: NewAgent = {
  name: "",
  role: "",
  description: "",
  triggers: "",
  heartbeatMinutes: 60,
  monthlyBudgetUsd: 50,
};

export function AgentMapPanel() {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = React.useState(false);
  const [newAgent, setNewAgent] = React.useState<NewAgent>(emptyAgent);
  const [creating, setCreating] = React.useState(false);

  const loadAgents = React.useCallback(() => {
    setLoading(true);
    fetch("/api/paperclip")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setAgents(data.agents || []);
          setSelected(new Set((data.agents || []).map((a: Agent) => a.id)));
        }
      })
      .catch(() => setError("Failed to load agents"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === agents.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(agents.map((a) => a.id)));
    }
  };

  const handleCreate = async () => {
    if (!newAgent.name.trim() || !newAgent.role.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/paperclip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: newAgent.name.trim(),
          role: newAgent.role.trim(),
          description: newAgent.description.trim(),
          triggers: newAgent.triggers
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          heartbeatMinutes: newAgent.heartbeatMinutes,
          monthlyBudgetUsd: newAgent.monthlyBudgetUsd,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setNewAgent(emptyAgent);
        setShowCreate(false);
        loadAgents();
      }
    } catch {
      setError("Failed to create agent");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Loading personas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
        {error}
        <button
          onClick={() => {
            setError(null);
            loadAgents();
          }}
          className="ml-3 text-xs underline hover:no-underline cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {agents.length === 0
            ? "No agents yet"
            : `${selected.size} of ${agents.length} agents selected`}
        </p>
        <div className="flex items-center gap-3">
          {agents.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-xs text-primary hover:text-primary/80 transition cursor-pointer"
            >
              {selected.size === agents.length ? "Deselect all" : "Select all"}
            </button>
          )}
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="text-xs rounded-md bg-primary/10 border border-primary/30 text-primary px-3 py-1.5 hover:bg-primary/20 transition cursor-pointer"
          >
            {showCreate ? "Cancel" : "+ New Agent"}
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            Create Paperclip Agent
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newAgent.name}
                onChange={(e) =>
                  setNewAgent((a) => ({ ...a, name: e.target.value }))
                }
                placeholder="e.g. Growth Lead"
                className="w-full rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Role *
              </label>
              <input
                type="text"
                value={newAgent.role}
                onChange={(e) =>
                  setNewAgent((a) => ({ ...a, role: e.target.value }))
                }
                placeholder="e.g. VP Growth"
                className="w-full rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Description
            </label>
            <input
              type="text"
              value={newAgent.description}
              onChange={(e) =>
                setNewAgent((a) => ({ ...a, description: e.target.value }))
              }
              placeholder="What does this agent do?"
              className="w-full rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Triggers (comma-separated)
            </label>
            <input
              type="text"
              value={newAgent.triggers}
              onChange={(e) =>
                setNewAgent((a) => ({ ...a, triggers: e.target.value }))
              }
              placeholder="e.g. pricing, onboarding, metrics"
              className="w-full rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Heartbeat (minutes)
              </label>
              <input
                type="number"
                value={newAgent.heartbeatMinutes}
                onChange={(e) =>
                  setNewAgent((a) => ({
                    ...a,
                    heartbeatMinutes: Number(e.target.value) || 60,
                  }))
                }
                className="w-full rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-foreground focus:border-primary/30 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Budget ($/month)
              </label>
              <input
                type="number"
                value={newAgent.monthlyBudgetUsd}
                onChange={(e) =>
                  setNewAgent((a) => ({
                    ...a,
                    monthlyBudgetUsd: Number(e.target.value) || 50,
                  }))
                }
                className="w-full rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-foreground focus:border-primary/30 focus:outline-none transition"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !newAgent.name.trim() || !newAgent.role.trim()}
            className="w-full rounded-md bg-primary/10 border border-primary/30 text-primary px-4 py-2 text-sm font-medium hover:bg-primary/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Agent"}
          </button>
        </div>
      )}

      {/* Empty state */}
      {agents.length === 0 && !showCreate && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-muted-foreground text-sm">No agents yet</p>
          <p className="text-muted-foreground text-xs mt-2">
            Click &quot;+ New Agent&quot; to create your first Paperclip agent,
            or create personas in the Persona Builder first.
          </p>
        </div>
      )}

      {/* Agent cards */}
      {agents.map((agent) => (
        <div
          key={agent.id}
          onClick={() => toggle(agent.id)}
          className={`rounded-lg border p-4 transition cursor-pointer ${
            selected.has(agent.id)
              ? "border-primary/30 bg-primary/5"
              : "border-white/10 bg-white/[0.02] opacity-60"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    selected.has(agent.id) ? "bg-primary" : "bg-white/20"
                  }`}
                />
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {agent.name}
                </h3>
                <span
                  className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    agent.source === "supabase"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {agent.source === "supabase" ? "DB" : "File"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {agent.role}
                {agent.company ? ` @ ${agent.company}` : ""}
              </p>
              {agent.triggers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {agent.triggers.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] bg-white/5 text-muted-foreground px-1.5 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right shrink-0 space-y-1">
              <div className="text-[10px] text-muted-foreground">
                Heartbeat
              </div>
              <div className="text-xs text-foreground font-medium">
                {agent.heartbeatMinutes}m
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Budget
              </div>
              <div className="text-xs text-foreground font-medium">
                ${agent.monthlyBudgetUsd}/mo
              </div>
            </div>
          </div>
          {agent.reportsTo && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Reports to: {agent.reportsTo}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
