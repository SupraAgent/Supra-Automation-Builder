# CPO REVIEW: SupraLoop Automation Builder

**Composite Review Panel:** Figma + n8n + Perplexity CPO Lenses  
**Date:** March 27, 2026  
**Reviewers:** Elena Voss (Figma), Marcus Chen (n8n), Kara Ochoa (Claude Code/Perplexity)

---

## 1. CURRENT STATE AUDIT

### What Exists Today

**The Product Structure:**
SupraLoop is a *dual-purpose* system. It ships as a Next.js 15 monorepo with:
- A main application (`src/`) for **product/team benchmarking** (the core SupraLoop workflow)
- A **publishable builder package** (`packages/builder/`) that's a self-contained, reusable visual workflow editor

**The Builder Package** (`@supra/builder`) is the closest thing to the "automation builder" the research doc envisions. It's a React component library built on xylflow, exportable via tsup, with:

#### **What's Built** (14 node types)

**Domain nodes (SupraLoop-specific):**
- PersonaNode — AI team member with role, expertise, vote weight
- AppNode — Project description (target users, core value, state)
- CompetitorNode — Benchmark reference app
- ActionNode — SupraLoop workflow step (score/analyze/improve/generate/commit)
- StepNode — Pipeline progress indicator
- ConsensusNode — Weighted voting aggregation (computes real weighted averages)
- AffinityCategoryNode — Scoring category with weight/score
- NoteNode — Freeform annotation
- ConfigNode — Git-tracked config files (YAML/JSON rendering)
- UserNode — Custom user-created nodes (extensible)

**Workflow nodes (toward automation):**
- TriggerNode — manual|schedule|webhook|event (config stored as text)
- ConditionNode — Branch logic (has "true"/"false" handles)
- TransformNode — map|filter|merge|extract|custom operations
- OutputNode — log|api|file|notify|github destinations
- LLMNode — Multi-provider (Claude, Claude Code agent mode, Ollama, custom) with streaming

#### **What's Scaffolded** (partially built, not production-ready)

1. **Execution Engine** (`workflow-engine.ts`, 1237 lines)
   - ✅ Topological sort (Kahn's algorithm) — respects visual graph order
   - ✅ Parallel execution with concurrency limiter (MAX=3 LLM nodes)
   - ✅ Retry with exponential backoff (3x, 1-16s delays)
   - ✅ Prompt interpolation (`{{nodeId.output}}`, `{{nodeId}}` shorthand)
   - ✅ Token tracking with model-specific pricing (Claude, older models)
   - ✅ Human-readable error messages (401, 429, 403, timeout, billing)
   - ✅ Structured data flow (`ctx.structured` map passes JSON between nodes)
   - ✅ Streaming LLM responses (SSE-based, progressive text display)
   - ❌ **No actual trigger execution** — TriggerNode config is just text, no cron/webhook listener
   - ❌ **No real webhooks** — No URL endpoints, no deployment targets
   - ❌ **No database integrations** — HTTP/API node exists (type = "api"), but no Postgres, MySQL, Supabase, MongoDB
   - ❌ **No auth backends** — No OAuth credential rotation, no multi-account support, only localStorage encryption

2. **Canvas & UX**
   - ✅ xylflow-based drag-and-drop with 14 custom node types
   - ✅ Magnetic snap-to-grid alignment (nodes physically snap to grid positions)
   - ✅ Distribute evenly (horizontal/vertical alignment across selected nodes)
   - ✅ Undo/redo with history stack
   - ✅ Copy/paste nodes
   - ✅ Group selection with color-coded visual containers
   - ✅ Mobile toolbar (touch device detection, swipe-to-dismiss)
   - ✅ Node inspector sidebar (edit node properties)
   - ✅ Node context menu (right-click, duplicate, delete)
   - ✅ Template system (save/load/star workflows, built-in templates)
   - ✅ Workspace manager (multiple independent canvases per session)
   - ✅ SVG thumbnails on workspace list (visual preview of each saved canvas)
   - ✅ Execution history (last 20 runs with status, tokens, cost)
   - ✅ Execution comparison view (diff two runs side-by-side)
   - ✅ Real-time execution monitor (highlight running nodes, streaming output)
   - ❌ **No collaborative editing** — Single-player only (deferred per design)
   - ❌ **No smart spacing indicators** — No pixel distance visualization
   - ❌ **No sub-flow/component nesting** — Flows are flat
   - ❌ **No guided onboarding** — Start screen shows template gallery, no walkthrough

3. **AI Assistance**
   - ✅ **Builder Chat** — Natural language to flow generation (`/api/flow-chat`)
   - ✅ AI detects intent: "create a trigger", "add a consensus node", "save as template"
   - ✅ AI generates `flow-json` blocks with properly positioned nodes
   - ✅ AI generates `user-node` definitions (user can define custom node types via chat)
   - ✅ AI generates `save-template` directives
   - ✅ LLM node supports streaming via `/api/flow-execute-llm` (SSE)
   - ✅ Claude Code agent mode (separate code path, wraps output with `[Agent Mode]` context)
   - ❌ **No multi-turn agentic loops** — Agent mode wraps output but doesn't support tool_use/function calling
   - ❌ **No AI copilot for building** — Chat is external sidebar, not inline suggestions
   - ❌ **No RAG/knowledge retrieval** — No vector DB integration, no doc ingestion

4. **Deployment & Operations**
   - ✅ localStorage persistence (workspace state, templates, credentials)
   - ✅ Encrypted credential store (AES-GCM + PBKDF2 key derivation)
   - ✅ Export/import workflows as JSON
   - ✅ GitHub integration (read repos, fetch profiles via octokit)
   - ❌ **No live deployment** — Workflows don't become URLs or endpoints
   - ❌ **No serverless execution** — No Val Town–style instant deploy
   - ❌ **No self-host option** — Frontend-only, requires Supabase backend
   - ❌ **No API-first architecture** — Canvas data tied to React component lifecycle

#### **What's Missing Entirely**

1. **Production integration layer:**
   - No real HTTP/REST node (type="api" outputNode exists, but doesn't execute)
   - No database connectors (Postgres, MySQL, MongoDB, Supabase, Airtable)
   - No pre-built app integrations (Slack, Gmail, Notion, Stripe, HubSpot)
   - No webhook listeners with live URLs
   - No cron scheduler that fires on schedule

2. **Observability:**
   - No per-node execution logs with I/O visibility
   - No real-time run monitor (visual execution tree)
   - No version history/branching
   - No failure alerting (email/Slack notifications on error)
   - No usage analytics (run counts, latency P50/P99, cost/workflow)

3. **Enterprise readiness:**
   - No multi-user management
   - No RBAC (role-based access control)
   - No audit logs
   - No SLA/uptime guarantees
   - No on-prem deployment

4. **Data layer:**
   - No built-in data store (SQLite, key-value per workflow)
   - No file handling (upload, transform, store PDFs/CSVs)
   - No stateful workflows (all data flows are ephemeral, per-execution)

### Code Metrics

- **Builder package:** 3,200+ lines (lib + components)
- **Workflow engine:** 1,237 lines (topological sort, execution, retry logic)
- **Node implementations:** 14 node types, ~500 lines
- **API endpoints:** 28 routes (mostly SupraLoop app, 2 dedicated to builder: `/flow-chat`, `/flow-execute-llm`)
- **Tech stack:** React 19 + xylflow 12 + Next.js 15 + Tailwind 4 + Supabase + Anthropic SDK
- **Zero external automation integrations** — No n8n connectors, no Zapier sync, no Make/Integromat bridge

---

## 2. RESEARCH DOCUMENT REVIEW

### What's Sharp

1. **The formula is right:** "n8n (automation) + Figma (visual builder) + X = ?" correctly identifies the gap. The research doc understands that neither n8n nor Figma has nailed the other's strength.

2. **UX as moat:** "The competitive moat isn't any single feature. It's the UX layer." This is correct. CrewAI, Flowise, and n8n are functionally equivalent on the backend; the builder experience is the differentiator.

3. **Tier 1 (LangGraph) is well-reasoned:** Agent orchestration as the first post-launch phase is pragmatic. Multi-step reasoning, tool use, agent-to-agent delegation are table-stakes in 2026.

4. **Tier 2 (Val Town) deployment model:** "Every workflow gets a live URL" captures the actual shift users need. It's not enough to design automations; they need to *ship* them.

5. **Feature ratings are calibrated:** 9 features rated 90-100 (must-ship), 12 at 75-89 (high-value), 8 at 60-74 (nice-to-have). The weighting feels right for a launch product.

### What's Naive

1. **Assumes "instant deployment" without infrastructure:** Score 94 for instant deployment, but the research doc offers no deployment target. Val Town is mentioned as *a* runtime, not *the* runtime. Where does the workflow actually run? Cloud Functions? Edge? Self-host?

   **Reality:** Val Town itself is struggling (2% MoM growth, Feb 2026). Betting on Val Town's model without a fallback is risky.

2. **400+ integrations as a given:** n8n's integration moat is real, but the research doc assumes those integrations magically port to the new builder. They don't. The builder would need to either:
   - License n8n's integration framework (expensive, legal complexity)
   - Rebuild 400+ connectors from scratch (impossible timeline)
   - Start with 10-20 critical integrations (Slack, Notion, Stripe, Airtable) and grow

   **Honest take:** Launch with 15-25 pre-built connectors + HTTP escape hatch. That's v1 market-ready. The "400+ integrations" positioning is marketing speak, not product.

3. **Multiplayer as "growth accelerator, not core value prop":** Disagree. Liveblocks is deferred to Phase 3, but team collaboration unlocks 3x ARR faster than solo-user adoption. If the competitive set includes Zapier (which has teams), no-code requires multiplayer from launch.

4. **LLM node scores 91 (must-ship) but the research doc doesn't address hallucination/guardrails.** An LLM node that generates bad SQL or broken API calls can cascade failure across workflows. This needs:
   - Output validation (schema enforcement)
   - Human-in-the-loop checkpoints (approve before executing)
   - Retry with modified prompts (not just backoff)

   None of these are mentioned.

5. **"No vendor lock-in" philosophy missing:** The research doc doesn't grapple with platform stickiness. If workflows are JSON export, users can fork to a competitor at will. n8n solved this with 400 proprietary connectors. What's the lock-in for the new builder?

### What's Missing

1. **Cost structure:** Who pays for LLM inference? Users (bring-your-own-key)? Platform (SaaS model)? Hybrid? The pricing model determines GTM strategy, and it's not mentioned.

2. **Compliance & data governance:** GDPR, SOC2, data residency — enterprise buyers care. No mention.

3. **Execution reliability SLA:** n8n promises 99.9% uptime. What's the target for the builder? If it's a side feature of SupraLoop, it gets inherited lower priority.

4. **Competitive positioning vs. existing players:**
   - vs. Zapier: simpler UX, cheaper, no legacy code debt
   - vs. Make: more AI-native, easier learning curve
   - vs. Flowise: broader integrations, not just LLM chains
   - vs. CrewAI + AMP: enterprise features (Salesforce, Gmail triggers), agent delegation

   The document doesn't articulate a differentiation beyond "Figma-grade UX." That's table-stakes, not a moat.

---

## 3. THE X QUESTION: A CONTRARIAN TAKE

**The research doc proposes:** LangGraph (Phase 1), Val Town (Phase 2), Liveblocks (Phase 3).

**I argue:** The formula should be:

### **n8n (automation) + Figma (visual builder) + Perplexity (AI-native search + answer synthesis + real-time knowledge) = Agentic Workflow IDE**

Not LangGraph. Not Val Town. **Real-time knowledge retrieval + citation-backed reasoning.**

#### Why Perplexity, Not LangGraph?

**LangGraph is a framework for building agent loops.** It's powerful for multi-step reasoning and tool orchestration, but it's still *deterministic* in shape — you define the graph, agents follow it. It's better n8n, not fundamentally different.

**Perplexity's DNA is different:**

1. **Real-time knowledge retrieval** — Workflows don't operate in a vacuum. They need to check live data:
   - "What's the current price of BTC?" (markets)
   - "What's the status of order #12345?" (databases, APIs)
   - "Who are the top 10 contributors to this GitHub repo?" (web search, GitHub API)
   - "What's the competitor's latest pricing?" (web scrape + synthesis)

   A Perplexity-style "knowledge layer" lets nodes ask questions and get *grounded, cited answers* instead of hallucinating.

2. **Answer synthesis, not just retrieval** — Flowise/LangGraph nodes call APIs and return raw data. A Perplexity-style node would:
   - Fetch raw data from multiple sources (GitHub API + Slack API + Google Sheets)
   - Synthesize a natural-language summary with inline citations
   - Pass the structured *and* cited answer downstream

   Example: A node asks "Summarize last week's GitHub PR comments from repo X" → returns both JSON (PRs, timestamps) and natural text ("3 critical bugs mentioned by @alice") with citations.

3. **Citation chains as audit trail** — In automation, audit trails matter. "Why did this workflow make this decision?" A Perplexity-style node traces back:
   - "Decision was based on fact X (source: GitHub issue #123)"
   - "Fact Y was retrieved from Slack thread link"
   - "Confidence: 0.87 (2 sources agree, 1 disagrees)"

   This is non-trivial in automation. It's the difference between "the workflow did something" and "the workflow did something *accountable*."

4. **Real-time knowledge = better agent reasoning** — LangGraph agents reason over stale data. A Perplexity-style knowledge layer gives agents access to live data *within the agentic loop*:
   - Agent reason: "I should assign this support ticket to the engineer on-call"
   - Agent retrieves: "Who's on-call this week?" (hits PagerDuty API, gets citation)
   - Agent retrieves: "What's this engineer's current workload?" (hits Jira, gets citation)
   - Agent decides with fresh data, not a week-old snapshot

#### How This Changes the Product

The third ingredient isn't a deployment runtime or a framework. It's a **knowledge integration layer** that brings live, cited data into every workflow.

**v1 (launch):** Perplexity-style "knowledge nodes":
- **Web Search Node** — Query, return citations + structured summary
- **API Search Node** — Query multiple APIs, synthesize results with source tracking
- **Document Search Node** — RAG over uploaded docs, cite passages

**v2:** Agentic orchestration on top:
- Agents use knowledge nodes to *reason with live data*
- Multi-agent delegation based on real-time team availability
- Human-in-the-loop approval gates with cited evidence

**v3:** Multiplayer
- Team members review and approve decisions with full audit trail of sources
- Liveblocks for multiplayer canvas (but this is phase 3, not core)

#### Why This Matters

1. **Differentiation:** No one has shipped "Figma UX + n8n integration + real-time knowledge + agentic reasoning." That's a category.

2. **Enterprise lock-in:** Real-time knowledge + citations = workflows that are verifiable and compliant. Compliance-heavy industries (finance, healthcare, legal) will pay for this.

3. **Market timing:** LLMs without real-time knowledge are broken for production automation (hallucination, stale data). Perplexity-style synthesis is table-stakes in 2026.

4. **Competitive moat:** Figma has fast UX. n8n has integrations. Perplexity has *answer quality* (reasoning + citations). Combine all three, and you own the market.

---

## 4. GAP ANALYSIS: 5 HIGHEST-PRIORITY GAPS FOR V1

### **Priority 1: Real Deployment Targets (Score Impact: CRITICAL)**

**Current:** Workflows are canvas-only. Execution is in-browser or delegated to API.

**Missing:**
- No live URL per workflow (Val Town model)
- No scheduled cron execution (flows don't trigger on schedule, only manual + webhook text)
- No persistent webhook listener (TriggerNode has "webhook" type, but no listener endpoint)
- No step-function style orchestration (AWS Step Functions, Google Cloud Workflows)

**Gap:** Users can *design* workflows but not *deploy* them. Without this, the product is a prototype tool, not a platform.

**For v1, pick one:**
- **Option A:** Embed a lightweight Node.js runtime in the backend. Each workflow becomes a `/api/execute/{workflowId}` endpoint. Cron via node-cron.
- **Option B:** Partner with Val Town for real deployment. Workflows compile to Val Town functions.
- **Option C:** Ship as an n8n workflow importer. Users export JSON, import into n8n for execution.

**Recommendation:** Option A (lightweight Node.js runtime). It's fastest to ship and keeps the product self-contained. Val Town is too early-stage to bet on (2% MoM growth).

---

### **Priority 2: Pre-Built App Integrations (Score Impact: HIGH)**

**Current:** HTTP/API node exists, but no pre-built connectors.

**Missing:**
- Slack (post message, update status, read channels)
- Notion (read/write database, create pages)
- Airtable (CRUD records, create views)
- Stripe (create charge, list invoices, update subscription)
- GitHub (create issue, post comment, list commits)
- Google Sheets (append row, read range, create sheet)

**Gap:** Power users can use HTTP nodes, but 80% of users won't. Pre-built integrations = 10x faster user adoption.

**For v1:**
- Ship 10-15 pre-built connectors (Slack, Notion, Airtable, GitHub, Stripe, Gmail, Google Sheets, Sendgrid, HubSpot, Zapier list)
- Each connector is a React component that wraps HTTP calls + auth flow
- OAuth credential management baked in (token refresh, multi-account support)

**Recommendation:** Build the integrations in-house, don't license n8n's framework. It's faster and avoids legal complexity.

---

### **Priority 3: Persistent Data Storage (Score Impact: HIGH)**

**Current:** Workflows are stateless. Data flows are ephemeral (per-execution).

**Missing:**
- No workflow-scoped data store (key-value, SQLite, or PostgreSQL table)
- No cross-execution state (e.g., "save this user ID, use it in next run")
- No history of past executions (only in-memory execution history, last 20 runs)
- No data visualization (querying stored data, dashboards per workflow)

**Gap:** Stateless workflows are okay for ETL/webhooks, but real business automation needs state. Example: "Track which customers we've emailed this week, don't email them twice."

**For v1:**
- Add a **Data Store Node** type that reads/writes to a workflow-scoped PostgreSQL table
- Expose row counts, recent entries in the execution panel
- Add a **Query Node** that can read data store with filters

**Recommendation:** Use Supabase (already in the stack). Add a `workflows_data` schema with `{workflow_id, execution_id, key, value, created_at}`.

---

### **Priority 4: Observability & Debugging (Score Impact: MEDIUM)**

**Current:** Real-time execution monitor shows status, tokens, cost. No per-node debugging.

**Missing:**
- No step-through debugger (pause execution, inspect variables)
- No variable/context viewer during execution (see what data is flowing)
- No per-node error trace (where exactly did it fail?)
- No logging level control (verbose, info, warn, error)
- No performance profiling (which nodes are slowest?)

**Gap:** When a workflow fails, users have to guess. "Was it the LLM node or the output node?" Without debugging, complex workflows are impossible to build.

**For v1:**
- Add **Variable Inspector** (expandable JSON view of `ctx` and `ctx.structured` during execution)
- Add **Error Trace** (full stack trace, with node IDs and step numbers)
- Add **Node Timing** (ms per node, highlight slow nodes)

**Recommendation:** Real simple. Display all three in the execution panel. Don't over-engineer step-through debugger yet.

---

### **Priority 5: Multi-Turn Agent Mode (Score Impact: MEDIUM-HIGH)**

**Current:** LLMNode supports Claude Code agent mode, but it's shallow. Wraps output with `[Agent Mode]` context, no tool_use.

**Missing:**
- No function calling / tool use (agent can't invoke other nodes as tools)
- No multi-turn reasoning loop (agent reason → call tool → observe → reason again)
- No agent state persistence (agent context lost between runs)

**Gap:** Agent mode is labeled as supported, but it doesn't do anything an agentic system needs. It's a placeholder.

**For v1:**
- Implement Claude tool_use: Agent calls `tools.call_node({nodeId, inputs})` → gets node output
- Expose all upstream nodes as callable tools (transform, output, database, API)
- Render agent reasoning in execution panel (show thinking steps, not just final output)
- Support streaming of reasoning (render thoughts as they arrive)

**Recommendation:** Use Anthropic's tool_use APIs directly. 5-person-week effort, high impact.

---

## 5. CONTRARIAN TAKE: WHERE THE 3 CPOs DISAGREE

### **The Disagreement: Platform Deployment vs. User Bring-Your-Own-Key**

**Figma CPO (Elena):** "Workflows should be a team asset. We host execution, charge by runs, own SLA. Users don't manage infrastructure. The platform experience is pristine."

**n8n CPO (Marcus):** "Workflows should run where the user wants. Self-host option, API-first, let users deploy to their cloud. We commoditize the orchestration layer, not lock them in via infrastructure."

**Perplexity/Claude Code CPO (Kara):** "Workflows are code. They should live in the user's repository (GitHub), execute in the user's environment (GitHub Actions, Vercel, Render), and cost the user's cloud spend. The builder is just the IDE."

### **Who's Right?**

**None. And all.**

**Elena (Figma) is right about UX:** A managed platform means users never think about infra. Deploy-and-forget. That wins consumer/SMB.

**Marcus (n8n) is right about adoption:** Self-host wins with enterprises and power users who refuse vendor lock-in. That wins Fortune 500.

**Kara (Perplexity/Claude Code) is right about leverage:** If workflows live in GitHub and run on user infrastructure, the builder is infinitely scalable (no infra cost for the company). That wins at scale.

### **The Implication for SupraLoop**

SupraLoop is positioned as a **platform** (Figma lens: managed, hosted, SaaS). The builder should follow that. But the research doc hedges by offering Val Town (option B) as a deployment runtime. That's trying to be all three lenses at once, which waters down the product.

**Strong recommendation:** Pick one:

1. **Be Figma.** Managed platform. $50-500/month per user, charged on execution time. Users never see infrastructure. Execute on SupraLoop servers.

2. **Be n8n.** Self-host first. Workflows run on user's Docker, their cloud, their infrastructure. Platform is optional (lighter tier for users who don't self-host).

3. **Be Perplexity.** Workflows are files in GitHub. Builder is a VSCode extension + web IDE. Execution happens in user's CI/CD. Platform is a dashboard that reads from their repos.

SupraLoop today is a **Figma platform** (managed, Supabase backend, no self-host). The builder should commit to that, not pretend to be n8n or Perplexity. Lean into Figma: "One-click workflows for teams. We run 'em for you. You pay per run."

---

## CLOSING

### The Builder's Real Strength

The codebase shows **genuine thought on UX.** Magnetic snap, distribute evenly, SVG thumbnails, execution comparison — these are small touches that compound. The node inspector sidebar is thoughtful. The chat-to-canvas generation is clever.

What's missing isn't design; it's **breadth.** The builder is a 70% solution for designing workflows and a 20% solution for executing them in production.

### Path to v1 (Market-Ready)

**Core:** Canv + execution (already here, score 65/100)  
**Add:** Real deployment targets (Val Town or lightweight Node.js)  
**Add:** 15 pre-built integrations  
**Add:** Persistent data store  
**Add:** Variable inspector for debugging  
**Add:** Agent mode with tool_use  

**Timeline:** 6 months with 4-person team (2x builders, 1 backend, 1 devops).

**Launch score:** ~75/100 (approaching credible v1).

### The Biggest Risk

**Not shipping deployment.** A beautiful canvas that doesn't execute is Figma for automation, not a replacement for n8n. The research doc understands this ("instant deployment" scores 94). But the codebase doesn't have it yet. This is the bet: can the team build a real deployment layer before market pressure kills momentum?

---

**Final Assessment:** The builder is a **strong foundation** with genuine CPO thinking embedded in the UX. With focused effort on the 5 gaps above, it could be a credible alternative to Zapier/Make by 2026 EOY. The Perplexity-style knowledge layer is a blue-sky bet for 2027; don't delay v1 for it.