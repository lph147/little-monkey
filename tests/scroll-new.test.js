// New in your Word Scroll (decided 9 November 2026, after playing it: since 8 November the MENU button glowed after every
// new word, and the menu then showed nothing new). A word you catch is new till you've seen the page it's on in your
// Word Scroll: the menu's 词 tile says how many words are new, and the scroll opens on the page with the newest, each new
// word tagged, with a gold dot on each other tab that has some (js/scrolls.js).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const VERSION = loadGame().run('SAVE_VERSION');
const know = ws => Object.fromEntries(ws.map(w => [w, {lv: 1, ok: 0}]));
function game(more = {}){   // the meadow, with a few words and the old monkey's scroll
  const g = loadGame({dom: true, save: {version: VERSION, started: true, w: know(['山', '树', '花', '石头']), scroll: {has: true, sealed: []},
    pos: {place: 'meadow', x: 15, y: 19, dir: 'down'}, areas: {1: {elder: 2, meadowCheck: 1}}, ...more}});
  g.run("mode = 'play'; save = () => {}");
  return g;
}
const text = el => el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
const newOnTile = g => text(g.el('#sheet').querySelector('.mtile[data-m=words] .mnew'));

test('a word you catch is new in your Word Scroll: the menu’s 词 tile says how many, and nothing glows', () => {
  const g = game();
  g.run('openMenu()');
  assert.equal(newOnTile(g), null, 'nothing new yet');
  g.run("setSeen('兔子'); setSeen('苹果'); setSeen('兔子')");
  assert.deepEqual(get(g, 'S.scrollNew'), ['兔子', '苹果'], 'each once, the newest last');
  g.run('openMenu()');
  assert.equal(newOnTile(g), '2 new');
  assert.equal(g.run('typeof scrollGlow'), 'undefined', 'no glow on MENU (the test page’s buttons keep no classes, so it’s checked by its code being gone)');
});

test('the scroll opens on the page with the newest word, each new one tagged, a gold dot on the other tabs with some; seen, they’re new no more', () => {
  const g = game();
  g.run("setSeen('苹果'); setSeen('兔子')");   // (the newest: the rabbit)
  g.run('openScroll(() => openMenu())');
  const sheet = g.el('#sheet');
  assert.equal(get(g, 'scrollTab'), 'animals', 'the page with the newest word');
  assert.equal(text(sheet.querySelector('.card.new[data-w="兔子"] .newtag')), 'new', 'tagged new');
  assert.equal(sheet.querySelector('.card[data-w="羊"].new'), null, 'nothing else is');
  assert.ok(sheet.querySelector('.tab[data-tab="food"] .newdot'), 'the food tab has a new word: a gold dot');
  assert.equal(sheet.querySelector('.tab[data-tab="animals"] .newdot'), null, 'not the tab you’re on');
  assert.deepEqual(get(g, 'S.scrollNew'), ['苹果'], 'the rabbit, seen');
  // its page and back: still on the same tab, though another has a new word
  sheet.querySelector('.card[data-w="兔子"]').click();
  sheet.querySelector('[data-a=ok]').click();
  assert.equal(get(g, 'scrollTab'), 'animals', 'back on its page');
  assert.equal(sheet.querySelector('.card[data-w="兔子"].new'), null, 'its tag gone, seen');
  sheet.querySelector('[data-a=ok]').click();   // (back to the menu)
  assert.equal(newOnTile(g), '1 new');
  g.run('openScroll(() => openMenu())');
  assert.equal(get(g, 'scrollTab'), 'food', 'the next time, the page with the apple');
  assert.ok(sheet.querySelector('.card.new[data-w="苹果"] .newtag'));
  sheet.querySelector('[data-a=ok]').click();
  assert.equal(newOnTile(g), null, 'nothing new now');
  assert.deepEqual(get(g, 'S.scrollNew'), []);
});

test('Today’s page shows the new ones too, and seeing them there counts', () => {
  const g = game();
  g.run("setSeen('苹果'); setSeen('兔子')");
  g.run("openScroll(() => closeCard(), 0, 'today')");
  const sheet = g.el('#sheet');
  assert.ok(sheet.querySelector('.card.new[data-w="苹果"]') && sheet.querySelector('.card.new[data-w="兔子"]'), 'both tagged, among today’s words');
  assert.deepEqual(get(g, 'S.scrollNew'), [], 'seen');
});

test('the old monkey’s scroll: the words it shows you coming back are new no more', async () => {
  const g = game({scroll: {has: false, sealed: []}, w: know(['山', '树'])});
  g.run("S.scrollNew = ['山', '树', '你好']; infoBox = async () => {}");
  await g.run("scrollGiven('elder')");
  assert.deepEqual(get(g, 'S.scrollNew'), ['你好'], 'the mountain and the tree came back on its card; 你好, a phrase with no picture, wasn’t on it');
});
