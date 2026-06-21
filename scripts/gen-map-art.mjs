#!/usr/bin/env node
// Pixel-art assets for the map mode (buildings, character, grounds, city skylines)
// via Gemini direct. Writes public/assets/generated/*.png; then npm run register:assets.
//   node scripts/gen-map-art.mjs --only building-library
//   node scripts/gen-map-art.mjs --buildings | --grounds | --skylines | --char | --all
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'assets', 'generated');
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODELS = ['models/gemini-3-pro-image', 'models/gemini-3.1-flash-image', 'models/gemini-2.5-flash-image'];
const DEFAULT_KEY_FILE = join(ROOT, '..', 'xiaoming-research', 'products', 'ai-research-codex', '.gemini_key');

const STYLE =
  'cohesive pixel art game asset, cozy UK study-abroad simulation game, warm dusk ' +
  'palette of indigo + slate + warm amber light, limited color palette, clean ' +
  'readable 16-bit style, soft pixel dithering, no text, no logos, no real brand ' +
  'or university trademark, original design, not based on Kairosoft or any existing game.';

const SPRITE =
  'on a SOLID FLAT UNIFORM pure magenta chroma-key background (RGB 255 0 255), ' +
  'the whole object centered and fully inside the frame, no scenery, no ground, no shadow, ';

// id, prompt, aspect, kind
const SPECS = {
  buildings: [
    ['building-library', `${SPRITE} a small cute university library building, big windows, a subtle book motif, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-dorm', `${SPRITE} a small cozy student dormitory block, a few lit windows, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-lecture', `${SPRITE} a small academic lecture building with columns and a clock, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-society', `${SPRITE} a small student union clubhouse with a little banner and bunting, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-career', `${SPRITE} a small modern careers office building with a glass door, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-gym', `${SPRITE} a small gym building with a dumbbell sign, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-market', `${SPRITE} a small Asian grocery shopfront with red awning and lanterns (no text), top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-town', `${SPRITE} a small UK high-street row of shops with a clock tower, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-work', `${SPRITE} a small cafe storefront where a student waits tables, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-mall', `${SPRITE} a small shopping mall entrance with shiny doors, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-nightlife', `${SPRITE} a small night bar with neon glow and a disco ball over the door, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-station', `${SPRITE} a small UK train station with a platform canopy, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-clinic', `${SPRITE} a small clinic building with a green cross sign, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-bank', `${SPRITE} a small classic bank building with columns and a coin sign, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
    ['building-park', `${SPRITE} a small park patch with a leafy tree, a bench and a lamppost, top-down 3/4 forty-five-degree view showing the roof and the facade, the building sitting on a small oval base with a soft drop shadow. ${STYLE}`],
  ],
  char: [
    ['char-student', `${SPRITE} a full-body pixel sprite of a Chinese international student, casual clothes, a backpack, friendly simple face, standing front view. ${STYLE}`],
    ['char-student-male', `${SPRITE} a full-body pixel sprite of a young Chinese male international student, casual hoodie and jeans, a backpack, short dark hair, friendly simple face, standing front view, small soft shadow. ${STYLE}`],
    ['char-student-female', `${SPRITE} a full-body pixel sprite of a young Chinese female international student, casual jacket and jeans, a backpack, shoulder-length dark hair, friendly simple face, standing front view, small soft shadow. ${STYLE}`],
  ],
  grounds: [
    ['ground-campus', `A detailed top-down pixel-art university campus ground viewed from above: green lawns and quadrangles, pale stone footpaths forming a cross and looping walkways that lead to empty plots, a small central fountain, scattered flowerbeds and a few round tree canopies, gentle warm light, EMPTY building plots (NO buildings), NO text. ${STYLE}`],
    ['ground-town', `A detailed top-down pixel-art UK city ground at dusk viewed from above: a wide winding RIVER running through it crossed by two stone bridges, tarmac roads and cobbled lanes following both river banks with zebra crossings and kerbs, small green squares and tree canopies, wet reflections of amber light, EMPTY building plots (NO buildings), NO text. ${STYLE}`],
  ],
  deco: [
    ['deco-tree-autumn', `${SPRITE} a single round-canopy autumn tree with orange and amber leaves, top-down 3/4 view, small trunk and soft shadow. ${STYLE}`],
    ['deco-tree-green', `${SPRITE} a single round-canopy leafy green tree, top-down 3/4 view, small trunk and soft shadow. ${STYLE}`],
    ['deco-lamppost', `${SPRITE} a single old-fashioned street lamppost with a warm glowing lamp, 3/4 view, soft shadow. ${STYLE}`],
    ['deco-bench', `${SPRITE} a single small park bench, 3/4 view, soft shadow. ${STYLE}`],
  ],
  skylines: [
    ['skyline-london', 'A wide pixel-art skyline silhouette of a big river city with a clock tower, a tall wheel and modern towers, dusk amber glow, no text, no logos. ' + STYLE],
    ['skyline-oxford', 'A wide pixel-art skyline silhouette of dreaming spires and honey-stone college towers, dusk amber glow, no text, no logos. ' + STYLE],
    ['skyline-cambridge', 'A wide pixel-art skyline silhouette of college chapels and spires beside a calm river with a punt, dusk amber glow, no text, no logos. ' + STYLE],
    ['skyline-manchester', 'A wide pixel-art skyline silhouette of red-brick warehouses, canals and modern glass towers, dusk amber glow, no text, no logos. ' + STYLE],
    ['skyline-edinburgh', 'A wide pixel-art skyline silhouette of a castle on a craggy hill with old-town spires, dusk amber glow, no text, no logos. ' + STYLE],
    ['skyline-birmingham', 'A wide pixel-art skyline silhouette of canals, brick arches and modern curved buildings, dusk amber glow, no text, no logos. ' + STYLE],
    ['skyline-sheffield', 'A wide pixel-art skyline silhouette of a hilly green student city with terraced houses, dusk amber glow, no text, no logos. ' + STYLE],
    ['skyline-bristol', 'A wide pixel-art skyline silhouette of a harbour, a tall suspension bridge over a gorge and colourful hillside houses, dusk amber glow, no text, no logos. ' + STYLE],
  ],
};
const ASPECT = { buildings: '1:1', char: '1:1', grounds: '3:4', skylines: '21:9', deco: '1:1' };

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
    const res = await fetch(`${BASE}/${model}:generateContent?key=${key}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (!res.ok) { if (res.status === 400) continue; throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 140)}`); }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const b64 = parts.find((p) => p.inlineData?.data)?.inlineData?.data;
    if (b64) return Buffer.from(b64, 'base64');
  }
  throw new Error('no image');
}

async function gen(id, prompt, aspect, key, force) {
  const file = join(OUT_DIR, `${id}.png`);
  if (!force && existsSync(file)) { console.log(`skip ${id}`); return true; }
  for (const model of MODELS) {
    try {
      process.stdout.write(`gen ${id} (${model.split('/').pop()}) ... `);
      const buf = await callGemini(model, prompt, aspect, key);
      writeFileSync(file, buf);
      console.log(`ok ${Math.round(buf.length / 1024)}KB`);
      return true;
    } catch (e) { console.log(`miss(${e.message.slice(0, 40)})`); }
  }
  console.log(`FAILED ${id}`);
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
  const key = resolveKey();
  if (!key) { console.error('No Gemini key (GEMINI_API_KEY / GEMINI_KEY_FILE).'); process.exit(1); }
  mkdirSync(OUT_DIR, { recursive: true });

  let jobs = [];
  const groups = ['buildings', 'char', 'grounds', 'skylines', 'deco'];
  if (only) {
    for (const g of groups) for (const [id, p] of SPECS[g]) if (id === only) jobs.push([id, p, ASPECT[g]]);
    if (!jobs.length) { console.error('unknown id ' + only); process.exit(1); }
  } else {
    const all = args.includes('--all');
    for (const g of groups) if (all || args.includes(`--${g}`)) jobs.push(...SPECS[g].map(([id, p]) => [id, p, ASPECT[g]]));
    if (!jobs.length) { console.error('pass --only <id> or --buildings/--char/--grounds/--skylines/--all'); process.exit(1); }
  }

  let ok = 0;
  for (const [id, p, a] of jobs) if (await gen(id, p, a, key, force)) ok += 1;
  console.log(`\nDone ${ok}/${jobs.length}. Then: npm run register:assets`);
}
main().catch((e) => { console.error('fatal', e.message); process.exit(1); });
