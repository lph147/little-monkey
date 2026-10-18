// The opening (brought back 18 October 2026, at the player's request): the story in Chinese, with pinyin and English,
// read aloud, in a panel beside the picture.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

test('each caption shows the story in Chinese, with its pinyin and English, read aloud; 🔊 reads it again', () => {
  const game = loadGame();
  game.run("globalThis.__said = []; say = t => __said.push(t); playIntro(); showCaption(CAPS[1], false)");
  const html = game.el('#capbox').innerHTML;
  assert.ok(html.includes('<div class="cpy">Hǎi lǐ yǒu yí zuò shān, jiào Huāguǒ Shān.</div><div class="czh">海里有一座山，叫花果山。</div><div class="cen">In the sea stood a mountain called Flower Fruit Mountain.</div>'),
    'the pinyin, the Chinese and the English');
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(__said)')), ['海里有一座山，叫花果山。'], 'read aloud');
  game.run("$('#againBtn').onclick()");
  assert.equal(JSON.parse(game.run('JSON.stringify(__said)')).length, 2, 'and again');
  assert.equal(game.el('#capbox').hidden, false);
  assert.match(html, /id="nextBtn"/, 'its buttons are in the caption box too');
});

test('with pinyin switched off, the opening hides it too', () => {
  const game = loadGame({save: {version: 25, pinyin: false}});
  game.run('say = () => {}; playIntro(); showCaption(CAPS[0], false)');
  const html = game.el('#capbox').innerHTML;
  assert.doesNotMatch(html, /class="cpy"/);
  assert.match(html, /class="czh">很久很久以前……/);
});

test('the last caption has Begin, and starting the game hides the caption', () => {
  const game = loadGame();
  game.run('playIntro(); showCaption(CAPS[CAPS.length - 1], true)');
  assert.match(game.el('#capbox').innerHTML, /id="beginBtn"/);
  game.run('startGame()');
  assert.equal(game.el('#capbox').hidden, true);
});
