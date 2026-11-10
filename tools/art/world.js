// The meadow, redrawn: the game's own map (content/flower-fruit-mountain.js, the first place), the same squares, the
// same view as the screens gallery's Playing screen, in the new palette, lit from the top left.
const {Img, P, hex, mix, hash, noise, fbm, shadePx, lightPx} = require('./core.js');
const TH = require('./things.js');
const {monkey} = require('./monkey.js');

const MAP = [
  '^^^^^^^MMMMM^^M..MWWMMMM', '^^^^^^^ggSgg^^g..gWWYYYY', '^^MMM^^gg.gN^^g..JWWYYYY', 'MMMMMMMgg.ggMMg..gWWYYYY', 'MMgggMMgg.ggMMoRRoWWYYYY',
  'YTggggggg.ggggg..gWWYYYY', 'YPg.............ggWWYYYY', 'YTggGGGGgggFggg.ggWWgggY', 'YPggGGGGggggTgg.ggWWgGgY', 'YTggGGGgggOOOKg.gJWWGGgY',
  'YJgggggggOOOOgg.ggWWGGgY', 'YTgggGGGgOOOOOg.ggWWgggY', 'YggJgGGGggOOOgg...BBgggY', 'YgggggggggggggggggWWgGgY', 'YTgGGGggggggggFgggWWGGgY',
  'YTggggg.ggggggTgggWWgggY', 'Y^^^^gg.ggggggggggWWgggY', 'Y^^^Mgg.gggEggggggWWgQgY', 'Y^^MMgg.GGGGgTggggWWgggY', 'YMMMggg...........BBgEgY',
  'YMMgEggGGGggggggggWWgggY', 'YYYYYYYYYYYYYYYYYYWWYYYY'];
const T = 16;
// who's where in the gallery's Playing screen: [who, square x, y, facing], and the marks over heads
const CAST = [['elder', 14, 2, 'left'], ['little', 14, 3, 'left'], ['hungry', 13, 5, 'down'], ['big', 16, 1, 'down'], ['player', 13, 6, 'up']];
const MARKS = [[14, 2, '!'], [14, 3, '!'], [13, 5, '?'], [13, 9, '!']];
const tile = (tx, ty) => MAP[Math.max(0, Math.min(MAP.length - 1, ty))][Math.max(0, Math.min(23, tx))];
const kind = c => c === 'W' || c === 'O' || c === 'B' ? 'water' : c === '.' || c === 'R' ? 'path' : c === 'G' ? 'tall' : c === '^' ? 'top' : c === 'M' ? 'face' : 'grass';

// mood: the light. day (morning sun), dusk (low and gold), night (moonlit).
function meadow({ox = 96, oy = 24, w = 240, h = 160, mood = 'day', marks = true, band = true, gate = true, cast = CAST, over = MARKS, hint = [13, 5]} = {}){
  const M = 12, W2 = w + 2 * M, H2 = h + 2 * M;
  const K = (x, y) => kind(tile(Math.floor((x + ox) / T), Math.floor((y + oy) / T)));   // what's at a pixel of the frame
  // soft masks: how much of the little disc round a pixel is this kind (so corners round off), then a wobble
  const cover = (k, r) => { const a = new Float32Array(W2 * H2); const pts = []; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r + 1) pts.push([dx, dy]);
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++){ let n = 0; for (const [dx, dy] of pts) if (K(x - M + dx, y - M + dy) === k) n++; a[y * W2 + x] = n / pts.length; } return a; };
  const cPath = cover('path', 4), cWater = cover('water', 5), cTall = cover('tall', 3);
  const wob = (x, y, s, amt) => (fbm((x + ox) / 9, (y + oy) / 9, s) - .5) * amt;
  const mask = (c, s, amt) => { const a = new Uint8Array(W2 * H2); for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) a[y * W2 + x] = c[y * W2 + x] + wob(x - M, y - M, s, amt) > .5 ? 1 : 0; return a; };
  const mWater = mask(cWater, 3, .22), mPathRaw = mask(cPath, 5, .3), mTall = mask(cTall, 8, .34);
  const cliff = (x, y) => { const k = K(x, y); return k === 'top' || k === 'face'; };
  const water = (x, y) => !cliff(x, y) && mWater[(Math.max(-M, Math.min(h + M - 1, y)) + M) * W2 + Math.max(-M, Math.min(w + M - 1, x)) + M] === 1;
  const path = (x, y) => !cliff(x, y) && !water(x, y) && mPathRaw[(Math.max(-M, Math.min(h + M - 1, y)) + M) * W2 + Math.max(-M, Math.min(w + M - 1, x)) + M] === 1;
  const tall = (x, y) => !cliff(x, y) && !water(x, y) && !path(x, y) && mTall[(Math.max(-M, Math.min(h + M - 1, y)) + M) * W2 + Math.max(-M, Math.min(w + M - 1, x)) + M] === 1;
  // how far into the water a pixel is (to its nearest bank), up to 9
  const depth = (x, y) => { for (let r = 1; r <= 9; r++) for (let a = 0; a < 12; a++){ const dx = Math.round(Math.cos(a * Math.PI / 6) * r), dy = Math.round(Math.sin(a * Math.PI / 6) * r); if (!water(x + dx, y + dy)) return r; } return 10; };

  const G = P.grass, E = P.earth, R = P.rock, A = P.water;
  const img = new Img(w, h);
  const grassAt = (x, y) => { const n = fbm((x + ox) / 30, (y + oy) / 22, 1); return n > .6 ? G[1] : n < .37 ? G[3] : G[2]; };

  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
    const wx = x + ox, wy = y + oy, k = K(x, y);
    let c;
    if (k === 'top'){
      // the rock's top, seen from above: pale, with long cracks, and moss creeping in from its edges
      const n = fbm(wx / 14, wy / 10, 21), crack = Math.abs(fbm(wx / 11, wy / 17, 23) - .5), edge = !cliff(x - 2, y) || !cliff(x + 2, y) || !cliff(x, y - 2) ? .12 : 0;
      c = n > .62 ? R[0] : n < .36 ? R[2] : R[1];
      if (crack < .012) c = R[3];
      const moss = fbm(wx / 7, wy / 6, 25) + edge;
      if (moss > .7) c = moss > .78 ? G[3] : G[4];
      if (K(x, y + 1) === 'face') c = R[0];                              // the lip, catching the light
      else if (!cliff(x + 1, y) || !cliff(x, y + 1)) c = R[5];           // its far edges, in shade
      else if (!cliff(x - 1, y) || !cliff(x, y - 1)) c = R[3];
    } else if (k === 'face'){
      // the cliff's face, as rock is painted in a Chinese landscape: tall facets split by slanting cracks, each lit on
      // its left edge and dark on its right, broken by ledges, paler at the top and deep in shade at its foot
      let y0 = y; while (K(x, y0 - 1) === 'face' && y - y0 < 40) y0--;
      let y1 = y; while (K(x, y1 + 1) === 'face' && y1 - y < 40) y1++;
      const hgt = y1 - y0 + 1, fy = y - y0, v = fy / hgt;
      // the cracks: each starts at its own column and wanders as it goes down; some stop part-way, some start part-way
      const cracks = c0 => { const list = []; for (let cx = c0 - 24; cx < c0 + 24; cx++) if (hash(cx, 7, 3) < .15 && hash(cx - 1, 7, 3) >= .15 && hash(cx - 2, 7, 3) >= .15) list.push(cx); return list; };
      const xAt = (cx, yy) => cx + Math.round((noise(yy / 7, cx * .37, 4) - .5) * 7);
      let dl = 99, dr = 99, left = 0;
      for (const cx of cracks(wx)){
        const from = hash(cx, 2, 6) < .25 ? hgt * .35 : 0, to = hash(cx, 3, 6) < .3 ? hgt * .7 : hgt;
        if (fy < from || fy > to) continue;
        const d = wx - xAt(cx, fy);
        if (d >= 0 && d < dl){ dl = d; left = cx; } if (d < 0 && -d < dr) dr = -d;
      }
      const pale = hash(left, 1, 9) > .55 ? 1 : 0;                               // some facets stand in more light
      const band = v < .3 ? 1 : v < .68 ? 2 : 3;
      c = dl === 0 ? R[6] : dl === 1 ? R[band - 1] : dl === 2 && pale ? R[band] : dr === 1 ? R[band + 2] : R[band + 1 - pale];
      // ledges: a lit lip with its shadow under it, sloping a little, between cracks
      for (const s2 of [11, 12]){
        const ly = 5 + Math.floor(hash(left, s2, 5) * (hgt - 12)) + Math.round((wx - left) * (hash(left, s2, 8) - .5) * .5);
        if (dl > 0 && dr > 0){ if (fy === ly) c = R[Math.max(0, band - 1)]; else if (fy === ly + 1) c = R[band + 3]; else if (fy === ly + 2) c = R[band + 2]; }
      }
      if (hash(wx, wy, 14) > .965 && dl > 1) c = R[band];                         // a grain of light here and there
      if (fy === 0) c = R[1]; else if (fy === 1 && dl > 0) c = R[1 + (dr === 1 ? 2 : 1)];
      if (hgt - fy <= 4 && dl > 0) c = R[Math.min(7, band + 2 + (hgt - fy <= 2 ? 1 : 0))];   // its foot, in its own shade
      // moss hanging from the lip in clumps, and grass standing at its foot
      const clump = fbm(wx / 5, 3, 15), hang = clump > .56 ? Math.round((clump - .56) * 26 + hash(wx, 3, 16) * 2) : 0;
      if (fy < hang) c = fy === hang - 1 ? G[5] : fy === 0 ? G[2] : (wx + y) % 3 ? G[3] : G[4];
      const tuft = fbm(wx / 4, 9, 17), foot = tuft > .5 ? Math.round((tuft - .5) * 14 + hash(wx, 9, 18) * 2) : 0;
      if (hgt - 1 - fy < foot) c = hgt - 1 - fy === foot - 1 ? G[1] : hgt - 1 - fy === 0 ? G[5] : G[3];
      if (!cliff(x - 1, y)) c = R[2]; if (!cliff(x + 1, y)) c = R[6];
    } else if (water(x, y)){
      const d = depth(x, y), flow = tile(Math.floor(wx / T), Math.floor(wy / T)) !== 'O';
      c = d <= 2 ? A[2] : d <= 5 ? A[3] : A[4];
      if (d > 2 && fbm(wx / (flow ? 5 : 16), wy / (flow ? 26 : 7), 31) > .63) c = d <= 5 ? A[2] : A[3];   // the current's lighter streaks
      // the bank above and to the left stands over the water: its earth wall, then its shadow on the water
      if (!water(x, y - 1) || !water(x, y - 2)) c = !water(x, y - 1) ? E[5] : E[6];
      else if (!water(x, y - 3) || !water(x, y - 4) || !water(x - 1, y - 3)) c = A[5];
      else if (!water(x - 1, y)) c = E[6];
      else if (!water(x - 2, y) || !water(x - 3, y - 1)) c = A[5];
      // a broken line of light along the near and right-hand banks
      else if ((!water(x, y + 2) || !water(x + 2, y)) && water(x, y + 1) && water(x + 1, y) && hash(wx >> 1, wy >> 2, 33) > .5) c = A[1];
      else if (d > 3){
        // ripples: short bright dashes
        const ry = Math.floor(wy / 5), rx = Math.floor((wx + ry * 7) / 13), on = hash(rx, ry, 35), len = 2 + Math.floor(hash(rx, ry, 36) * 4), sx = (wx + ry * 7) - rx * 13, sy = wy - ry * 5;
        if (on > .62 && sy === 2 && sx >= 2 && sx < 2 + len) c = sx === 2 + (len >> 1) && len > 3 ? A[0] : A[1];
        else if (on > .62 && sy === 3 && sx >= 3 && sx < 2 + len) c = A[5 - (d <= 5 ? 1 : 0)];
      }
    } else if (path(x, y)){
      const n = fbm(wx / 12, wy / 12, 41);
      c = n > .56 ? E[1] : n < .2 ? E[3] : E[2];
      if (!path(x, y - 1) || !path(x - 1, y)) c = E[4];                                 // the worn track lies a little low: its upper edges in shade
      else if (!path(x, y - 2) || !path(x - 2, y)) c = E[3];
      else if (!path(x, y + 1) || !path(x + 1, y)) c = E[1];
      else {
        const px = Math.floor(wx / 6), py = Math.floor(wy / 6), ph = hash(px, py, 43);   // pebbles, and a scuff here and there
        const sx = wx - px * 6, sy = wy - py * 6;
        if (ph > .82 && sy === 2 && (sx === 2 || sx === 3)) c = E[0];
        else if (ph > .82 && sy === 3 && (sx === 2 || sx === 3)) c = E[4];
        else if (ph < .1 && sy === 4 && sx >= 1 && sx <= 3) c = E[3];
      }
    } else {
      const tl = tall(x, y);
      c = tl ? (fbm(wx / 9, wy / 9, 51) > .55 ? G[4] : G[5]) : grassAt(x, y);
      if (!tl){
        // a rim of light where the grass stands over a path or the water below and to its right; of shade above them
        if (path(x - 1, y) || path(x, y - 1) || water(x - 1, y) || water(x, y - 1)) c = G[1];
        else if (path(x + 1, y) || path(x, y + 1)) c = G[4];
        else if (water(x, y + 1) || water(x + 1, y)) c = G[5];
        else if (tall(x + 1, y) || tall(x, y + 1) || tall(x - 1, y) || tall(x, y - 1)) c = G[3];
        else {
          // blades: little strokes in a darker green, each with a tip in the light, in loose drifts
          const bx = Math.floor(wx / 7), by = Math.floor(wy / 6), bh = hash(bx, by, 53), drift = fbm(wx / 40, wy / 30, 55);
          const sx = wx - bx * 7 - Math.floor(hash(bx, by, 56) * 3), sy = wy - by * 6 - Math.floor(hash(bx, by, 57) * 2);
          if (bh < .16 + (drift > .52 ? .3 : 0)){
            const base = c === G[1] ? 2 : c === G[2] ? 3 : 4;
            if ((sx === 2 && sy === 3) || (sx === 1 && sy === 2) || (sx === 3 && sy === 2)) c = G[base + 1];
            else if (sx === 3 && sy === 1 && bh < .12) c = G[Math.max(0, base - 2)];
          } else if (bh > .975 && sx === 2 && sy === 2) c = P.white;                      // a daisy
          else if (bh > .975 && sx === 2 && sy === 3) c = G[4];
          else if (bh > .955 && bh < .965 && sx === 2 && sy === 2) c = P.gold[1];         // a buttercup
        }
      }
    }
    img.set(x, y, c);
  }

  // ---- shadows on the ground: the cliffs' (a pixel is in shade if rock stands between it and the sun) ----
  const groundShade = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
    if (cliff(x, y)) continue;
    for (let k = 1; k <= 9; k++) if (cliff(x - k, y - Math.round(k * .55))){ groundShade[y * w + x] = 1; break; }
  }

  // ---- everything that stands on the ground, back to front ----
  const things = [];   // {y: its foot's row, draw(img), shadow: [cx, cy, rx, ry]}
  const put = (pic, fx, fy, {shadow, anchor} = {}) => things.push({y: fy, pic, x: fx - (anchor ? anchor[0] : pic.w >> 1), yTop: fy - (anchor ? anchor[1] : pic.h - 1), shadow});
  const sq = (tx, ty) => [tx * T - ox, ty * T - oy];   // a square's top left pixel
  // your stone, the boulders, the sign, the post
  { const [x, y] = sq(9, 1); const b = TH.boulder(26, 21, 4, {mossy: true}); put(b, x + 8, y + 15, {shadow: [x + 13, y + 14, 14, 4]}); }
  { const [x, y] = sq(14, 4); const b = TH.boulder(14, 12, 7); put(b, x + 8, y + 14, {shadow: [x + 11, y + 13, 8, 2.6]}); }
  { const [x, y] = sq(17, 4); const b = TH.boulder(15, 13, 12, {mossy: true}); put(b, x + 8, y + 14, {shadow: [x + 11, y + 13, 8, 2.6]}); }
  { const [x, y] = sq(11, 2); put(TH.SIGN, x + 8, y + 14, {shadow: [x + 11, y + 14, 6, 2]}); }
  { const [x, y] = sq(13, 9); put(TH.POST, x + 8, y + 14, {shadow: [x + 11, y + 14, 6, 2]}); }
  // trees: the one by the pond, and the wood across the river
  { const [x, y] = sq(12, 8); const t = TH.tree(0, 3, P.leaf.slice(1), true); put(t.img, x + 8, y + 15, {anchor: t.foot, shadow: [x + 13, y + 15, 9, 3]}); }
  for (let r = 0; r <= 6; r++) for (const cx of [20, 21]){
    if (tile(cx, r) !== 'Y') continue;
    const [x, y] = sq(cx, r), s = (r + cx) % 3, t = TH.tree(s, r * 5 + cx, P.leaf.slice(1));
    put(t.img, x + 8 + ((r * 7 + cx * 3) % 5) - 2, y + 15, {anchor: t.foot, shadow: [x + 15, y + 15, 11, 4]});
  }
  // flowers
  { const [x, y] = sq(11, 7); put(TH.flowers(2, P.red[1], P.red[2]), x + 8, y + 15); }
  { const [x, y] = sq(17, 2); put(TH.flowers(5, P.white, hex('#E6DCC6')), x + 8, y + 15); }
  { const [x, y] = sq(17, 9); put(TH.flowers(9, P.white, hex('#E6DCC6')), x + 8, y + 15); }
  // tall grass: tufts in staggered rows wherever the mask says tall
  for (let ty = -8; ty < h + 8; ty += 6) for (let tx = -8 + ((ty / 6 | 0) % 2 ? 5 : 0); tx < w + 8; tx += 10){
    const jx = tx + Math.floor(hash(tx, ty, 61) * 3) - 1, jy = ty + Math.floor(hash(tx, ty, 62) * 2);
    if (tall(jx, jy - 1) && tall(jx + 4, jy - 2) && tall(jx - 4, jy - 2)) put(TH.TUFTS[hash(tx, ty, 63) > .5 ? 1 : 0], jx, jy);
  }
  // the troop, and you
  const who = [];
  const person = (id, tx, ty, dir, opts) => { const [x, y] = sq(tx, ty); const pic = monkey(id, dir, opts); put(pic, x + 8, y + 15, {shadow: [x + 9, y + 15, 5.5, 2]}); who.push({id, x, y}); };
  for (const [id, tx, ty, dir] of cast) person(id, tx, ty, dir, id === 'player' ? {band} : {});
  // the rocks across the path, till the troop rolls them away
  if (!gate){ const [x, y] = sq(15, 4); const b = TH.boulder(19, 15, 21, {mossy: true}), b2 = TH.boulder(16, 13, 23); put(b, x + 9, y + 14, {shadow: [x + 13, y + 13, 10, 3]}); put(b2, x + 25, y + 15, {shadow: [x + 28, y + 14, 8, 2.6]}); }

  // shadows first (the cliffs', then each thing's), so nothing's shadow falls over a thing
  const sh = groundShade.slice();
  for (const t of things) if (t.shadow){ const [cx, cy, rx, ry] = t.shadow; for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) if (x >= 0 && y >= 0 && x < w && y < h && ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1 && !cliff(x, y)) sh[y * w + x] = 1; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (sh[y * w + x]) shadePx(img, x, y, .62);

  // lily pads and a fish, on the pond
  { const [x, y] = sq(10, 10); img.blit(TH.LILY, x + 9, y + 6); img.blit(TH.LILY_BUD, x + 30, y + 13); img.blit(TH.LILY, x - 6, y + 18); img.blit(TH.KOI, x + 16, y - 6); }

  things.sort((a, b) => a.y - b.y);
  for (const t of things) img.blit(t.pic, t.x, t.yTop);

  if (marks){
    const over1 = (tx, ty, ch) => { const [x, y] = sq(tx, ty); img.blit(TH.mark(ch), x + 10, y - 11); };
    for (const [tx, ty, ch] of over) over1(tx, ty, ch);
    if (hint){ const [x, y] = sq(hint[0], hint[1]); img.blit(TH.A_HINT, x + 16, y + 1); }
  }

  // ---- the light of the hour, over everything ----
  if (mood === 'dusk') for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){ const o = (y * w + x) * 4, d = img.d; d[o] = Math.min(255, d[o] * 1.08 + 14); d[o + 1] = d[o + 1] * .88 + 4; d[o + 2] = d[o + 2] * .74 + 18; }
  if (mood === 'night') for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){ const o = (y * w + x) * 4, d = img.d; d[o] = d[o] * .38 + 8; d[o + 1] = d[o + 1] * .5 + 18; d[o + 2] = d[o + 2] * .66 + 44; }
  return img;
}
module.exports = {meadow, MAP};
