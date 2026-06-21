import { create } from 'zustand';
import {
  SAVE_KEY,
  SAVE_VERSION,
  advanceWeek,
  continueFromWeekly,
  createGame,
  resolveEvent,
  takeAction,
} from './game';
import type { CharacterConfig, GameState } from './game';

const COLLECTION_KEY = 'liuxue-monogatari/endings/v1';

function persist(s: GameState | null): void {
  try {
    if (s && s.phase !== 'ended') localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    else localStorage.removeItem(SAVE_KEY);
  } catch {
    /* storage may be unavailable (private mode); game still runs in-memory */
  }
}

function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    if (!s || s.version !== SAVE_VERSION || s.phase === 'ended') return null;
    return s;
  } catch {
    return null;
  }
}

function loadCollection(): string[] {
  try {
    return JSON.parse(localStorage.getItem(COLLECTION_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function recordEnding(id: string | null | undefined): string[] {
  const seen = loadCollection();
  if (id && !seen.includes(id)) {
    seen.push(id);
    try {
      localStorage.setItem(COLLECTION_KEY, JSON.stringify(seen));
    } catch {
      /* ignore */
    }
  }
  return seen;
}

interface Store {
  state: GameState | null;
  collection: string[];
  hydrated: boolean;
  hydrate: () => void;
  start: (config: CharacterConfig) => void;
  act: (id: string) => void;
  resolve: (choiceIndex: number) => void;
  advance: () => void;
  continueWeekly: () => void;
  resume: () => void;
  toMenu: () => void;
  hasSave: () => boolean;
}

function commit(set: (p: Partial<Store>) => void, next: GameState): void {
  persist(next);
  if (next.phase === 'ended') {
    const collection = recordEnding(next.endingId);
    set({ state: next, collection });
  } else {
    set({ state: next });
  }
}

export const useGame = create<Store>((set, get) => ({
  state: null,
  collection: [],
  hydrated: false,

  hydrate() {
    if (get().hydrated) return;
    set({ state: loadSave(), collection: loadCollection(), hydrated: true });
  },

  start(config) {
    commit(set, createGame(config));
  },

  act(id) {
    const s = get().state;
    if (!s) return;
    commit(set, takeAction(s, id));
  },

  resolve(choiceIndex) {
    const s = get().state;
    if (!s) return;
    commit(set, resolveEvent(s, choiceIndex));
  },

  advance() {
    const s = get().state;
    if (!s) return;
    commit(set, advanceWeek(s));
  },

  continueWeekly() {
    const s = get().state;
    if (!s) return;
    commit(set, continueFromWeekly(s));
  },

  resume() {
    set({ state: loadSave() });
  },

  toMenu() {
    // keep the autosave; just drop back to the menu (in-memory state cleared)
    set({ state: null });
  },

  hasSave() {
    return loadSave() != null;
  },
}));
