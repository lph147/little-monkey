// The game starts without errors and shows the title screen.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

test('a new player sees the title screen with three empty games, Game 1 chosen', () => {
  const game = loadGame({dom: true});
  game.runFrame();
  assert.equal(game.el('#titlecard').hidden, false);
  const slots = game.el('#titleButtons').querySelectorAll('.slot');
  assert.equal(slots.length, 3);
  assert.ok(slots.every(s => s.classList.contains('empty')), 'all empty');
  assert.ok(slots[0].classList.contains('primary'), 'A chooses Game 1');
  assert.equal(game.el('#aLabel').textContent, 'Choose');
  assert.match(game.el('#titleText').innerHTML, /can’t speak/, 'no Chinese voice here: the warning, instead of turn your sound on');
  game.run("globalThis.speechSynthesis = {getVoices: () => [{lang: 'zh-CN'}]}; titleText()");
  assert.match(game.el('#titleText').innerHTML, /Turn your sound on/, 'a first game: turn your sound on');
  game.run('pressA()');
  assert.match(game.el('#sheet').innerHTML, /id="newBtn">New game</, 'an empty game: New game');
  assert.match(game.el('#sheet').innerHTML, /Load from a file/);
  assert.match(game.run('statsHTML()'), /0\/45 words.*0 friends.*🐚 0/);
});

test('a returning player sees their game, and its card has Continue, with their shells and words', () => {
  const game = loadGame({dom: true, save: {started: true, shells: 5, w: {'石头': {lv: 1, due: 0, ok: 0}}}});
  game.runFrame();
  assert.match(game.el('#titleButtons').innerHTML, /class="slot primary" data-slot="1">.*Game 1.*1 word · 0 friends/);
  game.run('pressA()');
  const card = game.el('#sheet').innerHTML;
  assert.match(card, /id="contBtn">Continue</);
  assert.match(card, /5 <img class="money"/, 'its shells');
  assert.match(card, /Copy to a file/); assert.match(card, /Delete/);
  game.el('#sheet').querySelector('#contBtn').click();
  assert.equal(game.run('mode'), 'play', 'Continue plays on');
  assert.match(game.run('statsHTML()'), /1\/45 words.*🐚 5/);
});
