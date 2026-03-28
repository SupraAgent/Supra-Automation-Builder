---
name: "Phase 5: Post-Launch Iteration"
description: "Use after launch to monitor performance, run persona retros, and evolve the team. This phase runs continuously on a weekly cadence."
license: "MIT"
metadata:
  version: "1.0.0"
  creator: "SupraAgent"
dependencies: ["phase-4-prelaunch"]
outputs: ["docs/post-launch-scorecard.md", "weekly retros", "decision audits"]
---

# Phase 5: Post-Launch Iteration

> Monitor real-world performance, iterate, and evolve the team. This phase runs continuously.

## Steps

### 1. Activate Success Metrics `[AGENT]`

Pull success metrics from each persona's profile. Create `docs/post-launch-scorecard.md`:

| Persona | Key Metric | Target | Actual | Status |
|---------|-----------|--------|--------|--------|
| [each persona] | [their metric] | [target] | --- | Pending data |

### 2. Weekly Persona Retro `[AGENT]` + `[ASK]`

Ask each persona: "Looking at this week's data, what's working, what's broken, what should we prioritize?"

Present compiled retro to user. Ask which items to act on this week.

### 3. Persona Team Evolution `[ASK]`

Trigger conditions for changes:
- Persona's metrics consistently met -> their voice can quiet down
- New challenge emerges -> add a persona
- Persona's advice consistently overridden -> re-evaluate fit
- Product pivots -> re-run Phase 1

### 4. Decision Audit `[AGENT]`

Review `docs/decisions/` for decisions with revisit triggers. Flag any where the trigger condition has been met.

## Cadence

```
>>> Phase 5 is ongoing -- no terminal gate.
    RHYTHM: Run Steps 2-4 weekly (or at user-preferred cadence).
    ASK: "How often do you want persona retros? Weekly, bi-weekly, or after each sprint?"
```
