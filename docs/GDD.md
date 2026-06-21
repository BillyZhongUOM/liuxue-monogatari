# Game Design Document — 英伦留学物语

## One-line pitch
扮演一名刚落地英国的中国留学生，在雨天、deadline、part-time、小组作业和毕业焦虑里，把这一年过成自己想要的样子。

## Pillars
- **共鸣**: every event should make a real student-abroad go "这也太真实了".
- **代价**: every choice trades something for something. No free wins.
- **再玩一局**: different starts + routes + endings reward another run.
- **单手可玩**: mobile-first, tap-only, readable Chinese.

## Core loop
1. A new week begins; the HUD shows your 12 stats and 3 action points.
2. Spend each action point on a deliberate action (study / work / social / rest / career / life / admin).
3. Risky actions and the weekend may fire a random event with a choice.
4. Stats change; route affinity accrues.
5. Weekend settles rent and stipend, applies passive drift, and rolls the calendar.
6. End-of-term assessment; end-of-year finale picks an ending. Crises can end a run early.

## Time
- 1 academic year = 3 terms x 12 weeks = 36 weeks (engine supports more years).
- 3 action points per week (traits and low energy/health/stress adjust this).

## Stats (engine: `src/game/constants.ts`)
money (£ scale), energy, stress↓, gpa, english, social, career, adaptation, health, visa, homesick↓, reputation.
Each has min/max, a danger threshold, and a tooltip. (↓ = higher is worse.)

## Routes (8)
学霸 scholar · 打工 grind · 社牛 social · 求职 career · 佛系 chill · 申博 phd · 回国 homebound · 稳稳毕业 survivor.
Actions and event choices add route weight; the leading route gates some events and endings.

## Actions (17 in MVP)
图书馆自习 / 赶 essay / 小组作业开会 / 去上课 / office hour / part-time / 自己做饭 / 中超采购 / 社团 / 和家里视频 / 睡一整天 / 健身房 / 城市探索 / 改 CV / 投实习 / career fair / 签证材料. Each: AP cost, effects, tags, route weights, optional unlock gate, optional incidental-event pool, repeat fatigue.

## Events
Data-driven, declarative trigger conditions (`Condition` DSL), weighted draw, recent-repeat suppression, once-per-game flags, named pools for action incidents (essay / group / part-time / jobhunt / social) plus a general weekly pool. MVP ships 20; target 80+.

## Endings
Crisis (can fire any week): burnout, health collapse, bankruptcy, homesick-quit.
Finale (end of year, priority-ordered): distinction, job offer, PhD, social star, return home, survivor graduation, and an always-true catch-all (平凡的一年). MVP ships 10; target 14+. Endings are tone-bucketed (good / mixed / bad / special), never a bare pass/fail.

## Balance intent (`src/data` + engine)
- First run is understandable but not a guaranteed clean sweep.
- No single dominant action: high-yield actions cost energy, stress, money or GPA.
- Random events nudge, they do not nuke a sound strategy (recent-repeat guard + bounded effects).
- Danger thresholds give early warnings before a crisis ending.

## Content targets vs MVP status
| Content | Target | MVP shipped |
|---|---|---|
| Random events | 80+ | 20 |
| Actions | 30 | 17 |
| Endings | 12+ | 10 |
| Traits | 20 | 9 |
| Routes | 8 | 8 |

MVP is fully playable end-to-end (verified: menu → creation → play → events → weekly settle → endings, with save/load, on a 375px mobile viewport, engine unit-tested). Remaining content is expanded as data against the same schema.

## Verification
`npm run test` runs the pure engine plus a full-playthrough harness that drives several strategies to an ending and asserts no NaN, no out-of-range stat, no softlock, and deterministic outcomes.
