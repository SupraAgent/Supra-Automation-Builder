export type PersonaOutputFormat = "markdown_checklist" | "json_scores" | "prose" | "structured_report";

export type PersonaDraft = {
  // Step 1: Role & Identity
  name: string;
  title: string;
  company: string;
  yearsExperience: number | null;
  backgroundSummary: string;
  icon: string;

  // Step 2: Expertise
  primaryDomain: string;
  secondarySkills: string[];
  signatureMethodology: string;
  toolsAndFrameworks: string[];

  // Step 3: Strategic Mindset
  coreBeliefs: string[];
  optimizeFor: string;
  pushBackOn: string[];
  decisionMakingStyle: string;

  // Step 4: Project Perspective & Output
  approach: string;
  keyQuestions: string[];
  redFlags: string[];
  successMetrics: string[];
  outputFormat: PersonaOutputFormat;
};

export const EMPTY_DRAFT: PersonaDraft = {
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
};

export const OUTPUT_FORMATS: { value: PersonaOutputFormat; label: string; description: string }[] = [
  { value: "structured_report", label: "Structured Report", description: "Organized sections with verdicts" },
  { value: "markdown_checklist", label: "Markdown Checklist", description: "Categorized checklist items" },
  { value: "json_scores", label: "JSON Scores", description: "Numerical scores with metrics" },
  { value: "prose", label: "Prose", description: "Natural language assessment" },
];

export function generateSystemPrompt(draft: PersonaDraft): string {
  const parts: string[] = [];

  if (draft.name && draft.title && draft.company) {
    parts.push(`You are ${draft.name}, ${draft.title} at ${draft.company}.`);
  } else if (draft.name && draft.title) {
    parts.push(`You are ${draft.name}, ${draft.title}.`);
  } else if (draft.name) {
    parts.push(`You are ${draft.name}.`);
  }

  if (draft.yearsExperience) {
    parts.push(`${draft.yearsExperience} years of experience.`);
  }

  if (draft.backgroundSummary) {
    parts.push(draft.backgroundSummary);
  }

  if (draft.primaryDomain) {
    parts.push(`\nPrimary expertise: ${draft.primaryDomain}`);
  }

  if (draft.secondarySkills.length > 0) {
    parts.push(`Secondary skills: ${draft.secondarySkills.join(", ")}`);
  }

  if (draft.signatureMethodology) {
    parts.push(`Methodology: ${draft.signatureMethodology}`);
  }

  if (draft.toolsAndFrameworks.length > 0) {
    parts.push(`Tools & frameworks: ${draft.toolsAndFrameworks.join(", ")}`);
  }

  if (draft.coreBeliefs.length > 0) {
    parts.push("\nCore beliefs:");
    draft.coreBeliefs.forEach((b) => parts.push(`- ${b}`));
  }

  if (draft.optimizeFor) {
    parts.push(`\nYou optimize for: ${draft.optimizeFor}`);
  }

  if (draft.pushBackOn.length > 0) {
    parts.push("\nYou push back on:");
    draft.pushBackOn.forEach((p) => parts.push(`- ${p}`));
  }

  if (draft.decisionMakingStyle) {
    parts.push(`\nDecision-making: ${draft.decisionMakingStyle}`);
  }

  if (draft.approach) {
    parts.push(`\nApproach: ${draft.approach}`);
  }

  if (draft.keyQuestions.length > 0) {
    parts.push("\nKey questions to ask:");
    draft.keyQuestions.forEach((q) => parts.push(`- ${q}`));
  }

  if (draft.redFlags.length > 0) {
    parts.push("\nRed flags to watch for:");
    draft.redFlags.forEach((r) => parts.push(`- ${r}`));
  }

  if (draft.successMetrics.length > 0) {
    parts.push("\nSuccess metrics:");
    draft.successMetrics.forEach((m) => parts.push(`- ${m}`));
  }

  return parts.join("\n");
}

export function inferCapabilities(prompt: string, role: string, domain: string): string[] {
  const text = `${prompt} ${role} ${domain}`.toLowerCase();
  const caps: string[] = ["scoring"];

  if (/code|engineer|architect|review|quality|pattern/.test(text)) caps.push("code_review");
  if (/deploy|release|ship|ci\/cd|rollback/.test(text)) caps.push("deploy_trigger");
  if (/ux|ui|design|accessibility|a11y|interaction/.test(text)) caps.push("ux_audit");
  if (/security|auth|vulnerability|secret|injection/.test(text)) caps.push("security_scan");
  if (/performance|bundle|render|latency|speed/.test(text)) caps.push("performance_test");
  if (/test|qa|coverage|regression|edge case/.test(text)) caps.push("qa_automation");
  if (/release|ship|deploy|merge|rollback/.test(text) && !caps.includes("release_management")) caps.push("release_management");

  return [...new Set(caps)];
}

export function inferReviewFocus(prompt: string, role: string, domain: string): string[] {
  const text = `${prompt} ${role} ${domain}`.toLowerCase();
  const focus: string[] = ["general"];

  if (/ux|ui|design|accessibility|interaction|visual/.test(text)) focus.push("ux");
  if (/devops|deploy|infrastructure|ci|cd|build/.test(text)) focus.push("devops");
  if (/security|auth|vulnerability|secret/.test(text)) focus.push("security");
  if (/performance|speed|bundle|render|latency/.test(text)) focus.push("performance");

  return [...new Set(focus)];
}

export function inferIcon(role: string, title: string): string {
  const text = `${role} ${title}`.toLowerCase();
  if (/ceo|chief|founder|president/.test(text)) return "👔";
  if (/design|ux|ui/.test(text)) return "🎨";
  if (/engineer|architect|staff/.test(text)) return "🔧";
  if (/qa|test|quality/.test(text)) return "🧪";
  if (/release|deploy|devops/.test(text)) return "🚀";
  if (/security/.test(text)) return "🔒";
  if (/product|pm/.test(text)) return "📋";
  if (/growth|marketing/.test(text)) return "📈";
  if (/retention|engagement/.test(text)) return "🔄";
  if (/data|analytics/.test(text)) return "📊";
  return "🤖";
}

export function draftToSupabasePayload(draft: PersonaDraft) {
  const systemPrompt = generateSystemPrompt(draft);
  const role = draft.title && draft.company ? `${draft.title} at ${draft.company}` : draft.title || "";

  return {
    name: draft.name,
    role,
    system_prompt: systemPrompt.slice(0, 2000),
    capabilities: inferCapabilities(systemPrompt, role, draft.primaryDomain),
    output_format: draft.outputFormat,
    review_focus: inferReviewFocus(systemPrompt, role, draft.primaryDomain),
    scoring_weights: null,
    icon: draft.icon || inferIcon(role, draft.title),
  };
}

export function draftToExportJson(draft: PersonaDraft) {
  return {
    format: "persona-builder" as const,
    persona: {
      name: draft.name,
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
      approach: draft.approach,
      keyQuestions: draft.keyQuestions,
      redFlags: draft.redFlags,
      successMetrics: draft.successMetrics,
      outputFormat: draft.outputFormat,
      icon: draft.icon || inferIcon(draft.title && draft.company ? `${draft.title} at ${draft.company}` : "", draft.title),
      consultationPrompt: generateSystemPrompt(draft),
    },
  };
}

export function draftToMarkdown(draft: PersonaDraft): string {
  const lines: string[] = [];

  lines.push(`# Persona: ${draft.name}`);
  if (draft.title && draft.company) {
    lines.push(`> **${draft.title}** at **${draft.company}**`);
  }
  lines.push("");

  if (draft.yearsExperience) {
    lines.push(`**Years of Experience:** ${draft.yearsExperience}`);
  }

  if (draft.backgroundSummary) {
    lines.push(`\n**Background Summary:**\n${draft.backgroundSummary}`);
  }

  lines.push("\n---\n");
  lines.push("## Expertise & Skills\n");

  if (draft.primaryDomain) {
    lines.push(`### Primary Domain\n${draft.primaryDomain}\n`);
  }

  if (draft.secondarySkills.length > 0) {
    lines.push(`### Secondary Skills\n${draft.secondarySkills.map((s) => `- ${s}`).join("\n")}\n`);
  }

  if (draft.signatureMethodology) {
    lines.push(`### Signature Methodology\n${draft.signatureMethodology}\n`);
  }

  if (draft.toolsAndFrameworks.length > 0) {
    lines.push(`### Tools & Frameworks\n${draft.toolsAndFrameworks.map((t) => `- ${t}`).join("\n")}\n`);
  }

  lines.push("---\n");
  lines.push("## Strategic Mindset\n");

  if (draft.coreBeliefs.length > 0) {
    lines.push(`### Core Beliefs\n${draft.coreBeliefs.map((b) => `- ${b}`).join("\n")}\n`);
  }

  if (draft.optimizeFor) {
    lines.push(`### What They Optimize For\n**${draft.optimizeFor}**\n`);
  }

  if (draft.pushBackOn.length > 0) {
    lines.push(`### What They Push Back On\n${draft.pushBackOn.map((p) => `- ${p}`).join("\n")}\n`);
  }

  if (draft.decisionMakingStyle) {
    lines.push(`### Decision-Making Style\n${draft.decisionMakingStyle}\n`);
  }

  lines.push("---\n");
  lines.push("## Project Perspective\n");

  if (draft.approach) {
    lines.push(`### How They'd Approach This Build\n${draft.approach}\n`);
  }

  if (draft.keyQuestions.length > 0) {
    lines.push(`### Key Questions They'd Ask\n${draft.keyQuestions.map((q) => `- ${q}`).join("\n")}\n`);
  }

  if (draft.redFlags.length > 0) {
    lines.push(`### Red Flags They'd Watch For\n${draft.redFlags.map((r) => `- ${r}`).join("\n")}\n`);
  }

  if (draft.successMetrics.length > 0) {
    lines.push(`### Success Metrics\n${draft.successMetrics.map((m) => `- ${m}`).join("\n")}\n`);
  }

  lines.push("---\n");
  lines.push("## Consultation Prompt\n");
  lines.push("```");
  lines.push(generateSystemPrompt(draft));
  lines.push("```");

  return lines.join("\n");
}
