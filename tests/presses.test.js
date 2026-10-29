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

// B waits longer (B_READ_MS): you might be holding or tapping it to run just as something comes up, and a line, a card or a
// message would be gone before you'd read it (decided 29 October 2026, after playing it).
test('B, the run button, waits a whole second before it skips a line, closes a card or a message that’s just come up', () => {
  const g = game();
  g.run("showDialog(speaker('elder'), L.hi)");
  g.run('__now = 5600; pressB(5600)');
  assert.ok(g.run('!!talkNext'), 'B half a second after the line came up: still there');
  g.run('__now = 6100; pressB(6100)');
  assert.ok(!g.run('talkNext'), 'B a second after: on, as always');
  g.run("__now = 7000; showNotice('石头'); __now = 7500; pressB(7500)");
  assert.equal(g.run('modal.hidden'), false, 'a card');
  g.run("closeCard(); __now = 8000; toast('New task: Find some fruit for the hungry monkey'); __now = 8500; pressB(8500)");
  assert.equal(g.run("$('#saybox').hidden"), false, 'a message, as you run');
  g.run('__now = 9100; pressB(9100)');
  assert.equal(g.run("$('#saybox').hidden"), true, 'a second later, B closes it');
  const k = loadGame({dom: true, save: {version: 24, started: true}});
  k.run("mode = 'play'; globalThis.__now = 5000; performance.now = () => __now; showNotice('石头'); __now = 5500");
  k.key('x', {at: 5500});
  assert.equal(k.run('modal.hidden'), false, 'the keyboard’s B (X) too');
});
