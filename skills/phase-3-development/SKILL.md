---
name: "Phase 3: Development Kickoff"
description: "Use when infrastructure is ready and you're starting to build features. Consult personas at every decision point using the three-level consultation cadence."
license: "MIT"
metadata:
  version: "1.0.0"
  creator: "SupraAgent"
dependencies: ["phase-2-stack"]
outputs: ["CLAUDE.md", "MVP features", "GitHub issues"]
---

# Phase 3: Development Kickoff

> Build the application, consulting personas at every decision point.

## Steps

### 1. Create Project CLAUDE.md `[AGENT]`

Write `CLAUDE.md` with: project description, tech stack, coding conventions, persona team reference, and a design system section pointing to `DESIGN.md`.

### 2. Plan Build Order `[ASK]`

Consult the Product Lead persona for feature priority. Present the ordered list to the user.

### 3. Build with Persona Consultation `[AGENT]`

Consult personas at three levels — see [REFERENCE.md](./REFERENCE.md) for the full consultation cadence and decision-to-persona mapping.

**Quick reference:**
- **Level 1 (Feature Planning):** Before starting a feature — consult Product Lead + domain persona
- **Level 2 (Implementation):** Before each PR — consult relevant domain persona
- **Level 3 (Integration):** After completing a feature — consult 2-3 personas together via Consensus Protocol

### 4. Set Up Dev Workflow `[AGENT]`

Configure linting, formatting, branch conventions, initial GitHub issues.

### 5. Design-to-Code Pipeline (Optional) `[AGENT]`

If using [Google Stitch](https://stitch.withgoogle.com/) for design:

1. Use the [Stitch Bridge](../stitch-bridge/SKILL.md) skill to generate screens from persona guidance
2. For each feature screen: consult persona → enhance prompt → generate in Stitch → validate → export code
3. Use the baton system (`.stitch/next-prompt.md`) for multi-page autonomous generation
4. Update `DESIGN.md` whenever new visual patterns emerge

Even without Stitch, always consult `DESIGN.md` before building any UI component to maintain design consistency.

## Gate

```
>>> GATE: Phase 3 -> Phase 4
    REQUIRED: All MVP features functional, personas consulted, user approved each feature
    ASK: "All MVP features are built. Ready for pre-launch checklist?"
```
