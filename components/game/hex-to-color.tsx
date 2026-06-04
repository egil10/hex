"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { RoundProps } from "@/lib/round";
import { RoundLayout } from "./round-layout";
import { ResultBanner, Prompt } from "./feedback";
import { Swatch } from "@/components/ui/swatch";
import { deltaE, randomVividRgb, rgbToHex, shuffle, MAX_ROUND_SCORE, type RGB } from "@/lib/color";
import { cn } from "@/lib/cn";

type Round = { hex: string; options: RGB[]; correct: number };

function makeRound(): Round {
  const target = randomVividRgb();
  const options: RGB[] = [target];
  let guard = 0;
  while (options.length < 4 && guard++ < 400) {
    const c = randomVividRgb();
    const minGap = guard > 200 ? 20 : 38;
    if (options.every((o) => deltaE(o, c) > minGap)) options.push(c);
  }
  while (options.length < 4) options.push(randomVividRgb());
  const shuffled = shuffle(options);
  return { hex: rgbToHex(target), options: shuffled, correct: shuffled.indexOf(target) };
}

export function HexToColorRound({ onAnswer, phase, footer }: RoundProps) {
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
      <Prompt>which swatch does this hex code make?</Prompt>
      <div className="mx-auto mb-5 w-fit rounded-xl border border-border bg-surface px-6 py-3">
        <span className="font-mono text-2xl font-semibold tracking-wider">{round.hex}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {round.options.map((rgb, i) => {
          const isCorrect = i === round.correct;
          const isPicked = i === picked;
          return (
            <Swatch
              key={i}
              hex={rgbToHex(rgb)}
              onClick={playing ? () => choose(i) : undefined}
              selected={isPicked && playing}
              className={cn(
                "h-28 w-full",
                !playing && isCorrect && "ring-2 ring-accent",
                !playing && isPicked && !isCorrect && "ring-2 ring-rose-500",
              )}
            >
              {!playing && isCorrect && (
                <div className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-accent shadow">
                  <Check className="h-4 w-4" />
                </div>
              )}
              {!playing && (
                <div className="absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[10px] text-white">
                  {rgbToHex(rgb)}
                </div>
              )}
            </Swatch>
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
          ? `right — ${round.hex} it is.`
          : `that was ${round.hex} — the ringed swatch.`}
      </ResultBanner>
    ) : undefined;

  return <RoundLayout stage={stage} feedback={feedback} footer={footer} />;
}
