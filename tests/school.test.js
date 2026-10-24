// Chapter 1: the school. Once its frame is up, the big monkey starts the troop building it (a scene, told like the
// opening, teaching 学校), and it stands on its plot. You walk in through its door to a classroom (a place with its own
// legend), where the class greets the old monkey, their teacher (老师), and the little monkey tells you you're classmates
// (同学). Lessons with the teacher take the place of the practice post, which the troop used to build the school.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done'};
const WORDS = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '猴子', '朋友', '河', '鱼', '木头', '一', '二', '三', '桌子'];
function game(area = {}, pos = {place: 'homeGround', x: 15, y: 5, dir: 'up'}, more = []){
  const w = Object.fromEntries([...WORDS, ...more].map(x => [x, {lv: 1, ok: 0}]));
  const g = loadGame({dom: true, save: {version: 29, started: true, w, met: ['rabbit', 'fox', 'squirrel', 'goat', 'deer'], areas: {1: {...CHAPTER_ONE, ...area}}, pos}});   // (the deer: met in the pine wood)
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__scenes = []; globalThis.__lessons = 0");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; replyWith = async () => {}");
  g.run("showNotice = async w => { __notes.push('card: ' + w); rec(w).lv = Math.max(rec(w).lv || 0, 1); }; storyScene = async id => { __scenes.push(id); }");
  g.run("practise = async () => { __lessons++; return true; }");   // (a lesson itself: the practice post's own tests)
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 200 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
const face = (g, x, y, dir) => g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`);
const press = (g, x, y, dir) => { face(g, x, y, dir); return play(g, 'interact(...facing()).then(runEvents)'); };
const bubble = (g, id) => get(g, `((AREA.bubbles.${id} || []).find(b => matches(b.if)) || {}).show || null`);
// Walks a step that way (as holding the D-pad does, already facing it), and waits for wherever it leads.
async function walk(g, dir){ g.run(`pl.dir = '${dir}'; pl.turnT = 0; tryStep('${dir}', performance.now() + 1e6)`); for (let i = 0; i < 40; i++){ g.run('update(performance.now() + 1e7)'); await new Promise(r => setImmediate(r)); g.flush(); } }

test('the frame is up: the big monkey starts the troop building the school (a scene), which teaches 学校, and there it stands', async () => {
  const g = game();
  assert.equal(bubble(g, 'big'), '!');
  assert.match(get(g, 'getTasks()[0].text'), /^Talk to the big monkey: the troop is ready to build the school$/);
  await press(g, 15, 5, 'up');
  assert.deepEqual(get(g, '__said'), ['我们来盖学校吧！']);
  assert.deepEqual(get(g, '__scenes'), ['buildingSchool'], 'the scene, told like the opening');
  assert.ok(get(g, '__notes').includes('card: 学校'));
  assert.equal(g.run('here().school'), 1);
  assert.equal(g.run('tileAt(8, 2).look'), 'school');
  assert.equal(get(g, 'OBJECT_PIECES.filter(p => p.look === "school").map(p => [p.x, p.y, p.w, p.h])').join(), '8,2,7,3', 'one building, as big as the plot');
  assert.match(get(g, '__notes').join(' '), /practice post from the meadow/, 'the troop used the practice post');
  assert.match(get(g, 'getTasks()[0].text'), /^Go into the 学校 \(school\), and talk to the old monkey at the front of the class$/);
  assert.deepEqual(get(g, 'getTasks()[0].target'), [11, 4], 'the arrow points the way in: its door');
  const scene = get(g, 'AREA.scenes.buildingSchool.captions').map(c => c.zh.replace(/ /g, ''));
  assert.deepEqual(scene, ['我们有木头，也有石头。', '一，二，三！', '太好了！', '这是我们的学校！']);
});

test('the practice post in the meadow is gone once the school is built: lessons take its place', () => {
  const before = game({}, {place: 'meadow', x: 13, y: 10, dir: 'up'});
  assert.equal(before.run('tileAt(13, 9).action'), 'training');
  assert.equal(before.run('practiseWhere()'), 'at the practice post');
  const after = game({school: 2}, {place: 'meadow', x: 13, y: 10, dir: 'up'});
  assert.equal(after.run('tileAt(13, 9).look'), 'grass', 'the post has gone');
  assert.equal(after.run('practiseWhere()'), 'in a lesson at school');
  assert.equal(get(after, 'summaryOf(S, 1).where'), 'in a lesson at school', 'the title screen’s card for the game says so too');
  assert.equal(get(before, 'summaryOf(S, 1).where'), 'at the practice post');
});

test('the school’s door: you walk in through it, though the building isn’t somewhere you can walk; before it’s built, there’s no way in', async () => {
  const g = game({school: 1}, {place: 'homeGround', x: 11, y: 5, dir: 'up'}, ['学校']);
  assert.ok(!g.run('tileAt(11, 4).walk'), 'the building');
  await walk(g, 'up');
  assert.equal(g.run('PLACE'), 'school', 'through the door');
  assert.deepEqual(get(g, '[pl.x, pl.y, pl.dir]'), [7, 8, 'up']);
  await walk(g, 'down');
  assert.equal(g.run('PLACE'), 'homeGround', 'and out again');
  assert.deepEqual(get(g, '[pl.x, pl.y]'), [11, 5]);
  const frame = game({}, {place: 'homeGround', x: 11, y: 5, dir: 'up'});
  assert.equal(frame.run('exitAt(11, 4)'), undefined, 'just the frame: no way in yet');
});

test('the classroom has its own legend: letters that mean something else outside', () => {
  const g = game({school: 2}, {place: 'school', x: 7, y: 8, dir: 'up'}, ['学校', '老师']);
  assert.deepEqual(get(g, 'PLACES.school.name'), {zh: '学校', py: 'xuéxiào', en: 'School'});
  assert.equal(g.run('tileAt(2, 4).look'), 'desk', 'a "d" in the classroom is a desk');
  assert.equal(g.run('tileAt(9, 2).look'), 'teacherTable');
  assert.equal(g.run('tileAt(5, 1).look'), 'blackboard');
  g.run("S.pos = {place: 'homeGround', x: 3, y: 5, dir: 'right'}; placePlayer()");
  assert.equal(g.run('tileAt(3, 12).look'), 'grass', 'and on the home ground, a "d" is where the shop’s plot will be (open grass till its story begins)');
});

test('the first time you talk to the teacher, the class greets him: 老师好！ (老师), 同学们好！', async () => {
  const g = game({school: 1}, {place: 'homeGround', x: 11, y: 5, dir: 'up'}, ['学校']);
  assert.equal(bubble(g, 'elder'), '!');
  await walk(g, 'up');
  assert.deepEqual(get(g, 'getTasks()[0].target'), [7, 2], 'inside, the arrow points at him');
  await press(g, 7, 3, 'up');
  assert.deepEqual(get(g, '__said'), ['上课！', '老师好！', '同学们好！']);
  assert.ok(get(g, '__notes').includes('card: 老师'), 'the class teaches 老师');
  assert.equal(g.run('here().school'), 2);
  assert.deepEqual(get(g, "['elder', 'playful', 'troop1', 'troop2', 'troop3'].map(id => (n => [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === id)))"),
    [['school', 7, 2], ['school', 3, 5], ['school', 6, 5], ['school', 2, 7], ['school', 11, 7]], 'the teacher at the front, the troop at their desks');
  assert.match(get(g, '__notes').join(' '), /Lessons are where you practise your words now/);
});

test('the little monkey: 我们是同学！ (同学); then lessons with the teacher, who has a ! when words need practice', async () => {
  const g = game({school: 2}, {place: 'school', x: 4, y: 5, dir: 'left'}, ['学校', '老师', '四', '五', '六', '七', '八', '九', '十', '红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色']);   // (no new number or colour to learn: tests/numbers.test.js, tests/colours.test.js)
  assert.equal(bubble(g, 'playful'), '!');
  assert.match(get(g, 'getTasks()[0].text'), /Talk to the little monkey/);
  await press(g, 4, 5, 'left');
  assert.deepEqual(get(g, '__said'), ['我们是同学！']);
  assert.ok(get(g, '__notes').includes('card: 同学'));
  assert.equal(bubble(g, 'playful'), null);
  assert.ok(get(g, 'areaChecklist().filter(([, , , found]) => found).every(([, done]) => done)'), 'chapter 1 so far is ticked off (the flowers wait for the big monkey to ask)');
  assert.equal(bubble(g, 'elder'), g.run('trainingCalls()') ? '!' : null, 'a ! over the teacher when words need practice');
  g.run('__said.length = 0');
  await press(g, 7, 3, 'up');
  assert.deepEqual(get(g, '__said'), ['上课！', '下课！']);
  assert.equal(g.run('__lessons'), 1, 'a lesson');
  g.run('__said.length = 0; practise = async () => false');   // you don't start it, or stop
  await press(g, 7, 3, 'up');
  assert.deepEqual(get(g, '__said'), ['上课！'], 'no 下课 if you don’t have the lesson');
  assert.match(g.run('tasksHint()'), /You know all nine colours! The big monkey has something to ask you/, 'with every colour learned, the big monkey wants flowers for the school');
  g.run("Object.assign(here(), {flowers: 'done', schoolFlowers: true})");
  assert.match(g.run('tasksHint()'), /gives you a lesson whenever there’s a new number or colour to learn, or your words need practice/);
});
