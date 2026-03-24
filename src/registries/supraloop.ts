/**
 * SupraLoop node definitions.
 * Auto-synced from SupraAgent/SupraLoop — manual edits between
 * SYNC-START / SYNC-END markers will be overwritten.
 */
import type {
  NodePaletteItem,
  NodeRegistry,
  NodeTypeRegistration,
} from "../core/types";

// ── SYNC-START: triggers ────────────────────────────────────────

export const SUPRALOOP_TRIGGERS: NodePaletteItem[] = [
  { type: "trigger", subType: "manual", label: "Manual Trigger", description: "Run manually", icon: "Play", defaultConfig: {} },
  { type: "trigger", subType: "schedule", label: "Schedule", description: "Run on a schedule", icon: "Clock", defaultConfig: { cron: "" } },
  { type: "trigger", subType: "webhook", label: "Webhook", description: "Triggered by HTTP POST", icon: "Webhook", defaultConfig: {} },
  { type: "trigger", subType: "event", label: "Event", description: "Triggered by a system event", icon: "Zap", defaultConfig: { event_type: "" } },
];

// ── SYNC-END: triggers ──────────────────────────────────────────

// ── SYNC-START: actions ─────────────────────────────────────────

export const SUPRALOOP_ACTIONS: NodePaletteItem[] = [
  { type: "action", subType: "llm_call", label: "LLM Call", description: "Call an AI model", icon: "Brain", defaultConfig: { provider: "claude", model: "", systemPrompt: "", temperature: 0.7 } },
  { type: "action", subType: "transform", label: "Transform", description: "Transform data between steps", icon: "Shuffle", defaultConfig: { transformType: "map", expression: "" } },
  { type: "action", subType: "output", label: "Output", description: "Send results to a destination", icon: "ExternalLink", defaultConfig: { outputType: "log", destination: "" } },
  { type: "action", subType: "github_commit", label: "GitHub Commit", description: "Commit changes to GitHub", icon: "GitCommit", defaultConfig: { repo: "", branch: "main", message: "" } },
  { type: "action", subType: "api_call", label: "API Call", description: "Make an HTTP request", icon: "Globe", defaultConfig: { url: "", method: "GET", headers: "{}", body: "" } },
  { type: "action", subType: "score", label: "Score", description: "Run a scoring evaluation", icon: "BarChart", defaultConfig: { criteria: "" } },
  { type: "action", subType: "analyze", label: "Analyze", description: "Analyze data or content", icon: "Search", defaultConfig: { target: "" } },
  { type: "action", subType: "generate", label: "Generate", description: "Generate content or code", icon: "Sparkles", defaultConfig: { prompt: "" } },
];

// ── SYNC-END: actions ───────────────────────────────────────────

// ── SYNC-START: triggerConfigs ───────────────────────────────────

export const SUPRALOOP_TRIGGER_CONFIGS: Record<string, NodeTypeRegistration> = {
  manual: {
    subType: "manual",
    configFields: [],
    infoText: 'Click "Run" to trigger this flow manually.',
  },
  schedule: {
    subType: "schedule",
    configFields: [
      { key: "cron", label: "Cron expression", type: "text", placeholder: "0 9 * * *" },
    ],
  },
  webhook: {
    subType: "webhook",
    configFields: [],
    infoText: "Webhook URL will be generated after saving.",
  },
  event: {
    subType: "event",
    configFields: [
      { key: "event_type", label: "Event type", type: "text", placeholder: "e.g. deployment.completed" },
    ],
  },
};

// ── SYNC-END: triggerConfigs ────────────────────────────────────

// ── SYNC-START: actionConfigs ───────────────────────────────────

export const SUPRALOOP_ACTION_CONFIGS: Record<string, NodeTypeRegistration> = {
  llm_call: {
    subType: "llm_call",
    configFields: [
      { key: "provider", label: "Provider", type: "select", options: [{ value: "claude", label: "Claude" }, { value: "claude-code", label: "Claude Code" }, { value: "ollama", label: "Ollama" }, { value: "custom", label: "Custom" }] },
      { key: "model", label: "Model", type: "text", placeholder: "e.g. claude-sonnet-4-6" },
      { key: "systemPrompt", label: "System prompt", type: "textarea", placeholder: "Instructions for the model..." },
      { key: "temperature", label: "Temperature", type: "number", defaultValue: 0.7 },
    ],
  },
  transform: {
    subType: "transform",
    configFields: [
      { key: "transformType", label: "Transform type", type: "select", options: [{ value: "map", label: "Map" }, { value: "filter", label: "Filter" }, { value: "merge", label: "Merge" }, { value: "extract", label: "Extract" }, { value: "custom", label: "Custom" }] },
      { key: "expression", label: "Expression", type: "textarea", placeholder: "Transform expression..." },
    ],
  },
  output: {
    subType: "output",
    configFields: [
      { key: "outputType", label: "Output type", type: "select", options: [{ value: "log", label: "Console Log" }, { value: "api", label: "API" }, { value: "file", label: "File" }, { value: "notify", label: "Notification" }, { value: "github", label: "GitHub" }] },
      { key: "destination", label: "Destination", type: "text", placeholder: "Where to send output..." },
    ],
  },
  github_commit: {
    subType: "github_commit",
    configFields: [
      { key: "repo", label: "Repository", type: "text", placeholder: "owner/repo" },
      { key: "branch", label: "Branch", type: "text", placeholder: "main" },
      { key: "message", label: "Commit message", type: "text", placeholder: "Commit message..." },
    ],
  },
  api_call: {
    subType: "api_call",
    configFields: [
      { key: "url", label: "URL", type: "text", placeholder: "https://api.example.com/..." },
      { key: "method", label: "Method", type: "select", options: [{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }, { value: "DELETE", label: "DELETE" }] },
      { key: "headers", label: "Headers (JSON)", type: "textarea", placeholder: '{"Authorization": "Bearer ..."}' },
      { key: "body", label: "Body", type: "textarea", placeholder: "Request body..." },
    ],
  },
  score: {
    subType: "score",
    configFields: [
      { key: "criteria", label: "Scoring criteria", type: "textarea", placeholder: "What to evaluate..." },
    ],
  },
  analyze: {
    subType: "analyze",
    configFields: [
      { key: "target", label: "Analysis target", type: "text", placeholder: "What to analyze..." },
    ],
  },
  generate: {
    subType: "generate",
    configFields: [
      { key: "prompt", label: "Generation prompt", type: "textarea", placeholder: "What to generate..." },
    ],
  },
};

// ── SYNC-END: actionConfigs ─────────────────────────────────────

// ── SYNC-START: conditionFields ─────────────────────────────────

export const SUPRALOOP_CONDITION_FIELDS = [
  { value: "status", label: "Status" },
  { value: "score", label: "Score" },
  { value: "provider", label: "Provider" },
  { value: "output_type", label: "Output Type" },
];

// ── SYNC-END: conditionFields ───────────────────────────────────

/** Full SupraLoop registry — ready to pass to BuilderProvider. */
export const SUPRALOOP_REGISTRY: NodeRegistry = {
  triggers: SUPRALOOP_TRIGGERS,
  actions: SUPRALOOP_ACTIONS,
  triggerConfigs: SUPRALOOP_TRIGGER_CONFIGS,
  actionConfigs: SUPRALOOP_ACTION_CONFIGS,
  conditionFields: SUPRALOOP_CONDITION_FIELDS,
};
