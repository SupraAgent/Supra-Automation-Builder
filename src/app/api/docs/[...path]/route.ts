import { NextRequest, NextResponse } from "next/server";
import { readDoc, writeDoc, deleteDoc } from "@/lib/docs-api";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { path: segments } = await params;
    const relativePath = segments.join("/");
    const doc = await readDoc(relativePath);
    return NextResponse.json({ doc });
  } catch (err) {
    console.error("[api/docs/path] GET error:", err);
    const status = err instanceof Error && err.message.includes("ENOENT") ? 404 : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { path: segments } = await params;
    const relativePath = segments.join("/");
    const body = await request.json();
    const { frontmatter, content } = body;

    if (frontmatter === undefined && content === undefined) {
      return NextResponse.json({ error: "frontmatter or content required" }, { status: 400 });
    }

    // Read existing to merge
    let existing;
    try {
      existing = await readDoc(relativePath);
    } catch {
      existing = null;
    }

    const finalFrontmatter = frontmatter ?? existing?.frontmatter ?? {};
    const finalContent = content ?? existing?.content ?? "";

    await writeDoc(relativePath, finalFrontmatter, finalContent);

    const updated = await readDoc(relativePath);
    return NextResponse.json({ doc: updated });
  } catch (err) {
    console.error("[api/docs/path] PUT error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { path: segments } = await params;
    const relativePath = segments.join("/");
    await deleteDoc(relativePath);
    return NextResponse.json({ deleted: relativePath });
  } catch (err) {
    console.error("[api/docs/path] DELETE error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
