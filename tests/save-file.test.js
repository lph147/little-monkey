// Menu, Settings, Save file: your save can be downloaded as a file and loaded again, on this device or another.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame, SAVE_KEY} = require('./fake-browser');

const saveOf = game => JSON.parse(game.run('JSON.stringify(S)'));
const PLAYED = {version: 5, started: true, shells: 12, w: {'石头': {lv: 3, due: 0, ok: 2}, '猴子': {lv: 1, due: 0, ok: 0}},
  heard: {'有': 4}, friends: ['fox'], met: ['fox'], areas: {1: {elder: 2, hungry: 'done', thirsty: 'asked', gate: false, story: false, holding: {}, done: false}}};

test('a downloaded save loads back exactly as it was', () => {
  const from = loadGame({save: PLAYED});
  const file = JSON.parse(from.run('JSON.stringify(saveFile())'));
  assert.match(file.name, /^little-monkey-save-\d{4}-\d\d-\d\d\.json$/);
  const to = loadGame();
  to.run(`useSave(readSaveFile(${JSON.stringify(file.text)}).save)`);
  assert.deepEqual(saveOf(to), saveOf(from));
  assert.deepEqual(JSON.parse(to.storage.get(SAVE_KEY)), saveOf(from), 'the loaded save should be saved in the browser');
});

test('loading a save keeps a copy of the game it replaces', () => {
  const game = loadGame({save: {...PLAYED, shells: 3}});
  const before = game.storage.get(SAVE_KEY);
  game.run(`useSave(readSaveFile(${JSON.stringify(JSON.stringify(PLAYED))}).save)`);
  const backups = [...game.storage.keys()].filter(k => k.startsWith(SAVE_KEY + '-backup-before-load-'));
  assert.equal(backups.length, 1);
  assert.equal(game.storage.get(backups[0]), before);
  assert.equal(saveOf(game).shells, 12);
});

test('a file that isn\'t a save, or is from a newer version, is refused', () => {
  const game = loadGame();
  for (const text of ['', 'hello', '[1,2]', '{"peaches": 3}', '{"w": "words"}'])
    assert.match(game.run(`readSaveFile(${JSON.stringify(text)}).error`), /isn't a Little Monkey save/, `${JSON.stringify(text)} should be refused`);
  assert.match(game.run(`readSaveFile(${JSON.stringify(JSON.stringify({...PLAYED, version: 99}))}).error`), /newer version/);
});

test('an old save file is converted, like an old save in the browser', () => {
  const old = {w: {'石头': {lv: 1, due: 0, ok: 0}}, q: {elder: 1, hungry: 3, thirsty: 0}, lines: {'你好！': 1}, started: true, shells: 4};
  const game = loadGame();
  const s = JSON.parse(game.run(`JSON.stringify(readSaveFile(${JSON.stringify(JSON.stringify(old))}).save)`));
  assert.equal(s.version, game.run('SAVE_VERSION'));
  assert.equal(s.areas[1].hungry, 'done');
  assert.deepEqual(s.heard, {'你好': 1});
  assert.equal(s.shells, 4);
});
