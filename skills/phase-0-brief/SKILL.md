---
name: "Phase 0: Project Brief"
description: "Use when starting a new project from scratch. Gathers requirements from the user, identifies comparable products, and produces a structured project-brief.md file."
license: "MIT"
metadata:
  version: "1.0.0"
  creator: "SupraAgent"
dependencies: []
outputs: ["project-brief.md"]
---

# Phase 0: Project Brief

> Understand what we're building before making any decisions.

## Steps

### 1. Gather Requirements `[ASK]`

Ask the user (require answers to at least 1-3):

1. "What are we building? Describe the app/website in 1-2 sentences."
2. "Who is the target user?"
3. "What problem does this solve for them?"
4. "What platforms should it run on? (web, iOS, Android, desktop)"
5. "What are the 3-5 core features for the MVP?"

### 2. Identify Comparable Products `[ASK]`

Ask: "What are 3-5 existing products that do something similar? For each, what do they do well?"

If the user isn't sure, suggest comparables based on the description and confirm.

### 3. Document the Brief `[AGENT]`

Create `project-brief.md` in the project root with all answers from steps 1-2.

## Gate

```
>>> GATE: Phase 0 -> Phase 1
    REQUIRED: project-brief.md exists with answers to all questions
    ASK: "Here's the project brief I've documented: [summary]. Does this look right?"
    CANNOT SKIP: Every project needs a brief.
```
