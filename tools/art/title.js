// The title screen's picture: Flower Fruit Mountain rising out of the sea at first light, the stone on its summit and
// the little monkey on the stone, against the rising sun. 240 x 160, the game's screen.
const path = require('path');
const {Img, P, hex, mix, hash, noise, fbm, sprite} = require('./core.js');

const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const dither = (x, y, t) => t > (BAYER[y & 3][x & 3] + .5) / 16;   // true for the part t of the pixels, in a tidy pattern
// a colour from a ramp at t (0..1 along it): flat bands, dithered only where two meet (soft: how wide that is)
const along = (ramp, t, x, y, soft = .3) => {
  const f = Math.max(0, Math.min(.9999, t)) * (ramp.length - 1), i = Math.floor(f), k = f - i, a = .5 - soft / 2;
  return (k < a ? false : k > 1 - a ? true : dither(x, y, (k - a) / soft)) ? ramp[i + 1] : ramp[i];
};
const ridged = (u, v, s) => 1 - Math.abs(2 * fbm(u, v, s) - 1);
const sstep = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

function title({w = 240, h = 160} = {}){
  const img = new Img(w, h), HZ = 113;   // the horizon's row
  const SKY = ['#1F2A5E', '#2B3A78', '#3F5296', '#5D6FAE', '#8B88BA', '#BC9AB4', '#E3AC9F', '#F6C795', '#FCE0A6', '#FFF1C4'].map(hex);
  const sunX = 160, sunY = 50;
  // ---- the sky: night still at the top, gold at the horizon; the light spreads from the sun ----
  for (let y = 0; y < HZ; y++) for (let x = 0; x < w; x++){
    const d = Math.hypot(x - sunX, (y - sunY) * 1.15), glow = Math.max(0, 1 - d / 120);
    img.set(x, y, along(SKY, Math.pow(y / HZ, 1.25) * .82 + glow * glow * .34, x, y));
  }
  // the last stars
  for (let i = 0; i < 46; i++){ const x = Math.floor(hash(i, 1, 71) * w), y = Math.floor(hash(i, 2, 71) * 46); if (Math.hypot(x - sunX, y - sunY) > 64) img.set(x, y, hash(i, 3, 71) > .7 ? hex('#FFF6D8') : hex('#9FA6D6')); }
  // ---- the sun: a pale disc with a soft rim ----
  for (let y = 0; y < HZ; y++) for (let x = 0; x < w; x++){
    const d = Math.hypot(x - sunX, y - sunY);
    if (d < 25) img.set(x, y, d < 23.2 ? hex('#FFF8DC') : hex('#FFEFB8'));
    else if (d < 28 && dither(x, y, .5)) img.set(x, y, hex('#FFEFB8'));
  }
  // ---- clouds: long flat wisps, gold underneath where the sun catches them ----
  const cloud = (cx, cy, len, puffs, body, under, top) => {
    for (let i = 0; i < puffs; i++){
      const px = cx - len / 2 + (i + .5) * len / puffs + (hash(i, cx, 73) - .5) * 4, r = 3 + hash(i, cy, 74) * 3.2 + (1 - Math.abs(i - (puffs - 1) / 2) / puffs * 2) * 2;
      for (let y = -8; y <= 1; y++) for (let x = -9; x <= 9; x++) if (x * x + (y * 1.5) * (y * 1.5) <= r * r) img.set(Math.round(px + x), cy + y, y >= 0 ? under : y < -r / 1.5 + 1.2 ? top : body);
    }
    for (let x = -len / 2 - 6; x < len / 2 + 6; x++) if (Math.abs(x) < len / 2 + 2 || (Math.round(x) & 1)) img.set(Math.round(cx + x), cy + 1, under);
  };
  cloud(58, 76, 62, 7, hex('#C9A2BC'), hex('#F6C795'), hex('#DDB4C0'));
  cloud(222, 44, 44, 5, hex('#A493BE'), hex('#E3AC9F'), hex('#BC9AB4'));
  cloud(20, 97, 40, 5, hex('#E3AC9F'), hex('#FCE0A6'), hex('#EEC0AC'));
  cloud(104, 26, 30, 4, hex('#5D6FAE'), hex('#8B88BA'), hex('#7078B2'));

  // ---- far hills, pale in the morning haze ----
  const far = (seed, base, amp, c1, c2, from, to) => { for (let x = from; x < to; x++){
    const top = Math.round(base - amp * (.3 + .7 * Math.pow(ridged(x / 34, seed, 81), 1.6)) * Math.pow(Math.sin(Math.PI * (x - from) / (to - from)), .6));
    for (let y = top; y < HZ; y++) img.set(x, y, along([c1, c2], (y - top) / (HZ - top) * 1.2 - .1, x, y, .8)); } };
  far(2, 104, 26, hex('#A493BE'), hex('#E3AC9F'), -10, 92);
  far(5, 108, 20, hex('#9486B6'), hex('#D9A8A8'), 196, 262);
  far(9, 110, 12, hex('#8478B0'), hex('#BC9AB4'), 28, 130);

  // ---- the sea ----
  const SEA = ['#F6C795', '#DDB0A6', '#A996B4', '#6F87B4', '#3F74A4', '#2B5C92', '#22467C', '#1C3566'].map(hex);
  for (let y = HZ; y < h; y++) for (let x = 0; x < w; x++){
    const t = Math.pow((y - HZ) / (h - HZ), .62);
    img.set(x, y, along(SEA, t * .96 + (fbm(x / 30, y / 3, 85) - .5) * .1, x, y, .5));
  }
  // the sun's road on the water, and the swell's glints
  for (let y = HZ + 1; y < h; y++){
    const k = (y - HZ) / (h - HZ), half = 5 + k * 26;
    for (let x = 0; x < w; x++){
      const dx = Math.abs(x - sunX), row = hash(y, Math.floor((x + y * 3) / (3 + k * 9)), 87);
      if (dx < half && row > .34 + dx / half * .5) img.set(x, y, row > .8 ? hex('#FFF8DC') : k < .25 ? hex('#FFEFB8') : hex('#F8D28E'));
      else if (row > .93 && y % 2 === 0) img.set(x, y, k < .3 ? hex('#DDB0A6') : hex('#5D8CBC'));
    }
  }

  // ---- the mountain: steep peaks crowding up to one summit, drawn from a height map, front to back ----
  const PEAKS = [   // [u, v, radius across, radius deep, height]
    [158, 36, 25, 14, 78], [137, 33, 19, 12, 58], [180, 33, 19, 12, 52], [119, 29, 17, 11, 41], [198, 29, 16, 10, 37],
    [102, 25, 15, 9, 27], [214, 25, 13, 9, 24], [147, 17, 19, 9, 31], [172, 15, 17, 8, 26], [125, 15, 15, 7, 18], [195, 15, 15, 7, 16]];
  const H = (u, v) => {
    let best = 0;
    for (const [pu, pv, ru, rv, a] of PEAKS){
      const lean = (hash(pu, pv, 90) - .5) * 5;                                   // each peak leans its own way
      const d = Math.hypot((u - pu - lean * (1 - Math.min(1, Math.abs(v - pv) / rv))) / ru, (v - pv) / rv); if (d >= 1) continue;
      const shape = .7 * sstep((1 - d) / .55) + .3 * (1 - d);                     // a wall round a rounded top
      const crag = .78 + .22 * ridged(u / 7 + pu * .3, v / 38 + pv, 91) + .08 * (ridged(u / 3.2, v / 12, 93) - .5);   // ribs running down it
      best = Math.max(best, a * shape * crag);
    }
    const skirt = Math.max(0, 1 - Math.hypot((u - 158) / 88, (v - 24) / 25));     // the island's low shore round them
    return Math.max(best, skirt * 11 * (.55 + .45 * ridged(u / 14, v / 9, 95)));
  };
  const ROCK = ['#FFF1C4', '#F8DDAE', '#E6BE9C', '#C29A92', '#967C8E', '#6B6084', '#4A446E', '#302E58'].map(hex);
  const WOOD = ['#F2E690', '#C3D272', '#8EB864', '#5F9A5E', '#3F7D5A', '#2D6258', '#234A52', '#1B364A'].map(hex);
  const yb = 133, kv = .42, ymin = new Int16Array(w).fill(h), land = new Uint8Array(w * h);
  const Lx = .74, Ly = .52, Lz = -.42;   // the light: low, from the right, a little behind you
  for (let vi = 0; vi <= 62 * 2; vi++){
    const v = vi / 2;
    for (let x = 0; x < w; x++){
      const hh = H(x, v), sea = Math.round(yb - v * kv);
      if (hh <= .5){ if (sea < ymin[x]) ymin[x] = sea; continue; }
      const sy = Math.round(yb - v * kv - hh);
      if (sy >= ymin[x]) continue;
      const du = H(x + 1, v) - H(x - 1, v), dv = H(x, v + 1) - H(x, v - 1), nl = Math.hypot(-du * .5, 1, -dv * .5);
      const l = (-du * .5 * Lx + Ly + -dv * .5 * Lz) / nl;                        // how much light this slope gets
      const run = ymin[x] - sy, steep = Math.hypot(du, dv) * .5;
      // a long drop is a rock face; a gentle rise is wooded
      const rocky = (run > 2 || steep > 1.5) && fbm(x / 9, v / 6, 97) > .22 && hh > 13;
      for (let y = sy; y < ymin[x]; y++){
        const tex = rocky ? (ridged(x / 3.5, y / 14, 98) - .5) * .3 + (hash(x, y, 99) - .5) * .08 : (hash(x >> 1, y, 99) - .5) * .34 + (y === sy ? .12 : 0);
        const t = 1 - Math.max(0, Math.min(1, (l + tex - .04) / .9));
        img.set(x, y, along(rocky ? ROCK : WOOD, (rocky ? .08 : .12) + t * .84, x, y, .4)); land[y * w + x] = 1;
      }
      ymin[x] = sy;
    }
  }
  // the waterfall: a white ribbon down a cliff at the mountain's front, into its own mist
  { const fx = 163;
    for (let yy = 92; yy < 127; yy++){ const wob = Math.round(Math.sin(yy / 6) * .8); if (!land[yy * w + fx]) continue; img.set(fx + wob, yy, hex('#FFFBEE')); img.set(fx + wob + 1, yy, yy % 3 ? hex('#DDF0EE') : hex('#FFFBEE')); if (yy % 5 === 0) img.set(fx + wob - 1, yy, hex('#BFE0E6')); }
    for (let i = 0; i < 30; i++){ const a2 = hash(i, 1, 101) * 6.28, r = hash(i, 2, 101) * 6; img.set(Math.round(fx + 1 + Math.cos(a2) * r * 1.7), Math.round(127 + Math.sin(a2) * r * .45), hash(i, 3, 101) > .45 ? hex('#FFFBEE') : hex('#E6E4EC')); } }
  // mist lying round the mountain's foot and across its shoulders: flat bands with ragged ends
  const mist = (cy, half, from, to, c1, c2) => { for (let y = cy - half; y <= cy + half; y++){
    const k = 1 - Math.abs(y - cy) / (half + .5), a0 = from + (1 - k) * 16 + (hash(y, cy, 105) - .5) * 14, b0 = to - (1 - k) * 16 + (hash(y, cy, 106) - .5) * 14;
    for (let x = Math.round(a0); x < b0; x++) if (fbm(x / 16, y / 2 + cy, 103) > .3 + (1 - k) * .22) img.set(x, y, y < cy ? c1 : c2); } };
  mist(131, 3, 74, 246, hex('#FFF1D8'), hex('#F6D9BE')); mist(112, 2, 96, 152, hex('#FCE6C8'), hex('#EFC9B4')); mist(104, 2, 176, 226, hex('#F6D9BE'), hex('#E3B6AC'));
  mist(120, 2, 150, 214, hex('#FFF1D8'), hex('#F6D9BE'));

  // ---- the summit: the stone, and the little monkey on it, dark against the sun, edged with its light ----
  let sx = 158; for (let x = 150; x < 168; x++) if (ymin[x] < ymin[sx]) sx = x;
  const sy = ymin[sx];
  const STONE = sprite(['..ooooo..', '.oLLMMMo.', 'oLMMMMDDo', 'oMMMDDDDo', '.oDDDDDo.'], {o: hex('#302E58'), L: hex('#F8DDAE'), M: hex('#967C8E'), D: hex('#4A446E')});
  img.blit(STONE, sx - 4, sy - 3);
  // sitting, looking out at the sunrise, its tail hanging down the stone
  const MONKEY = sprite([
    '...oooo....',
    '..oHHffo...',
    '.ooHffffoo.',
    'oHoffffdoHo',
    'ooofffddooo',
    '..oofddoo..',
    '..oHffddo..',
    '.oHfffdddo.',
    '.offfffddo.',
    '.offfffddo.',
    '..oooooodo.',
    '........odo',
    '........odo',
    '.......oo..'], {o: hex('#33203A'), H: hex('#FFE9A8'), f: hex('#9A6240'), d: hex('#65403C')});
  img.blit(MONKEY, sx - 5, sy - 13);
  // birds, far off
  for (const [bx, by] of [[196, 30], [204, 26], [189, 23], [70, 52]]) for (const [dx, dy] of [[0, 0], [-1, -1], [1, -1], [-2, -1], [2, -1]]) img.set(bx + dx, by + dy, hex('#33203A'));

  // a darker foot to the picture, in steps, so the buttons over it read
  for (let y = h - 30; y < h; y++) for (let x = 0; x < w; x++){ const k = Math.floor((y - (h - 30)) / 6) / 5 * .34, o = (y * w + x) * 4; img.d[o] *= 1 - k; img.d[o + 1] *= 1 - k * .9; img.d[o + 2] *= 1 - k * .6; }
  return img;
}
module.exports = {title, along, dither};
