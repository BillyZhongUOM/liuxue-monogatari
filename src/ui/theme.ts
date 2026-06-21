import { STAT_META_BY_KEY } from '../game';
import type { Effects, StatKey } from '../game';

// Per-stat data colors (data encoding only; page chrome stays amber).
export const STAT_COLORS: Record<StatKey, string> = {
  money: '#f4b04a',
  energy: '#f2c84b',
  stress: '#ea7459',
  gpa: '#6c9cf0',
  english: '#5ac2c2',
  social: '#d08bd8',
  career: '#6cc497',
  adaptation: '#8fc46a',
  health: '#ef6f86',
  visa: '#bda86a',
  homesick: '#e79a4e',
  reputation: '#f0c45a',
};

/** Fraction 0..1 of a stat toward its max, for bar widths. */
export function statFraction(key: StatKey, value: number): number {
  const m = STAT_META_BY_KEY[key];
  return Math.max(0, Math.min(1, (value - m.min) / (m.max - m.min)));
}

export function isDanger(key: StatKey, value: number): boolean {
  const m = STAT_META_BY_KEY[key];
  if (m.dangerLow !== undefined && value <= m.dangerLow) return true;
  if (m.dangerHigh !== undefined && value >= m.dangerHigh) return true;
  return false;
}

export interface FxChip {
  text: string;
  good: boolean;
}

/** Turn an Effects bundle into player-facing chips, colored by good-for-you. */
export function effectChips(fx: Effects | undefined): FxChip[] {
  if (!fx) return [];
  const chips: FxChip[] = [];
  for (const [k, v] of Object.entries(fx)) {
    const delta = v as number;
    if (!delta) continue;
    const key = k as StatKey;
    const m = STAT_META_BY_KEY[key];
    const good = delta > 0 === m.higherIsBetter;
    const sign = delta > 0 ? '+' : '';
    const num = key === 'money' ? `£${delta}` : `${sign}${delta}`;
    chips.push({ text: `${m.short}${key === 'money' ? '' : ''} ${num}`.replace('  ', ' '), good });
  }
  return chips;
}

// Asset resolution.
// Drop a PNG named "<id>.png" into public/assets/generated/, run
// `npm run register:assets`, and it appears in-game. The manifest lists which
// ids exist so we never request a missing image (no 404s). With an empty
// manifest every id falls back to its emoji/CSS placeholder.
import manifest from '../assets/generated/manifest.json';

const available = new Set<string>(
  ((manifest as { assets?: { id: string }[] }).assets ?? []).map((a) => a.id),
);

/** Returns a generated image URL for an asset id, or undefined to use a fallback. */
export function assetUrl(id: string): string | undefined {
  if (!available.has(id)) return undefined;
  // BASE_URL is './' so this resolves correctly under a GitHub Pages subpath.
  return `${import.meta.env.BASE_URL}assets/generated/${id}.png`;
}
