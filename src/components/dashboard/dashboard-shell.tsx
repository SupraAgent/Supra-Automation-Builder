"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileTree } from "./file-tree";
import { DocEditor } from "./doc-editor";
import { LinkPanel } from "./link-panel";
import { TemplatePicker } from "./template-picker";

type TreeNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
};

type DocData = {
  path: string;
  filename: string;
  frontmatter: Record<string, unknown>;
  content: string;
  links: string[];
  lastModified: string;
};

export function DashboardShell() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [allDocs, setAllDocs] = useState<DocData[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [currentDoc, setCurrentDoc] = useState<DocData | null>(null);
  const [backlinks, setBacklinks] = useState<{ path: string; filename: string }[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Load tree and all docs
  const loadData = useCallback(async () => {
    try {
      const [treeRes, docsRes] = await Promise.all([
        fetch("/api/docs/tree"),
        fetch("/api/docs"),
      ]);
      const treeData = await treeRes.json();
      const docsData = await docsRes.json();
      setTree(treeData.tree || []);
      setAllDocs(docsData.docs || []);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load selected doc
  const selectDoc = useCallback(async (path: string) => {
    setSelectedPath(path);
    try {
      const res = await fetch(`/api/docs/${path}`);
      const data = await res.json();
      if (data.doc) {
        setCurrentDoc(data.doc);
        // Compute backlinks
        const docName = path.replace(/\.md$/, "").split("/").pop() || "";
        const blinks = allDocs
          .filter((d) => d.path !== path && d.links.some((l) => l.toLowerCase() === docName.toLowerCase()))
          .map((d) => ({ path: d.path, filename: d.filename }));
        setBacklinks(blinks);
      }
    } catch (err) {
      console.error("Failed to load doc:", err);
    }
  }, [allDocs]);

  // Save doc
  const handleSave = async (frontmatter: Record<string, unknown>, content: string) => {
    if (!selectedPath) return;
    await fetch(`/api/docs/${selectedPath}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frontmatter, content }),
    });
    await loadData();
    await selectDoc(selectedPath);
  };

  // Delete doc
  const handleDelete = async () => {
    if (!selectedPath) return;
    if (!confirm(`Delete ${selectedPath}?`)) return;
    await fetch(`/api/docs/${selectedPath}`, { method: "DELETE" });
    setSelectedPath(null);
    setCurrentDoc(null);
    setBacklinks([]);
    await loadData();
  };

  // Create from template
  const handleCreate = async (templatePath: string, targetPath: string) => {
    const body: Record<string, string> = { targetPath };
    if (templatePath) body.template = templatePath;
    else {
      body.content = "";
    }

    const res = await fetch("/api/docs/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    await loadData();
    if (data.doc) {
      selectDoc(data.doc.path);
    }
  };

  // Filter tree by search
  const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
    if (!query) return nodes;
    const q = query.toLowerCase();
    return nodes
      .map((node) => {
        if (node.type === "file") {
          return node.name.toLowerCase().includes(q) ? node : null;
        }
        const filtered = filterTree(node.children || [], q);
        if (filtered.length > 0) {
          return { ...node, children: filtered };
        }
        return node.name.toLowerCase().includes(q) ? node : null;
      })
      .filter(Boolean) as TreeNode[];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-2">
          <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left sidebar — File Tree */}
      <div className="w-64 shrink-0 border-r border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Documents
            </h3>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowPicker(true)}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </Button>
          </div>
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <FileTree
            tree={filterTree(tree, search)}
            selectedPath={selectedPath}
            onSelect={selectDoc}
          />
        </div>
        <div className="p-3 border-t border-white/10">
          <div className="text-[10px] text-muted-foreground/60">
            {allDocs.length} documents / {allDocs.reduce((sum, d) => sum + d.links.length, 0)} links
          </div>
        </div>
      </div>

      {/* Center — Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <DocEditor doc={currentDoc} onSave={handleSave} onDelete={handleDelete} />
      </div>

      {/* Right sidebar — Link Panel */}
      <div className="w-56 shrink-0 border-l border-white/10 p-3 overflow-y-auto">
        <LinkPanel
          outgoing={currentDoc?.links || []}
          backlinks={backlinks}
          onNavigate={selectDoc}
        />
      </div>

      {/* Template Picker Modal */}
      <TemplatePicker open={showPicker} onClose={() => setShowPicker(false)} onCreate={handleCreate} />
    </div>
  );
}
