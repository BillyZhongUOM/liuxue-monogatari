import type { Condition, GameState, StatKey } from './types';

/** The route with the highest affinity score, or '' if all are zero. */
export function leadingRoute(state: GameState): string {
  let best = '';
  let bestScore = 0;
  for (const [route, score] of Object.entries(state.routeScores)) {
    if (score > bestScore) {
      bestScore = score;
      best = route;
    }
  }
  return best;
}

function truthy(v: unknown): boolean {
  return v !== undefined && v !== null && v !== false && v !== 0 && v !== '';
}

/** Pure evaluation of a declarative Condition against the current state. */
export function evaluateCondition(cond: Condition | undefined, state: GameState): boolean {
  if (!cond) return true;
  const { stats, flags, config } = state;

  if (cond.statGte) {
    for (const [k, v] of Object.entries(cond.statGte)) {
      if (stats[k as StatKey] < (v as number)) return false;
    }
  }
  if (cond.statLte) {
    for (const [k, v] of Object.entries(cond.statLte)) {
      if (stats[k as StatKey] > (v as number)) return false;
    }
  }
  if (cond.flagsSet) {
    for (const f of cond.flagsSet) if (!truthy(flags[f])) return false;
  }
  if (cond.flagsNotSet) {
    for (const f of cond.flagsNotSet) if (truthy(flags[f])) return false;
  }
  if (cond.flagEquals) {
    for (const [f, v] of Object.entries(cond.flagEquals)) {
      if (flags[f] !== v) return false;
    }
  }
  if (cond.hasTraits) {
    for (const t of cond.hasTraits) if (!config.traits.includes(t)) return false;
  }
  if (cond.hasAnyTrait) {
    if (!cond.hasAnyTrait.some((t) => config.traits.includes(t))) return false;
  }
  if (cond.minWeek !== undefined && state.totalWeeks < cond.minWeek) return false;
  if (cond.minTerm !== undefined) {
    const absTerm = (state.year - 1) * 3 + state.term;
    if (absTerm < cond.minTerm) return false;
  }
  if (cond.minYear !== undefined && state.year < cond.minYear) return false;
  if (cond.maxYear !== undefined && state.year > cond.maxYear) return false;
  if (cond.leadingRouteIn) {
    if (!cond.leadingRouteIn.includes(leadingRoute(state))) return false;
  }
  if (cond.cityIn && !cond.cityIn.includes(config.city)) return false;
  if (cond.majorIn && !cond.majorIn.includes(config.major)) return false;

  return true;
}
