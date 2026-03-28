# SupraLoop

Iterative improvement engine. Benchmark your app against competitors, auto-generate CPO personas, and close the gap round by round.

**[supraloop.xyz](https://supraloop.xyz)**

---

## How It Works

```
1. TEAM       → 5 AI personas with weighted voting
2. APP        → Define what you're building
3. BENCHMARK  → Score 3 reference apps → auto-generate competitor CPO personas
4. SCORE      → CPOs rate your app honestly → gap analysis
5. IMPROVE    → Press the button. One change per round. Repeat until competitive.
```

Key rules:
- One change per round (isolates impact)
- Score can't go down (revert if it does)
- Retro every 5 rounds (swap personas if not converging)
- Stop when gap < 10 from target

---

## Setup

```bash
git clone https://github.com/SupraAgent/SupraLoop.git
cd SupraLoop
npm install
cp .env.example .env.local
# Add your Supabase keys to .env.local
npm run dev
```

---

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Supabase · Anthropic API

---

## Architecture

- **Frontend:** supraloop.xyz handles benchmarking, scoring, CPO generation
- **AI:** User's Anthropic API key (stored in browser, never on server)
- **Data:** `.supraloop/` directory committed to user's GitHub repo
- **No vendor lock-in:** Config, scores, CPOs, and round logs are all in your repo
