// Chapter 1: building the school. The big monkey wants wood and small stones, from the pine wood up the hill: you knock
// down dry, dead pines with your stick (the hit step) for wood, pick up small stones by the stream, and break a cracked
// rock to reach a little clearing, counting each thing aloud as you get it. Squares that change for good (a dead pine
// becomes a stump) are kept in the save. Bring them back, and the troop builds the school at once.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
// A game in chapter 1, at the home ground with the old monkey (area: more progress; pos: where you are).
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2};
const BUILDING = {build: 1, wood: 'asked', stones: 'asked', woodIn: 1};   // (and you've been into the pine wood: the first time is its own test)
function game(area = {}, pos = {place: 'homeGround', x: 15, y: 5, dir: 'up'}, w = {}){
  const g = loadGame({dom: true, save: {version: 29, started: true, w: {'石头': {lv: 1, ok: 0}, '一': {lv: 1, ok: 0}, '二': {lv: 1, ok: 0}, '三': {lv: 1, ok: 0}, ...w},
    met: ['rabbit', 'fox', 'squirrel', 'goat'], areas: {1: {...CHAPTER_ONE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__spoken = []; globalThis.__scenes = []; globalThis.__tocks = 0");
  g.run("storyScene = async id => { __scenes.push(id); }; SFX.tock = () => { __tocks++; }");   // (scenes: their own tests)
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

test('the big monkey marks out the school’s plot as you watch, wants wood and small stones, and clears the way up to the pine wood', async () => {
  const g = game();
  assert.equal(get(g, "((AREA.bubbles.big || []).find(b => matches(b.if)) || {}).show"), '!', 'he has a ! for you');
  assert.ok(!g.run('tileAt(25, 0).walk'), 'the way up is shut by thick bushes');
  assert.deepEqual(get(g, '[tileAt(8, 2).look, tileAt(6, 3).look, tileAt(11, 6).look]'), ['grass', 'grass', 'grass'], 'no plot yet: open grass');
  await press(g, 15, 5, 'up');
  assert.deepEqual(get(g, '__said'), ['我们要木头和小石头！']);
  assert.match(get(g, '__notes').join(' '), /marks out the ground for the school/);
  assert.equal(g.run('__tocks'), 4, 'a stake hammered in at each corner');
  assert.equal(g.run('marking'), null, 'and it’s done');
  assert.deepEqual(get(g, '[tileAt(8, 2).look, tileAt(14, 4).look, tileAt(6, 3).look, tileAt(11, 6).look]'), ['plot', 'plot', 'sign', 'path'], 'the school’s plot, its sign and the path up to it');
  assert.match(get(g, '__notes').join(' '), /up to the pine wood/);
  assert.deepEqual(get(g, '[here().build, here().wood, here().stones]'), [1, 'asked', 'asked']);
  assert.ok(g.run('tileAt(25, 0).walk') && g.run('isOpen(exitAt(25, 0))'), 'the bushes are cleared');
  assert.equal(g.run('exitAt(25, 0).to'), 'hillside', 'up the hillside, to the pine wood');
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Find three pieces of wood in the pine wood (0/3)', 'Find three small 石头 (stones) in the pine wood (0/3)'],
    'wood is in plain English: you haven’t found any yet');
  assert.deepEqual(get(g, 'getTasks()[0].target'), [25, 0], 'the arrow points the way up to the pine wood');
});

test('in the pine wood: a squirrel shows you the dry pines and warns you about the wolves; things to collect sparkle, and no arrow points inside', async () => {
  const g = game(BUILDING, {place: 'pineWood', x: 17, y: 21, dir: 'right'});
  assert.deepEqual(get(g, 'PLACES.pineWood.name'), {zh: '松林', py: 'sōnglín', en: 'Pine wood'});
  assert.equal(get(g, "((AREA.bubbles.woodSquirrel || []).find(b => matches(b.if)) || {}).show"), '!');
  await press(g, 17, 21, 'right');
  assert.deepEqual(get(g, '__said').slice(-1), ['你要木头吗？'], 'it asks if you want wood');
  assert.match(get(g, '__notes').join(' '), /Wolves live in the long grass/, 'and warns you');
  assert.equal(g.run("(AREA.bubbles.woodSquirrel || []).some(b => matches(b.if))"), false,
    'its ! goes once it’s told you (decided 26 October 2026: it kept it, just to say it all again)');
  assert.equal(get(g, 'getTasks()[0].target'), null, 'no arrow once you’re in the pine wood');
  const sparkly = get(g, 'COLLECTABLE.filter(([x, y]) => { const t = tileAt(x, y), p = t.onLook.find(p => !p.if || matches(p.if)); return p && p.sparkle; })');
  assert.deepEqual(sparkly.sort(), [[2, 18], [2, 2], [31, 2], [29, 18], [3, 12], [30, 6], [23, 5]].sort(), 'three dead pines, three stones and the cracked rock');
});

test('hitting a dry, dead pine with your stick knocks it down: a stump, a piece of wood, counted aloud', async () => {
  const g = game(BUILDING, {place: 'pineWood', x: 2, y: 19, dir: 'up'});
  assert.equal(g.run('promptFor(2, 18)'), 'Hit');
  await press(g, 2, 19, 'up');
  assert.ok(get(g, '__notes').includes('card: 木头'), 'the first piece teaches 木头: you found it yourself');
  assert.equal(g.run('tileAt(2, 18).look'), 'stump', 'the dead pine is down');
  assert.deepEqual(get(g, 'here().changed'), {'pineWood:2,18': 'j'}, 'for good: it’s in the save');
  assert.equal(g.run('counter("woodGot")'), 1);
  assert.deepEqual(get(g, '__spoken'), ['一'], 'you count it aloud');
  assert.match(get(g, '__notes').slice(-1)[0], /^一 \(one\)! Down comes the dry pine! You take a piece of 木头 \(wood\)\./);
  assert.ok(get(g, 'swing') && g.run('chips.length') > 0, 'your stick swings, and chips fly');
  assert.equal(g.run('promptFor(2, 18)'), '', 'nothing more to do at a stump');
  assert.match(get(g, 'getTasks()[0].text'), /^Find three pieces of 木头 \(wood\) in the pine wood \(1\/3\)$/, 'now in Chinese too');
});

test('chapter 1’s bridges teach 桥 (bridge) as you step onto one: the pine wood’s and the home ground’s, not the prologue’s', async () => {
  const g = game(BUILDING, {place: 'pineWood', x: 15, y: 14, dir: 'up'});
  await play(g, 'arrive(15, 13)');
  assert.ok(get(g, '__notes').includes('card: 桥'), 'onto the bridge in the pine wood: 桥');
  const home = game({}, {place: 'homeGround', x: 16, y: 17, dir: 'down'});
  await play(home, 'arrive(16, 18)');
  assert.ok(get(home, '__notes').includes('card: 桥'), 'and the home ground’s, over the stream');
  const valley = game({chapter: 0, home: 0, gate: true, climb: 1, story: false, cave: 0, count: 0}, {place: 'valley', x: 6, y: 5, dir: 'down'});
  await play(valley, 'arrive(6, 6)');
  assert.ok(!get(valley, '__notes').some(n => /桥/.test(n)), 'the river valley’s bridges, on the way up in the prologue, teach nothing');
});

test('the piece of wood is in the save before its card shows, so a game closed then never loses it (the pine is a stump for good)', async () => {
  const g = game(BUILDING, {place: 'pineWood', x: 2, y: 19, dir: 'up'});
  g.run("globalThis.__saves = []; save = () => { __saves.push(JSON.stringify([here().changed, here().picked.wood || []])); }");
  g.run("showNotice = async w => { globalThis.__atCard = __saves[__saves.length - 1]; rec(w).lv = 1; }");   // (what's saved when the card shows)
  await press(g, 2, 19, 'up');
  assert.deepEqual(JSON.parse(g.run('__atCard')), [{'pineWood:2,18': 'j'}, ['pineWood:2,18']], 'the stump, and the piece of wood from it');
});

test('knocking down a dead pine draws again only what’s around it, not the whole wood (that stopped the game for two seconds on a phone)', async () => {
  const g = game(BUILDING, {place: 'pineWood', x: 2, y: 19, dir: 'up'});
  g.run(`globalThis.__tiles = []; globalThis.__pines = 0;
    for (const k of Object.keys(LOOKS)){ const f = LOOKS[k]; LOOKS[k] = (gg, X, Y, x, y) => { __tiles.push([x, y]); return f(gg, X, Y, x, y); }; }
    { const f = OBJECT_ART.pine; OBJECT_ART.pine = (gg, o) => { __pines++; return f(gg, o); }; }`);
  await press(g, 2, 19, 'up');
  assert.equal(g.run('tileAt(2, 18).look'), 'stump');
  const tiles = get(g, '__tiles'), all = g.run('COLS * ROWS');
  assert.ok(tiles.length > 0 && tiles.length <= 25, `its ground and the squares beside it are drawn again (${tiles.length}), not all ${all}`);
  assert.ok(tiles.every(([x, y]) => Math.abs(x - 2) <= 2 && Math.abs(y - 18) <= 2), 'all of them around it');
  assert.ok(g.run('__pines') > 0 && g.run('__pines') <= 60, `and the pines it overlapped (${g.run('__pines')} drawings), not all ${g.run('OBJECT_PIECES.length')} of them twice`);
  assert.ok(!g.run('OBJECT_PIECES.some(p => p.look === "deadPine" && p.x === 2 && p.y === 18)'), 'the dead pine is gone from the map’s objects');
  g.run("__tiles.length = 0; S.pos = {place: 'homeGround', x: 3, y: 9, dir: 'right'}; placePlayer()");
  const whole = new Set(get(g, '__tiles').filter(([x, y]) => x >= 0 && y >= 0).map(String));   // (a cliff's lip draws a little of what's above it too)
  assert.equal(whole.size, g.run('COLS * ROWS'), 'another place is drawn whole');
});

test('a square that has changed stays changed in a saved game, but only while the map still has there what changed', () => {
  const g = game({...BUILDING, changed: {'pineWood:2,18': 'j', 'pineWood:23,5': 'y'}}, {place: 'pineWood', x: 22, y: 5, dir: 'right'});
  assert.equal(g.run('tileAt(2, 18).look'), 'stump');
  assert.ok(g.run('tileAt(23, 5).walk'), 'the broken rock');
  g.run("S.pos = {place: 'homeGround', x: 3, y: 5, dir: 'right'}; placePlayer()");
  assert.equal(g.run('tileAt(2, 18).look'), 'water', 'only in the place it changed');
  // changes saved on the pine wood's first map (a dead pine and the cracked rock were there; now it's the floor, and a pine)
  const old = game({...BUILDING, changed: {'pineWood:3,2': 'j', 'pineWood:16,4': 'y'}}, {place: 'pineWood', x: 3, y: 3, dir: 'up'});
  assert.equal(old.run('tileAt(3, 2).look'), 'needles', 'no stump left in the middle of the floor');
  assert.equal(old.run('tileAt(16, 4).look'), 'pine', 'and no hole among the pines');
});

test('the cracked rock shuts the sunny glade until you break it, any time in chapter 1; then the last pine and stone, and you have them all', async () => {
  const g = game({...BUILDING, picked: {wood: ['pineWood:2,18', 'pineWood:2,2'], stones: ['pineWood:29,18', 'pineWood:3,12']},
    changed: {'pineWood:2,18': 'j', 'pineWood:2,2': 'j', 'pineWood:29,18': 'i', 'pineWood:3,12': 'i'}}, {place: 'pineWood', x: 22, y: 5, dir: 'right'}, {'木头': {lv: 1, ok: 0}});
  assert.ok(!g.run('walkable(23, 5)'), 'the rock is in the way');
  assert.equal(g.run('promptFor(23, 5)'), 'Hit');
  await press(g, 22, 5, 'right');
  assert.ok(g.run('walkable(23, 5)'), 'it breaks: the way is open');
  assert.equal(g.run('tileAt(23, 5).look'), 'rubble');
  await press(g, 30, 2, 'right');
  assert.deepEqual(get(g, '__spoken'), ['三'], 'the third piece of wood');
  assert.match(get(g, '__notes').slice(-1)[0], /You have three pieces of 木头 \(wood\)\. Now find three small 石头 \(stones\)\./,
    'with a stone still to find, it says to find it, not to take the wood back (decided 26 October 2026: you made two trips)');
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Find three small 石头 (stones) in the pine wood (2/3)'], 'no task to take the wood back yet');
  assert.equal(g.run("(AREA.bubbles.big || []).some(b => matches(b.if) && b.show === '?')"), false, 'and the big monkey has no ? for you yet');
  assert.equal(g.run('promptFor(30, 6)'), 'Pick up');
  await press(g, 30, 7, 'up');
  assert.equal(g.run('tileAt(30, 6).look'), 'needles', 'the stone is picked up');
  assert.deepEqual(get(g, 'here().holding'), {wood: '木头', stones: '石头'});
  assert.match(get(g, '__notes').slice(-1)[0], /You have three small 石头 \(stones\), and the 木头 \(wood\) too\. Take them all to the big monkey\./);
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Take the 木头 (wood) and the small 石头 (stones) to the big monkey']);
  assert.ok(get(g, 'getTasks().every(t => t.target)'), 'with arrows the way back');
  const later = game({...BUILDING, build: 2, wood: 'done', stones: 'done'}, {place: 'pineWood', x: 22, y: 5, dir: 'right'});
  assert.equal(later.run('promptFor(23, 5)'), 'Hit', 'with the wood and stones brought already, you can still break it: the deer’s glade is behind it');
});

test('bring them to the big monkey: he takes both, and the troop builds the school at once (the frame goes up in the scene, never on its own; if you stand on its plot, you step off it)', async () => {
  const g = game({...BUILDING, holding: {wood: '木头', stones: '石头'}, picked: {wood: [1, 2, 3], stones: [1, 2, 3]}}, {place: 'homeGround', x: 14, y: 4, dir: 'right'}, {'木头': {lv: 1, ok: 0}});
  assert.equal(get(g, "((AREA.bubbles.big || []).find(b => matches(b.if)) || {}).show"), '?', 'he has a ? while you have something for him');
  g.run("gapQ = async () => {}; __said.length = 0");   // (filling the gaps: their own tests)
  const shells = g.run('S.shells');
  await press(g, 14, 4, 'right');
  assert.deepEqual(get(g, '__said'), ['木头！太好了！', '谢谢你！', '石头！太好了！', '谢谢你！', '我们来盖学校吧！'], 'and straight away: let’s build the school!');
  assert.deepEqual(get(g, '__scenes'), ['buildingSchool'], 'the troop builds it, in a scene: the frame goes up, then the walls, the roof and the sign');
  assert.deepEqual(get(g, '[here().wood, here().stones, here().build, here().school]'), ['done', 'done', 2, 1]);
  assert.equal(g.run('S.shells'), shells + 6);
  assert.ok(get(g, '__notes').includes('card: 学校'), 'it teaches 学校');
  assert.equal(g.run('tileAt(8, 2).look'), 'school', 'the school stands on its plot');
  assert.equal(get(g, 'OBJECT_PIECES.filter(p => p.look === "school").map(p => [p.x, p.y, p.w, p.h])').join(), '8,2,7,3', 'one school, as big as the plot');
  assert.ok(!get(g, 'OBJECT_PIECES.some(p => p.look === "frame")'), 'no frame on its own on the map');
  assert.ok(g.run('tileAt(pl.x, pl.y).walk'), 'you stepped off the plot as it went up');
  assert.match(get(g, '__notes').join(' '), /he’s the teacher now/);
  assert.ok(get(g, 'areaChecklist().filter(([t, , , found]) => found && /^(Go with|Bring|Build)/.test(t)).every(([, done]) => done)'), 'chapter 1 so far is ticked off');
});

test('a game saved with just the school’s frame up (before version 191) keeps it, and the big monkey builds the school when you talk to him', async () => {
  const g = game({...BUILDING, build: 2, wood: 'done', stones: 'done'}, {place: 'homeGround', x: 15, y: 5, dir: 'up'});
  assert.equal(g.run('tileAt(8, 2).look'), 'frame');
  assert.match(get(g, 'getTasks()[0].text'), /^Talk to the big monkey: the troop is ready to build the school$/);
  await press(g, 15, 5, 'up');
  assert.deepEqual(get(g, '__scenes'), ['buildingSchool']);
  assert.equal(g.run('here().school'), 1);
  assert.equal(g.run('tileAt(8, 2).look'), 'school');
});

// The pine wood was laid out again on 21 October 2026, after playing it on a phone: you could walk in, pick everything up
// and never meet a thing. In at the bottom, the ways part at the squirrel's clearing; one bridge over the stream; a cracked
// rock shutting the sunny glade where the deer lives. Three dead pines and three stones, all needed, and long grass across
// every way to them, where wolves, snakes and spiders live.
const KNOWS = Object.fromEntries(['动物', '树', '草', '棍子'].map(w => [w, {lv: 1, ok: 0}]));   // (animals appear, and you have your stick)
// From the way in: the fewest squares of long grass you must wade through to stand on each square you can reach (a step into
// long grass costs one, any other step nothing), with the cracked rock broken or not.
const grassTo = (g, broken) => get(g, `(() => {
  if (${broken}) here().changed['pineWood:23,5'] = 'y'; else delete here().changed['pineWood:23,5'];
  const cost = {'16,26': 0}, queue = [[16, 26]];
  while (queue.length){
    const [x, y] = queue.shift(), c = cost[x + ',' + y];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
      const t = tileAt(x + dx, y + dy), k = (x + dx) + ',' + (y + dy), n = c + (t.wild ? 1 : 0);
      if (!t.walk || (cost[k] !== undefined && cost[k] <= n)) continue;
      cost[k] = n; (t.wild ? queue.push : queue.unshift).call(queue, [x + dx, y + dy]);
    }
  }
  return cost;
})()`);
const beside = (cost, x, y) => Math.min(...[[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => cost[(x + dx) + ',' + (y + dy)] ?? Infinity));
const THINGS = {deadPines: [[2, 18], [2, 2], [31, 2]], stones: [[29, 18], [3, 12], [30, 6]]};

test('the pine wood: in at the bottom from the home ground; everywhere can be reached, and the glade only through the cracked rock', () => {
  const g = game(BUILDING, {place: 'pineWood', x: 16, y: 26, dir: 'up'}, KNOWS);
  assert.deepEqual(get(g, '[COLS, ROWS]'), [34, 30]);
  assert.deepEqual(get(g, "PLACES.hillside.exits.filter(e => e.to === 'pineWood').map(e => e.arrive)"), [[16, 26], [17, 26]], 'up the hillside, you come in at the bottom (a few steps in, so a message never hides you)');
  for (const [x, arrive] of [[16, [12, 1]], [17, [13, 1]]]) assert.deepEqual(get(g, `(e => [e.to, e.arrive])(exitAt(${x}, 29))`), ['hillside', arrive], 'and go back down the same way');
  const open = grassTo(g, true), cutOff = get(g, `(() => { const out = []; for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (tileAt(x, y).walk) out.push(x + ',' + y); return out; })()`).filter(k => !(k in open));
  assert.deepEqual(cutOff, [], 'nowhere you can walk is cut off');
  const shut = grassTo(g, false);
  for (const [x, y] of [[30, 3], ...THINGS.deadPines.slice(2), ...THINGS.stones.slice(2)]) assert.equal(beside(shut, x, y), Infinity, `${x}, ${y} is in the glade, behind the rock`);
  assert.ok(beside(open, 30, 3) < Infinity, 'once it’s broken, you can get to the deer');
  assert.deepEqual(get(g, "['q', 'm'].map(c => MAP.join('').split(c).length - 1)"), [3, 3], 'three dead pines and three stones: you need every one');
  for (const [x, y] of [...THINGS.deadPines, ...THINGS.stones, [23, 5]]) assert.notEqual(get(g, `MAP[${y + 1}][${x}]`), 'p', `nothing at ${x}, ${y} hides behind the top of a pine below it`);
});

// The fewest steps from a square on the hillside to a row of it (ledges and banks: hopped down, never climbed), or null if there's
// no way; avoiding: without stepping on long grass.
const stepsTo = (g, [fx, fy], row, avoiding = false) => g.run(`(() => {
  const seen = {'${fx},${fy}': 0}, q = [[${fx}, ${fy}]];
  while (q.length){
    const [x, y] = q.shift(), d = seen[x + ',' + y];
    if (y === ${row}) return d;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
      let nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      if (tileAt(nx, ny).ledge){ if (dy !== 1) continue; while (tileAt(nx, ny).ledge) ny++; }
      const t = tileAt(nx, ny);
      if (!t.walk || (${avoiding} && t.wild) || (nx + ',' + ny) in seen) continue;
      seen[nx + ',' + ny] = d + 1; q.push([nx, ny]);
    }
  }
  return null;
})()`);

test('the hillside: the way up from the home ground to the pine wood, and back down', () => {
  const g = game(BUILDING, {place: 'hillside', x: 12, y: 43, dir: 'up'}, KNOWS);
  assert.deepEqual(get(g, 'PLACES.hillside.name'), {zh: '山坡', py: 'shānpō', en: 'The hillside'});
  assert.deepEqual(get(g, "PLACES.homeGround.exits.find(e => e.to === 'hillside').arrive"), [12, 43], 'up from the home ground, a couple of steps in');
  for (const x of [12, 13]){
    assert.deepEqual(get(g, `(e => [e.to, e.arrive])(exitAt(${x}, 45))`), ['homeGround', [25, 1]], 'down at the bottom to the home ground');
    assert.equal(get(g, `exitAt(${x}, 0).to`), 'pineWood', 'and at the top into the pine wood');
  }
});

test('you can’t get up or down the hillside without going through its long grass, so you practise on the way', () => {
  const g = game(BUILDING, {place: 'hillside', x: 12, y: 43, dir: 'up'}, KNOWS);
  assert.equal(stepsTo(g, [12, 44], 0, true), null, 'no way up round the long grass');
  assert.equal(stepsTo(g, [12, 1], 45, true), null, 'nor down');
  assert.equal(stepsTo(g, [12, 44], 38, true), null, 'it has grown over the gap in the hedge, at the foot');
  assert.equal(stepsTo(g, [5, 28], 22, true), null, 'and right across the lowest terrace, on the way up');
  assert.notEqual(stepsTo(g, [18, 25], 32, true), null, '(coming down, you can hop down the banks round it)');
  assert.equal(stepsTo(g, [12, 11], 6, true), null, 'and under the first pines');
  assert.deepEqual(get(g, "tileAt(15, 40).wild"), ['snake', 'snake', 'spider', 'spider', 'wolf'], 'snakes and spiders, and now and then a wolf from the pines');
});

test('the hillside is a long, winding walk up, by stone steps up the cliffs and stepping stones over the brook; its banks make the way down quicker', () => {
  const g = game(BUILDING, {place: 'hillside', x: 12, y: 43, dir: 'up'}, KNOWS);
  const up = stepsTo(g, [12, 44], 0), down = stepsTo(g, [12, 1], 45);
  assert.ok(up >= 85, `a walk up of about twice the old one (${up} steps)`);
  assert.ok(down <= up - 25, `the way down is quicker (${down} steps, ${up} up)`);
  for (const [x, y] of [[5, 30], [18, 23], [6, 16]]) assert.deepEqual(get(g, `[tileAt(${x}, ${y}).look, tileAt(${x}, ${y}).walk]`), ['steps', true], `stone steps up the cliff at ${x}, ${y}`);
  assert.deepEqual(get(g, '[tileAt(19, 35).look, !!tileAt(19, 35).walk, !!tileAt(18, 35).walk]'), ['steppingStones', true, false], 'stepping stones over the brook');
  g.run("MAP[35] = MAP[35].replace('z', 'W'); MAP[36] = MAP[36].replace('z', 'W')");
  assert.equal(stepsTo(g, [12, 44], 34), null, 'the only way over it');
});

test('the edges between the hillside’s terraces are one drop, as high all along: cliffs, steps up them, and grassy banks you hop down in one go', () => {
  const g = game(BUILDING, {place: 'hillside', x: 12, y: 15, dir: 'down'}, KNOWS);
  for (const y of [16, 23, 30]){
    const looks = get(g, `[...new Set(MAP[${y}].split('').map((c, x) => tileAt(x, ${y}).look))].filter(l => l !== 'tree').sort()`);
    assert.deepEqual(looks, ['bank', 'cliffFace', 'steps'], `row ${y}: the top of a drop, all along`);
    assert.deepEqual(get(g, `MAP[${y}].split('').map((c, x) => tileAt(x, ${y}).look === tileAt(x, ${y + 1}).look)`).every(Boolean), true, 'two squares high everywhere');
  }
  g.run("mode = 'play'; placePlayer(); tryStep('down', 10000)");
  assert.deepEqual(get(g, '[pl.mv.tx, pl.mv.ty, pl.mv.hop]'), [12, 18, true], 'down a bank two squares high in one hop, landing below it');
  g.run("pl.mv = null; S.pos = {place: 'hillside', x: 12, y: 18, dir: 'up'}; placePlayer(); tryStep('up', 10000)");
  assert.equal(get(g, '!!pl.mv.slip'), true, 'never up it: you slip back down');
  g.run('update(10000 + SLIP_MS + 1)');
  assert.deepEqual(get(g, '[pl.mv, pl.x, pl.y]'), [null, 12, 18]);
  assert.deepEqual(get(g, '[tileAt(21, 22).look, !!tileAt(21, 22).walk, tileAt(21, 21).look, !!tileAt(21, 21).walk]'), ['railing', false, 'slabs', true],
    'the lookout: a flat rock at the top of the cliff, with a railing at its edge');
  assert.equal(g.run('promptFor(21, 22)'), 'Look', 'A at the railing looks out');
});

test('A at the lookout’s railing shows you the view, a picture like the opening’s, with nothing new in it', async () => {
  const g = game({...BUILDING, lookTip: 1}, {place: 'hillside', x: 21, y: 21, dir: 'down'}, KNOWS);   // (once its goat has shown you)
  g.run("globalThis.__scenes = []; storyScene = async id => { __scenes.push(id); }");
  await press(g, 21, 21, 'down');
  assert.deepEqual(get(g, '__scenes'), ['lookout']);
  assert.equal(get(g, 'typeof SCENE_ART.lookout'), 'function', 'its picture');
  const words = get(g, "AREA.scenes.lookout.captions.flatMap(c => c.zh.split(' ')).filter(w => WORD_BANK[w]).map(w => [w, WORD_BANK[w].area || 0])");
  assert.ok(words.some(([w]) => w === '海'), 'the sea: 海, heard in the opening');
  assert.ok(words.every(([, area]) => area <= 1), 'words from this area or just for listening');
  assert.ok(!get(g, 'AREA.scenes.lookout.captions').some(c => c.teach), 'it teaches nothing (the fox is the hillside’s new word)');
  assert.equal(get(g, '!!AREA.scenes.lookout.watch'), false, 'not one to watch again from Settings');
});

test('a goat on the lookout stops you as you come up the steps beside it, the first time, and walks you to its railing to show you the view (24 October 2026)', async () => {
  const bubble = g => get(g, "((AREA.bubbles.lookoutGoat || []).find(b => matches(b.if)) || {}).show || ''");
  const goat = "(n => [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === 'lookoutGoat'))";
  for (const x of [18, 19]){   // up either side of the steps
    const g = game(BUILDING, {place: 'hillside', x, y: 22, dir: 'up'}, KNOWS);
    assert.deepEqual(get(g, goat), ['hillside', 20, 21], 'on the lookout, by its railing');
    assert.equal(bubble(g), '!');
    face(g, x, 21, 'up');
    const walked = new Set();   // the squares you're seen on, or stepping to, as it goes
    let done = false; const p = Promise.resolve(g.run(`arrive(${x}, 21).then(runEvents)`)).then(() => { done = true; });
    for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); walked.add(g.run('JSON.stringify(pl.mv ? [pl.mv.tx, pl.mv.ty] : [pl.x, pl.y])')); }
    await p;
    assert.deepEqual(get(g, '__said'), ['你好！', '来看看！'], 'it stops you: hello, and come and take a look!');
    assert.deepEqual(get(g, '[S.pos, [pl.x, pl.y, pl.dir]]'), [{place: 'hillside', x: 21, y: 21, dir: 'down'}, [21, 21, 'down']], 'it walks you to the railing, facing it');
    assert.ok(walked.has('[20,21]') || walked.has('[20,20]') || walked.has('[19,20]'), `a step at a time (${[...walked].join(' ')})`);
    assert.deepEqual(get(g, goat), ['hillside', 22, 21], 'and stands beside you');
    assert.deepEqual(get(g, '__scenes'), ['lookout'], 'the view');
    assert.match(get(g, '__notes').join(' '), /Wherever you find one, face its railing and press A/);
    assert.deepEqual([get(g, 'here().lookTip'), bubble(g)], [1, ''], 'its ! goes');
    g.run('placeCharacters()');
    assert.deepEqual(get(g, goat), ['hillside', 22, 21], 'where it stays');
    g.run('__said.length = 0');
    await play(g, `arrive(${x}, 21).then(runEvents)`);
    assert.deepEqual(get(g, '__said'), [], 'only the once');
  }
});

test('led by someone, nothing happens on the squares you’re led over; and the way is the shortest, round anyone in it', () => {
  const g = game(BUILDING, {place: 'hillside', x: 19, y: 21, dir: 'up'}, KNOWS);
  assert.deepEqual(get(g, 'pathTo([19, 21], [21, 21], {free: NPCS.find(n => n.id === "lookoutGoat")})'), [[20, 21], [21, 21]], 'through the goat leading you, which moves out of the way');
  assert.deepEqual(get(g, 'pathTo([19, 21], [21, 21]).length'), 4, 'round it, if it stays');
  assert.deepEqual(get(g, 'pathTo([20, 21], [22, 21], {blocked: [21, 21]})').length, 4, 'and round you');
  assert.deepEqual(get(g, 'pathTo([19, 21], [21, 22])'), [], 'never onto the railing');
  g.run('globalThis.__arrived = 0; arrive = async () => { __arrived++; }');
  g.run('pl.mv = {fx: 19, fy: 21, tx: 20, ty: 21, t0: 0, led: true}; update(100000)');
  assert.deepEqual(get(g, '[pl.x, pl.y, pl.mv, __arrived, busy]'), [20, 21, null, 0, false]);
});

test('the mushrooms under the pines are just to look at', async () => {
  const g = game(BUILDING, {place: 'hillside', x: 9, y: 4, dir: 'left'}, KNOWS);
  assert.equal(g.run('promptFor(8, 4)'), 'Look');
  await press(g, 9, 4, 'left');
  assert.match(get(g, '__notes').join(' '), /mushrooms/);
});

test('the hillside teaches nothing new: everything there is a word from the prologue; a peach tree fills your bag, and your friends hide in its tall grass', () => {
  const g = game(BUILDING, {place: 'hillside', x: 12, y: 43, dir: 'up'}, KNOWS);
  const words = get(g, '[...new Set(MAP.flatMap((r, y) => [...r].map((c, x) => tileAt(x, y).word)).filter(Boolean))].sort()');
  const prologue = get(g, "ORDER.filter(w => WORD_BANK[w].area === 1)");
  for (const w of words) assert.ok(prologue.includes(w) && !['桥', '木头', '学校', '老师', '同学', '鹿', '狼'].includes(w), `${w} is a word you already know by chapter 1`);
  assert.equal(get(g, 'tileAt(3, 33).pick.item'), '桃子', 'a peach tree in the corner, at the foot');
  assert.ok(get(g, 'MAP.some((r, y) => [...r].some((c, x) => tileAt(x, y).animals))'), 'tall grass, where your animal friends hide');
});

test('every way to every dead pine and stone goes through long grass, so you meet what lives in it', () => {
  const g = game(BUILDING, {place: 'pineWood', x: 16, y: 26, dir: 'up'}, KNOWS), cost = grassTo(g, true);
  for (const [x, y] of [...THINGS.deadPines, ...THINGS.stones]) assert.ok(beside(cost, x, y) >= 4, `at least 4 squares of long grass on the way to ${x}, ${y} (${beside(cost, x, y)})`);
  assert.ok(beside(cost, 30, 3) >= 4, 'and to the deer');
});

test('a deer lives in the sunny glade: chapter 1’s animal, counted on its own, so the prologue’s animals are just as they were', async () => {
  const g = game({...BUILDING, changed: {'pineWood:23,5': 'y'}}, {place: 'pineWood', x: 29, y: 3, dir: 'right'}, KNOWS);
  assert.equal(get(g, 'animalAt(30, 3).hz'), '鹿');
  assert.equal(get(g, 'animalAt(30, 3).home'), '草', 'it grazes in the glade: if you don’t make friends, it goes back to the 草 (grass)');
  assert.equal(g.run('promptFor(30, 3)'), 'Meet');
  assert.ok(!g.run('walkable(30, 3)'), 'you can’t walk through it');
  g.run("S.met = ['rabbit', 'sheep', 'squirrel', 'goat']");   // (a game that met the sheep in the meadow, since 23 October 2026)
  assert.deepEqual(get(g, '[counter("found"), counter("animals"), counter("animalsLeft")]'), [4, 4, 0], 'the prologue’s four animals, all found');
  const item = () => get(g, 'areaChecklist().find(([t]) => /that lives in the pine wood/.test(t))');
  assert.equal(item()[1], false, 'on the checklist, to find');
  g.run("encounter = async () => { globalThis.__met = {spot: foe.spot, at: [foe.x, foe.y]}; return true; }");   // (making friends: tests/animals.test.js)
  await press(g, 29, 3, 'right');
  assert.deepEqual(get(g, '__met'), {spot: true, at: [30, 3]}, 'it stays where it stands as you meet it (it doesn’t jump out of the ground again)');
  assert.ok(get(g, '__notes').includes('card: 鹿'), 'meeting it teaches 鹿');
  assert.ok(!get(g, '__notes').some(n => /Animals found/.test(n)), 'the only animal to find here: no count');
  assert.deepEqual(get(g, 'S.met'), ['rabbit', 'sheep', 'squirrel', 'goat', 'deer']);
  assert.deepEqual(get(g, '[counter("found"), counter("animals"), counter("animalsLeft"), counter("woodAnimalsLeft")]'), [4, 4, 0, 0]);
  assert.equal(item()[1], true, 'found');
  const early = loadGame({save: {version: 29, started: true, met: ['rabbit', 'sheep', 'squirrel', 'deer'], areas: {1: {elder: 2}}, w: KNOWS}});
  assert.deepEqual(JSON.parse(early.run('JSON.stringify([counter("found"), counter("animals"), counter("animalsLeft")])')), [3, 4, 1],
    'in the prologue, the deer doesn’t count: the rocks wait for the goat');
});

test('wolves live in the long grass of the pine wood (and only there); lose a fight in chapter 1, and you rest under the big tree at the home ground', async () => {
  const g = game(BUILDING, {place: 'pineWood', x: 15, y: 17, dir: 'up'}, KNOWS);
  assert.deepEqual(get(g, '[...new Set(tileAt(15, 17).wild)].sort()'), ['snake', 'spider', 'wolf']);
  assert.equal(get(g, 'ENEMIES.wolf.word'), '狼');
  g.run("Math.random = () => 0; wildSteps = 4; battle = async id => { globalThis.__fought = id; return 'won'; }");   // (the battle itself: tests/battle.test.js)
  await play(g, 'arrive(15, 17)');
  assert.equal(get(g, '__fought'), 'wolf', 'a wolf jumps out');
  const rest = get(g, '[].concat(BATTLES.restAt).find(r => !r.if || matches(r.if))');
  assert.deepEqual([rest.at, rest.facing], [[17, 8, 'homeGround'], 'up'], 'in front of the feast’s table (where it stands, you rested till 24 October 2026)');
  assert.match(rest.lost, /rest under the big tree/);
  g.run("S.pos = {place: 'homeGround', x: 17, y: 8, dir: 'up'}; placePlayer(); here().feast = 2");
  assert.ok(g.run('walkable(17, 8)'), 'beside the big tree, with the table set up');
  g.run("S.pos = {place: 'path', x: 14, y: 15, dir: 'down'}; placePlayer()");
  const wild = get(g, "(() => { const out = new Set(); MAP.forEach((r, y) => [...r].forEach((c, x) => (tileAt(x, y).wild || []).forEach(id => out.add(id)))); return [...out].sort(); })()");
  assert.deepEqual(wild, ['snake', 'spider'], 'none on the mountain path');
});

test('if the map has changed under your saved spot in the pine wood, you start at its way in (not back at your stone)', () => {
  const g = loadGame({save: {version: 29, started: true, areas: {1: {...CHAPTER_ONE, ...BUILDING}}, pos: {place: 'pineWood', x: 15, y: 4, dir: 'right'}}});   // (among the pines now)
  assert.deepEqual(get(g, 'S.pos'), {place: 'pineWood', x: 16, y: 26, dir: 'up'});
});

test('the first time you go into the pine wood, it’s gloomy and still, and a wolf howls far off (just the once)', async () => {
  const g = game({build: 1, wood: 'asked', stones: 'asked'}, {place: 'homeGround', x: 25, y: 1, dir: 'up'});
  g.run("globalThis.__sounds = []; SFX.howl = () => __sounds.push('howl')");
  await play(g, 'arrive(25, 0).then(runEvents)');
  assert.equal(g.run('PLACE'), 'hillside', 'up the hillside first');
  assert.deepEqual(get(g, '__sounds'), []);
  await play(g, 'arrive(12, 0).then(runEvents)');
  assert.equal(g.run('PLACE'), 'pineWood');
  assert.deepEqual(get(g, '__sounds'), ['howl']);
  assert.match(get(g, '__notes').join(' '), /gloomy under the thick pines/);
  assert.equal(g.run('here().woodIn'), 1);
  g.run('__notes.length = 0; __sounds.length = 0');
  await play(g, 'arrive(16, 29).then(runEvents)');
  assert.equal(g.run('PLACE'), 'hillside');
  await play(g, 'arrive(12, 45).then(runEvents)');
  assert.equal(g.run('PLACE'), 'homeGround');
  await play(g, 'arrive(25, 0).then(runEvents)');
  await play(g, 'arrive(13, 0).then(runEvents)');
  assert.deepEqual(get(g, '__sounds'), [], 'not again');
});

test('the pine wood is gloomy, but always in the daytime: shade deepest in the trees, the glade in sunshine, sunbeams in the open places', () => {
  const g = game(BUILDING, {place: 'pineWood', x: 16, y: 26, dir: 'up'}, KNOWS);
  const gl = get(g, 'GLOOM'), at = (x, y) => gl.shade[y][x];
  assert.ok(at(8, 26) > .6, 'deep in the pines: darkest');
  assert.ok(at(16, 22) < at(16, 27) && at(16, 22) < .4, 'lighter in the squirrel’s clearing than on the narrow way in');
  assert.equal(at(30, 3), 0, 'the glade, in sunshine');
  assert.ok(gl.beams.some(([x, y]) => y >= 15 && y <= 20 && x >= 11 && x <= 21), 'sunbeams in the meadow below the bridge');
  assert.ok(gl.beams.some(([x, y]) => y <= 7 && x >= 24), 'and in the glade');
  assert.ok(gl.mist && gl.eyes);
  assert.equal(get(g, 'PLACES.pineWood.music'), 'pineWood');
  assert.ok(get(g, 'Object.keys(SONGS)').includes('pineWood'), 'with a song of its own');
  for (const s of get(g, 'PLACES.pineWood.sounds')) assert.equal(g.run(`typeof SFX.${s}`), 'function', `and its sounds: ${s}`);
  for (let t = 0; t < 12000; t += 700) g.run(`drawWorld(${t})`);   // (drawing it, eyes and all, a frame at a time)
  g.run("S.pos = {place: 'homeGround', x: 25, y: 1, dir: 'down'}; placePlayer()");
  assert.equal(get(g, 'GLOOM'), null, 'the home ground is in sunshine');
});
