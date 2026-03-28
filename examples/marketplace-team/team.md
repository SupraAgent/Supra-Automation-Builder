# Team: Two-Sided Marketplace (Services)

> Assembled for building a services marketplace connecting providers with customers.

---

## Why This Team

Marketplaces live or die on three things: supply/demand balance (growth), trust (safety), and transaction completion (product). This team is sourced from companies that cracked the hardest marketplace problems — cold start, trust at scale, and network effects.

---

## Persona Roster

| Role | Persona | Modeled After | Primary Focus | Profile |
|------|---------|---------------|---------------|---------|
| Product Lead | Sarah Chen | VP Product @ Airbnb | Two-sided marketplace dynamics, search & discovery, booking flow optimization | [product-lead-airbnb.md](./product-lead-airbnb.md) |
| UI/UX Lead | Daniel Moreno | Head of Design @ Stripe | Trust-building UI, payment flow UX, progressive disclosure, conversion optimization | [ux-lead-stripe.md](./ux-lead-stripe.md) |
| Technical Architect | Yuki Tanaka | VP Engineering @ Uber | Matching algorithms, real-time systems, payment orchestration, geospatial infrastructure | [tech-architect-uber.md](./tech-architect-uber.md) |
| Growth Lead | Amara Johnson | VP Growth @ DoorDash | Supply-side acquisition, geographic expansion, marketplace liquidity, referral loops | [growth-lead-doordash.md](./growth-lead-doordash.md) |
| Trust & Safety Lead | Raj Patel | Head of Trust & Safety @ Etsy | Review systems, fraud detection, dispute resolution, content moderation, seller quality | [trust-safety-etsy.md](./trust-safety-etsy.md) |

---

## How to Consult This Team

### Quick Reference

- **"How should search and matching work?"** — Ask the Product Lead
- **"How do we make the checkout feel safe?"** — Ask the UI/UX Lead
- **"How do we handle payments and disputes?"** — Ask the Technical Architect
- **"How do we get supply in a new market?"** — Ask the Growth Lead
- **"How do we prevent fraud/scams?"** — Ask the Trust & Safety Lead

### Consultation Format

```
CONTEXT: [What you're building and current state]
DECISION: [The specific choice to make]
CONSTRAINTS: [Limitations — time, tech, resources]

As [Persona Name], [Title] at [Company], what is your recommendation?
```

---

## Team Dynamics

- **Sarah (Product) vs. Amara (Growth):** Sarah will optimize for transaction quality and completion rate. Amara will push for more listings and signups. The chicken-and-egg problem is real — default to Amara's supply-side growth until you have enough supply to guarantee demand-side satisfaction.
- **Daniel (UX) vs. Raj (Trust):** Daniel will push for frictionless checkout. Raj will insist on verification steps, ID checks, and review prompts. Every trust mechanic adds friction. The compromise: progressive trust — light verification to start, escalate as transaction value increases.
- **Sarah (Product) vs. Raj (Trust):** Sarah wants to maximize listings. Raj wants to verify every listing. Launch with post-listing moderation (flag and review) rather than pre-listing approval (gate and slow). Switch to pre-approval only for categories with >5% fraud rate.
- **Amara (Growth) vs. Yuki (Tech):** Amara will want rapid geographic expansion. Yuki will flag infrastructure needed for each new market (geospatial, payment providers, compliance). Expand only when the technical foundation can support it — a bad first experience in a new market is worse than launching later.
- **Daniel (UX) vs. Sarah (Product):** Daniel will want a polished single flow. Sarah will want multiple listing types and buyer journeys. Start with one golden path — the single most common transaction type — and expand from there.
- **Raj (Trust) vs. Amara (Growth):** Raj will slow down growth to verify quality. Amara will argue that volume brings data that improves trust systems. Both are right — the resolution is automated trust signals (behavioral, transactional) over manual review wherever possible.

### Phase Priority

1. **Pre-MVP:** Product Lead + Tech Architect have the loudest voice (build the core loop)
2. **MVP to Launch:** Growth Lead + Trust & Safety Lead take priority (fill supply, establish trust)
3. **Post-Launch:** Growth Lead + Product Lead drive decisions (expand and optimize)

### Consensus Protocol

When personas conflict, follow the [Consensus Protocol](../../CONSENSUS_PROTOCOL.md). Key thresholds:
- 2/3 majority (≥67%) = consensus reached
- Deadlock = CEO Tiebreaker evaluates on user impact, speed to learning, reversibility, risk, and alignment
