// The things that stand on a place's ground, at double detail (the new look, on trial: DESIGN.md's Next steps): each
// drawn on its own picture, then packed onto one sheet. They keep the game's own designs, measured from js/art.js and
// doubled: trees with their leaves in broad flat layers, in the same three lopsided shapes (TREE_LAYERS, TALL_LAYERS),
// the fruit trees, your stone, the rocks, a boulder, the sign, the practice post, a bush, and the long grass's five
// little tufts a square. Each is lit from the top left, with a see-through shadow on the ground.
'use strict';
const {Img, P, hex, hash, noise, fbm, sprite} = require('./core.js');
const {boulder} = require('./things.js');

const L = P.leaf, WD = P.wood, G = P.grass, ROCK = P.rock.slice(1);
const SHADOW = [43, 52, 92, 78];   // on the ground, see-through
const oval = (img, cx, cy, rx, ry, c) => { for (let y = Math.ceil(cy - ry); y <= cy + ry; y++){ const w = rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2)); for (let x = Math.round(cx - w); x <= Math.round(cx + w); x++) img.set(x, y, c); } };
const rect = (img, x, y, w, h, c) => img.rect(x, y, w, h, c);
// a shadow: what's under it shows through, so it's put on a clear picture first, never over another shadow
const shadow = (img, cx, cy, rx, ry) => oval(img.shade || (img.shade = new Img(img.w, img.h)), cx, cy, rx, ry, SHADOW);   // (on a picture of its own, beside the thing's: only ever drawn on the ground, under the characters)
// trim a picture to what's drawn on it (and its shadow's picture, shade, if it has one); anchor: where its square's top
// left corner was, which moves with it
function trim(img, ax, ay){
  const shade = img.shade ? trim(img.shade, ax, ay) : null;
  let x0 = img.w, y0 = img.h, x1 = -1, y1 = -1;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if (img.d[(y * img.w + x) * 4 + 3]){ x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return {img: img.crop(x0, y0, x1 - x0 + 1, y1 - y0 + 1), ax: ax - x0, ay: ay - y0, ...(shade ? {shade} : {})};
}

// A tree's leaves: broad flat layers, one over another like clouds (clumps: each [cx, cy, half its width, half its
// height], in the picture's pixels), dark underneath, lit along the top, with little bunches along each top edge.
function cloudLeaves(img, clumps, seed, ramp = L){
  for (const [cx, cy, rx, ry] of clumps) oval(img, cx, cy + 2, rx + 2, ry + 2, ramp[6]);            // their outline
  for (const [cx, cy, rx, ry] of clumps) oval(img, cx, cy, rx, ry, ramp[5]);                        // dark underneath
  for (const [cx, cy, rx, ry] of clumps) oval(img, cx - 1, cy - 2, rx - 1, ry - 1, ramp[4]);
  for (const [cx, cy, rx, ry] of clumps) oval(img, cx - 2, cy - 3, rx - 3, Math.max(2, ry - 3), ramp[3]);
  for (const [cx, cy, rx, ry] of clumps) oval(img, cx - 4, cy - ry / 2 - 1, Math.max(2, rx - 8), Math.max(2, ry / 2), ramp[2]);   // lit on top
  for (const [cx, cy, rx, ry] of clumps) oval(img, cx - rx * .3, cy - ry * .62, Math.max(2, rx * .45), Math.max(1.5, ry * .22), ramp[1]);
  clumps.forEach(([cx, cy, rx, ry], i) => {
    for (let k = -rx + 7; k <= rx - 7; k += 8){   // the bunches along its top edge
      const ty = Math.round(cy - ry * Math.sqrt(Math.max(0, 1 - (k * k) / (rx * rx))));
      oval(img, cx + k, ty, 4, 2.6, ramp[6]); oval(img, cx + k, ty + 1, 3, 2, k < 0 ? ramp[1] : ramp[2]); img.set(cx + k - 1, ty, k < 0 ? ramp[0] : ramp[1]); img.set(cx + k, ty, k < 0 ? ramp[0] : ramp[1]);
    }
    for (let k = 0; k < rx; k++){   // leaves, dark and light: little strokes
      const x = Math.round(cx - rx + 4 + hash(seed, i, k) * (2 * rx - 8)), y = Math.round(cy - ry + 4 + hash(seed, i, k + 50) * Math.max(1, 2 * ry - 6)), light = k % 3 === 0;
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > .8) continue;
      img.set(x, y, light ? ramp[1] : ramp[5]); img.set(x + 1, y + (light ? -1 : 1), light ? ramp[1] : ramp[5]); if (!light) img.set(x + 2, y + 1, ramp[5]);
    }
  });
}
// a trunk: lit down its left, dark down its right, a foot a little wider
function trunk(img, x, y, w, h){
  rect(img, x - 1, y, w + 2, h, WD[6]);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) img.set(x + i, y + j, i < 2 ? WD[1] : i >= w - 2 ? WD[4] : (hash(i, j >> 2, 5) > .75 ? WD[3] : WD[2]));
  rect(img, x - 3, y + h - 3, w + 6, 3, WD[6]); rect(img, x - 2, y + h - 3, w + 4, 2, WD[3]); rect(img, x - 2, y + h - 3, 3, 2, WD[1]);
}
const limbs = (img, list) => { for (const [x0, y0, x1, y1, w] of list){ const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++){ const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); rect(img, x, y, w, w, WD[4]); rect(img, x, y, Math.max(1, w - 2), Math.max(1, w - 2), WD[2]); } } };
const twice = clumps => clumps.map(c => c.map(v => v * 2));
// the game's own layers of leaves (js/art.js), for a big tree (two squares by two) and a tall one (one square)
const TREE_LAYERS = [[[10, 15, 10, 4], [23, 9, 9, 4], [11, 3, 9, 4], [21, -3, 6, 3]], [[22, 15, 10, 4], [9, 9, 9, 4], [20, 2, 10, 4], [10, -4, 6, 3]], [[16, 16, 13, 4], [7, 7, 7, 4], [25, 6, 7, 4], [15, -1, 9, 4]]];
const TALL_LAYERS = [[[7, 6, 7, 3], [10, 1, 5, 3], [7, -4, 4, 2]], [[9, 6, 7, 3], [6, 1, 5, 3], [9, -4, 4, 2]], [[8, 6, 7, 3], [8, 1, 6, 3], [8, -4, 4, 2]]];
const PAD = 40;   // room round a picture's square while it's drawn: its square's corner is at PAD, PAD
const at = clumps => twice(clumps).map(([cx, cy, rx, ry]) => [cx + PAD, cy + PAD, rx, ry]);

function bigTree(v){   // two squares by two: its trunk and roots, a branch up into each layer of leaves
  const img = new Img(64 + 2 * PAD, 64 + 2 * PAD), layers = at(TREE_LAYERS[v]);
  shadow(img, PAD + 36, PAD + 58, 28, 6);
  trunk(img, PAD + 28, PAD + 36, 10, 24);
  limbs(img, layers.slice(1).map(([cx, cy]) => [PAD + 32, PAD + 38, cx, cy + 4, 4]));
  cloudLeaves(img, layers, v * 13 + 1);
  return trim(img, PAD, PAD);
}
function tallTree(v){   // one square
  const img = new Img(32 + 2 * PAD, 32 + 2 * PAD);
  shadow(img, PAD + 19, PAD + 28, 15, 4);
  trunk(img, PAD + 14, PAD + 14, 6, 16);
  cloudLeaves(img, at(TALL_LAYERS[v]), v * 7 + 3);
  return trim(img, PAD, PAD);
}
function fruitTree(colours){   // a square and a half wide, reaching up, full of fruit
  const img = new Img(32 + 2 * PAD, 32 + 2 * PAD);
  shadow(img, PAD + 20, PAD + 28, 21, 4);
  trunk(img, PAD + 12, PAD + 12, 8, 18);
  limbs(img, [[PAD + 14, PAD + 12, PAD + 4, PAD + 2, 3], [PAD + 18, PAD + 12, PAD + 28, PAD + 2, 3]]);
  cloudLeaves(img, at([[8, 4, 11, 4], [3, -2, 6, 3], [13, -2, 6, 3], [8, -7, 7, 3]]), 5);
  const [body, shine, dark, edge] = colours.map(hex);
  for (const [cx, cy] of [[1, 1], [9, -10], [13, 0], [5, 4], [14, 5], [-2, 3], [6, -4]]){   // its fruit: round, a shine on each, a leaf beside it
    const x = PAD + cx * 2 + 1, y = PAD + cy * 2 + 1;
    oval(img, x, y, 3.2, 3.2, edge); oval(img, x, y, 2.2, 2.2, body); img.set(x + 1, y + 1, dark); img.set(x, y + 2, dark); img.set(x - 1, y - 1, shine); img.set(x, y - 1, shine);
    img.set(x + 2, y - 3, L[1]); img.set(x + 3, y - 3, L[2]);
  }
  return trim(img, PAD, PAD);
}
function bush(){   // a low bush, its leaves in layers like the trees'
  const img = new Img(32 + 2 * PAD, 32 + 2 * PAD);
  shadow(img, PAD + 18, PAD + 28, 15, 4);
  cloudLeaves(img, at([[8, 11, 7, 3], [8, 7, 5, 3]]), 9);
  return trim(img, PAD, PAD);
}
// a boulder w by h, its foot's middle at the middle of the bottom of its square (30 down), with its shadow
function rock(w, h, seed, mossy){
  const img = new Img(32 + 2 * PAD, 32 + 2 * PAD), b = boulder(w, h, seed, {mossy, ramp: ROCK});
  shadow(img, PAD + 20, PAD + 29, w / 2 + 3, 4);
  img.blit(b, PAD + 16 - (b.w >> 1), PAD + 31 - b.h);
  return trim(img, PAD, PAD);
}
function rocks(n){   // big rocks in a row, n squares wide, across a path
  const img = new Img(32 * n + 2 * PAD, 32 + 2 * PAD);
  shadow(img, PAD + 16 * n + 6, PAD + 29, 16 * n + 2, 4);
  for (let i = 0; i < n; i++){ const b = boulder(38 - (i % 2) * 4, 30 - (i % 2) * 4, 21 + i * 2, {mossy: i % 2 === 0, ramp: ROCK}); img.blit(b, PAD + 16 + i * 28 - (b.w >> 1), PAD + 31 - b.h); }
  return trim(img, PAD, PAD);
}
const one = (rows, pal, shade) => {   // a thing from a letter grid, in its square, with a shadow under it
  const img = new Img(32 + 2 * PAD, 32 + 2 * PAD);
  if (shade) shadow(img, PAD + shade[0], PAD + shade[1], shade[2], shade[3]);
  img.blit(sprite(rows, pal), PAD + ((32 - rows[0].length) >> 1), PAD + 32 - rows.length);
  return trim(img, PAD, PAD);
};
const WPAL = {o: WD[6], L: WD[0], M: WD[1], m: WD[2], D: WD[3], d: WD[4], g: G[4]};
const SIGN = () => one([   // a wooden board on a post: carved lines, as today's (too small for real writing)
  '....oooooooooooooooooooooooo....',
  '...oLLLLLLLLLLLLLLLLLLLLLLLLo...',
  '..oLLMMMMMMMMMMMMMMMMMMMMMMMMo..',
  '..oLMMMMMMMMMMMMMMMMMMMMMMMMmo..',
  '..oLMMddddMMMddddddMMdddMMMMmo..',
  '..oLMMMMMMMMMMMMMMMMMMMMMMMMmo..',
  '..oLMMMMMMMMMMMMMMMMMMMMMMMMmo..',
  '..oLMMdddddddMMMdddMMMddddMMmo..',
  '..oLMMMMMMMMMMMMMMMMMMMMMMMMmo..',
  '..oLMMMMMMMMMMMMMMMMMMMMMMMMmo..',
  '..oLMMddddddMMddddddddMMMMMMmo..',
  '..oLMMMMMMMMMMMMMMMMMMMMMMMMmo..',
  '..oMmmmmmmmmmmmmmmmmmmmmmmmmDo..',
  '...oDDDDDDDDDDDDDDDDDDDDDDDDo...',
  '....oooooooooooLMmoooooooooo....',
  '..............oLMmDo............',
  '..............oLMmDo............',
  '..............oLMmDo............',
  '..............oLMmDo............',
  '..............oLMmDo............',
  '..............oLMmDo............',
  '..............oLMmDo............',
  '.............goLMmDog...........',
  '............ggoMmDDogg..........',
  '..............oooooo............'], WPAL, [18, 29, 11, 3]);
const POST = () => one([   // the practice post: a stout post with a crossbar, bound with rope
  '..........oooooooo..........',
  '.........oLLLMMMmDo.........',
  '.........oLMMMMmmDo.........',
  '.........oLMMMMmmDo.........',
  '.........orrrrrrrro.........',
  '.oooooooooLMMMMmmDooooooooo.',
  'oLLLLLLLLLLMMMMmmmmmmmmmmDDo',
  'oLMMMMMMMMMMMMMmmmmmmmmDDDDo',
  'oMmmmmmmmmmmmmmmmmmDDDDDDDDo',
  '.oooooooooLMMMMmmDooooooooo.',
  '.........orrrrrrrro.........',
  '.........oLMMMMmmDo.........',
  '.........oLMMMMmmDo.........',
  '.........oLMMMMmmDo.........',
  '.........oLMMMMmmDo.........',
  '.........oLMMMmmDDo.........',
  '.........oLMMMmmDDo.........',
  '.........oLMMMmmDDo.........',
  '.........oLMMMmmDDo.........',
  '.........oLMMmmmDDo.........',
  '.........oLMMmmmDDo.........',
  '.........oLMMmmmDDo.........',
  '........goLMMmmDDDog........',
  '.......ggoMmmmDDDDogg.......',
  '.......oooMmmDDDDDooo.......',
  '......oMmmmmmDDDDDDDdo......',
  '.......oooooooooooooo.......'], {...WPAL, r: hex('#C9B48A')}, [17, 29, 12, 3]);
// The long grass: five little tufts a square, each seven blades along a dark base with three pale tips, as the game's
// (tall, js/art.js: tufts at 0,1 8,0 4,6 9,9 0,10), doubled. Its darker ground is the ground picture's.
function tallGrass(){
  const img = new Img(32, 32), blade = G[5], tip = G[1], mid = G[3];
  const tuft = (ox, oy) => {
    [[0, 3], [1, 2], [2, 3], [3, 1], [4, 3], [5, 2], [6, 3]].forEach(([a, c]) => {   // each blade two wide, coming to a point, a lit left edge
      for (let y = c * 2; y < 8; y++){ img.set(ox + a * 2, oy + y, y === c * 2 ? mid : mid); img.set(ox + a * 2 + 1, oy + y, blade); }
      img.set(ox + a * 2 + 1, oy + c * 2, null);
    });
    [[1, 1], [3, 0], [5, 1]].forEach(([a, c]) => { img.set(ox + a * 2, oy + c * 2, tip); img.set(ox + a * 2, oy + c * 2 + 1, tip); img.set(ox + a * 2 + 1, oy + c * 2 + 1, G[2]); });
    rect(img, ox, oy + 8, 14, 2, G[6]); rect(img, ox, oy + 8, 14, 1, blade);
  };
  tuft(0, 2); tuft(16, 0); tuft(8, 12); tuft(18, 18); tuft(0, 20);
  return {img, ax: 0, ay: 0};
}

// Every thing, by name. over: 'up' if what reaches above its squares goes over the characters; 'wide' if what's beside
// them does too (a tree with wide branches). squares: how many squares wide it stands on (for 'wide').
function things(){
  const out = {};
  [0, 1, 2].forEach(v => { out['treeBig' + v] = bigTree(v); out['tree' + v] = tallTree(v); });
  out.peachTree = fruitTree(['#F7A08F', '#FFE0CF', '#E07C74', '#8C3E48']); out.appleTree = fruitTree(['#E8343C', '#FF8A80', '#B02230', '#5E1930']);
  out.bush = bush();
  out.stone = rock(44, 36, 4, true);
  out.rocks2 = rocks(2);
  out.boulder = rock(24, 22, 7, false); out.boulderCracked = rock(24, 22, 12, true);
  out.sign = SIGN(); out.post = POST(); out.tallGrass = tallGrass();
  return out;
}
// pack them onto one sheet, in rows; gives the sheet and, for each name, [x, y, w, h, ax, ay]
function sheet(){
  const all = Object.entries(things()).flatMap(([name, t]) => [[name, t], ...(t.shade ? [[name + 'Shadow', t.shade]] : [])]).sort((a, b) => b[1].img.h - a[1].img.h), W = 512, where = {};   // (each thing's shadow beside it, as nameShadow)
  let x = 1, y = 1, rowH = 0;
  for (const [name, t] of all){ if (x + t.img.w + 1 > W){ x = 1; y += rowH + 1; rowH = 0; } where[name] = [x, y, t.img.w, t.img.h, t.ax, t.ay]; x += t.img.w + 1; rowH = Math.max(rowH, t.img.h); }
  const img = new Img(W, y + rowH + 1);
  for (const [name, t] of all) img.blit(t.img, where[name][0], where[name][1]);
  return {img, where};
}
module.exports = {things, sheet};
