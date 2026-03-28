# Skill: Paperclip Bridge

> Connect Persona Builder personas to [Paperclip](https://github.com/paperclipai/paperclip) — an open-source AI agent orchestration platform.

## What This Does

Transforms your persona team into a Paperclip org chart where each persona becomes an autonomous AI agent with:

- **Heartbeat scheduling** — agents check in on regular intervals (default: 60 min)
- **Budget enforcement** — monthly spend limits per agent (default: $50/mo)
- **Org hierarchy** — reporting lines mapped from `reports_to` frontmatter
- **Task routing** — decisions routed to agents based on trigger types
- **Audit logging** — every consultation traced back to company mission

## Persona → Agent Mapping

| Persona Field | Paperclip Agent Field | Notes |
|---|---|---|
| `name` | Agent name | Required |
| `role` | Agent role | Used for task routing |
| `company` | Agent company context | Enriches system prompt |
| `triggers` | Event triggers | When this agent activates |
| `reports_to` | Org chart parent | Agent ID of the manager |
| `heartbeat_minutes` | Heartbeat interval | Default: 60 minutes |
| `monthly_budget_usd` | Monthly budget cap | Default: $50 |
| Content body | System prompt | First 2000 chars used |

## Adding Paperclip Fields to Personas

Add these optional fields to any persona's YAML frontmatter:

```yaml
---
name: "Marcus Rivera"
role: "UX Lead"
company: "Headspace"
triggers:
  - ui-design
  - user-research
  - accessibility
reports_to: ceo-yc-gary-tan
heartbeat_minutes: 30
monthly_budget_usd: 75
---
```

## Usage

### From the UI

1. Navigate to `/paperclip` in the Persona Builder app
2. **Agent Map** tab — see all personas mapped as Paperclip agents, toggle selection
3. **Org Chart** tab — visualize hierarchy and budget summary
4. **Export** tab — generate Paperclip-compatible JSON config

### From the API

```bash
# List personas as agents
GET /api/paperclip

# Generate org chart export
POST /api/paperclip
Content-Type: application/json

{
  "companyName": "My Startup",
  "mission": "Build the best learning app",
  "selectedAgentIds": ["ux-lead", "growth-lead"],
  "heartbeatOverrides": { "ux-lead": 30 },
  "budgetOverrides": { "growth-lead": 100 }
}
```

### Setting Up Paperclip

```bash
# Install and start Paperclip
npx @paperclipai/cli start

# Opens dashboard at localhost:3001
# Create a company, import the exported JSON
# Assign adapters (Claude Code, Codex, Gemini, etc.)
# Agents will begin autonomous execution on heartbeat schedule
```

## Architecture

```
Persona Builder                    Paperclip
┌─────────────────┐               ┌──────────────────┐
│ docs/personas/  │──── export ──→│ Company Org Chart │
│   *.md files    │               │   Agent definitions│
│                 │               │   Heartbeat sched  │
│ /api/paperclip  │               │   Budget limits    │
│   GET  (list)   │               │   Task routing     │
│   POST (export) │               │   Audit log        │
└─────────────────┘               └──────────────────┘
```

## When to Use

- You have 3+ personas and want them to operate autonomously
- You need budget controls on LLM spend across persona consultations
- You want scheduled persona check-ins (e.g., weekly retros via heartbeat)
- You need an audit trail of all persona decisions
- You're running Phase 5 (Post-Launch) and want automated weekly retros
