# Competitive Landscape: 5 Closest Comps

> **Status:** Early-stage scan — no clear winners yet. These are the closest in spirit to SupraLoop's multi-agent scoring/rating loop for iterative self-improvement.

---

## The Gap Nobody Fills

All five competitors use judge/evaluator agents internally, but **the scoring is hidden**. None expose the rating table itself as the core UI. SupraLoop's differentiator: making the multi-dimensional rating table the central, visible artifact that transparently drives the improvement loop.

---

## 1. Cursor Agent Swarm (FastRender Project)

| Dimension | Detail |
|-----------|--------|
| **What they built** | Ran hundreds of concurrent agents for a week, writing 1M+ lines of code across 1,000 files to build a web browser from scratch |
| **Architecture** | Planner/Worker/Judge hierarchy — planners explore the codebase and create tasks, workers execute independently, a judge agent decides whether to continue |
| **Relevance to SupraLoop** | Clearest reference architecture — the planner/worker/judge hierarchy is essentially a scoring loop |
| **Key takeaway** | Proves the pattern works at massive scale; judge-driven continuation is the closest existing analog to SupraLoop's rating-driven iteration |

---

## 2. Lovable (Agent Mode + Visual Edits)

| Dimension | Detail |
|-----------|--------|
| **What they built** | Consumer AI dev tool with three modes: Agent (autonomous), Chat (conversational), Visual Edits (direct manipulation) |
| **Architecture** | Agent Mode provides autonomous codebase exploration, proactive debugging, real-time web search, and automated problem-solving |
| **Relevance to SupraLoop** | Three-mode system creates a tight build-evaluate-refine loop — closest consumer product to iterative autonomous improvement |
| **Key takeaway** | Not multi-agent scoring, but demonstrates that a tight evaluate-refine loop resonates with end users |

---

## 3. Emergent.sh (Multi-Agent App Builder)

| Dimension | Detail |
|-----------|--------|
| **What they built** | Multi-agent system with specialized agents for planning, UI generation, backend logic, QA, deployment, and optimization |
| **Architecture** | Agents collaborate to break down complex app requirements; QA and optimization agents function as rating agents |
| **Relevance to SupraLoop** | QA/optimization agents are essentially raters — closest to SupraLoop's evaluator concept at the product level |
| **Key takeaway** | **Instructive failure case** — users frequently report the AI getting stuck in debugging loops, consuming credits without producing working apps. Shows the risk when the scoring loop doesn't have good exit conditions |

---

## 4. CrewAI (Role-Specialized Agent Teams)

| Dimension | Detail |
|-----------|--------|
| **What they built** | Framework for building teams of AI agents with explicit roles that communicate, critique, and improve each other's outputs |
| **Architecture** | Agents with defined roles review each other's work through iterative refinement rather than single-pass execution |
| **Relevance to SupraLoop** | Closest to SupraLoop's "rating table" concept at the framework level — agents explicitly score and critique |
| **Key takeaway** | Dev tool, not a product. Validates the pattern but leaves the productization opportunity wide open |

---

## 5. Atlassian AI Apps Builder (ReAct Loop)

| Dimension | Detail |
|-----------|--------|
| **What they built** | AI-powered app builder embedded in Jira that follows an agent-style ReAct loop: plan → act (generate/fix) → review → repeat |
| **Architecture** | No longer "generate once and hope" — iterates until the app is ready |
| **Relevance to SupraLoop** | Proves the iterative pattern works for non-technical users; feedback loop connects to real project management context |
| **Key takeaway** | Narrow scope (Jira apps only) but validates that non-devs can benefit from agentic iteration loops |

---

## Summary Matrix

| Competitor | Type | Multi-Agent | Scoring Loop | Rating Visible | Target User |
|------------|------|:-----------:|:------------:|:--------------:|-------------|
| Cursor Agent Swarm | Internal tool | Yes | Yes (Judge) | No | Developers |
| Lovable | Consumer product | No | Implicit | No | Non-technical |
| Emergent.sh | Product | Yes | Yes (QA agent) | No | Non-technical |
| CrewAI | Framework | Yes | Yes (Peer review) | No | Developers |
| Atlassian AI Apps | Product (Jira) | No | Yes (ReAct) | No | Non-technical |
| **SupraLoop** | **Product** | **Yes** | **Yes** | **Yes** | **TBD** |

---

## SupraLoop's Positioning

The common thread: everyone has judge/evaluator agents doing scoring internally, but **nobody surfaces the rating table as the core UI**. This is the whitespace:

- **Transparency** — Users see exactly how agents rate outputs across dimensions
- **Control** — The visible rating table becomes a lever users can tune
- **Trust** — Exposing the loop builds confidence in the system's reasoning
