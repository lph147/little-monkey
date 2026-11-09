// The word bank: every Chinese word in the game, defined once.
//
//   py    pinyin, with tone marks
//   en    English meaning
//   pic   says the word has a picture (on new-word cards and in quizzes). The picture shown is its
//         pixel sprite in content/sprites.js; this emoji is only a stand-in until it has one.
//   area  the area where you can collect the word. Words without an area are only heard:
//         they appear in sentences and can be tapped, but can't be collected yet.
//   category  where the word goes in the Word Scroll: one of the CATEGORIES below
//   phrase  true for a phrase such as 你好 or 谢谢. Phrases are a collection of their own: they don't
//         count towards the area's words, and you use them by choosing them as replies.
//   use   a phrase's: when you say it ("when someone thanks you"), on its card and when another reply fits better
//   cue   a phrase's: what someone does that you answer with it ("thanks you"), to say what's happening when you reply
//   situation  a phrase's: a moment you'd say it in, for a What do you say? question ("You meet a friend."): phraseQ in js/quiz.js
//   later true for a word the area will teach later, but nothing does yet (such as 蜜蜂, till the troop's bees): it isn't
//         counted, or in the Word Scroll, unless the game you're playing has caught it already
//   alike its look-alikes: words whose pictures share their main thing (床 and 睡觉, both a bed), or whose meanings
//         overlap so a picture of one could be taken for the other (家 and 学校). They're never two answers in the
//         same question. It works both ways, so one of the two lists it; '*animals' is every word in that category.
//         A new word with a picture lists its look-alikes (decided 23 October 2026)
//
// In the Word Scroll, each category's words appear in the order they are listed here.
// Sentences in the content files may only use words from this bank (the tests check).

// The Word Scroll's categories, in the order its tabs show them: the short name on the tab, and the
// full name. A category only appears once the area has words in it.
const CATEGORIES = {
  animals: {tab:'Animals', name:'Animals'},
  food: {tab:'Food', name:'Food and drink'},
  nature: {tab:'Nature', name:'Nature'},
  places: {tab:'Places', name:'Places'},
  items: {tab:'Items', name:'Items'},
  treasures: {tab:'Treasures', name:'Treasures'},   // (found on Flower Fruit Mountain, and sold to the 老板: the trade, 9 November 2026)
  shop: {tab:'Shop', name:'From the shop'},   // (things you can only get by buying them, so saving up gets a word ticked off: decided 9 November 2026)
  actions: {tab:'Actions', name:'Actions'},
  describing: {tab:'Describing', name:'Describing words'},
  people: {tab:'People', name:'People'},
  questions: {tab:'Asking', name:'Asking questions'},
  colours: {tab:'Colours', name:'Colours'},
  numbers: {tab:'Numbers', name:'Numbers'},
  phrases: {tab:'Phrases', name:'Phrases'}
};

const WORD_BANK = {
  // Collected on Flower Fruit Mountain (area 1)
  '石头': {py:'shítou', en:'stone, rock', pic:'🪨', area:1, category:'nature'},
  '猴子': {py:'hóuzi', en:'monkey', pic:'🐒', area:1, category:'animals', alike:['同学', '朋友', '跳', '老板', '老师', '睡觉']},
  '山': {py:'shān', en:'mountain', pic:'⛰️', area:1, category:'nature'},
  '花': {py:'huā', en:'flower', pic:'🌸', area:1, category:'nature'},
  '草': {py:'cǎo', en:'grass', pic:'🌿', area:1, category:'nature'},
  '蘑菇': {py:'mógu', en:'mushroom', pic:'🍄', area:1, category:'nature'},   // under the pines: on the hillside, the south slope, the dark pines and the pine wood (decided 28 October 2026)
  '树': {py:'shù', en:'tree', pic:'🌳', area:1, category:'nature', alike:['木头', '棍子']},
  '桃子': {py:'táozi', en:'peach', pic:'🍑', area:1, category:'food'},
  '苹果': {py:'píngguǒ', en:'apple', pic:'🍎', area:1, category:'food'},
  '河': {py:'hé', en:'river', pic:'🏞️', area:1, category:'nature', alike:['瀑布']},
  '水': {py:'shuǐ', en:'water', pic:'💧', area:1, category:'food', alike:['喝']},
  '水果': {py:'shuǐguǒ', en:'fruit', pic:'🧺', area:1, category:'food', alike:['桃子', '苹果', '西瓜', '葡萄', '香蕉', '榴莲']},   // (the hungry monkey teaches it as he asks, since 24 October 2026; the fruit trees did for a day, and it was heard only till then)
  '鱼': {py:'yú', en:'fish', pic:'🐟', area:1, category:'animals'},
  '鸟': {py:'niǎo', en:'bird', pic:'🐦', area:1, category:'animals'},
  '动物': {py:'dòngwù', en:'animal', pic:'🐾', area:1, category:'animals', alike:['*animals']},
  '兔子': {py:'tùzi', en:'rabbit', pic:'🐇', area:1, category:'animals'},
  '羊': {py:'yáng', en:'sheep', pic:'🐑', area:1, category:'animals', alike:['山羊']},   // (the fox's place in the prologue, since 23 October 2026: 羊, then 山羊)
  '松鼠': {py:'sōngshǔ', en:'squirrel', pic:'🐿️', area:1, category:'animals'},
  '山羊': {py:'shānyáng', en:'goat', pic:'🐐', area:1, category:'animals'},
  '洞': {py:'dòng', en:'cave', pic:'🕳️', area:1, category:'places'},
  '红色': {py:'hóngsè', en:'red', pic:'🟥', area:1, category:'colours'},   // (chapter 1: the school's colour lessons; the prologue's flowers taught red, yellow and white until 22 October 2026)
  '黄色': {py:'huángsè', en:'yellow', pic:'🟨', area:1, category:'colours'},
  '白色': {py:'báisè', en:'white', pic:'⬜', area:1, category:'colours'},
  '黑色': {py:'hēisè', en:'black', pic:'⬛', area:1, category:'colours'},   // (chapter 1: the school's colour lessons)
  '蓝色': {py:'lánsè', en:'blue', pic:'🟦', area:1, category:'colours'},
  '绿色': {py:'lǜsè', en:'green', pic:'🟩', area:1, category:'colours'},
  '棕色': {py:'zōngsè', en:'brown', pic:'🟫', area:1, category:'colours'},
  '橙色': {py:'chéngsè', en:'orange', pic:'🟧', area:1, category:'colours'},
  '粉色': {py:'fěnsè', en:'pink', pic:'🩷', area:1, category:'colours'},
  // Chapter 1: the Water Curtain Cave
  '路': {py:'lù', en:'path, road', pic:'🛤️', area:1, category:'places'},
  '棍子': {py:'gùnzi', en:'stick', pic:'🪵', area:1, category:'items'},
  '地图': {py:'dìtú', en:'map', pic:'🗺️', area:1, category:'items'},   // (the old monkey gives you one as you set off: caught the first time you open it)
  '蛇': {py:'shé', en:'snake', pic:'🐍', area:1, category:'animals'},
  '蜘蛛': {py:'zhīzhū', en:'spider', pic:'🕷️', area:1, category:'animals'},
  '蜜蜂': {py:'mìfēng', en:'bee', pic:'🐝', area:1, category:'animals'},   // (caught in the long grass until 21 October 2026; in chapter 1, six friends hiding in the tall flowers of their valley)
  '蜂王': {py:'fēngwáng', en:'queen bee', pic:'👸', area:1, category:'animals', alike:['蜜蜂', '黄蜂', '王']},   // (heard as the sixth bee sends you to find her; met as she comes out of her old tree; like the bee and the wasp a striped insect, and with a crown like 王's)
  '野猪': {py:'yězhū', en:'wild boar', pic:'🐗', area:1, category:'animals'},
  '鹿': {py:'lù', en:'deer', pic:'🦌', area:1, category:'animals'},   // (chapter 1: a friend in the pine wood)
  '狼': {py:'láng', en:'wolf', pic:'🐺', area:1, category:'animals'},   // (chapter 1: in the pine wood's long grass)
  '熊': {py:'xióng', en:'bear', pic:'🐻', area:1, category:'animals'},   // (chapter 1: at the big rocks, as you lead the cow home)
  '狐狸': {py:'húli', en:'fox', pic:'🦊', area:1, category:'animals'},   // (chapter 1: hiding on the hillside; in the meadow's tall grass until 23 October 2026)
  '蝴蝶': {py:'húdié', en:'butterfly', pic:'🦋', area:1, category:'animals'},   // (chapter 1: fluttering over the flowers on the riverside, the way east to the bees)
  '乌龟': {py:'wūguī', en:'turtle', pic:'🐢', area:1, category:'animals', alike:['海龟']},   // (chapter 1: on a warm rock in the hot spring valley)
  '海龟': {py:'hǎiguī', en:'sea turtle', pic:'🌊🐢', area:1, category:'animals'},   // (chapter 1: on the shore's sand)
  '老鼠': {py:'lǎoshǔ', en:'mouse', pic:'🐭', area:1, category:'animals'},   // (chapter 1: hiding in the melon field's tall grass)
  '青蛙': {py:'qīngwā', en:'frog', pic:'🐸', area:1, category:'animals'},   // (chapter 1: on a lily pad by the south slope's stepping stones)
  '马': {py:'mǎ', en:'horse', pic:'🐴', area:1, category:'animals'},   // (chapter 1: out on the pasture's grass)
  '鸭子': {py:'yāzi', en:'duck', pic:'🦆', area:1, category:'animals', alike:['鸟']},   // (chapter 1: swimming on the home ground's stream)
  '猫头鹰': {py:'māotóuyīng', en:'owl', pic:'🦉', area:1, category:'animals', alike:['鸟']},   // (chapter 1: perched on a dead pine in the dark pines)
  '黄蜂': {py:'huángfēng', en:'wasp', pic:'🦟', area:1, category:'animals', alike:['蜜蜂']},   // (chapter 1: in the tall flowers of the bees' valley; its picture is a pixel wasp, a striped insect like the bee: there's no emoji for a wasp, so its stand-in is a mosquito)
  '牛': {py:'niú', en:'cow', pic:'🐄', area:1, category:'animals'},   // (chapter 1: lost in the pasture south of the home ground, scared of the wolves; heard first in the thirsty monkey's news)
  '跳': {py:'tiào', en:'to jump', pic:'🦘', area:1, category:'actions'},
  '桥': {py:'qiáo', en:'bridge', pic:'🌉', area:1, category:'places'},
  '床': {py:'chuáng', en:'bed', pic:'🛏️', area:1, category:'items', alike:['睡觉']},
  '碗': {py:'wǎn', en:'bowl', pic:'🥣', area:1, category:'items', alike:['吃']},
  '桌子': {py:'zhuōzi', en:'table', pic:'🪑', area:1, category:'items'},
  '家': {py:'jiā', en:'home', pic:'🏠', area:1, category:'places', alike:['学校', '洞']},
  '睡觉': {py:'shuìjiào', en:'to sleep', pic:'😴', area:1, category:'actions'},
  '王': {py:'wáng', en:'king', pic:'👑', area:1, category:'people'},
  '一': {py:'yī', en:'one', pic:'1️⃣', area:1, category:'numbers'},
  '二': {py:'èr', en:'two', pic:'2️⃣', area:1, category:'numbers'},
  '两': {py:'liǎng', en:'two (of something)', pic:'✌️', area:1, category:'numbers', alike:['二', '桃子', '水果']},   // (two of something, as two peaches: 两个桃子. Counting is 二. The second maths lesson at school, decided 9 November 2026; its picture is two peaches)
  '三': {py:'sān', en:'three', pic:'3️⃣', area:1, category:'numbers'},
  '四': {py:'sì', en:'four', pic:'4️⃣', area:1, category:'numbers'},   // (chapter 1: the school's number lessons)
  '五': {py:'wǔ', en:'five', pic:'5️⃣', area:1, category:'numbers'},
  '六': {py:'liù', en:'six', pic:'6️⃣', area:1, category:'numbers'},
  '七': {py:'qī', en:'seven', pic:'7️⃣', area:1, category:'numbers'},
  '八': {py:'bā', en:'eight', pic:'8️⃣', area:1, category:'numbers'},
  '九': {py:'jiǔ', en:'nine', pic:'9️⃣', area:1, category:'numbers'},
  '十': {py:'shí', en:'ten', pic:'🔟', area:1, category:'numbers'},
  '吃': {py:'chī', en:'to eat', pic:'😋', area:1, category:'actions'},
  '喝': {py:'hē', en:'to drink', pic:'🥤', area:1, category:'actions'},
  '朋友': {py:'péngyou', en:'friend', pic:'🧑‍🤝‍🧑', area:1, category:'people', alike:['兔子']},
  '我': {py:'wǒ', en:'I, me', area:1, category:'people'},
  '要': {py:'yào', en:'to want', area:1, category:'actions'},
  '瀑布': {py:'pùbù', en:'waterfall', pic:'💦', area:1, category:'nature'},
  '老板': {py:'lǎobǎn', en:'shop owner, boss', pic:'🏪', area:1, category:'people'},
  '头带': {py:'tóudài', en:'headband', pic:'🎀', area:1, category:'items'},
  '戴': {py:'dài', en:'to wear (on your head)', area:1, category:'actions'},
  // Chapter 1: the troop's new home
  '木头': {py:'mùtou', en:'wood', pic:'🌲', area:1, category:'items', alike:['棍子']},
  '学校': {py:'xuéxiào', en:'school', pic:'🏫', area:1, category:'places'},
  '老师': {py:'lǎoshī', en:'teacher', pic:'🧑‍🏫', area:1, category:'people'},
  '同学': {py:'tóngxué', en:'classmate', pic:'🎒', area:1, category:'people'},
  '有': {py:'yǒu', en:'to have, there is', area:1, category:'actions'},   // (the old monkey's news, chapter 1: heard till then, as in 里面有床; no picture, as 要 has none)
  '没有': {py:'méiyǒu', en:'don’t have, there isn’t', area:1, category:'actions'},   // (the hungry monkey at the feast's table: no honey; no picture either)
  '蜂蜜': {py:'fēngmì', en:'honey', pic:'🍯', area:1, category:'food'},   // (heard at the feast's table; taught as you take the first honey from the bees' hive)
  '牛奶': {py:'niúnǎi', en:'milk', pic:'🥛', area:1, category:'food', alike:['喝']},   // (the cow's thank-you for its new home; both pictures are a glass of something to drink)
  '酸奶': {py:'suānnǎi', en:'yoghurt', pic:'🫙', area:1, category:'food', alike:['蜂蜜']},   // (made from the milk at the little dairy by the cow's pen; both pictures are a pot with a wooden spoon in it)
  '奶酪': {py:'nǎilào', en:'cheese', pic:'🧀', area:1, category:'food'},   // (and then cheese)
  '筷子': {py:'kuàizi', en:'chopsticks', pic:'🥢', area:1, category:'items', alike:['吃']},   // (in a cup at the end of each of the feast's tables; 吃's picture is a bowl of rice with chopsticks)
  '勺子': {py:'sháozi', en:'spoon', pic:'🥄', area:1, category:'items', alike:['酸奶', '蜂蜜']},   // (in the yoghurt on the feast's second table; the pictures of both have a wooden spoon in them)
  '种子': {py:'zhǒngzi', en:'seeds', pic:'🌱', area:1, category:'nature', alike:['草']},   // (the big monkey's garden: he asks for seeds from wild fruit; 草's picture is green too, a tuft of grass)
  '西瓜': {py:'xīguā', en:'watermelon', pic:'🍉', area:1, category:'food'},
  '葡萄': {py:'pútáo', en:'grapes', pic:'🍇', area:1, category:'food'},
  '香蕉': {py:'xiāngjiāo', en:'banana', pic:'🍌', area:1, category:'food'},   // (wild in the melon field, east off the south slope: you take its seeds for the garden)
  '榴莲': {py:'liúlián', en:'durian', pic:'🌰', area:1, category:'food'},   // (a spiky fruit, famous for its smell: one to pick from the tree in the hot spring valley's warm corner, and the 老板 sells them; eating one keeps wild creatures away for two minutes)
  '跑': {py:'pǎo', en:'to run', pic:'🏃', area:1, category:'actions', alike:['猴子', '跳']},   // (PE at school: the old monkey starts a race on the sports ground with it, and from then on you can run; the pictures of all three are a monkey)
  '跑步': {py:'pǎobù', en:'to go running, to jog', pic:'👟', area:1, category:'actions', alike:['跑', '猴子', '跳']},   // (PE's second lesson: the class goes jogging round the sports ground)
  '鱼饵': {py:"yú'ěr", en:'bait', pic:'🪱', area:1, category:'items', alike:['蜂蜜', '酸奶']},   // (the 老板 sells it, once you can fish: a big fish bites; all three pictures are a pot)
  '鱼竿': {py:'yúgān', en:'fishing rod', pic:'🎣', area:1, category:'items', alike:['棍子']},   // (the fishing monkey's, by the stream at the home ground, for the feast's fish; both pictures are a long, thin stick)
  '快乐': {py:'kuàilè', en:'happy', pic:'😊', area:1, category:'describing'},   // (the feast, at the end of chapter 1: 小猴子很快乐！ heard since becoming king)
  '臭': {py:'chòu', en:'smelly', pic:'🤢', area:1, category:'describing'},
  '黄鼠狼': {py:'huángshǔláng', en:'weasel', pic:'🦦', area:1, category:'animals', alike:['狐狸', '老鼠', '狼']},
  // new night animals, only out after dark (decided 8 November 2026, the polish plan)
  '蝙蝠': {py:'biānfú', en:'bat', pic:'🦇', area:1, category:'animals', alike:['鸟', '蝴蝶']},   // (flitting over the home ground's stream at night; by day asleep in the Water Curtain Cave)
  '萤火虫': {py:'yínghuǒchóng', en:'firefly', pic:'🪲', area:1, category:'animals', alike:['蜜蜂', '火']},   // (five to find in the riverside's long grass, after dark)
  '刺猬': {py:'cìwei', en:'hedgehog', pic:'🦔', area:1, category:'animals', alike:['老鼠']},   // (snuffling in the meadow's long grass, after dark)
  '蟋蟀': {py:'xīshuài', en:'cricket', pic:'🦗', area:1, category:'animals', alike:['蜘蛛']},   // (in the hillside's long grass, chirping, after dark)   // (a night creature to fight, sneaking through the long grass after dark: chapter 1)   // (as you eat your first durian: 太臭了！, it's so smelly!)
  '木筏': {py:'mùfá', en:'raft', pic:'🛶', area:1, category:'items', alike:['木头']},   // (the troop builds it on the shore, at the end of chapter 1: you leave on it, as in the book)
  '海': {py:'hǎi', en:'sea', pic:'🌊', area:1, category:'nature', alike:['河', '水']},   // (the shore, below the meadow, where the river meets the sea; heard in the opening, 海里有一座山)
  '螃蟹': {py:'pángxiè', en:'crab', pic:'🦀', area:1, category:'animals'},   // (on the shore's sand, for the feast)
  '虾': {py:'xiā', en:'shrimp', pic:'🦐', area:1, category:'animals'},   // (caught in the riverside brook's clear shallows, for the feast)
  '小': {py:'xiǎo', en:'little, small', area:1, category:'describing'},   // (the first fish you catch: too small, you let it go; heard till then, as in 小石头)
  '大': {py:'dà', en:'big', area:1, category:'describing'},   // (and then a big one, for the feast; heard till then, as in 大猴子)
  '晚上': {py:'wǎnshang', en:'night, evening', pic:'🌃', area:1, category:'nature', alike:['天']},   // (the first night, in chapter 1, once the troop has its home: the day goes round, js/daynight.js; it was the master's night, in Area 2, till 7 November 2026)
  '雨': {py:'yǔ', en:'rain', pic:'🌧️', area:1, category:'nature', alike:['云', '雪', '水']},   // (the first rain, in chapter 1: 下雨了！, it's raining, as 下雪了！ is it's snowing)
  '大雨': {py:'dàyǔ', en:'heavy rain', pic:'⛈️', area:1, category:'nature', alike:['雨', '云', '雪', '水']},   // (the first heavy rain, another day: 下大雨了！, it's raining hard)

  // buying and selling (decided 9 November 2026, the trade): 买 moved from the human world's town to the 老板's shop, so you
  // meet it the first time you shop, and 卖 with your first sale, his pine nuts
  '买': {py:'mǎi', en:'to buy', area:1, category:'actions'},
  '卖': {py:'mài', en:'to sell', area:1, category:'actions'},
  // treasures, found all over Flower Fruit Mountain, and sold to the 老板 (one at each spot, once, but pine nuts and feathers
  // every day): each is caught the first time you find one
  '松子': {py:'sōngzǐ', en:'pine nuts', pic:'🥜', area:1, category:'treasures', alike:['松鼠']},   // (in a pine cone, under the pines of the pine wood: the 老板 wants them first)
  '羽毛': {py:'yǔmáo', en:'feather', pic:'🪶', area:1, category:'treasures', alike:['鸟']},   // (left by a bird, in its colour: 红色的羽毛)
  '珍珠': {py:'zhēnzhū', en:'pearl', pic:'🦪', area:1, category:'treasures', alike:['螃蟹']},   // (in a clam on the shore, open only at night)
  '玉': {py:'yù', en:'jade', pic:'💚', area:1, category:'treasures', alike:['石头']},   // (in a warm rock, broken open with your stick)
  '人参': {py:'rénshēn', en:'ginseng', pic:'🫚', area:1, category:'treasures', alike:['草', '花']},   // (a root, dug up with a spade, under the trees)
  '金子': {py:'jīnzi', en:'gold', pic:'🪙', area:1, category:'treasures', alike:['钱', '石头']},   // (washed down by heavy rain, glinting in the shallows)
  // things you can only get by buying them from the 老板 (decided 9 November 2026): the tools, and things for the Water
  // Curtain Cave; each is caught as you buy it
  '篮子': {py:'lánzi', en:'basket', pic:'🥡', area:1, category:'shop', alike:['碗']},   // (you carry two more of every snack)
  '灯笼': {py:'dēnglong', en:'lantern', pic:'🏮', area:1, category:'shop', alike:['红色']},   // (a light at night: heard already, painting the school's lanterns)
  '铲子': {py:'chǎnzi', en:'spade', pic:'🪏', area:1, category:'shop', alike:['棍子', '木头']},   // (for digging up ginseng)
  '花瓶': {py:'huāpíng', en:'vase', pic:'🏺', area:1, category:'shop', alike:['花']},   // (for the Water Curtain Cave: on the stone table)
  '风铃': {py:'fēnglíng', en:'wind chime', pic:'🎐', area:1, category:'shop', alike:['风']},   // (hung on the cave's wall, tinkling as you pass)
  '鼓': {py:'gǔ', en:'drum', pic:'🥁', area:1, category:'shop'},   // (in the cave: A beats it)
  '画': {py:'huà', en:'painting', pic:'🖼️', area:1, category:'shop', alike:['山']},   // (of the mountain, on the cave's wall)
  '鱼缸': {py:'yúgāng', en:'fish jar', pic:'🐠', area:1, category:'shop', alike:['鱼', '碗']},   // (in the cave: your next little fish goes into it)

  // Phrases you learn on Flower Fruit Mountain, and reply with
  '你好': {py:'nǐ hǎo', en:'hello', pic:'👋', area:1, category:'phrases', phrase:true, use:'when you meet someone', cue:'says hello', situation:'You meet a friend.'},
  '谢谢': {py:'xièxie', en:'thank you', area:1, category:'phrases', phrase:true, use:'when someone gives you something or helps you', cue:'helps you', situation:'A friend gives you a peach.'},
  '不客气': {py:'bú kèqi', en:'you’re welcome', area:1, category:'phrases', phrase:true, use:'when someone thanks you', cue:'thanks you', situation:'You help a friend, and they thank you.'},
  '对不起': {py:'duìbuqǐ', en:'sorry', area:1, category:'phrases', phrase:true, use:'when you’ve made a mistake', cue:'isn’t happy', situation:'You bump into a friend by mistake.'},
  '没关系': {py:'méi guānxi', en:'it doesn’t matter', area:1, category:'phrases', phrase:true, use:'when someone says sorry', cue:'says sorry', situation:'A friend bumps into you, and says sorry.'},
  '再见': {py:'zàijiàn', en:'goodbye', area:1, category:'phrases', phrase:true, use:'when you leave', cue:'says goodbye', situation:'You’re leaving your friends to go home.'},
  '我不要': {py:'wǒ bú yào', en:'no thanks, I don’t want it', area:1, category:'phrases', phrase:true, use:'when you don’t want something', situation:'A friend offers you something you don’t want.'},

  // Area 2, across the sea: the human world (decided 4 November 2026). Its prologue's words, in the order you meet them.
  '人': {py:'rén', en:'person, people', pic:'🧍', area:2, category:'people', alike:['孩子']},
  '鹅': {py:'é', en:'goose', pic:'🪿', area:2, category:'animals', alike:['鸭子']},
  '衣服': {py:'yīfu', en:'clothes', pic:'🧥', area:2, category:'items'},
  '帽子': {py:'màozi', en:'hat', pic:'👒', area:2, category:'items', alike:['头带']},
  '不': {py:'bù', en:'not, no', area:2, category:'describing'},
  '是': {py:'shì', en:'am, is, are; yes', area:2, category:'actions'},
  '什么': {py:'shénme', en:'what', area:2, category:'questions'},
  '井': {py:'jǐng', en:'well (for water)', pic:'⛲', area:2, category:'places'},
  '房子': {py:'fángzi', en:'house', pic:'🏠', area:2, category:'places', alike:['家', '学校']},
  '门': {py:'mén', en:'door, gate', pic:'🚪', area:2, category:'places', alike:['房子']},
  '谁': {py:'shéi', en:'who', area:2, category:'questions'},
  '鸡': {py:'jī', en:'chicken', pic:'🐔', area:2, category:'animals', alike:['鸟']},
  '米饭': {py:'mǐfàn', en:'rice (cooked)', pic:'🍚', area:2, category:'food', alike:['碗', '米']},   // (the granny's lunch; 饭 till 7 November 2026: the owner's idea, 米 for raw rice, 米饭 cooked)
  '钱': {py:'qián', en:'money', pic:'🪙', area:2, category:'items'},
  '网': {py:'wǎng', en:'net', pic:'🥅', area:2, category:'items'},
  '船': {py:'chuán', en:'boat', pic:'⛵', area:2, category:'items', alike:['木筏']},
  '看': {py:'kàn', en:'to look, to see', area:2, category:'actions'},
  '狗': {py:'gǒu', en:'dog', pic:'🐕', area:2, category:'animals', alike:['狼', '狐狸']},
  '多少钱': {py:'duōshao qián', en:'how much is it?', area:2, category:'phrases', phrase:true, use:'when you want to know how much something costs', cue:'shows you something to buy', situation:'You want to know how much the apples cost.'},   // (the fruit stall, in the town: 买 is caught at home now, decided 9 November 2026)
  '包子': {py:'bāozi', en:'steamed bun', pic:'🥟', area:2, category:'food'},
  '鞋': {py:'xié', en:'shoes', pic:'👞', area:2, category:'items'},
  '茶': {py:'chá', en:'tea', pic:'🍵', area:2, category:'food', alike:['水', '喝']},
  '说': {py:'shuō', en:'to say, to talk', area:2, category:'actions'},
  '哪里': {py:'nǎlǐ', en:'where', area:2, category:'questions'},
  '知道': {py:'zhīdào', en:'to know', area:2, category:'actions'},   // (我不知道。 everyone you ask where the immortals are)
  '听': {py:'tīng', en:'to listen', area:2, category:'actions'},
  '孩子': {py:'háizi', en:'child, children', pic:'🧒', area:2, category:'people'},
  '学': {py:'xué', en:'to learn', area:2, category:'actions'},
  '书': {py:'shū', en:'book', pic:'📚', area:2, category:'items'},
  '猫': {py:'māo', en:'cat', pic:'🐈', area:2, category:'animals'},
  '米': {py:'mǐ', en:'rice (uncooked)', pic:'🌾', area:2, category:'food'},   // (the docker's sacks of rice, at the harbour)
  '风': {py:'fēng', en:'wind', pic:'🌬️', area:2, category:'nature'},
  '歌': {py:'gē', en:'song', pic:'🎵', area:2, category:'items'},
  '云': {py:'yún', en:'cloud', pic:'☁️', area:2, category:'nature'},   // (chapter 1: the sea of clouds under the cliff road)
  '鹤': {py:'hè', en:'crane', pic:'🦩', area:2, category:'animals', alike:['鸟', '鹅']},   // (chapter 1: by the pool on the cliff road)
  '天': {py:'tiān', en:'sky', pic:'🌤️', area:2, category:'nature', alike:['云']},   // (chapter 1: the open sky over the stone pillars)
  '师父': {py:'shīfu', en:'master, teacher', pic:'🧙', area:2, category:'people', alike:['人']},   // (chapter 1, from here on: the immortal who teaches you, in the cave)
  '名字': {py:'míngzi', en:'name', area:2, category:'items'},   // (你叫什么名字？ the master gives you yours: 孙悟空)
  '叶子': {py:'yèzi', en:'leaf, leaves', pic:'🍂', area:2, category:'nature', alike:['树', '草']},   // (the chores: the cave's fallen leaves)
  '扫': {py:'sǎo', en:'to sweep', pic:'🧹', area:2, category:'actions', alike:['叶子']},
  '桶': {py:'tǒng', en:'bucket', pic:'🪣', area:2, category:'items', alike:['水', '井']},   // (and to count buckets of something: 三桶水)
  '斧头': {py:'fǔtou', en:'axe', pic:'🪓', area:2, category:'items', alike:['木头']},
  '头': {py:'tóu', en:'head', pic:'🗣️', area:2, category:'people', alike:['人', '孩子']},   // (the master's riddle: three taps on your head)
  '月亮': {py:'yuèliang', en:'moon', pic:'🌙', area:2, category:'nature', alike:['晚上']},
  '星星': {py:'xīngxing', en:'star', pic:'🌟', area:2, category:'nature', alike:['晚上', '月亮']},
  '变': {py:'biàn', en:'to change (into something)', pic:'💨', area:2, category:'actions', alike:['云']},   // (the 72 transformations: the chapter's big idea)
  '飞': {py:'fēi', en:'to fly', pic:'💫', area:2, category:'actions', alike:['云', '变', '鸟']},   // (the cloud somersault)
  '松树': {py:'sōngshù', en:'pine tree', pic:'🎄', area:2, category:'nature', alike:['树', '木头']},   // (showing off: you change into one)
  '回家': {py:'huíjiā', en:'to go home', area:2, category:'actions'},   // (the master sends you home to Flower Fruit Mountain)
  // the master's year (chapter 1, decided 7 November 2026): the seasons, each taught as you wake to it
  '春天': {py:'chūntiān', en:'spring', pic:'🍃', area:2, category:'nature', alike:['花']},
  '夏天': {py:'xiàtiān', en:'summer', pic:'☀️', area:2, category:'nature', alike:['花', '水']},
  '秋天': {py:'qiūtiān', en:'autumn', pic:'🍁', area:2, category:'nature', alike:['叶子', '树']},
  '冬天': {py:'dōngtiān', en:'winter', pic:'❄️', area:2, category:'nature', alike:['树']},
  // spring: the master's first class, counting on from 十 (a bundle of ten sticks, and so many more: no new characters)
  '十一': {py:'shíyī', en:'eleven', pic:'⑪', area:2, category:'numbers'},
  '十二': {py:'shí\'èr', en:'twelve', pic:'⑫', area:2, category:'numbers'},
  '十三': {py:'shísān', en:'thirteen', pic:'⑬', area:2, category:'numbers'},
  '十四': {py:'shísì', en:'fourteen', pic:'⑭', area:2, category:'numbers'},
  '十五': {py:'shíwǔ', en:'fifteen', pic:'⑮', area:2, category:'numbers'},
  '十六': {py:'shíliù', en:'sixteen', pic:'⑯', area:2, category:'numbers'},
  '十七': {py:'shíqī', en:'seventeen', pic:'⑰', area:2, category:'numbers'},
  '十八': {py:'shíbā', en:'eighteen', pic:'⑱', area:2, category:'numbers'},
  '十九': {py:'shíjiǔ', en:'nineteen', pic:'⑲', area:2, category:'numbers'},
  '二十': {py:'èrshí', en:'twenty', pic:'⑳', area:2, category:'numbers'},
  '功夫': {py:'gōngfu', en:'kung fu', pic:'🥋', area:2, category:'actions', alike:['人']},   // (the pupils' morning training, in the courtyard)
  // summer
  '热': {py:'rè', en:'hot', pic:'🥵', area:2, category:'describing', alike:['夏天']},   // (the pupils training in the sun: 今天很热！)
  '北边': {py:'běibian', en:'the north', pic:'⬆️', area:2, category:'places'},   // (the master's summer class: the hall is to the north)
  '南边': {py:'nánbian', en:'the south', pic:'⬇️', area:2, category:'places'},
  '药': {py:'yào', en:'medicine', pic:'💊', area:2, category:'items'},   // (the master's medicine, from the lingzhi on the stone pillars)
  // autumn
  '写': {py:'xiě', en:'to write', pic:'✍️', area:2, category:'actions', alike:['书']},   // (writing your name with a brush)
  '东边': {py:'dōngbian', en:'the east', pic:'➡️', area:2, category:'places'},   // (the master's autumn class: the waterfall is to the east)
  '西边': {py:'xībian', en:'the west', pic:'⬅️', area:2, category:'places'},
  '雪': {py:'xuě', en:'snow', pic:'🌨️', area:2, category:'nature', alike:['冬天', '云']},   // (the first snow, as autumn ends: 下雪了！)
  // winter
  '冷': {py:'lěng', en:'cold', pic:'🥶', area:2, category:'describing', alike:['冬天', '雪']},   // (the pupils shivering: 今天很冷！)
  '火': {py:'huǒ', en:'fire', pic:'🔥', area:2, category:'nature'},   // (the fire in the courtyard, to keep everyone warm; till 7 November 2026, the demon's torches)
  '年': {py:'nián', en:'year', pic:'📅', area:2, category:'nature', alike:['春天', '夏天', '秋天', '冬天']},   // (the master's winter class: the four seasons make a year; heard since the years in the town)
  '雪人': {py:'xuěrén', en:'snowman', pic:'⛄', area:2, category:'items', alike:['雪', '人', '冬天']},   // (built with the pupils in the courtyard)
  // chapter 2: home to Flower Fruit Mountain after twenty years, and the Demon of Havoc (decided 5 November 2026)
  '回来': {py:'huílai', en:'to come back', area:2, category:'actions', alike:['回家']},   // (你回来了！ the troop, as you come home)
  '好久不见': {py:'hǎojiǔ bú jiàn', en:'long time no see', area:2, category:'phrases', phrase:true, use:'when you meet someone you haven’t seen for a long time', cue:'is so happy to see you again', situation:'You meet a friend you haven’t seen for years.'},
  '哭': {py:'kū', en:'to cry', pic:'😢', area:2, category:'actions', alike:['快乐']},   // (the troop, crying for their little ones)
  '老': {py:'lǎo', en:'old', pic:'👴', area:2, category:'describing', alike:['人', '猴子']},   // (heard since the feast, 我们会老……; the old monkey, twenty years on: 我老了。)
  '妖怪': {py:'yāoguài', en:'demon, monster', pic:'👹', area:2, category:'animals', alike:['猴子', '人']},   // (the little demons: the word for every demon on the journey west)
  '新年快乐': {py:'xīnnián kuàilè', en:'Happy New Year!', area:2, category:'phrases', phrase:true, use:'at New Year', cue:'wishes you a happy New Year', situation:'It’s New Year’s Eve, and everyone is celebrating.'},   // (New Year's Eve in the cave, the master's year)
  '救命': {py:'jiùmìng', en:'help!', area:2, category:'phrases', phrase:true, use:'when you’re in danger and need someone to help you', cue:'is in danger', situation:'You’re locked in a cage, and you need someone to help you!'},
  '笼子': {py:'lóngzi', en:'cage', pic:'🪤', area:2, category:'items', alike:['房子', '门']},   // (the little monkeys, locked in the demon's cages)
  '钥匙': {py:'yàoshi', en:'key', pic:'🗝️', area:2, category:'items', alike:['门', '笼子']},
  '毛': {py:'máo', en:'hair, fur', pic:'🪶', area:2, category:'people', alike:['猴子', '头']},   // (your hairs, turned into little monkeys: 变！)
  '刀': {py:'dāo', en:'broadsword, knife', pic:'🗡️', area:2, category:'items', alike:['棍子', '斧头']},   // (the Demon of Havoc's, yours once you've beaten him)
  '车': {py:'chē', en:'cart', pic:'🛒', area:2, category:'items'},   // (the little demons' cart, piled with the troop's things)
  '臭豆腐': {py:'chòudòufu', en:'stinky tofu', pic:'🧆', area:2, category:'food', alike:['包子']},
  '飞蛾': {py:"fēi'é", en:'moth', pic:'🪰', area:2, category:'animals', alike:['蝴蝶']},   // (at the night market's lamps, after dark)   // (fried at the town's night market, the bun stall's at night: eating it keeps wild creatures away for two minutes, as a durian does)

  // Heard in sentences
  '换': {py:'huàn', en:'to change, to swap'},
  '今天': {py:'jīntiān', en:'today'},
  '练': {py:'liàn', en:'to practise, to train'},
  '比武': {py:'bǐwǔ', en:'a kung fu match'},
  '灵芝': {py:'língzhī', en:'lingzhi, a mushroom of long life'},
  '下': {py:'xià', en:'to fall (of rain or snow: 下雪, it snows)'},
  '打雪仗': {py:'dǎ xuězhàng', en:'to have a snowball fight'},
  '赢': {py:'yíng', en:'to win'},
  '啊': {py:'a', en:'(softens a question: 谁啊？ who is it?)'},
  '他们': {py:'tāmen', en:'they, them'},
  '话': {py:'huà', en:'speech, words (说话, to talk)'},
  '和': {py:'hé', en:'and'},
  '后面': {py:'hòumiàn', en:'behind'},
  '下面': {py:'xiàmiàn', en:'under'},
  '找到': {py:'zhǎodào', en:'to find'},
  '捉迷藏': {py:'zhuō mícáng', en:'hide and seek'},
  '从': {py:'cóng', en:'from'},
  '来': {py:'lái', en:'to come'},
  '进去': {py:'jìnqù', en:'to go in'},
  '就': {py:'jiù', en:'then'},
  '能': {py:'néng', en:'can'},
  '怕': {py:'pà', en:'to be scared'},
  '里面': {py:'lǐmiàn', en:'inside'},
  '太': {py:'tài', en:'too, very'},
  '好': {py:'hǎo', en:'good'},
  '的': {py:'de', en:'(joins words: 我们的, our; 红色的花, a red flower)'},
  '只': {py:'zhī', en:'(counts animals: 三只猴子, three monkeys)'},
  '水帘洞': {py:'Shuǐlián Dòng', en:'Water Curtain Cave (a name)'},
  '灵台方寸山': {py:'Língtái Fāngcùn Shān', en:'Mountain of Mind and Heart (a name)'},   // (the immortal's mountain, on its tablet: Area 2, chapter 1)
  '斜月三星洞': {py:'Xiéyuè Sānxīng Dòng', en:'Cave of the Slanting Moon and Three Stars (a name)'},   // (the immortal's cave, over its door)
  '美猴王': {py:'Měi Hóuwáng', en:'Handsome Monkey King (a name)'},
  '真正': {py:'zhēnzhèng', en:'real, true'},
  '大家': {py:'dàjiā', en:'everyone'},
  '都': {py:'dōu', en:'all, both'},
  '很': {py:'hěn', en:'very'},
  '多': {py:'duō', en:'many, much'},
  '以后': {py:'yǐhòu', en:'after, later'},
  '长大': {py:'zhǎngdà', en:'to grow up'},
  '盖': {py:'gài', en:'to build (a house)'},
  '刷': {py:'shuā', en:'to paint (with a brush)'},
  '好看': {py:'hǎokàn', en:'good-looking, lovely'},
  '宝贝': {py:'bǎobèi', en:'treasure'},   // (the old monkey's tip: 山上有很多宝贝！, the trade, 9 November 2026)
  '文': {py:'wén', en:'(counts coins: 两文钱, two coins)'},
  '种花': {py:'zhòng huā', en:'to plant flowers'},
  '几': {py:'jǐ', en:'how many'},
  '个': {py:'gè', en:'(counts things: 几个, how many)'},
  '们': {py:'men', en:'(more than one: 同学们, the class)'},
  '上课': {py:'shàngkè', en:'class begins'},
  '下课': {py:'xiàkè', en:'class is over'},
  '这里': {py:'zhèlǐ', en:'here'},
  '那里': {py:'nàlǐ', en:'there'},   // (the rabbit in the pasture's pines: 牛在那里！)
  '勇敢': {py:'yǒnggǎn', en:'brave'},
  '从此': {py:'cóngcǐ', en:'from then on'},

  '你': {py:'nǐ', en:'you'},
  '也': {py:'yě', en:'also, too'},
  '去': {py:'qù', en:'to go'},
  '看看': {py:'kànkan', en:'take a look'},
  '饿': {py:'è', en:'hungry'},
  '了': {py:'le', en:'(shows a change)'},
  '渴': {py:'kě', en:'thirsty'},
  '我们': {py:'wǒmen', en:'we, us'},
  '里': {py:'lǐ', en:'inside, in'},
  '上': {py:'shàng', en:'on top of'},
  '一个': {py:'yí gè', en:'a, one'},
  '一只': {py:'yì zhī', en:'a, one (animal)'},
  '在': {py:'zài', en:'at, in, on; doing now (在玩, playing)'},
  '玩': {py:'wán', en:'to play'},
  '吗': {py:'ma', en:'(yes/no question)'},
  '花果山': {py:'Huāguǒ Shān', en:'Flower Fruit Mountain'},
  '吧': {py:'ba', en:'(let’s…)'},
  '给': {py:'gěi', en:'to give'},
  '混世魔王': {py:'Hùnshì Mówáng', en:'the Demon of Havoc'},   // (a name: Area 2's boss, never a word to catch)
  '水脏洞': {py:'Shuǐzàng Dòng', en:'Water-Belly Cave (a name)'},   // (the Demon of Havoc's cave, over its mouth)
  '龙王': {py:'Lóngwáng', en:'the Dragon King'},   // (a name: Area 3's, under the sea)
  '找': {py:'zhǎo', en:'to look for'},
  '考试': {py:'kǎoshì', en:'exam, test'},   // (the teacher's exam, at the end of chapter 1)
  '等': {py:'děng', en:'to wait'},
  '对': {py:'duì', en:'right, correct'},
  '看见': {py:'kànjiàn', en:'to see'},
  '教': {py:'jiāo', en:'to teach'},
  '师兄': {py:'shīxiōng', en:'senior brother (an older pupil)'},
  '孙悟空': {py:'Sūn Wùkōng', en:'Sun Wukong (your name: Monkey Awakened to Emptiness)'},
  '块': {py:'kuài', en:'(for pieces: 三块木头, three pieces of wood)'},
  '那边': {py:'nàbiān', en:'over there, the other side'},
  '神仙': {py:'shénxiān', en:'immortal'},   // (who never grow old: in the book, they live far across the sea; chapter 1's feast)
  '会': {py:'huì', en:'will'},
  '不会': {py:'bú huì', en:'won’t'},
  '可是': {py:'kěshì', en:'but'},
  '很多': {py:'hěn duō', en:'lots of, many'},
  '坐': {py:'zuò', en:'to sit; to go by'},
  '走': {py:'zǒu', en:'to walk; to leave'},
  '这': {py:'zhè', en:'this'},
  '累': {py:'lèi', en:'tired'},
  '做': {py:'zuò', en:'to make, to do'},

  // Heard in the opening's story
  '很久': {py:'hěn jiǔ', en:'a long time'},
  '以前': {py:'yǐqián', en:'before, ago'},

  '一座': {py:'yí zuò', en:'a, one (mountain, building)'},
  '叫': {py:'jiào', en:'to be called'},
  '动': {py:'dòng', en:'to move'},
  '它': {py:'tā', en:'it'},
  '眼睛': {py:'yǎnjing', en:'eyes'},
  '光': {py:'guāng', en:'light'}
};

// How a word is made, shown on its new-word card (with its English) and its page in the Word Scroll, for words where it
// genuinely helps you understand or remember them (decided 23 October 2026): never for one whose characters just say the
// meaning again (朋友: 朋 friend + 友 friend), and never a story that isn't true. Only where it's simple, useful and
// memorable (decided 24 October 2026, after playing it: the 艹 of 花 and 草, plants, meant nothing): you get it in one
// look, with no history lesson, and every part is something you can picture, a word or a shape that looks like what it
// means. A part you know as a word shows green, and a card says where you've met a part before, in another word you know
// (such as the 果 of 水果, in 苹果).
//   parts  a word of two or more characters (or a phrase): each as [Chinese, pinyin, English], its pinyin as said in this
//          word (so together they make the word's own). Its card shows them making the word, with its own English, what
//          it means (山 mountain + 羊 sheep = 山羊 goat; decided 25 October 2026 by the game's owner: it said what they
//          add up to, a mountain sheep, which isn't what 山羊 means), so there's no why
//   clue   a part that gives a clue, as [Chinese, pinyin, English]: inside a word of one character, or one of a word's
//          characters (the 木 of 木头), then why
//   same   a character it shares with another word (as), as [Chinese, pinyin, English], for a word with nothing simpler
//          to say (苹 means nothing on its own): shown once you know the other word, the two side by side, then why
//   why    on its own: the picture a character was drawn from
// After its English, a part can name another word with it (or a list of them) that has nothing here, so a card can say
// you've met it there (the 学 of 同学 is also in 学校, a word you know).
// The explanations wait for the native speaker's check (CHINESE.md).
const MADE = {
  // drawn from a picture
  '山': {why:'Drawn like three mountain peaks.'},
  '水': {why:'Drawn like flowing water, splashing out either side.'},
  '鱼': {why:'Drawn like a fish: its head at the top, its tail at the bottom.'},
  '大': {why:'Drawn like someone stretching their arms out wide, to show how big something is.'},
  '羊': {why:'Drawn like a sheep’s head: its two horns are at the top.'},
  '马': {why:'Drawn from a horse, seen from the side: its head and mane along the top, its legs and tail below.'},
  '一': {why:'One line, for one.'},
  '二': {why:'Two lines, for two.'},
  '三': {why:'Three lines, for three.'},
  // a clue inside, that you can see
  '树': {clue:['木', 'mù', 'tree'], why:'on its left, drawn like a tree'},
  '木头': {clue:['木', 'mù', 'tree'], why:'drawn like a tree: wood comes from trees'},
  '吃': {clue:['口', 'kǒu', 'mouth'], why:'on its left: you eat with your mouth'},
  '鸭子': {clue:['鸟', 'niǎo', 'bird'], why:'is on the right of 鸭: a duck is a bird'},
  '喝': {clue:['口', 'kǒu', 'mouth'], why:'on its left: you drink with your mouth'},
  '鹤': {clue:['鸟', 'niǎo', 'bird'], why:'is on the right of 鹤: a crane is a bird'},
  '月亮': {parts:[['月', 'yuè', 'moon'], ['亮', 'liang', 'bright']]},   // (月, as in the cave's name, 斜月三星洞)
  '松树': {parts:[['松', 'sōng', 'pine'], ['树', 'shù', 'tree']]},   // (松, as in 松鼠)
  '回家': {parts:[['回', 'huí', 'to go back'], ['家', 'jiā', 'home']]},
  '天': {clue:['大', 'dà', 'big'], why:'is drawn like someone standing with their arms out wide; the line over their head is the sky'},
  // made of words or characters
  '山羊': {parts:[['山', 'shān', 'mountain'], ['羊', 'yáng', 'sheep']]},
  '动物': {parts:[['动', 'dòng', 'to move'], ['物', 'wù', 'thing']]},
  '松鼠': {parts:[['松', 'sōng', 'pine'], ['鼠', 'shǔ', 'mouse']]},
  '头带': {parts:[['头', 'tóu', 'head'], ['带', 'dài', 'band']]},
  '鱼竿': {parts:[['鱼', 'yú', 'fish'], ['竿', 'gān', 'pole']]},
  '地图': {parts:[['地', 'dì', 'ground'], ['图', 'tú', 'picture']]},   // (a picture of the ground)
  '木筏': {parts:[['木', 'mù', 'wood'], ['筏', 'fá', 'raft']]},   // (木, as in 木头)
  '野猪': {parts:[['野', 'yě', 'wild'], ['猪', 'zhū', 'pig']]},
  '蜜蜂': {parts:[['蜜', 'mì', 'honey'], ['蜂', 'fēng', 'bee']]},
  '蜂王': {parts:[['蜂', 'fēng', 'bee'], ['王', 'wáng', 'king']]},
  '蜂蜜': {parts:[['蜂', 'fēng', 'bee'], ['蜜', 'mì', 'honey']]},   // (蜜蜂, the other way round: honey + bee = bee)
  '黄蜂': {parts:[['黄', 'huáng', 'yellow', '黄色'], ['蜂', 'fēng', 'bee']]},
  '同学': {parts:[['同', 'tóng', 'together'], ['学', 'xué', 'to learn', '学校']]},
  '海龟': {parts:[['海', 'hǎi', 'sea'], ['龟', 'guī', 'turtle', '乌龟']]},   // (a turtle of the sea)
  '没有': {parts:[['没', 'méi', 'not', '没关系'], ['有', 'yǒu', 'to have']]},
  '牛奶': {parts:[['牛', 'niú', 'cow'], ['奶', 'nǎi', 'milk']]},
  '跑步': {parts:[['跑', 'pǎo', 'run'], ['步', 'bù', 'step']]},   // (running, step after step: for exercise)
  '酸奶': {parts:[['酸', 'suān', 'sour'], ['奶', 'nǎi', 'milk']]},
  '猫头鹰': {parts:[['猫', 'māo', 'cat'], ['头', 'tóu', 'head'], ['鹰', 'yīng', 'eagle']]},   // (a bird of prey with a face like a cat's)
  // the master's year: counting on from ten (ten and one, and so on; two tens)
  '十一': {parts:[['十', 'shí', 'ten'], ['一', 'yī', 'one']]},
  '十二': {parts:[['十', 'shí', 'ten'], ['二', 'èr', 'two']]},
  '十三': {parts:[['十', 'shí', 'ten'], ['三', 'sān', 'three']]},
  '十四': {parts:[['十', 'shí', 'ten'], ['四', 'sì', 'four']]},
  '十五': {parts:[['十', 'shí', 'ten'], ['五', 'wǔ', 'five']]},
  '十六': {parts:[['十', 'shí', 'ten'], ['六', 'liù', 'six']]},
  '十七': {parts:[['十', 'shí', 'ten'], ['七', 'qī', 'seven']]},
  '十八': {parts:[['十', 'shí', 'ten'], ['八', 'bā', 'eight']]},
  '十九': {parts:[['十', 'shí', 'ten'], ['九', 'jiǔ', 'nine']]},
  '二十': {parts:[['二', 'èr', 'two'], ['十', 'shí', 'ten']]},   // (two tens)
  // the four sides: north, south, east and west, and 边, side
  '北边': {parts:[['北', 'běi', 'north'], ['边', 'bian', 'side']]},
  '南边': {parts:[['南', 'nán', 'south'], ['边', 'bian', 'side']]},
  '东边': {parts:[['东', 'dōng', 'east'], ['边', 'bian', 'side']]},
  '西边': {parts:[['西', 'xī', 'west'], ['边', 'bian', 'side']]},
  '雪人': {parts:[['雪', 'xuě', 'snow'], ['人', 'rén', 'person']]},
  '新年快乐': {parts:[['新', 'xīn', 'new'], ['年', 'nián', 'year'], ['快乐', 'kuàilè', 'happy']]},
  '米饭': {parts:[['米', 'mǐ', 'rice'], ['饭', 'fàn', 'meal']]},   // (rice, made into a meal: cooked)
  '热': {clue:['灬', 'huǒ', 'fire'], why:'is at its bottom: four little flames. It’s hot!'},
  '冷': {clue:['冫', 'bīng', 'ice'], why:'is on its left: two drops of ice. It’s cold!'},
  '雨': {why:'Drawn like rain: the sky along its top, and drops of rain falling under it.'},
  '大雨': {parts:[['大', 'dà', 'big'], ['雨', 'yǔ', 'rain']]},
  '黄鼠狼': {parts:[['黄', 'huáng', 'yellow'], ['鼠', 'shǔ', 'mouse'], ['狼', 'láng', 'wolf']]},
  '萤火虫': {parts:[['萤', 'yíng', 'glow-worm'], ['火', 'huǒ', 'fire'], ['虫', 'chóng', 'insect']]},
  '刺猬': {parts:[['刺', 'cì', 'spike'], ['猬', 'wei', 'hedgehog']]},
  '飞蛾': {parts:[['飞', 'fēi', 'to fly'], ['蛾', 'é', 'moth']]},
  '臭豆腐': {parts:[['臭', 'chòu', 'smelly'], ['豆腐', 'dòufu', 'tofu']]},
  '雪': {clue:['雨', 'yǔ', 'rain'], why:'is on its top: snow falls from the sky, as rain does'},
  // the trade (9 November 2026): treasures, and things from the shop
  '玉': {why:'Drawn like three pieces of jade on a string; the dot is there so it isn’t 王 (king).'},
  '人参': {clue:['人', 'rén', 'person'], why:'is its first character: the root looks like a little person, with arms and legs'},
  '松子': {parts:[['松', 'sōng', 'pine'], ['子', 'zǐ', 'seed']]},   // (松, as in 松鼠)
  '羽毛': {parts:[['羽', 'yǔ', 'feathers'], ['毛', 'máo', 'hair, fur']]},
  '花瓶': {parts:[['花', 'huā', 'flower'], ['瓶', 'píng', 'bottle']]},
  '鱼缸': {parts:[['鱼', 'yú', 'fish'], ['缸', 'gāng', 'jar']]},
  '风铃': {parts:[['风', 'fēng', 'wind'], ['铃', 'líng', 'bell']]},
  '灯笼': {parts:[['灯', 'dēng', 'lamp'], ['笼', 'long', 'cage']]},   // (a lamp in a cage of bamboo and paper)
  // phrases
  '你好': {parts:[['你', 'nǐ', 'you'], ['好', 'hǎo', 'good']]},
  '我不要': {parts:[['我', 'wǒ', 'I'], ['不', 'bú', 'not', '不客气'], ['要', 'yào', 'to want']]},
  // the same character as in another word
  '苹果': {same:['果', 'guǒ', 'fruit'], as:'水果', why:'an apple is a fruit'},
  '奶酪': {same:['奶', 'nǎi', 'milk'], as:'牛奶', why:'cheese is made from milk'}
};

// Two words easily mixed up, side by side on a card of their own (sideCard, js/cards.js): after the newer one's card the
// first time you catch it (its title ▸, after How it's made and Sounds like), and from either word's page in the Word
// Scroll, from its English: what each is for, an example or two (tap one to hear it), and a line to remember (decided 9
// November 2026: 二 is for counting, 一，二，三; 两 for two of something, 两个桃子, taught as the second maths lesson, so
// how many there are is never 二). The examples have voice clips (npm run voices) and go to the native speaker (CHINESE.md).
const SIDE_BY_SIDE = [
  {words:['二', '两'], title:'二 or 两?', remember:'Counting? 二. How many? 两.',
    use:{'二':{for:'For counting', ex:[{zh:'一 ， 二 ， 三 ！', en:'One, two, three!'}]},
      '两':{for:'For two of something', ex:[{zh:'两 个 桃子', en:'two peaches'}, {zh:'两 只 猴子', en:'two monkeys'}]}}}
];
