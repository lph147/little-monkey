// Places: an area is made of small maps you move between. Flower Fruit Mountain is one place so far, the
// meadow; these tests add a pretend second place to walk to and back.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
const tick = () => new Promise(r => setImmediate(r));
// A small grassy place, joined to the meadow by a way at the end of the path below the stone (9, 5).
function withNook(game, open = true){
  game.run(`AREA.places.nook = {name: {zh: '小地方', py: 'xiǎo dìfang', en: 'The nook'},
      exits: [{at: [1, 2], to: 'meadow', arrive: [9, 6], facing: 'down'}],
      map: ['MMMMM', 'M.ggM', 'M.ggM', 'MMMMM']};
    PLACES.meadow.exits = [{at: [9, 5], to: 'nook', arrive: [1, 1], facing: 'down'${open ? '' : ", if: {gate: true}, closed: 'Not yet.'"}}];
    mode = 'play';`);
}

test('a saved place that no longer exists starts you in the first place', () => {
  const game = loadGame({save: {version: 18, started: true, pos: {place: 'gone', x: 9, y: 4, dir: 'up'}}});
  assert.equal(game.run('PLACE'), 'meadow');
  assert.equal(get(game, 'S.pos.place'), 'meadow');
});

test('every place is at least as big as the screen (15 by 10), so the screen never shows past its edge', () => {
  const game = loadGame();
  const sizes = get(game, 'Object.entries(AREA.places).map(([id, p]) => [id, p.map[0].length, p.map.length])');
  for (const [id, w, h] of sizes) assert.ok(w >= game.run('VW') && h >= game.run('VH'), `${id} is only ${w} by ${h}`);
});

test('the area starts in its first place, the meadow', () => {
  const game = loadGame();
  assert.equal(game.run('PLACE'), 'meadow');
  assert.equal(game.run('FIRST_PLACE'), 'meadow');
  assert.equal(get(game, 'S.pos.place'), 'meadow');
});

test('stepping onto a way to another place takes you there, names it, and remembers it', async () => {
  const game = loadGame({dom: true, save: {version: 18, started: true, pos: {place: 'meadow', x: 9, y: 4, dir: 'down'}}});
  withNook(game);
  game.run('placePlayer(); globalThis.__went = arrive(9, 5)');
  game.flush(); await tick(); game.flush(); await tick();
  assert.equal(game.run('PLACE'), 'nook');
  assert.deepEqual(get(game, 'S.pos'), {place: 'nook', x: 1, y: 1, dir: 'down'});
  assert.deepEqual(get(game, '[pl.x, pl.y, COLS, ROWS]'), [1, 1, 5, 4], 'you stand at the arrival, on the new map');
  assert.match(game.el('#placeName').innerHTML, /小地方[\s\S]*xiǎo dìfang[\s\S]*The nook/, 'its name, in Chinese, pinyin and English');
  assert.equal(get(game, 'NPCS.length'), 0, 'the meadow’s monkeys stay in the meadow');
});

test('standing in another place puts you on its map', () => {
  const game = loadGame({save: {version: 18, started: true}});
  withNook(game);
  game.run("S.pos = {place: 'nook', x: 2, y: 2, dir: 'up'}; placePlayer()");   // (the nook is added after loading)
  assert.equal(game.run('PLACE'), 'nook');
  assert.deepEqual(get(game, '[pl.x, pl.y]'), [2, 2]);
});

test('a way the story hasn’t opened yet says so, and you don’t go through', () => {
  const game = loadGame({save: {version: 18, started: true, pos: {place: 'meadow', x: 9, y: 4, dir: 'down'}}});
  withNook(game, false);
  game.run("placePlayer(); globalThis.__toast = ''; toast = m => { __toast = m; }; tryStep('down', 10000)");
  assert.equal(game.run('__toast'), 'Not yet.');
  assert.equal(game.run('pl.mv'), null, 'you stay where you are');
  game.run("here().gate = true; tryStep('down', 20000)");
  assert.ok(game.run('!!pl.mv'), 'once it opens, you can walk on');
});

test('a task arrow to someone in another place points the way there', () => {
  const game = loadGame({save: {version: 18, started: true}});
  withNook(game);
  game.run("S.pos = {place: 'nook', x: 2, y: 2, dir: 'up'}; placePlayer()");   // (the nook is added after loading)
  const elder = get(game, "getTasks().find(t => t.id === 'elder')");
  assert.deepEqual(elder.target, [1, 2], 'the way back to the meadow, where the old monkey is');
  assert.ok(!elder.npc);
});

// The mountain path (18 October 2026): up beside the river from the meadow to the waterfall at its top.
test('the mountain path leads up from the meadow, and the waterfall is at its top, not in the meadow', () => {
  const game = loadGame();
  const looks = id => [...new Set(get(game, `PLACES.${id}.map.join('')`).split('').map(ch => get(game, `AREA.legend[${JSON.stringify(ch)}].look`)))];
  assert.ok(!looks('meadow').includes('waterfall'), 'the meadow has no waterfall now');
  assert.ok(looks('path').includes('waterfall'), 'the path has it');
  const up = get(game, "PLACES.meadow.exits.filter(e => e.to === 'path')");
  assert.ok(up.length >= 1, 'a way up from the meadow');
  assert.ok(get(game, "PLACES.path.exits.some(e => e.to === 'meadow')"), 'and back down');
  assert.ok(get(game, "PLACES.path.exits.some(e => e.to === 'cave' && e.by === 'A')"), 'the jump into the cave is at the top of the path');
});

test('you can hop down a ledge, but never climb it', () => {
  const game = loadGame({save: {version: 23, started: true, areas: {1: {gate: true, climb: 1}}, pos: {place: 'path', x: 8, y: 9, dir: 'down'}}});
  game.run("mode = 'play'; placePlayer()");
  assert.equal(get(game, 'tileAt(8, 10).look'), 'ledge');
  game.run('tryStep("down", 10000)');
  assert.deepEqual(get(game, '[pl.mv.tx, pl.mv.ty, pl.mv.hop]'), [8, 11, true], 'down over the ledge, landing below it');
  game.run("pl.mv = null; S.pos = {place: 'path', x: 8, y: 11, dir: 'up'}; placePlayer(); tryStep('up', 10000)");
  assert.equal(get(game, 'pl.mv'), null, 'not back up it');
});

test('setting off: the old monkey sends you up alone, and the waterfall at the top is where the water comes from', async () => {
  const game = loadGame({save: {version: 23, started: true, areas: {1: {elder: 2, hungry: 'done', thirsty: 'done', gate: true}}}});
  game.run("mode = 'play'; showDialog = showNarration = showNotice = replyWith = async () => {}; toast = () => {}");
  const said = () => get(game, "(AREA.talk.elder.find(p => !p.if || matches(p.if)).do || []).map(s => s.say || s.set && 'set' || s.message && 'message')");
  assert.deepEqual(said().slice(0, 2), ['whereFrom', 'snakes'], 'the little monkey wonders, and the old monkey warns of snakes');
  await game.run("runSteps(AREA.talk.elder.find(p => !p.if || matches(p.if)).do, 'elder')");
  assert.equal(get(game, 'here().climb'), 1);
  assert.equal(get(game, "ALL_NPCS.find(n => n.id === 'elder').place"), 'meadow', 'the troop stays below');
  game.run("S.pos = {place: 'path', x: 15, y: 1, dir: 'right'}; placePlayer()");
  await game.run('interact(16, 1)');
  assert.equal(get(game, 'here().climb'), 2, 'the waterfall: found it');
  await game.run("runSteps(AREA.talk.elder.find(p => !p.if || matches(p.if)).do, 'elder')");
  assert.equal(get(game, 'here().climb'), 3, 'back down, you tell the troop');
  game.run('placeCharacters()');
  assert.deepEqual(get(game, "['elder', 'big', 'playful'].map(id => ALL_NPCS.find(n => n.id === id).place)"), ['path', 'path', 'path'], 'and they follow you up');
});
