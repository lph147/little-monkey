// Chapter 1: the school's new words, spaced out (AREA.lessonGap, decided 26 October 2026, after measuring the game's pacing:
// the school's sixteen words could all come in one sitting, each practised only in its own lesson). After a lesson that
// teaches new words, the teacher's next new word waits till you've answered 8 more questions, anywhere: in a practice
// lesson, an animal's game or a battle. Till then a lesson is practice, and he says so first; your tasks say how far you
// are; and once you've practised, a message says he has a new word for you. The first two lessons wait too.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const AT_SCHOOL = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2, feast: 3};   // (the feast's news heard: tests/feast.test.js)
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '猴子', '朋友', '河', '鱼', '木头', '桌子', '碗', '学校', '老师', '同学',
  '一', '二', '三'];   // (no colours yet, and no numbers past 三: the first lessons to come)
// A game at school, by the teacher, knowing these words (w: {word: ok}, how many times in a row each was right).
function game(w = {}, area = {}){
  const words = Object.fromEntries([...KNOWN.map(x => [x, 2]), ...Object.entries(w)].map(([x, ok]) => [x, {lv: 1, ok}]));
  const g = loadGame({dom: true, save: {version: 29, started: true, w: words, shells: 0, met: ['rabbit', 'fox', 'squirrel', 'goat'], areas: {1: {...AT_SCHOOL, ...area}},
    pos: {place: 'school', x: 7, y: 3, dir: 'up'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__lessons = 0");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run("showNotice = async w => { rec(w).lv = Math.max(rec(w).lv || 0, 1); }; infoBox = async () => {}; confirmBox = async () => true; storyScene = async () => {}");
  g.run("ttCard = async at => ttAction(at || ttDefault()); lessonEnd = async () => false");   // (the timetable: its own tests, tests/timetable.test.js; here, what it offers first)
  g.run("practise = async () => { __lessons++; return true; }");   // (a practice lesson: the practice post's own tests; the playthrough plays a real one)
  g.run('pictureQ = async q => { if (q.onShow) q.onShow(); return true; }');   // (every question answered right)
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
const lesson = g => play(g, "talk(ALL_NPCS.find(n => n.id === 'elder'))");
const task = g => get(g, '(getTasks().find(t => t.id === "practise") || {}).text || null');

test('after a lesson that teaches new words, the next waits till you’ve answered 8 more questions: till then the timetable says so, and offers practice', async () => {
  const g = game();
  assert.deepEqual(get(g, 'lessonNow().words'), ['四', '五', '六'], 'nothing to wait for before your first lesson');
  assert.equal(task(g), null);
  await lesson(g);
  assert.ok(['四', '五', '六'].every(w => get(g, `lvl('${w}')`) >= 1), 'the first lesson teaches 四, 五 and 六');
  await play(g, 'runEvents()');
  assert.equal(get(g, 'lessonNow()'), null, 'the first colour lesson waits too');
  assert.deepEqual(get(g, 'lessonNow(false).words'), ['红色', '黄色', '白色'], 'it’s ready, once you’ve practised');
  assert.ok(get(g, 'matches({lessonWaits: true}) && !matches({lesson: true})'), 'so the teacher has no ! for it');
  assert.equal(task(g), 'Practise before your next lesson, Maths lesson 2 or Art lesson 1: answer questions anywhere (0/8)', 'your tasks say what to do');
  assert.match(get(g, 'lessonDetail(AREA.lessons[1], 1)'), /Opens after 8 more questions, answered anywhere/, 'and the timetable');
  assert.equal(get(g, 'ttAction(ttDefault()).label'), 'Practise', 'its main button practises, while you wait');
  assert.equal(get(g, 'here().lessonWait'), 1, 'the game remembers it’s waiting, to tell you when it’s ready');
  g.run('__said.length = 0; __notes.length = 0');
  await lesson(g);
  assert.deepEqual(get(g, '__said'), ['上课！', '下课！']);
  assert.equal(g.run('__lessons'), 1, 'the lesson is practice');
  assert.ok(!get(g, "lvl('红色')"), 'nothing new');
  g.run('S.turn += 5');   // (5 questions answered: in the practice lesson, say, or an animal's game)
  assert.equal(task(g), 'Practise before your next lesson, Maths lesson 2 or Art lesson 1: answer questions anywhere (5/8)');
  g.run('__notes.length = 0');
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__notes'), [], 'not ready yet: no message');
  g.run('S.turn += 3');
  assert.deepEqual(get(g, 'lessonNow().words'), ['红色', '黄色', '白色'], '8 questions: the colours are ready');
  assert.equal(task(g), null, 'the task is done');
  assert.equal(get(g, "((AREA.bubbles.elder || []).find(b => matches(b.if)) || {}).show"), '!', 'and the teacher has a ! for you');
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__notes'), ['You’ve practised enough: a new lesson is ready at the 学校 (school), Maths lesson 2 or Art lesson 1!'], 'a message says so, wherever you are');
  await play(g, 'runEvents()');
  assert.equal(get(g, '__notes').length, 1, 'once');
  assert.equal(get(g, 'here().lessonWait'), 0);
});

test('every question counts, wherever you answer it, and a practice lesson doesn’t start the wait again; the next new word waits for each lesson that teaches one', async () => {
  const g = game({'四': 2, '五': 2, '六': 2, '红色': 2, '黄色': 2, '白色': 2});
  assert.deepEqual(get(g, 'lessonNow().words'), ['七'], 'a game from before lessons waited: its next new word is ready');
  await lesson(g);
  assert.ok(get(g, "lvl('七') >= 1"));
  const turn = get(g, 'here().lessonTurn');
  assert.equal(turn, get(g, 'S.turn'), 'the wait starts as the lesson ends');
  assert.equal(get(g, 'lessonNow()'), null);
  g.run("answer('桃子', true, 'listen'); reviewed('兔子', false)");   // (questions anywhere, right or wrong: an animal's game, a battle)
  assert.equal(get(g, 'counter("practised")'), 2);
  await lesson(g);
  assert.equal(g.run('__lessons'), 1, 'a practice lesson');
  assert.equal(get(g, 'here().lessonTurn'), turn, 'which doesn’t start the wait again');
  g.run('S.turn += 6');
  assert.deepEqual(get(g, 'lessonNow().words'), ['黑色'], 'then the next new word (number and colour lessons take turns)');
  await lesson(g);
  assert.ok(get(g, "lvl('黑色') >= 1"));
  assert.equal(get(g, 'lessonNow()'), null, 'and the next waits again');
  assert.equal(get(g, 'counter("practised")'), 0);
  g.run('S.turn += 20');
  assert.equal(get(g, 'counter("practised")'), 8, 'never more than 8');
});
