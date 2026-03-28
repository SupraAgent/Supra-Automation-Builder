---
name: "Write a Persona"
description: "Use when you need to create a new expert persona profile. Produces a complete persona file with YAML frontmatter, all required sections, consultation triggers, and a ready-to-use consultation prompt."
license: "MIT"
metadata:
  version: "1.0.0"
  creator: "SupraAgent"
dependencies: []
outputs: ["docs/personas/{role}-{company}.md"]
---

# Write a Persona

## Inputs Required

1. **Role name** — e.g., "Retention Lead", "Tech Architect"
2. **Company to model** — e.g., "Duolingo", "Stripe"
3. **Focus area** — e.g., "Habit loops and streaks", "API design"
4. **Project context** (optional) — what the persona will advise on

## Steps

### 1. Read the Template

Read `templates/persona_template.md` for the required structure.

### 2. Research the Company and Role

- What is the company known for in this domain?
- What methodologies, frameworks, or approaches do they use?
- What public talks, blog posts, or case studies reveal their thinking?

### 3. Fill Every Section

Complete all sections — no placeholders allowed:

- **YAML Frontmatter:** name, role, company, title, triggers (3-5)
- **Core Identity:** Fictional name, real title/company, years, background summary
- **Expertise & Skills:** Specific primary domain, 3+ secondary skills, signature methodology, tools
- **Strategic Mindset:** 3-5 core beliefs, optimization target, 3+ pushback items, decision style
- **Perspective on This Project:** Build approach, 5 key questions, 3+ red flags, metrics table
- **Consultation Triggers:** 3-5 "consult when..." conditions
- **Consultation Prompt:** Complete prompt with beliefs, optimization target, and pushback items

### 4. Validate

Run the quality checklist below before saving.

### 5. Save

Save to `docs/personas/[role]-[company].md` (lowercase, hyphenated).

## Quality Checklist

- [ ] All template sections filled — no `[placeholder]` text remaining
- [ ] Primary domain is specific, not generic (not "design" but "emotionally-aware mobile UX for wellness apps")
- [ ] At least 3 core beliefs, each with a concrete rationale
- [ ] At least 3 consultation triggers defined
- [ ] Triggers phrased as conditions: "When [decision type] is being made"
- [ ] Success metrics table has concrete targets and timeframes
- [ ] Consultation prompt includes: role intro, 3+ beliefs, optimization metric, anti-patterns
- [ ] YAML frontmatter matches body content
- [ ] File is 120-180 lines (concise enough to scan, detailed enough to be useful)

## Trigger Format Guide

Always phrase triggers as conditions that describe *when* to consult:

**Good triggers:**
- "Feature impacts daily engagement or retention"
- "Database schema or API design decisions"
- "Go-to-market or launch strategy"

**Bad triggers (too vague):**
- "Design decisions" (which design decisions?)
- "Technical stuff" (what specifically?)
- "When needed" (always be specific)

## Consultation Prompt Format

```
You are [Name], [Title] at [Company]. You have [X] years of experience in [specific domain].

Your core beliefs:
- [Belief 1]
- [Belief 2]
- [Belief 3]

You optimize for [primary metric]. You push back on [specific anti-patterns].

You are advising on the development of [Project Name], a [brief description].

Given the following context:
[INSERT CONTEXT]

What is your recommendation?
```
