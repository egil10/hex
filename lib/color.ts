// color.ts — the maths behind the quiz.
//
// Everything here treats a colour as a vector. The headline idea (from the
// blueprint note: "bruk koordinater og norm og deretter vise hvilken farge det
// var ved bruk av vektorer") is that "how close are two colours" is just the
// length of the difference vector — a norm. We do it in CIELAB space, where
// Euclidean distance (ΔE) lines up with how different two colours *look* to a
// human far better than raw RGB distance does.

import { rng } from "./rng";

export type RGB = { r: number; g: number; b: number };
export type LAB = { L: number; a: number; b: number };
export type HSL = { h: number; s: number; l: number };

export const clamp = (n: number, min = 0, max = 255) =>
  Math.min(max, Math.max(min, n));

export const round255 = (n: number) => clamp(Math.round(n), 0, 255);

// ---------------------------------------------------------------- hex <-> rgb

/** Parse loose user input ("abc", "#abc", "AABBCC") into a clean #RRGGBB, or null. */
export function normalizeHex(input: string): string | null {
  if (!input) return null;
  let h = input.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{3}$/.test(h)) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (/^[0-9a-f]{6}$/.test(h)) return "#" + h;
  return null;
}

export function hexToRgb(hex: string): RGB | null {
  const norm = normalizeHex(hex);
  if (!norm) return null;
  const n = parseInt(norm.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const h = (round255(r) << 16) | (round255(g) << 8) | round255(b);
  return "#" + h.toString(16).padStart(6, "0").toUpperCase();
}

// ---------------------------------------------------------------- rgb <-> hsl

export function hslToRgb({ h, s, l }: HSL): RGB {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: round255((r + m) * 255),
    g: round255((g + m) * 255),
    b: round255((b + m) * 255),
  };
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

// ---------------------------------------------------------------- rgb -> lab

function pivotRgb(c: number): number {
  c /= 255;
  return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
}

function pivotXyz(t: number): number {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
}

export function rgbToLab({ r, g, b }: RGB): LAB {
  const R = pivotRgb(r) * 100;
  const G = pivotRgb(g) * 100;
  const B = pivotRgb(b) * 100;

  // sRGB -> XYZ (D65)
  const x = R * 0.4124 + G * 0.3576 + B * 0.1805;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = R * 0.0193 + G * 0.1192 + B * 0.9505;

  // XYZ -> LAB (D65 reference white)
  const fx = pivotXyz(x / 95.047);
  const fy = pivotXyz(y / 100.0);
  const fz = pivotXyz(z / 108.883);

  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

// ---------------------------------------------------------------- distances

/** Plain Euclidean norm of the difference vector in RGB space (0..~441). */
export function rgbDistance(a: RGB, b: RGB): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * ΔE — the perceptual distance between two colours, i.e. the length of the
 * difference vector in CIELAB space (CIE76). 0 = identical; ~2.3 is the "just
 * noticeable difference"; 100 is roughly black-to-white.
 */
export function deltaE(a: RGB, b: RGB): number {
  const la = rgbToLab(a);
  const lb = rgbToLab(b);
  const dL = la.L - lb.L;
  const da = la.a - lb.a;
  const db = la.b - lb.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

// ---------------------------------------------------------------- scoring

export const MAX_ROUND_SCORE = 1000;

/** Map a ΔE distance to 0..1000 points. Generous near 0, decays smoothly. */
export function scoreFromDeltaE(dE: number): number {
  return Math.round(MAX_ROUND_SCORE * Math.exp(-dE / 40));
}

export type Tier = {
  label: string;
  /** tailwind text colour token for the feedback line */
  tone: string;
};

/** Human-readable verdict for a ΔE, based on real perceptual thresholds. */
export function tierFromDeltaE(dE: number): Tier {
  if (dE < 1) return { label: "perfect — imperceptible", tone: "text-accent" };
  if (dE < 2.3) return { label: "flawless", tone: "text-accent" };
  if (dE < 5) return { label: "excellent", tone: "text-accent" };
  if (dE < 10) return { label: "great", tone: "text-emerald-500" };
  if (dE < 20) return { label: "good", tone: "text-emerald-500" };
  if (dE < 35) return { label: "close", tone: "text-amber-500" };
  if (dE < 60) return { label: "off", tone: "text-orange-500" };
  return { label: "way off", tone: "text-rose-500" };
}

/** A guess "counts" (for streaks / accuracy) when it's within "good" range. */
export const HIT_DELTA_E = 20;

// ---------------------------------------------------------------- helpers

export function randomRgb(): RGB {
  return {
    r: Math.floor(rng() * 256),
    g: Math.floor(rng() * 256),
    b: Math.floor(rng() * 256),
  };
}

export function randomHex(): string {
  return rgbToHex(randomRgb());
}

/** A pleasant, reasonably saturated random colour (avoids muddy near-greys). */
export function randomVividRgb(): RGB {
  return hslToRgb({
    h: rng() * 360,
    s: 0.45 + rng() * 0.5,
    l: 0.3 + rng() * 0.45,
  });
}

/** Nudge a colour by a target RGB magnitude in a random direction, clamped. */
export function nudge(rgb: RGB, magnitude: number): RGB {
  // random unit-ish direction
  let dr = rng() * 2 - 1;
  let dg = rng() * 2 - 1;
  let db = rng() * 2 - 1;
  const len = Math.sqrt(dr * dr + dg * dg + db * db) || 1;
  dr = (dr / len) * magnitude;
  dg = (dg / len) * magnitude;
  db = (db / len) * magnitude;
  return {
    r: round255(rgb.r + dr),
    g: round255(rgb.g + dg),
    b: round255(rgb.b + db),
  };
}

/** Pick a readable text colour (black or white) for a given background. */
export function readableText(rgb: RGB): string {
  // relative luminance (sRGB)
  const lum =
    0.2126 * pivotRgb(rgb.r) + 0.7152 * pivotRgb(rgb.g) + 0.0722 * pivotRgb(rgb.b);
  return lum > 0.4 ? "#101010" : "#f5f5f5";
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `n` distinct random items from a list. */
export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
