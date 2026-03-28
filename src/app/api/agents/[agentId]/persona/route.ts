import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase";

type Params = { params: Promise<{ agentId: string }> };

/** Verify the agent exists and the user is a team member (not an agent account). */
async function verifyAccess(agentId: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase not configured", status: 503 } as const;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 } as const;

  const admin = createSupabaseAdmin();
  if (!admin) return { error: "Admin not configured", status: 503 } as const;

  // Verify the caller is a human (not an agent account)
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("is_agent")
    .eq("id", user.id)
    .single();

  if (callerProfile?.is_agent) {
    return { error: "Agent accounts cannot modify other agents", status: 403 } as const;
  }

  // Verify the target agent exists
  const { data: agentProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", agentId)
    .eq("is_agent", true)
    .single();

  if (!agentProfile) {
    return { error: "Agent not found", status: 404 } as const;
  }

  return { user, admin } as const;
}

/** PUT: Assign a persona to an agent profile. */
export async function PUT(request: NextRequest, { params }: Params) {
  const { agentId } = await params;
  try {
    const access = await verifyAccess(agentId);
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const { personaId } = await request.json();
    if (!personaId) return NextResponse.json({ error: "personaId required" }, { status: 400 });

    const { error } = await access.admin
      .from("profiles")
      .update({ persona_id: personaId })
      .eq("id", agentId)
      .eq("is_agent", true);

    if (error) {
      console.error("[api/agents/persona] PUT error:", error);
      return NextResponse.json({ error: "Failed to assign persona" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/agents/persona] PUT error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** DELETE: Unassign persona from an agent profile. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { agentId } = await params;
  try {
    const access = await verifyAccess(agentId);
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const { error } = await access.admin
      .from("profiles")
      .update({ persona_id: null })
      .eq("id", agentId)
      .eq("is_agent", true);

    if (error) {
      console.error("[api/agents/persona] DELETE error:", error);
      return NextResponse.json({ error: "Failed to remove persona" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/agents/persona] DELETE error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
