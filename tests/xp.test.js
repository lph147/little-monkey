// XP and levels: earned only by learning, and shown in the header.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const LATER = Date.now() + 5 * 86400000;
const game = save => loadGame({save: {version: 6, started: true, ...save}});
const xp = g => g.run('S.xp');

test('catching a new word gives 10 XP, once', () => {
  const g = game();
  g.run("setSeen('山')");
  assert.equal(xp(g), 10);
  g.run("setSeen('山')");
  assert.equal(xp(g), 10, 'seeing it again gives nothing');
});

test('a right answer gives 5 XP if the word was due, 2 if not, and a wrong one nothing', () => {
  const g = game({w: {'山': {lv: 1, due: 0, ok: 0}, '花': {lv: 1, due: LATER, ok: 1}}});
  g.run("answer('山', true, 'listen')");
  assert.equal(xp(g), 5);
  g.run("answer('花', true, 'listen')");
  assert.equal(xp(g), 7);
  g.run("answer('花', false, 'listen')");
  assert.equal(xp(g), 7);
});

test('training gives XP for each word right first time', () => {
  const g = game({w: {'山': {lv: 1, due: 0, ok: 0}, '花': {lv: 1, due: LATER, ok: 1}, '草': {lv: 1, due: 0, ok: 0}}});
  g.run("trained(['山', '花', '草'], new Set(['草']))");
  assert.equal(xp(g), 5 + 2);
});

test('every 100 XP is a new level, shown in the menu and your tasks', () => {
  const g = game({xp: 250});
  assert.deepEqual([0, 99, 100, 250].map(n => g.run(`level(${n})`)), [1, 1, 2, 3]);
  g.runFrame();
  assert.match(g.run('statsHTML()'), /Level 3 · 50\/100 XP/);
});

test('an older save gets XP for what you have already done', () => {
  const w = {'石头': {lv: 2, due: 0, ok: 1}, '路': {lv: 1, due: 0, ok: 0}, '你好': {lv: 0, due: 0, ok: 0}};
  const g = loadGame({save: {version: 5, started: true, w, areas: {1: {elder: 2, hungry: 'done', thirsty: 'asked', gate: false, story: true, holding: {}, done: false}}}});
  assert.equal(g.run('S.version'), g.run('SAVE_VERSION'));
  assert.equal(xp(g), 2 * 10 + 20 + 20, 'two words caught, one task done, the story read');
});
