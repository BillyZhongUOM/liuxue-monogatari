import { useEffect, useRef, useState } from 'react';
import { ROUTE_BY_ID, currentLeadingRoute } from '../game';
import type { GameState } from '../game';
import { chapterInfo, nextGoal } from './goals';

// A persistent, compact "where am I + what next" banner so the year has a visible
// shape and the player always has a direction. Pure read of GameState; the bar,
// route and nudge all come from engine read-helpers + ending data.
export function ChapterBanner({ state }: { state: GameState }) {
  const ch = chapterInfo(state);
  const route = currentLeadingRoute(state);
  const r = route ? ROUTE_BY_ID[route] : undefined;
  const goal = nextGoal(state);

  const [flash, setFlash] = useState(false);
  const prevTerm = useRef(state.term);
  useEffect(() => {
    if (state.term !== prevTerm.current) {
      prevTerm.current = state.term;
      setFlash(true);
      const t = window.setTimeout(() => setFlash(false), 1400);
      return () => window.clearTimeout(t);
    }
  }, [state.term]);

  return (
    <div className={`chapter${flash ? ' chapter--turn' : ''}`}>
      <div className="chapter__top">
        <span className="chapter__act">{ch.chapter}</span>
        <span className="chapter__left">距毕业 {ch.weeksLeft} 周</span>
      </div>
      <div className="chapter__bar">
        <span className="chapter__fill" style={{ width: `${Math.round(ch.progress * 100)}%` }} />
      </div>
      <div className="chapter__goal">
        <span className="chapter__route">{r ? `${r.emoji} ${r.name}` : '🧭 路线未定'}</span>
        <span className="chapter__nudge">{goal}</span>
      </div>
    </div>
  );
}
