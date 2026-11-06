// Walking into a place quicker, with exactly the same pixels, and music that plays on through a moment's pause (decided
// 6 November 2026, after the game stuttered and the music broke up while it was cast to a TV: walking into the hot spring
// valley took a second on a phone, while the music was planned only a third of a second ahead). The banana plants'
// leaves are filled a row at a time, cliffs and banks drawn a row at a time, a pine on the map copied from one of its
// eight pictures, and each mix of two colours remembered; the music is planned a second and a half ahead.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

// How they were drawn before (version 408), a pixel at a time, to compare with.
const BEFORE = `
globalThis.oldPolyFill = function(g, pts, col){
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  g.fillStyle = col;
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++){
    const px = x + .5, py = y + .5; let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++){ const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside; }
    if (inside) g.fillRect(x, y, 1, 1);
  }
};
globalThis.oldCliffFace = function(g, X, Y, x, y){
  const drop = dropOf(x, y), {up, dn, top, H, endL, endR} = drop, from = up ? null : dropLip(g, X, Y, x, y, drop);
  for (let c = 0; c < T; c++){
    const fx = x*T + c;
    for (let row = up ? 0 : from[c]; row < T; row++){
      const fy = top + row, k = fy / (H - 1), rock = rockAt(fx, y*T + row, 9, 7, 600);
      let col = mix(FACE.top, FACE.foot, k);
      const light = -(rock.sx * .6 + rock.sy);
      if (rock.edge < 1.1) col = FACE.crack;
      else if (rock.edge < 2.2 && light > 0) col = mix(FACE.lit, col, k * .6);
      else if (light < -.35) col = mix(col, FACE.crack, .35);
      else if (light > .3) col = mix(col, FACE.lit, .3);
      if (rnd(fx, fy, 504) < .04) col = mix(col, FACE.crack, .45);
      if (endR && c >= 13) col = mix(col, FACE.side, [.25, .45, .7][c - 13]);
      if (endL && c === 0) col = mix(col, FACE.side, .55);
      R(g, X+c, Y+row, 1, 1, col);
    }
    if (!up) R(g, X+c, Y+from[c], 1, 1, FACE.side);
    if (!dn){
      R(g, X+c, Y+14, 1, 1, FACE.crack); R(g, X+c, Y+15, 1, 1, FACE.base);
      if (rnd(fx, y, 505) < .4) R(g, X+c, Y+13 + (rnd(fx, y, 506) < .5 ? 1 : 0), 1, 3, c % 3 ? '#4F9445' : '#5FA14F');
    }
  }
};
globalThis.oldBank = function(g, X, Y, x, y){
  const drop = dropOf(x, y), {up, dn, top, H} = drop, from = up ? null : dropLip(g, X, Y, x, y, drop);
  for (let c = 0; c < T; c++){
    const fx = x*T + c;
    for (let row = up ? 0 : from[c]; row < T; row++){
      const fy = top + row, k = fy / (H - 1);
      let col = mix(BANKS.top, BANKS.foot, k);
      if ((fy + Math.floor(rnd(fx, 9, 510) * 6)) % 6 === 0) col = mix(col, BANKS.blade, .45 + k * .4);
      else if (rnd(fx, fy, 511) < .05) col = BANKS.tip;
      R(g, X+c, Y+row, 1, 1, col);
    }
    if (!dn){ R(g, X+c, Y+14, 1, 1, BANKS.blade); R(g, X+c, Y+15, 1, 1, BANKS.base); }
  }
};`;

// A game, with a pretend canvas that keeps the colour of each pixel it fills, 'x,y', a fill over what was there, and
// a picture drawn onto it (drawImage) putting its pixels where it's drawn; and new canvases made of the same.
// (Everything compared here is solid colour, but for the shadows, which both ways draw first, straight onto the ground.)
function game(save = {version: 34, started: true}){
  const g = loadGame({dom: true, save});
  g.run("mode = 'play'; save = () => {}");
  g.run(BEFORE);
  g.run(`globalThis.__ctx = px => ({fillStyle: '', strokeStyle: '', globalAlpha: 1, lineWidth: 1,
      fillRect(x, y, w, h){ for (let a = x; a < x + w; a++) for (let b = y; b < y + h; b++) px.set(a + ',' + b, this.fillStyle); },
      drawImage(pic, dx, dy){ for (const [k, v] of pic.px){ const [a, b] = k.split(',').map(Number); px.set((a + dx) + ',' + (b + dy), v); } },
      save(){}, restore(){}, beginPath(){}, rect(){}, clip(){}, translate(){}, scale(){}, moveTo(){}, lineTo(){}, closePath(){},
      arc(){}, ellipse(){}, fill(){}, stroke(){}, fillText(){}, clearRect(){}});
    globalThis.__pixels = draw => { const px = new Map(); draw(__ctx(px)); return px; };
    globalThis.__same = (p, q) => p.size === q.size && [...p].every(([k, v]) => q.get(k) === v);
    { const make = document.createElement; document.createElement = tag => tag === 'canvas' ? (c => (c.getContext = () => __ctx(c.px), c))({width: 0, height: 0, px: new Map()}) : make(tag); }`);
  return g;
}
const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));

test('a shape filled a row at a time (a banana plant’s leaf) has exactly the pixels it had, filled a pixel at a time', () => {
  const g = game();
  const out = get(g, `(() => {
    const shapes = [leafPts(0, 0, 20, 8, 5), leafPts(10, 30, 2, 4, 4, 3), leafPts(3, 3, 3, 25, 6, -2), [[0, 0], [10, 0], [10, 10], [0, 10]], [[.5, .5], [9.5, .5], [5, 9.5]], [[2, 2], [2, 2], [8, 3], [8, 3], [4, 9]]];
    for (let i = 0; i < 400; i++){   // and all sorts of others: on whole pixels, halves, anywhere, and crossing themselves
      const pts = [];
      for (let j = 0, m = 3 + Math.floor(rnd(i, 1, 900) * 10); j < m; j++){
        const p = [rnd(i, j, 901) * 40 - 5, rnd(i, j, 902) * 30 - 5];
        pts.push(i % 3 === 0 ? p.map(Math.round) : i % 3 === 1 ? p.map(v => Math.round(v * 2) / 2) : p);
      }
      shapes.push(pts);
    }
    const bad = shapes.filter(pts => !__same(__pixels(ctx => polyFill(ctx, pts, '#123456')), __pixels(ctx => oldPolyFill(ctx, pts, '#123456'))));
    return {n: shapes.length, bad: bad.length, filled: shapes.map(pts => __pixels(ctx => polyFill(ctx, pts, '#123456')).size).reduce((a, b) => a + b)};
  })()`);
  assert.equal(out.bad, 0, `every shape the same (${out.n} of them)`);
  assert.ok(out.filled > 20000, 'and they filled plenty of pixels');
});

test('cliffs and banks drawn a row at a time have exactly the pixels they had, drawn a pixel at a time, in every place of both areas', () => {
  for (const [area, save] of [[1, {version: 34, started: true}], [2, {version: 34, started: true, area: 2, shells: 12, areas: {1: {chapter: 1, raft: 3, done: true}, 2: {landed: 1, dressed: 2}}}]]){
    const g = game(save);
    g.run('buildMap = () => {}');   // (each place's map, without drawing it all on the pretend page: just its cliffs, here)
    const out = get(g, `(() => {
      let n = 0; const bad = [];
      for (const id of Object.keys(AREA.places)){
        if (!AREA.places[id].map || AREA.places[id].borrow) continue;   // (not those the human world borrows from Flower Fruit Mountain: the same squares)
        enterPlace(id);
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){
          const look = tileAt(x, y).look, isBank = look === 'bank';
          if (!['cliffFace', 'grapeCliff', 'demonDoor', 'bank'].includes(look)) continue;
          n++;
          const now = __pixels(ctx => (isBank ? bank : cliffFace)(ctx, x*T, y*T, x, y)), was = __pixels(ctx => (isBank ? oldBank : oldCliffFace)(ctx, x*T, y*T, x, y));
          if (!__same(now, was)) bad.push(id + ' ' + x + ',' + y);
        }
      }
      return {n, bad};
    })()`);
    assert.deepEqual(out.bad, [], `area ${area}: every square the same`);
    assert.ok(out.n > (area === 1 ? 800 : 100), `area ${area}: plenty of cliffs and banks (${out.n})`);
  }
});

test('a pine on the map is copied from one of its eight pictures, with exactly the pixels it had drawn on its own', () => {
  const g = game();
  const out = get(g, `(() => {
    PINE_PICTURES.clear(); let n = 0, bad = 0;
    for (let x = 0; x < 36; x++) for (let y = 0; y < 30; y++) for (const sh of [true, false]){   // (its shadow on the ground, and what goes over the characters, without)
      shadows = sh; n++;
      if (!__same(__pixels(ctx => OBJECT_ART.pine(ctx, {look: 'pine', x, y, w: 1, h: 1})), __pixels(ctx => pine(ctx, x*T, y*T, x*31 + y)))) bad++;
    }
    shadows = true;
    return {n, bad, pictures: PINE_PICTURES.size};
  })()`);
  assert.equal(out.bad, 0, `every pine the same (${out.n})`);
  assert.equal(out.pictures, 8, 'drawn just eight times');
});

test('mixing two colours gives the same colour every time, and remembering them never grows without end', () => {
  const g = game();
  assert.equal(g.run("mix('#000000', '#FFFFFF', .5)"), '#808080');
  assert.equal(g.run("mix('#C9C4B6', '#77726A', .25)"), g.run("mix('#C9C4B6', '#77726A', .25)"));
  assert.equal(g.run("mix('#C9C4B6', '#77726A', 0)"), '#c9c4b6');
  g.run("for (let i = 0; i < 10000; i++) mix('#123456', '#ABCDEF', i / 10000)");   // (a scene mixes a new colour every frame)
  assert.ok(g.run('MIX_MEMO.size') <= 4096, 'it starts again once it has a few thousand');
  assert.equal(g.run("mix('#123456', '#ABCDEF', .5)"), '#5f81a3');
});

test('the music is planned a second and a half ahead, so a pause of more than a second loses not a note', () => {
  const g = loadGame();
  assert.equal(g.run('MUSIC_AHEAD'), 1.5);
  // The notes the music plays (when each starts), with the scheduler ticking at these times on the sound's clock.
  const notes = ticks => get(g, `(() => {
    const out = [], sg = SONGS.home, play = sg.play;
    AC = {currentTime: 10}; mBus = {}; song = 'home'; mStart = 10; mIdx = 0; mLoop = 0;
    sg.play = (a, ev, t) => out.push(+t.toFixed(4));
    for (const t of ${JSON.stringify(ticks)}){ AC.currentTime = t; musicTick(); }
    sg.play = play; AC = null; mBus = null;
    return out;
  })()`);
  const every = []; for (let t = 10; t <= 16; t += .05) every.push(+t.toFixed(2));
  const smooth = notes(every), first = notes([10]);
  assert.ok(Math.max(...first) <= 11.5 && Math.max(...first) > 11, 'its first tick plans the next second and a half');
  for (const [from, to] of [[10.5, 11.8], [12, 13.4]]){   // the phone busy for 1.3 and 1.4 seconds, such as drawing a big place
    assert.deepEqual(notes(every.filter(t => t < from || t >= to)), smooth, `busy from ${from} to ${to}: every note still played, on time`);
  }
  assert.ok(smooth.length > 20, 'it played plenty of notes');
});
