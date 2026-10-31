// The feast's quests in any order (decided 31 October 2026). The exam, and then the feast and the raft, wait for every food
// on the feast's tables (FEAST_READY in the area file: honey; milk, yoghurt and cheese; the garden's three fruits; the fish,
// the shrimp and the crab), not just the crab, the end of the hungry monkey's requests: a game that did those first sat
// down to the feast with the cow still lost and no garden. And the big fish no longer waits for the honey: the hungry
// monkey asks for it once you've found the bees' valley (but not as soon as he's sent you for the bees).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const START = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, shop: 3, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bowls: 'done', tableware: 2};
const ALL_DONE = {bees: 11, beeFriends: 6, queenOut: true, honey: 'done', cow: 9, milk: 'done', milkTable: 3, dairy: 5, garden: 1, melonSeeds: 'done', grapeSeeds: 'done',
  bananaSeeds: 'done', melonPlanted: 4, grapePlanted: 4, bananaPlanted: 4, fruitTable: 1, fish: 'done', fishTable: 1, shrimp: 'done', shrimpTable: 1, crab: 'done', crabTable: 1};
const SEA_ONLY = {bees: 11, beeFriends: 6, queenOut: true, honey: 'done', fish: 'done', fishTable: 1, shrimp: 'done', shrimpTable: 1, crab: 'done', crabTable: 1};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水', '河', '鱼', '鸟', '猴子', '桌子', '有', '没有', '我', '要', '吃', '蜜蜂', '没关系', '水果'];
function game(area, pos = {place: 'homeGround', x: 20, y: 7, dir: 'left'}){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, w, areas: {1: {...START, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; placePlayer(); globalThis.__said = []; showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async () => {}; toast = () => {}");
  return g;
}
const bubble = (g, id) => g.run(`(AREA.bubbles['${id}'].find(b => matches(b.if)) || {show: null}).show`);
const ids = g => get(g, 'getTasks().map(t => t.id)');

test('every food on the tables: the exam is ready, the teacher has a !, and it’s on the checklist', () => {
  const g = game(ALL_DONE);
  assert.ok(ids(g).includes('exam'));
  assert.equal(bubble(g, 'elder'), '!');
  assert.ok(get(g, "areaChecklist().some(([t, , , shown]) => /exam/.test(t) && shown)"));
});

test('the crab before the cow and the garden: no exam yet, and your tasks point you to what the feast still needs', () => {
  const g = game(SEA_ONLY);
  assert.ok(!ids(g).includes('exam'), 'the exam waits');
  assert.equal(g.run('matches(AREA.bubbles.elder[0].if)'), false, 'no ! over the teacher for it');
  assert.ok(!get(g, "areaChecklist().some(([t, , , shown]) => /exam/.test(t) && shown)"), 'nor on the checklist yet');
  assert.equal(bubble(g, 'thirsty'), '!', 'the thirsty monkey’s news of the lost cow is still waiting');
  assert.equal(bubble(g, 'big'), '!', 'and the big monkey’s garden');
  const cowHome = game({...SEA_ONLY, cow: 9, milk: 'done', milkTable: 3, dairy: 5, garden: 1, melonPlanted: 4, grapePlanted: 4, bananaPlanted: 2});
  assert.ok(!ids(cowHome).includes('exam'), 'with the bananas still growing, the exam still waits');
  assert.match(get(cowHome, "AREA.hints.find(h => h.if.crabTable && matches(h.if)).text"), /The feast still needs more food/);
});

test('the big fish no longer waits for the honey: once you’ve found the bees’ valley, the hungry monkey asks for it', async () => {
  const sent = game({bees: 1});
  assert.equal(bubble(sent, 'hungry'), null, 'not as soon as he’s sent you for the bees');
  const found = game({bees: 2});
  assert.equal(bubble(found, 'hungry'), '!', 'once you’ve found the bees’ valley');
  let done = false; const p = Promise.resolve(found.run('interact(19, 7)')).then(() => { done = true; });
  for (let i = 0; i < 200 && !done; i++){ await new Promise(r => setImmediate(r)); found.flush(); }
  await p;
  assert.deepEqual(get(found, '__said'), ['我要吃大鱼！'], 'just the fish: no 我们有蜂蜜了！ (we have honey now), as there isn’t any yet');
  assert.equal(get(found, 'here().fish'), 'asked');
  assert.ok(ids(found).includes('bees2') && ids(found).includes('fishRod'), 'the bees and the fish, both on the go');
});
