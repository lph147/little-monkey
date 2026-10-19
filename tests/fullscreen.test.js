// Playing full screen on a phone (js/fullscreen.js): Play full screen on the title screen in a phone's browser,
// going full screen on Android, the steps to add it to an iPhone's home screen, and nothing once it's the app.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
// The game on a pretend device: touch (a phone) or not (a computer), opened as the app or in the browser.
function on(device, {app = false, storage} = {}){
  const game = loadGame({dom: true, storage});
  game.run(`globalThis.__calls = [];
    window.matchMedia = q => ({matches: q === '(pointer: coarse)' ? ${device !== 'computer'} : /display-mode: (fullscreen|standalone)/.test(q) ? ${app} : false});
    globalThis.navigator = {userAgent: ${JSON.stringify(device === 'iphone' ? IPHONE : ANDROID)}};
    document.documentElement = ${device === 'iphone' ? '{}' : '{requestFullscreen(){ __calls.push("full"); return Promise.resolve(); }}'};
    globalThis.screen = {orientation: {lock(o){ __calls.push(o); return Promise.resolve(); }}};
    titleText();`);
  return game;
}
const title = game => game.el('#titleText').innerHTML;
const calls = game => JSON.parse(game.run('JSON.stringify(__calls)'));
const later = () => new Promise(r => setImmediate(r));

test('on a computer, or opened as the app, there’s no Play full screen', () => {
  assert.doesNotMatch(title(on('computer')), /Play full screen/);
  assert.doesNotMatch(title(on('android', {app: true})), /Play full screen/);
  assert.doesNotMatch(title(on('iphone', {app: true})), /Play full screen/);
});

test('on an Android phone’s browser, Play full screen goes full screen and sideways', async () => {
  const game = on('android');
  assert.match(title(game), /Play full screen/);
  game.el('#fullBtn').onclick();
  await later(); await later();
  assert.deepEqual(calls(game), ['full', 'landscape']);
});

test('on Android, Install the app appears when the browser offers it', async () => {
  const game = on('android');
  assert.doesNotMatch(title(game), /Install the app/, 'not until the browser offers it');
  game.run(`installPrompt = {prompt(){ __calls.push('install'); }, userChoice: Promise.resolve({outcome: 'accepted'})}; titleText()`);
  assert.match(title(game), /Install the app/);
  game.el('#installBtn').onclick();
  await later(); await later();
  assert.deepEqual(calls(game), ['install']);
  assert.doesNotMatch(title(game), /Install the app/, 'installed: no more offer');
});

test('on Android, once the app has been opened, the browser says you have it', () => {
  const storage = {};
  const app = on('android', {app: true, storage});
  const note = [...app.storage].find(([k]) => k === 'xiaohouzi-v2-app');
  assert.ok(note, 'the app leaves a note');
  const browser = on('android', {storage: Object.fromEntries(app.storage)});
  assert.match(title(browser), /You have the app: open 小猴子 from your home screen/);
});

test('on an iPhone, Play full screen shows how to add it to the home screen; I’ve added it hides it for good', () => {
  const game = on('iphone');
  assert.match(title(game), /Play full screen/);
  game.el('#fullBtn').onclick();
  const card = game.el('#sheet').innerHTML;
  assert.match(card, /Add to Home Screen/);
  assert.match(card, /Copy to a file/, 'it says how to carry a game across to the app');
  assert.match(card, /data-a="yes"[^>]*>I’ve added it/);
  game.el('#sheet').querySelector('[data-a=yes]').onclick();
  assert.doesNotMatch(title(game), /Play full screen/);
  game.run('Date.now = () => 1e15; titleText()');
  assert.doesNotMatch(title(game), /Play full screen/, 'still hidden, much later');
});

test('on an iPhone, Not now hides it for a day', () => {
  const game = on('iphone');
  game.el('#fullBtn').onclick();
  game.el('#sheet').querySelector('[data-a=no]').onclick();
  assert.doesNotMatch(title(game), /Play full screen/);
  game.run('const __now = Date.now(); Date.now = () => __now + 2 * 86400000; titleText()');
  assert.match(title(game), /Play full screen/, 'back the next day');
});
