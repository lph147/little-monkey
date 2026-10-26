// Chinese is logical, step 1 (23 October 2026): in the prologue, a sheep (羊) takes the fox's place, so you meet 羊, then
// the goat, 山羊 (a mountain sheep); and the fruit trees taught 水果 (fruit) when you looked at them, then the fruit you picked.
// The fox comes in chapter 1, hiding in the hillside's tall grass. Since 24 October 2026 the hungry monkey teaches 水果 as he
// asks for some, and each tree its own fruit.
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

test('the hungry monkey teaches 水果 (fruit) as he asks; each fruit tree teaches its own fruit, sparkling till you know it (24 October 2026)', async () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(FIRST), areas: {1: {elder: 2, hungry: 'not asked', thirsty: 'asked', holding: {}}}, pos: {place: 'meadow', x: 13, y: 6, dir: 'up'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__cards = []; globalThis.__said = []; showNotice = async (w, o) => { __cards.push([w, o && o.note || null]); setSeen(w); }; toast = () => {}");
  g.run("showDialog = async (who, line, o = {}) => { __said.push([line.t.join(''), o.teach || null]); }");
  const sparkles = () => get(g, "AREA.sparkles.filter(s => ['水果', '桃子', '苹果'].includes(s.word) && lvl(s.word) === 0 && (!s.if || matches(s.if))).map(s => [s.word, s.at])");
  assert.deepEqual(sparkles(), [['桃子', [1, 6]], ['苹果', [21, 17]]], 'the peach tree and the apple tree sparkle, for their fruit');
  await play(g, "talk(NPCS.find(n => n.id === 'hungry'))");
  assert.deepEqual(get(g, '__said'), [['我饿了。我要吃水果！', '水果'], ['水果在树上。', null]], 'he asks for some fruit, with 水果 in bold, then says it grows on the trees');
  assert.deepEqual(get(g, '__cards'), [['水果', null]], 'and teaches it: 吃 waits till you give him the fruit');
  assert.equal(g.run("lvl('吃')"), 0);
  g.run("S.pos = {place: 'meadow', x: 2, y: 6, dir: 'left'}; placePlayer()");
  assert.equal(g.run('promptFor(1, 6)'), 'Pick', 'a peach tree: A picks one');
  await play(g, 'interact(1, 6)');
  assert.deepEqual(get(g, '__cards.slice(1)'), [['桃子', 'You pick one from the tree.']], 'teaching 桃子 as you pick it');
  assert.equal(get(g, 'here().holding.hungry'), '桃子');
  assert.deepEqual(sparkles(), [['苹果', [21, 17]]], 'the peach tree has stopped sparkling');
  assert.deepEqual(get(g, "[tileAt(1, 6).word, tileAt(21, 17).word, tileAt(21, 17).note]"), ['桃子', '苹果', 'Ripe apples hang from its branches.']);
  assert.deepEqual(get(g, "[alike('水果', '桃子'), alike('水果', '苹果')]"), [true, true], 'fruit, a peach and an apple are never two answers in the same question');
});

test('before he asks, A at a fruit tree just looks, teaching its fruit', async () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(FIRST), areas: {1: {elder: 2}}, pos: {place: 'meadow', x: 2, y: 6, dir: 'left'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__cards = []; showNotice = async (w, o) => { __cards.push([w, o && o.note || null]); setSeen(w); }; toast = () => {}");
  assert.equal(g.run('promptFor(1, 6)'), 'Look');
  await play(g, 'interact(1, 6)');
  assert.deepEqual(get(g, '__cards'), [['桃子', 'Ripe peaches hang from its branches.']]);
  assert.equal(get(g, 'here().holding.hungry || null'), null, 'nothing picked');
});

test('when you give him the fruit he wants, he teaches 吃 (eat), just before you say 我要吃…', async () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing([...FIRST, '水果', '桃子', '苹果', '对不起']),
    areas: {1: {elder: 2, hungry: 'asked', wanted: {hungry: '苹果'}, holding: {hungry: '苹果'}}}, pos: {place: 'meadow', x: 13, y: 6, dir: 'up'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__cards = []; globalThis.__gap = null; showNotice = async (w, o) => { __cards.push([w, o && o.note || null]); setSeen(w); }; toast = () => {}");
  g.run("showDialog = async () => {}; replyWith = async () => false; gapQ = async q => { __gap = q.t.join(''); return true; }");
  await play(g, "talk(NPCS.find(n => n.id === 'hungry'))");
  assert.deepEqual(get(g, '[__cards, __gap, here().hungry]'), [[['吃', '吃 means to eat.']], '我要吃苹果', 'done']);
});

test('a game that helped the hungry monkey without learning 水果: a ! over him, and he teaches it', async () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing([...FIRST, '桃子', '苹果', '吃', '要', '我', '没关系']),
    areas: {1: {elder: 2, hungry: 'done', thirsty: 'done', hungryGame: 1}}, pos: {place: 'meadow', x: 13, y: 6, dir: 'up'}}});   // (his word game played: tests/meadow-games.test.js)
  g.run("mode = 'play'; save = () => {}; globalThis.__cards = []; globalThis.__said = []; showNotice = async (w, o) => { __cards.push([w, o && o.note || null]); setSeen(w); }; toast = () => {}");
  g.run("showDialog = async (who, line, o = {}) => { __said.push([line.t.join(''), o.teach || null]); }; showNarration = async () => {}");
  const hungry = "NPCS.find(n => n.id === 'hungry')";
  assert.ok(g.run(`hasNews(${hungry})`), 'a ! over him');
  await play(g, `talk(${hungry})`);
  assert.deepEqual(get(g, '[__said, __cards]'), [[['水果在树上。', '水果']], [['水果', 'Peaches and apples are both fruit.']]]);
  assert.ok(!g.run(`(lastTalk = null, hasNews(${hungry}))`), 'then the ! goes');
});

test('the big monkey in the meadow says who he is, teaching 我 (I), once you’ve met the old monkey', async () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(FIRST), areas: {1: {elder: 2}}, pos: {place: 'meadow', x: 4, y: 10, dir: 'right'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__cards = []; globalThis.__said = []; globalThis.__replies = []; showNotice = async (w, o) => { __cards.push([w, o && o.note || null]); setSeen(w); }; toast = () => {}");
  g.run("showDialog = async (who, line, o = {}) => { __said.push([line.t.join(''), o.teach || null]); }; replyWith = async w => { __replies.push(w); return true; }");
  const big = "NPCS.find(n => n.id === 'big')";
  assert.ok(g.run(`hasNews(${big})`), 'a ! over him');
  await play(g, `talk(${big})`);
  assert.deepEqual(get(g, '[__said, __cards, __replies]'), [[['你好！我是大猴子。', '我']], [['我', '我 means I or me.']], ['你好']]);
  g.run('lastTalk = null; __said = []');
  assert.ok(!g.run(`hasNews(${big})`), 'then the ! goes');
  await play(g, `talk(${big})`);
  assert.deepEqual(get(g, '__said'), [['你好！', null]], 'and he says hello');
});
