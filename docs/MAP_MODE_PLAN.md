# 《英伦留学物语》地图模式设计方案 (Game Director / System Design)

定位先说死: 这是一次**表现层 + 交互层重构**。`src/game/` 一个字节都不动, 现有 `takeAction(state, id)` / `advanceWeek(state)` / `availableActions(state)` / `resolveEvent` / `continueFromWeekly` 这五个纯函数就是整个地图模式的全部"游戏逻辑入口"。地图层只做三件事: 读 `GameState`、把地点画出来、在合适时机调上面那五个函数。下面六节按你的提纲走, 务实可落地。

一条关键认知, 贯穿全文: 引擎里 `GameAction.unlock` 已经是声明式 `Condition`, 而 `availableActions(state)` 已经会按 unlock 过滤。**这意味着"地点解锁 / 行动解锁"几乎是免费的**, 不用写引擎, 只要给 action 加 `unlock` 字段、再把 action 按地点分组即可。这是本方案能轻量落地的根基。

---

## 1) 渲染 / 移动技术选型 (拍板)

**拍板: M1 用纯 DOM/CSS 绝对定位 + CSS transform 补间, 不引任何渲染库; 到 M3 小人逐格行走动画跑顺、确认要精灵帧动画和相机时, 再评估是否升级 PixiJS v8。移动控制一律用"点地点自动寻路" (tap-to-move)。**

为什么不一上来就上 PixiJS, 跟技术研究的结论略有出入, 这里给出游戏总监视角的取舍:

- 你的场景是**15 个固定地点 + 1 个主角**的"节点地图", 不是连续可走的开放地块。研究里 PixiJS 的优势(WebGL 批渲染、精灵图集、相机)是为"几百个动态精灵 + 连续大地图"准备的, 你这里一个都用不满。
- 15 个地点 = 15 个 `<button>`/`<div>`, 1 个主角 = 1 个 `<div>`。这点 DOM 量在移动端零压力, 不存在研究里担心的"格子一多重排掉帧"(那是几百个格子的网格棋盘场景, 不是 15 个热点)。
- DOM 方案让 HUD、对话框、地点气泡、数值飘字**全在同一棵 React 树里**, 共享 Zustand、共享主题色变量、共享中文字体, 不用处理 canvas 与 DOM 两套坐标系和两套点击命中。移动端最怕的就是 canvas 浮层和 DOM 浮层对不齐。
- 像素风在 DOM 里就一行 `image-rendering: pixelated` + 整数倍 `scale()`, 够用。
- 这一步零新依赖, 完全符合"纯客户端可落地、包体不膨胀"硬约束。

**升级触发条件写清楚**(给未来留路, 不提前背包袱): 当满足以下任一, 再引 `pixi.js` + `easystarjs`: (a) 主角要 4 向逐帧行走精灵动画且 DOM `steps()` 雪碧图扛不住; (b) 地图要做成可自由走的网格而非节点跳转; (c) 要相机跟随大地图。在那之前, DOM 完全够。**这不是"将就", 是按场景复杂度匹配工具**, 避免为用不到的能力付维护成本。

**移动控制 = tap-to-move**, 三种方案里它在"单手、低频、触发式交互"上全胜: 拇指偶尔点一下, 不全程压屏、不遮画面、和"点地点触发行动"天然是同一个手势。研究里这条结论直接采纳。M1 的"寻路"在节点地图上甚至不需要 A*: 地点是固定锚点, 主角从 A 到 B 直接走预定义路径或直线补间即可; 真正需要网格 A* 时才引 `easystarjs` (约 7 KB)。

**一句话选型**: M1 DOM + CSS transform + tap-to-move, 零依赖; PixiJS 作为 M3+ 的可选升级路径, 由明确触发条件激活。

---

## 2) 地图模式核心交互循环 (一周怎么过) + 与引擎解耦

### 2.1 一周在地图上的节奏

把现有"点行动卡列表"的一周, 翻译成"在地图上走动消耗行动点"的一周。**每周 3 个行动点 (`actionPoints`) = 这一周你能在地图上触发 3 次行动**, 节奏完全不变, 只是换了壳。

单次行动的完整链路:

```
玩家点地图上的某个地点 (如 library)
   │
   ▼
读 store: 这个地点此刻有哪些可用 action? (availableActions(state) 按地点分组后取交集)
   │
   ├─ 若 actionPoints <= 0 → 地点变灰, 点了只弹"本周行动点用完了, 去休息推进到下周"
   │
   ▼
主角小人沿路径走过去 (纯表现, 引擎完全不知道, 200 到 600ms 补间)
   │
   ▼
到达 → 弹出该地点的"行动菜单气泡"(这个地点挂着的 2 到 4 个 action, 每个显示名字/emoji/AP 消耗/数值预览)
   │
   ▼
玩家选一个 action → 调 store.takeAction(actionId)
   │            (store 内部 = nextState = takeAction(currentState, actionId); set({state: nextState}))
   │
   ▼
引擎返回 nextState: actionPoints 已 -1、stats 已变、可能 phase='event'
   │
   ├─ nextState.phase === 'event' → 弹事件 Modal (复用现有 resolveEvent)
   ├─ nextState.phase === 'ended' → 危机结局 (crisis ending 中途触发, 引擎已处理)
   └─ 否则 → HUD 数值飘字 (+8 学业 / -12 精力), 地图刷新, 行动点 -1
   │
   ▼
回到地图待命; 重复直到 actionPoints 用完
   │
   ▼
玩家点"睡觉/推进下一周"(挂在 dorm 的特殊操作, 或一个常驻的"结束本周"按钮)
   │
   ▼
调 store.advanceWeek() → 周结算 (房租/生活费/drift/日历前进) → phase='weekly' → 周报弹窗
   │
   ▼
周报关闭 → continueFromWeekly() → 可能 phase='event'(周末事件) 或回到 'playing'
   │
   ▼
新的一周, actionPoints 重置为 3, 地图上一切复位
```

**注意一个已有的引擎事实**: `takeAction` 不消耗"走路"。走路是纯表现。引擎里"花掉 1 AP"发生在 `takeAction` 内部 (`state.actionPoints -= action.apCost`)。所以**走过去是动画, 选行动才是事实**, 这条线划得很干净。

还有一个体验决策: **是否每点一个地点就强制走过去再弹菜单, 还是允许"远程点击直接弹菜单"?** 建议**走过去再弹** (这是上头感的来源, 见第 4 节), 但给一个"快速模式"开关 (设置里), 老玩家可关掉行走动画直接弹菜单, 照顾"单手碎片时间"硬约束。默认开走动画。

### 2.2 与引擎解耦的硬边界

Zustand store 是**唯一的桥**, 数据单向流。地图层是"只读 GameState + 调五个纯函数"的纯消费者。

```
┌───────────────────────────────────────────────────┐
│  src/game/  纯引擎 (本次改造一行不改)                  │
│  takeAction / advanceWeek / resolveEvent /          │
│  continueFromWeekly / availableActions  全是纯函数    │
└───────────────▲───────────────────────┬─────────────┘
                │ 传入 currentState       │ 返回 nextState
                │                        ▼
┌───────────────┴────────────────────────────────────┐
│  Zustand store (持有 GameState 快照, 唯一真相源)      │
│  actions:                                           │
│    takeAction(id)   = set(s => ({gs: engine.takeAction(s.gs, id)}))    │
│    advanceWeek()    = set(s => ({gs: engine.advanceWeek(s.gs)}))       │
│    resolveEvent(i)  = set(s => ({gs: engine.resolveEvent(s.gs, i)}))   │
│  派生 selector (地图层只认这些, 不认引擎内部结构):       │
│    selectActionPoints, selectStats, selectPhase,    │
│    selectAvailableActions, selectUnlockedLocations  │
└───────▲───────────────────────────────┬─────────────┘
        │ subscribe (只读)                │ dispatch (调上面的 store action)
        │                               │
┌───────┴───────────────────────────────┴─────────────┐
│  地图渲染层 (React DOM, 本次新增的全部代码集中在这)      │
│  <MapScene>                                          │
│    ├─ 读 selectUnlockedLocations → 渲染地点节点        │
│    ├─ 读 selectAvailableActions  → 决定每个地点亮/灰    │
│    ├─ 本地 UI 状态(不进引擎): 主角像素坐标/行走中/相机偏移 │
│    ├─ onTapLocation(locId): 走过去 → 弹菜单 → dispatch │
│  <HUD>      读 stats/AP, 数值飘字也在这                  │
│  <EventModal> / <WeeklyModal>  读 phase, 按钮 dispatch │
└──────────────────────────────────────────────────────┘
```

**四条解耦铁律**(直接写进代码 review checklist):

1. **地图层永远不写 `GameState`**。只能调 store 暴露的那几个 dispatch (它们内部才调引擎)。新增的纯表现态 (主角正在走的插值坐标 `playerPx`、是否行走中 `isWalking`、相机偏移、当前打开的地点菜单 `openLocationId`) 放在**一个独立的 UI-only store 或组件 local state**, 绝不塞进 `GameState`。理由: `GameState` 要存 localStorage、要 `structuredClone`、要单元测试, 污染它会破坏存档和测试。
2. **"地点 → 有哪些行动"的映射, 是地图层的数据, 不是引擎的数据**。引擎只知道 17 个 action 和它们的 `unlock`。地图层维护一张 `LOCATION_ACTIONS: Record<LocationId, actionId[]>` (见第 3 节), 渲染时取 `availableActions(state)` 与该地点 action 列表的交集。引擎完全不需要知道"地点"这个概念。
3. **走路是表现, 到达不触发任何引擎调用**。只有玩家在到达后的菜单里**主动选了一个 action**, 才 `dispatch(takeAction)`。纯探索式走来走去 (比如就想看看小人走路) 完全不碰引擎, AP 不掉。
4. **phase 驱动一切弹窗**。地图层不自己判断"该弹事件了吗", 而是 subscribe `state.phase`: 变 `'event'` 就挂 `<EventModal>`, 变 `'weekly'` 就挂 `<WeeklyModal>`, 变 `'ended'` 就挂结局页。引擎已经把所有相位转换算好了, 地图层只是"看 phase 渲染对应浮层"。

这样设计的好处: 将来若想做第 2 个游戏年 (`MAX_YEARS` 已支持 >1), 或重构引擎, 只要这几个 selector 输出形状不变, 地图层一行不用动。

---

## 3) 地图布局思路 (校园区 + 城市区, 解锁体现成长)

### 3.1 两区布局 (原创, 不抄游戏发展国的具体排布)

不做一张大地图, 做**两个可左右切换的分区** (移动端竖屏一屏放不下 15 个点)。顶部一个"校园 / 城市"切页标签 (segmented control), 或左右滑切。这是原创布局, 不复刻任何现有游戏的地图形状。

**校园区 (Campus, 默认起始区)** —— 留学生 80% 时间所在, 步行可达, 视觉上紧凑温暖:
- `dorm` 宿舍 (主角的家, 出生点, 挂"睡觉回血 / 做饭 / 视频家里 / 推进下一周"; 永远是地图情绪锚点)
- `library` 图书馆 (自习 / 赶 essay)
- `lecture` 教学楼 (上课 / office hour / 小组作业开会)
- `society` 社团楼 (参加社团)
- `career` 职业中心 (改 CV / career fair / 投实习)
- `gym` 健身房 (健身)

**城市区 (Town, 通勤可达)** —— 视觉上更"外面、更冷一点、有雨", 暗示"出门是要花精力和钱的":
- `market` 中超超市 (采购家乡食材)
- `town` 城中心 (城市探索 / city walk)
- `work` 打工地点 (part-time)
- `clinic` 医院 GP (看病 / 心理咨询, 新行动)
- `bank` 银行 (新行动: 办学生账户 / 换汇 / 处理大额, 见第 3.3)
- `station` 火车站 (新行动: 周末旅行, 见第 3.3)
- `nightlife` 酒吧夜店 (新行动: 蹦迪, 见第 3.3)
- `mall` 商场 (新行动: 买奢侈品 / 网购, 见第 3.3)
- `park` 公园 (新行动: 散步 / 喂松鼠 / 野餐, 低消耗解压)

**布局即成本语义** (借自研究里"距离=机会成本"的抽象, 但不抄移动): 校园区的点彼此近, 走过去动画短; 城市区的点更散、更远, 走过去动画更长, **且城市区行动普遍 money/energy 消耗更高** (现有 `explore_city` 已经 -25 money / -6 energy, `part_time` -18 energy, 这套数值逻辑天然支持)。玩家会自然感到"出城是要付代价的", 这正是 Kairosoft "工位距离影响产出"的等价物 —— 我们用引擎已有的精力/金钱经济表达它, 而不是真做空间移动惩罚。

### 3.2 解锁节奏 (成长可视化的核心载体)

**这是把"地图扩张"翻译成"解锁面扩张"的地方** (研究里的关键移植点)。单主角没有"越盖越大的场地", 但有"可去的地方越来越多"。靠 `GameAction.unlock` 这个已有字段实现, 引擎零改动。

地点的"亮起"规则: **一个地点只要它名下至少有一个 action 通过了 `availableActions` 过滤, 就显示为可进入; 一个 action 都没解锁的地点显示为"灰色 + 锁图标 + 一句解锁提示"。**

| 阶段 | 触发条件 | 新亮起的地点 / 行动 | 传达的成长感 |
|---|---|---|---|
| 开局 (第 1 周) | 默认 | dorm / library / lecture / society / market / town / park | "刚落地, 先把吃住学搞定" |
| 第 2 周 | `minWeek: 2` (part_time 已有) | work 打工地点亮起 | "开始想办法挣钱了" |
| 第 4 周 | `minWeek: 4` (career_fair 已有) | career 职业中心亮起 | "开始操心前途了" |
| 第 6 周 | `minWeek: 6` (apply_internship 已有) | career 区 + 投实习全开 | "求职季来了" |
| 适应达标 | `statGte: { adaptation: 50 }` | nightlife 蹦迪 / station 旅行解锁 | "终于敢出去玩了, 不再缩在宿舍" |
| 攒够钱 | `statGte: { money: 1500 }` | mall 买奢侈品 / 高端网购解锁 | "钱包支棱起来了" |
| 健康/压力预警 | `statLte: { health: 35 }` 或 `statGte: { stress: 75 }` | clinic 医院主动提示就医 | "身体在喊停了" |
| 中后期 | `minWeek: 8` + 路线 | bank 大额理财 / station 跨城旅行 | "活成了半个本地人" |

这张表里**所有条件都是现成 `Condition` 字段** (`minWeek` / `statGte` / `statLte` / `leadingRouteIn`), 把它们填进新 action 的 `unlock` 即可。地图上灰→亮的那一下, 就是 Venture Towns "看着它变大"的留学版: **不是楼变高, 是世界对你打开**。配一个"叮 + 地点从灰渐亮 + 飘一行'解锁: 火车站, 可以去周末旅行了'"的小庆祝, 这就是分钟级到小时级的可视化奖励。

### 3.3 新增行动 (把行动做多做有趣, 全是纯数据, 加进 `src/data/actions.ts`)

你点名要的"买奢侈品/约会/旅行/蹦迪/网购/恋爱线", 全部可作为新 `GameAction` 数据落地, 挂到对应地点。下面给出**可直接抄进 `actions.ts` 的设计** (数值给了初值, 平衡待 `npm run test` 跑全程谐验):

```
// 挂 nightlife —— 蹦迪
id: 'clubbing'  名: '去蹦迪'  emoji: 🪩  apCost: 1
effects: { social: 9, stress: -12, energy: -16, money: -45, health: -4 }
tags: ['social','life']  routeWeights: { social: 3, chill: 1 }
unlock: { statGte: { adaptation: 50 } }
risk: { chance: 0.3, eventPool: 'nightlife_incidents' }   // 新事件池: 喝多/艳遇/钱包丢
repeatPenalty: { health: -6, money: -20 }

// 挂 mall —— 买奢侈品 (情绪消费, 高代价)
id: 'buy_luxury'  名: '买个包犒劳自己'  emoji: 👜  apCost: 1
effects: { stress: -16, homesick: -6, money: -350, reputation: 3 }
tags: ['life']  routeWeights: { chill: 1 }
unlock: { statGte: { money: 1500 } }
risk: { chance: 0.2, eventPool: 'spending_incidents' }   // 月底吃土/真香/退货

// 挂 mall 或 dorm —— 网购
id: 'online_shopping'  名: '深夜网购'  emoji: 📦  apCost: 1
effects: { stress: -8, homesick: -4, money: -80, energy: -2 }
tags: ['life']  routeWeights: { chill: 1 }
risk: { chance: 0.25, eventPool: 'spending_incidents' }   // 包裹丢/买到假货/捡漏

// 挂 station —— 周末旅行
id: 'weekend_trip'  名: '坐火车去周边玩'  emoji: 🚆  apCost: 2  (双 AP, 这是大行动)
effects: { adaptation: 8, stress: -18, social: 4, homesick: -8, money: -120, energy: -10, english: 2 }
tags: ['explore','life']  routeWeights: { chill: 3 }
unlock: { statGte: { adaptation: 50 }, minWeek: 6 }
risk: { chance: 0.3, eventPool: 'travel_incidents' }   // 火车延误/旅途艳遇/护照虚惊

// 挂 town 或 society —— 约会 (恋爱线入口, 用 flag 串成多段)
id: 'go_on_date'  名: '约会'  emoji: 💕  apCost: 1
effects: { social: 6, stress: -10, homesick: -8, energy: -6, money: -50 }
tags: ['social','life']  routeWeights: { social: 2, chill: 1 }
unlock: { statGte: { social: 45 } }
setFlags: { dating_progress: 1 }   // 配合事件: progress 累加推进恋爱线分支
risk: { chance: 0.45, eventPool: 'romance_incidents' }   // 心动/尴尬/异国恋异地难题

// 挂 clinic —— 看病 / 心理咨询
id: 'see_gp'  名: '去看 GP'  emoji: 🩺  apCost: 1
effects: { health: 14, stress: -6, energy: -4, money: -10 }
tags: ['life','admin']  routeWeights: { survivor: 1 }
unlock: { statLte: { health: 50 } }   // 身体不好时才会出现, 是"系统在关心你"

// 挂 bank —— 理财/换汇 (后期金钱管理)
id: 'manage_money'  名: '去银行打理账户'  emoji: 🏦  apCost: 1
effects: { money: 40, stress: -4, adaptation: 3, energy: -4 }
tags: ['admin','life']  routeWeights: { homebound: 1, survivor: 1 }
unlock: { minWeek: 8 }

// 挂 park —— 散步 (低消耗解压, 给佛系线/低精力时的温柔选项)
id: 'walk_park'  名: '去公园发呆'  emoji: 🌳  apCost: 1
effects: { stress: -10, energy: 4, health: 4, homesick: -3 }
tags: ['rest','life']  routeWeights: { chill: 2 }
```

**恋爱线**作为"组合发现"的旗舰: `go_on_date` 每次 `setFlags: { dating_progress: +N }` (注意引擎 setFlags 是覆盖式, 实际实现用一个累加事件或在 romance 事件里递增), 配合 `romance_incidents` 事件池, 用 `flagEquals`/`statGte` 条件串出"暧昧 → 在一起 → 异地/文化冲突 → 修成正果或和平分手"的多段剧情, 甚至触发一个隐藏结局 `ending_found_love`。这完全复用现有 events DSL + once-per-game flag, 是"类型×题材藏组合"的留学版。

这批新行动让地图模式上线即有**约 26 个行动** (现 17 + 新 9), 直接逼近 GDD 里 30 的目标, 顺手填了内容缺口。

---

## 4) 怎么做出游戏发展国的"上头感" (原创实现)

研究给了上头感的四级反馈链 (秒级飘字 / 分钟级数值可视化 / 小时级地图扩张 / 跨周目收集)。地图模式的任务是把这四级**全部演出来**, 且全部用原创呈现, 不碰 Kairosoft 的任何美术/UI/角色。

**秒级 —— 移动本身 + 数值飘字 (最高性价比, M1 就做)**
- 主角走过去这个动作本身就是即时反馈: 你点了, 屏幕立刻有东西在动、在响应你。这比"点一张静态卡"强的核心就在这。
- 行动结算瞬间, 在 HUD 对应数值旁飘出 `+8 学业` (绿) / `-12 精力` (红), 80 到 120ms 上浮淡出, 配一个极短的像素"叮/咔"音效。引擎的 settle 本来就有这些 delta, 现在只是把它"演"出来。**这是补上你"太静态"病根的第一针**。
- 主角到达地点时头顶冒一个对应 emoji 气泡 (📖/💼/🪩), 呼应研究里"角色头顶飘字"的生命感, 但用我们自己的像素气泡。

**分钟级 —— 数值成长可视化 (M3/M4)**
- 12 个 stat 给迷你趋势: HUD 上每个 stat 条带一个 7 周 sparkline 或"本周 vs 上周"的小箭头。
- 地图本身做成"会随你成长变化的活物": 适应度高了, 城市区的"雨"特效减弱、天色变暖; 社交高了, 地图上偶尔有 NPC 小人路过和你打招呼 (纯装饰, 不可操作, 不是被你管理的员工 —— 守住"单主角"红线); 钱多了, 宿舍的像素装饰升级 (从空房间到有绿植/海报)。**这是"看着它变大"的留学版: 不是镇子变大, 是你的世界变得有人气、有暖意**。

**小时级 —— 解锁扩张 (第 3.2 节已设计)**
- 地点灰→亮的庆祝时刻就是这一级。每解锁一个新地点 = 一个看得见的"我在前进"里程碑。

**跨周目 —— 收集 / 名人堂 (M4, 引擎已埋好钩子)**
- 引擎 `GameState.unlockedEndings` 已经在累积每次玩到的结局 id, **16 个结局 + 已有 Gemini 像素结局图**就是现成的"名人堂藏品"。做一个"留学回忆册"页: 16 个结局格子, 没解锁的是剪影 + "???", 解锁的点亮显示像素图 + quip。这驱动"为了集齐结局再玩一局"。
- 进阶收集: 把"恋爱线修成正果""集齐 8 条路线各通关一次""第一次蹦迪""第一次拿 Distinction"做成成就徽章墙 (用 flags 判定, 纯 UI)。这对应研究里的 combo 收集表。

**里程碑揭晓弹窗 (把静默改数值变成有仪式感的事件)**
- 期末出成绩、求职面试结果、签证审批、恋爱告白回应这类节点, 做成有适度随机的"揭晓"弹窗 (进度条转一下再翻牌), 像 Kairosoft 评分揭晓。但严守 GDD "random events nudge, not nuke" —— 随机只影响"惊喜程度", 不逆转你一学期的努力, 不学它被诟病的"无理由发挥失常"。

四级反馈链全部用我们自己的像素气泡、琥珀强调色、中文文案实现。**借的是"飘字/可视化/扩张/收集"这四种抽象反馈模式, 不是任何具体画面。**

---

## 5) 分阶段里程碑 M1 → M4

工作量 S = 半天到 1 天, M = 2 到 4 天, L = 1 周+。每个 milestone 标清改哪些文件、工作量、风险。**贯穿原则: `src/game/` 全程不改, 所有改动集中在新建的 `src/map/` 和 `src/data/actions.ts`。**

### M1 — 最小可玩 (静态地图 + 点地点走过去 + 触发现有行动)

**目标**: 一张静态像素双区图, 15 个地点节点, 点一个 → 主角 DOM 补间走过去 → 弹该地点的行动菜单 → 选行动调 `takeAction` → HUD 数值变 → 行动点 -1。dorm 有"推进下一周"调 `advanceWeek`。事件/周报先复用现有 Modal。**老的行动列表 UI 保留为可切换的备用视图** (降风险, 万一地图有问题能退回)。

| 改什么 | 文件 | 说明 |
|---|---|---|
| 新建地点数据 | `src/map/locations.ts` (新) | `LocationId` 类型 + `LOCATIONS` 数组 (id/中文名/emoji/区/像素坐标 x,y) + `LOCATION_ACTIONS: Record<LocationId, actionId[]>` 把现有 17 个 action 分配到 15 个地点 |
| 地图场景组件 | `src/map/MapScene.tsx` (新) | 渲染两区 + 地点节点 + 主角 div; 点击 → 走动画 → 开菜单 |
| 地点行动菜单 | `src/map/LocationSheet.tsx` (新) | 到达后从底部弹起的行动气泡, 列出该地点 `availableActions ∩ LOCATION_ACTIONS[loc]` |
| UI-only 表现态 store | `src/map/mapUiStore.ts` (新) | playerPx / isWalking / activeZone / openLocationId, 不进 GameState |
| store 暴露 selector | 现有 zustand store 文件 | 加 `selectAvailableActions`/`selectActionPoints` 等只读派生 (若已有则跳过) |
| 接进主界面 | 现有 App/play 页 | playing 相位渲染 `<MapScene>` 替代行动列表 (留 toggle) |

**工作量**: M (3 到 4 天)。**风险**:
- *地点坐标在不同屏宽下错位* —— 用百分比/viewBox 相对坐标, 不用绝对 px; 早期就在 375px 真机量。
- *走路补间和点击的竞态* (走到一半又点别处) —— 行走中锁输入或打断重寻路, M1 先简单锁住。
- *AP 用完后地点该灰* —— 别忘了 `actionPoints<=0` 时所有地点置灰, 否则玩家点了没反应会困惑。

### M2 — 地点解锁 + 行动扩充 (世界开始长大 + 行动变多变有趣)

**目标**: 上第 3.3 节的 9 个新行动; 实现第 3.2 节的灰→亮解锁; 加解锁庆祝小动画。这一步几乎全是**数据工作**, 代码极少。

| 改什么 | 文件 | 说明 |
|---|---|---|
| 加 9 个新行动 | `src/data/actions.ts` | 蹦迪/买奢侈品/网购/旅行/约会/看 GP/理财/散步 + `unlock` 条件 |
| 新事件池 | `src/data/events.ts` | nightlife / spending / travel / romance 四个 incident 池, 各 3 到 5 个事件; 恋爱线多段串 flag |
| 地点解锁渲染 | `src/map/MapScene.tsx` | 灰/锁/提示态 + 解锁瞬间渐亮 + "叮"庆祝 |
| 地点↔新行动映射 | `src/map/locations.ts` | 把 9 个新行动挂到 nightlife/mall/station/clinic/bank/park |

**工作量**: M (2 到 3 天, 大头是写中文事件文案 + 跑平衡)。**风险**:
- *新行动破坏数值平衡* —— 必跑 `npm run test` 全程谐验 (no NaN / no out-of-range / no softlock); 蹦迪/旅行的高消耗别让低预算开局直接破产软锁。
- *恋爱线 flag 累加* —— 引擎 `setFlags` 是覆盖不是累加, 进度递增要在事件 choice 里读旧值写新值, 或用多个布尔 flag 分段, 别假设 `+1` 能直接累计。
- *解锁提示文案* —— 中文不用破折号, 用逗号或"到"。

### M3 — 小人动画 + 即时反馈演出 (上头感成形)

**目标**: 主角从"方块滑过去"升级成"像素小人走路"; 数值飘字 + 音效; 到达气泡; 决定是否引 PixiJS。

| 改什么 | 文件 | 说明 |
|---|---|---|
| 主角行走动画 | `src/map/Player.tsx` (新) | DOM `steps()` 雪碧图 4 向行走帧; 若扛不住再上 PixiJS (此处是升级决策点) |
| 数值飘字 | `src/map/FloatingDelta.tsx` (新) + HUD | takeAction 后对比 prev/next stats, 对变化的 stat 飘 `+8 学业`/`-12 精力` |
| 音效 | `src/map/sfx.ts` (新) | 极短像素音: 走/到达/数值涨/数值跌/解锁; Web Audio, 可静音 |
| 到达 emoji 气泡 | `src/map/MapScene.tsx` | 主角头顶冒该行动 emoji |
| (可选)引渲染库 | `package.json` | 仅当 DOM 帧动画不够时 `npm i pixi.js`; 否则不引 |

**工作量**: M 到 L (3 到 5 天, 取决于是否上 PixiJS)。**风险**:
- *飘字要对比 prev/next* —— store 的 takeAction 要能拿到调用前的 stats 快照传给飘字层; 在 store action 里 `const prev = get().gs.stats` 即可。
- *音效在移动端需用户手势解锁 AudioContext* —— 首次点击时 resume, 否则 iOS 静音。
- *PixiJS 升级是大事* —— 若触发, canvas 与 DOM HUD 的层叠/点击穿透要重测; 这是本方案最大的潜在工程量, 故设为"按需触发"而非默认。

### M4 — 完整 (天气/氛围 + 弹窗仪式 + 收集名人堂 + 周报地图化)

**目标**: 地图随成长变活 (天气/人气/宿舍装饰); 期末/求职/签证/告白做成揭晓弹窗; 留学回忆册 (16 结局名人堂) + 成就墙; 周报做成"这一周在地图上的足迹"。

| 改什么 | 文件 | 说明 |
|---|---|---|
| 天气/氛围层 | `src/map/Ambiance.tsx` (新) | 读 adaptation/social/money/term → 雨量/天色/路人/宿舍装饰; 纯装饰 |
| 揭晓弹窗 | `src/map/RevealModal.tsx` (新) | 期末成绩/面试/签证/告白翻牌动画; 包现有 resolveEvent/term 结算 |
| 回忆册 / 名人堂 | `src/map/HallOfMemories.tsx` (新) | 读 `unlockedEndings` 渲染 16 格 (剪影/点亮 + Gemini 图 + quip) |
| 成就墙 | `src/map/Achievements.tsx` (新) + 判定数据 | 用 flags/路线/结局判定徽章 |
| 周报地图化 | `src/map/WeeklyModal` | 周末事件 + "本周去了哪几个地点"的足迹回放 |
| sparkline | HUD 组件 | 12 stat 的 7 周趋势 |

**工作量**: L (1 周+)。**风险**:
- *氛围层别误伤"单主角"红线* —— 路人 NPC 只能是装饰背景, 不可点、不可管理、不是产出单位; 一旦能交互就滑向"管一群人", 违背共鸣支柱。
- *性能* —— 天气粒子 + sparkline + 多浮层在低端安卓机, 粒子数封顶、sparkline 用 SVG path 不用 canvas、静止时停动画循环。
- *名人堂剧透* —— 未解锁结局只显示剪影和 "???", 别暴露标题剧透。

**里程碑依赖关系**: M1 是地基 (能玩); M2 纯数据 (能玩得久, 可与 M3 并行); M3 给"手感/上头"; M4 给"留存/周目"。**M1+M2 上线即是一个比现状好得多的可玩版本**, M3/M4 是体验纵深。

---

## 6) 移动端布局 (竖屏 375px 单手, 琥珀单色)

竖屏从上到下三段式, 守"单手可玩、tap-only"硬约束 (主要交互区落在拇指可达的下 2/3 屏):

```
┌─────────────────────────────┐  ← 顶部 HUD 条 (固定, 约 12% 高)
│ 第1年 T2 W5   🟡●●○ 行动点    │   时间 + 行动点圆点 (满/空) + 钱
│ [校园] [城市]  ☰回忆册/设置    │   分区切页 segmented + 菜单入口
├─────────────────────────────┤
│                             │
│      地图区 (约 60% 高)       │   ← 主舞台: 像素地点节点 + 主角小人
│   📚lib   🎓lec   🎉soc      │     地点间距够大, 拇指点不误触
│        🚶 (主角)            │     当前可去=亮+琥珀描边, 锁=灰+🔒
│   🛌dorm  💼career  🏋gym    │     tap 地点 → 走过去 → 弹底部菜单
│                             │
├─────────────────────────────┤
│  12 状态迷你条 (约 16% 高)     │   ← 可上滑展开成完整面板
│  📚72↑ ⚡58↓ 🔥40 💷£1.2k ... │     紧凑横排, 涨绿跌红 + 箭头
├─────────────────────────────┤
│  [ 🛌 推进到下一周 ]          │  ← 底部主操作条 (固定, 约 10%)
└─────────────────────────────┘     拇指最顺位; AP 用完时高亮提示点这
```

**关键比例与排布决策**:
- **地图区占主舞台约 60%**, 是视觉和交互重心 —— 因为"地图模式"的卖点就是地图。地点节点尺寸 ≥ 44×44pt (苹果触控下限), 彼此留白足, 防误触。
- **HUD 顶部条只放最高频信息**: 时间进度、行动点 (3 个圆点, 直观"还能做几件事")、钱。其余 12 状态放屏幕**下部迷你条**, 因为拇指在下方, 想细看一上滑展开成全屏面板 (复用现有 HUD)。
- **底部固定一条主操作"推进到下一周"** (本质调 `advanceWeek`), 永远在拇指最舒服的位置。AP 归零时这条按钮琥珀高亮 + 轻微脉冲, 引导玩家"这周做完了, 点这里"。
- **行动菜单从底部弹起 (bottom sheet)**, 不用中央弹窗 —— 底部弹起单手够得着, 中央弹窗要够到屏幕中上部。菜单里每个行动一行: emoji + 名字 + AP 消耗点 + 关键数值预览 (如 `学业+ 精力−`), 点一下即 `takeAction`。
- **事件/周报/揭晓**用接近全屏的浮层 (信息量大, 要沉浸), 但确认按钮一律压在屏幕下缘拇指区。
- **单一琥珀强调色** (硬约束): 整个地图基底走中性灰/暖灰像素调, **琥珀只用在"现在该看这里"的地方** —— 可去地点的描边、行动点剩余圆点、解锁高亮、主操作按钮、数值上涨。锁定地点、背景、未变化数值一律去色/灰阶。这样一眼就知道"下一步能干嘛", 符合单手快速决策。
- **横屏**: 不强求, 竖屏优先。若做横屏, 地图左 70% + 状态/操作右 30% 侧栏。

---

## 落地清单 (给开发的第一周 TODO)

1. 建 `src/map/locations.ts`: 15 个 `LocationId` + 双区坐标 + `LOCATION_ACTIONS` 把现有 17 action 分到地点 (纯查表, 半天)。
2. 建 `mapUiStore.ts`: 装主角坐标/行走态/分区, 与 `GameState` 物理隔离。
3. 建 `MapScene.tsx` + `LocationSheet.tsx`: 点地点 → DOM transform 走过去 → 底部弹行动菜单 → 调 store 的 `takeAction`/`advanceWeek`。
4. play 相位渲染 `<MapScene>`, 保留旧列表为 toggle 备用视图。
5. `npm run test` / `typecheck` / `build` 全绿, 375px 真机过一遍 → M1 完成。

**全程红线**: `src/game/` 不改; 新表现态不进 `GameState`; 走路是表现、选行动才调引擎; 中文文案无破折号; 单主角不引入可管理的 NPC 群; 不复刻任何现有游戏的美术/地图/角色; 不出现真实学校品牌; 单一琥珀强调色。

相关文件 (绝对路径):
- 引擎契约 (只读, 设计依据): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/game/engine.ts` (`takeAction`/`advanceWeek`/`availableActions`/`resolveEvent`/`continueFromWeekly`), `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/game/types.ts` (`GameAction.unlock: Condition`, `GameState`), `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/game/constants.ts` (`WEEKS_PER_TERM=12`/`TERMS_PER_YEAR=3`/`MAX_YEARS=1`/`BASE_ACTION_POINTS=3`/12 stat meta)
- 内容落点 (要改): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/data/actions.ts` (加 9 新行动), `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/data/events.ts` (4 新事件池), `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/data/endings.ts` (`unlockedEndings` 已是现成名人堂数据源)
- 新增地图层 (待建): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/map/` (locations.ts / MapScene.tsx / LocationSheet.tsx / mapUiStore.ts / Player.tsx / FloatingDelta.tsx 等)
- 原创性红线: `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/CLAUDE.md`