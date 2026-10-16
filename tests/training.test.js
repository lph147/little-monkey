// The training ground: practise matching words to pictures, then build a sentence for the words without
// pictures. Words due for review come first, and only due words earn peaches, so easy words can't be farmed.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const DAY = 86400000, LATER = Date.now() + 5 * DAY;
const DUE = ['石头', '路', '花'];                                   // due for review now
const NOT_DUE = ['山', '草', '树', '桃子', '苹果', '河', '水'];    // not due for days
const save = () => ({version: 5, started: true, peaches: 0, w: {
  ...Object.fromEntries(DUE.map(w => [w, {lv: 2, due: 0, ok: 1}])),
  ...Object.fromEntries(NOT_DUE.map(w => [w, {lv: 3, due: LATER, ok: 2}])),
  '我': {lv: 4, due: 0, ok: 0}   // caught, but has no picture, so it can't be matched
}});
const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));

test('training picks 8 words, every due one first, and never one without a picture', () => {
  for (let i = 0; i < 20; i++){
    const words = get(loadGame({save: save()}), 'trainingWords()');
    assert.equal(words.length, 8);
    for (const w of DUE) assert.ok(words.includes(w), `${w} is due, so it should be practised`);
    assert.ok(!words.includes('我'));
  }
});

test('a due word matched first time earns a peach and comes back later; a missed one comes back now', () => {
  const game = loadGame({save: save()});
  const words = ['石头', '路', '花', '山'];   // three due, one not
  const peaches = game.run(`trained(${JSON.stringify(words)}, new Set(['路']))`);
  assert.equal(peaches, 2, 'one peach each for 石头 and 花; 路 was missed and 山 wasn\'t due');
  const s = get(game, 'S');
  assert.equal(s.peaches, 2);
  assert.ok(s.w['石头'].due > Date.now() + 2 * DAY, '石头 comes back in a few days');
  assert.equal(s.w['路'].ok, 0);
  assert.ok(s.w['路'].due <= Date.now(), '路 comes back straight away');
  assert.ok(s.w['山'].due > LATER, '山 comes back even later');
  assert.deepEqual([s.w['石头'].lv, s.w['路'].lv, s.w['山'].lv], [2, 2, 3], 'the gold squares stay the same');
});

test('training again straight away earns nothing', () => {
  const game = loadGame({save: save()});
  const words = get(game, 'trainingWords()');
  assert.equal(game.run(`trained(${JSON.stringify(words)}, new Set())`), 3);
  const again = get(game, 'trainingWords()');
  assert.equal(game.run(`trained(${JSON.stringify(again)}, new Set())`), 0);
});

test('the practice post stands on the map, and needs 4 words with pictures', () => {
  const game = loadGame();
  const posts = get(game, "[...MAP.join('')].filter(ch => LEGEND[ch].action === 'training').length");
  assert.equal(posts, 1, 'there should be one practice post');
  assert.equal(game.run('TRAINING_MIN'), 4);
  assert.equal(game.run('trainable().length'), 0);
});

// Words without pictures (我 要) are practised by building a sentence you've built before, such as 我要吃桃子.
const buildSave = () => ({version: 9, started: true, peaches: 0, w: {
  ...save().w,
  '我': {lv: 1, due: 0, ok: 0},          // both due now
  '要': {lv: 1, due: 0, ok: 0},
  '吃': {lv: 1, due: LATER, ok: 1}       // so 我要吃桃子 can be built; 喝 isn't caught, so 我要喝水 can't
}});

test('the sentence to build is one you know, with every word caught and a word without a picture in it', () => {
  for (let i = 0; i < 20; i++){
    const b = get(loadGame({save: buildSave()}), 'practiceSentence()');
    assert.ok(['我 要 吃 桃子', '我 要 苹果', '我 要 花'].includes(b.build), `${b.build} has a word you haven't caught`);
  }
  assert.equal(get(loadGame({save: save()}), 'practiceSentence()'), null, 'nothing to build until you know a whole sentence');
});

test('built right first time, 我 and 要 count as right answers and each due one earns a peach; every word counts as used', async () => {
  const game = loadGame({save: buildSave()});
  game.run('tiles = async () => true');   // built right first time
  const round = async () => JSON.parse(await game.run("buildRound({...practiceSentence(), t: toks('我 要 吃 桃子')}, '').then(r => JSON.stringify(r))"));
  assert.deepEqual(await round(), {first: true, peaches: 2}, 'a peach each for 我 and 要, which were due');
  let s = get(game, 'S');
  assert.equal(s.w['我'].lv, 1, 'one sentence is not enough to move 我 up');
  assert.equal(s.w['吃'].used, 1, '吃 was used');
  assert.equal(s.w['吃'].lv, 1, 'a word with a picture moves up by its own questions, not by building');
  assert.equal(s.w['桃子'].lv, 4, '桃子 could already be read, so using it makes it Used');
  assert.deepEqual(await round(), {first: true, peaches: 0}, 'straight away again earns nothing: neither word is due any more');
  s = get(game, 'S');
  assert.equal(s.w['我'].lv, 2, 'a second sentence makes 我 Recognised');
  game.run('tiles = async () => false');   // took more than one try
  assert.deepEqual(await round(), {first: false, peaches: 0});
  assert.equal(get(game, 'S').w['我'].lv, 2, 'no change, and no penalty either');
});

test('word tiles say whether the sentence was built right first time', async () => {
  const game = loadGame({dom: true, save: buildSave()});
  const sheet = game.el('#sheet');
  const tap = w => sheet.querySelectorAll('.bank .tile').find(b => b.querySelector('ruby').firstChild.textContent === w).click();
  const build = async order => {
    game.run("globalThis.__first = null; tiles('', ['我', '要', '苹果'], ['喝'], 'Build it.').then(f => { globalThis.__first = f; })");
    for (const attempt of order){ attempt.forEach(tap); sheet.querySelector('[data-a=check]').click(); }
    await new Promise(r => setImmediate(r));
    return game.run('__first');
  };
  assert.equal(await build([['我', '要', '苹果']]), true);
  assert.equal(await build([['要', '我', '苹果'], ['我', '要', '苹果']]), false, 'a wrong order first');
});

test('words without pictures that are due count on the title screen', () => {
  const game = loadGame({save: buildSave()});
  assert.ok(get(game, 'dueWords()').includes('要'));
  assert.ok(!get(game, 'dueWords()').includes('吃'));
});
