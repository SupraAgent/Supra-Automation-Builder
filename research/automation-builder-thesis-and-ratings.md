# Visual AI Automation Builder — Thesis & Core Function Ratings

**CPO Panel:** Figma (Builder UX) + n8n (Automation) + Perplexity (AI Intelligence)
**Date:** 2026-03-27
**Formula:** Figma (builder UX) + n8n (automation) + Perplexity (AI intelligence) = Visual AI Automation Builder

---

## SECTION 1: REWRITTEN THESIS

### What Is This Product?

**SupraLoop Automation Builder** is a Figma-grade drag-and-drop IDE for designing, executing, and observing AI-powered automation workflows. It combines three DNA layers: (1) a **Figma-quality canvas UX** with magnetic snapping, distributed alignment, and spatial design affordances that make complex workflows feel approachable; (2) an **n8n-style automation engine** with topological sort execution, multi-provider LLM support, structured data flow between nodes, and retry-with-backoff reliability; and (3) a **Perplexity-inspired knowledge layer** that brings real-time data retrieval, citation-backed reasoning, and grounded answers into every workflow. The product ships workflows as live API endpoints with built-in credential management, execution logging, and team observability — eliminating the infrastructure burden that makes competitors inaccessible to non-technical users.

### Who Is It For?

1. **Product managers and non-technical founders** who want to automate decision-making workflows (scoring frameworks, competitive analysis, research synthesis) without touching code.
2. **No-code automation power users** currently trapped in Zapier/Make who need AI agents, custom node logic, and transparent execution tracing.
3. **Enterprise GTM teams** who need to orchestrate multi-step sales processes, customer research pipelines, and compliance-auditable automations with cited sources.
4. **AI researcher teams** building agentic RAG systems and need a visual IDE to iterate on multi-turn reasoning, tool calling, and delegation patterns.

### Competitive Positioning

| vs. | Advantage | Risk |
|-----|-----------|------|
| **Zapier** | Simpler UX for visual workflows, native AI agents (not bolted-on), 10x cheaper per run | Smaller integration library at launch (15-25 vs 400+); unproven team scaling |
| **Make/Integromat** | Better canvas UX, real-time streaming visualization, structured data flow | More complex to self-host; pay-per-run vs subscription pricing still unproven |
| **n8n** | 2-3x better builder UX, AI-native from ground up, knowledge layer | Can't match 400+ integrations in year 1; open-source adoption harder vs managed SaaS |
| **Flowise** | Broader app integrations beyond LLM chains, Figma-grade UX, deployment targets | Flowise targets data scientists; this targets non-technical users and GTM teams |
| **CrewAI + AMP** | Multi-step reasoning with better agent-to-agent delegation, citation tracking, Figma-level polish on canvas | CrewAI's strength is framework; SupraLoop's is IDE. Different markets (DevTools vs Product) |

### Three DNA Layers and How They Combine

**Layer 1: Builder UX (Figma DNA)**
- Magnetic snap-to-grid alignment (nodes physically snap, not just guides)
- Distribute evenly (horizontal/vertical spacing of selected or all nodes)
- SVG thumbnails of each canvas on start screen (visual, not text list)
- Undo/redo with history stack
- Drag-drop node palette with real-time search
- Node inspector sidebar for field editing
- Color-coded node groups for semantic organization
- This layer makes complex automations feel *spatial* and *playful*, not overwhelming.

**Layer 2: Automation Engine (n8n DNA)**
- Topological sort execution (respects visual chain order)
- Parallel execution of independent branches with concurrency limiter
- Retry with exponential backoff (3 attempts, 1-16s delays) for reliability
- Structured data flow via `ctx.structured` map (JSON between nodes, not just text)
- Prompt template interpolation (`{{nodeId.output}}` in LLM prompts)
- Token/cost tracking with model-specific pricing
- Multi-provider LLM support (Claude, Claude Code agent mode, Ollama, custom)
- Trigger system (manual, schedule, webhook, event)
- This layer makes automations *reliable*, *observable*, and *cost-aware*.

**Layer 3: Knowledge Integration (Perplexity DNA)**
- Real-time data retrieval nodes that synthesize answers from multiple sources
- Citation chains as audit trail ("decision based on fact X from source Y")
- Structured + natural-language output from every knowledge node (JSON + cited text)
- Multi-source reconciliation (when sources conflict, confidence scoring)
- Agent access to live data during agentic loops (agents reason with fresh data, not stale snapshots)
- This layer makes automations *trustworthy*, *accountable*, and *intelligent*.

**How They Combine:**
A user builds a workflow visually (Layer 1), connects nodes that execute in topological order with structured data flow (Layer 2), and uses knowledge nodes to fetch live data with citations (Layer 3). The result: a deployment-ready automation that a CEO can verify ("I can see where each decision came from") and a developer can debug ("I can trace data between nodes and see token costs").

### Phased Roadmap

**Phase 1 (v1 Launch): "Design & Execute"**
- Ship the canvas, 14 node types, execution engine, and LLM support.
- Add 15 pre-built app integrations (Slack, Notion, Airtable, GitHub, Stripe, Gmail, Google Sheets, HubSpot, Sendgrid, Discord, Linear, Typeform, Supabase, Twitter, Zapier webhook bridge).
- Deploy workflows as live `/api/execute/{workflowId}` endpoints (lightweight Node.js runtime).
- Persistent data store per workflow (Supabase key-value table for cross-execution state).
- Encrypted credential vault with OAuth token refresh.
- Execution history and comparison view.
- **Target GTM:** "AI workflows for sales and product teams. Design once, ship instantly."

**Phase 2 (v2 Differentiate): "Knowledge + Agency"**
- Add Perplexity-style knowledge nodes: Web Search, API Search (multi-source), Document Search (RAG).
- Implement multi-turn agent loop with tool_use (agents call other nodes as tools, observe, reason again).
- Human-in-the-loop approval gates with cited evidence.
- Variable inspector for debugging (expandable JSON viewer during execution).
- Per-node execution timing and performance profiling.
- Agent delegation (one agent delegates to another based on capability/capacity).
- **Target GTM:** "AI agents you can actually trust. Audit every decision."

**Phase 3 (v3 Scale): "Multiplayer + Marketplace"**
- Multiplayer canvas with Liveblocks (presence, cursors, comments, real-time collaboration).
- Team management, RBAC (role-based access), audit logs.
- Community node marketplace (users share custom nodes, integrations, templates).
- Version control for workflows (branching, diff, rollback).
- Self-host option (Docker, on-prem, VPC deployment).
- **Target GTM:** "Slack for automation. Entire teams collaborate on workflows they trust."

---

## SECTION 2: 30 CORE FUNCTIONS — RATED

| Rank | Function | Category | Description | Importance | Current App | Gap |
|------|----------|----------|-------------|-----------|------------|-----|
| 1 | Visual workflow canvas | Builder UX | Drag-and-drop node editor with panning, zooming, visual connections | 99 | 88 | 11 |
| 2 | Topological sort execution engine | Automation | Execute nodes in dependency order, respecting visual chain | 98 | 92 | 6 |
| 3 | Multi-provider LLM node | AI Intelligence | Claude, Claude Code, Ollama, custom endpoint support with streaming | 98 | 85 | 13 |
| 4 | Trigger system (manual/schedule/webhook) | Automation | Entry point for workflows; support for cron, webhooks, events | 97 | 45 | 52 |
| 5 | Instant workflow deployment | Automation | Every workflow becomes a live API endpoint (not just in-browser) | 96 | 10 | 86 |
| 6 | Credential vault (encrypted) | Cross-cutting | AES-GCM encrypted storage for API keys, OAuth tokens | 95 | 78 | 17 |
| 7 | Structured data flow between nodes | Automation | JSON passing via ctx.structured, not just text strings | 94 | 80 | 14 |
| 8 | Retry with exponential backoff | Automation | 3 retries, 1-16s delays, jitter to prevent thundering herd | 93 | 90 | 3 |
| 9 | Magnetic snap-to-grid alignment | Builder UX | Nodes physically snap to grid positions, not just visual guides | 92 | 85 | 7 |
| 10 | Execution history & comparison | Observability | Last 20 runs, side-by-side diff (tokens, cost, status) | 91 | 82 | 9 |
| 11 | Pre-built app integrations (15+) | Automation | Slack, Notion, Airtable, GitHub, Stripe, Gmail, etc. | 91 | 5 | 86 |
| 12 | HTTP/REST API node | Automation | Generic call any REST or GraphQL endpoint with auth | 89 | 25 | 64 |
| 13 | Prompt template interpolation | AI Intelligence | {{nodeId.output}} in LLM prompts to chain responses | 88 | 92 | -4 |
| 14 | Token usage tracking & cost estimation | Observability | Per-run token count, cost per model, cumulative spend | 87 | 88 | -1 |
| 15 | Distribute nodes evenly (layout) | Builder UX | Horizontal/vertical spacing of selected or all nodes | 86 | 85 | 1 |
| 16 | Database connectors (Postgres/MySQL/MongoDB) | Automation | Native connectors to popular databases, CRUD operations | 85 | 0 | 85 |
| 17 | Condition branching (if/then/else) | Automation | Split execution path based on upstream output | 85 | 78 | 7 |
| 18 | Real-time execution monitoring | Observability | Watch nodes execute, highlight running nodes, stream output | 84 | 80 | 4 |
| 19 | Persistent workflow state (storage adapter) | Cross-cutting | Pluggable persistence via StorageAdapter interface — localStorage default, Supabase/S3/filesystem injected by host app | 84 | 0 | 84 |
| 20 | Claude Code agent mode (tool use) | AI Intelligence | Agent can call other nodes as tools, multi-turn reasoning | 83 | 25 | 58 |
| 21 | Undo/redo with history | Builder UX | Full history stack, restore previous canvas state | 82 | 90 | -8 |
| 22 | Transform nodes (map/filter/merge/extract) | Automation | Data transformation operations on structured data | 81 | 75 | 6 |
| 23 | Template gallery (save/load/star) | Builder UX | Pre-built workflows users can fork; save custom templates | 80 | 85 | -5 |
| 24 | Workspace manager (multiple canvases) | Builder UX | Multiple independent workflows per session, switch between them | 79 | 80 | -1 |
| 25 | Canvas thumbnails (visual preview) | Builder UX | SVG thumbnail of each canvas on start screen | 78 | 85 | -7 |
| 26 | Builder AI chat (natural language to flow) | AI Intelligence | "Create a trigger" → AI generates flow nodes | 77 | 70 | 7 |
| 27 | OAuth credential management | Cross-cutting | Token refresh, multi-account support, per-node binding | 76 | 25 | 51 |
| 28 | Custom user-defined nodes | Builder UX | Users create custom node types via chat or editor | 75 | 60 | 15 |
| 29 | Weighted consensus voting | Domain | ConsensusNode computes weighted average of persona votes | 74 | 85 | -11 |
| 30 | Node library search & discovery | Builder UX | Searchable node palette, organized by category | 72 | 70 | 2 |

---

## TOP 5 BIGGEST GAPS

| Gap | Importance | Current | Gap Score | What Needs to Be Built |
|-----|-----------|---------|-----------|------------------------|
| **1. Instant Workflow Deployment** | 96 | 10 | 86 | Workflows need to be deployable as live endpoints. Currently browser-only. Ship lightweight Node.js runtime with `POST /api/execute/{workflowId}` endpoints. This is the single most critical blocker — without deployment, the tool is a prototype, not a platform. |
| **2. Pre-built App Integrations** | 91 | 5 | 86 | Launch with 15 critical connectors: Slack, Notion, Airtable, GitHub, Stripe, Gmail, Google Sheets, HubSpot, etc. Each is a React component wrapping HTTP + OAuth. Without pre-built nodes, users must write custom HTTP requests for every app — kills adoption. |
| **3. Database Connectors** | 85 | 0 | 85 | Connect to Postgres, MySQL, MongoDB, Supabase directly. Native CRUD operations with parameter binding and error handling. Unlocks workflows that query user databases and take action. |
| **4. Persistent Data Storage (Storage Adapter)** | 84 | 0 | 84 | Workflows are stateless. Define a `StorageAdapter` interface in the builder package (self-contained), ship with localStorage/IndexedDB default. Host app injects Supabase, S3/R2, or filesystem adapters. User picks backend on setup. Enables cross-execution state without breaking builder portability. |
| **5. HTTP/REST API Node (real execution)** | 89 | 25 | 64 | Output node type exists with "api" type, but doesn't execute real HTTP calls with auth headers, body formatting, and response parsing. Needs full REST client implementation. |

---

## TOP 5 STRONGEST AREAS

| Strength | Importance | Current | Gap | What's Good |
|----------|-----------|---------|-----|------------|
| **1. Topological Sort Execution** | 98 | 92 | 6 | Kahn's algorithm correctly resolves execution order. Parallel execution with concurrency limiter (MAX=3 LLM) prevents rate limits. Eager dependency-graph executor. Production-ready. |
| **2. Retry & Backoff Logic** | 93 | 90 | 3 | 3 retries, 1-16s exponential delays with jitter. Human-readable error messages (401, 429, 403, timeout, billing). Better than most competitors. |
| **3. Prompt Interpolation** | 88 | 92 | -4 | `{{nodeId.output}}` syntax works flawlessly. Structured data path via ctx.structured also works. Enables real LLM chains. Complete. |
| **4. Visual Workflow Canvas** | 99 | 88 | 11 | Magnetic snap, distribute evenly, SVG thumbnails, undo/redo, node context menu — Figma-grade touches that compound. Only missing smart spacing indicators. |
| **5. Token Usage Tracking** | 87 | 88 | -1 | Per-run token count, cost per model (Claude-specific pricing), cumulative spend display. Cost-aware execution out of the box. Complete. |

---

## OVERALL READINESS SCORE: 58/100

**Calculation:** Weighted average of Current App scores by Importance scores.

**Interpretation:**
- Canvas + execution engine + LLM support are solid (75-92/100 individually)
- Deployment, integrations, and data persistence are missing entirely (0-25/100)
- Credential management is good but OAuth is incomplete (78/100 vs 95 importance)
- To reach 75/100 (credible launch): must ship deployment targets, 15 app integrations, persistent data store, OAuth refresh, and variable inspector

---

## ARCHITECTURE: SELF-CONTAINED PERSISTENCE (Storage Adapter Pattern)

### Constraint

`@supra/builder` must remain **100% self-contained** — zero external dependencies. It can be forked, embedded in other apps, or used standalone. Persistence cannot depend on Supabase, Postgres, or any external service directly.

### Solution: StorageAdapter Interface

The builder defines an interface. Host apps inject implementations. This follows the same pattern already used for `onChat` and `onLLMExecute`.

```typescript
// Builder exports this — no external deps
interface StorageAdapter {
  saveWorkflow(snap: WorkflowSnapshot): Promise<void>;
  loadWorkflow(id: string): Promise<WorkflowSnapshot | null>;
  listWorkflows(): Promise<WorkflowSnapshot[]>;
  saveExecution(exec: ExecutionRecord): Promise<void>;
  listExecutions(workflowId: string): Promise<ExecutionRecord[]>;
  saveContext(workflowId: string, ctx: Record<string, unknown>): Promise<void>;
  loadContext(workflowId: string): Promise<Record<string, unknown> | null>;
}
```

### Available Backends (user picks on setup)

| Backend | Where data lives | Best for | Builder dependency |
|---------|-----------------|----------|-------------------|
| **localStorage** (default) | Browser | Solo users, quick start, offline | None — ships with builder |
| **IndexedDB** | Browser | Large workflows, binary data | None — ships with builder |
| **Supabase** | Cloud DB | Teams, cross-device sync | Host app provides adapter |
| **Cloud storage (S3/R2/GCS)** | Object storage | Large workflows, file-heavy automations | Host app provides adapter |
| **File system** | Local disk / GitHub repo | Self-hosted, CLI, version-controlled | Host app provides adapter |
| **Custom** | Anything | Enterprise (own DB, compliance) | Host app provides adapter |

### How the host app (SupraLoop) uses this

1. **Default (no config):** Builder uses `LocalStorageAdapter` — works out of the box
2. **User connects Supabase:** Host app creates `SupabaseAdapter`, passes as prop
3. **User picks cloud storage:** Host app creates `S3Adapter` or `R2Adapter`, passes as prop
4. **Graceful degradation:** If adapter fails, builder falls back to localStorage with a warning banner

```typescript
// Host app (src/app/builder/page.tsx)
<WorkflowBuilder
  storageAdapter={userPickedSupabase ? new SupabaseAdapter(supabaseClient) : undefined}
  // undefined = localStorage default
/>
```

### Key files to create/modify

| File | Change |
|------|--------|
| `packages/builder/src/lib/storage-adapter.ts` | NEW — interface + MemoryAdapter + LocalStorageAdapter |
| `packages/builder/src/types.ts` | Add `storageAdapter?` prop |
| `packages/builder/src/index.ts` | Export StorageAdapter types |
| `src/lib/supabase-adapter.ts` | NEW — host app's Supabase implementation |
| `src/lib/s3-adapter.ts` | NEW — host app's cloud storage implementation |

---

## CRITICAL PATH TO LAUNCH

1. **Weeks 1-4: Deployment Runtime** — Lightweight Node.js backend, express endpoints, node-cron, webhook listeners
2. **Weeks 5-10: Pre-Built Integrations** — 15 connectors (Slack, Notion, Airtable, GitHub, Stripe, Gmail, Google Sheets first)
3. **Weeks 6-9 (parallel): Storage Adapter + Data Persistence** — StorageAdapter interface, LocalStorageAdapter, SupabaseAdapter, S3Adapter, cross-execution state
4. **Weeks 11-14 (parallel): OAuth & Observability** — Token refresh, per-node credential binding, variable inspector
5. **Weeks 15-16: Polish & Testing** — End-to-end testing, performance testing, security audit, onboarding

**Target:** 75/100 readiness = credible v1 launch
