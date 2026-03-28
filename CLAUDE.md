# SupraLoop — Agent Instructions

You are operating within **SupraLoop**, an iterative improvement engine that benchmarks apps against competitors using AI-generated CPO personas.

## What SupraLoop Does

A 5-step loop that makes any app competitive with industry leaders:

1. **TEAM** — 5 AI personas (Product, Eng, Design, Growth, QA) with weighted voting
2. **APP** — Define what you're building (name, stack, users, state)
3. **BENCHMARK** — Score 3 reference apps on real features → auto-generate CPO personas per competitor
4. **CPO REVIEW** — Each CPO rates your app honestly → gap analysis with priorities
5. **IMPROVE** — Press the button → team picks highest-impact change → CPOs react → re-score → repeat until gap < 10

## Architecture

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **Auth:** Supabase (GitHub OAuth)
- **AI:** Anthropic API (user provides their own key, stored in localStorage)
- **Data:** `.supraloop/` directory committed to user's GitHub repo (config, scores, CPOs, round logs)
- **No vendor lock-in:** All data lives in the user's repo

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/improvement.ts` | Types, scoring constants, CPO generation, gap analysis, round simulation |
| `src/lib/llm-client.ts` | Anthropic API + Ollama client abstraction |
| `src/components/improvement-wizard/` | The 5-step wizard (team, app, benchmark, self-score, improve) |
| `src/components/shell/` | Layout shell and sidebar |
| `src/lib/supabase/` | Auth and session management |

## Tech Stack

```
Next.js 15 + React 19 + TypeScript
Tailwind CSS 4 + Framer Motion
Supabase (auth only)
Anthropic API (user's key)
GitHub API / Octokit (repo integration)
```
