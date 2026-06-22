import { useEffect, useRef } from 'react';
import { useGame } from '../store';
import { useAudio } from './audioStore';
import { isUnlocked, setMuted, setRain, setTrack, sfx, unlock } from './sound';

type Ambience = 'menu' | 'play' | 'ended';

function ambienceFor(state: ReturnType<typeof useGame.getState>['state']): Ambience {
  if (!state) return 'menu';
  if (state.phase === 'ended') return 'ended';
  return 'play';
}

function applyAmbience(a: Ambience, city: string): void {
  if (a === 'ended') {
    setTrack('ended');
    setRain(false);
  } else if (a === 'menu') {
    setTrack('menu');
    setRain(true);
  } else {
    // play: each city gets its own chiptune theme; the dusk rain bed plays too
    // (MapScene mutes rain for the town zone)
    setTrack(city);
    setRain(true);
  }
}

// Headless audio glue: unlocks the context on the first gesture, plays soft SFX
// on button taps + state transitions, and crossfades the ambient bed by phase.
// Reads game state read-only; never dispatches. The engine never learns about it.
export function AudioManager() {
  const state = useGame((s) => s.state);
  const muted = useAudio((s) => s.muted);
  const prev = useRef({ totalWeeks: -1, phase: '', ambience: '' as string, ended: false });

  // one-time unlock on the first real user gesture
  useEffect(() => {
    function onFirstGesture() {
      unlock();
      setMuted(useAudio.getState().muted);
      const s = useGame.getState().state;
      applyAmbience(ambienceFor(s), s?.config.city ?? 'manchester');
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
    }
    window.addEventListener('pointerdown', onFirstGesture, { once: false });
    window.addEventListener('keydown', onFirstGesture, { once: false });
    return () => {
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
    };
  }, []);

  // soft tap on any pixel button (delegated, so no per-button wiring)
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = e.target as HTMLElement | null;
      if (el && el.closest('.pixel-btn, .zone-tab, .map-node, .opt, .gender-btn')) sfx.tap();
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // keep mute in sync if toggled
  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  // ambient + transition SFX
  useEffect(() => {
    if (!isUnlocked()) return;
    const a = ambienceFor(state);
    if (a !== prev.current.ambience) {
      applyAmbience(a, state?.config.city ?? 'manchester');
      prev.current.ambience = a;
    }
    if (state) {
      if (prev.current.totalWeeks >= 0 && state.totalWeeks > prev.current.totalWeeks) sfx.week();
      if (state.phase === 'event' && prev.current.phase !== 'event') sfx.event();
      if (state.phase === 'ended' && !prev.current.ended) sfx.ending();
      prev.current.totalWeeks = state.totalWeeks;
      prev.current.phase = state.phase;
      prev.current.ended = state.phase === 'ended';
    } else {
      prev.current.totalWeeks = -1;
      prev.current.phase = '';
      prev.current.ended = false;
    }
  }, [state]);

  return null;
}
