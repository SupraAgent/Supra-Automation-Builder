/** Auto-Research — types and mock evaluation generators */

/* --------------- Types --------------- */

export type ResearchMode = "team_evaluation" | "checklist_scoring";
export type ComputeBackend = "claude_api" | "ollama";
export type ModelOption = "sonnet" | "haiku" | "opus";

export type ResearchConfig = {
  mode: ResearchMode;
  backend: ComputeBackend;
  model: ModelOption;
  apiKey: string;
  ollamaUrl: string;
  projectContext: string;
  selectedPersonaIds: string[];
};

export const EMPTY_CONFIG: ResearchConfig = {
  mode: "team_evaluation",
  backend: "claude_api",
  model: "sonnet",
  apiKey: "",
  ollamaUrl: "http://localhost:11434",
  projectContext: "",
  selectedPersonaIds: [],
};

export type EvaluationMetric = {
  name: string;
  score: number;
  reasoning: string;
};

export type PersonaEvaluation = {
  personaId: string;
  personaName: string;
  personaIcon: string;
  metrics: EvaluationMetric[];
  overallScore: number;
  gapAnalysis: string;
  strengths: string[];
  improvements: string[];
};

export type ChecklistItem = {
  id?: string;
  item: string;
  question?: string;
  catches?: string;
  pass: boolean;
  note: string;
};

export type PersonaChecklist = {
  personaId: string;
  personaName: string;
  personaIcon: string;
  items: ChecklistItem[];
  passRate: number;
};

export type ResearchResults = {
  mode: ResearchMode;
  evaluations: PersonaEvaluation[];
  checklists: PersonaChecklist[];
  summary: string;
};

/* --------------- Constants --------------- */

export const EVALUATION_METRICS = [
  "Domain Expertise Depth",
  "Consultation Trigger Coverage",
  "Bias Balance",
  "Actionability of Advice",
  "Team Complementarity",
];

export const MODELS: { id: ModelOption; label: string; description: string }[] = [
  { id: "sonnet", label: "Sonnet 4.6", description: "Recommended" },
  { id: "haiku", label: "Haiku 4.5", description: "Fastest" },
  { id: "opus", label: "Opus 4.6", description: "Deepest" },
];

/* --------------- Team Research Types --------------- */

export type TeamGap = {
  area: string;
  severity: "critical" | "moderate" | "minor";
  suggestion: string;
};

export function exportResearchToJson(result: AutoResearchResult): string {
  return JSON.stringify(result, null, 2);
}

export function exportResearchToMarkdown(result: AutoResearchResult): string {
  const lines: string[] = ["# Team Evaluation Report", "", `*Generated: ${result.timestamp}*`, ""];
  lines.push(`**Team Score: ${result.teamScore}/100**`, "");
  result.scorecards.forEach((s) => {
    lines.push(`## ${s.personaName} — ${s.overall}/100`);
    lines.push("");
    Object.entries(s.scores).forEach(([k, v]) => {
      lines.push(`- **${k}**: ${v}/100`);
    });
    if (s.strengths.length) { lines.push("", "**Strengths:**"); s.strengths.forEach((st) => lines.push(`- ${st}`)); }
    if (s.weaknesses.length) { lines.push("", "**Weaknesses:**"); s.weaknesses.forEach((w) => lines.push(`- ${w}`)); }
    lines.push("", "---", "");
  });
  if (result.gaps.length) {
    lines.push("## Gaps", "");
    result.gaps.forEach((g) => lines.push(`- **${g.area}** (${g.severity}): ${g.suggestion}`));
    lines.push("");
  }
  return lines.join("\n");
}

export function exportResearchToCsv(result: AutoResearchResult): string {
  const headers = ["Persona", "Overall", "Relevance", "Specificity", "Coverage", "Differentiation", "Actionability"];
  const rows = result.scorecards.map((s) =>
    [s.personaName, s.overall, s.scores.relevance, s.scores.specificity, s.scores.coverage, s.scores.differentiation, s.scores.actionability].join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

/* --------------- Export Helpers --------------- */

export type AutoresearchRound = {
  round: number;
  changeDescription: string;
  previousScore: number;
  newScore: number;
  kept: boolean;
  failedItems: string[];
};

export function exportChecklistToJson(results: AutoresearchLoopResult | AutoresearchLoopResult[]): string {
  return JSON.stringify(results, null, 2);
}

export function exportChecklistToMarkdown(results: AutoresearchLoopResult | AutoresearchLoopResult[]): string {
  const arr = Array.isArray(results) ? results : [results];
  const lines: string[] = ["# Checklist Scoring Results", ""];
  arr.forEach((r, i) => {
    lines.push(`## Round ${i + 1} — Score: ${r.score}/100`);
    lines.push("");
    lines.push("| Check | Result |");
    lines.push("|-------|--------|");
    r.results.forEach((item) => {
      lines.push(`| ${item.question} | ${item.passed ? "PASS" : "FAIL"} |`);
    });
    lines.push("");
    if (r.failedItems.length > 0) {
      lines.push(`**Failed:** ${r.failedItems.join(", ")}`);
      lines.push("");
    }
    if (r.suggestedChange) {
      lines.push(`**Suggestion:** ${r.suggestedChange}`);
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  });
  return lines.join("\n");
}

/* --------------- Mock Generators --------------- */

type PersonaRow = {
  id: string;
  name: string;
  system_prompt: string;
  capabilities: string[];
  icon: string | null;
};

const METRIC_REASONING: Record<string, string[]> = {
  "Domain Expertise Depth": [
    "Persona demonstrates strong domain knowledge with specific, actionable beliefs.",
    "Good breadth of expertise but could go deeper on edge cases.",
    "Expertise is well-defined but narrowly focused — may miss cross-domain implications.",
    "Strong technical depth with practical experience markers.",
  ],
  "Consultation Trigger Coverage": [
    "Triggers are well-defined and cover key decision points.",
    "Trigger coverage is adequate but misses some common consultation scenarios.",
    "Triggers could be more specific to reduce ambiguity about when to consult.",
    "Excellent trigger definition — clear boundaries for when to engage.",
  ],
  "Bias Balance": [
    "Persona shows healthy push-back patterns without being overly rigid.",
    "Some biases toward specific approaches that could limit advice diversity.",
    "Well-balanced perspective with clear awareness of trade-offs.",
    "Could benefit from acknowledging more nuanced trade-offs in recommendations.",
  ],
  "Actionability of Advice": [
    "Advice patterns are concrete and immediately implementable.",
    "Recommendations are sound but sometimes lack specific next steps.",
    "Good balance of strategic thinking and tactical advice.",
    "Advice is highly actionable with clear decision frameworks.",
  ],
  "Team Complementarity": [
    "Role fills a clear gap in the team's collective expertise.",
    "Some overlap with other team members — consider differentiating focus areas.",
    "Strong complementary fit — this role adds unique perspective to the team.",
    "Good team fit but could benefit from stronger cross-role interaction patterns.",
  ],
};

function randomScore(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMockEvaluation(
  persona: PersonaRow,
  projectContext: string
): PersonaEvaluation {
  const metrics: EvaluationMetric[] = EVALUATION_METRICS.map((name) => ({
    name,
    score: randomScore(62, 95),
    reasoning: pickRandom(METRIC_REASONING[name]),
  }));

  const overallScore = Math.round(
    metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length
  );

  const strengths = [
    `Strong ${persona.name.toLowerCase().includes("tech") || persona.name.toLowerCase().includes("engineer") ? "technical" : "domain"} expertise definition`,
    "Clear push-back patterns that prevent common pitfalls",
    "Well-structured consultation format for consistent advice",
  ].slice(0, 2 + Math.floor(Math.random() * 2));

  const improvements = [
    "Consider adding more specific consultation triggers for edge cases",
    "Could benefit from explicit cross-role collaboration patterns",
    "Add failure mode definitions — what does bad advice from this persona look like?",
  ].slice(0, 1 + Math.floor(Math.random() * 2));

  return {
    personaId: persona.id,
    personaName: persona.name,
    personaIcon: persona.icon || "\u{1F916}",
    metrics,
    overallScore,
    gapAnalysis: `${persona.name} covers ${overallScore >= 80 ? "most" : "many"} key areas for its role${projectContext ? ` in the context of "${projectContext.slice(0, 50)}..."` : ""}. ${overallScore >= 85 ? "This is a strong persona with minimal gaps." : "Consider strengthening trigger definitions and cross-role interaction patterns."}`,
    strengths,
    improvements,
  };
}

const CHECKLIST_ITEMS = [
  { item: "Has clearly defined domain expertise", note: "Expertise should be specific, not generic" },
  { item: "Has 3+ core beliefs that guide advice", note: "Beliefs shape the persona's perspective" },
  { item: "Defines what it optimizes for", note: "Optimization target should be measurable" },
  { item: "Has push-back patterns defined", note: "Push-back prevents common mistakes" },
  { item: "Has consultation triggers", note: "When should this persona be consulted?" },
  { item: "Specifies output format for advice", note: "Structured output improves consistency" },
  { item: "Has confidence level indicators", note: "High/Medium/Low for recommendation strength" },
  { item: "Defines compromise positions", note: "What happens when overruled?" },
  { item: "Has project context awareness", note: "Persona should adapt to project specifics" },
  { item: "Complements other team members", note: "No excessive overlap with other roles" },
];

export function generateMockChecklist(persona: PersonaRow): PersonaChecklist {
  const promptLength = persona.system_prompt?.length || 0;
  const hasCapabilities = persona.capabilities?.length > 0;

  const items: ChecklistItem[] = CHECKLIST_ITEMS.map((ci, i) => {
    // Make results somewhat dependent on actual persona data
    const pass = i < 3
      ? promptLength > 100
      : i < 6
        ? promptLength > 200 || hasCapabilities
        : Math.random() > 0.35;
    return { item: ci.item, pass, note: ci.note };
  });

  const passRate = Math.round(
    (items.filter((i) => i.pass).length / items.length) * 100
  );

  return {
    personaId: persona.id,
    personaName: persona.name,
    personaIcon: persona.icon || "\u{1F916}",
    items,
    passRate,
  };
}

/* --------------- API Types --------------- */

export type PersonaScorecard = {
  personaName: string;
  scores: {
    relevance: number;
    specificity: number;
    coverage: number;
    differentiation: number;
    actionability: number;
  };
  overall: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
};

export type AutoResearchRequest = {
  backend: ComputeBackend;
  model: ModelOption;
  projectContext: string;
  personas: { name: string; system_prompt?: string; capabilities?: string[] }[];
  sampleDecision?: string;
};

export type AutoResearchResult = {
  scorecards: PersonaScorecard[];
  teamScore: number;
  gaps: TeamGap[];
  consensusSimulation: {
    decision: string;
    positions: { name: string; position: string; reasoning: string }[];
    votes: { personaName: string; position: string; reasoning: string; confidence: "high" | "medium" | "low" }[];
    consensus: string;
    outcome: string;
    insights: string[];
  } | null;
  timestamp: string;
};

export type SkillTarget = {
  id: string;
  label: string;
  description: string;
  checklist: ChecklistItem[];
};

export type AutoresearchLoopRequest = {
  backend: ComputeBackend;
  model: ModelOption;
  skillTargetId: string;
  outputToScore: string;
  customChecklist?: ChecklistItem[];
};

export type AutoresearchLoopResult = {
  skillTargetId: string;
  score: number;
  results: { itemId: string; question: string; passed: boolean }[];
  failedItems: string[];
  suggestedChange: string;
};

/* --------------- Skill Targets --------------- */

export const SKILL_TARGETS: SkillTarget[] = [
  {
    id: "persona-quality",
    label: "Persona Quality",
    description: "Evaluate persona definition quality",
    checklist: [
      { id: "expertise", item: "Has clear domain expertise", pass: false, note: "" },
      { id: "beliefs", item: "Has 3+ core beliefs", pass: false, note: "" },
      { id: "triggers", item: "Has consultation triggers", pass: false, note: "" },
      { id: "pushback", item: "Has push-back patterns", pass: false, note: "" },
      { id: "output", item: "Defines output format", pass: false, note: "" },
    ] as (ChecklistItem & { id: string })[],
  },
];

/* --------------- Prompt Builders --------------- */

export function buildScorecardPrompt(
  projectContext: string,
  persona: { name: string; system_prompt?: string; capabilities?: string[] },
  allNames: string[]
): string {
  return `Evaluate this persona for a project.

Project context: ${projectContext}

Persona name: ${persona.name}
System prompt: ${persona.system_prompt || "Not provided"}
Capabilities: ${(persona.capabilities || []).join(", ") || "None listed"}

Other team members: ${allNames.filter((n) => n !== persona.name).join(", ")}

Score this persona on these dimensions (0-100):
- relevance: How relevant is this persona to the project?
- specificity: How specific and detailed is the persona definition?
- coverage: How well does it cover its domain?
- differentiation: How different is it from other team members?
- actionability: How actionable is its advice likely to be?

Respond in JSON: { "scores": { "relevance": N, "specificity": N, "coverage": N, "differentiation": N, "actionability": N }, "strengths": ["..."], "weaknesses": ["..."], "improvements": ["..."] }`;
}

export function parseScorecardResponse(content: string, personaName: string): PersonaScorecard {
  try {
    const json = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
    const scores = json.scores || { relevance: 50, specificity: 50, coverage: 50, differentiation: 50, actionability: 50 };
    const overall = Math.round(Object.values(scores).reduce((a: number, b) => a + (b as number), 0) / 5);
    return {
      personaName,
      scores,
      overall,
      strengths: json.strengths || [],
      weaknesses: json.weaknesses || [],
      improvements: json.improvements || [],
    };
  } catch {
    return {
      personaName,
      scores: { relevance: 50, specificity: 50, coverage: 50, differentiation: 50, actionability: 50 },
      overall: 50,
      strengths: [],
      weaknesses: ["Failed to parse LLM response"],
      improvements: [],
    };
  }
}

export function buildGapAnalysisPrompt(
  projectContext: string,
  personas: { name: string; system_prompt?: string }[]
): string {
  const personaList = personas.map((p) => `- ${p.name}: ${(p.system_prompt || "").slice(0, 100)}`).join("\n");
  return `Analyze gaps in this team for the project.

Project: ${projectContext}

Team:
${personaList}

What perspectives or expertise areas are missing? Respond in JSON: { "gaps": ["gap1", "gap2", ...] }`;
}

export function parseGapResponse(content: string): TeamGap[] {
  try {
    const json = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
    const gaps = json.gaps || [];
    return gaps.map((g: string | TeamGap) =>
      typeof g === "string" ? { area: g, severity: "moderate" as const, suggestion: g } : g
    );
  } catch {
    return [];
  }
}

export function buildConsensusSimPrompt(
  projectContext: string,
  personas: { name: string; system_prompt?: string }[],
  decision: string
): string {
  const personaList = personas.map((p) => `- ${p.name}`).join("\n");
  return `Simulate a team discussion about this decision.

Project: ${projectContext}
Decision: ${decision}

Team:
${personaList}

For each persona, provide their position and reasoning. Then provide the likely consensus.
Respond in JSON: { "positions": [{ "name": "...", "position": "...", "reasoning": "..." }], "consensus": "..." }`;
}

export function parseConsensusResponse(content: string) {
  try {
    const json = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
    const positions = json.positions || [];
    const votes = (json.votes || positions).map((v: Record<string, string>) => ({
      personaName: v.personaName || v.name || "",
      position: v.position || "",
      reasoning: v.reasoning || "",
      confidence: v.confidence || "medium",
    }));
    return { decision: json.decision || "", positions, votes, consensus: json.consensus || "", outcome: json.outcome || json.consensus || "", insights: json.insights || [] };
  } catch {
    return null;
  }
}

export function buildChecklistScoringPrompt(
  checklist: (ChecklistItem & { id?: string })[],
  output: string
): string {
  const checks = checklist.map((c, i) => `${i + 1}. ${c.item}`).join("\n");
  return `Score this output against each checklist item. Answer YES or NO for each.

Output to evaluate:
${output}

Checklist:
${checks}

Respond in JSON: { "results": [{ "index": 0, "passed": true/false }] }`;
}

export function parseChecklistResponse(
  content: string,
  checklist: (ChecklistItem & { id?: string })[]
): { itemId: string; question: string; passed: boolean }[] {
  try {
    const json = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
    return (json.results || []).map((r: { index: number; passed: boolean }, i: number) => ({
      itemId: checklist[r.index || i]?.id || `item-${i}`,
      question: checklist[r.index || i]?.item || `Check ${i + 1}`,
      passed: r.passed,
    }));
  } catch {
    return checklist.map((c, i) => ({
      itemId: c.id || `item-${i}`,
      question: c.item,
      passed: false,
    }));
  }
}

export function buildImprovementPrompt(
  failedChecklist: (ChecklistItem & { id?: string })[],
  output: string
): string {
  const failed = failedChecklist.map((c) => `- ${c.item}`).join("\n");
  return `This output failed these checks:
${failed}

Output:
${output}

Suggest ONE specific change to improve the output. Respond in JSON: { "change": "...", "targetCheck": "..." }`;
}

export function parseImprovementResponse(content: string): { change: string; targetCheck: string } {
  try {
    const json = JSON.parse(content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
    return { change: json.change || "", targetCheck: json.targetCheck || "" };
  } catch {
    return { change: "Could not parse improvement", targetCheck: "" };
  }
}

/* --------------- Markdown Report --------------- */

export function generateResultsMarkdown(results: ResearchResults): string {
  const lines: string[] = [];

  lines.push("# Auto-Research Results");
  lines.push("");
  lines.push(`*Generated on ${new Date().toISOString().split("T")[0]}*`);
  lines.push("");

  if (results.mode === "team_evaluation") {
    results.evaluations.forEach((ev) => {
      lines.push(`## ${ev.personaIcon} ${ev.personaName} — Score: ${ev.overallScore}/100`);
      lines.push("");
      lines.push("| Metric | Score | Reasoning |");
      lines.push("|--------|-------|-----------|");
      ev.metrics.forEach((m) => {
        lines.push(`| ${m.name} | ${m.score}/100 | ${m.reasoning} |`);
      });
      lines.push("");
      lines.push("**Strengths:**");
      ev.strengths.forEach((s) => lines.push(`- ${s}`));
      lines.push("");
      lines.push("**Improvements:**");
      ev.improvements.forEach((im) => lines.push(`- ${im}`));
      lines.push("");
      lines.push(`**Gap Analysis:** ${ev.gapAnalysis}`);
      lines.push("");
      lines.push("---");
      lines.push("");
    });
  } else {
    results.checklists.forEach((cl) => {
      lines.push(`## ${cl.personaIcon} ${cl.personaName} — Pass Rate: ${cl.passRate}%`);
      lines.push("");
      lines.push("| Check | Status | Note |");
      lines.push("|-------|--------|------|");
      cl.items.forEach((item) => {
        lines.push(`| ${item.item} | ${item.pass ? "PASS" : "FAIL"} | ${item.note} |`);
      });
      lines.push("");
      lines.push("---");
      lines.push("");
    });
  }

  if (results.summary) {
    lines.push("## Summary");
    lines.push("");
    lines.push(results.summary);
  }

  return lines.join("\n");
}
