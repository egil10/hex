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

type Option = { rgb: RGB; dE: number };
type Round = { target: RGB; options: Option[]; correct: number };

function makeRound(): Round {
  const target = randomVividRgb();
  for (let attempt = 0; attempt < 60; attempt++) {
    const mags = [
      8 + rng() * 7,
      34 + rng() * 16,
      54 + rng() * 16,
      76 + rng() * 20,
    ];
    const cands = mags.map((m) => nudge(target, m));
    const des = cands.map((c) => deltaE(target, c));
    const order = des.map((d, i) => ({ d, i })).sort((a, b) => a.d - b.d);
    if (order[0].d < 16 && order[0].d * 1.5 < order[1].d) {
      const idx = shuffle([0, 1, 2, 3]);
      const options = idx.map((i) => ({ rgb: cands[i], dE: des[i] }));
      return { target, options, correct: idx.indexOf(order[0].i) };
    }
  }
  const cands = [nudge(target, 10), nudge(target, 45), nudge(target, 65), nudge(target, 90)];
  const des = cands.map((c) => deltaE(target, c));
  return { target, options: cands.map((rgb, i) => ({ rgb, dE: des[i] })), correct: 0 };
}

export function ClosestRound({ onAnswer, phase, footer }: RoundProps) {
  const [round] = useState(makeRound);
  const [picked, setPicked] = useState<number | null>(null);
  const playing = phase === "playing";

  function choose(i: number) {
    if (!playing) return;
    setPicked(i);
    const correct = i === round.correct;
    onAnswer({ score: correct ? MAX_ROUND_SCORE : 0, hit: correct });
  }

  const stage = (
    <>
      <Prompt>which swatch is closest to the target?</Prompt>
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
                  ΔE {opt.dE.toFixed(1)}
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
          ? "nailed it — smallest distance vector."
          : "not quite. the ringed swatch had the smallest ΔE."}
      </ResultBanner>
    ) : undefined;

  return <RoundLayout stage={stage} feedback={feedback} footer={footer} />;
}
