"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AGENT_ROLES,
  AGENT_SKILLS,
  ROLE_CATEGORIES,
  SKILL_CATEGORIES,
  COMMUNICATION_STYLES,
  VISIBILITY_OPTIONS,
  BUILDER_STEPS,
  PERSONA_TEMPLATES,
  LLM_PROVIDERS,
  GUARDRAIL_OPTIONS,
  TRIGGER_TYPES,
  SCHEDULE_PRESETS,
  EVENT_TRIGGERS,
  OUTPUT_FORMATS,
  createEmptyPersona,
  type AgentPersona,
  type AgentRole,
  type AgentVisibility,
  type BuilderStep,
  type PersonaTemplate,
  type SkillConfig,
  type SkillGuardrail,
  type OutputFormatId,
} from "@/lib/agent-personas";

/* ------------------------------------------------------------------ */
/*  Icons (inline SVGs matching codebase style)                        */
/* ------------------------------------------------------------------ */

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L4.56 7.25H13a.75.75 0 0 1 0 1.5H4.56l3.22 3.22a.75.75 0 0 1 0 1.06Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} fill="currentColor" className={className}>
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width={12} height={12} fill="currentColor" className={className}>
      <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} fill="currentColor" className={className}>
      <path d="M7.53 1.282a.5.5 0 0 1 .94 0l1.14 3.135a.5.5 0 0 0 .293.293L13.04 5.85a.5.5 0 0 1 0 .94l-3.135 1.14a.5.5 0 0 0-.293.293L8.47 11.36a.5.5 0 0 1-.94 0L6.39 8.223a.5.5 0 0 0-.293-.293L2.96 6.79a.5.5 0 0 1 0-.94L6.097 4.71a.5.5 0 0 0 .293-.293L7.53 1.282ZM3.28 10.599a.375.375 0 0 1 .706 0l.503 1.384a.375.375 0 0 0 .22.22l1.384.503a.375.375 0 0 1 0 .706l-1.384.503a.375.375 0 0 0-.22.22l-.503 1.384a.375.375 0 0 1-.706 0l-.503-1.384a.375.375 0 0 0-.22-.22l-1.384-.503a.375.375 0 0 1 0-.706l1.384-.503a.375.375 0 0 0 .22-.22l.503-1.384Z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} fill="currentColor" className={className}>
      <path d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-.5V4.5A3.5 3.5 0 0 0 8 1Zm2 6H6V4.5a2 2 0 1 1 4 0V7Z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} fill="currentColor" className={className}>
      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM5.37 2.13A6.5 6.5 0 0 0 1.55 7h2.96c.07-1.78.35-3.38.86-4.87Zm-.47 6.37H1.55a6.5 6.5 0 0 0 3.82 4.87c-.51-1.49-.79-3.09-.86-4.87h.39Zm1.5 0c.07 1.69.36 3.2.87 4.47.5-1.27.8-2.78.86-4.47H6.4Zm3.23 0c-.07 1.69-.36 3.2-.87 4.47-.5-1.27-.8-2.78-.86-4.47h1.73ZM6.4 7c.07-1.69.36-3.2.87-4.47.5 1.27.8 2.78.86 4.47H6.4Zm3.23 0c-.07-1.69-.36-3.2-.87-4.47-.5 1.27-.8 2.78-.86 4.47h1.73Zm1.48 1.5c-.07 1.78-.35 3.38-.86 4.87A6.5 6.5 0 0 0 14.45 8.5h-2.96l-.38 0Zm.86-1.5h2.96a6.5 6.5 0 0 0-3.82-4.87c.51 1.49.79 3.09.86 4.87Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */

const TOTAL_STEPS = 12;

function StepIndicator({ current }: { current: BuilderStep }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const step = (i + 1) as BuilderStep;
        const isActive = step === current;
        const isComplete = step < current;
        return (
          <div
            key={step}
            className={cn(
              "flex h-1.5 rounded-full transition-all duration-300",
              isActive ? "w-8 bg-primary" : "w-5",
              isComplete && "bg-primary/40",
              !isActive && !isComplete && "bg-white/10"
            )}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1: Role selection                                             */
/* ------------------------------------------------------------------ */

function RoleStep({
  persona,
  onChange,
}: {
  persona: AgentPersona;
  onChange: (p: Partial<AgentPersona>) => void;
}) {
  const [filter, setFilter] = React.useState<AgentRole["category"] | "all">("all");
  const [search, setSearch] = React.useState("");
  const [showCustom, setShowCustom] = React.useState(false);

  const filtered = React.useMemo(() => {
    let roles = filter === "all" ? AGENT_ROLES : AGENT_ROLES.filter((r) => r.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      roles = roles.filter((r) =>
        r.title.toLowerCase().includes(q) || r.shortDescription.toLowerCase().includes(q)
      );
    }
    return roles;
  }, [filter, search]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">What role does this agent fill?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each agent specializes in a specific function. Pick the role that best describes what this agent is responsible for on your team.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition",
            filter === "all" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {ROLE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilter(cat.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              filter === cat.id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search roles..."
        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
      />

      {/* Role grid */}
      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.length === 0 && (
          <p className="col-span-2 py-4 text-center text-sm text-muted-foreground">No roles match &ldquo;{search}&rdquo;</p>
        )}
        {filtered.map((role) => {
          const selected = persona.role?.id === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => {
                onChange({ role, customRole: "" });
                setShowCustom(false);
              }}
              className={cn(
                "flex flex-col items-start rounded-xl border p-3.5 text-left transition",
                selected
                  ? "border-primary/40 bg-primary/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{role.title}</span>
                {selected && <CheckIcon className="text-primary" />}
              </div>
              <span className="mt-0.5 text-xs text-muted-foreground">{role.shortDescription}</span>
            </button>
          );
        })}
      </div>

      {/* Custom role option */}
      <div>
        <button
          type="button"
          onClick={() => {
            setShowCustom(!showCustom);
            if (!showCustom) onChange({ role: null });
          }}
          className={cn(
            "rounded-xl border px-4 py-3 text-left text-sm transition w-full",
            showCustom
              ? "border-primary/40 bg-primary/10 text-foreground"
              : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/15"
          )}
        >
          + Define a custom role
        </button>
        {showCustom && (
          <input
            type="text"
            value={persona.customRole}
            onChange={(e) => onChange({ customRole: e.target.value, role: null })}
            placeholder="e.g. Head of Developer Experience"
            autoFocus
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2: Visibility (Personal vs Company)                           */
/* ------------------------------------------------------------------ */

function VisibilityStep({
  persona,
  onChange,
}: {
  persona: AgentPersona;
  onChange: (p: Partial<AgentPersona>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Personal or company agent?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This controls who can see and use this agent. Personal agents keep your tokens and API keys private. Company agents are shared across the team.
        </p>
      </div>

      <div className="grid gap-3">
        {VISIBILITY_OPTIONS.map((opt) => {
          const selected = persona.visibility === opt.id;
          const Icon = opt.id === "personal" ? LockIcon : GlobeIcon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ visibility: opt.id })}
              className={cn(
                "flex items-start gap-4 rounded-xl border p-5 text-left transition",
                selected
                  ? "border-primary/40 bg-primary/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
              )}
            >
              <div className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                selected ? "bg-primary/20" : "bg-white/10"
              )}>
                <Icon className={selected ? "text-primary" : "text-muted-foreground"} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                  {selected && <CheckIcon className="text-primary" />}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
                <div className="mt-2 rounded-lg bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Clone rules</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{opt.cloneRules}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {persona.visibility === "personal" && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <p className="text-xs text-amber-400">
            Personal agents: if someone clones this agent, they get the persona (role, focus, inspirations, principles, north star) but never your tokens, API keys, or skill connections. Their clone starts with no credentials.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3: Focus area                                                 */
/* ------------------------------------------------------------------ */

function FocusStep({
  persona,
  onChange,
}: {
  persona: AgentPersona;
  onChange: (p: Partial<AgentPersona>) => void;
}) {
  const roleLabel = persona.role?.title || persona.customRole || "this agent";

  const suggestions = React.useMemo(() => {
    const id = persona.role?.id;
    const map: Record<string, string[]> = {
      ceo: ["Series A fundraising strategy", "Team scaling from 10 to 50", "Market positioning in Web3"],
      cto: ["Frontend performance optimization", "Microservices migration", "Developer experience tooling"],
      cpo: ["Mobile-first onboarding flow", "Enterprise feature prioritization", "Self-serve analytics"],
      cmo: ["Developer marketing", "Brand positioning in crypto", "Content-led growth"],
      cfo: ["SaaS unit economics", "Token economics modeling", "Burn rate optimization"],
      cro: ["PLG revenue expansion", "Enterprise sales motion", "Pricing strategy"],
      cdo: ["Design system creation", "Mobile UX patterns", "Accessibility-first design"],
      retention: ["Mobile onboarding optimization", "Re-engagement campaigns", "Habit loop design"],
      pm: ["Feature discovery and validation", "Sprint velocity optimization", "Stakeholder alignment"],
      ux_researcher: ["Usability testing frameworks", "Behavioral analytics", "User journey mapping"],
      product_analyst: ["Funnel optimization", "Cohort analysis", "Experimentation frameworks"],
      staff_eng: ["System architecture reviews", "Code quality standards", "Technical debt reduction"],
      qa_lead: ["E2E test automation", "Performance regression detection", "Release quality gates"],
      devops: ["Zero-downtime deployments", "Infrastructure cost optimization", "Observability"],
      security: ["Smart contract auditing", "API security hardening", "Dependency vulnerability scanning"],
      growth_lead: ["Activation rate improvement", "Referral program design", "Landing page optimization"],
      content: ["Technical blog strategy", "Developer documentation", "SEO for developer tools"],
      community: ["Discord community building", "Developer advocacy programs", "Open source engagement"],
      ops: ["Cross-team process optimization", "Sprint retrospective facilitation", "Toolchain consolidation"],
      data_analyst: ["Real-time KPI dashboards", "Anomaly detection", "Self-serve reporting"],
    };
    return id ? (map[id] ?? []) : [];
  }, [persona.role?.id]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">What does {roleLabel} focus on?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Be specific. Two people with the same title can focus on completely different things. What problem is this agent solving for your team right now?
        </p>
      </div>

      <div>
        <textarea
          value={persona.focusArea}
          onChange={(e) => onChange({ focusArea: e.target.value })}
          placeholder="e.g. Reducing first-week churn by improving the onboarding flow for mobile users"
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
        />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          This becomes the agent&apos;s primary directive. Be as specific as possible.
        </p>
      </div>

      {suggestions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Suggestions for {roleLabel}</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ focusArea: s })}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs transition",
                  persona.focusArea === s
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/15 hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 4: Inspirations (tag input)                                   */
/* ------------------------------------------------------------------ */

function InspirationsStep({
  persona,
  onChange,
}: {
  persona: AgentPersona;
  onChange: (p: Partial<AgentPersona>) => void;
}) {
  const [input, setInput] = React.useState("");

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (persona.inspirations.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
    onChange({ inspirations: [...persona.inspirations, trimmed] });
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange({ inspirations: persona.inspirations.filter((_, i) => i !== index) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && persona.inspirations.length > 0) {
      removeTag(persona.inspirations.length - 1);
    }
  };

  const suggestions = [
    "Duolingo", "Linear", "Stripe", "Notion", "Figma", "Vercel",
    "Apple", "Spotify", "Slack", "Discord", "Superhuman", "Arc",
  ].filter((s) => !persona.inspirations.some((t) => t.toLowerCase() === s.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Which companies inspire this agent?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add companies or products whose approach this agent embodies. A Chief Retention Officer might draw from Duolingo&apos;s engagement loops and Spotify&apos;s personalization. This shapes how the agent thinks about problems.
        </p>
      </div>

      {/* Tag input */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 focus-within:border-primary/50 transition">
        <div className="flex flex-wrap items-center gap-1.5">
          {persona.inspirations.map((tag, i) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1 text-xs font-medium text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="rounded-sm hover:bg-primary/20 transition p-0.5"
              >
                <XIcon />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addTag(input)}
            placeholder={persona.inspirations.length === 0 ? "Type a company name and press Enter..." : "Add more..."}
            className="min-w-[120px] flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-1"
          />
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Press Enter or comma to add. Backspace to remove the last one.
      </p>

      {/* Quick suggestions */}
      {suggestions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Quick add</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.slice(0, 8).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-muted-foreground hover:border-white/15 hover:text-foreground transition"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 5: Communication style                                        */
/* ------------------------------------------------------------------ */

function StyleStep({
  persona,
  onChange,
}: {
  persona: AgentPersona;
  onChange: (p: Partial<AgentPersona>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">How does this agent think?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This determines the agent&apos;s approach to problem-solving. A data-driven agent will ask for metrics before making recommendations. A first-principles thinker will question your assumptions.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {COMMUNICATION_STYLES.map((style) => {
          const selected = persona.communicationStyle?.id === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange({ communicationStyle: style })}
              className={cn(
                "flex flex-col items-start rounded-xl border p-3.5 text-left transition",
                selected
                  ? "border-primary/40 bg-primary/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{style.label}</span>
                {selected && <CheckIcon className="text-primary" />}
              </div>
              <span className="mt-0.5 text-xs text-muted-foreground">{style.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 6: Core principles                                            */
/* ------------------------------------------------------------------ */

function PrinciplesStep({
  persona,
  onChange,
}: {
  persona: AgentPersona;
  onChange: (p: Partial<AgentPersona>) => void;
}) {
  const [input, setInput] = React.useState("");

  const addPrinciple = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (persona.principles.length >= 5) return;
    onChange({ principles: [...persona.principles, trimmed] });
    setInput("");
  };

  const removePrinciple = (index: number) => {
    onChange({ principles: persona.principles.filter((_, i) => i !== index) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPrinciple(input);
    }
  };

  const suggestions = React.useMemo(() => {
    const roleId = persona.role?.id;
    const styleId = persona.communicationStyle?.id;
    const all: string[] = [];

    if (roleId === "retention" || roleId === "growth_lead") {
      all.push("Reduce friction before adding features", "Every touchpoint is a retention opportunity", "Habits beat promotions");
    }
    if (roleId === "cpo" || roleId === "pm") {
      all.push("Ship the smallest thing that teaches us something", "User problems over feature requests", "Say no to most things");
    }
    if (roleId === "cto" || roleId === "staff_eng") {
      all.push("Simple beats clever", "Make the right thing easy and the wrong thing hard", "Observability is not optional");
    }
    if (roleId === "qa_lead") {
      all.push("If it's not tested, it's broken", "Catch it before the user does", "Flaky tests are not acceptable");
    }
    if (roleId === "cdo") {
      all.push("Consistency builds trust", "Design is how it works, not how it looks", "Accessibility is a feature, not a checkbox");
    }
    if (styleId === "data_driven") {
      all.push("Measure twice, ship once", "Intuition is a hypothesis, not a conclusion");
    }
    if (styleId === "move_fast") {
      all.push("Done is better than perfect", "Reversible decisions don't need committees");
    }
    if (styleId === "user_obsessed") {
      all.push("Talk to users every week", "The best feature is the one users already need");
    }

    all.push("Focus on outcomes, not output", "Transparency over politics", "Question the defaults");

    return [...new Set(all)].filter(
      (s) => !persona.principles.some((p) => p.toLowerCase() === s.toLowerCase())
    );
  }, [persona.role?.id, persona.communicationStyle?.id, persona.principles]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">What principles guide this agent?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add 2-5 core beliefs. These differentiate two agents with the same role. A CRO who believes &ldquo;reduce friction at all costs&rdquo; behaves very differently from one who believes &ldquo;create intentional friction to build habit loops.&rdquo;
        </p>
      </div>

      {persona.principles.length > 0 && (
        <div className="space-y-1.5">
          {persona.principles.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                {i + 1}
              </span>
              <span className="flex-1 text-sm text-foreground">{p}</span>
              <button
                type="button"
                onClick={() => removePrinciple(i)}
                className="rounded-sm p-1 text-muted-foreground hover:text-foreground transition"
              >
                <XIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      {persona.principles.length < 5 && (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a principle and press Enter..."
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addPrinciple(input)}
            disabled={!input.trim()}
          >
            Add
          </Button>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        {persona.principles.length}/5 principles added
      </p>

      {suggestions.length > 0 && persona.principles.length < 5 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Suggested principles</p>
          <div className="space-y-1">
            {suggestions.slice(0, 6).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addPrinciple(s)}
                className="block w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-xs text-muted-foreground hover:border-white/15 hover:text-foreground transition"
              >
                + &ldquo;{s}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 7: Skills / Access Control                                    */
/* ------------------------------------------------------------------ */

function SkillsStep({
  persona,
  onChange,
}: {
  persona: AgentPersona;
  onChange: (p: Partial<AgentPersona>) => void;
}) {
  const [filter, setFilter] = React.useState<"all" | string>("all");
  const [search, setSearch] = React.useState("");
  const [expandedSkill, setExpandedSkill] = React.useState<string | null>(null);

  const toggleSkill = (skillId: string) => {
    const current = persona.skills;
    if (current.includes(skillId)) {
      onChange({
        skills: current.filter((s) => s !== skillId),
        skillConfigs: persona.skillConfigs.filter((c) => c.skillId !== skillId),
      });
      if (expandedSkill === skillId) setExpandedSkill(null);
    } else {
      const defaultConfig: SkillConfig = { skillId, guardrail: "needs_approval", scope: "" };
      onChange({
        skills: [...current, skillId],
        skillConfigs: [...persona.skillConfigs, defaultConfig],
      });
      setExpandedSkill(skillId);
    }
  };

  const updateSkillConfig = (skillId: string, update: Partial<SkillConfig>) => {
    onChange({
      skillConfigs: persona.skillConfigs.map((c) =>
        c.skillId === skillId ? { ...c, ...update } : c
      ),
    });
  };

  const filtered = React.useMemo(() => {
    let skills = filter === "all" ? AGENT_SKILLS : AGENT_SKILLS.filter((s) => s.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      skills = skills.filter((s) =>
        s.label.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }
    return skills;
  }, [filter, search]);

  const requiredTokens = React.useMemo(() => {
    const tokens = new Set<string>();
    for (const skillId of persona.skills) {
      const skill = AGENT_SKILLS.find((s) => s.id === skillId);
      if (skill) {
        for (const t of skill.requiredTokens) tokens.add(t);
      }
    }
    return [...tokens];
  }, [persona.skills]);

  // Scope suggestions based on skill category
  const scopeSuggestions: Record<string, string[]> = {
    code: ["SupraAgent/Coder repo only", "main branch only", "feature branches only", "src/ directory only"],
    deploy: ["Preview deployments only", "All environments", "Staging only", "No production deploys"],
    review: ["PRs targeting main only", "All open PRs", "Agent-authored PRs only"],
    communicate: ["Internal team only", "Weekly cadence", "On-demand only"],
    analyze: ["Dashboard metrics only", "All Vercel projects", "Last 7 days only"],
    blockchain: ["Testnet only", "Mainnet read-only", "All networks"],
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Skills & Guardrails</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select skills and configure guardrails for each. Guardrails control what the agent can do autonomously vs. what needs approval. Scope limits where the skill applies.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition",
            filter === "all" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {SKILL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilter(cat.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              filter === cat.id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search skills..."
        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
      />

      {/* Skills list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">No skills match &ldquo;{search}&rdquo;</p>
        )}
        {filtered.map((skill) => {
          const selected = persona.skills.includes(skill.id);
          const isExpanded = expandedSkill === skill.id && selected;
          const config = persona.skillConfigs.find((c) => c.skillId === skill.id);

          return (
            <div key={skill.id} className={cn(
              "rounded-xl border transition overflow-hidden",
              selected
                ? "border-primary/40 bg-primary/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
            )}>
              <button
                type="button"
                onClick={() => toggleSkill(skill.id)}
                className="flex w-full items-start gap-3 p-3.5 text-left"
              >
                {/* Checkbox */}
                <div className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                  selected ? "border-primary bg-primary" : "border-white/20 bg-white/5"
                )}>
                  {selected && (
                    <svg viewBox="0 0 16 16" width={10} height={10} fill="currentColor" className="text-black">
                      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{skill.label}</span>
                    <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {skill.category}
                    </span>
                    {selected && config && (
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-medium",
                        config.guardrail === "autonomous" ? "bg-green-500/15 text-green-400" :
                        config.guardrail === "needs_approval" ? "bg-amber-500/15 text-amber-400" :
                        "bg-blue-500/15 text-blue-400"
                      )}>
                        {GUARDRAIL_OPTIONS.find((g) => g.id === config.guardrail)?.label}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{skill.description}</p>
                  {skill.requiredTokens.length > 0 && (
                    <div className="mt-1.5 flex gap-1">
                      {skill.requiredTokens.map((t) => (
                        <span key={t} className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expand/collapse for config */}
                {selected && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setExpandedSkill(isExpanded ? null : skill.id); }}
                    className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground transition"
                  >
                    <svg
                      viewBox="0 0 16 16" width={12} height={12} fill="currentColor"
                      className={cn("transition-transform", isExpanded && "rotate-180")}
                    >
                      <path fillRule="evenodd" d="M4.22 5.22a.75.75 0 0 1 1.06 0L8 7.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 6.28a.75.75 0 0 1 0-1.06Z" />
                    </svg>
                  </button>
                )}
              </button>

              {/* Guardrail & Scope config (expanded) */}
              {isExpanded && config && (
                <div className="border-t border-white/10 px-3.5 py-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                  {/* Guardrail selector */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Guardrail</p>
                    <div className="flex gap-1.5">
                      {GUARDRAIL_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateSkillConfig(skill.id, { guardrail: opt.id })}
                          className={cn(
                            "flex-1 rounded-lg border px-2.5 py-2 text-left transition",
                            config.guardrail === opt.id
                              ? "border-primary/40 bg-primary/10"
                              : "border-white/10 bg-white/[0.02] hover:border-white/15"
                          )}
                        >
                          <span className="block text-[11px] font-medium text-foreground">{opt.label}</span>
                          <span className="block text-[10px] text-muted-foreground">{opt.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scope input */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Scope</p>
                    <input
                      type="text"
                      value={config.scope}
                      onChange={(e) => updateSkillConfig(skill.id, { scope: e.target.value })}
                      placeholder="e.g. SupraAgent/Coder repo, main branch only"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                    />
                    {scopeSuggestions[skill.category] && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {scopeSuggestions[skill.category].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => updateSkillConfig(skill.id, { scope: s })}
                            className={cn(
                              "rounded border px-2 py-0.5 text-[10px] transition",
                              config.scope === s
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-white/10 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Required tokens summary */}
      {requiredTokens.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">Tokens needed for selected skills</p>
          <div className="mt-1.5 flex gap-2">
            {requiredTokens.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {t}
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            You&apos;ll configure these tokens after creating the agent.
          </p>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        {persona.skills.length} skill{persona.skills.length !== 1 ? "s" : ""} selected
        {persona.skillConfigs.filter((c) => c.scope).length > 0 && (
          <> &middot; {persona.skillConfigs.filter((c) => c.scope).length} scoped</>
        )}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 8: Domain Context / Knowledge                                 */
/* ------------------------------------------------------------------ */

function KnowledgeStep({
  persona,
  onChange,
}: {
  persona: AgentPersona;
  onChange: (p: Partial<AgentPersona>) => void;
}) {
  const [repoInput, setRepoInput] = React.useState("");
  const [docInput, setDocInput] = React.useState("");
  const [mcpInput, setMcpInput] = React.useState("");

  const addItem = (field: "repos" | "documentation" | "mcpServers", value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const current = persona.domainContext[field];
    if (current.includes(trimmed)) return;
    onChange({
      domainContext: { ...persona.domainContext, [field]: [...current, trimmed] },
    });
  };

  const removeItem = (field: "repos" | "documentation" | "mcpServers", index: number) => {
    onChange({
      domainContext: {
        ...persona.domainContext,
        [field]: persona.domainContext[field].filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">What does this agent know?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Give the agent context about your domain. Repos it works in, documentation it should reference, MCP servers it can query, and any other background knowledge.
        </p>
      </div>

      {/* Summary */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Domain summary</label>
        <textarea
          value={persona.domainContext.summary}
          onChange={(e) => onChange({ domainContext: { ...persona.domainContext, summary: e.target.value } })}
          placeholder="e.g. Supra is a high-throughput L1 blockchain with dual execution environments (Move VM + EVM)..."
          rows={2}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
        />
      </div>

      {/* Repos */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Repositories</label>
        {persona.domainContext.repos.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {persona.domainContext.repos.map((repo, i) => (
              <span key={repo} className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1 text-xs font-medium text-primary font-mono">
                {repo}
                <button type="button" onClick={() => removeItem("repos", i)} className="rounded-sm hover:bg-primary/20 transition p-0.5">
                  <XIcon />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("repos", repoInput); setRepoInput(""); } }}
            placeholder="org/repo, e.g. SupraAgent/Coder"
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <Button size="sm" variant="secondary" onClick={() => { addItem("repos", repoInput); setRepoInput(""); }} disabled={!repoInput.trim()}>
            Add
          </Button>
        </div>
      </div>

      {/* Documentation */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Documentation & References</label>
        {persona.domainContext.documentation.length > 0 && (
          <div className="mb-2 space-y-1">
            {persona.domainContext.documentation.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted-foreground font-mono">
                <span className="flex-1 truncate">{doc}</span>
                <button type="button" onClick={() => removeItem("documentation", i)} className="shrink-0 rounded-sm p-0.5 hover:text-foreground transition">
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={docInput}
            onChange={(e) => setDocInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("documentation", docInput); setDocInput(""); } }}
            placeholder="URL or file path, e.g. docs/api-reference.md"
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <Button size="sm" variant="secondary" onClick={() => { addItem("documentation", docInput); setDocInput(""); }} disabled={!docInput.trim()}>
            Add
          </Button>
        </div>
      </div>

      {/* MCP Servers */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">MCP Servers</label>
        {persona.domainContext.mcpServers.length > 0 && (
          <div className="mb-2 space-y-1">
            {persona.domainContext.mcpServers.map((server, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted-foreground font-mono">
                <span className="flex-1 truncate">{server}</span>
                <button type="button" onClick={() => removeItem("mcpServers", i)} className="shrink-0 rounded-sm p-0.5 hover:text-foreground transition">
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={mcpInput}
            onChange={(e) => setMcpInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("mcpServers", mcpInput); setMcpInput(""); } }}
            placeholder="e.g. @supra-agent/supra-move-mcp"
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground font-mono placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
          />
          <Button size="sm" variant="secondary" onClick={() => { addItem("mcpServers", mcpInput); setMcpInput(""); }} disabled={!mcpInput.trim()}>
            Add
          </Button>
        </div>
      </div>

      {/* Custom notes */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Additional context</label>
        <textarea
          value={persona.domainContext.customNotes}
          onChange={(e) => onChange({ domainContext: { ...persona.domainContext, customNotes: e.target.value } })}
          placeholder="Anything else the agent should know. Architecture decisions, team conventions, known gotchas..."
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 9: System Prompt / Instructions                               */
/* ------------------------------------------------------------------ */

function SystemPromptStep({
  persona,
  onChange,
}: {
  persona: AgentPersona;
  onChange: (p: Partial<AgentPersona>) => void;
}) {
  const [generating, setGenerating] = React.useState(false);

  const generatePrompt = () => {
    setGenerating(true);
    const roleLabel = persona.role?.title || persona.customRole || "Agent";
    const style = persona.communicationStyle?.label?.toLowerCase() || "balanced";
    const selectedSkills = AGENT_SKILLS.filter((s) => persona.skills.includes(s.id));

    const lines: string[] = [];
    lines.push(`You are a ${roleLabel} agent for the SupraVibe team dashboard.`);
    lines.push("");

    if (persona.focusArea) {
      lines.push(`## Primary Focus`);
      lines.push(persona.focusArea);
      lines.push("");
    }

    if (persona.principles.length > 0) {
      lines.push(`## Guiding Principles`);
      persona.principles.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
      lines.push("");
    }

    lines.push(`## Communication Style`);
    lines.push(`Use a ${style} approach. ${persona.communicationStyle?.description || ""}`);
    lines.push("");

    if (selectedSkills.length > 0) {
      lines.push(`## Available Skills`);
      for (const skill of selectedSkills) {
        const config = persona.skillConfigs.find((c) => c.skillId === skill.id);
        let line = `- **${skill.label}**: ${skill.description}`;
        if (config) {
          if (config.guardrail === "read_only") line += " [READ ONLY]";
          else if (config.guardrail === "needs_approval") line += " [NEEDS APPROVAL]";
          if (config.scope) line += ` (Scope: ${config.scope})`;
        }
        lines.push(line);
      }
      lines.push("");
    }

    if (persona.domainContext.summary) {
      lines.push(`## Domain Context`);
      lines.push(persona.domainContext.summary);
      lines.push("");
    }

    if (persona.domainContext.repos.length > 0) {
      lines.push(`## Repositories`);
      persona.domainContext.repos.forEach((r) => lines.push(`- ${r}`));
      lines.push("");
    }

    if (persona.domainContext.customNotes) {
      lines.push(`## Additional Notes`);
      lines.push(persona.domainContext.customNotes);
      lines.push("");
    }

    lines.push(`## Rules`);
    lines.push(`- Always explain your reasoning before taking action`);
    lines.push(`- For skills marked NEEDS APPROVAL, describe what you want to do and wait for confirmation`);
    lines.push(`- For skills marked READ ONLY, never take write actions`);
    lines.push(`- Stay within the defined scope for each skill`);

    setTimeout(() => {
      onChange({ systemPrompt: lines.join("\n") });
      setGenerating(false);
    }, 400);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">System Prompt</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This is the actual instruction set the agent runs with. Auto-generate from your choices so far, then edit to taste. This is the highest-leverage field in the entire builder.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={generatePrompt} disabled={generating} className="gap-1.5">
          <SparklesIcon className="text-primary" />
          {generating ? "Generating..." : persona.systemPrompt ? "Regenerate from persona" : "Generate from persona"}
        </Button>
        {persona.systemPrompt && (
          <span className="text-[11px] text-muted-foreground">
            {persona.systemPrompt.split("\n").length} lines
          </span>
        )}
      </div>

      <textarea
        value={persona.systemPrompt}
        onChange={(e) => onChange({ systemPrompt: e.target.value })}
        placeholder="Click Generate to create a system prompt from your persona choices, or write one from scratch..."
        rows={16}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-y font-mono leading-relaxed"
      />

      <p className="text-[11px] text-muted-foreground">
        This prompt is stored as metadata on the agent profile. It will be used as the system prompt when the agent runs.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 10: Trigger & Output                                          */
/* ------------------------------------------------------------------ */

function TriggerOutputStep({
  persona,
  onChange,
}: {
  persona: AgentPersona;
  onChange: (p: Partial<AgentPersona>) => void;
}) {
  const [customSchedule, setCustomSchedule] = React.useState("");

  const toggleEvent = (eventId: string) => {
    const current = persona.trigger.events || [];
    const updated = current.includes(eventId)
      ? current.filter((e) => e !== eventId)
      : [...current, eventId];
    onChange({ trigger: { ...persona.trigger, events: updated } });
  };

  const toggleOutput = (formatId: OutputFormatId) => {
    const current = persona.outputFormats;
    if (current.includes(formatId)) {
      onChange({ outputFormats: current.filter((f) => f !== formatId) });
    } else {
      onChange({ outputFormats: [...current, formatId] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">When does it run, and what does it produce?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure how the agent gets triggered and what kind of output it creates.
        </p>
      </div>

      {/* Trigger type */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Trigger</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {TRIGGER_TYPES.map((tt) => {
            const selected = persona.trigger.type === tt.id;
            return (
              <button
                key={tt.id}
                type="button"
                onClick={() => onChange({ trigger: { type: tt.id, schedule: persona.trigger.schedule, events: persona.trigger.events } })}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-3.5 text-left transition",
                  selected
                    ? "border-primary/40 bg-primary/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{tt.label}</span>
                  {selected && <CheckIcon className="text-primary" />}
                </div>
                <span className="mt-0.5 text-[11px] text-muted-foreground">{tt.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule config */}
      {persona.trigger.type === "schedule" && (
        <div>
          <p className="mb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Schedule</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {SCHEDULE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange({ trigger: { ...persona.trigger, schedule: preset.value } })}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs transition",
                  persona.trigger.schedule === preset.value
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/15 hover:text-foreground"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSchedule}
              onChange={(e) => setCustomSchedule(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onChange({ trigger: { ...persona.trigger, schedule: customSchedule } }); } }}
              placeholder="Or type a custom schedule..."
              className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => { onChange({ trigger: { ...persona.trigger, schedule: customSchedule } }); }}
              disabled={!customSchedule.trim()}
            >
              Set
            </Button>
          </div>
          {persona.trigger.schedule && (
            <p className="mt-1.5 text-[11px] text-primary">
              Current: {persona.trigger.schedule}
            </p>
          )}
        </div>
      )}

      {/* Event config */}
      {persona.trigger.type === "event" && (
        <div>
          <p className="mb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Events</p>
          <div className="space-y-1.5">
            {EVENT_TRIGGERS.map((evt) => {
              const selected = (persona.trigger.events || []).includes(evt.id);
              return (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => toggleEvent(evt.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition",
                    selected
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/15"
                  )}
                >
                  <div className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                    selected ? "border-primary bg-primary" : "border-white/20 bg-white/5"
                  )}>
                    {selected && (
                      <svg viewBox="0 0 16 16" width={10} height={10} fill="currentColor" className="text-black">
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-foreground">{evt.label}</span>
                    <span className="ml-2 text-[11px] text-muted-foreground">{evt.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Output formats */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Output Format</p>
        <p className="mb-3 text-[11px] text-muted-foreground">
          How does this agent deliver its results? Select all that apply.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {OUTPUT_FORMATS.map((fmt) => {
            const selected = persona.outputFormats.includes(fmt.id);
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => toggleOutput(fmt.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                  selected
                    ? "border-primary/40 bg-primary/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                )}
              >
                <div className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition",
                  selected ? "border-primary bg-primary" : "border-white/20 bg-white/5"
                )}>
                  {selected && (
                    <svg viewBox="0 0 16 16" width={10} height={10} fill="currentColor" className="text-black">
                      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="text-xs font-medium text-foreground">{fmt.label}</span>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{fmt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 11: LLM Model Selection                                       */
/* ------------------------------------------------------------------ */

function ModelStep({
  persona,
  onChange,
  tokenStatus,
}: {
  persona: AgentPersona;
  onChange: (p: Partial<AgentPersona>) => void;
  tokenStatus: Record<string, boolean>;
}) {
  const selectedProvider = LLM_PROVIDERS.find((p) => p.id === persona.llmProvider);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Which LLM powers this agent?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the AI model that runs this agent. Different models have different strengths -- pick the one that fits the agent&apos;s role and budget.
        </p>
      </div>

      {/* Provider selection */}
      <div className="grid gap-2 sm:grid-cols-2">
        {LLM_PROVIDERS.map((provider) => {
          const selected = persona.llmProvider === provider.id;
          const isConnected = tokenStatus[provider.settingsProvider];
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => {
                onChange({
                  llmProvider: provider.id,
                  llmModel: provider.models[0]?.id || "",
                });
              }}
              className={cn(
                "flex flex-col items-start rounded-xl border p-3.5 text-left transition",
                selected
                  ? "border-primary/40 bg-primary/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-sm font-medium text-foreground">{provider.label}</span>
                {selected && <CheckIcon className="text-primary" />}
                {isConnected !== undefined && (
                  <span className={cn(
                    "ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                    isConnected ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"
                  )}>
                    {isConnected ? "Connected" : "Not connected"}
                  </span>
                )}
              </div>
              <span className="mt-0.5 text-xs text-muted-foreground">{provider.description}</span>
            </button>
          );
        })}
      </div>

      {/* Not connected notice */}
      {selectedProvider && tokenStatus[selectedProvider.settingsProvider] === false && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <svg viewBox="0 0 16 16" width={14} height={14} fill="currentColor" className="shrink-0 text-amber-400">
            <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575ZM8 5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8 5Zm1 6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z" />
          </svg>
          <div className="flex-1">
            <p className="text-xs text-amber-400">
              {selectedProvider.label} API key not configured. The agent won&apos;t be able to run until you add it.
            </p>
          </div>
          <a
            href="/settings/integrations"
            className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400 hover:bg-amber-500/20 transition"
          >
            Connect in Settings
          </a>
        </div>
      )}

      {/* Model selection for chosen provider */}
      {selectedProvider && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Select model</p>
          <div className="space-y-1.5">
            {selectedProvider.models.map((model) => {
              const selected = persona.llmModel === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => onChange({ llmModel: model.id })}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition",
                    selected
                      ? "border-primary/40 bg-primary/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/15"
                  )}
                >
                  <div className={cn(
                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-primary bg-primary" : "border-white/20"
                  )}>
                    {selected && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                  </div>
                  <span className="flex-1 text-sm text-foreground">{model.label}</span>
                  <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {model.context} context
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 12: Review & Generate                                         */
/* ------------------------------------------------------------------ */

function ReviewStep({
  persona,
  onChange,
  generating,
  onGenerate,
}: {
  persona: AgentPersona;
  onChange: (p: Partial<AgentPersona>) => void;
  generating: boolean;
  onGenerate: () => void;
}) {
  const roleLabel = persona.role?.title || persona.customRole || "Custom Role";
  const selectedSkills = AGENT_SKILLS.filter((s) => persona.skills.includes(s.id));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Review & Generate Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review what you&apos;ve built, then generate the agent&apos;s North Star and display name. You can edit the North Star after generation.
        </p>
      </div>

      {/* Summary cards */}
      <div className="space-y-3">
        <SummaryRow label="Role" value={roleLabel} />
        <SummaryRow
          label="Visibility"
          value={persona.visibility === "personal" ? "Personal (private)" : "Company (shared)"}
        />
        <SummaryRow label="Focus" value={persona.focusArea || "Not specified"} />
        <SummaryRow
          label="Inspirations"
          value={
            persona.inspirations.length > 0
              ? persona.inspirations.join(", ")
              : "None added"
          }
        />
        <SummaryRow
          label="Style"
          value={persona.communicationStyle?.label || "Not selected"}
        />
        <SummaryRow
          label="Principles"
          value={
            persona.principles.length > 0
              ? persona.principles.map((p, i) => `${i + 1}. ${p}`).join("\n")
              : "None added"
          }
          multiline
        />
        <SummaryRow
          label="Skills"
          value={
            selectedSkills.length > 0
              ? selectedSkills.map((s) => {
                  const config = persona.skillConfigs.find((c) => c.skillId === s.id);
                  const guardrail = config ? ` [${GUARDRAIL_OPTIONS.find((g) => g.id === config.guardrail)?.label}]` : "";
                  const scope = config?.scope ? ` (${config.scope})` : "";
                  return `${s.label}${guardrail}${scope}`;
                }).join("\n")
              : "None selected"
          }
          multiline
        />
        <SummaryRow
          label="Knowledge"
          value={(() => {
            const parts: string[] = [];
            if (persona.domainContext.repos.length > 0) parts.push(`${persona.domainContext.repos.length} repo(s)`);
            if (persona.domainContext.documentation.length > 0) parts.push(`${persona.domainContext.documentation.length} doc(s)`);
            if (persona.domainContext.mcpServers.length > 0) parts.push(`${persona.domainContext.mcpServers.length} MCP server(s)`);
            if (persona.domainContext.summary) parts.push("Domain summary");
            if (persona.domainContext.customNotes) parts.push("Custom notes");
            return parts.length > 0 ? parts.join(", ") : "None configured";
          })()}
        />
        <SummaryRow
          label="Instructions"
          value={persona.systemPrompt ? `${persona.systemPrompt.split("\n").length} lines configured` : "Not configured"}
        />
        <SummaryRow
          label="Trigger"
          value={(() => {
            if (persona.trigger.type === "manual") return "Manual only";
            if (persona.trigger.type === "schedule") return `Scheduled: ${persona.trigger.schedule || "not set"}`;
            if (persona.trigger.type === "event") {
              const count = persona.trigger.events?.length || 0;
              return count > 0 ? `${count} event trigger(s)` : "Event-driven (none selected)";
            }
            return "Manual";
          })()}
        />
        <SummaryRow
          label="Output"
          value={
            persona.outputFormats.length > 0
              ? persona.outputFormats.map((f) => OUTPUT_FORMATS.find((o) => o.id === f)?.label || f).join(", ")
              : "None selected"
          }
        />
        <SummaryRow
          label="Model"
          value={(() => {
            const prov = LLM_PROVIDERS.find((p) => p.id === persona.llmProvider);
            const model = prov?.models.find((m) => m.id === persona.llmModel);
            return model ? `${prov?.label} ${model.label}` : persona.llmModel || "Not selected";
          })()}
        />
      </div>

      {/* Generate North Star */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">North Star</h3>
            <p className="text-[11px] text-muted-foreground">
              The agent&apos;s guiding philosophy, auto-generated from the persona above.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={onGenerate}
            disabled={generating}
            className="gap-1.5"
          >
            <SparklesIcon className="text-primary" />
            {generating ? "Generating..." : persona.northStar ? "Regenerate" : "Generate"}
          </Button>
        </div>

        {persona.northStar && (
          <textarea
            value={persona.northStar}
            onChange={(e) => onChange({ northStar: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none resize-none"
          />
        )}
      </div>

      {/* Display name */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Agent display name</label>
        <input
          type="text"
          value={persona.displayName}
          onChange={(e) => onChange({ displayName: e.target.value })}
          placeholder={`e.g. ${roleLabel} Agent`}
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
        />
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          This is how the agent appears in the team dashboard.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
      <span className="shrink-0 text-xs font-medium text-muted-foreground w-24">{label}</span>
      <span className={cn("text-sm text-foreground", multiline && "whitespace-pre-line")}>
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Template Selection Screen                                          */
/* ------------------------------------------------------------------ */

function TemplateSelection({
  onSelectTemplate,
  onStartBlank,
  onQuickCreate,
}: {
  onSelectTemplate: (template: PersonaTemplate) => void;
  onStartBlank: () => void;
  onQuickCreate: (name: string) => void;
}) {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [quickName, setQuickName] = React.useState("");
  const [showQuick, setShowQuick] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Start from scratch -- primary action */}
      <button
        type="button"
        onClick={onStartBlank}
        className="group w-full rounded-xl border border-primary/30 bg-primary/[0.06] p-5 text-left hover:border-primary/50 hover:bg-primary/[0.10] transition"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
            <svg viewBox="0 0 16 16" width={18} height={18} fill="currentColor" className="text-primary">
              <path d="M7.25 1a.75.75 0 0 1 .75.75V7.25H13.75a.75.75 0 0 1 0 1.5H8v5.5a.75.75 0 0 1-1.5 0V8.75H1a.75.75 0 0 1 0-1.5h5.5V1.75A.75.75 0 0 1 7.25 1Z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Start from scratch</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Build every detail step by step -- role, skills, style, and principles</p>
          </div>
          <svg viewBox="0 0 16 16" width={14} height={14} fill="currentColor" className="shrink-0 text-muted-foreground group-hover:text-primary transition">
            <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </div>
      </button>

      {/* Quick create -- compact secondary */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowQuick(!showQuick)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <svg viewBox="0 0 16 16" width={14} height={14} fill="currentColor" className="text-muted-foreground">
              <path d="M11.251.068a.999.999 0 0 1 .645.39l.902 1.279 1.56.14a1 1 0 0 1 .862 1.118l-.21 1.552.994 1.188a1 1 0 0 1-.126 1.408L14.6 7.99l.47 1.49a1 1 0 0 1-.66 1.254l-1.508.474-.298 1.548a1 1 0 0 1-1.162.822l-1.548-.23-1.088 1.106a1 1 0 0 1-1.412.024l-1.168-1.024-1.543.32a1 1 0 0 1-1.188-.776l-.368-1.53-1.447-.575a1 1 0 0 1-.558-1.3l.56-1.458L1.45 6.9a1 1 0 0 1 .198-1.398l1.24-.949.056-1.56A1 1 0 0 1 4.01 2.09l1.54.193L6.68.494A1 1 0 0 1 8.028.06l1.274.907 1.55-.204a1 1 0 0 1 .399.305ZM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
            </svg>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-foreground">Quick create</span>
            <span className="ml-2 text-xs text-muted-foreground">Just a name, skip the wizard</span>
          </div>
          <svg
            viewBox="0 0 16 16" width={12} height={12} fill="currentColor"
            className={cn("shrink-0 text-muted-foreground transition-transform", showQuick && "rotate-180")}
          >
            <path fillRule="evenodd" d="M4.22 5.22a.75.75 0 0 1 1.06 0L8 7.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 6.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
        {showQuick && (
          <div className="border-t border-white/10 px-4 py-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && quickName.trim()) onQuickCreate(quickName.trim()); }}
                placeholder="Agent name, e.g. AutoVibe"
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                autoFocus
              />
              <Button size="sm" onClick={() => quickName.trim() && onQuickCreate(quickName.trim())} disabled={!quickName.trim()}>
                Create
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Templates section */}
      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Or start from a template</p>
        <div className="space-y-3">
          {PERSONA_TEMPLATES.map((template) => {
            const isExpanded = expanded === template.id;
            return (
              <div
                key={template.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition hover:border-white/15"
              >
                {/* Header row */}
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : template.id)}
                  className="flex w-full items-start gap-4 p-4 text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                    {template.icon === "chain" && (
                      <svg viewBox="0 0 16 16" width={18} height={18} fill="currentColor" className="text-primary">
                        <path d="M10.68 2.32a3.5 3.5 0 0 1 0 4.95l-.35.35-.71-.71.35-.35a2.5 2.5 0 0 0-3.54-3.54l-2 2a2.5 2.5 0 0 0 3.54 3.54l.35-.35.71.71-.35.35a3.5 3.5 0 0 1-4.95-4.95l2-2a3.5 3.5 0 0 1 4.95 0Zm-5.36 11.36a3.5 3.5 0 0 1 0-4.95l.35-.35.71.71-.35.35a2.5 2.5 0 0 0 3.54 3.54l2-2a2.5 2.5 0 0 0-3.54-3.54l-.35.35-.71-.71.35-.35a3.5 3.5 0 0 1 4.95 4.95l-2 2a3.5 3.5 0 0 1-4.95 0Z" />
                      </svg>
                    )}
                    {template.icon === "trending" && (
                      <svg viewBox="0 0 16 16" width={18} height={18} fill="currentColor" className="text-primary">
                        <path fillRule="evenodd" d="M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V5.414l-3.293 3.293a1 1 0 0 1-1.414 0L6 6.414 2.707 9.707a1 1 0 0 1-1.414-1.414l4-4a1 1 0 0 1 1.414 0L9 6.586 11.586 4H10a1 1 0 0 1-1-1Z" />
                      </svg>
                    )}
                    {template.icon === "shield" && (
                      <svg viewBox="0 0 16 16" width={18} height={18} fill="currentColor" className="text-primary">
                        <path d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0Zm2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 7.793l2.646-2.647Z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{template.name}</span>
                      <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        {template.category}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{template.tagline}</p>
                  </div>
                  <svg
                    viewBox="0 0 16 16" width={14} height={14} fill="currentColor"
                    className={cn("mt-1 shrink-0 text-muted-foreground transition-transform", isExpanded && "rotate-180")}
                  >
                    <path fillRule="evenodd" d="M4.22 5.22a.75.75 0 0 1 1.06 0L8 7.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 6.28a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-white/10 px-4 pb-4 pt-3 space-y-4">
                    <p className="text-xs text-muted-foreground">{template.description}</p>

                    {/* Domain context */}
                    <div className="space-y-3">
                      {/* MCP Servers */}
                      {template.domainContext.mcpServers && template.domainContext.mcpServers.length > 0 && (
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">MCP Servers</p>
                          <div className="space-y-1">
                            {template.domainContext.mcpServers.map((server) => (
                              <div key={server} className="rounded-lg bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted-foreground font-mono">
                                {server}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Capabilities */}
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Capabilities</p>
                        <div className="flex flex-wrap gap-1">
                          {template.domainContext.capabilities.slice(0, 6).map((cap) => (
                            <span key={cap} className="rounded bg-white/[0.04] px-2 py-1 text-[10px] text-muted-foreground">
                              {cap}
                            </span>
                          ))}
                          {template.domainContext.capabilities.length > 6 && (
                            <span className="rounded bg-white/[0.04] px-2 py-1 text-[10px] text-muted-foreground">
                              +{template.domainContext.capabilities.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Networks */}
                      {template.domainContext.networks && template.domainContext.networks.length > 0 && (
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Networks</p>
                          <div className="grid gap-1.5 sm:grid-cols-2">
                            {template.domainContext.networks.map((net) => (
                              <div key={net.name} className="rounded-lg bg-white/[0.03] px-3 py-2">
                                <p className="text-[11px] font-medium text-foreground">{net.name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono truncate">{net.rpc}</p>
                                <p className="text-[10px] text-muted-foreground">Chain ID: {net.chainId}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pre-filled fields */}
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Pre-configured</p>
                        <div className="flex flex-wrap gap-1">
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{template.persona.role?.title || template.persona.customRole}</span>
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{template.persona.communicationStyle?.label} style</span>
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{template.persona.skills.length} skills</span>
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{template.persona.principles.length} principles</span>
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{template.persona.inspirations.length} inspirations</span>
                        </div>
                      </div>
                    </div>

                    <Button size="sm" onClick={() => onSelectTemplate(template)}>
                      Use this template
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main wizard page                                                   */
/* ------------------------------------------------------------------ */

export default function AgentPersonaBuilderPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<"choose" | "building">("choose");
  const [appliedTemplate, setAppliedTemplate] = React.useState<PersonaTemplate | null>(null);
  const [step, setStep] = React.useState<BuilderStep>(1);
  const [persona, setPersona] = React.useState<AgentPersona>(createEmptyPersona);
  const [generating, setGenerating] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [tokenStatus, setTokenStatus] = React.useState<Record<string, boolean>>({});

  // Fetch token connection status for all LLM providers
  React.useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/tokens/status");
        if (!res.ok) return;
        const data = await res.json();
        const status: Record<string, boolean> = {};
        const source = data.status || data.providers || {};
        for (const [provider, info] of Object.entries(source as Record<string, { connected: boolean }>)) {
          status[provider] = info.connected;
        }
        setTokenStatus(status);
      } catch {
        // Silent -- not critical
      }
    }
    fetchStatus();
  }, []);

  const update = (partial: Partial<AgentPersona>) => {
    setPersona((prev) => ({ ...prev, ...partial }));
  };

  const applyTemplate = (template: PersonaTemplate) => {
    const { suggestedName, ...rest } = template.persona;
    setPersona({
      ...rest,
      displayName: suggestedName,
      // New fields not in templates -- use defaults
      skillConfigs: rest.skills.map((skillId) => ({
        skillId,
        guardrail: "needs_approval" as SkillGuardrail,
        scope: "",
      })),
      domainContext: {
        summary: template.domainContext.summary,
        repos: [],
        documentation: template.domainContext.documentation || [],
        mcpServers: template.domainContext.mcpServers || [],
        customNotes: "",
      },
      systemPrompt: "",
      trigger: { type: "manual" },
      outputFormats: [],
    });
    setAppliedTemplate(template);
    setMode("building");
    // Skip to review since everything is pre-filled
    setStep(12 as BuilderStep);
  };

  const startBlank = () => {
    setPersona(createEmptyPersona());
    setAppliedTemplate(null);
    setMode("building");
    setStep(1);
  };

  const quickCreate = async (name: string) => {
    try {
      const res = await fetch("/api/agents/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create agent");
        return;
      }
      toast.success(`Agent "${name}" created`);
      router.push("/agents?tab=accounts");
    } catch {
      toast.error("Failed to create agent");
    }
  };

  const canAdvance = React.useMemo(() => {
    switch (step) {
      case 1:
        return persona.role !== null || persona.customRole.trim().length > 0;
      case 2:
        return true; // Visibility always has a default
      case 3:
        return persona.focusArea.trim().length > 0;
      case 4:
        return true; // Inspirations are optional
      case 5:
        return persona.communicationStyle !== null;
      case 6:
        return persona.principles.length >= 1;
      case 7:
        return true; // Skills are optional
      case 8:
        return true; // Knowledge is optional
      case 9:
        return true; // System prompt is optional (can be generated later)
      case 10:
        return true; // Trigger & output are optional
      case 11:
        return persona.llmProvider.length > 0 && persona.llmModel.length > 0;
      case 12:
        return persona.displayName.trim().length > 0 && persona.northStar.trim().length > 0;
      default:
        return false;
    }
  }, [step, persona]);

  const next = () => {
    if (step < TOTAL_STEPS) setStep((s) => (s + 1) as BuilderStep);
  };

  const prev = () => {
    if (step > 1) setStep((s) => (s - 1) as BuilderStep);
  };

  /* --- Generate North Star --- */
  const generateNorthStar = () => {
    setGenerating(true);

    const roleLabel = persona.role?.title || persona.customRole;
    const style = persona.communicationStyle?.label?.toLowerCase() || "balanced";
    const inspo = persona.inspirations.length > 0 ? persona.inspirations.join(", ") : null;
    const focus = persona.focusArea;
    const selectedSkills = AGENT_SKILLS.filter((s) => persona.skills.includes(s.id));

    const parts: string[] = [];
    parts.push(`As a ${roleLabel}, this agent's mission is to ${focus.charAt(0).toLowerCase() + focus.slice(1)}${focus.endsWith(".") ? "" : "."}`);

    if (inspo) {
      parts.push(`Drawing inspiration from ${inspo}, they bring a ${style} approach to every decision.`);
    } else {
      parts.push(`They bring a ${style} approach to every decision.`);
    }

    if (persona.principles.length > 0) {
      parts.push(`Core beliefs: ${persona.principles.map((p) => `"${p}"`).join("; ")}.`);
    }

    if (selectedSkills.length > 0) {
      parts.push(`Equipped with: ${selectedSkills.map((s) => s.label.toLowerCase()).join(", ")}.`);
    }

    if (persona.trigger.type === "schedule" && persona.trigger.schedule) {
      parts.push(`Runs ${persona.trigger.schedule}.`);
    } else if (persona.trigger.type === "event" && persona.trigger.events?.length) {
      parts.push(`Triggered by: ${persona.trigger.events.map((e) => e.replace(/_/g, " ")).join(", ")}.`);
    }

    if (persona.outputFormats.length > 0) {
      const labels = persona.outputFormats.map((f) => OUTPUT_FORMATS.find((o) => o.id === f)?.label || f);
      parts.push(`Delivers results via: ${labels.join(", ").toLowerCase()}.`);
    }

    setTimeout(() => {
      update({ northStar: parts.join(" ") });
      setGenerating(false);
    }, 600);
  };

  /* --- Create agent --- */
  const handleCreate = async () => {
    if (!persona.displayName.trim()) return;
    setCreating(true);

    try {
      const selectedSkills = AGENT_SKILLS.filter((s) => persona.skills.includes(s.id));
      const metadata: Record<string, unknown> = {
        persona: {
          role: persona.role?.title || persona.customRole,
          roleId: persona.role?.id || "custom",
          visibility: persona.visibility,
          focusArea: persona.focusArea,
          inspirations: persona.inspirations,
          communicationStyle: persona.communicationStyle?.id,
          communicationStyleLabel: persona.communicationStyle?.label,
          principles: persona.principles,
          skills: persona.skills,
          skillLabels: selectedSkills.map((s) => s.label),
          skillConfigs: persona.skillConfigs,
          domainContext: appliedTemplate
            ? appliedTemplate.domainContext
            : persona.domainContext,
          systemPrompt: persona.systemPrompt,
          trigger: persona.trigger,
          outputFormats: persona.outputFormats,
          llmProvider: persona.llmProvider,
          llmModel: persona.llmModel,
          northStar: persona.northStar,
          ...(appliedTemplate ? {
            templateId: appliedTemplate.id,
            templateName: appliedTemplate.name,
          } : {}),
        },
      };

      const res = await fetch("/api/agents/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: persona.displayName.trim(),
          metadata,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create agent");
        return;
      }

      toast.success(`Agent "${persona.displayName}" created`);
      router.push("/agents?tab=accounts");
    } catch {
      toast.error("Failed to create agent");
    } finally {
      setCreating(false);
    }
  };

  // Steps that can be skipped
  const isSkippable = step === 4 || step === 7 || step === 8 || step === 9 || step === 10; // Inspirations, Skills, Knowledge, Instructions, Trigger

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/agents"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeftIcon />
        Back to Agents
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Agent Persona Builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build a specialized team agent step by step. Define who they are, what they focus on, and how they think.
        </p>
      </div>

      {mode === "choose" ? (
        /* Template selection screen */
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <TemplateSelection
            onSelectTemplate={applyTemplate}
            onStartBlank={startBlank}
            onQuickCreate={quickCreate}
          />
        </div>
      ) : (
        <>
          {/* Template banner if applied */}
          {appliedTemplate && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.04] px-4 py-2.5">
              <SparklesIcon className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-foreground">Template: {appliedTemplate.name}</span>
                <span className="text-xs text-muted-foreground ml-2">Pre-filled with domain knowledge and {appliedTemplate.domainContext.capabilities.length} capabilities</span>
              </div>
              <button
                type="button"
                onClick={() => { setMode("choose"); setAppliedTemplate(null); }}
                className="text-[11px] text-muted-foreground hover:text-foreground transition"
              >
                Change
              </button>
            </div>
          )}

          {/* Step indicator */}
          <div className="mb-2 flex items-center justify-between">
            <StepIndicator current={step} />
            <span className="text-xs text-muted-foreground">
              Step {step} of {TOTAL_STEPS} &middot; {BUILDER_STEPS[step - 1].title}
            </span>
          </div>

          {/* Step content */}
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            {step === 1 && <RoleStep persona={persona} onChange={update} />}
            {step === 2 && <VisibilityStep persona={persona} onChange={update} />}
            {step === 3 && <FocusStep persona={persona} onChange={update} />}
            {step === 4 && <InspirationsStep persona={persona} onChange={update} />}
            {step === 5 && <StyleStep persona={persona} onChange={update} />}
            {step === 6 && <PrinciplesStep persona={persona} onChange={update} />}
            {step === 7 && <SkillsStep persona={persona} onChange={update} />}
            {step === 8 && <KnowledgeStep persona={persona} onChange={update} />}
            {step === 9 && <SystemPromptStep persona={persona} onChange={update} />}
            {step === 10 && <TriggerOutputStep persona={persona} onChange={update} />}
            {step === 11 && <ModelStep persona={persona} onChange={update} tokenStatus={tokenStatus} />}
            {step === 12 && (
              <ReviewStep
                persona={persona}
                onChange={update}
                generating={generating}
                onGenerate={generateNorthStar}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div>
              {step > 1 ? (
                <Button variant="ghost" size="sm" onClick={prev}>
                  Back
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setMode("choose")}>
                  Templates
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step < TOTAL_STEPS ? (
                <>
                  {isSkippable && (
                    <Button variant="ghost" size="sm" onClick={next}>
                      Skip
                    </Button>
                  )}
                  <Button size="sm" onClick={next} disabled={!canAdvance}>
                    Continue
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={!canAdvance || creating}
                >
                  {creating ? "Creating..." : "Create Agent"}
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
