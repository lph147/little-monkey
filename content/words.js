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
//   later true for a word the area will teach later, but nothing does yet (such as 蜜蜂, till the troop's bees): it isn't
//         counted, or in the Word Scroll, unless the game you're playing has caught it already
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
  actions: {tab:'Actions', name:'Actions'},
  people: {tab:'People', name:'People'},
  colours: {tab:'Colours', name:'Colours'},
  numbers: {tab:'Numbers', name:'Numbers'},
  phrases: {tab:'Phrases', name:'Phrases'}
};

const WORD_BANK = {
  // Collected on Flower Fruit Mountain (area 1)
  '石头': {py:'shítou', en:'stone, rock', pic:'🪨', area:1, category:'nature'},
  '猴子': {py:'hóuzi', en:'monkey', pic:'🐒', area:1, category:'animals'},
  '山': {py:'shān', en:'mountain', pic:'⛰️', area:1, category:'nature'},
  '花': {py:'huā', en:'flower', pic:'🌸', area:1, category:'nature'},
  '草': {py:'cǎo', en:'grass', pic:'🌿', area:1, category:'nature'},
  '树': {py:'shù', en:'tree', pic:'🌳', area:1, category:'nature'},
  '桃子': {py:'táozi', en:'peach', pic:'🍑', area:1, category:'food'},
  '苹果': {py:'píngguǒ', en:'apple', pic:'🍎', area:1, category:'food'},
  '河': {py:'hé', en:'river', pic:'🏞️', area:1, category:'nature'},
  '水': {py:'shuǐ', en:'water', pic:'💧', area:1, category:'food'},
  '鱼': {py:'yú', en:'fish', pic:'🐟', area:1, category:'animals'},
  '鸟': {py:'niǎo', en:'bird', pic:'🐦', area:1, category:'animals'},
  '动物': {py:'dòngwù', en:'animal', pic:'🐾', area:1, category:'animals'},
  '兔子': {py:'tùzi', en:'rabbit', pic:'🐇', area:1, category:'animals'},
  '狐狸': {py:'húli', en:'fox', pic:'🦊', area:1, category:'animals'},
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
  '蛇': {py:'shé', en:'snake', pic:'🐍', area:1, category:'animals'},
  '蜘蛛': {py:'zhīzhū', en:'spider', pic:'🕷️', area:1, category:'animals'},
  '蜜蜂': {py:'mìfēng', en:'bee', pic:'🐝', area:1, category:'animals', later:true},   // (caught in the long grass until 21 October 2026; in chapter 1, a friend: till then, for later)
  '野猪': {py:'yězhū', en:'wild boar', pic:'🐗', area:1, category:'animals'},
  '鹿': {py:'lù', en:'deer', pic:'🦌', area:1, category:'animals'},   // (chapter 1: a friend in the pine wood)
  '狼': {py:'láng', en:'wolf', pic:'🐺', area:1, category:'animals'},   // (chapter 1: in the pine wood's long grass)
  '跳': {py:'tiào', en:'to jump', pic:'🦘', area:1, category:'actions'},
  '桥': {py:'qiáo', en:'bridge', pic:'🌉', area:1, category:'places'},
  '床': {py:'chuáng', en:'bed', pic:'🛏️', area:1, category:'items'},
  '碗': {py:'wǎn', en:'bowl', pic:'🥣', area:1, category:'items'},
  '桌子': {py:'zhuōzi', en:'table', pic:'🪑', area:1, category:'items'},
  '家': {py:'jiā', en:'home', pic:'🏠', area:1, category:'places'},
  '睡觉': {py:'shuìjiào', en:'to sleep', pic:'😴', area:1, category:'actions'},
  '王': {py:'wáng', en:'king', pic:'👑', area:1, category:'people'},
  '一': {py:'yī', en:'one', pic:'1️⃣', area:1, category:'numbers'},
  '二': {py:'èr', en:'two', pic:'2️⃣', area:1, category:'numbers'},
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
  '朋友': {py:'péngyou', en:'friend', pic:'🧑‍🤝‍🧑', area:1, category:'people'},
  '我': {py:'wǒ', en:'I, me', area:1, category:'people'},
  '要': {py:'yào', en:'to want', area:1, category:'actions'},
  '瀑布': {py:'pùbù', en:'waterfall', pic:'💦', area:1, category:'nature'},
  '老板': {py:'lǎobǎn', en:'shop owner, boss', pic:'🏪', area:1, category:'people'},
  '头带': {py:'tóudài', en:'headband', pic:'🎀', area:1, category:'items'},
  '戴': {py:'dài', en:'to wear (on your head)', area:1, category:'actions'},
  // Chapter 1: the troop's new home
  '木头': {py:'mùtou', en:'wood', pic:'🌲', area:1, category:'items'},
  '学校': {py:'xuéxiào', en:'school', pic:'🏫', area:1, category:'places'},
  '老师': {py:'lǎoshī', en:'teacher', pic:'🧑‍🏫', area:1, category:'people'},
  '同学': {py:'tóngxué', en:'classmate', pic:'🎒', area:1, category:'people'},

  // Phrases you learn on Flower Fruit Mountain, and reply with
  '你好': {py:'nǐ hǎo', en:'hello', pic:'👋', area:1, category:'phrases', phrase:true, use:'when you meet someone', cue:'says hello'},
  '谢谢': {py:'xièxie', en:'thank you', area:1, category:'phrases', phrase:true, use:'when someone gives you something or helps you', cue:'helps you'},
  '不客气': {py:'bú kèqi', en:'you’re welcome', area:1, category:'phrases', phrase:true, use:'when someone thanks you', cue:'thanks you'},
  '对不起': {py:'duìbuqǐ', en:'sorry', area:1, category:'phrases', phrase:true, use:'when you’ve got something wrong', cue:'isn’t happy'},
  '没关系': {py:'méi guānxi', en:'that’s OK', area:1, category:'phrases', phrase:true, use:'when someone says sorry', cue:'says sorry'},
  '再见': {py:'zàijiàn', en:'goodbye', area:1, category:'phrases', phrase:true, use:'when you leave', cue:'says goodbye'},
  '我不要': {py:'wǒ bú yào', en:'no thanks, I don’t want it', area:1, category:'phrases', phrase:true, use:'when you don’t want something'},

  // Heard in sentences
  '是': {py:'shì', en:'am, is, are'},
  '水果': {py:'shuǐguǒ', en:'fruit'},
  '和': {py:'hé', en:'and'},
  '后面': {py:'hòumiàn', en:'behind'},
  '大': {py:'dà', en:'big'},
  '从': {py:'cóng', en:'from'},
  '哪里': {py:'nǎlǐ', en:'where'},
  '来': {py:'lái', en:'to come'},
  '谁': {py:'shéi', en:'who, whoever'},
  '进去': {py:'jìnqù', en:'to go in'},
  '就': {py:'jiù', en:'then'},
  '怕': {py:'pà', en:'to be scared'},
  '里面': {py:'lǐmiàn', en:'inside'},
  '太': {py:'tài', en:'too, very'},
  '好': {py:'hǎo', en:'good'},
  '的': {py:'de', en:'(joins words: 我们的, our; 红色的花, a red flower)'},
  '只': {py:'zhī', en:'(counts animals: 三只猴子, three monkeys)'},
  '水帘洞': {py:'Shuǐlián Dòng', en:'Water Curtain Cave (a name)'},
  '美猴王': {py:'Měi Hóuwáng', en:'Handsome Monkey King (a name)'},
  '很': {py:'hěn', en:'very'},
  '盖': {py:'gài', en:'to build (a house)'},
  '刷': {py:'shuā', en:'to paint (with a brush)'},
  '画': {py:'huà', en:'to paint (a picture), to draw'},
  '门': {py:'mén', en:'door'},
  '屋顶': {py:'wūdǐng', en:'roof'},
  '窗户': {py:'chuānghu', en:'window'},
  '墙': {py:'qiáng', en:'wall'},
  '柱子': {py:'zhùzi', en:'pillar'},
  '灯笼': {py:'dēnglong', en:'lantern'},
  '牌子': {py:'páizi', en:'sign, board'},
  '台阶': {py:'táijiē', en:'step, steps'},
  '好看': {py:'hǎokàn', en:'good-looking, lovely'},
  '种花': {py:'zhòng huā', en:'to plant flowers'},
  '几': {py:'jǐ', en:'how many'},
  '个': {py:'gè', en:'(counts things: 几个, how many)'},
  '们': {py:'men', en:'(more than one: 同学们, the class)'},
  '上课': {py:'shàngkè', en:'class begins'},
  '下课': {py:'xiàkè', en:'class is over'},
  '这里': {py:'zhèlǐ', en:'here'},
  '勇敢': {py:'yǒnggǎn', en:'brave'},
  '从此': {py:'cóngcǐ', en:'from then on'},
  '快乐': {py:'kuàilè', en:'happy'},
  '你': {py:'nǐ', en:'you'},
  '也': {py:'yě', en:'also, too'},
  '去': {py:'qù', en:'to go'},
  '看看': {py:'kànkan', en:'take a look'},
  '饿': {py:'è', en:'hungry'},
  '了': {py:'le', en:'(shows a change)'},
  '渴': {py:'kě', en:'thirsty'},
  '我们': {py:'wǒmen', en:'we, us'},
  '里': {py:'lǐ', en:'inside, in'},
  '有': {py:'yǒu', en:'to have; there is'},
  '上': {py:'shàng', en:'on top of'},
  '一个': {py:'yí gè', en:'a, one'},
  '一只': {py:'yì zhī', en:'a, one (animal)'},
  '在': {py:'zài', en:'at, in, on'},
  '玩': {py:'wán', en:'to play'},
  '什么': {py:'shénme', en:'what'},
  '吗': {py:'ma', en:'(yes/no question)'},
  '花果山': {py:'Huāguǒ Shān', en:'Flower Fruit Mountain'},
  '吧': {py:'ba', en:'(let’s…)'},
  '老': {py:'lǎo', en:'old'},
  '找': {py:'zhǎo', en:'to look for'},
  '这': {py:'zhè', en:'this'},
  '累': {py:'lèi', en:'tired'},

  // Heard in the opening's story
  '很久': {py:'hěn jiǔ', en:'a long time'},
  '以前': {py:'yǐqián', en:'before, ago'},
  '海': {py:'hǎi', en:'sea'},
  '一座': {py:'yí zuò', en:'a, one (mountain, building)'},
  '叫': {py:'jiào', en:'to be called'},
  '动': {py:'dòng', en:'to move'},
  '小': {py:'xiǎo', en:'little, small'},
  '它': {py:'tā', en:'it'},
  '眼睛': {py:'yǎnjing', en:'eyes'},
  '光': {py:'guāng', en:'light'}
};
