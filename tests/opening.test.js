// The opening is told in English, so a beginner can follow it. Some captions show one word you'll meet on
// the mountain, in Chinese, pinyin and English, said aloud. The caption sits over the sky in the picture.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

test('a caption with a word shows its English, and the word in Chinese, pinyin and English, said aloud', () => {
  const game = loadGame();
  game.run("globalThis.__said = []; say = t => __said.push(t); playIntro(); showCaption(CAPS[1], false)");
  const html = game.el('#capbox').innerHTML;
  assert.match(html, /there was a mountain/);
  assert.match(html, /<span class="wzh">山<\/span><span class="wpy">shān<\/span><span class="wen">mountain<\/span>/);
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(__said)')), ['山'], 'only the word is said');
  assert.equal(game.el('#capbox').hidden, false);
  assert.match(game.el('#capbox').innerHTML, /id="nextBtn"/, 'its buttons are in the caption box too');
});

test('a caption without a word is just English, and says nothing', () => {
  const game = loadGame();
  game.run("globalThis.__said = []; say = t => __said.push(t); playIntro(); showCaption(CAPS[0], false)");
  assert.ok(!/wchip/.test(game.el('#capbox').innerHTML));
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(__said)')), []);
});

test('the last caption has Begin, and starting the game hides the caption', () => {
  const game = loadGame();
  game.run('playIntro(); showCaption(CAPS[CAPS.length - 1], true)');
  assert.match(game.el('#capbox').innerHTML, /id="beginBtn"/);
  game.run('startGame()');
  assert.equal(game.el('#capbox').hidden, true);
});
