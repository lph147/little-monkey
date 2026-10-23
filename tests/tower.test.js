// Chapter 1, the hillside (decided 23 October 2026, in place of the story carving, which isn't in the book): two little
// monkeys at the foot of the cliff by the stone steps, building a tower of stones between them, as in the book's chapter 1,
// where the troop plays on a hot day (跑沙窝，砌宝塔: they build pagodas). They take turns to put a stone on, as high as it
// will go, till it sways and falls, and start again. Talk to them (or A at the tower): once you know enough numbers, they
// count its stones with you, as in a number lesson; till then, they count as they put them on.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 1, wood: 'asked', stones: 'asked', woodIn: 1, lookTip: 1, trainee1: 1, trainee2: 1};
const knows = (words, ok = 3) => Object.fromEntries(words.map(w => [w, {lv: 1, ok, next: 100}]));
const BASICS = ['石头', '山', '花', '草', '树', '猴子', '你好', '谢谢', '一', '二', '三'];
// A game on the hillside below the tower (area: more progress; words: what you know), with what's said, the messages, your
// replies, the cards asking you to play (played: play) and the counting questions asked (each answered: right) kept for the test
function game({area = {}, words = knows(BASICS), pos = {place: 'hillside', x: 8, y: 33, dir: 'up'}} = {}){
  const g = loadGame({dom: true, save: {version: 29, started: true, w: words, areas: {1: {...CHAPTER_ONE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__replies = []; globalThis.__asks = []; globalThis.__counts = []; globalThis.__play = true; globalThis.__right = true");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run("replyWith = async best => { __replies.push(best); return true; }; confirmBox = async (who, text) => { __asks.push(text); return __play; }");
  g.run("countQ = async ({who, thing, n}) => { __counts.push({who, word: thing.word, on: thing.on, ask: thing.ask, n}); return __right; }");
  g.run('placePlayer()');
  return g;
}
const tower = id => `NPCS.find(n => n.id === '${id}')`;
const bubble = (g, id) => get(g, `((AREA.bubbles.${id} || []).find(b => matches(b.if)) || {}).show || ''`);

test('two little monkeys stand at the foot of the cliff by the stone steps, a tower of stones between them, and you can’t walk through them', () => {
  const g = game();
  assert.deepEqual(get(g, "ALL_NPCS.filter(n => PLAYS[n.id] === 'tower').map(n => [n.id, n.place, n.x, n.y, n.home.facing, PLAYS[n.id]])"),
    [['towerL', 'hillside', 7, 32, 'right', 'tower'], ['towerR', 'hillside', 9, 32, 'left', 'tower']], 'facing each other, across the tower');
  assert.equal(g.run('tileAt(8, 32).look'), 'stoneTower');
  assert.ok([[7, 32], [8, 32], [9, 32]].every(([x, y]) => !g.run(`walkable(${x}, ${y})`)));
  assert.equal(g.run("tileAt(6, 31).look"), 'steps', 'beside the stone steps');
  assert.deepEqual(get(g, "['towerL', 'towerR'].map(id => NAMES[id])"), [{zh: '猴子', py: 'hóuzi', en: 'Monkey'}, {zh: '猴子', py: 'hóuzi', en: 'Monkey'}]);
  assert.equal(g.run('promptFor(8, 32)'), 'Look', 'A at the tower');
});

test('they take turns to put a stone on it, as high as it will go; then it sways, falls and lies there; and they start again', () => {
  const g = game();
  const T = get(g, 'TOWER'), cycle = T.heights.reduce((a, h) => a + h * T.place + T.wobble + T.fall + T.rest, 0);
  const at = t => get(g, `towerAt(${t})`);
  const states = Array.from({length: Math.ceil(cycle / 50)}, (_, i) => at(i * 50));
  assert.deepEqual([...new Set(states.map(s => s.h))], T.heights, 'a different height each time');
  for (const h of T.heights){
    const mine = states.filter(s => s.h === h);
    assert.deepEqual([...new Set(mine.map(s => s.phase))], ['build', 'wobble', 'fall', 'rest'], `the tower of ${h}: built, swaying, falling, then lying there`);
    const built = mine.filter(s => s.phase === 'build');
    assert.ok(built.every((s, i) => i === 0 || s.stones >= built[i - 1].stones), 'stones only go on while it’s built');
    assert.deepEqual([...new Set(built.map(s => s.stones))], [...Array(h).keys()].concat(h).slice(0, h + 1).filter(n => n <= h), `one at a time, up to ${h}`);
    const turns = [...new Set(built.filter(s => s.carried !== null).map(s => `${s.carried}:${s.by}`))];
    assert.deepEqual(turns, [...Array(h).keys()].map(i => `${i}:${i % 2}`), 'taking turns: the one on the left, then the one on the right');
  }
  assert.deepEqual(at(cycle), at(0), 'and so on, again and again');
  for (const t of [0, 1000, 3000, 6000, 9000, 15000]) g.run(`drawTower(0, 0, ${t}); drawPlaying(${tower('towerL')}, -16, 0, ${t}); drawPlaying(${tower('towerR')}, 16, 0, ${t})`);   // (it draws)
});

test('near them, a little clack as each stone goes on, and a clatter as it falls; not from far off', () => {
  const g = game();
  const sounds = () => g.run(`(() => { const heard = []; SFX.clack = () => heard.push('clack'); SFX.clatter = () => heard.push('clatter'); towerWas = null;
    const T = TOWER, h = T.heights[0]; for (let t = 0; t < h * T.place + T.wobble + T.fall + 100; t += 16) playSounds(t); return heard.join(' '); })()`);
  const h = get(g, 'TOWER.heights[0]');
  assert.equal(sounds(), [...Array(h).fill('clack'), 'clatter'].join(' '));
  g.run("S.pos = {place: 'hillside', x: 20, y: 43, dir: 'up'}; placePlayer()");
  assert.equal(sounds(), '', 'far off: nothing');
});

test('the first time, they say hello; knowing just 一, 二 and 三, they count as they put stones on, and you can come back later', async () => {
  const g = game();
  assert.equal(bubble(g, 'towerL'), '', 'no ! yet: there’s nothing you could count with them');
  await g.run(`talk(${tower('towerL')})`);
  assert.deepEqual(get(g, '__said'), ['你好！', '一，二，三！']);
  assert.deepEqual(get(g, '__replies'), ['你好']);
  assert.match(get(g, '__notes[0]'), /building a tower of stones/);
  assert.match(get(g, '__notes[1]'), /Learn more numbers, then come back and count with them!/);
  assert.deepEqual(get(g, '[__asks, __counts]'), [[], []], 'no counting yet');
  assert.equal(g.run('here().tower'), 1);
  g.run('__said.length = 0; __notes.length = 0');
  await g.run(`interact(8, 32)`);   // A at the tower: talking to them
  assert.deepEqual(get(g, '__said'), ['一，二，三！'], 'no hello the second time');
});

test('once you know more numbers, they count the stones in their tower with you: three questions, never two, a 🐚 for each that needed practice', async () => {
  const words = {...knows(BASICS), ...knows(['四', '五']), ...knows(['六'], 0)};   // 六 needs practice
  const g = game({area: {tower: 1}, words});
  assert.equal(bubble(g, 'towerR'), '!', 'a ! once you could count with them');
  const shells = g.run('S.shells');
  await g.run(`talk(${tower('towerR')})`);
  assert.deepEqual(get(g, '__said'), ['我们玩吧！', '太好了！'], 'let’s play, and (all right) great!');
  assert.deepEqual(get(g, '__asks'), ['Count the stones in their tower? Each right answer earns a 🐚 if that number needs practice.']);
  const counts = get(g, '__counts');
  assert.equal(counts.length, 3);
  assert.ok(counts.every(c => c.who === 'towerR' && c.word === '石头' && c.on === 'tower' && c.ask === 'howManyStones'), 'the stones in their tower: 这里有几个石头？');
  assert.equal(new Set(counts.map(c => c.n)).size, 3, 'each a different number');
  assert.ok(counts.every(c => [1, 3, 4, 5, 6].includes(c.n)), 'numbers you know, never two');
  assert.ok(counts.some(c => c.n === 6), 'the one that needs practice first');
  assert.equal(g.run('S.shells'), shells + 1, 'a 🐚 for 六');
  assert.deepEqual(get(g, '__notes'), ['You counted all 3 right. +1 🐚']);
  assert.deepEqual([g.run('here().tower'), bubble(g, 'towerR'), bubble(g, 'towerL')], [2, '', ''], 'counted: the ! goes');
});

test('a miss is practice: no 太好了, and no 🐚 for it; and Not now is no game at all', async () => {
  const words = {...knows(BASICS), ...knows(['四'])};
  const g = game({area: {tower: 2}, words});
  g.run('__right = false');
  await g.run(`talk(${tower('towerL')})`);
  assert.deepEqual(get(g, '__said'), ['我们玩吧！']);
  assert.deepEqual(get(g, '__notes'), ['You counted 0 of 3 right.']);
  g.run('__said.length = 0; __notes.length = 0; __counts.length = 0; __play = false');
  await g.run(`talk(${tower('towerL')})`);
  assert.deepEqual(get(g, '[__counts, __notes]'), [[], []], 'Not now: no questions');
});

test('the one you talk to stops to look at you; the other carries on, putting on every stone till you’ve done', async () => {
  const g = game({area: {tower: 2}});
  g.run('confirmBox = async () => false; globalThis.__during = null; showDialog = async () => { __during = [playing(NPCS.find(n => n.id === "towerL")), playing(NPCS.find(n => n.id === "towerR"))]; }');
  await g.run(`talk(${tower('towerL')})`);
  assert.deepEqual(get(g, '__during'), [false, true]);
  assert.equal(g.run(`${tower('towerL')}.dir`), 'down', 'it turns to you');
  assert.ok(g.run(`playing(${tower('towerL')})`), 'and goes back to the tower after');
});
