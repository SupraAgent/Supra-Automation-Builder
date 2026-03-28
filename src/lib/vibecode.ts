/** VibeCode — types, constants, and generators for project scaffold + CLAUDE.md */

/* --------------- Types --------------- */

export type Framework =
  | "nextjs"
  | "react_vite"
  | "expo"
  | "python_fastapi"
  | "sveltekit"
  | "remix";

export type CodingVibe =
  | "move_fast"
  | "production_grade"
  | "creative_prototype"
  | "minimal";

export type VibeCodeDraft = {
  projectName: string;
  description: string;
  framework: Framework | null;
  codingVibe: CodingVibe | null;
  features: string[];
  extraInstructions: string;
  style: string;
  usePersonaTeam: boolean;
  personaTeamMd: string;
  claudeMd: string;
  scaffoldSpec: string;
};

export const EMPTY_VIBECODE_DRAFT: VibeCodeDraft = {
  projectName: "",
  description: "",
  framework: null,
  codingVibe: null,
  features: [],
  extraInstructions: "",
  style: "",
  usePersonaTeam: false,
  personaTeamMd: "",
  claudeMd: "",
  scaffoldSpec: "",
};

/* --------------- Constants --------------- */

export const FRAMEWORKS: { id: Framework; label: string; description: string }[] = [
  { id: "nextjs", label: "Next.js", description: "React framework with App Router" },
  { id: "react_vite", label: "React + Vite", description: "Fast SPA with HMR" },
  { id: "expo", label: "Expo", description: "Cross-platform mobile & web" },
  { id: "python_fastapi", label: "Python FastAPI", description: "High-performance API server" },
  { id: "sveltekit", label: "SvelteKit", description: "Full-stack Svelte framework" },
  { id: "remix", label: "Remix", description: "Full-stack React framework" },
];

export const CODING_VIBES: {
  id: CodingVibe;
  label: string;
  description: string;
}[] = [
  {
    id: "move_fast",
    label: "Move Fast",
    description: "Ship quickly, iterate later. Favor speed over perfection.",
  },
  {
    id: "production_grade",
    label: "Production Grade",
    description: "Enterprise-ready: tests, types, docs, CI/CD.",
  },
  {
    id: "creative_prototype",
    label: "Creative Prototype",
    description: "Visual-first exploration. Experiment freely.",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Lean and clean. Fewer dependencies, smaller bundles.",
  },
];

/* --------------- Generators --------------- */

const FRAMEWORK_RULES: Record<Framework, string> = {
  nextjs: `## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State:** React Server Components where possible; client components only when needed

## Conventions
- Use the \`app/\` directory with file-based routing
- Prefer Server Components by default; add "use client" only for interactive components
- Use \`loading.tsx\` and \`error.tsx\` for route-level loading/error states
- Colocate components with their routes when they're route-specific
- Use \`@/\` path alias for imports from \`src/\`
- API routes go in \`app/api/\` using Route Handlers`,

  react_vite: `## Tech Stack
- **Framework:** React + Vite
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS or CSS Modules
- **Routing:** React Router v6+

## Conventions
- Use functional components with hooks exclusively
- Organize by feature: \`src/features/{name}/\` with components, hooks, and utils colocated
- Lazy-load routes with \`React.lazy()\` and \`Suspense\`
- Keep bundle size small — tree-shake aggressively`,

  expo: `## Tech Stack
- **Framework:** Expo (managed workflow)
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based)
- **Styling:** StyleSheet.create + NativeWind (Tailwind for RN)

## Conventions
- Use Expo SDK APIs over bare React Native when available
- Test on both iOS and Android for every feature
- Use \`expo-constants\` and \`expo-device\` for platform detection
- Keep heavy processing off the JS thread — use \`requestAnimationFrame\` or native modules
- Use \`app/\` directory with file-based routing via Expo Router`,

  python_fastapi: `## Tech Stack
- **Framework:** FastAPI
- **Language:** Python 3.11+
- **Database:** SQLAlchemy + Alembic for migrations
- **Validation:** Pydantic v2

## Conventions
- Use async endpoints by default
- Organize by domain: \`app/domains/{name}/\` with router, models, schemas, service
- Use dependency injection for database sessions, auth, etc.
- Type all function signatures — FastAPI relies on types for validation
- Write OpenAPI descriptions for every endpoint`,

  sveltekit: `## Tech Stack
- **Framework:** SvelteKit
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## Conventions
- Use file-based routing in \`src/routes/\`
- Prefer \`+page.server.ts\` for data loading; use \`+page.ts\` for universal load functions
- Use Svelte stores for shared client state
- Keep components small and composable in \`src/lib/components/\`
- Use form actions for mutations`,

  remix: `## Tech Stack
- **Framework:** Remix
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## Conventions
- Use file-based routing in \`app/routes/\`
- Prefer \`loader\` for data fetching and \`action\` for mutations — embrace the Request/Response model
- Use nested routes and \`<Outlet />\` for layout composition
- Minimize client-side state — let the server be the source of truth
- Use \`useFetcher\` for non-navigation data mutations`,
};

const VIBE_RULES: Record<CodingVibe, string> = {
  move_fast: `## Development Philosophy: Move Fast
- Favor working software over perfect architecture
- Skip abstractions until you need them 3+ times
- Use TODO comments for known shortcuts — revisit after launch
- Prototype in a single file, extract later
- Don't write tests for throwaway code; write tests for code that works
- Ship daily. If you can't ship daily, your scope is too big`,

  production_grade: `## Development Philosophy: Production Grade
- Every module has tests. No exceptions.
- Use strict TypeScript — no \`any\`, no \`@ts-ignore\`
- Document public APIs with JSDoc or docstrings
- Set up CI/CD from Day 1: lint, type-check, test, build
- Use conventional commits for clear changelog generation
- Error handling is required, not optional — every external call has a failure path
- Performance budgets: measure and enforce load times, bundle sizes`,

  creative_prototype: `## Development Philosophy: Creative Prototype
- Visual output matters most — if it looks right, iterate on the code later
- Experiment with animations, interactions, and unconventional layouts
- Use hot reload aggressively — the feedback loop should be under 1 second
- Don't optimize prematurely — get the experience right first
- Copy-paste is fine for prototypes. Refactor when the concept is proven
- Use placeholder data that tells a story — Lorem Ipsum is lazy`,

  minimal: `## Development Philosophy: Minimal
- Every dependency must justify its existence. Fewer deps = fewer problems
- Prefer platform APIs over libraries (fetch over axios, URLSearchParams over qs)
- Keep the dependency tree shallow — audit transitive deps
- Bundle size is a feature. Set a budget and enforce it
- One way to do things. Don't add multiple state management solutions
- If the standard library can do it, use the standard library`,
};

export function generateClaudeMd(draft: VibeCodeDraft): string {
  const lines: string[] = [];

  lines.push(`# ${draft.projectName}`);
  lines.push("");
  if (draft.description) {
    lines.push(draft.description);
    lines.push("");
  }

  if (draft.framework) {
    lines.push(FRAMEWORK_RULES[draft.framework]);
    lines.push("");
  }

  if (draft.codingVibe) {
    lines.push(VIBE_RULES[draft.codingVibe]);
    lines.push("");
  }

  if (draft.features.length > 0) {
    lines.push("## Key Features");
    draft.features.forEach((f) => lines.push(`- ${f}`));
    lines.push("");
  }

  lines.push("## Code Style");
  lines.push("- Keep functions small and focused — under 30 lines when possible");
  lines.push("- Name variables and functions descriptively — the code should read like prose");
  lines.push("- Avoid deeply nested code — extract early returns and helper functions");
  lines.push("- Colocate related code. If two things change together, keep them together");

  return lines.join("\n");
}

const SCAFFOLD_STRUCTURES: Record<Framework, string> = {
  nextjs: `src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles + Tailwind
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Reusable UI primitives
│   └── [feature]/          # Feature-specific components
├── lib/                    # Utilities, types, constants
└── public/                 # Static assets

Key files:
- next.config.ts
- tailwind.config.ts
- tsconfig.json
- package.json`,

  react_vite: `src/
├── main.tsx                # App entry point
├── App.tsx                 # Root component + router
├── index.css               # Global styles + Tailwind
├── features/
│   └── [feature]/          # Feature modules
│       ├── components/
│       ├── hooks/
│       └── utils/
├── components/
│   └── ui/                 # Shared UI primitives
├── lib/                    # Utilities, types
└── public/                 # Static assets

Key files:
- vite.config.ts
- tailwind.config.ts
- tsconfig.json
- package.json`,

  expo: `app/
├── _layout.tsx             # Root layout (Expo Router)
├── index.tsx               # Home screen
├── (tabs)/                 # Tab navigation group
│   ├── _layout.tsx
│   └── [tab].tsx
src/
├── components/
│   ├── ui/                 # Reusable primitives
│   └── [feature]/          # Feature components
├── lib/                    # Utilities, types
├── hooks/                  # Shared hooks
└── constants/              # Theme, config

Key files:
- app.json
- tsconfig.json
- package.json`,

  python_fastapi: `app/
├── main.py                 # FastAPI app + CORS + startup
├── config.py               # Settings via pydantic-settings
├── database.py             # SQLAlchemy engine + session
├── domains/
│   └── [domain]/
│       ├── router.py       # API endpoints
│       ├── models.py       # SQLAlchemy models
│       ├── schemas.py      # Pydantic schemas
│       └── service.py      # Business logic
├── middleware/              # Auth, logging, etc.
└── migrations/             # Alembic migrations

Key files:
- requirements.txt
- alembic.ini
- pyproject.toml
- Dockerfile`,

  sveltekit: `src/
├── routes/
│   ├── +layout.svelte      # Root layout
│   ├── +page.svelte        # Home page
│   └── [route]/
│       ├── +page.svelte
│       └── +page.server.ts
├── lib/
│   ├── components/          # Reusable components
│   ├── stores/              # Svelte stores
│   └── utils/               # Utilities
└── app.css                  # Global styles + Tailwind

Key files:
- svelte.config.js
- tailwind.config.ts
- vite.config.ts
- package.json`,

  remix: `app/
├── root.tsx                # Root layout + links/meta
├── routes/
│   ├── _index.tsx          # Home page
│   └── [route].tsx         # Route modules (loader + action + component)
├── components/
│   ├── ui/                 # Reusable primitives
│   └── [feature]/          # Feature components
├── lib/                    # Utilities, types
└── styles/
    └── tailwind.css        # Tailwind entry

Key files:
- remix.config.js
- tailwind.config.ts
- tsconfig.json
- package.json`,
};

export function generateScaffoldSpec(draft: VibeCodeDraft): string {
  const lines: string[] = [];

  lines.push(`# ${draft.projectName} — Scaffold Spec`);
  lines.push("");
  if (draft.description) {
    lines.push(`> ${draft.description}`);
    lines.push("");
  }

  const fw = FRAMEWORKS.find((f) => f.id === draft.framework);
  const vibe = CODING_VIBES.find((v) => v.id === draft.codingVibe);

  lines.push("## Configuration");
  lines.push("");
  if (fw) lines.push(`- **Framework:** ${fw.label} — ${fw.description}`);
  if (vibe) lines.push(`- **Coding Vibe:** ${vibe.label} — ${vibe.description}`);
  lines.push("");

  if (draft.framework) {
    lines.push("## Directory Structure");
    lines.push("");
    lines.push("```");
    lines.push(SCAFFOLD_STRUCTURES[draft.framework]);
    lines.push("```");
    lines.push("");
  }

  if (draft.features.length > 0) {
    lines.push("## Features to Implement");
    lines.push("");
    draft.features.forEach((f, i) => lines.push(`${i + 1}. ${f}`));
    lines.push("");
  }

  lines.push("## Getting Started");
  lines.push("");

  if (draft.framework === "nextjs") {
    lines.push("```bash");
    lines.push(`npx create-next-app@latest ${draft.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-app"} --typescript --tailwind --app --src-dir`);
    lines.push("```");
  } else if (draft.framework === "react_vite") {
    lines.push("```bash");
    lines.push(`npm create vite@latest ${draft.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-app"} -- --template react-ts`);
    lines.push("```");
  } else if (draft.framework === "expo") {
    lines.push("```bash");
    lines.push(`npx create-expo-app@latest ${draft.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-app"} --template tabs`);
    lines.push("```");
  } else if (draft.framework === "python_fastapi") {
    lines.push("```bash");
    lines.push(`mkdir ${draft.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-app"} && cd $_`);
    lines.push("python -m venv .venv && source .venv/bin/activate");
    lines.push("pip install fastapi uvicorn sqlalchemy alembic pydantic-settings");
    lines.push("```");
  } else if (draft.framework === "sveltekit") {
    lines.push("```bash");
    lines.push(`npx sv create ${draft.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-app"}`);
    lines.push("```");
  } else if (draft.framework === "remix") {
    lines.push("```bash");
    lines.push(`npx create-remix@latest ${draft.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "my-app"}`);
    lines.push("```");
  }

  return lines.join("\n");
}
