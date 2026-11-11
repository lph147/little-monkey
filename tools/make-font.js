// Makes fonts/kai.woff: the brush-written textbook font for a word's big characters on its card (css/game.css, .ge), cut
// down to just the characters of the word bank, so it's one small file kept with the game.
//
// The font is LXGW WenKai GB (霞鹜文楷 GB), the mainland edition, free to use and change under the SIL Open Font
// License (fonts/OFL.txt). Not the edition on Google Fonts, which is the Traditional Chinese one and writes 真, 没, 换,
// 教, 青, 今 and more the Taiwan way, not the way the game teaches (decided 11 November 2026).
//
// To run it (npm run font) you need the whole font, 26 MB, which isn't kept with the game: download
// LXGWWenKaiGB-Regular.ttf from https://github.com/lxgw/LxgwWenkaiGB/releases and put it in tools/fonts/. Run it again
// whenever the word bank gets a character it hasn't had: a test (tests/font.test.js) checks none is missing.
//
// It keeps every glyph's number as it was and empties the glyphs the game doesn't use, so the tables that go by glyph
// number stay as they are; writes a new, small character map; drops what a single big character doesn't need (the
// tables for joining and placing letters, and for writing downwards); renames the font, as a cut-down copy should be;
// and packs it as WOFF, which every browser reads. No packages: Node's own zlib does the packing.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'tools', 'fonts', 'LXGWWenKaiGB-Regular.ttf'), OUT = path.join(ROOT, 'fonts', 'kai.woff');
const NAME = 'Little Monkey Kai';
const KEEP = ['OS/2', 'cmap', 'cvt ', 'fpgm', 'gasp', 'glyf', 'head', 'hhea', 'hmtx', 'loca', 'maxp', 'name', 'post', 'prep'];

// Every Chinese character of the word bank (all the areas' words), in order.
function gameChars(){
  const {loadGame} = require('../tests/fake-browser');
  const words = JSON.parse(loadGame().run('JSON.stringify(Object.keys(WORD_BANK))'));
  return [...new Set(words.join(''))].filter(c => /[㐀-鿿]/.test(c)).sort();
}

/* ---- reading a font ---- */
function tablesOf(buf){   // a TrueType font's tables, by name
  const n = buf.readUInt16BE(4), out = {};
  for (let i = 0; i < n; i++){ const p = 12 + i * 16; out[buf.toString('latin1', p, p + 4)] = buf.subarray(buf.readUInt32BE(p + 8), buf.readUInt32BE(p + 8) + buf.readUInt32BE(p + 12)); }
  return out;
}
function glyphOf(cmap){   // from a font's character map: a function giving a character's glyph number (0: it has none)
  let best = null;
  for (let i = 0, n = cmap.readUInt16BE(2); i < n; i++){
    const platform = cmap.readUInt16BE(4 + i * 8), enc = cmap.readUInt16BE(6 + i * 8), off = cmap.readUInt32BE(8 + i * 8), format = cmap.readUInt16BE(off);
    const unicode = platform === 0 || (platform === 3 && (enc === 1 || enc === 10)), score = !unicode ? 0 : format === 12 ? 2 : format === 4 ? 1 : 0;
    if (score && (!best || score > best.score)) best = {off, format, score};
  }
  if (!best) throw new Error('This font has no character map the tool can read.');
  const o = best.off;
  if (best.format === 12) return cp => {
    for (let i = 0, n = cmap.readUInt32BE(o + 12); i < n; i++){ const p = o + 16 + i * 12, a = cmap.readUInt32BE(p), z = cmap.readUInt32BE(p + 4); if (cp >= a && cp <= z) return cmap.readUInt32BE(p + 8) + cp - a; }
    return 0;
  };
  const segs = cmap.readUInt16BE(o + 6) / 2, ends = o + 14, starts = ends + segs * 2 + 2, deltas = starts + segs * 2, ranges = deltas + segs * 2;
  return cp => {
    for (let i = 0; i < segs; i++){
      if (cp > cmap.readUInt16BE(ends + i * 2)) continue;
      const a = cmap.readUInt16BE(starts + i * 2); if (cp < a) return 0;
      const delta = cmap.readUInt16BE(deltas + i * 2), range = cmap.readUInt16BE(ranges + i * 2);
      if (!range) return (cp + delta) & 0xFFFF;
      const g = cmap.readUInt16BE(ranges + i * 2 + range + (cp - a) * 2);
      return g ? (g + delta) & 0xFFFF : 0;
    }
    return 0;
  };
}
function partsOf(glyf, a, z){   // the glyphs a glyph is put together from, if it is (most are drawn outright)
  if (z - a < 10 || glyf.readInt16BE(a) >= 0) return [];
  const out = [];
  for (let p = a + 10; ;){
    const flags = glyf.readUInt16BE(p); out.push(glyf.readUInt16BE(p + 2));
    p += 4 + (flags & 1 ? 4 : 2) + (flags & 8 ? 2 : flags & 0x40 ? 4 : flags & 0x80 ? 8 : 0);
    if (!(flags & 0x20)) return out;
  }
}
function nameOf(name, id){   // one of the font's own texts, such as its copyright (in English, as Windows keeps it)
  const strings = name.readUInt16BE(4);
  for (let i = 0, n = name.readUInt16BE(2); i < n; i++){
    const p = 6 + i * 12;
    if (name.readUInt16BE(p) === 3 && name.readUInt16BE(p + 4) === 0x409 && name.readUInt16BE(p + 6) === id){
      const s = name.subarray(strings + name.readUInt16BE(p + 10), strings + name.readUInt16BE(p + 10) + name.readUInt16BE(p + 8));
      return Buffer.from(s).swap16().toString('utf16le');
    }
  }
  return '';
}

/* ---- writing the cut-down font ---- */
const pad4 = b => b.length % 4 ? Buffer.concat([b, Buffer.alloc(4 - b.length % 4)]) : b;
function sumOf(b){ b = pad4(b); let s = 0; for (let i = 0; i < b.length; i += 4) s = (s + b.readUInt32BE(i)) >>> 0; return s; }
function newCmap(pairs){   // a character map of just these, [character's number, glyph number], in order: one stretch each
  const segs = [...pairs.map(([cp, g]) => [cp, (g - cp) & 0xFFFF]), [0xFFFF, 1]], n = segs.length, sel = Math.floor(Math.log2(n)), search = 2 * 2 ** sel;
  const sub = Buffer.alloc(16 + n * 8);
  [4, sub.length, 0, n * 2, search, sel, n * 2 - search].forEach((v, i) => sub.writeUInt16BE(v, i * 2));
  segs.forEach(([cp, delta], i) => { sub.writeUInt16BE(cp, 14 + i * 2); sub.writeUInt16BE(cp, 16 + n * 2 + i * 2); sub.writeUInt16BE(delta, 16 + n * 4 + i * 2); });
  const head = Buffer.alloc(20);
  [0, 2, 0, 3].forEach((v, i) => head.writeUInt16BE(v, i * 2)); head.writeUInt32BE(20, 8);   // for anything: Unicode
  [3, 1].forEach((v, i) => head.writeUInt16BE(v, 12 + i * 2)); head.writeUInt32BE(20, 16);   // and for Windows
  return Buffer.concat([head, sub]);
}
function newName(texts){   // the font's texts, {id: text}
  const ids = Object.keys(texts).map(Number).filter(id => texts[id]).sort((a, b) => a - b), strings = ids.map(id => Buffer.from(texts[id], 'utf16le').swap16());
  const head = Buffer.alloc(6 + ids.length * 12);
  head.writeUInt16BE(ids.length, 2); head.writeUInt16BE(head.length, 4);
  let at = 0;
  ids.forEach((id, i) => { [3, 1, 0x409, id, strings[i].length, at].forEach((v, k) => head.writeUInt16BE(v, 6 + i * 12 + k * 2)); at += strings[i].length; });
  return Buffer.concat([head, ...strings]);
}
// The font cut down to these characters: {woff, chars (those it has), missing (those the font doesn't have)}.
function cutFont(ttf, chars){
  const t = tablesOf(ttf);
  for (const need of ['cmap', 'glyf', 'head', 'hhea', 'hmtx', 'loca', 'maxp', 'name', 'post']) if (!t[need]) throw new Error(`This isn't a TrueType font the tool can cut down: it has no ${need.trim()} table.`);
  const glyphs = t.maxp.readUInt16BE(4), long = t.head.readInt16BE(50) === 1, at = i => long ? t.loca.readUInt32BE(i * 4) : t.loca.readUInt16BE(i * 2) * 2;
  const find = glyphOf(t.cmap), pairs = [], missing = [];
  for (const c of chars){ const cp = c.codePointAt(0), g = cp > 0xFFFF ? 0 : find(cp); if (g) pairs.push([cp, g]); else missing.push(c); }
  pairs.sort((a, b) => a[0] - b[0]);
  const keep = new Set([0]), todo = pairs.map(p => p[1]);
  while (todo.length){ const g = todo.pop(); if (keep.has(g) || g >= glyphs) continue; keep.add(g); todo.push(...partsOf(t.glyf, at(g), at(g + 1))); }
  // the glyphs: each one kept as it is, where it was in the count; the rest empty
  const pieces = [], loca = Buffer.alloc((glyphs + 1) * 4);
  let size = 0;
  for (let g = 0; g < glyphs; g++){
    loca.writeUInt32BE(size, g * 4);
    if (keep.has(g) && at(g + 1) > at(g)){ const piece = pad4(Buffer.from(t.glyf.subarray(at(g), at(g + 1)))); pieces.push(piece); size += piece.length; }
  }
  loca.writeUInt32BE(size, glyphs * 4);
  // how wide each glyph is: the same, but nothing for the glyphs that have gone (so it packs down to almost nothing)
  const hmtx = Buffer.from(t.hmtx), wide = t.hhea.readUInt16BE(34);
  for (let g = 0; g < glyphs; g++) if (!keep.has(g)){ if (g < wide - 1) hmtx.writeUInt32BE(0, g * 4); else if (g >= wide) hmtx.writeInt16BE(0, wide * 4 + (g - wide) * 2); }
  const head = Buffer.from(t.head); head.writeInt16BE(1, 50); head.writeUInt32BE(0, 8);
  const post = Buffer.alloc(32); t.post.copy(post, 0, 0, 32); post.writeUInt32BE(0x00030000, 0);   // (no glyph names)
  const name = newName({0: nameOf(t.name, 0), 1: NAME, 2: 'Regular', 3: `${NAME}: ${pairs.length} characters`, 4: NAME,
    5: nameOf(t.name, 5), 6: NAME.replace(/ /g, '') + '-Regular', 13: nameOf(t.name, 13), 14: nameOf(t.name, 14)});
  const made = {...Object.fromEntries(KEEP.filter(k => t[k]).map(k => [k, Buffer.from(t[k])])), cmap: newCmap(pairs), glyf: Buffer.concat(pieces), head, hmtx, loca, name, post};
  const tags = Object.keys(made).sort((a, b) => a < b ? -1 : 1);
  // as a plain font first, for its sums; then packed (WOFF: each table squeezed with zlib)
  const dirSize = 12 + tags.length * 16, sel = Math.floor(Math.log2(tags.length));
  const sfntHead = Buffer.alloc(dirSize);
  sfntHead.writeUInt32BE(0x00010000, 0); [tags.length, 16 * 2 ** sel, sel, tags.length * 16 - 16 * 2 ** sel].forEach((v, i) => sfntHead.writeUInt16BE(v, 4 + i * 2));
  let off = dirSize;
  tags.forEach((tag, i) => { const p = 12 + i * 16; sfntHead.write(tag, p, 'latin1'); sfntHead.writeUInt32BE(sumOf(made[tag]), p + 4); sfntHead.writeUInt32BE(off, p + 8); sfntHead.writeUInt32BE(made[tag].length, p + 12); off += pad4(made[tag]).length; });
  const whole = (sumOf(sfntHead) + tags.reduce((s, tag) => s + sumOf(made[tag]), 0)) >>> 0;
  made.head.writeUInt32BE((0xB1B0AFBA - whole) >>> 0, 8);
  const packed = tags.map(tag => { const z = zlib.deflateSync(made[tag], {level: 9}); return z.length < made[tag].length ? z : made[tag]; });
  const woffHead = Buffer.alloc(44 + tags.length * 20);
  let at2 = woffHead.length;
  tags.forEach((tag, i) => { const p = 44 + i * 20; woffHead.write(tag, p, 'latin1'); [at2, packed[i].length, made[tag].length, sumOf(made[tag])].forEach((v, k) => woffHead.writeUInt32BE(v, p + 4 + k * 4)); at2 += pad4(packed[i]).length; });
  woffHead.write('wOFF', 0, 'latin1'); woffHead.writeUInt32BE(0x00010000, 4); woffHead.writeUInt32BE(at2, 8); woffHead.writeUInt16BE(tags.length, 12);
  woffHead.writeUInt32BE(off, 16); woffHead.writeUInt16BE(1, 20);
  return {woff: Buffer.concat([woffHead, ...packed.map(pad4)]), chars: pairs.map(([cp]) => String.fromCodePoint(cp)), missing};
}
// A WOFF font's tables unpacked, by name (for the test, which reads its character map).
function unpack(woff){
  if (woff.toString('latin1', 0, 4) !== 'wOFF') throw new Error('Not a WOFF font.');
  const out = {};
  for (let i = 0, n = woff.readUInt16BE(12); i < n; i++){
    const p = 44 + i * 20, at = woff.readUInt32BE(p + 4), len = woff.readUInt32BE(p + 8), orig = woff.readUInt32BE(p + 12), data = woff.subarray(at, at + len);
    out[woff.toString('latin1', p, p + 4)] = len < orig ? zlib.inflateSync(data) : Buffer.from(data);
  }
  return out;
}
const hasChar = (tables, c) => glyphOf(tables.cmap)(c.codePointAt(0)) > 0;

if (require.main === module){
  const source = process.argv[2] || SOURCE, out = process.argv[3] || OUT;
  if (!fs.existsSync(source)){
    console.error(`The whole font isn't here: ${path.relative(ROOT, source)}\nDownload LXGWWenKaiGB-Regular.ttf from https://github.com/lxgw/LxgwWenkaiGB/releases and put it there (it isn't kept with the game: 26 MB).`);
    process.exit(1);
  }
  const chars = gameChars(), {woff, missing} = cutFont(fs.readFileSync(source), chars);
  if (missing.length) console.warn(`The font has no ${missing.join('')}: on a card, ${missing.length === 1 ? 'it' : 'they'} will be in the game's ordinary font.`);
  fs.mkdirSync(path.dirname(out), {recursive: true});
  fs.writeFileSync(out, woff);
  console.log(`Wrote ${path.relative(ROOT, out)} (${chars.length - missing.length} characters, ${Math.round(woff.length / 1024)} KB)`);
}
module.exports = {gameChars, cutFont, unpack, hasChar, tablesOf, OUT, NAME};
