// The brush font for a word's big characters on its card (decided 11 November 2026): fonts/kai.woff, LXGW WenKai GB, the
// mainland edition, cut down to the word bank's characters by tools/make-font.js (npm run font). The edition on Google
// Fonts is the Traditional Chinese one, which writes 真, 没, 换, 教, 青, 今 and more the Taiwan way, not the way the game
// teaches. The whole font, 26 MB, isn't kept with the game, so these tests read only the cut-down one.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {gameChars, cutFont, unpack, hasChar, OUT, NAME} = require('../tools/make-font');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const nameText = (name, id) => {   // one of the font's own texts
  const strings = name.readUInt16BE(4);
  for (let i = 0, n = name.readUInt16BE(2); i < n; i++){ const p = 6 + i * 12; if (name.readUInt16BE(p + 6) === id) return Buffer.from(name.subarray(strings + name.readUInt16BE(p + 10), strings + name.readUInt16BE(p + 10) + name.readUInt16BE(p + 8))).swap16().toString('utf16le'); }
  return '';
};

test('the brush font has every Chinese character of the word bank (if not, run: npm run font)', () => {
  const woff = fs.readFileSync(OUT), tables = unpack(woff), chars = gameChars();
  assert.ok(chars.length > 300, `the word bank's characters: ${chars.length}`);
  const missing = chars.filter(c => !hasChar(tables, c));
  assert.deepEqual(missing, [], 'a word has a character the font hasn’t got: download the whole font (tools/make-font.js says where) and run npm run font');
  assert.ok(!hasChar(tables, 'A') && !hasChar(tables, '龘'), 'and only those: it’s cut down');
  assert.ok(woff.length < 300 * 1024, `one small file: ${Math.round(woff.length / 1024)} KB`);
  for (const t of ['cmap', 'glyf', 'head', 'hhea', 'hmtx', 'loca', 'maxp', 'name', 'post']) assert.ok(tables[t], `it has its ${t} table`);
  assert.equal(tables.loca.length, (tables.maxp.readUInt16BE(4) + 1) * 4, 'a place for every glyph, used or not: their numbers are as in the whole font');
});

test('it’s named as a cut-down copy, with the font’s own copyright and licence, and the licence is kept with it', () => {
  const tables = unpack(fs.readFileSync(OUT));
  assert.equal(nameText(tables.name, 1), NAME);
  assert.equal(NAME, 'Little Monkey Kai');
  assert.match(nameText(tables.name, 0), /Copyright .*LXGW/, 'the font’s own copyright');
  assert.match(nameText(tables.name, 13), /SIL Open Font License/);
  const licence = read('fonts/OFL.txt');
  assert.match(licence, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(licence, /subsetted or converted to other\s+formats \(e\.g\., WOFF\/WOFF2\) solely for web font delivery/, 'which says a copy cut down for a web page is allowed');
});

test('the game uses it for a word’s big characters in their grid, asks for it early, keeps it for offline, and the whole font stays off GitHub', () => {
  const css = read('css/game.css'), page = read('index.html');
  assert.match(css, /@font-face\{font-family:"Little Monkey Kai";src:url\(\.\.\/fonts\/kai\.woff\) format\("woff"\);[^}]*font-display:swap\}/, 'shown in the ordinary font till it has loaded, never blank');
  assert.match(css, /\.word \.big \.ge\{[^}]*font-family:"Little Monkey Kai",var\(--text\)/, 'with the game’s ordinary font for a character it hasn’t got');
  assert.equal((css.match(/Little Monkey Kai/g) || []).length, 2, 'nowhere else: sentences, questions and pinyin are as they were');
  assert.match(page, /<link rel="preload" href="fonts\/kai\.woff" as="font" type="font\/woff" crossorigin>/, 'one of the page’s own files, so the offline copy has it (ownFiles, js/main.js)');
  assert.ok(page.indexOf('href="fonts/kai.woff"') < page.indexOf('href="css/game.css"'), 'asked for before the styles');
  assert.match(read('.gitignore'), /^tools\/fonts\/$/m, 'the whole font, 26 MB, isn’t kept with the game');
  assert.equal(JSON.parse(read('package.json')).scripts.font, 'node tools/make-font.js');
});

test('the tool cuts a font down to the characters asked for, and says which it hasn’t got', () => {
  // (on the game's own cut-down font, as the whole one isn't here: cut down again, to three characters)
  const tables = unpack(fs.readFileSync(OUT));
  const tags = Object.keys(tables).sort(), dir = Buffer.alloc(12 + tags.length * 16);
  dir.writeUInt32BE(0x00010000, 0); dir.writeUInt16BE(tags.length, 4);
  let at = dir.length; const parts = [];
  tags.forEach((tag, i) => { const p = 12 + i * 16, b = tables[tag], padded = b.length % 4 ? Buffer.concat([b, Buffer.alloc(4 - b.length % 4)]) : b; dir.write(tag, p, 'latin1'); dir.writeUInt32BE(at, p + 8); dir.writeUInt32BE(b.length, p + 12); at += padded.length; parts.push(padded); });
  const {woff, chars, missing} = cutFont(Buffer.concat([dir, ...parts]), ['山', '羊', 'A']);
  assert.deepEqual([chars.join(''), missing.join('')], ['山羊', 'A']);
  const small = unpack(woff);
  assert.ok(hasChar(small, '山') && hasChar(small, '羊') && !hasChar(small, '水'));
  assert.ok(small.glyf.length < tables.glyf.length / 20, 'only their glyphs are kept');
  assert.ok(woff.length < 20 * 1024);
});
