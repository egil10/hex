"use client";

import { useState } from "react";
import type { RoundProps } from "@/lib/round";
import { ResultBanner, Prompt } from "./feedback";
import { TextOption } from "./text-option";
import { shuffle, MAX_ROUND_SCORE } from "@/lib/color";
import { FLAGS, type FlagEntry } from "@/data/flags";

type Round = { flag: FlagEntry; options: FlagEntry[]; correct: number };

function makeRound(): Round {
  const flag = FLAGS[Math.floor(Math.random() * FLAGS.length)];
  const distractors = shuffle(FLAGS.filter((f) => f.iso !== flag.iso)).slice(0, 3);
  const options = shuffle([flag, ...distractors]);
  return { flag, options, correct: options.findIndex((o) => o.iso === flag.iso) };
}

export function FlagsRound({ onAnswer, phase }: RoundProps) {
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
      <Prompt>these are a national flag&apos;s colours. whose flag?</Prompt>

      <div className="mx-auto flex h-28 w-full max-w-sm overflow-hidden rounded-xl border border-border">
        {round.flag.colors.map((c, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-2 font-mono text-[11px] tabular-nums text-muted">
        {round.flag.colors.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {round.options.map((opt, i) => (
          <TextOption
            key={opt.iso}
            label={opt.country}
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

      {!playing && (
        <ResultBanner
          correct={picked === round.correct}
          points={picked === round.correct ? MAX_ROUND_SCORE : 0}
        >
          <span className="flex items-center gap-2">
            <img
              src={`https://flagcdn.com/w80/${round.flag.iso}.png`}
              srcSet={`https://flagcdn.com/w160/${round.flag.iso}.png 2x`}
              alt={`Flag of ${round.flag.country}`}
              width={32}
              height={21}
              loading="lazy"
              className="rounded-sm border border-border"
            />
            <span>
              that&apos;s <span className="font-medium">{round.flag.country}</span>.
            </span>
          </span>
        </ResultBanner>
      )}
    </div>
  );
}
