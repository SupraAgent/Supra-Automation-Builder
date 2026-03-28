---
name: "Phase 1: Assemble Persona Team"
description: "Use when the project brief is complete and you need to build a team of expert personas before any code is written. Mandatory — no code until the team is assembled."
license: "MIT"
metadata:
  version: "1.0.0"
  creator: "SupraAgent"
dependencies: ["phase-0-brief"]
outputs: ["docs/personas/*.md", "team.md"]
---

# Phase 1: Assemble Persona Team

> Build a team of expert personas BEFORE touching any code. This phase is mandatory.

## Steps

### 1. Determine Required Roles `[AGENT]`

Based on the project brief, select roles. See [REFERENCE.md](./REFERENCE.md) for role suggestions by project type.

**Default roles (every project):** Product Lead, Technical Architect, UI/UX Lead.

### 2. Check for Existing Personas `[ASK]`

Ask: "I need these roles: [list]. Do you have existing personas on SupraVibe or from a previous project, or should I create all fresh?"

Also check `docs/personas/` and `team.md` in the current project.

### 3. Select Companies to Model `[ASK]`

For each new role, suggest a company based on the comparables from Phase 0. Present a table and let the user swap any.

### 4. Create Each Persona `[AGENT]`

For each role, use `templates/persona_template.md`:
1. Research the company and role
2. Fill every section including Consultation Triggers
3. Add YAML frontmatter (name, role, company, title, triggers)
4. Save to `docs/personas/[role]-[company].md`

Present each to the user for approval.

### 5. Create Team Manifest `[AGENT]`

Create `team.md` with: roster table, quick reference guide, team dynamics, phase priority.

### 6. Run Pre-Flight Check `[AGENT]`

Verify using `templates/persona_check.md`.

## Gate

```
>>> GATE: Phase 1 -> Phase 2
    REQUIRED: Persona file for every role, team.md exists, user approved each persona
    ASK: "The team is assembled: [names and roles]. Move on to tech stack?"
    CANNOT SKIP: Personas MUST exist before any code is written.
    HARD BLOCK: Missing roles = do not proceed.
```
