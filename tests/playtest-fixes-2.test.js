// Fixes from playtesting chapter 1 (28 October 2026): the dark pines have the pine wood's music, no character stands where
// a pine's top hides it (the rabbit in its nook by the way through the dark pines), a battle's health bars are drawn to one
// scale, and once the cow is home, a hint says the big monkey has an idea for the feast (the garden).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));

test('the dark pines have the pine wood’s music', () => {
  const g = loadGame();
  assert.deepEqual(get(g, "[PLACES.darkPines.music, PLACES.pineWood.music]"), ['pineWood', 'pineWood']);
});

test('no character stands on a square a pine’s top hides (the one above a pine)', () => {
  const g = loadGame();
  const hidden = get(g, `ALL_NPCS.filter(n => !n.flies && PLACES[n.place]).filter(n => {
    const row = PLACES[n.place].map[n.y + 1], legend = {...AREA.legend, ...(PLACES[n.place].legend || {})};
    return row && legend[row[n.x]] && legend[row[n.x]].look === 'pine';
  }).map(n => n.id)`);
  assert.deepEqual(hidden, [], 'these stand just above a pine, so its top hides them');
});

test('in a battle, both health bars are drawn to one scale: a snake’s (20) less than half as long as yours (50)', () => {
  const g = loadGame();
  const k = html => Number(/--hpk:([\d.]+)/.exec(html)[1]);
  assert.equal(k(g.run('healthHTML(20, 20)')), 0.4, 'a snake');
  assert.equal(k(g.run('healthHTML(50, 50)')), 1, 'you, or a bear');
  assert.equal(k(g.run('healthHTML(10, 50)')), 1, 'how long the bar is depends on the most you can have, not what you have now');
});
