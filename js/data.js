// Screen size, then all of Flower Fruit Mountain's content: words, lines, the story, intro captions, the map and characters.

const $ = s => document.querySelector(s);
const T = 16, VW = 11, VH = 10, STEP = 270, TURN_DELAY = 130;

/* ================= DATA ================= */
const WORDS = {
  '石头':{py:'shítou',en:'stone, rock',pic:'🪨'},
  '路':{py:'lù',en:'path, road',pic:'🛣️'},
  '你好':{py:'nǐ hǎo',en:'hello',pic:'👋'},
  '猴子':{py:'hóuzi',en:'monkey',pic:'🐒'},
  '山':{py:'shān',en:'mountain',pic:'⛰️'},
  '花':{py:'huā',en:'flower',pic:'🌸'},
  '草':{py:'cǎo',en:'grass',pic:'🌿'},
  '树':{py:'shù',en:'tree',pic:'🌳'},
  '桃子':{py:'táozi',en:'peach',pic:'🍑'},
  '苹果':{py:'píngguǒ',en:'apple',pic:'🍎'},
  '河':{py:'hé',en:'river',pic:'🏞️'},
  '水':{py:'shuǐ',en:'water',pic:'💧'},
  '鱼':{py:'yú',en:'fish',pic:'🐟'},
  '鸟':{py:'niǎo',en:'bird',pic:'🐦'},
  '动物':{py:'dòngwù',en:'animal',pic:'🐾'},
  '兔子':{py:'tùzi',en:'rabbit',pic:'🐇'},
  '狐狸':{py:'húli',en:'fox',pic:'🦊'},
  '松鼠':{py:'sōngshǔ',en:'squirrel',pic:'🐿️'},
  '山羊':{py:'shānyáng',en:'goat',pic:'🐐'},
  '森林':{py:'sēnlín',en:'forest',pic:'🌲🌳🌲'},
  '洞':{py:'dòng',en:'cave',pic:'🕳️'},
  '吃':{py:'chī',en:'to eat',pic:'😋'},
  '喝':{py:'hē',en:'to drink',pic:'🥤'},
  '朋友':{py:'péngyou',en:'friend',pic:'🧑‍🤝‍🧑'},
  '我':{py:'wǒ',en:'I, me'},
  '要':{py:'yào',en:'to want'},
  '瀑布':{py:'pùbù',en:'waterfall'}
};
const ORDER = Object.keys(WORDS);
const GLOSS = {
  '是':['shì','am, is, are'],'你':['nǐ','you'],'也':['yě','also, too'],'去':['qù','to go'],
  '看看':['kànkan','take a look'],'饿':['è','hungry'],'了':['le','(shows a change)'],
  '渴':['kě','thirsty'],'谢谢':['xièxie','thank you'],'我们':['wǒmen','we, us'],'里':['lǐ','inside, in'],
  '有':['yǒu','to have; there is'],'上':['shàng','on top of'],'一个':['yí gè','a, one'],
  '一只':['yì zhī','a, one (animal)'],'大':['dà','big'],'小':['xiǎo','little, small'],
  '很多':['hěn duō','lots of'],'在':['zài','at, in, on'],'玩':['wán','to play'],
  '很':['hěn','very'],'快乐':['kuàilè','happy'],'谁':['shéi','who'],'什么':['shénme','what'],
  '吗':['ma','(yes/no question)'],'花果山':['Huāguǒ Shān','Flower Fruit Mountain'],'吧':['ba','(let’s…)'],'老':['lǎo','old'],'找':['zhǎo','to look for'],'这':['zhè','this'],'和':['hé','and']
};
const PUNCT = new Set(['！','。','，','？']);
const L = {
  hi:{t:['你好','！'],en:'Hello!'},
  iam:{t:['我','是','猴子','。','你','也','是','猴子','！'],en:'I am a monkey. You are a monkey too!'},
  go:{t:['去','看看','！'],en:'Go and take a look!'},
  hungry:{t:['我','饿','了','。','我','要','吃','桃子','！'],en:"I'm hungry. I want to eat a peach!"},
  thirsty:{t:['我','渴','了','。','我','要','喝','水','！'],en:"I'm thirsty. I want to drink some water!"},
  havePeach:{t:['你','有','桃子','吗','？'],en:'Do you have a peach?'},
  haveWater:{t:['你','有','水','吗','？'],en:'Do you have water?'},
  friends:{t:['谢谢','！','我们','是','朋友','！'],en:'Thank you! We are friends!'},
  thanks:{t:['谢谢','你','！'],en:'Thank you!'},
  river:{t:['河','里','有','水','。'],en:'There is water in the river.'},
  pond:{t:['水','里','有','鱼','。'],en:'There are fish in the water.'},
  play:{t:['我们','玩','吧','！'],en:"Let's play!"},
  weFriends:{t:['我们','是','朋友','！'],en:'We are friends!'},
  animals:{t:['草','里','有','动物','。','去','找','动物','吧','！'],en:'There are animals in the grass. Go and find them!'},
  findElder:{t:['你好','！','去','找','老','猴子','吧','！'],en:'Hello! Go and find the old monkey!'},
  notThis:{t:['这','是','苹果','。','我','要','吃','桃子','！'],en:'This is an apple. I want to eat a peach!'},
  notPeachYet:{t:['你','有','桃子','吗','？'],en:'Do you have a peach?'}
};
const STORY = [
  {t:['山','上','有','一个','大','石头','。'],en:'On the mountain there is a big stone.'},
  {t:['石头','里','有','一只','小','猴子','。'],en:'Inside the stone there is a little monkey.'},
  {t:['小','猴子','有','很多','朋友','。'],en:'The little monkey has lots of friends.'},
  {t:['猴子','吃','桃子','，','喝','水','。'],en:'Monkeys eat peaches and drink water.'},
  {t:['鸟','在','树','上','玩','。'],en:'Birds play in the trees.'},
  {t:['河','里','有','鱼','，','山','上','有','瀑布','。'],en:'There are fish in the river, and a waterfall on the mountain.'},
  {t:['小','猴子','很','快乐','！'],en:'The little monkey is very happy!'}
];
const CAPS = [
  {t:0,   zh:'很久很久以前……', py:'Hěn jiǔ hěn jiǔ yǐqián……', en:'Long, long ago…'},
  {t:2.8, zh:'海里有一座山，叫花果山。', py:'Hǎi lǐ yǒu yí zuò shān, jiào Huāguǒ Shān.', en:'In the sea stood a mountain called Flower Fruit Mountain.'},
  {t:5.4, zh:'山上有一个大石头。', py:'Shān shàng yǒu yí gè dà shítou.', en:'On top of the mountain sat a big stone.'},
  {t:7.2, zh:'石头动了！', py:'Shítou dòng le!', en:'The stone moved!'},
  {t:9.0, zh:'一只小猴子！', py:'Yì zhī xiǎo hóuzi!', en:'A little monkey!'},
  {t:10.6,zh:'它的眼睛里有光。', py:'Tā de yǎnjing lǐ yǒu guāng.', en:'Light shone from its eyes.'},
  {t:13.2,zh:'你好，小猴子！', py:'Nǐ hǎo, xiǎo hóuzi!', en:'Hello, little monkey!'}
];
const DAY = 86400000, INTERVALS = [1,3,7,21];

const MAP = [
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
];
const COLS = MAP[0].length, ROWS = MAP.length;
const NPCS = [
  {id:'elder',x:10,y:5,dir:'down',kind:'elder'},
  {id:'hungry',x:13,y:5,dir:'down',kind:'hungry'},
  {id:'thirsty',x:2,y:12,dir:'right',kind:'thirsty'},
  {id:'playful',x:11,y:12,dir:'down',kind:'playful'},
  {id:'bird',x:22,y:13,dir:'down',kind:'bird'}
];
const HOT = {'石头':[9,1],'山':[12,3],'路':[9,4],'花':[8,2],'草':[5,7],'树':[12,8],'桃子':[1,6],'苹果':[1,7],'河':[18,7],'鱼':[11,9],'洞':[3,3],'森林':[21,6],'瀑布':[18,1]};
const START = {x:9,y:2};
