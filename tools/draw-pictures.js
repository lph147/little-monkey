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
  '你好': p => {   // hello: a waving hand, fingers spread
    const S2 = '#F2C49A', LT = {light: '#FBDDBE', dark: '#D9A57E'};
    p.fill(Rc(11, 26, 10, 6, 1), '#4F82B0');
    p.fill(path([[8.5, 22.5], [4.5, 16.5]], 2.2), S2, {...LT, edge: true});
    p.fill(O(15.5, 20.5, 7, 7), S2, LT);
    [[[10.5, 15], [8.8, 5.5]], [[14.3, 14], [13.8, 3.5]], [[18.2, 14], [19, 4]], [[21.6, 16], [24, 8.5]]].forEach(([a, b]) => p.fill(Cp(...a, ...b, 2.1), S2, {...LT, edge: true}));
    p.fill(O(15.5, 21.5, 6, 5), S2, LT);
    [[8.4, 5.6], [13.4, 3.6], [18.6, 4], [23.4, 8.6]].forEach(([x, y]) => p.dot(Math.round(x), Math.round(y) + 1, '#FFE6CC'));   // fingernails
    p.flat(path([[11, 22.5], [14, 24.5], [19, 23.5]], .5), '#C98F68');
    p.flat(path([[26.5, 3], [28.8, 5.5], [29.3, 8.5]], .6), '#7FB6E8'); p.flat(path([[28.2, 11.5], [30, 14]], .6), '#7FB6E8');
    p.flat(path([[4.8, 4.5], [3.2, 7.5]], .6), '#7FB6E8');
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

  '花': p => {   // flower
    p.fill(Cp(16, 18, 16, 30, 1), '#3E8A3E');
    p.fill(O(11, 25, 4, 1.8), LEAF); p.fill(O(21, 22.5, 4, 1.8), LEAF);
    for (let i = 0; i < 5; i++){ const a = -Math.PI / 2 + i * 2 * Math.PI / 5; p.fill(O(16 + Math.cos(a) * 5.4, 12 + Math.sin(a) * 5.4, 3.8), '#F48FB1', {edge: true}); }
    p.fill(O(16, 12, 2.8), '#FFD54A', {edge: true});
  },
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
  '红': p => splat(p, '#E0303A'),
  '黄': p => splat(p, '#F2C93A'),
  '白': p => splat(p, '#F8F6F0'),
  '路': p => {   // path: a sandy path winding away up a grassy slope, narrowing into the distance
    p.fill(Rc(1, 8, 30, 23, 5), '#6CB35C', {light: '#8CCB6E', dark: '#4F9446'});
    p.fill(Pg([[7, 31], [24, 31], [20, 25], [13.5, 20.5], [17.5, 15], [21, 10.5], [18, 10.5], [12, 15], [8.5, 20.5], [11.5, 25.5]]), '#D9BB8A', {light: '#EBD3A8', dark: '#B9965F'});
    p.flat(or(O(15, 27, 1.2, .8), O(12.5, 22, 1, .7), O(16, 17, .9, .6)), '#C6A473');   // ruts
    p.fill(O(4.5, 23.5, 2, 1.5), '#A9A598'); p.fill(O(27, 18.5, 1.8, 1.3), '#A9A598');   // stones by the path
    p.fill(Rc(25, 6, 2, 5), '#8A5A32'); p.fill(O(26, 5.5, 3.6, 4), '#3F9A4C', {light: '#6CC066'});   // a tree far up the path
    p.flat(or(Rc(5, 13, 1, 2), Rc(8, 11, 1, 2), Rc(27, 26, 1, 2)), '#4F9446');   // tufts
  }
};
function splat(p, c){   // a smooth, round dab of paint, for a colour, with two little drops
  p.fill(or(O(15.5, 17, 10.5, 9), O(23, 21.5, 4.6, 4)), c);
  p.fill(O(27, 8.5, 2), c); p.fill(O(5.5, 27, 1.6), c);
  p.flat(O(11.5, 12.5, 3.4, 2), mix(c, '#FFFFFF', .5)); p.flat(O(16.5, 11, 1.2, .8), mix(c, '#FFFFFF', .5));
}

// The game's icons, 16 x 16, for the menu, card headings and labels (instead of emoji, which look different on
// every phone). The text in the game says them as emoji (⭐, 📜 ...), and js/art.js swaps in these pictures.
const ICON_DRAWINGS = {
  '⭐': p => {   // a star: a new word, a new friend
    const pts = [...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3.3 : 7.6; return [8 + r * Math.cos(a), 8.7 + r * Math.sin(a)]; });
    p.fill(Pg(pts), GOLD, {light: '#FFF1A8', dark: '#D89A22'});
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
  '✚': p => p.fill(or(Rc(5.5, 1, 5, 14, .8), Rc(1, 5.5, 14, 5, .8)), '#56635C', {light: '#7A8880'})   // the D-pad, in How to play
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
