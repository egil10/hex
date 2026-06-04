"use client";

import { useState } from "react";
import { rng } from "@/lib/rng";
import type { RoundProps } from "@/lib/round";
import { RoundLayout } from "./round-layout";
import { ResultBanner, Prompt } from "./feedback";
import { TextOption } from "./text-option";
import { Swatch } from "@/components/ui/swatch";
import { shuffle, MAX_ROUND_SCORE } from "@/lib/color";
import { BRANDS, type BrandEntry } from "@/data/brands";

type Round = { brand: BrandEntry; options: BrandEntry[]; correct: number };

function makeRound(): Round {
  const brand = BRANDS[Math.floor(rng() * BRANDS.length)];
  const distractors = shuffle(BRANDS.filter((b) => b.name !== brand.name)).slice(0, 3);
  const options = shuffle([brand, ...distractors]);
  return { brand, options, correct: options.findIndex((o) => o.name === brand.name) };
}

export function BrandsRound({ onAnswer, phase, footer }: RoundProps) {
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
      <Prompt>a famous brand, reduced to its colours. which brand?</Prompt>
      <div className="flex flex-wrap justify-center gap-3">
        {round.brand.colors.map((c, i) => (
          <Swatch key={i} hex={c} className="h-20 w-20 sm:h-24 sm:w-24" />
        ))}
      </div>
      <div className="mt-3 text-center text-xs text-muted">
        hint: <span className="text-fg">{round.brand.category}</span>
      </div>
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
        those are <span className="font-medium">{round.brand.name}</span>&apos;s colours{" "}
        <span className="font-mono text-xs text-muted">{round.brand.colors.join(" ")}</span>.
      </ResultBanner>
    ) : undefined;

  return <RoundLayout stage={stage} feedback={feedback} footer={footer} />;
}
