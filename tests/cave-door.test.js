// The cave door (the way out of the area) opens as soon as everything else is done.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

test('the cave door opens as soon as the area is ready, without a reload', () => {
  const version = loadGame().run('SAVE_VERSION');
  // Everything is done apart from meeting the last hidden animal.
  const game = loadGame({save: {version, started: true, met: ['rabbit', 'fox', 'squirrel'],
    areas: {1: {elder: 2, hungry: 'done', thirsty: 'done', gate: true, story: true}}}});
  // Note how the door is drawn each time the map is drawn.
  game.run(`globalThis.doorDrawn = [];
    LOOKS.caveDoor = (draw => (...a) => { doorDrawn.push(areaDone() ? 'open' : 'closed'); return draw(...a); })(LOOKS.caveDoor);`);
  game.run('drawWorld(1000)');
  assert.equal(game.run('doorDrawn.length'), 0, 'the map should not be redrawn while nothing has changed');
  game.run("S.met.push('goat')");   // meeting the last animal
  game.run('drawWorld(1016)');
  assert.equal(game.run('doorDrawn.at(-1)'), 'open', 'the next frame should draw the door open');
  game.run('drawWorld(1032)');
  assert.equal(game.run('doorDrawn.length'), 1, 'the map should only be redrawn once');
});
