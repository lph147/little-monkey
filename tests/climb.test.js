// Chapter 1, the hillside (decided 23 October 2026): sounds that change as you climb (birdsong at the foot, the wind on the
// terraces, crows under the pines), and in the lookout's view, two gods peeking out from a gate in the clouds now and then,
// the gate of heaven (南天门), as in the book (redesigned the same day).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 1, wood: 'asked', stones: 'asked', woodIn: 1, lookTip: 1, trainee1: 1, trainee2: 1};
function game(x, y){   // on the hillside, at x, y
  const g = loadGame({dom: true, save: {version: 29, started: true, areas: {1: CHAPTER_ONE}, pos: {place: 'hillside', x, y, dir: 'up'}}});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  return g;
}
const at = (g, x, y) => g.run(`S.pos = {place: 'hillside', x: ${x}, y: ${y}, dir: 'up'}; placePlayer()`);

test('the hillside’s sounds change as you climb: birdsong at the foot, the wind on the terraces, crows under the pines', () => {
  const g = game(12, 43);
  assert.deepEqual(get(g, 'placeSounds()'), ['birds'], 'at the foot, by the flowers and the brook');
  at(g, 9, 19);
  assert.deepEqual(get(g, 'placeSounds()'), ['wind'], 'on the terraces');
  at(g, 12, 5);
  assert.deepEqual(get(g, 'placeSounds()'), ['crow', 'crow', 'wind'], 'under the pines');
  assert.equal(g.run('typeof SFX.birds'), 'function');
  g.run("enterPlace('pineWood')");
  assert.deepEqual(get(g, 'placeSounds()'), get(g, 'PLACES.pineWood.sounds'), 'a place with one set of sounds keeps it everywhere');
});

test('coming into another part of the hillside, one of its sounds comes soon; then every so often', () => {
  const g = game(12, 43);
  g.run("globalThis.__played = []; for (const k of ['birds', 'wind', 'crow']) SFX[k] = () => __played.push(k)");
  g.run('ambience(100000)');
  const first = g.run('ambientAt - 100000');
  assert.ok(first >= 4000 && first <= 10000, `the first a few seconds after you arrive (${first} ms)`);
  at(g, 12, 20); g.run('ambience(101000)');   // up onto the terraces
  const soon = g.run('ambientAt - 101000');
  assert.ok(soon >= 1500 && soon <= 4000, `soon after you come into another part (${soon} ms)`);
  g.run('ambience(ambientAt)');
  assert.deepEqual(get(g, '__played'), ['wind'], 'the terraces’ sound');
  assert.ok(g.run('ambientAt') - g.run('101000 + ' + soon) >= 12000, 'and then another, later');
});

test('in the lookout’s view, two gods peek out from behind a gate in the clouds, for a moment every few seconds', () => {
  const g = game(21, 21);
  const peeks = get(g, 'Array.from({length: 1000}, (_, i) => godsPeek(i * 10))');   // ten seconds
  const out = peeks.filter(k => k === 1).length / peeks.length;
  assert.ok(out > .15 && out < .3, `out for a moment (${out} of the time)`);
  assert.ok(peeks.filter(k => k === 0).length / peeks.length > .6, 'and hidden most of the time');
  assert.ok(peeks.every(k => k >= 0 && k <= 1));
  for (const now of [0, 1000, 2500]) g.run(`drawLookout(2, ${now})`);   // (it draws, peeking or not)
});

test('the gate is the gate of heaven, 南天门 on its plaque; Thousand-Mile Eye comes out on its left and Wind-Following Ear on its right', () => {
  const g = game(21, 21);
  g.run(`globalThis.__wrote = []; const write0 = write; write = (g, text, ...rest) => { __wrote.push(text); return write0(g, text, ...rest); };
    globalThis.__gods = []; b.drawImage = (img, x) => { if (img === GODS.eye || img === GODS.ear) __gods.push([img === GODS.eye ? 'eye' : 'ear', x]); }`);
  g.run('drawLookout(2, 0)');   // hidden behind the pillars
  g.run('drawLookout(2, 1000)');   // out
  assert.deepEqual(get(g, '__wrote'), ['南天门', '南天门']);
  const [eye0, ear0, eye1, ear1] = get(g, '__gods');
  assert.deepEqual([eye0[0], ear0[0], eye1[0], ear1[0]], ['eye', 'ear', 'eye', 'ear']);
  assert.ok(eye1[1] < eye0[1] && ear1[1] > ear0[1], 'out: Thousand-Mile Eye to the left, Wind-Following Ear to the right');
});
