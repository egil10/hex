"use client";

import { useEffect, useRef, useState } from "react";
import type { RoundProps } from "@/lib/round";
import { Prompt, PrecisionFeedback } from "./feedback";
import { PrimaryButton } from "./controls";
import { Swatch } from "@/components/ui/swatch";
import {
  deltaE,
  hexToRgb,
  randomRgb,
  rgbToHex,
  scoreFromDeltaE,
  HIT_DELTA_E,
  type RGB,
} from "@/lib/color";

export function GuessHexRound({ onAnswer, phase }: RoundProps) {
  const [target] = useState<RGB>(randomRgb);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<RGB | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const playing = phase === "playing";

  useEffect(() => {
    if (playing) inputRef.current?.focus();
  }, [playing]);

  const guessRgb = hexToRgb(input);
  const valid = guessRgb !== null;

  function submit() {
    if (!valid || !guessRgb || !playing) return;
    setSubmitted(guessRgb);
    const dE = deltaE(target, guessRgb);
    onAnswer({ score: scoreFromDeltaE(dE), hit: dE < HIT_DELTA_E });
  }

  return (
    <div>
      <Prompt>read the swatch, then type the hex you think made it.</Prompt>
      <Swatch hex={rgbToHex(target)} className="h-44 w-full" />

      {playing ? (
        <div className="mt-5">
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 focus-within:border-accent/50">
            <span className="font-mono text-lg text-muted">#</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) =>
                setInput(e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6))
              }
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="a1b2c3"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-transparent font-mono text-lg uppercase tracking-widest outline-none placeholder:text-muted/40"
            />
          </div>
          <PrimaryButton onClick={submit} disabled={!valid} className="mt-3">
            guess
          </PrimaryButton>
          <p className="mt-3 text-center text-xs text-muted">
            no pressure — you&apos;re scored on how close it <em>looks</em>, not exact digits.
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <PrecisionFeedback target={target} guess={submitted ?? target} />
        </div>
      )}
    </div>
  );
}
