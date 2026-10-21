// Chapter 1: building the school. The big monkey wants wood and small stones, from the pine wood up the hill: you knock
// down dry, dead pines with your stick (the hit step) for wood, pick up small stones by the stream, and break a cracked
// rock to reach a little clearing, counting each thing aloud as you get it. Squares that change for good (a dead pine
// becomes a stump) are kept in the save. Bring them back, and the school's frame goes up on its plot.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
// A game in chapter 1, at the home ground with the old monkey (area: more progress; pos: where you are).
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2};
const BUILDING = {build: 1, wood: 'asked', stones: 'asked'};
function game(area = {}, pos = {place: 'homeGround', x: 13, y: 5, dir: 'up'}, w = {}){
  const g = loadGame({dom: true, save: {version: 29, started: true, w: {'石头': {lv: 1, ok: 0}, '一': {lv: 1, ok: 0}, '二': {lv: 1, ok: 0}, '三': {lv: 1, ok: 0}, ...w},
    met: ['rabbit', 'fox', 'squirrel', 'goat'], areas: {1: {...CHAPTER_ONE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__spoken = []");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run("showNotice = async w => { __notes.push('card: ' + w); rec(w).lv = Math.max(rec(w).lv || 0, 1); }; say = t => { __spoken.push(t); }; replyWith = async () => {}");   // (replying: its own tests)
  g.run('placePlayer()');
  return g;
}
// Runs code in the game and waits for it, letting its timers run (such as the swing of your stick).
async function play(g, code){
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 200 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
const face = (g, x, y, dir) => g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`);
const press = (g, x, y, dir) => { face(g, x, y, dir); return play(g, 'interact(...facing()).then(runEvents)'); };

test('the big monkey wants wood and small stones, and clears the way up to the pine wood', async () => {
  const g = game();
  assert.equal(get(g, "((AREA.bubbles.big || []).find(b => matches(b.if)) || {}).show"), '!', 'he has a ! for you');
  assert.ok(!g.run('tileAt(18, 0).walk'), 'the way up is shut by thick bushes');
  await press(g, 13, 5, 'up');
  assert.deepEqual(get(g, '__said'), ['我们要木头和小石头！']);
  assert.match(get(g, '__notes').join(' '), /up to the pine wood/);
  assert.deepEqual(get(g, '[here().build, here().wood, here().stones]'), [1, 'asked', 'asked']);
  assert.ok(g.run('tileAt(18, 0).walk') && g.run('isOpen(exitAt(18, 0))'), 'the bushes are cleared');
  assert.equal(g.run('exitAt(18, 0).to'), 'pineWood');
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Find three pieces of wood in the pine wood (0/3)', 'Find three small 石头 (stone, rock) in the pine wood (0/3)'],
    'wood is in plain English: you haven’t found any yet');
  assert.deepEqual(get(g, 'getTasks()[0].target'), [18, 0], 'the arrow points the way up to the pine wood');
});

test('in the pine wood: a squirrel shows you the dry pines; things to collect sparkle, and no arrow points inside', async () => {
  const g = game(BUILDING, {place: 'pineWood', x: 10, y: 10, dir: 'right'});
  assert.deepEqual(get(g, 'PLACES.pineWood.name'), {zh: '松林', py: 'sōnglín', en: 'Pine wood'});
  assert.equal(get(g, "((AREA.bubbles.woodSquirrel || []).find(b => matches(b.if)) || {}).show"), '!');
  await press(g, 10, 10, 'right');
  assert.deepEqual(get(g, '__said').slice(-1), ['你要木头吗？'], 'it asks if you want wood');
  assert.equal(get(g, 'getTasks()[0].target'), null, 'no arrow once you’re in the pine wood');
  const sparkly = get(g, 'COLLECTABLE.filter(([x, y]) => { const t = tileAt(x, y), p = t.onLook.find(p => !p.if || matches(p.if)); return p && p.sparkle; })');
  assert.deepEqual(sparkly.sort(), [[13, 2], [15, 8], [16, 4], [18, 2], [19, 2], [3, 2], [3, 6]].sort(), 'three dead pines, three stones and the cracked rock');
});

test('hitting a dry, dead pine with your stick knocks it down: a stump, a piece of wood, counted aloud', async () => {
  const g = game(BUILDING, {place: 'pineWood', x: 3, y: 3, dir: 'up'});
  assert.equal(g.run('promptFor(3, 2)'), 'Hit');
  await press(g, 3, 3, 'up');
  assert.ok(get(g, '__notes').includes('card: 木头'), 'the first piece teaches 木头: you found it yourself');
  assert.equal(g.run('tileAt(3, 2).look'), 'stump', 'the dead pine is down');
  assert.deepEqual(get(g, 'here().changed'), {'pineWood:3,2': 'j'}, 'for good: it’s in the save');
  assert.equal(g.run('counter("woodGot")'), 1);
  assert.deepEqual(get(g, '__spoken'), ['一'], 'you count it aloud');
  assert.match(get(g, '__notes').slice(-1)[0], /^一 \(one\)! Down comes the dry pine! You take a piece of 木头 \(wood\)\./);
  assert.ok(get(g, 'swing') && g.run('chips.length') > 0, 'your stick swings, and chips fly');
  assert.equal(g.run('promptFor(3, 2)'), '', 'nothing more to do at a stump');
  assert.match(get(g, 'getTasks()[0].text'), /^Find three pieces of 木头 \(wood\) in the pine wood \(1\/3\)$/, 'now in Chinese too');
});

test('a square that has changed stays changed in a saved game', () => {
  const g = game({...BUILDING, changed: {'pineWood:3,2': 'j', 'pineWood:16,4': 'y'}}, {place: 'pineWood', x: 15, y: 4, dir: 'right'});
  assert.equal(g.run('tileAt(3, 2).look'), 'stump');
  assert.ok(g.run('tileAt(16, 4).walk'), 'the broken rock');
  g.run("S.pos = {place: 'homeGround', x: 3, y: 5, dir: 'right'}; placePlayer()");
  assert.equal(g.run('tileAt(3, 2).look'), 'grass', 'only in the place it changed');
});

test('the cracked rock shuts the little clearing until you break it; then the last pine and stone, and you have them all', async () => {
  const g = game({...BUILDING, picked: {wood: ['pineWood:3,2', 'pineWood:13,2'], stones: ['pineWood:3,6', 'pineWood:15,8']},
    changed: {'pineWood:3,2': 'j', 'pineWood:13,2': 'j', 'pineWood:3,6': 'i', 'pineWood:15,8': 'i'}}, {place: 'pineWood', x: 15, y: 4, dir: 'right'}, {'木头': {lv: 1, ok: 0}});
  assert.ok(!g.run('walkable(16, 4)'), 'the rock is in the way');
  assert.equal(g.run('promptFor(16, 4)'), 'Hit');
  await press(g, 15, 4, 'right');
  assert.ok(g.run('walkable(16, 4)'), 'it breaks: the way is open');
  assert.equal(g.run('tileAt(16, 4).look'), 'rubble');
  await press(g, 19, 3, 'up');
  assert.deepEqual(get(g, '__spoken'), ['三'], 'the third piece of wood');
  assert.match(get(g, '__notes').slice(-1)[0], /You have three pieces of 木头 \(wood\)\. Take them to the big monkey\./);
  assert.equal(g.run('promptFor(18, 2)'), 'Pick up');
  await press(g, 18, 3, 'up');
  assert.equal(g.run('tileAt(18, 2).look'), 'needles', 'the stone is picked up');
  assert.deepEqual(get(g, 'here().holding'), {wood: '木头', stones: '石头'});
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Take the 木头 (wood) to the big monkey', 'Take the small 石头 (stone, rock) to the big monkey']);
  assert.ok(get(g, 'getTasks().every(t => t.target)'), 'with arrows the way back');
});

test('bring them to the big monkey: he takes both, and the school’s frame goes up (if you stand on its plot, you step off it)', async () => {
  const g = game({...BUILDING, holding: {wood: '木头', stones: '石头'}, picked: {wood: [1, 2, 3], stones: [1, 2, 3]}}, {place: 'homeGround', x: 12, y: 4, dir: 'right'}, {'木头': {lv: 1, ok: 0}});
  assert.equal(get(g, "((AREA.bubbles.big || []).find(b => matches(b.if)) || {}).show"), '?', 'he has a ? while you have something for him');
  g.run("gapQ = async () => {}; __said.length = 0");   // (filling the gaps: their own tests)
  const shells = g.run('S.shells');
  await press(g, 12, 4, 'right');
  assert.deepEqual(get(g, '__said'), ['你有木头吗？', '谢谢你！', '你有石头吗？', '谢谢你！']);
  assert.deepEqual(get(g, '[here().wood, here().stones, here().build]'), ['done', 'done', 2]);
  assert.equal(g.run('S.shells'), shells + 6);
  assert.equal(g.run('tileAt(6, 2).look'), 'frame', 'the frame is up on the school’s plot');
  assert.equal(get(g, 'OBJECT_PIECES.filter(p => p.look === "frame").map(p => [p.x, p.y, p.w, p.h])').join(), '6,2,7,3', 'one frame, as big as the plot');
  assert.ok(g.run('tileAt(pl.x, pl.y).walk') && !(g.run('pl.x') === 12 && g.run('pl.y') === 4), 'you stepped off the plot as the frame went up');
  assert.match(get(g, '__notes').join(' '), /up goes the frame of the school/);
  assert.ok(get(g, 'areaChecklist().slice(0, 2).every(([, done]) => done)'), 'chapter 1 so far is ticked off');
  assert.match(get(g, 'getTasks()[0].text'), /^Talk to the big monkey: the troop is ready to build the school$/, 'next, the troop builds the school');
});
