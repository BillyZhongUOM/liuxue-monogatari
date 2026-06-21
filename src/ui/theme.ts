import { STAT_META_BY_KEY, UNIVERSITY_TYPES } from '../game';
import type { CharacterConfig, Effects, Ending, StatKey, Stats } from '../game';

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

// =============================================================================
// Call-out skins. Each map location and each event category gets a themed colour
// + glyph so the interior action panel and the event "someone calls you" bubble
// read as diegetic call-outs. These colours are DATA ENCODING (like STAT_COLORS),
// not page chrome; the chrome stays amber.
// =============================================================================
export type LocCategory = 'study' | 'money' | 'health' | 'social' | 'life';

export const LOC_CATEGORY: Record<string, LocCategory> = {
  library: 'study', lecture: 'study', career: 'study',
  market: 'money', mall: 'money', work: 'money', bank: 'money',
  gym: 'health', clinic: 'health', park: 'health',
  society: 'social', nightlife: 'social', town: 'social',
  dorm: 'life', station: 'life',
};

export interface CategorySkin { key: LocCategory; label: string; emoji: string; color: string; }

export const CATEGORY_SKIN: Record<LocCategory, CategorySkin> = {
  study: { key: 'study', label: '学习', emoji: '📖', color: '#6c9cf0' },
  money: { key: 'money', label: '生计', emoji: '💷', color: '#e0a23f' },
  health: { key: 'health', label: '身心', emoji: '🌿', color: '#6cc497' },
  social: { key: 'social', label: '社交', emoji: '🫂', color: '#c98bd8' },
  life: { key: 'life', label: '日常', emoji: '🏠', color: '#9aa6cc' },
};

export function locSkin(locId: string): CategorySkin {
  return CATEGORY_SKIN[LOC_CATEGORY[locId] ?? 'life'];
}

export interface EventSkin { emoji: string; color: string; kicker: string; }

// keyed by GameEvent.category (study/life/social/career/emotion/crisis)
export const EVENT_SKIN: Record<string, EventSkin> = {
  study: { emoji: '📚', color: '#6c9cf0', kicker: '学业插曲' },
  life: { emoji: '🏠', color: '#9aa6cc', kicker: '生活突发' },
  social: { emoji: '🫂', color: '#c98bd8', kicker: '有人找你' },
  career: { emoji: '💼', color: '#e0a23f', kicker: '机会来敲门' },
  emotion: { emoji: '🌧️', color: '#7fa7d8', kicker: '心里的事' },
  crisis: { emoji: '⚠️', color: '#ea7459', kicker: '出状况了' },
};

export function eventSkin(category: string): EventSkin {
  return EVENT_SKIN[category] ?? { emoji: '✨', color: '#f4b04a', kicker: '突发事件' };
}

// =============================================================================
// Final grade (S to D). UI-side mirror of src/game/scoring.ts so the engine stays
// untouched; same formula as screens.tsx re-implements startDifficulty. Ending
// quality scaled by how hard the start was: a 地狱开局 that finishes well outscores
// an easy start that coasts.
// =============================================================================
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

const TONE_BASE: Record<string, number> = { special: 84, good: 70, mixed: 50, bad: 26 };

function difficultyOf(config: CharacterConfig): number {
  let d = UNIVERSITY_TYPES.find((u) => u.id === config.universityType)?.difficulty ?? 3;
  if (config.budget === 'tight') d += 1;
  if (config.budget === 'comfortable') d -= 1;
  if (config.englishLevel === 'just_passed') d += 1;
  if (config.englishLevel === 'fluent') d -= 1;
  return Math.max(1, Math.min(5, d));
}

export function computeGrade(config: CharacterConfig, ending: Ending, stats: Stats): { grade: Grade; score: number } {
  const diff = difficultyOf(config);
  const base = TONE_BASE[ending.tone] ?? 50;
  const diffMult = 0.85 + (diff - 1) * 0.12;
  const peak = Math.max(stats.gpa, stats.career, stats.social, stats.english);
  const bonus = Math.min(4, Math.max(0, (peak - 75) * 0.12));
  const score = Math.round(base * diffMult + bonus);
  const grade: Grade = score >= 88 ? 'S' : score >= 74 ? 'A' : score >= 55 ? 'B' : score >= 38 ? 'C' : 'D';
  return { grade, score };
}

export function gradeTier(grade: Grade): 'legend' | 'epic' | 'rare' | 'common' {
  if (grade === 'S') return 'legend';
  if (grade === 'A') return 'epic';
  if (grade === 'B') return 'rare';
  return 'common';
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
