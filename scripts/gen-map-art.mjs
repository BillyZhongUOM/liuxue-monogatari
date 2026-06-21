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
    ['building-library', `${SPRITE} a small cute university library building, big windows, a subtle book motif, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-dorm', `${SPRITE} a small cozy student dormitory block, a few lit windows, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-lecture', `${SPRITE} a small academic lecture building with columns and a clock, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-society', `${SPRITE} a small student union clubhouse with a little banner and bunting, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-career', `${SPRITE} a small modern office building with a glass door and a small blank signboard above it, the signboard and every surface are completely blank with absolutely NO letters, NO words, NO writing, NO numbers anywhere, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-gym', `${SPRITE} a small gym building with a dumbbell sign, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-market', `${SPRITE} a small Asian grocery shopfront with red awning and lanterns (no text), top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-town', `${SPRITE} a small UK high-street row of shops with a clock tower, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-work', `${SPRITE} a small cafe storefront where a student waits tables, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-mall', `${SPRITE} a small shopping mall entrance with shiny doors, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-nightlife', `${SPRITE} a small night bar with a glowing blank neon shape (a plain neon outline with absolutely NO letters, NO words, NO writing of any kind) and a disco ball over the door, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-station', `${SPRITE} a small UK red-brick train station building with a wooden platform canopy over the entrance, sitting directly on flat ground with no raised stone plinth and no base platform, every sign blank with absolutely NO letters and NO words, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-clinic', `${SPRITE} a small clinic building with a green cross sign, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-bank', `${SPRITE} a small classic bank building with stone columns and a plain round blank gold coin emblem (a smooth blank disc with absolutely NO letters, NO numbers, NO symbols) on the pediment, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
    ['building-park', `${SPRITE} a small park patch with a leafy tree, a bench and a lamppost, top-down 3/4 forty-five-degree view showing the roof and the facade, no base plate and no ground disc beneath it, just the building itself. ${STYLE}`],
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

// Per-city distinct terrain (each city its own ground with signature features).
const CITY_TERRAIN = {
  london: { town: 'a wide winding river like the Thames crossed by two stone bridges, tarmac roads and riverside walks, a faint big-city skyline of towers and a clock tower behind', campus: 'a modern urban university quad surrounded by glass and stone, lawns, paved paths and a fountain' },
  oxford: { town: 'honey-stone college lanes, dreaming spires, a small calm river with a punt and stone bridges, cobbled streets', campus: 'a grand honey-stone collegiate quadrangle with cloisters, manicured lawns, stone paths and a fountain' },
  cambridge: { town: 'a calm river like the Cam with punts and arched stone bridges, college chapels and spires, willow-lined banks', campus: 'a collegiate quadrangle beside a gentle river, chapel spires, lawns and stone paths' },
  manchester: { town: 'red-brick warehouses, industrial canals with locks, tram lines and cobbled streets, a few modern glass towers', campus: 'a red-brick university campus, paved courtyards, lawns and tree-lined paths' },
  edinburgh: { town: 'an old-town of stone closes climbing a craggy hill toward a castle silhouette, stepped lanes and cobbles', campus: 'a historic stone campus on a slope, stepped paths, lawns and old trees' },
  birmingham: { town: 'a network of canals with brick arches and towpaths, modern curved buildings, busy roads', campus: 'a modern mixed campus, plazas, lawns, paved paths and a small water feature' },
  sheffield: { town: 'a green hilly student city with terraced houses on slopes, leafy streets and small parks', campus: 'a green campus on a gentle hill, terraced lawns, trees and winding paths' },
  bristol: { town: 'a colourful harbour with moored boats, a tall suspension bridge over a gorge, hillside streets of pastel houses', campus: 'a hillside campus overlooking water, terraced lawns, paths and trees' },
};
SPECS.citygrounds = Object.entries(CITY_TERRAIN).flatMap(([city, t]) => [
  [`ground-town-${city}`, `A top-down pixel-art city map viewed straight from above with a calm, mostly FLAT and OPEN layout: plain green lawns and flat paved squares fill the middle, leaving several clearly flat empty plots for buildings, joined by gentle level paths. Keep the city's character (${t.town}) and ANY river, bridges, stairs, steps, slopes, hills, castle or canals ONLY along the far outer edges and in the far background, never in the middle and never under the flat plots. A few round tree canopies and flowerbeds at the sides. No buildings on the plots, no text, no logos. ${STYLE}`],
  [`ground-campus-${city}`, `A top-down pixel-art university campus map viewed straight from above with a calm, mostly FLAT and OPEN layout: plain green lawns and flat paved courtyards fill the middle, leaving several clearly flat empty plots for buildings, joined by gentle level paths. Keep the campus character (${t.campus}) and ANY slopes, stairs, steps, water or grand architecture ONLY along the far outer edges and far background, never in the middle and never under the flat plots. A few tree canopies and flowerbeds at the sides. No buildings on the plots, no text, no logos. ${STYLE}`],
]);

// Interior scenes you enter when you walk into a building (opaque full-scene bg).
const INTERIORS = {
  library: 'a university library reading room, long desks with little green lamps, tall bookshelves, a few open books',
  dorm: 'a small cozy student dorm bedroom, a single bed, a desk with a laptop and a cup of instant noodles, posters, a rainy window',
  lecture: 'a university lecture theatre, tiered rows of seats, a big screen and a whiteboard at the front',
  society: 'a student society clubroom, comfy sofas, a banner and bunting, board games and a kettle',
  career: 'a careers office, desks with computers, a jobs noticeboard, brochures on a rack',
  gym: 'a gym interior, treadmills and weight racks, a mirrored wall, a water cooler',
  market: 'a Chinese supermarket interior aisle, shelves stocked with snacks and sauces, a freezer, a checkout counter',
  town: 'a UK city-centre high street at dusk seen at street level, shopfronts, a pavement and street lamps',
  work: 'a small cafe interior, a counter with a coffee machine, tables and chairs, a tip jar',
  mall: 'a bright shopping mall interior, shop fronts, an escalator, planters',
  nightlife: 'a small bar and club interior, warm neon glow, a tiny dance floor and a bar counter with stools',
  station: 'a UK train station platform, a waiting bench, a departure board with no readable text, tracks and a canopy',
  clinic: 'a GP clinic waiting room, a row of chairs, a reception desk, a green cross sign',
  bank: 'a bank interior, teller counters, a queue rope, a marble floor',
  park: 'a small city park at dusk, a bench under a leafy tree, a pond and a winding path',
};
SPECS.interiors = Object.entries(INTERIORS).map(([loc, desc]) => [
  `interior-${loc}`,
  `A detailed 2.5D pixel-art interior scene of ${desc}, cozy warm dusk lighting, foreground props, no people, no text, no logos. ${STYLE}`,
]);

const ASPECT = { buildings: '1:1', char: '1:1', grounds: '3:4', skylines: '21:9', deco: '1:1', citygrounds: '3:4', interiors: '3:4' };

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
  const groups = ['buildings', 'char', 'grounds', 'skylines', 'deco', 'citygrounds', 'interiors'];
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
