import type { Metadata } from "next";
import { About } from "@/components/about";

export const metadata: Metadata = {
  title: "about — HEX colour quiz",
  description:
    "How HEX works: eight+ colour games scored by ΔE distance in CIELAB space. Guess the hex, match the RGB, name the shade, and more.",
};

export default function AboutPage() {
  return <About />;
}
