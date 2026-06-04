"use client";

import { useState } from "react";
import { rng } from "@/lib/rng";
import type { RoundProps } from "@/lib/round";
import { RoundLayout } from "./round-layout";
import { ResultBanner, Prompt } from "./feedback";
import { Swatch } from "@/components/ui/swatch";
import { TextOption } from "./text-option";
import { deltaE, hexToRgb, shuffle, MAX_ROUND_SCORE } from "@/lib/color";
import { NAMED_COLORS, type NamedColor } from "@/data/colors";

type Round = { swatch: NamedColor; options: NamedColor[]; correct: number };

function makeRound(): Round {
  const swatch = NAMED_COLORS[Math.floor(rng() * NAMED_COLORS.length)];
  const targetRgb = hexToRgb(swatch.hex)!;
  const pool = shuffle(NAMED_COLORS).filter((c) => c.name !== swatch.name);
  const distractors: NamedColor[] = [];
  for (const c of pool) {
    if (distractors.length >= 3) break;
    if (deltaE(targetRgb, hexToRgb(c.hex)!) > 25) distractors.push(c);
  }
  for (const c of pool) {
    if (distractors.length >= 3) break;
    if (!distractors.includes(c)) distractors.push(c);
  }
  const options = shuffle([swatch, ...distractors]);
  return { swatch, options, correct: options.findIndex((o) => o.name === swatch.name) };
}

export function NamesRound({ onAnswer, phase, footer }: RoundProps) {
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
      <Prompt>what is this colour called?</Prompt>
      <Swatch hex={round.swatch.hex} className="h-40 w-full" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        {round.options.map((opt, i) => (
          <TextOption
            key={opt.name}
            label={opt.name}
            onClick={playing ? () => choose(i) : undefined}
            state={
              playing
                ? "idle"
                : i === round.correct
                  ? "correct"
                  : i === picked
                    ? "wrong"
                    : "dim"
            }
          />
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
        that swatch is <span className="font-medium">{round.swatch.name}</span>{" "}
        <span className="font-mono text-xs text-muted">{round.swatch.hex}</span>.
      </ResultBanner>
    ) : undefined;

  return <RoundLayout stage={stage} feedback={feedback} footer={footer} />;
}
