"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";
import { ShellProvider } from "./shell-context";
import { isStandaloneRoute } from "@/lib/standalone-routes";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isStandaloneRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <ShellProvider>
      <div className="flex h-[100dvh]">
        <Suspense><Sidebar /></Suspense>
        <div className="flex-1 flex flex-col ml-0 md:ml-60 min-w-0">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ShellProvider>
  );
}
