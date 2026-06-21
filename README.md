# 英伦留学物语 · Study-Abroad Monogatari

A Chinese pixel-art life-sim about a Chinese student studying in the UK. Survive
the rain, the deadlines, the part-time shifts, the group projects and the
graduation panic, and turn one year abroad into the life you actually want.

> 中文像素风网页模拟经营游戏，主题为中国学生赴英留学。时间推进 + 数值管理 +
> 随机事件 + 多结局。移动端优先，单手可玩。原创作品，灵感参考人生模拟与像素经营，
> 但不复刻任何现有游戏的 UI、美术、角色、文本或系统。

## Play

- **Pick a start**: city, university type, major, family budget, English level, 1-3 personality traits.
- **Each week** you have 3 action points. Spend them on studying, part-time work, cooking, societies, job hunting, calling home, resting, and more.
- **Random events** hit between actions and at the weekend. Every choice has a trade-off.
- **Twelve stats** (money, energy, stress, GPA, English, social, career, adaptation, health, visa, homesickness, reputation) push you toward one of eight routes.
- **One academic year** (3 terms x 12 weeks) leads to one of many endings: distinction, a job offer, a PhD place, going home with a plan, or burning out. Different play styles, different endings.

The whole game runs client-side. Your save lives in `localStorage`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173 (or the port in .claude/launch.json)
```

```bash
npm run build      # production build into dist/
npm run preview    # serve the production build
npm run test       # vitest: pure-engine unit tests + full-playthrough harness
npm run typecheck  # tsc --noEmit
```

## Pixel art (optional)

The game ships with emoji / CSS pixel placeholders and is fully playable with no
art. Two ways to add pixel art (scene backgrounds + ending illustrations):

**A. Bring your own (e.g. GPT Image 2)** — prompts + exact filenames are in
[docs/IMAGE_PROMPTS.md](docs/IMAGE_PROMPTS.md):

```bash
# save each image as <asset-id>.png, then:
mv *.png public/assets/generated/
npm run register:assets    # rebuilds the manifest so the game loads them
```

**B. Auto-generate via OpenRouter** (Nano Banana / FLUX):

```bash
cp .env.example .env       # add OPENROUTER_API_KEY (https://openrouter.ai/keys)
npm run generate:assets    # writes public/assets/generated/*.png + manifest
```

See [docs/ASSET_PIPELINE.md](docs/ASSET_PIPELINE.md). Missing assets stay on
placeholders. Never commit a real key.

## Tech

- **Vite + React 19 + TypeScript**, **Zustand** for state.
- The **engine is pure** (`src/game/`): plain data + pure functions, zero React
  imports, fully unit-tested. The UI (`src/ui/`) is a thin layer on top.
- All **content is data** (`src/data/`): actions, events, endings, traits. New
  content is added as data, never hard-coded into components.

```
src/
  game/      # types, constants, rng, conditions, engine (+ tests)
  data/      # actions, events, endings, traits  (the content)
  ui/        # screens, play view, stat HUD, modals, theme
  assets/    # generated/ pixel art + manifest
scripts/     # generate-assets.mjs (Nano Banana / FLUX pipeline)
docs/        # GDD, asset pipeline
```

## Originality & tone

Original work. It borrows abstract mechanics (time advance, stat pressure,
random events, multiple endings) from the life-sim genre, and a cozy pixel mood
from retro management games, but copies no specific game's UI, art, characters,
text, building layouts or icons. No real university logos or brand marks appear,
and no images contain text (all Chinese text is UI-rendered). In-game visa and
legal beats are fictional and for entertainment, not real advice. The writing
aims for warmth and humour about the shared student-abroad experience, never
ridicule of any group.
