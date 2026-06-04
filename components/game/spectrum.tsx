"use client";

import { useEffect, useRef, useState } from "react";
import type { RoundProps } from "@/lib/round";
import { Prompt, PrecisionFeedback } from "./feedback";
import { PrimaryButton } from "./controls";
import { Swatch } from "@/components/ui/swatch";
import {
  deltaE,
  hslToRgb,
  rgbToHex,
  scoreFromDeltaE,
  HIT_DELTA_E,
  type RGB,
} from "@/lib/color";

type Pick = { x: number; y: number; rgb: RGB };

function makeTarget() {
  const h = Math.random() * 360;
  const l = 0.18 + Math.random() * 0.64;
  return { h, l, rgb: hslToRgb({ h, s: 1, l }), x: h / 360, y: 1 - l };
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function SpectrumRound({ onAnswer, phase }: RoundProps) {
  const [target] = useState(makeTarget);
  const [pick, setPick] = useState<Pick | null>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const playing = phase === "playing";

  // draw the hue × lightness field once (and on resize)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      for (let x = 0; x < rect.width; x += 2) {
        const hue = (x / rect.width) * 360;
        const grad = ctx.createLinearGradient(0, 0, 0, rect.height);
        grad.addColorStop(0, `hsl(${hue} 100% 100%)`);
        grad.addColorStop(0.5, `hsl(${hue} 100% 50%)`);
        grad.addColorStop(1, `hsl(${hue} 100% 0%)`);
        ctx.fillStyle = grad;
        ctx.fillRect(x, 0, 3, rect.height);
      }
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  function setFromEvent(clientX: number, clientY: number) {
    const field = fieldRef.current;
    if (!field) return;
    const r = field.getBoundingClientRect();
    const x = clamp01((clientX - r.left) / r.width);
    const y = clamp01((clientY - r.top) / r.height);
    setPick({ x, y, rgb: hslToRgb({ h: x * 360, s: 1, l: 1 - y }) });
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!playing) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromEvent(e.clientX, e.clientY);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (playing && dragging.current) setFromEvent(e.clientX, e.clientY);
  }
  function endDrag() {
    dragging.current = false;
  }

  function submit() {
    if (!playing || !pick) return;
    const dE = deltaE(target.rgb, pick.rgb);
    onAnswer({ score: scoreFromDeltaE(dE), hit: dE < HIT_DELTA_E });
  }

  return (
    <div>
      <Prompt>drag across the spectrum until your pick matches the target.</Prompt>

      {playing && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted">target</div>
            <Swatch hex={rgbToHex(target.rgb)} className="h-20 w-full" />
          </div>
          <div>
            <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted">your pick</div>
            {pick ? (
              <Swatch hex={rgbToHex(pick.rgb)} className="h-20 w-full" />
            ) : (
              <div className="grid h-20 w-full place-items-center rounded-xl border border-dashed border-border text-xs text-muted">
                drag below
              </div>
            )}
          </div>
        </div>
      )}

      <div
        ref={fieldRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative mt-4 h-48 w-full touch-none select-none overflow-hidden rounded-xl border border-border"
        style={{ cursor: playing ? "crosshair" : "default" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {pick && <Marker x={pick.x} y={pick.y} hex={rgbToHex(pick.rgb)} label={playing ? undefined : "you"} />}
        {!playing && <Marker x={target.x} y={target.y} hex={rgbToHex(target.rgb)} label="target" ring />}
      </div>

      {playing ? (
        <PrimaryButton onClick={submit} disabled={!pick} className="mt-5">
          {pick ? "place it" : "drag the spectrum first"}
        </PrimaryButton>
      ) : (
        <div className="mt-5">
          <PrecisionFeedback target={target.rgb} guess={pick ? pick.rgb : target.rgb} />
        </div>
      )}
    </div>
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
        className={[
          "h-5 w-5 rounded-full shadow-[0_0_0_2px_rgba(0,0,0,0.4)]",
          ring ? "ring-[3px] ring-white" : "border-2 border-white",
        ].join(" ")}
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
