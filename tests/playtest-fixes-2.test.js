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

test('crawling through the hollow pine in the dark pines: it shakes with each step you take inside it, crumbs of bark fall, and you hear yourself scuffling', () => {
  const g = loadGame({dom: true, save: {version: 30, started: true, areas: {1: {chapter: 1, cow: 1}}, pos: {place: 'darkPines', x: 28, y: 7, dir: 'down'}}});
  g.run("mode = 'play'; globalThis.__sfx = []; SFX.scuffle = () => __sfx.push('scuffle'); placePlayer()");
  const log = get(g, "OBJECT_PIECES.filter(p => p.crawl).map(p => [p.look, p.x, p.y, p.w, p.h, !!p.top, !!p.baked])");
  assert.deepEqual(log, [['hollowLog', 28, 8, 2, 4, true, false]], 'its own pictures, drawn each moment (so it can shake), not baked into the map');
  g.run('pl.mv = {fx: 28, fy: 7, tx: 28, ty: 8, t0: performance.now() - STEP * .5, dur: STEP}; crawlThrough(performance.now())');
  assert.deepEqual(get(g, '__sfx'), ['scuffle'], 'in at its far end');
  assert.ok(get(g, 'performance.now() - OBJECT_PIECES.find(p => p.crawl).rustle') < 100, 'it shakes');
  assert.equal(get(g, 'fallingLeaves.filter(f => f.bark).length'), 2, 'a crumb of bark off each side');
  g.run('crawlThrough(performance.now())');
  assert.deepEqual(get(g, '__sfx'), ['scuffle'], 'once a step');
  g.run('pl.mv = {fx: 26, fy: 4, tx: 27, ty: 4, t0: performance.now() - STEP * .5, dur: STEP}; crawlThrough(performance.now())');
  assert.deepEqual(get(g, '__sfx'), ['scuffle'], 'walking anywhere else: nothing');
});
