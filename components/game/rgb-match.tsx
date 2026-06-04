"use client";

import { useState } from "react";
import type { RoundProps } from "@/lib/round";
import { RoundLayout } from "./round-layout";
import { Prompt, PrecisionVisual } from "./feedback";
import { CoordinateCompare } from "./coordinate-compare";
import { PrimaryButton } from "./controls";
import { Swatch } from "@/components/ui/swatch";
import {
  deltaE,
  randomVividRgb,
  rgbToHex,
  scoreFromDeltaE,
  HIT_DELTA_E,
  type RGB,
} from "@/lib/color";

const START = 128;

export function RgbMatchRound({ onAnswer, phase, footer }: RoundProps) {
  const [target] = useState<RGB>(randomVividRgb);
  const [rgb, setRgb] = useState<RGB>({ r: START, g: START, b: START });
  const playing = phase === "playing";
  const dE = deltaE(target, rgb);

  function submit() {
    if (!playing) return;
    onAnswer({ score: scoreFromDeltaE(dE), hit: dE < HIT_DELTA_E });
  }

  const stage = playing ? (
    <>
      <Prompt>move the sliders until your colour matches the target.</Prompt>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted">target</div>
          <Swatch hex={rgbToHex(target)} className="h-24 w-full" />
        </div>
        <div>
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted">yours</div>
          <Swatch hex={rgbToHex(rgb)} className="h-24 w-full" />
        </div>
      </div>
      <div className="mt-5 space-y-4">
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
      <PrimaryButton onClick={submit} className="mt-6">
        match
      </PrimaryButton>
    </>
  ) : (
    <PrecisionVisual target={target} guess={rgb} />
  );

  return (
    <RoundLayout
      stage={stage}
      feedback={playing ? undefined : <CoordinateCompare target={target} guess={rgb} />}
      footer={footer}
    />
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
