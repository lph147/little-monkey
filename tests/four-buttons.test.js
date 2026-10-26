// The console's controls (tried from 26 October 2026): X opens your bag and Y the map (still to come), as an Xbox
// controller's four buttons; a thumbstick under the D-pad walks like it; and on a short screen the controls shrink to
// fit. (Pressing them with a finger was checked in a real browser: the test browser has no touches.)
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

function playing(){
  const game = loadGame({dom: true, save: {version: 30, started: true, bag: {'桃子': 1}}});
  game.run("mode = 'play'");   // walking about, past the title screen
  return {game, run: code => game.run(code), sheet: game.el('#sheet')};
}

test('X opens your bag, and pressing it again closes it; I on a keyboard does the same', () => {
  const {game, run, sheet} = playing();
  run('pressBag()');
  assert.equal(run('modal.hidden'), false);
  assert.ok(sheet.querySelector('.bag'), 'your bag');
  assert.match(sheet.querySelector('.label').textContent, /包 bāo · Bag/);
  run('pressBag()');
  assert.equal(run('modal.hidden'), true, 'X again closes it');
  game.key('i');
  assert.ok(sheet.querySelector('.bag') && run('!modal.hidden'), 'I opens it');
  game.key('I');
  assert.equal(run('modal.hidden'), true, 'and closes it');
  run('pressMenu()');
  run('pressBag()');
  assert.match(sheet.querySelector('.label').textContent, /^Menu$/, 'on another card (the menu), X leaves it as it is');
});

test('Y says the map is coming soon (P on a keyboard too), but not over a card', () => {
  const {game, run} = playing();
  run('globalThis.__said = []; toast = m => __said.push(m)');   // (the messages it would show)
  run('pressMap()');
  game.key('p');
  assert.deepEqual(JSON.parse(run('JSON.stringify(__said)')), ['The map is coming soon!', 'The map is coming soon!']);
  run('pressMenu(); pressMap()');
  assert.equal(run('__said.length'), 2, 'not while the menu is open');
});

test('X and Y do nothing while someone is talking to you', () => {
  const {game, run} = playing();
  run('globalThis.__said = []; toast = m => __said.push(m); talkNext = () => {}');
  run('pressBag(); pressMap()');
  assert.equal(game.el('#sheet').querySelector('.bag'), null, 'no bag');
  assert.equal(run('__said.length'), 0, 'no message');
});

test('the thumbstick walks the way it points most, once pushed a little way from its middle, and its knob follows your thumb as far as its rim', () => {
  const {run} = playing();
  run('stick.getBoundingClientRect = () => ({left: 0, top: 0, width: 88, height: 88})');   // 88 wide: its middle at 44, 44
  const dir = (x, y) => run(`stickDir({clientX: ${x}, clientY: ${y}})`);
  assert.equal(dir(44, 44), null, 'in the middle');
  assert.equal(dir(50, 46), null, 'a small push: nothing yet');
  assert.equal(dir(74, 50), 'right');
  assert.equal(run('knob.style.transform'), 'translate(26px, 5px)', 'the knob stops at the rim');
  assert.equal(dir(39, 4), 'up');
  assert.equal(dir(4, 60), 'left');
  assert.equal(dir(50, 84), 'down');
  assert.equal(dir(52, 48), null, 'back near the middle');
});

test('on a short screen, the controls shrink together until the console fits, never below 60%, and the speaker goes; with room, they are their full size', () => {
  const {run} = playing();
  // a pretend console: 100 points that don't shrink (the screen's edges, the labels), and 260 of controls that do
  run(`globalThis.__con = {dataset: {}, k: 1, style: {setProperty(n, v){ __con.k = +v; }}, get offsetHeight(){ return 100 + 260 * this.k; }}`);
  run('fitControls(400, __con)');
  assert.deepEqual(JSON.parse(run('JSON.stringify([__con.k, __con.dataset.ctl])')), [1, ''], 'room for them all: full size');
  run('fitControls(300, __con)');
  const [k, ctl, tall] = JSON.parse(run('JSON.stringify([__con.k, __con.dataset.ctl, __con.offsetHeight])'));
  assert.ok(tall <= 300 && tall > 297, `fits, with next to nothing to spare (${tall})`);
  assert.ok(k > .76 && k < .77, `shrunk to about 77% (${k})`);
  assert.equal(ctl, 'tight', 'the speaker goes');
  run('fitControls(150, __con)');
  assert.equal(JSON.parse(run('__con.k')), .6, 'never smaller than 60%');
});
