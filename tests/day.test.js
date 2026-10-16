// The book of firsts: your first word, reply, animal, friend and so on, each kept with what it was.
// (Days and sleeping in a nest were tried and taken out; a save from then keeps everything else.)
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));

test('the book of firsts keeps the first of each', () => {
  const game = loadGame({save: {version: 14, started: true}});
  game.run("setSeen('山'); setSeen('花')");
  assert.deepEqual(get(game, 'S.firsts.word'), {w: '山'}, 'the first word, not the second');
  game.run('tasksPage(() => {})');
  assert.match(game.el('#sheet').innerHTML, /First word · <b>山<\/b>/);
  assert.ok(!/Day \d/.test(game.el('#sheet').innerHTML), 'no day numbers');
});

test('there is no nest, sleeping or day count any more', () => {
  const game = loadGame();
  assert.equal(get(game, "Object.values(AREA.legend).some(t => t.action === 'sleep')"), false);
  assert.equal(get(game, "typeof goToSleep"), 'undefined');
  assert.equal(get(game, "'day' in S"), false);
});

test('a version 10 save is converted: the firsts you have already had go in the book', () => {
  const game = loadGame({save: {version: 10, started: true, w: {'山': {lv: 1, due: 0, ok: 0}, '你好': {lv: 4, due: 0, ok: 0, used: 1}},
    friends: ['fox'], met: ['fox'], areas: {1: {elder: 2, hungry: 'done', bought: ['头带'], story: false}}}});
  const s = get(game, 'S');
  assert.equal(s.version, get(game, 'SAVE_VERSION'));
  assert.deepEqual(Object.keys(s.firsts).sort(), ['animal', 'buy', 'friend', 'reply', 'want', 'word'].sort());
});

test('a version 13 save is converted: the day count goes, and everything else stays', () => {
  const game = loadGame({save: {version: 13, started: true, day: 5, lastDay: '2026-10-16', peaches: 9, firsts: {word: {day: 1, w: '石头'}},
    w: {'山': {lv: 2, due: 0, ok: 1}}, wardrobe: {owned: ['头带'], wearing: ['头带']}}});
  const s = get(game, 'S');
  assert.equal(s.version, get(game, 'SAVE_VERSION'));
  assert.ok(!('day' in s) && !('lastDay' in s));
  assert.equal(s.peaches, 9);
  assert.deepEqual(s.w['山'], {lv: 2, due: 0, ok: 1});
  assert.equal(s.firsts.word.w, '石头');
  assert.deepEqual(s.wardrobe, {owned: ['头带'], wearing: ['头带']});
  assert.ok(game.storage.get('xiaohouzi-v2-backup-v13'), 'the old save is kept as a backup');
});
