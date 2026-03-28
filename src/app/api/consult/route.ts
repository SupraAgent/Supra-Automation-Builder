import { NextRequest, NextResponse } from "next/server";
import { callLLM, getAvailableBackends, type LLMBackend } from "@/lib/llm-client";
import { requireAuth } from "@/lib/auth-guard";
import {
  buildScorecardPrompt,
  buildGapAnalysisPrompt,
  buildConsensusSimPrompt,
  parseScorecardResponse,
  parseGapResponse,
  parseConsensusResponse,
  buildChecklistScoringPrompt,
  buildImprovementPrompt,
  parseChecklistResponse,
  parseImprovementResponse,
  SKILL_TARGETS,
  type AutoResearchRequest,
  type AutoResearchResult,
  type PersonaScorecard,
  type AutoresearchLoopRequest,
  type AutoresearchLoopResult,
  type ChecklistItem,
} from "@/lib/auto-research";

function mapBackend(backend: string): LLMBackend {
  if (backend === "claude_api" || backend === "anthropic") return "anthropic";
  return "ollama";
}

export async function GET() {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const backends = getAvailableBackends();
  return NextResponse.json({ backends, skillTargets: SKILL_TARGETS });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();

    // Route to checklist mode if skillTargetId is present
    if (body.skillTargetId) {
      return handleChecklistScoring(body as AutoresearchLoopRequest);
    }

    // Otherwise, run the full team evaluation
    return handleTeamEvaluation(body as AutoResearchRequest);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function handleChecklistScoring(
  body: AutoresearchLoopRequest
): Promise<NextResponse> {
  const { backend, model, skillTargetId, outputToScore, customChecklist } = body;

  // Find the checklist
  const target = SKILL_TARGETS.find((t) => t.id === skillTargetId);
  const checklist: ChecklistItem[] = customChecklist || target?.checklist || [];

  if (checklist.length === 0) {
    return NextResponse.json(
      { error: `No checklist found for skill target: ${skillTargetId}` },
      { status: 400 }
    );
  }

  if (!outputToScore) {
    return NextResponse.json(
      { error: "outputToScore is required" },
      { status: 400 }
    );
  }

  // 1. Score against checklist
  const scoringPrompt = buildChecklistScoringPrompt(checklist, outputToScore);
  const scoringRes = await callLLM({
    backend: mapBackend(backend),
    model,
    systemPrompt:
      "You are a strict quality evaluator. Answer YES or NO for each check. Respond only in valid JSON.",
    messages: [{ role: "user", content: scoringPrompt }],
    maxTokens: 512,
    temperature: 0.1,
  });

  const results = parseChecklistResponse(scoringRes.content, checklist);
  const passed = results.filter((r) => r.passed).length;
  const score = Math.round((passed / results.length) * 100);
  const failedItems = results
    .filter((r) => !r.passed)
    .map((r) => r.question);

  // 2. If there are failures, suggest one improvement
  let suggestedChange = "";
  if (failedItems.length > 0) {
    const failedChecklist = checklist.filter((c) =>
      results.some((r) => r.itemId === c.id && !r.passed)
    );
    const improvementPrompt = buildImprovementPrompt(
      failedChecklist,
      outputToScore
    );
    try {
      const improvementRes = await callLLM({
        backend: mapBackend(backend),
        model,
        systemPrompt:
          "You are a skill improvement agent. Suggest ONE specific change. Respond only in valid JSON.",
        messages: [{ role: "user", content: improvementPrompt }],
        maxTokens: 512,
        temperature: 0.5,
      });
      const parsed = parseImprovementResponse(improvementRes.content);
      suggestedChange = `${parsed.change} (targets: ${parsed.targetCheck})`;
    } catch {
      suggestedChange = "Could not generate suggestion";
    }
  }

  const result: AutoresearchLoopResult = {
    skillTargetId,
    score,
    results,
    failedItems,
    suggestedChange,
  };

  return NextResponse.json(result);
}

async function handleTeamEvaluation(
  body: AutoResearchRequest
): Promise<NextResponse> {
  const { backend, model, projectContext, personas, sampleDecision } = body;

  if (!projectContext || !personas || personas.length === 0) {
    return NextResponse.json(
      { error: "projectContext and personas are required" },
      { status: 400 }
    );
  }

  const allNames = personas.map((p) => p.name);

  // 1. Score each persona (parallelized)
  const scorecardPromises = personas.map(async (persona) => {
    const prompt = buildScorecardPrompt(projectContext, persona, allNames);
    try {
      const res = await callLLM({
        backend: mapBackend(backend),
        model,
        systemPrompt:
          "You are a persona quality evaluator. Respond only in valid JSON.",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 1024,
        temperature: 0.3,
      });
      return parseScorecardResponse(res.content, persona.name);
    } catch (err) {
      return {
        personaName: persona.name,
        scores: {
          relevance: 0,
          specificity: 0,
          coverage: 0,
          differentiation: 0,
          actionability: 0,
        },
        overall: 0,
        strengths: [],
        weaknesses: [
          `Error: ${err instanceof Error ? err.message : "LLM call failed"}`,
        ],
        improvements: [],
      } as PersonaScorecard;
    }
  });

  // 2. Gap analysis
  const gapPromise = (async () => {
    const prompt = buildGapAnalysisPrompt(projectContext, personas);
    try {
      const res = await callLLM({
        backend: mapBackend(backend),
        model,
        systemPrompt:
          "You are a team composition analyst. Respond only in valid JSON.",
        messages: [{ role: "user", content: prompt }],
        maxTokens: 1024,
        temperature: 0.3,
      });
      return parseGapResponse(res.content);
    } catch {
      return [];
    }
  })();

  // 3. Consensus simulation (optional)
  const consensusPromise = sampleDecision
    ? (async () => {
        const prompt = buildConsensusSimPrompt(
          projectContext,
          personas,
          sampleDecision
        );
        try {
          const res = await callLLM({
            backend: mapBackend(backend),
            model,
            systemPrompt:
              "You are simulating a team discussion. Respond only in valid JSON.",
            messages: [{ role: "user", content: prompt }],
            maxTokens: 2048,
            temperature: 0.7,
          });
          return parseConsensusResponse(res.content);
        } catch {
          return null;
        }
      })()
    : Promise.resolve(null);

  // Run all in parallel
  const [scorecards, gaps, consensusSimulation] = await Promise.all([
    Promise.all(scorecardPromises),
    gapPromise,
    consensusPromise,
  ]);

  const teamScore =
    scorecards.length > 0
      ? Math.round(
          scorecards.reduce((sum, s) => sum + s.overall, 0) / scorecards.length
        )
      : 0;

  const result: AutoResearchResult = {
    scorecards,
    teamScore,
    gaps,
    consensusSimulation,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(result);
}
