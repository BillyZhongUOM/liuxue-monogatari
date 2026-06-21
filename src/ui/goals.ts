import { ENDINGS, STAT_META_BY_KEY, currentLeadingRoute, totalWeeksInGame } from '../game';
import type { GameState, StatKey } from '../game';

// Turns aimless clicking into pursuit: the single nearest "build X to unlock
// ending Y" nudge, derived purely from GameState + ending data (engine untouched).
// Route-mismatched endings get a soft penalty so the nudge prefers the path the
// player is already on.
export function nextGoal(state: GameState): string {
  const route = currentLeadingRoute(state);
  let best: { adj: number; raw: number; key: StatKey; title: string } | null = null;

  for (const e of ENDINGS) {
    if (e.crisis) continue; // crisis endings are failures to avoid, not goals
    const sg = e.cond?.statGte;
    if (!sg) continue;
    const routeMiss = !!e.cond?.leadingRouteIn && (!route || !e.cond.leadingRouteIn.includes(route));
    const penalty = routeMiss ? 12 : 0;
    for (const [k, target] of Object.entries(sg)) {
      const key = k as StatKey;
      if (key === 'money') continue; // pounds are a different scale; keep nudges on 0-100 stats
      const raw = (target as number) - state.stats[key];
      if (raw <= 0) continue; // already cleared this stat
      const adj = raw + penalty;
      if (!best || adj < best.adj) best = { adj, raw, key, title: e.title };
    }
  }

  if (best) {
    const m = STAT_META_BY_KEY[best.key];
    const n = Math.max(1, Math.round(best.raw));
    return `再把${m.label}提 ${n} 点，离「${best.title}」就更近了`;
  }
  return '多攒点本事，毕业那天会有更好的结局等你';
}

export interface ChapterInfo {
  chapter: string;
  weeksLeft: number;
  progress: number; // 0..1
  isTurn: boolean; // term just turned over (for a flash)
}

const CHAPTERS = ['序章 · 落地', '中章 · 扎根', '终章 · 收官'];

export function chapterInfo(state: GameState): ChapterInfo {
  const total = totalWeeksInGame();
  const weeksLeft = Math.max(0, total - state.totalWeeks);
  return {
    chapter: CHAPTERS[Math.min(CHAPTERS.length - 1, state.term - 1)] ?? CHAPTERS[0],
    weeksLeft,
    progress: Math.min(1, state.totalWeeks / total),
    isTurn: state.week === 1,
  };
}
