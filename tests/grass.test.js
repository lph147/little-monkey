// The tall and long grass (decided 6 November 2026, after playing it: players didn't like the art proposal's long grass,
// clumps with foxtails, there for a day, and missed the old; and liked it moving as you walk through it, a little gentler
// than in the mock-up). The old little tufts are back, the same pixels as before. Walked through, the square you step into
// parts round you, the squares beside you lean away, the tufts you push aside catch the light, a few bits of grass fly
// up, and once you've gone, it stays flattened a moment, then springs back. Only the squares near you, each drawn just as
// the map has it, the top edge of a cliff below it and all.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

// The tall grass as it was drawn before the art proposal (version 401), to compare with.
const BEFORE = `
globalThis.oldTall = function(g, X, Y, x, y, [ground, blade, tip] = TALL){
  R(g, X, Y, T, T, ground);
  const tuft = (ox, oy) => {
    [[0,3],[1,2],[2,3],[3,1],[4,3],[5,2],[6,3]].forEach(([a,c]) => R(g, X+ox+a, Y+oy+c, 1, 1, blade));
    [[1,1],[3,0],[5,1]].forEach(([a,c]) => R(g, X+ox+a, Y+oy+c, 1, 1, tip));
    R(g, X+ox, Y+oy+4, 7, 1, blade);
  };
  tuft(0,1); tuft(8,0); tuft(4,6); tuft(9,9); tuft(0,10);
};`;

// A game, with a pretend canvas that keeps the colour of each pixel it fills, 'x,y' (as tests/quick-drawing.test.js has),
// and new canvases made of the same, so a stirred square's own little canvas can be looked at.
const AREA1 = {version: 34, started: true};
const AREA2 = {version: 34, started: true, area: 2, shells: 12, areas: {1: {chapter: 1, raft: 3, done: true}, 2: {landed: 1, dressed: 2}}};
function game(save = AREA1){
  const g = loadGame({dom: true, save});
  g.run("mode = 'play'; save = () => {}; buildMap = () => {}");
  g.run(BEFORE);
  g.run(`globalThis.__ctx = px => ({fillStyle: '', strokeStyle: '', globalAlpha: 1, lineWidth: 1,
      fillRect(x, y, w, h){ for (let a = x; a < x + w; a++) for (let b = y; b < y + h; b++) px.set(a + ',' + b, this.fillStyle); },
      drawImage(pic, dx, dy){ for (const [k, v] of pic.px){ const [a, b] = k.split(',').map(Number); px.set((a + dx) + ',' + (b + dy), v); } },
      save(){}, restore(){}, beginPath(){}, rect(){}, clip(){}, translate(){}, scale(){}, moveTo(){}, lineTo(){}, closePath(){},
      arc(){}, ellipse(){}, fill(){}, stroke(){}, fillText(){}, clearRect(){}});
    globalThis.__pixels = draw => { const px = new Map(); draw(__ctx(px)); return px; };
    globalThis.__same = (p, q) => p.size === q.size && [...p].every(([k, v]) => q.get(k) === v);
    globalThis.__square = px => new Map([...px].filter(([k]) => { const [a, b] = k.split(',').map(Number); return a >= 0 && a < T && b >= 0 && b < T; }));
    { const make = document.createElement; document.createElement = tag => tag === 'canvas' ? (c => (c.getContext = () => __ctx(c.px), c))({width: 0, height: 0, px: new Map()}) : make(tag); }`);
  return g;
}
const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
// A square of the meadow's tall grass with tall grass either side of it, and you on the open ground just above it, facing
// down: walking down into it, as long a way through it as the meadow has.
const INTO = `(() => {
  enterPlace('meadow');
  let best = null;
  for (let y = 1; y < ROWS - 2; y++) for (let x = 1; x < COLS - 1; x++)
    if (grassy(x, y) && grassy(x - 1, y) && grassy(x + 1, y) && tileAt(x, y - 1).walk && !grassy(x, y - 1)){
      let run = 1; while (grassy(x, y + run)) run++;
      if (!best || run > best[2]) best = [x, y, run];
    }
  const [x, y] = best;
  pl.x = x; pl.y = y - 1; pl.px = x*T; pl.py = (y - 1)*T; pl.dir = 'down';
  return [x, y];
})()`;

test('the tall grass is back as it was: five little tufts to a square, the same pixels as before the art proposal', () => {
  const g = game();
  const out = get(g, `(() => {
    let n = 0, bad = 0;
    for (const pal of [TALL, LONG, WOOD_TALL, ['#4C9A48', '#22602C', '#7FC86E']]) for (const [x, y] of [[0, 0], [3, 4], [17, 9], [30, 21]]){
      n++;
      if (!__same(__pixels(ctx => tall(ctx, x*T, y*T, x, y, pal)), __pixels(ctx => oldTall(ctx, x*T, y*T, x, y, pal)))) bad++;
    }
    const looks = ['tallGrass', 'longGrass', 'woodGrass'].map(look => __same(__pixels(ctx => LOOKS[look](ctx, 0, 0, 3, 4)), __pixels(ctx => oldTall(ctx, 0, 0, 3, 4, STIR_LOOKS[look]))));
    const px = __pixels(ctx => tall(ctx, 0, 0, 3, 4));
    return {n, bad, looks, inside: __square(px).size === px.size, tips: [...px.values()].filter(c => c === TALL[2]).length, colours: [...new Set(px.values())].sort()};
  })()`);
  assert.equal(out.bad, 0, `every square the same (${out.n} of them, in each grass's colours)`);
  assert.deepEqual(out.looks, [true, true, true], 'the tall grass, the long grass and the pine wood’s, each in its own colours');
  assert.ok(out.inside, 'all inside its own square');
  assert.equal(out.tips, 15, 'five tufts, with three pale tips each');
  assert.deepEqual(out.colours, [...get(g, 'TALL')].sort(), 'and nothing else on it: its ground, its blades and their tips');
});

test('a square of grass drawn on its own, as you walk through it, is exactly as the map draws it, in every place of both areas: a cliff’s top edge over it and all', () => {
  for (const [area, save] of [[1, AREA1], [2, AREA2]]){
    const g = game(save);
    const out = get(g, `(() => {
      let n = 0, reached = 0; const bad = [];
      for (const id of Object.keys(AREA.places)){
        if (!AREA.places[id].map || AREA.places[id].borrow) continue;   // (not those the human world borrows from Flower Fruit Mountain: the same squares)
        enterPlace(id); drawnFor = {place: id}; stirGrass(0);   // (arriving: its map drawn, as buildMap would, so nothing's kept from the last place)
        const map = __pixels(ctx => { for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){ LOOKS[tileAt(x, y).look](ctx, x*T, y*T, x, y); castShadow(ctx, x*T, y*T, x, y); } });   // (as drawTiles draws it)
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){
          if (!grassy(x, y)) continue;
          n++;
          const s = {side: false, pal: STIR_LOOKS[tileAt(x, y).look]};
          drawStirred(s, x, y, 0);
          const pic = __square(s.pic.px);
          let same = pic.size === T*T;
          for (let py = 0; py < T && same; py++) for (let px = 0; px < T && same; px++) same = pic.get(px + ',' + py) === map.get((x*T + px) + ',' + (y*T + py));
          if (!same) bad.push(id + ' ' + x + ',' + y);
          if (__square(overGrass(x, y).px).size) reached++;
        }
      }
      return {n, reached, bad};
    })()`);
    assert.deepEqual(out.bad, [], `area ${area}: every square of grass the same`);
    assert.ok(out.n > (area === 1 ? 500 : 300), `area ${area}: plenty of grass (${out.n} squares)`);
    assert.ok(out.reached >= 20, `area ${area}: including squares with something reaching into them (${out.reached}), such as the edge of a cliff below`);
  }
});

test('walking into tall grass, it parts round you, the squares beside you lean away from you, and the tufts you push aside catch the light', () => {
  const g = game();
  const [x, y] = get(g, INTO);
  const out = get(g, `(() => {
    const t0 = 50000, at = (dx, dy) => stirred.get((${x} + dx) + ',' + (${y} + dy));
    const still = (dx, dy) => __pixels(ctx => { tall(ctx, 0, 0, ${x} + dx, ${y} + dy, TALL); castShadow(ctx, 0, 0, ${x} + dx, ${y} + dy); });
    const lit = mix(TALL[2], '#FFFFFF', STIR_LIT);
    const tips = (px, colour, half) => [...px].filter(([k, c]) => c === colour && half(+k.split(',')[0])).map(([k]) => +k.split(',')[0]);
    const mean = list => list.reduce((a, b) => a + b, 0) / list.length;
    stirGrass(t0);
    const before = stirred.size;
    pl.py += 6; stirGrass(t0 + 10);   // (your feet into the grass)
    const sides = [at(-1, 0), at(1, 0)].map(s => s && [s.side, s.away]);
    stirGrass(t0 + 210);   // (the squares beside you, leaning away as you pass)
    const left = __square(at(-1, 0).pic.px), right = __square(at(1, 0).pic.px);
    stirGrass(t0 + 320);   // (pushed in, past its shake)
    const pic = __square(at(0, 0).pic.px), was = still(0, 0);
    const over = __pixels(ctx => tall(ctx, 0, 0, ${x}, ${y}, TALL, () => 1000)), foot = [[0, 5], [8, 4], [4, 10], [9, 13], [0, 14]];   // (bent right over: only what doesn't move is left)
    const feet = [...over].every(([k, c]) => { const [a, r] = k.split(',').map(Number); return c === (foot.some(([fx, fy]) => r === fy && a >= fx && a < fx + 7) ? TALL[1] : TALL[0]); });
    let most = 0;
    for (const s of [{side: false, dir: 'down'}, {side: false, dir: 'right'}]) for (let px = 0; px < T; px++) most = Math.max(most, Math.abs(stirBend(s, 1 + STIR.wobble)(px)));
    const beside = Math.max(Math.abs(stirBend({side: true, away: 1, dir: 'down'}, STIR.side)(0)), Math.abs(stirBend({side: true, away: 0, dir: 'right'}, STIR.side)(0)));
    return {before, entered: !!at(0, 0) && at(0, 0).out === null, sides, k: at(0, 0).k, bent: !__same(pic, was), feet,
      apart: [mean(tips(pic, lit, a => a < 8)) < mean(tips(was, TALL[2], a => a < 8)), mean(tips(pic, lit, a => a >= 8)) > mean(tips(was, TALL[2], a => a >= 8))],
      lit: tips(pic, lit, () => true).length, unlit: tips(pic, TALL[2], () => true).length,
      away: [mean(tips(left, lit, () => true)) < mean(tips(still(-1, 0), TALL[2], () => true)), mean(tips(right, lit, () => true)) > mean(tips(still(1, 0), TALL[2], () => true))],
      most, beside};
  })()`);
  assert.equal(out.before, 0, 'nothing stirred on the open ground');
  assert.ok(out.entered, 'the square you step into');
  assert.deepEqual(out.sides, [[true, -1], [true, 1]], 'and the squares either side of you, leaning away from you');
  assert.equal(out.k, 1, 'parted wide');
  assert.ok(out.bent, 'its tufts bent');
  assert.ok(out.feet, 'each tuft’s foot where it was, however far it bends');
  assert.deepEqual(out.apart, [true, true], 'its tufts bending away from its middle, to the left on its left and the right on its right');
  assert.ok(out.lit >= 8 && out.unlit === 0, `their tips catching the light (${out.lit})`);
  assert.deepEqual(out.away, [true, true], 'the square on your left leaning left, the one on your right leaning right');
  assert.ok(out.most <= 6.5, `gentle: a tuft’s tip never more than about 5 pixels over, even as it shakes (${out.most.toFixed(2)}; the mock-up’s 6.5 and more)`);
  assert.ok(out.beside <= 2, `and beside you, less (${out.beside.toFixed(2)})`);
});

test('as you push into the grass a few bits of it fly up and fall back; and the grass in front of your legs is parted as the square you’re in is', () => {
  const g = game();
  const [x, y] = get(g, INTO);
  const out = get(g, `(() => {
    const t0 = 50000, rects = [], drawn = [];
    b.fillRect = (...r) => rects.push(r);
    b.drawImage = (pic, ...r) => drawn.push(pic === mapCanvas ? 'map' : pic === stirred.get(${x} + ',' + ${y}).pic ? 'parted' : 'other');
    stirGrass(t0); pl.py += 6; stirGrass(t0 + 10);
    const cx = camX(), cy = camY(), bits = [];
    for (const t of [60, 200, 400]){ rects.length = 0; stirGrass(t0 + 10 + t); drawGrassBits(cx, cy, t0 + 10 + t); bits.push(rects.map(r => r.slice()));}
    rects.length = 0; stirGrass(t0 + 10 + STIR.bits + 20); drawGrassBits(cx, cy, t0 + 10 + STIR.bits + 20); const after = rects.length;
    pl.py = ${y} * T; stirGrass(t0 + 700);   // (standing in it)
    for (const [fx, fy, w, h] of feetInGrass()) coverFeet(fx, fy, w, h, cx, cy);
    const feet = drawn.slice();
    drawn.length = 0; b.drawImage = pic => drawn.push(pic === mapCanvas ? 'map' : pic === baseCanvas ? 'objects' : pic === stirred.get(${x} + ',' + ${y}).pic ? 'parted' : 'other');
    drawWorld(t0 + 800);   // (a whole frame)
    const mid = [${x} * T - cx + 8, ${y} * T - cy + 8];
    return {bits: bits.map(r => r.length), sizes: bits.flat().every(([, , w, h]) => w === 2 && h === 1), near: bits.flat().every(([bx, by]) => Math.abs(bx - mid[0]) <= 16 && by - mid[1] >= -16 && by - mid[1] <= 16),
      up: bits[1].some(([, by]) => by < mid[1] - 4), after, feet, frame: drawn.filter(d => d !== 'other')};
  })()`);
  assert.deepEqual(out.bits, [4, 4, 4], 'four bits of grass');
  assert.ok(out.sizes, 'each a little blade, two pixels long');
  assert.ok(out.up, 'flying up a little');
  assert.ok(out.near, 'never far from where you pushed in');
  assert.equal(out.after, 0, 'and gone again in under half a second');
  assert.ok(out.feet.length >= 1 && out.feet.every(d => d === 'parted'), `the grass over your feet, parted (${out.feet})`);
  assert.deepEqual(out.frame, ['map', 'parted', 'objects', 'parted'], 'in a frame: the map, the grass you’re in over it, the big objects over that, as on the map, and later the grass over your feet');
});

test('once you’ve gone, the grass stays flattened a moment, then springs back, wobbling, and is the map’s own again; only the squares near you are ever stirred', () => {
  const g = game();
  const [x, y] = get(g, INTO);
  const out = get(g, `(() => {
    const t0 = 50000, at = (dx, dy) => stirred.get((${x} + dx) + ',' + (${y} + dy)), k = () => at(0, 0) ? +at(0, 0).k : null;
    stirGrass(t0); pl.py += 6; stirGrass(t0 + 10); stirGrass(t0 + 270);
    pl.py = ${y} * T + 6; stirGrass(t0 + 300);   // (on into the square below)
    const left = at(0, 0).out, below = !!at(0, 1) && at(0, 1).out === null;
    stirGrass(t0 + 300 + STIR.hold - 20); const flat = k();
    const ks = []; for (let t = STIR.hold; t < STIR.hold + STIR.back; t += 20){ stirGrass(t0 + 300 + t); ks.push(k()); }
    stirGrass(t0 + 300 + STIR.hold + STIR.back + 20); const gone = !at(0, 0);
    // walking the longest way through the meadow's grass, along a row, a square at a time: never more than the squares near you
    let row = null;
    for (let ry = 0; ry < ROWS; ry++) for (let rx = 0; rx < COLS; rx++){
      if (!grassy(rx, ry) || grassy(rx - 1, ry)) continue;
      let n = 1; while (grassy(rx + n, ry)) n++;
      if (!row || n > row[2]) row = [rx, ry, n];
    }
    const [rx, ry, run] = row;
    let most = 0, far = 0, t = t0 + 4000;
    pl.dir = 'right'; pl.x = rx; pl.y = ry; pl.px = rx * T; pl.py = ry * T;
    while (pl.px < (rx + run - 1) * T){
      t += 30; pl.px = Math.min((rx + run - 1) * T, pl.px + T * 30 / STEP);
      stirGrass(t); most = Math.max(most, stirred.size);
      for (const key of stirred.keys()){ const [sx, sy] = key.split(',').map(Number); far = Math.max(far, Math.abs(sx - Math.floor((pl.px + 8) / T)), Math.abs(sy - ry)); }
    }
    for (let s = 0; s < 3000; s += 100) stirGrass(t + s);   // (standing still)
    const standing = [...stirred.keys()];
    const kept = overGrassAt.size;
    enterPlace(Object.keys(PLACES).find(id => id !== PLACE && PLACES[id].map)); pl.px = pl.py = 0; stirGrass(t + 3100);
    return {left: left === t0 + 300, below, flat, ks, gone, most, far, steps: run - 1, standing: standing.length, kept, afterwards: [stirred.size, overGrassAt.size]};
  })()`);
  assert.ok(out.left, 'it knows when you left it');
  assert.ok(out.below, 'and the square you’ve gone into is parting now');
  assert.equal(out.flat, 1, 'your track flattened a moment');
  assert.ok(out.ks[0] > .8 && Math.min(...out.ks) < -.15 && Math.min(...out.ks) > -.5, `then springing back, a little past upright and back (${out.ks.slice(0, 20).join(' ')})`);
  assert.ok(out.ks.slice(-10).every(v => v === 0), 'and still well before it’s let go');
  assert.ok(out.gone, 'then the map’s own square again');
  assert.ok(out.steps >= 3, `a good walk through it (${out.steps} squares)`);
  assert.ok(out.most >= 3 && out.most <= 20, `walking through it, only the squares near you are stirred (at most ${out.most})`);
  assert.ok(out.far <= 6, `none of them far from you (${out.far} squares)`);
  assert.equal(out.standing, 1, 'standing still in it, just the square you’re in, parted round you');
  assert.ok(out.kept >= 3, 'what reaches into each square kept while you’re there');
  assert.deepEqual(out.afterwards, [0, 0], 'and in another place, nothing from the last');
});

test('walking sideways through the grass, its tufts bend on ahead of you, and the squares above and below you lean on with you', () => {
  const g = game();
  const out = get(g, `(() => {
    enterPlace('meadow');
    let at = null;
    for (let y = 1; y < ROWS - 1 && !at; y++) for (let x = 2; x < COLS - 1 && !at; x++)
      if (grassy(x, y) && grassy(x, y - 1) && grassy(x, y + 1) && tileAt(x - 1, y).walk && !grassy(x - 1, y)) at = [x, y];
    const [x, y] = at, t0 = 50000;
    pl.x = x - 1; pl.y = y; pl.px = (x - 1)*T; pl.py = y*T; pl.dir = 'right';
    stirGrass(t0); pl.px += 10; stirGrass(t0 + 10); stirGrass(t0 + 320);
    const s = stirred.get(x + ',' + y), pic = __square(s.pic.px), still = __pixels(ctx => tall(ctx, 0, 0, x, y, TALL));
    const lit = mix(TALL[2], '#FFFFFF', STIR_LIT), xs = (px, c) => [...px].filter(([, v]) => v === c).map(([k]) => +k.split(',')[0]);
    const mean = list => list.reduce((a, b) => a + b, 0) / list.length;
    const sides = [stirred.get(x + ',' + (y - 1)), stirred.get(x + ',' + (y + 1))];
    return {ahead: mean(xs(pic, lit)) > mean(xs(still, TALL[2])), sides: sides.map(q => !!q && q.side && stirBend(q, 1)(5) > 0)};
  })()`);
  assert.ok(out.ahead, 'bending on ahead of you, to the right');
  assert.deepEqual(out.sides, [true, true], 'the squares above and below you leaning on to the right too');
});
