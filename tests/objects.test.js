// Big objects: trees, the fruit trees, your stone, the rocks and the practice post are drawn bigger than their
// squares (js/art.js), and the part above their squares goes over anyone walking behind them.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const objects = game => JSON.parse(game.run('JSON.stringify(mapObjects())'));
const at = (list, x, y) => list.find(o => o.x === x && o.y === y);

test('a block of forest two squares by two is one big tree; other trees stand on their own square', () => {
  const list = objects(loadGame());
  for (const [x, y] of [[20, 1], [22, 1], [20, 3], [22, 3], [20, 5], [22, 5]]) assert.deepEqual(at(list, x, y), {look: 'tree', x, y, w: 2, h: 2}, `the forest's big tree at ${x}, ${y}`);
  assert.equal(at(list, 21, 1), undefined, 'a big tree covers its four squares');
  assert.deepEqual(at(list, 12, 8), {look: 'tree', x: 12, y: 8, w: 1, h: 1}, 'the tree by the pond is a tall tree');
  assert.deepEqual(at(list, 5, 21), {look: 'tree', x: 5, y: 21, w: 1, h: 1}, 'a row of forest is tall trees');
});

test('the fruit trees, your stone, the post and the rocks are big objects; the rocks are one pile', () => {
  const list = objects(loadGame());
  assert.equal(at(list, 1, 6).look, 'peachTree');
  assert.equal(at(list, 21, 17).look, 'appleTree');
  assert.equal(at(list, 9, 1).look, 'stone');
  assert.equal(at(list, 13, 9).look, 'post');
  assert.deepEqual(at(list, 15, 4), {look: 'rocks', x: 15, y: 4, w: 2, h: 1});
  assert.equal(at(list, 16, 4), undefined);
  const bottoms = list.map(o => o.y + o.h);
  assert.deepEqual(bottoms, [...bottoms].sort((a, b) => a - b), 'drawn from the top of the map down, so nearer ones overlap');
});

test('the shop owner’s stall is three squares wide, and he stands beside it', () => {
  const game = loadGame();
  assert.deepEqual(at(objects(game), 8, 16), {look: 'stall', x: 8, y: 16, w: 3, h: 1});
  for (const x of [8, 9, 10]) assert.equal(game.run(`walkable(${x}, 16)`), false, `you can't walk into the stall at ${x}, 16`);
  assert.equal(game.run('walkable(9, 15)'), true, 'you can walk behind it');
  assert.equal(game.run('npcAt(11, 16).id'), 'boss', 'the shop owner stands just to its right, where he always has');
});

test('walking through a tree’s leaves makes it rustle; standing still or walking past in front doesn’t', () => {
  const game = loadGame();
  const tree = 'OBJECT_PIECES.find(p => p.x === 12 && p.y === 8)';   // the tree by the pond
  game.run('pl.px = 12.5*T; pl.py = 7*T; pl.mv = {fx: 13, fy: 7, tx: 12, ty: 7, t0: 900}; touchLeaves(1000)');   // walking left along the row above it
  assert.equal(game.run(`${tree}.rustle`), 1000, 'behind it, it rustles');
  assert.ok(game.run('fallingLeaves.length') >= 3, 'and leaves fall');
  game.run(`${tree}.rustle = -1e9; pl.mv = null; touchLeaves(3000)`);
  assert.equal(game.run(`${tree}.rustle`), -1e9, 'standing still, it doesn’t');
  game.run(`pl.px = 12.5*T; pl.py = 9*T; pl.mv = {fx: 13, fy: 9, tx: 12, ty: 9, t0: 3900}; touchLeaves(4000)`);
  assert.equal(game.run(`${tree}.rustle`), -1e9, 'walking past in front of it, it doesn’t');
  assert.equal(game.run('OBJECT_PIECES.find(p => p.look === "stone").leafy'), null, 'stones don’t rustle');
});

// Takes a step from one square to another, and checks for rustling just as you reach the next square's leaves.
const step = (game, [fx, fy], [tx, ty], now) => game.run(`pl.px = ${(fx+tx)/2}*T; pl.py = ${(fy+ty)/2}*T; pl.mv = {fx: ${fx}, fy: ${fy}, tx: ${tx}, ty: ${ty}, t0: ${now - 120}}; touchLeaves(${now})`);
const apple = 'OBJECT_PIECES.find(p => p.look === "appleTree")';   // the apple tree, at 21, 17

test('walking past a wide fruit tree, it rustles once, as you step into its branches beside it', () => {
  const game = loadGame();
  step(game, [22, 16], [22, 17], 1000);
  assert.equal(game.run(`${apple}.rustle`), 1000, 'into the square beside it');
  game.run('touchLeaves(1100)');
  assert.equal(game.run(`${apple}.rustle`), 1000, 'once a step, not again');
  game.run(`${apple}.rustle = -1e9`);
  step(game, [22, 17], [22, 18], 2000);
  assert.equal(game.run(`${apple}.rustle`), -1e9, 'walking on out of the branches, it doesn’t');
});

test('stepping into a corner by a fruit tree, or turning and walking away from it, doesn’t make it rustle', () => {
  const game = loadGame();
  step(game, [23, 16], [22, 16], 1000);
  assert.equal(game.run(`${apple}.rustle`), -1e9, 'the square above and to the side is a corner, not its branches');
  step(game, [22, 16], [22, 15], 2000);
  assert.equal(game.run(`${apple}.rustle`), -1e9, 'nor walking away');
});

test('bigger pictures don’t change where you can walk: the square above a tree is still open', () => {
  const game = loadGame();
  assert.equal(game.run('walkable(12, 7)'), true, 'above the tree by the pond');
  assert.equal(game.run('walkable(12, 8)'), false, 'the tree itself');
  assert.equal(game.run('walkable(9, 1)'), false, 'your stone');
});

test('once the rocks roll away, they’re no longer drawn', () => {
  const game = loadGame({save: {version: 21, started: true}});
  game.run('here().gate = true');
  assert.equal(at(objects(game), 15, 4), undefined);
});
