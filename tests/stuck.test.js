// Nowhere to get stuck in Area 2 (the stuck-point audit, 6 November 2026, after playtesters hit walls: gusts you couldn't
// get past, a teacher gone before he'd taught you, the boat leaving early): every place, at several points in the story,
// can be walked through from every way in, to every way out, everyone standing there and everything with something to do;
// the gusts can be crossed up and down; a hen that gets away runs somewhere you can reach; and there's always a main task.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const PROLOGUE = {child: 3, dressed: 2, landed: 1, back: 1};
const STATES = {
  prologue: PROLOGUE,
  years: {...PROLOGUE, years: 1, exchanged: 1, lunch: 'done', askChild: 1, askFisher: 1, askVillager: 1, askFarmer: 1, askGranny: 1, askTea: 1, askTeller: 1},
  ch1: {...PROLOGUE, years: 1, boat: 2, song: 1, chapter: 1, toldSea: 1, woodFetch: 4, door: 2},
  ch2: {...PROLOGUE, years: 1, boat: 2, song: 1, chapter: 2, toldSea: 1, woodFetch: 4, door: 2, sentHome: 1, home2: 1, homeAgain: 1}
};
const game = (area, pos = {place: 'shore', x: 5, y: 5, dir: 'up'}, w = {}) => {
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, w, areas: {1: {raft: 3}, 2: area}, pos}});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  return g;
};

const {stuckCode} = require('./stuck-check');   // (from every way into a place: everywhere you can walk, and what you can't get to)
const STUCK = stuckCode();

for (const [name, state] of Object.entries(STATES)) test(`nowhere to get stuck, ${name}: every way in leads out, and to everyone and everything there`, () => {
  assert.deepEqual(get(game(state), STUCK), {});
});

test('a hen that gets away runs off somewhere you can walk up to', () => {
  const g = game({...PROLOGUE, hen2: 1}, {place: 'village', x: 13, y: 8, dir: 'left'});
  for (let i = 0; i < 40; i++){
    g.run('STEPS.scuttle({}, "hen1")');
    assert.ok(get(g, '(n => [[0, 0], ...Object.values(DV)].some(([dx, dy]) => walkableFromYou().has((n.x + dx) + "," + (n.y + dy))))(NPCS.find(n => n.id === "hen1"))'), 'within reach');
  }
});

test('there’s always a main task: after the birds, after the boatman’s news, away from the climb, away from the demon’s mountain', () => {
  const main = (area, pos, w) => get(game(area, pos, w), 'getTasks().filter(t => t.main).map(t => t.id)');
  const birds = main({...PROLOGUE, askChild: 1, askFisher: 1, askVillager: 1, hensDone: 1, farmer: 1, lunch: 'not asked', shooed: ['b1', 'b2', 'b3', 'b4', 'b5']}, {place: 'fields', x: 10, y: 10, dir: 'up'}, {'狗': {lv: 2, ok: 2}});
  assert.ok(birds.includes('a2birdsDone'), 'the birds gone: back to the farmer');
  assert.ok(main({...STATES.years, askDocker: 1, cargo: 2, toldSea: 1}, {place: 'harbour', x: 16, y: 16, dir: 'right'}).includes('a2sail'), 'ask the boatman to take you');
  assert.ok(main({...STATES.ch1, door: 0}, {place: 'harbour', x: 16, y: 16, dir: 'right'}).includes('c1up'), 'back at the harbour in chapter 1: climb the mountain');
  assert.ok(main({...STATES.ch2, homeAgain: 0, news: 1, d1: 1, d2: 1, d3: 1, north: 1, lairSeen: 1}, {place: 'ffmMeadow', x: 10, y: 10, dir: 'up'}).includes('c2fly'), 'home from the demon’s mountain before it’s done: fly back north');
});

test('the years go by as soon as you’ve asked the town’s three: they teach no new word, so they don’t wait for one', async () => {
  const g = game({...STATES.years, years: 0}, {place: 'town', x: 7, y: 7, dir: 'up'});
  g.run('S.turn = 0; here().wordTurn = 0; storyScene = async () => {}; matchWords = async () => new Set(); showNarration = async () => {}; toast = () => {}');
  let done = false; const p = Promise.resolve(g.run('runEvents()')).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
  assert.equal(get(g, 'here().years'), 1);
});
