// The map never comes up blank on a phone (decided 7 November 2026, after playing it: back home in autumn, the map was
// black after reloading, the falling leaves smearing over it). Each big object's picture for the season was drawn on a
// canvas of its own, thousands of canvases in a pine wood, more than a phone will make for a page; now they share one,
// every picture exactly as it was. And if a phone wipes the map's layers anyway, they're drawn again.
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
