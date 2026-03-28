# CPO Next Steps: Action Plan

Based on Snobby Coder (5/10), Devil's Advocate (REVISE), Sherlock Holmes (6 mysteries), and code audits (38 issues total).

---

## SECTION 1: IMMEDIATE — Fix Before Any New Feature Work

### Week 1: Security & Credential Handling (5 issues)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 1 | Silent credential decryption failures | `packages/builder/src/lib/credential-store.ts` | Surface errors to UI, don't return null silently |
| 2 | API keys stored plaintext in localStorage | `packages/builder/src/components/builder-chat.tsx`, `workflow-builder.tsx` | Move to encrypted credential store |
| 3 | Missing auth on 28+ API routes | `src/app/api/**/*.ts` | Add `requireAuth()` to ALL routes |
| 4 | API key exposure in error messages | `src/app/api/flow-execute-llm/route.ts` | Filter credentials from all error objects |
| 5 | saveCredentials() not error-handled | `packages/builder/src/lib/credential-store.ts` | Wrap in try-catch, show modal on failure |

### Week 1: Promise & Async Handling (4 issues)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 6 | Unhandled promise in execution engine | `packages/builder/src/lib/workflow-engine.ts:1213` | Add `.finally()` to clean up inFlightNodes |
| 7 | Promise swallowing in chat | `packages/builder/src/components/builder-chat.tsx:226` | Use `finally { setLoading(false); }` |
| 8 | Stream reading with no error recovery | `packages/builder/src/lib/workflow-engine.ts:404` | Add catch handler on reader |
| 9 | Streaming race condition | `src/app/builder/page.tsx:19-40` | Unique stream per LLM call |

### Week 2: Input Validation & Parsing (3 issues)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 10 | ReDoS vulnerability (unsafe regex) | `packages/builder/src/lib/workflow-engine.ts:580,638,687` | Add `safeRegex()` wrapper with timeout |
| 11 | Condition node crash on null match | `packages/builder/src/lib/workflow-engine.ts:507-521` | Add null check before destructuring |
| 12 | No maxTokens validation | `packages/builder/src/lib/workflow-engine.ts:359` | Cap at 100,000 tokens |

### Week 2: Race Conditions & Data Loss (3 issues)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 13 | localStorage quota not checked | `packages/builder/src/hooks/use-workspaces.ts` | Catch QuotaExceededError, show dialog |
| 14 | Workspace race condition (multi-tab) | `packages/builder/src/hooks/use-workspaces.ts` | Add version field, check before save |
| 15 | Corrupted JSON silently dropped | `packages/builder/src/lib/credential-store.ts` | Log parse errors, show warning banner |

### Week 2: XSS & Injection (3 issues)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 16 | XSS via user node definitions | `packages/builder/src/components/builder-chat.tsx` | Sanitize all user input with DOMPurify |
| 17 | Prototype pollution risk | `packages/builder/src/lib/workflow-engine.ts:432` | Validate parsed JSON, reject __proto__ |
| 18 | Duplicate execution IDs | `packages/builder/src/lib/workflow-engine.ts:272` | Use crypto.randomUUID() instead of Date.now() |

### Week 3: Architecture Cleanup (from Sherlock Holmes)

| # | Issue | File(s) | Fix |
|---|-------|---------|-----|
| 19 | Missing node summaries in canvas-summary | `packages/builder/src/lib/canvas-summary.ts` | Add 4 missing switch cases (15 min) |
| 20 | Merge twin chat components | `builder-chat.tsx` + `ai-flow-chat.tsx` | Merge into one with optional prop |
| 21 | Domain nodes in generic builder | `packages/builder/src/components/nodes/` | Move to host app customNodeTypes |
| 22 | Module-level mutable storage prefix | `packages/builder/src/lib/credential-store.ts` | Move to React context |
| 23 | Hardcoded Ollama localhost | `packages/builder/src/lib/workflow-engine.ts:455` | Add configurable endpoint + timeout |
| 24 | Weak ID generation in clipboard | `packages/builder/src/hooks/use-clipboard.ts` | Use uid() from utils |

**Total effort: ~3 weeks before resuming feature work.**

---

## SECTION 2: REVISED BUILD PLAN (22 Weeks)

### Changes from Original

| Original | Revised | Reason |
|----------|---------|--------|
| 16 weeks | **22 weeks** | Effort underestimated 2x (Snobby Coder) |
| 15 connectors | **5 for v1, 9 by v1.1** | 15 in 6 weeks impossible (both reviewers) |
| OAuth at Week 8 | **OAuth at Week 1-4** | Dependency inversion fix |
| Observability at Week 10 | **Observability at Week 6** | Needed to debug connectors |
| Full agent mode | **Basic tool_use only** | API instability risk, defer full to v2 |

### Revised Timeline

**Weeks 1-3: Bug Fixes + Security (see Section 1 above)**

**Weeks 4-7: Foundation + OAuth**
- Deployment Runtime API (`POST /api/execute/{workflowId}`)
- Backend Execution Engine (server-side workflow-engine)
- Cron Scheduler + Job Queue (node-cron + Bull)
- OAuth Abstraction Framework (provider registry, token refresh)
- Error handling + logging

**Weeks 8-10: First 5 Connectors + Storage**
- Connector Framework (interface, registry, executor)
- Slack, Notion, Airtable, GitHub, Stripe connectors
- StorageAdapter interface + LocalStorageAdapter + SupabaseAdapter

**Weeks 11-12: Observability + OAuth Token Refresh**
- Variable Inspector (JSON viewer for ctx during execution)
- Error Tracing + Per-Node Timing
- OAuth Token Refresh + Multi-Account support

**Weeks 13-15: More Connectors + Refinement**
- Gmail, Google Sheets, SendGrid, HubSpot connectors
- Integration testing across all connectors

**Weeks 16-18: Agent Mode (Basic) + Polish**
- Basic tool_use only (agents call nodes as tools, max 3 calls/turn)
- NO streaming reasoning, NO multi-turn loops (defer to v2)
- Testing, documentation, onboarding

**Weeks 19-22: Buffer + Beta**
- Security audit + penetration testing
- Performance profiling
- Beta user feedback
- Phase 2 planning

### What's NOT in v1 (Deferred)

**Phase 2 (v1.1):**
- Full agent reasoning + multi-turn loops
- Streaming reasoning display
- More connectors (Discord, Linear, Typeform, Twitter/X)
- Step-through debugger
- Knowledge layer (Web Search node with citations)

**Phase 3 (v2.0):**
- Multiplayer canvas (Liveblocks)
- Community node marketplace
- Version control for workflows
- Team management + RBAC
- Self-host option (Docker)

---

## SECTION 3: STRATEGIC DECISIONS NEEDED

### Decision 1: Managed SaaS vs Self-Hosted
**Deadline:** End of Week 1
**Recommendation:** Managed SaaS (Figma model)
- You host the runtime, users click "Deploy"
- Revenue: subscription + usage-based
- Current architecture already assumes this

### Decision 2: Who Pays for LLM Inference
**Deadline:** End of Week 8
**Options:**
- A) You pay, users don't (subscription covers it) — simpler but margin risk
- B) Users bring own API keys (n8n model) — zero cost but adoption barrier
- C) Hybrid: free tier = own keys, paid tier = pooled access
**Recommendation:** Start with B (own keys), add C in v1.1

### Decision 3: Pricing Model
**Deadline:** End of Week 8
**Recommendation:** Subscription
- Starter: $49/mo (100 executions, 5 connectors)
- Pro: $199/mo (2000 executions, all connectors)
- Business: $599/mo (10k executions, SSO, priority support)

### Decision 4: Target User Persona (Pick ONE)
**Deadline:** End of Week 2
**Options:**
- A) No-code power users (Zapier escapees) — largest market
- B) GTM/RevOps teams — highest willingness to pay
- C) AI researchers — smallest but most passionate
**Recommendation:** A for v1, expand to B after PMF

### Decision 5: How Many Connectors to Ship
**Deadline:** End of Week 4
**Recommendation:**
- v1.0: 5 (Slack, Notion, Airtable, GitHub, Stripe)
- v1.1: 9 (add Gmail, Sheets, SendGrid, HubSpot)
- v1.2: 12+ (add Discord, Linear, Typeform)

---

## WEEK-BY-WEEK SUMMARY

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Security fixes + credential handling | All auth/credential issues fixed |
| 2 | Validation, race conditions, XSS | All input validation + data safety fixed |
| 3 | Architecture cleanup (Sherlock items) | Merged chat components, moved domain nodes |
| 4-5 | Deployment Runtime API | `POST /api/execute/{workflowId}` works |
| 6-7 | Backend Executor + Scheduler | Cron + webhooks fire workflows server-side |
| 8-10 | 5 Connectors + Storage | Slack/Notion/Airtable/GitHub/Stripe + persistence |
| 11-12 | Observability + OAuth refresh | Variable inspector, error tracing, token refresh |
| 13-15 | 4 More connectors | Gmail/Sheets/SendGrid/HubSpot |
| 16-18 | Basic agent mode + polish | tool_use, testing, docs, onboarding |
| 19-22 | Buffer + beta | Security audit, perf testing, user feedback |

**No feature work until Week 4. Weeks 1-3 are bug fixes only.**
