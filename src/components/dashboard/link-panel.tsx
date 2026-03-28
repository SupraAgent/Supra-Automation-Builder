"use client";

import { cn } from "@/lib/utils";

type LinkPanelProps = {
  outgoing: string[];
  backlinks: { path: string; filename: string }[];
  onNavigate: (path: string) => void;
};

export function LinkPanel({ outgoing, backlinks, onNavigate }: LinkPanelProps) {
  return (
    <div className="space-y-5">
      {/* Outgoing links */}
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Outgoing Links ({outgoing.length})
        </h4>
        {outgoing.length === 0 ? (
          <p className="text-xs text-muted-foreground/60">No [[wikilinks]] in this document</p>
        ) : (
          <div className="space-y-1">
            {outgoing.map((link) => (
              <button
                key={link}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md transition-colors",
                  "text-primary/80 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/10"
                )}
                title={`Navigate to [[${link}]]`}
              >
                <span className="text-xs opacity-60">{"\u2192"}</span>
                <span className="truncate text-xs">[[{link}]]</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Backlinks */}
      <div>
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Backlinks ({backlinks.length})
        </h4>
        {backlinks.length === 0 ? (
          <p className="text-xs text-muted-foreground/60">No other documents link here</p>
        ) : (
          <div className="space-y-1">
            {backlinks.map((bl) => (
              <button
                key={bl.path}
                onClick={() => onNavigate(bl.path)}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md transition-colors",
                  "text-muted-foreground hover:text-foreground hover:bg-white/[0.03] border border-transparent hover:border-white/10"
                )}
              >
                <span className="text-xs opacity-60">{"\u2190"}</span>
                <span className="truncate text-xs">{bl.filename}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
