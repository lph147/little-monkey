// The shop: the 老板 (shop owner) sells a headband, which you need before the cave door test.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const base = loadGame();
const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
const AREA = get(base, 'AREA'), BANK = get(base, 'WORD_BANK'), VERSION = base.run('SAVE_VERSION');
const area = more => ({elder: 2, hungry: 'done', thirsty: 'done', gate: true, story: true, holding: {}, bought: [], done: false, ...more});
const play = (save = {}) => loadGame({save: {version: VERSION, started: true, ...save}});

test('the shop is run by a character, and sells words you can collect, asked for with a sentence', () => {
  assert.ok(AREA.characters.some(c => c.id === AREA.shop.who), 'the shop needs a character to run it');
  assert.ok(AREA.lines[AREA.shop.ask] && AREA.lines[AREA.shop.thanks]);
  for (const i of AREA.shop.items){
    assert.equal(BANK[i.item] && BANK[i.item].area, AREA.number, `${i.item} should be a word you can collect here`);
    assert.ok(i.price > 0 && i.note && i.bought && i.buildPrompt, `${i.item} needs a price, note, bought and buildPrompt`);
    const build = i.build.split(' ');
    assert.ok(build.includes(i.item), `you ask for ${i.item} by saying it`);
    for (const w of [...build, i.extraTile]) assert.ok(BANK[w], `${w} isn't in the word bank`);
    assert.ok(!build.includes(i.extraTile), 'the extra tile should be a wrong one');
  }
});

test('the cave door needs the headband', () => {
  assert.equal(play({areas: {1: area()}, met: ['rabbit', 'fox', 'squirrel', 'goat']}).run('areaDone()'), false);
  assert.equal(play({areas: {1: area({bought: ['头带']})}, met: ['rabbit', 'fox', 'squirrel', 'goat']}).run('areaDone()'), true);
});

test('the 老板 shows ! with something to teach, and ? once you can afford the headband', () => {
  const bubble = save => play(save).run("(AREA.bubbles.boss.find(x => matches(x.if)) || {show: ''}).show");
  const seen = w => ({lv: 1, due: 0, ok: 0});
  assert.equal(bubble({areas: {1: area({elder: 0})}}), '', 'not before you have met the old monkey');
  assert.equal(bubble({areas: {1: area()}}), '!', '老板 to teach');
  assert.equal(bubble({areas: {1: area()}, w: {'老板': seen()}}), '!', '头带 to teach');
  assert.equal(bubble({areas: {1: area()}, w: {'老板': seen(), '头带': seen()}, peaches: 4}), '', 'not enough peaches yet');
  assert.equal(bubble({areas: {1: area()}, w: {'老板': seen(), '头带': seen()}, peaches: 10}), '?', 'you can afford it');
  assert.equal(bubble({areas: {1: area({bought: ['头带']})}, w: {'老板': seen(), '头带': seen()}, peaches: 10}), '', 'already bought');
});

test('your monkey wears the headband once you have bought it', () => {
  assert.equal(play({areas: {1: area()}}).run('wearing()'), false);
  assert.equal(play({areas: {1: area({bought: ['头带']})}}).run('wearing()'), true);
});

test('a version 6 save is converted with nothing bought yet', () => {
  const game = loadGame({save: {version: 6, started: true, xp: 40, areas: {1: {elder: 1, hungry: 'asked', thirsty: 'not asked', gate: false, story: false, holding: {}, done: false}}}});
  const s = get(game, 'S');
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.areas[1].bought, []);
  assert.equal(s.xp, 40);
  assert.ok(game.storage.get('xiaohouzi-v2-backup-v6'), 'a copy of the version 6 save is kept');
});
