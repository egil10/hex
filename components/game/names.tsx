"use client";

import { useEffect, useMemo, useState } from "react";
import { GameFrame } from "./game-frame";
import { ResultBanner, Prompt } from "./feedback";
import { Swatch } from "@/components/ui/swatch";
import { TextOption } from "./text-option";
import { useGame } from "@/lib/use-game";
import { MODE_MAP } from "@/lib/modes";
import { deltaE, hexToRgb, shuffle, MAX_ROUND_SCORE } from "@/lib/color";
import { NAMED_COLORS, type NamedColor } from "@/data/colors";

const MODE = MODE_MAP["names"];

type Round = { swatch: NamedColor; options: NamedColor[]; correct: number };

function makeRound(): Round {
  const swatch = NAMED_COLORS[Math.floor(Math.random() * NAMED_COLORS.length)];
  const targetRgb = hexToRgb(swatch.hex)!;
  const pool = shuffle(NAMED_COLORS).filter((c) => c.name !== swatch.name);
  const distractors: NamedColor[] = [];
  // prefer clearly-different colours so there's one defensible answer
  for (const c of pool) {
    if (distractors.length >= 3) break;
    if (deltaE(targetRgb, hexToRgb(c.hex)!) > 25) distractors.push(c);
  }
  // pad if a colour was too central to find 3 distant names (rare)
  for (const c of pool) {
    if (distractors.length >= 3) break;
    if (!distractors.includes(c)) distractors.push(c);
  }
  const options = shuffle([swatch, ...distractors]);
  return { swatch, options, correct: options.findIndex((o) => o.name === swatch.name) };
}

export function Names() {
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

      {!playing && (
        <ResultBanner
          correct={picked === round.correct}
          points={picked === round.correct ? MAX_ROUND_SCORE : 0}
        >
          that swatch is{" "}
          <span className="font-medium">{round.swatch.name}</span>{" "}
          <span className="font-mono text-xs text-muted">{round.swatch.hex}</span>.
        </ResultBanner>
      )}
    </GameFrame>
  );
}
