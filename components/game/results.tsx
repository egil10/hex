"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trophy, RotateCcw, Share2, Check } from "lucide-react";
import { MAX_ROUND_SCORE } from "@/lib/color";
import { saveBestScore } from "@/lib/use-game";
import type { Game } from "@/lib/use-game";
import { cn } from "@/lib/cn";

export function Results({
  game,
  scoreKey,
  title,
}: {
  game: Game;
  scoreKey: string;
  title: string;
}) {
  const max = game.total * MAX_ROUND_SCORE;
  const pct = Math.round((game.totalScore / max) * 100);
  const accuracy = Math.round((game.hits / game.total) * 100);
  const [best, setBest] = useState<{ best: number; isNew: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBest(saveBestScore(scoreKey, game.totalScore));
  }, [scoreKey, game.totalScore]);

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
    const text = `I scored ${game.totalScore.toLocaleString()} / ${max.toLocaleString()} on "${title}" — HEX colour quiz`;
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
      /* dismissed — ignore */
    }
  }

  return (
    <div className="animate-pop mt-8">
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <div className="text-[10px] uppercase tracking-wider text-muted">{title} · final score</div>
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

        <div className="mt-6 flex items-end justify-center gap-1.5">
          {game.results.map((r, i) => (
            <div
              key={i}
              title={`round ${i + 1}: ${r.score}`}
              className={cn("w-3 rounded-t-sm", r.hit ? "bg-accent" : "bg-muted/40")}
              style={{ height: `${8 + (r.score / MAX_ROUND_SCORE) * 48}px` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="accuracy" value={`${accuracy}%`} />
        <Stat label="best streak" value={String(game.bestStreak)} />
        <Stat label="your best" value={(best?.best ?? game.totalScore).toLocaleString()} highlight />
      </div>

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
      <p className="mt-3 text-center text-xs text-muted">
        switch modes from the menu up top ·{" "}
        <Link href="/about" className="transition-colors hover:text-fg">
          about
        </Link>
      </p>
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
        className={cn("font-mono text-xl font-semibold tabular-nums", highlight && "text-accent")}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}
