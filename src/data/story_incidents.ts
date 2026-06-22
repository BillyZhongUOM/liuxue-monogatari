// Per-action secondary "incident" events. Each action (study/cook/shop/home/gym/
// explore/rest-life/spending/romance/travel/admin + topups) can pull one of these
// from its risk pool: doing the action sometimes triggers a themed follow-up.
// Authored via a 14-pool research-room workflow, editor-QA'd, code-validated.
import type { GameEvent } from '../game/types';

export const STORY_INCIDENTS: GameEvent[] = [
  {
    "id": "inc_study_seat_war",
    "title": "占座大战",
    "description": "你拎着电脑去图书馆,想找个靠窗的位置。结果整层楼桌上全是水杯、外套、一本摊开的书,人却一个都不在,纯纯的幽灵占座。你转了三圈,腿都酸了。",
    "category": "study",
    "weight": 13,
    "oncePerGame": true,
    "pool": "study_incidents",
    "cond": {
      "maxYear": 1
    },
    "choices": [
      {
        "text": "找管理员举报这些幽灵座位",
        "resultText": "管理员过来贴了张提示条,清出两个位置。你坐下时旁边几个人投来微妙的眼神,但你确实有座了,问心无愧。",
        "effects": {
          "stress": -4,
          "gpa": 3,
          "energy": -4,
          "reputation": 2,
          "social": -2
        },
        "routeWeights": {
          "grind": 2,
          "scholar": 1
        }
      },
      {
        "text": "认命去小组讨论室凑合",
        "resultText": "讨论室隔音差,隔壁一直在开组会。你戴上耳机硬学,效率打了对折,但好歹坐下了。",
        "effects": {
          "stress": 3,
          "gpa": 1,
          "energy": -5,
          "adaptation": 2
        },
        "routeWeights": {
          "chill": 1
        }
      },
      {
        "text": "干脆回家学,省得受气",
        "resultText": "走回家的路上你想通了,与其跟陌生人的水杯赌气,不如回自己房间。床很近,这是个隐患。",
        "effects": {
          "energy": 4,
          "stress": -3,
          "gpa": -1,
          "homesick": 3,
          "money": -3
        },
        "routeWeights": {
          "homebound": 2,
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_study_senior_notes",
    "title": "学长的神仙笔记",
    "description": "你为了一门难课泡在图书馆,隔壁座位的人收拾东西时,留下一沓打印的笔记没拿走。你瞄了一眼,是上一届整理的考点全集,工整得像出版物。",
    "category": "study",
    "weight": 12,
    "oncePerGame": true,
    "pool": "study_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "追出去还给ta,顺便问能不能拷一份",
        "resultText": "你气喘吁吁追到楼梯口。对方很爽快,加了联系方式,把电子版整个分享给你,还说有问题随时问。你赚翻了。",
        "effects": {
          "gpa": 4,
          "social": 5,
          "english": 2,
          "energy": -4,
          "reputation": 3
        },
        "routeWeights": {
          "social": 2,
          "scholar": 1
        }
      },
      {
        "text": "原地翻拍几页留着自己用",
        "resultText": "你手机咔咔拍了十几页,心里有点虚。笔记是真的好用,但每次翻到都想起那点没还回去的别扭。",
        "effects": {
          "gpa": 3,
          "stress": 3,
          "reputation": -2,
          "energy": -2
        },
        "routeWeights": {
          "grind": 2
        }
      },
      {
        "text": "交到借还台帮ta找回失主",
        "resultText": "你把笔记交给前台登记。没占到便宜,但走回座位时步子格外轻。诚实这件事,自己心里有数。",
        "effects": {
          "reputation": 3,
          "gpa": 1,
          "stress": -3,
          "energy": -3,
          "social": 2
        },
        "routeWeights": {
          "scholar": 1,
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_study_lockin_lockout",
    "title": "通宵自习室闭馆",
    "description": "你以为这间自习室是24小时的,埋头赶due到深夜。保安拿着手电走过来,说今晚提前闭馆,所有人十分钟内清场。你的进度条才刚过一半。",
    "category": "study",
    "weight": 12,
    "oncePerGame": true,
    "pool": "study_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 6
    },
    "choices": [
      {
        "text": "转战24小时麦当劳继续肝",
        "resultText": "你点了杯最便宜的咖啡占座,在薯条味里写到天亮。东西是交了,但回家路上你困得差点坐过站。",
        "effects": {
          "gpa": 3,
          "energy": -8,
          "health": -4,
          "money": -5,
          "stress": 4
        },
        "routeWeights": {
          "grind": 2
        }
      },
      {
        "text": "收拾回宿舍,定个早闹钟补",
        "resultText": "你认了,回去睡了五小时,清早爬起来接着写。脑子清醒多了,效率反而比硬熬高。",
        "effects": {
          "energy": 3,
          "gpa": 2,
          "stress": -2,
          "adaptation": 3,
          "health": 2
        },
        "routeWeights": {
          "scholar": 1,
          "chill": 1
        }
      },
      {
        "text": "跟保安磨,问能不能宽限半小时",
        "resultText": "保安没松口,但闲聊里告诉你哪栋楼通宵开放。你学了个新地图,只是今晚的due还是没赶完。",
        "effects": {
          "english": 3,
          "social": 2,
          "stress": 5,
          "gpa": -1,
          "energy": -4,
          "adaptation": 2
        },
        "routeWeights": {
          "survivor": 2,
          "social": 1
        }
      }
    ]
  },
  {
    "id": "inc_study_lost_in_lecture",
    "title": "整节课的点头",
    "description": "大课上,教授语速飞快,夹着一堆没听过的术语和本地梗。全场都在笑,你跟着扯了下嘴角。两小时里你点了无数次头,其实一句没跟上。",
    "category": "study",
    "weight": 13,
    "oncePerGame": true,
    "pool": "study_incidents",
    "cond": {
      "maxYear": 1
    },
    "choices": [
      {
        "text": "下课厚脸皮去追问教授",
        "resultText": "你拦住正要走的教授,把没懂的几点一口气问完。ta放慢语速重讲了一遍,还推荐了两段录播。听不懂不丢人,装懂才耽误事。",
        "effects": {
          "english": 3,
          "gpa": 4,
          "reputation": 2,
          "stress": -2,
          "energy": -4
        },
        "routeWeights": {
          "scholar": 2,
          "grind": 1
        }
      },
      {
        "text": "课后窝在图书馆啃录播补课",
        "resultText": "你把这节课从头听了一遍,暂停、查词、再听,花了双倍时间才弄明白。笨办法,但这回是真懂了。",
        "effects": {
          "gpa": 3,
          "english": 2,
          "energy": -6,
          "stress": 2,
          "adaptation": 2
        },
        "routeWeights": {
          "grind": 2,
          "scholar": 1
        }
      },
      {
        "text": "安慰自己反正考前还能突击",
        "resultText": "你把没懂的全推给了未来的自己。当下是轻松了,可那块知识缺口,迟早会在某张卷子上等着你。",
        "effects": {
          "stress": -3,
          "gpa": -2,
          "energy": 2,
          "homesick": 2
        },
        "routeWeights": {
          "chill": 2
        }
      }
    ]
  },
  {
    "id": "inc_study_printer_ate_essay",
    "title": "打印机吃了我的论文",
    "description": "交稿截止前一小时,你冲到图书馆打印 essay。打印机吞进纸张,卡住,屏幕跳红,你的余额扣了却一张没出。后面还排着一长队人。",
    "category": "study",
    "weight": 13,
    "oncePerGame": true,
    "pool": "study_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "冲去前台求助换台机器",
        "resultText": "前台小哥三两下搞定,帮你免费重打,还退了卡里的钱。你抱着热乎乎的论文狂奔去提交,卡点踩线成功。",
        "effects": {
          "stress": -2,
          "gpa": 3,
          "english": 2,
          "social": 2,
          "energy": -4
        },
        "routeWeights": {
          "survivor": 2,
          "social": 1
        }
      },
      {
        "text": "改成线上提交,赌系统认电子版",
        "resultText": "你翻出邮件确认确实接受线上交,手一抖点了上传。绿色对勾跳出来那一刻,你瘫在椅子上,后背全是汗。",
        "effects": {
          "stress": 4,
          "gpa": 2,
          "adaptation": 3,
          "energy": -3,
          "health": -2
        },
        "routeWeights": {
          "grind": 1,
          "survivor": 1
        }
      },
      {
        "text": "原地崩溃,狂拍打印机",
        "resultText": "你气得拍了两下机器,它毫无反应,旁边的人都在看你。最后还是别人帮你重启才出纸。教训:留出余量,别卡点。",
        "effects": {
          "stress": 6,
          "reputation": -3,
          "energy": -5,
          "gpa": 1,
          "health": -3
        },
        "routeWeights": {
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_study_office_hour_silence",
    "title": "Office Hour 的哑口",
    "description": "你预约了导师的 office hour,带着自以为不错的研究想法去。导师听完,只轻轻反问一句:那你的研究问题到底是什么?你张了张嘴,发现自己答不上来。",
    "category": "study",
    "weight": 12,
    "oncePerGame": true,
    "pool": "study_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 8
    },
    "choices": [
      {
        "text": "当场承认没想清,请ta帮你拆",
        "resultText": "你诚实说还没理顺。导师反而来了兴致,拿白板陪你一句句往下抠,半小时后你的题目清晰了一大截。被问倒不可怕,藏着才可怕。",
        "effects": {
          "gpa": 5,
          "english": 3,
          "reputation": 3,
          "stress": -2,
          "energy": -5
        },
        "routeWeights": {
          "scholar": 2,
          "phd": 2
        }
      },
      {
        "text": "硬扯几句撑场面",
        "resultText": "你临时编了套说辞,导师没拆穿,只是点点头让你回去再想想。你走出办公室才发现,糊弄过去的其实是自己。",
        "effects": {
          "reputation": -2,
          "stress": 4,
          "gpa": 1,
          "english": 1,
          "energy": -3
        },
        "routeWeights": {
          "chill": 1
        }
      },
      {
        "text": "回去泡图书馆重新读文献再约",
        "resultText": "你被那一句点醒,扎进文献堆查了整周,带着真正的问题再去找导师。ta看你的眼神都不一样了。慢一点,但这步走稳了。",
        "effects": {
          "gpa": 4,
          "english": 2,
          "career": 3,
          "energy": -6,
          "stress": 3,
          "adaptation": 2
        },
        "routeWeights": {
          "phd": 2,
          "scholar": 1
        }
      }
    ]
  },
  {
    "id": "inc_cook_smoke_alarm",
    "title": "炒菜惊动全楼",
    "description": "你大火爆炒,油烟腾起来一秒不到,天花板上那个白色小圆盘就尖叫起来。紧接着整栋楼的报警都连成一片,走廊里传来邻居拖鞋的脚步声。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "pool": "cook_incidents",
    "cond": {
      "maxYear": 1
    },
    "choices": [
      {
        "text": "冲出去开窗、拿锅盖扇报警器",
        "resultText": "你一手锅盖一手抹布对着报警器猛扇,邻居裹着睡衣陆陆续续下楼,在寒风里站成一排。等警报停了,你站在楼道里跟一圈陌生人尴尬对视,那盘菜也凉透了。",
        "effects": {
          "stress": 7,
          "energy": -6,
          "reputation": -3,
          "adaptation": 3
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "干脆全楼疏散,下楼跟邻居搭话",
        "resultText": "你索性认了,跟着大家一起站到楼外。等消防确认是虚惊,几个邻居反倒笑起来,一个本地大叔拍拍你肩说他第一年也这样。一场乌龙,竟换来几句寒暄。",
        "effects": {
          "stress": 4,
          "social": 5,
          "homesick": -4,
          "reputation": 2,
          "adaptation": 4
        },
        "routeWeights": {
          "social": 2,
          "survivor": 1
        }
      },
      {
        "text": "以后改成水煮少油版",
        "resultText": "你痛定思痛,把爆炒从菜单里划掉,从此一锅水煮天下。报警器是安静了,可那点锅气和家的味道,也跟着水煮没了。",
        "effects": {
          "stress": -3,
          "health": 4,
          "homesick": 3,
          "energy": 3
        },
        "routeWeights": {
          "chill": 1,
          "homebound": 1
        }
      }
    ]
  },
  {
    "id": "inc_cook_dark_cuisine_fail",
    "title": "黑暗料理翻车",
    "description": "你照着手机里的菜谱,自信满满地下了厨。可锅里这坨东西,颜色诡异、味道说不清,连你自己都不敢咽下去。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "pool": "cook_incidents",
    "cond": {
      "maxYear": 1
    },
    "choices": [
      {
        "text": "认栽,点个外卖",
        "resultText": "你默默把那锅倒进垃圾桶,打开外卖软件点了份熟悉的中餐。送到门口那一刻,热乎的香味让你差点感动落泪,原来花钱买的不只是饭,是不用再面对自己手艺的解脱。",
        "effects": {
          "money": -18,
          "homesick": -3,
          "stress": -2,
          "health": -3
        },
        "routeWeights": {
          "chill": 2
        }
      },
      {
        "text": "捏着鼻子也要吃完不浪费",
        "resultText": "你告诉自己食材都是钱,硬着头皮一口口往下咽。吃完那一刻你既心疼钱又心疼胃,但莫名有种节俭留学生的悲壮自豪感。",
        "effects": {
          "money": 3,
          "health": -5,
          "stress": 4,
          "adaptation": 3
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "拍照发群里求大家诊断",
        "resultText": "你把惨状拍下来发进留学生群,配文这是什么。消息一发出去,群里瞬间炸出十几条嘲笑和救命菜谱,还有人约你下次一起做。一锅废菜,倒成了社交货币。",
        "effects": {
          "social": 5,
          "homesick": -5,
          "stress": -3,
          "money": -8
        },
        "routeWeights": {
          "social": 2
        }
      }
    ]
  },
  {
    "id": "inc_cook_roommate_freeload",
    "title": "香味引来蹭饭",
    "description": "你难得认真做了顿好的,红烧的香味顺着门缝飘出去。还没等你坐下,室友就端着空碗探进头来,眼神里写满了期待。",
    "category": "social",
    "weight": 14,
    "oncePerGame": true,
    "pool": "cook_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "大方分一半,多个伴",
        "resultText": "你笑着给ta盛了一大碗,两个人挤在小厨房边吃边聊。饭量是少了一半,可那顿饭吃得格外热闹,独自啃饭的冷清也被冲散了不少。",
        "effects": {
          "social": 6,
          "homesick": -6,
          "money": -6,
          "energy": -4
        },
        "routeWeights": {
          "social": 2,
          "homebound": 1
        }
      },
      {
        "text": "约定以后轮流做饭",
        "resultText": "你顺势提议干脆搭伙,一人一天轮着掌勺。ta一口答应,从此你们的冰箱开始共享,做饭这件苦差事忽然有了搭子,省心又省钱。",
        "effects": {
          "social": 5,
          "money": 12,
          "adaptation": 4,
          "stress": -3
        },
        "routeWeights": {
          "social": 2,
          "survivor": 1
        }
      },
      {
        "text": "假装没看见,护住自己的饭",
        "resultText": "你低头扒饭装作专注,室友讪讪地缩回了头。这顿你是吃饱了,可关上门那点心虚和往后见面的别扭,也悄悄记进了心里。",
        "effects": {
          "social": -4,
          "stress": 4,
          "energy": 2,
          "reputation": -2
        },
        "routeWeights": {
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_cook_oil_fire",
    "title": "油锅起火慌了神",
    "description": "你正炸着东西,一不留神油锅腾地窜起一团火苗,火舌往上舔。你脑子嗡一下空白,心跳到了嗓子眼。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "pool": "cook_incidents",
    "cond": {
      "maxYear": 1
    },
    "choices": [
      {
        "text": "盖锅盖闷灭,关火",
        "resultText": "你想起油锅起火千万别浇水,一把抄起锅盖盖上去,又赶紧关了火。火闷灭的那几秒你手都在抖,事后越想越后怕,赶紧上网恶补了一遍厨房安全。",
        "effects": {
          "stress": 8,
          "energy": -6,
          "adaptation": 5,
          "health": -3
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "慌乱中差点泼水,幸好停手",
        "resultText": "你下意识抓起水杯就要往锅里倒,手伸到一半猛地想起这是大忌,赶紧收住。一身冷汗下来,你瘫坐在地上,庆幸自己停得及时,这顿饭算是用命换的教训。",
        "effects": {
          "stress": 8,
          "health": -5,
          "adaptation": 3,
          "energy": -4
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "从此告别油炸,全靠空气炸锅",
        "resultText": "受了这一惊,你转头就下单了个空气炸锅。从此厨房里再没明火窜起来过,虽然炸出来的东西总差那么点意思,但能安心睡觉比什么都强。",
        "effects": {
          "money": -45,
          "stress": -4,
          "health": 3,
          "adaptation": 3
        },
        "routeWeights": {
          "chill": 1,
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_cook_homedish_success",
    "title": "复刻家乡菜",
    "description": "你跑了三趟中超凑齐食材,照着妈妈电话里念的步骤,第一次成功复刻出了那道家乡菜。尝一口的瞬间,味道对了,眼眶忽然就热了。",
    "category": "emotion",
    "weight": 13,
    "oncePerGame": true,
    "pool": "cook_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "拍下来视频给家里看",
        "resultText": "你端着这盘菜跟家里视频,妈妈在屏幕那头又惊又喜,反复说你长大了。那顿饭你是一边吃一边掉眼泪吃完的,想家的劲儿,竟被自己亲手做的味道治愈了一半。",
        "effects": {
          "homesick": -10,
          "stress": -4,
          "social": 3,
          "energy": -3
        },
        "routeWeights": {
          "homebound": 2
        }
      },
      {
        "text": "记下配方,以后常做",
        "resultText": "你把成功的步骤和分量一笔一笔记进手机备忘录,郑重得像在抄什么秘方。从这天起,无论多想家,你都知道自己有本事把那个味道重新做出来,这份底气比菜本身更暖。",
        "effects": {
          "homesick": -6,
          "adaptation": 5,
          "stress": -3,
          "health": 3
        },
        "routeWeights": {
          "survivor": 2,
          "homebound": 1
        }
      },
      {
        "text": "喊朋友来尝,办场小饭局",
        "resultText": "你一高兴,把几个朋友都喊来家里,那道家乡菜成了桌上的主角。看着大家抢着夹、连连说好吃,你那点独在异乡的孤单,在满桌笑声里悄悄化开了。",
        "effects": {
          "social": 6,
          "homesick": -7,
          "money": -22,
          "stress": -3
        },
        "routeWeights": {
          "social": 2,
          "homebound": 1
        }
      }
    ]
  },
  {
    "id": "inc_cook_rotten_food",
    "title": "食材忘在冰箱",
    "description": "你打开冰箱想做饭,一股怪味先冲了出来。翻到最里头,那包前几天兴冲冲买回来的菜,早已经悄悄烂掉了。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "pool": "cook_incidents",
    "cond": {
      "maxYear": 1
    },
    "choices": [
      {
        "text": "心疼地扔掉,下决心列清单",
        "resultText": "你捏着鼻子把那包东西扔进垃圾桶,心里默算着浪费的英镑直发肉疼。当晚你就在手机上建了个采买清单,告诉自己再不能由着性子乱囤了。",
        "effects": {
          "money": -10,
          "stress": 4,
          "adaptation": 5,
          "health": 2
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "拿还能吃的部分凑合一顿",
        "resultText": "你翻拣半天,把没坏透的部分切下来勉强炒了一盘。吃是吃了,可那点犹豫的味道一直在舌尖打转,省下的钱和担的风险,怎么算都不太划算。",
        "effects": {
          "money": 5,
          "health": -5,
          "stress": 3,
          "energy": -4
        },
        "routeWeights": {
          "survivor": 1,
          "chill": 1
        }
      },
      {
        "text": "干脆改成少量勤买",
        "resultText": "经此一遭,你索性改了策略,每次只买两三天的量,宁可多跑几趟超市。冰箱清爽了,吃的也新鲜了,那种把日子过明白了的踏实感,慢慢回到了你身上。",
        "effects": {
          "money": -6,
          "health": 4,
          "adaptation": 4,
          "energy": -3
        },
        "routeWeights": {
          "chill": 1,
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_shop_yellow_sticker",
    "title": "黄标贴上去那刻",
    "description": "你在超市冷柜前买菜,店员推着小车过来,啪啪往一排临期三明治上贴黄标。周围几个人瞬间停下脚步,空气里有种心照不宣的紧张。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "pool": "shop_incidents",
    "cond": {
      "maxYear": 1
    },
    "choices": [
      {
        "text": "冲上去抢两盒",
        "resultText": "你眼疾手快抢到原价八镑现价一镑的寿司拼盘,回家路上像打赢了一场仗,晚饭都香了。",
        "effects": {
          "money": 12,
          "energy": -5,
          "stress": -4,
          "adaptation": 3
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "默默等大爷大妈先挑",
        "resultText": "你客气地让了一步,等回过神黄标区已经被扫空,只剩两根孤零零的欧防风,你买了,顺便学会了怎么做防风汤。",
        "effects": {
          "money": -3,
          "energy": -4,
          "adaptation": 4,
          "english": 2
        },
        "routeWeights": {
          "chill": 1
        }
      },
      {
        "text": "全程看戏,正价买菜",
        "resultText": "你站在一旁看着哄抢的人群,觉得自己很有原则,然后心平气和地按正价结账,理智的钱花得有点肉疼。",
        "effects": {
          "money": -18,
          "stress": 3,
          "reputation": 2
        },
        "routeWeights": {
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_shop_no_bag",
    "title": "袋子没带",
    "description": "买菜结完账,你才想起环保袋又落在家里了。收银员问你要不要袋子,五便士一个,你看着一堆散装的菜,有点想原地表演徒手抱回家。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "pool": "shop_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "认栽买俩塑料袋",
        "resultText": "十便士到账,你拎着两个崭新的袋子出门,心想这已经是你这个月第三次为忘带袋子交学费了,回家郑重其事把袋子叠进抽屉。",
        "effects": {
          "money": -1,
          "stress": 3,
          "adaptation": 2
        },
        "routeWeights": {
          "chill": 1
        }
      },
      {
        "text": "把菜往书包和怀里塞",
        "resultText": "你把白菜土豆塞进书包,怀里抱着一盒鸡蛋,一路像偷菜归来,到家发现鸡蛋裂了一个,但省下的五便士守住了你最后的尊严。",
        "effects": {
          "money": 0,
          "energy": -4,
          "health": -2,
          "stress": -2
        },
        "routeWeights": {
          "survivor": 1
        }
      },
      {
        "text": "拿购物车一路推到公交站",
        "resultText": "你理直气壮把整辆购物车推出门,直到看见车轮被锁的提示和公交站越来越近,只好乖乖推回去,白白多走一圈,但锻炼到了。",
        "effects": {
          "energy": -6,
          "health": 2,
          "adaptation": 3,
          "stress": 2
        },
        "routeWeights": {
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_shop_fellow_chinese",
    "title": "中超偶遇老乡",
    "description": "你在中超的酱料区纠结买老干妈还是辣酱,旁边一个同样举着两瓶犹豫的人突然用中文问你哪个下饭。你俩对视一秒,瞬间懂了彼此的处境。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "pool": "shop_incidents",
    "cond": {
      "maxYear": 1
    },
    "choices": [
      {
        "text": "聊起来,加个微信",
        "resultText": "从酱料聊到房租再聊到哪家中餐外卖不踩雷,你俩在收银台排队的工夫互加了微信,约好下次拼单买米,异乡突然多了个能说家乡话的人。",
        "effects": {
          "social": 6,
          "homesick": -8,
          "adaptation": 3,
          "energy": -3
        },
        "routeWeights": {
          "social": 2
        }
      },
      {
        "text": "热情过头,被当成代购",
        "resultText": "你太热心地科普了半天,对方以为你是做代购的,问你能不能帮带奶粉,你哭笑不得地解释了半天自己只是个馋老干妈的留学生,场面一度尴尬又好笑。",
        "effects": {
          "social": 3,
          "stress": 2,
          "reputation": -1,
          "homesick": -3
        },
        "routeWeights": {
          "social": 1
        }
      }
    ]
  },
  {
    "id": "inc_shop_hometown_snack",
    "title": "货架上的家乡牌子",
    "description": "你在零食区随便逛,一转头看见货架最里面那个从小吃到大的牌子,包装一模一样,只是价签贵了三倍。你站在那,鼻子忽然有点酸。",
    "category": "emotion",
    "weight": 13,
    "oncePerGame": true,
    "pool": "shop_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "贵也买,买的是想家",
        "resultText": "你毫不犹豫拿了三包,回家拆开第一口的瞬间,记忆里整个夏天的味道都回来了,这几镑买的是一晚上不那么孤单的自己。",
        "effects": {
          "money": -9,
          "homesick": -10,
          "stress": -4,
          "health": -2
        },
        "routeWeights": {
          "homebound": 2
        }
      },
      {
        "text": "拍张照发给家里",
        "resultText": "你拍下货架发到家庭群,妈妈秒回在那边也能买到啊,隔着八千公里你俩为一包零食聊了半小时,你笑着笑着眼眶就热了。",
        "effects": {
          "homesick": -6,
          "social": 2,
          "stress": -3,
          "energy": -2
        },
        "routeWeights": {
          "homebound": 2
        }
      },
      {
        "text": "看一眼,放回去走人",
        "resultText": "你把零食放回原位,告诉自己等打折再说,转身那一下心里空落落的,这种克制说不清是省钱还是怕太想家。",
        "effects": {
          "money": 0,
          "homesick": 4,
          "stress": 4,
          "adaptation": 2
        },
        "routeWeights": {
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_shop_price_compare",
    "title": "比价比到怀疑人生",
    "description": "为了省钱,你打开手机一家家比超市的价。同样一盒鸡蛋,这家便宜两毛,那家鸡腿打折,可步行二十分钟,你站在货架前算得头都大了。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "pool": "shop_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "横扫三家,薅干所有折扣",
        "resultText": "你拎着购物袋在三家店之间穿梭,把每样东西都买在了最低价,省下小十镑,代价是腿快废了,回家瘫在沙发上还是觉得这把血赚。",
        "effects": {
          "money": 10,
          "energy": -8,
          "stress": 4,
          "adaptation": 4
        },
        "routeWeights": {
          "survivor": 2,
          "grind": 1
        }
      },
      {
        "text": "算了,一家买齐图省心",
        "resultText": "你一咬牙在最近的店把菜买齐,多花了几镑但省下一下午,回家发现时间和力气也是钱,这个道理你好像刚刚才真正想通。",
        "effects": {
          "money": -7,
          "stress": -5,
          "energy": 2
        },
        "routeWeights": {
          "chill": 2
        }
      },
      {
        "text": "比到一半,被自己气笑了",
        "resultText": "你盯着屏幕意识到自己为了省两毛已经站了十分钟,突然觉得又荒诞又心酸,留学第一课原来是学会跟生活的物价斤斤计较。",
        "effects": {
          "money": -3,
          "stress": 2,
          "homesick": 3,
          "adaptation": 3
        },
        "routeWeights": {
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_home_brave_face",
    "title": "镜头前的报喜",
    "description": "你和家里视频报平安,爸妈抢着把镜头怼到脸上,说家里一切都好让你别担心。可你瞥见妈妈眼睛是红的,爸爸刚才那句我血压挺正常答得太快了。",
    "category": "emotion",
    "weight": 13,
    "oncePerGame": true,
    "pool": "home_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "顺着他们装没事,聊些开心的就挂",
        "resultText": "你陪着他们演完这场报喜,挂了电话才发现自己也松了口气,有些事不戳破才是体面。但那点没问出口的牵挂,整晚都压在心口。",
        "effects": {
          "homesick": 4,
          "stress": 4,
          "energy": -4,
          "social": 2
        },
        "routeWeights": {
          "homebound": 1
        }
      },
      {
        "text": "认真追问到底家里出了什么事",
        "resultText": "你软磨硬泡半天,妈妈才说出爸爸前阵子住了两天院,现在没大碍。知道实情反而踏实了,你认真叮嘱他们以后别瞒,挂电话时彼此都红了眼。",
        "effects": {
          "homesick": 5,
          "stress": 6,
          "adaptation": 3,
          "social": 3
        },
        "routeWeights": {
          "homebound": 2
        }
      }
    ]
  },
  {
    "id": "inc_home_aunties_matchmake",
    "title": "七大姑的围观",
    "description": "你正跟爸妈视频,镜头那头忽然挤进来一圈亲戚,原来今天家里聚餐。还没说两句,大姨就开始问你在英国有没有对象,二舅妈说她同事的孩子条件不错。",
    "category": "social",
    "weight": 12,
    "oncePerGame": true,
    "pool": "home_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "笑着打太极,推说作业多先溜",
        "resultText": "你端出留学生标准话术,论文deadline、实验报告、图书馆闭馆,一套组合拳下来亲戚们果然放过你。挂掉那一刻,你对着空屏幕长出一口气,异国的安静第一次这么香。",
        "effects": {
          "social": 3,
          "stress": 5,
          "energy": -4,
          "homesick": -3
        },
        "routeWeights": {
          "chill": 1
        }
      },
      {
        "text": "干脆把这边的生活认真讲给他们听",
        "resultText": "你索性带着镜头转了圈出租屋,讲中超买菜、讲赶due的夜晚。亲戚们从催相亲变成了围观你的日常,大姨临了还说这孩子真有出息,你被夸得有点不好意思。",
        "effects": {
          "social": 5,
          "reputation": 3,
          "english": 2,
          "homesick": 4
        },
        "routeWeights": {
          "social": 2
        }
      },
      {
        "text": "板着脸说自己现在只想搞学业",
        "resultText": "你认真表态婚恋的事先放一放,屏幕那头安静了半秒。爸妈赶紧打圆场把话题岔开,你知道自己态度立住了,但也隐约觉得扫了大家的兴。",
        "effects": {
          "social": -3,
          "stress": 3,
          "gpa": 2,
          "adaptation": 3
        },
        "routeWeights": {
          "grind": 1,
          "scholar": 1
        }
      }
    ]
  },
  {
    "id": "inc_home_mom_cooking",
    "title": "隔屏馋哭",
    "description": "视频接通,妈妈特意把手机架到灶台前,锅里正炖着你从小最爱吃的那道菜,香气仿佛要从屏幕里溢出来。你低头看了眼自己刚煮的水煮意面,鼻子一酸。",
    "category": "emotion",
    "weight": 13,
    "oncePerGame": true,
    "pool": "home_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "让妈妈把做法一步步教给你",
        "resultText": "你举着手机站在出租屋的小厨房,跟着妈妈隔空学了一遍火候和调料。虽然第一次做得咸了点,但厨房里飘起熟悉的味道时,你觉得家好像没那么远了。",
        "effects": {
          "adaptation": 4,
          "homesick": -4,
          "health": 3,
          "money": -15
        },
        "routeWeights": {
          "homebound": 2
        }
      },
      {
        "text": "一边看一边偷偷抹眼泪",
        "resultText": "你嘴上说着真香,眼泪却不争气地掉下来,赶紧借口屏幕反光擦了擦。妈妈假装没看见,絮絮叨叨说回国就给你做个够。挂了电话,那碗意面怎么吃都没味道。",
        "effects": {
          "homesick": 5,
          "stress": 4,
          "energy": -4,
          "health": -3
        },
        "routeWeights": {
          "homebound": 2
        }
      }
    ]
  },
  {
    "id": "inc_home_caught_thin",
    "title": "一眼被看穿",
    "description": "你特意挑了精神的角度报平安,说自己在这边过得很好。话音还没落,妈妈眯起眼凑近屏幕,一句你是不是瘦了直接把你的伪装戳破。",
    "category": "emotion",
    "weight": 14,
    "oncePerGame": true,
    "pool": "home_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "嘴硬说是镜头显瘦,赶紧转移话题",
        "resultText": "你硬撑着说手机摄像头拉脸,顺手把镜头转向窗外的阴天。爸妈半信半疑放过了你,可挂了电话照镜子,你也愣住了,原来真瘦了一圈自己都没察觉。",
        "effects": {
          "homesick": 3,
          "stress": 4,
          "health": -3,
          "energy": -4
        },
        "routeWeights": {
          "homebound": 1
        }
      },
      {
        "text": "老实承认最近忙得没好好吃饭",
        "resultText": "你坦白这阵子赶due经常一顿外卖糊弄过去,妈妈隔着屏幕念叨了半天,逼你保证明天就去中超囤菜。被这么管着,心里居然暖暖的,你认真答应会照顾好自己。",
        "effects": {
          "homesick": 4,
          "health": 4,
          "adaptation": 3,
          "money": -20
        },
        "routeWeights": {
          "homebound": 1,
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_home_emoji_pack",
    "title": "爸妈学会了表情包",
    "description": "视频聊到一半,你妈忽然神秘兮兮地说要给你看个新东西,紧接着对话框里弹出一连串她刚学会的魔性表情包,还配了句加油鸭。你爸在旁边憋着笑等你反应。",
    "category": "emotion",
    "weight": 13,
    "oncePerGame": true,
    "pool": "home_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "立刻回一串更离谱的表情包斗图",
        "resultText": "你火速翻出收藏夹里的压箱底表情,跟爸妈隔着八小时时差斗起图来。一来一回,聊天框被各种沙雕图刷屏,你笑到肚子疼,忽然觉得这个家可爱得不像话。",
        "effects": {
          "homesick": -5,
          "social": 4,
          "stress": -6,
          "energy": -4
        },
        "routeWeights": {
          "homebound": 2
        }
      },
      {
        "text": "耐心教他们怎么保存和发更多表情",
        "resultText": "你举着手机当起了远程客服,一步步教爸妈存图、发图、加收藏。他们学得认真,你讲得耐心,那一刻角色好像调了个个儿。挂电话前,妈妈又骄傲地甩来一张新表情。",
        "effects": {
          "homesick": -3,
          "social": 3,
          "adaptation": 3,
          "stress": -4,
          "energy": -4
        },
        "routeWeights": {
          "homebound": 1
        }
      }
    ]
  },
  {
    "id": "inc_gym_overload_doms",
    "title": "逞强加重量",
    "description": "你在健身房看隔壁那位轻松推起一排片,一时上头给杠铃多加了两片。当下确实硬撑下来了,可你隐约觉得,明天的自己会恨今天的你。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "pool": "gym_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "硬刚到底,组数一个不少",
        "resultText": "你咬牙做完最后一组,当场还挺爽。结果第二天起床想去拿牙刷,发现胳膊抬不过肩,下楼梯像八十岁,全身肌肉用一种全新的方式提醒你它们的存在,整整酸了三天。",
        "effects": {
          "energy": -8,
          "health": -5,
          "stress": 4,
          "reputation": 2
        },
        "routeWeights": {
          "grind": 1,
          "chill": 1
        }
      },
      {
        "text": "见好就收,把重量减回去",
        "resultText": "你默默把那两片卸下来,按自己的节奏做完。没有围观者的喝彩,但第二天你能正常走路、正常拎中超的菜,这种平平无奇的健康反而让你很满足。",
        "effects": {
          "energy": -5,
          "health": 4,
          "adaptation": 3,
          "stress": -3
        },
        "routeWeights": {
          "chill": 1,
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_gym_pt_pitch",
    "title": "私教热情推销",
    "description": "你刚做完一组,一位身材完美的教练满脸笑容地飘了过来,先夸你姿势有潜力,紧接着话锋一转,开始跟你聊起一套十节课的私教方案。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "pool": "gym_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "心一软,买了几节体验课",
        "resultText": "你被那句你很有天赋彻底拿捏,刷卡买了五节课。教练确实专业,纠正了你一堆错误动作,但看着账户里少掉的那串数字,你安慰自己这是为身体健康做的投资,对,是投资。",
        "effects": {
          "money": -90,
          "health": 5,
          "career": 2,
          "stress": 3
        },
        "routeWeights": {
          "grind": 1,
          "social": 1
        }
      },
      {
        "text": "微笑婉拒,说自己先适应一下",
        "resultText": "你用最礼貌的英文把这套话术挡了回去,教练也很职业地祝你练得开心。你松了口气,回到角落继续看手机上免费的健身视频,省下的钱够你吃一周的好饭。",
        "effects": {
          "money": 20,
          "english": 2,
          "social": 3,
          "stress": -2
        },
        "routeWeights": {
          "survivor": 1,
          "chill": 1
        }
      },
      {
        "text": "顺势聊起来,问东问西",
        "resultText": "你索性把推销变成了免费咨询,连问了十几个动作问题。教练被你的好学逗笑了,临走还塞给你几个练背的小窍门,一分钱没花,你倒是收获了一段挺愉快的对话。",
        "effects": {
          "social": 5,
          "english": 3,
          "adaptation": 3,
          "energy": -4
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_gym_machine_fail",
    "title": "器械当众社死",
    "description": "你盯着一台不知道叫什么名字的器械研究了半天,鼓起勇气坐上去,结果一发力,配重片哐当一声砸下来,全场的目光齐刷刷转了过来。",
    "category": "emotion",
    "weight": 14,
    "oncePerGame": true,
    "pool": "gym_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "假装是在调整,淡定起身",
        "resultText": "你面不改色地起身,假装刚才只是在试重量,然后用最自然的步伐走去喝水,仿佛什么都没发生。心里其实社死到了顶点,但表面这份镇定,你觉得自己简直可以去演戏。",
        "effects": {
          "stress": 6,
          "adaptation": 3,
          "reputation": -2,
          "energy": -4
        },
        "routeWeights": {
          "survivor": 1,
          "chill": 1
        }
      },
      {
        "text": "厚脸皮问旁边的人怎么用",
        "resultText": "你索性转头问旁边那位老哥这玩意儿到底怎么调,对方很热心地手把手教了你一遍,还说自己第一次也砸过。一个尴尬瞬间反而换来一个新认识的健身房朋友,值了。",
        "effects": {
          "social": 5,
          "english": 3,
          "adaptation": 3,
          "stress": -3
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_gym_buddy",
    "title": "遇上健身搭子",
    "description": "你在做最后一组快撑不住时,旁边一个同样满头大汗的人冲你喊了句加油你可以的。你们对视一笑,从此每次来都互相打气。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "pool": "gym_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "约好以后一起练",
        "resultText": "你们交换了联系方式,约定每周固定时间一起来。有了人帮你数组数、帮你看姿势、还督促你别偷懒,你来健身房的频率肉眼可见地上去了,连情绪都跟着好起来。",
        "effects": {
          "social": 6,
          "health": 5,
          "homesick": -6,
          "energy": -4
        },
        "routeWeights": {
          "social": 2,
          "grind": 1
        }
      },
      {
        "text": "只是礼貌点头,继续各练各的",
        "resultText": "你回了个友好的微笑,但还是更习惯一个人戴着耳机练。健身对你来说是难得的独处时间,能在异国的喧嚣里安安静静地跟自己待一会儿,这种感觉也挺好。",
        "effects": {
          "stress": -4,
          "health": 3,
          "adaptation": 2,
          "energy": -4
        },
        "routeWeights": {
          "chill": 2,
          "homebound": 1
        }
      }
    ]
  },
  {
    "id": "inc_gym_card_dust",
    "title": "办卡三天打鱼",
    "description": "你翻钱包时摸到那张办了快一个月的健身卡,掐指一算总共只去过三次,一次还是为了拍照发朋友圈。账单提醒又来了,你盯着它陷入沉思。",
    "category": "life",
    "weight": 15,
    "oncePerGame": true,
    "pool": "gym_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 6
    },
    "choices": [
      {
        "text": "痛定思痛,给自己排死规律",
        "resultText": "你掏出手机把每周三次健身写进了日历,还设了闹钟。这一回你逼着自己坚持了下来,两周后照镜子时居然真看出了点变化,那张卡总算没白交钱。",
        "effects": {
          "health": 5,
          "energy": -6,
          "adaptation": 3,
          "stress": -3
        },
        "routeWeights": {
          "grind": 2,
          "scholar": 1
        }
      },
      {
        "text": "认栽,这钱就当交了智商税",
        "resultText": "你叹了口气,决定下个月就把卡退了,省下的预算拿去吃顿好的更实在。健身这件事大概真的不适合你,至少现在不适合,你心安理得地接受了这个现实。",
        "effects": {
          "money": 30,
          "stress": -4,
          "health": -3,
          "reputation": -2
        },
        "routeWeights": {
          "chill": 2,
          "homebound": 1
        }
      },
      {
        "text": "拉个室友一起练互相监督",
        "resultText": "你软磨硬泡把室友也拖下了水,俩人说好谁缺勤谁请奶茶。有了这层惩罚机制,你俩居然都乖乖去了,健身房成了你们留学生活里又一个共同的笑料和回忆。",
        "effects": {
          "social": 5,
          "health": 4,
          "homesick": -5,
          "money": -15
        },
        "routeWeights": {
          "social": 2,
          "grind": 1
        }
      }
    ]
  },
  {
    "id": "inc_explore_lost_pretty_street",
    "title": "迷路撞进一条好看的街",
    "description": "你本来只想去趟超市,结果跟着导航走神,拐进一条没听过的小街,两排彩色门、爬满墙的藤、一家飘咖啡香的独立书店,你站在街口愣了三秒,觉得这趟迷路赚了。",
    "category": "emotion",
    "weight": 14,
    "oncePerGame": true,
    "pool": "explore_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "钻进书店泡一下午",
        "resultText": "你窝在二手书堆里翻到一本旧版插画集,跟老板用磕巴的英语聊了两句,出门时天还亮着,心里却像被晒过一样暖。超市是没去成,但这条街你记一辈子。",
        "effects": {
          "money": -14,
          "energy": -5,
          "stress": -7,
          "homesick": -6,
          "english": 2,
          "adaptation": 3
        },
        "routeWeights": {
          "chill": 2,
          "scholar": 1
        }
      },
      {
        "text": "拍点照片就接着去超市",
        "resultText": "你拍了几张街景存进相册,告诉自己改天再来,然后老老实实拐回大路买菜。这条街成了你心里的一个秘密坐标,留着以后心情差时再来。",
        "effects": {
          "energy": -4,
          "stress": -4,
          "homesick": -3,
          "adaptation": 2
        },
        "routeWeights": {
          "grind": 1,
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_explore_caught_in_rain",
    "title": "被英国的雨偷袭",
    "description": "你出门时天明明是蓝的,逛到一半,英国的雨说下就下,没带伞,五分钟你就被淋成落汤鸡,头发贴在脸上,鞋里开始咕叽咕叽响。",
    "category": "life",
    "weight": 15,
    "oncePerGame": true,
    "pool": "explore_incidents",
    "cond": {
      "maxYear": 1
    },
    "choices": [
      {
        "text": "冲进路边咖啡馆躲雨",
        "resultText": "你点了杯最便宜的热茶,抱着杯子看玻璃上的雨痕,邻桌也是一群躲雨的人,你们相视苦笑。等雨停,你忽然觉得这种狼狈也挺像电影,只是主角现在很冷。",
        "effects": {
          "money": -8,
          "energy": -5,
          "stress": -3,
          "health": -3,
          "adaptation": 3,
          "homesick": -2
        },
        "routeWeights": {
          "chill": 2,
          "social": 1
        }
      },
      {
        "text": "认命淋雨硬走回家",
        "resultText": "你低着头一路狂奔,鞋袜全湿,到家第一件事是裹紧被子灌姜茶。这趟你算彻底学会了,在这片岛上,蓝天从来不能信,出门永远带伞。",
        "effects": {
          "energy": -7,
          "stress": 5,
          "health": -6,
          "adaptation": 4,
          "money": -3
        },
        "routeWeights": {
          "survivor": 2,
          "homebound": 1
        }
      }
    ]
  },
  {
    "id": "inc_explore_weekend_market_find",
    "title": "周末集市淘到宝",
    "description": "你逛着逛着撞上一片周末集市,二手摊、手作摊、烤肠香味一条街,你蹲在一个旧物摊前,翻出一盏成色很好的复古台灯,摊主开价低得让你心动。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "pool": "explore_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "砍价拿下这盏台灯",
        "resultText": "你鼓起勇气用英语磨了两句价,摊主笑着抹了零头,你抱着台灯回家,摆上书桌的那一刻,这间冷冰冰的出租屋忽然有了点家的样子。",
        "effects": {
          "money": -18,
          "energy": -4,
          "stress": -5,
          "english": 2,
          "adaptation": 4,
          "homesick": -5
        },
        "routeWeights": {
          "chill": 1,
          "survivor": 1,
          "homebound": 1
        }
      },
      {
        "text": "光看不买,买根烤肠走人",
        "resultText": "你提醒自己宿舍东西已经够多,只买了根热乎烤肠边走边吃,在人声鼎沸的集市里慢慢逛了一圈。钱包没瘪,心情却被这股烟火气填得满满的。",
        "effects": {
          "money": -5,
          "energy": -4,
          "stress": -6,
          "homesick": -3,
          "social": 2
        },
        "routeWeights": {
          "chill": 2
        }
      }
    ]
  },
  {
    "id": "inc_explore_perfect_photo",
    "title": "拍到一张封神照",
    "description": "你逛到河边的时候,正好赶上夕阳把整座老桥染成蜜糖色,你随手举起手机一拍,屏幕里那张照片美得不像是你拍的,手指悬在发圈的按钮上有点小激动。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "pool": "explore_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "精修一下发朋友圈",
        "resultText": "你蹲在长椅上调了半天滤镜,配了句不痛不痒的文案发出去。点赞一个接一个冒出来,家里人留言说你过得真好,你笑了笑,没说今天午饭只啃了片面包。",
        "effects": {
          "energy": -4,
          "stress": -3,
          "social": 5,
          "reputation": 3,
          "homesick": 2
        },
        "routeWeights": {
          "social": 2
        }
      },
      {
        "text": "存着自己看,不发了",
        "resultText": "你把照片设成手机壁纸,决定有些好看的瞬间留给自己就够了。回家路上你一直在偷偷瞄那张壁纸,像揣了个只有你知道的小秘密。",
        "effects": {
          "energy": -3,
          "stress": -5,
          "homesick": -4,
          "adaptation": 2
        },
        "routeWeights": {
          "chill": 2,
          "scholar": 1
        }
      }
    ]
  },
  {
    "id": "inc_explore_wallet_phone_scare",
    "title": "钱包手机虚惊一场",
    "description": "你在陌生街区逛得正起劲,伸手一摸口袋,空的,你心一沉,脑子里瞬间闪过挂失银行卡、报警、补办手机一整套噩梦流程,手心都开始冒汗。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "pool": "explore_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "强迫自己冷静原路找回去",
        "resultText": "你深吸一口气往回走,在十分钟前坐过的台阶上,手机正安安静静躺着。你一把抄起来贴在胸口,后怕得腿都软了,默默把钱包手机塞进最里层的口袋。",
        "effects": {
          "energy": -5,
          "stress": -2,
          "adaptation": 4,
          "health": -3,
          "reputation": 2
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "慌到直接折回家清点家当",
        "resultText": "你没敢再逛,一路小跑回家,翻遍背包才发现手机其实塞在外套内袋里,虚惊一场。这一吓让你彻底长了记性,从此出门前必拍三遍口袋。",
        "effects": {
          "energy": -7,
          "stress": 6,
          "health": -4,
          "adaptation": 3,
          "homesick": 3
        },
        "routeWeights": {
          "homebound": 2,
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_life_party_wall",
    "title": "隔墙的派对",
    "description": "你瘫在床上准备早睡,凌晨一点,隔壁室友的派对突然把音箱开到最大,低音震得你的床板都在跟着节拍跳。明天还有早八。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "pool": "life_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "穿好衣服去敲门理论",
        "resultText": "你站在走廊里酝酿了半天的英文,开门那一刻全忘了,只憋出一句 can you turn it down please。对方愣了一下,居然真的小声了。原来开口的恐惧比事情本身大得多。",
        "effects": {
          "english": 2,
          "social": 3,
          "stress": 4,
          "energy": -5,
          "adaptation": 3
        },
        "routeWeights": {
          "social": 1,
          "survivor": 1
        }
      },
      {
        "text": "戴上耳塞硬扛到天亮",
        "resultText": "你把耳塞塞到最深,枕头蒙在头上,在低音里数羊数到三百。睡是没睡好,但至少没跟人撕破脸。第二天顶着黑眼圈去上课。",
        "effects": {
          "stress": 6,
          "energy": -8,
          "health": -4,
          "homesick": 4
        },
        "routeWeights": {
          "chill": 1,
          "homebound": 1
        }
      },
      {
        "text": "发邮件投诉给宿管",
        "resultText": "你打开邮箱,措辞客气地写了封 noise complaint,抄送了 accommodation team。邮件发出去心里踏实了点,虽然今晚是指望不上了。三天后收到一封官方回复,说会跟进。",
        "effects": {
          "stress": 2,
          "energy": -4,
          "reputation": 2,
          "adaptation": 2
        },
        "routeWeights": {
          "grind": 1,
          "scholar": 1
        }
      }
    ]
  },
  {
    "id": "inc_life_parcel_pickup",
    "title": "包裹的下落",
    "description": "你窝在宿舍等一个追踪显示今天送达的包裹,刷新了一下午物流。傍晚门口贴了张卡片,说快递员没找到你,东西被放到了一公里外的取件点,今天再不取就退回。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "pool": "life_incidents",
    "cond": {
      "maxYear": 1
    },
    "choices": [
      {
        "text": "立刻冒着天黑出门去取",
        "resultText": "你裹上外套冲进暮色里,导航把你带到一家挂着 collection point 牌子的小卖部。老板从堆成山的包裹里翻了五分钟才找到你的,递过来时你像见到失散多年的亲人。值了。",
        "effects": {
          "energy": -6,
          "stress": -2,
          "adaptation": 3,
          "health": -2,
          "social": 2
        },
        "routeWeights": {
          "survivor": 1,
          "grind": 1
        }
      },
      {
        "text": "懒得动,等明天再说",
        "resultText": "你说服自己明天一早去,结果第二天睡过头,赶到时卡片上写的取件截止时间刚过。店员一摊手说已经退回去了。你站在门口,为这点路懊恼了一整天。",
        "effects": {
          "money": -25,
          "stress": 6,
          "energy": 2,
          "homesick": 3
        },
        "routeWeights": {
          "chill": 1,
          "homebound": 1
        }
      },
      {
        "text": "在群里问有没有人顺路帮取",
        "resultText": "你在宿舍楼的微信群发了条消息,半小时后一个住同栋的人说他正好路过,帮你捎了回来。你回送了一杯奶茶钱。原来在异乡,这种小忙最暖。",
        "effects": {
          "money": -8,
          "social": 5,
          "stress": -3,
          "adaptation": 2,
          "homesick": -4
        },
        "routeWeights": {
          "social": 1
        }
      }
    ]
  },
  {
    "id": "inc_life_neighbour_invite",
    "title": "邻居的邀约",
    "description": "周五晚你正打算一个人煮碗面看剧,对门的本地室友探进头来,说他们今晚有个小 house party,问你要不要一起,反正就在客厅。你犹豫了,社恐和好奇在心里打架。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "pool": "life_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "答应下来,带瓶饮料去",
        "resultText": "你从冰箱拿了瓶买来一直没喝的气泡水当伴手礼。前二十分钟尴尬得想原地消失,直到有人聊起你的家乡菜,话题一下打开了。你磕磕绊绊讲了半天,笑声真实得不像装的。",
        "effects": {
          "social": 6,
          "english": 3,
          "energy": -5,
          "homesick": -5,
          "adaptation": 3
        },
        "routeWeights": {
          "social": 2,
          "survivor": 1
        }
      },
      {
        "text": "礼貌婉拒,说改天一定",
        "resultText": "你笑着说今晚有点累,下次一定。关上门,你松了口气,又有点说不清的失落。面照样香,剧照样好看,只是客厅传来的笑声让宿舍显得格外安静。",
        "effects": {
          "stress": -2,
          "energy": 3,
          "social": -2,
          "homesick": 3
        },
        "routeWeights": {
          "chill": 1,
          "homebound": 1
        }
      },
      {
        "text": "去露个脸就回房间",
        "resultText": "你计划只待半小时,结果在门口端着杯子站着,谁也不认识,英文又插不上话。坚持了二十分钟后你借口要打视频电话溜回房间。算是去过了,但没真正融进去。",
        "effects": {
          "social": 2,
          "english": 1,
          "stress": 3,
          "energy": -3,
          "adaptation": 2
        },
        "routeWeights": {
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_life_cold_snap",
    "title": "舍不得开的暖气",
    "description": "一夜之间气温断崖式跳水,你裹着被子还是冷得手指发僵。墙上的暖气阀触手可及,可你想起 council tax 之外那笔会跳表的 heating 账单,手又缩了回去。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "pool": "life_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "心一横,把暖气开了",
        "resultText": "你拧开阀门,十分钟后房间暖得能脱掉外套,人也活过来了。账单是要肉疼一下,可你告诉自己,人在异乡,别为难自己的身体。这笔钱花得不冤。",
        "effects": {
          "money": -35,
          "health": 5,
          "stress": -4,
          "energy": 3,
          "homesick": -3
        },
        "routeWeights": {
          "chill": 1,
          "survivor": 1
        }
      },
      {
        "text": "灌热水袋多穿两件硬扛",
        "resultText": "你翻出热水袋,套上两件卫衣外加一条毛毯,把自己裹成一只蚕。靠着这套土法子,你硬是没开暖气过了一晚。省是省下来了,就是手脚一整夜都没真正暖过。",
        "effects": {
          "money": 5,
          "health": -5,
          "energy": -4,
          "stress": 4,
          "homesick": 4
        },
        "routeWeights": {
          "grind": 1,
          "homebound": 1
        }
      },
      {
        "text": "去中超买顿火锅暖身子",
        "resultText": "你顶着寒风走到中超,买了火锅底料和一堆菜,回宿舍支起小锅。热气腾腾一顿下肚,从胃暖到指尖,室友闻着味也凑过来。冷归冷,这顿火锅把孤独也一起涮没了。",
        "effects": {
          "money": -22,
          "health": 3,
          "social": 4,
          "homesick": -6,
          "energy": -3
        },
        "routeWeights": {
          "social": 1,
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_life_weekend_sleepin",
    "title": "睡到下午的周末",
    "description": "周六你没设闹钟,一觉睁眼,窗外光线已经斜了,手机显示下午两点半。半个白天就这么没了,负罪感和被窝的温暖在你身上同时发作。",
    "category": "emotion",
    "weight": 12,
    "oncePerGame": true,
    "pool": "life_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "翻身起来抢救剩下的半天",
        "resultText": "你强迫自己爬起来洗漱,出门买了菜又去图书馆坐了两小时。虽然起步晚,但傍晚回来时你觉得这天没全废,心里那点负罪感也散了。累积的疲惫总算还了一部分。",
        "effects": {
          "energy": 3,
          "gpa": 2,
          "stress": -2,
          "adaptation": 2,
          "health": 2
        },
        "routeWeights": {
          "grind": 1,
          "scholar": 1
        }
      },
      {
        "text": "理直气壮再躺一会儿",
        "resultText": "你跟自己说,这一周连轴转,睡个懒觉是应得的。于是又赖了一小时,刷手机刷到天黑。被窝是真舒服,可拉开窗帘看见外面已经黑透时,那种虚度感还是悄悄爬上来。",
        "effects": {
          "energy": 5,
          "stress": 3,
          "gpa": -2,
          "homesick": 4,
          "health": -2
        },
        "routeWeights": {
          "chill": 2,
          "homebound": 1
        }
      },
      {
        "text": "干脆跟家里视频补个觉",
        "resultText": "你顺手拨了视频回家,那边正好是晚饭时间。爸妈端着碗在镜头前唠家常,你窝在被子里有一搭没一搭地应着。半天是没干成事,可这份踏实,比赶任何 deadline 都解乏。",
        "effects": {
          "homesick": -8,
          "stress": -4,
          "energy": 2,
          "social": 2,
          "health": 2
        },
        "routeWeights": {
          "homebound": 2,
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_spend_black_friday_haul",
    "title": "黑五购物车爆了",
    "description": "你本来只想趁black friday买条数据线,结果界面一片红字打折标签看得人心跳加速,等你回过神,购物车里已经躺着一个空气炸锅、两件用不上的卫衣和一个号称助眠的香薰机。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "pool": "spending_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "全部下单,反正都打折等于省钱",
        "resultText": "包裹一个接一个寄到,室友看你像看一个商业奇迹。空气炸锅用了两次就吃灰,但那条卫衣确实暖,你说服自己这叫消费降级前的最后一次纵容。",
        "effects": {
          "money": -95,
          "stress": 5,
          "homesick": -4,
          "energy": -4
        },
        "routeWeights": {
          "chill": 2
        }
      },
      {
        "text": "只留数据线,其余狠心清空",
        "resultText": "你一件件点删除,手有点抖,但清空那一刻意外地清爽。这个月的预算保住了,你给自己发了条朋友圈,成年人的快乐是看着购物车空掉。",
        "effects": {
          "money": -8,
          "stress": -4,
          "adaptation": 3,
          "reputation": 2
        },
        "routeWeights": {
          "survivor": 3,
          "grind": 1
        }
      },
      {
        "text": "拉室友一起拼单分摊运费",
        "resultText": "你俩凑单凑到免邮门槛,顺手帮ta带了袋咖啡豆。东西到的那天像过年,虽然算下来也没省多少,但有人一起拆快递这件事本身就值回票价。",
        "effects": {
          "money": -55,
          "social": 5,
          "homesick": -5,
          "energy": -4
        },
        "routeWeights": {
          "social": 3
        }
      }
    ]
  },
  {
    "id": "inc_spend_return_hell",
    "title": "退货退到崩溃",
    "description": "你买的鞋码不对想退,结果发现要先线上申请退货标签,再自己打印,再走二十分钟去指定的取货点排队寄出,英国的退货流程像在闯关,你站在打印店门口怀疑人生。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "pool": "spending_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "一步步走完流程,绝不放弃这笔钱",
        "resultText": "你在图书馆蹭打印,在取货点排了半小时队,全程用蹩脚但坚定的英文问清每一步。钱退回来那天你长舒一口气,这趟下来,你对英国的快递系统已经门儿清。",
        "effects": {
          "money": 35,
          "energy": -8,
          "english": 3,
          "adaptation": 4
        },
        "routeWeights": {
          "survivor": 3,
          "grind": 1
        }
      },
      {
        "text": "嫌麻烦,鞋留下当家居拖鞋",
        "resultText": "你把不合脚的鞋往墙角一塞,告诉自己穿厚袜子就行。钱是亏了,但你省下了一整个下午的折腾,有时候时间比那几十镑值钱,你这么安慰自己。",
        "effects": {
          "money": -5,
          "stress": 4,
          "energy": -4,
          "homesick": 3
        },
        "routeWeights": {
          "chill": 2
        }
      },
      {
        "text": "在中国留学生群里转手卖掉",
        "resultText": "你拍了张图发群里,配文九成新忍痛出。半小时就有人私你,约在中超门口一手交钱一手交鞋。损失降到最低,你还顺便认识了个同城的人。",
        "effects": {
          "money": 18,
          "social": 4,
          "reputation": 2,
          "energy": -4
        },
        "routeWeights": {
          "survivor": 2,
          "social": 2
        }
      }
    ]
  },
  {
    "id": "inc_spend_ghost_subscription",
    "title": "幽灵订阅扣三月",
    "description": "你查银行流水准备记账,发现一个早就忘了的视频会员每月默默扣着钱,翻记录一看,这玩意儿已经悄无声息地从你卡里搬走三个月的钱,而你一集都没看。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "pool": "spending_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 8
    },
    "choices": [
      {
        "text": "立刻取消,顺手清查所有自动续费",
        "resultText": "你一口气退掉了两个会员和一个根本想不起来注册过的健身app。账单瘦了一圈,你把所有订阅记进了备忘录,从此每月一号雷打不动地查一遍,理财这事算是被生生逼出来了。",
        "effects": {
          "money": 12,
          "stress": -4,
          "adaptation": 4,
          "career": 2
        },
        "routeWeights": {
          "survivor": 3,
          "scholar": 1
        }
      },
      {
        "text": "气归气,但留着,说不定哪天看",
        "resultText": "你盯着扣款记录骂了句脏话,手指悬在取消键上又收了回来,想着考完试一定要把片单刷个够本。结果你也清楚,这会员大概率还会继续幽灵下去。",
        "effects": {
          "money": -10,
          "stress": 5,
          "energy": -4,
          "homesick": 3
        },
        "routeWeights": {
          "chill": 2
        }
      },
      {
        "text": "发邮件要求退还误扣的三个月",
        "resultText": "你翻出客服邮箱,用模板句式写了封不卑不亢的申诉信,附上从未登录的记录。对方居然真退了一半,你盯着到账短信,第一次觉得英文写得好也能直接换成钱。",
        "effects": {
          "money": 16,
          "english": 3,
          "reputation": 2,
          "energy": -5
        },
        "routeWeights": {
          "grind": 2,
          "career": 1
        }
      }
    ]
  },
  {
    "id": "inc_spend_cant_let_go",
    "title": "舍不得最后还是买",
    "description": "你在charity shop逛到一件成色极好的旧风衣,标价不贵但也不算白菜,你来回试了三次,挂回去又走回来,纠结到店员都开始注意你,最后还是没忍住。",
    "category": "emotion",
    "weight": 14,
    "oncePerGame": true,
    "pool": "spending_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "买了,这种缘分错过就没了",
        "resultText": "你抱着风衣走出店门,阳光正好,你套上它走在石板路上,觉得自己像走进了某部英伦电影。这件衣服后来成了你拍照的标配,每次穿都不后悔。",
        "effects": {
          "money": -28,
          "stress": -5,
          "homesick": -5,
          "reputation": 3
        },
        "routeWeights": {
          "chill": 3,
          "social": 1
        }
      },
      {
        "text": "硬是放下,空手离开",
        "resultText": "你把风衣挂回原位,深吸一口气走出店门,告诉自己这个月预算已经超了。可接下来一整周你都在想它,理智上你赢了,情绪上你输得很彻底。",
        "effects": {
          "money": 0,
          "stress": 6,
          "homesick": 4,
          "adaptation": 3
        },
        "routeWeights": {
          "survivor": 2,
          "grind": 1
        }
      },
      {
        "text": "发给家里人视频参谋一下",
        "resultText": "你举着手机绕风衣转了一圈,家里人在屏幕那头乐呵呵地说好看就买。你这才痛快下单,挂电话时心里暖暖的,买的不只是衣服,还有那通跨越时区的陪伴。",
        "effects": {
          "money": -28,
          "homesick": -8,
          "social": 3,
          "energy": -3
        },
        "routeWeights": {
          "homebound": 3
        }
      }
    ]
  },
  {
    "id": "inc_spend_exchange_rate_dip",
    "title": "汇率一夜亏火锅",
    "description": "你正打算从家里换笔生活费过来,顺手刷了下汇率,发现一夜之间英镑涨了一截,同样的人民币到手少了一截,你默默算了算,这波亏的钱够吃一顿火锅了。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "pool": "spending_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 6
    },
    "choices": [
      {
        "text": "认栽,该换还得换,生活要紧",
        "resultText": "你叹口气还是把钱换了,毕竟房租不等人。这顿亏掉的火锅钱你记在心里,转头开始研究哪个换汇渠道手续费低,被汇率上了一课,也算交了学费。",
        "effects": {
          "money": -40,
          "stress": 5,
          "adaptation": 4,
          "career": 2
        },
        "routeWeights": {
          "survivor": 3
        }
      },
      {
        "text": "再等等,赌它跌回来",
        "resultText": "你忍住没换,天天盯着汇率曲线像看股票。结果它不跌反涨,你这才慌慌张张地换了,亏得比一开始还多。你删掉了那个换汇app,告诉自己再也不赌了。",
        "effects": {
          "money": -55,
          "stress": 8,
          "energy": -5,
          "homesick": 4
        },
        "routeWeights": {
          "chill": 1
        }
      },
      {
        "text": "在留学生群问大家怎么换最划算",
        "resultText": "你在群里一问,立马有热心的人甩来一套攻略,什么时段换、走哪个平台、怎么凑手续费减免。你照着操作,虽然这波还是小亏,但学到的法子够你用一整年。",
        "effects": {
          "money": -32,
          "social": 4,
          "adaptation": 3,
          "english": 2
        },
        "routeWeights": {
          "social": 2,
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_romance_sudden_spark",
    "title": "气氛突然就上来了",
    "description": "你和暧昧的对象坐在沙发上看片,ta把头轻轻靠了过来,屏幕上的字幕你一个都没看进去,整颗心在胸口疯狂打鼓。",
    "category": "emotion",
    "weight": 13,
    "oncePerGame": true,
    "pool": "romance_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 6
    },
    "choices": [
      {
        "text": "顺着这个气氛,把手伸过去",
        "resultText": "你假装很自然地把手覆上去,ta没有躲,反而回握了一下。那一晚你们什么片都没看完,但你觉得整个英国的冬天忽然都不冷了。回宿舍路上你一个人傻笑,被夜班巴士司机从后视镜里看了好几眼。",
        "effects": {
          "social": 6,
          "homesick": -8,
          "stress": -4,
          "energy": -4,
          "health": 3
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        },
        "setFlags": {
          "romance_progressed": true
        }
      },
      {
        "text": "心跳太快,假装去倒水缓一缓",
        "resultText": "你猛地站起来说我去倒杯水,结果在厨房对着水龙头站了整整两分钟平复呼吸。回来时气氛已经凉了一半,ta若有所思地看了你一眼。你躺在床上反复回放那两分钟,确信自己是全世界最没出息的人。",
        "effects": {
          "stress": 5,
          "social": 2,
          "homesick": -3,
          "energy": -4,
          "adaptation": 2
        },
        "routeWeights": {
          "chill": 1,
          "grind": 1
        }
      },
      {
        "text": "脑子一热脱口说出喜欢ta",
        "resultText": "话冲出口你自己都愣住了,房间安静得能听见冰箱的嗡嗡声。ta慢慢笑出来,说我也是。你这一年第一次觉得,鼓起的勇气没有白费,虽然耳朵到现在还烫着。",
        "effects": {
          "social": 7,
          "homesick": -10,
          "stress": -6,
          "reputation": 3,
          "energy": -5
        },
        "routeWeights": {
          "social": 2
        },
        "setFlags": {
          "romance_confessed": true
        }
      }
    ]
  },
  {
    "id": "inc_romance_blindside_confession",
    "title": "被当面表白了",
    "description": "你以为只是普通的一起吃饭,饭后ta忽然认真地看着你,说有件事憋了很久。你的勺子停在半空,脑子一片空白。",
    "category": "social",
    "weight": 12,
    "oncePerGame": true,
    "pool": "romance_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 8
    },
    "choices": [
      {
        "text": "心动,当场答应试试看",
        "resultText": "你说好啊,我们试试。ta整个人都亮了起来,抢着把账单付了。你们从餐厅一路走回去,聊到路灯一盏盏亮起来,那种久违的被人放在心上的感觉,把异乡的孤单冲淡了不少。",
        "effects": {
          "social": 7,
          "homesick": -10,
          "stress": -4,
          "energy": -4,
          "reputation": 2
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        },
        "setFlags": {
          "romance_dating": true
        }
      },
      {
        "text": "没准备好,坦白说想先做朋友",
        "resultText": "你深吸一口气说,谢谢你这么认真,但我现在更想专心读完这个硕士。ta愣了一下,点点头说理解。气氛有点尴尬,但你松了口气,知道自己没有为了不孤单而委屈两个人。",
        "effects": {
          "social": 3,
          "gpa": 2,
          "stress": 4,
          "homesick": 3,
          "career": 2
        },
        "routeWeights": {
          "grind": 1,
          "scholar": 1
        }
      },
      {
        "text": "太慌了,先借口说要回去赶due",
        "resultText": "你脱口说我那个论文明天就要交了我得先走,然后落荒而逃。回到房间你对着根本没开始写的due发呆,满脑子都是刚才ta失落的表情,深刻意识到逃避并不能解决任何问题。",
        "effects": {
          "stress": 7,
          "social": -3,
          "homesick": 5,
          "energy": -4,
          "gpa": 1
        },
        "routeWeights": {
          "homebound": 1,
          "grind": 1
        }
      }
    ]
  },
  {
    "id": "inc_romance_first_date_silence",
    "title": "第一次约会全程尬聊",
    "description": "你和ta约在市中心的咖啡馆,正式的第一次约会。可坐下来才发现,昨晚精心准备的十几个话题,此刻一个都想不起来,你们之间只剩下搅咖啡的声音。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "pool": "romance_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "干脆坦白说自己其实很紧张",
        "resultText": "你笑着说,实话讲我紧张到话题全忘了。ta噗一声笑出来,说我也是,还偷偷写在手机备忘录里了。两个人对着两份尴尬的小抄笑成一团,后面反而越聊越顺,最后是被店员提醒打烊才走。",
        "effects": {
          "social": 6,
          "homesick": -7,
          "stress": -4,
          "english": 2,
          "energy": -4
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        },
        "setFlags": {
          "romance_progressed": true
        }
      },
      {
        "text": "硬找话题,聊起天气和学业",
        "resultText": "你扯起了英国永远聊不完的天气,又聊到各自的due。气氛是没冷场,但也实在不算热络,像两个第一天认识的同组组员。散场时你们礼貌地说下次再约,你也不确定还有没有下次。",
        "effects": {
          "social": 3,
          "english": 3,
          "stress": 2,
          "energy": -4,
          "adaptation": 2
        },
        "routeWeights": {
          "grind": 1,
          "chill": 1
        }
      },
      {
        "text": "提议换个场子,去逛旁边的市集",
        "resultText": "你说要不别坐着了,去旁边的周末市集逛逛。边走边看反而有了说不完的话,你们为一个奇丑的二手陶瓷杯笑了五分钟,你还花了三镑把它买了下来当纪念。坐着尬聊的魔咒,一站起来就破了。",
        "effects": {
          "money": -3,
          "social": 5,
          "homesick": -6,
          "energy": -5,
          "adaptation": 3
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        },
        "setFlags": {
          "romance_progressed": true
        }
      }
    ]
  },
  {
    "id": "inc_romance_left_on_read",
    "title": "消息半天没回",
    "description": "你给暧昧的对象发了条精心斟酌的消息,显示已读,然后就没有然后了。一个小时过去,你已经在脑内把ta讨厌你的一百种理由都演了一遍。",
    "category": "emotion",
    "weight": 14,
    "oncePerGame": true,
    "pool": "romance_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "放下手机,先去做自己的事",
        "resultText": "你把手机扣在桌上,逼自己去图书馆赶了两个钟头的reading。回来一看,ta早就回了,说刚在打工没看手机,还问你晚上要不要一起吃饭。你对着屏幕又好气又好笑,白白内耗了一下午。",
        "effects": {
          "gpa": 3,
          "stress": -4,
          "energy": -4,
          "social": 3,
          "adaptation": 2
        },
        "routeWeights": {
          "grind": 2,
          "scholar": 1
        }
      },
      {
        "text": "忍不住又补发一条追问",
        "resultText": "你没忍住又发了句在忙吗,发完就后悔了,觉得自己显得好卑微。其实ta只是在赶ddl,看到两条消息反而有点压力。这场单方面的兵荒马乱,从头到尾只发生在你一个人的脑子里。",
        "effects": {
          "stress": 7,
          "homesick": 4,
          "social": -2,
          "energy": -4,
          "reputation": -2
        },
        "routeWeights": {
          "homebound": 1,
          "survivor": 1
        }
      },
      {
        "text": "找室友吐槽,转移注意力",
        "resultText": "你跑去敲室友的门,把这条已读不回的破事翻来覆去讲了三遍。室友一边煮泡面一边听你内耗,最后给你下了诊断,说你这不叫喜欢,这叫缺乏安全感。你被一语戳中,笑着把焦虑吃进了那碗面里。",
        "effects": {
          "social": 5,
          "stress": -5,
          "homesick": -5,
          "energy": -4,
          "health": -2
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_romance_friend_setup",
    "title": "朋友热心给你撮合",
    "description": "聚餐时你那位自封红娘的朋友凑过来,神神秘秘地说有个人特别适合你,已经帮你们建好群了。你还没反应过来,手机就震了一下,对方发来一句你好。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "pool": "romance_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 7
    },
    "choices": [
      {
        "text": "顺水推舟,礼貌聊几句看看",
        "resultText": "你想着多认识个人也好,就客气地聊了起来。对方意外地有趣,你们居然为同一部冷门剧聊到深夜。你给红娘朋友发了个点赞表情,ta回了个早就跟你说了的得意表情。",
        "effects": {
          "social": 6,
          "homesick": -6,
          "stress": -3,
          "english": 2,
          "energy": -4
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        },
        "setFlags": {
          "romance_progressed": true
        }
      },
      {
        "text": "婉拒,跟朋友说想自己慢慢来",
        "resultText": "你私下跟朋友说,谢谢你的好意,但被这样安排着认识总觉得有点赶。朋友撇撇嘴说真没情趣,还是把群退了。你给对方道了歉,松一口气,觉得有些缘分还是不要硬凑比较好。",
        "effects": {
          "social": 2,
          "stress": 3,
          "homesick": 2,
          "gpa": 2,
          "career": 2
        },
        "routeWeights": {
          "grind": 1,
          "scholar": 1
        }
      },
      {
        "text": "起哄反将一军,撮合红娘自己",
        "resultText": "你坏笑着说,你这么会牵线,怎么不先把自己嫁出去。一桌人立刻把火力转向红娘,ta脸涨得通红连连摆手。那个被撮合的对象也在群里发了个吃瓜表情,一来二去,大家反而都笑熟了。",
        "effects": {
          "social": 7,
          "homesick": -7,
          "stress": -4,
          "reputation": 3,
          "energy": -4
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_travel_railstrike",
    "title": "罢工困在站台",
    "description": "你拖着行李赶早班车去旅行,刚到站台,广播一遍遍重复 strike action,屏幕上整排车次全变成红色的 Cancelled。你和一群同样懵掉的人站在风里,谁也没料到出门第一站就是英国国铁。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "pool": "travel_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "认栽改签下一班能走的车",
        "resultText": "你在 app 上反复刷,终于抢到三小时后一班绕路的车,补的差价让你肉疼,但好歹当天能到。坐下来那刻你想,原来罢工不是新闻里的词,是你真金白银的旅费。",
        "effects": {
          "money": -45,
          "stress": 6,
          "energy": -5,
          "adaptation": 3
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "干脆退票,这趟旅行改天再说",
        "resultText": "你站在原地办了退票,拖着行李原路走回住处。计划泡汤心里空落落的,可省下的钱和力气是实打实的,你安慰自己英国的山水又不会跑。",
        "effects": {
          "money": 20,
          "stress": 4,
          "homesick": 4,
          "energy": -4
        },
        "routeWeights": {
          "chill": 1,
          "homebound": 1
        }
      },
      {
        "text": "找站台上同样滞留的人拼个长途大巴",
        "resultText": "你壮着胆子搭话,几个陌生人很快凑成一队,一起订了 coach。一路上大家吐槽国铁吐槽得热火朝天,你的英文在抱怨里练得飞快,陌生人成了半天的旅伴。",
        "effects": {
          "money": -25,
          "social": 5,
          "english": 2,
          "adaptation": 4,
          "stress": -2
        },
        "routeWeights": {
          "social": 2,
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_travel_baggagefee",
    "title": "廉航行李被当场宰",
    "description": "你订了几十镑的廉航去欧洲玩,到了登机口,地勤拿尺子一比你的随身箱,说超了两厘米。补行李费的那个数字弹出来,比你的机票还贵,你站在队伍最前面进退两难。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "pool": "travel_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 6
    },
    "choices": [
      {
        "text": "咬牙刷卡,钱包认命",
        "resultText": "你刷了卡,心在滴血。落地后你发誓这辈子再也不信廉航的低价机票,所谓便宜全在你看不见的地方等着你。这笔学费,贵得很清醒。",
        "effects": {
          "money": -55,
          "stress": 7,
          "energy": -4
        },
        "routeWeights": {
          "chill": 1
        }
      },
      {
        "text": "当场把箱子里的衣服往身上套",
        "resultText": "你顾不上形象,把两件外套一条围巾全裹身上,口袋塞满充电宝和洗漱包,箱子瞬间瘪了下去。地勤憋着笑放你过了,你顶着一身行头登机,省下的钱够你在当地吃三顿好的。",
        "effects": {
          "money": -10,
          "stress": 3,
          "adaptation": 5,
          "reputation": -1,
          "energy": -5
        },
        "routeWeights": {
          "survivor": 3
        }
      },
      {
        "text": "把超重的东西现场送给排队的陌生人",
        "resultText": "你回头问后面的人要不要,几样小东西就这么散了出去,大家笑作一团。你登机时箱子合规了,还收获了一句句 thank you,这趟旅行的开头意外地暖。",
        "effects": {
          "money": -5,
          "social": 4,
          "english": 2,
          "homesick": -3,
          "energy": -3
        },
        "routeWeights": {
          "social": 2
        }
      }
    ]
  },
  {
    "id": "inc_travel_scam",
    "title": "欧洲街头的小骗局",
    "description": "你在欧洲老城闲逛,一个热情的人突然往你手腕上系了根编织绳,嘴里说着祝福,系完立刻伸手要钱。同一秒你余光瞥见另一个人正贴近你的背包,你后背一凉。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "pool": "travel_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 8
    },
    "choices": [
      {
        "text": "立刻护住包,沉脸快步走开",
        "resultText": "你手按住背包拉链,板着脸大步穿过广场,背后的吆喝越来越远。心跳了好一阵才平复,你庆幸自己反应快,旅行攻略里看过的套路真不是吓唬人。",
        "effects": {
          "stress": 6,
          "adaptation": 5,
          "energy": -4,
          "social": -2
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "拉不下脸,塞了几块零钱了事",
        "resultText": "你心一软掏了点硬币想脱身,对方却嫌少缠着不放,你又添了几枚才走脱。回头想想其实没多少钱,但被人精准拿捏的那种感觉,比丢钱更不舒服。",
        "effects": {
          "money": -15,
          "stress": 5,
          "reputation": -1,
          "energy": -3
        },
        "routeWeights": {
          "chill": 1
        }
      },
      {
        "text": "笑着用刚学的当地话回怼一句",
        "resultText": "你蹦出一句临时学的当地短语,带着笑摆摆手,对方愣了一下竟也笑了,识趣地放过你去找下一个游客。你边走边得意,语言这东西关键时刻真能当盾牌使。",
        "effects": {
          "english": 2,
          "social": 3,
          "adaptation": 4,
          "stress": -2,
          "reputation": 2
        },
        "routeWeights": {
          "social": 2,
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_travel_lastbus",
    "title": "玩太嗨错过末班",
    "description": "你在异地玩到深夜,夜景太美舍不得走,等回过神冲到站台,末班的公共交通刚好甩着尾灯开走。手机显示打车要小一百镑,四下里店铺一家家拉下卷帘门,你站在陌生的街角,一时不知该往哪走。",
    "category": "emotion",
    "weight": 12,
    "oncePerGame": true,
    "pool": "travel_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 10
    },
    "choices": [
      {
        "text": "咬牙叫车,安全第一",
        "resultText": "你叫了车,看着计价器心疼,但深夜独自流落在陌生街头的风险,不是几十镑能赌的。回到住处锁好门那一刻,你长出一口气,有些钱花了就是买个踏实。",
        "effects": {
          "money": -75,
          "stress": 4,
          "health": 2,
          "energy": -4
        },
        "routeWeights": {
          "chill": 1,
          "homebound": 1
        }
      },
      {
        "text": "找家通宵快餐店硬熬到天亮头班车",
        "resultText": "你钻进一家二十四小时营业的快餐店,要杯热饮占了角落的座,刷着手机硬撑到天蒙蒙亮。一夜没睡腰酸背痛,但省下的车钱和这段狼狈的回忆,日后竟成了最常讲的段子。",
        "effects": {
          "money": -8,
          "energy": -10,
          "health": -5,
          "stress": 6,
          "adaptation": 4
        },
        "routeWeights": {
          "survivor": 3
        }
      },
      {
        "text": "硬着头皮敲青旅前台问有没有空床",
        "resultText": "你顺着导航摸到一家亮着灯的青旅,前台还真有张退订的空床。临时多花的住宿费让你肉疼,但能躺下睡个安稳觉,半夜的慌张总算落了地。",
        "effects": {
          "money": -30,
          "energy": -3,
          "stress": -2,
          "adaptation": 3,
          "social": 2
        },
        "routeWeights": {
          "survivor": 1,
          "social": 1
        }
      }
    ]
  },
  {
    "id": "inc_travel_hostelfriend",
    "title": "青旅遇到的陌生人",
    "description": "你住进一家便宜青旅,同屋床位坐着个同样独自旅行的陌生人。一句简单的 where are you from 之后,两个人竟从行程聊到家乡聊到读书时的烦恼,墙上的时钟不知不觉过了半夜。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "pool": "travel_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "约 ta 明天一起搭伴逛一天",
        "resultText": "你们一拍即合,第二天结伴把这座城走了个遍,有人分担订票拍照,旅途的孤单一下子被填满。临别加了联系方式,你忽然觉得一个人出门也没那么怕了。",
        "effects": {
          "social": 6,
          "english": 3,
          "homesick": -8,
          "energy": -5,
          "money": -10
        },
        "routeWeights": {
          "social": 3
        }
      },
      {
        "text": "聊得开心但还是各自按原计划走",
        "resultText": "你们聊到很晚,第二天却默契地没提同行,各自背包出门。这种萍水相逢点到为止的舒服,你慢慢品出味道,有些缘分留在那一晚刚刚好。",
        "effects": {
          "social": 3,
          "english": 2,
          "homesick": -4,
          "stress": -3,
          "energy": -3
        },
        "routeWeights": {
          "chill": 2
        }
      },
      {
        "text": "聊太晚困得不行,先去睡",
        "resultText": "你眼皮打架,客气地说了句改天再聊就爬上床。第二天醒来 ta 已经退房走了,床头留了张写着旅途愉快的小纸条。你笑笑收进口袋,养足了精神接着自己的行程。",
        "effects": {
          "energy": 5,
          "health": 3,
          "social": 2,
          "homesick": -3
        },
        "routeWeights": {
          "homebound": 1,
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_admin_brp_lost",
    "title": "BRP 卡寄丢了",
    "description": "你在办行政材料的时候才反应过来,那张该到的 BRP 卡到现在还没影。一通电话打过去,客服让你转接,转接完又是另一段排队音乐,绕了三圈还在原地。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "pool": "admin_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "硬着头皮一个个部门追下去",
        "resultText": "你把每个客服的工号都记了下来,前后跟了一下午,总算问到卡卡在分拣中心,改寄到了取件点。事办成了,人也快被排队音乐逼疯。",
        "effects": {
          "english": 3,
          "adaptation": 4,
          "stress": 7,
          "energy": -8,
          "reputation": 2
        },
        "routeWeights": {
          "survivor": 2,
          "grind": 1
        }
      },
      {
        "text": "先发邮件留个书面记录再说",
        "resultText": "你写了封措辞工整的邮件,把时间线列得清清楚楚,顺手抄送了学校 international office。三天后对方回了,有据可依,心里踏实多了。",
        "effects": {
          "english": 3,
          "adaptation": 3,
          "stress": -2,
          "energy": -4
        },
        "routeWeights": {
          "scholar": 1,
          "grind": 1
        }
      },
      {
        "text": "实在不想弄了,放一放",
        "resultText": "你把这事往后拖,告诉自己明天再说。结果接下来几天一想起来就堵心,该办的还得办。",
        "effects": {
          "stress": 6,
          "homesick": 4,
          "energy": -4
        },
        "routeWeights": {
          "chill": 1,
          "homebound": 1
        }
      }
    ]
  },
  {
    "id": "inc_admin_visa_missing_page",
    "title": "续签缺一页",
    "description": "你在整理续签材料的时候,系统冷冰冰地提示有一份文件缺页。你翻遍文件夹,确实少了那张该死的资金证明,而预约的时段就在后天。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "pool": "admin_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "连夜补材料,重新约个最近的号",
        "resultText": "你熬到半夜把缺的那页补齐,刷新页面抢到三天后一个新号。材料齐了,代价是这一晚基本没睡。",
        "effects": {
          "adaptation": 4,
          "stress": 6,
          "energy": -10,
          "health": -4,
          "visa": 3
        },
        "routeWeights": {
          "survivor": 2,
          "grind": 1
        }
      },
      {
        "text": "花钱约加急,图个安心",
        "resultText": "你咬牙选了加急通道,钱包瞬间瘪了一圈,但材料一次过,悬着的心终于落地。",
        "effects": {
          "money": -90,
          "stress": -4,
          "adaptation": 3,
          "visa": 3
        },
        "routeWeights": {
          "chill": 1,
          "survivor": 1
        }
      },
      {
        "text": "先问问学长学姐怎么处理的",
        "resultText": "群里一问,好几个人都踩过同一个坑,手把手教你哪页能后补、哪页不能。少走了一堆弯路,也认识了几个同病相怜的人。",
        "effects": {
          "social": 5,
          "adaptation": 4,
          "stress": -2,
          "english": 2
        },
        "routeWeights": {
          "social": 2
        }
      }
    ]
  },
  {
    "id": "inc_admin_gp_form",
    "title": "注册 GP 填表",
    "description": "你坐在 GP 诊所的前台,手里那张注册表格密密麻麻全是看不太懂的缩写。地址要写过去三年的,病史栏的单词你得边查边填,一支笔写到怀疑人生。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "pool": "admin_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "一格一格查清楚再填",
        "resultText": "你把每个不认识的词都查了一遍,顺带学会了一堆医疗英语。表格填得工工整整,前台小哥还夸了句 very thorough。",
        "effects": {
          "english": 3,
          "adaptation": 4,
          "stress": 4,
          "energy": -6,
          "reputation": 2
        },
        "routeWeights": {
          "scholar": 1,
          "grind": 1
        }
      },
      {
        "text": "拉着前台连比带猜地问",
        "resultText": "你脸皮一厚,指着表格一格格问过去。前台人很好,连说带画地帮你弄完了,顺便记住了你的脸。",
        "effects": {
          "social": 5,
          "english": 3,
          "adaptation": 3,
          "stress": -2,
          "energy": -4
        },
        "routeWeights": {
          "social": 2
        }
      },
      {
        "text": "差不多就行,空着的先跳过",
        "resultText": "你把吃不准的几栏直接留白交了上去。当下是省事了,过两周收到补填通知,又得跑一趟。",
        "effects": {
          "stress": 5,
          "adaptation": 2,
          "energy": -3,
          "health": -2
        },
        "routeWeights": {
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_admin_ni_number",
    "title": "约 NI number",
    "description": "为了打工你得办个 NI number,电话预约系统一接通就是漫长的排队。好不容易约上面谈,地点在城另一头,时间还卡在你有课的那个上午。",
    "category": "career",
    "weight": 12,
    "oncePerGame": true,
    "pool": "admin_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 6
    },
    "choices": [
      {
        "text": "翘半节课也要去把它办了",
        "resultText": "你算准了往返时间,踩点赶到面谈点,材料一次过。NI number 几周后寄到,打工的门总算是开了,就是那节课的笔记得找同学借。",
        "effects": {
          "career": 4,
          "adaptation": 4,
          "stress": 3,
          "gpa": -2,
          "energy": -8
        },
        "routeWeights": {
          "career": 2,
          "survivor": 1
        }
      },
      {
        "text": "改约到周末的空档",
        "resultText": "你重新刷系统,把面谈挪到了一个周末上午。代价是又往后拖了两周,但课没耽误,心里也没那么慌了。",
        "effects": {
          "career": 3,
          "adaptation": 3,
          "stress": 4,
          "energy": -4
        },
        "routeWeights": {
          "chill": 1,
          "career": 1
        }
      },
      {
        "text": "找做过的同学借经验少跑冤枉路",
        "resultText": "你请教了已经办过的同学,人家把要带的材料和现场流程讲得明明白白。你按攻略去,半小时搞定,效率高得自己都惊讶。",
        "effects": {
          "social": 5,
          "career": 3,
          "adaptation": 3,
          "english": 2,
          "energy": -3
        },
        "routeWeights": {
          "social": 2,
          "career": 1
        }
      }
    ]
  },
  {
    "id": "inc_admin_council_tax",
    "title": "市政税账单",
    "description": "你在处理一堆信件的时候,抽出一封印着 Council Tax 的账单,数字大得你手一抖。你盯着那串金额看了半天,脑子里飞速换算成人民币,差点没坐稳。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "pool": "admin_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "查清楚发现学生本就免税,提交证明",
        "resultText": "你冷静下来一查,全日制学生本来就能申请豁免。你下载了在读证明提交上去,账单作废,虚惊一场反倒摸清了一项规则。",
        "effects": {
          "money": 0,
          "adaptation": 5,
          "english": 3,
          "stress": -4,
          "reputation": 2
        },
        "routeWeights": {
          "scholar": 1,
          "survivor": 1
        }
      },
      {
        "text": "慌不择路差点先把钱付了",
        "resultText": "你差点点下付款,幸好室友一句你是学生免税的把你拦住。钱保住了,但被这一吓,后背都出了层汗。",
        "effects": {
          "social": 4,
          "adaptation": 3,
          "stress": 4,
          "homesick": 3,
          "energy": -3
        },
        "routeWeights": {
          "social": 1
        }
      },
      {
        "text": "打去市政厅问个明白",
        "resultText": "你鼓起勇气拨通市政厅电话,对着话筒磕磕巴巴解释了半天。对方确认你符合豁免,还把申请链接发到了你邮箱。事儿办了,口语也被迫练了一轮。",
        "effects": {
          "english": 3,
          "adaptation": 4,
          "stress": 3,
          "energy": -5
        },
        "routeWeights": {
          "survivor": 1,
          "grind": 1
        }
      }
    ]
  },
  {
    "id": "inc_essay_offtopic_rewrite",
    "title": "写到一半发现跑题",
    "description": "你赶 essay 赶到第一千两百字,回头读论点,才发现自己从第三段起就在答另一个题。题目问的是因果,你洋洋洒洒论了半天定义。",
    "category": "study",
    "weight": 13,
    "oncePerGame": true,
    "pool": "essay_incidents",
    "cond": {
      "maxYear": 1
    },
    "choices": [
      {
        "text": "推翻重写,救回论点",
        "resultText": "你把跑题那一大段剪掉,贴进一个叫废稿的文档里舍不得删,然后顺着题目重新搭骨架,天亮时论证总算回到正轨,人是空的,文章是稳的。",
        "effects": {
          "gpa": 5,
          "english": 2,
          "energy": -9,
          "stress": 5,
          "adaptation": 3
        },
        "routeWeights": {
          "scholar": 2,
          "grind": 1
        }
      },
      {
        "text": "硬把跑题接回主线",
        "resultText": "你在跑题段后面硬加了句承上启下,假装一切都在计划之内,自己读着都心虚,但至少不用熬通宵重写了。",
        "effects": {
          "gpa": -3,
          "stress": 6,
          "energy": -4,
          "english": 2
        },
        "routeWeights": {
          "survivor": 1,
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_essay_citation_renumber_hell",
    "title": "引用编号集体错位",
    "description": "你写到收尾,在正文里补插了一篇文献,文献管理软件没认出来,整篇 essay 的引用编号当场全乱,原本是 12 的现在标着 7,你盯着满屏的错位想哭。",
    "category": "study",
    "weight": 12,
    "oncePerGame": true,
    "pool": "essay_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "重装插件从头刷一遍",
        "resultText": "你把软件插件卸了重装,字段重新刷新,编号一个个归位,折腾两小时才搞定,以后你养成了每插一篇就立刻存盘的强迫症。",
        "effects": {
          "gpa": 4,
          "english": 2,
          "energy": -8,
          "stress": 4,
          "adaptation": 3
        },
        "routeWeights": {
          "scholar": 2
        }
      },
      {
        "text": "关掉软件全部手动改",
        "resultText": "你索性把自动引用全转成纯文本,一条条手动对编号,改到第三十条逗号句号都看花了,交是交了,效率低得感人。",
        "effects": {
          "gpa": 2,
          "energy": -10,
          "stress": 7,
          "health": -3
        },
        "routeWeights": {
          "survivor": 1,
          "grind": 1
        }
      },
      {
        "text": "随它乱,赌 marker 不细看",
        "resultText": "你赌 marker 不会逐条核引用,结果批注里一句 referencing inconsistent 把格式分扣得干干净净,你后悔得想原地消失。",
        "effects": {
          "gpa": -4,
          "stress": 5,
          "energy": 2
        },
        "routeWeights": {
          "chill": 1
        }
      }
    ]
  },
  {
    "id": "inc_essay_midnight_flow",
    "title": "深夜灵感不舍睡",
    "description": "已经凌晨一点半,你本来要合上电脑,卡了三天的那段论证突然在脑子里通了,整条逻辑链像被点亮一样清晰,你知道这种状态明早醒来多半就没了。",
    "category": "study",
    "weight": 13,
    "oncePerGame": true,
    "pool": "essay_incidents",
    "cond": {
      "maxYear": 1
    },
    "choices": [
      {
        "text": "趁热写完这一段再睡",
        "resultText": "你硬撑着把整段论证一口气敲完,光标停下时已经快三点,文字顺得连自己都惊讶,代价是第二天的早课你顶着两个黑眼圈进的教室。",
        "effects": {
          "gpa": 5,
          "english": 3,
          "energy": -10,
          "stress": -2,
          "health": -4
        },
        "routeWeights": {
          "grind": 2,
          "scholar": 1
        }
      },
      {
        "text": "把要点记进手机就睡",
        "resultText": "你在备忘录里飞快敲下三行关键词就关灯,赌明早还能接上,结果醒来看着那几行字,只记得当时很激动,具体怎么通的已经想不起来了。",
        "effects": {
          "gpa": -2,
          "energy": 4,
          "stress": 4,
          "health": 3
        },
        "routeWeights": {
          "chill": 1,
          "homebound": 1
        }
      }
    ]
  },
  {
    "id": "inc_essay_wordcount_padding",
    "title": "字数差一截",
    "description": "deadline 前两小时,论证你自认写完了,字数统计停在一千八,要求是两千五,加减百分之十。你看着那个数字,知道要么硬塞要么承认自己没写够。",
    "category": "study",
    "weight": 13,
    "oncePerGame": true,
    "pool": "essay_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "回头补一个真实的反方观点",
        "resultText": "你没去注水,而是认真补了一段对立论点再逐条反驳,字数自然涨上去了,文章反而比原来更有说服力,你第一次觉得字数下限是逼你想深一点的好东西。",
        "effects": {
          "gpa": 5,
          "english": 3,
          "energy": -8,
          "stress": -2,
          "adaptation": 2
        },
        "routeWeights": {
          "scholar": 2,
          "grind": 1
        }
      },
      {
        "text": "拉长句子堆形容词凑数",
        "resultText": "你把每句话都拖长,塞进一堆 it is widely acknowledged that 之类的空话,字数是够了,可读着像兑了水的汤,你心里清楚 marker 也喝得出来。",
        "effects": {
          "gpa": -3,
          "english": -2,
          "stress": 4,
          "energy": -4
        },
        "routeWeights": {
          "survivor": 1,
          "chill": 1
        }
      },
      {
        "text": "就交一千八,不凑了",
        "resultText": "你决定不糟蹋这篇,字数没到就老实交,论证干净利落,结果批注夸了逻辑,又因为低于下限扣了几分,你觉得这账划算。",
        "effects": {
          "gpa": 2,
          "stress": 3,
          "energy": -3,
          "reputation": 2
        },
        "routeWeights": {
          "chill": 1,
          "scholar": 1
        }
      }
    ]
  },
  {
    "id": "inc_pt_difficult_customer",
    "title": "难缠顾客的考验",
    "description": "你在咖啡店打工,一位顾客对着你拿错的拿铁阴阳怪气,说你的英语听不懂还翻白眼。你手里还端着别桌的餐,后面排了五个人,只能赔笑。",
    "category": "career",
    "weight": 13,
    "oncePerGame": true,
    "pool": "part_time_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "深呼吸,标准微笑重做一杯",
        "resultText": "你压住火气,把那句在心里骂了十遍的话咽回去,重新打了一杯递过去。顾客哼了一声走了,你站在吧台后面忽然觉得,原来委屈也是有重量的,而你今天扛住了。",
        "effects": {
          "stress": 7,
          "career": 3,
          "english": 2,
          "reputation": 2
        },
        "routeWeights": {
          "survivor": 2,
          "grind": 1
        }
      },
      {
        "text": "礼貌但坚定地指出是ta听错了",
        "resultText": "你放慢语速,一字一句把订单重复了一遍,语气客气但不退让。顾客愣了一下,没再说什么。同事悄悄给你比了个大拇指,你发现温和不等于没有底线。",
        "effects": {
          "stress": 3,
          "social": 3,
          "english": 3,
          "career": 2,
          "reputation": 2
        },
        "routeWeights": {
          "social": 2,
          "career": 1
        }
      },
      {
        "text": "下班后躲进储物间偷偷红了眼",
        "resultText": "你撑到下班,关上储物间的门,鼻子一酸还是没忍住。哭完洗把脸,你想家了,也想起来出国前没人告诉过你,赚钱原来是这种滋味。",
        "effects": {
          "stress": -4,
          "homesick": 5,
          "energy": -4,
          "health": -3
        },
        "routeWeights": {
          "homebound": 2
        }
      }
    ]
  },
  {
    "id": "inc_pt_big_tips_week",
    "title": "这周小费爆了",
    "description": "你在餐厅跑堂,这周不知道是不是水逆退散,几桌客人格外慷慨,有人直接在小费栏写了二十镑还画了个笑脸。结账时你数着零钱,差点以为自己看错。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "pool": "part_time_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "请同班一起打工的朋友吃顿好的",
        "resultText": "你拉着同样在端盘子的朋友去吃了顿正经中餐,两个人就着一锅麻辣烫吐槽顾客,笑到隔壁桌侧目。钱花出去了,可那种被人理解的踏实,比小费本身值钱。",
        "effects": {
          "money": -35,
          "social": 5,
          "homesick": -8,
          "stress": -6
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        }
      },
      {
        "text": "全部存起来,默默截图发家庭群",
        "resultText": "你把小费一分不动地存进账户,顺手截了张图发到家庭群,配了句这周不用你们打钱了。爸妈秒回一长串点赞,你盯着屏幕,鼻头有点暖。",
        "effects": {
          "money": 40,
          "homesick": -5,
          "stress": -4,
          "reputation": 2
        },
        "routeWeights": {
          "survivor": 2,
          "homebound": 1
        }
      },
      {
        "text": "犒劳自己买双站一天不累的鞋",
        "resultText": "你拿小费给自己换了双软底鞋,毕竟跑堂一晚上脚像踩在刀尖上。第二天上工,脚不疼了,你忽然觉得对自己好一点,也是这趟留学要学会的事。",
        "effects": {
          "money": -45,
          "health": 5,
          "energy": -4,
          "stress": -5
        },
        "routeWeights": {
          "chill": 2,
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_pt_cover_shift_due",
    "title": "顶班撞上due",
    "description": "你在超市打工,临下班老板满脸堆笑求你顶今晚的班,说有人请病假。你刚要答应,猛地想起明早十点有篇assignment要交,而你才写了一半。",
    "category": "career",
    "weight": 13,
    "oncePerGame": true,
    "pool": "part_time_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "硬着头皮顶班,回家通宵赶due",
        "resultText": "你顶完班,凌晨两点对着没写完的论文灌咖啡,键盘敲得像在打仗。交上去的那刻天都快亮了,你瘫在椅子上想,钱是赚到了,可这觉是真的回不来了。",
        "effects": {
          "money": 45,
          "energy": -10,
          "stress": 8,
          "gpa": 1,
          "health": -6
        },
        "routeWeights": {
          "survivor": 2,
          "grind": 1
        }
      },
      {
        "text": "婉拒老板,守住论文截止线",
        "resultText": "你客气地解释明天有deadline,老板脸上的笑淡了点,但还是点了头。你回家安心写完论文,虽然少赚一晚,但你清楚自己来英国到底是为了什么。",
        "effects": {
          "money": -20,
          "gpa": 4,
          "stress": -3,
          "career": 2,
          "reputation": 2
        },
        "routeWeights": {
          "scholar": 3,
          "grind": 1
        }
      },
      {
        "text": "顶半场,留两小时回去抢救论文",
        "resultText": "你和老板商量只顶到八点,他勉强同意。你卡着点冲回家,论文写得潦草但赶在deadline前交了。两头都没全顾上,可你学会了在大人世界里讨价还价。",
        "effects": {
          "money": 20,
          "energy": -6,
          "gpa": 2,
          "social": 2,
          "career": 3
        },
        "routeWeights": {
          "survivor": 2,
          "career": 1
        }
      }
    ]
  },
  {
    "id": "inc_pt_classmate_customer",
    "title": "顾客竟是同班",
    "description": "你在奶茶店打工,正手忙脚乱封口,抬头一看排到柜台的居然是同班那位平时坐前排、看起来很拼的同学。两个人四目相对,空气尴尬了半秒。",
    "category": "social",
    "weight": 12,
    "oncePerGame": true,
    "pool": "part_time_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "大方打招呼,多送ta一份小料",
        "resultText": "你笑着喊出ta名字,顺手多加了份珍珠。ta愣了下也笑了,说没想到在这儿碰到你。下课后你们居然约着一起复习,打工台前的偶遇,意外成了第一个真朋友。",
        "effects": {
          "social": 6,
          "homesick": -6,
          "english": 2,
          "career": 2,
          "reputation": 3
        },
        "routeWeights": {
          "social": 3,
          "chill": 1
        }
      },
      {
        "text": "假装很忙,低头默默做单",
        "resultText": "你心一虚,装作没认出来,低头把奶茶做得飞快递过去。ta也没多说就走了。事后你有点懊恼,明明没什么好躲的,打工又不丢人,可那点别扭就是迈不过去。",
        "effects": {
          "stress": 4,
          "social": -3,
          "homesick": 3,
          "reputation": -3
        },
        "routeWeights": {
          "homebound": 2
        }
      },
      {
        "text": "坦然聊两句,顺口问ta要不要内推",
        "resultText": "你边做单边和ta闲聊,得知ta也在找兼职,就把店里招人的事告诉了ta。一来二去你们加了联系方式,你发现留学圈子小,递出去的善意往往会绕回自己手里。",
        "effects": {
          "social": 4,
          "career": 4,
          "english": 2,
          "reputation": 3,
          "stress": -3
        },
        "routeWeights": {
          "career": 3,
          "social": 1
        }
      }
    ]
  },
  {
    "id": "inc_social_icebreaker_fall",
    "title": "破冰游戏社死现场",
    "description": "你刚加入的社团第一次活动玩破冰游戏,主持人让每人配一个动作做自我介绍。轮到你,紧张到把名字和家乡说反了,全场愣了半秒。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "pool": "social_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "干脆把社死梗接着往下抖",
        "resultText": "你顺势自嘲说自己英文一急就乱码,配了个夸张的鞠躬动作,全场笑成一片,破冰反倒破得最彻底,散场后好几个人主动来加你。",
        "effects": {
          "social": 6,
          "english": 3,
          "adaptation": 4,
          "reputation": 3,
          "stress": -3,
          "energy": -5
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        }
      },
      {
        "text": "脸红着小声把名字重说一遍",
        "resultText": "你憋着尴尬把信息重新讲清楚,没人笑你,主持人还鼓励地点了点头。没出彩,但也算把自己介绍完整了,心跳了好一会儿才平。",
        "effects": {
          "social": 3,
          "english": 2,
          "stress": 4,
          "homesick": 2,
          "energy": -4
        },
        "routeWeights": {
          "chill": 1,
          "homebound": 1
        }
      }
    ]
  },
  {
    "id": "inc_social_made_organiser",
    "title": "被推上去当负责人",
    "description": "社团活动散场前要定下个月那场大活动谁来牵头,没人吭声,气氛尴尬。一个老成员忽然指着你说,你点子多,你来当 organiser 吧,一圈人跟着附和。",
    "category": "career",
    "weight": 12,
    "oncePerGame": true,
    "pool": "social_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "接下来,硬着头皮揽这摊事",
        "resultText": "你嘴上说着好好好,心里已经在算要订场地发海报拉赞助。忙是真忙,可一场活动办下来,你的名字和那个 society 绑在了一起,CV 上也多了实打实的一行。",
        "effects": {
          "career": 5,
          "social": 5,
          "reputation": 4,
          "english": 3,
          "stress": 7,
          "energy": -9
        },
        "routeWeights": {
          "career": 2,
          "social": 1
        }
      },
      {
        "text": "笑着推说自己课业实在排不开",
        "resultText": "你实话说这学期 deadline 堆成山,提议大家分工合办,没人独扛。事儿是躲过了,可你也听见心里有个声音在嘀咕,是不是又一次把机会让出去了。",
        "effects": {
          "career": 2,
          "social": 2,
          "stress": -2,
          "gpa": 2,
          "energy": -3
        },
        "routeWeights": {
          "scholar": 1,
          "grind": 1
        }
      }
    ]
  },
  {
    "id": "inc_social_drunk_truth",
    "title": "酒过三巡的真心话",
    "description": "社团聚会到了后半场,几杯下肚气氛松了,对面那个平时只点头之交的人忽然红着眼说起了想家。你也跟着一杯接一杯,话到嘴边压不住。",
    "category": "emotion",
    "weight": 12,
    "oncePerGame": true,
    "pool": "social_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 8
    },
    "choices": [
      {
        "text": "也把憋了半年的心里话倒出来",
        "resultText": "你讲起一个人扛 deadline、半夜想家不敢打电话的那些夜,对面用力点头说我也是。那一晚之后你们成了能半夜互发语音的人,孤独像是被分掉了一半。",
        "effects": {
          "social": 6,
          "homesick": -10,
          "stress": -6,
          "adaptation": 3,
          "energy": -6,
          "health": -3
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        }
      },
      {
        "text": "把话咽回去,转头帮人续水醒酒",
        "resultText": "你没让自己醉,安静地给几个上头的人倒水叫车,把场子收得稳稳的。第二天你成了大家口中那个靠谱的人,只是心里那点没说出口的话,又被你自己收了起来。",
        "effects": {
          "reputation": 4,
          "social": 3,
          "homesick": 3,
          "stress": 2,
          "energy": -5
        },
        "routeWeights": {
          "homebound": 1,
          "survivor": 1
        }
      }
    ]
  },
  {
    "id": "inc_social_group_mute",
    "title": "加了一堆群第二天全静音",
    "description": "一场社团活动下来你扫了七八个二维码,回宿舍躺下,手机震得停不下来,迎新群、桌游群、徒步群、找室友群,还有三个你完全不记得是干嘛的群。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "pool": "social_incidents",
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "一口气全设静音,留两个常去的",
        "resultText": "你冷静地把绝大多数群拖进免打扰,只留下徒步群和桌游群两个真心想去的。世界一下清净了,你也终于明白,加群从来不等于交到朋友。",
        "effects": {
          "social": 3,
          "stress": -5,
          "adaptation": 4,
          "energy": -3,
          "health": 2
        },
        "routeWeights": {
          "chill": 1,
          "scholar": 1
        }
      },
      {
        "text": "舍不得退,每个群都冒泡混脸熟",
        "resultText": "你逼着自己在每个群里都说两句话刷存在感,半夜还在回别人的接龙。脸是混熟了不少,可第二天顶着黑眼圈去上课,你怀疑自己到底图个啥。",
        "effects": {
          "social": 5,
          "reputation": 2,
          "stress": 5,
          "energy": -7,
          "health": -3
        },
        "routeWeights": {
          "social": 2
        }
      }
    ]
  }
];
