// Chinese is logical, step 1 (23 October 2026): in the prologue, a sheep (羊) takes the fox's place, so you meet 羊, then
// the goat, 山羊 (a mountain sheep); and the fruit trees teach 水果 (fruit) when you look at them, then the fruit you pick.
// The fox comes in chapter 1, hiding in the hillside's tall grass.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knowing = words => Object.fromEntries(words.map(hz => [hz, {lv: 1, due: 0, ok: 0}]));
const FIRST = ['石头', '你好', '山', '花', '草', '树', '动物'];   // a game in the meadow, once the old monkey has told you about animals
const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
// A game in chapter 1 from before the sheep: it met the fox in the meadow, as the prologue's animal.
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2, build: 1, wood: 'asked', stones: 'asked'};
// Runs code in the game and waits for it, letting its timers run (such as an animal hopping out).
async function play(g, code){
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 200 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}

test('the prologue’s four animals: the rabbit in the tall grass, a sheep at the foot of the cliffs by your stone, the squirrel and the goat', async () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(FIRST), areas: {1: {elder: 2}}, pos: {place: 'meadow', x: 3, y: 5, dir: 'up'}}});
  assert.deepEqual(get(g, 'chapterAnimals(0).map(a => a.id)'), ['rabbit', 'sheep', 'squirrel', 'goat']);
  assert.deepEqual(get(g, 'GRASS_ANIMALS.filter(a => a.chapter === 0).map(a => a.id)'), ['rabbit'], 'only the rabbit hides in the grass now');
  assert.equal(get(g, 'animalAt(3, 4).hz'), '羊', 'the sheep stands at its own spot');
  assert.equal(g.run('promptFor(3, 4)'), 'Meet');
  assert.ok(!g.run('walkable(3, 4)'), 'you can’t walk through it');
  assert.ok(get(g, 'alike("羊", "山羊") && alike("山羊", "羊")'), 'a sheep and a goat are look-alikes: never two answers in the same question');
  g.run("globalThis.__cards = []; showNotice = async (w, o) => { __cards.push([w, o && o.note]); setSeen(w); }; showDialog = async () => {}; encounter = async () => true");
  await play(g, 'interact(3, 4)');
  assert.deepEqual(get(g, '__cards'), [['羊', 'A sheep is eating grass at the foot of the 山 (mountain). Answer its questions to make friends.']], 'meeting it teaches 羊');
  assert.deepEqual(get(g, 'S.met'), ['sheep']);
});

test('the fox hides only in the hillside’s tall grass, as chapter 1’s animal there; the rabbit hides anywhere', () => {
  const g = loadGame({save: {version: 29, started: true, w: knowing(FIRST), met: ['rabbit'], areas: {1: CHAPTER_ONE}}});
  const hiding = place => [...new Set(get(g, `(enterPlace('${place}'), Array.from({length: 300}, () => { rustle = null; stepsSince = HIDE_AFTER; hideAnimal(); return rustle && rustle.a.id; }))`))].sort();
  assert.deepEqual(hiding('meadow'), ['rabbit'], 'in the meadow, just the rabbit');
  assert.deepEqual(hiding('hillside'), ['fox', 'rabbit'], 'on the hillside, the fox too');
  assert.deepEqual(get(g, '[chapterAnimals(1, "hillside").map(a => a.id), chapterAnimals(1, "pineWood").map(a => a.id)]'), [['fox'], ['deer']], 'each counted on its own');
  assert.deepEqual(get(g, '[counter("hillAnimalsLeft"), counter("woodAnimalsLeft")]'), [1, 1]);
  const item = () => get(g, 'areaChecklist().find(([t]) => /hiding on the hillside/.test(t))');
  assert.deepEqual(item().slice(0, 2), ['Find the 动物 (animal) hiding on the hillside', false], 'on chapter 1’s checklist');
  g.run("S.met.push('fox')");
  assert.equal(item()[1], true, 'found');
});

test('a game already in chapter 1 when the sheep came (it met the fox in the meadow): no prologue task, the fox still a friend, the hillside’s animal ticked off', () => {
  const g = loadGame({save: {version: 29, started: true, w: knowing([...FIRST, '兔子', '狐狸', '松鼠', '山羊']), met: ['rabbit', 'fox', 'squirrel', 'goat'],
    friends: ['rabbit', 'fox', 'squirrel', 'goat'], areas: {1: CHAPTER_ONE}, pos: {place: 'homeGround', x: 15, y: 5, dir: 'up'}}});
  assert.deepEqual(get(g, '[counter("found"), counter("animals")]'), [3, 4], 'the sheep is new to it');
  assert.ok(!get(g, 'getTasks().map(t => t.id)').includes('animals'), 'but the prologue’s task to find the animals stays in the prologue');
  assert.ok(!get(g, "AREA.talk.troop1.find(p => !p.if || matches(p.if)).do.map(s => s.say)").includes('findAnimals'), 'and no monkey sends you to look for animals');
  assert.equal(get(g, 'FRIEND_NAMES.fox'), '狐狸', 'the fox is still a friend, with its name');
  assert.equal(get(g, 'areaChecklist().find(([t]) => /hiding on the hillside/.test(t))[1]'), true, 'and it counts as the hillside’s animal');
  g.run("enterPlace('meadow')");
  assert.equal(get(g, 'animalAt(3, 4).hz'), '羊', 'go back down to the meadow, and the sheep is there to meet');
});

test('a fruit tree shows you 水果 (fruit) first, then picking teaches its fruit; the trees sparkle for 水果 once you know 水 (water)', async () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(FIRST), areas: {1: {elder: 2, hungry: 'asked', thirsty: 'asked', holding: {}}}, pos: {place: 'meadow', x: 2, y: 6, dir: 'left'}}});
  const sparkles = () => get(g, "AREA.sparkles.filter(s => s.word === '水果' && (!s.if || matches(s.if))).map(s => s.at)");
  assert.deepEqual(sparkles(), [], 'no sparkle before you know 水');
  g.run("setSeen('水')");
  assert.deepEqual(sparkles(), [[1, 6], [21, 17]], 'then the peach tree and the apple tree sparkle');
  g.run("globalThis.__cards = []; showNotice = async (w, o) => { __cards.push([w, o && o.note]); setSeen(w); }; toast = () => {}");
  assert.equal(g.run('promptFor(1, 6)'), 'Look');
  await play(g, 'interact(1, 6)');
  assert.deepEqual(get(g, '__cards'), [['水果', 'Ripe fruit hangs from its branches.']], 'its word first: fruit');
  assert.equal(get(g, 'here().holding.hungry || null'), null, 'nothing picked yet');
  assert.equal(g.run('promptFor(1, 6)'), 'Pick');
  await play(g, 'interact(1, 6)');
  assert.deepEqual(get(g, '__cards.map(c => c[0])'), ['水果', '桃子'], 'then the peach, as you pick it');
  assert.equal(get(g, 'here().holding.hungry'), '桃子');
  assert.deepEqual(get(g, "[alike('水果', '桃子'), alike('水果', '苹果')]"), [true, true], 'fruit, a peach and an apple are never two answers in the same question');
});
