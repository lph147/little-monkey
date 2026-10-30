// Sounds alike (decided 30 October 2026: a word spelt the same in pinyin as one you know, such as 喝 hē after 河 hé, is
// confusing): the first time, after its card (and How it's made, if it has one), Sounds like ▸ shows the two side by side,
// each with its picture, characters, pinyin, a drawing of how its tone moves and its name, and its English, and Hear both
// says one, then the other. Seen again, in the Word Scroll, from the same place as How it's made.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knowing = words => Object.fromEntries(words.map(hz => [hz, {lv: 1, due: 0, ok: 0}]));
const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const text = el => el.textContent.replace(/\s+/g, ' ').trim();
function card(words, w){
  const g = loadGame({dom: true, save: {version: 32, started: true, w: knowing(words)}});
  g.run("globalThis.__said = []; say = (w, end) => { __said.push(w); if (end) end(); }; globalThis.__done = false");
  g.run(`showNotice('${w}', {quiet: true}).then(() => { __done = true; })`);
  return {g, sheet: g.el('#sheet')};
}
const click = (s, sel) => s.querySelector(sel).click();

test('which words sound alike: only one you know, spelt the same apart from its tone marks', () => {
  const g = loadGame({save: {version: 32, started: true, w: knowing(['河', '路', '山'])}});
  assert.deepEqual(get(g, "['喝', '鹿', '山', '水'].map(soundsLike)"), ['河', '路', null, null]);
  const none = loadGame({save: {version: 32, started: true, w: knowing(['山'])}});
  assert.equal(get(none, "soundsLike('喝')"), null, 'never a word you haven’t caught');
});

test('喝 after 河: How it’s made ▸, then Sounds like ▸, then the two side by side with their tones', async () => {
  const {g, sheet} = card(['山', '河'], '喝');
  assert.equal(text(sheet.querySelector('.primary')), 'How it’s made ▸');
  click(sheet, '[data-a=made]');
  assert.equal(text(sheet.querySelector('.primary')), 'Sounds like ▸', 'How it’s made goes on to it');
  click(sheet, '.primary');
  assert.equal(text(sheet.querySelector('.label')), 'Same sound, different tone');
  const sides = sheet.querySelectorAll('.sa-side').map(text);
  assert.match(sides[0], /河.*hé.*river.*2nd tone.*rising/, 'the word you knew on the left');
  assert.match(sides[1], /喝.*hē.*to drink.*1st tone.*high and flat/, 'the new one on the right');
  assert.equal(text(sheet.querySelector('.sa-note')), 'Listen to the tone: hé goes up, hē stays high.');
  click(sheet, '[data-a=both]');
  g.flush();
  assert.deepEqual(get(g, '__said'), ['河', '喝'], 'Hear both: one, then the other');
  click(sheet, '.sa-side[data-w="河"]');
  assert.deepEqual(get(g, '__said').slice(-1), ['河'], 'tap a side to hear just it');
  click(sheet, '[data-a=back]');
  assert.equal(text(sheet.querySelector('.primary')), 'Sounds like ▸', 'Back: How it’s made again');
  click(sheet, '.primary'); click(sheet, '[data-a=ok]');
  await new Promise(r => setImmediate(r));
  assert.deepEqual(get(g, '[__done, lvl("喝")]'), [true, 1], 'Got it: caught');
});

test('鹿 after 路: straight to Sounds like ▸, and they sound the same', () => {
  const {sheet} = card(['山', '路'], '鹿');
  assert.equal(text(sheet.querySelector('.primary')), 'Sounds like ▸');
  click(sheet, '.primary');
  assert.equal(text(sheet.querySelector('.label')), 'Sounds the same');
  assert.match(text(sheet.querySelector('.sa-note')), /Exactly the same sound/);
  const {sheet: plain} = card(['山'], '鹿');
  assert.equal(text(plain.querySelector('.primary')), 'Got it', 'with nothing like it known, as before');
});

test('in the Word Scroll: English, then Sounds like, for either word, and Back to the word’s page', () => {
  const g = loadGame({dom: true, save: {version: 32, started: true, w: knowing(['山', '河', '喝'])}});
  g.run("say = () => {}; wordPage('河', () => {})");
  const sheet = g.el('#sheet');
  click(sheet, '[data-a=en]');
  assert.equal(text(sheet.querySelector('[data-a=made]')), 'Sounds like', 'English becomes Sounds like (河 has no How it’s made)');
  click(sheet, '[data-a=made]');
  assert.deepEqual(sheet.querySelectorAll('.sa-side').map(b => b.dataset.w), ['喝', '河']);
  assert.equal(text(sheet.querySelector('.primary')), '◂ Back');
  click(sheet, '.primary');
  assert.ok(sheet.querySelector('.word .big'), 'back on the word’s page');
  g.run("wordPage('喝', () => {})");
  click(sheet, '[data-a=en]'); click(sheet, '[data-a=made]');
  assert.equal(text(sheet.querySelector('.primary')), 'Sounds like ▸', '喝: How it’s made, then Sounds like');
});
