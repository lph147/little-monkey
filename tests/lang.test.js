// Both ways (decided 9 November 2026, in DESIGN.md): a game learns Chinese, played in English, as every game always has,
// or English, played in Chinese. The page is set up for the language the game you're playing learns (LEARN, js/data.js),
// and what the game says in your own language goes through one door (ui, js/lang.js).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame, SAVE_KEY} = require('./fake-browser');

const SAVE = {version: 41, started: true, area: 1, w: {'石头': {lv: 1, ok: 0}}, pos: {place: 'meadow', x: 13, y: 7, dir: 'up'}, areas: {1: {elder: 2}}};

test('every game learns Chinese unless it learns English: the page is set up for the game you’re playing', () => {
  assert.equal(loadGame().run('LEARN'), 'zh', 'a new player');
  assert.equal(loadGame({save: {...SAVE, learn: 'zh'}}).run('LEARN'), 'zh');
  assert.equal(loadGame({save: {...SAVE, learn: 'en'}}).run('LEARN'), 'en', 'a game learning English');
  const old = {...SAVE, version: 40};
  assert.equal(loadGame({save: old}).run('LEARN'), 'zh', 'a game from before');
  assert.equal(loadGame({save: {...SAVE, learn: 'en'}}).run('S.learn'), 'en', 'the game keeps it');
});

test('learning Chinese, what the game says in English is exactly as written', () => {
  const g = loadGame();
  g.run("ZH_UI['Not now'] = '先不'");
  assert.equal(g.run("ui('Not now')"), 'Not now');
  assert.equal(g.run("ui('It costs {n} shells, and you have {have}.', {n: 3, have: 2})"), 'It costs 3 shells, and you have 2.');
  assert.equal(g.run("ui('Give the {水} to {who}', {n: 1})"), 'Give the {水} to {who}', 'words, counters and anything not given are left for fill');
});

test('learning English, it says it in Chinese once there is a Chinese for it, things in its own order', () => {
  const g = loadGame({save: {...SAVE, learn: 'en'}});
  g.run("ZH_UI['Not now'] = '先不'; ZH_UI['It costs {n} shells, and you have {have}.'] = '要{n}个贝壳，你有{have}个。'");
  assert.equal(g.run("ui('Not now')"), '先不');
  assert.equal(g.run("ui('It costs {n} shells, and you have {have}.', {n: 3, have: 2})"), '要3个贝壳，你有2个。');
  assert.equal(g.run("ui('Nothing yet')"), 'Nothing yet', 'without a Chinese for it yet, its English');
});

test('continuing a game that learns the other language loads the page again for it, as a game in another area does', () => {
  const g = loadGame({save: {...SAVE, learn: 'zh'}, storage: {[SAVE_KEY + '-game2']: JSON.stringify({...SAVE, learn: 'en'})}});
  g.run('continueGame(2)');
  assert.deepEqual(JSON.parse(g.run('sessionStorage.getItem(GO_KEY)')), {area: 1, slot: 2, action: 'continue', learn: 'en'});
  const same = loadGame({save: {...SAVE, learn: 'zh'}, storage: {[SAVE_KEY + '-game2']: JSON.stringify({...SAVE, learn: 'zh'})}});
  same.run('continueGame(2)');
  assert.equal(same.run('sessionStorage.getItem(GO_KEY)'), null, 'one learning the same language just carries on');
});
