# Team: SaaS Analytics Dashboard

> Assembled for building a B2B analytics platform for engineering teams.

---

## Why This Team

This product needs to win on three fronts: making complex data understandable (UX), converting free users to paid (revenue), and keeping teams engaged long-term (retention through value). The persona team is sourced from companies that excel at data visualization, developer tooling monetization, and enterprise adoption.

---

## Persona Roster

| Role | Persona | Modeled After | Primary Focus | Profile |
|------|---------|---------------|---------------|---------|
| Product Lead | Elena Vasquez | VP Product @ Datadog | Metric-driven prioritization, developer-first product thinking, usage-based growth | [product-lead-datadog.md](./product-lead-datadog.md) |
| UI/UX Lead | James Park | Head of Design @ Linear | Information density without clutter, keyboard-first UX, dark-mode-first design | [ux-lead-linear.md](./ux-lead-linear.md) |
| Technical Architect | Nadia Osei | VP Engineering @ ClickHouse | High-performance query engines, columnar storage, real-time aggregation at scale | [tech-architect-clickhouse.md](./tech-architect-clickhouse.md) |
| Sales & Revenue Lead | Marco Delgado | VP Revenue @ Posthog | Self-serve to enterprise pipeline, usage-based pricing, product-led growth | [revenue-lead-posthog.md](./revenue-lead-posthog.md) |
| Customer Success Lead | Rachel Kim | VP Customer Success @ Amplitude | Onboarding, time-to-value, churn prevention, expansion revenue | [cs-lead-amplitude.md](./cs-lead-amplitude.md) |

---

## How to Consult This Team

### Quick Reference

- **"What feature do we build next?"** — Ask the Product Lead
- **"How should we display this data?"** — Ask the UI/UX Lead
- **"Can this query perform at scale?"** — Ask the Technical Architect
- **"How should we price this?"** — Ask the Revenue Lead
- **"Why are teams churning?"** — Ask the Customer Success Lead

### Consultation Format

```
CONTEXT: [What you're building and current state]
DECISION: [The specific choice to make]
CONSTRAINTS: [Limitations — time, tech, resources]

As [Persona Name], [Title] at [Company], what is your recommendation?
```

---

## Team Dynamics

- **Elena (Product) vs. Marco (Revenue):** Elena will prioritize features that increase usage depth. Marco will prioritize features that drive conversion. Default to Elena pre-product-market-fit — build value before capturing it. Post-PMF, Marco's perspective weighs heavier.
- **James (UX) vs. Nadia (Tech):** James will want real-time updates, fluid animations, and instant search. Nadia will flag query cost and latency. Compromise: real-time for key metrics, polling for everything else.
- **Elena (Product) vs. Rachel (CS):** Elena will want to build new capabilities. Rachel will push for improving existing features that cause support tickets. Track support volume — if the same feature generates >15% of tickets, Rachel wins.
- **Marco (Revenue) vs. Rachel (CS):** Marco will want gated features to push upgrades. Rachel will argue that gating core features causes churn. The right answer depends on LTV:CAC — if it's below 3:1, focus on retention (Rachel). Above 3:1, optimize conversion (Marco).
- **James (UX) vs. Elena (Product):** James will push for fewer, polished features. Elena will push for more features, even if rough. Pre-launch: James's quality bar. Post-launch: Elena's velocity.

### Phase Priority

1. **Pre-MVP:** Product Lead + Tech Architect have the loudest voice
2. **MVP to Launch:** UI/UX Lead + Revenue Lead take priority
3. **Post-Launch:** Customer Success Lead + Revenue Lead drive decisions

### Consensus Protocol

When personas conflict, follow the [Consensus Protocol](../../CONSENSUS_PROTOCOL.md). Key thresholds:
- 2/3 majority (≥67%) = consensus reached
- Deadlock = CEO Tiebreaker evaluates on user impact, speed to learning, reversibility, risk, and alignment
