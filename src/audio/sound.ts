// Web Audio layer. BGM = real generated songs (Lyria, one MP3 per city) routed
// through a music bus and crossfaded on change; UI SFX + a rain bed are
// synthesised on top. Lazy: only the current track downloads. iOS Safari blocks
// audible autoplay until a user gesture, so the context starts suspended and
// unlock() must run inside a real tap (AudioManager wires that up).
import manifest from '../assets/generated/manifest.json';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let unlocked = false;
let muted = false;
let musicVol = 0.8; // 0..1 user music volume
let sfxVol = 0.9; // 0..1 user sfx volume
const MUSIC_CEIL = 0.92; // headroom so 100% does not clip
const SFX_CEIL = 0.85;

function ensure(): boolean {
  if (ctx) return true;
  try {
    const AC: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0.0001 : 0.9;
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    musicBus.gain.value = musicVol * MUSIC_CEIL;
    musicBus.connect(master);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = sfxVol * SFX_CEIL;
    sfxBus.connect(master);
    return true;
  } catch {
    return false;
  }
}

export function isUnlocked(): boolean {
  return unlocked;
}

export function unlock(): void {
  if (!ensure() || !ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();
  const b = ctx.createBufferSource();
  b.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  b.connect(master!);
  b.start(0);
  unlocked = true;
}

export function setMuted(m: boolean): void {
  muted = m;
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t);
  master.gain.linearRampToValueAtTime(m ? 0.0001 : 0.9, t + 0.18);
}

// Independent music + SFX volume (0..1). The module vars update even before the
// context exists, so persisted values from the store take effect once ensure()
// runs. A short ramp keeps music changes smooth; SFX is set instantly.
export function setMusicVolume(v: number): void {
  musicVol = Math.max(0, Math.min(1, v));
  if (!ctx || !musicBus) return;
  const t = ctx.currentTime;
  musicBus.gain.cancelScheduledValues(t);
  musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), t);
  musicBus.gain.linearRampToValueAtTime(Math.max(0.0001, musicVol * MUSIC_CEIL), t + 0.12);
}

export function setSfxVolume(v: number): void {
  sfxVol = Math.max(0, Math.min(1, v));
  if (!ctx || !sfxBus) return;
  sfxBus.gain.value = Math.max(0.0001, sfxVol * SFX_CEIL);
}

// ----------------------------------------------------------------- SFX
function blip(freqs: number[], dur: number, type: OscillatorType, gain: number): void {
  if (!ensure() || !ctx || !sfxBus) return;
  const t0 = ctx.currentTime + 0.001;
  const step = dur * 0.6;
  freqs.forEach((f, i) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = type;
    o.frequency.value = f;
    const s = t0 + i * step;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.linearRampToValueAtTime(gain, s + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    o.connect(g);
    g.connect(sfxBus!);
    o.start(s);
    o.stop(s + dur + 0.03);
  });
}

export const sfx = {
  tap: () => blip([600], 0.06, 'triangle', 0.08),
  confirm: () => blip([523.25, 784], 0.15, 'sine', 0.12),
  week: () => blip([392, 523.25, 659.25], 0.17, 'sine', 0.11),
  event: () => blip([784, 1046.5, 1318.5], 0.18, 'triangle', 0.12),
  reveal: () => blip([659.25, 880], 0.16, 'sine', 0.1),
  ending: () => blip([523.25, 659.25, 784, 1046.5], 0.22, 'sine', 0.14),
};

/** A short audible blip so the user can hear the SFX level while adjusting it. */
export function previewSfx(): void {
  blip([660, 880], 0.1, 'triangle', 0.12);
}

// ----------------------------------------------------------------- BGM (per-city)
// Real generated songs (Lyria, one MP3 per city) routed through musicBus. Lazy:
// only the current track downloads; on change we crossfade and retire the old
// element. Track keys = city ids plus 'menu' / 'ended'. Falls back to silence if
// a track is not registered yet (404-proof).
const REGISTERED = new Set<string>(
  ((manifest as { assets?: { id: string }[] }).assets ?? []).map((a) => a.id),
);

function bgmUrl(key: string): string | null {
  return REGISTERED.has(`bgm-${key}`)
    ? `${import.meta.env.BASE_URL}assets/generated/bgm-${key}.mp3`
    : null;
}

interface Voice { key: string; el: HTMLAudioElement; node: MediaElementAudioSourceNode; gain: GainNode }
let current: Voice | null = null;

function retire(v: Voice, fade: number): void {
  if (!ctx) return;
  const t = ctx.currentTime;
  v.gain.gain.cancelScheduledValues(t);
  v.gain.gain.setValueAtTime(Math.max(0.0001, v.gain.gain.value), t);
  v.gain.gain.linearRampToValueAtTime(0.0001, t + fade);
  window.setTimeout(() => {
    try { v.el.pause(); v.node.disconnect(); v.gain.disconnect(); } catch { /* already gone */ }
  }, fade * 1000 + 150);
}

export function setTrack(kind: string): void {
  if (!ensure() || !ctx || !musicBus) return;
  if (current && current.key === kind) return;
  const url = kind === 'none' ? null : bgmUrl(kind);

  if (current) { retire(current, 1.0); current = null; }
  if (!url) return;

  const el = new Audio();
  el.src = url;
  el.loop = true;
  el.preload = 'auto';
  let node: MediaElementAudioSourceNode;
  try {
    node = ctx.createMediaElementSource(el);
  } catch {
    return; // element already wired (should not happen with a fresh element)
  }
  const gain = ctx.createGain();
  gain.gain.value = 0.0001;
  node.connect(gain);
  gain.connect(musicBus);
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.78, t + 1.0);
  void el.play().catch(() => { /* starts once the context is unlocked */ });
  current = { key: kind, el, node, gain };
}

// ----------------------------------------------------------------- rain layer
let rain: { gain: GainNode; on: boolean } | null = null;

export function setRain(on: boolean): void {
  if (!ensure() || !ctx || !musicBus) return;
  if (!rain) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1600;
    bp.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    src.connect(bp);
    bp.connect(g);
    g.connect(musicBus);
    src.start(0);
    rain = { gain: g, on: false };
  }
  if (rain.on === on) return;
  rain.on = on;
  const t = ctx.currentTime;
  rain.gain.gain.cancelScheduledValues(t);
  rain.gain.gain.setValueAtTime(Math.max(0.0001, rain.gain.gain.value), t);
  rain.gain.gain.linearRampToValueAtTime(on ? 0.05 : 0.0001, t + 0.8);
}
