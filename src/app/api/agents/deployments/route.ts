import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { decryptToken } from "@/lib/crypto";
import { fetchVercelDeployments } from "@/lib/vercel";
import type { Deployment } from "@/lib/deployments";

type AgentProfile = {
  id: string;
  githubUsername: string;
  displayName: string;
  avatarUrl: string;
  isAgent: true;
};

const EMPTY_RESPONSE = {
  deployments: [] as Deployment[],
  agents: [] as AgentProfile[],
  source: "none" as const,
};

export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(EMPTY_RESPONSE);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(EMPTY_RESPONSE);
    }

    // Get agent profiles
    const admin = createSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(EMPTY_RESPONSE);
    }

    const { data: agentProfiles } = await admin
      .from("profiles")
      .select("id, github_username, display_name, avatar_url")
      .eq("is_agent", true);

    if (!agentProfiles || agentProfiles.length === 0) {
      return NextResponse.json(EMPTY_RESPONSE);
    }

    const agents = agentProfiles.map((p) => ({
      id: p.id,
      githubUsername: p.github_username,
      displayName: p.display_name,
      avatarUrl: p.avatar_url,
      isAgent: true as const,
    }));

    const agentIds = agentProfiles.map((p) => p.id);

    // Fetch agent Vercel tokens using admin client (bypasses RLS)
    const { data: tokens } = await admin
      .from("user_tokens")
      .select("user_id, encrypted_token")
      .eq("provider", "vercel")
      .eq("is_valid", true)
      .in("user_id", agentIds);

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({
        deployments: [],
        agents,
        source: "none",
      });
    }

    const allDeployments: Deployment[] = [];
    for (const row of tokens) {
      try {
        const token = decryptToken(row.encrypted_token);
        const deps = await fetchVercelDeployments(token, { limit: 30 });
        allDeployments.push(...deps);
      } catch (err) {
        console.error(`[api/agents/deployments] Error for agent ${row.user_id}:`, err);
      }
    }

    if (allDeployments.length === 0) {
      return NextResponse.json({
        deployments: [],
        agents,
        source: "none",
      });
    }

    allDeployments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      deployments: allDeployments,
      agents,
      source: "vercel",
    });
  } catch (err) {
    console.error("[api/agents/deployments]", err);
    return NextResponse.json({ error: "Failed to fetch agent deployments" }, { status: 500 });
  }
}
