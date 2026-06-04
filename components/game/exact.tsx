"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { rng } from "@/lib/rng";
import type { RoundProps } from "@/lib/round";
import { RoundLayout } from "./round-layout";
import { ResultBanner, Prompt } from "./feedback";
import { Swatch } from "@/components/ui/swatch";
import {
  deltaE,
  nudge,
  randomVividRgb,
  rgbToHex,
  shuffle,
  MAX_ROUND_SCORE,
  type RGB,
} from "@/lib/color";
import { cn } from "@/lib/cn";

type Difficulty = "easy" | "normal" | "hard";
const RANGES: Record<Difficulty, [number, number]> = {
  easy: [12, 22],
  normal: [5, 10],
  hard: [2.5, 5],
};
const DIFF_KEY = "hexquiz:exact-diff";

function loadDiff(): Difficulty {
  if (typeof window === "undefined") return "normal";
  const v = window.localStorage.getItem(DIFF_KEY);
  return v === "easy" || v === "hard" || v === "normal" ? v : "normal";
}
function saveDiff(d: Difficulty) {
  if (typeof window !== "undefined") window.localStorage.setItem(DIFF_KEY, d);
}

type Option = { rgb: RGB; dE: number };
type Round = { target: RGB; options: Option[]; correct: number };

function makeRound(diff: Difficulty): Round {
  const [lo, hi] = RANGES[diff];
  const target = randomVividRgb();
  const near: RGB[] = [];
  let guard = 0;
  while (near.length < 3 && guard++ < 200) {
    const c = nudge(target, lo + rng() * (hi - lo));
    if (deltaE(target, c) > 0.8 && near.every((n) => deltaE(n, c) > 0.5)) near.push(c);
  }
  while (near.length < 3) near.push(nudge(target, hi));
  const cands = shuffle([target, ...near]);
  return {
    target,
    options: cands.map((rgb) => ({ rgb, dE: deltaE(target, rgb) })),
    correct: cands.indexOf(target),
  };
}

export function ExactRound({ onAnswer, phase, footer, daily }: RoundProps) {
  const [diff, setDiff] = useState<Difficulty>(() => (daily ? "normal" : loadDiff()));
  const [round, setRound] = useState<Round>(() => makeRound(daily ? "normal" : loadDiff()));
  const [picked, setPicked] = useState<number | null>(null);
  const playing = phase === "playing";

  function chooseDiff(d: Difficulty) {
    if (!playing) return;
    setDiff(d);
    saveDiff(d);
    setRound(makeRound(d));
    setPicked(null);
  }

  function choose(i: number) {
    if (!playing) return;
    setPicked(i);
    const correct = i === round.correct;
    onAnswer({ score: correct ? MAX_ROUND_SCORE : 0, hit: correct });
  }

  const stage = (
    <>
      <Prompt>one of these is an exact match for the target. which?</Prompt>

      {!daily && (
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted">difficulty</span>
          <div className="inline-flex rounded-full border border-border bg-surface p-0.5">
            {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => chooseDiff(d)}
                disabled={!playing}
                className={cn(
                  "rounded-full px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed",
                  diff === d ? "bg-accent/10 font-medium text-accent" : "text-muted hover:text-fg",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto mb-5 w-1/2">
        <div className="mb-1.5 text-center text-[10px] uppercase tracking-wider text-muted">
          target
        </div>
        <Swatch hex={rgbToHex(round.target)} className="h-24 w-full" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {round.options.map((opt, i) => {
          const isCorrect = i === round.correct;
          const isPicked = i === picked;
          return (
            <div key={i}>
              <Swatch
                hex={rgbToHex(opt.rgb)}
                onClick={playing ? () => choose(i) : undefined}
                selected={isPicked && playing}
                className={cn(
                  "h-24 w-full",
                  !playing && isCorrect && "ring-2 ring-accent",
                  !playing && isPicked && !isCorrect && "ring-2 ring-rose-500",
                )}
              >
                {!playing && isCorrect && (
                  <div className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-accent shadow">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </Swatch>
              {!playing && (
                <div className="mt-1 text-center font-mono text-[11px] tabular-nums text-muted">
                  {opt.dE < 0.05 ? "exact" : `ΔE ${opt.dE.toFixed(1)}`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  const feedback =
    !playing && picked !== null ? (
      <ResultBanner
        correct={picked === round.correct}
        points={picked === round.correct ? MAX_ROUND_SCORE : 0}
      >
        {picked === round.correct
          ? "perfect eye — that was the exact twin."
          : "so close. the ringed swatch was the exact match."}
      </ResultBanner>
    ) : undefined;

  return <RoundLayout stage={stage} feedback={feedback} footer={footer} />;
}
