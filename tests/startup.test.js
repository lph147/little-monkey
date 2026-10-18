// The game starts without errors and shows the title screen.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

test('a new player sees the title screen: New game (chosen) and Save files, with no game to continue', () => {
  const game = loadGame({dom: true});
  game.runFrame();
  assert.equal(game.el('#titlecard').hidden, false);
  const buttons = game.el('#titleButtons').querySelectorAll('.btn');
  assert.deepEqual(buttons.map(b => b.id), ['newBtn', 'filesBtn']);
  assert.ok(buttons[0].classList.contains('sel'), 'A presses New game');
  assert.equal(game.el('#aLabel').textContent, 'New game');
  assert.match(game.el('#titleText').innerHTML, /can’t speak/, 'no Chinese voice here: the warning, instead of turn your sound on');
  game.run("globalThis.speechSynthesis = {getVoices: () => [{lang: 'zh-CN'}]}; titleText()");
  assert.match(game.el('#titleText').innerHTML, /Turn your sound on/, 'a first game: turn your sound on');
  game.run("moveTitle('right'); pressA()");
  assert.match(game.el('#sheet').textContent, /Save files/, 'Save files lists your games');
  assert.equal(game.el('#sheet').querySelectorAll('.slotrow.empty').length, 3, 'all empty');
  game.el('#sheet').querySelector('.slotrow').click();
  assert.match(game.el('#sheet').innerHTML, /id="newBtn">New game</, 'an empty game: New game');
  assert.match(game.el('#sheet').innerHTML, /Load from a file/);
  assert.match(game.run('statsHTML()'), /0\/45 words.*0 friends.*🐚 0/);
});

test('a returning player sees Continue, with their game, and A plays on', () => {
  const game = loadGame({dom: true, save: {started: true, shells: 5, w: {'石头': {lv: 1, due: 0, ok: 0}}}});
  game.runFrame();
  assert.match(game.el('#titleButtons').innerHTML, /id="contBtn".*Continue.*Game 1 · 1 word/);
  assert.ok(game.el('#titleButtons').querySelector('#contBtn').classList.contains('sel'), 'Continue is chosen');
  game.run('pressA()');
  assert.equal(game.run('mode'), 'play', 'Continue plays on');
  assert.match(game.run('statsHTML()'), /1\/45 words.*🐚 5/);
  game.run('toTitle(); filesCard(); slotCard(1)');
  const card = game.el('#sheet').innerHTML;
  assert.match(card, /id="contBtn">Continue</, 'its card in Save files: Continue');
  assert.match(card, /5 <img class="money"/, 'its shells');
  assert.match(card, /Copy to a file/); assert.match(card, /Delete/);
});
