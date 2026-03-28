"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

type PersonaRow = {
  id: string;
  name: string;
};

const WIZARD_LINKS = [
  {
    icon: "\u{1F3AC}",
    label: "Persona Studio",
    href: "/studio",
    description: "Create AI advisors with optional deep expert & agent capabilities",
  },
  {
    icon: "\u{1F4E6}",
    label: "Launch Kit",
    href: "/launch-kit",
    description: "Full project planning with persona team and tech stack",
  },
  {
    icon: "\u{1F3A8}",
    label: "Design-to-Ship",
    href: "/design-to-ship",
    description: "From project brief through design system to shipping",
  },
  {
    icon: "\u{1F4BB}",
    label: "VibeCode",
    href: "/vibecode",
    description: "Generate project scaffolds with persona-driven CLAUDE.md",
  },
  {
    icon: "\u{1F50D}",
    label: "Auto-Research",
    href: "/consult",
    description: "Score and evaluate your personas with AI analysis",
  },
];

const DOC_TYPES = [
  { label: "System Prompts", description: "Persona consultation prompts" },
  { label: "Whitepapers", description: "Project documentation from Launch Kit" },
  { label: "Design Systems", description: "Color, typography, and spacing specs" },
  { label: "Scaffold Specs", description: "Project structure from VibeCode" },
  { label: "Evaluation Reports", description: "Auto-Research persona scores" },
];

export function DashboardPage() {
  const { user } = useAuth();
  const [personaCount, setPersonaCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!user) return;
    fetch("/api/personas")
      .then((r) => r.json())
      .then((data) => setPersonaCount(data.personas?.length ?? 0))
      .catch(() => setPersonaCount(0));
  }, [user]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Docs Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your knowledge hub — personas, documents, and quick access to every tool.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {personaCount === null ? "..." : personaCount}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Personas Saved</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <div className="text-2xl font-bold text-foreground">5</div>
          <div className="mt-1 text-xs text-muted-foreground">Tools Available</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{DOC_TYPES.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">Document Types</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {WIZARD_LINKS.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{w.icon}</span>
                <div>
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {w.label}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {w.description}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Document Types */}
      <div>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Document Types
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {DOC_TYPES.map((d) => (
            <div
              key={d.label}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="text-sm font-medium text-foreground">{d.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{d.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
