// ── Types ──────────────────────────────────────────────────────────

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  modeled_after: string;
  expertise: string[];
  personality: string;
  reviews: string[];
  vote_weight: number;
};

export type AppBrief = {
  name: string;
  description: string;
  target_users: string;
  core_value: string;
  tech_stack: string;
  current_state: "MVP" | "Beta" | "Production" | "";
};

export type SubCriterion = {
  name: string;
  score: number;
};

export type CategoryScore = {
  name: string;
  weight: number;
  subCriteria: SubCriterion[];
  avg: number;
};

export type CPOPersona = {
  name: string;
  company: string;
  title: string;
  philosophy: string;
  strengths: string[];
  blindSpots: string[];
  decisionStyle: string;
  iconicMove: string;
};

export type ReferenceApp = {
  name: string;
  why: string;
  scores: CategoryScore[];
  cpo: CPOPersona | null;
};

export type PersonaScore = {
  personaId: string;
  personaName: string;
  scores: CategoryScore[];
  overall: number;
};

export type GapItem = {
  category: string;
  yourScore: number;
  bestRef: number;
  gap: number;
  priority: "CRITICAL" | "HIGH" | "MED" | "LOW";
};

export type Round = {
  number: number;
  decision: string;
  proposedBy: string;
  proposedByRole: string;
  vote: string;
  changes: string[];
  categoryAffected: string;
  scoreBefore: number;
  scoreAfter: number;
  overallBefore: number;
  overallAfter: number;
  gapRemaining: number;
  rationale?: string;
  acceptanceCriteria?: string[];
};

export type ImprovementDraft = {
  team: TeamMember[];
  app: AppBrief;
  referenceApps: ReferenceApp[];
  selfScores: CategoryScore[];
  personaScores: PersonaScore[];
  consensusScores: CategoryScore[];
  gapAnalysis: GapItem[];
  rounds: Round[];
  currentRound: number;
  targetScore: number;
};

// ── Constants ──────────────────────────────────────────────────────

export const SCORING_CATEGORIES: {
  name: string;
  weight: number;
  subCriteria: string[];
}[] = [
  {
    name: "Core Features",
    weight: 0.2,
    subCriteria: [
      "Completeness",
      "Depth",
      "Reliability",
      "Differentiation",
      "API / Integrations",
    ],
  },
  {
    name: "UI/UX Quality",
    weight: 0.15,
    subCriteria: [
      "Visual design",
      "Consistency",
      "Responsiveness",
      "Navigation clarity",
      "Loading states",
    ],
  },
  {
    name: "Onboarding & Setup",
    weight: 0.1,
    subCriteria: [
      "Time to value",
      "Guided setup",
      "Documentation",
      "First-run experience",
      "Config complexity",
    ],
  },
  {
    name: "Performance",
    weight: 0.1,
    subCriteria: [
      "Load time",
      "Interaction speed",
      "Search speed",
      "Real-time updates",
      "Offline / cache",
    ],
  },
  {
    name: "Auth & Security",
    weight: 0.1,
    subCriteria: [
      "Auth methods",
      "Session management",
      "Encryption",
      "Role-based access",
      "Audit logging",
    ],
  },
  {
    name: "Reliability",
    weight: 0.1,
    subCriteria: [
      "Error handling",
      "Retry logic",
      "Data integrity",
      "Monitoring / alerts",
      "Graceful degradation",
    ],
  },
  {
    name: "Customization",
    weight: 0.1,
    subCriteria: [
      "Templates",
      "Settings",
      "Themes",
      "Workflows",
      "Extensibility / plugins",
    ],
  },
  {
    name: "Team & Collaboration",
    weight: 0.15,
    subCriteria: [
      "Multi-user support",
      "Permissions",
      "Shared views",
      "Notifications",
      "Activity feed",
    ],
  },
];

export const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "product_lead",
    name: "Alex Chen",
    role: "Head of Product",
    modeled_after: "VP Product at Reference App",
    expertise: ["Feature prioritization", "User research", "Roadmap strategy"],
    personality: "Data-driven, user-obsessed, kills scope creep",
    reviews: ["Feature completeness", "User flows", "Value proposition"],
    vote_weight: 1.2,
  },
  {
    id: "eng_lead",
    name: "Sam Okafor",
    role: "Engineering Lead",
    modeled_after: "Staff Engineer at Reference App",
    expertise: ["Architecture", "Performance", "API design", "Reliability"],
    personality: "Pragmatic, hates over-engineering, ships fast",
    reviews: ["Technical implementation", "Performance", "Error handling"],
    vote_weight: 1.0,
  },
  {
    id: "design_lead",
    name: "Maya Torres",
    role: "Design Lead",
    modeled_after: "Head of Design at Reference App",
    expertise: ["UI/UX", "Design systems", "Accessibility", "Motion"],
    personality: "Opinionated on craft, pushes for polish, user empathy",
    reviews: ["UI quality", "UX flows", "Visual consistency", "Responsiveness"],
    vote_weight: 1.0,
  },
  {
    id: "growth_lead",
    name: "Raj Patel",
    role: "Growth & Analytics",
    modeled_after: "Head of Growth at Reference App",
    expertise: ["Onboarding", "Retention", "Analytics", "A/B testing"],
    personality: "Metric-obsessed, challenges assumptions, loves experiments",
    reviews: ["Onboarding flow", "Retention hooks", "Analytics coverage"],
    vote_weight: 0.8,
  },
  {
    id: "qa_lead",
    name: "Lena Kim",
    role: "QA & Reliability",
    modeled_after: "QA Director at Reference App",
    expertise: ["Testing", "Edge cases", "Error states", "Security"],
    personality:
      "Finds every bug, thinks in failure modes, blocks sloppy releases",
    reviews: ["Error handling", "Edge cases", "Security", "Auth flows"],
    vote_weight: 0.8,
  },
];

const CATEGORY_PERSONA_MAP: Record<string, string> = {
  "Core Features": "product_lead",
  "UI/UX Quality": "design_lead",
  "Onboarding & Setup": "growth_lead",
  Performance: "eng_lead",
  "Auth & Security": "qa_lead",
  Reliability: "eng_lead",
  Customization: "product_lead",
  "Team & Collaboration": "growth_lead",
};

const IMPROVEMENT_SUGGESTIONS: Record<string, string[]> = {
  "Core Features": [
    "Add core CRUD workflows with validation",
    "Implement search and filtering across entities",
    "Add bulk operations and batch processing",
    "Build API integrations with webhook support",
    "Add data import/export in multiple formats",
  ],
  "UI/UX Quality": [
    "Implement responsive design system with consistent spacing",
    "Add skeleton loading states and progress indicators",
    "Build keyboard navigation and shortcuts",
    "Add toast notifications and inline feedback",
    "Implement dark/light mode with smooth transitions",
  ],
  "Onboarding & Setup": [
    "Build interactive onboarding wizard with progress tracking",
    "Add contextual tooltips and inline documentation",
    "Create quick-start templates for common use cases",
    "Implement guided first-run experience",
    "Add in-app help center with searchable docs",
  ],
  Performance: [
    "Add request caching and optimistic updates",
    "Implement virtual scrolling for large lists",
    "Add service worker for offline support",
    "Optimize bundle size with code splitting",
    "Implement real-time updates via WebSocket",
  ],
  "Auth & Security": [
    "Add OAuth provider (GitHub/Google)",
    "Implement session management with refresh tokens",
    "Add role-based access control",
    "Set up audit logging for sensitive actions",
    "Implement data encryption at rest and in transit",
  ],
  Reliability: [
    "Add global error boundary with recovery",
    "Implement retry logic for failed API calls",
    "Add data validation at API boundaries",
    "Set up health checks and uptime monitoring",
    "Implement graceful degradation for offline state",
  ],
  Customization: [
    "Build template system with user-created templates",
    "Add user preference settings panel",
    "Implement custom theme editor",
    "Add configurable workflow automations",
    "Build plugin/extension architecture",
  ],
  "Team & Collaboration": [
    "Add multi-user support with invitations",
    "Implement granular permissions system",
    "Build shared views and dashboards",
    "Add real-time notification system",
    "Implement activity feed with @mentions",
  ],
};

// ── Helper Functions ───────────────────────────────────────────────

export function createEmptyScores(): CategoryScore[] {
  return SCORING_CATEGORIES.map((cat) => ({
    name: cat.name,
    weight: cat.weight,
    subCriteria: cat.subCriteria.map((sc) => ({ name: sc, score: 0 })),
    avg: 0,
  }));
}

export function calcCategoryAvg(category: CategoryScore): number {
  const scores = category.subCriteria.map((sc) => sc.score);
  const sum = scores.reduce((a, b) => a + b, 0);
  return scores.length > 0 ? Math.round(sum / scores.length) : 0;
}

export function recalcAverages(scores: CategoryScore[]): CategoryScore[] {
  return scores.map((cat) => ({ ...cat, avg: calcCategoryAvg(cat) }));
}

export function calcWeightedOverall(scores: CategoryScore[]): number {
  const total = scores.reduce((sum, cat) => sum + cat.avg * cat.weight, 0);
  return Math.round(total);
}

export function calcConsensus(
  personaScores: PersonaScore[],
  team: TeamMember[]
): CategoryScore[] {
  if (personaScores.length === 0) return createEmptyScores();

  const base = createEmptyScores();
  const totalWeight = team.reduce((s, m) => s + m.vote_weight, 0);

  return base.map((cat, catIdx) => {
    const subCriteria = cat.subCriteria.map((sc, scIdx) => {
      let weightedSum = 0;
      personaScores.forEach((ps, pIdx) => {
        const w = team[pIdx]?.vote_weight ?? 1;
        const score = ps.scores[catIdx]?.subCriteria[scIdx]?.score ?? 0;
        weightedSum += score * w;
      });
      return { ...sc, score: Math.round(weightedSum / totalWeight) };
    });
    const avg = Math.round(
      subCriteria.reduce((s, sc) => s + sc.score, 0) / subCriteria.length
    );
    return { ...cat, subCriteria, avg };
  });
}

export function calcGapAnalysis(
  consensusScores: CategoryScore[],
  referenceApps: ReferenceApp[]
): GapItem[] {
  return consensusScores.map((cat) => {
    const yourScore = cat.avg;
    const bestRef = Math.max(
      ...referenceApps.map((app) => {
        const refCat = app.scores.find((s) => s.name === cat.name);
        return refCat ? refCat.avg : 0;
      }),
      0
    );
    const gap = Math.max(bestRef - yourScore, 0);
    const priority: GapItem["priority"] =
      gap > 50 ? "CRITICAL" : gap > 30 ? "HIGH" : gap > 10 ? "MED" : "LOW";
    return { category: cat.name, yourScore, bestRef, gap, priority };
  });
}

// Seeded PRNG — instance-based to avoid shared mutable state across requests
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generatePersonaScores(
  selfScores: CategoryScore[],
  team: TeamMember[]
): PersonaScore[] {
  const seededRandom = createSeededRandom(42);
  return team.map((member) => {
    const domainCategories = Object.entries(CATEGORY_PERSONA_MAP)
      .filter(([, id]) => id === member.id)
      .map(([cat]) => cat);

    const scores = selfScores.map((cat) => {
      const isDomain = domainCategories.includes(cat.name);
      const subCriteria = cat.subCriteria.map((sc) => {
        const variance = isDomain
          ? Math.round((seededRandom() - 0.6) * 20) // domain experts score slightly lower (stricter)
          : Math.round((seededRandom() - 0.5) * 16);
        return {
          ...sc,
          score: Math.max(0, Math.min(100, sc.score + variance)),
        };
      });
      const avg = Math.round(
        subCriteria.reduce((s, sc) => s + sc.score, 0) / subCriteria.length
      );
      return { ...cat, subCriteria, avg };
    });

    return {
      personaId: member.id,
      personaName: member.name,
      scores,
      overall: calcWeightedOverall(scores),
    };
  });
}

export function simulateRound(draft: ImprovementDraft): Round {
  const { gapAnalysis, team, rounds, consensusScores } = draft;
  const seededRandom = createSeededRandom(42 + rounds.length);

  // Find highest-gap category, skip categories where the last 2 rounds used the same persona
  const sorted = [...gapAnalysis].sort((a, b) => b.gap - a.gap);
  const recentPersonas = rounds.slice(-2).map((r) => r.proposedBy);

  let chosen = sorted[0];
  let chosenPersonaId = CATEGORY_PERSONA_MAP[chosen.category] ?? "product_lead";

  for (const item of sorted) {
    const pid = CATEGORY_PERSONA_MAP[item.category] ?? "product_lead";
    const consecutive = recentPersonas.every((rp) => rp === pid);
    if (!consecutive || sorted.indexOf(item) === sorted.length - 1) {
      chosen = item;
      chosenPersonaId = pid;
      break;
    }
  }

  const persona = team.find((m) => m.id === chosenPersonaId) ?? team[0];

  // Pick an unused suggestion
  const suggestions = IMPROVEMENT_SUGGESTIONS[chosen.category] ?? [
    "General improvement",
  ];
  const usedDecisions = rounds
    .filter((r) => r.categoryAffected === chosen.category)
    .map((r) => r.decision);
  const available = suggestions.filter((s) => !usedDecisions.includes(s));
  const decision =
    available.length > 0 ? available[0] : suggestions[suggestions.length - 1];

  // Score bump: ~30% of gap, capped at 25, min 5
  const bump = Math.max(5, Math.min(25, Math.round(chosen.gap * 0.3)));

  const catIdx = consensusScores.findIndex((c) => c.name === chosen.category);
  const scoreBefore = chosen.yourScore;
  const scoreAfter = scoreBefore + bump;
  const overallBefore = calcWeightedOverall(consensusScores);

  // Calculate new overall with the bump applied
  const updatedScores = consensusScores.map((cat, i) => {
    if (i !== catIdx) return cat;
    const newAvg = Math.min(100, cat.avg + bump);
    return { ...cat, avg: newAvg };
  });
  const overallAfter = calcWeightedOverall(updatedScores);

  // Voter count
  const approvals = Math.min(team.length, 3 + Math.floor(seededRandom() * 3));
  const vote = `${approvals}/${team.length} agree`;

  return {
    number: rounds.length + 1,
    decision,
    proposedBy: persona.id,
    proposedByRole: `${persona.name} (${persona.role})`,
    vote,
    changes: [decision],
    categoryAffected: chosen.category,
    scoreBefore,
    scoreAfter: Math.min(100, scoreAfter),
    overallBefore,
    overallAfter,
    gapRemaining: Math.max(0, chosen.bestRef - scoreAfter),
  };
}

export function applyRound(
  draft: ImprovementDraft,
  round: Round
): Partial<ImprovementDraft> {
  const catIdx = draft.consensusScores.findIndex(
    (c) => c.name === round.categoryAffected
  );
  if (catIdx === -1) return {};

  const bump = round.scoreAfter - round.scoreBefore;

  // Spread the bump evenly across sub-criteria
  const updatedScores = draft.consensusScores.map((cat, i) => {
    if (i !== catIdx) return cat;
    const perSub = Math.round(bump / cat.subCriteria.length);
    const subCriteria = cat.subCriteria.map((sc) => ({
      ...sc,
      score: Math.min(100, sc.score + perSub),
    }));
    const avg = Math.round(
      subCriteria.reduce((s, sc) => s + sc.score, 0) / subCriteria.length
    );
    return { ...cat, subCriteria, avg };
  });

  const newGapAnalysis = calcGapAnalysis(updatedScores, draft.referenceApps);

  return {
    consensusScores: updatedScores,
    gapAnalysis: newGapAnalysis,
    rounds: [...draft.rounds, round],
    currentRound: draft.currentRound + 1,
  };
}

// ── CPO Persona Generation ─────────────────────────────────────────

const CPO_FIRST_NAMES = [
  "Morgan", "Jordan", "Casey", "Riley", "Avery",
  "Taylor", "Quinn", "Blake", "Cameron", "Dakota",
  "Reese", "Emery", "Rowan", "Sage", "Finley",
];

const CPO_LAST_NAMES = [
  "Whitfield", "Nakamura", "Bergstrom", "Delgado", "Ashworth",
  "Kowalski", "Mercer", "Lindgren", "Okonkwo", "Vasquez",
  "Hartwell", "Chandra", "Moreau", "Eriksson", "Tanaka",
];

const CATEGORY_PHILOSOPHIES: Record<string, {
  philosophy: string;
  decisionStyle: string;
  iconicMove: string;
}> = {
  "Core Features": {
    philosophy: "Ship fewer features but make each one indispensable. Depth beats breadth every time.",
    decisionStyle: "Says no to 90% of feature requests. If it doesn't move the core metric, it doesn't ship.",
    iconicMove: "Killed the feature backlog and replaced it with a 'jobs to be done' framework",
  },
  "UI/UX Quality": {
    philosophy: "Design is not decoration — it's how the product thinks. Every pixel earns its place.",
    decisionStyle: "Blocks launches over alignment issues. Believes craft compounds into brand loyalty.",
    iconicMove: "Rebuilt the entire UI from scratch mid-growth because the design debt was slowing the team",
  },
  "Onboarding & Setup": {
    philosophy: "If a user can't get value in under 2 minutes, the product has failed. Remove every friction point.",
    decisionStyle: "Obsessively tracks time-to-value. Will trade features for faster onboarding every time.",
    iconicMove: "Cut the signup form from 8 fields to 1 and saw activation rates triple",
  },
  Performance: {
    philosophy: "Speed is a feature. Slow software is broken software. Optimize the critical path ruthlessly.",
    decisionStyle: "Sets hard latency budgets per interaction. No feature ships if it regresses p95.",
    iconicMove: "Mandated that every API call resolves in under 200ms, rewrote the data layer to make it happen",
  },
  "Auth & Security": {
    philosophy: "Trust is the product. One breach erases years of goodwill. Security is non-negotiable, never an afterthought.",
    decisionStyle: "Hires security engineers before growth engineers. Reviews every auth change personally.",
    iconicMove: "Open-sourced the security audit process to build customer trust through transparency",
  },
  Reliability: {
    philosophy: "Uptime is a promise. Every outage is a broken contract with users who depend on us.",
    decisionStyle: "Runs chaos engineering tests monthly. Won't launch without a rollback plan.",
    iconicMove: "Implemented automatic canary deploys with instant rollback — zero user-facing outages for 18 months",
  },
  Customization: {
    philosophy: "The best product disappears into the user's workflow. Flexibility is how you avoid being replaced.",
    decisionStyle: "Builds platforms, not products. Every feature has an API. Power users are the roadmap.",
    iconicMove: "Launched a plugin marketplace that now drives 40% of user retention",
  },
  "Team & Collaboration": {
    philosophy: "Software is a team sport. The product should make collaboration effortless, not add overhead.",
    decisionStyle: "Dogfoods every collaboration feature internally before shipping. If the team won't use it, users won't either.",
    iconicMove: "Built real-time presence indicators that reduced duplicate work by 60%",
  },
};

export function generateCPO(app: ReferenceApp): CPOPersona {
  // Find top 3 scoring categories to define this CPO's identity
  const ranked = [...app.scores]
    .filter((c) => c.avg > 0)
    .sort((a, b) => b.avg - a.avg);

  const topCategory = ranked[0]?.name ?? "Core Features";
  const topTraits = ranked.slice(0, 3).map((c) => c.name);

  // Deterministic name from app name hash
  const hash = app.name.split("").reduce((h, c) => h + c.charCodeAt(0), 0);
  const firstName = CPO_FIRST_NAMES[hash % CPO_FIRST_NAMES.length];
  const lastName = CPO_LAST_NAMES[(hash * 7) % CPO_LAST_NAMES.length];

  const topPhilosophy = CATEGORY_PHILOSOPHIES[topCategory] ?? CATEGORY_PHILOSOPHIES["Core Features"];

  // Build strengths from top-scoring categories
  const strengths = ranked.slice(0, 3).map((cat) => {
    const bestSub = [...cat.subCriteria].sort((a, b) => b.score - a.score)[0];
    return `${cat.name}: ${bestSub?.name ?? "strong"} (${cat.avg}/100)`;
  });

  // Blind spots from lowest-scoring categories
  const weakest = ranked.slice(-2);
  const blindSpots = weakest.map((cat) => {
    const worstSub = [...cat.subCriteria].sort((a, b) => a.score - b.score)[0];
    return `${cat.name}: ${worstSub?.name ?? "needs work"} (${cat.avg}/100)`;
  });

  return {
    name: `${firstName} ${lastName}`,
    company: app.name,
    title: "Chief Product Officer",
    philosophy: topPhilosophy.philosophy,
    strengths,
    blindSpots,
    decisionStyle: topPhilosophy.decisionStyle,
    iconicMove: topPhilosophy.iconicMove,
  };
}

export function generateCPOReaction(
  cpo: CPOPersona,
  round: Round
): string {
  const category = round.categoryAffected;
  const isStrengthArea = cpo.strengths.some((s) => s.startsWith(category));
  const isWeakArea = cpo.blindSpots.some((s) => s.startsWith(category));

  if (isStrengthArea) {
    const reactions = [
      `"Good move. At ${cpo.company} we learned that ${category.toLowerCase()} is everything. But you'll need to go deeper than '${round.decision.toLowerCase()}' to truly compete."`,
      `"We built ${cpo.company}'s reputation on ${category.toLowerCase()}. This is the right priority — but execution is what separates leaders from followers."`,
      `"Interesting. This is exactly where ${cpo.company} dominates. You're closing the gap, but our head start in ${category.toLowerCase()} runs deep."`,
    ];
    return reactions[round.number % reactions.length];
  }

  if (isWeakArea) {
    const reactions = [
      `"Smart to invest here. Honestly, this is where ${cpo.company} still has work to do too. Watch — you might leapfrog us on ${category.toLowerCase()}."`,
      `"Fair play. ${category} isn't our strongest area either. The question is whether you can solve it better than we did."`,
    ];
    return reactions[round.number % reactions.length];
  }

  const reactions = [
    `"Solid incremental move. At ${cpo.company}, we'd push for bolder bets — but consistency compounds."`,
    `"Not bad. But if you really want to compete with ${cpo.company}, you'll need to find your own unfair advantage, not just close gaps."`,
    `"We considered something similar at ${cpo.company}. The real question is: will your users notice?"`,
  ];
  return reactions[round.number % reactions.length];
}

// ── Empty Draft ────────────────────────────────────────────────────

export const EMPTY_APP_BRIEF: AppBrief = {
  name: "",
  description: "",
  target_users: "",
  core_value: "",
  tech_stack: "",
  current_state: "",
};

export const EMPTY_IMPROVEMENT_DRAFT: ImprovementDraft = {
  team: DEFAULT_TEAM.map((m) => ({ ...m })),
  app: { ...EMPTY_APP_BRIEF },
  referenceApps: [
    { name: "", why: "", scores: createEmptyScores(), cpo: null },
    { name: "", why: "", scores: createEmptyScores(), cpo: null },
    { name: "", why: "", scores: createEmptyScores(), cpo: null },
  ],
  selfScores: createEmptyScores(),
  personaScores: [],
  consensusScores: createEmptyScores(),
  gapAnalysis: [],
  rounds: [],
  currentRound: 0,
  targetScore: 80,
};
