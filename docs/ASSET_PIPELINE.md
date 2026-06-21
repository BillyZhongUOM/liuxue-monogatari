# Pixel Asset Pipeline

The game is **fully playable with zero assets** (emoji + CSS placeholders). This
pipeline upgrades scene backgrounds to original pixel art when an API key is set.

## How it works
`scripts/generate-assets.mjs`:
1. Loads `OPENROUTER_API_KEY`, `IMAGE_MODEL`, `MAX_ASSET_GENERATIONS_PER_RUN` from `.env` (or the environment).
2. For each spec in `SPECS`, calls OpenRouter image generation and saves a PNG into `src/assets/generated/<id>.png`.
3. Writes `src/assets/generated/manifest.json`. The UI reads the manifest at build time (`src/ui/theme.ts → assetUrl`) and swaps the placeholder for the real image when present.

Behaviour guarantees:
- **No key → no-op.** Prints setup steps and exits 0. Never blocks a build.
- **Idempotent.** Existing assets are skipped unless you pass `--force`.
- **Cost-guarded.** Stops after `MAX_ASSET_GENERATIONS_PER_RUN` (default 20).
- **Failure-tolerant.** A failed asset keeps its placeholder; the run continues.

## Run
```bash
cp .env.example .env            # add OPENROUTER_API_KEY
npm run generate:assets        # generate missing assets
npm run generate:assets -- --force   # regenerate all
```

## Models
- `google/gemini-3.1-flash-image-preview` — "Nano Banana", default, high quality.
- `black-forest-labs/flux.2-pro` — FLUX alternative.
Set `IMAGE_MODEL` in `.env` to switch.

## Style spine (every asset shares this)
> original pixel art for a cozy mobile simulation game, warm humorous mood, UK
> rainy-day palette of dusk indigo / slate / warm amber, clean readable shapes,
> limited color palette, soft pixel dithering, NO text, NO logos, NO real
> university or brand marks, NO watermark, original style, not based on Kairosoft
> or any existing game.

## Prompt templates (extend `SPECS` to add assets)
- **Scene background** (768x232): `<scene description>, <style spine>`
- **Character sprite** (transparent, 96x96): `a Chinese international student in the UK, <pose/mood>, cozy casual outfit, expressive simple face, clean silhouette, transparent background, <style spine>`
- **Stat / action icon** (transparent, 48x48): `a pixel UI icon representing <concept>, readable on a small mobile screen, clean outline, transparent background, <style spine>`
- **Ending illustration** (512x288): `<ending scene>, bittersweet humorous tone, warm cinematic composition, <style spine>`

## Hard rules (originality + safety)
1. No real school or brand logos. 2. No text inside images (all Chinese text is UI-rendered). 3. No imitation of a specific commercial game or artist; the prompt says "original pixel art simulation game style", never "Kairosoft style". 4. Characters are original, not real people. 5. Record id / model / size / path in the manifest for every generated asset.

## Manifest format
```json
{
  "generatedAt": "2026-...",
  "model": "google/gemini-3.1-flash-image-preview",
  "assets": [
    { "id": "scene-campus-rain", "type": "scene", "path": "/assets/generated/scene-campus-rain.png", "width": 768, "height": 232, "generatedBy": "...", "status": "generated" }
  ]
}
```
