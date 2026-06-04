"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameFrame } from "./game-frame";
import { PrecisionFeedback, Prompt } from "./feedback";
import { useGame } from "@/lib/use-game";
import { MODE_MAP } from "@/lib/modes";
import {
  deltaE,
  hslToRgb,
  rgbToHex,
  scoreFromDeltaE,
  HIT_DELTA_E,
  type RGB,
} from "@/lib/color";

const MODE = MODE_MAP["spectrum"];

type Pick = { x: number; y: number; rgb: RGB };

export function Spectrum() {
  const game = useGame(MODE.rounds);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pick, setPick] = useState<Pick | null>(null);

  // target lives on the saturation=1 plane so it's always reachable by a click
  const target = useMemo(() => {
    const h = Math.random() * 360;
    const l = 0.18 + Math.random() * 0.64;
    return { h, l, rgb: hslToRgb({ h, s: 1, l }), x: h / 360, y: 1 - l };
  }, [game.seed]);

  useEffect(() => {
    setPick(null);
  }, [game.seed]);

  // draw the hue × lightness field once (and on resize)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width;
      const h = rect.height;
      if (w === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      const step = 2;
      for (let x = 0; x < w; x += step) {
        const hue = (x / w) * 360;
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, `hsl(${hue} 100% 100%)`);
        grad.addColorStop(0.5, `hsl(${hue} 100% 50%)`);
        grad.addColorStop(1, `hsl(${hue} 100% 0%)`);
        ctx.fillStyle = grad;
        ctx.fillRect(x, 0, step + 1, h);
      }
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  const playing = game.phase === "playing";

  function onPick(e: React.MouseEvent) {
    if (!playing) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    const rgb = hslToRgb({ h: x * 360, s: 1, l: 1 - y });
    setPick({ x, y, rgb });
  }

  function submit() {
    if (!playing || !pick) return;
    const dE = deltaE(target.rgb, pick.rgb);
    game.submit({ score: scoreFromDeltaE(dE), hit: dE < HIT_DELTA_E });
  }

  const dE = pick ? deltaE(target.rgb, pick.rgb) : 0;

  return (
    <GameFrame mode={MODE} game={game}>
      <Prompt>find this colour on the spectrum — click where you think it lives.</Prompt>

      {/* the target chip */}
      <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4">
        <div
          className="h-7 w-7 rounded-full border border-border"
          style={{ backgroundColor: rgbToHex(target.rgb) }}
        />
        <span className="text-xs text-muted">match this</span>
      </div>

      {/* the field */}
      <div
        ref={wrapRef}
        onClick={onPick}
        className="relative h-56 w-full select-none overflow-hidden rounded-xl border border-border"
        style={{ cursor: playing ? "crosshair" : "default" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {pick && (
          <Marker x={pick.x} y={pick.y} hex={rgbToHex(pick.rgb)} label={playing ? undefined : "you"} />
        )}
        {!playing && <Marker x={target.x} y={target.y} hex={rgbToHex(target.rgb)} label="target" ring />}
      </div>

      {playing ? (
        <button
          type="button"
          onClick={submit}
          disabled={!pick}
          className="mt-5 w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {pick ? "place it" : "click the spectrum first"}
        </button>
      ) : (
        <div className="mt-5">
          <PrecisionFeedback
            targetHex={rgbToHex(target.rgb)}
            guessHex={pick ? rgbToHex(pick.rgb) : "#000000"}
            dE={dE}
            score={scoreFromDeltaE(dE)}
          />
        </div>
      )}
    </GameFrame>
  );
}

function Marker({
  x,
  y,
  hex,
  label,
  ring,
}: {
  x: number;
  y: number;
  hex: string;
  label?: string;
  ring?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
    >
      <div
        className={cnMarker(ring)}
        style={{ backgroundColor: hex }}
      />
      {label && (
        <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {label}
        </div>
      )}
    </div>
  );
}

function cnMarker(ring?: boolean) {
  return [
    "h-5 w-5 rounded-full shadow-[0_0_0_2px_rgba(0,0,0,0.4)]",
    ring ? "ring-[3px] ring-white" : "border-2 border-white",
  ].join(" ");
}
