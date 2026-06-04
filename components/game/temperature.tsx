"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { RoundProps } from "@/lib/round";
import { RoundLayout } from "./round-layout";
import { ResultBanner, Prompt } from "./feedback";
import { Swatch } from "@/components/ui/swatch";
import { randomVividRgb, rgbToHex, MAX_ROUND_SCORE, type RGB } from "@/lib/color";
import { cn } from "@/lib/cn";

type Round = { options: RGB[]; correct: number };

// a simple warmth proxy: how much red outweighs blue
const warmth = (c: RGB) => c.r - c.b;

function makeRound(): Round {
  for (let attempt = 0; attempt < 80; attempt++) {
    const options = [randomVividRgb(), randomVividRgb(), randomVividRgb(), randomVividRgb()];
    const order = options
      .map((c, i) => ({ w: warmth(c), i }))
      .sort((a, b) => b.w - a.w);
    if (order[0].w - order[1].w >= 45) return { options, correct: order[0].i };
  }
  const options = [randomVividRgb(), randomVividRgb(), randomVividRgb(), randomVividRgb()];
  const ws = options.map(warmth);
  return { options, correct: ws.indexOf(Math.max(...ws)) };
}

export function TemperatureRound({ onAnswer, phase, footer }: RoundProps) {
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
      <Prompt>which of these colours feels the warmest?</Prompt>
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
          ? "yep — warmest = most red over blue."
          : "the ringed swatch ran warmest (most red, least blue)."}
      </ResultBanner>
    ) : undefined;

  return <RoundLayout stage={stage} feedback={feedback} footer={footer} />;
}
