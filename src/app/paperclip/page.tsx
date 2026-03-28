"use client";

import * as React from "react";
import { PaperclipDashboard } from "@/components/paperclip/paperclip-dashboard";

export default function PaperclipPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Paperclip Bridge
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your personas to Paperclip&apos;s agent orchestration platform
          for autonomous execution, budgets, and scheduling.
        </p>
      </div>
      <PaperclipDashboard />
    </div>
  );
}
