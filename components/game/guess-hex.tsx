"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameFrame } from "./game-frame";
import { PrecisionFeedback, Prompt } from "./feedback";
import { Swatch } from "@/components/ui/swatch";
import { useGame } from "@/lib/use-game";
import { MODE_MAP } from "@/lib/modes";
import {
  deltaE,
  hexToRgb,
  randomRgb,
  rgbToHex,
  scoreFromDeltaE,
  HIT_DELTA_E,
  type RGB,
} from "@/lib/color";

const MODE = MODE_MAP["guess-hex"];

export function GuessHex() {
  const game = useGame(MODE.rounds);
  const target = useMemo<RGB>(() => randomRgb(), [game.seed]);
  const targetHex = rgbToHex(target);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput("");
    if (game.phase === "playing") inputRef.current?.focus();
  }, [game.seed, game.phase]);

  const guessRgb = hexToRgb(input);
  const valid = guessRgb !== null;
  const playing = game.phase === "playing";

  function submit() {
    if (!valid || !guessRgb || !playing) return;
    const dE = deltaE(target, guessRgb);
    game.submit({ score: scoreFromDeltaE(dE), hit: dE < HIT_DELTA_E });
  }

  const dE = guessRgb ? deltaE(target, guessRgb) : 0;

  return (
    <GameFrame mode={MODE} game={game}>
      <Prompt>read the swatch, then type the hex you think made it.</Prompt>

      <Swatch hex={targetHex} className="h-44 w-full" />

      {playing ? (
        <div className="mt-5">
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 focus-within:border-accent/50">
            <span className="font-mono text-lg text-muted">#</span>
            <input
              ref={inputRef}
              value={input.replace(/^#/, "")}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                setInput(cleaned);
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="a1b2c3"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-transparent font-mono text-lg uppercase tracking-widest outline-none placeholder:text-muted/40"
            />
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!valid}
            className="mt-3 w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            guess
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            no pressure — you&apos;re scored on how close it <em>looks</em>, not exact digits.
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <PrecisionFeedback
            targetHex={targetHex}
            guessHex={guessRgb ? rgbToHex(guessRgb) : "#000000"}
            dE={dE}
            score={scoreFromDeltaE(dE)}
          />
        </div>
      )}
    </GameFrame>
  );
}
