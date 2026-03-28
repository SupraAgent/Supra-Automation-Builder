# Enhancement Implementation Plan

> **Goal:** Raise Persona Studio, Launch Kit v1, Auto-Research, and Team Builder above 85 avg score
> **Approach:** 4 parallel implementation streams, then 2 independent agent re-scores

---

## Phase 1: Low-Effort / High-Impact (Parallel)

All 4 builders get their easiest wins simultaneously.

### Stream A: Auto-Research — Export Buttons
- Add `exportToJson()`, `exportToMarkdown()`, `exportToCsv()` to `auto-research.ts`
- Add Download JSON / Download MD / Copy Summary buttons to `research-panel.tsx`
- Add Download JSON / Copy Results buttons to `checklist-panel.tsx`

### Stream B: Team Builder — JSON Export + Per-Member Markdown
- Add `generateTeamJson()` to `persona-builder-v2.ts`
- Add `generateMemberMarkdown(member)` for individual persona export
- Add Download JSON / Download Individual buttons to `step-review.tsx`

### Stream C: Persona Studio — team.md Export + JSON Export
- Add `generateStudioTeamMd()` to `studio.ts`
- Add `studioToExportJson()` to `studio.ts`
- Add Download team.md / Download JSON buttons to `step-export.tsx`

### Stream D: Launch Kit v1 — Orchestrator Config
- Import `AgentOrchestratorConfig` type from `launch-kit-v2.ts`
- Add orchestrator fields to `LaunchKitDraft` in `launch-kit.ts`
- Add orchestrator section to `step-consensus.tsx` (model, concurrency, toggles)
- Wire orchestrator config into whitepaper and export outputs

---

## Phase 2: Medium-Effort Enhancements (Parallel)

### Stream E: Auto-Research — Library Import + localStorage + Model Badges
- Add "Load from Library" button → GET `/api/personas` → auto-populate
- Add model recommendation badges (Fast/Balanced/Deep)
- Promote consensus simulation field (move up, add recommended badge)
- Add localStorage persistence: save runs, show history tab, score trends
- Add copy button on improvement suggestions

### Stream F: Team Builder — Supabase Save + Grill + Live Preview
- Add "Save to Library" button → POST each member to `/api/personas`
- Add optional grill step: generate 2 questions/member from Studio's `ROLE_PROFILES`
- Add live prompt preview sidebar on step-members

### Stream G: Persona Studio — Phase Authority + Conflict Modeling
- Add phase authority UI to step-team (assign lead per phase, 1.5x weight)
- Add expected conflict registry (persona pairs + topics)
- Add North Star auto-generation field to step-export
- Wire into team.md and JSON exports

### Stream H: Launch Kit v1 — Step Merge + CLAUDE.md
- Merge Brief+Stack into single "Project Setup" step
- Merge Whitepaper+Review into single "Export" step (8→6 steps)
- Make Grill skippable with "Skip" button
- Cap grill at 2 questions/persona when team > 5
- Add `generateLaunchClaudeMd()` combining all outputs into one CLAUDE.md
- Add VibeCode vibe selector in stack section
- Add scaffold command display in export

---

## Phase 3: Re-Score with Independent Agents

After implementation, spawn 2 independent agents:
- **Agent Alpha**: Fresh codebase audit, scores all 9 builders on the same 8 metrics
- **Agent Beta**: Same task, different agent instance, no shared context
- Compare their scores against our projections
- Identify where we overestimated or missed gaps
- Decide what to scrap based on the hardened scores
