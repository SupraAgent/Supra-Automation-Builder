import { NextRequest, NextResponse } from "next/server";
import { readDoc, writeDoc } from "@/lib/docs-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, targetPath, frontmatter, content } = body;

    if (!targetPath) {
      return NextResponse.json({ error: "targetPath is required" }, { status: 400 });
    }

    let docContent = content || "";
    let docFrontmatter = frontmatter || {};

    // If a template is specified, load it and merge
    if (template) {
      try {
        const tmpl = await readDoc(template);
        docContent = docContent || tmpl.content;
        docFrontmatter = { ...tmpl.frontmatter, ...docFrontmatter };
      } catch {
        return NextResponse.json({ error: `Template not found: ${template}` }, { status: 404 });
      }
    }

    await writeDoc(targetPath, docFrontmatter, docContent);

    const created = await readDoc(targetPath);
    return NextResponse.json({ doc: created }, { status: 201 });
  } catch (err) {
    console.error("[api/docs/create] POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
