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
const START = {elder: 0, gate: false, story: false, hungry: 'not asked', thirsty: 'not asked', flowers: 'not asked', holding: {}, picked: {}, bought: [], done: false};

// A save as Little Monkey 8 (and the versions since, up to the map legend) wrote it: version 2.
const V2 = {
  w: {'石头': {lv: 2, due: 1760000000000, ok: 1}, '路': {lv: 1, due: 0, ok: 0}, '你好': {lv: 4, due: 0, ok: 3}},
  gloss: {}, peaches: 7, q: {elder: 2, hungry: 3, thirsty: 1}, gate: false, story: false,
  friends: ['playful', 'fox'], pos: {x: 12, y: 12, dir: 'left'}, started: true, sound: false, music: true,
  tasksSeen: {elder: 1, h1: 1}, area1Done: false, pinyin: false, lines: {'你好！': 1}, howto: true,
  carry: null, met: ['fox'], encounters: 3, today: {d: '2026-10-15', ids: ['石头']}
};

test('a version 2 save is converted, keeping everything', () => {
  const game = loadGame({save: V2});
  const s = saveOf(game);
  assert.equal(s.version, VERSION);
  assert.equal(s.area, 1);
  assert.deepEqual(s.areas[1], {elder: 2, hungry: 'done', thirsty: 'asked', flowers: 'not asked', gate: false, story: false, holding: {}, picked: {}, bought: [], done: false});
  for (const old of ['q', 'gate', 'story', 'area1Done', 'carry']) assert.ok(!(old in s), `the old field ${old} should have moved`);
  for (const [k, v] of Object.entries(V2)){
    if (['q', 'gate', 'story', 'area1Done', 'carry'].includes(k)) continue;
    assert.deepEqual(s[k], k === 'w' ? usedMarked(v) : v, `${k} should be unchanged`);
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
  assert.match(game.el('#titleButtons').innerHTML, />Continue</);
  assert.equal(game.el('#peaches').textContent, '🍑 7');
  assert.equal(game.el('#count').textContent, '2/28');
  // Said hello, learned about animals, 1 of 4 animals found, hungry monkey helped, thirsty not yet, no story, no headband, no test
  assert.deepEqual(json(game.run('areaChecklist().map(([, done]) => done)')), [true, true, false, true, false, false, false, false, false]);
});

test('a finished area stays finished', () => {
  const game = loadGame({save: {...V2, q: {elder: 2, hungry: 3, thirsty: 3}, gate: true, story: true, area1Done: true}});
  assert.deepEqual(saveOf(game).areas[1], {elder: 2, hungry: 'done', thirsty: 'done', flowers: 'not asked', gate: true, story: true, holding: {}, picked: {}, bought: [], done: true});
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
  const first = JSON.stringify({...V2, peaches: 1});
  const game = loadGame({save: V2, storage: {[SAVE_KEY + '-backup-v2']: first}});
  assert.equal(game.storage.get(SAVE_KEY + '-backup-v2'), first);
});

test('missing parts of a save get their starting values', () => {
  const s = saveOf(loadGame({save: {started: true, met: 'not a list'}}));
  assert.deepEqual(s.areas[1], START);
  assert.deepEqual(s.met, []);
  assert.equal(s.sound, true);
  const t = saveOf(loadGame({save: {version: 3, started: true, peaches: 2}}));
  assert.deepEqual(t.areas[1], START);
  assert.equal(t.peaches, 2);
});

test('an unreadable save is kept as a backup, and the game starts fresh', () => {
  const broken = '{"started":true, "peaches": 9';
  const game = loadGame({save: broken});
  game.runFrame();
  assert.equal(game.storage.get(SAVE_KEY + '-backup-unreadable'), broken);
  assert.match(game.el('#titleButtons').innerHTML, />Start</);
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
  assert.deepEqual(s.areas[1], {elder: 2, gate: false, story: false, hungry: 'asked', thirsty: 'asked', flowers: 'not asked', holding: {hungry: '苹果', thirsty: '水'}, picked: {}, bought: [], done: false});
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
const V4 = {...json(V3), version: 4, lines: {'你好！': 1, '我饿了。我要吃桃子！': 1},
  areas: {1: {elder: 2, hungry: 'asked', thirsty: 'asked', gate: false, story: false, holding: {}, bought: [], done: false}}};
delete V4.carry;

test('a version 4 save is converted: the words in lines you have seen count as heard', () => {
  const game = loadGame({save: V4});
  const s = saveOf(game);
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.heard, {'你好': 1, '我': 2, '饿': 1, '了': 1, '要': 1, '吃': 1, '桃子': 1});
  // (Mother monkey's request, and the things you've picked for it, are new since then)
  const later = a => Object.fromEntries(Object.entries(a).map(([n, p]) => [n, {...p, flowers: 'not asked', picked: {}}]));
  for (const [k, v] of Object.entries(V4)) if (k !== 'version') assert.deepEqual(s[k], k === 'w' ? usedMarked(v) : k === 'areas' ? later(v) : v, `${k} should be unchanged`);
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
  const game = loadGame({save: {version: 8, started: true, w, peaches: 4, bag: {'苹果': 1}}});
  const s = saveOf(game);
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.w, {'桃子': {lv: 4, due: 0, ok: 0, used: 1}, '水': {lv: 1, due: 0, ok: 0}, '山': {lv: 3, due: 5, ok: 2}});
  assert.equal(s.peaches, 4);
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
