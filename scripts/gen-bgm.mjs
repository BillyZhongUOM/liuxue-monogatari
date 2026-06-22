#!/usr/bin/env node
// Per-city BGM via Google Lyria (music generation) on the Gemini API. Each track
// is an upbeat, loopable chiptune theme leaning into the city's character. Writes
// public/assets/generated/bgm-<key>.mp3; then npm run register:assets.
//   node scripts/gen-bgm.mjs            # all missing
//   node scripts/gen-bgm.mjs --force    # regenerate all
//   node scripts/gen-bgm.mjs --only london --force
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'assets', 'generated');
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODELS = ['models/lyria-3-pro-preview', 'models/lyria-3-clip-preview'];
const DEFAULT_KEY_FILE = join(ROOT, '..', 'xiaoming-research', 'products', 'ai-research-codex', '.gemini_key');

const UPBEAT = 'Upbeat, cheerful, bouncy chiptune video-game theme, bright catchy square-wave melody, lively rhythm, warm and fun, seamless loop, instrumental, no vocals, 8-bit and 16-bit game music. ';

// key -> the city flavour layered on top of the upbeat chiptune base
const TRACKS = {
  london: 'Bustling big-city energy with a playful jazzy swing and a walking bass, metropolitan and confident.',
  manchester: 'Driving indie-rock groove with punchy leads and bouncy drums, youthful and energetic.',
  edinburgh: 'A cheerful Celtic lilt, sprightly fiddle-like melody over a bouncy jig rhythm, warm and adventurous.',
  birmingham: 'A funky groovy bassline with bright syncopated leads, playful and danceable.',
  sheffield: 'Sunny and cozy, a warm uplifting melody with a gentle bouncy beat, friendly small-city charm.',
  bristol: 'A laid-back head-nodding trip-hop bounce with a bright cool melody on top, playful and chill.',
  oxford: 'A regal playful baroque-flavoured melody, light and grand, dreaming-spires charm.',
  cambridge: 'A serene pastoral melody with light bell and harp-like tones, gentle bouncy and uplifting.',
  menu: 'A warm inviting title-screen theme, gently upbeat, hopeful and nostalgic, cozy.',
  ended: 'A triumphant heartfelt finale theme, cheerful and resolved, bright and uplifting.',
};

function resolveKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  const f = process.env.GEMINI_KEY_FILE || DEFAULT_KEY_FILE;
  if (existsSync(f)) return readFileSync(f, 'utf8').trim();
  return null;
}

async function callLyria(model, prompt, key) {
  const res = await fetch(`${BASE}/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 140)}`);
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const audio = parts.find((p) => p.inlineData?.data && /audio/.test(p.inlineData?.mimeType ?? ''));
  if (!audio) throw new Error('no audio in response');
  return Buffer.from(audio.inlineData.data, 'base64');
}

async function gen(key, prompt, apiKey, force) {
  const file = join(OUT_DIR, `bgm-${key}.mp3`);
  if (!force && existsSync(file)) { console.log(`skip bgm-${key}`); return true; }
  for (const model of MODELS) {
    try {
      process.stdout.write(`gen bgm-${key} (${model.split('/').pop()}) ... `);
      const buf = await callLyria(model, prompt, apiKey);
      writeFileSync(file, buf);
      console.log(`ok ${Math.round(buf.length / 1024)}KB`);
      return true;
    } catch (e) { console.log(`miss(${e.message.slice(0, 50)})`); }
  }
  console.log(`FAILED bgm-${key}`);
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
  const apiKey = resolveKey();
  if (!apiKey) { console.error('No Gemini key (GEMINI_API_KEY / GEMINI_KEY_FILE).'); process.exit(1); }
  mkdirSync(OUT_DIR, { recursive: true });

  const keys = only ? [only] : Object.keys(TRACKS);
  let ok = 0;
  for (const k of keys) {
    if (!TRACKS[k]) { console.error('unknown track ' + k); continue; }
    if (await gen(k, UPBEAT + TRACKS[k], apiKey, force)) ok += 1;
  }
  console.log(`\nDone ${ok}/${keys.length}. Then: npm run register:assets`);
}
main().catch((e) => { console.error('fatal', e.message); process.exit(1); });
