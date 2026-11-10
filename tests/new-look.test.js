// The new look, on trial (decided 10 November 2026, after the look review): a hidden switch, kept in the browser, that
// draws the screen at double detail. Off, as it is unless you use the link, the game is drawn exactly as it was: every
// other test runs with it off.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');
const {SCREENS} = require('../tools/screens');

const SAVE = {version: 21, started: true};
const withLook = look => loadGame({save: SAVE, storage: look ? {'xiaohouzi-look': look} : {}});

test('off unless you switch it on: the screen is 240 by 160, and the title says nothing of it', () => {
  const game = withLook(null);
  assert.equal(game.run('LOOK'), 'old');
  assert.equal(game.run('SCALE'), 1);
  assert.equal(game.run('buf.width + "x" + buf.height'), '240x160');
  game.run('toTitle()');
  assert.equal(game.el('#version').textContent, 'v' + game.run('VERSION'));
});

test('switched on, the screen is drawn at double detail, 480 by 320, and the title says so', () => {
  const game = withLook('new');
  assert.equal(game.run('NEW_LOOK'), true);
  assert.equal(game.run('SCALE'), 2);
  assert.equal(game.run('buf.width + "x" + buf.height'), '480x320');
  assert.equal(game.run('VW * T + "x" + VH * T'), '240x160', 'everything is still measured in today’s pixels');
  game.run('toTitle()');
  assert.equal(game.el('#version').textContent, 'v' + game.run('VERSION') + ' · new look');
});

test('the title and the map are drawn with it on, and its sample of word pictures has every picture', () => {
  const game = withLook('new');
  assert.doesNotThrow(() => game.run('drawScene(0, 1000); lookSample(); fitToScreen(); drawWorld(2000); fitToScreen();'));
  assert.equal(game.run('LOOK_SAMPLE.filter(w => !PICTURES[w]).join()'), '');
});

test('fitted the other way: the picture is first made a whole number of times bigger', () => {
  const game = withLook('smooth');
  assert.equal(game.run('FIT_SMOOTH'), true);
  assert.equal(game.run('SCALE'), 2);
  game.run('cv.width = 1230; cv.height = 820; fitToScreen();');   // (an iPhone's screen: 410 by 273, three of its pixels each)
  assert.equal(game.run('fitCanvas.width + "x" + fitCanvas.height'), '1440x960');
  game.run('toTitle()');
  assert.match(game.el('#version').textContent, /new look, smooth$/);
});

test('anything else kept there is the old look', () => {
  const game = withLook('shiny');
  assert.equal(game.run('LOOK'), 'old');
  assert.equal(game.run('SCALE'), 1);
});

test('the screens gallery shows it switched on', () => {
  assert.deepEqual(SCREENS.filter(s => s.look).map(s => s.look).sort(), ['new', 'new', 'smooth']);
});
