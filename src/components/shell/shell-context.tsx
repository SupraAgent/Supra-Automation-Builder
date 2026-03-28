"use client";

import * as React from "react";

type ShellContextValue = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
};

const ShellContext = React.createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const value = React.useMemo(
    () => ({ mobileNavOpen, setMobileNavOpen }),
    [mobileNavOpen]
  );
  return (
    <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = React.useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
}
