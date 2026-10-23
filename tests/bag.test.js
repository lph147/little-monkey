// The bag (包) and fruit (18 October 2026): a peach brings a heart back, an apple takes away a wrong answer. Fruit trees
// fill your bag once the hungry monkey has eaten, and friends give fruit when you win their word games.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knows = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
const WORDS = knows(['石头', '山', '花', '草', '树', '水果', '桃子', '苹果', '河', '水', '松鼠', '山羊', '棍子']);
function game(save = {}){
  const g = loadGame({dom: true, save: {version: 25, started: true, w: WORDS, areas: {1: {elder: 2, hungry: 'done', thirsty: 'asked', gate: true, climb: 1}}, ...save}});
  g.run("mode = 'play'; placePlayer(); say = () => {}; toast = m => { globalThis.__said = m; }");
  return {g, run: code => g.run(code), sheet: g.el('#sheet'), get: expr => JSON.parse(g.run(`JSON.stringify(${expr})`))};
}

test('the bag shows your food (how many, and what it does), your stick, and what you’re carrying for someone', () => {
  const {run, sheet} = game({bag: {'桃子': 2, '苹果': 1}, areas: {1: {elder: 2, hungry: 'done', thirsty: 'asked', gate: true, climb: 1, holding: {thirsty: '水'}}}});
  run('openMenu()');
  sheet.querySelector('[data-m="bag"]').click();
  assert.deepEqual(sheet.querySelectorAll('.bagitem').map(b => b.dataset.w), ['桃子', '苹果', '棍子', '水']);
  const text = sheet.textContent;
  for (const s of ['×2', '×1', 'Brings a heart back', 'Takes away a wrong answer', 'To fight with', 'For the thirsty monkey']) assert.ok(text.includes(s), `it says ${s}`);
  assert.equal(sheet.querySelector('.bagitem').dataset.label, 'Eat', 'A eats a peach');
});

test('tapping a peach when you’re hurt eats it, and a heart comes back; with full hearts it stays in the bag', () => {
  const {run, sheet, get} = game({hearts: 3, bag: {'桃子': 2}});
  run('bagPage(() => {})');
  sheet.querySelector('.bagitem[data-w="桃子"]').click();
  assert.equal(get('S.hearts'), 4);
  assert.equal(get("S.bag['桃子']"), 1);
  assert.match(sheet.textContent, /You eat a 桃子 \(peach\): a heart comes back/);
  const full = game({hearts: 5, bag: {'桃子': 2}});
  full.run('bagPage(() => {})');
  full.sheet.querySelector('.bagitem[data-w="桃子"]').click();
  assert.equal(full.get("S.bag['桃子']"), 2, 'not eaten');
  assert.match(full.sheet.textContent, /Your hearts are full/);
});

test('an empty bag says where things come from', () => {
  const {run, sheet} = game({areas: {1: {elder: 2, hungry: 'asked', gate: false, climb: 0}}, w: knows(['石头'])});
  run('bagPage(() => {})');
  assert.equal(sheet.querySelectorAll('.bagitem').length, 0);
  assert.match(sheet.textContent, /Nothing in your bag yet/);
});

test('once the hungry monkey has eaten, a fruit tree gives you one for your bag each time you come, up to 3', () => {
  const {run, get} = game({pos: {place: 'meadow', x: 2, y: 6, dir: 'left'}});
  assert.equal(get('tileAt(1, 6).look'), 'peachTree');
  assert.equal(get('promptFor(1, 6)'), 'Pick');
  run('interact(1, 6)');
  assert.equal(get("S.bag['桃子']"), 1);
  run('interact(1, 6)');
  assert.equal(get("S.bag['桃子']"), 1, 'no more ripe ones on that tree, for now');
  assert.match(get('__said'), /Come back another time/);
  run("enterPlace('path'); enterPlace('meadow'); interact(1, 6); interact(1, 8)");
  assert.equal(get("S.bag['桃子']"), 3, 'come back, and they’re ripe again');
  run("enterPlace('path'); enterPlace('meadow'); interact(1, 6)");
  assert.equal(get("S.bag['桃子']"), 3, 'you can carry 3');
  assert.match(get('__said'), /Your bag has 3 桃子/);
});

test('a game that never learned 水果 (fruit), such as one past the meadow on 23 October 2026: A at a fruit tree teaches it, then picks', async () => {
  const {run, get} = game({w: knows(['石头', '山', '花', '草', '树', '桃子', '苹果', '河', '水']), pos: {place: 'meadow', x: 2, y: 6, dir: 'left'}});
  run("globalThis.__cards = []; showNotice = async w => { __cards.push(w); setSeen(w); }");
  assert.equal(get('promptFor(1, 6)'), 'Look', 'its word first');
  await run('interact(1, 6)');
  assert.deepEqual(get('__cards'), ['水果']);
  assert.equal(get("S.bag['桃子'] || 0"), 0, 'nothing picked yet');
  assert.equal(get('promptFor(1, 6)'), 'Pick');
  await run('interact(1, 6)');
  assert.equal(get("S.bag['桃子']"), 1, 'then it fills your bag');
});

test('before the hungry monkey has eaten, the fruit trees are for him, not your bag', async () => {
  const {run, get} = game({pos: {place: 'meadow', x: 2, y: 6, dir: 'left'}, areas: {1: {elder: 2, hungry: 'not asked'}}});
  run('showNotice = async () => {}');
  assert.notEqual(get('promptFor(1, 6)'), 'Pick');
  await run('interact(1, 6)');
  assert.equal(get("S.bag['桃子'] || 0"), 0);
});

test('win a word game with the squirrel and it gives you a peach; the goat gives an apple; lose, and nothing', async () => {
  for (const [who, fruit] of [['squirrel', '桃子'], ['goat', '苹果']]) for (const won of [true, false]){
    const {run, get} = game();
    run(`showDialog = showNarration = async () => {}; confirmBox = async () => true; encounter = async () => ${won}; globalThis.__replied = null; replyWith = async w => { __replied = w; }`);
    await run(`runSteps(AREA.talk.${who}[0].do, '${who}')`);
    assert.equal(get(`S.bag['${fruit}'] || 0`), won ? 1 : 0, `${who}, ${won ? 'won' : 'lost'}`);
    assert.equal(get('__replied'), won ? '谢谢' : null, 'you say thank you for a present');
  }
});
