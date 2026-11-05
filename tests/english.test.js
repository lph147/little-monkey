// A line's English (decided 5 November 2026, after playing it: hide and seek's lines came with no English, though it had
// been ages since you'd heard them): shown the first three times you hear a line, and again whenever you last heard it
// on an earlier day; otherwise behind the English button (heardLine, js/state.js).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const AT_HOME = {elder: 2};
function game(lines = {}, lineDay){
  const g = loadGame({dom: true, save: {version: 34, started: true, w: {'你好': {lv: 1, ok: 2}}, lines, ...(lineDay ? {lineDay} : {}), areas: {1: AT_HOME}, pos: {place: 'meadow', x: 10, y: 10, dir: 'down'}}});
  g.run("mode = 'play'; placePlayer()");
  return g;
}
const shows = g => { g.run("closeTalk(); showDialog(speaker('elder'), L.hideAsk)"); const t = g.el('#talk'); return !t.querySelector('.sentence-en').hidden && !t.querySelector('[data-a=en]'); };
const KEY = '我们来捉迷藏吧！';

test('a line’s English shows the first three times you hear it, then it’s behind the English button', () => {
  const g = game();
  assert.deepEqual([shows(g), shows(g), shows(g), shows(g), shows(g)], [true, true, true, false, false]);
  assert.equal(g.run(`S.lines['${KEY}']`), 5, 'counted');
  assert.equal(g.run(`S.lineDay['${KEY}']`), g.run('todayKey()'), 'and the day you last heard it');
});

test('…and again whenever you last heard it on an earlier day (or before days were kept)', () => {
  assert.equal(shows(game({[KEY]: 9}, {[KEY]: '2026-1-1'})), true, 'heard often, but not today');
  assert.equal(shows(game({[KEY]: 1})), true, 'an old save’s line: heard once, before days were kept');
  const g = game({[KEY]: 9});
  g.run(`S.lineDay = {'${KEY}': todayKey()}`);
  assert.equal(shows(g), false, 'heard today already, many times: behind the button');
});
