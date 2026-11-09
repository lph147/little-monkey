// The prologue: games with the little monkey and the hungry monkey in the meadow (decided 26 October 2026, after
// measuring the game's pacing: the meadow taught 22 words with just two questions between them). Once the little monkey
// has taught you 朋友, it wants to play I spy straight away, out in the meadow (since 8 November 2026, the gentler
// prologue: it was a word game on cards), and once the hungry monkey has eaten, he wants to play a word game, each with a
// present the first time: 2 shells, or a peach for your bag. Say Not now, and he has a ! till you've played, in the
// meadow; lose, and you can talk to him to play again for its present.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const WORDS = ['石头', '你好', '山', '花', '草', '树', '动物', '猴子'];
const known = extra => Object.fromEntries([...WORDS, ...extra].map(w => [w, {lv: 1, ok: 3, next: 100}]));
// A game in the meadow, the old monkey having sent you off to explore (area: more progress; extra: more words you know),
// with what's said, the messages, your replies, the word games offered (each played: play) and their result (win) kept
// for the test.
function game(area = {}, extra = []){
  const g = loadGame({dom: true, save: {version: 29, started: true, w: known(extra), met: [], areas: {1: {elder: 2, meadowCheck: 1, ...area}}, pos: {place: 'meadow', x: 15, y: 19, dir: 'down'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__replies = []; globalThis.__asks = []; globalThis.__play = true; globalThis.__win = true");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run("showNotice = async w => { rec(w).lv = Math.max(rec(w).lv || 0, 1); }; replyWith = async best => { __replies.push(best); rec(best).lv = Math.max(rec(best).lv || 0, 1); return true; }");
  g.run("confirmBox = async (who, text) => { __asks.push(text); return __play; }; encounter = async () => __win");
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 200 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
const talk = (g, id) => play(g, `talk(ALL_NPCS.find(n => n.id === '${id}'))`);
const bubble = (g, id) => get(g, `((AREA.bubbles.${id} || []).find(b => matches(b.if)) || {}).show || ''`);

const spot = (g, w) => get(g, `(() => { for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (tileAt(x, y).word === '${w}' && !npcAt(x, y) && !animalAt(x, y)) return [x, y]; })()`);
const wanted = g => get(g, 'here().spying.list[here().spying.i]');

test('once the little monkey has taught you 朋友, it wants to play I spy straight away, out in the meadow (the gentler prologue, 8 November 2026); find them all, and it gives you 2 shells, the once', async () => {
  const g = game();
  assert.equal(bubble(g, 'playful'), '!');
  await talk(g, 'playful');
  assert.ok(get(g, "lvl('朋友') >= 1") && get(g, "S.friends.includes('playful')"), 'it teaches 朋友, and it’s your friend');
  const said = get(g, '__said');
  assert.deepEqual(said.slice(0, 3), ['我是猴子。你也是猴子！', '我们是朋友！', '我们玩吧！'], 'I’m a monkey, you’re a monkey too! we’re friends! let’s play!');
  assert.match(said[3], /^我看见.+！$/, 'then what it can see, only in Chinese: 我看见…！');
  const sp = get(g, 'here().spying');
  assert.equal(sp.list.length, 4, 'four things');
  assert.ok(sp.list.every(w => ['树', '花', '石头', '山', '草'].includes(w)), 'each something you know, here in the meadow (not 河: you don’t know it yet)');
  const other = sp.words.find(w => w !== wanted(g) && sp.list.includes(w));
  g.run('__said.length = 0');
  await play(g, `spyFind(${spot(g, other)})`);
  assert.ok(get(g, '__notes').includes('Not that one. Listen again!'), 'something else with a word: not that one');
  assert.equal(get(g, '__said').length, 1, 'and it says again what it sees');
  for (let i = 0; i < 4; i++) await play(g, `spyFind(${spot(g, wanted(g))})`);
  assert.equal(get(g, 'here().spying || null'), null, 'all found');
  assert.deepEqual([get(g, 'here().littleGame'), get(g, 'S.shells')], [1, 2], 'its present: 2 shells');
  assert.ok(get(g, '__notes').includes('The little monkey gives you 2 🐚.'));
  assert.equal(bubble(g, 'playful'), '', 'no ! now');
  assert.deepEqual(get(g, '__asks'), [], 'the first game, straight away, as part of the story');
  g.run('__play = false');
  await talk(g, 'playful');
  assert.deepEqual(get(g, '__asks'), ['Play I spy with the little monkey?'], 'talk to it again, and it asks first (9 November 2026, after playing it: it started a game every time)');
  assert.equal(get(g, 'here().spying || null'), null, 'Not now: no game');
  g.run('__play = true');
  await talk(g, 'playful');
  assert.ok(get(g, '!!here().spying'), 'Play: it plays again');
  for (let i = 0; i < 4 && get(g, '!!here().spying'); i++) await play(g, `spyFind(${spot(g, wanted(g))})`);
  assert.deepEqual([get(g, 'here().littleGame'), get(g, 'S.shells')], [2, 2], 'the present is only the once');
});

test('in the middle of a game, talking to the little monkey asks whether to keep playing; Stop ends it, and A at things in the meadow is as ever', async () => {
  const g = game();
  await talk(g, 'playful');
  await play(g, `spyFind(${spot(g, wanted(g))})`);
  g.run('__play = false; __notes.length = 0');
  await talk(g, 'playful');
  assert.deepEqual(get(g, '__asks'), ['You’re in the middle of a game of I spy with the little monkey. Keep playing?']);
  assert.equal(get(g, 'here().spying || null'), null, 'Stop: the game is over');
  assert.ok(get(g, '__notes').includes('You stop playing I spy. Talk to the little monkey to play again.'));
  await play(g, `interact(${spot(g, '花')})`);
  assert.ok(!get(g, '__notes').includes('Not that one. Listen again!'), 'A at a flower is just a flower again');
  assert.equal(bubble(g, 'playful'), '!', 'its ! stays till you’ve played its game, the once');
  g.run('__play = true');
  await talk(g, 'playful');
  assert.equal(get(g, '__asks')[1], 'Play I spy with the little monkey?', 'and it asks to play again');
  assert.equal(get(g, 'here().spying.i'), 0, 'a new game');
});

test('walk off halfway, and the little monkey says what it sees again; its ! stays till you’ve found them all, in the meadow', async () => {
  const g = game();
  await talk(g, 'playful');
  await play(g, `spyFind(${spot(g, wanted(g))})`);
  const next = wanted(g);
  assert.equal(get(g, 'here().spying.i'), 1, 'one found');
  assert.equal(bubble(g, 'playful'), '!', 'it still has a !');
  g.run('__said.length = 0');
  await talk(g, 'playful');
  assert.equal(get(g, '__said').length, 2, 'let’s play!, and what it sees');
  assert.deepEqual([get(g, 'here().spying.i'), wanted(g)], [1, next], 'the same game, where you were');
  const later = game({gate: true}, ['朋友']);   // (never played, and the rocks have rolled away)
  assert.equal(bubble(later, 'playful'), '', 'after the meadow, no !');
  await talk(later, 'playful');
  assert.ok(get(later, '!!here().spying'), 'but you can still play, for its present');
});

test('once the hungry monkey has eaten, he wants to play a word game (no sorry: 对不起 and 没关系 come in chapter 1); win, and you get a peach for your bag, the once', async () => {
  const g = game({hungry: 'done'}, ['朋友', '桃子', '苹果', '水果', '吃']);
  assert.equal(bubble(g, 'hungry'), '!', 'he wants to play');
  await talk(g, 'hungry');
  assert.deepEqual(get(g, '__replies'), [], 'nothing to reply to');
  assert.deepEqual(get(g, '__said'), ['我们玩吧！', '太好了！']);
  assert.deepEqual(get(g, '__asks'), ['Play a word game with the hungry monkey? If you win, you get a 桃子 (peach) for your bag.']);
  assert.deepEqual([get(g, 'here().hungryGame'), get(g, "S.bag['桃子'] || 0")], [2, 1], 'its present: a peach');
  assert.ok(get(g, '__notes').includes('The hungry monkey gives you a 桃子 (peach) for your bag.'));
  assert.equal(bubble(g, 'hungry'), '', 'no ! now');
  g.run('__asks.length = 0');
  await talk(g, 'hungry');
  assert.deepEqual(get(g, '__asks'), [], 'after that, he just thanks you again');
  assert.equal(get(g, "S.bag['桃子']"), 1, 'the present is only the once');
});

test('say Not now, and the hungry monkey has a ! till you’ve played, in the meadow; lose, and play again; in chapter 1, the feast’s story comes first', async () => {
  const g = game({hungry: 'done'}, ['朋友', '桃子', '苹果', '水果', '吃']);
  g.run('__play = false');
  await talk(g, 'hungry');
  assert.equal(get(g, 'here().hungryGame'), 0, 'not played');
  assert.equal(bubble(g, 'hungry'), '!', 'so he has a !');
  g.run('__play = true; __win = false; __asks.length = 0; __said.length = 0');
  await talk(g, 'hungry');
  assert.deepEqual(get(g, '__said'), ['我们玩吧！'], 'straight to the game');
  assert.equal(get(g, '__asks').length, 1);
  assert.deepEqual([get(g, 'here().hungryGame'), get(g, "S.bag['桃子'] || 0")], [1, 0], 'lost: played, but no present');
  assert.equal(bubble(g, 'hungry'), '', 'played once: his ! has gone');
  g.run('__win = true');
  await talk(g, 'hungry');
  assert.deepEqual([get(g, 'here().hungryGame'), get(g, "S.bag['桃子']")], [2, 1], 'won at last: its present');
  const feast = game({hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, chapter: 1, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 2},
    ['朋友', '桃子', '苹果', '水果', '吃', '没关系', '有', '桌子']);   // (by the feast's big table, never having played)
  await talk(feast, 'hungry');
  assert.ok(get(feast, '__said').includes('我们没有蜂蜜！') && !get(feast, '__asks').length, 'he tells you what the feast needs, not a word game');
});
