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

test('with a task to do, a tip points at Select; once you know 3 words, one points at Start, each for a few seconds', () => {
  const w = Object.fromEntries(['石头', '山', '花'].map(hz => [hz, {lv: 1, due: 0, ok: 0}]));
  const game = playing({version: 21, started: true, w, tips: {walk: 1, talk: 1, look: 1, grey: 1}, pos: {x: 9, y: 5, dir: 'down'}});
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'select', 'there is a task: say hello to the old monkey');
  game.run("tipPressed('#selectBtn')");
  assert.equal(get(game, 'S.tips.select'), 1, 'pressing Select is enough');
  game.run('updateTips(2000)');
  assert.equal(showing(game), 'start');
  game.run('updateTips(6000)');
  assert.equal(showing(game), 'start', 'still there after 4 seconds');
  game.run('updateTips(10500)');
  assert.equal(showing(game), null, 'gone after 8');
  assert.equal(get(game, 'S.tips.start'), 1);
});

test('the grey-words tip shows during a line, once', () => {
  const game = playing({version: 17, started: true, tips: {walk: 1, talk: 1, look: 1}});
  game.run("showDialog(speaker('elder'), L.go)");
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'grey');
  assert.equal(get(game, 'S.tips.grey'), 1, 'it counts as seen straight away');
});

test('no tips on the title screen or in the opening', () => {
  const game = loadGame({dom: true});
  game.run('updateTips(1000)');
  assert.equal(showing(game), null);
});
