import type { Metadata } from "next";
import { PlayClient } from "@/components/game/play-client";

export const metadata: Metadata = {
  title: "daily — HEX colour quiz",
  description:
    "Today's HEX daily challenge: the same twelve-round colour mix for everyone, every day. Come back tomorrow for a new one.",
};

export default function DailyPage() {
  return <PlayClient daily />;
}
