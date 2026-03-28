# Linked Knowledge System

> Turn Persona Builder's flat file tree into a navigable knowledge graph — no specific app required.

---

## The Core Idea

Every file in this framework — personas, decisions, phases, team manifests — is a **node**. Every `[[wikilink]]` between files is an **edge**. Together they form a **knowledge graph** that reveals:

- Which personas influence which decisions
- Which phases depend on which personas
- Where gaps exist (unlinked personas = underutilized experts)
- How decisions chain together across phases

This is not a product feature — it's a **file convention**. Any tool that renders `[[wikilinks]]` gives you the graph for free.

---

## Why This Matters for Persona Builder

### The Problem with Flat Files

Right now, persona files sit in `docs/personas/` as isolated documents. The `team.md` references them, but there's no reverse link — the persona file doesn't know where it's been consulted, which decisions it influenced, or how it connects to other personas.

### What Linking Adds

```
Before:  persona.md  →  (nothing)
After:   persona.md  ←→  decision-001.md  ←→  phase-3-SKILL.md
                     ←→  decision-003.md
                     ←→  team.md
                     ←→  another-persona.md
```

Every persona becomes a hub. Follow its backlinks to see its full influence. The graph view shows which personas dominate (too much?) and which are underused (gap?).

### Autoresearch + Link Graph

The link graph feeds directly into autoresearch:

1. **Persona coverage check** — Are all personas linked from at least one decision? If not, that persona isn't being consulted enough.
2. **Decision quality check** — Does every decision link to at least 2 personas? Single-persona decisions skip the consensus protocol.
3. **Phase balance check** — Are phase skills linking to the right personas for their domain? Phase 3 should reference the Tech Architect and Product Lead, not just the Growth Lead.
4. **Team dynamics validation** — Do the conflict pairs documented in `team.md` actually appear in decision logs? If Marcus and Ava never disagree in practice, maybe the documented tension isn't real.

---

## Wikilink Convention

### Syntax

```markdown
[[filename]]           → links to filename.md anywhere in the vault
[[folder/filename]]    → links to a specific path
[[filename|display]]   → links to filename.md but shows "display" text
```

### Where to Add Links

| File Type | Link To | Example |
|-----------|---------|---------|
| Persona | Other personas, phases, team | `Related: [[ux-lead-headspace]]` |
| Team | All persona files | `[[retention-lead-duolingo]]` in roster |
| Decision | Consulted personas, protocol | `Consulted: [[product-lead-khan-academy]]` |
| Phase Skill | Relevant personas, prior phases | `Consult [[retention-lead-duolingo]] for engagement` |
| Consensus | Decision logs | Referenced from `[[decision-001-streak-policy]]` |

### Decision Log Template

Create decision notes in `docs/decisions/`:

```markdown
---
type: decision
id: "DEC-001"
date: 2026-03-19
phase: "Phase 3"
status: "resolved"
consulted:
  - "retention-lead-duolingo"
  - "ux-lead-headspace"
protocol: "consensus"
outcome: "approved"
revisit: "2026-04-19"
---

# DEC-001: Streak Reset Policy

## Context
Should missing one day reset the entire streak?

## Positions
- **[[retention-lead-duolingo]]**: Keep strict reset (Confidence: High)
  - Rationale: Loss aversion drives returns. Strict streaks = 20% higher D14.
- **[[ux-lead-headspace]]**: 48-hour grace period (Confidence: High)
  - Rationale: Punishing users increases anxiety and churn.

## Consensus Check
2/3 majority → Grace period wins (UX + Product aligned vs. Retention alone).
Protocol: [[CONSENSUS_PROTOCOL]]

## Decision
48-hour grace period with visual warning at 24 hours.

## Revisit Trigger
If Day 7 retention drops below 25% post-implementation.
```

---

## Open-Source Tools That Support This

You don't need Obsidian. Here are fully open-source alternatives ranked by fit for Persona Builder:

### Tier 1: Best Fit

| Tool | Why | Graph View | Wikilinks | Self-Hosted | License |
|------|-----|-----------|-----------|-------------|---------|
| **[Foam](https://foambubble.github.io/foam/)** | VS Code extension — if you already code here, zero new tooling. Auto-updates links on rename. | Yes | Yes | Local files | MIT |
| **[Logseq](https://logseq.com/)** | Standalone app, closest to Obsidian. Block-level linking, built-in queries, daily journals. | Yes | Yes | Local files | AGPL-3.0 |

### Tier 2: Strong Alternatives

| Tool | Why | Graph View | Wikilinks | Self-Hosted | License |
|------|-----|-----------|-----------|-------------|---------|
| **[SiYuan](https://b3log.org/siyuan/)** | Block-level references, E2E encrypted sync, powerful querying. | Yes | Yes | Docker/local | AGPL-3.0 |
| **[Trilium Notes](https://github.com/zadam/trilium)** | Self-hosted wiki with relation maps, scripting, hierarchical trees. Best for power users. | Relation map | Yes | Docker/local | AGPL-3.0 |
| **[NoteDiscovery](https://www.notediscovery.com/)** | Lightweight, MCP-integrated. Graph view + AI assistant. New but promising. | Yes | Yes | Self-hosted | Open source |

### Tier 3: Specialized

| Tool | Why | Best For |
|------|-----|----------|
| **[Dendron](https://www.dendron.so/)** | VS Code extension with hierarchical note structure. Git-native. | Developers who live in VS Code |
| **[Zettlr](https://www.zettlr.com/)** | Academic focus, Zotero integration, Zettelkasten method. | Research-heavy persona creation |
| **[Wiki.js](https://js.wiki/)** | Full wiki with team collaboration, RBAC, Git-backed storage. | Team-shared persona vaults |

### My Recommendation

**For solo use:** Foam (if you use VS Code) or Logseq (if you want a standalone app).
**For team use:** Wiki.js or Trilium Notes (self-hosted, collaborative).
**For zero dependencies:** Just use the wikilink convention in your markdown files. Any renderer or tool can parse `[[double brackets]]`.

---

## Zero-Dependency Approach: Native Linking

If you don't want any external tool, the wikilink convention still works. Add a simple validation script to check link integrity:

### What This Gives You Without Any Tool

1. **Agent-readable links** — Claude and other agents can follow `[[wikilinks]]` to navigate between files during consultation
2. **Grep-able connections** — `grep -r '\[\[retention-lead' .` finds every reference to a persona
3. **Autoresearch input** — link density = persona utilization metric
4. **GitHub-renderable** — GitHub renders `[[wikilinks]]` as plain text, but the references are still human-readable

### Link Validation (Agent Task)

An agent can validate the link graph:

```
1. Find all [[wikilinks]] in all .md files
2. Check that each linked file exists
3. Report broken links
4. Report orphan files (no incoming links)
5. Report persona files never referenced in decisions/
6. Score: linked_personas / total_personas = utilization rate
```

This becomes an autoresearch scoring checklist item.

---

## Autoresearch Integration

Add these checks to `skills/autoresearch/SCORING_CHECKLISTS.md`:

### Persona Link Quality Checklist

```
CHECKLIST: persona-link-quality
- [ ] Persona file has at least 1 outgoing [[wikilink]] to another persona
- [ ] Persona file is referenced by team.md
- [ ] Persona is referenced in at least 1 decision log
- [ ] Persona's consultation triggers match the decisions that reference it
- [ ] Persona has a [[wikilink]] to the phase(s) where it has authority
- [ ] Persona's "Related Personas" section links to conflict partners from team.md dynamics
```

### Decision Log Quality Checklist

```
CHECKLIST: decision-link-quality
- [ ] Decision links to at least 2 persona files
- [ ] Decision links to [[CONSENSUS_PROTOCOL]] if multi-persona
- [ ] Decision has a revisit date in frontmatter
- [ ] Decision links to the phase it belongs to
- [ ] Decision outcome is documented (not just positions)
```

### Team Graph Health Checklist

```
CHECKLIST: team-graph-health
- [ ] Every persona in team.md roster is a [[wikilink]]
- [ ] Every conflict pair in Team Dynamics has at least 1 decision log showing the conflict
- [ ] No persona has 0 incoming links from decisions/
- [ ] Phase Priority personas match the personas most-linked in that phase's decisions
- [ ] Graph has no isolated clusters (every persona connects to at least 1 other persona)
```

---

## The "Merkle Tree" Analogy

You mentioned a merkle tree — that's actually a useful mental model:

```
                    team.md (root hash)
                   /        \
          persona-A.md    persona-B.md (leaf hashes)
         /     |              |     \
    dec-001  dec-003      dec-002  dec-004 (transaction hashes)
        \      /              \      /
     phase-3-SKILL.md    phase-4-SKILL.md (block hashes)
```

Each level validates the one below:
- **team.md** validates that all personas exist and are configured
- **Personas** validate that they've been consulted (have decision links)
- **Decisions** validate that the consensus protocol was followed
- **Phases** validate that the right personas were consulted at the right time

The autoresearch loop walks this tree bottom-up: check decisions → check persona coverage → check team completeness → score the whole system.

---

## Summary

| Approach | Effort | What You Get |
|----------|--------|-------------|
| **Wikilink convention only** | 5 min | Agent-navigable links, grep-able references, autoresearch input |
| **Foam (VS Code)** | 15 min | + Graph view, auto-link updates, backlink panel |
| **Logseq** | 30 min | + Block-level linking, built-in queries, daily journals |
| **Full vault setup** | 1 hour | + Dataview dashboards, Templater, Canvas, Kanban |

Start with the convention. Add a tool if/when you want visual navigation. The links themselves are the value — the tool is just the renderer.
