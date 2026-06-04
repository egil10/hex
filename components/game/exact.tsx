"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { RoundProps } from "@/lib/round";
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

type Option = { rgb: RGB; dE: number };
type Round = { target: RGB; options: Option[]; correct: number };

function makeRound(): Round {
  const target = randomVividRgb();
  // three near-misses, all a hair off, plus the exact match
  const near: RGB[] = [];
  let guard = 0;
  while (near.length < 3 && guard++ < 100) {
    const c = nudge(target, 4 + Math.random() * 6);
    const d = deltaE(target, c);
    if (d > 1 && near.every((n) => deltaE(n, c) > 0.5)) near.push(c);
  }
  while (near.length < 3) near.push(nudge(target, 6)); // fallback
  const cands = shuffle([target, ...near]);
  const options = cands.map((rgb) => ({ rgb, dE: deltaE(target, rgb) }));
  return { target, options, correct: cands.indexOf(target) };
}

export function ExactRound({ onAnswer, phase }: RoundProps) {
  const [round] = useState(makeRound);
  const [picked, setPicked] = useState<number | null>(null);
  const playing = phase === "playing";

  function choose(i: number) {
    if (!playing) return;
    setPicked(i);
    const correct = i === round.correct;
    onAnswer({ score: correct ? MAX_ROUND_SCORE : 0, hit: correct });
  }

  return (
    <div>
      <Prompt>one of these is an exact match for the target. which?</Prompt>

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

      {!playing && (
        <ResultBanner
          correct={picked === round.correct}
          points={picked === round.correct ? MAX_ROUND_SCORE : 0}
        >
          {picked === round.correct
            ? "perfect eye — that was the exact twin."
            : "so close. the ringed swatch was the exact match."}
        </ResultBanner>
      )}
    </div>
  );
}
