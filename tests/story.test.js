// The story questions at the waterfall follow the quiz rules in CLAUDE.md: every picture is a word
// you've caught (the wrong answers too), and the right answer is always there.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

// The questions a player who has caught these words is asked.
function questionsFor(words){
  const w = Object.fromEntries(words.map(x => [x, {lv:1, due:0, ok:0}]));
  const game = loadGame({save: {started: true, w}});
  return JSON.parse(game.run('JSON.stringify(storyQuestions())'));
}
const AREA = JSON.parse(loadGame().run('JSON.stringify(AREA)'));
const BANK = JSON.parse(loadGame().run('JSON.stringify(WORD_BANK)'));
const collectible = Object.keys(BANK).filter(w => BANK[w].area === AREA.number);
// The fewest words you can have at the waterfall: born from the stone, hello from the old monkey,
// then both monkeys' requests, which open the way up.
const FEWEST = ['石头', '你好', '吃', '桃子', '要', '我', '喝', '水', '瀑布'];

test('with the fewest words, only questions whose answer you have caught are asked', () => {
  const qs = questionsFor(FEWEST);
  assert.ok(qs.length >= 1, 'there should be at least one story question');
  for (const q of qs){
    assert.ok(q.options.length >= 2, `${q.t.join('')} needs at least one wrong answer you've caught`);
    for (const w of q.options) assert.ok(FEWEST.includes(w), `${q.t.join('')} shows ${w}, which you haven't caught`);
  }
});

test('with every word, each question has the answer and two wrong answers, the first listed', () => {
  const qs = questionsFor(collectible);
  assert.equal(qs.length, AREA.storyQuestions.length);
  qs.forEach((q, i) => {
    const c = AREA.storyQuestions[i], wrong = c.options.filter(w => w !== c.answer).slice(0, 2);
    assert.deepEqual([...q.options].sort(), [c.answer, ...wrong].sort());
    assert.equal(q.answer, c.answer);
  });
});

test('whatever words you have, story questions only show words you have caught', () => {
  for (let run = 0; run < 100; run++){
    const words = FEWEST.concat(collectible.filter(() => Math.random() < 0.5));
    for (const q of questionsFor(words)){
      assert.ok(q.options.includes(q.answer), `${q.t.join('')}: the answer is missing`);
      assert.equal(new Set(q.options).size, q.options.length, `${q.t.join('')} repeats an option`);
      assert.ok(q.options.length >= 2 && q.options.length <= 3, `${q.t.join('')} has ${q.options.length} options`);
      for (const w of q.options) assert.ok(words.includes(w), `${q.t.join('')} shows ${w}, which you haven't caught (with ${words.join(' ')})`);
    }
  }
});
