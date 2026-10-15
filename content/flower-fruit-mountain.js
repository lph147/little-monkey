// Area 1: 花果山 Flower Fruit Mountain.
// The little monkey is born from a stone and meets the monkey troop.
//
// This file is only data: the engine in js/ reads it. Chinese sentences are written with a space
// between words, like '我 饿 了 。', because each word is coloured and can be tapped on its own.
// Every word must be in the word bank (content/words.js); the tests check.
const FLOWER_FRUIT_MOUNTAIN = {
  number: 1,

  // Where you start the first time you play. x is the column and y the row, counting from 0
  // at the top left of the map.
  start: {x:9, y:2},

  // The map, one letter per tile:
  //   g grass   G tall grass (animals hide here)   F flowers   . path   B bridge
  //   T tree    P peach tree   Q apple tree   S the stone you were born from   N sign
  //   M cliff   C cave door    R rocks (they roll away once both monkeys are helped)
  //   W river   O pond         X waterfall
  map: [
    "MMMMMMMMMMMMMMMMMMXXMMMM",
    "MMMMMMMggSggMMggggXXTTTT",
    "MMMMMMMgF.gNMMgggFWWTTTT",
    "MMMCMMMgg.ggMMggggWWTTTT",
    "MMg.gMMMg.gMMMMRRMWWTTTT",
    "TTg.ggggg.ggggg.ggWWTTTT",
    "TPg.............ggWWTTTT",
    "TQggGGGGgggFggg.ggWWgggT",
    "TPggGGGGggggTgg.ggWWgGgT",
    "TTggGGGgggOOOgg.gFWWGGgT",
    "TFgggggggOOOOgg.ggWWGGgT",
    "TTgggGGGggggggg.ggWWgggT",
    "TggFgGGGggggggg...BBgggT",
    "TgggggggggggggggggWWgGgT",
    "TTgGGGggggggggFgggWWGGgT",
    "TTTTTTTTTTTTTTTTTTWWTTTT"
  ],

  // Characters standing on the map. A character's name shows Chinese, pinyin and English
  // together, because names aren't vocabulary.
  // palette: a monkey's colours. o outline, f fur, s face and tummy, m mouth, e eyes, w beard.
  characters: [
    {id:'elder', x:10, y:5, facing:'down', name:{zh:'老猴子', py:'lǎo hóuzi', en:'Old monkey'},
      palette:{o:'#3A3A36', f:'#A9A79F', s:'#EADCC8', m:'#B89E86', e:'#222222', w:'#FAFAF5'}},
    {id:'hungry', x:13, y:5, facing:'down', name:{zh:'饿猴子', py:'è hóuzi', en:'Hungry monkey'},
      palette:{o:'#4A2C17', f:'#B8743E', s:'#F2C9A0', m:'#C68A64', e:'#24160C'}},
    {id:'thirsty', x:2, y:12, facing:'right', name:{zh:'渴猴子', py:'kě hóuzi', en:'Thirsty monkey'},
      palette:{o:'#40250F', f:'#94592E', s:'#F0C59A', m:'#C08060', e:'#24160C'}},
    {id:'playful', x:11, y:12, facing:'down', name:{zh:'小猴子', py:'xiǎo hóuzi', en:'Little monkey'},
      palette:{o:'#4A2C17', f:'#CC8D45', s:'#F6D2A8', m:'#C98E6A', e:'#24160C'}},
    {id:'bird', x:22, y:13, facing:'down'}
  ],

  // The name shown when you read the sign by the stone.
  sign: {zh:'牌子', py:'páizi', en:'Sign'},

  // Things that sparkle until you learn their word: word, then [x, y] on the map.
  sparkles: {'石头':[9, 1], '山':[12, 3], '路':[9, 4], '花':[8, 2], '草':[5, 7], '树':[12, 8], '桃子':[1, 6], '苹果':[1, 7], '河':[18, 7], '鱼':[11, 9], '洞':[3, 3], '森林':[21, 6], '瀑布':[18, 1]},

  // Animals hiding in the tall grass. The id is kept in saved games, so never change it.
  animals: [
    {id:'rabbit', word:'兔子'},
    {id:'fox', word:'狐狸'},
    {id:'squirrel', word:'松鼠'},
    {id:'goat', word:'山羊'}
  ],

  // What the characters say. The English shows under a sentence the first time you see it.
  lines: {
    hi: {zh:'你好 ！', en:'Hello!'},
    iam: {zh:'我 是 猴子 。 你 也 是 猴子 ！', en:'I am a monkey. You are a monkey too!'},
    go: {zh:'去 看看 ！', en:'Go and take a look!'},
    hungry: {zh:'我 饿 了 。 我 要 吃 桃子 ！', en:"I'm hungry. I want to eat a peach!"},
    thirsty: {zh:'我 渴 了 。 我 要 喝 水 ！', en:"I'm thirsty. I want to drink some water!"},
    havePeach: {zh:'你 有 桃子 吗 ？', en:'Do you have a peach?'},
    haveWater: {zh:'你 有 水 吗 ？', en:'Do you have water?'},
    friends: {zh:'谢谢 ！ 我们 是 朋友 ！', en:'Thank you! We are friends!'},
    thanks: {zh:'谢谢 你 ！', en:'Thank you!'},
    river: {zh:'河 里 有 水 。', en:'There is water in the river.'},
    pond: {zh:'水 里 有 鱼 。', en:'There are fish in the water.'},
    play: {zh:'我们 玩 吧 ！', en:"Let's play!"},
    weFriends: {zh:'我们 是 朋友 ！', en:'We are friends!'},
    animals: {zh:'草 里 有 动物 。 去 找 动物 吧 ！', en:'There are animals in the grass. Go and find them!'},
    findElder: {zh:'你好 ！ 去 找 老 猴子 吧 ！', en:'Hello! Go and find the old monkey!'},
    notThis: {zh:'这 是 苹果 。 我 要 吃 桃子 ！', en:'This is an apple. I want to eat a peach!'},
    notPeachYet: {zh:'你 有 桃子 吗 ？', en:'Do you have a peach?'}
  },

  // The Story Scroll at the waterfall: a short reading challenge.
  story: [
    {zh:'山 上 有 一个 大 石头 。', en:'On the mountain there is a big stone.'},
    {zh:'石头 里 有 一只 小 猴子 。', en:'Inside the stone there is a little monkey.'},
    {zh:'小 猴子 有 很多 朋友 。', en:'The little monkey has lots of friends.'},
    {zh:'猴子 吃 桃子 ， 喝 水 。', en:'Monkeys eat peaches and drink water.'},
    {zh:'鸟 在 树 上 玩 。', en:'Birds play in the trees.'},
    {zh:'河 里 有 鱼 ， 山 上 有 瀑布 。', en:'There are fish in the river, and a waterfall on the mountain.'},
    {zh:'小 猴子 很 快乐 ！', en:'The little monkey is very happy!'}
  ],

  // Questions after the story. The options are words; their pictures are shown.
  storyQuestions: [
    {zh:'谁 在 石头 里 ？', options:['猴子', '鸟', '花'], answer:'猴子'},
    {zh:'猴子 吃 什么 ？', options:['石头', '桃子', '草'], answer:'桃子'},
    {zh:'河 里 有 什么 ？', options:['树', '山羊', '鱼'], answer:'鱼'}
  ],

  // The opening scene. Each caption appears this many seconds in, then waits for Next.
  // The pictures (night, dawn, the stone cracking) are drawn by js/draw.js to match these times.
  intro: [
    {at:0, zh:'很久很久以前……', py:'Hěn jiǔ hěn jiǔ yǐqián……', en:'Long, long ago…'},
    {at:2.8, zh:'海里有一座山，叫花果山。', py:'Hǎi lǐ yǒu yí zuò shān, jiào Huāguǒ Shān.', en:'In the sea stood a mountain called Flower Fruit Mountain.'},
    {at:5.4, zh:'山上有一个大石头。', py:'Shān shàng yǒu yí gè dà shítou.', en:'On top of the mountain sat a big stone.'},
    {at:7.2, zh:'石头动了！', py:'Shítou dòng le!', en:'The stone moved!'},
    {at:9, zh:'一只小猴子！', py:'Yì zhī xiǎo hóuzi!', en:'A little monkey!'},
    {at:10.6, zh:'它的眼睛里有光。', py:'Tā de yǎnjing lǐ yǒu guāng.', en:'Light shone from its eyes.'},
    {at:13.2, zh:'你好，小猴子！', py:'Nǐ hǎo, xiǎo hóuzi!', en:'Hello, little monkey!'}
  ]
};
