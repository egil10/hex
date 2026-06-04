"use client";

import { Volume2, VolumeX } from "lucide-react";

export function SoundToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={on ? "sound on" : "sound off"}
      title={on ? "sound on — click to mute" : "sound off — click to enable"}
      className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-fg"
    >
      {on ? <Volume2 className="h-3.5 w-3.5 text-accent" /> : <VolumeX className="h-3.5 w-3.5" />}
    </button>
  );
}
