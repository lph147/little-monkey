// Nowhere to get stuck in Area 3, the Eastern Sea (16 November 2026, the build plan's last step): every place, at points all
// through Chapters 5 and 6, can be walked through from every way in (and from where you land, dream or wake, with no way
// in: the seabed, the underworld, beside your bed), to every way out, everyone standing there and everything with something
// to do; and there's always a main task.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');
const {stuckCode} = require('./stuck-check');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
// The story, a point at a time, each with where you'd be
const POINTS = [];
const at = (name, add, pos) => { const before = POINTS.length ? POINTS[POINTS.length - 1].state : {landed: 1}; POINTS.push({name, state: {...before, ...add}, pos}); };
at('landed', {}, ['seabed', 11, 6]);
at('the starfish', {turtle: 2}, ['seabed', 6, 12]);
at('the seaweed forest', {turtle: 3, starFriends: 5, forest: 1}, ['forest', 3, 7]);
at('the coral reef', {octopus: 1}, ['reef', 2, 7]);
at('the trench', {dolphin: 2, trench: 1}, ['trench', 4, 9]);
at('the palace gate', {trench: 2, palace: 1}, ['palace', 12, 12]);
at('the throne hall', {palace: 3, hall: 1, weapon: '刀'}, ['hall', 8, 9]);
at('the treasury', {hall: 3, staff: 2}, ['treasury', 7, 7]);
at('the dragon kings’ gifts', {staff: 4, weapon: '金箍棒', gifts: 3}, ['hall', 8, 7]);
at('swimming home', {gifts: 4, south: 1, west: 1, north: 1, home: 1}, ['seabed', 11, 6]);
at('home', {home: 3, chapter: 1}, ['ffmHomeGround', 6, 9]);
at('the staff around the mountain', {ear: 1}, ['ffmMeadow', 10, 12]);
at('the bridge to the island', {spotTree: 1, spotBoulder: 1, bridge: 1, spotIslet: 1}, ['ffmMeadow', 13, 10]);
at('the dream', {spotCrack: 1, spotTrainee: 1, feast: 1, dream: 1}, ['underworld', 7, 12]);
at('the ten kings', {dream: 3}, ['underworld', 7, 5]);
at('woken up', {dream: 5, invite: 1}, ['ffmCave', 1, 2]);
at('the end of Area 3', {invite: 3}, ['ffmHomeGround', 6, 9]);
const LANDINGS = {seabed: [[11, 6]], underworld: [[7, 12]], ffmCave: [[7, 7], [1, 2]]};   // (the dive; the dream; home from the sea, and waking)

const game = (state, [place, x, y]) => {
  const g = loadGame({dom: true, save: {version: 42, started: true, area: 3, w: {}, areas: {1: {chapter: 1, raft: 3, done: true}, 2: {ch2: 1}, 3: state}, pos: {place, x, y, dir: 'down'}}});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  return g;
};

for (const {name, state, pos} of POINTS) test(`nowhere to get stuck, ${name}: every way in leads out, and to everyone and everything there`, () => {
  assert.deepEqual(get(game(state, pos), stuckCode(LANDINGS)), {});
});

test('there’s always a main task, all through the Eastern Sea', () => {
  for (const {name, state, pos} of POINTS){
    const main = get(game(state, pos), 'getTasks().filter(t => t.main).map(t => t.id)');
    assert.ok(main.length, `${name}: a main task`);
  }
});

test('every place in the Eastern Sea has a way in: a way from another place, or somewhere you land', () => {
  const g = game(POINTS[0].state, POINTS[0].pos);
  const into = get(g, '[...new Set(Object.values(PLACES).flatMap(p => (p.exits || []).map(e => e.to)))]');
  const own = get(g, 'Object.keys(PLACES).filter(k => !PLACES[k].borrowed)');
  for (const id of own) assert.ok(into.includes(id) || LANDINGS[id], `${id}: a way in`);
});
