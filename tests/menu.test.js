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

test('the menu has a tile each for the Word Scroll, tasks, the bag, friends, wardrobe and saving, then Settings', () => {
  const {sheet, run, items} = menuGame();
  run('pressMenu()');
  assert.deepEqual(items(), ['words', 'tasks', 'bag', 'friends', 'wardrobe', 'save', 'settings']);
  const tile = sheet.querySelector('.mtile[data-m="tasks"]');
  assert.equal(tile.querySelector('.mzh').textContent, '任务');
  assert.equal(tile.querySelector('.mpy').textContent, 'rènwu');
  assert.equal(tile.querySelector('.men').textContent, 'Tasks', 'each tile has Chinese, pinyin and English');
  assert.equal(run('document.activeElement && document.activeElement.dataset.m'), 'words', 'A starts on the first tile');
  assert.ok(!/Resume|Today/.test(sheet.textContent), 'no Resume or Today\'s words: B closes, and Today is in the Word Scroll');
});

test('the tiles open their pages, and Back comes back to the same tile', () => {
  const {sheet, run} = menuGame();
  for (const [m, title] of [['words', 'Word Scroll'], ['tasks', 'Tasks'], ['bag', '包 bāo · Bag'], ['friends', 'Friends']]){
    run('openMenu()');
    sheet.querySelector(`[data-m="${m}"]`).click();
    assert.ok(sheet.querySelector('.label').textContent.startsWith(title), `${m} should open ${title}`);
    run('pressB()');
    assert.equal(run('document.activeElement && document.activeElement.dataset.m'), m, `Back from ${title} returns to its tile`);
  }
});

test('Save saves the game and says so; it saves by itself anyway', () => {
  const {sheet, run} = menuGame();
  run('openMenu()');
  run('S.shells = 9');
  sheet.querySelector('[data-m="save"]').click();
  assert.equal(run('modal.hidden'), true, 'the menu closes');
  assert.equal(JSON.parse(run('localStorage.getItem(KEY)')).shells, 9, 'the game is saved');
  assert.match(run("document.querySelector('#saybox').innerHTML"), /Saved: Game 1, just now/);
});

test('Settings has the sound, pinyin, English on replies, How to play, the opening and the title screen', () => {
  const {sheet, run, items} = menuGame();
  run('openMenu()');
  sheet.querySelector('[data-m="settings"]').click();
  assert.deepEqual(items(), ['music', 'sound', 'pinyin', 'replyEn', 'howto', 'opening', 'title'], 'saving, loading and starting again are on the title screen');
  const pinyin = run('S.pinyin');
  sheet.querySelector('[data-m="pinyin"]').click();
  assert.equal(run('S.pinyin'), !pinyin, 'Pinyin switches');
  assert.equal(run('document.activeElement.dataset.m'), 'pinyin', 'and stays chosen');
  run('pressB()');
  assert.deepEqual(items(), ['words', 'tasks', 'bag', 'friends', 'wardrobe', 'save', 'settings'], 'B from Settings goes back to the menu');
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

test('the D-pad moves around the menu on screen: up and down between rows, left and right along them', () => {
  const {sheet, run} = menuGame();
  run('openMenu()');
  // the menu, laid out as a 3 × 2 grid of tiles, then Settings across the width, then Close
  const place = {words: [0, 0, 150, 100], tasks: [160, 0, 150, 100], bag: [320, 0, 150, 100], friends: [0, 110, 150, 100], wardrobe: [160, 110, 150, 100], save: [320, 110, 150, 100], settings: [0, 220, 310, 40]};
  for (const [m, [left, top, width, height]] of Object.entries(place)) sheet.querySelector(`[data-m="${m}"]`).rect = {left, top, width, height};
  sheet.querySelector('[data-a=close]').rect = {left: 230, top: 280, width: 80, height: 40};
  const on = () => run("document.activeElement.dataset.m || document.activeElement.dataset.a");
  assert.equal(on(), 'words');
  run("navFocus('down')"); assert.equal(on(), 'friends', 'down goes to the tile below, not the one beside');
  run("navFocus('right')"); assert.equal(on(), 'wardrobe');
  run("navFocus('up')"); assert.equal(on(), 'tasks', 'up goes to the tile above');
  run("navFocus('up')"); assert.equal(on(), 'tasks', 'at the top, up stays put');
  run("navFocus('left')"); assert.equal(on(), 'words');
  run("navFocus('down'); navFocus('down')"); assert.equal(on(), 'settings', 'down from the grid goes to Settings');
  run("navFocus('down')"); assert.equal(on(), 'close', 'then to Close');
  run("navFocus('up'); navFocus('up')"); assert.equal(on(), 'friends', 'and back up to the grid');
  run("navFocus('right'); navFocus('right'); navFocus('right')"); assert.equal(on(), 'settings', 'right at the end of a row (past Save) carries on to the next');
});
