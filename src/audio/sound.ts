// Procedural Web Audio layer. Fully synthesised (no audio files, so nothing to
// download and zero copyright surface) and original. A small generative engine
// plays a gentle looping chord progression with a higher-register arpeggio
// (which is what actually carries on phone speakers) plus a soft bass + pad and
// an optional rain layer. Soft UI SFX on top. A real CC0 track could later route
// a looping <audio> through musicBus instead, but this is audible on its own.
//
// iOS Safari blocks audible autoplay until a user gesture, so the context starts
// suspended and unlock() must run inside a real tap (AudioManager wires that up).

// 'play' resolves to a per-city track; menu/ended are fixed; 'none' stops the BGM.
type TrackKind =
  | 'menu'
  | 'ended'
  | 'none'
  | 'london'
  | 'manchester'
  | 'edinburgh'
  | 'birmingham'
  | 'sheffield'
  | 'bristol'
  | 'oxford'
  | 'cambridge';

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
// lead = the chiptune voice of the melody; hat = a noise tick for groove cities.
interface Track { barDur: number; lead: OscillatorType; hat: boolean; prog: Chord[] }

// Eight per-city themes plus menu + ended, all chiptune-flavoured (square/pulse
// lead over a triangle bass, optional noise hat). Each city leans into its motif:
// London urban-jazz lonely, Oxford stately organ, Cambridge gentle harp,
// Manchester driving indie, Edinburgh modal bagpipe, Birmingham funk, Sheffield
// warm acoustic, Bristol downtempo trip-hop.
const TRACKS: Record<Exclude<TrackKind, 'none'>, Track> = {
  // urban jazz, lonely and cool: Am7 - Dm7 - Em7 - Am7
  london: {
    barDur: 2.3, lead: 'square', hat: false,
    prog: [
      { pad: [57, 60, 64, 67], bass: 45, arp: [72, 76, 79, 76] },
      { pad: [50, 53, 57, 60], bass: 38, arp: [74, 77, 81, 77] },
      { pad: [52, 55, 59, 62], bass: 40, arp: [76, 79, 83, 79] },
      { pad: [57, 60, 64, 67], bass: 45, arp: [72, 79, 76, 72] },
    ],
  },
  // driving indie rock, punchy: Em - C - G - D, fast, with a hat
  manchester: {
    barDur: 1.5, lead: 'square', hat: true,
    prog: [
      { pad: [52, 55, 59], bass: 40, arp: [64, 67, 71, 74] },
      { pad: [48, 52, 55], bass: 36, arp: [72, 67, 64, 67] },
      { pad: [55, 59, 62], bass: 43, arp: [74, 71, 67, 71] },
      { pad: [50, 54, 57], bass: 38, arp: [69, 66, 62, 66] },
    ],
  },
  // modal, desolate bagpipe drone: Dm - C - Dm - A
  edinburgh: {
    barDur: 2.0, lead: 'square', hat: false,
    prog: [
      { pad: [50, 53, 57], bass: 38, arp: [62, 65, 69, 67] },
      { pad: [48, 52, 55], bass: 36, arp: [60, 64, 67, 64] },
      { pad: [50, 53, 57], bass: 38, arp: [65, 69, 72, 69] },
      { pad: [45, 49, 52], bass: 33, arp: [69, 68, 65, 64] },
    ],
  },
  // funk, syncopated and bright: Cmaj7 - Fmaj7 - Dm7 - G7, with a hat
  birmingham: {
    barDur: 1.6, lead: 'sawtooth', hat: true,
    prog: [
      { pad: [48, 52, 55, 59], bass: 36, arp: [60, 64, 67, 64] },
      { pad: [53, 57, 60, 64], bass: 41, arp: [65, 69, 72, 69] },
      { pad: [50, 53, 57, 60], bass: 38, arp: [62, 65, 69, 65] },
      { pad: [55, 59, 62, 65], bass: 43, arp: [67, 71, 65, 71] },
    ],
  },
  // warm acoustic, healing: G - Em - C - D, fingerpicked feel
  sheffield: {
    barDur: 2.1, lead: 'triangle', hat: false,
    prog: [
      { pad: [55, 59, 62], bass: 43, arp: [67, 74, 71, 74] },
      { pad: [52, 55, 59], bass: 40, arp: [64, 71, 67, 71] },
      { pad: [48, 52, 55], bass: 36, arp: [60, 67, 64, 67] },
      { pad: [50, 54, 57], bass: 38, arp: [62, 69, 66, 69] },
    ],
  },
  // trip-hop, downtempo and mellow: Cm - Ab - Eb - Bb, slow, soft hat
  bristol: {
    barDur: 2.4, lead: 'triangle', hat: true,
    prog: [
      { pad: [48, 51, 55], bass: 36, arp: [72, 75, 79, 75] },
      { pad: [44, 48, 51], bass: 32, arp: [68, 72, 75, 72] },
      { pad: [51, 55, 58], bass: 39, arp: [75, 79, 82, 79] },
      { pad: [46, 50, 53], bass: 34, arp: [70, 74, 77, 74] },
    ],
  },
  // stately organ, grand: C - F - Am - G, slow with big chords
  oxford: {
    barDur: 2.4, lead: 'square', hat: false,
    prog: [
      { pad: [48, 52, 55, 60], bass: 36, arp: [60, 64, 67, 72] },
      { pad: [53, 57, 60, 65], bass: 41, arp: [65, 69, 72, 77] },
      { pad: [57, 60, 64, 69], bass: 45, arp: [69, 72, 76, 72] },
      { pad: [55, 59, 62, 67], bass: 43, arp: [67, 71, 74, 79] },
    ],
  },
  // gentle flowing harp: D - A - Bm - G
  cambridge: {
    barDur: 2.0, lead: 'triangle', hat: false,
    prog: [
      { pad: [50, 54, 57], bass: 38, arp: [62, 66, 69, 74] },
      { pad: [45, 49, 52], bass: 33, arp: [69, 73, 76, 69] },
      { pad: [47, 50, 54], bass: 35, arp: [71, 74, 78, 74] },
      { pad: [55, 59, 62], bass: 43, arp: [67, 71, 74, 79] },
    ],
  },
  // sparser, melancholic dusk: Am - F - C - G (used for the menu)
  menu: {
    barDur: 2.6, lead: 'triangle', hat: false,
    prog: [
      { pad: [45, 48, 52], bass: 33, arp: [69, 72, 76, 72] },
      { pad: [41, 45, 48], bass: 29, arp: [65, 69, 72, 69] },
      { pad: [48, 52, 55], bass: 36, arp: [72, 76, 79, 76] },
      { pad: [43, 47, 50], bass: 31, arp: [67, 71, 74, 71] },
    ],
  },
  // resolved, hopeful: C - G - Am - F (the ending)
  ended: {
    barDur: 2.2, lead: 'square', hat: false,
    prog: [
      { pad: [48, 52, 55], bass: 36, arp: [72, 76, 79, 76] },
      { pad: [43, 47, 50], bass: 31, arp: [67, 71, 74, 79] },
      { pad: [45, 48, 52], bass: 33, arp: [69, 72, 76, 72] },
      { pad: [41, 45, 48], bass: 29, arp: [65, 69, 72, 76] },
    ],
  },
};

let bgm: { kind: string; timer: number; nextTime: number; bar: number; track: Track } | null = null;

function noiseTick(t: number, dur: number, gain: number): void {
  if (!ctx || !musicBus) return;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 6000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(hp);
  hp.connect(g);
  g.connect(musicBus);
  src.start(t);
  src.stop(t + dur + 0.01);
}

function scheduleBar(c: Chord, t: number, track: Track): void {
  if (!ctx || !musicBus) return;
  const barDur = track.barDur;
  // pad: soft sustained chord
  c.pad.forEach((m) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = 'triangle';
    o.frequency.value = mtof(m);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.25);
    g.gain.setValueAtTime(0.045, t + barDur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + barDur * 1.02);
    o.connect(g);
    g.connect(musicBus!);
    o.start(t);
    o.stop(t + barDur * 1.05);
  });
  // bass: triangle root (NES-style)
  {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = mtof(c.bass);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.13, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + barDur * 0.92);
    o.connect(g);
    g.connect(musicBus);
    o.start(t);
    o.stop(t + barDur);
  }
  // arpeggio: the chiptune melody, one note per beat (higher register)
  const beat = barDur / c.arp.length;
  c.arp.forEach((m, i) => {
    const s = t + i * beat;
    const o = ctx!.createOscillator();
    const o2 = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = track.lead;
    o2.type = 'sine';
    o.frequency.value = mtof(m);
    o2.frequency.value = mtof(m + 12); // a soft octave shimmer
    g.gain.setValueAtTime(0.0001, s);
    g.gain.linearRampToValueAtTime(0.15, s + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, s + beat * 0.95);
    o.connect(g);
    o2.connect(g);
    g.connect(musicBus!);
    o.start(s);
    o2.start(s);
    o.stop(s + beat);
    o2.stop(s + beat);
    // hat on the off-beats for groove cities
    if (track.hat && i % 2 === 1) noiseTick(s, 0.05, 0.05);
  });
}

function stopTrack(): void {
  if (bgm) {
    window.clearInterval(bgm.timer);
    bgm = null; // already-scheduled notes (<= ~0.6s) ring out naturally
  }
}

export function setTrack(kind: string): void {
  if (!ensure() || !ctx) return;
  if (bgm && bgm.kind === kind) return;
  stopTrack();
  if (kind === 'none' || !(kind in TRACKS)) return;
  const track = TRACKS[kind as Exclude<TrackKind, 'none'>];
  const tick = () => {
    if (!bgm || !ctx) return;
    while (bgm.nextTime < ctx.currentTime + 0.6) {
      scheduleBar(track.prog[bgm.bar % track.prog.length], bgm.nextTime, track);
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
