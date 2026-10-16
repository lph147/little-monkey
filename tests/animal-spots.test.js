// Animals at their own spots (the squirrel up a tree, the goat on a cliff), and tall grass that
// rustles where another animal is hiding.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
const ready = () => loadGame({save: {version: 10, started: true, areas: {1: {elder: 2}},
  w: Object.fromEntries(['动物', '石头', '山', '树', '花', '草'].map(w => [w, {lv: 1, due: 0, ok: 0}]))}});   // animals appear

test('animals with a spot live where you can face them, on a tile you can\'t walk on', () => {
  const game = loadGame();
  for (const a of get(game, 'ANIMALS.filter(a => a.at)')){
    const [x, y] = a.at;
    assert.equal(get(game, `!!tileAt(${x}, ${y}).walk`), false, `${a.hz} should be on a tree or cliff, not where you walk`);
    assert.ok(get(game, `[[0,1],[0,-1],[1,0],[-1,0]].some(([dx, dy]) => walkable(${x} + dx, ${y} + dy))`), `you should be able to stand next to ${a.hz}`);
  }
});

test('the squirrel and goat only appear once you know about animals; then A meets them', () => {
  assert.equal(get(loadGame(), 'animalAt(13, 18)'), null, 'not before the old monkey tells you about animals');
  const game = ready();
  assert.equal(get(game, 'animalAt(13, 18).hz'), '松鼠');
  game.run("S.pos = {x:13, y:19, dir:'up'}; placePlayer(); mode = 'play'");
  assert.equal(get(game, 'promptFor(13, 18)'), 'Meet');
});

test('an animal hides in tall grass at least 3 steps away, and stepping there meets it', async () => {
  const game = ready();
  game.run("S.pos = {x:9, y:7, dir:'down'}; placePlayer(); hideAnimal()");
  const r = get(game, 'rustle');
  assert.ok(r, 'an animal is hiding');
  assert.equal(get(game, `!!tileAt(${r.x}, ${r.y}).animals`), true, 'in tall grass');
  assert.ok(Math.abs(r.x - 9) + Math.abs(r.y - 7) >= 3, 'not right next to you');
  assert.equal(r.a.at, null, 'one of the grass animals');
  game.run('globalThis.__met = null; wildAppears = async a => { __met = a.hz; }');
  await game.run(`arrive(${r.x}, ${r.y})`);
  assert.equal(get(game, '__met'), r.a.hz);
  assert.equal(get(game, 'rustle'), null);
  for (let i = 0; i < 3; i++) await game.run('arrive(9, 7)');
  assert.equal(get(game, 'rustle'), null, 'the next one waits a few steps');
  await game.run('arrive(9, 7)');
  assert.ok(get(game, 'rustle'), 'then another hides');
});
