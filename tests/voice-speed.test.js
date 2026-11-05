// Voice speed (decided 5 November 2026, after a beginner playtested it): Settings' Voice speed, 100% to 70%, slows every
// piece of Chinese the game says, stretched so the voice isn't deeper; and a 🐢 beside each 🔊 says it once more slowly,
// two steps slower than your speed, never below 70% (and isn't there at 70%).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));

test('stretching a clip makes it longer, but no deeper: a note keeps its pitch', () => {
  const g = loadGame({dom: true});
  // a 200 Hz note, half a second, 8000 samples a second
  const r = get(g, `(() => {
    const sr = 8000, x = Float32Array.from({length: sr / 2}, (_, i) => Math.sin(2 * Math.PI * 200 * i / sr));
    const y = stretchSamples(x, sr, 0.7);
    const crossings = a => { let c = 0; for (let i = 1; i < a.length; i++) if (a[i - 1] < 0 && a[i] >= 0) c++; return c / (a.length / sr); };
    const mid = y.subarray(Math.floor(y.length * .1), Math.floor(y.length * .9));
    return {before: x.length, after: y.length, hz: crossings(mid), loud: Math.max(...mid.map(Math.abs))};
  })()`);
  assert.equal(r.after, Math.ceil(r.before / 0.7), 'as long again as 70% speed makes it');
  assert.ok(Math.abs(r.hz - 200) < 8, `still 200 Hz (${r.hz})`);
  assert.ok(r.loud > 0.8 && r.loud < 1.2, 'and as loud');
});

test('the 🐢’s speed: two steps slower than yours, never below 70%, and none at 70%', () => {
  const g = loadGame({dom: true});
  const at = v => { g.run(`S.voiceSpeed = ${v}`); return get(g, 'turtleSpeed()'); };
  assert.deepEqual([1, 0.9, 0.8, 0.7].map(at), [0.8, 0.7, 0.7, null]);
  g.run('S.voiceSpeed = undefined');
  assert.equal(get(g, 'voiceSpeed()'), 1, 'a game from before this: normal speed');
});

test('a 🐢 beside each 🔊 says it again slowly; none at 70%, and none on the syllable drum', () => {
  const g = loadGame({dom: true});
  g.run('S.voiceSpeed = 1; globalThis.__rates = []; openCard(`<div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button><button class="btn primary" data-a="ok">OK</button></div><button class="drum">🔊<span class="dlab"></span></button>`); on("[data-a=say]", () => __rates.push(sayRate()))');
  const sheet = g.el('#sheet'), turtles = sheet.querySelectorAll('[data-turtle]');
  assert.equal(turtles.length, 1, 'beside Hear it, not the drum');
  assert.equal(turtles[0].getAttribute('class'), 'btn turtle', 'the same kind of button, not the main one');
  sheet.querySelector('[data-a=say]').click();
  turtles[0].click();
  assert.deepEqual(get(g, '__rates'), [1, 0.8], '🔊 at your speed, 🐢 at 80%');
  g.run('S.voiceSpeed = 0.7; openCard(`<button class="btn" data-a="say">🔊 Hear it</button>`)');
  assert.equal(g.el('#sheet').querySelectorAll('[data-turtle]').length, 0, 'at 70%, 🔊 is as slow as it goes');
});

test('Settings: Voice speed, − and + a step at a time, from 100% down to 70%', () => {
  const g = loadGame({dom: true, save: {version: 34, started: true, w: {}}});
  g.run('mode = "play"; save = () => {}; say = () => {}; openSettings()');
  const pct = () => g.el('#sheet').querySelector('.speedrow .qpn').textContent;
  assert.equal(pct(), '100%');
  assert.equal(g.el('#sheet').querySelector('[data-a=faster]').disabled, true, 'no faster than normal');
  for (let i = 0; i < 3; i++) g.el('#sheet').querySelector('[data-a=slower]').click();
  assert.equal(pct(), '70%');
  assert.equal(get(g, 'S.voiceSpeed'), 0.7);
  assert.equal(g.el('#sheet').querySelector('[data-a=slower]').disabled, true, 'no slower than 70%');
  g.el('#sheet').querySelector('[data-a=faster]').click();
  assert.equal(pct(), '80%');
});
