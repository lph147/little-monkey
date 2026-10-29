// Chapter 1: the bees' hive and honey (the bees' step 5, 25 October 2026). Home with the queen bee and her swarm, as you talk
// to her by the wildflowers the troop builds them a hive as you watch: its plot and sign marked out, then the hive set up a
// piece at a time (a stone base, then three log hives with straw caps); the queen says 这是我们的家！ and she and her swarm
// fly in. The hungry monkey wants honey for the feast: A at the hive takes some, teaching 蜂蜜 (蜂 bee + 蜜 honey: 蜜蜂
// the other way round); he takes it (我要吃蜂蜜, its gap to fill), and pours it into the empty bowl on the feast's table:
// 我们有蜂蜜了！ After that, the hive fills your bag, one each time you come, two at most, and honey gives you energy:
// eaten from your bag, you walk faster for a minute.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const BEES_HOME = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, shop: 3, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bees: 7, beeFriends: 6, queenOut: true};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '水', '河', '猴子', '朋友', '桥', '蝴蝶', '同学', '棍子', '蜜蜂', '蜂王', '有', '没有',
  '我', '要', '吃', '桌子', '家', '没关系', '谢谢', '不客气'];
// A game with the bees home (area: more progress; more: more of the save), standing at pos
function game(pos, area = {}, more = {}){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 30, started: true, met: ['butterfly', 'bee'], friends: ['butterfly', 'bee', 'queen'], areas: {1: {...BEES_HOME, ...area}}, pos, ...more, w: {...w, ...more.w}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__sounds = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w + (o.note ? ' (' + o.note + ')' : '') + (o.quiet ? ', quiet' : ', said')); rec(w).lv = Math.max(rec(w).lv || 0, 1); }");
  g.run("for (const k of ['buzz', 'fanfare', 'chime', 'tock', 'right', 'bump']) SFX[k] = () => { __sounds.push(k); }");
  g.run("globalThis.__said = []; showDialog = async (who, line) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");   // (who says what)
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; gapQ = async o => { __said.push('gap: ' + o.t.join('') + ' (' + o.gap + ')'); return true; }");
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

test('talk to the queen bee by the wildflowers, and the troop builds the bees a hive as you watch; she says it’s their home, and she and her swarm fly in', async () => {
  const g = game({place: 'homeGround', x: 25, y: 9, dir: 'up'});
  assert.deepEqual(get(g, 'getTasks().map(t => [t.text, t.target])'), [['Talk to the 蜂王 (queen bee) by the wildflowers', [27, 6]]]);
  assert.equal(g.run("AREA.bubbles.queen.find(b => matches(b.if)).show"), '!', 'the queen, waiting by the flowers');
  assert.equal(g.run('tileAt(28, 3).look'), 'grass', 'the hive’s plot: open grass till then');
  face(g, 25, 8, 'up');
  await play(g, 'arrive(25, 8).then(runEvents)');
  assert.equal(get(g, 'here().bees'), 7, 'nothing happens as you come near: you talk to her');
  await press(g, 27, 7, 'up');
  assert.match(get(g, '__notes').join(' '), /The troop comes over to build the bees a hive, right here by the wildflowers!/);
  assert.ok(get(g, '__sounds').filter(s => s === 'tock').length >= 8, 'stakes hammered in round its plot, then the hive’s pieces set up, each with a knock');
  assert.deepEqual(get(g, '__said'), ['queen: 这里有花！', 'queen: 这是我们的家！'], 'there are flowers here, and: this is our home!');
  assert.deepEqual(get(g, "mapObjects().filter(o => o.look === 'hive').map(o => [o.x, o.y, o.w, o.h])"), [[27, 3, 3, 2]], 'the hive: one big object, three squares by two');
  assert.equal(g.run('tileAt(26, 3).look'), 'sign', 'with its sign');
  assert.equal(g.run('OBJECT_STAGES.hive'), 4, 'set up in four pieces: its stone base, then a log hive at a time, each with its straw cap');
  assert.deepEqual([npc(g, 'queen'), npc(g, 'beeSwarm')], [['gone', 0, 0], ['gone', 0, 0]], 'the queen and her swarm have flown into it');
  assert.deepEqual(get(g, '[here().bees, here().honey]'), [10, 'asked'], 'and the hungry monkey wants honey for the feast');
  assert.match(get(g, '__notes').join(' '), /The queen bee and her swarm fly into their new hive\. Take some honey from it, for the hungry monkey’s feast!/);
  assert.deepEqual(get(g, 'getTasks().map(t => [t.text, t.target])'), [['Take some honey from the bees’ hive, for the hungry monkey', [28, 4]]], 'honey: still just its English, till you take some');
  g.run('__notes.length = 0');
  await press(g, 26, 4, 'up');
  assert.match(get(g, '__notes').join(' '), /The bees’ hive\. The queen bee and her swarm live here, and make honey for the troop\./, 'its sign');
});

test('A at the hive takes honey, teaching 蜂蜜 (said straight away); the hungry monkey takes it, 我要吃蜂蜜, and pours it into the bowl on the feast’s table: 我们有蜂蜜了！', async () => {
  const g = game({place: 'homeGround', x: 28, y: 5, dir: 'up'}, {bees: 10, honey: 'asked'});
  assert.equal(g.run('promptFor(28, 4)'), 'Take');
  await press(g, 28, 5, 'up');
  assert.equal(get(g, '__notes')[0], 'card: 蜂蜜 (Golden honey from the bees’ hive! 蜂蜜 is 蜜蜂 (bee) the other way round.), said', 'its card, said straight away: you found it');
  assert.deepEqual(get(g, "MADE['蜂蜜'].parts.map(p => p[0] + ' ' + p[2])"), ['蜂 bee', '蜜 honey'], 'how it’s made: the bees’ honey');
  assert.ok(get(g, "PART_IN['蜜']").includes('蜜蜂'), 'its 蜜 is the one in 蜜蜂, a word you know: its card says so');
  assert.equal(get(g, 'here().holding.honey'), '蜂蜜');
  assert.match(get(g, '__notes').join(' '), /You took some 蜂蜜 \(honey\)\. Take it to the hungry monkey\./);
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Take the 蜂蜜 (honey) to the hungry monkey']);
  assert.equal(g.run("AREA.bubbles.hungry.find(b => matches(b.if)).show"), '?');
  g.run('__said.length = 0; __notes.length = 0; __sounds.length = 0');
  const shells = g.run('S.shells');
  await press(g, 20, 7, 'left');   // (he's by the big table)
  assert.deepEqual(get(g, '__said'), ['hungry: 蜂蜜！太好了！', 'gap: 我要吃蜂蜜 (蜂蜜)', 'hungry: 谢谢你！', 'player: 不客气', 'hungry: 我们有蜂蜜了！'],
    'Honey! Wonderful!, then your gap to fill, his thanks, your reply, and: we have honey now!');
  assert.deepEqual(get(g, '[here().honey, here().bees, here().holding.honey || null]'), ['done', 11, null]);
  assert.equal(g.run('S.shells'), shells + 3);
  assert.ok(get(g, '__sounds').includes('chime'));
  assert.match(get(g, '__notes').join(' '), /The hungry monkey pours the honey into the empty bowl on the big table: now the feast has honey! He gives you a little 蜂蜜 \(honey\) for your bag too: eat it, and you walk faster for a minute\./);
  assert.equal(get(g, "S.bag['蜂蜜']"), 1, 'your first honey, from him, saying what it does (decided 26 October 2026: nothing said so where you’d see it)');
  assert.equal(g.run('tileAt(17, 7).look'), 'feastTableHoney', 'honey in the table’s third bowl');
  assert.deepEqual(get(g, "mapObjects().filter(o => /^feastTable/.test(o.look)).map(o => [o.look, o.x, o.w])"), [['feastTableHoney', 16, 3]], 'still one table, three squares wide');
  assert.deepEqual(get(g, "AREA.feastList.foods.filter(f => (!f.show || matches(f.show)) && f.have && matches(f.have)).map(f => f.yes.zh)"), ['我们 有 桃子 。', '我们 有 苹果 。', '我们 有 蜂蜜 。'],
    'the feast’s list: honey ticked off too');
  assert.deepEqual(item(g, /Bring 蜂蜜/), ['Bring 蜂蜜 (honey) to the feast’s big 桌子 (table)', true, false, true]);
  assert.match(g.run('goalText()'), /The thirsty monkey has news for you/, 'the cow’s news first, till you’ve heard it');
  g.run("here().cow = 9; here().milkTable = 1; rec('牛奶').lv = 1");   // (the cow home, in its pen, and its milk on the feast's new table)
  assert.match(g.run('goalText()'), /Talk to the thirsty monkey: he wants to make something with the 牛奶 \(milk\)/, 'then the little dairy');
  g.run("here().dairy = 5; here().milkTable = 3");   // (its yoghurt and cheese on the table too)
  assert.match(g.run('goalText()'), /The big monkey has an idea for the feast: look for his ! at the home ground/, 'then the garden (decided 28 October 2026: nothing said so)');
  g.run('here().garden = 1');
  assert.match(g.run('goalText()'), /The hungry monkey has something to ask you: look for his ! by the feast’s 桌子 \(tables\)/, 'then a big fish for the feast (tests/fishing.test.js)');
  g.run("here().fish = 'done'; here().fishTable = 1");
  assert.match(g.run('goalText()'), /The feast has 蜂蜜 \(honey\), milk, yoghurt and cheese now! Take more honey from the hive for your bag, and 吃 \(eat\) it to walk faster for a while\./);
  g.run('__said.length = 0');
  await press(g, 20, 7, 'left');
  assert.deepEqual(get(g, '__said'), ['hungry: 我们有蜂蜜了！']);
});

test('once the feast has honey, the hive fills your bag: one each time you come to the home ground (from any of its squares), two at most', async () => {
  const g = game({place: 'homeGround', x: 28, y: 5, dir: 'up'}, {bees: 11, honey: 'done'}, {w: {'蜂蜜': {lv: 1, ok: 0}}});
  assert.equal(g.run('promptFor(28, 4)'), 'Take');
  await press(g, 28, 5, 'up');
  assert.equal(get(g, "S.bag['蜂蜜']"), 1);
  assert.match(get(g, '__notes').join(' '), /You take some 蜂蜜 \(honey\) for your bag \(1 of 2\)\. Walk faster for a minute\./);
  g.run('__notes.length = 0');
  await press(g, 27, 5, 'up');
  assert.equal(get(g, "S.bag['蜂蜜']"), 1, 'the same hive, from another square: no more for now');
  assert.match(get(g, '__notes').join(' '), /The bees are still making more honey\. Come back another time\./);
  g.run('pickedHere.clear()');   // (as if you'd been somewhere else and come back)
  await press(g, 29, 5, 'up');
  assert.equal(get(g, "S.bag['蜂蜜']"), 2);
  g.run('pickedHere.clear(); __notes.length = 0');
  await press(g, 28, 5, 'up');
  assert.equal(get(g, "S.bag['蜂蜜']"), 2, 'two at most');
  assert.match(get(g, '__notes').join(' '), /Your bag has 2 蜂蜜 \(honey\) already\./);
});

test('honey gives you energy: eaten from your bag, you walk faster for a while, with golden sparks, till it wears off; no more while you’re full of energy', async () => {
  const g = game({place: 'homeGround', x: 20, y: 9, dir: 'right'}, {bees: 11, honey: 'done'}, {w: {'蜂蜜': {lv: 1, ok: 0}}, bag: {'蜂蜜': 2}});
  assert.equal(get(g, "FOOD['蜂蜜'].fast"), 60, 'a minute');
  g.run('bagPage(() => {})');
  const honey = () => g.el('#sheet').querySelector('.bagitem[data-w="蜂蜜"]');
  assert.equal(honey().getAttribute('data-label'), 'Eat');
  assert.match(honey().textContent, /Walk faster for a minute/);
  assert.equal(g.run('walkMs()'), g.run('STEP'), 'walking as usual till then');
  honey().click();
  assert.equal(get(g, "S.bag['蜂蜜']"), 1);
  assert.ok(g.run('isFast()'));
  assert.equal(g.run('walkMs()'), Math.round(g.run('STEP') * .6), 'each step takes a little over half the time');
  assert.match(g.el('#sheet').textContent, /You eat some 蜂蜜 \(honey\): you’re full of energy! You walk faster for a while\./);
  honey().click();
  assert.equal(get(g, "S.bag['蜂蜜']"), 1, 'not while you’re full of energy');
  assert.match(g.el('#sheet').textContent, /You’re full of energy already: keep it for later\./);
  g.run('closeCard(); tryStep("right", performance.now())');
  assert.equal(g.run('pl.mv.dur'), Math.round(g.run('STEP') * .6), 'a step, faster');
  g.run('drawWorld(performance.now())');   // (the golden sparks, drawn without trouble)
  g.run('pl.mv = null; fastUntil = 0; __notes.length = 0; update(performance.now())');   // (a minute later, once you've stopped)
  assert.deepEqual(get(g, '__notes'), ['The energy from the 蜂蜜 (honey) wears off.']);
  assert.equal(g.run('walkMs()'), g.run('STEP'));
});

test('hide and seek: the little monkey hiding in the flowers is found round the hive, not in it', () => {
  const g = game({place: 'homeGround', x: 25, y: 9, dir: 'up'}, {bees: 11, honey: 'done'});
  const spot = get(g, "AREA.hideSeek.spots.find(s => s.id === 'flowers')");
  for (const [x, y] of spot.at) assert.notEqual(g.run(`tileAt(${x}, ${y}).look`), 'hive', `${x},${y} is the hive`);
  assert.ok(g.run(`walkable(${spot.out[0]}, ${spot.out[1]})`), 'it jumps out onto open ground');
  assert.ok(!spot.at.some(([x, y]) => x === 26 && y === 3), 'nor at the hive’s sign');
});
