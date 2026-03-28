import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { encryptToken } from "@/lib/crypto";

const PROVIDERS = ["vercel", "github", "anthropic"] as const;

/** POST: Save or update a token for an agent account. Body: { provider, token } */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { agentId } = await params;
    if (!agentId) return NextResponse.json({ error: "agentId required" }, { status: 400 });

    const admin = createSupabaseAdmin();
    if (!admin) return NextResponse.json({ error: "Admin not configured" }, { status: 503 });

    const { data: profile } = await admin
      .from("profiles")
      .select("id, is_agent")
      .eq("id", agentId)
      .single();

    if (!profile?.is_agent) {
      return NextResponse.json({ error: "Invalid agent or not an agent account" }, { status: 400 });
    }

    const { provider, token } = await request.json();
    if (!provider || !token) {
      return NextResponse.json({ error: "provider and token are required" }, { status: 400 });
    }
    if (!PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const encrypted = encryptToken(token);

    const { error } = await admin
      .from("user_tokens")
      .upsert(
        {
          user_id: agentId,
          provider,
          encrypted_token: encrypted,
          is_valid: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,provider" }
      );

    if (error) {
      console.error("[api/agents/tokens] upsert error:", error);
      return NextResponse.json({ error: "Failed to save token" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/agents/tokens] POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
