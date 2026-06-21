// Procedural Web Audio layer. Fully synthesised (no audio files, so nothing to
// download and zero copyright surface) and original. A small generative engine
// plays a gentle looping chord progression with a higher-register arpeggio
// (which is what actually carries on phone speakers) plus a soft bass + pad and
// an optional rain layer. Soft UI SFX on top. A real CC0 track could later route
// a looping <audio> through musicBus instead, but this is audible on its own.
//
// iOS Safari blocks audible autoplay until a user gesture, so the context starts
// suspended and unlock() must run inside a real tap (AudioManager wires that up).

type TrackKind = 'menu' | 'play' | 'ended' | 'none';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let unlocked = false;
let muted = false;

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

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
    musicBus.gain.value = 0.85;
    musicBus.connect(master);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.7;
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

// ----------------------------------------------------------------- generative BGM
// Each chord: pad midi notes (low bed), bass root midi, arp midi notes (the
// audible melody, one per beat). All progressions are consonant by construction.
interface Chord { pad: number[]; bass: number; arp: number[] }
interface Track { barDur: number; prog: Chord[] }

const TRACKS: Record<Exclude<TrackKind, 'none'>, Track> = {
  // warm, gentle lo-fi: Em - C - G - D, an arpeggio per bar
  play: {
    barDur: 2.0,
    prog: [
      { pad: [52, 55, 59], bass: 40, arp: [64, 67, 71, 67] },
      { pad: [48, 52, 55], bass: 36, arp: [60, 64, 67, 64] },
      { pad: [55, 59, 62], bass: 43, arp: [67, 71, 74, 71] },
      { pad: [50, 54, 57], bass: 38, arp: [62, 66, 69, 66] },
    ],
  },
  // sparser, melancholic dusk: Am - F - C - G
  menu: {
    barDur: 2.6,
    prog: [
      { pad: [45, 48, 52], bass: 33, arp: [69, 72, 76, 72] },
      { pad: [41, 45, 48], bass: 29, arp: [65, 69, 72, 69] },
      { pad: [48, 52, 55], bass: 36, arp: [72, 76, 79, 76] },
      { pad: [43, 47, 50], bass: 31, arp: [67, 71, 74, 71] },
    ],
  },
  // resolved, hopeful: C - G - Am - F
  ended: {
    barDur: 2.2,
    prog: [
      { pad: [48, 52, 55], bass: 36, arp: [72, 76, 79, 76] },
      { pad: [43, 47, 50], bass: 31, arp: [67, 71, 74, 79] },
      { pad: [45, 48, 52], bass: 33, arp: [69, 72, 76, 72] },
      { pad: [41, 45, 48], bass: 29, arp: [65, 69, 72, 76] },
    ],
  },
};

let bgm: { kind: TrackKind; timer: number; nextTime: number; bar: number; track: Track } | null = null;

function scheduleBar(c: Chord, t: number, barDur: number): void {
  if (!ctx || !musicBus) return;
  // pad: soft sustained chord
  c.pad.forEach((m) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = 'triangle';
    o.frequency.value = mtof(m);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.25);
    g.gain.setValueAtTime(0.05, t + barDur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + barDur * 1.02);
    o.connect(g);
    g.connect(musicBus!);
    o.start(t);
    o.stop(t + barDur * 1.05);
  });
  // bass: soft root (felt more than heard on phones)
  {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = mtof(c.bass);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.11, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + barDur * 0.92);
    o.connect(g);
    g.connect(musicBus);
    o.start(t);
    o.stop(t + barDur);
  }
  // arpeggio: the audible melody, one pluck per beat (higher register)
  const beat = barDur / c.arp.length;
  c.arp.forEach((m, i) => {
    const s = t + i * beat;
    const o = ctx!.createOscillator();
    const o2 = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = 'triangle';
    o2.type = 'sine';
    o.frequency.value = mtof(m);
    o2.frequency.value = mtof(m + 12); // a soft octave shimmer
    g.gain.setValueAtTime(0.0001, s);
    g.gain.linearRampToValueAtTime(0.16, s + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, s + beat * 0.95);
    o.connect(g);
    o2.connect(g);
    g.connect(musicBus!);
    o.start(s);
    o2.start(s);
    o.stop(s + beat);
    o2.stop(s + beat);
  });
}

function stopTrack(): void {
  if (bgm) {
    window.clearInterval(bgm.timer);
    bgm = null; // already-scheduled notes (<= ~0.5s) ring out naturally
  }
}

export function setTrack(kind: TrackKind): void {
  if (!ensure() || !ctx) return;
  if (bgm && bgm.kind === kind) return;
  stopTrack();
  if (kind === 'none') return;
  const track = TRACKS[kind];
  const tick = () => {
    if (!bgm || !ctx) return;
    while (bgm.nextTime < ctx.currentTime + 0.6) {
      scheduleBar(track.prog[bgm.bar % track.prog.length], bgm.nextTime, track.barDur);
      bgm.nextTime += track.barDur;
      bgm.bar += 1;
    }
  };
  bgm = { kind, timer: window.setInterval(tick, 80), nextTime: ctx.currentTime + 0.12, bar: 0, track };
  tick();
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
