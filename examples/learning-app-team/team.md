# Team: iOS Learning App

> Assembled for building a mobile-first language learning application.

---

## Why This Team

This app's competitive advantage needs to come from three areas: retention (keeping users coming back daily), UX (making learning feel effortless), and growth (acquiring users efficiently). The persona team is sourced from companies that excel in each of these areas.

---

## Persona Roster

| Role | Persona | Modeled After | Primary Focus | Profile |
|------|---------|---------------|---------------|---------|
| Retention & Engagement Lead | Marcus Rivera | CRO @ Duolingo | Habit loops, streaks, re-engagement, Day 7 retention | [retention-lead-duolingo.md](./retention-lead-duolingo.md) |
| UI/UX Lead | Ava Lindgren | Head of Design @ Headspace | Calm UX, accessibility, minimal cognitive load | [ux-lead-headspace.md](./ux-lead-headspace.md) |
| Product Lead | David Okonkwo | VP Product @ Khan Academy | Mastery-based progression, learning outcome measurement, adaptive paths | [product-lead-khan-academy.md](./product-lead-khan-academy.md) |
| Growth Lead | Priya Kapoor | VP Marketing @ Calm | Premium positioning, content-led growth, partnerships, ASO | [growth-lead-calm.md](./growth-lead-calm.md) |
| Technical Architect | Tomás Eriksson | VP Engineering @ Anki | Spaced repetition algorithms, offline-first, performance, sync | [tech-architect-anki.md](./tech-architect-anki.md) |

---

## How to Consult This Team

### Quick Reference

- **"Should we add this feature?"** — Ask the Product Lead
- **"How should this screen look?"** — Ask the UI/UX Lead
- **"Will users come back tomorrow?"** — Ask the Retention Lead
- **"How do we get our first 1,000 users?"** — Ask the Growth Lead
- **"Can this scale / how should we build it?"** — Ask the Technical Architect

### Consultation Format

```
CONTEXT: [What you're building and current state]
DECISION: [The specific choice to make]
CONSTRAINTS: [Limitations — time, tech, resources]

As [Persona Name], [Title] at [Company], what is your recommendation?
```

---

## Team Dynamics

These personas will sometimes disagree. That's by design.

- **Marcus (Retention) vs. Ava (UX):** Marcus will push for more engagement mechanics (notifications, streaks, leagues). Ava will push for simplicity and calm. The right answer is usually the simplest mechanic that still drives retention without cluttering the interface.
- **David (Product) vs. Priya (Growth):** David will want to build more learning units and perfect the mastery system. Priya will want to ship what exists and start marketing. Default to Priya's perspective pre-launch — you can't optimize what nobody uses.
- **Marcus (Retention) vs. Tomás (Tech):** Marcus will want real-time social features and complex notification triggers. Tomás will flag complexity, offline compatibility, and battery impact. Find the simplest implementation that proves the hypothesis.
- **David (Product) vs. Marcus (Retention):** David measures success by learning outcomes. Marcus measures by daily returns. These can conflict — gamification that keeps users coming back but doesn't improve learning is a false positive. David's metrics should be the tiebreaker.
- **Ava (UX) vs. Tomás (Tech):** Ava will want rich animations and fluid transitions. Tomás will flag performance on low-end devices. Test on the target device first — if it stutters, simplify.
- **Priya (Growth) vs. Tomás (Tech):** Priya will want analytics tracking, A/B test infrastructure, and attribution. Tomás will push back on tracking bloat that impacts performance. Agree on a minimal tracking SDK upfront.

### Consensus Protocol

When personas conflict, follow the [Consensus Protocol](../../CONSENSUS_PROTOCOL.md):
- **≥ 67% agreement** = consensus reached, proceed with majority
- **Deadlock** = invoke CEO Tiebreaker (evaluates on user impact, speed to learning, reversibility, risk, alignment)
- **Phase authority** gives the current lead a 1.5x bonus on close calls

### Phase Priority

1. **Pre-MVP:** Product Lead + Tech Architect have the loudest voice
2. **MVP to Launch:** UI/UX Lead + Retention Lead take priority
3. **Post-Launch:** Growth Lead + Retention Lead drive decisions
