---
name: "Phase 4: Pre-Launch"
description: "Use when all MVP features are built and you need to verify launch readiness. Runs a checklist, persona final review, and GTM strategy."
license: "MIT"
metadata:
  version: "1.0.0"
  creator: "SupraAgent"
dependencies: ["phase-3-development"]
outputs: ["pre-launch checklist", "persona review", "GTM plan"]
---

# Phase 4: Pre-Launch

> Verify everything is ready to ship.

## Steps

### 1. Run Pre-Launch Checklist `[AGENT]`

- [ ] All MVP features functional and tested
- [ ] Auth flows work end-to-end
- [ ] Database security policies in place (RLS if Supabase)
- [ ] Environment variables secured
- [ ] Error handling and loading states on all screens
- [ ] Mobile responsive (if web app)
- [ ] Analytics/tracking in place
- [ ] SEO meta tags configured (if web)
- [ ] App store assets prepared (if mobile)
- [ ] README has setup instructions

### 2. Persona Final Review `[AGENT]`

Ask each persona: "Reviewing this app before launch, what's the biggest risk or gap you see?"

Document their concerns and present to the user.

### 3. GTM Readiness `[ASK]`

Consult the Growth/Marketing Lead. Present their launch recommendations. Ask: "Implement any of these before launch, or ship now and iterate?"

## Gate

```
>>> GATE: Phase 4 -> Launch
    REQUIRED: Checklist passes, user reviewed persona concerns, GTM decided
    ASK: "Everything checks out. Ready to launch?"
```
