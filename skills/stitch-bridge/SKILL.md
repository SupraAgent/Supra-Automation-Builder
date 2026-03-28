---
name: "Stitch Bridge"
description: "Connect persona-driven development to Google Stitch for AI-powered UI design. Generate screens from persona guidance, export to code, and maintain design consistency."
dependencies: ["phase-1-personas", "design-system"]
outputs: ["Stitch screens", "exported React/HTML components", "updated DESIGN.md"]
allowed-tools:
  - "stitch*:*"
  - "Read"
  - "Write"
  - "web_fetch"
  - "Bash"
---

# Stitch Bridge

Connect the Persona Builder workflow to [Google Stitch](https://stitch.withgoogle.com/) for AI-powered UI design and code generation.

## Overview

This skill bridges two systems:
- **Persona Builder** — expert personas that guide design decisions
- **Google Stitch** — AI tool that generates UI screens from prompts

The bridge ensures that screens generated in Stitch reflect persona guidance, and that exported code stays consistent with the project's `DESIGN.md`.

## Prerequisites

- Assembled persona team with a UI/UX Lead persona
- A `DESIGN.md` file (generate one using `skills/design-system/SKILL.md`)
- Access to the [Stitch MCP Server](https://github.com/google-labs-code/stitch-skills)
- A Google account for [stitch.withgoogle.com](https://stitch.withgoogle.com/)

## When to Use This Skill

- **Phase 2:** Generate initial screen designs for the project skeleton
- **Phase 3:** Create screens for each feature before coding them
- **Any design review:** Re-extract design tokens from Stitch screens to verify consistency

## How It Works

```
Persona Guidance → Enhanced Prompt → Stitch Screen → Code Export → Validation
       ↑                                                              |
       └──────────── DESIGN.md (feedback loop) ──────────────────────┘
```

---

## Step 1: Prepare the Prompt from Persona Guidance `[AGENT]`

Before sending anything to Stitch, build a prompt grounded in persona expertise.

### 1a. Consult the UI/UX Persona

```
CONTEXT: We need to design the [Screen Name] screen for [Project Name].
DECISION: What should this screen look like and how should it behave?
CONSTRAINTS: [Platform, tech stack, target users]

Describe:
1. The primary purpose of this screen
2. Key elements that must be present
3. The emotional tone it should convey
4. What you'd push back on if you saw a draft
```

### 1b. Consult Domain Personas (if relevant)

- **Retention Lead:** For onboarding, engagement, or notification screens
- **Growth Lead:** For landing pages, signup flows, or conversion screens
- **Product Lead:** For feature scope and priority of elements

### 1c. Enhance the Prompt

Transform persona guidance into a Stitch-optimized prompt using these techniques (adapted from Stitch's [enhance-prompt](https://github.com/google-labs-code/stitch-skills/tree/main/skills/enhance-prompt) skill):

| Vague Input | Enhanced Prompt |
|------------|-----------------|
| "A login page" | "A warm, minimal login screen with email and password fields, a pill-shaped primary CTA in Deep Cerulean (#0077B6), subtle card elevation, and a secondary 'Forgot password?' link below" |
| "Dashboard" | "An airy analytics dashboard with a left sidebar navigation, key metrics in elevated cards with whisper-soft shadows, a line chart as the hero element, and generous white space between sections" |
| "Settings page" | "A clean, organized settings page with grouped sections using subtle dividers, toggle switches for boolean options, and a sticky save bar at the bottom" |

**Enhancement rules:**
1. Include atmosphere keywords from `DESIGN.md` Section 1
2. Reference specific colors from `DESIGN.md` Section 2 (with hex codes)
3. Describe component shapes from `DESIGN.md` Section 4
4. Mention spacing/layout principles from `DESIGN.md` Section 5
5. Add persona-specific constraints (e.g., "accessibility-first focus states" if the UX persona requires it)

### 1d. Prepend DESIGN.md Context

When prompting Stitch, prepend the relevant sections of `DESIGN.md`:

```
Use the following design system:
[Paste DESIGN.md Sections 1-5]

Now generate: [Enhanced prompt from 1c]
```

---

## Step 2: Generate Screens in Stitch `[AGENT]`

### Via Stitch MCP Server (Recommended)

1. **Discover namespace:** Run `list_tools` → find prefix (e.g., `mcp_stitch:`)
2. **Create or select project:**
   - New project: `[prefix]:create_project` with title and description
   - Existing: `[prefix]:list_projects` → find by title → extract Project ID
3. **Generate screen:**
   - Call `[prefix]:generate_screen` with:
     - `projectId`: numeric project ID
     - `prompt`: the enhanced prompt from Step 1
     - `mode`: `"standard"` (Gemini Flash, fast) or `"pro"` (Gemini Pro, high-fidelity)
     - `designSystemContext`: paste DESIGN.md content
4. **Review output:**
   - Call `[prefix]:get_screen` to retrieve the generated screen
   - Download screenshot from `screenshot.downloadUrl`
   - Download HTML from `htmlCode.downloadUrl`

### Via Stitch Web UI (Manual)

1. Open [stitch.withgoogle.com](https://stitch.withgoogle.com/)
2. Create a new project or open an existing one
3. Paste the DESIGN.md context + enhanced prompt
4. Generate in Standard or Pro mode
5. Iterate using Stitch's branching feature

---

## Step 3: Validate Against Persona Principles `[AGENT]`

After generating a screen, validate it against persona guidance:

### 3a. Extract Design Tokens from Generated Screen

Parse the downloaded HTML to extract:
- Colors used (compare against DESIGN.md palette)
- Typography (fonts, weights, sizes)
- Spacing (padding, margins, gaps)
- Component patterns (button styles, card shapes)

### 3b. Run Persona Validation

Consult the UI/UX persona:

```
CONTEXT: Here is the generated screen for [Screen Name].
[Describe or show the screenshot]
[List extracted design tokens]

DECISION: Does this screen align with your design principles?

Check against:
- DESIGN.md atmosphere: [paste Section 1]
- Your core beliefs: [paste from persona file]
- Your anti-patterns: [paste from persona file]

What would you change?
```

### 3c. Iterate if Needed

If the persona identifies issues:
1. Adjust the prompt based on feedback
2. Regenerate in Stitch
3. Re-validate
4. Repeat until the persona approves

---

## Step 4: Export to Code `[AGENT]`

### Export Options from Stitch

| Format | Use When | Command |
|--------|----------|---------|
| **HTML/CSS** | Quick prototypes, static pages | Direct export from Stitch UI |
| **Tailwind CSS** | Utility-first projects | Export with Tailwind option |
| **React/JSX** | React-based applications | `[prefix]:export_react` or manual export |
| **Figma** | Need design handoff | Export to Figma from Stitch UI |

### React Export Workflow (Recommended)

If using the [react-components](https://github.com/google-labs-code/stitch-skills/tree/main/skills/react-components) Stitch skill:

```bash
npx skills add google-labs-code/stitch-skills --skill react:components --global
```

This generates:
- Modular React components with TypeScript interfaces
- Design tokens extracted into a constants file
- Mock data separated from presentation logic
- Tailwind classes mapped from the Stitch output

### Integrate Exported Code

1. Place components in the project's component directory
2. Replace mock data with real data sources
3. Ensure components reference `DESIGN.md` tokens (not hardcoded values)
4. Run the Tech Architect persona's review on the generated code

---

## Step 5: Update DESIGN.md (Feedback Loop) `[AGENT]`

After generating and approving screens, update `DESIGN.md` if new patterns emerged:

- New colors introduced? Add them to the palette
- New component patterns? Document in Section 4
- Design direction shifted? Update the atmosphere description
- Always re-consult the UI/UX persona when updating

This creates a virtuous cycle:
```
DESIGN.md → Stitch Prompt → Generated Screen → Code Export → New Patterns → Updated DESIGN.md
```

---

## Stitch Loop Integration (Optional)

For multi-page projects, use the **baton system** adapted from Stitch's [stitch-loop](https://github.com/google-labs-code/stitch-skills/tree/main/skills/stitch-loop) skill:

### The Baton System

Create `.stitch/next-prompt.md` as a "baton" — a file that tells the agent what screen to generate next:

```markdown
# Next Screen: [Screen Name]

## Context
[What screens have been generated so far]

## This Screen
[Description of what needs to be built]

## Persona Guidance
[Key points from relevant persona consultations]

## Design System Reference
See DESIGN.md sections: [1, 2, 4] (most relevant sections)
```

### Loop Execution

1. **Read baton** → `.stitch/next-prompt.md`
2. **Consult persona** → Get guidance for this specific screen
3. **Generate** → Send enhanced prompt to Stitch
4. **Validate** → Check against persona principles
5. **Export** → Get code and integrate into project
6. **Write next baton** → Describe the next screen to generate
7. **Repeat** until all screens are done

### Tracking Progress

Maintain `.stitch/metadata.json`:

```json
{
  "project": "[Project Name]",
  "stitchProjectId": "[Stitch Project ID]",
  "screens": [
    {
      "name": "Home",
      "screenId": "[ID]",
      "status": "exported",
      "personaApproved": true,
      "exportedTo": "src/components/Home/"
    }
  ],
  "designMdVersion": "2025-01-15",
  "lastUpdated": "[ISO date]"
}
```

---

## Installing Stitch Skills

To add the official Stitch skills to your agent:

```bash
# Core design-to-code pipeline
npx skills add google-labs-code/stitch-skills --skill design-md --global
npx skills add google-labs-code/stitch-skills --skill enhance-prompt --global
npx skills add google-labs-code/stitch-skills --skill react:components --global

# Optional: autonomous multi-page generation
npx skills add google-labs-code/stitch-skills --skill stitch-loop --global

# Optional: shadcn/ui component guidance
npx skills add google-labs-code/stitch-skills --skill shadcn-ui --global
```

---

## Best Practices

- **Always prompt with DESIGN.md context** — Never send a bare prompt to Stitch. Include design system context for consistency.
- **Persona approval before export** — Don't export code from a screen the UI/UX persona hasn't reviewed.
- **One screen at a time** — Generate, validate, export, then move to the next. Don't batch generate without validation.
- **Use Pro mode for hero screens** — Landing pages, onboarding, and key conversion screens deserve Pro (Gemini 2.5 Pro). Use Standard for secondary pages.
- **Keep the feedback loop tight** — Update DESIGN.md immediately when new patterns emerge, before generating the next screen.

## Common Pitfalls

- Generating screens without persona consultation (produces generic UI)
- Using Stitch prompts without DESIGN.md context (inconsistent design language)
- Exporting code without validation (design drift from persona principles)
- Treating Stitch output as final (always iterate based on persona feedback)
- Forgetting to update DESIGN.md after introducing new patterns (future screens diverge)
