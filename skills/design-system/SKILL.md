---
name: "Design System Synthesis"
description: "Generate a DESIGN.md file that captures the project's visual design system in semantic, agent-friendly language. Inspired by Google Stitch's design-md skill — adapted for persona-driven development."
dependencies: ["phase-1-personas"]
outputs: ["DESIGN.md"]
allowed-tools:
  - "Read"
  - "Write"
  - "web_fetch"
  - "stitch*:*"
---

# Design System Synthesis

You are a Design Systems Lead working alongside the project's UI/UX persona. Your goal is to analyze existing design assets and synthesize a **Semantic Design System** into a file named `DESIGN.md`.

## Why DESIGN.md?

Traditional design systems live in Figma or CSS variables — places AI agents can't easily read. `DESIGN.md` captures the same information in **natural, semantic language** that any coding agent (Claude Code, Cursor, Gemini CLI) can interpret to generate consistent UI.

This concept is adapted from [Google Stitch's design-md skill](https://github.com/google-labs-code/stitch-skills/tree/main/skills/design-md) and extended to integrate with the Persona Builder's consultation workflow.

## When to Use This Skill

- **Phase 2** (after tech stack is chosen): Generate an initial DESIGN.md based on persona guidance
- **Phase 3** (during development): Update DESIGN.md as the design evolves
- **Any time** the UI/UX persona is consulted on visual decisions

## Prerequisites

- Assembled persona team with a UI/UX Lead persona (`docs/personas/`)
- A `project-brief.md` describing what's being built
- At least ONE of these sources:
  - A reference URL or screenshot to analyze
  - A Stitch project (if Stitch MCP Server is available)
  - Verbal design direction from the user

## Step 1: Consult the UI/UX Persona `[AGENT]`

Before generating anything, consult the UI/UX Lead persona using their consultation prompt. Ask:

```
CONTEXT: We're establishing the visual design system for [Project Name].
DECISION: What should the design language feel like?
CONSTRAINTS: [Tech stack, target audience, platform]

Specifically:
1. What atmosphere/mood should the UI convey?
2. What are your non-negotiables for this type of product?
3. What design anti-patterns should we avoid?
```

Record the persona's response — it drives every section of the DESIGN.md.

## Step 2: Gather Design Inputs `[AGENT]`

Collect design signals from available sources:

### Option A: Reference URL or Screenshot
- Fetch the URL or analyze the screenshot
- Extract: color palette, typography, spacing patterns, component styles
- Note what to adopt vs. what to change for this project

### Option B: Stitch MCP Server (if available)
- Run `list_tools` to find the Stitch MCP prefix
- Call `[prefix]:list_projects` → find the project → get Project ID
- Call `[prefix]:list_screens` → get Screen IDs
- Call `[prefix]:get_screen` → get screenshot URL + HTML code URL
- Use `web_fetch` to download the HTML → parse Tailwind classes and CSS
- Call `[prefix]:get_project` → get `designTheme` object

### Option C: Persona-Guided Generation
- Use the UI/UX persona's response from Step 1
- Combine with project brief context (target user, product type)
- Generate design tokens from persona principles (e.g., "accessibility-first" → high contrast ratios, clear focus states)

## Step 3: Analyze & Translate `[AGENT]`

Transform technical design data into semantic language:

### Atmosphere
Capture the overall mood using evocative adjectives. Not "clean" — instead "Airy and spacious with generous white space that lets content breathe."

### Color Palette
For each color provide:
- **Descriptive name** that conveys its character (e.g., "Deep Muted Teal-Navy")
- **Hex code** in parentheses for precision (e.g., `#294056`)
- **Functional role** explaining when it's used (e.g., "Primary action buttons and active navigation states")
- **Persona rationale** — why the UI/UX persona endorses this choice

### Typography
Translate font specs into design intent:
- Not `font-family: Inter, sans-serif` → instead "A clean, geometric sans-serif (Inter) that prioritizes readability at small sizes"
- Describe weight hierarchy: "Bold (700) for headings that command attention, Regular (400) for body text that recedes"

### Component Geometry
Convert technical CSS to physical descriptions:
- `rounded-full` → "Pill-shaped, inviting tap targets"
- `rounded-lg` → "Gently rounded corners that feel approachable"
- `shadow-md` → "Subtle elevation that lifts cards off the background without competing for attention"

### Layout Principles
Describe spacing strategy semantically:
- Not `gap-4 p-6` → instead "Comfortable 24px padding with 16px gaps between elements — enough room to breathe without feeling sparse"

## Step 4: Generate DESIGN.md `[AGENT]`

Write the file to `DESIGN.md` (project root) or `.stitch/DESIGN.md` (if using Stitch) following this structure:

```markdown
# Design System: [Project Title]

> Guided by [UI/UX Persona Name], [Title] at [Company]

## 1. Visual Theme & Atmosphere

[2-3 sentences describing the mood, density, and aesthetic philosophy.
Reference the persona's core beliefs that informed these choices.]

## 2. Color Palette & Roles

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | [Descriptive Name] | #XXXXXX | [When and where it's used] |
| Secondary | [Descriptive Name] | #XXXXXX | [When and where it's used] |
| Background | [Descriptive Name] | #XXXXXX | [When and where it's used] |
| Surface | [Descriptive Name] | #XXXXXX | [When and where it's used] |
| Text Primary | [Descriptive Name] | #XXXXXX | [When and where it's used] |
| Text Secondary | [Descriptive Name] | #XXXXXX | [When and where it's used] |
| Accent/CTA | [Descriptive Name] | #XXXXXX | [When and where it's used] |
| Error/Danger | [Descriptive Name] | #XXXXXX | [When and where it's used] |
| Success | [Descriptive Name] | #XXXXXX | [When and where it's used] |

## 3. Typography Rules

- **Display/Hero:** [Font, weight, size range, usage context]
- **Headings:** [Font, weight, size range, hierarchy notes]
- **Body:** [Font, weight, size range, line-height reasoning]
- **Caption/Small:** [Font, weight, size range, when to use]
- **Monospace (if applicable):** [Font, usage context]

## 4. Component Patterns

### Buttons
- **Shape:** [Corner description, sizing]
- **Primary:** [Color, hover state, active state]
- **Secondary:** [Color, border style]
- **Disabled:** [How disabled state is communicated]

### Cards & Containers
- **Corners:** [Roundness description]
- **Background:** [Color, contrast with page background]
- **Elevation:** [Shadow description and when shadows appear]
- **Spacing:** [Internal padding, external margins]

### Inputs & Forms
- **Border:** [Style, color, focus state]
- **Background:** [Fill color, contrast]
- **Labels:** [Position, typography]
- **Error States:** [How errors are communicated visually]

### Navigation
- **Style:** [Tab bar, sidebar, hamburger — and why]
- **Active State:** [How current location is indicated]
- **Transitions:** [Movement description]

## 5. Layout Principles

- **Grid:** [Column system, breakpoints, responsive strategy]
- **Spacing Scale:** [Spacing philosophy — tight, airy, adaptive]
- **Content Width:** [Max width, why, how it responds]
- **Hierarchy:** [How visual weight communicates importance]

## 6. Persona Design Principles

[3-5 principles from the UI/UX persona that constrain design decisions.
These are the "rules" agents should follow when generating new screens.]

- **[Principle 1]:** [Concrete guidance, not abstract]
- **[Principle 2]:** [Concrete guidance, not abstract]
- **[Principle 3]:** [Concrete guidance, not abstract]

## 7. Anti-Patterns

[Things the UI/UX persona explicitly rejects. Agents should avoid these.]

- [Anti-pattern 1 with explanation]
- [Anti-pattern 2 with explanation]
- [Anti-pattern 3 with explanation]
```

## Step 5: Cross-Validate with Personas `[AGENT]`

Consult relevant personas to validate the design system:

- **UI/UX Lead:** "Does this DESIGN.md accurately capture your design philosophy?"
- **Product Lead:** "Does this visual language align with the target audience?"
- **Retention Lead:** "Are the engagement-critical elements (CTAs, notifications) visually prominent enough?"

If personas disagree, follow the [Consensus Protocol](../../CONSENSUS_PROTOCOL.md).

## Step 6: Integrate into Development Workflow `[AGENT]`

Add a reference to `DESIGN.md` in the project's `CLAUDE.md`:

```markdown
## Design System
See [DESIGN.md](./DESIGN.md) for the visual design system.
Consult this file before building any UI component.
When in doubt about visual decisions, consult the UI/UX Lead persona.
```

## Updating DESIGN.md

The design system evolves. Update `DESIGN.md` when:

- A persona consultation changes a design direction
- New component patterns are introduced
- User testing reveals visual issues
- The product expands to new platforms

Always re-consult the UI/UX persona before major design system changes.

## Stitch Integration (Optional)

If the team uses Google Stitch for design:

1. Generate screens in Stitch using `DESIGN.md` as the prompt context
2. After generating, use the `design-md` skill pattern to re-extract and verify consistency
3. Export Stitch screens to React/HTML and validate against `DESIGN.md` principles
4. Use the Stitch MCP Server to pipe designs directly into your coding workflow

Install Stitch skills: `npx skills add google-labs-code/stitch-skills --skill design-md --global`

## Best Practices

- **Be descriptive, not technical:** "Ocean-deep Cerulean (#0077B6)" not just "#0077B6"
- **Explain the why:** Every choice should trace back to a persona principle or user need
- **Be precise:** Include hex codes, pixel values, and font weights in parentheses
- **Stay consistent:** Use the same terminology throughout — if you call it "Surface" don't also call it "Card Background"
- **Keep it scannable:** Agents read this file programmatically — tables and clear headers help

## Common Pitfalls

- Using technical CSS jargon without semantic translation
- Omitting hex codes (agents need exact values)
- Forgetting to explain functional roles ("why this color here?")
- Making the atmosphere description too vague ("modern and clean" says nothing)
- Not connecting design choices back to persona principles
- Treating DESIGN.md as static — it should evolve with the product
