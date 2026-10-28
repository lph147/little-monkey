// The timetable at school (课程表, js/timetable.js, decided 28 October 2026): the teacher, or the chart on the classroom
// wall, opens it. A tab for each subject (each of the area's lesson series: 数学 Maths, 美术 Art) and one for practice;
// each subject's lessons numbered, done (✓), ready (⭐) or not open yet, and why; a lesson done can be done again; the
// lesson's name over every card in it; and a card at its end saying what it taught, how you did and what's next.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const AT_SCHOOL = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2, feast: 3};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '猴子', '朋友', '河', '鱼', '木头', '桌子', '碗', '学校', '老师', '同学',
  '一', '二', '三'];   // (no colours yet, and no numbers past 三: the first lessons to come)
// A game at school, by the teacher, knowing these words (w: {word: ok}, how many times in a row each was right). The
// lessons themselves are pretend (their own tests: tests/numbers.test.js, tests/colours.test.js): each teaches its words
// and says what it was given.
function game(w = {}, area = {}){
  const words = Object.fromEntries([...KNOWN.map(x => [x, 2]), ...Object.entries(w)].map(([x, ok]) => [x, {lv: 1, ok}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, w: words, shells: 0, met: ['rabbit', 'fox', 'squirrel', 'goat'], areas: {1: {...AT_SCHOOL, ...area}},
    pos: {place: 'school', x: 7, y: 3, dir: 'up'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__lessons = []; globalThis.__practised = 0");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run(`LESSON_KINDS.count = LESSON_KINDS.paint = async (s, words, who, {again}) => {
    openCard('<p>a question</p>'); const bar = sheet.querySelector('.lessonbar'); closeCard();
    __lessons.push({id: s.id, words, again, bar: bar ? bar.textContent : null});
    words.forEach(w => { rec(w).lv = Math.max(rec(w).lv || 0, 1); });
    return {right: 5, asked: 6, shells: 2};
  }`);
  g.run('practise = async () => { __practised++; return true; }');
  g.run('placePlayer()');
  return g;
}
const tick = async (g, n = 30) => { for (let i = 0; i < n; i++){ await new Promise(r => setImmediate(r)); g.flush(); } };
// Talk to the teacher, and wait for the timetable (the conversation goes on in the background: __done once it ends).
async function lesson(g){
  g.run("globalThis.__done = false; talk(ALL_NPCS.find(n => n.id === 'elder')).then(() => { __done = true; })");
  await tick(g);
}
const sheet = g => g.el('#sheet');
const text = (g, sel) => { const e = sheet(g).querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
const press = async (g, sel) => { const e = sheet(g).querySelector(sel); assert.ok(e, `there's ${sel} to press`); e.click(); await tick(g); };
const tiles = g => sheet(g).querySelectorAll('.tile').map(t => t.className.replace(/^tile | navsel/g, ''));   // (navsel: the D-pad's gold outline)

test('the teacher opens the timetable: a tab for each subject and one for practice, the first lessons ready, the rest not open yet, and why', async () => {
  const g = game();
  await lesson(g);
  assert.deepEqual(get(g, '__said'), ['上课！']);
  assert.match(text(g, '.tt .label'), /课程表 kèchéngbiǎo · Timetable/);
  const tabs = sheet(g).querySelectorAll('.tab');
  assert.deepEqual(tabs.map(t => t.dataset.tab), ['numbers', 'colours', 'practice'], 'Maths, Art, then practice');
  assert.match(tabs[0].textContent, /数学.*shùxué.*Maths/);
  assert.match(tabs[1].textContent, /美术.*měishù.*Art/);
  assert.match(tabs[2].textContent, /练习.*liànxí.*Practice/);
  assert.ok(tabs[0].querySelector('.st') && tabs[1].querySelector('.st') && !tabs[2].querySelector('.st'), 'a star on each subject with a lesson ready');
  assert.equal(tabs[0].getAttribute('aria-selected'), 'true', 'it opens on Maths');
  assert.deepEqual(tiles(g), ['ready sel', 'locked', 'locked', 'locked', 'locked'], 'five Maths lessons: 四 五 六, then 七 八 九 十 one a lesson');
  assert.equal(text(g, '.detail'), 'Lesson 1 · Ready: Three new numbers, then counting.');
  assert.equal(text(g, '[data-a=ok]'), 'Start lesson 1');
  await press(g, '.tile[data-lesson="2"]');
  assert.equal(text(g, '.detail'), 'Lesson 2 · Opens once you’ve done lesson 1.', 'a lesson not open yet says why');
  assert.equal(text(g, '[data-a=ok]'), 'Practise', 'and its button practises instead');
  await press(g, '.tab[data-tab="colours"]');
  assert.equal(tabs.length, 3);
  assert.equal(text(g, '.detail'), 'Lesson 1 · Ready: Three new colours, then choosing paints.', 'Art, on its first lesson');
  await press(g, '[data-a=no]');
  assert.ok(g.run('__done'), 'Close ends it');
  assert.deepEqual(get(g, '__said'), ['上课！'], 'with nothing done: no 下课');
  assert.deepEqual(get(g, '__lessons'), []);
});

test('a lesson: its name over every card in it, then a card saying what it taught, how you did and what’s next; Timetable goes back to choose another', async () => {
  const g = game();
  await lesson(g);
  await press(g, '[data-a=ok]');   // Start lesson 1
  assert.deepEqual(get(g, '__lessons'), [{id: 'numbers', words: ['四', '五', '六'], again: false, bar: '数学 shùxué Maths · Lesson 1'}]);
  assert.equal(get(g, 'here().lastLesson'), 'numbers');
  assert.equal(get(g, 'here().lessonTurn'), get(g, 'S.turn'), 'the next new lesson waits from now');
  assert.equal(text(g, '.lessonbar'), '数学 shùxué Maths · Lesson 1');
  assert.equal(text(g, '.ldone .big'), '✓ Lesson 1 done!');
  assert.equal(text(g, '.ldone .w'), '四 sì · 五 wǔ · 六 liù');
  assert.match(text(g, '.ldone .small'), /^5 of 6 right · \+2/);
  assert.equal(sheet(g).querySelectorAll('.ldone .pics .pix').length, 3, 'its words’ pictures');
  assert.equal(text(g, 'p.small'), 'Next in Maths: lesson 2, after 8 more questions, answered anywhere.');
  await press(g, '[data-a=tt]');
  assert.ok(!g.run('__done'), 'Timetable: back to it');
  assert.deepEqual(tiles(g), ['done', 'wait sel', 'locked', 'locked', 'locked'], 'lesson 1 ticked, on lesson 2, waiting');
  assert.match(text(g, '.detail'), /^Lesson 2 · Opens after 8 more questions, answered anywhere: ?0\/8$/);
  assert.equal(text(g, '[data-a=ok]'), 'Practise');
  assert.equal(sheet(g).querySelectorAll('.tab')[0].querySelector('.st'), null, 'no star on Maths now');
  await press(g, '[data-a=no]');
  assert.ok(g.run('__done'));
  assert.deepEqual(get(g, '__said'), ['上课！', '下课！'], 'a lesson done: class is over');
});

test('a lesson done can be done again, any time: all its words, as before, and it doesn’t start the wait', async () => {
  const g = game({'四': 2, '五': 2, '六': 2});
  await lesson(g);
  assert.deepEqual(tiles(g), ['done', 'ready sel', 'locked', 'locked', 'locked'], 'lesson 2 (七) ready');
  await press(g, '.tile[data-lesson="1"]');
  assert.equal(text(g, '.detail'), 'Lesson 1 · ✓ Done: 四 sì · 五 wǔ · 六 liù');
  assert.equal(text(g, '[data-a=ok]'), 'Lesson 1 again');
  await press(g, '.tile[data-lesson="1"]');   // (tapping the chosen one again: what its button says)
  assert.deepEqual(get(g, '__lessons'), [{id: 'numbers', words: ['四', '五', '六'], again: true, bar: '数学 shùxué Maths · Lesson 1, again'}]);
  assert.equal(g.run('typeof here().lessonTurn'), 'undefined', 'no wait');
  assert.equal(g.run('typeof here().lastLesson'), 'undefined');
  assert.equal(text(g, '.ldone .big'), '✓ Done again!');
  assert.equal(text(g, 'p.small'), 'Next in Maths: lesson 2, ready now!');
  await press(g, '[data-a=ok]');   // OK
  assert.ok(g.run('__done'));
  assert.deepEqual(get(g, '__said'), ['上课！', '下课！']);
});

test('a subject’s next lesson waits till you know the last one’s word well, and says which; another subject’s can go first', () => {
  const g = game({'四': 2, '五': 2, '六': 2, '七': 0});
  assert.deepEqual(get(g, "(s => lessonState(s, 3))(AREA.lessons[0])"), {state: 'practise', words: ['八'], fresh: ['八'], need: '七'});
  assert.equal(get(g, "lessonDetail(AREA.lessons[0], 3)"), '<b>Lesson 3</b> · Opens once you know 七 (seven) well: get it right twice more, in practice.');
  assert.deepEqual(get(g, 'ttDefault()'), {tab: 'colours', n: 1}, 'it opens on Art, ready');
  g.run("rec('七').ok = 2");
  assert.deepEqual(get(g, "lessonState(AREA.lessons[0], 3).state"), 'ready');
});

test('the practice tab: the words that need practice, and a practice lesson, any time', async () => {
  const g = game({'四': 2, '五': 0, '六': 2}, {lessonTurn: 0});
  g.run('S.turn = 0');
  await lesson(g);
  assert.equal(get(g, 'lessonNow()'), null, 'no new lesson yet: 8 questions to answer first');
  assert.equal(text(g, '[data-a=ok]'), 'Practise', 'its main button practises');
  await press(g, '.tab[data-tab="practice"]');
  assert.match(text(g, '.ttpractice'), /^1 word needs practice\. A practice lesson asks about the words you know: never a new one/);
  assert.equal(sheet(g).querySelectorAll('.ttpractice .pix').length, 1, 'its picture: 五');
  await press(g, '[data-a=ok]');
  assert.equal(g.run('__practised'), 1);
  assert.ok(g.run('__done'));
  assert.deepEqual(get(g, '__said'), ['上课！', '下课！']);
});

test('the timetable on the classroom wall: a row for each subject, a star for each lesson done; A at it opens the timetable', async () => {
  const g = game({'四': 2, '五': 2, '六': 2});
  assert.deepEqual(get(g, 'chartRows()'), [{icon: 'dots', n: 5, done: 1, ready: true}, {icon: 'paint', n: 7, done: 0, ready: true}]);
  assert.equal(get(g, "PLACES.school.map[1][12]"), 'k', 'on the wall, where the right-hand window was');
  g.run("globalThis.__opened = 0; ttCard = async () => { __opened++; return null; }");
  g.run("S.pos = {place: 'school', x: 12, y: 2, dir: 'up'}; placePlayer()");
  g.run("globalThis.__done = false; interact(...facing()).then(() => { __done = true; })");
  await tick(g);
  assert.equal(g.run('__opened'), 1);
  assert.ok(g.run('__done'));
});

test('your tasks and hints name the lessons: ready, or waiting for questions', () => {
  const g = game({'四': 2, '五': 2, '六': 2});
  assert.equal(g.run("lessonsText('ready')"), 'Maths lesson 2 or Art lesson 1');
  assert.equal(g.run("fill(AREA.hints.find(h => h.if && h.if.lesson).text)"), 'A new lesson is ready at the 学校 (school): Maths lesson 2 or Art lesson 1. Talk to the 老师 (teacher), or look at the timetable on the classroom wall.');
  g.run('S.turn = 3; here().lessonTurn = 0');
  assert.equal(g.run("lessonsText('ready')"), '');
  assert.equal(g.run("lessonsText('waiting')"), 'Maths lesson 2 or Art lesson 1');
});
