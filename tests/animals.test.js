// Who you meet: animals you haven't met jump out most, then animals whose names are due for review,
// and the little monkey shows a ! while it has a word to teach you.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const LATER = Date.now() + 5 * 86400000;
const ALL = ['rabbit', 'fox', 'squirrel', 'goat'];
const NAMES = {'兔子': 'rabbit', '狐狸': 'fox', '松鼠': 'squirrel', '山羊': 'goat'};
const word = (due, lv = 1) => ({lv, due, ok: 1});

function picks(save, n = 2000){
  const game = loadGame({save: {version: 5, started: true, ...save}});
  return JSON.parse(game.run(`JSON.stringify(Array.from({length: ${n}}, () => pickAnimal().id))`));
}
const share = (list, id) => list.filter(x => x === id).length / list.length;

test('once you have met them all, an animal whose name is due jumps out most often', () => {
  const w = Object.fromEntries(Object.keys(NAMES).map(hz => [hz, word(hz === '狐狸' ? 0 : LATER)]));
  const got = picks({met: ALL, w});
  assert.ok(share(got, 'fox') > 0.7, `the fox is due, so it should be picked most (it was ${share(got, 'fox')})`);
  for (const id of ['rabbit', 'squirrel', 'goat']) assert.ok(share(got, id) > 0.02, `${id} should still turn up sometimes`);
});

test('an animal you have not met yet still comes first', () => {
  const w = Object.fromEntries(Object.keys(NAMES).map(hz => [hz, word(0)]));   // all due
  const got = picks({met: ['rabbit', 'fox', 'squirrel'], w});
  assert.ok(share(got, 'goat') > 0.7, `the goat hasn't been met, so it should be picked most (it was ${share(got, 'goat')})`);
});

test('with nothing due, every animal is as likely as the others', () => {
  const w = Object.fromEntries(Object.keys(NAMES).map(hz => [hz, word(LATER)]));
  const got = picks({met: ALL, w});
  for (const id of ALL) assert.ok(Math.abs(share(got, id) - 0.25) < 0.06, `${id} was picked ${share(got, id)} of the time`);
});

test('the little monkey shows a ! until it has taught you 猴子 and 朋友', () => {
  const bubble = save => loadGame({save: {version: 5, started: true, ...save}}).run("(AREA.bubbles.playful.find(x => matches(x.if)) || {show: ''}).show");
  const area = elder => ({areas: {1: {elder, hungry: 'not asked', thirsty: 'not asked', gate: false, story: false, holding: {}, done: false}}});
  assert.equal(bubble(area(0)), '', 'not before you have said hello to the old monkey');
  assert.equal(bubble(area(1)), '!', 'it has 猴子 to teach');
  assert.equal(bubble({...area(1), w: {'猴子': word(0)}}), '!', 'it has 朋友 to teach');
  assert.equal(bubble({...area(2), w: {'猴子': word(0), '朋友': word(0)}}), '', 'nothing left to teach');
});

test('an animal never asks about its own name (it\'s on the screen), and friendship shows as hearts', async () => {
  const w = Object.fromEntries(['兔子', '山', '花', '草', '树'].map(hz => [hz, word(0)]));
  const game = loadGame({save: {version: 16, started: true, w}});
  game.run(`globalThis.__asked = []; globalThis.__heads = [];
    pictureQ = o => { __asked.push(o.word || null); __heads.push(o.head); return Promise.resolve(true); };   // answer every question right, at once
    infoBox = () => Promise.resolve();
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
    infoBox = () => Promise.resolve();
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

test('an animal that lives on a cliff is met on a cliff', async () => {
  const game = loadGame({dom: true, save: {version: 17, started: true, w: knowsSome()}});
  game.run("encounter({id: 'goat', hz: '山羊', img: portrait('goat'), wild: true, home: '山'})");
  await tick();
  assert.ok(game.el('#sheet').querySelector('.scene').classList.contains('cliff'));
});

test('the end of an encounter: a new friend, an old friend, or the animal going away', async () => {
  const end = async (friends, right) => {
    const game = loadGame({save: {version: 17, started: true, w: knowsSome(), friends}});
    game.run(`globalThis.__end = null; pictureQ = () => Promise.resolve(${right}); infoBox = (who, html) => { __end = who + html; return Promise.resolve(); };
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
