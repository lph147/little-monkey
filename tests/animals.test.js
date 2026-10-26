// Who you meet: animals you haven't met jump out most, then animals whose names need practice or are near the front of
// the review list,
// and the little monkey shows a ! while it has a word to teach you.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const ALL = ['rabbit', 'sheep', 'squirrel', 'goat'];   // (the sheep took the fox's place on 23 October 2026)
const NAMES = {'兔子': 'rabbit', '羊': 'sheep', '松鼠': 'squirrel', '山羊': 'goat'};
const word = (soon, lv = 1) => (soon ? {lv, ok: 0, next: 50} : {lv, ok: 3, next: 100});   // soon: it needs practice (otherwise known well, far back in the list)
const FRONT = Object.fromEntries(['石头', '山', '花', '草', '树', '河', '水', '鱼'].map((w, i) => [w, {lv: 1, ok: 3, next: i}]));   // other words, at the front of the list

function picks(save, n = 2000){
  const game = loadGame({save: {version: 29, started: true, ...save, w: {...FRONT, ...save.w}}});
  return JSON.parse(game.run(`JSON.stringify(Array.from({length: ${n}}, () => pickAnimal(chapterAnimals(0)).id))`));   // (the prologue's four animals)
}
const share = (list, id) => list.filter(x => x === id).length / list.length;

test('once you have met them all, an animal whose name needs practice jumps out most often', () => {
  const w = Object.fromEntries(Object.keys(NAMES).map(hz => [hz, word(hz === '羊')]));
  const got = picks({met: ALL, w});
  assert.ok(share(got, 'sheep') > 0.7, `羊 needs practice, so the sheep should be picked most (it was ${share(got, 'sheep')})`);
  for (const id of ['rabbit', 'squirrel', 'goat']) assert.ok(share(got, id) > 0.02, `${id} should still turn up sometimes`);
});

test('an animal you have not met yet still comes first', () => {
  const w = Object.fromEntries(Object.keys(NAMES).map(hz => [hz, word(true)]));   // all need practice
  const got = picks({met: ['rabbit', 'sheep', 'squirrel'], w});
  assert.ok(share(got, 'goat') > 0.7, `the goat hasn't been met, so it should be picked most (it was ${share(got, 'goat')})`);
});

test('with no animal’s name needing practice, every animal is as likely as the others', () => {
  const w = Object.fromEntries(Object.keys(NAMES).map(hz => [hz, word(false)]));
  const got = picks({met: ALL, w});
  for (const id of ALL) assert.ok(Math.abs(share(got, id) - 0.25) < 0.06, `${id} was picked ${share(got, id)} of the time`);
});

test('the little monkey shows a ! until it has taught you 猴子 and 朋友, and played its word game', () => {
  const bubble = save => loadGame({save: {version: 5, started: true, ...save}}).run("(AREA.bubbles.playful.find(x => matches(x.if)) || {show: ''}).show");
  const area = elder => ({areas: {1: {elder, hungry: 'not asked', thirsty: 'not asked', gate: false, story: false, holding: {}, done: false}}});
  assert.equal(bubble(area(0)), '', 'not before you have said hello to the old monkey');
  assert.equal(bubble(area(1)), '!', 'it has 猴子 to teach');
  assert.equal(bubble({...area(1), w: {'猴子': word(0)}}), '!', 'it has 朋友 to teach');
  assert.equal(bubble({...area(2), w: {'猴子': word(0), '朋友': word(0)}}), '!', 'then its word game, till you’ve played it (tests/meadow-games.test.js)');
  assert.equal(bubble({areas: {1: {...area(2).areas[1], littleGame: 1}}, w: {'猴子': word(0), '朋友': word(0)}}), '', 'nothing left to teach, and its game played');
});

test('an animal never asks about its own name (it\'s on the screen), and friendship shows as hearts', async () => {
  const w = Object.fromEntries(['兔子', '山', '花', '草', '树'].map(hz => [hz, word(0)]));
  const game = loadGame({save: {version: 16, started: true, w}});
  game.run(`globalThis.__asked = []; globalThis.__heads = [];
    pictureQ = o => { __asked.push(o.word || null); __heads.push(o.head); return Promise.resolve(true); };   // answer every question right, at once
    infoBox = tipCard = () => Promise.resolve();
    globalThis.__runs = (async () => { for (let i = 0; i < 30; i++) await encounter({id: 'rabbit', hz: '兔子', img: '', wild: true}); })();`);
  await game.run('__runs');
  const asked = JSON.parse(game.run('JSON.stringify(__asked)')), heads = JSON.parse(game.run('JSON.stringify(__heads)'));
  assert.ok(asked.length >= 60, 'it asked its questions');
  assert.ok(!asked.includes('兔子'), 'never its own name');
  for (const h of heads) assert.ok(/class="heart/.test(h) && !h.includes('🐚'), 'hearts, not shells');
});

test('animals wait until you know 4 words with pictures: 3 to ask about, besides their own name', () => {
  const know = ws => loadGame({save: {version: 16, started: true, w: Object.fromEntries(ws.map(hz => [hz, word(0)]))}}).run('canEncounter()');
  assert.equal(know(['兔子', '山', '花']), false);
  assert.equal(know(['兔子', '山', '花', '草']), true);
});

test('a Read question shows the word in characters with pinyin, never characters alone, and the answers are just pictures', async () => {
  const w = Object.fromEntries(['山羊', '山', '花', '草', '树'].map(hz => [hz, word(0, 2)]));   // Recognised: animals ask you to read
  const game = loadGame({save: {version: 16, started: true, w}});
  game.run(`globalThis.__qs = [];
    pictureQ = o => { __qs.push({type: o.type, word: o.word, body: o.body, options: o.options}); return Promise.resolve(true); };
    infoBox = tipCard = () => Promise.resolve();
    globalThis.__runs = (async () => { for (let i = 0; i < 10; i++) await encounter({id: 'goat', hz: '山羊', img: '', wild: true}); })();`);
  await game.run('__runs');
  const reads = JSON.parse(game.run('JSON.stringify(__qs)')).filter(q => q.type === 'read');
  assert.ok(reads.length >= 10, 'it asked Read questions');
  const py = JSON.parse(game.run('JSON.stringify(Object.fromEntries(Object.entries(WORDS).map(([k, v]) => [k, v.py])))'));
  for (const q of reads){
    assert.ok(q.body.includes(`<div class="big">${q.word}</div><div class="py">${py[q.word]}</div>`), `${q.word} is shown with its pinyin`);
    for (const o of q.options) assert.ok(!o.includes('class="cap"'), 'the answers are pictures, with nothing under them to match the pinyin to');
  }
});

const tick = () => new Promise(r => setImmediate(r));
const knowsSome = () => Object.fromEntries(['兔子', '山', '花', '草', '树', '山羊'].map(hz => [hz, word(0)]));

test('an encounter is a scene: your monkey facing the animal, its name plate with hearts, and which question it is', async () => {
  const game = loadGame({dom: true, save: {version: 17, started: true, w: knowsSome()}});
  game.run("globalThis.__q = null; const q = pictureQ; pictureQ = o => { __q = o; return q(o); }; encounter({id: 'rabbit', hz: '兔子', img: portrait('rabbit'), wild: true})");
  await tick();
  const sheet = game.el('#sheet');
  assert.ok(sheet.querySelector('.scene .foe') && sheet.querySelector('.scene .me'), 'the animal and your monkey');
  assert.match(sheet.querySelector('.plate').textContent, /兔子/);
  assert.match(sheet.querySelector('.plate .qn').textContent, /Question 1 of 3/);
  assert.equal(sheet.querySelectorAll('.plate .heart').length, 3);
  assert.equal(sheet.querySelectorAll('.plate .heart.on').length, 0, 'no hearts filled yet');
  assert.ok(!game.run('__q.options.some(o => o.includes(\'data-w="兔子"\') || o.includes(">兔子<"))'), 'the animal itself isn’t one of the answers');
  sheet.querySelector(`.opt[data-i="${game.run('__q.answerIdx')}"]`).click();
  assert.equal(sheet.querySelectorAll('.plate .heart.on').length, 1, 'a right answer fills a heart');
  assert.ok(sheet.querySelector('.scene .foe').classList.contains('hop'), 'and the animal hops');
  assert.equal(sheet.querySelector('.scene .plus').hidden, false);
});

test('listening: each answer’s pinyin shows once you’ve answered, and the result and Next share the bottom row', async () => {
  const game = loadGame({dom: true, save: {version: 17, started: true, w: knowsSome()}});
  game.run("globalThis.__q = null; const q = pictureQ; pictureQ = o => { __q = o; return q(o); }; encounter({id: 'rabbit', hz: '兔子', img: portrait('rabbit'), wild: true})");
  await tick();
  const sheet = game.el('#sheet'), opts = sheet.querySelector('.opts');
  assert.match(sheet.querySelector('.prompt').textContent, /Listen/);
  assert.ok(sheet.querySelector('.askrow [data-a=say]'), 'the speaker is beside the question');
  assert.equal(sheet.querySelectorAll('.opt .later').length, 3, 'each answer has its pinyin, kept for later');
  assert.ok(!opts.classList.contains('answered'), 'and hidden until you answer');
  const next = sheet.querySelector('.qfoot [data-a=next]');
  assert.ok(next && next.hidden, 'Next waits in the bottom row, hidden');
  sheet.querySelector(`.opt[data-i="${game.run('__q.answerIdx')}"]`).click();
  assert.ok(opts.classList.contains('answered'), 'answered: the pinyin shows');
  assert.equal(next.hidden, false);
  assert.match(sheet.querySelector('.qfoot .feedback').textContent, /Yes!/);
});

test('an apple from the shop is a small helper in the bottom row: eating it takes away a wrong answer', async () => {
  const game = loadGame({dom: true, save: {version: 17, started: true, w: knowsSome(), bag: {'苹果': 1}}});
  game.run("globalThis.__q = null; const q = pictureQ; pictureQ = o => { __q = o; return q(o); }; encounter({id: 'rabbit', hz: '兔子', img: portrait('rabbit'), wild: true})");
  await tick();
  const sheet = game.el('#sheet'), eat = sheet.querySelector('.qfoot .helper[data-a=eat]');
  assert.ok(eat, 'the apple is in the bottom row');
  assert.match(eat.textContent, /苹果 \(apple\): one wrong answer goes · 1 left/);
  eat.click();
  assert.equal(sheet.querySelectorAll('.opt[hidden]').length, 1, 'one answer is gone');
  assert.ok(!sheet.querySelector(`.opt[data-i="${game.run('__q.answerIdx')}"]`).hidden, 'never the right one');
  assert.equal(sheet.querySelector('[data-a=eat]'), null);
  assert.equal(game.run("S.bag['苹果']"), 0);
});

test('an animal that lives on a cliff is met on a cliff', async () => {
  const game = loadGame({dom: true, save: {version: 17, started: true, w: knowsSome(), tips: {syllables: 1}}});   // (the goat's tip had: tests/home-name.test.js)
  game.run("encounter({id: 'goat', hz: '山羊', img: portrait('goat'), wild: true, home: '山'})");
  await tick();
  assert.ok(game.el('#sheet').querySelector('.scene').classList.contains('cliff'));
});

test('the end of an encounter: a new friend, an old friend, or the animal going away', async () => {
  const end = async (friends, right) => {
    const game = loadGame({save: {version: 17, started: true, w: knowsSome(), friends}});
    game.run(`globalThis.__end = null; pictureQ = () => Promise.resolve(${right}); tipCard = () => Promise.resolve(); infoBox = (who, html) => { __end = who + html; return Promise.resolve(); };
      globalThis.__run = encounter({id: 'rabbit', hz: '兔子', img: '', wild: true});`);
    await game.run('__run');
    return game.run('__end');
  };
  assert.match(await end([], true), /⭐ New friend[\s\S]*The 兔子 \(rabbit\) is now your 朋友 \(friend\)! \+3 🐚/);
  assert.match(await end(['rabbit'], true), /♥ Friends[\s\S]*You played with your 朋友 \(friend\), the 兔子 \(rabbit\)!/);
  const away = await end([], false);
  assert.match(away, /0 of 3[\s\S]*went back to the 草 \(grass\)/);
  assert.match(away, /class="foe gone"/, 'the animal fades away');
});
