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

export const ACTIONS: GameAction[] = merge(baseActionsWithLoc, genActions as unknown as GameAction[]);
// Story beats join the hand-authored pool (they win over any generated id clash).
export const EVENTS: GameEvent[] = merge([...STORY_EVENTS, ...STORY_FLAVOR, ...BASE_EVENTS], genEvents as unknown as GameEvent[]);
export const TRAITS: Trait[] = merge(BASE_TRAITS, genTraits as unknown as Trait[]);
export const ENDINGS: Ending[] = merge(BASE_ENDINGS, genEndings as unknown as Ending[]);

export const ACTION_BY_ID = byId(ACTIONS);
export const EVENT_BY_ID = byId(EVENTS);
export const TRAIT_BY_ID = byId(TRAITS);
export const ENDING_BY_ID = byId(ENDINGS);

export type { GameAction };
