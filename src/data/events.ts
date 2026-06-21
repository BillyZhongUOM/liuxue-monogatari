import type { GameEvent } from '../game/types';

// Events. `pool: ''` (or omitted) = the general weekly pool. Named pools are
// pulled by an action's `risk`. Keep choices meaningful: every option has a
// trade-off, no free wins.
export const EVENTS: GameEvent[] = [
  // --------------------------------------------------------------- general / life
  {
    id: 'ev_culture_shock_lecture',
    title: '第一节 lecture',
    description: '教授语速飞快，口音还带着你没练过的版本。你全程似懂非懂，旁边本地同学却笑得很开心。',
    category: 'study',
    weight: 8,
    pool: '',
    oncePerGame: true,
    cond: { maxYear: 1, statLte: { english: 70 } },
    choices: [
      { text: '下课追着老师问', resultText: '老师很耐心，你录了音，回去反复听。听力肉眼可见地进步。', effects: { english: 5, gpa: 3, energy: -4, reputation: 2 } },
      { text: '回去看录播补', resultText: '一句一句倒带，效率不高但总算跟上了。', effects: { english: 3, gpa: 2, energy: -6, stress: 3 } },
      { text: '假装听懂，点头', resultText: '点头如捣蒜，回去发现啥也没记住。', effects: { stress: 5, gpa: -2 } },
    ],
  },
  {
    id: 'ev_fire_alarm_night',
    title: '宿舍火警',
    description: '凌晨三点，火警尖叫着把整栋楼赶到楼下。寒风里大家裹着被子，最后发现是有人微波炉热年糕。',
    category: 'life',
    weight: 7,
    pool: '',
    choices: [
      { text: '认命站在风里', resultText: '冻了二十分钟，第二天有点感冒。', effects: { health: -6, energy: -6, stress: 4 } },
      { text: '和邻居吐槽起来', resultText: '一通吐槽下来，居然加了个微信，多了个饭搭子。', effects: { social: 6, homesick: -3, energy: -4 } },
    ],
  },
  {
    id: 'ev_rain_umbrella',
    title: '英国的雨',
    description: '出门还是晴的，走到一半天就塌了。一阵风把你十镑买的伞吹成了抽象艺术。',
    category: 'life',
    weight: 6,
    pool: '',
    choices: [
      { text: '冒雨狂奔回家', resultText: '到家像落汤鸡，但省下了买伞钱。', effects: { health: -4, money: 0, stress: 3 } },
      { text: '钻进咖啡店躲雨', resultText: '一杯拿铁的时间，雨停了，心情也好了。', effects: { money: -4, stress: -5, adaptation: 2 } },
    ],
  },
  {
    id: 'ev_landlord_email',
    title: '房东的邮件',
    description: '房东发来一封措辞客气但暗藏杀机的邮件，说暖气维修要从押金里扣一笔。',
    category: 'life',
    weight: 6,
    pool: '',
    cond: { minWeek: 3 },
    choices: [
      { text: '据理力争，引用合同', resultText: '你翻出 tenancy agreement 逐条回复，房东退让了。英语和适应力都+1。', effects: { english: 3, adaptation: 4, stress: 4, reputation: 2 } },
      { text: '算了，破财消灾', resultText: '钱没了，但也省了心。', effects: { money: -60, stress: -2 } },
    ],
  },
  {
    id: 'ev_train_strike',
    title: '火车又罢工',
    description: '你计划好的周末出行，被一条 strike 通知击碎。站台上写着大大的 cancelled。',
    category: 'life',
    weight: 6,
    pool: '',
    choices: [
      { text: '改成宅家躺平', resultText: '哪也去不了，干脆睡到自然醒。', effects: { energy: 12, stress: -6, adaptation: 1 } },
      { text: '坐巴士绕远路', resultText: '多花三小时，但风景意外地好。', effects: { money: -18, energy: -8, adaptation: 4, social: 2 } },
    ],
  },
  {
    id: 'ev_nhs_queue',
    title: 'GP 预约',
    description: '嗓子疼了一周，好不容易约上 GP。医生看了看，建议你多喝水、好好休息。',
    category: 'life',
    weight: 5,
    pool: '',
    cond: { statLte: { health: 60 } },
    choices: [
      { text: '听话多喝水', resultText: '多喝水真的有用（也可能是自愈），慢慢好了。', effects: { health: 8, stress: -3, energy: -2 } },
      { text: '自己买药硬扛', resultText: 'Boots 一通买，扛过去了，钱包受了点伤。', effects: { money: -15, health: 5 } },
    ],
  },
  {
    id: 'ev_black_friday',
    title: '黑五的诱惑',
    description: '邮箱被打折邮件淹没，购物车里躺着你其实并不需要的三件东西。',
    category: 'life',
    weight: 5,
    pool: '',
    choices: [
      { text: '理性，清空购物车', resultText: '你战胜了消费主义，钱包鼓鼓，心里空空。', effects: { money: 0, stress: 3, reputation: 1 } },
      { text: '冲了，快乐最重要', resultText: '收到包裹的瞬间是真快乐，账单到来时是真心痛。', effects: { money: -90, stress: -6, homesick: -3 } },
    ],
  },
  {
    id: 'ev_flatmate_culture',
    title: '室友的派对',
    description: '本地室友周五晚上开 party，音乐震天响，礼貌性地敲了敲你的门。',
    category: 'social',
    weight: 6,
    pool: '',
    choices: [
      { text: '加入他们', resultText: '硬着头皮 small talk，居然聊嗨了，融入感+1。', effects: { social: 7, english: 3, adaptation: 4, energy: -8, stress: 2 } },
      { text: '戴上耳机赶due', resultText: '隔着墙的 bass 里，你默默写完了作业。', effects: { gpa: 4, stress: 4, social: -2, energy: -6 } },
    ],
  },
  {
    id: 'ev_spring_festival',
    title: '一个人的春节',
    description: '家里的群里全是年夜饭照片，这边却是普通的工作日。窗外没有烟花，只有路灯。',
    category: 'emotion',
    weight: 7,
    pool: '',
    oncePerGame: true,
    cond: { minWeek: 8 },
    choices: [
      { text: '约朋友一起包饺子', resultText: '几个人挤在小厨房，面粉沾了一脸，那顿饺子格外香。', effects: { social: 6, homesick: -14, health: 3, energy: -4 } },
      { text: '默默给爸妈发红包', resultText: '视频里爸妈笑得很开心，挂了之后你愣了很久。', effects: { homesick: -6, stress: -4, money: -40 } },
      { text: '一个人加班赶due', resultText: '把思念压进 deadline 里，作业是写完了，心里空落落的。', effects: { gpa: 5, homesick: 8, stress: 6 } },
    ],
  },
  {
    id: 'ev_self_doubt',
    title: '深夜的自我怀疑',
    description: '朋友圈里有人发了大厂 offer，有人晒了满绩。你盯着天花板，开始怀疑自己来这一趟到底图什么。',
    category: 'emotion',
    weight: 6,
    pool: '',
    cond: { statGte: { stress: 55 } },
    choices: [
      { text: '写下三件今天做到的小事', resultText: '哪怕只是按时起床、做了顿饭，写下来就没那么糟了。', effects: { stress: -8, reputation: 1 } },
      { text: '关灯，逼自己睡', resultText: '睡是睡了，情绪像潮水，退了又涨。', effects: { energy: 8, stress: -3, homesick: 4 } },
    ],
  },
  {
    id: 'ev_sunny_day',
    title: '难得的大晴天',
    description: '英国的太阳一年没几次，今天居然出来了。草坪上躺满了人，空气里都是松弛感。',
    category: 'emotion',
    weight: 5,
    pool: '',
    choices: [
      { text: '放下书，去晒太阳', resultText: '什么都不干，就是晒太阳，幸福感爆棚。', effects: { stress: -10, health: 4, energy: 6, gpa: -1 } },
      { text: '搬到草坪上看书', resultText: '一边晒太阳一边看文献，效率和心情双丰收。', effects: { gpa: 3, stress: -5, english: 1 } },
    ],
  },
  {
    id: 'ev_bank_account',
    title: '开个英国银行卡',
    description: '为了收 part-time 工资，你得开个本地账户。预约、materials、地址证明，一套流程下来人都麻了。',
    category: 'life',
    weight: 5,
    pool: '',
    oncePerGame: true,
    choices: [
      { text: '一次跑通', resultText: '材料带齐，柜员居然夸你准备充分。适应力+。', effects: { adaptation: 6, english: 2, energy: -6, reputation: 2 } },
      { text: '来回跑三趟', resultText: '少带一张纸跑一趟，留学的下马威。', effects: { adaptation: 3, stress: 6, energy: -10 } },
    ],
  },

  // --------------------------------------------------------------- essay_incidents
  {
    id: 'ev_turnitin_scare',
    title: 'Turnitin 查重',
    description: '提交前一刻，相似度显示 28%。你盯着那个数字，心跳和进度条一起飙。',
    category: 'study',
    weight: 5,
    pool: 'essay_incidents',
    choices: [
      { text: '熬夜逐句改写', resultText: '改到天亮，相似度压到了安全线，人也快没电了。', effects: { gpa: 5, english: 3, energy: -16, stress: 6, health: -4 } },
      { text: '发邮件问 tutor', resultText: 'tutor 解释了引用规范，你恍然大悟，下次就稳了。', effects: { gpa: 2, english: 2, adaptation: 3, stress: -2 } },
    ],
  },
  {
    id: 'ev_deadline_extension',
    title: 'Extension 的诱惑',
    description: '你状态很差，系统里却躺着一个 extenuating circumstances 申请入口。',
    category: 'study',
    weight: 4,
    pool: 'essay_incidents',
    choices: [
      { text: '如实申请延期', resultText: '多给的几天救了你，质量也保住了，没什么好羞愧的。', effects: { gpa: 4, stress: -6, energy: -4 } },
      { text: '硬扛着按时交', resultText: '准时是准时了，质量打了折，自己心里有数。', effects: { gpa: -3, stress: 8, energy: -12 } },
    ],
  },

  // --------------------------------------------------------------- group_incidents
  {
    id: 'ev_group_missing_teammate',
    title: '小组作业：队友已读不回',
    description: 'Presentation 下周就交，你发现组里最会做 PPT 的同学已经 48 小时没在群里冒泡。',
    category: 'study',
    weight: 6,
    pool: 'group_incidents',
    choices: [
      { text: '主动扛下 PPT', resultText: '你成了小组临时顶梁柱，也成了压力的主要承重墙。', effects: { gpa: 6, reputation: 3, stress: 8, energy: -10 } },
      { text: '开会重新分工', resultText: '大家在沉默中达成了更沉默的共识，好歹有人接活了。', effects: { gpa: 3, social: 4, stress: 3, energy: -6 } },
      { text: '装作没看见', resultText: '问题没有消失，只是变成了下周更大的问题。', effects: { gpa: -4, stress: 5, energy: 2 } },
    ],
  },
  {
    id: 'ev_free_rider',
    title: '组里的摸鱼王',
    description: '有个组员全程没出力，到了 peer assessment 还想分一样的分。',
    category: 'study',
    weight: 4,
    pool: 'group_incidents',
    choices: [
      { text: '如实打分并说明', resultText: '你在评分表里写清了贡献，tutor 看在眼里。公道，但有点得罪人。', effects: { reputation: 3, gpa: 2, social: -3, stress: 3 } },
      { text: '算了，和气为重', resultText: '你忍了，大家面子上过得去，心里记了一笔。', effects: { social: 2, stress: 4, reputation: -1 } },
    ],
  },

  // --------------------------------------------------------------- part_time_incidents
  {
    id: 'ev_rude_customer',
    title: '难缠的客人',
    description: '打工时遇到一个挑剔到离谱的客人，对着你一通输出。经理在旁边看着。',
    category: 'life',
    weight: 5,
    pool: 'part_time_incidents',
    choices: [
      { text: 'professional 微笑化解', resultText: '你忍住情绪，专业应对，经理事后给你加了排班。', effects: { money: 40, career: 3, english: 2, stress: 6 } },
      { text: '据理回怼', resultText: '是爽了一下，但场面有点尴尬，经理找你谈了话。', effects: { stress: -2, reputation: -3, career: -1 } },
    ],
  },
  {
    id: 'ev_extra_shift',
    title: '加班的机会',
    description: '同事临时请假，经理问你能不能顶一个通宵班，工资 1.5 倍。',
    category: 'life',
    weight: 4,
    pool: 'part_time_incidents',
    choices: [
      { text: '接了，钱重要', resultText: '钱包鼓了，但第二天的课基本是梦游。', effects: { money: 150, gpa: -3, energy: -20, health: -5 } },
      { text: '婉拒，身体要紧', resultText: '你礼貌拒绝，经理表示理解。少赚一点，睡得安稳。', effects: { health: 3, stress: -3 } },
    ],
  },

  // --------------------------------------------------------------- jobhunt_incidents
  {
    id: 'ev_rejection_triple',
    title: '拒信三连',
    description: '一个上午，邮箱里躺着三封 "We regret to inform you"。措辞一封比一封客气。',
    category: 'career',
    weight: 6,
    pool: 'jobhunt_incidents',
    choices: [
      { text: '复盘，改进申请', resultText: '你把拒信当反馈，重写了 cover letter，下一批更稳。', effects: { career: 5, english: 2, stress: 4, reputation: 1 } },
      { text: '关掉邮箱去睡觉', resultText: '今天到此为止，明天再战。情绪先稳住要紧。', effects: { stress: -6, energy: 6, career: -1 } },
    ],
  },
  {
    id: 'ev_hirevue',
    title: 'HireVue 录视频',
    description: '对着摄像头自言自语，限时两分钟回答行为面试题，背后是凌乱的宿舍墙。',
    category: 'career',
    weight: 5,
    pool: 'jobhunt_incidents',
    choices: [
      { text: '反复重录到满意', resultText: '录了七遍，终于像个正常人类，履历也磨亮了。', effects: { career: 6, english: 3, energy: -10, stress: 5 } },
      { text: '一遍过，交了完事', resultText: '说得磕巴，但至少交了。', effects: { career: 2, stress: -2 } },
    ],
  },
  {
    id: 'ev_coffee_chat',
    title: '学长的 coffee chat',
    description: '一个已经上岸的学长答应和你喝杯咖啡，聊聊行业内幕。',
    category: 'career',
    weight: 4,
    pool: 'jobhunt_incidents',
    choices: [
      { text: '认真准备问题', resultText: '你列好了问题，聊得很深，还要到了内推机会。', effects: { career: 7, social: 4, reputation: 3, money: -5, energy: -4 } },
      { text: '随便聊聊', resultText: '气氛轻松，干货不多，但人脉是攒下了。', effects: { social: 3, career: 2 } },
    ],
  },

  // --------------------------------------------------------------- social_incidents
  {
    id: 'ev_networking_awkward',
    title: 'Networking 的尴尬',
    description: '酒会上人人端着酒杯谈笑风生，你端着橙汁，在角落里练习如何自然地插入对话。',
    category: 'social',
    weight: 5,
    pool: 'social_incidents',
    choices: [
      { text: '深呼吸，主动搭话', resultText: '第一句最难，开了口就停不下来，认识了两个同行。', effects: { social: 7, english: 3, career: 2, stress: 5, energy: -6 } },
      { text: '默默观察就好', resultText: '你把现场当纪录片看完了，社交值没涨，倒是不累。', effects: { adaptation: 2, stress: -2, energy: -2 } },
    ],
  },
  {
    id: 'ev_new_friend',
    title: '一个新朋友',
    description: '社团活动里，有人和你一拍即合，从家乡聊到追的剧，相见恨晚。',
    category: 'social',
    weight: 5,
    pool: 'social_incidents',
    choices: [
      { text: '约下次一起吃饭', resultText: '留学路上多一个并肩的人，孤独感轻了一大截。', effects: { social: 8, homesick: -8, stress: -5, reputation: 2 } },
      { text: '客气地加个好友', resultText: '先加上，缘分慢慢来。', effects: { social: 4, homesick: -2 } },
    ],
  },
];

export const EVENT_BY_ID: Record<string, GameEvent> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
) as Record<string, GameEvent>;
