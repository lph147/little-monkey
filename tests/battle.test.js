// Battles (18 October 2026): from the end of the prologue, wild creatures jump out of the long grass on the mountain
// path. Both sides have hearts; every hit or miss depends on knowing the word. Losing isn't punished.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const tick = () => new Promise(r => setImmediate(r));
const knows = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
const WORDS = knows(['石头', '山', '花', '草', '树', '桃子', '苹果', '河', '水', '鱼', '棍子', '蛇', '野猪']);
function fighting(save = {}){
  const game = loadGame({dom: true, save: {version: 24, started: true, w: WORDS, areas: {1: {elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 1}}, ...save}});
  game.run("mode = 'play'; globalThis.__q = null; const q = pictureQ; pictureQ = o => { __q = o; return q(o); }; say = () => {}");
  const sheet = game.el('#sheet');
  const run = code => game.run(code);
  const flush = async () => { for (let i = 0; i < 20; i++){ await tick(); game.flush(); } };
  const choose = async act => { sheet.querySelector(`.act[data-act="${act}"]`).click(); await flush(); };
  const answer = async right => {   // answer the question that's open, rightly or wrongly, then Next
    const i = run('__q.answerIdx'), opts = sheet.querySelectorAll('.opt').filter(o => !o.hidden);
    (right ? sheet.querySelector(`.opt[data-i="${i}"]`) : opts.find(o => +o.dataset.i !== i)).click();
    sheet.querySelector('[data-a=next]').click(); await flush();
  };
  return {game, sheet, run, flush, choose, answer};
}

test('you can only fight once the big monkey has given you the stick', () => {
  const g = fighting();
  assert.equal(g.run('canBattle()'), true);
  const without = loadGame({save: {version: 24, started: true, w: knows(['石头', '山'])}});
  assert.equal(without.run('canBattle()'), false);
});

test('your turn: hit, eat (with food) or run; a hit takes one of its hearts; it runs off when they are gone', async () => {
  const g = fighting({bag: {'苹果': 1}});
  g.run("globalThis.__r = null; battle('snake').then(r => { __r = r; })"); await g.flush();
  assert.deepEqual(g.sheet.querySelectorAll('.act').map(b => b.dataset.act), ['hit', 'eat', 'run']);
  assert.match(g.sheet.textContent, /蛇/, 'the snake’s name on its plate');
  await g.choose('hit'); await g.answer(true);   // a hit
  await g.answer(true);                         // its turn: you dodge
  await g.choose('hit'); await g.answer(true);   // a second hit: it runs off
  assert.match(g.sheet.textContent, /You win!/);
  g.run("document.querySelector('#sheet [data-a=ok]') || 0"); g.sheet.querySelector('[data-a=ok]').click(); await g.flush();
  assert.equal(g.run('__r'), 'won');
  assert.equal(g.run('S.hearts'), 5, 'no hearts lost');
  assert.equal(g.run('S.shells'), 1, 'a shell for chasing it off');
});

test('a wrong dodge costs a heart, and your hearts stay down after the battle', async () => {
  const g = fighting();
  g.run("battle('snake')"); await g.flush();
  await g.choose('hit'); await g.answer(false);   // a miss
  await g.answer(false);                          // its turn: you don't dodge
  assert.equal(g.run('S.hearts'), 4);
  await g.choose('run');
  assert.equal(g.run('modal.hidden'), true, 'running away ends the battle');
  assert.equal(JSON.parse(g.run('localStorage.getItem(KEY)')).hearts, 4, 'saved');
});

test('eating something brings a heart back', async () => {
  const g = fighting({hearts: 3, bag: {'苹果': 2}});
  g.run("battle('snake')"); await g.flush();
  await g.choose('eat');
  assert.equal(g.run('S.hearts'), 4);
  assert.equal(g.run("S.bag['苹果']"), 1);
  assert.match(g.sheet.textContent, /a heart comes back/);
});

test('the wild boar is a big enemy: you can’t run from it', async () => {
  const g = fighting();
  g.run("battle('boar')"); await g.flush();
  assert.deepEqual(g.sheet.querySelectorAll('.act').map(b => b.dataset.act), ['hit']);
});

test('losing isn’t punished: you rest in the meadow with full hearts', async () => {
  const g = fighting({hearts: 1, pos: {place: 'path', x: 8, y: 13, dir: 'down'}});
  g.run("globalThis.__r = null; battle('snake').then(r => { __r = r; })"); await g.flush();
  await g.choose('hit'); await g.answer(false);
  await g.answer(false);   // the last heart
  assert.match(g.sheet.textContent, /Ouch!/);
  g.sheet.querySelector('[data-a=ok]').click(); await g.flush();
  assert.equal(g.run('__r'), 'lost');
  assert.equal(g.run('S.hearts'), 5);
  assert.equal(g.run('S.pos.place'), 'meadow');
});

test('when you’re hurt, the old monkey lets you rest', () => {
  const g = fighting({hearts: 2});
  const part = g.run("JSON.stringify(AREA.talk.elder.find(p => !p.if || matches(p.if)).do.map(s => Object.keys(s)[0]))");
  assert.deepEqual(JSON.parse(part), ['rest', 'message']);
  g.run('STEPS.rest({})');
  assert.equal(g.run('S.hearts'), 5);
});

test('wild creatures jump out of the long grass, now and then, not every step', async () => {
  const g = fighting();
  g.run("globalThis.__fights = 0; wildBattle = async () => { __fights++; return 'ran'; }; Math.random = () => 0");
  const t = 'AREA.legend.n';   // the long grass
  for (let i = 0; i < 10; i++) await g.run(`wildStep(${t})`);
  assert.equal(g.run('__fights'), 2, 'one battle every few steps at most');
  g.run('Math.random = () => .99');
  for (let i = 0; i < 6; i++) await g.run(`wildStep(${t})`);
  assert.equal(g.run('__fights'), 2, 'and only by chance');
});

test('the wild boar blocks the way at the top until you chase it off', () => {
  const at = save => loadGame({save: {version: 24, started: true, ...save}}).run("placeCharacters(); ALL_NPCS.find(n => n.id === 'boar').place");
  assert.equal(at({areas: {1: {gate: true, climb: 1}}}), 'falls');
  assert.equal(at({areas: {1: {gate: true, climb: 1, boar: 1}}}), 'gone', 'chased off');
  assert.equal(at({areas: {1: {gate: true, climb: 3}}}), 'gone', 'a game past the waterfall never meets it');
});
