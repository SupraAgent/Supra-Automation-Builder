"use client";

import * as React from "react";
import {
  getBuilderTemplates,
  deleteBuilderTemplate,
  builderTemplateToFlowNodes,
  SOURCE_META,
  type BuilderTemplate,
  type BuilderTemplateSource,
} from "@/lib/builder-templates";
import type { Node, Edge } from "@xyflow/react";

type MyTemplatesPanelProps = {
  onAddToCanvas: (nodes: Node[], edges: Edge[]) => void;
  canvasNodeCount: number;
  onClose: () => void;
};

const SOURCES: BuilderTemplateSource[] = [
  "persona-studio",
  "launch-kit",
  "design-to-ship",
];

export function MyTemplatesPanel({
  onAddToCanvas,
  canvasNodeCount,
  onClose,
}: MyTemplatesPanelProps) {
  const [templates, setTemplates] = React.useState<BuilderTemplate[]>([]);
  const [filterSource, setFilterSource] = React.useState<
    BuilderTemplateSource | "all"
  >("all");
  const [addedId, setAddedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTemplates(getBuilderTemplates());
  }, []);

  function handleDelete(id: string) {
    deleteBuilderTemplate(id);
    setTemplates(getBuilderTemplates());
  }

  function handleAddToCanvas(template: BuilderTemplate) {
    // Offset based on existing nodes so templates don't stack
    const offsetY = canvasNodeCount * 80;
    const { nodes, edges } = builderTemplateToFlowNodes(template, offsetY);
    onAddToCanvas(nodes, edges);
    setAddedId(template.id);
    setTimeout(() => setAddedId(null), 2000);
  }

  function handleDragStart(
    e: React.DragEvent,
    template: BuilderTemplate
  ) {
    e.dataTransfer.setData(
      "application/builder-template",
      JSON.stringify(template)
    );
    e.dataTransfer.effectAllowed = "copy";
  }

  const filtered =
    filterSource === "all"
      ? templates
      : templates.filter((t) => t.source === filterSource);

  return (
    <div className="flex h-full flex-col border-l border-white/10 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-bold text-foreground">My Templates</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition text-sm"
        >
          ✕
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 px-4 py-3 border-b border-white/10">
        <button
          onClick={() => setFilterSource("all")}
          className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
            filterSource === "all"
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
          }`}
        >
          All ({templates.length})
        </button>
        {SOURCES.map((src) => {
          const count = templates.filter((t) => t.source === src).length;
          if (count === 0) return null;
          const meta = SOURCE_META[src];
          return (
            <button
              key={src}
              onClick={() => setFilterSource(src)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                filterSource === src
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
              }`}
            >
              {meta.icon} {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Template list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No templates yet.</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Create templates from Persona Studio, Launch Kit, or
              Design-to-Ship.
            </p>
          </div>
        ) : (
          filtered.map((template) => {
            const meta = SOURCE_META[template.source];
            const isAdded = addedId === template.id;

            return (
              <div
                key={template.id}
                draggable
                onDragStart={(e) => handleDragStart(e, template)}
                className="group rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:bg-white/5 hover:border-white/20 transition cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm flex-shrink-0">{meta.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {template.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {template.description}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(template.id);
                    }}
                    className="text-[10px] text-muted-foreground hover:text-red-400 transition opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {/* Meta row */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] text-muted-foreground border border-white/10">
                    {meta.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground/50">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Add button */}
                <button
                  onClick={() => handleAddToCanvas(template)}
                  className={`mt-2 w-full rounded-lg px-2 py-1.5 text-[11px] font-medium transition ${
                    isAdded
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10 hover:text-foreground"
                  }`}
                >
                  {isAdded ? "Added to canvas!" : "Add to canvas"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Help text */}
      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
          Drag templates onto the canvas or click &quot;Add to canvas&quot; to
          merge them into your workflow. Load multiple templates to combine
          teams, projects, and designs.
        </p>
      </div>
    </div>
  );
}
