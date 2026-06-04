"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Sparkles, Shuffle } from "lucide-react";
import { MODES, MODE_IDS, MODE_MAP, type ModeId } from "@/lib/modes";
import { cn } from "@/lib/cn";

/** Header control to choose which modes are in play (multi-select). */
export function ModeFilter({
  selection,
  onChange,
}: {
  selection: ModeId[];
  onChange: (m: ModeId[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ModeId[]>(selection);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggleOpen() {
    setDraft(selection); // sync draft to applied selection when opening
    setOpen((o) => !o);
  }
  function toggle(id: ModeId) {
    setDraft((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  }
  function apply() {
    if (draft.length === 0) return;
    onChange(MODE_IDS.filter((id) => draft.includes(id))); // canonical order
    setOpen(false);
  }

  const all = selection.length === MODE_IDS.length;
  const single = selection.length === 1 ? MODE_MAP[selection[0]] : null;
  const SummaryIcon = all ? Sparkles : single ? single.icon : Shuffle;
  const label = all ? "ultimate mix" : single ? single.title : `${selection.length} modes`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-2.5 pr-3 text-sm font-medium transition-colors hover:border-accent/40"
      >
        <SummaryIcon className="h-4 w-4 text-accent" />
        {label}
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="animate-pop absolute left-0 z-30 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          <div className="flex items-center justify-between px-3 pb-1 pt-2.5">
            <span className="text-[10px] uppercase tracking-wider text-muted">pick your modes</span>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDraft([...MODE_IDS])}
                className="text-accent transition-opacity hover:opacity-80"
              >
                all
              </button>
              <span className="text-border">·</span>
              <button
                type="button"
                onClick={() => setDraft([])}
                className="text-muted transition-colors hover:text-fg"
              >
                clear
              </button>
            </div>
          </div>

          <div className="max-h-[18rem] overflow-y-auto p-1">
            {MODES.map((m) => {
              const MIcon = m.icon;
              const on = draft.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-fg/5"
                >
                  <span
                    className={cn(
                      "grid h-4 w-4 shrink-0 place-items-center rounded border",
                      on ? "border-accent bg-accent text-white" : "border-border",
                    )}
                  >
                    {on && <Check className="h-3 w-3" />}
                  </span>
                  <MIcon className={cn("h-4 w-4 shrink-0", on ? "text-accent" : "text-muted")} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-tight">{m.title}</span>
                    <span className="block truncate text-xs text-muted">{m.tagline}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-1.5">
            <button
              type="button"
              onClick={apply}
              disabled={draft.length === 0}
              className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-white transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {draft.length === MODE_IDS.length
                ? "play the ultimate game"
                : draft.length === 0
                  ? "pick at least one"
                  : `play ${draft.length} mode${draft.length > 1 ? "s" : ""}`}
            </button>
          </div>

          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-3 py-2.5 text-xs text-muted transition-colors hover:text-fg"
          >
            about &amp; how scoring works →
          </Link>
        </div>
      )}
    </div>
  );
}
