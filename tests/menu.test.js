// The menu: big tiles for your words, tasks and friends, and a Settings page for everything else.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

function menuGame(){
  const game = loadGame({dom: true, save: {version: 8, started: true}});
  game.run("mode = 'play'");   // walking about, past the title screen
  const sheet = game.el('#sheet');
  return {game, sheet, run: code => game.run(code), items: () => sheet.querySelectorAll('[data-m]').map(b => b.dataset.m)};
}

test('the menu has a tile each for the Word Scroll, tasks and friends, then Settings', () => {
  const {sheet, run, items} = menuGame();
  run('pressMenu()');
  assert.deepEqual(items(), ['words', 'tasks', 'friends', 'settings']);
  const tile = sheet.querySelector('.mtile[data-m="tasks"]');
  assert.equal(tile.querySelector('.mzh').textContent, '任务');
  assert.equal(tile.querySelector('.mpy').textContent, 'rènwu');
  assert.equal(tile.querySelector('.men').textContent, 'Tasks', 'each tile has Chinese, pinyin and English');
  assert.equal(run('document.activeElement && document.activeElement.dataset.m'), 'words', 'A starts on the first tile');
  assert.ok(!/Save game|Resume|Today/.test(sheet.textContent), 'no Save, Resume or Today\'s words: the game saves itself, B closes, and Today is in the Word Scroll');
});

test('the tiles open their pages, and Back comes back to the same tile', () => {
  const {sheet, run} = menuGame();
  for (const [m, title] of [['words', 'Word Scroll'], ['tasks', 'Flower Fruit Mountain'], ['friends', 'Friends']]){
    run('openMenu()');
    sheet.querySelector(`[data-m="${m}"]`).click();
    assert.ok(sheet.querySelector('.label').textContent.startsWith(title), `${m} should open ${title}`);
    run('pressB()');
    assert.equal(run('document.activeElement && document.activeElement.dataset.m'), m, `Back from ${title} returns to its tile`);
  }
});

test('Settings has the sound, pinyin, English on replies, How to play, save file, title screen and reset', () => {
  const {sheet, run, items} = menuGame();
  run('openMenu()');
  sheet.querySelector('[data-m="settings"]').click();
  assert.deepEqual(items(), ['music', 'sound', 'pinyin', 'replyEn', 'howto', 'save', 'title', 'reset']);
  const pinyin = run('S.pinyin');
  sheet.querySelector('[data-m="pinyin"]').click();
  assert.equal(run('S.pinyin'), !pinyin, 'Pinyin switches');
  assert.equal(run('document.activeElement.dataset.m'), 'pinyin', 'and stays chosen');
  sheet.querySelector('[data-m="save"]').click();
  assert.match(sheet.textContent, /saves by itself/);
  run('pressB()');
  assert.equal(run('document.activeElement.dataset.m'), 'save', 'Back from the save file returns to Settings');
  run('pressB()');
  assert.deepEqual(items(), ['words', 'tasks', 'friends', 'settings'], 'B from Settings goes back to the menu');
  assert.equal(run('document.activeElement.dataset.m'), 'settings');
});

test('B or the Menu button closes the menu, from the menu or Settings', () => {
  const {sheet, run} = menuGame();
  run('pressMenu()');
  run('pressB()');
  assert.equal(run('modal.hidden'), true, 'B closes the menu');
  run('pressMenu()');
  sheet.querySelector('[data-m="settings"]').click();
  run('pressMenu()');
  assert.equal(run('modal.hidden'), true, 'the Menu button closes Settings');
});
