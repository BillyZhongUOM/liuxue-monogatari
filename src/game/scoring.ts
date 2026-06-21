import { UNIVERSITY_TYPES } from './constants';
import type { CharacterConfig, Ending, Stats } from './types';

// Single source of truth for "how hard is this start" and "how prestigious".
// Both screens.tsx and the grade use these, so they never drift apart.

export type Tier = 'legend' | 'epic' | 'rare' | 'common';

export function startTier(config: CharacterConfig): Tier {
  return (UNIVERSITY_TYPES.find((u) => u.id === config.universityType)?.tier as Tier) ?? 'common';
}

/** 1 (easiest) to 5 (地狱). School difficulty, nudged by budget + English. */
export function startDifficulty(config: CharacterConfig): number {
  let d = UNIVERSITY_TYPES.find((u) => u.id === config.universityType)?.difficulty ?? 3;
  if (config.budget === 'tight') d += 1;
  if (config.budget === 'comfortable') d -= 1;
  if (config.englishLevel === 'just_passed') d += 1;
  if (config.englishLevel === 'fluent') d -= 1;
  return Math.max(1, Math.min(5, d));
}

// -----------------------------------------------------------------------------
// Final grade: ending quality scaled by how hard the start was, so a 地狱开局
// that finishes well scores far higher than an easy start that coasts.
// -----------------------------------------------------------------------------
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface GradeResult {
  grade: Grade;
  score: number;
}

const TONE_BASE: Record<string, number> = { special: 84, good: 70, mixed: 50, bad: 26 };

export function computeGrade(config: CharacterConfig, ending: Ending, stats: Stats): GradeResult {
  const diff = startDifficulty(config);
  const base = TONE_BASE[ending.tone] ?? 50;
  // diff 1 -> x0.85, diff 3 -> x1.09, diff 5 -> x1.33
  const diffMult = 0.85 + (diff - 1) * 0.12;
  // small reward for a standout finishing stat
  const peak = Math.max(stats.gpa, stats.career, stats.social, stats.english);
  const bonus = Math.min(4, Math.max(0, (peak - 75) * 0.12));
  const score = Math.round(base * diffMult + bonus);
  const grade: Grade = score >= 88 ? 'S' : score >= 74 ? 'A' : score >= 55 ? 'B' : score >= 38 ? 'C' : 'D';
  return { grade, score };
}

/** Tier the grade badge borrows its colour from (reuses the rarity palette). */
export function gradeTier(grade: Grade): Tier {
  if (grade === 'S') return 'legend';
  if (grade === 'A') return 'epic';
  if (grade === 'B') return 'rare';
  return 'common';
}
