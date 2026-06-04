"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "hexquiz:sound";

let ctx: AudioContext | null = null;

function blip(freq: number, dur = 0.12, type: OscillatorType = "sine", gain = 0.05) {
  if (typeof window === "undefined") return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new AC();
    if (ctx.state === "suspended") void ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch {
    /* WebAudio unavailable — silently ignore */
  }
}

export type SoundKind = "great" | "good" | "miss";

/** Opt-in sound effects (off by default, persisted). */
export function useSound() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(typeof window !== "undefined" && window.localStorage.getItem(KEY) === "1");
  }, []);

  const toggle = useCallback(() => {
    setOn((v) => {
      const next = !v;
      if (typeof window !== "undefined") window.localStorage.setItem(KEY, next ? "1" : "0");
      if (next) blip(720, 0.1); // confirmation chirp when enabling
      return next;
    });
  }, []);

  const play = useCallback(
    (kind: SoundKind) => {
      if (!on) return;
      if (kind === "great") {
        blip(660, 0.12);
        window.setTimeout(() => blip(880, 0.12), 90);
        window.setTimeout(() => blip(1175, 0.16), 185);
      } else if (kind === "good") {
        blip(620, 0.1);
        window.setTimeout(() => blip(820, 0.11), 80);
      } else {
        blip(196, 0.18, "sine", 0.045);
      }
    },
    [on],
  );

  return { on, toggle, play };
}
