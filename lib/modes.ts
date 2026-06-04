import {
  Hash,
  Crosshair,
  Target,
  Eye,
  SlidersHorizontal,
  Pipette,
  Flag,
  Building2,
  Type,
  Contrast,
  Shapes,
  Blend,
  Thermometer,
  type LucideIcon,
} from "lucide-react";

export type ModeId =
  | "guess-hex"
  | "rgb-match"
  | "spectrum"
  | "closest"
  | "exact"
  | "complement"
  | "odd-one-out"
  | "mix"
  | "temperature"
  | "hex-to-color"
  | "names"
  | "flags"
  | "brands";

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
  },
  {
    id: "spectrum",
    title: "spectrum",
    tagline: "slide to find the colour",
    blurb:
      "A full hue × lightness field. Drag across it until your pick matches the target shown beside it. Your eye against the rainbow.",
    icon: Pipette,
    kind: "precision",
    difficulty: 3,
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
  },
  {
    id: "exact",
    title: "exact match",
    tagline: "four are close — one is perfect",
    blurb:
      "Four almost-identical swatches sit beside the target. Exactly one is a pixel-perfect match (ΔE 0); the rest are a hair off. Spot the twin.",
    icon: Target,
    kind: "choice",
    difficulty: 3,
  },
  {
    id: "complement",
    title: "complement",
    tagline: "find the opposite colour",
    blurb:
      "Pick the colour directly opposite the target on the wheel — same swatch, hue spun 180°. A little colour theory, scored right or wrong.",
    icon: Contrast,
    kind: "choice",
    difficulty: 2,
  },
  {
    id: "odd-one-out",
    title: "odd one out",
    tagline: "spot the colour that doesn't belong",
    blurb:
      "Four swatches: three are near-siblings, one drifts away. Pick the outlier — the colour furthest from the rest in Lab space.",
    icon: Shapes,
    kind: "choice",
    difficulty: 2,
  },
  {
    id: "mix",
    title: "colour mix",
    tagline: "blend two colours in your head",
    blurb:
      "Two swatches go in. Which of the four is what you get when you blend them? Pure midpoint maths, eyeballed.",
    icon: Blend,
    kind: "choice",
    difficulty: 2,
  },
  {
    id: "temperature",
    title: "warmest",
    tagline: "which colour runs hottest?",
    blurb:
      "Four colours, one feels warmest. Trust your gut on reds over blues — then see how the numbers agree.",
    icon: Thermometer,
    kind: "choice",
    difficulty: 1,
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
  },
];

export const MODE_MAP: Record<ModeId, Mode> = Object.fromEntries(
  MODES.map((m) => [m.id, m]),
) as Record<ModeId, Mode>;

export const MODE_IDS = MODES.map((m) => m.id);

/** Rounds per game — standard across solo play and the mixed "ultimate" game. */
export const ROUNDS = 12;

/** The mode the landing page (`/`) drops you straight into when playing solo. */
export const DEFAULT_MODE: ModeId = "guess-hex";

export function isModeId(x: string): x is ModeId {
  return x in MODE_MAP;
}
