# BUILD PLAN: Visual AI Automation Builder
**SupraLoop Automation Builder — Phase 1 Launch (v1)**

**Date:** March 27, 2026  
**Current Readiness:** 58/100  
**Target Launch Readiness:** 75/100  
**Estimated Timeline:** 16 weeks with 4-person team (2 builders, 1 backend, 1 devops)

---

## EXECUTIVE SUMMARY

The builder is **70% complete for canvas/design** (magnetic snap, undo/redo, 14 node types, topological sort execution engine) but **only 20% complete for production deployment**. The product today is a sophisticated prototype; the goal of this build plan is to ship a platform.

**The critical path to launch is:**
1. **Deployment runtime** (workflows become live endpoints)
2. **Pre-built app integrations** (15 connectors: Slack, Notion, Airtable, GitHub, Stripe, etc.)
3. **Storage adapter + persistence** (cross-execution state, data stores)
4. **OAuth credential management** (token refresh, multi-account support)
5. **Observability layer** (variable inspector, error traces, per-node timing)

All 5 are blocking; none can be deferred without losing credibility at launch.

---

## PART 1: BUILD PHASES

### PHASE 1A: Deployment Runtime (Weeks 1–4)
**Objective:** Every workflow becomes a live, callable API endpoint.

**What ships:**
- Lightweight Node.js execution runtime
- `/api/execute/{workflowId}` endpoints with request/response interface
- Cron trigger support (node-cron + scheduling backend)
- Webhook listener infrastructure
- Manual trigger queuing
- Error logging and retry persistence

**Self-contained:** Builder stays pure React; all execution happens in host app backend.

---

### PHASE 1B: Pre-Built App Integrations (Weeks 5–10, parallel with 1A from week 5)
**Objective:** Users don't write HTTP calls; they pick apps from a palette.

**What ships:**
- 15 pre-built connector node types (each is a React component + HTTP wrapper)
- OAuth flow for each connector requiring it (Slack, GitHub, Google, Stripe, etc.)
- Credential binding UI (assign API key to node field)
- Built-in templates showcasing each connector
- Connector library structure ready for expansion post-launch

**Apps in scope for v1:**
1. Slack (post message, update status, read channels)
2. Notion (read/write database, create pages)
3. Airtable (CRUD records, create views)
4. GitHub (create issue, post comment, list commits)
5. Stripe (create charge, list invoices, update subscription)
6. Gmail (send email, read messages)
7. Google Sheets (append row, read range, create sheet)
8. SendGrid (send email, manage contacts)
9. HubSpot (create contact, update deal, list companies)
10. Discord (send message, create webhook)
11. Linear (create issue, update status, list projects)
12. Typeform (get responses, list forms)
13. Supabase (query database, insert rows)
14. Twitter/X (post tweet, read replies)
15. Zapier webhook bridge (call Zapier workflows, receive webhooks)

---

### PHASE 1C: Storage Adapter + Data Persistence (Weeks 6–9, parallel)
**Objective:** Workflows can read/write state across executions.

**What ships:**
- `StorageAdapter` interface in builder (pluggable, no external dependencies)
- `LocalStorageAdapter` default implementation (browser-based for solo users)
- `IndexedDBAdapter` for large workflows
- Host app: `SupabaseAdapter` implementation
- Host app: `S3/R2Adapter` for cloud storage
- Data Store node type (read/write workflow-scoped key-value or table)
- Persistent execution history (all runs, not just last 20)
- Cross-execution context (e.g., "save this user ID, use it in next run")

**Architecture is self-contained:** Builder exports interface; host app injects concrete implementations.

---

### PHASE 1D: OAuth & Credential Management (Weeks 8–11, parallel)
**Objective:** Credentials are secure, reusable, and support token refresh.

**What ships:**
- Enhanced credential vault (AES-GCM encryption already exists, extend to support)
- OAuth flow handler (authorization code grant for each connector)
- Token refresh logic (background refresh of expired tokens)
- Multi-account support (user can connect multiple Slack workspaces, GitHub orgs, etc.)
- Per-node credential binding (each node instance can use different credentials)
- Credential UI in node inspector (pick/add credential for each field)

**Scope for v1:**
- Standard OAuth 2.0 flow
- No OIDC/SAML (enterprise later)
- Token refresh via cron (check expiry on each execution, refresh if needed)

---

### PHASE 1E: Observability & Debugging (Weeks 10–14, parallel)
**Objective:** Users can understand what happened in each execution.

**What ships:**
- **Variable Inspector:** Expandable JSON viewer of `ctx` and `ctx.structured` during execution
- **Error Trace:** Full stack trace with node IDs and step numbers on failure
- **Per-Node Timing:** Execution time per node, highlight slow nodes in execution panel
- **Logging Level Control:** Verbose/info/warn/error per execution
- **Execution Diff Viewer:** Compare two runs side-by-side (already exists, enhance with variable diff)

**Scope for v1:**
- Real-time execution view (highlight running nodes, stream logs)
- Post-execution debugging (inspect variables after completed run)
- No step-through debugger yet (deferred to v2)

---

### PHASE 1F: Multi-Turn Agent Mode with Tool Use (Weeks 11–14, parallel)
**Objective:** Claude agents can call other nodes as tools and reason with fresh data.

**What ships:**
- Claude tool_use protocol implementation (agent calls `tools.call_node({nodeId, inputs})`)
- Expose all upstream nodes as callable tools (transforms, outputs, database reads, API calls)
- Multi-turn reasoning loop (agent.reason → call_tool → observe → reason again)
- Streaming of reasoning steps (render thoughts as they arrive in execution panel)
- Agent context persistence per execution

**Scope for v1:**
- Claude models only (claude-opus, claude-sonnet)
- Max 5 tool calls per turn (prevent runaway loops)
- Tool results must be < 10KB (prevent context explosion)

---

### PHASE 1G: Polish & Testing (Weeks 14–16)
**Objective:** Ship a credible, reliable v1.

**What ships:**
- End-to-end testing (critical user journeys: design → deploy → execute → monitor)
- Load testing (concurrent executions, token limit handling, rate limiting)
- Security audit (credential encryption, OAuth flow validation, API auth)
- Documentation (API reference, node library docs, getting started guide)
- Onboarding flow (first-time user walkthrough, template gallery improvements)
- Bug fixes from testing phases
- Performance optimization (execution latency, canvas rendering, API response times)

---

## PART 2: DETAILED TASK BREAKDOWN

### PHASE 1A: DEPLOYMENT RUNTIME (Weeks 1–4)

---

#### **Task 1A.1: Create Deployment Runtime API Structure**
**Files to create/modify:**
- `src/app/api/workflows/route.ts` (NEW) — List workflows, create, delete, get metadata
- `src/app/api/workflows/[workflowId]/route.ts` (NEW) — Get workflow, update metadata
- `src/app/api/workflows/[workflowId]/execute/route.ts` (NEW) — Trigger execution (POST with payload)
- `src/app/api/workflows/[workflowId]/executions/route.ts` (NEW) — List past executions
- `src/app/api/workflows/[workflowId]/executions/[executionId]/route.ts` (NEW) — Get execution details
- `src/lib/workflow-runtime.ts` (NEW) — Execution engine for backend (independent of builder)
- `src/lib/deployment-scheduler.ts` (NEW) — Cron + trigger lifecycle management

**What it does:**
Defines REST API endpoints that accept workflow definition (nodes + edges), execute them on backend, track execution history, and return results. Decouples execution logic from React component lifecycle.

**Dependencies:** Builder canvas (workflows must be designable first), types.ts

**Complexity:** L (16-24 hours)

**DNA layer:** Automation (execution runtime)

---

#### **Task 1A.2: Implement Backend Execution Engine**
**Files to create/modify:**
- `src/lib/backend-workflow-executor.ts` (NEW) — Execute workflow nodes on server side
- Copy and adapt `packages/builder/src/lib/workflow-engine.ts` logic to backend
- `src/lib/http-node-executor.ts` (NEW) — Execute HTTP/REST calls with full auth
- `src/lib/transform-node-executor.ts` (NEW) — Execute transform nodes (map/filter/merge)
- `src/lib/llm-node-executor.ts` (NEW) — Execute LLM calls server-side (avoid client-side API key exposure)

**What it does:**
Topological sort, parallel execution, retry logic, token tracking — all running server-side. Mirrors builder's in-browser engine but with backend capabilities (access to credentials, real HTTP calls, database queries).

**Dependencies:** Task 1A.1, workflow-engine.ts logic, Anthropic SDK

**Complexity:** L (20-24 hours)

**DNA layer:** Automation (core execution)

---

#### **Task 1A.3: Cron & Trigger Scheduler**
**Files to create/modify:**
- `src/lib/deployment-scheduler.ts` (NEW) — Wrapper around node-cron + job queue
- `src/app/api/workflows/[workflowId]/triggers/route.ts` (NEW) — Update/view trigger config
- `src/lib/trigger-validator.ts` (NEW) — Validate cron syntax, webhook URLs, event types
- `src/cron/job-runner.ts` (NEW) — Long-running process that executes scheduled jobs

**What it does:**
Parses cron expressions from TriggerNode config, schedules execution on node-cron, executes callback via Task 1A.1 endpoint. Supports:
- Cron (e.g., `0 9 * * MON` = 9 AM every Monday)
- Webhook URLs (listen for POST, trigger execution)
- Manual trigger (user clicks "Run" in UI)
- Event-based (e.g., "on Slack message")

**Dependencies:** Task 1A.1, Task 1A.2, node-cron npm package

**Complexity:** M (12-16 hours)

**DNA layer:** Automation (triggers)

---

#### **Task 1A.4: Execution Persistence & Queuing**
**Files to create/modify:**
- `src/lib/execution-store.ts` (NEW) — Store execution records (Supabase table or filesystem)
- `src/lib/job-queue.ts` (NEW) — Queue manager for concurrent workflow executions
- `src/db/schema.sql` (UPDATE) — Add `workflow_executions` table with columns: id, workflow_id, status, input, output, created_at, error_message, tokens_used
- `src/db/schema.sql` (UPDATE) — Add `workflow_metadata` table with: id, name, description, trigger_type, is_live, created_at, updated_at

**What it does:**
Persist all execution results, handle concurrent execution limits (prevent overwhelming LLM API), track cost per workflow, provide querying API for past runs.

**Dependencies:** Task 1A.1, Task 1A.2, Supabase client

**Complexity:** M (12-16 hours)

**DNA layer:** Cross-cutting (data storage)

---

#### **Task 1A.5: Error Handling & Graceful Degradation**
**Files to create/modify:**
- `src/lib/execution-error-handler.ts` (NEW) — Standardized error responses, retry logic, logging
- `src/app/api/workflows/[workflowId]/execute/route.ts` (UPDATE) — Add error handler middleware
- `src/lib/error-reporter.ts` (NEW) — Log errors to Sentry/Datadog for observability

**What it does:**
Human-readable error messages, retry budget tracking, escalation to alerting system on repeated failures. Captures HTTP errors (401, 429, 503), LLM errors (billing, rate limit), and connector errors (auth expired, not found).

**Dependencies:** Task 1A.2, error handling patterns from builder

**Complexity:** S (8-12 hours)

**DNA layer:** Cross-cutting (reliability)

---

### PHASE 1B: PRE-BUILT APP INTEGRATIONS (Weeks 5–10)

---

#### **Task 1B.1: Create Connector Framework**
**Files to create/modify:**
- `packages/builder/src/lib/connector-config.ts` (NEW) — Connector metadata, fields, OAuth config
- `packages/builder/src/components/nodes/connector-node.tsx` (NEW) — Reusable connector node component
- `packages/builder/src/types.ts` (UPDATE) — Add ConnectorNodeData type
- `src/lib/connector-registry.ts` (NEW) — Central registry of all connectors (host app side)
- `src/lib/connector-executor.ts` (NEW) — Execute connector nodes on backend

**What it does:**
Define the interface for a "connector node": label, description, icon, required fields, OAuth config. Template that all 15 connectors implement.

```typescript
interface ConnectorConfig {
  id: string;                    // "slack", "notion", etc.
  label: string;                 // Display name
  description: string;
  icon: string;                  // Emoji or SVG
  color: string;                 // Brand color
  authType?: "oauth" | "api_key" | "none";
  oauthProvider?: string;        // e.g., "slack_oauth"
  actions: Action[];            // e.g., [{ id: "post_message", label: "Post Message", fields: [...] }]
}

interface Action {
  id: string;                    // "post_message"
  label: string;
  description: string;
  fields: ConnectorField[];
  requiredCredential?: boolean;
}

interface ConnectorField {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "channel_select";
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}
```

**Dependencies:** packages/builder/src/types.ts, builder canvas

**Complexity:** M (12-16 hours)

**DNA layer:** Automation (integration layer)

---

#### **Task 1B.2: Implement Slack Connector**
**Files to create/modify:**
- `src/connectors/slack/config.ts` (NEW) — Slack connector metadata, actions, fields
- `src/connectors/slack/executor.ts` (NEW) — Execute Slack actions (post message, update status, etc.)
- `src/connectors/slack/oauth.ts` (NEW) — OAuth flow (request token, refresh token)
- `src/app/api/oauth/slack/authorize/route.ts` (NEW) — OAuth callback handler
- `src/lib/credential-binder.ts` (NEW) — Bind OAuth tokens to connector node instances

**Actions in scope for v1:**
- Post message to channel
- Send direct message
- Update channel topic
- Read message history
- Add reaction
- Update status

**What it does:**
Handles Slack API calls with OAuth token management. When user adds Slack connector node to canvas, they authorize Slack once. Token is stored encrypted, refreshed automatically. Each Slack node instance can use different workspace/token.

**Dependencies:** Task 1B.1, Task 1D.1 (OAuth), Slack API SDK (@slack/web-api)

**Complexity:** M (14-18 hours)

**DNA layer:** Automation (app integration)

---

#### **Task 1B.3: Implement Notion Connector**
**Files to create/modify:**
- `src/connectors/notion/config.ts` (NEW) — Notion connector metadata
- `src/connectors/notion/executor.ts` (NEW) — Execute Notion API calls
- `src/connectors/notion/oauth.ts` (NEW) — OAuth flow for Notion
- `src/app/api/oauth/notion/authorize/route.ts` (NEW) — OAuth callback

**Actions in scope for v1:**
- Query database (with filters)
- Create page in database
- Update page properties
- Add page to database
- Read block content
- Search pages/databases

**What it does:**
Notion API wrapper with OAuth. User authorizes once, token persists. Canvas nodes allow querying Notion databases without writing API calls.

**Dependencies:** Task 1B.1, Task 1D.1 (OAuth), Notion SDK (@notionhq/client)

**Complexity:** M (14-18 hours)

**DNA layer:** Automation (app integration)

---

#### **Task 1B.4: Implement Airtable Connector**
**Files to create/modify:**
- `src/connectors/airtable/config.ts` (NEW)
- `src/connectors/airtable/executor.ts` (NEW)
- `src/connectors/airtable/oauth.ts` (NEW) — API key auth (not OAuth, but similar pattern)
- `src/app/api/oauth/airtable/authorize/route.ts` (NEW) — Token handler

**Actions in scope for v1:**
- List records (with filtering, sorting)
- Create record
- Update record
- Delete record
- List tables
- List fields

**What it does:**
Airtable API wrapper. Supports both OAuth and API key auth.

**Dependencies:** Task 1B.1, Airtable SDK (airtable)

**Complexity:** M (12-16 hours)

**DNA layer:** Automation (app integration)

---

#### **Task 1B.5: Implement GitHub Connector**
**Files to create/modify:**
- `src/connectors/github/config.ts` (NEW)
- `src/connectors/github/executor.ts` (NEW)
- `src/connectors/github/oauth.ts` (NEW) — GitHub OAuth flow
- `src/app/api/oauth/github/authorize/route.ts` (NEW)

**Actions in scope for v1:**
- Create issue
- Post comment on issue
- Update issue (status, labels, assignees)
- List commits
- Create pull request
- List pull requests
- Get repo info

**What it does:**
GitHub API wrapper. User authorizes with GitHub account, gets access to their repos.

**Dependencies:** Task 1B.1, Octokit SDK (already used in codebase)

**Complexity:** M (12-16 hours)

**DNA layer:** Automation (app integration)

---

#### **Task 1B.6: Implement Stripe Connector**
**Files to create/modify:**
- `src/connectors/stripe/config.ts` (NEW)
- `src/connectors/stripe/executor.ts` (NEW)
- `src/connectors/stripe/oauth.ts` (NEW) — Stripe OAuth (for SaaS use case) or API key

**Actions in scope for v1:**
- Create charge/payment intent
- List invoices
- Create invoice
- Update subscription
- List customers
- Create customer
- Refund charge

**What it does:**
Stripe API wrapper. Supports both Stripe API key auth and OAuth for platform use.

**Dependencies:** Task 1B.1, Stripe SDK (stripe)

**Complexity:** M (12-16 hours)

**DNA layer:** Automation (app integration)

---

#### **Task 1B.7: Implement Gmail Connector**
**Files to create/modify:**
- `src/connectors/gmail/config.ts` (NEW)
- `src/connectors/gmail/executor.ts` (NEW)
- `src/connectors/gmail/oauth.ts` (NEW) — Google OAuth flow

**Actions in scope for v1:**
- Send email
- Read messages (list inbox, read thread)
- Search messages
- Create draft
- Mark as read

**What it does:**
Gmail API wrapper via Google OAuth.

**Dependencies:** Task 1B.1, Task 1D.1 (OAuth), Google API client library

**Complexity:** M (12-16 hours)

**DNA layer:** Automation (app integration)

---

#### **Task 1B.8: Implement Google Sheets Connector**
**Files to create/modify:**
- `src/connectors/google-sheets/config.ts` (NEW)
- `src/connectors/google-sheets/executor.ts` (NEW)
- `src/connectors/google-sheets/oauth.ts` (NEW) — Reuse Google OAuth from Gmail

**Actions in scope for v1:**
- Append row
- Get range
- Update range
- Create sheet
- List sheets
- Batch update

**What it does:**
Google Sheets API wrapper via OAuth.

**Dependencies:** Task 1B.1, Task 1B.7 (Gmail OAuth can be reused), Google Sheets API

**Complexity:** M (10-14 hours)

**DNA layer:** Automation (app integration)

---

#### **Task 1B.9: Implement SendGrid Connector**
**Files to create/modify:**
- `src/connectors/sendgrid/config.ts` (NEW)
- `src/connectors/sendgrid/executor.ts` (NEW)
- `src/connectors/sendgrid/oauth.ts` (NEW) — API key auth

**Actions in scope for v1:**
- Send email
- List contacts
- Create contact
- Get email stats
- Send template email

**What it does:**
SendGrid API wrapper.

**Dependencies:** Task 1B.1, SendGrid SDK

**Complexity:** S (8-12 hours)

**DNA layer:** Automation (app integration)

---

#### **Task 1B.10: Implement HubSpot Connector**
**Files to create/modify:**
- `src/connectors/hubspot/config.ts` (NEW)
- `src/connectors/hubspot/executor.ts` (NEW)
- `src/connectors/hubspot/oauth.ts` (NEW)
- `src/app/api/oauth/hubspot/authorize/route.ts` (NEW)

**Actions in scope for v1:**
- Create contact
- Update contact
- List contacts
- Create deal
- Update deal
- List companies

**What it does:**
HubSpot API wrapper.

**Dependencies:** Task 1B.1, Task 1D.1 (OAuth), HubSpot API client

**Complexity:** M (12-16 hours)

**DNA layer:** Automation (app integration)

---

#### **Task 1B.11: Implement Discord, Linear, Typeform, Supabase Connectors**
**Files to create/modify:**
- `src/connectors/discord/` (NEW)
- `src/connectors/linear/` (NEW)
- `src/connectors/typeform/` (NEW)
- `src/connectors/supabase/` (NEW)

**What it does:**
Implement 4 more connectors following the same pattern as above.

**Discord actions:** Send message, create webhook, edit message  
**Linear actions:** Create issue, update issue, list projects  
**Typeform actions:** Get responses, list forms  
**Supabase actions:** Query, insert, update, delete (wrapper around Supabase client)

**Dependencies:** Task 1B.1, respective SDKs (discord.js, @linear/sdk, etc.)

**Complexity:** M × 4 (total 48–64 hours for all 4)

**DNA layer:** Automation (app integration)

---

#### **Task 1B.12: Implement Twitter/X and Zapier Bridge Connectors**
**Files to create/modify:**
- `src/connectors/twitter/` (NEW)
- `src/connectors/zapier-bridge/` (NEW)

**What it does:**

**Twitter/X actions:** Post tweet, search tweets, read replies  
**Zapier bridge:** Call Zapier webhook, receive Zapier webhook (proxy to n8n or Zapier for integrations not natively supported)

**Dependencies:** Task 1B.1, twitter-api-v2 SDK, Zapier webhook handler

**Complexity:** S + M (20–28 hours total)

**DNA layer:** Automation (app integration)

---

### PHASE 1C: STORAGE ADAPTER + DATA PERSISTENCE (Weeks 6–9)

---

#### **Task 1C.1: Define StorageAdapter Interface**
**Files to create/modify:**
- `packages/builder/src/lib/storage-adapter.ts` (NEW) — Core interface
- `packages/builder/src/types.ts` (UPDATE) — Add `storageAdapter?` prop to WorkflowBuilderProps

**What it does:**
Define pluggable storage interface that builder uses, with no external dependencies. Host app injects concrete implementations.

```typescript
export interface StorageAdapter {
  // Workflow persistence
  saveWorkflow(snap: WorkflowSnapshot): Promise<void>;
  loadWorkflow(id: string): Promise<WorkflowSnapshot | null>;
  listWorkflows(): Promise<WorkflowSnapshot[]>;
  deleteWorkflow(id: string): Promise<void>;

  // Execution history
  saveExecution(exec: ExecutionRecord): Promise<void>;
  listExecutions(workflowId: string, limit?: number): Promise<ExecutionRecord[]>;
  getExecution(executionId: string): Promise<ExecutionRecord | null>;

  // Cross-execution state
  saveContext(workflowId: string, ctx: Record<string, unknown>): Promise<void>;
  loadContext(workflowId: string): Promise<Record<string, unknown> | null>;

  // Data store rows (for DataStoreNode)
  saveDataStoreRow(workflowId: string, key: string, value: unknown): Promise<void>;
  loadDataStoreRow(workflowId: string, key: string): Promise<unknown | null>;
  listDataStoreRows(workflowId: string): Promise<Array<{ key: string; value: unknown }>>;
  deleteDataStoreRow(workflowId: string, key: string): Promise<void>;
}

export type WorkflowSnapshot = {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
  template?: boolean;
};

export type ExecutionRecord = {
  id: string;
  workflowId: string;
  status: "success" | "error" | "running";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  steps: WorkflowStepResult[];
  totalTokens?: { input: number; output: number; cost: number };
  createdAt: string;
  completedAt?: string;
  error?: string;
};
```

**Dependencies:** packages/builder/src/types.ts

**Complexity:** S (6–8 hours)

**DNA layer:** Cross-cutting (architecture)

---

#### **Task 1C.2: Implement LocalStorageAdapter**
**Files to create/modify:**
- `packages/builder/src/lib/storage-adapters/local-storage-adapter.ts` (NEW) — Default implementation

**What it does:**
In-browser persistence using localStorage (for solo users, quick start, no server needed). Default when no adapter is provided. Falls back gracefully if quota exceeded.

**Dependencies:** Task 1C.1

**Complexity:** S (6–8 hours)

**DNA layer:** Cross-cutting (storage)

---

#### **Task 1C.3: Implement IndexedDBAdapter**
**Files to create/modify:**
- `packages/builder/src/lib/storage-adapters/indexeddb-adapter.ts` (NEW) — For large workflows

**What it does:**
Browser-based storage using IndexedDB (higher quota than localStorage, supports binary data). Better for large workflows, binary files, or high-volume execution history.

**Dependencies:** Task 1C.1, idb library (npm: idb)

**Complexity:** M (10–14 hours)

**DNA layer:** Cross-cutting (storage)

---

#### **Task 1C.4: Implement SupabaseAdapter (Host App)**
**Files to create/modify:**
- `src/lib/storage-adapters/supabase-adapter.ts` (NEW) — Production persistence
- `src/db/schema.sql` (UPDATE) — Add `workflows` table, `executions` table, `execution_steps` table, `workflow_data_store` table

**What it does:**
Backend storage via Supabase. User picks this on setup ("Connect to Supabase"). Teams use this. Cross-device sync.

**Schema:**
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('success', 'error', 'running')),
  input JSONB NOT NULL,
  output JSONB,
  total_tokens_input INT,
  total_tokens_output INT,
  total_cost NUMERIC,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP
);

CREATE TABLE execution_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'running', 'success', 'error', 'skipped')),
  output TEXT,
  structured_output JSONB,
  error_message TEXT,
  token_input INT,
  token_output INT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE workflow_data_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(workflow_id, key)
);
```

**Dependencies:** Task 1C.1, Supabase client (@supabase/supabase-js)

**Complexity:** M (12–16 hours)

**DNA layer:** Cross-cutting (storage)

---

#### **Task 1C.5: Implement S3/R2Adapter (Host App)**
**Files to create/modify:**
- `src/lib/storage-adapters/s3-adapter.ts` (NEW) — For cloud storage (AWS S3, Cloudflare R2)

**What it does:**
Store workflows as JSON files in S3/R2. Execution history as separate files. Useful for large-scale deployments, version control via S3 versioning, or compliance (data in customer's S3 bucket).

**Dependencies:** Task 1C.1, @aws-sdk/client-s3 or AWS SDK v3

**Complexity:** M (10–14 hours)

**DNA layer:** Cross-cutting (storage)

---

#### **Task 1C.6: Implement DataStoreNode**
**Files to create/modify:**
- `packages/builder/src/components/nodes/data-store-node.tsx` (NEW) — Canvas node for reading/writing state
- `packages/builder/src/lib/flow-templates.ts` (UPDATE) — Add DataStoreNodeData type
- `src/lib/backend-workflow-executor.ts` (UPDATE) — Handle data store node execution

**What it does:**
New node type that reads from or writes to the workflow's persistent data store. Example:
- **Write:** `{"action": "save", "key": "last_email_id", "value": "123abc"}`
- **Read:** `{"action": "load", "key": "last_email_id"}` → returns `123abc`

**Fields:**
- Action: "load" or "save"
- Key: string (identifier, e.g., "last_processed_id")
- Value: JSON (when action is "save")

**Dependencies:** Task 1C.1, builder canvas

**Complexity:** M (10–14 hours)

**DNA layer:** Automation (data persistence)

---

#### **Task 1C.7: Migrate Execution History to Persistent Storage**
**Files to create/modify:**
- `src/lib/backend-workflow-executor.ts` (UPDATE) — Use storage adapter instead of in-memory
- `src/app/api/workflows/[workflowId]/executions/route.ts` (UPDATE) — Query from persistent storage
- `packages/builder/src/components/execution-history.tsx` (UPDATE) — Fetch from backend instead of localStorage

**What it does:**
Move execution history from in-memory (last 20 runs) to persistent storage. All runs are now persisted and queryable.

**Dependencies:** Task 1C.1, Task 1C.4 (SupabaseAdapter), Task 1A.4 (execution persistence)

**Complexity:** M (8–12 hours)

**DNA layer:** Cross-cutting (storage)

---

### PHASE 1D: OAUTH & CREDENTIAL MANAGEMENT (Weeks 8–11)

---

#### **Task 1D.1: Enhance Credential Vault for OAuth**
**Files to create/modify:**
- `packages/builder/src/lib/credential-store.ts` (UPDATE) — Extend to support OAuth token storage
- `src/lib/oauth-manager.ts` (NEW) — Central OAuth handler for all providers
- `src/db/schema.sql` (UPDATE) — Add `oauth_tokens` table

**What it does:**
Extend existing AES-GCM encrypted credential store to support:
- OAuth refresh tokens (with expiry tracking)
- Access tokens (with rotation)
- Multi-account per provider (e.g., 2 Slack workspaces)
- Automatic token refresh before expiry

**Schema for oauth_tokens:**
```sql
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  account_id TEXT NOT NULL,
  access_token TEXT NOT NULL ENCRYPTED,
  refresh_token TEXT ENCRYPTED,
  expires_at TIMESTAMP,
  scope TEXT,
  account_name TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, provider, account_id)
);
```

**Dependencies:** Task 1B.1 (connector framework), credential-store.ts

**Complexity:** M (12–16 hours)

**DNA layer:** Cross-cutting (security)

---

#### **Task 1D.2: Implement OAuth Authorization Code Flow**
**Files to create/modify:**
- `src/app/api/oauth/authorize/route.ts` (NEW) — Redirect to provider (Slack, GitHub, etc.)
- `src/app/api/oauth/callback/route.ts` (NEW) — Handle provider callback, exchange code for token
- `src/lib/oauth-providers.ts` (NEW) — Provider-specific OAuth config (client ID, scopes, endpoints)
- `src/lib/jwt-handler.ts` (NEW) — Secure state parameter for CSRF protection

**What it does:**
Standard OAuth 2.0 authorization code grant:
1. User clicks "Connect Slack" button
2. Redirected to `/api/oauth/authorize?provider=slack`
3. Redirected to Slack consent screen
4. Callback to `/api/oauth/callback?code=...&state=...`
5. Exchange code for access token, store securely

**Dependencies:** Task 1D.1, oauth2 library (axios or node-oauth2-server)

**Complexity:** M (12–16 hours)

**DNA layer:** Cross-cutting (auth)

---

#### **Task 1D.3: Implement Token Refresh Logic**
**Files to create/modify:**
- `src/lib/token-refresh-scheduler.ts` (NEW) — Background job to refresh expiring tokens
- `src/cron/refresh-tokens.ts` (NEW) — Scheduled job that runs every hour
- `src/lib/oauth-manager.ts` (UPDATE) — Add refresh token method

**What it does:**
Background job that:
1. Queries `oauth_tokens` table for tokens expiring within 1 hour
2. Calls provider's refresh endpoint
3. Updates access token and expiry in database
4. Logs errors (e.g., user revoked access)

**Dependencies:** Task 1D.1, Task 1D.2, node-cron

**Complexity:** M (10–14 hours)

**DNA layer:** Cross-cutting (auth)

---

#### **Task 1D.4: Add Multi-Account Credential Binding**
**Files to create/modify:**
- `packages/builder/src/components/node-inspector.tsx` (UPDATE) — Add credential picker dropdown per node
- `packages/builder/src/components/credential-selector.tsx` (NEW) — Dropdown to pick credential (e.g., "My Slack Workspace" vs "Client Slack Workspace")
- `packages/builder/src/types.ts` (UPDATE) — Add `credentialId` field to connector node data

**What it does:**
When user adds a Slack node, they can pick which Slack workspace to use from a dropdown:
- "My Workspace" (main account)
- "Client A Workspace" (additional OAuth token)
- "Connect new workspace..." (trigger new OAuth flow)

Each node instance stores the `credentialId` of the chosen token.

**Dependencies:** Task 1D.1, Task 1D.2, builder canvas

**Complexity:** M (10–14 hours)

**DNA layer:** Builder UX (credential management)

---

#### **Task 1D.5: Credential UI in Settings Panel**
**Files to create/modify:**
- `src/app/builder/(settings)/page.tsx` (NEW) — Settings page for managing credentials
- `src/components/credential-manager.tsx` (NEW) — UI to view, add, delete, test credentials

**What it does:**
Settings panel where users can:
- View all connected accounts (Slack: "My Workspace", GitHub: "github.com/user", etc.)
- Click "Connect New Slack Workspace" → OAuth flow
- Click "Test Connection" → Verify token still valid
- Click "Disconnect" → Revoke and delete token

**Dependencies:** Task 1D.1, Task 1D.2, Task 1D.4

**Complexity:** M (10–14 hours)

**DNA layer:** Builder UX (settings)

---

### PHASE 1E: OBSERVABILITY & DEBUGGING (Weeks 10–14)

---

#### **Task 1E.1: Implement Variable Inspector**
**Files to create/modify:**
- `packages/builder/src/components/variable-inspector.tsx` (NEW) — Expandable JSON viewer
- `packages/builder/src/lib/workflow-engine.ts` (UPDATE) — Expose `ctx` and `ctx.structured` during execution
- `packages/builder/src/components/execution-panel.tsx` (UPDATE) — Show variable inspector tab

**What it does:**
Side panel that shows:
```json
{
  "inputs": {
    "trigger-1": { "manual_input": "test" },
    "llm-2": "Generated text from Claude",
    ...
  },
  "structured": {
    "notion-3": { 
      "pages": [{ "id": "123", "title": "Page A" }]
    },
    ...
  }
}
```

User can expand any field to see full JSON. Search/filter by key. Diff between two executions.

**Dependencies:** Builder canvas, execution engine

**Complexity:** M (10–14 hours)

**DNA layer:** Builder UX (observability)

---

#### **Task 1E.2: Implement Error Trace Display**
**Files to create/modify:**
- `packages/builder/src/components/error-trace.tsx` (NEW) — Full stack trace viewer
- `packages/builder/src/lib/workflow-engine.ts` (UPDATE) — Capture full error context and stack

**What it does:**
On execution error, show:
```
Node: llm-node-2 "Generate response"
Step: 5/8
Error Type: RateLimitError
Message: Rate limit exceeded. Wait a moment and try again.
Stack:
  at executeNode (workflow-engine.ts:425)
  at executeWorkflow (workflow-engine.ts:312)
  at runExecution (execution.ts:89)
```

With button to retry from this step.

**Dependencies:** Builder canvas, execution engine

**Complexity:** M (8–12 hours)

**DNA layer:** Builder UX (observability)

---

#### **Task 1E.3: Implement Per-Node Timing Display**
**Files to create/modify:**
- `packages/builder/src/components/execution-panel.tsx` (UPDATE) — Show timing per node
- `packages/builder/src/lib/workflow-engine.ts` (UPDATE) — Track `startedAt` and `completedAt` per step

**What it does:**
In execution panel, show:
```
Step 1: trigger-1              1ms
Step 2: llm-2 "Generate"    1500ms  ⚠️ Slow
Step 3: notion-3 "Save"       200ms
```

Color-code slow nodes (red > 5s, yellow > 1s). Click to see details.

**Dependencies:** Builder canvas, execution engine, Task 1E.1 (variable inspector)

**Complexity:** S (6–10 hours)

**DNA layer:** Builder UX (observability)

---

#### **Task 1E.4: Implement Logging Level Control**
**Files to create/modify:**
- `packages/builder/src/types.ts` (UPDATE) — Add `logLevel` to ExecutionOptions
- `packages/builder/src/lib/workflow-engine.ts` (UPDATE) — Filter logs by level
- `packages/builder/src/components/execution-panel.tsx` (UPDATE) — Add log level dropdown (Verbose/Info/Warn/Error)

**What it does:**
Dropdown in execution panel to control logging verbosity:
- **Verbose:** All steps, prompts, responses
- **Info:** Step summaries, token counts
- **Warn:** Only warnings and errors
- **Error:** Only errors

**Dependencies:** Builder canvas, execution engine

**Complexity:** S (6–8 hours)

**DNA layer:** Builder UX (observability)

---

#### **Task 1E.5: Enhance Execution Diff Viewer**
**Files to create/modify:**
- `packages/builder/src/components/execution-comparison.tsx` (UPDATE) — Diff variables between runs

**What it does:**
Side-by-side comparison of two execution runs:
- Left: Run #5
- Right: Run #6
- Show which variables changed, highlight diffs in JSON

**Dependencies:** Task 1E.1 (variable inspector), builder canvas

**Complexity:** M (8–12 hours)

**DNA layer:** Builder UX (observability)

---

### PHASE 1F: MULTI-TURN AGENT MODE WITH TOOL USE (Weeks 11–14)

---

#### **Task 1F.1: Implement Tool Use Protocol in LLM Node**
**Files to create/modify:**
- `packages/builder/src/components/nodes/llm-node.tsx` (UPDATE) — Add agent mode toggle
- `packages/builder/src/lib/workflow-engine.ts` (UPDATE) — Handle tool use in execution engine
- `src/lib/llm-tool-handler.ts` (NEW) — Define available tools, execute tool calls

**What it does:**
When user toggles "Agent Mode" on LLM node, enable Claude's tool_use feature. Define tools that agent can call:
```typescript
const tools = [
  {
    name: "call_node",
    description: "Call another workflow node as a tool",
    input_schema: {
      type: "object",
      properties: {
        nodeId: { type: "string", description: "Node ID to call" },
        inputs: { type: "object", description: "Input data for node" }
      }
    }
  }
];
```

**Dependencies:** Builder canvas, Anthropic SDK (tool_use APIs)

**Complexity:** M (12–16 hours)

**DNA layer:** AI Intelligence (agent mode)

---

#### **Task 1F.2: Expose Upstream Nodes as Callable Tools**
**Files to create/modify:**
- `src/lib/llm-tool-handler.ts` (UPDATE) — Dynamically generate tool list from workflow
- `packages/builder/src/lib/workflow-engine.ts` (UPDATE) — Handle `call_node` tool execution

**What it does:**
For each node upstream of the agent node, create a tool:
```typescript
[
  {
    name: "notion_query_task_db",
    description: "Query Notion task database for incomplete tasks",
    input_schema: { ... }
  },
  {
    name: "send_slack_message",
    description: "Send message to #team channel",
    input_schema: { ... }
  }
]
```

Agent can call these tools, observe results, reason again.

**Dependencies:** Task 1F.1, builder canvas, execution engine

**Complexity:** M (10–14 hours)

**DNA layer:** Automation (agent tools)

---

#### **Task 1F.3: Implement Multi-Turn Loop in Execution Engine**
**Files to create/modify:**
- `src/lib/backend-workflow-executor.ts` (UPDATE) — Multi-turn loop: reason → call tool → observe → repeat
- `src/lib/llm-tool-handler.ts` (UPDATE) — Tool result handling, stop condition (max turns)

**What it does:**
Loop:
1. Call LLM with current context and available tools
2. If LLM returns tool_use block, execute that tool, get result
3. Append tool result to context, call LLM again
4. Repeat until LLM returns end_turn or max turns reached (5)
5. Return final LLM output

**Dependencies:** Task 1F.1, Task 1F.2, Anthropic SDK

**Complexity:** L (16–20 hours)

**DNA layer:** Automation (agent execution)

---

#### **Task 1F.4: Implement Reasoning Streaming**
**Files to create/modify:**
- `src/app/api/workflows/[workflowId]/execute/route.ts` (UPDATE) — Stream agent thinking
- `packages/builder/src/components/execution-panel.tsx` (UPDATE) — Display thinking steps

**What it does:**
As agent reasons (thinking blocks), stream text to execution panel so user sees reasoning in real-time:
```
Agent reasoning:
> I need to check what tasks are overdue
> Calling notion_query_task_db with {"days_overdue": 7}
> Got 3 tasks. Let me prioritize them...
> Calling send_slack_message with summary of overdue tasks
> Done.
```

**Dependencies:** Task 1F.1, Task 1F.3, SSE streaming

**Complexity:** M (10–14 hours)

**DNA layer:** Builder UX (observability)

---

### PHASE 1G: POLISH & TESTING (Weeks 14–16)

---

#### **Task 1G.1: End-to-End Testing**
**Files to create/modify:**
- `tests/e2e/` (NEW) — Playwright tests for critical user journeys

**What it does:**
Test flows:
1. Create workflow → Add nodes → Connect → Save → Deploy
2. Trigger webhook → Execution completes → Check execution history
3. Add Slack connector → Authorize Slack → Send message via workflow
4. Design agent loop → Run → Agent calls 3 tools → Final output

**Complexity:** L (16–20 hours)

**DNA layer:** Cross-cutting (quality)

---

#### **Task 1G.2: Load Testing**
**Files to create/modify:**
- `tests/load/` (NEW) — k6 load test scripts

**What it does:**
Simulate 100 concurrent executions. Measure:
- API response times (p50, p99)
- Token limit behavior (backoff, error handling)
- Execution queue throughput
- Memory leaks

**Complexity:** M (10–14 hours)

**DNA layer:** Cross-cutting (reliability)

---

#### **Task 1G.3: Security Audit**
**Files to create/modify:**
- `docs/SECURITY.md` (NEW) — Security audit report

**What it does:**
Review:
- Credential encryption (AES-GCM still secure?)
- OAuth flow (CSRF token, state parameter)
- API auth (JWT validation, rate limiting)
- SQL injection risks (parameterized queries, ORM usage)
- Token storage (not in localStorage, in httpOnly cookies?)

**Complexity:** L (16–20 hours)

**DNA layer:** Cross-cutting (security)

---

#### **Task 1G.4: Documentation**
**Files to create/modify:**
- `docs/API.md` (NEW) — REST API reference
- `docs/CONNECTORS.md` (NEW) — Connector library docs
- `docs/GETTING_STARTED.md` (UPDATE) — Deployment, OAuth setup
- `docs/ARCHITECTURE.md` (UPDATE) — Deployment runtime, storage adapters

**What it does:**
Ship comprehensive docs so users and developers can:
- Call `/api/execute/{workflowId}` endpoint
- Understand each connector's actions and fields
- Set up OAuth for their provider
- Extend with custom connectors

**Complexity:** M (12–16 hours)

**DNA layer:** Cross-cutting (docs)

---

#### **Task 1G.5: Onboarding & UX Polish**
**Files to create/modify:**
- `packages/builder/src/components/onboarding-walkthrough.tsx` (NEW) — First-time user guide
- `src/app/builder/page.tsx` (UPDATE) — Improve start screen
- `packages/builder/src/components/template-gallery.tsx` (UPDATE) — Curate templates by use case

**What it does:**
- Walkthrough: "Create trigger → Add action → Deploy"
- Template gallery organized by category (Sales, Support, Marketing)
- Tooltips on key features
- "Getting Started" video links

**Complexity:** M (10–14 hours)

**DNA layer:** Builder UX (onboarding)

---

#### **Task 1G.6: Performance Optimization**
**Files to create/modify:**
- `packages/builder/src/components/flow-canvas.tsx` (OPTIMIZE) — Reduce re-renders on large canvases
- `src/app/api/` (OPTIMIZE) — Query optimization, caching

**What it does:**
- Lazy load nodes in canvas (render only visible nodes)
- Memoize expensive components
- Add Redis caching for OAuth token checks
- Optimize Supabase queries (indexes, select specific columns)

**Complexity:** L (16–20 hours)

**DNA layer:** Cross-cutting (performance)

---

## PART 3: DEPENDENCY GRAPH

```
PHASE 1A: Deployment Runtime
├─ Task 1A.1: API Structure
│  └─ Task 1A.2: Backend Execution Engine
│     └─ Task 1A.3: Cron & Trigger Scheduler
│        └─ Task 1A.4: Execution Persistence
│           └─ Task 1A.5: Error Handling

PHASE 1B: Pre-Built Integrations
├─ Task 1B.1: Connector Framework
│  ├─ Task 1B.2: Slack Connector
│  │  └─ Task 1D.1: OAuth Manager (parallel)
│  ├─ Task 1B.3: Notion Connector
│  │  └─ Task 1D.1: OAuth Manager
│  ├─ Task 1B.4: Airtable Connector
│  ├─ Task 1B.5: GitHub Connector
│  │  └─ Task 1D.1: OAuth Manager
│  ├─ Task 1B.6: Stripe Connector
│  │  └─ Task 1D.1: OAuth Manager
│  ├─ Task 1B.7: Gmail Connector
│  │  └─ Task 1D.1: OAuth Manager
│  ├─ Task 1B.8: Google Sheets Connector
│  │  └─ Task 1B.7: Gmail OAuth (reuse)
│  ├─ Task 1B.9: SendGrid Connector
│  ├─ Task 1B.10: HubSpot Connector
│  │  └─ Task 1D.1: OAuth Manager
│  ├─ Task 1B.11: Discord, Linear, Typeform, Supabase (4 parallel)
│  └─ Task 1B.12: Twitter/X, Zapier Bridge (parallel)

PHASE 1C: Storage Adapter
├─ Task 1C.1: Define StorageAdapter Interface
├─ Task 1C.2: LocalStorageAdapter
├─ Task 1C.3: IndexedDBAdapter
├─ Task 1C.4: SupabaseAdapter
│  └─ Task 1C.7: Migrate Execution History
├─ Task 1C.5: S3/R2Adapter
├─ Task 1C.6: DataStoreNode
│  └─ Task 1C.7: Migrate Execution History

PHASE 1D: OAuth & Credentials
├─ Task 1D.1: Enhance Credential Vault
├─ Task 1D.2: OAuth Authorization Code Flow
├─ Task 1D.3: Token Refresh Logic
├─ Task 1D.4: Multi-Account Binding
└─ Task 1D.5: Credential Settings Panel

PHASE 1E: Observability
├─ Task 1E.1: Variable Inspector
├─ Task 1E.2: Error Trace Display
├─ Task 1E.3: Per-Node Timing
├─ Task 1E.4: Logging Level Control
└─ Task 1E.5: Execution Diff Viewer

PHASE 1F: Agent Mode
├─ Task 1F.1: Tool Use Protocol
├─ Task 1F.2: Expose Nodes as Tools
│  └─ Task 1F.3: Multi-Turn Loop
│     └─ Task 1F.4: Reasoning Streaming

PHASE 1G: Polish & Testing
├─ Task 1G.1: E2E Testing
├─ Task 1G.2: Load Testing
├─ Task 1G.3: Security Audit
├─ Task 1G.4: Documentation
├─ Task 1G.5: Onboarding
└─ Task 1G.6: Performance Optimization
```

---

## PART 4: CRITICAL PATH ANALYSIS

**Longest dependency chain (minimum time to launch):**

```
1A.1 (API: 8h) 
  → 1A.2 (Executor: 22h) 
  → 1A.3 (Scheduler: 14h) 
  → 1A.4 (Persistence: 14h) 
  → 1A.5 (Error: 10h)
  [SUBTOTAL: 68 hours]

1B.1 (Framework: 14h) 
  → 1B.2-1B.12 (Connectors: 120h, parallelizable from 1B.1)
  [SUBTOTAL: 134 hours, but parallelizable to ~30h calendar time]

1C.1 (Interface: 7h) 
  → 1C.2 (LocalStorage: 7h) 
  → 1C.4 (Supabase: 14h) 
  → 1C.7 (Migration: 10h)
  [SUBTOTAL: 38 hours]

1D.1 (Vault: 14h) 
  → 1D.2 (OAuth Flow: 14h) 
  → 1D.3 (Token Refresh: 12h) 
  → 1D.4-1D.5 (UI: 24h)
  [SUBTOTAL: 64 hours]

1E.1-1E.5 (Observability: 48h)
  [Parallelizable to ~12h calendar time]

1F.1 (Tool Use: 14h) 
  → 1F.2 (Expose Tools: 12h) 
  → 1F.3 (Multi-Turn: 18h) 
  → 1F.4 (Streaming: 12h)
  [SUBTOTAL: 56 hours, but 1F.2-1F.4 mostly parallel]

1G.1-1G.6 (Testing/Polish: 100h)
  [Parallelizable, can't start until 1F complete]
```

**Critical path (sequential bottleneck):**
1. Phase 1A (68h) — Must build deployment runtime first
2. Phase 1B (30h calendar, 134h total) — Connectors parallelizable
3. Phase 1C (38h) — Storage must be in place for execution history
4. Phase 1D (64h) — OAuth for connectors, but 1D.2–1D.5 parallelizable
5. Phase 1F (56h) — Agent mode (highest complexity, unlocks v2 positioning)
6. Phase 1G (100h) — Polish happens after 1F

**Minimum critical path (best-case scenario with full parallelization):**
- Weeks 1–4: Phase 1A (4 weeks, 68h with 2 builders)
- Weeks 4–8: Phases 1B + 1C + 1D in parallel (4 weeks, 232h → ~58h per week, doable with full team)
- Weeks 8–11: Phase 1F (3 weeks, 56h)
- Weeks 11–16: Phase 1G (5 weeks, polish/test in parallel with features)

**Total critical path: ~16 weeks** ✓

---

## PART 5: WHAT NOT TO BUILD (DEFERRED TO v2+)

### **Explicitly Out of Scope for v1 Launch**

#### **1. Multiplayer Collaboration (Phase 3)**
- **Why deferred:** Liveblocks integration adds 2–3 weeks. Single-player is sufficient for initial GTM. Teams can use copy/paste and manual versioning until v2.
- **When to ship:** Q4 2026 (Phase 3)

#### **2. Advanced Observability (Phase 2)**
- Step-through debugger with breakpoints (too niche for v1)
- Conditional breakpoints, watch expressions (can use variable inspector instead)
- Custom metrics/dashboards (execute analytics instead)
- **What ships:** Variable inspector + error trace + timing (enough for debugging)

#### **3. Advanced Agent Features (Phase 2)**
- Agent delegation (agent → agent handoff) — deferred, high complexity
- Memory systems (long-term memory, episodic memory) — use data store instead
- Reflection loops (agent asks "did I do this right?") — complex, low impact at launch
- **What ships:** Basic tool use, multi-turn reasoning

#### **4. Sub-flows / Component Nesting**
- Ability to group nodes into reusable sub-flows
- Parameterized components
- **Why deferred:** UI complexity. Flat workflows sufficient for v1. Add in v2 based on user feedback.

#### **5. Version Control & Branching**
- Git-like branching for workflows
- Rollback to previous versions
- Diff viewer for workflow definition changes
- **Why deferred:** Build custom version control vs. integrating with GitHub. Users can export JSON as versioning mechanism.

#### **6. Self-Hosted Option**
- Docker deployment, on-prem installation, VPC deployment
- **Why deferred:** v1 is SaaS-only (Figma lens). Self-host mode (n8n lens) deferred to v2.

#### **7. Enterprise Features**
- RBAC (role-based access control)
- Audit logs
- SSO / SAML
- SOC2 compliance
- **Why deferred:** Roadmap for Enterprise tier (Phase 3). v1 is SMB/mid-market.

#### **8. Advanced Data Features**
- File uploads (PDF, CSV processing)
- Built-in data visualization (dashboards, charts)
- Complex data transformations (SQL-like query language)
- **Why deferred:** DataStoreNode covers basic persistence. Expand post-launch.

#### **9. Custom Node Creator UI**
- Drag-drop UI builder for custom nodes
- Users define custom node types visually
- **Why deferred:** AI can generate user nodes via chat (already exists). Full UI builder overkill for v1.

#### **10. Marketplace & Community Nodes**
- Community-shared connectors
- User-published templates
- "Featured" templates curated by team
- **Why deferred:** v1 ships pre-built nodes. Marketplace is v3 (Phase 3).

#### **11. Real-Time Data Streaming (Perplexity Layer)**
- Web search node
- API search node (multi-source reconciliation)
- Document search / RAG
- Knowledge layer with citations
- **Why deferred:** This is Phase 2 differentiation per CPO research. Essential for competing with Perplexity, but not table-stakes at launch. v1 focuses on automation + agent mode. Knowledge layer ships in v2 (2027).

#### **12. LLM Function Definitions for Tool Use**
- Let users define custom tools via UI (beyond just calling other nodes)
- Custom tool schemas, input validation
- **Why deferred:** Calling upstream nodes covers 80% of use cases. Full function definitions too complex.

#### **13. Advanced Prompt Engineering**
- Prompt versioning, A/B testing
- Temperature/top-p tuning UI
- Prompt library
- **Why deferred:** Basic prompt editing (textarea) sufficient. Advanced prompting tools in Phase 2.

#### **14. Cost Optimization Features**
- Automatic model selection (pick cheapest model for task)
- Token usage prediction
- Cost alerts / budget limits
- **Why deferred:** Token tracking exists. Optimization is v2 feature.

#### **15. Vendor Lock-in Prevention**
- Export workflows as n8n JSON
- Import from Zapier/Make
- Workflow portability across platforms
- **Why deferred:** JSON export exists, but don't position as portable yet. Build moat first (UI + integrations). Portability is long-tail feature.

---

## PART 6: WEEKLY BUILD BREAKDOWN

### **Week 1–4: Phase 1A (Deployment Runtime)**

| Week | Tasks | Owner | Status |
|------|-------|-------|--------|
| 1 | 1A.1 API Structure, 1A.2 Backend Executor | Backend lead | In Progress |
| 2 | 1A.3 Scheduler, 1A.4 Persistence | Backend lead | Pending |
| 3 | 1A.4 Persistence (cont.), 1A.5 Error Handling | Backend lead | Pending |
| 4 | 1A.5 Polish, testing | Backend lead | Pending |

### **Week 5–10: Phase 1B (Connectors) — PARALLEL WITH 1C + 1D**

| Week | Tasks | Owner | Status |
|------|-------|-------|--------|
| 5 | 1B.1 Framework, 1B.2 Slack, 1B.3 Notion | Builder 1 + Backend lead | Pending |
| 6 | 1B.4 Airtable, 1B.5 GitHub, 1B.6 Stripe | Builder 1 + Backend lead | Pending |
| 7 | 1B.7 Gmail, 1B.8 Sheets, 1B.9 SendGrid | Builder 1 + Backend lead | Pending |
| 8 | 1B.10 HubSpot, 1B.11 Discord/Linear/Typeform/Supabase | Builder 1 + Backend lead | Pending |
| 9 | 1B.12 Twitter/Zapier, testing | Builder 1 + Backend lead | Pending |
| 10 | 1B testing, integration | Builder 1 + Backend lead | Pending |

### **Week 6–9: Phase 1C (Storage Adapter) — PARALLEL**

| Week | Tasks | Owner | Status |
|------|-------|-------|--------|
| 6 | 1C.1 Interface, 1C.2 LocalStorage, 1C.3 IndexedDB | Builder 1 | Pending |
| 7 | 1C.4 SupabaseAdapter, 1C.5 S3Adapter | Builder 1 | Pending |
| 8 | 1C.6 DataStoreNode, 1C.7 Migration | Builder 1 | Pending |
| 9 | 1C testing, integration with 1A/1B | Builder 1 | Pending |

### **Week 8–11: Phase 1D (OAuth & Credentials) — PARALLEL**

| Week | Tasks | Owner | Status |
|------|-------|-------|--------|
| 8 | 1D.1 Vault Enhancement, 1D.2 OAuth Flow | Backend lead | Pending |
| 9 | 1D.3 Token Refresh, 1D.4 Multi-Account | Backend lead | Pending |
| 10 | 1D.5 Settings Panel, testing | Builder 1 + Backend lead | Pending |
| 11 | 1D integration with connectors | Backend lead | Pending |

### **Week 10–14: Phase 1E (Observability) — PARALLEL**

| Week | Tasks | Owner | Status |
|------|-------|-------|--------|
| 10 | 1E.1 Variable Inspector, 1E.2 Error Trace | Builder 1 | Pending |
| 11 | 1E.3 Timing, 1E.4 Logging, 1E.5 Diff Viewer | Builder 1 | Pending |
| 12 | 1E testing, UI polish | Builder 1 | Pending |
| 13–14 | 1E integration, refinement | Builder 1 | Pending |

### **Week 11–14: Phase 1F (Agent Mode) — PARALLEL**

| Week | Tasks | Owner | Status |
|------|-------|-------|--------|
| 11 | 1F.1 Tool Use Protocol, 1F.2 Expose Tools | Backend lead | Pending |
| 12 | 1F.3 Multi-Turn Loop | Backend lead | Pending |
| 13 | 1F.4 Streaming, testing | Backend lead | Pending |
| 14 | 1F polish, integration | Backend lead | Pending |

### **Week 14–16: Phase 1G (Testing & Polish) — PARALLEL, LAST PUSH**

| Week | Tasks | Owner | Status |
|------|-------|-------|--------|
| 14 | 1G.1 E2E Tests (prep), 1G.4 Docs | DevOps lead + Builder 2 | Pending |
| 15 | 1G.1 E2E Tests (full), 1G.2 Load Test, 1G.3 Security Audit | DevOps lead + Backend lead | Pending |
| 16 | 1G.5 Onboarding, 1G.6 Perf Opt, final bug fixes | Builder 1 + Backend lead | Pending |

---

## PART 7: FILE STRUCTURE AT LAUNCH (v1)

```
SupraLoop/
├── packages/
│   └── builder/
│       └── src/
│           ├── lib/
│           │   ├── storage-adapter.ts (NEW)
│           │   ├── storage-adapters/
│           │   │   ├── local-storage-adapter.ts (NEW)
│           │   │   └── indexeddb-adapter.ts (NEW)
│           │   ├── connector-config.ts (NEW)
│           │   ├── flow-templates.ts (UPDATE) — Add DataStoreNodeData
│           │   └── workflow-engine.ts (EXPAND)
│           └── components/
│               ├── nodes/
│               │   ├── connector-node.tsx (NEW)
│               │   ├── data-store-node.tsx (NEW)
│               │   └── llm-node.tsx (UPDATE) — Add agent mode
│               ├── variable-inspector.tsx (NEW)
│               ├── error-trace.tsx (NEW)
│               ├── execution-panel.tsx (UPDATE)
│               ├── node-inspector.tsx (UPDATE) — Add credential selector
│               └── onboarding-walkthrough.tsx (NEW)
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── workflows/ (NEW)
│   │   │   │   ├── route.ts
│   │   │   │   ├── [workflowId]/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── execute/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── executions/
│   │   │   │   │   │   ├── route.ts
│   │   │   │   │   │   └── [executionId]/route.ts
│   │   │   │   │   └── triggers/route.ts
│   │   │   ├── oauth/ (NEW)
│   │   │   │   ├── authorize/route.ts
│   │   │   │   └── callback/route.ts
│   │   │   ├── flow-chat/route.ts (EXISTS)
│   │   │   └── flow-execute-llm/route.ts (EXISTS)
│   │   └── builder/
│   │       └── (settings)/page.tsx (NEW) — Credential settings
│   │
│   ├── lib/
│   │   ├── backend-workflow-executor.ts (NEW)
│   │   ├── http-node-executor.ts (NEW)
│   │   ├── llm-node-executor.ts (NEW)
│   │   ├── transform-node-executor.ts (NEW)
│   │   ├── deployment-scheduler.ts (NEW)
│   │   ├── execution-store.ts (NEW)
│   │   ├── job-queue.ts (NEW)
│   │   ├── execution-error-handler.ts (NEW)
│   │   ├── error-reporter.ts (NEW)
│   │   ├── connector-registry.ts (NEW)
│   │   ├── connector-executor.ts (NEW)
│   │   ├── oauth-manager.ts (NEW)
│   │   ├── oauth-providers.ts (NEW)
│   │   ├── token-refresh-scheduler.ts (NEW)
│   │   ├── jwt-handler.ts (NEW)
│   │   ├── llm-tool-handler.ts (NEW)
│   │   ├── storage-adapters/
│   │   │   ├── supabase-adapter.ts (NEW)
│   │   │   └── s3-adapter.ts (NEW)
│   │   ├── credential-store.ts (UPDATE)
│   │   └── workflow-runtime.ts (NEW)
│   │
│   ├── connectors/ (NEW)
│   │   ├── slack/
│   │   │   ├── config.ts
│   │   │   ├── executor.ts
│   │   │   └── oauth.ts
│   │   ├── notion/
│   │   ├── airtable/
│   │   ├── github/
│   │   ├── stripe/
│   │   ├── gmail/
│   │   ├── google-sheets/
│   │   ├── sendgrid/
│   │   ├── hubspot/
│   │   ├── discord/
│   │   ├── linear/
│   │   ├── typeform/
│   │   ├── supabase/
│   │   ├── twitter/
│   │   └── zapier-bridge/
│   │
│   ├── components/
│   │   └── credential-manager.tsx (NEW)
│   │
│   ├── cron/
│   │   ├── job-runner.ts (NEW)
│   │   └── refresh-tokens.ts (NEW)
│   │
│   └── db/
│       └── schema.sql (UPDATE) — Add workflows, executions, oauth_tokens, workflow_data_store tables
│
├── tests/
│   ├── e2e/ (NEW)
│   │   └── critical-flows.spec.ts
│   └── load/ (NEW)
│       └── workflow-execution.k6.js
│
└── docs/
    ├── API.md (NEW)
    ├── CONNECTORS.md (NEW)
    ├── ARCHITECTURE.md (UPDATE)
    └── SECURITY.md (NEW)
```

---

## PART 8: SUCCESS METRICS AT LAUNCH (READINESS SCORE 75/100)

| Function | v1 Score | Target Score | Status |
|----------|----------|--------------|--------|
| Visual workflow canvas | 88 | 90 | +2 (smart spacing) |
| Topological sort execution | 92 | 95 | +3 (multi-turn loops) |
| Multi-provider LLM node | 85 | 92 | +7 (agent mode) |
| Trigger system | 45 | 85 | +40 (cron + webhook) |
| Instant workflow deployment | 10 | 90 | +80 (full runtime) |
| Pre-built app integrations | 5 | 88 | +83 (15 connectors) |
| HTTP/REST API node | 25 | 88 | +63 (real execution) |
| Credential vault | 78 | 92 | +14 (OAuth + refresh) |
| Structured data flow | 80 | 90 | +10 (data store) |
| Persistent data storage | 0 | 80 | +80 (storage adapter) |
| OAuth credential management | 25 | 80 | +55 (multi-account) |
| Real-time execution monitoring | 80 | 88 | +8 (variable inspector) |
| Execution logs | 82 | 90 | +8 (per-node timing) |
| Claude Code agent mode | 25 | 80 | +55 (tool use) |
| Retry with backoff | 90 | 92 | +2 (polish) |
| **WEIGHTED AVERAGE** | **58** | **75** | **+17** |

**At v1 launch:**
- ✅ Canvases deploy as live endpoints
- ✅ 15 pre-built app integrations
- ✅ Workflows can trigger on schedule or webhook
- ✅ Persistent execution history and data storage
- ✅ OAuth with token refresh
- ✅ Variable inspector for debugging
- ✅ Claude agents with tool calling

---

## FINAL NOTES

### **Team Structure (4 people)**

1. **Backend Lead** (1 person, 16 weeks)
   - Owns: 1A (deployment runtime), 1A.2 (executor), 1B connectors (split), 1D (OAuth), 1F (agent mode)
   - Total: ~336 hours

2. **Frontend/Builder Lead** (1 person, 16 weeks)
   - Owns: 1B.1 (connector framework), 1C (storage adapters), 1E (observability), 1G.5 (onboarding)
   - Total: ~280 hours

3. **DevOps/Infrastructure Lead** (0.5 person, 16 weeks)
   - Owns: 1A.1 (API structure), 1A.4 (persistence), 1G (testing/load), 1G.3 (security)
   - Total: ~160 hours

4. **Second Builder** (1 person, weeks 10–16 only)
   - Owns: 1E (observability), 1G (polish), onboarding
   - Total: ~140 hours

**Total: ~916 hours ÷ 4 ≈ 229 hours per person ÷ 16 weeks = 14–15 hours/week per person (reasonable 1-2 day overlap for integration)**

### **Risk Mitigation**

1. **Slack OAuth takes longer than expected** → Start 1D.2 in Week 5 (with first connector)
2. **Agent mode complexity exceeds estimate** → Reduce to basic tool_use without streaming (remove 1F.4)
3. **Connector library grows beyond 15** → Stop at 10 core connectors, add others post-launch
4. **Supabase persistence proves unreliable** → Have S3 fallback ready (1C.5 in parallel)
5. **Load testing fails at 100 concurrent** → Reduce to 50, add horizontal scaling in Phase 2

### **Post-Launch Roadmap (Phase 2 & 3)**

**Phase 2 (v2, 2027 Q1):**
- Perplexity-style knowledge layer (web search, API search, RAG)
- Advanced agent features (delegation, memory, reflection)
- Real-time data retrieval nodes with citations
- Multi-turn agentic loops with human-in-the-loop approval

**Phase 3 (v3, 2027 Q3):**
- Multiplayer collaboration (Liveblocks)
- Team management, RBAC, audit logs
- Community node marketplace
- Self-host option (Docker, on-prem)

---

**This build plan is executable, detailed, and realistic. Each task is scoped, dependencies are clear, and the critical path is 16 weeks. Launch readiness target: 75/100 (credible v1).**