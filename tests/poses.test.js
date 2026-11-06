// Your monkey doing things with its own body (js/poses.js; decided 6 November 2026, after playing it: the broom seemed to
// come out of its stomach, with no arms): each pose, from every side, has your paws in it; facing left is facing right
// the other way round; your coat's sleeves are on your arms when you wear it, and your hat on your head; the bucket goes
// into the water you face, and you step up to it; what you've picked is held up over your head.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const POSES = {sweep: [-1, 0, 1], chop: ['up', 'down'], dip: ['out', 'in', 'full', 'back'], reach: ['reach', 'hold']};
const DIRS = ['down', 'up', 'left', 'right'];
const DRESSED = '{coat:true, hat:true, shoes:false, band:false}', BARE = '{coat:false, hat:false, shoes:false, band:false}';
const game = () => loadGame({dom: true, save: {version: 34, started: true, areas: {1: {}}}});
const pose = (g, name, dir, m, wear) => get(g, `POSES.grid('${name}', '${dir}', ${JSON.stringify(m)}, ${wear})`);
const cells = (rows, letters) => rows.flatMap((r, y) => [...r].map((c, x) => letters.includes(c) ? [x, y] : null)).filter(Boolean);
const middle = list => list.reduce(([a, b], [x, y]) => [a + x / list.length, b + y / list.length], [0, 0]);

test('every pose, from every side, has your paws in it, and you in your own square', () => {
  const g = game();
  for (const [name, moments] of Object.entries(POSES)) for (const m of moments) for (const dir of DIRS) for (const wear of [DRESSED, BARE]){
    const p = pose(g, name, dir, m, wear);
    assert.equal(p.rows.length, 48);
    assert.ok(p.rows.every(r => r.length === 48), `${name} ${m} ${dir}: 48 pixels square`);
    assert.ok(cells(p.rows, 'h').length >= 1, `${name} ${m} ${dir}: your paws`);
    const [x, y] = middle(cells(p.rows, 'fCsS'));
    assert.ok(x >= 12 && x <= 36 && y >= 10 && y <= 36, `${name} ${m} ${dir}: you, in (or stepped up from) your own square (${x.toFixed(1)}, ${y.toFixed(1)})`);
  }
});

test('facing left is facing right the other way round, your paw and the bucket too', () => {
  const g = game();
  for (const [name, moments] of Object.entries(POSES)) for (const m of moments){
    const r = pose(g, name, 'right', m, DRESSED), l = pose(g, name, 'left', m, DRESSED);
    assert.deepEqual(l.rows, r.rows.map(row => [...row].reverse().join('')), `${name} ${m}`);
    if (r.paw) assert.deepEqual(l.paw, [47 - r.paw[0], r.paw[1]]);
    if (r.bucket) assert.deepEqual(l.bucket, [47 - r.bucket[0], r.bucket[1]]);
    assert.equal(l.step[0] + 0, -r.step[0] + 0, `${name} ${m}: stepped the other way`);   // (+ 0: not stepped is 0, never -0)
  }
});

test('in your coat, your arms are its sleeves and your hat is on; without it, they’re your own furry arms', () => {
  const g = game();
  for (const dir of DIRS){
    const dressed = pose(g, 'sweep', dir, 0, DRESSED), bare = pose(g, 'sweep', dir, 0, BARE);
    assert.ok(cells(dressed.rows, 'K').length >= 2 && cells(dressed.rows, 'C').length >= 10 && cells(dressed.rows, 'a').length >= 10, `${dir}: sleeves, coat and hat`);
    assert.equal(cells(bare.rows, 'KCa').length, 0, `${dir}: none of them`);
  }
  // and what you wear in the game: your coat, your hat, a headband
  const w = loadGame({dom: true, save: {version: 34, started: true, area: 2, areas: {1: {chapter: 1, raft: 3, done: true}, 2: {landed: 1, dressed: 2}},
    wardrobe: {owned: ['衣服', '帽子'], wearing: ['衣服', '帽子']}}});
  const worn = get(w, "POSES.grid('dip', 'down', 'out').rows");
  assert.ok(cells(worn, 'C').length && cells(worn, 'a').length, 'your coat and hat, from what you wear');
});

test('the bucket goes into the water you face, as you step up to it, and comes back with you at your side', () => {
  const g = game();
  const inFront = {down: ([x, y]) => y >= 32, up: ([x, y]) => y < 16, right: ([x, y]) => x >= 32, left: ([x, y]) => x < 16};
  const toward = {down: [0, 1], up: [0, -1], right: [1, 0], left: [-1, 0]};
  for (const dir of DIRS){
    for (const m of ['out', 'in', 'full']){
      const p = pose(g, 'dip', dir, m, DRESSED);
      assert.ok(inFront[dir](p.bucket), `${dir} ${m}: over the water you face (${p.bucket})`);
      assert.ok(p.step[0] * toward[dir][0] + p.step[1] * toward[dir][1] > 0, `${dir} ${m}: stepped up to it`);
    }
    const back = pose(g, 'dip', dir, 'back', DRESSED);
    assert.deepEqual(back.step, [0, 0], `${dir}: back on your square`);
    assert.ok(!inFront[dir](back.bucket), `${dir}: the bucket with you`);
    assert.ok(cells(pose(g, 'dip', dir, 'full', DRESSED).rows, 'z').length >= 3, `${dir}: full of water`);
    assert.ok(cells(pose(g, 'dip', dir, 'in', DRESSED).rows, 'pi').length < cells(pose(g, 'dip', dir, 'out', DRESSED).rows, 'pi').length, `${dir}: down in the water`);
  }
});

test('picking from a tree: up on tiptoe for it, then what you’ve picked held up, your paw over your head', () => {
  const g = game();
  for (const dir of DIRS){
    const hold = pose(g, 'reach', dir, 'hold', BARE);
    assert.ok(hold.paw[1] - 16 <= 3, `${dir}: your paw up by your head (${hold.paw})`);
  }
  // up into the tree in front of you: above your square when it's behind it, or beyond your square and up by your head's
  // top beside it
  const intoIt = {up: ([x, y]) => y < 16, right: ([x, y]) => x >= 32 && y <= 17, left: ([x, y]) => x <= 15 && y <= 17};
  for (const dir of ['up', 'left', 'right']){
    const reach = pose(g, 'reach', dir, 'reach', BARE), stand = pose(g, 'reach', dir, 'hold', BARE);
    const top = rows => cells(rows, 'fo').reduce((a, [, y]) => Math.min(a, y), 48);
    assert.ok(intoIt[dir](reach.paw), `${dir}: reaching up into its leaves (${reach.paw})`);
    assert.ok(reach.paw[1] < stand.paw[1], `${dir}: higher than when you hold it`);
    assert.ok(top(reach.rows) <= top(stand.rows), `${dir}: on tiptoe`);
  }
});
