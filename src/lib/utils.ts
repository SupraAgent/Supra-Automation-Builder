import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Shared helpers ──────────────────────────────────────────────

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
}

export function inferRoleIcon(role: string): string {
  const r = role.toLowerCase();
  if (/product/.test(r)) return "\uD83D\uDCCB";
  if (/design|ux|ui/.test(r)) return "\uD83C\uDFA8";
  if (/architect|tech|engineer/.test(r)) return "\uD83D\uDD27";
  if (/growth/.test(r)) return "\uD83D\uDE80";
  if (/revenue|sales/.test(r)) return "\uD83D\uDCC8";
  if (/qa|quality|test/.test(r)) return "\uD83E\uDDEA";
  if (/content/.test(r)) return "\uD83D\uDD8A\uFE0F";
  if (/community/.test(r)) return "\uD83D\uDC65";
  if (/retention/.test(r)) return "\uD83D\uDD04";
  if (/trust|safety|security/.test(r)) return "\uD83D\uDD12";
  if (/devrel/.test(r)) return "\uD83D\uDCE3";
  if (/customer|success/.test(r)) return "\uD83E\uDD1D";
  if (/conversion/.test(r)) return "\uD83C\uDFAF";
  return "\uD83E\uDD16";
}

/** Browser file download helper */
export function downloadFile(content: string, filename: string, type = "text/markdown") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Generate a unique ID with an optional prefix */
export function uid(prefix = ""): string {
  const base = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return prefix ? `${prefix}-${base}` : base;
}

/** Deep clone that handles nested arrays/objects in node data */
export function deepCloneNodeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}
