// Chapter 1: the way home with the cow (27 October 2026, version 3 of the way to the cow: the way there was an adventure,
// the way back just a walk). Leading it up from the pasture, it stops at the long grass in the dark pines, scared of the
// wolves in it (我怕狼！): you go first, and a wolf leaps out at you; chase it off, and the cow follows you through. Up the
// south slope, at the top of the steps from the pines, it stops again, tired and hungry (我饿了。): pick it three handfuls of
// fresh grass by the brook (counted 一 二 三), give it it (我要吃草), and it follows you on, up the steps (the banks are too
// steep to climb). The bear at the pasture's rocks: tests/cow.test.js.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const FEAST = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, shop: 3, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bees: 1, cowSeen: 1, pastureTracks: 1, logSeen: 1, streamSeen: 1, pastureLog: 1, rabbitTold: 1};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '水', '河', '猴子', '朋友', '桥', '同学', '棍子', '有', '没有', '狼',
  '我', '要', '吃', '桌子', '家', '没关系', '谢谢', '不客气', '牛', '熊', '一', '二', '三'];
// A game leading the cow home (area: more progress), standing at pos, the cow following you unless following says not.
// A battle (__fights: its enemy and what's said as it begins) ends as __fight says: lost, and you're carried back to rest
// under the big tree, as in a real one.
function game(pos, area = {}, following = ['cow']){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, areas: {1: {...FEAST, cow: 4, cowWolf: 1, ...area}}, pos, w, following, friends: ['cow']}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__sounds = []; globalThis.__fights = []; globalThis.__fight = 'won'");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); rec(w).lv = Math.max(rec(w).lv, 1); }");
  g.run("for (const k of ['moo', 'howl', 'chime', 'bump', 'encounter', 'turn', 'right', 'fanfare']) SFX[k] = () => { __sounds.push(k); }");
  g.run("globalThis.__said = []; showDialog = async (who, line) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");   // (who says what)
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; gapQ = async o => { __said.push('gap: ' + o.t.join('') + ' (' + o.gap + ')'); return true; }");
  g.run("fight = async (id, opts) => { __fights.push([id, opts.meet || null]); if (__fight === 'lost'){ S.pos = {place: 'homeGround', x: 17, y: 8, dir: 'up'}; placePlayer(); } return __fight; }");
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
const walkTo = (g, x, y, dir) => {   // a step onto the square next to you, anyone following you stepping after you
  g.run(`followersStep(performance.now()); Object.assign(pl, {x: ${x}, y: ${y}, px: ${x} * T, py: ${y} * T, dir: '${dir}', mv: null})`);
  return play(g, `arrive(${x}, ${y}).then(runEvents)`);
};
const npc = (g, id) => get(g, `(n => n && [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === '${id}'))`);
const cowTasks = g => get(g, "getTasks().filter(t => /^cow/.test(t.id)).map(t => [t.id, t.text])");
const grassNow = g => get(g, '(tileAt(11, 25).onLook.find(p => !p.if || matches(p.if)) || null)');   // what A at the fresh grass does now
const reset = g => g.run('__said.length = 0; __notes.length = 0; __sounds.length = 0; __fights.length = 0');

test('in the dark pines, the cow won’t go into the long grass: 我怕狼！ It waits; go first, and a wolf leaps out at you', async () => {
  const g = game({place: 'darkPines', x: 16, y: 28, dir: 'up'});
  g.run('lineUp()');
  await walkTo(g, 16, 27, 'up');
  assert.deepEqual(get(g, '__said'), ['cow: 我怕狼！'], 'I’m scared of wolves!');
  assert.match(get(g, '__notes').join(' '), /The 牛 \(cow\) won’t go into the long grass: wolves hide in it! Go first, and chase them off\./);
  assert.deepEqual(get(g, '[here().cowWaits, S.following]'), ['grass', []], 'it stops following you, and waits');
  assert.deepEqual(npc(g, 'cow'), ['darkPines', 16, 28], 'just behind you, on the way up from the pasture');
  assert.deepEqual(cowTasks(g), [['cowWolf', 'The 牛 (cow) won’t go into the long grass in the dark pines: go first, and chase the wolves off']], 'not that it ran back to its spring');
  assert.deepEqual(get(g, "getTasks().find(t => t.id === 'cowWolf').target"), [16, 25], 'its arrow: on the long grass');
  assert.equal(g.run("AREA.bubbles.cow.find(b => matches(b.if)).show"), '!');
  reset(g);
  await press(g, 16, 27, 'down');
  assert.deepEqual(get(g, '__said'), ['cow: 我怕狼！'], 'A at it: the same');
  assert.deepEqual(get(g, '__fights'), [], 'no wolf yet, outside the long grass');
  await walkTo(g, 16, 26, 'up');
  assert.deepEqual(get(g, '__fights'), [['wolf', 'A {狼} leaps out of the long grass at you!']], 'into the long grass: a wolf leaps out at you');
  assert.deepEqual(get(g, '[here().pinesWolf, here().cowWaits, S.following]'), [1, 0, ['cow']], 'chased off, the cow follows you again');
  assert.match(get(g, '__notes').join(' '), /The 狼 \(wolf\) runs off into the pines\. The 牛 \(cow\) isn’t scared now: it follows you through the long grass!/);
  assert.ok(get(g, '__sounds').includes('moo'));
  assert.deepEqual(cowTasks(g).map(([id]) => id), ['cow4'], 'lead it home');
  reset(g);
  await walkTo(g, 16, 25, 'up');
  assert.deepEqual(get(g, '[__fights, __said]'), [[], []], 'the once');
  const back = game({place: 'darkPines', x: 16, y: 28, dir: 'up'}, {pinesWolf: 1});
  back.run('lineUp()');
  await walkTo(back, 16, 27, 'up');
  assert.deepEqual(get(back, '[__said, S.following]'), [[], ['cow']], 'once the wolf is chased off, it doesn’t stop again (after running back to its spring, say)');
});

test('lose to the wolf in the long grass, and you rest at home; the cow is still waiting by the long grass for you', async () => {
  const g = game({place: 'darkPines', x: 16, y: 27, dir: 'up'}, {cowWaits: 'grass'}, []);
  g.run("__fight = 'lost'");
  await walkTo(g, 16, 26, 'up');
  assert.deepEqual([g.run('PLACE'), get(g, '[S.pos.x, S.pos.y]')], ['homeGround', [17, 8]], 'you rest under the big tree');
  assert.deepEqual(get(g, '[here().cowWaits, here().pinesWolf, S.following]'), ['grass', 0, []]);
  assert.deepEqual(npc(g, 'cow'), ['darkPines', 16, 28], 'still waiting by the long grass, not back at its spring');
  assert.match(get(g, '__notes').join(' '), /The 牛 \(cow\) is still waiting for you by the long grass in the dark pines\. Go first, and chase the wolves off!/);
  reset(g);
  await press(g, 21, 10, 'down');
  assert.deepEqual(get(g, '__said'), ['thirsty: 山上有牛！'], 'the thirsty monkey, by the road...');
  assert.deepEqual(get(g, "AREA.talk.thirsty.find(p => !p.if || matches(p.if)).do[0].hint"), 'The cow is waiting for you by the long grass in the dark pines: go first, and chase the wolves off!', '...says where it is');
});

test('up the south slope, at the top of the steps from the pines, the cow stops again: 我饿了。 Pick it fresh grass by the brook (一 二 三), give it it (我要吃草), and it follows you on', async () => {
  const g = game({place: 'southSlope', x: 3, y: 28, dir: 'up'}, {pinesWolf: 1});
  g.run('lineUp()');
  await walkTo(g, 3, 27, 'up');
  assert.deepEqual(get(g, '__said'), ['cow: 我饿了。'], 'I’m hungry.');
  assert.match(get(g, '__notes').join(' '), /The 牛 \(cow\) is tired and hungry after the long walk\. Pick it some fresh 草 \(grass\) by the brook!/);
  assert.deepEqual(get(g, '[here().cowWaits, here().cowFood, S.following]'), ['slope', 'asked', []]);
  assert.deepEqual(npc(g, 'cow'), ['southSlope', 2, 27], 'it waits on the grass beside the top of the steps');
  assert.deepEqual(cowTasks(g), [['cowFood', 'The 牛 (cow) is hungry: pick it some fresh 草 (grass) by the brook, on the south slope (0/3)']]);
  assert.deepEqual(get(g, "getTasks().find(t => t.id === 'cowFood').target"), [11, 25], 'its arrow: the fresh grass by the brook');
  assert.deepEqual(get(g, '[tileAt(11, 25).look, tileAt(11, 25).walk]'), ['tallGrass', true], 'tall, fresh grass by the brook');
  face(g, 12, 25, 'left');
  assert.equal(g.run('promptFor(11, 25)'), 'Pick', 'A: Pick');
  assert.ok(grassNow(g).sparkle, 'it sparkles');
  reset(g);
  for (let i = 0; i < 3; i++) await play(g, 'interact(...facing()).then(runEvents)');
  assert.match(get(g, '__notes').join(' '), /一 \(one\)! You pick a handful of fresh 草 \(grass\)\. 二 \(two\)! You pick a handful of fresh 草 \(grass\)\. 三 \(three\)! You have three handfuls of fresh 草 \(grass\)\. Take them to the 牛 \(cow\)!/, 'counted aloud');
  assert.equal(get(g, 'here().holding.cowFood'), '草');
  assert.equal(grassNow(g), null, 'no more to pick');
  assert.deepEqual(cowTasks(g), [['cowFed', 'Give the 草 (grass) to the 牛 (cow)']]);
  assert.equal(g.run("AREA.bubbles.cow.find(b => matches(b.if)).show"), '?');
  reset(g);
  await press(g, 3, 27, 'left');
  assert.deepEqual(get(g, '__said'), ['cow: 草！太好了！', 'gap: 我要吃草 (草)', 'cow: 谢谢你！', 'player: 不客气'], 'Grass! Wonderful! I want to eat grass; thank you; you’re welcome');
  assert.deepEqual(get(g, '[here().cowFood, here().cowWaits, S.following]'), ['done', 0, ['cow']], 'it follows you again');
  assert.match(get(g, '__notes').join(' '), /The 牛 \(cow\) munches the 草 \(grass\) happily, and follows you again\. On up the slope, by its steps, and home!/);
  assert.deepEqual(cowTasks(g).map(([id]) => id), ['cow4']);
  reset(g);
  g.run("S.pos = {place: PLACE, x: 4, y: 28, dir: 'up'}; placePlayer(); lineUp()");
  await walkTo(g, 4, 27, 'up');
  assert.deepEqual(get(g, '[__said, S.following]'), [[], ['cow']], 'the once');
});

test('before the cow is hungry, the fresh grass is just grass: A shows 草', async () => {
  const g = game({place: 'southSlope', x: 12, y: 25, dir: 'left'}, {}, []);
  g.run("here().cow = 9");
  assert.equal(grassNow(g), null);
  assert.equal(get(g, 'tileAt(11, 25).word'), '草');
});
