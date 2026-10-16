// The word bank: every Chinese word in the game, defined once.
//
//   py    pinyin, with tone marks
//   en    English meaning
//   pic   says the word has a picture (on new-word cards and in quizzes). The picture shown is its
//         pixel sprite in content/sprites.js; this emoji is only a stand-in until it has one.
//   area  the area where you can collect the word. Words without an area are only heard:
//         they appear in sentences and can be tapped, but can't be collected yet.
//   category  where the word goes in the Word Scroll: one of the CATEGORIES below
//
// In the Word Scroll, each category's words appear in the order they are listed here.
// Sentences in the content files may only use words from this bank (the tests check).

// The Word Scroll's categories, in the order it shows them, with their names. A category only
// appears once the area has words in it.
const CATEGORIES = {
  animals: 'Animals',
  food: 'Food and drink',
  nature: 'Nature',
  places: 'Places',
  items: 'Items',
  actions: 'Actions',
  people: 'People and phrases'
};

const WORD_BANK = {
  // Collected on Flower Fruit Mountain (area 1)
  '石头': {py:'shítou', en:'stone, rock', pic:'🪨', area:1, category:'nature'},
  '路': {py:'lù', en:'path, road', pic:'🛣️', area:1, category:'places'},
  '你好': {py:'nǐ hǎo', en:'hello', pic:'👋', area:1, category:'people'},
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
  '吃': {py:'chī', en:'to eat', pic:'😋', area:1, category:'actions'},
  '喝': {py:'hē', en:'to drink', pic:'🥤', area:1, category:'actions'},
  '朋友': {py:'péngyou', en:'friend', pic:'🧑‍🤝‍🧑', area:1, category:'people'},
  '我': {py:'wǒ', en:'I, me', area:1, category:'people'},
  '要': {py:'yào', en:'to want', area:1, category:'actions'},
  '瀑布': {py:'pùbù', en:'waterfall', area:1, category:'nature'},
  '老板': {py:'lǎobǎn', en:'shop owner, boss', area:1, category:'people'},
  '头带': {py:'tóudài', en:'headband', area:1, category:'items'},

  // Heard in sentences
  '是': {py:'shì', en:'am, is, are'},
  '你': {py:'nǐ', en:'you'},
  '也': {py:'yě', en:'also, too'},
  '去': {py:'qù', en:'to go'},
  '看看': {py:'kànkan', en:'take a look'},
  '饿': {py:'è', en:'hungry'},
  '了': {py:'le', en:'(shows a change)'},
  '渴': {py:'kě', en:'thirsty'},
  '谢谢': {py:'xièxie', en:'thank you'},
  '我们': {py:'wǒmen', en:'we, us'},
  '里': {py:'lǐ', en:'inside, in'},
  '有': {py:'yǒu', en:'to have; there is'},
  '上': {py:'shàng', en:'on top of'},
  '一个': {py:'yí gè', en:'a, one'},
  '一只': {py:'yì zhī', en:'a, one (animal)'},
  '大': {py:'dà', en:'big'},
  '小': {py:'xiǎo', en:'little, small'},
  '很多': {py:'hěn duō', en:'lots of'},
  '在': {py:'zài', en:'at, in, on'},
  '玩': {py:'wán', en:'to play'},
  '很': {py:'hěn', en:'very'},
  '快乐': {py:'kuàilè', en:'happy'},
  '谁': {py:'shéi', en:'who'},
  '什么': {py:'shénme', en:'what'},
  '吗': {py:'ma', en:'(yes/no question)'},
  '花果山': {py:'Huāguǒ Shān', en:'Flower Fruit Mountain'},
  '吧': {py:'ba', en:'(let’s…)'},
  '老': {py:'lǎo', en:'old'},
  '找': {py:'zhǎo', en:'to look for'},
  '这': {py:'zhè', en:'this'},
  '和': {py:'hé', en:'and'}
};
