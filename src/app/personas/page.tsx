"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PersonaRow = {
  id: string;
  name: string;
  role: string;
  system_prompt: string;
  capabilities: string[];
  icon: string | null;
  created_at: string;
};

export default function PersonasPage() {
  const { user } = useAuth();
  const [personas, setPersonas] = React.useState<PersonaRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    fetch("/api/personas")
      .then((r) => r.json())
      .then((data) => {
        setPersonas(data.personas ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this persona? This cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch(`/api/personas/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPersonas((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleting(null);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Personas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Personas you&apos;ve built. These are also available in your SupraVibe dashboard.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 h-9 px-3 text-sm bg-primary text-primary-foreground hover:brightness-110"
        >
          + New Persona
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]" />
          ))}
        </div>
      ) : personas.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-12 text-center">
          <div className="text-4xl">🤖</div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">No personas yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first persona to get started.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 h-10 px-4 text-sm bg-primary text-primary-foreground hover:brightness-110"
          >
            Build a Persona
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {personas.map((p) => (
            <div
              key={p.id}
              className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg">
                {p.icon || "🤖"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{p.name}</h3>
                  {p.role && (
                    <span className="text-xs text-muted-foreground">{p.role}</span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {p.system_prompt}
                </p>
                {p.capabilities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.capabilities.map((cap) => (
                      <Badge key={cap} className="text-[10px]">
                        {cap.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  className="text-red-400 hover:text-red-300"
                >
                  {deleting === p.id ? "..." : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
