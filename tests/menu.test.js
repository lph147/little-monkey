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

test('the menu has a tile each for the Word Scroll, practice, tasks, the bag, friends and wardrobe, then Settings and Save', () => {
  const {sheet, run, items} = menuGame();
  run('pressMenu()');
  assert.deepEqual(items(), ['words', 'practice', 'tasks', 'bag', 'friends', 'wardrobe', 'settings', 'save']);
  const tile = sheet.querySelector('.mtile[data-m="tasks"]');
  assert.equal(tile.querySelector('.mzh').textContent, '任务');
  assert.equal(tile.querySelector('.mpy').textContent, 'rènwu');
  assert.equal(tile.querySelector('.men').textContent, 'Tasks', 'each tile has Chinese, pinyin and English');
  assert.equal(run('document.activeElement && document.activeElement.dataset.m'), 'words', 'A starts on the first tile');
  assert.ok(!/Resume|Today/.test(sheet.textContent), 'no Resume or Today\'s words: B closes, and Today is in the Word Scroll');
});

test('the menu says how many words you have caught, plainly (the 81, all the area’s words, is on the Word Scroll)', () => {
  const {sheet, run} = menuGame();
  run("rec('山').lv = 1; rec('花').lv = 2; S.friends = ['松鼠']");
  run('openMenu()');
  assert.match(sheet.querySelector('.stats').textContent, /^2 words caught1 friend/, 'not 2/81 words, which was unclear');
  run('openScroll(openMenu)');
  assert.equal(sheet.querySelector('.label').textContent, `Word Scroll · 2 of ${run('ORDER.length')} caught`);
  run("for (const w of Object.keys(S.w)) delete S.w[w]; rec('山').lv = 1; openMenu()");
  assert.match(sheet.querySelector('.stats').textContent, /^1 word caught/);
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

test('Settings has the sound, pinyin, English on replies, frames a second, How to play, the opening and the title screen', () => {
  const {sheet, run, items} = menuGame();
  run('openMenu()');
  sheet.querySelector('[data-m="settings"]').click();
  assert.deepEqual(items(), ['music', 'sound', 'pinyin', 'replyEn', 'fps', 'howto', 'opening', 'title'], 'saving, loading and starting again are on the title screen');
  const pinyin = run('S.pinyin');
  sheet.querySelector('[data-m="pinyin"]').click();
  assert.equal(run('S.pinyin'), !pinyin, 'Pinyin switches');
  assert.equal(run('document.activeElement.dataset.m'), 'pinyin', 'and stays chosen');
  run('pressB()');
  assert.deepEqual(items(), ['words', 'practice', 'tasks', 'bag', 'friends', 'wardrobe', 'settings', 'save'], 'B from Settings goes back to the menu');
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
  // the menu, laid out as a 3 × 2 grid of tiles, then Settings and Save side by side, then Close
  const place = {words: [0, 0, 150, 100], practice: [160, 0, 150, 100], tasks: [320, 0, 150, 100], bag: [0, 110, 150, 100], friends: [160, 110, 150, 100], wardrobe: [320, 110, 150, 100],
    settings: [0, 220, 150, 40], save: [160, 220, 150, 40]};
  for (const [m, [left, top, width, height]] of Object.entries(place)) sheet.querySelector(`[data-m="${m}"]`).rect = {left, top, width, height};
  sheet.querySelector('[data-a=close]').rect = {left: 320, top: 280, width: 80, height: 40};
  const on = () => run("document.activeElement.dataset.m || document.activeElement.dataset.a");
  assert.equal(on(), 'words');
  run("navFocus('down')"); assert.equal(on(), 'bag', 'down goes to the tile below, not the one beside');
  run("navFocus('right')"); assert.equal(on(), 'friends');
  run("navFocus('up')"); assert.equal(on(), 'practice', 'up goes to the tile above');
  run("navFocus('up')"); assert.equal(on(), 'practice', 'at the top, up stays put');
  run("navFocus('left')"); assert.equal(on(), 'words');
  run("navFocus('down'); navFocus('down')"); assert.equal(on(), 'settings', 'down from the grid goes to Settings');
  run("navFocus('right')"); assert.equal(on(), 'save', 'and Save beside it');
  run("navFocus('down')"); assert.equal(on(), 'close', 'then to Close');
});

test('How to play is three pages, each short enough for a phone held sideways: the controls, the kinds of word, the rest', () => {
  const {game, sheet, run} = menuGame();
  run('howToPlay()');
  const seen = [];
  for (let i = 0; i < 3; i++){
    seen.push(sheet.querySelector('.label').textContent);
    if (i === 1){   // the kinds of word: tap one in the example, and its meaning shows beside it
      sheet.querySelector('.example .tok[data-t="水"]').click();
      assert.match(sheet.querySelector('.example .gloss').textContent, /水 shuǐ · water/);
    }
    if (i < 2) sheet.querySelector('[data-a=next]').click();
  }
  assert.deepEqual(seen, ['How to play · 1 of 3', 'How to play · 2 of 3', 'How to play · 3 of 3']);
  assert.match(sheet.textContent, /keyboard or a game controller/, 'the last page has the rest');
  sheet.querySelector('[data-a=back]').click();
  assert.equal(sheet.querySelector('.label').textContent, 'How to play · 2 of 3', 'Back goes back a page');
  sheet.querySelector('[data-a=next]').click();
  assert.equal(sheet.querySelector('[data-a=next]').textContent, 'Got it');
  sheet.querySelector('[data-a=next]').click();
  assert.equal(run('S.howto'), true);
  assert.equal(game.run('modal.hidden'), true);
});

test('the labels under A and B stay on one line, with their apostrophes: a long button gives its first word, never half a word', () => {
  const {game, run} = menuGame();
  const label = text => run(`btnLabel({dataset: {}, classList: {contains: () => false}, textContent: ${JSON.stringify(text)}})`);
  assert.equal(label('I’ve added it'), 'I’ve added it', 'its apostrophe stays (it was "Ive added it")');
  assert.equal(label('Copy to a file'), 'Copy', 'not "Copy to a fi"');
  assert.equal(label('Watch the opening'), 'Watch');
  assert.equal(label('⚙ Settings'), 'Settings');
  run(`openCard('<div class="actions"><button class="btn" data-a="no" data-b>Not now</button><button class="btn primary" data-a="yes">I’ve added it</button></div>'); updateCtx(performance.now())`);
  const [a, b] = [game.el('#aLabel'), game.el('#bLabel')];
  assert.deepEqual([a.textContent, b.textContent], ['I’ve added it', 'Not now']);
  assert.deepEqual([a.classList.contains('long'), b.classList.contains('long')], [true, false], 'a long one is a little smaller');
  run('closeCard(); openSettings()');
  assert.ok(run(`[...sheet.querySelectorAll('.menu button')].every(b => btnLabel(b).length <= LABEL_MAX)`), 'every one of Settings’ buttons fits');
  const css = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'css', 'game.css'), 'utf8');
  const rule = css.match(/^\.ablabel\{[^}]*\}/m)[0];
  assert.match(rule, /white-space:nowrap/, 'on one line');
  assert.match(rule, /width:0/, 'never moving the buttons, however long');
});

test('Friends: tap a friend for its page, as in the Word Scroll, its English and how it’s made behind English; Back comes back to that friend (24 October 2026)', () => {
  const game = loadGame({dom: true, save: {version: 29, started: true, friends: ['rabbit', 'goat'],
    w: Object.fromEntries(['石头', '山', '羊', '兔子', '山羊'].map(w => [w, {lv: 1, due: 0, ok: 0}]))}});
  game.run("mode = 'play'; globalThis.__said = []; say = w => { __said.push(w); }");
  const sheet = game.el('#sheet'), run = code => game.run(code);
  run('openMenu()');
  sheet.querySelector('[data-m="friends"]').click();
  assert.deepEqual(sheet.querySelectorAll('.friends button').map(b => [b.dataset.w, b.dataset.label]), [['兔子', 'Open'], ['山羊', 'Open']]);
  sheet.querySelector('.friends [data-w="山羊"]').click();
  assert.equal(sheet.querySelector('.label').textContent, 'Friends · Animals', 'the word’s page');
  assert.equal(sheet.querySelector('.big').textContent, '山羊');
  assert.deepEqual(run('JSON.stringify(__said)'), '["山羊"]', 'it says the word');
  const hidden = sel => sheet.querySelector(sel).hidden;
  assert.ok(hidden('.word .en') && !sheet.querySelector('[data-a=made]'), 'English, then how it’s made, wait behind English');
  sheet.querySelector('[data-a=en]').click();
  assert.ok(!hidden('.word .en'));
  sheet.querySelector('[data-a=made]').click();
  assert.match(sheet.querySelector('.madestage').textContent, /mountain.*sheep.*山羊.*goat/s, 'how it’s made, on its own card: 山 mountain + 羊 sheep = 山羊 goat');
  run('pressB()');
  assert.equal(sheet.querySelector('.label').textContent, 'Friends · Animals', 'Back: the word’s page again');
  assert.deepEqual(run('JSON.stringify(__said)'), '["山羊"]', 'not said again');
  run('pressB()');
  assert.equal(sheet.querySelector('.label').textContent, 'Friends', 'Back to your friends');
  assert.equal(run('document.activeElement && document.activeElement.dataset.w'), '山羊', 'on the friend you opened');
  run('pressB()');
  assert.equal(run('document.activeElement && document.activeElement.dataset.m'), 'friends', 'and Back again to the menu');
});

test('Settings, Frames a second: a counter under the power light, off at first; the game draws at most about 60 frames a second', () => {
  const {game, sheet, run} = menuGame();
  const frames = (from, every, n) => { for (let i = 0; i < n; i++) game.runFrame(from + i * every); };
  frames(0, 1000 / 60, 70);
  const fps = game.el('#fps');
  assert.equal(run('!!S.fps'), false);
  assert.equal(fps.hidden, true, 'off in a game that never switched it on');
  run('openMenu()');
  sheet.querySelector('[data-m="settings"]').click();
  sheet.querySelector('[data-m="fps"]').click();
  assert.equal(run('S.fps'), true, 'switched on, and kept with the game');
  assert.equal(JSON.parse(run('localStorage.getItem(KEY)')).fps, true);
  assert.match(sheet.querySelector('[data-m="fps"]').textContent, /Frames a second On/);
  frames(2000, 1000 / 60, 70);
  assert.equal(fps.hidden, false);
  assert.equal(fps.textContent, '60 FPS', 'a 60 Hz screen: every frame drawn');
  frames(4000, 1000 / 120, 140);
  assert.equal(fps.textContent, '60 FPS · SCREEN 120', 'a 120 Hz screen: every other frame skipped');
  frames(6000, 1000 / 90, 100);
  assert.equal(fps.textContent, '90 FPS', 'a 90 Hz screen: all drawn, never an uneven 45');
  sheet.querySelector('[data-m="fps"]').click();
  frames(8000, 1000 / 60, 70);
  assert.equal(fps.hidden, true, 'switched off again');
});

test('a frame skipped (under 10ms after the last one drawn) draws nothing, and the next is asked for all the same', () => {
  const {game, run} = menuGame();
  game.runFrame(5000);
  run('globalThis.__drew = 0; const d = drawWorld; drawWorld = (...a) => { __drew++; return d(...a); }');
  game.runFrame(5008);
  assert.equal(run('__drew'), 0, '8ms later: skipped');
  game.runFrame(5017);
  assert.equal(run('__drew'), 1, '17ms later: drawn');
});
