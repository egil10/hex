"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Palette, ChevronRight, Sigma, Sparkles, Play } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MODES } from "@/lib/modes";
import { getBestScore } from "@/lib/use-game";
import { cn } from "@/lib/cn";
import { NAMED_COLORS } from "@/data/colors";
import { FLAGS } from "@/data/flags";
import { BRANDS } from "@/data/brands";

export function About() {
  const [best, setBest] = useState<Record<string, number>>({});

  useEffect(() => {
    const next: Record<string, number> = { ultimate: getBestScore("ultimate") };
    for (const m of MODES) next[m.id] = getBestScore(m.id);
    setBest(next);
  }, []);

  return (
    <main className="min-h-dvh">
      <section className="grain border-b border-border">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-7">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xs text-muted transition-colors hover:text-fg">
              <Palette className="h-4 w-4 text-accent" />
              <span className="font-medium text-fg">hex</span>
              <span className="text-border">·</span>
              <span>colour quiz</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
              >
                <Play className="h-3.5 w-3.5" /> play
              </Link>
              <ThemeToggle />
            </div>
          </div>

          <h1 className="mt-10 max-w-2xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            how well do you <span className="text-accent">actually see</span> colour?
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            A pile of small games — guess the hex from a swatch, drag sliders to match an RGB,
            spot the exact twin, name the shade, place a brand from its palette. Every guess is
            scored by <span className="text-fg">ΔE</span>: the distance between two colours
            measured as vectors in CIELAB space. Lower distance, higher score.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" /> play the ultimate game
            </Link>
            {best.ultimate > 0 && (
              <span className="font-mono text-xs tabular-nums text-muted">
                your best <span className="text-fg">{best.ultimate.toLocaleString()}</span>
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        <div className="-mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard value={String(MODES.length)} label="game modes" highlight />
          <StatCard value={String(NAMED_COLORS.length)} label="named colours" />
          <StatCard value={String(FLAGS.length)} label="flags" />
          <StatCard value={String(BRANDS.length)} label="brands" />
        </div>

        <div className="mt-12 flex items-baseline justify-between">
          <h2 className="text-sm font-medium">or play a single mode</h2>
          <span className="text-xs text-muted">scores save to this browser</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const b = best[m.id] ?? 0;
            return (
              <Link
                key={m.id}
                href={`/play/${m.id}`}
                className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{m.title}</div>
                      <div className="text-xs text-muted">{m.tagline}</div>
                    </div>
                  </div>
                  <Difficulty n={m.difficulty} />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted">{m.blurb}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted">
                    {m.kind === "precision" ? "ΔE scored" : "multiple choice"}
                  </span>
                  <span className="flex items-center gap-3">
                    {b > 0 && (
                      <span className="font-mono text-xs tabular-nums text-muted">
                        best <span className="text-fg">{b.toLocaleString()}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-0.5 text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      play <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-xl border border-border bg-surface p-5">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Sigma className="h-4 w-4 text-accent" /> how it&apos;s scored
          </h3>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted">
            A colour is just a point in space. We convert each hex to{" "}
            <span className="text-fg">CIELAB</span> coordinates — a space built so distances match
            what your eyes perceive — then measure the straight-line distance (the norm of the
            difference vector) between your guess and the target. That number is{" "}
            <span className="text-fg">ΔE</span>:
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <Threshold tone="text-accent" label="ΔE < 1 · imperceptible" />
            <Threshold tone="text-emerald-500" label="< 10 · great" />
            <Threshold tone="text-amber-500" label="< 35 · close" />
            <Threshold tone="text-rose-500" label="> 60 · way off" />
          </div>
        </div>

        <footer className="mt-14 border-t border-border py-8 text-center text-xs text-muted">
          no accounts, no ads, no tracking — just you and the colours.{" "}
          <Link href="/" className="text-accent transition-opacity hover:opacity-80">
            play →
          </Link>
        </footer>
      </div>
    </main>
  );
}

function StatCard({
  value,
  label,
  highlight,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface p-4",
        highlight ? "border-accent/40" : "border-border",
      )}
    >
      <div
        className={cn("font-mono text-2xl font-semibold tabular-nums", highlight && "text-accent")}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

function Difficulty({ n }: { n: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1" title={`difficulty ${n}/3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn("h-1.5 w-1.5 rounded-full", i <= n ? "bg-accent" : "bg-border")}
        />
      ))}
    </div>
  );
}

function Threshold({ tone, label }: { tone: string; label: string }) {
  return (
    <span className={cn("rounded-full border border-border bg-surface px-2.5 py-1 font-mono", tone)}>
      {label}
    </span>
  );
}
