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
  const fonts = fs.readFileSync(path.join(ROOT, 'fonts/fonts.css'), 'utf8');
  assert.match(css, /\bbody\{[^}]*font-family:var\(--en\)/, 'the page text should use --en');
  assert.match(css, /--en:\s*var\(--text\)/, 'English text uses the same fonts as Chinese and pinyin');
  const font = /--text:\s*"([^"]+)",\s*"Noto Sans SC"/.exec(css);
  assert.ok(font, '--text should start with a Latin font, before the Chinese one');
  // loaded whole, for every letter with a tone mark (not just some): one of its pieces holds each of them
  const ranges = [...fonts.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(m => m[1]).filter(b => b.includes(`'${font[1]}'`))
    .flatMap(b => /unicode-range:\s*([^;]+);/.exec(b)[1].split(',').map(r => r.trim().replace(/^U\+/i, '')));
  assert.ok(ranges.length, `fonts/fonts.css should load ${font[1]}`);
  const holds = c => ranges.some(r => { const [a, b = a] = r.split('-').map(h => parseInt(h, 16)); return c >= a && c <= b; });
  for (const ch of 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü‘’“”') assert.ok(holds(ch.codePointAt(0)), `${font[1]} should have ${ch}`);
});

// The fonts are kept with the game (decided 9 November 2026: Google Fonts is blocked in mainland China, where the game
// will be played learning English): the very files Google served, so the game looks just as it did.
test('the fonts come from the game’s own files, not from another site, and every piece of them is there', () => {
  const html = fs.readFileSync(path.join(ROOT, ENTRY), 'utf8');
  assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(html), `${ENTRY} should load nothing from Google Fonts`);
  assert.match(html, /<link rel="stylesheet" href="fonts\/fonts\.css">/, `${ENTRY} should load fonts/fonts.css`);
  const fonts = fs.readFileSync(path.join(ROOT, 'fonts/fonts.css'), 'utf8');
  assert.ok(!/https?:/.test(fonts.replace(/\/\*[\s\S]*?\*\//g, '')), 'every font file is the game’s own');
  const files = new Set([...fonts.matchAll(/url\(([^)]+)\)/g)].map(m => m[1]));
  assert.ok(files.size > 100, 'the Chinese font comes in pieces, so only those needed are downloaded');
  for (const f of files) assert.ok(fs.existsSync(path.join(ROOT, 'fonts', f)), `fonts/${f} is missing`);
  for (const family of ['Noto Sans SC', 'Pixelify Sans', 'Source Sans 3']) assert.ok(fonts.includes(`font-family: '${family}'`), `${family} should be in fonts/fonts.css`);
});

// CHINESE.md lists all the game's Chinese for a native speaker to check (tools/chinese-sheet.js).
test('CHINESE.md is up to date with the content (if not, run: npm run chinese)', () => {
  const {sheet, FILE} = require('../tools/chinese-sheet');
  assert.equal(fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n'), sheet(), 'CHINESE.md is out of date: run npm run chinese');
});

test('draft sentences waiting to be checked only use words in the word bank (a name gives its own pinyin)', () => {
  const {DRAFTS} = require('../tools/chinese-sheet');
  const {loadGame} = require('./fake-browser');
  const bank = JSON.parse(loadGame().run('JSON.stringify(WORD_BANK)'));
  for (const d of DRAFTS.filter(d => !d.py)) for (const w of d.zh.split(' ')) assert.ok(bank[w] || ['。', '！', '，', '？', '、', '……'].includes(w), `the draft "${d.zh}" uses ${w}, which isn't in the word bank`);
  for (const d of DRAFTS.filter(d => d.py)) assert.ok(!d.zh.includes(' ') && d.py.split(' ').length === [...d.zh].length, `the name "${d.zh}": its pinyin (${d.py}) says each character`);
});

// Learning English (Both ways): CHINESE-UI.md, all the game's Chinese for a native speaker to check, and ENGLISH.md, all
// its English, for a native speaker of English (tools/both-ways-sheets.js).
test('CHINESE-UI.md and ENGLISH.md are up to date with the content (if not, run: npm run chinese)', () => {
  const {FILES} = require('../tools/both-ways-sheets');
  for (const [file, make] of Object.entries(FILES)) assert.equal(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n'), make(), `${path.basename(file)} is out of date: run npm run chinese`);
});
