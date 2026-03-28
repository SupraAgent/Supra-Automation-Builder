import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Octokit } from "octokit";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  // Use getUser() for auth verification (getSession() reads unverified cookies)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Session needed for provider_token (GitHub OAuth token)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.provider_token) {
    return NextResponse.json(
      { error: "No GitHub token. Re-authenticate with GitHub." },
      { status: 401 }
    );
  }

  try {
    const octokit = new Octokit({ auth: session.provider_token });

    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 30,
      type: "owner",
    });

    const simplified = repos.map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      private: r.private,
      default_branch: r.default_branch,
      updated_at: r.updated_at,
      language: r.language,
      html_url: r.html_url,
    }));

    return NextResponse.json({ repos: simplified });
  } catch (err) {
    const message = err instanceof Error ? err.message : "GitHub API error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
