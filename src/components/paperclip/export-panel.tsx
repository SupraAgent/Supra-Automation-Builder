"use client";

import * as React from "react";

type ExportConfig = {
  companyName: string;
  mission: string;
};

export function ExportPanel() {
  const [config, setConfig] = React.useState<ExportConfig>({
    companyName: "",
    mission: "",
  });
  const [exportData, setExportData] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const generate = async () => {
    setLoading(true);
    setExportData(null);
    try {
      const res = await fetch("/api/paperclip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: config.companyName || "My Company",
          mission: config.mission,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExportData(JSON.stringify(data, null, 2));
    } catch (err) {
      setExportData(
        `// Error: ${err instanceof Error ? err.message : "Export failed"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!exportData) return;
    await navigator.clipboard.writeText(exportData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Company Name
          </label>
          <input
            type="text"
            value={config.companyName}
            onChange={(e) =>
              setConfig((c) => ({ ...c, companyName: e.target.value }))
            }
            placeholder="My Company"
            className="w-full rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Mission Statement
          </label>
          <textarea
            value={config.mission}
            onChange={(e) =>
              setConfig((c) => ({ ...c, mission: e.target.value }))
            }
            placeholder="What does this agent company do?"
            rows={3}
            className="w-full rounded-md border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:outline-none transition resize-none"
          />
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="w-full rounded-md bg-primary/10 border border-primary/30 text-primary px-4 py-2 text-sm font-medium hover:bg-primary/20 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Paperclip Config"}
        </button>
      </div>

      {/* Output */}
      {exportData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Paperclip Org Chart JSON
            </h3>
            <button
              onClick={copyToClipboard}
              className="text-xs text-primary hover:text-primary/80 transition cursor-pointer"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-xs text-foreground overflow-x-auto max-h-96 overflow-y-auto">
            {exportData}
          </pre>
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-2">
            <h4 className="text-xs font-medium text-foreground">
              Next Steps
            </h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>
                Install Paperclip:{" "}
                <code className="bg-white/5 px-1 rounded">
                  npx @paperclipai/cli start
                </code>
              </li>
              <li>Open the Paperclip dashboard at localhost:3001</li>
              <li>Create a new company and import this config</li>
              <li>Assign agent adapters (Claude Code, Codex, etc.)</li>
              <li>Set heartbeat schedules and let agents run</li>
            </ol>
          </div>
        </div>
      )}

      {/* Info */}
      {!exportData && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-3">
          <h4 className="text-xs font-medium text-foreground">
            What gets exported?
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>
              <span className="text-foreground font-medium">Agents</span> —
              Each persona becomes a Paperclip agent with role and system prompt
            </li>
            <li>
              <span className="text-foreground font-medium">Org Chart</span> —
              Reporting lines from <code className="bg-white/5 px-1 rounded">reports_to</code> frontmatter
            </li>
            <li>
              <span className="text-foreground font-medium">Heartbeats</span> —
              Default 60-minute check-in intervals (configurable per agent)
            </li>
            <li>
              <span className="text-foreground font-medium">Budgets</span> —
              Default $50/month per agent (configurable)
            </li>
            <li>
              <span className="text-foreground font-medium">Triggers</span> —
              Decision types that activate each agent
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
