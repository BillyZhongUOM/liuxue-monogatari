// Public surface of the game engine. UI and tests import from here.
export type {
  ActionRisk,
  CharacterConfig,
  Choice,
  Condition,
  Effects,
  Ending,
  FlagValue,
  GameAction,
  GameEvent,
  GamePhase,
  GameState,
  LogEntry,
  StatKey,
  StatMeta,
  Stats,
  Trait,
} from './types';

export {
  createGame,
  availableActions,
  takeAction,
  resolveEvent,
  advanceWeek,
  continueFromWeekly,
  checkEndings,
  applyEffects,
  weeklyCost,
  weeklyStipend,
  weeklyActionPoints,
  currentLeadingRoute,
  progressFraction,
  totalWeeksInGame,
} from './engine';

export { evaluateCondition, leadingRoute } from './conditions';
export { makeRng, seedFrom } from './rng';

export {
  ALL_STAT_KEYS,
  BASE_ACTION_POINTS,
  BUDGETS,
  CITIES,
  CITY_SCHOOLS,
  ENGLISH_LEVELS,
  MAJORS,
  MAX_YEARS,
  ROUTES,
  ROUTE_BY_ID,
  SAVE_KEY,
  SAVE_VERSION,
  STAT_METAS,
  STAT_META_BY_KEY,
  TERMS_PER_YEAR,
  TIER_LABEL,
  UNIVERSITY_TYPES,
  WEEKS_PER_TERM,
} from './constants';
export type { CreationOption, RouteDef } from './constants';

export { ACTIONS, ACTION_BY_ID, ENDINGS, ENDING_BY_ID, EVENTS, EVENT_BY_ID, TRAITS, TRAIT_BY_ID } from '../data';
