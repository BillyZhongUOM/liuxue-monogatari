import {
  ACTIONS,
  ACTION_BY_ID,
  ENDINGS,
  EVENTS,
  TRAIT_BY_ID,
} from '../data';
import {
  ALL_STAT_KEYS,
  BASE_ACTION_POINTS,
  BASE_WEEKLY_COST,
  BUDGETS,
  CALL_NEGLECT_LIMIT,
  CITIES,
  ENGLISH_LEVELS,
  MAJORS,
  MAX_YEARS,
  RECENT_EVENT_WINDOW,
  ROUTES,
  SAVE_VERSION,
  STAT_META_BY_KEY,
  STRESS_BREAKDOWN_STREAK,
  STRESS_DANGER,
  STUDY_NEGLECT_LIMIT,
  TERMS_PER_YEAR,
  UNIVERSITY_TYPES,
  WEEKLY_DRIFT,
  WEEKS_PER_TERM,
  baseStats,
} from './constants';
import type { CreationOption } from './constants';
import { evaluateCondition, leadingRoute } from './conditions';
import { makeRng, seedFrom } from './rng';
import type {
  CharacterConfig,
  Effects,
  Ending,
  GameAction,
  GameEvent,
  GameState,
  LogEntry,
  StatKey,
  Stats,
} from './types';

// -----------------------------------------------------------------------------
// Small pure helpers
// -----------------------------------------------------------------------------
const clone = <T>(v: T): T => structuredClone(v);

function clampStat(key: StatKey, value: number): number {
  const meta = STAT_META_BY_KEY[key];
  return Math.round(Math.min(meta.max, Math.max(meta.min, value)));
}

function optionById(list: CreationOption[], id: string): CreationOption | undefined {
  return list.find((o) => o.id === id);
}

/** Apply a bundle of effects (optionally scaled) and clamp every touched stat. */
export function applyEffects(stats: Stats, effects: Effects | undefined, scale = 1): Stats {
  if (!effects) return stats;
  const next = { ...stats };
  for (const [k, v] of Object.entries(effects)) {
    const key = k as StatKey;
    next[key] = clampStat(key, next[key] + (v as number) * scale);
  }
  return next;
}

function addRouteWeights(
  scores: Record<string, number>,
  weights: Record<string, number> | undefined,
): Record<string, number> {
  if (!weights) return scores;
  const next = { ...scores };
  for (const [r, w] of Object.entries(weights)) {
    next[r] = (next[r] ?? 0) + w;
  }
  return next;
}

function traitApMod(config: CharacterConfig): number {
  return config.traits.reduce((sum, id) => sum + (TRAIT_BY_ID[id]?.apMod ?? 0), 0);
}

/** Combined trait multiplier for an action's effects, based on its tags. */
function traitTagMultiplier(config: CharacterConfig, tags: string[]): number {
  let mult = 1;
  for (const id of config.traits) {
    const mods = TRAIT_BY_ID[id]?.actionTagMods;
    if (!mods) continue;
    for (const tag of tags) {
      if (mods[tag] !== undefined) mult *= mods[tag];
    }
  }
  return mult;
}

function pushLog(state: GameState, text: string, kind: LogEntry['kind']): void {
  state.history.push({ week: state.week, term: state.term, year: state.year, text, kind });
  if (state.history.length > 200) state.history.splice(0, state.history.length - 200);
}

// -----------------------------------------------------------------------------
// Cost of living
// -----------------------------------------------------------------------------
export function weeklyCost(config: CharacterConfig): number {
  const city = optionById(CITIES, config.city);
  return Math.round(BASE_WEEKLY_COST * (city?.costMult ?? 1));
}

export function weeklyStipend(config: CharacterConfig): number {
  return optionById(BUDGETS, config.budget)?.weeklyStipend ?? 0;
}

// -----------------------------------------------------------------------------
// Action points for a fresh week
// -----------------------------------------------------------------------------
export function weeklyActionPoints(state: GameState): number {
  let ap = BASE_ACTION_POINTS + traitApMod(state.config);
  if (state.stats.energy < 20) ap -= 1;
  if (state.stats.stress > 85) ap -= 1;
  if (state.stats.health < 25) ap -= 1;
  return Math.max(1, ap);
}

// -----------------------------------------------------------------------------
// New game
// -----------------------------------------------------------------------------
export function createGame(config: CharacterConfig): GameState {
  let stats = baseStats();

  // money + english are seeded by budget / english level
  const budget = optionById(BUDGETS, config.budget);
  stats.money = budget?.startMoney ?? 1500;

  const creationGroups: (CreationOption | undefined)[] = [
    optionById(CITIES, config.city),
    optionById(UNIVERSITY_TYPES, config.universityType),
    optionById(MAJORS, config.major),
    budget,
    optionById(ENGLISH_LEVELS, config.englishLevel),
  ];
  for (const opt of creationGroups) {
    if (opt?.mods) stats = applyEffects(stats, opt.mods);
  }
  for (const id of config.traits) {
    const trait = TRAIT_BY_ID[id];
    if (trait?.startMods) stats = applyEffects(stats, trait.startMods);
  }

  const routeScores: Record<string, number> = {};
  for (const r of ROUTES) routeScores[r.id] = 0;

  const startFlags: Record<string, boolean> = {};
  for (const id of config.traits) {
    for (const f of TRAIT_BY_ID[id]?.startFlags ?? []) startFlags[f] = true;
  }

  const state: GameState = {
    version: SAVE_VERSION,
    config,
    week: 1,
    term: 1,
    year: 1,
    totalWeeks: 0,
    actionPoints: 0,
    maxActionPoints: 0,
    stats,
    flags: startFlags,
    routeScores,
    firedEvents: [],
    recentEvents: [],
    actionsThisWeek: [],
    history: [],
    unlockedEndings: [],
    phase: 'playing',
    pendingEventId: null,
    endingId: null,
    rngState: seedFrom(config.playerName + config.city + config.major, 7),
  };
  state.maxActionPoints = weeklyActionPoints(state);
  state.actionPoints = state.maxActionPoints;
  pushLog(state, `${config.playerName} 拖着两个大箱子，落地英国，留学故事开始了。`, 'milestone');
  return state;
}

// -----------------------------------------------------------------------------
// Available actions this week
// -----------------------------------------------------------------------------
export function availableActions(state: GameState): GameAction[] {
  return ACTIONS.filter((a) => evaluateCondition(a.unlock, state));
}

// -----------------------------------------------------------------------------
// Event selection
// -----------------------------------------------------------------------------
function eligibleEvents(state: GameState, pool: string, ignoreRecent: boolean): GameEvent[] {
  return EVENTS.filter((e) => {
    if ((e.pool ?? '') !== pool) return false;
    if (e.oncePerGame && state.firedEvents.includes(e.id)) return false;
    if (!ignoreRecent && state.recentEvents.includes(e.id)) return false;
    return evaluateCondition(e.cond, state);
  });
}

function pickEvent(state: GameState, pool: string): GameEvent | null {
  const rng = makeRng(state.rngState);
  let pool2 = eligibleEvents(state, pool, false);
  if (pool2.length === 0) pool2 = eligibleEvents(state, pool, true);
  if (pool2.length === 0) {
    state.rngState = rng.state;
    return null;
  }
  const total = pool2.reduce((s, e) => s + Math.max(0.0001, e.weight), 0);
  let roll = rng.next() * total;
  let chosen = pool2[pool2.length - 1];
  for (const e of pool2) {
    roll -= Math.max(0.0001, e.weight);
    if (roll <= 0) {
      chosen = e;
      break;
    }
  }
  state.rngState = rng.state;
  return chosen;
}

function rememberEvent(state: GameState, ev: GameEvent): void {
  if (ev.oncePerGame) state.firedEvents.push(ev.id);
  state.recentEvents.push(ev.id);
  if (state.recentEvents.length > RECENT_EVENT_WINDOW) {
    state.recentEvents.splice(0, state.recentEvents.length - RECENT_EVENT_WINDOW);
  }
}

// -----------------------------------------------------------------------------
// Take an action
// -----------------------------------------------------------------------------
export function takeAction(prev: GameState, actionId: string): GameState {
  if (prev.phase !== 'playing' || prev.actionPoints <= 0) return prev;
  const action = ACTION_BY_ID[actionId];
  if (!action || !evaluateCondition(action.unlock, prev)) return prev;

  const state = clone(prev);
  const repeated = state.actionsThisWeek.includes(actionId);
  const mult = traitTagMultiplier(state.config, action.tags);

  state.stats = applyEffects(state.stats, action.effects, mult);
  if (repeated && action.repeatPenalty) {
    state.stats = applyEffects(state.stats, action.repeatPenalty);
  }
  state.routeScores = addRouteWeights(state.routeScores, action.routeWeights);
  if (action.setFlags) {
    for (const [f, v] of Object.entries(action.setFlags)) state.flags[f] = v;
  }
  state.actionPoints -= action.apCost;
  state.actionsThisWeek.push(actionId);
  pushLog(state, `你${action.name}。`, 'action');

  // incidental event?
  if (action.risk) {
    const rng = makeRng(state.rngState);
    const hit = rng.chance(action.risk.chance);
    state.rngState = rng.state;
    if (hit) {
      const ev = pickEvent(state, action.risk.eventPool);
      if (ev) {
        state.pendingEventId = ev.id;
        state.phase = 'event';
        return state;
      }
    }
  }

  // crisis check can fire after any stat change
  const crisis = checkEndings(state, false);
  if (crisis) return endGame(state, crisis);

  return state;
}

// -----------------------------------------------------------------------------
// Resolve a pending event choice
// -----------------------------------------------------------------------------
export function resolveEvent(prev: GameState, choiceIndex: number): GameState {
  if (prev.phase !== 'event' || !prev.pendingEventId) return prev;
  const ev = EVENTS.find((e) => e.id === prev.pendingEventId);
  if (!ev) return prev;
  const choice = ev.choices[choiceIndex];
  if (!choice) return prev;

  const state = clone(prev);
  state.stats = applyEffects(state.stats, choice.effects);
  state.routeScores = addRouteWeights(state.routeScores, choice.routeWeights);
  if (choice.setFlags) {
    for (const [f, v] of Object.entries(choice.setFlags)) state.flags[f] = v;
  }
  rememberEvent(state, ev);
  pushLog(state, `【${ev.title}】${choice.resultText}`, 'event');
  state.pendingEventId = null;

  const crisis = checkEndings(state, false);
  if (crisis) return endGame(state, crisis);

  // After an event the player returns to the action phase (any leftover action
  // points remain spendable; a weekly event lands here with a fresh week's AP).
  state.phase = 'playing';
  return state;
}

// -----------------------------------------------------------------------------
// Advance to next week (weekly economy + rollover + ending checks)
// -----------------------------------------------------------------------------
export function advanceWeek(prev: GameState): GameState {
  if (prev.phase !== 'playing') return prev;
  const state = clone(prev);

  // 0. difficulty: neglect counters. Stored as numeric flags (no GameState schema
  // change => old saves still load; a missing flag reads as 0). Computed from the
  // week that just ended (prev.actionsThisWeek) before it is reset in step 3.
  const studiedThisWeek = prev.actionsThisWeek.some((id) =>
    (ACTION_BY_ID[id]?.tags ?? []).includes('study'),
  );
  const calledHomeThisWeek = prev.actionsThisWeek.includes('video_home');
  const weeksSinceStudy = studiedThisWeek ? 0 : Number(state.flags.weeksSinceStudy ?? 0) + 1;
  const weeksSinceCall = calledHomeThisWeek ? 0 : Number(state.flags.weeksSinceCall ?? 0) + 1;
  state.flags.weeksSinceStudy = weeksSinceStudy;
  state.flags.weeksSinceCall = weeksSinceCall;

  // 断供: a month with no word home and the family stops the stipend; calling home
  // mends it. One-shot, restorable.
  if (calledHomeThisWeek && state.flags.family_cutoff) {
    state.flags.family_cutoff = false;
    pushLog(state, '你给家里打了通电话报平安，爸妈嘴上念叨，生活费又照常打了过来。', 'milestone');
  } else if (weeksSinceCall >= CALL_NEGLECT_LIMIT && !state.flags.family_cutoff) {
    state.flags.family_cutoff = true;
    pushLog(state, '你已经一个多月没给家里打过电话，这周的生活费没有到账，爸妈在用沉默问你还好不好。', 'milestone');
  }

  // 1. weekly economy (no stipend while the family has cut you off)
  const cost = weeklyCost(state.config);
  const stipend = state.flags.family_cutoff ? 0 : weeklyStipend(state.config);
  state.stats = applyEffects(state.stats, { money: stipend - cost });
  state.stats = applyEffects(state.stats, WEEKLY_DRIFT);

  // stress streak is read AFTER the weekly drift settles this week's stress
  const stressStreak = state.stats.stress > STRESS_DANGER ? Number(state.flags.stressStreak ?? 0) + 1 : 0;
  state.flags.stressStreak = stressStreak;

  // 2. advance the calendar
  state.totalWeeks += 1;
  state.week += 1;
  if (state.week > WEEKS_PER_TERM) {
    state.week = 1;
    state.term += 1;
    termEndAssessment(state);
    if (state.term > TERMS_PER_YEAR) {
      state.term = 1;
      state.year += 1;
    }
  }

  // 3. reset the week's turn economy
  state.actionsThisWeek = [];
  state.maxActionPoints = weeklyActionPoints(state);
  state.actionPoints = state.maxActionPoints;

  // 3b. difficulty hard-fails (a warning lands the week before each). Triggered
  // directly so they do not depend on the cond DSL.
  if (weeksSinceStudy === STUDY_NEGLECT_LIMIT - 1) {
    pushLog(state, '学院发来一封措辞客气但分量很重的邮件：系统显示你已连续几周没有任何出勤或学习记录，请尽快回到正轨，否则将影响你的注册状态。', 'milestone');
  }
  if (weeksSinceStudy >= STUDY_NEGLECT_LIMIT) {
    return endGame(state, endingById('ending_dropout'));
  }
  if (stressStreak === STRESS_BREAKDOWN_STREAK - 1) {
    pushLog(state, '你已经连着好几周高压运转，睡不好、吃不香、一点小事就想发火，身体在拉警报了。', 'milestone');
  }
  if (stressStreak >= STRESS_BREAKDOWN_STREAK) {
    return endGame(state, endingById('ending_breakdown'));
  }

  // 4. finale?
  if (state.year > MAX_YEARS) {
    const finale = checkEndings(state, true);
    return endGame(state, finale ?? fallbackEnding());
  }

  // 5. crisis check
  const crisis = checkEndings(state, false);
  if (crisis) return endGame(state, crisis);

  // 6. weekly summary + maybe a general event next (kept qualitative, no明牌 numbers)
  pushLog(state, `第 ${state.year} 年 第 ${state.term} 学期 第 ${state.week} 周。家里照常打了生活费，房租水电也照常扣走。`, 'weekly');

  const rng = makeRng(state.rngState);
  const willFire = rng.chance(0.62);
  state.rngState = rng.state;
  if (willFire) {
    const ev = pickEvent(state, '');
    state.pendingEventId = ev ? ev.id : null;
  } else {
    state.pendingEventId = null;
  }
  state.phase = 'weekly';
  return state;
}

/** Transition off the weekly-summary screen into the next event or the play phase. */
export function continueFromWeekly(prev: GameState): GameState {
  if (prev.phase !== 'weekly') return prev;
  const state = clone(prev);
  if (state.pendingEventId) {
    state.phase = 'event';
  } else {
    state.phase = 'playing';
  }
  return state;
}

function termEndAssessment(state: GameState): void {
  // light end-of-term beat; deeper content can hang events off the milestone flag
  const grade = state.stats.gpa >= 70 ? '稳稳走在 Distinction 边缘' : state.stats.gpa >= 50 ? '总算稳稳及格' : '在挂科边缘晃悠';
  pushLog(state, `学期结束，成绩单出来了，你${grade}。`, 'milestone');
  state.flags[`term_done_${(state.year - 1) * TERMS_PER_YEAR + (state.term - 1)}`] = true;
}

// -----------------------------------------------------------------------------
// Endings
// -----------------------------------------------------------------------------
/** Returns the highest-priority satisfied ending, or null. */
export function checkEndings(state: GameState, finale: boolean): Ending | null {
  const pool = ENDINGS.filter((e) => (finale ? true : e.crisis === true));
  const sorted = [...pool].sort((a, b) => b.priority - a.priority);
  for (const e of sorted) {
    if (evaluateCondition(e.cond, state)) return e;
  }
  return null;
}

function fallbackEnding(): Ending {
  return (
    ENDINGS.find((e) => e.id === 'ending_ordinary') ?? {
      id: 'ending_ordinary',
      title: '平凡毕业',
      desc: '没有惊天动地，但你走完了这一年。',
      quip: '普通，也是一种了不起。',
      tone: 'mixed',
      priority: -999,
      cond: {},
    }
  );
}

/** Look up an ending by id (for difficulty fails triggered outside the cond DSL). */
function endingById(id: string): Ending {
  return ENDINGS.find((e) => e.id === id) ?? fallbackEnding();
}

function endGame(state: GameState, ending: Ending): GameState {
  state.phase = 'ended';
  state.endingId = ending.id;
  if (!state.unlockedEndings.includes(ending.id)) state.unlockedEndings.push(ending.id);
  pushLog(state, `结局：${ending.title}`, 'milestone');
  return state;
}

// -----------------------------------------------------------------------------
// Derived/read helpers for the UI
// -----------------------------------------------------------------------------
export function currentLeadingRoute(state: GameState): string {
  return leadingRoute(state);
}

export function totalWeeksInGame(): number {
  return MAX_YEARS * TERMS_PER_YEAR * WEEKS_PER_TERM;
}

export function progressFraction(state: GameState): number {
  const done = (state.year - 1) * TERMS_PER_YEAR * WEEKS_PER_TERM + (state.term - 1) * WEEKS_PER_TERM + (state.week - 1);
  return Math.min(1, done / totalWeeksInGame());
}

export { ALL_STAT_KEYS };
