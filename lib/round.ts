import type { ReactNode } from "react";
import type { ModeId } from "./modes";
import { shuffle } from "./color";

/** Result a single round reports back to the engine. */
export type RoundResult = { score: number; hit: boolean };

/** A round is either being answered, or showing its feedback. */
export type RoundPhase = "playing" | "feedback";

/**
 * The standard contract every game mode implements. A mode renders exactly ONE
 * round; the engine owns the loop, score, header and results. The component is
 * remounted (keyed) for each new round, so it generates its target on mount and
 * keeps the player's answer in local state to render feedback.
 */
export type RoundProps = {
  onAnswer: (r: RoundResult) => void;
  phase: RoundPhase;
  /** the engine's "next round" control, rendered by the mode inside its layout */
  footer?: ReactNode;
  /** true during the daily challenge — modes should avoid per-user variation */
  daily?: boolean;
};

/**
 * Build the per-round mode order for a game. Uses a shuffled "bag" so every
 * enabled mode shows up before any repeats, and avoids the same mode twice in a
 * row across bag boundaries.
 */
export function buildSequence(modes: ModeId[], n: number): ModeId[] {
  if (modes.length === 0) return [];
  if (modes.length === 1) return new Array(n).fill(modes[0]);
  const seq: ModeId[] = [];
  while (seq.length < n) {
    const bag = shuffle(modes);
    if (seq.length > 0 && bag[0] === seq[seq.length - 1] && bag.length > 1) {
      [bag[0], bag[1]] = [bag[1], bag[0]];
    }
    seq.push(...bag);
  }
  return seq.slice(0, n);
}
