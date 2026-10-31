// The prologue in a clear order (decided 31 October 2026, after a new player walked off and talked to everyone at once):
// the old monkey calls you over on your first step, before anything else.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const born = (area = {}) => {
  const g = loadGame({dom: true, save: {version: 33, started: true, w: {'石头': {lv: 1, ok: 0}}, areas: {1: area}, pos: {place: 'meadow', x: 9, y: 2, dir: 'up'}}});
  g.run("mode = 'play'; placePlayer(); globalThis.__talked = []; talk = async n => { __talked.push(n.id); }");
  return g;
};
const step = async (g, x, y) => {
  g.run(`S.pos = {place: 'meadow', x: ${x}, y: ${y}, dir: 'down'}; placePlayer(); globalThis.__done = false; arrive(${x}, ${y}).then(runEvents).then(() => __done = true)`);
  for (let i = 0; i < 20 && !g.run('__done'); i++){ await new Promise(r => setImmediate(r)); g.flush(); }
};

test('just born, your first step brings the old monkey calling you over: a ! over him, you turn to him, and he talks', async () => {
  const g = born();
  await step(g, 9, 3);
  assert.deepEqual(get(g, '__talked'), ['elder']);
  assert.equal(get(g, 'pl.dir'), 'up', 'you turn towards him, up by your stone');
});

test('once you’ve said hello, he lets you go about', async () => {
  const g = born({elder: 1});
  await step(g, 9, 3);
  assert.deepEqual(get(g, '__talked'), []);
});
