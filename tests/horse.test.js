// The horse (decided 30 October 2026: more friendly animals where there were none, one at a time): 马 grazing out on
// the pasture's grass, west of the way in from the dark pines, from chapter 1. Big on the map, as the cow is.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2, build: 2, school: 2};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '水', '河', '鱼', '鸟', '动物', '牛'];
function game(area){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, w, areas: {1: area}, pos: {place: 'pasture', x: 10, y: 18, dir: 'left'}}});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  return g;
}

test('the horse grazes on the pasture from chapter 1, big, and A beside it meets it', () => {
  const g = game(CHAPTER_ONE);
  assert.deepEqual(get(g, "(a => [a.id, a.hz, a.chapter, a.home, a.spr.width, a.spr.height])(animalAt(9, 18))"), ['horse', '马', 1, '草', 22, 22], 'big, as the cow is');
  assert.equal(get(g, 'walkable(9, 18)'), false, 'in the way, as any animal at its spot');
  assert.equal(g.run('promptFor(9, 18)'), 'Meet');
  g.run("globalThis.__met = null; wildAppears = (a, at) => { __met = [a.id, at.x, at.y]; }");
  g.run('interact(9, 18)');
  assert.deepEqual(get(g, '__met'), ['horse', 9, 18]);
  g.run('drawWorld(performance.now())');
  assert.equal(get(game({elder: 2}), 'animalAt(9, 18)'), null, 'not there in the prologue');
});

test('马 mǎ: a horse, drawn from a horse, never an answer beside 动物 (animal)', () => {
  const g = game(CHAPTER_ONE);
  assert.deepEqual(get(g, "[WORDS['马'].py, WORDS['马'].en, !!PICTURES['马'], MAP_SPRITES['马'].faces]"), ['mǎ', 'horse', true, 'left']);
  assert.match(get(g, "MADE['马'].why"), /^Drawn from a horse/);
  assert.equal(get(g, "soundsLike('马')"), null, '吗 (ma) is said in questions, but isn’t a word you collect: no Sounds like card');
  assert.ok(get(g, "alike('马', '动物') && !alike('马', '牛') && !alike('马', '鹿')"), 'an animal, but its picture is never mistaken for the cow or the deer');
});
