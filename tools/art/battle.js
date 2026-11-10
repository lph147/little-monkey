// The scene beside an animal's questions and a fight: the meadow as a painted backdrop, the creature on its patch of
// grass, and your monkey from behind in the foreground, drawn properly (today it's the map sprite blown up).
const path = require('path');
const {Img, P, hex, mix, hash, noise, fbm, sprite} = require('./core.js');
const {lit, tone, outline, TUFTS} = require('./things.js');
const {along, dither} = require('./title.js');

const FUR = ['#FCE7A6', '#F6D27A', '#EBB85C', '#E3A548', '#C98A3C', '#B07036', '#8C5634', '#643C30', '#4B2A2A'].map(hex);
const SKIN = ['#FCE4C2', '#EDBE96', '#D49A78'].map(hex);
const RED = P.red;

// a shaded, outlined ball of fur (or anything with a ramp), on its own layer, then onto img
function ball(img, cx, cy, rx, ry, ramp, {steps = [.8, .55, .28, .02, -.24, -.5], from = 0, edge = ramp[ramp.length - 1], tilt = 0} = {}){
  const lay = new Img(img.w, img.h);
  for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++){
    const nx = (x - cx) / rx, ny = (y - cy) / ry; if (nx * nx + ny * ny > 1) continue;
    lay.set(x, y, tone(ramp, lit(nx * .92, ny * .92) + (hash(x, y, 7) - .5) * .1 + tilt, steps, from));
  }
  outline(lay, edge); img.blit(lay, 0, 0); return img;
}
// a thick shaded line through pts (a tail, an arm): r its half-width
function limb(img, pts, r, ramp, {steps = [.7, .35, 0, -.3], from = 1, edge = ramp[ramp.length - 1]} = {}){
  const lay = new Img(img.w, img.h);
  for (let i = 0; i < pts.length - 1; i++){
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
    for (let k = 0; k <= n; k++){
      const cx = x0 + (x1 - x0) * k / n, cy = y0 + (y1 - y0) * k / n, rr = typeof r === 'function' ? r((i + k / n) / (pts.length - 1)) : r;
      for (let y = Math.floor(cy - rr); y <= cy + rr; y++) for (let x = Math.floor(cx - rr); x <= cx + rr; x++){
        const nx = (x - cx) / rr, ny = (y - cy) / rr; if (nx * nx + ny * ny > 1) continue;
        lay.set(x, y, tone(ramp, lit(nx * .9, ny * .9), steps, from));
      }
    }
  }
  outline(lay, edge); img.blit(lay, 0, 0); return img;
}

// Your monkey from behind, head and shoulders and more: 54 x 58. stick: holding its stick up, ready.
function heroBack({stick = false, band = true} = {}){
  const img = new Img(56, 60), O = FUR[8];
  // its tail, curling up on the left
  limb(img, [[19, 50], [11, 51], [6, 46], [5, 39], [8, 34], [12, 35]], t => 2.6 - t * .9, FUR, {from: 3});
  // the stick, behind its right shoulder
  if (stick){
    const lay = new Img(img.w, img.h);
    for (let k = 0; k <= 60; k++){ const x = 45 + k * 6 / 60, y = 58 - k * 54 / 60; lay.set(Math.round(x), Math.round(y), P.wood[1]); lay.set(Math.round(x) + 1, Math.round(y), P.wood[3]); if (k % 9 === 4) lay.set(Math.round(x), Math.round(y), P.wood[0]); }
    outline(lay, P.wood[6]); img.blit(lay, 0, 0);
  }
  // body and arms
  ball(img, 27, 49, 13.5, 14, FUR, {from: 2});
  limb(img, [[15, 41], [11, 47], [11, 55]], 3.6, FUR, {from: 3});
  if (stick) limb(img, [[39, 41], [44, 37], [47, 31]], 3.4, FUR, {from: 3}); else limb(img, [[39, 41], [43, 47], [43, 55]], 3.6, FUR, {from: 3});
  if (stick){ ball(img, 47.5, 29.5, 3.2, 3.2, SKIN, {steps: [.4, -.1], edge: O}); }
  // ears, their pink insides just showing at the edges
  for (const [ex, s] of [[10.5, -1], [43.5, 1]]){
    ball(img, ex, 23, 5.2, 6, FUR, {from: 3});
    for (let y = 20; y <= 26; y++) img.set(Math.round(ex + s * 2.4), y, y === 20 || y === 26 ? SKIN[2] : SKIN[1]);
  }
  // head
  ball(img, 27, 20, 14.5, 13, FUR, {from: 1});
  // tufts on its crown, and the nape's shade where the head sits on the shoulders
  for (const [x, y] of [[24, 6], [27, 5], [30, 6]]){ img.set(x, y, FUR[2]); img.set(x, y - 1, O); }
  for (let x = 17; x <= 37; x++){ const y = 33 + Math.round(Math.abs(x - 27) / 10 * -1.5); if (img.get(x, y)[3]) img.set(x, y, FUR[7]); if (img.get(x, y + 1)[3] && x > 19 && x < 35) img.set(x, y + 1, FUR[6]); }
  // strokes of fur down its back
  for (const [x, y, n] of [[22, 42, 4], [28, 44, 5], [33, 41, 4], [25, 50, 4], [31, 51, 3]]) for (let k = 0; k < n; k++) if (img.get(x + (k > 1 ? 1 : 0), y + k)[3]) img.set(x + (k > 1 ? 1 : 0), y + k, FUR[6]);
  for (const [x, y, n] of [[20, 40, 3], [26, 41, 3], [30, 47, 3]]) for (let k = 0; k < n; k++) if (img.get(x, y + k)[3]) img.set(x, y + k, FUR[2]);
  // the red headband: round the back of its head, knotted, its ends flying
  if (band){
    for (let x = 13; x <= 41; x++){
      const nx = (x - 27) / 14.5, y = Math.round(14.5 - Math.sqrt(Math.max(0, 1 - nx * nx)) * 2.2 + 2.2);
      if (!img.get(x, y)[3]) continue;
      img.set(x, y, x < 20 ? RED[1] : x > 36 ? RED[3] : RED[2]); img.set(x, y + 1, x > 34 ? RED[4] : RED[3]); if (img.get(x, y - 1)[3]) img.set(x, y - 1, x < 30 ? RED[1] : RED[2]);
    }
    const knot = sprite(['.oo....', 'oRro...', 'orRRoo.', '.oRrRro', '..orRRo', '.orRoo.', '.orro..', '..oo...'], {o: RED[5], r: RED[2], R: RED[3]});
    img.blit(knot, 30, 13);
  }
  return img;
}

// The backdrop: 88 x 146. kind: 'meadow'. Returns the picture and where the creature stands (its feet's middle).
function backdrop({w = 88, h = 146} = {}){
  const img = new Img(w, h), HZ = 58;
  const SKY = ['#8CC4E0', '#A6D4E6', '#C2E2E6', '#DCEEDD', '#F2F1CF'].map(hex);
  for (let y = 0; y < HZ + 4; y++) for (let x = 0; x < w; x++) img.set(x, y, along(SKY, Math.pow(y / HZ, 1.1), x, y, .5));
  // a cloud or two
  const cloud = (cx, cy, len, c1, c2) => { for (let i = 0; i < 5; i++){ const px = cx - len / 2 + (i + .5) * len / 5, r = 3 + hash(i, cx, 3) * 3 + (2 - Math.abs(i - 2)); for (let y = -8; y <= 0; y++) for (let x = -8; x <= 8; x++) if (x * x + (y * 1.5) * (y * 1.5) <= r * r) img.set(Math.round(px + x), cy + y, y > -2 ? c2 : c1); } };
  cloud(20, 18, 30, hex('#FFFBEE'), hex('#E2EEF0')); cloud(70, 30, 22, hex('#FFFBEE'), hex('#DCEAEC'));
  // far mountains, in haze: steep, as the peaks of a Chinese landscape
  const range = (seed, base, amp, c1, c2) => { for (let x = 0; x < w; x++){
    const r = 1 - Math.abs(2 * fbm(x / 19, seed, 5) - 1), top = Math.round(base - amp * Math.pow(r, 1.4) - (hash(Math.floor(x / 3), seed, 6) > .7 ? 1 : 0));
    for (let y = top; y < HZ + 2; y++) img.set(x, y, along([c1, c2], (y - top) / (HZ + 2 - top) * 1.3 - .15, x, y, .7)); } };
  range(3, 50, 30, hex('#9CC3CE'), hex('#D3E6DC')); range(8, 54, 20, hex('#74A9AC'), hex('#BBD9C8'));
  // the wood's edge: rounded crowns in a dark line
  for (let x = -4; x < w + 4; x += 5){ const r = 4 + hash(x, 1, 9) * 3, cy = HZ - 1 - hash(x, 2, 9) * 2; for (let y = -8; y <= 4; y++) for (let dx = -8; dx <= 8; dx++) if (dx * dx + (y * 1.2) * (y * 1.2) <= r * r) img.set(x + dx, Math.round(cy + y), y < -r / 2 && dx < 1 ? P.leaf[3] : y > 1 ? P.leaf[6] : P.leaf[4 + (dx > 1 ? 1 : 0)]); }
  // the meadow, coming towards you: paler far off, richer near, in long soft bands
  const G = P.grass;
  for (let y = HZ + 3; y < h; y++) for (let x = 0; x < w; x++){
    const k = (y - HZ) / (h - HZ), n = fbm(x / (10 + k * 26), y / (2.5 + k * 9), 11);
    img.set(x, y, along([G[1], G[2], G[3], G[4]], k * .62 + (n - .5) * .5 + .08, x, y, .35));
  }
  // blades and a few flowers, bigger the nearer they are
  for (let i = 0; i < 150; i++){
    const y = HZ + 6 + Math.floor(Math.pow(hash(i, 1, 13), .8) * (h - HZ - 8)), x = Math.floor(hash(i, 2, 13) * w), k = (y - HZ) / (h - HZ), len = 1 + Math.round(k * 3.4);
    const dark = G[Math.min(6, 3 + Math.round(k * 2.4))], tip = G[k > .5 ? 1 : 0];
    for (let j = 0; j < len; j++) img.set(x, y - j, dark);
    if (len > 1){ img.set(x - 1, y - len + 1, dark); img.set(x + 1, y - len, tip); }
    if (hash(i, 3, 13) > .9){ const c = hash(i, 4, 13) > .5 ? P.white : hex('#F4A6B4'); img.set(x + 2, y - 1, c); if (k > .4){ img.set(x + 3, y - 1, c); img.set(x + 2, y - 2, c); img.set(x + 2, y, P.gold[1]); } }
  }
  // the creature's patch of ground: brighter grass in the sun, with its shadow
  const cx = 52, cy = 96;
  for (let y = cy - 9; y <= cy + 9; y++) for (let x = cx - 30; x <= cx + 30; x++){
    const d = ((x - cx) / 29) ** 2 + ((y - cy) / 8) ** 2;
    if (d <= 1) img.set(x, y, d > .8 ? (y > cy ? G[4] : G[2]) : along([G[0], G[1]], d * 1.1 + (fbm(x / 6, y / 3, 15) - .5) * .5, x, y, .6));
  }
  for (let y = cy - 3; y <= cy + 3; y++) for (let x = cx - 13; x <= cx + 17; x++) if (((x - cx - 2) / 15) ** 2 + ((y - cy) / 3) ** 2 <= 1) img.set(x, y, G[4]);
  for (const [tx, ty, k] of [[cx - 27, cy + 2, 0], [cx + 22, cy + 5, 1], [cx - 12, cy + 9, 1], [cx + 8, cy + 10, 0]]) img.blit(TUFTS[k], tx, ty - 7);
  return {img, stand: [cx, cy + 1]};
}

// the whole scene: the backdrop, the creature's picture (a 32 x 32 word picture from the game) and your monkey
function scene(creature, {stick = false} = {}){
  const {img, stand} = backdrop();
  if (creature) img.blit(creature, stand[0] - (creature.w >> 1), stand[1] - creature.h + 3);
  const hero = heroBack({stick});
  // its shadow on the grass, then the monkey, bottom left, half out of the picture as today
  for (let y = 138; y < 146; y++) for (let x = 0; x < 50; x++) if (((x - 24) / 26) ** 2 + ((y - 146) / 9) ** 2 <= 1) img.set(x, y, P.grass[5]);
  img.blit(hero, -4, 92);
  return img;
}
module.exports = {heroBack, backdrop, scene};
