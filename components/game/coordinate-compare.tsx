"use client";

import { rgbToLab, rgbToHex, type RGB } from "@/lib/color";
import { cn } from "@/lib/cn";

/**
 * Shows exactly where the target colour sat versus the player's guess, as
 * coordinates: a Lab a*b* plane with the two points joined by a line (that line
 * *is* the ΔE distance vector), a lightness (L) bar, and per-channel RGB tracks.
 */
export function CoordinateCompare({ target, guess }: { target: RGB; guess: RGB }) {
  const labT = rgbToLab(target);
  const labG = rgbToLab(guess);

  // map a*,b* (~ -110..110) into a 0..100 plane, +b pointing up
  const plot = (a: number, b: number) => ({
    x: clampPct(((a + 110) / 220) * 100),
    y: clampPct(((110 - b) / 220) * 100),
  });
  const pT = plot(labT.a, labT.b);
  const pG = plot(labG.a, labG.b);

  const channels: { label: string; t: number; g: number; grad: string }[] = [
    { label: "R", t: target.r, g: guess.r, grad: "linear-gradient(to right,#000,#f00)" },
    { label: "G", t: target.g, g: guess.g, grad: "linear-gradient(to right,#000,#0f0)" },
    { label: "B", t: target.b, g: guess.b, grad: "linear-gradient(to right,#000,#00f)" },
  ];

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted">
          where it sat vs your guess
        </span>
        <span className="flex items-center gap-3 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-fg" /> actual
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-accent" /> yours
          </span>
        </span>
      </div>

      <div className="flex justify-center gap-4">
        {/* Lab a*b* plane */}
        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-bg">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <line x1="50" y1="4" x2="50" y2="96" className="stroke-border" strokeWidth="0.6" />
            <line x1="4" y1="50" x2="96" y2="50" className="stroke-border" strokeWidth="0.6" />
            <line
              x1={pT.x}
              y1={pT.y}
              x2={pG.x}
              y2={pG.y}
              className="stroke-accent"
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />
            <circle
              cx={pT.x}
              cy={pT.y}
              r="4"
              style={{ fill: rgbToHex(target) }}
              className="stroke-fg"
              strokeWidth="2"
            />
            <circle
              cx={pG.x}
              cy={pG.y}
              r="4"
              style={{ fill: rgbToHex(guess) }}
              className="stroke-accent"
              strokeWidth="2"
            />
          </svg>
          <span className="absolute bottom-1 left-1.5 font-mono text-[9px] text-muted">a·b plane</span>
        </div>

        {/* lightness bar */}
        <div className="flex h-40 flex-col items-center">
          <div
            className="relative w-3 flex-1 overflow-hidden rounded-full border border-border"
            style={{ background: "linear-gradient(to top,#000,#fff)" }}
          >
            <Pip pos={labT.L / 100} vertical variant="actual" />
            <Pip pos={labG.L / 100} vertical variant="yours" />
          </div>
          <span className="mt-1 font-mono text-[10px] text-muted">L</span>
        </div>
      </div>

      {/* RGB channels */}
      <div className="mt-4 space-y-2.5">
        {channels.map((c) => (
          <div key={c.label} className="flex items-center gap-3">
            <span className="w-3 font-mono text-xs text-muted">{c.label}</span>
            <div
              className="relative h-2.5 flex-1 rounded-full border border-border"
              style={{ background: c.grad }}
            >
              <Pip pos={c.t / 255} variant="actual" />
              <Pip pos={c.g / 255} variant="yours" />
            </div>
            <span className="w-20 text-right font-mono text-[11px] tabular-nums">
              <span className="text-accent">{c.g}</span>
              <span className="text-muted"> → </span>
              <span className="text-fg">{c.t}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pip({
  pos,
  variant,
  vertical,
}: {
  pos: number;
  variant: "actual" | "yours";
  vertical?: boolean;
}) {
  const p = `${clampPct(pos * 100)}%`;
  const style: React.CSSProperties = vertical
    ? { bottom: p, left: "50%", transform: "translate(-50%,50%)" }
    : { left: p, top: "50%", transform: "translate(-50%,-50%)" };
  return (
    <span
      className={cn(
        "absolute h-3.5 w-3.5 rounded-full border-2 border-bg",
        variant === "actual" ? "bg-fg" : "bg-accent",
      )}
      style={style}
    />
  );
}

function clampPct(n: number) {
  return Math.min(97, Math.max(3, n));
}
