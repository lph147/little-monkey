// Three games (save slots) on the title screen: Game 1 is where the one game always was, so nothing is lost;
// a new game in another slot leaves the others alone; deleting keeps a copy; a file can be loaded into an empty slot.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame, SAVE_KEY} = require('./fake-browser');

const MINE = {started: true, shells: 5, w: {'石头': {lv: 1, due: 0, ok: 0}, '你好': {lv: 1, due: 0, ok: 0}}};
const slots = game => game.el('#titleButtons').querySelectorAll('.slot');

test('your game is Game 1, just where it was; Games 2 and 3 are empty', () => {
  const game = loadGame({dom: true, save: MINE});
  game.runFrame();
  assert.equal(game.run('SLOT'), 1);
  const [one, two, three] = slots(game);
  assert.match(one.textContent, /Game 1.*2 words · 0 friends/);
  assert.ok(two.classList.contains('empty') && three.classList.contains('empty'));
  game.run('save()');
  assert.equal(JSON.parse(game.storage.get(SAVE_KEY)).shells, 5, 'it saves under the same name as before');
});

test('the D-pad moves between the games, and A opens the chosen one', () => {
  const game = loadGame({dom: true, save: MINE});
  game.runFrame();
  game.run("moveSlot('right')");
  assert.ok(slots(game)[1].classList.contains('primary'), 'Game 2 chosen');
  game.run("moveSlot('right'); moveSlot('right')");
  assert.ok(slots(game)[2].classList.contains('primary'), 'and it stops at Game 3');
  game.run("moveSlot('left'); moveSlot('left')");
  assert.ok(slots(game)[0].classList.contains('primary'));
  game.run('pressA()');
  assert.match(game.el('#sheet').textContent, /Game 1/);
});

test('a new game in Game 2 leaves Game 1 alone, and the game you played last is chosen next time', () => {
  const game = loadGame({dom: true, save: MINE});
  game.runFrame();
  game.run('slotCard(2)');
  game.el('#sheet').querySelector('#newBtn').click();
  assert.equal(game.run('SLOT'), 2);
  assert.equal(game.run('S.shells'), 0, 'a new game');
  game.run('startGame()');   // after the opening
  assert.ok(game.storage.get(SAVE_KEY + '-game2'), 'Game 2 is saved under its own name');
  assert.equal(JSON.parse(game.storage.get(SAVE_KEY)).shells, 5, 'Game 1 is untouched');
  const again = loadGame({dom: true, storage: Object.fromEntries(game.storage)});
  again.runFrame();
  assert.equal(again.run('SLOT'), 2, 'next time, Game 2 is the one you were playing');
  assert.ok(slots(again)[1].classList.contains('primary'));
  again.run('slotCard(1)');
  again.el('#sheet').querySelector('#contBtn').click();
  assert.equal(again.run('SLOT'), 1);
  assert.equal(again.run('S.shells'), 5, 'Continue on Game 1 switches back to it');
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
  assert.ok(slots(game)[0].classList.contains('empty'));
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
