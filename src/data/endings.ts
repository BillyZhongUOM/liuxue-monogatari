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
  {
    id: 'ending_resit_exam',
    title: '挂科，等补考',
    desc: '成绩单上飘出一个红色的 Fail，那门课没过。你忙着打工和喘气，作业一拖再拖，到底还是欠下了。系里给了你一次暑假补考的机会，毕业的脚步先停一停。',
    quip: '补考不丢人，丢人的是连补考的机会都不要。这次，你想要。',
    tone: 'mixed',
    priority: 175,
    crisis: true,
    cond: { statLte: { gpa: 32, energy: 45 }, statGte: { stress: 58 }, minWeek: 14 },
  },
  {
    id: 'ending_midnight_lonely',
    title: '深夜，一个人撑不住了',
    desc: '这座城你已经认得每一条街，可宿舍门一关，安静得能听见自己的心跳。朋友圈热闹是别人的，深夜的泡面是自己的。想家像潮水，一波接一波，你终于在某个凌晨给爸妈打了那通哭出声的电话。',
    quip: '不是你不够坚强，是有些夜晚，本来就需要一个人一起熬。',
    tone: 'mixed',
    priority: 165,
    crisis: true,
    cond: { statGte: { homesick: 85, stress: 55 }, statLte: { social: 18 }, minWeek: 12 },
  },

  // Difficulty fails: triggered DIRECTLY by advanceWeek (neglect counters), not by
  // the cond DSL, so the cond is a sentinel that never matches checkEndings.
  {
    id: 'ending_dropout',
    title: '连续旷课，被劝退',
    desc: '一个多月没去上过课，没交过作业，系统里你的出勤记录是一片空白。学院发来最后一封邮件，措辞客气却没有余地：你的注册状态已被取消。你愣愣地看着那行字，才发现留学这件事，原来真的会因为你的视而不见而结束。',
    quip: '没有人会一直提醒你去上课，这一课，学费很贵。',
    tone: 'bad',
    priority: 240,
    crisis: true,
    cond: { flagsSet: ['__neglect_only__'] },
  },
  {
    id: 'ending_breakdown',
    title: '心态崩了',
    desc: '压力像潮水一样连着几周没退过，你终于在某个再普通不过的早晨爬不起来。盯着天花板，论文、打工、人际、想家，所有事一起压上来，你第一次清楚地感到，自己撑不住了。',
    quip: '崩溃不是软弱，是你早就该停下来喘口气。下次，请早一点。',
    tone: 'bad',
    priority: 235,
    crisis: true,
    cond: { flagsSet: ['__neglect_only__'] },
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
    desc: '改了几十版的 CV、刷了无数场面试、收了成箱的拒信，最后那封 "We are delighted to offer" 让一切都值了。毕业后留下来工作的那条路，也在向你招手。',
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
    id: 'ending_intern_to_fulltime',
    title: '实习转正',
    desc: '那份咬牙撑下来的实习，最后一天经理把你叫进办公室，递来的不是辞别，是一份正式合同。你在团队里留下的好口碑，比任何一版 CV 都管用。毕业后留下来的那条路，也跟着清晰了起来。',
    quip: '别人投了一百份简历，你把一份实习，做成了一份工作。',
    tone: 'good',
    priority: 85,
    cond: {
      statGte: { career: 62, reputation: 58, money: 1000 },
      leadingRouteIn: ['career', 'grind', 'survivor'],
    },
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
    id: 'ending_rain_philosopher',
    title: '雨中哲学家',
    desc: '你没把这一年过成一场冲刺。下雨就撑伞慢慢走，周末就坐火车去看海，把每一条街、每一间小馆子都认成了老朋友。绩点不算亮眼，可你比谁都更懂怎么在这座阴雨的城里，把日子过得舒展。',
    quip: '别人在卷绩点，你卷的是怎么把留学，活成自己的样子。',
    tone: 'good',
    priority: 64,
    cond: {
      statGte: { adaptation: 70, english: 55, gpa: 48 },
      statLte: { stress: 45 },
      leadingRouteIn: ['chill'],
    },
  },
  {
    id: 'ending_grew_but_unsure',
    title: '毕业了，路还在脚下',
    desc: '典礼那天，你穿着租来的学位袍，照片笑得很真。只是 offer 还没着落，回不回国也没想清楚。但摸摸口袋里那本越用越顺的英语，想想一年前连点餐都紧张的自己，你知道，有些成长是成绩单上看不见的。',
    quip: '没拿到标准答案，但你早就不是出发时的那个人了。',
    tone: 'mixed',
    priority: 52,
    cond: {
      statGte: { adaptation: 58, english: 52, social: 45 },
      statLte: { career: 50 },
    },
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
