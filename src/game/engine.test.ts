import { describe, expect, it } from 'vitest';
import {
  ALL_STAT_KEYS,
  CITIES,
  CITY_SCHOOLS,
  STAT_META_BY_KEY,
  UNIVERSITY_TYPES,
  advanceWeek,
  availableActions,
  continueFromWeekly,
  createGame,
  resolveEvent,
  takeAction,
} from './index';
import type { CharacterConfig, GameState, StatKey } from './types';

function cfg(over: Partial<CharacterConfig> = {}): CharacterConfig {
  return {
    playerName: '测试同学',
    city: 'manchester',
    universityType: 'redbrick',
    major: 'cs',
    budget: 'normal',
    englishLevel: 'seventy',
    traits: ['shengqian', 'leguan'],
    ...over,
  };
}

function assertStatsSane(state: GameState): void {
  for (const k of ALL_STAT_KEYS) {
    const v = state.stats[k as StatKey];
    const meta = STAT_META_BY_KEY[k as StatKey];
    expect(Number.isFinite(v), `${k} finite`).toBe(true);
    expect(v, `${k} >= min`).toBeGreaterThanOrEqual(meta.min);
    expect(v, `${k} <= max`).toBeLessThanOrEqual(meta.max);
  }
}

/** Deterministically drive a game to completion. Strategy picks an action index. */
function playToEnd(
  config: CharacterConfig,
  pickAction: (state: GameState) => number,
  choicePick = 0,
  maxSteps = 5000,
): GameState {
  let state = createGame(config);
  let steps = 0;
  while (state.phase !== 'ended' && steps++ < maxSteps) {
    assertStatsSane(state);
    if (state.phase === 'playing') {
      if (state.actionPoints > 0) {
        const actions = availableActions(state);
        const idx = Math.max(0, Math.min(actions.length - 1, pickAction(state)));
        state = takeAction(state, actions[idx].id);
      } else {
        state = advanceWeek(state);
      }
    } else if (state.phase === 'weekly') {
      state = continueFromWeekly(state);
    } else if (state.phase === 'event') {
      const ev = state.pendingEventId;
      const before = state;
      state = resolveEvent(state, choicePick);
      // resolveEvent must always clear the pending event
      expect(state.pendingEventId == null || state.pendingEventId !== ev).toBe(true);
      if (state === before) throw new Error('event did not resolve');
    }
  }
  return state;
}

describe('createGame', () => {
  it('produces sane starting stats and action points', () => {
    const s = createGame(cfg());
    assertStatsSane(s);
    expect(s.actionPoints).toBeGreaterThan(0);
    expect(s.actionPoints).toBe(s.maxActionPoints);
    expect(s.phase).toBe('playing');
    expect(s.stats.money).toBeGreaterThan(0);
  });

  it('applies trait and option modifiers', () => {
    const sFluent = createGame(cfg({ englishLevel: 'fluent' }));
    const sLow = createGame(cfg({ englishLevel: 'just_passed' }));
    expect(sFluent.stats.english).toBeGreaterThan(sLow.stats.english);
  });

  it('夜猫子 grants an extra action point', () => {
    const base = createGame(cfg({ traits: [] }));
    const owl = createGame(cfg({ traits: ['yemao'] }));
    expect(owl.maxActionPoints).toBe(base.maxActionPoints + 1);
  });
});

describe('takeAction', () => {
  it('spends an action point and applies effects', () => {
    const s0 = createGame(cfg());
    const before = s0.stats.gpa;
    const s1 = takeAction(s0, 'study_library');
    expect(s1.actionPoints).toBe(s0.actionPoints - 1);
    expect(s1.stats.gpa).toBeGreaterThan(before);
    expect(s1).not.toBe(s0); // immutable
  });

  it('is a no-op when out of action points', () => {
    let s = createGame(cfg());
    while (s.actionPoints > 0 && s.phase === 'playing') {
      s = takeAction(s, 'rest');
    }
    const blocked = takeAction(s, 'rest');
    expect(blocked).toBe(s);
  });
});

describe('full playthroughs', () => {
  it('a scholar strategy reaches an ending with sane stats', () => {
    const end = playToEnd(cfg(), (s) => {
      const actions = availableActions(s);
      const study = actions.findIndex((a) => a.id === 'write_essay');
      return study >= 0 && s.stats.energy > 30 ? study : actions.findIndex((a) => a.id === 'rest');
    });
    expect(end.phase).toBe('ended');
    expect(end.endingId).toBeTruthy();
    assertStatsSane(end);
  });

  it('a reckless all-essay strategy still terminates (no softlock)', () => {
    const end = playToEnd(cfg({ budget: 'tight' }), (s) => {
      const actions = availableActions(s);
      const i = actions.findIndex((a) => a.id === 'write_essay');
      return i >= 0 ? i : 0;
    });
    expect(end.phase).toBe('ended');
    expect(end.endingId).toBeTruthy();
  });

  it('a balanced survivor run can graduate', () => {
    const rotation = ['attend_lecture', 'cook', 'rest', 'study_library', 'society'];
    let n = 0;
    const end = playToEnd(cfg(), (s) => {
      const actions = availableActions(s);
      const want = rotation[n++ % rotation.length];
      const i = actions.findIndex((a) => a.id === want);
      return i >= 0 ? i : 0;
    });
    expect(end.phase).toBe('ended');
    expect(['ending_survivor', 'ending_distinction', 'ending_social_star', 'ending_return_home', 'ending_ordinary', 'ending_job_offer', 'ending_phd']).toContain(
      end.endingId,
    );
  });
});

describe('city / school linkage', () => {
  const schoolIds = new Set(UNIVERSITY_TYPES.map((u) => u.id));

  it('every city maps only to real, existing schools', () => {
    for (const [city, schools] of Object.entries(CITY_SCHOOLS)) {
      expect(CITIES.some((c) => c.id === city), `${city} is a real city`).toBe(true);
      expect(schools.length, `${city} has at least one school`).toBeGreaterThan(0);
      for (const s of schools) expect(schoolIds.has(s), `${city} -> ${s} exists`).toBe(true);
    }
  });

  it('every city can roll a school', () => {
    for (const c of CITIES) {
      expect((CITY_SCHOOLS[c.id] ?? []).length, `${c.id} rollable`).toBeGreaterThan(0);
    }
  });

  it('G5 only in London, 牛剑 only in 牛津/剑桥 (and forced there)', () => {
    for (const [city, schools] of Object.entries(CITY_SCHOOLS)) {
      if (schools.includes('g5')) expect(city).toBe('london');
      if (schools.includes('oxbridge')) expect(['oxford', 'cambridge']).toContain(city);
      if (city === 'oxford' || city === 'cambridge') expect(schools).toEqual(['oxbridge']);
    }
    // 曼城 (and any non-London, non-Oxbridge city) must NOT offer a dream school
    expect(CITY_SCHOOLS.manchester).not.toContain('g5');
    expect(CITY_SCHOOLS.manchester).not.toContain('oxbridge');
  });
});

describe('determinism', () => {
  it('same config + same choices yields the same ending', () => {
    const strat = (s: GameState) => (availableActions(s).findIndex((a) => a.id === 'study_library'));
    const a = playToEnd(cfg(), strat);
    const b = playToEnd(cfg(), strat);
    expect(a.endingId).toBe(b.endingId);
    expect(a.totalWeeks).toBe(b.totalWeeks);
  });
});
