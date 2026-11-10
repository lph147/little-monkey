// The palette, noise and drawing helpers the mock-ups share.
const {Img} = require('./png.js');

const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map(Math.round);
const ramp = (...hs) => hs.map(hex);

// One palette for the whole game. Every ramp runs light to dark, and turns warmer in the light and cooler (towards
// blue-violet) in the shade, as mineral paints do in a blue-green landscape painting.
const P = {
  grass: ramp('#D3E08A', '#B4D172', '#93BF64', '#74AB5C', '#569258', '#3E7A55', '#2D6150', '#234A48'),
  leaf:  ramp('#C6DC78', '#9CC862', '#72AE56', '#4F9450', '#38794E', '#2A604B', '#204944', '#18353B'),
  pine:  ramp('#A5CF8C', '#74B27A', '#4C966C', '#357A62', '#286057', '#1F494B', '#18363F', '#122733'),
  earth: ramp('#F4E3B5', '#E9CF98', '#DBB87F', '#C69C6B', '#A87E5C', '#86624F', '#664944', '#48343A'),
  rock:  ramp('#F4EEDC', '#E0D8C3', '#C6BEAA', '#A8A296', '#898888', '#6B6C7A', '#4E5066', '#36374F'),
  water: ramp('#DDF4E6', '#A9E2D4', '#79CDC6', '#52B2B8', '#3B94AA', '#2F7698', '#285A82', '#22416A'),
  wood:  ramp('#EBCB92', '#D7A96D', '#BB8650', '#986541', '#774A39', '#573434', '#3C252D'),
  gold:  ramp('#FFF2B8', '#FBDB7C', '#F0BC4E', '#D99535', '#B26E2C', '#84492A', '#5A2E28'),
  red:   ramp('#FFB59A', '#F27F62', '#DC4A34', '#B92F2C', '#8C2030', '#5E1930'),
  sky:   ramp('#FFF6DC', '#FDE6B8', '#F8CFA0', '#EDB5A0', '#C9A2B4', '#9C93BE', '#6F7FBA', '#4C63A4', '#35478A', '#263066'),
  ink:   hex('#2A2233'), paper: hex('#F6ECD4'), white: hex('#FFFBEE'),
};

// ---- noise (the same every run) ----
const hash = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const smooth = t => t * t * (3 - 2 * t);
function noise(x, y, s = 0){
  const xi = Math.floor(x), yi = Math.floor(y), xf = smooth(x - xi), yf = smooth(y - yi);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}
const fbm = (x, y, s = 0) => noise(x, y, s) * .6 + noise(x * 2.1, y * 2.1, s + 7) * .28 + noise(x * 4.3, y * 4.3, s + 13) * .12;

// ---- sprites from letter grids ----
// rows: strings, one letter a pixel; pal: letter -> colour ([r,g,b] or '#hex'); '.' is see-through.
function sprite(rows, pal){
  const w = Math.max(...rows.map(r => r.length)), img = new Img(w, rows.length);
  rows.forEach((r, y) => [...r].forEach((ch, x) => { const c = pal[ch]; if (c) img.set(x, y, typeof c === 'string' ? hex(c) : c); }));
  return img;
}
// an ellipse mask test
const inEllipse = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
// darken what's there, as a shadow does: a cool multiply, so shadows lean blue-violet (a: how strong, 0..1)
const SHADE = [.52, .58, .82];
function shadePx(img, x, y, a = 1){
  if (x < 0 || y < 0 || x >= img.w || y >= img.h) return;
  const o = (y * img.w + x) * 4; if (!img.d[o + 3]) return;
  for (let k = 0; k < 3; k++) img.d[o + k] = img.d[o + k] * (1 - a * (1 - SHADE[k]));
}
// lighten what's there, as warm sunlight does
const LIGHT = [255, 240, 190];
function lightPx(img, x, y, a = 1){
  if (x < 0 || y < 0 || x >= img.w || y >= img.h) return;
  const o = (y * img.w + x) * 4; if (!img.d[o + 3]) return;
  for (let k = 0; k < 3; k++) img.d[o + k] = img.d[o + k] + (LIGHT[k] - img.d[o + k]) * a;
}
module.exports = {Img, P, hex, mix, ramp, hash, noise, fbm, sprite, inEllipse, shadePx, lightPx, smooth};
