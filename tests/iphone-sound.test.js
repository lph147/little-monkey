// Sound on an iPhone (19 October 2026): the silent switch doesn't mute the game (iOS 17 and later), and sound that
// an iPhone has put on hold (interrupted, after the phone is locked, a call or another app) starts again.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

function withSound(state){
  const game = loadGame();
  game.run(`globalThis.__resumed = 0; globalThis.navigator = {audioSession: {type: 'auto'}};
    window.AudioContext = class { constructor(){ this.state = '${state}'; } resume(){ __resumed++; this.state = 'running'; return Promise.resolve(); } }; AC = null`);
  return game;
}

test('the game asks an iPhone to play its sound even with the silent switch on', () => {
  const game = withSound('running');
  game.run('getAC()');
  assert.equal(game.run('navigator.audioSession.type'), 'playback');
});

test('sound an iPhone has put on hold (interrupted) starts again, as suspended sound does', () => {
  for (const state of ['interrupted', 'suspended']){
    const game = withSound(state);
    game.run('getAC()');
    assert.equal(game.run('__resumed'), 1, `${state}: it starts again`);
  }
  const playing = withSound('running');
  playing.run('getAC()');
  assert.equal(playing.run('__resumed'), 0, 'already playing: nothing to do');
});

test('without audioSession (older phones, other browsers), the sound still starts', () => {
  const game = loadGame();
  game.run("globalThis.navigator = {}; window.AudioContext = class { constructor(){ this.state = 'running'; } }; AC = null");
  assert.equal(game.run('getAC() !== null'), true);
});

// An animal's name as it jumps out (or an enemy's as a battle begins) is said in full before what comes next, which would
// otherwise cut it off (4 November 2026: the owl's name, 猫头鹰, was cut off by its line, after a fixed 0.9 seconds).
test('a name is said in full before the game goes on: a long one waits till it ends, a short one the usual pause', async () => {
  const game = loadGame({dom: true});
  const tick = () => new Promise(r => setImmediate(r));
  game.run(`globalThis.__end = null; globalThis.__done = false;
    say = (t, onend) => { __end = onend; speaking = true; speakSafety = performance.now() + 5000; };
    sayFully('猫头鹰', 900).then(() => { __done = true; })`);
  game.flush(); await tick();
  assert.equal(game.run('__done'), false, 'after the usual pause, still saying it: it waits');
  game.run('speaking = false; __end()'); await tick();
  game.flush(); await tick();
  assert.equal(game.run('__done'), true, 'said: a moment more, and on');
  game.run(`__done = false; say = (t, onend) => { onend(); }; sayFully('蛇', 700).then(() => { __done = true; })`);
  await tick(); assert.equal(game.run('__done'), false, 'a short one: still the usual pause');
  game.flush(); await tick();
  assert.equal(game.run('__done'), true);
  assert.match(game.run("wildAppears.toString() + fight.toString()"), /sayFully\(a\.hz, 900\)[\s\S]*sayFully\(f\.word, 700\)/, 'used as an animal jumps out, and as a battle begins');
});
