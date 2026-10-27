// The game starts without errors and shows the title screen. Until then, the start-up screen: the app's monkey and
// three dots, never the console half-built while the code downloads (on a slow connection it showed for seconds:
// 小猴子 on a black screen, an empty label and no buttons).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadGame, ROOT, ENTRY} = require('./fake-browser');

test('a new player sees the title screen: New game (chosen) and Save files, with no game to continue', () => {
  const game = loadGame({dom: true});
  game.runFrame();
  assert.equal(game.el('#titlecard').hidden, false);
  const buttons = game.el('#titleButtons').querySelectorAll('.btn');
  assert.deepEqual(buttons.map(b => b.id), ['newBtn', 'filesBtn']);
  assert.ok(buttons[0].classList.contains('sel'), 'A presses New game');
  assert.equal(game.el('#aLabel').textContent, 'New game');
  assert.match(game.el('#titleText').innerHTML, /can’t speak/, 'no Chinese voice here: the warning, instead of turn your sound on');
  game.run("globalThis.speechSynthesis = {getVoices: () => [{lang: 'zh-CN'}]}; titleText()");
  assert.match(game.el('#titleText').innerHTML, /Turn your sound on/, 'a first game: turn your sound on');
  game.run("moveTitle('right'); pressA()");
  assert.match(game.el('#sheet').textContent, /Save files/, 'Save files lists your games');
  assert.equal(game.el('#sheet').querySelectorAll('.slotrow.empty').length, 3, 'all empty');
  game.el('#sheet').querySelector('.slotrow').click();
  assert.match(game.el('#sheet').innerHTML, /id="newBtn">New game</, 'an empty game: New game');
  assert.match(game.el('#sheet').innerHTML, /Load from a file/);
  assert.match(game.run('statsHTML()'), /0 words caught.*0 friends.*🐚 0/);
});

test('a returning player sees Continue, with their game, and A plays on', () => {
  const game = loadGame({dom: true, save: {started: true, shells: 5, w: {'石头': {lv: 1, due: 0, ok: 0}}}});
  game.runFrame();
  assert.match(game.el('#titleButtons').innerHTML, /id="contBtn".*Continue.*Game 1 · 1 word/);
  assert.ok(game.el('#titleButtons').querySelector('#contBtn').classList.contains('sel'), 'Continue is chosen');
  game.run('pressA()');
  assert.equal(game.run('mode'), 'play', 'Continue plays on');
  assert.match(game.run('statsHTML()'), /1 word caught.*🐚 5/);
  game.run('toTitle(); filesCard(); slotCard(1)');
  const card = game.el('#sheet').innerHTML;
  assert.match(card, /id="contBtn">Continue</, 'its card in Save files: Continue');
  assert.match(card, /5 <img class="money"/, 'its shells');
  assert.match(card, /Copy to a file/); assert.match(card, /Delete/);
});

const page = fs.readFileSync(path.join(ROOT, ENTRY), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css', 'game.css'), 'utf8');

test('the page opens on the start-up screen, before any of the game’s code: the app’s monkey, three dots, and a note for a slow connection', () => {
  assert.match(page, /<html\b[^>]*\bclass="loading"/, 'the page starts loading');
  const boot = page.match(/<div class="boot"[^]*?<\/div><p class="slow">([^<]*)<\/p><\/div>/);
  assert.ok(boot, 'the start-up screen');
  assert.match(boot[0], /<img src="icons\/icon-192\.png"/, 'the app’s monkey');
  assert.equal((boot[0].match(/<i><\/i>/g) || []).length, 3, 'three dots');
  assert.equal(boot[1], 'Slow connection, still loading…');
  assert.ok(page.indexOf('class="boot"') < page.indexOf('<script'), 'it’s on the page before the code, so it shows while the code downloads');
  assert.match(page, /<link rel="icon" href="icons\/icon-192\.png">/, 'its picture is one of the files the app keeps, so it shows offline too');
});

test('until the game is ready, the start-up screen covers the console, which is there but unseen, so it can be measured; the note waits 8 seconds', () => {
  assert.match(css, /\.loading \.boot\{display:flex\}/);
  assert.match(css, /\.boot\{position:fixed;inset:0;[^}]*display:none/, 'and only then');
  assert.match(css, /\.loading \.app\{visibility:hidden/, 'unseen, not left out (fit() sizes the screen from the console’s measurements)');
  assert.match(css, /\.boot \.slow\{[^}]*opacity:0;animation:bootslow \.4s 8s forwards\}/);
});

test('once the game has set itself up, the start-up screen goes, and the console shows with the whole title', () => {
  const game = loadGame({html: true, save: {version: 24, started: true}});
  assert.equal(game.el('html').classList.contains('loading'), false);
  assert.ok(game.el('#gameName').innerHTML.includes('<ruby>'), 'the title, with its pinyin, is ready');
  assert.ok(game.run('cv.width > 0'), 'and the screen its size');
});

test('no two of the game’s scripts give the same name to two things (a later function quietly replaces an earlier one)', () => {
  const {scriptsIn} = require('./fake-browser');
  const seen = new Map();
  for (const s of scriptsIn(ENTRY)){
    const where = path.relative(ROOT, s.file);
    for (const m of s.code.matchAll(/^(?:async\s+)?function\s*\*?\s*([\w$]+)|^(?:const|let|var)\s+([\w$]+)/gm)){
      const name = m[1] || m[2];
      assert.ok(!seen.has(name), `${name} is in both ${seen.get(name)} and ${where}`);
      seen.set(name, where);
    }
  }
});
