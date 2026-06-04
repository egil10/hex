import {
  Hash,
  Crosshair,
  Eye,
  SlidersHorizontal,
  Pipette,
  Flag,
  Building2,
  Type,
  type LucideIcon,
} from "lucide-react";

export type ModeId =
  | "guess-hex"
  | "closest"
  | "hex-to-color"
  | "rgb-match"
  | "spectrum"
  | "flags"
  | "brands"
  | "names";

export type ModeKind = "precision" | "choice";

export type Mode = {
  id: ModeId;
  title: string;
  tagline: string;
  blurb: string;
  icon: LucideIcon;
  kind: ModeKind;
  /** 1 = approachable, 3 = brutal */
  difficulty: 1 | 2 | 3;
  rounds: number;
};

export const MODES: Mode[] = [
  {
    id: "guess-hex",
    title: "guess the hex",
    tagline: "see a colour, type its code",
    blurb:
      "A swatch appears. Type the six-digit hex you think made it. Scored by ΔE — how close your guess actually looks. Brutally hard, weirdly addictive.",
    icon: Hash,
    kind: "precision",
    difficulty: 3,
    rounds: 8,
  },
  {
    id: "rgb-match",
    title: "rgb match",
    tagline: "drag the sliders to match",
    blurb:
      "Three sliders — red, green, blue. Move them until your colour matches the target. The honest way to learn what 200 green really looks like.",
    icon: SlidersHorizontal,
    kind: "precision",
    difficulty: 2,
    rounds: 8,
  },
  {
    id: "spectrum",
    title: "spectrum",
    tagline: "click to find the colour",
    blurb:
      "A full hue × lightness field. Click where you think the target lives. Closer click, higher score. Your eye against the rainbow.",
    icon: Pipette,
    kind: "precision",
    difficulty: 3,
    rounds: 8,
  },
  {
    id: "closest",
    title: "closest",
    tagline: "which one is nearest?",
    blurb:
      "One target, four near-misses. Pick the swatch closest to it. The 'correct' answer is the one with the smallest distance vector — pure norm.",
    icon: Crosshair,
    kind: "choice",
    difficulty: 2,
    rounds: 10,
  },
  {
    id: "hex-to-color",
    title: "hex → colour",
    tagline: "read the code, pick the swatch",
    blurb:
      "We give you a hex code. You pick which of four swatches it makes. The friendly inverse of guess-the-hex — train your eye for what the numbers mean.",
    icon: Eye,
    kind: "choice",
    difficulty: 1,
    rounds: 10,
  },
  {
    id: "names",
    title: "name that colour",
    tagline: "match swatch to name",
    blurb:
      "Is that 'teal', 'cerulean' or 'periwinkle'? A swatch, four names, one right answer. Quietly humbling.",
    icon: Type,
    kind: "choice",
    difficulty: 1,
    rounds: 10,
  },
  {
    id: "flags",
    title: "flag colours",
    tagline: "whose flag is this?",
    blurb:
      "Just the colours of a national flag, stripped of their shapes. Pick the country they belong to. Harder than it sounds.",
    icon: Flag,
    kind: "choice",
    difficulty: 2,
    rounds: 10,
  },
  {
    id: "brands",
    title: "brand colours",
    tagline: "guess the brand",
    blurb:
      "Famous brands, reduced to their official palette. Name the brand from its colours alone. You know more of these than you think.",
    icon: Building2,
    kind: "choice",
    difficulty: 2,
    rounds: 10,
  },
];

export const MODE_MAP: Record<ModeId, Mode> = Object.fromEntries(
  MODES.map((m) => [m.id, m]),
) as Record<ModeId, Mode>;

export const MODE_IDS = MODES.map((m) => m.id);

export function isModeId(x: string): x is ModeId {
  return x in MODE_MAP;
}
