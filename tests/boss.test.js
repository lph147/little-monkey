// Boss fights and streaks (2 November 2026). In every battle, three right answers in a row (hitting or jumping aside)
// make your stick glow, and your next right hit counts three times over; a wrong answer puts the dots out. A boss fight
// (an enemy's bossFight, such as the bear at the pasture's rocks) has its health across the top, asks the words you know
// least well, and if it beats you, you can try again on the spot, or step back and come back when you're ready.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const tick = () => new Promise(r => setImmediate(r));
const knows = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
const WORDS = knows(['石头', '山', '花', '草', '树', '桃子', '苹果', '河', '水', '鱼', '棍子', '蛇', '野猪', '熊', '吃']);
function fighting(save = {}){
  const game = loadGame({dom: true, save: {version: 24, started: true, w: WORDS, areas: {1: {elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 1}}, ...save}});
  game.run("mode = 'play'; globalThis.__q = null; const q = pictureQ; pictureQ = o => { __q = o; return q(o); }; say = () => {}");
  const sheet = game.el('#sheet');
  const run = code => game.run(code);
  const flush = async () => { for (let i = 0; i < 20; i++){ await tick(); game.flush(); } };
  const choose = async act => { sheet.querySelector(`.act[data-act="${act}"]`).click(); await flush(); };
  const answer = async (right, next = true) => {   // answer the question that's open, rightly or wrongly, then Next
    const i = run('__q.answerIdx'), opts = sheet.querySelectorAll('.opt').filter(o => !o.hidden);
    (right ? sheet.querySelector(`.opt[data-i="${i}"]`) : opts.find(o => +o.dataset.i !== i)).click();
    if (next){ sheet.querySelector('[data-a=next]').click(); await flush(); }
  };
  const get = code => JSON.parse(run(`JSON.stringify(${code})`));
  const lit = () => sheet.querySelectorAll('.plate.mine .streak .pip.on').length;
  const foeHealth = () => sheet.querySelector('.plate .hp').getAttribute('aria-label');
  return {game, sheet, run, get, flush, choose, answer, lit, foeHealth};
}

test('three right in a row (hits or jumps aside) light three dots and make your stick glow; your next hit counts ×3', async () => {
  const g = fighting();
  g.run("battle('bear')"); await g.flush();
  assert.equal(g.sheet.querySelectorAll('.plate.mine .streak .pip').length, 3, 'three dots under your health');
  assert.equal(g.lit(), 0);
  await g.choose('hit'); await g.answer(true);
  assert.equal(g.foeHealth(), 'Health: 70 of 80', 'a hit takes 10 of the bear’s 80');
  await g.answer(true);   // you jump aside
  await g.choose('hit');
  assert.equal(g.lit(), 2);
  await g.answer(true);   // the third right answer in a row
  assert.equal(g.foeHealth(), 'Health: 60 of 80', 'still an ordinary hit');
  assert.equal(g.lit(), 3, 'all three lit');
  assert.ok(g.sheet.querySelector('.scene').classList.contains('charged'), 'your stick glows');
  await g.answer(true);   // jumping aside keeps it glowing
  assert.match(g.sheet.textContent, /Your 棍子 \(stick\) glows: your next hit counts ×3!/, 'your turn says so');
  await g.choose('hit');
  assert.match(g.sheet.querySelector('.label').textContent, /glows! Swing it: ×3!/);
  await g.answer(true, false);
  assert.equal(g.foeHealth(), 'Health: 30 of 80', 'a power hit: 30 at once');
  assert.ok(g.sheet.querySelector('.scene').classList.contains('powerhit'));
  assert.match(g.sheet.querySelector('.fx').textContent, /Power hit! ×3/);
  assert.equal(g.lit(), 0, 'and the dots start again');
  assert.equal(g.sheet.querySelector('.scene').classList.contains('charged'), false);
});

test('a wrong answer puts the dots out, and a glowing stick stops glowing', async () => {
  const g = fighting();
  g.run("battle('boar')"); await g.flush();
  await g.choose('hit'); await g.answer(true);
  await g.answer(true);
  await g.choose('hit'); await g.answer(true);   // three in a row
  assert.equal(g.lit(), 3);
  await g.answer(false);   // it hits you
  assert.equal(g.lit(), 0);
  assert.equal(g.sheet.querySelector('.scene').classList.contains('charged'), false);
  await g.choose('hit'); await g.answer(true);
  assert.equal(g.foeHealth(), 'Health: 10 of 40', 'an ordinary hit, after the wrong answer');
});

test('every battle has the streak, even a snake (though it rarely lasts long enough to use it)', async () => {
  const g = fighting();
  g.run("battle('snake')"); await g.flush();
  assert.equal(g.sheet.querySelectorAll('.plate.mine .streak .pip').length, 3);
  assert.equal(g.sheet.querySelector('.plate.bossplate'), null, 'not a boss fight: its plate as usual');
});

test('the bear is a boss fight: its health across the top, no running away, and it asks the words you know least well', async () => {
  const g = fighting();
  g.run("for (const w in S.w) S.w[w].next = 100; S.w['花'].next = -50");   // (花 first in the review list)
  g.run("battle('bear')"); await g.flush();
  assert.deepEqual(g.get('[ENEMIES.bear.health, ENEMIES.bear.bossFight, ENEMIES.bear.reward]'), [80, true, 10]);
  assert.ok(g.sheet.querySelector('.scene.boss .plate.bossplate'), 'its dark and gold plate');
  assert.deepEqual(g.sheet.querySelectorAll('.act').map(b => b.dataset.act), ['hit']);
  await g.choose('hit');
  assert.equal(g.run('__q.word'), '花', 'the word you know least well first');
});

test('beaten by a boss: Try again starts it over on the spot, your health full; Not now steps you back', async () => {
  const g = fighting({health: 10, w: {...WORDS, '牛': {lv: 1, ok: 2}}, pos: {place: 'pasture', x: 21, y: 14, dir: 'up'}});
  g.run("placePlayer(); globalThis.__r = null; battle('bear', {back: {at: [21, 16, 'pasture'], facing: 'up'}, lost: 'The {熊} is too strong for you this time. The {牛} is still with you.'}).then(r => { __r = r; })");
  await g.flush();
  await g.choose('hit'); await g.answer(false);
  await g.answer(false);   // the last of your health
  assert.match(g.sheet.textContent, /Ouch!/);
  assert.match(g.sheet.textContent, /The 熊 \(bear\) is too strong for you this time\. The 牛 \(cow\) is still with you\. Your health is full again\./);
  assert.match(g.sheet.textContent, /When your health is low, 吃 \(eat\) something from your bag on your turn\./, 'a tip, as you know 吃');
  assert.deepEqual(g.sheet.querySelectorAll('.actions .btn').map(b => b.textContent), ['Not now', 'Try again']);
  assert.equal(g.run('S.health'), 50);
  g.sheet.querySelector('[data-a=ok]').click(); await g.flush();
  assert.equal(g.run('__r'), null, 'still fighting');
  assert.equal(g.foeHealth(), 'Health: 80 of 80', 'it starts over');
  assert.match(g.sheet.textContent, /The 熊 \(bear\) roars!/, 'with its own words, not the meeting at the rocks');
  for (let i = 0; i < 5; i++){ await g.choose('hit'); await g.answer(false); await g.answer(false); }
  assert.match(g.sheet.textContent, /Ouch!/);
  g.sheet.querySelector('[data-a=back]').click(); await g.flush();
  assert.equal(g.run('__r'), 'back');
  assert.deepEqual(g.get('[PLACE, pl.x, pl.y, pl.dir, S.health]'), ['pasture', 21, 16, 'up', 50], 'stepped back down the trail');
});

test('the wild boar is a smaller boss fight: its health across the top, and try again on the spot, or step back down the path', async () => {
  const g = fighting({health: 10, pos: {place: 'falls', x: 7, y: 4, dir: 'up'}});
  g.run("placePlayer(); globalThis.__r = null; battle('boar', {back: AREA.talk.boar[0].do[0].back}).then(r => { __r = r; })");
  await g.flush();
  assert.ok(g.sheet.querySelector('.scene.boss .plate.bossplate'), 'its dark and gold plate');
  assert.equal(g.foeHealth(), 'Health: 40 of 40', 'still 40 health');
  await g.choose('hit'); await g.answer(false);
  await g.answer(false);
  assert.match(g.sheet.textContent, /The 野猪 \(wild boar\) is too strong for you this time\. Your health is full again\./);
  g.sheet.querySelector('[data-a=back]').click(); await g.flush();
  assert.deepEqual(g.get('[__r, PLACE, pl.x, pl.y, pl.dir]'), ['back', 'falls', 7, 6, 'up'], 'a step back down the path, below it');
});

test('a battle the story lets you try again (retry), such as the wolf the cow is scared of: no boss look, but Try again', async () => {
  const g = fighting({health: 10, w: {...WORDS, '狼': {lv: 1, due: 0, ok: 0}}});
  g.run("globalThis.__r = null; battle('wolf', {retry: true}).then(r => { __r = r; })"); await g.flush();
  assert.equal(g.sheet.querySelector('.plate.bossplate'), null);
  assert.deepEqual(g.sheet.querySelectorAll('.act').map(b => b.dataset.act), ['hit', 'run'], 'you can still run away from it');
  await g.choose('hit'); await g.answer(false);
  await g.answer(false);
  assert.match(g.sheet.textContent, /Ouch!/);
  g.sheet.querySelector('[data-a=ok]').click(); await g.flush();
  assert.equal(g.foeHealth(), 'Health: 30 of 30', 'it starts over');
  assert.equal(g.run('__r'), null);
});

test('the bear: its name across the screen, it rears up roaring and says 我饿了！我要牛！; at half its health it gets angry (我不怕你！) and attacks twice a turn; beaten, 我怕你！ (3 November 2026)', async () => {
  const g = fighting();
  g.run("globalThis.__said = []; say = t => __said.push(t)");
  g.run("battle('bear')"); await g.flush();
  const zh = () => g.sheet.querySelector('.bossline .line').textContent.replace(/[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/gi, '');   // (its characters, without the pinyin over them)
  assert.equal(zh(), '我饿了！我要牛！', 'what it says, at the top of your turn');
  assert.match(g.sheet.querySelector('.bossline').textContent, /I’m hungry! I want the cow!/, 'with its English, the first time');
  assert.ok(g.run("__said.includes('我饿了！我要牛！')"), 'said aloud');
  assert.ok(g.sheet.querySelector('.scene').classList.contains('rear'), 'it rears up...');
  assert.equal(g.sheet.querySelector('.fx').textContent, 'ROAR!', '...roaring');
  assert.ok(g.sheet.querySelector('.plate.bossplate .notch'), 'a mark on its bar, where it gets angry');
  await g.choose('hit'); await g.answer(true); await g.answer(true);
  await g.choose('hit'); await g.answer(true); await g.answer(true);
  await g.choose('hit'); await g.answer(true);   // a power hit: 30 of its 80 left
  assert.match(g.sheet.textContent, /The 熊 \(bear\) stands up tall, angry!/);
  assert.equal(zh(), '我不怕你！');
  assert.ok(g.sheet.querySelector('.scene').classList.contains('rage'));
  g.sheet.querySelector('[data-a=ok]').click(); await g.flush();
  assert.match(g.sheet.querySelector('.label').textContent, /Attack 1 of 2/);
  await g.answer(true);
  assert.match(g.sheet.querySelector('.label').textContent, /Attack 2 of 2/, 'it attacks twice in a row');
  await g.answer(true);
  assert.equal(g.sheet.querySelector('.plate.bossplate .tag').textContent, 'Angry!');
  await g.choose('hit'); await g.answer(true); await g.answer(true); await g.answer(true);
  await g.choose('hit'); await g.answer(true);   // a power hit: beaten
  assert.match(g.sheet.textContent, /You win!/);
  assert.equal(zh(), '我怕你！', 'beaten, it says so as it lumbers off');
});
