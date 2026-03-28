"use client";

import * as React from "react";
import { AgentMapPanel } from "./agent-map-panel";
import { OrgChartPanel } from "./org-chart-panel";
import { ExportPanel } from "./export-panel";

type Tab = "agents" | "org" | "export";

const tabs: { id: Tab; label: string; sub: string }[] = [
  { id: "agents", label: "Agent Map", sub: "Personas as Paperclip agents" },
  { id: "org", label: "Org Chart", sub: "Hierarchy & reporting lines" },
  { id: "export", label: "Export", sub: "Generate Paperclip config" },
];

export function PaperclipDashboard() {
  const [tab, setTab] = React.useState<Tab>("agents");

  return (
    <>
      {/* Tab Switcher */}
      <div className="mb-8 flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition cursor-pointer ${
              tab === t.id
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            {t.label}
            <span className="block text-[10px] mt-0.5 font-normal">
              {t.sub}
            </span>
          </button>
        ))}
      </div>

      {tab === "agents" && <AgentMapPanel />}
      {tab === "org" && <OrgChartPanel />}
      {tab === "export" && <ExportPanel />}
    </>
  );
}
