# CPO Review v2: Drag-and-Drop Automation Builder

**Date:** 2026-03-26
**Subject:** `packages/builder/` — Self-contained workflow automation builder
**Review Panel:** 3 CPO personas (Figma, n8n, Claude Code)
**Previous Score:** 53/100 (v1) -> **48.3/100** (post-PR#27 re-rating)
**Current Score:** See below

---

## What Changed Since v1 Review

### From PR #27 (already merged)
- Retry with exponential backoff (3 attempts, 1-16s delays)
- Eager dependency-graph executor with concurrency limiter (MAX=3 LLM)
- Snap-to-grid + visual alignment guides
- Transform/output nodes execute real operations
- Prompt template interpolation ({{nodeId.output}})
- Token/cost tracking with model-specific pricing
- Cancellation via AbortController + elapsed timer
- Human-readable LLM error messages
- Pulsing green border on executing nodes
- Execution history (last 20 runs)

### From This Round (new implementation)
1. **Streaming LLM responses** — Progressive output display with pulsing cursor during execution
2. **Structured JSON data flow** — `ctx.structured` map passes typed data between nodes, not just text
3. **Encrypted credential store** — AES-GCM encryption via Web Crypto API with PBKDF2 key derivation
4. **Enhanced trigger nodes** — Webhook/schedule/event triggers return structured metadata
5. **Real output node execution** — API calls send structured JSON, notify uses Notification API, log outputs structured data
6. **Claude Code agent mode** — Separate provider path with `[Agent Mode]` context wrapper
7. **ConsensusNode weighted voting** — Real calculation: extracts scores from upstream, applies vote weights, computes weighted average
8. **Magnetic alignment snap** — Nodes snap to alignment positions (not just visual guides)
9. **Distribute evenly** — Horizontal/vertical distribution of selected or all nodes
10. **Canvas thumbnail previews** — SVG minimap thumbnails on workspace start screen
11. **Execution comparison view** — Click two history entries to compare status, tokens, cost with diff highlighting
12. **All domain nodes emit structured data** — persona, app, competitor, consensus, affinity, step, config

---

## CPO 1: Elena Voss — CPO of Figma

**Philosophy:** "Design tools must feel like an extension of your hand — zero friction, multiplayer-first, and obsessively fast."

### Updated Scores

| Category | v1 Score | Current | Delta | Notes |
|----------|----------|---------|-------|-------|
| Core Features | 72 | 78 | +6 | Streaming output, structured data, consensus voting |
| UI/UX Quality | 48 | 68 | +20 | Magnetic snap, distribute evenly, thumbnails, streaming cursor |
| Onboarding & Setup | 40 | 48 | +8 | Thumbnail previews on start screen improve discoverability |
| Performance | 65 | 72 | +7 | Throttled streaming, magnetic snap doesn't stutter |
| Customization | 70 | 74 | +4 | Structured data enables richer node configurations |
| Team & Collaboration | 15 | 15 | 0 | Still single-player (deferred by design) |
| **Weighted Overall** | **52** | **62** | **+10** | |

### Review

> "The magnetic snap is exactly right. Nodes now physically snap to alignment positions — not just visual guides, actual magnetic pull. Combined with distribute evenly (both horizontal and vertical), the canvas finally feels like a precision tool. The SVG thumbnails on the workspace list are a small touch but they transform the start screen from a text list to a visual browser."

> "Streaming output with the pulsing cursor during LLM execution is a UX leap. Users no longer stare at 'Running...' — they see tokens flowing in real-time. The execution panel now shows progressive text as it arrives."

> "Still missing: no smart spacing indicators showing pixel distances between nodes, no component/sub-flow nesting, no collaborative editing. But for a single-player builder, this is now genuinely usable."

---

## CPO 2: Marcus Chen — CPO of n8n

**Philosophy:** "Automation is about connecting things that don't want to be connected. Every node should be a bridge, not a wall."

### Updated Scores

| Category | v1 Score | Current | Delta | Notes |
|----------|----------|---------|-------|-------|
| Core Features | 55 | 72 | +17 | Structured data flow, consensus voting, enhanced triggers |
| UI/UX Quality | 60 | 68 | +8 | Streaming output, comparison view, thumbnails |
| Onboarding & Setup | 35 | 42 | +7 | Better start screen with previews |
| Performance | 58 | 68 | +10 | Streaming prevents UI blocking during long LLM calls |
| Reliability | 35 | 65 | +30 | Retry + backoff + cancellation + encrypted credentials |
| Customization | 55 | 62 | +7 | Structured data enables field-level transforms |
| **Weighted Overall** | **50** | **64** | **+14** | |

### Review

> "The structured JSON data flow is the most important change. `ctx.structured` now passes typed objects between nodes — transforms can filter arrays, extract nested fields via dot notation, and map over structured data. Output nodes send JSON payloads instead of text. This unlocks real data pipelines."

> "The encrypted credential store using AES-GCM with PBKDF2 is proper security. API keys are no longer in plaintext localStorage. The migration path from legacy storage is clean."

> "ConsensusNode now actually computes weighted averages — it extracts scores from upstream personas, applies vote weights, and produces a real consensus score. This was purely decorative before."

> "Execution comparison is a nice touch — click two history entries and see a side-by-side diff of status, tokens, and cost with color-coded deltas. Useful for optimizing prompt costs."

> "Still want: a dedicated HTTP Request node (not just output-type=api), database connectors, real webhook listeners with URL endpoints, and a cron scheduler that actually fires on schedule."

---

## CPO 3: Kara Ochoa — CPO of Claude Code

**Philosophy:** "The best tool is one that understands intent, not just instructions. AI should amplify human judgment, not replace it."

### Updated Scores

| Category | v1 Score | Current | Delta | Notes |
|----------|----------|---------|-------|-------|
| Core Features | 65 | 76 | +11 | Streaming, structured output, agent mode |
| UI/UX Quality | 62 | 72 | +10 | Streaming cursor, structured data viewer, comparison |
| Onboarding & Setup | 45 | 50 | +5 | Thumbnails help, but still no guided tour |
| Performance | 55 | 70 | +15 | Streaming eliminates the 30s blank stare |
| Customization | 68 | 74 | +6 | Structured data enables JSON field extraction in prompts |
| Auth & Security | 30 | 58 | +28 | Encrypted credential store with AES-GCM |
| **Weighted Overall** | **55** | **68** | **+13** | |

### Review

> "Streaming LLM responses is transformative. The execution panel now shows tokens flowing in real-time with a pulsing cursor. Users see the AI thinking instead of staring at a spinner. The SSE-based streaming route handles backpressure correctly and sends usage data as a final event."

> "The structured data viewer (expandable JSON in each step's output) lets users inspect the exact data flowing between nodes. Combined with {{nodeId.output}} interpolation, you can now build real LLM chains where each step's structured output feeds the next step's prompt."

> "Claude Code agent mode is differentiated but still shallow — it wraps output with [Agent Mode] but doesn't yet support multi-turn tool use. The foundation is there (provider check, separate code path) but the agentic loop needs to be built. This is the next big leap."

> "The credential store is solid — AES-GCM encryption with PBKDF2 key derivation, configurable passphrase, and automatic migration from plaintext keys. This addresses the biggest security gap from v1."

---

## Consensus Gap Analysis

| Category | Figma CPO | n8n CPO | Claude Code CPO | Avg | Best-in-Class | Gap | Priority |
|----------|-----------|---------|-----------------|-----|---------------|-----|----------|
| Core Features | 78 | 72 | 76 | 75 | 90 (n8n) | 15 | MED |
| UI/UX Quality | 68 | 68 | 72 | 69 | 92 (Figma) | 23 | HIGH |
| Onboarding | 48 | 42 | 50 | 47 | 78 (Figma) | 31 | HIGH |
| Performance | 72 | 68 | 70 | 70 | 85 (n8n) | 15 | MED |
| Reliability | — | 65 | — | 65 | 88 (n8n) | 23 | HIGH |
| Auth & Security | — | — | 58 | 58 | 82 (Claude Code) | 24 | HIGH |
| Customization | 74 | 62 | 74 | 70 | 85 (n8n) | 15 | MED |
| Collaboration | 15 | — | — | 15 | 95 (Figma) | 80 | DEFERRED |

### Overall Score: 64.7/100 (up from 48.3)

### Progress Tracker

| Round | Score | Delta | Key Changes |
|-------|-------|-------|-------------|
| v1 (initial) | 53 | — | 14 node types, canvas, templates, basic engine |
| Post-PR#27 | 48.3 | -4.7 | Re-scored more critically (retry, parallel, alignment) |
| v2 (current) | 64.7 | +16.4 | Streaming, structured data, credentials, consensus, snap, distribute, thumbnails, comparison |

### Remaining Priorities (Collaboration deferred)

| # | Improvement | Category | CPO Source | Score Gap |
|---|-------------|----------|------------|-----------|
| 1 | Interactive onboarding / guided tour | Onboarding | All | 31 |
| 2 | Multi-turn agent loop for Claude Code | Core | Claude Code | 15 |
| 3 | Dedicated HTTP Request / Database nodes | Core | n8n | 15 |
| 4 | Real webhook listener with URL endpoint | Reliability | n8n | 23 |
| 5 | Cron scheduler that fires on schedule | Reliability | n8n | 23 |
| 6 | Smart spacing indicators (px distances) | UI/UX | Figma | 23 |
| 7 | Sub-flow / component nesting | Customization | Figma | 15 |
| 8 | Credential rotation and per-node binding | Security | Claude Code | 24 |
