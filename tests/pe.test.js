// PE at school (体育, js/pe.js, decided 28 October 2026): once the first two lessons are done, a third subject on the
// timetable, out on the sports ground (操场), through a gap in the trees at the home ground's back left. Its first lesson
// is a race with two classmates, the teacher starting it with 一，二，三，跑！ (teaching 跑), 3 shells the first time you
// win; its second, 我们去跑步吧！ (teaching 跑步) and a jog round the track. Once you know 跑, hold B to run.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const AT_SCHOOL = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2, feast: 3};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '猴子', '朋友', '河', '鱼', '木头', '桌子', '碗', '学校', '老师', '同学',
  '一', '二', '三', '跳', '吃', '喝', '睡觉', '四', '五', '六', '红色', '黄色', '白色'];   // (the first two lessons done: PE is on)
// A game at school, by the teacher, knowing these words (w: more, {word: ok}). The clock (performance.now) only moves when
// the test moves it (tick), so the race can be run step by step.
function game(w = {}, area = {}, known = KNOWN){
  const words = Object.fromEntries([...known.map(x => [x, 2]), ...Object.entries(w)].map(([x, ok]) => [x, {lv: 1, ok}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, w: words, shells: 0, met: ['rabbit', 'fox', 'squirrel', 'goat'], areas: {1: {...AT_SCHOOL, ...area}},
    pos: {place: 'school', x: 7, y: 3, dir: 'up'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__qs = []; globalThis.__t = 1000; performance.now = () => __t");
  g.run("showDialog = async (who, line, opts = {}) => { __said.push(line.t.join('') + (opts.teach ? ' [' + opts.teach + ']' : '')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run("showNotice = async (w, o = {}) => { __notes.push('card: ' + w + (o.note ? ' (' + o.note + ')' : '')); rec(w).lv = Math.max(rec(w).lv || 0, 1); }");
  g.run("pictureQ = async q => { __qs.push({w: q.word, place: PLACE, you: [pl.x, pl.y], elder: (n => [n.x, n.y])(ALL_NPCS.find(n => n.id === 'elder')), racers: ['playful', 'troop2'].map(id => ALL_NPCS.find(n => n.id === id).x)}); return true; }");   // (every question answered right)
  g.run('placePlayer()');
  return g;
}
async function tick(g, n = 20, ms = 0){ for (let i = 0; i < n; i++){ g.run(`__t += ${ms}`); await new Promise(r => setImmediate(r)); g.flush(); } }
const PE = "AREA.lessons.find(s => s.id === 'pe')";
const racers = g => get(g, "['playful', 'troop2'].map(id => (n => [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === id)))");

test('PE opens once the first two lessons are done: a third subject on the timetable, and a gap in the trees to the sports ground', () => {
  const before = game({}, {}, KNOWN.filter(w => w !== '白色'));
  assert.deepEqual(get(before, 'subjects().map(s => s.id)'), ['numbers', 'colours'], 'not till you know all six of the first two lessons’ words');
  before.run("S.pos = {place: 'homeGround', x: 1, y: 2, dir: 'left'}; placePlayer()");
  assert.equal(get(before, 'tileAt(0, 2).look'), 'tree');
  assert.equal(get(before, '!!exitAt(0, 2)'), false);
  const g = game();
  assert.deepEqual(get(g, 'subjects().map(s => s.id)'), ['numbers', 'colours', 'pe']);
  assert.deepEqual(get(g, `[lessonsOf(${PE}), lessonDetail(${PE}, 1), lessonDetail(${PE}, 2)]`),
    [[['跑'], ['跑步']], '<b>Lesson 1</b> · Ready: A race, out on the sports ground.', '<b>Lesson 2</b> · Opens once you’ve done lesson 1.']);
  g.run("S.pos = {place: 'homeGround', x: 1, y: 2, dir: 'left'}; placePlayer()");
  assert.equal(get(g, 'tileAt(0, 2).look'), 'grass', 'the gap in the trees');
  assert.equal(get(g, 'exitAt(0, 2).to'), 'sportsGround');
});

test('the sports ground: one screen, a sandy track of three lanes, the way back, and A at its things says what they are', () => {
  const g = game();
  const p = get(g, 'PLACES.sportsGround');
  assert.deepEqual([p.map.length, p.map[0].length], [10, 15], 'one screen, so you see the whole race');
  assert.deepEqual(p.name, {zh: '操场', py: 'cāochǎng', en: 'Sports ground'});
  assert.deepEqual(p.exits.map(e => [e.at, e.to]), [[[14, 2], 'homeGround']]);
  assert.deepEqual(p.map.slice(3, 6).map(r => r.slice(2, 13)), Array(3).fill('_'.repeat(11)), 'three lanes, ten steps from start to finish');
  for (const k of ['D', 'f', 'p', 'S', 'W']) assert.ok(p.legend[k].onLook[0].do[0].message, `A at ${p.legend[k].look} says what it is`);
  g.run("S.pos = {place: 'sportsGround', x: 2, y: 2, dir: 'down'}; placePlayer()");
  assert.deepEqual(get(g, "mapObjects().filter(o => ['sandTrack', 'plumPoles', 'weaponRack'].includes(o.look)).map(o => [o.look, o.x, o.y, o.w, o.h])"),
    [['sandTrack', 2, 3, 11, 3], ['plumPoles', 12, 6, 2, 2], ['weaponRack', 5, 7, 2, 1]], 'the track, the poles and the rack are each one object');
});

test('the race: out to the sports ground, 一，二，三，跑！ teaches 跑, and your classmates set off when you do; win, and 3 shells the first time', async () => {
  const g = game();
  g.run(`${PE}.race.ms = 10`);   // (quicker, for the test)
  g.run(`globalThis.__r = null; peLesson(${PE}, ['跑'], 'elder').then(r => { __r = r; })`);
  await tick(g);
  assert.equal(get(g, 'PLACE'), 'sportsGround', 'out on the sports ground');
  assert.deepEqual(get(g, '[pl.x, pl.y, pl.dir]'), [2, 4, 'right'], 'you in the middle lane');
  assert.deepEqual(racers(g), [['sportsGround', 2, 3], ['sportsGround', 2, 5]], 'your classmates either side');
  assert.deepEqual(get(g, "(n => [n.x, n.y])(ALL_NPCS.find(n => n.id === 'elder'))"), [1, 4], 'the teacher by the drum');
  assert.deepEqual(get(g, '__said'), ['一，二，三，跑！ [跑]']);
  assert.ok(get(g, '__notes').includes('card: 跑 (The teacher starts a race on the sports ground.)'));
  assert.ok(get(g, '__notes').includes('Race to the red ribbon: hold B as you walk, to run!'));
  assert.ok(get(g, '!!race && !busy'), 'the race is on: you can move');
  await tick(g, 10, 50);
  assert.deepEqual(racers(g).map(r => r[1]), [2, 2], 'they wait for you to set off');
  g.run("tryStep('up', __t + 1000)");
  assert.deepEqual(get(g, '[pl.y, !!pl.mv]'), [4, false], 'you can’t leave your lane');
  g.run("pl.dir = 'left'; finishedAt = null; pressA()"); await tick(g, 3);
  assert.deepEqual(get(g, '__said'), ['一，二，三，跑！ [跑]'], 'and A at the teacher does nothing: just run');
  g.run("pl.dir = 'right'");
  g.run('pl.x = 3');   // you set off
  await tick(g, 3, 1);
  assert.ok(racers(g).every(r => r[1] > 2), 'and so do they');
  g.run('pl.x = 12');   // and get there first
  await tick(g, 40, 20);
  assert.deepEqual(get(g, '__qs[0].racers'), [12, 12], 'they run on to the finish');
  assert.deepEqual(get(g, '__said'), ['一，二，三，跑！ [跑]', '很好！'], 'the teacher: very good!');
  assert.ok(get(g, '__notes').includes('You won the race! +3 🐚'));
  assert.equal(get(g, 'here().raceWon'), 1);
  assert.equal(get(g, '__qs.length'), 5, 'then five questions');
  assert.equal(get(g, '__qs.filter(q => q.w === "跑").length'), 3, 'three on 跑, and two on other actions you know');
  assert.ok(get(g, '__qs.every(q => q.place === "sportsGround")'));
  assert.equal(get(g, 'PLACE'), 'school', 'back in the classroom');
  assert.deepEqual(get(g, '[pl.x, pl.y]'), [7, 3]);
  assert.deepEqual(racers(g), [['school', 3, 5], ['school', 2, 7]], 'and your classmates at their desks');
  assert.deepEqual(get(g, '__r'), {right: 5, asked: 5, shells: 2, won: true}, 'two shells for 跑 while it needed practice (right twice)');
  assert.equal(get(g, 'S.shells'), 3 + 2, 'and the race’s three');
});

test('the race again: no prize a second time; lose, and nothing happens but a tip', async () => {
  const g = game({'跑': 2}, {raceWon: 1});
  g.run(`${PE}.race.ms = 10`);
  g.run(`peLesson(${PE}, ['跑'], 'elder', {again: true})`);
  await tick(g);
  assert.deepEqual(get(g, '__said'), ['一，二，三，跑！'], 'nothing taught');
  assert.ok(!get(g, '__notes').some(n => n.startsWith('card:')));
  g.run('pl.x = 3'); await tick(g, 3, 1);
  g.run('pl.x = 12'); await tick(g, 40, 20);
  assert.ok(get(g, '__notes').includes('You won the race!'));
  assert.equal(get(g, 'S.shells'), 0, 'no shells a second time');
  const h = game({'跑': 2});
  h.run(`${PE}.race.ms = 10`);
  h.run(`peLesson(${PE}, ['跑'], 'elder', {again: true})`);
  await tick(h);
  h.run('pl.x = 3'); await tick(h, 40, 20);   // (you stop: they get there first)
  assert.deepEqual(racers(h).map(r => r[1]), [12, 12]);
  assert.ok(get(h, '!!race'), 'and it’s still on, till you get there');
  h.run('pl.x = 12'); await tick(h, 40, 20);
  assert.ok(get(h, '__notes').includes('Your classmates won this time. Hold B as you walk, to run!'));
  assert.equal(get(h, 'S.shells'), 0);
  assert.equal(h.run('typeof here().raceWon'), 'undefined');
  assert.deepEqual(get(h, '__said'), ['一，二，三，跑！', '很好！'], 'very good, however you did');
});

test('the jog: 我们去跑步吧！ teaches 跑步, and the teacher leads the class once round the track, you behind him', async () => {
  const g = game({'跑': 2});
  g.run(`${PE}.jog.ms = 1`);
  g.run(`peLesson(${PE}, ['跑步'], 'elder')`);
  await tick(g, 200);
  assert.deepEqual(get(g, '__said'), ['我们去跑步吧！ [跑步]', '很好！']);
  assert.ok(get(g, '__notes').includes('card: 跑步 (The class goes running round the sports ground.)'));
  assert.deepEqual(get(g, '[__qs[0].place, __qs[0].you, __qs[0].elder]'), ['sportsGround', [2, 4], [2, 3]], 'once round: back where you started, you behind him');
  assert.equal(get(g, '__qs.filter(q => q.w === "跑步").length'), 3);
  assert.equal(get(g, 'PLACE'), 'school');
});

test('running: once you know 跑, holding B makes each step a third quicker, quicker still with honey; B’s label says Run', () => {
  const g = game();
  assert.equal(get(g, 'walkMs()'), 270);
  g.run('bHeld = true');
  assert.equal(get(g, 'walkMs()'), 270, 'not before PE has taught you 跑');
  assert.equal(get(g, 'buttonLabels(0)[1]'), '');
  g.run("rec('跑').lv = 1");
  assert.equal(get(g, 'walkMs()'), 203, 'a third faster');
  assert.equal(get(g, 'buttonLabels(0)[1]'), 'Run');
  g.run("energise('蜂蜜', 60)");
  assert.equal(get(g, 'walkMs()'), 122, 'with honey too: about twice as fast as walking');
  g.run('bHeld = false');
  assert.equal(get(g, 'walkMs()'), 162, 'honey alone');
  g.run("bHeld = true; fastUntil = 0; S.pos = {place: 'school', x: 7, y: 7, dir: 'down'}; placePlayer(); tryStep('down', 5000)");
  assert.ok(get(g, 'pl.mv.run && pl.mv.dur === 203'), 'a running step (with dust behind you)');
  assert.equal(get(g, 'TIPS.run.at'), '#btnB');
});
