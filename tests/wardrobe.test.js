// The wardrobe (Menu, 衣服): clothes you own, put on or taken off. Putting one on, your monkey says so,
// such as 我戴头带, which teaches 戴 the first time and counts as using the words.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
const tick = () => new Promise(r => setImmediate(r));
const AREA = get(loadGame(), 'AREA'), BANK = get(loadGame(), 'WORD_BANK');

test('the wardrobe\'s clothes are words with pictures, each with a sentence that uses it', () => {
  for (const c of AREA.wardrobe){
    assert.ok(BANK[c.item] && BANK[c.item].area === AREA.number && BANK[c.item].pic, `${c.item} should be a word with a picture you can collect here`);
    assert.ok(c.sentence.split(' ').includes(c.item) && c.sentenceEn, `${c.item}'s sentence should use it, with English`);
    for (const w of c.sentence.split(' ')) assert.ok(BANK[w], `${w} isn't in the word bank`);
  }
  const gives = Object.values(AREA.talk).flat().flatMap(p => p.do).filter(s => s.give).map(s => s.give);
  for (const g of gives) assert.ok(AREA.wardrobe.some(c => c.item === g), `${g} is given but isn't in the wardrobe`);
  for (const i of AREA.shop.items.filter(i => i.wear)) assert.ok(AREA.wardrobe.some(c => c.item === i.item), `the shop's ${i.item} is worn, so it needs to be in the wardrobe`);
});

test('the little monkey gives you a flower when it becomes your friend', () => {
  const game = loadGame({save: {version: 12, started: true}});
  game.run("STEPS.give({give: '花'})");
  assert.deepEqual(get(game, 'S.wardrobe'), {owned: ['花'], wearing: []});
  const part = AREA.talk.playful.find(p => p.if && p.if.new === '朋友');
  assert.ok(part.do.some(s => s.give === '花'));
});

test('putting something on: 戴 is taught, your monkey says 我戴花, and it counts as using the words', async () => {
  const game = loadGame({dom: true, save: {version: 12, started: true, w: {'花': {lv: 1, due: 0, ok: 0}}, wardrobe: {owned: ['花'], wearing: []}}});
  game.run("mode = 'play'; globalThis.__said = null; showDialog = async (who, line) => { __said = line.t.join(''); }; wardrobePage(() => {})");
  const sheet = game.el('#sheet');
  sheet.querySelector('.wear[data-w="花"]').click();
  await tick();
  assert.match(sheet.textContent, /戴/, 'a new-word card for 戴');
  game.run('pressA()');
  await tick();
  assert.equal(get(game, '__said'), '我戴花。');
  assert.equal(game.run("wearing('花')"), true);
  assert.equal(get(game, "rec('戴').used"), 1);
});

test('taking something off', () => {
  const game = loadGame({dom: true, save: {version: 12, started: true, wardrobe: {owned: ['头带', '花'], wearing: ['头带']}}});
  game.run('wardrobePage(() => {})');
  game.el('#sheet').querySelector('.wear[data-w="头带"]').click();
  assert.equal(game.run("wearing('头带')"), false);
  assert.match(game.el('#sheet').querySelector('.wear[data-w="头带"]').textContent, /Put on/, 'the page shows it off');
});

test('a version 11 save is converted: the headband you bought is on, and the flower is yours if the little monkey is your friend', () => {
  const s = get(loadGame({save: {version: 11, started: true, w: {'朋友': {lv: 1, due: 0, ok: 0}}, areas: {1: {elder: 2, bought: ['头带']}}}}), 'S');
  assert.deepEqual(s.wardrobe, {owned: ['头带', '花'], wearing: ['头带']});
  const none = get(loadGame({save: {version: 11, started: true}}), 'S');
  assert.deepEqual(none.wardrobe, {owned: [], wearing: []});
});
