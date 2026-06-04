"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { RoundProps } from "@/lib/round";
import { RoundLayout } from "./round-layout";
import { ResultBanner, Prompt } from "./feedback";
import { Swatch } from "@/components/ui/swatch";
import {
  deltaE,
  randomVividRgb,
  rgbToHex,
  round255,
  shuffle,
  MAX_ROUND_SCORE,
  type RGB,
} from "@/lib/color";
import { cn } from "@/lib/cn";

type Round = { a: RGB; b: RGB; options: RGB[]; correct: number };

const blend = (x: RGB, y: RGB): RGB => ({
  r: round255((x.r + y.r) / 2),
  g: round255((x.g + y.g) / 2),
  b: round255((x.b + y.b) / 2),
});

function makeRound(): Round {
  let a = randomVividRgb();
  let b = randomVividRgb();
  for (let i = 0; i < 50 && deltaE(a, b) < 60; i++) b = randomVividRgb();
  const mixed = blend(a, b);
  const options: RGB[] = [mixed];
  let guard = 0;
  while (options.length < 4 && guard++ < 400) {
    const c = randomVividRgb();
    if (
      options.every((o) => deltaE(o, c) > 26) &&
      deltaE(c, a) > 20 &&
      deltaE(c, b) > 20
    ) {
      options.push(c);
    }
  }
  while (options.length < 4) options.push(randomVividRgb());
  const shuffled = shuffle(options);
  return { a, b, options: shuffled, correct: shuffled.indexOf(mixed) };
}

export function MixRound({ onAnswer, phase, footer }: RoundProps) {
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
      <Prompt>blend these two colours. which swatch do you get?</Prompt>
      <div className="mx-auto mb-5 flex w-fit items-center gap-3">
        <Swatch hex={rgbToHex(round.a)} className="h-20 w-20" />
        <Plus className="h-5 w-5 text-muted" />
        <Swatch hex={rgbToHex(round.b)} className="h-20 w-20" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {round.options.map((rgb, i) => (
          <Swatch
            key={i}
            hex={rgbToHex(rgb)}
            onClick={playing ? () => choose(i) : undefined}
            selected={i === picked && playing}
            className={cn(
              "h-24 w-full",
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
          ? "right — the midpoint of the two."
          : "the blend is the ringed swatch — the average of the two."}
      </ResultBanner>
    ) : undefined;

  return <RoundLayout stage={stage} feedback={feedback} footer={footer} />;
}
