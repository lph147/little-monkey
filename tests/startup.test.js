// The game starts without errors and shows the title screen.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

test('a new player sees the title screen with a Start button', () => {
  const game = loadGame();
  game.runFrame();
  assert.equal(game.el('#titlecard').hidden, false);
  assert.match(game.el('#titleButtons').innerHTML, />Start</);
  assert.equal(game.el('#aLabel').textContent, 'Start');
  assert.match(game.run('statsHTML()'), /Level 1 · 0\/100 XP.*🐚 0.*0\/40 words/);
});

test('a returning player sees Continue, with their shells and words in the menu', () => {
  const game = loadGame({save: {started: true, shells: 5, w: {'石头': {lv: 1, due: 0, ok: 0}}}});
  game.runFrame();
  assert.match(game.el('#titleButtons').innerHTML, />Continue</);
  assert.equal(game.el('#aLabel').textContent, 'Continue');
  assert.match(game.run('statsHTML()'), /🐚 5.*1\/40 words/);
});
