// The screens gallery (tools/screens.html): every screen of the game, each in its own frame.
//
// Each screen is the real game (index.html) with a pretend save, a pretend browser storage (so your
// own saved game is never touched) and no sound. Once the game has loaded, the screen's run() is
// played inside it, using the game's own functions, to get to that screen. A few helpers are there
// for run(): wait(ms), click(selector), next() (A in the speech box), npc(id) (a character) and
// play() (Continue from the title screen).
//
// Add a screen whenever the game gets a new one. tests/screens.test.js checks that every game
// function a screen uses still exists.

// Pretend saves. Words are {lv, due, ok}: lv 1 Caught, 2 Recognised, 3 Read, 4 Used.
const knows = (lv, words) => Object.fromEntries(words.map(w => [w, {lv, due: 0, ok: 0}]));
const MIDDLE_WORDS = ['石头', '你好', '山', '花', '草', '树', '水果', '桃子', '苹果', '动物', '兔子', '水', '吃', '喝', '要', '我', '猴子', '老板', '河', '鱼', '头带'];
const QUIET = {sound: false, music: false};
const ALL_TIPS = {walk: 1, talk: 1, look: 1, tap: 1, grey: 1, english: 1, menu: 1, syllables: 1, eat: 1, hop: 1, run: 1};   // tips already had (js/tips.js; and the goat's about Chinese, the area's tips)
const SAVES = {
  // just born, with the old monkey waiting: no tips had yet
  born: {version: 19, started: true, tips: {}, ...QUIET, w: knows(1, ['石头']), pos: {x: 9, y: 2, dir: 'up'}},
  // halfway through Flower Fruit Mountain, holding a peach for the hungry monkey
  middle: {version: 19, started: true, tips: ALL_TIPS, ...QUIET, shells: 6, w: knows(1, MIDDLE_WORDS),
    met: ['rabbit'], friends: ['rabbit'], pos: {x: 13, y: 6, dir: 'up'},
    wardrobe: {owned: ['头带'], wearing: []},
    areas: {1: {elder: 2, hungry: 'asked', thirsty: 'asked', flowers: 'not asked', holding: {hungry: '桃子'}, gate: true, story: false, homeName: 2}}},
};
SAVES.knowsWell = {...SAVES.middle, w: knows(2, MIDDLE_WORDS)};
SAVES.meadowTasks = {...SAVES.middle, areas: {1: {...SAVES.middle.areas[1], gate: false}}};   // (the rocks still there: every task in the meadow at once)
// the little monkey once it's taught you 朋友, and the hungry monkey once you've told him 没关系, each wanting to play a word
// game (decided 26 October 2026), with a present the first time you win: in the meadow, never played yet (each has a !)
SAVES.littleGame = {...SAVES.meadowTasks, w: {...SAVES.meadowTasks.w, ...knows(1, ['朋友'])}, pos: {place: 'meadow', x: 15, y: 19, dir: 'down'}};
SAVES.hungryGame = {...SAVES.littleGame, w: {...SAVES.littleGame.w, ...knows(1, ['没关系'])}, areas: {1: {...SAVES.meadowTasks.areas[1], hungry: 'done', holding: {}}},
  pos: {place: 'meadow', x: 13, y: 6, dir: 'up'}};
SAVES.phrases = {...SAVES.middle, w: {...SAVES.middle.w, ...knows(1, ['谢谢', '不客气', '再见', '对不起', '没关系', '松鼠'])}};   // the phrases you reply with, all caught
// two words of the four the old monkey wants: he says to go and learn some more, in a conversation of one line (Done)
SAVES.notYet = {...SAVES.born, tips: ALL_TIPS, w: knows(1, ['石头', '你好', '山']), areas: {1: {elder: 1}}, pos: {x: 7, y: 2, dir: 'up'}};
// just sent off by the old monkey to learn your first 4 words, below him by your stone (the task seen)
SAVES.firstWords = {...SAVES.born, tips: ALL_TIPS, w: knows(1, ['石头', '你好']), areas: {1: {elder: 1}}, tasksSeen: {learn4: 1}, pos: {x: 9, y: 3, dir: 'down'}};
// facing the hungry monkey, who hasn't asked for anything yet
SAVES.hungryAsks = {...SAVES.middle, areas: {1: {elder: 2, hungry: 'not asked', thirsty: 'not asked', flowers: 'not asked', holding: {}, gate: false}}, pos: {place: 'meadow', x: 13, y: 6, dir: 'up'}};
SAVES.bigHello = {...SAVES.hungryAsks, pos: {place: 'meadow', x: 4, y: 10, dir: 'right'}};   // facing the big monkey, in the middle meadow
SAVES.bigIam = {...SAVES.bigHello, w: knows(1, MIDDLE_WORDS.filter(w => w !== '我'))};   // the same, before he has told you who he is
// facing the hungry monkey, who hasn't asked for anything yet, and you don't know 水果 (fruit) or 吃 (eat)
SAVES.hungryNew = {...SAVES.hungryAsks, w: knows(1, MIDDLE_WORDS.filter(w => !['水果', '吃', '桃子', '苹果'].includes(w)))};
// the old monkey has told you about animals, and wants the meadow's words too: you know 山 and 树, not 河, 鱼 or 鸟; the
// thirsty monkey has asked for water, and you're facing the river
SAVES.meadowWords = {...SAVES.middle, w: knows(1, ['石头', '你好', '山', '花', '草', '树', '动物', '吃', '喝']), met: [], friends: [],
  areas: {1: {elder: 2, hungry: 'asked', thirsty: 'asked', flowers: 'not asked', holding: {}, gate: false}}, pos: {place: 'meadow', x: 17, y: 10, dir: 'right'}};
// all five words for the meadow learned, facing the old monkey: he wants to hear them (30 October 2026)
SAVES.meadowCheck = {...SAVES.meadowWords, w: knows(1, ['石头', '你好', '山', '花', '草', '树', '动物', '吃', '喝', '河', '鱼', '鸟', '水', '要']),
  areas: {1: {...SAVES.meadowWords.areas[1], hungry: 'done', thirsty: 'done'}}, pos: {place: 'meadow', x: 7, y: 2, dir: 'up'}};
SAVES.thirstyGame = {...SAVES.meadowCheck, pos: {place: 'meadow', x: 2, y: 11, dir: 'down'}};   // facing the thirsty monkey, water given
SAVES.lowTalk = {...SAVES.middle, areas: {1: {...SAVES.middle.areas[1], gate: false}}, pos: {place: 'meadow', x: 15, y: 19, dir: 'down'}};   // on the path at the bottom of the meadow, facing the little monkey (before the gate, it's there)   // every word Recognised: animals ask you to read
// chapter 1 has begun: the prologue is done (your home's name read on the sign too), and the troop is at the waterfall;
// you're beside the old monkey
const PROLOGUE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 3, story: true, bought: ['头带'], cave: 0, homeName: 2};
SAVES.chapter1 = {...SAVES.middle, w: knows(1, [...MIDDLE_WORDS, '瀑布', '羊', '松鼠', '山羊', '朋友']), met: ['rabbit', 'sheep', 'squirrel', 'goat'],
  wardrobe: {owned: ['头带'], wearing: ['头带']}, areas: {1: PROLOGUE}, pos: {place: 'falls', x: 8, y: 1, dir: 'right'}};
SAVES.dared = {...SAVES.chapter1, w: {...SAVES.chapter1.w, ...knows(1, ['跳'])}, areas: {1: {...PROLOGUE, cave: 1}}, pos: {place: 'falls', x: 5, y: 1, dir: 'left'}};
SAVES.inCave = {...SAVES.dared, w: {...SAVES.dared.w, ...knows(1, ['洞'])}, areas: {1: {...PROLOGUE, cave: 2}}, pos: {place: 'cave', x: 7, y: 9, dir: 'up'}};
SAVES.explored = {...SAVES.inCave, w: {...SAVES.inCave.w, ...knows(1, ['床', '碗', '桌子'])}, pos: {place: 'falls', x: 8, y: 1, dir: 'right'}};
// part B: the troop has followed you in (cave 4), you're king (cave 6), and the troop is counted in
const CAVE_WORDS = knows(1, ['洞', '跳', '床', '碗', '桌子']);
SAVES.ledIn = {...SAVES.explored, w: {...SAVES.chapter1.w, ...CAVE_WORDS}, areas: {1: {...PROLOGUE, cave: 4}}, pos: {place: 'cave', x: 6, y: 10, dir: 'up'}};
SAVES.toBeKing = {...SAVES.ledIn, w: {...SAVES.ledIn.w, ...knows(1, ['家'])}, areas: {1: {...PROLOGUE, cave: 5}}, pos: {place: 'cave', x: 9, y: 9, dir: 'up'}};
SAVES.king = {...SAVES.toBeKing, w: {...SAVES.toBeKing.w, ...knows(1, ['王', '一'])}, areas: {1: {...PROLOGUE, cave: 6, count: 1}}, pos: {place: 'cave', x: 6, y: 10, dir: 'up'}};
SAVES.home = {...SAVES.king, w: {...SAVES.king.w, ...knows(1, ['二', '三'])}, areas: {1: {...PROLOGUE, cave: 6, count: 3}}, pos: {place: 'cave', x: 7, y: 12, dir: 'up'}};
// chapter 1: the troop's home ground beside the waterfall (version 29: climb 4 is the troop up at the waterfall)
SAVES.chapterOne = {...SAVES.home, version: 29, areas: {1: {...PROLOGUE, climb: 4, boar: 1, cave: 6, count: 3, chapter: 1, home: 0}}, pos: {place: 'cave', x: 6, y: 10, dir: 'up'}};
SAVES.toHomeGround = {...SAVES.chapterOne, areas: {1: {...SAVES.chapterOne.areas[1], home: 1}}, following: ['elder'], pos: {place: 'falls', x: 12, y: 2, dir: 'right'}};
SAVES.homeGround = {...SAVES.chapterOne, areas: {1: {...SAVES.chapterOne.areas[1], home: 2}}, pos: {place: 'homeGround', x: 3, y: 9, dir: 'right'}};
// building the school: the big monkey wants wood and small stones, from the pine wood (part-way through: two dead pines down,
// a stone picked up, and the cracked rock broken); then the school's frame goes up
SAVES.bigAsks = {...SAVES.homeGround, pos: {place: 'homeGround', x: 15, y: 5, dir: 'up'}};
const BUILDING = {...SAVES.homeGround.areas[1], build: 1, wood: 'asked', stones: 'asked', woodIn: 1};   // (been into the pine wood before)
SAVES.pineWood = {...SAVES.homeGround, areas: {1: BUILDING}, pos: {place: 'pineWood', x: 16, y: 26, dir: 'up'}};   // (in at the bottom)
SAVES.pineMeadow = {...SAVES.pineWood, pos: {place: 'pineWood', x: 15, y: 17, dir: 'up'}};   // in the long grass below the bridge
SAVES.pineKnowsWell = {...SAVES.pineWood, w: Object.fromEntries(Object.entries(SAVES.pineWood.w).map(([w, r]) => [w, {...r, lv: 2}]))};   // words recognised: reading questions
SAVES.pineFirst = {...SAVES.homeGround, areas: {1: {...BUILDING, woodIn: 0}}, pos: {place: 'hillside', x: 12, y: 1, dir: 'up'}};   // about to go in for the first time, at the top of the hillside
// the hillside, between the home ground and the pine wood: at the foot, by the brook's stepping stones; in the middle, at the
// lookout; and at the top, under the first pines, by the archway into the wood
SAVES.hillside = {...SAVES.pineWood, pos: {place: 'hillside', x: 19, y: 37, dir: 'up'}};
SAVES.hillsideLookout = {...SAVES.pineWood, areas: {1: {...BUILDING, lookTip: 1}}, pos: {place: 'hillside', x: 21, y: 21, dir: 'down'}};   // (the goat has told you)
SAVES.hillsideGoat = {...SAVES.pineWood, pos: {place: 'hillside', x: 19, y: 22, dir: 'up'}};   // coming up the steps by the lookout, the first time
SAVES.hillsideTop = {...SAVES.pineWood, pos: {place: 'hillside', x: 12, y: 5, dir: 'up'}};
SAVES.byMushrooms = {...SAVES.pineWood, pos: {place: 'hillside', x: 12, y: 4, dir: 'left'}};   // beside the little monkey looking for mushrooms (28 October 2026)
SAVES.byTrainee = {...SAVES.pineWood, pos: {place: 'hillside', x: 17, y: 38, dir: 'right'}};   // coming up to the stepping stones, a little monkey in training beyond them
SAVES.traineeDone = {...SAVES.pineWood, areas: {1: {...BUILDING, trainee1: 2, trainee2: 2}}, pos: {place: 'hillside', x: 19, y: 37, dir: 'right'}};   // beside the first, its present won
SAVES.bagFull = {...SAVES.pineWood, bag: {'桃子': 3}, areas: {1: {...BUILDING, trainee1: 1, trainee2: 1}}, pos: {place: 'hillside', x: 10, y: 20, dir: 'left'}};   // a full bag of peaches, by the other one, on the middle terrace
SAVES.byHidden = {...SAVES.pineWood, areas: {1: {...BUILDING, trainee1: 1, trainee2: 1}}, pos: {place: 'hillside', x: 22, y: 38, dir: 'down'}};   // above the tree with shells tucked behind it
// below the little monkeys building a tower of stones, at the home ground just past the way up to the hillside: the first
// time, knowing just 一, 二 and 三; and later, knowing the numbers to six from school (to count with them)
SAVES.byTower = {...SAVES.pineWood, areas: {1: {...BUILDING, trainee1: 1, trainee2: 1}}, pos: {place: 'homeGround', x: 27, y: 9, dir: 'up'}};
SAVES.hillsideFoot = {...SAVES.byTower, pos: {place: 'hillside', x: 6, y: 33, dir: 'up'}};   // at the foot of the hillside's cliff, by its stone steps
// by the brook at the foot of the hillside: on the path above the little monkey chasing a dragonfly, and on the bank above
// the two splashing in the water
SAVES.byBrook = {...SAVES.byTower, pos: {place: 'hillside', x: 10, y: 34, dir: 'down'}};
SAVES.bySplashers = {...SAVES.byTower, pos: {place: 'hillside', x: 4, y: 36, dir: 'down'}};
// at the home ground, east of the way down to the bridge, beside the little monkeys grooming each other under a tree
SAVES.byGroomers = {...SAVES.byTower, pos: {place: 'homeGround', x: 18, y: 17, dir: 'right'}};
SAVES.towerCounts = {...SAVES.byTower, w: {...SAVES.byTower.w, ...knows(2, ['一', '三', '四', '五', '六'])}, areas: {1: {...BUILDING, trainee1: 1, trainee2: 1, tower: 1}}};
SAVES.pineDeer = {...SAVES.pineWood, areas: {1: {...BUILDING, changed: {'pineWood:23,5': 'y'}}}, pos: {place: 'pineWood', x: 29, y: 3, dir: 'right'}};   // in the glade, by the deer
SAVES.pineWoodLater = {...SAVES.homeGround, w: {...SAVES.homeGround.w, ...knows(1, ['木头'])},
  areas: {1: {...BUILDING, picked: {wood: ['pineWood:2,18', 'pineWood:2,2'], stones: ['pineWood:3,12']},
    changed: {'pineWood:2,18': 'j', 'pineWood:2,2': 'j', 'pineWood:3,12': 'i', 'pineWood:23,5': 'y'}}}, pos: {place: 'pineWood', x: 22, y: 5, dir: 'right'}};
SAVES.schoolFrame = {...SAVES.pineWoodLater, areas: {1: {...SAVES.pineWoodLater.areas[1], build: 2, wood: 'done', stones: 'done', picked: {}}},
  pos: {place: 'homeGround', x: 12, y: 6, dir: 'up'}};
// the school: built, then inside it (the class has met its teacher)
SAVES.schoolBuilt = {...SAVES.schoolFrame, w: {...SAVES.schoolFrame.w, ...knows(1, ['学校'])}, areas: {1: {...SAVES.schoolFrame.areas[1], school: 1}},
  pos: {place: 'homeGround', x: 11, y: 6, dir: 'up'}};
SAVES.classroom = {...SAVES.schoolBuilt, w: {...SAVES.schoolBuilt.w, ...knows(1, ['老师'])}, areas: {1: {...SAVES.schoolBuilt.areas[1], school: 2}},
  pos: {place: 'school', x: 7, y: 8, dir: 'up'}};
// number lessons: by the teacher, the first lesson (四 五 六, one after another); and later, knowing the numbers to six
SAVES.numbersNew = {...SAVES.classroom, w: {...SAVES.classroom.w, ...knows(1, ['一', '二', '三', '同学', '碗', '兔子'])}, pos: {place: 'school', x: 7, y: 3, dir: 'up'}};
SAVES.numbersLater = {...SAVES.numbersNew, w: {...SAVES.numbersNew.w, ...knows(2, ['四', '五', '六'])}};
SAVES.numbersTen = {...SAVES.numbersLater, w: {...SAVES.numbersLater.w, ...knows(2, ['七', '八', '九', '鸟']), ...knows(1, ['十'])}};
// colour lessons: by the teacher, knowing the numbers to ten and no colours yet, so the first lesson is 红色 黄色 白色 (red
// paints the lanterns); knowing red, then red, yellow and white, just learning 黑色; then knowing it; and the school on the
// home ground with its lanterns red (and nothing else painted: decided 24 October 2026), then knowing every colour
SAVES.coloursNew = {...SAVES.numbersNew, w: {...SAVES.numbersNew.w, ...knows(2, ['四', '五', '六', '七', '八', '九', '十'])}};
SAVES.coloursRed = {...SAVES.coloursNew, w: {...SAVES.coloursNew.w, ...knows(2, ['红色'])}};
SAVES.coloursThree = {...SAVES.coloursNew, w: {...SAVES.coloursNew.w, ...knows(2, ['红色', '黄色', '白色'])}};
SAVES.coloursLater = {...SAVES.coloursThree, w: {...SAVES.coloursThree.w, ...knows(2, ['黑色'])}};
// after a lesson that taught a new word (黑色, right twice), the next waits till you've answered 8 more questions
// (lessonGap): you've answered 3 (with the feast's news heard, so he goes straight to the lesson; the save's question count is 0 once it's brought
// up to date, so the lesson ended at -3)
SAVES.lessonWait = {...SAVES.coloursLater, w: {...SAVES.coloursLater.w, ...knows(1, ['有', '没有']), '黑色': {lv: 2, due: 0, ok: 2}}, areas: {1: {...SAVES.coloursLater.areas[1], feast: 3, lastLesson: 'colours', lessonTurn: -3, lessonWait: 1}}};
// PE (体育, 28 October 2026): the first two lessons done (numbers to ten, and red, yellow and white), so PE is on the
// timetable, ready, and the gap in the trees to the sports ground is open; then knowing 跑, so you can run
SAVES.peNew = {...SAVES.coloursThree, areas: {1: {...SAVES.coloursThree.areas[1], feast: 3, lastLesson: 'colours'}}};
SAVES.peRun = {...SAVES.peNew, w: {...SAVES.peNew.w, '跑': {lv: 2, due: 0, ok: 2}}, areas: {1: {...SAVES.peNew.areas[1], lastLesson: 'pe', lessonTurn: -8}}, pos: {place: 'homeGround', x: 2, y: 2, dir: 'left'}};
SAVES.schoolHalf = {...SAVES.coloursThree, w: {...SAVES.coloursThree.w, ...knows(2, ['黑色', '蓝色', '绿色'])}, pos: {place: 'homeGround', x: 11, y: 6, dir: 'up'}};
SAVES.schoolPainted = {...SAVES.schoolHalf, w: {...SAVES.schoolHalf.w, ...knows(2, ['棕色', '橙色', '粉色'])}};
// flowers for the school (version 30: they're chapter 1's): the big monkey asks for them once you know red, yellow and white,
// from the first colour lesson (a side quest, decided 24 October 2026); picking them at the top of the home ground; bringing
// them to him; and planted in front of the school
SAVES.flowersAsk = {...SAVES.coloursThree, pos: {place: 'homeGround', x: 15, y: 5, dir: 'up'}};
SAVES.byLanterns = {...SAVES.schoolHalf, pos: {place: 'homeGround', x: 8, y: 5, dir: 'up'}};   // below the school's left corner, where a lantern hangs
SAVES.flowersPicking = {...SAVES.schoolPainted, version: 30, areas: {1: {...SAVES.schoolPainted.areas[1], flowers: 'asked'}}, pos: {place: 'homeGround', x: 26, y: 3, dir: 'up'}};
SAVES.flowersBack = {...SAVES.flowersPicking, areas: {1: {...SAVES.flowersPicking.areas[1], holding: {flowers: '花'}, picked: {flowers: ['红色', '黄色', '白色']}}},
  pos: {place: 'homeGround', x: 15, y: 5, dir: 'up'}};
SAVES.flowersPlanted = {...SAVES.flowersPicking, areas: {1: {...SAVES.flowersPicking.areas[1], flowers: 'done', schoolFlowers: true, shop: 3}}, pos: {place: 'homeGround', x: 11, y: 7, dir: 'up'}};   // (the 老板's shop built: below)
// looking at flowers, each square all one colour (26 October 2026): a red one, its colour known; at the hillside's slope of
// flowers; and a blue one on the riverside, before you know blue
SAVES.flowerLook = {...SAVES.flowersPlanted, pos: {place: 'homeGround', x: 26, y: 3, dir: 'up'}};
SAVES.hillsideFlowers = {...SAVES.flowersPlanted, pos: {place: 'hillside', x: 12, y: 34, dir: 'up'}};
// the feast: the old monkey's news at school, once the first two lessons are done (四 五 六, 红色 黄色 白色); and the big table
// at the home ground, under the big tree, being set up as you watch, then set up, with the hungry monkey beside it
SAVES.feastNews = {...SAVES.coloursThree};
SAVES.feastTable = {...SAVES.coloursThree, w: {...SAVES.coloursThree.w, ...knows(1, ['有']), ...knows(2, ['没关系'])}, areas: {1: {...SAVES.coloursThree.areas[1], feast: 2}},
  pos: {place: 'homeGround', x: 17, y: 9, dir: 'up'}};
// the hungry monkey by the table (his ! for what the feast still needs); and the feast's list, once he's told you: no honey
SAVES.feastHungry = {...SAVES.feastTable, pos: {place: 'homeGround', x: 19, y: 8, dir: 'up'}};
SAVES.feastList = {...SAVES.feastTable, w: {...SAVES.feastTable.w, ...knows(1, ['没有', '筷子'])}, areas: {1: {...SAVES.feastTable.areas[1], feast: 3}},
  pos: {place: 'homeGround', x: 17, y: 8, dir: 'up'}};
// the feast's tables set out bare (27 October 2026): the hungry monkey wants bowls, from the cave; taking them there; and
// bringing them back, and the big monkey's chopsticks
SAVES.tablesBare = {...SAVES.feastTable, areas: {1: {...SAVES.feastTable.areas[1], tableware: 0, bowls: 'not asked'}}, pos: {place: 'homeGround', x: 19, y: 8, dir: 'up'}};
SAVES.bowlsCave = {...SAVES.tablesBare, areas: {1: {...SAVES.tablesBare.areas[1], bowls: 'asked'}}, tasksSeen: {bowls: 1}, pos: {place: 'cave', x: 9, y: 4, dir: 'up'}};
SAVES.bowlsBack = {...SAVES.tablesBare, areas: {1: {...SAVES.tablesBare.areas[1], bowls: 'asked', holding: {bowls: '碗'}}}, tasksSeen: {bowls: 1, bowlsBack: 1}};
SAVES.bowlsOn = {...SAVES.tablesBare, areas: {1: {...SAVES.tablesBare.areas[1], bowls: 'done', tableware: 1, flowers: 'done', schoolFlowers: true, shop: 3}}, tasksSeen: {bowls: 1, bowlsBack: 1, chopsticks: 1},
  pos: {place: 'homeGround', x: 15, y: 5, dir: 'up'}};   // facing the big monkey, with the bowls on the tables
// hide and seek with a little monkey at the home ground: facing it; while it hides under the table (after two wrong
// guesses, its tail pokes out)
SAVES.hideSeek = {...SAVES.feastList, w: {...SAVES.feastList.w, ...knows(1, ['树', '水', '花', '桥', '桌子'])}, pos: {place: 'homeGround', x: 13, y: 9, dir: 'up'}};
const hidingIn = (spot, wrong) => ({...SAVES.hideSeek.areas[1], hide: {spot, wrong, won: 0, last: spot}});
SAVES.hiding = {...SAVES.hideSeek, areas: {1: hidingIn('table', 0)}, pos: {place: 'homeGround', x: 13, y: 9, dir: 'right'}};
SAVES.hideTail = {...SAVES.hideSeek, areas: {1: hidingIn('table', 2)}, pos: {place: 'homeGround', x: 14, y: 9, dir: 'up'}};
SAVES.hideNotHere = {...SAVES.hideSeek, areas: {1: hidingIn('table', 0)}, pos: {place: 'homeGround', x: 17, y: 15, dir: 'right'}};   // looking in the pool
SAVES.hideFind = {...SAVES.hideSeek, areas: {1: hidingIn('table', 1)}, pos: {place: 'homeGround', x: 17, y: 8, dir: 'up'}};
// the bees (25 October 2026): the hungry monkey sends you east (a game that heard what the feast needs before the bees
// came, with his !); the way east, cleared; the riverside, along the stream; beside the butterfly over its wildflowers; and
// at its end, where thick bushes block the way into the bees' valley for now
SAVES.feastHungryBees = {...SAVES.feastList, pos: {place: 'homeGround', x: 19, y: 8, dir: 'up'}};
SAVES.wayEast = {...SAVES.feastList, areas: {1: {...SAVES.feastList.areas[1], bees: 1}}, tasksSeen: {...SAVES.feastList.tasksSeen, bees1: 1}, pos: {place: 'homeGround', x: 28, y: 9, dir: 'right'}};   // (its task seen: no message)
SAVES.riverside = {...SAVES.wayEast, pos: {place: 'riverside', x: 15, y: 5, dir: 'right'}};
SAVES.butterfly = {...SAVES.wayEast, pos: {place: 'riverside', x: 18, y: 5, dir: 'up'}};
SAVES.riverEnd = {...SAVES.wayEast, pos: {place: 'riverside', x: 46, y: 7, dir: 'right'}};
SAVES.riverFlower = {...SAVES.wayEast, pos: {place: 'riverside', x: 24, y: 6, dir: 'up'}};   // facing a blue flower (blue not known yet)
// the bees' valley (25 October 2026): coming in from the riverside, the first time and after; a wasp jumping out of the tall
// flowers (its first meeting, then a battle among the flowers); and the swarm in front of the queen's old hollow tree
SAVES.beeValley = {...SAVES.wayEast, w: {...SAVES.wayEast.w, ...knows(1, ['蝴蝶'])}, areas: {1: {...SAVES.wayEast.areas[1], bees: 2}}, pos: {place: 'flowerValley', x: 2, y: 10, dir: 'right'}};
SAVES.beeValleyFirst = {...SAVES.beeValley, areas: {1: {...SAVES.beeValley.areas[1], bees: 1}}, pos: {place: 'riverside', x: 46, y: 7, dir: 'right'}};
SAVES.beeValleyWasp = {...SAVES.beeValley, pos: {place: 'flowerValley', x: 6, y: 10, dir: 'right'}};
SAVES.beeValleyWaspKnown = {...SAVES.beeValleyWasp, w: {...SAVES.beeValley.w, ...knows(1, ['黄蜂'])}};
SAVES.beeValleySwarm = {...SAVES.beeValley, pos: {place: 'flowerValley', x: 25, y: 8, dir: 'up'}};
// the bees hiding in the tall flowers (25 October 2026): the flowers shaking where one hides; two bee friends made, and the
// third one counted; all six, the sixth sending you to find the queen; and the swarm flown aside
SAVES.beeHiding = {...SAVES.beeValley, pos: {place: 'flowerValley', x: 11, y: 13, dir: 'right'}};
SAVES.beeFriends = {...SAVES.beeValley, w: {...SAVES.beeValley.w, ...knows(1, ['蜜蜂'])}, friends: [...(SAVES.beeValley.friends || []), 'bee'], met: [...(SAVES.beeValley.met || []), 'bee'],
  areas: {1: {...SAVES.beeValley.areas[1], beeFriends: 2}}, pos: {place: 'flowerValley', x: 14, y: 11, dir: 'right'}};
// each bee you meet stays out, hovering where it came out (26 October 2026): two friends, and one you didn't win over,
// waiting with a !; and all six, about to fly off to join the swarm
SAVES.beesOut = {...SAVES.beeFriends, areas: {1: {...SAVES.beeFriends.areas[1], out: {bee: [[16, 11, 1], [12, 13, 1], [18, 12, 0]]}}}};
SAVES.beeSix = {...SAVES.beeFriends, areas: {1: {...SAVES.beeFriends.areas[1], beeFriends: 6, out: {bee: [[16, 11, 1], [12, 13, 1], [18, 12, 1], [15, 9, 1], [11, 10, 1], [19, 10, 1]]}}}};
SAVES.beeOpen = {...SAVES.beeFriends, areas: {1: {...SAVES.beeFriends.areas[1], beeFriends: 6, bees: 3}}, pos: {place: 'flowerValley', x: 25, y: 9, dir: 'up'}};
// the queen bee (25 October 2026): in front of her old tree, where A brings her out; out, waiting for you to play her word
// game; won over, she and her swarm following you along the riverside; coming home with you; and home, by the wildflowers
// at the home ground, south of the road, knowing 鸟 (bird) and the colours: the birds that land are coloured
SAVES.birdWatch = {...SAVES.wayEast, w: {...SAVES.wayEast.w, ...knows(1, ['鸟', '红色', '黄色', '白色', '黑色', '棕色', '绿色'])}, pos: {place: 'homeGround', x: 11, y: 13, dir: 'right'}};
SAVES.queenTree = {...SAVES.beeOpen, tasksSeen: {...SAVES.beeOpen.tasksSeen, bees2: 1, bees3: 1}, pos: {place: 'flowerValley', x: 26, y: 6, dir: 'up'}};
SAVES.queenOut = {...SAVES.queenTree, w: {...SAVES.queenTree.w, ...knows(1, ['蜂王'])}, areas: {1: {...SAVES.queenTree.areas[1], bees: 4, queenOut: true}},
  tasksSeen: {...SAVES.queenTree.tasksSeen, bees4: 1}, pos: {place: 'flowerValley', x: 25, y: 6, dir: 'up'}};
SAVES.beesFollow = {...SAVES.queenOut, friends: [...SAVES.queenOut.friends, 'queen'], areas: {1: {...SAVES.queenOut.areas[1], bees: 5}}, following: ['queen', 'beeSwarm'],
  tasksSeen: {...SAVES.queenOut.tasksSeen, bees5: 1}, pos: {place: 'riverside', x: 36, y: 7, dir: 'left'}};
SAVES.beesComing = {...SAVES.beesFollow, pos: {place: 'riverside', x: 1, y: 7, dir: 'left'}};
SAVES.beesHome = {...SAVES.beesFollow, areas: {1: {...SAVES.beesFollow.areas[1], bees: 6}}, following: [], tasksSeen: {...SAVES.beesFollow.tasksSeen, bees6: 1},
  pos: {place: 'homeGround', x: 20, y: 7, dir: 'left'}};
// the bees' hive (25 October 2026): coming up to the bees by the wildflowers, as the troop builds it; the hive, its honey
// for the hungry monkey; the honey in the feast's bowl; and honey in your bag
SAVES.hiveSoon = {...SAVES.beesHome, areas: {1: {...SAVES.beesHome.areas[1], bees: 7}}, tasksSeen: {...SAVES.beesHome.tasksSeen, bees7: 1}, pos: {place: 'homeGround', x: 27, y: 7, dir: 'up'}};
SAVES.hive = {...SAVES.hiveSoon, areas: {1: {...SAVES.hiveSoon.areas[1], bees: 10, honey: 'asked'}}, tasksSeen: {...SAVES.hiveSoon.tasksSeen, honey1: 1}, pos: {place: 'homeGround', x: 28, y: 5, dir: 'up'}};
SAVES.honeyHeld = {...SAVES.hive, w: {...SAVES.hive.w, ...knows(1, ['蜂蜜'])}, areas: {1: {...SAVES.hive.areas[1], holding: {honey: '蜂蜜'}}}, tasksSeen: {...SAVES.hive.tasksSeen, honey2: 1},
  pos: {place: 'homeGround', x: 20, y: 7, dir: 'left'}};
SAVES.honeyIn = {...SAVES.honeyHeld, areas: {1: {...SAVES.hive.areas[1], bees: 11, honey: 'done'}}, bag: {'蜂蜜': 2}, pos: {place: 'homeGround', x: 17, y: 8, dir: 'up'}};
// the cow (26 October 2026, its first part): the thirsty monkey's news, by the road at the home ground; the way south,
// cleared; into the pasture for the first time (a cow moos, beyond the pines); the pasture, out between the rocks; and the
// cow, found by its spring
SAVES.cowNews = {...SAVES.honeyIn, pos: {place: 'homeGround', x: 21, y: 10, dir: 'down'}};   // facing the thirsty monkey, by the road
SAVES.waySouth = {...SAVES.honeyIn, areas: {1: {...SAVES.honeyIn.areas[1], cow: 1}}, tasksSeen: {...SAVES.honeyIn.tasksSeen, cow1: 1}, pos: {place: 'homeGround', x: 16, y: 19, dir: 'down'}};   // (its task seen: no message)
SAVES.pastureIn = {...SAVES.waySouth, pos: {place: 'homeGround', x: 16, y: 20, dir: 'down'}};   // just before the way in
// the south slope (27 October 2026): at the top; on its lookout, facing the railing; and by its goat
SAVES.slopeTop = {...SAVES.waySouth, tasksSeen: {...SAVES.waySouth.tasksSeen, cowLook: 1}, pos: {place: 'southSlope', x: 12, y: 3, dir: 'down'}};
SAVES.slopeLookout = {...SAVES.slopeTop, pos: {place: 'southSlope', x: 6, y: 16, dir: 'down'}};
SAVES.slopeSteps = {...SAVES.slopeTop, areas: {1: {...SAVES.slopeTop.areas[1], cowSeen: 1}}, tasksSeen: {...SAVES.slopeTop.tasksSeen, cow1: 2}, pos: {place: 'southSlope', x: 21, y: 21, dir: 'left'}};
// at the brook's stepping stones (28 October 2026), facing the first row, and with the hop tip not yet seen
SAVES.slopeBrook = {...SAVES.slopeSteps, pos: {place: 'southSlope', x: 13, y: 22, dir: 'down'}};
SAVES.slopeBrookTip = {...SAVES.slopeBrook, tips: {...ALL_TIPS, hop: 0}};
// friends in the grass (30 October 2026): a friend you've made hides in the tall grass of the places it roams too
const befriend = (save, ids, words) => ({...save, met: [...new Set([...(save.met || []), ...ids])], friends: [...new Set([...(save.friends || []), ...ids])], w: {...save.w, ...knows(2, words)}});
SAVES.pathFriends = {...befriend(SAVES.homeGround, ['sheep', 'squirrel', 'goat'], ['动物', '羊', '松鼠', '山羊']), pos: {place: 'path', x: 4, y: 3, dir: 'up'}};   // by the peach tree's clearing
SAVES.slopeFriends = {...befriend(SAVES.slopeBrook, ['deer', 'fox'], ['鹿', '狐狸']), pos: {place: 'southSlope', x: 10, y: 21, dir: 'left'}};   // in the tall grass by the peach tree, above the brook
SAVES.friendsChapter1 = {...befriend(SAVES.beeFriends, ['rabbit', 'sheep', 'squirrel', 'goat', 'deer'], ['兔子', '羊', '松鼠', '山羊', '鹿', '狐狸']), met: [...new Set([...(SAVES.beeFriends.met || []), 'rabbit', 'sheep', 'squirrel', 'goat', 'deer', 'fox'])]};
SAVES.pineFriends = {...befriend(SAVES.pineWood, ['squirrel'], ['松鼠']), pos: {place: 'pineWood', x: 5, y: 4, dir: 'up'}};   // in the clearing by the old stump
SAVES.pasture = {...SAVES.waySouth, areas: {1: {...SAVES.waySouth.areas[1], cow: 2, cowSeen: 1}}, pos: {place: 'pasture', x: 24, y: 16, dir: 'right'}};   // on the cow's trail
// the dark pines (27 October 2026), between the south slope and the pasture: where the way forks, the cow's hoofprints;
// the top of the gully, where a great hollow pine lies along it; the stream, and the dead pine on its bank; over it, the
// rabbit by the way
SAVES.pastureFork = {...SAVES.pasture, pos: {place: 'darkPines', x: 20, y: 4, dir: 'right'}};   // just before the first hoofprints
SAVES.pinesOwl = {...SAVES.pasture, pos: {place: 'darkPines', x: 13, y: 3, dir: 'left'}};   // just inside the dark pines, the owl on its dead pine nearby (28 October 2026)
SAVES.pinesLog = {...SAVES.pasture, areas: {1: {...SAVES.pasture.areas[1], pastureTracks: 1}}, pos: {place: 'darkPines', x: 28, y: 4, dir: 'down'}};   // at the top of the gully
SAVES.pinesInLog = {...SAVES.pinesLog, areas: {1: {...SAVES.pinesLog.areas[1], logSeen: 1}}, pos: {place: 'darkPines', x: 28, y: 9, dir: 'down'}};   // crawling through the hollow pine
SAVES.pastureStream = {...SAVES.pasture, areas: {1: {...SAVES.pasture.areas[1], pastureTracks: 1, logSeen: 1, streamSeen: 1}}, tasksSeen: {...SAVES.pasture.tasksSeen, cowStream: 9},
  pos: {place: 'darkPines', x: 23, y: 17, dir: 'right'}};   // facing the dead pine
SAVES.pastureRabbit = {...SAVES.pastureStream, areas: {1: {...SAVES.pastureStream.areas[1], pastureLog: 1}}, pos: {place: 'darkPines', x: 20, y: 22, dir: 'down'}};   // facing the rabbit, over the stream
SAVES.cowMeet = {...SAVES.pasture, pos: {place: 'pasture', x: 31, y: 17, dir: 'down'}};   // facing the cow, by its spring
SAVES.cowFound = {...SAVES.cowMeet, w: {...SAVES.cowMeet.w, ...knows(1, ['牛'])}, areas: {1: {...SAVES.cowMeet.areas[1], cow: 3}}};
// version 2: won over, the cow follows you home; the wolf at the rocks; the cow running back after a lost battle; and home
SAVES.cowFollow = {...SAVES.cowFound, friends: [...SAVES.cowFound.friends, 'cow'], following: ['cow'], areas: {1: {...SAVES.cowFound.areas[1], cow: 4}},
  tasksSeen: {...SAVES.cowFound.tasksSeen, cow3: 1, cow4: 1}, pos: {place: 'pasture', x: 26, y: 17, dir: 'left'}};   // on the cow's trail, by its spring
SAVES.cowGap = {...SAVES.cowFollow, w: {...SAVES.cowFollow.w, ...knows(1, ['狼'])}, pos: {place: 'pasture', x: 21, y: 15, dir: 'up'}};   // just below the gap between the rocks (knowing 狼, from the pine wood)
SAVES.cowRan = {...SAVES.cowFollow, pos: {place: 'homeGround', x: 17, y: 8, dir: 'up'}};   // resting under the big tree, after a lost battle
SAVES.cowHome = {...SAVES.cowFollow, areas: {1: {...SAVES.cowFollow.areas[1], cowWolf: 1}}, pos: {place: 'homeGround', x: 18, y: 10, dir: 'right'}};   // on the road, nearly at the thirsty monkey
// the way home (27 October 2026): leading the cow up to the long grass in the dark pines, where it stops, scared; and up
// the south slope's steps from the pines, where it stops, hungry; the fresh grass by the brook, sparkling; and the grass
// picked, for it
SAVES.cowPines = {...SAVES.cowFollow, areas: {1: {...SAVES.cowFollow.areas[1], cowWolf: 1, pastureTracks: 1, logSeen: 1, streamSeen: 1, pastureLog: 1}}, pos: {place: 'darkPines', x: 16, y: 28, dir: 'up'}};
SAVES.cowSlope = {...SAVES.cowPines, areas: {1: {...SAVES.cowPines.areas[1], pinesWolf: 1}}, w: {...SAVES.cowPines.w, ...knows(1, ['一', '二', '三'])}, pos: {place: 'southSlope', x: 3, y: 28, dir: 'up'}};
SAVES.cowGrass = {...SAVES.cowSlope, following: [], areas: {1: {...SAVES.cowSlope.areas[1], cowWaits: 'slope', cowFood: 'asked'}}, tasksSeen: {...SAVES.cowSlope.tasksSeen, cowFood: 9},
  pos: {place: 'southSlope', x: 12, y: 25, dir: 'left'}};   // facing the fresh grass by the brook
SAVES.cowFed = {...SAVES.cowGrass, areas: {1: {...SAVES.cowGrass.areas[1], picked: {cowFood: ['11,25', '11,25', '11,25']}, holding: {cowFood: '草'}}}, tasksSeen: {...SAVES.cowGrass.tasksSeen, cowFed: 9},
  pos: {place: 'southSlope', x: 3, y: 27, dir: 'left'}};   // back with the grass, facing the cow
// version 3: its safe home, built by the road as you watch (the thirsty monkey's ! starts it); leading it in through its
// gate (这是你的家！); its thank-you, milk (牛奶), for the thirsty monkey; the feast's new table, with the milk on it; and
// the cow at home (我有家了！)
SAVES.cowBuild = {...SAVES.cowHome, following: [], areas: {1: {...SAVES.cowHome.areas[1], cow: 5}}, tasksSeen: {...SAVES.cowHome.tasksSeen, cow5: 1}, pos: {place: 'homeGround', x: 21, y: 10, dir: 'down'}};   // facing the thirsty monkey, from the road
SAVES.penBuilt = {...SAVES.cowBuild, following: ['cow'], areas: {1: {...SAVES.cowBuild.areas[1], cow: 7}}, tasksSeen: {...SAVES.cowBuild.tasksSeen, cow7: 1}, pos: {place: 'homeGround', x: 24, y: 10, dir: 'down'}};   // on the road at its gate, the cow behind you
SAVES.cowInPen = {...SAVES.penBuilt, following: [], w: {...SAVES.penBuilt.w, ...knows(1, ['牛奶'])}, areas: {1: {...SAVES.penBuilt.areas[1], cow: 8, milk: 'asked', holding: {milk: '牛奶'}}},
  tasksSeen: {...SAVES.penBuilt.tasksSeen, milk: 1}, pos: {place: 'homeGround', x: 21, y: 10, dir: 'down'}};   // with its milk, facing the thirsty monkey
SAVES.milkTable = {...SAVES.cowInPen, areas: {1: {...SAVES.cowInPen.areas[1], cow: 9, milk: 'done', holding: {}}}, tasksSeen: {...SAVES.cowInPen.tasksSeen, milkTable: 1}, pos: {place: 'homeGround', x: 22, y: 11, dir: 'up'}};   // coming up to where the feast's new table goes
SAVES.cowAtHome = {...SAVES.milkTable, areas: {1: {...SAVES.milkTable.areas[1], milkTable: 1}}, pos: {place: 'homeGround', x: 27, y: 13, dir: 'right'}};   // in its pen, facing the cow
// version 4: the little dairy by the pen: what the thirsty monkey makes from the milk, ready once you've answered 8 more
// questions (yoghurt, then cheese), and the feast's new table with all three on it
SAVES.dairyStart = {...SAVES.cowAtHome, tasksSeen: {...SAVES.cowAtHome.tasksSeen, dairy: 1}, pos: {place: 'homeGround', x: 21, y: 10, dir: 'down'}};   // facing the thirsty monkey, the milk on the feast's table
SAVES.dairyWait = {...SAVES.dairyStart, turn: 43, areas: {1: {...SAVES.dairyStart.areas[1], dairy: 1, dairyTurn: 40}}, tasksSeen: {...SAVES.dairyStart.tasksSeen, dairyWait: 1}};   // 3 questions since he started
SAVES.dairyReady = {...SAVES.dairyWait, turn: 48, areas: {1: {...SAVES.dairyWait.areas[1], dairy: 2}}, tasksSeen: {...SAVES.dairyWait.tasksSeen, dairyReady: 1}};
SAVES.dairyDone = {...SAVES.dairyReady, w: {...SAVES.dairyReady.w, ...knows(1, ['酸奶', '奶酪'])}, areas: {1: {...SAVES.dairyReady.areas[1], dairy: 5, milkTable: 3}},
  tasksSeen: {...SAVES.dairyReady.tasksSeen, dairyWait2: 1, dairyReady2: 1}, pos: {place: 'homeGround', x: 21, y: 9, dir: 'up'}};   // on the road, below the feast's tables
// the big monkey's garden (version 1, 27 October 2026): his ! for seeds, once the feast's tables are set; the garden marked
// out by the stream; the melon field east off the south slope, birds pecking at its melons; and the seeds planted (version
// 30: the flowers are done, which an older save's upgrade would undo)
SAVES.gardenAsk = {...SAVES.dairyDone, version: 30, w: {...SAVES.dairyDone.w, ...knows(1, ['勺子', '鸟', '红色', '黄色', '白色', '蓝色', '黑色'])}, areas: {1: {...SAVES.dairyDone.areas[1], spoons: 2, flowers: 'done', schoolFlowers: true, shop: 3}}, pos: {place: 'homeGround', x: 15, y: 5, dir: 'up'}};   // facing the big monkey
SAVES.gardenMarked = {...SAVES.gardenAsk, w: {...SAVES.gardenAsk.w, ...knows(1, ['种子'])}, areas: {1: {...SAVES.gardenAsk.areas[1], garden: 1, melonSeeds: 'asked', grapeSeeds: 'asked', bananaSeeds: 'asked'}},
  tasksSeen: {...SAVES.gardenAsk.tasksSeen, melonSeeds: 1, grapeSeeds: 1, bananaSeeds: 1}, pos: {place: 'homeGround', x: 10, y: 13, dir: 'left'}};   // by the garden, facing the big monkey
SAVES.melonField = {...SAVES.gardenMarked, pos: {place: 'melonField', x: 13, y: 4, dir: 'right'}};   // facing the red bird
SAVES.melonsSafe = {...SAVES.gardenMarked, areas: {1: {...SAVES.gardenMarked.areas[1], shooed: [1, 2, 3, 4, 5].map(n => 'melonBird' + n)}},
  tasksSeen: {...SAVES.gardenMarked.tasksSeen, melonSeeds2: 1}, pos: {place: 'melonField', x: 12, y: 11, dir: 'right'}};   // facing a melon
SAVES.seedsBack = {...SAVES.melonsSafe, w: {...SAVES.melonsSafe.w, ...knows(1, ['西瓜'])}, areas: {1: {...SAVES.melonsSafe.areas[1], holding: {melonSeeds: '种子'}}},
  tasksSeen: {...SAVES.melonsSafe.tasksSeen, melonSeedsBack: 1}, pos: {place: 'homeGround', x: 10, y: 13, dir: 'left'}};
SAVES.melonsPlanted = {...SAVES.seedsBack, areas: {1: {...SAVES.seedsBack.areas[1], holding: {}, melonSeeds: 'done', melonPlanted: 1}}, pos: {place: 'homeGround', x: 10, y: 13, dir: 'down'}};
// version 2: the cliffs (山崖) west off the hillside, the grapes hanging down them, and the grapes' trellis at home
SAVES.hillsideWest = {...SAVES.gardenMarked, pos: {place: 'hillside', x: 3, y: 26, dir: 'left'}};   // on the hillside's second terrace, the way west open
SAVES.cliffsTop = {...SAVES.gardenMarked, areas: {1: {...SAVES.gardenMarked.areas[1], cliffsSeen: 1}}, pos: {place: 'cliffs', x: 15, y: 8, dir: 'down'}};   // at the top, above the grapes
SAVES.cliffsGoat = {...SAVES.cliffsTop, pos: {place: 'cliffs', x: 17, y: 6, dir: 'left'}};
SAVES.cliffsLedge = {...SAVES.cliffsTop, pos: {place: 'cliffs', x: 15, y: 11, dir: 'up'}};   // on the ledge under the grapes
SAVES.grapesBack = {...SAVES.cliffsTop, w: {...SAVES.cliffsTop.w, ...knows(1, ['葡萄'])}, areas: {1: {...SAVES.cliffsTop.areas[1], holding: {grapeSeeds: '种子'}}},
  tasksSeen: {...SAVES.cliffsTop.tasksSeen, grapeSeedsBack: 1}, pos: {place: 'homeGround', x: 10, y: 13, dir: 'left'}};
SAVES.trellisUp = {...SAVES.grapesBack, areas: {1: {...SAVES.grapesBack.areas[1], holding: {}, grapeSeeds: 'done', grapePlanted: 1}}, pos: {place: 'homeGround', x: 10, y: 13, dir: 'down'}};
// version 3: the hot spring valley (温泉谷) up the brook from the riverside, its steam vents, the monkeys bathing, the
// bananas; and the garden with all three planted
SAVES.riversideNorth = {...SAVES.gardenMarked, pos: {place: 'riverside', x: 25, y: 3, dir: 'up'}};   // by the brook, the way up it open
SAVES.springs = {...SAVES.gardenMarked, areas: {1: {...SAVES.gardenMarked.areas[1], springsSeen: 1}}, pos: {place: 'hotSprings', x: 13, y: 16, dir: 'up'}};
SAVES.springsVent = {...SAVES.springs, pos: {place: 'hotSprings', x: 13, y: 10, dir: 'up'}};   // between the vents, facing the next
SAVES.springsBath = {...SAVES.springs, pos: {place: 'hotSprings', x: 5, y: 18, dir: 'up'}};   // facing a monkey in the warm pool
SAVES.springsBananas = {...SAVES.springs, pos: {place: 'hotSprings', x: 9, y: 5, dir: 'up'}};   // facing a banana plant
SAVES.bananasBack = {...SAVES.springs, w: {...SAVES.springs.w, ...knows(1, ['香蕉'])}, areas: {1: {...SAVES.springs.areas[1], holding: {bananaSeeds: '种子'}}},
  tasksSeen: {...SAVES.springs.tasksSeen, bananaSeedsBack: 1}, pos: {place: 'homeGround', x: 10, y: 13, dir: 'left'}};
SAVES.gardenPlanted = {...SAVES.bananasBack, w: {...SAVES.bananasBack.w, ...knows(1, ['西瓜', '葡萄'])}, areas: {1: {...SAVES.bananasBack.areas[1], holding: {},
  melonSeeds: 'done', melonPlanted: 1, grapeSeeds: 'done', grapePlanted: 1, bananaSeeds: 'done', bananaPlanted: 1}}, pos: {place: 'homeGround', x: 10, y: 12, dir: 'down'}};
// version 4: the fruit growing (your task counts the questions), ripe in the garden, the big monkey picking it (好了！), and
// the feast's new table for it, each fruit in its own bowl
SAVES.fruitGrowing = {...SAVES.gardenPlanted, turn: 50, areas: {1: {...SAVES.gardenPlanted.areas[1], melonTurn: 45, grapeTurn: 47, bananaTurn: 49}}, tasksSeen: {...SAVES.gardenPlanted.tasksSeen, melonGrow: 1, grapeGrow: 1, bananaGrow: 1}};
SAVES.fruitRipe = {...SAVES.fruitGrowing, turn: 60, areas: {1: {...SAVES.fruitGrowing.areas[1], melonPlanted: 2, grapePlanted: 2, bananaPlanted: 2}},
  tasksSeen: {...SAVES.fruitGrowing.tasksSeen, melonRipe: 1, grapeRipe: 1, bananaRipe: 1}, pos: {place: 'homeGround', x: 10, y: 13, dir: 'left'}};   // facing the big monkey
SAVES.fruitPicked = {...SAVES.fruitRipe, areas: {1: {...SAVES.fruitRipe.areas[1], melonPlanted: 3, grapePlanted: 2, bananaPlanted: 2}}, tasksSeen: {...SAVES.fruitRipe.tasksSeen, melonTable: 1},
  pos: {place: 'homeGround', x: 13, y: 11, dir: 'up'}};   // on the road, just short of the big tree
SAVES.fruitTable = {...SAVES.fruitRipe, areas: {1: {...SAVES.fruitRipe.areas[1], melonPlanted: 4, grapePlanted: 4, bananaPlanted: 4, fruitTable: 1, bees: 11, honey: 'done'}},
  pos: {place: 'homeGround', x: 13, y: 9, dir: 'up'}};
SAVES.caveTop = {...SAVES.home, pos: {place: 'cave', x: 7, y: 5, dir: 'up'}};   // by the beds, the table and the bowls
SAVES.atDoor = {...SAVES.ledIn, pos: {place: 'cave', x: 8, y: 12, dir: 'right'}};   // beside the monkey just inside the entrance
SAVES.byBed = {...SAVES.home, w: {...SAVES.home.w, ...knows(1, ['睡觉'])}, health: 20, pos: {place: 'cave', x: 12, y: 2, dir: 'up'}};   // hurt, facing a bed
SAVES.rocksGone = {...SAVES.middle, areas: {1: {...SAVES.middle.areas[1], hungry: 'done', thirsty: 'done', holding: {}, gate: true}}, pos: {place: 'meadow', x: 15, y: 2, dir: 'left'}};   // the troop gathers where the rocks were
SAVES.settingOff = {...SAVES.rocksGone, version: 29, w: {...SAVES.rocksGone.w, ...knows(1, ['再见'])}, areas: {1: {...SAVES.rocksGone.areas[1], flowers: 'done', climb: 1}},
  pos: {place: 'meadow', x: 15, y: 2, dir: 'up'}};   // said goodbye to the old monkey, about to walk up past the big monkey (no stick yet)
SAVES.climbing = {...SAVES.rocksGone, version: 25, w: {...SAVES.rocksGone.w, ...knows(1, ['路'])}, areas: {1: {...SAVES.rocksGone.areas[1], climb: 1}}, pos: {place: 'path', x: 15, y: 14, dir: 'left'}};   // (version 25: older saves on the path are moved off it)
SAVES.fighting = {...SAVES.climbing, w: {...SAVES.climbing.w, ...knows(1, ['棍子', '蛇'])}, health: 40, bag: {'桃子': 2, '苹果': 1}};   // on the path, with the stick, a snake met before, and fruit
SAVES.bowlsWait = {...SAVES.bowlsOn, turn: 0, areas: {1: {...SAVES.bowlsOn.areas[1], wordTurn: 0}}};   // (a new word just caught: the chopsticks wait 4 questions)
SAVES.packed = {...SAVES.fighting, health: 30, areas: {1: {...SAVES.fighting.areas[1], thirsty: 'asked', holding: {thirsty: '水'}}}};   // hurt, with fruit, and water for the thirsty monkey
SAVES.byPeaches = {...SAVES.fighting, pos: {place: 'meadow', x: 2, y: 6, dir: 'left'}};   // by a peach tree, the hungry monkey fed
SAVES.hurt = {...SAVES.fighting, health: 20, pos: {place: 'meadow', x: 15, y: 2, dir: 'left'}};
SAVES.valley = {...SAVES.fighting, pos: {place: 'valley', x: 18, y: 9, dir: 'up'}};   // at the fork in the river valley, by the sheep
SAVES.deepIn = {...SAVES.fighting, pos: {place: 'falls', x: 7, y: 5, dir: 'up'}};   // below the wild boar, deep in the mountains
SAVES.atTheTop = {...SAVES.climbing, pos: {place: 'falls', x: 5, y: 1, dir: 'left'}};
SAVES.foundFall = {...SAVES.fighting, w: {...SAVES.fighting.w, ...knows(1, ['瀑布', '野猪', '山羊', '朋友'])}, areas: {1: {...SAVES.fighting.areas[1], flowers: 'done', climb: 2, boar: 1}},
  pos: {place: 'falls', x: 7, y: 3, dir: 'down'}};   // found the waterfall, setting off back down the narrow way
SAVES.leading = {...SAVES.foundFall, version: 28, areas: {1: {...SAVES.foundFall.areas[1], climb: 3, ledgeTip: 1}}, following: ['playful', 'big', 'elder'],
  pos: {place: 'path', x: 16, y: 18, dir: 'up'}};   // leading the troop up, at the bottom of the mountain path (version 28: climb 3 is leading them up)
SAVES.appleTree = {...SAVES.middle, pos: {place: 'meadow', x: 20, y: 17, dir: 'right'}};
// how a word is made: you know 山 and 羊, but not 山羊 (goat); or 水果 (fruit), but not 苹果 (apple)
SAVES.knowsSheep = {...SAVES.middle, w: {...SAVES.middle.w, ...knows(1, ['羊'])}};
SAVES.knowsFruit = {...SAVES.middle, w: knows(1, MIDDLE_WORDS.filter(w => w !== '苹果'))};
SAVES.knowsApple = {...SAVES.middle, w: knows(1, MIDDLE_WORDS.filter(w => w !== '水果'))};
SAVES.bySheep = {...SAVES.middle, pos: {place: 'meadow', x: 3, y: 6, dir: 'up'}};   // below the sheep, at the foot of the cliffs by your stone
// by a peach tree, the hungry monkey asking for fruit, and you don't know 桃子 (peach) yet
SAVES.fruitTree = {...SAVES.middle, w: knows(1, MIDDLE_WORDS.filter(w => w !== '桃子')), areas: {1: {...SAVES.middle.areas[1], holding: {}}},
  pos: {place: 'meadow', x: 2, y: 6, dir: 'left'}};
// your home's name: you know every part of it (花, 山 and the 果 of 水果), below the sign by your stone; the message not
// had yet (homeName 0), or had, the sign sparkling (1)
SAVES.homeParts = {...SAVES.middle, areas: {1: {...SAVES.middle.areas[1], homeName: 0}}, pos: {place: 'meadow', x: 11, y: 3, dir: 'up'}};
SAVES.homeSign = {...SAVES.homeParts, areas: {1: {...SAVES.middle.areas[1], homeName: 1}}};
SAVES.goatTip = {...SAVES.middle, tips: {...ALL_TIPS, syllables: 0}};   // the goat's tip still to come
SAVES.withApple = {...SAVES.middle, bag: {'苹果': 1}};   // an apple from the shop, to eat in an encounter
SAVES.allFriends = {...SAVES.chapter1, friends: ['rabbit', 'sheep', 'squirrel', 'goat']};   // every animal in the prologue won over
SAVES.wantsApple = {...SAVES.middle, areas: {1: {...SAVES.middle.areas[1], holding: {}, wanted: {hungry: '苹果'}}}, pos: {place: 'meadow', x: 13, y: 6, dir: 'up'}};
SAVES.facing = {...SAVES.born, tips: {walk: 1}, pos: {x: 7, y: 2, dir: 'up'}};   // facing the old monkey, having walked
SAVES.noMenuTip = {...SAVES.middle, tips: {...ALL_TIPS, menu: 0}};
SAVES.englishTip = {...SAVES.middle, tips: {...ALL_TIPS, english: 0}, lines: {'去看看！': 1}};   // a line heard before, the English tip still to come

// The 老板's new shop at the home ground (29 October 2026): with the flowers planted, he comes up from the meadow; the troop
// builds his shop by the way in as you watch; headbands in every colour you know, and food
SAVES.shopComes = {...SAVES.flowersPlanted, areas: {1: {...SAVES.flowersPlanted.areas[1], shop: 0}}, tasksSeen: {...SAVES.flowersPlanted.tasksSeen, news: 1}, pos: {place: 'homeGround', x: 11, y: 7, dir: 'down'}};
SAVES.shopMoved = {...SAVES.flowersPlanted, areas: {1: {...SAVES.flowersPlanted.areas[1], shop: 1}}, tasksSeen: {...SAVES.flowersPlanted.tasksSeen, shopMoved: 1, news: 1}, pos: {place: 'homeGround', x: 7, y: 9, dir: 'up'}};   // facing him, on the road by the way in
SAVES.shopOpen = {...SAVES.shopMoved, shells: 24, w: {...SAVES.shopMoved.w, ...knows(1, ['头带', '蓝色', '绿色'])}, areas: {1: {...SAVES.shopMoved.areas[1], shop: 3, bought: ['头带']}},
  wardrobe: {owned: ['头带', '蓝色 的 头带'], wearing: ['蓝色 的 头带']}};
SAVES.oldStall = {...SAVES.shopOpen, pos: {place: 'meadow', x: 9, y: 17, dir: 'up'}};   // below his old stall in the meadow
// A big fish for the feast (29 October 2026): with honey on the table, the hungry monkey wants one; the fishing monkey by
// the stream gives you a rod; your first catch is tiny (小), then a big one (大), for the feast
SAVES.fishAsk = {...SAVES.fruitTable, areas: {1: {...SAVES.fruitTable.areas[1], shop: 3, fish: 'not asked'}}, pos: {place: 'homeGround', x: 20, y: 7, dir: 'left'}};   // facing the hungry monkey
SAVES.fishRod = {...SAVES.fishAsk, areas: {1: {...SAVES.fishAsk.areas[1], fish: 'asked'}}, tasksSeen: {...SAVES.fishAsk.tasksSeen, fishRod: 1}, pos: {place: 'homeGround', x: 23, y: 17, dir: 'right'}};   // facing the fishing monkey
SAVES.fishing = {...SAVES.fishRod, w: {...SAVES.fishRod.w, ...knows(1, ['鱼竿'])}, areas: {1: {...SAVES.fishRod.areas[1], fishing: 1}}, tasksSeen: {...SAVES.fishRod.tasksSeen, fishCatch: 1}, pos: {place: 'homeGround', x: 23, y: 17, dir: 'down'}};
SAVES.fishBoth = {...SAVES.fishing, w: {...SAVES.fishing.w, ...knows(1, ['小', '大', '鱼饵'])}, bag: {'鱼饵': 2}, areas: {1: {...SAVES.fishing.areas[1], fish: 'done', fishTable: 1}}};
SAVES.fishTable = {...SAVES.fishBoth, pos: {place: 'homeGround', x: 24, y: 8, dir: 'up'}};
SAVES.shrimpAsk = {...SAVES.fishBoth, areas: {1: {...SAVES.fishBoth.areas[1], shrimp: 'not asked'}}, pos: {place: 'homeGround', x: 20, y: 7, dir: 'left'}};   // facing the hungry monkey
SAVES.shrimping = {...SAVES.shrimpAsk, areas: {1: {...SAVES.shrimpAsk.areas[1], shrimp: 'asked'}}, tasksSeen: {...SAVES.shrimpAsk.tasksSeen, shrimpCatch: 1}, pos: {place: 'riverside', x: 26, y: 4, dir: 'right'}};   // by the brook's clear shallows
SAVES.shrimpTwo = {...SAVES.shrimping, w: {...SAVES.shrimping.w, ...knows(1, ['虾'])}, areas: {1: {...SAVES.shrimping.areas[1], picked: {shrimp: ['riverside:27,4', 'riverside:27,4']}}}};
SAVES.shrimpTable = {...SAVES.shrimpTwo, areas: {1: {...SAVES.shrimpTwo.areas[1], shrimp: 'done', shrimpTable: 1, picked: {shrimp: ['riverside:27,4', 'riverside:27,4', 'riverside:27,4']}}}, pos: {place: 'homeGround', x: 24, y: 8, dir: 'down'}};
// the end of chapter 1: a crab from the shore below the meadow, the school's exam, the feast, and your raft
SAVES.crabAsk = {...SAVES.shrimpTable, areas: {1: {...SAVES.shrimpTable.areas[1], crab: 'not asked'}}, pos: {place: 'homeGround', x: 20, y: 7, dir: 'left'}};   // facing the hungry monkey
SAVES.shore = {...SAVES.crabAsk, w: {...SAVES.crabAsk.w, ...knows(1, ['海'])}, areas: {1: {...SAVES.crabAsk.areas[1], crab: 'asked', seaSeen: 1}}, tasksSeen: {...SAVES.crabAsk.tasksSeen, crabCatch: 1}, pos: {place: 'shore', x: 9, y: 9, dir: 'down'}};
SAVES.crabTable = {...SAVES.shore, w: {...SAVES.shore.w, ...knows(1, ['螃蟹'])}, areas: {1: {...SAVES.shore.areas[1], crab: 'done', crabTable: 1}}, tasksSeen: {...SAVES.shore.tasksSeen, crabBack: 1, exam: 1}, pos: {place: 'homeGround', x: 15, y: 9, dir: 'up'}};
SAVES.examReady = {...SAVES.crabTable, pos: {place: 'school', x: 7, y: 3, dir: 'up'}};   // facing the teacher
// quick practice (练习): a game near the end of chapter 1, its words at every level
SAVES.practise = {...SAVES.examReady, w: Object.fromEntries(Object.entries(SAVES.examReady.w).map(([w, r], i) => [w, {...r, lv: 1 + i % 4, ok: i % 3 ? 2 : 0}]))};
SAVES.practiseFew = {...SAVES.middle, w: knows(1, ['石头', '你好', '山', '花'])};   // only three words with pictures
SAVES.examPassed = {...SAVES.examReady, areas: {1: {...SAVES.examReady.areas[1], exam: 1}}, tasksSeen: {...SAVES.examReady.tasksSeen, feastGo: 1}, pos: {place: 'school', x: 3, y: 2, dir: 'up'}};   // facing the certificate
SAVES.feastSeats = {...SAVES.examPassed, pos: {place: 'homeGround', x: 17, y: 11, dir: 'up'}};   // (a step from the feast starting)
SAVES.raftWalk = {...SAVES.examPassed, w: {...SAVES.examPassed.w, ...knows(1, ['快乐'])}, areas: {1: {...SAVES.examPassed.areas[1], feastHeld: 1, raft: 1}}, following: ['elder', 'big', 'playful'],
  tasksSeen: {...SAVES.examPassed.tasksSeen, raftWalk: 1}, pos: {place: 'shore', x: 11, y: 8, dir: 'down'}};
SAVES.raftReady = {...SAVES.raftWalk, w: {...SAVES.raftWalk.w, ...knows(1, ['木筏'])}, areas: {1: {...SAVES.raftWalk.areas[1], raft: 2}}, following: [], tasksSeen: {...SAVES.raftWalk.tasksSeen, raftBoard: 1}, pos: {place: 'shore', x: 11, y: 11, dir: 'down'}};
SAVES.chapterDone = {...SAVES.raftReady, areas: {1: {...SAVES.raftReady.areas[1], raft: 3, done: true}}, pos: {place: 'shore', x: 11, y: 12, dir: 'down'}};

// The screens, in the order you meet them. save: one of SAVES (none: a brand-new game). voices: 'zh'
// (a Chinese voice, the usual), or 'missing' (only English voices). why: what to look out for.
const SCREENS = [
  {id: 'turn', title: 'Held upright', size: '375x812', why: 'The game is played sideways, so it asks you to turn the phone.'},
  {id: 'startup', title: 'Starting up', why: 'Until the game has set itself up: the app’s monkey and three dots (on a slow connection, the console showed half-built for a few seconds).', run: async () => {
    document.documentElement.classList.add('loading'); document.querySelector('.boot .slow').style.visibility = 'hidden'; await wait(200); }},
  {id: 'startup-slow', title: 'Starting up, slowly', why: 'After 8 seconds on the start-up screen, it says why.', run: async () => {
    document.documentElement.classList.add('loading'); await wait(200); }},
  {id: 'title', title: 'Title screen', why: 'A new game.'},
  {id: 'title-novoice', title: 'Title, no Chinese voice', voices: 'missing', why: 'With the game’s own voice clips there’s no warning: the device’s voice isn’t needed.'},
  {id: 'title-phone', title: 'Title, in a phone’s browser', why: 'Play full screen: on Android it goes full screen, on an iPhone it shows how to add it to the home screen. Never once it’s the app.', run: async () => {
    window.matchMedia = q => ({matches: q === '(pointer: coarse)'}); titleText(); await wait(200); }},
  {id: 'title-iphone', title: 'Title, in Safari on an iPhone', save: 'middle', why: 'Safari can delete a game after a week away: a warning, with Play full screen to add it to the home screen, where it’s safe.', run: async () => {
    Object.defineProperty(navigator, 'userAgent', {get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});
    window.matchMedia = q => ({matches: q === '(pointer: coarse)'}); titleText(); await wait(200); }},
  {id: 'fullscreen-iphone', title: 'Play full screen, on an iPhone', why: 'How to add it to the home screen, and how to carry a game across to the app.', run: async () => {
    window.matchMedia = q => ({matches: q === '(pointer: coarse)'}); showAddSteps(); await wait(300); }},
  {id: 'title-back', title: 'Title, coming back', save: 'middle'},
  {id: 'title-games', title: 'Title, two games', save: 'middle', why: 'Continue goes to the game played last (Game 1); Save files has both.', run: async () => {
    localStorage.setItem(KEY + '-game2', JSON.stringify({...S, started: true, w: {'石头': {lv: 1, due: 0, ok: 0}, '你好': {lv: 1, due: 0, ok: 0}}, friends: []}));
    setSlotsInfo(d => ({...d, played: {1: Date.now(), 2: Date.now() - 3 * 86400000}})); toTitle(); await wait(300); }},
  {id: 'title-practise', title: 'Title, with Practise', save: 'practise', why: 'Beside Continue, once the game knows 4 words with pictures: questions on your words without walking anywhere, and how many need practice.'},
  {id: 'practise', title: 'Quick practice', save: 'practise', why: 'Your words, how many need practice and how many at each level. Choose how many questions with − and +, in fives, up to 50 or as many as there are; no shells, it’s just practice.', run: async () => { click('#pracBtn'); await wait(300); }},
  {id: 'practise-most', title: 'Quick practice, as many as it goes', save: 'practise', why: '+ goes no further at 50 (or at as many as you can be asked about).', run: async () => { click('#pracBtn'); for (let i = 0; i < 12; i++) click('[data-a=more]'); await wait(300); }},
  {id: 'practise-few', title: 'Quick practice, too few words', save: 'practiseFew', why: 'From the menu, before you know 4 words with pictures: learn some first.', run: async () => { play(); await wait(100); openMenu(); await wait(200); click('[data-m=practice]'); await wait(300); }},
  {id: 'practise-question', title: 'Quick practice, a question', save: 'practise', why: 'The lesson bar says how far you are; Stop (or B) ends it where you are.', run: async () => { click('#pracBtn'); await wait(200); click('[data-a=go]'); await wait(600); }},
  {id: 'practise-end', title: 'Quick practice, the end', save: 'practise', why: 'How you did, the words that moved up a level, the ones to practise, and Done or 10 more.', run: async () => {
    for (const w of trainable().slice(0, 30)) Object.assign(rec(w), {n: 1, ok: 0});   // (a right answer moves these up a level)
    let i = 0; pictureQ = async o => { const ok = i++ % 4 !== 1; answer(o.word, ok, o.type); return ok; }; gapQ = async o => { answer(o.gap, true, 'fill'); return true; };
    click('#pracBtn'); await wait(200); click('[data-a=go]'); await wait(600); }},
  {id: 'game-card', title: 'A game’s card', save: 'middle', why: 'Continue, copy it to a file, or delete it.', run: async () => { slotCard(1); await wait(300); }},
  {id: 'game-empty', title: 'An empty game’s card', why: 'A new game, or one from a file.', run: async () => { slotCard(1); await wait(300); }},
  {id: 'game-delete', title: 'Deleting a game', save: 'middle', why: 'Asked once more; Keep it is the main button.', run: async () => { slotCard(1); click('[data-a=del]'); await wait(300); }},
  {id: 'save-files', title: 'Save files', save: 'middle', why: 'Your three games: choose one for its card.', run: async () => { click('#filesBtn'); await wait(300); }},
  {id: 'intro-sea', title: 'Opening: the mountain', why: 'The story in Chinese, with pinyin and English, read aloud.', run: async () => { click('#newBtn'); introClock = 2.85; advancedTo = 1; await wait(400); }},
  {id: 'intro-monkey', title: 'Opening: the monkey is born', run: async () => { click('#newBtn'); introClock = 9.05; advancedTo = 4; await wait(400); }},
  {id: 'intro-eyes', title: 'Opening: light in its eyes', run: async () => { click('#newBtn'); introClock = 10.65; advancedTo = 5; const real = drawScene; drawScene = (t, now, mid) => real(10.95, now, mid); await wait(400); }},   // (held there)
  {id: 'intro-rising', title: 'Opening: up to heaven', why: 'The light from its eyes shoots up into the sky, and the view follows it up, to the gate of heaven in the clouds (here, on its way up).', run: async () => { click('#newBtn'); introClock = 10.65; advancedTo = 5; const real = drawScene; drawScene = (t, now, mid) => real(11.7, now, mid); await wait(400); }},   // (held there)
  {id: 'intro-heaven', title: 'Opening: who’s that, up in the clouds?', why: 'As in the book: the light reaches heaven, and the two gods sent to see and hear what it is step out of the Southern Gate of Heaven, 南天门: on the left, red-faced Thousand-Mile Eye, a hand over his eyes; on the right, green-faced Wind-Following Ear, cupping a huge ear. Then the view goes back down to the little monkey as the light fades, and 你好，小猴子！ Nothing is said about them.', run: async () => { click('#newBtn'); introClock = 10.65; advancedTo = 5; const real = drawScene; drawScene = (t, now, mid) => real(13.4, now, mid); await wait(400); }},   // (held there)
  {id: 'stone', title: 'Born from the stone', why: 'Straight after Start: a word you discover yourself.', run: async () => { startGame(); await wait(1500); }},
  {id: 'first-steps', title: 'First steps', why: 'The message, the task box, the arrow and the first tip.', run: async () => {
    startGame(); await wait(1500); click('[data-a=ok]'); await wait(500); }},
  {id: 'tip-talk', title: 'Tip: press A to talk', save: 'facing', run: async () => { play(); await wait(500); }},
  {id: 'tip-menu', title: 'Tip: the Menu', save: 'noMenuTip', why: 'Once you know 3 words, for 8 seconds.', run: async () => { play(); await wait(500); }},
  {id: 'hello', title: 'The old monkey says hello', save: 'born', why: 'The speech box, teaching a word.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(600); }},
  {id: 'elder-checks-in', title: 'The old monkey checks in', save: 'middle', why: 'He reminds you what the troop asked for, in words you know.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(600); }},
  {id: 'meadow-ask', title: 'The words for the meadow', save: 'meadowWords', why: 'Telling you about animals, the old monkey wants the meadow’s words too: just those you don’t know yet.', run: async () => {
    play(); await wait(100); runSteps(AREA.talk.elder.flatMap(p => p.do).filter(s => s.message && s.if), 'elder'); await wait(400); }},
  {id: 'tasks-meadow', title: 'Tasks: the words for the meadow', save: 'meadowWords', why: 'Which are still to find. The rocks wait for them.', run: async () => {
    play(); await wait(100); tasksPage(() => closeCard()); await wait(300); }},
  {id: 'river-look', title: 'At the river: looking first', save: 'meadowWords', why: 'Asked for water, but you don’t know 河 (river) yet: A says Look, and teaches it. Then A says Collect.', run: async () => {
    S.tasksSeen = Object.fromEntries(getTasks().map(t => [t.id, 1])); play(); await wait(500); }},
  {id: 'troop-line', title: 'A monkey of the troop', save: 'middle', why: 'Each of the troop has something to say, after 你好.', run: async () => {
    play(); await wait(100); talk(npc('troop1')); await wait(300); next(); await wait(300); click('#talk .reply'); await wait(400); next(); await wait(600); }},
  {id: 'talk-top', title: 'Talking low on the screen', save: 'lowTalk', why: 'At the bottom of a map the speech box would cover you, so it’s at the top of the screen instead, for the whole conversation. The map never moves for it.', run: async () => {
    play(); await wait(100); talk(npc('playful')); await wait(600); }},
  {id: 'first-words', title: 'Your first words: what to look for', save: 'firstWords', why: 'Sent off to learn 4 words: the arrow bobs over the nearest thing that sparkles (the cliff), and until you know 4, the sparkles twinkle a little bigger (each comes and goes, so some are out at any moment).', run: async () => {
    play(); await wait(800); }},
  {id: 'tasks-first-words', title: 'Tasks: your first words', save: 'firstWords', why: 'Walk up to things that sparkle, with the sparkle as on the map, and press A.', run: async () => {
    play(); await wait(100); tasksPage(() => closeCard()); await wait(300); }},
  {id: 'talk-done', title: 'The last message: Done', save: 'notYet', why: 'A conversation’s last line, or here what to do after it, says Done, not ▼ Next, so you can tell it’s ending.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(400); }},
  {id: 'message-ok', title: 'A message after talking', save: 'hungryAsks', why: 'Where the speech box was: A says OK, and closes it, never starting the conversation again. Then what you’ve just finished with rests for 2 seconds.', run: async () => {
    S.tasksSeen = Object.fromEntries(getTasks().map(t => [t.id, 1])); play(); await wait(100); toast('New task: Find some fruit for the hungry monkey'); clearTimeout(msgT); await wait(400); }},
  {id: 'hello-card', title: 'A new word in a conversation', save: 'born', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(400); }},
  {id: 'first-reply', title: 'Your first reply', save: 'born', why: 'His line stays in sight: The old monkey says hello. Now you say it!', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); await gotIt(); await wait(400); }},
  {id: 'reply-thanks', title: 'Replying to thanks', save: 'phrases', why: 'What you’re answering stays in sight (his line, 谢谢你！), with what’s happening in plain English: The hungry monkey thanks you. What do you say back?', run: async () => {
    play(); await wait(100); (async () => { await showDialog(speaker('hungry'), L.thanks); await replyWith('不客气'); })(); await wait(200); next(); await wait(400); }},
  {id: 'reply-not-fit', title: 'A reply that doesn’t fit', save: 'phrases', why: 'Why not, and the one that does (green), which your monkey says next.', run: async () => {
    play(); await wait(100); (async () => { await showDialog(speaker('hungry'), L.thanks); await replyWith('不客气'); })(); await wait(200); next(); await wait(300);
    [...document.querySelectorAll('#talk .reply')].find(b => !b.textContent.includes('不客气')).click(); await wait(400); }},
  {id: 'reply-gift', title: 'Thanking for a gift', save: 'phrases', why: 'Not a line, so what’s happening, with a picture of it: The 松鼠 (squirrel) gives you a 桃子 (peach). What do you say?', run: async () => {
    play(); await wait(100); STEPS.reply({reply: '谢谢', about: 'The {松鼠} gives you a {桃子}.', pic: '桃子'}, 'squirrel'); await wait(400); }},
  {id: 'king-says', title: 'Your name, once you’re king', save: 'home', why: 'Over what you say, your name and what it means: 美猴王 Měi Hóuwáng, Handsome Monkey King (you). Before that, 小猴子 xiǎo hóuzi, Little monkey (you).', run: async () => {
    play(); await wait(100); iSay('你好'); await wait(400); }},
  {id: 'shop-handed', title: 'Handed what you bought', save: 'phrases', why: 'The 老板 gives it to you: you say 谢谢 (and he says 不客气).', run: async () => {
    play(); await wait(100); gapQ = async () => true; buy(AREA.shop.items.find(i => i.item === '苹果'), speaker('boss')); await wait(400); }},
  {id: 'welcome', title: 'The old monkey’s welcome', save: 'born', why: 'A line of story, waiting in the speech box.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); await gotIt(); await wait(200); next(); await wait(200);
    next(); await wait(200); next(); await wait(500); }},
  {id: 'grey-tip', title: 'Tip: grey words', save: 'born', why: 'His first line with grey words: every grey word glows, and a tip says they’re just for listening.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); await untilTip('grey'); }},
  {id: 'tap-tip', title: 'Tip: tap a word', save: 'born', why: 'A on the tip about grey words: one grey word lit, and a tip to tap a word to see what it means. Then A moves on.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); await untilTip('grey'); next(); await wait(500); }},
  {id: 'go-look', title: 'Off you go', save: 'born', why: 'His line: go and take a look.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); await gotIt(); await wait(200); next(); await wait(200);
    next(); await wait(200); next(); await wait(200); next(); await wait(200); next(); await wait(500); }},
  {id: 'go-look-note', title: 'Off you go: what to do', save: 'born', why: 'What to do is a message of its own, after his line (it crowded the line, under it): the sparkle big beside it, the first sentence in bold.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); await gotIt(); await wait(200); next(); await wait(200);
    next(); await wait(200); next(); await wait(200); next(); await wait(200); next(); await wait(200); next(); await wait(500); }},
  {id: 'tip-english', title: 'Tip: the English button', save: 'englishTip', why: 'The first line you hear again, its English behind the English button: a tip points at it, once.', run: async () => {
    play(); await wait(100); showDialog(speaker('elder'), L.go); await wait(500); }},
  {id: 'playing', title: 'Playing', save: 'middle', why: 'The map, the task box, the header.', run: async () => { play(); await wait(600); }},
  {id: 'chapter-card', title: 'A new chapter', save: 'home', why: 'Its title card, when a chapter begins: chapter 1, once the whole troop is home and the prologue is over.', run: async () => { play(); await wait(100); STEPS.chapter({chapter: 1}); await wait(300); }},
  {id: 'place-name', title: 'Arriving in a place', save: 'middle', why: 'Its name for a moment, when you go from one place to another.', run: async () => { play(); await wait(100); showPlaceName(); clearTimeout(placeNameT); await wait(300); }},
  {id: 'gap-picture', title: 'Fill the gap (pictures)', save: 'middle', why: 'Giving the peach: the word is new, so the choices are pictures.', run: async () => {
    play(); await wait(100); gapQ({who: speaker('hungry'), t: toks('我 要 吃 桃子'), en: 'I want to eat a peach.', gap: '桃子'}); await wait(400); }},
  {id: 'gap-answered', title: 'Fill the gap, answered', save: 'middle', why: 'The sentence filled in, each answer’s pinyin, and Next, without anything moving.', run: async () => {
    play(); await wait(100); const q = pictureQ; pictureQ = o => { window.__q = o; return q(o); };
    gapQ({who: speaker('hungry'), t: toks('我 要 吃 桃子'), en: 'I want to eat a peach.', gap: '桃子'}); await wait(300);
    click('.opt[data-i="' + __q.answerIdx + '"]'); await wait(400); }},
  {id: 'gap-words', title: 'Fill the gap (words)', save: 'knowsWell', why: 'Once a word is recognised, the choices are Chinese and pinyin.', run: async () => {
    play(); await wait(100); gapQ({who: speaker('thirsty'), t: toks('我 要 喝 水'), en: 'I want to drink some water.', gap: '喝'}); await wait(400); }},
  {id: 'shop', title: 'The shop', save: 'middle', run: async () => { play(); await wait(100); shop(speaker('boss')); await wait(200); next(); await wait(400); }},
  {id: 'big-iam', title: 'The big monkey says who he is', save: 'bigIam', why: 'In the meadow, with a ! till he has: 你好！我是大猴子。, teaching 我 (I).', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(500); }},
  {id: 'big-hello', title: 'The big monkey says hello', save: 'bigHello', why: 'In the meadow, the big monkey has nothing to ask yet: his flowers wait for chapter 1.', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(500); }},
  {id: 'hungry-asks', title: 'The hungry monkey asks for fruit', save: 'hungryNew', why: '我饿了。我要吃水果！, teaching 水果 (fruit): 吃 (eat) waits till you give him the fruit.', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(500); }},
  {id: 'hungry-fruit', title: 'He teaches 水果 (fruit)', save: 'hungryNew', why: 'Its card: just Got it (no How it’s made).', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(300); next(); await wait(400); }},
  {id: 'behind-tree', title: 'Behind a tree', save: 'middle', why: 'Its leaves cover you as you walk behind it.', run: async () => { play(); await wait(100); S.pos = {place: 'meadow', x: 12, y: 7, dir: 'left'}; placePlayer(); await wait(500); }},
  {id: 'stall', title: 'The shop owner’s stall', save: 'middle', why: 'Three squares wide, with the shop owner beside it.', run: async () => { play(); await wait(100); S.pos = {place: 'meadow', x: 9, y: 18, dir: 'up'}; placePlayer(); await wait(500); }},
  {id: 'apple-tree', title: 'The apple tree', save: 'appleTree', why: 'In the south-east, across the river, with yellow flowers nearby.', run: async () => { play(); await wait(500); }},
  {id: 'meadow-sheep', title: 'A sheep at the foot of the cliffs', save: 'bySheep', why: 'Near your stone, eating grass: 羊 (sheep), then the goat on its rock to the south, 山羊 (goat: a mountain sheep).', run: async () => { play(); await wait(500); }},
  {id: 'fruit-tree', title: 'A fruit tree teaches its fruit', save: 'fruitTree', why: 'It sparkles till you know its fruit. A at a peach tree, for the hungry monkey, picks one, teaching 桃子 (peach).', run: async () => {
    play(); await wait(100); interact(1, 6); await wait(400); }},
  {id: 'home-parts', title: 'You can read your home’s name', save: 'homeParts', why: 'Once you know 花 (flower), 山 (mountain) and 水果 (fruit), a message says so, and the sign by your stone sparkles until you read it.', run: async () => {
    play(); await wait(100); runEvents(); await wait(500); }},
  {id: 'home-name', title: 'Your home’s name', save: 'homeSign', why: 'A at the sign: 花果山, its characters as tiles with a ? on each. The next to find pulses, its box saying Tap 花 ▲; A is Next part.', run: async () => {
    play(); await wait(100); interact(11, 2); await wait(400); }},
  {id: 'home-name-two', title: 'Your home’s name: two found', save: 'homeSign', why: 'Tap a character (or press A, left to right): its box shows its picture and English, and the tile turns green with a tick. 果 isn’t a word: fruit, as in 水果, with its picture.', run: async () => {
    play(); await wait(100); interact(11, 2); await wait(300); click('.ntile[data-i="1"]'); click('.ntile[data-i="0"]'); await wait(400); }},
  {id: 'home-name-all', title: 'Your home’s name: all found', save: 'homeSign', why: 'All three: = a mountain of flowers and fruit, and A is OK.', run: async () => {
    play(); await wait(100); interact(11, 2); await wait(300); click('[data-a=ok]'); click('[data-a=ok]'); click('[data-a=ok]'); await wait(400); }},
  {id: 'wants-other', title: 'He wants the other fruit', save: 'wantsApple', why: 'After you bring the peach first.', run: async () => { play(); await wait(500); }},
  {id: 'animal-card', title: 'Meeting an animal', save: 'middle', why: 'The first time: its name on a new-word card.', run: async () => {
    play(); await wait(100); showNotice('羊', {note: 'A sheep is eating grass at the foot of the 山 (mountain). Answer its questions to make friends.'}); await wait(400); }},
  {id: 'animal-wants-to-play', title: 'It wants to play!', save: 'middle', why: 'An animal you’ve met jumps out of the grass and says 我们玩吧！ (Let’s play!), over its name, then what’s happening, as a message of its own (next screen); Play starts its questions (the first time, its card says what’s happening). So its questions never just start.', run: async () => {
    play(); await wait(100); rec('狐狸').lv = Math.max(rec('狐狸').lv || 0, 1); wildAppears(ANIMALS.find(a => a.id === 'fox')); await wait(2600); }},
  {id: 'animal-play-note', title: 'It wants to play: what to do', save: 'middle', why: 'After 我们玩吧！, what’s happening, as a message of its own; Play starts its questions.', run: async () => {
    play(); await wait(100); rec('狐狸').lv = Math.max(rec('狐狸').lv || 0, 1); wildAppears(ANIMALS.find(a => a.id === 'fox')); await wait(2400); next(); await wait(500); }},
  {id: 'encounter-listen', title: 'Animal: listen', save: 'middle', why: 'The question must never be about the animal itself.', run: async () => {
    play(); await wait(100); encounter({id: 'rabbit', hz: '兔子', img: portrait('rabbit'), wild: true}); await wait(500); }},
  {id: 'encounter-apple', title: 'Animal: with an apple to eat', save: 'withApple', why: 'Eating it takes away a wrong answer.', run: async () => {
    play(); await wait(100); encounter({id: 'rabbit', hz: '兔子', img: portrait('rabbit'), wild: true}); await wait(500); }},
  {id: 'encounter-read', title: 'Animal: read', save: 'knowsWell', run: async () => {
    play(); await wait(100); encounter({id: 'rabbit', hz: '兔子', img: portrait('rabbit'), wild: true}); await wait(500); }},
  {id: 'encounter-answered', title: 'Animal: a right answer', save: 'middle', why: 'The animal hops and a heart fills.', run: async () => {
    play(); await wait(100); const q = pictureQ; pictureQ = o => { window.__q = o; return q(o); };
    encounter({id: 'rabbit', hz: '兔子', img: portrait('rabbit'), wild: true}); await wait(300);
    click('.opt[data-i="' + __q.answerIdx + '"]'); await wait(400); }},
  {id: 'syllable-tip', title: 'A tip: one character, one syllable', save: 'goatTip', why: 'The first time a goat plays with you, just before its questions (once): 山 and 羊 wait in grey beside a drum. Each tap of the drum (or A) says the next one and lights it.', run: async () => {
    play(); await wait(100); encounter({id: 'goat', hz: '山羊', img: portrait('goat'), wild: true, home: '山'}); await wait(500); }},
  {id: 'syllable-tip-heard', title: 'The tip, tried', save: 'goatTip', why: 'Both beats heard: 2 beats you hear = 2 characters you see, and the tip. Now A is OK, and the drum plays them again.', run: async () => {
    play(); await wait(100); encounter({id: 'goat', hz: '山羊', img: portrait('goat'), wild: true, home: '山'}); await wait(400); click('.drum'); await wait(100); click('.drum'); await wait(500); }},
  {id: 'goat-read', title: 'The goat: read', save: 'knowsWell', why: 'On its cliff. Characters with pinyin, and just pictures to choose from.', run: async () => {
    play(); await wait(100); encounter({id: 'goat', hz: '山羊', img: portrait('goat'), wild: true, home: '山'}); await wait(500); }},
  {id: 'little-game', title: 'The little monkey wants to play', save: 'littleGame', why: 'Straight after it teaches 朋友 (we’re friends!), 我们玩吧！ and its word game, with 2 🐚 the first time you win (26 October 2026). Not now, and it keeps a ! till you’ve played.', run: async () => {
    play(); await wait(100); talk(npc('playful')); await wait(300); next(); await wait(500); }},
  {id: 'hungry-game', title: 'The hungry monkey wants to play', save: 'hungryGame', why: 'Straight after you tell him 没关系, 我们玩吧！ and his word game, with a 桃子 for your bag the first time you win (26 October 2026).', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(300); next(); await wait(500); }},
  {id: 'thirsty-game', title: 'The thirsty monkey’s word game', save: 'thirstyGame', why: 'Once you’ve brought him water, he wants to play a word game too, with 2 🐚 the first time you win (30 October 2026).', run: async () => {
    play(); await wait(100); runSteps([THIRSTY_GAME], 'thirsty'); await wait(500); }},
  {id: 'meadow-check', title: 'Show me the meadow’s words', save: 'meadowCheck', why: 'With all five words for the meadow learned, the old monkey checks them, as he did your first words: the rocks wait for it (30 October 2026).', run: async () => {
    play(); await wait(100); STEPS.match({match: 'Show the old monkey the meadow’s words', words: ['山', '河', '树', '鱼', '鸟'], stop: 'Not now'}); await wait(500); }},
  {id: 'word-game', title: 'The little monkey’s word game', save: 'middle', why: 'A monkey’s name plate: Chinese, pinyin and English.', run: async () => {
    play(); await wait(100); encounter({id: 'playful', hz: '猴子', img: portrait('playful'), wild: false, name: NAMES.playful}); await wait(500); }},
  {id: 'new-friend', title: 'A new friend', save: 'middle', run: async () => {
    play(); await wait(100); pictureQ = () => Promise.resolve(true); encounter({id: 'fox', hz: '狐狸', img: portrait('fox'), wild: true}); await wait(600); }},
  {id: 'animal-away', title: 'Not this time', save: 'middle', why: 'Fewer than 2 right: the animal goes back to the grass.', run: async () => {
    play(); await wait(100); let n = 0; pictureQ = () => Promise.resolve(n++ === 0); encounter({id: 'fox', hz: '狐狸', img: portrait('fox'), wild: true}); await wait(600); }},
  {id: 'troop-gathers', title: 'Chapter 1: the troop gathers', save: 'chapter1', why: 'At the waterfall, with a ! over the old monkey.', run: async () => { play(); await wait(500); }},
  {id: 'dare', title: 'The dare', save: 'chapter1', why: 'The big monkey speaks while you talk to the old monkey.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(400); }},
  {id: 'jump', title: 'Ready to jump', save: 'dared', why: 'Facing the waterfall, A says Jump. The cave is just visible behind the falling water.', run: async () => { play(); await wait(500); }},
  {id: 'jump-water', title: 'Through the waterfall', save: 'dared', why: 'A rush of falling water instead of a black fade (held still here).', run: async () => { play(); await wait(200); setInterval(() => { waterT = performance.now() - 560; }, 30); await wait(300); }},
  {id: 'jump-landed', title: 'Landed in the cave', save: 'inCave', why: 'Dripping: drops fall from your fur and a little puddle fades (held still here).', run: async () => { play(); await wait(200); setInterval(() => { dripUntil = performance.now() + 900; }, 30); await wait(300); }},
  {id: 'cave', title: 'The Water Curtain Cave', save: 'inCave', why: 'Three things sparkle: the beds, the table and the bowls (the bridge’s word waits for chapter 1).', run: async () => { play(); await wait(500); }},
  {id: 'cave-things', title: 'The troop’s things', save: 'caveTop', why: 'Beds of straw against the wall, the table, the bowls.', run: async () => { S.tips.select = S.tips.start = 1; play(); await wait(500); }},
  {id: 'set-off', title: 'Where does the water come from?', save: 'rocksGone', why: 'The troop gathers where the rocks were; you set off up the path alone.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(600); }},
  {id: 'mountain-path', title: 'The mountain path', save: 'climbing', why: 'Bushes and ledges send you through the long grass, where wild animals live.', run: async () => { play(); await wait(500); }},
  {id: 'rabbit-advice', title: 'The rabbit’s advice', save: 'climbing', why: 'Animal friends from the meadow, met on the way up: the rabbit, by the long grass.', run: async () => {
    play(); await wait(200); S.pos = {place: 'path', x: 15, y: 15, dir: 'left'}; placePlayer(); await wait(200); talk(npc('rabbit')); await wait(500); }},
  {id: 'river-fork', title: 'The fork in the river valley', save: 'valley', why: 'Over the bridge, away from the river, or along it? The sheep gives a hint.', run: async () => {
    play(); await wait(200); talk(npc('sheep')); await wait(500); }},
  {id: 'goat-play', title: 'The goat wants to play', save: 'valley', why: 'In the clearing over the first bridge (a dead end): a word game.', run: async () => {
    play(); await wait(200); S.pos = {place: 'valley', x: 19, y: 4, dir: 'up'}; placePlayer(); await wait(200); talk(npc('goat')); await wait(300); pressA(); await wait(500); }},
  {id: 'deep-mountains', title: 'Deep in the mountains', save: 'deepIn', why: 'The wild boar blocks the narrow way to the waterfall.', run: async () => { play(); await wait(500); }},
  {id: 'long-grass', title: 'In the long grass', save: 'climbing', why: 'Standing in the long grass hides your feet; a ledge above, to hop down.', run: async () => {
    play(); await wait(200); S.pos = {place: 'path', x: 8, y: 11, dir: 'up'}; placePlayer(); await wait(400); }},
  {id: 'big-stops', title: 'The big monkey stops you', save: 'settingOff', why: 'Setting off, past the big monkey in the way up: a ! pops up, you turn to face him, and he says 这是棍子。', run: async () => {
    play(); await wait(100); S.pos = {place: 'meadow', x: 15, y: 1, dir: 'up'}; placePlayer(); runEvents(); await wait(400); }},
  {id: 'stick-lesson', title: 'The big monkey gives you a stick', save: 'settingOff', why: 'Its own new-word card (the old monkey’s goodbye, 再见, came before, in another conversation), then the lesson on how to fight.', run: async () => {
    play(); await wait(100); S.pos = {place: 'meadow', x: 15, y: 1, dir: 'up'}; placePlayer(); runEvents(); await wait(1500); next(); await wait(600); }},
  {id: 'stick-held', title: 'Holding the stick', save: 'fighting', why: 'From then on your monkey holds the stick (棍子) on the map, and in its picture: small, so a longer staff can replace it later.', run: async () => {
    play(); await wait(200); S.pos = {place: 'path', x: 16, y: 16, dir: 'down'}; placePlayer(); await wait(400); }},
  {id: 'spider-meet', title: 'A spider jumps out', save: 'fighting', why: 'In the long grass on the way up, in the bee’s place (the bee moves to chapter 1): its first meeting teaches 蜘蛛.', run: async () => { play(); await wait(100); battle('spider'); await wait(600); }},
  {id: 'battle-snake', title: 'A battle: your turn', save: 'fighting', why: 'Hit, eat (a peach brings back 10 health) or run. A health bar on both sides: the snake’s full, yours 40 of 50, its number beside You.', run: async () => {
    play(); await wait(100); battle('snake'); await wait(1200); }},
  {id: 'snake-strikes', title: 'A battle: dodging', save: 'fighting', why: 'The snake strikes: hear where from, and pick it to jump aside.', run: async () => {
    play(); await wait(100); const q = pictureQ; pictureQ = o => { window.__q = o; return q(o); };
    battle('snake'); await wait(1200); click('.act[data-act=hit]'); await wait(300);
    click('.opt[data-i="' + __q.answerIdx + '"]'); await wait(200); click('[data-a=next]'); await wait(600); }},
  {id: 'battle-apple', title: 'A battle: an apple helps', save: 'fighting', why: 'Under any question, an apple takes away a wrong answer, without using your turn.', run: async () => {
    play(); await wait(100); battle('snake'); await wait(1200); click('.act[data-act=hit]'); await wait(500); }},
  {id: 'snake-struck-from', title: 'A battle: where it struck from', save: 'fighting', why: 'It hid, then struck from where you heard: that picture is beside you, and you jumped aside.', run: async () => {
    play(); await wait(100); const q = pictureQ; pictureQ = o => { window.__q = o; return q(o); };
    battle('snake'); await wait(1200); click('.act[data-act=hit]'); await wait(300); click('.opt[data-i="' + __q.answerIdx + '"]'); await wait(200); click('[data-a=next]'); await wait(900);
    click('.opt[data-i="' + __q.answerIdx + '"]'); await wait(1500); }},
  {id: 'battle-boar', title: 'The wild boar', save: 'fighting', why: 'A big enemy: no running away.', run: async () => {
    play(); await wait(100); S.w['野猪'] = {lv: 1, due: 0, ok: 0}; battle('boar'); await wait(1200); }},
  {id: 'hurt-map', title: 'Hurt: your health on the map', save: 'hurt', why: 'While you’re hurt, your health shows at the top left: a bar (yellow, under half) and its number, 20/50. Full again, it goes.', run: async () => { play(); await wait(300); }},
  {id: 'hurt', title: 'Hurt: your health, and resting', save: 'hurt', why: 'Your health shows while you’re hurt (a bar, with its number); the old monkey lets you rest.', run: async () => {
    play(); await wait(300); talk(npc('elder')); await wait(600); }},
  {id: 'path-top', title: 'The top of the path', save: 'atTheTop', why: 'Facing the waterfall: where the river comes from.', run: async () => { play(); await wait(500); }},
  {id: 'waterfall-found', title: 'Found it!', save: 'atTheTop', why: 'The waterfall teaches 瀑布, then: go back and tell the troop.', run: async () => { play(); await wait(100); pressA(); await wait(600); }},
  {id: 'goat-stops', title: 'A goat stops you', save: 'foundFall', why: 'Walking down from the waterfall, past the goat beside the narrow way: a ! pops up, you turn to face it, and it says hello.', run: async () => {
    play(); await wait(100); S.pos = {place: 'falls', x: 7, y: 4, dir: 'down'}; placePlayer(); runEvents(); await wait(400); }},
  {id: 'goat-tip', title: 'Hop down the ledges', save: 'foundFall', why: 'The goat’s tip for the way down (once; talk to it again for a reminder).', run: async () => {
    play(); await wait(100); S.pos = {place: 'falls', x: 7, y: 4, dir: 'down'}; placePlayer(); runEvents(); await wait(1300); next(); await wait(200); next(); await wait(300); next(); await wait(500); }},
  {id: 'troop-follows', title: 'The troop follows you', save: 'leading', why: 'Like Pikachu in Pokémon Yellow: the little monkey, the big monkey and the old monkey, in line, each stepping into the square the one ahead has left.', run: async () => {
    play(); await wait(200);
    for (const d of ['up', 'up', 'up', 'up', 'left', 'left']){ pl.dir = d; tryStep(d, performance.now()); await wait(450); }
    await wait(300); }},
  {id: 'troop-arrives', title: 'The troop is up at the waterfall', save: 'leading', why: 'Out of the narrow way: they leap past you to their places by the waterfall.', run: async () => {
    play(); await wait(200); S.pos = {place: 'falls', x: 7, y: 3, dir: 'up'}; placePlayer(); pl.dir = 'up'; tryStep('up', performance.now()); await wait(1500); }},
  {id: 'tablet', title: 'The stone tablet', save: 'inCave', run: async () => { play(); await wait(100); ACTIONS.sign(LEGEND.L); await wait(400); }},
  {id: 'tell', title: 'Telling the old monkey', save: 'explored', why: 'Your answer: fill the gap.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(400); }},
  {id: 'led-in', title: 'The troop follows you in', save: 'ledIn', why: 'In the cave, with a ! over the old monkey.', run: async () => { play(); await wait(500); }},
  {id: 'home', title: 'Our home', save: 'ledIn', why: 'The old monkey teaches 家.', run: async () => { play(); await wait(100); talk(npc('elder')); await wait(400); }},
  {id: 'sounds-drink', title: 'Same sound, different tone', save: 'middle', why: 'Catching 喝 hē after 河 hé: after How it’s made, Sounds like ▸ shows the two side by side, each with how its tone moves; Hear both says one, then the other.', run: async () => {
    play(); await wait(100); S.w['喝'] = {lv: 0, due: 0, ok: 0}; showNotice('喝', {quiet: true}); await wait(200); click('[data-a=made]'); await wait(200); click('#sheet .primary'); await wait(400); }},
  {id: 'sounds-deer', title: 'Sounds the same', save: 'middle', why: 'Catching 鹿 lù after 路 lù: straight to Sounds like ▸, and they sound exactly the same.', run: async () => {
    play(); await wait(100); S.w['路'] = {lv: 1, due: 0, ok: 0}; showNotice('鹿', {quiet: true}); await wait(200); click('#sheet .primary'); await wait(400); }},
  {id: 'made-king', title: 'You are our king', save: 'toBeKing', why: 'The big monkey teaches 王.', run: async () => { play(); await wait(100); talk(npc('big')); await wait(400); }},
  // becoming king, the scene that ends the prologue: each screen is held where it waits for Next (introClock: just after
  // its caption's time, in scenes.becomingKing; advancedTo: which caption)
  {id: 'becoming-king-home', title: 'The troop is home', save: 'home', why: 'The scene that ends the prologue, told like the opening: the troop gathers round you by the high stone seat in the cave.', run: async () => {
    play(); await wait(100); storyScene('becomingKing'); introClock = .05; advancedTo = 0; await wait(400); }},
  {id: 'becoming-king-bow', title: 'You are our king!', save: 'home', why: 'The troop bows, one after another, and calls you their king (王 in bold green). As in the book, no crown.', run: async () => {
    play(); await wait(100); storyScene('becomingKing'); introClock = 5.55; advancedTo = 2; await wait(400); }},
  {id: 'becoming-king-seat', title: 'Handsome Monkey King!', save: 'home', why: 'You climb up onto the high stone seat (in the book, 高登王位), with sparkles, and take the name 美猴王.', run: async () => {
    play(); await wait(100); storyScene('becomingKing'); introClock = 8.05; advancedTo = 3; await wait(400); }},
  {id: 'becoming-king-dusk', title: 'Happy ever after', save: 'home', why: 'Outside, the sun sets on Flower Fruit Mountain, with the troop at home on top; then night, and fireflies.', run: async () => {
    play(); await wait(100); storyScene('becomingKing'); introClock = 11.05; advancedTo = 4; await wait(400); }},
  {id: 'chapter1-start', title: 'Chapter 1 begins', save: 'chapterOne', why: 'The old monkey: 我们有家了！ (We have a home now!), then he follows you to the troop’s new home ground.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(600); }},
  {id: 'way-to-home', title: 'The way to the home ground', save: 'toHomeGround', why: 'Beside the waterfall, the bushes are cleared: a path to the home ground, with the old monkey following you.', run: async () => {
    play(); await wait(500); }},
  {id: 'home-ground', title: 'The home ground (家园)', save: 'homeGround', why: 'Chapter 1’s settlement when you first come: wide, open ground, before anyone has marked anything out; the ways out shut by bushes.', run: async () => {
    play(); await wait(500); }},
  {id: 'big-asks', title: 'Wood and small stones', save: 'bigAsks', why: 'The big monkey, building the school: 我们要木头和小石头！ (木头 wood is just for listening until you find some).', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(600); }},
  {id: 'mark-out', title: 'Marking out the school’s plot', save: 'bigAsks', why: 'Then, as you watch, he marks out the school’s plot beside him: a stake hammered in at each corner (tock), the string pulled tight round them, then the ground cleared, with its sign and the path up to it.', run: async () => {
    play(); await wait(100); const was = mapLooks(); Object.assign(here(), {build: 1}); marking = {...markingOf(was), hold: 1400}; await wait(300); }},
  {id: 'plot-sign', title: 'The school’s sign', save: 'pineFirst', why: 'Put up when its plot is marked out: what the troop will build there.', run: async () => {
    play(); await wait(100); S.pos = {place: 'homeGround', x: 6, y: 4, dir: 'up'}; placePlayer(); await wait(200); pressA(); await wait(400); }},
  {id: 'pine-wood', title: 'The pine wood (松林)', save: 'pineWood', why: 'Up from the home ground, in at the bottom: the way leads up to the squirrel’s clearing, where the ways part. Three dry, dead pines that sparkle (knock them down with your stick) and three small stones are hidden around the wood, with long grass on every way to them.', run: async () => {
    play(); await wait(500); }},
  {id: 'hillside', title: 'The hillside (山坡): the foot', save: 'hillside', why: 'Up from the home ground, on the way to the pine wood, a walk of about 90 steps winding up in three parts. At the foot, a slope of flowers, a brook you cross on stepping stones, and a hedge whose gap long grass has grown over: you can’t go round it (snakes and spiders, and now and then a wolf), practising words you know.', run: async () => {
    play(); await wait(500); }},
  {id: 'trainee', title: 'A little monkey in training', save: 'byTrainee', why: 'By the stepping stones: practising with a stick like yours, facing its own way and swinging it now and then (here, mid-swing), with a swish as you come near. A ! until it has stopped you.', run: async () => {
    play(); await wait(100); swingStart = (n, now) => now - SWING_MS * .4; await wait(400); }},
  {id: 'trainee-stops', title: 'It stops you for a word game', save: 'byTrainee', why: 'The first time you pass, like a trainer in Pokémon: a ! pops up, you turn to face it, and it says 你好！ Then, after your reply, that it wants to be like you, its king, and 我们玩吧！ (Let’s play!).', run: async () => {
    play(); await wait(100); S.pos = {place: 'hillside', x: 19, y: 37, dir: 'up'}; placePlayer(); arrive(19, 37).then(runEvents); await wait(1600); }},
  {id: 'gift-kept', title: 'Your bag is full', save: 'bagFull', why: 'Win its word game with 3 peaches in your bag: it offers you its 桃子, keeps it for you, and your thanks waits (Done), till you come back with room, when it has a ! for you.', run: async () => {
    play(); await wait(100); talkingTo = 'trainee2'; STEPS.bag(AREA.talk.trainee2[1].do[1].wordGame.win.find(s => s.bag), 'trainee2', false, true); await wait(500); }},
  {id: 'trainee-game', title: 'Its word game', save: 'byTrainee', why: 'Its name plate: 猴子 hóuzi, Monkey, as the troop are called. Win, and it gives you 3 🐚 (the one on the middle terrace, a 桃子 for your bag), the first time.', run: async () => {
    play(); await wait(100); encounter({id: 'trainee1', hz: '猴子', img: portrait('trainee1'), wild: false, name: NAMES.trainee1}); await wait(500); }},
  {id: 'trainee-practice', title: 'Just for practice', save: 'traineeDone', why: 'Once you’ve won its present: no ! over it, and its games are just for practice, earning nothing, not even a 🐚 for each right answer.', run: async () => {
    play(); await wait(100); talk(npc('trainee1')); await wait(300); next(); await wait(500); }},
  {id: 'hidden-glint', title: 'Something hidden', save: 'byHidden', why: 'Three piles of shells and two apples are hidden on the hillside, at trees, a boulder and a pine. A tiny glint gives each away now and then, easy to miss (here, at the tree below you, held still).', run: async () => {
    play(); await wait(100); glintsNow = () => [[22, 39, 1]]; await wait(400); }},
  {id: 'hidden-found', title: 'Found it!', save: 'byHidden', why: 'A at it: 2 🐚 (or an apple for your bag), once.', run: async () => {
    play(); await wait(100); interact(22, 39); clearTimeout(msgT); await wait(400); }},   // (the message held)
  {id: 'hillside-steps', title: 'The way up the hillside', save: 'hillsideFoot', why: 'At the foot of the cliff, the stone steps, with the way to them clear: the little monkeys’ tower is at the home ground now.', run: async () => {
    S.tasksSeen = Object.fromEntries(getTasks().map(t => [t.id, 1])); play(); await wait(500); }},
  {id: 'tower', title: 'Building a tower of stones', save: 'byTower', why: 'At the home ground, just past the way up to the hillside (by the hillside’s stone steps till 24 October 2026, where they crowded the way up), two little monkeys pile stones into a tower, taking turns, as high as it will go (here, a stone on its way up), with a little clack as each goes on (in the book, chapter 1: 砌宝塔, they build pagodas).', run: async () => {
    S.tasksSeen = Object.fromEntries(getTasks().map(t => [t.id, 1])); play(); await wait(100); towerAt = () => ({h: 5, phase: 'build', k: .3, stones: 3, carried: 3, by: 1, lift: .55}); await wait(400); }},
  {id: 'tower-falls', title: 'Crash!', save: 'byTower', why: 'Then it sways, and falls, the stones tumbling down round it with a clatter (here, falling); the monkeys jump back, then jump about laughing, gather the stones up and start again.', run: async () => {
    S.tasksSeen = Object.fromEntries(getTasks().map(t => [t.id, 1])); play(); await wait(100); towerAt = () => ({h: 6, phase: 'fall', k: .45, stones: 6, carried: null}); await wait(400); }},
  {id: 'tower-hello', title: 'One, two, three!', save: 'byTower', why: 'Talk to them: 你好！ and your reply, then a message, and while you only know 一, 二 and 三, they count the stones as they put them on: 一，二，三！, and you can come back once you know more numbers.', run: async () => {
    play(); await wait(100); here().tower = 1; talk(NPCS.find(n => n.id === 'towerR')); await wait(900); }},
  {id: 'tower-count', title: 'How many stones?', save: 'towerCounts', why: 'Once you know more numbers (from 四, at school): 我们玩吧！, then three counting questions, as in a number lesson, about the stones in their tower: 这里有几个石头？ (How many stones are there?). Each right answer earns a 🐚 if that number needs practice.', run: async () => {
    play(); await wait(100); countQ({who: 'towerL', thing: AREA.countGames.tower.thing, n: 5}); await wait(500); }},
  {id: 'tower-count-new', title: 'Which tower has 六?', save: 'towerCounts', why: 'While a number is new, you hear it and choose the tower with that many stones: six, five and four, four to a row at most, still fitting a small phone.', run: async () => {
    play(); await wait(100); rec('六').lv = 1; countQ({who: 'towerL', thing: AREA.countGames.tower.thing, n: 6}); await wait(500); }},
  {id: 'brook', title: 'By the brook', save: 'byBrook', why: 'Dragonflies dart about over the brook, hovering, then darting off; on the bank, a little monkey leaps at one, turning to follow it, but it darts away just out of reach; and at the brook’s end, two little monkeys in the water splash each other, taking turns, the other ducking (in the book, chapter 1: 赶蜻蜓, they chase dragonflies, and 绿水涧边随洗濯, they wash by the green stream).', run: async () => {
    S.tasksSeen = Object.fromEntries(getTasks().map(t => [t.id, 1])); play(); await wait(100); splashAt = () => ({n: 1, by: 0, k: .45}); await wait(300); }},
  {id: 'brook-chase', title: 'Too quick!', save: 'byBrook', why: 'The little monkey mid-leap, the dragonfly just out of reach. Talk to it: 你好！, your reply, and a message: the dragonfly is far too quick for it!', run: async () => {
    S.tasksSeen = Object.fromEntries(getTasks().map(t => [t.id, 1])); play(); await wait(100); chaseLeap = () => 1; chasedAt = n => ({x: n.x*T + 15, y: n.y*T - 9, left: false}); await wait(300); }},
  {id: 'brook-splash', title: 'We’re playing in the water!', save: 'bySplashers', why: 'Say hello to the little monkeys splashing in the brook: 你好！, your reply, then 我们在玩水！ (We’re playing in the water!).', run: async () => {
    play(); await wait(100); talk(NPCS.find(n => n.id === 'splash1')); await wait(200); document.querySelector('[data-a=next]')?.click(); await wait(900); }},
  {id: 'groom', title: 'Grooming', save: 'byGroomers', why: 'At the home ground, east of the way down to the bridge, under the tree below the pool, away from the garden (under the hillside’s first pines till 24 October 2026, then by the garden till 30 October 2026), two little monkeys groom each other, taking turns: both sit side-on, facing the same way, one behind the other; the one behind has its hands in the fur of its friend’s back, picking through it, its head dipping in, now and then a hand to its mouth (a flea!), while the one in front sits with its eyes shut (in the book, chapter 1: 捉虱子…理毛衣, they pick out fleas and tidy their fur).', run: async () => {
    S.tasksSeen = Object.fromEntries(getTasks().map(t => [t.id, 1])); play(); await wait(400); }},
  {id: 'groom-hello', title: 'We are friends!', save: 'byGroomers', why: 'Say hello: 你好！, your reply, then 我们是朋友！ (We are friends!) and a message: they take turns to groom each other, as monkeys do with their friends.', run: async () => {
    play(); await wait(100); talk(NPCS.find(n => n.id === 'groomA')); await wait(200); document.querySelector('[data-a=next]')?.click(); await wait(900); }},
  {id: 'hillside-lookout', title: 'The hillside: the steep middle', save: 'hillsideLookout', why: 'Three terraces, each a level higher than the last: cliffs between them, as high all along, with the ground above coming to their edge and their shadow below, stone steps zig-zagging up them, and grassy banks to hop down (the quicker way back). Long grass right across the lowest terrace, tall grass where your friends hide, and a lookout on the middle one: a flat rock at the top of the cliff, with a railing.', run: async () => {
    play(); await wait(500); }},
  {id: 'lookout-goat', title: 'Come and take a look!', save: 'hillsideGoat', why: 'Coming up the steps beside the lookout the first time, a goat on it stops you (a ! over it, then it talks): 你好！, then 来看看！ Wherever there’s something you might miss, a goat is there to tell you, as below the waterfall.', run: async () => {
    play(); await wait(100); S.pos = {place: 'hillside', x: 19, y: 21, dir: 'up'}; placePlayer(); arrive(19, 21).then(runEvents); await wait(2200); }},
  {id: 'lookout-lead', title: 'The goat walks you to the railing', save: 'hillsideGoat', why: 'Then it walks along the railing, and you after it, a step at a time, to look out: the view plays, and a message says what a lookout is (the first time only: a player told about it walked on without seeing it).', run: async () => {
    S.tasksSeen = Object.fromEntries(getTasks().map(t => [t.id, 1])); play(); await wait(100); S.pos = {place: 'hillside', x: 19, y: 21, dir: 'right'}; placePlayer();
    STEPS.leadTo({leadTo: [22, 21], you: [21, 21, 'down']}, 'lookoutGoat'); await wait(STEP * 1.5); }},
  {id: 'lookout-view', title: 'The view from the lookout', save: 'hillsideLookout', why: 'A at the lookout’s railing: what you can see, told like the opening (a far view is a picture, never part of the map): the hillside going down, the river winding out to the sea, islands far off, and you at the railing. 这里很好看！ (It’s lovely up here!)', run: async () => {
    play(); await wait(100); storyScene('lookout'); introClock = .8; advancedTo = 0; await wait(400); }},
  {id: 'lookout-sea', title: 'The sea is so big!', save: 'hillsideLookout', why: 'Then 海很大！: nothing new, just words you’ve heard (海, sea, in the opening).', run: async () => {
    play(); await wait(100); storyScene('lookout'); introClock = 3.6; advancedTo = 1; await wait(400); }},
  {id: 'hillside-top', title: 'The hillside: under the first pines', save: 'hillsideTop', why: 'Mushrooms, long grass grown over the way under the pines, and a stone archway with the pine wood’s name, 松林, on its board: the way into the wood.', run: async () => {
    play(); await wait(500); }},
  {id: 'mushroom-monkey', title: 'Looking for mushrooms', save: 'byMushrooms', why: 'At the top of the hillside, on the way up to the pine wood: a little monkey looking for mushrooms under the pines, facing them, crouching now and then to look closely, with a ! the first time.', run: async () => {
    play(); await wait(600); }},
  {id: 'mushroom-hello', title: '我在找蘑菇。', save: 'byMushrooms', why: 'Talking to it: 你好！ and your reply, then 我在找蘑菇。 (I’m looking for mushrooms.), teaching 蘑菇 if you haven’t looked at the mushrooms yet; then its word game, with 蘑菇 among the questions.', run: async () => {
    play(); await wait(100); talk(npc('mushroomer')); await wait(400);
    for (let i = 0; i < 8 && !/蘑菇/.test(document.querySelector('#talk').textContent); i++){ const p = !modal.hidden && [...sheet.querySelectorAll('.primary')].find(x => !x.hidden && !x.disabled); if (p) p.click(); else next(); await wait(500); } await wait(300); }},
  {id: 'pine-wood-first', title: 'Into the pine wood', save: 'pineFirst', why: 'The first time you go in: gloomy under the thick pines (but in the daytime: sunbeams, never night), with mist, and a wolf howling far off.', run: async () => {
    play(); await wait(100); arrive(12, 0).then(runEvents); await wait(1500); }},
  {id: 'pine-wood-meadow', title: 'Long grass, below the bridge', save: 'pineMeadow', why: 'A meadow of long grass right across the way to the only bridge over the stream: wolves, snakes and spiders jump out of it.', run: async () => {
    play(); await wait(500); }},
  {id: 'pine-wood-deer', title: 'The sunny glade', save: 'pineDeer', why: 'Behind the cracked rock: a sunny glade with white flowers, the last dead pine and stone, and a deer, chapter 1’s animal to find. It’s in the way: face it and press A to meet it.', run: async () => {
    play(); await wait(500); }},
  {id: 'deer-meet', title: 'A deer', save: 'pineDeer', why: 'Its first meeting teaches 鹿 (lù, deer), said straight away; then its questions, to make friends.', run: async () => {
    play(); await wait(100); pressA(); await wait(1600); }},
  {id: 'deer-question', title: 'The deer asks', save: 'pineDeer', why: 'Its questions, as the other animals ask them, on the grass of its clearing.', run: async () => {
    play(); await wait(100); S.w['鹿'] = {lv: 1, due: 0, ok: 0}; encounter({id: 'deer', hz: '鹿', img: portrait('deer'), wild: true, home: '草'}); await wait(500); }},
  {id: 'wolf-meet', title: 'A wolf jumps out', save: 'pineWood', why: 'Out of the long grass in the pine wood: its first meeting teaches 狼 (láng, wolf).', run: async () => {
    play(); await wait(100); battle('wolf'); await wait(600); }},
  {id: 'battle-wolf-read', title: 'A battle in the pine wood: read it', save: 'pineKnowsWell', why: 'Among the pines, with the pine wood’s own battle song. A word you know well to read, beside the question and above the answers.', run: async () => {
    play(); await wait(100); S.w['狼'] = {lv: 1, due: 0, ok: 0}; battle('wolf'); await wait(700); click('[data-act=hit]'); await wait(700); }},
  {id: 'battle-wolf', title: 'A battle with a wolf', save: 'pineWood', why: '30 health (three hits): tougher than a snake or a spider, not as tough as the wild boar, and you can run away.', run: async () => {
    play(); await wait(100); S.w['狼'] = {lv: 1, due: 0, ok: 0}; battle('wolf'); await wait(1200); }},
  {id: 'pine-wood-later', title: 'The cracked rock, broken', save: 'pineWoodLater', why: 'Part-way through: two dead pines are stumps now, a stone picked up, and the rock broken, opening the way into the sunny glade, with the last dead pine and stone.', run: async () => {
    play(); await wait(500); }},
  {id: 'first-wood', title: 'Down comes the dry pine', save: 'pineWood', why: 'Hit a dead pine with your stick: it comes down, and you find 木头 (wood), said aloud.', run: async () => {
    play(); await wait(100); S.pos = {place: 'pineWood', x: 2, y: 19, dir: 'up'}; placePlayer(); await wait(200); pressA(); await wait(1200); }},
  {id: 'school-frame', title: 'The school’s frame (an older game)', save: 'schoolFrame', why: 'A game saved with just the frame up, before version 191, keeps it until you talk to the big monkey: now the frame goes up in the scene of building the school.', run: async () => {
    play(); await wait(500); }},
  {id: 'build-school', title: 'Let’s build the school!', save: 'schoolFrame', why: 'The big monkey, as soon as you bring him the wood and stones: 我们来盖学校吧！', run: async () => {
    play(); await wait(100); S.pos = {place: 'homeGround', x: 15, y: 5, dir: 'up'}; placePlayer(); talk(npc('big')); await wait(600); }},
  {id: 'building-frame', title: 'The frame goes up', save: 'schoolFrame', why: 'The troop building the school starts on the bare plot: two monkeys carry in the wood, and the frame goes up, the footing first, then post by post, with hammering.', run: async () => {
    play(); await wait(100); storyScene('buildingSchool'); introClock = 1.9; advancedTo = 0; await wait(150); }},
  {id: 'building-walls', title: 'One, two, three!', save: 'schoolFrame', why: 'The troop building the school, told like the opening: the walls go up, plank by plank, with the troop hammering.', run: async () => {
    play(); await wait(100); storyScene('buildingSchool'); introClock = 4.6; advancedTo = 1; await wait(400); }},
  {id: 'building-roof', title: 'The roof goes on', save: 'schoolFrame', why: 'Then the grey tiled roof, row by row.', run: async () => {
    play(); await wait(100); storyScene('buildingSchool'); introClock = 7.6; advancedTo = 2; await wait(400); }},
  {id: 'building-done', title: 'This is our school!', save: 'schoolFrame', why: 'The sign and the lanterns go up, and the troop jumps for joy: 这是我们的学校！ teaches 学校.', run: async () => {
    play(); await wait(100); storyScene('buildingSchool'); introClock = 9.6; advancedTo = 3; await wait(400); }},
  {id: 'school-built', title: 'The school (学校)', save: 'schoolBuilt', why: 'The school stands on its plot, bare wood, with paper lanterns and a grey step: walk in through its door.', run: async () => {
    play(); await wait(500); }},
  {id: 'class-greets', title: 'Hello, teacher!', save: 'schoolBuilt', why: 'The first time you talk to the old monkey at school, the class greets him: 老师好！ teaches 老师.', run: async () => {
    play(); await wait(100); S.pos = {place: 'school', x: 7, y: 3, dir: 'up'}; placePlayer(); talk(npc('elder')); await wait(300); next(); await wait(300); next(); await wait(500); }},
  {id: 'classroom', title: 'The classroom', save: 'classroom', why: 'Inside the school: the blackboard, the teacher’s table, double desks, and the troop at them.', run: async () => {
    play(); await wait(500); }},
  {id: 'number-lesson', title: 'The timetable: the first lessons', save: 'numbersNew', why: 'Talk to the teacher: 上课！, then the timetable (课程表, 28 October 2026), on Maths, its first lesson ready (⭐), the rest locked. The first teaches three, 四 五 六, one after another (the school’s first lessons are the one exception to one new word at a time). A ⭐ on Art: its first lesson is ready too.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(500); }},
  {id: 'teacher-counts', title: 'One, two, three, four!', save: 'numbersNew', why: 'Start lesson 1: the teacher counts peaches onto his table, teaching 四 (bold).', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(300); click('[data-a=ok]'); await wait(500); }},
  {id: 'lesson-bar', title: 'Maths · Lesson 1', save: 'numbersNew', why: 'Every card in a lesson says which: 数学 shùxué Maths · Lesson 1, over 四’s card, and over its questions.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(300); click('[data-a=ok]'); await wait(400); next(); await wait(600); }},
  {id: 'teacher-five', title: 'One, two, three, four, five!', save: 'numbersNew', why: 'In the first lesson, after three questions on 四, he counts on to 五 (bold), then its card and three questions, then the same for 六, then two mixed.', run: async () => {
    play(); await wait(100); rec('四').lv = 1; showDialog(speaker('elder'), L[AREA.lessons[0].teach['五']], {teach: '五'}); await wait(500); }},
  {id: 'count-bar', title: 'Which has 四? (in a lesson)', save: 'numbersNew', why: 'A counting question in Maths lesson 1, its name over it, still fitting a small phone.', run: async () => {
    play(); await wait(100); lessonBar = `${subjectName(AREA.lessons[0])} · Lesson 1`; countQ({who: 'elder', thing: AREA.lessons[0].things[0], n: 4}); lessonBar = null; await wait(500); }},
  {id: 'count-new', title: 'Which has 四?', save: 'numbersNew', why: 'A counting question while 四 is new: you hear it, and choose the one with that many peaches, each with its characters. Never a picture of a number, such as a die: you could count its dots.', run: async () => {
    play(); await wait(100); countQ({who: 'elder', thing: AREA.lessons[0].things[0], n: 4}); await wait(500); }},
  {id: 'count-six', title: 'Which has 六?', save: 'numbersLater', why: 'While 六 is new: six apples beside five and four, the tables all the same size, so the things are too.', run: async () => {
    play(); await wait(100); rec('六').lv = 1; countQ({who: 'elder', thing: AREA.lessons[0].things[1], n: 6}); await wait(500); }},
  {id: 'count-apples', title: 'How many apples?', save: 'numbersLater', why: 'Later: the numbers you know, in characters with pinyin, the nearest to the right one, so you have to count.', run: async () => {
    play(); await wait(100); countQ({who: 'elder', thing: AREA.lessons[0].things[1], n: 6}); await wait(500); }},
  {id: 'count-monkeys', title: 'How many monkeys?', save: 'numbersLater', why: 'Things that are alive are counted on the grass, with 只: 这里有几只猴子？', run: async () => {
    play(); await wait(100); countQ({who: 'elder', thing: AREA.lessons[0].things[3], n: 5}); await wait(500); }},
  {id: 'count-ten', title: 'Which has 十?', save: 'numbersTen', why: 'Ten, the most there are, while 十 is new: ten, nine and eight birds, two rows of five each, answered (the right one, and each answer’s pinyin), still fitting a small phone.', run: async () => {
    play(); await wait(100); countQ({who: 'elder', thing: AREA.lessons[0].things[5], n: 10}); await wait(400); [...document.querySelectorAll('.opt')].find(b => b.textContent.includes('十')).click(); await wait(500); }},
  {id: 'colour-lesson', title: 'The timetable: Art', save: 'coloursNew', why: 'With every Maths lesson done (✓ on its tab), the timetable opens on Art, its first lesson ready: three new colours, 红色 黄色 白色, one after another.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(500); }},
  {id: 'teacher-paint', title: 'This is red.', save: 'coloursNew', why: 'The teacher opens a pot of paint, teaching 红色 (bold): red, yellow and white come first.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(300); click('[data-a=ok]'); await wait(500); }},
  {id: 'paint-first', title: 'The first colour', save: 'coloursNew', why: 'While 红色 is the only colour you know, the other answers are things you know: Which is it?', run: async () => {
    play(); await wait(100); rec('红色').lv = 1; colourQ({who: 'elder', w: '红色'}); await wait(600); }},
  {id: 'paint-yellow', title: 'The second colour', save: 'coloursNew', why: 'In the first lesson, after three questions on 红色, the teacher opens a pot of 黄色: with one other colour known, the answers are 黄色, 红色 and a thing you know.', run: async () => {
    play(); await wait(100); rec('红色').lv = 1; rec('黄色').lv = 1; colourQ({who: 'elder', w: '黄色'}); await wait(600); }},
  {id: 'painting-lanterns', title: 'Painting the lanterns', save: 'coloursNew', why: 'The first colour lesson ends with the class painting the paper lanterns 红色 (red).', run: async () => {
    play(); await wait(100); rec('红色').lv = 1; storyScene('paintLanterns'); await wait(2300); }},
  {id: 'painted-lanterns', title: 'The lanterns are red!', save: 'coloursRed', why: 'Then (Next) the troop jumps for joy, and the newly painted lanterns sparkle. The other colours paint nothing: the rest of the school stays as it was built.', run: async () => {
    play(); await wait(100); storyScene('paintLanterns'); await wait(4600); click('#nextBtn'); await wait(900); }},
  {id: 'paint-new', title: 'Which paint?', save: 'coloursThree', why: 'A colour question while 黑色 is new: hear it, and choose from paints with their characters (colours you know).', run: async () => {
    play(); await wait(100); rec('黑色').lv = 1; colourQ({who: 'elder', w: '黑色'}); await wait(600); }},
  {id: 'paint-read', title: 'Which paint? (reading)', save: 'coloursLater', why: 'Once 黑色 is recognised: read it, and choose from the paints alone.', run: async () => {
    play(); await wait(100); colourQ({who: 'elder', w: '黑色'}); await wait(500); }},
  {id: 'school-colours', title: 'The school, its lanterns red', save: 'schoolHalf', why: 'Red paints its lanterns; the rest of it stays as it was built, wood and grey tiles, however many colours you know.', run: async () => { play(); await wait(500); }},
  {id: 'lanterns-look', title: 'The lanterns are red', save: 'byLanterns', why: 'A at a lantern, at the school’s front corners: the 红色 (red) card again, with what they are.', run: async () => {
    play(); await wait(100); interact(8, 4); await wait(500); }},
  {id: 'school-painted', title: 'Every colour learned', save: 'schoolPainted', why: 'All nine colours, and the school still as it was built, with its red lanterns.', run: async () => { play(); await wait(500); }},
  {id: 'flowers-ask', title: 'The school looks lovely!', save: 'flowersAsk', why: 'Once the first colour lesson has taught you red, yellow and white, the big monkey has a ! (a side quest): 学校很好看！ (好看 just for listening), then 我们来种花吧！ (Let’s plant some flowers!).', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(500); }},
  {id: 'flowers-want', title: 'Red, yellow and white flowers', save: 'flowersAsk', why: 'Then he asks for one of each of the first colours you learned, to plant in front of the school.', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(300); next(); await wait(300); next(); await wait(500); }},
  {id: 'picked-red', title: 'A red flower', save: 'flowersPicking', why: 'Each flower you pick shows what it is, with its own picture: 红色的花 (a red flower), said aloud, and how many you have.', run: async () => {
    play(); await wait(200); interact(...facing()); await wait(600); }},
  {id: 'planting', title: 'Planting the flowers', save: 'flowersBack', why: 'Bring them to the big monkey, and he plants them in front of the school as you watch: each square of the beds comes up out of the ground in turn, with a little pop.', run: async () => {
    play(); await wait(100); const was = mapLooks(); Object.assign(here(), {flowers: 'done', schoolFlowers: true}); marking = {...markingOf(was), grow: true, hold: 900}; await wait(300); }},
  {id: 'school-flowers', title: 'Flowers in front of the school', save: 'flowersPlanted', why: 'Red, yellow and white, either side of the path up to the door: the flowers you picked.', run: async () => { play(); await wait(500); }},
  {id: 'flower-look', title: 'A red flower, again', save: 'flowerLook', why: 'Each square of flowers is all one colour: A at one whose colour you know shows it, 红色的花 (a red flower), said aloud, any time (they went back to being 花 after the big monkey’s).', run: async () => {
    play(); await wait(200); interact(...facing()); await wait(600); }},
  {id: 'hillside-flowers', title: 'The hillside’s flowers', save: 'hillsideFlowers', why: 'The slope of flowers at the foot of the hillside, each square one colour: red, yellow, white, pink, blue and orange.', run: async () => {
    play(); await wait(500); }},
  {id: 'flower-look-new', title: 'A blue 花', save: 'riverFlower', why: 'A blue flower on the riverside, before you know blue (蓝色): its card says 花, with a blue flower, so it’s the colour you looked at.', run: async () => {
    play(); await wait(200); interact(...facing()); await wait(600); }},
  {id: 'birds', title: 'Coloured birds', save: 'birdWatch', why: 'Once you know 鸟 (bird), each little bird that lands near you is one colour: red, yellow, blue, white, black, green, brown, orange or pink (till then they’re all blue, as 鸟’s own picture).', run: async () => {
    play(); await wait(100); nextBird = 1e15; birds.length = 0;
    [[8, 11, '红色'], [9, 15, '黄色'], [6, 14, '棕色'], [14, 16, '绿色'], [4, 12, '黑色'], [10, 17, '白色']].forEach(([x, y, colour]) => birds.push({tx:x, ty:y, x:x*T + 4, y:y*T + 6, t0:-1e9, until:1e15, from:1, colour}));
    await wait(400); }},
  {id: 'bird-look', title: 'A yellow bird', save: 'birdWatch', why: 'A at a bird whose colour you know shows it, 黄色的鸟 (a yellow bird), with its own picture, said aloud; before you know its colour, 鸟’s card, with a yellow bird.', run: async () => {
    play(); await wait(100); nextBird = 1e15; birds.length = 0; birds.push({tx:12, ty:14, x:12*T + 4, y:14*T + 6, t0:-1e9, until:1e15, from:1, colour:'黄色'});
    S.pos = {place:'homeGround', x:12, y:13, dir:'down'}; placePlayer(); await wait(100); interact(12, 14); await wait(600); }},
  {id: 'feast-news', title: 'We have a home, and a school too!', save: 'feastNews', why: 'After the first two lessons, the old monkey has news before any lesson: 我们有家，也有学校！, teaching 有 (bold). It’s time for a great feast!', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(500); }},
  {id: 'you-card', title: '有, to have', save: 'feastNews', why: 'Its card, with no picture, like 要: Use 有 to say what you have.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(500); }},
  {id: 'table-setting-up', title: 'Setting out the tables', save: 'tablesBare', why: 'As you come up to the big tree, the troop sets out the feast’s two tables under it, a piece at a time, each with a knock: the big one’s stone legs, its stone slab (here), then peaches and apples piled on it, then the second one’s legs and slab, then their stone stools. No bowls yet.', run: async () => {
    play(); await wait(100); here().feast = 1; buildMap(); settingUp = {objects: [{look: 'feastTableBare', x: 16, y: 7, w: 3, h: 1, stage: 2}, {look: 'milkTableBare', x: 21, y: 7, w: 3, h: 1, stage: 0}], stage: 2}; await wait(400); }},
  {id: 'tables-bare', title: 'No bowls!', save: 'tablesBare', why: 'The tables set out bare, peaches and apples piled on the big one: the hungry monkey has a !, and wants bowls (我们要碗！碗在水帘洞里。).', run: async () => {
    play(); await wait(500); }},
  {id: 'want-bowls', title: 'We need bowls!', save: 'tablesBare', why: 'The hungry monkey: 我们要碗！碗在水帘洞里。 (We need bowls! The bowls are in the Water Curtain Cave.), every word green.', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(300); next(); await wait(500); }},
  {id: 'bowls-cave', title: 'The troop’s bowls', save: 'bowlsCave', why: 'In the cave, the stacks of bowls (white, a blue band round each, as 碗’s picture and the tables’ bowls) sparkle; A says Take, and takes one, counting.', run: async () => {
    play(); await wait(500); }},
  {id: 'bowls-going-on', title: 'The bowls go on', save: 'bowlsBack', why: 'Back at the tables with the bowls: they go on one at a time, each with a knock, the peaches and apples into the first two (here, the second’s going on).', run: async () => {
    play(); await wait(100); settingUp = {objects: [{look: 'feastTableBowls', x: 16, y: 7, w: 3, h: 1, stage: 2}, {look: 'milkTableEmpty', x: 21, y: 7, w: 3, h: 1, stage: 0}], stage: 2}; await wait(400); }},
  {id: 'chopsticks-made', title: 'I made chopsticks!', save: 'bowlsOn', why: 'Then the big monkey, who makes things for the troop, has a !: 我做了筷子！ (I made chopsticks!), teaching 筷子 (bold); then a cup of them goes on the table.', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(600); }},
  {id: 'feast-table', title: 'The feast’s tables', save: 'feastTable', why: 'Under the big tree, once the bowls from the cave and the big monkey’s chopsticks are on them: on the big one, peaches, apples, an empty bowl, waiting for something, and a bamboo cup of chopsticks; on the second, three empty bowls, waiting for more food. The hungry monkey, with a !, to say what the feast still needs.', run: async () => {
    play(); await wait(500); }},
  {id: 'practise-first', title: 'Practise first', save: 'bowlsWait', why: 'A new word from a character waits till you’ve answered 4 questions since your last one (30 October 2026): talk to them sooner, and they offer a quick word game first, then carry on.', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(500); }},
  {id: 'chopsticks-card', title: 'Chopsticks (筷子)', save: 'bowlsOn', why: '筷子’s card (kuàizi, chopsticks): The big monkey has made chopsticks out of 木头 (wood), a pair for every monkey.', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(300); next(); await wait(600); }},
  {id: 'hungry-table', title: 'This is our big table!', save: 'feastHungry', why: 'The hungry monkey by the table: 这是我们的大桌子！ (桌子 green: you learned it in the cave), then 我们有桃子，也有苹果！', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(500); }},
  {id: 'no-honey', title: 'We don’t have any honey!', save: 'feastHungry', why: 'Then 我们没有蜂蜜！, teaching 没有 (bold); 蜂蜜 is grey, just for listening, till the bees.', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(300); next(); await wait(300); next(); await wait(500); }},
  {id: 'meiyou-card', title: '没有, don’t have', save: 'feastHungry', why: 'Its card, with no picture, like 有: Use 没有 to say what you don’t have.', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(300); next(); await wait(300); next(); await wait(300); next(); await wait(500); }},
  {id: 'meiyou-made', title: 'How 没有 is made', save: 'feastList', why: '没 (not, as in 没关系, a word you know) + 有 (to have, green) = 没有, don’t have.', run: async () => {
    play(); await wait(100); madeCard('没有', () => {}, () => {}, 'Got it'); await wait(400); }},
  {id: 'feast-list', title: 'The feast’s list', save: 'feastList', why: 'A at the table: what the troop has, ticked, and what the feast still needs, the honey as a shadow; each sentence’s English the first time.', run: async () => {
    play(); await wait(100); interact(...facing()); await wait(500); }},
  {id: 'hide-ask', title: 'Hide and seek', save: 'hideSeek', why: 'A little monkey at the home ground, with a ! till you’ve found it once: 我们来捉迷藏吧！ (捉迷藏, just for listening).', run: async () => {
    play(); await wait(100); talk(npc('hider')); await wait(500); }},
  {id: 'hide-play', title: 'Hide and seek: Play?', save: 'hideSeek', why: 'Play or Not now.', run: async () => {
    play(); await wait(100); talk(npc('hider')); await wait(200); next(); await wait(500); }},
  {id: 'hide-count', title: 'Counting to ten', save: 'hideSeek', why: 'Your eyes covered, the screen dark: 一 to 十, the numbers you know green. It runs off to hide.', run: async () => {
    play(); await wait(100); talk(npc('hider')); await wait(200); next(); await wait(300); click('[data-a=yes]'); await wait(700); }},
  {id: 'hide-clue', title: 'Where it’s hiding', save: 'hiding', why: 'It calls out where it is: its English every time, with the place’s word in Chinese (I’m under the 桌子!), so finding it tests the word, never 下面.', run: async () => {
    play(); await wait(100); hideClue(hideSpot('table')); await wait(500); }},
  {id: 'hide-not-here', title: 'Not here', save: 'hideNotHere', why: 'A at the wrong place (the pool): not here, then it calls out again.', run: async () => {
    play(); await wait(100); interact(...facing()); await wait(500); }},
  {id: 'hide-tail', title: 'Its tail', save: 'hideTail', why: 'After two wrong guesses, its tail pokes out from where it’s hiding, wagging now and then: here, under the end of the table.', run: async () => {
    play(); await wait(600); }},
  {id: 'hide-found', title: 'Found you!', save: 'hideFind', why: 'A at the right place: it jumps out, and you say 找到你了！', run: async () => {
    play(); await wait(100); interact(...facing()); await wait(700); }},
  {id: 'hide-result', title: 'You found it', save: 'hideFind', why: 'Shells the first time; then just for fun, and it hides somewhere new each time.', run: async () => {
    play(); await wait(100); interact(...facing()); await wait(500); next(); await wait(500); }},
  {id: 'hide-tasks', title: 'Tasks while it hides', save: 'hiding', why: 'Your task, with its clue under it to read and hear again (no arrow: that’s the game).', run: async () => {
    play(); await wait(100); tasksPage(() => {}); await wait(400); }},
  {id: 'hungry-bees', title: 'Honey comes from bees', save: 'feastHungryBees', why: 'The hungry monkey still wants honey (我要吃蜂蜜！), and the troop has cleared a way east, along the stream, to find the bees. (A new game hears this straight after 没有.)', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(300); next(); await wait(500); }},
  {id: 'way-east', title: 'The way east', save: 'wayEast', why: 'At the east end of the road, the bushes are gone: the way to the riverside, with the task’s arrow.', run: async () => {
    play(); await wait(500); }},
  {id: 'riverside', title: 'The riverside (河边)', save: 'riverside', why: 'The way east along the stream to the bees: up through a slope of wildflowers, where a butterfly flutters, and down to a bridge over a brook.', run: async () => {
    play(); await wait(500); }},
  {id: 'butterfly-meet', title: 'A butterfly', save: 'butterfly', why: 'Over the wildflowers, beside the way: A teaches 蝴蝶 (húdié, butterfly), said straight away; then its questions, to make friends.', run: async () => {
    play(); await wait(100); pressA(); await wait(1600); }},
  {id: 'riverside-end', title: 'The way into the bees’ valley', save: 'riverEnd', why: 'At the riverside’s end, under the rocks: thick bushes block the way into the valley for now (it comes next).', run: async () => {
    play(); await wait(100); pressA(); await wait(500); }},
  {id: 'valley-first', title: 'Into the bees’ valley', save: 'beeValleyFirst', why: 'From the end of the riverside, the first time: the butterfly from the wildflowers flutters in after you, 花里有蜜蜂，也有黄蜂！ (There are bees in the flowers, and wasps too!), then what to do, and it flutters back.', run: async () => {
    play(); await wait(100); arrive(47, 7).then(runEvents); await wait(1500); }},
  {id: 'bee-valley', title: 'The bees’ valley (百花谷)', save: 'beeValley', why: 'Rock all round, flowers everywhere: tall flowers grown across the way in (no way round), where wasps hide, and beds of flowers to look at.', run: async () => {
    play(); await wait(100); showPlaceName(); clearTimeout(placeNameT); await wait(400); }},
  {id: 'wasp-meet', title: 'A wasp jumps out', save: 'beeValleyWasp', why: 'Out of the tall flowers: its first meeting teaches 黄蜂 (huángfēng, wasp), said straight away.', run: async () => {
    play(); await wait(100); battle('wasp'); await wait(600); }},
  {id: 'battle-wasp', title: 'A battle with a wasp', save: 'beeValleyWaspKnown', why: 'Among the flowers, the valley’s cliffs behind (its own backdrop): 20 health (two hits), like a snake.', run: async () => {
    play(); await wait(100); battle('wasp'); await wait(1200); }},
  {id: 'valley-swarm', title: 'The swarm', save: 'beeValleySwarm', why: 'In front of the queen’s old hollow tree, right across the nook: it won’t let you by. A at it says why.', run: async () => {
    play(); await wait(100); pressA(); await wait(500); }},
  {id: 'bee-hiding', title: 'Where the flowers shake', save: 'beeHiding', why: 'A bee hides in the tall flowers (up and right of you): they shake where it is, with little lines either side. Walk in, and it buzzes out.', run: async () => {
    play(); await wait(100); rustle = {x: 15, y: 11, a: ANIMALS.find(a => a.id === 'bee')}; await wait(400); }},
  {id: 'bee-meet', title: 'A bee buzzes out', save: 'beeHiding', why: 'Out of the tall flowers: the first teaches 蜜蜂 (mìfēng, bee), said straight away; then 我们玩吧！ and its questions.', run: async () => {
    play(); await wait(100); wildAppears(ANIMALS.find(a => a.id === 'bee')); await wait(1600); }},
  {id: 'friend-path', title: 'A friend in the path’s grass', save: 'pathFriends', why: 'The mountain path’s new tall grass, round the peach tree’s clearing: once the meadow’s goat is your friend, it can jump out here too, to play again (never where it lives).', run: async () => {
    play(); await wait(100); wildAppears(ANIMALS.find(a => a.id === 'goat'), {x: 4, y: 2, d: 'up'}); await wait(2600); }},
  {id: 'friend-slope', title: 'The deer on the south slope', save: 'slopeFriends', why: 'The south slope’s new tall grass by the peach tree, above the brook: the deer you made friends with in the pine wood jumps out to play.', run: async () => {
    play(); await wait(100); wildAppears(ANIMALS.find(a => a.id === 'deer'), {x: 9, y: 21, d: 'left'}); await wait(700); }},
  {id: 'friend-pines', title: 'Tall grass in the pine wood', save: 'pineFriends', why: 'In the clearing by the old stump, tall grass on the wood’s own floor; the squirrel from the meadow jumps out (the deer never does here, where it lives).', run: async () => {
    play(); await wait(100); wildAppears(ANIMALS.find(a => a.id === 'squirrel'), {x: 5, y: 3, d: 'up'}); await wait(700); }},
  {id: 'bees-out', title: 'The bees you’ve met', save: 'beesOut', why: 'Each bee you meet stays out, hovering where it came out, so you can see they’re different bees: two friends, and one you didn’t win over, with a ! over it (A at it plays again).', run: async () => {
    play(); await wait(500); }},
  {id: 'bee-another', title: 'Another bee', save: 'beesOut', why: 'A new bee out of the flowers: “Another 蜜蜂 (bee), a new one!”, with how many of the six are your friends so far (never “your friend wants to play again”).', run: async () => {
    play(); await wait(100); rustle = null; S.pos = {place: PLACE, x: 13, y: 11, dir: 'right'}; placePlayer(); wildAppears(ANIMALS.find(a => a.id === 'bee')); await wait(2400); }},
  {id: 'bee-count', title: 'Counting your bee friends', save: 'beeFriends', why: 'Each new bee friend, you count them all aloud: here the third, 一，二，三！ (then how many are still hiding).', run: async () => {
    play(); await wait(100); here().beeFriends = 3; runSteps(ANIMALS.find(a => a.id === 'bee').counted[2]); await wait(500); }},
  {id: 'bee-six', title: 'Go and find the queen!', save: 'beeSix', why: 'The sixth bee: 去找蜂王吧！ (蜂王, the queen bee, grey: just for listening till you meet her); then your six bee friends fly off to join the swarm by the old tree, and it flies aside.', run: async () => {
    play(); await wait(100); runEvents(); await wait(500); }},
  {id: 'bees-fly', title: 'Off to join the swarm', save: 'beeSix', why: 'Your six bee friends fly off together, one a little after another, to join the swarm by the old tree.', run: async () => {
    play(); await wait(100); const from = here().out.bee.map(([x, y]) => [x, y]); here().out = {};
    flyers = Object.defineProperty({a: ANIMALS.find(a => a.id === 'bee'), from, to: [26, 7]}, 't0', {get: () => performance.now() - 520}); await wait(300); }},   // (held halfway)
  {id: 'bees-open', title: 'The way to the old tree', save: 'beeOpen', why: 'All six bees are your friends: the swarm has flown aside, and the way to the queen’s old hollow tree is open.', run: async () => {
    play(); await wait(500); }},
  {id: 'queen-meet', title: 'The queen bee comes out', save: 'queenTree', why: 'A at her old hollow tree: she buzzes out, her card teaching 蜂王 (fēngwáng, queen bee), said straight away as you meet her.', run: async () => {
    play(); await wait(100); pressA(); await wait(1500); }},
  {id: 'queen-ask', title: 'What do you want?', save: 'queenOut', why: 'The queen bee, hovering in front of her tree: 你要什么？ Then you say 我们要蜂蜜！ (蜂蜜 just for listening).', run: async () => {
    play(); await wait(100); talk(npc('queen')); await wait(500); }},
  {id: 'queen-game', title: 'The queen bee’s word game', save: 'queenOut', why: 'To win her over: six questions, a heart for each right answer, and three ✕ beside them; three wrong, and she flies back into her tree.', run: async () => {
    play(); await wait(100); encounter({id: 'queen', hz: '蜂王', img: portrait('queen'), wild: false, questions: 6, misses: 3, gaps: 2}); await wait(800); }},
  {id: 'queen-lost', title: 'Three wrong', save: 'queenOut', why: 'She buzzes back into her old tree: press A at it to try again.', run: async () => {
    play(); await wait(100); pictureQ = async () => false; gapRound = async () => ({right: false, shells: 0});
    encounter({id: 'queen', hz: '蜂王', img: portrait('queen'), wild: false, questions: 6, misses: 3, gaps: 2, lose: AREA.talk.queen[0].do.find(s => s.wordGame).wordGame.lose}); await wait(800); }},
  {id: 'bees-follow', title: 'The bees follow you home', save: 'beesFollow', why: 'Won over, the queen bee and her swarm follow you home along the riverside, flying behind you (tall flowers and long grass never hide them).', run: async () => {
    play(); await wait(200);
    for (let i = 0; i < 4; i++){ pl.dir = 'left'; tryStep('left', performance.now()); await wait(450); }
    await wait(300); }},
  {id: 'bees-home', title: 'The bees are home', save: 'beesComing', why: 'Into the home ground with them: they fly over to the wildflowers below the cliff (where their hive will be), with a fanfare.', run: async () => {
    play(); await wait(100); arrive(0, 7).then(runEvents); await wait(1600); }},
  {id: 'hive-build', title: 'The troop builds a hive', save: 'hiveSoon', why: 'Talk to the queen bee by the wildflowers, and the troop builds the bees a hive as you watch: its plot and sign marked out, then a stone base and three log hives with straw caps, a piece at a time.', run: async () => {
    play(); await wait(100); talk(npc('queen')); await wait(300); next(); await wait(300); next(); await wait(3300); }},
  {id: 'hive', title: 'The bees’ hive', save: 'hive', why: 'The queen bee and her swarm live in it, bees buzzing over it, by its sign; A takes honey for the hungry monkey (Take).', run: async () => {
    play(); await wait(500); }},
  {id: 'honey-card', title: 'Honey (蜂蜜)', save: 'hive', why: 'Your first honey from the hive teaches 蜂蜜 (fēngmì, honey), said straight away: 蜜蜂 (bee) the other way round.', run: async () => {
    play(); await wait(100); pressA(); await wait(600); }},
  {id: 'honey-give', title: 'Honey for the hungry monkey', save: 'honeyHeld', why: 'Honey! Wonderful!, then you complete 我要吃蜂蜜 to give it to him.', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(300); next(); await wait(500); }},
  {id: 'honey-bowl', title: 'Honey for the feast', save: 'honeyIn', why: 'He has poured it into the empty bowl on the big table: 我们有蜂蜜了！ (We have honey now!)', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(500); }},
  {id: 'feast-list-honey', title: 'The feast’s list, with honey', save: 'honeyIn', why: 'A at the big table: honey ticked off too, 我们有蜂蜜。', run: async () => {
    play(); await wait(100); pressA(); await wait(500); }},
  {id: 'bag-honey', title: 'Honey in your bag', save: 'honeyIn', why: 'From the hive, two at most: tap it to eat it, and you walk faster for a minute.', run: async () => {
    play(); await wait(100); bagPage(() => closeCard()); await wait(400); }},
  {id: 'cow-news', title: 'News of a cow', save: 'cowNews', why: 'The thirsty monkey, by the road at the home ground since the feast’s quests began, with a !: 山上有牛！ (There’s a cow on the mountain! 牛 just for listening). Then what he heard, and the way south.', run: async () => {
    play(); await wait(100); talk(npc('thirsty')); await wait(500); }},
  {id: 'way-south', title: 'The way south', save: 'waySouth', why: 'Past the bridge at the bottom of the home ground, the bushes are gone: the way south to the pasture, with the task’s arrow.', run: async () => {
    play(); await wait(500); }},
  {id: 'south-slope', title: 'The south slope (南坡)', save: 'pastureIn', why: 'South over the bridge, the way goes down the south slope: its name at the top, said aloud; four terraces with a cliff between each, stone steps at one end (the long way) and a grassy bank to hop down in the middle (the quick way).', run: async () => {
    play(); await wait(100); arrive(16, 21).then(runEvents); await wait(1500); }},
  {id: 'slope-top', title: 'Down the slope', save: 'slopeTop', why: 'The top terrace: the way winds west to the steps, or hop down the bank in the middle; a wild apple tree, long grass. Your task: look for the cow from the lookout on the way.', run: async () => {
    play(); await wait(500); }},
  {id: 'slope-lookout', title: 'The lookout', save: 'slopeLookout', why: 'On the second terrace, a lookout at the top of the cliff: its railing sparkles (A: Look), and a goat stands by it.', run: async () => {
    play(); await wait(500); }},
  {id: 'cow-view', title: 'There’s a cow over there!', save: 'slopeLookout', why: 'From the railing: hills far off, a sunny pasture far below with a spring, the cow by it (an arrow over it), and the dark pines between: 那里有一只牛！ (There’s a cow over there!), then 我要去找牛！ (I’m going to find the cow!).', run: async () => {
    play(); await wait(100); storyScene('cowView'); introClock = .8; advancedTo = 0; await wait(400); }},
  {id: 'slope-goat', title: 'The cow is down below!', save: 'slopeLookout', why: 'The goat by the lookout: 你好！, your reply, then 牛在下面！ (The cow is down below!).', run: async () => {
    play(); await wait(100); S.pos = {place: 'southSlope', x: 10, y: 16, dir: 'right'}; placePlayer(); talk(npc('slopeGoat')); await wait(300); next(); await wait(300); next(); await wait(500); }},
  {id: 'slope-steps', title: 'Stepping stones', save: 'slopeSteps', why: 'The third terrace: a brook across it, and stepping stones over it; a peach tree in the corner; then more steps down, into the pines.', run: async () => {
    play(); await wait(500); }},
  {id: 'hop-stones', title: 'Hop!', save: 'slopeBrookTip', why: 'Facing the stepping stones over the brook (28 October 2026): a picture floats over each stone in the row in front of you, and the first time, a tip: press A to hop onto a stepping stone.', run: async () => {
    play(); await wait(900); }},
  {id: 'hop-question', title: 'Which stone?', save: 'slopeBrook', why: 'A at the stepping stones: you hear a word, and choose its picture, in the same order as on the stones, left to right.', run: async () => {
    play(); await wait(300); pressA(); await wait(800); }},
  {id: 'hop-splash', title: 'Splash!', save: 'slopeBrook', why: 'A wrong stone tips: in you go, up to your shoulders, with a splash, and you climb back out onto the bank, dripping, the stones with new pictures.', run: async () => {
    play(); await wait(300); const pq = pictureQ; pictureQ = async o => { o.onAnswer(false, (o.answerIdx + 1) % 3); return false; };
    pressA(); await wait(1300); pictureQ = pq; }},
  {id: 'pasture-first', title: 'Into the dark pines (黑松林)', save: 'pastureIn', why: 'Down the south slope, into the dark pines: their name, said aloud; gloomy, misty, eyes in the dark; the first time, long grass where wolves hide, and somewhere beyond, a cow moos.', run: async () => {
    play(); await wait(100); S.pos = {place: 'southSlope', x: 12, y: 38, dir: 'down'}; placePlayer(); arrive(12, 39).then(runEvents); await wait(1500); }},
  {id: 'pasture-fork', title: 'Hoofprints', save: 'pastureFork', why: 'The way through the dark pines forks: west, it goes nowhere (but there are shells under the boulder at its end); east, the cow’s hoofprints, and the first time you come to them, which way it went. Its moo, now and then, is louder the right way.', run: async () => {
    play(); await wait(100); pl.dir = 'right'; tryStep('right', performance.now()); await wait(700); }},
  {id: 'pines-owl', title: 'An owl', save: 'pinesOwl', why: 'Just inside the dark pines, west of the way in: an owl perched up on an old dead pine, its eyes glinting in the gloom (A: Meet).', run: async () => {
    play(); await wait(600); }},
  {id: 'owl-meet', title: '猫头鹰', save: 'pinesOwl', why: 'Meeting the owl: its word, 猫头鹰 (māotóuyīng, owl), on a new-word card, said straight away; then How it’s made: 猫 cat + 头 head + 鹰 eagle.', run: async () => {
    play(); await wait(100); S.pos = {place: 'darkPines', x: 11, y: 3, dir: 'up'}; placePlayer(); pressA(); await wait(1500); }},
  {id: 'pines-log', title: 'A hollow pine', save: 'pinesLog', why: 'Following the hoofprints east, down a narrow gully: a great pine has fallen along it, hollow inside. The cow stepped over it, but a little monkey can crawl right through.', run: async () => {
    play(); await wait(100); pl.dir = 'down'; tryStep('down', performance.now()); await wait(700); }},
  {id: 'pines-in-log', title: 'Inside the hollow pine', save: 'pinesInLog', why: 'Crawling through: the log is drawn over you, so you vanish inside it, and come out at its other end.', run: async () => {
    play(); await wait(500); }},
  {id: 'pasture-stream', title: 'Too deep to wade', save: 'pastureStream', why: 'The hoofprints go into a stream, too deep for a little monkey; a dead pine leans over it from the bank, sparkling, and your task’s arrow is on it. A: Hit.', run: async () => {
    play(); await wait(500); }},
  {id: 'pasture-log', title: 'A bridge', save: 'pastureStream', why: 'Knock the dead pine down with your stick, and it falls right across the stream: a bridge.', run: async () => {
    play(); await wait(100); pressA(); await wait(1600); }},
  {id: 'pasture-rabbit', title: 'Are you looking for the cow?', save: 'pastureRabbit', why: 'Over the stream, where the way forks three ways, a rabbit saw the cow go by: 你找牛吗？ (Are you looking for the cow?), then its word game; win, and 牛在那里！ (The cow is over there! 那里 just for listening), its ears pointing the way.', run: async () => {
    play(); await wait(100); talk(npc('pastureRabbit')); await wait(500); }},
  {id: 'pasture', title: 'The pasture', save: 'pasture', why: 'Out between two big rocks: open, sunny grass with flowers, big trees and boulders, and the spring where the cow drinks.', run: async () => {
    play(); await wait(500); }},
  {id: 'cow-meet', title: 'The lost cow', save: 'cowMeet', why: 'By its spring: A teaches 牛 (niú, cow), said straight away as you find it.', run: async () => {
    play(); await wait(100); pressA(); await wait(1600); }},
  {id: 'cow-scared', title: 'I’m scared of wolves!', save: 'cowFound', why: 'Then the cow says 我怕狼！ (I’m scared of wolves!): it’s too scared of the wolves in the pines to go anywhere.', run: async () => {
    play(); await wait(100); talk(npc('cow')); await wait(500); }},
  {id: 'cow-game', title: 'The cow’s word game', save: 'cowFound', why: 'Then its word game, to win its trust: win, and it follows you home (Not now, or lose, and it waits by its spring with a !).', run: async () => {
    play(); await wait(100); talk(npc('cow')); await wait(300); next(); await wait(600); }},
  {id: 'cow-follows', title: 'The cow follows you home', save: 'cowFollow', why: 'Won over (好！我们去你家吧！ OK! Let’s go to your home!), the cow follows you, a step behind, back through the pines; the task’s arrow points the way home.', run: async () => {
    play(); await wait(200);
    for (let i = 0; i < 3; i++){ pl.dir = 'left'; tryStep('left', performance.now()); await wait(450); }
    await wait(300); }},
  {id: 'cow-wolf', title: 'The bear at the rocks', save: 'cowGap', why: 'Leading the cow home, as you come into the gap between the big rocks, a bear (熊, taught on its card the first time) rears up out of the long grass at you (just the once): it wants the cow! A boss: no running away. (A wolf till 27 October 2026.)', run: async () => {
    play(); await wait(200); pl.dir = 'up'; tryStep('up', performance.now()); await wait(2600); }},
  {id: 'cow-ran', title: 'The cow ran back', save: 'cowRan', why: 'Lose a battle on the way home, and the cow takes fright and runs back to its spring: talk to it there, and it follows you again.', run: async () => {
    play(); await wait(100); runSteps(BATTLES.afterLoss[0].do); await wait(600); }},
  {id: 'cow-long-grass', title: 'Not into the long grass!', save: 'cowPines', why: 'Leading the cow home through the dark pines, it stops at the long grass: 我怕狼！ (I’m scared of wolves!). Go first, and chase them off: a wolf leaps out of the grass at you.', run: async () => {
    play(); await wait(200); pl.dir = 'up'; tryStep('up', performance.now()); await wait(1600); }},
  {id: 'cow-hungry', title: 'I’m hungry.', save: 'cowSlope', why: 'Up the south slope, at the top of the steps from the pines, the cow stops again: 我饿了。 (I’m hungry.). Pick it some fresh grass by the brook.', run: async () => {
    play(); await wait(200); pl.dir = 'up'; tryStep('up', performance.now()); await wait(1600); }},
  {id: 'cow-grass', title: 'Fresh grass', save: 'cowGrass', why: 'Tall, fresh grass by the brook, sparkling: A picks a handful, three times, counted 一 二 三, with the task’s arrow on it. The cow waits at the top of the steps.', run: async () => {
    play(); await wait(500); }},
  {id: 'cow-fed', title: 'Grass for the cow', save: 'cowFed', why: 'Give the cow the grass: 草！太好了！ (Grass! Wonderful!), then you finish 我要吃草 (I want to eat grass), and it follows you on, up the steps.', run: async () => {
    play(); await wait(100); pressA(); await wait(800); }},
  {id: 'cow-home', title: 'The cow is home', save: 'cowHome', why: 'As you come up to the thirsty monkey by the road, the cow stops following you, and stands by him: 太好了！ (Great!)', run: async () => {
    play(); await wait(200); pl.dir = 'right'; tryStep('right', performance.now()); await wait(1600); }},
  {id: 'cow-home-task', title: 'A message where the speech box was', save: 'cowHome', why: 'Straight after a conversation whose speech box was at the top (here, so as not to hide the thirsty monkey), the next messages, such as a new task, show at the top too, till you move or turn, so they never jump from top to bottom.', run: async () => {
    play(); await wait(200); pl.dir = 'right'; tryStep('right', performance.now()); await wait(1600);
    for (let i = 0; i < 8 && $('#saybox').hidden; i++){ if (!talkBox.hidden) next(); await wait(600); }
    await wait(300); }},
  {id: 'pen-build', title: 'Building the cow a home', save: 'cowBuild', why: 'The thirsty monkey’s ! (the troop is ready): the troop marks out a plot by the road, then builds the cow a pen as you watch, a piece at a time: its fences, with a gate facing the road, a shelter with hay, and a trough of fresh water fed by a bamboo pipe.', run: async () => {
    play(); await wait(100); pressA(); await wait(400); next(); await wait(5200); }},   // (pressing A, as you would: no new task till it's over)
  {id: 'pen-built', title: 'The cow’s new home', save: 'penBuilt', why: 'Built: the cow follows you, and your task’s arrow points at its gate. You can walk in, but not through its fences, its shelter or its trough.', run: async () => {
    play(); await wait(500); }},
  {id: 'cow-your-home', title: 'This is your home!', save: 'penBuilt', why: 'Lead it in through the gate: it goes to its shelter, and you tell it 这是你的家！ (This is your home!). It says 谢谢你！, and you reply 不客气.', run: async () => {
    play(); await wait(200);
    for (let i = 0; i < 2; i++){ pl.dir = 'down'; tryStep('down', performance.now()); await wait(450); }
    await wait(1400); }},
  {id: 'milk-card', title: 'Its thank-you: milk (牛奶)', save: 'penBuilt', why: 'Then it gives you some of its milk: 牛奶 (niúnǎi, milk), said straight away. How it’s made: 牛 cow + 奶 milk.', run: async () => {
    play(); await wait(100); here().cow = 8; runSteps([AREA.events.flatMap(e => e.do).find(s => s.newWord === '牛奶')]); await wait(600); }},
  {id: 'milk-give', title: 'Milk for the thirsty monkey', save: 'cowInPen', why: 'He wants to drink some (我要喝牛奶！ I want to drink milk!): give it to him, and fill the gap in 我要喝牛奶.', run: async () => {
    play(); await wait(100); talk(npc('thirsty')); await wait(600); }},
  {id: 'milk-table', title: 'Milk for the feast', save: 'milkTable', why: 'The rest is for the feast: as you come up to it, it goes on the feast’s second table, a bowl of it and a white jug of milk at its end: 我们有牛奶了！ (We have milk now!)', run: async () => {
    play(); await wait(200); pl.dir = 'up'; tryStep('up', performance.now()); await wait(4400); }},
  {id: 'cow-have-home', title: 'I have a home now!', save: 'cowAtHome', why: 'The cow in its pen, in front of its shelter: A, and it says 我有家了！ (I have a home now!).', run: async () => {
    play(); await wait(100); talk(npc('cow')); await wait(500); }},
  {id: 'dairy-start', title: 'The little dairy', save: 'dairyStart', why: 'The thirsty monkey takes some milk to a little table by the pen, set up as you watch (a pail of milk, a pot with a cloth tied over it): 我要做吃的！ (I’m going to make something to eat! 做 just for listening).', run: async () => {
    play(); await wait(100); pressA(); await wait(400); next(); await wait(3400); }},
  {id: 'tasks-dairy', title: 'Tasks: what is he making?', save: 'dairyWait', why: 'While it’s being made, your tasks count your questions since he started (of 8): any you answer, anywhere.', run: async () => {
    play(); await wait(100); tasksPage(() => {}); await wait(400); }},
  {id: 'dairy-ready', title: 'It’s ready!', save: 'dairyWait', why: 'Once you’ve answered 8 more questions: a chime, a message, and a ! over the thirsty monkey, as when the teacher has a new word for you.', run: async () => {
    play(); await wait(100); S.turn = 48; runEvents(); await wait(600); }},
  {id: 'dairy-yog', title: '好了！ Yoghurt', save: 'dairyReady', why: '好了！ (It’s ready!): jars of yoghurt go up on the dairy’s shelf, then its card, 酸奶 (suānnǎi, yoghurt), said straight away. How it’s made: 酸 sour + 奶 milk.', run: async () => {
    play(); await wait(100); pressA(); await wait(400); next(); await wait(1800); }},
  {id: 'cheese-card', title: 'Cheese (奶酪)', save: 'dairyReady', why: 'The same again, 8 questions later: 奶酪 (nǎilào, cheese), which shares 奶 with 牛奶.', run: async () => {
    play(); await wait(100); here().dairy = 4; runSteps(AREA.talk.thirsty.find(p => p.if && p.if.dairy === 4).do.filter(s => s.newWord)); await wait(600); }},
  {id: 'feast-milk-table', title: 'The feast’s second table, full', save: 'dairyDone', why: 'Milk (and its jug), yoghurt with a wooden spoon in it, and a round cheese in the bowls of the feast’s second table; and the little dairy by the pen, jars of yoghurt and a cheese on its shelf.', run: async () => {
    play(); await wait(500); }},
  {id: 'spoon-card', title: 'A spoon (勺子)', save: 'dairyDone', why: 'Once the yoghurt’s on the table, the spoon in it sparkles till you know it: A at the second table, and 勺子 (sháozi, spoon), said straight away.', run: async () => {
    play(); await wait(100); S.pos = {place: 'homeGround', x: 22, y: 8, dir: 'up'}; placePlayer(); interact(...facing()); await wait(500); }},
  {id: 'feast-list-dairy', title: 'The feast’s list, with milk, yoghurt and cheese', save: 'dairyDone', why: 'A at either table: 我们有牛奶。我们有酸奶。我们有奶酪。, after the peaches, the apples and the honey.', run: async () => {
    play(); await wait(100); feastCard(); await wait(500); }},
  {id: 'garden-ask', title: 'We want seeds!', save: 'gardenAsk', why: 'Once the feast’s tables are set (the spoons too), the big monkey has a !: 我们要种子！ (We want seeds!), teaching 种子 (zhǒngzi, seeds). He walks you down to the stream, where the troop marks out a garden.', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(500); }},
  {id: 'garden-marked', title: 'The garden, marked out', save: 'gardenMarked', why: 'Dug beds by the stream, string round them on stakes, and its sign; the big monkey stays by it. The rest of the garden waits for seeds.', run: async () => {
    play(); await wait(500); }},
  {id: 'melon-field', title: 'The melon field (瓜田)', save: 'melonField', why: 'East off the south slope, where the troop has cleared the bushes: wild melons in the sun, and five birds pecking at them, each one colour.', run: async () => {
    play(); await wait(500); }},
  {id: 'tasks-melons', title: 'Tasks: shoo the birds', save: 'melonField', why: 'Your task counts the birds you’ve shooed away (of 5).', run: async () => {
    play(); await wait(100); tasksPage(() => {}); await wait(400); }},
  {id: 'bird-shoo', title: 'Shoo!', save: 'melonField', why: 'A at a bird (its button says Shoo) shows what it is, 红色的鸟 (a red bird), said aloud; then it flies off for good.', run: async () => {
    play(); await wait(100); interact(...facing()); await wait(600); }},
  {id: 'melon-card', title: 'A watermelon (西瓜)', save: 'melonsSafe', why: 'With the birds gone, the melons sparkle: A at one, and 西瓜 (xīguā, watermelon), said straight away. You eat some and keep its seeds.', run: async () => {
    play(); await wait(100); interact(...facing()); await wait(600); }},
  {id: 'seeds-give', title: 'Seeds! Wonderful!', save: 'seedsBack', why: 'Give the big monkey the seeds: 种子！太好了！, then finish 这是西瓜的种子 (These are watermelon seeds), the fruit missing.', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(500); }},
  {id: 'melons-planted', title: 'Melons in the garden', save: 'melonsPlanted', why: 'The troop plants the seeds, each square coming up out of the ground in turn: little melon vines, in a corner of the garden.', run: async () => {
    play(); await wait(500); }},
  {id: 'hillside-west', title: 'The way west to the cliffs', save: 'hillsideWest', why: 'Once the garden begins, the troop clears the bushes at the west end of the hillside’s second terrace: the way to the cliffs.', run: async () => {
    play(); await wait(500); }},
  {id: 'cliffs', title: 'The cliffs (山崖)', save: 'cliffsTop', why: 'Ledge below ledge: wild grapes hang down the cliff below the top, out of reach. Two banks to hop down, and stone steps.', run: async () => {
    play(); await wait(500); }},
  {id: 'cliffs-above', title: 'Out of reach', save: 'cliffsTop', why: 'A at the grapes from the top: they hang down the cliff below you, out of reach. Find a way down to them.', run: async () => {
    play(); await wait(100); interact(...facing()); await wait(500); }},
  {id: 'cliffs-goat', title: 'The fruit is down below!', save: 'cliffsGoat', why: 'The goat at the top: 你好！, then 水果在下面！ (The fruit is down below!), and a hint to look before you hop.', run: async () => {
    play(); await wait(100); talk(npc('cliffGoat')); await wait(300); next(); await wait(400); }},
  {id: 'cliffs-ledge', title: 'Under the grapes', save: 'cliffsLedge', why: 'The right bank lands you on the ledge under the grapes: they sparkle, and A picks them.', run: async () => {
    play(); await wait(500); }},
  {id: 'grape-card', title: 'Grapes (葡萄)', save: 'cliffsLedge', why: 'A at the grapes from the ledge: 葡萄 (pútáo, grapes), said straight away. You eat some and keep the seeds.', run: async () => {
    play(); await wait(100); interact(...facing()); await wait(600); }},
  {id: 'grapes-give', title: 'Grape seeds', save: 'grapesBack', why: 'Give the big monkey the seeds: 种子！太好了！, then finish 这是葡萄的种子 (These are grape seeds).', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(500); }},
  {id: 'trellis', title: 'The grapes’ trellis', save: 'trellisUp', why: 'The troop sets up a trellis in the garden as you watch (its posts, its wires, then the vines climbing it), beside the melons.', run: async () => {
    play(); await wait(500); }},
  {id: 'riverside-north', title: 'The way up the brook', save: 'riversideNorth', why: 'Once the garden begins, the troop clears the bushes beside the riverside’s brook, at the top: the way up it to the hot spring valley.', run: async () => {
    play(); await wait(500); }},
  {id: 'springs', title: 'The hot spring valley (温泉谷)', save: 'springs', why: 'A warm, sheltered valley: steaming blue-green pools with a pale crust round them, ferns, the warm brook, and two monkeys of the troop bathing.', run: async () => {
    play(); await wait(900); }},
  {id: 'springs-steam', title: 'Steam!', save: 'springsVent', why: 'On the narrow way between the big pools, steam puffs out of the ground, one row and then the other: step onto it and it’s too hot; wait, and go.', run: async () => {
    play(); while (!puffing(13, 9)) await wait(40); await wait(250); tryStep('up', performance.now()); await wait(150); }},
  {id: 'springs-bath', title: 'Bathing monkeys', save: 'springsBath', why: 'Two monkeys of the troop soak in a warm pool up to their shoulders, eyes shut, as monkeys do in hot springs. Talk to one: 你好！, and it’s bliss.', run: async () => {
    play(); await wait(600); }},
  {id: 'springs-bananas', title: 'Wild bananas', save: 'springsBananas', why: 'Past the steam, banana plants in the warm corner at the top, their bunches sparkling.', run: async () => {
    play(); await wait(500); }},
  {id: 'banana-card', title: 'Bananas (香蕉)', save: 'springsBananas', why: 'A at a banana plant: 香蕉 (xiāngjiāo, banana), said straight away. Wild ones are full of hard black seeds: you keep them.', run: async () => {
    play(); await wait(100); interact(...facing()); await wait(600); }},
  {id: 'bananas-give', title: 'Banana seeds', save: 'bananasBack', why: 'Give the big monkey the seeds: 种子！太好了！, then finish 这是香蕉的种子 (These are banana seeds).', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(500); }},
  {id: 'garden-planted', title: 'The garden, planted', save: 'gardenPlanted', why: 'Two banana plants, the grapes’ trellis and the melons, all growing in the troop’s garden by the stream.', run: async () => {
    play(); await wait(500); }},
  {id: 'tasks-fruit', title: 'Tasks: the fruit growing', save: 'fruitGrowing', why: 'Planted, each fruit grows: its task counts the questions you’ve answered since, anywhere (of 8), as the little dairy’s do.', run: async () => {
    play(); await wait(100); tasksPage(() => {}); await wait(400); }},
  {id: 'garden-ripe', title: 'Ripe!', save: 'fruitRipe', why: 'After 8 more questions each is ripe, a chime and a message each, and a ! over the big monkey: melons on the vines, grapes on the trellis, bananas on the plants.', run: async () => {
    play(); await wait(500); }},
  {id: 'fruit-ready', title: 'It’s ready!', save: 'fruitRipe', why: 'The big monkey picks each ripe fruit for the feast: 好了！ (It’s ready!), one at a time.', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(500); }},
  {id: 'fruit-table', title: 'The garden’s fruit, for the feast', save: 'fruitPicked', why: 'As you come up to the big tree, the troop sets out a new stone table for the garden’s fruit, a square at a time, and the melon goes in its bowl: 我们有西瓜了！ (We have watermelon now!).', run: async () => {
    play(); await wait(200); pl.dir = 'up'; tryStep('up', performance.now()); await wait(4000); }},
  {id: 'fruit-table-full', title: 'All three on the table', save: 'fruitTable', why: 'Slices of watermelon, a bunch of grapes and bananas, each in its own bowl, whatever order they ripened in.', run: async () => {
    play(); await wait(500); }},
  {id: 'feast-list-fruit', title: 'The feast’s list, with the fruit', save: 'fruitTable', why: 'A at any of the tables: 我们有西瓜。我们有葡萄。我们有香蕉。 at the end of the list (we don’t have it, while it grows: 我们没有西瓜。).', run: async () => {
    play(); await wait(100); feastCard(); await wait(500); }},
  {id: 'shop-comes', title: 'The 老板 comes up to the home ground', save: 'shopComes', why: 'With the flowers planted, he comes up from the meadow: a message, and a task with an arrow to him, by the way in.', run: async () => {
    play(); await wait(900); }},
  {id: 'shop-plot', title: 'His shop, going up', save: 'shopMoved', why: 'Talk to him (我来了！ 这里很好！): the troop marks out a plot by the way in, with its sign, then builds his shop a piece at a time: posts and a woven back, a counter, a striped roof as his old stall had, then what he sells.', run: async () => {
    play(); await wait(100); here().shop = 2; refreshMap(); here().shop = 3; settingUp = {objects: mapObjects().filter(o => o.look === 'shop').map(o => ({...o, stage: 2})), stage: 2}; await wait(300); }},   // (held as its counter goes up, on its plot)
  {id: 'shop-home', title: 'The 老板’s new shop', save: 'shopOpen', why: 'By the way in from the waterfall, with his sign; A at the shop or at him opens it. You’re wearing the blue headband you bought there.', run: async () => {
    play(); await wait(500); }},
  {id: 'shop-colours', title: 'Headbands in every colour you know', save: 'shopOpen', why: 'One for each colour you know (you have the red and the blue), with its own picture, peaches as well as apples, and honey once the bees make it.', run: async () => {
    play(); await wait(100); shop(speaker('boss')); await wait(200); next(); await wait(400); }},
  {id: 'shop-gap-colour', title: 'Asking for a green one', save: 'shopOpen', why: 'You ask for it: 我要绿色的头带, the colour missing, the other colours you know the wrong answers.', run: async () => {
    play(); await wait(100); buy(forSale().find(i => i.colour === '绿色'), speaker('boss')); await wait(500); }},
  {id: 'shop-puzzled', title: 'Asking for something you didn’t point at', save: 'shopOpen', why: 'Choose the wrong word, and he’s puzzled, a ? over him: you pointed at the apples but asked for something else. He asks again (你要什么？), and the same choices come again, the right one somewhere else, till you ask for what you pointed at. Only then do you pay.', run: async () => {
    play(); await wait(100); const real = gapQ; let first = true;
    gapQ = async o => { if (!first) return real(o); first = false; if (o.seen) o.seen.options = ['苹果', '山', '水']; return false; };
    buy(forSale().find(i => i.item === '苹果'), speaker('boss')); await wait(500); }},
  {id: 'wardrobe-colours', title: 'Your headbands', save: 'shopOpen', why: 'Each colour you’ve bought, one on at a time: putting one on takes the other off (我戴蓝色的头带).', run: async () => {
    play(); await wait(100); wardrobePage(() => closeCard()); await wait(300); }},
  {id: 'stall-empty', title: 'His old stall, empty', save: 'oldStall', why: 'Once he’s moved, the meadow’s stall is empty: A at it says where he’s gone.', run: async () => {
    play(); await wait(500); }},
  {id: 'fish-want', title: 'A big fish for the feast', save: 'fishAsk', why: 'With honey on the table, the hungry monkey wants a big fish: 我要吃大鱼！ (大 just for listening, till you catch one).', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(300); next(); await wait(500); }},
  {id: 'fisher', title: 'The fishing monkey', save: 'fishRod', why: 'By the stream at the home ground, his rod out over the water, its float bobbing, with a ! once the hungry monkey wants a fish.', run: async () => {
    play(); await wait(500); }},
  {id: 'fisher-rod', title: 'A fishing rod', save: 'fishRod', why: '河里有鱼！ 这是鱼竿。 (This is a fishing rod), and its card.', run: async () => {
    play(); await wait(100); talk(npc('fisher')); await wait(300); next(); await wait(300); next(); await wait(500); }},
  {id: 'fishing-wait', title: 'Fishing: waiting for a bite', save: 'fishing', why: 'A at the stream casts your line: the float bobs on the water. B stops.', run: async () => {
    play(); await wait(100); Math.random = () => .5; goFishing(23, 18); await wait(600); }},
  {id: 'fishing-bite', title: 'A bite!', save: 'fishing', why: 'The float goes under, rings spreading, a ! over you: press A (Hook it) before it gets away.', run: async () => {
    play(); await wait(100); Math.random = () => 0; goFishing(23, 18); await wait(1900); }},
  {id: 'fishing-reel', title: 'Reeling it in', save: 'fishing', why: 'Hooked: reel it in by answering questions on words you know (one for a little fish, three in a row for a big one).', run: async () => {
    play(); await wait(100); Math.random = () => 0; goFishing(23, 18); await wait(1800); fishPress('a'); await wait(600); }},
  {id: 'fish-caught', title: 'A tiny fish', save: 'fishing', why: 'Your first catch is always a little one.', run: async () => {
    play(); await wait(100); infoBox(`<span class="ico">${picHTML(FISH.small.pic)}</span>`, `<p>${esc(fill(FISH.small.caught))}</p>`); await wait(400); }},
  {id: 'fish-too-small', title: 'Too small!', save: 'fishing', why: 'You say so, 太小了！, teaching 小 (little), and let it go.', run: async () => {
    play(); await wait(100); runSteps(FISH.small.steps[0].do); await wait(600); }},
  {id: 'fish-gap', title: 'Which is it?', save: 'fishBoth', why: 'Once you know 小 and 大, each catch asks: 这是＿鱼, its picture over it.', run: async () => {
    play(); await wait(100); runSteps(FISH.big.steps[1].do); await wait(600); }},
  {id: 'fish-table', title: 'The feast’s fish', save: 'fishTable', why: 'At the end of the feast’s second table, on a stone of its own, on a big leaf.', run: async () => {
    play(); await wait(500); }},
  {id: 'shrimp-want', title: 'Shrimp for the feast', save: 'shrimpAsk', why: 'With the fish on its table, the hungry monkey wants shrimp: 我要吃虾！ (虾 just for listening, till you catch one).', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(500); }},
  {id: 'shrimp-brook', title: 'The clear brook', save: 'shrimping', why: 'Above the riverside’s bridge, the brook runs shallow and clear over pebbles: little see-through shrimp drift about in it, flicking backwards now and then.', run: async () => {
    play(); await wait(600); }},
  {id: 'shrimp-nibble', title: 'A nibble', save: 'shrimping', why: 'A shrimp nibbles first: the float twitches, tiny rings round it, once or twice. Wait! Pull now, and it lets go.', run: async () => {
    play(); await wait(100); fishing = {x: 27, y: 4, t0: performance.now(), bite: null, nibble: true, hooked: false, press: null}; toast(fill(FISH.shrimp.nibble)); await wait(400); }},   // (held as it twitches)
  {id: 'shrimp-word', title: 'Your first shrimp: 虾', save: 'shrimping', why: 'The first one you catch teaches 虾, said straight away; each is counted (一, 二, 三).', run: async () => {
    play(); await wait(100); showNotice('虾', {note:'A shrimp, from the clear shallows of the brook.'}); await wait(600); }},
  {id: 'shrimp-gap', title: 'This is a shrimp', save: 'shrimpTwo', why: 'Giving him the shrimp, and each one you catch after: 这是虾, 虾 or 鱼.', run: async () => {
    play(); await wait(100); runSteps(FISH.shrimp.steps[2].do); await wait(600); }},
  {id: 'shrimp-table', title: 'Shrimp on the feast’s table', save: 'shrimpTable', why: 'A white bowl of shrimp in front of the big fish, on its table at the end of the feast’s second.', run: async () => {
    play(); await wait(500); }},
  {id: 'crab-want', title: 'A crab for the feast', save: 'crabAsk', why: 'With the shrimp on the table, the hungry monkey wants a crab: 我要吃螃蟹！ (螃蟹 just for listening, till you catch one). The troop clears the bushes at the bottom of the meadow.', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(500); }},
  {id: 'shore', title: 'The shore', save: 'shore', why: 'Below the meadow, where the river from the waterfall runs into the sea (海): sand, rocks and rock pools, a little bridge, and crabs scuttling sideways.', run: async () => {
    play(); await wait(600); }},
  {id: 'shore-sea', title: 'The sea', save: 'shore', why: 'The first time you come down, you see the sea: 海, said straight away, and 海很大！', run: async () => {
    play(); await wait(100); showNotice('海', {note:'The sea! Water as far as you can see. The river from the waterfall runs into it here.'}); await wait(600); }},
  {id: 'crab-grab', title: 'Pick it up!', save: 'shore', why: 'A at a crab from in front or behind (beside it, it scuttles away): one question on a word you know, as in reeling in a fish. Wrong, and it pinches you and gets away.', run: async () => {
    play(); await wait(100); catchQ(nextWords(trainable(), 1)[0], 1, 1, '螃蟹', 'Pick it up!'); await wait(600); }},
  {id: 'crab-word', title: 'A crab: 螃蟹', save: 'shore', why: 'The first crab you catch teaches 螃蟹, said straight away.', run: async () => {
    play(); await wait(100); showNotice('螃蟹', {note:'A crab! It can only walk sideways.'}); await wait(600); }},
  {id: 'crab-table', title: 'The feast’s crab', save: 'crabTable', why: 'A big red crab on a plate, on a stone table of its own between the garden’s fruit and the big table.', run: async () => {
    play(); await wait(500); }},
  {id: 'exam-ask', title: 'The exam', save: 'examReady', why: 'With every food on the tables, the teacher: 我们考试吧！ (Let’s have an exam!)', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(500); }},
  {id: 'exam-start', title: 'Start the exam?', save: 'examReady', why: '30 words from all over Flower Fruit Mountain to match to their pictures, those you know least well first: 24 right first time to pass. Not now, and he asks again next time.', run: async () => {
    play(); await wait(100); STEPS.exam({exam: true}, 'elder'); await wait(400); }},
  {id: 'exam-match', title: 'Matching', save: 'examReady', why: 'The exam: a word, then its picture, round by round.', run: async () => {
    play(); await wait(100); confirmBox = async () => true; STEPS.exam({exam: true}, 'elder'); await wait(500); }},
  {id: 'exam-passed', title: 'You passed!', save: 'examReady', why: 'How many you matched right first time, and the words you missed, to tap and hear.', run: async () => {
    play(); await wait(100); confirmBox = async () => true; matchWords = async words => new Set(words.slice(0, 3)); STEPS.exam({exam: true}, 'elder'); await wait(500); }},
  {id: 'exam-not-yet', title: 'Not quite yet', save: 'examReady', why: 'Fewer than 24: practise the words you missed, and take the exam again whenever you’re ready.', run: async () => {
    play(); await wait(100); confirmBox = async () => true; matchWords = async words => new Set(words.slice(0, 8)); STEPS.exam({exam: true}, 'elder'); await wait(500); }},
  {id: 'certificate', title: 'Your certificate', save: 'examPassed', why: 'On the classroom wall, beside the window, once you’ve passed (no writing on it).', run: async () => {
    play(); await wait(500); }},
  {id: 'feast-seats', title: 'The troop at the feast', save: 'feastSeats', why: 'With the exam passed, the old, big and little monkeys sit down at the tables: come to the big tree, and the feast begins.', run: async () => {
    play(); await wait(500); }},
  // the feast, told like the opening: each screen is held where it waits for Next (introClock: just after its caption's
  // time, in scenes.feast; advancedTo: which caption)
  {id: 'feast-food', title: 'The great feast', save: 'feastSeats', why: 'The whole troop round the tables, with everything you brought: 我们有桃子，有蜂蜜，有鱼！', run: async () => {
    play(); await wait(100); storyScene('feast'); introClock = .05; advancedTo = 0; await wait(400); }},
  {id: 'feast-story', title: 'The old monkey’s story', save: 'feastSeats', why: 'The old monkey tells the story of your first days, from the book’s opening: 山上有一个大石头。…', run: async () => {
    play(); await wait(100); storyScene('feast'); introClock = 3.05; advancedTo = 1; await wait(400); }},
  {id: 'feast-happy', title: 'Happy', save: 'feastSeats', why: '小猴子很快乐！ (快乐 in bold green, taught after the scene): the troop hops for joy.', run: async () => {
    play(); await wait(100); storyScene('feast'); introClock = 21.5; advancedTo = 7; await wait(400); }},
  {id: 'feast-sad', title: 'But the king isn’t happy', save: 'feastSeats', why: 'Dusk, alone on a rock: 可是美猴王不快乐。 我们会老…… (We’ll all grow old), told gently.', run: async () => {
    play(); await wait(100); storyScene('feast'); introClock = 27.05; advancedTo = 9; await wait(400); }},
  {id: 'feast-immortals', title: 'Across the sea', save: 'feastSeats', why: 'The old monkey: 海那边有神仙。 神仙不会老！ (immortals, who never grow old), their mountain glowing far off.', run: async () => {
    play(); await wait(100); storyScene('feast'); introClock = 30.05; advancedTo = 10; await wait(400); }},
  {id: 'feast-find', title: 'I’m going to find them!', save: 'feastSeats', why: 'Sunrise: 我要去找神仙！', run: async () => {
    play(); await wait(100); storyScene('feast'); introClock = 36.05; advancedTo = 12; await wait(400); }},
  {id: 'raft-walk', title: 'Down to the shore', save: 'raftWalk', why: 'The big monkey: 我们来做木筏吧！ The old, big and little monkeys follow you down to the shore, where the rest of the troop is waiting.', run: async () => {
    play(); await wait(600); }},
  {id: 'raft-ready', title: 'Your raft', save: 'raftReady', why: 'At the water’s edge, the troop builds your raft (木筏) as you watch, from logs, rope and a pole, and says goodbye: 再见！ 我们等你！', run: async () => {
    play(); await wait(600); }},
  {id: 'sail-away', title: 'Sailing away', save: 'raftReady', why: 'A at your raft: you sail away, the troop waving from the shore: 美猴王坐木筏走了。', run: async () => {
    play(); await wait(100); storyScene('sailAway'); introClock = 6.05; advancedTo = 2; await wait(400); }},
  {id: 'chapter-end', title: 'Chapter 1 complete!', save: 'chapterDone', why: 'The end of chapter 1: how many words you caught, your friends and shells, and what comes next. You’re back on the shore.', run: async () => {
    play(); await wait(100); STEPS.areaEnd(); await wait(500); }},
  {id: 'scroll-describing', title: 'Word Scroll: describing words', save: 'fishBoth', why: '小 (little) and 大 (big), from fishing, on a tab of their own.', run: async () => {
    play(); await wait(100); openScroll(() => closeCard(), 0, 'describing'); await wait(400); }},
  {id: 'bag-fishing', title: 'The bag: For fishing', save: 'fishBoth', why: 'Your rod, and bait from the 老板: with some in your bag, a big fish bites next.', run: async () => {
    play(); await wait(100); bagPage(() => closeCard()); await wait(100); click('.bagtabs [data-tab=fishing]'); await wait(300); }},
  {id: 'honey-energy', title: 'Full of energy', save: 'honeyIn', why: 'After eating honey, you walk faster for a minute, golden sparks flying off behind you.', run: async () => {
    play(); await wait(100); energise('蜂蜜', 60); S.pos = {place: 'homeGround', x: 20, y: 9, dir: 'right'}; placePlayer();
    pl.mv = {fx: 20, fy: 9, tx: 21, ty: 9, t0: performance.now() - 5e8, dur: 1e9}; await wait(300); }},   // (held in the middle of a step, as you look)
  {id: 'tip-eat', title: 'Tip: eating honey', save: 'honeyIn', why: 'The first time honey is in your bag (from the hungry monkey), a tip by BAG says to eat it to walk faster, and how.', run: async () => {
    S.tips = {...S.tips}; delete S.tips.eat; play(); await wait(700); }},
  {id: 'hungry-has-bees', title: 'We have bees now!', save: 'beesHome', why: 'The hungry monkey, with a ! once the bees are home: 我们有蜜蜂了！ (the hive and the honey come next).', run: async () => {
    play(); await wait(100); talk(npc('hungry')); await wait(500); }},
  {id: 'lesson', title: 'Practice', save: 'lessonWait', why: 'The timetable’s 练习 Practice tab: the words that need practice, and a practice lesson (matching words to pictures, then a gap), the practice post’s job now, any time.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(300); click('.tab[data-tab=practice]'); await wait(400); }},
  {id: 'lesson-wait', title: 'A new lesson opens after 5 more questions', save: 'lessonWait', why: 'After a lesson that teaches new words, the next new lesson, in any subject, waits till you’ve answered 8 more questions, anywhere (decided 26 October 2026): the timetable says how many more, with a bar, and its main button is Practise.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(500); }},
  {id: 'lesson-again', title: 'Lesson 1 again', save: 'lessonWait', why: 'Choose a lesson you’ve done (✓, with the D-pad or a tap): the words it taught, and the button says Lesson 1 again, with nothing new, never waiting.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(300); click('.tab[data-tab=numbers]'); await wait(200); click('.tile[data-lesson="1"]'); await wait(400); }},
  {id: 'lesson-done', title: 'Lesson 3 done!', save: 'numbersTen', why: 'The end of a lesson: what it taught, how you did, and what’s next in the subject (here, the next new lesson waits for 8 more questions). Timetable goes back to choose another.', run: async () => {
    play(); await wait(100); here().lessonTurn = S.turn || 0; lessonEnd(AREA.lessons[0], 3, ['八'], false, {right: 5, asked: 5, shells: 2}); await wait(500); }},
  {id: 'timetable-wall', title: 'The timetable on the wall', save: 'lessonWait', why: 'Where the right-hand window was: a chart with no writing, a row a subject, a gold star for each lesson done, a green square round one that’s ready. A at it opens the timetable.', run: async () => {
    play(); await wait(100); S.pos = {place: 'school', x: 12, y: 2, dir: 'up'}; placePlayer(); await wait(500); }},
  {id: 'pe-timetable', title: 'PE on the timetable', save: 'peNew', why: 'Once the first two lessons are done (四 五 六, and 红色 黄色 白色), a third subject: 体育 tǐyù PE, two lessons, a race (跑) and a jog (跑步), out on the sports ground.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(500); }},
  {id: 'pe-out', title: 'The class goes out', save: 'peNew', why: 'Start PE’s lesson 1: the class goes out to the sports ground, and the teacher, by the big drum, starts a race: 一，二，三，跑！ (One, two, three, run!), teaching 跑. You in the middle lane, your classmates either side, the troop watching under the banners.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(400); click('[data-a=ok]'); await wait(300); next(); await wait(1500); }},
  {id: 'pe-run-card', title: '跑 pǎo · to run', save: 'peNew', why: '跑’s card, after the teacher’s line: a monkey running hard, speed lines and dust behind it (unlike 跳, leaping up).', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(400); click('[data-a=ok]'); await wait(300); next(); await wait(1500); next(); await wait(800); }},
  {id: 'pe-race', title: 'The race: 很好！', save: 'peNew', why: 'Hold B as you walk, to run: a third faster, dust behind you. Your classmates set off when you do, faster than you walk and slower than you run, to the red ribbon; you run, and win. At the finish the teacher says 很好！ (Very good!), however you did, and the first time you win, 3 🐚.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(400); click('[data-a=ok]'); await wait(300); next(); await wait(1500); next(); await wait(800);
    await gotIt(); await wait(400); bHeld = true; held = 'right'; await wait(550); }},
  {id: 'sports-ground', title: '操场 cāochǎng · Sports ground', save: 'peNew', why: 'Through a gap in the trees at the home ground’s back left: one screen, a sandy track of three lanes (一 二 三 at the start, a red ribbon at the finish), the big drum, red banners, a rack of staffs and a spear, stone padlocks, and plum-blossom poles with a little monkey on the tallest.', run: async () => {
    play(); await wait(100); S.pos = {place: 'sportsGround', x: 7, y: 8, dir: 'up'}; placePlayer(); await wait(500); }},
  {id: 'home-gap', title: 'The way to the sports ground', save: 'peNew', why: 'Once PE is on the timetable, a gap in the trees at the home ground’s back left, under the cliff, by the school.', run: async () => {
    play(); await wait(100); S.pos = {place: 'homeGround', x: 3, y: 3, dir: 'left'}; placePlayer(); await wait(500); }},
  {id: 'run-tip', title: 'Tip: hold B to run', save: 'peRun', why: 'Once PE has taught you 跑, a tip points at B: hold it as you walk, to run (and the label under B says Run).', run: async () => {
    play(); S.tips = {...S.tips, run: 0}; delete S.tips.run; await wait(1200); }},
  {id: 'pe-jog', title: 'Going running', save: 'peRun', why: 'PE’s lesson 2: 我们去跑步吧！ (Let’s go running!), teaching 跑步, and the teacher leads the class once round the track, you behind him and your classmates behind you.', run: async () => {
    play(); await wait(100); S.pos = {place: 'school', x: 7, y: 3, dir: 'up'}; placePlayer(); talk(npc('elder')); await wait(300); next(); await wait(400); click('.tab[data-tab=pe]'); await wait(200);
    click('[data-a=ok]'); await wait(300); next(); await wait(1500); next(); await wait(800); await gotIt(); await wait(1600); }},
  {id: 'tasks-practise', title: 'Tasks: your next new lesson', save: 'lessonWait', why: 'While the next new lesson waits, your tasks say which, and how many more questions it waits for: in a practice lesson, an animal’s game or a battle, they all count.', run: async () => {
    play(); await wait(100); tasksPage(() => closeCard()); await wait(300); }},
  {id: 'king-reply', title: 'Your name, as king', save: 'king', why: 'What you say shows 美猴王 now, such as your reply to a monkey’s 你好.', run: async () => {
    play(); await wait(100); (async () => { await showDialog(speaker('troop1'), L.hi); await replyWith('你好'); })(); await wait(200); next(); await wait(200); click('#talk .reply'); await wait(400); }},
  {id: 'count-two', title: 'Counting the troop in', save: 'king', why: 'The card for 二 explains 两.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); next(); await wait(400); }},
  {id: 'troop-home', title: 'The whole troop is home', save: 'home', run: async () => { play(); await wait(500); }},
  {id: 'doorway', title: 'Tired? Sleep in a bed', save: 'atDoor', why: 'Just inside the entrance, a monkey teaches 睡觉 (sleep).', run: async () => { play(); await wait(100); talk(npc('doorway')); await wait(400); }},
  {id: 'bed', title: 'Ready to sleep', save: 'byBed', why: 'Facing a bed (once you know 床): A says Sleep.', run: async () => { play(); await wait(500); }},
  {id: 'sleeping', title: 'Sleeping', save: 'byBed', why: 'You hop into the bed and lie under the leaf blanket; the cave goes dim and Zs float up (held still here). Then you hop down with your health full.', run: async () => { play(); await wait(200); sleepAt = {x: 12, y: 1}; pl.px = 12 * T; pl.py = T; setInterval(() => { sleepT = performance.now() - SLEEP_MS * .45; }, 30); await wait(300); }},
  {id: 'menu', title: 'Menu', save: 'middle', run: async () => { play(); await wait(100); openMenu(); await wait(300); }},
  {id: 'saved', title: 'Saved', save: 'middle', why: 'The menu’s Save button: it saves by itself anyway, and this says so.', run: async () => { S.tips.select = S.tips.start = 1; play(); await wait(100); openMenu(); click('[data-m=save]'); clearTimeout(msgT); await wait(300); }},
  {id: 'tasks', title: 'Tasks', save: 'meadowTasks', why: 'The most there are at once: in the meadow, before the rocks roll away. Just what to do now, full width, with how much of the chapter you’ve done; Checklist ▸ opens the checklist.', run: async () => { play(); await wait(100); tasksPage(() => closeCard()); await wait(300); }},
  {id: 'tasks-list', title: 'The chapter’s checklist', save: 'meadowTasks', why: 'Checklist ▸ on the Tasks page: what’s still to do first, then what you’ve done, a line each, in two columns. ◂ Tasks goes back.', run: async () => { play(); await wait(100); tasksPage(() => closeCard(), 'list'); await wait(300); }},
  {id: 'tasks-list-ch1', title: 'Chapter 1’s checklist', save: 'feastTable', why: 'Chapter 1, at the feast’s table: more done than still to do.', run: async () => { play(); await wait(100); tasksPage(() => closeCard(), 'list'); await wait(300); }},
  {id: 'scroll', title: 'Word Scroll', save: 'middle', run: async () => { play(); await wait(100); openScroll(() => closeCard()); await wait(300); }},
  {id: 'word-page', title: 'A word’s page', save: 'middle', run: async () => { play(); await wait(100); wordPage('桃子', () => closeCard()); await wait(300); }},
  {id: 'made-goat-word', title: 'A new word with a story', save: 'knowsSheep', why: 'The first step: just the word, its picture, pinyin, English and the note. A is How it’s made ▸.', run: async () => {
    play(); await wait(100); showNotice('山羊', {note: 'A goat stands on the cliff, chewing. Answer its questions to make friends.'}); await wait(400); }},
  {id: 'made-goat', title: 'How a word is made', save: 'knowsSheep', why: 'The second step, a card of its own, which comes together as you watch: its parts, each with its picture (if it’s a word with one), pinyin and English, green when it’s a word you know, then each flies into the word: 山 (mountain) + 羊 (sheep) = 山羊, with its own English, goat. Back (B) goes back to the word; Watch again plays it again; Got it (A) adds it to your Word Scroll.', run: async () => {
    play(); await wait(100); showNotice('山羊', {note: 'A goat stands on the cliff, chewing. Answer its questions to make friends.'}); await wait(300); click('[data-a=made]'); await wait(400); }},
  {id: 'made-same', title: 'Two words, one character', save: 'knowsFruit', why: '苹果 (apple), once you know 水果 (fruit): the two side by side, the 果 they share lit in each. 苹 means nothing on its own, so there’s nothing simpler to say (before you know 水果, 苹果’s card is just Got it).', run: async () => {
    play(); await wait(100); showNotice('苹果', {note: 'You pick one from the tree.'}); await wait(300); click('[data-a=made]'); await wait(400); }},
  {id: 'made-three', title: 'How a word is made: three parts', save: 'phrases', why: 'The most parts there are: 我 (I) + 不 (not) + 要 (to want) = 我不要, with its own English, no thanks. 我 and 要 are words you know.', run: async () => {
    play(); await wait(100); madeCard('我不要', () => {}, () => {}, 'Got it'); await wait(400); }},
  {id: 'made-clue', title: 'How a word is made: a clue inside', save: 'middle', why: 'Only one you can see: the character big, with the clue beside it, and why: 口, a mouth, on the left of 吃 (to eat).', run: async () => {
    play(); await wait(100); madeCard('吃', () => {}, () => {}, 'Got it'); await wait(400); }},
  {id: 'made-drawn', title: 'How a word is made: drawn from a picture', save: 'middle', why: 'The picture beside the character it was drawn from: 山, drawn like three mountain peaks.', run: async () => {
    play(); await wait(100); madeCard('山', () => {}, () => {}, 'Got it'); await wait(400); }},
  {id: 'made-page', title: 'A word’s page: English, then How it’s made', save: 'middle', why: 'In the Word Scroll, the English button shows the English, then becomes How it’s made: here, after pressing it once.', run: async () => {
    play(); await wait(100); wordPage('动物', () => closeCard()); await wait(300); click('[data-a=en]'); await wait(300); }},
  {id: 'made-page-how', title: 'How it’s made, from a word’s page', save: 'middle', why: 'Its card, with Back (A and B) to the word’s page.', run: async () => {
    play(); await wait(100); wordPage('动物', () => closeCard()); await wait(300); click('[data-a=en]'); await wait(100); click('[data-a=made]'); await wait(400); }},
  {id: 'friends', title: 'Friends', save: 'allFriends', why: 'Every animal in the prologue your friend: 4 of 4.', run: async () => { play(); await wait(100); openMenu(); await wait(100); click('[data-m=friends]'); await wait(300); }},
  {id: 'friends-chapter1', title: 'Friends, in chapter 1', save: 'friendsChapter1', why: 'Chapter 1’s animals join: the deer a friend, the fox met but not won over, the bees 2 of 6, the owl and butterfly shadows with clues; then the troop and others.', run: async () => { play(); await wait(100); openMenu(); await wait(100); click('[data-m=friends]'); await wait(300); }},
  {id: 'friends-prologue', title: 'Friends, in the prologue', save: 'middle', why: 'The prologue’s four animals: the rabbit your friend, the others as shadows with clues (chapter 1’s never show till it begins). One you’ve met but not won over would be in colour, marked Not a friend yet.', run: async () => { play(); await wait(100); openMenu(); await wait(100); click('[data-m=friends]'); await wait(300); }},
  {id: 'friends-clue', title: 'A friend to find', save: 'middle', why: 'Tap a shadow: where it lives, and what to do. Back returns to the page, on that shadow.', run: async () => { play(); await wait(100); openMenu(); await wait(100); click('[data-m=friends]'); await wait(200); click('[data-clue]'); await wait(300); }},
  {id: 'friend-page', title: 'A friend’s page', save: 'allFriends', why: 'Tap a friend: its page, as in the Word Scroll, with its English behind English (here, pressed), which then becomes How it’s made.', run: async () => {
    play(); await wait(100); openMenu(); await wait(100); click('[data-m=friends]'); await wait(200); click('.friends [data-w="山羊"]'); await wait(300); click('[data-a=en]'); await wait(300); }},
  {id: 'bag', title: 'The bag', save: 'packed', why: 'In tabs: it opens on Food (how many of each, and what it does), with For someone and To fight with beside it. Your health and shells at the top.', run: async () => {
    play(); await wait(100); openMenu('bag'); await wait(100); click('[data-m=bag]'); await wait(300); }},
  {id: 'bag-someone', title: 'The bag: For someone', save: 'packed', why: 'What you’re carrying for someone, and who for (◀ ▶ on the D-pad, or a tap, switches tab). The tabs stay where they were.', run: async () => {
    play(); await wait(100); bagPage(() => closeCard()); await wait(100); click('.bagtabs [data-tab=someone]'); await wait(300); }},
  {id: 'bag-fight', title: 'The bag: To fight with', save: 'packed', why: 'Your stick, and how hard it hits.', run: async () => {
    play(); await wait(100); bagPage(() => closeCard()); await wait(100); click('.bagtabs [data-tab=fight]'); await wait(300); }},
  {id: 'bag-full', title: 'A fuller bag', save: 'packed', why: 'Three foods (Food, two rows) and wood and stones for the big monkey (For someone): each tab its own things, so it never gets long.', run: async () => {
    play(); await wait(100); S.bag = {'桃子': 3, '苹果': 2, '蜂蜜': 2}; here().holding = {wood: '木头', stones: '石头'}; bagPage(() => closeCard()); await wait(300); }},
  {id: 'bag-eat', title: 'Eating a peach from the bag', save: 'packed', why: 'Hurt: tap a peach, and 10 health comes back (the bar slides up).', run: async () => {
    play(); await wait(100); bagPage(() => closeCard()); await wait(100); click('.bagitem[data-w="桃子"]'); await wait(300); }},
  {id: 'pick-peach', title: 'Picking a peach for your bag', save: 'byPeaches', why: 'Once the hungry monkey has eaten, the fruit trees fill your bag.', run: async () => {
    play(); await wait(200); S.bag = {}; pressA(); await wait(900); }},
  {id: 'wardrobe', title: 'Wardrobe', save: 'middle', run: async () => { play(); await wait(100); wardrobePage(() => closeCard()); await wait(300); }},
  {id: 'settings', title: 'Settings', save: 'middle', run: async () => { play(); await wait(100); openSettings(); await wait(300); }},
  {id: 'map-soon', title: 'MAP: the map, coming soon', save: 'middle', why: 'MAP (or P) says so, until there is a map.', run: async () => { play(); await wait(1500); closeMessage(); pressMap(); await wait(300); }},
  {id: 'fps', title: 'Frames a second, under the power light', save: 'middle', why: 'Settings, Frames a second: how many frames the game draws each second (at most about 60).', run: async () => { S.fps = true; play(); await wait(1600); }},
  {id: 'howto-1', title: 'How to play, 1 of 3', save: 'middle', why: 'Now only in Settings.', run: async () => { play(); await wait(100); howToPlay(); await wait(300); }},
  {id: 'howto-2', title: 'How to play, 2 of 3', save: 'middle', run: async () => { play(); await wait(100); howToPlay(); await wait(100); click('[data-a=next]'); await wait(300); }},
  {id: 'howto-3', title: 'How to play, 3 of 3', save: 'middle', run: async () => { play(); await wait(100); howToPlay(); await wait(100); click('[data-a=next]'); await wait(100); click('[data-a=next]'); await wait(300); }},
  {id: 'story', title: 'The Story Scroll', save: 'middle', run: async () => { play(); await wait(100); storyScroll(); await wait(400); }},
  {id: 'word-test', title: 'The word test', save: 'middle', why: 'Matching words to pictures. It comes back as the troop’s send-off at the end of Area 1.', run: async () => { play(); await wait(100); wordTest(); await wait(400); }}
];

// What goes at the top of each frame, before the game's own scripts: pretend storage holding the
// save, a pretend Chinese voice that says nothing, no sound effects or music, the helpers, and a
// list of any errors.
function prepare(save, voices, phone){   // phone: as on a phone, with no keyboard help under the console
  const mem = {};
  if (save) mem['xiaohouzi-v2'] = JSON.stringify(save);
  const storage = {getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; },
    clear: () => { for (const k in mem) delete mem[k]; }, key: i => Object.keys(mem)[i] || null, get length(){ return Object.keys(mem).length; }};
  Object.defineProperty(window, 'localStorage', {value: storage, configurable: true});
  const list = voices === 'missing' ? [{lang: 'en-GB', name: 'English'}] : [{lang: 'zh-CN', name: 'Chinese'}];
  const speech = {speaking: false, pending: false, speak: u => setTimeout(() => u.onend && u.onend(), 200), cancel(){}, pause(){}, resume(){},
    getVoices: () => list, addEventListener(){}, removeEventListener(){}};
  Object.defineProperty(window, 'speechSynthesis', {value: speech, configurable: true});
  window.SpeechSynthesisUtterance = function(text){ this.text = text; };
  window.AudioContext = window.webkitAudioContext = undefined;
  const still = document.createElement('style');   // no animations, so every screen is seen as it settles
  still.textContent = '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}' + (phone ? '.keys{display:none!important}' : '');
  document.head.append(still);
  window.__errors = [];
  window.addEventListener('error', e => window.__errors.push(e.message));
  window.addEventListener('unhandledrejection', e => window.__errors.push(String(e.reason && e.reason.message || e.reason)));
  window.wait = ms => new Promise(r => setTimeout(r, ms));
  window.click = sel => { const el = document.querySelector(sel); if (el) el.click(); return !!el; };
  // Got it on a new word's card: through How it's made, if it has a story (once it has come together)
  window.gotIt = async () => { if (click('[data-a=made]')){ await new Promise(r => setTimeout(r, 100)); click('[data-a=ok]'); } click('[data-a=ok]'); };
  window.next = () => { if (talkNext) talkNext(); };
  window.untilTip = async id => {   // on through the conversation (a card's main button, or the speech box's next) till a tip shows
    for (let i = 0; i < 20 && !(tip && tip.id === id); i++){
      const p = !modal.hidden && [...sheet.querySelectorAll('.primary')].find(x => !x.hidden && !x.disabled);
      if (p) p.click(); else next();
      await wait(250);
    }
    await wait(300);
  };
  window.npc = id => NPCS.find(n => n.id === id);
  window.play = () => { click('#contBtn'); };   // Continue the game
}

/* ================= THE PAGE ================= */
let gamePage = null;
async function load(fig, s, [w, h], zoom){
  if (!gamePage) gamePage = await (await fetch('../index.html', {cache: 'no-store'})).text();
  const box = fig.querySelector('.frame'), note = fig.querySelector('.state');
  box.style.width = w * zoom + 'px'; box.style.height = h * zoom + 'px';
  const f = document.createElement('iframe');
  f.width = w; f.height = h; f.style.transform = `scale(${zoom})`; f.title = s.title;
  const top = `<base href="${new URL('../', location.href)}"><script>(${prepare})(${JSON.stringify(s.save ? SAVES[s.save] : null)}, ${JSON.stringify(s.voices || 'zh')}, ${h < 600})<\/script>`;
  f.srcdoc = gamePage.replace(/<head>/i, '<head>' + top);
  box.replaceChildren(f);
  note.textContent = 'Loading…';
  await new Promise(r => f.addEventListener('load', r, {once: true}));
  try {
    if (s.run) await f.contentWindow.eval(`(${s.run})()`);
    const errs = f.contentWindow.__errors;
    note.className = 'state' + (errs.length ? ' err' : '');
    note.textContent = errs.length ? 'Error: ' + errs.join('; ') : '';
  } catch(e){ note.className = 'state err'; note.textContent = 'Error: ' + e.message; }
}
function build(){
  const [w, h] = $('#size').value.split('x').map(Number), zoom = +$('#zoom').value;
  const only = new URLSearchParams(location.search).get('only');
  const shown = only ? SCREENS.filter(s => only.split(',').includes(s.id)) : SCREENS;
  const grid = $('#grid');
  grid.replaceChildren();
  for (const s of shown){
    const [fw, fh] = s.size ? s.size.split('x').map(Number) : [w, h];   // a screen can have its own size
    const fig = document.createElement('figure');
    fig.style.width = fw * zoom + 'px';
    fig.innerHTML = `<div class="frame"></div><figcaption><b>${s.title}</b>${s.why ? `<span class="why">${s.why}</span> ` : ''}<span class="state"></span> <a href="?only=${s.id}">alone</a></figcaption>`;
    grid.append(fig);
    load(fig, s, [fw, fh], zoom);
  }
}
const $ = sel => document.querySelector(sel);
if (typeof module !== 'undefined') module.exports = {SCREENS, SAVES};   // for the tests
else {
  const q = new URLSearchParams(location.search);
  if (q.get('size')) $('#size').value = q.get('size');
  if (q.get('zoom')) $('#zoom').value = q.get('zoom');
  $('#size').onchange = $('#zoom').onchange = $('#reload').onclick = build;
  build();
}
