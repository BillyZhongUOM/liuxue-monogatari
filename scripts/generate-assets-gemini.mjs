#!/usr/bin/env node
// =============================================================================
// Pixel asset generator using the Gemini API DIRECTLY (no OpenRouter).
//
// Uses Google's native image models (Nano Banana): gemini-3-pro-image /
// gemini-3.1-flash-image / gemini-2.5-flash-image, via
//   POST generativelanguage.googleapis.com/v1beta/{model}:generateContent?key=...
//
// Key resolution (first hit wins):
//   1. env GEMINI_API_KEY
//   2. file at env GEMINI_KEY_FILE
//   3. the shared key file used by the xiaoming-research project (default)
// The key is read at runtime and never copied into this repo.
//
// Writes PNGs into public/assets/generated/. Afterwards run:
//   npm run register:assets
//
// Usage:
//   node scripts/generate-assets-gemini.mjs --only scene-arrival   # one asset
//   node scripts/generate-assets-gemini.mjs --scenes               # all scenes
//   node scripts/generate-assets-gemini.mjs --endings              # all endings
//   node scripts/generate-assets-gemini.mjs                        # everything
//   (add --force to overwrite existing files)
// =============================================================================

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'assets', 'generated');
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
// flash-image first: fast and reliable. The pro model can hang, so it is last.
const MODELS = ['models/gemini-2.5-flash-image', 'models/gemini-3.1-flash-image', 'models/gemini-3-pro-image'];
const DEFAULT_KEY_FILE = join(ROOT, '..', 'xiaoming-research', 'products', 'ai-research-codex', '.gemini_key');

const STYLE =
  'Original pixel art, cozy mobile simulation game style, warm humorous mood, ' +
  'UK rainy-day palette of dusk indigo, slate blue and warm amber light, clean ' +
  'readable shapes, limited color palette, soft pixel dithering, 16-bit inspired, ' +
  'no text, no logos, no real university or brand marks, no watermark, original ' +
  'design, not based on Kairosoft or any existing game.';

const SCENES = [
  ['scene-arrival', 'A Chinese international student arriving at a UK airport at dusk, pulling two large suitcases, light drizzle outside tall windows, warm terminal lights, wide cinematic composition.'],
  ['scene-campus-rain', 'A UK university campus on a rainy autumn day, red-brick buildings, students under umbrellas, wet cobblestones reflecting amber lamplight, low grey clouds.'],
  ['scene-dorm', 'A small cozy student dorm room at night, a desk with a laptop and a cup of instant noodles, a warm desk lamp, rain streaking the window, a few posters on the wall.'],
  ['scene-library', 'A university library interior during exam season, long study desks, tall bookshelves, scattered notes and coffee cups, a tired warm reading light.'],
  ['scene-career-fair', 'A busy university career fair hall, rows of recruitment booths and blank banners with no readable text, students in smart clothes carrying tote bags, bright indoor lighting.'],
];

const ENDINGS = [
  ['ending_distinction', 'A Chinese student in a graduation gown holding a top-grade transcript, proud and a little tearful, golden hall light, celebratory.'],
  ['ending_job_offer', 'A Chinese student reading an offer email on a laptop, fist clenched in quiet triumph, a polished CV and sticky notes nearby, warm morning light.'],
  ['ending_phd', 'A Chinese student holding a PhD acceptance letter, surrounded by research papers and a microscope, hopeful academic mood, soft lamp light.'],
  ['ending_intern_to_fulltime', 'A Chinese student shaking hands with a manager in an office, receiving a contract on the last day of an internship, warm collegial mood.'],
  ['ending_social_star', 'A Chinese student surrounded by a diverse crowd of friends at a graduation party, everyone waving, gentle confetti, warm lively colors.'],
  ['ending_return_home', 'A Chinese student arriving home with a suitcase at the door, a family dinner table full of home-cooked dishes, warm reunion, evening light.'],
  ['ending_survivor', 'A Chinese student walking across a graduation stage, calm and relieved, steady warm light, modest triumph.'],
  ['ending_rain_philosopher', 'A Chinese student standing under an umbrella at a quiet bus stop in the rain, thoughtful and at peace, reflective blue and amber palette.'],
  ['ending_grew_but_unsure', 'A Chinese student at a crossroads on a foggy UK street, backpack on, looking ahead, uncertain but matured, soft muted palette.'],
  ['ending_ordinary', 'A Chinese student quietly closing a dorm door for the last time, a packed suitcase beside them, a small smile, ordinary bittersweet warmth.'],
  ['ending_burnout', 'A Chinese student resting their head on a desk piled with books, exhausted, a warm blanket over the shoulders, gentle non-judgmental mood, soft light.'],
  ['ending_health_collapse', 'A Chinese student resting in bed with tea and medicine on the nightstand, slowly recovering, soft caring light, hopeful not grim.'],
  ['ending_bankruptcy', 'A Chinese student at a kitchen table looking at an empty wallet and a stack of bills, worried but resolute, muted evening light.'],
  ['ending_homesick_quit', 'A Chinese student at an airport holding a return ticket home, bittersweet expression, soft dawn light, gentle mood.'],
  ['ending_resit_exam', 'A Chinese student studying alone in summer for a resit exam, a quiet empty campus through the window, determined second-chance mood.'],
  ['ending_midnight_lonely', 'A Chinese student on a late-night video call to family from a dim dorm room, tears and a small smile, warm phone glow in the dark.'],
  ['ending_dropout', 'A Chinese student staring at a cancellation email on a laptop, half-packed cardboard boxes around, about to leave an empty campus room, stunned and regretful, muted cold evening light.'],
  ['ending_breakdown', 'A Chinese student sitting on the floor leaning against the bed, unable to get up, scattered papers nearby, overwhelmed but gently lit, non-judgmental soft dim light.'],
];

function resolveKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  const f = process.env.GEMINI_KEY_FILE || DEFAULT_KEY_FILE;
  if (existsSync(f)) return readFileSync(f, 'utf8').trim();
  return null;
}

async function callGemini(model, prompt, aspect, key) {
  const bodies = [
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } } },
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'] } },
    { contents: [{ parts: [{ text: prompt }] }] },
  ];
  let lastErr = '';
  for (const body of bodies) {
    const res = await fetch(`${BASE}/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      lastErr = `HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`;
      if (res.status === 400) continue; // try a simpler body shape
      throw new Error(lastErr);
    }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find((p) => p.inlineData?.data || p.inline_data?.data);
    const b64 = img?.inlineData?.data || img?.inline_data?.data;
    if (b64) return Buffer.from(b64, 'base64');
    lastErr = 'no image part in response';
  }
  throw new Error(lastErr);
}

async function generate(id, desc, aspect, key, force) {
  const file = join(OUT_DIR, `${id}.png`);
  if (!force && existsSync(file)) {
    console.log(`skip ${id} (exists)`);
    return true;
  }
  const prompt = `${desc} ${STYLE}`;
  let lastErr = '';
  for (const model of MODELS) {
    try {
      process.stdout.write(`gen ${id} via ${model.split('/').pop()} ... `);
      const buf = await callGemini(model, prompt, aspect, key);
      writeFileSync(file, buf);
      console.log(`ok (${Math.round(buf.length / 1024)} KB)`);
      return true;
    } catch (e) {
      lastErr = e.message;
      console.log('miss');
    }
  }
  console.log(`  FAILED ${id}: ${lastErr}`);
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
  const wantScenes = args.includes('--scenes') || (!args.includes('--endings') && !only);
  const wantEndings = args.includes('--endings') || (!args.includes('--scenes') && !only);

  const key = resolveKey();
  if (!key) {
    console.error('No Gemini key. Set GEMINI_API_KEY, or GEMINI_KEY_FILE, or place it at the default path.');
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  let jobs = [];
  if (only) {
    const s = SCENES.find((x) => x[0] === only);
    const e = ENDINGS.find((x) => x[0] === only);
    if (s) jobs.push([...s, '16:9']);
    else if (e) jobs.push([...e, '1:1']);
    else { console.error(`unknown asset id: ${only}`); process.exit(1); }
  } else {
    if (wantScenes) jobs.push(...SCENES.map((x) => [...x, '16:9']));
    if (wantEndings) jobs.push(...ENDINGS.map((x) => [...x, '1:1']));
  }

  let ok = 0;
  for (const [id, desc, aspect] of jobs) {
    if (await generate(id, desc, aspect, key, force)) ok += 1;
  }
  console.log(`\nDone: ${ok}/${jobs.length} assets in public/assets/generated/. Run: npm run register:assets`);
}

main().catch((e) => {
  console.error('fatal:', e.message);
  process.exit(1);
});
