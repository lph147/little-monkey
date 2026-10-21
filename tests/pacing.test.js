// Questions get harder slowly, so a beginner has time to get to know each word: two right answers
// at each step before the next kind of question, and only the kinds of question the area asks.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const word = (game, w) => JSON.parse(game.run(`JSON.stringify(rec(${JSON.stringify(w)}))`));
const caught = (extra = {}) => loadGame({save: {version: 9, started: true, w: {'山': {lv: 1, due: 0, ok: 0}, ...extra}}});

test('a word moves up after two right answers in a row: Caught, Recognised, then Read', () => {
  const game = caught();
  game.run("answer('山', true, 'listen')");
  assert.equal(word(game, '山').lv, 1, 'one right answer is not enough');
  game.run("answer('山', true, 'listen')");
  assert.equal(word(game, '山').lv, 2, 'two make it Recognised');
  game.run("answer('山', true, 'read')");
  assert.equal(word(game, '山').lv, 2);
  game.run("answer('山', true, 'read')");
  assert.equal(word(game, '山').lv, 3, 'two right readings make it Read');
});

test('a wrong answer starts the count again and moves the word down a level', () => {
  const game = caught({'山': {lv: 2, due: 0, ok: 3}});
  game.run("answer('山', true, 'read'); answer('山', false, 'read')");
  assert.equal(word(game, '山').lv, 1);
  game.run("answer('山', true, 'listen')");
  assert.equal(word(game, '山').lv, 1, 'the count started again');
  game.run("answer('山', true, 'listen')");
  assert.equal(word(game, '山').lv, 2);
});

test('using a word in a sentence marks it used; it is Used once you can read it too', () => {
  const game = caught({'山': {lv: 2, due: 0, ok: 0, n: 1}});
  game.run("useWord('山')");
  assert.equal(word(game, '山').lv, 2, 'using it in a sentence does not skip the questions');
  assert.equal(word(game, '山').used, 1);
  game.run("answer('山', true, 'read')");
  assert.equal(word(game, '山').lv, 4, 'reading it right a second time makes it Read, and so Used');
  game.run("rec('水').lv = 3; useWord('水')");
  assert.equal(word(game, '水').lv, 4, 'a word you can read is Used as soon as you use it');
});

test('Flower Fruit Mountain never asks you to pick characters by sound', () => {
  const game = loadGame();
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(AREA.questions)')), ['listen', 'read', 'gap']);
  const kinds = level => {
    const seen = new Set();
    for (let i = 0; i < 200; i++) seen.add(game.run(`rec('山').lv = ${level}; questionType('山')`));
    return [...seen].sort();
  };
  assert.deepEqual(kinds(1), ['listen'], 'Caught: listen');
  assert.deepEqual(kinds(2), ['read'], 'Recognised: read');
  assert.deepEqual(kinds(3), ['listen', 'read'], 'Read: a mix of read and listen, no characters without pictures');
  assert.deepEqual(kinds(4), ['listen', 'read'], 'Used: the same');
  game.run("AREA.questions = ['listen', 'read', 'hear', 'gap']");   // a later area that asks them
  assert.deepEqual(kinds(3), ['hear', 'read']);
  assert.deepEqual(kinds(1), ['listen'], 'but still only for words you can read');
});

test('the area\'s questions list only has kinds the game knows, starting with listen', () => {
  const game = loadGame();
  const kinds = JSON.parse(game.run('JSON.stringify(AREA.questions)'));
  assert.equal(kinds[0], 'listen', 'new words are always asked by sound first');
  for (const k of kinds) assert.ok(['listen', 'read', 'hear', 'gap'].includes(k), `"${k}" isn't a kind of question: use listen, read, hear or gap`);
});

test('when you only hear the word, no two answers sound alike apart from their tones (喝 hē and 河 hé); reading, they can', () => {
  const words = ['河', '喝', '山', '花', '草', '树', '石头'];
  const game = loadGame({save: {version: 9, started: true, w: Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]))}});
  const answers = (w, lv) => { const seen = new Set(); for (let i = 0; i < 300; i++) JSON.parse(game.run(`rec('${w}').lv = ${lv}; JSON.stringify(wordQuestion('${w}').opts)`)).forEach(o => seen.add(o)); return seen; };
  assert.ok(!answers('河', 1).has('喝'), 'listening for 河: never 喝 beside it');
  assert.ok(!answers('喝', 1).has('河'), 'nor the other way round');
  assert.ok(answers('河', 2).has('喝'), 'reading 河, 喝 can be an answer: you see the characters');
  assert.equal(game.run("toneless('喝')"), 'he');
  assert.deepEqual(JSON.parse(game.run("JSON.stringify(soundApart('河', ['喝', '山', '花', '草'], 2))")), ['山', '花']);
});
