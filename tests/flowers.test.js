// Chapter 1: flowers for the school. Once the class has painted the school in every colour, the big monkey wants flowers to
// plant in front of it, a red, a yellow and a white one (decided 22 October 2026: he wanted them in the prologue, for no
// reason, before you knew the colours). Each one you pick shows what it is, 红色的花 (a red flower), with its own picture.
// Bring them to him, and he plants them in front of the school as you watch.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const PAINTED = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2};
const COLOURS = ['红色', '黄色', '白色', '黑色', '蓝色', '绿色', '棕色', '橙色', '粉色'];
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '猴子', '朋友', '河', '鱼', '木头', '桌子', '碗', '学校', '老师', '同学',
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '谢谢', '不客气', '我', '要'];
// A game at the home ground in chapter 1 (area: more progress), by the big monkey (or at pos), knowing these words.
function game(area = {}, pos = {place: 'homeGround', x: 15, y: 5, dir: 'up'}, words = [...KNOWN, ...COLOURS]){
  const w = Object.fromEntries(words.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 30, started: true, w, shells: 0, met: ['rabbit', 'fox', 'squirrel', 'goat', 'deer'], areas: {1: {...PAINTED, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__picked = []; globalThis.__sprouts = []");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run("showNotice = async w => { __notes.push('card: ' + w); }; replyWith = async () => true; gapQ = async () => true");   // (replies and gaps: their own tests)
  g.run("showPicked = async (f, note) => { __picked.push([f.zh, f.en, note]); }; SFX.sprout = () => { __sprouts.push(marking && marking.grow ? marking.changed.length : 0); }");
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
const bubble = g => get(g, "((AREA.bubbles.big || []).find(b => matches(b.if)) || {}).show || null");
const item = g => get(g, "areaChecklist().find(([t]) => /^Plant /.test(t))");
const BEDS = [[9, 5], [10, 5], [12, 5], [13, 5]];   // either side of the path up to the school's door

test('once you know every colour from the school’s lessons, the big monkey has a ! and wants flowers to plant in front of it', async () => {
  const before = game({}, undefined, [...KNOWN, ...COLOURS.slice(0, 8)]);   // (pink not learned yet)
  assert.equal(bubble(before), null, 'not before the last colour');
  await press(before, 15, 5, 'up');
  assert.deepEqual(get(before, '__said'), ['你是我们的王！'], 'he has nothing to ask yet');
  const g = game();
  assert.equal(bubble(g), '!');
  assert.match(g.run('tasksHint()'), /You know all nine colours! The big monkey has something to ask you/);
  assert.equal(item(g)[3], false, 'the checklist doesn’t show the flowers till he asks');
  await press(g, 15, 5, 'up');
  assert.deepEqual(get(g, '__said'), ['学校很好看！', '我们来种花吧！', '我要红色、黄色和白色的花！'], 'the school looks lovely, let’s plant flowers: red, yellow and white');
  assert.equal(g.run('here().flowers'), 'asked');
  assert.match(get(g, '__notes').join(' '), /wants to plant 花 \(flowers\) in front of the 学校 \(school\)/, 'why he wants them');
  const task = get(g, 'getTasks()[0]');
  assert.equal(task.text, 'Pick a red, a yellow and a white 花 (flower) for the big monkey to plant (0/3)');
  assert.deepEqual(task.target, [27, 2], 'the arrow points at the flowers by the top of the home ground');
  assert.deepEqual(item(g), ['Plant 花 (flowers) in front of the 学校 (school)', false, false, true], 'and it’s on the checklist');
});

test('each flower you pick shows what it is, with its own picture: 红色的花, a red flower; one of each colour', async () => {
  const g = game({flowers: 'asked'}, {place: 'homeGround', x: 26, y: 3, dir: 'up'});
  assert.equal(g.run('promptFor(26, 2)'), 'Pick');
  await press(g, 26, 3, 'up');
  assert.deepEqual(get(g, '__picked'), [['红色 的 花', 'A red flower', 'For the big monkey to plant (1/3). Find the other colours.']]);
  assert.deepEqual(get(g, '__notes'), [], 'and nothing else: the note is on its card');
  await press(g, 26, 3, 'up');
  assert.equal(get(g, '__picked').length, 1, 'a red one again: no');
  assert.deepEqual(get(g, '__notes'), ['You have a red 花 (flower) already. Find another colour.']);
  await press(g, 27, 3, 'up');
  await press(g, 28, 3, 'up');
  assert.deepEqual(get(g, '__picked').slice(1), [['黄色 的 花', 'A yellow flower', 'For the big monkey to plant (2/3). Find the other colours.'],
    ['白色 的 花', 'A white flower', 'You have a red, a yellow and a white 花 (flower). Take them to the big monkey.']]);
  assert.equal(g.run('here().holding.flowers'), '花');
  assert.equal(bubble(g), '?', 'a ? over the big monkey while you have them');
  assert.equal(get(g, 'getTasks()[0].text'), 'Take the 花 (flower) to the big monkey');
});

test('the card for what you’ve picked: its picture, Chinese, pinyin and English, said aloud', () => {
  const g = loadGame({dom: true});
  g.run("globalThis.__spoken = []; say = t => { __spoken.push(t); }; showPicked(AREA.legend.F.gather.picked, 'For the big monkey to plant (1/3).')");
  const sheet = g.el('#sheet'), text = sel => sheet.querySelector(sel).textContent.trim();
  assert.deepEqual(['.label', '.big', '.py', '.en', '.note'].map(text), ['You picked', '红色的花', 'hóngsè de huā', 'A red flower', 'For the big monkey to plant (1/3).']);
  assert.ok(sheet.querySelector('.pic img.pix'), 'its picture');
  assert.equal(get(g, "!!PICTURES['红色 的 花'] && JSON.stringify(PICTURES['红色 的 花']) !== JSON.stringify(PICTURES['花'])"), true, 'a red flower: not the pink one 花 has');
  assert.deepEqual(get(g, '__spoken'), ['红色的花'], 'said straight away, as you’ve found it yourself');
  g.run('pressA()');
  assert.equal(g.run('modal.hidden'), true, 'A closes it');
});

test('bring them to the big monkey: 我要红色的花, and he plants them in front of the school as you watch', async () => {
  const g = game({flowers: 'asked', holding: {flowers: '花'}, picked: {flowers: ['红色', '黄色', '白色']}});
  assert.deepEqual(BEDS.map(([x, y]) => g.run(`tileAt(${x}, ${y}).look`)), ['grass', 'grass', 'grass', 'grass'], 'grass in front of the school till then');
  g.run("globalThis.__gaps = []; gapQ = async q => { __gaps.push(q.t.join('') + ' / ' + q.gap); return true; }");
  await press(g, 15, 5, 'up');
  assert.deepEqual(get(g, '__said'), ['你有花吗？', '谢谢你！']);
  assert.deepEqual(get(g, '__gaps'), ['我要红色的花 / 红色'], 'you give them by filling the gap: I want a red flower');
  assert.deepEqual(get(g, '[here().flowers, here().schoolFlowers, S.shells]'), ['done', true, 3]);
  assert.deepEqual(get(g, '__sprouts'), [4, 4, 4, 4], 'the four squares of the beds come up one after another, as you watch');
  assert.equal(g.run('marking'), null, 'and then it’s done');
  assert.deepEqual(BEDS.map(([x, y]) => g.run(`tileAt(${x}, ${y}).look`)), ['flowerBed', 'flowerBed', 'flowerBed', 'flowerBed'], 'flower beds either side of the path');
  assert.ok(BEDS.every(([x, y]) => !g.run(`tileAt(${x}, ${y}).walk`)), 'you can’t walk on them');
  assert.ok(g.run('tileAt(11, 5).walk'), 'but the path between them, up to the door, is still open');
  assert.match(get(g, '__notes').join(' '), /The big monkey plants your flowers in front of the 学校 \(school\): red, yellow and white/);
  assert.equal(item(g)[1], true, 'the checklist is ticked');
  assert.equal(bubble(g), null);
  g.run('__notes.length = 0');
  await press(g, 10, 6, 'up');
  assert.deepEqual(get(g, '__notes'), ['Red, yellow and white flowers: the ones you picked, planted in front of the 学校 (school).']);
});
