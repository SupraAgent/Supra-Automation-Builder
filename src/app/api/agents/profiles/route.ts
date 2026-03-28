import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase";

/** GET: List all agent profiles (is_agent = true). */
export async function GET() {
  try {
    const admin = createSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ agents: [], source: "mock" });
    }

    const { data: agents, error } = await admin
      .from("profiles")
      .select("id, display_name, avatar_url, github_username, metadata, created_at, persona_id, personas(id, name, icon)")
      .eq("is_agent", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/agents/profiles] GET error:", error);
      return NextResponse.json({ agents: [], source: "mock" });
    }

    return NextResponse.json({ agents: agents ?? [], source: "supabase" });
  } catch (err) {
    console.error("[api/agents/profiles] GET error:", err);
    return NextResponse.json({ agents: [], source: "mock" });
  }
}

/** POST: Create a new agent profile. Body: { displayName, githubUsername?, metadata? } */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    // Only authenticated users can create agents
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Admin client not configured" }, { status: 503 });
    }

    const { displayName, githubUsername, metadata } = await request.json();
    if (!displayName) {
      return NextResponse.json({ error: "displayName is required" }, { status: 400 });
    }

    let parsedMetadata: Record<string, unknown> | null = null;
    if (metadata != null) {
      if (typeof metadata === "object" && !Array.isArray(metadata)) {
        parsedMetadata = metadata;
      } else if (typeof metadata === "string" && metadata.trim()) {
        try {
          parsedMetadata = JSON.parse(metadata) as Record<string, unknown>;
        } catch {
          return NextResponse.json({ error: "metadata must be valid JSON" }, { status: 400 });
        }
      }
    }

    // Create a service-role user in auth.users for the agent
    const email = `${(githubUsername || displayName).toLowerCase().replace(/[^a-z0-9]/g, "-")}@agent.supravibe.local`;
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { is_agent: true, display_name: displayName },
    });

    if (authError) {
      console.error("[api/agents/profiles] auth create error:", authError);
      return NextResponse.json({ error: "Failed to create agent auth user" }, { status: 500 });
    }

    // Upsert the profile with is_agent = true
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .upsert({
        id: authUser.user.id,
        display_name: displayName,
        github_username: githubUsername || null,
        is_agent: true,
        metadata: parsedMetadata,
      })
      .select()
      .single();

    if (profileError) {
      console.error("[api/agents/profiles] profile upsert error:", profileError);
      return NextResponse.json({ error: "Failed to create agent profile" }, { status: 500 });
    }

    return NextResponse.json({
      agent: {
        id: profile.id,
        displayName: profile.display_name,
        githubUsername: profile.github_username,
        metadata: profile.metadata,
        createdAt: profile.created_at,
      },
    });
  } catch (err) {
    console.error("[api/agents/profiles] POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
