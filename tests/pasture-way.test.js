// The way through the dark pines (黑松林) to the lost cow (27 October 2026, after playing it: it was easy and dull; the
// pasture's pines, a place of their own since, bigger and gloomy). The way forks, and the ways the cow didn't go end in
// nothing but a few shells; its hoofprints show the right way, and its moo is louder that way; down a gully, a hollow pine
// to crawl through; they go down into a stream too deep for a little monkey to wade, where a dead pine leans over the
// water: knock it down with your stick, and it falls across, a bridge. Over it, a rabbit by the way saw the cow go by: win
// its word game, and it shows you which way. And at the big rocks, as you lead the cow home, a bear (熊), a boss you can't
// run from, where a wolf was.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const tick = () => new Promise(r => setImmediate(r));
const FEAST = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bees: 1};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '兔子', '水', '河', '猴子', '朋友', '桥', '同学', '棍子', '有', '没有', '狼',
  '我', '要', '吃', '桌子', '家', '没关系', '谢谢', '不客气'];
function game(pos, area = {}){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 30, started: true, areas: {1: {...FEAST, ...area}}, pos, w, friends: ['rabbit']}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__sounds = []; globalThis.__play = true; globalThis.__win = true");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showDialog = async (who, line) => { __said.push(line.t.join('')); }");
  g.run("for (const k of ['moo', 'mooFar', 'rumble', 'splash', 'swish', 'thwack', 'encounter']) SFX[k] = () => { __sounds.push(k); }");
  g.run("confirmBox = async () => __play; encounter = async () => __win");
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await tick(); g.flush(); }
  await p;
}
const face = (g, x, y, dir) => g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`);
const press = (g, x, y, dir) => { face(g, x, y, dir); return play(g, 'interact(...facing()).then(runEvents)'); };
const goTo = (g, x, y) => { face(g, x, y, 'down'); return play(g, 'runEvents()'); };
const way = (g, from, to) => get(g, `pathTo([${from}], [${to}])`);   // the squares you'd walk, or none if there's no way

test('the dark pines, a gloomy place of their own between the south slope and the pasture: the way forks, the cow’s hoofprints show which way it went, and the ways it didn’t go end at boulders, with shells under them', () => {
  const g = game({place: 'darkPines', x: 16, y: 1, dir: 'down'}, {cow: 2});
  assert.deepEqual(get(g, 'PLACES.darkPines.name'), {zh: '黑松林', py: 'hēi sōnglín', en: 'The dark pines'});
  assert.ok(get(g, '!!GLOOM'), 'gloomy, as the pine wood');
  assert.deepEqual(get(g, "PLACES.darkPines.exits.map(e => [e.at, e.to])"), [[[16, 0], 'southSlope'], [[17, 0], 'southSlope'], [[16, 29], 'pasture'], [[17, 29], 'pasture']]);
  const prints = get(g, "(() => { const out = []; for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (tileAt(x, y).look === 'hoofprints') out.push([x, y]); return out; })()");
  assert.deepEqual(prints, [[25, 4], [21, 5], [29, 14], [22, 16], [23, 20], [17, 23]], 'from the fork, down the gully to the stream, and on from it, south');
  for (const [id, x, y] of [['pastureWestEnd', 3, 10], ['pastureEastEnd', 30, 27]]){
    assert.equal(g.run(`tileAt(${x}, ${y}).look`), 'boulder', `${id}: at a boulder at the end of a way`);
    assert.deepEqual(get(g, `AREA.hidden.find(h => h.id === '${id}').at`), [x, y, 'darkPines']);
    assert.ok(get(g, `AREA.hidden.find(h => h.id === '${id}').shells`) > 0, `${id}: shells under it`);
  }
  assert.ok(way(g, [16, 1], [3, 9]).length, 'west at the first fork: a way that goes nowhere');
  assert.match(get(g, "tileAt(21, 5).onLook[0].do[0].message"), /Hoofprints in the soft earth/);
});

test('down the gully, a great hollow pine lies along the way: you crawl through it, and it’s drawn over you', async () => {
  const g = game({place: 'darkPines', x: 28, y: 4, dir: 'down'}, {cow: 2});
  assert.deepEqual(get(g, "mapObjects().filter(o => o.look === 'hollowLog')"), [{look: 'hollowLog', x: 28, y: 8, w: 2, h: 4}]);
  assert.ok([[28, 8], [29, 11]].every(([x, y]) => g.run(`walkable(${x}, ${y})`)), 'you can walk into it');
  assert.ok(get(g, "OVER_OBJECTS.includes('hollowLog') && OBJECT_PIECES.find(p => p.look === 'hollowLog').over[0][3] === OBJECT_PIECES.find(p => p.look === 'hollowLog').ph"), 'all of it over you: you vanish inside');
  await goTo(g, 28, 6);
  assert.match(get(g, '__notes').join(' '), /A great pine has fallen along the gully, hollow inside\. The cow stepped over it, but a little monkey can crawl right through!/);
  assert.equal(g.run('here().logSeen'), 1);
});

test('the hoofprints go into a stream too deep for a little monkey: knock the dead pine on its bank down with your stick, and it falls across', async () => {
  const g = game({place: 'darkPines', x: 16, y: 1, dir: 'down'}, {cow: 2});
  g.run('for (const t of getTasks()) S.tasksSeen[t.id] = 1');   // (the tasks you had as you came in)
  assert.deepEqual(way(g, [16, 1], [16, 28]), [], 'no way on over the stream');
  await goTo(g, 21, 4);
  assert.match(get(g, '__notes').join(' '), /Hoofprints in the soft earth, going east: the cow came this way! Follow them\./, 'the first time you see them (牛 not caught yet: in English)');
  g.run('__notes.length = 0');
  await goTo(g, 23, 17);
  assert.match(get(g, '__notes').join(' '), /The hoofprints go right down into a stream, deep and fast\. A big cow can wade across, but a little monkey can’t! A dead pine leans out over the water…/);
  assert.deepEqual(get(g, "getTasks().filter(t => t.id === 'cowStream').map(t => [t.text, t.target])"),
    [['Get over the stream in the pines: knock the dead pine on its bank down with your 棍子 (stick), so it falls across', [24, 17]]], 'a task, its arrow on the dead pine');
  g.run("$('#saybox').hidden = true; updateHUD()");   // (announced)
  assert.equal(g.run('aimedTask().id'), 'cowStream', 'the newest: the one the yellow arrow shows the way for');
  face(g, 23, 17, 'right');
  assert.deepEqual([g.run('promptFor(24, 17)'), g.run("!!tileAt(24, 17).onLook[0].sparkle")], ['Hit', true], 'A at it: Hit, and it sparkles');
  g.run('__notes.length = 0');
  await press(g, 23, 17, 'right');
  assert.deepEqual(get(g, '[here().pastureLog, tileAt(24, 17).look, tileAt(23, 18).look, tileAt(23, 19).look]'), [1, 'stump', 'logBridge', 'logBridge']);
  assert.ok(['swish', 'thwack', 'rumble', 'splash'].every(k => get(g, '__sounds').includes(k)), 'a whack of your stick, a crash and a splash');
  assert.match(get(g, '__notes').join(' '), /Crack! The dead pine topples over, right across the stream: a bridge! Over you go\./);
  assert.ok(way(g, [16, 1], [16, 28]).length, 'now there’s a way on, to the pasture');
  assert.deepEqual(get(g, "getTasks().filter(t => t.id === 'cowStream')"), [], 'the task is done');
});

test('a game that found the cow before the stream was there gets the fallen pine across it, so it can always get back', () => {
  const g = game({place: 'darkPines', x: 16, y: 28, dir: 'up'}, {cow: 4});
  assert.deepEqual(get(g, '[here().pastureLog, tileAt(23, 18).look, tileAt(24, 17).look]'), [0, 'logBridge', 'stump']);
  assert.ok(way(g, [16, 28], [16, 1]).length, 'the way home');
});

test('over the stream, a rabbit by the way saw the cow go by: 你找牛吗？, and once you win its word game, 牛在那里！ and which way', async () => {
  const g = game({place: 'darkPines', x: 20, y: 22, dir: 'down'}, {cow: 2, pastureLog: 1});
  assert.deepEqual(get(g, "(n => [n.place, n.x, n.y, n.look])(ALL_NPCS.find(n => n.id === 'pastureRabbit'))"), ['darkPines', 20, 23, '兔子']);
  assert.equal(g.run("AREA.bubbles.pastureRabbit.find(b => matches(b.if)).show"), '!');
  g.run('__win = false');
  await press(g, 20, 22, 'down');
  assert.deepEqual([get(g, '__said'), get(g, 'here().rabbitTold')], [['你找牛吗？'], 0], 'lost: it doesn’t tell you yet');
  g.run('__said.length = 0; __notes.length = 0; __win = true');
  await press(g, 20, 22, 'down');
  assert.deepEqual(get(g, '__said'), ['你找牛吗？', '牛在那里！']);
  assert.equal(get(g, 'here().rabbitTold'), 1);
  assert.match(get(g, '__notes').join(' '), /The 兔子 \(rabbit\) points its long ears south, past the long grass, towards the big rocks: that’s the way the cow went!/);
  assert.equal(g.run("(AREA.bubbles.pastureRabbit.find(b => matches(b.if)) || {}).show"), undefined, 'no ! now');
  assert.equal(get(g, "WORD_BANK['那里'].area || null"), null, '那里 is just for listening');
  g.run('__said.length = 0; here().cow = 5');
  await press(g, 20, 22, 'down');
  assert.deepEqual(get(g, '__said'), ['你好！'], 'once the cow’s found, just hello');
});

test('the cow moos now and then in the pines, louder the right way, faint up the ways that go nowhere; not once it’s found', () => {
  const g = game({place: 'darkPines', x: 16, y: 1, dir: 'down'}, {cow: 2});
  const sounds = (x, y) => { g.run(`pl.x = ${x}; pl.y = ${y}`); return get(g, 'placeSounds()'); };
  assert.ok(sounds(17, 4).includes('moo') && !sounds(17, 4).includes('mooFar'), 'at the fork');
  assert.ok(sounds(5, 8).includes('mooFar'), 'up the way west');
  assert.ok(sounds(30, 24).includes('mooFar'), 'up the way east, over the stream');
  assert.ok(sounds(4, 22).includes('mooFar'), 'in the clearing');
  assert.ok(sounds(28, 12).includes('moo'), 'the right way, down the gully');
  assert.ok(sounds(16, 25).includes('moo'), 'the right way, south through the long grass');
  g.run('here().cow = 4');
  assert.ok(!sounds(16, 25).some(s => /moo/.test(s)), 'not once it’s found');
  const p = game({place: 'pasture', x: 20, y: 5, dir: 'down'}, {cow: 2});
  p.run('pl.x = 20; pl.y = 5'); assert.ok(get(p, 'placeSounds()').includes('moo'), 'at the pines’ edge, by the pasture: close now');
  p.run('pl.x = 20; pl.y = 20'); assert.deepEqual(get(p, 'placeSounds()'), ['birds'], 'out in the pasture, birds');
});

test('at the big rocks, a bear (熊) instead of the wolf: a boss, with its picture and its own look on the map; wolves stay in the long grass', () => {
  const g = game({place: 'pasture', x: 20, y: 15, dir: 'up'}, {cow: 4});
  assert.deepEqual(get(g, '[ENEMIES.bear.word, ENEMIES.bear.boss, !!PICTURES["熊"], !!MAP_SPRITES["熊"], WORD_BANK["熊"].py, WORD_BANK["熊"].en]'), ['熊', true, true, true, 'xióng', 'bear']);
  assert.deepEqual(get(g, "AREA.events.find(e => e.if.cowWolf === 0).do[0].battle"), 'bear');
  assert.ok(get(g, "LEGEND.n.wild").includes('wolf'), 'the long grass in the pines: wolves');
});
