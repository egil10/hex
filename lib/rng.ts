// A swappable random source. Normally it's Math.random; for the daily
// challenge the engine seeds it deterministically so everyone gets the same
// puzzle. All "random" colour generation routes through rng().

let _rand: () => number = Math.random;

export function rng(): number {
  return _rand();
}

/** Seed with a deterministic mulberry32 generator. */
export function seedRng(seed: number): void {
  let a = seed >>> 0;
  _rand = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Restore the default (non-deterministic) Math.random source. */
export function resetRng(): void {
  _rand = Math.random;
}

/** Integer key for "today" in UTC, e.g. 20260604 — same for everyone worldwide. */
export function dailySeed(d = new Date()): number {
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

/** Human date key, e.g. "2026-06-04" (UTC). */
export function todayKey(d = new Date()): string {
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${m}-${day}`;
}
