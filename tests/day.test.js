// Days, sleeping in a nest and a book of firsts were tried and taken out. Saves from then keep
// everything else.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));

test('there is no nest, sleeping, day count or book of firsts any more', () => {
  const game = loadGame();
  assert.equal(get(game, "Object.values(AREA.legend).some(t => t.action === 'sleep')"), false);
  assert.deepEqual(get(game, "[typeof goToSleep, typeof first, typeof FIRSTS]"), ['undefined', 'undefined', 'undefined']);
  assert.equal(get(game, "'day' in S || 'firsts' in S"), false);
  game.run('tasksPage(() => {})');
  assert.ok(!/firsts/i.test(game.el('#sheet').innerHTML), 'no book of firsts on the 任务 page');
});

test('a version 13 save is converted: the day count and the book of firsts go, and everything else stays', () => {
  const game = loadGame({save: {version: 13, started: true, day: 5, lastDay: '2026-10-16', shells: 9, firsts: {word: {day: 1, w: '石头'}},
    w: {'山': {lv: 2, due: 0, ok: 1}}, wardrobe: {owned: ['头带'], wearing: ['头带']}}});
  const s = get(game, 'S');
  assert.equal(s.version, get(game, 'SAVE_VERSION'));
  assert.ok(!('day' in s) && !('lastDay' in s) && !('firsts' in s));
  assert.equal(s.shells, 9);
  assert.deepEqual(s.w['山'], {lv: 2, due: 0, ok: 1});
  assert.deepEqual(s.wardrobe, {owned: ['头带'], wearing: ['头带']});
  assert.ok(game.storage.get('xiaohouzi-v2-backup-v13'), 'the old save is kept as a backup');
});

test('a version 10 save converts all the way, keeping your words, friends and progress', () => {
  const game = loadGame({save: {version: 10, started: true, w: {'山': {lv: 1, due: 0, ok: 0}}, friends: ['fox'], met: ['fox'],
    areas: {1: {elder: 2, hungry: 'done', bought: ['头带'], story: false}}}});
  const s = get(game, 'S');
  assert.equal(s.version, get(game, 'SAVE_VERSION'));
  assert.ok(!('firsts' in s));
  assert.deepEqual([s.w['山'].lv, s.friends, s.met, s.areas[1].hungry], [1, ['fox'], ['fox'], 'done']);
});
