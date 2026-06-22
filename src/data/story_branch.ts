// Branching decision threads: a primary decision (dec_*) sets a branch flag,
// later follow-ups (flw_*) gated on that flag give different consequences.
// Bank / SIM / werewolf night / housing / job / GP / dating / travel. Real
// service names kept in prose (no logos/art) for authenticity. Authored via a
// research-room workflow, editor-QA'd, code-validated (flag-chain integrity).
import type { GameEvent } from '../game/types';

export const STORY_BRANCH: GameEvent[] = [
  {
    "id": "dec_bank",
    "title": "开银行卡这道坎",
    "description": "租房合同、工资、押金,全卡在一张本地银行卡上。室友群里为了哪家好已经吵翻天,你站在排队的那一刻才发现,选哪家其实是在选未来一年要受哪种罪。你深吸一口气。",
    "category": "life",
    "weight": 22,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "去 HSBC,听说大行靠谱,留学生标配",
        "resultText": "你选了 HSBC,网点气派,柜员客气,先给你预约了一个开户面谈。稳是稳,就是这个稳里好像藏着点什么。",
        "effects": {
          "money": -5,
          "adaptation": 4,
          "reputation": 2,
          "stress": 2
        },
        "setFlags": {
          "br_bank_hsbc": true
        },
        "routeWeights": {
          "grind": 1,
          "chill": 1
        }
      },
      {
        "text": "办小马 Monzo,纯线上,十分钟搞定",
        "resultText": "你扫码下了 Monzo,珊瑚色的卡好看得不像银行卡,App 丝滑得过分,五分钟就能转账。你心想这也太爽了,以后再也不进网点。",
        "effects": {
          "money": -3,
          "adaptation": 5,
          "english": 2,
          "social": 2
        },
        "setFlags": {
          "br_bank_monzo": true
        },
        "routeWeights": {
          "social": 1,
          "survivor": 1
        }
      },
      {
        "text": "巴克莱 Barclays,学校旁边就有网点",
        "resultText": "你走进巴克莱,顾问态度热情,当场帮你开了户,还塞给你一沓宣传单。手机很快收到第一条验证码,你还觉得挺贴心。",
        "effects": {
          "money": -4,
          "adaptation": 4,
          "social": 2,
          "energy": -4
        },
        "setFlags": {
          "br_bank_barclays": true
        },
        "routeWeights": {
          "career": 1,
          "grind": 1
        }
      },
      {
        "text": "Lloyds,老牌本地行,妈妈说求稳",
        "resultText": "你听了家里的,选了 Lloyds,那匹黑马 logo 看着就老钱。柜台办事不快但踏实,你拿到卡那刻,觉得自己总算有了根。",
        "effects": {
          "money": -4,
          "adaptation": 4,
          "homesick": -3,
          "stress": 2
        },
        "setFlags": {
          "br_bank_lloyds": true
        },
        "routeWeights": {
          "homebound": 1,
          "chill": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_bank_hsbc_meeting",
    "title": "面谈排到三周后",
    "description": "你以为开户就是签个名,结果 HSBC 给你的开户面谈排到了三周后,还要你带齐护照、签证、租房合同、地址证明。可你刚搬家,连一封写着自己名字的信都没收到。",
    "category": "life",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 9,
      "flagsSet": [
        "br_bank_hsbc"
      ]
    },
    "choices": [
      {
        "text": "求室友把账单加上你名字凑地址证明",
        "resultText": "你厚着脸皮拜托室友,把水电账单临时加了你的名字。地址证明是凑齐了,你也欠下了一顿火锅的人情,还好关系反而近了。",
        "effects": {
          "money": -15,
          "social": 5,
          "stress": -3,
          "adaptation": 3
        },
        "routeWeights": {
          "social": 1
        }
      },
      {
        "text": "硬等三周,先用现金和家里转账撑着",
        "resultText": "你决定死等,这三周靠现金和家里临时转账过活,押金交得提心吊胆,生怕房东以为你是骗子。等卡到手那天,你长舒一口气。",
        "effects": {
          "money": -30,
          "stress": 6,
          "homesick": 4,
          "energy": -4
        },
        "routeWeights": {
          "survivor": 1,
          "homebound": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_bank_monzo_frozen",
    "title": "小马卡被冻了",
    "description": "你在网上抢了张演出票,刚付完,Monzo 弹窗,检测到可疑交易,账户已临时冻结。你的钱、你的房租,全锁在 App 里,而它只让你拍一段举着证件念数字的验证视频。",
    "category": "life",
    "weight": 16,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 11,
      "flagsSet": [
        "br_bank_monzo"
      ]
    },
    "choices": [
      {
        "text": "躲进厕所隔间,对着手机拍验证视频",
        "resultText": "你冲进图书馆厕所最里那间,举着护照对镜头一字一句念编号,声音压到最低还是怕被听见。十分钟后账户解冻,你盯着那条恢复正常的余额,哭笑不得。",
        "effects": {
          "english": 2,
          "stress": -2,
          "adaptation": 4,
          "energy": -4
        },
        "routeWeights": {
          "survivor": 1
        }
      },
      {
        "text": "赌气把房租转去别的卡,Monzo 先晾着",
        "resultText": "你气不过,连夜把房租和应急的钱挪到另一张卡,让 Monzo 自己冷静。纯线上的方便,这一刻全变成了没人能当面找的无助。",
        "effects": {
          "money": -10,
          "stress": 5,
          "adaptation": 3,
          "reputation": -2
        },
        "setFlags": {
          "br_bank_monzo_distrust": true
        },
        "routeWeights": {
          "survivor": 1,
          "homebound": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_bank_barclays_otp",
    "title": "验证码连环轰炸",
    "description": "巴克莱的 App 像是和你过不去,登录要验证码,转账要验证码,改个昵称也要验证码,而验证码偏偏发到你那张还没激活的英国号上。你看着空荡荡的收件箱,血压升高。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 14,
      "flagsSet": [
        "br_bank_barclays"
      ]
    },
    "choices": [
      {
        "text": "打客服热线,跟着语音菜单转半天",
        "resultText": "你拨通客服,在按 1 按 2 的语音迷宫里绕了二十分钟,终于把验证方式改成了 App 内确认。挂电话那刻,你的英文听力被迫又上了一个台阶。",
        "effects": {
          "english": 3,
          "energy": -4,
          "stress": -2,
          "adaptation": 4
        },
        "routeWeights": {
          "grind": 1
        }
      },
      {
        "text": "先用 giffgaff 临时号收码顶一阵",
        "resultText": "你翻出当初落地买的 giffgaff 卡,把验证号临时换成它,总算能收到码了。临时方案虽丑,但你学会了在英国,先能用比好用重要。",
        "effects": {
          "money": -8,
          "adaptation": 5,
          "stress": -3,
          "english": 2
        },
        "routeWeights": {
          "survivor": 1,
          "chill": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_bank_lloyds_branch_closed",
    "title": "网点关门只能打电话",
    "description": "你为了改个限额特地跑去 Lloyds 网点,结果门口贴着告示,本支行已永久关闭,请使用电话银行。你站在拉下的卷帘门前,身后是排着长队等公交的人,只能掏出手机准备排一小时。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 18,
      "flagsSet": [
        "br_bank_lloyds"
      ]
    },
    "choices": [
      {
        "text": "站在路边排电话队,一边排一边记单词",
        "resultText": "你把这一小时的等待变成了课堂,电话那头循环播放的提示音被你听熟了,办成事时你甚至能预判客服下一句要问什么。等待教会你忍。",
        "effects": {
          "english": 3,
          "energy": -6,
          "stress": -2,
          "adaptation": 3
        },
        "routeWeights": {
          "grind": 1,
          "scholar": 1
        }
      },
      {
        "text": "心一横,坐火车去隔壁镇找最近的网点",
        "resultText": "你查了下还开着的网点在隔壁镇,买了张 railcard 打折票就杀过去。柜台五分钟办完,你却觉得这趟值,起码有个人愿意当面听你说话。",
        "effects": {
          "money": -20,
          "homesick": -3,
          "adaptation": 4,
          "energy": -4
        },
        "routeWeights": {
          "homebound": 1,
          "chill": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "dec_sim_choose_carrier",
    "title": "办哪家手机卡",
    "description": "落地英国第一周,旧卡的国内号码在这边成了摆设。你蹲在宿舍弱弱的公共 WiFi 边,研究到底办哪家 SIM 卡才不至于一出门就跟世界失联。",
    "category": "life",
    "weight": 24,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 2
    },
    "choices": [
      {
        "text": "giffgaff,学长群里都说便宜,等卡寄到就行",
        "resultText": "你下单了那张包装上画着橙色小人的免费 SIM,被告知三到五个工作日寄到。便宜是真便宜,代价是接下来这几天你得先裸奔一阵。",
        "effects": {
          "money": -10,
          "stress": 6,
          "adaptation": 3
        },
        "routeWeights": {
          "chill": 1,
          "survivor": 1
        },
        "setFlags": {
          "br_sim_giffgaff": true
        }
      },
      {
        "text": "EE,贵是贵点,信号好不踩雷",
        "resultText": "你走进店里直接办了 EE 的合约,店员热情得让你有点慌。月费数字让你肉疼,但你安慰自己,信号好就是留学生的安全感。",
        "effects": {
          "money": -35,
          "stress": -4,
          "career": 2
        },
        "routeWeights": {
          "career": 1,
          "grind": 1
        },
        "setFlags": {
          "br_sim_ee": true
        }
      },
      {
        "text": "Three,据说流量多得用不完",
        "resultText": "你被 Three 那个看起来无限的流量套餐说服了,当场激活。室友意味深长地看了你一眼,说了句你当时没听懂的话,信号看脸。",
        "effects": {
          "money": -18,
          "social": 3,
          "adaptation": 3
        },
        "routeWeights": {
          "social": 1,
          "chill": 1
        },
        "setFlags": {
          "br_sim_three": true
        }
      },
      {
        "text": "Lebara,主要为了打回国清楚",
        "resultText": "你专门挑了 Lebara,看中的就是那个便宜到不真实的国际通话套餐。爸妈那头的号码,你一个都不想因为话费犹豫。",
        "effects": {
          "money": -12,
          "homesick": -8,
          "social": 2
        },
        "routeWeights": {
          "homebound": 1
        },
        "setFlags": {
          "br_sim_lebara": true
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_sim_giffgaff_naked_week",
    "title": "等卡的一周裸奔",
    "description": "giffgaff 的卡迟迟没到,你这一周出门就是真空状态,没网没信号。一旦走出有 WiFi 的咖啡馆,你就成了这座陌生城市里一个查不了地图也叫不了车的孤魂。",
    "category": "life",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 4,
      "flagsSet": [
        "br_sim_giffgaff"
      ]
    },
    "choices": [
      {
        "text": "靠提前截图的地图和死记硬背认路",
        "resultText": "你把路线截图存在相册里,像九十年代的人那样靠纸面记忆穿城。神奇的是,这周你对这座城的地形居然比谁都熟。",
        "effects": {
          "adaptation": 5,
          "stress": 4,
          "energy": -6
        },
        "routeWeights": {
          "survivor": 1
        }
      },
      {
        "text": "厚脸皮蹭沿途店里的免费 WiFi 续命",
        "resultText": "你摸清了从宿舍到学校沿途每一家有免费 WiFi 的店,超市,快餐店,图书馆。蹭网这件事,你做出了一套通勤路线规划的水准。",
        "effects": {
          "money": -8,
          "adaptation": 4,
          "social": 2
        },
        "routeWeights": {
          "survivor": 1,
          "chill": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_sim_giffgaff_topup_riddle",
    "title": "goodybag 的玄学",
    "description": "卡终于到了,你却卡在 giffgaff 那套 goodybag 的充值逻辑上。月底套餐到底是自动续还是要手动点,你研究了半天,生怕一觉醒来流量清零变裸奔第二季。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 9,
      "flagsSet": [
        "br_sim_giffgaff"
      ]
    },
    "choices": [
      {
        "text": "设成自动续费,图个省心",
        "resultText": "你勾上了自动续费,从此不再为月底那点流量焦虑。省下来的脑容量,你拿去焦虑更值得焦虑的事,比如论文。",
        "effects": {
          "money": -12,
          "stress": -4,
          "energy": 2
        },
        "routeWeights": {
          "chill": 1,
          "grind": 1
        }
      },
      {
        "text": "坚持手动充,精打细算每一便士",
        "resultText": "你拒绝自动续费,坚持每月手动算好用量再充。这份对账单的执念,让你成了室友眼里那个连话费都要做表格的人。",
        "effects": {
          "money": 6,
          "stress": 3,
          "career": 2
        },
        "routeWeights": {
          "survivor": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_sim_three_signal_vanish",
    "title": "信号人间蒸发",
    "description": "Three 的玄学终于轮到你头上。宿舍房间的某个角落和地铁一进站,信号就当场人间蒸发,你举着手机贴墙找网的样子,活像在给房间做信号普查。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 11,
      "flagsSet": [
        "br_sim_three"
      ]
    },
    "choices": [
      {
        "text": "把房间有信号的那一小块设成神圣领地",
        "resultText": "你测出窗台靠右那二十厘米是全屋唯一满格的地方,从此重要电话都贴着窗户打。室友管那块地叫你的信号祭坛。",
        "effects": {
          "adaptation": 4,
          "stress": 4,
          "social": 3
        },
        "routeWeights": {
          "chill": 1,
          "survivor": 1
        }
      },
      {
        "text": "认命转用 WiFi 打电话,信号靠缘分",
        "resultText": "你彻底放弃和 Three 的信号搏斗,室内全靠 WiFi 通话续命,出门就当作冥想式断联。心态居然比从前平和了。",
        "effects": {
          "stress": -4,
          "homesick": 3,
          "adaptation": 3
        },
        "routeWeights": {
          "chill": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_sim_ee_billshock",
    "title": "月底账单暴击",
    "description": "EE 的月底账单到了,数字比你记忆里那个套餐价多出一截。你一行行翻明细,才想起那次出城漫游和那个手滑点进去的增值服务,贵有贵的道理,但贵得让你心碎。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 13,
      "flagsSet": [
        "br_sim_ee"
      ]
    },
    "choices": [
      {
        "text": "打客服一项项问清楚,该退的退",
        "resultText": "你鼓起勇气用蹩脚口语打了客服热线,在转接和等待音乐里磨了四十分钟,居然真把一项莫名其妙的费用问掉了。这通电话你的英语听力突飞猛进。",
        "effects": {
          "money": 20,
          "english": 3,
          "stress": 4
        },
        "routeWeights": {
          "career": 1,
          "survivor": 1
        }
      },
      {
        "text": "认了,顺手把套餐降到便宜档",
        "resultText": "你懒得纠缠,直接把套餐换成更朴素的一档,信号好这件事你还是不舍得放。从此每月账单数字固定,心也跟着固定了下来。",
        "effects": {
          "money": -15,
          "stress": -6,
          "adaptation": 3
        },
        "routeWeights": {
          "chill": 1,
          "grind": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_sim_lebara_homecall_paradox",
    "title": "打回国清晰本地卡顿",
    "description": "Lebara 打回家这件事确实没让你失望,爸妈的声音清楚得像在隔壁。讽刺的是本地这头反而时不时卡顿,你跟同学约饭的消息常常延迟半天才送达。",
    "category": "emotion",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 12,
      "flagsSet": [
        "br_sim_lebara"
      ]
    },
    "choices": [
      {
        "text": "认了,反正最想清楚听到的就是家里那头",
        "resultText": "你决定不折腾了,本地卡顿就卡顿,只要每周和家里那通电话清清楚楚,这张卡就值。想家的时候,声音清晰本身就是一种安慰。",
        "effects": {
          "homesick": -8,
          "social": -2,
          "stress": -4
        },
        "routeWeights": {
          "homebound": 2
        }
      },
      {
        "text": "再配一张本地卡专门用本地,双卡分工",
        "resultText": "你索性又办了张本地便宜卡,一张管思念一张管社交,手机双卡各司其职。月费多了一点,但两头的人你一个都没耽误。",
        "effects": {
          "money": -14,
          "social": 4,
          "homesick": -4
        },
        "routeWeights": {
          "social": 1,
          "survivor": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "dec_werewolf",
    "title": "局之夜被拉去狼人杀",
    "description": "周五晚上,室友把你拽进客厅,说人差一个,今晚必须凑桌狼人杀。你看着茶几上那叠皱巴巴的身份牌,心里盘算着到底要演哪一出,还是干脆只想坐在角落吃薯片。",
    "category": "social",
    "weight": 23,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "抢着当狼,今晚我要带飞全场",
        "resultText": "你拿到狼牌,心里那点表演欲瞬间被点燃。你告诉自己今晚要么 carry 要么躺,反正狼最刺激。第一晚刀人的时候手都在抖,但你装得跟没事人一样,给自己定了个目标,活到天亮。",
        "effects": {
          "social": 5,
          "stress": 4,
          "energy": -5,
          "adaptation": 3
        },
        "routeWeights": {
          "social": 1.4
        },
        "setFlags": {
          "br_were_wolf": true
        }
      },
      {
        "text": "当预言家,正义之光是我",
        "resultText": "你翻开预言家牌,心里一沉又一喜。你最怕的就是被狼悍跳,但你也最想验人。第一晚你查了左边那位,是个金水,你默默记下,想着明天怎么把这条信息漂亮地抛出去,又不被一刀带走。",
        "effects": {
          "gpa": 2,
          "stress": 6,
          "social": 4,
          "english": 2
        },
        "routeWeights": {
          "scholar": 1.2,
          "social": 1.2
        },
        "setFlags": {
          "br_were_seer": true
        }
      },
      {
        "text": "当个老实平民,跟票就行",
        "resultText": "你摸到一张平民牌,松了口气,心想这局不用动脑了,听谁说得有道理就跟谁。可你很快发现,平民才是最容易背锅的角色,因为你手里什么都没有,只有一张嘴和一票,错投一次就万劫不复。",
        "effects": {
          "energy": -4,
          "social": 3,
          "adaptation": 3
        },
        "routeWeights": {
          "chill": 1.2
        },
        "setFlags": {
          "br_were_villager": true
        }
      },
      {
        "text": "不想玩,我就负责坐角落吃东西",
        "resultText": "你摆摆手说自己玩不来这个,缩到沙发角落抱住那包薯片。结果一整晚你成了全场最放松的人,时不时插一句神补刀的吐槽,逗得大家前仰后合,连刚被票出去的人都凑过来跟你一起当吃瓜观众。",
        "effects": {
          "energy": -2,
          "social": 6,
          "homesick": -8,
          "stress": -6
        },
        "routeWeights": {
          "social": 1.3,
          "chill": 1.2
        },
        "setFlags": {
          "br_were_eat": true
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_were_wolf_zibao",
    "title": "狼队要你自曝带队",
    "description": "几局之后又一次坐到了狼坑,这回队友被查杀了,他在桌底下用脚踢你,意思是让你自曝把火力引过来,给他争取一刀。你看着场上一脸认真的预言家,犹豫要不要把自己也搭进去。",
    "category": "social",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 9,
      "flagsSet": [
        "br_were_wolf"
      ]
    },
    "choices": [
      {
        "text": "豪气自曝,把好人节奏全打乱",
        "resultText": "你一拍桌子站起来说我狼我自曝,全场哗然。你开始疯狂带节奏,把水搅浑,硬是把两个好人引到对立面互咬。虽然你下一轮就被公投出局,但队友靠你这波混乱偷家成功,赛后大家都说你这自曝带得有水平。",
        "effects": {
          "social": 6,
          "reputation": 4,
          "stress": 5,
          "energy": -6
        },
        "routeWeights": {
          "social": 1.3
        },
        "setFlags": {
          "br_were_wolf_carry": true
        }
      },
      {
        "text": "装死装到底,绝不暴露自己",
        "resultText": "你按兵不动,全程低头研究自己的指甲,把存在感压到最低。队友被票走的时候你内心说了句对不住,但你确实苟到了后期。最后好人虽然找出了你,可那时候已经太晚,狼队赢了,有人小声说你是这局最阴的狼。",
        "effects": {
          "social": 2,
          "reputation": -3,
          "stress": -4,
          "career": 2
        },
        "routeWeights": {
          "survivor": 1.3
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_were_wolf_reputation",
    "title": "你被封了狼王称号",
    "description": "玩了几次之后,留学生群里渐渐传开了你的名声,说你是那个狼人杀桌上最难抓的人。今晚再开局,刚发完牌就有人指着你说,先别管牌,这位演技派坐下就得重点盯防。你哭笑不得,自己还啥都没干呢。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 16,
      "flagsSet": [
        "br_were_wolf_carry"
      ]
    },
    "choices": [
      {
        "text": "坦然接受人设,反向卖惨求信任",
        "resultText": "你叹气说你们这是先入为主的有罪推定,我这局可是清清白白的好人。你越喊冤大家越觉得有意思,最后真有人选择信你。你借着这层人设把信息差玩明白了,发现名气大有名气大的活法,被盯防也能转化成话语权。",
        "effects": {
          "social": 5,
          "reputation": 5,
          "adaptation": 4,
          "stress": 3
        },
        "routeWeights": {
          "social": 1.4
        }
      },
      {
        "text": "干脆收手不玩了,去厨房煮泡面",
        "resultText": "你举手投降说今晚不陪你们玩心理战了,转身去厨房给自己下了碗泡面。隔着客厅听他们为了你不在场互相猜疑,你反而觉得轻松。原来从名局里抽身,吸着泡面汤看别人内卷,也是一种胜利。",
        "effects": {
          "energy": 4,
          "stress": -8,
          "homesick": -6,
          "health": -3
        },
        "routeWeights": {
          "chill": 1.3,
          "homebound": 1.1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_were_seer_tiao",
    "title": "你被狼悍跳预言家",
    "description": "你是预言家,正准备起身报查验,对面一个人抢先站起来说自己才是真预言家,还报了一组跟你完全相反的金水查杀。全场瞬间安静,所有人的目光在你俩之间来回横跳。你知道这是狼在悍跳,可你得证明自己才是真的。",
    "category": "social",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 11,
      "flagsSet": [
        "br_were_seer"
      ]
    },
    "choices": [
      {
        "text": "稳住报验人逻辑,靠口才打对跳",
        "resultText": "你深吸一口气,把昨晚和今晚的查验链条一条条捋清楚,再点出对面那组金水自相矛盾的地方。你说话不快,但每一句都踩在点上,连英语都比平时利索了几分。慢慢地,桌上的人开始往你这边倒,真预言家的身份立住了。",
        "effects": {
          "english": 3,
          "gpa": 3,
          "reputation": 5,
          "stress": 6,
          "career": 4
        },
        "routeWeights": {
          "scholar": 1.3,
          "career": 1.2
        },
        "setFlags": {
          "br_were_seer_win": true
        }
      },
      {
        "text": "心态崩了语无伦次,被票出局",
        "resultText": "你一急,逻辑全乱了,金水和查杀报反了好几次,越解释越像狼在圆谎。对面那个悍跳的狼气定神闲,反衬得你像个小丑。最后大家把你票了出去,你瘫在沙发上,第一次体会到什么叫真预言家被冤死,憋屈得想原地解散。",
        "effects": {
          "stress": 7,
          "reputation": -3,
          "energy": -5,
          "homesick": 4
        },
        "routeWeights": {
          "survivor": 1.1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_were_seer_god",
    "title": "你成了桌上的逻辑之神",
    "description": "自从那局力压悍跳的狼之后,每次开预言家牌大家都默认你的话有分量。今晚你刚报完查验,连最爱抬杠的那位都点头说听神的。你忽然意识到,那些写论文练出来的逻辑链,居然在狼人杀桌上变成了你的主场。",
    "category": "study",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 18,
      "flagsSet": [
        "br_were_seer_win"
      ]
    },
    "choices": [
      {
        "text": "把这股推理瘾带回论文,开夜车赶 due",
        "resultText": "你被这种把信息拼成真相的快感勾住了,回房间打开半个月没碰的论文,居然写得格外顺。你发现拆狼人杀局和拆文献综述用的是同一块脑子,那一晚你写到凌晨,咖啡见了底,但思路清晰得吓人。",
        "effects": {
          "gpa": 5,
          "energy": -8,
          "stress": 3,
          "career": 3,
          "health": -3
        },
        "routeWeights": {
          "scholar": 1.5,
          "grind": 1.2
        }
      },
      {
        "text": "享受被人捧着的感觉,多约几场局",
        "resultText": "你享受这种被叫一声神的感觉,索性把周末都排满了局。你的社交圈以肉眼可见的速度扩大,连别的公寓的人都慕名来跟你同桌。代价是你的睡眠和待办清单,但你安慰自己,留学交朋友这事也得趁热打铁。",
        "effects": {
          "social": 7,
          "reputation": 4,
          "energy": -6,
          "gpa": -1,
          "homesick": -8
        },
        "routeWeights": {
          "social": 1.4
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_were_villager_beiguo",
    "title": "平民乱投票背了大锅",
    "description": "你是平民,场上吵成一团,你听着两边都有道理,一犹豫就跟着大多数把一个人票了出去。结果牌一翻,是真预言家。全桌瞬间炸锅,有人指着你说就是这种没主见的平民送的局,你脸一下子涨红了。",
    "category": "social",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 10,
      "flagsSet": [
        "br_were_villager"
      ]
    },
    "choices": [
      {
        "text": "认错复盘,下局学着自己判断",
        "resultText": "你老老实实承认是自己跟风跟错了,然后认真问真预言家当时哪条逻辑你该信。大家见你态度诚恳,气也消了,反倒七嘴八舌教你怎么听发言抓狼。这一局你输了人头,却赢了一份手把手的留学社交课。",
        "effects": {
          "adaptation": 5,
          "social": 3,
          "stress": -4,
          "gpa": 2
        },
        "routeWeights": {
          "chill": 1.2,
          "scholar": 1.1
        },
        "setFlags": {
          "br_were_villager_growth": true
        }
      },
      {
        "text": "嘴硬甩锅说发言太乱怪不得我",
        "resultText": "你不服气,梗着脖子说发言乱成那样谁能投对,要怪就怪那个不好好报验的预言家。这话一出全场更不乐意了,气氛尴尬到结冰。你嘴上赢了,可你能感觉到,下次组局有人会犹豫要不要叫上你。",
        "effects": {
          "social": -2,
          "reputation": -3,
          "stress": 3,
          "homesick": 4
        },
        "routeWeights": {
          "survivor": 1.1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_were_villager_mvp",
    "title": "老实平民逆袭抓狼王",
    "description": "又一局平民,这回你学乖了,全程不说话只记发言。到了关键一轮,你忽然站起来,把一个人前后三天自相矛盾的几句话原封不动复述出来,逻辑闭环,正是狼王。全场鸦雀无声,然后爆发出一阵起哄,说这平民开窍了。",
    "category": "social",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 17,
      "flagsSet": [
        "br_were_villager_growth"
      ]
    },
    "choices": [
      {
        "text": "乘胜带队,把好人阵营拢到一起",
        "resultText": "你趁着这股气势接着发言,把零散的好人信息一条条串起来,俨然成了民间领袖。你说着说着英语都顺了,原本怕开口的你,现在能在一屋子人面前清晰地讲完一整套推理。那种被全场跟着走的感觉,比拿高分还上头。",
        "effects": {
          "english": 3,
          "social": 6,
          "reputation": 5,
          "career": 4,
          "stress": 3
        },
        "routeWeights": {
          "social": 1.3,
          "career": 1.2
        }
      },
      {
        "text": "见好就收,安静当个隐藏高手",
        "resultText": "你抓完狼王就重新坐回去,不再多言,享受那种深藏功与名的快感。大家追问你是怎么记住那些话的,你只是笑笑说习惯了记笔记。你忽然发现,那个总在角落安静观察的自己,原来也能是桌上最关键的人。",
        "effects": {
          "adaptation": 5,
          "stress": -6,
          "gpa": 2,
          "social": 2
        },
        "routeWeights": {
          "chill": 1.3,
          "scholar": 1.1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_were_eat_qifenzu",
    "title": "吃瓜群众成了气氛组",
    "description": "你本来只想吃东西不掺和,结果你那些不经意的吐槽成了全场最大的笑点。这一晚大家玩游戏是次要的,听你解说才是主菜。有人提议下次不管玩什么都得叫上你,因为有你在桌就不会冷场。",
    "category": "social",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 9,
      "flagsSet": [
        "br_were_eat"
      ]
    },
    "choices": [
      {
        "text": "顺势接下气氛组的活,组个常驻局",
        "resultText": "你半推半就接下了这个气氛组担当,干脆拉了个小群,每周固定攒局,零食你包了。你发现自己其实不需要会玩什么游戏,能让一屋子异乡人笑着忘记想家,本身就是一种了不起的本事。慢慢地,这个局成了好几个人留学生活里最暖的固定节目。",
        "effects": {
          "social": 7,
          "homesick": -12,
          "money": -40,
          "reputation": 4,
          "energy": -4
        },
        "routeWeights": {
          "social": 1.5
        },
        "setFlags": {
          "br_were_eat_host": true
        }
      },
      {
        "text": "笑过就好,还是更想早点回房间",
        "resultText": "你陪大家笑闹了一阵,到点还是悄悄收拾东西回了房。你享受这种被需要的温暖,但也清楚自己电量有限,热闹一会儿就够了。回到安静的房间,你点开和家里的视频,觉得今晚这样的距离刚刚好,不近不远。",
        "effects": {
          "homesick": -6,
          "stress": -6,
          "energy": 3,
          "social": 2,
          "health": 3
        },
        "routeWeights": {
          "homebound": 1.3,
          "chill": 1.2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_were_eat_lianjie",
    "title": "你的零食局连接了所有人",
    "description": "你那个每周一次的零食局攒着攒着,竟成了不同公寓、不同专业的人互相认识的枢纽。有人在你这局认识了同乡,有人找到了一起赶 due 的搭子。今晚有个刚来的新生怯生生地敲门,说听说你这儿能交到朋友。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 19,
      "flagsSet": [
        "br_were_eat_host"
      ]
    },
    "choices": [
      {
        "text": "把新人拉进来,做留学圈的连接点",
        "resultText": "你笑着把新生让进门,给 ta 塞了包薯片,介绍 ta 认识在座每一个人。看着 ta 从拘谨到放松,你想起几个月前那个谁都不认识的自己。原来在异乡,能成为别人的第一个朋友,是这趟留学里你没料到的隐藏成就,比任何奖学金都让你踏实。",
        "effects": {
          "social": 8,
          "reputation": 5,
          "adaptation": 6,
          "homesick": -8,
          "career": 2
        },
        "routeWeights": {
          "social": 1.5
        }
      },
      {
        "text": "局太大有点累,想缩回小圈子",
        "resultText": "你发现局越攒越大,自己反而成了那个要操心买零食、协调时间的人,热闹背后是隐隐的疲惫。你决定把局收回到最初那几个铁哥们,宁愿小而暖。你跟新生说今晚先这样,下次再约,关上门那一刻,你长舒一口气,把分寸还给了自己。",
        "effects": {
          "energy": 5,
          "stress": -8,
          "social": -2,
          "money": 30,
          "health": 3
        },
        "routeWeights": {
          "homebound": 1.2,
          "chill": 1.3
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "dec_house",
    "title": "落脚的地方怎么定",
    "description": "开学前最后的大事就是定住处。学校宿舍、中介私人房、学长转租、还是几个人合租整租,每一个选择背后都是一整个学期的生活质感,你盯着几个网页标签来回切,知道这一下点完就回不了头了。",
    "category": "life",
    "weight": 24,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 1
    },
    "choices": [
      {
        "text": "订学校宿舍 halls,贵但省心,出了事有人管",
        "resultText": "你咬牙交了那笔比私人房贵不少的押金和房租,告诉自己买的是安心和那句随时能找物业的底气。",
        "effects": {
          "money": -180,
          "stress": -8,
          "adaptation": 4,
          "social": 4
        },
        "setFlags": {
          "br_house_halls": true
        },
        "routeWeights": {
          "chill": 1.3,
          "social": 1.2,
          "survivor": 0.8
        }
      },
      {
        "text": "找中介看私人房,正规合同,押金走 deposit scheme",
        "resultText": "你跟着中介看了三套房,挑了个通勤还行的,签了正规合同,心想押金有第三方托管总不至于被坑得太惨吧。",
        "effects": {
          "money": -150,
          "adaptation": 5,
          "stress": 2,
          "english": 2
        },
        "setFlags": {
          "br_house_agency": true
        },
        "routeWeights": {
          "grind": 1.2,
          "career": 1.1
        }
      },
      {
        "text": "接学长的二房东转租,便宜,微信群里谈的",
        "resultText": "学长在群里发了张房间照片说急转,价钱比市场低一截,你连合同都没仔细看就转了第一个月房租加押金,图的就是同胞之间的那点信任。",
        "effects": {
          "money": -90,
          "stress": 4,
          "homesick": -4,
          "adaptation": 3
        },
        "setFlags": {
          "br_house_sublet": true
        },
        "routeWeights": {
          "homebound": 1.2,
          "survivor": 1.1
        }
      },
      {
        "text": "拉几个同学合租整租一套大房子",
        "resultText": "你和几个刚认识的同学一拍即合,合租整租一套大房子,分摊下来便宜,还能一起做饭打游戏,听上去像是留学版的合家欢。",
        "effects": {
          "money": -120,
          "social": 8,
          "homesick": -6,
          "stress": 3
        },
        "setFlags": {
          "br_house_shared": true
        },
        "routeWeights": {
          "social": 1.4,
          "homebound": 1.1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_house_halls_party",
    "title": "隔壁夜夜蹦迪",
    "description": "你以为宿舍贵就买到了安静,结果隔壁那间住的是几个本科新生,周三周四周五,墙根那头的低音炮一响就是凌晨三点,你躺在床上跟着震,数着天花板上那盏灯什么时候才肯让你睡。",
    "category": "life",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 6,
      "flagsSet": [
        "br_house_halls"
      ]
    },
    "choices": [
      {
        "text": "去敲门好好说,顺便认识一下邻居",
        "resultText": "你硬着头皮去敲门,对方居然很客气地道了歉还递了罐啤酒,从此熟了,蹦迪照旧但好歹会提前知会你一声。",
        "effects": {
          "social": 6,
          "english": 2,
          "energy": -4,
          "stress": -4
        },
        "routeWeights": {
          "social": 1.3
        }
      },
      {
        "text": "走正规流程,给宿舍管理处发投诉邮件",
        "resultText": "你花了半小时斟酌措辞写了封投诉邮件,管理处第二天就贴了告示,噪音是小了,可你也莫名其妙背上了那个爱告状的留学生的名声。",
        "effects": {
          "stress": -6,
          "energy": 4,
          "reputation": -3,
          "adaptation": 3
        },
        "routeWeights": {
          "grind": 1.1
        }
      },
      {
        "text": "买副降噪耳塞,惹不起我躲得起",
        "resultText": "你认命下单了一副降噪耳塞,塞上之后世界确实清净了,只是每天醒来耳朵都有点闷,你开始怀疑这贵宿舍到底贵在哪。",
        "effects": {
          "money": -30,
          "energy": 5,
          "stress": -3,
          "health": -3
        },
        "routeWeights": {
          "chill": 1.2,
          "survivor": 1.1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_house_agency_deposit",
    "title": "押金的花式克扣",
    "description": "合同到期退房那天,中介拿着份清单逐条念给你听,地毯有一小块印子,墙上一个挂钩的孔,烤箱里一点油渍,每一项都明码标价从你押金里扣,你站在空房间里听着,感觉自己住了一年像是欠了房子一笔债。",
    "category": "life",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 38,
      "flagsSet": [
        "br_house_agency"
      ]
    },
    "choices": [
      {
        "text": "翻出入住时拍的照片,逐条据理力争",
        "resultText": "幸好你入住第一天手贱拍了一整套照片,你把那块印子和那个孔的原始照甩过去,中介脸色一变,大半押金乖乖退了回来。",
        "effects": {
          "money": 90,
          "stress": -6,
          "adaptation": 5,
          "english": 3
        },
        "setFlags": {
          "br_house_deposit_win": true
        },
        "routeWeights": {
          "grind": 1.3,
          "career": 1.1
        }
      },
      {
        "text": "查 deposit scheme 规则,正式申请仲裁",
        "resultText": "你认真研究了第三方押金托管的争议流程,正式提了仲裁,过程磨人但你学会了怎么在这个国家替自己撑腰,最后判你赢了一部分。",
        "effects": {
          "money": 60,
          "stress": 4,
          "english": 3,
          "reputation": 4
        },
        "routeWeights": {
          "career": 1.2,
          "grind": 1.1
        }
      },
      {
        "text": "懒得耗,自认倒霉签字走人",
        "resultText": "你看了眼那串扣款金额,又看了眼自己堆成山的行李和明天的航班,实在没力气再纠缠,签了字拎包就走,只在心里把这家中介拉进了永久黑名单。",
        "effects": {
          "money": -60,
          "energy": -4,
          "homesick": 3,
          "stress": 2
        },
        "routeWeights": {
          "homebound": 1.2,
          "chill": 1.1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_house_sublet_ghost",
    "title": "二房东人间蒸发",
    "description": "交房租那天学长的微信突然没了回音,头像还在,消息却像石沉大海,你这才想起当初连张正经合同都没有,那笔押金到底要找谁,你翻着聊天记录,第一次尝到信任被悬空的滋味。",
    "category": "life",
    "weight": 16,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 14,
      "flagsSet": [
        "br_house_sublet"
      ]
    },
    "choices": [
      {
        "text": "在留学生群里发动大家一起找人",
        "resultText": "你把事情发到几个留学生群里,没想到炸出好几个同样被坑的,大家拼起线索一起施压,学长终于冒头退了一部分,你也算因祸认识了一帮同病相怜的人。",
        "effects": {
          "social": 6,
          "money": 30,
          "stress": -4,
          "homesick": -4
        },
        "setFlags": {
          "br_house_sublet_caught": true
        },
        "routeWeights": {
          "social": 1.3,
          "survivor": 1.1
        }
      },
      {
        "text": "直接联系真正的房东说明情况",
        "resultText": "你绕过学长找到了房产上真正的房东,对方一头雾水才知道有人偷偷转租,你诚恳解释,房东居然愿意和你重新签一份正规合同,反倒因祸得福。",
        "effects": {
          "adaptation": 6,
          "english": 3,
          "stress": 2,
          "money": -60
        },
        "routeWeights": {
          "grind": 1.2,
          "career": 1.1
        }
      },
      {
        "text": "钱要不回来了,当作交了一笔学费",
        "resultText": "你折腾了几天发现彻底找不回那笔钱,只能苦笑着把它记成留学第一课的学费,从此谁再跟你说同胞之间不用合同,你都会想起这个空荡荡的微信对话框。",
        "effects": {
          "money": -90,
          "homesick": 6,
          "stress": 6,
          "adaptation": 3
        },
        "routeWeights": {
          "homebound": 1.3,
          "survivor": 1.1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_house_shared_dishes",
    "title": "永远没人洗的碗",
    "description": "合租的浪漫只维持了一个月,水槽里的碗堆成了考古现场,垃圾袋满到溢出来也没人肯下楼,你站在厨房里看着那摊狼藉,合家欢的滤镜碎了一地,开始认真思考室友这种生物的下限。",
    "category": "social",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 16,
      "flagsSet": [
        "br_house_shared"
      ]
    },
    "choices": [
      {
        "text": "开个室友会,排个值日表把规矩立起来",
        "resultText": "你提议大家坐下来开个会,半哄半劝地排了张值日表贴在冰箱上,虽然执行起来还是松松垮垮,但厨房总算从灾难现场退回了人间。",
        "effects": {
          "social": 5,
          "stress": -4,
          "reputation": 4,
          "energy": -4
        },
        "routeWeights": {
          "social": 1.2,
          "career": 1.1
        }
      },
      {
        "text": "实在受不了,自己默默全包了卫生",
        "resultText": "你受不了那股味道,索性自己默默把碗洗了垃圾倒了,屋子是干净了,可你心里那口气越积越沉,渐渐觉得自己成了这套房子免费的清洁工。",
        "effects": {
          "stress": 6,
          "energy": -8,
          "health": 3,
          "homesick": 4
        },
        "routeWeights": {
          "homebound": 1.2,
          "survivor": 1.1
        }
      },
      {
        "text": "划清界限,只管好自己那一摊",
        "resultText": "你想通了,谁的碗谁洗,你把自己的餐具单独收进房间,公共区域的烂摊子眼不见为净,关系是淡了点,但你的血压终于平稳了下来。",
        "effects": {
          "stress": -3,
          "social": -3,
          "adaptation": 4,
          "energy": 4
        },
        "routeWeights": {
          "chill": 1.2,
          "grind": 1.1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_house_shared_party_host",
    "title": "你家成了据点",
    "description": "合租房宽敞的代价,是它慢慢变成了所有人的聚会据点,室友今天约朋友打游戏,明天请同学吃火锅,你的客厅永远坐满了你不太认识的人,你既享受这份热闹,又开始想念一个能安静做完作业的角落。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 22,
      "flagsSet": [
        "br_house_shared"
      ]
    },
    "choices": [
      {
        "text": "干脆加入,把社交搞起来认识更多人",
        "resultText": "你想着既然躲不掉不如融进去,主动张罗了几次聚会,菜端上桌的那一刻你忽然成了这群人里的中心,孤独感被火锅的热气冲淡了不少。",
        "effects": {
          "social": 8,
          "homesick": -6,
          "energy": -4,
          "money": -30
        },
        "routeWeights": {
          "social": 1.4
        }
      },
      {
        "text": "和室友约法三章,定个安静时段",
        "resultText": "你心平气和地跟室友商量出一个互相退让的方案,工作日晚上留给安静,周末再放开热闹,大家居然都同意了,你既保住了社交也保住了 GPA。",
        "effects": {
          "stress": -4,
          "gpa": 2,
          "social": 3,
          "adaptation": 4
        },
        "routeWeights": {
          "grind": 1.2,
          "career": 1.1
        }
      },
      {
        "text": "背上书包去图书馆,把家让出去",
        "resultText": "你认了,把客厅彻底让给室友们,自己背着书包一头扎进图书馆,在那盏台灯下你反而找回了久违的专注,只是深夜回家路上的风,有点凉。",
        "effects": {
          "gpa": 3,
          "stress": 2,
          "homesick": 4,
          "energy": -4
        },
        "routeWeights": {
          "grind": 1.3,
          "scholar": 1.2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "dec_job",
    "title": "得找份兼职了",
    "description": "生活费像漏水的桶,你盯着银行 app 里那个数字,决定去找份兼职。中介群里有几条招人信息在闪。你点开哪一条?",
    "category": "career",
    "weight": 24,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 6
    },
    "choices": [
      {
        "text": "中餐馆后厨,现金日结,听说管一顿员工餐",
        "resultText": "你站在油烟里切了一下午配菜,手腕酸到抬不起来,但晚上确实端走一碗免费的盖浇饭。老板用带乡音的英语喊你阿弟,你莫名安心。",
        "effects": {
          "money": 60,
          "energy": -10,
          "stress": 4,
          "adaptation": 4
        },
        "routeWeights": {
          "survivor": 2,
          "grind": 1
        },
        "setFlags": {
          "br_job_kitchen": true
        }
      },
      {
        "text": "奶茶店,时薪还行,周末班排得满",
        "resultText": "你学会了认二十种糖度,珍珠要现煮,封口机一压一个准。店长说周末小费归你,你心里默默盘算这是笔不小的进项。",
        "effects": {
          "money": 50,
          "energy": -8,
          "social": 4,
          "english": 2
        },
        "routeWeights": {
          "social": 2,
          "survivor": 1
        },
        "setFlags": {
          "br_job_bubbletea": true
        }
      },
      {
        "text": "连锁超市理货,正规合同,但有夜班",
        "resultText": "你签了张正经合同,工牌上印着自己的名字,有点恍惚的成就感。排班表发下来,你的名字底下大半是凌晨那一栏。",
        "effects": {
          "money": 55,
          "energy": -9,
          "stress": 3,
          "reputation": 2
        },
        "routeWeights": {
          "grind": 2,
          "survivor": 1
        },
        "setFlags": {
          "br_job_supermarket": true
        }
      },
      {
        "text": "接私单,给学弟妹当家教兼帮人代购",
        "resultText": "你把课表和回国行李箱的空间都算成了产能,朋友圈挂出代购清单,顺手接了两个补课的娃。自由是自由,就是钱都得自己追着要。",
        "effects": {
          "money": 70,
          "energy": -6,
          "stress": 5,
          "career": 3
        },
        "routeWeights": {
          "career": 2,
          "grind": 1
        },
        "setFlags": {
          "br_job_tutor": true
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_job_kitchen_burn",
    "title": "后厨被烫到了",
    "description": "资深大厨一句阿弟接一下锅,你没戴隔热手套去端那口刚出炉的砂锅,手背瞬间红了一片。他头也不抬,小事,抹点牙膏。你站在水龙头下冲了五分钟,眼眶有点热。",
    "category": "life",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 11,
      "flagsSet": [
        "br_job_kitchen"
      ]
    },
    "choices": [
      {
        "text": "认真去诊所登记一下,这是工伤",
        "resultText": "你查了 GP 怎么挂号,坚持要店里给你按工伤记一笔。老板脸色不太好看,但赔了你三天工钱,也终于把那盒隔热手套挂上了墙。",
        "effects": {
          "money": 30,
          "health": 4,
          "reputation": 3,
          "stress": -4
        },
        "routeWeights": {
          "survivor": 1
        }
      },
      {
        "text": "抹点烫伤膏忍了,不想得罪人",
        "resultText": "你怕被换掉,笑着说没事没事。手背结了痂,这周班照上,只是握刀的时候会想起那一下灼痛。大厨从此叫你能扛事的阿弟,你不知道该不该高兴。",
        "effects": {
          "money": 20,
          "health": -6,
          "stress": 5,
          "adaptation": 3
        },
        "routeWeights": {
          "survivor": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_job_kitchen_cash",
    "title": "现金日结的代价",
    "description": "后厨发的是现金,一叠皱巴巴的二十镑塞进你兜里,踏实又心虚。月底你想把钱存进银行,柜员多看了你两眼问这笔现金哪来的,你忽然意识到自己连张工资条都没有。",
    "category": "career",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 16,
      "flagsSet": [
        "br_job_kitchen"
      ]
    },
    "choices": [
      {
        "text": "跟老板提一句,想要正规一点的记录",
        "resultText": "老板叹口气说这行都这样,但还是给你开了张手写的收入证明。不光彩,但你心里那块石头落了地,以后续签证查资金至少有个交代。",
        "effects": {
          "money": -10,
          "reputation": 3,
          "stress": -4,
          "adaptation": 4
        },
        "routeWeights": {
          "survivor": 1,
          "grind": 1
        }
      },
      {
        "text": "算了,反正是日结,别想太多",
        "resultText": "你把现金锁进抽屉,假装没看见那点隐患。钱是到手了,可每次刷到留学生群里聊报税、聊存款证明,你都会心头一紧。",
        "effects": {
          "money": 40,
          "stress": 6,
          "visa": -2
        },
        "routeWeights": {
          "survivor": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_job_bubbletea_rush",
    "title": "周末排队排到崩溃",
    "description": "周六下午两点,门口的队伍拐了个弯,封口机像机关枪一样响。你左手摇雪克右手戳珍珠,顾客催单的英语口音你一半都没听清。但收工时数小费,硬币和零钞铺了满桌,你又觉得一切都值。",
    "category": "career",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 11,
      "flagsSet": [
        "br_job_bubbletea"
      ]
    },
    "choices": [
      {
        "text": "咬牙顶住,把出杯速度练成肌肉记忆",
        "resultText": "三个周末下来,你成了店里出杯最快的人,店长把最忙的档期都排给你。手是真累,小费也是真厚,你开始理解为什么有人说苦钱也是钱。",
        "effects": {
          "money": 70,
          "energy": -10,
          "stress": 4,
          "english": 2
        },
        "routeWeights": {
          "survivor": 2,
          "grind": 1
        }
      },
      {
        "text": "跟店长商量,周末只上半天",
        "resultText": "你坦白说作业快撑不住了,店长意外地通情达理,给你砍了半天班。钱少了一截,但你周日终于能坐回图书馆,而不是闻着茶香写论文。",
        "effects": {
          "money": -20,
          "energy": 5,
          "gpa": 3,
          "stress": -5
        },
        "routeWeights": {
          "scholar": 2,
          "chill": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_job_bubbletea_regular",
    "title": "奶茶店遇到熟客",
    "description": "有个常来的顾客,每次都点同一杯,渐渐跟你聊熟了,原来也是同城的留学生。某天 ta 隔着柜台问你周末有没有空,说圈子里在攒一个局。你手里的封口机停了半拍。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 17,
      "flagsSet": [
        "br_job_bubbletea"
      ]
    },
    "choices": [
      {
        "text": "加个联系方式,去赴这个局",
        "resultText": "你下了班赶过去,发现是一桌天南海北的留学生在涮火锅。靠一杯奶茶认识的人,后来成了你在这座城市最常约的饭搭子,孤独感淡了不少。",
        "effects": {
          "social": 8,
          "homesick": -10,
          "energy": -4,
          "money": -15
        },
        "routeWeights": {
          "social": 3
        }
      },
      {
        "text": "礼貌收下,但你只想攒钱不想社交",
        "resultText": "你笑着说最近太忙,把心思全压在多排几个班上。账户数字涨得很稳,只是收工回到出租屋,屋里黑着灯,你会有那么一瞬间想起那桌没去成的火锅。",
        "effects": {
          "money": 35,
          "homesick": 5,
          "social": -3,
          "stress": 3
        },
        "routeWeights": {
          "grind": 2,
          "homebound": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_job_supermarket_nightshift",
    "title": "夜班困到不行",
    "description": "凌晨三点,你在冷柜区补货,荧光灯惨白,整间超市只有你和远处一个保安。手机时钟走得比谁都慢,你靠在货架上盯着一排牛奶,差点睡着。回去还有八点的课。",
    "category": "life",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 12,
      "flagsSet": [
        "br_job_supermarket"
      ]
    },
    "choices": [
      {
        "text": "硬撑,夜班补贴高,熬过这阵就好",
        "resultText": "你灌下第三罐能量饮料,把货全部上完。补贴确实诱人,可白天的课你几乎是闭着眼听完的,作息彻底拧成了一团麻花。",
        "effects": {
          "money": 50,
          "energy": -12,
          "health": -6,
          "gpa": -1
        },
        "routeWeights": {
          "grind": 2,
          "survivor": 1
        }
      },
      {
        "text": "找经理换到傍晚班,哪怕时薪低一点",
        "resultText": "你鼓起勇气用蹩脚的英语跟经理解释你是学生,白天有课。经理出乎意料地痛快,把你挪到了傍晚档。钱少了点,但你终于不用顶着黑眼圈进教室了。",
        "effects": {
          "money": -15,
          "energy": 6,
          "health": 4,
          "english": 2
        },
        "routeWeights": {
          "survivor": 1,
          "scholar": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_job_supermarket_payslip",
    "title": "第一张工资条",
    "description": "正规合同的好处这个月显形了,你收到了人生第一张英国工资条,上面整整齐齐列着工时、税号、扣掉的那点税。你截图发回家,妈妈半天没看懂,但回了一句你长大了。",
    "category": "emotion",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 18,
      "flagsSet": [
        "br_job_supermarket"
      ]
    },
    "choices": [
      {
        "text": "顺手研究下退税,听说学生交多了能要回来",
        "resultText": "你翻了半天政府网站和留学生攻略,发现自己确实被多扣了税,照着流程递了申请。几周后真退回来一小笔,你第一次觉得规则站在自己这边。",
        "effects": {
          "money": 45,
          "adaptation": 5,
          "reputation": 2,
          "stress": -3
        },
        "routeWeights": {
          "grind": 1,
          "survivor": 1
        }
      },
      {
        "text": "把工资条收好,这是份正经履历",
        "resultText": "你把工资条仔细存进文件夹,心想哪天写简历,这段超市经历也算英国本地工作经验。一份理货的活,被你悄悄记成了职业的起点。",
        "effects": {
          "career": 4,
          "reputation": 3,
          "adaptation": 3,
          "energy": -4
        },
        "routeWeights": {
          "career": 2,
          "grind": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_job_tutor_customs",
    "title": "代购被海关拦了",
    "description": "你回国一趟,行李箱塞满了客户要的奶粉和护肤品。海关那条红色通道你硬着头皮排了过去,被开箱抽查,东西虽然放行了,但客户那边的微信已经炸了,怎么还没发货,是不是想跑路?",
    "category": "career",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 13,
      "flagsSet": [
        "br_job_tutor"
      ]
    },
    "choices": [
      {
        "text": "全额退款给催得最凶那位,断舍离",
        "resultText": "你把钱退了,顺手把那位拉黑,世界清净了。代购这碗饭你算是尝够了味道,从此只留几个好说话的老客户,不再为陌生人的脾气买单。",
        "effects": {
          "money": -40,
          "stress": -6,
          "reputation": 2,
          "career": 2
        },
        "routeWeights": {
          "survivor": 1,
          "career": 1
        }
      },
      {
        "text": "连夜解释、改时间表,把单子都圆回来",
        "resultText": "你陪着笑脸一条条回消息,熬到后半夜把每个客户都安抚好,货也一一寄出。钱是赚到了,可你看着聊天框里那些催命的语气,第一次怀疑这份自由到底自由在哪。",
        "effects": {
          "money": 50,
          "stress": 8,
          "energy": -8,
          "homesick": 4
        },
        "routeWeights": {
          "career": 2,
          "grind": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_job_tutor_client",
    "title": "家教的娃考砸了",
    "description": "你带的那个学弟期中考砸了,家长在微信上语气客气,但字里行间都是失望。你回看自己的教案,其实尽力了,可对方花了钱,似乎默认买的是分数。你盯着那条消息,迟迟没回。",
    "category": "career",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 19,
      "flagsSet": [
        "br_job_tutor"
      ]
    },
    "choices": [
      {
        "text": "坦诚沟通,讲清楚学习是慢功夫",
        "resultText": "你认真写了一长段,讲孩子哪里卡住、下一步怎么补,没有甩锅也没有讨好。家长态度软了下来,反而更信任你。你忽然觉得自己有点像个真正的老师了。",
        "effects": {
          "career": 5,
          "reputation": 4,
          "english": 2,
          "stress": -4
        },
        "routeWeights": {
          "career": 2,
          "scholar": 1
        }
      },
      {
        "text": "心一横,主动退掉这个单子",
        "resultText": "你觉得为了一份兼职受这种气不值,礼貌地结束了合作。少了一笔稳定收入,但你松了口气,把省下的时间塞回自己的论文里。",
        "effects": {
          "money": -35,
          "stress": -5,
          "gpa": 3,
          "energy": 4
        },
        "routeWeights": {
          "scholar": 2,
          "chill": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "dec_gp",
    "title": "你在异国生病了",
    "description": "嗓子疼到说不出话,头也烧得发懵,你裹着被子翻手机想找个办法。在这边看病这件事,你早就听学长学姐讲过无数遍,现在轮到自己头上了。",
    "category": "life",
    "weight": 24,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 6
    },
    "choices": [
      {
        "text": "注册 GP 老老实实排队约诊",
        "resultText": "你打开 GP 诊所网站填了那份长长的表,系统淡定地告诉你最近的号在两周后。两周后,这病早该自己好了或者自己坏了,但你还是点了确认,告诉自己这才是正规流程。",
        "effects": {
          "stress": 4,
          "adaptation": 4,
          "health": -3,
          "energy": -2
        },
        "setFlags": {
          "br_gp_gp": true
        },
        "routeWeights": {
          "survivor": 1,
          "grind": 1
        }
      },
      {
        "text": "直接打车去 A&E 急诊",
        "resultText": "你想着急诊总该快吧,裹着外套打车冲到医院。前台护士看了你一眼,递给你一个号,候诊大厅里坐满了人,电视循环播着无声的新闻。你做好了等很久的准备。",
        "effects": {
          "stress": 6,
          "energy": -8,
          "money": -25,
          "health": -2
        },
        "setFlags": {
          "br_gp_ae": true
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "去 Boots 买 OTC 自己顶着",
        "resultText": "你拖着身子走进药房,对着货架上一排看不太懂的盒子研究半天,最后抓了扑热息痛和润喉糖,又被店员推荐买了瓶维 C 泡腾片。回家灌下去,告诉自己年轻人扛一扛就过去了。",
        "effects": {
          "money": -18,
          "health": 2,
          "stress": -2,
          "adaptation": 3
        },
        "setFlags": {
          "br_gp_otc": true
        },
        "routeWeights": {
          "chill": 1,
          "survivor": 1
        }
      },
      {
        "text": "视频连线国内医生,让家里寄药",
        "resultText": "你打开视频,熟悉的乡音和熟悉的处方让你瞬间安心了一半。爸妈连夜跑了趟药店,把那几样你从小吃到大的药打包成一个鼓鼓的包裹,贴上国际快递单寄了出来。你盯着物流号,开始数日子。",
        "effects": {
          "homesick": 6,
          "stress": -4,
          "money": -30,
          "health": 1
        },
        "setFlags": {
          "br_gp_homemed": true
        },
        "routeWeights": {
          "homebound": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_gp_seen",
    "title": "终于轮到你看 GP",
    "description": "两周的号终于到了,你坐进诊室,把这阵子的难受一股脑倒给医生,等着一个像样的诊断。",
    "category": "life",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 10,
      "flagsSet": [
        "br_gp_gp"
      ]
    },
    "choices": [
      {
        "text": "认真听完医嘱,多喝水多休息",
        "resultText": "医生听诊看喉咙,温和而坚定地告诉你,这是病毒性的,不需要抗生素,回去多喝水多休息就好。你愣了三秒,意识到自己排了两周队,换来一句从小听到大的叮嘱。但她说得没错,你确实也快好了。",
        "effects": {
          "stress": -2,
          "adaptation": 4,
          "health": 3,
          "english": 2
        },
        "routeWeights": {
          "survivor": 1,
          "chill": 1
        }
      },
      {
        "text": "追问能不能开点抗生素",
        "resultText": "你不甘心,小心翼翼地问能不能开点消炎药。医生很有耐心地解释为什么不开,还顺手给了你一张讲解病毒感染的小传单。你拿着那张纸走出诊室,既佩服这种克制,又有点想念家里医生大笔一挥开一袋药的爽快。",
        "effects": {
          "stress": 2,
          "english": 3,
          "adaptation": 3,
          "homesick": 4
        },
        "routeWeights": {
          "survivor": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_ae_dawn",
    "title": "急诊等到天亮",
    "description": "候诊大厅的时钟一格一格往前挪,你的号迟迟不跳,身边的人来了又走。",
    "category": "life",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 11,
      "flagsSet": [
        "br_gp_ae"
      ]
    },
    "choices": [
      {
        "text": "硬撑着等到自己的号",
        "resultText": "你在塑料椅上窝了一整夜,看着推进来的担架、捂着胳膊呻吟的人,慢慢明白了所谓急诊是按命的急程度排的,你这点嗓子疼在这个队里排不上号。天蒙蒙亮时终于轮到你,医生看了一眼说没大碍,你苦笑着走出医院迎着晨光。",
        "effects": {
          "energy": -10,
          "stress": 2,
          "adaptation": 5,
          "health": -2
        },
        "routeWeights": {
          "survivor": 2
        }
      },
      {
        "text": "等不下去,凌晨自己回家了",
        "resultText": "等到凌晨三点你彻底崩溃,看了看依然没动的叫号屏,默默起身走了。回去的夜路冷得刺骨,你边走边想这一晚到底图了个啥,但也认了,这就是异国独自生病要交的学费。",
        "effects": {
          "energy": -6,
          "stress": 5,
          "homesick": 5,
          "health": -3
        },
        "routeWeights": {
          "homebound": 1,
          "survivor": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_otc_worse",
    "title": "扛着扛着拖严重了",
    "description": "Boots 买的那几样吃下去像往大火上浇了杯温水,一周过去嗓子没好,反而开始发起低烧来。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 12,
      "flagsSet": [
        "br_gp_otc"
      ]
    },
    "choices": [
      {
        "text": "认栽,乖乖去注册 GP",
        "resultText": "你终于放下硬扛的执念,打开那个填过半截就关掉的 GP 注册页面,认认真真填完。等号的两周里你边吃药边后悔,早知如此当初就该直接走流程,省得自己白拖这么多天。",
        "effects": {
          "stress": 3,
          "health": 2,
          "adaptation": 4,
          "energy": -2
        },
        "routeWeights": {
          "survivor": 1
        }
      },
      {
        "text": "打 111 热线问问该怎么办",
        "resultText": "室友提醒你这边有个免费的 111 热线,你将信将疑拨过去,那头一步步问你的症状,最后给你预约了当晚的紧急门诊。你挂了电话松一口气,原来除了傻等和硬扛,中间还藏着这么一条路,只是没人早点告诉你。",
        "effects": {
          "stress": -3,
          "adaptation": 6,
          "english": 3,
          "health": 3
        },
        "routeWeights": {
          "survivor": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_homemed_customs",
    "title": "寄的药被海关扣了",
    "description": "物流号停在通关那一栏好几天没动,你查了又查,心里隐隐有了不祥的预感。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 13,
      "flagsSet": [
        "br_gp_homemed"
      ]
    },
    "choices": [
      {
        "text": "认了,药拿不回来就重新看病",
        "resultText": "海关一封冷冰冰的通知告诉你,有几样含特定成分的药不让寄进来,要么退回要么销毁。你盯着那行字哭笑不得,爸妈连夜跑药店的心意卡在了一道你完全没料到的关口。你叹口气,转身去预约 GP,这趟弯路走得心疼又无奈。",
        "effects": {
          "money": -20,
          "homesick": 6,
          "stress": 4,
          "adaptation": 4
        },
        "routeWeights": {
          "homebound": 1,
          "survivor": 1
        }
      },
      {
        "text": "视频里跟爸妈说没事别再寄了",
        "resultText": "你赶在他们继续操心之前打了视频,笑着说这边药房什么都买得到,以后别寄了免得白白被扣。屏幕那头的他们半信半疑地点头,你看着熟悉的客厅,鼻子一酸,原来长大就是学会反过来安慰他们,把异国的难处咽进自己肚子里。",
        "effects": {
          "homesick": -4,
          "stress": -2,
          "adaptation": 5,
          "health": 1
        },
        "routeWeights": {
          "homebound": 1,
          "survivor": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "dec_date",
    "title": "要不要谈个对象",
    "description": "一个人在异国待久了,那种想找人说说话的念头会在某个深夜悄悄冒出来。你盯着手机屏幕,想着到底要不要在这边认真处一段感情,还是先把这一年熬过去再说。",
    "category": "emotion",
    "weight": 24,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 6
    },
    "choices": [
      {
        "text": "下个交友 app 试试,反正大家都用",
        "resultText": "你注册了账号,认认真真填了简介,连那张去湖区拍的照片都翻出来了。滑了一晚上,左滑右滑滑到拇指发酸,配上了三个人,然后你就开始懂什么叫线上热情线下尴尬。",
        "effects": {
          "social": 4,
          "homesick": -4,
          "stress": 3,
          "energy": -5
        },
        "setFlags": {
          "br_date_app": true
        },
        "routeWeights": {
          "social": 1
        }
      },
      {
        "text": "让同胞朋友帮忙介绍认识的人",
        "resultText": "你跟朋友半开玩笑半认真地说了句帮我留意一下,对方当场就拉了个三人群。你顶着脸皮去打招呼,发现对方居然也是被半推半就拉进来的,两个社恐隔着屏幕互相客气,意外地不算难熬。",
        "effects": {
          "social": 3,
          "homesick": -5,
          "stress": 2,
          "adaptation": 3
        },
        "setFlags": {
          "br_date_intro": true
        },
        "routeWeights": {
          "homebound": 1
        }
      },
      {
        "text": "暗恋 lab 里那个总坐角落的人",
        "resultText": "你也说不清是什么时候开始的,可能是 ta 某次帮你接了一句你卡壳的英文,也可能只是 ta 专注看屏幕的侧脸。你什么都没做,只是每次去 lab 都会先扫一眼那个角落有没有人,然后假装很自然地坐到不远的位置。",
        "effects": {
          "homesick": -3,
          "stress": 4,
          "english": 2,
          "energy": -4
        },
        "setFlags": {
          "br_date_crush": true
        },
        "routeWeights": {
          "grind": 1
        }
      },
      {
        "text": "算了,这一年先专心搞学业",
        "resultText": "你把交友 app 的图标从主屏拖走,跟自己说等毕业了有的是时间。说完心里空了一下,但那种空很快被 deadline 填满了,你发现没有感情牵扯的日子,效率确实高得吓人。",
        "effects": {
          "gpa": 3,
          "stress": -4,
          "homesick": 4,
          "career": 2
        },
        "setFlags": {
          "br_date_single": true
        },
        "routeWeights": {
          "scholar": 1,
          "grind": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_date_app_meet",
    "title": "线下第一次见面",
    "description": "你跟 app 上聊了两周的人终于约了线下,挑了家咖啡店。你提前到了二十分钟,把要说的话在脑子里过了三遍,结果 ta 一坐下来,你脑子里那三遍全部清空,只剩天气真的不错这一句在打转。",
    "category": "social",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 11,
      "flagsSet": [
        "br_date_app"
      ]
    },
    "choices": [
      {
        "text": "硬着头皮聊下去,尬就尬吧",
        "resultText": "前十分钟两个人轮流没话找话,安静得能听见隔壁桌磨咖啡豆。但聊着聊着不知怎么戳中了一个共同吐槽点,气氛突然松了下来,散场时你发现两个人都笑得挺真。",
        "effects": {
          "social": 5,
          "english": 3,
          "homesick": -5,
          "stress": -3
        },
        "setFlags": {
          "br_date_app_secondchance": true
        },
        "routeWeights": {
          "social": 1
        }
      },
      {
        "text": "客气地喝完这杯就撤",
        "resultText": "聊到一半你心里就有数了,ta 挺好,但就是那种隔着一层玻璃的好,怎么都贴不近。你礼貌地喝完最后一口,互道了句保持联系,然后两个人都心知肚明不会再联系了。",
        "effects": {
          "social": 2,
          "stress": 4,
          "money": -12,
          "energy": -4
        },
        "routeWeights": {
          "chill": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_date_app_ghosted",
    "title": "约好了却被放鸽子",
    "description": "周五晚上你换了件像样的衬衫,提前查好了餐厅路线,到了地方点了杯水等着。十分钟,二十分钟,半小时,消息发出去显示已读不回。你坐在那看着对面空着的椅子,第一次切身体会到 ghosting 这个词的杀伤力。",
    "category": "emotion",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 13,
      "flagsSet": [
        "br_date_app"
      ],
      "flagsNotSet": [
        "br_date_app_secondchance"
      ]
    },
    "choices": [
      {
        "text": "自己点份好吃的,当犒劳自己",
        "resultText": "你赌气点了平时舍不得的一份招牌,慢慢吃完,发现一个人吃饭其实也没那么悲壮。回去的路上你把那个对话框删了,心里反而清爽,被放鸽子又不是你的错。",
        "effects": {
          "money": -18,
          "homesick": -3,
          "stress": -4,
          "adaptation": 4
        },
        "routeWeights": {
          "survivor": 1,
          "chill": 1
        }
      },
      {
        "text": "回宿舍删 app,再也不玩了",
        "resultText": "你头也不回地走回宿舍,进门就把那个 app 卸了,连带着对线上交友的最后一点期待。室友看你脸色没敢多问,默默把零食推过来。你嚼着薯片想,这玩意儿真不适合我。",
        "effects": {
          "social": -3,
          "stress": 3,
          "homesick": 4,
          "energy": -3
        },
        "setFlags": {
          "br_date_app_quit": true
        },
        "routeWeights": {
          "homebound": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_date_intro_longdistance",
    "title": "处成了却要异地",
    "description": "同胞朋友牵的那条线居然真处成了,你们这两个月好得不像话。直到对方说毕业后大概率要回国发展,而你还想在这边再闯闯。两个人坐在河边,谁都没先开口提那个绕不过去的词。",
    "category": "emotion",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 16,
      "flagsSet": [
        "br_date_intro"
      ]
    },
    "choices": [
      {
        "text": "说好异地,再难也试试",
        "resultText": "你们认真算了时差,约好每周固定视频,把异地这件事当成一个共同要打的怪。挂电话前 ta 说了句那我们就试试看,你心里清楚这会很难,但有个人愿意陪你一起难,已经很奢侈了。",
        "effects": {
          "homesick": -6,
          "stress": 5,
          "social": 3,
          "career": 2
        },
        "setFlags": {
          "br_date_intro_committed": true
        },
        "routeWeights": {
          "career": 1,
          "homebound": 1
        }
      },
      {
        "text": "趁还没太深,好聚好散",
        "resultText": "你想了很久,还是觉得给彼此一个干净的开始更好。你们没有吵,只是把这段关系轻轻放下,像合上一本读到一半但都很喜欢的书。走的时候 ta 给了你一个拥抱,那个拥抱你记了很久。",
        "effects": {
          "homesick": 5,
          "stress": 3,
          "social": -2,
          "adaptation": 4
        },
        "routeWeights": {
          "grind": 1,
          "scholar": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_date_crush_confess",
    "title": "鼓起勇气表白",
    "description": "lab 里那个角落的人下周就要结束交换回国了。你攥着手机站在走廊上,把准备了好几天的话又默念了一遍。再不说就真的没机会了,你深吸一口气,朝那个总是坐在角落的位置走过去。",
    "category": "emotion",
    "weight": 15,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 17,
      "flagsSet": [
        "br_date_crush"
      ]
    },
    "choices": [
      {
        "text": "当面说出口,不留遗憾",
        "resultText": "你磕磕巴巴地把话说完,中英文混着,语序都乱了。ta 愣了一下,然后笑了,说其实早就注意到你每次都坐附近。结果你没敢细想,但至少这一次,你没有让喜欢烂在肚子里。",
        "effects": {
          "homesick": -4,
          "stress": -3,
          "english": 3,
          "reputation": 3,
          "social": 4
        },
        "setFlags": {
          "br_date_crush_confessed": true
        },
        "routeWeights": {
          "social": 1
        }
      },
      {
        "text": "写张卡片塞过去就跑",
        "resultText": "你终究没敢当面说,把心里话写在一张卡片上,趁 ta 去接水时塞进了 ta 的笔记本里,然后落荒而逃。那天剩下的时间你都不敢去 lab,但你知道,那张卡片替你把话说出去了。",
        "effects": {
          "homesick": -3,
          "stress": 4,
          "english": 2,
          "energy": -4
        },
        "routeWeights": {
          "grind": 1,
          "chill": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_date_single_validated",
    "title": "单身反而活得通透",
    "description": "期中过后你环顾一圈,谈恋爱的同学有的甜有的累,而你把那份精力全砸在了学业和自己身上。导师在邮件里夸了你最近的进度,你坐在图书馆窗边,第一次觉得一个人也可以过得很饱满。",
    "category": "study",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 18,
      "flagsSet": [
        "br_date_single"
      ]
    },
    "choices": [
      {
        "text": "把这股劲全用在学业上",
        "resultText": "你索性给自己排了张更狠的计划表,把所有空出来的情感带宽全转成了产出。期末成绩出来那天,你看着邮件里的分数,觉得这一年没白省那些约会的钱和心力。",
        "effects": {
          "gpa": 5,
          "career": 3,
          "stress": 4,
          "homesick": 3
        },
        "routeWeights": {
          "scholar": 1,
          "grind": 1
        }
      },
      {
        "text": "学会一个人也能好好生活",
        "resultText": "你没有变成只会读书的机器,而是开始认真对自己好。一个人去看展,一个人下厨,一个人坐火车去邻近的城市。你发现单身不等于孤独,它只是把陪伴的对象换成了自己。",
        "effects": {
          "adaptation": 5,
          "homesick": -4,
          "health": 3,
          "social": 2
        },
        "routeWeights": {
          "chill": 1,
          "survivor": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "dec_travel",
    "title": "出行靠什么",
    "description": "新生周一过,你盯着地图算账。从住的地方到学校,从英国去欧洲,你得在这个昂贵的岛上挑一种活法。怎么动,决定了你接下来一年遇到的所有麻烦。",
    "category": "life",
    "weight": 24,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "去办 16-25 railcard,火车通勤",
        "resultText": "你花三十镑办了张 railcard,以后火车票打七折,心里盘算着一年能省回好几倍。站台、广播、National Rail App 成了你的日常,你开始觉得自己像个本地人,直到你认识了一个叫罢工的东西。",
        "effects": {
          "money": -30,
          "adaptation": 4,
          "energy": -4,
          "stress": 3
        },
        "setFlags": {
          "br_travel_railcard": true
        },
        "routeWeights": {
          "grind": 1,
          "social": 1
        }
      },
      {
        "text": "认 National Express 长途大巴,能省则省",
        "resultText": "你研究透了 National Express 和 Megabus 的早鸟票,三镑能从一座城到另一座城,代价是五个小时坐在散发着可疑气味的座位上。穷有穷的尊严,你告诉自己,顺便把腰托买好。",
        "effects": {
          "money": -12,
          "stress": 4,
          "homesick": 4,
          "energy": -6
        },
        "setFlags": {
          "br_travel_coach": true
        },
        "routeWeights": {
          "survivor": 2,
          "chill": 1
        }
      },
      {
        "text": "盯廉航,周末刷欧洲",
        "resultText": "你下载了 Ryanair 和 easyJet,把欧洲地图当成了打卡清单,机票有时候比一杯咖啡还便宜,你兴奋得像发现了新大陆。你还没读到行李规定那一页,那一页才是真正的故事。",
        "effects": {
          "money": -40,
          "social": 6,
          "adaptation": 3,
          "stress": 4
        },
        "setFlags": {
          "br_travel_budgetair": true
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        }
      },
      {
        "text": "买辆二手自行车,骑车上学",
        "resultText": "你在 Facebook Marketplace 上花四十镑收了辆看起来还行的二手车,卖家信誓旦旦说刹车没问题。你配了头盔和车锁,想象自己在英国的晨雾里优雅穿行,完全没考虑英国的雨,和英国人对自行车锁的执念是有原因的。",
        "effects": {
          "money": -40,
          "health": 4,
          "energy": -6,
          "adaptation": 4
        },
        "setFlags": {
          "br_travel_bike": true
        },
        "routeWeights": {
          "grind": 1,
          "scholar": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_travel_strike",
    "title": "今天没火车",
    "description": "你拖着行李准时到站,屏幕上一整排红色的 Cancelled,广播里那个温柔的女声反复说着 strike action。你掏出 railcard 苦笑,打折的前提是,得真有车开。",
    "category": "life",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 9,
      "flagsSet": [
        "br_travel_railcard"
      ]
    },
    "choices": [
      {
        "text": "认命改签,在站里耗一下午",
        "resultText": "你在站台冰冷的长椅上坐了三个小时,喝着五镑一杯的连锁咖啡,看着同样被困住的人脸上写满英国式的隐忍。你终于读懂了那种集体沉默的愤怒,这一刻你比任何时候都更像英国人。",
        "effects": {
          "energy": -8,
          "stress": 6,
          "adaptation": 4,
          "money": -8
        },
        "routeWeights": {
          "survivor": 1
        }
      },
      {
        "text": "临时拼个 BlaBlaCar 顺风车",
        "resultText": "你火速搜了拼车,跟三个陌生人挤一辆车一路聊到目的地,有人吐槽工会有人理解工会,你在后座听了一路免费的英国社会学课。省下的不只是时间,还有一段意外的对话。",
        "effects": {
          "money": -15,
          "social": 5,
          "adaptation": 3,
          "stress": -3
        },
        "routeWeights": {
          "social": 1
        }
      },
      {
        "text": "干脆在家远程,把今天献给 deadline",
        "resultText": "你认了,泡杯茶打开电脑,把本来要通勤的两小时全砸进作业里。罢工耽误了出门,却意外给了你一个高产的下午,你开始怀疑自己是不是根本不需要出门。",
        "effects": {
          "gpa": 3,
          "energy": -4,
          "homesick": 3,
          "stress": -2
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
    "id": "flw_travel_coach_jam",
    "title": "堵到怀疑人生",
    "description": "本该五小时的大巴,在 M25 上一动不动地趴了快两个小时。司机广播说前方有事故,车里二十几号人集体叹气,你看着窗外纹丝不动的车尾灯,开始重新思考三镑车票的真正成本。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 12,
      "flagsSet": [
        "br_travel_coach"
      ]
    },
    "choices": [
      {
        "text": "戴上耳机,把这趟当成强制断网",
        "resultText": "你索性把这堵车当成被迫的喘息,听完了攒了很久的播客,看着窗外的牛和雨,脑子里那些焦虑居然慢慢平了下来。最便宜的车票,买来了一段你本来舍不得给自己的发呆时间。",
        "effects": {
          "stress": -6,
          "energy": -4,
          "homesick": -3,
          "adaptation": 3
        },
        "routeWeights": {
          "chill": 2
        }
      },
      {
        "text": "掏出电脑赶作业,堵车也是学习",
        "resultText": "你在颠簸的车上打开笔记本,就着昏暗的车灯啃文献,屏幕晃得眼睛发酸。到站时你交完了作业,也彻底确认了一件事,你的腰和你的成绩,只能保住一个。",
        "effects": {
          "gpa": 4,
          "health": -6,
          "energy": -6,
          "stress": 4
        },
        "routeWeights": {
          "grind": 2,
          "survivor": 1
        }
      },
      {
        "text": "默默打开 App 算下次买火车票的钱",
        "resultText": "你算了笔账,省下的车票钱全赔进了浪费的时间和扭到的脖子,默默把火车票加进了下次出行的购物车。穷游教会你的第一课,有时候省下的是钱,赔进去的是命。",
        "effects": {
          "money": -8,
          "adaptation": 4,
          "stress": 2,
          "energy": -3
        },
        "routeWeights": {
          "survivor": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "flw_travel_baggage",
    "title": "行李超重被宰",
    "description": "登机口的 Ryanair 地勤面无表情地指着你的背包,要你塞进那个著名的金属框。塞不进就是六十镑,你蹲在登机口当众表演收纳,把三件外套一层层穿到身上,那一刻你没有尊严,只有省钱。",
    "category": "social",
    "weight": 14,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 14,
      "flagsSet": [
        "br_travel_budgetair"
      ]
    },
    "choices": [
      {
        "text": "把能穿的全穿身上,硬扛过安检",
        "resultText": "你把自己裹成了米其林轮胎,穿着三件外套和两条裤子挤进座位,热得满头大汗却一分钱没多花。同行的人笑你,你也笑自己,廉航面前,留学生没有偶像包袱这种东西。",
        "effects": {
          "money": -5,
          "social": 4,
          "stress": 3,
          "adaptation": 4
        },
        "routeWeights": {
          "survivor": 2,
          "social": 1
        }
      },
      {
        "text": "认栽付了超重费,下次学乖",
        "resultText": "你咬牙付了那笔比机票还贵的行李费,心在滴血。回去你立刻研究尺寸规定,买了个严格卡着上限的登机箱,廉航用六十镑给你上了一堂昂贵的精算课。",
        "effects": {
          "money": -55,
          "stress": 5,
          "adaptation": 3,
          "reputation": -1
        },
        "routeWeights": {
          "chill": 1
        }
      },
      {
        "text": "现场加钱托运,顺便把同行的也带上",
        "resultText": "你大方付了托运费,还帮同行塞不下的朋友一起办了,一趟下来钱包瘪了不少,但你成了那群人里最靠谱的那个。有些人脉,是用行李费换来的。",
        "effects": {
          "money": -45,
          "social": 6,
          "reputation": 4,
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
    "id": "flw_travel_bike_rain",
    "title": "雨天与失窃",
    "description": "英国的雨从来不打招呼,你骑到一半就被浇成落汤鸡,刹车在湿地上滑得让你心惊。等你某天上完课出来,只剩下一个孤零零的车锁挂在栏杆上,车没了,你才懂英国人为什么给自行车上三道锁。",
    "category": "life",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "maxYear": 1,
      "minWeek": 16,
      "flagsSet": [
        "br_travel_bike"
      ]
    },
    "choices": [
      {
        "text": "再收一辆二手车,这次上最贵的锁",
        "resultText": "你认了倒霉,又花钱收了辆车,这次配了把贵过半辆车的 D 型锁,还学会了把车停在有监控的地方。被偷一次,你才算真正读懂了这座城市的潜规则。",
        "effects": {
          "money": -55,
          "adaptation": 4,
          "stress": 4,
          "health": 2
        },
        "routeWeights": {
          "survivor": 1,
          "grind": 1
        }
      },
      {
        "text": "彻底放弃骑车,改走路加公交",
        "resultText": "你受够了雨和小偷,把骑车这事从人生选项里划掉,改成走路和等那班永远晚点的公交。少了风险也少了自由,你站在雨里等车,有点怀念那辆丢掉的破车。",
        "effects": {
          "money": -10,
          "energy": -4,
          "homesick": 4,
          "adaptation": 3
        },
        "routeWeights": {
          "chill": 1,
          "homebound": 1
        }
      },
      {
        "text": "发帖求线索,顺便认识本地骑行群",
        "resultText": "你在本地社群发帖找车,车没找回来,却被拉进了一个热心的骑行群,一群人教你哪条路安全、哪个牌子的锁防剪。丢了一辆车,换来一整个圈子,你说不清是亏是赚。",
        "effects": {
          "social": 6,
          "adaptation": 4,
          "stress": -3,
          "reputation": 3
        },
        "routeWeights": {
          "social": 2
        }
      }
    ],
    "pool": ""
  }
];
