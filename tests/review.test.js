// The review list (decided 20 October 2026: no days). Every word you've caught is in one list, worked through in turns:
// new words and words you get wrong are slotted in near the front, words you get right go further back the more times
// in a row you've got them right, questions pick at random from near the front, and nothing gets stuck at the back.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
// A game with these words caught, known well (right three times in a row), in this order in the list.
const WORDS = ['石头', '山', '花', '草', '树', '河', '水', '鱼', '桃子', '苹果', '猴子', '鸟', '兔子', '狐狸', '松鼠', '山羊'];
function game(words = WORDS){
  const g = loadGame({save: {version: 29, started: true, turn: 0, w: Object.fromEntries(words.map((w, i) => [w, {lv: 1, ok: 3, next: i}]))}});
  g.run('save = () => {}');   // (no need to keep it)
  return g;
}
const order = g => get(g, 'reviewOrder(ORDER.filter(w => lvl(w) >= 1))');

test('a word you get wrong comes back within a couple of questions, even with lots of words waiting', () => {
  const g = game();
  g.run("answer('河', false, 'listen')");   // 河 was sixth in line
  assert.equal(order(g).indexOf('河'), 2, 'two words ahead of it now');
  assert.equal(get(g, "rec('河').ok"), 0, 'its run of right answers starts again');
  assert.equal(get(g, 'S.turn'), 1, 'a turn went by');
});

test('a new word comes back within a few questions', () => {
  const g = game();
  g.run("setSeen('蛇')");
  assert.equal(order(g).indexOf('蛇'), 3, 'three words ahead of it');
  assert.ok(get(g, "needsPractice('蛇')"), 'and it needs practice');
});

test('a word you get right goes further back each time in a row: 4, 8, 16, 32, then 64 questions', () => {
  const g = game();
  g.run("S.w['石头'].ok = 0");
  const gaps = [];
  for (let i = 0; i < 6; i++){ g.run("answer('石头', true, 'listen')"); gaps.push(get(g, "rec('石头').next - S.turn")); }
  assert.deepEqual(gaps, [4, 8, 16, 32, 64, 64]);
  assert.ok(!get(g, "needsPractice('石头')"), 'right twice in a row: it doesn’t need practice');
});

test('a wrong choice in a fill-the-gap question counts too: the word comes back soon (nothing else is taken away)', async () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, turn: 0, w: Object.fromEntries(['我', '要', '吃', '桃子', '苹果', '石头', '山', '花'].map((w, i) => [w, {lv: 2, ok: 3, next: i}]))}});
  g.run("gapQ({t: toks('我 要 吃 桃子'), en: 'I want to eat a peach.', gap: '桃子'})");
  g.el('#sheet').querySelectorAll('.opt').find(o => !o.textContent.includes('桃子')).click();
  for (let i = 0; i < 5; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  g.el('#sheet').querySelector('[data-a=next]').click();   // Next, after the right one is shown
  for (let i = 0; i < 5; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  assert.equal(get(g, "rec('桃子').ok"), 0);
  assert.equal(get(g, "rec('桃子').lv"), 2, 'its gold squares stay');
  assert.ok(get(g, "reviewOrder(ORDER.filter(w => lvl(w) >= 1)).indexOf('桃子')") <= 2, 'it comes back soon');
});

test('which word comes next is picked at random from near the front, so you can’t tell what’s coming', () => {
  const g = game(), seen = new Set();
  for (let i = 0; i < 60; i++) seen.add(get(g, 'nextWords(ORDER.filter(w => lvl(w) >= 1), 1)[0]'));
  assert.deepEqual([...seen].sort(), ['山', '石头', '花'].sort(), 'one of the first three');
});

// Plays questions: picks the next word as the game does, and answers it (wrong for the words in misses, or at random
// with chance wrong). Gives, for each word, how many times it was asked and the longest wait between two times.
function play(g, {questions = 3000, misses = [], wrong = 0} = {}){
  return get(g, `(() => {
    const words = ORDER.filter(w => lvl(w) >= 1), asked = {}, last = {}, wait = {};
    for (let q = 0; q < ${questions}; q++){
      const w = nextWords(words, 1)[0];
      asked[w] = (asked[w] || 0) + 1; wait[w] = Math.max(wait[w] || 0, q - (w in last ? last[w] : 0)); last[w] = q;
      answer(w, !${JSON.stringify(misses)}.includes(w) && Math.random() >= ${wrong}, 'listen');
    }
    for (const w of words) wait[w] = Math.max(wait[w] || 0, ${questions} - (w in last ? last[w] : 0));
    return {asked, wait};
  })()`);
}
test('nothing gets stuck at the back: every word comes round, however you answer', () => {
  for (const [how, opts] of [['answering everything right', {}], ['missing a third of the time', {wrong: 0.33}],
    ['always missing the same three words', {misses: ['石头', '山', '花']}]]){
    const {asked, wait} = play(game(), opts);
    for (const w of WORDS){
      assert.ok(asked[w] > 0, `${how}: ${w} was never asked`);
      assert.ok(wait[w] < 200, `${how}: ${w} waited ${wait[w]} questions at one point`);
    }
  }
});

test('words you know well come up less often than ones you keep missing', () => {
  const {asked} = play(game(), {questions: 1000, misses: ['石头']});
  assert.ok(asked['石头'] > 3 * asked['山羊'], `missed: ${asked['石头']} times; known: ${asked['山羊']}`);
});
