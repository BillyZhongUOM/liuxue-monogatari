#!/usr/bin/env node
// =============================================================================
// Per-city building sprites: each of the 15 map buildings re-rendered in each
// city's architectural style, so every city's map looks distinct. Output ids are
// building-<locId>-<city>.png; MapScene prefers these and falls back to the
// shared building-<locId>.png (so this can ship city by city, 404-proof).
//
// Sprites are generated on a magenta chroma screen, then keyed to transparency
// with knockout-bg.py and downscaled to 256px (same pipeline as gen-map-art).
//
// Usage:
//   node scripts/gen-city-buildings.mjs --city oxford          # one city (15)
//   node scripts/gen-city-buildings.mjs --city oxford --only library
//   node scripts/gen-city-buildings.mjs --all                  # all 8 cities (120)
//   (add --force to overwrite existing files)
// Then: npm run register:assets
// =============================================================================

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'assets', 'generated');
const KNOCKOUT = join(ROOT, 'scripts', 'knockout-bg.py');
const KNOCKOUT_FLOOD = join(ROOT, 'scripts', 'knockout-flood.py');
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODELS = ['models/gemini-2.5-flash-image', 'models/gemini-3.1-flash-image', 'models/gemini-3-pro-image'];
const REQ_TIMEOUT_MS = 75000;
const DEFAULT_KEY_FILE = join(ROOT, '..', 'xiaoming-research', 'products', 'ai-research-codex', '.gemini_key');

const STYLE =
  'cohesive pixel art game asset, cozy UK study-abroad simulation game, warm dusk ' +
  'palette of indigo + slate + warm amber light, limited color palette, clean ' +
  'readable 16-bit style, soft pixel dithering, no text, no logos, no real brand ' +
  'or university trademark, original design, not based on Kairosoft or any existing game.';

const SPRITE =
  'on a SOLID FLAT UNIFORM pure magenta chroma-key background (RGB 255 0 255), ' +
  'the whole object centered and fully inside the frame, no scenery, no ground, no shadow, ';

const VIEW = 'top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself.';

// Per-city architectural identity. Injected as the building's material/style.
const CITY_STYLE = {
  london: 'a sleek modern metropolitan building of glass and pale Portland stone with a flat roof and big windows',
  oxford: 'a honey-coloured Cotswold-stone gothic collegiate building with leaded windows, pinnacles and a steep slate roof',
  cambridge: 'a pale cream-stone collegiate gothic building with chapel-style pinnacles, mullioned windows and a steep roof',
  manchester: 'a red-brick Victorian industrial building with tall arched warehouse windows and a slate roof',
  edinburgh: 'a dark grey sandstone Scottish building with crow-step gables, tall narrow windows and a steep roof',
  birmingham: 'a red-brick building with bold modern curved metal accents and large windows',
  sheffield: 'a grey millstone-grit stone and brick building with a pitched roof, set among green leafy surroundings',
  bristol: 'a colourful pastel Georgian terraced building (soft cream, pink or blue render) with a flat parapet roof, bohemian harbourside character',
};

// Building function descriptors (the city style is prepended). Text guards kept
// for the buildings that previously baked English letters.
const BUILDINGS = {
  library: 'rendered as a university library with big windows and a subtle book motif',
  dorm: 'rendered as a cozy student dormitory block with a few lit windows',
  lecture: 'rendered as an academic lecture hall with columns and a round clock',
  society: 'rendered as a student union clubhouse with a little banner and bunting (the banner blank with NO letters)',
  career: 'rendered as a careers office with a glass door and a small signboard, every surface completely blank with absolutely NO letters, NO words, NO numbers anywhere',
  gym: 'rendered as a gym with a simple dumbbell symbol over the door',
  market: 'rendered as an Asian grocery shopfront with a red awning and paper lanterns, NO text anywhere',
  town: 'rendered as a little high-street row of shops with a clock tower',
  work: 'rendered as a small cafe storefront with an awning and a couple of outdoor tables',
  mall: 'rendered as a shopping mall entrance with shiny glass doors',
  nightlife: 'rendered as a night bar with a glowing blank neon outline (a plain neon shape with absolutely NO letters or words) and a disco ball over the door',
  station: 'rendered as a train station with a platform canopy over the entrance, sitting on flat ground with no raised stone plinth, every sign blank with absolutely NO letters and NO words',
  clinic: 'rendered as a clinic with a plain green cross symbol',
  bank: 'rendered as a bank with stone columns and a plain round blank gold coin emblem (a smooth blank disc with absolutely NO letters, NO numbers, NO symbols) on the pediment',
  park: 'rendered as a small park patch with a leafy tree, a bench and a lamppost (this one keeps natural greenery over architecture)',
};

const CITIES = Object.keys(CITY_STYLE);
const LOC_IDS = Object.keys(BUILDINGS);

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
      lastErr = e.name === 'AbortError' ? 'timeout' : e.message;
      continue;
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) {
      lastErr = `HTTP ${res.status}`;
      if (res.status === 400) continue;
      throw new Error(lastErr);
    }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const b64 = parts.find((p) => p.inlineData?.data || p.inline_data?.data)?.inlineData?.data
      || parts.find((p) => p.inline_data?.data)?.inline_data?.data;
    if (b64) return Buffer.from(b64, 'base64');
    lastErr = 'no image part';
  }
  throw new Error(lastErr);
}

async function gen(city, loc, key, force) {
  const id = `building-${loc}-${city}`;
  const file = join(OUT_DIR, `${id}.png`);
  if (!force && existsSync(file)) {
    console.log(`skip ${id}`);
    return true;
  }
  const prompt = `${SPRITE} a small ${CITY_STYLE[city]} ${BUILDINGS[loc]}, ${VIEW} ${STYLE}`;
  for (const model of MODELS) {
    try {
      process.stdout.write(`gen ${id} (${model.split('/').pop()}) ... `);
      const buf = await callGemini(model, prompt, key);
      writeFileSync(file, buf);
      // magenta -> transparent; then a corner flood-fill in case the model
      // ignored the magenta screen and returned a flat neutral background; then
      // downscale (same pipeline as gen-map-art).
      try {
        execFileSync('python3', [KNOCKOUT, file], { stdio: 'ignore' });
        execFileSync('python3', [KNOCKOUT_FLOOD, file], { stdio: 'ignore' });
        execFileSync('sips', ['-Z', '256', file], { stdio: 'ignore' });
      } catch (e) {
        console.log(`(post-process warn: ${String(e.message).slice(0, 30)})`);
      }
      console.log('ok');
      return true;
    } catch (e) {
      console.log(`miss(${String(e.message).slice(0, 24)})`);
    }
  }
  console.log(`FAILED ${id}`);
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const all = args.includes('--all');
  const city = args.includes('--city') ? args[args.indexOf('--city') + 1] : null;
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

  const key = resolveKey();
  if (!key) {
    console.error('No Gemini key (GEMINI_API_KEY / GEMINI_KEY_FILE).');
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });

  let cities;
  if (all) cities = CITIES;
  else if (city) {
    if (!CITY_STYLE[city]) { console.error(`unknown city: ${city}. one of ${CITIES.join(', ')}`); process.exit(1); }
    cities = [city];
  } else {
    console.error('pass --city <id> or --all');
    process.exit(1);
  }
  const locs = only ? [only] : LOC_IDS;
  if (only && !BUILDINGS[only]) { console.error(`unknown building: ${only}`); process.exit(1); }

  let ok = 0;
  let total = 0;
  for (const c of cities) {
    for (const loc of locs) {
      total += 1;
      if (await gen(c, loc, key, force)) ok += 1;
    }
  }
  console.log(`\nDone ${ok}/${total} city building sprites. Then: npm run register:assets`);
}

main().catch((e) => {
  console.error('fatal', e.message);
  process.exit(1);
});
