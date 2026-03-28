---
name: "Phase 2: Tech Stack & Infrastructure"
description: "Use when the persona team is assembled and you need to choose a tech stack and set up project infrastructure. Consult the Technical Architect persona for all decisions."
license: "MIT"
metadata:
  version: "1.0.0"
  creator: "SupraAgent"
dependencies: ["phase-1-personas"]
outputs: ["GitHub repo", "deployed skeleton", "configured auth/database"]
---

# Phase 2: Tech Stack & Infrastructure

> Choose the tech stack and set up the project skeleton. Consult the Technical Architect persona.

## Steps

### 1. Recommend a Tech Stack `[ASK]`

Consult the Tech Architect persona. Present a table:

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | [Framework] | [reason] |
| Backend/API | [Service] | [reason] |
| Database | [Service] | [reason] |
| Auth | [Provider] | [reason] |
| Hosting | [Platform] | [reason] |
| Analytics | [Tool] | [reason] |

### 2. Create the Repository `[ASK]`

Ask: org/account, repo name, public or private. Then create and initialize.

### 3. Set Up Database & Auth `[AGENT]`

Configure database, auth providers, initial schema, environment variables.

### 4. Set Up Hosting & Deployment `[AGENT]`

Connect repo to hosting, configure env vars, set up preview deployments.

### 5. Create Project Structure `[AGENT]`

Scaffold the directory structure. Copy persona files into `docs/personas/`.

### 6. Generate Initial Design System `[AGENT]`

Run the [Design System Synthesis](../design-system/SKILL.md) skill to create `DESIGN.md`:

1. Consult the UI/UX Lead persona for visual direction
2. Gather design inputs (reference URLs, screenshots, or persona-guided generation)
3. Generate `DESIGN.md` with color palette, typography, component patterns, and layout principles
4. Cross-validate with Product Lead and Retention Lead personas
5. Add `DESIGN.md` reference to the project's `CLAUDE.md`

This ensures every UI decision from Phase 3 onward is grounded in a documented, agent-readable design system.

**Optional — Stitch Integration:** If the team wants AI-generated screen designs, set up the [Stitch Bridge](../stitch-bridge/SKILL.md) and connect via MCP. See the Stitch Bridge skill for setup instructions.

## Gate

```
>>> GATE: Phase 2 -> Phase 3
    REQUIRED: Repo exists, stack deployable, auth configured, database connected, personas in project, DESIGN.md created
    ASK: "Infrastructure is set up. Ready to start building features?"
```
