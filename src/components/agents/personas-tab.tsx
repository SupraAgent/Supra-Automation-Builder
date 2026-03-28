"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PersonaCard } from "@/components/agents/persona-card";
import { PersonaFormModal } from "@/components/agents/persona-form-modal";
import { PersonaImportModal } from "@/components/agents/persona-import-modal";
import type { Persona } from "@/lib/personas";

export function PersonasTab() {
  const [personas, setPersonas] = React.useState<Persona[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editPersona, setEditPersona] = React.useState<Persona | undefined>();
  const [copyMode, setCopyMode] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);

  const fetchPersonas = React.useCallback(async () => {
    try {
      const res = await fetch("/api/personas");
      if (res.ok) {
        const data = await res.json();
        setPersonas(data.personas ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const openCreate = () => {
    setEditPersona(undefined);
    setCopyMode(false);
    setModalOpen(true);
  };

  const openEdit = (persona: Persona) => {
    setEditPersona(persona);
    setCopyMode(false);
    setModalOpen(true);
  };

  const openCopy = (persona: Persona) => {
    setEditPersona(persona);
    setCopyMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (persona: Persona) => {
    if (!confirm(`Delete "${persona.name}"?`)) return;
    try {
      const res = await fetch(`/api/personas/${persona.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Persona deleted");
        await fetchPersonas();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete persona");
    }
  };

  const handleSave = async (data: {
    name: string;
    role: string;
    icon: string;
    systemPrompt: string;
    capabilities: string[];
    outputFormat: string | null;
    reviewFocus: string[];
    scoringWeights: Record<string, number> | null;
    id?: string;
  }) => {
    const isEdit = !!data.id;
    const url = isEdit ? `/api/personas/${data.id}` : "/api/personas";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save");
    }

    toast.success(isEdit ? "Persona updated" : "Persona created");
    setModalOpen(false);
    await fetchPersonas();
  };

  // Separate built-in and custom
  const builtIn = personas.filter((p) => p.isBuiltIn);
  const custom = personas.filter((p) => !p.isBuiltIn);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-foreground">Persona templates</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Define specialist roles for agent reviewers. Personas shape what agents focus on and how they score.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            Import
          </Button>
          <Button variant="default" size="sm" onClick={openCreate}>
            New persona
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-white/[0.03]" />
          ))}
        </div>
      ) : (
        <>
          {/* Custom personas first */}
          {custom.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {custom.map((p) => (
                  <PersonaCard key={p.id} persona={p} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Built-in templates */}
          {builtIn.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Built-in templates</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {builtIn.map((p) => (
                  <PersonaCard key={p.id} persona={p} onCopy={openCopy} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state (no built-in should never happen, but cover custom empty) */}
          {personas.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <span className="text-lg">🎭</span>
              </div>
              <h3 className="text-sm font-medium text-foreground">No personas yet</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Create a persona to define how agents review and score code changes.
              </p>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <PersonaFormModal
          persona={editPersona}
          copyMode={copyMode}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Import Modal */}
      {importOpen && (
        <PersonaImportModal
          onImported={fetchPersonas}
          onClose={() => setImportOpen(false)}
        />
      )}
    </div>
  );
}
