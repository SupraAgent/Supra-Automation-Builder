import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase";

/** GET: Get which providers are configured for an agent account. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ status: {} });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { agentId } = await params;
    if (!agentId) return NextResponse.json({ error: "agentId required" }, { status: 400 });

    const admin = createSupabaseAdmin();
    if (!admin) return NextResponse.json({ status: {} });

    const { data: profile } = await admin
      .from("profiles")
      .select("id, is_agent")
      .eq("id", agentId)
      .single();

    if (!profile?.is_agent) {
      return NextResponse.json({ error: "Invalid agent" }, { status: 400 });
    }

    const { data: tokens } = await admin
      .from("user_tokens")
      .select("provider, is_valid, updated_at")
      .eq("user_id", agentId);

    const status: Record<string, { connected: boolean; valid: boolean; updatedAt: string | null }> = {
      vercel: { connected: false, valid: false, updatedAt: null },
      github: { connected: false, valid: false, updatedAt: null },
      anthropic: { connected: false, valid: false, updatedAt: null },
    };

    for (const t of tokens ?? []) {
      status[t.provider] = {
        connected: true,
        valid: t.is_valid,
        updatedAt: t.updated_at,
      };
    }

    return NextResponse.json({ status });
  } catch (err) {
    console.error("[api/agents/tokens/status] error:", err);
    return NextResponse.json({ status: {} });
  }
}
