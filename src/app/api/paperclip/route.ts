import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { listDocs, type DocMeta } from "@/lib/docs-api";

export type PaperclipAgent = {
  id: string;
  name: string;
  role: string;
  company: string;
  description: string;
  systemPrompt: string;
  heartbeatMinutes: number;
  monthlyBudgetUsd: number;
  reportsTo: string | null;
  triggers: string[];
  source: "supabase" | "docs";
};

export type PaperclipOrgChart = {
  companyName: string;
  mission: string;
  agents: PaperclipAgent[];
  exportedAt: string;
};

/** Convert a Supabase persona row into a Paperclip agent */
function supabasePersonaToAgent(row: Record<string, unknown>): PaperclipAgent {
  const name = String(row.name || "Unnamed");
  const role = String(row.role || "Advisor");
  const systemPrompt = String(row.system_prompt || "");
  const capabilities = Array.isArray(row.capabilities) ? row.capabilities : [];

  return {
    id: String(row.id),
    name,
    role,
    company: "",
    description: `${role}${capabilities.length ? ` — ${capabilities.join(", ")}` : ""}`,
    systemPrompt,
    heartbeatMinutes: 60,
    monthlyBudgetUsd: 50,
    reportsTo: null,
    triggers: Array.isArray(row.review_focus) ? row.review_focus.map(String) : [],
    source: "supabase",
  };
}

/** Convert a markdown persona doc into a Paperclip agent */
function docToAgent(doc: DocMeta): PaperclipAgent | null {
  const fm = doc.frontmatter;
  if (!fm.name && !fm.role) return null;

  const name = String(fm.name || doc.filename.replace(".md", ""));
  const role = String(fm.role || "Advisor");
  const company = String(fm.company || fm.organization || "");

  const systemPrompt = [
    `You are ${name}, ${role}${company ? ` at ${company}` : ""}.`,
    fm.experience ? `You have ${fm.experience}.` : "",
    doc.content.slice(0, 2000),
  ]
    .filter(Boolean)
    .join("\n\n");

  const triggers: string[] = Array.isArray(fm.triggers)
    ? fm.triggers.map(String)
    : typeof fm.triggers === "string"
      ? [fm.triggers]
      : [];

  return {
    id: doc.filename.replace(".md", "").toLowerCase().replace(/\s+/g, "-"),
    name,
    role,
    company,
    description: String(fm.description || `${role} persona`),
    systemPrompt,
    heartbeatMinutes: Number(fm.heartbeat_minutes) || 60,
    monthlyBudgetUsd: Number(fm.monthly_budget_usd) || 50,
    reportsTo: fm.reports_to ? String(fm.reports_to) : null,
    triggers,
    source: "docs",
  };
}

/** GET — List personas from both Supabase and docs/personas/ */
export async function GET() {
  try {
    const agents: PaperclipAgent[] = [];

    // 1. Try Supabase personas
    try {
      const supabase = await createClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const admin = createSupabaseAdmin();
          if (admin) {
            const { data: rows } = await admin
              .from("personas")
              .select("*")
              .eq("created_by", user.id)
              .order("created_at", { ascending: false });

            if (rows) {
              for (const row of rows) {
                agents.push(supabasePersonaToAgent(row));
              }
            }
          }
        }
      }
    } catch {
      // Supabase not available, continue with docs
    }

    // 2. Try docs/personas/ markdown files
    try {
      const docs = await listDocs("docs/personas");
      for (const doc of docs) {
        const agent = docToAgent(doc);
        if (agent) agents.push(agent);
      }
    } catch {
      // No docs/personas directory, that's fine
    }

    return NextResponse.json({ agents, count: agents.length });
  } catch (err) {
    console.error("[api/paperclip] GET error:", err);
    return NextResponse.json({ error: "Failed to load personas" }, { status: 500 });
  }
}

/** POST — Either create a new agent-persona or export org chart */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If action is "create", create a new persona in Supabase
    if (body.action === "create") {
      return handleCreate(body);
    }

    // Otherwise, generate org chart export
    return handleExport(body);
  } catch (err) {
    console.error("[api/paperclip] POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handleCreate(body: Record<string, unknown>) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 503 });
  }

  const name = String(body.name || "").trim();
  const role = String(body.role || "").trim();
  if (!name || !role) {
    return NextResponse.json({ error: "name and role are required" }, { status: 400 });
  }

  const triggers = Array.isArray(body.triggers) ? body.triggers.map(String) : [];
  const heartbeat = Number(body.heartbeatMinutes) || 60;
  const budget = Number(body.monthlyBudgetUsd) || 50;

  // Build a system prompt for the agent
  const systemPrompt = [
    `You are ${name}, a ${role}.`,
    body.description ? String(body.description) : "",
    `You check in every ${heartbeat} minutes and operate within a $${budget}/month budget.`,
    triggers.length ? `You activate on: ${triggers.join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const { data: row, error } = await admin
    .from("personas")
    .insert({
      name,
      role,
      system_prompt: systemPrompt,
      capabilities: triggers,
      output_format: "structured_report",
      review_focus: triggers,
      icon: body.icon || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("[api/paperclip] create error:", error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }

  return NextResponse.json({ agent: supabasePersonaToAgent(row), created: true });
}

async function handleExport(body: Record<string, unknown>) {
  const {
    companyName = "My Company",
    mission = "",
    selectedAgentIds,
    heartbeatOverrides,
    budgetOverrides,
  } = body as {
    companyName?: string;
    mission?: string;
    selectedAgentIds?: string[];
    heartbeatOverrides?: Record<string, number>;
    budgetOverrides?: Record<string, number>;
  };

  // Get all agents via the same logic as GET
  const res = await GET();
  const data = await res.json();
  let agents: PaperclipAgent[] = data.agents || [];

  if (selectedAgentIds && selectedAgentIds.length > 0) {
    agents = agents.filter((a) => selectedAgentIds.includes(a.id));
  }

  agents = agents.map((agent) => ({
    ...agent,
    heartbeatMinutes: heartbeatOverrides?.[agent.id] ?? agent.heartbeatMinutes,
    monthlyBudgetUsd: budgetOverrides?.[agent.id] ?? agent.monthlyBudgetUsd,
  }));

  const orgChart: PaperclipOrgChart = {
    companyName: String(companyName),
    mission: String(mission),
    agents,
    exportedAt: new Date().toISOString(),
  };

  return NextResponse.json(orgChart);
}
