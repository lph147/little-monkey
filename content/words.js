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
  actions: {tab:'Actions', name:'Actions'},
  people: {tab:'People', name:'People'},
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
  '树': {py:'shù', en:'tree', pic:'🌳', area:1, category:'nature', alike:['木头', '棍子']},
  '桃子': {py:'táozi', en:'peach', pic:'🍑', area:1, category:'food'},
  '苹果': {py:'píngguǒ', en:'apple', pic:'🍎', area:1, category:'food'},
  '河': {py:'hé', en:'river', pic:'🏞️', area:1, category:'nature', alike:['瀑布']},
  '水': {py:'shuǐ', en:'water', pic:'💧', area:1, category:'food', alike:['喝']},
  '水果': {py:'shuǐguǒ', en:'fruit', pic:'🧺', area:1, category:'food', alike:['桃子', '苹果']},   // (the hungry monkey teaches it as he asks, since 24 October 2026; the fruit trees did for a day, and it was heard only till then)
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
  '蛇': {py:'shé', en:'snake', pic:'🐍', area:1, category:'animals'},
  '蜘蛛': {py:'zhīzhū', en:'spider', pic:'🕷️', area:1, category:'animals'},
  '蜜蜂': {py:'mìfēng', en:'bee', pic:'🐝', area:1, category:'animals', later:true},   // (caught in the long grass until 21 October 2026; in chapter 1, a friend: till then, for later)
  '野猪': {py:'yězhū', en:'wild boar', pic:'🐗', area:1, category:'animals'},
  '鹿': {py:'lù', en:'deer', pic:'🦌', area:1, category:'animals'},   // (chapter 1: a friend in the pine wood)
  '狼': {py:'láng', en:'wolf', pic:'🐺', area:1, category:'animals'},   // (chapter 1: in the pine wood's long grass)
  '狐狸': {py:'húli', en:'fox', pic:'🦊', area:1, category:'animals'},   // (chapter 1: hiding on the hillside; in the meadow's tall grass until 23 October 2026)
  '蝴蝶': {py:'húdié', en:'butterfly', pic:'🦋', area:1, category:'animals'},   // (chapter 1: fluttering over the flowers on the riverside, the way east to the bees)
  '黄蜂': {py:'huángfēng', en:'wasp', pic:'🦟', area:1, category:'animals', alike:['蜜蜂']},   // (chapter 1: in the tall flowers of the bees' valley; its picture is a pixel wasp, a striped insect like the bee: there's no emoji for a wasp, so its stand-in is a mosquito)
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
  '蜂蜜': {py:'fēngmì', en:'honey', pic:'🍯', area:1, category:'food', later:true},   // (heard at the feast's table; taught with the first honey, once the bees are built)

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
  '和': {py:'hé', en:'and'},
  '后面': {py:'hòumiàn', en:'behind'},
  '下面': {py:'xiàmiàn', en:'under'},
  '找到': {py:'zhǎodào', en:'to find'},
  '捉迷藏': {py:'zhuō mícáng', en:'hide and seek'},
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
  '灯笼': {py:'dēnglong', en:'lantern'},
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
  '上': {py:'shàng', en:'on top of'},
  '一个': {py:'yí gè', en:'a, one'},
  '一只': {py:'yì zhī', en:'a, one (animal)'},
  '在': {py:'zài', en:'at, in, on; doing now (在玩, playing)'},
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

// How a word is made, shown on its new-word card (with its English) and its page in the Word Scroll, for words where it
// genuinely helps you understand or remember them (decided 23 October 2026): never for one whose characters just say the
// meaning again (朋友: 朋 friend + 友 friend), and never a story that isn't true. Only where it's simple, useful and
// memorable (decided 24 October 2026, after playing it: the 艹 of 花 and 草, plants, meant nothing): you get it in one
// look, with no history lesson, and every part is something you can picture, a word or a shape that looks like what it
// means. A part you know as a word shows green, and a card says where you've met a part before, in another word you know
// (such as the 果 of 水果, in 苹果).
//   parts  a word of two or more characters (or a phrase): each as [Chinese, pinyin, English], its pinyin as said in this
//          word (so together they make the word's own), then why: what they add up to
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
  '羊': {why:'Drawn like a sheep’s head: its two horns are at the top.'},
  '一': {why:'One line, for one.'},
  '二': {why:'Two lines, for two.'},
  '三': {why:'Three lines, for three.'},
  // a clue inside, that you can see
  '树': {clue:['木', 'mù', 'tree'], why:'on its left, drawn like a tree'},
  '木头': {clue:['木', 'mù', 'tree'], why:'drawn like a tree: wood comes from trees'},
  '吃': {clue:['口', 'kǒu', 'mouth'], why:'on its left: you eat with your mouth'},
  '喝': {clue:['口', 'kǒu', 'mouth'], why:'on its left: you drink with your mouth'},
  // made of words or characters
  '山羊': {parts:[['山', 'shān', 'mountain'], ['羊', 'yáng', 'sheep']], why:'a mountain sheep'},
  '动物': {parts:[['动', 'dòng', 'to move'], ['物', 'wù', 'thing']], why:'things that move'},
  '松鼠': {parts:[['松', 'sōng', 'pine'], ['鼠', 'shǔ', 'mouse']], why:'a pine mouse'},
  '头带': {parts:[['头', 'tóu', 'head'], ['带', 'dài', 'band']], why:'a band for your head'},
  '野猪': {parts:[['野', 'yě', 'wild'], ['猪', 'zhū', 'pig']], why:'a wild pig'},
  '蜜蜂': {parts:[['蜜', 'mì', 'honey'], ['蜂', 'fēng', 'bee']], why:'a honey bee'},
  '黄蜂': {parts:[['黄', 'huáng', 'yellow', '黄色'], ['蜂', 'fēng', 'bee']], why:'a yellow bee: a wasp'},
  '同学': {parts:[['同', 'tóng', 'together'], ['学', 'xué', 'to learn', '学校']], why:'someone you learn with'},
  '没有': {parts:[['没', 'méi', 'not', '没关系'], ['有', 'yǒu', 'to have']], why:'don’t have'},
  // phrases
  '你好': {parts:[['你', 'nǐ', 'you'], ['好', 'hǎo', 'good']], why:'hello'},
  '再见': {parts:[['再', 'zài', 'again'], ['见', 'jiàn', 'to see']], why:'goodbye: see you again'},
  '我不要': {parts:[['我', 'wǒ', 'I'], ['不', 'bú', 'not', '不客气'], ['要', 'yào', 'to want']], why:'I don’t want it'},
  // the same character as in another word
  '苹果': {same:['果', 'guǒ', 'fruit'], as:'水果', why:'an apple is a fruit'}
};
