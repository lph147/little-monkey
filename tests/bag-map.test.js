// BAG and MAP (decided 26 October 2026): two more pills like TASKS and MENU, under B and A. BAG opens your bag and MAP
// says the map is coming soon, with I and P on a keyboard.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadGame} = require('./fake-browser');

function playing(){
  const game = loadGame({dom: true, save: {version: 30, started: true, bag: {'桃子': 1}}});
  game.run("mode = 'play'");   // walking about, past the title screen
  return {game, run: code => game.run(code), sheet: game.el('#sheet')};
}

test('BAG and MAP are pills like TASKS and MENU, under B and A', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /<div class="ss bm">[\s\S]*?class="pill" id="bagBtn"[\s\S]*?>BAG<[\s\S]*?class="pill" id="mapBtn"[\s\S]*?>MAP</);
  assert.ok(html.indexOf('id="btnA"') < html.indexOf('id="bagBtn"'), 'after A and B');
});

test('BAG opens your bag, and pressing it again closes it; I on a keyboard does the same', () => {
  const {game, run, sheet} = playing();
  run('pressBag()');
  assert.ok(sheet.querySelector('.bag'), 'your bag');
  assert.match(sheet.querySelector('.label').textContent, /包 bāo · Bag/);
  run('pressBag()');
  assert.equal(run('modal.hidden'), true, 'BAG again closes it');
  game.key('i');
  assert.ok(sheet.querySelector('.bag') && run('!modal.hidden'), 'I opens it');
  game.key('I');
  assert.equal(run('modal.hidden'), true, 'and closes it');
  run('pressMenu(); pressBag()');
  assert.match(sheet.querySelector('.label').textContent, /^Menu$/, 'on another card (the menu), BAG leaves it as it is');
});

test('MAP says the map is coming soon (P on a keyboard too), but not over a card', () => {
  const {game, run} = playing();
  run('globalThis.__said = []; toast = m => __said.push(m)');   // (the messages it would show)
  run('pressMap()');
  game.key('p');
  assert.deepEqual(JSON.parse(run('JSON.stringify(__said)')), ['The map is coming soon!', 'The map is coming soon!']);
  run('pressMenu(); pressMap()');
  assert.equal(run('__said.length'), 2, 'not while the menu is open');
});

test('BAG and MAP do nothing while someone is talking to you', () => {
  const {game, run} = playing();
  run('globalThis.__said = []; toast = m => __said.push(m); talkNext = () => {}');
  run('pressBag(); pressMap()');
  assert.equal(game.el('#sheet').querySelector('.bag'), null, 'no bag');
  assert.equal(run('__said.length'), 0, 'no message');
});
