# v2 Blueprint

## techChoice
拍板: PixiJS v8 裸核心 (WebGL-only) 做"地图模式"世界层渲染; HUD/弹窗/菜单继续留 React DOM。

理由 (已逐文件核实): 你的真实病根不是"DOM 不够快", 而是"平视正面建筑按百分比贴在已画死河流的透视底图上 + 没有深度排序"。核实: MapScene.tsx L181 建筑用 left/top 百分比, L204 主角永远在最上层不被遮挡; ground-town 的 prompt (gen-map-art.mjs L52) 把"一条河+两座桥"画死进底图。换引擎只是手段, 真正解决立体/遮挡的是 y-sort + 3/4 锚底建筑 + 程序化地面, 这三件在 PixiJS 里是一等公民。
不选 Phaser: 游戏框架非渲染库, 自带场景/物理/输入/tween/audio 与 src/game/ 纯函数+Zustand 职责重叠还要造桥, 为用不到的能力背 ~1.2MB 不划算。
不继续纯 DOM: 角色绕楼后遮挡在 DOM 里只能每帧改 z-index, 物件一多触发 layout/paint 抖动, 百分比坐标与像素透视底图本质对不齐(已亲历)。DOM 仍管 HUD/弹窗(擅长), 不管需 y-sort 的世界层。
不裸 Canvas: y-sort+图集+批渲染+移动端 GPU 全手写=重造半个 PixiJS。

移动端铁律(查证): Application.init({preference:'webgl'}) 锁死 WebGL 避开 v8 WebGPU"失败不回退致黑屏"bug; 无 GPU 自动降 Canvas2D。像素锐利: roundPixels:true + 纹理 scaleMode:'nearest' + canvas CSS image-rendering:pixelated + 整数倍缩放。包体: 只 import Application/Container/Sprite/AnimatedSprite/Texture/Assets/Ticker 走 tree-shake; PixiJS 仅进地图模式 dynamic import(), 首屏菜单/建角零额外开销。单一琥珀强调色与现 dusk amber STYLE 一致。
降级保险: import() 懒加载 PixiWorld; WebGL 初始化抛错或极旧设备回退现有 DOM MapScene(保留为 fallback 不删), 保证纯客户端可落地、单手可玩绝不开天窗。

## engineSafety
src/game/ 一行不动的硬保证(已逐文件核实边界):
1. 唯一合法入口=src/game/index.ts 公共导出。表现层只 import 类型(GameState/GameAction/GameEvent/Effects/StatKey...)和只读纯函数(availableActions/evaluateCondition/currentLeadingRoute/STAT_META_BY_KEY/CITIES...), 绝不 import engine.ts/conditions.ts/scoring.ts 内部。
2. 状态变更只经 store(src/store.ts)已有 4 action: act(id)/resolve(choiceIndex)/advance()/continueWeekly()(外加 start/resume/toMenu/hydrate)。各自内部调 takeAction/resolveEvent/advanceWeek/continueFromWeekly+commit 持久化。v2 全部交互(进门点行动→act; 事件冒泡选项→resolve; 宿舍睡觉/周末结算→advance/continueWeekly)复用, 签名不动, 不新增 store action。
3. location/内部场景/NPC/呼叫弹窗全是表现层概念, 引擎零感知。核实 src/data/index.ts:18-38 BASE_ACTION_LOCATIONS 把 17 base action 映射到 locId, generated actions 自带 location, 引擎从不读 location。v2 新增 location→室内布局表、prop/npc 锚点表都是新建表现层文件(src/map/interiors.ts 等), 不改 src/data/*.ts 内容, 不碰 actions.json/events.json。
4. 行动可用性永远问引擎: 室内可做/锁定=new Set(availableActions(state).map(a=>a.id))(复用 MapScene.tsx L103) ∩ actionsAtLocation(locId)。"门锁"=availableActions 过滤, 非表现层自创规则。
5. 事件换皮不换底: 把 play.tsx:104-127 EventModal 的 choices=ev.choices.filter(evaluateCondition(...)) 原样搬进"NPC 呼叫"外壳, 仍只调 resolve(idx)。触发时机(state.phase==='event')由引擎决定。
6. 资产 404-proof: 核实 assetUrl()(theme.ts:67)按 manifest 命中才返回 URL 否则 undefined→emoji/CSS 兜底。新 id(interior-*/npc-*/prop-*/bgm-*)缺图自动降级不崩。
7. CI 闸门不变: 每阶段交付前 npm run test(引擎+全流程 harness: 无 NaN/越界/softlock/确定性)+typecheck+build 全绿。引擎与数据没动 → 天然继续通过, 等于给"没碰内核"上自动锁。
8. 音频层=独立 src/audio/ store + <AudioManager> 挂 React 树, 订阅 state.config.city/内部场景 id, 与引擎完全解耦, 不进 src/game/。

## blueprint
总架构: React DOM 外壳(TopBar/StatHud/弹窗/菜单)包裹一个 PixiJS 世界画布(仅地图模式)。三态状态机 OVERWORLD→APPROACH→INTERIOR 全在表现层。

【世界层=治"建筑摆位违和"的核心】放弃"百分比贴透视底图", 改三层渲染(对齐 MDN/Stardew 模型, PixiJS Container):
- 地面层 Back: 底图只画地/水/绿/光, 不画道路网格(现 ground-town 把河画死是打架根因)。河流/道路改数据驱动 Paths 瓦片层, 沿建筑门口间生成 → 路永远接得上门口, 不再与悬空建筑冲突。
- 物体层 Buildings+Front: 每栋建筑/树/灯/主角一个 Sprite, anchor.set(0.5,1) 锚底边中心落格。坐标从"百分比 x,y"升级为"网格 col,row(+占位 w,h)", 屏幕坐标统一 screenX=col*TILE/screenY=row*TILE — 所有东西同一公式落位, 从根上消除两套坐标打架。
- 前景层 AlwaysFront: 高楼屋檐/前景树冠永远盖人(后期可选)。
立体来自 y-sort: world.sortableChildren=true, 每 Sprite(含主角)zIndex=脚底 y。主角脚底 y>某楼底边→盖楼; <则被楼遮挡 → 自动"绕到楼后被挡"2.5D 遮挡。高楼跨多格拆"脚部(参与 y-sort)+上半身(前景固定高 z)"。每栋底部带椭圆地面投影钉在格子上, 消除"飘在底图上"。不上真等距瓦片(15 稀疏节点不需要, 等距反让点触/判距变难), 用正交俯视网格。

【进入机制三态机】OVERWORLD(俯瞰): 点建筑=选中(建筑跳一下+名牌弹起), 底部浮"门牌条"显示"这里有 N 件事可做 [进入→]"; 防误触=点一下选中、再点/点进入才触发。APPROACH(过场 ~280ms 可跳过): 小人沿预存 doorXY 直线滑行+走路帧到门口, 门口灯亮+镜头微推(scale 1→1.06), 80ms 黑场遮丑切内部, 不做 A* 寻路。INTERIOR(室内 2.5D): 一张室内底图+1-3 前景可交互物件/NPC, 左上"←出门"回俯瞰。所有"做事"只在内部层。

【呼叫式弹窗】统一 <CallOut> 三 variant: (A)物件冒泡 — 行动锚定具体物件(书桌/跑步机/货架), 物件有呼吸灯, 点物件→气泡 scale-up 带尾巴→再点执行, 一行 effectChips 预告(复用 theme.ts effectChips)。(B)NPC 召唤 — 内部站 NPC 主动冒话, 有行动时头顶冒"!"; 事件(state.phase==='event')改"对应 NPC 头顶炸感叹号+镜头推+气泡展开", 底层仍 resolve(idx)。(C)主题贴合卡 — 气泡展开后从底部上滑进拇指热区做事卡, 按地点 5 大类共用皮肤(学习冷蓝/消费暖橙/健康薄荷/社交紫/行政褐金), 只换主题色+emoji+抓手纹理 → 5 套覆盖 15 地点不增维护。这是把现 LocationSheet(MapScene.tsx:35)升级而非重写。

【动态化】建筑 2 帧微动画(窗灯明灭)用 AnimatedSprite; 主角 4 向行走 sprite sheet 用 AnimatedSprite, animationSpeed 控速, 不在 Pixi 里叠 CSS steps()(两套坐标系点击命中对不齐)。

【每城专属地形】ground-town 升级为 ground-<city> 8 套(伦敦泰晤士宽河+摩天轮/牛津蜜色尖塔丛/剑桥撑篙小船/曼彻铁架高架桥/爱丁堡岩丘城堡/伯明翰运河十字+砖拱/谢菲顺坡台阶排屋/布里斯托峡谷吊桥), 共享 dusk amber spine 只换地形剪影+色温微差(冷→暖)。关键: 8 城地块留白位置一致 → locations.ts 网格坐标表完全复用, 只换底图皮肤; MapScene 读 state.config.city 选图。

【音频层】独立 src/audio/ store+<AudioManager> 挂 React 树, 订阅 state.config.city; BGM 绑"城市"层(切城 crossfade), 同城切场景/进门不换歌只点 UI 音效 → 减轨数。

## assetManifest
命名沿用现有约定(assetUrl 按 <id>.png 查 manifest), 缺图自动 emoji/CSS 兜底, 故可分阶段渐进出图。全部经现有 Gemini 直连管线(gen-map-art.mjs, 3/4 视角+磁红绿幕抠透明)+register:assets, 不新建出图通路。
A. 每城地形(P3): ground-<city> 校园+城区各 8 = 16 张。底图不画道路网格, 8 城地块留白位置一致。(现 ground-campus/ground-town 退役或留 fallback。)
B. 建筑重出为 3/4 锚底(P2): 现 15 个 building-* 是平视正面=不立体根源, 必须重出。prompt 增量: "3/4 top-down 45° view, visible roof and facade, soft drop shadow baked onto a small oval base, transparent background"。15 张(复用现 id, 命名不变)。可选窗灯第 2 帧 building-*-lit 15 张(P6)。
C. 室内场景(P4): interior-<locId> 15 张(library/dorm/lecture/society/career/gym/market/town/work/mall/station/nightlife/clinic/bank/park), 室内 2.5D 底图留前景物件位。
D. 室内前景物件 prop(P4): 每地点 1-3 个 prop-<locId>-<n>, 估 ~30-40 张(书桌/书架/打印机/床/灶台/跑步机/货架/收银台/吧台...); 缺图先 emoji 占位渐进补。
E. NPC sprite(P4 社交类): npc-<role> 约 6-8 个(店员/老师/同学/医生/顾问/柜员/朋友/工头), 待机+冒话; 可选 2 帧待机。
F. 主角 4 向行走帧(P6): char-walk sprite sheet 4 向×每向 3-4 帧。一致性是难点, 裸 Gemini 拼帧会帧间漂移(脸/配色/比例/像素网格)→ 推荐 PixelLab API(create-character-with-4-directions+walk skeleton, 参考图锁一致性)导出 sprite sheet 丢进 generated/。次选 char-student 当基准帧+reference-driven 扩帧。性别两版则 ×2。
G. 复用不动: 5 scene-* / 16 ending_* / 8 skyline-* / deco-* 全保留。
总量级: 地形 16 + 建筑重出 15(+窗灯 15 可选) + 室内 15 + 物件 ~35 + NPC ~8 + 走路帧 ~14-28 ≈ 100-130 张, 跨 P2-P6 分批, 任一批缺位都不阻塞上线(兜底保证)。

## audioPlan
系统: 独立 src/audio/ — audioStore(Zustand)+<AudioManager> 挂 React 树, 订阅 state.config.city 与内部场景 id, 与引擎解耦。播放层用 Howler.js(MIT 可商用, 内部 Web Audio 优先+<audio> 兜底, 自带 fade()/loop/自动解锁/多格式 fallback, 省 iOS resume 样板)或手写 Web Audio(musicGain+sfxGain 双总线)。
移动端硬约束: iOS Safari 带声 autoplay 全局封锁。必须有"点击解锁"入口 — 复用现"开始游戏/进入"按钮, 在其 click handler 同步 new AudioContext()+resume()+播几毫秒静音 buffer 踢活链路; 全局 audioUnlocked 缓存; 解锁前 UI 给喇叭图标。
格式: 决定性事实 — OGG 要 iOS 18.4 才原生支持, 对移动端优先产品 OGG 不能作唯一格式。主格式 M4A(AAC)或 MP3, 文件名 bgm-<city>.m4a。
切换策略(分层): 切城(8 城间)=完整 crossfade 1.0-1.5s, equal-power 等功率曲线(避免线性中点音量塌陷), exponentialRampToValueAtTime(目标不为 0, 收尾 ramp 到 0.0001 再 setValueAtTime(0)); 同城切场景/进门=不换曲, 仅轻微 -3dB 或不变 0.3s; 进结局=当前淡出+结局短曲淡入 0.8s; 弹行动菜单=不碰 BGM 只播 UI"嘀"(jsfxr 程序化)。关键: 不是每次点地点都换歌, BGM 绑"城市"层 → 大幅减轨数+减加载。静音: muted 存 Zustand+localStorage(与现存档一致), 实现为 masterGain ramp 到 0 不销毁音频图; 分音乐/音效两开关。
轨数与来源: BGM 8 城各 1 = 8 轨(情绪已定: 伦敦都市爵士孤独/牛津管风琴庄严/剑桥竖琴柔/曼彻独立摇滚/爱丁堡风笛苍凉/伯明翰放克/谢菲木吉他治愈/布里斯托 trip-hop)+结局短曲 1-3 轨+UI 音效若干(jsfxr 不占下载)。≈ 10-12 条音乐。
来源(查证后排序): 主力=CC0(OpenGameArt CC0 Music / itch.io CC0 无缝循环包)真公有领域无义务。补充=Pixabay Music(可商用免署名, 但 contributor 上传制有质控风险 → 下载页截图存证、选高下载量+有作者署名; "standalone 再分发"被禁但嵌入游戏不受影响, 不做"游戏内提供原声带下载")。Kevin MacLeod 能用但 CC-BY 需署名优先级最低。明确排除: MusicGen/AudioCraft 权重 CC-BY-NC 禁商用+训练数据版权灰色不碰; 将来要 AI 生成走 Suno/Udio 付费商用档, 当前不划算。

## risks
1. 建筑必须重出(最大确定性成本): 现 15 个 building-* 平视正面, 换什么引擎都救不了"不立体"。控制: 复用现 Gemini 管线+STYLE+磁红抠透明, prompt 只加"3/4 45°+roof+facade+oval base shadow+transparent", 重出一轮, 命名不变零数据迁移; P2 先重出+上 y-sort 即见立体, 不等其他资产。
2. 主角走路帧一致性: 裸 Gemini 拼帧几乎必帧间漂移(脸/配色/比例/像素网格)。控制: 走 PixelLab API reference-driven 锁一致性导出 sprite sheet; 一致性在出图不在播放。排 P6 不阻塞前面立体红利。
3. PixiJS 移动端 WebGPU 黑屏 bug + 包体: 控制 preference:'webgl' 锁死, 无 GPU 降 Canvas2D; dynamic import() 仅地图模式加载, 首屏零负担; 保留旧 DOM MapScene 作 init 失败 fallback, 绝不开天窗。
4. 过度工程化(用户明确禁): 控制 不引 Tiled/不真等距/不做室内可走地块/不做 A* 寻路/不做 per-pixel z-buffer — 对 15 节点稀疏图是杀鸡牛刀。15 室内底图当背景, 物件用数据表锚点, 5 套卡片皮肤覆盖 15 地点。
5. 网格坐标迁移引回归: locations.ts 从百分比改网格时 8 城留白位置必须一致否则坐标表不能复用。控制 先定网格留白模板再出 8 城底图; 每阶段 npm run test+typecheck+build 全绿(引擎/数据没动天然通过 = 没碰内核的自动证明)。
6. 音频版权(商业化隐患): 控制 主力 CC0(最干净), Pixabay 仅补充且截图存证、不做原声带下载功能; 明确排除 MusicGen NC 权重。
7. 375px 单手误触: 控制 OVERWORLD 两步确认(选中→进入); 做事卡上滑进拇指热区; APPROACH 可点击跳过老玩家不被罚。
8. 每阶段可独立上线: P1(UI/弹窗骨架 DOM, 不碰引擎)即见精致度; P2(网格+y-sort+建筑重出)治立体打架; 之后逐城地形/室内/音频/动画各自增量, 任一阶段烂尾都有可用版本。第一阶段 P1 最高性价比(零新资产零新引擎当天见效)。