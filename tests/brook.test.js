// Chapter 1, the hillside (decided 23 October 2026): by the brook at its foot, the troop at play, as in the book's chapter 1
// (赶蜻蜓: they chase dragonflies; 绿水涧边随洗濯: by the green stream they wash): dragonflies dart about over the water, a
// little monkey on the bank leaps at one, which always gets away, and two little monkeys in the water splash each other.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 1, wood: 'asked', stones: 'asked', woodIn: 1, lookTip: 1, trainee1: 1, trainee2: 1};
const KNOWS = Object.fromEntries(['石头', '山', '花', '草', '树', '水', '河', '猴子', '你好'].map(w => [w, {lv: 1, ok: 3, next: 100}]));
function game(pos = {place: 'hillside', x: 10, y: 34, dir: 'down'}){   // on the path above the brook
  const g = loadGame({dom: true, save: {version: 29, started: true, w: KNOWS, areas: {1: CHAPTER_ONE}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__replies = []");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; replyWith = async best => { __replies.push(best); return true; }");
  g.run('placePlayer()');
  return g;
}
const npc = id => `NPCS.find(n => n.id === '${id}')`;

test('a little monkey on the bank, chasing a dragonfly, and two in the water at the brook’s end, splashing each other', () => {
  const g = game();
  assert.deepEqual(get(g, "ALL_NPCS.filter(n => ['dragonflies', 'splash'].includes(PLAYS[n.id])).map(n => [n.id, n.x, n.y, n.home.facing, PLAYS[n.id]])"),
    [['chaser', 11, 35, 'down', 'dragonflies'], ['splash1', 3, 37, 'right', 'splash'], ['splash2', 5, 37, 'left', 'splash']]);
  assert.equal(g.run('tileAt(11, 36).look'), 'water', 'the chaser on the bank, by the water');
  assert.deepEqual(get(g, '[tileAt(3, 37).look, tileAt(5, 37).look]'), ['water', 'water'], 'the splashers in it, facing each other');
  assert.ok(!g.run('walkable(11, 35)'), 'you can’t walk through the chaser');
  assert.deepEqual(get(g, "['chaser', 'splash1', 'splash2'].map(id => NAMES[id].en)"), ['Monkey', 'Monkey', 'Monkey']);
});

test('dragonflies dart about over the water, each in its own patch: hovering a moment, then darting off somewhere new', () => {
  const g = game();
  const flies = get(g, 'AREA.dragonflies');
  assert.ok(flies.length >= 1);
  flies.forEach((d, i) => {
    g.run(`setPlace(placeOf(AREA.dragonflies[${i}].at))`);   // (each in its own place: the hillside's brook, the pasture's spring)
    assert.equal(g.run(`tileAt(${d.at[0]}, ${d.at[1]}).look`), 'water', 'over the water');
    const box = get(g, `dragonflyBox(AREA.dragonflies[${i}])`);
    const path = get(g, `Array.from({length: 1000}, (_, k) => dragonflyAt(dragonflyBox(AREA.dragonflies[${i}]), ${i}, 100000 + k * 20))`);   // twenty seconds
    assert.ok(path.every(p => p.x >= box[0] - 1 && p.x <= box[2] + 1 && p.y >= box[1] - 1 && p.y <= box[3] + 1), 'always in its patch');
    const moves = path.slice(1).map((p, k) => Math.hypot(p.x - path[k].x, p.y - path[k].y));
    assert.ok(moves.filter(m => m < 1).length / moves.length > .8, 'hovering most of the time');
    assert.ok(new Set(path.map(p => `${Math.round(p.x / 8)},${Math.round(p.y / 8)}`)).size >= 6, 'and darting about, here and there');
  });
  for (const t of [0, 700, 1500]) g.run(`drawDragonflies(0, 0, ${t})`);   // (it draws)
});

test('the little monkey leaps at its dragonfly every so often, turning to it, and it darts off just as the leap is highest', () => {
  const g = game();
  const [CHASE, LEAP] = get(g, '[CHASE_MS, CHASE_LEAP]');
  const lifts = get(g, `Array.from({length: ${CHASE} / 10}, (_, k) => chaseLeap(50000 * ${CHASE} + k * 10))`);
  assert.ok(lifts.filter(h => h > 0).length * 10 <= LEAP + 10 && Math.max(...lifts) > .99, 'a leap, now and then');
  const before = get(g, `chasedAt(${npc('chaser')}, 50000 * ${CHASE} + ${LEAP} / 2 - 20)`), after = get(g, `chasedAt(${npc('chaser')}, 50000 * ${CHASE} + ${LEAP} / 2 + 200)`);
  assert.ok(Math.hypot(after.x - before.x, after.y - before.y) > 3, 'off it darts, as the leap is highest');
  const box = get(g, `chaseBox(${npc('chaser')})`), n = get(g, `[${npc('chaser')}.x * T, ${npc('chaser')}.y * T]`);
  assert.ok(box[0] < n[0] && box[2] > n[0] + 16 && box[1] < n[1], 'round it, and up above its head');
  g.run(`globalThis.__dir = []; const was = drawEntityMonkey; drawEntityMonkey = (kind, X, Y, dir) => __dir.push(dir); chasedAt = n => ({x: n.x * T - 10, y: n.y * T - 4, left: true});
    drawPlaying(${npc('chaser')}, 0, 0, 1000); chasedAt = n => ({x: n.x * T + 30, y: n.y * T - 4, left: false}); drawPlaying(${npc('chaser')}, 0, 0, 1000); drawEntityMonkey = was;`);
  assert.deepEqual(get(g, '__dir'), ['left', 'right'], 'turning to it');
});

test('the two in the water take turns to splash each other, with a splash you can hear when you’re near', () => {
  const g = game({place: 'hillside', x: 4, y: 36, dir: 'down'});
  const MS = get(g, 'SPLASH_MS');
  assert.deepEqual(get(g, `[0, 1, 2, 3].map(i => splashAt(${MS} * (100 + i) + 10).by)`), [0, 1, 0, 1], 'taking turns');
  const heard = () => g.run(`(() => { let k = 0; SFX.splash = () => { k++; }; splashWas = null; for (let t = 0; t < ${MS} * 4; t += 16) playSounds(1000000 + t); return k; })()`);
  assert.ok(Math.abs(heard() - 4) <= 1, 'a splash each time');
  g.run("S.pos = {place: 'hillside', x: 20, y: 43, dir: 'up'}; placePlayer()");
  assert.equal(heard(), 0, 'not from far off');
});

test('say hello: the chaser’s dragonfly is far too quick for it; the splashers are playing in the water, 我们在玩水！', async () => {
  const g = game();
  await g.run(`talk(${npc('chaser')})`);
  assert.deepEqual(get(g, '[__said, __replies]'), [['你好！'], ['你好']]);
  assert.match(get(g, '__notes[0]'), /chasing a dragonfly, but the dragonfly is far too quick for it/);
  g.run('__said.length = 0; __replies.length = 0');
  await g.run(`talk(${npc('splash2')})`);
  assert.deepEqual(get(g, '[__said, __replies]'), [['你好！', '我们在玩水！'], ['你好']]);
  assert.equal(get(g, 'L.playWater.en'), 'We’re playing in the water!');
});

test('one you’re talking to stops to look at you, and a splasher stays in the water as it does', () => {
  const g = game({place: 'hillside', x: 3, y: 36, dir: 'down'});
  g.run(`globalThis.__drawn = []; const sp = monkeySprite; monkeySprite = (kind, dir, ...rest) => { __drawn.push(kind + ':' + dir); return sp(kind, dir, ...rest); };
    const em = drawEntityMonkey; drawEntityMonkey = (kind) => { __drawn.push('standing ' + kind); };
    talkingTo = 'splash1'; ${npc('splash1')}.dir = 'up'; drawPlaying(${npc('splash1')}, 0, 0, 1000); talkingTo = null; drawEntityMonkey = em; monkeySprite = sp;`);
  assert.deepEqual(get(g, '__drawn'), ['splash1:up'], 'in the water, turned to you, never standing on it');
});
