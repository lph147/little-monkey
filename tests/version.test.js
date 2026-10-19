// The version number on the title screen, which goes up with every commit (.githooks/pre-commit).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {loadGame} = require('./fake-browser');

test('the title screen shows the version', () => {
  const game = loadGame();
  const v = game.run('VERSION');
  assert.ok(Number.isInteger(v) && v > 0);
  game.run('toTitle()');
  assert.equal(game.el('#version').textContent, 'v' + v);
});

test('a commit raises the version by itself (the hook is in the project)', () => {
  const hook = fs.readFileSync(path.join(__dirname, '..', '.githooks', 'pre-commit'), 'utf8');
  assert.match(hook, /node tools\/bump-version\.js && git add js\/version\.js/);
});
