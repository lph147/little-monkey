// Helpful messages: a warning on the title screen if there's no Chinese voice, and a reminder
// when words are due for review (on the title screen, and a ! on the practice post).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const LATER = Date.now() + 5 * 86400000;
const title = game => { game.run('titleText()'); return game.el('#titleText').innerHTML; };
const gameCard = game => { game.run('slotCard(SLOT)'); return game.el('#sheet').innerHTML; };   // the game's card, chosen on the title screen

test('the title screen warns when the device has no Chinese voice', () => {
  const game = loadGame();
  assert.match(title(game), /can’t speak/, 'no speech at all');
  game.run("globalThis.speechSynthesis = {getVoices: () => [{lang: 'en-GB'}, {lang: 'fr-FR'}]}");
  assert.match(title(game), /no Chinese voice/, 'voices, but none Chinese');
  assert.ok(title(game).length < 400, 'the warning is short, so the controls stay on screen');
  assert.match(title(game), /id="voiceHelp"/, 'with a button for how to fix it');
  game.run("globalThis.speechSynthesis = {getVoices: () => [{lang: 'en-GB'}, {lang: 'zh-CN'}]}");
  assert.doesNotMatch(title(game), /class="small warn"/, 'a Chinese voice: no warning');
  game.run("globalThis.speechSynthesis = {getVoices: () => []}");
  assert.doesNotMatch(title(game), /class="small warn"/, 'voices not loaded yet: no warning');
});

test('a returning player is told how many words are due, on their game’s card', () => {
  const w = {'山': {lv: 1, due: 0, ok: 0}, '花': {lv: 2, due: 0, ok: 1}, '草': {lv: 1, due: LATER, ok: 1}, '我': {lv: 4, due: 0, ok: 0}};
  const game = loadGame({save: {started: true, w}});
  assert.match(gameCard(game), /3 words are due for review/, '山, 花 and 我 (我 has no picture, so it\'s practised by listening)');
  const none = loadGame({save: {started: true, w: {'草': {lv: 1, due: LATER, ok: 1}}}});
  assert.doesNotMatch(gameCard(none), /due for review/);
});

test('the practice post shows a ! when there are due words to practise', () => {
  const words = due => Object.fromEntries(['山', '花', '草', '树'].map(x => [x, {lv: 1, due: due ? 0 : LATER, ok: 0}]));
  assert.equal(loadGame({save: {started: true, w: words(true)}}).run('trainingCalls()'), true);
  assert.equal(loadGame({save: {started: true, w: words(false)}}).run('trainingCalls()'), false, 'nothing due');
  assert.equal(loadGame({save: {started: true, w: {'山': {lv: 1, due: 0, ok: 0}}}}).run('trainingCalls()'), false, 'not enough words to train yet');
});
