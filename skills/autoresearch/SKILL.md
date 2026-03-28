---
name: "Autoresearch"
description: "Auto-improve any skill by testing it in a loop, scoring outputs against a checklist, making one small change at a time, and keeping only what improves the score. Based on Karpathy's autoresearch method."
license: "MIT"
metadata:
  version: "1.0.0"
  creator: "SupraAgent"
dependencies: ["target skill file must exist"]
outputs: ["improved skill file", "changelog", "results log", "dashboard (HTML)"]
---

# Autoresearch — Self-Improving Skill Loop

> Run this on any skill in the ecosystem. The agent tests, scores, tweaks, and repeats — autonomously — until the skill consistently passes its quality checks.

## How It Works

```
1. Run the skill with test inputs
2. Score the output against a yes/no checklist
3. Analyze which checks are failing
4. Make ONE small change to the skill prompt
5. Re-run and re-score
6. Keep the change if score went up, revert if it went down
7. Repeat until 95%+ three times in a row (or max rounds hit)
```

## Inputs Required

1. **Target skill** — path to the SKILL.md file to optimize (e.g., `skills/write-a-persona/SKILL.md`)
2. **Test inputs** — 3-5 representative inputs to run the skill against each round
3. **Scoring checklist** — 3-6 yes/no questions that define "good output" (see below)
4. **Max rounds** — how many improvement loops to run (default: 10)

## Steps

### 1. [ASK] Select the Target Skill

Ask the user which skill to optimize. Offer these options for the Persona Builder ecosystem:

| Skill | File | What It Produces |
|-------|------|-----------------|
| Write a Persona | `skills/write-a-persona/SKILL.md` | Persona profile markdown |
| Phase 0 Brief | `skills/phase-0-brief/SKILL.md` | Project brief document |
| Phase 2 Stack | `skills/phase-2-stack/SKILL.md` | Tech stack decision |
| Phase 4 Pre-Launch | `skills/phase-4-prelaunch/SKILL.md` | Launch readiness checklist |
| Launch Kit CLAUDE.md | `src/lib/launch-kit-v2.ts:generateClaudeMd` | Generated CLAUDE.md |
| VibeCode CLAUDE.md | `src/lib/vibecode.ts:generateVibeCodeClaudeMd` | Generated CLAUDE.md |
| Persona Builder v2 team.md | `src/lib/persona-builder-v2.ts:generateTeamMd` | Generated team.md |

Or any custom skill the user points to.

### 2. [ASK] Define Test Inputs

Ask the user for 3-5 test inputs that represent real usage. Examples:

- **Write a Persona:** "Create a Retention Lead modeled after Duolingo for a fitness app"
- **Launch Kit:** "SaaS analytics dashboard targeting startup founders"
- **VibeCode:** "Next.js + Supabase todo app with auth, move-fast style"

If the user isn't sure, suggest inputs based on the existing examples in `examples/`.

### 3. [ASK] Define the Scoring Checklist

Present the pre-built checklist for the target skill (see `SCORING_CHECKLISTS.md`). Ask the user to confirm, modify, or write their own.

Rules for good checklist questions:
- **Yes/No only** — no scales, no "rate 1-10"
- **Specific** — "Does the headline include a number?" not "Is the headline good?"
- **Observable** — can be verified by reading the output, not subjective vibes
- **3-6 questions** — more than 6 and the skill starts gaming the checklist

### 4. [AGENT] Establish Baseline

Run the target skill with all test inputs. Score each output against the checklist. Calculate the baseline score.

```
Baseline Score = (total checks passed across all inputs) / (total checks × total inputs) × 100
```

Record:
- Per-input scores
- Per-check pass rates (which checks fail most?)
- Overall baseline percentage

Save to `autoresearch-results/{skill-name}/round-0-baseline.md`.

### 5. [AGENT] Generate Dashboard

Create an HTML dashboard at `autoresearch-results/{skill-name}/dashboard.html`:

- Score chart (baseline → current, line graph)
- Per-check pass rates (bar chart)
- Change log (what was tried, kept/reverted)
- Auto-refreshes every 10 seconds

### 6. [AGENT] Enter the Improvement Loop

For each round (1 to max_rounds):

#### 6a. Analyze Failures

Look at which checklist items fail most. Prioritize the most-failed check.

#### 6b. Hypothesize One Change

Based on the failure pattern, propose ONE small, specific change to the skill file. Examples:
- Add a specific rule: "Your headline MUST include a number or concrete result"
- Add a banned-items list: "NEVER use these words: ..."
- Add a worked example showing what good output looks like
- Tighten a constraint: "Keep the background summary under 2 sentences"
- Add a validation step: "Before saving, verify all triggers are phrased as conditions"

**Critical:** Only ONE change per round. Multiple changes make it impossible to know what helped.

#### 6c. Apply the Change

Edit the target skill file with the proposed change.

#### 6d. Re-run and Re-score

Run the skill with all test inputs again. Score against the same checklist.

#### 6e. Keep or Revert

```
If new_score > previous_score:
  KEEP the change
  Log: "Round N: KEPT — [description of change]. Score: X% → Y%"
Else:
  REVERT the change (restore previous version)
  Log: "Round N: REVERTED — [description of change]. Score: X% → Y% (worse)"
```

#### 6f. Check Exit Conditions

- If score ≥ 95% for 3 consecutive rounds → **STOP** (skill is optimized)
- If max_rounds reached → **STOP**
- If 3 consecutive reverts → **PAUSE** and ask user for guidance

#### 6g. Update Dashboard

Add the round's results to the dashboard.

### 7. [AGENT] Save Results

When the loop ends, save:

1. **Improved skill** → `autoresearch-results/{skill-name}/SKILL.improved.md`
2. **Changelog** → `autoresearch-results/{skill-name}/changelog.md`
   - Every change attempted, why, and whether it was kept
3. **Results log** → `autoresearch-results/{skill-name}/results.md`
   - Score per round, per-check breakdown
4. **Original backup** → `autoresearch-results/{skill-name}/SKILL.original.md`
5. **Dashboard** → `autoresearch-results/{skill-name}/dashboard.html`

### 8. [ASK] Review and Apply

Present the user with:
- Before/after score
- Summary of changes that were kept
- Diff of the original vs. improved skill

Ask: "Apply the improved version to the original skill file?"

If yes → replace the original. If no → leave the improved version in autoresearch-results/ for later.

---

## Scoring Protocol

The scoring agent MUST be independent from the generation agent. When scoring:

1. Read the checklist question exactly as written
2. Read the output
3. Answer YES or NO — nothing else
4. Do not consider "close enough" — it either passes or it doesn't
5. Do not let previous rounds influence the current score

This prevents the scoring from drifting or getting lenient over time.

---

## When to Run Autoresearch

| Signal | Action |
|--------|--------|
| A skill produces inconsistent quality | Run autoresearch with 5+ test inputs |
| You just wrote a new skill | Run autoresearch to tighten it before first real use |
| A new model is available | Re-run to recalibrate prompts for the new model |
| The scoring checklist has changed | Re-run to optimize against updated criteria |
| Post-launch Phase 5 retro identifies weak persona output | Run on write-a-persona |

---

## Integration with Agent Orchestration

When running in an orchestrated environment (see `docs/explorations/agent-orchestrator-patterns.md`):

- The **improvement loop** can run as a background agent — spawn it and get notified on completion
- The **scoring** can run as a parallel sub-agent for faster evaluation
- The **dashboard** integrates with the supervision dashboard pattern
- Multiple skills can be autoresearched in parallel (one agent per skill)
