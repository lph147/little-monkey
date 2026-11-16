// The start of the game, after the owner played it again (16 November 2026): the goat beside the river valley's path no
// longer vanishes as it becomes your friend; the rocks north of the meadow tumble off into the river as the ground quakes,
// with everything stopping and the troop running up to the way up, rather than just vanishing; and the troop sends you off
// up the path in a few lines of their own, not a long message in English. (The rabbit's warning before your first snake:
// tests/gentle-prologue.test.js.)
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const known = ws => Object.fromEntries(ws.map(w => [w, {lv: 1, ok: 3, next: 100}]));
const BASICS = ['石头', '你好', '山', '树', '花', '草', '河', '鱼', '鸟', '动物', '猴子', '朋友', '我', '羊', '松鼠', '兔子', '水果', '桃子', '苹果', '水'];
function game(area, pos, more = {}){
  const g = loadGame({dom: true, save: {version: 42, started: true, scroll: {has: true, sealed: []}, w: known(BASICS), met: ['sheep', 'squirrel', 'rabbit'], friends: ['sheep', 'squirrel', 'rabbit'], areas: {1: area}, pos, ...more}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; toast = () => {}; showNarration = async () => {}; infoBox = async () => {}");
  g.run("showDialog = async (who, line) => { __said.push([(who.match(/data-id=\"([^\"]*)\"/) || [])[1], line.t.join('')]); }; showNotice = async w => { setSeen(w); }");
  g.run('replyWith = async best => { if (lvl(best) === 0) setSeen(best); return true; }; catchQ = async () => true');
  g.run('placePlayer(); placeCharacters(); buildMap()');
  return g;
}
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 2000 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); } await p; }
// Each animal drawn at its spot as the map is drawn, with where on the screen ([id, X, Y]), whether as itself or as the
// character standing in its place
const DRAWN = `(() => { const was = drawSpotAnimal, got = []; drawSpotAnimal = (a, X, Y, ...r) => { got.push([a.id, X, Y]); }; try { drawWorld(5000); } finally { drawSpotAnimal = was; } return got.filter(([id]) => id === 'goat'); })()`;

test('the goat beside the river valley’s path: still there, hopping for joy, as it becomes your friend, and then the one who takes its place is drawn just as it was, never vanishing for a moment', () => {
  const g = game({elder: 2, gate: true, climb: 1, goatHop: 1}, {place: 'valley', x: 19, y: 10, dir: 'up'});
  assert.equal(get(g, 'canWild()'), true);
  const before = get(g, DRAWN);
  assert.equal(before.length, 1, 'at its spot, before you meet it');
  g.run("foe = {a: ANIMALS.find(x => x.id === 'goat'), x: 20, y: 9, t0: 4000, state: 'in', spot: true}; S.friends.push('goat')");
  assert.equal(get(g, "atSpot(ANIMALS.find(x => x.id === 'goat'))"), false, 'it’s your friend now, and leaves its spot (leaves)…');
  assert.deepEqual(get(g, DRAWN), before, '…but while you’re meeting it, it’s still drawn there (it vanished, then popped back a second later)');
  g.run("foe.state = 'happy'; foe.t1 = 4800");
  assert.deepEqual(get(g, DRAWN).map(([id, X]) => [id, X]), before.map(([id, X]) => [id, X]), 'hopping for joy there');
  g.run('foe = null; placeCharacters()');
  assert.deepEqual(get(g, "NPCS.filter(n => n.id === 'goat').map(n => [n.place, n.x, n.y])"), [['valley', 20, 9]], 'the goat who takes its place, on its square');
  assert.deepEqual(get(g, DRAWN), before, 'drawn just as the animal was there, in the same place');
});

test('the rocks north of the meadow: the ground quakes, everyone stops and looks, the view glides over, the rocks tumble into the river one after the other, and the troop runs up to the way up', async () => {
  const g = game({elder: 2, meadowCheck: 1, hungry: 'done', thirsty: 'done', hungry2: 'done', gate: false}, {place: 'meadow', x: 14, y: 5, dir: 'left'});
  const event = get(g, "AREA.events.find(e => e.if.gate === false && e.do.some(s => s.rumble))");
  const quake = event.do.find(s => s.rumble).rumble;
  assert.deepEqual([quake.set, quake.at.slice(0, 2), quake.roll.length], [{gate: true}, [15.5, 3.5], 2], 'a quake (not the little rumble, rumble: true), opening the way up');
  assert.equal(get(g, 'tileAt(15, 4).look'), 'rocks');
  const was = get(g, "NPCS.filter(n => n.place === 'meadow').map(n => [n.id, n.x, n.y, n.dir])");
  let done = false;
  const p = Promise.resolve(g.run(`runSteps(${JSON.stringify(event.do)})`)).then(() => { done = true; });
  // straight away: the map has moved on, but the rocks are still drawn where they lay, shuddering; everyone turns to look
  assert.equal(get(g, 'tileAt(15, 4).look'), 'path', 'the way up is open on the map…');
  assert.deepEqual(get(g, 'tumbling.map(r => [r.x, r.y, r.i])'), [[16, 4, 1], [15, 4, 0]], '…but the rocks are drawn where they lay (each as the map draws it, the second of the row a little smaller)');
  assert.ok(get(g, 'quaking && quaking.until > performance.now() && quaking.look.x === 15.5'), 'the ground quaking, the view gliding over to them');
  assert.ok(get(g, "NPCS.filter(n => n.place === 'meadow').every(n => n.startled > performance.now())"), 'everyone startled, a ! over them');
  assert.equal(get(g, "NPCS.find(n => n.id === 'hungry').dir"), 'right', 'and turned to look');
  assert.equal(get(g, "[NPCS.find(n => n.id === 'elder').x, NPCS.find(n => n.id === 'elder').y].join()"), '7,1', 'the troop still where they were');
  for (let i = 0; i < 3000 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
  assert.deepEqual([get(g, 'here().gate'), get(g, 'tumbling.length'), get(g, 'quaking')], [true, 0, null], 'the rocks gone into the river, the ground still, and the view back to you');
  assert.deepEqual(get(g, "['elder', 'big', 'playful'].map(id => { const n = NPCS.find(c => c.id === id); return [id, n.x, n.y, n.dir, !!n.mv]; })"),
    [['elder', 14, 2, 'right', false], ['big', 16, 1, 'down', false], ['playful', 14, 3, 'right', false]], 'the troop has run up to the way up, facing as they stand there');
  const now = get(g, "NPCS.filter(n => n.place === 'meadow' && !['elder', 'big', 'playful'].includes(n.id)).map(n => [n.id, n.x, n.y, n.dir])");
  assert.deepEqual(now, was.filter(([id]) => !['elder', 'big', 'playful'].includes(id)), 'the rest back to what they were doing, facing as they were');
});

test('the troop runs up round you, never through you, and the quake somewhere else just happens', async () => {
  const g = game({elder: 2, meadowCheck: 1, hungry: 'done', thirsty: 'done', hungry2: 'done', gate: false}, {place: 'meadow', x: 15, y: 5, dir: 'up'});
  const quake = get(g, "AREA.events.find(e => e.if.gate === false && e.do.some(s => s.rumble)).do.find(s => s.rumble)");
  g.run('globalThis.__through = 0; globalThis.__watch = () => { for (const n of NPCS) if (n.mv && n.x === pl.x && n.y === pl.y) __through++; }');
  let done = false;
  const p = Promise.resolve(g.run(`runSteps([${JSON.stringify(quake)}])`)).then(() => { done = true; });
  for (let i = 0; i < 3000 && !done; i++){ await new Promise(r => setImmediate(r)); g.run('__watch()'); g.flush(); }
  await p;
  assert.equal(get(g, '__through'), 0, 'nobody steps onto your square');
  assert.deepEqual(get(g, "['elder', 'big', 'playful'].map(id => { const n = NPCS.find(c => c.id === id); return [n.x, n.y]; })"), [[14, 2], [16, 1], [14, 3]]);
  const away = game({elder: 2, gate: false}, {place: 'path', x: 15, y: 17, dir: 'up'});
  await play(away, `runSteps([${JSON.stringify(quake)}])`);
  assert.deepEqual([get(away, 'here().gate'), get(away, 'tumbling.length'), get(away, 'quaking')], [true, 0, null], 'out of the meadow, the way is just open');
});

test('sent off up the path: the little monkey wonders where the water comes from, the big monkey won’t go, the old monkey asks who will, and you will, on your own, not scared; then goodbye', async () => {
  const g = game({elder: 2, meadowCheck: 1, hungry: 'done', thirsty: 'done', hungry2: 'done', gate: true, climb: 0}, {place: 'meadow', x: 15, y: 3, dir: 'left'});
  await play(g, "talk(NPCS.find(n => n.id === 'elder'))");
  assert.deepEqual(get(g, '__said'), [['playful', '水从哪里来？'], ['elder', '山上有蛇。'], ['big', '我不去！'], ['elder', '谁去看看？'], ['player', '我去！'],
    ['elder', '你一个人去？'], ['player', '我不怕！'], ['elder', '再见！']], 'told in their own lines, each by who says it (it was 山上有蛇。 and 再见！, with the story in a long message in English)');
  assert.equal(get(g, 'here().climb'), 1, 'and you’re on your way');
  assert.equal(get(g, "lvl('再见')") > 0, true, 'saying goodbye back (再见, taught here)');
});
