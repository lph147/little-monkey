// The prologue: word games with the little monkey and the hungry monkey in the meadow (decided 26 October 2026, after
// measuring the game's pacing: the meadow taught 22 words with just two questions between them). Once the little monkey
// has taught you 朋友, and once you've told the hungry monkey 没关系, each wants to play a word game straight away, with a
// present the first time you win: 2 shells, or a peach for your bag. Say Not now, and it has a ! till you've played, in
// the meadow; lose, and you can talk to it to play again for its present.
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
  const g = loadGame({dom: true, save: {version: 29, started: true, w: known(extra), met: [], areas: {1: {elder: 2, ...area}}, pos: {place: 'meadow', x: 15, y: 19, dir: 'down'}}});
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
const PRESENT = 'Play a word game with this little monkey? If you win, it gives you 2 🐚.';

test('once the little monkey has taught you 朋友, it wants to play a word game straight away; win, and it gives you 2 shells, the once', async () => {
  const g = game();
  assert.equal(bubble(g, 'playful'), '!');
  await talk(g, 'playful');
  assert.ok(get(g, "lvl('朋友') >= 1"), 'it teaches 朋友');
  assert.deepEqual(get(g, '__said'), ['我们是朋友！', '我们玩吧！', '太好了！'], 'we’re friends! let’s play! (and, as you win) great!');
  assert.deepEqual(get(g, '__asks'), [PRESENT], 'Play, or Not now');
  assert.deepEqual([get(g, 'here().littleGame'), get(g, 'S.shells')], [2, 2], 'its present: 2 shells');
  assert.ok(get(g, '__notes').includes('The little monkey gives you 2 🐚.'));
  assert.equal(bubble(g, 'playful'), '', 'no ! now');
  g.run('__said.length = 0; __asks.length = 0');
  await talk(g, 'playful');
  assert.deepEqual(get(g, '__asks'), ['Play a word game with this little monkey?'], 'after that, its word games as before, with no present');
  assert.deepEqual([get(g, 'here().littleGame'), get(g, 'S.shells')], [2, 2], 'the present is only the once');
});

test('say Not now, and the little monkey has a ! till you’ve played, in the meadow; lose, and you can play again for its present', async () => {
  const g = game();
  g.run('__play = false');
  await talk(g, 'playful');
  assert.equal(get(g, 'here().littleGame'), 0, 'not played');
  assert.equal(bubble(g, 'playful'), '!', 'so it has a !');
  g.run('__play = true; __win = false; __asks.length = 0');
  await talk(g, 'playful');
  assert.deepEqual(get(g, '__asks'), [PRESENT], 'it asks again');
  assert.deepEqual([get(g, 'here().littleGame'), get(g, 'S.shells')], [1, 0], 'lost: played, but no present');
  assert.equal(bubble(g, 'playful'), '', 'played once: its ! has gone');
  g.run('__win = true');
  await talk(g, 'playful');
  assert.deepEqual([get(g, 'here().littleGame'), get(g, 'S.shells')], [2, 2], 'won at last: its present');
  const later = game({gate: true}, ['朋友']);   // (never played, and the rocks have rolled away)
  assert.equal(bubble(later, 'playful'), '', 'after the meadow, no !');
  await talk(later, 'playful');
  assert.deepEqual(get(later, '__asks'), [PRESENT], 'but its present is still there to play for');
});

test('once you’ve told the hungry monkey 没关系, he wants to play a word game; win, and you get a peach for your bag, the once', async () => {
  const g = game({hungry: 'done'}, ['朋友', '桃子', '苹果', '水果', '吃']);
  assert.equal(bubble(g, 'hungry'), '!', 'he wants to say sorry for being fussy');
  await talk(g, 'hungry');
  assert.deepEqual(get(g, '__replies'), ['没关系'], 'you say that’s OK');
  assert.deepEqual(get(g, '__said'), ['对不起！', '我们玩吧！', '太好了！']);
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
  assert.deepEqual(get(g, '__said'), ['我们玩吧！'], 'no sorry again: straight to the game');
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
