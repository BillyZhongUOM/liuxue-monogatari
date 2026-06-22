#!/usr/bin/env node
// =============================================================================
// Gender-specific ending illustrations via the Gemini image API.
//
// For each of the 16 endings we generate two variants, ending_<id>_male.png and
// ending_<id>_female.png, by injecting the player's gender into the subject of
// the existing ending prompt. The neutral ending_<id>.png stays as a 404-proof
// fallback (EndingScreen prefers the gendered file, falls back to the neutral).
//
// Key resolution: GEMINI_API_KEY -> GEMINI_KEY_FILE -> shared default file.
// Output PNGs (downscaled to 600px) go to public/assets/generated/; then run
//   npm run register:assets
//
// Usage:
//   node scripts/gen-ending-gender.mjs                 # all 16 x 2
//   node scripts/gen-ending-gender.mjs --only ending_phd
//   node scripts/gen-ending-gender.mjs --gender female
//   (add --force to overwrite existing files)
// =============================================================================

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'assets', 'generated');
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
// flash-image first: fast (~7-15s) and reliable. The pro model can hang, so it
// is last and every request has a hard timeout below.
const MODELS = ['models/gemini-2.5-flash-image', 'models/gemini-3.1-flash-image', 'models/gemini-3-pro-image'];
const REQ_TIMEOUT_MS = 75000;
const DEFAULT_KEY_FILE = join(ROOT, '..', 'xiaoming-research', 'products', 'ai-research-codex', '.gemini_key');

const STYLE =
  'Original pixel art, cozy mobile simulation game style, warm humorous mood, ' +
  'UK rainy-day palette of dusk indigo, slate blue and warm amber light, clean ' +
  'readable shapes, limited color palette, soft pixel dithering, 16-bit inspired, ' +
  'no text, no logos, no real university or brand marks, no watermark, original ' +
  'design, not based on Kairosoft or any existing game.';

// {S} is the gendered subject phrase, substituted per variant.
const ENDINGS = [
  ['ending_distinction', '{S} in a graduation gown holding a top-grade transcript, proud and a little tearful, golden hall light, celebratory.'],
  ['ending_job_offer', '{S} reading an offer email on a laptop, fist clenched in quiet triumph, a polished CV and sticky notes nearby, warm morning light.'],
  ['ending_phd', '{S} holding a PhD acceptance letter, surrounded by research papers and a microscope, hopeful academic mood, soft lamp light.'],
  ['ending_intern_to_fulltime', '{S} shaking hands with a manager in an office, receiving a contract on the last day of an internship, warm collegial mood.'],
  ['ending_social_star', '{S} surrounded by a diverse crowd of friends at a graduation party, everyone waving, gentle confetti, warm lively colors.'],
  ['ending_return_home', '{S} arriving home with a suitcase at the door, a family dinner table full of home-cooked dishes, warm reunion, evening light.'],
  ['ending_survivor', '{S} walking across a graduation stage, calm and relieved, steady warm light, modest triumph.'],
  ['ending_rain_philosopher', '{S} standing under an umbrella at a quiet bus stop in the rain, thoughtful and at peace, reflective blue and amber palette.'],
  ['ending_grew_but_unsure', '{S} at a crossroads on a foggy UK street, backpack on, looking ahead, uncertain but matured, soft muted palette.'],
  ['ending_ordinary', '{S} quietly closing a dorm door for the last time, a packed suitcase beside them, a small smile, ordinary bittersweet warmth.'],
  ['ending_burnout', '{S} resting their head on a desk piled with books, exhausted, a warm blanket over the shoulders, gentle non-judgmental mood, soft light.'],
  ['ending_health_collapse', '{S} resting in bed with tea and medicine on the nightstand, slowly recovering, soft caring light, hopeful not grim.'],
  ['ending_bankruptcy', '{S} at a kitchen table looking at an empty wallet and a stack of bills, worried but resolute, muted evening light.'],
  ['ending_homesick_quit', '{S} at an airport holding a return ticket home, bittersweet expression, soft dawn light, gentle mood.'],
  ['ending_resit_exam', '{S} studying alone in summer for a resit exam, a quiet empty campus through the window, determined second-chance mood.'],
  ['ending_midnight_lonely', '{S} on a late-night video call to family from a dim dorm room, tears and a small smile, warm phone glow in the dark.'],
  ['ending_dropout', '{S} staring at a cancellation email on a laptop, half-packed cardboard boxes around, about to leave an empty campus room, stunned and regretful, muted cold evening light.'],
  ['ending_breakdown', '{S} sitting on the floor leaning against the bed, unable to get up, scattered papers and an empty mug nearby, overwhelmed but gently lit, non-judgmental soft dim light.'],
];

const SUBJECT = {
  male: 'A young Chinese man (a male international student, short black hair)',
  female: 'A young Chinese woman (a female international student, shoulder-length black hair)',
};

function resolveKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  const f = process.env.GEMINI_KEY_FILE || DEFAULT_KEY_FILE;
  if (existsSync(f)) return readFileSync(f, 'utf8').trim();
  return null;
}

async function callGemini(model, prompt, key) {
  const bodies = [
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1' } } },
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'] } },
    { contents: [{ parts: [{ text: prompt }] }] },
  ];
  let lastErr = '';
  for (const body of bodies) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), REQ_TIMEOUT_MS);
    let res;
    try {
      res = await fetch(`${BASE}/${model}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ac.signal,
      });
    } catch (e) {
      lastErr = `request failed: ${e.name === 'AbortError' ? 'timeout' : e.message}`;
      continue;
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) {
      lastErr = `HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`;
      if (res.status === 400) continue;
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

async function generate(id, tmpl, gender, key, force) {
  const outId = `${id}_${gender}`;
  const file = join(OUT_DIR, `${outId}.png`);
  if (!force && existsSync(file)) {
    console.log(`skip ${outId} (exists)`);
    return true;
  }
  const prompt = `${tmpl.replace('{S}', SUBJECT[gender])} ${STYLE}`;
  let lastErr = '';
  for (const model of MODELS) {
    try {
      process.stdout.write(`gen ${outId} via ${model.split('/').pop()} ... `);
      const buf = await callGemini(model, prompt, key);
      writeFileSync(file, buf);
      try {
        execFileSync('sips', ['-Z', '600', file], { stdio: 'ignore' });
      } catch {
        /* sips is mac-only; raw file is fine if it is missing */
      }
      console.log(`ok`);
      return true;
    } catch (e) {
      lastErr = e.message;
      console.log('miss');
    }
  }
  console.log(`  FAILED ${outId}: ${lastErr}`);
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
  const onlyGender = args.includes('--gender') ? args[args.indexOf('--gender') + 1] : null;
  const genders = onlyGender ? [onlyGender] : ['female', 'male'];

  const key = resolveKey();
  if (!key) {
    console.error('No Gemini key. Set GEMINI_API_KEY or GEMINI_KEY_FILE.');
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  const list = only ? ENDINGS.filter((e) => e[0] === only) : ENDINGS;
  if (!list.length) {
    console.error(`unknown ending id: ${only}`);
    process.exit(1);
  }

  let ok = 0;
  let total = 0;
  for (const [id, tmpl] of list) {
    for (const g of genders) {
      total += 1;
      if (await generate(id, tmpl, g, key, force)) ok += 1;
    }
  }
  console.log(`\nDone: ${ok}/${total} gendered ending illustrations. Run: npm run register:assets`);
}

main().catch((e) => {
  console.error('fatal:', e.message);
  process.exit(1);
});
