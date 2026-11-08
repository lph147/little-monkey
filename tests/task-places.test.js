// Where each task is done (decided 5 November 2026, after playing it: the hens were out of their yard, but where?): on
// the Tasks page, under a task, the place it's in, while you're somewhere else, from where its arrow points, or the
// task's own where; and the hens' arrow points at the nearest one still loose.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const WORDS = ['猴子', '人', '衣服', '帽子', '不', '是', '什么', '井', '房子', '门', '谁', '鸡', '鱼', '鱼竿'];
function game(area, pos, area1 = false){
  const w = Object.fromEntries(WORDS.map(x => [x, {lv: 1, ok: 1}]));
  const save = area1 ? {version: 34, started: true, w: {}, met: ['sheep', 'squirrel', 'rabbit'], areas: {1: area}, pos}   // (the meadow's animals found: its words come after them)
    : {version: 34, started: true, area: 2, w, friends: ['goose', 'chicken'], areas: {1: {raft: 3}, 2: {landed: 1, dressed: 2, back: 1, oldFisher: 1, child: 3, knock: 1, ...area}}, pos};
  const g = loadGame({dom: true, save});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  return g;
}
const taskLine = (g, start) => { g.run('tasksPage(() => {})'); return g.el('#sheet').querySelectorAll('.tasks li').map(li => li.textContent.replace(/\s+/g, ' ').trim()).find(t => t.startsWith(start)); };

test('the hens, from somewhere else: the task says they’re in the village', () => {
  const g = game({}, {place: 'shore', x: 11, y: 16, dir: 'up'});
  assert.match(taskLine(g, 'The hens are out'), /\(0\/4\) ?The fishing village$/);
  const v = game({}, {place: 'village', x: 16, y: 14, dir: 'up'});
  assert.match(taskLine(v, 'The hens are out'), /\(0\/4\)$/, 'and in the village, it needn’t say');
});

test('the hens’ arrow points at the nearest one still loose', () => {
  const g = game({hen2: 1}, {place: 'village', x: 13, y: 8, dir: 'left'});
  const hens = get(g, 'ALL_NPCS.filter(n => /^hen/.test(n.id)).map(n => [n.id, n.x, n.y])');
  const t = get(g, 'getTasks().find(t => t.id === "a2hens")');
  const loose = hens.filter(([id]) => id !== 'hen2').sort((a, b) => (Math.abs(a[1] - 13) + Math.abs(a[2] - 8)) - (Math.abs(b[1] - 13) + Math.abs(b[2] - 8)));
  assert.deepEqual(t.target, [loose[0][1], loose[0][2]], 'the nearest loose hen (hen1, by the well)');
  g.run('Object.assign(here(), {hen1: 1}); placeCharacters()');
  assert.notDeepEqual(get(g, 'getTasks().find(t => t.id === "a2hens").target'), [loose[0][1], loose[0][2]], 'caught, it’s the next nearest');
});

test('a task whose arrow points at someone in another place says that place', () => {
  const g = game({fish: 'asked', holding: {fish: '鱼'}}, {place: 'shore', x: 11, y: 16, dir: 'up'});
  assert.match(taskLine(g, 'Take the'), /fisherman in the village ?The fishing village$/);
  assert.match(taskLine(game({fish: 'asked'}, {place: 'shore', x: 11, y: 16, dir: 'up'}), 'Catch a'), /The sea, or the village’s stream$/, 'or its own few words');
});

test('on Flower Fruit Mountain too: the meadow’s words, from the cave', () => {
  const g = game({elder: 2, cave: 2, caveThings: 0}, {place: 'cave', x: 7, y: 11, dir: 'up'}, true);
  assert.match(taskLine(g, 'Learn the words for the meadow'), /The meadow$/);
});
