// Area 3, the Eastern Sea: Chapter 6 (16 November 2026), parts 1 and 2. Home with the staff: up through the water to the
// iron bridge in the Water Curtain Cave, Chapter 6's card, the old monkey glad to see you, and at the home ground the little
// monkeys can't lift your staff (太重了！), so you show them: up to the sky (变长), then down to a needle (针), tucked into
// your ear (耳朵), where it lives now (在我的耳朵里！ 在). Then the staff around the mountain, told what to do at five spots:
// the peaches at the top of the tallest tree (高), the boulder the troop can't move, a bridge to the little island in the
// meadow's pond, a little monkey's pearl in a crack in the cave's wall, and a little monkey in training who'd like to try it.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '水', '草', '鱼', '海', '海龟', '马', '虾', '王', '门', '刀', '猴子', '钱', '地图', '妖怪', '动物', '朋友', '我', '是', '要', '什么', '看', '没有',
  '一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十', '大', '小', '变', '白色', '帽子', '衣服', '鞋', '回家', '回来', '南边', '西边', '北边', '桃子', '床', '谢谢',
  '泡泡', '沙子', '贝壳', '水草', '游', '海星', '几', '鲸鱼', '光', '龙', '兵', '百', '龙虾', '柱子', '欢迎', '重', '斤', '轻', '千', '多少', '长', '短', '金色', '万', '给', '钟', '鼓'];
const CH5_DONE = {chapter: 0, landed: 1, part: 7, weapon: '金箍棒', turtle: 3, starFriends: 5, forest: 1, octopus: 1, dolphin: 2, trench: 2, palace: 3, hall: 3, staff: 4,
  gifts: 4, south: 1, west: 1, north: 1, home: 2};
function game(area = {}, {pos = {place: 'seabed', x: 11, y: 6, dir: 'right'}, known = KNOWN} = {}){
  if (area.home >= 3) area = {chapter: 1, ...area};   // (Chapter 6 under way)
  const g = loadGame({dom: true, save: {version: 42, started: true, area: 3, shells: 7, coins: 9, met: ['starfish', 'octopus', 'seahorse', 'whale', 'lobster'], friends: ['starfish', 'octopus', 'seahorse', 'whale', 'lobster'],
    w: Object.fromEntries(known.map(x => [x, {lv: 2, ok: 2}])), areas: {1: {chapter: 1, raft: 3, done: true}, 2: {ch2: 1}, 3: {...CH5_DONE, ...area}}, pos,
    wardrobe: {owned: ['金色 的 帽子', '金色 的 衣服', '白色 的 鞋'], on: {head: '金色 的 帽子', body: '金色 的 衣服', feet: '白色 的 鞋'}}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__scenes = []; globalThis.__tell = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }; storyScene = async id => { __scenes.push(id); }");
  g.run("STEPS.chapter = async s => { here().chapter = s.chapter; __notes.push('chapter: ' + s.chapter); }; tellCard = async id => __tell.shift() || null");
  g.run("catchQ = async w => { __notes.push('quiz: ' + w); return true; }; gapQ = async q => { __notes.push('gap: ' + q.gap); return true; }");   // (a question on a new word, or a sentence with a gap: answered)
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 6000 && !done; i++){ await tick(); g.flush(); } await p; }
const goTo = (g, place, x, y, dir) => g.run(`S.pos = {place: '${place}', x: ${x}, y: ${y}, dir: '${dir}'}; setPlace('${place}'); placeCharacters(); placePlayer(); lastTalk = null`);
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const cards = g => notes(g).filter(n => /^card:/.test(n)).map(n => n.slice(6));
const p = (g, k) => get(g, `here().${k}`);
const at = (g, id) => get(g, `(() => { const n = ALL_NPCS.find(n => n.id === "${id}"); return [n.place, n.x, n.y]; })()`);
const tasks = g => get(g, 'getTasks().map(t => t.id)');
const tell = (g, ...choices) => g.run(`__tell.push(...${JSON.stringify(choices)})`);
const SPOTS_DONE = {home: 3, ear: 1, spotTree: 1, spotBoulder: 1, bridge: 1, spotIslet: 1, spotCrack: 1, spotTrainee: 1};

test('home: a game at the end of Chapter 5 swims home to the Water Curtain Cave, Chapter 6 begins, and the old monkey is glad to see you', async () => {
  const g = game();
  await play(g, 'runEvents()');
  assert.equal(get(g, 'PLACE'), 'ffmCave', 'home, by the iron bridge');
  assert.deepEqual(get(g, '[pl.x, pl.y]'), [7, 7]);
  assert.ok(notes(g).includes('chapter: 1'), 'Chapter 6’s card');
  await play(g, 'runEvents()');
  assert.deepEqual(said(g), ['elder: 你回来了！', 'elder: 好看！']);
  assert.equal(p(g, 'home'), 3);
  assert.deepEqual(at(g, 'elder'), ['ffmHomeGround', 16, 8], 'off to tell the others, by the big table');
  assert.deepEqual(tasks(g), ['showTroop']);
  assert.deepEqual(get(g, 'partNow().id'), 'homeAgain');
  assert.deepEqual(get(g, '[AREA.chapters[1].name, AREA.chapters[1].title]'), ['Chapter 6', 'The book of names']);
});

test('Flower Fruit Mountain borrowed as you left it, in autumn, off your map, with no wild creatures in its long grass now', () => {
  const g = game({home: 3}, {pos: {place: 'ffmHomeGround', x: 2, y: 9, dir: 'right'}});
  const borrowed = get(g, 'Object.keys(PLACES).filter(k => PLACES[k].borrowed)');
  assert.ok(['ffmMeadow', 'ffmCave', 'ffmHomeGround', 'ffmFalls', 'ffmHillside'].every(k => borrowed.includes(k)));
  assert.equal(get(g, 'seasonNow()'), 'autumn', 'home in autumn, as Chapter 4 left it');
  goTo(g, 'seabed', 11, 6, 'down');
  assert.equal(get(g, 'seasonNow()'), null, 'the sea has no seasons');
  assert.ok(get(g, 'Object.values(PLACES).filter(p => p.borrowed).every(p => p.noMap && !p.onMap)'), 'home isn’t on your map of the sea');
  assert.ok(get(g, 'Object.values(PLACES).filter(p => p.borrowed).every(p => Object.values(p.legend).every(t => !t.wild || !t.wild.length))'), 'no wild creatures');
  assert.deepEqual(get(g, 'SHOPS.home.who'), 'boss', 'the 老板 at his stall');
});

test('the little monkeys can’t lift your staff, so you show them: up to the sky, down to a needle (针), into your ear (耳朵): 在我的耳朵里！ (在)', async () => {
  const g = game({home: 3}, {pos: {place: 'ffmHomeGround', x: 2, y: 9, dir: 'right'}});
  assert.equal(get(g, 'inHand()'), '金箍棒', 'in your paw, as you come home');
  goTo(g, 'ffmHomeGround', 7, 10, 'right');
  tell(g, '变短', '变长');
  await play(g, 'runEvents()');
  assert.deepEqual(said(g), ['baby1: 我看看！', 'baby1: 太重了！', 'player: 变短！', 'player: 变长！', 'baby1: 金箍棒在哪里？', 'player: 在我的耳朵里！']);
  const n = notes(g);
  assert.ok(n.some(x => /stub/.test(x)), 'a wrong answer: you see it do just that');
  assert.deepEqual(n.filter(x => /^card:/.test(x)), ['card: 针', 'card: 耳朵', 'card: 在']);
  assert.deepEqual(get(g, '__scenes'), ['staffSky']);
  assert.equal(p(g, 'ear'), 1);
  assert.equal(get(g, 'inHand()'), null, 'in your ear now, not in your paw');
  assert.equal(get(g, 'staffOut'), null);
  assert.deepEqual(tasks(g), ['tree', 'boulder', 'islet', 'crack', 'trainee']);
  assert.equal(get(g, 'partNow().id'), 'staffSpots');
});

test('the tallest peach tree: 树太高了！ (高), and your staff grows up into it, the peaches dropping', async () => {
  const g = game({home: 3, ear: 1}, {pos: {place: 'ffmMeadow', x: 2, y: 8, dir: 'left'}});
  assert.deepEqual(get(g, '[tileAt(1, 8).look, promptFor(1, 8)]'), ['peachTree', 'Staff']);
  const peaches = get(g, 'S.bag["桃子"] || 0');
  tell(g, '变长');
  await press(g, 2, 8, 'left');
  assert.deepEqual(said(g), ['baby5: 树太高了！', 'player: 变长！', 'baby5: 谢谢你！']);
  assert.deepEqual(cards(g), ['高']);
  assert.equal(p(g, 'spotTree'), 1);
  assert.equal(get(g, 'S.bag["桃子"]'), peaches + 1);
  assert.equal(get(g, 'staffOut'), null, 'back in your ear');
});

test('the boulder the troop can’t move: 变大, levered aside, gold under it; a bridge to the pond’s little island (变长), and jade on it', async () => {
  const g = game({home: 3, ear: 1}, {pos: {place: 'ffmMeadow', x: 14, y: 5, dir: 'up'}});
  assert.equal(get(g, 'tileAt(14, 4).look'), 'boulder');
  tell(g, '变小', '变大');
  await press(g, 14, 5, 'up');
  assert.ok(notes(g).some(x => /twig/.test(x)), 'too thin: you see it, and choose again');
  assert.equal(p(g, 'spotBoulder'), 1);
  assert.deepEqual(get(g, '[tileAt(14, 4).look, !!tileAt(14, 4).walk]'), ['grass', true], 'rolled away');
  assert.equal(get(g, 'S.bag["金子"]'), 1);
  assert.deepEqual(said(g), ['player: 变小！', 'player: 变大！', 'big: 太好了！']);
  // the island
  assert.deepEqual(get(g, '[tileAt(12, 10).look, tileAt(11, 10).look, tileAt(10, 10).look]'), ['water', 'water', 'grass'], 'an island in the pond');
  tell(g, '变长');
  await press(g, 13, 10, 'left');
  assert.equal(p(g, 'bridge'), 1);
  assert.deepEqual(get(g, '[tileAt(12, 10).look, tileAt(11, 10).look, !!tileAt(11, 10).walk]'), ['staffBridgeR', 'staffBridgeL', true], 'your staff lies across the water');
  goTo(g, 'ffmMeadow', 10, 10, 'left');
  await play(g, 'runEvents()');
  assert.equal(p(g, 'spotIslet'), 1);
  assert.equal(get(g, 'S.bag["玉"]'), 1);
});

test('the crack in the cave’s wall (变小, a needle), the little monkey’s pearl; and the little monkey in training (变短)', async () => {
  const g = game({home: 3, ear: 1}, {pos: {place: 'ffmCave', x: 1, y: 10, dir: 'left'}});
  assert.deepEqual(get(g, '[tileAt(0, 10).look, promptFor(0, 10)]'), ['caveCrack', 'Staff']);
  const shells = get(g, 'S.shells');
  tell(g, '变小');
  await press(g, 1, 10, 'left');
  assert.deepEqual(said(g), ['player: 变小！', 'baby2: 谢谢你！']);
  assert.equal(p(g, 'spotCrack'), 1);
  assert.equal(get(g, 'S.shells'), shells + 5);
  goTo(g, 'ffmHomeGround', 3, 12, 'left');
  assert.deepEqual(at(g, 'traineeStick'), ['ffmHomeGround', 2, 12]);
  tell(g, '变长', '变短');
  await press(g, 3, 12, 'left');
  assert.deepEqual(said(g), ['traineeStick: 我看看！', 'player: 变长！', 'player: 变短！', 'traineeStick: 太好了！']);
  assert.equal(p(g, 'spotTrainee'), 1);
});

test('Not now at a spot puts your staff back in your ear, to come back to', async () => {
  const g = game({home: 3, ear: 1}, {pos: {place: 'ffmMeadow', x: 14, y: 5, dir: 'up'}});
  await press(g, 14, 5, 'up');
  assert.equal(p(g, 'spotBoulder'), 0);
  assert.equal(get(g, 'staffOut'), null);
  assert.equal(get(g, 'tileAt(14, 4).look'), 'boulder');
});

test('all five spots: the troop’s feast for your staff, at the home ground (Part 3, the dream)', async () => {
  const g = game(SPOTS_DONE, {pos: {place: 'ffmMeadow', x: 13, y: 10, dir: 'left'}});
  assert.equal(get(g, 'counter("staffSpots")'), 5);
  assert.deepEqual(tasks(g), ['feast']);
  goTo(g, 'ffmHomeGround', 2, 9, 'right');
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__scenes'), ['staffFeast']);
  assert.equal(p(g, 'feast'), 1);
  assert.deepEqual(tasks(g), ['bed']);
  assert.equal(get(g, 'partNow().id'), 'dream');
});

test('dive again from the iron bridge, and the sea turtle swims you home again', async () => {
  const g = game({home: 3, ear: 1}, {pos: {place: 'ffmCave', x: 7, y: 7, dir: 'up'}});
  assert.equal(get(g, 'promptFor(7, 6)'), 'Dive');
  await press(g, 7, 7, 'up');
  assert.deepEqual(get(g, '__scenes'), ['diveAgain']);
  assert.equal(get(g, 'PLACE'), 'seabed');
  goTo(g, 'seabed', 11, 6, 'right');
  await press(g, 11, 6, 'right');
  assert.deepEqual(get(g, '__scenes'), ['diveAgain', 'swimHome']);
  assert.equal(get(g, 'PLACE'), 'ffmCave');
});

test('your staff out of your ear, drawn in your paws every way you face; the bridge, the crack and the scenes drawn', () => {
  const g = game({home: 3, ear: 1}, {pos: {place: 'ffmMeadow', x: 13, y: 10, dir: 'left'}});
  for (const dir of ['up', 'down', 'left', 'right']){ g.run(`pl.dir = '${dir}'; staffOut = {from: {len: 2, w: 1}, to: {len: 40, w: 4}, t0: 0, ms: 10}; drawWorld(1000)`); }
  g.run('staffOut = null; here().bridge = 1; refreshMap(); drawWorld(1200)');
  goTo(g, 'ffmCave', 1, 10, 'left'); g.run('drawWorld(1400)');
  for (const t of [0, .5, 1.5, 3, 4.4, 5, 6.6, 7, 8, 9]){ g.run(`SCENE_ART.staffSky(${t}, ${t * 1000})`); g.run(`SCENE_ART.party(${t}, ${t * 1000})`); }
  assert.equal(get(g, 'AREA.scenes.staffFeast.art'), 'party');
});
