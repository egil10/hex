import type { ComponentType } from "react";
import type { ModeId } from "@/lib/modes";
import type { RoundProps } from "@/lib/round";
import { GuessHexRound } from "./guess-hex";
import { RgbMatchRound } from "./rgb-match";
import { SpectrumRound } from "./spectrum";
import { ClosestRound } from "./closest";
import { ExactRound } from "./exact";
import { ComplementRound } from "./complement";
import { OddOneOutRound } from "./odd-one-out";
import { MixRound } from "./mix";
import { TemperatureRound } from "./temperature";
import { HexToColorRound } from "./hex-to-color";
import { NamesRound } from "./names";
import { FlagsRound } from "./flags";
import { BrandsRound } from "./brands";

/** Maps each mode id to the component that renders one round of it. */
export const ROUND_COMPONENTS: Record<ModeId, ComponentType<RoundProps>> = {
  "guess-hex": GuessHexRound,
  "rgb-match": RgbMatchRound,
  spectrum: SpectrumRound,
  closest: ClosestRound,
  exact: ExactRound,
  complement: ComplementRound,
  "odd-one-out": OddOneOutRound,
  mix: MixRound,
  temperature: TemperatureRound,
  "hex-to-color": HexToColorRound,
  names: NamesRound,
  flags: FlagsRound,
  brands: BrandsRound,
};
