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
const MIDDLE_WORDS = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '吃', '喝', '要', '我', '猴子', '老板', '河', '鱼', '头带'];
const QUIET = {sound: false, music: false};
const ALL_TIPS = {walk: 1, talk: 1, look: 1, grey: 1, menu: 1};   // tips already had (js/tips.js)
const SAVES = {
  // just born, with the old monkey waiting: no tips had yet
  born: {version: 19, started: true, tips: {}, ...QUIET, w: knows(1, ['石头']), pos: {x: 9, y: 2, dir: 'up'}},
  // halfway through Flower Fruit Mountain, holding a peach for the hungry monkey
  middle: {version: 19, started: true, tips: ALL_TIPS, ...QUIET, shells: 6, w: knows(1, MIDDLE_WORDS),
    met: ['rabbit'], friends: ['rabbit'], pos: {x: 13, y: 6, dir: 'up'},
    wardrobe: {owned: ['头带'], wearing: []},
    areas: {1: {elder: 2, hungry: 'asked', thirsty: 'asked', flowers: 'not asked', holding: {hungry: '桃子'}, gate: true, story: false}}},
};
SAVES.knowsWell = {...SAVES.middle, w: knows(2, MIDDLE_WORDS)};
SAVES.meadowTasks = {...SAVES.middle, areas: {1: {...SAVES.middle.areas[1], gate: false}}};   // (the rocks still there: every task in the meadow at once)
SAVES.phrases = {...SAVES.middle, w: {...SAVES.middle.w, ...knows(1, ['谢谢', '不客气', '再见', '对不起', '没关系', '松鼠'])}};   // the phrases you reply with, all caught
// two words of the four the old monkey wants: he says to go and learn some more, in a conversation of one line (Done)
SAVES.notYet = {...SAVES.born, tips: ALL_TIPS, w: knows(1, ['石头', '你好', '山']), areas: {1: {elder: 1}}, pos: {x: 7, y: 2, dir: 'up'}};
// facing the hungry monkey, who hasn't asked for anything yet
SAVES.hungryAsks = {...SAVES.middle, areas: {1: {elder: 2, hungry: 'not asked', thirsty: 'not asked', flowers: 'not asked', holding: {}, gate: false}}, pos: {place: 'meadow', x: 13, y: 6, dir: 'up'}};
SAVES.bigHello = {...SAVES.hungryAsks, pos: {place: 'meadow', x: 4, y: 10, dir: 'right'}};   // facing the big monkey, in the middle meadow
// the old monkey has told you about animals, and wants the meadow's words too: you know 山 and 树, not 河, 鱼 or 鸟; the
// thirsty monkey has asked for water, and you're facing the river
SAVES.meadowWords = {...SAVES.middle, w: knows(1, ['石头', '你好', '山', '花', '草', '树', '动物', '吃', '喝']), met: [], friends: [],
  areas: {1: {elder: 2, hungry: 'asked', thirsty: 'asked', flowers: 'not asked', holding: {}, gate: false}}, pos: {place: 'meadow', x: 17, y: 10, dir: 'right'}};
SAVES.lowTalk = {...SAVES.middle, areas: {1: {...SAVES.middle.areas[1], gate: false}}, pos: {place: 'meadow', x: 15, y: 19, dir: 'down'}};   // on the path at the bottom of the meadow, facing the little monkey (before the gate, it's there)   // every word Recognised: animals ask you to read
// chapter 1 has begun: the prologue is done, and the troop is at the waterfall; you're beside the old monkey
const PROLOGUE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 3, story: true, bought: ['头带'], cave: 0};
SAVES.chapter1 = {...SAVES.middle, w: knows(1, [...MIDDLE_WORDS, '瀑布', '狐狸', '松鼠', '山羊', '朋友']), met: ['rabbit', 'fox', 'squirrel', 'goat'],
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
SAVES.pineFirst = {...SAVES.homeGround, areas: {1: {...BUILDING, woodIn: 0}}, pos: {place: 'homeGround', x: 25, y: 1, dir: 'up'}};   // about to go in for the first time
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
// number lessons: by the teacher, just learning 四; and later, knowing the numbers to six
SAVES.numbersNew = {...SAVES.classroom, w: {...SAVES.classroom.w, ...knows(1, ['一', '二', '三', '同学', '碗', '兔子'])}, pos: {place: 'school', x: 7, y: 3, dir: 'up'}};
SAVES.numbersLater = {...SAVES.numbersNew, w: {...SAVES.numbersNew.w, ...knows(2, ['四', '五', '六'])}};
SAVES.numbersTen = {...SAVES.numbersLater, w: {...SAVES.numbersLater.w, ...knows(2, ['七', '八', '九', '鸟']), ...knows(1, ['十'])}};
// colour lessons: by the teacher, knowing the numbers to ten and no colours yet, so the first lesson is 红色 (it paints the
// lanterns); knowing red, then red, yellow and white, just learning 黑色; then knowing it (the door's painted black); and
// the school on the home ground, half painted, then all painted
SAVES.coloursNew = {...SAVES.numbersNew, w: {...SAVES.numbersNew.w, ...knows(2, ['四', '五', '六', '七', '八', '九', '十'])}};
SAVES.coloursRed = {...SAVES.coloursNew, w: {...SAVES.coloursNew.w, ...knows(2, ['红色'])}};
SAVES.coloursThree = {...SAVES.coloursNew, w: {...SAVES.coloursNew.w, ...knows(2, ['红色', '黄色', '白色'])}};
SAVES.coloursLater = {...SAVES.coloursThree, w: {...SAVES.coloursThree.w, ...knows(2, ['黑色'])}};
SAVES.schoolHalf = {...SAVES.coloursThree, w: {...SAVES.coloursThree.w, ...knows(2, ['黑色', '蓝色', '绿色'])}, pos: {place: 'homeGround', x: 11, y: 6, dir: 'up'}};
SAVES.schoolPainted = {...SAVES.schoolHalf, w: {...SAVES.schoolHalf.w, ...knows(2, ['棕色', '橙色', '粉色'])}};
// flowers for the school (version 30: they're chapter 1's): the big monkey asks for them once it's all painted; picking them
// at the top of the home ground; bringing them to him; and planted in front of the school
SAVES.flowersAsk = {...SAVES.schoolPainted, pos: {place: 'homeGround', x: 15, y: 5, dir: 'up'}};
SAVES.flowersPicking = {...SAVES.schoolPainted, version: 30, areas: {1: {...SAVES.schoolPainted.areas[1], flowers: 'asked'}}, pos: {place: 'homeGround', x: 26, y: 3, dir: 'up'}};
SAVES.flowersBack = {...SAVES.flowersPicking, areas: {1: {...SAVES.flowersPicking.areas[1], holding: {flowers: '花'}, picked: {flowers: ['红色', '黄色', '白色']}}},
  pos: {place: 'homeGround', x: 15, y: 5, dir: 'up'}};
SAVES.flowersPlanted = {...SAVES.flowersPicking, areas: {1: {...SAVES.flowersPicking.areas[1], flowers: 'done', schoolFlowers: true}}, pos: {place: 'homeGround', x: 11, y: 7, dir: 'up'}};
SAVES.caveTop = {...SAVES.home, pos: {place: 'cave', x: 7, y: 5, dir: 'up'}};   // by the beds, the table and the bowls
SAVES.atDoor = {...SAVES.ledIn, pos: {place: 'cave', x: 8, y: 12, dir: 'right'}};   // beside the monkey just inside the entrance
SAVES.byBed = {...SAVES.home, w: {...SAVES.home.w, ...knows(1, ['睡觉'])}, hearts: 2, pos: {place: 'cave', x: 12, y: 2, dir: 'up'}};   // hurt, facing a bed
SAVES.rocksGone = {...SAVES.middle, areas: {1: {...SAVES.middle.areas[1], hungry: 'done', thirsty: 'done', holding: {}, gate: true}}, pos: {place: 'meadow', x: 15, y: 2, dir: 'left'}};   // the troop gathers where the rocks were
SAVES.settingOff = {...SAVES.rocksGone, version: 29, w: {...SAVES.rocksGone.w, ...knows(1, ['再见'])}, areas: {1: {...SAVES.rocksGone.areas[1], flowers: 'done', climb: 1}},
  pos: {place: 'meadow', x: 15, y: 2, dir: 'up'}};   // said goodbye to the old monkey, about to walk up past the big monkey (no stick yet)
SAVES.climbing = {...SAVES.rocksGone, version: 25, w: {...SAVES.rocksGone.w, ...knows(1, ['路'])}, areas: {1: {...SAVES.rocksGone.areas[1], climb: 1}}, pos: {place: 'path', x: 15, y: 14, dir: 'left'}};   // (version 25: older saves on the path are moved off it)
SAVES.fighting = {...SAVES.climbing, w: {...SAVES.climbing.w, ...knows(1, ['棍子', '蛇'])}, hearts: 4, bag: {'桃子': 2, '苹果': 1}};   // on the path, with the stick, a snake met before, and fruit
SAVES.packed = {...SAVES.fighting, hearts: 3, areas: {1: {...SAVES.fighting.areas[1], thirsty: 'asked', holding: {thirsty: '水'}}}};   // hurt, with fruit, and water for the thirsty monkey
SAVES.byPeaches = {...SAVES.fighting, pos: {place: 'meadow', x: 2, y: 6, dir: 'left'}};   // by a peach tree, the hungry monkey fed
SAVES.hurt = {...SAVES.fighting, hearts: 2, pos: {place: 'meadow', x: 15, y: 2, dir: 'left'}};
SAVES.valley = {...SAVES.fighting, pos: {place: 'valley', x: 18, y: 9, dir: 'up'}};   // at the fork in the river valley, by the fox
SAVES.deepIn = {...SAVES.fighting, pos: {place: 'falls', x: 7, y: 5, dir: 'up'}};   // below the wild boar, deep in the mountains
SAVES.atTheTop = {...SAVES.climbing, pos: {place: 'falls', x: 5, y: 1, dir: 'left'}};
SAVES.foundFall = {...SAVES.fighting, w: {...SAVES.fighting.w, ...knows(1, ['瀑布', '野猪', '山羊', '朋友'])}, areas: {1: {...SAVES.fighting.areas[1], flowers: 'done', climb: 2, boar: 1}},
  pos: {place: 'falls', x: 7, y: 3, dir: 'down'}};   // found the waterfall, setting off back down the narrow way
SAVES.leading = {...SAVES.foundFall, version: 28, areas: {1: {...SAVES.foundFall.areas[1], climb: 3, ledgeTip: 1}}, following: ['playful', 'big', 'elder'],
  pos: {place: 'path', x: 16, y: 18, dir: 'up'}};   // leading the troop up, at the bottom of the mountain path (version 28: climb 3 is leading them up)
SAVES.appleTree = {...SAVES.middle, pos: {place: 'meadow', x: 20, y: 17, dir: 'right'}};
SAVES.withApple = {...SAVES.middle, bag: {'苹果': 1}};   // an apple from the shop, to eat in an encounter
SAVES.allFriends = {...SAVES.chapter1, friends: ['rabbit', 'fox', 'squirrel', 'goat']};   // every animal won over
SAVES.wantsApple = {...SAVES.middle, areas: {1: {...SAVES.middle.areas[1], holding: {}, wanted: {hungry: '苹果'}}}, pos: {place: 'meadow', x: 13, y: 6, dir: 'up'}};
SAVES.facing = {...SAVES.born, tips: {walk: 1}, pos: {x: 7, y: 2, dir: 'up'}};   // facing the old monkey, having walked
SAVES.noMenuTip = {...SAVES.middle, tips: {...ALL_TIPS, menu: 0}};

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
  {id: 'game-card', title: 'A game’s card', save: 'middle', why: 'Continue, copy it to a file, or delete it.', run: async () => { slotCard(1); await wait(300); }},
  {id: 'game-empty', title: 'An empty game’s card', why: 'A new game, or one from a file.', run: async () => { slotCard(1); await wait(300); }},
  {id: 'game-delete', title: 'Deleting a game', save: 'middle', why: 'Asked once more; Keep it is the main button.', run: async () => { slotCard(1); click('[data-a=del]'); await wait(300); }},
  {id: 'save-files', title: 'Save files', save: 'middle', why: 'Your three games: choose one for its card.', run: async () => { click('#filesBtn'); await wait(300); }},
  {id: 'intro-sea', title: 'Opening: the mountain', why: 'The story in Chinese, with pinyin and English, read aloud.', run: async () => { click('#newBtn'); introClock = 2.85; advancedTo = 1; await wait(400); }},
  {id: 'intro-monkey', title: 'Opening: the monkey is born', run: async () => { click('#newBtn'); introClock = 9.05; advancedTo = 4; await wait(400); }},
  {id: 'intro-eyes', title: 'Opening: light in its eyes', run: async () => { click('#newBtn'); introClock = 10.65; advancedTo = 5; await wait(400); }},
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
  {id: 'talk-done', title: 'The last line: Done', save: 'notYet', why: 'A conversation’s last line says Done, not ▼ Next, so you can tell it’s ending.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(500); }},
  {id: 'message-ok', title: 'A message after talking', save: 'hungryAsks', why: 'Where the speech box was: A says OK, and closes it, never starting the conversation again. Then what you’ve just finished with rests for 2 seconds.', run: async () => {
    S.tasksSeen = Object.fromEntries(getTasks().map(t => [t.id, 1])); play(); await wait(100); toast('New task: Find some fruit for the hungry monkey'); clearTimeout(msgT); await wait(400); }},
  {id: 'hello-card', title: 'A new word in a conversation', save: 'born', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(400); }},
  {id: 'first-reply', title: 'Your first reply', save: 'born', why: 'His line stays in sight: The old monkey says hello. Now you say it!', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); click('[data-a=ok]'); await wait(400); }},
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
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); click('[data-a=ok]'); await wait(200);
    next(); await wait(200); next(); await wait(500); }},
  {id: 'go-look', title: 'Off you go', save: 'born', why: 'His hint, and the tip about grey words.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); click('[data-a=ok]'); await wait(200);
    next(); await wait(200); next(); await wait(200); next(); await wait(500); }},
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
  {id: 'big-hello', title: 'The big monkey says hello', save: 'bigHello', why: 'In the meadow, the big monkey has nothing to ask yet: his flowers wait for chapter 1.', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(500); }},
  {id: 'behind-tree', title: 'Behind a tree', save: 'middle', why: 'Its leaves cover you as you walk behind it.', run: async () => { play(); await wait(100); S.pos = {place: 'meadow', x: 12, y: 7, dir: 'left'}; placePlayer(); await wait(500); }},
  {id: 'stall', title: 'The shop owner’s stall', save: 'middle', why: 'Three squares wide, with the shop owner beside it.', run: async () => { play(); await wait(100); S.pos = {place: 'meadow', x: 9, y: 18, dir: 'up'}; placePlayer(); await wait(500); }},
  {id: 'apple-tree', title: 'The apple tree', save: 'appleTree', why: 'In the south-east, across the river, with yellow flowers nearby.', run: async () => { play(); await wait(500); }},
  {id: 'wants-other', title: 'He wants the other fruit', save: 'wantsApple', why: 'After you bring the peach first.', run: async () => { play(); await wait(500); }},
  {id: 'animal-card', title: 'Meeting an animal', save: 'middle', why: 'The first time: its name on a new-word card.', run: async () => {
    play(); await wait(100); showNotice('狐狸', {note: 'A wild fox jumped out of the 草 (grass)! Answer its questions to make friends.'}); await wait(400); }},
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
  {id: 'goat-read', title: 'The goat: read', save: 'knowsWell', why: 'On its cliff. Characters with pinyin, and just pictures to choose from.', run: async () => {
    play(); await wait(100); encounter({id: 'goat', hz: '山羊', img: portrait('goat'), wild: true, home: '山'}); await wait(500); }},
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
  {id: 'river-fork', title: 'The fork in the river valley', save: 'valley', why: 'Over the bridge, away from the river, or along it? The fox gives a hint.', run: async () => {
    play(); await wait(200); talk(npc('fox')); await wait(500); }},
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
  {id: 'battle-snake', title: 'A battle: your turn', save: 'fighting', why: 'Hit, eat (a peach brings a heart back) or run. Hearts on both sides.', run: async () => {
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
  {id: 'hurt', title: 'Hurt: your hearts, and resting', save: 'hurt', why: 'Your hearts show while you’re hurt; the old monkey lets you rest.', run: async () => {
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
  {id: 'pine-wood-first', title: 'Into the pine wood', save: 'pineFirst', why: 'The first time you go in: gloomy under the thick pines (but in the daytime: sunbeams, never night), with mist, and a wolf howling far off.', run: async () => {
    play(); await wait(100); arrive(25, 0).then(runEvents); await wait(1500); }},
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
  {id: 'battle-wolf', title: 'A battle with a wolf', save: 'pineWood', why: 'Three hearts: tougher than a snake or a spider, not as tough as the wild boar, and you can run away.', run: async () => {
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
  {id: 'number-lesson', title: 'A number lesson', save: 'numbersNew', why: 'With a new number to learn, a lesson is a number lesson: 上课！, then this card.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(500); }},
  {id: 'teacher-counts', title: 'One, two, three, four!', save: 'numbersNew', why: 'The teacher counts peaches onto his table, teaching 四 (bold).', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(300); click('[data-a=yes]'); await wait(500); }},
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
  {id: 'colour-lesson', title: 'A colour lesson', save: 'coloursNew', why: 'With a new colour to learn (taking turns with the numbers), a lesson is a colour lesson: 上课！, then this card.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(500); }},
  {id: 'teacher-paint', title: 'This is red.', save: 'coloursNew', why: 'The teacher opens a pot of paint, teaching 红色 (bold): red, yellow and white come first.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(300); click('[data-a=yes]'); await wait(500); }},
  {id: 'paint-first', title: 'The first colour', save: 'coloursNew', why: 'While 红色 is the only colour you know, the other answers are things you know: Which is it?', run: async () => {
    play(); await wait(100); rec('红色').lv = 1; colourQ({who: 'elder', w: '红色'}); await wait(600); }},
  {id: 'painting-lanterns', title: 'Painting the lanterns', save: 'coloursNew', why: 'The first colour lesson ends with the class painting the paper lanterns 红色 (red).', run: async () => {
    play(); await wait(100); rec('红色').lv = 1; storyScene('paintLanterns'); await wait(2300); }},
  {id: 'painted-sign', title: 'The sign is yellow!', save: 'coloursRed', why: 'The second: the sign, painted 黄色 (yellow), its writing dark red.', run: async () => {
    play(); await wait(100); rec('黄色').lv = 1; storyScene('paintSign'); await wait(4600); click('#nextBtn'); await wait(900); }},
  {id: 'painted-step', title: 'The step is white!', save: 'coloursThree', why: 'The third: the step at the door, painted 白色 (white).', run: async () => {
    play(); await wait(100); storyScene('paintSteps'); await wait(4600); click('#nextBtn'); await wait(900); }},
  {id: 'paint-new', title: 'Which paint?', save: 'coloursThree', why: 'A colour question while 黑色 is new: hear it, and choose from paints with their characters (colours you know).', run: async () => {
    play(); await wait(100); rec('黑色').lv = 1; colourQ({who: 'elder', w: '黑色'}); await wait(600); }},
  {id: 'paint-read', title: 'Which paint? (reading)', save: 'coloursLater', why: 'Once 黑色 is recognised: read it, and choose from the paints alone.', run: async () => {
    play(); await wait(100); colourQ({who: 'elder', w: '黑色'}); await wait(500); }},
  {id: 'painting-door', title: 'Painting the door', save: 'coloursLater', why: 'After the lesson, the class paints the door 黑色 (black) with long brushes, dripping paint, beside a pot of it.', run: async () => {
    play(); await wait(100); storyScene('paintDoor'); await wait(2300); }},
  {id: 'painted-roof', title: 'The roof is blue!', save: 'coloursLater', why: 'Then (Next) the troop jumps for joy, and the newly painted roof sparkles.', run: async () => {
    play(); await wait(100); storyScene('paintRoof'); await wait(4600); click('#nextBtn'); await wait(900); }},
  {id: 'school-colours', title: 'The school, half painted', save: 'schoolHalf', why: 'Each part painted as you learn its colour: the lanterns red, the sign yellow, the step white, the door black, the roof blue, the windows green.', run: async () => { play(); await wait(500); }},
  {id: 'school-painted', title: 'The school, all painted', save: 'schoolPainted', why: 'All nine colours: the walls brown, the pillars orange, and pink peach blossom under the windows too. The big monkey has a ! now.', run: async () => { play(); await wait(500); }},
  {id: 'flowers-ask', title: 'The school looks lovely!', save: 'flowersAsk', why: 'With the school painted in every colour, the big monkey: 学校很好看！ (好看 just for listening), then 我们来种花吧！ (Let’s plant some flowers!).', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(500); }},
  {id: 'flowers-want', title: 'Red, yellow and white flowers', save: 'flowersAsk', why: 'Then he asks for one of each of the first colours you learned, to plant in front of the school.', run: async () => {
    play(); await wait(100); talk(npc('big')); await wait(300); next(); await wait(300); next(); await wait(500); }},
  {id: 'picked-red', title: 'A red flower', save: 'flowersPicking', why: 'Each flower you pick shows what it is, with its own picture: 红色的花 (a red flower), said aloud, and how many you have.', run: async () => {
    play(); await wait(200); interact(...facing()); await wait(600); }},
  {id: 'planting', title: 'Planting the flowers', save: 'flowersBack', why: 'Bring them to the big monkey, and he plants them in front of the school as you watch: each square of the beds comes up out of the ground in turn, with a little pop.', run: async () => {
    play(); await wait(100); const was = mapLooks(); Object.assign(here(), {flowers: 'done', schoolFlowers: true}); marking = {...markingOf(was), grow: true, hold: 900}; await wait(300); }},
  {id: 'school-flowers', title: 'Flowers in front of the school', save: 'flowersPlanted', why: 'Red, yellow and white, either side of the path up to the door: the flowers you picked.', run: async () => { play(); await wait(500); }},
  {id: 'lesson', title: 'A lesson', save: 'classroom', why: 'Talk to the teacher: 上课！, then a lesson (matching words to pictures, then a gap), the practice post’s job now.', run: async () => {
    play(); await wait(100); S.pos = {place: 'school', x: 7, y: 3, dir: 'up'}; placePlayer(); talk(npc('elder')); await wait(300); next(); await wait(500); }},
  {id: 'king-reply', title: 'Your name, as king', save: 'king', why: 'What you say shows 美猴王 now, such as your reply to a monkey’s 你好.', run: async () => {
    play(); await wait(100); (async () => { await showDialog(speaker('troop1'), L.hi); await replyWith('你好'); })(); await wait(200); next(); await wait(200); click('#talk .reply'); await wait(400); }},
  {id: 'count-two', title: 'Counting the troop in', save: 'king', why: 'The card for 二 explains 两.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); next(); await wait(400); }},
  {id: 'troop-home', title: 'The whole troop is home', save: 'home', run: async () => { play(); await wait(500); }},
  {id: 'doorway', title: 'Tired? Sleep in a bed', save: 'atDoor', why: 'Just inside the entrance, a monkey teaches 睡觉 (sleep).', run: async () => { play(); await wait(100); talk(npc('doorway')); await wait(400); }},
  {id: 'bed', title: 'Ready to sleep', save: 'byBed', why: 'Facing a bed (once you know 床): A says Sleep.', run: async () => { play(); await wait(500); }},
  {id: 'sleeping', title: 'Sleeping', save: 'byBed', why: 'You hop into the bed and lie under the leaf blanket; the cave goes dim and Zs float up (held still here). Then you hop down with all your hearts.', run: async () => { play(); await wait(200); sleepAt = {x: 12, y: 1}; pl.px = 12 * T; pl.py = T; setInterval(() => { sleepT = performance.now() - SLEEP_MS * .45; }, 30); await wait(300); }},
  {id: 'menu', title: 'Menu', save: 'middle', run: async () => { play(); await wait(100); openMenu(); await wait(300); }},
  {id: 'saved', title: 'Saved', save: 'middle', why: 'The menu’s Save tile: it saves by itself anyway, and this says so.', run: async () => { S.tips.select = S.tips.start = 1; play(); await wait(100); openMenu(); click('[data-m=save]'); clearTimeout(msgT); await wait(300); }},
  {id: 'tasks', title: 'Tasks', save: 'meadowTasks', why: 'The most there are at once: in the meadow, before the rocks roll away.', run: async () => { play(); await wait(100); tasksPage(() => closeCard()); await wait(300); }},
  {id: 'scroll', title: 'Word Scroll', save: 'middle', run: async () => { play(); await wait(100); openScroll(() => closeCard()); await wait(300); }},
  {id: 'word-page', title: 'A word’s page', save: 'middle', run: async () => { play(); await wait(100); wordPage('桃子', () => closeCard()); await wait(300); }},
  {id: 'friends', title: 'Friends', save: 'allFriends', run: async () => { play(); await wait(100); openMenu(); await wait(100); click('[data-m=friends]'); await wait(300); }},
  {id: 'bag', title: 'The bag', save: 'packed', why: 'Food (how many, and what it does), your stick, and what you’re carrying for someone.', run: async () => {
    play(); await wait(100); openMenu('bag'); await wait(100); click('[data-m=bag]'); await wait(300); }},
  {id: 'bag-eat', title: 'Eating a peach from the bag', save: 'packed', why: 'Hurt: tap a peach, and a heart comes back.', run: async () => {
    play(); await wait(100); bagPage(() => closeCard()); await wait(100); click('.bagitem[data-w="桃子"]'); await wait(300); }},
  {id: 'pick-peach', title: 'Picking a peach for your bag', save: 'byPeaches', why: 'Once the hungry monkey has eaten, the fruit trees fill your bag.', run: async () => {
    play(); await wait(200); S.bag = {}; pressA(); await wait(900); }},
  {id: 'wardrobe', title: 'Wardrobe', save: 'middle', run: async () => { play(); await wait(100); wardrobePage(() => closeCard()); await wait(300); }},
  {id: 'settings', title: 'Settings', save: 'middle', run: async () => { play(); await wait(100); openSettings(); await wait(300); }},
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
  window.next = () => { if (talkNext) talkNext(); };
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
