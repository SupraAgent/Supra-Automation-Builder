import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const PROJECT_ROOT = process.cwd();

// Allowed directories for file operations (prevent path traversal)
const ALLOWED_DIRS = ["docs", "templates", "examples", "skills"];

export type DocMeta = {
  path: string; // relative to project root
  filename: string;
  frontmatter: Record<string, unknown>;
  content: string;
  links: string[]; // extracted [[wikilinks]]
  lastModified: string;
};

export type TreeNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
};

/** Ensure a path is within allowed directories */
function validatePath(relativePath: string): string {
  const normalized = path.normalize(relativePath).replace(/\\/g, "/");
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) {
    throw new Error("Invalid path");
  }
  const topDir = normalized.split("/")[0];
  if (!ALLOWED_DIRS.includes(topDir)) {
    throw new Error(`Access denied: ${topDir} is not an allowed directory`);
  }
  return normalized;
}

/** Extract [[wikilinks]] from markdown content */
export function extractWikilinks(content: string): string[] {
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  return [...new Set(links)];
}

/** Read and parse a single markdown file */
export async function readDoc(relativePath: string): Promise<DocMeta> {
  const safe = validatePath(relativePath);
  const fullPath = path.join(PROJECT_ROOT, safe);
  const raw = await fs.readFile(fullPath, "utf-8");
  const { data, content } = matter(raw);
  const stat = await fs.stat(fullPath);

  return {
    path: safe,
    filename: path.basename(safe),
    frontmatter: data,
    content,
    links: extractWikilinks(content),
    lastModified: stat.mtime.toISOString(),
  };
}

/** List all markdown files in a directory (recursive) */
export async function listDocs(dir: string = ""): Promise<DocMeta[]> {
  const docs: DocMeta[] = [];

  async function walk(currentDir: string) {
    const fullDir = path.join(PROJECT_ROOT, currentDir);
    let entries;
    try {
      entries = await fs.readdir(fullDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const rel = path.join(currentDir, entry.name).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".")) continue;
        await walk(rel);
      } else if (entry.name.endsWith(".md")) {
        try {
          docs.push(await readDoc(rel));
        } catch {
          // skip unreadable files
        }
      }
    }
  }

  if (dir) {
    const safe = validatePath(dir);
    await walk(safe);
  } else {
    for (const d of ALLOWED_DIRS) {
      await walk(d);
    }
  }

  return docs;
}

/** Build folder tree structure */
export async function getTree(): Promise<TreeNode[]> {
  async function buildTree(currentDir: string): Promise<TreeNode[]> {
    const fullDir = path.join(PROJECT_ROOT, currentDir);
    let entries;
    try {
      entries = await fs.readdir(fullDir, { withFileTypes: true });
    } catch {
      return [];
    }

    const nodes: TreeNode[] = [];
    // Sort: directories first, then files
    const sorted = entries
      .filter((e) => !e.name.startsWith("."))
      .sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

    for (const entry of sorted) {
      const rel = path.join(currentDir, entry.name).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: rel,
          type: "directory",
          children: await buildTree(rel),
        });
      } else if (entry.name.endsWith(".md")) {
        nodes.push({
          name: entry.name,
          path: rel,
          type: "file",
        });
      }
    }
    return nodes;
  }

  const roots: TreeNode[] = [];
  for (const d of ALLOWED_DIRS) {
    try {
      await fs.access(path.join(PROJECT_ROOT, d));
      roots.push({
        name: d,
        path: d,
        type: "directory",
        children: await buildTree(d),
      });
    } catch {
      // directory doesn't exist, skip
    }
  }
  return roots;
}

/** Write a doc with frontmatter + content */
export async function writeDoc(
  relativePath: string,
  frontmatter: Record<string, unknown>,
  content: string
): Promise<void> {
  const safe = validatePath(relativePath);
  const fullPath = path.join(PROJECT_ROOT, safe);

  // Ensure parent directory exists
  await fs.mkdir(path.dirname(fullPath), { recursive: true });

  const output = matter.stringify(content, frontmatter);
  await fs.writeFile(fullPath, output, "utf-8");
}

/** Delete a doc */
export async function deleteDoc(relativePath: string): Promise<void> {
  const safe = validatePath(relativePath);
  const fullPath = path.join(PROJECT_ROOT, safe);
  await fs.unlink(fullPath);
}

/** Find all docs that link to a given target (by filename without .md) */
export async function findBacklinks(
  targetName: string,
  allDocs?: DocMeta[]
): Promise<{ path: string; filename: string }[]> {
  const docs = allDocs ?? (await listDocs());
  return docs
    .filter((doc) => doc.links.some((link) => link.toLowerCase() === targetName.toLowerCase()))
    .map((doc) => ({ path: doc.path, filename: doc.filename }));
}
