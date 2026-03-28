/** Design-to-Ship — types, atmosphere palettes, and generators */

/* --------------- Types --------------- */

export type DesignAtmosphere =
  | "minimal_airy"
  | "bold_vibrant"
  | "warm_organic"
  | "dark_sleek"
  | "editorial_refined"
  | "playful_colorful";

export type DesignProjectType =
  | "consumer_app"
  | "saas"
  | "marketplace"
  | "content_platform"
  | "ecommerce"
  | "developer_tool";

export type ScreenSpec = {
  name: string;
  description: string;
  keyElements: string[];
};

export type DesignPersona = {
  role: string;
  company: string;
  focus: string;
};

export type DesignToShipDraft = {
  projectName: string;
  projectType: DesignProjectType | null;
  description: string;
  targetUser: string;
  atmosphere: DesignAtmosphere | null;
  referenceUrl: string;
  personas: DesignPersona[];
  designSystem: string;
  screens: ScreenSpec[];
  implementationDocs: string;
};

export const EMPTY_DESIGN_TO_SHIP: DesignToShipDraft = {
  projectName: "",
  projectType: null,
  description: "",
  targetUser: "",
  atmosphere: null,
  referenceUrl: "",
  personas: [],
  designSystem: "",
  screens: [],
  implementationDocs: "",
};

/* --------------- Constants --------------- */

export const PROJECT_TYPES: { id: DesignProjectType; label: string; description: string }[] = [
  { id: "consumer_app", label: "Consumer App", description: "Mobile/web app for end users" },
  { id: "saas", label: "SaaS", description: "Business software platform" },
  { id: "marketplace", label: "Marketplace", description: "Two-sided platform" },
  { id: "content_platform", label: "Content Platform", description: "Content creation & distribution" },
  { id: "ecommerce", label: "E-commerce", description: "Online shopping experience" },
  { id: "developer_tool", label: "Developer Tool", description: "APIs, CLIs, and dev tools" },
];

export type AtmosphereSpec = {
  id: DesignAtmosphere;
  label: string;
  description: string;
  preview: string;
  colors: { name: string; hex: string }[];
  fonts: { heading: string; body: string };
  borderRadius: string;
  spacing: string;
};

export const ATMOSPHERES: AtmosphereSpec[] = [
  {
    id: "minimal_airy",
    label: "Minimal & Airy",
    description: "Clean lines, lots of white space, understated elegance",
    preview: "bg-gradient-to-br from-gray-50 to-white",
    colors: [
      { name: "Background", hex: "#FAFAFA" },
      { name: "Surface", hex: "#FFFFFF" },
      { name: "Primary", hex: "#111111" },
      { name: "Accent", hex: "#6366F1" },
      { name: "Muted", hex: "#A1A1AA" },
      { name: "Border", hex: "#E4E4E7" },
    ],
    fonts: { heading: "Inter", body: "Inter" },
    borderRadius: "8px",
    spacing: "Generous — 24px/32px between sections",
  },
  {
    id: "bold_vibrant",
    label: "Bold & Vibrant",
    description: "Saturated colors, large type, energetic feel",
    preview: "bg-gradient-to-br from-violet-600 to-fuchsia-500",
    colors: [
      { name: "Background", hex: "#0F0F23" },
      { name: "Surface", hex: "#1A1A3E" },
      { name: "Primary", hex: "#A855F7" },
      { name: "Accent", hex: "#F43F5E" },
      { name: "Text", hex: "#FAFAFA" },
      { name: "Border", hex: "#374151" },
    ],
    fonts: { heading: "Outfit", body: "DM Sans" },
    borderRadius: "16px",
    spacing: "Tight — 16px/24px for energy and density",
  },
  {
    id: "warm_organic",
    label: "Warm & Organic",
    description: "Earthy tones, rounded shapes, natural feel",
    preview: "bg-gradient-to-br from-amber-100 to-orange-50",
    colors: [
      { name: "Background", hex: "#FFFBF5" },
      { name: "Surface", hex: "#FFF7ED" },
      { name: "Primary", hex: "#C2410C" },
      { name: "Accent", hex: "#059669" },
      { name: "Text", hex: "#451A03" },
      { name: "Border", hex: "#FED7AA" },
    ],
    fonts: { heading: "Fraunces", body: "Source Serif 4" },
    borderRadius: "24px",
    spacing: "Relaxed — 20px/28px for comfort",
  },
  {
    id: "dark_sleek",
    label: "Dark & Sleek",
    description: "Dark backgrounds, neon accents, modern edge",
    preview: "bg-gradient-to-br from-gray-900 to-black",
    colors: [
      { name: "Background", hex: "#09090B" },
      { name: "Surface", hex: "#18181B" },
      { name: "Primary", hex: "#0CCE6B" },
      { name: "Accent", hex: "#38BDF8" },
      { name: "Text", hex: "#FAFAFA" },
      { name: "Border", hex: "#27272A" },
    ],
    fonts: { heading: "Geist", body: "Geist Mono" },
    borderRadius: "12px",
    spacing: "Standard — 16px/24px, compact and precise",
  },
  {
    id: "editorial_refined",
    label: "Editorial & Refined",
    description: "Serif fonts, editorial layout, premium feel",
    preview: "bg-gradient-to-br from-stone-100 to-stone-50",
    colors: [
      { name: "Background", hex: "#FAF9F6" },
      { name: "Surface", hex: "#FFFFFF" },
      { name: "Primary", hex: "#1C1917" },
      { name: "Accent", hex: "#B45309" },
      { name: "Text", hex: "#292524" },
      { name: "Border", hex: "#D6D3D1" },
    ],
    fonts: { heading: "Playfair Display", body: "Libre Baskerville" },
    borderRadius: "4px",
    spacing: "Generous — 32px/48px for editorial breathing room",
  },
  {
    id: "playful_colorful",
    label: "Playful & Colorful",
    description: "Fun gradients, rounded UI, youthful energy",
    preview: "bg-gradient-to-br from-pink-400 to-yellow-300",
    colors: [
      { name: "Background", hex: "#FFFDF7" },
      { name: "Surface", hex: "#FFF1F2" },
      { name: "Primary", hex: "#EC4899" },
      { name: "Accent", hex: "#8B5CF6" },
      { name: "Secondary", hex: "#FBBF24" },
      { name: "Border", hex: "#FBCFE8" },
    ],
    fonts: { heading: "Nunito", body: "Nunito Sans" },
    borderRadius: "20px",
    spacing: "Standard — 16px/24px with playful asymmetry",
  },
];

/* --------------- Suggested Design Roles --------------- */

export const SUGGESTED_DESIGN_ROLES = [
  { role: "Design Lead", company: "Apple", focus: "Visual direction and brand consistency" },
  { role: "UX Designer", company: "Stripe", focus: "User flows and interaction patterns" },
  { role: "Frontend Engineer", company: "Vercel", focus: "Design system implementation" },
  { role: "Brand Designer", company: "Linear", focus: "Typography, color, and visual identity" },
  { role: "Product Designer", company: "Figma", focus: "Component design and prototyping" },
];

/* --------------- Generators --------------- */

export function generateDesignSystem(draft: DesignToShipDraft): string {
  const atm = ATMOSPHERES.find((a) => a.id === draft.atmosphere);
  if (!atm) return "";

  const lines: string[] = [];

  lines.push(`# ${draft.projectName} — Design System`);
  lines.push("");
  if (draft.description) {
    lines.push(`> ${draft.description}`);
    lines.push("");
  }

  lines.push(`## Design Atmosphere: ${atm.label}`);
  lines.push("");
  lines.push(atm.description);
  lines.push("");

  // Colors
  lines.push("## Color Palette");
  lines.push("");
  lines.push("| Token | Hex | Usage |");
  lines.push("|-------|-----|-------|");
  atm.colors.forEach((c) => {
    lines.push(`| ${c.name} | \`${c.hex}\` | ${getColorUsage(c.name)} |`);
  });
  lines.push("");

  // Typography
  lines.push("## Typography");
  lines.push("");
  lines.push(`- **Headings:** ${atm.fonts.heading}`);
  lines.push(`- **Body:** ${atm.fonts.body}`);
  lines.push("");
  lines.push("### Scale");
  lines.push("");
  lines.push("| Level | Size | Weight | Line Height |");
  lines.push("|-------|------|--------|-------------|");
  lines.push("| H1 | 36px / 2.25rem | 700 | 1.2 |");
  lines.push("| H2 | 24px / 1.5rem | 600 | 1.3 |");
  lines.push("| H3 | 20px / 1.25rem | 600 | 1.4 |");
  lines.push("| Body | 16px / 1rem | 400 | 1.6 |");
  lines.push("| Small | 14px / 0.875rem | 400 | 1.5 |");
  lines.push("| Caption | 12px / 0.75rem | 500 | 1.4 |");
  lines.push("");

  // Spacing & Radius
  lines.push("## Spacing & Radius");
  lines.push("");
  lines.push(`- **Border Radius:** ${atm.borderRadius}`);
  lines.push(`- **Spacing System:** ${atm.spacing}`);
  lines.push("- **Base Unit:** 4px");
  lines.push("- **Scale:** 4, 8, 12, 16, 20, 24, 32, 48, 64, 96");
  lines.push("");

  // Components
  lines.push("## Component Guidelines");
  lines.push("");
  lines.push("### Buttons");
  lines.push(`- Primary: Background \`${atm.colors.find((c) => c.name === "Primary")?.hex || "#000"}\`, white text, radius ${atm.borderRadius}`);
  lines.push("- Secondary: Outlined, primary color border");
  lines.push("- Ghost: No border, subtle hover state");
  lines.push("");
  lines.push("### Cards");
  lines.push(`- Background: \`${atm.colors.find((c) => c.name === "Surface")?.hex || "#fff"}\``);
  lines.push(`- Border: 1px solid \`${atm.colors.find((c) => c.name === "Border")?.hex || "#e5e5e5"}\``);
  lines.push(`- Radius: ${atm.borderRadius}`);
  lines.push("- Shadow: 0 1px 3px rgba(0,0,0,0.08)");
  lines.push("");
  lines.push("### Inputs");
  lines.push(`- Height: 40px`);
  lines.push(`- Border: 1px solid \`${atm.colors.find((c) => c.name === "Border")?.hex || "#e5e5e5"}\``);
  lines.push(`- Radius: ${atm.borderRadius}`);
  lines.push("- Focus: 2px ring in primary color at 20% opacity");
  lines.push("");

  // Persona Notes
  if (draft.personas.length > 0) {
    lines.push("## Design Team Notes");
    lines.push("");
    draft.personas.forEach((p) => {
      lines.push(`- **${p.role}${p.company ? ` (${p.company})` : ""}:** ${p.focus || "General design guidance"}`);
    });
    lines.push("");
  }

  lines.push("---");
  lines.push(`*Generated by Design-to-Ship on ${new Date().toISOString().split("T")[0]}*`);

  return lines.join("\n");
}

function getColorUsage(name: string): string {
  const usages: Record<string, string> = {
    Background: "Page background",
    Surface: "Card & component backgrounds",
    Primary: "Buttons, links, key actions",
    Accent: "Highlights, badges, secondary actions",
    Text: "Body text and headings",
    Muted: "Secondary text, placeholders",
    Border: "Dividers, input borders, card outlines",
    Secondary: "Supplementary accent color",
  };
  return usages[name] || "General use";
}

export function generateScreenSpecs(draft: DesignToShipDraft): string {
  const lines: string[] = [];

  lines.push(`# ${draft.projectName} — Screen Specifications`);
  lines.push("");

  if (draft.screens.length === 0) {
    lines.push("No screens defined yet.");
    return lines.join("\n");
  }

  draft.screens.forEach((screen, i) => {
    lines.push(`## ${i + 1}. ${screen.name}`);
    lines.push("");
    if (screen.description) {
      lines.push(screen.description);
      lines.push("");
    }
    if (screen.keyElements.length > 0) {
      lines.push("**Key Elements:**");
      screen.keyElements.forEach((el) => lines.push(`- ${el}`));
      lines.push("");
    }
  });

  lines.push("---");
  lines.push(`*Generated by Design-to-Ship on ${new Date().toISOString().split("T")[0]}*`);

  return lines.join("\n");
}

export function generateImplementationDocs(draft: DesignToShipDraft): string {
  const atm = ATMOSPHERES.find((a) => a.id === draft.atmosphere);
  const lines: string[] = [];

  lines.push(`# ${draft.projectName} — Implementation Guide`);
  lines.push("");

  lines.push("## Overview");
  lines.push("");
  if (draft.description) lines.push(draft.description);
  if (draft.targetUser) lines.push(`**Target User:** ${draft.targetUser}`);
  lines.push("");

  if (atm) {
    lines.push("## Design Tokens (CSS Custom Properties)");
    lines.push("");
    lines.push("```css");
    lines.push(":root {");
    atm.colors.forEach((c) => {
      lines.push(`  --color-${c.name.toLowerCase().replace(/\s+/g, "-")}: ${c.hex};`);
    });
    lines.push(`  --radius: ${atm.borderRadius};`);
    lines.push(`  --font-heading: '${atm.fonts.heading}', sans-serif;`);
    lines.push(`  --font-body: '${atm.fonts.body}', sans-serif;`);
    lines.push("}");
    lines.push("```");
    lines.push("");
  }

  if (draft.screens.length > 0) {
    lines.push("## Screens to Build");
    lines.push("");
    draft.screens.forEach((s, i) => {
      lines.push(`### ${i + 1}. ${s.name}`);
      if (s.description) lines.push(s.description);
      if (s.keyElements.length > 0) {
        lines.push("Components needed:");
        s.keyElements.forEach((el) => lines.push(`- [ ] ${el}`));
      }
      lines.push("");
    });
  }

  if (draft.personas.length > 0) {
    lines.push("## Design Team");
    lines.push("");
    draft.personas.forEach((p) => {
      lines.push(`- **${p.role}${p.company ? ` (${p.company})` : ""}** — ${p.focus}`);
    });
    lines.push("");
  }

  lines.push("---");
  lines.push(`*Generated by Design-to-Ship on ${new Date().toISOString().split("T")[0]}*`);

  return lines.join("\n");
}

/* --------------- Utilities --------------- */

// Re-export shared helper so existing imports from "@/lib/design-to-ship" continue to work
export { slugify } from "./utils";
