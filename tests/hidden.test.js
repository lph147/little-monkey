// Things hidden off the paths (decided 23 October 2026): on the hillside, three little piles of shells and two apples,
// each tucked away at a tree, a boulder or the pines, found by pressing A at it, once; a tiny glint now and then gives each
// away. An apple goes into your bag; with no room, it stays where it is till you come back.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 1, wood: 'asked', stones: 'asked', woodIn: 1, lookTip: 1, trainee1: 1, trainee2: 1};
const KNOWS = Object.fromEntries(['石头', '树', '山', '花', '草', '苹果', '桃子'].map(w => [w, {lv: 1, ok: 3, next: 100}]));
// A game on the hillside, standing at x, y facing dir (save: more of the save), with its messages and cards kept for the test
function game(x, y, dir, save = {}){
  const g = loadGame({dom: true, save: {version: 29, started: true, w: KNOWS, areas: {1: CHAPTER_ONE}, pos: {place: 'hillside', x, y, dir}, ...save}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; toast = t => { __notes.push(t); }; showNotice = async w => { __notes.push('card: ' + w); }");
  g.run('placePlayer()');
  return g;
}

test('on the hillside, three piles of shells and two apples are hidden at trees, a boulder and a pine, each beside where you can stand', () => {
  const g = game(12, 43, 'up');
  const hidden = get(g, 'AREA.hidden');
  assert.deepEqual(hidden.map(h => h.shells || h.fruit), [2, 2, 2, '苹果', '苹果']);
  for (const h of hidden){
    const [x, y] = h.at;
    assert.equal(h.at[2], 'hillside');
    assert.ok(!g.run(`walkable(${x}, ${y})`), `${h.id}: at something you can’t walk through`);
    assert.ok(['tree', 'boulder', 'pine'].includes(g.run(`tileAt(${x}, ${y}).look`)), `${h.id}: a tree, a boulder or a pine`);
    assert.ok([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g.run(`walkable(${x + dx}, ${y + dy})`)), `${h.id}: you can stand beside it`);
  }
  assert.equal(new Set(hidden.map(h => h.id)).size, hidden.length, 'each its own name in the save');
});

test('A at one finds it: 2 shells, with a message, just once; after that, A there does what it always did', async () => {
  const g = game(22, 38, 'down');   // above the tree at the foot of the hillside, on the right
  const shells = g.run('S.shells');
  await g.run('interact(22, 39)');
  assert.deepEqual(get(g, '__notes'), ['Tucked behind the tree: 2 🐚!']);
  assert.equal(g.run('S.shells'), shells + 2);
  assert.equal(g.run("here().finds.hillTree"), 1, 'the save keeps it');
  await g.run('interact(22, 39)');
  assert.equal(g.run('S.shells'), shells + 2, 'found once');
  assert.equal(get(g, '__notes[1]'), 'card: 树', 'now A at the tree shows its word, as before');
});

test('an apple goes into your bag; with no room for it, it stays there till you come back', async () => {
  const g = game(18, 4, 'right', {bag: {'苹果': 3}});   // beside the pine at the clearing under the pines, the bag full of apples (3)
  await g.run('interact(19, 4)');
  assert.match(get(g, '__notes[0]'), /There’s a 苹果 \(apple\) here, but your bag has no room for it\. Come back for it\./);
  assert.equal(g.run("here().finds.hillPine"), undefined, 'not found yet');
  g.run("S.bag['苹果'] = 2");
  await g.run('interact(19, 4)');
  assert.equal(get(g, '__notes[1]'), 'Tucked among the pine’s roots: a 苹果 (apple) for your bag!');
  assert.deepEqual([g.run("S.bag['苹果']"), g.run('here().finds.hillPine')], [3, 1]);
});

test('a tiny glint now and then gives each away, at its own time, until it’s found', () => {
  const g = game(12, 43, 'up');
  const glinting = id => g.run(`(() => { const h = AREA.hidden.find(h => h.id === '${id}'); let k = 0; for (let t = 0; t < GLINT_EVERY * 3; t += 10) if (glintsNow(500000 + t).some(([x, y]) => x === h.at[0] && y === h.at[1])) k++; return k * 10 / (GLINT_EVERY * 3); })()`);
  const share = glinting('hillTree');
  assert.ok(Math.abs(share - get(g, 'GLINT_MS / GLINT_EVERY')) < .02, `now and then (${share} of the time)`);
  assert.ok(get(g, '[0, 400, 800, 1200, 1600, 2000].map(t => glintsNow(t).length)').some(n => n < 5), 'not all at once');
  g.run("here().finds.hillTree = 1");
  assert.equal(glinting('hillTree'), 0, 'found: no more glint');
  g.run("enterPlace('meadow')");
  assert.deepEqual(get(g, '[0, 100, 200, 300, 400].flatMap(t => glintsNow(t))'), [], 'and only in its own place');
});

test('an old save has found nothing yet', () => {
  const g = loadGame({save: {version: 29, started: true, areas: {1: CHAPTER_ONE}}});
  assert.deepEqual(get(g, 'here().finds'), {});
});
