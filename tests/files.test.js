// The game's page loads every script in js/ and content/, so none gets forgotten.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {scriptsIn, ROOT, ENTRY} = require('./fake-browser');

test(`${ENTRY} loads every script in js/ and content/`, () => {
  const loaded = scriptsIn(ENTRY).map(s => path.relative(ROOT, s.file).split(path.sep).join('/'));
  for (const dir of ['content', 'js']){
    const onDisk = fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.js')).map(f => `${dir}/${f}`);
    for (const file of onDisk) assert.ok(loaded.includes(file), `${file} is not loaded by ${ENTRY}`);
  }
});

// The Chinese font draws ‘ ’ “ ” as wide as a character, and puts the tone marks of ā ē ī ō ū beside the letter (and
// keeps the dot on ī ǐ), so Latin letters, in English and in pinyin, come from another font.
test('English and pinyin get their Latin letters (and curly quotes) from a font that draws them properly', () => {
  const css = fs.readFileSync(path.join(ROOT, 'css/game.css'), 'utf8');
  const html = fs.readFileSync(path.join(ROOT, ENTRY), 'utf8');
  assert.match(css, /\bbody\{[^}]*font-family:var\(--en\)/, 'the page text should use --en');
  assert.match(css, /--en:\s*var\(--text\)/, 'English text uses the same fonts as Chinese and pinyin');
  const font = /--text:\s*"([^"]+)",\s*"Noto Sans SC"/.exec(css);
  assert.ok(font, '--text should start with a Latin font, before the Chinese one');
  const link = [...html.matchAll(/href="([^"]*fonts\.googleapis\.com[^"]*)"/g)].map(m => decodeURIComponent(m[1]))
    .find(u => u.includes(`family=${font[1].replace(/ /g, '+')}:`));
  assert.ok(link, `${ENTRY} should load ${font[1]}`);
  assert.ok(!/[?&]text=/.test(link), `${font[1]} should be loaded whole, for every letter with a tone mark (not just some, with text=)`);
});

// CHINESE.md lists all the game's Chinese for a native speaker to check (tools/chinese-sheet.js).
test('CHINESE.md is up to date with the content (if not, run: npm run chinese)', () => {
  const {sheet, FILE} = require('../tools/chinese-sheet');
  assert.equal(fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n'), sheet(), 'CHINESE.md is out of date: run npm run chinese');
});

test('draft sentences waiting to be checked only use words in the word bank', () => {
  const {DRAFTS} = require('../tools/chinese-sheet');
  const {loadGame} = require('./fake-browser');
  const bank = JSON.parse(loadGame().run('JSON.stringify(WORD_BANK)'));
  for (const d of DRAFTS) for (const w of d.zh.split(' ')) assert.ok(bank[w] || '。！，？、'.includes(w), `the draft "${d.zh}" uses ${w}, which isn't in the word bank`);
});
