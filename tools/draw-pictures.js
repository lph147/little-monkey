// The word pictures (content/pictures.js): 32 x 32 pixel art for every word with a picture, and the game's
// 16 x 16 icons (ICON_DRAWINGS, below), drawn here from
// shapes. Run it with:  npm run pictures   (after changing a drawing below; a test checks the pictures are up to date).
// It needs no packages: each picture is worked out pixel by pixel, then written as rows of letters with a palette.
//
// Shapes are masks, saying whether a pixel belongs: O (an oval), Rc (a rectangle, with rounded corners if r), Pg (a
// polygon), Cp (a rounded stroke from one point to another) and path (strokes through several points), combined with
// or, and and not. Each part is drawn with p.fill (lit along its top and left edges, shaded along its bottom and right;
// edge: a darker line where it lies over another part), p.flat (one colour), p.dot (one pixel) or p.eye. Then the whole
// picture gets a soft outline, a dark shade of whatever it touches.
'use strict';
const fs = require('node:fs');
const path_ = require('node:path');

let N = 32;   // the picture's size: 32 for word pictures, 16 for icons (draw() sets it)
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * k).toString(16).padStart(2, '0')).join('');
// masks: does pixel (x, y) belong to the shape?
const O = (cx, cy, rx, ry = rx) => (x, y) => ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1;
const Rc = (x0, y0, w, h, r = 0) => (x, y) => {
  if (x < x0 || y < y0 || x >= x0 + w || y >= y0 + h) return false;
  if (!r) return true;
  const cx = Math.min(Math.max(x + .5, x0 + r), x0 + w - r), cy = Math.min(Math.max(y + .5, y0 + r), y0 + h - r);
  return (x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= r * r;
};
const Pg = pts => (x, y) => {
  let inside = false; const px = x + .5, py = y + .5;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++){
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const Cp = (x0, y0, x1, y1, r) => (x, y) => {   // a rounded stroke from (x0, y0) to (x1, y1), r thick each side
  const px = x + .5, py = y + .5, dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / (dx * dx + dy * dy || 1)));
  return (px - x0 - t * dx) ** 2 + (py - y0 - t * dy) ** 2 <= r * r;
};
const path = (pts, r) => { const segs = pts.slice(1).map((p, i) => Cp(...pts[i], ...p, r)); return (x, y) => segs.some(s => s(x, y)); };
const or = (...ms) => (x, y) => ms.some(m => m(x, y));
const and = (...ms) => (x, y) => ms.every(m => m(x, y));
const not = m => (x, y) => !m(x, y);

// Draws one picture: its colours, pixel by pixel ('#RRGGBB', or null where it's see-through).
function draw(word, drawing = DRAWINGS[word], size = 32){
  N = size;
  const cells = new Array(N * N).fill(null), at = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? null : cells[y * N + x]);
  const p = {
    fill(mask, c, o = {}){
      const m = (x, y) => x >= 0 && y >= 0 && x < N && y < N && mask(x, y), out = [];
      const dark = o.dark || mix(c, '#000000', .22), light = o.light || mix(c, '#FFFFFF', .3), edge = mix(c, '#000000', .42);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++){
        if (!m(x, y)) continue;
        let k = c;
        if (!o.flat){ if (!m(x + 1, y) || !m(x, y + 1)) k = dark; else if (!m(x - 1, y) || !m(x, y - 1)) k = light; }
        if (o.edge && [[1,0],[-1,0],[0,1],[0,-1]].some(([a, b]) => !m(x + a, y + b) && at(x + a, y + b))) k = edge;
        out.push([x, y, k]);
      }
      out.forEach(([x, y, k]) => { cells[y * N + x] = k; });
    },
    flat(mask, c){ p.fill(mask, c, {flat: true}); },
    dot(x, y, c){ if (x >= 0 && y >= 0 && x < N && y < N) cells[y * N + x] = c; },
    eye(x, y, c = '#1E1A16', h = 2){ for (let i = 0; i < h; i++){ p.dot(x, y + i, c); p.dot(x + 1, y + i, c); } p.dot(x, y, '#FFFFFF'); }
  };
  drawing(p);
  const out = cells.slice();   // the outline: a dark shade of what it touches
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++){
    if (cells[y * N + x]) continue;
    const nb = [[1,0],[-1,0],[0,1],[0,-1]].map(([a, b]) => at(x + a, y + b)).filter(Boolean);
    if (nb.length) out[y * N + x] = mix(nb[0], '#120E0A', .68);
  }
  return out.map(k => k && k.toUpperCase());
}

// Numbers: a dice face (its dots, [x, y] each), up to six; from seven, two dice side by side, the left one always five
// (五 and 二 for 七, 五 and 三 for 八, and so on), with square dots (decided 26 October 2026: a ten frame's round counters
// came out as little crosses at this size, and 七 looked a mess).
function dice(p, dots){ p.fill(Rc(5, 5, 22, 22, 4), '#FAFAF5', {dark: '#C9C6BC'}); for (const [x, y] of dots) p.fill(O(x, y, 2.4), '#D83A3A'); }
const PIPS = {2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]]};   // a die's dots, on a grid of three
function smallDie(p, x0, n){ p.fill(Rc(x0, 9, 14, 14, 3), '#FAFAF5', {dark: '#C9C6BC'}); for (const [i, j] of PIPS[n]) p.fill(Rc(x0 + 2 + i * 4, 11 + j * 4, 3, 3), '#D83A3A'); }
function twoDice(p, n){ smallDie(p, 1, 5); smallDie(p, 17, n - 5); }
// Colours used more than once
const FUR = '#B8743E', SKIN = '#F6D2A8', WHITE = '#F4F0E8', LEAF = '#4FA34A', BARK = '#8A5A32', WOOD = '#B98A55', STONE = '#A9A598', BLUE = '#3F8FCB', RED = '#D83A3A', GOLD = '#F2C14E';

const DRAWINGS = {   // each word's picture, drawn on p (see draw() above)
  '兔子': p => {   // rabbit, sitting
    p.fill(O(24.5, 26, 2.6, 2.3), '#FFFFFF');
    p.fill(O(16, 24, 8.5, 6.5), WHITE);
    p.fill(or(O(11, 30, 3, 1.7), O(20.5, 30, 3, 1.7)), '#E6DED2', {edge: true});
    p.fill(O(11, 8, 2.7, 7.5), WHITE); p.fill(O(19.5, 7.5, 2.7, 7.5), WHITE);
    p.flat(O(11, 8.8, 1.1, 5.5), '#F4A6B0'); p.flat(O(19.5, 8.3, 1.1, 5.5), '#F4A6B0');
    p.fill(O(15.5, 16, 7.2, 6), WHITE, {edge: true});
    p.flat(or(O(10.5, 18, 1.6, 1), O(20.5, 18, 1.6, 1)), '#F8C8CE');
    p.eye(11, 14); p.eye(18, 14);
    p.flat(Rc(15, 17, 2, 1), '#F48A9A'); p.dot(15, 19, '#B48A82'); p.dot(16, 19, '#B48A82');
  },
  '狐狸': p => {   // fox, sitting
    p.fill(O(24.5, 23, 4, 6.5), '#E07B39'); p.flat(O(25.5, 17.8, 2.4, 2.2), '#F7F1E8');
    p.fill(O(15, 23, 7, 7), '#E07B39');
    p.flat(O(15, 24.5, 3.5, 5), '#F7F1E8');
    p.fill(or(O(11.5, 30, 1.8, 1.5), O(18.5, 30, 1.8, 1.5)), '#4A2A18');
    p.fill(Pg([[7, 11], [9.5, 2], [13.5, 8]]), '#E07B39'); p.fill(Pg([[16.5, 8], [20.5, 2], [23, 11]]), '#E07B39');
    p.flat(Pg([[8.6, 9], [9.8, 4.5], [12, 8]]), '#5A2E14'); p.flat(Pg([[18, 8], [20.2, 4.5], [21.4, 9]]), '#5A2E14');
    p.fill(O(15, 13, 7.6, 6), '#E07B39', {edge: true});
    p.flat(or(O(9.8, 15, 2.6, 2.2), O(20.2, 15, 2.6, 2.2), O(15, 17, 3.8, 2.6)), '#F7F1E8');
    p.eye(11, 12); p.eye(18, 12); p.flat(Rc(14, 16, 2, 1), '#2B1A10');
  },
  '松鼠': p => {   // squirrel, with its big tail, holding an acorn
    p.fill(O(22.5, 14, 6.5, 9.5), '#B5672E'); p.fill(O(19.5, 5, 4, 3.4), '#B5672E');
    p.flat(O(23, 13, 3.4, 6.5), '#CF8A4E');
    p.fill(O(14, 22, 5.6, 6.6), '#9E5A2A', {edge: true});
    p.flat(O(12.4, 23.5, 2.6, 4.4), '#F0D9B5');
    p.fill(or(O(11.5, 29.5, 3.2, 1.6), O(17.5, 29.5, 3, 1.6)), '#7A4420', {edge: true});
    p.fill(Pg([[11.5, 10], [13.5, 4.5], [15.5, 10]]), '#9E5A2A');
    p.fill(O(10.5, 13.5, 5.2, 4.6), '#9E5A2A', {edge: true});
    p.flat(O(8.2, 15.5, 2.4, 1.8), '#F0D9B5');
    p.eye(8, 11); p.dot(5, 14, '#3E2412');
    p.fill(O(8.5, 21, 2.4, 2.8), '#8A5A2A', {edge: true}); p.fill(O(8.5, 18.6, 2.6, 1.4), '#5E3B1F');
  },
  '羊': p => {   // sheep, standing: round and woolly, with a black face and legs (unlike the goat: smooth, with horns and a beard)
    const leg = '#3A342F';
    p.fill(or(Rc(10, 21, 3, 8), Rc(14.5, 22, 3, 7), Rc(21, 22, 3, 7), Rc(25, 21, 3, 8)), leg);
    p.flat(or(Rc(10, 28, 3, 1), Rc(14.5, 28, 3, 1), Rc(21, 28, 3, 1), Rc(25, 28, 3, 1)), '#1E1A16');
    const wool = or(O(19.5, 16.5, 9.5, 6.5), O(12, 12.5, 3.7), O(16, 10, 3.9), O(21, 9.5, 3.9), O(26, 11, 3.7), O(29, 15.5, 3), O(27.5, 20.5, 3.5),
      O(22, 22.5, 3.6), O(16, 22.5, 3.6), O(11.5, 19.5, 3.4));
    p.fill(wool, '#F6F2E8', {dark: '#D6CFBF', edge: true});
    for (const [x, y] of [[15, 14], [20, 13], [25, 15], [18, 18], [23, 19], [13, 17], [27, 18]]) p.dot(x, y, '#E2DCCE');   // curls in the wool
    p.fill(O(7, 15, 3.6, 4.5), leg, {edge: true});                      // its face
    p.fill(O(10.2, 12, 2.6, 1.2), leg, {edge: true});                    // an ear
    p.fill(O(8.3, 10.6, 2.8, 2.1), '#F6F2E8', {dark: '#D6CFBF'});        // a tuft of wool on top
    p.dot(5, 14, '#FFFFFF'); p.dot(6, 14, '#FFFFFF'); p.dot(5, 15, '#FFFFFF'); p.dot(6, 15, '#1E1A16');   // its eye
    p.flat(O(5, 18.5, 1.3, .8), '#5A524A');                              // its nose
  },
  '山羊': p => {   // goat, standing
    p.fill(or(Rc(10, 20, 3, 8), Rc(14, 20, 3, 8), Rc(21, 20, 3, 8), Rc(25, 20, 3, 8)), '#E2DACA');
    p.flat(or(Rc(10, 27, 3, 2), Rc(14, 27, 3, 2), Rc(21, 27, 3, 2), Rc(25, 27, 3, 2)), '#4A453D');
    p.fill(O(19, 17, 9.5, 5.6), '#EFEADC', {edge: true}); p.fill(O(28.5, 13.5, 1.7, 1.7), '#EFEADC');
    p.fill(Pg([[7, 10], [12, 8], [14, 17], [10, 18]]), '#EFEADC');
    p.fill(path([[9.5, 7.5], [10.5, 3], [13, 2], [14, 4]], 1.1), '#9C968A');
    p.fill(O(7.5, 10.5, 4.3, 3.6), '#EFEADC', {edge: true}); p.fill(O(4.3, 12.2, 2.4, 2), '#E2DACA', {edge: true});
    p.fill(O(12, 9.2, 2.4, 1.2), '#E2DACA', {edge: true});
    p.fill(Pg([[3.6, 13.5], [6, 13.5], [5, 19]]), '#B8B2A6');
    p.eye(6, 9); p.dot(2, 12, '#4A453D');
  },
  '石头': p => {   // stone
    p.fill(O(25.5, 25.5, 4.6, 3.6), '#9A968A');
    p.fill(O(15, 19, 12, 9), STONE, {edge: true});
    p.flat(O(11, 14, 5, 2.4), '#D6D2C5');
    p.flat(path([[17, 13], [16, 17], [18, 20], [17, 23]], .5), '#6E6A60'); p.flat(path([[18, 20], [21, 21]], .5), '#6E6A60');
  },
  '你好': p => {   // hello: a monkey's paw waving, four fingers apart and the thumb out to the side, its furry wrist below
    // (decided 24 October 2026: the fingers ran together, and the thumb was hard to see)
    const PALM = '#E9B98E', LT = {light: '#F6D3AE', dark: '#C8936A'};
    p.fill(Rc(11.5, 26, 10, 6, 1), '#9A5A2C');                                       // furry wrist
    p.fill(Cp(11.5, 22, 5.5, 15.5, 1.9), PALM, {...LT, edge: true});                  // thumb
    [[[12.6, 15], [11.6, 6]], [[16.2, 14], [16.2, 4]], [[19.8, 15], [20.6, 5.5]], [[23, 17], [24.6, 9.5]]]
      .forEach(([a, b]) => p.fill(Cp(...a, ...b, 1.65), PALM, {...LT, edge: true}));  // four fingers, a gap between each
    p.fill(Rc(10.5, 14, 14, 13, 5), PALM, LT);                                       // palm
    [[11.6, 6], [16.2, 4], [20.6, 5.5], [24.6, 9.5]].forEach(([x, y]) => p.dot(Math.round(x - .5), Math.round(y), '#FFE6CC'));   // fingernails
    p.flat(path([[13, 22.5], [16, 23.8], [20, 22.8]], .5), LT.dark);                  // a crease across the palm
    p.flat(path([[26, 4], [28.5, 6.5], [29.2, 10]], .6), '#7FB6E8'); p.flat(path([[28.5, 13], [30, 16]], .6), '#7FB6E8');   // waving
    p.flat(path([[6, 4], [3.6, 6.5], [3, 10]], .6), '#7FB6E8');
  },

  '猴子': p => {   // monkey
    p.fill(path([[22, 28], [28, 26.5], [28.5, 21.5], [26, 20]], 1.3), FUR);
    p.fill(O(16, 25, 6.5, 5.6), FUR); p.flat(O(16, 26, 3.8, 4), SKIN);
    p.fill(or(O(12, 30.5, 2.8, 1.4), O(20, 30.5, 2.8, 1.4)), '#8A5226', {edge: true});
    p.fill(O(8.5, 24.5, 2.2, 3.8), FUR, {edge: true}); p.fill(O(23.5, 24.5, 2.2, 3.8), FUR, {edge: true});
    p.fill(O(5.5, 13, 3.4, 3.6), FUR); p.fill(O(26.5, 13, 3.4, 3.6), FUR);
    p.flat(O(5.6, 13.2, 1.8, 2.1), SKIN); p.flat(O(26.4, 13.2, 1.8, 2.1), SKIN);
    p.fill(O(16, 12.5, 8.6, 7.8), FUR, {edge: true});
    p.flat(or(O(12.8, 12.5, 3.4, 3.7), O(19.2, 12.5, 3.4, 3.7), O(16, 16.6, 4.8, 3.2)), SKIN);
    p.eye(11, 11, '#24160C', 3); p.eye(19, 11, '#24160C', 3);
    p.flat(Rc(15, 15, 2, 1), '#A86A48'); p.flat(path([[13.5, 18], [16, 19], [18.5, 18]], .5), '#A86A48');
  },
  '花果山': p => {   // Flower Fruit Mountain, on the sign's card: a green mountain, flowers on its slopes, fruit trees (unlike 山: grey peaks)
    p.fill(Pg([[0, 29], [5, 18], [10, 10], [16, 5], [22, 10], [27, 18], [32, 29]]), '#5DA94E', {dark: '#468F3F', edge: true});
    p.flat(Pg([[16, 5], [22, 10], [27, 18], [32, 29], [22, 29], [20, 18]]), '#4E9944');   // its shady side
    p.fill(Pg([[13, 8.5], [16, 5], [19, 8.5], [17.6, 9.6], [16, 8.6], [14.4, 9.6]]), '#B9B4A6', {dark: '#9C978A'});   // a rocky top
    for (const [x, y, c] of [[12, 13, '#F48FB1'], [19, 12, '#FFD54A'], [8, 19, '#FAFAF5'], [15, 16, '#F48FB1'], [23, 16, '#FAFAF5'], [26, 22, '#F48FB1'], [5, 25, '#FFD54A'], [17, 21, '#FFD54A'], [11, 16, '#FAFAF5'], [21, 19, '#F48FB1']])
      { p.dot(x, y, c); p.dot(x + 1, y, c); p.dot(x, y + 1, c); p.dot(x + 1, y + 1, c); }   // flowers
    for (const [x, y] of [[9, 23], [24, 25]]){   // fruit trees, with peaches
      p.fill(Rc(x - .7, y + 1.5, 1.6, 4), BARK);
      p.fill(O(x, y, 3.6, 3), LEAF, {edge: true});
      for (const [dx, dy] of [[-1.5, -.5], [1.2, -1.2], [.4, 1]]) p.dot(Math.round(x + dx), Math.round(y + dy), '#F7A08F');
    }
    p.fill(Rc(0, 28, 32, 4), '#4C8C48');
  },
  '山': p => {   // mountain: rocky peaks with snow, green slopes below
    p.fill(Pg([[13, 27], [23.5, 9], [32, 27]]), '#7E8C80', {edge: true});
    p.fill(Pg([[0, 27], [12, 4], [25, 27]]), '#9AA59A', {edge: true});
    p.flat(Pg([[12, 4], [25, 27], [16, 27], [13.5, 18], [14.5, 11]]), '#7E897E');   // the shady side
    p.flat(Pg([[23.5, 9], [32, 27], [27, 27], [25, 17]]), '#677468');
    p.flat(Pg([[8, 11.5], [12, 4], [16.2, 11.5], [14.6, 10.6], [13, 12.8], [11.4, 10.4], [9.8, 12.6]]), '#F6F6F0');
    p.flat(Pg([[21.3, 13.2], [23.5, 9], [25.8, 13.2], [24.2, 12.4], [22.8, 13.8]]), '#F6F6F0');
    p.flat(path([[6, 18], [8.5, 15], [10, 17]], .5), '#7E897E'); p.flat(path([[18.5, 20], [20, 17.5]], .5), '#677468');
    p.fill(or(Pg([[0, 20], [4, 18.5], [8, 21], [12, 19], [16, 21.5], [20, 19.5], [25, 22], [29, 20], [32, 21.5], [32, 31], [0, 31]])), '#5FA85A');
    p.flat(or(Rc(4, 24, 3, 1), Rc(14, 26, 4, 1), Rc(24, 25, 3, 1)), '#4C8C48');
    p.flat(path([[0, 20.5], [4, 19], [8, 21.5], [12, 19.5], [16, 22]], .5), '#7CC46B');
  },

  '花': p => flower(p, '#F48FB1', '#FFD54A'),   // flower
  // a few words together (as the content writes them, with spaces), such as what you pick for the big monkey to plant
  '红色 的 花': p => flower(p, '#E8343C', '#FFD54A'),   // a red flower
  '黄色 的 花': p => flower(p, '#F7D23E', '#E0782A'),   // a yellow flower (its middle orange, to stand out)
  '白色 的 花': p => flower(p, '#FAFAF5', '#FFD54A'),   // a white flower
  '蓝色 的 花': p => flower(p, '#4F8FE8', '#FFD54A'),   // a blue flower (a pink one is 花's own)
  '橙色 的 花': p => flower(p, '#F28C28', '#8A4B1E'),   // an orange flower (its middle brown, to stand out)
  '草': p => {   // grass: a thick tuft
    const blades = [[3, 13, '#4FA34A'], [6, 8, '#6CC066'], [9, 14, '#3E8A3E'], [11, 5, '#5BB451'], [14, 10, '#6CC066'], [16, 3, '#4FA34A'],
      [19, 9, '#5BB451'], [21, 6, '#6CC066'], [24, 12, '#3E8A3E'], [26, 7, '#5BB451'], [29, 12, '#4FA34A'], [8, 18, '#5BB451'], [18, 17, '#4FA34A'], [27, 18, '#6CC066']];
    blades.forEach(([x, top, c], i) => { const lean = (i % 3 - 1) * 1.6; p.fill(Pg([[x - 2.2, 30], [x + lean, top], [x + 2.2, 30]]), c, {light: '#9BE08A'}); });
    p.fill(Rc(1, 26, 30, 5, 2), '#3E8A3E');
  },

  '蘑菇': p => {   // mushrooms: a big red one with white spots, as under the pines, and a little brown one behind it
    p.fill(O(16, 29, 13.5, 2.6), '#5DA651');   // a mossy patch
    p.fill(Rc(23, 20, 3, 9, 1), '#EFE6D2');   // the little brown one
    p.fill(and(O(24.5, 20.5, 5.5, 4), Rc(18, 15, 13, 6)), '#A9703E', {edge: true});
    p.fill(Pg([[11, 30], [12.6, 18], [18.4, 18], [20, 30]]), '#F4EDDE', {dark: '#D8CBB0'});   // the big red one: its stem,
    p.flat(Rc(12, 22, 7, 1), '#DCCDAF');   // a little ring round it,
    p.fill(and(O(15.5, 18, 12, 11), Rc(2, 6, 27, 12)), '#E0383A', {edge: true});   // and its cap
    p.flat(Rc(6, 17, 19, 1), '#B82A2C');
    [[9.5, 12, 1.8], [15.5, 9, 2.2], [21.5, 12.5, 1.8], [12.8, 15, 1.2], [19, 15.3, 1.2], [6.5, 15.5, 1], [25, 15.5, 1]].forEach(([x, y, r]) => p.flat(O(x, y, r, r * .85), '#FFFFFF'));   // its white spots
  },
  '灵芝': p => {   // lingzhi, the mushroom of long life: two glossy fans, red-brown, ringed, an ochre rim, growing out of a mossy rock (unlike 蘑菇: no spots, no stem)
    p.fill(and(O(16, 31, 15, 7), Rc(0, 24, 32, 8)), '#8C949A', {edge: true});   // the rock
    p.flat(and(O(12, 25, 9, 2.2), Rc(0, 23, 32, 3)), '#5DA651');                 // moss on it
    p.fill(path([[17, 26], [15, 19]], 1.3), '#7A3A1E');                           // the stalks, out of the rock
    p.fill(path([[19, 25], [21, 14]], 1.1), '#7A3A1E');
    p.fill(and(O(13, 19, 11.5, 6.5), Rc(0, 12, 32, 8)), '#8E2E1E', {edge: true});  // the big fan (its flat underside a line)
    p.flat(and(O(13, 19, 8.5, 4.2), Rc(0, 12, 32, 7)), '#A23A22');                // its rings
    p.flat(and(O(13, 19, 5.5, 2.4), Rc(0, 12, 32, 7)), '#B44A28');
    p.flat(and(O(13, 19, 11.5, 6.5), not(O(13, 19, 10.4, 5.5)), Rc(0, 12, 32, 7)), '#E0A43C');   // the ochre rim
    p.fill(and(O(22, 13, 7.5, 4.6), Rc(12, 8, 18, 5.5)), '#8E2E1E', {edge: true});  // the little fan, higher up
    p.flat(and(O(22, 13, 4.6, 2.4), Rc(12, 8, 18, 5)), '#B44A28');
    p.flat(and(O(22, 13, 7.5, 4.6), not(O(22, 13, 6.4, 3.6)), Rc(12, 8, 18, 5)), '#E0A43C');
    p.flat(or(Rc(8, 14, 3, 1), Rc(19, 9, 2, 1)), '#F2D8B0');                       // a glossy glint on each
  },
  '树': p => {   // tree
    p.fill(Rc(14, 19, 5, 11), BARK); p.fill(O(16.5, 30, 6, 1.5), '#5DA651');
    p.fill(or(O(16, 11, 9.5, 8), O(9, 15.5, 6.2, 5.5), O(24, 15.5, 6.2, 5.5), O(16.5, 17.5, 8, 4.6)), LEAF);
    p.flat(or(O(12.5, 8, 3.5, 2.4), O(7.5, 13.5, 2, 1.6)), '#7CC46B');
    [[19, 12], [12, 16], [22, 17], [16, 19], [9, 18]].forEach(([x, y]) => p.flat(Rc(x, y, 2, 1), '#2F7A3E'));
  },
  '水果': p => {   // fruit: a basket of all sorts, bananas, grapes, an orange and an apple (unlike 桃子 and 苹果: one of a kind)
    p.fill(path([[6, 15], [10, 7.5], [17, 4.5]], 2.3), '#F5D33F', {dark: '#D9B02A'});   // bananas, at the back
    p.fill(path([[9, 16], [14, 9], [21, 6.5]], 2.1), '#F8DE5A', {dark: '#D9B02A', edge: true});
    p.flat(or(O(17.6, 4.6, 1, 1), O(21.6, 6.5, 1, 1)), '#6B4A2A');
    p.fill(or(O(22, 12, 2), O(25.5, 12, 2), O(23.8, 15, 2), O(27, 15, 2), O(25.5, 18, 2)), '#7E4BA8', {edge: true});   // grapes
    p.fill(Cp(24, 9.5, 25, 6.5, .8), '#5BAA4B');
    p.fill(O(10, 18, 4.6, 4.4), '#F39A2A', {edge: true}); p.dot(10, 14, '#5BAA4B'); p.dot(8, 16, '#FFC27A');   // an orange
    p.fill(or(O(16.5, 18.5, 3.6, 4), O(20.5, 18.5, 3.6, 4)), '#E0303A', {edge: true}); p.flat(O(17.5, 16.6, 1.3, 1.6), '#FF8A80');   // an apple
    p.fill(Pg([[3, 20], [29, 20], [26, 30], [6, 30]]), '#C08A4E', {edge: true});   // the basket
    p.flat(or(Rc(5, 23, 22, 1), Rc(6, 26, 20, 1)), '#8E6234');
    p.flat(or(...[8, 12, 16, 20, 24].map(x => Rc(x, 21, 1, 2)), ...[10, 14, 18, 22].map(x => Rc(x, 24, 1, 2)), ...[8, 12, 16, 20, 24].map(x => Rc(x, 27, 1, 2))), '#8E6234');
    p.fill(Rc(2, 19, 28, 2, 1), '#D9A464', {dark: '#A8743E'});   // its rim
  },
  '桃子': p => {   // peach
    p.fill(Rc(15, 6, 2, 4), BARK);
    p.fill(Pg([[16, 9], [21, 4.5], [26, 5.5], [21, 9.5]]), '#5BAA4B', {edge: true});
    p.fill(O(16, 19, 10.5, 10), '#F7A08F');
    p.flat(O(19.5, 22, 4.5, 3.6), '#EE7F72');
    p.flat(path([[15, 10], [13.5, 15], [14, 21], [16, 27]], .5), '#D9665B');
    p.flat(O(10.5, 14.5, 2.6, 2), '#FFE0CF');
  },
  '苹果': p => {   // apple
    p.fill(Cp(16, 11, 17.5, 3.5, 1), '#6B4A2A');
    p.fill(Pg([[17.5, 7], [23, 3.5], [27, 5], [22, 9]]), '#5BAA4B', {edge: true});
    p.fill(or(O(11.8, 18.5, 8, 9.5), O(20.2, 18.5, 8, 9.5)), '#E0303A');
    p.flat(O(16, 9.6, 2.4, 1.2), '#A01E26');
    p.flat(O(10.2, 13.8, 2.2, 3), '#FF8A80');
  },
  '河': p => {   // river, between grassy banks
    p.fill(Rc(1, 1, 30, 30, 4), '#7CC46B');
    [[6, 8], [24, 6], [26, 22], [5, 24], [20, 28]].forEach(([x, y]) => p.flat(Rc(x, y, 2, 1), '#5BA552'));
    p.fill(and(Rc(1, 1, 30, 30, 4), path([[9, 0], [15, 8], [11, 16], [19, 24], [17, 32]], 4.2)), BLUE);
    p.flat(and(Rc(1, 1, 30, 30, 4), path([[10, 1], [14, 7]], .5)), '#8ACFF0');
    p.flat(path([[13, 13], [12, 16]], .5), '#8ACFF0'); p.flat(path([[17, 22], [19, 26]], .5), '#8ACFF0');
  },
  '水': p => {   // water: a drop
    p.fill(or(O(16, 20, 8.5, 8.5), Pg([[16, 1.5], [8.2, 17], [23.8, 17]])), BLUE);
    p.flat(O(12.4, 19.5, 1.8, 3.6), '#BFE6FA'); p.dot(13, 14, '#BFE6FA'); p.dot(14, 12, '#BFE6FA');
  },
  '鱼': p => {   // fish
    p.fill(Pg([[23, 16], [31, 8.5], [29, 16], [31, 23.5]]), '#E8772A');
    p.fill(Pg([[11, 10], [17, 5], [20, 10]]), '#E8772A');
    p.fill(O(15, 16, 10.5, 7.2), '#F28C38', {edge: true});
    p.flat(O(14, 19.5, 6.5, 2.6), '#FFC58A');
    p.fill(Pg([[14, 22], [18, 26], [19, 21]]), '#E8772A', {edge: true});
    p.flat(path([[9, 11.5], [10.5, 16], [9, 20.5]], .5), '#C25A1C');
    [[15, 13], [18, 15], [21, 13], [18, 11]].forEach(([x, y]) => p.dot(x, y, '#FFB070'));
    p.fill(O(7.2, 14.5, 2.3), '#FFFFFF'); p.flat(Rc(7, 14, 2, 2), '#1E1A16');
  },
  // fishing at the home ground (chapter 1): the fishing monkey's rod, bait from the 老板, and what you catch
  '快乐': p => {   // happy: a beaming yellow face, eyes shut with joy, a big open smile, little sparkles round it
    p.fill(O(16, 16.5, 12, 12), '#FFD34E', {edge: true});
    for (const sx of [-1, 1]) p.flat(path([[16 + sx * 7, 13.5], [16 + sx * 4.5, 11.5], [16 + sx * 2, 13.5]], .8), '#3A2A10');   // eyes, shut tight with joy
    p.fill(and(O(16, 19, 7.5, 6.5), Rc(0, 19, 32, 13)), '#7A2E1C');                                     // a big open smile
    p.flat(and(O(16, 23, 4, 2.5), Rc(0, 19, 32, 13)), '#E8706A');
    for (const sx of [-1, 1]) p.flat(O(16 + sx * 8.5, 19, 2.2, 1.5), '#F7A35C');                        // rosy cheeks
    for (const [x, y] of [[3, 5], [28, 4], [29, 26], [2, 25]]){ p.flat(Rc(x, y - 1.5, 1, 4), '#E3A51C'); p.flat(Rc(x - 1.5, y, 4, 1), '#E3A51C'); }   // sparkles
  },
  '木筏': p => {   // raft: five logs side by side, tied with rope, afloat on blue water, a long pole lying across it (unlike 木头: cut logs in a pile)
    p.fill(Rc(1, 1, 30, 30, 4), '#3F8FCB');                                                                       // the water
    [[4, 6], [20, 9], [9, 27], [24, 26]].forEach(([x, y]) => p.flat(Rc(x, y, 4, 1), '#8ACFF0'));
    for (let i = 0; i < 5; i++){ const y = 9 + i * 3.4; p.fill(Rc(4, y, 24, 3.4, 1.6), '#9C6A3C', {light: '#C99A62', dark: '#5E3B1F', edge: true}); p.fill(O(27, y + 1.7, 1.4, 1.6), '#E2C08E'); }   // the logs, their cut ends on the right
    for (const x of [9, 22]) p.flat(Rc(x, 8.5, 2, 18), '#E4D49C');                                                // rope round them
    p.flat(path([[3, 25], [29, 9]], .9), '#6E5220');                                                              // the pole
  },
  '海': p => {   // the sea: water to the horizon, under a sky, white-topped waves rolling in, a strip of sand (unlike 河: a river between grassy banks)
    p.fill(Rc(1, 1, 30, 30, 4), '#BFE6FA');                                                                   // the sky
    p.flat(and(Rc(1, 1, 30, 30, 4), O(24, 7, 3.5)), '#FFE27A');                                               // the sun
    p.fill(and(Rc(1, 1, 30, 30, 4), Rc(1, 11, 30, 20)), '#2F78B4');                                           // the sea, to the horizon
    p.flat(and(Rc(1, 1, 30, 30, 4), Rc(1, 11, 30, 1)), '#7DBEE6');
    for (const [y, sh] of [[15, 0], [19, 4], [23, 1]]) for (let x = 2 + sh; x < 30; x += 8){   // waves, each a curl of white
      p.flat(and(Rc(1, 1, 30, 30, 4), path([[x, y + 1], [x + 2, y - .5], [x + 4, y + 1]], .55)), '#F4FBFF');
    }
    p.fill(and(Rc(1, 1, 30, 30, 4), Pg([[1, 27], [12, 25.5], [22, 27], [31, 26], [31, 31], [1, 31]])), '#EBD49A');   // the sand
    p.flat(and(Rc(1, 1, 30, 30, 4), path([[1, 26.6], [12, 25.1], [22, 26.6], [31, 25.6]], .5)), '#FFFFFF');      // foam along it
  },
  '螃蟹': p => {   // crab: a round red shell, two big claws held up, eyes on stalks, four legs each side (unlike 虾: curled, with feelers)
    for (const [sx, d] of [[1, -1], [-1, 1]]){   // its legs, either side
      for (const [k, y] of [[0, 19], [1, 22], [2, 25]]){ const x0 = 16 + sx * 8, x1 = 16 + sx * (12 + k); p.flat(path([[x0, y], [x1, y - 2], [x1 + sx * 2, y + 3]], .7), '#B8332B'); }
    }
    for (const sx of [1, -1]){   // its claws, up on their arms
      p.flat(path([[16 + sx * 8, 17], [16 + sx * 11, 12], [16 + sx * 11, 9]], 1), '#C83A30');
      p.fill(or(O(16 + sx * 10.5, 6.5, 3.6, 3.2), O(16 + sx * 13.5, 6, 1.8, 3)), '#E04A3C', {edge: true});
      p.flat(path([[16 + sx * 12.5, 4.5], [16 + sx * 12, 7]], .45), '#7E1E18');   // the gap in its pincers
    }
    p.fill(O(16, 19, 10, 7), '#E04A3C', {edge: true});                                                         // its shell
    p.flat(O(13.5, 17, 4.5, 2.2), '#F47C66');
    for (const sx of [1, -1]){ p.flat(path([[16 + sx * 2.5, 13], [16 + sx * 3, 9.5]], .6), '#B8332B'); p.fill(O(16 + sx * 3, 9, 1.6), '#1E1A16'); p.dot(16 + sx * 3 - 1, 8, '#FFFFFF'); }   // eyes on stalks
    p.flat(path([[13, 22.5], [16, 23.5], [19, 22.5]], .5), '#9E2A22');                                         // its mouth
  },
  '虾': p => {   // shrimp, from the riverside brook's clear shallows: curled like a C, coral pink with pale bands, its head up on the right, long thin feelers, little legs, a fan tail
    const at = (deg, r = 8) => [15 + r * Math.cos(deg * Math.PI / 180), 16 + r * Math.sin(deg * Math.PI / 180)];
    for (let t = 0; t <= 1; t += .02){   // its two long feelers, thin, sweeping forward and back over its head
      const a = [17 - 15 * t, 6 - 6 * Math.sin(t * 2.6)], b = [18 - 12 * t, 5.5 - 5 * Math.sin(t * 2.2) - 1];
      p.dot(Math.round(a[0]), Math.round(a[1]), '#A8322A'); p.dot(Math.round(b[0]), Math.round(b[1]), '#A8322A');
    }
    [[150, 0], [172, 1]].forEach(([d], i) => { const [x, y] = at(d); p.fill(Pg([[x + 1, y], [x - 6, y - 4 + i * 3], [x - 4, y + 3 + i]]), '#E85F5A', {edge: true}); });   // its fan tail
    for (const [d, r] of [[132, 2.7], [108, 3.2], [83, 3.7], [58, 4.1], [33, 4.5], [8, 4.8]]){ const [x, y] = at(d); p.fill(O(x, y, r), '#F47C72', {edge: true}); }   // its body, in segments
    for (const d of [45, 70, 95, 120]){ const [x0, y0] = at(d, 12), [x1, y1] = at(d, 6.5); p.flat(path([[x0, y0], [x1, y1]], .4), '#FFC7B8'); }   // pale bands between them
    for (const d of [20, 45, 70, 95]){ const [x0, y0] = at(d, 4.2), [x1, y1] = at(d + 10, 2); p.flat(path([[x0, y0], [x1, y1]], .45), '#B8443A'); }   // little legs
    const [hx, hy] = at(-35); p.fill(O(hx - .5, hy - 1, 5.6, 4.6), '#F47C72', {edge: true});   // its head
    p.fill(O(hx - 3.2, hy - 1.8, 1.4), '#1E1A16');   // its eye
  },
  '鱼竿': p => {   // fishing rod: a long bamboo rod, from the bottom left up to the top right, its line hanging down to a red and white float (unlike 棍子: a short branch with a leaf)
    p.fill(path([[3, 29], [27, 4]], 1.5), '#C9B25A', {light: '#E8D488', dark: '#8E7A30'});
    [[9, 22.8], [15, 16.5], [21, 10.2]].forEach(([x, y]) => p.flat(Cp(x - 1.2, y - 1.2, x + 1.2, y + 1.2, .7), '#7E6A26'));   // its joints
    p.fill(O(5.5, 26.5, 2.6), '#8A5A32', {edge: true});                                     // its reel, wound with line
    p.flat(path([[27, 4], [27.5, 12], [27.5, 18]], .45), '#F4F1EA');                          // the line
    p.fill(and(O(27.5, 21, 2.6, 3.2), Rc(0, 0, 32, 21)), '#E8343C', {edge: true}); p.fill(and(O(27.5, 21, 2.6, 3.2), Rc(0, 21, 32, 11)), '#F4F1EA', {edge: true});   // the float
    p.flat(path([[27.5, 24], [27.5, 28], [26, 29.5], [24.8, 28]], .45), '#9AA2AA');           // and the hook under it
  },
  '地图': p => {   // map: a paper map folded in three, a blue river winding across it, green hills, a dotted path to a red pin (no writing)
    p.fill(Pg([[3, 8], [12, 6], [12, 26], [3, 28]]), '#F2E2B8', {light: '#FFF4D6', dark: '#C9B07A', edge: true});   // its three panels, the middle one in shade
    p.fill(Pg([[12, 6], [21, 8], [21, 28], [12, 26]]), '#DCC896', {light: '#ECDCAE', dark: '#B39A62', edge: true});
    p.fill(Pg([[21, 8], [30, 6], [30, 26], [21, 28]]), '#F2E2B8', {light: '#FFF4D6', dark: '#C9B07A', edge: true});
    p.fill(O(8, 13, 3.2, 2.4), '#7CC46B'); p.fill(O(25.5, 21, 3.4, 2.4), '#7CC46B'); p.fill(O(17, 11, 2.4, 1.8), '#6AAE5A');   // green hills
    p.flat(path([[4, 21], [9, 19], [13, 22], [18, 18], [22, 15], [29, 13]], .9), '#4F9BD9');                        // the river
    [[6, 25], [9, 24], [12, 22.5], [15, 21], [18, 23], [21, 24]].forEach(([x, y]) => p.dot(Math.round(x), Math.round(y), '#8A4A24'));   // a dotted path
    p.fill(O(24, 10.5, 2.6), '#E0443C', {edge: true}); p.flat(Cp(24, 12.5, 24, 15.5, .6), '#5A4126'); p.dot(23, 9, '#FFB0A8');   // to a red pin
  },
  '鱼饵': p => {   // bait: a little clay pot of wriggly pink worms, two hanging over its rim (unlike 蜂蜜: a pot of honey with a dipper)
    p.fill(Rc(7, 15, 18, 14, 4), '#B8683A', {light: '#D88A56', dark: '#8A4A24', edge: true});     // the pot
    p.fill(O(16, 15.5, 9.5, 3), '#8A4A24'); p.flat(O(16, 15.6, 7.6, 1.9), '#4A2C17');              // its rim, and the dark inside
    p.flat(Rc(8, 21, 16, 1.4), '#8A4A24');
    const worm = pts => p.fill(path(pts, 1.4), '#F08FA0', {light: '#FFB8C4', dark: '#C0607A', edge: true});
    worm([[10, 15], [9, 11], [12, 8], [14.5, 10]]); worm([[17, 15], [19, 10.5], [22, 9], [23.5, 12]]); worm([[22, 15], [25.5, 16], [27, 20], [25.5, 23]]);   // worms, wriggling up and over the rim
  },
  '小 鱼': p => {   // a little fish: a tiny one, alone in a lot of water, ripples round it (unlike 鱼: a fish as big as its picture)
    p.flat(O(16, 16, 15, 13), '#BFE2F2'); p.flat(and(O(16, 16, 11, 9), not(O(16, 16, 10, 8))), '#DDF0F8'); p.flat(and(O(16, 16, 15, 13), not(O(16, 16, 14, 12))), '#A8D4EA');
    p.fill(Pg([[19, 16], [23, 12.5], [22, 16], [23, 19.5]]), '#E8772A');
    p.fill(O(15, 16, 4.6, 3.2), '#F28C38', {edge: true}); p.flat(O(14.5, 17.4, 2.6, 1), '#FFC58A');
    p.fill(O(12.2, 15.4, 1.1), '#FFFFFF'); p.dot(12, 15, '#1E1A16');
  },
  '大 鱼': p => {   // a big fish: a great grey-green carp, too big for its picture, its tail cut off by the edge, whiskers and big scales (unlike 鱼: a little orange one)
    p.fill(Pg([[24, 16], [33, 5], [33, 27]]), '#5E7A5A', {edge: true});
    p.fill(Pg([[9, 7], [17, 1], [22, 7]]), '#5E7A5A', {edge: true});
    p.fill(O(15, 16, 15, 10.5), '#7E9A6E', {light: '#A8C090', dark: '#54704E', edge: true});
    p.flat(O(13, 21.5, 10, 3.6), '#D8D0A0');
    [[12, 12], [17, 11], [22, 12.5], [15, 16], [20, 16.5], [25, 16], [18, 20.5], [23, 20]].forEach(([x, y]) => p.flat(and(O(x, y, 2.6, 2.2), not(O(x - .8, y - .6, 2.2, 1.8))), '#5A7650'));   // scales
    p.flat(path([[2, 18.5], [1, 22], [2.5, 25]], .5), '#3E4A30'); p.flat(path([[4, 19.5], [4.5, 23.5]], .5), '#3E4A30');   // whiskers
    p.fill(O(6.2, 13.5, 2.4), '#FFFFFF'); p.flat(Rc(5.5, 13, 2, 2), '#1E1A16');
    p.fill(Pg([[14, 24], [19, 30], [20, 24]]), '#5E7A5A', {edge: true});
  },
  '鸟': p => bird(p, '#5AA0E6', '#3F77C4', '#CDE6FA', '#F2A33A'),   // bird
  // the birds that land near you, each one colour (a blue one is 鸟's own): body, wing and tail, breast, beak and legs
  '红色 的 鸟': p => bird(p, '#D9363E', '#A3242B', '#F7B5A8', '#F2A33A'),   // a red bird
  '黄色 的 鸟': p => bird(p, '#F2C230', '#C9931C', '#FFF0A8', '#E07A2A'),   // a yellow bird
  '白色 的 鸟': p => bird(p, '#F4F4EE', '#C2C6BE', '#FFFFFF', '#F2A33A'),   // a white bird
  '黑色 的 鸟': p => bird(p, '#3A3A40', '#202024', '#6A6A72', '#F2C230'),   // a black bird (its beak yellow, as a blackbird's)
  '绿色 的 鸟': p => bird(p, '#5BAE48', '#3C8530', '#D8F0A8', '#F2A33A'),   // a green bird
  '棕色 的 鸟': p => bird(p, '#9A6A3E', '#6E4626', '#E8D0A8', '#F2A33A'),   // a brown bird
  '橙色 的 鸟': p => bird(p, '#F28C28', '#C2621A', '#FFD7A8', '#8A4B1E'),   // an orange bird (its beak brown, to stand out)
  '粉色 的 鸟': p => bird(p, '#F08BB0', '#C9648A', '#FFD6E4', '#F2A33A'),   // a pink bird
  '动物': p => {   // animal: a paw print
    p.fill(O(16, 21.5, 7.4, 6.4), '#8A5A3A');
    [[7.6, 12.6], [12.6, 7.8], [19.4, 7.8], [24.4, 12.6]].forEach(([x, y]) => p.fill(O(x, y, 2.9, 3.5), '#8A5A3A'));
    p.flat(O(13.5, 19.5, 2.2, 1.6), '#B07A54');
  },
  '洞': p => {   // cave
    p.fill(or(O(16, 21, 15.4, 12), Rc(0, 21, 32, 9)), '#8E8A7E', {edge: true});
    p.flat(or(O(9, 13, 3.5, 2), O(22, 12, 4, 2.2)), '#B8B4A8');
    p.fill(and(O(16, 25, 8.5, 9.5), Rc(0, 0, 32, 29)), '#2A2622', {dark: '#1A1714', light: '#3E3832'});
    p.flat(and(O(16, 27, 5.5, 6.5), Rc(0, 0, 32, 29)), '#141210');
    p.fill(Rc(0, 28, 32, 4), '#6CC066');
  },
  '吃': p => {   // to eat: a bowl of rice and chopsticks
    p.fill(Cp(23.5, 3.5, 15.5, 18, 1), '#C08A50'); p.fill(Cp(27.5, 5, 18.5, 18, 1), '#A87440');
    p.fill(O(16, 18.5, 10, 4.2), '#FAF7EE');
    [[11, 17], [14, 16], [18, 16], [21, 17], [16, 18], [12, 19], [20, 19]].forEach(([x, y]) => p.dot(x, y, '#E2DCCB'));
    p.fill(and(O(16, 19, 12, 10), Rc(0, 20, 32, 12)), '#F4F1EA', {edge: true});
    p.flat(and(O(16, 19, 12, 10), Rc(0, 23, 32, 2)), '#4F82B0');
    p.fill(Rc(12, 28, 8, 2), '#D9D4C8');
    p.flat(path([[8, 12], [7, 9], [8.5, 6]], .5), '#C8D4D0'); p.flat(path([[12, 11], [11, 8], [12.5, 5]], .5), '#C8D4D0');
  },
  '喝': p => {   // to drink: a glass of juice with a straw
    p.fill(path([[17, 17], [21, 5], [25, 3]], 1), '#E0443C');
    p.fill(Pg([[8.5, 9], [23.5, 9], [21.5, 30], [10.5, 30]]), '#CFEAF5');
    p.fill(Pg([[9.6, 14], [22.4, 14], [20.8, 29], [11.2, 29]]), '#F2A33A', {edge: true});
    p.flat(Rc(12, 16, 4, 3), '#FFF4D6');
    p.flat(path([[10.5, 11], [11.5, 26]], .5), '#FFFFFF');
  },
  '朋友': p => {   // friend: a monkey and a rabbit, with a heart
    p.fill(or(O(12.5, 3, 2.6), O(19.5, 3, 2.6), Pg([[10, 4], [22, 4], [16, 10.5]])), '#E0446A');
    p.fill(O(9, 27, 5.5, 4.5), FUR); p.flat(O(9, 28, 3, 3), SKIN);
    p.fill(O(3.4, 17.5, 2.2, 2.4), FUR); p.fill(O(14.6, 17.5, 2.2, 2.4), FUR);
    p.fill(O(9, 18, 6, 5.4), FUR, {edge: true});
    p.flat(or(O(7, 18, 2.3, 2.5), O(11, 18, 2.3, 2.5), O(9, 20.8, 3.2, 2.1)), SKIN);
    p.eye(6, 17); p.eye(10, 17); p.dot(8, 21, '#A86A48'); p.dot(9, 21, '#A86A48');
    p.fill(O(23.5, 27.5, 5.2, 4.2), WHITE);
    p.fill(O(20.8, 11, 1.8, 5), WHITE); p.fill(O(26.2, 11, 1.8, 5), WHITE);
    p.flat(O(20.8, 11.5, .8, 3.6), '#F4A6B0'); p.flat(O(26.2, 11.5, .8, 3.6), '#F4A6B0');
    p.fill(O(23.5, 19.5, 5.2, 4.6), WHITE, {edge: true});
    p.eye(21, 18); p.eye(25, 18); p.dot(23, 21, '#F48A9A'); p.dot(24, 21, '#F48A9A');
  },
  '瀑布': p => {   // waterfall
    p.fill(or(Rc(0, 2, 9, 24), Rc(23, 2, 9, 24)), '#8E8A7E');
    p.flat(or(Rc(0, 2, 9, 2), Rc(23, 2, 9, 2)), '#6CC066');
    p.fill(Rc(9, 2, 14, 23), '#8FD0EE');
    [[11, 4, 14], [14, 7, 16], [17, 3, 12], [20, 8, 15]].forEach(([x, y, h]) => p.flat(Rc(x, y, 1, h), '#FFFFFF'));
    p.fill(O(16, 27, 16, 4.6), BLUE);
    p.flat(or(O(11, 25, 3, 1.2), O(16, 24.6, 3.4, 1.3), O(21, 25, 3, 1.2)), '#FFFFFF');
  },
  '老板': p => {   // shop owner: behind the stall's counter
    p.fill(or(Rc(3, 6, 2, 18), Rc(27, 6, 2, 18)), '#6B4A2A');
    p.fill(O(16, 17, 5.6, 5), FUR); p.fill(O(10.5, 17, 1.8, 2), FUR); p.fill(O(21.5, 17, 1.8, 2), FUR);
    p.flat(or(O(14.4, 17, 1.9, 2.1), O(17.6, 17, 1.9, 2.1), O(16, 19.4, 2.6, 1.6)), SKIN);
    p.eye(13, 16); p.eye(17, 16);
    for (let i = 0; i < 8; i++) p.flat(Rc(1 + i * 4, 3, 4, 5), i % 2 ? '#F4F1EA' : '#C0392B');
    for (let i = 0; i < 8; i++) p.flat(O(3 + i * 4, 8, 2, 1.2), i % 2 ? '#F4F1EA' : '#C0392B');
    p.fill(Rc(1, 22, 30, 9), WOOD, {edge: true}); p.flat(Rc(2, 25, 28, 1), '#8A5A32');
    p.fill(O(8, 21, 2, 1.8), '#F7A08F'); p.fill(O(12, 21, 2, 1.8), '#F7A08F'); p.fill(O(21, 21, 2, 1.8), '#E0303A'); p.fill(O(25, 21, 2, 1.8), '#E0303A');
  },
  '头带': p => headband(p, '#C0392B', '#A82E22', '#E25A4C'),   // headband: a red cloth band, tied with a knot, its ends hanging
  // the 老板's headbands in every other colour (a red one is 头带's own): the cloth, its knot and ends, and a fold of it
  '黄色 的 头带': p => headband(p, '#F2CC2E', '#C9A21C', '#FFE57A'),
  '白色 的 头带': p => headband(p, '#F4F2EA', '#C9C5B8', '#FFFFFF'),
  '黑色 的 头带': p => headband(p, '#3A3438', '#221E22', '#5E565C'),
  '蓝色 的 头带': p => headband(p, '#3A6DD0', '#2A52A0', '#6E9AE8'),
  '绿色 的 头带': p => headband(p, '#2FA350', '#227A3A', '#62C47E'),
  '棕色 的 头带': p => headband(p, '#8A5A32', '#643E20', '#B07E50'),
  '橙色 的 头带': p => headband(p, '#F07A22', '#C25A14', '#FFA45A'),
  '粉色 的 头带': p => headband(p, '#F59AC6', '#D06E9E', '#FFC4DE'),

  '跳': p => {   // to jump: a monkey leaping, arms up
    p.flat(O(16, 30, 7, 1.4), '#5DA651');
    p.flat(path([[5, 26], [8, 23]], .6), '#9FD0E8'); p.flat(path([[25, 26], [22, 23]], .6), '#9FD0E8');
    p.fill(path([[11, 13], [6, 7], [5, 3]], 1.5), FUR); p.fill(path([[21, 13], [26, 7], [27, 3]], 1.5), FUR);
    p.fill(path([[13, 20], [10, 23], [12, 26]], 1.6), FUR); p.fill(path([[19, 20], [22, 23], [20, 26]], 1.6), FUR);
    p.fill(O(16, 17.5, 5, 4.6), FUR, {edge: true}); p.flat(O(16, 18.3, 2.8, 3), SKIN);
    p.fill(O(10.5, 9, 2.3, 2.4), FUR); p.fill(O(21.5, 9, 2.3, 2.4), FUR);
    p.fill(O(16, 9, 5.6, 5), FUR, {edge: true});
    p.flat(or(O(14.2, 9, 2.1, 2.3), O(17.8, 9, 2.1, 2.3), O(16, 11.6, 2.9, 1.8)), SKIN);
    p.eye(13, 8); p.eye(17, 8); p.flat(path([[14.5, 12.5], [16, 13.4], [17.5, 12.5]], .5), '#A86A48');
  },
  '桥': p => {   // bridge: a stone arch over water
    p.fill(Rc(0, 22, 32, 9), BLUE);
    p.flat(or(Rc(4, 25, 4, 1), Rc(22, 27, 5, 1), Rc(13, 29, 4, 1)), '#8ACFF0');
    p.fill(and(Rc(1, 12, 30, 10), not(O(16, 24, 9, 8))), STONE, {edge: true});
    [[4, 15], [10, 14], [20, 14], [26, 15], [7, 18], [24, 18]].forEach(([x, y]) => p.flat(Rc(x, y, 3, 1), '#8A867A'));
    p.fill(Rc(0, 9, 32, 3), '#C8C4B6');
    p.fill(or(Rc(3, 5, 2, 4), Rc(11, 5, 2, 4), Rc(19, 5, 2, 4), Rc(27, 5, 2, 4)), '#C8C4B6');
  },
  '床': p => {   // bed
    p.fill(or(Rc(3, 9, 4, 21), Rc(26, 15, 3, 15)), '#8A5A32');
    p.fill(Rc(6, 17, 21, 6), '#F4F1EA');
    p.fill(Rc(13, 16, 14, 8), '#5A8FD0', {edge: true}); p.flat(Rc(13, 18, 14, 1), '#7FB0E8');
    p.fill(O(10.5, 16.5, 3.6, 2.2), '#FFFFFF', {edge: true});
    p.fill(Rc(6, 23, 21, 3), '#6B4A2A');
  },
  '睡觉': p => {   // to sleep: a monkey asleep on a pillow, tucked in, with Zs
    p.fill(O(14, 21, 12, 4.2), '#F4F1EA', {edge: true});   // the pillow
    p.fill(O(7.5, 15.5, 2.3, 2.4), FUR); p.fill(O(20.5, 15.5, 2.3, 2.4), FUR);   // ears
    p.fill(O(14, 16, 6, 5.4), FUR, {edge: true});
    p.flat(or(O(12.2, 16, 2.1, 2.3), O(15.8, 16, 2.1, 2.3), O(14, 18.6, 2.9, 1.8)), SKIN);
    [[11, 16], [12, 17], [13, 16], [15, 16], [16, 17], [17, 16]].forEach(([x, y]) => p.dot(x, y, '#1E1A16'));   // eyes closed
    p.dot(14, 19, '#A86A48');
    p.fill(Rc(1, 22, 30, 9), '#5A8FD0', {edge: true}); p.flat(Rc(1, 24, 30, 1), '#7FB0E8');   // the blanket, up to its chin
    p.fill(path([[21, 2], [28, 2], [21, 9], [28, 9]], .7), '#CFE8F7');   // a big Z
    p.fill(path([[14, 5], [18.5, 5], [14, 10], [18.5, 10]], .55), '#CFE8F7');   // and a little one
  },
  '碗': p => {   // bowl
    p.fill(Rc(12, 26, 8, 3), '#D9D4C8');
    p.fill(and(O(16, 16, 13, 11), Rc(0, 16, 32, 16)), '#F4F1EA');
    p.flat(and(O(16, 16, 13, 11), Rc(0, 20, 32, 2)), '#4F82B0');
    p.fill(O(16, 16, 13, 3), '#E6E1D5'); p.flat(O(16, 16.6, 11, 2), '#C9C3B4');
  },
  '桌子': p => {   // table
    p.fill(or(Rc(5, 15, 3, 15), Rc(24, 15, 3, 15)), '#8A5A32');
    p.fill(Rc(5, 14, 22, 3), '#6B4A2A');
    p.fill(Pg([[5, 9], [27, 9], [30, 14], [2, 14]]), WOOD, {edge: true});
    p.fill(Rc(2, 14, 28, 2), '#9C6A39');
  },
  '家': p => {   // home
    p.fill(Rc(22, 5, 3, 7), '#9C6A39');
    p.fill(Rc(6, 15, 20, 13), '#F2E2C2');
    p.fill(Rc(13, 19, 6, 9), '#8A5A32', {edge: true}); p.dot(17, 23, GOLD);
    p.fill(Rc(20, 18, 4, 4), '#9FD0E8', {edge: true}); p.fill(Rc(8, 18, 4, 4), '#9FD0E8', {edge: true});
    p.fill(Pg([[2, 16.5], [16, 4], [30, 16.5]]), '#C0392B');
    p.fill(Rc(0, 28, 32, 3), '#6CC066');
  },
  '王': p => {   // king: a crown
    p.fill(Pg([[5, 22], [4, 10], [10.5, 16], [16, 6.5], [21.5, 16], [28, 10], [27, 22]]), GOLD);
    p.fill(O(4, 9, 1.8), GOLD); p.fill(O(16, 5.5, 2), GOLD); p.fill(O(28, 9, 1.8), GOLD);
    p.fill(Rc(5, 21, 22, 6), '#E0A83A', {edge: true});
    p.fill(O(10, 24, 1.8), '#E0443C'); p.fill(O(16, 24, 1.8), '#3F8FCB'); p.fill(O(22, 24, 1.8), '#4FA34A');
  },
  '一': p => { p.fill(Rc(5, 5, 22, 22, 4), '#FAFAF5', {dark: '#C9C6BC'}); p.fill(O(16, 16, 2.8), RED); },
  '二': p => { p.fill(Rc(5, 5, 22, 22, 4), '#FAFAF5', {dark: '#C9C6BC'}); p.fill(O(11, 11, 2.6), RED); p.fill(O(21, 21, 2.6), RED); },
  '三': p => { p.fill(Rc(5, 5, 22, 22, 4), '#FAFAF5', {dark: '#C9C6BC'}); p.fill(O(10.5, 10.5, 2.4), RED); p.fill(O(16, 16, 2.4), RED); p.fill(O(21.5, 21.5, 2.4), RED); },
  '四': p => dice(p, [[10.5, 10.5], [21.5, 10.5], [10.5, 21.5], [21.5, 21.5]]),
  '五': p => dice(p, [[10.5, 10.5], [21.5, 10.5], [16, 16], [10.5, 21.5], [21.5, 21.5]]),
  '六': p => dice(p, [[10.5, 9.5], [21.5, 9.5], [10.5, 16], [21.5, 16], [10.5, 22.5], [21.5, 22.5]]),
  '七': p => twoDice(p, 7), '八': p => twoDice(p, 8), '九': p => twoDice(p, 9), '十': p => twoDice(p, 10),
  '红色': p => splat(p, '#E0303A'),
  '黄色': p => splat(p, '#F2C93A'),
  '白色': p => splat(p, '#F8F6F0'),
  '黑色': p => splat(p, '#2B2727'),
  '蓝色': p => splat(p, '#3A6DB5'),
  '绿色': p => splat(p, '#3E9C4F'),
  '棕色': p => splat(p, '#7A4A27'),
  '橙色': p => splat(p, '#EE8429'),
  '粉色': p => splat(p, '#F4A0C2'),
  '路': p => {   // path: a sandy path winding away up a grassy slope, narrowing into the distance
    p.fill(Rc(1, 8, 30, 23, 5), '#6CB35C', {light: '#8CCB6E', dark: '#4F9446'});
    p.fill(Pg([[7, 31], [24, 31], [20, 25], [13.5, 20.5], [17.5, 15], [21, 10.5], [18, 10.5], [12, 15], [8.5, 20.5], [11.5, 25.5]]), '#D9BB8A', {light: '#EBD3A8', dark: '#B9965F'});
    p.flat(or(O(15, 27, 1.2, .8), O(12.5, 22, 1, .7), O(16, 17, .9, .6)), '#C6A473');   // ruts
    p.fill(O(4.5, 23.5, 2, 1.5), '#A9A598'); p.fill(O(27, 18.5, 1.8, 1.3), '#A9A598');   // stones by the path
    p.fill(Rc(25, 6, 2, 5), '#8A5A32'); p.fill(O(26, 5.5, 3.6, 4), '#3F9A4C', {light: '#6CC066'});   // a tree far up the path
    p.flat(or(Rc(5, 13, 1, 2), Rc(8, 11, 1, 2), Rc(27, 26, 1, 2)), '#4F9446');   // tufts
  },
  '棍子': p => {   // stick: a straight branch with a knot, a stub and one leaf
    p.fill(path([[6, 27], [26, 5]], 2.1), '#9A6A3E', {light: '#C49461', dark: '#6E4A2A'});
    p.fill(path([[17, 15], [21.5, 17.5]], 1.2), '#9A6A3E', {light: '#C49461', dark: '#6E4A2A', edge: true});
    p.fill(O(23, 18.5, 3, 1.8), '#5FA85A', {light: '#8CC86A'});
    p.flat(O(12, 21, 1.4, 1.1), '#6E4A2A'); p.flat(O(20, 12, 1.2, 1), '#6E4A2A');
    p.flat(O(26, 5, 1.6, 1.6), '#E2C08E'); p.dot(26, 5, '#B98A55');   // the cut end
  },
  '学校': p => {   // school: a long building with a grey tiled roof curling up at its ends, a door, windows, and a bell
    p.fill(Rc(3, 17, 26, 12), '#E9D9B4', {edge: true});
    for (const x of [5, 10, 19, 24]) p.fill(Rc(x, 19, 3, 4), '#9FD0E8', {edge: true});
    p.fill(Rc(13, 20, 6, 9), '#8A5A32', {edge: true}); p.flat(Rc(16, 21, 1, 8), '#5E3B1F');
    p.fill(Pg([[0, 17.5], [1, 13.5], [6, 10], [26, 10], [31, 13.5], [32, 17.5]]), '#64707C', {light: '#7C8996', dark: '#4A5561', edge: true});
    p.flat(Rc(6, 12, 20, 1), '#56616C'); p.flat(Rc(3, 15, 26, 1), '#56616C');
    p.fill(Rc(13, 4, 6, 6), '#8A5A32', {edge: true}); p.fill(O(16, 7.5, 2.2, 2.4), GOLD);   // the bell, in its little tower
    p.flat(Rc(12, 3, 8, 1), '#4A5561');
    p.fill(Rc(0, 29, 32, 2), '#6CC066');
  },
  '老师': p => {   // teacher: the old monkey, with his white beard, pointing at a blackboard
    p.fill(Rc(1, 3, 22, 16), '#6B4A2A'); p.flat(Rc(2, 4, 20, 14), '#2F4A3B');
    p.flat(or(Rc(4, 7, 8, 1), Rc(5, 10, 6, 1), Rc(13, 7, 5, 1), Rc(4, 13, 9, 1)), '#DCE8DC');
    p.fill(O(23, 27, 6, 5), '#A9A79F'); p.flat(O(23, 28, 3.5, 3), '#EADCC8');
    p.fill(path([[19, 24], [12, 12]], .9), '#C49461', {edge: true});   // his pointer
    p.fill(O(17.5, 18.5, 2, 2.2), '#A9A79F'); p.fill(O(28.5, 18.5, 2, 2.2), '#A9A79F');
    p.fill(O(23, 19, 6, 5.4), '#A9A79F', {edge: true});
    p.flat(or(O(21, 19, 2.3, 2.5), O(25, 19, 2.3, 2.5), O(23, 21.8, 3.2, 2.1)), '#EADCC8');
    p.eye(20, 18); p.eye(24, 18);
    p.flat(or(O(23, 24, 2.6, 1.6), Rc(21, 23, 5, 1)), '#FAFAF5');   // his white beard
  },
  '同学': p => {   // classmates: two little monkeys side by side at their double desk, each with an open book
    for (const cx of [9, 23]){
      p.fill(O(cx - 6, 13.5, 1.8, 2), FUR); p.fill(O(cx + 6, 13.5, 1.8, 2), FUR);
      p.fill(O(cx, 14, 5.6, 5), FUR, {edge: true});
      p.flat(or(O(cx - 2, 14, 2.1, 2.3), O(cx + 2, 14, 2.1, 2.3), O(cx, 16.6, 3, 1.9)), SKIN);
      p.eye(cx - 3, 13); p.eye(cx + 1, 13);
      p.fill(O(cx, 21, 4.6, 3), FUR);
    }
    p.fill(Rc(1, 21, 30, 5), '#D2A46A', {light: '#E6C48E', dark: '#9C6E3E', edge: true}); p.fill(Rc(2, 26, 28, 3), '#9C6E3E');
    p.fill(or(Rc(3, 29, 2, 3), Rc(27, 29, 2, 3)), '#5A3A20');
    for (const bx of [5, 19]){ p.fill(Rc(bx, 21, 8, 3), '#F4F0E4', {edge: true}); p.flat(Rc(bx + 4, 21, 1, 3), '#B8AE98'); }
  },
  '蜂蜜': p => {   // honey: a round clay pot of it, honey dripping over its lip, a wooden dipper in it (chapter 1: the feast)
    const HONEY = '#F2A81D', CLAY = '#B86A3C';
    p.fill(O(25, 28.8, 3.2, 1.3), '#E8A21C');   // a drop of honey on the ground
    p.fill(or(O(16, 21, 10.5, 9), Rc(8, 11, 16, 6, 2)), CLAY, {light: '#D98E5A', dark: '#8E4E2A'});   // the pot
    p.flat(Rc(9, 26, 14, 1), '#8E4E2A');
    p.fill(Rc(7.5, 9, 17, 4, 2), '#C97A48', {light: '#E3A06C', dark: '#8E4E2A', edge: true});          // its lip
    p.flat(O(16, 10.4, 7.5, 1.6), '#7A3E20');                                          // inside
    p.flat(O(16, 10.6, 6.5, 1.1), HONEY);                                              // honey, full to the top
    p.fill(or(Rc(10, 12, 3, 6, 1.5), Rc(18.5, 12, 3, 9, 1.5), Rc(22, 12, 2.4, 4, 1.2)), HONEY, {light: '#FFD266', dark: '#C9820F'});   // dripping over the lip
    p.fill(path([[20, 10], [26.5, 1.5]], 1.1), '#A0703E', {light: '#C99A63', dark: '#6E4A26', edge: true});   // the dipper's handle
    p.fill(O(27, 2.6, 2.2, 2.2), '#A0703E', {light: '#C99A63', dark: '#6E4A26'});                        // its knob
    p.flat(path([[11.5, 19], [13, 23]], .5), '#E3A06C');                                // a shine on the pot
  },
  '木头': p => {   // wood: three cut logs in a little pile, their ends towards you showing the rings
    const log = (x, y) => {   // a log, its cut end at (x, y) and its bark going back to the right
      p.fill(Rc(x - 1, y - 6, 13, 12, 5), BARK, {light: '#B07A48', dark: '#5E3B1F', edge: true});
      p.fill(O(x, y, 6.2, 6), '#E2C08E', {light: '#F2DDB0', dark: '#C49461', edge: true});
      p.flat(and(O(x, y, 4.2, 4), not(O(x, y, 3, 2.8))), '#B98A55');
      p.flat(O(x, y, 1.2, 1.2), '#8A5A32');
    };
    log(13, 11); log(7, 23); log(19, 23);
  },
  '蛇': p => {   // snake: green, coiled, head raised, tongue out
    const G = '#6CA83E', LT = {light: '#A6D86A', dark: '#477A26'};
    p.fill(O(16, 25, 12, 4.5), G, LT);
    p.fill(O(15, 21, 9, 4), G, {...LT, edge: true});
    p.fill(path([[11, 20], [9, 14], [12, 9], [17, 8.5]], 2.4), G, {...LT, edge: true});
    p.fill(O(19.5, 8.5, 4.6, 3.6), G, LT);
    [[10, 26], [16, 27], [22, 26], [13, 22], [18, 22]].forEach(([x, y]) => p.flat(O(x, y, 1.6, .9), '#3F6E22'));
    p.flat(Rc(13, 24, 6, 1), '#E8D27A');
    p.eye(20, 7, '#1E1A16', 2);
    p.flat(path([[24, 9.5], [27, 10], [28.5, 8.6]], .5), '#D83A3A'); p.dot(28, 11, '#D83A3A');
  },
  '蜜蜂': p => {   // bee: a round striped body, see-through wings, a little stinger
    p.fill(or(O(11, 8, 5.5, 4.5), O(19, 7, 5, 4)), '#DDEFF8', {light: '#FFFFFF', dark: '#A9C9DA'});   // wings
    p.fill(Pg([[27.5, 20], [31, 21], [27.5, 22.5]]), '#3A2E22');                                      // stinger
    p.fill(O(17, 20, 10, 7.5), GOLD, {light: '#FFE58A', dark: '#C99A2E'});                             // body
    p.flat(and(O(17, 20, 10, 7.5), or(Rc(13, 0, 3, 32), Rc(19, 0, 3, 32))), '#3A2E22');               // stripes
    p.fill(O(7.5, 19.5, 4.5, 4.5), '#3A2E22', {light: '#5E5048'});                                     // head
    p.eye(5, 18, '#111111', 2); p.dot(5, 18, '#FFFFFF');
    p.fill(path([[6, 15.5], [4, 11.5]], .6), '#3A2E22'); p.fill(path([[9, 15.5], [10, 11.5]], .6), '#3A2E22');   // feelers
  },
  '蝴蝶': p => {   // butterfly: wide orange wings edged in black with white spots, a thin dark body, curled feelers
    const DARK = '#2A2018', side = pts => [pts, pts.map(([x, y]) => [32 - x, y])];   // (each wing and its other side)
    const up = [[16, 12], [8, 4], [2, 5], [1, 11], [5, 16], [15, 17]], low = [[15.5, 17], [8, 18], [5, 24], [9, 29], [14, 26], [16, 20]];
    for (const pts of [...side(up), ...side(low)]) p.fill(Pg(pts), DARK, {light: '#4A3C30'});                  // the wings' black edges
    const upIn = [[15, 12.5], [8.5, 6], [4, 6.8], [3.2, 11], [6.3, 14.8], [14.5, 15.8]], lowIn = [[15, 18], [8.8, 19.2], [6.8, 23.8], [9.3, 27.2], [13.3, 25], [15, 20.5]];
    for (const pts of side(upIn)) p.fill(Pg(pts), '#F28C28', {light: '#FFB866', dark: '#C8641A'});              // orange inside them
    for (const pts of side(lowIn)) p.fill(Pg(pts), '#F7A23C', {light: '#FFC67A', dark: '#C8741A'});
    p.flat(or(path([[14.5, 13], [6, 9]], .45), path([[17.5, 13], [26, 9]], .45), path([[14.5, 19.5], [9.5, 24]], .45), path([[17.5, 19.5], [22.5, 24]], .45)), DARK);   // veins
    for (const [x, y] of [[3, 7], [2.5, 10], [5, 5.5], [8, 27], [6.5, 25]]){ p.dot(x, y, '#FFFFFF'); p.dot(32 - x - 1, y, '#FFFFFF'); }   // white spots on the edges
    p.fill(Rc(15, 10, 2, 17, 1), DARK, {light: '#5A4C40'});                                                    // body
    p.fill(O(16, 9, 2.2, 2), DARK);                                                                            // head
    p.flat(or(path([[15.3, 8], [12, 3], [10.5, 2.5]], .5), path([[16.7, 8], [20, 3], [21.5, 2.5]], .5), O(10.5, 2.5, 1.1), O(21.5, 2.5, 1.1)), DARK);   // feelers
  },
  '蜂王': p => {   // queen bee: a big bee with a long body and a little gold crown with red jewels
    const DARK = '#3A2E22';
    p.fill(or(O(13, 8.5, 6, 4.5), O(21, 8, 5.5, 4)), '#DDEFF8', {light: '#FFFFFF', dark: '#A9C9DA'});   // wings
    p.fill(O(19, 21, 11, 7), '#E8B22E', {light: '#FFD866', dark: '#B5841A'});                          // her long body
    p.flat(and(O(19, 21, 11, 7), or(Rc(15, 0, 2.5, 32), Rc(20.5, 0, 2.5, 32), Rc(26, 0, 2, 32))), DARK);   // stripes
    p.fill(Pg([[29.5, 20.5], [31.8, 21.5], [29.5, 22.5]]), DARK);                                         // stinger
    p.fill(O(8, 19.5, 5, 5), DARK, {light: '#5E5048'});                                                    // head
    p.eye(6, 18, '#111111', 2); p.dot(6, 18, '#FFFFFF');
    p.fill(Pg([[4, 14], [5, 9.5], [7, 12], [8.5, 8.5], [10, 12], [12, 9.5], [12.5, 14]]), GOLD, {light: '#FFE58A', dark: '#C99A2E'});   // her crown
    p.flat(or(O(8.5, 12.2, .9), O(5.6, 12.6, .7), O(11.2, 12.6, .7)), '#D83A3A');                      // its jewels
  },
  '黄蜂': p => {   // wasp: long and thin, unlike the bee's round body: sharp yellow and black bands, a pointed tail with its sting, narrow wings, a cross face
    const DARK = '#2A2018', Y = '#F5C518', LT = {light: '#FFE066', dark: '#C99A10'};
    p.fill(or(O(14, 8.5, 6, 2.6), O(20, 7.5, 5.5, 2.4)), '#DDEFF8', {light: '#FFFFFF', dark: '#A9C9DA'});      // narrow wings
    for (const leg of [[[9, 21], [7, 27], [5, 28]], [[13, 21], [13, 27], [11, 29]], [[17, 21], [19, 27], [18, 29]]]) p.fill(path(leg, .6), DARK);   // legs
    p.fill(O(12.5, 17, 4.5, 3.8), DARK, {light: '#5A4C40'});                                                  // its middle
    const tail = Pg([[16, 14], [24, 13], [30, 18], [24, 23], [16, 21]]);
    p.fill(tail, Y, LT);                                                                                        // its tail, pointed
    p.flat(and(tail, or(Rc(18.5, 0, 2, 32), Rc(23, 0, 2, 32), Rc(27, 0, 1.5, 32))), DARK);                     // black bands
    p.fill(Pg([[29, 17.5], [31.8, 18.2], [29, 19]]), DARK);                                                     // its sting
    p.fill(O(7, 16, 4, 3.8), Y, LT);                                                                            // head
    p.flat(Pg([[4, 13.5], [8.5, 14.6], [8, 15.6], [4, 14.6]]), DARK);                                           // a cross brow
    p.eye(5, 15, '#111111', 2);
    p.fill(path([[6, 12.5], [4, 8]], .55), DARK); p.fill(path([[8.5, 12.5], [9.5, 8]], .55), DARK);              // feelers
  },
  '蜘蛛': p => {   // spider: a round body on eight bent legs, two big eyes, orange spots on its back
    const S = '#4A3D5C', LT = {light: '#6E5E84', dark: '#30263E'};
    const legs = [[[12, 13], [6, 7.5], [2.5, 12]], [[11.5, 15.5], [5, 12.5], [1.5, 18.5]], [[11.5, 18], [5, 18], [2, 24]], [[12.5, 20.5], [7, 23], [4.5, 28]]];
    for (const leg of legs) for (const side of [leg, leg.map(([x, y]) => [32 - x, y])]) p.fill(path(side, .85), '#3A2F48', {light: '#5A4C6C'});
    p.fill(O(16, 20, 7.5, 6.5), S, LT);                                                            // body
    p.flat(or(O(16, 18.5, 2.2, 1.6), O(13, 21.5, 1.3, 1.1), O(19, 21.5, 1.3, 1.1)), '#E08A3C');   // orange spots on its back
    p.fill(O(16, 11.5, 5, 4.5), S, {...LT, edge: true});                                          // head
    p.fill(or(O(13.8, 10.8, 1.9, 2), O(18.2, 10.8, 1.9, 2)), '#FFFFFF', {light: '#FFFFFF', dark: '#D8D4E0'});
    p.dot(14, 11, '#1E1A16'); p.dot(14, 10, '#1E1A16'); p.dot(18, 11, '#1E1A16'); p.dot(18, 10, '#1E1A16');
    p.flat(or(Rc(14.5, 15, 1, 1.5), Rc(16.5, 15, 1, 1.5)), '#2A2236');                            // little fangs
  },
  '野猪': p => {   // wild boar: a bristly brown back, a long snout, two white tusks
    const B = '#7A5236', LT = {light: '#A07250', dark: '#563826'};
    p.fill(or(Rc(9, 25, 3, 5, 1), Rc(22, 25, 3, 5, 1)), '#4A3022');                 // back legs
    p.fill(O(18, 18, 11.5, 8.5), B, LT);                                              // body
    p.flat(path([[9, 11], [14, 9.5], [20, 9.5], [27, 12]], 1), '#3E2A1C');             // its bristly back
    p.fill(or(Rc(12, 25, 3, 6, 1), Rc(25, 25, 3, 6, 1)), '#5E3E28', {edge: true});    // front legs
    p.fill(O(9, 19, 6.5, 5.5), B, {...LT, edge: true});                                // head
    p.fill(Pg([[7, 13], [9.5, 9.5], [11, 14]]), '#563826');                            // ear
    p.fill(Rc(1, 18, 5, 5, 2), '#C08A6A', {light: '#D9A88A'});                         // snout
    p.dot(2, 20, '#3E2A1C'); p.dot(4, 20, '#3E2A1C');
    p.fill(path([[5, 23.5], [4, 20]], .7), '#F4F0E8');                                // a tusk
    p.eye(8, 17, '#1E1A16', 2);
    p.flat(path([[29.5, 15], [31, 13]], .5), '#3E2A1C');                               // tail
  },
  '鹿': p => {   // deer: a sika deer, standing, brown with white spots and branching antlers (unlike the goat: white, curled horns)
    const D = '#C27A3E', LT = {light: '#DE9E62', dark: '#9A5A28'}, ANT = '#9C7B55';
    p.fill(or(Rc(15.5, 20, 2, 9), Rc(26, 20, 2, 9)), '#8E5226');                           // far legs
    p.fill(O(28.4, 14.6, 1.7, 2.1), '#F4F0E8');                                             // white tail
    p.fill(O(20, 17, 8.6, 5), D, LT);                                                       // body
    p.flat(and(O(20, 17, 8.6, 5), Rc(0, 20, 32, 3)), '#E9C79C');                             // pale belly
    [[15, 14], [18, 13], [21, 13], [24, 14], [17, 16], [20, 16], [23, 16], [26, 16]].forEach(([x, y]) => p.dot(x, y, '#FBF1DE'));   // spots
    p.fill(or(Rc(13, 20, 2, 10), Rc(23.5, 20, 2, 10)), D, {...LT, edge: true});            // near legs
    p.flat(or(Rc(13, 29, 2, 1), Rc(23.5, 29, 2, 1), Rc(15.5, 28, 2, 1), Rc(26, 28, 2, 1)), '#3A2A1E');   // hooves
    p.fill(Pg([[9.5, 10], [13, 7.5], [16.5, 14.5], [12.5, 16.5]]), D, LT);                   // neck
    p.fill(path([[8.6, 6.5], [7.6, 3.4], [5.6, 1]], .6), ANT); p.fill(path([[7.8, 3.8], [4.8, 3.6]], .55), ANT);      // antlers
    p.fill(path([[10.4, 6.3], [11.8, 3.2], [13.8, 1]], .6), ANT); p.fill(path([[11.6, 3.6], [14.6, 3.8]], .55), ANT);
    p.fill(Pg([[11.2, 7.4], [16.5, 5.6], [13.4, 9.4]]), D, LT);                              // ear
    p.fill(O(9.2, 9, 3.6, 3.1), D, {...LT, edge: true});                                     // head
    p.fill(O(5.6, 10.6, 2.6, 1.9), D, {...LT, edge: true});                                  // muzzle
    p.dot(3, 10, '#2A1E16'); p.dot(3, 11, '#2A1E16');                                        // nose
    p.eye(8, 8);
  },
  '乌龟': p => {   // turtle: side on, facing left, a high domed brown-green shell with plates, its head and legs out (unlike the sea turtle: flippers, from above)
    const S = '#6E7A3A', SK = '#A8B46A', LT = {light: '#8E9C52', dark: '#4E5826'};
    p.fill(or(Rc(8, 22, 3.6, 6, 1.5), Rc(21, 22, 3.6, 6, 1.5)), SK, {light: '#C2CC88', dark: '#7E8A48', edge: true});   // legs
    p.fill(Pg([[26, 21], [31, 23], [26, 24]]), SK, {dark: '#7E8A48'});                         // tail
    p.fill(O(3.6, 18.5, 3.6, 3), SK, {light: '#C2CC88', dark: '#7E8A48'});                     // head
    p.fill(Rc(5, 19, 4, 3), SK, {dark: '#7E8A48'});                                           // neck
    p.eye(2, 17);
    p.fill(and(O(16.5, 22, 11.5, 11), Rc(0, 0, 32, 22)), S, LT);                              // shell
    p.fill(Rc(5, 21, 23, 2.6, 1.2), '#C9B26A', {dark: '#9A8344'});                            // its rim
    [[11, 15], [16.5, 13], [22, 15], [13.5, 19], [19.5, 19]].forEach(([x, y]) => p.flat(O(x, y, 2.4, 2), '#8E9C52'));   // plates
  },
  '海龟': p => {   // sea turtle: seen from above, swimming, a flat teal shell and four big flippers (unlike the turtle: domed, side on, legs)
    const S = '#2F8F7E', FL = '#8CC7A8', LT = {light: '#4FB09E', dark: '#1E6A5C'};
    p.fill(or(Pg([[11, 11], [2.5, 4.5], [1, 9], [8, 15]]), Pg([[21, 11], [29.5, 4.5], [31, 9], [24, 15]])), FL, {light: '#B6E0C6', dark: '#5E9E7E', edge: true});   // front flippers, big paddles
    p.fill(or(Pg([[11, 22], [5, 27], [8, 29], [13, 25]]), Pg([[21, 22], [27, 27], [24, 29], [19, 25]])), FL, {light: '#B6E0C6', dark: '#5E9E7E', edge: true});   // back flippers
    p.fill(O(16, 5.8, 3.4, 3.6), FL, {light: '#B6E0C6', dark: '#5E9E7E'});                    // head
    p.dot(14, 5, '#1E1A16'); p.dot(18, 5, '#1E1A16');
    p.fill(O(16, 17, 8, 9.5), S, LT);                                                         // shell
    [[16, 12], [12.5, 16], [19.5, 16], [16, 18], [13, 21], [19, 21]].forEach(([x, y]) => p.flat(O(x, y, 1.9, 1.6), '#5FB8A6'));   // plates
  },
  '老鼠': p => {   // mouse: small and grey, side on, facing left, big round ears, a long pink tail (unlike the squirrel: brown, bushy tail)
    const M = '#9E9A94', LT = {light: '#C2BEB8', dark: '#77736D'};
    p.fill(path([[27, 21], [30.5, 17], [29, 11], [25, 9]], .7), '#E8A0A8');                   // tail
    p.fill(O(18.5, 20.5, 9.5, 6.5), M, LT);                                                   // body
    p.flat(and(O(18.5, 20.5, 9.5, 6.5), Rc(0, 24, 32, 4)), '#D9D4CC');                         // pale belly
    p.fill(or(O(13, 27, 2, 1.2), O(22, 27, 2, 1.2)), '#E8A0A8', {dark: '#C47C86'});             // feet
    p.fill(Pg([[2, 19.5], [8, 13.5], [13, 15], [13, 22.5], [6, 22.5]]), M, {...LT, edge: true});   // head
    p.fill(O(11.5, 11.5, 4.2, 4.2), M, LT); p.flat(O(11.5, 11.8, 2.6, 2.6), '#F2B8C0');           // ear, pink inside
    p.dot(2, 19, '#C2606E'); p.dot(3, 19, '#C2606E');                                          // nose
    p.eye(7, 16);
  },
  '青蛙': p => {   // frog: green, sitting facing you, big eyes on top, a wide smile, on a lily pad
    const G = '#5DB34A', LT = {light: '#8AD46A', dark: '#3F8A34'};
    p.fill(O(16, 27.5, 14, 3.4), '#3E8E46', {light: '#5FB060', dark: '#2C6A34'});           // lily pad
    p.fill(or(O(6.5, 23, 5, 4), O(25.5, 23, 5, 4)), G, LT);                                   // back legs
    p.fill(O(16, 19, 10, 8), G, LT);                                                          // body
    p.flat(O(16, 22.5, 6.4, 4.6), '#D2EAA2');                                                 // pale belly
    p.fill(or(Rc(9, 22, 3, 6, 1.5), Rc(20, 22, 3, 6, 1.5)), G, {...LT, edge: true});           // front legs
    p.fill(or(O(10, 10.5, 4.2, 4), O(22, 10.5, 4.2, 4)), G, LT);                              // eye bumps
    p.flat(or(O(10, 10, 2.6, 2.6), O(22, 10, 2.6, 2.6)), '#FFFFFF');                          // eyes
    p.flat(or(Rc(9, 9, 2, 3), Rc(21, 9, 2, 3)), '#1E1A16');                                   // pupils
    p.flat(path([[11, 17], [16, 19], [21, 17]], .5), '#2C6A2C');                              // its smile
    p.dot(15, 14, '#2C6A2C'); p.dot(17, 14, '#2C6A2C');                                       // nostrils
  },
  '马': p => {   // horse: brown, standing, head to the left, a dark mane and tail (unlike the deer: no antlers, no spots; unlike the cow: brown, no horns)
    const H = '#A8683A', LT = {light: '#C98A58', dark: '#7E4A24'}, MANE = '#3A2416';
    p.fill(or(Rc(15.5, 20, 2.2, 9), Rc(26, 20, 2.2, 9)), '#7E4A24');                           // far legs
    p.fill(path([[28.5, 13], [30.6, 19], [30, 25]], 1.2), MANE);                               // tail
    p.fill(O(20.5, 16.5, 9, 5.2), H, LT);                                                     // body
    p.fill(or(Rc(13, 20, 2.4, 10), Rc(23.5, 20, 2.4, 10)), H, {...LT, edge: true});           // near legs
    p.flat(or(Rc(13, 29, 2.4, 1), Rc(23.5, 29, 2.4, 1), Rc(15.5, 28, 2.2, 1), Rc(26, 28, 2.2, 1)), '#2A1E16');   // hooves
    p.fill(Pg([[9, 8], [13.5, 6], [17, 14.5], [12, 16]]), H, LT);                             // neck
    p.fill(path([[12.5, 5.5], [15, 9], [17.5, 13]], 1.3), MANE);                               // mane
    p.fill(Pg([[11.4, 5.4], [12.8, 2], [14, 5.8]]), H, LT);                                    // ear
    p.fill(Pg([[3.2, 13], [6.5, 6], [10.5, 3.8], [14, 6.4], [11.5, 10.5], [7.5, 15.5], [4, 16]]), H, {...LT, edge: true});   // head, long, nose down
    p.fill(O(5.2, 14.4, 2.6, 2), '#7E4A24', {dark: '#5E3418'});                               // muzzle
    p.dot(4, 14, '#2A1E16');                                                                   // nostril
    p.flat(path([[10.4, 5.2], [7, 12]], .55), '#F4E8D4');                                      // a blaze down its face
    p.eye(10, 7);
  },
  '鸭子': p => {   // duck: white, floating on the water, an orange bill (unlike the birds: little, perched, blue or coloured)
    const W = '#F7F5EE', LT = {light: '#FFFFFF', dark: '#D9D3C4'};
    p.fill(Rc(1, 24, 30, 6, 3), '#6FB7E8', {light: '#A8D8F5', dark: '#4A93CC'});             // the water
    p.flat(or(Rc(4, 26, 5, 1), Rc(21, 27, 6, 1)), '#C9E8FA');                                 // ripples
    p.fill(Pg([[24, 17], [31, 12], [29, 20]]), W, LT);                                        // tail
    p.fill(O(18, 20, 10, 6), W, LT);                                                          // body
    p.fill(O(20, 19, 6, 3.2), '#E8E2D4', {light: '#F7F3EA', dark: '#C9C1AE', edge: true});    // wing
    p.fill(Pg([[8, 14], [12, 13], [14, 20], [9, 20]]), W, LT);                                 // neck
    p.fill(O(10, 10, 5, 4.6), W, {...LT, edge: true});                                        // head
    p.fill(Rc(1.5, 10, 6.5, 3.4, 1.6), '#F29A2E', {light: '#FFC060', dark: '#C9741A', edge: true});   // bill
    p.eye(9, 8);
  },
  '猫头鹰': p => {   // owl: facing you, perched on a branch, with ear tufts and big round orange eyes (unlike the birds: side on, little)
    const B = '#8A6440', LT = {light: '#A88158', dark: '#6A4A2C'}, PALE = '#EFE0C2';
    p.fill(Rc(1, 27, 30, 3, 1.5), '#6B4A2A', {light: '#8C6640', dark: '#4A3220'});           // the branch
    p.fill(O(16, 19.5, 9, 9.5), B, LT);                                                      // body
    p.flat(O(16, 21.5, 5.6, 6.6), PALE);                                                     // pale front,
    [[14, 18], [18, 18], [16, 20.5], [13, 22.5], [19, 22.5], [16, 25]].forEach(([x, y]) => p.flat(Rc(x - .5, y, 2, 1), '#A07A52'));   // with its streaks
    p.fill(or(O(8, 20, 3.4, 7.2), O(24, 20, 3.4, 7.2)), '#6E4A2A', {light: '#8A6440', dark: '#4E3420', edge: true});   // folded wings
    p.fill(or(Pg([[7, 8], [7.5, 1.5], [12.5, 6]]), Pg([[25, 8], [24.5, 1.5], [19.5, 6]])), B, LT);   // ear tufts
    p.fill(O(16, 10.5, 9.4, 7), B, LT);                                                      // head
    p.flat(or(O(11.6, 11, 4.4, 4.4), O(20.4, 11, 4.4, 4.4)), PALE);                          // the pale discs round its eyes
    p.fill(or(O(11.6, 11, 2.8, 2.8), O(20.4, 11, 2.8, 2.8)), '#F29A1E', {light: '#FFC24A', dark: '#C9741A'});   // its big orange eyes
    p.flat(or(O(11.6, 11, 1.3, 1.3), O(20.4, 11, 1.3, 1.3)), '#1E1A16');                     // their pupils
    p.dot(11, 10, '#FFFFFF'); p.dot(20, 10, '#FFFFFF');
    p.fill(Pg([[14.6, 13], [17.4, 13], [16, 16.6]]), '#D9A030', {dark: '#A8741E'});            // beak
    p.flat(or(Rc(12, 27, 2.4, 2), Rc(17.6, 27, 2.4, 2)), '#D9A030');                          // its feet, gripping the branch
  },
  '狼': p => {   // wolf: grey, sitting, howling with its head up (unlike the fox: orange, sitting facing you)
    const G = '#8A9199', LT = {light: '#B0B7BE', dark: '#5E656C'}, PALE = '#DCE0E3';
    p.fill(path([[21, 28.6], [26.5, 28], [30.4, 24.5]], 2.3), G, LT);                        // bushy tail
    p.flat(O(30, 24.6, 1.4, 1.6), '#5F666E');                                                // its dark tip
    p.fill(O(20, 23, 6.6, 6.4), G, LT);                                                      // haunch
    p.fill(Pg([[10, 14], [16.5, 10], [24.5, 19], [21, 29.5], [12, 29.5]]), G, LT);           // body
    p.flat(and(Pg([[10, 14], [16.5, 10], [24.5, 19], [21, 29.5], [12, 29.5]]), not(Rc(0, 15.5, 19, 20))), '#5F666E');   // its darker back
    p.fill(or(Rc(11.6, 20, 2.6, 10), Rc(15.6, 21, 2.6, 9)), G, {...LT, edge: true});         // front legs
    p.flat(O(13.2, 19, 2.4, 4.6), PALE);                                                     // pale chest
    p.fill(Pg([[8.6, 10.6], [3, 2.4], [5.4, .6], [14, 7.2]]), G, LT);                        // long snout, pointing up
    p.fill(Pg([[13, 7], [17.4, 1.6], [18.4, 9.6]]), G, {...LT, edge: true});                 // pointed ear
    p.flat(Pg([[14.6, 6.4], [17, 3.8], [17.3, 8]]), '#4A4F55');                              // inside it
    p.fill(O(12.4, 10, 4.4, 4), G, {...LT, edge: true});                                     // head
    p.flat(Pg([[9.2, 12], [5.4, 6.4], [7.2, 5.8], [11, 10.6]]), PALE);                       // pale throat
    p.flat(path([[8.3, 7.6], [5.2, 2.6]], .5), '#2A2A2E');                                   // its open mouth, howling
    p.dot(3, 1, '#2A2A2E'); p.dot(4, 1, '#2A2A2E'); p.dot(3, 2, '#2A2A2E');                 // nose
    p.flat(path([[10.4, 7.6], [12.6, 7]], .45), '#2A2A2E');                                  // eye, shut tight
  },
  '牛': p => {   // cow: a black-and-white cow, standing, head to the left, with short horns, a pink muzzle and udder (unlike the goat: all white, curled horns, a beard; unlike the sheep: woolly)
    const W = '#F7F4EC', K = '#2B2724', LT = {light: '#FFFFFF', dark: '#D8D2C4'};
    p.fill(or(Rc(15, 20, 2.6, 9), Rc(25.5, 20, 2.6, 9)), '#DCD6C8');                        // far legs
    p.fill(path([[28.8, 13], [30.2, 19], [29.6, 23.5]], .7), '#DCD6C8');                     // tail
    p.fill(O(29.6, 24.4, 1.4, 1.8), K);                                                      // and the tuft at its end
    p.fill(Rc(10.5, 11, 19, 11, 4), W, LT);                                                  // body
    p.flat(and(Rc(10.5, 11, 19, 11, 4), or(O(15.5, 13, 3.6, 2.6), O(24.5, 17, 3.4, 3.2), O(28.2, 12.2, 2.4, 2))), K);   // patches
    p.fill(O(21, 22.2, 3, 1.6), '#F2A7A8', {dark: '#D8858A'});                               // udder
    p.fill(or(Rc(12.5, 20, 2.7, 10), Rc(23, 20, 2.7, 10)), W, {...LT, edge: true});          // near legs
    p.flat(or(Rc(12.5, 29, 2.7, 1.2), Rc(23, 29, 2.7, 1.2), Rc(15, 28.5, 2.6, 1), Rc(25.5, 28.5, 2.6, 1)), '#3A3430');   // hooves
    p.fill(Pg([[7, 10], [12, 9], [13, 16], [9, 16]]), W, LT);                                // neck
    p.fill(or(path([[7, 6], [5.6, 3.2]], .9), path([[10.6, 6], [12, 3.2]], .9)), '#E8DCC0', {dark: '#BFAF8C'});   // short horns
    p.fill(Rc(4.2, 5, 8.4, 8.4, 3.2), W, {...LT, edge: true});                               // head
    p.flat(and(Rc(4.2, 5, 8.4, 8.4, 3.2), O(10.8, 7, 2.4, 2.6)), K);                        // a patch round one eye
    p.fill(O(12.9, 7.4, 1.9, 1.1), W, {dark: '#D8D2C4', edge: true});                        // ear
    p.fill(Rc(2.6, 11, 7.4, 4.6, 2.2), '#F2A7A8', {light: '#F8C7C7', dark: '#D8858A', edge: true});   // muzzle
    p.dot(4, 13, '#9A4C50'); p.dot(7, 13, '#9A4C50');                                         // nostrils
    p.eye(6, 7);
  },
  '牛奶': p => {   // milk: a tall glass of it, full to the brim, a drop running down the side (unlike yoghurt: thick, in a jar, with a spoon; unlike 喝: a drink with a straw)
    const MILK = '#FBFAF4';
    p.fill(Pg([[8.5, 5], [23.5, 5], [22, 29], [10, 29]]), '#BFDCEC', {light: '#E6F3FA', dark: '#8EB4C9', edge: true});   // the glass
    p.fill(Pg([[9.8, 8], [22.2, 8], [21, 27.4], [11, 27.4]]), MILK, {light: '#FFFFFF', dark: '#E2DED2'});               // the milk in it
    p.flat(O(16, 8, 6.2, 1.2), '#FFFFFF');                                                    // its top
    p.fill(or(Rc(19.5, 6, 2.4, 6, 1.2), O(20.7, 12.6, 1.4, 1.6)), MILK, {dark: '#E2DED2'});  // a drop over the brim
    p.flat(or(Rc(11.5, 10, 1.4, 14), Rc(13.3, 12, .9, 6)), '#FFFFFF');                       // shine on the glass
    p.fill(O(25.5, 28.8, 2.6, 1), MILK, {dark: '#E2DED2'});                                   // a little puddle
  },
  '酸奶': p => {   // yoghurt: a green-glazed jar of it, thick white yoghurt heaped at its top and a wooden spoon in it (unlike the bowl: white with a blue band; unlike honey: a brown pot, dripping gold)
    p.fill(or(O(16, 21, 10, 8.4), Rc(10, 12, 12, 6, 2)), '#8FC4A6', {light: '#B8E0C8', dark: '#5E9478'});   // the jar
    p.flat(and(O(16, 21, 10, 8.4), Rc(0, 19, 32, 1)), '#6FAA8A');                            // a line round it
    p.flat(path([[10.5, 18], [11.8, 24]], .5), '#C6EAD4');                                   // a shine
    p.fill(Rc(8.6, 9.5, 14.8, 3.4, 1.6), '#7DB696', {light: '#B8E0C8', dark: '#4E8468', edge: true});   // its lip
    p.fill(or(O(16, 9.4, 6.4, 2.4), O(14.4, 7.6, 3.2, 2), O(17.6, 6.6, 2.2, 1.6)), '#FFFFFF', {dark: '#E4E0D4'});   // thick yoghurt, heaped up
    p.fill(path([[19, 8], [25.8, 1.4]], 1.1), '#B9884E', {light: '#D9AE72', dark: '#86602F', edge: true});   // the spoon's handle
  },
  '奶酪': p => {   // cheese: a big yellow wedge of it with holes
    const LT = {light: '#FFE58A', dark: '#C9952A'};
    p.fill(Pg([[3, 19], [24, 8], [29, 13], [29, 26], [3, 26]]), '#F4C542', {...LT, edge: true});   // the wedge: its top
    p.fill(Pg([[3, 19], [29, 13], [29, 26], [3, 26]]), '#EDB534', {...LT, edge: true});      // its front, cut
    p.flat(Pg([[24, 8], [29, 13], [29, 14], [23.5, 9]]), '#D8A238');                          // the rind's edge
    for (const [x, y, r] of [[9, 21.5, 1.8], [15.5, 19, 1.4], [21, 22.5, 2.2], [26, 18.4, 1.3], [13, 24.4, 1.1], [25.2, 24.6, 1]]) p.fill(O(x, y, r), '#C99328', {light: '#B07E1E'});   // holes
    for (const [x, y, r] of [[17, 14.4, 1.2], [22, 12.2, 1]]) p.fill(O(x, y, r * 1.3, r * .7), '#D8A238');
  },
  '熊': p => {   // bear: a big brown bear standing up on its hind legs, its front paws raised, round ears (unlike the wild boar: on all fours, with tusks; unlike the wolf: grey, howling)
    const B = '#8A5A34', LT = {light: '#A87448', dark: '#5E3A20'}, MUZ = '#D2A982';
    p.fill(or(Rc(9.4, 25, 5.4, 6, 2.2), Rc(17.2, 25, 5.4, 6, 2.2)), B, {...LT, edge: true});   // its hind legs
    p.fill(O(16, 21, 8.6, 8.4), B, LT);                                                       // its big body
    p.flat(O(16, 23, 4.6, 5), '#9C6A40');                                                    // its belly, a little lighter
    p.fill(path([[9.5, 16.5], [4.6, 9.6]], 2.4), B, {...LT, edge: true});                     // its front legs, raised
    p.fill(path([[22.5, 16.5], [27.4, 9.6]], 2.4), B, {...LT, edge: true});
    for (const x of [3.2, 4.6, 6]) p.dot(Math.round(x), 7, '#F4EEE2');                       // claws
    for (const x of [26, 27.4, 28.8]) p.dot(Math.round(x), 7, '#F4EEE2');
    p.fill(or(O(10.4, 4.8, 2.6), O(21.6, 4.8, 2.6)), B, {...LT, edge: true});                // round ears
    p.flat(or(O(10.4, 4.8, 1.2), O(21.6, 4.8, 1.2)), '#5E3A20');
    p.fill(O(16, 10, 6.8, 6.2), B, {...LT, edge: true});                                     // its head
    p.fill(O(16, 12.6, 3.8, 2.8), MUZ, {light: '#E6C29C', dark: '#A8805A'});                 // its muzzle
    p.flat(O(16, 11.4, 1.5, 1.1), '#1E1A16');                                                // its nose
    p.flat(Rc(15.5, 13, 1, 1.6), '#7A5034');
    p.eye(12, 8); p.eye(18.6, 8);
  },
  '筷子': p => {   // chopsticks: a pair, side by side, lying across a little white rest, their back ends red (unlike 吃: a bowl of rice with chopsticks in it)
    p.fill(Rc(5, 21, 9, 5, 2.4), '#F4F1EA', {dark: '#C9C3B4'});                                     // the rest
    for (const dx of [0, 4.2]){
      p.fill(Pg([[24.6 + dx, 2.5], [27.4 + dx, 4.5], [8 + dx, 30], [6.6 + dx, 29]]), '#C99A62', {light: '#E2BC88', dark: '#9A6A3A', edge: true});   // a chopstick, tapering to its tip
      p.fill(Pg([[24.6 + dx, 2.5], [27.4 + dx, 4.5], [24.6 + dx, 8.4], [22 + dx, 6.6]]), '#C8343A', {light: '#E8606A', dark: '#8E1E24', edge: true});   // its back end, red
    }
  },
  '勺子': p => {   // spoon: a wooden spoon, its round bowl up on the left, its handle down to the right (unlike yoghurt and honey: a jar or a pot, with a spoon in it)
    p.fill(path([[13, 14], [27, 28]], 1.7), '#C99A62', {light: '#E2BC88', dark: '#9A6A3A', edge: true});   // the handle
    p.fill(O(10.5, 10.5, 7.4, 6.4), '#C99A62', {light: '#E2BC88', dark: '#9A6A3A', edge: true});            // its bowl
    p.fill(O(10, 10, 5, 4), '#AE7E48', {light: '#9A6A3A', dark: '#D2A46A'});                                  // hollowed out
    p.flat(O(8.4, 8.6, 1.6, 1), '#E8C898');                                                                   // a shine
  },
  // chapter 1: the big monkey's garden (planned 27 October 2026): seeds from wild fruit, and the fruit itself
  '种子': p => {   // seeds: five big brown seeds, each a teardrop with a pale stripe, lying apart, a green shoot coming out of the middle one (unlike 草: a tuft of grass)
    const seed = (x, y, k) => { p.fill(Pg([[x, y - 5.5 * k], [x + 3.4 * k, y + 1], [x + 2 * k, y + 3.6 * k], [x - 2 * k, y + 3.6 * k], [x - 3.4 * k, y + 1]]), '#7A4A26', {light: '#A8703E', dark: '#4E2C14', edge: true}); p.flat(Cp(x - .6 * k, y - 2.6 * k, x - 1.2 * k, y + 1.6 * k, .5), '#C8955E'); };
    seed(3.5, 24.5, .75); seed(9, 27.5, .75); seed(23, 27.5, .75); seed(28.5, 24.5, .75);
    p.fill(path([[16, 22], [15.6, 14], [16.6, 8]], 1.2), '#5DAE4E', {light: '#86D06E', dark: '#3E8A34'});   // the shoot
    p.fill(O(12, 9.5, 4, 2.2), '#5DAE4E', {light: '#86D06E', dark: '#3E8A34', edge: true});                // and its two little leaves
    p.fill(O(20.6, 7.5, 4, 2.2), '#5DAE4E', {light: '#86D06E', dark: '#3E8A34', edge: true});
    seed(16, 25, 1);                                                                                        // the seed it's growing from
  },
  '西瓜': p => {   // watermelon: a whole one, dark green and striped, and a slice of it in front, red with black seeds (unlike 苹果: small and round)
    p.fill(O(18, 12.5, 12.5, 10.5), '#3E9A3F', {light: '#6CC45A', dark: '#1F6A26'});   // the whole one, behind
    for (const x of [9, 14, 19, 24]) p.flat(and(O(18, 12.5, 12.5, 10.5), path([[x, 2.5], [x - 1.5, 12.5], [x, 22.5]], 1.1)), '#1F5A22');   // its stripes
    p.flat(O(12, 6.5, 3, 1.4), '#9ED98A');                                                                   // a shine
    p.fill(Pg([[12, 14], [23, 28.5], [1, 28.5]]), '#E84848', {light: '#FF7A72', dark: '#B82E34', edge: true});   // a slice, in front, its point up
    p.flat(Rc(1, 28, 22, 1), '#F2F0E0'); p.fill(Rc(0, 29, 24, 2.5, 1), '#2E8A3A', {light: '#5CB44E', dark: '#1F6A26'});   // its white, and its rind
    for (const [x, y] of [[12, 19], [9, 23], [15, 23], [6, 26], [12, 26], [18, 26]]) p.flat(O(x, y, .9, 1.3), '#1A1410');   // its seeds
  },
  '香蕉': p => {   // bananas: a bunch of three, curving up from their stalk, yellow with brown tips (unlike 水果: a basket of all sorts)
    p.fill(path([[4, 15], [3.5, 11.5], [5, 9]], 1.6), '#6B8A2A', {dark: '#4E6E25'});   // the stalk they hang from
    for (const [k, c, l, d] of [[-1, '#E9C53A', '#FBE27A', '#C49A22'], [0, '#F2D24A', '#FFF09A', '#C9A22A'], [1, '#F7DC5C', '#FFF4B0', '#CFA830']]){
      const pts = [[5, 15 + k * 1.5], [11, 22 + k * 4], [19, 24 + k * 4.5], [26.5, 20 + k * 5], [29, 14.5 + k * 5.5]];
      p.fill(path(pts, 2.9), c, {light: l, dark: d, edge: true});                                       // a banana
      p.flat(O(29, 14.5 + k * 5.5, 1.3, 1.1), '#5A3A1E');                                            // its brown tip
    }
    p.flat(O(5, 15, 2.2, 3.2), '#8A6A2A');                                                            // where they join
  },
  '葡萄': p => {   // grapes: one big bunch of round purple grapes hanging from a stalk, a green vine leaf beside it (unlike 水果: a basket of all sorts)
    p.fill(Pg([[17, 7], [21, 2], [27, 1.5], [30.5, 5], [29, 10], [24, 12], [19, 10]]), '#5BAA4B', {light: '#86D06E', dark: '#3E8A34', edge: true});   // the leaf
    p.flat(path([[18, 8], [24, 6], [29, 4]], .5), '#3E8A34');                                                                                  // its vein
    p.fill(path([[15, 1.5], [15.5, 5], [15, 8]], 1.1), '#6B4A2A');                                                                             // the stalk
    for (const [x, y] of [[9, 10.5], [14.5, 10], [20, 11], [11.5, 15], [17, 15], [22.5, 15.5], [8.5, 19.5], [14, 20], [19.5, 20.5], [11, 25], [16.5, 25], [13.5, 29.5]])
      p.fill(O(x, y, 3.1), '#6E3A9E', {light: '#A070D0', dark: '#45206A', edge: true});                                                       // the grapes, front ones lowest
    for (const [x, y] of [[8, 9], [13, 8], [10, 13], [16, 13], [7, 18], [13, 18], [10, 23], [15, 23]]) p.dot(x, y, '#D6B8F0');                // a shine on some
  },
  '跑': p => {   // to run: a monkey running hard, mid-stride, leaning forward, speed lines and dust behind it (unlike 跳: leaping up, arms up)
    p.flat(O(17, 30.5, 8, 1.2), '#5DA651');                                                      // its shadow
    for (const [y, x0, x1] of [[11, 1, 6], [16, 0, 5], [21, 2, 6]]) p.flat(path([[x0, y], [x1, y]], .6), '#9FD0E8');   // speed lines
    p.fill(O(7, 28, 2.6, 1.7), '#E6D8BC', {edge: true}); p.fill(O(3.5, 26.5, 1.8, 1.3), '#E6D8BC', {edge: true});   // dust from its back foot
    p.fill(path([[14, 21], [11, 25], [8, 27.5]], 1.7), FUR);                                      // back leg, kicking back
    p.fill(path([[19, 21.5], [23, 25], [22.5, 29]], 1.7), FUR);                                   // front leg, reaching forward
    p.fill(path([[13.5, 16.5], [10, 16], [7.5, 13]], 1.4), FUR);                                // back arm, swinging back
    p.fill(path([[20.5, 16.5], [24, 19], [27, 17]], 1.4), FUR);                                 // front arm, bent, swinging forward
    p.fill(O(17, 18.5, 5, 4.4), FUR, {edge: true}); p.flat(O(17.8, 19.2, 2.8, 3), SKIN);          // its body, leaning forward
    p.fill(O(13, 9.5, 2.3, 2.4), FUR); p.fill(O(24, 9.5, 2.3, 2.4), FUR);                         // ears
    p.fill(O(18.5, 9.5, 5.6, 5), FUR, {edge: true});                                             // head
    p.flat(or(O(16.7, 9.5, 2.1, 2.3), O(20.3, 9.5, 2.1, 2.3), O(18.5, 12.1, 2.9, 1.8)), SKIN);
    p.eye(16, 8); p.eye(20, 8); p.flat(path([[17, 12.8], [18.5, 13.6], [20, 12.8]], .5), '#A86A48');
  },
  '跑步': p => {   // running, as exercise: a monkey jogging along a path, upright and steady, its footprints behind it (步, steps; unlike 跑: sprinting, speed lines and dust)
    p.fill(Rc(0, 27, 32, 4, 2), '#D9C08E', {dark: '#C2A672'});                                   // a path
    for (const [x, y] of [[2.5, 29.2], [6.5, 28.4], [10.5, 29.3]]) p.flat(or(O(x, y, 1.4, .8), O(x + 1.6, y - .9, .5, .4)), '#8A6A3E');   // footprints behind it
    p.flat(O(18, 29.2, 5, 1), '#B89A68');                                                        // its shadow
    p.fill(path([[15.5, 22], [12.8, 24.6], [10.8, 22.8]], 1.6), FUR);                            // back leg, lifted behind
    p.fill(path([[18.5, 22], [20.6, 25.2], [20, 28.3]], 1.6), FUR);                              // front leg, on the path
    p.fill(path([[20, 16.5], [22.4, 18.6], [24, 16.6]], 1.3), FUR);                              // arms bent, swinging: one back,
    p.fill(O(17.2, 18.4, 4.6, 4.6), FUR, {edge: true}); p.flat(O(17.6, 19.2, 2.6, 2.9), SKIN);   // its body, upright
    p.fill(path([[14.2, 16.6], [12.6, 19.2], [14.8, 21]], 1.3), FUR, {edge: true});              // one forward
    p.fill(O(12, 9.5, 2.3, 2.4), FUR); p.fill(O(23, 9.5, 2.3, 2.4), FUR);                        // ears
    p.fill(O(17.5, 9.5, 5.6, 5), FUR, {edge: true});                                              // head
    p.flat(or(O(15.7, 9.5, 2.1, 2.3), O(19.3, 9.5, 2.1, 2.3), O(17.5, 12.1, 2.9, 1.8)), SKIN);
    p.eye(15, 8); p.eye(19, 8); p.flat(path([[16.1, 12.6], [17.5, 13.4], [18.9, 12.6]], .5), '#A86A48');
    p.fill(O(25, 6.5, 1, 1.5), '#9FD0E8');                                                        // a drop of sweat
  },
  // Area 2, across the sea: the human world (decided 4 November 2026)
  '人': p => {   // person: a man standing, facing you, in a blue jacket and dark trousers (unlike the child: smaller, a round head, a bright jacket)
    const SK = '#F2C9A0';
    p.fill(or(Rc(12, 22, 3.4, 8), Rc(17.6, 22, 3.4, 8)), '#3A3A44', {edge: true});        // legs
    p.flat(or(Rc(11.4, 29, 4.4, 2), Rc(17, 29, 4.4, 2)), '#1E1A16');                        // shoes
    p.fill(Rc(9, 11, 15, 13, 3), '#4F78A8');                                                 // jacket
    p.fill(or(Rc(5.6, 12, 3.6, 10, 1.6), Rc(23.8, 12, 3.6, 10, 1.6)), '#4F78A8', {edge: true});   // arms
    p.fill(or(O(7.4, 23, 1.8), O(25.6, 23, 1.8)), SK);                                       // hands
    p.flat(Rc(9, 19, 15, 1.6), '#2A2A30');                                                   // belt
    p.flat(Rc(16, 11, 1, 8), '#3E6290');                                                     // the jacket's front
    p.fill(O(16.5, 6.6, 5, 5.4), SK, {edge: true});                                          // head
    p.flat(and(O(16.5, 6.6, 5, 5.4), Rc(0, 0, 32, 4.2)), '#2A1E16');                         // hair
    p.eye(14, 6, '#1E1A16', 1); p.eye(18, 6, '#1E1A16', 1); p.flat(Rc(15.5, 9, 2, 1), '#C4826A');
  },
  '鹅': p => {   // goose: white, standing, a long neck and an orange beak with a knob (unlike the duck: floating, a short neck)
    const W = '#F7F5EE', LT = {light: '#FFFFFF', dark: '#D8D2C4'};
    p.fill(or(Rc(16, 25, 1.6, 5), Rc(20, 25, 1.6, 5)), '#E8902A');                           // legs
    p.flat(or(Rc(14, 29.5, 4, 1.4), Rc(18, 29.5, 4, 1.4)), '#C9741A');                        // feet
    p.fill(Pg([[24, 16], [31, 12], [29.6, 21]]), W, LT);                                      // tail
    p.fill(O(19, 20, 9.6, 6.4), W, LT);                                                       // body
    p.fill(O(21, 19, 6, 3.4), '#E2DCCE', {light: '#F2EEE4', dark: '#C4BCA8', edge: true});    // wing
    p.fill(path([[11, 18], [9.6, 11], [10, 6]], 2.2), W, LT);                                // long neck
    p.fill(O(10.4, 5.4, 3.8, 3.4), W, {...LT, edge: true});                                   // head
    p.fill(Pg([[1.4, 6.6], [7, 4.4], [7.4, 8]]), '#E8902A', {dark: '#C9741A'});               // beak
    p.fill(O(7, 4.4, 1.2), '#D86A1A');                                                       // the knob on it
    p.eye(9, 4);
  },
  '衣服': p => {   // clothes: a padded coat, buttoned at the side, its sleeves out (unlike the hat, the shoes)
    p.fill(Pg([[9, 4], [23, 4], [31, 14], [27, 18], [24, 14], [24, 30], [8, 30], [8, 14], [5, 18], [1, 14]]), '#7A6A55', {edge: true});
    p.fill(Pg([[12.5, 4], [19.5, 4], [16, 8.6]]), '#E8D8B8');                                // collar
    p.flat(path([[16, 8.6], [21, 13], [21, 30]], .6), '#5A4C3C');                            // its edge, across to the side
    for (const y of [12, 17, 22]) p.flat(Rc(20.6, y, 2, 1.2), '#D9B866');                    // knotted buttons
    p.flat(Rc(8, 30, 16, 1), '#5A4C3C');
  },
  '帽子': p => {   // hat: a wide straw hat, pointed in the middle (unlike the headband: cloth, tied)
    p.fill(O(16, 21, 15, 5), '#C8A050', {light: '#E2C478', dark: '#9E7A32'});                  // brim
    p.fill(Pg([[8, 20], [16, 6], [24, 20]]), '#D9B866', {light: '#EED68A', dark: '#B08E44', edge: true});   // crown
    for (const x of [11, 14, 17, 20]) p.flat(path([[16, 7.4], [x, 19.6]], .4), '#B8964A');     // the weave
    p.flat(and(O(16, 21, 15, 5), not(O(16, 21, 13.4, 3.6))), '#A88440');
    p.flat(Rc(8.6, 19, 14.8, 1.6), '#6A4A2A');                                               // its band
  },
  '井': p => {   // well: a square stone well, its dark water far down, a frame of wooden beams across its top, two each way, as in 井 (the character began as a picture of one), a windlass behind it with its rope (decided 6 November 2026, to match the well on the map; unlike the house: walls and a door; unlike the bucket: just a bucket)
    p.fill(or(Rc(3, 3, 3, 16), Rc(26, 3, 3, 16)), '#8A5A32', {edge: true});                     // the windlass's posts
    p.fill(Rc(6, 5, 20, 5), '#A8743E', {light: '#C89A5A', dark: '#6A4220', edge: true});        // its drum
    p.flat(Rc(12, 5, 8, 5), '#D8CBA0'); p.flat(or(Rc(12, 7, 8, 1), Rc(12, 9, 8, 1)), '#B8A878');   // the rope wound round it
    p.fill(or(Rc(29, 6, 3, 2), Rc(30, 6, 2, 6)), '#4E3018');                                    // its crank
    p.fill(Rc(2, 13, 28, 10), '#C2BBAD', {light: '#D6D0C2', edge: true});                       // the curb's top
    p.flat(Rc(9, 16, 14, 4), '#16232A'); p.flat(Rc(10, 16, 6, 1), '#35545A');                   // the water
    p.flat(Rc(16, 10, 1, 8), '#D8CBA0');                                                        // the rope, down into it
    p.fill(Rc(2, 23, 28, 7), '#8A857A', {dark: '#6E6A62', edge: true});                         // its front, of fitted stones
    p.flat(or(Rc(2, 26, 28, 1), Rc(8, 23, 1, 3), Rc(17, 23, 1, 3), Rc(25, 23, 1, 3), Rc(5, 27, 1, 3), Rc(12, 27, 1, 3), Rc(21, 27, 1, 3)), '#6E6A62');
    p.fill(or(Rc(0, 14, 32, 2), Rc(0, 20, 32, 2), Rc(6, 11, 2, 13), Rc(24, 11, 2, 13)), '#A8743E', {light: '#C89A5A', dark: '#6A4220', edge: true});   // the frame of beams
  },
  '房子': p => {   // house: white walls and a dark tiled roof, curling up at its ends (unlike 家: a little house with a red roof)
    p.fill(Rc(4, 15, 24, 14), '#F0ECE2', {dark: '#D0C9BA'});                                   // walls
    p.fill(Rc(4, 26, 24, 3), '#8C877D');                                                       // stone base
    p.fill(Rc(13, 18, 6, 11), '#5E3B22', {edge: true}); p.dot(17, 23, '#E0B050');             // door
    for (const x of [6, 21]){ p.fill(Rc(x, 18, 5, 5), '#6E4A2A', {edge: true}); p.flat(or(Rc(x + 1, 19, 1, 3), Rc(x + 3, 19, 1, 3)), '#D9C49A'); }   // lattice windows
    p.fill(Pg([[0, 16], [3, 9], [29, 9], [32, 16]]), '#3C4347', {light: '#5B6369', dark: '#272C2F'});   // roof
    for (const x of [5, 9, 13, 17, 21, 25]) p.flat(Rc(x, 10, 1, 5), '#272C2F');
    p.fill(or(Rc(1, 6.6, 30, 2.4), O(1.6, 6.4, 1.6), O(30.4, 6.4, 1.6)), '#272C2F', {light: '#4A5257'});   // the ridge, its ends curling up
  },
  '门': p => {   // door: a pair of wooden doors in a frame, with round rings (unlike the house: only its door)
    p.fill(Rc(5, 3, 22, 28), '#8A5A34', {edge: true});                                         // frame
    p.fill(Rc(7, 5, 18, 26), '#6A3A22');
    p.fill(Rc(7.6, 5.6, 8, 25), '#7A4428', {light: '#965A36', dark: '#5A3018'}); p.fill(Rc(16.4, 5.6, 8, 25), '#7A4428', {light: '#965A36', dark: '#5A3018'});
    for (const y of [9, 15, 21, 27]) p.flat(Rc(7.6, y, 17, 1), '#5A3018');                     // its planks' battens
    p.fill(and(O(13.6, 17, 2.4), not(O(13.6, 17, 1.2))), '#E0B050'); p.fill(and(O(18.4, 17, 2.4), not(O(18.4, 17, 1.2))), '#E0B050');   // rings
    p.fill(Rc(3, 1, 26, 3), '#3C4347');                                                       // a strip of roof over it
  },
  '鸡': p => {   // chicken: a white hen, side on, with a red comb (unlike the bird: little, blue; unlike the goose: a long neck)
    const W = '#F7F5EE', LT = {light: '#FFFFFF', dark: '#D8D2C4'};
    p.fill(or(Rc(14, 24, 1.6, 6), Rc(18, 24, 1.6, 6)), '#E8A030');
    p.flat(or(Rc(12, 29.6, 4, 1.4), Rc(16, 29.6, 4, 1.4)), '#C98020');
    p.fill(Pg([[22, 18], [30, 6], [31, 16], [27, 22]]), W, LT);                                // tail feathers, up
    p.fill(O(17, 19, 9, 7), W, LT);                                                           // body
    p.fill(O(19, 19, 5.6, 3.6), '#E2DCCE', {dark: '#C4BCA8', edge: true});                    // wing
    p.fill(O(9.4, 10, 4.6, 4.4), W, {...LT, edge: true});                                     // head
    p.fill(or(O(8, 5, 1.6), O(10.4, 4.6, 1.6), O(12.6, 5.6, 1.4)), '#D8342C');               // comb
    p.fill(O(6.6, 14, 1.4, 2), '#D8342C');                                                    // wattle
    p.fill(Pg([[1.6, 10.6], [5.6, 9], [5.6, 12.2]]), '#E8A030');                              // beak
    p.eye(7, 8);
  },
  '米饭': p => {   // rice: a bowl heaped with white rice, and chopsticks (unlike the bowl: empty, blue-striped)
    p.fill(or(path([[18, 2], [27, 15]], .9), path([[22, 2], [29, 14]], .9)), '#C08A50', {dark: '#8A5A30'});   // chopsticks
    p.fill(O(16, 15, 11.5, 6.4), '#FAF8F2', {light: '#FFFFFF', dark: '#E2DCCE'});               // the heap of rice
    for (const [x, y] of [[10, 13], [14, 11], [19, 12], [22, 15], [13, 16], [17, 15]]) p.flat(Rc(x, y, 2, 1), '#E8E2D4');   // its grains
    p.fill(Rc(12, 26, 8, 3), '#C9C3B4');
    p.fill(and(O(16, 17, 13, 11), Rc(0, 17, 32, 16)), '#B8483A', {light: '#D06050', dark: '#8A3028'});   // a red bowl
    p.flat(and(O(16, 17, 13, 11), Rc(0, 21, 32, 1.4)), '#E0B050');
  },
  '钱': p => {   // money: a string of copper coins with square holes (unlike the shells)
    p.fill(path([[4, 4], [8, 10], [12, 16], [18, 20], [24, 24]], .6), '#B03A2A');               // the red string through them
    for (const [x, y] of [[8, 10], [13, 16], [19, 20], [25, 25]]){ p.fill(O(x, y, 5.4, 5.4), '#C89A3E', {light: '#E8C060', dark: '#9A7020', edge: true}); p.flat(Rc(x - 1.4, y - 1.4, 3, 3), '#3A2A1E'); }
  },
  '网': p => {   // net: a fishing net hung between two poles, its mesh in squares, floats along the top
    p.fill(or(Rc(3, 2, 2.6, 29), Rc(26.4, 2, 2.6, 29)), '#8A5A32', {edge: true});              // poles
    p.flat(and(Rc(5.6, 6, 20.8, 22), or(...[8, 12, 16, 20, 24].map(x => Rc(x, 6, 1, 22)), ...[6, 10, 14, 18, 22, 26].map(y => Rc(5.6, y, 20.8, 1)))), '#D8CDA8');   // the mesh
    for (const x of [9, 14, 19, 24]) p.fill(O(x, 5.6, 1.6), '#E8902A');                       // floats
    p.flat(Rc(5.6, 5, 20.8, 1), '#6A5A38');
  },
  '船': p => {   // boat: a little wooden fishing boat with a woven roof, on the water (unlike the raft: logs tied together)
    p.fill(Rc(0, 25, 32, 6, 2), '#6FB7E8', {light: '#A8D8F5', dark: '#4A93CC'});
    p.fill(Pg([[1, 17], [31, 17], [27, 26], [5, 26]]), '#8A5A30', {light: '#A8743E', dark: '#5E3A1C', edge: true});   // hull
    p.flat(Rc(3, 20, 26, 1), '#6A4220');
    p.fill(and(O(16, 17, 8.6, 7), Rc(0, 9, 32, 8)), '#B8A270', {dark: '#8C7A50'});              // the woven roof
    for (const x of [10, 13, 16, 19, 22]) p.flat(Rc(x, 11, 1, 6), '#8C7A50');
  },
  '狗': p => {   // dog: a brown dog, sitting, ears flopped down, its tongue out (unlike the wolf: grey, howling; unlike the fox: orange, pointed ears)
    const B = '#B5793F', LT = {light: '#D49A5E', dark: '#8A5A2A'};
    p.fill(path([[23, 26], [28, 22], [29, 17]], 1.6), B, LT);                                 // tail, up
    p.fill(O(18, 23, 7.6, 7), B, LT);                                                         // body
    p.flat(O(14, 24, 3.6, 5), '#E2B67A');                                                     // chest
    p.fill(or(Rc(11, 22, 3, 9), Rc(16, 23, 3, 8)), B, {...LT, edge: true});                    // front legs
    p.fill(O(13, 12, 7, 6.4), B, {...LT, edge: true});                                        // head
    p.fill(or(O(6.6, 13, 2.4, 5), O(19.4, 13, 2.4, 5)), '#7A4A22', {edge: true});             // floppy ears
    p.fill(O(13, 15.6, 3.6, 2.6), '#E2B67A');                                                 // muzzle
    p.fill(O(13, 14, 1.4, 1), '#2A1A10');                                                     // nose
    p.fill(Rc(12.4, 17, 2, 2.6, 1), '#E0607A');                                               // tongue
    p.eye(10, 10); p.eye(15, 10);
  },
  '包子': p => {   // steamed bun: round and white, pleated on top, in a bamboo steamer (unlike the rice: in a bowl)
    p.fill(Rc(2, 21, 28, 9, 2), '#C9A060', {light: '#E0BC78', dark: '#9E7A40'});              // the steamer
    for (const x of [5, 9, 13, 17, 21, 25]) p.flat(Rc(x, 22, 1, 7), '#A8844A');
    p.fill(O(16, 17, 11, 7.4), '#F6EFE2', {light: '#FFFFFF', dark: '#E0D6C2'});                // the bun
    for (let i = 0; i < 5; i++) p.flat(Cp(16, 11, 8 + i * 4, 16, .5), '#D9CDB4');            // its pleats
    p.fill(O(16, 11, 2.4, 1.6), '#EDE3D0');
    for (const x of [9, 15, 21]) p.flat(path([[x, 7], [x + 1, 4], [x, 1]], .5), '#DCE4EA');    // steam
  },
  '鞋': p => {   // shoes: a pair of black cloth shoes with white soles
    for (const [x, y] of [[2, 13], [13, 20]]){
      p.fill(Pg([[x, y + 6], [x + 4, y], [x + 13, y], [x + 17, y + 4], [x + 17, y + 8], [x, y + 8]]), '#2A2A2A', {light: '#4A4A4A', dark: '#141414', edge: true});
      p.fill(Rc(x, y + 7, 17, 2.4), '#F2EEE4', {dark: '#C9C3B4'});                              // the sole
      p.flat(O(x + 9, y + 2, 3.4, 1.4), '#5A5A5A');                                           // the opening
    }
  },
  '茶': p => {   // tea: a teapot and a little cup of green tea (unlike water: a drop; unlike 喝: a drink with a straw)
    p.fill(path([[22, 15], [28, 11], [30, 8]], 1.2), '#5E8F8A', {dark: '#3E6F6A'});            // spout
    p.fill(and(O(16, 18, 10, 9), Rc(0, 10, 32, 22)), '#7AB0A8', {light: '#9AD0C8', dark: '#4E8A82'});   // pot
    p.fill(and(O(5.6, 17, 4, 4.4), not(O(5.6, 17, 2.2, 2.6))), '#5E8F8A');                    // handle
    p.fill(Rc(10, 8, 12, 3, 1), '#5E8F8A', {edge: true}); p.fill(O(16, 7, 2, 1.4), '#4E7A74'); // lid
    p.fill(Rc(21, 23, 9, 7, 2), '#F4F1EA', {dark: '#D0C9BA', edge: true});                    // cup
    p.flat(Rc(22, 23.6, 7, 1.6), '#8AB050');                                                  // the green tea in it
  },
  '孩子': p => {   // child: a small child, a round head with two bunches of hair, a bright orange jacket (unlike the person: grown up, blue)
    const SK = '#F4D0A8';
    p.fill(or(Rc(12.6, 24, 3, 6), Rc(17.4, 24, 3, 6)), '#5A4632', {edge: true});
    p.flat(or(Rc(12, 29, 4, 2), Rc(17, 29, 4, 2)), '#1E1A16');
    p.fill(Rc(10, 17, 13, 9, 3), '#E8A33C');                                                  // jacket
    p.fill(or(Rc(7, 18, 3.4, 6, 1.6), Rc(22.6, 18, 3.4, 6, 1.6)), '#E8A33C', {edge: true});
    p.fill(or(O(8.6, 24.6, 1.6), O(24.4, 24.6, 1.6)), SK);
    p.fill(O(16.5, 10.6, 6.6, 6.6), SK, {edge: true});                                        // a big round head
    p.flat(and(O(16.5, 10.6, 6.6, 6.6), Rc(0, 0, 32, 7.4)), '#2A1E16');                      // hair,
    p.fill(or(O(9.4, 5, 2.4), O(23.6, 5, 2.4)), '#2A1E16');                                    // in two bunches
    p.eye(13, 10, '#1E1A16', 1); p.eye(18, 10, '#1E1A16', 1);
    p.flat(or(O(11.6, 13.6, 1.2, .8), O(21.4, 13.6, 1.2, .8)), '#F2A0A0');                   // rosy cheeks
    p.flat(Rc(15.5, 14, 2, 1), '#C4826A');
  },
  '书': p => {   // book: a stack of string-bound books, one open on top
    for (const [y, c] of [[23, '#3E5A86'], [17, '#C23A2E']]){
      p.fill(Rc(4, y, 24, 6), c, {edge: true}); p.flat(Rc(6, y + 1, 21, 4), '#F2EEE4');       // cover and pages
      p.flat(Rc(4, y, 3, 6), c); for (const dy of [1, 3, 5]) p.flat(Rc(4.6, y + dy, 1.6, .8), '#F2EEE4');   // bound with string
    }
    p.fill(Pg([[3, 8], [16, 11], [16, 17], [3, 14]]), '#F4F1EA', {dark: '#D0C9BA', edge: true});   // an open book on top
    p.fill(Pg([[16, 11], [29, 8], [29, 14], [16, 17]]), '#F4F1EA', {dark: '#D0C9BA', edge: true});
    for (const x of [6, 9, 12, 19, 22, 25]) p.flat(path([[x, 10.4], [x, 14]], .4), '#4A4A4A');   // its writing, in columns
  },
  '猫': p => {   // cat: a grey tabby, sitting, facing you, green eyes, its tail curled round (unlike the fox: orange, a pointed snout)
    const G = '#A39C92', LT = {light: '#C2BCB2', dark: '#7E776E'};
    p.fill(path([[22, 29], [28, 27], [29, 21]], 1.5), G, LT);                                 // tail
    p.fill(O(16, 23, 8, 7.4), G, LT);                                                         // body
    p.flat(O(16, 25, 3.6, 4.6), '#ECE8E0');                                                   // pale chest
    p.fill(or(Rc(11.6, 26, 3, 4.4, 1), Rc(17.4, 26, 3, 4.4, 1)), '#ECE8E0', {edge: true});   // white paws
    p.fill(or(Pg([[7.6, 10], [8.6, 2], [13.6, 7]]), Pg([[24.4, 10], [23.4, 2], [18.4, 7]])), G, LT);   // pointed ears
    p.flat(or(Pg([[9, 8.6], [9.4, 4.4], [12, 7]]), Pg([[23, 8.6], [22.6, 4.4], [20, 7]])), '#F2A0A8');
    p.fill(O(16, 12, 8, 6.4), G, {...LT, edge: true});                                        // head
    for (const x of [13, 16, 19]) p.flat(Rc(x, 6.6, 1, 2.4), '#6E675E');                     // stripes
    p.fill(or(O(12.4, 11.4, 1.6, 1.8), O(19.6, 11.4, 1.6, 1.8)), '#3FA34F');                  // green eyes
    p.flat(or(Rc(12, 10.4, 1, 2.4), Rc(19.2, 10.4, 1, 2.4)), '#1E1A16');
    p.fill(O(16, 14.4, 1.2, .8), '#F2A0A8');                                                  // nose
    p.flat(or(path([[4, 13], [10, 14]], .3), path([[4, 16], [10, 15]], .3), path([[22, 14], [28, 13]], .3), path([[22, 15], [28, 16]], .3)), '#F4F1EA');   // whiskers
  },
  '风': p => {   // wind: three bold gusts sweeping across, each curling up and over at its end, and leaves blown along on them
    // (decided 7 November 2026, after playing it: thin pale lines with round dots didn't read as wind)
    const gust = (x0, x1, y, r) => {   // a gust: a long wavy stroke, then an open hook curling up and back over it (closed, it looked like an eye)
      const pts = [];
      for (let x = x0; x <= x1; x += 2) pts.push([x, y + Math.sin((x - x0) / 4) * .6]);
      for (let t = 0; t <= Math.PI * 1.2; t += .25){ const a = Math.PI / 2 - t; pts.push([x1 + Math.cos(a) * r, y - r + Math.sin(a) * r]); }
      return path(pts, 1.1);
    };
    const leaf = (cx, cy, len, wid, ang, c) => {   // a leaf, pointed at both ends, turned (ang), with its middle vein
      const ux = Math.cos(ang), uy = Math.sin(ang), at = (u, v) => [cx + ux * u - uy * v, cy + uy * u + ux * v];
      p.fill(Pg([at(len / 2, 0), at(len / 5, wid / 2), at(-len / 5, wid / 2), at(-len / 2, 0), at(-len / 5, -wid / 2), at(len / 5, -wid / 2)]), c, {edge: true});
      p.flat(Cp(...at(-len / 2 + .5, 0), ...at(len / 2 - 1, 0), .35), mix(c, '#000000', .3));
    };
    const W = '#F4FAFF', WL = {light: '#FFFFFF', dark: '#86BCE2'};
    p.fill(gust(1, 15, 7.5, 3), W, WL);
    p.fill(gust(0, 24, 15.5, 3.6), W, WL);
    p.fill(gust(4, 17, 24.5, 3), W, WL);
    leaf(26, 5, 9, 4.6, .55, '#E07B39');   // leaves, tumbling along
    leaf(27, 24, 9.5, 4.8, -.45, '#5BB451');
    leaf(9, 29.5, 7.5, 3.8, -.1, '#D9B03A');
  },
  '云': p => {   // cloud: one big puffy white cloud, shaded blue-grey underneath (unlike the sky: no blue around it)
    const W = '#FAFCFF', LT = {light: '#FFFFFF', dark: '#C6D4E4'};
    p.fill(or(O(10, 19, 7, 5.6), O(16, 13, 7.4, 7), O(23.4, 16, 6, 5.4), O(27, 21, 4.4, 3.6), O(5, 22, 4, 3.4), Rc(5, 19, 23, 6.6, 3)), W, LT);
    p.flat(or(Rc(6, 24, 21, 1.2), O(12, 24.4, 5, 1), O(21, 24.4, 5, 1)), '#B4C4D8');   // its shady underside
    p.flat(or(O(14, 9.4, 3, 1.2), O(21.6, 12.6, 2.4, 1)), '#FFFFFF');                       // the sun on its top
  },
  '雨': p => {   // rain: a grey rain cloud, blue drops slanting down from it, and splashes in a puddle (unlike 云: a white cloud, no rain; unlike 雪: snowflakes, white)
    p.fill(or(O(9, 10, 6, 4.8), O(15.4, 6.6, 6.6, 5.6), O(22.4, 8.8, 5.6, 4.6), O(26.6, 12, 4, 3.2), O(4.6, 12.4, 3.6, 3), Rc(4, 9, 24, 6, 3)), '#8E9AAE', {light: '#B6C2D4', dark: '#626E84'});
    p.flat(or(Rc(5, 14.6, 22, 1.2), O(11, 15, 4, .8), O(21, 15, 4, .8)), '#56627A');   // its dark underside
    for (const [x, y] of [[8, 18.6], [15.4, 18.6], [23, 18.6], [11.6, 23.4], [19.4, 23.4], [26.4, 23], [7, 25.6]]) p.fill(path([[x + .9, y], [x, y + 2.6]], .55), '#3F86D2', {light: '#8CC4F2'});   // the drops, slanting down
    p.fill(O(16, 30.8, 11, 1.6), '#5A9ED8', {light: '#9ACCF0'});   // a puddle
    p.flat(or(Rc(8.6, 29.6, 3, .8), Rc(20.4, 30, 3, .8)), '#D8ECFA');   // splashes in it
  },
  '大雨': p => {   // heavy rain: a big dark storm cloud, rain pouring down from it in long streaks, and a wide puddle splashing (unlike 雨: a pale grey cloud and a few drops; unlike 云: a white cloud, no rain)
    p.fill(or(O(8, 8.4, 6.6, 5.2), O(16, 5.4, 7.4, 5.8), O(24, 7.6, 6.4, 5), O(28.4, 10.6, 3.2, 3), O(3.6, 11, 3.2, 3), Rc(3, 8, 26, 6, 3)), '#5A647C', {light: '#7A869E', dark: '#3A4256'});   // a big dark cloud
    p.flat(or(Rc(4, 13.4, 24, 1.4), O(10, 13.8, 4.4, .9), O(21, 13.8, 4.4, .9)), '#2E3546');   // its dark underside
    for (const [x, y] of [[5.4, 16.2], [9.8, 16.6], [14.2, 16.2], [18.6, 16.6], [23, 16.2], [27.2, 16.6], [7.4, 22.4], [11.8, 22.8], [16.2, 22.4], [20.6, 22.8], [25, 22.4]])
      p.fill(path([[x + 1.8, y], [x, y + 4.8]], .6), '#2F6FC0', {light: '#7CB4EC'});   // the rain, pouring down in long streaks
    p.fill(O(16, 30.4, 14, 1.7), '#4A8ACC', {light: '#8EC0EC'});   // a wide puddle
    p.flat(or(Rc(5.6, 28.2, 1, 1.6), Rc(4.6, 29.2, 3, .8), Rc(15.6, 28.4, 1, 1.4), Rc(14.6, 29.4, 3, .8), Rc(25.2, 28.2, 1, 1.6), Rc(24.2, 29.2, 3, .8)), '#D8ECFA');   // big splashes in it
  },
  '鹤': p => {   // crane: tall and white, side on, its neck black, a red cap, long thin legs (unlike the goose: long legs, a straight beak)
    const W = '#F7F6F0', LT = {light: '#FFFFFF', dark: '#D4D0C4'};
    p.flat(or(Cp(16, 21, 15, 31, .55), Cp(19, 21, 20.4, 31, .55)), '#3A3A36');            // long thin legs
    p.flat(or(Rc(12.6, 30.4, 4, 1), Rc(19.4, 30.4, 4, 1)), '#3A3A36');                       // feet
    p.fill(Pg([[21, 13], [29.6, 17.4], [27, 22], [21, 20]]), '#26262A', {light: '#46464C'});  // black tail feathers, hanging down
    p.fill(O(18, 16.6, 7.4, 4.8), W, LT);                                                   // body
    p.fill(O(19.6, 15.4, 5, 2.6), '#E6E2D6', {light: '#F4F0E6', dark: '#C8C2B2', edge: true});   // wing
    p.fill(path([[12.4, 14], [10, 9], [9.4, 4.4]], 1.5), '#2A2A2E', {light: '#4A4A50'});   // long black neck
    p.fill(O(9.2, 3.8, 2.8, 2.4), '#F7F6F0', LT);                                          // white head
    p.fill(O(9.4, 2, 1.8, 1.2), '#D8343A');                                                 // the red cap on top
    p.flat(Pg([[0.4, 5.4], [7.2, 2.8], [7.2, 5.2]]), '#C9A060');                           // long straight beak
    p.eye(8, 3, '#1E1A16', 1);
  },
  '天': p => {   // sky: a wide blue sky, paler down to the hills, the sun shining, two birds far off (unlike the cloud: all blue)
    p.flat(Rc(1, 2, 30, 28, 4), '#4F9EE0');
    p.flat(Rc(1, 13, 30, 9), '#78B6EA'); p.flat(Rc(1, 20, 30, 6), '#A6D0F2');               // paler towards the ground
    p.fill(O(23, 8.6, 4, 4), '#FFD54A', {light: '#FFF2A8', dark: '#F2B42A'});              // the sun
    p.flat(or(path([[6, 8], [7.6, 9.4], [9.2, 8]], .45), path([[11, 12], [12.6, 13.6], [14.2, 12]], .45)), '#24466A');   // birds, far off
    p.flat(and(Rc(1, 2, 30, 28, 4), or(O(8, 31, 12, 6), O(24, 32, 11, 6.6))), '#5FA85A');   // hills along the bottom
    p.flat(and(Rc(1, 2, 30, 28, 4), or(O(8, 31, 12, 6), O(24, 32, 11, 6.6)), not(or(O(8, 31.6, 11.4, 5.6), O(24, 32.6, 10.4, 6.2)))), '#7CC46B');
  },
  '师父': p => {   // master: an old man in a pale robe, white topknot and a long white beard (unlike a person: old, robed, bearded)
    p.fill(Pg([[9, 18], [23, 18], [28, 31], [4, 31]]), '#E4E0D2', {light: '#F4F2EA', dark: '#C4BEAC'});      // his robe
    p.flat(Rc(6, 26, 20, 2), '#6A5A8A');                                                      // its sash
    p.fill(O(16, 11, 6, 6.4), '#F2C9A0', {edge: true});                                       // his face
    p.fill(or(O(16, 5.6, 6.4, 3), O(16, 2.4, 2.4, 2)), '#F4F4F0', {dark: '#C8C8C0'});            // white hair, a topknot
    p.fill(Pg([[10.6, 13], [21.4, 13], [20, 22], [16, 27], [12, 22]]), '#F7F7F2', {dark: '#D0D0C8'});   // the long beard
    p.flat(or(Rc(12, 8.4, 3, 1), Rc(17, 8.4, 3, 1)), '#E8E8E0');                                 // white eyebrows
    p.flat(or(Rc(12.6, 10.2, 2, 1), Rc(17.4, 10.2, 2, 1)), '#2A1E16');                           // eyes, smiling
    p.fill(O(16, 23, 5.4, 2.4), '#C4BEAC');                                                    // hands in his sleeves
  },
  '叶子': p => {   // leaves: two fallen leaves, red-orange and gold, with their veins (unlike a tree: just leaves)
    p.fill(Pg([[3, 27], [8, 14], [17, 6], [27, 3], [25, 13], [18, 22], [8, 27]]), '#D8642E', {edge: true});
    p.flat(path([[4, 27], [14, 15], [25, 5]], .5), '#9A3A1A');
    p.flat(or(path([[10, 20], [8, 15]], .4), path([[15, 14], [13, 9]], .4), path([[12, 18], [18, 19]], .4), path([[17, 12], [23, 12]], .4)), '#A84A22');
    p.fill(Pg([[13, 30], [17, 21], [25, 16], [31, 16], [28, 24], [21, 29]]), '#E2B03A', {edge: true});
    p.flat(path([[13, 30], [22, 22], [30, 17]], .5), '#A8781A');
  },
  '扫': p => {   // to sweep: a broom sweeping up a little heap of leaves, swishing (unlike the leaves: a broom)
    p.fill(path([[27, 2], [14, 20]], 1), '#B98A55');                                          // its handle
    p.fill(Pg([[10, 17], [19, 23], [15, 31], [3, 28]]), '#D9B866', {edge: true});               // its straw
    p.flat(or(path([[9, 21], [6, 28]], .4), path([[12, 22], [10, 29]], .4), path([[15, 24], [13, 30]], .4)), '#B8963E');
    p.flat(Rc(10, 18, 9, 2), '#8A5E36');                                                       // tied on
    p.fill(O(25, 28, 6, 2.4), '#B8662E', {edge: true});                                       // the heap of leaves
    for (const [x, y, c] of [[22, 26, '#D8923A'], [26, 25, '#E6B04A'], [28, 27, '#C2552E']]) p.flat(Rc(x, y, 2, 1), c);
    p.flat(or(path([[3, 10], [8, 14]], .4), path([[1, 15], [5, 18]], .4)), '#9AB8D0');           // swish
  },
  '桶': p => {   // bucket: a wooden bucket of water, bound with bands, a rope handle (unlike the well: just a bucket)
    p.fill(Pg([[6, 11], [26, 11], [24, 30], [8, 30]]), '#B98A55', {edge: true});
    for (const x of [11, 16, 21]) p.flat(Rc(x, 13, 1, 16), '#9A6E40');                           // its staves
    p.flat(or(Rc(6.4, 14, 19.4, 2), Rc(7.6, 25, 17, 2)), '#5E4A3A');                              // iron bands
    p.fill(O(16, 11, 10, 2.6), '#5AA0E6', {light: '#9CCCF2', dark: '#3F77C4', edge: true});    // water in it
    p.flat(path([[6, 11], [8, 4], [16, 2], [24, 4], [26, 11]], .6), '#6E5A3A');                   // the handle
  },
  // chapter 2 (Area 2): home to Flower Fruit Mountain, and the Demon of Havoc
  '哭': p => {   // to cry: a yellow face, eyes squeezed shut, mouth wide open wailing, tears streaming down (unlike 快乐: smiling, sparkles)
    p.fill(O(16, 16.5, 12, 12), '#FFD34E', {edge: true});
    for (const sx of [-1, 1]) p.flat(path([[16 + sx * 7.5, 12], [16 + sx * 4.5, 13.5], [16 + sx * 2, 12]], .8), '#3A2A10');   // eyes, squeezed shut
    for (const sx of [-1, 1]) p.flat(path([[16 + sx * 7.5, 8.5], [16 + sx * 3, 9.5]], .6), '#B8861C');               // eyebrows, sad
    p.fill(O(16, 21.5, 4, 3.6), '#7A2E1C'); p.flat(O(16, 23.2, 2.4, 1.4), '#E8706A');                                  // wailing
    for (const sx of [-1, 1]){
      p.fill(path([[16 + sx * 5, 15], [16 + sx * 6.5, 21], [16 + sx * 7.5, 27]], 1.3), '#5FB4F0', {light: '#A8DCFA', dark: '#3A8ED0'});   // tears streaming
      p.fill(O(16 + sx * 8.5, 29, 2, 1.6), '#5FB4F0', {light: '#A8DCFA'});
    }
  },
  '老': p => {   // old: an old grey monkey with a long white beard, bent over, leaning on a walking stick (unlike 猴子: young and brown, standing up)
    const G = '#A9A49A', GL = {light: '#C9C4BA', dark: '#7E7A72'};
    p.fill(path([[25, 6], [27, 30]], 1.1), '#8A5A32', {light: '#B07C4E', dark: '#5E3A1E'});        // the walking stick
    p.fill(O(15, 23, 7, 6), G, GL); p.flat(O(15, 24, 4, 4), '#E6D8C4');                             // a bent body
    p.fill(or(O(11, 30.5, 2.8, 1.4), O(18.5, 30.5, 2.8, 1.4)), '#6E6A62', {edge: true});
    p.fill(path([[19, 20], [24.5, 15]], 1.6), G, {...GL, edge: true}); p.fill(O(25, 14.5, 1.8), '#E6D8C4');   // its hand on the stick
    p.fill(O(6.5, 11, 3, 3.2), G); p.flat(O(6.6, 11.2, 1.6, 1.9), '#E6D8C4');                       // an ear
    p.fill(O(14, 11, 7.6, 7), G, {...GL, edge: true});                                               // its head, bowed
    p.flat(or(O(11.4, 11, 3, 3.2), O(17, 11, 3, 3.2), O(14.2, 14.6, 4.2, 2.8)), '#E6D8C4');
    p.flat(path([[9.6, 10.6], [12.6, 10.6]], .5), '#3A3530'); p.flat(path([[15.6, 10.6], [18.6, 10.6]], .5), '#3A3530');   // eyes, half shut
    p.fill(Pg([[10.5, 15], [17.5, 15], [16, 22], [14, 25], [12, 22]]), '#F8F6F0', {dark: '#D6D2C8', edge: true});   // a long white beard
    p.flat(path([[8, 7.6], [11.8, 8.2]], .5), '#F8F6F0'); p.flat(path([[16.2, 8.2], [20, 7.6]], .5), '#F8F6F0');      // white eyebrows
  },
  '妖怪': p => {   // demon: a cheeky little blue demon, two little horns, a tuft of red hair, a tiger-skin cloth, a spear (unlike 猴子: brown fur)
    const SK = '#5E8FD0', SKL = {light: '#86AEE2', dark: '#3F6AA8'};
    p.fill(Rc(25, 6, 2, 25), '#8A5A30', {edge: true});                                                 // the spear's shaft
    p.fill(Pg([[26, .5], [29.5, 7], [22.5, 7]]), '#CDD3DA', {dark: '#8E959E', edge: true});           // its tip
    p.fill(or(Rc(10.5, 25, 4, 6, 1.5), Rc(17, 25, 4, 6, 1.5)), SK, {...SKL, edge: true});            // legs
    p.fill(O(15.5, 21, 7, 6), SK, SKL);                                                                // body
    p.fill(Rc(9, 22, 13, 5, 1), '#E8A23A', {edge: true});                                             // the tiger-skin cloth
    for (const x of [11, 14.5, 18]) p.flat(Rc(x, 22.5, 1, 3.5), '#3A2414');
    p.fill(path([[9, 18], [5, 22]], 1.9), SK, {...SKL, edge: true});                                  // an arm, waving
    p.fill(path([[21, 18], [25, 16]], 1.9), SK, {...SKL, edge: true}); p.fill(O(25.5, 16, 2), SK, SKL);   // the other, on the spear
    p.fill(Pg([[9, 6.5], [6.5, .5], [12.5, 4.5]]), '#EDE3C8', {edge: true});                         // horns
    p.fill(Pg([[18.5, 4.5], [24.5, .5], [22, 6.5]]), '#EDE3C8', {edge: true});
    p.fill(O(15.5, 11, 8, 7.2), SK, {...SKL, edge: true});                                            // head
    p.fill(Pg([[12, 5], [15.5, .8], [19, 5], [15.5, 6.5]]), '#D8402E', {edge: true});               // a tuft of red hair
    p.fill(O(12, 10.5, 2.6, 2.8), '#FAFAF5'); p.fill(O(19, 10.5, 2.6, 2.8), '#FAFAF5');               // big round eyes
    p.flat(O(12.6, 11, 1.2, 1.4), '#1A1A1A'); p.flat(O(19.6, 11, 1.2, 1.4), '#1A1A1A');
    p.flat(path([[9.5, 7.2], [13.8, 8.4]], .6), '#22324A'); p.flat(path([[21.5, 7.2], [17.2, 8.4]], .6), '#22324A');   // cross eyebrows
    p.flat(Rc(12.5, 14.5, 6, 1.4), '#2A1A2A'); p.dot(14, 14, '#FAFAF5'); p.dot(17, 14, '#FAFAF5');   // a grin with two teeth
  },
  '混世魔王': p => {   // the Demon of Havoc (a name, for his battles): black armour trimmed with gold, a horned black helmet, a purple face with glowing eyes, his great broadsword raised
    const ARM = '#2C2C34', AL = {light: '#55556A', dark: '#16161C'}, GOLD = '#D8A838', FACE = '#7A5A9A';
    p.fill(or(Rc(10, 25, 5, 6, 1), Rc(17.5, 25, 5, 6, 1)), ARM, {...AL, edge: true});                 // boots
    p.fill(Rc(8, 15, 16, 12, 3), ARM, AL);                                                             // armour
    p.fill(Rc(8, 22, 16, 2), GOLD); p.flat(Rc(15.5, 16, 1, 6), GOLD);                                 // a gold belt, gold down its front
    p.fill(O(8.5, 16, 3.6, 2.6), ARM, {...AL, edge: true}); p.fill(O(23.5, 16, 3.6, 2.6), ARM, {...AL, edge: true});   // shoulders
    p.fill(path([[7, 18], [5.5, 25]], 2), ARM, {...AL, edge: true}); p.fill(O(5.5, 26, 2), FACE);      // an arm down, a fist
    p.fill(Pg([[25, 9], [29, 9], [26.5, 1], [20, .5], [22.5, 3.5]]), '#D8DCE2', {dark: '#8C929C', edge: true});   // the broadsword's blade
    p.fill(Rc(24.5, 8.4, 5.5, 1.4), GOLD);                                                            // its guard
    p.fill(path([[25, 17], [27, 11]], 2), ARM, {...AL, edge: true}); p.fill(O(27, 10.5, 2), FACE);    // the arm raising it
    p.fill(Pg([[10, 6], [4.5, .5], [8, 7]]), '#EDE3C8', {edge: true}); p.fill(Pg([[22, 6], [27.5, .5], [24, 7]]), '#EDE3C8', {edge: true});   // horns
    p.fill(O(16, 10.5, 6.5, 6), FACE, {light: '#9A7ABA', dark: '#54386E', edge: true});              // face
    p.fill(and(O(16, 8.5, 7.5, 6.5), (x, y) => y < 8), ARM, {...AL, edge: true});                    // helmet
    p.fill(Rc(9, 7, 14, 1.4), GOLD);
    p.flat(Rc(12, 10, 3, 1.4), '#F4D440'); p.flat(Rc(17, 10, 3, 1.4), '#F4D440');                     // glowing eyes
    p.flat(Rc(13.5, 13.5, 5, 1.2), '#2A1020'); p.dot(14, 14, '#FAFAF5'); p.dot(17, 14, '#FAFAF5');   // fangs
  },
  '火': p => {   // fire: flames leaping up from crossed logs, sparks above (unlike the sun: a round disc in the sky)
    p.fill(path([[6, 28], [26, 24]], 1.8), '#8A5A32', {light: '#B07C4E', dark: '#5E3A1E', edge: true});   // the logs
    p.fill(path([[6, 24], [26, 28]], 1.8), '#7A4E2A', {light: '#A06E44', dark: '#4E2E16', edge: true});
    p.fill(Pg([[7, 25], [8, 16], [11, 19], [12, 9], [16, 15], [17, 3], [21, 13], [23, 8], [25, 25]]), '#E8562A', {light: '#F28A4A', dark: '#B83A1A', edge: true});   // the flames
    p.fill(Pg([[10, 25], [11, 19], [14, 21], [16, 11], [18, 19], [20, 15], [22, 25]]), '#F6A23A', {light: '#FCC66A'});
    p.flat(Pg([[13, 25], [15, 19], [16, 21], [18, 18], [19, 25]]), '#FCE07A');
    for (const [x, y] of [[9, 6], [24, 4], [27, 13]]) p.flat(O(x, y, 1, 1), '#F6A23A');               // sparks
  },
  '笼子': p => {   // cage: a wooden cage, a roof and a floor, bars all round, its door shut with a lock, empty (unlike 房子: a house)
    p.fill(Rc(4, 6, 24, 3, 1), '#8A5A32', {light: '#B07C4E', dark: '#5E3A1E', edge: true});           // the roof
    p.fill(Rc(4, 26, 24, 3, 1), '#8A5A32', {light: '#B07C4E', dark: '#5E3A1E', edge: true});          // the floor
    p.flat(Rc(6, 9, 20, 17), '#5A3E2A');                                                              // dark inside
    for (const x of [5, 10, 15, 20, 25]) p.fill(Rc(x, 9, 2, 17), '#B98A55', {light: '#D8B07A', dark: '#8A6038'});   // bars
    p.fill(Rc(14, 15, 4, 4, 1), '#C9A23A', {light: '#E8C860', dark: '#8E6E1E', edge: true});          // a lock
    p.flat(Rc(15.5, 16.5, 1, 1.5), '#3A2A10');
  },
  '车': p => {   // cart: a wooden handcart, side on: its bed of planks, one big spoked wheel, a leg, and its shafts out in front to pull it by (unlike 木筏: logs tied together, on the water)
    p.flat(O(16, 28.5, 13, 1.6), '#D9D2C2');                                                                        // its shadow on the ground
    p.fill(path([[24, 13.5], [30.5, 16.5]], 1.1), '#B07C4E', {light: '#D8B07A', dark: '#7A5230'});                 // its shafts
    p.fill(Rc(22, 17, 2.4, 10), '#8A5A32', {dark: '#5E3A1E'});                                                       // its leg
    p.fill(Rc(2.5, 10, 22, 8, 1), '#9C6A3C', {light: '#C99A62', dark: '#5E3B1F', edge: true});                     // its bed, of planks
    for (const x of [8, 13.5, 19]) p.flat(Rc(x, 11.5, 1, 5), '#6E4626');
    p.flat(Rc(3.5, 10.6, 20, 1), '#D8B07A');
    p.fill(O(11, 21, 7.2), '#7A5230', {light: '#A87A4A', dark: '#4E321C'});                                          // the wheel: its rim,
    p.flat(O(11, 21, 5.4), '#4A3424');                                                                               // the gaps between its spokes,
    for (const a of [0, Math.PI / 3, 2 * Math.PI / 3]) p.flat(path([[11 - Math.cos(a) * 5.2, 21 - Math.sin(a) * 5.2], [11 + Math.cos(a) * 5.2, 21 + Math.sin(a) * 5.2]], .6), '#C99A62');   // its spokes
    p.fill(O(11, 21, 1.6), '#5E3A1E', {light: '#8A5A32'});                                                           // and its hub
  },
  '钥匙': p => {   // key: an old iron key, a ring at one end, teeth at the other (unlike 门: a door; 笼子: a cage)
    p.fill(O(9, 9, 6, 6), '#9AA0A8', {light: '#C8CED6', dark: '#6A707A', edge: true}); p.fill(O(9, 9, 3, 3), '#FFFFFF');   // the ring
    p.fill(path([[13, 13], [26, 26]], 1.7), '#9AA0A8', {light: '#C8CED6', dark: '#6A707A', edge: true});   // the shaft
    p.fill(Pg([[22, 22], [25.5, 18.5], [27.5, 20.5], [24, 24]]), '#9AA0A8', {dark: '#6A707A', edge: true});   // teeth
    p.fill(Pg([[25, 25], [28.5, 21.5], [30, 23], [26.5, 26.5]]), '#9AA0A8', {dark: '#6A707A', edge: true});
    p.fill(Rc(5, 8, 1, 2), '#FFFFFF');
  },
  '毛': p => {   // hair, fur: a little tuft of a monkey's golden hairs, plucked, fanning out (unlike 草: green grass growing)
    for (const [x0, x1, y1, c] of [[16, 5, 4, '#C8873E'], [16, 10, 2, '#D9A050'], [16, 16, 1, '#E8B868'], [16, 22, 2, '#D9A050'], [16, 27, 4, '#C8873E'], [16, 7.5, 9, '#B8743E'], [16, 24.5, 9, '#B8743E']])
      p.fill(path([[x0, 27], [(x0 + x1) / 2 + (x1 < 16 ? 1 : x1 > 16 ? -1 : 0), 15], [x1, y1]], 1.05), c, {light: '#F2D290', dark: '#8A5226'});
    p.fill(O(16, 27.5, 3, 2), '#B8743E', {dark: '#8A5226', edge: true});                              // where they're held together
  },
  '刀': p => {   // broadsword: a broad curved blade, a gold guard and a red-wrapped handle with a red tassel (unlike 斧头: an axe; 棍子: a stick)
    p.fill(Pg([[4, 28], [7, 30], [27, 6], [29, 1], [24, 3], [20, 5]]), '#D8DCE2', {light: '#F2F4F6', dark: '#8C929C', edge: true});   // the blade, widening to its tip
    p.flat(path([[8, 27], [24, 6]], .5), '#9AA0AA');                                                  // its back edge
    p.fill(Pg([[1, 25], [5, 21], [11, 27], [7, 31]]), '#D8A838', {light: '#F0C860', dark: '#9A7420', edge: true});   // the guard
    p.fill(path([[1, 31], [4, 28]], 1.4), '#B8322A', {light: '#D85A4A', dark: '#7A1A14'});            // the handle
    p.fill(O(2, 30, 1.6), '#E8463A'); p.flat(path([[1.5, 31], [.5, 31.5]], .5), '#E8463A');
  },
  '斧头': p => {   // axe: a steel head on a wooden handle (unlike wood: a tool)
    p.fill(path([[7, 30], [21, 6]], 1.5), '#A8743E', {dark: '#7A5230'});
    p.fill(Pg([[16, 4], [21, 5], [25, 2], [30, 1], [31, 9], [30, 17], [26, 15], [22, 11], [17, 9]]), '#A9B0B8', {light: '#D8DEE4', dark: '#7A828C', edge: true});   // a broad blade
    p.flat(path([[30.4, 2], [31, 9], [30.4, 16]], .6), '#EEF2F6');                            // its sharp, curved edge
    p.fill(O(18, 7, 2.6, 2.6), '#7A828C');                                                     // where it fits the handle
  },
  '头': p => {   // head: a face and its hair, ears either side, no body (unlike a person or a child: just the head)
    p.fill(or(O(5.6, 18, 2.2, 3.2), O(26.4, 18, 2.2, 3.2)), '#F2C9A0', {edge: true});           // ears
    p.fill(O(16, 17, 10, 11.4), '#F2C9A0', {edge: true});
    p.fill(and(O(16, 15, 11, 11), not(O(16, 21, 10, 10.6))), '#2A1E16');                       // hair
    p.eye(11, 16); p.eye(19, 16);
    p.flat(path([[12, 23], [16, 25], [20, 23]], .5), '#B0604A');                                 // a smile
    p.flat(O(16, 20, 1.2, 1), '#E0A882');                                                      // nose
  },
  '晚上': p => {   // night: a dark sky, a little moon and stars, over a house with its window lit (unlike the sky: night)
    p.flat(Rc(1, 2, 30, 28, 4), '#1C2448');
    p.flat(and(Rc(1, 2, 30, 28, 4), Rc(1, 18, 30, 12)), '#2A3460');
    p.flat(and(O(24, 8, 3.4), not(O(25.6, 6.8, 3))), '#F2EBC2');                               // the moon
    for (const [x, y] of [[6, 6], [12, 10], [17, 5], [8, 14]]) p.flat(or(Rc(x - 1, y, 3, 1), Rc(x, y - 1, 1, 3)), '#F6E8A0');
    p.flat(and(Rc(1, 2, 30, 28, 4), Pg([[8, 30], [8, 20], [15, 15], [22, 20], [22, 30]])), '#141A30');   // the house
    p.flat(Rc(13, 22, 4, 4), '#F2C24E');                                                       // its window, lit
  },
  '月亮': p => {   // moon: a big pale crescent moon (unlike night: just the moon)
    p.fill(and(O(15, 16, 12, 12), not(O(21, 12, 10.4, 10.4))), '#F2E07A', {light: '#FFF6C0', dark: '#D8B848', edge: true});
    p.flat(or(O(8, 18, 1.4), O(10, 24, 1)), '#E0C860');                                         // craters
  },
  '星星': p => {   // stars: three bright five-pointed stars, big, middling and little
    const star = (cx, cy, R, r) => Pg(Array.from({length: 10}, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r : R; return [cx + Math.cos(a) * k, cy + Math.sin(a) * k]; }));
    p.fill(star(12, 17, 11, 4.6), GOLD, {light: '#FFF2A8', dark: '#D89A2A', edge: true});
    p.fill(star(25, 8, 6, 2.6), GOLD, {light: '#FFF2A8', dark: '#D89A2A', edge: true});
    p.fill(star(26, 25, 4.4, 2), GOLD, {light: '#FFF2A8', dark: '#D89A2A', edge: true});
  },
  '变': p => {   // to change: a puff of magic smoke, swirling, with sparkles (unlike a cloud: smoke, swirling, sparkling)
    p.fill(or(O(10, 20, 7, 6), O(17, 13, 8, 7.4), O(23, 20, 6.4, 5.6), O(16, 23, 7, 5)), '#D8D2E8', {light: '#F0ECF8', dark: '#A8A0C4'});
    p.flat(path([[17, 13], [20, 15], [19, 19], [15, 19], [13, 15], [16, 11], [22, 12]], .6), '#8A80A8');   // the swirl
    for (const [x, y, r] of [[4, 6, 2], [27, 6, 2.4], [29, 27, 1.6], [3, 29, 1.6]]) p.flat(or(Rc(x - r, y, r * 2 + 1, 1), Rc(x, y - r, 1, r * 2 + 1)), GOLD);
  },
  '飞': p => {   // to fly: you on a little cloud, flying fast, speed lines behind (unlike a cloud or a bird: someone flying)
    p.fill(or(O(19, 25, 7, 4), O(25, 23, 5, 4), O(13, 26, 5, 3)), '#F7FAFC', {dark: '#C8D6E4', edge: true});   // the cloud
    p.fill(O(20, 18, 4.4, 4), FUR, {edge: true});                                            // body
    p.fill(O(21, 10, 5, 4.8), FUR, {edge: true});                                            // head
    p.fill(O(22, 11, 3.4, 3), SKIN);
    p.eye(21, 10); p.eye(24, 10);
    p.fill(path([[16, 19], [12, 15]], .9), FUR);                                              // an arm flung back
    p.flat(or(path([[1, 20], [9, 20]], .5), path([[3, 25], [8, 25]], .5), path([[2, 14], [8, 15]], .5)), '#8FB8DC');   // speed lines
  },
  // the seasons, each a little scene in a frame
  '春天': p => {   // spring: a branch of peach blossom against a pale sky, pink flowers and new green leaves (unlike 花: a whole branch in blossom)
    p.flat(Rc(1, 2, 30, 28, 4), '#CFEAF6');                                                  // a pale spring sky
    p.flat(and(Rc(1, 2, 30, 28, 4), O(16, 36, 22, 10)), '#9BD07A');                          // fresh green hills
    p.fill(path([[1, 23], [9, 18], [18, 14], [27, 6]], 1.3), '#7A4E2E', {light: '#9C6A42'});   // the branch
    p.fill(path([[12, 16.6], [14, 22]], .8), '#7A4E2E');
    for (const [x, y] of [[23, 11], [11, 22]]) p.fill(O(x, y, 2.2, 1.3), '#6CC04A', {edge: true});   // new leaves
    for (const [x, y] of [[7, 16], [15, 11], [21, 8], [27, 4], [14, 23], [19, 16]]){ p.fill(O(x, y, 2.8, 2.8), '#F48FB1', {light: '#FFC7DA', dark: '#D8628A', edge: true}); p.dot(x, y, '#FFE07A'); }   // blossoms
  },
  '夏天': p => {   // summer: a lotus pond, big round leaves, a pink lotus in flower and a bud (unlike 花: a lotus on the water)
    p.flat(Rc(1, 2, 30, 28, 4), '#8FD0EE');                                                  // a bright blue sky
    p.flat(and(Rc(1, 2, 30, 28, 4), Rc(1, 17, 30, 13)), '#3F9A8C');                          // the pond
    p.fill(O(8, 22, 6.6, 3), '#4FA046', {edge: true}); p.flat(Rc(7, 21, 3, 1), '#2F7A36');   // lotus leaves on the water
    p.fill(O(24, 25, 6, 2.8), '#5BAA4B', {edge: true}); p.flat(Rc(23, 24, 3, 1), '#3A8A3A');
    p.fill(path([[17, 27], [16, 16]], .6), '#4F8A2E');                                         // the flower's stem
    p.fill(or(O(16, 12.6, 3, 4.4), O(12.4, 14.4, 3, 2.4), O(19.6, 14.4, 3, 2.4)), '#F28CB4', {light: '#FFC2DA', dark: '#D45C8A', edge: true});   // the lotus
    p.flat(O(16, 10.6, 1.2, 1.2), '#FFE07A');
    p.fill(path([[25, 22], [26, 15]], .5), '#4F8A2E'); p.fill(O(26, 13.6, 1.6, 2.4), '#F28CB4', {light: '#FFC2DA', dark: '#D45C8A', edge: true});   // a bud, not yet open
  },
  '秋天': p => {   // autumn: a tree in red and gold, its leaves falling onto golden ground (unlike 树: its leaves turned; unlike 叶子: a whole tree)
    p.flat(Rc(1, 2, 30, 28, 4), '#F4E3C2');                                                  // a hazy autumn sky
    p.flat(and(Rc(1, 2, 30, 28, 4), Rc(1, 25, 30, 5)), '#D9A441');                           // golden ground
    p.fill(Rc(14.5, 17, 3.5, 9), '#6B4A2A'); p.fill(or(path([[16, 19], [11, 14]], .6), path([[16, 18], [21, 13]], .6)), '#6B4A2A');   // the trunk, its branches
    p.fill(or(O(16, 10, 8.6, 6.6), O(9.6, 14.6, 5.4, 4.4), O(22.6, 14.6, 5.4, 4.4), O(16.5, 16, 7, 3.6)), '#D8642E', {light: '#F0A04A', dark: '#A8401A', edge: true});   // its leaves, turned
    p.flat(or(O(12.6, 7.6, 3, 2), O(7.6, 13, 2, 1.4), O(20.6, 11, 2.2, 1.4)), '#F2B84A');      // gold where the light catches them
    [[19, 9], [12, 13], [22, 15], [16, 15], [10, 16]].forEach(([x, y]) => p.flat(Rc(x, y, 2, 1), '#A8401A'));
    for (const [x, y, c] of [[5, 21, '#E2B03A'], [27, 20, '#D8642E'], [23, 27, '#C8502A'], [8, 27, '#E2B03A']]) p.fill(O(x, y, 1.6, 1), c);   // leaves falling
  },
  '冬天': p => {   // winter: snow on the ground and on a bare tree, snowflakes falling from a grey sky (unlike 树: bare, white with snow)
    p.flat(Rc(1, 2, 30, 28, 4), '#C9D6E2');                                                  // a grey winter sky
    p.flat(and(Rc(1, 2, 30, 28, 4), O(16, 37, 22, 12)), '#F7FAFC');                          // deep snow
    p.fill(path([[16, 28], [16, 14]], 1.2), '#5E4026');                                       // the trunk
    p.fill(or(path([[16, 19], [10, 12], [8, 8]], .7), path([[16, 17], [22, 10], [24, 7]], .7), path([[16, 15], [17, 7]], .6), path([[12, 14], [8, 14]], .5), path([[20, 13], [25, 13]], .5)), '#5E4026');   // its bare branches
    p.flat(or(Rc(7, 7, 3, 1), Rc(23, 6, 3, 1), Rc(16, 6, 2, 1), Rc(8, 13, 2, 1), Rc(24, 12, 2, 1), Rc(14, 13, 4, 1)), '#FFFFFF');   // snow on them
    for (const [x, y] of [[5, 6], [27, 16], [5, 18], [26, 23], [12, 4], [21, 21], [29, 6]]) p.flat(or(Rc(x - 1, y, 3, 1), Rc(x, y - 1, 1, 3)), '#FFFFFF');   // snowflakes
  },
  '松树': p => {   // pine tree: tall and pointed, layers of dark needles (unlike a tree: pointed, dark)
    p.fill(Rc(14.6, 24, 3, 7), '#7A5230');
    for (const [y, w] of [[24, 13], [17, 10.4], [10, 7.6]]) p.fill(Pg([[16, y - 9], [16 + w, y + 1], [16 - w, y + 1]]), '#2E6B3A', {light: '#4E8C52', dark: '#1E4A28', edge: true});
  },
  '歌': p => {   // song: musical notes floating up, as when someone sings
    p.fill(O(8, 25, 3.8, 3), '#3A3A44', {light: '#5A5A66'}); p.fill(Rc(10.4, 8, 1.8, 17), '#3A3A44');   // a note
    p.fill(O(20, 22, 3.8, 3), '#3A3A44', {light: '#5A5A66'}); p.fill(Rc(22.4, 5, 1.8, 17), '#3A3A44');   // joined to another
    p.fill(Pg([[10.4, 8], [24.2, 5], [24.2, 9], [10.4, 12]]), '#3A3A44');
    p.fill(O(28, 13, 2.4, 1.8), '#C23A2E'); p.fill(Rc(29.4, 4, 1.2, 9), '#C23A2E');           // and a little red one
    p.flat(path([[30.6, 4], [32, 7]], .5), '#C23A2E');
  },
  // the master's mountain (Area 2, chapter 1): the numbers to twenty, the pupils' training, the weather, the four
  // directions, the master's medicine, writing, the snow and the year
  '十一': p => teen(p, 1), '十二': p => teen(p, 2), '十三': p => teen(p, 3), '十四': p => teen(p, 4), '十五': p => teen(p, 5),   // a bundle of ten sticks, and a row of loose ones
  '十六': p => teen(p, 6), '十七': p => teen(p, 7), '十八': p => teen(p, 8), '十九': p => teen(p, 9),   // a bundle, a row of five and the rest under it
  '二十': p => { bundle(p, 3); bundle(p, 19, 1); },   // twenty: two bundles of ten
  '功夫': p => {   // kung fu: a pupil in a white jacket and a black sash, in a bow stance, punching, his other fist at his waist (unlike 人: standing still)
    const SK = '#F2C9A0', JK = '#F2EEE4', JL = {light: '#FFFFFF', dark: '#CFC8B8'}, TR = '#3E3A48', TL = {light: '#5A566A', dark: '#2A2632'}, SHOE = '#1E1A16';
    p.fill(path([[11, 20], [4, 28.5]], 1.8), TR, TL);                                        // his back leg, straight
    p.fill(Pg([[1, 27.5], [6, 27.5], [6.5, 30.5], [1, 30.5]]), SHOE);
    p.fill(path([[13, 20], [19, 23], [19.5, 28.5]], 1.8), TR, {...TL, edge: true});          // his front leg, bent
    p.fill(Rc(18, 28.5, 6, 2.2, 1), SHOE);
    p.fill(Pg([[9, 10.5], [15, 10.5], [16, 20], [14.5, 23.5], [9.5, 23.5], [8.5, 20]]), JK, JL);   // his jacket
    p.flat(path([[11, 10.6], [12.8, 13.4], [14.6, 10.6]], .45), '#B8B0A0');                   // its collar
    p.fill(Rc(8.5, 17.5, 7.5, 2), '#2A2A30');                                                 // a black sash,
    p.fill(path([[9, 18.5], [6, 20], [5, 22.5]], .7), '#2A2A30');                             // its ends flying
    p.fill(path([[13.5, 12.5], [25, 12.5]], 1.5), JK, {...JL, edge: true});                   // an arm, punching,
    p.fill(O(26.2, 12.5, 2, 1.9), SK, {edge: true});                                          // its fist
    p.fill(path([[10, 12.5], [8, 16], [10.5, 18]], 1.4), JK, {...JL, edge: true}); p.fill(O(11, 18, 1.6), SK, {edge: true});   // the other fist, at his waist
    p.fill(O(12.5, 6.5, 3.8, 4), SK, {edge: true});                                           // his head, side on
    p.flat(and(O(12.5, 6.5, 3.8, 4), or(Rc(0, 0, 32, 4.4), Rc(0, 0, 10.6, 32))), '#2A1E16');  // his hair,
    p.fill(O(10.6, 2.6, 1.6, 1.3), '#2A1E16');                                                // in a topknot
    p.flat(Rc(14, 5, 2, 1), '#2A1E16'); p.flat(Rc(14, 6, 2, 1), '#1E1A16'); p.dot(15, 9, '#C4826A');   // a frown, an eye, his mouth
    p.flat(or(path([[28.5, 8.5], [30.5, 6.5]], .4), path([[29.5, 12.5], [31, 12.5]], .4), path([[28.5, 16.5], [30.5, 18.5]], .4)), '#E8902A');   // the punch's force
  },
  '热': p => {   // hot: a red face, sweating, its tongue out, under a blazing sun, heat rising off it (unlike 夏天: a lotus pond; unlike 快乐 and 哭: yellow)
    for (let i = 0; i < 8; i++){ const a = i * Math.PI / 4 - Math.PI / 8; p.flat(Cp(24.4 + Math.cos(a) * 5.6, 8 + Math.sin(a) * 5.6, 24.4 + Math.cos(a) * 7, 8 + Math.sin(a) * 7, .55), '#F2B42A'); }   // the sun's rays,
    p.fill(O(24.4, 8, 4.2), '#FFD54A', {light: '#FFF2A8', dark: '#F2A82A'});                  // the sun
    for (const x of [4.5, 9.5, 14.5]) p.flat(path([[x, 7.5], [x - 1.2, 6], [x, 4.5], [x + 1.2, 3], [x, 1.5]], .5), '#F0603A');   // heat rising
    p.fill(O(14.5, 19.5, 11.4, 10.8), '#F26A3A', {light: '#F8955E', dark: '#C8462A', edge: true});   // the face, red-hot
    p.flat(or(O(7.6, 22.5, 2.2, 1.4), O(21.4, 22.5, 2.2, 1.4)), '#E04432');                   // flushed cheeks
    p.flat(or(path([[7, 14.5], [10.5, 13.5]], .55), path([[18.5, 13.5], [22, 14.5]], .55)), '#8A2A16');   // eyebrows, tired
    p.eye(8, 16); p.eye(19, 16);
    p.fill(O(14.5, 24, 3.4, 2.6), '#7A2E1C');                                                 // a mouth open, panting,
    p.fill(O(15, 26.4, 2, 2.2), '#F28A9A', {edge: true});                                     // its tongue out
    const drop = (x, y, s = 1) => or(O(x, y + s, 1.6 * s), Pg([[x, y - 2 * s], [x - 1.4 * s, y + .6 * s], [x + 1.4 * s, y + .6 * s]]));
    p.fill(or(drop(4.5, 14), drop(25.2, 16), drop(27.8, 22, .9)), '#5FB4F0', {light: '#A8DCFA', dark: '#3A8ED0'});   // drops of sweat
  },
  '冷': p => {   // cold: a pale blue face, shivering, its teeth chattering, a woolly scarf round its neck, a snowflake by it (unlike 冬天: a snowy tree; unlike 雪: snow)
    const arc = (r, a0, a1) => path(Array.from({length: 5}, (_, i) => { const a = (a0 + (a1 - a0) * i / 4) * Math.PI / 180; return [16 + Math.cos(a) * r, 12 + Math.sin(a) * r]; }), .45);
    p.flat(or(arc(14.2, 166, 194), arc(14.2, -14, 14)), '#7FB6E8');                           // shivering
    p.fill(O(16, 12, 10, 9.6), '#A8D4F2', {light: '#D0EAFA', dark: '#7AAED8', edge: true});   // the face
    p.flat(or(path([[8.5, 8], [12.5, 6.5]], .5), path([[19.5, 6.5], [23.5, 8]], .5)), '#3A5A7A');   // eyebrows, worried
    p.eye(10, 8); p.eye(20, 8);
    p.flat(O(16, 12, 1.4, 1.1), '#E87A8A');                                                   // a pink nose
    p.flat(Rc(10.5, 14, 11, 5), '#3A4A5A');                                                   // teeth chattering
    p.flat(or(Rc(11.5, 15, 9, 1), Rc(11.5, 17, 9, 1)), '#FFFFFF');
    p.flat(or(Rc(14, 15, 1, 1), Rc(17, 15, 1, 1), Rc(13, 17, 1, 1), Rc(16, 17, 1, 1), Rc(19, 17, 1, 1)), '#B8C8D8');
    const SC = '#3FA34F', SCL = {light: '#6CC47A', dark: '#2A7A38'}, ST = '#F4F0E8', end = Pg([[18, 22], [23, 22], [24, 28.5], [19.5, 29]]);
    p.fill(end, SC, SCL);                                                                     // the scarf's end, hanging down,
    p.flat(and(end, or(Rc(0, 23.6, 32, 1.4), Rc(0, 26.4, 32, 1.4))), ST);                     // striped
    p.flat(or(Rc(19.5, 29, 1, 1.5), Rc(21.5, 29, 1, 1.5), Rc(23.4, 28.6, 1, 1.5)), SCL.dark); // its fringe
    p.fill(and(O(16, 21.5, 11, 4.4), not(O(16, 16.5, 9, 4))), SC, {...SCL, edge: true});      // wrapped round its neck
    p.flat(and(O(16, 21.5, 11, 4.4), not(O(16, 16.5, 9, 4)), or(Rc(9, 0, 1.4, 32), Rc(15, 0, 1.4, 32), Rc(21, 0, 1.4, 32))), ST);
    snowflake(p, 27, 4, 3);
  },
  '北边': p => compass(p, 0), '东边': p => compass(p, 1), '南边': p => compass(p, 2), '西边': p => compass(p, 3),   // the north, east, south and west
  '药': p => {   // medicine: a gourd bottle (葫芦) with a red cord tied round its waist and a stopper, and two pills on a little dish
    const G = '#D9A441', GL = {light: '#F2CA6E', dark: '#A8741E'};
    p.fill(O(12.5, 21.5, 8.6, 7.8), G, GL);                                                   // the gourd: its big round bottom,
    p.fill(O(12.5, 10.2, 5.2, 4.8), G, {...GL, edge: true});                                  // its little top,
    p.fill(Rc(11, 2.6, 3, 3.4, 1), '#8A5A32', {light: '#B07C4E', edge: true});                // a stopper
    p.flat(or(O(9.2, 19, 1.4, 3), O(10.3, 9, 1, 1.8)), '#F8DC94');                            // shining
    p.fill(Rc(7.5, 14.2, 10, 2), '#C8322A', {light: '#E85A4A', dark: '#9A2018'});            // the red cord,
    p.fill(path([[17, 15.2], [19.5, 18.5], [19.6, 21]], .6), '#C8322A');                      // its end hanging,
    p.fill(O(19.7, 22.6, 1.2, 1.8), '#C8322A', {edge: true});                                 // a tassel
    p.fill(O(26, 29.4, 5.4, 1.7), '#F4F1EA', {dark: '#C9C3B4'});                              // a little dish
    for (const x of [24, 28.2]){ p.fill(O(x, 27.2, 2.1), '#7A3A22', {light: '#A85A3A', dark: '#4E2414', edge: true}); p.dot(Math.floor(x) - 1, 26, '#F0C8B0'); }   // round brown pills
  },
  '写': p => {   // to write: a brush with a bamboo handle making a bold black stroke on white paper, a swoosh, not a character (unlike 书: books)
    p.fill(Rc(2, 12, 24, 17), '#FAF8F0', {light: '#FFFFFF', dark: '#D8D2C2'});                // a sheet of paper
    p.flat(or(path([[5.5, 22.5], [8.5, 20], [12, 21.4]], 1.25), path([[12, 21.4], [15.5, 22.6], [18.4, 20.8], [20.4, 18.4]], .9), O(5.4, 22.4, 2, 1.8)), '#1E1A16');   // the stroke, thinning
    p.fill(path([[29.4, 2.2], [24.6, 10.6]], 1.25), '#D9B866', {light: '#EED68A', dark: '#B08E44'});   // the brush's bamboo handle,
    p.flat(or(Rc(27.6, 4.6, 2, 1), Rc(25.8, 7.8, 2, 1)), '#9A7A34');                          // its joints
    p.fill(Pg([[22.6, 10.4], [26.6, 12.4], [20.6, 18.6]]), '#2A2A2E', {light: '#4A4A50', edge: true});   // its hair, black with ink,
    p.flat(Pg([[22.8, 10.4], [26.4, 12.2], [25, 13.8], [22.6, 12.6]]), '#F4F0E4');            // white where the ink stops
  },
  '雪': p => {   // snow: big six-armed snowflakes falling, and a heap of snow (unlike 冬天: a tree in the snow; unlike 云: a cloud)
    p.fill(and(or(O(10.5, 31, 9.4, 5), O(21.5, 31.5, 9, 4.2)), Rc(0, 0, 32, 31)), '#F7FAFD', {light: '#FFFFFF', dark: '#B8CCE0'});   // the heap
    p.flat(or(Rc(7, 28, 3, 1), Rc(20, 29, 4, 1)), '#DCE8F4');
    snowflake(p, 9, 10, 6, true); snowflake(p, 24, 7, 4); snowflake(p, 24, 19, 3); snowflake(p, 5, 22, 3);
  },
  '雪人': p => {   // snowman: two snowballs, coal eyes, a carrot nose, stick arms and a red scarf (unlike 雪: snowflakes; unlike 人: a person)
    const SN = '#FAFCFF', SL = {light: '#FFFFFF', dark: '#BCD0E4'};
    p.flat(O(16, 29.6, 12, 1.5), '#D8E6F2');                                                  // the snow it stands on
    p.fill(or(path([[9, 18], [4, 14], [2, 10.5]], .6), path([[4.5, 14.4], [1.5, 15]], .5)), '#6A4A2A');      // stick arms
    p.fill(or(path([[23, 18], [28, 14], [30, 10.5]], .6), path([[27.5, 14.4], [30.5, 15.5]], .5)), '#6A4A2A');
    p.fill(O(16, 23, 9.4, 7.6), SN, SL);                                                      // the big snowball
    p.fill(O(16, 11, 6.6, 6.2), SN, {...SL, edge: true});                                     // its head
    p.flat(or(Rc(13, 9, 2, 2), Rc(18, 9, 2, 2)), '#2A2A2E');                                  // coal eyes
    p.fill(Pg([[16, 11.5], [22.5, 12.8], [16, 14]]), '#F28A2A', {dark: '#C8641A'});            // a carrot nose
    for (const [x, y] of [[13, 14], [15, 15], [17, 15], [19, 14]]) p.dot(x, y, '#2A2A2E');    // a smile of coal
    p.fill(Rc(9.5, 16, 13, 3, 1.5), RED, {light: '#F06A5A', dark: '#A82828', edge: true});    // a red scarf,
    p.fill(Rc(18, 18, 3.4, 7, 1), RED, {light: '#F06A5A', dark: '#A82828', edge: true});      // its end hanging
    p.flat(or(Rc(16, 21, 1, 2), Rc(16, 25, 1, 2)), '#2A2A2E');                                // coal buttons
  },
  '年': p => {   // year: a wheel of the four seasons, going round: spring's peach blossom, summer's green leaf, autumn's red leaf and winter's snowflake (unlike 春天, 夏天, 秋天 and 冬天: one season)
    p.fill(O(16, 16, 15), '#A8784A', {light: '#C89A6A', dark: '#7A5230'});                    // the wheel's rim
    for (const [sx, sy, c] of [[-1, -1, '#E2F2D0'], [1, -1, '#FFF0BC'], [1, 1, '#FBDDBE'], [-1, 1, '#C4DCF2']])
      p.flat(and(O(16, 16, 12.2), (x, y) => (x + .5 - 16) * sx > 0 && (y + .5 - 16) * sy > 0), c);   // a quarter each
    p.flat(or(Rc(15.5, 3, 1, 26), Rc(3, 15.5, 26, 1)), '#FFFFFF');
    for (let i = 0; i < 5; i++){ const a = -Math.PI / 2 + i * 2 * Math.PI / 5; p.fill(O(10.4 + Math.cos(a) * 2.4, 10.4 + Math.sin(a) * 2.4, 1.8), '#F48FB1', {light: '#FFC7DA', dark: '#D8628A'}); }   // spring: a blossom
    p.flat(O(10.4, 10.4, 1.1), '#FFD54A');
    const leaf = (cx, cy, c, l, d) => { p.fill(and(O(cx - 2, cy + 2, 4.6), O(cx + 2, cy - 2, 4.6)), c, {light: l, dark: d}); p.flat(path([[cx - 3, cy + 3], [cx + 2.4, cy - 2.4]], .4), d); };
    leaf(21.6, 10.4, '#4FA34A', '#7CC46B', '#2F7A3E');                                        // summer: a green leaf
    leaf(21.6, 21.6, '#E0642E', '#F2A04A', '#A8401A');                                        // autumn: a red one
    for (const [x, y] of flakePx(3, false)) p.dot(10 + x, 22 + y, '#FFFFFF');                 // winter: a snowflake
    for (const [x, y, dx, dy] of [[16, 2.4, 1, 0], [29.6, 16, 0, 1], [16, 29.6, -1, 0], [2.4, 16, 0, -1]])   // arrows on the rim, going round
      p.flat(Pg([[x + dx * 2, y + dy * 2], [x - dx * 1.4 - dy * 1.9, y - dy * 1.4 + dx * 1.9], [x - dx * 1.4 + dy * 1.9, y - dy * 1.4 - dx * 1.9]]), '#FFF4D8');
  },
  '米': p => {   // rice, raw: a square wooden measure (a 斗) heaped with grains of rice, a few spilt on its front (unlike 饭: cooked, in a red bowl, with chopsticks)
    p.fill(Pg([[22, 16], [29, 12], [28.4, 23], [21, 27]]), '#9A6E40', {light: '#B07E48', dark: '#6E4A26'});   // the measure: its side,
    p.fill(Pg([[3, 16], [22, 16], [21, 27], [4, 27]]), '#B98A55', {light: '#D8AA70', dark: '#8A5E30', edge: true});   // its front
    p.flat(Rc(4, 21, 17, 1), '#8A5E30');
    const heap = or(Pg([[3, 16.5], [10, 12.5], [29, 12.5], [22, 16.5]]), Pg([[3, 16.5], [8, 11], [13, 6.4], [16, 4.8], [19, 5.8], [24, 9], [29, 12.6], [22, 16.5]]));
    p.fill(heap, '#F2ECDC', {light: '#FFFFFF', dark: '#D4CAB2'});                              // the heap of rice,
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 70; i++){   // its grains, here and there
      const x = Math.floor(3 + rnd() * 26), y = Math.floor(5 + rnd() * 12), v = rnd() < .35;
      if (heap(x, y) && heap(x + 1, y + 1) && heap(x - 1, y)){ p.flat(v ? Rc(x, y, 1, 2) : Rc(x, y, 2, 1), '#FFFFFF'); p.dot(v ? x + 1 : x, y + 1, '#DCD2BA'); }
    }
    p.fill(Rc(3, 16, 19, 1.4), '#D8AA70');                                                    // the measure's rim
    for (const [x, y, v] of [[6, 17, 0], [9, 18, 1], [14, 17, 0], [18, 18, 0], [12, 19, 0]]) p.flat(v ? Rc(x, y, 1, 2) : Rc(x, y, 2, 1), '#F8F4E8');   // grains spilt over it
  },
};
function splat(p, c){   // a smooth, round dab of paint, for a colour, with two little drops
  p.fill(or(O(15.5, 17, 10.5, 9), O(23, 21.5, 4.6, 4)), c);
  p.fill(O(27, 8.5, 2), c); p.fill(O(5.5, 27, 1.6), c);
  p.flat(O(11.5, 12.5, 3.4, 2), mix(c, '#FFFFFF', .5)); p.flat(O(16.5, 11, 1.2, .8), mix(c, '#FFFFFF', .5));
}
function headband(p, cloth, knot, fold){   // a cloth headband, tied with a knot, its ends hanging (头带, and the 老板's in other colours)
  p.fill(path([[23.5, 20], [26.5, 25.5], [28.5, 30.5]], 1.8), knot, {edge: true}); p.fill(path([[22, 20.5], [22, 26], [23.5, 31]], 1.8), cloth, {edge: true});
  p.fill(and(O(16, 15.5, 13.4, 7.6), not(O(16, 13.8, 10, 4.2))), cloth);
  p.flat(and(O(16, 15.5, 12.4, 6.6), not(O(16, 14.8, 11.4, 5.4)), Rc(0, 17, 32, 15)), fold);   // a fold of the cloth
  p.fill(O(23.5, 20, 2.8, 2.6), knot, {edge: true});
}
function bird(p, body, wing, breast, beak){   // a little bird, side on, facing left: its tail and wing one colour, its body another
  p.fill(Pg([[22, 16], [31, 11.5], [30, 19.5]]), wing);
  p.flat(or(Cp(14, 25, 14, 29, .6), Cp(18, 25, 18, 29, .6)), beak);
  p.fill(O(17, 18, 8.4, 6.6), body);
  p.flat(O(14.5, 21.2, 5.2, 3.2), breast);
  p.fill(O(19.5, 16.6, 5.5, 3.6), wing, {edge: true});
  p.fill(O(10, 12, 5.2, 4.8), body, {edge: true});
  p.fill(Pg([[2.5, 12.5], [6, 10.5], [6, 14]]), beak);
  p.eye(8, 10);
}
function flower(p, petal, middle){   // a flower, its five petals one colour (petal), on a stem with two leaves
  p.fill(Cp(16, 18, 16, 30, 1), '#3E8A3E');
  p.fill(O(11, 25, 4, 1.8), LEAF); p.fill(O(21, 22.5, 4, 1.8), LEAF);
  for (let i = 0; i < 5; i++){ const a = -Math.PI / 2 + i * 2 * Math.PI / 5; p.fill(O(16 + Math.cos(a) * 5.4, 12 + Math.sin(a) * 5.4, 3.8), petal, {edge: true}); }
  p.fill(O(16, 12, 2.8), middle, {edge: true});
}
// Numbers from 十一 to 二十: a bundle of ten sticks tied round the middle with red string, and the rest as loose sticks
// beside it, the same sticks, in rows of up to five with a gap between each so they can be counted (十七: five, and two
// under them); 二十, two bundles (一 to 十 are dice).
const STICK = '#C8955A', STICK_SHADE = '#A87440', STICK_LIT = '#DDB07A', STICK_END = '#8A5A32';
const BUNDLES = [   // each stick's top and bottom, a little uneven, for a bundle and (二十's) another
  [[4, 1, 3, 5, 2, 3, 1, 4, 2, 3], [28, 29, 28, 28, 29, 28, 29, 28, 28, 29]],
  [[3, 4, 2, 4, 1, 3, 4, 2, 3, 4], [29, 28, 28, 29, 28, 29, 28, 28, 29, 28]]];
function bundle(p, x0, k = 0){   // ten sticks side by side from x0, lit on the left, their ends darker, and the string wrapped round them
  const [tops, bottoms] = BUNDLES[k];
  tops.forEach((t, i) => {
    p.flat(Rc(x0 + i, t, 1, bottoms[i] - t + 1), i === 0 ? STICK_LIT : i === 9 ? '#94643A' : i % 2 ? STICK_SHADE : STICK);
    p.dot(x0 + i, t, STICK_END); p.dot(x0 + i, bottoms[i], STICK_END);
  });
  p.fill(Rc(x0 - 1, 14, 12, 3), RED, {light: '#F06A5A', dark: '#A82828'});
}
function teen(p, n){   // 十 and n: a bundle, and n loose sticks, each two pixels wide (the outline between them)
  bundle(p, 2);
  const stick = (x, y) => { p.flat(Rc(x, y, 1, 11), STICK_LIT); p.flat(Rc(x + 1, y, 1, 11), STICK); p.flat(or(Rc(x, y, 2, 1), Rc(x, y + 10, 2, 1)), STICK_END); };
  for (let i = 0; i < n; i++) stick(16 + i % 5 * 3, n <= 5 ? 10 : i < 5 ? 3 : 18);
}
// The four directions: a compass, its long red arm pointing the way (k: 0 up for 北边, then round to 东边, 南边 and
// 西边), the other three short and grey; no letters on it.
function compass(p, k){
  p.fill(O(16, 16, 14.5), '#C9A23A', {light: '#E8C860', dark: '#8E6E1E'});                    // a brass rim
  p.fill(O(16, 16, 12.4), '#F6EED6', {light: '#DCD0AE', dark: '#FFFCF0'});                    // the face, set into it
  for (let i = 0; i < 4; i++){ const a = Math.PI / 4 + i * Math.PI / 2; p.flat(Rc(Math.round(16 + Math.cos(a) * 9.4) - 1, Math.round(16 + Math.sin(a) * 9.4) - 1, 2, 2), '#C8B888'); }   // marks between the arms
  const arm = (i, len, w, lit, shade) => {   // a pointed arm, half of it lit and half shaded
    const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][i], tip = [16 + dx * len, 16 + dy * len];
    p.flat(Pg([[16, 16], [16 - dy * w, 16 + dx * w], tip]), lit); p.flat(Pg([[16, 16], tip, [16 + dy * w, 16 - dx * w]]), shade);
  };
  for (let i = 0; i < 4; i++) if (i !== k) arm(i, 6.5, 2.6, '#BCC2CA', '#868D96');
  arm(k, 11.2, 3.4, '#F0544A', '#B82A24');
  p.fill(O(16, 16, 1.8), '#C9A23A', {light: '#E8C860', dark: '#8E6E1E'});                     // the pin it turns on
}
// A snowflake, placed pixel by pixel (drawn from shapes, its arms ran together at this size): six arms, up and down and
// four at a slope of 2:1, near enough 30°, n pixels long, forked at their tips if fork. White, shaded light blue on the
// right so it shows on a light card (but never on the picture's last column, where it would lose its outline).
function flakePx(n, fork){
  const s = new Set(), add = (x, y) => s.add(x + ',' + y);
  add(0, 0); add(1, 0); add(-1, 0);
  for (let i = 1; i <= n; i++){ add(0, -i); add(0, i); }
  for (let x = 1; x <= n; x++){ const y = Math.ceil(x / 2); for (const sx of [-1, 1]) for (const sy of [-1, 1]) add(sx * x, sy * y); }
  if (fork){
    const ty = Math.ceil(n / 2);
    for (const sy of [-1, 1]){ add(-1, sy * (n + 1)); add(1, sy * (n + 1)); }
    for (const sx of [-1, 1]) for (const sy of [-1, 1]){ add(sx * (n + 1), sy * (ty + 1)); add(sx * (n + 1), sy * (ty - 1)); }
  }
  return [...s].map(k => k.split(',').map(Number));
}
function snowflake(p, cx, cy, n, fork = false){
  const px = flakePx(n, fork), has = new Set(px.map(([x, y]) => x + ',' + y));
  for (const [x, y] of px) if (!has.has((x + 1) + ',' + y) && cx + x + 1 < N - 1) p.dot(cx + x + 1, cy + y, '#B4D2EE');
  for (const [x, y] of px) p.dot(cx + x, cy + y, '#FFFFFF');
}

// The game's icons, 16 x 16, for the menu, card headings and labels (instead of emoji, which look different on
// every phone). The text in the game says them as emoji (⭐, 📜 ...), and js/art.js swaps in these pictures.
const ICON_DRAWINGS = {
  '🌙': p => {   // a crescent moon: bedtime, and the day's recap (js/daynight.js)
    p.fill(and(O(8, 8.4, 6.6), not(O(11.2, 6, 5.4))), '#F6E7A8', {light: '#FFF8D6', dark: '#D8B864'});
    p.flat(or(O(2.6, 2.6, .8), O(13.6, 12.4, .7)), '#FFF1A8');   // two little stars
  },
  '⭐': p => {   // a star: a new word, a new friend
    const pts = [...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3.3 : 7.6; return [8 + r * Math.cos(a), 8.7 + r * Math.sin(a)]; });
    p.fill(Pg(pts), GOLD, {light: '#FFF1A8', dark: '#D89A22'});
  },
  '✨': p => {   // sparkles, as on the map: things that sparkle have words
    const spark = (cx, cy, r, w) => Pg([...Array(8)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 4, d = i % 2 ? w : r; return [cx + d * Math.cos(a), cy + d * Math.sin(a)]; }));
    p.fill(spark(6.5, 8.5, 6.8, 2.3), GOLD, {light: '#FFF1A8', dark: '#D89A22'});
    p.flat(O(6.5, 8.5, 1.3), '#FFFFFF');
    p.fill(spark(12.6, 3.4, 3.3, 1.3), GOLD, {light: '#FFF1A8'});
  },
  '📜': p => {   // a scroll: the Word Scroll
    p.fill(Rc(3, 3, 10, 10), '#F1E3C2', {dark: '#D8C49A'});
    p.flat(or(Rc(5, 6, 6, 1), Rc(5, 8, 5, 1), Rc(5, 10, 6, 1)), '#B79A6A');
    p.fill(Rc(1.5, 1, 13, 3, 1.5), '#C99A5B'); p.fill(Rc(1.5, 12, 13, 3, 1.5), '#C99A5B');
  },
  '📋': p => {   // a clipboard with ticks: your tasks
    p.fill(Rc(2, 2, 12, 13.5, 1), WOOD);
    p.fill(Rc(3.5, 4, 9, 10), '#FAF6EC', {light: '#FFFFFF'});
    p.flat(or(path([[5, 7], [6, 8], [7.5, 6]], .5), path([[5, 10.5], [6, 11.5], [7.5, 9.5]], .5)), '#3E9A4A');
    p.flat(or(Rc(8.5, 7, 3, 1), Rc(8.5, 10.5, 3, 1)), '#9A948A');
    p.fill(Rc(5, 1, 6, 3, 1), '#9AA5AE');
  },
  '🐾': p => {   // a paw print: friends
    const c = '#8A5A3A', o = {light: '#B07A52'};
    p.fill(O(8, 12, 3.8, 3.2), c, o);
    [[2.4, 6.6], [5.7, 2.8], [10.3, 2.8], [13.6, 6.6]].forEach(([x, y]) => p.fill(O(x, y, 1.5, 1.9), c, o));
  },
  '👝': p => {   // a cloth bag, tied at the top: the bag
    p.fill(or(O(8, 10.5, 6.6, 5), Pg([[5.4, 5.5], [10.6, 5.5], [12.6, 8.5], [3.4, 8.5]])), '#C98A45', {light: '#E8B86A'});
    p.fill(or(O(5.6, 3.2, 1.9, 1.5), O(10.4, 3.2, 1.9, 1.5), O(8, 5, 1.9, 1.4)), '#8F5E31', {light: '#B9854E'});
  },
  '👕': p => {   // a shirt: the wardrobe
    p.fill(and(Pg([[4.5, 1], [11.5, 1], [16, 5], [13.4, 8.4], [12, 7.4], [12, 15], [4, 15], [4, 7.4], [2.6, 8.4], [0, 5]]), not(O(8, 1, 2.4, 2))), '#4F82B0', {light: '#7FB0DC'});
  },
  '⚙': p => {   // a cog: settings
    const teeth = [...Array(8)].map((_, i) => { const a = i * Math.PI / 4; return Cp(8, 8, 8 + 6.6 * Math.cos(a), 8 + 6.6 * Math.sin(a), 1.5); });
    p.fill(and(or(O(8, 8, 5), ...teeth), not(O(8, 8, 2))), '#A9B4BC', {light: '#DDE4E8'});
  },
  '🎯': p => {   // a target: quick practice
    p.fill(O(8, 8, 7), '#D9483B', {light: '#F07A6A'});
    p.flat(O(8, 8, 5), '#FAF6EC');
    p.flat(O(8, 8, 3.2), '#D9483B');
    p.flat(O(8, 8, 1.4), '#FAF6EC');
  },
  '💾': p => {   // a floppy disk: the save file
    p.fill(Rc(1.5, 1.5, 13, 13, 1), '#3F6FB0', {light: '#6E97D0'});
    p.fill(Rc(4.5, 1.5, 7, 4.5), '#B9C2C9'); p.flat(Rc(9, 2.5, 1.5, 2.5), '#3F6FB0');
    p.fill(Rc(3.5, 8, 9, 6.5), '#F4F0E8');
    p.flat(or(Rc(5, 10, 6, 1), Rc(5, 12, 4, 1)), '#9A948A');
  },
  '📖': p => {   // an open book: the story
    p.fill(Pg([[0.5, 3.5], [8, 5], [15.5, 3.5], [15.5, 14], [8, 15.5], [0.5, 14]]), '#8A3B2E');
    p.fill(Pg([[1.5, 2], [7.5, 3.5], [7.5, 13.5], [1.5, 12]]), '#FAF6EC', {light: '#FFFFFF', dark: '#D8D0BC'});
    p.fill(Pg([[8.5, 3.5], [14.5, 2], [14.5, 12], [8.5, 13.5]]), '#F1EBDC', {light: '#FFFFFF', dark: '#D0C7B2'});
    p.flat(or(Rc(3, 5, 3, 1), Rc(3, 7, 3, 1), Rc(3, 9, 3, 1), Rc(10, 5, 3, 1), Rc(10, 7, 3, 1), Rc(10, 9, 2, 1)), '#B8AE98');
  },
  '🏆': p => {   // a cup: you passed
    p.fill(or(path([[3.5, 3.5], [1.6, 4], [2.2, 7], [4.5, 8]], .8), path([[12.5, 3.5], [14.4, 4], [13.8, 7], [11.5, 8]], .8)), '#D89A22');
    p.fill(Pg([[3, 1.5], [13, 1.5], [12.4, 6], [10, 9.5], [6, 9.5], [3.6, 6]]), GOLD, {light: '#FFF1A8', dark: '#D89A22'});
    p.fill(Rc(7, 9.5, 2, 2.5), '#D89A22');
    p.fill(Rc(4.5, 12, 7, 2.5, .5), '#8A5A32');
  },
  '⛰️': p => {   // mountains: an area done
    p.fill(Pg([[6, 15], [11, 4], [16, 15]]), '#7E8C80');
    p.fill(Pg([[0, 15], [6, 2], [12, 15]]), '#9AA59A');
    p.flat(Pg([[4, 6.4], [6, 2], [8.1, 6.4], [7, 6], [6, 7], [5, 6]]), '#F6F6F0');
    p.flat(Pg([[9.8, 6.6], [11, 4], [12.3, 6.6], [11.3, 6.2]]), '#F6F6F0');
    p.fill(Rc(0, 12, 16, 3), '#5FA85A');
  },
  '☰': p => p.fill(Rc(1, 4.5, 14, 7, 3.5), '#6B7A72', {light: '#8D9C94'}),   // the console's MENU button, in How to play
  '✚': p => p.fill(or(Rc(5.5, 1, 5, 14, .8), Rc(1, 5.5, 14, 5, .8)), '#56635C', {light: '#7A8880'}),   // the D-pad, in How to play
  '📤': p => {   // an iPhone's Share button: a tray, open at the top, with an arrow up out of it
    p.flat(path([[5.5, 6], [2.5, 6], [2.5, 14.5], [13.5, 14.5], [13.5, 6], [10.5, 6]], .9), '#2F7BE0');
    p.flat(or(Rc(7.2, 3, 1.6, 7.5), Pg([[8, .5], [11.6, 4.4], [4.4, 4.4]])), '#2F7BE0');
  },
  '➕': p => {   // Add to Home Screen: a plus in a white rounded square, as on an iPhone
    p.fill(Rc(1, 1, 14, 14, 3.5), '#F4F0E8', {dark: '#C9C2B4'});
    p.flat(or(Rc(7.2, 4, 1.6, 8), Rc(4, 7.2, 8, 1.6)), '#3A3632');
  },
  '⛶': p => p.flat(or(path([[1.5, 5.5], [1.5, 1.5], [5.5, 1.5]], .9), path([[10.5, 1.5], [14.5, 1.5], [14.5, 5.5]], .9),   // full screen: four corners
    path([[14.5, 10.5], [14.5, 14.5], [10.5, 14.5]], .9), path([[5.5, 14.5], [1.5, 14.5], [1.5, 10.5]], .9)), '#F2C14E')
};
function icon(name){ const cells = draw(name, ICON_DRAWINGS[name], 16); N = 16; return rowsOf(cells, name); }

// Each picture as rows of letters and a palette, as content/pictures.js has them.
const LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function picture(word){ return rowsOf(draw(word), word); }
function rowsOf(cells, word){
  const palette = {}, letter = {};
  const rows = [];
  for (let y = 0; y < N; y++){
    let row = '';
    for (let x = 0; x < N; x++){
      const k = cells[y * N + x];
      if (!k){ row += '.'; continue; }
      if (!letter[k]){ const l = LETTERS[Object.keys(letter).length]; if (!l) throw new Error(word + ' has too many colours'); letter[k] = l; palette[l] = k; }
      row += letter[k];
    }
    rows.push(row);
  }
  return {palette, rows};
}
// content/pictures.js, as text.
function text(){
  const words = Object.keys(DRAWINGS);
  const bank = (() => { const g = {}; new Function('g', fs.readFileSync(path_.join(__dirname, '../content/words.js'), 'utf8') + '; g.WORD_BANK = WORD_BANK;')(g); return g.WORD_BANK; })();
  const entry = (key, {palette, rows}, note) => `  '${key}': {${note ? `   // ${note}` : ''}\n    palette: {${Object.entries(palette).map(([l, k]) => `${l}:'${k}'`).join(', ')}},\n    rows: [\n${rows.map(r => `      "${r}"`).join(',\n')}\n    ]\n  }`;
  const one = w => entry(w, picture(w), bank[w] ? bank[w].en : '');
  return `// The word pictures: 32 x 32 pixel art for every word with a picture, one letter per pixel ('.' is see-through),
// and each letter's colour in its palette. They're shown on word cards, in questions, the scrolls, the shop and
// animal encounters (the animals walking on the map are in content/sprites.js).
// Made by tools/draw-pictures.js: change a picture there and run  npm run pictures , not here.
const PICTURES = {
${words.map(one).join(',\n')}
};

// The game's icons, 16 x 16, by the emoji the text uses for them: wherever the game's text has one of these, it
// shows the pixel icon instead (pixelIcons() in js/art.js).
const ICONS = {
${Object.keys(ICON_DRAWINGS).map(k => entry(k, icon(k))).join(',\n')}
};
`;
}
const FILE = path_.join(__dirname, '../content/pictures.js');
if (require.main === module){ fs.writeFileSync(FILE, text()); console.log('Wrote content/pictures.js (' + Object.keys(DRAWINGS).length + ' pictures, ' + Object.keys(ICON_DRAWINGS).length + ' icons)'); }
module.exports = {text, FILE, DRAWINGS, picture, ICON_DRAWINGS, icon};
