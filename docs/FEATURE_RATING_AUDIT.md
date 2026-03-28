# Feature Rating Audit

> **Date:** 2026-03-19
> **Scope:** All builders, tools, and utilities in the Persona Builder platform
> **Scale:** 1–100 (higher is better)

---

## Rating Categories

| # | Category | Description |
|---|----------|-------------|
| 1 | **Ease of Use** | How intuitive is the flow? Can a new user complete it without confusion? |
| 2 | **Functionality** | Breadth and depth of features — what can it actually do? |
| 3 | **Overall Best Result** | Quality of the final output (prompts, exports, files) when used well |
| 4 | **Uniqueness** | Does it offer something no other builder in the platform does? |
| 5 | **Not Redundant** | High = fills a unique gap; Low = overlaps heavily with other builders |
| 6 | **Output Versatility** | Number and quality of export formats (JSON, Markdown, clipboard, DB save) |
| 7 | **Integration** | How well does it connect with other platform features (library, API, other builders)? |
| 8 | **Scalability** | Can it handle complex/large inputs and still produce coherent results? |

---

## Rating Table

| Builder | Ease of Use | Functionality | Best Result | Uniqueness | Not Redundant | Output Versatility | Integration | Scalability | **AVG** |
|---------|:-----------:|:-------------:|:-----------:|:----------:|:--------------:|:------------------:|:-----------:|:-----------:|:-------:|
| **Expert Persona** | 92 | 82 | 90 | 70 | 55 | 88 | 85 | 65 | **78.4** |
| **Agent Builder** | 78 | 85 | 82 | 75 | 50 | 72 | 80 | 70 | **74.0** |
| **Unified Builder** | 80 | 92 | 88 | 60 | 40 | 90 | 85 | 75 | **76.3** |
| **Persona Studio** | 85 | 88 | 92 | 90 | 85 | 82 | 78 | 80 | **85.0** |
| **Team Builder** | 82 | 86 | 85 | 80 | 78 | 70 | 75 | 82 | **79.8** |
| **Launch Kit v1** | 65 | 95 | 90 | 85 | 80 | 95 | 90 | 70 | **83.8** |
| **Launch Kit v2** | 90 | 60 | 72 | 70 | 65 | 55 | 80 | 60 | **69.0** |
| **VibeCode** | 95 | 65 | 78 | 92 | 95 | 70 | 65 | 55 | **76.9** |
| **Auto-Research** | 70 | 90 | 88 | 95 | 95 | 60 | 82 | 75 | **81.9** |

---

## Detailed Breakdown

### 1. Expert Persona (`/expert`) — AVG: 78.4

| Category | Score | Rationale |
|----------|:-----:|-----------|
| Ease of Use | 92 | Clean 4-step wizard, rich suggestion lists, minimal friction |
| Functionality | 82 | 28 fields across identity/expertise/mindset/output — thorough but persona-only |
| Best Result | 90 | Produces detailed, high-quality system prompts with intelligent inference |
| Uniqueness | 70 | Core persona builder — foundational but other builders replicate its fields |
| Not Redundant | 55 | Unified Builder contains all Expert fields + more; Agent Builder covers similar ground |
| Output Versatility | 88 | JSON, Markdown, clipboard copy, Supabase save — 4 export paths |
| Integration | 85 | Saves to library, API-backed, used as reference by Launch Kit team step |
| Scalability | 65 | Single-persona only; no batch or team workflows |

**Verdict:** The gold standard for individual persona quality. Loses points because the Unified Builder supersedes it feature-for-feature.

---

### 2. Agent Builder (`/agent`) — AVG: 74.0

| Category | Score | Rationale |
|----------|:-----:|-----------|
| Ease of Use | 78 | 9 steps is the longest wizard — requires more commitment |
| Functionality | 85 | LLM provider/model selection, communication styles, skills, north star generation |
| Best Result | 82 | Good agent configs but north star auto-generation is template-based, not AI-driven |
| Uniqueness | 75 | Only builder with explicit LLM provider/model picking and visibility control |
| Not Redundant | 50 | Heavily overlapped by Unified Builder which adds all expert fields on top |
| Output Versatility | 72 | JSON export + Supabase save — fewer options than Expert |
| Integration | 80 | Saves to library, shares API with all builders |
| Scalability | 70 | Single-agent focus; blockchain skills suggest niche use case |

**Verdict:** Good agent-specific features (LLM selection, skills) but the 9-step flow is heavy, and Unified Builder makes it largely redundant.

---

### 3. Unified Builder (`/unified`) — AVG: 76.3

| Category | Score | Rationale |
|----------|:-----:|-----------|
| Ease of Use | 80 | 6 steps — balanced length, but combines two mental models (expert + agent) |
| Functionality | 92 | Most comprehensive single-persona builder — all expert fields + all agent fields |
| Best Result | 88 | Best individual output since it captures the most dimensions |
| Uniqueness | 60 | By design it's a merger, not a novel concept |
| Not Redundant | 40 | Makes both Expert and Agent builders redundant — but itself is the redundancy source |
| Output Versatility | 90 | JSON, Markdown, clipboard, Supabase — full export suite |
| Integration | 85 | Same API integration, library save, team.md compatible |
| Scalability | 75 | Still single-persona, but richer data means more reuse potential |

**Verdict:** The most complete single-persona builder. If the platform were to consolidate, this would replace both Expert and Agent. Its existence creates the redundancy problem.

---

### 4. Persona Studio (`/studio`) — AVG: 85.0

| Category | Score | Rationale |
|----------|:-----:|-----------|
| Ease of Use | 85 | 4-step wizard with live prompt preview sidebar — clear and visual |
| Functionality | 88 | Team assembly + confidence voting + grill questions + consensus config |
| Best Result | 92 | Grill step forces quality thinking; produces battle-tested personas |
| Uniqueness | 90 | Only builder with the "grill" interrogation step — unique validation mechanic |
| Not Redundant | 85 | Grill + confidence levels + live prompt editing are exclusive to Studio |
| Output Versatility | 82 | Per-persona Markdown, clipboard, batch Supabase save |
| Integration | 78 | Saves to library; consensus protocol aligns with CONSENSUS_PROTOCOL.md |
| Scalability | 80 | Handles multi-persona teams natively; grill scales per persona |

**Verdict:** The strongest all-around builder. The grill step is a killer differentiator that forces users to stress-test their personas before export. Best suited for serious team assembly.

---

### 5. Team Builder (`/builder-v2`) — AVG: 79.8

| Category | Score | Rationale |
|----------|:-----:|-----------|
| Ease of Use | 82 | 4 steps with quick-start templates (3/5/7 member presets) — fast onboarding |
| Functionality | 86 | Phase authority, conflict modeling, consensus threshold, CEO tiebreaker |
| Best Result | 85 | Generates complete team.md with orchestration rules — production-ready output |
| Uniqueness | 80 | Only builder with phase authority assignments and conflict modeling |
| Not Redundant | 78 | Phase dynamics and conflict tracking don't exist elsewhere |
| Output Versatility | 70 | Generates team.md (Markdown) + clipboard — no JSON or DB save |
| Integration | 75 | Outputs team.md for use in CLAUDE.md and project setup; no direct API save |
| Scalability | 82 | Designed for teams of 3-7+; template presets scale well |

**Verdict:** Excellent for team orchestration and dynamics modeling. The phase authority system is unique and valuable. Weaker on export options compared to others.

---

### 6. Launch Kit v1 (`/launch-kit`) — AVG: 83.8

| Category | Score | Rationale |
|----------|:-----:|-----------|
| Ease of Use | 65 | 8 steps is a significant commitment — powerful but lengthy |
| Functionality | 95 | End-to-end: brief → team → consensus → grill → stack → roadmap → whitepaper → export |
| Best Result | 90 | Produces a complete project foundation: whitepaper, team, roadmap, tech stack |
| Uniqueness | 85 | Only tool that generates a full whitepaper and multi-phase roadmap |
| Not Redundant | 80 | Whitepaper, tech stack selection, and roadmap planning are exclusive |
| Output Versatility | 95 | 6 separate Markdown exports + persona creation API + whitepaper download |
| Integration | 90 | Creates personas via API, tech stack feeds into VibeCode, roadmap feeds development |
| Scalability | 70 | Handles full projects but 8-step flow can feel heavy for small projects |

**Verdict:** The most comprehensive tool in the platform. Does everything from project definition to team assembly to technical planning. The 8-step length is its only real weakness.

---

### 7. Launch Kit v2 (`/launch-v2`) — AVG: 69.0

| Category | Score | Rationale |
|----------|:-----:|-----------|
| Ease of Use | 90 | Only 3 steps — brief → orchestrator → CLAUDE.md. Very fast |
| Functionality | 60 | Skips team, consensus, grill, roadmap, whitepaper — a stripped-down subset |
| Best Result | 72 | Good CLAUDE.md output but missing the depth that makes v1 outputs strong |
| Uniqueness | 70 | Orchestrator config (concurrency, auto-consult toggles) is unique |
| Not Redundant | 65 | Orchestrator step is unique but brief step duplicates v1; CLAUDE.md could be a v1 export |
| Output Versatility | 55 | Single output: CLAUDE.md file — no persona creation, no whitepaper |
| Integration | 80 | VibeCode ready toggle, CLAUDE.md feeds directly into development workflow |
| Scalability | 60 | Limited — designed for quick setup, not complex projects |

**Verdict:** A speed-optimized subset of Launch Kit v1. The orchestrator config is valuable but could be a v1 add-on step rather than a separate tool. Most redundant builder in the platform.

---

### 8. VibeCode (`/vibecode`) — AVG: 76.9

| Category | Score | Rationale |
|----------|:-----:|-----------|
| Ease of Use | 95 | 3 dead-simple steps — pick framework, pick vibe, get output. Fastest builder |
| Functionality | 65 | Framework + style + features + optional team paste — focused but narrow |
| Best Result | 78 | Generates clean, opinionated CLAUDE.md files with scaffold commands |
| Uniqueness | 92 | Only builder focused on coding philosophy/vibe — "Move Fast" vs "Production Grade" |
| Not Redundant | 95 | Nothing else in the platform does project scaffolding with coding style |
| Output Versatility | 70 | CLAUDE.md download + scaffold command copy — two useful outputs |
| Integration | 65 | Can paste team.md from other builders; no API save |
| Scalability | 55 | Single-project, single-vibe — no multi-project or vibe-mixing support |

**Verdict:** Highly unique and extremely easy to use. Fills a gap no other tool touches. Limited scope keeps it focused — that's a feature, not a bug.

---

### 9. Auto-Research (`/consult`) — AVG: 81.9

| Category | Score | Rationale |
|----------|:-----:|-----------|
| Ease of Use | 70 | Two-tab interface with LLM backend config — requires understanding of scoring methodology |
| Functionality | 90 | Team scoring (5 metrics), gap analysis, consensus simulation, checklist scoring, improvement loops |
| Best Result | 88 | Produces actionable scorecards with specific improvement suggestions |
| Uniqueness | 95 | Only tool that evaluates and scores the outputs of other builders |
| Not Redundant | 95 | Completely distinct purpose — meta-evaluation, not creation |
| Output Versatility | 60 | Visual results in-app only — no export of scorecards |
| Integration | 82 | Scores outputs from all builders; 7 pre-built checklist targets |
| Scalability | 75 | Handles multi-persona teams; checklist system extensible to new skill targets |

**Verdict:** The most unique tool in the platform. Essential for quality control. The scoring methodology (Karpathy's autoresearch loops) is sophisticated and genuinely useful.

---

## Redundancy Analysis

### High Redundancy (Consolidation Recommended)

| Pair | Overlap | Recommendation |
|------|---------|----------------|
| Expert Persona ↔ Unified Builder | ~95% field overlap | **Retire Expert** — Unified has all its fields plus agent capabilities |
| Agent Builder ↔ Unified Builder | ~85% field overlap | **Retire Agent** — Unified covers agent fields plus expert depth |
| Launch Kit v1 ↔ Launch Kit v2 | ~40% step overlap | **Merge** — Add orchestrator step to v1 as optional Step 8.5 |

### Low Redundancy (Keep Separate)

| Tool | Why It's Unique |
|------|----------------|
| **Persona Studio** | Grill interrogation, confidence-weighted voting, live prompt editing |
| **Team Builder** | Phase authority, conflict modeling, team templates |
| **VibeCode** | Coding philosophy selection, scaffold commands, framework presets |
| **Auto-Research** | Meta-evaluation, checklist scoring, improvement loops |

---

## Rankings

### By Average Score
| Rank | Builder | AVG |
|:----:|---------|:---:|
| 1 | **Persona Studio** | 85.0 |
| 2 | **Launch Kit v1** | 83.8 |
| 3 | **Auto-Research** | 81.9 |
| 4 | **Team Builder** | 79.8 |
| 5 | **Expert Persona** | 78.4 |
| 6 | **VibeCode** | 76.9 |
| 7 | **Unified Builder** | 76.3 |
| 8 | **Agent Builder** | 74.0 |
| 9 | **Launch Kit v2** | 69.0 |

### By Category Winner
| Category | Winner | Score |
|----------|--------|:-----:|
| Ease of Use | VibeCode | 95 |
| Functionality | Launch Kit v1 | 95 |
| Best Result | Persona Studio | 92 |
| Uniqueness | Auto-Research | 95 |
| Not Redundant | VibeCode / Auto-Research | 95 |
| Output Versatility | Launch Kit v1 | 95 |
| Integration | Launch Kit v1 | 90 |
| Scalability | Team Builder | 82 |

---

## Recommendations

### Immediate Actions
1. **Consolidate persona builders**: Keep Unified Builder as the single-persona tool; retire Expert Persona and Agent Builder as standalone pages (or convert them to "presets" within Unified)
2. **Merge Launch Kits**: Add the orchestrator config step from v2 into v1 as an optional step
3. **Add export to Auto-Research**: Allow downloading scorecards as Markdown/JSON

### Keep & Invest
1. **Persona Studio** — Highest rated overall; the grill mechanic is a genuine differentiator
2. **Launch Kit v1** — Most comprehensive tool; add orchestrator from v2 and it's complete
3. **Auto-Research** — Most unique; add persistent score history and visual dashboards
4. **Team Builder** — Phase authority and conflict modeling are valuable; add API save
5. **VibeCode** — Unique niche; consider adding Auto-Research checklist validation inline

### Ideal Streamlined Platform (5 Tools)
| Tool | Purpose |
|------|---------|
| **Unified Builder** | Create individual personas (expert + agent combined) |
| **Persona Studio** | Assemble advisory teams with grill validation |
| **Launch Kit** (merged v1+v2) | Full project setup from brief to CLAUDE.md |
| **VibeCode** | Quick project scaffolding with coding philosophy |
| **Auto-Research** | Quality scoring and continuous improvement |

---

## Enhancement Plans: Raising the Top 4 Above 85

### Persona Studio — Current: 85.0 → Target: 91.0

**Weak categories to fix:**

| Category | Current | Target | Delta | What to Pull In |
|----------|:-------:|:------:|:-----:|-----------------|
| Integration | 78 | 90 | +12 | From Team Builder: team.md generation; add `/api/teams` endpoint for full team save |
| Output Versatility | 82 | 92 | +10 | From Unified Builder: JSON export format; add team-level JSON download |
| Scalability | 80 | 90 | +10 | From Team Builder: phase authority assignments + expected conflict modeling |
| Ease of Use | 85 | 88 | +3 | From Unified Builder: North Star auto-generation field in export step |
| Functionality | 88 | 92 | +4 | From Agent Builder: LLM provider/model selection per persona; skills/capabilities declaration |

**Specific enhancements:**

1. **Add team.md export** (Integration +6)
   - Source: `persona-builder-v2.ts` → `generateTeamMd()` (lines 90-154)
   - Adapt to use `StudioDraft` structure instead of `PersonaTeamDraft`
   - Add "Download team.md" button to StepExport

2. **Add `/api/teams` endpoint + team-level DB save** (Integration +6)
   - New endpoint: POST `/api/teams` accepting full team structure (personas + consensus + grill results)
   - Add "Save Team" button alongside existing per-persona save
   - Persist consensus rules, CEO tiebreaker, confidence levels as team metadata

3. **Add JSON export** (Output Versatility +5)
   - Source: `unified-builder.ts` → `unifiedToExportJson()` pattern
   - Create `studioToExportJson()` that outputs full team structure as JSON
   - Add "Download JSON" button to StepExport

4. **Add North Star field** (Output Versatility +5, Ease of Use +3)
   - Source: `unified-wizard/step-review.tsx` → North Star textarea + `generateNorthStar()`
   - Add to StepExport as editable team mission statement
   - Auto-generate from project context + team roles

5. **Add phase authority** (Scalability +5)
   - Source: `persona-builder-v2/step-dynamics.tsx` → phase authority UI (lines 117-151)
   - Add as optional section in StepTeam: assign each persona a lead phase (1.5x voting weight)
   - Include in team.md and JSON exports

6. **Add expected conflict modeling** (Scalability +5)
   - Source: `persona-builder-v2/step-dynamics.tsx` → conflict registry (lines 183-242)
   - Add as collapsible section in StepTeam: define persona pairs + conflict topics
   - Feed into grill questions for targeted interrogation

7. **Add LLM provider/model per persona** (Functionality +2)
   - Source: `unified-wizard/step-capabilities.tsx` → provider/model selection (lines 96-151)
   - Add optional LLM assignment dropdown per persona card in StepTeam
   - Include in system prompt and exports

8. **Add skills/capabilities declaration** (Functionality +2)
   - Source: `unified-wizard/step-capabilities.tsx` → skill multi-select (lines 54-94)
   - Add optional capabilities per persona (code_review, deploy, security_audit, etc.)
   - Display as badges in export cards

**Projected scores after enhancement:**

| Category | Before | After | Change |
|----------|:------:|:-----:|:------:|
| Ease of Use | 85 | 88 | +3 |
| Functionality | 88 | 92 | +4 |
| Best Result | 92 | 94 | +2 |
| Uniqueness | 90 | 90 | — |
| Not Redundant | 85 | 85 | — |
| Output Versatility | 82 | 92 | +10 |
| Integration | 78 | 90 | +12 |
| Scalability | 80 | 90 | +10 |
| **AVG** | **85.0** | **91.0** | **+6.0** |

---

### Launch Kit v1 — Current: 83.8 → Target: 89.5

**Weak categories to fix:**

| Category | Current | Target | Delta | What to Pull In |
|----------|:-------:|:------:|:-----:|-----------------|
| Ease of Use | 65 | 80 | +15 | Merge/condense steps; make grill + whitepaper optional |
| Scalability | 70 | 85 | +15 | Cap grill questions; add orchestrator config from v2 |
| Functionality | 95 | 97 | +2 | From Launch Kit v2: agent orchestrator config step |
| Best Result | 90 | 95 | +5 | From v2: CLAUDE.md generation; from VibeCode: scaffold commands |

**Specific enhancements:**

1. **Merge steps to reduce wizard length: 8 → 6 steps** (Ease of Use +8)
   - Merge Brief + Stack → "Project Setup" (context + tech choices in one view)
   - Merge Whitepaper + Review → "Export" (whitepaper becomes one export option, not a step)
   - New flow: Brief+Stack → Team → Consensus → Grill → Roadmap → Export
   - Make Grill step skippable with "Skip — I'll validate later" button

2. **Cap grill questions at scale** (Scalability +5, Ease of Use +4)
   - Limit to 2 questions per persona (instead of 3) when team > 5 members
   - Add "Most Critical" tag to top 5 questions; allow skipping the rest
   - Add progress indicator: "Answered 8/12 questions"

3. **Add agent orchestrator config from v2** (Functionality +2, Best Result +2)
   - Source: `launch-v2/step-orchestrator.tsx` → orchestrator model, max concurrent agents, toggles
   - Source: `launch-kit-v2.ts` → `AgentOrchestratorConfig` type (lines 34-41)
   - Add as optional section in the Consensus step (since it's related to team governance)
   - Fields: orchestrator model, max concurrent agents, auto-consult on PR, auto-consult on deploy, weekly retros

4. **Add CLAUDE.md generation** (Best Result +3, Scalability +5)
   - Source: `launch-kit-v2.ts` → `generateClaudeMd()` (lines 85-154)
   - Add as primary export in the final Export step
   - Combine: project brief + tech stack + team roster + orchestrator config + roadmap + north star
   - Make this the "one file to rule them all" output alongside individual exports

5. **Add VibeCode scaffold command** (Scalability +5)
   - Source: `vibecode.ts` → `generateScaffoldCommand()` and `VIBECODE_FRAMEWORKS`
   - When tech stack includes a known framework (Next.js, React Vite, etc.), auto-generate scaffold command
   - Display in Export step: "Run this to scaffold your project"

6. **Add coding vibe/principles from VibeCode** (Best Result +2)
   - Source: `vibecode.ts` → `VIBECODE_STYLES` (Move Fast, Production Grade, etc.)
   - Add optional vibe selector in the Stack step
   - Embed selected principles in CLAUDE.md output

**Projected scores after enhancement:**

| Category | Before | After | Change |
|----------|:------:|:-----:|:------:|
| Ease of Use | 65 | 80 | +15 |
| Functionality | 95 | 97 | +2 |
| Best Result | 90 | 95 | +5 |
| Uniqueness | 85 | 88 | +3 |
| Not Redundant | 80 | 85 | +5 |
| Output Versatility | 95 | 97 | +2 |
| Integration | 90 | 92 | +2 |
| Scalability | 70 | 85 | +15 |
| **AVG** | **83.8** | **89.9** | **+6.1** |

---

### Auto-Research — Current: 81.9 → Target: 89.3

**Weak categories to fix:**

| Category | Current | Target | Delta | What to Pull In |
|----------|:-------:|:------:|:-----:|-----------------|
| Ease of Use | 70 | 85 | +15 | Auto-import personas from library; add context templates; model recommendations |
| Output Versatility | 60 | 88 | +28 | Add JSON/Markdown/CSV export; add localStorage persistence; add score history |
| Scalability | 75 | 88 | +13 | Add request queue with progress; custom checklist editor; batch scoring |
| Integration | 82 | 90 | +8 | Auto-load from `/api/personas`; link suggestions to source skill files |

**Specific enhancements:**

1. **Auto-import personas from library** (Ease of Use +8, Integration +5)
   - Add "Load from Library" button in ResearchPanel
   - Call GET `/api/personas` to fetch user's saved personas
   - Auto-populate name, role, company, system_prompt fields
   - Add "Load from team.md" option: paste team.md, auto-parse persona blocks

2. **Add project context template** (Ease of Use +3)
   - Replace freeform textarea with structured fields: target user, problem, success metric, comparables
   - Add validation that all fields are filled before scoring
   - Show tooltip: "Better context = more accurate scores"

3. **Add model recommendation badges** (Ease of Use +2)
   - Tag each model: "Fast + Cheap" (Haiku), "Balanced (Recommended)" (Sonnet), "Deepest Analysis" (Opus)
   - Default to Sonnet with explanation

4. **Promote consensus simulation** (Ease of Use +2)
   - Move sample decision field above "Run Evaluation" button (not hidden below)
   - Add "Recommended" badge
   - Show example decisions: "Should we use SSR or CSR?", "Monolith or microservices?"

5. **Add export buttons for results** (Output Versatility +15)
   - JSON export: full `AutoResearchResult` as downloadable file
   - Markdown export: formatted report with score tables, gap cards, consensus summary
   - CSV export: persona name | relevance | specificity | coverage | differentiation | actionability | overall
   - Add "Copy Summary" button for quick clipboard share

6. **Add localStorage persistence** (Output Versatility +8)
   - Save each evaluation run to localStorage with timestamp + project name
   - Add "History" tab showing past runs
   - Show score trends: "Team score: 72 → 78 → 85 (improving)"
   - Keep round history across page refreshes

7. **Add improvement suggestion actions** (Output Versatility +5)
   - "Copy suggestion" button on each improvement card
   - "Mark as applied" checkbox for tracking
   - Show delta: "Score before: 60% → After applying: 80%"

8. **Add request queue with progress** (Scalability +5)
   - Show progress: "Scoring persona 3/7..." with progress bar
   - Add retry logic for individual persona failures (don't fail the whole batch)
   - Rate-limit parallel requests to avoid API throttling

9. **Add custom checklist editor** (Scalability +5)
   - Add "Create Custom Checklist" option alongside the 7 pre-built targets
   - UI: add yes/no questions + "what it catches" descriptions
   - Save custom checklists to localStorage for reuse

10. **Add batch scoring mode** (Scalability +3)
    - Allow pasting multiple outputs (separated by `---`)
    - Score all at once, show comparison table
    - Highlight best/worst performer

**Projected scores after enhancement:**

| Category | Before | After | Change |
|----------|:------:|:-----:|:------:|
| Ease of Use | 70 | 85 | +15 |
| Functionality | 90 | 93 | +3 |
| Best Result | 88 | 92 | +4 |
| Uniqueness | 95 | 95 | — |
| Not Redundant | 95 | 95 | — |
| Output Versatility | 60 | 88 | +28 |
| Integration | 82 | 90 | +8 |
| Scalability | 75 | 88 | +13 |
| **AVG** | **81.9** | **90.8** | **+8.9** |

---

### Team Builder — Current: 79.8 → Target: 88.4

**Weak categories to fix:**

| Category | Current | Target | Delta | What to Pull In |
|----------|:-------:|:------:|:-----:|-----------------|
| Output Versatility | 70 | 90 | +20 | Add JSON export, per-member Markdown, Supabase save |
| Integration | 75 | 90 | +15 | Save members to persona library; add `/api/teams` endpoint |
| Functionality | 86 | 92 | +6 | From Persona Studio: grill questions for team validation |
| Best Result | 85 | 90 | +5 | Add live prompt preview; richer system prompt generation |

**Specific enhancements:**

1. **Add JSON export** (Output Versatility +8)
   - Create `generateTeamJson()` in `persona-builder-v2.ts`
   - Output: `{ teamName, projectContext, members: [...], dynamics: {...}, generated: timestamp }`
   - Add "Download JSON" button to StepReview

2. **Add per-member Markdown export** (Output Versatility +5)
   - Source: `studio-wizard/step-export.tsx` → per-persona download pattern
   - Each member gets individual `.md` file with YAML frontmatter
   - Add "Download Individual" dropdown per member in review step

3. **Add Supabase save for team members** (Output Versatility +7, Integration +8)
   - Source: `studio-wizard/step-export.tsx` → batch persona save logic (lines 62-97)
   - Add "Save to Library" button that POSTs each member to `/api/personas`
   - Show progress: "Saved 3/5 personas..."
   - Add "Saved" badge on members already in library

4. **Add `/api/teams` endpoint** (Integration +7)
   - New route: POST/GET/PUT/DELETE `/api/teams`
   - Schema: team name, project context, member IDs (link to persona library), dynamics config
   - Add "Save Team" button that persists the entire team structure
   - Show "Load Existing Team" option in StepContext

5. **Add grill questions for team members** (Functionality +4)
   - Source: `studio.ts` → `generateStudioGrillQuestions()` (lines 557-567)
   - Add optional "Grill" step between Dynamics and Review (Step 3.5)
   - Generate 2 questions per member based on their role
   - Allow skip: "Skip validation — export directly"

6. **Add live prompt preview** (Functionality +2, Best Result +3)
   - Source: `studio-wizard/step-team.tsx` → live prompt sidebar panel
   - Show generated system prompt for selected member in real-time
   - Update as user changes role, company, background, communication style

7. **Richer system prompt generation** (Best Result +2)
   - Source: `studio.ts` → `ROLE_PROFILES` with beliefs, optimization targets, push-back items
   - Enhance `generateSystemPrompt()` to include role-specific beliefs and optimization targets
   - Use the same rich role profile data that makes Studio prompts superior

**Projected scores after enhancement:**

| Category | Before | After | Change |
|----------|:------:|:-----:|:------:|
| Ease of Use | 82 | 84 | +2 |
| Functionality | 86 | 92 | +6 |
| Best Result | 85 | 90 | +5 |
| Uniqueness | 80 | 82 | +2 |
| Not Redundant | 78 | 80 | +2 |
| Output Versatility | 70 | 90 | +20 |
| Integration | 75 | 90 | +15 |
| Scalability | 82 | 84 | +2 |
| **AVG** | **79.8** | **86.5** | **+6.7** |

---

## Projected Rankings After Enhancements

| Rank | Builder | Current | Projected | Change |
|:----:|---------|:-------:|:---------:|:------:|
| 1 | **Persona Studio** | 85.0 | **91.0** | +6.0 |
| 2 | **Auto-Research** | 81.9 | **90.8** | +8.9 |
| 3 | **Launch Kit v1** | 83.8 | **89.9** | +6.1 |
| 4 | **Team Builder** | 79.8 | **86.5** | +6.7 |

All four builders cross the 85 threshold. The largest gain comes from **Auto-Research** (+8.9) because its core logic is already excellent — it's purely missing UX polish and export capabilities.

---

## Implementation Priority Matrix

Enhancements ranked by **impact ÷ effort**:

| Priority | Enhancement | Builder | Impact | Effort |
|:--------:|-------------|---------|:------:|:------:|
| 1 | Add export buttons (JSON/MD/CSV) | Auto-Research | +15 | Low |
| 2 | Add JSON export | Team Builder | +8 | Low |
| 3 | Add Supabase persona save | Team Builder | +15 | Medium |
| 4 | Auto-import personas from library | Auto-Research | +13 | Medium |
| 5 | Add team.md export | Persona Studio | +6 | Low |
| 6 | Add localStorage persistence | Auto-Research | +8 | Medium |
| 7 | Merge Launch Kit steps (8→6) | Launch Kit v1 | +12 | Medium |
| 8 | Add CLAUDE.md generation | Launch Kit v1 | +8 | Medium |
| 9 | Add orchestrator config from v2 | Launch Kit v1 | +4 | Low |
| 10 | Add phase authority | Persona Studio | +5 | Medium |
| 11 | Add grill questions | Team Builder | +4 | Medium |
| 12 | Add `/api/teams` endpoint | Team Builder / Studio | +13 | High |
| 13 | Add VibeCode scaffold integration | Launch Kit v1 | +7 | Medium |
| 14 | Add custom checklist editor | Auto-Research | +5 | High |
| 15 | Add LLM provider per persona | Persona Studio | +2 | Low |

---

## Independent Re-Scoring (Post-Enhancement)

Two independent agents audited the codebase after all enhancements were implemented. They read source code directly — no access to prior scores or analysis.

### Three-Way Score Comparison

| Builder | Original | Alpha | Beta | **Consensus AVG** | Δ from Original |
|---------|:--------:|:-----:|:----:|:-----------------:|:---------------:|
| **Expert Persona** | 78.4 | 61.8 | 64.6 | **63.2** | -15.2 |
| **Agent Builder** | 74.0 | 62.0 | 62.9 | **62.5** | -11.5 |
| **Unified Builder** | 76.3 | 59.3 | 62.6 | **61.0** | -15.3 |
| **Persona Studio** | 85.0 | 78.6 | 81.9 | **80.3** | -4.7 |
| **Team Builder** | 79.8 | 68.9 | 72.1 | **70.5** | -9.3 |
| **Launch Kit v1** | 83.8 | 80.6 | 83.8 | **82.2** | -1.6 |
| **Launch Kit v2** | 69.0 | 49.6 | 49.0 | **49.3** | -19.7 |
| **VibeCode** | 76.9 | 63.4 | 67.0 | **65.2** | -11.7 |
| **Auto-Research** | 81.9 | 78.8 | 83.9 | **81.4** | -0.5 |

### Key Takeaways from Independent Audit

**The original scores were inflated by ~10-15 points on average.** Both independent agents scored consistently lower, especially on:
- **Uniqueness** — when you actually read the code, the overlap between Expert/Agent/Unified is even worse than estimated
- **Not Redundant** — Alpha gave Unified Builder a 30, Beta gave 30. The redundancy is glaring.
- **Output Versatility** — Agent Builder's export was found to be JSON-only (no markdown), which we over-scored
- **Scalability** — single-persona builders all scored 50-60 (not the 65-75 we gave)

**What held up well:**
- **Auto-Research** (81.4 consensus, -0.5 from original) — scores validated almost exactly
- **Launch Kit v1** (82.2 consensus, -1.6 from original) — scores validated
- **Persona Studio** (80.3 consensus, -4.7 from original) — slight overestimate but still strong

**What was heavily over-scored originally:**
- **Launch Kit v2** (49.3 consensus, -19.7) — agents called it "an incomplete, inferior subset" of v1
- **Expert Persona** (63.2, -15.2) — "strict subset of Unified, zero reason to exist separately"
- **Unified Builder** (61.0, -15.3) — "textbook redundancy case, no original idea"

### Detailed Alpha Scores

| Builder | Ease | Func | Result | Unique | NotRedundant | Output | Integ | Scale | AVG |
|---------|:----:|:----:|:------:|:------:|:------------:|:------:|:-----:|:-----:|:---:|
| Expert Persona | 82 | 58 | 72 | 55 | 45 | 68 | 62 | 52 | 61.8 |
| Agent Builder | 72 | 70 | 68 | 65 | 55 | 48 | 60 | 58 | 62.0 |
| Unified Builder | 75 | 75 | 74 | 35 | 30 | 68 | 62 | 55 | 59.3 |
| Persona Studio | 78 | 82 | 85 | 78 | 80 | 82 | 72 | 72 | 78.6 |
| Team Builder | 72 | 78 | 76 | 62 | 50 | 75 | 70 | 68 | 68.9 |
| Launch Kit v1 | 68 | 88 | 84 | 82 | 85 | 90 | 78 | 70 | 80.6 |
| Launch Kit v2 | 80 | 52 | 62 | 30 | 20 | 50 | 55 | 48 | 49.6 |
| VibeCode | 85 | 55 | 65 | 72 | 75 | 52 | 58 | 45 | 63.4 |
| Auto-Research | 70 | 82 | 80 | 90 | 90 | 78 | 75 | 65 | 78.8 |

### Detailed Beta Scores

| Builder | Ease | Func | Result | Unique | NotRedundant | Output | Integ | Scale | AVG |
|---------|:----:|:----:|:------:|:------:|:------------:|:------:|:-----:|:-----:|:---:|
| Expert Persona | 82 | 68 | 75 | 55 | 45 | 72 | 65 | 55 | 64.6 |
| Agent Builder | 78 | 75 | 70 | 62 | 48 | 48 | 62 | 60 | 62.9 |
| Unified Builder | 80 | 78 | 78 | 40 | 30 | 72 | 65 | 58 | 62.6 |
| Persona Studio | 85 | 88 | 90 | 82 | 78 | 82 | 78 | 72 | 81.9 |
| Team Builder | 82 | 82 | 80 | 60 | 50 | 78 | 75 | 70 | 72.1 |
| Launch Kit v1 | 80 | 92 | 88 | 85 | 80 | 90 | 80 | 75 | 83.8 |
| Launch Kit v2 | 72 | 55 | 58 | 30 | 20 | 52 | 55 | 50 | 49.0 |
| VibeCode | 85 | 62 | 72 | 78 | 82 | 52 | 55 | 50 | 67.0 |
| Auto-Research | 82 | 88 | 85 | 92 | 90 | 80 | 82 | 72 | 83.9 |

---

## Consensus Rankings (Post-Enhancement)

| Rank | Builder | Consensus AVG | Verdict |
|:----:|---------|:------------:|---------|
| 1 | **Launch Kit v1** | 82.2 | KEEP — platform centerpiece |
| 2 | **Auto-Research** | 81.4 | KEEP — unique meta-evaluation |
| 3 | **Persona Studio** | 80.3 | KEEP — best team builder |
| 4 | **Team Builder** | 70.5 | KEEP but overlaps Studio |
| 5 | **VibeCode** | 65.2 | KEEP — unique scaffolding niche |
| 6 | **Expert Persona** | 63.2 | SCRAP — subset of Unified |
| 7 | **Agent Builder** | 62.5 | SCRAP — subset of Unified |
| 8 | **Unified Builder** | 61.0 | KEEP as replacement for Expert + Agent |
| 9 | **Launch Kit v2** | 49.3 | SCRAP — inferior subset of v1 |

---

## Scrap Recommendations (Hardened)

Both independent agents converged on the same recommendations:

### Definite Scrap (both agents agree)

| Builder | Consensus | Action | Justification |
|---------|:---------:|--------|---------------|
| **Launch Kit v2** | 49.3 | **Delete** | "Incomplete inferior subset of v1" — Alpha. "Stripped everything and produces worse CLAUDE.md" — Beta. v1 now has orchestrator config, making v2 fully redundant. |
| **Expert Persona** | 63.2 | **Delete** | "Strict subset of Unified, zero reason to exist" — Beta. UnifiedDraft literally extends PersonaDraft. |
| **Agent Builder** | 62.5 | **Delete** | "Merge into Unified" — both agents. Move blockchain skills and LLM provider list into Unified. |

### Consolidate

| Builder | Consensus | Action | Justification |
|---------|:---------:|--------|---------------|
| **Team Builder** | 70.5 | **Merge into Persona Studio** | Both do team assembly + grill + consensus. Studio has richer prompts (ROLE_PROFILES). Team Builder's phase authority and conflict modeling should merge into Studio. |

### Keep (Final Platform = 5 Tools)

| Tool | Score | Role |
|------|:-----:|------|
| **Launch Kit v1** | 82.2 | Full project setup (brief → team → tech → roadmap → CLAUDE.md) |
| **Auto-Research** | 81.4 | Quality evaluation + improvement loops |
| **Persona Studio** | 80.3 | Team assembly + grill validation + dynamics |
| **VibeCode** | 65.2 | Quick project scaffolding with coding philosophy |
| **Unified Builder** | 61.0 | Single-persona creation (absorbs Expert + Agent) |

### Remaining Gaps to Close

1. **Unified Builder needs a score boost** — currently lowest "keep" at 61.0. Absorb blockchain skills, richer role profiles from Studio, and improve system prompt quality.
2. **VibeCode needs better integration** — no API save, no library connection (scored 52-55 on Output/Integration).
3. **Team Builder → Studio merge** needs phase authority and conflict modeling migrated properly.
4. **Auto-Research needs persistent storage** — localStorage history was added but no DB persistence yet.
5. **Launch Kit v1 team step** should use Studio's rich ROLE_PROFILES instead of simple role/company inputs.

---

## Top 5 Platform-Wide Missing Capabilities (from Agent Beta)

Both agents identified gaps that transcend individual builders:

### 1. Cross-Builder Data Flow (Critical)
No builder can import data from another. Launch Kit can't pull Studio's team. VibeCode requires manual paste of team.md. Auto-Research loads from library but not from in-progress drafts. A shared state layer or builder-to-builder export would eliminate massive friction.

### 2. Live LLM Persona Consultation (High)
No builder lets you chat with a created persona. System prompts are generated but must be copied to another tool. An inline chat panel for consulting a persona in-context would transform the platform from "prompt factory" to "AI advisory board."

### 3. Import/Resume Support (High)
No builder has load/resume functionality. All state is lost on page refresh. No draft saving, no import from JSON. Export functions exist (`draftToExportJson`, `studioToExportJson`) but there are no corresponding import functions or UI for loading previously exported data.

### 4. CSV Export Across All Builders (Moderate)
`exportResearchToCsv` exists only in Auto-Research. Studio and Launch Kit have rich team data that would benefit from CSV export for spreadsheet users.

### 5. Persona Versioning and Diff (Moderate)
No tracking of persona evolution over time. Auto-Research can score iterations via round history, but there's no way to compare version A vs version B of a persona's system prompt. The `weeklyRetroEnabled` flag in orchestrator config has no implementation behind it.
