import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase";

const PROVIDERS = ["vercel", "github", "anthropic"] as const;

/** DELETE: Remove a token for an agent account. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ agentId: string; provider: string }> }
) {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { agentId, provider } = await params;
    if (!agentId || !provider) {
      return NextResponse.json({ error: "agentId and provider required" }, { status: 400 });
    }
    if (!PROVIDERS.includes(provider as (typeof PROVIDERS)[number])) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const admin = createSupabaseAdmin();
    if (!admin) return NextResponse.json({ error: "Admin not configured" }, { status: 503 });

    const { data: profile } = await admin
      .from("profiles")
      .select("id, is_agent")
      .eq("id", agentId)
      .single();

    if (!profile?.is_agent) {
      return NextResponse.json({ error: "Invalid agent" }, { status: 400 });
    }

    const { error } = await admin
      .from("user_tokens")
      .delete()
      .eq("user_id", agentId)
      .eq("provider", provider);

    if (error) {
      console.error("[api/agents/tokens/delete] error:", error);
      return NextResponse.json({ error: "Failed to delete token" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/agents/tokens/delete] error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
