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
