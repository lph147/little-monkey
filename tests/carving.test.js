// Chapter 1: a story carved long ago in the hillside's cliff, behind the peach tree (decided 23 October 2026: old stone
// carvings off the paths, each a moment of the legend, collected through the chapter and watched again in Settings). It
// sparkles till you've looked at it; A at it plays its scene, the start of the legend, coming to life: 山上有石头。
// 石头里有猴子。这只猴子就是你！ Nothing new: words you know, and words to listen to.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 1, wood: 'asked', stones: 'asked', woodIn: 1, lookTip: 1, trainee1: 1, trainee2: 1};
function game(area = {}){   // below the carving, facing it
  const g = loadGame({dom: true, save: {version: 29, started: true, w: {'石头': {lv: 1, ok: 0}, '山': {lv: 1, ok: 0}, '猴子': {lv: 1, ok: 0}},
    areas: {1: {...CHAPTER_ONE, ...area}}, pos: {place: 'hillside', x: 2, y: 32, dir: 'up'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__scenes = []; storyScene = async id => { __scenes.push(id); }; placePlayer()");
  return g;
}
// The squares that sparkle on the map now (each sparkle is drawn at its square, plus a little)
const sparkling = g => get(g, `(() => { const at = [], was = sparkle; sparkle = (px, py) => at.push([Math.floor(px / T), Math.floor(py / T)]);
  drawSparkles(0, 0, 0); sparkle = was; return at; })()`);
const watchable = g => get(g, "Object.entries(AREA.scenes).filter(([, sc]) => sc.watch && matches(sc.when)).map(([id]) => id)");

test('a story is carved in the hillside’s cliff, behind the peach tree, two squares by two, and sparkles till you’ve looked at it', () => {
  const g = game();
  for (const [x, y] of [[2, 30], [3, 30], [2, 31], [3, 31]]) assert.deepEqual(get(g, `[tileAt(${x}, ${y}).look, !!tileAt(${x}, ${y}).carving]`), ['cliffFace', true], `${x}, ${y}: part of the cliff, carved`);
  assert.ok(!g.run('tileAt(1, 31).carving') && !g.run('tileAt(4, 31).carving'), 'just there');
  assert.equal(get(g, 'tileAt(3, 33).pick.item'), '桃子', 'the peach tree in front of it');
  assert.equal(g.run('promptFor(2, 31)'), 'Look');
  assert.ok(sparkling(g).some(([x, y]) => x === 2 && y === 31), 'it sparkles');
});

test('A at it plays its scene; after that it stops sparkling, and Settings has a button to watch it again', async () => {
  const g = game();
  assert.ok(!watchable(g).includes('carving'), 'not in Settings before you’ve seen it');
  await g.run('interact(2, 31)');
  assert.deepEqual(get(g, '__scenes'), ['carving']);
  assert.equal(g.run('here().carving'), 1);
  assert.ok(!sparkling(g).some(([x, y]) => x === 2 && y === 31), 'no more sparkle');
  assert.ok(watchable(g).includes('carving'), 'Watch the carving on the hillside');
  assert.equal(get(g, 'AREA.scenes.carving.watch'), 'Watch the carving on the hillside');
  await g.run('interact(3, 31)');
  assert.deepEqual(get(g, '__scenes'), ['carving', 'carving'], 'and A there shows it again');
});

test('its scene: the start of the legend in three lines, with nothing new to learn, and a picture for each', () => {
  const g = game();
  const caps = get(g, 'AREA.scenes.carving.captions');
  assert.deepEqual(caps.map(c => c.zh), ['山 上 有 石头 。', '石头 里 有 猴子 。', '这 只 猴子 就是 你 ！']);
  assert.deepEqual(caps.map(c => c.en), ['There’s a stone on the mountain.', 'There’s a monkey in the stone.', 'This monkey is you!']);
  assert.ok(caps.every(c => !c.teach), 'it teaches nothing');
  const collect = get(g, 'Object.keys(WORD_BANK).filter(w => WORD_BANK[w].area)');
  for (const w of caps.flatMap(c => c.zh.split(' ')).filter(w => !/^[。！，]$/.test(w))) assert.ok(get(g, `!!WORD_BANK[${JSON.stringify(w)}]`) && (!collect.includes(w) || ['山', '石头', '猴子'].includes(w)), `${w}: a word you know, or one to listen to`);
  assert.equal(get(g, 'WORD_BANK["就是"]').en, 'is (none other than)', '就是, just for listening');
  assert.equal(get(g, 'typeof SCENE_ART.carving'), 'function');
  for (const t of [0, 4, 8]) g.run(`drawCarving(${t}, ${t * 1000})`);   // (each part draws)
});
