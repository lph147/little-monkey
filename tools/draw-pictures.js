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
  '鸟': p => {   // bird
    p.fill(Pg([[22, 16], [31, 11.5], [30, 19.5]]), '#3F77C4');
    p.flat(or(Cp(14, 25, 14, 29, .6), Cp(18, 25, 18, 29, .6)), '#F2A33A');
    p.fill(O(17, 18, 8.4, 6.6), '#5AA0E6');
    p.flat(O(14.5, 21.2, 5.2, 3.2), '#CDE6FA');
    p.fill(O(19.5, 16.6, 5.5, 3.6), '#3F77C4', {edge: true});
    p.fill(O(10, 12, 5.2, 4.8), '#5AA0E6', {edge: true});
    p.fill(Pg([[2.5, 12.5], [6, 10.5], [6, 14]]), '#F2A33A');
    p.eye(8, 10);
  },
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
  '头带': p => {   // headband: a red cloth band, tied with a knot, its ends hanging
    p.fill(path([[23.5, 20], [26.5, 25.5], [28.5, 30.5]], 1.8), '#A82E22', {edge: true}); p.fill(path([[22, 20.5], [22, 26], [23.5, 31]], 1.8), '#C0392B', {edge: true});
    p.fill(and(O(16, 15.5, 13.4, 7.6), not(O(16, 13.8, 10, 4.2))), '#C0392B');
    p.flat(and(O(16, 15.5, 12.4, 6.6), not(O(16, 14.8, 11.4, 5.4)), Rc(0, 17, 32, 15)), '#E25A4C');   // a fold of the cloth
    p.fill(O(23.5, 20, 2.8, 2.6), '#A82E22', {edge: true});
  },

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
  }
};
function splat(p, c){   // a smooth, round dab of paint, for a colour, with two little drops
  p.fill(or(O(15.5, 17, 10.5, 9), O(23, 21.5, 4.6, 4)), c);
  p.fill(O(27, 8.5, 2), c); p.fill(O(5.5, 27, 1.6), c);
  p.flat(O(11.5, 12.5, 3.4, 2), mix(c, '#FFFFFF', .5)); p.flat(O(16.5, 11, 1.2, .8), mix(c, '#FFFFFF', .5));
}
function flower(p, petal, middle){   // a flower, its five petals one colour (petal), on a stem with two leaves
  p.fill(Cp(16, 18, 16, 30, 1), '#3E8A3E');
  p.fill(O(11, 25, 4, 1.8), LEAF); p.fill(O(21, 22.5, 4, 1.8), LEAF);
  for (let i = 0; i < 5; i++){ const a = -Math.PI / 2 + i * 2 * Math.PI / 5; p.fill(O(16 + Math.cos(a) * 5.4, 12 + Math.sin(a) * 5.4, 3.8), petal, {edge: true}); }
  p.fill(O(16, 12, 2.8), middle, {edge: true});
}

// The game's icons, 16 x 16, for the menu, card headings and labels (instead of emoji, which look different on
// every phone). The text in the game says them as emoji (⭐, 📜 ...), and js/art.js swaps in these pictures.
const ICON_DRAWINGS = {
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
