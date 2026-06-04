"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RoundResult } from "./round";
import { MODE_IDS, type ModeId, isModeId } from "./modes";

export type Phase = "playing" | "feedback" | "done";
export type Game = ReturnType<typeof useGame>;

/**
 * The shared game loop. Each mode owns *what* a round looks like; this owns the
 * flow: current round, accumulated results, phase, and derived stats. Phase +
 * index are mirrored into refs so the transition handlers can't double-fire
 * (held Enter, fast clicks) regardless of React batching.
 */
export function useGame(totalRounds: number) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [results, setResults] = useState<RoundResult[]>([]);
  // increments only on restart — used to regenerate the mode order
  const [runId, setRunId] = useState(0);

  const indexRef = useRef(0);
  const phaseRef = useRef<Phase>("playing");

  const submit = useCallback((r: RoundResult) => {
    if (phaseRef.current !== "playing") return; // already answered
    phaseRef.current = "feedback";
    setPhase("feedback");
    setResults((prev) => [...prev, r]);
  }, []);

  const next = useCallback(() => {
    if (phaseRef.current !== "feedback") return;
    if (indexRef.current + 1 >= totalRounds) {
      phaseRef.current = "done";
      setPhase("done");
    } else {
      indexRef.current += 1;
      phaseRef.current = "playing";
      setIndex(indexRef.current);
      setPhase("playing");
    }
  }, [totalRounds]);

  // give up on the current round: record a miss and move straight on
  const skip = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    setResults((prev) => [...prev, { score: 0, hit: false }]);
    if (indexRef.current + 1 >= totalRounds) {
      phaseRef.current = "done";
      setPhase("done");
    } else {
      indexRef.current += 1;
      phaseRef.current = "playing";
      setIndex(indexRef.current);
      setPhase("playing");
    }
  }, [totalRounds]);

  const restart = useCallback(() => {
    indexRef.current = 0;
    phaseRef.current = "playing";
    setIndex(0);
    setPhase("playing");
    setResults([]);
    setRunId((r) => r + 1);
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
    runId,
    results,
    phase,
    totalScore,
    streak,
    bestStreak,
    hits,
    submit,
    next,
    skip,
    restart,
    roundNumber: index + 1,
    isLastRound: index + 1 >= totalRounds,
  };
}

// ---------------------------------------------------------------- best scores

const BEST_KEY = (mode: string) => `hexquiz:best:${mode}`;

export function getBestScore(mode: string): number {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(BEST_KEY(mode));
  return v ? parseInt(v, 10) || 0 : 0;
}

export function saveBestScore(
  mode: string,
  score: number,
): { best: number; isNew: boolean } {
  if (typeof window === "undefined") return { best: score, isNew: false };
  const prev = getBestScore(mode);
  if (score > prev) {
    window.localStorage.setItem(BEST_KEY(mode), String(score));
    return { best: score, isNew: true };
  }
  return { best: prev, isNew: false };
}

// ----------------------------------------------------------- mode selection

const SELECTION_KEY = "hexquiz:modes";

/** Load the player's enabled-mode selection (defaults to all modes). */
export function loadSelection(): ModeId[] {
  if (typeof window === "undefined") return [...MODE_IDS];
  try {
    const raw = window.localStorage.getItem(SELECTION_KEY);
    if (!raw) return [...MODE_IDS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...MODE_IDS];
    const valid = parsed.filter((x): x is ModeId => typeof x === "string" && isModeId(x));
    return valid.length ? valid : [...MODE_IDS];
  } catch {
    return [...MODE_IDS];
  }
}

export function saveSelection(modes: ModeId[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTION_KEY, JSON.stringify(modes));
}
