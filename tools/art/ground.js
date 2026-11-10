// The ground of a place at double detail: 32 x 32 pixels a square (the new look, on trial: DESIGN.md's Next steps).
// From the place's own map: grass in soft drifts with blades and daisies, worn paths that lie a little low, water below
// its banks, the rock's top and its cliffs, flowers, a bridge, and the cliffs' shadows, lit from the top left. Only what
// never moves: trees, rocks, signs and the long grass's tufts are things, drawn over it (and the ground under them is
// what it will be once they've gone: path under the rocks across the path).
'use strict';
const {Img, P, hex, mix, hash, noise, fbm, shadePx, sprite} = require('./core.js');

const T = 32;
const GRASS = 0, PATH = 1, WATER = 2, TALL = 3, TOP = 4, FACE = 5, WOOD = 6;
// the ground a look stands on
const kindOf = look => look === 'water' || look === 'bridge' ? WATER : look === 'path' ? PATH : look === 'tallGrass' ? TALL
  : look === 'heights' ? TOP : look === 'cliffFace' ? FACE : look === 'tree' ? WOOD : GRASS;
const ridged = (u, v, s) => 1 - Math.abs(2 * fbm(u, v, s) - 1);

// rows: the map, a letter a square. looks: for each letter, {look, becomes}: its look, and the letter it turns into for
// good as the story goes on, if it does (then the ground is that letter's).
function ground(rows, looks){
  const COLS = rows[0].length, ROWS = rows.length, W = COLS * T, H = ROWS * T, M = 24, W2 = W + 2 * M, H2 = H + 2 * M;
  const letter = (tx, ty) => rows[Math.max(0, Math.min(ROWS - 1, ty))][Math.max(0, Math.min(COLS - 1, tx))];
  const lookOf = c => { const l = looks[c] || {look: 'grass'}; return l.becomes && looks[l.becomes] ? looks[l.becomes].look : l.look; };
  const isTree = (tx, ty) => lookOf(letter(tx, ty)) === 'tree';
  const tileKind = (tx, ty) => { const kd = kindOf(lookOf(letter(tx, ty)));   // (only a wood's floor is darker: a tree with trees on two sides or more, never one alone on the grass)
    return kd === WOOD && [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => isTree(tx + dx, ty + dy)).length < 2 ? GRASS : kd; };
  const tileLook = (tx, ty) => (looks[letter(tx, ty)] || {}).look;
  const at = (x, y) => tileKind(Math.floor(x / T), Math.floor(y / T));
  // the cliffs' sides wander a pixel or two as they go down, so a tall edge is never a ruled line
  const sway = y => Math.round((noise(y / 11, 7.7, 77) - .5) * 5);
  const rock = (x, y) => { const k = at(x + sway(y), y); return k === TOP || k === FACE ? k : -1; };

  // soft masks: how much of the ground round a pixel is one kind (so corners round off), with a wobble
  const idx = (x, y) => (Math.max(-M, Math.min(H + M - 1, y)) + M) * W2 + Math.max(-M, Math.min(W + M - 1, x)) + M;
  const blur = (src, r) => {
    const sat = new Float64Array((W2 + 1) * (H2 + 1)), out = new Float32Array(W2 * H2);
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) sat[(y + 1) * (W2 + 1) + x + 1] = src[y * W2 + x] + sat[y * (W2 + 1) + x + 1] + sat[(y + 1) * (W2 + 1) + x] - sat[y * (W2 + 1) + x];
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++){
      const x0 = Math.max(0, x - r), x1 = Math.min(W2 - 1, x + r), y0 = Math.max(0, y - r), y1 = Math.min(H2 - 1, y + r);
      out[y * W2 + x] = (sat[(y1 + 1) * (W2 + 1) + x1 + 1] - sat[y0 * (W2 + 1) + x1 + 1] - sat[(y1 + 1) * (W2 + 1) + x0] + sat[y0 * (W2 + 1) + x0]) / ((x1 - x0 + 1) * (y1 - y0 + 1));
    }
    return out;
  };
  const soft = (k, r, seed, amt) => {
    const a = new Float32Array(W2 * H2);
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) a[y * W2 + x] = at(x - M, y - M) === k ? 1 : 0;
    const c = blur(blur(a, r), r), m = new Uint8Array(W2 * H2);
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) m[y * W2 + x] = c[y * W2 + x] + (fbm((x - M) / 18, (y - M) / 18, seed) - .5) * amt > .5 ? 1 : 0;
    return m;
  };
  const mWater = soft(WATER, 5, 3, .2), mPath = soft(PATH, 4, 5, .3), mTall = soft(TALL, 3, 8, .3), mWood = soft(WOOD, 4, 9, .25);
  // what each pixel is, once and for all
  const K = new Uint8Array(W2 * H2);
  for (let y = -M; y < H + M; y++) for (let x = -M; x < W + M; x++){
    const i = idx(x, y), r = rock(x, y);
    K[i] = r >= 0 ? r : mWater[i] ? WATER : mPath[i] ? PATH : mTall[i] ? TALL : mWood[i] ? WOOD : GRASS;
  }
  const k = (x, y) => K[idx(x, y)];
  const cliff = (x, y) => { const v = k(x, y); return v === TOP || v === FACE; };
  const water = (x, y) => k(x, y) === WATER, path = (x, y) => k(x, y) === PATH, tall = (x, y) => k(x, y) === TALL;
  const near = (f, x, y, n, dx, dy) => { for (let i = 1; i <= n; i++) if (f(x + dx * i, y + dy * i)) return i; return 0; };   // how far to the first such pixel that way, up to n (0: none)
  const not = f => (x, y) => !f(x, y);
  // how far into the water a pixel is, up to 19
  const depth = new Uint8Array(W2 * H2);
  { const q = []; for (let y = -M; y < H + M; y++) for (let x = -M; x < W + M; x++) if (!water(x, y)){ depth[idx(x, y)] = 0; q.push(x, y); } else depth[idx(x, y)] = 255;
    for (let h = 0; h < q.length; h += 2){ const x = q[h], y = q[h + 1], d = depth[idx(x, y)]; if (d >= 19) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const nx = x + dx, ny = y + dy; if (nx < -M || ny < -M || nx >= W + M || ny >= H + M) continue; const j = idx(nx, ny); if (depth[j] > d + 1){ depth[j] = d + 1; q.push(nx, ny); } } } }

  const G = P.grass, E = P.earth, R = P.rock, A = P.water, WD = P.wood;
  const img = new Img(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
    const kind = k(x, y);
    let c;
    if (kind === TOP){
      // the rock's top, seen from above: pale, with long cracks, and moss creeping in from its edges
      const n = fbm(x / 28, y / 20, 21), crack = Math.abs(fbm(x / 22, y / 34, 23) - .5), edge = !cliff(x - 4, y) || !cliff(x + 4, y) || !cliff(x, y - 4) ? .12 : 0;
      c = n > .62 ? R[0] : n < .36 ? R[2] : R[1];
      if (hash(x, y, 24) > .985) c = c === R[0] ? R[1] : R[0];                               // the stone's grain
      if (crack < .007) c = R[3]; else if (crack < .012 && fbm(x / 22, (y + 1) / 34, 23) < fbm(x / 22, y / 34, 23)) c = R[0];
      const moss = fbm(x / 14, y / 12, 25) + edge;
      if (moss > .7) c = moss > .79 ? (hash(x >> 1, y >> 1, 26) > .7 ? G[2] : G[3]) : G[4];
      if (near((a, b2) => k(a, b2) === FACE, x, y, 2, 0, 1)) c = R[0];                           // the lip, catching the light
      else if (near(not(cliff), x, y, 2, 1, 0) || near(not(cliff), x, y, 2, 0, 1)) c = R[5];  // its far edges, in shade
      else if (near(not(cliff), x, y, 1, -1, 0) || near(not(cliff), x, y, 1, 0, -1)) c = R[3];
    } else if (kind === FACE){
      // the cliff's face, as rock is painted in a Chinese landscape: tall facets split by slanting cracks, each lit on
      // its left edge and dark on its right, broken by ledges, paler at the top and deep in shade at its foot
      let y0 = y; while (k(x, y0 - 1) === FACE && y - y0 < 80) y0--;
      let y1 = y; while (k(x, y1 + 1) === FACE && y1 - y < 80) y1++;
      const hgt = y1 - y0 + 1, fy = y - y0, v = fy / hgt, sx = x + sway(y);
      const isCrack = cx => hash(cx, 7, 3) < .075 && hash(cx - 1, 7, 3) >= .075 && hash(cx - 2, 7, 3) >= .075 && hash(cx - 3, 7, 3) >= .075;
      let dl = 99, dr = 99, left = 0;
      for (let cx = sx - 44; cx < sx + 44; cx++){
        if (!isCrack(cx)) continue;
        const from = hash(cx, 2, 6) < .25 ? hgt * .35 : 0, to = hash(cx, 3, 6) < .3 ? hgt * .7 : hgt;
        if (fy < from || fy > to) continue;
        const d = sx - (cx + Math.round((noise(fy / 14, cx * .37, 4) - .5) * 14));
        if (d >= 0 && d < dl){ dl = d; left = cx; } if (d < 0 && -d < dr) dr = -d;
      }
      const pale = hash(left, 1, 9) > .55 ? 1 : 0, band = v < .3 ? 1 : v < .68 ? 2 : 3;
      c = dl <= 1 ? R[6] : dl <= 3 ? R[band - 1] : dl <= 5 && pale ? R[band] : dr <= 2 ? R[band + 2] : R[band + 1 - pale];
      if (dl > 3 && dr > 2 && ridged(sx / 30, fy / 5, 13) > .9) c = R[band + 2 - pale];        // thin layers in the stone
      for (const s2 of [11, 12]){   // ledges: a lit lip with its shadow under it, sloping a little
        const ly = 10 + Math.floor(hash(left, s2, 5) * (hgt - 24)) + Math.round((sx - left) * (hash(left, s2, 8) - .5) * .5);
        if (dl > 1 && dr > 1){ if (fy === ly || fy === ly + 1) c = R[Math.max(0, band - 1)]; else if (fy === ly + 2 || fy === ly + 3) c = R[band + 3]; else if (fy === ly + 4) c = R[band + 2]; }
      }
      if (hash(x, y, 14) > .975 && dl > 3) c = R[band];
      if (fy <= 1) c = R[1]; else if (fy <= 3 && dl > 1) c = R[1 + (dr <= 2 ? 2 : 1)];
      if (hgt - fy <= 8 && dl > 1) c = R[Math.min(7, band + 2 + (hgt - fy <= 4 ? 1 : 0))];    // its foot, in its own shade
      // moss hanging from the lip in clumps, and grass standing at its foot
      const clump = fbm(sx / 10, 3, 15), hang = clump > .56 ? Math.round((clump - .56) * 50 + hash(sx >> 1, 3, 16) * 5) : 0;
      if (fy < hang) c = fy >= hang - 2 ? G[5] : fy <= 1 ? G[2] : hash(sx >> 1, fy >> 1, 19) > .6 ? G[2] : hash(sx >> 1, fy >> 1, 19) < .25 ? G[4] : G[3];
      const tuft = fbm(sx / 8, 9, 17), foot = tuft > .5 ? Math.round((tuft - .5) * 26 + hash(sx, 9, 18) * 6) : 0, up = hgt - 1 - fy;
      if (up < foot) c = up >= foot - 2 ? G[1] : up <= 1 ? G[5] : (sx + up) % 3 ? G[3] : G[4];
      if (!cliff(x - 1, y) || !cliff(x - 2, y)) c = R[2]; if (!cliff(x + 1, y) || !cliff(x + 2, y)) c = R[6];
    } else if (kind === WATER){
      const d = depth[idx(x, y)], pond = tileLook(Math.floor(x / T), Math.floor(y / T)) === 'water' && letter(Math.floor(x / T), Math.floor(y / T)) === 'O';
      c = d <= 4 ? A[2] : d <= 11 ? A[3] : A[4];
      if (d > 4 && fbm(x / (pond ? 32 : 10), y / (pond ? 14 : 52), 31) > .63) c = d <= 11 ? A[2] : A[3];   // the current's lighter streaks
      // the bank above and to the left stands over the water: its earth wall, then its shadow on the water
      const up = near(not(water), x, y, 10, 0, -1), lf = near(not(water), x, y, 6, -1, 0);
      if (up && up <= 5) c = up === 1 ? E[4] : up <= 3 ? (hash(x >> 1, y, 32) > .8 ? E[4] : E[5]) : E[6];
      else if (up) c = A[5];
      else if (lf && lf <= 2) c = E[6];
      else if (lf) c = A[5];
      else if ((near(not(water), x, y, 4, 0, 1) >= 3 || near(not(water), x, y, 4, 1, 0) >= 3) && hash(x >> 2, y >> 2, 33) > .45) c = hash(x >> 1, y >> 1, 34) > .7 ? A[0] : A[1];   // a broken line of light along the near banks
      else if (d > 6){   // ripples: bright dashes, each with a darker line under it
        const ry = Math.floor(y / 10), rx = Math.floor((x + ry * 13) / 26), on = hash(rx, ry, 35), len = 4 + Math.floor(hash(rx, ry, 36) * 8), sx = (x + ry * 13) - rx * 26, sy = y - ry * 10;
        if (on > .6 && sy === 4 && sx >= 4 && sx < 4 + len) c = sx >= 5 + (len >> 2) && sx < 4 + len - (len >> 2) ? A[0] : A[1];
        else if (on > .6 && sy === 5 && sx >= 6 && sx < 5 + len) c = d <= 11 ? A[4] : A[5];
      }
    } else if (kind === PATH){
      const n = fbm(x / 24, y / 24, 41);
      c = n > .56 ? E[1] : n < .13 ? E[3] : E[2];
      if (hash(x, y, 42) > .985) c = c === E[1] ? E[2] : E[1];                                // grit
      const up = near(not(path), x, y, 5, 0, -1), lf = near(not(path), x, y, 5, -1, 0);
      if ((up && up <= 2) || (lf && lf <= 2)) c = E[4];                                       // the worn track lies a little low: its upper edges in shade
      else if (up || lf) c = E[3];
      else if (near(not(path), x, y, 2, 0, 1) || near(not(path), x, y, 2, 1, 0)) c = E[1];
    } else {
      const tl = kind === TALL, wood = kind === WOOD, n = fbm(x / 60, y / 44, 1);
      c = tl ? (fbm(x / 18, y / 18, 51) > .55 ? G[4] : G[5]) : wood ? (n > .55 ? G[3] : G[4]) : n > .6 ? G[1] : n < .37 ? G[3] : G[2];
      if (!tl && !wood){
        // a rim of light where the grass stands over a path or the water below and to its right; of shade above them
        if (near(path, x, y, 2, -1, 0) || near(path, x, y, 2, 0, -1) || near(water, x, y, 2, -1, 0) || near(water, x, y, 2, 0, -1)) c = G[1];
        else if (near(path, x, y, 2, 1, 0) || near(path, x, y, 2, 0, 1)) c = G[4];
        else if (near(water, x, y, 2, 1, 0) || near(water, x, y, 2, 0, 1)) c = G[5];
        else if (near(tall, x, y, 2, 1, 0) || near(tall, x, y, 2, 0, 1) || near(tall, x, y, 2, -1, 0) || near(tall, x, y, 2, 0, -1)) c = G[3];
      } else if (wood && hash(x, y, 52) > .97) c = hash(x, y, 53) > .5 ? G[5] : G[2];            // leaf litter under the trees
    }
    img.set(x, y, c);
  }

  // ---- small things lying on the ground, stamped on: blades, daisies, pebbles ----
  const plain = (x, y, kind, r = 3) => { for (const [dx, dy] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) if (x + dx < 0 || y + dy < 0 || x + dx >= W || y + dy >= H || k(x + dx, y + dy) !== kind) return false; return true; };
  const tone = c => G.findIndex(g => g[0] === c[0] && g[1] === c[1] && g[2] === c[2]);
  const BLADES = [   // each a tuft: [dx, dy, 'd' dark or 'l' light], from its foot
    [[0, 0, 'd'], [0, -1, 'd'], [0, -2, 'd'], [-1, -3, 'd'], [-1, -4, 'l'], [2, 0, 'd'], [2, -1, 'd'], [3, -2, 'd'], [3, -3, 'l'], [-2, 0, 'd'], [-3, -1, 'd']],
    [[0, 0, 'd'], [0, -1, 'd'], [1, -2, 'd'], [1, -3, 'd'], [1, -4, 'l'], [-2, 0, 'd'], [-2, -1, 'd'], [-3, -2, 'd']],
    [[0, 0, 'd'], [0, -1, 'd'], [-1, -2, 'd'], [-1, -3, 'd'], [-2, -4, 'l'], [2, 0, 'd'], [3, -1, 'd']],
    [[0, 0, 'd'], [1, -1, 'd'], [1, -2, 'l'], [-1, 0, 'd']]];
  for (let cy = 0; cy < H / 10; cy++) for (let cx = 0; cx < W / 12; cx++){
    const x = cx * 12 + 2 + Math.floor(hash(cx, cy, 56) * 8), y = cy * 10 + 4 + Math.floor(hash(cx, cy, 57) * 5), h = hash(cx, cy, 53), drift = fbm(x / 80, y / 60, 55);
    if (plain(x, y, GRASS, 4)){
      if (h < .2 + (drift > .52 ? .34 : 0)){
        const t0 = tone(img.get(x, y)); if (t0 < 0) continue;
        for (const [dx, dy, s] of BLADES[Math.floor(hash(cx, cy, 58) * BLADES.length)]) img.set(x + dx, y + dy, s === 'l' ? G[Math.max(0, t0 - 1)] : G[Math.min(7, t0 + 1 + (dy === 0 ? 1 : 0))]);
      } else if (h > .972){   // a daisy: four petals round a gold middle, on a short stalk
        for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) img.set(x + dx, y + dy, P.white);
        img.set(x, y, P.gold[2]); img.set(x, y + 2, G[5]); img.set(x + 1, y + 3, G[5]);
      } else if (h > .955){   // a buttercup
        img.set(x, y, P.gold[1]); img.set(x + 1, y, P.gold[2]); img.set(x, y - 1, P.gold[0]); img.set(x, y + 1, G[5]);
      } else if (h > .945){   // clover
        for (const [dx, dy] of [[0, 0], [2, 0], [1, -1], [1, 1]]) img.set(x + dx, y + dy, G[0]);
      }
    } else if (plain(x, y, PATH, 5)){
      if (h > .86){           // a pebble: lit on top, its shadow under it
        img.set(x, y, E[0]); img.set(x + 1, y, E[0]); img.set(x + 2, y, E[1]); img.set(x - 1, y + 1, E[1]); img.set(x, y + 1, E[1]); img.set(x + 1, y + 1, E[1]); img.set(x + 2, y + 1, E[3]);
        img.set(x, y + 2, E[4]); img.set(x + 1, y + 2, E[4]); img.set(x + 2, y + 2, E[4]);
      } else if (h < .1){     // a scuff
        for (let i = 0; i < 5; i++) img.set(x + i, y + (i > 2 ? 1 : 0), E[3]);
      }
    } else if (plain(x, y, TALL, 3) && h < .3){
      img.set(x, y, G[6]); img.set(x, y - 1, G[6]); img.set(x + 1, y - 2, G[6]);
    }
  }

  // ---- flowers: a clump to a square, in its colour ----
  const FLOWER = {redFlowers: [P.red[1], P.red[2], P.gold[1]], yellowFlowers: [P.gold[1], P.gold[2], P.gold[4]], whiteFlowers: [P.white, hex('#E3DAC6'), P.gold[2]]};
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++){
    const col = FLOWER[tileLook(tx, ty)]; if (!col) continue;
    const spots = [[6, 9], [17, 6], [26, 11], [11, 19], [22, 21], [15, 27], [5, 26]].filter((s, i) => hash(tx * 7 + i, ty, 61) > .22)
      .map(([x, y], i) => [tx * T + x + Math.floor(hash(tx, ty * 5 + i, 62) * 3) - 1, ty * T + y + Math.floor(hash(tx * 3 + i, ty, 63) * 3) - 1]).sort((a, b2) => a[1] - b2[1]);
    for (const [x, y] of spots){
      img.set(x, y + 2, G[5]); img.set(x, y + 3, G[5]); img.set(x, y + 4, G[5]); img.set(x + 1, y + 3, G[4]); img.set(x - 1, y + 4, G[4]);   // its stalk and a leaf
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) img.set(x + dx, y + dy, col[1]);
      for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) img.set(x + dx, y + dy, col[0]);
      img.set(x, y, col[2]);
    }
  }

  // ---- a bridge: planks across the water, a rail each side, its shadow on the water below ----
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++){
    if (tileLook(tx, ty) !== 'bridge' || tileLook(tx - 1, ty) === 'bridge') continue;
    let n = 1; while (tileLook(tx + n, ty) === 'bridge') n++;
    const x0 = tx * T - 6, x1 = (tx + n) * T + 6, y0 = ty * T + 3, y1 = ty * T + 28;
    for (let y = y1 + 1; y <= y1 + 5; y++) for (let x = x0 + 3; x < x1 + 3; x++) if (water(x, y)) img.set(x, y, A[6]);
    for (let y = y0; y <= y1; y++) for (let x = x0; x < x1; x++){
      const plank = Math.floor((x - x0) / 7), gap = (x - x0) % 7 === 6, rail = y - y0 < 4 || y1 - y < 4;
      let c = gap ? WD[4] : hash(plank, ty, 71) > .5 ? WD[1] : WD[2];
      if (!gap && (x - x0) % 7 === 0) c = WD[0];
      if (!gap && hash(x, y, 72) > .96) c = WD[3];
      if (rail) c = y === y0 || y === y1 - 3 ? WD[0] : y === y0 + 3 || y === y1 ? WD[5] : y === y0 + 2 || y === y1 - 1 ? WD[3] : WD[1];
      if (rail && (x - x0 < 4 || x1 - x <= 4 || Math.abs((x - x0) - (x1 - x0) / 2) < 2)) c = y === y0 || y === y1 - 3 ? WD[2] : WD[4];   // its posts
      if (x === x0 || x === x1 - 1) c = WD[5];
      img.set(x, y, c);
    }
  }

  // ---- lily pads and a fish, on a pond ----
  const LILY = sprite(['..llll...', '.lLLLLld.', 'lLLLLLdd.', 'lLLLL.dd.', '.lLLLddd.', '..dddd...'], {l: G[1], L: G[2], d: G[4]});
  const BUD = sprite(['..llll....', '.lLLpPld..', 'lLLpPPPdd.', 'lLLLpPddd.', '.lLLLddd..', '..dddd....'], {l: G[1], L: G[2], d: G[4], p: hex('#FBD0D6'), P: hex('#F090A8')});
  const KOI = sprite(['..oo...w..', '.oOOoo.ww.', 'oOOOOOoww.', '.oOOoo.ww.', '..oo...w..'], {o: P.gold[3], O: P.red[1], w: P.white});
  let pads = 0;
  for (let cy = 0; cy < H / 22; cy++) for (let cx = 0; cx < W / 26; cx++){
    const x = cx * 26 + Math.floor(hash(cx, cy, 81) * 14), y = cy * 22 + Math.floor(hash(cx, cy, 82) * 10);
    if (letter(Math.floor(x / T), Math.floor(y / T)) !== 'O' || depth[idx(x + 4, y + 3)] < 9 || hash(cx, cy, 83) > .55) continue;
    img.blit(pads % 4 === 1 ? BUD : pads % 5 === 3 ? KOI : LILY, x, y); pads++;
  }

  // ---- the cliffs' shadows: a pixel is in shade if rock stands between it and the sun ----
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){
    if (cliff(x, y)) continue;
    for (let i = 1; i <= 18; i++) if (cliff(x - i, y - Math.round(i * .55))){ shadePx(img, x, y, .62); break; }
  }
  return img;
}
// the looks a ground's picture has in it: anything else on a map keeps today's drawing, over it
const COVERS = ['grass', 'path', 'water', 'bridge', 'heights', 'cliffFace', 'redFlowers', 'yellowFlowers', 'whiteFlowers'];
module.exports = {ground, T, COVERS};
