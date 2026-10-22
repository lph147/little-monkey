// A and B don't press a card, or a line in the speech box, if they were pressed before it appeared (while the game was
// busy, such as drawing the map again) or just as it did (READ_MS, js/cards.js): pressed again and again while waiting,
// A skipped a new word's card unread (decided 22 October 2026). A moment later, they press it as always.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

function game(){
  const g = loadGame({dom: true, save: {version: 24, started: true}});
  g.run("mode = 'play'; globalThis.__now = 5000; performance.now = () => __now");   // (the pretend browser's clock, which the test moves on)
  return g;
}

test('a card: A or B pressed before it appeared, or just as it did, doesn’t press it; a moment later, A does', () => {
  const g = game();
  g.run("showNotice('石头')");
  assert.equal(g.run('modal.hidden'), false, 'the card');
  g.run('pressA(4000)');
  assert.equal(g.run('modal.hidden'), false, 'pressed while the game was busy, before the card appeared');
  g.run('__now = 5100; pressA(5100); pressB(5150)');
  assert.equal(g.run('modal.hidden'), false, 'pressed just as it appeared');
  g.run('__now = 5400; pressA(5400)');
  assert.equal(g.run('modal.hidden'), true, 'a moment later: Got it');
});

test('the speech box: the same', () => {
  const g = game();
  g.run("showDialog(speaker('elder'), L.hi)");
  assert.ok(g.run('!!talkNext'), 'the line');
  g.run('pressA(4000); __now = 5200; pressB(5200)');
  assert.ok(g.run('!!talkNext'), 'still there');
  g.run('__now = 5400; pressA(5400)');
  assert.ok(!g.run('talkNext'), 'a moment later, on to what comes next');
});

test('a key pressed before the card appeared doesn’t press its chosen button either', () => {
  const g = game();
  g.run("showNotice('石头')");
  const early = g.key('Enter', {at: 4000});
  assert.ok(early.defaultPrevented, 'kept from the browser, which would press the chosen button');
  assert.equal(g.run('modal.hidden'), false);
  g.run('__now = 5400');
  g.key('Enter', {at: 5400});
  assert.equal(g.run('modal.hidden'), true);
});

test('after you answer a question, A pressed again at once doesn’t skip what it says', async () => {
  const g = game();
  const tick = () => new Promise(r => setImmediate(r));
  g.run(`globalThis.__done = false; pictureQ({head: '', body: '', options: ['a', 'b', 'c'], answerIdx: 1}).then(() => { __done = true; })`);
  g.run("sheet.querySelectorAll('.opt')[0].click()");   // (a wrong answer: it shows the right one)
  assert.equal(g.run("sheet.querySelector('[data-a=next]').hidden"), false, 'Next is there');
  g.run('pressA(5050)'); await tick();
  assert.equal(g.run('__done'), false, 'but A pressed at once doesn’t press it');
  g.run('__now = 5400; pressA(5400)'); await tick();
  assert.equal(g.run('__done'), true, 'a moment later, it does');
});

test('a press with a time that can’t be right (from an odd browser) counts as pressed now, so A never stops working', () => {
  const g = game();
  g.run("showNotice('石头')");
  g.run('__now = 5400; pressA(0)');
  assert.equal(g.run('modal.hidden'), true);
});
