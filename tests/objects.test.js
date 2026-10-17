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
