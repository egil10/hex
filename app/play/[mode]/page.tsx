import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameClient } from "@/components/game/game-client";
import { MODE_IDS, MODE_MAP, isModeId } from "@/lib/modes";

export function generateStaticParams() {
  return MODE_IDS.map((mode) => ({ mode }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mode: string }>;
}): Promise<Metadata> {
  const { mode } = await params;
  if (!isModeId(mode)) return { title: "HEX — the colour quiz" };
  const m = MODE_MAP[mode];
  return {
    title: `${m.title} — HEX colour quiz`,
    description: m.blurb,
  };
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  if (!isModeId(mode)) notFound();
  return <GameClient mode={mode} />;
}
