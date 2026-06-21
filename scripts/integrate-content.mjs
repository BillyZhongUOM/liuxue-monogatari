#!/usr/bin/env node
// One-off: take the content-expansion workflow output and fold it into
// src/data/generated/*.json after validation + an originality/safety pass.
//   node scripts/integrate-content.mjs <workflow-output.json>           # dry run report
//   node scripts/integrate-content.mjs <workflow-output.json> --write   # write the files
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src', 'data');
const GEN = join(DATA, 'generated');

const STAT_KEYS = ['money', 'energy', 'stress', 'gpa', 'english', 'social', 'career', 'adaptation', 'health', 'visa', 'homesick', 'reputation'];
const ROUTES = ['scholar', 'grind', 'social', 'career', 'chill', 'phd', 'homebound', 'survivor'];
const POOLS = ['', 'essay_incidents', 'group_incidents', 'part_time_incidents', 'jobhunt_incidents', 'social_incidents'];
const TAGS = ['study', 'work', 'social', 'rest', 'career', 'life', 'cook', 'admin', 'explore'];

const write = process.argv.includes('--write');
const file = process.argv.find((a, i) => i >= 2 && !a.startsWith('--'));
if (!file) {
  console.error('usage: integrate-content.mjs <output.json> [--write]');
  process.exit(1);
}

// --- parse the workflow result (tolerate any leading/trailing noise) ----------
let raw = readFileSync(file, 'utf8');
function parseResult(text) {
  try {
    return JSON.parse(text);
  } catch {
    const i = text.indexOf('{"counts"');
    const j = text.lastIndexOf('}');
    if (i >= 0 && j > i) return JSON.parse(text.slice(i, j + 1));
    throw new Error('could not locate JSON result in output file');
  }
}
let parsed = parseResult(raw);
let result = parsed.result ?? parsed; // workflow output is wrapped: {summary, logs, result}
if (typeof result === 'string') result = JSON.parse(result);
const events = result.events ?? [];
const traits = result.traits ?? [];
const endings = result.endings ?? [];
const review = result.review ?? { verdict: '(none)', flagged: [] };

// --- existing base ids (regex out of the .ts sources) -------------------------
function baseIds(fileName) {
  const txt = readFileSync(join(DATA, fileName), 'utf8');
  return new Set([...txt.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]));
}
const baseEvent = baseIds('events.ts');
const baseTrait = baseIds('traits.ts');
const baseEnding = baseIds('endings.ts');

const DASH = /[—–]/;

// Drop only the genuinely redundant events the review found (keep one per cluster).
const DROP_DUP = new Set([
  'ev_birthday_far_home',
  'ev_society_committee_run',
  'ev_society_committee_cv_line',
  'ev_referencing_panic',
  'ev_jobhunt_visa_filter',
  'ev_jobhunt_careerfair_cards',
]);

// De-name real brands / schemes the review flagged.
const BRAND_FIXES = [
  [/老干妈/g, '家乡牌的辣酱'],
  [/Zotero/g, '文献管理软件'],
  [/Graduate Route/g, '毕业后的工作签证路径'],
];

const issues = [];
const seen = new Set();

function scrub(s) {
  if (typeof s !== 'string') return s;
  let out = s.replace(/\s*[—–]+\s*/g, '，');
  for (const [re, to] of BRAND_FIXES) out = out.replace(re, to);
  return out;
}

// Enforce "every choice has a trade-off": any all-upside choice gets an energy cost.
const HIGHER_WORSE = new Set(['stress', 'homesick']);
function costless(fx) {
  if (!fx) return true;
  return Object.entries(fx).every(([k, v]) => (HIGHER_WORSE.has(k) ? v <= 0 : v >= 0));
}
function guardChoice(c) {
  const fx = { ...(c.effects || {}) };
  if (costless(fx)) fx.energy = (fx.energy || 0) - 4;
  return { ...c, text: scrub(c.text), resultText: scrub(c.resultText), effects: fx };
}

function validateEffects(fx, where) {
  if (!fx) return true;
  for (const k of Object.keys(fx)) {
    if (!STAT_KEYS.includes(k)) {
      issues.push(`${where}: bad effect key "${k}"`);
      return false;
    }
  }
  return true;
}
function validateRoutes(rw, where) {
  if (!rw) return true;
  for (const k of Object.keys(rw)) {
    if (!ROUTES.includes(k)) {
      issues.push(`${where}: bad route "${k}"`);
      return false;
    }
  }
  return true;
}

function cleanEvent(e) {
  if (!e?.id) return null;
  if (DROP_DUP.has(e.id)) { issues.push(`event ${e.id}: dropped (redundant per review)`); return null; }
  if (seen.has(e.id) || baseEvent.has(e.id)) { issues.push(`event ${e.id}: dropped (duplicate id)`); return null; }
  if (!POOLS.includes(e.pool ?? '')) { issues.push(`event ${e.id}: bad pool "${e.pool}"`); return null; }
  if (!Array.isArray(e.choices) || e.choices.length < 2) { issues.push(`event ${e.id}: <2 choices`); return null; }
  for (const c of e.choices) {
    if (!validateEffects(c.effects, `event ${e.id} choice`)) return null;
    if (!validateRoutes(c.routeWeights, `event ${e.id} choice`)) return null;
  }
  seen.add(e.id);
  return {
    ...e,
    title: scrub(e.title),
    description: scrub(e.description),
    choices: e.choices.map(guardChoice),
  };
}

function cleanTrait(t) {
  if (!t?.id) return null;
  if (seen.has(t.id) || baseTrait.has(t.id)) { issues.push(`trait ${t.id}: dropped (duplicate id)`); return null; }
  if (!validateEffects(t.startMods, `trait ${t.id}`)) return null;
  if (t.actionTagMods) {
    for (const k of Object.keys(t.actionTagMods)) if (!TAGS.includes(k)) { issues.push(`trait ${t.id}: bad tag "${k}"`); return null; }
  }
  seen.add(t.id);
  return { ...t, name: scrub(t.name), desc: scrub(t.desc) };
}

function cleanEnding(e) {
  if (!e?.id) return null;
  if (seen.has(e.id) || baseEnding.has(e.id)) { issues.push(`ending ${e.id}: dropped (already in base)`); return null; }
  if (!['good', 'mixed', 'bad', 'special'].includes(e.tone)) { issues.push(`ending ${e.id}: bad tone`); return null; }
  if (e.cond) {
    if (!validateEffects(e.cond.statGte, `ending ${e.id} statGte`)) return null;
    if (!validateEffects(e.cond.statLte, `ending ${e.id} statLte`)) return null;
  }
  seen.add(e.id);
  return { ...e, title: scrub(e.title), desc: scrub(e.desc), quip: scrub(e.quip) };
}

const outEvents = events.map(cleanEvent).filter(Boolean);
seen.clear(); // ids are unique per file; traits/endings have their own namespaces
traits.forEach(() => {});
const outTraits = traits.map(cleanTrait).filter(Boolean);
seen.clear();
const outEndings = endings.map(cleanEnding).filter(Boolean);

// dash audit on the cleaned output (should be zero)
const dashHits = JSON.stringify({ outEvents, outTraits, outEndings }).match(DASH)?.length ?? 0;

console.log('=== review verdict ===');
console.log(review.verdict);
console.log(`flagged by review: ${(review.flagged ?? []).length}`);
for (const f of review.flagged ?? []) console.log(`  - ${f.id}: ${f.issue}${f.fix ? ` => ${f.fix}` : ''}`);
console.log('\n=== validation issues ===');
console.log(issues.length ? issues.join('\n') : '(none)');
console.log('\n=== kept ===');
console.log(`events ${outEvents.length}/${events.length}, traits ${outTraits.length}/${traits.length}, endings ${outEndings.length}/${endings.length}, residual em-dashes: ${dashHits}`);

if (write) {
  writeFileSync(join(GEN, 'events.json'), `${JSON.stringify(outEvents, null, 2)}\n`);
  writeFileSync(join(GEN, 'traits.json'), `${JSON.stringify(outTraits, null, 2)}\n`);
  writeFileSync(join(GEN, 'endings.json'), `${JSON.stringify(outEndings, null, 2)}\n`);
  console.log('\n[wrote] src/data/generated/{events,traits,endings}.json');
} else {
  console.log('\n(dry run; pass --write to persist)');
}
