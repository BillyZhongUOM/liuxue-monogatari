我已经完整掌握了引擎: `Condition` DSL 的全部字段、`flags` 支持 boolean/number/string (`FlagValue`)、`routeScores` 累加机制、`risk.eventPool` 命名事件池、`setFlags` 在 action 和 choice 上都能写、以及现在那个静态 `ActionGrid` 列表 UI。每个点子都只复用这些既有能力,不碰引擎纯函数。

下面是给包工头的设计交付,直接返回。

---

# 《英伦留学物语》游玩中段系统点子 (8 个 + 落地优先级)

## 设计前提 (已核对引擎,所有点子据此)

- **可写不可改**: `flags`(任意 bool/number/string)、`routeScores`(8 路线累加)、`Condition` DSL(`flagsSet/flagsNotSet/flagEquals/statGte/statLte/minWeek/minTerm/leadingRouteIn/cityIn/majorIn/hasTraits`)、命名 `eventPool` + `risk.chance`、`action.setFlags` / `choice.setFlags`。
- **关键发现**: `FlagValue` 已支持 **number 与 string**,所以好感度计数、地点熟练度、连锁阶段都用 flag 数值存,**完全不动 GameState 结构**。
- **关键发现**: `evaluateCondition` 里 `minWeek` 比的是 `totalWeeks`(全局周),`minTerm` 比的是绝对学期 `(year-1)*3+term`。节日靠 `minWeek` 区间卡点天然可行。
- **地图本质**: 地图模式只是把现有 `availableActions(state)` 的列表**换一种空间化呈现** —— 地点 = action 的视觉聚类,走到地点 = 调 `act(id)`。引擎一行不改。下面点子 1 是地图骨架,2 到 8 是往这个骨架里塞的"有趣内容",全部以 data 形式落地。

---

## 点子 1 —— 俯视像素地图 + 小人寻路 (表现层骨架,先做这个)

**是什么**: 把现在竖排的 `ActionGrid` 列表换成一张单屏俯视像素地图。地图上 6 到 8 个**地点图钉**(图书馆/宿舍/中超/健身房/社团楼/打工店/城市/职业中心)。点地点 → 小人沿网格走过去 → 到达后弹出**该地点的行动抽屉**(一个 bottom-sheet,列出绑定到这个地点的 action 卡)→ 点卡 = 现有 `act(id)`。地点用 `data-tag` 把现有 action 按 `tags` 聚类(study 类去图书馆,social 去社团楼,work 去打工店,cook/life 去宿舍/中超,rest 去健身房,career 去职业中心,explore 去城市出口)。

**为什么有趣**: 同样的 3 个行动点,从"读列表勾选"变成"今天先去哪",有了空间决策和身体感。小人移动 + 到达动画提供 Kairosoft 那种"看着小人忙活"的治愈反馈,而这一切零引擎改动。

**怎么落地**:
- 新建 `src/data/places.ts`: `Place { id, name, emoji, gx, gy(网格坐标), tags: string[], unlock?: Condition }`。地点行动抽屉 = `availableActions(state).filter(a => a.tags.some(t => place.tags.includes(t)))`。
- 新建 `src/ui/MapView.tsx` 替换 `play.tsx` 里的 `<ActionGrid>`。SVG 或 CSS-grid 画地图;小人用 CSS `transform: translate` + `transition` 做格到格移动(纯 CSS,移动端流畅)。
- 行动点 `actionPoints` 耗尽 → 地图变灰,只剩"进入下周"。完全沿用现有 `out` 判断。
- **原创性**: 自己排地图布局和图钉造型,不抄发展国的格子风;琥珀色只用在"当前可去/有新事件"的高亮描边。
- 引擎: **零改动**。这是纯 `src/ui` + 一份 `places.ts`。

**工作量**: **L** (新地图组件 + 寻路动画 + 抽屉,是整个改造的地基,但范围清晰)。

---

## 点子 2 —— 地点熟练度 + 常去羁绊 (数值地图的灵魂)

**是什么**: 每个地点积累"熟练度",存为 flag 数值 `place_visits_<id>`(每次到达 +1,在 action 的 `setFlags` 里写,或在 MapView 到达回调里 `act` 前自增)。熟练度到阈值,地图上该图钉**点亮一个琥珀小徽章**,并解锁该地点的**专属高阶行动 / 专属事件池**。例: 图书馆去满 8 次解锁"占到了固定座位"(study 效果 +、stress 不再涨那么多);打工店去满 6 次解锁"店长信任你"(money 加成 + 触发 `regular_staff` 事件池)。

**为什么有趣**: 给"重复去同一个地方"一个长期回报,鼓励玩家形成自己的生活节奏和"据点",这正是地图模式区别于列表的核心爽点。也让 8 条路线在空间上自然分化(学霸的图书馆 vs 打工党的店铺都点满)。

**怎么落地**:
- flag 计数: action 自带 `setFlags` 不能做"自增"(只能赋固定值),所以在 **MapView 的到达回调**里读 `state.flags['place_visits_lib'] ?? 0` 再走一个轻量 store action 写回 —— 但为了**不碰引擎**,更干净的做法是给每个地点配一个**隐形 +1 行动**或用既有 `setFlags` 写阶段里程碑(见下)。最省事零改动方案: 用**阶段 flag** 而非精确计数 —— 在高阶 action 的 `unlock` 上挂 `flagsSet: ['lib_regular']`,而 `lib_regular` 由一个"连续去图书馆"的事件在 `essay_incidents`/新池里 `setFlags` 点亮。
- 专属行动 = 新 `GameAction`,`unlock: { flagsSet: ['lib_regular'] }`,绑同一 `tags`,自动只在该地点抽屉出现。
- 专属事件 = 新 `eventPool: 'lib_regular_pool'`,由该地点高阶 action 的 `risk` 拉取。
- routeScores: 据点行动给对应路线更高 `routeWeights`,强化路线绑定。

**工作量**: **M** (若用阶段 flag 走纯 data 路线则 S 到 M;若要精确次数计数,需在 store 加一个 3 行的 `visitPlace` mutator,仍不动纯引擎)。

---

## 点子 3 —— 恋爱 / 关系线 (好感度累积 + 专属结局)

**是什么**: 地图上新增一个"约会地点"(咖啡馆/河边/电影院,可随城市变)。引入 2 到 3 个可攻略对象(本地同学 / 同乡学长学姐 / 实验室搭档),每人一条好感线。好感度存为 flag 数值 `aff_<npc>`(0 到 100)。约会行动(`date_coffee` 等)消耗钱 + 行动点,按对象 `setFlags` 累加好感(用阶段制: `aff_mia_stage` 0→1→2→3)。每跨一个阶段触发该对象的**专属事件**(告白/见家长视频/异国分歧),最终在 finale 解锁**恋爱专属结局**。

**为什么有趣**: 留学故事里感情是最强情感钩子,给冰冷的 12 个数值一条人的暖线。约会还是"压力出口 + 想家解药"(降 stress/homesick)但有代价(花钱、占行动点、感情危机会反噬 stress),符合你要的"压力出口但有代价"。

**怎么落地**:
- 阶段 flag: `aff_mia_stage`(number),约会 action 的 `setFlags` 不能自增,所以**用阶段事件链推进**: 约会 action `setFlags: { dated_mia: true }` + `risk` 拉 `romance_mia_pool`;池里的告白事件 `cond: { flagEquals: { aff_mia_stage: 1 } }`,选"接受"则 `setFlags: { aff_mia_stage: 2 }`。每阶段一个事件,层层递进,**全部走现有 DSL**。
- 路线: 恋爱行动给新的隐性偏好,或复用 `social`/`homebound` routeWeights。
- 结局: 新增 `Ending`,`cond: { flagEquals: { aff_mia_stage: 3 }, statGte: { social: 60 } }`,`priority` 设在普通好结局之上,`crisis: false`(finale 触发)。配 Gemini 像素结局图。
- 危机分支: 感情破裂事件 `setFlags: { aff_mia_stage: 0, heartbroken: true }` + 大幅 stress/homesick,可联动点子 8 的连锁。

**工作量**: **M** (每个对象 ≈ 1 约会 action + 1 事件池(3 到 4 事件)+ 1 结局;纯 data。先做 1 个对象验证手感,再复制扩展)。

---

## 点子 4 —— 消费出口: 奢侈品 / 网购 / 蹦迪 (即时快乐,延迟账单)

**是什么**: 宿舍抽屉加"网购剁手",城市出口加"买个奢侈品"和"去蹦迪"。这些行动**即时降 stress/homesick、可能加 social/reputation**,但**花真金白银(money)**,且**埋下延迟代价 flag**: 剁手太多 `setFlags: { overspent: true }` → 触发"信用卡账单"事件;蹦迪 `risk` 拉 `nightlife_pool`(宿醉掉 health/energy、丢东西、也可能认识新朋友 + social 大涨)。

**为什么有趣**: 给 money 一个"花出去换情绪"的真实出口,把"省钱 vs 快乐"做成持续张力。蹦迪/奢侈品自带留学生活质感和幽默,且高风险高回报,让中段每周都有"我今天要不要放纵一下"的小赌博。

**怎么落地**:
- 纯新 `GameAction`: `splurge_luxury`(money -大、reputation/social +、stress -、`setFlags:{owns_luxury:true}`)、`online_shopping`(money -中、homesick/stress -、`risk: nightlife? no -> spend_pool`)、`clubbing`(money -、social/stress +/-、`risk:{chance:.5, eventPool:'nightlife_pool'}`,`unlock:{minWeek:3}`)。
- 延迟代价: 新事件池 `spend_pool` 里放"账单到了""被家里发现乱花钱(homesick+)";`nightlife_pool` 放宿醉/丢手机/艳遇。全部 `choice.effects` 带 trade-off。
- 联动点子 7 季节: 黑五/圣诞打折周这些行动**临时加成**(见点子 7)。
- routeScores: 给 `chill` 路线加权,让"佛系体验"路线有专属玩法。

**工作量**: **S** (3 个 action + 2 个事件池约 6 事件,全 data,零引擎改动)。

---

## 点子 5 —— 旅行系统 (周末出行,跨城刷新)

**是什么**: 城市出口图钉点开是"周末去哪"二级菜单: 周边小镇 / 苏格兰高地 / 欧洲廉航三档,按价格/耗时(行动点)/收益递增。旅行**大幅降 stress/homesick、涨 adaptation/social、留纪念 flag** `traveled_<dest>`,但烧钱 + 占当周多个行动点,且 `risk` 拉 `travel_pool`(廉航延误、护照虚惊、绝美日出、旅途搭子)。集齐多个 `traveled_*` flag 解锁"旅行家"成就事件 + reputation。

**为什么有趣**: 旅行是留学最高光的记忆点,作为"大额压力出口"和地图边界的延伸,给玩家攒钱的目标感("这周末值不值得飞一趟")。多目的地收集 + 随机旅途事件,提供中段的探索驱动力。

**怎么落地**:
- `GameAction` `trip_local / trip_highland / trip_euro`,`apCost: 2`(引擎 `apCost` 已支持任意值,`takeAction` 直接扣),`unlock: { minWeek: 5, statGte: { money: 阈值 } }`(钱不够直接不出现,零额外逻辑)。
- `setFlags: { traveled_euro: true }`;集齐事件 `cond: { flagsSet: ['traveled_local','traveled_highland','traveled_euro'] }`。
- 城市差异化: 用 `cityIn` 让"高地"只在爱丁堡便宜、"欧洲廉航"只在伦敦/曼城近机场,呼应已有城市设定。
- 节日联动: 复活节/暑假窗口旅行收益翻倍(点子 7)。

**工作量**: **M** (3 个分级 action + 1 travel 事件池 + 1 收集成就;`apCost:2` 已被引擎支持,无需改动)。

---

## 点子 6 —— 周任务 / 小目标卡 (每周一个轻挑战)

**是什么**: 每周开局,地图顶部弹一张**本周任务卡**(从任务库随机抽,按当前路线/数值/周数筛): 如"本周去 2 次图书馆""本周存款不低于 X""本周认识 1 个新朋友"。达成则周末结算给奖励(数值 + 一点 reputation + 琥珀色完成印章)。任务命中靠现有 flag/stat 在周末 `advanceWeek` 的结算点判定。

**为什么有趣**: 把开放的每周变成有"今日待办"的轻目标,给方向感和即时达成反馈,正是 Kairosoft 那种"被小目标推着往前"的节奏。也能温柔引导新手理解 12 个数值。

**怎么落地**:
- **挑战**: `advanceWeek` 是纯函数不宜塞 UI 逻辑,但任务判定可做成**"周初设条件 + 周末查 flag"**的纯 data 事件: 周初由一个"本周目标"系统事件 `setFlags: { quest_active: 'lib_twice', quest_done: false }`;到访图书馆的 action `setFlags` 在达成时点亮 `quest_done: true`;周末 `weekly` 池放一个"任务结算"事件 `cond: { flagEquals: { quest_active:'lib_twice', quest_done:true } }` 发奖。
- 若要精确"去 2 次"计数,需要次数 flag(点子 2 的 store mutator 复用);若用"去过就算"则纯 data 即可。**建议 v1 先做"做没做某事"的布尔任务**(零引擎改动),v2 再上计数。
- 任务库 `src/data/quests.ts`,每条 `{ id, text, setup: Effects?, cond: Condition, reward: Effects, routeWeights? }`。

**工作量**: **M** (布尔版 S 到 M;任务库 + 周初/周末两个挂钩事件。计数版需复用点子 2 的 3 行 mutator)。

---

## 点子 7 —— 季节 / 天气 / 节日地点皮肤 + 限定事件 (日历活起来)

**是什么**: 用 `totalWeeks` 把一年切成季节区间,地图**换季皮肤**(开学秋雨→圣诞灯→春节红→考试季→盛夏毕业),并在固定周开**限定地点/限定事件**: 圣诞集市(限定地点,几周后消失)、春节(已有 `ev_spring_festival`,可加"包饺子局"地点)、考试季(图书馆通宵开放、压力事件密集)、黑五(消费行动加成)。天气(雨/晴/雪)做轻表现层 + 微调当周户外行动收益。

**为什么有趣**: 让 36 周不再是均质循环,有了节气的盼头和"限时才有"的紧迫感(圣诞集市这周不去就没了)。节日精准戳留学生情感(一个人的春节、异乡的圣诞),和已有情感事件无缝接。

**怎么落地**:
- 季节 = `totalWeeks` 区间纯函数(在 MapView 选皮肤,零引擎)。已有 `sceneFor(state)` 就是这个模式的雏形,扩展它即可。
- 限时地点: `Place.unlock: { minWeek: 10, maxWeek... }` —— **注意 DSL 没有 `maxWeek`**,所以"限时消失"用 flag: 节日事件 `setFlags:{ xmas_market_open:true }`,过期事件清 flag;地点 `unlock:{ flagsSet:['xmas_market_open'] }`。或最简: 用 `minTerm` + 该学期专属皮肤。
- 限定事件: 已有 `minWeek` 卡点足够(`ev_spring_festival` 已是 `minWeek:8`)。新增圣诞/考试季事件,`cond` 卡 `minWeek` 区间 + `oncePerGame`。
- 行动加成: 黑五周 = 一个周初系统事件 `setFlags:{ blackfriday:true }`,消费 action 的专属高收益版本 `unlock:{ flagsSet:['blackfriday'] }`。

**工作量**: **M** (皮肤切换 S;一批限定事件 + 2 到 3 个限时地点的 flag 开关 data)。**注意**: 若想要"限时关闭",可考虑给 DSL 加 `maxWeek` 字段(`conditions.ts` 加 2 行,types 加 1 行),这是唯一建议的引擎微扩展,且向后兼容。

---

## 点子 8 —— 突发选择的连锁后果 (一个决定,几周后回旋镖)

**是什么**: 部分事件的选项**不立刻结算全部后果**,而是 `setFlags` 埋一颗种子,几周后由另一个事件**回收**,形成 2 到 3 段连锁。例: "借钱给室友"→ `setFlags:{ lent_money:true }` → 三周后 `cond:{ flagsSet:['lent_money'], minWeek:+3 }` 触发"室友还钱了(money+reputation+)"或"室友玩失踪(money-、social-、stress+)"两种回收。再如"挂科边缘选了延期申请"→ 后续"补考通知"链。

**为什么有趣**: 让选择有重量和记忆,玩家会记得自己几周前埋的雷/种的善因,中段叙事有了因果纵深,而不是一次性的孤立事件。这是把现有事件系统从"单回合"升级成"叙事弧"的最低成本方式。

**怎么落地**:
- 纯 data,**完全用现有 `setFlags` + `Condition`**: 起始事件选项 `setFlags:{ chain_x:1 }`;回收事件 `cond:{ flagEquals:{ chain_x:1 }, minWeek: 起始周+N }`,结算时 `setFlags:{ chain_x:2 }` 推进或清除。
- 用 number flag 做阶段(`chain_x: 1/2/3`),配 `flagEquals` 精确卡阶段,天然防重复触发。
- 与点子 3 恋爱、点子 7 节日复用同一套阶段-flag 模式,机制统一。
- 可挂 `routeWeights`,让连锁选择也影响结局走向。

**工作量**: **S** (纯 data;每条连锁 = 2 到 3 个用 flag 串起来的事件。先写 3 到 4 条标志性连锁试水)。

---

## 落地顺序建议 (给包工头排期)

| 阶段 | 点子 | 量 | 是否动引擎 |
|---|---|---|---|
| 地基 | **1 地图骨架** | L | 否(纯 UI + places.ts) |
| 内容快赢 | **4 消费出口**、**8 连锁后果** | S+S | 否(纯 data) |
| 情感主线 | **3 恋爱线**(先 1 个对象)、**7 季节节日** | M+M | 否(7 可选给 DSL 加 `maxWeek`) |
| 节奏深化 | **6 周任务**(布尔版)、**5 旅行**、**2 地点熟练度** | M×3 | 2/6 计数版需 store 加 3 行 mutator,纯引擎不动 |

**唯一可能的引擎触碰**(都向后兼容、可选): 
1. `Condition` 加 `maxWeek`(点子 7 限时地点更优雅) —— `types.ts` +1 行、`conditions.ts` +2 行。
2. store 加一个 `visitPlace`/`bumpFlag` mutator 做精确次数计数(点子 2/6 计数版) —— 不碰 `src/game/` 纯函数,只在 `store.ts` 加一个写 flag 的 action。

**全部其余内容**(消费/旅行/恋爱/连锁/节日/周任务布尔版/地点专属行动)= 往 `src/data/{actions,events,endings}.ts` + 新 `places.ts` / `quests.ts` 加数据,复用现有 `flags` / `routeScores` / `eventPool` / `setFlags` / `Condition`,引擎纯函数一行不改。

---

**相关文件路径**(供实现参考,均为绝对路径):
- 引擎契约: `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/game/types.ts`
- 条件 DSL: `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/game/conditions.ts`
- 引擎纯函数(takeAction/resolveEvent/advanceWeek): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/game/engine.ts`
- 行动数据(新行动加这里): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/data/actions.ts`
- 事件数据(新事件/连锁/节日加这里): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/data/events.ts`
- 结局数据(恋爱/旅行结局加这里): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/data/endings.ts`
- 现状静态游玩 UI(被点子 1 替换的 `ActionGrid`): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/ui/play.tsx`
- 路线/城市/常量: `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/game/constants.ts`
- 新建建议: `src/data/places.ts`(地图地点)、`src/data/quests.ts`(周任务)、`src/ui/MapView.tsx`(地图组件)