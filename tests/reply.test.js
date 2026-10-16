// Replying in Chinese: after some lines you choose what to say from phrases you know, with their
// pinyin and English (unless it's switched off). Any choice is fine; the one that fits counts as used.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const tick = () => new Promise(r => setImmediate(r));
function replyGame(w, extra = {}){
  const game = loadGame({dom: true, save: {version: 10, started: true, w, ...extra}});
  game.run("mode = 'play'; globalThis.__done = false;");
  const box = game.el('#talk'), sheet = game.el('#sheet');
  const run = code => game.run(code);
  return {
    game, box, sheet, run,
    start: best => run(`replyWith(${JSON.stringify(best)}).then(() => { __done = true; })`),
    choices: () => box.querySelectorAll('.reply').map(b => b.querySelector('.rzh').textContent),
    rec: w => JSON.parse(run(`JSON.stringify(rec(${JSON.stringify(w)}))`))
  };
}
const know = (...ws) => Object.fromEntries(ws.map(w => [w, {lv: 1, due: 0, ok: 0}]));

test('the choices are the phrase that fits and up to 2 others you know, with pinyin and English', async () => {
  const t = replyGame(know('你好', '谢谢', '再见', '对不起'));
  t.start('谢谢');
  await tick();
  const choices = t.choices();
  assert.equal(choices.length, 3);
  assert.ok(choices.includes('谢谢'), 'the one that fits is always there');
  for (const c of choices) assert.ok(['你好', '谢谢', '再见', '对不起'].includes(c), `${c} isn't a phrase you know`);
  const b = t.box.querySelector('.reply');
  assert.ok(b.querySelector('.rpy').textContent && b.querySelector('.ren').textContent, 'each shows pinyin and English');
});

test('with English on replies switched off, the choices show Chinese and pinyin only', async () => {
  const t = replyGame(know('你好', '谢谢'), {replyEn: false});
  t.start('谢谢');
  await tick();
  assert.equal(t.box.querySelectorAll('.ren').length, 0);
  assert.equal(t.box.querySelectorAll('.rpy').length, 2);
});

test('choosing the phrase that fits: you say it, and it counts as used', async () => {
  const t = replyGame(know('你好', '谢谢'));
  t.start('谢谢');
  await tick();
  t.box.querySelectorAll('.reply').find(b => b.querySelector('.rzh').textContent === '谢谢').click();
  await tick();
  assert.match(t.box.querySelector('.spk-zh').textContent, /小猴子/, 'your monkey says it');
  assert.ok(t.box.querySelector('.tok.teach[data-t="谢谢"]'));
  assert.equal(t.box.querySelector('.hintline'), null, 'no note: it fits');
  assert.deepEqual([t.rec('谢谢').lv, t.rec('谢谢').used], [4, 1]);
  t.run('pressA()');
  await tick();
  assert.equal(t.run('__done'), true);
});

test('choosing another phrase is fine: the game says which fits best', async () => {
  const t = replyGame(know('你好', '谢谢'));
  t.start('谢谢');
  await tick();
  t.box.querySelectorAll('.reply').find(b => b.querySelector('.rzh').textContent === '你好').click();
  await tick();
  assert.match(t.box.querySelector('.hintline').textContent, /谢谢 \(thank you\) fits best here/);
  assert.equal(t.rec('谢谢').lv, 1, 'it isn\'t counted as used');
});

test('a phrase you don\'t know yet is taught on its own card first', async () => {
  const t = replyGame(know('你好'));
  t.start('再见');
  await tick();
  assert.equal(t.run('modal.hidden'), false, 'a new-word card');
  assert.match(t.sheet.textContent, /再见/);
  t.run('pressA()');   // Got it
  await tick();
  assert.deepEqual(t.choices().sort(), ['你好', '再见'].sort());
});

test('the arrows move between choices and A chooses; B doesn\'t choose', async () => {
  const t = replyGame(know('你好', '谢谢', '再见'));
  t.start('你好');
  await tick();
  const sel = () => t.box.querySelectorAll('.reply').findIndex(b => b.classList.contains('sel'));
  assert.equal(sel(), 0);
  t.game.key('ArrowRight');
  assert.equal(sel(), 1);
  t.game.key('ArrowLeft'); t.game.key('ArrowLeft');
  assert.equal(sel(), 2, 'round to the last one');
  t.run('pressB()');
  assert.equal(t.run('!!talkMove'), true, 'still choosing');
  const picked = t.choices()[2];
  t.game.key(' ');
  await tick();
  assert.ok(t.box.querySelector(`.tok.teach[data-t="${picked}"]`), 'A said the chosen one');
});
