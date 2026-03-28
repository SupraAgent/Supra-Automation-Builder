export type DeployTarget = "web_only" | "web_ios" | "web_ios_android";

export const DEPLOY_TARGETS: { id: DeployTarget; label: string; description: string; techNote: string }[] = [
  { id: "web_only", label: "Website Only", description: "Web app deployed to a single domain", techNote: "Standard Next.js or SPA" },
  { id: "web_ios", label: "Website + iOS", description: "Web app plus native iOS app from shared codebase", techNote: "React Native / Expo recommended" },
  { id: "web_ios_android", label: "Website + iOS + Android", description: "Universal app across all platforms from one codebase", techNote: "React Native / Expo or Flutter" },
];

export const MOBILE_FRAMEWORK_OPTIONS = ["React Native / Expo", "Flutter", "Capacitor", "PWA"];

export type ProjectType =
  | "consumer_app"
  | "saas"
  | "marketplace"
  | "content_platform"
  | "ecommerce"
  | "developer_tool";

export const PROJECT_TYPES: {
  id: ProjectType;
  label: string;
  description: string;
  suggestedRoles: string[];
}[] = [
  {
    id: "consumer_app",
    label: "Consumer App",
    description: "Mobile or web app for end users",
    suggestedRoles: [
      "Product Lead",
      "UI/UX Lead",
      "Retention Lead",
      "Growth Lead",
      "Tech Architect",
    ],
  },
  {
    id: "saas",
    label: "SaaS",
    description: "Business software as a service",
    suggestedRoles: [
      "Product Lead",
      "UI/UX Lead",
      "Revenue Lead",
      "Tech Architect",
      "Customer Success",
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    description: "Two-sided platform connecting buyers and sellers",
    suggestedRoles: [
      "Product Lead",
      "UI/UX Lead",
      "Growth Lead",
      "Trust & Safety",
      "Tech Architect",
    ],
  },
  {
    id: "content_platform",
    label: "Content Platform",
    description: "Content creation and distribution",
    suggestedRoles: [
      "Product Lead",
      "UI/UX Lead",
      "Content Strategy",
      "Community Lead",
      "Tech Architect",
    ],
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Online store or shopping experience",
    suggestedRoles: [
      "Product Lead",
      "UI/UX Lead",
      "Conversion Lead",
      "Growth Lead",
      "Tech Architect",
    ],
  },
  {
    id: "developer_tool",
    label: "Developer Tool",
    description: "Tools and APIs for developers",
    suggestedRoles: [
      "Product Lead",
      "Tech Architect",
      "DevRel Lead",
      "Growth Lead",
      "QA Lead",
    ],
  },
];

export type TeamRole = {
  role: string;
  company: string;
  focus: string;
  triggers: string[];
};

export type TechChoice = {
  category: string;
  choice: string;
};

export const TECH_CATEGORIES = [
  {
    id: "frontend",
    label: "Frontend",
    options: ["Next.js", "React", "Vue", "Svelte", "Remix", "Astro"],
  },
  {
    id: "backend",
    label: "Backend",
    options: [
      "Node.js",
      "Python/Django",
      "Python/FastAPI",
      "Go",
      "Ruby/Rails",
      "Rust",
    ],
  },
  {
    id: "database",
    label: "Database",
    options: [
      "Supabase (Postgres)",
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "PlanetScale",
      "Firebase",
    ],
  },
  {
    id: "auth",
    label: "Auth",
    options: [
      "Supabase Auth",
      "Clerk",
      "Auth0",
      "NextAuth",
      "Firebase Auth",
      "Custom",
    ],
  },
  {
    id: "hosting",
    label: "Hosting",
    options: ["Vercel", "AWS", "GCP", "Railway", "Fly.io", "Cloudflare"],
  },
  {
    id: "analytics",
    label: "Analytics",
    options: [
      "PostHog",
      "Mixpanel",
      "Amplitude",
      "Google Analytics",
      "Plausible",
      "None",
    ],
  },
];

export const DEFAULT_TECH_CHOICES: TechChoice[] = [
  { category: "frontend", choice: "Next.js" },
  { category: "backend", choice: "Node.js" },
  { category: "database", choice: "Supabase (Postgres)" },
  { category: "auth", choice: "Supabase Auth" },
  { category: "hosting", choice: "Vercel" },
  { category: "analytics", choice: "PostHog" },
];

export type ConfidenceLevel = "high" | "medium" | "low";

export type ConsensusConfig = {
  ceoIndex: number | null; // index into team array — the tiebreaker
  confidenceLevels: Record<number, ConfidenceLevel>; // team index → confidence
  phaseAuthority: Record<string, number | null>; // phase name → team index with 1.5x bonus
  consensusThreshold: number; // default 67
};

export const CONFIDENCE_WEIGHTS: Record<ConfidenceLevel, number> = {
  high: 1.0,
  medium: 0.7,
  low: 0.4,
};

export const PROJECT_PHASES = [
  { id: "pre_mvp", label: "Pre-MVP", description: "Early research and scoping" },
  { id: "infrastructure", label: "Infrastructure", description: "Tech stack and setup" },
  { id: "development", label: "Development", description: "Core feature build" },
  { id: "pre_launch", label: "Pre-Launch", description: "Polish and go-to-market" },
  { id: "post_launch", label: "Post-Launch", description: "Growth and iteration" },
];

export const CEO_TIEBREAKER_CRITERIA = [
  { id: "user_impact", label: "User Impact", weight: 30 },
  { id: "speed_to_learning", label: "Speed to Learning", weight: 25 },
  { id: "reversibility", label: "Reversibility", weight: 20 },
  { id: "risk", label: "Risk", weight: 15 },
  { id: "team_alignment", label: "Team Alignment", weight: 10 },
];

export type AgentOrchestratorConfig = {
  orchestratorModel: string;
  maxConcurrentAgents: number;
  consensusRequired: boolean;
  autoConsultOnPR: boolean;
  autoConsultOnDeploy: boolean;
  weeklyRetroEnabled: boolean;
};

export const ORCHESTRATOR_MODELS = [
  { id: "claude-opus-4-6", label: "Claude Opus 4.6", description: "Best reasoning, highest quality" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", description: "Fast + capable (recommended)" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", description: "Fastest, best for simple tasks" },
];

export type GrillQuestion = {
  personaIndex: number;
  question: string;
  response: string;
  status: "unanswered" | "answered" | "acknowledged";
};

export type LaunchKitDraft = {
  // Brief
  projectName: string;
  projectType: ProjectType | null;
  description: string;
  targetUser: string;
  problem: string;
  platforms: string[];
  mvpFeatures: string[];
  comparables: { name: string; strength: string }[];
  // Team
  team: TeamRole[];
  // Consensus
  consensus: ConsensusConfig;
  // Grill
  grillQuestions: GrillQuestion[];
  grillCompleted: boolean;
  grillSkipped: boolean;
  // Stack
  deployTarget: DeployTarget;
  techChoices: TechChoice[];
  mobileFramework: string;
  // Roadmap
  buildPhases: { phase: string; features: string[] }[];
  planGenerated: boolean;
  // Whitepaper
  northStar: string;
  whitepaper: string;
  // Orchestrator
  orchestrator: AgentOrchestratorConfig;
};

export const EMPTY_LAUNCH_KIT: LaunchKitDraft = {
  projectName: "",
  projectType: null,
  description: "",
  targetUser: "",
  problem: "",
  platforms: [],
  mvpFeatures: [],
  comparables: [],
  team: [],
  grillQuestions: [],
  grillCompleted: false,
  grillSkipped: false,
  consensus: {
    ceoIndex: null,
    confidenceLevels: {},
    phaseAuthority: {},
    consensusThreshold: 67,
  },
  deployTarget: "web_ios_android",
  techChoices: [...DEFAULT_TECH_CHOICES],
  mobileFramework: "React Native / Expo",
  buildPhases: [
    { phase: "Foundation", features: [] },
    { phase: "Core Feature 1", features: [] },
    { phase: "Core Feature 2", features: [] },
    { phase: "Polish & Launch", features: [] },
  ],
  planGenerated: false,
  northStar: "",
  whitepaper: "",
  orchestrator: {
    orchestratorModel: "claude-sonnet-4-6",
    maxConcurrentAgents: 3,
    consensusRequired: true,
    autoConsultOnPR: true,
    autoConsultOnDeploy: false,
    weeklyRetroEnabled: true,
  },
};

export const PLATFORM_OPTIONS = ["Web", "iOS", "Android", "Desktop", "CLI"];

export function generateTeamMarkdown(draft: LaunchKitDraft): string {
  const lines: string[] = [];

  lines.push(`# Team: ${draft.projectName || "Project"}`);
  lines.push("");

  if (draft.team.length === 0) {
    lines.push("No team roles defined yet.");
    return lines.join("\n");
  }

  lines.push("| Role | Modeled After | Focus Area |");
  lines.push("|------|---------------|------------|");
  draft.team.forEach((t) => {
    lines.push(`| ${t.role} | ${t.company || "---"} | ${t.focus || "---"} |`);
  });
  lines.push("");

  lines.push("## Persona Prompts\n");
  draft.team.forEach((t) => {
    lines.push(`### ${t.role}`);
    if (t.company) lines.push(`> Modeled after: **${t.company}**`);
    if (t.focus) lines.push(`\nFocus: ${t.focus}`);
    if (t.triggers && t.triggers.length > 0) {
      lines.push(`\n**Consult when:**`);
      t.triggers.forEach((trigger) => lines.push(`- ${trigger}`));
    }
    lines.push("");
  });

  return lines.join("\n");
}

export function generateBriefMarkdown(draft: LaunchKitDraft): string {
  const lines: string[] = [];

  lines.push(`# Project Brief: ${draft.projectName || "Untitled Project"}`);
  lines.push("");

  if (draft.projectType) {
    const pt = PROJECT_TYPES.find((p) => p.id === draft.projectType);
    if (pt) lines.push(`**Type:** ${pt.label}\n`);
  }

  if (draft.description) {
    lines.push(`## Description\n\n${draft.description}\n`);
  }

  if (draft.targetUser) {
    lines.push(`## Target User\n\n${draft.targetUser}\n`);
  }

  if (draft.problem) {
    lines.push(`## Problem\n\n${draft.problem}\n`);
  }

  if (draft.platforms.length > 0) {
    lines.push(`## Platforms\n\n${draft.platforms.join(", ")}\n`);
  }

  if (draft.mvpFeatures.length > 0) {
    lines.push("## MVP Features\n");
    draft.mvpFeatures.forEach((f) => lines.push(`- ${f}`));
    lines.push("");
  }

  if (draft.comparables.length > 0) {
    lines.push("## Comparable Products\n");
    lines.push("| Product | What They Do Well |");
    lines.push("|---------|-------------------|");
    draft.comparables.forEach((c) => {
      lines.push(`| ${c.name} | ${c.strength} |`);
    });
    lines.push("");
  }

  // Tech Stack
  if (draft.techChoices.length > 0) {
    lines.push("## Tech Stack\n");
    lines.push("| Category | Choice |");
    lines.push("|----------|--------|");
    draft.techChoices.forEach((tc) => {
      const cat = TECH_CATEGORIES.find((c) => c.id === tc.category);
      lines.push(`| ${cat?.label || tc.category} | ${tc.choice} |`);
    });
    lines.push("");
  }

  // Roadmap
  if (draft.buildPhases.some((p) => p.features.length > 0)) {
    lines.push("## Build Roadmap\n");
    draft.buildPhases.forEach((phase, i) => {
      lines.push(`### Phase ${i + 1}: ${phase.phase}`);
      if (phase.features.length > 0) {
        phase.features.forEach((f) => lines.push(`- ${f}`));
      } else {
        lines.push("- (no features defined)");
      }
      lines.push("");
    });
  }

  // Team
  if (draft.team.length > 0) {
    lines.push("## Team\n");
    lines.push("| Role | Modeled After | Focus |");
    lines.push("|------|---------------|-------|");
    draft.team.forEach((t) => {
      lines.push(
        `| ${t.role} | ${t.company || "---"} | ${t.focus || "---"} |`
      );
    });
    lines.push("");
  }

  return lines.join("\n");
}

export function generatePlan(draft: LaunchKitDraft): { phase: string; features: string[] }[] {
  const phases: { phase: string; features: string[] }[] = [];

  // Phase 1: Foundation
  const foundation: string[] = [];
  foundation.push("Set up repository and project structure");
  const stack = draft.techChoices.map((tc) => tc.choice);
  if (stack.length > 0) foundation.push(`Configure ${stack.slice(0, 3).join(", ")}`);
  foundation.push("Database schema and migrations");
  foundation.push("Authentication (sign up, sign in, sign out)");
  if (draft.deployTarget !== "web_only") {
    foundation.push(`Mobile scaffold (${draft.mobileFramework || "React Native / Expo"})`);
  }
  foundation.push("CI/CD pipeline and preview deployments");
  phases.push({ phase: "Foundation", features: foundation });

  // Phase 2: Core MVP features
  const core1: string[] = [];
  const mvp = draft.mvpFeatures.length > 0 ? draft.mvpFeatures : [];
  const half = Math.ceil(mvp.length / 2);
  mvp.slice(0, half).forEach((f) => core1.push(f));
  if (core1.length === 0) core1.push("Primary user flow (end-to-end)");
  core1.push("Loading states, error handling, empty states");
  phases.push({ phase: "Core Features", features: core1 });

  // Phase 3: Remaining features + integrations
  const core2: string[] = [];
  mvp.slice(half).forEach((f) => core2.push(f));
  if (core2.length === 0) core2.push("Secondary user flows");
  if (draft.deployTarget !== "web_only") {
    core2.push("Mobile-specific UX (navigation, gestures, push notifications)");
  }
  core2.push("Analytics and event tracking");
  phases.push({ phase: "Integrations & Polish", features: core2 });

  // Phase 4: Launch prep
  const launch: string[] = [];
  launch.push("Responsive design audit");
  if (draft.deployTarget !== "web_only") {
    launch.push("App store assets and submission");
  }
  launch.push("SEO and meta tags");
  launch.push("Performance optimization");
  launch.push("Security review (RLS, input validation, secrets)");
  launch.push("README and documentation");
  phases.push({ phase: "Launch Prep", features: launch });

  return phases;
}

export function generateConsensusMarkdown(draft: LaunchKitDraft): string {
  const lines: string[] = [];
  lines.push("# Consensus & Dispute Resolution Protocol");
  lines.push("");

  const ceo = draft.consensus.ceoIndex !== null ? draft.team[draft.consensus.ceoIndex] : null;
  if (ceo) {
    lines.push(`## CEO / Tiebreaker: ${ceo.role}${ceo.company ? ` (${ceo.company})` : ""}`);
    lines.push("");
    lines.push("When personas deadlock, the CEO evaluates using weighted criteria:");
    lines.push("");
    CEO_TIEBREAKER_CRITERIA.forEach((c) => {
      lines.push(`- **${c.label}**: ${c.weight}%`);
    });
    lines.push("");
  }

  lines.push(`## Consensus Threshold: ${draft.consensus.consensusThreshold}%`);
  lines.push("");
  lines.push("| # Personas | Agreement Required |");
  lines.push("|-----------|-------------------|");
  lines.push("| 2 | 100% (both must agree) |");
  lines.push("| 3 | 2/3 (67%) |");
  lines.push("| 4+ | Proportional majority |");
  lines.push("");

  if (draft.team.length > 0) {
    lines.push("## Confidence-Weighted Voting");
    lines.push("");
    lines.push("| Role | Confidence | Vote Weight |");
    lines.push("|------|-----------|-------------|");
    draft.team.forEach((t, i) => {
      const conf = draft.consensus.confidenceLevels[i] || "high";
      const weight = CONFIDENCE_WEIGHTS[conf];
      lines.push(`| ${t.role} | ${conf} | ${weight}x |`);
    });
    lines.push("");
  }

  const phaseEntries = Object.entries(draft.consensus.phaseAuthority).filter(
    ([, idx]) => idx !== null
  );
  if (phaseEntries.length > 0) {
    lines.push("## Phase-Based Authority (1.5x bonus)");
    lines.push("");
    lines.push("| Phase | Authority Lead |");
    lines.push("|-------|---------------|");
    phaseEntries.forEach(([phaseId, idx]) => {
      const phase = PROJECT_PHASES.find((p) => p.id === phaseId);
      const member = idx !== null ? draft.team[idx] : null;
      if (phase && member) {
        lines.push(`| ${phase.label} | ${member.role} |`);
      }
    });
    lines.push("");
  }

  lines.push("## Resolution Flow");
  lines.push("");
  lines.push("1. Each persona provides their position + confidence level");
  lines.push(`2. If ${draft.consensus.consensusThreshold}%+ agreement -> proceed with majority`);
  lines.push("3. Deadlock -> CEO evaluates using weighted criteria above");
  lines.push("4. Present resolution to user — user always has final override");
  lines.push("");

  return lines.join("\n");
}

export function generateWhitepaper(draft: LaunchKitDraft): string {
  const lines: string[] = [];
  const target = DEPLOY_TARGETS.find((d) => d.id === draft.deployTarget);

  lines.push(`# ${draft.projectName || "Project"} -- Whitepaper`);
  lines.push("");
  lines.push("---");
  lines.push("");

  if (draft.northStar) {
    lines.push("## Vision");
    lines.push("");
    lines.push(draft.northStar);
    lines.push("");
  }

  if (draft.problem) {
    lines.push("## Problem");
    lines.push("");
    lines.push(draft.problem);
    lines.push("");
  }

  lines.push("## Solution");
  lines.push("");
  if (draft.description) {
    lines.push(draft.description);
  } else {
    lines.push(`${draft.projectName || "This project"} addresses the problem above by providing a focused, well-designed solution for ${draft.targetUser || "its target users"}.`);
  }
  lines.push("");

  if (draft.targetUser) {
    lines.push("## Target User");
    lines.push("");
    lines.push(draft.targetUser);
    lines.push("");
  }

  if (draft.comparables.length > 0) {
    lines.push("## Competitive Landscape");
    lines.push("");
    lines.push("| Product | Strength | How We Differentiate |");
    lines.push("|---------|----------|---------------------|");
    draft.comparables.forEach((c) => {
      lines.push(`| ${c.name} | ${c.strength} | *To be defined* |`);
    });
    lines.push("");
  }

  if (draft.team.length > 0) {
    lines.push("## Team & Personas");
    lines.push("");
    lines.push("Each persona guides decisions in their domain throughout the build.");
    lines.push("");
    lines.push("| Role | Modeled After | Focus |");
    lines.push("|------|---------------|-------|");
    draft.team.forEach((t) => {
      lines.push(`| ${t.role} | ${t.company || "---"} | ${t.focus || "---"} |`);
    });
    lines.push("");
  }

  lines.push("## Technical Architecture");
  lines.push("");
  lines.push(`**Deployment Target:** ${target?.label || draft.deployTarget}`);
  if (draft.deployTarget !== "web_only" && draft.mobileFramework) {
    lines.push(`**Mobile Framework:** ${draft.mobileFramework}`);
  }
  lines.push("");
  if (draft.techChoices.length > 0) {
    lines.push("| Layer | Technology |");
    lines.push("|-------|-----------|");
    draft.techChoices.forEach((tc) => {
      const cat = TECH_CATEGORIES.find((c) => c.id === tc.category);
      lines.push(`| ${cat?.label || tc.category} | ${tc.choice} |`);
    });
    lines.push("");
  }

  if (draft.buildPhases.some((p) => p.features.length > 0)) {
    lines.push("## MVP Roadmap");
    lines.push("");
    draft.buildPhases.forEach((phase, i) => {
      lines.push(`### Phase ${i + 1}: ${phase.phase}`);
      lines.push("");
      if (phase.features.length > 0) {
        phase.features.forEach((f) => lines.push(`- ${f}`));
      }
      lines.push("");
    });
  }

  if (draft.mvpFeatures.length > 0) {
    lines.push("## Core MVP Features");
    lines.push("");
    draft.mvpFeatures.forEach((f) => lines.push(`- ${f}`));
    lines.push("");
  }

  lines.push("## Success Metrics");
  lines.push("");
  lines.push("| Metric | Target | Timeframe |");
  lines.push("|--------|--------|-----------|");
  if (draft.team.some((t) => t.focus)) {
    draft.team.forEach((t) => {
      if (t.focus) {
        lines.push(`| ${t.focus} (${t.role}) | *TBD* | 3 months |`);
      }
    });
  } else {
    lines.push("| User acquisition | *TBD* | 3 months |");
    lines.push("| Retention (D7) | *TBD* | 3 months |");
    lines.push("| Core feature adoption | *TBD* | 3 months |");
  }
  lines.push("");

  lines.push("## Next Steps");
  lines.push("");
  lines.push("1. Finalize personas and consult at every major decision point");
  lines.push("2. Set up repository and infrastructure (Phase 1)");
  lines.push("3. Build core MVP features with persona-guided review");
  lines.push("4. Launch, measure, and iterate with weekly persona retros");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`*Generated by Persona Builder on ${new Date().toISOString().split("T")[0]}*`);

  return lines.join("\n");
}

export function generateClaudeMd(draft: LaunchKitDraft): string {
  const lines: string[] = [];

  lines.push(`# ${draft.projectName || "Project"} — Agent Instructions\n`);
  lines.push(`> Generated by Persona Builder Launch Kit\n`);

  // Project overview
  lines.push("## Project Overview\n");
  if (draft.description) lines.push(draft.description + "\n");
  if (draft.targetUser) lines.push(`**Target User:** ${draft.targetUser}\n`);
  if (draft.problem) lines.push(`**Problem:** ${draft.problem}\n`);

  // Tech stack
  if (draft.techChoices.length > 0) {
    lines.push("## Tech Stack\n");
    draft.techChoices.forEach((tc) => {
      const cat = TECH_CATEGORIES.find((c) => c.id === tc.category);
      lines.push(`- **${cat?.label || tc.category}:** ${tc.choice}`);
    });
    lines.push("");
  }

  // Persona team
  if (draft.team.length > 0) {
    lines.push("## Persona Team\n");
    lines.push("Consult the relevant persona at every major decision. Reference `docs/personas/` for full profiles.\n");
    lines.push("| Role | Modeled After | Focus |");
    lines.push("|------|---------------|-------|");
    draft.team.forEach((t) => {
      lines.push(`| ${t.role} | ${t.company || "—"} | ${t.focus || "—"} |`);
    });
    lines.push("");
  }

  // Consultation rules
  lines.push("## Consultation Rules\n");
  lines.push("1. **Feature Planning:** Consult Product Lead + domain persona");
  lines.push("2. **Implementation Review:** Consult relevant domain persona");
  lines.push("3. **Integration Check:** Consult 2-3 personas + use Consensus Protocol");
  lines.push("4. **Deadlock Resolution:** CEO Tiebreaker (weighted evaluation)");
  lines.push("5. **User Override:** User always has final say\n");

  // Orchestrator config
  lines.push("## Agent Orchestration\n");
  lines.push(`- **Orchestrator Model:** ${draft.orchestrator.orchestratorModel}`);
  lines.push(`- **Max Concurrent Agents:** ${draft.orchestrator.maxConcurrentAgents}`);
  lines.push(`- **Consensus Required:** ${draft.orchestrator.consensusRequired ? "Yes (2/3 majority)" : "No"}`);
  lines.push(`- **Auto-consult on PR:** ${draft.orchestrator.autoConsultOnPR ? "Yes" : "No"}`);
  lines.push(`- **Auto-consult on Deploy:** ${draft.orchestrator.autoConsultOnDeploy ? "Yes" : "No"}`);
  lines.push(`- **Weekly Retros:** ${draft.orchestrator.weeklyRetroEnabled ? "Enabled" : "Disabled"}\n`);

  // Build phases
  if (draft.buildPhases.some((p) => p.features.length > 0)) {
    lines.push("## Build Roadmap\n");
    draft.buildPhases.forEach((phase, i) => {
      lines.push(`### Phase ${i + 1}: ${phase.phase}`);
      phase.features.forEach((f) => lines.push(`- ${f}`));
      lines.push("");
    });
  }

  // North star
  if (draft.northStar) {
    lines.push(`## North Star\n\n${draft.northStar}\n`);
  }

  lines.push("---\n");
  lines.push(`*Generated by Persona Builder on ${new Date().toISOString().split("T")[0]}*`);

  return lines.join("\n");
}

/* --------------- Grill Question Generator --------------- */

const ROLE_GRILL_QUESTIONS: Record<string, (draft: LaunchKitDraft) => string[]> = {
  product: (d) => [
    `What will ${d.targetUser || "the user"} be able to do after using ${d.projectName || "this product"} that they can't do today? Be specific.`,
    `You've listed ${d.mvpFeatures.length || "no"} MVP features. Which ONE is the core value — the feature that, if it fails, means the product fails?`,
    `How will you know if the MVP is working? What metric proves this isn't just a "nice-to-have"?`,
  ],
  "ui/ux": (d) => [
    `What emotion should ${d.targetUser || "the user"} feel in the first 10 seconds of using ${d.projectName || "this app"}?`,
    `What's the single most important action on the main screen, and how will you make it unmissable?`,
    `How does this work for someone with accessibility needs — VoiceOver, color blindness, motor impairments?`,
  ],
  design: (d) => [
    `What emotion should ${d.targetUser || "the user"} feel in the first 10 seconds of using ${d.projectName || "this app"}?`,
    `What's the single most important action on the main screen, and how will you make it unmissable?`,
    `How does this work for someone with accessibility needs — VoiceOver, color blindness, motor impairments?`,
  ],
  retention: (d) => [
    `What reason does ${d.targetUser || "the user"} have to come back tomorrow? Is there a natural daily cadence, or are you manufacturing one?`,
    `What does the user lose if they don't return for a week? If the answer is "nothing," your retention strategy has a hole.`,
    `What does the first 3 minutes look like? Can the user get value in their first session, or is there setup friction?`,
  ],
  engagement: (d) => [
    `What reason does ${d.targetUser || "the user"} have to come back tomorrow? Is there a natural daily cadence, or are you manufacturing one?`,
    `What does the user lose if they don't return for a week? If the answer is "nothing," your retention strategy has a hole.`,
    `What does the first 3 minutes look like? Can the user get value in their first session, or is there setup friction?`,
  ],
  growth: (d) => [
    `In one sentence, why would someone tell a friend about ${d.projectName || "this product"}? If you can't say it simply, the positioning isn't clear.`,
    `What's the organic sharing moment? When in the experience does a user naturally want to share?`,
    `What are you doing before launch to build an audience? Or are you planning to launch into silence?`,
  ],
  marketing: (d) => [
    `In one sentence, why would someone tell a friend about ${d.projectName || "this product"}? If you can't say it simply, the positioning isn't clear.`,
    `What's the organic sharing moment? When in the experience does a user naturally want to share?`,
    `What are you doing before launch to build an audience? Or are you planning to launch into silence?`,
  ],
  tech: (d) => [
    `What's the data model? Can you draw the entity relationship diagram, or is this still fuzzy?`,
    `What happens when the user has no internet connection? If the answer is "it breaks," that's a design flaw.`,
    `Are you building custom infrastructure, or using managed services? Justify any custom choice — most products never outgrow Vercel + Supabase.`,
  ],
  architect: (d) => [
    `What's the data model? Can you draw the entity relationship diagram, or is this still fuzzy?`,
    `What happens when the user has no internet connection? If the answer is "it breaks," that's a design flaw.`,
    `Are you building custom infrastructure, or using managed services? Justify any custom choice — most products never outgrow Vercel + Supabase.`,
  ],
  engineer: (d) => [
    `What's the data model? Can you draw the entity relationship diagram, or is this still fuzzy?`,
    `What happens when the user has no internet connection? If the answer is "it breaks," that's a design flaw.`,
    `Are you building custom infrastructure, or using managed services? Justify any custom choice — most products never outgrow Vercel + Supabase.`,
  ],
  revenue: (d) => [
    `What is ${d.targetUser || "the user"} paying for, and why would they pay for it instead of using a free alternative?`,
    `When in the user journey does the paywall appear? Too early kills activation; too late trains users to expect free.`,
    `What's your pricing model — subscription, usage-based, freemium? Why that model for this type of product?`,
  ],
  sales: (d) => [
    `What is ${d.targetUser || "the user"} paying for, and why would they pay for it instead of using a free alternative?`,
    `When in the user journey does the paywall appear? Too early kills activation; too late trains users to expect free.`,
    `What's your pricing model — subscription, usage-based, freemium? Why that model for this type of product?`,
  ],
  conversion: (d) => [
    `What is ${d.targetUser || "the user"} paying for, and why would they pay for it instead of using a free alternative?`,
    `What's the drop-off point in your conversion funnel, and how will you measure it from Day 1?`,
    `What's your pricing model — subscription, usage-based, freemium? Why that model for this type of product?`,
  ],
  content: (d) => [
    `Who is creating content for ${d.projectName || "this platform"}, and why would they choose you over publishing elsewhere?`,
    `How do you handle content quality? Is there curation, moderation, or is it a free-for-all?`,
    `What's the content-to-audience flywheel? How does more content attract more users, and more users attract more content?`,
  ],
  community: (d) => [
    `Why would ${d.targetUser || "users"} join a community around ${d.projectName || "this product"} instead of using existing platforms (Discord, Reddit, etc.)?`,
    `What does the community look like with 10 users vs. 10,000? Does the experience break at either extreme?`,
    `How do you handle bad actors and toxic behavior? If "we'll deal with it later," you won't.`,
  ],
  trust: (d) => [
    `What's the worst thing a bad actor could do on ${d.projectName || "this platform"}, and how are you preventing it?`,
    `How do you handle disputes between users? Is there a resolution process, or does the platform just shrug?`,
    `What data are you collecting, and what's your plan when (not if) someone demands you delete it?`,
  ],
  safety: (d) => [
    `What's the worst thing a bad actor could do on ${d.projectName || "this platform"}, and how are you preventing it?`,
    `How do you handle disputes between users? Is there a resolution process, or does the platform just shrug?`,
    `What data are you collecting, and what's your plan when (not if) someone demands you delete it?`,
  ],
  customer: (d) => [
    `What does onboarding look like for ${d.targetUser || "a new user"}? Can they get value in under 5 minutes?`,
    `What's your plan for users who sign up but never come back? How do you identify and re-engage them?`,
    `When a user has a problem, how do they get help? If the answer is "email us," that's not a plan.`,
  ],
  devrel: (d) => [
    `Why would a developer choose ${d.projectName || "this tool"} over the open-source alternative? What's the unique value?`,
    `What does the developer experience look like? Can someone go from zero to a working integration in under 15 minutes?`,
    `How are you building trust with the developer community? Developers smell marketing from a mile away.`,
  ],
  qa: (d) => [
    `What's your testing strategy? If the answer is "manual testing before release," that won't scale past Month 1.`,
    `What are the critical user flows that, if broken, would make ${d.projectName || "the product"} unusable?`,
    `How do you handle edge cases — empty states, rate limits, network errors, browser differences?`,
  ],
};

function getQuestionsForRole(member: TeamRole, draft: LaunchKitDraft): string[] {
  const roleLower = member.role.toLowerCase();
  for (const [keyword, generator] of Object.entries(ROLE_GRILL_QUESTIONS)) {
    if (roleLower.includes(keyword)) {
      return generator(draft);
    }
  }
  // Generic fallback for unknown roles
  return [
    `As the ${member.role}, what's the biggest risk you see in ${draft.projectName || "this project"} right now?`,
    `What's the one thing ${draft.projectName || "this project"} must get right in your domain to succeed?`,
    `What would make you say "stop — we need to rethink this" three months into the build?`,
  ];
}

export function generateGrillQuestions(draft: LaunchKitDraft): GrillQuestion[] {
  const questions: GrillQuestion[] = [];
  const maxPerPersona = draft.team.length > 5 ? 2 : 3;
  draft.team.forEach((member, i) => {
    const roleQuestions = getQuestionsForRole(member, draft).slice(0, maxPerPersona);
    roleQuestions.forEach((q) => {
      questions.push({
        personaIndex: i,
        question: q,
        response: "",
        status: "unanswered",
      });
    });
  });
  return questions;
}

/* --------------- Structured Artifact Generators --------------- */

export function generateGrillMarkdown(draft: LaunchKitDraft): string {
  const lines: string[] = [];
  const answered = draft.grillQuestions.filter((q) => q.status === "answered").length;
  const acknowledged = draft.grillQuestions.filter((q) => q.status === "acknowledged").length;

  lines.push("---");
  lines.push(`artifact: grill-results`);
  lines.push(`project: ${draft.projectName || "Untitled"}`);
  lines.push(`questions: ${draft.grillQuestions.length}`);
  lines.push(`answered: ${answered}`);
  lines.push(`acknowledged: ${acknowledged}`);
  lines.push(`generated: ${new Date().toISOString().split("T")[0]}`);
  lines.push("---");
  lines.push("");
  lines.push(`# Persona Grill: ${draft.projectName || "Project"}`);
  lines.push("");

  // Group by persona
  const grouped = new Map<number, GrillQuestion[]>();
  draft.grillQuestions.forEach((q) => {
    const existing = grouped.get(q.personaIndex) || [];
    existing.push(q);
    grouped.set(q.personaIndex, existing);
  });

  grouped.forEach((questions, personaIndex) => {
    const member = draft.team[personaIndex];
    if (!member) return;
    lines.push(`## ${member.role}${member.company ? ` (${member.company})` : ""}`);
    lines.push("");
    questions.forEach((q, i) => {
      lines.push(`### Q${i + 1}: ${q.question}`);
      lines.push("");
      if (q.status === "answered" && q.response) {
        lines.push(`**Response:** ${q.response}`);
      } else if (q.status === "acknowledged") {
        lines.push(`**Status:** Acknowledged (no response provided)`);
      } else {
        lines.push(`**Status:** Unanswered`);
      }
      lines.push("");
    });
  });

  return lines.join("\n");
}

export function generateStackMarkdown(draft: LaunchKitDraft): string {
  const lines: string[] = [];
  const target = DEPLOY_TARGETS.find((d) => d.id === draft.deployTarget);

  lines.push("---");
  lines.push(`artifact: tech-stack`);
  lines.push(`project: ${draft.projectName || "Untitled"}`);
  lines.push(`generated: ${new Date().toISOString().split("T")[0]}`);
  lines.push("---");
  lines.push("");
  lines.push(`# Tech Stack: ${draft.projectName || "Project"}`);
  lines.push("");
  lines.push(`**Deployment Target:** ${target?.label || draft.deployTarget}`);
  if (draft.deployTarget !== "web_only" && draft.mobileFramework) {
    lines.push(`**Mobile Framework:** ${draft.mobileFramework}`);
  }
  lines.push("");

  if (draft.techChoices.length > 0) {
    lines.push("| Layer | Technology |");
    lines.push("|-------|-----------|");
    draft.techChoices.forEach((tc) => {
      const cat = TECH_CATEGORIES.find((c) => c.id === tc.category);
      lines.push(`| ${cat?.label || tc.category} | ${tc.choice} |`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

export function generateRoadmapMarkdown(draft: LaunchKitDraft): string {
  const lines: string[] = [];
  const totalFeatures = draft.buildPhases.reduce((sum, p) => sum + p.features.length, 0);

  lines.push("---");
  lines.push(`artifact: roadmap`);
  lines.push(`project: ${draft.projectName || "Untitled"}`);
  lines.push(`phases: ${draft.buildPhases.length}`);
  lines.push(`features: ${totalFeatures}`);
  lines.push(`generated: ${new Date().toISOString().split("T")[0]}`);
  lines.push("---");
  lines.push("");
  lines.push(`# Build Roadmap: ${draft.projectName || "Project"}`);
  lines.push("");

  draft.buildPhases.forEach((phase, i) => {
    lines.push(`## Phase ${i + 1}: ${phase.phase}`);
    lines.push("");
    if (phase.features.length > 0) {
      phase.features.forEach((f) => lines.push(`- ${f}`));
    } else {
      lines.push("- (no features defined)");
    }
    lines.push("");
  });

  return lines.join("\n");
}
