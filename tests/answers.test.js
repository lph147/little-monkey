// Answering with the D-pad (or the arrow keys) and A, as well as by tapping: a question's answers, and a matching
// game's words and pictures. A never answers for you: with nothing chosen, it shows where you are.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const WORDS = ['我', '要', '吃', '桃子', '苹果', '石头', '山', '花', '草', '树'];
function game(save = {}){
  const g = loadGame({dom: true, save: {version: 29, started: true, turn: 0, w: Object.fromEntries(WORDS.map((w, i) => [w, {lv: 2, ok: 3, next: i}])), ...save}});
  g.run("mode = 'play'; save = () => {}");
  return g;
}
const settle = async g => { for (let i = 0; i < 5; i++){ await new Promise(r => setImmediate(r)); g.flush(); } };
const chosen = sheet => sheet.querySelectorAll('.navsel');

test('a question can be answered with the D-pad and A: A first shows the first answer, the arrows move, A chooses, then A is Next', async () => {
  const g = game(), sheet = g.el('#sheet');
  g.run("globalThis.__ok = null; gapQ({t: toks('我 要 吃 桃子'), en: 'I want to eat a peach.', gap: '桃子'}).then(ok => { __ok = ok; })");
  const opts = sheet.querySelectorAll('.opt'), right = opts.findIndex(o => o.textContent.includes('桃子'));
  g.run('pressA()');
  assert.ok(!sheet.querySelector('.opts.answered'), 'A doesn’t answer for you');
  assert.equal(chosen(sheet)[0], opts[0], 'it shows where you are: the first answer');
  for (let i = 0; i < right; i++) g.run("navFocus('right')");
  assert.equal(chosen(sheet)[0], opts[right]);
  assert.equal(g.run('btnLabel(chosenBtn())'), 'Choose', 'the A button says what it will do');
  g.run('pressA()');
  assert.ok(sheet.querySelector('.opts.answered') && opts[right].classList.contains('right'), 'A chooses it');
  g.run('pressA()');   // Next
  await settle(g);
  assert.equal(g.run('__ok'), true);
});

test('on a computer, Space or Enter is A on a question too, and the arrow keys move between the answers', () => {
  const g = game(), sheet = g.el('#sheet');
  g.run("gapQ({t: toks('我 要 吃 桃子'), en: 'I want to eat a peach.', gap: '桃子'})");
  const opts = sheet.querySelectorAll('.opt');
  assert.equal(g.key('Enter').defaultPrevented, true);
  assert.equal(chosen(sheet)[0], opts[0]);
  g.key('ArrowRight');
  assert.equal(chosen(sheet)[0], opts[1]);
  assert.equal(g.key('Enter', {tabbedTo: true}).defaultPrevented, false, 'a button the browser has chosen is left to the browser to press');
});

test('the apple and 🔊 can be chosen too, in a battle or with an animal', async () => {
  const g = game({bag: {'苹果': 1}}), sheet = g.el('#sheet');
  g.run("pictureQ({head: '', body: '<div class=\"askrow\"><p class=\"prompt\">Listen.</p><button class=\"sayBig\" data-a=\"say\">🔊</button></div>', word: '山', options: ['a', 'b', 'c'], answerIdx: 0, helper: helperHTML()})");
  const items = g.run('navItems().map(b => b.className).join()');
  assert.match(items, /sayBig/, '🔊, to hear it again');
  assert.match(items, /helper/, 'eating an apple');
  g.run(`markNav(sheet.querySelector('.sayBig'))`);
  assert.equal(g.run('btnLabel(chosenBtn())'), 'Hear it');
  g.run(`markNav(sheet.querySelector('.helper'))`);
  assert.equal(g.run('btnLabel(chosenBtn())'), 'Eat');
});

test('a matching game can be played with the D-pad and A: choose a word, then its picture; words you’ve matched are skipped', () => {
  const g = game(), sheet = g.el('#sheet');
  g.run("matchWords(['山', '花', '草', '树'], 'Word test', 'Stop test')");
  g.run('pressA()');
  const first = chosen(sheet)[0];
  assert.ok(first.classList.contains('mw'), 'A shows where you are: the first word');
  g.run('pressA()');
  assert.ok(first.classList.contains('sel'), 'A chooses it');
  const items = () => g.run('navItems().map(b => (b.classList.contains("mw") ? "w" : b.classList.contains("mp") ? "p" : "x") + (b.dataset.w || "")).join()').split(',');
  const target = 'p' + first.dataset.w;
  while (chosen(sheet)[0].dataset.w !== first.dataset.w || !chosen(sheet)[0].classList.contains('mp')) g.run("navFocus('right')");
  g.run('pressA()');
  assert.ok(first.classList.contains('done'), 'matched');
  assert.ok(!items().includes('w' + first.dataset.w) && !items().includes(target), 'and skipped from then on');
});

test('Stop, pressed just as a round of matching is done, ends it: the next round never opens', async () => {
  const g = game(), sheet = g.el('#sheet');
  g.run("globalThis.__result = 'playing'; matchWords(['山', '花', '草', '树', '石头', '桃子', '苹果', '吃'], 'Training', 'Stop').then(r => { __result = r; })");
  assert.match(sheet.textContent, /Training · 1 of 2/);
  for (const w of sheet.querySelectorAll('.mw').map(b => b.dataset.w)){ sheet.querySelector(`.mw[data-w="${w}"]`).click(); sheet.querySelector(`.mp[data-w="${w}"]`).click(); }
  sheet.querySelector('[data-a=quit]').click();   // Stop, before the next round comes
  await settle(g);
  assert.equal(g.run('modal.hidden'), true, 'no card: not the next round');
  assert.equal(g.run('__result'), null, 'stopped');
});

test('answers get the gold outline when chosen, but never the A badge (they’re tapped directly)', () => {
  const css = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'css', 'game.css'), 'utf8');
  const badge = css.indexOf('.sheet [data-nav] button.navsel::before'), none = css.indexOf('.sheet .opts button.navsel::before,.sheet .match button.navsel::before{content:none}');
  assert.ok(badge > 0 && none > badge, 'the rule taking the badge off comes after the one adding it, so it wins');
});
