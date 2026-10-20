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
SAVES.knowsWell = {...SAVES.middle, w: knows(2, MIDDLE_WORDS)};   // every word Recognised: animals ask you to read
// chapter 1 has begun: the prologue is done, and the troop is at the waterfall; you're beside the old monkey
const PROLOGUE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 3, story: true, bought: ['头带'], cave: 0};
SAVES.chapter1 = {...SAVES.middle, w: knows(1, [...MIDDLE_WORDS, '瀑布', '狐狸', '松鼠', '山羊', '朋友']), met: ['rabbit', 'fox', 'squirrel', 'goat'],
  wardrobe: {owned: ['头带'], wearing: ['头带']}, areas: {1: PROLOGUE}, pos: {place: 'falls', x: 8, y: 1, dir: 'right'}};
SAVES.dared = {...SAVES.chapter1, w: {...SAVES.chapter1.w, ...knows(1, ['跳'])}, areas: {1: {...PROLOGUE, cave: 1}}, pos: {place: 'falls', x: 5, y: 1, dir: 'left'}};
SAVES.inCave = {...SAVES.dared, w: {...SAVES.dared.w, ...knows(1, ['洞'])}, areas: {1: {...PROLOGUE, cave: 2}}, pos: {place: 'cave', x: 7, y: 9, dir: 'up'}};
SAVES.explored = {...SAVES.inCave, w: {...SAVES.inCave.w, ...knows(1, ['桥', '床', '碗', '桌子'])}, pos: {place: 'falls', x: 8, y: 1, dir: 'right'}};
// part B: the troop has followed you in (cave 4), you're king (cave 6), and the troop is counted in
const CAVE_WORDS = knows(1, ['洞', '跳', '桥', '床', '碗', '桌子']);
SAVES.ledIn = {...SAVES.explored, w: {...SAVES.chapter1.w, ...CAVE_WORDS}, areas: {1: {...PROLOGUE, cave: 4}}, pos: {place: 'cave', x: 6, y: 10, dir: 'up'}};
SAVES.toBeKing = {...SAVES.ledIn, w: {...SAVES.ledIn.w, ...knows(1, ['家'])}, areas: {1: {...PROLOGUE, cave: 5}}, pos: {place: 'cave', x: 9, y: 9, dir: 'up'}};
SAVES.king = {...SAVES.toBeKing, w: {...SAVES.toBeKing.w, ...knows(1, ['王', '一'])}, areas: {1: {...PROLOGUE, cave: 6, count: 1}}, pos: {place: 'cave', x: 6, y: 10, dir: 'up'}};
SAVES.home = {...SAVES.king, w: {...SAVES.king.w, ...knows(1, ['二', '三'])}, areas: {1: {...PROLOGUE, cave: 6, count: 3}}, pos: {place: 'cave', x: 7, y: 12, dir: 'up'}};
SAVES.caveTop = {...SAVES.home, pos: {place: 'cave', x: 7, y: 5, dir: 'up'}};   // by the beds, the table and the bowls
SAVES.atDoor = {...SAVES.ledIn, pos: {place: 'cave', x: 8, y: 12, dir: 'right'}};   // beside the monkey just inside the entrance
SAVES.byBed = {...SAVES.home, w: {...SAVES.home.w, ...knows(1, ['睡觉'])}, hearts: 2, pos: {place: 'cave', x: 12, y: 2, dir: 'up'}};   // hurt, facing a bed
SAVES.rocksGone = {...SAVES.middle, areas: {1: {...SAVES.middle.areas[1], hungry: 'done', thirsty: 'done', holding: {}, gate: true}}, pos: {place: 'meadow', x: 15, y: 2, dir: 'left'}};   // the troop gathers where the rocks were
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
  {id: 'title', title: 'Title screen', why: 'A new game.'},
  {id: 'title-novoice', title: 'Title, no Chinese voice', voices: 'missing', why: 'With the game’s own voice clips there’s no warning: the device’s voice isn’t needed.'},
  {id: 'title-phone', title: 'Title, in a phone’s browser', why: 'Play full screen: on Android it goes full screen, on an iPhone it shows how to add it to the home screen. Never once it’s the app.', run: async () => {
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
  {id: 'troop-line', title: 'A monkey of the troop', save: 'middle', why: 'Each of the troop has something to say, after 你好.', run: async () => {
    play(); await wait(100); talk(npc('troop1')); await wait(300); next(); await wait(300); click('#talk .reply'); await wait(400); next(); await wait(600); }},
  {id: 'hello-card', title: 'A new word in a conversation', save: 'born', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(400); }},
  {id: 'first-reply', title: 'Your first reply', save: 'born', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); click('[data-a=ok]'); await wait(400); }},
  {id: 'welcome', title: 'The old monkey’s welcome', save: 'born', why: 'A line of story, waiting in the speech box.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); click('[data-a=ok]'); await wait(200);
    next(); await wait(200); next(); await wait(500); }},
  {id: 'go-look', title: 'Off you go', save: 'born', why: 'His hint, and the tip about grey words.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); click('[data-a=ok]'); await wait(200);
    next(); await wait(200); next(); await wait(200); next(); await wait(500); }},
  {id: 'playing', title: 'Playing', save: 'middle', why: 'The map, the task box, the header.', run: async () => { play(); await wait(600); }},
  {id: 'chapter-card', title: 'A new chapter', save: 'middle', why: 'When the prologue is done.', run: async () => { play(); await wait(100); STEPS.chapter({chapter: 1}); await wait(300); }},
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
  {id: 'red-flower', title: 'A red flower', save: 'middle', why: 'The first flower of a colour teaches its word.', run: async () => { play(); await wait(100); showNotice('红色', {note: 'The colour of these flowers.'}); await wait(400); }},
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
  {id: 'cave', title: 'The Water Curtain Cave', save: 'inCave', why: 'Four things sparkle: the bridge, the beds, the table and the bowls.', run: async () => { play(); await wait(500); }},
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
  {id: 'stick-lesson', title: 'The big monkey gives you a stick', save: 'rocksGone', why: 'Teaching 棍子, before the lesson on how to fight.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(300); next(); await wait(300); next(); await wait(300); next(); await wait(600); }},
  {id: 'stick-held', title: 'Holding the stick', save: 'fighting', why: 'From then on your monkey holds the stick (棍子) on the map, and in its picture: small, so a longer staff can replace it later.', run: async () => {
    play(); await wait(200); S.pos = {place: 'path', x: 16, y: 16, dir: 'down'}; placePlayer(); await wait(400); }},
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
  {id: 'king-reply', title: 'Your name, as king', save: 'king', why: 'Your replies show 美猴王 now.', run: async () => { play(); await wait(100); replyWith('你好'); await wait(400); }},
  {id: 'count-two', title: 'Counting the troop in', save: 'king', why: 'The card for 二 explains 两.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); next(); await wait(400); }},
  {id: 'troop-home', title: 'The whole troop is home', save: 'home', run: async () => { play(); await wait(500); }},
  {id: 'doorway', title: 'Tired? Sleep in a bed', save: 'atDoor', why: 'Just inside the entrance, a monkey teaches 睡觉 (sleep).', run: async () => { play(); await wait(100); talk(npc('doorway')); await wait(400); }},
  {id: 'bed', title: 'Ready to sleep', save: 'byBed', why: 'Facing a bed (once you know 床): A says Sleep.', run: async () => { play(); await wait(500); }},
  {id: 'sleeping', title: 'Sleeping', save: 'byBed', why: 'You hop into the bed and lie under the leaf blanket; the cave goes dim and Zs float up (held still here). Then you hop down with all your hearts.', run: async () => { play(); await wait(200); sleepAt = {x: 12, y: 1}; pl.px = 12 * T; pl.py = T; setInterval(() => { sleepT = performance.now() - SLEEP_MS * .45; }, 30); await wait(300); }},
  {id: 'menu', title: 'Menu', save: 'middle', run: async () => { play(); await wait(100); openMenu(); await wait(300); }},
  {id: 'saved', title: 'Saved', save: 'middle', why: 'The menu’s Save tile: it saves by itself anyway, and this says so.', run: async () => { S.tips.select = S.tips.start = 1; play(); await wait(100); openMenu(); click('[data-m=save]'); clearTimeout(msgT); await wait(300); }},
  {id: 'tasks', title: 'Tasks', save: 'middle', run: async () => { play(); await wait(100); tasksPage(() => closeCard()); await wait(300); }},
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
  {id: 'howto-1', title: 'How to play, 1 of 2', save: 'middle', why: 'Now only in Settings.', run: async () => { play(); await wait(100); howToPlay(); await wait(300); }},
  {id: 'howto-2', title: 'How to play, 2 of 2', save: 'middle', run: async () => { play(); await wait(100); howToPlay(); await wait(100); click('[data-a=next]'); await wait(300); }},
  {id: 'story', title: 'The Story Scroll', save: 'middle', run: async () => { play(); await wait(100); storyScroll(); await wait(400); }},
  {id: 'word-test', title: 'The word test', save: 'middle', why: 'Matching words to pictures. It comes back as the troop’s send-off at the end of Area 1.', run: async () => { play(); await wait(100); wordTest(); await wait(400); }}
];

// What goes at the top of each frame, before the game's own scripts: pretend storage holding the
// save, a pretend Chinese voice that says nothing, no sound effects or music, the helpers, and a
// list of any errors.
function prepare(save, voices){
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
  still.textContent = '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}';
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
  const top = `<base href="${new URL('../', location.href)}"><script>(${prepare})(${JSON.stringify(s.save ? SAVES[s.save] : null)}, ${JSON.stringify(s.voices || 'zh')})<\/script>`;
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
