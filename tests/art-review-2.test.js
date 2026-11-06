// The art of the rest of the game, from the second art review (decided 6 November 2026): Flower Fruit Mountain's places,
// the teacher's mountain and the demon's lair. The 老板's shop and stall had red and white stripes like a seaside kiosk,
// the lair's dead trees were the pine wood's thin grey poles, and the master's room sat in the top left of the screen.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
function game(pos){   // a game in the human world, at pos
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, shells: 12, areas: {1: {chapter: 1, raft: 3, done: true}, 2: {landed: 1, dressed: 2}}, pos}});
  g.run("mode = 'play'; save = () => {}");
  g.run('placePlayer()');
  return g;
}
// what a drawing fills, each [colour, x, y, w, h]
const drawn = (g, code) => get(g, `(() => { const out = [], ctx = {fillStyle: '', fillRect(x, y, w, h){ out.push([this.fillStyle, x, y, w, h]); }}; ${code}; return out; })()`);

test('the 老板’s shop and his stall: a plain cloth awning, not red and white stripes', () => {
  const g = game({place: 'highRoad', x: 16, y: 9, dir: 'up'});
  const cloth = get(g, 'AWNING[1]');
  for (const [what, code] of [['his shop', 'shopHut(ctx, 0, 32, 48, 32, 3)'], ['his stall', 'stall(ctx, 0, 32, 48)']]){
    const fills = drawn(g, code).map(([c]) => c);
    assert.ok(!fills.includes('#F4F1EA') && !fills.includes('#C0392B'), what + ': no stripes');
    assert.ok(fills.filter(c => c === cloth).length >= 40, what + ': the cloth');
  }
});

test('the dead trees on the demon’s mountain: gnarled and burnt black, branches clawing up, not the pine wood’s grey pole', () => {
  const g = game({place: 'highRoad', x: 16, y: 9, dir: 'up'});
  const X = 32, Y = 32, tree = drawn(g, 'OBJECT_ART.ashPine(ctx, {x: 2, y: 2, w: 1, h: 1})'), grey = get(g, 'BARE');
  assert.ok(!tree.some(([c]) => grey.includes(c)), 'none of the dead pine’s grey');
  assert.ok(tree.some(([c, x, y]) => x <= X + 2 && y < Y - 6) && tree.some(([c, x, y]) => x >= X + 14 && y < Y - 6), 'branches up to the left and to the right');
  assert.ok(tree.every(([c, x, y]) => y >= Y - g.run('PIECE_UP')), 'no higher than a big object can reach');
});

test('a place smaller than the screen, such as the master’s room, sits in its middle, with dark round it', () => {
  const g = game({place: 'masterRoom', x: 4, y: 4, dir: 'up'});
  assert.deepEqual(get(g, '[COLS, ROWS, camX(), camY()]'), [9, 7, -48, -24], 'nine squares by seven, in the middle of fifteen by ten');
  const blits = c => get(g, `(() => { const out = []; b.drawImage = (c, ...a) => out.push(a); ${c}; return out; })()`);
  assert.deepEqual(blits('drawLayer(mapCanvas, camX(), camY())'), [[0, 0, 144, 112, 48, 24, 144, 112]], 'the whole room, drawn where it shows: never anything off its edges');
  g.run("enterPlace('town')");
  const [cx, cy, w, h] = get(g, '[camX(), camY(), COLS*T - VW*T, ROWS*T - VH*T]');
  assert.ok(cx >= 0 && cx <= w && cy >= 0 && cy <= h, 'a bigger place: the screen on the map, as before');
  assert.deepEqual(blits('drawLayer(mapCanvas, 0, 0)'), [[0, 0, 240, 160, 0, 0, 240, 160]], 'the screen’s worth of it');
  assert.deepEqual(blits('drawLayer(mapCanvas, -1, 0)'), [[0, 0, 239, 160, 1, 0, 239, 160]], 'and shaking past its edge, only what’s there');
});

test('trees as in a Chinese painting: broad flat layers of leaves on branches, in three lopsided shapes; the fruit trees to match', () => {
  const g = game({place: 'highRoad', x: 16, y: 9, dir: 'up'});
  const [wood, leaf, peach] = [get(g, 'WOOD'), get(g, 'LEAF'), get(g, 'PEACHES')], X = 32, Y = 32;
  assert.ok(get(g, '[...TREE_LAYERS, ...TALL_LAYERS].flat()').every(([x, y, rx, ry]) => rx >= 1.5 * ry), 'every layer of leaves broad and flat, not a ball');
  const big = drawn(g, 'OBJECT_ART.tree(ctx, {x: 2, y: 2, w: 2, h: 2})');
  assert.ok(big.some(([c, x, y]) => c === wood[1] && y < Y + 18 && (x < X + 13 || x > X + 19)), 'branches up from its trunk into the leaves');
  const shape = (x, w) => JSON.stringify(drawn(g, `OBJECT_ART.tree(ctx, {x: ${x}, y: 2, w: ${w}, h: ${w}})`).filter(([c]) => c === leaf[0]).map(([c, rx, ry, rw, rh]) => [rx - x * 16, ry, rw, rh]));
  for (const w of [1, 2]) assert.equal(new Set([0, 1, 2, 3, 4, 5].map(x => shape(x, w))).size, 3, (w === 2 ? 'big trees' : 'tall trees') + ': three shapes, so a row of them isn’t all the same');
  const fruitTree = drawn(g, 'OBJECT_ART.peachTree(ctx, {x: 2, y: 2, w: 1, h: 1})');
  assert.equal(fruitTree.filter(([c, x, y, w, h]) => c === peach[0] && w === 2 && h === 2).length, 7, 'a peach tree, full of peaches');
  assert.ok(fruitTree.some(([c, x, y]) => c === wood[1] && y < Y + 6 && (x < X + 6 || x > X + 9)), 'its branches');
});
