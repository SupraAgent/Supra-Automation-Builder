# Agent Orchestrator Patterns → Persona Builder, Launch Kit & VibeCode

> Exploration doc — what we can steal from [Composio's Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator/) and apply to our ecosystem.

---

## TL;DR

Agent Orchestrator solves **multi-agent coordination at the git level**: isolated worktrees, auto-CI-fix loops, review-comment-addressing, and a supervision dashboard. The core patterns map cleanly onto three of our projects in different ways:

| Pattern | Persona Builder | Launch Kit | VibeCode |
|---------|----------------|------------|----------|
| Parallel agent spawning | Personas as parallel agents | Parallel project scaffolding | Multi-file generation |
| Git worktree isolation | Per-persona branches for recommendations | Per-service isolation in monorepos | Per-component isolation |
| CI feedback loops | Persona "red flag" → auto-fix cycles | Post-scaffold validation & repair | Lint/build/test auto-remediation |
| Review comment routing | Consensus Protocol automation | PR template + auto-review | Inline suggestion loops |
| Supervision dashboard | Team consultation dashboard | Project health dashboard | Generation progress UI |
| Plugin architecture (8 slots) | Swappable persona sources | Swappable scaffolders/deployers | Swappable LLM backends |

---

## 1. Persona Builder

### 1a. Personas-as-Agents (the big idea)

Right now personas are **passive documents** — the agent consults them by reading markdown files. Agent Orchestrator's model suggests a more powerful pattern: **treat each persona as a running agent**.

**How it would work:**
- When Phase 1 completes and `team.md` is assembled, spawn one agent per persona
- Each persona-agent gets the persona profile as its system prompt + the project context
- At decision points (Phase 2-4), instead of one agent "consulting" persona files, you **fan out the question to all relevant persona-agents in parallel**
- Each responds independently with: Position, Confidence, Risk, Compromise (matching our Consensus Protocol)
- A coordinator agent runs the ≥67% consensus check and CEO tiebreaker automatically
- Results stream into a dashboard or structured log

**Why this is better than the current approach:**
- Parallel consultation instead of sequential (faster)
- Each persona-agent maintains conversation context across the project (richer advice over time)
- Consensus Protocol becomes automated, not manual
- Disagreements get logged with full reasoning traces

**Implementation sketch:**
```
ao-style spawn for each persona:
  spawn("marcus-rivera", {
    systemPrompt: personaProfile,
    context: projectBrief,
    worktree: false,  // personas don't write code
    role: "advisor"
  })

consultation fan-out:
  question = "Should we use Firebase or Supabase for auth?"
  responses = await Promise.all(
    relevantPersonas.map(p => p.consult(question))
  )
  result = consensusProtocol.evaluate(responses)
```

### 1b. Automated Consensus Protocol

The Consensus Protocol (`CONSENSUS_PROTOCOL.md`) is currently a manual checklist. With AO-style orchestration, it becomes a **state machine**:

```
States:
  CONSULTING → each persona agent responds
  EVALUATING → calculate weighted consensus
  CONSENSUS_REACHED → log + proceed
  DEADLOCK → invoke CEO tiebreaker logic
  USER_OVERRIDE → present to user, await decision
  DECIDED → log decision, update docs/decisions/
```

This maps directly to AO's state machine approach to agent lifecycle management.

### 1c. Persona Retro Automation (Phase 5)

Phase 5's weekly retro is manual today. With agent orchestration:
- Spawn persona-agents weekly with latest metrics/analytics data
- Each agent independently analyzes their domain (retention agent looks at DAU/MAU, growth agent looks at acquisition channels, etc.)
- Fan-in their recommendations
- Run consensus on priorities
- Present unified weekly retro report to user

### 1d. Decision Audit Trail

AO logs everything. Apply this to persona consultations:
- Every consultation gets a structured log entry
- Track: which personas consulted, what they said, what was decided, confidence levels
- Over time, build a "decision graph" showing how persona advice shaped the product
- Enable "revisit trigger" checks automatically (if a condition from a past decision is now met, surface it)

---

## 2. Launch Kit

### 2a. Parallel Service Scaffolding

Launch Kit sets up projects. For complex projects (monorepos, microservices), AO's parallel worktree pattern is directly applicable:

- Scaffold frontend, backend, and infra **in parallel** using isolated worktrees
- Each scaffolding agent works independently on its service
- A coordinator merges the worktrees once all pass validation
- If one service's scaffold fails CI, that agent retries while others continue

**Example flow:**
```
ao spawn launch-kit frontend --template=next-app
ao spawn launch-kit backend --template=fastapi
ao spawn launch-kit infra --template=terraform-aws
ao spawn launch-kit docs --template=docusaurus

# Each gets its own worktree, scaffolds independently
# Coordinator merges when all green
```

### 2b. Post-Scaffold Validation Loops

AO's CI feedback loop pattern applied to project setup:

1. Scaffold the project
2. Run validation (does it build? do tests pass? does lint pass? does deploy work?)
3. If validation fails → send error logs back to the scaffolding agent
4. Agent fixes the issue (wrong dependency version, missing env var, etc.)
5. Re-validate
6. Only mark "scaffold complete" when all checks pass

This eliminates the "I scaffolded your project but it doesn't actually build" problem.

### 2c. Template Plugin Architecture

AO has 8 swappable slots. Launch Kit should have swappable slots too:

| Slot | Purpose | Examples |
|------|---------|----------|
| **Framework** | Frontend framework | Next.js, Nuxt, SvelteKit, Astro |
| **Backend** | API framework | FastAPI, Express, Rails, Go |
| **Database** | Data layer | Supabase, PlanetScale, Neon, Turso |
| **Auth** | Authentication | Clerk, Auth.js, Supabase Auth |
| **Hosting** | Deployment target | Vercel, Railway, Fly.io, AWS |
| **CI/CD** | Pipeline | GitHub Actions, GitLab CI |
| **Monitoring** | Observability | Sentry, Datadog, PostHog |
| **Payments** | Billing | Stripe, Lemon Squeezy |

Each slot has a standard interface. Swap any component without changing the rest. This is exactly AO's plugin philosophy applied to project scaffolding.

### 2d. Persona-Informed Scaffolding

**Bridge between Persona Builder and Launch Kit:**
- Phase 2 of Persona Builder is "Tech Stack & Infrastructure" — this IS Launch Kit's job
- After personas are assembled, their tech preferences should **automatically feed into Launch Kit's template selection**
- Technical Architect persona recommends Next.js + Supabase → Launch Kit receives that as config and scaffolds accordingly

---

## 3. VibeCode

### 3a. Multi-File Parallel Generation

When generating a full feature (component + API route + database migration + tests), spawn parallel agents:

- Agent 1: Generate the UI component (its own worktree/branch)
- Agent 2: Generate the API route
- Agent 3: Generate the database migration
- Agent 4: Generate the tests

Each works in isolation. A coordinator merges them. If integration tests fail, the coordinator identifies which agent's output needs adjustment and sends feedback.

### 3b. Lint/Build/Test Auto-Remediation

AO's strongest pattern for VibeCode: **the CI feedback loop applied to code generation**.

```
Generate code
  → Run linter → fails? → send errors back to agent → agent fixes → re-lint
  → Run type check → fails? → send errors back → agent fixes → re-check
  → Run tests → fails? → send errors back → agent fixes → re-test
  → Run build → fails? → send errors back → agent fixes → re-build
  → All green? → commit
```

This is the difference between "here's some generated code, good luck" and "here's generated code that actually works."

### 3c. Review Comment Loop for Generated Code

When VibeCode generates a PR:
1. Human reviews, leaves comments
2. Comments automatically route to the generating agent
3. Agent addresses each comment, pushes new commits
4. Human re-reviews
5. Repeat until approved

This exists in AO today. VibeCode should have it natively.

### 3d. Generation Dashboard

AO has a real-time dashboard at localhost:3000. VibeCode should have one too:

- Show all active generation tasks
- Progress per file/component
- Validation status (lint, types, tests, build)
- Diff preview before commit
- One-click approve/reject per generated file

---

## 4. Cross-Cutting Patterns for All Three

### 4a. Configuration-Driven Reactions

AO uses `agent-orchestrator.yaml` to define what happens automatically vs. what needs human input. All three projects should adopt this:

```yaml
# Example: persona-builder.yaml
reactions:
  persona_disagreement:
    auto_resolve: true          # run consensus protocol automatically
    escalate_threshold: 0.5     # escalate to user if below 50% agreement
  phase_gate:
    auto_advance: false         # always ask user at gates
  decision_revisit:
    auto_check: true            # automatically check revisit triggers weekly
```

### 4b. Just-in-Time Context

AO only gives agents the tools they need for the current step. Apply this everywhere:

- **Persona Builder:** When consulting the UI/UX persona, only provide UI-relevant context (screens, design system, user flows) — don't dump the entire codebase
- **Launch Kit:** When scaffolding the database layer, only provide database-relevant config — don't include frontend templates
- **VibeCode:** When generating a React component, only provide the component spec, design tokens, and relevant types — not the entire API layer

This reduces token waste and improves output quality.

### 4c. Supervision, Not Babysitting

AO's core philosophy: "spawn and walk away, get notified when judgment is needed."

All three projects should adopt a notification model:
- **Green path:** Agent handles everything autonomously, notifies on completion
- **Yellow path:** Agent encounters ambiguity, pauses and asks a specific question
- **Red path:** Agent fails after retries, escalates with full context

The user should never need to watch an agent work. They should be able to spawn multiple tasks and context-switch to other work.

### 4d. State Machine for Every Workflow

AO treats agent lifecycles as state machines. Every workflow in our ecosystem should be modeled the same way:

```
Persona Builder Phases:
  BRIEF → PERSONAS → TECH_STACK → DEVELOPMENT → PRE_LAUNCH → POST_LAUNCH
  (with sub-states: CONSULTING, DECIDING, GATE_WAITING, USER_REVIEWING)

Launch Kit:
  TEMPLATE_SELECT → SCAFFOLD → VALIDATE → FIX → DEPLOY → VERIFY

VibeCode:
  SPEC → GENERATE → LINT → TYPE_CHECK → TEST → BUILD → REVIEW → MERGE
```

State machines give you: recovery (resume from last good state), observability (where is this task?), and predictability (what happens next?).

---

## 5. Concrete Next Steps

### Quick Wins (implement now)
1. **Add a `reactions` config to Persona Builder** — define which persona consultations are auto-resolved vs. user-escalated
2. **Add CI feedback loops to VibeCode generation** — lint → fix → re-lint before committing
3. **Add validation loops to Launch Kit scaffolding** — build check after scaffold

### Medium-Term (next sprint)
4. **Prototype personas-as-parallel-agents** — spawn multiple Claude instances, one per persona, fan out consultations
5. **Build the plugin architecture for Launch Kit** — define the slot interfaces for framework, backend, database, etc.
6. **Add review-comment routing to VibeCode** — auto-forward PR comments to generating agent

### Ambitious (next quarter)
7. **Unified orchestration layer** — a single `ao`-style CLI that coordinates Persona Builder → Launch Kit → VibeCode as one pipeline
8. **Supervision dashboard** — real-time view of all active agents across all three projects
9. **Decision graph** — visual trace of every persona consultation, consensus resolution, and its impact on the codebase

---

## 6. The Unified Vision

```
User: "I want to build a language learning app"

Phase 0: Project Brief
  → Single agent gathers requirements

Phase 1: Persona Assembly
  → 5 persona-agents spawn in parallel
  → Each researches their domain, writes their own profile
  → Consensus Protocol validates team composition

Phase 2: Tech Stack (Persona Builder → Launch Kit handoff)
  → Technical Architect persona recommends stack
  → Launch Kit spawns parallel scaffolding agents
  → Frontend, backend, database, infra scaffold simultaneously
  → Validation loops ensure everything builds

Phase 3: Development (Launch Kit → VibeCode handoff)
  → Product Lead persona prioritizes features
  → VibeCode spawns parallel generation agents per feature
  → Each feature: component + API + migration + tests
  → CI feedback loops fix issues automatically
  → Persona consultations happen at decision points (fan-out, consensus)

Phase 4: Pre-Launch
  → Each persona-agent runs their pre-launch checklist in parallel
  → Aggregated risk report generated automatically
  → Growth persona's GTM recommendations feed into launch config

Phase 5: Post-Launch
  → Weekly: persona-agents analyze metrics, run retros
  → Recommendations prioritized via consensus
  → VibeCode implements approved changes
  → Cycle repeats

Total human touchpoints: ~5-10 gate approvals
Total agent-hours saved: everything else
```

This is what "spawn and walk away" looks like for the full product lifecycle.
