"use client";

import { useEffect, useMemo, useState } from "react";
import { GameFrame } from "./game-frame";
import { PrecisionFeedback, Prompt } from "./feedback";
import { Swatch } from "@/components/ui/swatch";
import { useGame } from "@/lib/use-game";
import { MODE_MAP } from "@/lib/modes";
import {
  deltaE,
  randomVividRgb,
  rgbToHex,
  scoreFromDeltaE,
  HIT_DELTA_E,
  type RGB,
} from "@/lib/color";

const MODE = MODE_MAP["rgb-match"];
const START = 128;

export function RgbMatch() {
  const game = useGame(MODE.rounds);
  const target = useMemo<RGB>(() => randomVividRgb(), [game.seed]);
  const [rgb, setRgb] = useState<RGB>({ r: START, g: START, b: START });

  useEffect(() => {
    setRgb({ r: START, g: START, b: START });
  }, [game.seed]);

  const playing = game.phase === "playing";
  const dE = deltaE(target, rgb);

  function submit() {
    if (!playing) return;
    game.submit({ score: scoreFromDeltaE(dE), hit: dE < HIT_DELTA_E });
  }

  return (
    <GameFrame mode={MODE} game={game}>
      <Prompt>move the sliders until your colour matches the target.</Prompt>

      {playing ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted">target</div>
              <Swatch hex={rgbToHex(target)} className="h-28 w-full" />
            </div>
            <div>
              <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted">yours</div>
              <Swatch hex={rgbToHex(rgb)} className="h-28 w-full" />
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <Channel
              label="red"
              value={rgb.r}
              gradient={`linear-gradient(to right, rgb(0,${rgb.g},${rgb.b}), rgb(255,${rgb.g},${rgb.b}))`}
              onChange={(r) => setRgb((p) => ({ ...p, r }))}
            />
            <Channel
              label="green"
              value={rgb.g}
              gradient={`linear-gradient(to right, rgb(${rgb.r},0,${rgb.b}), rgb(${rgb.r},255,${rgb.b}))`}
              onChange={(g) => setRgb((p) => ({ ...p, g }))}
            />
            <Channel
              label="blue"
              value={rgb.b}
              gradient={`linear-gradient(to right, rgb(${rgb.r},${rgb.g},0), rgb(${rgb.r},${rgb.g},255))`}
              onChange={(b) => setRgb((p) => ({ ...p, b }))}
            />
          </div>

          <button
            type="button"
            onClick={submit}
            className="mt-7 w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            match
          </button>
        </>
      ) : (
        <>
          <PrecisionFeedback
            targetHex={rgbToHex(target)}
            guessHex={rgbToHex(rgb)}
            dE={dE}
            score={scoreFromDeltaE(dE)}
          />
          <div className="mt-3 flex justify-center gap-4 font-mono text-xs tabular-nums text-muted">
            <span>R {rgb.r}→{target.r}</span>
            <span>G {rgb.g}→{target.g}</span>
            <span>B {rgb.b}→{target.b}</span>
          </div>
        </>
      )}
    </GameFrame>
  );
}

function Channel({
  label,
  value,
  gradient,
  onChange,
}: {
  label: string;
  value: number;
  gradient: string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="uppercase tracking-wider text-muted">{label}</span>
        <span className="font-mono tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={255}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="channel mt-2"
        style={{ background: gradient }}
      />
    </div>
  );
}
