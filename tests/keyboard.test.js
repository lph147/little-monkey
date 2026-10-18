// On a computer, Space and Enter are the A button, on the title screen and in the intro too.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

// Starts the game and notes which of these buttons get pressed.
function watch(buttons, {mode, save} = {}){
  const game = loadGame({save});
  game.runFrame();
  if (mode) game.run(`mode = '${mode}'`);
  game.run('globalThis.pressed = []');
  for (const [sel, name] of Object.entries(buttons)){
    if (name === null) game.run(`document.querySelector = (find => s => s === '${sel}' ? null : find(s))(document.querySelector)`);   // not on the page
    else if (sel === '#titleButtons .sel') game.run(`document.querySelector('#titleButtons').querySelector = s => s === '.sel' ? {click: () => pressed.push('${name}')} : null`);   // the chosen button
    else game.run(`document.querySelector('${sel}').click = () => pressed.push('${name}')`);
  }
  return {key: (k, o) => game.key(k, o), pressed: () => game.run('pressed.join()')};
}

test('Space and Enter press the chosen button on the title screen', () => {
  for (const key of [' ', 'Enter']){
    const g = watch({'#titleButtons .sel': 'New game'});
    assert.equal(g.key(key).defaultPrevented, true);
    assert.equal(g.pressed(), 'New game', `${key === ' ' ? 'Space' : key} should press New game`);
  }
});

test('Space and Enter press Next in the intro, and Begin at the end', () => {
  for (const key of [' ', 'Enter']){
    const g = watch({'#beginBtn': null, '#nextBtn': 'Next'}, {mode: 'intro'});
    g.key(key);
    assert.equal(g.pressed(), 'Next');
  }
  const g = watch({'#beginBtn': 'Begin', '#nextBtn': 'Next'}, {mode: 'intro'});
  g.key('Enter');
  assert.equal(g.pressed(), 'Begin');
});

test('holding the key down presses only once', () => {
  const g = watch({'#beginBtn': null, '#nextBtn': 'Next'}, {mode: 'intro'});
  g.key(' '); g.key(' ', {repeat: true}); g.key(' ', {repeat: true});
  assert.equal(g.pressed(), 'Next');
});

test('a button chosen with Tab is pressed by the browser, not the A button', () => {
  const g = watch({'#titleButtons .sel': 'Continue'}, {save: {started: true}});
  const e = g.key('Enter', {tabbedTo: true});
  assert.equal(g.pressed(), '');
  assert.equal(e.defaultPrevented, false, 'the browser should be left to press the chosen button');
});
