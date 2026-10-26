// A task's arrow, off the screen, points the way you can walk there (decided 26 October 2026, after playing it: on the
// mountain path, below the grassy banks, it pointed straight up them at the way out, when the way up is the stone steps on
// the left). On the screen, it's over the target itself, as before.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
function game(x, y){   // on the mountain path, at x, y, on the way up
  const g = loadGame({save: {version: 25, started: true, areas: {1: {gate: true, climb: 1}}, pos: {place: 'path', x, y, dir: 'up'}}});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  return g;
}
// the screen, 15 squares by 10, as if it were centred on you
const screen = (x, y) => `([sx, sy]) => sx >= ${x - 7} && sx <= ${x + 7} && sy >= ${y - 5} && sy <= ${y + 4}`;

test('off the screen, a task’s arrow points the way you can walk there: round the grassy banks you can’t climb, up the stone steps', () => {
  const g = game(16, 13);   // below the banks, by the river
  const path = get(g, 'routeTo([16, 0])');   // the way on up to the river valley
  assert.ok(path, 'there’s a way');
  assert.deepEqual(path[0], [16, 13], 'from where you stand');
  assert.ok(path.some(([x, y]) => x <= 3 && (y === 11 || y === 12)), 'up the stone steps on the left');
  assert.ok(!path.some(([x, y]) => x >= 15 && (y === 11 || y === 12)), 'never up the grassy banks');
  const aim = get(g, `arrowAim([16, 0], ${screen(16, 13)})`);
  assert.ok(aim[0] < 9, `the arrow is at the left of the screen, where the way leaves it (${aim})`);
  assert.deepEqual(get(g, `arrowAim([16, 9], ${screen(16, 13)})`), [16, 9], 'something on the screen: the arrow is over it, as before');
});

test('the way down a bank is a hop, so an arrow below one points straight down it', () => {
  const g = game(16, 9);   // above the banks
  const path = get(g, 'routeTo([16, 19])');   // back down to the meadow
  assert.ok(path.some(([x, y]) => y === 13) && !path.some(([x, y]) => y === 11 || y === 12), 'down the bank in one hop, landing below it');
  assert.ok(!path.some(([x]) => x <= 3), 'not round by the stone steps');
});

test('with no way to walk there from here, the arrow points straight at it', () => {
  const g = game(16, 13);
  assert.equal(get(g, 'routeTo([22, 5])'), null, 'up on the rock: no way there');
  assert.deepEqual(get(g, `arrowAim([22, 5], ${screen(16, 13)})`), [22, 5]);
});

test('the way is worked out again only when you move, or the target or the map changes', () => {
  const g = game(16, 13);
  g.run('routeTo([16, 0])');
  assert.equal(g.run('routeTo([16, 0]) === routeTo([16, 0])'), true, 'the same way, not worked out again');
  g.run("S.pos = {place: 'path', x: 15, y: 13, dir: 'left'}; placePlayer()");
  assert.deepEqual(get(g, 'routeTo([16, 0])[0]'), [15, 13], 'from where you stand now');
});
