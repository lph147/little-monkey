// Fixes from playtesting chapter 1 (28 October 2026): the dark pines have the pine wood's music, no character stands where
// a pine's top hides it (the rabbit in its nook by the way through the dark pines), a battle's health bars are drawn to one
// scale, and once the cow is home, a hint says the big monkey has an idea for the feast (the garden).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');
const {pixelCanvas} = require('./pixel-canvas');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));

test('the dark pines have the pine wood’s music', () => {
  const g = loadGame();
  assert.deepEqual(get(g, "[PLACES.darkPines.music, PLACES.pineWood.music]"), ['pineWood', 'pineWood']);
});

test('no character stands on a square a pine’s top hides (the one above a pine)', () => {
  const g = loadGame();
  const hidden = get(g, `ALL_NPCS.filter(n => !n.flies && PLACES[n.place]).filter(n => {
    const row = PLACES[n.place].map[n.y + 1], legend = {...AREA.legend, ...(PLACES[n.place].legend || {})};
    return row && legend[row[n.x]] && legend[row[n.x]].look === 'pine';
  }).map(n => n.id)`);
  assert.deepEqual(hidden, [], 'these stand just above a pine, so its top hides them');
});

test('in a battle, both health bars are drawn to one scale: a snake’s (20) less than half as long as yours (50)', () => {
  const g = loadGame();
  const k = html => Number(/--hpk:([\d.]+)/.exec(html)[1]);
  assert.equal(k(g.run('healthHTML(20, 20)')), 0.4, 'a snake');
  assert.equal(k(g.run('healthHTML(50, 50)')), 1, 'you, or a bear');
  assert.equal(k(g.run('healthHTML(10, 50)')), 1, 'how long the bar is depends on the most you can have, not what you have now');
});

test('crawling through the hollow pine in the dark pines: it shakes with each step you take inside it, crumbs of bark fall, and you hear yourself scuffling', () => {
  const g = loadGame({dom: true, save: {version: 30, started: true, areas: {1: {chapter: 1, cow: 1}}, pos: {place: 'darkPines', x: 28, y: 7, dir: 'down'}}});
  g.run("mode = 'play'; globalThis.__sfx = []; SFX.scuffle = () => __sfx.push('scuffle'); placePlayer()");
  const log = get(g, "OBJECT_PIECES.filter(p => p.crawl).map(p => [p.look, p.x, p.y, p.w, p.h, !!p.top, !!p.baked])");
  assert.deepEqual(log, [['hollowLog', 27, 8, 3, 4, true, false]], 'its own pictures, drawn each moment (so it can shake), not baked into the map');
  g.run('pl.mv = {fx: 28, fy: 7, tx: 28, ty: 8, t0: performance.now() - STEP * .5, dur: STEP}; crawlThrough(performance.now())');
  assert.deepEqual(get(g, '__sfx'), ['scuffle'], 'in at its far end');
  assert.ok(get(g, 'performance.now() - OBJECT_PIECES.find(p => p.crawl).rustle') < 100, 'it shakes');
  assert.equal(get(g, 'fallingLeaves.filter(f => f.bark).length'), 2, 'a crumb of bark off each side');
  g.run('crawlThrough(performance.now())');
  assert.deepEqual(get(g, '__sfx'), ['scuffle'], 'once a step');
  g.run('pl.mv = {fx: 26, fy: 4, tx: 27, ty: 4, t0: performance.now() - STEP * .5, dur: STEP}; crawlThrough(performance.now())');
  assert.deepEqual(get(g, '__sfx'), ['scuffle'], 'walking anywhere else: nothing');
});

test('crawling through the hollow pine, its top opens over you, so you see yourself in there, in its shade, and come out of the hole in its near end; it closes again once you’re out (8 November 2026: drawn over you, it looked as if you walked under it, not through it)', () => {
  const g = loadGame({dom: true, canvas: pixelCanvas, save: {version: 30, started: true, areas: {1: {chapter: 1, cow: 3}}, pos: {place: 'darkPines', x: 28, y: 9, dir: 'down'}}});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  const out = get(g, `(() => {
    const log = OBJECT_PIECES.find(p => p.crawl), res = {};
    // the screen over your square, a frame drawn with you and without you: different where you can be seen
    const yours = () => { const X = Math.round(pl.px - camX()), Y = Math.round(pl.py - camY()), W = VW*T, d = buf.pixels, px = [];
      for (let y = Y; y < Y + 16; y++) for (let x = X; x < X + 16; x++){ const i = (y*W + x)*4; px.push(d[i], d[i + 1], d[i + 2]); }
      return px; };
    const frame = (now, you = true) => { const m = drawEntityMonkey; if (!you) drawEntityMonkey = () => {}; try { drawWorld(now); } finally { drawEntityMonkey = m; } return yours(); };
    const seen = now => { const a = frame(now), b2 = frame(now, false); return a.filter((v, i) => v !== b2[i]).length; };
    frame(1000); res.first = log.open;   // (just starting to open)
    for (let t = 1016; t <= 1400; t += 16) frame(t);
    res.open = log.open;
    res.seen = seen(1400);
    // at its near end, in the hole you crawl out of
    pl.y = 11; pl.py = 11*T; for (let t = 1416; t <= 1500; t += 16) frame(t);
    res.inHole = seen(1500);
    // shut (as it always was): you can't be seen in it
    log.open = 0; log.openT = 1600; pl.y = 9; pl.py = 9*T;
    res.shut = seen(1600);
    // out of it: it closes again, the log whole
    pl.y = 13; pl.py = 13*T; log.open = 1; log.openT = 1700;
    for (let t = 1716; t <= 2000; t += 16) frame(t);
    res.closed = log.open;
    return res;
  })()`);
  assert.ok(out.first < .2, `it opens quickly, not all at once (${out.first})`);
  assert.equal(out.open, 1, 'open while you’re in it');
  assert.ok(out.seen > 60, `you can see yourself in there (${out.seen} values of your square differ with you and without)`);
  assert.ok(out.inHole > 20, `and in the hole in its near end (${out.inHole})`);
  assert.equal(out.shut, 0, 'shut, as it always was, you’re hidden');
  assert.equal(out.closed, 0, 'once you’re out, it closes again');
});

test('the hollow pine’s opening runs down its middle, from the hollow at its far end to the rim of its near end, as wide as you and more; its inside darkest at the far end; the log drawn exactly as it was', () => {
  const g = loadGame({dom: true, canvas: pixelCanvas});
  const out = get(g, `(() => {
    const L = logShape(0, 0, 48, 64), {cols, hole} = logOpening(L), rim = logDisc(L, L.rx, L.ry);
    return {L, n: cols.length, x0: cols[0][0], x1: cols.at(-1)[0], tops: [...new Set(cols.map(c => c[1]))], ends: cols.map(c => c[2]),
      rimTop: L.ny - L.ry, holeRows: hole.length, holeTop: hole[0][1], holeWide: Math.max(...hole.map(h => h[2]))};
  })()`);
  assert.equal(out.n, 22, 'as wide as you (16 pixels) and more');
  assert.equal(out.x0 + out.x1 + 1, 2 * out.L.cx, 'down its middle');
  assert.deepEqual(out.tops, [out.L.fy - 1], 'from the hollow at its far end');
  assert.ok(out.ends.every(y => y >= out.rimTop && y <= out.rimTop + 2), `to the rim of its near end (${out.ends})`);
  assert.equal(out.holeRows, 9, 'and the hollow in its near end');
  assert.ok(out.holeTop > Math.max(...out.ends), 'below the rim, which stays over you');
  assert.equal(out.holeWide, 30, 'as wide as the hollow drawn there');
});
