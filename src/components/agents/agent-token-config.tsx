"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  { key: "vercel", label: "Vercel", placeholder: "Vercel API token", helpUrl: "https://vercel.com/account/tokens" },
  { key: "github", label: "GitHub", placeholder: "GitHub PAT (ghp_...)", helpUrl: "https://github.com/settings/tokens/new?scopes=repo,read:user" },
  { key: "anthropic", label: "Anthropic", placeholder: "Anthropic API key", helpUrl: "https://console.anthropic.com/settings/keys" },
] as const;

type Status = { connected: boolean; valid: boolean; updatedAt: string | null };

export function AgentTokenConfig({
  agentId,
  agentName,
  onUpdate,
}: {
  agentId: string;
  agentName: string;
  onUpdate?: () => void;
}) {
  const [status, setStatus] = React.useState<Record<string, Status>>({});
  const [loading, setLoading] = React.useState(true);
  const [tokens, setTokens] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState<string | null>(null);
  const [testing, setTesting] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const fetchStatus = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}/tokens/status`);
      const data = res.ok ? await res.json() : { status: {} };
      setStatus(data.status ?? {});
    } catch {
      setStatus({});
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const testToken = async (provider: string) => {
    const token = tokens[provider]?.trim();
    if (!token && !status[provider]?.connected) return;
    setTesting(provider);
    try {
      const res = await fetch("/api/tokens/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          token: token || "__saved__",
          ...(token ? {} : { agentId }),
        }),
      });
      const data = await res.json();
      if (data.valid) {
        toast.success(`${provider} token valid`);
      } else {
        toast.error(data.error || "Invalid token");
      }
    } catch {
      toast.error("Test failed");
    } finally {
      setTesting(null);
    }
  };

  const saveToken = async (provider: string) => {
    const token = tokens[provider]?.trim();
    if (!token) return;
    setSaving(provider);
    try {
      const res = await fetch(`/api/agents/${agentId}/tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, token }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setTokens((p) => ({ ...p, [provider]: "" }));
      await fetchStatus();
      onUpdate?.();
      toast.success(`${provider} token saved for ${agentName}`);
    } catch {
      toast.error(`Failed to save ${provider} token`);
    } finally {
      setSaving(null);
    }
  };

  const deleteToken = async (provider: string) => {
    setDeleting(provider);
    try {
      const res = await fetch(`/api/agents/${agentId}/tokens/${provider}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchStatus();
      onUpdate?.();
      toast.success(`${provider} disconnected from ${agentName}`);
    } catch {
      toast.error(`Failed to disconnect ${provider}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 py-2">
        {PROVIDERS.map((p) => (
          <div key={p.key} className="h-12 animate-pulse rounded-lg bg-white/[0.03]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-muted-foreground">
        Add tokens so this agent can commit, deploy, or run AI (depending on role).
      </p>
      {PROVIDERS.map((p) => {
        const s = status[p.key] ?? { connected: false, valid: false, updatedAt: null };
        return (
          <div key={p.key} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-medium text-foreground">{p.label}</span>
                <span
                  className={cn(
                    "ml-2 rounded px-1.5 py-0.5 text-[10px]",
                    s.connected && s.valid ? "bg-primary/20 text-primary" : s.connected ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-muted-foreground"
                  )}
                >
                  {s.connected ? (s.valid ? "Connected" : "Invalid") : "Not connected"}
                </span>
              </div>
              {s.connected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteToken(p.key)}
                  disabled={deleting === p.key}
                  className="h-6 text-[10px] text-red-400 hover:text-red-300"
                >
                  {deleting === p.key ? "..." : "Disconnect"}
                </Button>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="password"
                value={tokens[p.key] ?? ""}
                onChange={(e) => setTokens((prev) => ({ ...prev, [p.key]: e.target.value }))}
                placeholder={p.placeholder}
                className="flex-1 rounded border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => testToken(p.key)}
                disabled={(!tokens[p.key]?.trim() && !s.connected) || !!testing}
                className="h-7 shrink-0 text-[10px]"
              >
                {testing === p.key ? "Testing..." : "Test"}
              </Button>
              <Button
                size="sm"
                onClick={() => saveToken(p.key)}
                disabled={!tokens[p.key]?.trim() || !!saving}
                className="h-7 shrink-0 text-[10px]"
              >
                {saving === p.key ? "Saving..." : s.connected ? "Update" : "Save"}
              </Button>
            </div>
            {s.connected && s.updatedAt && (
              <p className="mt-1 text-[10px] text-muted-foreground">
                Updated {new Date(s.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
