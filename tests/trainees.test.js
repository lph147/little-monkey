// Chapter 1: two little monkeys in training on the hillside (decided 23 October 2026), practising with sticks like yours:
// one by the stepping stones, one on the middle terrace. Each swings its stick now and then, with a soft swish as you come
// near; stops you as you pass, the first time, for a word game, like a trainer in Pokémon; and gives you a present each
// time you win: 3 shells, or a peach for your bag. After that, a ! shows over them when some of your words need practice.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 1, wood: 'asked', stones: 'asked', woodIn: 1, lookTip: 1};   // (on the way up the hillside to the pine wood)
const WORDS = ['石头', '山', '花', '草', '树', '河', '水', '猴子', '桃子', '你好', '谢谢', '一', '二', '三'];
const known = soon => Object.fromEntries(WORDS.map(w => [w, soon && w === '花' ? {lv: 1, ok: 0, next: 0} : {lv: 1, ok: 3, next: 100}]));   // soon: 花 needs practice
// A game on the hillside (area: more progress; pos: where you are; soon: a word needs practice), with what's said, the
// messages, your replies, the word games offered (each played: play) and their result (win) kept for the test.
function game(area = {}, pos = {place: 'hillside', x: 19, y: 38, dir: 'up'}, soon = false){
  const g = loadGame({dom: true, save: {version: 29, started: true, w: known(soon), met: ['rabbit', 'sheep', 'squirrel', 'goat'], areas: {1: {...CHAPTER_ONE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__replies = []; globalThis.__asks = []; globalThis.__play = true; globalThis.__win = true");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run("replyWith = async best => { __replies.push(best); return true; }; confirmBox = async (who, text) => { __asks.push(text); return __play; }; encounter = async () => __win");
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run (such as the ! as it stops you)
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 200 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
const face = (g, x, y, dir) => g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`);
const bubble = (g, id) => get(g, `((AREA.bubbles.${id} || []).find(b => matches(b.if)) || {}).show || ''`);

test('two little monkeys in training stand on the hillside, by the stepping stones and on the middle terrace, each holding a stick', () => {
  const g = game();
  assert.deepEqual(get(g, "ALL_NPCS.filter(n => PRACTISES.has(n.id)).map(n => [n.id, n.place, n.x, n.y])"), [['trainee1', 'hillside', 20, 37], ['trainee2', 'hillside', 9, 20]]);
  assert.deepEqual(get(g, "['trainee1', 'trainee2'].map(id => NAMES[id])"), [{zh: '猴子', py: 'hóuzi', en: 'Monkey'}, {zh: '猴子', py: 'hóuzi', en: 'Monkey'}], 'named as the troop are');
  const rows = (kind, dir) => get(g, `monkeyRows('${kind}', '${dir}', false).join('')`);
  assert.ok(rows('trainee1', 'left').includes('l') && rows('trainee2', 'right').includes('l'), 'a stick in its hand');
  assert.ok(!rows('troop1', 'down').includes('l') && !rows('elder', 'down').includes('l'), 'the rest of the troop hold nothing');
  assert.ok(!get(g, "walkable(20, 37)") && !get(g, "walkable(9, 20)"), 'you can’t walk through them');
});

test('each practises, facing its own way and swinging its stick now and then, with a swish as you come near; beside it, it turns to you', () => {
  const g = game({trainee1: 1}, {place: 'hillside', x: 16, y: 38, dir: 'up'});
  assert.ok(g.run("practising(NPCS.find(n => n.id === 'trainee1'))"), 'a few squares away, it practises');
  const share = g.run("(n => { let k = 0; for (let t = 0; t < PRACTICE_MS * 4; t += 10) if (swingStart(n, 100000 + t) !== null) k++; return k / (PRACTICE_MS * 4 / 10); })(NPCS.find(n => n.id === 'trainee1'))");
  assert.ok(Math.abs(share - get(g, 'SWING_MS / PRACTICE_MS')) < .02, `a swing now and then (${share} of the time)`);
  const swishes = (x, y) => { face(g, x, y, 'up'); return g.run(`(() => { let k = 0; SFX.swish = () => { k++; }; for (let t = 0; t < PRACTICE_MS * 3; t += 16) practiceSounds(200000 + t); return k; })()`); };
  assert.ok(swishes(17, 38) >= 2, 'a swish with each swing, as you come near');
  assert.equal(swishes(12, 43), 0, 'not from far off');
  face(g, 19, 37, 'right');
  assert.ok(!g.run("practising(NPCS.find(n => n.id === 'trainee1'))"), 'beside you, it stops to talk');
});

test('the first time you pass one, it stops you: hello, then a word game; win, and it gives you 3 shells, and you say thank you', async () => {
  const g = game({}, {place: 'hillside', x: 19, y: 38, dir: 'up'});
  assert.equal(bubble(g, 'trainee1'), '!', 'a ! over it');
  const shells = g.run('S.shells');
  face(g, 19, 37, 'up');
  await play(g, 'arrive(19, 37).then(runEvents)');
  assert.equal(g.run('pl.dir'), 'right', 'you turn to face it');
  assert.deepEqual(get(g, '__said'), ['你好！', '我们玩吧！', '太好了！'], 'hello, let’s play, and (once you’ve won) great!');
  assert.deepEqual(get(g, '__replies'), ['你好', '谢谢'], 'you say hello back, and thank you for the present');
  assert.match(get(g, '__notes').join(' '), /practising with a stick, just like yours/);
  assert.deepEqual(get(g, '__asks'), ['Play a word game with the monkey? If you win, it gives you 3 🐚.']);
  assert.ok(get(g, '__notes').includes('The monkey gives you 3 🐚.'));
  assert.equal(g.run('S.shells'), shells + 3);
  assert.deepEqual([g.run('here().trainee1'), bubble(g, 'trainee1')], [1, ''], 'its ! goes (none of your words needs practice)');
  g.run('__said.length = 0');
  face(g, 19, 38, 'up'); face(g, 19, 37, 'up');
  await play(g, 'arrive(19, 37).then(runEvents)');
  assert.deepEqual(get(g, '__said'), [], 'it only stops you once');
});

test('the one on the middle terrace gives you a peach for your bag', async () => {
  const g = game({trainee1: 1}, {place: 'hillside', x: 8, y: 19, dir: 'right'});
  face(g, 9, 19, 'right');
  await play(g, 'arrive(9, 19).then(runEvents)');
  assert.equal(g.run('pl.dir'), 'down', 'you turn to face it');
  assert.deepEqual(get(g, '__asks'), ['Play a word game with the monkey? If you win, it gives you a 桃子 (peach).']);
  assert.ok(get(g, '__notes').includes('The monkey gives you a 桃子 (peach) for your bag.'));
  assert.equal(g.run("S.bag['桃子']"), 1);
  assert.deepEqual(get(g, '__replies'), ['你好', '谢谢']);
  assert.equal(g.run('here().trainee2'), 1);
});

test('after that, talk to it to play again: a present each time you win, none if you lose, and no game at all if you say Not now', async () => {
  const g = game({trainee1: 1}, {place: 'hillside', x: 19, y: 37, dir: 'right'});
  const shells = g.run('S.shells'), talk = () => play(g, 'interact(20, 37)');
  await talk();
  assert.deepEqual(get(g, '__said'), ['我们玩吧！', '太好了！'], 'no hello this time: straight to the game');
  assert.equal(g.run('S.shells'), shells + 3);
  g.run('__win = false; __said.length = 0'); await talk();
  assert.deepEqual([get(g, '__said'), g.run('S.shells')], [['我们玩吧！'], shells + 3], 'lost: no present');
  g.run('__play = false; __win = true; __said.length = 0'); await talk();
  assert.equal(g.run('S.shells'), shells + 3, 'Not now: no game');
});

test('once they’ve stopped you, a ! shows over them whenever some of your words need practice', () => {
  assert.equal(bubble(game({trainee1: 1, trainee2: 1}), 'trainee2'), '');
  assert.equal(bubble(game({trainee1: 1, trainee2: 1}, undefined, true), 'trainee2'), '!');
});
