"use client";

import { Check, X } from "lucide-react";
import { Swatch } from "@/components/ui/swatch";
import {
  deltaE,
  rgbToHex,
  scoreFromDeltaE,
  tierFromDeltaE,
  type RGB,
} from "@/lib/color";
import { cn } from "@/lib/cn";

export function LabeledSwatch({
  label,
  hex,
  height = "h-24",
}: {
  label: string;
  hex: string;
  height?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <Swatch hex={hex} className={cn("w-full", height)} />
      <div className="mt-1.5 text-center font-mono text-xs tabular-nums text-muted">{hex}</div>
    </div>
  );
}

/**
 * The visual half of ΔE-scored feedback (left pane): your colour beside the
 * actual one, and the ΔE verdict. The coordinate plot lives separately
 * (CoordinateCompare) in the right pane.
 */
export function PrecisionVisual({ target, guess }: { target: RGB; guess: RGB }) {
  const dE = deltaE(target, guess);
  const score = scoreFromDeltaE(dE);
  const tier = tierFromDeltaE(dE);
  return (
    <div className="animate-pop">
      <div className="grid grid-cols-2 gap-3">
        <LabeledSwatch label="your colour" hex={rgbToHex(guess)} height="h-28" />
        <LabeledSwatch label="actual" hex={rgbToHex(target)} height="h-28" />
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted">ΔE distance</div>
          <div className="font-mono text-xl font-semibold tabular-nums">{dE.toFixed(1)}</div>
        </div>
        <div className={cn("text-sm font-medium", tier.tone)}>{tier.label}</div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted">points</div>
          <div className="font-mono text-xl font-semibold tabular-nums text-accent">+{score}</div>
        </div>
      </div>
    </div>
  );
}

/** Shared banner for multiple-choice modes. */
export function ResultBanner({
  correct,
  points,
  children,
}: {
  correct: boolean;
  points?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "animate-pop flex items-center gap-3 rounded-xl border px-4 py-3",
        correct ? "border-accent/40 bg-accent/5" : "border-rose-500/30 bg-rose-500/5",
      )}
    >
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full",
          correct ? "bg-accent/15 text-accent" : "bg-rose-500/15 text-rose-500",
        )}
      >
        {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </div>
      <div className="flex-1 text-sm">{children}</div>
      {points ? (
        <div className="font-mono text-lg font-semibold tabular-nums text-accent">+{points}</div>
      ) : null}
    </div>
  );
}

/** A small prompt line shown above each round's stage. */
export function Prompt({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-sm text-muted">{children}</p>;
}
