"use client";

import type { ComponentType } from "react";
import type { ModeId } from "@/lib/modes";
import { GuessHex } from "./guess-hex";
import { RgbMatch } from "./rgb-match";
import { Spectrum } from "./spectrum";
import { Closest } from "./closest";
import { HexToColor } from "./hex-to-color";
import { Names } from "./names";
import { Flags } from "./flags";
import { Brands } from "./brands";

const REGISTRY: Record<ModeId, ComponentType> = {
  "guess-hex": GuessHex,
  "rgb-match": RgbMatch,
  spectrum: Spectrum,
  closest: Closest,
  "hex-to-color": HexToColor,
  names: Names,
  flags: Flags,
  brands: Brands,
};

export function GameClient({ mode }: { mode: ModeId }) {
  const Component = REGISTRY[mode];
  return <Component />;
}
