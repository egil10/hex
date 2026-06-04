"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/cn";

const OPTIONS = [
  { value: "light", icon: Sun, label: "light" },
  { value: "system", icon: Monitor, label: "system" },
  { value: "dark", icon: Moon, label: "dark" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // placeholder until mounted, to avoid a hydration flash
  if (!mounted) {
    return <div className="h-8 w-[6.5rem] rounded-full border border-border bg-surface" />;
  }

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-surface p-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          className={cn(
            "grid h-7 w-7 place-items-center rounded-full transition-colors",
            theme === value
              ? "bg-accent/10 text-accent"
              : "text-muted hover:text-fg",
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}
