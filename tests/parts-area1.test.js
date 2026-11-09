// Flower Fruit Mountain's journey and the story's parts (decided 5 November 2026, as in the human world: tests/parts.test.js):
// the goal at the top of the Tasks page, changing as the story goes on; each part's card as it begins; the story's own tasks
// first, with a gold star, the rest under Also; and the checklist just the part you're in, with anything from before still
// to do, such as an animal you haven't found. A game from before the story had parts starts at the part it's reached.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 400 && !done; i++){ await tick(); g.flush(); } await p; }
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '水', '河', '鱼', '鸟', '猴子', '朋友', '我', '要', '吃', '喝'];
const AT_SCHOOL = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2};
const FEAST = {...AT_SCHOOL, feast: 3, bowls: 'done', tableware: 2, flowers: 'done', schoolFlowers: true, shop: 3};
const PART = id => `PARTS.findIndex(p => p.id === '${id}')`;
function game(area = {}, pos = {place: 'meadow', x: 9, y: 4, dir: 'up'}, more = {}){
  const w = Object.fromEntries([...KNOWN, ...(more.words || [])].map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 34, started: true, w, met: more.met || [], areas: {1: area}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__boxes = []; globalThis.__notes = []");
  g.run("infoBox = async (who, html) => { __boxes.push(html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; SFX.rumble = () => {}");
  g.run('placePlayer()');
  return g;
}
const goal = g => get(g, 'textNow(AREA.goal)');

test('your journey: where the story is going, as it goes on', () => {
  assert.equal(goal(game({part: -1})), 'Find your place in the troop, on the mountain where you were born.', 'just born');
  assert.equal(goal(game({elder: 2, gate: true, climb: 4, story: true, cave: 1})), 'Be brave, and become the troop’s king.', 'dared to jump through the waterfall');
  assert.equal(goal(game(AT_SCHOOL)), 'Make the troop’s new home ground a good place to live.', 'chapter 1');
  assert.equal(goal(game(FEAST)), 'Get everything ready for the troop’s great feast.', 'the feast announced');
  assert.equal(goal(game({...FEAST, exam: 1, feastHeld: 1, raft: 1})), 'Sail across the sea, to find the immortals, who never grow old.', 'after the feast');
});

test('as the rocks roll away, the next part’s card: where does the river come from?', async () => {
  const g = game({elder: 2, hungry: 'done', thirsty: 'done', meadowCheck: 1, part: 0}, undefined, {met: ['rabbit', 'sheep', 'squirrel']});
  assert.equal(get(g, 'partNow().id'), 'meadow');
  await play(g, 'runEvents()');
  assert.equal(get(g, 'here().gate'), true, 'the rocks roll away');
  assert.deepEqual(get(g, '__boxes'), ['Part 2 Up the river The way up the mountain is open! Where does the river come from? Nobody in the troop has ever been to the top.']);
  assert.equal(get(g, 'partNow().id'), 'river');
  await play(g, 'runEvents()');
  assert.equal(get(g, '__boxes.length'), 1, 'once');
});

test('the Tasks page in the feast: your journey and the part, then the story’s tasks first, with a gold star, the rest under Also', () => {
  const g = game({...FEAST, bees: 1, hide: {spot: 'table', wrong: 0, won: 0, last: 'table'}, part: 6}, {place: 'homeGround', x: 13, y: 12, dir: 'up'});
  g.run('tasksPage(() => {})');
  const sheet = g.el('#sheet');
  assert.ok(sheet.querySelector('.journey .storybtn'), 'with Story so far ▸, every part you’ve reached');
  assert.match(sheet.querySelector('.journey').textContent.replace('Story so far ▸', '').replace(/\s+/g, ' ').trim(), /^Your journey Get everything ready for the troop’s great feast\. ?Part 3: Food for the feast\.$/, 'the goal and the part (what to do: the tasks, below)');
  const items = sheet.querySelectorAll('.tasks li').map(li => (li.classList.contains('main') ? '* ' : '') + li.textContent.replace(/\s+/g, ' ').trim());
  assert.match(items[0], /^\* Follow the stream east, along the riverside, to find where bees live/, 'the story’s task first');
  const also = items.indexOf('Also');
  assert.ok(also > 0, 'then the rest, under Also');
  assert.ok(items.slice(also + 1).some(t => t.startsWith('Find where the little monkey is hiding')), 'such as hide and seek');
  assert.ok(items.slice(also + 1).every(t => !t.startsWith('*')));
});

test('with nothing for the story to do just now, the part says what you’re doing in it', () => {
  const g = game({...AT_SCHOOL, part: 5}, {place: 'school', x: 7, y: 3, dir: 'up'});
  g.run('tasksPage(() => {})');
  assert.match(g.el('#sheet').querySelector('.journey').textContent.replace(/\s+/g, ' '), /Part 2: The school\. Learn your numbers and colours at the school\.$/);
});

test('the checklist: the part you’re in, and anything from before still to do; never what’s done there, nor what’s to come', () => {
  const g = game({...FEAST, part: 6}, {place: 'homeGround', x: 13, y: 12, dir: 'up'}, {met: ['rabbit', 'sheep', 'squirrel', 'goat', 'deer']});
  const items = get(g, 'areaChecklist().map(c => c[0])');
  assert.ok(items.includes('Play hide and seek with a little monkey'), 'the feast’s part');
  assert.ok(items.some(t => /hiding on the hillside/.test(t)), 'the hillside’s animal, from the first part, not found yet');
  assert.ok(!items.some(t => /^Plant/.test(t)), 'not the flowers, planted');
  assert.ok(!items.some(t => /exam|Sail/.test(t)), 'nor the exam, or sailing away, still to come');
  assert.equal(get(g, 'chapterDone()'), false, 'chapter 1 is the whole chapter’s list, though it shows a part');
});

test('a game from before the story had parts starts at the part it’s reached, without its card; the next part’s card shows as it begins', async () => {
  const g = game(FEAST, {place: 'school', x: 7, y: 6, dir: 'up'});
  assert.equal(get(g, 'here().part'), null, 'from before parts');
  await play(g, 'runEvents()');
  assert.equal(get(g, 'partNow().id'), 'feast');
  assert.deepEqual(get(g, '__boxes'), [], 'no card: it began before');
  g.run('Object.assign(here(), {bees: 11, milkTable: 3, melonPlanted: 4, grapePlanted: 4, bananaPlanted: 4, fishTable: 1, shrimpTable: 1, crabTable: 1})');   // (every food on the feast's tables)
  await play(g, 'runEvents()');
  assert.equal(get(g, 'partNow().id'), 'exam');
  assert.match(get(g, '__boxes')[0], /^Part 4 The feast The feast is ready/);
});

test('the story’s parts, in order, and every item on the checklist in one of them', () => {
  const g = loadGame({dom: true});
  assert.deepEqual(get(g, 'PARTS.map(p => p.chapter + " " + p.id)'), ['0 meadow', '0 river', '0 falls', '0 king', '1 homeGround', '1 school', '1 feast', '1 exam', '1 sail']);
  assert.ok(get(g, 'AREA.checklist.every(c => c.part)'), 'each item in a part');
  assert.equal(get(g, `here().part`), -1, 'a new game: not into a part yet');
  assert.equal(get(g, PART('sail')), 8);
});
