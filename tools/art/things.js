// The things that stand on the map, each drawn from shaded shapes: boulders, trees, the sign, the practice post,
// flowers, tall grass, speech marks. Everything is lit from the top left.
const {Img, P, hex, mix, hash, noise, fbm, sprite, inEllipse} = require('./core.js');

const L = (() => { const v = [-.55, -.62, .56], n = Math.hypot(...v); return v.map(c => c / n); })();   // the light
// how much light falls on a rounded shape at (nx, ny), -1..1 across it
const lit = (nx, ny) => { const z = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)); return nx * L[0] + ny * L[1] + z * L[2]; };
// a tone from a ramp for that much light: steps[i] is the least light for tone i
const tone = (ramp, l, steps, from = 0) => { for (let i = 0; i < steps.length; i++) if (l >= steps[i]) return ramp[from + i]; return ramp[Math.min(ramp.length - 1, from + steps.length)]; };

// Outline a picture: every empty pixel beside a painted one gets the outline's colour (a dark of what it touches,
// given by pick(x, y, neighbour colour)), on the shaded side only if lightSide is false.
function outline(img, colour, {skipTop = false} = {}){
  const add = [];
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++){
    if (img.get(x, y)[3]) continue;
    const near = [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx, dy]) => img.get(x + dx, y + dy)[3]);
    if (!near) continue;
    if (skipTop && !img.get(x, y + 1)[3] && !img.get(x + 1, y)[3] && !img.get(x - 1, y)[3]) continue;
    add.push([x, y]);
  }
  for (const [x, y] of add) img.set(x, y, typeof colour === 'function' ? colour(x, y) : colour);
  return img;
}

// ---- a boulder: w x h pixels of rock, with a crack or two and moss on top if mossy ----
function boulder(w, h, seed = 1, {mossy = false, ramp = P.rock} = {}){
  const img = new Img(w + 2, h + 2), cx = w / 2 + .5, cy = h / 2 + 1, rx = w / 2, ry = h / 2;
  for (let y = 0; y < h + 2; y++) for (let x = 0; x < w + 2; x++){
    // a lumpy outline: the radius wobbles a little round the stone
    const a = Math.atan2(y - cy, x - cx), wob = 1 + (noise(Math.cos(a) * 1.6 + seed * 9, Math.sin(a) * 1.6 + seed * 3) - .5) * .22;
    const nx = (x - cx) / (rx * wob), ny = (y - cy) / (ry * wob);
    if (nx * nx + ny * ny > 1) continue;
    const flat = ny > .55 ? .25 : 0;   // its foot is in its own shade
    const l = lit(nx * .9, ny * .9) - flat + (noise(x / 3 + seed, y / 3) - .5) * .18;
    img.set(x, y, tone(ramp, l, [.82, .56, .3, .02, -.3], 0));
  }
  // cracks: short dark lines with a light edge under them
  for (let k = 0; k < Math.max(1, w / 9 | 0); k++){
    let x = cx + (hash(seed, k, 3) - .5) * rx, y = cy - ry * .2 + (hash(seed, k, 4) - .5) * ry * .6;
    for (let i = 0; i < 3 + (hash(seed, k, 5) * 3 | 0); i++){
      if (img.get(x | 0, y | 0)[3]) img.set(x | 0, y | 0, ramp[5]);
      x += hash(seed, k * 7 + i, 6) > .5 ? 1 : 0; y += 1;
    }
  }
  if (mossy) for (let y = 0; y < h * .45; y++) for (let x = 0; x < w + 2; x++){
    if (!img.get(x, y)[3]) continue;
    const m = fbm(x / 4 + seed * 5, y / 3, 9) + (1 - y / (h * .45)) * .25;
    if (m > .68) img.set(x, y, m > .8 ? P.grass[2] : P.grass[4]);
  }
  return outline(img, (x, y) => (y > cy || x > cx + rx * .3) ? ramp[7] : ramp[6]);
}

// ---- a tree's leaves: broad flat layers, as in a Chinese painting (the game's idea, kept), lit and shaded ----
// lobes: [cx, cy, rx, ry] each, drawn back to front on a w x h picture.
function leaves(w, h, lobes, ramp = P.leaf, seed = 1){
  const img = new Img(w, h);
  lobes.forEach(([cx, cy, rx, ry], li) => {
    const layer = new Img(w, h), base = cy + ry * .42;   // each layer is flat underneath
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
      const nx = (x - cx) / rx, ny = (y - cy) / ry;
      // a scalloped foot and a bumpy top
      const bump = (noise(x / 2.6 + seed * 3 + li, 0, 5) - .5) * .28, foot = base + Math.round(Math.sin(x * 1.25 + li * 2) * .9 + .5);
      if (nx * nx + ny * ny > 1 + bump || y > foot) continue;
      const under = foot - y;   // how far above its foot
      let l = lit(nx * .85, Math.max(-1, ny * 1.15 - .1)) + (noise(x / 2.2 + li * 4, y / 2.2 + seed, 2) - .5) * .34;
      if (under < 1.5) l = -.6; else if (under < 3) l -= .35;
      layer.set(x, y, tone(ramp, l, [.86, .62, .34, .06, -.24], 0));
    }
    outline(layer, (x, y) => y > cy ? ramp[7] : ramp[6]);
    img.blit(layer, 0, 0);
  });
  return img;
}
// a trunk w wide and h tall, leaning lean pixels to the right at its top
function trunk(w, h, lean = 0, ramp = P.wood){
  const img = new Img(w + Math.abs(lean) + 4, h + 1);
  for (let y = 0; y < h; y++){
    const t = 1 - y / (h - 1), off = Math.round(lean * t * t) + (lean < 0 ? -lean : 0) + 1, ww = w + (y > h - 3 ? 1 : 0) + (y === h - 1 ? 1 : 0);
    for (let x = 0; x < ww; x++) img.set(off + x - (y > h - 3 ? 1 : 0) + (y > h - 3 ? 0 : 0), y, x === 0 ? ramp[2] : x >= ww - 1 ? ramp[5] : x === 1 && ww > 3 ? ramp[3] : ramp[4]);
  }
  return outline(img, ramp[6]);
}
// A broad-leaved tree, about 30 x 36: shape 0, 1 or 2 (each lopsided its own way). Returns {img, foot: [x, y]}: the
// pixel of the picture that stands on the middle of the bottom of its square.
function tree(shape = 0, seed = 1, ramp = P.leaf, small = false){
  const S = [
    {lobes: [[18, 20, 11, 6.5], [9, 14, 8.5, 6.5], [18, 9, 10, 7]], lean: 1},
    {lobes: [[11, 20, 10, 6], [21, 15, 8.5, 6.5], [12, 9, 10, 7]], lean: -1},
    {lobes: [[15, 21, 12, 6], [21, 13, 8.5, 6.5], [10, 10, 9, 7]], lean: 0},
  ][shape % 3];
  if (small){   // a young tree, one square's worth: about 23 x 28
    const img = new Img(23, 29), tr = trunk(3, 9, S.lean);
    img.blit(tr, 11 - (tr.w >> 1) + 1, 19);
    img.blit(leaves(23, 22, [[13, 15, 8.5, 5], [7, 11, 6.5, 4.5], [13, 6, 7.5, 5]], ramp, seed), 0, 0);
    return {img, foot: [11, 27]};
  }
  const img = new Img(31, 37), tr = trunk(4, 12, S.lean);
  img.blit(tr, 15 - (tr.w >> 1) + 1, 24);
  img.blit(leaves(31, 30, S.lobes, ramp, seed), 0, 0);
  return {img, foot: [15, 35]};
}
// A pine, about 22 x 40: tiers of needles, each a flat dark wedge with a lit upper edge.
function pine(seed = 1, tall = 38){
  const w = 23, img = new Img(w, tall + 2), cx = 11, ramp = P.pine;
  const tr = trunk(3, 9, 0); img.blit(tr, cx - 2, tall - 8);
  const tiers = 5, layer = new Img(w, tall + 2);
  for (let t = tiers - 1; t >= 0; t--){
    const top = 1 + t * (tall - 14) / tiers, hgt = 10, half = 4 + t * 1.7 + (hash(seed, t) * 1.5 | 0), lay = new Img(w, tall + 2);
    for (let y = 0; y < hgt; y++){
      const k = y / (hgt - 1), hw = Math.round(half * Math.pow(k, .75)) + (y === hgt - 1 ? 0 : 0), sag = Math.round(k * k * 1.2);
      for (let x = -hw; x <= hw; x++){
        const droop = Math.round(Math.abs(x) / Math.max(1, half) * 2.2);   // the boughs hang at their ends
        const yy = Math.round(top + y + droop + sag * 0), l = (-x / (half + 1)) * .55 + (.5 - k) * .9 + (hash(x + seed * 31, y + t * 17, 4) - .5) * .5;
        if (y === hgt - 1 && (x + t) % 3 === 0) continue;   // a ragged lower edge
        lay.set(cx + x, yy, tone(ramp, l, [.62, .3, .02, -.3, -.6], 1));
      }
    }
    outline(lay, ramp[7]);
    layer.blit(lay, 0, 0);
  }
  img.blit(layer, 0, 0);
  return {img, foot: [cx, tall]};
}

// ---- small things from letter grids ----
const W = P.wood, R = P.rock;
const SIGN = sprite([
  '..oooooooooooo..',
  '.oLLLLLLLLLLLLo.',
  '.oLaaLLaaaLaLMo.',
  '.oMMMMMMMMMMMMo.',
  '.oMaaaMMaaMaaDo.',
  '.oDDDDDDDDDDDDo.',
  '..ooooLMoooooo..',
  '......oLMo......',
  '......oLMo......',
  '......oMDo......',
  '.....ooMDoo.....',
  '......oooo......'], {o: W[6], L: W[0], M: W[1], D: W[2], a: W[4]});
const POST = sprite([
  '.....oooo.....',
  '....oLLMMo....',
  '....oLMMDo....',
  '.oooorrrroooo.',
  'oLLLLMMMMMMDDo',
  'oMMMMMMMMDDDDo',
  '.oooorrrroooo.',
  '....oLMMDo....',
  '....oLMMDo....',
  '....oLMDDo....',
  '....oLMDDo....',
  '...ooLMDDoo...',
  '..oMMMMDDDDo..',
  '...oooooooo...'], {o: W[6], L: W[0], M: W[2], D: W[3], r: P.red[2]});
// flowers: a clump, each a stem and a head of a few pixels (c: the petals' colour, light and dark)
function flowers(seed, c1, c2){
  const img = new Img(16, 16);
  const at = [[3, 9], [8, 5], [12, 10], [6, 13]].slice(0, 3 + (hash(seed, 1) > .5 ? 1 : 0));
  at.forEach(([x, y], i) => {
    x += (hash(seed, i, 2) * 3 | 0) - 1; y += (hash(seed, i, 3) * 3 | 0) - 1;
    img.set(x, y + 1, P.grass[5]); img.set(x, y + 2, P.grass[5]); img.set(x + 1, y + 2, P.grass[4]);
    img.set(x, y, P.gold[1]); img.set(x - 1, y, c1); img.set(x + 1, y, c2); img.set(x, y - 1, c1); if (hash(seed, i, 4) > .4) img.set(x, y + 1, c2);
  });
  return img;
}
// a tuft of tall grass (two shapes), tips in the light
const TUFTS = [
  sprite(['.....h.....', '..h..m..h..', '..m.hm..m..', '.hm.mm.hm..', '.mm.mmhmm.h', '.mdhmdmmdhm', 'dmdmmdmdmmd', '.DdDdDdDdD.'], {h: P.grass[0], m: P.grass[2], d: P.grass[4], D: P.grass[6]}),
  sprite(['...h...h...', '...m.h.m...', '.h.mhm.m.h.', '.m.mmmhm.m.', '.mhmdmmmhm.', 'hmmmdmdmmmh', 'mdmdmdmdmdm', '.dDdDdDdDd.'], {h: P.grass[0], m: P.grass[2], d: P.grass[4], D: P.grass[6]}),
];
// a speech mark over someone: '!' or '?'
function mark(ch){
  const rows = ch === '!' ? ['.ooooo.', 'owwwwwo', 'owwrwwo', 'owwrwwo', 'owwrwwo', 'owwwwwo', 'owwrwwo', 'owwwwwo', '.ooowo.', '...oo..']
    : ['.ooooo.', 'owwwwwo', 'owrrrwo', 'owwwrwo', 'owwrwwo', 'owwwwwo', 'owwrwwo', 'owwwwwo', '.ooowo.', '...oo..'];
  return sprite(rows, {o: P.ink, w: P.white, r: ch === '!' ? P.red[2] : hex('#2F7698')});
}
// the A hint beside whoever A talks to
const A_HINT = sprite(['..ooooo..', '.orrrrro.', 'orrwwwrro', 'orwrrrwro', 'orwwwwwro', 'orwrrrwro', 'orwrrrwro', '.orrrrro.', '..ooooo..'], {o: P.red[4], r: P.red[2], w: P.white});
// a lily pad and a little fish, for the pond
const LILY = sprite(['.lll.', 'lLLld', 'lLdd.', '.dd..'], {l: P.grass[1], L: P.grass[2], d: P.grass[4]});
const LILY_BUD = sprite(['.lll..', 'lLpPd.', 'lLLdd.', '.ddd..'], {l: P.grass[1], L: P.grass[2], d: P.grass[4], p: hex('#FBD0D6'), P: hex('#F090A8')});
const KOI = sprite(['.oo.w.', 'oOOow.', '.oo.w.'], {o: P.gold[3], O: P.red[1], w: P.white});

module.exports = {lit, tone, outline, boulder, leaves, trunk, tree, pine, SIGN, POST, flowers, TUFTS, mark, A_HINT, LILY, LILY_BUD, KOI};
