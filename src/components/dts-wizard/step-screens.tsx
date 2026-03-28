"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DynamicList } from "@/components/ui/dynamic-list";
import type { DesignToShipDraft, ScreenSpec } from "@/lib/design-to-ship";

type Props = {
  draft: DesignToShipDraft;
  onChange: (patch: Partial<DesignToShipDraft>) => void;
};

const EMPTY_SCREEN: ScreenSpec = { name: "", description: "", keyElements: [] };

export function StepScreens({ draft, onChange }: Props) {
  function updateScreen(index: number, patch: Partial<ScreenSpec>) {
    const next = [...draft.screens];
    next[index] = { ...next[index], ...patch };
    onChange({ screens: next });
  }

  function addScreen() {
    onChange({ screens: [...draft.screens, { ...EMPTY_SCREEN }] });
  }

  function removeScreen(index: number) {
    onChange({ screens: draft.screens.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Screen Definitions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define the key screens for your app. Each screen has a name, description, and list of
          key UI elements.
        </p>
      </div>

      {/* Screen List */}
      <div className="space-y-4">
        {draft.screens.map((screen, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Screen {i + 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeScreen(i)}
                className="text-red-400 hover:text-red-300 h-6 px-2 text-xs"
              >
                Remove
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Screen Name</label>
              <Input
                value={screen.name}
                onChange={(e) => updateScreen(i, { name: e.target.value })}
                placeholder="e.g. Home, Dashboard, Profile..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Description</label>
              <Textarea
                value={screen.description}
                onChange={(e) => updateScreen(i, { description: e.target.value })}
                placeholder="What does this screen do?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Key Elements</label>
              <DynamicList
                value={screen.keyElements}
                onChange={(keyElements) => updateScreen(i, { keyElements })}
                placeholder="e.g. Navigation bar, Hero section, CTA button..."
                addLabel="+ Add element"
              />
            </div>
          </div>
        ))}
      </div>

      {draft.screens.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-muted-foreground">No screens defined yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">Add your first screen to get started.</p>
        </div>
      )}

      <Button variant="ghost" onClick={addScreen}>
        + Add screen
      </Button>

      <p className="text-xs text-muted-foreground">
        {draft.screens.length} screen{draft.screens.length !== 1 ? "s" : ""} defined
      </p>
    </div>
  );
}
