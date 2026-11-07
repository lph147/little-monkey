// Home in autumn (Area 2's chapter 2, Flower Fruit Mountain's places borrowed in their own season), with nothing green
// left at the edges (decided 7 November 2026, after playing it: the grass at the cliffs' lips and feet, the tufts on the
// rock, the corners of the steps and the cliffs' shadows were still summer's green on the golden grass), and the views
// from the lookouts in the season too (they were summer's). Only the evergreen woods stay green (the pines and the moss
// under them), with the crops (melons, grapes), the hot spring's jade water and the leaf beds in the Water Curtain Cave.
// The master's year and Area 1 look as they did.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');
const {pixelCanvas} = require('./pixel-canvas');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const HOME = {version: 37, started: true, area: 2, areas: {2: {chapter: 2, home2: 1}}, pos: {place: 'ffmMeadow', x: 8, y: 6, dir: 'up'}};
const YEAR_AUTUMN = {version: 37, started: true, area: 2, areas: {2: {chapter: 1, season: 2, teacher: 1}}, pos: {place: 'cave', x: 4, y: 4, dir: 'down'}};
const AREA1 = {version: 37, started: true, pos: {place: 'meadow', x: 8, y: 6, dir: 'up'}};
function game(save, pixels = false){
  const g = loadGame({dom: true, save, ...(pixels ? {canvas: pixelCanvas} : {})});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  return g;
}
// How many pixels of each square of the map just drawn are green (js/seasons.js's greenish), by the square's look:
// {look: [green, all]}; and the squares beside a wild grape vine (it hangs over them) on their own.
const GREEN_BY_LOOK = `(() => {
  const W = COLS*T, d = mapCanvas.pixels, by = {}, grapes = (x, y) => [-1, 0, 1].some(dx => [-1, 0, 1].some(dy => tileAt(x + dx, y + dy).look === 'grapeCliff'));
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){
    let green = 0;
    for (let py = y*T; py < y*T + T; py++) for (let px = x*T; px < x*T + T; px++){
      const i = (py*W + px)*4; if (d[i + 3] < 8) continue;
      const [h, s] = toHsl(d[i], d[i + 1], d[i + 2]); if (greenish(h, s)) green++;
    }
    const look = grapes(x, y) && tileAt(x, y).look !== 'grapeCliff' ? 'besideGrapes' : tileAt(x, y).look;
    (by[look] = by[look] || [0, 0])[0] += green; by[look][1]++;
  }
  return by;
})()`;
const EVERGREEN = ['pine', 'needles', 'archPost', 'mushrooms', 'deadPine', 'hollowLog', 'stump', 'crackedRock', 'pebble', 'boulder', 'water'];   // (the pine woods' floor, and what stands on it)
const PINE_WOODS = ['ffmHillside', 'ffmSouthSlope', 'ffmDarkPines', 'ffmPasture', 'ffmPineWood'];
const GREEN_ANYWAY = ['melon', 'gardenMelon', 'grapeCliff', 'besideGrapes', 'hotPool', 'stoneBed', 'stoneTable'];   // (melons, grapes, jade water, the cave's leaf beds)

test('home in autumn: nothing green left on the ground but the pine woods, the crops, the hot spring and the cave’s leaf beds: not the grass at a cliff’s lip and foot, a tuft on the rock, the steps’ corners, a bank, the lookout’s stone or a shadow', () => {
  const g = game(HOME, true);
  const places = get(g, 'Object.keys(PLACES).filter(id => PLACES[id].borrowed)');
  assert.ok(places.length >= 15, `Flower Fruit Mountain's places, borrowed (${places.length})`);
  const bad = [], seen = {};
  for (const id of places){
    g.run(`enterPlace(${JSON.stringify(id)}); buildMap()`);
    assert.equal(g.run('drawSeason'), 'autumn', `${id} is in autumn`);
    for (const [look, [green, n]] of Object.entries(get(g, GREEN_BY_LOOK))){
      seen[look] = (seen[look] || 0) + n;
      if (green && !GREEN_ANYWAY.includes(look) && !(PINE_WOODS.includes(id) && EVERGREEN.includes(look))) bad.push(`${id}: ${look} (${green} green pixels)`);
    }
  }
  assert.deepEqual(bad, [], 'no green on any of them');
  for (const look of ['cliffFace', 'heights', 'steps', 'bank', 'slabs', 'grass', 'path', 'longGrass']) assert.ok(seen[look] > 0, `and they have ${look}`);
  assert.ok(seen.cliffFace > 300 && seen.heights > 300, `plenty of cliffs (${seen.cliffFace} squares) and rock (${seen.heights})`);
});

test('the master’s year and Area 1 look as they did: the moss on the cave’s rock green in its autumn, and Area 1’s cliffs a summer’s green', () => {
  const y = game(YEAR_AUTUMN, true);
  y.run('buildMap()');
  assert.equal(y.run('drawSeason'), 'autumn');
  const year = get(y, GREEN_BY_LOOK);
  assert.ok(year.karstTop[0] > 500 && year.karstFace[0] > 50, 'the moss on the rock, as it was');
  assert.equal(year.mossStone[0], 0, 'its grass gold, as it was');
  const one = game(AREA1, true);
  one.run("enterPlace('meadow'); buildMap()");
  assert.equal(one.run('drawSeason'), null, 'Area 1: no season');
  const meadow = get(one, GREEN_BY_LOOK);
  assert.ok(meadow.cliffFace[0] > 300 && meadow.heights[0] > 50 && meadow.grass[0] === meadow.grass[1] * 256, 'its cliffs’ grass, the tufts on the rock and the grass all green');
  // and the rules: home's only at home
  const rules = g => get(g, `['face', 'rockTop', 'plant', 'swept', 'green'].map(k => { const r = groundRule(k); return !r ? null : Object.entries(HOME_RULES.autumn).find(([, v]) => v === r) ? 'home' : 'season'; })`);
  assert.deepEqual(rules(y), [null, null, null, 'season', 'season'], 'the master’s year: its own season’s rules');
  const h = game(HOME);
  h.run('drawSeason = seasonLook()');
  assert.deepEqual(rules(h), ['home', 'home', 'home', 'home', 'season'], 'home: home’s');
});

test('home in autumn: a square of long grass you walk through is exactly as the map draws it, leaves and all', () => {
  const g = game(HOME, true);
  const out = get(g, `(() => {
    let n = 0; const bad = [];
    for (const id of ['ffmMeadow', 'ffmHillside', 'ffmSouthSlope', 'ffmPath']){
      enterPlace(id); buildMap(); stirGrass(0);
      const W = COLS*T, map = mapCanvas.pixels;
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){
        if (!grassy(x, y)) continue;
        n++;
        const s = {side: false, pal: STIR_LOOKS[tileAt(x, y).look]};
        drawStirred(s, x, y, 0);
        const pic = s.pic.pixels;
        let same = true;
        for (let py = 0; py < T && same; py++) for (let px = 0; px < T * 4 && same; px++) same = pic[py * T * 4 + px] === map[((y*T + py) * W + x*T) * 4 + px];
        if (!same) bad.push(id + ' ' + x + ',' + y);
      }
    }
    return {n, bad};
  })()`);
  assert.deepEqual(out.bad, [], 'every square the same');
  assert.ok(out.n > 100, `plenty of long grass (${out.n} squares)`);
});

test('the views from the lookouts in the season: summer’s as drawn in Area 1; at home in autumn, golden slopes and pasture, red and gold trees, leaves falling, and nothing green but the dark pines', () => {
  // the colours each view fills with, the first time and a moment later (as the leaves fall)
  const colours = (g, draw) => get(g, `(() => { const seen = new Set(), fr = b.fillRect; b.fillRect = function(){ seen.add(String(b.fillStyle).toUpperCase()); };
    try { for (const now of [1000, 4000]) ${draw}; } finally { b.fillRect = fr; } return [...seen]; })()`);
  const green = (g, cols) => cols.filter(c => { const n = parseInt(c.slice(1, 7), 16); return g.run(`greenish(...toHsl(${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}).slice(0, 2))`); });
  const one = game(AREA1);
  const summer = [...colours(one, 'drawLookout(2, now)'), ...colours(one, 'drawCowView(2, now, {home: true})')];
  for (const c of ['#4F9A55', '#468F4D', '#2F7A3E', '#6FA889', '#7FC46A', '#3F8A44', '#1F4A35']) assert.ok(summer.includes(c), `summer: ${c}, as it was`);
  assert.ok(!summer.some(c => ['#E08A3A', '#C8502A', '#F0C050'].includes(c)), 'and no leaves falling');
  const home = game({...HOME, pos: {place: 'ffmHillside', x: 22, y: 21, dir: 'up'}});
  assert.equal(home.run('seasonNow()'), 'autumn');
  const lookout = colours(home, 'drawLookout(2, now)'), south = colours(home, 'drawCowView(2, now, {home: true})');
  assert.deepEqual(green(home, lookout), [], 'the hillside’s view: nothing green');
  assert.deepEqual(green(home, south).sort(), get(home, 'VIEW_SEASONS.autumn.pines').sort(), 'the south slope’s: only the dark pines, evergreen');
  for (const cols of [lookout, south]){
    assert.ok(cols.includes('#C8502A') && cols.includes('#F0C050'), 'red and gold: the trees, and leaves falling');
    assert.ok(cols.includes('#C0913E') && cols.includes('#AE8236'), 'golden slopes');
  }
  assert.ok(south.includes('#D6B666'), 'a golden pasture');
});
