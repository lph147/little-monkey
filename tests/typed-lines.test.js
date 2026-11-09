// Typed lines (decided 9 November 2026, the four ideas plan): a line in the speech box comes up a word at a time, each word
// with its pinyin as the voice says it, like karaoke, so you link the sound to the characters. A (or B) while it types
// shows it all at once, the voice carrying on, and A again moves on, so a quick A never skips a line unread. The English and
// ▼ wait till it's all there. Settings' Typed lines switches it off: each line whole, as before.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadGame} = require('./fake-browser');

const tick = () => new Promise(r => setImmediate(r));
const PEACHES = {t: ['一', '，', '二', '。', '两', '个', '桃子', '！'], en: 'One, two. Two peaches!'};   // (the maths lesson’s line, 一，二。两个桃子！)
function talkGame(save){
  const game = loadGame({dom: true, save: save || {version: 8, started: true}});
  game.run("mode = 'play'");
  const box = game.el('#talk');
  return {
    game, box, run: code => game.run(code),
    say(line){ game.run(`globalThis.__said = false; showDialog(speaker('elder'), ${JSON.stringify(line)}).then(() => { __said = true; })`); },
    said: async () => { await tick(); return game.run('__said'); },
    shown: () => box.querySelectorAll('.talkline .tok, .talkline .punct').filter(b => !b.classList.contains('unsaid')).map(b => b.dataset.t || b.textContent),
    waiting: () => box.querySelectorAll('.unsaid').length
  };
}

test('a line types on: its first word at once, the rest keeping their room till they’re said; the English and ▼ wait till it’s all there', () => {
  const t = talkGame();
  assert.equal(t.run('typedLines()'), true, 'on, to begin with');
  t.say(PEACHES);
  assert.deepEqual(t.shown(), ['一', '，'], 'the first word, and the mark after it');
  assert.equal(t.waiting(), 6, 'the rest waiting');
  assert.ok(t.box.classList.contains('typing'));
  assert.equal(t.run('!!typing'), true);
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'game.css'), 'utf8');
  assert.match(css, /\.talk \.unsaid\{visibility:hidden\}/, 'a word waiting keeps its room, so nothing moves as it types');
  assert.match(css, /\.talk\.typing \.sentence-en,\.talk\.typing \.btn\.next\{visibility:hidden\}/, 'the English and ▼ wait, keeping theirs');
  t.game.flush();   // (the voice says it all)
  assert.equal(t.waiting(), 0, 'all there');
  assert.ok(!t.box.classList.contains('typing'), 'the English and ▼ too');
  assert.equal(t.run('typing'), null);
});

test('A while it types shows it all at once, and the voice carries on; A again moves on', async () => {
  const t = talkGame();
  t.say(PEACHES);
  t.run('globalThis.__stops = 0; const stop = stopSpeech; stopSpeech = () => { __stops++; stop(); }');
  assert.deepEqual(t.run("JSON.stringify(buttonLabels(performance.now()))"), '["Show all",""]', 'the label under A says so');
  t.run('pressA()');
  assert.equal(t.waiting(), 0, 'the whole line');
  assert.ok(!t.box.classList.contains('typing'), 'with its English and ▼');
  assert.equal(await t.said(), false, 'not moved on');
  assert.equal(t.run('__stops'), 0, 'the voice still saying it');
  assert.deepEqual(t.run("JSON.stringify(buttonLabels(performance.now()))"), '["Next",""]');
  t.run('pressA()');
  assert.equal(await t.said(), true, 'A again moves on');
});

test('B does the same as A: the whole line, then on', async () => {
  const t = talkGame();
  t.say(PEACHES);
  t.run('pressB()');
  assert.equal(t.waiting(), 0);
  assert.equal(await t.said(), false);
  t.run('pressB()');
  assert.equal(await t.said(), true);
});

test('pressed just as the line comes up, A does nothing; and showing the rest counts as its coming up, so a second A straight after doesn’t skip it', async () => {
  const t = talkGame();
  t.run('globalThis.__now = 5000; performance.now = () => __now');
  t.say(PEACHES);
  t.run('pressA(5100)');
  assert.equal(t.waiting(), 6, 'too soon: still typing');
  t.run('__now = 5400; pressA(5400)');
  assert.equal(t.waiting(), 0, 'the whole line');
  t.run('__now = 5500; pressA(5500)');
  assert.equal(await t.said(), false, 'straight after: still there, to be read');
  t.run('__now = 5800; pressA(5800)');
  assert.equal(await t.said(), true, 'then A moves on');
});

test('the words keep time with the voice: each as its syllables start, a pause at a comma or full stop, its English once it’s all said', () => {
  const t = talkGame();
  t.run('globalThis.__delays = []; const later = setTimeout; setTimeout = (fn, ms) => { __delays.push(ms); return later(fn, ms); }');
  t.say(PEACHES);
  // till the voice starts: a steady pace, 250ms a syllable, from 700ms (in case it doesn't)
  assert.deepEqual(JSON.parse(t.run('JSON.stringify(__delays.slice(-7))')), [1100, 1100, 1600, 1850, 2100, 2100, 2600]);   // (the line’s timers: the last set)
  // the voice starts, its speech 1.9 seconds long: 一 二 两 个 桃子 are 6 syllables, with a pause after the comma (0.6) and the
  // full stop (1), so 7.6 in all, 250ms each; 二 at 1.6, 两 at 3.6, 个 at 4.6, 桃子 at 5.6, all said at 7.6
  t.run('__delays = []; typing.voiced(1.9)');
  assert.deepEqual(JSON.parse(t.run('JSON.stringify(__delays)')), [400, 400, 900, 1150, 1400, 1400, 1900]);
  t.run('__delays = []; S.voiceSpeed = 0.8; typing.voiced(null)');   // (the device’s own voice, its length not known: a steady pace, slower at a slower voice speed)
  assert.deepEqual(JSON.parse(t.run('JSON.stringify(__delays)')), [500, 500, 1125, 1437.5, 1750, 1750, 2375]);
});

test('the voice tells the line when it starts, and how long its speech lasts', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'sound.js'), 'utf8');
  assert.match(src, /function say\(text, onend, who, onstart\)/);
  assert.match(src, /if \(onstart\) onstart\(sl \? sl\.duration : buf\.span \? buf\.span\[1\] : buf\.duration\);/, 'a clip: as it starts, its speech’s length');
  assert.match(src, /u\.onstart = \(\) => \{ if \(uttRef === u\) onstart\(null\); \};/, 'the device’s voice: as it starts, its length not known');
  const cards = fs.readFileSync(path.join(__dirname, '..', 'js', 'cards.js'), 'utf8');
  assert.match(cards, /say\(text, null, id, secs => \{ if \(typed\) typed\.voiced\(secs\); \}\);/, 'the speech box times the line to it');
});

test('a line of one word comes up whole', () => {
  const t = talkGame();
  t.say({t: ['你好', '！'], en: 'Hello!'});
  assert.equal(t.waiting(), 0);
  assert.equal(t.run('typing'), null);
});

test('🔊 and English show it all too', () => {
  const t = talkGame({version: 17, started: true, lines: {'一，二。两个桃子！': 3}});
  t.run("S.lineDay = {'一，二。两个桃子！': todayKey()}");   // (heard three times today: its English behind its button)
  t.say(PEACHES);
  t.box.querySelector('[data-a=en]').click();
  assert.equal(t.waiting(), 0, 'English: the whole line');
  assert.equal(t.box.querySelector('.sentence-en').hidden, false, 'and its English');
  t.run('talkNext()');
  t.say(PEACHES);
  t.box.querySelector('[data-a=say]').click();
  assert.equal(t.waiting(), 0, '🔊: the whole line, said again');
});

test('moving on stops the line before typing, and the next types on its own', () => {
  const t = talkGame();
  t.say(PEACHES);
  t.run('talkNext()');   // (as a step might, straight on)
  assert.equal(t.run('typing'), null);
  t.say({t: ['我', '要', '吃', '桃子', '！'], en: 'I want to eat a peach!'});
  assert.deepEqual(t.shown(), ['我']);
  t.game.flush();
  assert.equal(t.waiting(), 0);
});

test('Settings, Typed lines: off, every line comes up whole, as before; kept with the game, and a new game keeps it', () => {
  const t = talkGame();
  t.run('openSettings()');
  const sheet = t.game.el('#sheet');
  assert.match(sheet.querySelector('[data-m="typed"]').textContent, /Typed lines On/);
  sheet.querySelector('[data-m="typed"]').click();
  assert.match(sheet.querySelector('[data-m="typed"]').textContent, /Typed lines Off/);
  assert.equal(JSON.parse(t.run('localStorage.getItem(KEY)')).typed, false, 'kept with the game');
  t.run('closeCard()');
  t.say(PEACHES);
  assert.equal(t.waiting(), 0, 'the whole line at once');
  assert.ok(!t.box.classList.contains('typing'));
  assert.equal(t.run('fresh().typed'), true, 'a new game starts with it on');
  t.run('newGameIn(2)');
  assert.equal(t.run('S.typed'), false, 'but one you start keeps your choice, as with your other settings');
});
