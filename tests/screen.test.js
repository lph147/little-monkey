// The screen's size, and your tasks: on a phone held upright the screen shows more of the map; Select
// shows your tasks, and a new task is announced with a message and a red dot on Select.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

// The page as a browser would lay it out: the window, how wide the console is, and the height of
// everything on the page but the screen (the controls and the console's edges).
function sized(game, {width, height, console: shell, rest}){
  game.run(`innerWidth = ${width}; innerHeight = ${height}; $('.console').clientWidth = ${shell};
    $('.app').offsetHeight = ${rest}; cv.offsetHeight = 0; fit();`);
  return {rows: game.run('VH'), buffer: game.run('buf.height'), w: parseFloat(game.run('cv.style.width')), h: parseFloat(game.run('cv.style.height'))};
}

test('a phone held upright shows more rows of the map; a small phone or a computer the usual 10', () => {
  const game = loadGame();
  const phone = sized(game, {width: 375, height: 812, console: 351, rest: 300});
  assert.ok(phone.rows > 14 && phone.rows <= 18, `a tall phone should show 15 to 18 rows, now there's no header or task box, not ${phone.rows}`);
  assert.equal(phone.buffer, phone.rows * 16, 'the picture is drawn that many rows tall');
  assert.ok(phone.h <= 812 - 300, 'and the screen still fits on the page');
  const small = sized(game, {width: 360, height: 640, console: 336, rest: 420});
  assert.equal(small.rows, 10, 'a small phone has room for the usual 10');
  const desk = sized(game, {width: 1280, height: 900, console: 496, rest: 460});
  assert.equal(desk.rows, 10, 'a computer window this size shows 10');
});

function taskGame(extra = {}){
  const game = loadGame({dom: true, save: {version: 21, started: true, ...extra}});
  game.run("mode = 'play'; here().elder = 2; here().hungry = 'asked'; here().thirsty = 'asked';");
  return {game, sheet: game.el('#sheet'), run: code => game.run(code)};
}

test('Select opens your tasks: your level, shells and words, what to do now, then the chapter’s checklist', () => {
  const {sheet, run} = taskGame({shells: 4});
  const tasks = JSON.parse(run('JSON.stringify(getTasks().map(t => t.text))'));
  run('pressSelect()');
  const text = sheet.textContent;
  assert.match(text, /Level 1/);
  assert.match(text, /4 words|0\/\d+ words/);
  for (const t of tasks) assert.ok(text.includes(t), `the task list should include "${t}"`);
  assert.ok(text.indexOf(tasks[0]) < text.indexOf('Prologue'), 'what to do now comes first, then the checklist');
  run('pressSelect()');
  assert.equal(run('modal.hidden'), true, 'Select again closes it');
  run('pressSelect(); pressB()');
  assert.equal(run('modal.hidden'), true, 'and so does B');
});

test('Start opens the menu, with your level, shells and words at the top', () => {
  const {sheet, run} = taskGame({shells: 6});
  run('pressMenu()');
  assert.ok(sheet.querySelector('[data-m="words"]'), 'the menu');
  assert.match(sheet.querySelector('.stats').textContent, /Level 1/);
  run('pressMenu()');
  assert.equal(run('modal.hidden'), true, 'Start again closes it');
});

test('a new task is announced with a message once you’re free, and Select has a red dot until you look', () => {
  const {game, run} = taskGame();
  run("globalThis.__said = []; toast = m => __said.push(m); S.tasksSeen = {}; S.tasksRead = {}; busy = true; updateHUD()");
  assert.deepEqual(JSON.parse(run('JSON.stringify(__said)')), [], 'not while something is happening');
  assert.equal(game.el('#selectDot').hidden, false, 'the dot is on Select');
  run('busy = false; updateHUD()');
  const said = JSON.parse(run('JSON.stringify(__said)'));
  assert.equal(said.length, 1, 'one message');
  assert.match(said[0], /^New task: /);
  run('updateHUD()');
  assert.equal(JSON.parse(run('__said.length')), 1, 'only once');
  run('tasksPage(() => closeCard()); closeCard(); updateHUD()');
  assert.equal(game.el('#selectDot').hidden, true, 'looking at your tasks takes the dot away');
});
