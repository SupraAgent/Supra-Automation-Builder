"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type TreeNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
};

type FileTreeProps = {
  tree: TreeNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
};

function TreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = selectedPath === node.path;

  if (node.type === "directory") {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center gap-1.5 w-full px-2 py-1.5 text-sm rounded-md transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <svg
            className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-90")}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-xs">
            {expanded ? "\uD83D\uDCC2" : "\uD83D\uDCC1"}
          </span>
          <span className="truncate font-medium">{node.name}</span>
        </button>
        {expanded && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={cn(
        "flex items-center gap-1.5 w-full px-2 py-1.5 text-sm rounded-md transition-colors",
        isSelected
          ? "bg-primary/10 text-foreground border border-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border border-transparent"
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <span className="text-xs">{"\uD83D\uDCC4"}</span>
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function FileTree({ tree, selectedPath, onSelect }: FileTreeProps) {
  return (
    <div className="space-y-0.5">
      {tree.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
