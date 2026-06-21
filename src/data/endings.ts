import type { Ending } from '../game/types';

// Endings are checked highest-priority-first. `crisis: true` endings can fire any
// week (early-out); the rest are only evaluated at the finale. `ending_ordinary`
// is the catch-all and must stay lowest priority with an always-true condition.
export const ENDINGS: Ending[] = [
  // ----------------------------------------------------------------- crisis
  {
    id: 'ending_burnout',
    title: '压力爆表，休学',
    desc: '弦绷得太久，终于断了。医生建议你停下来，好好休息一个学期。这不是失败，是身体在替你喊停。',
    quip: '休学不是终点，是你终于把自己放在了第一位。',
    tone: 'bad',
    priority: 200,
    crisis: true,
    cond: { statGte: { stress: 100 } },
  },
  {
    id: 'ending_health_collapse',
    title: '身体垮了',
    desc: '泡面、熬夜和省下的健身钱，最终一起递上了账单。一场大病让你不得不按下暂停键。',
    quip: '身体是 1，其他都是后面的 0。',
    tone: 'bad',
    priority: 195,
    crisis: true,
    cond: { statLte: { health: 5 } },
  },
  {
    id: 'ending_bankruptcy',
    title: '财务崩盘，延期',
    desc: '账户见底，房租压顶。你不得不暂停学业去搬砖救急，毕业的时间表往后挪了。',
    quip: '钱不是万能的，但没钱的留学是真的寸步难行。',
    tone: 'bad',
    priority: 190,
    crisis: true,
    cond: { statLte: { money: 0 }, minWeek: 4 },
  },
  {
    id: 'ending_homesick_quit',
    title: '想家想到放弃',
    desc: '每个深夜都在数回国的日子。适应不来的生活加上化不开的思念，你买了一张回程机票。',
    quip: '有的人适合远行，有的人只是还没准备好，都没关系。',
    tone: 'mixed',
    priority: 180,
    crisis: true,
    cond: { statGte: { homesick: 100 }, statLte: { adaptation: 35 } },
  },

  // ----------------------------------------------------------------- finale (good)
  {
    id: 'ending_distinction',
    title: 'Distinction 学霸',
    desc: '成绩单上那行 Distinction，是无数个泡在图书馆的下午换来的。导师在推荐信里写满了溢美之词。',
    quip: '你把"听不懂 lecture"的起点，走成了满绩的终点。',
    tone: 'good',
    priority: 90,
    cond: { statGte: { gpa: 82 }, statLte: { stress: 95 } },
  },
  {
    id: 'ending_job_offer',
    title: '拿到 Offer',
    desc: '改了几十版的 CV、刷了无数场面试、收了成箱的拒信，最后那封 "We are delighted to offer" 让一切都值了。Graduate Route 在向你招手。',
    quip: '拒信是用来垫脚的，你终于站到了够得着 offer 的高度。',
    tone: 'good',
    priority: 88,
    cond: { statGte: { career: 70 } },
  },
  {
    id: 'ending_phd',
    title: '申博成功',
    desc: '套磁、套磁、再套磁，一封带着 funding 的录取信落进邮箱。导师说，期待和你一起做研究。',
    quip: '别人逃离学术，你一头扎了进去，挺好。',
    tone: 'good',
    priority: 86,
    cond: { statGte: { gpa: 75, reputation: 60 } },
  },
  {
    id: 'ending_social_star',
    title: '社团达人',
    desc: '你可能不是绩点最高的，但你是认识人最多的。毕业典礼上，半个会场都在和你打招呼。',
    quip: '有人收获了文凭，你收获了一整座城的朋友。',
    tone: 'good',
    priority: 70,
    cond: { statGte: { social: 80, reputation: 62 } },
  },
  {
    id: 'ending_return_home',
    title: '回国上岸',
    desc: '你一边读书一边把回国的路铺好了。攒下的履历和人脉，换来了家乡一份心仪的工作。落地那天，妈妈做了一桌你想了一年的菜。',
    quip: '出去看过世界，再回来，脚步更稳了。',
    tone: 'good',
    priority: 66,
    cond: { statGte: { career: 48, money: 1200 }, leadingRouteIn: ['homebound', 'career', 'survivor'] },
  },
  {
    id: 'ending_survivor',
    title: '稳稳毕业',
    desc: '没有惊艳全场，也没有跌进谷底。你按时交了每一份作业，付清了每一笔房租，平平稳稳走到了毕业典礼。',
    quip: '把留学这局玩到通关，本身就是高手。',
    tone: 'good',
    priority: 40,
    cond: { statGte: { gpa: 50 } },
  },

  // ----------------------------------------------------------------- catch-all
  {
    id: 'ending_ordinary',
    title: '平凡的一年',
    desc: '这一年没有高光时刻，也没有惊天动地。但你确实在一座陌生的城市里，把自己照顾到了最后。',
    quip: '普通地走完，也是一种了不起。',
    tone: 'mixed',
    priority: -999,
    cond: {},
  },
];

export const ENDING_BY_ID: Record<string, Ending> = Object.fromEntries(
  ENDINGS.map((e) => [e.id, e]),
) as Record<string, Ending>;
