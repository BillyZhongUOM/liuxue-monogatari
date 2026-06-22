import { create } from 'zustand';
import { setMusicVolume, setMuted, setSfxVolume } from './sound';

const MUTE_KEY = 'liuxue-monogatari/muted/v1';
const MUSIC_KEY = 'liuxue-monogatari/musicVol/v1';
const SFX_KEY = 'liuxue-monogatari/sfxVol/v1';

function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function loadVol(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const v = Number(raw);
    return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage may be unavailable */
  }
}

interface AudioStore {
  muted: boolean;
  musicVol: number; // 0..1
  sfxVol: number; // 0..1
  toggleMuted: () => void;
  setMusicVol: (v: number) => void;
  setSfxVol: (v: number) => void;
}

const initialMusic = loadVol(MUSIC_KEY, 0.8);
const initialSfx = loadVol(SFX_KEY, 0.9);
// Seed the audio engine module vars with persisted values so they apply the
// moment the context is unlocked (the engine reads these in ensure()).
setMusicVolume(initialMusic);
setSfxVolume(initialSfx);

export const useAudio = create<AudioStore>((set, get) => ({
  muted: loadMuted(),
  musicVol: initialMusic,
  sfxVol: initialSfx,
  toggleMuted: () => {
    const next = !get().muted;
    set({ muted: next });
    setMuted(next);
    save(MUTE_KEY, next ? '1' : '0');
  },
  setMusicVol: (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    set({ musicVol: clamped });
    setMusicVolume(clamped);
    save(MUSIC_KEY, String(clamped));
  },
  setSfxVol: (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    set({ sfxVol: clamped });
    setSfxVolume(clamped);
    save(SFX_KEY, String(clamped));
  },
}));
