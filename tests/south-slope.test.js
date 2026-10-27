// Chapter 1 (decided 27 October 2026, after playing it: the way to the cow was short, easy and boring): the south slope
// (南坡), down from the home ground's bridge to the pines and the pasture. Four terraces, a cliff between each: stone steps
// at one end, the long way, and a bank to hop down in the middle, the quick way, which you can't climb, so the way back up
// with the cow is the long way round. From the lookout's railing you see the lost cow, far below by its spring; a goat says
// it's down there.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const COW = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bowls: 'done', tableware: 2, bees: 11, cow: 1};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水', '猴子', '朋友', '河', '鱼', '山羊', '有', '我', '要', '在', '下面'];
function game(pos, area = {}){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, w, areas: {1: {...COW, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__scenes = []; globalThis.__sounds = []");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; replyWith = async best => { __said.push('player: ' + best); return true; }");
  g.run("storyScene = async id => { __scenes.push(id); }; SFX.mooFar = () => __sounds.push('mooFar')");
  g.run('placePlayer()');
  return g;
}
async function play(g, code){
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`); return play(g, 'interact(...facing()).then(runEvents)'); };

test('the south slope: four terraces, with stone steps (the long way) and a bank to hop down (the quick way) in each cliff', () => {
  const g = game({place: 'southSlope', x: 12, y: 1, dir: 'down'});
  assert.deepEqual(get(g, 'PLACES.southSlope.name'), {zh: '南坡', py: 'nánpō', en: 'The south slope'});
  for (const y of [9, 18, 29]){
    const row = get(g, `[...Array(COLS).keys()].map(x => tileAt(x, ${y}).look)`);
    assert.ok(row.includes('steps') && row.includes('bank'), `the cliff at row ${y}: steps and a bank`);
    assert.ok(row.every(l => ['steps', 'bank', 'cliffFace'].includes(l)), 'right across');
  }
  const route = (from, to) => get(g, `(() => { S.pos = {place: PLACE, x: ${from[0]}, y: ${from[1]}, dir: 'down'}; placePlayer(); routeMemo = {}; return routeTo([${to}]); })()`);
  const down = route([12, 1], [12, 39]), up = route([12, 38], [12, 0]);
  assert.ok(down && up, 'you can get down, and back up');
  assert.ok(get(g, `${JSON.stringify(up)}.every(([x, y]) => tileAt(x, y).look !== 'bank')`), 'back up, only by the steps: the banks are for hopping down');
  assert.ok(down.length < up.length - 15, `the way down, hopping the banks, is much quicker than the way back up (${down.length} squares, ${up.length} back)`);
});

test('the home ground’s way south leads down the slope to the dark pines, and back', () => {
  const g = game({place: 'homeGround', x: 16, y: 20, dir: 'down'});
  assert.deepEqual(get(g, "exitAt(16, 21)"), {at: [16, 21], to: 'southSlope', arrive: [12, 1], facing: 'down', if: {cow: {atLeast: 1}}, closed: 'Thick bushes block the way.'});
  assert.deepEqual(get(g, "PLACES.southSlope.exits.map(e => [e.at, e.to])"), [[[12, 0], 'homeGround'], [[13, 0], 'homeGround'], [[12, 39], 'darkPines'], [[13, 39], 'darkPines']]);
});

test('the lookout: its railing sparkles; A shows you the lost cow, far below by its spring, and a moo', async () => {
  const g = game({place: 'southSlope', x: 6, y: 16, dir: 'down'});
  assert.deepEqual(get(g, "getTasks().filter(t => /cow/.test(t.text)).map(t => [t.text, t.target])"), [['Find the lost cow: south over the bridge, and down the slope. On the way, look for it from the lookout!', [6, 17]]]);
  assert.ok(get(g, 'COLLECTABLE.some(([x, y]) => x === 6 && y === 17)'), 'the railing sparkles');
  await press(g, 6, 16, 'down');
  assert.deepEqual(get(g, '__scenes'), ['cowView']);
  assert.deepEqual(get(g, '__sounds'), ['mooFar']);
  assert.match(get(g, '__notes').join(' '), /There’s the cow, far below, by a spring beyond the dark pines! Go on down the slope to find it\./);
  assert.equal(g.run('here().cowSeen'), 1);
  assert.deepEqual(get(g, "getTasks().filter(t => /cow/.test(t.text)).map(t => t.text)"), ['Find the lost cow: you saw it far below, by a spring beyond the dark pines']);
  assert.equal(get(g, '!!(tileAt(6, 17).onLook.find(p => !p.if || matches(p.if)) || {}).sparkle'), false, 'no sparkle after');
  g.run('__scenes.length = 0');
  await press(g, 6, 16, 'down');
  assert.deepEqual(get(g, '__scenes'), ['cowView'], 'the view again, any time');
  const home = game({place: 'southSlope', x: 6, y: 16, dir: 'down'}, {cow: 9, cowSeen: 1});
  await press(home, 6, 16, 'down');
  assert.deepEqual(get(home, '__scenes'), ['southView'], 'once the cow’s home: just the view');
  assert.deepEqual(get(home, 'AREA.scenes.southView'), {art: 'cowView', home: true, captions: [{at: 0, zh: '这里 很 好看 ！', en: 'It’s lovely up here!'}]});
});

test('the view: the cow far below, while it’s lost, with an arrow over it; once it’s home, just the view', () => {
  const g = game({place: 'southSlope', x: 6, y: 16, dir: 'down'});
  const cowDrawn = (area, def) => get(g, `(() => { Object.assign(here(), ${JSON.stringify(area)}); const out = []; const r = R; globalThis.__cowPx = 0;
    const fr = b.fillRect; b.fillRect = (x, y, w, h) => { if (b.fillStyle === '#E8A0A0') __cowPx++; }; drawCowView(0, 0, ${JSON.stringify(def)}); b.fillRect = fr; return __cowPx > 0; })()`);
  assert.equal(cowDrawn({cow: 2}, {}), true);
  assert.equal(cowDrawn({cow: 3}, {}), true, 'found, but still by its spring');
  assert.equal(cowDrawn({cow: 5}, {}), false, 'home');
  assert.equal(cowDrawn({cow: 2}, {home: true}), false, 'the view without it');
});

test('a goat by the lookout: 牛在下面！ (the cow is down below)', async () => {
  const g = game({place: 'southSlope', x: 10, y: 16, dir: 'right'});
  await press(g, 10, 16, 'right');
  assert.deepEqual(get(g, '__said'), ['你好！', 'player: 你好', '牛在下面！']);
  assert.match(get(g, '__notes').join(' '), /The goat nods down the mountain/);
});
