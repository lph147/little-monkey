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

// The way up the stream (18 October 2026): from the meadow to the waterfall, in three places that follow the river.
test('the way up the stream: the mountain path, the river valley and deep in the mountains, with the waterfall at the end', () => {
  const game = loadGame();
  const looks = id => [...new Set(get(game, `PLACES.${id}.map.join('')`).split('').map(ch => get(game, `AREA.legend[${JSON.stringify(ch)}].look`)))];
  assert.ok(!looks('meadow').includes('waterfall'), 'the meadow has no waterfall now');
  assert.ok(looks('falls').includes('waterfall'), 'deep in the mountains has it');
  for (const id of ['path', 'valley', 'falls']) assert.ok(looks(id).includes('water') && looks(id).includes('longGrass'), `${id}: the river runs through it, and there's long grass`);
  const goes = (a, b) => get(game, `PLACES.${a}.exits.some(e => e.to === '${b}')`);
  for (const [a, b] of [['meadow', 'path'], ['path', 'valley'], ['valley', 'falls']]) assert.ok(goes(a, b) && goes(b, a), `${a} and ${b} are joined, both ways`);
  assert.ok(get(game, "PLACES.falls.exits.some(e => e.to === 'cave' && e.by === 'A')"), 'the jump into the cave is at the waterfall');
  assert.ok(get(game, "PLACES.cave.exits.every(e => e.to === 'falls')"), 'and you come out in front of it');
});

test('you can hop down a ledge, but never climb it', () => {
  const game = loadGame({save: {version: 25, started: true, areas: {1: {gate: true, climb: 1}}, pos: {place: 'path', x: 8, y: 11, dir: 'down'}}});
  game.run("mode = 'play'; placePlayer()");
  assert.equal(get(game, 'tileAt(8, 12).look'), 'ledge');
  game.run('tryStep("down", 10000)');
  assert.deepEqual(get(game, '[pl.mv.tx, pl.mv.ty, pl.mv.hop]'), [8, 13, true], 'down over the ledge, landing below it');
  game.run("pl.mv = null; S.pos = {place: 'path', x: 8, y: 13, dir: 'up'}; placePlayer(); tryStep('up', 10000)");
  assert.equal(get(game, 'pl.mv'), null, 'not back up it');
});

test('setting off: the old monkey sends you up alone, and the waterfall at the end is where the water comes from', async () => {
  const game = loadGame({save: {version: 25, started: true, areas: {1: {elder: 2, hungry: 'done', thirsty: 'done', gate: true}}}});
  game.run("mode = 'play'; showDialog = showNarration = showNotice = replyWith = async () => {}; toast = () => {}");
  const said = () => get(game, "(AREA.talk.elder.find(p => !p.if || matches(p.if)).do || []).map(s => s.say || s.set && 'set' || s.message && 'message')");
  assert.deepEqual(said().slice(0, 2), ['whereFrom', 'snakes'], 'the little monkey wonders, and the old monkey warns of snakes');
  await game.run("runSteps(AREA.talk.elder.find(p => !p.if || matches(p.if)).do, 'elder')");
  assert.equal(get(game, 'here().climb'), 1);
  assert.equal(get(game, "ALL_NPCS.find(n => n.id === 'elder').place"), 'meadow', 'the troop stays below');
  game.run("S.pos = {place: 'falls', x: 5, y: 1, dir: 'left'}; PLACE = null; enterPlace('falls'); placePlayer()");
  await game.run('interact(4, 1)');
  assert.equal(get(game, 'here().climb'), 2, 'the waterfall: found it');
  await game.run("runSteps(AREA.talk.elder.find(p => !p.if || matches(p.if)).do, 'elder')");
  assert.equal(get(game, 'here().climb'), 3, 'back down, you tell the troop');
  game.run('placeCharacters()');
  assert.deepEqual(get(game, "['elder', 'big', 'playful'].map(id => ALL_NPCS.find(n => n.id === id).place)"), ['falls', 'falls', 'falls'], 'and they follow you up');
});

// Walking the way up, from the bottom of the mountain path, through the places' exits: can you reach the waterfall?
// (Never up a ledge; with avoidGrass, never through long grass; blocked: squares you can't walk on, such as a bridge.)
function wayUp(game, {avoidGrass = false, from = ['path', 16, 18], blocked = []} = {}){
  const places = get(game, 'PLACES'), legend = get(game, 'AREA.legend');
  const key = (p, x, y) => p + ',' + x + ',' + y, seen = new Set([key(...from)]), todo = [from];
  while (todo.length){
    const [p, x, y] = todo.pop(), map = places[p].map;
    if (p === 'falls' && x === 5 && y === 1) return true;
    const exit = places[p].exits.find(e => !e.by && e.at[0] === x && e.at[1] === y);
    const next = exit ? [[exit.to, ...exit.arrive]] : [];
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]){
      const nx = x + dx, ny = y + dy, t = legend[(map[ny] || '')[nx]];
      if (!t || blocked.includes(key(p, nx, ny))) continue;
      if (t.ledge){ if (dy === 1 && legend[map[ny + 1][nx]].walk) next.push([p, nx, ny + 1]); continue; }
      if (!t.walk || (avoidGrass && t.look === 'longGrass')) continue;
      next.push([p, nx, ny]);
    }
    for (const n of next) if (!seen.has(key(...n))){ seen.add(key(...n)); todo.push(n); }
  }
  return false;
}
test('on the way up the stream there is no way round the long grass', () => {
  const game = loadGame();
  assert.equal(wayUp(game), true, 'you can reach the waterfall');
  assert.equal(wayUp(game, {avoidGrass: true}), false, 'but not without going through long grass');
  for (const [p, x, y] of [['valley', 19, 11], ['falls', 5, 11]]) assert.equal(wayUp(game, {from: [p, x, y], avoidGrass: true}), false, `not from ${p} (${x}, ${y}) either`);
});

test('in the river valley the way forks: over the first bridge, away from the river, is a dead end', () => {
  const game = loadGame();
  assert.equal(get(game, "AREA.legend[PLACES.valley.map[6][19]].look"), 'bridgeAcross', 'the first bridge');
  assert.equal(wayUp(game, {from: ['valley', 19, 3], blocked: ['valley,19,6', 'valley,19,7']}), false, 'from the clearing, only back over the bridge');
  assert.equal(wayUp(game, {from: ['valley', 19, 9], blocked: ['valley,19,7']}), true, 'along the river is the way up');
});

test('animal friends on the way up: the rabbit and the fox give advice, the squirrel and the goat want to play', async () => {
  const game = loadGame({save: {version: 25, started: true, w: Object.fromEntries(['松鼠', '石头', '山', '花', '草'].map(w => [w, {lv: 1, due: 0, ok: 0}])), areas: {1: {gate: true, climb: 1}}, pos: {place: 'path', x: 5, y: 4, dir: 'up'}}});
  const steps = id => get(game, `AREA.talk.${id}[0].do.map(s => Object.keys(s)[0])`);
  for (const id of ['rabbit', 'fox']) assert.ok(!steps(id).includes('wordGame') && steps(id)[0] === 'say', `the ${id} says something useful`);
  for (const id of ['squirrel', 'goat']) assert.ok(steps(id).includes('wordGame'), `the ${id} plays a word game`);
  assert.deepEqual(get(game, "['rabbit', 'squirrel', 'fox', 'goat'].map(id => ALL_NPCS.find(n => n.id === id).place)"), ['path', 'path', 'valley', 'valley']);
  const name = get(game, "speaker('squirrel')");
  assert.match(name, /松鼠 <span class="spk-py">sōngshǔ<\/span>/, 'called by its word, with pinyin');
  assert.doesNotMatch(name, /spk-en/, 'and no English: it’s a word you know');
  game.run("mode = 'play'; placePlayer(); showDialog = async () => {}; confirmBox = async () => true; globalThis.__played = 0; encounter = async f => { __played = f.hz; return true; }");
  const bubble = () => get(game, "((AREA.bubbles.squirrel || []).find(b => matches(b.if)) || {}).show || ''");
  assert.equal(bubble(), '!', 'it wants to play');
  await game.run("talk(ALL_NPCS.find(n => n.id === 'squirrel'))");
  assert.equal(get(game, '__played'), '松鼠', 'a word game with the squirrel');
  assert.equal(bubble(), '', 'and then its ! goes');
});

test('standing in tall or long grass hides your feet, as in Pokémon; on the path it doesn’t', () => {
  const at = (place, x, y) => { const g = loadGame({save: {version: 25, started: true, areas: {1: {gate: true, climb: 1}}, pos: {place, x, y, dir: 'down'}}}); g.run("mode = 'play'; placePlayer()"); return g; };
  assert.deepEqual(get(at('meadow', 4, 7), 'feetInGrass()'), [[64, 124, 16, 4]], 'the bottom of your square, in the meadow’s tall grass');
  assert.deepEqual(get(at('path', 8, 11), 'feetInGrass()'), [[128, 188, 16, 4]], 'the path’s long grass');
  assert.deepEqual(get(at('path', 16, 15), 'feetInGrass()'), [], 'not on the path itself');
  const across = at('meadow', 4, 7);
  across.run('pl.px += T / 2');
  assert.deepEqual(get(across, 'feetInGrass()'), [[72, 124, 8, 4], [80, 124, 8, 4]], 'walking across, half of each square');
  const down = at('meadow', 4, 7);
  down.run('pl.py += T / 2');
  assert.deepEqual(get(down, 'feetInGrass()'), [[64, 132, 16, 4]], 'walking down, only at your feet, never a band across your middle');
});

test('the mountain path is edged with bushes and boulders, not stone walls', () => {
  const game = loadGame();
  assert.ok(!get(game, 'Object.keys(LOOKS)').includes('wall'));
  assert.equal(get(game, "AREA.legend.w.look"), 'bush');
  assert.ok(!get(game, '!!AREA.legend.w.walk'), 'you can’t walk through a bush');
});

test('the waterfall: the cave just visible behind it; you jump through it, and walk out through the curtain', async () => {
  const game = loadGame({dom: true, save: {version: 27, started: true, areas: {1: {gate: true, climb: 3, story: true, cave: 1}}, pos: {place: 'falls', x: 5, y: 1, dir: 'left'}}});
  game.run("mode = 'play'; placePlayer(); showNotice = showNarration = showDialog = async () => {}; toast = () => {}");
  const [gx, gy, gw, gh] = get(game, 'PLACES.falls.glimpse');
  for (let y = gy; y < gy + gh; y++) for (let x = gx; x < gx + gw; x++) assert.equal(get(game, `AREA.legend[PLACES.falls.map[${y}][${x}]].look`), 'waterfall', 'the glimpse is over the waterfall');
  assert.equal(get(game, "PLACES.falls.exits.find(e => e.to === 'cave').how"), 'jump');
  assert.ok(get(game, "PLACES.cave.exits.every(e => e.how === 'water')"), 'out through the curtain: falling water');
  game.run("globalThis.__heights = []; (() => { let v = pl.py; Object.defineProperty(pl, 'py', {get: () => v, set: n => { v = n; __heights.push(n); }, configurable: true}); })()");
  let done = false;
  game.run('interact(4, 1)').then(() => { done = true; });
  for (let i = 0; i < 500 && !done; i++){ await new Promise(r => setImmediate(r)); game.flush(); }   // (the leap and the rush of water wait on timers)
  assert.ok(done, 'the jump finishes');
  assert.equal(get(game, 'PLACE'), 'cave', 'through the waterfall, into the cave');
  assert.ok(Math.min(...get(game, '__heights')) < 1 * 16 - 6, 'leaping up in an arc on the way');
  assert.ok(get(game, 'waterT') > 0 && get(game, 'dripUntil') > 0, 'through a rush of water, and dripping');
});
