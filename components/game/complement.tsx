"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { RoundProps } from "@/lib/round";
import { RoundLayout } from "./round-layout";
import { ResultBanner, Prompt } from "./feedback";
import { Swatch } from "@/components/ui/swatch";
import {
  hslToRgb,
  rgbToHsl,
  randomVividRgb,
  rgbToHex,
  shuffle,
  MAX_ROUND_SCORE,
  type RGB,
} from "@/lib/color";
import { cn } from "@/lib/cn";

type Round = { target: RGB; options: RGB[]; correct: number };

function makeRound(): Round {
  const target = randomVividRgb();
  const { h, s, l } = rgbToHsl(target);
  const comp = hslToRgb({ h: h + 180, s, l }); // complement: hue + 180°
  const rots = shuffle([55, 95, 130, 230, 305]).slice(0, 3); // none near 180°
  const distractors = rots.map((r) => hslToRgb({ h: h + r, s, l }));
  const options = shuffle([comp, ...distractors]);
  return { target, options, correct: options.indexOf(comp) };
}

export function ComplementRound({ onAnswer, phase, footer }: RoundProps) {
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
      <Prompt>pick the colour opposite this one on the wheel.</Prompt>
      <div className="mx-auto mb-5 w-1/2">
        <div className="mb-1.5 text-center text-[10px] uppercase tracking-wider text-muted">
          target
        </div>
        <Swatch hex={rgbToHex(round.target)} className="h-24 w-full" />
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
          ? "spot on — that's the hue spun 180°."
          : "the complement is the ringed one — opposite on the wheel."}
      </ResultBanner>
    ) : undefined;

  return <RoundLayout stage={stage} feedback={feedback} footer={footer} />;
}
