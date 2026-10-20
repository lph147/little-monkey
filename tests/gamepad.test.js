// Game controllers (js/gamepad.js): each controller button presses one of the game's own, with the Xbox layout
// (the bottom button is A, the right one B), and the D-pad or left stick is the D-pad.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

// A game with a pretend controller plugged in. press(i) and lift(i) its buttons, stick(x, y), then frame(ms) to let the
// game look at it, that many milliseconds into the game.
function withPad(){
  const g = loadGame({dom: true, save: {version: 29, started: true}});
  g.run("mode = 'play'; modal.hidden = true; upright = false");
  g.run("globalThis.__pad = {connected: true, buttons: Array.from({length: 17}, () => ({pressed: false})), axes: [0, 0, 0, 0]}; globalThis.navigator = {getGamepads: () => [__pad, null]}");
  g.run("globalThis.__did = []; pressA = () => __did.push('A'); pressB = () => __did.push('B'); pressMenu = () => __did.push('MENU'); pressSelect = () => __did.push('TASKS')");
  return {
    g,
    press: i => g.run(`__pad.buttons[${i}].pressed = true`),
    lift: i => g.run(`__pad.buttons[${i}].pressed = false`),
    stick: (x, y) => g.run(`__pad.axes = [${x}, ${y}, 0, 0]`),
    frame: ms => g.run(`readPads(${ms})`),
    did: () => JSON.parse(g.run('JSON.stringify(__did.splice(0))')),
    get: expr => JSON.parse(g.run(`JSON.stringify(${expr})`))
  };
}

test('the bottom button is A and the right one B (as on an Xbox); Start is MENU and View or Select is TASKS', () => {
  const p = withPad();
  for (const [i, name] of [[0, 'A'], [1, 'B'], [9, 'MENU'], [8, 'TASKS']]){
    p.press(i); p.frame(1000);
    assert.deepEqual(p.did(), [name]);
    p.frame(1016); p.frame(1032);
    assert.deepEqual(p.did(), [], 'held down, it presses only once');
    p.lift(i); p.frame(1048);
  }
  p.press(0); p.frame(1100); p.lift(0); p.frame(1116); p.press(0); p.frame(1132);
  assert.deepEqual(p.did(), ['A', 'A'], 'pressed again, it presses again');
});

test('the D-pad or the left stick walks, like the D-pad on the screen; a small push of the stick does nothing', () => {
  const p = withPad();
  p.press(12); p.frame(1000);
  assert.equal(p.get('held'), 'up');
  p.lift(12); p.frame(1016);
  assert.equal(p.get('held'), null, 'let go: you stop');
  p.stick(-0.9, 0.2); p.frame(1032);
  assert.equal(p.get('held'), 'left');
  p.stick(0.3, 0.1); p.frame(1048);
  assert.equal(p.get('held'), null, 'a small push');
  p.stick(0.1, 0.8); p.frame(1064);
  assert.equal(p.get('held'), 'down');
});

test('held on a card, a direction moves again after a moment, then quickly; not on a card that opened as you walked', () => {
  const p = withPad();
  p.g.run("globalThis.__moves = []; navFocus = d => __moves.push(d)");
  const moves = () => p.get('__moves.splice(0).length');
  p.g.run('modal.hidden = false');   // a card is open
  p.press(15); p.frame(1000);
  assert.equal(moves(), 1, 'pressed: it moves once');
  p.frame(1200);
  assert.equal(moves(), 0, 'not straight away');
  p.frame(1400); p.frame(1550); p.frame(1700);
  assert.equal(moves(), 3, 'then again and again');
  p.lift(15); p.frame(1716); p.frame(2500);
  assert.equal(moves(), 0);
  p.g.run('modal.hidden = true');   // walking, holding right, when a card opens (such as an animal jumping out)
  p.press(15); p.frame(3000);
  p.g.run('modal.hidden = false');
  p.frame(3500); p.frame(3700);
  assert.equal(moves(), 0, 'you have to press again to move on the card');
});

test('held upright, the controller waits too', () => {
  const p = withPad();
  p.g.run('upright = true');
  p.press(0); p.press(12); p.frame(1000);
  assert.deepEqual(p.did(), []);
  assert.equal(p.get('held'), null);
});

test('with no controller, the game doesn’t keep looking for one', () => {
  const g = loadGame({save: {version: 29, started: true}});
  g.run('globalThis.navigator = {getGamepads: () => [null, null]}');
  g.run('padLoop = 0; watchPads()');
  assert.equal(g.run('padLoop'), 0);
  g.run("navigator.getGamepads = () => [{connected: true, buttons: [], axes: []}]; watchPads()");
  assert.ok(g.run('padLoop') > 0, 'once one connects, it looks every frame');
});
