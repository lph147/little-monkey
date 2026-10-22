// Chapter 1: the school's number lessons (a lesson series, AREA.lessons). The teacher teaches one new number a lesson,
// four to ten, in order, the next once you've got the last one right twice: he counts peaches onto his table (teaching
// it), then asks how many things there are, five times (counting questions), and right answers earn shells for numbers
// that needed practice. When no number is ready, a lesson is practice, as at the practice post.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const AT_SCHOOL = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '猴子', '朋友', '河', '鱼', '木头', '桌子', '碗', '学校', '老师', '同学',
  '红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色'];   // (all the colours: no colour lessons in the way, tests/colours.test.js)
// A game at school, by the teacher, knowing these words (w: {word: ok}, how many times in a row each was right).
function game(w = {}, area = {}){
  const words = Object.fromEntries([...KNOWN.map(x => [x, 2]), ['一', 2], ['二', 2], ['三', 2], ...Object.entries(w)].map(([x, ok]) => [x, {lv: 1, ok}]));
  const g = loadGame({dom: true, save: {version: 29, started: true, w: words, shells: 0, met: ['rabbit', 'fox', 'squirrel', 'goat'], areas: {1: {...AT_SCHOOL, ...area}},
    pos: {place: 'school', x: 7, y: 3, dir: 'up'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__cards = []; globalThis.__qs = []; globalThis.__lessons = 0");
  g.run("showDialog = async (who, line, opts = {}) => { __said.push(line.t.join('') + (opts.teach ? ' [' + opts.teach + ']' : '')); }; showNarration = async () => {}; toast = () => {}");
  g.run("showNotice = async (w, o = {}) => { __cards.push(w + (o.quiet ? ' (quiet)' : '')); rec(w).lv = Math.max(rec(w).lv || 0, 1); }; infoBox = async () => {}; confirmBox = async () => true");
  g.run("practise = async () => { __lessons++; return true; }");   // (a practice lesson: the practice post's own tests)
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
// Answers every counting question right (or wrong), noting what each asked.
const answering = (g, right = true) => g.run(`pictureQ = async q => { if (q.onShow) q.onShow(); __qs.push({options: q.options, answerIdx: q.answerIdx, word: q.word, body: q.body, text: !!q.text}); return ${right}; }`);
const lesson = g => play(g, "talk(ALL_NPCS.find(n => n.id === 'elder'))");

test('the first number lesson: the teacher counts peaches onto his table, teaching 四, then five counting questions', async () => {
  const g = game();
  assert.deepEqual(get(g, 'lessonNow() && lessonNow().word'), '四');
  assert.equal(get(g, "((AREA.bubbles.elder || []).find(b => matches(b.if)) || {}).show"), '!', 'the teacher has a ! for you');
  answering(g);
  await lesson(g);
  assert.deepEqual(get(g, '__said'), ['上课！', '一，二，三，四！ [四]', '下课！'], 'he counts, teaching 四 (bold)');
  assert.deepEqual(get(g, '__cards'), ['四 (quiet)'], 'its card, not said again: he’s just said it');
  assert.equal(get(g, '__qs').length, 5);
  assert.equal(get(g, '__qs').filter(q => q.word === '四').length, 3, 'three of them are the new number');
  assert.equal(g.run('__lessons'), 0, 'a number lesson, not practice');
  assert.equal(g.run('rec("四").ok'), 3, 'each right answer counts');
  assert.equal(g.run('S.shells'), 2, 'a shell for each right answer while 四 needed practice (the first two)');
  assert.equal(get(g, 'areaChecklist().find(([t]) => /count to ten/.test(t))[0]'), 'Learn to count to ten at 学校 (school) (1/7)');
});

test('the next number waits until you’ve got the last one right twice; until then, lessons are practice', async () => {
  const g = game({'四': 1});
  assert.equal(get(g, 'lessonNow()'), null, '四 still needs practice');
  await lesson(g);
  assert.equal(g.run('__lessons'), 1, 'so the lesson is practice');
  g.run('rec("四").ok = 2');
  assert.equal(get(g, 'lessonNow().word'), '五', 'then 五');
  answering(g);
  g.run('__said.length = 0');
  await lesson(g);
  assert.deepEqual(get(g, '__said'), ['上课！', '一，二，三，四，五！ [五]', '下课！']);
  const all = game(Object.fromEntries(['四', '五', '六', '七', '八', '九', '十'].map(n => [n, 2])));
  assert.equal(get(all, 'lessonNow()'), null, 'all ten learned: no more number lessons');
  assert.equal(get(all, "((AREA.bubbles.elder || []).find(b => matches(b.if)) || {}).show || null"), null, 'and no ! unless words need practice');
  assert.ok(get(all, 'areaChecklist().find(([t]) => /count to ten/.test(t))[1]'), 'the checklist is ticked: 7/7');
});

test('a counting question, once you know the number: n things, the teacher’s question in his voice, and three numbers you know, the nearest, so you have to count', async () => {
  const g = game({'四': 0, '五': 2, '六': 2});
  g.run('rec("六").lv = 2');   // (recognised)
  g.run("globalThis.__voice = []; say = (t, end, who) => { __voice.push([t, who || null]); }");
  answering(g);
  const series = 'AREA.lessons[0]', thing = `${series}.things[0]`;
  await play(g, `countQ({who: 'elder', thing: ${thing}, n: 6})`);
  const q = get(g, '__qs[0]');
  assert.equal(q.word, '六');
  const opts = q.options.map(o => o.match(/^([^<]+)/)[1]);
  assert.deepEqual([...opts].sort(), ['五', '六', '四'].sort(), 'the right one and the two nearest it you know');
  assert.ok(q.text && q.options.every(o => /<span class="cap">/.test(o) && !/class="ico"/.test(o)), '六 is recognised: characters with pinyin, no pictures');
  assert.equal((q.body.match(/class="thing"/g) || []).length, 6, 'six peaches to count');
  assert.match(q.body, /count table/);
  assert.deepEqual(get(g, '__voice')[0], ['桌子上有几个桃子？', 'elder'], 'the teacher asks, aloud, in his own voice');
});

test('a counting question while the number is new: you hear it, and choose the one with that many things, never a picture of a number (you could count a die’s dots)', async () => {
  const g = game({'四': 0, '五': 2, '六': 2});
  g.run("globalThis.__voice = []; say = (t, end, who) => { __voice.push([t, who || null]); }");
  answering(g);
  await play(g, "countQ({who: 'elder', thing: AREA.lessons[0].things[3], n: 4})");
  const q = get(g, '__qs[0]');
  assert.equal(q.word, '四');
  assert.match(q.body, /data-a="say"/, 'a 🔊 to hear it again');
  assert.doesNotMatch(q.body, /class="thing"/, 'nothing to count in the question: the answers are what you count');
  assert.deepEqual(get(g, '__voice'), [['四', null]], 'you hear the number, not the question');
  const shown = q.options.map(o => ({num: o.match(/<span class="cap">([^<]+)</)[1], things: (o.match(/class="thing"/g) || []).length, grass: /count few grass/.test(o), pic: /class="ico"/.test(o)}));
  assert.deepEqual(shown.map(a => a.num).sort(), ['三', '五', '四'].sort(), 'the right one and the two nearest it you know');
  assert.ok(shown.every(a => a.things === get(g, `COUNTING.indexOf('${a.num}') + 1`)), 'each answer is that many things, with its characters');
  assert.ok(shown.every(a => a.grass), 'monkeys, together on the grass');
  assert.ok(shown.every(a => !a.pic), 'no pictures of numbers');
  assert.ok(q.options.every(o => /class="cap py later"/.test(o)), 'each one’s pinyin, once you’ve answered');
});

test('a wrong count is practice, not a test: the number comes back soon and keeps its gold squares; things you count are words you know', async () => {
  const g = game({'四': 2}, {});
  g.run('rec("四").lv = 2');
  answering(g, false);
  await play(g, "countQ({who: 'elder', thing: AREA.lessons[0].things[0], n: 4})");
  assert.equal(g.run('rec("四").lv'), 2, 'its level stays');
  assert.equal(g.run('rec("四").ok'), 0, 'and it needs practice again');
  const noBirds = game();
  noBirds.run("delete S.w['鸟']; globalThis.__things = []; countQ = async ({thing}) => { __things.push(thing.word); return true; }");
  for (let i = 0; i < 4; i++){ noBirds.run("rec('四').lv = 0; rec('四').ok = 0"); await lesson(noBirds); }   // (the first lesson, again and again)
  const counted = get(noBirds, '__things');
  assert.equal(counted.length, 20);
  assert.ok(!counted.includes('鸟'), 'you’ve not caught 鸟, so there are never birds to count');
});

test('saying Not now to a number lesson ends it there: no 下课', async () => {
  const g = game();
  g.run('confirmBox = async () => false');
  await lesson(g);
  assert.deepEqual(get(g, '__said'), ['上课！']);
  assert.equal(g.run('lvl("四")'), 0, 'nothing learned');
});

test('there are never two things to count, and 二 is never an answer: two things are 两 (liǎng), a word of its own', async () => {
  const g = game();
  answering(g);
  for (let i = 0; i < 6; i++){ g.run("rec('四').lv = 0; rec('四').ok = 0"); await lesson(g); }   // (the first lesson, again and again)
  const qs = get(g, '__qs');
  assert.ok(qs.length >= 30);
  assert.ok(qs.every(q => q.word !== '二'), 'never two things');
  assert.ok(qs.every(q => q.options.every(o => !/^二|>二</.test(o))), 'nor 二 among the answers');
  assert.deepEqual(get(g, "L.count2.t"), ['一', '，', '二', '！'], 'the troop is counted in as numbers: 一，二！');
});
