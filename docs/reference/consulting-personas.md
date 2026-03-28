# Consulting Personas

> How and when to consult personas during development.

## The Consultation Pattern

When you hit a decision point, frame the question for the relevant persona:

```
CONTEXT: [What you're building and current state]
DECISION: [The specific choice to make]
CONSTRAINTS: [Limitations -- time, tech, resources]
QUESTION: As [Persona Name], [Title] at [Company], how would you approach this?
```

## When to Consult

Use the persona's **consultation triggers** (in their YAML frontmatter) as the primary signal. As a general guide:

| Trigger | Which Persona |
|---------|--------------|
| Designing a screen or component | UI/UX Lead |
| Choosing between features for MVP | Product Lead |
| Designing onboarding or notifications | Retention Lead |
| Writing copy or positioning | Growth/Marketing Lead |
| Choosing a library or architecture | Technical Architect |
| Handling edge cases or errors | QA Lead |

## Trigger-Based Consultation

Each persona file includes a `triggers` field in its YAML frontmatter:

```yaml
triggers:
  - "Feature impacts daily engagement or retention"
  - "Notification or reminder strategy"
```

When a decision matches any persona's trigger, consult that persona. This is more precise than role-based lookup.

## Multi-Persona Consultation

When a decision spans multiple domains, consult 2+ personas and follow the [Consensus Protocol](../../CONSENSUS_PROTOCOL.md):

1. Each persona states Position, Confidence, Risk if ignored, Compromise
2. >= 67% weighted agreement = proceed
3. Deadlock = CEO Tiebreaker
4. User always has final override

## Updating Personas

Personas should evolve as the project matures:

- After major pivots, revisit team fit
- If a persona's guidance consistently doesn't apply, swap for a better model
- Add new personas for new phases (e.g., "Launch Manager" pre-launch)
- Track decisions in `docs/decisions/` and audit revisit triggers weekly
