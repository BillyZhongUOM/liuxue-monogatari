import type { Trait } from '../game/types';

// Character creation traits. `actionTagMods` multiply the magnitude of effects
// for actions carrying that tag; `apMod` adjusts weekly action points.
export const TRAITS: Trait[] = [
  {
    id: 'juanwang',
    name: '卷王',
    desc: '天生坐得住，学习和求职效率高，但弦也绷得紧。',
    kind: 'neutral',
    startMods: { gpa: 3, stress: 5 },
    actionTagMods: { study: 1.2, career: 1.15 },
  },
  {
    id: 'foxi',
    name: '佛系',
    desc: '心态稳，休息回血特别快，但很难逼自己冲。',
    kind: 'positive',
    startMods: { stress: -8 },
    actionTagMods: { rest: 1.25, study: 0.92 },
  },
  {
    id: 'shekong',
    name: '社恐',
    desc: '人多就累，社交事倍功半，独处反而踏实。',
    kind: 'negative',
    startMods: { social: -6, stress: 3 },
    actionTagMods: { social: 0.8, rest: 1.1 },
  },
  {
    id: 'sheniu',
    name: '社牛',
    desc: '走到哪都能聊起来，社交和适应快人一步。',
    kind: 'positive',
    startMods: { social: 8, english: 3 },
    actionTagMods: { social: 1.3 },
  },
  {
    id: 'shengqian',
    name: '省钱达人',
    desc: '对折扣有第六感，做饭打工都更划算。',
    kind: 'positive',
    startMods: { money: 200 },
    actionTagMods: { cook: 1.3, work: 1.1 },
  },
  {
    id: 'tuoyan',
    name: '拖延症',
    desc: 'deadline 是第一生产力，可惜常常追不上。',
    kind: 'negative',
    startMods: { stress: 4 },
    actionTagMods: { study: 0.85 },
  },
  {
    id: 'chushen',
    name: '厨神',
    desc: '一口锅走天下，做饭既省钱又治想家。',
    kind: 'positive',
    startMods: { health: 5 },
    actionTagMods: { cook: 1.5 },
    startFlags: ['can_cook'],
  },
  {
    id: 'yemao',
    name: '夜猫子',
    desc: '夜里精神最好，一周能多做一件事，代价是健康。',
    kind: 'neutral',
    startMods: { energy: 5, health: -5 },
    apMod: 1,
  },
  {
    id: 'leguan',
    name: '乐观派',
    desc: '雨再大也能找到乐子，想家和压力都轻一些。',
    kind: 'positive',
    startMods: { homesick: -6, stress: -4 },
    actionTagMods: { social: 1.1 },
  },
];

export const TRAIT_BY_ID: Record<string, Trait> = Object.fromEntries(
  TRAITS.map((t) => [t.id, t]),
) as Record<string, Trait>;
