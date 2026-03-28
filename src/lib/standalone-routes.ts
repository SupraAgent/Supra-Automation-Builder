/**
 * Routes that render as standalone apps — bypassing the main AppShell
 * (sidebar, navigation, etc). Add route prefixes here instead of
 * hardcoding pathname checks in app-shell.tsx.
 */
export const STANDALONE_ROUTE_PREFIXES = [
  "/login",
  "/auth",
  "/builder",
] as const;

/** Check if a pathname should bypass the AppShell */
export function isStandaloneRoute(pathname: string): boolean {
  return STANDALONE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}
