# CPO Review: Drag-and-Drop Automation Builder

**Date:** 2026-03-26
**Subject:** `packages/builder/` — Self-contained workflow automation builder
**Review Panel:** 3 CPO personas (Figma, n8n, Claude Code)

---

## CPO 1: Elena Voss — CPO of Figma

**Philosophy:** "Design tools must feel like an extension of your hand — zero friction, multiplayer-first, and obsessively fast."
**Strengths:** Visual systems, real-time collaboration, canvas-based UX
**Decision Style:** Ruthlessly cuts anything that breaks flow state. Ships pixel-perfect or not at all.

### Scores

| Category | Score | Notes |
|----------|-------|-------|
| Core Features | 72 | 14 node types, execution engine, templates, workspaces — solid breadth |
| UI/UX Quality | 48 | Functional but far from polished. No animation on connections, no snap-to-grid, no alignment guides |
| Onboarding & Setup | 40 | Start screen is bare. No interactive tutorial, no example walkthroughs |
| Performance | 65 | React Flow handles rendering well, but localStorage-only persistence is a ceiling |
| Customization | 70 | Good node type variety, custom node support, template system |
| Team & Collaboration | 15 | Completely single-player. No multiplayer cursors, no sharing, no comments on nodes |
| **Weighted Overall** | **52** | |

### Review

**What's working:**
- The `NodePalette` drag-and-drop interaction model is correct — categorized, collapsible, with grip affordances. This is table stakes for a canvas builder but you've got it right.
- The `NodeInspector` side panel pattern (300px, contextual to selection) is the standard approach and works. Good use of per-node-type editors.
- Auto-layout (`auto-layout.ts`) with row-aware spacing is a smart foundation. The `ROW_THRESHOLD` grouping logic prevents the chaos you get with naive force-directed layouts.

**What's broken — from a Figma lens:**

1. **No snap-to-grid or alignment guides.** In `flow-canvas.tsx`, nodes are freely positioned. When users drag 15+ nodes, the canvas becomes visual soup. Figma's entire value is spatial precision. You need:
   - Smart guides (show red lines when nodes align horizontally/vertically)
   - Snap-to-grid (optional, toggleable)
   - Distribute evenly (horizontal/vertical)

2. **The undo/redo system serializes the entire state on every change** (`use-undo-redo.ts:26` — `JSON.stringify({ nodes, edges })`). With 50+ nodes this will stutter. Figma uses operation-based undo (CRDTs). At minimum, debounce the snapshot capture — right now a single drag creates dozens of snapshots as React Flow fires `onNodesChange` per frame.

3. **No multiplayer, no comments, no presence.** The `WorkflowBuilder` is entirely localStorage-bound. There's no concept of sharing a build. For a tool this visual, collaboration isn't a nice-to-have — it's the difference between a toy and a product.

4. **The start screen lacks visual previews.** In `workflow-builder.tsx:380-506`, you show workspace names with metadata (node count, relative time) but no thumbnail. Figma's file browser shows a canvas preview. Even a simple SVG minimap snapshot would transform the start screen.

5. **Node grouping UX is hidden.** Groups exist (`use-node-groups.ts`, colored borders in `flow-canvas.tsx:61-68`) but discovery is poor — it's buried in the context menu. Should be a first-class toolbar action with visual affordance.

**Priority fixes:**
- **P0:** Debounce undo/redo snapshots (performance cliff at scale)
- **P0:** Add alignment guides for node placement
- **P1:** Workspace thumbnail previews on start screen
- **P1:** Make node groups discoverable (toolbar, not just context menu)
- **P2:** Real-time collaboration infrastructure

---

## CPO 2: Marcus Chen — CPO of n8n

**Philosophy:** "Automation is about connecting things that don't want to be connected. Every node should be a bridge, not a wall."
**Strengths:** Workflow execution, integration breadth, error recovery, credential management
**Decision Style:** Ships fast, iterates on execution reliability. Favors practical over pretty.

### Scores

| Category | Score | Notes |
|----------|-------|-------|
| Core Features | 55 | Node types are SupraLoop-specific, not general automation primitives |
| UI/UX Quality | 60 | Clean dark theme, adequate inspector, but sparse execution feedback |
| Onboarding & Setup | 35 | No guided setup, no "try this example" flow |
| Performance | 58 | Topological sort is correct but execution is fully sequential |
| Reliability | 35 | No retry logic, no error recovery, workflow dies on first LLM failure |
| Customization | 55 | Template system works, but no node marketplace or community sharing |
| **Weighted Overall** | **50** | |

### Review

**What's working:**
- The `workflow-engine.ts` execution model is sound. Kahn's algorithm for topological sort (`getExecutionOrder`), proper cycle detection in `validateWorkflow`, and the condition branching logic that propagates skips downstream — this is correct graph execution.
- The `conditionNode` evaluator (`workflow-engine.ts:243-299`) handles a useful subset: `contains X`, `length > N`, `score > 80` patterns. Practical without over-engineering an expression language.
- The `AIFlowChat` component is a genuine differentiator. Natural language flow building ("Create a team of 3 focused on growth") is something n8n is actively working toward. You're ahead here.

**What's broken — from an n8n lens:**

1. **No retry or error recovery.** In `executeWorkflow` (`workflow-engine.ts:395-433`), when a step fails, it catches the error and... moves on. No retry count, no exponential backoff, no circuit breaker. For an LLM-heavy workflow where API calls fail 5-10% of the time, this means users will see partial executions constantly. n8n retries 3x by default with configurable backoff.

2. **Execution is purely sequential.** The `for` loop at line 372 processes steps one at a time. Independent branches (nodes with no data dependency) should execute in parallel. With LLM nodes taking 2-5 seconds each, a 10-node workflow takes 20-50 seconds when it could take 5-10 seconds. n8n runs independent branches concurrently.

3. **No credential/secret management.** The API key is passed as a prop or pulled from `localStorage` (`workflow-builder.tsx:287-291`). There's no credential store, no encryption, no per-node credential binding. If you're calling external APIs from output nodes or LLM nodes, credentials are just floating in plaintext. This is a security gap.

4. **The `transformNode` and `outputNode` don't actually transform or output.** Looking at `workflow-engine.ts:301-315`, both just return descriptive strings. The transform node says "would apply map/filter" but doesn't execute anything. The output node says "would send to api://..." but doesn't make any HTTP call. These are placeholders pretending to be features. In n8n, every node actually does what it says.

5. **No webhook/schedule triggers actually work.** The `triggerNode` (`workflow-engine.ts:195-198`) just returns a string regardless of trigger type. A "webhook" trigger doesn't listen for webhooks. A "schedule" trigger doesn't run on a schedule. The UI lets users select these options but they're decorative.

6. **No execution history.** There's no way to see past runs, compare outputs, or debug why a workflow failed last Tuesday. The `WorkflowExecution` object lives in component state and vanishes on unmount.

7. **No data passing between nodes.** The `StepContext.inputs` (`workflow-engine.ts:177`) passes string outputs, but there's no structured data model. n8n passes JSON objects between nodes with field mapping. Here, everything is concatenated text.

**Priority fixes:**
- **P0:** Implement retry logic with configurable attempts on LLM nodes
- **P0:** Make transform/output nodes actually execute (HTTP calls, data transforms)
- **P0:** Parallel execution of independent branches
- **P1:** Execution history persistence
- **P1:** Structured data passing (JSON, not string concatenation)
- **P1:** Credential store with encryption
- **P2:** Real webhook listener and cron scheduler for triggers

---

## CPO 3: Kara Ochoa — CPO of Claude Code

**Philosophy:** "The best tool is one that understands intent, not just instructions. AI should amplify human judgment, not replace it."
**Strengths:** AI-native UX, developer experience, context-aware assistance, agentic workflows
**Decision Style:** Favors depth over breadth. Would rather one AI feature work brilliantly than ten work okay.

### Scores

| Category | Score | Notes |
|----------|-------|-------|
| Core Features | 65 | Good AI integration points, but LLM node is shallow |
| UI/UX Quality | 62 | Clean inspector, good node variety, but AI chat is an afterthought |
| Onboarding & Setup | 45 | AI chat gives hints but no guided "build your first flow" experience |
| Performance | 55 | No streaming, no token tracking, no cost estimation |
| Customization | 68 | Provider selection, temp/max tokens, system prompts — good foundation |
| Auth & Security | 30 | API key in localStorage, sent in request bodies, no encryption |
| **Weighted Overall** | **55** | |

### Review

**What's working:**
- The `LLMNode` design is architecturally right — provider selection (Claude, Claude Code, Ollama, custom), temperature slider, max tokens, system prompt. The inspector in `node-inspector.tsx:466-541` gives users meaningful control. This is better than most visual builders that hide LLM params behind "simple/advanced" toggles.
- The `AIFlowChat` natural language builder is the strongest feature in the product. Being able to say "Build a pipeline with Claude and conditions" and get a working flow applied to canvas — that's the kind of AI-native UX that Claude Code embodies. The integration of `onApplyFlow` with "Apply to Canvas" buttons inline in chat messages is well done.
- Supporting Claude Code as an agent provider (`provider: "claude-code"`) alongside standard API calls shows good understanding of the agentic vs. API distinction.

**What's broken — from a Claude Code lens:**

1. **No streaming for LLM responses.** In `workflow-engine.ts:213-235`, the LLM execution does a single `fetch` and waits for the complete response. For Claude Opus calls that take 30-60 seconds, users stare at "Running..." with zero feedback. Claude Code streams every response. You should:
   - Use `ReadableStream` from the API
   - Show partial output in the execution panel as tokens arrive
   - Display token count and estimated cost

2. **The AI chat has no context awareness.** `AIFlowChat` sends the last 6 messages as history (`ai-flow-chat.tsx:89`), but it doesn't send the full node configuration — just `currentNodes` and `currentEdges` as raw React Flow objects. The AI can't understand what your personas are configured to do, what your conditions check, or what your LLM prompts say. It's building blind. Claude Code has full project context. Your chat needs:
   - Summarized node configurations (not raw React Flow JSON)
   - Current execution state and recent outputs
   - Template context (what category, what the user is trying to build)

3. **No prompt chaining or variable interpolation.** The LLM node's system prompt is static text. There's no way to reference outputs from upstream nodes in the prompt (e.g., `{{persona.output}}` or `{{trigger.data}}`). In Claude Code, tool results flow into subsequent prompts. Your builder needs a template syntax for prompts that references upstream data.

4. **No token/cost tracking.** Users have no idea how much a workflow execution costs. With Claude Opus at $15/M input tokens, a 10-node workflow with LLM calls could cost $0.50-$5.00 per run. There's no budget guard, no cost estimate, no token counter. Claude Code shows token usage prominently.

5. **Error messages from LLM failures are raw.** In `workflow-engine.ts:228-229`, a failed LLM call throws `LLM API error: ${errText}` which could be a raw 500 response body. Users need human-readable error messages: "Your API key may be invalid", "Rate limit exceeded — try again in 30s", "Model not available".

6. **The `claude-code` provider path is identical to the `claude` path.** At `workflow-engine.ts:212`, both providers hit the same endpoint with the same payload. Claude Code is an agentic runtime — it should support multi-turn tool use, file operations, and iterative execution. Currently it's just another API call wearing a different label.

**Priority fixes:**
- **P0:** Streaming LLM responses with progressive output display
- **P0:** Prompt template syntax with upstream data references (`{{nodeId.output}}`)
- **P1:** Token counting and cost estimation per execution
- **P1:** Rich context in AI chat (summarized node configs, not raw JSON)
- **P1:** Human-readable LLM error messages with actionable suggestions
- **P2:** True Claude Code agent mode (multi-turn, tool use, file ops)

---

## Consensus Gap Analysis

| Category | Figma CPO | n8n CPO | Claude Code CPO | Avg | Best-in-Class | Gap | Priority |
|----------|-----------|---------|-----------------|-----|---------------|-----|----------|
| Core Features | 72 | 55 | 65 | 64 | 90 (n8n) | 26 | HIGH |
| UI/UX Quality | 48 | 60 | 62 | 57 | 92 (Figma) | 35 | HIGH |
| Onboarding | 40 | 35 | 45 | 40 | 78 (Figma) | 38 | HIGH |
| Performance | 65 | 58 | 55 | 59 | 85 (n8n) | 26 | HIGH |
| Reliability | — | 35 | — | 35 | 88 (n8n) | 53 | CRITICAL |
| Auth & Security | — | — | 30 | 30 | 82 (Claude Code) | 52 | CRITICAL |
| Customization | 70 | 55 | 68 | 64 | 85 (n8n) | 21 | MED |
| Collaboration | 15 | — | — | 15 | 95 (Figma) | 80 | CRITICAL |

### Top 5 Improvements by Impact

| # | Improvement | Category | CPO Source | Impact |
|---|-------------|----------|------------|--------|
| 1 | Add retry logic + error recovery for LLM/action nodes | Reliability | n8n | Prevents broken runs, biggest user frustration |
| 2 | Implement streaming LLM responses with progressive display | Performance | Claude Code | Transforms 30s waits into interactive feedback |
| 3 | Make transform/output nodes actually execute operations | Core Features | n8n | Currently decorative — breaks user trust |
| 4 | Add alignment guides + snap-to-grid for canvas | UI/UX | Figma | Prevents visual chaos at scale |
| 5 | Prompt template syntax with upstream data references | Core Features | Claude Code | Unlocks real LLM chaining (the whole point) |

### Overall Assessment

**Weighted Overall: 53/100**

The automation builder has strong architectural bones — React Flow canvas, topological execution engine, 14 node types, AI chat assistant, undo/redo, workspaces, and templates. The codebase is well-structured as a self-contained package (`packages/builder/`) with clean separation of concerns.

However, the builder is currently a **visual mockup of an automation tool** rather than a real one. The critical gap: most nodes don't actually do what they claim. Transform nodes don't transform. Output nodes don't output. Webhook triggers don't listen. This erodes user trust faster than any missing feature.

The three CPOs agree on two themes:
1. **Execution must be real, not simulated** — retry logic, parallel branches, streaming, actual HTTP calls
2. **The AI integration (chat + LLM nodes) is the differentiator** — double down on prompt chaining, context awareness, and streaming to make this the best AI workflow builder, not the best generic one
