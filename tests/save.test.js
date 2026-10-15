// Saved games keep working: older saves are converted to the current format without losing
// anything, a copy of the old save is kept, and a broken save is never thrown away.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame, SAVE_KEY} = require('./fake-browser');

const json = x => JSON.parse(JSON.stringify(x));
const saveOf = game => JSON.parse(game.run('JSON.stringify(S)'));

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
  assert.equal(s.version, 3);
  assert.equal(s.area, 1);
  assert.deepEqual(s.areas[1], {elder: 2, hungry: 3, thirsty: 1, gate: false, story: false, done: false});
  for (const old of ['q', 'gate', 'story', 'area1Done']) assert.ok(!(old in s), `the old field ${old} should have moved`);
  for (const [k, v] of Object.entries(V2)){
    if (['q', 'gate', 'story', 'area1Done'].includes(k)) continue;
    assert.deepEqual(s[k], v, `${k} should be unchanged`);
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
  assert.equal(game.el('#count').textContent, '3/27');
  // Said hello, learned about animals, 1 of 4 animals found, hungry monkey helped, thirsty not yet, no story, no test
  assert.deepEqual(json(game.run('areaChecklist().map(([, done]) => done)')), [true, true, false, true, false, false, false]);
});

test('a finished area stays finished', () => {
  const game = loadGame({save: {...V2, q: {elder: 2, hungry: 3, thirsty: 3}, gate: true, story: true, area1Done: true}});
  assert.deepEqual(saveOf(game).areas[1], {elder: 2, hungry: 3, thirsty: 3, gate: true, story: true, done: true});
  assert.equal(game.run('tileAt(15, 4).look'), 'path', 'the rocks should still be gone');
});

test('a very old save that carried the peach as a task step is converted', () => {
  const s = saveOf(loadGame({save: {...V2, q: {elder: 2, hungry: 2, thirsty: 0}}}));
  assert.equal(s.areas[1].hungry, 1);
  assert.equal(s.carry, '桃子');
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
  assert.deepEqual(s.areas[1], {elder: 0, hungry: 0, thirsty: 0, gate: false, story: false, done: false});
  assert.deepEqual(s.met, []);
  assert.equal(s.sound, true);
  const t = saveOf(loadGame({save: {version: 3, started: true, peaches: 2}}));
  assert.deepEqual(t.areas[1], {elder: 0, hungry: 0, thirsty: 0, gate: false, story: false, done: false});
  assert.equal(t.peaches, 2);
});

test('an unreadable save is kept as a backup, and the game starts fresh', () => {
  const broken = '{"started":true, "peaches": 9';
  const game = loadGame({save: broken});
  game.runFrame();
  assert.equal(game.storage.get(SAVE_KEY + '-backup-unreadable'), broken);
  assert.match(game.el('#titleButtons').innerHTML, />Start</);
  assert.equal(saveOf(game).version, 3);
});

test('a new player starts in the current format, and nothing is saved until they play', () => {
  const game = loadGame();
  const s = saveOf(game);
  assert.equal(s.version, 3);
  assert.deepEqual(s.areas[1], {elder: 0, hungry: 0, thirsty: 0, gate: false, story: false, done: false});
  assert.equal(game.storage.size, 0);
});
