// Saved games keep working: older saves are converted to the current format without losing
// anything, a copy of the old save is kept, and a broken save is never thrown away.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame, SAVE_KEY} = require('./fake-browser');

const json = x => JSON.parse(JSON.stringify(x));
const saveOf = game => JSON.parse(game.run('JSON.stringify(S)'));
const VERSION = loadGame().run('SAVE_VERSION');   // the current save version
// Words at Used (level 4) in an older save are marked as used when it's converted (version 9).
const usedMarked = w => Object.fromEntries(Object.entries(w).map(([k, r]) => [k, r.lv === 4 ? {...r, used: 1} : r]));
const START = {chapter: 0, elder: 0, gate: false, climb: 0, boar: 0, story: false, cave: 0, count: 0, squirrelPlayed: 0, goatPlayed: 0, hungry: 'not asked', thirsty: 'not asked', flowers: 'not asked', holding: {}, wanted: {}, picked: {}, bought: [], done: false};

// A save as Little Monkey 8 (and the versions since, up to the map legend) wrote it: version 2.
const V2 = {
  w: {'石头': {lv: 2, due: 1760000000000, ok: 1}, '路': {lv: 1, due: 0, ok: 0}, '你好': {lv: 4, due: 0, ok: 3}},
  gloss: {}, shells: 7, q: {elder: 2, hungry: 3, thirsty: 1}, gate: false, story: false,
  friends: ['playful', 'fox'], pos: {x: 14, y: 12, dir: 'left'}, started: true, sound: false, music: true,
  tasksSeen: {elder: 1, h1: 1}, area1Done: false, pinyin: false, lines: {'你好！': 1}, howto: true,
  carry: null, met: ['fox'], encounters: 3, today: {d: '2026-10-15', ids: ['石头']}
};

test('a version 2 save is converted, keeping everything', () => {
  const game = loadGame({save: V2});
  const s = saveOf(game);
  assert.equal(s.version, VERSION);
  assert.equal(s.area, 1);
  assert.deepEqual(s.areas[1], {chapter: 0, elder: 2, hungry: 'done', thirsty: 'asked', flowers: 'not asked', gate: false, climb: 0, boar: 0, story: false, cave: 0, count: 0, squirrelPlayed: 0, goatPlayed: 0, holding: {}, wanted: {}, picked: {}, bought: [], done: false});
  for (const old of ['q', 'gate', 'story', 'area1Done', 'carry']) assert.ok(!(old in s), `the old field ${old} should have moved`);
  for (const [k, v] of Object.entries(V2)){
    if (['q', 'gate', 'story', 'area1Done', 'carry'].includes(k)) continue;
    assert.deepEqual(s[k], k === 'w' ? usedMarked(v) : k === 'pos' ? {...v, place: 'meadow'} : v, `${k} should be unchanged`);   // (your spot is in the meadow, the only place then)
  }
});

test('the converted save is written back, and the old one is kept as a backup', () => {
  const game = loadGame({save: V2});
  assert.deepEqual(JSON.parse(game.storage.get(SAVE_KEY)), saveOf(game));
  assert.equal(game.storage.get(SAVE_KEY + '-backup-v2'), JSON.stringify(V2));
});

test('after converting, the game shows the same progress', () => {
  const game = loadGame({save: V2});
  game.runFrame();
  assert.match(game.el('#titleButtons').innerHTML, /class="slot primary" data-slot="1">.*\d+ words/, 'Game 1 has the converted game');
  const stats = game.run('statsHTML()');
  assert.match(stats, /🐚 7/);
  assert.match(stats, /2\/45 words/, '石头 and 路 (路 left the words for a while, and is back on the mountain path)');
  // Said hello, learned about animals, 1 of 4 animals found, hungry monkey helped, thirsty not yet, no story (the headband is optional now)
  assert.deepEqual(json(game.run('areaChecklist().map(([, done]) => done)')), [true, true, false, true, false, false, false, false, false]);   // (the prologue's checklist: no word test there any more)
});

test('a finished area stays finished', () => {
  const game = loadGame({save: {...V2, q: {elder: 2, hungry: 3, thirsty: 3}, gate: true, story: true, area1Done: true}});
  assert.deepEqual(saveOf(game).areas[1], {chapter: 0, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'not asked', gate: true, climb: 3, boar: 0, story: true, squirrelPlayed: 0, goatPlayed: 0, cave: 0, count: 0, holding: {}, wanted: {}, picked: {}, bought: [], done: true});
  assert.equal(game.run('tileAt(15, 4).look'), 'path', 'the rocks should still be gone');
});

test('a very old save that carried the peach as a task step is converted', () => {
  const s = saveOf(loadGame({save: {...V2, q: {elder: 2, hungry: 2, thirsty: 0}}}));
  assert.equal(s.areas[1].hungry, 'asked');
  assert.deepEqual(s.areas[1].holding, {hungry: '桃子'});
  assert.ok(!('carry' in s));
});

test('a current save loads unchanged, and no backup is made', () => {
  const current = saveOf(loadGame({save: V2}));
  const game = loadGame({save: current});
  assert.deepEqual(saveOf(game), current);
  assert.deepEqual([...game.storage.keys()], [SAVE_KEY]);
});

test('an existing backup is never overwritten', () => {
  const first = JSON.stringify({...V2, shells: 1});
  const game = loadGame({save: V2, storage: {[SAVE_KEY + '-backup-v2']: first}});
  assert.equal(game.storage.get(SAVE_KEY + '-backup-v2'), first);
});

test('missing parts of a save get their starting values', () => {
  const s = saveOf(loadGame({save: {started: true, met: 'not a list'}}));
  assert.deepEqual(s.areas[1], START);
  assert.deepEqual(s.met, []);
  assert.equal(s.sound, true);
  const t = saveOf(loadGame({save: {version: 3, started: true, shells: 2}}));
  assert.deepEqual(t.areas[1], START);
  assert.equal(t.shells, 2);
});

test('an unreadable save is kept as a backup, and the game starts fresh', () => {
  const broken = '{"started":true, "peaches": 9';
  const game = loadGame({save: broken});
  game.runFrame();
  assert.equal(game.storage.get(SAVE_KEY + '-backup-unreadable'), broken);
  assert.match(game.el('#titleButtons').innerHTML, /class="slot empty primary" data-slot="1"/, 'Game 1 is empty: a new game');
  assert.equal(saveOf(game).version, VERSION);
});

test('a new player starts in the current format, and nothing is saved until they play', () => {
  const game = loadGame();
  const s = saveOf(game);
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.areas[1], START);
  assert.equal(game.storage.size, 0);
});

// A save as steps 5 to 6a wrote it: version 3, with the monkeys' tasks as numbers.
const V3 = {...JSON.parse(JSON.stringify(V2)), version: 3, area: 1, carry: '苹果',
  areas: {1: {elder: 2, hungry: 1, thirsty: 2, gate: false, story: false, done: false}}};
for (const k of ['q', 'gate', 'story', 'area1Done']) delete V3[k];

test('a version 3 save is converted: tasks become words, and what you carry moves to the task', () => {
  const game = loadGame({save: V3});
  const s = saveOf(game);
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.areas[1], {chapter: 0, elder: 2, gate: false, climb: 0, boar: 0, story: false, cave: 0, count: 0, squirrelPlayed: 0, goatPlayed: 0, hungry: 'asked', thirsty: 'asked', flowers: 'not asked', holding: {hungry: '苹果', thirsty: '水'}, wanted: {hungry: '桃子'}, picked: {}, bought: [], done: false});
  assert.ok(!('carry' in s));
  assert.equal(game.storage.get(SAVE_KEY + '-backup-v3'), JSON.stringify(V3));
});

test('after converting a version 3 save, the tasks and bubbles are the same', () => {
  const game = loadGame({save: V3});
  assert.deepEqual(json(game.run('getTasks().map(t => t.id)')), ['animals', 'h2苹果', 't2']);
  assert.equal(game.run('canGather(LEGEND.P.gather)'), true, 'you can still swap the apple for a peach');
  assert.equal(game.run('canGather(LEGEND.O.gather)'), false, 'you already have the water');
});

// A save as the versions since then wrote it: version 4, before words heard in sentences were counted.
const V4 = {...json(V3), version: 4, lines: {'你好！': 1, '我饿了。我要吃水果！': 1},
  areas: {1: {elder: 2, hungry: 'asked', thirsty: 'asked', gate: false, story: false, holding: {}, bought: [], done: false}}};
delete V4.carry;

test('a version 4 save is converted: the words in lines you have seen count as heard', () => {
  const game = loadGame({save: V4});
  const s = saveOf(game);
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.heard, {'你好': 1, '我': 2, '饿': 1, '了': 1, '要': 1, '吃': 1, '水果': 1});
  // (the big monkey's request, and the things you've picked for it, are new since then)
  const later = a => Object.fromEntries(Object.entries(a).map(([n, p]) => [n, {chapter: 0, climb: 0, boar: 0, cave: 0, count: 0, squirrelPlayed: 0, goatPlayed: 0, ...p, flowers: 'not asked', picked: {}, wanted: p.hungry === 'asked' ? {hungry: '桃子'} : {}}]));
  for (const [k, v] of Object.entries(V4)) if (k !== 'version') assert.deepEqual(s[k], k === 'w' ? usedMarked(v) : k === 'areas' ? later(v) : k === 'pos' ? {...v, place: 'meadow'} : v, `${k} should be unchanged`);
  assert.equal(game.storage.get(SAVE_KEY + '-backup-v4'), JSON.stringify(V4));
});

test('converting a version 4 save where the story was read counts the story too', () => {
  const s = saveOf(loadGame({save: {...V4, areas: {1: {...V4.areas[1], gate: true, story: true}}}}));
  assert.equal(s.heard['瀑布'], 1, 'heard once, in the story');
  assert.equal(s.heard['鱼'], 2, 'heard twice: in the story, and in a story question');
  assert.equal(s.heard['你好'], 1, 'heard once, in a line you have seen');
});

test('a version 8 save is converted: words at Used are marked as used, and every word keeps its level', () => {
  const w = {'桃子': {lv: 4, due: 0, ok: 0}, '水': {lv: 1, due: 0, ok: 0}, '山': {lv: 3, due: 5, ok: 2}};
  const game = loadGame({save: {version: 8, started: true, w, shells: 4, bag: {'苹果': 1}}});
  const s = saveOf(game);
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.w, {'桃子': {lv: 4, due: 0, ok: 0, used: 1}, '水': {lv: 1, due: 0, ok: 0}, '山': {lv: 3, due: 5, ok: 2}});
  assert.equal(s.shells, 4);
  assert.deepEqual(s.bag, {'苹果': 1});
  assert.ok(game.storage.get(SAVE_KEY + '-backup-v8'), 'the version 8 save is kept as a backup');
});

test('a version 9 save is converted: English on reply choices starts on', () => {
  const game = loadGame({save: {version: 9, started: true, w: {'山': {lv: 2, due: 0, ok: 1, n: 1}}, pinyin: false}});
  const s = saveOf(game);
  assert.equal(s.version, VERSION);
  assert.equal(s.replyEn, true);
  assert.equal(s.pinyin, false, 'other settings are kept');
  assert.deepEqual(s.w['山'], {lv: 2, due: 0, ok: 1, n: 1});
});

test('a save from before version 16 had peaches for money: they become the same number of shells', () => {
  const s = saveOf(loadGame({save: {version: 15, started: true, peaches: 12, w: {'山': {lv: 1, due: 0, ok: 0}}}}));
  assert.equal(s.version, VERSION);
  assert.equal(s.shells, 12);
  assert.ok(!('peaches' in s));
  assert.equal(saveOf(loadGame({save: {version: 4, started: true, peaches: 3, w: {}}})).shells, 3, 'from a very old save too');
});

test('a version 16 save is converted: a game already started has had all its tips (it had How to play instead)', () => {
  const s = saveOf(loadGame({save: {version: 16, started: true, shells: 5, w: {'山': {lv: 2, due: 0, ok: 1}}}}));
  assert.equal(s.version, VERSION);
  assert.deepEqual(Object.keys(s.tips).sort(), ['grey', 'look', 'talk', 'walk']);
  assert.ok(Object.values(s.tips).every(v => v === 1));
  assert.equal(s.shells, 5, 'everything else stays');
  assert.deepEqual(saveOf(loadGame({save: {version: 16, started: false, w: {}}})).tips, {}, 'a game not started yet gets every tip');
});

test('a version 17 save is converted: the area was one map, and your spot is in its first place, the meadow', () => {
  const s = saveOf(loadGame({save: {version: 17, started: true, pos: {x: 13, y: 6, dir: 'up'}, shells: 4, w: {'山': {lv: 1, due: 0, ok: 0}}}}));
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.pos, {x: 13, y: 6, dir: 'up', place: 'meadow'});
  assert.equal(s.shells, 4, 'everything else stays');
  assert.equal(saveOf(loadGame()).pos.place, 'meadow', 'a new game starts in the meadow');
});

test('a version 18 save is converted: there were no chapters, so you are in the prologue', () => {
  const s = saveOf(loadGame({save: {version: 18, started: true, areas: {1: {elder: 2, hungry: 'done', done: true}}}}));
  assert.equal(s.version, VERSION);
  assert.equal(s.areas[1].chapter, 0);
  assert.deepEqual([s.areas[1].elder, s.areas[1].hungry, s.areas[1].done], [2, 'done', true], 'everything else stays');
});

test('a version 19 save is converted: the hungry monkey still wants the peach he asked for, and flowers are one of each colour', () => {
  const s = saveOf(loadGame({save: {version: 19, started: true, areas: {1: {hungry: 'asked', flowers: 'asked', picked: {flowers: [[11, 7], [17, 9]]}}}}}));
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.areas[1].wanted, {hungry: '桃子'}, 'he asked for a peach then');
  assert.deepEqual(s.areas[1].picked.flowers, [], 'part-way through the flowers, you start again (one of each colour now)');
  const all = saveOf(loadGame({save: {version: 19, started: true, areas: {1: {flowers: 'asked', holding: {flowers: '花'}, picked: {flowers: [[11, 7], [17, 9], [1, 10]]}}}}}));
  assert.deepEqual(all.areas[1].picked.flowers, ['红', '黄', '白'], 'with all 3, you have one of each');
  assert.equal(all.areas[1].holding.flowers, '花');
});

test('a version 21 save loses its XP (levels did nothing) and keeps everything else', () => {
  const old = {version: 21, started: true, shells: 8, xp: 260, w: {'山': {lv: 2, due: 0, ok: 1}}, friends: ['fox'], pos: {x: 13, y: 6, dir: 'up'}};
  const game = loadGame({save: old});
  const s = saveOf(game);
  assert.equal(s.version, VERSION);
  assert.equal('xp' in s, false, 'no XP');
  assert.equal(s.shells, 8); assert.deepEqual(s.w['山'], {lv: 2, due: 0, ok: 1}); assert.deepEqual(s.friends, ['fox']);
  assert.equal(game.storage.get(SAVE_KEY + '-backup-v21'), JSON.stringify(old), 'the old save is kept as a backup');
});

test('a version 22 save that has read the story at the waterfall has been up the mountain path with the troop', () => {
  const read = saveOf(loadGame({save: {version: 22, started: true, areas: {1: {chapter: 1, elder: 2, gate: true, story: true, cave: 2}}}}));
  assert.equal(read.version, VERSION);
  assert.equal(read.areas[1].climb, 3, 'the troop is up at the waterfall');
  assert.equal(read.areas[1].cave, 2, 'everything else stays');
  const before = saveOf(loadGame({save: {version: 22, started: true, areas: {1: {chapter: 0, elder: 2, gate: true, story: false}}}}));
  assert.equal(before.areas[1].climb, 0, 'not read yet: the climb is still to come');
});

test('a version 23 save gets full hearts, for the battles on the mountain path', () => {
  const s = saveOf(loadGame({save: {version: 23, started: true, shells: 4}}));
  assert.equal(s.version, VERSION);
  assert.equal(s.hearts, 5);
  assert.equal(s.shells, 4, 'everything else stays');
});

test('a version 24 save on the old mountain path is put where it was on the new way up: by the waterfall, or at the bottom', () => {
  const at = (pos, area) => saveOf(loadGame({save: {version: 24, started: true, pos, areas: {1: {gate: true, ...area}}}}));
  const top = at({place: 'path', x: 15, y: 1, dir: 'right'}, {climb: 3, story: true});
  assert.equal(top.version, VERSION);
  assert.deepEqual(top.pos, {place: 'falls', x: 5, y: 1, dir: 'left'}, 'in front of the waterfall');
  assert.deepEqual(at({place: 'path', x: 6, y: 12, dir: 'down'}, {climb: 1}).pos, {place: 'path', x: 16, y: 18, dir: 'up'}, 'part way up: back to the bottom');
  assert.deepEqual(at({place: 'path', x: 5, y: 3, dir: 'up'}, {climb: 1}).pos, {place: 'path', x: 16, y: 18, dir: 'up'}, 'not past the boar yet: the bottom too');
  assert.deepEqual(at({place: 'cave', x: 7, y: 9, dir: 'up'}, {climb: 3, cave: 2}).pos, {place: 'cave', x: 7, y: 9, dir: 'up'}, 'anywhere else stays');
});
