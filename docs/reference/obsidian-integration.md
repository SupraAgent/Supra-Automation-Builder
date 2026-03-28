# Obsidian Integration Guide

> Turn your Persona Builder project into a navigable knowledge graph using [Obsidian](https://obsidian.md/).

---

## Why Obsidian + Persona Builder?

The Persona Builder framework already uses **plain markdown files with YAML frontmatter in a folder structure** — that's literally what an Obsidian vault is. The difference is that Obsidian adds a **linking layer** on top: every file becomes a node, every `[[wikilink]]` becomes an edge, and the **Graph View** reveals relationships you can't see in a flat file tree.

### What You Get

| Feature | What It Does for Persona Builder |
|---------|----------------------------------|
| **`[[Wikilinks]]`** | Link personas to decisions, phases to personas, team files to individual profiles |
| **Backlinks** | See every place a persona is referenced — every decision they influenced |
| **Graph View** | Visualize your entire team topology: who connects to whom, which personas dominate which phases |
| **Dataview** | Dynamic dashboards: "show all personas where role contains 'Lead'" or "list all decisions from Phase 3" |
| **YAML Properties** | Your persona frontmatter (`name`, `role`, `company`, `triggers`) becomes searchable, filterable metadata |
| **Canvas** | Visual boards for team dynamics, consensus protocol flows, phase planning |
| **Templater** | Auto-generate persona files from the template with dynamic variables |

---

## Quick Start: Open as a Vault

Your Persona Builder repo is already vault-ready:

```
1. Install Obsidian from https://obsidian.md/
2. Open Obsidian → "Open folder as vault"
3. Select your Persona Builder project root
4. Enable community plugins (Settings → Community Plugins → Turn on)
5. Install recommended plugins (see below)
```

### Recommended Plugins

| Plugin | Why |
|--------|-----|
| **Dataview** | Query personas by frontmatter fields, build team dashboards |
| **Templater** | Generate new persona files from `templates/persona_template.md` with auto-filled fields |
| **Kanban** | Track project phases as a kanban board with persona assignments |
| **Graph Analysis** | Deeper metrics on your persona graph — find disconnected nodes, central personas |

---

## Linking Convention

Use `[[wikilinks]]` to connect files across the framework. Here's the convention:

### In Persona Files

```markdown
## Core Identity
- **Company:** [[companies/Duolingo]]
- **Related Personas:** [[ux-lead-headspace]], [[product-lead-khan-academy]]

## Consultation Triggers
- When [[Phase 3 - Development]] decisions touch engagement mechanics
- When the [[Consensus Protocol]] is invoked on retention vs. UX trade-offs
```

### In Team Files

```markdown
## Persona Roster
| Role | Persona | Profile |
|------|---------|---------|
| Retention Lead | Marcus Rivera | [[retention-lead-duolingo]] |
| UX Lead | Ava Lindgren | [[ux-lead-headspace]] |
```

### In Decision Logs

```markdown
## Decision: Streak Reset Penalty
- **Consulted:** [[retention-lead-duolingo]], [[ux-lead-headspace]]
- **Protocol:** [[Consensus Protocol]] — 2/3 majority reached
- **Phase:** [[Phase 3 - Development]]
- **Outcome:** Soft reset with 48-hour grace period
```

### Link Patterns

| From | To | Link Example |
|------|----|-------------|
| Persona | Persona | `See also: [[growth-lead-calm]]` |
| Persona | Phase | `Primary voice in [[Phase 3 - Development]]` |
| Team | Persona | `[[retention-lead-duolingo]]` in roster |
| Decision | Persona | `Consulted: [[product-lead-khan-academy]]` |
| Decision | Protocol | `Resolved via [[Consensus Protocol]]` |
| Phase Skill | Phase Skill | `Requires completion of [[Phase 1 - Personas]]` |

---

## Dataview Dashboards

Install the [Dataview plugin](https://github.com/blacksmithgu/obsidian-dataview), then create dashboard notes with live queries.

### Team Roster Dashboard

````markdown
# Team Dashboard

## All Personas
```dataview
TABLE role, company, title
FROM "docs/personas"
SORT role ASC
```

## Personas by Trigger
```dataview
TABLE triggers
FROM "docs/personas"
WHERE contains(triggers, "retention")
```

## Consultation Quick-Ref
```dataview
TABLE role AS "Role", name AS "Ask", triggers AS "When"
FROM "docs/personas"
SORT role ASC
```
````

### Decision Log Dashboard

````markdown
# Decision Log

```dataview
TABLE consulted, outcome, date
FROM "docs/decisions"
SORT date DESC
```
````

### Phase Progress Dashboard

````markdown
# Phase Progress

```dataview
TABLE status, gate-condition AS "Gate", lead AS "Phase Lead"
FROM "skills"
WHERE contains(file.name, "SKILL")
SORT file.name ASC
```
````

---

## Enhanced Frontmatter

Obsidian's Properties feature (1.4+) renders YAML frontmatter as a visual form. Extend your persona frontmatter for richer queries:

```yaml
---
name: "Marcus Rivera"
role: "Retention & Engagement Lead"
company: "Duolingo"
title: "Chief Retention Officer"
type: persona                        # enables: FROM "" WHERE type = "persona"
phase-authority:
  - "Phase 3"
  - "Phase 5"
team: "ios-learning-app"             # group personas by project
optimizes-for: "Day 7 retention"
confidence-weight: "high"            # for consensus protocol queries
aliases:
  - "Marcus"
  - "Retention Lead"
triggers:
  - "Feature impacts daily engagement or retention"
  - "Notification or reminder strategy"
  - "Gamification mechanic design"
  - "Onboarding flow decisions"
---
```

The `aliases` field lets you reference a persona by short name — `[[Marcus]]` resolves to the full persona file.

The `type` field enables Dataview queries like:

````markdown
```dataview
LIST FROM "" WHERE type = "persona" AND team = "ios-learning-app"
```
````

---

## Decision Logs as Linked Notes

Create `docs/decisions/` as a folder of linked decision notes:

```markdown
---
type: decision
date: 2026-03-19
phase: "Phase 3"
consulted:
  - "[[retention-lead-duolingo]]"
  - "[[ux-lead-headspace]]"
protocol: "consensus"
outcome: "approved"
revisit: "2026-04-19"
---

# Decision: Streak Reset Policy

## Context
Users who miss one day lose their entire streak...

## Positions
- **[[retention-lead-duolingo]]**: Keep strict reset (Confidence: High)
- **[[ux-lead-headspace]]**: Add 48-hour grace period (Confidence: High)

## Resolution
Consensus via [[Consensus Protocol]] — grace period wins (UX + Product aligned).

## Revisit Trigger
If Day 7 retention drops below 25% after implementation.
```

---

## Graph View Tips

Once you have wikilinks in place:

1. **Open Graph View** (Ctrl/Cmd + G) to see all connections
2. **Filter by tag** — show only `#persona` nodes or `#decision` nodes
3. **Color by folder** — personas in blue, decisions in green, phases in orange
4. **Depth slider** — focus on a single persona's neighborhood (1-2 hops)

### What the Graph Reveals

- **Highly connected personas** = your most-consulted experts (are you over-relying on one voice?)
- **Isolated nodes** = personas or decisions not linked to anything (gap in your process?)
- **Clusters** = natural groupings of personas + decisions (team dynamics become visible)
- **Phase bridges** = personas that connect across multiple phases (your cross-cutting concerns)

---

## Templater Integration

Set up Templater to auto-generate persona files from your template:

1. Install Templater plugin
2. Set template folder to `templates/`
3. Create a Templater-enhanced version of the persona template:

```markdown
---
name: "<% tp.system.prompt("Persona name?") %>"
role: "<% tp.system.prompt("Role?") %>"
company: "<% tp.system.prompt("Company?") %>"
title: "<% tp.system.prompt("Title?") %>"
type: persona
team: "<% tp.system.prompt("Team/project name?") %>"
created: <% tp.date.now("YYYY-MM-DD") %>
triggers: []
---

# Persona: <% tp.frontmatter.name %>

> **<% tp.frontmatter.title %>** at **<% tp.frontmatter.company %>** | Modeled for: <% tp.frontmatter.role %>
```

This prompts you for each field when creating a new persona, then auto-fills the header.

---

## Canvas for Team Dynamics

Use Obsidian Canvas to visualize:

- **Team topology** — drag persona cards onto a canvas, draw arrows for "conflicts with" and "complements"
- **Consensus flows** — visual decision tree: persona positions → consensus check → CEO tiebreaker
- **Phase roadmap** — timeline view with persona cards assigned to each phase
- **Architecture decisions** — link tech choices to the personas that recommended them

---

## MCP Server (Programmatic Access)

For agent-based workflows, the [obsidian-mcp](https://github.com/aleksakarac/obsidian-mcp) community server provides 33 filesystem-native tools:

- Read/write vault files programmatically
- Query Dataview fields
- Parse and manipulate Kanban boards
- Search by frontmatter properties
- Works offline, no Obsidian app required

This enables Claude or other agents to interact directly with your persona vault — reading persona files, logging decisions, and querying team metadata during development.

---

## Folder Structure (Vault-Ready)

Your existing structure maps cleanly:

```
Persona-Builder/              ← Obsidian vault root
├── .obsidian/                 ← Obsidian config (auto-created)
├── docs/
│   ├── personas/              ← Persona files (nodes in graph)
│   ├── decisions/             ← Decision logs (linked to personas)
│   └── reference/             ← This guide + others
├── skills/                    ← Phase skills (linked to personas)
├── templates/                 ← Persona + decision templates
├── examples/                  ← Example teams (separate subgraphs)
├── CONSENSUS_PROTOCOL.md      ← Central hub node
├── PROJECT_SETUP_PROCESS.md   ← Phase index (hub node)
└── team.md                    ← Team roster (hub node)
```

**Hub nodes** in the graph: `team.md`, `CONSENSUS_PROTOCOL.md`, and `PROJECT_SETUP_PROCESS.md` will naturally become the most-connected nodes since everything references them.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Open your project folder as an Obsidian vault |
| 2 | Install Dataview, Templater, Kanban plugins |
| 3 | Add `[[wikilinks]]` between personas, decisions, and phases |
| 4 | Add `type`, `team`, `aliases` to persona frontmatter |
| 5 | Create dashboard notes with Dataview queries |
| 6 | Use Graph View to discover hidden relationships |
| 7 | Log decisions as linked notes in `docs/decisions/` |
| 8 | Use Canvas for visual team dynamics mapping |

The Persona Builder framework is already 90% of an Obsidian vault. The linking layer turns it from a file tree into a **knowledge graph** where every persona, decision, and phase is a connected node you can navigate, query, and visualize.
