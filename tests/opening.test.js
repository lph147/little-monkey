// The opening (brought back 18 October 2026, at the player's request): the story in Chinese, read aloud, as subtitles
// over the bottom of the picture, with pinyin over each word and English underneath, and Skip in the top corner.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

test('each caption is a subtitle: the story in Chinese with pinyin over each word, its English, read aloud; 🔊 reads it again', () => {
  const game = loadGame();
  game.run("globalThis.__said = []; say = t => __said.push(t); playIntro(); showCaption(CAPS[1], false)");
  const html = game.el('#capbox').innerHTML;
  assert.ok(html.includes('data-t="海"><ruby>海<rt class="">hǎi</rt></ruby>'), 'pinyin over each word');
  assert.ok(html.includes('data-t="花果山"><ruby>花果山<rt class="">Huāguǒ Shān</rt></ruby>'));
  assert.ok(html.includes('<div class="cen">In the sea stood a mountain called Flower Fruit Mountain.</div>'), 'the English underneath');
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(__said)')), ['海里有一座山，叫花果山。'], 'read aloud');
  game.run("$('#againBtn').onclick()");
  assert.equal(JSON.parse(game.run('JSON.stringify(__said)')).length, 2, 'and again');
  assert.match(html, /id="nextBtn"/, 'Next beside it');
  assert.equal(game.el('#skipBtn').hidden, false, 'Skip, in the corner');
});

test('with pinyin switched off, the opening hides it too', () => {
  const game = loadGame({save: {version: 25, pinyin: false}});
  game.run('say = () => {}; playIntro(); showCaption(CAPS[0], false)');
  const html = game.el('#capbox').innerHTML;
  assert.ok(html.includes('<ruby>很久<rt class="hid">hěn jiǔ</rt></ruby>'));
});

test('the last caption has Begin, and starting the game hides the caption', () => {
  const game = loadGame();
  game.run('playIntro(); showCaption(CAPS[CAPS.length - 1], true)');
  assert.match(game.el('#capbox').innerHTML, /id="beginBtn"/);
  game.run('startGame()');
  assert.equal(game.el('#capbox').hidden, true);
  assert.equal(game.el('#skipBtn').hidden, true, 'and Skip');
});
