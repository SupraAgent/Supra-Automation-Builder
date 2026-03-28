import type { PersonaDraft } from "./persona-builder";
import { generateSystemPrompt, inferCapabilities, inferReviewFocus, inferIcon } from "./persona-builder";
import type { AgentVisibility, CommunicationStyle } from "./agent-personas";

export type UnifiedDraft = PersonaDraft & {
  visibility: AgentVisibility;
  communicationStyle: CommunicationStyle | null;
  skills: string[];
  llmProvider: string;
  llmModel: string;
  northStar: string;
  displayName: string;
};

export const EMPTY_UNIFIED_DRAFT: UnifiedDraft = {
  // PersonaDraft fields
  name: "",
  title: "",
  company: "",
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
  approach: "",
  keyQuestions: [],
  redFlags: [],
  successMetrics: [],
  outputFormat: "structured_report",
  // Agent extension fields
  visibility: "company",
  communicationStyle: null,
  skills: [],
  llmProvider: "anthropic",
  llmModel: "claude-sonnet-4-6",
  northStar: "",
  displayName: "",
};

export function generateUnifiedPrompt(draft: UnifiedDraft): string {
  const parts: string[] = [];

  // Expert identity section
  const expertPrompt = generateSystemPrompt(draft);
  if (expertPrompt) {
    parts.push(expertPrompt);
  }

  // Agent capability section
  if (draft.communicationStyle) {
    parts.push(
      `\nCommunication style: ${draft.communicationStyle.label} -- ${draft.communicationStyle.description}`
    );
  }

  if (draft.skills.length > 0) {
    parts.push("\nAgent capabilities:");
    draft.skills.forEach((s) => parts.push(`- ${s}`));
  }

  if (draft.llmProvider && draft.llmModel) {
    parts.push(`\nPowered by: ${draft.llmProvider}/${draft.llmModel}`);
  }

  if (draft.northStar) {
    parts.push(`\nNorth Star: ${draft.northStar}`);
  }

  return parts.join("\n");
}

export function generateNorthStar(draft: UnifiedDraft): string {
  const role = draft.title && draft.company
    ? `${draft.title} at ${draft.company}`
    : draft.title || "Agent";
  const style = draft.communicationStyle?.label ?? "balanced";
  const focus = draft.optimizeFor || "delivering value";
  const beliefs = draft.coreBeliefs.slice(0, 2).join(" and ") || "quality and impact";

  return `As a ${role} with a ${style.toLowerCase()} approach, drive ${focus} by grounding every decision in ${beliefs}. Continuously evaluate impact, adapt to new information, and maintain the highest standards of execution.`;
}

export function unifiedToSupabase(draft: UnifiedDraft) {
  const systemPrompt = generateUnifiedPrompt(draft);
  const role =
    draft.title && draft.company
      ? `${draft.title} at ${draft.company}`
      : draft.title || "";

  return {
    name: draft.displayName || draft.name,
    role,
    system_prompt: systemPrompt.slice(0, 2000),
    capabilities:
      draft.skills.length > 0
        ? draft.skills
        : inferCapabilities(systemPrompt, role, draft.primaryDomain),
    output_format: draft.outputFormat,
    review_focus: inferReviewFocus(systemPrompt, role, draft.primaryDomain),
    scoring_weights: null,
    icon: draft.icon || inferIcon(role, draft.title),
  };
}

export function unifiedToExportJson(draft: UnifiedDraft) {
  return {
    format: "unified-persona" as const,
    persona: {
      name: draft.name,
      displayName: draft.displayName,
      title: draft.title,
      company: draft.company,
      yearsExperience: draft.yearsExperience,
      backgroundSummary: draft.backgroundSummary,
      primaryDomain: draft.primaryDomain,
      secondarySkills: draft.secondarySkills,
      signatureMethodology: draft.signatureMethodology,
      toolsAndFrameworks: draft.toolsAndFrameworks,
      coreBeliefs: draft.coreBeliefs,
      optimizeFor: draft.optimizeFor,
      pushBackOn: draft.pushBackOn,
      decisionMakingStyle: draft.decisionMakingStyle,
      communicationStyle: draft.communicationStyle,
      skills: draft.skills,
      llmProvider: draft.llmProvider,
      llmModel: draft.llmModel,
      approach: draft.approach,
      keyQuestions: draft.keyQuestions,
      redFlags: draft.redFlags,
      successMetrics: draft.successMetrics,
      outputFormat: draft.outputFormat,
      northStar: draft.northStar,
      icon: draft.icon || inferIcon(draft.title, draft.title),
      systemPrompt: generateUnifiedPrompt(draft),
    },
  };
}

export function unifiedToMarkdown(draft: UnifiedDraft): string {
  const lines: string[] = [];

  lines.push(`# Unified Persona: ${draft.displayName || draft.name}`);
  if (draft.title && draft.company) {
    lines.push(`> **${draft.title}** at **${draft.company}**`);
  }
  lines.push("");

  if (draft.yearsExperience) {
    lines.push(`**Years of Experience:** ${draft.yearsExperience}`);
  }
  if (draft.backgroundSummary) {
    lines.push(`\n**Background:**\n${draft.backgroundSummary}`);
  }

  lines.push("\n---\n");
  lines.push("## Expertise\n");
  if (draft.primaryDomain) lines.push(`**Primary Domain:** ${draft.primaryDomain}\n`);
  if (draft.secondarySkills.length > 0) lines.push(`**Skills:** ${draft.secondarySkills.join(", ")}\n`);
  if (draft.signatureMethodology) lines.push(`**Methodology:** ${draft.signatureMethodology}\n`);
  if (draft.toolsAndFrameworks.length > 0) lines.push(`**Tools:** ${draft.toolsAndFrameworks.join(", ")}\n`);

  lines.push("---\n");
  lines.push("## Mindset\n");
  if (draft.coreBeliefs.length > 0) {
    lines.push("### Core Beliefs");
    draft.coreBeliefs.forEach((b) => lines.push(`- ${b}`));
    lines.push("");
  }
  if (draft.optimizeFor) lines.push(`**Optimizes for:** ${draft.optimizeFor}\n`);
  if (draft.pushBackOn.length > 0) {
    lines.push("### Push Back On");
    draft.pushBackOn.forEach((p) => lines.push(`- ${p}`));
    lines.push("");
  }
  if (draft.decisionMakingStyle) lines.push(`**Decision Style:** ${draft.decisionMakingStyle}\n`);
  if (draft.communicationStyle) lines.push(`**Communication:** ${draft.communicationStyle.label} -- ${draft.communicationStyle.description}\n`);

  lines.push("---\n");
  lines.push("## Agent Capabilities\n");
  if (draft.skills.length > 0) {
    lines.push("### Skills");
    draft.skills.forEach((s) => lines.push(`- ${s}`));
    lines.push("");
  }
  if (draft.llmProvider && draft.llmModel) {
    lines.push(`**LLM:** ${draft.llmProvider} / ${draft.llmModel}\n`);
  }

  lines.push("---\n");
  lines.push("## Project Perspective\n");
  if (draft.approach) lines.push(`**Approach:** ${draft.approach}\n`);
  if (draft.keyQuestions.length > 0) {
    lines.push("### Key Questions");
    draft.keyQuestions.forEach((q) => lines.push(`- ${q}`));
    lines.push("");
  }
  if (draft.redFlags.length > 0) {
    lines.push("### Red Flags");
    draft.redFlags.forEach((r) => lines.push(`- ${r}`));
    lines.push("");
  }
  if (draft.successMetrics.length > 0) {
    lines.push("### Success Metrics");
    draft.successMetrics.forEach((m) => lines.push(`- ${m}`));
    lines.push("");
  }

  if (draft.northStar) {
    lines.push("---\n");
    lines.push(`## North Star\n\n${draft.northStar}\n`);
  }

  lines.push("---\n");
  lines.push("## System Prompt\n\n```");
  lines.push(generateUnifiedPrompt(draft));
  lines.push("```");

  return lines.join("\n");
}
