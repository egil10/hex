"use client";

import { useEffect, useState } from "react";
import { GameEngine } from "./game-engine";
import { loadSelection, saveSelection } from "@/lib/use-game";
import { MODE_IDS, type ModeId } from "@/lib/modes";

/**
 * Owns the enabled-mode selection and persists it. `initial` (a deep-link to a
 * specific mode) takes precedence; otherwise we restore the saved selection.
 * The game itself is client-only (it generates random colours), so we gate it
 * behind a mounted flag to avoid hydration mismatches.
 */
export function PlayClient({ initial }: { initial?: ModeId[] }) {
  const [selection, setSelection] = useState<ModeId[]>(initial ?? MODE_IDS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!initial) setSelection(loadSelection());
    setMounted(true);
  }, [initial]);

  function change(next: ModeId[]) {
    setSelection(next);
    if (!initial) saveSelection(next);
  }

  if (!mounted) return <Skeleton />;

  return (
    <GameEngine
      key={selection.join("|")}
      selection={selection}
      onChangeSelection={change}
    />
  );
}

function Skeleton() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 pb-24 pt-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-36 rounded-full border border-border bg-surface" />
        <div className="h-8 w-[6.5rem] rounded-full border border-border bg-surface" />
      </div>
      <div className="mt-6 h-7 w-24 rounded bg-border/50" />
      <div className="mt-3 h-1 w-full rounded-full bg-border/50" />
      <div className="mt-6 h-44 w-full animate-pulse rounded-xl border border-border bg-surface" />
      <div className="mt-3 h-12 w-full animate-pulse rounded-full border border-border bg-surface" />
    </main>
  );
}
