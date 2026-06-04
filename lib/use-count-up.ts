"use client";

import { useEffect, useRef, useState } from "react";

/** Smoothly animates a number toward `value` (ease-out cubic). */
export function useCountUp(value: number, duration = 450): number {
  const [display, setDisplay] = useState(value);
  const raf = useRef(0);

  useEffect(() => {
    const from = display;
    if (from === value) return;
    const start = performance.now();
    cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // from is intentionally read from the latest render at the moment value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return display;
}
