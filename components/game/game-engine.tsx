"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { Info, Flame, ChevronRight, CalendarDays, Shuffle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { ModeFilter } from "./mode-filter";
import { Results } from "./results";
import { ROUND_COMPONENTS } from "./registry";
import { useGame } from "@/lib/use-game";
import { useCountUp } from "@/lib/use-count-up";
import { useSound } from "@/lib/use-sound";
import { seedRng, resetRng, dailySeed, todayKey } from "@/lib/rng";
import { buildSequence } from "@/lib/round";
import { MODE_IDS, MODE_MAP, ROUNDS, type ModeId } from "@/lib/modes";
import { cn } from "@/lib/cn";

export function GameEngine({
  selection,
  onChangeSelection,
  daily = false,
}: {
  selection: ModeId[];
  onChangeSelection: (m: ModeId[]) => void;
  daily?: boolean;
}) {
  const game = useGame(ROUNDS);
  const daySeed = useMemo(() => dailySeed(), []);
  const dayKey = useMemo(() => todayKey(), []);

  const sequence = useMemo(() => {
    if (daily) {
      seedRng(daySeed);
      const s = buildSequence(MODE_IDS, ROUNDS);
      resetRng();
      return s;
    }
    return buildSequence(selection, ROUNDS);
  }, [daily, daySeed, selection, game.runId]);

  // Seed the global RNG right before the round mounts so the daily is the same
  // for everyone; reset to Math.random for normal (random) play.
  if (daily) seedRng(daySeed * 100 + game.index);
  else resetRng();

  // Enter advances during feedback (single advance path — no double-fire).
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

  // animated score + opt-in sound on each new result
  const sound = useSound();
  const shownScore = useCountUp(game.totalScore);
  const playRef = useRef(sound.play);
  playRef.current = sound.play;
  const prevLen = useRef(0);
  useEffect(() => {
    const len = game.results.length;
    if (len > prevLen.current && len > 0) {
      const last = game.results[len - 1];
      playRef.current(last.score >= 900 ? "great" : last.hit ? "good" : "miss");
    }
    prevLen.current = len;
  }, [game.results.length]);

  const all = selection.length === MODE_IDS.length;
  const title = daily
    ? `daily · ${dayKey}`
    : all
      ? "ultimate colour game"
      : selection.length === 1
        ? MODE_MAP[selection[0]].title
        : `${selection.length}-mode mix`;
  const scoreKey = daily
    ? `daily:${dayKey}`
    : all
      ? "ultimate"
      : selection.length === 1
        ? selection[0]
        : "custom";

  const currentModeId = sequence[game.index] ?? selection[0] ?? MODE_IDS[0];
  const mode = MODE_MAP[currentModeId];
  const RoundComp = ROUND_COMPONENTS[currentModeId];
  const ModeIcon = mode.icon;
  const showModeChip = selection.length > 1;

  const nextButton =
    phase === "feedback" ? (
      <button
        type="button"
        onClick={game.next}
        className="animate-pop flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        {game.isLastRound ? "see results" : "next round"}
        <ChevronRight className="h-4 w-4" />
        <span className="ml-1 hidden text-xs text-white/70 sm:inline">↵ enter</span>
      </button>
    ) : null;

  return (
    <main className="mx-auto min-h-dvh max-w-4xl px-5 pb-16 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {daily ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/5 py-1.5 pl-3 pr-3.5 text-sm font-medium">
            <CalendarDays className="h-4 w-4 text-accent" /> daily · {dayKey}
          </span>
        ) : (
          <ModeFilter selection={selection} onChange={onChangeSelection} />
        )}
        <div className="flex items-center gap-2">
          {daily ? (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:text-fg"
            >
              <Shuffle className="h-3.5 w-3.5" /> free play
            </Link>
          ) : (
            <Link
              href="/daily"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:text-fg"
            >
              <CalendarDays className="h-3.5 w-3.5" /> daily
            </Link>
          )}
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:text-fg"
          >
            <Info className="h-3.5 w-3.5" /> about
          </Link>
          <SoundToggle on={sound.on} onToggle={sound.toggle} />
          <ThemeToggle />
        </div>
      </div>

      {phase === "done" ? (
        <div className="mx-auto max-w-lg">
          <Results game={game} scoreKey={scoreKey} title={title} />
        </div>
      ) : (
        <>
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
                  {shownScore.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

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

          {showModeChip && (
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted">
              <span>this round:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 font-medium text-fg">
                <ModeIcon className="h-3.5 w-3.5 text-accent" /> {mode.title}
              </span>
            </div>
          )}

          <div className={showModeChip ? "mt-5" : "mt-6"}>
            <RoundComp
              key={game.index}
              onAnswer={game.submit}
              phase={phase === "feedback" ? "feedback" : "playing"}
              footer={nextButton}
              daily={daily}
            />
          </div>

          {phase === "playing" && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={game.skip}
                className="text-xs text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
              >
                skip this one →
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
