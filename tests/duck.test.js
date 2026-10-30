// The duck (decided 30 October 2026: more friendly animals where there were none, one at a time): 鸭子 swimming on the home
// ground's stream, east of the fishing monkey, from chapter 1. You meet it from the bank, as any animal at its spot.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2, build: 2, school: 2};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '水', '河', '鱼', '鸟', '动物'];
function game(area){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, w, areas: {1: area}, pos: {place: 'homeGround', x: 27, y: 17, dir: 'down'}}});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  return g;
}

test('the duck swims on the home ground’s stream from chapter 1, and A on the bank meets it', () => {
  const g = game(CHAPTER_ONE);
  assert.deepEqual(get(g, "[tileAt(27, 18).look, !!tileAt(27, 18).walk]"), ['water', false], 'on the stream');
  assert.deepEqual(get(g, "(a => [a.id, a.hz, a.chapter, a.swims, a.home])(animalAt(27, 18))"), ['duck', '鸭子', 1, true, '水']);
  assert.equal(g.run('promptFor(27, 18)'), 'Meet', 'facing it from the bank');
  g.run("globalThis.__met = null; wildAppears = (a, at) => { __met = [a.id, at.x, at.y]; }");
  g.run('interact(27, 18)');
  assert.deepEqual(get(g, '__met'), ['duck', 27, 18]);
  g.run('drawWorld(performance.now())');   // (drawn swimming, bobbing, ripples either side)
});

test('in the prologue, it isn’t there yet: no duck on the stream, nor on the Friends page', () => {
  const g = game({elder: 2});
  assert.equal(get(g, 'animalAt(27, 18)'), null);
  assert.equal(g.run("promptFor(27, 18) === 'Meet'"), false, 'A fishes or looks at the water, as before');
  assert.equal(get(g, "friendAnimals().some(a => a.id === 'duck')"), false);
  assert.equal(get(g, "friendAnimals().filter(a => a.chapter > 0).length"), 0, 'nor any of chapter 1’s, such as the deer, now that a chapter’s animals wait for it');
});

test('鸭子 yāzi: a duck, small on the map, never an answer beside a bird, with the 鸟 (bird) on the right of 鸭', () => {
  const g = game(CHAPTER_ONE);
  assert.deepEqual(get(g, "[WORDS['鸭子'].py, WORDS['鸭子'].en, !!PICTURES['鸭子'], MAP_SPRITES['鸭子'].faces]"), ['yāzi', 'duck', true, 'left']);
  assert.ok(get(g, "alike('鸭子', '鸟') && alike('鸭子', '动物')"), 'a duck is a bird, and an animal');
  assert.deepEqual(get(g, "MADE['鸭子'].clue"), ['鸟', 'niǎo', 'bird']);
  assert.equal(get(g, "ANIMALS.find(a => a.id === 'duck').clue"), 'The home ground, on the stream');
});
