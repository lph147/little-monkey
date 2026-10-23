// Chapter 1, the hillside (decided 23 October 2026): under the first pines, two little monkeys grooming each other, taking
// turns, as in the book's chapter 1, where the troop plays in the shade of the pines (捉虱子…理毛衣: they pick out fleas and
// tidy their fur). Friends: say hello, and they say 我们是朋友！
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 1, wood: 'asked', stones: 'asked', woodIn: 1, lookTip: 1, trainee1: 1, trainee2: 1};
const KNOWS = Object.fromEntries(['石头', '山', '花', '草', '树', '猴子', '朋友', '你好'].map(w => [w, {lv: 1, ok: 3, next: 100}]));
function game(pos = {place: 'hillside', x: 13, y: 5, dir: 'right'}){   // on the way to the archway, beside them
  const g = loadGame({dom: true, save: {version: 29, started: true, w: KNOWS, areas: {1: CHAPTER_ONE}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__replies = []");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; replyWith = async best => { __replies.push(best); return true; }");
  g.run('placePlayer()');
  return g;
}
const npc = id => `NPCS.find(n => n.id === '${id}')`;

test('under the first pines, beside the way to the archway, two little monkeys sit together, grooming each other', () => {
  const g = game();
  assert.deepEqual(get(g, "ALL_NPCS.filter(n => PLAYS[n.id] === 'groom').map(n => [n.id, n.place, n.x, n.y])"), [['groomA', 'hillside', 15, 5], ['groomB', 'hillside', 16, 5]]);
  assert.deepEqual(get(g, '[tileAt(15, 5).look, tileAt(16, 5).look]'), ['needles', 'needles'], 'on the pine wood’s floor');
  assert.ok(!g.run('walkable(15, 5)') && !g.run('walkable(16, 5)'));
  assert.ok(g.run('walkable(18, 4)'), 'and you can still get to the apple hidden by the pine there');
});

test('they take turns: the groomer sits close, facing its friend, nodding as it picks; the other faces you, eyes shut, a hand on its shoulder', () => {
  const g = game();
  const MS = get(g, 'GROOM_MS');
  assert.deepEqual(get(g, `[0, 1, 2, 3].map(i => groomAt(${MS} * (10 + i) + 5).who)`), [0, 1, 0, 1], 'taking turns');
  const drawn = t => get(g, `(() => { const out = [], em = drawEntityMonkey, sp = monkeySprite, rr = R;
    drawEntityMonkey = (kind, X, Y, dir) => out.push(['groomer', kind, dir, X]); monkeySprite = (kind, dir, blink) => { out.push(['groomed', kind, dir, blink]); return sp(kind, dir, blink); };
    for (const n of NPCS.filter(n => PLAYS[n.id] === 'groom')) drawPlaying(n, n.x * T, n.y * T, ${t});
    drawEntityMonkey = em; monkeySprite = sp; return out; })()`);
  assert.deepEqual(drawn(MS * 10 + 5), [['groomer', 'groomA', 'right', 15 * 16 + 2], ['groomed', 'groomB', 'down', true]], 'the one on the left grooms first, sitting close');
  assert.deepEqual(drawn(MS * 11 + 5), [['groomed', 'groomA', 'down', true], ['groomer', 'groomB', 'left', 16 * 16 - 2]], 'then the other');
});

test('say hello: we are friends, 我们是朋友！', async () => {
  const g = game();
  await g.run(`talk(${npc('groomB')})`);
  assert.deepEqual(get(g, '[__said, __replies]'), [['你好！', '我们是朋友！'], ['你好']]);
  assert.match(get(g, '__notes[0]'), /take turns to groom each other/);
  assert.ok(g.run(`playing(${npc('groomB')})`), 'and back to it after');
});
