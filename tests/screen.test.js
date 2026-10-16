// The screen's size, and the task box under it: on a phone held upright the screen shows more of
// the map, and the task box shows one task with the rest behind "more".
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

// The page as a browser would lay it out: the window, how wide the console is, and the height of
// everything on the page but the screen (the header, text box and controls).
function sized(game, {width, height, console: shell, rest}){
  game.run(`innerWidth = ${width}; innerHeight = ${height}; $('.console').clientWidth = ${shell};
    $('.app').offsetHeight = ${rest}; cv.offsetHeight = 0; tb.offsetHeight = TEXTBOX_H; fit();`);
  return {rows: game.run('VH'), buffer: game.run('buf.height'), w: parseFloat(game.run('cv.style.width')), h: parseFloat(game.run('cv.style.height'))};
}

test('a phone held upright shows more rows of the map; a computer the usual 10', () => {
  const game = loadGame();
  const phone = sized(game, {width: 375, height: 812, console: 351, rest: 420});
  assert.ok(phone.rows > 10 && phone.rows <= 14, `a tall phone should show 11 to 14 rows, not ${phone.rows}`);
  assert.equal(phone.buffer, phone.rows * 16, 'the picture is drawn that many rows tall');
  assert.ok(phone.h <= 812 - 420, 'and the screen still fits on the page');
  const small = sized(game, {width: 360, height: 640, console: 336, rest: 420});
  assert.equal(small.rows, 10, 'a small phone has room for the usual 10');
  const desk = sized(game, {width: 1280, height: 900, console: 496, rest: 460});
  assert.equal(desk.rows, 10, 'a computer window, wider than tall, shows 10');
  assert.equal(desk.buffer, 160);
});

function taskGame(){
  const game = loadGame({dom: true, save: {version: 8, started: true}});
  game.run("mode = 'play'; here().elder = 2; here().hungry = 'asked'; here().thirsty = 'asked'; S.tasksSeen = Object.fromEntries(getTasks().map(t => [t.id, 1]));");
  return {game, tb: game.el('#textbox'), sheet: game.el('#sheet'), run: code => game.run(code)};
}

test('the task box shows one task, and "more" opens them all', () => {
  const {tb, sheet, run} = taskGame();
  const tasks = JSON.parse(run('JSON.stringify(getTasks().map(t => t.text))'));
  assert.ok(tasks.length >= 3, 'this game has several tasks');
  run('updateHUD()');
  assert.deepEqual(tb.querySelectorAll('.tasks li').map(li => li.textContent), [tasks[0]], 'just the first task');
  const more = tb.querySelector('#moreTasks');
  assert.equal(more.textContent, `+${tasks.length - 1} more`);
  more.click();
  for (const t of tasks) assert.ok(sheet.textContent.includes(t), `the task list should include "${t}"`);
  run('pressB()');
  assert.equal(run('modal.hidden'), true, 'B goes back to the game');
});

test('a new task goes first in the task box', () => {
  const {tb, run} = taskGame();
  const last = JSON.parse(run('JSON.stringify(getTasks().at(-1))'));
  run(`newTaskUntil[${JSON.stringify(last.id)}] = performance.now() + 5000; updateHUD()`);
  const li = tb.querySelector('.tasks li');
  assert.equal(li.textContent, last.text);
  assert.ok(li.classList.contains('new'), 'marked New');
});

test('with one task there is no "more"', () => {
  const game = loadGame({dom: true, save: {version: 8, started: true}});
  game.run("mode = 'play'; updateHUD()");
  assert.equal(game.run('getTasks().length'), 1);
  assert.equal(game.el('#textbox').querySelector('#moreTasks'), null);
});
