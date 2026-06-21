#!/usr/bin/env node
// Scan public/assets/generated/*.png and rebuild src/assets/generated/manifest.json.
// Run this after dropping in pixel art generated anywhere (e.g. GPT Image 2):
//   1) save each image as <asset-id>.png (ids listed in docs/IMAGE_PROMPTS.md)
//   2) move them into public/assets/generated/
//   3) npm run register:assets
// The game then loads them automatically; missing ids stay on emoji/CSS placeholders.
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = join(ROOT, 'public', 'assets', 'generated');
const MANIFEST = join(ROOT, 'src', 'assets', 'generated', 'manifest.json');

mkdirSync(dirname(MANIFEST), { recursive: true });
const files = existsSync(IMG_DIR)
  ? readdirSync(IMG_DIR).filter((f) => /\.png$/i.test(f))
  : [];
const assets = files
  .map((f) => ({ id: f.replace(/\.png$/i, ''), path: `/assets/generated/${f}` }))
  .sort((a, b) => a.id.localeCompare(b.id));

writeFileSync(
  MANIFEST,
  `${JSON.stringify({ updatedBy: 'register-assets', count: assets.length, assets }, null, 2)}\n`,
);
console.log(`[register] ${assets.length} asset(s): ${assets.map((a) => a.id).join(', ') || '(none — drop PNGs into public/assets/generated/)'}`);
