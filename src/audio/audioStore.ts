import { create } from 'zustand';
import { setMuted } from './sound';

const MUTE_KEY = 'liuxue-monogatari/muted/v1';

function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

interface AudioStore {
  muted: boolean;
  toggleMuted: () => void;
}

export const useAudio = create<AudioStore>((set, get) => ({
  muted: loadMuted(),
  toggleMuted: () => {
    const next = !get().muted;
    set({ muted: next });
    setMuted(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? '1' : '0');
    } catch {
      /* storage may be unavailable */
    }
  },
}));
