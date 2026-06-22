// Content registry. The engine imports game content only through this barrel.
//
// Static, hand-authored content lives in the sibling .ts files. Machine-authored
// content (from the content-expansion workflow) lives in generated/*.json and is
// merged in here, with id de-duplication so a hand-authored id always wins.
import type { Ending, GameAction, GameEvent, Trait } from '../game/types';
import { ACTIONS as BASE_ACTIONS } from './actions';
import { ENDINGS as BASE_ENDINGS } from './endings';
import { EVENTS as BASE_EVENTS } from './events';
import { STORY_EVENTS, STORY_FLAVOR } from './story';
import { STORY_CITY, STORY_MAJOR } from './story_city';
import { STORY_MEME } from './story_meme';
import { STORY_BRANCH } from './story_branch';
import { STORY_INCIDENTS } from './story_incidents';
import { TRAITS as BASE_TRAITS } from './traits';
import genActions from './generated/actions.json';
import genEndings from './generated/endings.json';
import genEvents from './generated/events.json';
import genTraits from './generated/traits.json';

// Map node each of the original 17 actions is performed at (the expanded set in
// generated/actions.json already carries its own `location`).
const BASE_ACTION_LOCATIONS: Record<string, string> = {
  study_library: 'library', write_essay: 'library', group_meeting: 'lecture', attend_lecture: 'lecture',
  office_hour: 'lecture', part_time: 'work', cook: 'dorm', groceries: 'market', society: 'society',
  video_home: 'dorm', rest: 'dorm', gym: 'gym', explore_city: 'town', polish_cv: 'career',
  apply_internship: 'career', career_fair: 'career', visa_docs: 'dorm',
};

// Every action can trigger a secondary "incident" event from a themed pool (the
// engine's action.risk mechanism). Actions that already declare a risk keep it;
// any without one get a pool here, precise by id, else by tag. Pure data: the
// engine is unchanged.
const RISK_POOL_BY_ID: Record<string, string> = {
  study_library: 'study_incidents', attend_lecture: 'study_incidents', office_hour: 'study_incidents',
  cook: 'cook_incidents', groceries: 'shop_incidents', video_home: 'home_incidents',
  gym: 'gym_incidents', explore_city: 'explore_incidents', rest: 'life_incidents',
  polish_cv: 'jobhunt_incidents', visa_docs: 'admin_incidents',
};
const RISK_POOL_BY_TAG: Record<string, string> = {
  study: 'study_incidents', work: 'part_time_incidents', career: 'jobhunt_incidents',
  cook: 'cook_incidents', social: 'social_incidents', explore: 'explore_incidents',
  admin: 'admin_incidents', life: 'life_incidents', rest: 'life_incidents',
  spend: 'spending_incidents', romance: 'romance_incidents', travel: 'travel_incidents',
  health: 'life_incidents',
};
function withRisk(a: GameAction): GameAction {
  if (a.risk) return a;
  const byTag = (a.tags ?? []).map((t) => RISK_POOL_BY_TAG[t]).find(Boolean);
  const pool = RISK_POOL_BY_ID[a.id] ?? byTag ?? 'life_incidents';
  return { ...a, risk: { chance: 0.25, eventPool: pool } };
}

function merge<T extends { id: string }>(base: T[], extra: T[]): T[] {
  const seen = new Set(base.map((x) => x.id));
  const add = extra.filter((x) => x && typeof x.id === 'string' && !seen.has(x.id));
  for (const x of add) seen.add(x.id);
  return [...base, ...add];
}

function byId<T extends { id: string }>(arr: T[]): Record<string, T> {
  return Object.fromEntries(arr.map((x) => [x.id, x])) as Record<string, T>;
}

const baseActionsWithLoc: GameAction[] = BASE_ACTIONS.map((a) =>
  a.location ? a : { ...a, location: BASE_ACTION_LOCATIONS[a.id] ?? 'town' },
);

export const ACTIONS: GameAction[] = merge(baseActionsWithLoc, genActions as unknown as GameAction[]).map(withRisk);
// Story beats join the hand-authored pool (they win over any generated id clash).
export const EVENTS: GameEvent[] = merge(
  [...STORY_EVENTS, ...STORY_FLAVOR, ...STORY_CITY, ...STORY_MAJOR, ...STORY_MEME, ...STORY_BRANCH, ...STORY_INCIDENTS, ...BASE_EVENTS],
  genEvents as unknown as GameEvent[],
);
export const TRAITS: Trait[] = merge(BASE_TRAITS, genTraits as unknown as Trait[]);
export const ENDINGS: Ending[] = merge(BASE_ENDINGS, genEndings as unknown as Ending[]);

export const ACTION_BY_ID = byId(ACTIONS);
export const EVENT_BY_ID = byId(EVENTS);
export const TRAIT_BY_ID = byId(TRAITS);
export const ENDING_BY_ID = byId(ENDINGS);

export type { GameAction };
