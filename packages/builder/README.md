# @supra/builder

A self-contained React drag-and-drop workflow and automation builder built on [@xyflow/react](https://reactflow.dev/) (React Flow v12). Embed a full-featured visual workflow editor in any React application with a single component.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Props Reference](#props-reference)
- [Node Types](#node-types)
- [Execution Engine](#execution-engine)
- [AI Integration](#ai-integration)
- [Canvas Features](#canvas-features)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Persistence and Workspaces](#persistence-and-workspaces)
- [Customization](#customization)
- [Examples](#examples)
- [Exports](#exports)

---

## Installation

```bash
npm install @supra/builder
```

### Peer Dependencies

The following packages must be installed in your project:

```bash
npm install @xyflow/react react react-dom tailwindcss
```

| Peer Dependency  | Version           |
|------------------|-------------------|
| `@xyflow/react`  | `^12.0.0`         |
| `react`          | `^18.0.0 \|\| ^19.0.0` |
| `react-dom`      | `^18.0.0 \|\| ^19.0.0` |
| `tailwindcss`    | `^4.0.0`          |

---

## Quick Start

```tsx
import { WorkflowBuilder } from "@supra/builder";
import "@supra/builder/styles.css";

export default function App() {
  return (
    <WorkflowBuilder
      title="My Workflow Editor"
      onSave={(nodes, edges) => {
        console.log("Saved:", { nodes, edges });
      }}
    />
  );
}
```

This renders a complete workflow builder with a node palette, canvas, minimap, templates, undo/redo, and JSON import/export -- all with zero configuration.

---

## Props Reference

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialNodes` | `Node[]` | `[]` | Initial nodes to render on the canvas. |
| `initialEdges` | `Edge[]` | `[]` | Initial edges connecting the nodes. |
| `category` | `"team" \| "app" \| "benchmark" \| "scoring" \| "improve" \| "workflow" \| "custom"` | `"workflow"` | Template category filter for the template sidebar. |
| `customNodeTypes` | `Record<string, React.ComponentType<unknown>>` | `undefined` | Register additional node types alongside the 14 built-in types. |
| `storageKeyPrefix` | `string` | `"supraloop"` | Prefix for localStorage keys used by workspaces and templates. |
| `disableAutoLayout` | `boolean` | `false` | Disable automatic layout when loading a template. |
| `className` | `string` | `undefined` | CSS class applied to the root container. |

### Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onNodesChange` | `(nodes: Node[]) => void` | Called whenever nodes are added, removed, or modified. |
| `onEdgesChange` | `(edges: Edge[]) => void` | Called whenever edges are added, removed, or modified. |
| `onSave` | `(nodes: Node[], edges: Edge[]) => void` | Called when the user clicks "Save". |
| `onRun` | `(nodes: Node[], edges: Edge[]) => Promise<void> \| void` | Called when the user clicks "Validate & Run". |
| `onTemplateCreate` | `(template: FlowTemplate) => void` | Called when a template is created or saved. |
| `onExport` | `(data: { nodes: Node[]; edges: Edge[] }) => void` | Called when the user exports the workflow as JSON. |
| `onImport` | `(data: { nodes: Node[]; edges: Edge[] }) => void` | Called when the user imports a JSON workflow. |
| `onWorkspaceChange` | `(workspaceId: string, nodes: Node[], edges: Edge[]) => void` | Called when the active workspace changes. |

### AI Handlers

| Prop | Type | Description |
|------|------|-------------|
| `onChat` | `FlowChatHandler` | Handler for AI-powered canvas chat. The builder calls this function instead of making API requests directly. |
| `onLLMExecute` | `LLMExecuteHandler` | Handler for LLM node execution during workflow runs. Required for `llmNode` execution with `claude` or `claude-code` providers. |
| `apiKey` | `string` | API key for AI features. If omitted, the builder reads from localStorage. |

### UI Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Workflow Builder"` | Header title text. |
| `subtitle` | `string` | `"Drag nodes, connect cards, build chains of operations."` | Header subtitle text. |
| `showStartScreen` | `boolean` | `true` | Show the start screen with template selection on first load. |
| `showAIChat` | `boolean` | `true` | Show the AI chat button (requires `onChat` handler). |
| `showExecutionPanel` | `boolean` | `true` | Show the execution results panel after workflow runs. |

---

## Node Types

The builder ships with 14 node types. Each node type has a typed data interface.

### Workflow Nodes

| Type | Description | Key Data Fields |
|------|-------------|-----------------|
| `triggerNode` | Entry point for workflow execution. | `label`, `triggerType` (`"manual"` \| `"schedule"` \| `"webhook"` \| `"event"`), `config` |
| `llmNode` | Sends a prompt to an LLM and returns the response. | `label`, `provider` (`"claude"` \| `"claude-code"` \| `"ollama"` \| `"custom"`), `model`, `systemPrompt`, `temperature`, `maxTokens` |
| `conditionNode` | Branches execution based on a condition expression. | `label`, `condition` |
| `transformNode` | Transforms data between nodes. | `label`, `transformType` (`"map"` \| `"filter"` \| `"merge"` \| `"extract"` \| `"custom"`), `expression` |
| `outputNode` | Terminal node that outputs results. | `label`, `outputType` (`"log"` \| `"api"` \| `"file"` \| `"notify"` \| `"github"`), `destination` |
| `actionNode` | Performs a discrete action. | `label`, `actionType` (`"score"` \| `"analyze"` \| `"improve"` \| `"generate"` \| `"commit"`), `description` |

### Domain Nodes

| Type | Description | Key Data Fields |
|------|-------------|-----------------|
| `personaNode` | Represents an AI persona with a role and vote weight. | `label`, `role`, `voteWeight`, `expertise` (string[]), `personality`, `emoji` |
| `appNode` | Represents the application being evaluated. | `label`, `description`, `targetUsers`, `coreValue`, `currentState` |
| `competitorNode` | Represents a competitor for benchmarking. | `label`, `why`, `overallScore`, `cpoName` |
| `consensusNode` | Aggregates persona votes into a consensus score. | `label`, `personas` (array), `consensusScore` |
| `affinityCategoryNode` | Represents a scoring category with weight. | `label`, `weight`, `score`, `domainExpert` |

### Utility Nodes

| Type | Description | Key Data Fields |
|------|-------------|-----------------|
| `noteNode` | Annotation node (not executed). | `label`, `content` |
| `stepNode` | Represents a step in a multi-step process. | `label`, `stepIndex`, `subtitle`, `status`, `summary`, `flowCategory` |
| `configNode` | Represents a configuration file or settings block. | `label`, `configType`, `filePath`, `description`, `gitignored`, `sections` |

---

## Execution Engine

The workflow engine resolves node dependencies via topological sort (Kahn's algorithm) and executes the graph with eager parallelism.

### How It Works

1. **Validation** -- `validateWorkflow()` checks for trigger nodes, cycles, disconnected nodes, and LLM provider configuration.
2. **Planning** -- `createExecution()` builds an execution plan from the topological sort order.
3. **Execution** -- `executeWorkflow()` runs nodes as soon as all upstream dependencies resolve.

### Key Features

| Feature | Details |
|---------|---------|
| **Eager dependency-graph parallelism** | Nodes start the instant their upstream dependencies complete. A fast node at depth 2 immediately triggers its depth-3 children, even if a slow node at depth 2 is still running. |
| **Concurrency limiting** | LLM calls are capped at 3 concurrent requests to prevent rate limiting. Non-LLM nodes run with unlimited concurrency. |
| **Retry with exponential backoff** | `llmNode`, `actionNode`, and `outputNode` types retry up to 3 times with exponential backoff (1s base, 16s max) plus jitter. |
| **Cancellation** | Pass an `AbortController` signal to cancel a running workflow. Pending nodes are marked as skipped. |
| **Throttled progress** | Progress callbacks are coalesced to ~60ms intervals to prevent React re-render thrashing during parallel execution. |
| **Token and cost tracking** | Tracks input/output token counts per node and estimates cost using model-specific pricing tables. |
| **Condition branching** | `conditionNode` evaluates its expression and skips the untaken branch entirely (cascading to all downstream nodes). |
| **Prompt template interpolation** | Use `{{nodeId.output}}` or `{{nodeId}}` in LLM system prompts to reference upstream node outputs. |

### Condition Expressions

The `conditionNode` supports several expression formats:

| Expression | Evaluates |
|------------|-----------|
| `contains "keyword"` | Input text includes the keyword |
| `length > 100` | Input text length comparison (`>`, `<`, `>=`, `<=`, `==`) |
| `true` / `yes` / `pass` | Always passes |
| `false` / `no` / `fail` | Always fails |
| `score > 80` | Extracts the last number from input and compares |
| *(empty)* | Passes if input is non-empty |

### Programmatic Usage

```ts
import {
  validateWorkflow,
  createExecution,
  executeWorkflow,
  getExecutionOrder,
} from "@supra/builder";

// Validate before running
const { valid, errors } = validateWorkflow(nodes, edges);
if (!valid) {
  console.error("Validation errors:", errors);
  return;
}

// Create execution plan
const execution = createExecution(nodes, edges);

// Run with cancellation support
const controller = new AbortController();
const result = await executeWorkflow(
  execution,
  nodes,
  edges,
  apiKey,
  (progress) => console.log("Progress:", progress.status),
  onLLMExecute,
  controller.signal,
);

console.log("Total cost:", result.totalTokens?.cost);
```

---

## AI Integration

The builder supports two AI integration points, both implemented as callback props so you control the API calls.

### Flow Chat (`onChat`)

The AI chat panel lets users describe workflow changes in natural language. The builder passes the current canvas state to your handler, and your handler returns updated nodes/edges.

```tsx
import type { FlowChatHandler } from "@supra/builder";

const handleChat: FlowChatHandler = async (req) => {
  // req contains:
  //   apiKey: string
  //   message: string (user's chat message)
  //   currentNodes: Node[]
  //   currentEdges: Edge[]
  //   canvasSummary?: string
  //   category: string
  //   history: { role: string; content: string }[]

  const response = await callYourAI(req);

  return {
    message: "I added two LLM nodes to your workflow.",
    flowUpdate: {
      nodes: response.nodes,
      edges: response.edges,
    },
    // Optionally suggest saving as a template:
    // saveAsTemplate: { name: "My Template", description: "..." },
  };
};

<WorkflowBuilder onChat={handleChat} apiKey="sk-..." showAIChat />
```

### LLM Execution (`onLLMExecute`)

When the workflow engine encounters an `llmNode` with provider `"claude"` or `"claude-code"`, it calls your `onLLMExecute` handler. This keeps API keys and network calls in your application layer.

```tsx
import type { LLMExecuteHandler } from "@supra/builder";

const handleLLMExecute: LLMExecuteHandler = async (req) => {
  // req contains:
  //   apiKey: string
  //   systemPrompt: string
  //   userMessage: string
  //   temperature: number
  //   maxTokens: number
  //   model?: string

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": req.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: req.model || "claude-sonnet-4-5-20250514",
      max_tokens: req.maxTokens,
      temperature: req.temperature,
      system: req.systemPrompt,
      messages: [{ role: "user", content: req.userMessage }],
    }),
  });

  const data = await response.json();
  return {
    content: data.content[0].text,
    // Optionally include usage for cost tracking:
    // usage: { input_tokens: data.usage.input_tokens, output_tokens: data.usage.output_tokens },
  };
};

<WorkflowBuilder onLLMExecute={handleLLMExecute} apiKey="sk-..." />
```

---

## Canvas Features

- **Snap-to-grid** -- 20px grid snapping for precise node placement.
- **Alignment guides** -- Visual guides when nodes align horizontally or vertically.
- **Undo/redo** -- 50-step history with 300ms debounce. Triggered via toolbar or keyboard shortcuts.
- **Copy/paste** -- Copies selected nodes with smart ID remapping to avoid collisions.
- **Node grouping** -- Select multiple nodes and group them. Groups can be locked/unlocked.
- **Right-click context menu** -- Context-sensitive actions for nodes (duplicate, delete, group, etc.).
- **Minimap** -- Overview minimap for navigating large workflows.
- **Background grid** -- Dot grid background for spatial orientation.
- **Executing node highlight** -- Nodes pulse with a highlight animation while running.
- **Auto-layout** -- Automatic graph layout when loading templates (can be disabled via `disableAutoLayout`).

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo |
| `Delete` / `Backspace` | Delete selected nodes |
| `Ctrl+C` / `Cmd+C` | Copy selected nodes |
| `Ctrl+V` / `Cmd+V` | Paste copied nodes |

---

## Persistence and Workspaces

The builder persists state to localStorage using the `storageKeyPrefix` prop.

- **Workspaces** -- Create, switch, rename, duplicate, and delete independent workspaces. Each workspace stores its own nodes and edges.
- **Templates** -- Built-in templates are available out of the box. Users can save custom templates and star favorites.
- **JSON import/export** -- Workflows can be exported as JSON files and imported back. Use `onExport` and `onImport` callbacks to hook into this flow.

### Workspace API

For advanced use cases, workspace functions are exported directly:

```ts
import {
  getWorkspaces,
  createWorkspace,
  saveWorkspace,
  loadWorkspace,
  deleteWorkspace,
  duplicateWorkspace,
  renameWorkspace,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
} from "@supra/builder";
```

---

## Customization

### Custom Node Types

Register your own node types alongside the built-in 14:

```tsx
import { WorkflowBuilder } from "@supra/builder";
import { Handle, Position } from "@xyflow/react";

function DatabaseNode({ data }: { data: { label: string; query: string } }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <Handle type="target" position={Position.Top} />
      <div className="font-medium">{data.label}</div>
      <pre className="mt-2 text-xs text-gray-500">{data.query}</pre>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

<WorkflowBuilder
  customNodeTypes={{
    databaseNode: DatabaseNode,
  }}
  initialNodes={[
    {
      id: "db-1",
      type: "databaseNode",
      position: { x: 300, y: 200 },
      data: { label: "Fetch Users", query: "SELECT * FROM users" },
    },
  ]}
/>
```

### Sub-Components

For full control over layout and composition, individual sub-components are exported:

```ts
import {
  FlowCanvas,
  NodePalette,
  NodeInspector,
  TemplateSidebar,
  TemplateManager,
  WorkspaceManager,
  AIFlowChat,
  NodeContextMenu,
} from "@supra/builder";
```

### Hooks

Reusable hooks for building custom canvas experiences:

```ts
import {
  useUndoRedo,
  useClipboard,
  useNodeGroups,
} from "@supra/builder";
```

### CSS Theming

Import the base stylesheet and override CSS custom properties defined in `styles.css`:

```tsx
import "@supra/builder/styles.css";
```

The builder uses Tailwind CSS 4 utility classes internally. You can pass a `className` prop to the root component for additional styling.

---

## Examples

### Building a Simple LLM Pipeline

A three-step pipeline: trigger, prompt an LLM, and log the output.

```tsx
import { WorkflowBuilder } from "@supra/builder";
import type { LLMExecuteHandler } from "@supra/builder";
import "@supra/builder/styles.css";

const handleLLMExecute: LLMExecuteHandler = async (req) => {
  const res = await fetch("/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return res.json();
};

const nodes = [
  {
    id: "trigger-1",
    type: "triggerNode",
    position: { x: 300, y: 50 },
    data: { label: "Start", triggerType: "manual", config: "Analyze the latest user feedback" },
  },
  {
    id: "llm-1",
    type: "llmNode",
    position: { x: 300, y: 200 },
    data: {
      label: "Summarize Feedback",
      provider: "claude",
      model: "claude-sonnet-4-5-20250514",
      systemPrompt: "You are a product analyst. Summarize the key themes from the following user feedback.",
      temperature: 0.5,
      maxTokens: 1024,
    },
  },
  {
    id: "output-1",
    type: "outputNode",
    position: { x: 300, y: 400 },
    data: { label: "Log Summary", outputType: "log", destination: "" },
  },
];

const edges = [
  { id: "e1", source: "trigger-1", target: "llm-1" },
  { id: "e2", source: "llm-1", target: "output-1" },
];

export default function FeedbackPipeline() {
  return (
    <WorkflowBuilder
      initialNodes={nodes}
      initialEdges={edges}
      onLLMExecute={handleLLMExecute}
      apiKey={process.env.NEXT_PUBLIC_ANTHROPIC_KEY}
      title="Feedback Pipeline"
      subtitle="Trigger -> LLM -> Output"
      showStartScreen={false}
    />
  );
}
```

### Branching with Conditions

Use `conditionNode` to route execution based on upstream output. Reference upstream outputs in LLM prompts with `{{nodeId.output}}` or `{{nodeId}}`:

```tsx
const nodes = [
  {
    id: "trigger",
    type: "triggerNode",
    position: { x: 300, y: 0 },
    data: { label: "Input", triggerType: "manual", config: "Score: 85" },
  },
  {
    id: "check",
    type: "conditionNode",
    position: { x: 300, y: 150 },
    data: { label: "Score Check", condition: "score > 70" },
  },
  {
    id: "pass-llm",
    type: "llmNode",
    position: { x: 100, y: 350 },
    data: {
      label: "Generate Report",
      provider: "claude",
      model: "claude-sonnet-4-5-20250514",
      systemPrompt: "Based on this passing result: {{trigger.output}}, write a brief success report.",
      temperature: 0.7,
      maxTokens: 512,
    },
  },
  {
    id: "fail-output",
    type: "outputNode",
    position: { x: 500, y: 350 },
    data: { label: "Needs Improvement", outputType: "notify", destination: "" },
  },
];

const edges = [
  { id: "e1", source: "trigger", target: "check" },
  { id: "e2", source: "check", target: "pass-llm", sourceHandle: "true" },
  { id: "e3", source: "check", target: "fail-output", sourceHandle: "false" },
];
```

---

## Exports

### Main Component

- `WorkflowBuilder` -- The primary component. Drop it in and go.

### Types

All TypeScript types are exported for use in your application:

`WorkflowBuilderProps`, `WorkflowExecution`, `WorkflowStepResult`, `FlowChatRequest`, `FlowChatResponse`, `LLMExecuteRequest`, `LLMExecuteResponse`, `FlowChatHandler`, `LLMExecuteHandler`, `FlowTemplate`, `Workspace`, `BuilderTemplate`, `BuilderTemplateSource`

Node data types: `TriggerNodeData`, `LLMNodeData`, `ConditionNodeData`, `TransformNodeData`, `OutputNodeData`, `ActionNodeData`, `PersonaNodeData`, `AppNodeData`, `CompetitorNodeData`, `ConsensusNodeData`, `AffinityCategoryNodeData`, `NoteNodeData`, `StepNodeData`, `ConfigNodeData`, `ConfigNodeSection`

### Sub-Components

`FlowCanvas`, `NodePalette`, `NodeInspector`, `TemplateSidebar`, `TemplateManager`, `WorkspaceManager`, `AIFlowChat`, `NodeContextMenu`

### Individual Node Components

`TriggerNode`, `LLMNode`, `ConditionNode`, `TransformNode`, `OutputNode`, `ActionNode`, `PersonaNode`, `AppNode`, `CompetitorNode`, `ConsensusNode`, `AffinityCategoryNode`, `NoteNode`, `StepNode`, `ConfigNode`

### Hooks

`useUndoRedo`, `useClipboard`, `useNodeGroups`

### Engine Functions

`validateWorkflow`, `createExecution`, `executeWorkflow`, `getExecutionOrder`

### Template and Workspace Utilities

`BUILT_IN_TEMPLATES`, `getCustomTemplates`, `saveCustomTemplate`, `deleteCustomTemplate`, `getAllTemplates`, `getTemplatesByCategory`, `copyTemplate`, `getStarredTemplateIds`, `toggleStarTemplate`, `isTemplateStarred`

`getWorkspaces`, `createWorkspace`, `saveWorkspace`, `loadWorkspace`, `deleteWorkspace`, `duplicateWorkspace`, `renameWorkspace`, `getActiveWorkspaceId`, `setActiveWorkspaceId`

### Layout

`autoLayout`

---

## License

See the root repository for license information.
