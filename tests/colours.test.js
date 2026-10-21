// Chapter 1: the school's colour lessons (a lesson series of kind paint, AREA.lessons). The teacher teaches one new
// colour a lesson, in order, the next once you've got the last one right twice: he opens a pot of paint (teaching it),
// then wants paints, five times (colour questions), and right answers earn shells for colours that needed practice. Then
// the class goes out and paints a part of the school with it (a scene), and there it is on the map. When there's a new
// number and a new colour to learn, number and colour lessons take turns.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const AT_SCHOOL = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '猴子', '朋友', '河', '鱼', '木头', '桌子', '碗', '学校', '老师', '同学',
  '红色', '黄色', '白色', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];   // (all the numbers: no number lessons in the way, tests/numbers.test.js)
const COLOURS = ['黑色', '蓝色', '绿色', '棕色', '橙色', '粉色'];
// A game at school, by the teacher (or at pos), knowing these words (w: {word: ok}, how many times in a row each was right).
function game(w = {}, pos = {place: 'school', x: 7, y: 3, dir: 'up'}){
  const words = Object.fromEntries([...KNOWN.map(x => [x, 2]), ...Object.entries(w)].map(([x, ok]) => [x, {lv: 1, ok}]));
  const g = loadGame({dom: true, save: {version: 29, started: true, w: words, shells: 0, met: ['rabbit', 'fox', 'squirrel', 'goat'], areas: {1: {...AT_SCHOOL}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__cards = []; globalThis.__qs = []; globalThis.__scenes = []; globalThis.__lessons = 0");
  g.run("showDialog = async (who, line, opts = {}) => { __said.push(line.t.join('') + (opts.teach ? ' [' + opts.teach + ']' : '')); }; showNarration = async () => {}; toast = () => {}");
  g.run("showNotice = async (w, o = {}) => { __cards.push(w + (o.quiet ? ' (quiet)' : '')); rec(w).lv = Math.max(rec(w).lv || 0, 1); }; infoBox = async () => {}; confirmBox = async () => true");
  g.run("practise = async () => { __lessons++; return true; }; storyScene = async id => { __scenes.push(id); }");   // (a practice lesson: the practice post's own tests; a scene: tests/story.test.js)
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
// Answers every question right (or wrong), noting what each asked.
const answering = (g, right = true) => g.run(`pictureQ = async q => { if (q.onShow) q.onShow(); __qs.push({options: q.options, answerIdx: q.answerIdx, word: q.word, head: q.head, body: q.body}); return ${right}; }`);
const lesson = g => play(g, "talk(ALL_NPCS.find(n => n.id === 'elder'))");
const caps = o => (o.match(/class="cap">([^<]+)</) || [])[1];   // an answer's characters

test('the first colour lesson: the teacher opens a pot of paint, teaching 黑色; five paints to choose; then the class paints the door black', async () => {
  const g = game();
  assert.equal(get(g, 'lessonNow().word'), '黑色');
  assert.equal(get(g, "((AREA.bubbles.elder || []).find(b => matches(b.if)) || {}).show"), '!', 'the teacher has a ! for you');
  answering(g);
  await lesson(g);
  assert.deepEqual(get(g, '__said'), ['上课！', '这是黑色。 [黑色]', '下课！'], 'he opens the paint, teaching 黑色 (bold)');
  assert.deepEqual(get(g, '__cards'), ['黑色 (quiet)'], 'its card, not said again: he’s just said it');
  const qs = get(g, '__qs');
  assert.equal(qs.length, 5);
  assert.equal(qs.filter(q => q.word === '黑色').length, 3, 'three of them are the new colour');
  assert.ok(qs.filter(q => q.word !== '黑色').every(q => ['红色', '黄色', '白色'].includes(q.word)), 'and two are colours you know');
  assert.deepEqual(get(g, '__scenes'), ['paintDoor'], 'then the class goes out and paints');
  assert.deepEqual(get(g, 'paintedParts()'), {door: '黑色'}, 'the door, black');
  assert.equal(g.run('S.shells'), 2, 'a shell for each right answer while 黑色 needed practice (the first two)');
  assert.equal(g.run('__lessons'), 0, 'a colour lesson, not practice');
  assert.equal(g.run('here().lastLesson'), 'colours');
  assert.deepEqual(get(g, 'AREA.scenes.paintDoor.captions').map(c => c.zh.replace(/ /g, '')), ['我们去刷门吧！', '门是黑色的！']);
  assert.equal(get(g, 'areaChecklist().find(([t]) => /colours/.test(t))[0]'), 'Learn six colours, and paint the school (1/6)');
});

test('a colour question: you hear it while it’s new (the paints with their characters), and read it once you know it (the paints alone), from colours you know', async () => {
  const g = game({'黑色': 0});   // (just taught)
  g.run("globalThis.__voice = []; say = t => { __voice.push(t); }");
  answering(g);
  await play(g, "colourQ({who: 'elder', w: '黑色'})");
  g.flush();
  const q = get(g, '__qs[0]');
  assert.match(q.head, /Listen\. Which paint is it\?/);
  assert.match(q.body, /data-a="say"/, 'with a big 🔊 to hear it again');
  assert.ok(get(g, '__voice').includes('黑色'), 'it’s said aloud');
  const opts = q.options.map(caps);
  assert.equal(opts.length, 3);
  assert.ok(opts.includes('黑色') && opts.every(o => ['黑色', '红色', '黄色', '白色'].includes(o)), 'each paint has its characters; all of them colours you know');
  assert.ok(q.options.every(o => /class="ico"/.test(o)), 'and its picture');
  assert.equal(caps(q.options[q.answerIdx]), '黑色');
  const later = game({'黑色': 2});
  later.run('rec("黑色").lv = 2');   // (recognised)
  answering(later);
  await play(later, "colourQ({who: 'elder', w: '黑色'})");
  const q2 = get(later, '__qs[0]');
  assert.match(q2.head, /Read it\. Which paint is it\?/);
  assert.match(q2.body, /<div class="big">黑色<\/div><div class="py">hēisè<\/div>/, 'the colour to read, with its pinyin');
  assert.ok(q2.options.every(o => /class="ico"/.test(o) && !/class="cap"/.test(o)), 'and the paints alone, so the pinyin can’t be matched');
});

test('a wrong paint is practice, not a test: the colour comes back soon, and keeps its gold squares', async () => {
  const g = game({'黑色': 2});
  g.run('rec("黑色").lv = 2');
  answering(g, false);
  await play(g, "colourQ({who: 'elder', w: '黑色'})");
  assert.equal(g.run('rec("黑色").lv'), 2, 'its level stays');
  assert.equal(g.run('rec("黑色").ok'), 0, 'and it needs practice again');
});

test('the next colour waits until you’ve got the last one right twice; with a new number too, number and colour lessons take turns', async () => {
  const g = game({'黑色': 1});
  assert.equal(get(g, 'lessonNow()'), null, '黑色 still needs practice (and you know all the numbers)');
  answering(g);
  await lesson(g);
  assert.equal(g.run('__lessons'), 1, 'so the lesson is practice');
  g.run('rec("黑色").ok = 2');
  assert.equal(get(g, 'lessonNow().word'), '蓝色', 'then 蓝色');
  const both = game();
  both.run("for (const n of ['四', '五', '六', '七', '八', '九', '十']) delete S.w[n]");
  answering(both);
  assert.equal(get(both, 'lessonNow().word'), '四', 'a new number and a new colour to learn: the numbers first');
  await lesson(both);
  assert.equal(get(both, 'lessonNow().word'), '黑色', 'then a colour lesson');
  await lesson(both);
  assert.equal(get(both, 'lessonNow().word'), '五', 'then a number lesson again: they take turns');
  assert.deepEqual(get(both, '__scenes'), ['paintDoor']);
});

test('the school on the home ground has every part painted so far, and is drawn again as you learn each colour', () => {
  const g = game({}, {place: 'homeGround', x: 9, y: 5, dir: 'up'});
  assert.deepEqual(get(g, 'paintedParts()'), {}, 'no colours learned yet: bare wood');
  const before = g.run('mapStoryNow()');
  g.run('rec("黑色").lv = 1');
  assert.notEqual(g.run('mapStoryNow()'), before, 'learning a colour changes the map, so it’s drawn again');
  const all = game(Object.fromEntries(COLOURS.map(c => [c, 2])), {place: 'homeGround', x: 9, y: 5, dir: 'up'});
  assert.deepEqual(get(all, 'paintedParts()'), {door: '黑色', roof: '蓝色', windows: '绿色', walls: '棕色', pillars: '橙色', blossom: '粉色'});
  assert.equal(get(all, 'lessonNow()'), null, 'all six learned: no more colour lessons');
  assert.ok(get(all, 'areaChecklist().find(([t]) => /colours/.test(t))[1]'), 'the checklist is ticked: 6/6');
});

test('each painting scene can be drawn at every moment, and saying Not now to a colour lesson ends it there', async () => {
  const g = game(Object.fromEntries(COLOURS.map(c => [c, 2])), {place: 'homeGround', x: 9, y: 5, dir: 'up'});
  for (const id of Object.values(get(g, 'AREA.lessons.find(l => l.id === "colours").scenes'))){
    assert.equal(g.run(`AREA.scenes.${id}.art`), 'paintingSchool');
    for (let t = 0; t <= 6; t += .25) g.run(`SCENE_ART.paintingSchool(${t}, ${1000 + t * 1000}, AREA.scenes.${id})`);
  }
  const no = game();
  no.run('confirmBox = async () => false');
  await lesson(no);
  assert.deepEqual(get(no, '__said'), ['上课！'], 'no 下课');
  assert.equal(no.run('lvl("黑色")'), 0, 'nothing learned');
  assert.deepEqual(get(no, '__scenes'), [], 'and nothing painted');
});
