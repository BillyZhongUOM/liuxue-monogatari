#!/usr/bin/env node
// Phone-UI art: an iOS-style lock-screen wallpaper + flat app icons, via Gemini.
// Icons are filled rounded-square tiles (the UI rounds the corners with CSS), so
// no chroma knockout is needed. Output public/assets/generated/*.png; then
//   npm run register:assets
//   node scripts/gen-phone-art.mjs            # all
//   node scripts/gen-phone-art.mjs --only app-chat
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'assets', 'generated');
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODELS = ['models/gemini-2.5-flash-image', 'models/gemini-3.1-flash-image', 'models/gemini-3-pro-image'];
const REQ_TIMEOUT_MS = 75000;
const DEFAULT_KEY_FILE = join(ROOT, '..', 'xiaoming-research', 'products', 'ai-research-codex', '.gemini_key');

const STYLE =
  'clean flat pixel-art style, limited cozy palette, soft pixel dithering, 16-bit ' +
  'inspired, no text, no letters, no words, no logos, no real brand marks, original design.';
const ICON =
  'A single mobile app icon: one filled rounded-square tile that completely fills the frame edge to edge, ' +
  'a simple centered white glyph, flat, bold, instantly readable at small size, no text. ';

// id, prompt, aspect, downscale
const SPECS = [
  ['phone-wallpaper', `A vertical phone lock-screen wallpaper, calm dusk indigo to warm amber gradient sky, a tiny UK city skyline silhouette along the bottom, a few soft clouds, gentle and minimal, no text, no logos. ${STYLE}`, '9:16', 512],
  ['app-chat', `${ICON} The tile is a soft WeChat-like green, the glyph is a simple rounded speech bubble. ${STYLE}`, '1:1', 160],
  ['app-mail', `${ICON} The tile is a soft sky blue, the glyph is a simple envelope. ${STYLE}`, '1:1', 160],
  ['app-bank', `${ICON} The tile is warm amber gold, the glyph is a simple bank card with a pound symbol shape. ${STYLE}`, '1:1', 160],
  ['app-school', `${ICON} The tile is a deep scholarly red, the glyph is a simple graduation mortarboard cap. ${STYLE}`, '1:1', 160],
  ['app-system', `${ICON} The tile is slate grey, the glyph is a simple gear. ${STYLE}`, '1:1', 160],
  ['app-moments', `${ICON} The tile is a warm sunset orange, the glyph is a simple camera aperture. ${STYLE}`, '1:1', 160],
];

function resolveKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  const f = process.env.GEMINI_KEY_FILE || DEFAULT_KEY_FILE;
  if (existsSync(f)) return readFileSync(f, 'utf8').trim();
  return null;
}

async function callGemini(model, prompt, aspect, key) {
  for (const body of [
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } } },
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'] } },
  ]) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), REQ_TIMEOUT_MS);
    let res;
    try {
      res = await fetch(`${BASE}/${model}:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ac.signal,
      });
    } catch (e) { continue; } finally { clearTimeout(timer); }
    if (!res.ok) { if (res.status === 400) continue; throw new Error(`HTTP ${res.status}`); }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const b64 = parts.find((p) => p.inlineData?.data)?.inlineData?.data;
    if (b64) return Buffer.from(b64, 'base64');
  }
  throw new Error('no image');
}

async function gen(id, prompt, aspect, scale, key, force) {
  const file = join(OUT_DIR, `${id}.png`);
  if (!force && existsSync(file)) { console.log(`skip ${id}`); return true; }
  for (const model of MODELS) {
    try {
      process.stdout.write(`gen ${id} (${model.split('/').pop()}) ... `);
      const buf = await callGemini(model, prompt, aspect, key);
      writeFileSync(file, buf);
      try { execFileSync('sips', ['-Z', String(scale), file], { stdio: 'ignore' }); } catch { /* mac only */ }
      console.log('ok');
      return true;
    } catch (e) { console.log(`miss(${String(e.message).slice(0, 24)})`); }
  }
  console.log(`FAILED ${id}`);
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
  const key = resolveKey();
  if (!key) { console.error('No Gemini key.'); process.exit(1); }
  mkdirSync(OUT_DIR, { recursive: true });
  const jobs = only ? SPECS.filter((s) => s[0] === only) : SPECS;
  let ok = 0;
  for (const [id, p, a, sc] of jobs) if (await gen(id, p, a, sc, key, force)) ok += 1;
  console.log(`\nDone ${ok}/${jobs.length}. Then: npm run register:assets`);
}
main().catch((e) => { console.error('fatal', e.message); process.exit(1); });
