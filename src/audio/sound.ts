// Procedural Web Audio layer. Fully synthesised (no audio files, so nothing to
// download and zero copyright surface) and original. Kept deliberately quiet and
// consonant: short soft SFX + a low ambient pad + an optional gentle rain layer
// that fits the dusk theme. A real CC0 BGM track can later replace setPad() by
// routing a looping <audio> through musicBus; the rest of the API stays.
//
// iOS Safari blocks audible autoplay until a user gesture, so the context starts
// suspended and unlock() must run inside a real tap (AudioManager wires that up).

type PadKind = 'menu' | 'play' | 'ended' | 'none';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let unlocked = false;
let muted = false;

// live ambient voices, so we can crossfade/stop them
let pad: { gain: GainNode; stop: () => void; kind: PadKind } | null = null;
let rain: { gain: GainNode; on: boolean } | null = null;

function ensure(): boolean {
  if (ctx) return true;
  try {
    const AC: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.85;
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    musicBus.gain.value = 0.9;
    musicBus.connect(master);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.6;
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
  // a few ms of silence to fully wake the graph on iOS
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
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(m ? 0.0001 : 0.85, t + 0.18);
}

// ----------------------------------------------------------------- SFX
function blip(freqs: number[], dur: number, type: OscillatorType, gain: number): void {
  if (!ensure() || !ctx || !sfxBus || muted) return;
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
  tap: () => blip([600], 0.06, 'triangle', 0.09),
  confirm: () => blip([523.25, 784], 0.15, 'sine', 0.12),
  week: () => blip([392, 523.25, 659.25], 0.17, 'sine', 0.11),
  event: () => blip([880, 1174.7], 0.16, 'triangle', 0.09),
  ending: () => blip([523.25, 659.25, 784, 1046.5], 0.2, 'sine', 0.13),
};

// ----------------------------------------------------------------- ambient pad
const PAD_CHORDS: Record<Exclude<PadKind, 'none'>, number[]> = {
  // soft, consonant, low, a quiet bed rather than a melody
  menu: [146.83, 220, 277.18], // Dm-ish, melancholic
  play: [164.81, 246.94, 329.63], // E minor-ish, warm
  ended: [130.81, 196, 261.63], // C, resolved
};

export function setPad(kind: PadKind): void {
  if (!ensure() || !ctx || !musicBus) return;
  if (pad && pad.kind === kind) return;
  const t = ctx.currentTime;
  if (pad) {
    const old = pad;
    old.gain.gain.cancelScheduledValues(t);
    old.gain.gain.setValueAtTime(old.gain.gain.value, t);
    old.gain.gain.linearRampToValueAtTime(0.0001, t + 1.1);
    window.setTimeout(() => old.stop(), 1300);
    pad = null;
  }
  if (kind === 'none') return;

  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(0.0001, t);
  padGain.gain.linearRampToValueAtTime(0.06, t + 1.4); // very quiet bed
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  // slow breathing LFO on the pad gain
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.06;
  lfoGain.gain.value = 0.02;
  lfo.connect(lfoGain);
  lfoGain.connect(padGain.gain);
  lfo.start(t);

  const oscs = PAD_CHORDS[kind].map((f, i) => {
    const o = ctx!.createOscillator();
    o.type = i === 0 ? 'sine' : 'triangle';
    o.frequency.value = f;
    const detune = ctx!.createOscillator();
    detune.frequency.value = 0.1 + i * 0.05;
    const dg = ctx!.createGain();
    dg.gain.value = 2.5;
    detune.connect(dg);
    dg.connect(o.detune);
    detune.start(t);
    o.connect(lp);
    o.start(t);
    return { o, detune };
  });
  lp.connect(padGain);
  padGain.connect(musicBus);

  pad = {
    gain: padGain,
    kind,
    stop: () => {
      oscs.forEach(({ o, detune }) => {
        try { o.stop(); detune.stop(); } catch { /* already stopped */ }
      });
      try { lfo.stop(); } catch { /* already stopped */ }
    },
  };
}

// ----------------------------------------------------------------- rain layer
export function setRain(on: boolean): void {
  if (!ensure() || !ctx || !musicBus) return;
  if (!rain) {
    // looping filtered noise = gentle rain
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
  rain.gain.gain.setValueAtTime(rain.gain.gain.value, t);
  rain.gain.gain.linearRampToValueAtTime(on ? 0.04 : 0.0001, t + 0.8);
}
