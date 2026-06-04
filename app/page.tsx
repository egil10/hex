import { PlayClient } from "@/components/game/play-client";

// The landing page drops you straight into "the ultimate colour game" — all
// modes mixed, by default. Pick a subset (or one) from the menu up top.
// The explainer / all-modes overview lives at /about.
export default function Page() {
  return <PlayClient />;
}
