# mapdesign

资料已经足够支撑完整的研究结论。我已经掌握了:MDN 的瓦片层/物体层/逻辑层三层模型、Stardew 的 Back/Buildings/Front/AlwaysFront 分层、y-sort 按底边锚点排序的算法、踩门 warp tile 进室内机制、PokéCommunity 城镇布局原则、以及 DOM 下 translate3d+zIndex 的实现路径。同时我已看清现有代码的病根。下面输出研究报告。

---

# 宝可梦式城镇地图布局研究 → 《英伦留学物语》落地方案

## 0. 先定位现有病根(对症)

现状代码 `src/map/MapScene.tsx` + `locations.ts` 的问题不是"坐标没调好",是**架构层缺失**:

- 建筑用 `left:${l.x}% top:${l.y}%` 直接贴一张**已经画死了河流/道路的 Gemini 底图**上 -> 底图的路网是"画上去的死像素",建筑坐标是"另一套独立的百分比",两套系统没有任何共享网格,必然打架。
- 没有**深度排序**:`map-node`、`map-deco`、`map-player` 的前后遮挡靠 DOM 书写顺序和零散 z-index,主角永远画在所有建筑之上,走到楼后面不会被挡 -> 没有立体感。
- 没有**地面层 / 物体层 / 逻辑层的分离**:地面(可踩的草/路)和物体(建筑/树)和碰撞被糊成"一张底图 + 一批绝对定位 div"。

宝可梦/Stardew 这类 2.5D 之所以"立体且合理",靠的就是把这三件事拆开。下面分三问回答,再给搬运架构。

---

## 1) 建筑/地点在地图上如何摆放才"立体且合理"

### 1.1 核心:瓦片网格 + 多层堆叠(不是一张底图)

权威模型来自 MDN Tilemaps:地图不是一张图,是**一个网格 + 一个图集(tile atlas/tileset) + 若干层(layer)**。每个格子存的是"图集里第几号瓦片"的索引,屏幕坐标由 `x = column × tileSize, y = row × tileSize` 算出来。([MDN Tilemaps](https://developer.mozilla.org/en-US/docs/Games/Techniques/Tilemaps))

层分三类(这是关键):
- **视觉层(visual grid)**:可以堆好几层,"同一张图可以配不同背景,用更少的瓦片表达更丰富的世界"。
- **逻辑层(logic grid)**:碰撞、寻路、机关,**不渲染**,只供游戏逻辑读。
- **角色插在层栈中间**:MDN 原话"如果角色精灵画在层栈的中间,就能实现角色走到树或建筑背后的效果"——这正是立体感的来源。

Stardew Valley 把这套层模型做成了业界事实标准的命名,直接可抄([Stardew Modding:Maps](https://stardewvalleywiki.com/Modding:Maps)):

| 层名 | 作用 | 对应到你项目 |
|---|---|---|
| **Back** | 地面底层(草地/路面/广场) | 可踩的地面瓦片 |
| **Buildings** | 建筑/物体的"脚下贴地"那一行 | 建筑落地基座 |
| **Paths** | 路径装饰(碎石/草丛/落叶) | 把建筑串起来的道路 |
| **Front** | 画在角色之上**当角色在它北边**、之下当角色在南边的物体(大部分树、楼的上半身) | y-sort 的物体 |
| **AlwaysFront** | 永远盖住角色(屋檐、雨棚、前景树冠) | 纯前景遮罩 |

注意 Stardew 1.6 之后还能 `Back1`/`Back2` 加层(比如地毯铺在地板上但仍可踩)。**这套"Back / Buildings / Paths / Front / AlwaysFront"就是你要的"瓦片网格 + 物体层"的成熟分层**,而且它本身就是原创安全的——它是层语义,不是美术。

### 1.2 立体的真正机制:深度排序(y-sort / 按底边遮挡)

这是把"贴图"变成"立体"的那一步,也是你现在完全缺的。原理:

**所有可遮挡的物体,按它"脚下那条线(底边 baseline / anchor)"的 y 坐标排序;y 越大(越靠近屏幕下方)画得越晚(在越上面)。** 主角和建筑共用这一套排序,于是主角走到建筑下边沿之上时被建筑挡住,走到下面时盖住建筑。([Godot Y-Sort Origin 提案](https://github.com/godotengine/godot-proposals/issues/6367)、[GameDev.net 顶视图排序讨论](https://gamedev.net/forums/topic/707079-sprites-draw-order-sorting-for-top-down-2d-game-with-floors-and-bridges/))

几条来自实战讨论的硬规则:
- **锚点取底边中心,不是几何中心**。"距相机的距离若用矩形中心算,矩形越大越不准,大到一定程度就会和邻居错误重叠"——所以高建筑必须用**底边**当排序键,不能用中心。([GameDev.net](https://gamedev.net/forums/topic/707079-sprites-draw-order-sorting-for-top-down-2d-game-with-floors-and-bridges/)、[Mazebert 等距排序](https://mazebert.com/forum/news/isometric-depth-sorting--id775/))
- **最稳的做法是把所有东西约束成单格尺寸**:"按 y 排序最简单,前提是没有任何精灵占超过一个格;等距世界里最高效的排序就是把瓦片都切成标准单格,不允许更大的图。"([GameDev.net](https://gamedev.net/forums/topic/707079-sprites-draw-order-sorting-for-top-down-2d-game-with-floors-and-bridges/))
- **高建筑跨多格时:拆**。把一栋高楼拆成"脚部(参与 y-sort,会被角色绕过)"和"上半身/屋檐(放 AlwaysFront,永远盖)"两段——这正是 Stardew `Front` vs `AlwaysFront` 的分工,也是 GameDev 讨论里"split tall objects"的解法。
- 楼层/桥这种"同一 xy 但不同高度"的复杂情形,才需要升级到 3D 包围盒 + 分离轴定理(SAT)判前后;**你的留学地图用不到,单层 y-sort 足够**。

### 1.3 道路把建筑串起来 + 高度差 + 留白(布局美学)

来自宝可梦同人城镇布图教程([PokéCommunity Mapping Cities](https://daily.pokecommunity.com/2017/10/31/fangame-tutorials-mapping-cities/) 摘要、[PokéCommunity Tilemap 工具帖](https://www.pokecommunity.com/threads/tilemap-studio-4-0-1.425298/)):

- **布局跟着主题走**:现代都市排干净的网格;老城镇用"被常年踩出来的草径"连成的松散无序布局。-> 你的**校园区**该是"紧凑、规整、暖";**城市区**该是"更散、更冷、街道把点拉开"。
- **建筑很大,先给路和装饰留地**:"宝可梦建筑相对很大,不把尺寸算进去就会挤得没地方放路和装饰。一切偏对称方正,但地图不要过度拥挤。"-> 别把 15 个点塞满,留白本身是设计。
- **道路是连接组织**:用 `Paths` 层的碎石/草径把建筑入口连起来,玩家视线顺着路走 -> 这恰好替代你现在"建筑悬空贴在画死的河上"的违和。**路是生成的瓦片层,不是底图死像素**,所以路能精确接到每栋楼的门口。
- **高度差(ledges/elevation)**:宝可梦用矮崖 + 台阶制造层次,让城镇不是一张纯平面。Gen2 起基础瓦片 8×8,树/楼是 16×16 或更大([Gen2 tileset 分析](https://chrisfrew.in/blog/data-analysis-and-pixel-art-of-towns-and-cities-in-pokemon/))。-> 你可以用"地面瓦片画一两级矮台 + 建筑坐落在不同台阶高度",配合 y-sort,立体感立刻出来,且**完全是你自己的像素,不抄它的图**。
- **几何特征做框**:河流/树林/围墙当天然边界把区域框住,但**这些必须是瓦片**(可被路绕开、可被建筑对齐),不能是底图上画死的——这就是你现在打架的根因。

---

## 2) 玩家移动 + "进入建筑内部"的机制

### 2.1 进建筑 = 踩门触发 warp(权威机制)

宝可梦的室内进出,机制叫 **warp tile / warp panel**:门、楼梯、传送板本质是同一种东西,都用 "Transfer Player" 事件——**玩家踩上某个格子,就被瞬移到另一张地图(室内场景)的对应连接格**。([Bulbapedia Warp tile](https://bulbapedia.bulbagarden.net/wiki/Warp_tile)、[Bulbapedia Warp panel](https://bulbapedia.bulbagarden.net/wiki/Warp_panel)、[Pokémon Essentials Map transfers](https://essentialsdocs.fandom.com/wiki/Map_transfers)、[porymap 事件编辑](https://huderlem.github.io/porymap/manual/editing-map-events.html))

两种主流交互手感:
- **踩门进室内场景**(宝可梦):走到门格 -> 切到一张独立的室内地图。重，适合"建筑内部有得逛"。
- **直接交互**(走到门口弹菜单 / 按键确认):不切场景,弹一个面板。轻,适合"建筑内部就是一组选项"。

warp 可以**带条件锁**:"warp tile 可被是否持有某关键道具、或某 Game Switch 是否打开来上锁/解锁"([Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Warp_tile))。触发器脚本"只在某变量等于某值时执行,通常执行一次后改变量值,之后不再触发"([porymap](https://huderlem.github.io/porymap/manual/editing-map-events.html))。

### 2.2 映射到你的项目:不要做室内场景,门 = 行动菜单

你的引擎里**没有"室内地图"这个概念,建筑内部 = 一组 action**。所以正确的搬法是:

> **采用"直接交互"变体:走到建筑落地格(门口)-> 不切场景 -> 从底部弹该地点的行动菜单(LocationSheet)。** 把宝可梦的"踩门 warp 到室内"降维成"踩门 warp 到一个 bottom sheet"。

这跟你 `MAP_MODE_PLAN.md` 已拍板的 tap-to-move + 到达弹菜单**完全一致**,只是补上了立体的外壳。"地点解锁=门锁"也天然对上:`availableActions` 过滤 = warp 的 Game Switch 条件,锁着的地点门口画个 🔒,正是 warp tile 的条件锁。

移动控制维持 **tap-to-move(点地点自动走过去)**:节点地图不需要 A*,主角从当前格沿路插值到目标门口格即可;真要做可自由走的网格再引 easystarjs(约 7KB),但你现在用不到。

---

## 3) 怎么搬到"单主角 + 固定回合引擎",立体合理又不复刻其美术

铁律前提:`src/game/` 一行不改,只重构表现/交互/音频层。下面是**明确的目标架构**,直接替换现有"固定坐标贴底图"。

### 3.1 目标架构:网格坐标系 + 三层渲染 + y-sort(DOM 实现)

**A. 把坐标从"百分比"换成"网格行列"。** 这是治本第一刀。

`locations.ts` 现在是 `x: 20, y: 30`(百分比,和底图无关)。改成网格坐标 `col, row`(+ 建筑占几格 `w, h`):

```
// 之前(悬空贴图,和底图河流打架)
{ id: 'library', x: 50, y: 20 }   // 百分比,独立坐标系

// 之后(落在共享网格上,路和楼对齐同一套格)
{ id: 'library', col: 6, row: 3, w: 2, h: 2 }   // 网格格 + 占位
```

屏幕坐标统一由网格算:`screenX = col * TILE`、`screenY = row * TILE`(就是 MDN 的 `column × tileSize`)。**所有东西——地面、路、建筑、主角——都从这一个公式落位,从根上消除"两套坐标打架"。**

**B. 三层(对齐 MDN/Stardew 模型),全部 DOM,零新依赖:**

1. **地面层(Back)**:不再用一张画死路的 Gemini 大图。改成**程序化铺地面瓦片**:草地/广场/路面是若干 32×32 像素瓦片(你已有 2 张地形图可切成瓦片),按网格平铺。路用 `Paths` 思路:沿建筑门口之间铺路面瓦片,**路是数据生成的,所以永远接得上门口**。
2. **物体层(Buildings + Front)**:建筑 sprite(你已有 15 个)、树/灯/长椅 deco,**每个物体一个绝对定位 div,落点 = 它底边中心格**。
3. **前景层(AlwaysFront)**:高楼屋檐、前景树冠等"永远盖住人"的部分(可选,后期做)。

**C. y-sort 用 CSS 实现(DOM 完全够):**

物体层里所有 div(含主角)共用一个排序键 = **底边的 row(或 screenY)**,写进 `z-index`:

```
// 每个物体/主角的样式
const baseRow = row + h;                  // 底边所在格(脚下那条线)
style = {
  transform: `translate3d(${col*TILE}px, ${(row)*TILE}px, 0)`,
  zIndex: Math.round(baseRow * 10),       // 底边越靠下 zIndex 越大 => 画在越上面
}
```

主角走动时 `screenY` 连续变,`zIndex` 跟着变,于是**走到图书馆下边沿之上被楼挡住、走到下面盖住楼**——立体感成立。用 `translate3d`(而非 `left/top`)让浏览器把元素提升为合成层、GPU 加速,移动端流畅;浏览器的 compositor 对这种 z 排序处理得很好。([translate3d 性能](https://www.codestudy.net/blog/translate3d-vs-translate-performance/)、[CSS is DOOMed 用纯 CSS 做 3D 深度排序的实证](https://nielsleenheer.com/articles/2026/css-is-doomed-rendering-doom-in-3d-with-css/))

高楼用 1.2.2 的"拆"法:楼的**脚部**参与 y-sort,**上半身**单独一个 div 放进前景层(更高的固定 z-index)永远盖人。这就是 Stardew `Front`/`AlwaysFront` 的 DOM 版。

> DOM-only 的可行性有现成证据:`react-isometric-tilemap` 就是"只用 DOM 做的等距瓦片地图",靠 `IsometricMap`/`IsometricTile` 组件 + per-tile `z` 参数 + CSS 管层叠,不用 canvas。([react-isometric-tilemap](https://github.com/holywyvern/react-isometric-tilemap))。你做的是更简单的正交(orthographic)俯视,比等距还容易。

### 3.2 视角选型:正交俯视(orthographic),不要等距

等距(isometric/2.5D 斜 45°)虽然更"立体",但([Excalibur 等距文档](https://excaliburjs.com/docs/isometric/)、[MDN](https://developer.mozilla.org/en-US/docs/Games/Techniques/Tilemaps))它要处理菱形坐标变换、菱形点击命中、更复杂的 y-sort,移动端竖屏 375px 收益不划算。**用宝可梦同款正交俯视(略带斜俯,建筑画出一点正面)**:网格是规整矩形,点击命中=矩形,坐标=`col*TILE/row*TILE`,y-sort 直接按 row。立体感由"建筑画出正面高度 + y-sort 遮挡 + 地面矮台高度差"三者给,而不是靠斜投影。这条最省、最稳、最契合你已有的正面建筑 sprite。

### 3.3 不复刻美术的红线(这套架构天然安全)

你借的全是**抽象机制与层语义**,不是任何一张画面:
- "瓦片网格 + Back/Buildings/Front/AlwaysFront 分层 + y-sort 按底边遮挡 + warp 进室内" —— 这些是**通用 2.5D 技术词汇**(MDN/Godot/Excalibur 都这么讲),不是 Kairosoft/任天堂的专有美术。
- 你的地面瓦片、建筑 sprite、角色 sprite **全是 Gemini 出的自有像素**;城镇的**具体布局(哪栋楼在哪)是你原创的留学校园/英国小城**,不抄它的镇子形状。
- 正交俯视 + 暖色校园/冷色城市的**主题分区**是你自己的语义(留学情绪),不是宝可梦的小镇。

符合 `CLAUDE.md` "只借抽象机制,不要 Kairosoft UI/美术/角色,不要真实学校品牌,图上不烤文字"。

### 3.4 落地次序(与现有 M1→M4 计划对齐,改动仍只在表现层)

1. **第一刀(治本):** `locations.ts` 坐标从百分比改网格 `col/row/w/h`;`MapScene.tsx` 用 `col*TILE/row*TILE` 落位;给每个物体 + 主角加 `zIndex = Math.round((row+h)*10)` 的 y-sort。**仅此一步,"建筑贴底图打架"就解决了**(因为不再贴死底图,建筑落在共享网格上,且有了遮挡)。
2. **第二刀:** 弃用"画死路的 Gemini 底图",改程序化平铺地面瓦片 + 沿门口铺 `Paths` 路面瓦片,把建筑串起来。
3. **第三刀(立体增强):** 地面加 1~2 级矮台高度差;高楼拆"脚部 + 屋檐(AlwaysFront)"。
4. **门=warp 降维:** 维持 tap-to-move 走到门口格 -> 弹 `LocationSheet`(已有),把"踩门进室内"实现成"踩门弹行动菜单";锁定地点门口画 🔒 = warp 条件锁。

全程 `src/game/` 不动,新表现态(主角插值坐标、行走态、相机)进 UI-only store,不进 `GameState`——与 `MAP_MODE_PLAN.md` 既定解耦铁律一致。

---

## 一句话结论

把"15 个建筑用固定百分比贴在一张画死河流道路的底图上"换成 **"统一网格坐标系(col/row) + 三层渲染(地面 Back / 物体 Buildings+Front / 前景 AlwaysFront) + 按底边 y-sort 的 z-index 遮挡 + 程序化路面把门口串起来"**;进建筑用宝可梦 warp 机制的降维版"走到门口格弹行动菜单"。第一刀(百分比改网格 + y-sort)就能根治"打架与不立体",且不引任何渲染库、不改引擎、不复刻其美术。

## 来源
- [MDN — Tilemaps(瓦片层/逻辑层/层栈、角色插层中间做遮挡)](https://developer.mozilla.org/en-US/docs/Games/Techniques/Tilemaps)
- [Stardew Valley Wiki — Modding:Maps(Back/Buildings/Paths/Front/AlwaysFront 分层)](https://stardewvalleywiki.com/Modding:Maps)
- [Godot 提案 — Y-Sort Origin(按底边排序的锚点)](https://github.com/godotengine/godot-proposals/issues/6367)
- [GameDev.net — 顶视图 2.5D 精灵排序(底边锚点 / 单格约束 / 拆高物体 / 桥与楼层)](https://gamedev.net/forums/topic/707079-sprites-draw-order-sorting-for-top-down-2d-game-with-floors-and-bridges/)
- [Mazebert — 等距深度排序(中心点不准的问题)](https://mazebert.com/forum/news/isometric-depth-sorting--id775/)
- [Bulbapedia — Warp tile(踩门瞬移 / 条件锁)](https://bulbapedia.bulbagarden.net/wiki/Warp_tile)
- [Bulbapedia — Warp panel](https://bulbapedia.bulbagarden.net/wiki/Warp_panel)
- [Pokémon Essentials — Map transfers(地图间传送)](https://essentialsdocs.fandom.com/wiki/Map_transfers)
- [porymap — Editing Map Events(warp 触发器脚本机制)](https://huderlem.github.io/porymap/manual/editing-map-events.html)
- [PokéCommunity — Fangame Tutorials: Mapping Cities(布局跟主题、道路连接、留白、建筑尺寸)](https://daily.pokecommunity.com/2017/10/31/fangame-tutorials-mapping-cities/)
- [Chris Frewin — Pokemon 城镇像素分析(8×8 基础瓦片 vs 16×16 建筑、高度)](https://chrisfrew.in/blog/data-analysis-and-pixel-art-of-towns-and-cities-in-pokemon/)
- [react-isometric-tilemap — 纯 DOM 瓦片地图(无 canvas、per-tile z 管层叠)](https://github.com/holywyvern/react-isometric-tilemap)
- [Excalibur.js — Isometric Tilemaps(等距=2.5D、坐标变换复杂度)](https://excaliburjs.com/docs/isometric/)
- [translate3d vs translate 性能(GPU 合成层)](https://www.codestudy.net/blog/translate3d-vs-translate-performance/)
- [CSS is DOOMed — 纯 CSS 3D 深度排序实证(浏览器 compositor 处理 z 排序)](https://nielsleenheer.com/articles/2026/css-is-doomed-rendering-doom-in-3d-with-css/)

相关项目文件(绝对路径):
- 现状病根: `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/map/MapScene.tsx`(`DECO_SPOTS` + `map-node` 固定百分比贴底图,无 y-sort)、`/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/map/locations.ts`(`x/y` 百分比坐标,需改成 `col/row/w/h`)
- 既定计划(本方案与其解耦铁律一致): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/docs/MAP_MODE_PLAN.md`
- 红线: `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/CLAUDE.md`

---

# rendertech

所有调研完成。我现在有全部技术事实来给出决定性方案:

- PixiJS v8:async renderer init 只加载实际用的后端;`autoDetectRenderer`/`Application.init` 可传 renderer 偏好数组(可禁用 WebGPU,只走 WebGL 避开 WebGPU 移动端的 fallback bug);无 GPU 时自动降级 Canvas2D。移动端稳定做法 = 锁 WebGL、不碰 WebGPU。
- 3/4 视角(pseudo-3D)就是用"建筑带屋顶+立面 + 地面投影锚定底部"造立体感,这是 16-bit JRPG 经典手法,**比真等距瓦片简单得多**,且现有 256 平视建筑需要重出成 3/4 视角才能解决"贴底图打架"。
- y-sort:`Container.sortableChildren` + 按"脚底 y 坐标"设 `zIndex`,角色脚底 y 大于建筑底边时被建筑遮挡。

我已经掌握了回答全部 4 个问题所需的一切。现在整合成给用户的最终方案。我不写 .md 文件,直接把完整调研结论作为最终回答返回。

---

# 《英伦留学物语》2.5D 表现层重构 技术方案(可落地)

我把项目内核摸透了(`src/game/index.ts` 导出的 5 纯函数 + 12 状态 + zustand store 是唯一桥),也把现状痛点的根因找到了,并对 4 个问题逐一做了 web 调研。下面给拍板结论。

先说一句贯穿全局的判断:**你现在踩到的不是"DOM 不够快",而是"平视单图建筑按百分比贴在一张透视底图上,二者透视不自洽"**。换 PixiJS 只是手段,真正解决"立体/遮挡/不打架"的是三件事:① 底图不再是一张画死的图,而是可 y-sort 的物件层;② 建筑素材从"平视正面 256 单图"换成"3/4 视角带地面锚点";③ 角色用 4 向行走帧。下面每一节都围绕这条。

---

## 0) 一句话拍板

**上 PixiJS v8(裸核心,WebGL-only)做一个 2.5D 渲染层,正交俯视网格 + y-sort 深度排序,不上真等距瓦片;角色用 PixelLab 出 4 向行走 sprite sheet,建筑/窗灯用 2 帧微动画;渲染层通过现有 zustand store 只读 GameState、只派发 act/resolve/advance/continueWeekly,`src/game/` 一行不改。** 不选 Phaser(它的物理/场景/输入/tween 你全用不到,白背 1.2MB),不继续纯 DOM(贴底图打架是 DOM 绝对定位的结构病,y-sort 在 DOM 里要靠改 z-index 重排,越多越糟)。

---

## 1) 渲染技术选型:PixiJS v8 vs Phaser vs 纯 Canvas vs 继续 DOM

### 实测数据(2026-06 查证)

| 维度 | PixiJS v8 | Phaser 3 | 纯 Canvas 2D | 继续 DOM/CSS |
|---|---|---|---|---|
| 包体 | **min 881KB / gzip ~251KB**,v8 单包 + `extend` API 可 tree-shake(只导入 Sprite/Container/Texture/Ticker 实际更小) | ~1.2MB min(整框架,不可细粒度裁) | 0(浏览器内置) | 0 |
| 定位 | **渲染库**(WebGL/WebGPU 批渲染 + 精灵图集 + 容器树) | **游戏框架**(渲染只是其一,还含物理/场景/输入/audio/tween) | 你自己写一切 | 你自己写一切 |
| 深度排序 | `Container.sortableChildren` + 按脚底 y 设 `zIndex`,一行启用 | 有内置 depth-sorting 示例 | 手写 painter's algorithm + 每帧排序 | 靠 CSS z-index,物件多了重排掉帧 |
| sprite sheet 动画 | 原生 `AnimatedSprite` + spritesheet atlas | 原生支持 | 手写 drawImage 切帧 | CSS `steps()` 雪碧图 |
| 移动端 | 2x 渲染速度;async 只加载用到的后端;**可锁 WebGL 避开 WebGPU 的移动端 fallback bug**;无 GPU 自动降级 Canvas2D | 也基于 WebGL,但整框架启动重 | 上百精灵会掉帧 | 少量精灵硬件加速 OK,**但 y-sort 是结构性短板** |
| 与 React 19/Zustand 解耦 | `@pixi/react` v8 专为 React 19 写,靠 `useSyncExternalStore`(Zustand 内部就用它)天然读外部 store | Phaser 自带状态/场景,和 React/Zustand 是两套世界,要造桥适配 | 自己接 | 同一棵 React 树,最易 |

### 为什么是 PixiJS,不是其余三个

- **不选 Phaser**:它是"游戏框架"不是"渲染库"。你的引擎(回合/事件/路线/结局)已经是 `src/game/` 里的纯函数,**Phaser 自带的场景管理、物理、碰撞、输入、tween、audio 你一个都不需要**——它们要么和你引擎职责重叠,要么和 React/Zustand 抢状态主权。为用不到的能力背 1.2MB 和"两套状态世界要造桥"的复杂度,不划算。社区共识也是"要完整游戏功能少写代码选 Phaser,要移动性能 + 最小开销 + 最大控制选 PixiJS"——你属于后者。
- **不继续 DOM**:你现在的痛点(建筑贴底图打架)**正是 DOM 绝对定位的结构病**。DOM 里要做"角色走到建筑后面被遮挡"只能改 z-index,而 z-index 重排在物件一多时会触发 layout/paint 抖动;且 DOM 的"百分比坐标"和"像素透视底图"本质对不齐(你已经亲历)。DOM 适合 HUD/弹窗/菜单(这些继续留在 React DOM),不适合需要 y-sort 的世界层。
- **不裸 Canvas**:y-sort + sprite atlas + 批渲染 + 移动端 GPU 路径,裸 Canvas 全得手写,等于重造半个 PixiJS,维护性差。

### 包体顾虑的正面回应

gzip ~251KB 是"全量导入"的数字。本项目只需要 `Application / Container / Sprite / AnimatedSprite / Texture / Assets / Ticker` 这几样,v8 的 `extend`/单包 tree-shaking 会把没用到的滤掉,实际进 bundle 远小于 251KB。对一个移动端模拟游戏,这是完全可接受的一次性成本(且只在进入"地图模式"时才需要,可以代码分割按需 `import()`,首屏菜单/创建角色仍是零额外开销)。

### 移动端稳定性铁律(查证后的配置)

PixiJS v8 的 WebGPU 在部分移动设备有"WebGPU 失败但没回退到 WebGL 导致整屏渲染失败"的已知 bug。**所以初始化时用 `preference: 'webgl'` 锁死 WebGL**(`Application.init` / `autoDetectRenderer` 现在接受 renderer 偏好数组,可禁用 WebGPU),无 GPU 设备 PixiJS 自动降级 Canvas2D。像素风加 `roundPixels: true` + 纹理 `scaleMode: 'nearest'` + canvas CSS `image-rendering: pixelated`,整数倍缩放保持锐利。

---

## 2) 瓦片地图怎么做:不要真等距瓦片,要"正交网格 + 3/4 视角物件 + y-sort"

### 关键判断:不上 isometric/staggered 瓦片

查证到一条决定性事实:**像素圈常说的"2:1 等距"其实是 dimetric(三轴夹角 116.5°/116.5°/126.9°,不是真等距的 120°),而且等距视角会让"判断距离、直接点触输入"变难**。真等距瓦片(Tiled 的 isometric/staggered)是为**连续可走的大棋盘**(战棋、城建)准备的,会引入屏幕坐标↔网格坐标变换、瓦片对齐、菱形碰撞这一整套复杂度。

**你的地图是 15 个固定地点节点 + 1 个主角的稀疏节点图,不是连续地块。** 真等距瓦片在这里是"杀鸡用牛刀且割到手"。所以:

> **拍板:正交(orthogonal)俯视网格做地面 + 建筑/装饰用 3/4 视角带地面锚点的精灵 + y-sort 出立体感。** 这就是 16-bit JRPG 的经典 pseudo-3D 手法:从约 45° 俯角看,建筑能看到约 3/4 的屋顶和立面,正面被压缩、屋顶角度不变,配一道地面投影锚定底边——立体感和遮挡全来自这里,而不是来自等距投影。

### 地面层:代码定义网格,不用 Tiled(对你的规模)

- **不引 Tiled 编辑器**。Tiled + 导出 JSON(.tmj)+ `pixi-tiledmap`(支持 v8、orthogonal/iso/staggered 全orientation)是成熟方案,**但它的价值在"几十上百块手绘地块拼大地图"**。你只有两个区(校园/城市)、各放 6-9 个建筑,用 Tiled 的编辑/导出/解析三段开销远大于收益,还多一个 ~20KB 依赖 + 一套美术工作流。
- **改为代码定义网格**:把现有 `src/map/locations.ts` 从"百分比坐标"升级为"网格坐标 `{col,row}` + 区"。地面用一张或几张 ground tile 平铺(你已有 `ground-campus`/`ground-town` 573×768,可切成可平铺的草地/石板/水面 tile,或先整图铺底)。河流/道路直接画进 ground 层的 tile 编排里,**这样建筑就不会再和河流打架——因为河流和建筑现在是同一套网格里的不同 z 层物件,不是"图上画死的河 + 飘在上面的楼"**。
- 升级触发点写清楚:**当地点数翻倍、或要做可自由走的连续地块时,再引 Tiled + pixi-tiledmap**。在那之前代码网格够。

### 建筑/物体怎么放 + y-sort(立体与遮挡的核心)

把所有"立着的东西"(建筑、树、灯柱、主角)放进**同一个 `world` Container**,开 `world.sortableChildren = true`,每个精灵的 `zIndex = 它脚底/底边的世界 y 坐标`(锚点设在底部中心 `anchor.set(0.5, 1)`)。PixiJS 每帧按 zIndex 重排:

```
// 概念示意(实际写在 src/map/ 新文件,引擎不动)
building.anchor.set(0.5, 1);     // 锚点 = 底边中心,落在网格格子上
building.zIndex = building.y;    // 脚底 y 越大越靠前 = 越后画 = 盖住后面的
player.zIndex   = player.y;      // 角色脚底 y 超过某建筑底边 -> 被它遮挡
```

- **角色走到建筑下方(脚底 y 更大)→ 角色盖住建筑;走到建筑上方(脚底 y 更小)→ 建筑盖住角色**,自动产生"绕到楼后面被挡住"的 2.5D 遮挡。这就是 `sortableChildren + zIndex=feetY` 的全部魔法,不需要 per-pixel z-buffer(那是 River City Ransom 那种角色互相穿插才需要的重型方案,你不需要)。
- 每个建筑精灵底部带一道**椭圆地面投影**(单独 sprite 或画进图里),把它"钉"在网格格子上——这是 3/4 视角锚定地面的标准技巧,瞬间消除"飘在底图上"的违和。

### 现有素材的迁移成本(诚实评估)

- **现有 15 个 `building-*.png` 是 256×256 平视正面图,不能直接用**——平视图没有屋顶、没有 3/4 立面,正是"不立体"的根源。要重出成 **3/4 俯角视角 + 底边对齐 + 透明背景**。好消息:你已有 Gemini 直连管线 + 统一 STYLE 常量 + 洋红绿幕抠透明,只需在 prompt 里加 "3/4 top-down view, seen from 45 degrees above, visible roof and facade, isometric-style cottage, flat ground shadow at the base, transparent background",**重出一轮即可,管线和命名(`building-*`)完全复用**。
- ground/skyline/deco/ending/scene 这些**全部可复用**,不受影响。
- 这是本方案唯一的"美术返工"成本,但它是**必须的**——不重出 3/4 建筑,换什么渲染引擎都解决不了"平视图贴底图不立体"。

---

## 3) 角色 4 向行走帧动画:用 PixelLab API 出 sprite sheet,不要裸 Gemini 拼帧

### 核心难点 = 一致性,裸 Gemini 拼帧会飘

查证到的社区共识很硬:**"用单 prompt 完美一致处理几百个 sprite 的工具不存在"**。裸 `gemini-3-pro-image` 出"4 向 × 每向 N 帧"的拼接帧,**几乎一定会在帧间漂移**(脸、配色、比例、像素网格对不齐),走起来会"抖/变形"。CSS `steps()` 只是个播放器,它要求**输入帧本身已经像素级一致**——一致性问题在出图阶段,不在播放阶段。

### 拍板:PixelLab API(reference-driven 一致性)

PixelLab 有正式开发者 API + Python SDK,正好接进你"脚本生成 → 放 `public/assets/generated/` → `register:assets`"的现有管线:

- **`POST /v2/create-character-with-4-directions`**:一次出南/西/东/北 4 向角色,**靠同一角色定义保证 4 向是同一个人**。
- **skeleton 动画 / text 动画**:基于该角色生成 walk cycle(以及未来 run/idle),**跨帧锁定设计、比例、配色**——这正是裸文生图做不到的一致性来源。
- **rotate**:必要时从一张参考图补出 8 向。
- 产物导出为 sprite sheet PNG,丢进 `public/assets/generated/char-walk-*.png`,跑 `register:assets`,`assetUrl()` 直接读到,**和你现有素材登记机制零摩擦**。

### 备选(若不想引入 PixelLab)

- **次选:Gemini 出"单帧主图",PixelLab/AutoSprite/PixExact 等做"帧扩展与一致性"**。社区的实操经验就是"AI 放在流程中间,不是全流程":用 Gemini 定一张高质量基准帧(你的 `char-student` 已是现成基准),再用 reference-driven 工具扩出各向各帧,一致性由参考图保证。
- **下策:裸 Gemini 拼帧 + 人工挑帧对齐**——能做但要反复重 roll + 手动对齐像素网格,维护成本高,不推荐做主路径。

### 播放层:小人走路用哪种

- 进了 PixiJS,**用 `AnimatedSprite` + spritesheet atlas 播放**(`animationSpeed` 控速,4 向切纹理行),这是引擎原生路径,和 y-sort/相机统一坐标系。
- **不要在 PixiJS 里再叠 CSS `steps()`**(那是 DOM 方案的播放法,会出现 canvas 与 DOM 两套坐标系/点击命中对不齐,移动端最忌)。CSS `steps()` 只在"你决定某些纯 UI 小动画留在 DOM 层"时才用(比如 HUD 里的一个小图标循环)。

### 窗灯/建筑微动画(用户提到的"建筑窗灯")

查证到的最省做法:**2 帧 emissive loop**(窗户亮/暗两帧交替),不用动态光照(point light 在移动端最贵)。具体两条路任选:

- **2 帧法**:每个建筑出"窗灯亮 / 窗灯暗"两版,夜晚用 `AnimatedSprite` 低速(每 1-2 秒一帧)交替,造"有人在家"的呼吸感。性能近乎零。
- **叠加发光层**:建筑底图不变,单独出一张"只有窗户发光像素"的 emissive 叠加 sprite,用 `blendMode: 'add'` 叠上去,改它的 `alpha` 做脉冲。比 2 帧更灵活,仍然极廉价。

夜晚整体氛围(对应你 GDD 的"留学下雨夜"调性):给 `world` 叠一层半透明深蓝 `Graphics` 矩形做夜幕,窗灯的 add 混合穿透夜幕发亮——一层 overlay 搞定全场夜景,不碰任何逐建筑光照。

---

## 4) 渲染层只读 GameState + 派发现有 action,引擎完全不动

你的 `MAP_MODE_PLAN.md` 已经把"四条解耦铁律 + zustand 是唯一桥"写死了,新渲染层**完全继承这套**,只是把"渲染靶子"从 React DOM 换成 PixiJS 容器树。数据流一个字不改:

```
src/game/ 纯引擎(不动)
   ▲ 传 currentState        │ 返回 nextState
   │                        ▼
zustand store(唯一真相源,持有 GameState)
   - act(id)            = takeAction(s, id)
   - resolve(i)         = resolveEvent(s, i)
   - advance()          = advanceWeek(s)
   - continueWeekly()   = continueFromWeekly(s)
   ▲ subscribe(只读)        │ dispatch
   │                        │
PixiJS 渲染层(本次新增,集中在 src/map/)
   ├─ 读 GameState → 画地面/建筑/角色/HUD
   ├─ 读 availableActions(state) → 决定哪些地点亮/灰
   ├─ 纯表现态(playerPx / isWalking / 相机 / openLocationId)放独立 UI store,绝不进 GameState
   └─ 玩家点地点→走过去(纯动画,不碰引擎)→ 选行动才 dispatch(act)
```

### 落地这件事的具体做法(查证后的正确接法)

1. **`@pixi/react` v8 + Zustand 是天作之合**:`@pixi/react` v8 专为 React 19 写,Zustand 底层就是 `useSyncExternalStore`,所以在 Pixi 组件里直接 `useGame(s => s.state)` 订阅 GameState 即可,**和你现在 `MapScene.tsx` 里 `useGame((s)=>s.act)` 的写法完全一致**。整个 Pixi 画布是 React 树里的一个 `<Application>`,HUD/弹窗/底部行动菜单仍是普通 React DOM 浮在画布上(`phase` 驱动弹窗的逻辑原样保留)。
2. **靠 `extend` 控包体**:`@pixi/react` v8 用 `extend({ Container, Sprite, AnimatedSprite })` 显式登记用到的 Pixi 组件,没登记的不进 bundle——这是把 251KB 砍下来的关键开关。
3. **三条边界铁律照搬**(直接进 code review checklist):
   - 渲染层**永不写 GameState**,只调 store 那 4 个 dispatch;主角插值坐标/行走态/相机偏移放独立 UI-only store。
   - **"地点→有哪些行动"是渲染层的数据**(`LOCATION_ACTIONS` 查表),引擎只认 action + unlock,不认"地点"。
   - **走路是表现,到达不调引擎**;只有在到达后的底部菜单里主动选 action 才 `dispatch(act)`。AP 在 `takeAction` 内部扣,不在走路时扣。
4. **降风险**:保留现有 DOM `MapScene` 为可切换的 fallback 视图(`?renderer=dom`),PixiJS 层崩了能退回,移动端真机(375px)逐项验过再删旧路径。

### 验收红线(沿用 CLAUDE.md)

`npm run test`(引擎 + 全程谐验:no NaN / no out-of-range / no softlock / 确定性)+ `typecheck` + `build` 全绿;`src/game/` git diff 为空;中文文案无破折号;不引入可管理的 NPC 群(路人只能是装饰);无真实校徽。

---

## 维护性 / 包体 / 风险 总账

- **包体增量**:PixiJS 核心 gzip ~251KB 上限,`extend` 裁剪 + 路由级 `import()` 按需加载后实际更小,且只在地图模式付费。可接受。
- **新增依赖**:`pixi.js@8` + `@pixi/react@8`(必需);PixelLab(出素材用,**只在构建期/脚本期跑,不进运行时 bundle**)。不引 Phaser、不引 Tiled、不引 pixi-tiledmap、不引 easystar(节点图不需要 A*)。
- **最大工程量 / 风险点**:① 建筑素材必须重出 3/4 视角(唯一美术返工,但不可省);② canvas 与 DOM 浮层的层叠/点击命中要在移动端真机校准;③ PixiJS WebGPU 移动端 bug → 用 `preference:'webgl'` 规避。
- **维护性净收益**:y-sort 让"加一个新建筑/装饰"= 往 world 容器 push 一个设了 `zIndex=feetY` 的 sprite,深度自动正确,再不用手调百分比坐标和 z-index;素材出图管线沿用现有 Gemini/register 机制;状态契约一字不改,将来重构引擎或开第二学年,渲染层不用动。

---

## 来源链接

- PixiJS v8 发布 / 单包 tree-shaking / WebGPU: https://pixijs.com/blog/pixi-v8-launches
- @pixi/react v8(React 19 + extend): https://pixijs.com/blog/pixi-react-v8-live , https://react.pixijs.io/
- PixiJS v8 包体(min 881KB / gzip 251KB,bundlephobia): https://bundlephobia.com/package/pixi.js@8
- PixiJS vs Phaser(450KB vs 1.2MB、2x 渲染、库 vs 框架): https://generalistprogrammer.com/comparisons/phaser-vs-pixijs , https://aircada.com/blog/pixijs-vs-phaser-3
- JS 渲染引擎性能基准(Pixi/Phaser/Canvas/DOM 等): https://github.com/Shirajuki/js-game-rendering-benchmark
- PixiJS 性能建议(移动端): https://pixijs.com/8.x/guides/concepts/performance-tips
- Tiled + PixiJS(pixi-tiledmap,全 orientation,v8): https://github.com/riebel/pixi-tiledmap , https://www.npmjs.com/package/pixi-tiledmap
- y-sort / 2.5D 深度排序(sortableChildren、feet-y、River City Ransom 法): https://andrewrussell.net/2016/06/how-2-5d-sorting-works-in-river-city-ransom-underground/ , https://github.com/pixijs/pixijs/issues/7134
- dimetric vs 真等距(2:1 其实是 dimetric、等距判距难): https://www.slynyrd.com/blog/2022/11/28/pixelblog-41-isometric-pixel-art , https://significant-bits.com/a-laymans-guide-to-projection-in-videogames/ , https://pikuma.com/blog/isometric-projection-in-games
- 3/4 视角 pseudo-3D(屋顶+立面+地面投影): https://www.slynyrd.com/blog/2018/3/14/pixelblog-3-graphical-projections-1 , https://opengameart.org/content/chapter-3-perspectives
- AI sprite 一致性现实 + 多向工具: https://opengameart.org/forumtopic/ai-for-spritesheet-generation , https://www.pixellab.ai/
- PixelLab API(4 向 / skeleton / rotate / Python SDK): https://www.pixellab.ai/pixellab-api , https://pypi.org/project/pixellab/
- CSS steps() sprite + image-rendering pixelated: https://blog.teamtreehouse.com/css-sprite-sheet-animations-steps , https://kbravh.dev/interactive-pixel-spritesheet-animations-with-css
- DOM sprite 移动端硬件加速: http://buildnewgames.com/dom-sprites/
- 窗灯 emissive / 2 帧 loop / 移动端省电: https://learn.unity.com/course/2d-lighting-for-pixel-art/tutorial/add-emission-shaders
- PixiJS WebGPU→WebGL 移动端 fallback bug(锁 WebGL 依据): https://github.com/pixijs/pixijs/issues/10906

---

相关文件(绝对路径,供后续实现):
- 引擎契约(只读): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/game/index.ts`(5 函数 + 12 状态出口)、`/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/game/types.ts`
- 现有桥(沿用): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/store.ts`(`act`/`resolve`/`advance`/`continueWeekly`)
- 待重构的表现层: `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/map/MapScene.tsx`、`/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/map/locations.ts`(百分比坐标 → 网格坐标)
- 素材出图管线(复用 + 加 3/4 prompt): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/scripts/generate-assets-gemini.mjs`、`/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/scripts/register-assets.mjs`
- 旧 plan(本方案在其"升级触发条件"上推进): `/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/docs/MAP_MODE_PLAN.md`

---

# audio

这是个决定性的发现。OGG 在 iOS 上要到 Safari 18.4 / iOS 18.4 才原生支持，对一个移动端优先的产品来说，OGG 不能作为唯一格式。这直接推翻了"OGG 因为无缝循环最好就用 OGG"的天真结论，最务实的格式是 MP3/M4A(AAC)。

我现在掌握了所有关键证据，可以给出完整的、有来源、可落地的推荐。证据链完整：

1. 自动播放限制 + crossfade + gain node 实现路径（MDN/web.dev）
2. MusicGen = CC-BY-NC 不可商用（HuggingFace 官方/InfoQ）——明确排除
3. Pixabay License = 可商用免署名，但 contributor 上传需谨慎，standalone 分发禁止（对 BGM 无影响）
4. 格式：iOS 18.4 前不支持 OGG → M4A/MP3 为主
5. 程序化 chiptune（Tone.js / jsfxr）成熟度与定位

下面输出最终研究报告。

---

# 《英伦留学物语》音频系统研究报告

研究范围只覆盖表现层/交互层/音频层，游戏内核 `src/game/`（五个纯函数 + 12 状态 + 回合 + 事件 DSL + 8 路线 + 16 结局）零改动。音频系统作为一个独立 store + 一个 `<AudioManager>` 组件挂在 React 树上，订阅 Zustand 里"当前城市/场景"派生状态，与引擎完全解耦。

---

## 第一部分:Web Audio 播放 / 解锁 / 淡入淡出 (技术落地)

### 1.1 移动端自动播放限制是硬约束,不是可绕过的 bug

这是必须先认清的前提。iOS Safari 对带声音的 autoplay 是**全局封锁**,只允许静音播放;Chrome 用 Media Engagement Index 评分,但首次访问的玩家几乎一定被拦。规范层面:如果 `AudioContext` 在用户手势之前创建,它会进入 `suspended` 状态,必须在一次真实用户手势(click / touchend)的回调里调用 `audioContext.resume()` 才能出声([MDN Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay),[Chrome Autoplay policy](https://developer.chrome.com/blog/autoplay))。

**落地结论:必须有一个"点击解锁"入口。** 你的产品天然有这个入口(开始界面 / 选档界面)。

推荐做法:
- 游戏首屏放一个"开始游戏 / 进入"按钮(本来就有)。在这个按钮的 click handler 里,**同步**完成三件事:① `new AudioContext()`(若用 HTML `<audio>` 则是第一次 `.play()`);② `ctx.resume()`;③ 播一个时长几毫秒的静音 buffer 把链路"踢活"。这一步过了,之后整局都能自由切歌。
- 用一个全局 `audioUnlocked` 标志缓存解锁状态,避免重复解锁([Chrome for Developers](https://developer.chrome.com/blog/autoplay))。
- 解锁前 UI 上给一个明确的喇叭图标(默认可显示为"未开声"),让用户知道点了才有声,而不是"以为坏了"。

### 1.2 用哪套 API:`<audio>` 元素 vs Web Audio API

对你这种"每城/每场景一条循环 BGM + 切场景 crossfade"的需求,**推荐 Web Audio API 全程接管**,而不是裸 `<audio>`。原因:

- crossfade 需要对两条音轨的音量做**精确按时间曲线**的此消彼长,这正是 `GainNode` + `AudioParam` ramp 方法的本职工作([web.dev: Developing game audio with the Web Audio API](https://web.dev/articles/webaudio-games))。裸 `<audio>` 只能用 `setInterval` 手动改 `.volume`,卡顿、不精准、移动端掉帧时会"咔哒"。
- 音乐总线和音效总线天然要分开音量控制:`musicGain` 和 `sfxGain` 两个 GainNode,各自路由,一个静音开关只掐 music 不影响 UI 音效(web.dev 同上明确推荐这个双总线架构)。
- 无缝循环:Web Audio 的 `AudioBufferSourceNode.loop = true` 是**样本级精确循环**,没有 MP3/`<audio>` 那种 restart 间隙([web.dev WebAudio intro](https://web.dev/articles/webaudio-intro))。

**唯一例外**:如果你想省内存、且某些长 BGM 不介意 restart 有极小间隙,可以用 `<audio>` + `MediaElementAudioSourceNode` 把 `<audio>` 接进 Web Audio 图里——这样既享受 `<audio>` 的流式解码(不必整段 decode 进内存),又能用 GainNode 做 crossfade。**这是体积/内存与无缝度的折中,后面 3.x 懒加载会用到。**

实务上推荐一个轻封装库 **Howler.js**:它内部就是"Web Audio 优先、`<audio>` 兜底",自带 `fade()`、`loop`、sprite、自动解锁、多格式 fallback,省掉大量样板代码,且本身 MIT 许可证可商用。纯手写 Web Audio 也行,但 Howler 能让你少踩 iOS resume 的坑。

### 1.3 场景切换的 crossfade / 淡入淡出怎么写

核心:用 `AudioContext.currentTime` 作为时间锚,对两个 GainNode 各排一条 ramp,时间窗一致(例如 1.2 秒),旧轨降到 0、新轨升到目标音量([Nicola Hibbert Web Audio tutorial](https://nicolahibbert.com/web-audio-api-tutorial/))。

两个关键技术点:

1. **用 equal-power(等功率)曲线,不要线性。** 两条线性淡入淡出在中点会出现"音量塌陷"(听感上中途变小一下)。等功率曲线让两条增益在更高幅度相交,消除塌陷(web.dev 游戏音频文档明确点名这是 crossfade 标准做法)。实现上:线性 ramp 配合 `Math.cos`/`Math.sin` 形状的增益,或直接用 `setValueCurveAtTime` 喂一条预算好的等功率曲线。
2. **音量曲线优先 `exponentialRampToValueAtTime` 而非 `linearRampToValueAtTime`,因为人耳对音量是对数感知**([MDN exponentialRampToValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime))。注意指数 ramp 的目标值不能为 0(指数曲线碰不到 0),收尾时要 ramp 到一个极小值(如 0.0001)再 `setValueAtTime(0)`。

**针对你这款游戏的推荐切换策略(分层,不要一刀切)**:

| 切换类型 | 推荐处理 | 时长 |
|---|---|---|
| 切换城市(8 城之间) | 完整 crossfade,旧城 BGM 淡出 + 新城 BGM 淡入 | 1.0–1.5 秒 |
| 同城内切场景(校园↔城市,进建筑) | 不换曲,只做"焦点感"变化:可选轻微低通滤波 + 音量 -3dB,或干脆不变 | 0.3 秒或不变 |
| 进入结局画面(16 结局) | 当前 BGM 淡出,结局专属短曲淡入 | 0.8 秒 |
| 弹行动菜单 | **不碰 BGM**,只播一个 UI "嘀"音效(jsfxr 程序化生成即可) | 即时 |

这条很重要:**不是每次点地点都换歌**。频繁换歌会让玩家烦躁,也增加加载压力。BGM 绑定到"城市"这一层,场景/菜单只用音效点缀。这同时大幅减少了你需要的音轨数量(见第三部分)。

### 1.4 静音开关

- 一个全局 `muted` 状态存 Zustand + 同步进 `localStorage`(和你现有存档机制一致),下次进来记住。
- 静音实现:把 `masterGain`(或 `musicGain`)ramp 到 0,**不要**销毁音频图或暂停 AudioContext——保持链路活着,取消静音时 ramp 回来即可,避免重新解锁。
- 建议分两个开关:音乐开关 + 音效开关(各自 GainNode)。移动端用户在公共场合常常想关音乐留音效,或全关。

---

## 第二部分:音乐从哪来 (最务实、可商用、原创无版权风险)

我把三条路都查证了,直接给结论再给理由。

### 路线 A:MusicGen / AudioCraft 文生音乐 —— **不推荐,有致命许可证陷阱**

可行性上,MusicGen 能生成像样的器乐(训练数据是 Meta 自有 + Shutterstock + Pond5 授权曲库,质量在"背景音乐够用"档次)。**但模型权重的许可证是 CC-BY-NC 4.0,明确禁止商用**([facebook/MusicGen output license 官方讨论](https://huggingface.co/spaces/facebook/MusicGen/discussions/8),[InfoQ 报道](https://www.infoq.com/news/2023/08/meta-text-to-music-generative-ai/))。代码是 MIT,但**权重不是**——你用这个权重生成的音乐拿去放进任何商业/可分发的游戏,法律上站不住。

更深一层风险:它训练数据含授权第三方曲库,输出的"原创性"和版权归属本身处于灰色地带,这正是 Meta 选 NC 的原因。对一个要长期运营、可能商业化的产品,这是不能碰的地雷。

> 如果你将来真想用 AI 生成,正确路线是用**明确授权商用的**生成式音乐服务(如 Suno / Udio 的付费商用档、或 Soundraw / AIVA 的商用订阅),它们在条款里给商用授权。但这些是**付费 SaaS**,且 AI 音乐的版权确权大环境仍在演变,对当前阶段不划算。**先不走 AI 生成这条路。**

### 路线 B:CC0 / Pixabay 免版权循环音乐库 —— **推荐为主力来源**

这是最务实、零成本、可商用、且能立刻拿到"有制作水准的成品音乐"的路线。

**核心证据:**
- **Pixabay Music**:全站 Pixabay License,可商用、免署名,可嵌入你售卖/分发的游戏([Pixabay License summary 经评测确认](https://www.michaelmusco.com/2026/02/pixabay-music-review.html),[Pixabay commercial-use 音乐页](https://pixabay.com/music/search/commercial%20use/))。
- **OpenGameArt CC0 音乐区**:专门给游戏用的 CC0 循环曲,真正的公有领域,无任何义务([OpenGameArt CC0 Music](https://opengameart.org/content/cc0-music-0))。
- **itch.io CC0 音乐包**:有"200+ 无缝循环全 CC0"和"33 个免费 chiptune 循环 CC0"这类整包资源,适合像素风([itch.io CC0 music assets](https://itch.io/game-assets/assets-cc0/tag-music),[Tallbeard 免费 Music Loop Bundle](https://tallbeard.itch.io/music-loop-bundle))。
- **Kevin MacLeod / Incompetech**:海量曲,但**是 CC-BY 不是 CC0**,必须在游戏里署名"Kevin MacLeod, filmmusic.io"。能用,但带署名义务,优先级低于纯 CC0。

**两个必须避开的坑(我专门查证了):**

1. **Pixabay 是 contributor 上传制,平台对内容审核有限**,理论上存在"有人上传了本不属于自己的曲子"的风险([评测明确点出这条 quality-control 隐患](https://www.michaelmusco.com/2026/02/pixabay-music-review.html))。**对策:优先选 CC0(OpenGameArt / itch.io 的 CC0 包)作为最干净的来源;Pixabay 作补充时,下载页截图保存许可证证据(license proof),并尽量选高下载量、有明确作者署名的曲目。**
2. **"standalone 文件再分发"被禁止**([同上评测](https://www.michaelmusco.com/2026/02/pixabay-music-review.html))。对游戏 BGM **完全不受影响**——你是把音频**嵌入**游戏播放,不是把 mp3 当独立产品散发。但不要做"游戏里提供原声带下载"这种功能。

**主力推荐:以 CC0 来源(OpenGameArt + itch.io CC0 包)为骨干,Pixabay 作补充。** 全部留好出处和许可证记录,在游戏的"关于/致谢"页列一个 Credits(即便 CC0 不强制,列出来也专业、且对将来万一的争议是护身符)。

### 路线 C:Web Audio 程序化生成 chiptune —— **推荐作为"音效 + 兜底底噪",不作主旋律**

可行性是真实的:`Tone.js` 是浏览器交互音乐框架,自带合成器/振荡器/ADSR/PulseOscillator,能跑出 8-bit 音色;`jsfxr`(sfxr 的 JS 移植,MIT)能即时生成 coin/jump/powerUp/blip 这类经典 8-bit 音效([Tone.js](https://tonejs.github.io/),[jsfxr npm](https://www.npmjs.com/package/jsfxr),[sfxr.me](https://sfxr.me/))。**版权上最干净——是你自己代码现场合成的,绝对原创、零文件、零授权问题。**

**但**:用纯代码写出"好听、有记忆点、像样编曲"的整首 BGM,工作量极大且容易难听,这是作曲工程,不是配音效。所以定位要分清:

- **强烈推荐用程序化生成做 UI 音效**:点地点、弹菜单、确认行动、推进周次(advanceWeek)、触发事件、解锁结局的"叮/咚/翻页"声。jsfxr 几行代码搞定,zero 文件体积,zero 版权风险,和你像素风调性完美契合。
- **可选用 Tone.js 做"极简氛围底噪"兜底**:万一某个场景你不想加载完整 BGM,可以用 Tone.js 跑一段循环琶音/pad 当环境音。但这是加分项,不是主方案。
- **不推荐**用它替代 8 条城市主题曲——主题曲走路线 B 的成品。

---

### 第二部分最终推荐(一句话)

> **8 条城市主题 BGM + 16 段结局短曲:走路线 B(CC0 优先 + Pixabay 补充)的成品音乐。所有 UI 交互音效:走路线 C(jsfxr 程序化生成,零文件零版权)。彻底放弃路线 A(MusicGen,CC-BY-NC 不可商用)。**

这套组合:零授权费、可商用、原创/无版权风险可控、移动端体积小(音效全是代码生成不占下载)、且开发量可控。

---

## 第三部分:音轨数量、文件体积、懒加载

### 3.1 需要多少条音轨

把"BGM 绑城市层、场景/菜单只用音效"这个原则套上去,数量被压得很低:

| 用途 | 数量 | 来源 | 形态 |
|---|---|---|---|
| 城市主题 BGM(8 城) | 8 条 | CC0/Pixabay 成品 | 短循环,30–60 秒无缝 loop |
| 通用场景叠加(可选) | 0–2 条 | CC0 | 如"夜晚/紧张"通用层,全城复用 |
| 结局音乐(16 结局) | 1–3 条复用 | CC0 成品 | **不要 16 条**:分"好结局/中性/坏结局"3 段,按结局基调复用即可 |
| 标题/选档界面 | 1 条 | CC0 | 1 段即可 |
| UI 音效 | 0 个音频文件 | jsfxr 程序化 | 运行时合成 |

**总计需要采购/下载的音频文件:约 8 + 1 + 3 + (0–2) ≈ 12–14 条。** UI 音效全部代码生成,不算文件。

这个量对一个人的项目完全可控:一天就能从 CC0 库里选齐试听。

### 3.2 文件体积怎么控制

**第一原则:用短循环,不用长曲。** 一首 3 分钟的曲子做成 30–45 秒的无缝 loop,体积直接降到 1/4 到 1/6。玩家在一个城市待的时长远超 45 秒,但循环短不会被察觉(只要无缝)。游戏 BGM 的常规就是短 loop 反复([VI-Control 游戏音乐格式讨论](https://vi-control.net/community/threads/game-music-whats-the-norm-wav-ogg-mp3-16-bit-24-bit.45633/))。

**第二原则:格式选择——这里有个 iOS 大坑必须讲清。**

直觉上 OGG Vorbis 最适合游戏(无缝循环最干净、同码率音质优于 MP3、无专利费,[XConvert/VI-Control 等多源印证](https://vi-control.net/community/threads/game-music-whats-the-norm-wav-ogg-mp3-16-bit-24-bit.45633/))。**但 iOS 直到 Safari 18.4 / iOS 18.4 才原生支持 OGG**,在那之前(iOS 17 及更早,仍有大量在用机型)OGG 在 iPhone 上**放不出来**([caniuse via 搜索结果](https://caniuse.com/ogg-vorbis),iOS 18.4 起原生支持已确认)。

对一个**移动端优先**的产品,这是决定性约束:

> **主格式用 `.m4a`(AAC) 或 `.mp3`,不要把 OGG 当唯一格式。** AAC/MP3 在所有 iOS / Android / 桌面浏览器全覆盖。若想榨体积,可以做双格式:OGG 给支持的浏览器、M4A/MP3 兜底(Howler.js 的多格式数组会自动选能播的那个)。但若想省事,**直接全用 M4A/AAC 单格式即可**,覆盖最广、体积也小。

无缝循环问题:MP3 因固定帧结构在 loop 接缝处有微小间隙,AAC/M4A 也略有但比 MP3 轻;**真正的解法不是靠格式,而是用 Web Audio 的 `AudioBufferSourceNode.loop`(样本级精确)或在音频文件里预留好 loop 点**。所以"格式选 M4A + 用 Web Audio buffer loop"组合,既兼容 iOS 又无缝。

**第三原则:码率。** 背景音乐 96–128 kbps 立体声足够(感知音质在这个区间 AAC/Vorbis 已经很好,[搜索结果印证 96–192 kbps 区间](https://vi-control.net/community/threads/game-music-whats-the-norm-wav-ogg-mp3-16-bit-24-bit.45633/))。一条 40 秒 / 112 kbps 立体声 ≈ 0.5 MB。12–14 条 ≈ **6–8 MB 总音频资产**,对网页游戏可接受,且不会一次性全加载(见懒加载)。

### 3.3 懒加载策略

你的游戏是"先在某城,再去别城",天然适合按需加载,**不要开局就拉 8 城全部 BGM**。

推荐分层:

1. **首屏只加载:标题曲 + 玩家初始所在城市的 BGM。** 其余 0 加载。首屏音频负担 ≈ 1–1.5 MB。
2. **进入某城时,异步 fetch 该城 BGM**(用 `fetch` → `arrayBuffer` → `decodeAudioData` 缓存进一个 `Map<cityId, AudioBuffer>`)。加载期间先静音或用通用底噪占位,buffer ready 后 crossfade 进来。
3. **预加载下一城(可选优化):** 当玩家在某城且剧情/UI 暗示即将转城,后台悄悄预取目标城 BGM,切城时零等待。
4. **结局音乐:** 临近结局判定时再加载对应基调那 1 条(好/中/坏),16 结局只对应 3 个文件,命中率高、缓存友好。
5. **加载过的 buffer 常驻缓存,不重复下载**;移动端内存敏感,但 12–14 条短 loop 解码后总占用很小,可全程留着。
6. **UI 音效:** jsfxr 在 app 启动时一次性把几个预设(coin/blip/confirm/page)合成成 buffer 缓存好,之后零延迟、零网络。

工程上这一切都封装在 `audioStore`(Zustand)+ `AudioManager` 组件里:组件 `useEffect` 订阅"当前城市 id",id 变化就触发"确保该城 buffer 已加载 → crossfade"。**引擎五函数和 12 状态完全不知道音频存在**,符合你的铁律。

---

## 与"建筑贴底图违和"问题的一句话关联

你提到的真正痛点是 M1 地图把建筑用固定百分比坐标贴在 Gemini 底图上、和河流道路打架。这是**视觉表现层**问题,和音频是两条独立的重构线,音频系统不依赖地图怎么改。不过两者可以共享同一个"场景/城市状态 → 表现层订阅"的架构:地图渲染订阅它来摆 sprite,音频系统订阅它来切 BGM,都从 Zustand 的同一份派生状态读,互不耦合,也都不碰 `src/game/`。地图摆位的具体解法(改成 tilemap 网格 / 让建筑与底图分层生成 / 程序化锚点)不在本次音频研究范围,需要可单独开一轮。

---

## 来源汇总

**Web Audio / 自动播放 / crossfade:**
- [MDN — Autoplay guide for media and Web Audio APIs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- [Chrome for Developers — Autoplay policy in Chrome](https://developer.chrome.com/blog/autoplay)
- [web.dev — Developing game audio with the Web Audio API](https://web.dev/articles/webaudio-games)
- [web.dev — Getting started with Web Audio API](https://web.dev/articles/webaudio-intro)
- [Nicola Hibbert — Web Audio API Tutorial (crossfade)](https://nicolahibbert.com/web-audio-api-tutorial/)
- [MDN — AudioParam.exponentialRampToValueAtTime()](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime)

**音乐来源 / 许可证:**
- [facebook/MusicGen — output license discussion (CC-BY-NC, 不可商用)](https://huggingface.co/spaces/facebook/MusicGen/discussions/8)
- [InfoQ — Meta Open Sourced AudioCraft (权重 CC-BY-NC)](https://www.infoq.com/news/2023/08/meta-text-to-music-generative-ai/)
- [Pixabay — Commercial Use Music](https://pixabay.com/music/search/commercial%20use/)
- [MUSCO SOUND — Pixabay Music license 评测(隐患与 standalone 限制)](https://www.michaelmusco.com/2026/02/pixabay-music-review.html)
- [OpenGameArt — CC0 Music](https://opengameart.org/content/cc0-music-0)
- [itch.io — CC0 music assets](https://itch.io/game-assets/assets-cc0/tag-music)
- [Tallbeard Studios — 免费 Music Loop Bundle](https://tallbeard.itch.io/music-loop-bundle)

**程序化音效:**
- [Tone.js](https://tonejs.github.io/)
- [jsfxr — npm](https://www.npmjs.com/package/jsfxr)
- [sfxr.me — 在线 8-bit 音效生成](https://sfxr.me/)

**格式 / 体积 / iOS 兼容:**
- [caniuse — Ogg Vorbis(iOS 18.4 起原生支持)](https://caniuse.com/ogg-vorbis)
- [VI-Control — 游戏音乐格式/码率讨论(OGG vs MP3, 96–192 kbps)](https://vi-control.net/community/threads/game-music-whats-the-norm-wav-ogg-mp3-16-bit-24-bit.45633/)

---

# cities

速查板已出。下面是给 Gemini 出图的完整美术指导 + BGM,以及最关键的工程建议:把"建筑贴固定坐标"换成"每城专属底图 + 节点对齐到底图地块",这才是治本。

---

# 英伦留学物语 · 8 城专属视觉方向

返回给上游的核心交付。所有 prompt 都在现有统一 `STYLE` spine 之上(dusk amber + indigo + slate,16-bit,无字无商标),只换地形剪影与色温微差。下面每城给:**地标/地形 → 主色微差 → 校园 vs 城区 → BGM 情绪 → Gemini prompt 增量片段**。

---

## 0. 治本建议(关键,先说工程,再说美术)

用户的痛点"建筑固定坐标和底图河流/道路打架"根因是:**`ground-town` / `ground-campus` 只有一套通用底图,8 城共用**,而 `gen-map-art.mjs` 里 town 底图硬画了"一条河 + 两座桥",London 的河和 Sheffield 的山就对不上;同时建筑用 `locations.ts` 的固定百分比坐标贴上去,必然和底图里画死的河道冲突。

三条治本路径(都不碰 `src/game/` 内核,只动表现层 `src/map/` + 资产):

1. **底图与地块解耦(最推荐)**:底图只画"地、水、绿、光",**不画任何道路网格**;道路/河流交给一层独立的"路网 SVG/PNG",建筑节点坐标从这层路网的"地块中心"取,而不是凭空贴。这样换城只换底图皮肤,坐标不动。
2. **每城专属底图皮肤**:把 `ground-town` 升级成 `ground-town-<city>`(8 张),`MapScene.tsx` 第 135 行 `assetUrl('ground-'+zone)` 改成读 `state.config.city`。底图按下方"地形剪影"出,但**地块留白位置 8 城保持一致**(同样 15 个空地块),坐标表 `locations.ts` 完全复用,只是皮肤变。这是改动最小、收益最大的一档。
3. **建筑做"带地基阴影 + 等距投影(isometric)"的 sprite**,SPRITE prompt 加 `isometric 2:1 dimetric projection, soft drop shadow baked onto a small oval base`,贴上去自带立体地基,不再像浮在底图上。再配合节点 CSS `transform: translate(-50%, -85%)` 让脚底落在坐标点,而不是中心落点 —— 这一条直接解决"摆位违和、不够立体"。

> 美术层面我按"方案 2 + 方案 3"组织:每城一张专属 town 底图(地块留白对齐),建筑 sprite 改等距投影。下面的 prompt 都遵循"地块留白位置 8 城一致"。

---

## 1. 伦敦 London — 大河之城
- **地标/地形**:泰晤士宽河横贯、双层石桥、巨型观景摩天轮、河畔钟塔、玻璃尖塔群(碎片状/子弹状泛化轮廓),红色双层巴士点缀。河面最宽,城市最垂直密集。
- **主色微差**:在统一琥珀基调里**冷蓝灰压最重**,玻璃幕墙吃冷青反光,霓虹冷光做点缀,暖琥珀只从窗户里漏出来 —— 八城里最"冷而繁忙"。
- **校园 vs 城区**:校园 = 零散红砖学院夹在写字楼缝隙里,局促;城区 = 垂直高密度大都会,天际线最满。
- **BGM 情绪**:都市爵士低音 + 地铁回响 + 细雨,`busy / glamorous-but-lonely / late-night`,节奏稳但底色孤独。
- **Gemini 增量**:`a wide tidal RIVER crossing the whole scene, a tall observation wheel, a riverside clock tower, clustered glass shard towers, a red double-decker bus, the coldest blue-slate dusk with neon cool accents`

## 2. 牛津 Oxford — 梦幻尖塔
- **地标/地形**:蜜色石材学院群、密集"梦幻尖塔"天际线、圆顶图书馆(穹顶+柱廊泛化)、鹅卵石窄巷、回廊方庭。无大河,地势平。
- **主色微差**:**暖蜜金最浓**,石墙整面吃落日,八城里最"暖而庄严"。窗光偏烛黄。
- **校园 vs 城区**:校园与城几乎一体 —— 学院即城;城区 = 蜜石老街连成片,几乎看不到现代玻璃。
- **BGM 情绪**:教堂管风琴 + 弦乐 + 微弱钟声,`solemn / prestigious / suffocating-aura`,千年学府的光环与压迫并存。
- **Gemini 增量**:`a dense skyline of honey-coloured stone college spires and pinnacles, a domed library with a colonnade, cobbled narrow lanes, cloistered quadrangles, NO river, the warmest honey-gold dusk soaking the stone`

## 3. 剑桥 Cambridge — 康河柔波
- **地标/地形**:学院礼拜堂(竖向扶壁+小尖塔)、**平静窄河(康河)**、撑篙小船(punt)、拱形小石桥(叹息桥泛化)、河后绿草后庭(the Backs)、自行车。河比伦敦窄得多、静得多。
- **主色微差**:暖金**偏柔**,水面镜面反光是主角,比牛津更静、更湿润,蜜金里掺一点水汽青。
- **校园 vs 城区**:校园 = 临河学院 + 草坪后庭;城区 = 小巧自行车小镇,尺度比牛津更袖珍。
- **BGM 情绪**:竖琴 + 木管 + 水波声,`serene / soft / gentle-pressure`,柔软表面下赶不完的 due。
- **Gemini 增量**:`a calm narrow river with a person punting a flat boat, college chapels with small pinnacles, a single arched stone bridge, green riverside lawns (the backs), bicycles, soft warm-gold dusk with glassy water reflections`

## 4. 曼彻斯特 Manchester — 工业红砖
- **地标/地形**:维多利亚棉纺红砖货仓、运河 + 船闸、**铁架高架铁路桥(Castlefield 泛化)**、几栋现代玻璃新塔混入。湿气最重,巷子最热闹。
- **主色微差**:**暖砖橘 + 雨雾灰**,红砖在湿地面上反暖光,八城里最"潮湿而接地气"。
- **校园 vs 城区**:校园 = 整排维多利亚红砖大楼;城区 = 运河仓改造的酒吧/夜生活街,烟火气最足。
- **BGM 情绪**:独立摇滚电吉他 + 鼓机 + 雨声,`lively / gritty / down-to-earth`,热闹不端着。
- **Gemini 增量**:`Victorian red-brick cotton warehouses, a canal with a lock gate, an iron railway viaduct with arches, a few modern glass towers behind, wet reflective streets, warm brick-orange dusk under rainy grey mist`

## 5. 爱丁堡 Edinburgh — 岩丘古堡
- **地标/地形**:**火山岩峭壁上的城堡(地形是关键:陡峭岩丘,非平地)**、老城黑色尖塔群、陡石阶窄巷(closes)、纪念碑尖塔。地势最起伏。
- **主色微差**:**冷石板紫灰**,风刀感,暖琥珀只在街灯上孤亮一点,八城里最"苍凉如画"。
- **校园 vs 城区**:校园 = 乔治式灰石大楼环绕草坪广场(新城,规整);城区 = 高低错层的中世纪老城坡(老城,陡乱)。新旧城对比是这座城的灵魂。
- **BGM 情绪**:苏格兰风笛 + 弦乐 + 风声,`windswept / dramatic / picturesque-melancholy`。
- **Gemini 增量**:`a castle perched on a craggy volcanic basalt cliff (steep hill, not flat), old-town black spires, steep stepped alleys, a monument spire, cold slate-purple dusk, wind-swept mood, lone amber street lamps`

## 6. 伯明翰 Birmingham — 运河之心
- **地标/地形**:**全英最密运河网(运河十字路口 + 一堆砖拱低桥,比威尼斯还多 —— 这是伯明翰最强辨识点)**、红砖运河仓(Gas Street 泛化)、圆鳞曲面新楼(Bullring 泛化)、高架立交。地势是 200 尺台地(略高于四周)。
- **主色微差**:暖砖橘 + 金属反光,务实居中,不冷不暖,八城里最"方便而务实"。
- **校园 vs 城区**:校园 = 红砖钟楼 + 开阔现代广场;城区 = 运河十字 + 高架立交 + 曲面商场,运河密度是和别城拉开差距的关键。
- **BGM 情绪**:放克贝斯 + 都市节拍,`practical / functional / urban-warm`,生活方便的烟火节奏。
- **Gemini 增量**:`the densest canal network with a canal crossroads and many low brick arch bridges (more canals than Venice), red-brick canalside warehouses, a curved scaled-facade modern mall, an elevated road junction, warm brick-orange dusk with metallic highlights`

## 7. 谢菲尔德 Sheffield — 七丘五河
- **地标/地形**:**七座丘陵起伏 + 山坡上层叠台阶式排屋(terraced houses 顺坡而上 —— 最强辨识点)**、五条小河汇流、**全欧人均最多树(大量绿冠)**、远处 Peak District 国家公园旷野。三分之一在国家公园里。
- **主色微差**:**暖绿 + 砖橘**,绿冠面积八城最大,最"绿、安静、物价友好"的学生城。
- **校园 vs 城区**:校园 = 依坡而建的混凝土 + 绿荫;城区 = 层叠排屋望向旷野,看得到山外的乡野。
- **BGM 情绪**:原声木吉他 + 田园木管,`quiet / pastoral / healing`,安静治愈不焦虑(贴合游戏里 stress 低、物价友好的设定)。
- **Gemini 增量**:`rolling hills with rows of terraced houses stepping up the hillsides, five small rivers meeting, the greenest English city with abundant tree canopies, the Peak District moorland visible in the distance, warm green-and-brick dusk, calm mood`

## 8. 布里斯托 Bristol — 港湾峡谷
- **地标/地形**:**横跨深峡谷的吊桥(Clifton 泛化:两塔 + 悬索 —— 最强辨识点)**、浮动港口(harbour,系着小船 + 起重机)、彩色坡屋(成排彩色房子)、街头涂鸦墙。坡很多(贴合现有 desc"坡很多")。
- **主色微差**:暖琥珀里**掺青绿水光**,彩色房子让它最"文艺多彩",八城里色相最跳。
- **校园 vs 城区**:校园 = 坡上塔楼 + 维多利亚联排;城区 = 彩色房 + 涂鸦 + 港口,艺术气最浓。
- **BGM 情绪**:trip-hop 慵懒节拍 + 暖合成器(Bristol 是 trip-hop 发源地,地道),`artsy / mellow / liveable`。
- **Gemini 增量**:`a suspension bridge with two towers spanning a deep gorge, a floating harbour with moored boats and a crane, rows of colourful pastel hillside houses, street-art walls, hilly streets, warm amber dusk laced with teal water reflections`

---

## 跨城统一锚点(保证"一套基调,八种微差")
- **共享 spine**:沿用 `gen-map-art.mjs` 现有 `STYLE`(dusk amber + indigo + slate / 16-bit / 限色 / 无字无商标 / 原创非 Kairosoft),只追加上面每城的"增量片段"。
- **色温轴**:冷 →暖排序 `伦敦(最冷) → 爱丁堡 → 剑桥 → 谢菲(绿) → 曼彻 → 伯明翰 → 布里斯托 → 牛津(最暖)`。8 城落在同一琥珀光下,但冷暖各偏一档,这是"一眼可分"又"一套世界观"的关键。
- **辨识点速记(每城一个不可混的形)**:伦敦=宽河+摩天轮 / 牛津=蜜色尖塔丛 / 剑桥=撑篙小船 / 曼彻=铁架高架桥 / 爱丁堡=岩丘城堡 / 伯明翰=运河十字+砖拱 / 谢菲=顺坡台阶排屋 / 布里斯托=峡谷吊桥。**只要这 8 个形互不重复,玩家进城第一眼就知道在哪。**

---

## 落地清单(交给上游执行,均不触碰 `src/game/` 内核)
1. `scripts/gen-map-art.mjs`:`skylines` 数组用上方"增量片段"重写(8 城更具体);新增 `ground-town-<city>` 8 条(或在 `grounds` 里参数化城市),底图**不画道路网格**、地块留白位置 8 城一致。
2. `src/map/MapScene.tsx` L135:`assetUrl('ground-'+zone)` → town 时读 `ground-town-${state.config.city}`,campus 可保持通用或同法分城。
3. `SPRITE` 常量追加等距投影 + 地基阴影;节点 CSS 落点改 `translate(-50%, -85%)` 治"浮空"。
4. BGM:8 条情绪关键词可直接喂给 AI 配乐(Suno/Udio)或音库检索,文件名建议 `bgm-<city>.mp3`,在 `MapScene` 按 `state.config.city` 切换。

相关文件(绝对路径):
- 出图脚本:`/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/scripts/gen-map-art.mjs`
- 地图表现层:`/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/map/MapScene.tsx`、`/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/map/locations.ts`
- 城市数据:`/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/game/constants.ts`(L93-103 CITIES)
- 资产清单:`/Volumes/Samsung990Pro/Work_space/liuxue-monogatari/src/assets/generated/manifest.json`

Sources:
- [Geography of Sheffield — Wikipedia](https://en.wikipedia.org/wiki/Geography_of_Sheffield)
- [Birmingham Canal Navigations — Wikipedia](https://en.wikipedia.org/wiki/Birmingham_Canal_Navigations)
- [Manchester Ship Canal — Wikipedia](https://en.wikipedia.org/wiki/Manchester_Ship_Canal)
- [Geography of Greater Manchester — Wikipedia](https://en.wikipedia.org/wiki/Geography_of_Greater_Manchester)

---

# ux

完整边界确认。`location` 在 `src/data/index.ts` 第 37 行注入(generated actions 自带,base actions 走 `BASE_ACTION_LOCATIONS` 映射,缺省落 `town`),引擎完全无 location 概念 — 这是纯表现层的事,改它不碰铁律。8 城已确认,actions 已绑 15 个 locId。

我现在已经有设计这套交互所需的全部事实。我不写文件,直接把完整方案作为返回值给包工头。

---

# 《英伦留学物语》v2 交互/UX 设计方案 —— 进门才点击 + 2.5D 主题呼叫式弹窗

## 0. 现状锚点（设计据此落地，全部已核实）

| 事实 | 位置 | 对设计的约束 |
|---|---|---|
| 引擎无 `location` 概念,`location` 是表现层在 `src/data/index.ts:37` 注入的标签 | 已确认 | 内部场景=纯表现层重排,**改它不碰铁律** |
| 15 个 locId 已和 actions 绑定(generated 自带 + `BASE_ACTION_LOCATIONS` 映射) | `actions.json` / `index.ts` | 内部场景行动列表 = `actionsAtLocation(locId)` 直接复用,**零数据迁移** |
| 行动入口现状 = `tapNode()` 走到节点立刻 `setOpenLoc()` 弹底部 `LocationSheet` | `MapScene.tsx:122-130` | v2 把"点节点→弹菜单"拆成"点节点→进内部→在内部弹呼叫弹窗" |
| 出图通路 = `assetUrl(id)` 查 `manifest.json`,缺图回退 emoji/CSS,**无 404** | `theme.ts:67` | 新增 `interior-*` / `prop-*` 资产**渐进式**:没图时内部场景用 CSS 占位,不阻塞 |
| 引擎五函数 + 12 状态 + 8 路线 = `act/resolve/advance/continueWeekly` 经 store 调 | `store.ts` / `index.ts` | 表现层只调这四个 store action,**签名不动** |
| `EventModal` 现状 = 全屏 `modal-backdrop` 居中卡 | `play.tsx:104` | v2 事件改"角色冒泡"呼叫式,但**仍只调 `resolve(idx)`** |
| 8 城已定义,天际线 8 张已出 | `constants.ts` / manifest | 每城专属地形 = 8 套 `ground-<city>-*`,复用 `state.config.city` |

铁律边界一句话:**本方案新增/重排的全部是 `src/map/`、`src/ui/`、`styles.css`、`public/assets/` 和一个新增的 `src/audio/` 层。`src/game/` 一行不改,`src/data/*.ts` 内容不改(只可能新增 location 映射表,那是表现层数据)。**

---

## 1. 进门才点击 —— 三层状态机

把"地图"从一个平面升级成**俯瞰层(OVERWORLD) → 门口层(APPROACH) → 内部层(INTERIOR)**的三态。核心:**俯瞰层只能"走"和"进",所有"做事"都在内部层。**

```
        ┌─────────────────────────────────────────────────────────┐
        │  OVERWORLD (城市俯瞰, 2.5D 宝可梦排布)                      │
        │  · 点建筑 = 选中(高亮+名牌弹起), 不直接做事                  │
        │  · 再点"进入"按钮 / 或双击建筑 = 触发 APPROACH              │
        └───────────────┬─────────────────────────────────────────┘
                        │ 选中建筑
                        ▼
        ┌─────────────────────────────────────────────────────────┐
        │  APPROACH (过场, 200-450ms, 不可打断不可点)                │
        │  · 小人沿 2.5D "路径"走到该建筑门口(走路帧动画)             │
        │  · 门口灯亮 / 门"咔哒"开 / 镜头轻微推近(scale 1→1.06)       │
        │  · 黑场 80ms 遮丑 → 切内部图                                │
        └───────────────┬─────────────────────────────────────────┘
                        │ 到门口, 进门
                        ▼
        ┌─────────────────────────────────────────────────────────┐
        │  INTERIOR (该地点室内 2.5D 场景)                           │
        │  · 一张室内像素底图 + 1-3 个前景可交互物件/角色             │
        │  · 行动 = 从物件/角色"呼叫式弹窗"冒出                       │
        │  · 左上"← 出门"回 OVERWORLD; 行动点耗尽时引导回宿舍         │
        └─────────────────────────────────────────────────────────┘
```

### 1.1 为什么要 APPROACH 这一拍(关键 UX 决策)

现状 `tapNode` 是"点了立刻弹",小人 walk 只是 CSS 装饰、和弹窗并行。v2 的进门感**必须让"走到门口"成为进入的前置因果**,否则"进门才点击"就只是换个皮的弹窗。但移动端用户没耐心等长动画,所以:

- **APPROACH 默认 ~280ms**,且**可跳过**:进场动画期间再点一次屏幕直接快进到 INTERIOR(老玩家不被惩罚)。
- **不做寻路**。2.5D 俯瞰里给每个建筑预存一条"门口落点"`(doorX, doorY)` 和一个朝向,小人做的是**直线滑行 + 走路帧**到落点,不是 A*。宝可梦的"进门"本质也是踩到门 tile 触发 warp,不是真寻路。我们用**伪深度**(`translateY` + `scale` 随 y 变大)让这段滑行看着像"往里走"。
- 进门瞬间用**一次 80ms 黑场(或白闪 for 灯火通明的店)**盖住俯瞰图→内部图的硬切。这是 2.5D 转场的标准遮丑手法,成本极低。

### 1.2 "选中"与"进入"为什么分两步(防误触)

竖屏 375px 单手,建筑挨得近,**一次点击直接进入会高频误触**。所以 OVERWORLD 用**"点一下=选中,选中后出确认入口"**:

```
点建筑 jasmine  →  该建筑"跳一下"(scale 1→1.08→1) + 名牌从地面弹起
                   底部浮出一条贴该建筑主题的"门牌条"(见 §2.3):
                   ┌──────────────────────────────────┐
                   │ 📚 图书馆       这里有 3 件事可做   │
                   │           [ 进入 → ]              │  ← 拇指区, 56px 高
                   └──────────────────────────────────┘
再点[进入] 或 再点同一建筑 = APPROACH
点别的建筑 = 切换选中(门牌条内容替换, 不进入)
点空地 = 取消选中
```

这条"门牌条"同时解决三件事:**确认进入**、**预告里面有几件事可做(信息嗅探)**、**行动点不足时变成灰态并解释**(见 §3.3)。

---

## 2. 呼叫式弹窗 —— 行动/事件如何"从场景里冒出来"

这是用户最在意的点:行动不再是"贴在屏幕底的列表",而是**内部 2.5D 场景里的物件/角色主动"喊你"**。我给三种形态,按用途分工,全部移动端单手友好。

### 2.1 形态 A — 物件冒泡(Anchored Speech Bubble):用于"地点固有行动"

内部场景里每个可做的行动,**锚定到画面里一个具体物件**,从该物件位置冒出一个像素对话气泡,气泡有指向物件的小尾巴。

```
        ┌───────────────────────┐
        │  📖 自习一下午          │   ← 气泡(像素描边, 主题色)
        │  GPA↑ 体力↓            │   ← 一行效果预告(已有 effectChips, 复用)
        └──────────┬────────────┘
                   ▽  ← 尾巴指向书桌
              ╔═════════╗
              ║ [书桌]   ║   ← 内部场景前景物件(prop sprite, 灯/光标闪烁)
              ╚═════════╝
```

- 物件本身有**待办呼吸灯**(可做=描边脉动 + 偶尔"!"冒头;锁定=灰 + 🔒;做过=暗)。这就是用户要的"建筑/物件动态化"在内部的延续。
- **气泡默认收起**,只显示物件上方一个小图标徽标(如书桌上一个 📖 角标)。**点物件→气泡展开**(从物件位置 scale-up 弹出,带尾巴),**再点气泡=执行**。两步:看→做,防误触。
- 一个场景里可做的行动通常 2-4 个,**各自锚定不同物件**,不会糊在一起。

适用:`library`(书桌/书架/打印机)、`gym`(跑步机/杠铃)、`market`(货架/收银台)、`dorm`(床/灶台/书桌/行李箱)等**行动天然对应物件**的地点。

### 2.2 形态 B — 角色召唤气泡(NPC Call-out):用于"和人有关的行动/事件"

内部场景里站着一个 NPC(店员/老师/同学/医生),NPC **主动冒话**召唤你,这是"呼叫式"最字面的体现。

```
   ╔════════╗   ┌──────────────────────────────┐
   ║        ║◀──┤ "下午有空吗? 一起赶 group?"   │   ← NPC 主动喊
   ║ [同学]  ║   └──────────────────────────────┘
   ║ (挥手帧) ║   点 NPC → 展开他能给的 1-N 个选项(贴主题卡, §2.3)
   ╚════════╝
```

- NPC 有**待机动画**(眨眼/挥手/打字),**有可交互行动时头顶冒"…"或"!"**。
- 这同时是**事件(event)的载体**:现状 `EventModal` 是全屏居中卡,v2 改成**"对应 NPC 头顶炸出感叹号 + 镜头轻推 + 气泡展开"**,但**底层仍 100% 调 `resolve(idx)`,choices 仍来自 `ev.choices`**(`play.tsx:104-127` 的逻辑原样搬进新外壳)。事件 = 一种"强制展开、不可关闭"的角色召唤弹窗。

适用:`society`(社团同学)、`work`(工头)、`clinic`(医生/护士)、`career`(顾问)、`bank`(柜员)、`nightlife`(朋友)。

### 2.3 形态 C — 主题贴合卡(Themed Action Card):气泡展开后的"做事卡"

气泡/NPC 是"召唤",真正"选哪件事"用一张**贴合该地点主题的卡片**呈现,从**屏幕底部上滑**进入拇指热区(竖屏单手核心)。这是把现状 `LocationSheet`(`MapScene.tsx:35`)**升级**:不再是一个通用列表,而是**每类地点有自己的视觉皮肤**,且卡从内部场景"长出来"。

```
375px 竖屏, 卡片占下 40-55% 高, 上 contentscape 留给内部场景(能看到 NPC/物件):

  ┌─────────────────────────────────┐
  │                                 │
  │     [内部 2.5D 场景, 半可见]      │  ← 上半屏: 场景+被点的物件高亮
  │        ╔═══╗                    │
  │        ║NPC║  ← 说话中            │
  │        ╚═══╝                    │
  ├═════════════════════════════════┤  ← 卡片顶边缘 = 主题色描边 + 抓手条
  │ 📚 图书馆 · 自习区                │  ← 主题头(地点名+区域, 配该地点 emoji)
  │ ┌─────────────────────────────┐ │
  │ │ 📖 自习一下午          1 点   │ │  ← 行动项: 大点击块 64px 高
  │ │ GPA +6  英语 +1  体力 -12    │ │     (effectChips 复用, 颜色已有)
  │ └─────────────────────────────┘ │
  │ ┌─────────────────────────────┐ │
  │ │ 📝 赶 essay            1 点   │ │  ← risk 行动右上角一个 ⚡ 小角标
  │ │ ⚡ 有概率出状况               │ │
  │ └─────────────────────────────┘ │
  │  还没解锁: 找老师 office hour     │  ← locked 行动折叠成一行灰字(同现状)
  │              [ ← 出门 ]          │  ← 返回俯瞰 = 大按钮, 拇指够得到
  └─────────────────────────────────┘
```

**主题皮肤怎么"贴合"而不增加 15 套维护成本**:卡片皮肤**按地点类别**(§4 的 5 类)共用一套 CSS variant,只换:(1)主题色 `--interior-accent`、(2)头部 emoji、(3)抓手条纹理。比如学习类=冷蓝、消费类=暖橙、健康类=薄荷绿、社交类=紫、行政类=褐金。**5 套皮肤覆盖 15 地点**。

### 2.4 三形态如何统一(给工程的实现锚点)

三种弹窗本质是同一个组件 `<CallOut>` 的三种 `variant`:

```ts
// 表现层新增, 不碰引擎
type CallOut =
  | { kind: 'object'; anchorPropId: string; actionId: string }   // 形态A
  | { kind: 'npc'; npcId: string; actionIds: string[] }          // 形态B 行动
  | { kind: 'event'; npcId: string; eventId: string }            // 形态B 事件
type ActionSheetSkin = 'study'|'consume'|'health'|'social'|'admin'  // 形态C 皮肤
```

- 形态 A/B 是**场景内的锚点触发器**(冒泡),点了之后→形态 C(底部卡)出现并聚焦到对应行动。也可配置"单行动物件"直接点物件=点确认(跳过 C,极简地点用)。
- **执行路径全程只有两个出口**:行动→`act(actionId)`;事件→`resolve(idx)`。和现状完全一致。

---

## 3. 进出转场 / 返回 / 行动点耗尽引导

### 3.1 进入转场(OVERWORLD → INTERIOR)

```
选中建筑 → [进入] →
  ① 镜头锁定该建筑, 其余建筑/地形 200ms 内 blur+暗(景深)
  ② 小人滑行到 doorXY + 走路帧 (~280ms, 可点击快进)
  ③ 门口灯亮 + "咔哒"音效 + 该建筑 scale→1.06
  ④ 80ms 黑场 →
  ⑤ INTERIOR 淡入: 室内底图从 scale 1.04→1.0 (轻微"走进去"感) + 该地点 BGM 淡入
  ⑥ 800ms 后, 场景里可做的物件/NPC 依次"亮灯"呼吸 (引导视线)
```

### 3.2 退出转场(INTERIOR → OVERWORLD)

```
点 [← 出门] →
  ① 底部行动卡下滑收起
  ② 80ms 黑场 →
  ③ INTERIOR 淡出, OVERWORLD 淡入, 小人出现在该建筑门口(不是宿舍, 保持空间连续)
  ④ 该 BGM 淡出回到城市 BGM
  ⑤ 镜头解除景深, 恢复全图
```

**空间连续性原则**:出门后小人站在刚才那栋楼门口,不瞬移回宿舍。这让"逛"有空间感,符合宝可梦地图直觉。

### 3.3 行动点耗尽引导(三道防线,逐级递进)

现状是 `tapNode` 里弹一句 toast(`MapScene.tsx:123-127`)。v2 把"没行动点"做成**贯穿三层的状态**,因为玩家可能在任意层耗尽:

**第一道 · OVERWORLD 层**:行动点=0 时,
- 所有建筑 `--dim`(变灰,沿用现状 `statusOf` 的 `dim`),
- **唯独宿舍 `dorm` 高亮 + 头顶冒"💤睡觉推进"气泡**(把"下一步"指向唯一出口),
- 底部"门牌条"对非宿舍建筑显示灰态:`今天没精力了,先回宿舍睡一觉 →`,点它=自动选中宿舍。

**第二道 · INTERIOR 层(在里面把最后一点行动点用完)**:
- 最后一个行动执行完,**该场景所有物件/NPC 的呼吸灯熄灭**(视觉上"今天到此为止"),
- 底部卡变成一张**收尾卡**:`这周这里做完了。 [← 出门]`,
- 不强制踢出,允许玩家在里面待着看场景(情绪价值)。

**第三道 · 始终在场 · 底部主推进键**:沿用现状 `bottom-bar`(`play.tsx:180`)。
- 有行动点时:`提前进入下周(剩 N 行动)`(ghost 样式),
- 行动点=0 时:变 primary 高亮 `进入下周 →`,这是 `advance()` 唯一入口,**任何层都可见可点**。

> 关键:**advance/进入下周永远不被内部场景挡住**。无论玩家在哪一层,底部那颗推进键都在(INTERIOR 时它浮在行动卡之上一层,或并入行动卡底部)。这样"行动点耗尽=死路"绝不会发生。

### 3.4 周末结算 / 事件 与新交互的衔接

- `WeeklySummary`(周末结算卡)和**进入下周**绑定:`advance()` 后若 `phase==='weekly'`,**自动退回 OVERWORLD** 再弹结算卡(避免在某个室内突然弹周报,空间错乱)。
- 事件 `phase==='event'`:若事件由某地点行动的 `risk` 触发,**就地在当前 INTERIOR 用形态 B 冒泡**(NPC/物件炸感叹号);若是周推进产生的全局事件,在 OVERWORLD 层用一个"信使 NPC"冒泡承载。两种都只调 `resolve(idx)`。

---

## 4. 15 个内部场景图 —— 哪些要专属、如何按类复用降本

核心策略:**底图按"类别模板"复用 + 前景物件/NPC 按地点专属**。一张室内底图的视觉辨识度,70% 来自前景物件和 NPC,而非墙面。所以**底图做 5 套类别模板(可叠加城市色调),前景物件 15 套薄装饰**,而不是 15 张满图。

### 4.1 五大类别(覆盖全部 15 地点)

| 类别 | 地点 | 共用底图模板 | 专属前景物件(prop)/NPC | 卡片皮肤色 |
|---|---|---|---|---|
| **学习类 STUDY** | library, lecture, career | `interior-study`(暖木桌+大窗+书架墙) | library: 书堆/打印机 · lecture: 黑板/投影/排椅 · career: 海报墙/顾问桌 | 冷蓝 |
| **消费类 CONSUME** | market, mall, bank | `interior-shop`(货架+柜台+地砖) | market: 中超货架/泡面墙 · mall: 橱窗/试衣 · bank: 柜台玻璃/叫号屏 | 暖橙 |
| **健康类 HEALTH** | gym, clinic, park | `interior-health`(浅色+长窗) gym/clinic 用; park 用 `scene-outdoor` 户外 | gym: 跑步机/杠铃 · clinic: 诊床/护士台 · park: 长椅/树(户外,不算"内部") | 薄荷绿 |
| **社交类 SOCIAL** | society, nightlife, work | `interior-social`(暖光+沙发/吧台) | society: 社团旗/桌游 · nightlife: 霓虹/DJ台 · work: 后厨/收银 | 紫/霓虹 |
| **生活类 LIFE/ADMIN** | dorm, station, town | dorm 用 `scene-dorm`(已存在!) · station/town 偏户外 | dorm: 床/灶台/行李箱 · station: 检票口/站台 · town: 街景拱门 | 褐金 |

### 4.2 资产清单(按优先级,渐进交付,缺图自动回退)

`assetUrl` 缺图回退机制(`theme.ts`)意味着**可以先全用 CSS 占位上线,再逐张替换**。建议三批:

**P0(MVP,5 张底图模板)** — 立刻有"进门"体感:
`interior-study` / `interior-shop` / `interior-health` / `interior-social` / 复用已有 `scene-dorm`(dorm)。
→ 5 类各一张,15 地点全部"有内部可进",其中 dorm 零成本。

**P1(15 套前景物件 prop)** — 让每个地点有辨识度,每套 1-3 个小 sprite:
`prop-library-desk` `prop-lecture-board` `prop-career-poster` `prop-market-shelf` `prop-mall-window` `prop-bank-counter` `prop-gym-treadmill` `prop-clinic-bed` `prop-park-bench`(park 户外) `prop-society-flag` `prop-nightlife-dj` `prop-work-kitchen` `prop-dorm-stove` `prop-station-gate` `prop-town-arch`。
→ 这是降本关键:**薄物件比满图省 5-8 倍出图成本**,且物件天生适合"冒泡锚点"和"呼吸灯动画"。

**P2(NPC sprites,~6 个,跨地点复用)**:
`npc-clerk`(店员,market/mall/bank/work 通用)、`npc-advisor`(career/lecture)、`npc-mate`(society/nightlife/group)、`npc-medic`(clinic)、`npc-coach`(gym)、`npc-messenger`(全局事件信使)。
→ 6 个 NPC 覆盖全部召唤式交互,**不做 15 套人**。

**专属图(只有 2 个真正需要"独此一张")**:
- `dorm` 已有 `scene-dorm`,直接用。
- `nightlife` 霓虹氛围太特殊,建议给一张**专属底图** `interior-nightlife`(否则套 social 模板会平淡)。

→ **总账:5 类底图 + 1 张 nightlife 专属 + 15 薄物件 + 6 NPC = 27 个新资产**,而非"15 张满室内图 + 15 套人"(那是 30+ 张满图)。**底图侧省 ~3 倍,且全部可渐进、缺图不崩。**

### 4.3 城市特色如何进内部(低成本)

用户要"每城专属地形",但**内部场景不必每城重画**。做法:**内部底图统一,叠一层 `--city-tint` CSS 滤镜 + 窗外天际线**:
- 内部场景的"窗户"位置贴当前城市的 `skyline-<city>`(8 张已存在!)——伦敦窗外是泰晤士天际线,爱丁堡窗外是城堡剪影。**零新增资产**,直接复用现成 8 张天际线当"窗景"。
- 整张内部图叠一个极淡的城市色调(伦敦冷灰、曼城暖、爱丁堡石青),用 `mix-blend` 或 `filter: hue-rotate/sepia` 实现,**纯 CSS**。

这样"15 内部 × 8 城 = 120 张"的爆炸被压成"~6 底图 + CSS tint + 复用天际线"。**OVERWORLD 层的"每城专属地形"才是真要画 8 套的地方**(那是 v2 阶段 2 的事,不在本交互设计的资产关键路径上)。

---

## 5. 给工程的落地切口(确保不碰铁律)

```
新增/改动文件(全部表现层):
  src/map/MapScene.tsx      → 拆成 OverworldScene + 三态状态机(useState: 'overworld'|'approach'|'interior')
  src/map/InteriorScene.tsx → 新增: 内部 2.5D 场景 + 物件/NPC 锚点
  src/map/CallOut.tsx       → 新增: 三形态呼叫式弹窗(object/npc/event)
  src/map/interiors.ts      → 新增: locId → {category, propIds[], npcId?, doorXY} 映射(纯表现数据)
  src/ui/play.tsx           → EventModal 改走 CallOut(event variant); WeeklySummary 进入前退回 overworld
  src/audio/bgm.ts          → 新增: 城市 BGM + 场景 BGM 切换(用户手势后解锁, localStorage 存静音偏好)
  src/styles.css            → 5 套 interior 皮肤 variant + 转场 keyframes + 呼吸灯
  public/assets/...         → P0/P1/P2 渐进资产

绝不触碰:
  src/game/**               → 0 改动
  src/data/*.ts 内容        → 不改(interiors.ts 是新表现层映射, 不是改 actions)
  store 的四个 action 签名   → act/resolve/advance/continueWeekly 原样调用
```

**验证关卡(沿用 CLAUDE.md)**:`npm run test`(引擎+全程无 softlock,因为 advance 键始终在场,死路被结构性消除)、`typecheck`、`build`、375px preview 走一遍"选建筑→进门→冒泡→做事→出门→耗尽→睡觉推进"。

---

## 6. 一句话总结给包工头

把现有"点节点立刻弹底部菜单"升级成 **OVERWORLD(选中+门牌条确认)→ APPROACH(280ms 可跳过的走门口过场)→ INTERIOR(室内 2.5D 图+物件/NPC 呼吸灯)** 三态;行动用 **物件冒泡 / NPC 召唤 / 底部主题卡** 三形态呼叫式弹窗承载,事件复用同一套 NPC 冒泡外壳但仍只调 `resolve(idx)`;行动点耗尽用 **建筑变灰+宿舍高亮💤 / 内部呼吸灯熄灭 / 永远在场的"进入下周"键** 三道防线结构性消除死路;15 内部场景按 **5 类底图模板 + 15 薄物件 + 6 复用 NPC + CSS 城市 tint + 复用现成天际线当窗景** 落地,实际只画 ~27 个新资产且全部可渐进、缺图自动回退。整套只动 `src/map`、`src/ui`、`styles.css`、新增 `src/audio`,`src/game/` 一行不改。

下一步如果要,我可以直接出 **`interiors.ts` 的 15 地点完整映射表(category/propIds/npcId/doorXY/skin)** 和 **三态状态机 + CallOut 组件的 TS 骨架**,作为阶段实现的第一刀。