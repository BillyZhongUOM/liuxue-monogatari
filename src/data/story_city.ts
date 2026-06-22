// Per-city and per-major signature story beats. cityIn / majorIn gated so each
// of the 8 cities and 6 majors gets its own flavour, leveraging the headline
// city roll (and matching the per-city art + BGM). Authored via a writers-room
// multi-agent workflow then editor-QA'd. Once-per-game, weekly pool, no dashes,
// no real brand or university names. The engine reads these like any event.
import type { GameEvent } from '../game/types';

export const STORY_CITY: GameEvent[] = [
  {
    "id": "city_london_zone_rent_squeeze",
    "title": "天价隔间的抉择",
    "description": "中介把你领进一间 Zone 2 的合租房，那个说是单间的隔间其实塞下一张床就转不开身，月租却比同学在别的城整套公寓还贵。你站在窄窄的走廊里，听着中介说这价格在伦敦已经算良心，心里清楚再不定就要被下一个看房的人截胡。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "london"
      ],
      "maxYear": 1,
      "minWeek": 3
    },
    "choices": [
      {
        "text": "咬牙签下离学校近的贵隔间",
        "resultText": "你把大半个月的预算签了进去，从此走路十分钟就到教学楼，省下的通勤时间确实让人踏实，只是每次看银行余额都要深吸一口气。",
        "effects": {
          "money": -180,
          "stress": 6,
          "adaptation": 4,
          "energy": -4
        }
      },
      {
        "text": "搬去 Zone 4 便宜些的房，靠地铁通勤",
        "resultText": "房租总算降到能喘气的数字，代价是每天挤进早高峰的地铁，隧道里信号全无，你学会了用通勤的四十分钟读完一篇文献，也学会了在陌生人的肩膀间站稳。",
        "effects": {
          "money": -90,
          "stress": 3,
          "adaptation": 5,
          "energy": -8
        },
        "routeWeights": {
          "grind": 2,
          "survivor": 1
        }
      },
      {
        "text": "先和同乡挤客厅打地铺过渡",
        "resultText": "你把行李堆在朋友合租屋的客厅角落，省下的钱让你睡得安心却睡不踏实，地板的凉意和深夜的关门声提醒着你，这只是临时的喘息。",
        "effects": {
          "money": 40,
          "stress": 4,
          "homesick": 4,
          "social": 3,
          "health": -4
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
    "id": "city_london_milkround_panic",
    "title": "金融城的招聘季",
    "description": "九月还没站稳脚跟，领英上已经满屏伦敦投行和咨询的秋招倒计时。室友穿着借来的西装赶去金融城的宣讲会，深夜回来时那片高楼还亮着灯，你盯着自己空白的简历，第一次真切感到这座城把节奏拨快了一倍。",
    "category": "career",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "london"
      ],
      "maxYear": 1,
      "minWeek": 8
    },
    "choices": [
      {
        "text": "跟着卷进秋招，疯狂改简历投网申",
        "resultText": "你把课业之外的每个夜晚都喂给了笔试和网申，键盘敲到手酸，收到第一封面试邀请那刻，疲惫里总算掺进一点这座城认可你的踏实感。",
        "effects": {
          "career": 7,
          "stress": 7,
          "energy": -10,
          "english": 2,
          "gpa": -1
        },
        "routeWeights": {
          "career": 3
        },
        "setFlags": {
          "joined_milkround": true
        }
      },
      {
        "text": "婉拒诱惑，先把硕士成绩稳住",
        "resultText": "你提醒自己来这里首先是读书的，关掉招聘页面回到课程论文，心里那点错过风口的焦虑没全消，但摊开的文献让你重新踏实下来。",
        "effects": {
          "gpa": 5,
          "stress": -3,
          "career": -2,
          "homesick": 2
        },
        "routeWeights": {
          "scholar": 2,
          "survivor": 1
        }
      },
      {
        "text": "约学长在金融城喝咖啡打听内情",
        "resultText": "你坐在玻璃幕墙下听学长把秋招的弯路和坑一一道来，临走他塞给你一份内推渠道，咖啡凉了，你却觉得这座孤独的城里第一次有人替你递了把梯子。",
        "effects": {
          "social": 6,
          "career": 4,
          "money": -12,
          "english": 2
        },
        "routeWeights": {
          "social": 2,
          "career": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "city_manchester_curry_mile",
    "title": "咖喱一条街的香气",
    "description": "刚搬来曼城没几周，一个本地同学说带你去那条出了名的咖喱街开开眼。还没走到街口，那股混着孜然和炭烤的香气就先扑了过来，整条街的霓虹灯牌在绵绵细雨里晕成一片暖色，你忽然觉得这座灰扑扑的北方城市，好像也没那么陌生了。",
    "category": "social",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "manchester"
      ],
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "豁出去点最辣那档，跟同学拼一桌",
        "resultText": "辣到额头冒汗、眼泪直流，你俩却笑作一团，他还教你用最地道的方式撕那张烤饼。账单分下来比想象中便宜，你心里默默把这条街收进了想家时就来的名单。",
        "effects": {
          "money": -22,
          "social": 6,
          "homesick": -8,
          "adaptation": 4,
          "health": -2
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        }
      },
      {
        "text": "挑家清清淡淡的，慢慢边吃边聊",
        "resultText": "你没逞强，点了份温和的咖喱，反倒能腾出心思好好跟人说话。一顿饭下来，你大概摸清了这城里哪家好吃、哪条电车线最该躲开，实用得很。",
        "effects": {
          "money": -18,
          "social": 4,
          "adaptation": 5,
          "homesick": -4,
          "energy": -4
        },
        "routeWeights": {
          "social": 1,
          "survivor": 1
        }
      },
      {
        "text": "笑说下次吧，自己回去煮泡面省钱",
        "resultText": "你借口作业多先溜了，回到公寓就着雨声煮泡面。香味是省下了，可窗外那片暖洋洋的灯光，后来总在你饿的时候莫名其妙地冒出来。",
        "effects": {
          "money": 8,
          "social": -3,
          "homesick": 4,
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
    "id": "city_manchester_northern_quarter_gig",
    "title": "北角的一场演出",
    "description": "学期过半，你被同学拽去北角街区看一支没听过的本地乐队。砖墙小酒馆里挤得满满当当，鼓点震得胸口发麻。这座城把音乐刻进了骨子里，你站在人群中间，第一次觉得自己不是个旁观的外人。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "manchester"
      ],
      "maxYear": 1,
      "minWeek": 19
    },
    "choices": [
      {
        "text": "彻底放开，跟着全场一起喊到嗓子哑",
        "resultText": "你忘了明早还有要交的作业，也忘了银行卡余额，就那么尽兴地跳了一整晚。散场时雨刚好停了，湿漉漉的红砖街反着灯光，你哼着记不全的旋律走回去，觉得这一年总算没白来。",
        "effects": {
          "money": -16,
          "stress": -10,
          "homesick": -6,
          "social": 5,
          "energy": -8
        },
        "routeWeights": {
          "social": 2,
          "chill": 2
        }
      },
      {
        "text": "待一会儿就借口赶论文先撤",
        "resultText": "你在最热闹的那首歌响起前抽身离场，坐末班电车回去赶进度。论文是往前推了一点，可同学群里那串照片刷出来时，你盯着看了很久，说不清是踏实还是有点遗憾。",
        "effects": {
          "gpa": 4,
          "stress": 3,
          "social": -3,
          "homesick": 3
        },
        "routeWeights": {
          "scholar": 2,
          "career": 1
        }
      },
      {
        "text": "蹭在后排听完，顺手认识隔壁几个人",
        "resultText": "你没往人堆里挤，靠在后墙边慢慢听，反倒跟旁边几个同样腼腆的留学生搭上了话。一晚下来歌没记住几首，联系方式倒是加了三四个，意外地不亏。",
        "effects": {
          "social": 4,
          "english": 2,
          "adaptation": 3,
          "stress": -4,
          "energy": -4
        },
        "routeWeights": {
          "social": 1,
          "survivor": 1
        },
        "setFlags": {
          "met_nq_friends": true
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "city_edinburgh_arthur_seat_wind",
    "title": "爬亚瑟王座",
    "description": "落地没几周，本地同学拉你去爬城边那座叫亚瑟王座的山，说山顶能看到整座城。半山腰那阵风像有人拿冰刀贴着你的脸刮，你这才明白为什么这里的人提到风，语气都带着一种认命的敬畏。",
    "category": "social",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "edinburgh"
      ],
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "咬牙顶着风爬到山顶",
        "resultText": "风把你的帽子吹去了不知道哪个山谷，但整座老城的石板屋顶在脚下铺开，城堡像积木一样小。你冻得发抖，却舍不得下山。",
        "effects": {
          "adaptation": 5,
          "social": 4,
          "energy": -10,
          "health": -4,
          "homesick": -6
        }
      },
      {
        "text": "半路投降，钻进山脚的咖啡店",
        "resultText": "你们灰溜溜退回暖气房，一人一杯热巧克力，隔着起雾的玻璃看别人继续往上冲。没登顶，但这帮人你算是认下了。",
        "effects": {
          "social": 5,
          "money": -6,
          "stress": -5,
          "energy": -4
        }
      },
      {
        "text": "假装接电话先开溜回宿舍",
        "resultText": "你编了个理由提前撤退，回到宿舍裹紧被子，刷着群里他们山顶的照片，有点后悔又有点庆幸没把自己冻成标本。",
        "effects": {
          "homesick": 4,
          "stress": 3,
          "social": -2,
          "health": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "city_edinburgh_fringe_august",
    "title": "艺穗节里的论文季",
    "description": "八月的艺穗节把整座城变成了一个没有边界的剧场，老城的石板路上塞满举着传单的演员，午夜还有人在街角唱歌。偏偏这也是你毕业论文最后冲刺的几周，窗外是全世界的狂欢，你的屏幕上是写不完的文献综述。",
    "category": "study",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "edinburgh"
      ],
      "maxYear": 1,
      "minWeek": 28
    },
    "choices": [
      {
        "text": "关上窗，戴耳塞死磕论文",
        "resultText": "你把这座城最热闹的几天关在了玻璃外面，靠耳塞和咖啡硬扛。论文进度肉眼可见地往前挪，只是偶尔抬头，会有一点说不清的失落。",
        "effects": {
          "gpa": 6,
          "career": 2,
          "stress": 5,
          "energy": -10,
          "social": -2
        }
      },
      {
        "text": "给自己放一晚，去看场街头免费秀",
        "resultText": "你挤在人群里看完一整场即兴喜剧，口音没全听懂，但全场笑你也跟着笑。回宿舍的路上整个人是松的，论文明天再说。",
        "effects": {
          "stress": -10,
          "homesick": -5,
          "social": 4,
          "english": 2,
          "gpa": -2
        }
      },
      {
        "text": "拉同门白天写晚上看，折中过",
        "resultText": "你们约定下午图书馆闭关，晚上才放自己出门。效率没拉满，但这座城最疯的夏天，你总算没有完全错过。",
        "effects": {
          "gpa": 3,
          "social": 5,
          "stress": -3,
          "energy": -8,
          "adaptation": 3
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "city_birmingham_canal_walk",
    "title": "运河边的迷路",
    "description": "有人告诉你这座城的运河比威尼斯还长，你不信，于是沿着市中心那段砖墙边的水道往外走，想看看尽头在哪。走着走着天色暗下来，你发现自己根本不知道身处城市的哪一格。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "birmingham"
      ],
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "干脆沿着水一直走下去",
        "resultText": "你走过一座座低矮的铁桥，路过废弃码头改成的酒吧和亮着灯的旧仓库，两小时后从一个完全陌生的街区钻出来，腿酸得要命，却第一次觉得这座不张扬的城其实藏着很多东西。",
        "effects": {
          "adaptation": 5,
          "social": 3,
          "energy": -10,
          "homesick": -4
        }
      },
      {
        "text": "打开手机导航乖乖回家",
        "resultText": "蓝色小箭头把你带回宿舍，路上你顺手记下了几座桥的名字，决定改天白天再来一次，这回带上相机。",
        "effects": {
          "adaptation": 3,
          "stress": -3,
          "energy": -4
        }
      },
      {
        "text": "在运河边坐下来给家里打电话",
        "resultText": "水面映着远处楼里的灯，你和家人絮絮叨叨讲了半小时这边的天气和吃食，挂掉电话时鼻子有点酸，但心里踏实了不少。",
        "effects": {
          "homesick": -8,
          "stress": -5,
          "energy": -3
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "city_birmingham_balti_triangle",
    "title": "巴尔蒂三角的散伙饭",
    "description": "毕业季临近，一个本地长大的同学拍胸脯说，没去过城南那片巴尔蒂咖喱馆扎堆的老街区，就不算真正在这座城待过。你们一群人挤进一家挂着褪色招牌的小馆子，准备给这一年画个句号。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "birmingham"
      ],
      "maxYear": 1,
      "minWeek": 28
    },
    "choices": [
      {
        "text": "点满一桌，认真吃这顿散伙饭",
        "resultText": "薄如纸的烤饼裹着咖喱一份接一份上桌，大家用各自的口音抢着讲这一年的糗事，辣得直灌冰水还停不下嘴，你忽然舍不得这座教会你好好过日子的城了。",
        "effects": {
          "social": 7,
          "homesick": -6,
          "money": -32,
          "energy": -4,
          "stress": -4
        }
      },
      {
        "text": "各付各的之后陪大家走回市中心",
        "resultText": "几个人沿着夜里的大路慢慢往回晃，路过那座立在购物中心外的铜牛，有人提议合个影留念，快门一按，这一年就这么被定格在了中部这座不爱炫耀的城里。",
        "effects": {
          "social": 5,
          "reputation": 3,
          "money": -20,
          "homesick": -3
        }
      },
      {
        "text": "悄悄记下这家店，打算带爸妈来",
        "resultText": "你拍下菜单和门脸，盘算着等家人来参加毕业典礼时一定带他们来这条街，让他们也尝尝你这一年最想念的味道，对前路的迷茫好像也没那么压人了。",
        "effects": {
          "homesick": -5,
          "stress": -3,
          "career": 3,
          "money": -16
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "city_sheffield_peak_hike",
    "title": "国家公园就在门口",
    "description": "室友说这座城最划算的事，是公交半小时就能钻进那片峰区旷野。周六清早她在群里喊你去爬一座叫妈妈山的山头，可你那篇课程论文还差一半，窗外的天又灰得说不准会不会下雨。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "sheffield"
      ],
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "跟去，把书包塞进登山包",
        "resultText": "山脊上风大得说话都被吹散，可一回头是连绵到天边的荒原和羊群。下山时鞋全是泥，你却觉得这半年第一次真正喘上了气。",
        "effects": {
          "energy": -10,
          "stress": -10,
          "homesick": -8,
          "adaptation": 5,
          "social": 4,
          "gpa": -1
        },
        "routeWeights": {
          "chill": 2,
          "social": 1
        },
        "setFlags": {
          "peak_hiker": true
        }
      },
      {
        "text": "留在宿舍把论文啃完",
        "resultText": "群里陆续刷出他们在山顶的照片，你盯着文档把最后一段补上。论点是齐了，只是合上电脑那刻，屋里安静得有点空。",
        "effects": {
          "gpa": 4,
          "english": 2,
          "stress": 4,
          "homesick": 3,
          "social": -2
        },
        "routeWeights": {
          "scholar": 2
        }
      },
      {
        "text": "上午写完，下午追下半程",
        "resultText": "你赶在午后云开时挤上末班车，在半山腰接上了大部队。两头都没落下，代价是这一天被你过成了小跑。",
        "effects": {
          "energy": -12,
          "stress": 2,
          "gpa": 2,
          "adaptation": 4,
          "social": 2,
          "homesick": -3
        },
        "routeWeights": {
          "survivor": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "city_sheffield_seven_hills",
    "title": "这城的坡没有尽头",
    "description": "期末季，你每天要从山脚的图书馆爬回半山腰的住处。本地人骄傲地说这是建在七座山上、全英最绿的旧钢铁城，你一边喘一边想，绿是真绿，腿也是真酸。今早膝盖隐隐发出抗议。",
    "category": "life",
    "weight": 11,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "sheffield"
      ],
      "maxYear": 1,
      "minWeek": 28
    },
    "choices": [
      {
        "text": "认了，把爬坡当免费健身",
        "resultText": "你索性每天多绕一条爬树荫最密的那条路。一个月下来小腿结实了，赶进度熬夜的精神居然也跟着稳了些，这城用坡把你练了出来。",
        "effects": {
          "health": 5,
          "energy": -6,
          "stress": -6,
          "adaptation": 5,
          "homesick": -2
        },
        "routeWeights": {
          "survivor": 2,
          "chill": 1
        }
      },
      {
        "text": "买月票改坐那趟爬坡公交",
        "resultText": "公交慢悠悠绕着山腰走，你靠窗背单词，看暮色一点点漫过满城的树。膝盖是省下了，钱包薄了一截，倒也心甘情愿。",
        "effects": {
          "money": -55,
          "energy": 4,
          "stress": -3,
          "english": 2,
          "health": 2
        },
        "routeWeights": {
          "chill": 1
        }
      },
      {
        "text": "省钱硬扛，膝盖先扛着",
        "resultText": "你一分没花，继续每天两趟陡坡。期末是熬下来了，只是最后一周下楼时膝盖那声闷响，提醒你这账迟早要还。",
        "effects": {
          "money": 30,
          "health": -5,
          "stress": 4,
          "energy": -8,
          "gpa": 2
        },
        "routeWeights": {
          "grind": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "city_bristol_clifton_climb",
    "title": "坡上的合租屋",
    "description": "你的合租屋在城西半山腰的克利夫顿，每天回家像在还一笔体力债。室友提议周末爬到悬索桥那头野餐，可你看着窗外又开始飘的西南细雨，实在不想动。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "bristol"
      ],
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "跟着爬上去，雨里看桥",
        "resultText": "雨到桥头反而停了，整条峡谷在脚下铺开，室友递来一块还温的派。腿酸得发抖，可这一刻你忽然觉得，选了这座坡多的城也不亏。",
        "effects": {
          "social": 5,
          "health": 3,
          "homesick": -6,
          "energy": -8
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        }
      },
      {
        "text": "留在家把暖气开足",
        "resultText": "你窝在沙发上听雨打窗，省下了爬坡的力气，也错过了室友手机里那张峡谷照片下面一长串的笑。",
        "effects": {
          "energy": 4,
          "stress": -4,
          "social": -3,
          "homesick": 3
        },
        "routeWeights": {
          "chill": 2
        }
      },
      {
        "text": "改约一家半山的独立咖啡馆",
        "resultText": "你把野餐改成了坐下来喝手冲，西南口音的老板多送了你一块饼干。钱包瘪了点，但聊到打烊，谁也没急着走。",
        "effects": {
          "social": 4,
          "money": -14,
          "english": 2,
          "stress": -3
        },
        "routeWeights": {
          "social": 1,
          "chill": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "city_bristol_balloon_dawn",
    "title": "热气球的清晨",
    "description": "毕业季撞上了一年一度的热气球节，凌晨四点半，朋友在群里喊你去看几十只气球同时升空。窗外天还没亮，你的论文也还差一节没写完。",
    "category": "emotion",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "bristol"
      ],
      "maxYear": 1,
      "minWeek": 28
    },
    "choices": [
      {
        "text": "爬起来骑车去港区看升空",
        "resultText": "你在港区边喘着气，几十只气球贴着晨雾一起离地，整座城像被人轻轻托了起来。论文还在等你，可你知道这一幕这辈子就这一次。",
        "effects": {
          "homesick": -8,
          "social": 4,
          "energy": -6,
          "stress": -4
        },
        "routeWeights": {
          "chill": 2,
          "social": 1
        }
      },
      {
        "text": "留在桌前把那一节写完",
        "resultText": "你听着远处隐约的人声把段落收了尾，天亮时存好文档。错过的气球有点遗憾，但交稿前能多睡个安稳觉，也算值。",
        "effects": {
          "gpa": 5,
          "career": 2,
          "stress": 3,
          "social": -2
        },
        "routeWeights": {
          "scholar": 2,
          "survivor": 1
        }
      },
      {
        "text": "拉开窗帘在阳台远远地看",
        "resultText": "你披着被子站在阳台，远处的气球只有指甲盖大，却也够你看得出神。既没耽误进度，也没全错过这座城最骄傲的清晨。",
        "effects": {
          "homesick": -3,
          "stress": -2,
          "gpa": 1,
          "energy": -2
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
    "id": "city_oxford_formal_hall",
    "title": "第一次正式晚宴",
    "description": "学院通知今晚有正式晚宴，要穿黑袍子在烛光长桌上正襟危坐地吃三道菜，旁边坐着不知聊什么的本地同学。你站在镜子前，发现那件租来的袍子袖子长得能扫地。",
    "category": "social",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "oxford"
      ],
      "maxYear": 1,
      "minWeek": 5
    },
    "choices": [
      {
        "text": "硬着头皮去，主动找人搭话",
        "resultText": "拉丁文祷词听不懂，刀叉用错了一把，但你壮着胆子问邻座那幅墙上的老画像是谁，话匣子就这么开了，散场时多了两个会一起去图书馆的人。",
        "effects": {
          "social": 7,
          "english": 3,
          "adaptation": 4,
          "stress": 3,
          "energy": -6
        },
        "routeWeights": {
          "social": 2,
          "scholar": 1
        }
      },
      {
        "text": "去是去了，全程低头扒饭",
        "resultText": "袍子穿得一丝不苟，菜也吃得干干净净，可你从头到尾没敢接一句话，回宿舍路上望着满城尖顶，忽然有点说不清的孤单。",
        "effects": {
          "adaptation": 3,
          "homesick": 4,
          "energy": -4,
          "stress": 2
        }
      },
      {
        "text": "推说没空，留宿舍煮泡面",
        "resultText": "你给自己找了个体面的借口，窝在被子里刷手机。泡面很香，但室友群里那张烛光长桌的合照，你来回看了好几遍。",
        "effects": {
          "energy": 6,
          "homesick": 3,
          "social": -3,
          "money": 3
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
    "id": "city_oxford_punting_cherwell",
    "title": "小河上撑篙",
    "description": "天气难得放晴，几个同学非要拉你去城里那条小河上撑篙，说一年制硕士再不体验这座城就毕业了。可那根长篙在你手里像有自己的脾气，船一直往岸边的柳树丛里钻。",
    "category": "social",
    "weight": 11,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "oxford"
      ],
      "maxYear": 1,
      "minWeek": 24
    },
    "choices": [
      {
        "text": "豁出去自己撑，笑场也认了",
        "resultText": "你把整船人撑进了柳枝里，篙差点没拔出来，全船笑作一团，有人拍下你手忙脚乱的样子。狼狈是真狼狈，可你忽然觉得，论文之外的这座城，原来这么轻。",
        "effects": {
          "social": 6,
          "stress": -8,
          "adaptation": 5,
          "energy": -6,
          "homesick": -4
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        }
      },
      {
        "text": "把篙让给会的人，自己负责拍照",
        "resultText": "你躺在船头当甲板摄影师，阳光、河水、两岸的尖顶，连水鸭都入了镜。一整天没碰一个字的论文，回去看相册的时候，难得没有愧疚。",
        "effects": {
          "stress": -6,
          "social": 3,
          "homesick": -3,
          "energy": -3,
          "adaptation": 3
        },
        "routeWeights": {
          "chill": 2
        }
      },
      {
        "text": "婉拒，回去赶毕业论文",
        "resultText": "你坐在窗边敲论文，听着窗外飘进来的笑声，进度条确实往前挪了一格。冲刺季的你很清醒，只是关窗那一下，心里咯噔了一声。",
        "effects": {
          "gpa": 5,
          "career": 2,
          "stress": 4,
          "social": -3,
          "homesick": 3
        },
        "routeWeights": {
          "scholar": 2,
          "survivor": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "city_cambridge_punting_cam",
    "title": "河上的撑篙",
    "description": "落地第三周，室友拉你去城里那条河撑篙。你握着那根又长又滑的篙，看着撑船人轻描淡写地从那座古桥下绕过，心想这有什么难。轮到你时，篙陷进河底淤泥，船却继续往前漂，你和篙的距离一寸一寸拉开。",
    "category": "life",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "cambridge"
      ],
      "maxYear": 1,
      "minWeek": 4
    },
    "choices": [
      {
        "text": "果断松手保命，让篙留在河里",
        "resultText": "你放掉篙，船晃了两下稳住，全船人笑作一团。撑船人划过来帮你捞篙，你红着脸用蹩脚英文道歉，反倒和半船陌生人聊熟了。这座城的尴尬，好像都是软的。",
        "effects": {
          "social": 6,
          "homesick": -8,
          "adaptation": 4,
          "english": 2,
          "energy": -5
        },
        "routeWeights": {
          "social": 2,
          "chill": 1
        }
      },
      {
        "text": "死死抱住篙不撒手，整个人被吊在河面",
        "resultText": "你像挂历一样悬在篙上，船开走了，你慢慢滑进河里。九月的河水凉得清醒。爬上岸那刻你想，留学第一课原来是学会及时认输，可惜衣服和手机一起牺牲了。",
        "effects": {
          "homesick": 4,
          "health": -5,
          "money": -90,
          "adaptation": 3,
          "stress": 5,
          "energy": -8
        }
      },
      {
        "text": "干脆坐下不撑了，看别人怎么过桥",
        "resultText": "你把篙横在膝上当看客，盯着一船船人从那座古桥下穿过。有人说那桥当年是不用一颗螺丝拼起来的，后人拆开想复原，反而再装不回去。你忽然觉得，有些事看懂比做到更踏实。",
        "effects": {
          "stress": -6,
          "adaptation": 3,
          "social": 2,
          "energy": -4
        },
        "routeWeights": {
          "chill": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "city_cambridge_may_ball",
    "title": "五月舞会的门票",
    "description": "三学期快到头，满城都在传五月舞会的事。学院制把这场舞会做成一年里最盛大的夜，香槟、烟火、通宵到天亮，门票却贵得让你倒吸一口气。可你的毕业论文截止就压在那几天，正式晚宴上同桌的人都在问你去不去。",
    "category": "social",
    "weight": 13,
    "oncePerGame": true,
    "cond": {
      "cityIn": [
        "cambridge"
      ],
      "maxYear": 1,
      "minWeek": 28
    },
    "choices": [
      {
        "text": "咬牙买票，这种夜一辈子可能只有一次",
        "resultText": "你穿上租来的礼服，在草坪上看烟火炸开整座城的夜空，凌晨四点和一群同样熬红了眼的人坐在石阶上分一块冷掉的点心。论文还得回去赶，可这一夜的画面，你知道很多年后还会想起。",
        "effects": {
          "social": 8,
          "money": -180,
          "homesick": -10,
          "stress": 4,
          "career": 2,
          "energy": -10
        },
        "routeWeights": {
          "social": 3,
          "chill": 1
        }
      },
      {
        "text": "不去，把那笔钱和那几个通宵都留给论文",
        "resultText": "舞会那夜，远处的烟火声隔着窗传进来，你的屏幕上是改到第六稿的结论段。室友发来草坪上的照片，你点了个赞，然后把咖啡续满。毕业证不会问你去没去舞会，你这么劝自己。",
        "effects": {
          "gpa": 6,
          "stress": 6,
          "homesick": 5,
          "career": 3,
          "social": -3,
          "energy": -6
        },
        "routeWeights": {
          "scholar": 2,
          "survivor": 2
        }
      },
      {
        "text": "只买便宜的尾场票，去蹭最后两小时",
        "resultText": "你赶在天快亮时溜进会场，香槟早就没了，乐队在收设备，可草坪上还有人不肯散。你和几个同样精打细算的留学生站在烟火的余烬里，既省了钱，又算是到过场。这座城教会你的，是怎么在缝隙里抠出一点浪漫。",
        "effects": {
          "social": 4,
          "money": -60,
          "homesick": -5,
          "adaptation": 3,
          "stress": 2,
          "energy": -6
        },
        "routeWeights": {
          "grind": 2,
          "survivor": 1
        }
      }
    ],
    "pool": ""
  }
];

export const STORY_MAJOR: GameEvent[] = [
  {
    "id": "maj_business_free_rider",
    "title": "小组里的隐形人",
    "description": "毕业大作业五个人一组，占总分四成，可那位西装永远笔挺、嘴上人脉不离口的同学，从第一周起就只在群里发表情包。截止前三天，你打开共享文档，他那部分还是一片空白，而你已经把别人的坑也填了一半。",
    "category": "study",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "majorIn": [
        "business"
      ],
      "maxYear": 1,
      "minWeek": 19
    },
    "choices": [
      {
        "text": "深夜把他那部分也扛下来，先保住整组的分",
        "resultText": "你顶着台灯改到凌晨三点，文档最后一行打完时窗外天都灰了。作业拿了高分，组里所有人都松口气，只有你清楚那个漂亮的结论里有多少是你一个人熬出来的。",
        "effects": {
          "gpa": 5,
          "energy": -11,
          "stress": 7,
          "health": -4,
          "reputation": 3
        },
        "routeWeights": {
          "scholar": 2,
          "grind": 1,
          "survivor": 1
        }
      },
      {
        "text": "在同伴互评里如实写下每个人的贡献",
        "resultText": "你犹豫了很久，还是把真实分工原原本本填进了同伴评分表。他后来在走廊里跟你点头时神色有点僵，但你第一次觉得，有些边界比一顿尴尬更值得守住。",
        "effects": {
          "reputation": 4,
          "career": 3,
          "social": -3,
          "stress": 4
        },
        "routeWeights": {
          "career": 2,
          "survivor": 1
        }
      },
      {
        "text": "约他面谈，把任务拆细钉死到每一天",
        "resultText": "你请他喝了杯咖啡，没指责，只把剩下的活儿拆成一张写满日期的小清单推过去。他大概没料到这一手，居然真的赶在最后一晚交了东西，虽然质量一般，这场仗到底是一起打完的。",
        "effects": {
          "social": 5,
          "career": 4,
          "english": 2,
          "energy": -6,
          "stress": 2
        },
        "routeWeights": {
          "social": 2,
          "career": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "maj_cs_build_fails_at_dawn",
    "title": "凌晨三点的报错",
    "description": "编程作业还有六小时截止，本地跑得好好的代码，一传到学校那台评测服务器就满屏红字，报的还是个你从没见过的依赖版本冲突。机房只剩你和嗡嗡作响的风扇，你盯着那行编译失败，忽然有点想笑，又有点想哭。",
    "category": "study",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "majorIn": [
        "cs"
      ],
      "maxYear": 1,
      "minWeek": 10
    },
    "choices": [
      {
        "text": "一行行扒文档，把环境对齐到死磕出来",
        "resultText": "你顺着报错往上游翻，终于在某个论坛角落里找到那句锁版本的配置，提交框跳出绿色那一刻，天也亮了。代码能跑，人快报废，但这一夜你是真的把工具链摸透了。",
        "effects": {
          "gpa": 6,
          "career": 4,
          "energy": -12,
          "stress": 6,
          "health": -4
        },
        "routeWeights": {
          "grind": 2,
          "career": 1
        }
      },
      {
        "text": "厚着脸皮在课程群里求助助教",
        "resultText": "助教居然秒回，丢来一行命令说服务器是旧版本，本地降级就行。你照做，代码过了，顺手还把救命方法记进了自己的笔记。开口求助没那么丢人，反倒省下半条命。",
        "effects": {
          "gpa": 3,
          "social": 4,
          "english": 2,
          "stress": -4,
          "energy": -4
        },
        "routeWeights": {
          "social": 1,
          "survivor": 1
        }
      },
      {
        "text": "交上本地能跑的版本，在注释里写明环境，认了",
        "resultText": "你把能跑的截图和环境说明一并附上，赌助教手下留情。分数被扣了一截，可你倒头就睡，第二天醒来想通一件事，有时候交得出去，比交得完美更重要。",
        "effects": {
          "gpa": 1,
          "stress": -6,
          "energy": -4,
          "health": 3
        },
        "routeWeights": {
          "chill": 2,
          "survivor": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "maj_engineering_group_report_allnighter",
    "title": "通宵赶组报告",
    "description": "实验报告今晚十一点截止，四人小组的共享文档里却只有你一个人在动光标。仿真图死活不收敛，那个从开题起就没出现过的组员，刚把头像换成了度假海滩。",
    "category": "study",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "majorIn": [
        "engineering"
      ],
      "maxYear": 1,
      "minWeek": 9,
      "statLte": {
        "energy": 75
      }
    },
    "choices": [
      {
        "text": "一个人扛完，连他那部分一起补",
        "resultText": "你在实验室待到凌晨四点，把别人空着的章节也填上了，仿真终于收敛的那一刻你差点哭出来。报告交得漂亮，可你看着提交页面上四个人的名字，心里那点不平像没散的咖啡因，一直泛到天亮。",
        "effects": {
          "gpa": 6,
          "career": 3,
          "energy": -12,
          "stress": 8,
          "health": -5,
          "reputation": 2
        },
        "routeWeights": {
          "scholar": 2,
          "grind": 1
        }
      },
      {
        "text": "在群里点名分工，把活拆回去",
        "resultText": "你深吸一口气，把每个人该交的部分列成清单一条条点名过去，措辞客气但不留退路。海滩组员半夜冒泡，磨磨蹭蹭交了一段能用的。报告差强人意，你倒是头一回觉得，原来开口要别人干活，比自己熬夜更需要勇气。",
        "effects": {
          "gpa": 2,
          "social": 5,
          "adaptation": 4,
          "reputation": 3,
          "stress": -2,
          "career": 2
        },
        "routeWeights": {
          "social": 2,
          "survivor": 1
        }
      },
      {
        "text": "交个能及格的版本就睡",
        "resultText": "你把跑通的那版图随便配上文字，删掉所有花哨的分析，点提交，倒头就睡。第二天醒来精神好得反常，分数中规中矩，没人会记得这份报告，包括三个月后的你自己。",
        "effects": {
          "energy": 8,
          "stress": -6,
          "gpa": -2,
          "health": 4
        },
        "routeWeights": {
          "chill": 2,
          "survivor": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "maj_education_placement_quiet_kid",
    "title": "实习课上的安静孩子",
    "description": "你在中小学实习的真实课堂带早读，角落里有个总是不说话的孩子。带教老师说他这学期从没主动开过口，而今天他偷偷把一张画推到你桌上，画里有个戴眼镜、头发画得乱乱的大人，旁边歪歪扭扭写着一个像是你名字的拼音。",
    "category": "study",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "majorIn": [
        "education"
      ],
      "maxYear": 1,
      "minWeek": 16
    },
    "choices": [
      {
        "text": "蹲下来，慢慢陪他把这幅画讲完，反思日志改成写他",
        "resultText": "你把今晚要写的观察笔记主题整个换掉，蹲在小桌边听他用气声讲那个戴眼镜的大人是谁。回宿舍写反思日志写到凌晨，你忽然懂了导师说的那句话，有些进步是不会出现在评分表上的，但你这辈子都会记得这张画。",
        "effects": {
          "energy": -8,
          "gpa": 4,
          "career": 5,
          "homesick": -6,
          "stress": 3
        },
        "routeWeights": {
          "scholar": 2,
          "homebound": 1
        },
        "setFlags": {
          "education_first_breakthrough": true
        }
      },
      {
        "text": "温柔回应一句就先把当天的教学环节带完",
        "resultText": "你冲他笑了笑，把画小心折好放进口袋，转身继续带完整堂早读。流程一丝没乱，带教老师点头，可你心里那张画一整天都没放下，晚上写日志时还是忍不住多写了两段。",
        "effects": {
          "energy": -5,
          "gpa": 3,
          "career": 3,
          "adaptation": 4
        },
        "routeWeights": {
          "survivor": 2,
          "career": 1
        }
      },
      {
        "text": "把这件事记成案例，认真写进观察报告交给导师",
        "resultText": "你把这个瞬间当成一手材料，工工整整写成一份带分析框架的观察案例交上去。导师批注说你的捕捉很敏锐，只是末尾轻轻补了一句，别忘了那不只是数据，是一个等了一整个学期才肯递出画的小孩。",
        "effects": {
          "gpa": 6,
          "career": 4,
          "stress": 4,
          "homesick": 2
        },
        "routeWeights": {
          "scholar": 3,
          "phd": 2
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "maj_arts_crit_meltdown",
    "title": "评图前夜的崩塌",
    "description": "明早就是评图，你把一整面墙的作品挂上工作室，退后三步看，却突然觉得它们陌生又虚弱，像别人随手丢在这里的东西。导师和同学明天会一句一句拆开你这半年的样子。",
    "category": "study",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "majorIn": [
        "arts"
      ],
      "maxYear": 1,
      "minWeek": 10
    },
    "choices": [
      {
        "text": "通宵把整组重新布展，换一条更诚实的叙事线",
        "resultText": "你撕掉原来的排布，跟着凌晨四点的直觉重挂了一遍，评图上导师停在那面墙前很久，说她第一次看见你而不是看见你想讨好的人。那句话你存了很久。",
        "effects": {
          "energy": -11,
          "stress": 4,
          "gpa": 6,
          "career": 4,
          "reputation": 4,
          "health": -4
        },
        "routeWeights": {
          "scholar": 2,
          "phd": 2
        },
        "setFlags": {
          "arts_crit_breakthrough": true
        }
      },
      {
        "text": "不动了，接受它本来的样子去睡一觉",
        "resultText": "你关灯回家，把忐忑留在工作室里。第二天评图平稳收场，没有惊艳也没有难堪，导师点头说完成度不错，你心里清楚自己其实还能再往前走一点。",
        "effects": {
          "energy": 4,
          "stress": -8,
          "gpa": 2,
          "homesick": 2,
          "health": 3
        },
        "routeWeights": {
          "chill": 3,
          "survivor": 2
        }
      },
      {
        "text": "发消息约同班朋友来帮你一起看一遍",
        "resultText": "她拎着两杯热饮跑来，绕着你的作品走了三圈，指出你自己看不见的那条暗线。布展没全改，但你们在空工作室里聊到天亮，那种被同行真正看懂的感觉，比分数更让你站得住。",
        "effects": {
          "energy": -7,
          "stress": -4,
          "social": 6,
          "gpa": 3,
          "homesick": -4
        },
        "routeWeights": {
          "social": 3,
          "scholar": 1
        }
      }
    ],
    "pool": ""
  },
  {
    "id": "maj_socsci_reading_list_abyss",
    "title": "读不完的书单",
    "description": "这周研讨课的阅读清单又是四篇论文加两章专著，你算了一下，光是把它们认真读完就要十几个小时，而你还有一篇课程论文的截止压在后面。坐在图书馆里，你盯着那串长到要往下滚两屏的文献清单，第一次怀疑人是不是真的能读完这么多字。",
    "category": "study",
    "weight": 12,
    "oncePerGame": true,
    "cond": {
      "majorIn": [
        "socsci"
      ],
      "maxYear": 1,
      "minWeek": 8
    },
    "choices": [
      {
        "text": "硬着头皮全读，每一篇都做精读笔记",
        "resultText": "你在图书馆熬到闭馆音乐响起，把六份材料全啃完，笔记写满了三页。研讨课上导师抛出的每一个点你都接得住，那种把整张书单读穿的踏实感，是任何速读都给不了的。",
        "effects": {
          "gpa": 6,
          "energy": -11,
          "stress": 5,
          "english": 2,
          "reputation": 3
        },
        "routeWeights": {
          "scholar": 3,
          "phd": 2
        }
      },
      {
        "text": "学会战略性阅读，只读引言和结论",
        "resultText": "你逼自己放下每个字都要读的执念，抓每篇的论点和结论，半天扫完整张书单。讨论时你未必每个细节都答得上，但你忽然明白，研究生不是比谁读得多，而是比谁读得准。",
        "effects": {
          "adaptation": 5,
          "energy": -5,
          "stress": -6,
          "gpa": 2
        },
        "routeWeights": {
          "survivor": 2,
          "chill": 2
        }
      },
      {
        "text": "找同学组个读书会，一人分读一篇再互相讲",
        "resultText": "你拉了三个同学把书单拆开分着读，周末凑在公共区域互相复述各自那篇。听别人三句话讲清一篇你本来要读两小时的论文，你既偷到了懒，又意外交到了往后一年都能一起赶进度的战友。",
        "effects": {
          "social": 6,
          "gpa": 3,
          "energy": -4,
          "homesick": -4
        },
        "routeWeights": {
          "social": 3,
          "survivor": 1
        }
      }
    ],
    "pool": ""
  }
];
