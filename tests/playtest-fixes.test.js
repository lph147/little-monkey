// Fixes from playtesting the cow's story (27 October 2026): the cow walks the way it's going, the wolf at the rocks is a
// boss you can't run from, the thirsty monkey watches for you as you bring the cow home, the troop never builds on top of
// you, a message after a speech box at the top shows at the top too, rustling grass meets you as soon as you face it, and
// the yellow arrow shows the way for one task at a time: the newest, or the one you tap on the Tasks page.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const tick = () => new Promise(r => setImmediate(r));
const FEAST = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bees: 1};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '水', '河', '猴子', '朋友', '桥', '同学', '棍子', '有', '没有', '狼',
  '我', '要', '吃', '桌子', '家', '没关系', '谢谢', '不客气', '牛', '牛奶'];
function game(pos, area = {}, more = {}){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 30, started: true, areas: {1: {...FEAST, ...area}}, pos, w, following: more.following || [], friends: more.friends || []}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__fights = []");
  g.run("showNarration = async t => { __notes.push(t); }; showDialog = async () => {}; say = () => {}");
  g.run("fight = async (id, opts) => { __fights.push([id, opts]); return 'won'; }");
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await tick(); g.flush(); }
  await p;
}
const walkTo = (g, x, y, dir) => {   // a step onto the square next to you, anyone following you stepping after you
  g.run(`followersStep(performance.now()); Object.assign(pl, {x: ${x}, y: ${y}, px: ${x} * T, py: ${y} * T, dir: '${dir}', mv: null})`);
  return play(g, `arrive(${x}, ${y}).then(runEvents)`);
};

test('the cow following you faces the way it walks, and walks with its legs, not sliding', () => {
  const g = game({place: 'homeGround', x: 16, y: 10, dir: 'right'}, {cow: 4, cowWolf: 1}, {following: ['cow'], friends: ['cow']});
  const cow = "ALL_NPCS.find(n => n.id === 'cow')";
  g.run(`${cow}.dir = 'right'`);
  g.run(`drawAnimal(${cow}, 0, 0, 0, {})`);
  assert.equal(g.run(`${cow}.side`), 'right', 'walking right, it faces right (its picture turned round: it faces left)');
  g.run(`${cow}.dir = 'up'`); g.run(`drawAnimal(${cow}, 0, 0, 0, {})`);
  assert.equal(g.run(`${cow}.side`), 'right', 'walking up or down, it keeps facing the way it last went');
  g.run(`${cow}.dir = 'left'`); g.run(`drawAnimal(${cow}, 0, 0, 0, {})`);
  assert.equal(g.run(`${cow}.side`), 'left');
  const legs = g.run("legsFrom('牛')"), rows = g.run("MAP_SPRITES['牛'].rows.length");
  assert.ok(legs > rows / 2 && legs < rows, `its legs, the bottom of its picture, step as it walks (from row ${legs})`);
});

test('what leaps out at the gap between the rocks is a boss: you can’t run from it (a wolf, then a bear)', async () => {
  const g = game({place: 'pasture', x: 20, y: 15, dir: 'up'}, {cow: 4}, {following: ['cow'], friends: ['cow']});
  await walkTo(g, 20, 14, 'up');
  assert.deepEqual(get(g, '__fights.map(([id]) => id)'), ['bear']);
  assert.equal(g.run('ENEMIES.bear.boss'), true, 'a boss');
  const b = loadGame({dom: true, save: {version: 30, started: true, w: Object.fromEntries(['石头', '山', '狼', '棍子'].map(x => [x, {lv: 1, ok: 2}])), areas: {1: {...FEAST}}}});
  b.run("mode = 'play'; say = () => {}; fight('wolf', {boss: true})");
  for (let i = 0; i < 20 && !b.el('#sheet').querySelectorAll('.act').length; i++){ await tick(); b.flush(); }
  assert.deepEqual(b.el('#sheet').querySelectorAll('.act').map(x => x.dataset.act), ['hit'], 'a battle step’s boss: no Run away');
  assert.equal(b.run('ENEMIES.wolf.boss'), undefined, 'wolves in the long grass you can still run from');
});

test('bringing the cow home, the thirsty monkey has a ! and faces the way you come, up the path from the bridge', () => {
  const g = game({place: 'homeGround', x: 16, y: 10, dir: 'right'}, {cow: 4, cowWolf: 1}, {following: ['cow'], friends: ['cow']});
  const thirsty = "ALL_NPCS.find(n => n.id === 'thirsty')";
  assert.deepEqual(get(g, `[${thirsty}.x, ${thirsty}.y, ${thirsty}.dir]`), [21, 11, 'left']);
  assert.equal(g.run("AREA.bubbles.thirsty.find(b => matches(b.if)).show"), '!');
  const without = game({place: 'pasture', x: 31, y: 17, dir: 'down'}, {cow: 4, cowWolf: 1}, {friends: ['cow']});
  assert.equal(without.run("(AREA.bubbles.thirsty.find(b => matches(b.if)) || {}).show"), undefined, 'not while the cow’s run back to its spring');
});

test('the troop never builds on top of you: you step aside first, and watch', async () => {
  const g = game({place: 'homeGround', x: 20, y: 11, dir: 'right'}, {cow: 9, cowWolf: 1, milk: 'done', milkTable: 1, dairy: 0});
  g.run("SFX.tock = () => {}");
  await play(g, "STEPS.setUp({setUp: {dairy: 1}})");
  const [x, y, dir] = get(g, '[pl.x, pl.y, pl.dir]');
  assert.ok(!(x >= 19 && x <= 20 && y >= 11 && y <= 12), `not on the little dairy (19, 11, two squares by two): at ${x}, ${y}`);
  assert.equal(g.run(`walkable(${x}, ${y})`), true, 'somewhere you can stand');
  assert.equal(Math.abs(x - 20) + Math.abs(y - 11), 1, 'a step away');
  assert.equal(dir, x < 19 ? 'right' : x > 20 ? 'left' : y < 11 ? 'down' : 'up', 'facing it, to watch');
  const off = game({place: 'homeGround', x: 17, y: 10, dir: 'up'}, {cow: 9, cowWolf: 1, milk: 'done', milkTable: 1, dairy: 0});
  off.run("SFX.tock = () => {}");
  await play(off, "STEPS.setUp({setUp: {dairy: 1}})");
  assert.deepEqual(get(off, '[pl.x, pl.y, pl.dir]'), [17, 10, 'up'], 'standing clear of it, you stay where you are');
});

test('a message straight after a speech box at the top shows at the top too, till you move or turn', () => {
  const g = game({place: 'homeGround', x: 16, y: 10, dir: 'right'});
  g.run('globalThis.__now = 5000; performance.now = () => __now; busy = false');
  assert.equal(g.run('messageTop()'), false, 'at the bottom, as ever');
  g.run("talkTop = true; talkBox.hidden = true; placeTalk()");   // a conversation with its box at the top, just over
  assert.equal(g.run('talkTop'), false);
  assert.equal(g.run('messageTop()'), true, 'its message, such as a new task, at the top');
  g.run('__now = 6000; pl.turnT = 5500');
  assert.equal(g.run('messageTop()'), false, 'once you’ve turned, at the bottom');
  g.run("talkTop = true; talkBox.hidden = false");
  assert.equal(g.run('messageTop()'), true, 'and while a speech box is at the top');
});

test('grass rustling beside you: face it, and the animal jumps out of it, there', async () => {
  const g = game({place: 'homeGround', x: 16, y: 10, dir: 'down'});
  g.run("globalThis.__met = null; wildAppears = async (a, spot) => { __met = [a.id, spot.x, spot.y, spot.d]; }");
  assert.equal(g.run('canWild()'), true);
  g.run("rustle = {x: 17, y: 10, a: ANIMALS.find(a => !a.at)}");
  g.run("tryStep('right', performance.now())");   // turning to face it
  await play(g, 'Promise.resolve()');
  assert.deepEqual(get(g, '__met.slice(1)'), [17, 10, 'right'], 'out of the grass where it rustled');
  assert.equal(g.run('rustle'), null);
  g.run("__met = null; rustle = {x: 18, y: 10, a: ANIMALS.find(a => !a.at)}");
  await walkTo(g, 17, 10, 'right');   // a step up to it
  assert.deepEqual(get(g, '__met.slice(1)'), [18, 10, 'right'], 'stepping up to it, facing it');
  g.run("__met = null; rustle = {x: 18, y: 12, a: ANIMALS.find(a => !a.at)}");
  await walkTo(g, 18, 11, 'up');
  assert.equal(g.run('__met'), null, 'beside it, facing away, it waits');
});

test('one yellow arrow, for the newest task; none while the newest has none, such as hide and seek', () => {
  const g = game({place: 'homeGround', x: 16, y: 10, dir: 'right'}, {cow: 4, cowWolf: 1, bees: 8, honey: 'asked'}, {following: ['cow'], friends: ['cow']});
  g.run('S.tasksSeen = {}; S.tasksRead = {}');
  const ids = () => get(g, 'getTasks().map(t => t.id)');
  assert.deepEqual(ids(), ['honey1', 'cow4']);
  assert.equal(g.run('aimedTask().id'), 'honey1', 'tasks that came up together: the first with an arrow');
  g.run("S.tasksSeen = {honey1: 3, cow4: 4}");
  assert.equal(g.run('aimedTask().id'), 'cow4', 'the newest');
  g.run("Object.assign(here().hide, {spot: HIDE.spots[0].id, wrong: 0})");
  assert.ok(ids().includes('hideSeek'));
  assert.equal(g.run('aimedTask()'), null, 'hide and seek, not announced yet, is newest: no arrow at all');
  g.run("$('#saybox').hidden = true; updateHUD()");
  assert.ok(get(g, 'S.tasksSeen.hideSeek') > 4, 'announced: the newest');
  assert.equal(g.run('aimedTask()'), null);
  g.run("followTask('cow4')");
  assert.equal(g.run('aimedTask().id'), 'cow4', 'chosen on the Tasks page: the arrow follows it');
});

test('the Tasks page: the task the arrow follows is marked; tap another for the arrow to follow it', () => {
  const g = game({place: 'homeGround', x: 16, y: 10, dir: 'right'}, {cow: 4, cowWolf: 1, bees: 8, honey: 'asked'}, {following: ['cow'], friends: ['cow']});
  g.run("S.tasksSeen = {honey1: 3, cow4: 4}; SFX.blip = () => {}; tasksPage(() => closeCard())");
  const sheet = g.el('#sheet');
  assert.match(sheet.querySelector('li.aim').textContent, /Lead the 牛/, 'the newest, marked');
  assert.deepEqual(sheet.querySelectorAll('.taskbtn').map(b => b.dataset.t), ['honey1', 'cow4'], 'each, to tap');
  sheet.querySelector('.taskbtn[data-t="honey1"]').click();
  assert.equal(g.run('aimedTask().id'), 'honey1');
  assert.match(g.el('#sheet').querySelector('li.aim').textContent, /honey/, 'marked now');
  const one = game({place: 'homeGround', x: 16, y: 10, dir: 'right'}, {cow: 4, cowWolf: 1, bees: 8}, {following: ['cow'], friends: ['cow']});
  one.run('tasksPage(() => closeCard())');
  assert.equal(one.el('#sheet').querySelectorAll('.taskbtn').length, 0, 'with one task, nothing to choose');
});
