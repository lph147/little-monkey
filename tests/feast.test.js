// Chapter 1: the great feast is announced. Once the school's first two lessons have taught you 四 五 六 and 红色 黄色 白色,
// the old monkey has news, before any lesson: 我们有家，也有学校！ (teaching 有, to have), so it's time for a great feast
// (decided 24 October 2026: after the first two lessons, so chapter 1 opens up; it waited till the flowers were
// planted, after every lesson). As you come up to the big tree at the home ground, the troop sets up the feast's big table
// under it, as you watch: its legs, its top with a red cloth, then a bowl at a time, each with a knock. The hungry monkey
// comes up from the meadow to look after it.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const AT_SCHOOL = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '猴子', '朋友', '河', '鱼', '木头', '桌子', '碗', '家', '学校', '老师', '同学',
  '一', '二', '三', '谢谢', '不客气', '我', '要'];
const FIRST_TWO = ['四', '五', '六', '红色', '黄色', '白色'];   // what the first two lessons teach
const BY_TEACHER = {place: 'school', x: 7, y: 3, dir: 'up'};
// A game in chapter 1 (area: more progress), standing at pos, knowing these words (each right twice in a row).
function game(area = {}, pos = BY_TEACHER, words = [...KNOWN, ...FIRST_TWO]){
  const w = Object.fromEntries(words.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 30, started: true, w, shells: 0, met: ['rabbit', 'fox', 'squirrel', 'goat', 'deer'], areas: {1: {...AT_SCHOOL, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__lessons = 0; globalThis.__knocks = []");
  g.run("showDialog = async (who, line, opts = {}) => { __said.push(line.t.join('') + (opts.teach ? ' [' + opts.teach + ']' : '')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run("showNotice = async (w, o = {}) => { __notes.push('card: ' + w + (o.note ? ' (' + o.note + ')' : '')); rec(w).lv = Math.max(rec(w).lv || 0, 1); }");
  g.run("LESSON_KINDS.count = LESSON_KINDS.paint = async () => { __lessons++; return true; }; practise = async () => { __lessons++; return true; }");   // (lessons: their own tests)
  g.run("SFX.tock = () => { __knocks.push(settingUp && settingUp.stage); }");   // (each piece of what's being set up)
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
const face = (g, x, y, dir) => g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`);
const press = (g, x, y, dir) => { face(g, x, y, dir); return play(g, 'interact(...facing()).then(runEvents)'); };
const goTo = (g, x, y) => { face(g, x, y, 'up'); return play(g, 'runEvents()'); };   // (standing there, as you arrive)
const bubble = (g, id) => get(g, `((AREA.bubbles.${id} || []).find(b => matches(b.if)) || {}).show || null`);
const item = (g, re) => get(g, `areaChecklist().find(([t]) => ${re}.test(t)) || null`);
const hungry = g => get(g, "(n => [n.place, n.x, n.y, n.dir])(ALL_NPCS.find(n => n.id === 'hungry'))");

test('before the first two lessons, the old monkey has no news: a lesson, as usual', async () => {
  const g = game({}, BY_TEACHER, [...KNOWN, '四', '五', '六']);   // (no colours yet)
  assert.ok(!get(g, 'getTasks().some(t => /news/.test(t.text))'));
  assert.equal(item(g, /news/)[3], false, 'not on the checklist yet');
  await press(g, 7, 3, 'up');
  assert.deepEqual(get(g, '__said'), ['上课！', '下课！']);
  assert.equal(g.run('__lessons'), 1);
  assert.equal(g.run('here().feast'), 0);
  assert.deepEqual(hungry(g), ['meadow', 13, 5, 'down'], 'the hungry monkey is still in the meadow');
});

test('after them, the old monkey has news before any lesson: 我们有家，也有学校！ teaches 有, and it’s time for a great feast', async () => {
  const g = game();
  assert.equal(bubble(g, 'elder'), '!');
  const task = get(g, 'getTasks()[0]');
  assert.equal(task.text, 'Talk to the old monkey at the 学校 (school): he has news');
  assert.deepEqual(item(g, /news/), ['Hear the old monkey’s news at the 学校 (school)', false, false, true], 'on the checklist (found), not done yet');
  await press(g, 7, 3, 'up');
  assert.deepEqual(get(g, '__said'), ['我们有家，也有学校！ [有]'], 'no lesson this time: just his news, with 有 in bold');
  assert.equal(g.run('__lessons'), 0);
  const notes = get(g, '__notes');
  assert.equal(notes[0], 'card: 有 (Use 有 to say what you have.)', 'its card, with no picture, like 要');
  assert.match(notes.join(' '), /Time for a great feast, for the whole troop! It will be at a big 桌子 \(table\) under the big 树 \(tree\), in the middle of the home ground/);
  assert.equal(g.run('here().feast'), 1);
  assert.ok(g.run("lvl('有') >= 1"), '有 is a word you know now');
  assert.deepEqual(item(g, /news/)[1], true, 'ticked off');
  assert.deepEqual(hungry(g), ['homeGround', 19, 7, 'left'], 'the hungry monkey has gone up to the home ground, to look after the table');
  const next = get(g, 'getTasks()').find(t => /big/.test(t.text));
  assert.equal(next.text, 'Go to the big 树 (tree) in the middle of the home ground');
  assert.deepEqual(get(g, "AREA.tasks.find(t => t.id === 'feastTable').arrow"), [17, 7, 'homeGround'], 'its arrow points at the big tree');
  g.run('__said.length = 0');
  await press(g, 7, 3, 'up');
  assert.deepEqual(get(g, '__said'), ['上课！', '下课！'], 'then lessons, as before');
});

test('as you come up to the big tree, the troop sets up the feast’s big table under it as you watch, a piece at a time, each with a knock', async () => {
  const g = game({feast: 1}, {place: 'homeGround', x: 10, y: 8, dir: 'right'});
  assert.equal(g.run('tileAt(17, 7).look'), 'grass', 'open grass under the big tree');
  await goTo(g, 10, 8);
  assert.equal(g.run('here().feast'), 1, 'not from across the home ground');
  await goTo(g, 14, 8);   // (three squares from the middle of the table)
  assert.deepEqual(get(g, '__knocks'), [1, 2, 3, 4, 5], 'its legs, its top, then a bowl of peaches, a bowl of apples and an empty one');
  assert.equal(g.run('here().feast'), 2);
  assert.equal(g.run('settingUp'), null, 'and it’s all up');
  assert.deepEqual(get(g, '[16, 17, 18].map(x => [tileAt(x, 7).look, walkable(x, 7)])'), [['feastTable', false], ['feastTable', false], ['feastTable', false]]);
  assert.deepEqual(get(g, "mapObjects().filter(o => o.look === 'feastTable')"), [{look: 'feastTable', x: 16, y: 7, w: 3, h: 1}], 'one table, three squares wide');
  assert.match(get(g, '__notes').join(' '), /The troop sets up a big 桌子 \(table\) under the big tree for the feast, with peaches, apples, and an empty bowl, waiting for something…/);
  assert.deepEqual(item(g, /set up/), ['See the big 桌子 (table) set up for the feast', true, false, true]);
  assert.ok(!get(g, 'getTasks()').length, 'nothing more to do for now');
  assert.match(g.run('tasksHint()'), /The big monkey has something to ask you/, 'the hint: his flowers first, while he has something to ask');
  g.run("Object.assign(here(), {flowers: 'done', schoolFlowers: true})");
  assert.match(g.run('tasksHint()'), /The big 桌子 \(table\) is ready for the feast, and more of chapter 1 is coming soon/, 'then the table');
  assert.deepEqual(hungry(g), ['homeGround', 19, 7, 'left'], 'the hungry monkey beside it');
  g.run('__knocks.length = 0');
  await goTo(g, 15, 8);
  assert.deepEqual(get(g, '__knocks'), [], 'once');
});

test('a game that comes back to the home ground with the table still to set up sees it go up there: only near the big tree', async () => {
  const g = game({feast: 1}, {place: 'homeGround', x: 17, y: 8, dir: 'up'});
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__knocks'), [1, 2, 3, 4, 5], 'resting in front of it after a lost fight, say');
  const far = game({feast: 1}, {place: 'school', x: 7, y: 8, dir: 'down'});
  await play(far, 'runEvents()');
  assert.equal(far.run('here().feast'), 1, 'not from the school');
});

test('A at the big table shows 桌子 (table): what it’s for', async () => {
  const g = game({feast: 2}, {place: 'homeGround', x: 17, y: 8, dir: 'up'});
  assert.equal(g.run('promptFor(17, 7)'), 'Look');
  await press(g, 17, 8, 'up');
  assert.deepEqual(get(g, '__notes'), ['card: 桌子 (The big table for the troop’s feast, under the big tree.)']);
});

test('有 has no picture, so lessons practise it in a sentence: 我有桃子 or 我有朋友, with 有 missing (or the teacher’s ! would stay up for it)', () => {
  const g = game({feast: 2}, BY_TEACHER, [...KNOWN, ...FIRST_TWO, '七', '八', '九', '十', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色']);
  g.run("setSeen('有')");   // (just learned, as the old monkey's news teaches it)
  assert.ok(get(g, "practiceWords().includes('有')"), '有 needs practice');
  assert.equal(bubble(g, 'elder'), '!', 'the teacher has a ! for it');
  for (let i = 0; i < 20; i++){
    const s = get(g, 'practiceSentence()');
    assert.equal(s.gap, '有', 'the word that needs practice is the one missing');
    assert.ok(['我有桃子', '我有朋友'].includes(s.t.join('')), s.t.join(''));
  }
  g.run("rec('有').ok = 2");
  assert.ok(!get(g, "practiceWords().includes('有')"), 'once it’s right twice, it doesn’t');
});

test('a game saved before the feast (with no feast in its save) that knows the first three of each gets the old monkey’s news straight away', () => {
  const w = Object.fromEntries([...KNOWN, ...FIRST_TWO, '七', '黑色'].map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({save: {version: 30, started: true, w, areas: {1: {...AT_SCHOOL, flowers: 'done', schoolFlowers: true}}, pos: BY_TEACHER}});
  assert.equal(g.run('here().feast'), 0);
  assert.equal(bubble(g, 'elder'), '!');
  assert.ok(get(g, 'getTasks().some(t => /he has news/.test(t.text))'));
});
