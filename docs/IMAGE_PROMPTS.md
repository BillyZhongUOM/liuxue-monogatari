# Image prompts (for GPT Image 2)

Every prompt below maps to a real display slot in the game. Generate, then:

1. Save each image with the **exact filename** shown (e.g. `scene-dorm.png`, `ending_distinction.png`).
2. Move them into `public/assets/generated/`.
3. Run `npm run register:assets` (rebuilds the manifest so the game loads them).
4. `npm run dev` / `npm run build` — the art appears; any missing id stays on its emoji/CSS placeholder.

**GPT Image 2 settings**
- Style: pixel art. No text, no logos (the game renders all Chinese text itself).
- **Scenes**: landscape (e.g. 1536x1024). They are cropped to a wide top strip, so keep the subject centred with headroom.
- **Endings**: square (1024x1024).
- Transparent background is NOT needed (these are full backgrounds / illustrations).

**Shared style spine** (already baked into each prompt below):
> Original pixel art, cozy mobile simulation game style, warm humorous mood, UK rainy-day palette of dusk indigo / slate blue / warm amber light, clean readable shapes, limited color palette, soft pixel dithering, 16-bit inspired, no text, no logos, no real university or brand marks, no watermark, original design, not based on Kairosoft or any existing game.

---

## Scenes (5) — wired now, landscape

**`scene-arrival.png`**
> A Chinese international student arriving at a UK airport at dusk, pulling two large suitcases, light drizzle outside tall windows, warm terminal lights, wide cinematic composition. Original pixel art, cozy mobile simulation game style, warm humorous mood, UK rainy-day palette of dusk indigo / slate blue / warm amber light, clean readable shapes, limited color palette, soft pixel dithering, 16-bit inspired, no text, no logos, no real university or brand marks, no watermark, original design, not based on Kairosoft or any existing game.

**`scene-campus-rain.png`**
> A UK university campus on a rainy autumn day, red-brick buildings, students under umbrellas, wet cobblestones reflecting amber lamplight, low grey clouds, wide composition. Original pixel art, cozy mobile simulation game style, warm humorous mood, UK rainy-day palette of dusk indigo / slate blue / warm amber light, clean readable shapes, limited color palette, soft pixel dithering, 16-bit inspired, no text, no logos, no real university or brand marks, no watermark, original design, not based on Kairosoft or any existing game.

**`scene-dorm.png`**
> A small cozy student dorm room at night, a desk with a laptop and a cup of instant noodles, a warm desk lamp, rain streaking the window, a few posters on the wall, wide composition. Original pixel art, cozy mobile simulation game style, warm humorous mood, UK rainy-day palette of dusk indigo / slate blue / warm amber light, clean readable shapes, limited color palette, soft pixel dithering, 16-bit inspired, no text, no logos, no real university or brand marks, no watermark, original design, not based on Kairosoft or any existing game.

**`scene-library.png`**
> A university library interior during exam season, long study desks, tall bookshelves, scattered notes and coffee cups, a tired warm reading light, wide composition. Original pixel art, cozy mobile simulation game style, warm humorous mood, UK rainy-day palette of dusk indigo / slate blue / warm amber light, clean readable shapes, limited color palette, soft pixel dithering, 16-bit inspired, no text, no logos, no real university or brand marks, no watermark, original design, not based on Kairosoft or any existing game.

**`scene-career-fair.png`**
> A busy university career fair hall, rows of recruitment booths and blank banners with no readable text, students in smart clothes carrying tote bags, bright indoor lighting, wide composition. Original pixel art, cozy mobile simulation game style, warm humorous mood, UK rainy-day palette of dusk indigo / slate blue / warm amber light, clean readable shapes, limited color palette, soft pixel dithering, 16-bit inspired, no text, no logos, no real university or brand marks, no watermark, original design, not based on Kairosoft or any existing game.

---

## Ending illustrations (16) — wired now, square (1024x1024)

Filenames match the ending ids exactly.

**`ending_distinction.png`** (圆满)
> A Chinese student in a graduation gown holding a top-grade transcript, proud and a little tearful, golden hall light, celebratory mood. [pixel-art style spine as above]

**`ending_job_offer.png`** (圆满)
> A Chinese student reading an offer email on a laptop, fist clenched in quiet triumph, a polished CV and sticky notes around, warm morning light. [pixel-art style spine as above]

**`ending_phd.png`** (圆满)
> A Chinese student holding a PhD acceptance letter, surrounded by research papers and a microscope, hopeful academic mood, soft lamp light. [pixel-art style spine as above]

**`ending_intern_to_fulltime.png`** (圆满)
> A Chinese student shaking hands with a manager in an office, receiving a contract on the last day of an internship, warm collegial mood. [pixel-art style spine as above]

**`ending_social_star.png`** (圆满)
> A Chinese student surrounded by a diverse crowd of friends at a graduation party, everyone waving, gentle confetti, warm lively colors. [pixel-art style spine as above]

**`ending_return_home.png`** (圆满)
> A Chinese student arriving home with a suitcase at the door, a family dinner table full of home-cooked dishes, warm reunion, evening light. [pixel-art style spine as above]

**`ending_survivor.png`** (圆满)
> A Chinese student walking across a graduation stage, calm and relieved, steady warm light, modest triumph. [pixel-art style spine as above]

**`ending_rain_philosopher.png`** (隐藏)
> A Chinese student standing under an umbrella at a quiet bus stop in the rain, looking thoughtful and at peace, reflective blue-and-amber palette. [pixel-art style spine as above]

**`ending_grew_but_unsure.png`** (五味杂陈)
> A Chinese student at a crossroads on a foggy UK street, backpack on, looking ahead, uncertain but matured, soft muted palette. [pixel-art style spine as above]

**`ending_ordinary.png`** (五味杂陈)
> A Chinese student quietly closing a dorm door for the last time, a packed suitcase beside them, a small smile, ordinary bittersweet warmth. [pixel-art style spine as above]

**`ending_burnout.png`** (遗憾)
> A Chinese student resting their head on a desk piled with books, exhausted, a warm blanket over the shoulders, gentle and non-judgmental mood, soft light. [pixel-art style spine as above]

**`ending_health_collapse.png`** (遗憾)
> A Chinese student resting in bed with tea and medicine on the nightstand, slowly recovering, soft caring light, hopeful rather than grim. [pixel-art style spine as above]

**`ending_bankruptcy.png`** (遗憾)
> A Chinese student at a kitchen table looking at an empty wallet and a stack of bills, worried but resolute, muted evening light. [pixel-art style spine as above]

**`ending_homesick_quit.png`** (五味杂陈)
> A Chinese student at an airport holding a return ticket home, bittersweet expression, soft dawn light, gentle mood. [pixel-art style spine as above]

**`ending_resit_exam.png`** (五味杂陈)
> A Chinese student studying alone in summer for a resit exam, a quiet empty campus through the window, determined second-chance mood. [pixel-art style spine as above]

**`ending_midnight_lonely.png`** (五味杂陈)
> A Chinese student on a late-night video call to family from a dim dorm room, tears and a small smile, warm phone glow in the dark. [pixel-art style spine as above]

---

## Notes
- "[pixel-art style spine as above]" = paste the full **Shared style spine** sentence from the top. Each prompt needs it inline for a consistent look.
- Want pixel **character sprites**, **stat/action icons**, or extra scenes (中超 / 火车站 / 毕业典礼 / 雨夜街道)? They aren't shown in the current UI, so they need a small wiring change first. Ask and I'll add the display slots, then extend this list.
