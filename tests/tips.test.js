// Tips instead of How to play: a new game goes straight to being born from the stone, and a bubble points
// at a control the first time you need it. Each tip shows once.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
const showing = game => game.run('tip ? tip.id : null');
function playing(save){   // walking about on the mountain, nothing open
  const game = loadGame({dom: true, save});
  game.run("mode = 'play'; placePlayer();");
  return game;
}

test('a new game starts with being born from the stone, not a page of How to play', () => {
  const game = loadGame({dom: true});
  game.run('startGame()');
  const html = game.el('#sheet').innerHTML;
  assert.ok(!/How to play/.test(html), 'no How to play');
  assert.match(html, /石头/, 'the stone’s new-word card comes first');
});

test('the first tip points at the D-pad, and goes once you take a step', () => {
  const game = playing();
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'walk');
  game.run("pl.mv = {fx:9, fy:2, tx:9, ty:3, t0:1000}; updateTips(1100)");
  assert.equal(showing(game), null);
  assert.equal(get(game, 'S.tips.walk'), 1, 'it won’t show again');
});

test('facing someone for the first time, a tip says to press A to talk; pressing A is enough', () => {
  const game = playing({version: 17, started: true, tips: {walk: 1}, pos: {x: 7, y: 2, dir: 'up'}});   // facing the old monkey
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'talk');
  assert.match(game.run("$('#tip').innerHTML"), /Press <b>A<\/b> to talk/);
  game.run("tipPressed('#btnA')");
  assert.equal(get(game, 'S.tips.talk'), 1);
  assert.equal(showing(game), null);
});

test('facing something to look at, the tip says to press A to look', () => {
  const game = playing({version: 17, started: true, tips: {walk: 1, talk: 1}, pos: {x: 12, y: 7, dir: 'down'}});   // facing the tree, a new word
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'look');
});

test('Tasks and Menu have no tips: the old monkey tells you about them instead', () => {
  const w = Object.fromEntries(['石头', '山', '花'].map(hz => [hz, {lv: 1, due: 0, ok: 0}]));
  const game = playing({version: 21, started: true, w, tips: {walk: 1, talk: 1, look: 1, grey: 1}, pos: {x: 9, y: 5, dir: 'down'}});
  game.run('updateTips(1000)');
  assert.equal(showing(game), null, 'no tip, though there is a task and you know 3 words');
  const said = JSON.stringify(get(game, 'AREA.talk.elder'));
  assert.match(said, /press TASKS/, 'the old monkey mentions TASKS');
  assert.match(said, /MENU shows the words/, 'and MENU');
});

test('your very first line: a tip says to tap any word, once, and goes when you tap one', () => {
  const game = playing({version: 17, started: true, tips: {walk: 1, talk: 1, look: 1}});
  game.run("showDialog(speaker('elder'), L.hi, {teach: '你好'})");
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'tap');
  assert.equal(game.run("$('#tip').innerHTML"), 'Tap any word to see what it means');
  assert.equal(game.run('TIPS.tap.at'), '#talk .tok', 'pointing at a word in the line');
  assert.equal(get(game, 'S.tips.tap'), 1, 'it counts as seen straight away: just this line');
  game.run(`talkBox.querySelector('.tok[data-t="你好"]').click()`);
  assert.equal(showing(game), null, 'tapping a word: it goes');
  assert.match(game.run("talkBox.querySelector('.talkline .gloss').textContent"), /你好 nǐ hǎo · hello/, 'and its meaning shows beside the line');
  const lines = Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f'].map(k => [k, 1]));   // a game that has seen a few lines already
  const old = playing({version: 17, started: true, tips: {walk: 1, talk: 1, look: 1, grey: 1}, lines});
  old.run("showDialog(speaker('elder'), L.hi, {teach: '你好'})");
  old.run('updateTips(1000)');
  assert.equal(showing(old), null, 'not for a player who has been talking for a while');
});

test('the grey-words tip shows during a line, once', () => {
  const game = playing({version: 17, started: true, tips: {walk: 1, talk: 1, look: 1, tap: 1}});
  game.run("showDialog(speaker('elder'), L.go)");
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'grey');
  assert.equal(get(game, 'S.tips.grey'), 1, 'it counts as seen straight away');
  const grey = game.el('#talk').querySelectorAll('.tok.listen');
  assert.ok(grey.length > 1 && grey.every(t => t.classList.contains('tipglow')), 'every grey word lit, not just the first');
  game.run('hideTip()');
  assert.ok(!game.el('#talk').querySelectorAll('.tipglow').length, 'and none once it goes');
});

test('no tips on the title screen or in the opening', () => {
  const game = loadGame({dom: true});
  game.run('updateTips(1000)');
  assert.equal(showing(game), null);
});
