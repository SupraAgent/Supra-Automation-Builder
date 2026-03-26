# @supra/automation-builder — Integration Guide

> Canonical source: [github.com/SupraAgent/Supra-Automation-Builder](https://github.com/SupraAgent/Supra-Automation-Builder)
>
> This package is the single source of truth for the visual drag-and-drop workflow builder shared across all Supra apps. All builder updates are made here and consumed by each app.

---

## Quick Start

### 1. Install

```bash
npm install github:SupraAgent/Supra-Automation-Builder
```

The `prepare` script runs `tsup` automatically, so `dist/` is built on install. No manual build step needed.

### 2. Peer Dependencies

Your app must have these installed:

| Package | Version |
|---------|---------|
| `@xyflow/react` | `^12.0.0` |
| `lucide-react` | `>=0.300.0` |
| `react` | `>=18.0.0` |
| `react-dom` | `>=18.0.0` |

### 3. TypeScript Path Alias

Add to `tsconfig.json` paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@supra/automation-builder": ["./node_modules/@supra/automation-builder/dist/index"]
    }
  }
}
```

### 4. Tailwind CSS

**Tailwind v3** — add to `content` array in `tailwind.config.ts`:

```ts
content: [
  // ... your app's content paths
  "./node_modules/@supra/automation-builder/dist/**/*.js",
],
```

**Tailwind v4** — add to `globals.css`:

```css
@source "../../node_modules/@supra/automation-builder/dist";
```

### 5. Import Styles

In your root layout or global CSS:

```ts
import "@supra/automation-builder/styles.css";
```

---

## Core Concepts

The package provides three layers:

| Layer | What it does | Key exports |
|-------|-------------|-------------|
| **UI Components** | Visual canvas, node config, templates | `FlowCanvas`, `NodeConfigPanel`, `TemplateManager`, `GroupContainerNode` |
| **Engine** | Workflow execution, condition evaluation | `executeWorkflow`, `resumeWorkflow`, `evaluateCondition` |
| **Registries** | App-specific trigger/action definitions | `NodeRegistry`, `NodePaletteItem`, `ConfigFieldDef` |

Each consuming app provides its own:
- **Node registry** — which triggers, actions, and logic nodes are available
- **Persistence adapter** — where workflow runs are stored (Supabase, localStorage, etc.)
- **Action executor** — what happens when each action node fires

---

## Rendering the Builder

### Minimal Example

```tsx
"use client";

import {
  FlowCanvas,
  BuilderProvider,
  type NodeRegistry,
} from "@supra/automation-builder";

const registry: NodeRegistry = {
  triggers: [
    {
      type: "trigger",
      subType: "manual",
      label: "Manual Trigger",
      description: "Run on demand",
      icon: "Play",
      defaultConfig: {},
    },
  ],
  actions: [
    {
      type: "action",
      subType: "send_email",
      label: "Send Email",
      description: "Send an email notification",
      icon: "Mail",
      defaultConfig: { to: "", subject: "", body: "" },
    },
  ],
};

export default function BuilderPage() {
  return (
    <BuilderProvider registry={registry}>
      <FlowCanvas
        initialNodes={[]}
        initialEdges={[]}
        onSave={(nodes, edges) => {
          console.log("Saved:", { nodes, edges });
        }}
        registry={registry}
        enableUndoRedo
        showUndoRedoButtons
      />
    </BuilderProvider>
  );
}
```

> **Important:** `FlowCanvas` must be wrapped in a `BuilderProvider`. The sidebar and config panel use `useBuilderContext()` internally, which requires this provider as an ancestor.

### FlowCanvas Props

```typescript
interface FlowCanvasProps {
  initialNodes: Node[];           // Starting nodes
  initialEdges: Edge[];           // Starting edges
  onSave: (nodes: Node[], edges: Edge[]) => void;  // Save callback
  saving?: boolean;               // Show saving indicator
  autoSaveDelay?: number;         // Auto-save debounce (ms)
  customNodeTypes?: NodeTypes;    // Domain-specific node components
  hideSidebar?: boolean;          // Hide the node palette sidebar
  hideConfigPanel?: boolean;      // Hide the config panel
  registry?: NodeRegistry;        // Your app's trigger/action definitions
  smartDefaultRules?: SmartDefaultRule[];  // Auto-fill rules
  enableUndoRedo?: boolean;       // Enable undo/redo (Ctrl+Z / Ctrl+Shift+Z)
  showUndoRedoButtons?: boolean;  // Show undo/redo toolbar buttons
  enableContextMenu?: boolean;    // Right-click context menu
}
```

---

## Building a Node Registry

A registry tells the builder what nodes are available in the sidebar palette and how to configure them.

```typescript
import type {
  NodeRegistry,
  NodePaletteItem,
  NodeTypeRegistration,
  ConfigFieldDef,
} from "@supra/automation-builder";

// 1. Define palette items (what appears in the sidebar)
const triggers: NodePaletteItem[] = [
  {
    type: "trigger",
    subType: "new_order",
    label: "New Order",
    description: "When a new order is placed",
    icon: "ShoppingCart",       // lucide-react icon name
    defaultConfig: {},
  },
];

const actions: NodePaletteItem[] = [
  {
    type: "action",
    subType: "send_notification",
    label: "Send Notification",
    description: "Send a push notification",
    icon: "Bell",
    defaultConfig: { title: "", body: "" },
  },
];

// 2. Define config fields (what appears in the config panel when a node is selected)
const triggerConfigs: Record<string, NodeTypeRegistration> = {
  new_order: {
    subType: "new_order",
    configFields: [
      { key: "min_value", label: "Minimum order value", type: "number", placeholder: "0" },
      { key: "category", label: "Category", type: "select", options: [
        { value: "electronics", label: "Electronics" },
        { value: "clothing", label: "Clothing" },
      ]},
    ],
  },
};

const actionConfigs: Record<string, NodeTypeRegistration> = {
  send_notification: {
    subType: "send_notification",
    configFields: [
      { key: "title", label: "Title", type: "text", placeholder: "Notification title" },
      { key: "body", label: "Body", type: "textarea", placeholder: "Message body..." },
    ],
  },
};

// 3. Define condition fields (available variables for condition nodes)
const conditionFields = [
  { value: "order.total", label: "Order Total" },
  { value: "order.status", label: "Order Status" },
  { value: "customer.name", label: "Customer Name" },
];

// 4. Assemble the registry
export const MY_REGISTRY: NodeRegistry = {
  triggers,
  actions,
  triggerConfigs,
  actionConfigs,
  conditionFields,
};
```

### ConfigFieldDef Types

| Type | Renders | Extra props |
|------|---------|-------------|
| `text` | Text input | `placeholder` |
| `textarea` | Multi-line input | `placeholder` |
| `number` | Number input | `placeholder`, `defaultValue` |
| `select` | Static dropdown | `options: { value, label }[]` |
| `async_select` | Dynamic dropdown (fetches options from URL) | `optionsUrl`, `mapOption`, `createUrl`, `createFields` |
| `secret` | Password input | `placeholder`, `credentialRef` |

#### async_select Example

```typescript
{
  key: "channel_id",
  label: "Slack Channel",
  type: "async_select",
  placeholder: "Select a channel...",
  optionsUrl: "/api/slack/channels",           // GET endpoint returning JSON array
  mapOption: (item) => ({                       // Transform each item to { value, label }
    value: item.id as string,
    label: item.name as string,
  }),
  createUrl: "/api/slack/channels",            // Optional: POST to create new option inline
  createFields: { valueKey: "id", labelKey: "name" },  // Map created record fields
}
```

---

## Templates

### TemplateManager Component

A two-tab modal for browsing and saving workflow templates.

```tsx
import { TemplateManager, type ManagedTemplate } from "@supra/automation-builder";

<TemplateManager
  templates={allTemplates}
  currentNodes={nodes}
  currentEdges={edges}
  onSelect={(template) => loadTemplate(template)}
  onSave={(template) => saveTemplate(template)}
  onDelete={(id) => deleteTemplate(id)}
  onClose={() => setShowTemplates(false)}
  categories={["crm", "notifications", "custom"]}
  defaultCategory="crm"
/>
```

### TemplatePersistence (localStorage)

For apps that don't have a database, use the built-in localStorage persistence:

```typescript
import { TemplatePersistence } from "@supra/automation-builder";

// Each app uses its own storage key
const templateStore = new TemplatePersistence("myapp_custom_templates", builtInTemplates);

// CRUD
const all = templateStore.getAllTemplates();
const custom = templateStore.getCustomTemplates();
templateStore.saveCustomTemplate(template);
templateStore.deleteCustomTemplate(id);
const copy = templateStore.copyTemplate(template);  // Auto-increments name

// Import/Export
const json = templateStore.exportJSON();
const { imported, skipped } = templateStore.importJSON(json);

// Categories
const categories = templateStore.getCategories();
const filtered = templateStore.getTemplatesByCategory("custom");
```

For apps with a database (e.g., Supabase), implement your own persistence using the `onSave`/`onDelete`/`onSelect` callbacks on `TemplateManager`.

---

## Workflow Execution Engine

### Setting Up the Engine

```typescript
import {
  executeWorkflow,
  resumeWorkflow,
  type EngineConfig,
  type ActionContext,
  type ActionResult,
  type PersistenceAdapter,
  type WorkflowData,
} from "@supra/automation-builder";

// 1. Implement your action executor
async function myActionExecutor(
  actionType: string,
  config: Record<string, unknown>,
  ctx: ActionContext
): Promise<ActionResult> {
  switch (actionType) {
    case "send_notification":
      await sendNotification(config.title as string, config.body as string);
      return { success: true };
    default:
      return { success: false, error: `Unknown action: ${actionType}` };
  }
}

// 2. Implement your persistence adapter
const myPersistence: PersistenceAdapter = {
  async createRun(workflowId, event) {
    // Create a run record, return runId
    return crypto.randomUUID();
  },
  async updateRun(runId, status, nodeOutputs, error, currentNodeId) {
    // Update the run record
  },
  async scheduleResume(runId, workflowId, resumeAt, event) {
    // Schedule a delayed resume (for delay nodes)
  },
};

// 3. Build the engine config
const engineConfig: EngineConfig = {
  executeAction: myActionExecutor,
  persistence: myPersistence,
  renderTemplate: (template, vars) => {
    // Replace {{var}} placeholders
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ""));
  },
};

// 4. Execute a workflow
const result = await executeWorkflow(
  workflowData,                    // WorkflowData with nodes/edges
  { type: "manual", payload: {} }, // Triggering event
  { vars: { user: "jon" } },       // Initial context
  engineConfig
);

console.log(result.status);       // "completed" | "failed" | "paused"
console.log(result.nodeOutputs);  // Output from each node
console.log(result.nodeTimings);  // Execution timing per node
```

### Optional Engine Features

```typescript
const engineConfig: EngineConfig = {
  executeAction: myActionExecutor,
  persistence: myPersistence,

  // Template rendering for message actions
  renderTemplate: (template, vars) => renderMyTemplate(template, vars),

  // Retry failed actions (default: 2)
  maxRetries: 3,

  // Resolve stored credentials (API keys, tokens)
  credentialStore: myCredentialStore,

  // Execution logging
  logger: {
    onNodeStart: (runId, nodeId, nodeType) => console.log(`[${runId}] ${nodeType} started`),
    onNodeComplete: (runId, nodeId, output, durationMs) => console.log(`[${runId}] done in ${durationMs}ms`),
    onNodeError: (runId, nodeId, error) => console.error(`[${runId}] ${error}`),
  },

  // Streaming callback for AI/LLM actions
  onStream: (nodeId, chunk) => console.log(`[${nodeId}] ${chunk.content}`),

  // Rate limiting for API-heavy actions
  rateLimiter: new TokenBucketRateLimiter({ tokensPerSecond: 10, maxBurst: 20 }),

  // Sub-workflow resolution
  workflowResolver: { resolve: (id) => fetchWorkflowById(id) },

  // Database operations (for database nodes)
  databaseAdapter: myDatabaseAdapter,

  // AI operations (for AI nodes)
  aiProvider: myAIProvider,
};
```

---

## Built-in Node Types

| Type | Description | Key config |
|------|-------------|------------|
| `trigger` | Entry point, fires on events | `triggerType`, per-trigger config |
| `action` | Performs an operation | `actionType`, per-action config |
| `condition` | If/else branching | `field`, `operator`, `value`, `logic` ("and"/"or") |
| `delay` | Pause execution | `duration`, `unit` ("minutes"/"hours"/"days") |
| `try_catch` | Error handling wrapper | `tryPath`, `catchPath` |
| `code` | Run JavaScript/TypeScript | `language`, `code`, `timeout` |
| `switch` | Multi-path branching | `expression`, `cases[]`, `defaultCase` |
| `loop` | Iterate over arrays | `arrayExpression`, `itemVariable`, `maxIterations` |
| `transform` | Data transformation pipeline | `inputExpression`, `operations[]` (map, filter, sort, pick, omit, rename, flatten, group_by, aggregate, template, json_parse, json_stringify, unique, take, skip) |
| `sub_workflow` | Run another workflow | `workflowId`, `inputMappings`, `outputMappings` |
| `schedule` | Time-based trigger | `mode` ("interval"/"cron"/"calendar"), schedule config |
| `database` | Database operations | `connectorType`, `operation` (query/insert/update/delete/find/aggregate) |
| `ai` | LLM-powered node | `provider`, `model`, `prompt`, `tools[]`, `responseFormat` |
| `group_container` | Figma-style visual grouping | `children[]`, `acceptType`, `maxChildren`, `accent` |

---

## Group Container Node

Drag-drop container for visually grouping nodes (Figma-style).

```tsx
import { GroupContainerNode, type GroupContainerNodeData } from "@supra/automation-builder";

// Pass as customNodeTypes to FlowCanvas
<FlowCanvas
  customNodeTypes={{ group_container: GroupContainerNode }}
  // ...
/>
```

The container listens for `supra:group-add-child` custom events when items are dropped in. Your app handles this event to update node data.

### Accent Colors

Available accents: `"blue"`, `"purple"`, `"emerald"`, `"orange"`, `"primary"` (default).

---

## Undo/Redo

```tsx
import { useUndoRedo } from "@supra/automation-builder";

const { undo, redo, canUndo, canRedo } = useUndoRedo(nodes, edges, setNodes, setEdges);
```

- 50-snapshot history
- JSON-based deduplication (won't record identical states)
- Keyboard shortcuts: `Ctrl+Z` (undo), `Ctrl+Shift+Z` / `Ctrl+Y` (redo)
- Skips recording when focused in input/textarea/select elements

Or just pass `enableUndoRedo` and `showUndoRedoButtons` to `FlowCanvas` — it handles everything internally.

---

## Connector SDK

Build reusable connectors that auto-generate palette items, config panels, and action executors.

```typescript
import { defineConnector } from "@supra/automation-builder";

const myConnector = defineConnector({
  id: "slack",
  name: "Slack",
  description: "Send messages and manage channels",
  version: "1.0.0",
  icon: "MessageSquare",
  category: "communication",
  auth: {
    type: "bearer",
    fields: [{ key: "token", label: "Bot Token", required: true }],
  },
  triggers: [
    {
      id: "new_message",
      name: "New Message",
      description: "When a message is posted",
      config: [
        { key: "channel", label: "Channel", type: "text", placeholder: "#general" },
      ],
    },
  ],
  actions: [
    {
      id: "send_message",
      name: "Send Message",
      description: "Post a message to a channel",
      config: [
        { key: "channel", label: "Channel", type: "text", placeholder: "#general" },
        { key: "text", label: "Message", type: "textarea", placeholder: "Hello!" },
      ],
      executor: async (config, context) => {
        // Your implementation
        return { success: true, output: { ts: "1234567890.123456" } };
      },
    },
  ],
});

// Use the generated registry items
// myConnector.paletteItems, myConnector.triggerConfigs, myConnector.actionConfigs
// myConnector.actionExecutor — ready-to-use ActionExecutor function
```

---

## Existing App Registries

The package includes pre-built registries for current consumers:

| Registry | Import | App |
|----------|--------|-----|
| `SUPRATEAM_REGISTRY` | `@supra/automation-builder` | SupraTeam CRM |
| `SUPRALOOP_REGISTRY` | `@supra/automation-builder` | SupraLoop |
| `AUTOPURCHASER_REGISTRY` | `@supra/automation-builder` | LeeJones Auto Purchaser |

These are exported for reference and can be used directly or extended.

---

## Expression Resolver

Safe `{{expression}}` resolver — no eval, no Function constructor. Resolves property paths against workflow execution context.

```typescript
import {
  resolveExpression,
  resolveTemplate,
  resolveAllValues,
  type ExpressionContext,
} from "@supra/automation-builder";

const ctx: ExpressionContext = {
  nodeOutputs: { node_1: { message: "hello", count: 42 } },
  vars: { userId: "u_123" },
  credentials: { slack: { token: "xoxb-..." } },
  env: { API_URL: "https://api.example.com" },
  currentNodeId: "node_2",
};

// Single expression
resolveExpression("node_1.message", ctx);          // "hello"
resolveExpression("vars.userId", ctx);              // "u_123"
resolveExpression("env.API_URL", ctx);              // "https://api.example.com"

// Template string (replaces all {{...}} placeholders)
resolveTemplate("Hello {{vars.userId}}, count is {{node_1.count}}", ctx);

// Recursively resolve all string values in an object
resolveAllValues({ to: "{{vars.userId}}", body: "Count: {{node_1.count}}" }, ctx);
```

---

## Smart Defaults

Auto-fills config for newly dropped nodes based on workflow context.

```typescript
import {
  computeSmartDefaults,
  detectUpstreamFromEdges,
  BUILTIN_SMART_DEFAULT_RULES,
  type SmartDefaultRule,
  type SmartDefaultContext,
} from "@supra/automation-builder";

// Built-in rules:
// - Same-connector prefill: copies config from existing nodes of the same connector family
// - Upstream loop variable: auto-fills arrayExpression when dropped after a trigger
// - Condition from upstream: pre-populates condition field from upstream node output

// Custom rule
const myRule: SmartDefaultRule = {
  id: "myapp:default-channel",
  nodeType: "action",
  applies: (ctx) => ctx.newNodeSubType === "slack_send_message",
  getDefaults: () => ({ channel: "#general" }),
};

// Pass custom rules to FlowCanvas
<FlowCanvas smartDefaultRules={[myRule]} /* ... */ />

// Or call directly
const defaults = computeSmartDefaults(context);
const upstreamId = detectUpstreamFromEdges(edges, nodeId);
```

---

## AI Features

### AIExecutor

Provider-agnostic LLM execution engine with automatic tool-use loop.

```typescript
import {
  AIExecutor,
  type AIProvider,
  type AIChatRequest,
  type AIChatResponse,
  type AIChatChunk,
  type AIChatMessage,
  type AIExpressionContext,
} from "@supra/automation-builder";

// Implement the AIProvider interface to bridge to any LLM
const myProvider: AIProvider = {
  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    // Call OpenAI, Anthropic, etc.
    return { content: "...", model: "gpt-4o", finishReason: "stop" };
  },
  // Optional streaming
  async *chatStream(request: AIChatRequest): AsyncIterable<AIChatChunk> {
    yield { content: "Hello" };
    yield { content: " world", finishReason: "stop" };
  },
};

// Pass to EngineConfig as aiProvider
const engineConfig: EngineConfig = {
  // ...
  aiProvider: myProvider,
};
```

### AISuggestionEngine

Rule-based workflow analysis — no LLM dependency, purely structural/heuristic.

```typescript
import { AISuggestionEngine, type AISuggestion } from "@supra/automation-builder";

const engine = new AISuggestionEngine();
const suggestions: AISuggestion[] = engine.analyze(nodes, edges, (updatedNodes, updatedEdges) => {
  // Called when user applies a suggestion
  setNodes(updatedNodes);
  setEdges(updatedEdges);
});

// Checks: unconnected nodes, missing error handling, missing condition branches,
// rate limit opportunities, AI node validation, dead ends, parallel opportunities
```

### AISuggestionsPanel

UI component displaying suggestions from the engine.

```typescript
import { AISuggestionsPanel, type AISuggestionsPanelProps } from "@supra/automation-builder";

<AISuggestionsPanel
  suggestions={suggestions}
  onDismiss={(id) => dismissSuggestion(id)}
  onApplyAll={() => applyAllSuggestions()}
/>
```

### AIFlowChat

Floating chat panel for AI-assisted workflow building. Consuming apps provide the AI backend.

```typescript
import {
  AIFlowChat,
  type AIFlowChatProps,
  type AIFlowChatRequest,
  type AIFlowChatResponse,
  type AIFlowMessage,
} from "@supra/automation-builder";

<AIFlowChat
  currentNodes={nodes}
  currentEdges={edges}
  onApplyFlow={(nodes, edges) => { setNodes(nodes); setEdges(edges); }}
  onSendMessage={async (req: AIFlowChatRequest) => {
    // req.message, req.currentNodes, req.currentEdges, req.history
    const response = await callYourAIBackend(req);
    return response; // { message: string, flowUpdate?: { nodes, edges }, error?: string }
  }}
  placeholder="Describe a workflow..."
  title="AI Assistant"
  subtitle="Build workflows with natural language"
  welcomeMessage="What workflow would you like to build?"
  buttonIcon="sparkles"
/>
```

---

## Database Connector Utilities

Safe SQL/NoSQL query building with injection protection.

```typescript
import {
  QueryBuilder,
  WhereBuilder,
  where,
  sanitizeIdentifier,
  validateMongoFilter,
  validateMongoPipeline,
  type BuiltQuery,
  type MongoQuery,
  type OrderByClause,
} from "@supra/automation-builder";

// SQL — all values parameterized ($1, $2, ...), never interpolated
const query: BuiltQuery = new QueryBuilder()
  .select("users")
  .where(where().eq("status", "active").gt("age", 18))
  .orderBy([{ column: "name", direction: "asc" }])
  .limit(10)
  .build();
// query.sql = 'SELECT * FROM "users" WHERE "status" = $1 AND "age" > $2 ORDER BY "name" ASC LIMIT 10'
// query.params = ["active", 18]

// Identifier validation (prevents SQL injection via table/column names)
sanitizeIdentifier("users");         // '"users"'
sanitizeIdentifier("schema.table");  // '"schema"."table"'

// MongoDB filter validation (blocks $where, dangerous $expr)
validateMongoFilter({ status: "active" });  // OK
validateMongoPipeline([{ $match: { status: "active" } }]);  // OK, blocks $out/$merge
```

---

## Scheduler & Cron Utilities

Zero-dependency cron parser, calendar converter, and schedule manager.

```typescript
import {
  parseCronExpression,
  getNextCronDate,
  getNextNDates,
  validateCronExpression,
  cronToHumanReadable,
  calendarToSchedule,
  intervalToNextDate,
  scheduleToHumanReadable,
  ScheduleManager,
  type CronParts,
  type CronField,
  type ScheduleFiredCallback,
} from "@supra/automation-builder";

// Parse and validate cron
const parts: CronParts = parseCronExpression("0 9 * * 1-5");
const { valid, error } = validateCronExpression("0 9 * * 1-5");

// Human-readable descriptions
cronToHumanReadable("0 9 * * 1-5");     // "At 09:00, Monday through Friday"
scheduleToHumanReadable(scheduleConfig); // Description based on mode

// Next execution dates
const nextDate = getNextCronDate(parts);
const next5 = getNextNDates(scheduleConfig, 5);

// Calendar mode → cron conversion
const cronExpr = calendarToSchedule({ frequency: "weekly", time: "09:00", dayOfWeek: 1 });

// Interval → next date
const nextRun = intervalToNextDate({ value: 30, unit: "minutes" }, lastRunDate);

// ScheduleManager — manages active schedules with firing callbacks
const manager = new ScheduleManager();
manager.start(scheduleConfig, (firedAt) => {
  console.log("Schedule fired at:", firedAt);
});
manager.stop();
```

Supports cron aliases: `@yearly`, `@monthly`, `@weekly`, `@daily`, `@hourly`.

---

## Workflow Portability

Schema-versioned export/import, shareable links, and clipboard support.

```typescript
import {
  WORKFLOW_SCHEMA_VERSION,        // "1.0.0"
  exportWorkflow,
  importWorkflow,
  validateWorkflowSchema,
  encodeWorkflowToLink,
  decodeWorkflowFromLink,
  copyWorkflowToClipboard,
  pasteWorkflowFromClipboard,
  type ExportedWorkflow,
  type ImportWorkflowResult,
  type SchemaValidationResult,
  type WorkflowPortabilityMetadata,
} from "@supra/automation-builder";

// Export — strips runtime state and secrets from node data
const exported: ExportedWorkflow = exportWorkflow(nodes, edges, { name: "My Workflow" });

// Import — validates schema version and returns warnings
const result: ImportWorkflowResult = importWorkflow(jsonString);
// result.nodes, result.edges, result.metadata, result.warnings

// Schema validation
const { valid, errors }: SchemaValidationResult = validateWorkflowSchema(jsonString);

// Shareable URL (base64-encoded in fragment)
const url: string = encodeWorkflowToLink(nodes, edges, "https://myapp.com/import");
const decoded: ImportWorkflowResult = decodeWorkflowFromLink(url);

// Clipboard
await copyWorkflowToClipboard(nodes, edges);
const pasted: ImportWorkflowResult = await pasteWorkflowFromClipboard();
```

---

## Template Utilities (extended)

Beyond the basic `exportTemplate`/`importTemplate` already documented:

```typescript
import {
  exportTemplate,
  importTemplate,
  validateTemplate,
  encodeTemplateToUrl,
  decodeTemplateFromUrl,
  workflowToTemplate,
  getNextCopyName,
  copyTemplateForUse,
  type ExportTemplateInput,
  type ImportTemplateResult,
} from "@supra/automation-builder";

// Convert workflow to template
const template = workflowToTemplate(workflowData, { author: "Jon", category: "crm" });

// Auto-increment copy names
getNextCopyName("My Template", existingNames); // "My Template_001", "My Template_002", etc.

// Copy for immediate use (generates new IDs)
const copy = copyTemplateForUse(template);
```

---

## Data Transform Pipeline

Apply a sequence of transform operations to data — no eval, safe expression parsing.

```typescript
import { applyTransformPipeline } from "@supra/automation-builder";
import type { TransformOperation, TransformResult } from "@supra/automation-builder";

const ops: TransformOperation[] = [
  { type: "filter", expression: "item.active == true" },
  { type: "sort", key: "name", direction: "asc" },
  { type: "pick", keys: ["name", "email"] },
  { type: "take", count: 10 },
];

const result: TransformResult = applyTransformPipeline(inputData, ops, expressionContext);
// result.success, result.output, result.operationsApplied, result.error
```

Available operations: `map`, `filter`, `sort`, `pick`, `omit`, `rename`, `flatten`, `group_by`, `aggregate`, `template`, `json_parse`, `json_stringify`, `unique`, `take`, `skip`.

---

## Sub-Workflow Validation

```typescript
import {
  validateSubWorkflow,
  type SubWorkflowValidationResult,
} from "@supra/automation-builder";

const result: SubWorkflowValidationResult = validateSubWorkflow(workflowData, parentWorkflowId);
// Checks: no delay nodes, no self-referencing sub_workflow nodes, required config fields present
```

---

## Rate Limiter

Token bucket algorithm — injectable on EngineConfig, shared across workflow runs.

```typescript
import {
  TokenBucketRateLimiter,
  type RateLimitConfig,
  type RateLimitAcquireResult,
  type RateLimitStatus,
} from "@supra/automation-builder";

const limiter = new TokenBucketRateLimiter({
  maxTokens: 20,
  refillRate: 10,                  // tokens per second
  strategy: "wait",                // "wait" | "skip" | "fail"
  perActionOverrides: {
    slack_send_message: { maxTokens: 5, refillRate: 1 },
  },
});

// Use standalone
const result: RateLimitAcquireResult = await limiter.acquire("send_email");
const status: RateLimitStatus = limiter.status("send_email");

// Or inject into engine — auto-applied before every action node
const engineConfig: EngineConfig = { /* ... */ rateLimiter: limiter };
```

---

## Logging & Observability

### ConsoleLogger

Ready-to-use ExecutionLogger with timestamps and automatic secret redaction.

```typescript
import { ConsoleLogger } from "@supra/automation-builder";

const engineConfig: EngineConfig = {
  // ...
  logger: new ConsoleLogger(),
  // Redacts values where key matches: token, key, secret, password
};
```

### Plain-Language Formatting

```typescript
import { formatRunSummary, formatNodeEvent, formatDuration } from "@supra/automation-builder";

formatDuration(65000);                    // "1m 5s"
formatRunSummary(executionRecord);        // "Completed in 1m 5s — 4 nodes, 0 errors"
formatNodeEvent(nodeEvent);              // "send_email completed in 230ms"
```

---

## RBAC (Role-Based Access Control)

```typescript
import {
  RBACManager,
  BUILTIN_ADMIN_ROLE,
  BUILTIN_EDITOR_ROLE,
  BUILTIN_VIEWER_ROLE,
  BUILTIN_OPERATOR_ROLE,
  RBACProvider,
  RBACContext,
  useRBAC,
  type RBACProviderProps,
} from "@supra/automation-builder";

// Built-in roles with pre-configured permissions
// Admin: all permissions
// Editor: workflow CRUD + templates + credentials
// Viewer: read-only access
// Operator: execute + toggle + read

// Wrap your app to enforce permissions in components
<RBACProvider manager={rbacManager} userId="user_123">
  {/* useRBAC() hook available in children */}
</RBACProvider>
```

Built-in permissions: `workflow:create`, `workflow:read`, `workflow:update`, `workflow:delete`, `workflow:execute`, `workflow:toggle`, `credential:*`, `template:*`, `history:*`, `admin:*`.

---

## Execution History

```typescript
import {
  ExecutionHistoryStore,
  ExecutionHistoryPanel,
  type ExecutionHistoryPanelProps,
} from "@supra/automation-builder";

// Store implements ExecutionLogger — plug directly into engine
const historyStore = new ExecutionHistoryStore();
const engineConfig: EngineConfig = { /* ... */ logger: historyStore };

// Query runs
const { records, total, stats } = historyStore.query({
  workflowId: "wf_123",
  status: "failed",
  dateRange: { start: "2026-03-01", end: "2026-03-26" },
  limit: 20,
});

// UI component
<ExecutionHistoryPanel
  store={historyStore}
  workflowId="wf_123"
/>
```

---

## Partner Applets

```typescript
import {
  AppletStore,
  EXAMPLE_APPLETS,
  AppletMarketplace,
  AppletConfigModal,
  AppletInstances,
  type AppletMarketplaceProps,
  type AppletConfigModalProps,
  type AppletInstancesProps,
} from "@supra/automation-builder";

// AppletStore manages applet catalog + installed instances
const store = new AppletStore(EXAMPLE_APPLETS);

// Marketplace UI — browse and install
<AppletMarketplace store={store} onInstall={(applet, config) => { /* ... */ }} />

// Config modal — shown when installing/editing an applet
<AppletConfigModal applet={selectedApplet} onSave={(config) => { /* ... */ }} onClose={() => {}} />

// Instances list — manage installed applets
<AppletInstances store={store} onToggle={(id, enabled) => { /* ... */ }} onDelete={(id) => { /* ... */ }} />
```

---

## Workflow Dashboard

```typescript
import {
  WorkflowDashboard,
  type WorkflowDashboardProps,
  type WorkflowSummary,
} from "@supra/automation-builder";

<WorkflowDashboard
  workflows={workflows}
  onSelect={(id) => navigate(`/workflows/${id}`)}
  onToggle={(id, enabled) => toggleWorkflow(id, enabled)}
  onDelete={(id) => deleteWorkflow(id)}
/>
```

---

## Node Components

Individual node renderers — exported for custom composition via `customNodeTypes`. FlowCanvas registers all of these by default, so you only need these if building a custom canvas layout.

```typescript
import {
  TriggerNode,
  ActionNode,
  ConditionNode,
  DelayNode,
  TryCatchNode,
  CodeNode,
  SwitchNode,
  LoopNode,
  TransformNode,
  SubWorkflowNode,
  ScheduleNode,
  DatabaseNode,
  AINode,
  GroupContainerNode,
} from "@supra/automation-builder";

// Override specific node renderers
<FlowCanvas customNodeTypes={{ action: MyCustomActionNode }} /* ... */ />
```

---

## Additional UI Components

### NodeSidebar

Draggable node palette. Rendered automatically inside FlowCanvas (hide with `hideSidebar`). Exported for standalone use.

```typescript
import { NodeSidebar } from "@supra/automation-builder";
```

### NodeConfigPanel

Node property editor. Rendered automatically inside FlowCanvas (hide with `hideConfigPanel`). Exported for standalone use.

```typescript
import { NodeConfigPanel } from "@supra/automation-builder";
```

### NodeContextMenu

Right-click context menu. Enabled by default in FlowCanvas (`enableContextMenu`). Exported for custom integration.

```typescript
import {
  NodeContextMenu,
  type NodeContextMenuProps,
  type ContextMenuItem,
} from "@supra/automation-builder";
```

### TemplateBrowser

Lightweight read-only template browsing component (alternative to the full TemplateManager).

```typescript
import { TemplateBrowser, type TemplateBrowserProps } from "@supra/automation-builder";
```

---

## BuilderProvider & Context

Components like NodeSidebar, NodeConfigPanel, and built-in node renderers (TriggerNode, ActionNode) use `useBuilderContext()` internally. This requires a `BuilderProvider` ancestor.

```typescript
import {
  BuilderProvider,
  useBuilderContext,
  type BuilderProviderProps,
} from "@supra/automation-builder";

<BuilderProvider
  registry={myRegistry}
  iconMap={{ Play: PlayIcon, Mail: MailIcon }}  // Optional: map icon names → React components
>
  <FlowCanvas /* ... */ />
</BuilderProvider>
```

---

## CPO Personas

Pre-built Chief Product Officer decision-making personas for agent-driven automation design.

```typescript
import {
  CPO_N8N,
  CPO_IFTTT,
  CPO_CRYPTO_AUTOMATION,
  type CPOPersona,
  type ProductThesis,
  type DecisionHeuristic,
  type StrategicPriority,
} from "@supra/automation-builder";

// Each persona has: id, name, title, org, bio, thesis, heuristics, priorities, evaluationPrompt, voice
```

---

## Registry Utilities

```typescript
import { mergeRegistries, registerConnector } from "@supra/automation-builder";

// Merge multiple registries into one
const combined = mergeRegistries(SUPRATEAM_REGISTRY, SUPRALOOP_REGISTRY);

// Register a connector (from defineConnector) into an existing registry
// Validates no duplicate subTypes, throws if conflicts found
const extended = registerConnector(myRegistry, myConnector);
```

Each pre-built registry also exports granular pieces:

```typescript
import {
  SUPRATEAM_REGISTRY, SUPRATEAM_TRIGGERS, SUPRATEAM_ACTIONS,
  SUPRALOOP_REGISTRY, SUPRALOOP_TRIGGERS, SUPRALOOP_ACTIONS,
  AUTOPURCHASER_REGISTRY, AUTOPURCHASER_TRIGGERS, AUTOPURCHASER_ACTIONS,
} from "@supra/automation-builder";
```

---

## Built-in Connectors

```typescript
import { webhookConnector } from "@supra/automation-builder";

// Pre-built webhook connector — register into any registry
const registry = registerConnector(myRegistry, webhookConnector);
```

---

## Utility Exports

```typescript
import { cn } from "@supra/automation-builder";             // clsx + tailwind-merge
import { DEFAULT_OPERATORS } from "@supra/automation-builder"; // Default condition operators
import { defaultRenderTemplate } from "@supra/automation-builder"; // Simple {{var}} replacer
```

`DEFAULT_OPERATORS` provides: Equals, Not Equals, Contains, Not Contains, Starts With, Greater Than, Less Than, Greater or Equal, Less or Equal, Is Empty, Is Not Empty.

---

## Complete Export Index

Every public export from `@supra/automation-builder`, organized by module:

| Module | Exports |
|--------|---------|
| **Core Types** | `WorkflowNodeType`, `TriggerNodeData`, `ActionNodeData`, `ConditionNodeData`, `DelayNodeData`, `TryCatchNodeData`, `CodeNodeData`, `SwitchNodeData`, `LoopNodeData`, `TransformNodeData`, `SubWorkflowNodeData`, `ScheduleNodeData`, `DatabaseNodeData`, `AINodeData`, `GroupContainerNodeData`, `WorkflowNodeData`, `ConditionConfig`, `DelayConfig`, `TryCatchConfig`, `CodeConfig`, `SwitchConfig`, `SwitchCase`, `LoopConfig`, `TransformConfig`, `TransformOperation`, `TransformResult`, `AggregateOp`, `SubWorkflowConfig`, `WorkflowResolver`, `ScheduleConfig`, `ScheduleState`, `ScheduleIntervalConfig`, `ScheduleCalendarConfig`, `DatabaseConfig`, `DatabaseOperation`, `DatabaseConnectorType`, `DatabaseResult`, `DatabaseAdapter`, `ConditionOperator`, `RetryConfig`, `DEFAULT_OPERATORS` |
| **AI Types** | `AINodeConfig`, `AITool`, `AIToolCall`, `AINodeResult`, `AISuggestion` |
| **Group Container** | `GroupContainerChild` |
| **Registry Types** | `NodePaletteItem`, `ConfigFieldDef`, `NodeTypeRegistration`, `NodeRegistry` |
| **Workflow Types** | `WorkflowData`, `FlowNode`, `FlowEdge` |
| **Engine** | `executeWorkflow()`, `resumeWorkflow()`, `evaluateCondition()`, `defaultRenderTemplate()`, `EngineConfig` |
| **Engine Types** | `WorkflowEvent`, `ActionContext`, `ActionResult`, `ActionExecutor`, `PersistenceAdapter`, `RunResult`, `NodeTiming` |
| **Credentials** | `StoredCredential`, `CredentialStore`, `CredentialRef` |
| **Streaming** | `StreamChunk`, `StreamingActionResult`, `OnStreamCallback` |
| **Logging** | `ExecutionLogger`, `ConsoleLogger` |
| **Expression Resolver** | `resolveExpression()`, `resolveTemplate()`, `resolveAllValues()`, `ExpressionContext` |
| **AI Executor** | `AIExecutor`, `AIProvider`, `AIChatRequest`, `AIChatResponse`, `AIChatChunk`, `AIChatMessage`, `AIExpressionContext` |
| **AI Suggestions** | `AISuggestionEngine` |
| **Database Connector** | `QueryBuilder`, `WhereBuilder`, `where()`, `sanitizeIdentifier()`, `validateMongoFilter()`, `validateMongoPipeline()`, `BuiltQuery`, `MongoQuery`, `OrderByClause` |
| **Sub-Workflow** | `validateSubWorkflow()`, `SubWorkflowValidationResult` |
| **Data Mapper** | `applyTransformPipeline()` |
| **Rate Limiter** | `TokenBucketRateLimiter`, `RateLimitConfig`, `RateLimitAcquireResult`, `RateLimitStatus` |
| **Smart Defaults** | `computeSmartDefaults()`, `detectUpstreamFromEdges()`, `BUILTIN_SMART_DEFAULT_RULES`, `SmartDefaultContext`, `SmartDefaultRule` |
| **Scheduler** | `parseCronExpression()`, `getNextCronDate()`, `getNextNDates()`, `validateCronExpression()`, `cronToHumanReadable()`, `calendarToSchedule()`, `intervalToNextDate()`, `scheduleToHumanReadable()`, `ScheduleManager`, `CronParts`, `CronField`, `ScheduleFiredCallback` |
| **Execution History** | `ExecutionHistoryStore`, `ExecutionRecord`, `NodeExecutionEvent`, `ExecutionHistoryQuery`, `ExecutionHistoryResult`, `ExecutionStats`, `TimeSeriesBucket`, `SerializedHistory` |
| **Plain Language** | `formatRunSummary()`, `formatNodeEvent()`, `formatDuration()` |
| **RBAC** | `RBACManager`, `BUILTIN_ADMIN_ROLE`, `BUILTIN_EDITOR_ROLE`, `BUILTIN_VIEWER_ROLE`, `BUILTIN_OPERATOR_ROLE`, `Permission`, `Role`, `User`, `RBACConfig`, `SerializedRBAC` |
| **Portability** | `WORKFLOW_SCHEMA_VERSION`, `exportWorkflow()`, `importWorkflow()`, `validateWorkflowSchema()`, `encodeWorkflowToLink()`, `decodeWorkflowFromLink()`, `copyWorkflowToClipboard()`, `pasteWorkflowFromClipboard()`, `ExportedWorkflow`, `ImportWorkflowResult`, `SchemaValidationResult`, `WorkflowPortabilityMetadata` |
| **Template Utils** | `exportTemplate()`, `importTemplate()`, `validateTemplate()`, `encodeTemplateToUrl()`, `decodeTemplateFromUrl()`, `workflowToTemplate()`, `getNextCopyName()`, `copyTemplateForUse()`, `ExportTemplateInput`, `ImportTemplateResult` |
| **Template Marketplace** | `TemplateManifest`, `ShareableTemplate`, `TemplateValidationResult` |
| **Connector SDK** | `defineConnector()`, `ConnectorAuthType`, `ConnectorAuthField`, `ConnectorAuthConfig`, `ConnectorTrigger`, `ConnectorAction`, `ConnectorActionExecutor`, `ConnectorActionExecutorResult`, `ConnectorDefinition`, `ConnectorOutput`, `CredentialDefinition`, `ConnectorManifest` |
| **Partner Applets** | `AppletStore`, `EXAMPLE_APPLETS`, `PartnerApplet`, `AppletConfigField`, `AppletInstance`, `PartnerRegistry`, `AppletSearchQuery`, `AppletSearchResult`, `SerializedAppletStore` |
| **Personas** | `CPO_N8N`, `CPO_IFTTT`, `CPO_CRYPTO_AUTOMATION`, `CPOPersona`, `ProductThesis`, `DecisionHeuristic`, `StrategicPriority` |
| **Registries** | `SUPRATEAM_REGISTRY`, `SUPRATEAM_TRIGGERS`, `SUPRATEAM_ACTIONS`, `SUPRALOOP_REGISTRY`, `SUPRALOOP_TRIGGERS`, `SUPRALOOP_ACTIONS`, `AUTOPURCHASER_REGISTRY`, `AUTOPURCHASER_TRIGGERS`, `AUTOPURCHASER_ACTIONS`, `mergeRegistries()`, `registerConnector()` |
| **Connectors** | `webhookConnector` |
| **Components** | `FlowCanvas`, `NodeSidebar`, `NodeConfigPanel`, `BuilderProvider`, `useBuilderContext`, `TemplateManager`, `TemplateBrowser`, `NodeContextMenu`, `AIFlowChat`, `AISuggestionsPanel`, `ExecutionHistoryPanel`, `WorkflowDashboard`, `AppletMarketplace`, `AppletConfigModal`, `AppletInstances`, `RBACProvider`, `RBACContext`, `useRBAC` |
| **Node Components** | `TriggerNode`, `ActionNode`, `ConditionNode`, `DelayNode`, `TryCatchNode`, `CodeNode`, `SwitchNode`, `LoopNode`, `TransformNode`, `SubWorkflowNode`, `ScheduleNode`, `DatabaseNode`, `AINode`, `GroupContainerNode` |
| **Undo/Redo** | `useUndoRedo` |
| **Utilities** | `cn()` |

---

## Updating the Package

To pull the latest version:

```bash
npm install github:SupraAgent/Supra-Automation-Builder
```

This fetches the latest `main` branch and rebuilds `dist/` via the `prepare` script.

To pin to a specific commit:

```bash
npm install github:SupraAgent/Supra-Automation-Builder#abc1234
```

---

## Rules

- **All builder changes go to this repo** — never modify `@supra/automation-builder` code inside a consuming app
- **Don't duplicate builder components locally** — import from the package
- **App-specific logic stays in the app** — persistence adapters, action executors, and domain-specific node components belong in the consuming app, not here
- **New registries welcome** — add `src/registries/yourapp.ts` via PR to this repo
- **Keep it light** — no database clients, no API SDKs, no large dependencies

---

## Currently Integrated Apps

| App | Status | Notes |
|-----|--------|-------|
| SupraTeam (CRM) | Verified | Supabase persistence, 24 triggers, 20 actions |
| SupraLoop | Verified | localStorage persistence, domain-specific persona/consensus nodes |
| LeeJones (Auto Purchaser) | Integrated | localStorage persistence, scraper-focused triggers |
