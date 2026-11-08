// The gentler prologue (decided 8 November 2026, from its plan, beat by beat): no more than two or three new words before
// you do something with them. Here the pieces that are new to it: showing the old monkey round the Water Curtain Cave, a
// question on each thing before the next; the hungry monkey taking any fruit, then wanting the other one once you've
// helped the thirsty monkey (teaching 要); the big monkey's practice fight; and 路 from the rabbit after your first snake.
// (The whole prologue, played through: tests/playthrough.test.js.)
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const known = ws => Object.fromEntries(ws.map(w => [w, {lv: 1, ok: 3, next: 100}]));
const BASICS = ['石头', '你好', '山', '树', '花', '草', '河', '鱼', '鸟', '动物', '猴子', '朋友', '羊', '松鼠', '兔子'];
function game(area, pos, words = BASICS){
  const g = loadGame({dom: true, save: {version: 38, started: true, scroll: {has: true, sealed: []}, w: known(words), met: ['sheep', 'squirrel', 'rabbit'], areas: {1: area}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__cards = []; globalThis.__asked = []; toast = () => {}; showNarration = async () => {}; infoBox = async () => {}");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNotice = async w => { __cards.push(w); setSeen(w); }");
  g.run("gapQ = async () => true; replyWith = async best => { if (lvl(best) === 0) setSeen(best); return true; }; catchQ = async w => { __asked.push(w); return true; }");
  g.run('placePlayer()');
  return g;
}
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); } await p; }
const bubble = (g, id) => get(g, `((AREA.bubbles.${id} || []).find(b => matches(b.if)) || {}).show || ''`);

test('showing the old monkey round the cave: at each thing he asks what it is, its card, then a question on it before the next; one you know already, he skips', async () => {
  const g = game({chapter: 0, elder: 2, meadowCheck: 1, hungry: 'done', hungry2: 'done', thirsty: 'done', gate: true, climb: 4, story: true, cave: 4}, {place: 'cave', x: 6, y: 10, dir: 'up'}, [...BASICS, '洞', '跳', '床']);
  const tour = get(g, 'AREA.talk.elder.flatMap(p => p.do).find(s => s.tour)');
  assert.deepEqual(tour.tour.map(t => t.word), ['床', '桌子', '碗'], 'the beds, the table and the bowls, one at a time (the cave keeps them: truer to the story)');
  await play(g, `STEPS.tour(${JSON.stringify(tour)}, 'elder')`);
  assert.deepEqual(get(g, '__said'), ['这是什么？', '这是什么？'], 'what’s this?, at each thing you don’t know yet');
  assert.deepEqual(get(g, '__cards'), ['桌子', '碗'], 'its card');
  assert.deepEqual(get(g, '__asked'), ['桌子', '碗'], 'and a question on it, before the next');
  assert.equal(get(g, "AREA.talk.elder.find(p => matches(p.if)).do.some(s => s.say === 'home')"), true, 'then he’s ready to call it home');
});

test('the hungry monkey takes any fruit the first time; once you’ve helped the thirsty monkey too, he wants the other one, teaching 要', async () => {
  const words = [...BASICS, '水果', '桃子', '苹果', '吃', '喝', '水', '不客气'];
  const g = game({elder: 2, meadowCheck: 1, hungry: 'asked', thirsty: 'asked', holding: {hungry: '苹果'}}, {place: 'meadow', x: 13, y: 7, dir: 'up'}, words);
  await play(g, "talk(NPCS.find(n => n.id === 'hungry'))");
  assert.deepEqual([get(g, 'here().hungry'), get(g, 'here().wanted.hungry')], ['done', '苹果'], 'the apple will do: he eats it');
  assert.ok(get(g, '__said').includes('苹果！太好了！'));
  g.run('here().hungryGame = 2');   // (his word game played)
  assert.equal(bubble(g, 'hungry'), '', 'no second wish till you’ve helped the thirsty monkey');
  g.run("here().thirsty = 'done'");
  assert.equal(bubble(g, 'hungry'), '!', 'then a ! again');
  g.run('__said.length = 0; __cards.length = 0');
  await play(g, "talk(NPCS.find(n => n.id === 'hungry'))");
  assert.deepEqual(get(g, '__said'), ['我要吃桃子！'], 'I want to eat a peach!: the one you didn’t bring');
  assert.deepEqual(get(g, '__cards'), ['要'], 'teaching 要');
  assert.deepEqual([get(g, 'here().hungry2'), get(g, 'here().wanted.hungry2')], ['asked', '桃子']);
  assert.equal(get(g, 'canGather(LEGEND.P.gather) && !canGather(LEGEND.Q.gather) === false'), true, 'a fruit tree picks for his second wish');
  assert.equal(get(g, 'gatherFor(LEGEND.P.gather)'), 'hungry2');
});

test('the big monkey’s practice fight: his own picture on the mound, and he never hurts you', () => {
  const g = game({elder: 2, gate: true, climb: 1}, {place: 'meadow', x: 15, y: 2, dir: 'up'});
  const f = get(g, 'ENEMIES.bigSpar');
  assert.deepEqual([f.monkey, f.hits, f.name.zh], ['big', 0, '大猴子']);
  assert.equal(get(g, 'foePic(ENEMIES.bigSpar).rows.length'), 16, 'drawn as the big monkey looks on the map');
  assert.ok(get(g, "AREA.talk.big.find(p => p.if && p.if.new === '棍子').do.some(s => s.battle === 'bigSpar' && s.boss)"), 'as he gives you your stick, no running away');
});

test('the rabbit by the mountain path’s long grass: once you’ve met a snake, a ! and 路上有蛇！, teaching 路', async () => {
  const before = game({elder: 2, gate: true, climb: 1}, {place: 'path', x: 15, y: 15, dir: 'left'}, [...BASICS, '棍子']);
  assert.equal(bubble(before, 'rabbit'), '', 'no snake met yet: nothing to warn you about');
  const g = game({elder: 2, gate: true, climb: 1}, {place: 'path', x: 15, y: 15, dir: 'left'}, [...BASICS, '棍子', '蛇']);
  assert.equal(get(g, 'tileAt(15, 15).look === "path" && lvl("路")'), 0, 'walking on the path teaches nothing');
  assert.equal(bubble(g, 'rabbit'), '!');
  await play(g, "talk(NPCS.find(n => n.id === 'rabbit'))");
  assert.deepEqual([get(g, '__said'), get(g, '__cards')], [['路上有蛇！'], ['路']]);
  assert.equal(bubble(g, 'rabbit'), '', 'then no !');
});
