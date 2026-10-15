// The Word Scroll: words you hear in sentences are counted, and words you've heard but not
// caught show as shadows of their picture with the count, without giving the word away.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const heardIn = game => JSON.parse(game.run('JSON.stringify(S.heard)'));
const count = (text, part) => text.split(part).length - 1;

test('showing a line counts each word in it as heard, every time', () => {
  const game = loadGame();
  game.run("showDialog('🐒', L.iam)");   // 我 是 猴子 。 你 也 是 猴子 ！
  assert.deepEqual(heardIn(game), {'我': 1, '是': 2, '猴子': 2, '你': 1, '也': 1});
  game.run("showDialog('🐒', L.iam)");
  assert.deepEqual(heardIn(game), {'我': 2, '是': 4, '猴子': 4, '你': 2, '也': 2});
  assert.equal(JSON.parse(game.storage.get('xiaohouzi-v2')).heard['猴子'], 4, 'the counts should be saved');
});

test('opening the Story Scroll counts every word in the story once', () => {
  const game = loadGame();
  const story = JSON.parse(game.run('JSON.stringify(STORY)'));
  game.run('storyScroll()');
  const want = {};
  for (const s of story) for (const w of s.t) if (!'。，！？'.includes(w)) want[w] = (want[w] || 0) + 1;
  assert.deepEqual(heardIn(game), want);
});

test('the Word Scroll shows caught words, shadows of heard words, and ？ for the rest', () => {
  const game = loadGame({save: {version: 5, started: true, w: {'石头': {lv: 1, due: 0, ok: 0}}, heard: {'猴子': 3, '石头': 2, '有': 9}}});
  game.run('openScroll()');
  const html = game.el('#sheet').innerHTML, total = game.run('ORDER.length');
  assert.match(html, /<button class="card" data-w="石头"><div class="c">石头<\/div><div class="p">shítou<\/div>/, 'a caught word shows its characters and pinyin');
  assert.match(html, /<div class="card heard"[^>]*><div class="c sil" aria-hidden="true">🐒<\/div><div class="p">heard 3×<\/div>/, 'a heard word shows its shadow and count');
  assert.ok(!html.includes('猴子') && !html.includes('hóuzi'), 'a heard word is not given away');
  assert.ok(!html.includes('🐟'), 'a word you have not heard shows no picture');
  assert.equal(count(html, 'class="card unseen"'), total - 2, 'every other word shows ？');
});
