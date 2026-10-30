// The frog (decided 30 October 2026: more friendly animals where there were none, one at a time): 青蛙 on a lily pad on
// the south slope's brook, just west of the stepping stones, from chapter 1. Tiny on the map, floating as the duck does.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2, build: 2, school: 2};
function game(area, pos = {place: 'southSlope', x: 11, y: 22, dir: 'left'}){
  const w = Object.fromEntries(['石头', '你好', '山', '花', '草', '树', '水', '河', '鱼', '动物'].map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, w, areas: {1: area}, pos}});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  return g;
}

test('the frog floats on a lily pad by the stepping stones from chapter 1, tiny, and A from the bank meets it', () => {
  const g = game(CHAPTER_ONE);
  assert.deepEqual(get(g, "[tileAt(10, 22).look, !!tileAt(10, 22).walk, tileAt(12, 23).look]"), ['water', false, 'hopStone'], 'on the brook, beside the stepping stones');
  assert.deepEqual(get(g, "(a => [a.id, a.hz, a.chapter, a.swims, a.home])(animalAt(10, 22))"), ['frog', '青蛙', 1, true, '水']);
  assert.equal(g.run('promptFor(10, 22)'), 'Meet', 'from the bank beside it');
  assert.equal(game(CHAPTER_ONE, {place: 'southSlope', x: 10, y: 21, dir: 'down'}).run('promptFor(10, 22)'), 'Meet', 'or from the tall grass above it');
  g.run("globalThis.__met = null; wildAppears = (a, at) => { __met = [a.id, at.x, at.y]; }");
  g.run('interact(10, 22)');
  assert.deepEqual(get(g, '__met'), ['frog', 10, 22]);
  assert.ok(get(g, 'walkable(13, 22) && walkable(12, 22)'), 'the way to the stepping stones stays open');
  g.run('drawWorld(performance.now())');
  assert.equal(get(game({elder: 2}), 'animalAt(10, 22)'), null, 'not there in the prologue');
});

test('青蛙 qīngwā: a frog, with its picture and tiny map figure, and nothing to say about how it’s made', () => {
  const g = game(CHAPTER_ONE);
  assert.deepEqual(get(g, "[WORDS['青蛙'].py, WORDS['青蛙'].en, !!PICTURES['青蛙'], MAP_SPRITES['青蛙'].faces || null]"), ['qīngwā', 'frog', true, null], 'facing you');
  assert.equal(get(g, "MADE['青蛙'] || null"), null);
  assert.equal(get(g, "ANIMALS.find(a => a.id === 'frog').clue"), 'The south slope, by the stepping stones');
});
