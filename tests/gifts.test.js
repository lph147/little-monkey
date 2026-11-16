// Area 3, the Eastern Sea, step 9 (16 November 2026): the end of Chapter 5. You'd like clothes to go with the staff (我还要
// 衣服！); the Dragon King has none, only three younger brothers (我有三个弟弟！). In the throne hall you beat his drum with
// your staff (鼓, for a game that never bought the cave's) and ring his bell (钟), and the Dragon Kings of the South, West
// and North Seas swim in, each with a gift (给你！): a golden hat with two long red feathers, golden armour and white cloud
// shoes, worn on your monkey from then on, from every side and doing anything. On the way home a shark meets your staff in
// the seaweed forest, and on the seabed the sea turtle takes you home (我们回家吧！), up through the water to the iron bridge.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '水', '草', '鱼', '海', '海龟', '马', '虾', '王', '门', '刀', '猴子', '钱', '地图', '妖怪', '动物', '朋友', '我', '是', '要', '什么', '看', '没有',
  '一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十', '大', '小', '变', '白色', '帽子', '衣服', '鞋', '回家', '回来', '南边', '西边', '北边',
  '泡泡', '沙子', '贝壳', '水草', '游', '海星', '几', '鲸鱼', '光', '龙', '兵', '百', '龙虾', '柱子', '欢迎', '重', '斤', '轻', '千', '多少', '长', '短', '金色', '万', '给'];
const STAFF_DONE = {chapter: 0, landed: 1, part: 6, weapon: '金箍棒', turtle: 3, starFriends: 5, forest: 1, octopus: 1, dolphin: 2, trench: 2, palace: 3, hall: 3, staff: 4};
function game(area = {}, {pos = {place: 'hall', x: 8, y: 6, dir: 'up'}, known = KNOWN} = {}){
  const g = loadGame({dom: true, save: {version: 42, started: true, area: 3, shells: 7, coins: 9, met: ['starfish', 'octopus', 'seahorse', 'whale', 'lobster'], friends: ['starfish', 'octopus', 'seahorse', 'whale', 'lobster'],
    w: Object.fromEntries(known.map(x => [x, {lv: 2, ok: 2}])), areas: {1: {chapter: 1, raft: 3, done: true}, 2: {ch2: 1}, 3: {...STAFF_DONE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__scenes = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }");
  g.run("replyWith = async w => { __said.push('reply: ' + w); }; showPicked = async (f, note, o = {}) => { __notes.push('gift: ' + f.zh + ' / ' + f.en + ' / ' + o.label); }; storyScene = async id => { __scenes.push(id); }");
  g.run("catchQ = async w => { __notes.push('quiz: ' + w); return true; }; gapQ = async q => { __notes.push('gap: ' + q.gap); return true; }");   // (a question on a new word, or a sentence with a gap: answered)
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 4000 && !done; i++){ await tick(); g.flush(); } await p; }
const goTo = (g, place, x, y, dir) => g.run(`S.pos = {place: '${place}', x: ${x}, y: ${y}, dir: '${dir}'}; setPlace('${place}'); placeCharacters(); placePlayer(); lastTalk = null`);
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const p = (g, k) => get(g, `here().${k}`);
const at = (g, id) => get(g, `(() => { const n = ALL_NPCS.find(n => n.id === "${id}"); return [n.place, n.x, n.y]; })()`);
const tasks = g => get(g, 'getTasks().map(t => t.id)');
const bubble = (g, id) => get(g, `((AREA.bubbles["${id}"] || []).find(b => matches(b.if)) || {}).show || null`);

test('the staff given, you’d like clothes too: the Dragon King has none, only three younger brothers, and hurries back to call them (Part 8)', async () => {
  const g = game({}, {pos: {place: 'treasury', x: 6, y: 7, dir: 'left'}});
  assert.deepEqual(tasks(g), ['clothes'], 'a game from the end of step 8 carries on');
  assert.equal(bubble(g, "dragonKing"), '!');
  await press(g, 6, 7, 'left');
  assert.deepEqual(said(g), ['player: 我还要衣服！', 'dragonKing: 我没有。我有三个弟弟！']);
  assert.ok(notes(g).some(n => /three younger brothers/.test(n)));
  assert.equal(p(g, 'gifts'), 1);
  assert.deepEqual([at(g, 'dragonKing'), at(g, 'dragonQueen')], [['hall', 8, 3], ['hall', 13, 3]], 'back in the throne hall');
  assert.deepEqual(tasks(g), ['drum']);
  assert.deepEqual(get(g, '[PARTS[7].name, PARTS[7].title]'), ['Part 8', 'The drum and the bell']);
});

test('the drum and the bell, either side of the throne: beaten and rung with your staff (鼓, 钟), and his three brothers come', async () => {
  const g = game({gifts: 1}, {pos: {place: 'hall', x: 5, y: 3, dir: 'up'}, known: KNOWN});
  assert.deepEqual(get(g, '[tileAt(5, 2).look, tileAt(10, 2).look]'), ['palaceDrum', 'palaceBell']);
  assert.equal(get(g, 'mapObjects().filter(o => o.look === "palaceDrum" || o.look === "palaceBell").map(o => [o.w, o.h]).join()'), '2,2,2,2', 'each one big object');
  await press(g, 10, 3, 'up');   // (the bell first: not yet)
  assert.ok(notes(g).some(n => /Beat the (鼓 \()?drum\)? first/.test(n)), 'the drum first');
  assert.equal(p(g, 'gifts'), 1);
  assert.equal(get(g, 'promptFor(5, 2)'), 'Beat it');
  await press(g, 5, 3, 'up');
  assert.deepEqual(notes(g).filter(n => /^card:/.test(n)), ['card: 鼓'], 'for a game that never bought the cave’s drum');
  assert.deepEqual(said(g), ['dragonKing: 还有钟！']);
  assert.equal(p(g, 'gifts'), 2);
  assert.deepEqual(tasks(g), ['bell']);
  assert.ok(get(g, 'seaRings.length') > 0, 'rings of sound spreading through the water');
  assert.equal(get(g, 'promptFor(10, 2)'), 'Ring it');
  await press(g, 10, 3, 'up');
  assert.deepEqual(notes(g).filter(n => /^card:/.test(n)), ['card: 钟']);
  assert.deepEqual(get(g, '__scenes'), ['brothers']);
  assert.deepEqual(said(g), ['dragonKing: 他们来了！']);
  assert.equal(p(g, 'gifts'), 3);
  assert.deepEqual(['southKing', 'westKing', 'northKing'].map(id => at(g, id)), [['hall', 6, 5], ['hall', 8, 5], ['hall', 10, 5]]);
  assert.deepEqual(['southKing', 'westKing', 'northKing'].map(id => bubble(g, id)), ['!', '!', '!']);
  assert.deepEqual(tasks(g), ['brothers']);
  for (const id of ['南海龙王', '西海龙王', '北海龙王']) assert.equal(get(g, `MAP_SPRITES["${id}"].rows.length`), 22);
  g.run('drawWorld(1000)');
});

test('a game that knows 鼓 (it bought the cave’s drum) just beats it', async () => {
  const g = game({gifts: 1}, {pos: {place: 'hall', x: 4, y: 2, dir: 'right'}, known: [...KNOWN, '鼓']});
  await press(g, 4, 2, 'right');
  assert.deepEqual(notes(g).filter(n => /^card:/.test(n)), []);
  assert.equal(p(g, 'gifts'), 2);
});

test('the three dragon kings’ gifts: 给你！, each put on as you watch, its card, and what you say wearing it; then the Dragon Queen’s 好看！', async () => {
  const g = game({gifts: 3});
  assert.deepEqual(get(g, 'S.wardrobe.wearing'), []);
  await press(g, 6, 6, 'up');
  assert.deepEqual(said(g), ['southKing: 给你！', 'player: 我戴金色的帽子']);
  assert.ok(notes(g).includes('gift: 金色 的 帽子 / golden hat / A gift from the Dragon King of the South Sea'));
  assert.equal(get(g, 'lookOn("head")'), 'goldCap', 'on you at once');
  await press(g, 8, 6, 'up');
  assert.deepEqual(said(g), ['westKing: 给你！', 'player: 这是金色的衣服']);
  assert.equal(p(g, 'gifts'), 3, 'one still to come');
  await press(g, 10, 6, 'up');
  assert.deepEqual(said(g), ['northKing: 给你！', 'player: 这是白色的鞋', 'dragonQueen: 好看！', 'dragonKing: 再见！', 'reply: 再见'], 'and goodbye to the Dragon King');
  assert.ok(notes(g).includes('gift: 白色 的 鞋 / white shoes / A gift from the Dragon King of the North Sea'));
  assert.deepEqual(get(g, 'S.wardrobe.wearing'), ['金色 的 帽子', '金色 的 衣服', '白色 的 鞋']);
  assert.deepEqual(get(g, 'S.wardrobe.owned'), ['金色 的 帽子', '金色 的 衣服', '白色 的 鞋']);
  assert.equal(p(g, 'gifts'), 4);
  assert.deepEqual(tasks(g), ['home']);
  await press(g, 6, 6, 'up');
  assert.deepEqual(said(g), ['southKing: 好看！']);
  // in your wardrobe: the straw hat goes back on in the golden hat's place, one thing on your head at a time
  g.run('putOn("帽子")');
  assert.deepEqual(get(g, 'S.wardrobe.wearing'), ['金色 的 衣服', '白色 的 鞋', '帽子']);
  assert.equal(get(g, 'lookOn("head")'), null);
});

test('a game that never caught 鞋 catches it as the Dragon King of the North Sea gives you his', async () => {
  const g = game({gifts: 3, south: 1, west: 1}, {known: KNOWN.filter(w => w !== '鞋')});
  await press(g, 10, 6, 'up');
  assert.deepEqual(notes(g).filter(n => /^card:/.test(n)), ['card: 鞋']);
});

test('the gifts on your monkey: the golden hat and its feathers, golden armour and white cloud shoes, from every side, walking and doing things', () => {
  const g = game({gifts: 4, south: 1, west: 1, north: 1});
  g.run('for (const i of ["金色 的 帽子", "金色 的 衣服", "白色 的 鞋"]){ S.wardrobe.owned.push(i); putOn(i); } redress()');
  for (const dir of ['down', 'up', 'left', 'right']) for (const step of [0, 1, 2]){
    const rows = get(g, `monkeyRows("player", "${dir}", false, ${step})`), all = rows.join('');
    assert.ok(/[Qq]/.test(rows.slice(0, 2).join('')) && /[YA]/.test(rows[2] + rows[3]), `the golden hat, facing ${dir}`);
    assert.ok(/[AZ]/.test(rows.slice(8, 14).join('')) && rows[11].includes('R'), `golden armour, its belt red, facing ${dir}`);
    assert.ok(/[WX]/.test(rows.slice(14).join('')) && !rows.slice(14).join('').includes('f'), `white cloud shoes, facing ${dir}`);
    assert.ok(!all.includes('C') && !all.includes('S'), 'not the old coat or shoes');
  }
  assert.ok(get(g, 'monkeyRows("player", "down", false, 0)[3]').includes('R'), 'its red jewel at the front');
  for (const dir of ['down', 'up', 'left', 'right']) assert.ok(get(g, `plumePixels("${dir}").filter(([x, y]) => y < -10).length`) > 2, `its feathers, high over your square, facing ${dir}`);
  for (const [name, m] of [['swing', 'up'], ['chop', 'down']]) for (const dir of ['down', 'up', 'right']){
    const pose = get(g, `POSES.grid("${name}", "${dir}", "${m}", {armour:true, cap:true, cloud:true}, HELD["金箍棒"]).rows.join("")`);
    for (const c of ['A', 'Q', 'W', 'H']) assert.ok(pose.includes(c), `${name}, facing ${dir}: ${c}`);
  }
  g.run('drawWorld(1000); drawWorld(1200)');
});

test('home: a shark meets your staff in the seaweed forest; on the seabed the sea turtle takes you home, the end of Chapter 5', async () => {
  const g = game({gifts: 4, south: 1, west: 1, north: 1}, {pos: {place: 'forest', x: 24, y: 7, dir: 'left'}});
  g.run("STEPS.chapter = async s => { here().chapter = s.chapter; __notes.push('chapter: ' + s.chapter); }");   // (Chapter 6's card)
  g.run("wildBattle = async (id, x, o) => { __notes.push('battle: ' + id + ' ' + o.meet); return 'won'; }");
  assert.deepEqual(tasks(g), ['home']);
  await play(g, 'runEvents()');
  assert.equal(p(g, 'home'), 0, 'not on arriving: a step or two in');
  goTo(g, 'forest', 22, 7, 'left');
  await play(g, 'runEvents()');
  assert.ok(notes(g).some(n => /^battle: shark .*hasn’t met your staff/.test(n)));
  assert.equal(p(g, 'home'), 1);
  assert.deepEqual(at(g, 'turtle'), ['seabed', 12, 6], 'waiting where you landed');
  assert.equal(bubble(g, "turtle"), '!');
  goTo(g, 'seabed', 11, 6, 'right');
  await press(g, 11, 6, 'right');
  assert.deepEqual(said(g), ['turtle: 我们回家吧！', 'elder: 你回来了！', 'elder: 好看！'], 'home, and the old monkey glad to see you (Chapter 6: tests/home-staff.test.js)');
  assert.deepEqual(get(g, '__scenes'), ['swimHome']);
  assert.ok(notes(g).includes('chapter: 1'), 'Chapter 6’s card');
  assert.equal(get(g, 'PLACE'), 'ffmCave');
  assert.equal(p(g, 'home'), 3);
  assert.deepEqual(tasks(g), ['showTroop']);
});

test('the scenes: the dragon kings coming, and the swim home', () => {
  const g = game({gifts: 4, south: 1, west: 1, north: 1});
  g.run('for (const i of ["金色 的 帽子", "金色 的 衣服", "白色 的 鞋"]){ S.wardrobe.owned.push(i); putOn(i); } redress()');
  for (const t of [0, 1, 2.5, 4, 7, 9]){ g.run(`SCENE_ART.brothers(${t}, ${t * 1000})`); g.run(`SCENE_ART.swimHome(${t}, ${t * 1000})`); }
  assert.equal(get(g, 'AREA.scenes.swimHome.part'), 'gifts', 'watch the swim home again from Story so far');
});
