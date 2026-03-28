# Build Plan Reviews: Snobby Coder + Devil's Advocate

Two independent reviewers assessed the CPO's build plan. Their reviews are below.

---

## SNOBBY CODER REVIEW

**Overall Score: 5/10** — Plan needs significant revision

This is a competent product roadmap that demonstrates understanding of the problem domain, but it contains critical gaps, underestimated effort, and circular dependencies that make it **not executable in 16 weeks with a 4-person team**. It reads like a product manager's optimistic view of what shipping looks like, not a tech lead's battle plan.

**Reality check:**
- Phase 1A alone is 104-136 hours of sequential work (not 68h as claimed)
- 15 connectors in 6 weeks = one connector per 2.4 days. Testing, OAuth flows, and edge cases aren't free.
- The plan says "parallelizable" 10 times. Parallelization isn't free — it requires interfaces, contracts, mocking, and async handoff overhead.

---

### Phase-by-Phase Technical Feasibility

#### PHASE 1A: Deployment Runtime — Underscoped (marked L, actually XL)

**Task 1A.1: Create Deployment Runtime API (marked L: 16-24h)**
- Reality: 24-32 hours
- Missing: request validation, input/output serialization, webhook signature validation (HMAC-SHA256), rate limiting per user/workflow, versioning strategy

**Task 1A.2: Backend Execution Engine (marked L: 20-24h)**
- Reality: 32-40 hours
- The current `workflow-engine.ts` has zero HTTP node support (1237 lines, 0 lines for HTTP nodes)
- Backend needs credential resolution at execution time (separate subsystem)
- No handling of long-running executions (timeout strategy missing)

**Task 1A.3: Cron & Trigger Scheduler (marked M: 12-16h)**
- Reality: 20-28 hours (closer to L)
- `node-cron` is for in-process scheduling; production needs job queue (Bull, BullMQ)
- Missing: job persistence across server restarts, distributed locking, graceful shutdown

**Phase 1A actual effort: 104-136 hours (not 68h)**
- With 2 builders: 6-7 weeks (not 4 weeks)

---

#### PHASE 1B: Pre-Built App Integrations — Overscoped

**The math doesn't work for 15 connectors in 6 weeks:**
- Reality per connector: 19-27 hours (not 12-18h)
- For 15 connectors: 285-405 hours total
- Missing: connector testing framework, API rate limit handling per connector, connector QA

**Phase 1B actual effort: 250-350 hours (not 120-160h)**

---

#### PHASE 1C: Storage Adapter — Correctly Scoped

- Phase 1C actual effort: 58-92 hours (vs. claimed 58-76h) — roughly correct
- Remove S3/R2 adapter for v1 (nice-to-have, not launch-blocking)
- DataStoreNode (1C.6) depends on backend executor (1A.2) being complete first

---

#### PHASE 1D: OAuth — Severely Underestimated

- OAuth Authorization Code Flow: 20-28 hours (not 12-16h)
- Each provider has different endpoints, scopes, and response formats
- Missing: key rotation strategy, mock OAuth providers for testing, dev/staging/prod redirect URI management

**Phase 1D actual effort: 90-120 hours (not 64h)**

---

#### PHASE 1E: Observability — Right Scope, Wrong Priority

- Effort estimates reasonable (48-60h total)
- **Should start Week 6-7, not Week 10** — needed for debugging connectors as they're built

---

#### PHASE 1F: Agent Mode — Severely Underestimated

- Multi-turn loop: 20-28h (not 16-20h)
- Missing: token budget management, agent error recovery, timeout handling within loops
- Can only start after 1A, 1B, 1D are mostly done

**Phase 1F actual effort: 84-104 hours (not 56h)**

---

### Dependency Graph Issues

1. **Phase 1B (Connectors) blocks on Phase 1D (OAuth)** — Can't build Slack connector in Week 5 if OAuth isn't done until Week 8
2. **Phase 1E (Observability) should start Week 6** — Needed to debug connector implementations
3. **Phase 1F depends on Phase 1B** — Agent needs connector nodes to expose as tools
4. **Missing:** Credential resolution in execution engine, connector output schema consistency

---

### What the Snobby Coder Would Change

1. **Reorder Critical Path:**
   - Week 1-4: Phase 1A (Runtime) + start 1D.1 (Credential Vault)
   - Week 5-6: Phase 1C (Storage) + API-key connectors first
   - Week 6-9: Phase 1E (Observability) — moved up
   - Week 7-10: Phase 1D.2-5 (OAuth flows) → unlock OAuth connectors
   - Week 10-12: Phase 1F (Agent Mode)
   - Week 12-15: Phase 1G (Testing/Polish)

2. **Reduce to 8 connectors:** Slack, Notion, Airtable, GitHub, Stripe, Gmail, Google Sheets, SendGrid

3. **Add missing tasks:**
   - Request/response validators (4-6h)
   - Job queue setup (6-8h)
   - Connector testing framework + mocks (8-10h)
   - Output schema generator for tools (4-6h)
   - Key rotation strategy (4-6h)
   - Token budget management (4-6h)

4. **Make Phase 1F (Agent Mode) optional** — ship v1 without it if behind schedule

5. **Realistic timeline: 20-24 weeks** (with reduced scope: 18-20 weeks)

---

### Final Score: 5/10

> "This is not a shipping plan. It's a dream. Wake up, prioritize, and commit to what you can actually deliver."

---
---

## DEVIL'S ADVOCATE REVIEW

**Final Verdict: REVISE** — Plan has merit but contains five fatal risks that must be addressed before greenlight.

---

### Strategic Risk 1: Deployment Runtime is Underspecified (CRITICAL)

- No scaling strategy. What happens at Week 16 if 10,000 workflows trigger at 9 AM?
- No infrastructure cost analysis. Single Node.js process won't handle it — need Bull queues, worker pools.
- No cost-per-execution model. The entire GTM ("ship workflows instantly") collapses if runtime doesn't scale or costs too much.

**Kill question:** How many concurrent workflow executions can the Week 4 runtime handle? If the answer is "we'll figure it out later," the build plan is premature.

---

### Strategic Risk 2: Pre-Built Integrations Are Hostage to OAuth Complexity

- Building one OAuth flow (Slack) takes 1 week including edge cases
- The plan builds connectors (Weeks 5-8) before OAuth infrastructure arrives (Week 9+) — dependency inversion
- OAuth token refresh edge cases (expiry during execution, multi-workspace Slack, per-org GitHub tokens) are always harder than estimated

---

### Strategic Risk 3: StorageAdapter Pattern Will Confuse Contributors

- Pattern is clever but adds adoption friction: "Deploy builder → implement interface → inject adapter" is 3 steps
- Most teams will copy-paste localStorage and never get persistent storage
- For a no-code product, requiring users to wire up Supabase themselves is a hidden cliff

**Mitigation:** Ship Supabase adapter as default (not optional). Make it "just work."

---

### Strategic Risk 4: Agent Mode Relies on Untested Anthropic Tool Use API

- Claude's tool_use API is still evolving — building on it is a bet
- Streaming reasoning during tool_use calls isn't guaranteed
- Multi-turn loops are fragile (infinite loops, silent failures)

**Mitigation:** Defer full agent mode to Phase 2. Ship basic tool_use only in v1.

---

### Strategic Risk 5: Market Positioning is Muddled Between Three Lenses

- Figma lens: managed SaaS, you own infrastructure
- n8n lens: self-hosted, user controls infrastructure
- Perplexity lens: workflows as code in GitHub, builder is just IDE

The build plan assumes Figma (managed) but the company culture is hedging. This creates ambiguity that will surface at Week 8.

**Kill question:** Is SupraLoop a managed SaaS or a self-hosted platform? Choose one. Everything else follows.

---

### Assumption Ratings

| Assumption | Rating |
|-----------|--------|
| "Node.js runtime handles 1000s of concurrent workflows" | **DANGEROUS** |
| "15 connectors in 6 weeks" | **RISKY** |
| "StorageAdapter is simple for contributors" | **DANGEROUS** |
| "Claude tool_use API stable through 2026" | **RISKY** |
| "Perplexity knowledge layer deferred to Phase 2" | **SAFE** |
| "16 weeks is enough for v1" | **RISKY** |
| "Users will bring their own LLM API keys" | **DANGEROUS** |
| "Multiplayer can be deferred to Phase 3" | **RISKY** |

---

### Priority Order Challenges

**Current order is mostly right, but:**

1. **OAuth abstraction (1D.1) should be parallel with 1A (Weeks 1-4)** — connectors need it before they can be built
2. **Variable inspector should move to Week 6** — needed to debug connectors as you build them
3. **Phase 1F (Agent Mode) should be reduced scope or deferred** — high complexity, API instability risk

**If the team only has 8 weeks:**
1. Week 1-4: Deployment runtime + OAuth abstraction
2. Week 5-6: Connector framework + OAuth flows for 3 providers
3. Week 7-8: 5 connectors (Slack, Notion, GitHub, Stripe, Airtable) + storage interface

Cut: all 15 connectors (ship 5), observability beyond basics, agent mode, advanced data features.

---

### The "What If" Scenarios

**What if the Perplexity knowledge layer IS the actual product?**
- Build plan defers it to Phase 2 (2027). This gives competitors 6-12 months to ship it first.
- **Mitigation:** Add a minimal Web Search Node in Phase 1 (Week 13-14) that queries Perplexity API with citations.

**What if pre-built integrations are table stakes but not differentiating?**
- n8n has 400+. Zapier has 5000+. 15 won't be enough.
- **Mitigation:** Build the HTTP node *first* and make it so polished that 80% of users never need pre-built connectors.

---

### Missing Risks the CPO Didn't Address

1. **Cost structure is invisible** — who pays for LLM inference? Per-run pricing? Subscription?
2. **Rate limiting & cascade failures** — Slack rate limit hit during workflow = silent failure
3. **Cold start latency** — webhook response > 5s = perceived as broken
4. **Breach of secrets** — no key rotation, no audit logs for credential access
5. **Team skill gaps** — OAuth requires deep API knowledge; does the team have it?
6. **Vendor lock-in via credentials** — user's tokens don't port to n8n

---

### Revised Timeline (Devil's Advocate)

| Phase | Weeks | Change |
|-------|-------|--------|
| 1A (Deployment) | 1-4 | Add architecture spike in Week 1 |
| 1D (OAuth abstraction) | 1-4 | **MOVED EARLIER** (parallel with 1A) |
| 1B (5 core connectors) | 5-10 | **REDUCED** from 15 to 5 |
| 1C (Storage) | 6-9 | On track |
| 1E.1 (Variable inspector) | 6-7 | **MOVED EARLIER** |
| 1E (Observability) | 8-12 | Adjusted |
| 1F (Agent mode) | 12-14 | **REDUCED** to basic only |
| 1G (Polish) | 14-16 | More time available |

---

### The Kill Question

> If you could only ship ONE phase and get paying users — which one?

**Answer:** Phase 1A + 5 core connectors. Users pay for "I designed a workflow, deployed it, and it ran." They don't need storage adapters, agent mode, or observability. But they need deployment and connectors.

**Is the plan ordered that way?** Yes. But it should be "5 bulletproof connectors" not "15 adequate ones."

---

### Verdict: REVISE

The plan is directionally sound but needs:
1. Clarify deployment runtime architecture (spike Week 1)
2. Move OAuth earlier (parallel with 1A)
3. Reduce connectors to 5-8 (not 15)
4. Move observability up to Week 6
5. Defer full agent mode to Phase 2
6. Define pricing by Week 8
7. Pick one lens (managed SaaS) and commit
