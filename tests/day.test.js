// The first-day story: sleeping in your nest ends the day with a summary, good night and good morning;
// coming back on a new date is a new morning; and the book of firsts records each first.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
const tick = () => new Promise(r => setImmediate(r));
const save = extra => ({version: 11, started: true, areas: {1: {elder: 1}}, ...extra});

test('sleeping: the summary, then the old monkey says good night and good morning beside your nest, on the next day', async () => {
  const game = loadGame({dom: true, save: save({day: 3})});
  game.run(`mode = 'play'; globalThis.__steps = []; confirmBox = async () => true; daySummary = async () => { __steps.push('summary'); };
    runSteps = async (steps, who) => { __steps.push(who + ':' + steps.map(s => s.say || s.reply).join(',')); };
    globalThis.__done = false; goToSleep().then(() => { __done = true; })`);
  for (let i = 0; i < 10; i++){ await tick(); game.flush(); }   // the fade waits on timers
  assert.equal(game.run('__done'), true);
  assert.deepEqual(get(game, '__steps'), ['summary', 'elder:night,晚安', 'elder:morning,早上好']);
  assert.equal(game.run('S.day'), 4, 'a new day');
  const wake = get(game, 'AREA.day.wakeAt');
  assert.deepEqual(get(game, '[S.pos.x, S.pos.y]'), [wake.x, wake.y], 'you wake by your nest');
  assert.ok(get(game, 'S.firsts.sleep'), 'your first night is in the book of firsts');
});

test('there is a nest, and A there says Sleep', () => {
  const game = loadGame({save: save()});
  const nest = get(game, "(() => { for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (tileAt(x, y).action === 'sleep') return [x, y]; })()");
  assert.ok(nest, 'there is a nest');
  assert.equal(get(game, `promptFor(${nest[0]}, ${nest[1]})`), 'Sleep');
});

test('the summary shows the words you met today, your firsts today, and what\'s due tomorrow', () => {
  const game = loadGame({dom: true, save: save({day: 2, w: {'山': {lv: 1, due: 0, ok: 0}, '花': {lv: 2, due: 9e15, ok: 2}}})});
  game.run("S.today = {d: todayKey(), ids: ['山', '花']}; S.firsts = {word: {day: 1, w: '石头'}, friend: {day: 2, w: '狐狸'}}; daySummary()");
  const text = game.el('#sheet').textContent;
  assert.match(text, /The end of day 2/);
  assert.match(text, /Today you met 2 words/);
  assert.match(text, /First friend · 狐狸/);
  assert.ok(!/First word/.test(text), 'only today\'s firsts');
  assert.match(text, /1 word is due for review tomorrow/);
});

test('coming back on a new date is a new morning; the same date isn\'t', async () => {
  const play = lastDay => {
    const game = loadGame({save: save({day: 1, lastDay})});
    game.run('globalThis.__woke = 0; wakeUp = async () => { __woke++; }; toTitle(); $(\'#contBtn\').onclick()');
    return game;
  };
  const later = play('2020-1-1');
  await tick();
  assert.equal(later.run('__woke'), 1);
  assert.equal(get(later, 'S.lastDay'), get(later, 'todayKey()'));
  const same = loadGame({save: save({day: 1})});
  same.run('S.lastDay = todayKey(); globalThis.__woke = 0; wakeUp = async () => { __woke++; }; toTitle(); $(\'#contBtn\').onclick()');
  await tick();
  assert.equal(same.run('__woke'), 0);
});

test('the book of firsts keeps the first of each, with its day', () => {
  const game = loadGame({save: save({day: 2})});
  game.run("setSeen('山'); setSeen('花')");
  assert.deepEqual(get(game, 'S.firsts.word'), {day: 2, w: '山'}, 'the first word, not the second');
  game.run('tasksPage(() => {})');
  assert.match(game.el('#sheet').innerHTML, /First word · <b>山<\/b><\/span><span class="small">Day 2/);
});

test('a version 10 save is converted: day 1, with the firsts you have already had', () => {
  const game = loadGame({save: {version: 10, started: true, w: {'山': {lv: 1, due: 0, ok: 0}, '你好': {lv: 4, due: 0, ok: 0, used: 1}},
    friends: ['fox'], met: ['fox'], areas: {1: {elder: 2, hungry: 'done', bought: ['头带'], story: false}}}});
  const s = get(game, 'S');
  assert.equal(s.version, get(game, 'SAVE_VERSION'));
  assert.equal(s.day, 1);
  assert.deepEqual(Object.keys(s.firsts).sort(), ['animal', 'buy', 'friend', 'reply', 'want', 'word'].sort());
});
