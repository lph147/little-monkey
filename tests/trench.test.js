// Area 3, the Eastern Sea, step 5 (15 November 2026): the trench. Once you've beaten the dolphin, the way east opens and the
// turtle swims on (Part 4). Currents flow across the way down, every row at once, as the cliff road's gusts of wind do:
// you can't step into one while it flows, and one that catches you pushes you back. Across them, at the edge of the deep,
// the turtle: 这里很深！ (深); a whale glides in the deep, met from the edge (鲸鱼); and at the very bottom, 下面有光！ (光).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '水', '草', '鱼', '海', '海龟', '星星', '马', '猴子', '钱', '地图', '妖怪', '刀', '动物', '朋友', '好久不见', '红色', '我', '是', '跑',
  '一', '二', '三', '四', '五', '泡泡', '沙子', '贝壳', '水草', '游', '海星', '小心', '鲨鱼', '水母', '章鱼', '脚', '几', '珊瑚', '海马', '海豚', '快', '慢'];
const REEF_DONE = {chapter: 0, landed: 1, part: 3, weapon: '刀', turtle: 3, starFriends: 5, forest: 1, octopus: 1, dolphin: 2};
function game(area = {}, {pos = {place: 'trench', x: 1, y: 3, dir: 'right'}} = {}){
  const g = loadGame({dom: true, save: {version: 42, started: true, area: 3, shells: 7, coins: 9, met: ['starfish', 'octopus', 'seahorse'], friends: ['starfish', 'octopus', 'seahorse'],
    w: Object.fromEntries(KNOWN.map(x => [x, {lv: 2, ok: 2}])), areas: {1: {chapter: 1, raft: 3, done: true}, 2: {ch2: 1}, 3: {...REEF_DONE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");
  g.run("encounter = async f => { if (!S.friends.includes(f.id)) S.friends.push(f.id); return true; }; sayFully = async () => {}");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }");
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 3000 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const stand = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`); return play(g, 'runEvents()'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const p = (g, k) => get(g, `here().${k}`);

test('the way east from the reef opens once you’ve beaten the dolphin, and the turtle swims on, across the trench’s currents', () => {
  const before = game({dolphin: 1}, {pos: {place: 'reef', x: 24, y: 7, dir: 'right'}});
  const way = 'PLACES.reef.exits.find(e => e.to === "trench")';
  assert.equal(before.run(`isOpen(${way})`), false);
  assert.ok(before.run(`${way}.closed`));
  const g = game({}, {pos: {place: 'reef', x: 24, y: 7, dir: 'right'}});
  assert.equal(g.run(`isOpen(${way})`), true);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['toTrench']);
  assert.deepEqual(get(g, '[PLACES.trench.name.zh, PARTS[3].title]'), ['海沟', 'The trench']);
  const t = game();
  assert.deepEqual(get(t, '(() => { const n = NPCS.find(n => n.id === "turtle"); return [n.x, n.y]; })()'), [4, 9], 'across the currents');
  assert.deepEqual(get(t, 'getTasks().map(t => t.id)'), ['currents']);
});

test('currents: every row at once; you can’t step into one while it flows, and one that catches you pushes you back', () => {
  const g = game({}, {pos: {place: 'trench', x: 4, y: 4, dir: 'down'}});
  const v = get(g, 'tileAt(4, 5).vent');
  assert.equal(v.current, true);
  const rows = get(g, '[5, 6, 7].map(y => puffing(4, y, 1000))');
  assert.deepEqual(rows, [true, true, true], 'flowing: every row at once (the test clock is at 1000 ms)');
  assert.deepEqual(get(g, '[5, 6, 7].map(y => puffing(12, y, 2500))'), [false, false, false], 'and calm a moment later, so you can cross');
  g.run('S.pos = {place: PLACE, x: 4, y: 5, dir: "down"}; placePlayer(); pl.from = {x: 4, y: 4}; lastBump = -1e9; steamedOff(1000)');
  assert.deepEqual(get(g, '[pl.mv.tx, pl.mv.ty]'), [4, 4], 'swept back the way you came');
  assert.ok(notes(g).some(n => /current sweeps you back/.test(n)));
  g.run('drawWorld(1000); drawWorld(2500)');   // (flowing, and calm)
});

test('across the currents, at the edge of the deep: the turtle’s 这里很深！ (深)', async () => {
  const g = game();
  await stand(g, 12, 8, 'down');
  assert.deepEqual(said(g), [], 'not till you’re by the turtle');
  await stand(g, 4, 8, 'down');
  assert.deepEqual(said(g), ['turtle: 这里很深！']);
  assert.ok(notes(g).includes('card: 深'));
  assert.equal(p(g, 'trench'), 1);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)').sort(), ['glow', 'whale']);
});

test('the whale, gliding in the deep, met from the edge (鲸鱼)', async () => {
  const g = game({trench: 1}, {pos: {place: 'trench', x: 8, y: 9, dir: 'down'}});
  const a = 'animalAt(8, 10)';
  assert.deepEqual(get(g, `[${a}.id, ${a}.glides, tileAt(8, 10).walk || false]`), ['whale', true, false], 'in the deep, where you can’t walk');
  assert.equal(get(g, 'MAP_SPRITES["鲸鱼"].rows.length'), 22, 'big');
  await press(g, 8, 9, 'down');
  assert.ok(notes(g).includes('card: 鲸鱼'));
  assert.ok(get(g, 'S.friends').includes('whale'));
});

test('down the slope to the very bottom: 下面有光！ (光), and the way down into it', async () => {
  const g = game({trench: 1}, {pos: {place: 'trench', x: 17, y: 10, dir: 'down'}});
  await stand(g, 19, 13, 'down');
  assert.deepEqual(said(g), ['player: 下面有光！']);
  const told = notes(g);
  assert.ok(told.includes('card: 光'));
  assert.ok(told.some(n => /Walk down into it/.test(n)), 'the palace below (step 6: tests/palace.test.js)');
  assert.equal(p(g, 'trench'), 2);
  assert.equal(get(g, 'tileAt(20, 14).look'), 'trenchGlow');
  g.run('drawWorld(3000); S.clock.t = DAY_MS * .9; drawWorld(4000)');
});
