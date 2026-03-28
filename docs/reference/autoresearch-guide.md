# Autoresearch Guide — Self-Improving Skills for the Persona Builder Ecosystem

> Based on Karpathy's autoresearch method. The agent tests and refines any skill on autopilot — you define what "good" looks like, and the loop handles the rest.

---

## The Core Idea

Instead of manually rewriting prompts when quality is inconsistent, you let an agent do it in a loop:

1. Run the skill
2. Score the output (pass/fail checklist)
3. Make one small change
4. Re-run and re-score
5. Keep the change if better, revert if worse
6. Repeat

This works on **anything you can score**: persona profiles, generated CLAUDE.md files, consultation outputs, launch plans, scaffold configs.

---

## Where to Apply Autoresearch

### Persona Builder

**Highest-value target: `write-a-persona` skill**

This is your most-used skill and the one where quality inconsistency hurts most. A weak persona produces bad advice for the entire project lifecycle.

| What to optimize | Checklist focus | Expected impact |
|-----------------|-----------------|-----------------|
| Persona profile quality | Domain specificity, belief concreteness, trigger clarity | Stronger consultations downstream |
| Consultation prompt format | Actionable recs, confidence levels, compromise offers | Better consensus protocol inputs |
| Phase 0 briefs | Target user specificity, problem framing, success metrics | Tighter scope from day 1 |
| Phase 4 pre-launch checks | Verifiable items, real-user scenarios, GTM specifics | Fewer "ship and hope" launches |

**How it connects to the existing quality system:**

Your `persona_check.md` and `persona-quality.md` are already autoresearch checklists in disguise. The pre-flight checklist has 20+ yes/no items — pick the 4-6 that fail most often and use those as your scoring checklist.

**Integration with Phase 5 (Post-Launch):**

Phase 5 runs weekly retros. Add an autoresearch pass:
- After each retro, check if any persona's consultation quality has degraded
- If yes, run autoresearch on `write-a-persona` using recent consultation outputs as test inputs
- The changelog from autoresearch feeds into the next retro as "here's what the system learned"

### Launch Kit

**Highest-value target: `generateClaudeMd` output**

The CLAUDE.md is the single artifact that guides all future agent behavior on a project. If it's vague, every downstream agent inherits that vagueness.

| What to optimize | Checklist focus | Expected impact |
|-----------------|-----------------|-----------------|
| CLAUDE.md generation | Actionable stack config, measurable north star, phase constraints | Agents follow tighter instructions |
| Launch plan generation | Deliverable-per-phase, validation steps, team mapping | More structured builds |
| Orchestrator config | Concrete model/concurrency values, consensus thresholds | Predictable multi-agent behavior |
| Whitepaper generation | Problem specificity, competitive differentiation, metric-backed claims | Stronger positioning docs |

**How it connects to agent orchestration:**

The agent orchestrator exploration (`docs/explorations/agent-orchestrator-patterns.md`) describes post-scaffold validation loops. Autoresearch is the **meta-level** version of this:
- Scaffold validation loops improve a specific project's code
- Autoresearch improves the **skill that generates** those projects

When you optimize the Launch Kit's output templates via autoresearch, every future project gets a better starting CLAUDE.md.

### VibeCode

**Highest-value target: `generateVibeCodeClaudeMd` output and vibe style principles**

| What to optimize | Checklist focus | Expected impact |
|-----------------|-----------------|-----------------|
| CLAUDE.md generation | Actionable principles, verb-phrase features, persona routing | Better code generation from the start |
| Vibe style principles | Debate-settling specificity, constraint count, alternative-ruling | Styles that actually change agent behavior |
| Scaffold commands | Correct flags, framework version handling, cross-platform support | Scaffolds that build on first run |

**How it connects to the CI feedback loop pattern:**

VibeCode already benefits from the lint → fix → re-lint loop described in the orchestrator exploration. Autoresearch adds a layer above this:
- CI loops fix individual code outputs
- Autoresearch fixes the **instruction set** that produces those outputs

After autoresearch optimizes the VibeCode CLAUDE.md template, the CI loop has less to fix because the initial generation is higher quality.

---

## Running Autoresearch Across Products

### Single-Product Run

```
"Run autoresearch on write-a-persona"
→ Agent picks up skills/autoresearch/SKILL.md
→ Asks for test inputs + confirms checklist
→ Runs the loop
→ Saves improved skill + changelog
```

### Cross-Product Run (Advanced)

When you want to optimize the full pipeline:

1. **Start with Persona Builder** — optimize `write-a-persona` first, since persona quality affects everything downstream
2. **Then Launch Kit** — optimize `generateClaudeMd` using personas created by the improved skill
3. **Then VibeCode** — optimize `generateVibeCodeClaudeMd` using the improved Launch Kit outputs as context

This cascade ensures each product benefits from the upstream improvements.

### Parallel Autoresearch

Using the agent orchestration pattern, you can run autoresearch on multiple skills simultaneously:

```
spawn autoresearch-agent for write-a-persona
spawn autoresearch-agent for generateClaudeMd
spawn autoresearch-agent for generateVibeCodeClaudeMd

# Each runs independently with its own checklist
# Dashboard shows all three progress lines
```

---

## The Changelog is the Real Asset

Each autoresearch run produces a changelog:

```
Round 1: KEPT — Added rule "Primary domain must be specific enough to distinguish
  from any other persona." Score: 58% → 72%
Round 2: KEPT — Added banned-terms list for generic domains: "design, engineering,
  marketing, development." Score: 72% → 78%
Round 3: REVERTED — Tried requiring 5+ core beliefs (was 3+). Beliefs became
  thin and repetitive. Score: 78% → 71%
Round 4: KEPT — Added worked example of a strong consultation trigger vs weak one.
  Score: 78% → 88%
```

This changelog is valuable beyond the current run:
- **Future model upgrades:** Hand the changelog to a new model and it picks up where the last left off
- **Team knowledge:** Shows what actually improves quality (not what you'd guess)
- **Skill design patterns:** Over time, changelogs across skills reveal universal patterns (e.g., "worked examples always help," "word-count constraints often backfire")

---

## When NOT to Use Autoresearch

| Situation | Why not |
|-----------|---------|
| The skill has only been used once | Not enough signal — you don't know what "inconsistent" looks like yet |
| The checklist has more than 6 items | The skill will game the checklist. Simplify first |
| The output is subjective (creative writing, art direction) | Yes/no scoring doesn't capture taste. Use human review instead |
| The skill is working fine (90%+ already) | Diminishing returns. Spend time elsewhere |

---

## File Locations

| File | Purpose |
|------|---------|
| `skills/autoresearch/SKILL.md` | The autoresearch skill (run this) |
| `skills/autoresearch/SCORING_CHECKLISTS.md` | Pre-built checklists for every skill |
| `autoresearch-results/{skill}/` | Output directory (created per run) |
| `autoresearch-results/{skill}/dashboard.html` | Live progress dashboard |
| `autoresearch-results/{skill}/changelog.md` | Record of every change tried |
