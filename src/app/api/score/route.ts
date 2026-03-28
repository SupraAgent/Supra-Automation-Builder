import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_CLAUDE_MODEL } from "@/lib/llm-client";
import { requireAuth } from "@/lib/auth-guard";

function safeParseLLMJson(text: string): unknown {
  // Try direct parse first
  try { return JSON.parse(text); } catch { /* continue */ }
  // Try extracting JSON from markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch { /* continue */ }
  }
  // Try finding first { to last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch { /* continue */ }
  }
  throw new Error("Failed to parse AI response as JSON");
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const {
    apiKey,
    appBrief,
    referenceApp,
    categories,
    mode,
  }: {
    apiKey: string;
    appBrief: { name: string; description: string; tech_stack: string };
    referenceApp: { name: string; why: string };
    categories: { name: string; weight: number; subCriteria: string[] }[];
    mode: "generate_cpo" | "score_app" | "improvement_brief";
  } = body;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key required" },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    if (mode === "generate_cpo") {
      const prompt = `You are analyzing the product "${referenceApp.name}" (${referenceApp.why}).

Generate a Chief Product Officer persona that represents this brand's product philosophy. Base it on publicly known information about how this company builds products.

Return ONLY valid JSON (no markdown, no code fences):
{
  "name": "A realistic full name",
  "company": "${referenceApp.name}",
  "title": "Chief Product Officer",
  "philosophy": "One sentence capturing their core product philosophy",
  "strengths": ["3 specific product strengths with brief explanations"],
  "blindSpots": ["2 areas where this product is weakest"],
  "decisionStyle": "How this CPO makes product decisions",
  "iconicMove": "One specific product decision this company is known for"
}`;

      const message = await client.messages.create({
        model: DEFAULT_CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const text =
        message.content[0].type === "text" ? message.content[0].text : "";
      const cpo = safeParseLLMJson(text);

      return NextResponse.json({ cpo });
    }

    if (mode === "score_app") {
      const categoryList = categories
        .map(
          (c) =>
            `${c.name} (weight: ${c.weight}): sub-criteria: ${c.subCriteria.join(", ")}`
        )
        .join("\n");

      const prompt = `You are a strict, honest product reviewer acting as the CPO of "${referenceApp.name}".

You are reviewing "${appBrief.name}" — ${appBrief.description}. Tech stack: ${appBrief.tech_stack}.

Score this app on each sub-criterion from 0-100. Be harsh and realistic — most early-stage apps score 20-50. Only give 80+ if genuinely excellent.

Categories and sub-criteria:
${categoryList}

For each category, also write a one-line "why the leader wins" explanation comparing to ${referenceApp.name}.

Return ONLY valid JSON (no markdown, no code fences):
{
  "scores": [
    {
      "category": "Category Name",
      "subCriteria": [
        { "name": "Sub-criterion name", "score": 45 }
      ],
      "avg": 42,
      "whyLeaderWins": "Brief explanation of why ${referenceApp.name} scores higher here"
    }
  ],
  "overallImpression": "2-3 sentence honest assessment",
  "biggestGap": "The single most critical thing to fix"
}`;

      const message = await client.messages.create({
        model: DEFAULT_CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });

      const text =
        message.content[0].type === "text" ? message.content[0].text : "";
      const result = safeParseLLMJson(text);

      return NextResponse.json({ result });
    }

    if (mode === "improvement_brief") {
      const prompt = `You are the product improvement engine for "${appBrief.name}" (${appBrief.description}).

The app's biggest gap is in the "${body.category}" category (current score: ${body.currentScore}, target: ${body.targetScore}).

The reference app "${referenceApp.name}" scores ${body.refScore} in this category because: ${body.whyLeaderWins}

Generate a specific, actionable improvement brief that can be implemented in one round.

Return ONLY valid JSON (no markdown, no code fences):
{
  "decision": "One-line description of the change",
  "rationale": "Why this is the highest-impact change right now",
  "implementationSteps": ["Step 1", "Step 2", "Step 3"],
  "acceptanceCriteria": ["Criterion 1", "Criterion 2"],
  "estimatedScoreImpact": 15,
  "filesLikelyChanged": ["path/to/file.ts"]
}`;

      const message = await client.messages.create({
        model: DEFAULT_CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const text =
        message.content[0].type === "text" ? message.content[0].text : "";
      const brief = safeParseLLMJson(text);

      return NextResponse.json({ brief });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI scoring failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
