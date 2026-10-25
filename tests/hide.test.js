// Chapter 1: hide and seek with a little monkey at the home ground (the area's hideSeek, js/hide.js). It asks you to play
// once the feast is announced; you count to ten with your eyes covered, and it calls out where it's hiding, such as
// 我在桌子下面！, its English every time with the place's word in Chinese (I'm under the 桌子!), so finding it tests that
// word, never 下面 or 里 (decided 25 October 2026). It only hides where you know the word, somewhere new each time. A at
// the wrong place, and it calls out again; after two wrong guesses its tail pokes out. Found, it jumps out, with shells the
// first time.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const AT_HOME = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2, feast: 3};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '动物', '水', '猴子', '朋友', '河', '鱼', '木头', '桌子', '碗', '家', '学校', '桥',
  '一', '二', '三', '四', '五', '六', '谢谢', '不客气', '没关系', '我', '要', '有', '没有'];
const BY_HIDER = {place: 'homeGround', x: 13, y: 9, dir: 'up'};
const LOOK = {tree: [19, 4, 'left'], table: [17, 8, 'up'], bridge: [16, 17, 'down'], water: [17, 15, 'right'], flowers: [25, 2, 'right']};   // where you stand to look at each place
// A game at the home ground (area: more progress), knowing these words; Play or Not now answered with play.
function game(area = {}, words = KNOWN, play = true){
  const w = Object.fromEntries(words.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 30, started: true, w, shells: 0, areas: {1: {...AT_HOME, ...area}}, pos: BY_HIDER}});
  g.run(`mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; confirmBox = async () => ${play}`);
  g.run("showDialog = async (who, line, opts = {}) => { __said.push(line.t.join('') + (opts.clue ? ' [clue ' + opts.clue + ']' : '')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run('placePlayer(); placeCharacters()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
const face = (g, x, y, dir) => g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`);
const press = (g, x, y, dir) => { face(g, x, y, dir); return play(g, 'interact(...facing()).then(runEvents)'); };
const hider = g => get(g, "(n => n ? [n.x, n.y] : null)(NPCS.find(n => n.id === 'hider'))");
const hide = g => get(g, 'here().hide');
const lookAt = (g, id) => press(g, ...LOOK[id]);

test('the little monkey comes to the home ground once the feast is announced, with a ! till you’ve found it once', () => {
  assert.equal(hider(game({feast: 0})), null, 'not before');
  const g = game();
  assert.deepEqual(hider(g), [13, 8]);
  assert.equal(get(g, "(AREA.bubbles.hider.find(b => matches(b.if)) || {}).show || null"), '!');
  assert.equal(get(game({hide: {won: 1}}), "(AREA.bubbles.hider.find(b => matches(b.if)) || {}).show || null"), null, 'none once you’ve found it');
});

test('playing: you count to ten with your eyes covered, it hides, and calls out where it is', async () => {
  const g = game();
  await press(g, 13, 9, 'up');
  const said = get(g, '__said');
  assert.deepEqual(said.slice(0, 3), ['我们来捉迷藏吧！', '一，二，三，四，五，六，七，八，九，十！', '我来了！']);
  const spot = hide(g).spot, p = get(g, `hideSpot('${spot}')`);
  assert.ok(['tree', 'table', 'bridge', 'water', 'flowers'].includes(spot));
  assert.equal(said[3], get(g, `L.${p.say}.t.join('')`) + ` [clue ${p.word}]`, 'its clue, with the place’s word to leave in Chinese');
  assert.equal(hider(g), null, 'it’s gone from where it stood');
  assert.equal(get(g, 'getTasks().find(t => t.id === "hideSeek").clue.id'), spot, 'your tasks: find it, with its clue to hear again');
});

test('Not now: no game', async () => {
  const g = game({}, KNOWN, false);
  await press(g, 13, 9, 'up');
  assert.deepEqual(get(g, '__said'), ['我们来捉迷藏吧！']);
  assert.equal(hide(g).spot, null);
  assert.deepEqual(hider(g), [13, 8]);
});

test('it only hides where you know the word, and somewhere new each time; knowing just one place, it waits', async () => {
  const two = KNOWN.filter(w => !['桥', '水', '花'].includes(w));   // just 树 and 桌子
  const g = game({hide: {last: 'table'}}, two);
  await press(g, 13, 9, 'up');
  assert.equal(hide(g).spot, 'tree', 'not the table, where it hid last');
  const one = game({}, two.filter(w => w !== '桌子'));
  await press(one, 13, 9, 'up');
  assert.equal(hide(one).spot, null);
  assert.match(get(one, '__notes').join(' '), /don’t know the words for enough places/);
});

test('the wrong place: not here, and it calls out again; after two wrong guesses, its tail pokes out', async () => {
  const g = game({hide: {spot: 'table', wrong: 0, won: 0, last: 'table'}});
  g.run('placeCharacters()');
  face(g, ...LOOK.water);
  assert.equal(g.run('promptFor(...facing())'), 'Look', 'A looks there');
  await lookAt(g, 'water');
  assert.equal(hide(g).wrong, 1);
  assert.match(get(g, '__notes').at(-1), /Not here! Listen again/);
  assert.equal(get(g, '__said').at(-1), '我在桌子下面！ [clue 桌子]', 'it calls out again');
  await lookAt(g, 'tree');
  assert.equal(hide(g).wrong, 2);
  assert.match(get(g, '__notes').at(-1), /look out for a tail/);
  assert.deepEqual(get(g, 'hideSpot(here().hide.spot).tail'), [16, 7, 'left'], 'its tail, poking out from under the end of the table');
});

test('found: it jumps out, you say 找到你了！, shells the first time only, and it goes back to where it stands', async () => {
  const g = game({hide: {spot: 'table', wrong: 1, won: 0, last: 'table'}});
  g.run('placeCharacters()');
  await lookAt(g, 'table');
  assert.equal(get(g, '__said').at(-1), '找到你了！');
  assert.deepEqual([hide(g).spot, hide(g).wrong, hide(g).won, get(g, 'S.shells')], [null, 0, 1, 3]);
  assert.match(get(g, '__notes').at(-1), /You found the little monkey! It was under the 桌子 \(table\)\. \+3 🐚/);
  g.run('placeCharacters()');
  assert.deepEqual(hider(g), [13, 8], 'back where it stands');
  const again = game({hide: {spot: 'water', wrong: 0, won: 1, last: 'water'}});
  again.run('placeCharacters()');
  await lookAt(again, 'water');
  assert.deepEqual([hide(again).won, get(again, 'S.shells')], [2, 0], 'no shells after the first time: just for fun');
  assert.doesNotMatch(get(again, '__notes').at(-1), /🐚/);
});

test('its clue in the speech box: the English every time, with the place’s word in Chinese and its pinyin', () => {
  const g = loadGame({dom: true, save: {version: 30, started: true, w: {'桌子': {lv: 1, ok: 2}}, lines: {'我在桌子下面！': 1}, areas: {1: AT_HOME}, pos: BY_HIDER}});
  g.run("mode = 'play'; placePlayer(); showDialog(speaker('hider'), L.hideTable, {clue: '桌子', teach: '桌子'})");
  const talk = g.el('#talk'), en = talk.querySelector('.sentence-en');
  assert.ok(!en.hidden, 'its English, though you’ve heard it before');
  assert.ok(en.classList.contains('clue'));
  assert.equal(talk.querySelector('[data-a=en]'), null, 'no English button');
  assert.match(en.textContent, /I’m under the/);
  assert.ok(!/table/.test(en.textContent), 'the place left in Chinese');
  assert.equal(en.querySelector('.tok').dataset.t, '桌子', 'as the word, with its pinyin, to tap');
});

test('your Tasks page while it’s hiding: its clue, to read and hear again', () => {
  const g = game({hide: {spot: 'bridge', wrong: 0, won: 0, last: 'bridge'}});
  g.run('tasksPage(() => {})');
  const sheet = g.el('#sheet');
  assert.match(sheet.textContent, /Find where the little monkey is hiding/);
  assert.ok(sheet.querySelector('.taskclue .tok[data-t="桥"]'), 'the clue, with the place’s word in Chinese');
  assert.ok(sheet.querySelector('.taskclue [data-a=clue]'), 'and Hear it');
});
