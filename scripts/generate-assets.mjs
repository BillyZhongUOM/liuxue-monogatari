#!/usr/bin/env node
// =============================================================================
// Pixel asset generator for 英伦留学物语.
//
// Generates original pixel-art scene backgrounds via OpenRouter's image models
// (Nano Banana = google/gemini-3.1-flash-image-preview, or a FLUX model) and
// writes them into src/assets/generated/ + manifest.json.
//
// THE GAME IS FULLY PLAYABLE WITHOUT THIS. With no OPENROUTER_API_KEY the script
// prints setup instructions, leaves the manifest empty, and exits 0 so it never
// blocks a build. Generation is idempotent: existing assets are skipped.
//
// Usage:
//   cp .env.example .env   # then add OPENROUTER_API_KEY
//   npm run generate:assets
//   npm run generate:assets -- --force   # regenerate even if present
// =============================================================================

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
// PNGs are served statically from public/; the manifest (ids only) lives in src/.
const OUT_DIR = join(ROOT, 'public', 'assets', 'generated');
const MANIFEST = join(ROOT, 'src', 'assets', 'generated', 'manifest.json');
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

// ---- shared style spine so every asset looks like one game ------------------
const STYLE =
  'original pixel art for a cozy mobile simulation game, warm humorous mood, ' +
  'UK rainy-day palette of dusk indigo, slate and warm amber light, clean readable ' +
  'shapes, limited color palette, soft pixel dithering, NO text, NO logos, NO real ' +
  'university or brand marks, NO watermark, original style, not based on Kairosoft ' +
  'or any existing game.';

// ---- first batch: the five scene backgrounds the game already consumes ------
// (UI maps these ids through assetUrl(); add more entries to grow the set.)
const SPECS = [
  { id: 'scene-arrival', w: 768, h: 232, prompt: `A Chinese international student arriving at a UK airport with two big suitcases, drizzle outside, ${STYLE}` },
  { id: 'scene-campus-rain', w: 768, h: 232, prompt: `A UK university campus on a rainy autumn day, students with umbrellas, brick buildings, wet cobblestones, ${STYLE}` },
  { id: 'scene-dorm', w: 768, h: 232, prompt: `A small cozy student dorm room at night, desk with a laptop and instant noodles, warm lamp, rain on the window, ${STYLE}` },
  { id: 'scene-library', w: 768, h: 232, prompt: `A university library interior during exam season, long desks, stacks of books, tired warm light, ${STYLE}` },
  { id: 'scene-career-fair', w: 768, h: 232, prompt: `A busy university career fair hall, recruitment booths and banners (no readable text), people in smart clothes, ${STYLE}` },
];

// -----------------------------------------------------------------------------
function loadEnv() {
  const env = { ...process.env };
  const envPath = join(ROOT, '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

function readManifest() {
  try {
    return JSON.parse(readFileSync(MANIFEST, 'utf8'));
  } catch {
    return { generatedAt: null, model: null, assets: [] };
  }
}

async function generateOne(spec, apiKey, model) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/BillyZhongUOM/liuxue-monogatari',
      'X-Title': 'liuxue-monogatari asset pipeline',
    },
    body: JSON.stringify({
      model,
      modalities: ['image', 'text'],
      messages: [{ role: 'user', content: spec.prompt }],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const msg = data?.choices?.[0]?.message ?? {};
  let dataUrl =
    msg.images?.[0]?.image_url?.url ??
    (Array.isArray(msg.content) ? msg.content.find((c) => c.image_url)?.image_url?.url : null);
  if (!dataUrl || !dataUrl.startsWith('data:')) throw new Error('no image in response');
  const b64 = dataUrl.split(',')[1];
  const file = join(OUT_DIR, `${spec.id}.png`);
  writeFileSync(file, Buffer.from(b64, 'base64'));
  return `/assets/generated/${spec.id}.png`;
}

async function main() {
  const force = process.argv.includes('--force');
  const env = loadEnv();
  const apiKey = env.OPENROUTER_API_KEY;
  const model = env.IMAGE_MODEL || 'google/gemini-3.1-flash-image-preview';
  const cap = Number(env.MAX_ASSET_GENERATIONS_PER_RUN || 20);

  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(dirname(MANIFEST), { recursive: true });
  const manifest = readManifest();
  const have = new Map(manifest.assets.map((a) => [a.id, a]));

  if (!apiKey || apiKey.includes('your_openrouter_api_key')) {
    console.log('[assets] No OPENROUTER_API_KEY found in .env or environment.');
    console.log('[assets] The game runs fine on emoji/CSS placeholders. To generate pixel art:');
    console.log('[assets]   1) cp .env.example .env');
    console.log('[assets]   2) add OPENROUTER_API_KEY=...  (https://openrouter.ai/keys)');
    console.log('[assets]   3) npm run generate:assets');
    process.exit(0);
  }

  let made = 0;
  for (const spec of SPECS) {
    if (made >= cap) {
      console.log(`[assets] hit MAX_ASSET_GENERATIONS_PER_RUN=${cap}, stopping.`);
      break;
    }
    if (!force && have.has(spec.id) && existsSync(join(OUT_DIR, `${spec.id}.png`))) {
      console.log(`[assets] skip ${spec.id} (already present)`);
      continue;
    }
    try {
      process.stdout.write(`[assets] generating ${spec.id} ... `);
      const path = await generateOne(spec, apiKey, model);
      have.set(spec.id, { id: spec.id, type: 'scene', path, width: spec.w, height: spec.h, generatedBy: model, status: 'generated' });
      made += 1;
      console.log('ok');
    } catch (err) {
      console.log(`FAILED (${err.message}). Keeping placeholder.`);
    }
  }

  const out = {
    generatedAt: new Date().toISOString(),
    model,
    note: 'Empty assets => the game uses emoji/CSS placeholders. Fully playable either way.',
    assets: [...have.values()],
  };
  writeFileSync(MANIFEST, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`[assets] done. ${made} generated, ${have.size} total in manifest.`);
}

main().catch((e) => {
  console.error('[assets] fatal:', e);
  process.exit(0); // never block a build on asset generation
});
