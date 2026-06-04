"use client";

import { useState } from "react";
import { Check } from "lucide-react";
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

type Round = { options: RGB[]; correct: number };

function makeRound(): Round {
  const base = randomVividRgb();
  const cluster = [
    nudge(base, 6 + Math.random() * 8),
    nudge(base, 6 + Math.random() * 8),
    nudge(base, 6 + Math.random() * 8),
  ];
  let outlier = nudge(base, 50 + Math.random() * 28);
  for (let i = 0; i < 50 && cluster.some((c) => deltaE(c, outlier) < 32); i++) {
    outlier = nudge(base, 50 + Math.random() * 28);
  }
  const options = shuffle([...cluster, outlier]);
  return { options, correct: options.indexOf(outlier) };
}

export function OddOneOutRound({ onAnswer, phase, footer }: RoundProps) {
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
      <Prompt>three of these belong together. which is the odd one out?</Prompt>
      <div className="grid grid-cols-2 gap-3">
        {round.options.map((rgb, i) => (
          <Swatch
            key={i}
            hex={rgbToHex(rgb)}
            onClick={playing ? () => choose(i) : undefined}
            selected={i === picked && playing}
            className={cn(
              "h-28 w-full",
              !playing && i === round.correct && "ring-2 ring-accent",
              !playing && i === picked && i !== round.correct && "ring-2 ring-rose-500",
            )}
          >
            {!playing && i === round.correct && (
              <div className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-accent shadow">
                <Check className="h-4 w-4" />
              </div>
            )}
          </Swatch>
        ))}
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
          ? "yes — that one sat furthest from the rest."
          : "the ringed swatch was the outlier."}
      </ResultBanner>
    ) : undefined;

  return <RoundLayout stage={stage} feedback={feedback} footer={footer} />;
}
