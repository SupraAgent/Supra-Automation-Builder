# Persona Quality Guide

> How to verify persona quality and avoid common pitfalls.

## Pre-Flight Checklist

Before using a persona in your project, verify:

- [ ] **Specific, not generic** — modeled after a real role at a real company, not "a good designer"
- [ ] **Relevant expertise** — background directly applies to your project's challenges
- [ ] **Clear point of view** — you can predict how they'd respond to a new question
- [ ] **Actionable guidance** — profile leads to concrete decisions, not vague advice
- [ ] **Differentiated** — each persona brings a distinct perspective
- [ ] **Documented** — saved in `docs/personas/` with all template sections filled
- [ ] **Triggers defined** — at least 3 consultation triggers in frontmatter
- [ ] **Frontmatter valid** — YAML frontmatter matches body content

## Common Anti-Patterns

### Vague Primary Domain

**Bad:** "Design" or "Engineering"
**Good:** "Emotionally-aware mobile UX for daily-use wellness and education apps"

### Generic Core Beliefs

**Bad:** "Good design matters"
**Good:** "If the user has to think about the interface, the interface has failed"

### Missing Consultation Triggers

Without triggers, agents don't know when to consult the persona. Every persona needs 3-5 specific conditions.

### Placeholder Text

`[TODO]`, `[Fill in later]`, or template brackets remaining in the file. Every section must be complete.

### Too Similar Personas

If two personas would give the same advice on most questions, one of them is redundant. Each persona should represent a genuinely different perspective.

### No Success Metrics

A persona without concrete metrics can't be evaluated. Every persona needs a metrics table with specific targets and timeframes.

## Quality Scoring

A complete persona file should have:

| Section | Required | Check |
|---------|----------|-------|
| YAML frontmatter | Yes | name, role, company, title, triggers |
| Core Identity | Yes | All 5 fields filled |
| Primary Domain | Yes | Specific, not generic |
| Core Beliefs | Yes | At least 3, with rationale |
| Optimization Target | Yes | Single metric or outcome |
| Consultation Triggers | Yes | At least 3 conditions |
| Consultation Prompt | Yes | Complete, no placeholders |
| Success Metrics | Yes | Table with targets + timeframes |
