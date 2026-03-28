# Creating Personas

> Detailed guide on building expert personas for your project team.

## Option A: Pull from SupraVibe Templates (Optional)

If you use [SupraVibe](https://supravibe.xyz), you can pull pre-built persona templates from your dashboard:

1. Navigate to your persona templates
2. Select personas relevant to your project
3. Export or reference them in `docs/personas/`
4. Adapt to the specific project context

This is optional — you can create all personas from scratch using Option B below.

## Option B: Create from Scratch

### Step 1: Identify Required Expertise

Based on project type, list the roles needed. See [Phase 1 Reference](../../skills/phase-1-personas/REFERENCE.md) for suggestions by project type.

### Step 2: Find the Right Real-World Model

For each role, identify a specific person at a specific company:

1. Look at comparable products from your project brief
2. Ask: "Who at [Company X] is responsible for the thing they do best?"
3. Research their background, talks, and methodology

**Example for a Learning App:**

| Role | Company | Why |
|------|---------|-----|
| Retention Lead | Duolingo | Best retention in consumer education |
| UI/UX Lead | Headspace | Clean, calm, accessible design |
| Product Lead | Khan Academy | Mastery-based progression at scale |
| Growth Lead | Calm | Premium positioning, content-led growth |
| Tech Architect | Anki | Spaced repetition, offline-first |

### Step 3: Build the Profile

Use `templates/persona_template.md`. For detailed instructions on writing quality personas, see [skills/write-a-persona/SKILL.md](../../skills/write-a-persona/SKILL.md).

### Step 4: Save and Organize

Save each persona as `docs/personas/[role]-[company].md`. Create a `team.md` manifest in the project root.

## Option C: Mix Templates and New Personas

If you have access to existing templates (from SupraVibe or elsewhere):

1. Review existing templates for relevant personas
2. Identify gaps not covered by existing templates
3. Build new personas for the gaps
4. Document the full team in `team.md`
