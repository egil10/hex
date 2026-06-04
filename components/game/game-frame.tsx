"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Flame,
  Trophy,
  RotateCcw,
  Share2,
  Check,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";
import { MAX_ROUND_SCORE } from "@/lib/color";
import { saveBestScore } from "@/lib/use-game";
import type { Game } from "@/lib/use-game";
import type { Mode } from "@/lib/modes";

export function GameFrame({
  mode,
  game,
  children,
}: {
  mode: Mode;
  game: Game;
  children: React.ReactNode;
}) {
  const Icon = mode.icon;

  // Enter advances to the next round while feedback is showing. This is the
  // single advance path (the button is mouse-only), so there's no double-fire.
  const { phase, next } = game;
  useEffect(() => {
    if (phase !== "feedback") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, next]);

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 pb-24 pt-6">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          menu
        </Link>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-accent" />
          {mode.title}
        </div>
        <ThemeToggle />
      </div>

      {game.phase === "done" ? (
        <Results mode={mode} game={game} />
      ) : (
        <>
          {/* progress + score strip */}
          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted">round</div>
              <div className="font-mono text-2xl font-semibold tabular-nums leading-none">
                {game.roundNumber}
                <span className="text-base text-muted"> / {game.total}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {game.streak >= 2 && (
                <div
                  className="flex items-center gap-1 text-sm text-orange-500"
                  title={`${game.streak} in a row`}
                >
                  <Flame className="h-4 w-4" />
                  <span className="font-mono tabular-nums">{game.streak}</span>
                </div>
              )}
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted">score</div>
                <div className="font-mono text-2xl font-semibold tabular-nums leading-none text-accent">
                  {game.totalScore.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* progress dots */}
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: game.total }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i < game.results.length
                    ? game.results[i].hit
                      ? "bg-accent"
                      : "bg-muted/40"
                    : i === game.index
                      ? "bg-fg/30"
                      : "bg-border",
                )}
              />
            ))}
          </div>

          {/* the round */}
          <div className="mt-6">{children}</div>

          {/* next */}
          {game.phase === "feedback" && (
            <button
              type="button"
              onClick={game.next}
              className="animate-pop mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {game.isLastRound ? "see results" : "next round"}
              <ChevronRight className="h-4 w-4" />
              <span className="ml-1 hidden text-xs text-white/70 sm:inline">↵ enter</span>
            </button>
          )}
        </>
      )}
    </main>
  );
}

function Results({ mode, game }: { mode: Mode; game: Game }) {
  const max = game.total * MAX_ROUND_SCORE;
  const pct = Math.round((game.totalScore / max) * 100);
  const accuracy = Math.round((game.hits / game.total) * 100);
  const [best, setBest] = useState<{ best: number; isNew: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBest(saveBestScore(mode.id, game.totalScore));
  }, [mode.id, game.totalScore]);

  const verdict =
    pct >= 90
      ? "extraordinary colour vision."
      : pct >= 75
        ? "seriously sharp eyes."
        : pct >= 55
          ? "a good eye for colour."
          : pct >= 35
            ? "room to grow — keep training."
            : "the colours won this round.";

  async function share() {
    const text = `I scored ${game.totalScore.toLocaleString()} / ${max.toLocaleString()} on "${mode.title}" — HEX colour quiz`;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "HEX colour quiz", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* user dismissed share sheet — ignore */
    }
  }

  return (
    <div className="animate-pop mt-10">
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <div className="text-[10px] uppercase tracking-wider text-muted">final score</div>
        <div className="mt-1 font-mono text-5xl font-semibold tabular-nums text-accent">
          {game.totalScore.toLocaleString()}
        </div>
        <div className="mt-1 font-mono text-sm tabular-nums text-muted">
          / {max.toLocaleString()} · {pct}%
        </div>
        <p className="mt-3 text-sm text-muted">{verdict}</p>

        {best?.isNew && game.totalScore > 0 && (
          <div className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Trophy className="h-3.5 w-3.5" /> new personal best
          </div>
        )}

        {/* per-round sparkline */}
        <div className="mt-6 flex items-end justify-center gap-1.5">
          {game.results.map((r, i) => (
            <div
              key={i}
              title={`round ${i + 1}: ${r.score}`}
              className={cn(
                "w-3 rounded-t-sm",
                r.hit ? "bg-accent" : "bg-muted/40",
              )}
              style={{ height: `${8 + (r.score / MAX_ROUND_SCORE) * 48}px` }}
            />
          ))}
        </div>
      </div>

      {/* stats */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="accuracy" value={`${accuracy}%`} />
        <Stat label="best streak" value={String(game.bestStreak)} />
        <Stat
          label="your best"
          value={(best?.best ?? game.totalScore).toLocaleString()}
          highlight
        />
      </div>

      {/* actions */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={game.restart}
          className="flex items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <RotateCcw className="h-4 w-4" /> play again
        </button>
        <button
          type="button"
          onClick={share}
          className="flex items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-sm font-medium transition-colors hover:border-accent/40"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-accent" /> copied
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" /> share
            </>
          )}
        </button>
      </div>
      <Link
        href="/"
        className="mt-3 block text-center text-xs text-muted transition-colors hover:text-fg"
      >
        ← back to all modes
      </Link>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface p-4 text-center",
        highlight ? "border-accent/40" : "border-border",
      )}
    >
      <div
        className={cn(
          "font-mono text-xl font-semibold tabular-nums",
          highlight && "text-accent",
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}
