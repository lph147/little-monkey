// The screen's size, and your tasks: the game is played sideways, like a Game Boy Advance, and asks you to
// turn the phone when it's held upright. Select shows your tasks, and a new task is announced with a
// message and a red dot on Select.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

// The window's size, as a browser would report it, then the game sizes its screen.
function sized(game, width, height){
  game.run(`innerWidth = ${width}; innerHeight = ${height}; fit();`);
  return {w: parseFloat(game.run('cv.style.width')), h: parseFloat(game.run('cv.style.height')), turn: !game.el('#turn').hidden, game: !game.el('.app').hidden};
}

test('held sideways, the screen is 15 columns by 10 rows, as big as fits between the two sides of controls', () => {
  const game = loadGame();
  const phone = sized(game, 812, 375);
  assert.deepEqual([game.run('VW'), game.run('VH'), game.run('buf.width'), game.run('buf.height')], [15, 10, 240, 160], 'a Game Boy Advance’s shape');
  assert.ok(phone.w <= 812 - 2 * 150 && phone.h <= 375, 'it fits between the D-pad side and the A and B side');
  assert.ok(Math.abs(phone.w / phone.h - 1.5) < .01, 'half as wide again as it is tall');
  assert.deepEqual([phone.turn, phone.game], [false, true], 'and the game shows');
  const desk = sized(game, 1600, 1000);
  assert.ok(desk.w <= 720, 'in a big computer window the screen stops growing');
});

test('text and pictures follow the screen’s height, and pictures stay sharp', () => {
  const game = loadGame();
  const size = (h, dpr = 1) => JSON.parse(game.run(`JSON.stringify(screenSizes(${h}, ${dpr}))`));
  assert.ok(Math.abs(size(317).fs - 16) < .2, 'an Android phone held sideways: about the usual 16px');
  assert.ok(size(276).fs < size(317).fs, 'smaller on an iPhone, whose screen is smaller');
  assert.equal(size(200).fs, 13, 'never smaller than 13px');
  assert.equal(size(600).fs, 18, 'nor bigger than 18px');
  for (const [h, dpr] of [[317, 1], [276, 3], [456, 2], [200, 2.625]]){
    const s = size(h, dpr);
    for (const k of ['face', 'small', 'mid', 'scene', 'big']){
      const real = s[k] * dpr / 32;   // the screen's real pixels for each of a picture's 32 pixels
      assert.ok(Math.abs(real - Math.round(real)) < 1e-6 && real >= 1, `${k} on a ${h} screen: ${s[k]}px gives each picture pixel a whole number of real pixels`);
    }
    assert.ok(s.face <= s.small && s.small <= s.mid && s.mid <= s.scene && s.scene <= s.big, 'from small to big');
    const icon = s.icon * dpr / 16;   // the 16-pixel icons
    assert.ok(Math.abs(icon - Math.round(icon)) < 1e-6 && icon >= 1, `icon on a ${h} screen: ${s.icon}px gives each icon pixel a whole number of real pixels`);
  }
});

test('held upright, a card asks you to turn the phone, and the game waits', () => {
  const game = loadGame({save: {version: 21, started: true}});
  game.run("mode = 'play'");
  const up = sized(game, 375, 812);
  assert.deepEqual([up.turn, up.game], [true, false], 'the card shows, the game doesn’t');
  const before = game.run('JSON.stringify([S.pos, mode])');
  assert.equal(game.key('ArrowLeft').defaultPrevented, false, 'keys do nothing');
  assert.equal(game.run('JSON.stringify([S.pos, mode])'), before);
  const side = sized(game, 812, 375);
  assert.deepEqual([side.turn, side.game], [false, true], 'turned sideways, the game is back');
});

function taskGame(extra = {}){
  const game = loadGame({dom: true, save: {version: 21, started: true, ...extra}});
  game.run("mode = 'play'; here().elder = 2; here().hungry = 'asked'; here().thirsty = 'asked';");
  return {game, sheet: game.el('#sheet'), run: code => game.run(code)};
}

test('Select opens your tasks: your words, friends and shells, what to do now, then the chapter’s checklist', () => {
  const {sheet, run} = taskGame({shells: 4});
  const tasks = JSON.parse(run('JSON.stringify(getTasks().map(t => t.text))'));
  run('pressSelect()');
  const text = sheet.textContent;
  assert.match(text, /friends/);
  assert.doesNotMatch(text, /Level|XP/, 'no levels or XP');
  assert.match(text, /4 words|0\/\d+ words/);
  for (const t of tasks) assert.ok(text.includes(t), `the task list should include "${t}"`);
  assert.ok(text.indexOf(tasks[0]) < text.indexOf('Prologue'), 'what to do now comes first, then the checklist');
  run('pressSelect()');
  assert.equal(run('modal.hidden'), true, 'Select again closes it');
  run('pressSelect(); pressB()');
  assert.equal(run('modal.hidden'), true, 'and so does B');
});

test('your tasks only list what you’ve found: the flowers once the big monkey has asked for them', () => {
  const {sheet, run} = taskGame();   // the hungry and thirsty monkeys have asked; the big monkey hasn't
  run('pressSelect()');
  let text = sheet.textContent;
  assert.match(text, /hungry monkey the fruit/);
  assert.match(text, /water to the thirsty monkey/);
  assert.doesNotMatch(text, /flower/, 'not before the big monkey asks');
  assert.doesNotMatch(text, /headband/, 'nor the headband before the shop owner shows it');
  assert.match(text, /More to find as you play/, 'but it says there’s more');
  run("pressB(); here().flowers = 'asked'; pressSelect()");
  text = sheet.textContent;
  assert.match(text, /a red, a yellow and a white flower/, 'once asked, it’s on the list');
  assert.ok(JSON.parse(run('JSON.stringify(areaChecklist().map(c => c[1]))')).length === 7, 'the whole checklist still counts towards finishing the chapter');
});

test('Start opens the menu, with your words, friends and shells at the top', () => {
  const {sheet, run} = taskGame({shells: 6});
  run('pressMenu()');
  assert.ok(sheet.querySelector('[data-m="words"]'), 'the menu');
  assert.match(sheet.querySelector('.stats').textContent, /words.*friends.*6/);
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
