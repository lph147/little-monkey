// New night animals (the polish plan, agreed 8 November 2026): a bat over the home ground's stream at night, asleep in the
// Water Curtain Cave by day; five fireflies in the riverside's long grass, counted as the bees are, glowing once they're
// your friends; a hedgehog in the meadow; a cricket on the hillside; and in the human world, a moth at the night market's
// lamp, fireflies over the rice fields and bats round the town's lanterns. Each only out after dark.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knows = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
const WORDS = knows(['石头', '山', '花', '草', '树', '动物', '水果', '桃子', '苹果', '河', '水', '鱼', '棍子', '蛇', '羊', '松鼠', '兔子']);
const CH1 = {elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, chapter: 1, cave: 6, shop: 3, home: 2};
function game(pos, save = {}){
  const g = loadGame({dom: true, save: {version: 37, started: true, w: WORDS, areas: {1: CH1}, friends: ['sheep', 'squirrel', 'rabbit'], pos, ...save}});
  g.run("mode = 'play'; placePlayer(); say = () => {}; globalThis.__said = []; toast = m => { __said.push(m); }");
  return {g, run: code => g.run(code), get: expr => JSON.parse(g.run(`JSON.stringify(${expr})`))};
}
const DAY = 'S.clock.t = DAY_MS * .3', NIGHT = 'S.clock.t = DAY_MS * NIGHT + 1';
const hiding = run => JSON.parse(run("JSON.stringify(ANIMALS.filter(a => (!a.at && (!a.hides || a.hides === PLACE)) && inChapter(a) && awakeNow(a)).map(a => a.id))"));

test('the bat: by day, hanging asleep from the Water Curtain Cave’s roof; at night, flitting over the home ground’s stream', () => {
  const cave = game({place: 'cave', x: 7, y: 2, dir: 'up'});
  cave.run(DAY);
  assert.deepEqual(cave.get("(a => [a.hz, a.at, a.place, a.hangs])(ANIMALS.find(a => a.id === 'bat'))"), ['蝙蝠', [7, 1, 'cave'], 'cave', true]);
  assert.equal(cave.run('promptFor(7, 1)'), 'Look', 'asleep');
  cave.run("globalThis.__flip = 0; const ud = upsideDown; upsideDown = s => { __flip++; return ud(s); }; drawWorld(performance.now())");
  assert.ok(cave.run('__flip') >= 1, 'drawn upside down, hanging');
  const home = game({place: 'homeGround', x: 19, y: 17, dir: 'down'});
  home.run(DAY);
  assert.notEqual(home.run('promptFor(19, 18)'), 'Meet', 'not out over the stream by day');
  home.run(NIGHT);
  assert.deepEqual(home.get("ANIMALS.find(a => a.id === 'bat').at"), [19, 18, 'homeGround']);
  assert.equal(home.run('promptFor(19, 18)'), 'Meet', 'at night, out over the stream: A meets it');
});

test('fireflies: five to find in the riverside’s long grass, only at night, counted as the bees are, glowing once they’re out', () => {
  const {run, get} = game({place: 'riverside', x: 10, y: 7, dir: 'down'});
  assert.deepEqual(get("(a => [a.many, a.counts, a.glows, a.hides])(ANIMALS.find(a => a.id === 'firefly'))"), [5, 'fireflyFriends', true, 'riverside']);
  run(DAY);
  assert.ok(!hiding(run).includes('firefly'), 'not by day');
  run(NIGHT);
  assert.ok(hiding(run).includes('firefly'), 'at night, in the long grass');
  assert.equal(run("counter('fireflyCount')"), 0);
  run("here().out = {firefly: [[10, 8, 1]]}; here().fireflyFriends = 1");
  assert.equal(run("counter('fireflyCount')"), 1);
  assert.deepEqual(get('outHere().map(o => o.a.id)'), ['firefly'], 'one out, over the grass');
  run("globalThis.__glows = 0; const ga = glowingAnimals; glowingAnimals = (...a) => { __glows++; return ga(...a); }; drawWorld(performance.now())");
  assert.ok(run('__glows') >= 1, 'glowing at night');
  run(DAY);
  assert.deepEqual(get('outHere().map(o => o.a.id)'), [], 'gone by day');
});

test('the hedgehog snuffles in the meadow’s long grass, and the cricket chirps on the hillside, both after dark', () => {
  const meadow = game({place: 'meadow', x: 5, y: 10, dir: 'down'});
  meadow.run(NIGHT);
  assert.ok(hiding(meadow.run).includes('hedgehog'));
  meadow.run(DAY);
  assert.ok(!hiding(meadow.run).includes('hedgehog'));
  const hill = game({place: 'hillside', x: 10, y: 30, dir: 'down'});
  hill.run(NIGHT);
  assert.ok(hiding(hill.run).includes('cricket'));
});

test('the new words: pictures, their look on the map, and how they’re made where it helps', () => {
  const {get} = game({place: 'meadow', x: 5, y: 10, dir: 'down'});
  for (const w of ['蝙蝠', '萤火虫', '刺猬', '蟋蟀']) assert.ok(get(`!!PICTURES['${w}'] && !!MAP_SPRITES['${w}'] && WORDS['${w}'].category === 'animals'`), w);
  assert.deepEqual(get("MADE['萤火虫'].parts.map(p => p[0])"), ['萤', '火', '虫'], 'glow-worm + fire + insect');
  assert.deepEqual(get("MADE['刺猬'].parts.map(p => p[0])"), ['刺', '猬'], 'spike + hedgehog');
});

test('in the human world: a moth at the night market’s lamp, fireflies over the rice fields, bats round the town’s lanterns', () => {
  const g = loadGame({save: {version: 37, started: true, area: 2, w: {}, pos: {place: 'town', x: 5, y: 10, dir: 'up'}}});
  const run = c => g.run(c);
  run("mode = 'play'; placePlayer()");
  assert.deepEqual(JSON.parse(run("JSON.stringify((a => [a.hz, a.at, a.time, a.glows, a.flutters])(ANIMALS.find(a => a.id === 'moth')))")), ['飞蛾', [5, 9, 'town'], 'night', 'lamp', true]);
  assert.ok(run("!!PICTURES['飞蛾'] && MADE['飞蛾'].parts.map(p => p[0]).join('') === '飞蛾'"), 'its picture; 飞 to fly + 蛾 moth');
  run('S.clock.t = DAY_MS * NIGHT + 1');
  run("globalThis.__bats = 0; const nb = nightBats; nightBats = (...a) => { __bats++; return nb(...a); }; drawWorld(performance.now())");
  assert.ok(run('__bats') >= 1, 'bats round the lanterns at night');
  assert.equal(run('PLACES.fields.fireflies'), true, 'fireflies over the rice fields');
});
