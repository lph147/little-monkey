// The shop: the 老板 (shop owner) sells a headband, which you need before the cave door test.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const base = loadGame();
const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
const AREA = get(base, 'AREA'), BANK = get(base, 'WORD_BANK'), VERSION = base.run('SAVE_VERSION');
const area = more => ({elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, story: true, holding: {}, bought: [], done: false, ...more});
const play = (save = {}) => loadGame({save: {version: VERSION, started: true, ...save}});

test('the shop is run by a character, and sells words you can collect, asked for with a sentence', () => {
  assert.ok(AREA.characters.some(c => c.id === AREA.shop.who), 'the shop needs a character to run it');
  assert.ok(AREA.lines[AREA.shop.ask] && AREA.lines[AREA.shop.thanks]);
  for (const i of AREA.shop.items){
    assert.equal(BANK[i.item] && BANK[i.item].area, AREA.number, `${i.item} should be a word you can collect here`);
    assert.ok(i.price > 0 && i.note && i.bought && i.sentenceEn, `${i.item} needs a price, note, bought and sentenceEn`);
    const sentence = i.sentence.split(' ');
    assert.ok(sentence.includes(i.item), `you ask for ${i.item} by saying it`);
    for (const w of sentence) assert.ok(BANK[w], `${w} isn't in the word bank`);
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

test('buying the headband puts it on, and it stays in your wardrobe', async () => {
  const game = play({areas: {1: area()}, peaches: 10, w: {'头带': {lv: 1, due: 0, ok: 0}}});
  assert.equal(game.run("wearing('头带')"), false);
  assert.equal(await buyIt(game, 'AREA.shop.items.find(i => i.item === "头带")'), true);
  assert.equal(game.run("wearing('头带')"), true);
  assert.deepEqual(get(game, 'S.wardrobe.owned'), ['头带']);
  const older = loadGame({save: {version: 11, started: true, areas: {1: area({bought: ['头带']})}}});
  assert.equal(older.run("wearing('头带')"), true, 'a save from before the wardrobe still wears it');
});

test('a version 6 save is converted with nothing bought yet', () => {
  const game = loadGame({save: {version: 6, started: true, xp: 40, areas: {1: {elder: 1, hungry: 'asked', thirsty: 'not asked', gate: false, story: false, holding: {}, done: false}}}});
  const s = get(game, 'S');
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.areas[1].bought, []);
  assert.equal(s.xp, 40);
  assert.ok(game.storage.get('xiaohouzi-v2-backup-v6'), 'a copy of the version 6 save is kept');
});

// The 老板 also sells 苹果: you can buy them again and again (up to 3 in your bag), and eat one in an
// animal encounter to take away a wrong answer.
const APPLE = () => 'AREA.shop.items.find(i => i.item === "苹果")';
const buyIt = async (game, what) => {   // buy something, answering every card as a player would
  game.run('showDialog = showNotice = infoBox = replyWith = async () => {}; toast = () => {}; gapQ = async () => true;');
  return game.run(`buy(${what}, '')`);
};

test('the 老板 sells 苹果 as food, and keeps selling it after the headband', () => {
  const apple = get(base, APPLE());
  assert.ok(apple && apple.eat && apple.carry === 3 && apple.price === 2, '苹果 should be food that costs 2 and you can carry 3 of');
  assert.equal(apple.sentence, '我 要 苹果');
  const game = play({areas: {1: area({bought: ['头带']})}});
  assert.deepEqual(get(game, 'forSale().map(i => i.item)'), ['苹果']);
});

test('buying a 苹果 costs 2 peaches, puts it in your bag, and earns no XP', async () => {
  const game = play({areas: {1: area()}, peaches: 5, xp: 30, w: {'苹果': {lv: 1, due: 0, ok: 0}}});
  assert.equal(await buyIt(game, APPLE()), true);
  const s = get(game, 'S');
  assert.equal(s.peaches, 3);
  assert.deepEqual(s.bag, {'苹果': 1});
  assert.equal(s.xp, 30);
  assert.deepEqual(s.areas[1].bought, [], 'food isn\'t "bought" for good, so it stays for sale');
  assert.equal(s.w['苹果'].used, 1, 'asking for it with 我要苹果 counts as using the word');
  assert.equal(s.w['苹果'].lv, 1, 'it reaches Used once you can read it too');
});

test('you can carry 3 苹果, and need 2 peaches for each', async () => {
  const full = play({areas: {1: area()}, peaches: 9, bag: {'苹果': 3}});
  assert.equal(await buyIt(full, APPLE()), false);
  assert.equal(get(full, 'S').peaches, 9);
  const poor = play({areas: {1: area()}, peaches: 1});
  assert.equal(await buyIt(poor, APPLE()), false);
  assert.deepEqual(get(poor, 'S').bag, {});
});

test('eating takes away one wrong answer, never the right one', () => {
  const game = play({bag: {'苹果': 2}});
  assert.equal(get(game, 'snack()').item, '苹果');
  assert.equal(get(play({bag: {}}), 'snack() || null'), null, 'nothing to eat with an empty bag');
  for (let i = 0; i < 50; i++){
    const gone = game.run('wrongToEat(3, 1)');
    assert.ok(gone === 0 || gone === 2, `took away option ${gone}`);
  }
});

test('a version 7 save is converted with an empty bag', () => {
  const game = loadGame({save: {version: 7, started: true, peaches: 4, areas: {1: area({bought: ['头带']})}}});
  const s = get(game, 'S');
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.bag, {});
  assert.deepEqual(s.areas[1].bought, ['头带']);
  assert.ok(game.storage.get('xiaohouzi-v2-backup-v7'), 'a copy of the version 7 save is kept');
});

test('the shop shows a card for each thing: its picture, Chinese, pinyin, English and price', async () => {
  const game = loadGame({dom: true, save: {version: VERSION, started: true, peaches: 5, areas: {1: area()}, w: {'老板': {lv: 1, due: 0, ok: 0}}}});
  game.run("mode = 'play'; showDialog = async () => {}; shop(speaker('boss'))");
  await new Promise(r => setImmediate(r));
  const sheet = game.el('#sheet'), cards = sheet.querySelectorAll('.shopitem');
  assert.equal(cards.length, get(game, 'forSale().length'));
  const apple = cards.find(c => c.querySelector('.szh').textContent === '苹果');
  assert.ok(apple.querySelector('.spic .pix'), 'its pixel picture');
  assert.equal(apple.querySelector('.spy').textContent, 'píngguǒ');
  assert.equal(apple.querySelector('.sen').textContent, 'apple', 'and its English');
  assert.match(apple.querySelector('.sprice').innerHTML, /<img class="pch"[^>]*> 2/, 'its price, with the pixel peach');
  assert.ok(!sheet.innerHTML.includes('🍑'), 'no peach emoji anywhere on the card');
});

test('the peach money symbol is the pixel peach, in cards and messages', () => {
  const game = loadGame({dom: true});
  game.run("openCard('<p>+3 🍑</p>')");
  assert.match(game.el('#sheet').innerHTML, /<p>\+3 <img class="pch"/);
});
