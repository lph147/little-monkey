// The title's lettering as pixels: brush-written characters (rasterised big from a Kai face) cut down to the game's
// own pixel grid, filled gold, edged in ink.
const path = require('path');
const {Img, hex} = require('./core.js');

// ink: a big picture of the text (its alpha is the ink); tall: the height in game pixels to cut it down to
function pixelText(ink, tall, {cut = .34, fill = ['#FFF6CC', '#FDE38C', '#F6C65A', '#E9A93E'], edge = '#2A1E3C', shadow = '#1A1E48'} = {}){
  const f = ink.h / tall, w = Math.ceil(ink.w / f), mask = new Uint8Array(w * tall);
  for (let y = 0; y < tall; y++) for (let x = 0; x < w; x++){
    let s = 0, n = 0;
    for (let yy = Math.floor(y * f); yy < Math.floor((y + 1) * f); yy++) for (let xx = Math.floor(x * f); xx < Math.floor((x + 1) * f); xx++){ if (xx < ink.w && yy < ink.h){ s += ink.d[(yy * ink.w + xx) * 4 + 3]; n++; } }
    mask[y * w + x] = n && s / n / 255 > cut ? 1 : 0;
  }
  const on = (x, y) => x >= 0 && y >= 0 && x < w && y < tall && mask[y * w + x] === 1;
  let top = tall, bot = 0; for (let y = 0; y < tall; y++) for (let x = 0; x < w; x++) if (on(x, y)){ top = Math.min(top, y); bot = Math.max(bot, y); }
  const img = new Img(w + 4, tall + 5), F = fill.map(hex), E = hex(edge), S = hex(shadow);
  // shadow, then edge, then the gold
  for (let y = -1; y <= tall; y++) for (let x = -1; x <= w; x++){
    const near = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].some(([dx, dy]) => on(x + dx, y + dy));
    if (near){ img.set(x + 2, y + 4, S); img.set(x + 3, y + 4, S); }
  }
  for (let y = -1; y <= tall; y++) for (let x = -1; x <= w; x++){
    const near = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].some(([dx, dy]) => on(x + dx, y + dy));
    if (near) img.set(x + 2, y + 2, E);
  }
  for (let y = 0; y < tall; y++) for (let x = 0; x < w; x++) if (on(x, y)){
    const t = (y - top) / Math.max(1, bot - top), i = Math.min(F.length - 1, Math.floor(t * F.length));
    img.set(x + 2, y + 2, !on(x, y - 1) && t < .5 ? F[0] : F[i]);
  }
  return img;
}
module.exports = {pixelText};
