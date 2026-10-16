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

test('each story question is a story sentence with its answer as the missing word', () => {
  const story = AREA.story.map(s => s.zh);
  AREA.storyQuestions.forEach((q, i) => {
    assert.ok(story.includes(q.zh), `story question ${i + 1} should be a sentence from the story: ${q.zh}`);
    assert.equal(q.zh.split(' ').filter(w => w === q.answer).length, 1, `story question ${i + 1}: ${q.answer} should be in the sentence once`);
    assert.ok(q.en && q.en.includes('…'), `story question ${i + 1} needs its English with … for the gap`);
  });
  for (const s of AREA.story) if (s.pic) assert.ok(collectible.includes(s.pic) && BANK[s.pic].pic, `the story's picture ${s.pic} should be a word with a picture`);
});

test('a story question shows a gap; answering fills it in', async () => {
  const w = Object.fromEntries(collectible.map(x => [x, {lv: 1, due: 0, ok: 0}]));
  const game = loadGame({dom: true, save: {version: 9, started: true, w}});
  const sheet = game.el('#sheet');
  game.run("globalThis.__q = null; const pq = pictureQ; pictureQ = q => { __q = q; return pq(q); }; storyScroll()");
  sheet.querySelector('[data-a=ok]').click();   // Questions
  await new Promise(r => setImmediate(r));
  const answer = AREA.storyQuestions[0].answer;
  assert.ok(sheet.querySelector('.line .gap'), 'the sentence has a gap');
  assert.ok(!sheet.querySelector(`.line .tok[data-t="${answer}"]`), 'and the missing word is not shown');
  sheet.querySelector(`.opt[data-i="${game.run('__q.answerIdx')}"]`).click();
  assert.ok(!sheet.querySelector('.line .gap'), 'the gap is filled');
  assert.ok(sheet.querySelector(`.line .tok.teach[data-t="${answer}"]`), `with ${answer}, in bold`);
});

test('the story shows each sentence\'s English the first time, then behind the English button', () => {
  const game = loadGame({dom: true, save: {version: 9, started: true}});
  const sheet = game.el('#sheet');
  game.run('storyScroll()');
  assert.equal(sheet.querySelectorAll('.sent .sentence-en').filter(e => !e.hidden).length, AREA.story.length, 'all English shown the first time');
  assert.equal(sheet.querySelector('[data-a=en]'), null);
  assert.equal(sheet.querySelectorAll('.sent .spic').length, AREA.story.filter(s => s.pic).length, 'a picture beside each sentence');
  game.run('closeCard(); here().story = true; storyScroll()');
  assert.equal(sheet.querySelectorAll('.sent .sentence-en').filter(e => !e.hidden).length, 0, 'hidden after that');
  sheet.querySelector('[data-a=en]').click();
  assert.equal(sheet.querySelectorAll('.sent .sentence-en').filter(e => !e.hidden).length, AREA.story.length, 'English shows them all');
});
