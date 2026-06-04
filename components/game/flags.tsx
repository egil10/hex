"use client";

import { useEffect, useMemo, useState } from "react";
import { GameFrame } from "./game-frame";
import { ResultBanner, Prompt } from "./feedback";
import { TextOption } from "./text-option";
import { useGame } from "@/lib/use-game";
import { MODE_MAP } from "@/lib/modes";
import { shuffle, MAX_ROUND_SCORE } from "@/lib/color";
import { FLAGS, type FlagEntry } from "@/data/flags";

const MODE = MODE_MAP["flags"];

type Round = { flag: FlagEntry; options: FlagEntry[]; correct: number };

function makeRound(): Round {
  const flag = FLAGS[Math.floor(Math.random() * FLAGS.length)];
  const distractors = shuffle(FLAGS.filter((f) => f.iso !== flag.iso)).slice(0, 3);
  const options = shuffle([flag, ...distractors]);
  return { flag, options, correct: options.findIndex((o) => o.iso === flag.iso) };
}

export function Flags() {
  const game = useGame(MODE.rounds);
  const round = useMemo(makeRound, [game.seed]);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => setPicked(null), [game.seed]);

  const playing = game.phase === "playing";

  function choose(i: number) {
    if (!playing) return;
    setPicked(i);
    const correct = i === round.correct;
    game.submit({ score: correct ? MAX_ROUND_SCORE : 0, hit: correct });
  }

  return (
    <GameFrame mode={MODE} game={game}>
      <Prompt>these are a national flag&apos;s colours. whose flag?</Prompt>

      {/* the palette clue — flag colours as an abstract strip */}
      <div className="mx-auto flex h-28 w-full max-w-sm overflow-hidden rounded-xl border border-border">
        {round.flag.colors.map((c, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-2 font-mono text-[11px] tabular-nums text-muted">
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
    </GameFrame>
  );
}
