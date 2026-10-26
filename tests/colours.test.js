// Chapter 1: the school's colour lessons (a lesson series of kind paint, AREA.lessons). The first lesson teaches red,
// yellow and white, one after another (decided 24 October 2026: school lessons are the exception to one new word at a
// time); after that, one new colour a lesson, in order, the next once you've got the last one right twice: he opens a
// pot of paint (teaching it),
// then wants paints, five times (colour questions), and right answers earn shells for colours that needed practice. After
// the red lesson, the class goes out and paints the school's paper lanterns red (a scene), and there they are on the map;
// the rest of the school stays as it was built (decided 24 October 2026: each colour painted a part of it). When there's a
// new number and a new colour to learn, number and colour lessons take turns. Red, yellow and white come first (decided 22
// October 2026: the prologue's flowers taught them), so a game that learned them there starts at black.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const AT_SCHOOL = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2, feast: 3};   // (the feast's news heard, its table set up, and the hungry monkey has said what it needs: tests/feast.test.js)
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '猴子', '朋友', '河', '鱼', '木头', '桌子', '碗', '学校', '老师', '同学',
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];   // (all the numbers: no number lessons in the way, tests/numbers.test.js)
const COLOURS = ['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色'];
const FIRST_THREE = {'红色': 2, '黄色': 2, '白色': 2};   // (known: a game whose prologue taught them, before 22 October 2026)
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

test('the first colour lesson teaches three, one after another: 红色, 黄色 and 白色, each a pot of paint with its card and three paints to choose; then two mixing them, and the class paints the lanterns red', async () => {
  const g = game();
  assert.deepEqual(get(g, 'lessonNow().words'), ['红色', '黄色', '白色']);
  assert.equal(get(g, "((AREA.bubbles.elder || []).find(b => matches(b.if)) || {}).show"), '!', 'the teacher has a ! for you');
  g.run("globalThis.__starts = []; confirmBox = async (face, text) => { __starts.push(text); return true; }");
  answering(g);
  await lesson(g);
  assert.match(get(g, '__starts')[0], /^Your first colour lesson: three new colours, one at a time/, 'it says so before you start');
  assert.deepEqual(get(g, '__said'), ['上课！', '这是红色。 [红色]', '这是黄色。 [黄色]', '这是白色。 [白色]', '下课！'], 'he opens each paint, teaching it (bold)');
  assert.deepEqual(get(g, '__cards'), ['红色 (quiet)', '黄色 (quiet)', '白色 (quiet)'], 'each one’s card as it comes, not said again: he’s just said it');
  const all = get(g, '__qs');
  assert.equal(all.length, 11);
  const words = all.map(q => q.word), two = (a, w, others) => { const p = words.slice(a, a + 3); return p.filter(x => x === w).length === 2 && p.filter(x => x !== w).every(x => others.includes(x)); };
  assert.deepEqual(words.slice(0, 3), ['红色', '红色', '红色'], 'three on red, the very first colour: there’s none to mix in');
  assert.ok(two(3, '黄色', ['红色']), `then two on yellow, and red among them (${words.slice(3, 6)})`);
  assert.ok(two(6, '白色', ['红色', '黄色']), `and two on white, with one you know (${words.slice(6, 9)})`);
  assert.ok(all.slice(9).every(q => ['红色', '黄色', '白色'].includes(q.word)), 'then two mixing them');
  assert.ok(all.slice(3, 6).filter(q => /Listen/.test(q.head)).every(q => q.options.map(caps).includes('红色')), '红色, which you know by then, is an answer beside 黄色');
  assert.ok(all.slice(6).every(q => /Which paint is it\?/.test(q.head)), 'and once you know two colours, all the answers are paints');
  const qs = all.slice(0, 3);
  for (const q of qs){
    assert.match(q.head, /Which is it\?/, 'not “Which paint?”: the other answers are things you know');
    assert.equal(q.options.length, 3);
    if (!/Listen/.test(q.head)) continue;   // (once you recognise it, you read it, and the answers are pictures alone)
    const others = q.options.map(caps).filter(o => o !== '红色');
    assert.ok(others.length === 2 && others.every(o => KNOWN.includes(o) && !COLOURS.includes(o)), `things you know, with pictures: ${others}`);
  }
  assert.ok(qs.some(q => /Listen/.test(q.head)), 'while it’s new, you hear it');
  assert.deepEqual(get(g, '__scenes'), ['paintLanterns'], 'then the class goes out and paints, at the end of the lesson');
  assert.deepEqual(get(g, 'paintedParts()'), {lanterns: '红色'}, 'the lanterns, red');
  assert.equal(g.run('S.shells'), 6, 'a shell for each right answer while its colour needed practice (the first two of each)');
  assert.equal(g.run('__lessons'), 0, 'a colour lesson, not practice');
  assert.equal(g.run('here().lastLesson'), 'colours');
  assert.deepEqual(get(g, 'AREA.scenes.paintLanterns.captions').map(c => c.zh.replace(/ /g, '')), ['我们去刷灯笼吧！', '灯笼是红色的！']);
  assert.equal(get(g, 'areaChecklist().find(([t]) => /colours/.test(t))[0]'), 'Learn nine colours at the 学校 (school) (3/9)');
});

test('a game that learned red when lessons taught one: yellow, then white, one a lesson without waiting, and nothing more is painted; after the first three, one a lesson', async () => {
  const g = game({'红色': 2});
  assert.deepEqual(get(g, 'lessonNow().words'), ['黄色'], 'one at a time, as it was (the first lesson’s card says three new colours)');
  answering(g);
  g.run('globalThis.__starts = []; confirmBox = async (who, text) => { __starts.push(text); return true; }');
  await lesson(g);
  assert.match(get(g, '__starts')[0], /^Today: a new colour/);
  const qs = get(g, '__qs');
  assert.deepEqual(qs.map(q => q.word).sort(), ['红色', '黄色', '黄色', '黄色', '黄色'].sort(), 'five questions: four on yellow, and one on red, the colour you know');
  const yellow = qs.find(q => q.word === '黄色');
  assert.ok(yellow.options.map(caps).includes('红色'), 'red, the colour you know, is an answer');
  assert.deepEqual(get(g, '__scenes'), [], 'no painting (until 24 October 2026, the sign was painted yellow)');
  assert.deepEqual(get(g, 'paintedParts()'), {lanterns: '红色'});
  g.run("rec('黄色').ok = 0; S.turn += 8");   // (8 more questions answered: the next new word waits for them, tests/lesson-wait.test.js)
  assert.ok(get(g, "needsPractice('黄色')"));
  assert.deepEqual(get(g, 'lessonNow().words'), ['白色'], 'then white, without waiting for yellow to be practised');
  const fourth = game(FIRST_THREE);
  assert.deepEqual(get(fourth, 'lessonNow().words'), ['黑色'], 'after the first three, one a lesson');
});

test('a game that learned red, yellow and white in the prologue (before 22 October 2026) starts at 黑色; its lanterns are red', async () => {
  const g = game(FIRST_THREE);
  assert.equal(get(g, 'lessonNow().word'), '黑色');
  answering(g);
  await lesson(g);
  const qs = get(g, '__qs');
  assert.equal(qs.filter(q => q.word === '黑色').length, 3, 'three of them are the new colour');
  assert.ok(qs.filter(q => q.word !== '黑色').every(q => ['红色', '黄色', '白色'].includes(q.word)), 'and two are colours you know');
  assert.deepEqual(get(g, '__scenes'), [], 'no painting');
  assert.deepEqual(get(g, 'paintedParts()'), {lanterns: '红色'}, 'the lanterns red, as they knew red already');
  assert.ok(!get(g, 'Object.keys(AREA.scenes)').some(id => /^paint(?!Lanterns)/.test(id)), 'no scenes of painting the rest of the school');
});

test('a colour question: you hear it while it’s new (the paints with their characters), and read it once you know it (the paints alone), from colours you know', async () => {
  const g = game({...FIRST_THREE, '黑色': 0});   // (just taught)
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
  const later = game({...FIRST_THREE, '黑色': 2});
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
  const g = game({...FIRST_THREE, '黑色': 1});
  assert.equal(get(g, 'lessonNow()'), null, '黑色 still needs practice (and you know all the numbers)');
  answering(g);
  await lesson(g);
  assert.equal(g.run('__lessons'), 1, 'so the lesson is practice');
  g.run('rec("黑色").ok = 2');
  assert.equal(get(g, 'lessonNow().word'), '蓝色', 'then 蓝色');
  const both = game();
  both.run("for (const n of ['四', '五', '六', '七', '八', '九', '十']) delete S.w[n]");
  answering(both);
  assert.deepEqual(get(both, 'lessonNow().words'), ['四', '五', '六'], 'a new number and a new colour to learn: the numbers first');
  await lesson(both);
  both.run('S.turn += 8');   // (8 more questions answered: the next new word waits for them, tests/lesson-wait.test.js)
  assert.deepEqual(get(both, 'lessonNow().words'), ['红色', '黄色', '白色'], 'then a colour lesson');
  await lesson(both);
  both.run('S.turn += 8');
  assert.deepEqual(get(both, 'lessonNow().words'), ['七'], 'then a number lesson again: they take turns, one a lesson now');
  assert.deepEqual(get(both, '__scenes'), ['paintLanterns']);
});

test('the school on the home ground: its lanterns red once you know 红色, drawn again then; the rest as it was built', () => {
  const g = game({}, {place: 'homeGround', x: 11, y: 5, dir: 'up'});
  assert.deepEqual(get(g, 'paintedParts()'), {}, 'no colours learned yet: paper lanterns');
  const before = g.run('mapStoryNow()');
  g.run('rec("黑色").lv = 1');
  assert.equal(g.run('mapStoryNow()'), before, 'black paints nothing');
  g.run('rec("红色").lv = 1');
  assert.notEqual(g.run('mapStoryNow()'), before, 'red paints the lanterns, so the map is drawn again');
  const all = game(Object.fromEntries(COLOURS.map(c => [c, 2])), {place: 'homeGround', x: 11, y: 5, dir: 'up'});
  assert.deepEqual(get(all, 'paintedParts()'), {lanterns: '红色'});
  assert.equal(get(all, 'lessonNow()'), null, 'all nine learned: no more colour lessons');
  assert.ok(get(all, 'areaChecklist().find(([t]) => /colours/.test(t))[1]'), 'the checklist is ticked: 9/9');
});

test('each painting scene can be drawn at every moment, and saying Not now to a colour lesson ends it there', async () => {
  const g = game(Object.fromEntries(COLOURS.map(c => [c, 2])), {place: 'homeGround', x: 11, y: 5, dir: 'up'});
  for (const id of Object.values(get(g, 'AREA.lessons.find(l => l.id === "colours").scenes'))){
    assert.equal(g.run(`AREA.scenes.${id}.art`), 'paintingSchool');
    for (let t = 0; t <= 6; t += .25) g.run(`SCENE_ART.paintingSchool(${t}, ${1000 + t * 1000}, AREA.scenes.${id})`);
  }
  const no = game();
  no.run('confirmBox = async () => false');
  await lesson(no);
  assert.deepEqual(get(no, '__said'), ['上课！'], 'no 下课');
  assert.equal(no.run('lvl("红色")'), 0, 'nothing learned');
  assert.deepEqual(get(no, '__scenes'), [], 'and nothing painted');
});

test('A at the school’s lanterns, at its front corners: plain paper, then red once the class has painted them, showing you 红色 again (24 October 2026)', async () => {
  for (const [x, y, dir] of [[8, 5, 'up'], [7, 3, 'right'], [14, 5, 'up'], [15, 3, 'left']]){   // from below or beside each corner
    const g = game({}, {place: 'homeGround', x, y, dir});
    g.run("globalThis.__notes = []; showNarration = toast = async t => { __notes.push(t); }");
    assert.equal(g.run('promptFor(...facing())'), 'Look');
    await play(g, 'interact(...facing())');
    assert.deepEqual(get(g, '[__notes, __cards]'), [['Paper lanterns hang from the eaves of the 学校 (school).'], []]);
    const red = game({'红色': 2}, {place: 'homeGround', x, y, dir});
    red.run("showNotice = async (w, o = {}) => { __cards.push([w, o.note || null]); }");
    await play(red, 'interact(...facing())');
    assert.deepEqual(get(red, '__cards'), [['红色', 'The lanterns on the 学校 (school) are red: the class painted them.']]);
  }
  const g = game({'红色': 2}, {place: 'homeGround', x: 10, y: 5, dir: 'up'});
  g.run("showNotice = async (w, o = {}) => { __cards.push(w); }");
  await play(g, 'interact(10, 4)');
  assert.deepEqual(get(g, '__cards'), ['学校'], 'the rest of the school is still the school');
});
