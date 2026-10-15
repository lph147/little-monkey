// The training ground: practise matching words to pictures. Words due for review come first, and
// only due words earn peaches, so easy words can't be farmed.
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
