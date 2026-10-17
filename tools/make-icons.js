// The app's icons (icons/*.png): the baby monkey from the game's own pixel art, standing on grass under a
// blue sky. Run it with:  npm run icons   (after changing the monkey or its colours in js/art.js).
// It needs no packages: the PNG files are written by hand, below. A test checks the icons are up to date.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const {loadGame, ROOT} = require('../tests/fake-browser');

const DIR = path.join(ROOT, 'icons');
// Each icon: its file, its size, and how many pixels wide each of the monkey's 16 x 16 pixels is drawn. The
// monkey stays inside the middle 80% circle, so phones that cut icons into circles don't cut it off.
const ICONS = [
  {file: 'icon-512.png', size: 512, scale: 22},
  {file: 'icon-192.png', size: 192, scale: 8},
  {file: 'apple-touch-icon.png', size: 180, scale: 8}   // for an iPhone's home screen
];
const SKY = '#79BFE6', GRASS_TOP = '#6CC066', GRASS = '#3F9A4C';

let monkey = null;   // the monkey's rows and colours, from the game
function draw({size, scale}){
  if (!monkey){
    const game = loadGame();
    monkey = {rows: JSON.parse(game.run("JSON.stringify(monkeyRows('player', 'down', false, 0))")), pal: JSON.parse(game.run('JSON.stringify(PALS.player)'))};
  }
  const px = Buffer.alloc(size * size * 4);   // red, green, blue and opacity for each pixel
  const put = (x, y, hex) => { const i = (y * size + x) * 4; px[i] = parseInt(hex.slice(1, 3), 16); px[i + 1] = parseInt(hex.slice(3, 5), 16); px[i + 2] = parseInt(hex.slice(5, 7), 16); px[i + 3] = 255; };
  const ground = Math.round(size * .78);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) put(x, y, y < ground ? SKY : y < ground + scale ? GRASS_TOP : GRASS);
  const left = Math.floor((size - 16 * scale) / 2), top = ground + scale - 16 * scale;   // its feet on the grass
  monkey.rows.forEach((row, ry) => [...row].forEach((ch, rx) => {
    if (!monkey.pal[ch]) return;
    for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) put(left + rx * scale + dx, top + ry * scale + dy, monkey.pal[ch]);
  }));
  return px;
}

// A PNG file: a signature, then chunks (the size, the pixels squeezed with zlib, the end), each with a checksum.
function png(w, h, px){
  const raw = Buffer.alloc((w * 4 + 1) * h);   // each row of pixels starts with a 0 (no filter)
  for (let y = 0; y < h; y++) px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  const chunk = (type, data) => {
    const len = Buffer.alloc(4), body = Buffer.concat([Buffer.from(type, 'ascii'), data]), crc = Buffer.alloc(4);
    len.writeUInt32BE(data.length); crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const head = Buffer.alloc(13);
  head.writeUInt32BE(w, 0); head.writeUInt32BE(h, 4); head[8] = 8; head[9] = 6;   // 8 bits each of red, green, blue and opacity
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', zlib.deflateSync(raw, {level: 9})), chunk('IEND', Buffer.alloc(0))]);
}

// The size and pixels of a PNG file written by png() (for the test).
function read(file){
  const ids = [];
  let w = 0, h = 0;
  for (let i = 8; i < file.length;){
    const len = file.readUInt32BE(i), type = file.toString('ascii', i + 4, i + 8), data = file.subarray(i + 8, i + 8 + len);
    if (type === 'IHDR'){ w = data.readUInt32BE(0); h = data.readUInt32BE(4); }
    if (type === 'IDAT') ids.push(data);
    i += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(ids)), px = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) raw.copy(px, y * w * 4, y * (w * 4 + 1) + 1, (y + 1) * (w * 4 + 1));
  return {w, h, px};
}

if (require.main === module){
  fs.mkdirSync(DIR, {recursive: true});
  for (const icon of ICONS){
    fs.writeFileSync(path.join(DIR, icon.file), png(icon.size, icon.size, draw(icon)));
    console.log('Wrote icons/' + icon.file);
  }
}
module.exports = {ICONS, DIR, draw, read};
