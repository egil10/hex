"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type RoundResult = {
  /** points earned this round (0..1000) */
  score: number;
  /** whether this round counts as a "hit" for streak / accuracy */
  hit: boolean;
};

export type Phase = "playing" | "feedback" | "done";

export type Game = ReturnType<typeof useGame>;

/**
 * The shared game loop: tracks the current round, accumulated results, the
 * phase (answering / showing feedback / finished) and derived stats like the
 * running streak. Each mode owns *what* a round looks like; this owns the flow.
 *
 * Phase + index are mirrored into refs so the transition handlers can guard
 * against double-firing (e.g. a held Enter key, or a fast double-click)
 * regardless of React's batching.
 */
export function useGame(totalRounds: number) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [seed, setSeed] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);

  const indexRef = useRef(0);
  const phaseRef = useRef<Phase>("playing");

  const submit = useCallback((r: RoundResult) => {
    if (phaseRef.current !== "playing") return; // already answered this round
    phaseRef.current = "feedback";
    setPhase("feedback");
    setResults((prev) => [...prev, r]);
  }, []);

  const next = useCallback(() => {
    if (phaseRef.current !== "feedback") return; // nothing to advance from
    if (indexRef.current + 1 >= totalRounds) {
      phaseRef.current = "done";
      setPhase("done");
    } else {
      indexRef.current += 1;
      phaseRef.current = "playing";
      setIndex(indexRef.current);
      setSeed((s) => s + 1);
      setPhase("playing");
    }
  }, [totalRounds]);

  const restart = useCallback(() => {
    indexRef.current = 0;
    phaseRef.current = "playing";
    setIndex(0);
    setPhase("playing");
    setResults([]);
    setSeed((s) => s + 1);
  }, []);

  const totalScore = useMemo(
    () => results.reduce((sum, r) => sum + r.score, 0),
    [results],
  );

  const { streak, bestStreak } = useMemo(() => {
    let cur = 0;
    let best = 0;
    for (const r of results) {
      if (r.hit) {
        cur += 1;
        best = Math.max(best, cur);
      } else {
        cur = 0;
      }
    }
    return { streak: cur, bestStreak: best };
  }, [results]);

  const hits = useMemo(() => results.filter((r) => r.hit).length, [results]);

  return {
    index,
    total: totalRounds,
    seed,
    results,
    phase,
    totalScore,
    streak,
    bestStreak,
    hits,
    submit,
    next,
    restart,
    roundNumber: index + 1,
    isLastRound: index + 1 >= totalRounds,
  };
}

const KEY = (mode: string) => `hexquiz:best:${mode}`;

/** Read the stored best score for a mode (client only). */
export function getBestScore(mode: string): number {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(KEY(mode));
  return v ? parseInt(v, 10) || 0 : 0;
}

/** Persist a new score if it beats the stored best. Returns the best + whether it's new. */
export function saveBestScore(
  mode: string,
  score: number,
): { best: number; isNew: boolean } {
  if (typeof window === "undefined") return { best: score, isNew: false };
  const prev = getBestScore(mode);
  if (score > prev) {
    window.localStorage.setItem(KEY(mode), String(score));
    return { best: score, isNew: true };
  }
  return { best: prev, isNew: false };
}

/** React hook: live best score for a mode, refreshed on mount. */
export function useBestScore(mode: string): number {
  const [best, setBest] = useState(0);
  useEffect(() => {
    setBest(getBestScore(mode));
  }, [mode]);
  return best;
}
