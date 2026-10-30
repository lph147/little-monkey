// The mouse (decided 30 October 2026: more friendly animals where there were none, one at a time): 老鼠 hiding in the
// melon field's tall grass, only there, from chapter 1, as the fox hides on the hillside. Tiny on the map.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2, build: 2, school: 2};
function game(area, place = 'melonField'){
  const w = Object.fromEntries(['石头', '你好', '山', '花', '草', '树', '水', '河', '鱼', '动物', '兔子'].map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({save: {version: 32, started: true, w, met: ['rabbit'], friends: ['rabbit'], areas: {1: area}, pos: {place, x: 6, y: 14, dir: 'left'}}});
  g.run('placePlayer()');
  return g;
}
// Who hides in a place's tall grass, over many tries
const hiding = (g, place) => [...new Set(get(g, `(enterPlace('${place}'), Array.from({length: 300}, () => { rustle = null; stepsSince = HIDE_AFTER; hideAnimal(); return rustle && rustle.a.id; }))`))].filter(Boolean).sort();

test('the mouse hides in the melon field’s tall grass from chapter 1, and nowhere else', () => {
  const g = game(CHAPTER_ONE);
  assert.deepEqual(get(g, "(a => [a.hz, a.hides, a.place, a.chapter, a.at])(ANIMALS.find(a => a.id === 'mouse'))"), ['老鼠', 'melonField', 'melonField', 1, null]);
  assert.ok(hiding(g, 'melonField').includes('mouse'), 'it rustles in the melon field’s tall grass');
  for (const p of ['meadow', 'path', 'valley', 'southSlope', 'hillside']) assert.ok(!hiding(g, p).includes('mouse'), `never in the ${p}’s`);
  assert.ok(!hiding(game({elder: 2}), 'melonField').includes('mouse'), 'not in the prologue');
});

test('老鼠 lǎoshǔ: a mouse, tiny on the map, with its clue on the Friends page', () => {
  const g = game(CHAPTER_ONE);
  assert.deepEqual(get(g, "[WORDS['老鼠'].py, WORDS['老鼠'].en, !!PICTURES['老鼠'], MAP_SPRITES['老鼠'].faces]"), ['lǎoshǔ', 'mouse', true, 'left']);
  assert.equal(get(g, "ANIMALS.find(a => a.id === 'mouse').clue"), 'The melon field’s tall grass');
  assert.ok(get(g, "alike('老鼠', '动物')"), 'an animal');
});
