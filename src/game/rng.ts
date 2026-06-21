// Deterministic PRNG (mulberry32). Seeding from GameState.rngState makes every
// playthrough reproducible, which keeps saves stable and lets tests assert exact
// outcomes. The Rng object carries its evolving `state` so the engine can persist
// it back into GameState after each operation.

export interface Rng {
  /** float in [0, 1) */
  next(): number;
  /** integer in [0, maxExclusive) */
  nextInt(maxExclusive: number): number;
  /** true with probability p (clamped to [0,1]) */
  chance(p: number): boolean;
  /** uniformly pick one element */
  pick<T>(arr: readonly T[]): T;
  /** current internal state, for persistence */
  readonly state: number;
}

export function makeRng(seed: number): Rng {
  let s = seed >>> 0;
  const step = (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next: step,
    nextInt: (maxExclusive: number) => Math.floor(step() * Math.max(1, maxExclusive)),
    chance: (p: number) => step() < Math.min(1, Math.max(0, p)),
    pick<T>(arr: readonly T[]): T {
      return arr[Math.floor(step() * arr.length)];
    },
    get state() {
      return s;
    },
  };
}

/** Build a fresh seed from a string + numeric salt (no Date/Math.random needed). */
export function seedFrom(text: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
