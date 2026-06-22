// Meme / absurdist UK study-abroad beats plus the long-distance-relationship
// thread (ldr_sweet_burden -> ldr_drifting -> ldr_breakup, chained on the
// ldr_together flag). Funnier, meme-aware, gender-neutral partner, still warm.
// Authored via a writers-room workflow, editor-QA'd, code-validated. Data only.
import type { GameEvent } from '../game/types';

export const STORY_MEME: GameEvent[] = [
  {
    "id": "ldr_sweet_burden",
    "title": "跨七小时的晚安",
    "description": "刚落地这边一切都新鲜，可这边的傍晚是国内的深夜。异地恋的那个人撑着困意等你下课，屏幕那头打着哈欠还要你描述今天吃了什么、走了哪条路、有没有想ta。甜是真甜，累也是真累。",
    "category": "emotion",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "认真维系，定好每天的通话时间",
        "resultText": "你们把七小时时差排成了固定的早安和晚安，像两个守着同一座灯塔的人。累，但每次接通的那一声，你都还是会笑。",
        "effects": {
          "homesick": -8,
          "stress": 4,
          "energy": -6,
          "social": 2
        },
        "setFlags": {
          "ldr_together": true
        },
        "routeWeights": {
          "homebound": 2
        }
      },
      {
        "text": "把这段感情慢慢放回原位",
        "resultText": "你没说分手，只是默契地把通话从每天改成了想起才打。没有人哭，只是有些东西悄悄变轻了，连你自己都说不清是松了口气还是失落。",
        "effects": {
          "homesick": 4,
          "stress": -6,
          "adaptation": 3
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "本来就单身，安心铺床睡觉",
        "resultText": "群里室友在讨论各自的异地恋有多熬人，你听着听着默默关了灯。一个人睡整张床这件事，今晚意外地很踏实。",
        "effects": {
          "energy": 8,
          "stress": -4
        },
        "routeWeights": {
          "chill": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "ldr_drifting",
    "title": "已读后面那行小字",
    "description": "你忙到天昏地暗，ta那边也开始有新的生活。消息越回越慢，视频里你们各说各的due和加班，最后只剩一句辛苦了。你盯着对话框最下面那行已读，忽然不知道该补一句什么。看不见摸不着的感觉，这次是真的找上门了。",
    "category": "emotion",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 16,
      "flagsSet": [
        "ldr_together"
      ]
    },
    "choices": [
      {
        "text": "订下一次见面，给这段感情一个盼头",
        "resultText": "你翻出假期，算好机票和论文deadline，把见面写进了共同日历。有个具体的日子在前面亮着，今晚的沉默也没那么冷了。",
        "effects": {
          "homesick": -6,
          "money": -120,
          "stress": 3
        },
        "routeWeights": {
          "homebound": 2
        }
      },
      {
        "text": "认真聊一次，把卡住的话说开",
        "resultText": "你们隔着屏幕第一次没回避，把累、把怕、把走远了的担心都说了出来。说完都有点哑，但握着手机的手，没有松。",
        "effects": {
          "homesick": -3,
          "stress": 6,
          "energy": -6,
          "social": 2
        },
        "setFlags": {
          "ldr_strain": true
        },
        "routeWeights": {
          "homebound": 1
        }
      },
      {
        "text": "不强求，先把眼前的日子过好",
        "resultText": "你没去追那行越来越慢的回复，只是把心思先放回论文和这座陌生的城。顺其自然这四个字，说出来轻，做起来却像在松一只攥久了的手。",
        "effects": {
          "adaptation": 4,
          "gpa": 3,
          "homesick": 4,
          "stress": -4
        },
        "setFlags": {
          "ldr_strain": true
        },
        "routeWeights": {
          "survivor": 2,
          "grind": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "ldr_breakup",
    "title": "时差里的最后一通",
    "description": "你这边的深夜，是ta那边刚醒的清晨。两个人都心知肚明，这通电话不是为了说晚安。中间隔着的不只是七小时和一片海，还有这一年里你们各自悄悄长成的、对方没能在场见证的样子。",
    "category": "emotion",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 22,
      "flagsSet": [
        "ldr_together"
      ]
    },
    "choices": [
      {
        "text": "体面地告别，谢谢这一程",
        "resultText": "你们没有翻旧账，只是认真说了谢谢和保重。挂断后屋里很静，你站了很久，原来好好告别一个人，比吵一架要更用力气，也更像长大。",
        "effects": {
          "homesick": 6,
          "stress": -4,
          "adaptation": 5,
          "reputation": 2
        },
        "setFlags": {
          "ldr_ended": true
        },
        "routeWeights": {
          "survivor": 3,
          "grind": 1
        }
      },
      {
        "text": "买最近的一张机票，飞回去当面谈",
        "resultText": "你刷空了卡余额，把论文塞进背包就冲向机场。重逢那一刻你才明白，有些话隔着屏幕永远说不清，有些结局也只有当面才舍得给。是修补还是道别，落地后才知道。",
        "effects": {
          "money": -180,
          "energy": -10,
          "homesick": -8,
          "stress": 5,
          "gpa": -2
        },
        "setFlags": {
          "ldr_reunion": true
        },
        "routeWeights": {
          "homebound": 3
        }
      },
      {
        "text": "什么都没说，让它被忙碌拖到散场",
        "resultText": "你没有挂断，也没有挽留，只是任由due和时差一点点把电话拖成了沉默。后来你们谁都没再先开口，这段感情没有结尾，就那么淡进了各自的生活里。最难受的，往往不是分手，是没有分手。",
        "effects": {
          "homesick": 8,
          "stress": 6,
          "health": -4,
          "gpa": 2
        },
        "setFlags": {
          "ldr_ended": true
        },
        "routeWeights": {
          "grind": 2,
          "survivor": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "meme_on_pdf",
    "title": "你上了PDF",
    "description": "群里突然有人甩出一份十几页的PDF，标题叫《本届迷惑行为大赏》，第三页赫然是你上周在小组展示时把slide放反、对着投影傻站三十秒的截图，配文加粗加红。整个群在刷哈哈哈。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 9
    },
    "choices": [
      {
        "text": "自己接梗，回一句这页p得真精致",
        "resultText": "你顺势把那页设成了头像，群里反而开始夸你心态好，社死秒变社交资产。",
        "effects": {
          "social": 7,
          "reputation": 4,
          "stress": -4,
          "homesick": -3
        },
        "routeWeights": {
          "social": 2,
          "survivor": 1
        },
        "setFlags": {
          "meme_self_owned": true
        }
      },
      {
        "text": "默默把那段经历写进留学日记自我和解",
        "resultText": "你笑着写下，三十秒而已，半年后只剩好笑。写完那点尴尬就真的轻了。",
        "effects": {
          "adaptation": 4,
          "stress": -6,
          "english": 2
        },
        "routeWeights": {
          "chill": 2
        }
      },
      {
        "text": "私聊做PDF那位，能不能撤一下",
        "resultText": "对方秒道歉撤回还请你喝奶茶，一来一回你俩居然熟了起来。",
        "effects": {
          "social": 4,
          "money": -3,
          "reputation": 2,
          "stress": -2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "meme_supermarket_meltdown",
    "title": "超市自助结账社死",
    "description": "自助结账机第N次用机械音喊出unexpected item in the bagging area，红灯闪个不停，你身后排了一条长队，每个人都在用英式的礼貌沉默盯着你的后脑勺。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "举手喊店员，大方求助",
        "resultText": "店员三秒搞定，还顺口教了你下次怎么避开。一句不好意思之后，你发现求助没那么可怕。",
        "effects": {
          "adaptation": 5,
          "english": 3,
          "stress": -3,
          "social": 2
        },
        "routeWeights": {
          "survivor": 1,
          "social": 1
        }
      },
      {
        "text": "硬着头皮自己乱按一通",
        "resultText": "你把每件商品挪来挪去像在玩华容道，机器终于消停，你也出了一身汗。",
        "effects": {
          "stress": 6,
          "energy": -5,
          "adaptation": 2
        }
      },
      {
        "text": "默默退回排人工收银",
        "resultText": "你抱着篮子悄悄撤退，收银员和你寒暄了两句天气，心跳总算降下来。",
        "effects": {
          "stress": -4,
          "energy": -4,
          "social": 2,
          "homesick": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "meme_club_blackout",
    "title": "断片拼图大赛",
    "description": "第二天醒来，手机里有给三个人发的看不懂的语音、一张和陌生人的合照、外卖订了两份没人吃的薯条。你对昨晚club之后的记忆，停在了某首歌的副歌。",
    "category": "social",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 14,
      "statLte": {
        "health": 75
      }
    },
    "choices": [
      {
        "text": "拉着朋友靠监控和聊天记录拼回昨晚",
        "resultText": "几个人围着手机像破案，结论是你昨晚全程在认真教外国朋友念你的中文名。又社死又好笑。",
        "effects": {
          "social": 6,
          "stress": -3,
          "health": -4,
          "homesick": -3
        },
        "routeWeights": {
          "social": 2
        }
      },
      {
        "text": "全删了，假装什么都没发生",
        "resultText": "你删干净证据躺平养生，宿醉的头痛却诚实地提醒你昨晚确实发生过。",
        "effects": {
          "health": -6,
          "stress": 3,
          "energy": -6
        },
        "routeWeights": {
          "chill": 1
        }
      },
      {
        "text": "挨个发对不起昨天我有点上头",
        "resultText": "对方回了一长串哈哈哈说你昨晚可爱死了，尴尬瞬间清零，还约了下周再聚。",
        "effects": {
          "social": 5,
          "reputation": 3,
          "stress": -2,
          "health": -3
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "meme_queue_jump_shade",
    "title": "插队被阴阳",
    "description": "你没看清队伍走向，一脚迈到了人家前面。身后传来一句温柔到极致的Oh, sorry, were you in front of me，语气客气得像在祝福你，你却瞬间汗毛倒竖。",
    "category": "social",
    "weight": 11,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 20
    },
    "choices": [
      {
        "text": "立刻退后并真诚道歉",
        "resultText": "你连说三个sorry退回队尾，对方笑着点头，你这才悟到英式礼貌里的杀气有多含蓄。",
        "effects": {
          "adaptation": 5,
          "english": 2,
          "reputation": 3,
          "stress": 3
        },
        "routeWeights": {
          "survivor": 1,
          "social": 1
        }
      },
      {
        "text": "假装没听懂，继续站着",
        "resultText": "你硬着头皮往前挪，能感到后脑勺被一整条队伍的目光焊住，那笔尴尬利息你记了一整天。",
        "effects": {
          "reputation": -3,
          "stress": 6,
          "social": -2
        }
      },
      {
        "text": "回敬一句更客气的英式礼貌",
        "resultText": "你笑着回了句So sorry, after you, please把对方都说乐了，两人客套到最后一起笑出声。",
        "effects": {
          "english": 3,
          "social": 4,
          "adaptation": 3,
          "stress": -2
        },
        "routeWeights": {
          "social": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "meme_heating_bill_blanket",
    "title": "暖气一开,钱包就停",
    "description": "宿舍冷到呵气成霜，你终于咬牙开了一小时暖气。第二天能源账单的预估金额弹出来，你默默把暖气关了，裹上被子蜷成一只笔记本电脑前的蚕宝宝，继续写论文。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "认了，裹被子裹到天荒地老，省下来的钱是钱",
        "resultText": "你在被窝里打字，手指露在外面像两根冻虾。论文写完了，账单也保住了，你对着室温计露出胜利者的微笑。",
        "effects": {
          "money": 35,
          "health": -4,
          "stress": 3,
          "adaptation": 4
        },
        "routeWeights": {
          "survivor": 2,
          "grind": 1
        }
      },
      {
        "text": "钱是用来花的，该暖就暖，先把人养活",
        "resultText": "暖气一开，整个人活了过来，思路也顺了。月底账单到的时候你假装没看见，反正人是暖的，这点已经赢了。",
        "effects": {
          "money": -90,
          "stress": -8,
          "health": 5,
          "energy": 4
        },
        "routeWeights": {
          "chill": 2
        }
      },
      {
        "text": "去图书馆蹭暖气，顺便假装自己很爱学习",
        "resultText": "你抱着电脑奔向二十四小时开放的图书馆，暖气免费、插座免费，连氛围都自带学习滤镜。回来的路上你想，这才是真正的学生折扣。",
        "effects": {
          "money": 10,
          "gpa": 3,
          "social": 3,
          "energy": -5
        },
        "routeWeights": {
          "grind": 2,
          "scholar": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "meme_seagull_steals_lunch",
    "title": "海鸥比你更想吃午饭",
    "description": "你刚在海边长椅上拆开那份九块九的三明治套餐，一只体型堪比小型无人机的海鸥俯冲而下，精准叼走你的三明治，留下你和一包还没拆的薯片面面相觑。",
    "category": "life",
    "weight": 11,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 11
    },
    "choices": [
      {
        "text": "护住剩下的薯片，跟海鸥进行严肃的眼神对峙",
        "resultText": "你死死攥住薯片，海鸥在头顶盘旋示威。你赢得了薯片，输掉了尊严，旁边的本地人笑着说，欢迎来到英国。",
        "effects": {
          "social": 4,
          "stress": 4,
          "adaptation": 5
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "认输，再去买一份，这顿钱就当喂了野生动物",
        "resultText": "你重新排队买了一份，这回躲进室内才敢拆开。你默默把这只海鸥拉进了人生黑名单的第一位。",
        "effects": {
          "money": -10,
          "energy": -4,
          "homesick": 4,
          "health": 3
        }
      },
      {
        "text": "掏出手机把抢劫现场拍下来发到群里",
        "resultText": "视频里海鸥叼着三明治扬长而去，群里瞬间炸出一片哈哈哈。你饿着肚子，却收获了今日最佳投稿。",
        "effects": {
          "social": 7,
          "homesick": -5,
          "energy": -4
        },
        "routeWeights": {
          "social": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "meme_royal_mail_card",
    "title": "招领卡又来了",
    "description": "你网购的厚外套终于要到了，你为此在家守了一上午。刚下楼倒个垃圾的工夫，回来就在门口发现一张Royal Mail招领卡，上面写着投递未成功，请前往三公里外的取件点自取。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 17
    },
    "choices": [
      {
        "text": "走三公里去取件点，顺便当作今日的步数和散心",
        "resultText": "你顶着风走过去，取件点排着一条同样在等包裹的长队，大家眼神里都写着同一句，我明明在家。外套到手，人也透心凉。",
        "effects": {
          "money": -5,
          "energy": -6,
          "adaptation": 5,
          "health": 3
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "上网约改投到附近的便利店，坚决不再赌它第二次",
        "resultText": "你学乖了，改投到楼下便利店。三天后取件时，店员一句轻飘飘的应该是这个吧，让你确认了人生第一次真正读懂英国物流。",
        "effects": {
          "stress": -5,
          "adaptation": 5,
          "energy": -4
        },
        "routeWeights": {
          "chill": 1,
          "survivor": 1
        }
      },
      {
        "text": "在群里发招领卡照片，问问大家都被骗了几次",
        "resultText": "招领卡照片一发，群里立刻接龙晒出各自的同款卡片，有人收藏了整整一摞。你忽然觉得，孤独的留学生因一张卡片而团结。",
        "effects": {
          "social": 6,
          "homesick": -5,
          "stress": 2
        },
        "routeWeights": {
          "social": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "meme_christmas_everything_closed",
    "title": "圣诞全城唱空城",
    "description": "圣诞节当天你饿醒了，想着出门随便买点吃的。结果整条街拉下卷帘门，连平时永远亮灯的超市都黑着，公交也停摆，整座城像被按了暂停键，只剩你和冰箱里半盒鸡蛋。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 14
    },
    "choices": [
      {
        "text": "把冰箱清空，用仅剩的食材搞出一顿留学生版圣诞大餐",
        "resultText": "半盒鸡蛋加一把意面，你硬是炒出一盘能拍照的成品。配上窗外的安静，这顿饭意外地有仪式感，你给它取名，绝境料理。",
        "effects": {
          "money": 20,
          "adaptation": 6,
          "health": 3,
          "homesick": 3
        },
        "routeWeights": {
          "survivor": 2,
          "homebound": 1
        }
      },
      {
        "text": "在群里喊一嗓子，看看谁还没回家、能不能凑一桌",
        "resultText": "几个同样没回家的人陆续端着锅出现，有人带火鸡边角料，有人带半瓶酒。空荡荡的城里，一间小厨房灯火通明，你忽然不那么想家了。",
        "effects": {
          "social": 8,
          "homesick": -12,
          "energy": -4,
          "stress": -5
        },
        "routeWeights": {
          "social": 2
        }
      },
      {
        "text": "干脆躺平，视频连线家里，看他们吃年夜般的圣诞餐",
        "resultText": "屏幕那头热气腾腾，这头你啃着面包。家人举着筷子让你看每道菜，你笑着笑着鼻子有点酸，说真好，我吃得可好了。",
        "effects": {
          "homesick": 6,
          "stress": -4,
          "energy": 4,
          "health": -3
        },
        "routeWeights": {
          "homebound": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "meme_quite_good_subtext",
    "title": "quite good 其实是不太行",
    "description": "导师在你的论文初稿上写了一句 This is quite good, with some interesting points，你开心了一整晚。直到本地室友淡淡瞥了一眼，说这话翻译过来约等于还行吧，但你最好重写。",
    "category": "study",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "连夜恶补英式礼貌潜台词词典",
        "resultText": "你做了张对照表，with respect 等于你错了，interesting 等于我不同意。从此每条邮件你都在心里翻译两遍，英语理解力诡异地飙升。",
        "effects": {
          "english": 3,
          "adaptation": 4,
          "energy": -6,
          "stress": 2
        },
        "routeWeights": {
          "scholar": 1,
          "survivor": 1
        }
      },
      {
        "text": "厚脸皮当面问导师到底什么意思",
        "resultText": "你直球一问，导师愣了半秒，然后笑着说你这个问题很有勇气。你又不确定这是夸还是另一层潜台词了，但至少ta真的给了你三条具体修改意见。",
        "effects": {
          "gpa": 3,
          "social": 4,
          "adaptation": 3,
          "stress": -2
        },
        "routeWeights": {
          "grind": 1,
          "social": 1
        }
      },
      {
        "text": "心一横，就当真的是夸我，继续莽",
        "resultText": "你选择活在 quite good 就是很好的平行宇宙里，心情舒畅了一周。下次反馈来的时候，你确实裂开了一点点，但快乐过的那一周是真实的。",
        "effects": {
          "homesick": -4,
          "stress": -3,
          "gpa": -1,
          "energy": 2
        },
        "routeWeights": {
          "chill": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "meme_three_pin_plug_war",
    "title": "三脚插头的世界大战",
    "description": "你从国内带来的所有充电器都是两脚的，而这里的插座是傲娇的三脚。你买的转换器昨晚悄悄壮烈牺牲，而现在你手机只剩 4% 电。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "冲去超市买一整套转换器和插线板",
        "resultText": "你买了一个能插六个口的英式插线板，瞬间从插座乞丐变成宿舍里的电力大亨。室友开始排队来你这儿充电，你莫名其妙成了社交中心。",
        "effects": {
          "money": -22,
          "social": 6,
          "adaptation": 4
        },
        "routeWeights": {
          "social": 1,
          "survivor": 1
        }
      },
      {
        "text": "拿牙签捅开地线孔强行插两脚头",
        "resultText": "你成功了，也差点把自己变成新闻里那种事故。你盯着插座两分钟没敢离开，最后还是认怂拔了下来，决定还是当个守法的留学生。",
        "effects": {
          "health": -4,
          "stress": 4,
          "energy": -4
        },
        "routeWeights": {
          "survivor": 1
        }
      },
      {
        "text": "在群里发求助，看谁能借我一个",
        "resultText": "三分钟内五个人回你，有人直接把转换器塞进你门缝。你发现这片留学生的友谊，很大一部分建立在互相救济插头的革命情谊上。",
        "effects": {
          "social": 5,
          "homesick": -4,
          "adaptation": 3,
          "energy": -2
        },
        "routeWeights": {
          "social": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "meme_student_discount_addiction",
    "title": "没有折扣就买不下手",
    "description": "你已经对学生折扣上瘾到了某种病态的程度。今天结账时系统提示你不符合折扣，你站在收银台前手指悬在卡机上，内心进行了一场关于尊严与三镑差价的激烈辩论。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 14
    },
    "choices": [
      {
        "text": "默默把购物车清空，改天有折扣再来",
        "resultText": "你空手走出店门，获得了原价 0 镑的极致省钱成就。回宿舍啃了一片九块九套餐里剩的吐司，觉得自己理财能力堪比基金经理。",
        "effects": {
          "money": 18,
          "stress": -2,
          "health": -3,
          "homesick": 2
        },
        "routeWeights": {
          "grind": 1,
          "survivor": 1
        }
      },
      {
        "text": "翻遍所有 app 凑出一个学生码",
        "resultText": "你在三个 app 之间反复横跳，终于挖出一个能用的折扣码，省下两镑五。为了这两镑五你花了二十分钟，但那种胜利的快感是金钱买不到的。",
        "effects": {
          "money": 6,
          "energy": -5,
          "adaptation": 3,
          "stress": 1
        },
        "routeWeights": {
          "survivor": 1,
          "grind": 1
        }
      },
      {
        "text": "豁出去了，原价买，当一回有钱人",
        "resultText": "你按原价付了款，走出店门那一刻竟有种久违的阔气。这种富贵感持续了大概四十秒，然后你又开始心疼那三镑，但你承认，偶尔不抠门也挺爽。",
        "effects": {
          "money": -14,
          "stress": -4,
          "reputation": 2,
          "homesick": -2
        },
        "routeWeights": {
          "chill": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "meme_turnitin_meltdown",
    "title": "查重系统集体裂开",
    "description": "交稿截止前半小时，你点了提交，系统转了一圈，弹出一行字服务暂时不可用。专业群瞬间炸了，三十多个人在同一时刻一起裂开，屏幕那头是整个年级的哀嚎。",
    "category": "study",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 24
    },
    "choices": [
      {
        "text": "立刻截图报错，群发邮件抄送所有人保平安",
        "resultText": "你抢在所有人前面把报错截图发给了导师和教务，半小时后系统恢复，学校发了延期通知。你的截图被全专业转发，你成了那个反应最快的人。",
        "effects": {
          "reputation": 5,
          "stress": -3,
          "career": 3,
          "energy": -4
        },
        "routeWeights": {
          "career": 1,
          "grind": 1
        }
      },
      {
        "text": "和群里的人开语音，集体守着刷新键",
        "resultText": "三十个人在语音里一起数一二三刷新，像在看跨年烟花。系统终于复活那一刻，全员爆发出比拿到 offer 还激动的欢呼，这是你来英国后最有归属感的一夜。",
        "effects": {
          "social": 6,
          "homesick": -5,
          "stress": 1,
          "energy": -5
        },
        "routeWeights": {
          "social": 2
        }
      },
      {
        "text": "关掉电脑去睡觉，明天的事明天再裂开",
        "resultText": "你心想反正全专业都没交上，法不责众，倒头就睡。第二天醒来果然收到延期邮件，你用最少的焦虑换到了最好的结果，佛系修行又精进了一层。",
        "effects": {
          "stress": -6,
          "energy": 4,
          "health": 3,
          "gpa": -1
        },
        "routeWeights": {
          "chill": 2,
          "homebound": 1
        }
      }
    ],
    "pool": ""
  }
];
