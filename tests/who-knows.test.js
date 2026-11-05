// Who knows where the immortals are? (decided 5 November 2026, after playing it: the human world's purpose, from the start.)
// You help people, and ask them, 神仙在哪里？ (the first teaches 哪里, the next 知道): each says 我不知道。, and is your friend
// from then on (the Friends page, under People). Your Tasks page shows the list, a face each, ticked once asked; the last,
// the boatman, knows: 神仙在海的那边。 The road east waits for the village's three, the years for the town's three.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const WORDS = ['猴子', '人', '衣服', '帽子', '不', '是', '什么', '井', '房子', '门', '谁', '鸡', '鱼', '鱼竿', '饭', '钱', '看', '买', '包子', '鞋', '茶', '说', '谢谢', '你好', '不客气'];
const DRESSED = {landed: 1, dressed: 2, back: 1, oldFisher: 1};
function game(area, pos = {place: 'village', x: 16, y: 13, dir: 'up'}, more = {}){
  const w = Object.fromEntries([...WORDS, ...(more.words || [])].map(x => [x, {lv: 2, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, w, friends: ['goose'], met: ['goose'], areas: {1: {raft: 3}, 2: {...DRESSED, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async w => { __notes.push('card: ' + w); setSeen(w); }; practiseFirst = async () => true");
  g.run("showDialog = async (who, line) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }; replyWith = async best => { __said.push('player: ' + best); return true; }");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }; storyScene = async () => {}; matchWords = async () => new Set()");
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 400 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };

test('the first you ask teaches 哪里, the next 知道; none knows, but each is your friend now, on the Friends page under People', async () => {
  const g = game({child: 3, fish: 'done'});
  await press(g, 17, 12, 'left');
  assert.deepEqual(said(g), ['player: 神仙在哪里？', 'child: 我不知道。']);
  assert.ok(notes(g).includes('card: 哪里'));
  g.run('S.turn = (S.turn || 0) + 10');
  await press(g, 12, 4, 'left');
  assert.deepEqual(said(g), ['player: 神仙在哪里？', 'fisherman: 我不知道。']);
  assert.ok(notes(g).includes('card: 知道'), '知道, the second time');
  assert.deepEqual(get(g, "['child', 'fisherman'].map(id => S.friends.includes(id))"), [true, true]);
  g.run('friendsPage(() => {})');
  const labels = g.el('#sheet').querySelectorAll('.fsub').map(e => e.textContent);
  assert.ok(labels.includes('People'), 'a section of their own');
  assert.equal(g.el('#sheet').querySelectorAll('.friends').at(-1).querySelectorAll('button').length, 2);
});

test('the Tasks page: who knows? A face each, ticked once asked, and a ? for the one who knows; tap a face to see who', () => {
  const g = game({child: 3, askChild: 1, fish: 'done', askFisher: 1});
  g.run('tasksPage(() => {})');
  const sheet = g.el('#sheet'), list = sheet.querySelector('.whoknows');
  assert.match(list.textContent.replace(/\s+/g, ' '), /Who knows\? 2 of 8 asked/);
  assert.equal(list.querySelectorAll('.face').length, 9, 'eight to ask, and the one who knows');
  assert.equal(list.querySelectorAll('.face.asked').length, 2);
  assert.ok(list.querySelector('.face.who'), 'a ? till they’ve told you');
  list.querySelectorAll('.face')[3].click();
  assert.match(list.querySelector('.whoinfo').textContent, /农民 nóngmín · Farmer · The fields · Not asked yet: help them first/);
  const later = game({chapter: 1, song: 1, boat: 2, toldSea: 1}, {place: 'farShore', x: 16, y: 19, dir: 'up'});
  later.run('tasksPage(() => {})');
  assert.equal(later.el('#sheet').querySelector('.whoknows'), null, 'not once the prologue is over');
});

test('the road east waits for the village’s three; the years in the town for the town’s three', async () => {
  const g = game({child: 3, askChild: 1, fish: 'done', askFisher: 1, hensDone: 1, hen1: 1, hen2: 1, hen3: 1, hen4: 1});
  assert.equal(g.run('isOpen(PLACES.village.exits[2])'), false);
  await press(g, 29, 7, 'up');
  assert.ok(notes(g).some(n => /Nobody in the village knows/.test(n)));
  assert.equal(g.run('isOpen(PLACES.village.exits[2])'), true, 'the road east is open');
  const t = game({child: 3, askChild: 1, askFisher: 1, askVillager: 1, askFarmer: 1, lunch: 'done', exchanged: 1, askGranny: 1, askTea: 1}, {place: 'town', x: 7, y: 7, dir: 'up'});
  t.run('S.turn = (S.turn || 0) + 10');
  await play(t, 'runEvents()');
  assert.equal(get(t, 'here().years'), 0, 'not yet');
  await press(t, 7, 6, 'up');
  t.run('S.turn = (S.turn || 0) + 10');
  await play(t, 'runEvents()');
  assert.equal(get(t, 'here().years'), 1, 'nobody in the town knows: the years go by');
});

test('the boatman knows, once you’ve asked everyone else: across the sea', async () => {
  const seven = {years: 1, askChild: 1, askFisher: 1, askVillager: 1, askFarmer: 1, askGranny: 1, askTea: 1, askTeller: 1};
  const g = game(seven, {place: 'harbour', x: 16, y: 16, dir: 'right'}, {words: ['风']});
  await press(g, 16, 16, 'right');
  assert.deepEqual(said(g), ['boatman: 你好！', 'player: 你好']);
  assert.ok(notes(g).some(n => /ask everyone else on your list \(7 of 8/.test(n)));
  g.run('Object.assign(here(), {cargo: 2, askDocker: 1})');
  await press(g, 16, 16, 'right');
  assert.deepEqual(said(g), ['player: 神仙在哪里？', 'boatman: 神仙在海的那边。']);
  assert.equal(get(g, 'here().toldSea'), 1);
});

test('a game from before this: past the boatman’s news, he’s told you; and once you’ve been to the fields, the road east stays open', async () => {
  const g = game({years: 1, boat: 1}, {place: 'harbour', x: 16, y: 16, dir: 'right'});
  await play(g, 'runEvents()');
  assert.equal(get(g, 'here().toldSea'), 1);
  const v = game({child: 3, farmer: 1});
  assert.equal(v.run('isOpen(PLACES.village.exits[2])'), true, 'not shut behind you');
});

test('after the years, the teacher (grey now) still teaches the town’s words you missed, and the task stays till you know all ten', async () => {
  const g = game({child: 3, askChild: 1, fish: 'done', askFisher: 1, askVillager: 1, askFarmer: 1, lunch: 'done', exchanged: 1, years: 1}, {place: 'town', x: 13, y: 5, dir: 'up'}, {words: ['买', '说']});
  assert.equal(get(g, 'ALL_NPCS.find(n => n.id === "teacher").place'), 'hut', 'the young teacher has gone');
  assert.ok(get(g, 'getTasks().map(t => t.id)').includes('a2townWords'), 'the town’s words, still on your list');
  assert.equal(get(g, '(AREA.bubbles.teacherOld.find(b => matches(b.if)) || {}).show'), '!', 'a ! over him');
  g.run('S.turn = (S.turn || 0) + 10');
  await press(g, 13, 5, 'up');
  assert.deepEqual(said(g), ['teacherOld: 你听！']);
  assert.equal(get(g, 'lvl("听") >= 1'), true, '听, from the teacher years on');
});

test('the sun and moon go round faster at first, then never faster than a day every two and a half seconds', () => {
  const g = game({});
  const speed = t => g.run(`laterTurn(${t + 0.01}) - laterTurn(${t})`) / 0.01;
  assert.ok(speed(1) > speed(0) && speed(2) > speed(1), 'faster and faster at first');
  for (const t of [3, 10, 60, 600]) assert.ok(Math.abs(speed(t) - 2.4) < 0.01, `steady at ${t}s`);
});
