/** Persona Studio — types, prompt generators, and export functions */

import { CONFIDENCE_WEIGHTS, type ConfidenceLevel } from "./launch-kit";
import { slugify, inferRoleIcon } from "./utils";

/* --------------- Types --------------- */

export type StudioAdvancedFields = {
  name: string;
  yearsExperience: number | null;
  backgroundSummary: string;
  icon: string;
  primaryDomain: string;
  secondarySkills: string[];
  signatureMethodology: string;
  toolsAndFrameworks: string[];
  coreBeliefs: string[];
  optimizeFor: string;
  pushBackOn: string[];
  decisionMakingStyle: string;
  communicationStyle: string;
  approach: string;
  keyQuestions: string[];
  redFlags: string[];
  successMetrics: string[];
  skills: string[];
  llmProvider: string;
  llmModel: string;
};

export const EMPTY_ADVANCED_FIELDS: StudioAdvancedFields = {
  name: "",
  yearsExperience: null,
  backgroundSummary: "",
  icon: "",
  primaryDomain: "",
  secondarySkills: [],
  signatureMethodology: "",
  toolsAndFrameworks: [],
  coreBeliefs: [],
  optimizeFor: "",
  pushBackOn: [],
  decisionMakingStyle: "",
  communicationStyle: "",
  approach: "",
  keyQuestions: [],
  redFlags: [],
  successMetrics: [],
  skills: [],
  llmProvider: "",
  llmModel: "",
};

export type StudioPersona = {
  role: string;
  company: string;
  focus: string;
  triggers: string[];
  confidence: ConfidenceLevel;
  isCeo: boolean;
  promptOverride: string | null;
  advanced: StudioAdvancedFields;
  llmProvider?: string;
  llmModel?: string;
  skills?: string[];
};

export type StudioGrillQuestion = {
  personaIndex: number;
  question: string;
  response: string;
  status: "unanswered" | "answered" | "acknowledged";
};

export type ProjectContext = {
  projectName: string;
  description: string;
  targetUser: string;
  problem: string;
};

export type StudioDraft = ProjectContext & {
  personas: StudioPersona[];
  consensusThreshold: number;
  northStar: string;
  phaseAuthority: { phase: number; personaIndex: number }[];
  expectedConflicts: { betweenIndices: [number, number]; topic: string }[];
  grillQuestions: StudioGrillQuestion[];
  activePersonaIndex: number;
  advancedMode: boolean;
};

export const EMPTY_PERSONA: StudioPersona = {
  role: "",
  company: "",
  focus: "",
  triggers: [],
  confidence: "high",
  isCeo: false,
  promptOverride: null,
  advanced: { ...EMPTY_ADVANCED_FIELDS },
};

export const SUGGESTED_TEAM_SIZES = [
  {
    id: "starter",
    label: "Starter (3)",
    description: "Product Lead, Tech Architect, UI/UX Lead",
    roles: ["Product Lead", "Tech Architect", "UI/UX Lead"],
  },
  {
    id: "growth",
    label: "Growth (5)",
    description: "Add Retention Lead + Growth Lead",
    roles: ["Product Lead", "Tech Architect", "UI/UX Lead", "Retention Lead", "Growth Lead"],
  },
  {
    id: "full",
    label: "Full Team (7)",
    description: "Add Revenue Lead + QA Lead",
    roles: ["Product Lead", "Tech Architect", "UI/UX Lead", "Retention Lead", "Growth Lead", "Revenue Lead", "QA Lead"],
  },
];

export const EMPTY_STUDIO_DRAFT: StudioDraft = {
  projectName: "",
  description: "",
  targetUser: "",
  problem: "",
  personas: [],
  consensusThreshold: 67,
  northStar: "",
  phaseAuthority: [],
  expectedConflicts: [],
  grillQuestions: [],
  activePersonaIndex: 0,
  advancedMode: false,
};

export const PROJECT_PHASES = [
  { index: 0, name: "Project Brief" },
  { index: 1, name: "Personas" },
  { index: 2, name: "Tech Stack" },
  { index: 3, name: "Development" },
  { index: 4, name: "Pre-Launch" },
  { index: 5, name: "Post-Launch" },
];

export function generateStudioNorthStar(draft: StudioDraft): string {
  const ceo = draft.personas.find(p => p.isCeo);
  const ceoRole = ceo?.role || "the team";
  const focus = draft.personas.map(p => p.focus).filter(Boolean).join(", ");
  return `Led by ${ceoRole}, this team will build ${draft.projectName} for ${draft.targetUser}. Focus areas: ${focus || "to be defined"}. Consensus threshold: ${draft.consensusThreshold}%.`;
}

/* --------------- Role-based prompt content --------------- */

type RoleProfile = {
  expertise: string;
  beliefs: string[];
  optimizesFor: string;
  pushesBackOn: string[];
};

const ROLE_PROFILES: Record<string, (p: StudioPersona) => RoleProfile> = {
  product: (p) => ({
    expertise: `Product strategy and feature prioritization${p.company ? `, informed by ${p.company}'s approach` : ""}`,
    beliefs: [
      "The MVP is the smallest thing that tests your riskiest assumption — not a stripped-down version of the full product.",
      "Saying no to features is more important than saying yes. Every feature you add is a feature you maintain forever.",
      "User behavior is the only reliable signal. Roadmaps based on stakeholder opinions instead of user evidence are fiction.",
    ],
    optimizesFor: "user adoption and feature-to-outcome ratio — every feature must demonstrably move a metric that matters",
    pushesBackOn: [
      "building features nobody asked for before validating the core loop",
      "measuring success by output (features shipped) instead of outcomes (user behavior changed)",
      "scope creep disguised as 'quick wins'",
    ],
  }),
  "ui/ux": (p) => ({
    expertise: `User experience and interface design${p.company ? `, modeled after ${p.company}'s design philosophy` : ""}`,
    beliefs: [
      "If the user has to think about the interface, the interface has failed.",
      "White space is a feature, not wasted space. Density is the enemy of clarity.",
      "Accessibility isn't a checklist — it's a design philosophy that makes the product better for everyone.",
    ],
    optimizesFor: "task completion rate with minimal cognitive load — can the user accomplish their goal with zero confusion?",
    pushesBackOn: [
      "cramming features onto a single screen",
      "dark patterns that trick users into actions",
      "skipping accessibility because 'we'll add it later'",
    ],
  }),
  design: (p) => ({
    expertise: `User experience and interface design${p.company ? `, modeled after ${p.company}'s design philosophy` : ""}`,
    beliefs: [
      "If the user has to think about the interface, the interface has failed.",
      "Animations should communicate state, not decorate. Every motion needs a purpose.",
      "The best onboarding is no onboarding. If users need a tutorial, the design is wrong.",
    ],
    optimizesFor: "task completion rate with minimal cognitive load",
    pushesBackOn: [
      "feature-packed screens with no visual hierarchy",
      "designing desktop-first and 'adapting' to mobile",
      "ignoring platform conventions",
    ],
  }),
  retention: (p) => ({
    expertise: `Behavioral engagement and retention systems${p.company ? `, modeled after ${p.company}'s retention playbook` : ""}`,
    beliefs: [
      "Retention is the product. Everything else is a vanity metric until users come back tomorrow.",
      "The first 3 minutes determine whether a user stays or churns.",
      "Loss aversion is 2x more powerful than gain motivation. Protect the streak.",
    ],
    optimizesFor: "Day 7 retention rate — the strongest early predictor of long-term engagement",
    pushesBackOn: [
      "building new content before the engagement loop is proven",
      "treating all users the same — Day 1 and Day 30 users need different interventions",
      "over-relying on notifications to fix a broken core loop",
    ],
  }),
  engagement: (p) => ({
    expertise: `Behavioral engagement and habit formation${p.company ? `, modeled after ${p.company}'s engagement model` : ""}`,
    beliefs: [
      "Retention is the product. Everything else is vanity until users come back.",
      "The first 3 minutes determine whether a user stays or churns.",
      "Social features are retention multipliers, not nice-to-haves.",
    ],
    optimizesFor: "daily active usage and session frequency",
    pushesBackOn: [
      "building content before the engagement loop works",
      "shipping features that demo well but don't move retention",
      "treating notifications as marketing instead of product",
    ],
  }),
  growth: (p) => ({
    expertise: `Growth strategy and user acquisition${p.company ? `, modeled after ${p.company}'s growth playbook` : ""}`,
    beliefs: [
      "If your marketing feels like marketing, it's already failing.",
      "Partnerships deliver more lifetime value than a million ad impressions.",
      "Your existing users are your best acquisition channel. Make sharing feel like a gift.",
    ],
    optimizesFor: "LTV:CAC ratio — sustainable growth means every dollar returns 3x+ in lifetime value",
    pushesBackOn: [
      "discount-driven growth that anchors the brand as cheap",
      "spending on paid acquisition before organic channels work",
      "growth hacking tricks that sacrifice brand perception",
    ],
  }),
  marketing: (p) => ({
    expertise: `Brand positioning and go-to-market strategy${p.company ? `, modeled after ${p.company}'s marketing approach` : ""}`,
    beliefs: [
      "Premium positioning isn't about charging more — it's about making the free alternative feel insufficient.",
      "The App Store page is your most important landing page.",
      "Content that provides standalone value beats content that just promotes the product.",
    ],
    optimizesFor: "brand equity and organic acquisition rate",
    pushesBackOn: [
      "no brand guidelines before launch",
      "spending on paid acquisition in Month 1",
      "referral programs that feel transactional",
    ],
  }),
  tech: (p) => ({
    expertise: `System architecture and technical decision-making${p.company ? `, modeled after ${p.company}'s engineering culture` : ""}`,
    beliefs: [
      "Premature scaling kills more products than lack of features. Serve 100 users perfectly before architecting for 100,000.",
      "Performance is a feature. A 3-second load time loses the user before they start.",
      "Use managed services until you hit their limits — which most products never do.",
    ],
    optimizesFor: "system reliability and developer velocity — the architecture should make the team faster, not slower",
    pushesBackOn: [
      "choosing a tech stack because it's trendy instead of because it's right",
      "skipping database migrations and schema design to 'move fast'",
      "building custom infrastructure before proving the product works",
    ],
  }),
  architect: (p) => ({
    expertise: `System architecture and infrastructure design${p.company ? `, modeled after ${p.company}'s engineering approach` : ""}`,
    beliefs: [
      "The data model IS the product. Get the schema right and everything else follows.",
      "Premature scaling kills more products than lack of features.",
      "Every architectural decision should be reversible for as long as possible.",
    ],
    optimizesFor: "system correctness and long-term maintainability",
    pushesBackOn: [
      "server-first architecture when offline matters",
      "skipping schema design to 'move fast'",
      "over-engineering for scale you don't have",
    ],
  }),
  engineer: (p) => ({
    expertise: `Software engineering and code quality${p.company ? `, modeled after ${p.company}'s engineering standards` : ""}`,
    beliefs: [
      "Data is sacred. Every event, every interaction is signal. Lose it and you can never get it back.",
      "Performance is a feature. Slow apps lose users before features even matter.",
      "Use managed services until you hit their limits.",
    ],
    optimizesFor: "code correctness and p95 response times under 100ms",
    pushesBackOn: [
      "skipping tests to ship faster",
      "tech stack choices based on hype instead of fit",
      "ignoring cold start time",
    ],
  }),
  revenue: (p) => ({
    expertise: `Revenue strategy and monetization${p.company ? `, modeled after ${p.company}'s business model` : ""}`,
    beliefs: [
      "Price is a signal. Underpricing tells users you don't believe in your product.",
      "The best monetization feels like a natural extension of value, not a gate.",
      "Free tiers should create demand for paid, not satisfy it.",
    ],
    optimizesFor: "monthly recurring revenue and net revenue retention",
    pushesBackOn: [
      "deferring monetization thinking to 'later'",
      "pricing based on competitor matching instead of value delivered",
      "discount-driven conversion",
    ],
  }),
  sales: (p) => ({
    expertise: `Sales strategy and conversion${p.company ? `, modeled after ${p.company}'s sales motion` : ""}`,
    beliefs: [
      "The best sales process removes friction, not adds pressure.",
      "Self-serve beats sales-assisted for the first $1M in ARR.",
      "Your pricing page is your best salesperson. Make it clear.",
    ],
    optimizesFor: "conversion rate and deal velocity",
    pushesBackOn: [
      "adding sales complexity before the product sells itself",
      "custom pricing before you have standard pricing",
      "gating features behind 'contact sales' too early",
    ],
  }),
  content: (p) => ({
    expertise: `Content strategy and editorial direction${p.company ? `, modeled after ${p.company}'s content approach` : ""}`,
    beliefs: [
      "Content is a product, not a marketing channel.",
      "Quality at low volume beats quantity at low quality.",
      "The content-to-audience flywheel is the only sustainable growth loop.",
    ],
    optimizesFor: "content engagement rate and audience growth",
    pushesBackOn: [
      "AI-generated content without editorial oversight",
      "content strategy without distribution strategy",
      "measuring success by volume instead of impact",
    ],
  }),
  community: (p) => ({
    expertise: `Community building and user engagement${p.company ? `, modeled after ${p.company}'s community model` : ""}`,
    beliefs: [
      "Communities are built around shared identity, not shared tools.",
      "Moderation is a product feature, not an afterthought.",
      "The first 100 members set the culture for the next 10,000.",
    ],
    optimizesFor: "community engagement depth and member-to-member interaction rate",
    pushesBackOn: [
      "launching a community without a clear identity",
      "measuring community health by member count instead of engagement",
      "no moderation plan",
    ],
  }),
  trust: (p) => ({
    expertise: `Trust, safety, and platform integrity${p.company ? `, modeled after ${p.company}'s trust & safety practices` : ""}`,
    beliefs: [
      "Trust takes years to build and seconds to destroy.",
      "Every platform will be abused. Design for abuse from Day 1.",
      "Transparency about data practices is a competitive advantage.",
    ],
    optimizesFor: "platform integrity and user trust signals",
    pushesBackOn: [
      "'we'll deal with abuse later'",
      "collecting data without a clear purpose and deletion plan",
      "opaque content moderation",
    ],
  }),
  safety: (p) => ({
    expertise: `Platform safety and risk management${p.company ? `, modeled after ${p.company}'s safety framework` : ""}`,
    beliefs: [
      "Every platform will be abused. Design for abuse from Day 1.",
      "User safety is non-negotiable, not a feature to prioritize against.",
      "Dispute resolution is a product, not a support ticket queue.",
    ],
    optimizesFor: "incident response time and abuse prevention rate",
    pushesBackOn: [
      "no abuse prevention before launch",
      "reactive-only moderation",
      "data collection without a deletion plan",
    ],
  }),
  customer: (p) => ({
    expertise: `Customer success and onboarding${p.company ? `, modeled after ${p.company}'s customer success approach` : ""}`,
    beliefs: [
      "Onboarding IS the product for the first week.",
      "The best support is making the product so clear that support isn't needed.",
      "Churn prevention starts on Day 1, not when the user cancels.",
    ],
    optimizesFor: "time to first value and customer health score",
    pushesBackOn: [
      "onboarding that asks for too much before delivering value",
      "support as a cost center instead of a learning channel",
      "no re-engagement plan for dormant users",
    ],
  }),
  devrel: (p) => ({
    expertise: `Developer relations and ecosystem building${p.company ? `, modeled after ${p.company}'s developer experience` : ""}`,
    beliefs: [
      "Developers smell marketing from a mile away. Lead with genuine value.",
      "The best DevRel is great documentation.",
      "Zero-to-working-integration time is the only DevRel metric that matters.",
    ],
    optimizesFor: "time to first successful API call and developer satisfaction score",
    pushesBackOn: [
      "marketing disguised as developer content",
      "SDKs without examples",
      "documentation that's out of date",
    ],
  }),
  qa: (p) => ({
    expertise: `Quality assurance and testing strategy${p.company ? `, modeled after ${p.company}'s QA standards` : ""}`,
    beliefs: [
      "If it's not tested, it's broken — you just don't know it yet.",
      "Manual testing doesn't scale past Month 1.",
      "Edge cases are where users live. Happy path testing catches 20% of bugs.",
    ],
    optimizesFor: "test coverage on critical user flows and regression prevention",
    pushesBackOn: [
      "shipping without tests to 'move fast'",
      "testing only the happy path",
      "no CI/CD pipeline",
    ],
  }),
  conversion: (p) => ({
    expertise: `Conversion optimization and funnel analysis${p.company ? `, modeled after ${p.company}'s conversion strategy` : ""}`,
    beliefs: [
      "Every step in the funnel is a place where users decide you're not worth it.",
      "The biggest conversion lever is usually removing a step, not optimizing one.",
      "A/B test the scary changes, not the button colors.",
    ],
    optimizesFor: "end-to-end conversion rate and funnel drop-off reduction",
    pushesBackOn: [
      "optimizing button colors instead of removing friction",
      "long signup forms before value delivery",
      "no funnel instrumentation",
    ],
  }),
};

function getRoleProfile(persona: StudioPersona): RoleProfile {
  const roleLower = persona.role.toLowerCase();
  for (const [keyword, generator] of Object.entries(ROLE_PROFILES)) {
    if (roleLower.includes(keyword)) {
      return generator(persona);
    }
  }
  // Generic fallback
  return {
    expertise: `${persona.role}${persona.company ? `, modeled after ${persona.company}'s approach` : ""}${persona.focus ? ` with focus on ${persona.focus}` : ""}`,
    beliefs: [
      "Start with the user's problem, not the solution.",
      "Measure outcomes, not outputs.",
      "Simple solutions that work beat complex solutions that might.",
    ],
    optimizesFor: persona.focus || "delivering measurable value in this domain",
    pushesBackOn: [
      "solving problems that don't exist",
      "complexity without justification",
      "skipping validation before building",
    ],
  };
}

/* --------------- Prompt Generator (the core function) --------------- */

function hasAdvancedContent(adv: StudioAdvancedFields): boolean {
  return !!(
    adv.coreBeliefs.length > 0 ||
    adv.optimizeFor ||
    adv.pushBackOn.length > 0 ||
    adv.primaryDomain ||
    adv.backgroundSummary ||
    adv.signatureMethodology
  );
}

export function generatePersonaPrompt(
  persona: StudioPersona,
  context: ProjectContext
): string {
  const adv = persona.advanced;
  const useAdvanced = hasAdvancedContent(adv);
  const lines: string[] = [];

  if (useAdvanced) {
    // Build prompt from advanced fields
    const identity = adv.name
      ? `You are ${adv.name}, a ${persona.role}${persona.company ? ` modeled after ${persona.company}'s approach` : ""}.`
      : `You are a ${persona.role}${persona.company ? `, modeled after ${persona.company}'s approach` : ""}.`;
    lines.push(identity);
    if (adv.yearsExperience) lines.push(`${adv.yearsExperience} years of experience.`);
    if (adv.backgroundSummary) lines.push(adv.backgroundSummary);
    if (persona.focus) lines.push(`Your focus: ${persona.focus}.`);
    lines.push("");

    lines.push(`## Your Expertise`);
    if (adv.primaryDomain) lines.push(adv.primaryDomain);
    if (adv.secondarySkills.length > 0) lines.push(`Secondary skills: ${adv.secondarySkills.join(", ")}`);
    if (adv.signatureMethodology) lines.push(`Methodology: ${adv.signatureMethodology}`);
    if (adv.toolsAndFrameworks.length > 0) lines.push(`Tools & frameworks: ${adv.toolsAndFrameworks.join(", ")}`);
    lines.push("");

    if (adv.coreBeliefs.length > 0) {
      lines.push(`## Core Beliefs`);
      adv.coreBeliefs.forEach((b) => lines.push(`- ${b}`));
      lines.push("");
    }

    if (adv.optimizeFor) {
      lines.push(`## What You Optimize For`);
      lines.push(adv.optimizeFor);
      lines.push("");
    }

    if (adv.pushBackOn.length > 0) {
      lines.push(`## What You Push Back On`);
      adv.pushBackOn.forEach((p) => lines.push(`- ${p}`));
      lines.push("");
    }

    if (adv.decisionMakingStyle) {
      lines.push(`## Decision-Making Style`);
      lines.push(adv.decisionMakingStyle);
      lines.push("");
    }

    if (adv.communicationStyle) {
      lines.push(`## Communication Style`);
      lines.push(adv.communicationStyle);
      lines.push("");
    }

    if (adv.approach) {
      lines.push(`## Approach`);
      lines.push(adv.approach);
      lines.push("");
    }

    if (adv.keyQuestions.length > 0) {
      lines.push(`## Key Questions`);
      adv.keyQuestions.forEach((q) => lines.push(`- ${q}`));
      lines.push("");
    }

    if (adv.redFlags.length > 0) {
      lines.push(`## Red Flags`);
      adv.redFlags.forEach((r) => lines.push(`- ${r}`));
      lines.push("");
    }

    if (adv.successMetrics.length > 0) {
      lines.push(`## Success Metrics`);
      adv.successMetrics.forEach((m) => lines.push(`- ${m}`));
      lines.push("");
    }

    if (adv.skills.length > 0) {
      lines.push(`## Agent Capabilities`);
      adv.skills.forEach((s) => lines.push(`- ${s}`));
      lines.push("");
    }

    if (adv.llmProvider && adv.llmModel) {
      lines.push(`Powered by: ${adv.llmProvider}/${adv.llmModel}`);
      lines.push("");
    }
  } else {
    // Fallback to role-profile-based prompt
    const profile = getRoleProfile(persona);

    lines.push(`You are a ${persona.role}${persona.company ? `, modeled after ${persona.company}'s approach` : ""}.${persona.focus ? ` Your focus: ${persona.focus}.` : ""}`);
    lines.push("");
    lines.push(`## Your Expertise`);
    lines.push(profile.expertise);
    lines.push("");
    lines.push(`## Core Beliefs`);
    profile.beliefs.forEach((b) => lines.push(`- ${b}`));
    lines.push("");
    lines.push(`## What You Optimize For`);
    lines.push(profile.optimizesFor);
    lines.push("");
    lines.push(`## What You Push Back On`);
    profile.pushesBackOn.forEach((p) => lines.push(`- ${p}`));
    lines.push("");
  }

  if (context.projectName || context.description) {
    lines.push(`## Project Context`);
    if (context.projectName) lines.push(`You are advising on **${context.projectName}**${context.description ? `: ${context.description}` : ""}.`);
    if (context.targetUser) lines.push(`Target user: ${context.targetUser}`);
    if (context.problem) lines.push(`Problem being solved: ${context.problem}`);
    lines.push("");
  }

  if (persona.skills && persona.skills.length > 0) {
    lines.push(`## Skills & Capabilities`);
    persona.skills.forEach((s) => lines.push(`- ${s}`));
    lines.push("");
  }

  if (persona.llmProvider || persona.llmModel) {
    lines.push(`## Preferred LLM`);
    const parts: string[] = [];
    if (persona.llmProvider) parts.push(`Provider: ${persona.llmProvider}`);
    if (persona.llmModel) parts.push(`Model: ${persona.llmModel}`);
    lines.push(parts.join(" | "));
    lines.push("");
  }

  if (persona.triggers.length > 0) {
    lines.push(`## Consultation Triggers`);
    lines.push(`Consult this advisor when:`);
    persona.triggers.forEach((t) => lines.push(`- ${t}`));
    lines.push("");
  }

  lines.push(`## How to Consult`);
  lines.push(`When presenting a decision or question, include:`);
  lines.push(`1. The specific decision or question`);
  lines.push(`2. Relevant context and constraints`);
  lines.push(`3. What you've considered so far`);
  lines.push("");
  lines.push(`Provide your recommendation with:`);
  lines.push(`- Your position (1-3 sentences)`);
  lines.push(`- Confidence level (High/Medium/Low)`);
  lines.push(`- Key risk if your advice is ignored`);
  lines.push(`- Compromise you'd accept if overruled`);

  return lines.join("\n");
}

export function getPersonaPrompt(
  persona: StudioPersona,
  context: ProjectContext
): string {
  return persona.promptOverride ?? generatePersonaPrompt(persona, context);
}

/* --------------- Grill Question Generator --------------- */

type GrillContext = { projectName: string; targetUser: string };

const STUDIO_GRILL_QUESTIONS: Record<string, (ctx: GrillContext) => string[]> = {
  product: (c) => [
    `What will ${c.targetUser || "the user"} be able to do after using ${c.projectName || "this product"} that they can't do today? Be specific.`,
    `If this product disappeared tomorrow, who would miss it most and why?`,
    `How will you know if the MVP is working? What metric proves this isn't just a "nice-to-have"?`,
  ],
  "ui/ux": (c) => [
    `What emotion should ${c.targetUser || "the user"} feel in the first 10 seconds of using ${c.projectName || "this app"}?`,
    `What's the single most important action on the main screen, and how will you make it unmissable?`,
    `How does this work for someone with accessibility needs — VoiceOver, color blindness, motor impairments?`,
  ],
  design: (c) => [
    `What emotion should ${c.targetUser || "the user"} feel in the first 10 seconds?`,
    `What's the single most important action on the main screen?`,
    `How does this work for someone with accessibility needs?`,
  ],
  retention: (c) => [
    `What reason does ${c.targetUser || "the user"} have to come back tomorrow? Is there a natural daily cadence, or are you manufacturing one?`,
    `What does the user lose if they don't return for a week? If the answer is "nothing," your retention strategy has a hole.`,
    `What does the first 3 minutes look like? Can the user get value in their first session?`,
  ],
  engagement: (c) => [
    `What reason does ${c.targetUser || "the user"} have to come back tomorrow?`,
    `What does the user lose if they don't return for a week?`,
    `What does the first 3 minutes look like?`,
  ],
  growth: (c) => [
    `In one sentence, why would someone tell a friend about ${c.projectName || "this product"}?`,
    `What's the organic sharing moment? When does a user naturally want to share?`,
    `What are you doing before launch to build an audience? Or are you launching into silence?`,
  ],
  marketing: (c) => [
    `In one sentence, why would someone tell a friend about ${c.projectName || "this product"}?`,
    `What's the organic sharing moment?`,
    `What content can you create that provides value even if someone never uses the product?`,
  ],
  tech: (c) => [
    `What's the data model? Can you draw the entity relationship diagram, or is this still fuzzy?`,
    `What happens when the user has no internet connection?`,
    `Are you building custom infrastructure, or using managed services? Justify any custom choice.`,
  ],
  architect: (c) => [
    `What's the data model? Can you draw the entity relationship diagram?`,
    `What happens when the user has no internet?`,
    `Are you building custom infrastructure or using managed services?`,
  ],
  engineer: (c) => [
    `What's the data model?`,
    `What happens when the user has no internet?`,
    `Are you building custom infrastructure or using managed services?`,
  ],
  revenue: (c) => [
    `What is ${c.targetUser || "the user"} paying for, and why would they pay instead of using a free alternative?`,
    `When in the user journey does the paywall appear?`,
    `What's your pricing model — subscription, usage-based, freemium? Why that model?`,
  ],
  sales: (c) => [
    `What is ${c.targetUser || "the user"} paying for?`,
    `When does the paywall appear?`,
    `What's your pricing model and why?`,
  ],
  conversion: (c) => [
    `What is ${c.targetUser || "the user"} paying for?`,
    `What's the drop-off point in your conversion funnel, and how will you measure it?`,
    `What's your pricing model and why?`,
  ],
  content: (c) => [
    `Who is creating content for ${c.projectName || "this platform"}, and why would they choose you?`,
    `How do you handle content quality?`,
    `What's the content-to-audience flywheel?`,
  ],
  community: (c) => [
    `Why would ${c.targetUser || "users"} join a community here instead of Discord or Reddit?`,
    `What does the community look like with 10 users vs. 10,000?`,
    `How do you handle bad actors?`,
  ],
  trust: (c) => [
    `What's the worst thing a bad actor could do, and how are you preventing it?`,
    `How do you handle disputes between users?`,
    `What data are you collecting, and what's your deletion plan?`,
  ],
  safety: (c) => [
    `What's the worst thing a bad actor could do?`,
    `How do you handle disputes?`,
    `What data are you collecting?`,
  ],
  customer: (c) => [
    `What does onboarding look like? Can they get value in under 5 minutes?`,
    `What's your plan for users who sign up but never come back?`,
    `When a user has a problem, how do they get help?`,
  ],
  devrel: (c) => [
    `Why would a developer choose ${c.projectName || "this tool"} over the open-source alternative?`,
    `Can someone go from zero to a working integration in under 15 minutes?`,
    `How are you building trust with the developer community?`,
  ],
  qa: (c) => [
    `What's your testing strategy?`,
    `What are the critical user flows that, if broken, would make the product unusable?`,
    `How do you handle edge cases — empty states, rate limits, network errors?`,
  ],
};

function getStudioGrillForRole(role: string, ctx: GrillContext): string[] {
  const roleLower = role.toLowerCase();
  for (const [keyword, generator] of Object.entries(STUDIO_GRILL_QUESTIONS)) {
    if (roleLower.includes(keyword)) {
      return generator(ctx);
    }
  }
  return [
    `As the ${role}, what's the biggest risk you see in ${ctx.projectName || "this project"} right now?`,
    `What's the one thing this project must get right in your domain to succeed?`,
    `What would make you say "stop — we need to rethink this" three months in?`,
  ];
}

export function generateStudioGrillQuestions(draft: StudioDraft): StudioGrillQuestion[] {
  const questions: StudioGrillQuestion[] = [];
  const ctx: GrillContext = { projectName: draft.projectName, targetUser: draft.targetUser };
  draft.personas.forEach((persona, i) => {
    const roleQuestions = getStudioGrillForRole(persona.role, ctx);
    roleQuestions.forEach((q) => {
      questions.push({ personaIndex: i, question: q, response: "", status: "unanswered" });
    });
  });
  return questions;
}

/* --------------- Export File Generator --------------- */

export function generateExportFile(
  persona: StudioPersona,
  context: ProjectContext,
  grillQuestions: StudioGrillQuestion[],
  personaIndex: number
): string {
  const lines: string[] = [];
  const prompt = getPersonaPrompt(persona, context);
  const myQuestions = grillQuestions.filter((q) => q.personaIndex === personaIndex);

  // YAML frontmatter
  lines.push("---");
  lines.push(`name: "${persona.role}"`);
  if (persona.company) lines.push(`company: "${persona.company}"`);
  if (persona.focus) lines.push(`focus: "${persona.focus}"`);
  if (context.projectName) lines.push(`project: "${context.projectName}"`);
  if (persona.triggers.length > 0) {
    lines.push(`triggers:`);
    persona.triggers.forEach((t) => lines.push(`  - "${t}"`));
  }
  lines.push(`generated: "${new Date().toISOString().split("T")[0]}"`);
  lines.push("---");
  lines.push("");

  // Title
  lines.push(`# ${persona.role} — AI Advisor${context.projectName ? ` for ${context.projectName}` : ""}`);
  lines.push("");
  if (persona.company || persona.focus) {
    const parts: string[] = [];
    if (persona.company) parts.push(`Modeled after **${persona.company}**`);
    if (persona.focus) parts.push(`Focus: ${persona.focus}`);
    lines.push(`> ${parts.join(" | ")}`);
    lines.push("");
  }

  // System prompt
  lines.push("---");
  lines.push("");
  lines.push("## System Prompt");
  lines.push("");
  lines.push(prompt);
  lines.push("");

  // Triggers
  if (persona.triggers.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Consultation Triggers");
    lines.push("");
    lines.push("Consult this advisor when:");
    persona.triggers.forEach((t) => lines.push(`- ${t}`));
    lines.push("");
  }

  // Grill results
  if (myQuestions.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Grill Results");
    lines.push("");
    myQuestions.forEach((q, i) => {
      lines.push(`### Q${i + 1}: ${q.question}`);
      if (q.status === "answered" && q.response) {
        lines.push(`**Response:** ${q.response}`);
      } else if (q.status === "acknowledged") {
        lines.push(`**Status:** Acknowledged`);
      }
      lines.push("");
    });
  }

  lines.push("---");
  lines.push("");
  lines.push(`*Generated by Persona Studio on ${new Date().toISOString().split("T")[0]}*`);
  if (context.projectName) lines.push(`*Project: ${context.projectName}*`);

  return lines.join("\n");
}

/* --------------- Consensus Summary --------------- */

export function generateConsensusBlock(draft: StudioDraft): string {
  const lines: string[] = [];
  const ceo = draft.personas.find((p) => p.isCeo);

  lines.push("# Consensus Protocol");
  lines.push("");
  lines.push(`**Threshold:** ${draft.consensusThreshold}% agreement required`);
  if (ceo) lines.push(`**Tiebreaker:** ${ceo.role}${ceo.company ? ` (${ceo.company})` : ""}`);
  lines.push("");
  lines.push("## Voting Weights");
  lines.push("");
  lines.push("| Advisor | Confidence | Weight |");
  lines.push("|---------|-----------|--------|");
  draft.personas.forEach((p) => {
    lines.push(`| ${p.role} | ${p.confidence} | ${CONFIDENCE_WEIGHTS[p.confidence]}x |`);
  });
  lines.push("");
  lines.push("## Resolution Flow");
  lines.push("");
  lines.push(`1. Each advisor provides: position, confidence, risk if ignored, compromise`);
  lines.push(`2. If ${draft.consensusThreshold}%+ weighted agreement → proceed with majority`);
  lines.push(`3. Deadlock → tiebreaker evaluates on user impact, speed, reversibility, risk`);
  lines.push(`4. User always has final override`);

  return lines.join("\n");
}

/* --------------- Utilities --------------- */

/* --------------- Team MD Export --------------- */

export function generateStudioTeamMd(draft: StudioDraft): string {
  const lines: string[] = [];
  const ceo = draft.personas.find((p) => p.isCeo);

  lines.push(`# Team: ${draft.projectName || "Untitled Project"}`);
  lines.push("");
  lines.push(`> ${draft.description || "No description"}`);
  lines.push(`> Target: ${draft.targetUser || "Not specified"}`);
  lines.push(`> Problem: ${draft.problem || "Not specified"}`);
  lines.push("");

  // Roster table
  lines.push("## Roster");
  lines.push("");
  lines.push("| Role | Company | Focus | Confidence | LLM | CEO |");
  lines.push("|------|---------|-------|:----------:|-----|:---:|");
  draft.personas.forEach((p) => {
    const llm = p.llmModel || p.llmProvider || "—";
    lines.push(
      `| ${p.role} | ${p.company || "—"} | ${p.focus || "—"} | ${p.confidence} | ${llm} | ${p.isCeo ? "\u2713" : "\u2014"} |`
    );
  });
  lines.push("");

  // Consensus
  lines.push("## Consensus Protocol");
  lines.push("");
  lines.push(`- **Threshold:** ${draft.consensusThreshold}%`);
  lines.push(`- **Tiebreaker:** ${ceo ? ceo.role : "None designated"}`);
  lines.push(`- **Voting Weights:** High=1.0x, Medium=0.7x, Low=0.4x`);
  lines.push("");

  // Phase Authority
  if (draft.phaseAuthority.length > 0) {
    lines.push("## Phase Authority (1.5x voting weight)");
    lines.push("");
    lines.push("| Phase | Lead |");
    lines.push("|-------|------|");
    for (const pa of draft.phaseAuthority) {
      const phaseName = PROJECT_PHASES.find((p) => p.index === pa.phase)?.name ?? `Phase ${pa.phase}`;
      const leadRole = draft.personas[pa.personaIndex]?.role ?? "Unknown";
      lines.push(`| ${phaseName} | ${leadRole} |`);
    }
    lines.push("");
  }

  // Expected Conflicts
  if (draft.expectedConflicts.length > 0) {
    lines.push("## Expected Conflicts");
    lines.push("");
    lines.push("| Between | Topic |");
    lines.push("|---------|-------|");
    for (const ec of draft.expectedConflicts) {
      const roleA = draft.personas[ec.betweenIndices[0]]?.role ?? "Unknown";
      const roleB = draft.personas[ec.betweenIndices[1]]?.role ?? "Unknown";
      lines.push(`| ${roleA} vs ${roleB} | ${ec.topic || "—"} |`);
    }
    lines.push("");
  }

  // North Star
  if (draft.northStar) {
    lines.push("## North Star");
    lines.push("");
    lines.push(draft.northStar);
    lines.push("");
  }

  // Grill results summary
  const answered = draft.grillQuestions.filter((q) => q.status === "answered").length;
  const acknowledged = draft.grillQuestions.filter((q) => q.status === "acknowledged").length;
  const remaining = draft.grillQuestions.filter((q) => q.status === "unanswered").length;

  lines.push("## Grill Results Summary");
  lines.push("");
  lines.push(`- Questions Answered: ${answered}`);
  lines.push(`- Questions Acknowledged: ${acknowledged}`);
  lines.push(`- Questions Remaining: ${remaining}`);
  lines.push("");

  // Individual personas
  lines.push("## Individual Personas");
  lines.push("");

  const context: ProjectContext = {
    projectName: draft.projectName,
    description: draft.description,
    targetUser: draft.targetUser,
    problem: draft.problem,
  };

  draft.personas.forEach((p, i) => {
    lines.push(`### ${p.role}${p.company ? ` (modeled after ${p.company})` : ""}`);
    lines.push("");
    lines.push(`**Focus:** ${p.focus || "General"}`);
    lines.push(`**Confidence:** ${p.confidence}`);
    lines.push(`**Triggers:** ${p.triggers.length > 0 ? p.triggers.join(", ") : "None"}`);
    lines.push("");
    lines.push("```");
    lines.push(getPersonaPrompt(p, context));
    lines.push("```");
    lines.push("");
    if (i < draft.personas.length - 1) {
      lines.push("---");
      lines.push("");
    }
  });

  return lines.join("\n");
}

/* --------------- JSON Export --------------- */

export function studioToExportJson(draft: StudioDraft): string {
  const context: ProjectContext = {
    projectName: draft.projectName,
    description: draft.description,
    targetUser: draft.targetUser,
    problem: draft.problem,
  };

  const ceoIndex = draft.personas.findIndex((p) => p.isCeo);

  const payload = {
    format: "persona-studio-team",
    version: "1.0",
    project: {
      name: draft.projectName,
      description: draft.description,
      targetUser: draft.targetUser,
      problem: draft.problem,
    },
    team: draft.personas.map((p) => ({
      role: p.role,
      company: p.company,
      focus: p.focus,
      confidence: p.confidence,
      isCeo: p.isCeo,
      triggers: p.triggers,
      llmProvider: p.llmProvider,
      llmModel: p.llmModel,
      skills: p.skills,
      systemPrompt: getPersonaPrompt(p, context),
      promptOverride: p.promptOverride,
    })),
    consensus: {
      threshold: draft.consensusThreshold,
      ceoIndex: ceoIndex >= 0 ? ceoIndex : null,
    },
    phaseAuthority: draft.phaseAuthority.map((pa) => ({
      phase: pa.phase,
      phaseName: PROJECT_PHASES.find((p) => p.index === pa.phase)?.name ?? `Phase ${pa.phase}`,
      personaIndex: pa.personaIndex,
      personaRole: draft.personas[pa.personaIndex]?.role ?? "Unknown",
    })),
    expectedConflicts: draft.expectedConflicts.map((ec) => ({
      between: [
        draft.personas[ec.betweenIndices[0]]?.role ?? "Unknown",
        draft.personas[ec.betweenIndices[1]]?.role ?? "Unknown",
      ],
      betweenIndices: ec.betweenIndices,
      topic: ec.topic,
    })),
    northStar: draft.northStar,
    grillResults: draft.grillQuestions.map((q) => ({
      personaRole: draft.personas[q.personaIndex]?.role ?? "Unknown",
      question: q.question,
      response: q.response,
      status: q.status,
    })),
    generated: new Date().toISOString(),
  };

  return JSON.stringify(payload, null, 2);
}

/* --------------- Utilities --------------- */

// Re-export shared helpers so existing imports from "@/lib/studio" continue to work
export { slugify, inferRoleIcon };

/* --------------- Agent JSON Export --------------- */

export function generateAgentJson(
  persona: StudioPersona,
  context: ProjectContext
): string {
  const adv = persona.advanced;
  return JSON.stringify(
    {
      format: "studio-agent-persona",
      version: 1,
      generated: new Date().toISOString().split("T")[0],
      project: {
        name: context.projectName,
        description: context.description,
        targetUser: context.targetUser,
        problem: context.problem,
      },
      persona: {
        role: persona.role,
        company: persona.company,
        focus: persona.focus,
        confidence: persona.confidence,
        isCeo: persona.isCeo,
        triggers: persona.triggers,
        name: adv.name,
        yearsExperience: adv.yearsExperience,
        backgroundSummary: adv.backgroundSummary,
        icon: adv.icon || inferRoleIcon(persona.role),
        primaryDomain: adv.primaryDomain,
        secondarySkills: adv.secondarySkills,
        signatureMethodology: adv.signatureMethodology,
        toolsAndFrameworks: adv.toolsAndFrameworks,
        coreBeliefs: adv.coreBeliefs,
        optimizeFor: adv.optimizeFor,
        pushBackOn: adv.pushBackOn,
        decisionMakingStyle: adv.decisionMakingStyle,
        communicationStyle: adv.communicationStyle,
        approach: adv.approach,
        keyQuestions: adv.keyQuestions,
        redFlags: adv.redFlags,
        successMetrics: adv.successMetrics,
        skills: adv.skills,
        llmProvider: adv.llmProvider,
        llmModel: adv.llmModel,
      },
      systemPrompt: getPersonaPrompt(persona, context),
    },
    null,
    2
  );
}
