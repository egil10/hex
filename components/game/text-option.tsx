"use client";

import { cn } from "@/lib/cn";

export type OptionState = "idle" | "correct" | "wrong" | "dim";

export function TextOption({
  label,
  onClick,
  state = "idle",
}: {
  label: string;
  onClick?: () => void;
  state?: OptionState;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "rounded-full border px-4 py-3 text-center text-sm transition-colors",
        state === "idle" && "border-border bg-surface hover:border-accent/50",
        state === "correct" && "border-accent bg-accent/10 font-medium text-accent",
        state === "wrong" && "border-rose-500 bg-rose-500/10 text-rose-500",
        state === "dim" && "border-border bg-surface text-muted opacity-60",
      )}
    >
      {label}
    </button>
  );
}
