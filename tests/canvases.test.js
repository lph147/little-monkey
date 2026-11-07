// The map never comes up blank on a phone (decided 7 November 2026, after playing it: back home in autumn, the map was
// black after reloading, the falling leaves smearing over it). Each big object's picture for the season was drawn on a
// canvas of its own, thousands of canvases in a pine wood, more than a phone will make for a page; now they share one,
// every picture exactly as it was. And if a phone wipes the map's layers anyway, they're drawn again. And no freezing as
// you walk in (decided the same day, after playing it: the pine wood still froze): in a season, nothing is fetched back
// from the graphics chip, the canvas the pictures share is made each one's size, and each layer is handed over whole.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');
const {pixelCanvas} = require('./pixel-canvas');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const HOME = {version: 37, started: true, area: 2, areas: {2: {chapter: 2, home2: 1}}, pos: {place: 'ffmMeadow', x: 8, y: 6, dir: 'up'}};
const AREA1 = {version: 37, started: true, pos: {place: 'meadow', x: 8, y: 6, dir: 'up'}};
function game(save, made = {n: 0}){
  const g = loadGame({dom: true, save, canvas: () => { made.n++; return pixelCanvas(); }});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  return g;
}
const visitAll = (g, homeOnly) => g.run(`(() => { for (const id of Object.keys(PLACES).filter(id => PLACES[id].map && (${!homeOnly} || PLACES[id].borrowed))) enterPlace(id); })()`);

test('going round every place at home in autumn makes no more canvases than going round Area 1 in summer', () => {
  const home = {n: 0}, one = {n: 0};
  const h = game(HOME, home), atLoadHome = home.n;
  visitAll(h, true);
  const a = game(AREA1, one), atLoadOne = one.n;
  visitAll(a, false);
  assert.ok(home.n - atLoadHome <= (one.n - atLoadOne) + 20, `home in autumn: ${home.n - atLoadHome} canvases for every place, Area 1: ${one.n - atLoadOne}`);
  assert.ok(home.n < 300, `and few in all (${home.n}), not thousands`);
});

// How a big object's picture for the season was drawn before (version 431), on a canvas of its own, to compare with.
const BEFORE = `globalThis.oldSeasonObject = function(p, under){
  const kind = OBJECT_KIND[p.look] || 'thing', rule = (OBJECT_RULES[drawSeason] || {})[kind];
  const c = document.createElement('canvas'); c.width = p.pw; c.height = p.ph;
  const g = c.getContext('2d'); g.translate(-p.x0, -p.y0);
  shadows = under; OBJECT_ART[p.look](g, p); shadows = true;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (kind === 'own') return c;
  if (rule) recolourBox(g, [0, 0, p.pw, p.ph], rule, drawSeason + ':' + kind, p.x0, p.y0);
  if (drawSeason === 'winter'){
    if (rule && rule.layers) snowOnLayers(g, p.pw, p.ph);
    if (rule && rule.roof) snowOnRoof(g, p);
    snowCaps(g, p.pw, p.ph);
  }
  return c;
};`;
const SAME = places => `(() => {
  let n = 0; const bad = [];
  for (const id of ${JSON.stringify(places)}){
    enterPlace(id); buildMap();
    for (const p of OBJECT_PIECES) for (const under of [true, false]){
      n++;
      const was = oldSeasonObject(p, under).pixels, now = seasonObject(p, under).getContext('2d').getImageData(0, 0, p.pw, p.ph).data;
      if (was.length !== now.length || was.some((v, i) => v !== now[i])) bad.push(id + ' ' + p.look + ' at ' + p.x0 / T + ',' + p.y0 / T);
    }
  }
  return {n, bad: bad.slice(0, 10), season: drawSeason};
})()`;

test('each big object’s picture for the season, on the canvas they share, is exactly as it was on a canvas of its own: home in autumn, the master’s spring and winter', () => {
  for (const [save, places, season] of [
    [HOME, ['ffmMeadow', 'ffmHomeGround', 'ffmPineWood', 'ffmCliffs', 'ffmFlowerValley'], 'autumn'],
    [{...HOME, areas: {2: {chapter: 1, season: 0, teacher: 1}}, pos: {place: 'cave', x: 4, y: 4, dir: 'down'}}, ['cave', 'mountainFoot'], 'spring'],
    [{...HOME, areas: {2: {chapter: 1, season: 3, teacher: 1}}, pos: {place: 'cave', x: 4, y: 4, dir: 'down'}}, ['cave', 'village'], 'winter']
  ]){
    const g = game(save);
    g.run(BEFORE);
    const known = get(g, `${JSON.stringify(places)}.filter(id => PLACES[id])`);
    const out = get(g, SAME(known));
    assert.equal(out.season, season, `in ${season}`);
    assert.deepEqual(out.bad, [], `${season}: every picture the same`);
    assert.ok(out.n > 50, `${season}: plenty of pictures compared (${out.n})`);
  }
});

test('if a phone wipes the map, it’s drawn again as you come back to the game; and a frame never smears', () => {
  const g = game(HOME);
  const opaque = () => g.run('mg.getImageData(pl.x*T + 8, pl.y*T + 8, 1, 1).data[3]');
  assert.equal(opaque(), 255, 'the square you’re on, drawn');
  g.run('redrawIfWiped()');
  assert.equal(opaque(), 255, 'still there, so nothing to do');
  g.run('mapCanvas.width = mapCanvas.width');   // (wiped, as a phone might)
  assert.equal(opaque(), 0, 'wiped');
  g.run('redrawIfWiped()');   // (as you come back to the game: visibilitychange, pageshow)
  assert.equal(opaque(), 255, 'drawn again');
  // a frame starts by clearing the screen, so if anything were ever see-through, nothing from the frame before shows
  const first = get(g, `(() => { const seen = []; const fr = b.fillRect; b.fillRect = function(...a){ seen.push([String(b.fillStyle), ...a]); return fr.apply(this, a); }; drawWorld(performance.now()); b.fillRect = fr; return seen[0]; })()`);
  assert.deepEqual(first, ['#1E2B26', 0, 0, 240, 160], 'the first thing each frame draws');
});

test('the pine wood’s hundreds of pines are coloured for the season once for each of their eight looks, then copied, so it opens as quickly as in summer', () => {
  const g = game(HOME);
  const out = get(g, `(() => {
    let coloured = 0; const was = recolourBox;
    recolourBox = function(...a){ if (a[3] === drawSeason + ':evergreen') coloured++; return was.apply(this, a); };
    try { enterPlace('ffmPineWood'); buildMap(); } finally { recolourBox = was; }
    return {coloured, pines: OBJECT_PIECES.filter(p => p.look === 'pine').length, season: drawSeason};
  })()`);
  assert.equal(out.season, 'autumn');
  assert.ok(out.pines > 600, `plenty of pines (${out.pines})`);
  assert.ok(out.coloured <= 16, `coloured just ${out.coloured} times (eight looks, with and without their shadows), not once for each`);
});

// A canvas that keeps its pixels and notes what's done to it (LOG: the canvas, what, what was drawn and with what, and the
// canvas's size then), and whether it was made to be kept in memory (kept: willReadFrequently).
const LOG = [];
function noting(){
  const c = pixelCanvas(), inner = c.getContext('2d');
  const ctx = new Proxy(inner, {
    get: (t, k) => ['getImageData', 'drawImage', 'fillRect'].includes(k) ? (...a) => { LOG.push({c, op: k, src: a[0], a, w: c.width, h: c.height}); return t[k](...a); } : t[k],
    set: (t, k, v) => { t[k] = v; return true; }
  });
  c.getContext = (type, opts) => { if (opts && opts.willReadFrequently) c.kept = true; return ctx; };
  return c;
}
const WINTER = {...HOME, areas: {2: {chapter: 1, season: 3, teacher: 1}}, pos: {place: 'cave', x: 4, y: 4, dir: 'down'}};

test('in a season, nothing is fetched back from the graphics chip as a place is drawn: every canvas read, and every one drawn onto one, is kept in memory; the canvas the pictures share is just each one’s size; and each layer is handed over whole', () => {
  for (const [save, places, season] of [[HOME, ['ffmHillside', 'ffmPineWood'], 'autumn'], [WINTER, ['village', 'town'], 'winter']]){
    const g = loadGame({dom: true, save, canvas: noting});
    g.run("mode = 'play'; save = () => {}; placePlayer()");
    const layers = g.run('[mapCanvas, baseCanvas, topCanvas]'), piece = g.run('pieceCanvas');
    for (const id of places){
      g.run('seasonCopies.clear()');   // (so the pines are coloured here, from their pictures)
      LOG.length = 0;
      g.run(`enterPlace(${JSON.stringify(id)})`);
      assert.equal(g.run('drawSeason'), season, `${id} in ${season}`);
      const reads = LOG.filter(e => e.op === 'getImageData');
      assert.ok(reads.length > 50, `${id}: plenty read back (${reads.length})`);
      assert.deepEqual(reads.filter(e => !e.c.kept).map(e => e.w + 'x' + e.h), [], `${id}: every canvas read back is kept in memory`);
      const onto = LOG.filter(e => e.op === 'drawImage' && e.c.kept && e.src && e.src.pixels);
      assert.deepEqual(onto.filter(e => !e.src.kept).map(e => e.src.width + 'x' + e.src.height), [], `${id}: nothing drawn onto a canvas in memory from one on the graphics chip`);
      const pieceReads = reads.filter(e => e.c === piece);
      assert.ok(pieceReads.length > 10 && pieceReads.every(e => e.a[0] === 0 && e.a[2] === e.w), `${id}: the pictures’ canvas just as wide as each picture`);
      ['map', 'base', 'top'].forEach((name, k) => {
        const ops = LOG.filter(e => e.c === layers[k]);
        assert.equal(ops.filter(e => e.op === 'fillRect').length, 0, `${id}: nothing drawn straight onto the ${name} layer`);
        assert.equal(ops.filter(e => e.op === 'drawImage').length, 1, `${id}: the ${name} layer handed over whole, once`);
      });
    }
  }
  // and in summer, as ever: straight onto the layers, nothing read back
  const one = loadGame({dom: true, save: AREA1, canvas: noting});
  one.run("mode = 'play'; save = () => {}; placePlayer()");
  LOG.length = 0;
  one.run("enterPlace('hillside')");
  const map = one.run('mapCanvas');
  assert.equal(LOG.filter(e => e.op === 'getImageData').length, 0, 'summer: nothing read back');
  assert.ok(LOG.filter(e => e.c === map && e.op === 'fillRect').length > 1000, 'summer: the squares drawn straight onto the map');
});

test('in a season, the map’s layers drawn in memory first and handed over are exactly as drawn straight onto them: home in autumn and the master’s winter', () => {
  for (const [save, id] of [[HOME, 'ffmHillside'], [HOME, 'ffmPineWood'], [WINTER, 'village']]){
    const g = loadGame({dom: true, save, canvas: pixelCanvas});
    g.run("mode = 'play'; save = () => {}; placePlayer()");
    const out = get(g, `(() => {
      enterPlace(${JSON.stringify(id)});
      const inMemory = [mapCanvas, baseCanvas, topCanvas].map(c => c.pixels.slice()), season = drawSeason;
      const was = staged; staged = () => null;   // (straight onto the layers, as in summer)
      try { buildMap(); } finally { staged = was; }
      return {season, same: [mapCanvas, baseCanvas, topCanvas].map((c, k) => c.pixels.length === inMemory[k].length && c.pixels.every((v, i) => v === inMemory[k][i]))};
    })()`);
    assert.ok(out.season, `${id} in a season`);
    assert.deepEqual(out.same, [true, true, true], `${id}: the ground, the objects’ bottoms and their tops, every pixel the same`);
  }
});

test('in a season, a square the story changes (a heap of leaves swept up in the cave in autumn) is drawn again on its own just as the whole map drawn again', () => {
  const g = loadGame({dom: true, save: {...HOME, areas: {2: {chapter: 1, season: 2, teacher: 1}}, pos: {place: 'cave', x: 4, y: 4, dir: 'down'}}, canvas: pixelCanvas});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  const out = get(g, `(() => {
    buildMap();
    let at = null; for (let y = 0; y < ROWS && !at; y++) for (let x = 0; x < COLS && !at; x++) if (MAP[y][x] === 'l') at = [x, y];
    here().changed[squareKey(...at)] = '#';
    const patched = patchMap(), after = [mapCanvas, baseCanvas, topCanvas].map(c => c.pixels.slice());
    buildMap();
    return {season: drawSeason, patched, same: [mapCanvas, baseCanvas, topCanvas].map((c, k) => c.pixels.every((v, i) => v === after[k][i]))};
  })()`);
  assert.equal(out.season, 'autumn');
  assert.ok(out.patched, 'just the squares round it drawn again');
  assert.deepEqual(out.same, [true, true, true], 'every pixel as the whole map drawn again');
});
