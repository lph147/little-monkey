// Three games (save slots) on the title screen: Game 1 is where the one game always was, so nothing is lost;
// a new game in another slot leaves the others alone; deleting keeps a copy; a file can be loaded into an empty slot.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame, SAVE_KEY} = require('./fake-browser');

const MINE = {started: true, shells: 5, w: {'石头': {lv: 1, due: 0, ok: 0}, '你好': {lv: 1, due: 0, ok: 0}}};

test('your game is Game 1, just where it was; Games 2 and 3 are empty', () => {
  const game = loadGame({dom: true, save: MINE});
  game.runFrame();
  assert.equal(game.run('SLOT'), 1);
  game.run('filesCard()');
  const [one, two, three] = game.el('#sheet').querySelectorAll('.slotrow');
  assert.match(one.textContent, /Game 1.*2 words · 0 friends/);
  assert.ok(two.classList.contains('empty') && three.classList.contains('empty'));
  game.run('save()');
  assert.equal(JSON.parse(game.storage.get(SAVE_KEY)).shells, 5, 'it saves under the same name as before');
});

test('on the title screen the D-pad moves between Continue, New game and Save files, and A presses the chosen one', () => {
  const game = loadGame({dom: true, save: MINE});
  game.runFrame();
  const chosen = () => game.el('#titleButtons').querySelector('.sel').id;
  assert.equal(chosen(), 'contBtn');
  game.run("moveTitle('right')"); assert.equal(chosen(), 'newBtn');
  game.run("moveTitle('right'); moveTitle('right')"); assert.equal(chosen(), 'filesBtn', 'it stops at Save files');
  game.run("moveTitle('left'); moveTitle('left'); moveTitle('left')"); assert.equal(chosen(), 'contBtn');
  game.run("moveTitle('right'); moveTitle('right'); pressA()");
  assert.match(game.el('#sheet').textContent, /Save files/);
});

test('New game starts in an empty game, leaving Game 1 alone; Continue then goes to the game you played last', () => {
  const game = loadGame({dom: true, save: MINE});
  game.runFrame();
  game.el('#titleButtons').querySelector('#newBtn').click();
  assert.equal(game.run('SLOT'), 2, 'the first empty game');
  assert.equal(game.run('S.shells'), 0, 'a new game');
  game.run('startGame()');   // after the opening
  assert.ok(game.storage.get(SAVE_KEY + '-game2'), 'Game 2 is saved under its own name');
  assert.equal(JSON.parse(game.storage.get(SAVE_KEY)).shells, 5, 'Game 1 is untouched');
  const again = loadGame({dom: true, storage: Object.fromEntries(game.storage)});
  again.runFrame();
  assert.match(again.el('#titleButtons').innerHTML, /id="contBtn".*Game 2/, 'Continue: Game 2, played last');
  again.run('filesCard(); slotCard(1)');
  again.el('#sheet').querySelector('#contBtn').click();
  assert.equal(again.run('SLOT'), 1);
  assert.equal(again.run('S.shells'), 5, 'Continue on Game 1’s card switches back to it');
});

test('with all three games in use, New game opens Save files and says how to make room', () => {
  const store = {};
  const game = loadGame({dom: true, save: MINE});
  for (const n of [2, 3]) game.storage.set(SAVE_KEY + '-game' + n, JSON.stringify({...MINE, version: 27}));
  game.run('toTitle()');
  assert.match(game.el('#titleButtons').innerHTML, /Your 3 games are in use/);
  game.el('#titleButtons').querySelector('#newBtn').click();
  assert.match(game.el('#sheet').textContent, /All three games are in use/);
  assert.equal(game.run('SLOT'), 1, 'nothing started');
  assert.ok(store);
});

test('deleting a game asks once more, keeps a copy in the browser, and leaves the slot empty', () => {
  const game = loadGame({dom: true, save: MINE});
  game.runFrame();
  game.run('slotCard(1)');
  const sheet = game.el('#sheet');
  sheet.querySelector('[data-a=del]').click();
  assert.match(sheet.textContent, /Delete Game 1\?/);
  assert.ok(sheet.querySelector('[data-a=no]').classList.contains('primary'), 'Keep it is the main button');
  sheet.querySelector('[data-a=yes]').click();
  assert.equal(game.storage.get(SAVE_KEY), undefined, 'the game is gone');
  assert.ok([...game.storage.keys()].some(k => k.startsWith(SAVE_KEY + '-backup-deleted-game1-')), 'but a copy is kept');
  assert.ok(sheet.querySelectorAll('.slotrow')[0].classList.contains('empty'), 'back on Save files, Game 1 is empty');
  assert.equal(game.run('S.started'), false);
});

test('a save file loads into an empty game, leaving the others alone', () => {
  const game = loadGame({dom: true, save: MINE});
  game.runFrame();
  const file = JSON.stringify({...MINE, shells: 12});
  game.run(`useSave(readSaveFile(${JSON.stringify(file)}).save, 3)`);
  assert.equal(game.run('SLOT'), 3);
  assert.equal(JSON.parse(game.storage.get(SAVE_KEY + '-game3')).shells, 12);
  assert.equal(JSON.parse(game.storage.get(SAVE_KEY)).shells, 5);
  assert.match(game.run('saveFile(3).name'), /^little-monkey-game3-/);
});

test('on a game’s card, the arrows move between its buttons, and A presses the one chosen', () => {
  const game = loadGame({dom: true, save: {version: 25, started: true}});
  game.run('slotCard(1)');
  const sheet = game.el('#sheet');
  assert.equal(game.run('document.activeElement && document.activeElement.id'), 'contBtn', 'Continue to start with');
  game.run("navFocus('left')");
  assert.equal(game.run('document.activeElement.dataset.a'), 'back', 'left: Back');
  game.run('pressA()');
  assert.match(sheet.textContent, /Save files/, 'A pressed Back: back to Save files');
});
