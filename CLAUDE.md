# 英伦留学物语 — project notes for Claude

中文像素风网页模拟经营游戏，主题：中国学生赴英留学。移动端优先、数据驱动、原创。

## What this is
- Vite + React 19 + TypeScript + Zustand. Client-side, no backend.
- **Engine is pure** (`src/game/`): plain data + pure functions, no React, unit-tested with vitest. Treat it as the source of truth for rules.
- **Content is data** (`src/data/` actions / events / endings / traits). To add content, add data conforming to the interfaces in `src/game/types.ts`. Never hard-code content into components.

## Commands
```bash
npm run dev | build | preview | test | typecheck
npm run generate:assets   # optional pixel art via OpenRouter (needs .env key)
```
Local dev server is registered in the workspace `.claude/launch.json` as `liuxue-monogatari` (port 8240).

## House rules for content
- Game text is **Chinese** (this is intentional; the workspace "English for documents" rule does not apply to in-game copy). Code, comments and docs stay English.
- **No em-dashes / en-dashes** in any copy (commas, or "到" for ranges). UK-flavoured detail, warm humour, never ridicule of any group.
- Originality: borrow abstract mechanics only. No Kairosoft UI/art/characters, no real school or brand logos, no text baked into images.
- Visa / legal beats are fictional and game-flavoured, not real advice.

## Verify before claiming done
- `npm run test` (engine + full-playthrough harness: no NaN, no out-of-range stat, no softlock, deterministic).
- `npm run typecheck` and `npm run build` must pass.
- For UI changes, run the preview and check a 375px mobile viewport.

## Deployment
GitHub Pages via `.github/workflows/deploy.yml` (build on push to `main`, deploy `dist`). The repo is its own deployment source (no separate mirror). When this goes live, add it to the workspace `.claude/rules/deployment-repos.md`.
