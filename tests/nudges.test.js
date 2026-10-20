// Helpful messages: a warning on the title screen if there's no Chinese voice, and a reminder
// when words need practice: new ones, or ones you've missed since (on a game's card, and a ! on the practice post).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

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

test('a returning player is told how many words need practice, on their game’s card', () => {
  const w = {'山': {lv: 1, ok: 0}, '花': {lv: 2, ok: 1}, '草': {lv: 1, ok: 2}, '我': {lv: 4, ok: 0}};
  const game = loadGame({save: {version: 29, started: true, w}});
  assert.match(gameCard(game), /3 words need practice/, '山, 花 and 我 (我 has no picture, so it\'s practised by filling a gap); 草 has been right twice in a row');
  const none = loadGame({save: {version: 29, started: true, w: {'草': {lv: 1, ok: 2}}}});
  assert.doesNotMatch(gameCard(none), /need practice/);
});

test('the practice post shows a ! when words need practice', () => {
  const words = ok => Object.fromEntries(['山', '花', '草', '树'].map(x => [x, {lv: 1, ok}]));
  assert.equal(loadGame({save: {version: 29, started: true, w: words(0)}}).run('trainingCalls()'), true, 'new words');
  assert.equal(loadGame({save: {version: 29, started: true, w: words(1)}}).run('trainingCalls()'), true, 'right only once so far');
  assert.equal(loadGame({save: {version: 29, started: true, w: words(2)}}).run('trainingCalls()'), false, 'all right twice in a row: nothing needs practice');
  assert.equal(loadGame({save: {version: 29, started: true, w: {'山': {lv: 1, ok: 0}}}}).run('trainingCalls()'), false, 'not enough words to train yet');
});
