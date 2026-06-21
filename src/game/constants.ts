import type { Effects, StatKey, StatMeta, Stats } from './types';

// =============================================================================
// Time & turn economy
// =============================================================================
export const WEEKS_PER_TERM = 12;
export const TERMS_PER_YEAR = 3;
export const MAX_YEARS = 1; // one-year UK master's arc (engine supports more)
export const BASE_ACTION_POINTS = 3;

/** Base weekly cost of living in pounds, before the city multiplier. */
export const BASE_WEEKLY_COST = 70;

/** Passive weekly drift applied at every weekly rollover, before clamping. */
export const WEEKLY_DRIFT: Effects = {
  energy: +14, // a week's rest recovers some energy
  stress: -6, // stress eases a little if nothing piles on
  homesick: +2, // distance quietly accrues
};

// =============================================================================
// Stat metadata (order = display order)
// =============================================================================
export const STAT_METAS: StatMeta[] = [
  { key: 'money', label: '存款', short: '钱', icon: 'stat-money', emoji: '💷', min: 0, max: 9999, higherIsBetter: true, desc: '银行卡余额（英镑）。归零就要靠泡面和勇气活着。', dangerLow: 120 },
  { key: 'energy', label: '精力', short: '力', icon: 'stat-energy', emoji: '⚡', min: 0, max: 100, higherIsBetter: true, desc: '能不能爬起来做事。精力见底时行动会大打折扣。', dangerLow: 20 },
  { key: 'stress', label: '压力', short: '压', icon: 'stat-stress', emoji: '🔥', min: 0, max: 100, higherIsBetter: false, desc: 'deadline、孤独和雨天堆出来的东西。太高会出事。', dangerHigh: 75 },
  { key: 'gpa', label: '学业', short: '学', icon: 'stat-gpa', emoji: '📚', min: 0, max: 100, higherIsBetter: true, desc: '综合学业表现。太低有挂科和延期风险。', dangerLow: 40 },
  { key: 'english', label: '英语', short: '英', icon: 'stat-english', emoji: '🗣️', min: 0, max: 100, higherIsBetter: true, desc: '听说读写的综合底气。影响课堂、社交和面试。' },
  { key: 'social', label: '社交', short: '社', icon: 'stat-social', emoji: '🫂', min: 0, max: 100, higherIsBetter: true, desc: '朋友、人脉和归属感。太低容易陷进孤独。' },
  { key: 'career', label: '履历', short: '历', icon: 'stat-career', emoji: '💼', min: 0, max: 100, higherIsBetter: true, desc: '实习、项目、CV 的硬通货。求职路线的命根子。' },
  { key: 'adaptation', label: '适应', short: '适', icon: 'stat-adaptation', emoji: '🧭', min: 0, max: 100, higherIsBetter: true, desc: '对英国生活的熟练度。越高，越多事件能从容化解。' },
  { key: 'health', label: '健康', short: '康', icon: 'stat-health', emoji: '❤️', min: 0, max: 100, higherIsBetter: true, desc: '身体本钱。熬夜和泡面会慢慢扣，太低会病倒。', dangerLow: 30 },
  { key: 'visa', label: '签证', short: '签', icon: 'stat-visa', emoji: '📄', min: 0, max: 100, higherIsBetter: true, desc: '材料与合规的安心度（游戏化设定，非真实建议）。太低会被材料追着跑。', dangerLow: 40 },
  { key: 'homesick', label: '想家', short: '家', icon: 'stat-homesick', emoji: '🏠', min: 0, max: 100, higherIsBetter: false, desc: '深夜想念家里那口热饭的程度。太高会动摇所有计划。', dangerHigh: 80 },
  { key: 'reputation', label: '口碑', short: '碑', icon: 'stat-reputation', emoji: '⭐', min: 0, max: 100, higherIsBetter: true, desc: '别人眼里你是个什么样的人。影响推荐信和机会。' },
];

export const STAT_META_BY_KEY: Record<StatKey, StatMeta> = Object.fromEntries(
  STAT_METAS.map((m) => [m.key, m]),
) as Record<StatKey, StatMeta>;

export const ALL_STAT_KEYS: StatKey[] = STAT_METAS.map((m) => m.key);

// =============================================================================
// Growth routes
// =============================================================================
export interface RouteDef {
  id: string;
  name: string;
  desc: string;
  emoji: string;
}

export const ROUTES: RouteDef[] = [
  { id: 'scholar', name: '学霸路线', desc: '泡在图书馆，GPA 拉满，压力也拉满。', emoji: '🎓' },
  { id: 'grind', name: '打工生存', desc: '哪里给钱去哪里，钱包鼓了，作业凉了。', emoji: '🍳' },
  { id: 'social', name: '社牛路线', desc: '哪个 society 都有你，适应快但时间永远不够。', emoji: '🎉' },
  { id: 'career', name: '求职卷王', desc: '改 CV、刷面试、攒实习，履历亮眼，拒信成箱。', emoji: '💼' },
  { id: 'chill', name: '佛系体验', desc: '不卷不焦虑，把留学过成 city walk。', emoji: '🌧️' },
  { id: 'phd', name: '申博路线', desc: '套磁、研究、推荐信，向学术深处走。', emoji: '🔬' },
  { id: 'homebound', name: '回国发展', desc: '一边读书一边把回国的路铺好。', emoji: '✈️' },
  { id: 'survivor', name: '稳稳毕业', desc: '不求惊艳，只求不挂科、不爆雷、平安落地。', emoji: '🛟' },
];

export const ROUTE_BY_ID: Record<string, RouteDef> = Object.fromEntries(
  ROUTES.map((r) => [r.id, r]),
) as Record<string, RouteDef>;

// =============================================================================
// Character-creation options
// =============================================================================
export interface CreationOption {
  id: string;
  name: string;
  desc: string;
  /** stat adjustments applied at creation */
  mods?: Effects;
  /** multiplies weekly living cost (city only) */
  costMult?: number;
  /** weekly pocket money from family (budget only) */
  weeklyStipend?: number;
  /** starting money override contribution */
  startMoney?: number;
  /** relative draw weight for the random roll (default 1); lower = rarer */
  weight?: number;
  /** prestige/rarity tier (university only): legend > epic > rare > common */
  tier?: 'legend' | 'epic' | 'rare' | 'common';
  /** baseline difficulty contribution 1..5 (university only) */
  difficulty?: number;
}

export const CITIES: CreationOption[] = [
  { id: 'london', name: '伦敦', desc: '机会最多，房租也最杀人。', costMult: 1.6, weight: 3, mods: { career: 6, social: 4, adaptation: -2 } },
  { id: 'manchester', name: '曼彻斯特', desc: '热闹、性价比高、雨也不少。', costMult: 1.0, weight: 5, mods: { social: 4, adaptation: 3 } },
  { id: 'edinburgh', name: '爱丁堡', desc: '风景如画，风也如刀。', costMult: 1.05, weight: 4, mods: { adaptation: 4, stress: -3, homesick: 3 } },
  { id: 'birmingham', name: '伯明翰', desc: '居中务实，生活方便。', costMult: 0.95, weight: 5, mods: { adaptation: 3, money: 80 } },
  { id: 'sheffield', name: '谢菲尔德', desc: '安静的学生城，物价友好。', costMult: 0.85, weight: 5, mods: { stress: -4, money: 120, career: -2 } },
  { id: 'bristol', name: '布里斯托', desc: '文艺、宜居、坡很多。', costMult: 1.05, weight: 4, mods: { social: 3, health: 2 } },
  // The two dream cities: rare to roll, and they force the 牛剑 school below.
  { id: 'oxford', name: '牛津', desc: '千年学府，光环与窒息感并存。', costMult: 1.5, weight: 1, mods: { reputation: 6, stress: 4 } },
  { id: 'cambridge', name: '剑桥', desc: '康河的柔波，和赶不完的 due。', costMult: 1.5, weight: 1, mods: { reputation: 6, stress: 4 } },
];

export const UNIVERSITY_TYPES: CreationOption[] = [
  // 牛剑: only rollable in 牛津/剑桥, the highest prestige and the hardest run.
  { id: 'oxbridge', name: '牛剑', desc: '天花板级的光环，地狱级的卷度。导师的期待能把人压垮。', tier: 'legend', difficulty: 5, mods: { reputation: 14, career: 7, gpa: -8, stress: 14, money: -140 } },
  { id: 'g5', name: 'G5 梦校', desc: '伦敦的顶尖学府，光环拉满，卷度也拉满。', tier: 'epic', difficulty: 4, mods: { reputation: 8, career: 5, gpa: -4, stress: 6 } },
  { id: 'redbrick', name: '红砖大学', desc: '老牌稳健，口碑扎实。', tier: 'rare', difficulty: 3, mods: { reputation: 5, gpa: 2 } },
  { id: 'business', name: '商学院', desc: '人脉与西装的主场。', tier: 'rare', difficulty: 3, mods: { career: 6, social: 3, money: -80 } },
  { id: 'arts', name: '艺术院校', desc: '创意为王，履历看作品。', tier: 'common', difficulty: 2, mods: { social: 4, career: 2, gpa: -2 } },
  { id: 'modern', name: '现代大学', desc: '务实灵活，压力相对小。', tier: 'common', difficulty: 2, mods: { stress: -4, adaptation: 3, reputation: -2 } },
];

// Which schools each city can produce. 牛津/剑桥 force 牛剑; G5 only exists in 伦敦.
export const CITY_SCHOOLS: Record<string, string[]> = {
  london: ['g5', 'redbrick', 'business', 'modern', 'arts'],
  oxford: ['oxbridge'],
  cambridge: ['oxbridge'],
  manchester: ['redbrick', 'business', 'modern', 'arts'],
  edinburgh: ['redbrick', 'modern', 'arts'],
  birmingham: ['redbrick', 'business', 'modern'],
  sheffield: ['redbrick', 'modern'],
  bristol: ['redbrick', 'modern', 'arts'],
};

export const TIER_LABEL: Record<string, string> = { legend: '传说', epic: '史诗', rare: '稀有', common: '普通' };

export const MAJORS: CreationOption[] = [
  { id: 'business', name: '商科', desc: '小组作业与 networking 的故乡。', mods: { social: 4, career: 4 } },
  { id: 'cs', name: '计算机', desc: 'debug 到天亮，但就业有底气。', mods: { career: 6, gpa: 2, social: -3 } },
  { id: 'engineering', name: '工程', desc: '课程硬核，作业管够。', mods: { gpa: 3, stress: 4, career: 3 } },
  { id: 'education', name: '教育', desc: '温柔但论文不少。', mods: { social: 3, english: 3, stress: -2 } },
  { id: 'arts', name: '艺术', desc: '灵感与 deadline 的拉扯。', mods: { reputation: 3, social: 3, career: -2 } },
  { id: 'socsci', name: '社科', desc: '读不完的文献，写不完的 essay。', mods: { english: 4, gpa: 2, stress: 3 } },
];

export const BUDGETS: CreationOption[] = [
  { id: 'tight', name: '紧张', desc: '家里掏空了积蓄，每一镑都得算。', startMoney: 900, weeklyStipend: 30, mods: { stress: 6, homesick: 4 } },
  { id: 'normal', name: '普通', desc: '不富裕但够用，别乱花就行。', startMoney: 1800, weeklyStipend: 70 },
  { id: 'comfortable', name: '宽裕', desc: '钱不是最大的问题，别的才是。', startMoney: 3200, weeklyStipend: 140, mods: { stress: -4 } },
];

export const ENGLISH_LEVELS: CreationOption[] = [
  { id: 'just_passed', name: '雅思刚过线', desc: 'lecture 像在听天书，但你会假装点头。', mods: { english: 35, adaptation: -4, stress: 4 } },
  { id: 'seventy', name: '能听懂七成', desc: '日常没问题，学术词汇还得查。', mods: { english: 60 } },
  { id: 'fluent', name: '社牛口语王', desc: '开口就是 small talk，听力偶尔翻车。', mods: { english: 82, social: 5, adaptation: 4 } },
];

// =============================================================================
// Base starting stats (before any creation mods)
// =============================================================================
export function baseStats(): Stats {
  return {
    money: 0, // set from budget
    energy: 80,
    stress: 25,
    gpa: 58,
    english: 0, // set from english level
    social: 35,
    career: 30,
    adaptation: 40,
    health: 78,
    visa: 85,
    homesick: 35,
    reputation: 45,
  };
}

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'liuxue-monogatari/save/v1';
export const RECENT_EVENT_WINDOW = 12;
