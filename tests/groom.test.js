// Chapter 1 (decided 23 October 2026): two little monkeys grooming each other, taking turns, as in the book's chapter 1, where
// the troop plays in the shade of the pines (捉虱子…理毛衣: they pick out fleas and tidy their fur). Friends: say hello, and
// they say 我们是朋友！ Under the hillside's first pines till 24 October 2026; now at the home ground, under a tree south of
// the road, where it was empty.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 1, wood: 'asked', stones: 'asked', woodIn: 1, lookTip: 1, trainee1: 1, trainee2: 1};
const KNOWS = Object.fromEntries(['石头', '山', '花', '草', '树', '猴子', '朋友', '你好'].map(w => [w, {lv: 1, ok: 3, next: 100}]));
function game(pos = {place: 'homeGround', x: 11, y: 13, dir: 'right'}){   // beside them
  const g = loadGame({dom: true, save: {version: 29, started: true, w: KNOWS, areas: {1: CHAPTER_ONE}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__replies = []");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; replyWith = async best => { __replies.push(best); return true; }");
  g.run('placePlayer()');
  return g;
}
const npc = id => `NPCS.find(n => n.id === '${id}')`;

test('at the home ground, south of the road, two little monkeys sit together under a tree, grooming each other', () => {
  const g = game();
  assert.deepEqual(get(g, "ALL_NPCS.filter(n => PLAYS[n.id] === 'groom').map(n => [n.id, n.place, n.x, n.y])"), [['groomA', 'homeGround', 12, 13], ['groomB', 'homeGround', 13, 13]]);
  assert.deepEqual(get(g, '[tileAt(12, 13).look, tileAt(13, 13).look, tileAt(14, 13).look]'), ['grass', 'grass', 'tree'], 'on the grass, beside a tree');
  assert.ok(!g.run('walkable(12, 13)') && !g.run('walkable(13, 13)'));
  assert.ok([[16, 12], [16, 13], [16, 14]].every(([x, y]) => g.run(`walkable(${x}, ${y})`) && g.run(`tileAt(${x}, ${y}).look`) === 'path'), 'off the way down to the bridge, which stays clear');
  const plots = get(g, "PLACES.homeGround.map.flatMap((row, y) => [...row].map((c, x) => 'de24'.includes(c) ? [x, y] : null)).filter(Boolean)");
  assert.ok(plots.length && plots.every(([x, y]) => Math.abs(x - 12.5) + Math.abs(y - 13) > 1), 'and not on (or right by) the plots the troop wants for its new shop and garden');
  g.run("enterPlace('hillside')");
  assert.ok(g.run('walkable(15, 5)') && g.run('walkable(16, 5)'), 'the hillside’s pines are clear of them');
});

test('they take turns: both sit side-on, facing the same way; the one behind grooms, its hands in the fur of its friend’s back; the one in front shuts its eyes', () => {
  const g = game();
  const MS = get(g, 'GROOM_MS');
  assert.deepEqual(get(g, `[0, 1, 2, 3].map(i => groomAt(${MS} * (10 + i) + 5).who)`), [0, 1, 0, 1], 'taking turns');
  const drawn = t => get(g, `(() => { const out = {sat:[], fur:[]}, sp = sittingSprite, di = b.drawImage, fr = b.fillRect, skin = ['groomA', 'groomB'].map(k => (PALS[k] || PALS.player).s);
    sittingSprite = (kind, dir, shut, lean) => { out.sat.push([kind, dir, shut]); return sp(kind, dir, shut, lean); };
    b.drawImage = (img, x) => { out.sat[out.sat.length - 1].push(x); };
    b.fillRect = (x, y, w, h) => { if (skin.includes(b.fillStyle)) out.fur.push([x, y, w, h]); };
    for (const n of NPCS.filter(n => PLAYS[n.id] === 'groom')) drawPlaying(n, n.x * T, n.y * T, ${t});
    sittingSprite = sp; b.drawImage = di; b.fillRect = fr; return out; })()`);
  const first = drawn(MS * 10 + 5), then = drawn(MS * 11 + 5);
  assert.deepEqual(first.sat, [['groomA', 'right', false, 12 * 16 + 4], ['groomB', 'right', true, 13 * 16 - 1]], 'the one on the left grooms first, shuffled up behind its friend; both face right, and the one in front has its eyes shut');
  assert.deepEqual(then.sat, [['groomA', 'left', true, 12 * 16 + 1], ['groomB', 'left', false, 13 * 16 - 4]], 'then they turn round, and the other grooms');
  const [top, low] = get(g, 'GROOM_BACK');
  for (const [d, groomedX, right] of [[first, 13 * 16 - 1, true], [then, 12 * 16 + 1, false]]){
    assert.equal(d.fur.length, 2, 'its two hands in the fur');
    for (const [x, y, w, h] of d.fur){
      assert.ok(y >= 13 * 16 + top && y + h <= 13 * 16 + low + 1, 'on its friend’s back, from below its ear to the middle of it, never lower');
      assert.ok(right ? x + w <= groomedX + 7 : x >= groomedX + 9, 'on its back, never in front of it');
    }
  }
});

test('say hello: we are friends, 我们是朋友！', async () => {
  const g = game();
  await g.run(`talk(${npc('groomB')})`);
  assert.deepEqual(get(g, '[__said, __replies]'), [['你好！', '我们是朋友！'], ['你好']]);
  assert.match(get(g, '__notes[0]'), /take turns to groom each other/);
  assert.ok(g.run(`playing(${npc('groomB')})`), 'and back to it after');
});
