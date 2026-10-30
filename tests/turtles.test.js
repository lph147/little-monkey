// The turtle and the sea turtle (decided 30 October 2026: more friendly animals where there were none): 乌龟 warming
// itself on the boulder by the hot spring pools, and 海龟 on the shore's sand by the sea, both from chapter 1. Their
// pictures are never two answers in a question (a domed shell side on; a flat one from above, with flippers), and 海龟 is
// made of 海 (sea) and the 龟 of 乌龟.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2, build: 2, school: 2};
function game(area, pos){
  const w = Object.fromEntries(['石头', '你好', '山', '花', '草', '树', '水', '河', '鱼', '动物', '海'].map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, w, areas: {1: area}, pos}});
  g.run("mode = 'play'; save = () => {}; placePlayer(); globalThis.__met = null; wildAppears = (a, at) => { __met = [a.id, at.x, at.y]; }");
  return g;
}

test('the turtle sits up on the warm boulder by the hot spring pools, and A beside it meets it', () => {
  const g = game(CHAPTER_ONE, {place: 'hotSprings', x: 6, y: 12, dir: 'down'});
  assert.deepEqual(get(g, "[tileAt(6, 13).look, (a => [a.id, a.hz, a.perch, a.chapter, a.home])(animalAt(6, 13))]"), ['boulder', ['turtle', '乌龟', 5, 1, '石头']]);
  assert.equal(g.run('promptFor(6, 13)'), 'Meet');
  g.run('interact(6, 13)');
  assert.deepEqual(get(g, '__met'), ['turtle', 6, 13]);
  g.run('drawWorld(performance.now())');
  assert.equal(get(game({elder: 2}, {place: 'hotSprings', x: 6, y: 12, dir: 'down'}), 'animalAt(6, 13)'), null, 'not there in the prologue');
});

test('the sea turtle is on the shore’s sand at the water’s edge, clear of the crabs and the raft', () => {
  const g = game(CHAPTER_ONE, {place: 'shore', x: 4, y: 11, dir: 'down'});
  assert.deepEqual(get(g, "[tileAt(4, 12).look, tileAt(4, 13).look, (a => [a.id, a.hz, a.chapter, a.home])(animalAt(4, 12))]"), ['sand', 'sea', ['seaTurtle', '海龟', 1, '海']]);
  assert.equal(g.run('promptFor(4, 12)'), 'Meet');
  g.run('interact(4, 12)');
  assert.deepEqual(get(g, '__met'), ['seaTurtle', 4, 12]);
  assert.ok(get(g, "ALL_NPCS.filter(n => /crab/.test(n.id)).every(n => n.y !== 12)"), 'the crabs scuttle along their own rows, never its');
  g.run('drawWorld(performance.now())');
});

test('乌龟 and 海龟: never two answers together; 海 sea + 龟, as in 乌龟, makes 海龟', () => {
  const g = game(CHAPTER_ONE, {place: 'shore', x: 4, y: 11, dir: 'down'});
  assert.deepEqual(get(g, "[WORDS['乌龟'].py, WORDS['乌龟'].en, WORDS['海龟'].py, WORDS['海龟'].en, !!PICTURES['乌龟'], !!PICTURES['海龟']]"), ['wūguī', 'turtle', 'hǎiguī', 'sea turtle', true, true]);
  assert.ok(get(g, "alike('乌龟', '海龟') && alike('海龟', '乌龟')"), 'look-alikes, both ways');
  assert.deepEqual(get(g, "MADE['海龟'].parts"), [['海', 'hǎi', 'sea'], ['龟', 'guī', 'turtle', '乌龟']]);
  assert.equal(get(g, "MADE['乌龟'] || null"), null, 'nothing to say about how 乌龟 is made');
});
