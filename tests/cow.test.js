// Chapter 1: the cow, a rescue (planned 26 October 2026; version 1 built the same day). Once the feast's quests begin, the
// thirsty monkey has come up from the meadow to the home ground, by the road, with a !: 山上有牛！ (牛 just for listening).
// The troop clears the bushes past the bridge at the bottom of the home ground, the way south to the pasture (牧场): a way
// winding down through dark pines, long grass grown over it three times (wolves too), then out between two big rocks into
// a sunny pasture with a spring. The first time you go in, a cow moos beyond the pines. By its spring you find the cow:
// 牛, said as you meet it, and it says 我怕狼！ (I'm scared of wolves!).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const FEAST = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bees: 1};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '水', '河', '猴子', '朋友', '桥', '同学', '棍子', '有', '没有', '狼',
  '我', '要', '吃', '桌子', '家', '没关系', '谢谢', '不客气'];
// A game with the feast's quests begun (area: more progress), standing at pos
function game(pos, area = {}){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 30, started: true, areas: {1: {...FEAST, ...area}}, pos, w}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__sounds = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w + (o.note ? ' (' + o.note + ')' : '') + (o.quiet ? ', quiet' : ', said')); rec(w).lv = Math.max(rec(w).lv, 1); }");
  g.run("for (const k of ['moo', 'howl', 'chime', 'bump']) SFX[k] = () => { __sounds.push(k); }");
  g.run("globalThis.__said = []; showDialog = async (who, line) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");   // (who says what)
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
const item = (g, re) => get(g, `areaChecklist().find(([t]) => ${re}.test(t)) || null`);
const npc = (g, id) => get(g, `(n => n && [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === '${id}'))`);

test('once the feast’s quests begin, the thirsty monkey is by the road at the home ground, with news: 山上有牛！, and the troop clears the way south', async () => {
  const before = game({place: 'homeGround', x: 21, y: 10, dir: 'down'}, {feast: 2, bees: 0});
  assert.equal(npc(before, 'thirsty')[0], 'meadow', 'in the meadow, till the feast’s quests begin');
  const g = game({place: 'homeGround', x: 21, y: 10, dir: 'down'});
  assert.deepEqual(npc(g, 'thirsty'), ['homeGround', 21, 11], 'up at the home ground, by the road');
  assert.equal(g.run("AREA.bubbles.thirsty.find(b => matches(b.if)).show"), '!');
  assert.equal(g.run('tileAt(16, 21).look'), 'bush', 'the way south: thick bushes, till then');
  assert.ok(!g.run('walkable(16, 21)'));
  await press(g, 21, 10, 'down');
  assert.deepEqual(get(g, '__said'), ['thirsty: 山上有牛！'], 'there’s a cow on the mountain!');
  assert.equal(g.run("lvl('牛')"), 0, '牛 just for listening, till you find the cow');
  assert.equal(get(g, 'here().cow'), 1);
  assert.match(get(g, '__notes').join(' '), /He heard a cow mooing beyond the pines, while he was looking for fresh water\. It’s lost and all alone, and wolves live in those pines!/);
  assert.match(get(g, '__notes').join(' '), /The troop has cleared a way south, over the bridge at the bottom of the home ground\. Go and find the cow!/);
  assert.equal(g.run('tileAt(16, 21).look'), 'path', 'the bushes are gone');
  assert.equal(g.run("AREA.bubbles.thirsty.find(b => matches(b.if))"), undefined, 'his ! has gone');
  assert.deepEqual(get(g, "getTasks().filter(t => /^cow/.test(t.id)).map(t => t.text)"), ['Find the lost cow: south over the bridge, and through the pines'], 'cow: just its English, till you’ve caught it');
  assert.deepEqual(item(g, /lost cow/), ['Find the lost cow on the mountain', false, false, true]);
  g.run('__said.length = 0');
  await press(g, 21, 10, 'down');
  assert.deepEqual(get(g, '__said'), ['thirsty: 山上有牛！'], 'again, with what to do under it');
});

test('south, over the bridge: the pasture (牧场), where a cow moos beyond the pines the first time you go in', async () => {
  const g = game({place: 'homeGround', x: 16, y: 20, dir: 'down'}, {cow: 1});
  await play(g, 'arrive(16, 21).then(runEvents)');
  assert.deepEqual([g.run('PLACE'), get(g, '[S.pos.x, S.pos.y, S.pos.dir]')], ['pasture', [16, 1, 'down']], 'in at the top, among the pines');
  assert.deepEqual(get(g, 'PLACES.pasture.name'), {zh: '牧场', py: 'mùchǎng', en: 'The pasture'});
  assert.ok(get(g, '__sounds').includes('moo'), 'a moo, from beyond the pines');
  assert.match(get(g, '__notes').join(' '), /Dark pines, and long grass where wolves hide\. Somewhere beyond them, a cow moos, long and sad…/);
  assert.equal(get(g, 'here().cow'), 2);
  g.run('__sounds.length = 0; __notes.length = 0');
  await play(g, 'runEvents()');
  assert.deepEqual([get(g, '__sounds'), get(g, '__notes')], [[], []], 'only the first time');
  assert.deepEqual(get(g, "LEGEND.n.wild"), ['wolf', 'wolf', 'snake', 'spider'], 'its long grass: wolves come down from the pines');
  assert.deepEqual(get(g, '[PLACES.pasture.battleMusic, PLACES.pasture.backdrop]'), ['pineBattle', 'pines'], 'battles among the pines, as in the pine wood');
  for (const [x, y] of [[8, 5], [9, 6], [15, 8], [16, 9], [20, 12], [21, 13]]) assert.equal(g.run(`tileAt(${x}, ${y}).look`), 'longGrass', `long grass grown over the way at ${x},${y}`);
  for (const [x, y] of [[19, 13], [22, 13], [19, 14], [22, 14]]) assert.ok(!g.run(`walkable(${x}, ${y})`), `the big rocks either side of the gap, at ${x},${y}`);
  assert.equal(g.run('tileAt(28, 18).look'), 'water', 'the spring');
  assert.deepEqual(npc(g, 'cow'), ['pasture', 31, 18], 'the cow, by its spring');
  assert.equal(g.run("AREA.bubbles.cow.find(b => matches(b.if)).show"), '!');
  g.run("S.pos = {place: PLACE, x: 16, y: 1, dir: 'up'}; placePlayer()");
  await play(g, 'arrive(16, 0).then(runEvents)');
  assert.deepEqual([g.run('PLACE'), get(g, '[S.pos.x, S.pos.y]')], ['homeGround', [16, 20]], 'back up to the home ground, below the bridge');
});

test('by its spring, you find the cow: 牛, said as you meet it, then 我怕狼！', async () => {
  const g = game({place: 'pasture', x: 31, y: 17, dir: 'down'}, {cow: 2});
  await press(g, 31, 17, 'down');
  assert.equal(get(g, '__notes')[0], 'card: 牛 (A cow, lost and all alone, by the spring. It looks up at you, trembling.), said', 'its card, said straight away: you found it');
  assert.deepEqual(get(g, '__said'), ['cow: 我怕狼！'], 'I’m scared of wolves!');
  assert.match(get(g, '__notes').join(' '), /The 牛 \(cow\) is lost, and too scared of the wolves in the pines to go anywhere\./);
  assert.equal(get(g, 'here().cow'), 3);
  assert.equal(g.run("AREA.bubbles.cow.find(b => matches(b.if))"), undefined, 'its ! has gone');
  assert.deepEqual(get(g, "getTasks().filter(t => /^cow/.test(t.id))"), [], 'the task is done');
  assert.deepEqual(item(g, /lost 牛/), ['Find the lost 牛 (cow) on the mountain', true, false, true], 'and ticked off');
  g.run('__said.length = 0; __notes.length = 0');
  await press(g, 31, 17, 'down');
  assert.deepEqual([get(g, '__said'), get(g, '__notes')], [['cow: 我怕狼！'], []], 'again: no card, just 我怕狼！');
  assert.equal(get(g, "AREA.found['牛']"), 'Lost and all alone by its spring, in the pasture south of the home ground.', 'its page in the Word Scroll says where');
});

test('hidden in the pasture: shells under a boulder, and a peach behind a tree at its edge', () => {
  const g = game({place: 'pasture', x: 16, y: 1, dir: 'down'}, {cow: 3});
  const finds = get(g, "AREA.hidden.filter(h => h.at[2] === 'pasture').map(h => [h.id, h.at[0], h.at[1], tileAt(h.at[0], h.at[1]).look])");
  assert.deepEqual(finds, [['pastureBoulder', 4, 18, 'boulder'], ['pastureTree', 20, 23, 'tree']], 'at things you can’t walk through');
});
