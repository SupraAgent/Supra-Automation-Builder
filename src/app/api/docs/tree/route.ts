import { NextResponse } from "next/server";
import { getTree } from "@/lib/docs-api";

export async function GET() {
  try {
    const tree = await getTree();
    return NextResponse.json({ tree });
  } catch (err) {
    console.error("[api/docs/tree] GET error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
