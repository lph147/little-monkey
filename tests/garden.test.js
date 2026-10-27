// Chapter 1: the big monkey's garden (planned 27 October 2026, built in four versions; this is version 1). Once he's made
// the chopsticks and the hungry monkey has said what the feast still needs, the big monkey has a !: 我们要种子！ (We want
// seeds!), teaching 种子. He walks you down to the stream and the troop marks out a garden there as you watch. Wild fruit
// grows on the mountain: first, wild melons in a sunny field east off the south slope, where birds keep pecking at them.
// Shoo them away (A at each shows it, such as 红色的鸟, and it flies off for good), then take a melon's seeds (teaching
// 西瓜). Give them to the big monkey, finishing 这是西瓜的种子 (These are watermelon seeds), and the troop plants them in
// the garden as you watch.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const FEAST = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bees: 1, bowls: 'done', tableware: 2, homeName: 2};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '水', '河', '猴子', '朋友', '桥', '同学', '棍子', '有', '没有', '鸟',
  '我', '要', '吃', '桌子', '家', '没关系', '谢谢', '不客气', '木头', '筷子', '红色', '黄色', '白色', '蓝色', '黑色'];
// A game in chapter 1, past the bowls and the chopsticks (area: more progress), standing at pos.
function game(pos, area = {}){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, areas: {1: {...FEAST, ...area}}, pos, w}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__sounds = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w + (o.quiet ? ', quiet' : ', said')); rec(w).lv = Math.max(rec(w).lv, 1); }");
  g.run("showPicked = async p => { __notes.push('card: ' + p.zh.replace(/ /g, '')); }");
  g.run("for (const k of ['tock', 'sprout', 'right', 'fanfare', 'bump']) SFX[k] = () => { __sounds.push(k); }");
  g.run("globalThis.__said = []; showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('') + (o.teach ? ' [' + o.teach + ']' : '')); }");   // (who says what)
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; gapQ = async o => { __said.push('gap: ' + o.t.join('') + ' (' + o.gap + ')'); return true; }");
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 2000 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
const face = (g, x, y, dir) => g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`);
const press = (g, x, y, dir) => { face(g, x, y, dir); return play(g, 'interact(...facing()).then(runEvents)'); };
const go = (g, place, x, y, dir = 'down') => g.run(`setPlace('${place}'); S.pos = {place: '${place}', x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); placeCharacters(); refreshMap()`);
const npc = (g, id) => get(g, `(n => n && [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === '${id}'))`);
const bubble = (g, id) => get(g, `((AREA.bubbles['${id}'] || []).find(b => matches(b.if)) || {}).show || null`);
const tasks = g => get(g, "getTasks().filter(t => /^melon/.test(t.id)).map(t => t.text)");
const reset = g => g.run('__said.length = 0; __notes.length = 0; __sounds.length = 0');
const GARDEN = [[3, 14], [7, 15], [12, 14], [11, 15], [3, 16], [10, 17]];   // some of its squares

test('once the hungry monkey has said what the feast still needs, the big monkey (who made the chopsticks) has a !: 我们要种子！', () => {
  assert.equal(bubble(game({place: 'homeGround', x: 15, y: 5, dir: 'up'}, {feast: 2}), 'big'), null, 'not while the hungry monkey has news');
  assert.equal(bubble(game({place: 'homeGround', x: 15, y: 5, dir: 'up'}, {tableware: 1}), 'big'), '!', '(his ! for the chopsticks)');
  const g = game({place: 'homeGround', x: 15, y: 5, dir: 'up'});
  assert.equal(bubble(g, 'big'), '!');
  assert.deepEqual(npc(g, 'big'), ['homeGround', 15, 4], 'by the school, as before');
  for (const [x, y] of GARDEN) assert.equal(g.run(`tileAt(${x}, ${y}).look`), 'grass', `open grass by the stream at ${x},${y}, till then`);
  const old = loadGame({save: {version: 31, started: true, areas: {1: {...FEAST, bowls: undefined, tableware: undefined}}, pos: {place: 'homeGround', x: 15, y: 5, dir: 'up'}}});
  assert.equal(bubble(old, 'big'), '!', 'and in a game whose tables were set out before the bowls came from the cave');
});

test('he wants seeds (种子), walks you down to the stream, and the troop marks out a garden there as you watch', async () => {
  const g = game({place: 'homeGround', x: 15, y: 5, dir: 'up'});
  await press(g, 15, 5, 'up');
  assert.deepEqual(get(g, '__said'), ['big: 我们要种子！ [种子]'], 'We want seeds!');
  const notes = get(g, '__notes').join(' | ');
  assert.match(notes, /card: 种子, quiet/, 'teaching 种子');
  assert.match(notes, /He wants to make a garden by the stream\. Come and see!/);
  assert.match(notes, /Wild fruit grows on the mountain, in places the troop has found\. Bring the big monkey its 种子 \(seeds\), and the troop will plant them here!/);
  assert.deepEqual([npc(g, 'big'), get(g, '[S.pos.x, S.pos.y, S.pos.dir]')], [['homeGround', 9, 13], [10, 13, 'left']], 'he’s walked you down to it, and stays by it');
  assert.deepEqual(get(g, '[here().garden, here().melonSeeds]'), [1, 'asked']);
  for (const [x, y] of GARDEN) assert.equal(g.run(`tileAt(${x}, ${y}).look`), 'gardenBed', `the garden’s beds, dug, at ${x},${y}`);
  assert.ok(get(g, '__sounds').filter(s => s === 'tock').length >= 4, 'its stakes hammered in');
  assert.equal(g.run('tileAt(13, 15).look'), 'sign', 'its sign');
  assert.equal(g.run('promptFor(13, 15)'), 'Read');
  assert.equal(bubble(g, 'big'), null);
  assert.deepEqual(tasks(g), ['Wild melons grow in a sunny field east off the south slope, but 鸟 (birds) keep pecking at them: shoo them away (0/5)']);
  assert.deepEqual(get(g, "getTasks().find(t => t.id === 'melonSeeds').target"), [16, 21], 'its arrow: the way south, to the south slope');
  reset(g);
  await press(g, 10, 13, 'left');
  assert.deepEqual(get(g, '__said'), ['big: 我们要种子！'], 'A at him again: he asks again');
});

test('east off the south slope, the troop has cleared the bushes: the melon field (瓜田), where birds peck at the wild melons', async () => {
  const before = game({place: 'southSlope', x: 22, y: 13, dir: 'right'});
  assert.equal(before.run('tileAt(23, 13).look'), 'bush', 'thick bushes, till the garden begins');
  const g = game({place: 'southSlope', x: 22, y: 13, dir: 'right'}, {garden: 1, melonSeeds: 'asked'});
  assert.deepEqual([g.run('tileAt(23, 13).look'), g.run('walkable(24, 14)')], ['path', true], 'cleared');
  g.run("S.pos = {place: PLACE, x: 24, y: 13, dir: 'right'}; placePlayer()");
  await play(g, 'arrive(25, 13).then(runEvents)');
  assert.deepEqual([g.run('PLACE'), get(g, '[S.pos.x, S.pos.y]')], ['melonField', [1, 9]]);
  assert.deepEqual(get(g, 'PLACES.melonField.name'), {zh: '瓜田', py: 'guātián', en: 'The melon field'});
  assert.deepEqual(get(g, "NPCS.filter(n => n.look === 'bird').map(n => [n.colour, n.x, n.y, tileAt(n.x, n.y).look])"),
    [['红色', 14, 4, 'melon'], ['黄色', 24, 5, 'melon'], ['蓝色', 16, 10, 'melon'], ['白色', 21, 11, 'melon'], ['黑色', 12, 15, 'melon']], 'five birds, each one colour, each on a melon');
  assert.equal(g.run('walkable(13, 11)'), false, 'you can’t walk through a melon');
  g.run("S.pos = {place: PLACE, x: 12, y: 11, dir: 'right'}; placePlayer()");
  assert.equal(g.run('promptFor(13, 11)'), 'Look');
  await press(g, 12, 11, 'right');
  assert.match(get(g, '__notes').join(' '), /Birds keep pecking at the melons! Shoo them all away first\./);
  await play(g, 'arrive(0, 9).then(runEvents)');
  assert.deepEqual([g.run('PLACE'), get(g, '[S.pos.x, S.pos.y]')], ['southSlope', [24, 13]], 'and back');
});

test('shoo the birds away: A at each shows it, such as 红色的鸟, and it flies off for good; then take a melon’s seeds (西瓜)', async () => {
  const g = game({place: 'melonField', x: 13, y: 4, dir: 'right'}, {garden: 1, melonSeeds: 'asked'});
  g.run("rec('种子').lv = 1");   // (the big monkey taught it as he asked)
  assert.equal(g.run('promptFor(14, 4)'), 'Shoo');
  await press(g, 13, 4, 'right');
  assert.deepEqual(get(g, '__notes'), ['card: 红色的鸟', 'Shoo! It flies off. (1/5)'], 'a red bird: said, as a bird that lands near you is');
  assert.deepEqual(get(g, '[here().shooed, npc("melonBird1")]'.replace('npc("melonBird1")', "ALL_NPCS.find(n => n.id === 'melonBird1').place")), [['melonBird1'], 'gone']);
  assert.equal(get(g, 'birds.filter(b => b.off).length'), 1, 'it flies off');
  assert.deepEqual(tasks(g), ['Wild melons grow in a sunny field east off the south slope, but 鸟 (birds) keep pecking at them: shoo them away (1/5)']);
  g.run("rec('黑色').lv = 0");   // (a colour you don't know yet: just 鸟, a bird of that colour)
  await press(g, 12, 14, 'down');
  assert.deepEqual(get(g, '__notes').slice(-2), ['card: 鸟, said', 'Shoo! It flies off. (2/5)']);
  for (const [x, y, d] of [[23, 5, 'right'], [16, 9, 'down']]) await press(g, x, y, d);
  reset(g);
  await press(g, 20, 11, 'right');
  assert.deepEqual(get(g, '__notes'), ['card: 白色的鸟', 'Shoo! It flies off. (5/5)']);
  assert.equal(get(g, "NPCS.filter(n => n.look === 'bird').length"), 0, 'all gone');
  assert.deepEqual(tasks(g), ['The 鸟 (birds) are gone, and the melons are safe: take some 种子 (seeds) from one, for the garden']);
  assert.equal(g.run('promptFor(13, 11)'), 'Pick');
  assert.ok(get(g, "tileAt(13, 11).onLook.find(p => !p.if || matches(p.if)).sparkle"), 'the melons sparkle');
  reset(g);
  await press(g, 12, 11, 'right');
  assert.deepEqual(get(g, '__notes'), ['card: 西瓜, said', 'You crack open a 西瓜 (watermelon) and eat some: sweet and juicy! You keep its black 种子 (seeds) for the big monkey’s garden.'],
    '西瓜, said straight away: you found it');
  assert.equal(get(g, 'here().holding.melonSeeds'), '种子');
  assert.deepEqual(tasks(g), ['Take the 种子 (seeds) to the big monkey, at the garden by the stream']);
  reset(g);
  await press(g, 12, 11, 'right');
  assert.deepEqual(get(g, '__notes'), ['Wild 西瓜 (watermelon), ripening in the sun.'], 'once you have them');
  const back = game({place: 'melonField', x: 13, y: 4, dir: 'right'}, {garden: 1, melonSeeds: 'asked', shooed: ['melonBird1', 'melonBird3']});
  assert.deepEqual(get(back, "NPCS.filter(n => n.look === 'bird').map(n => n.id)"), ['melonBird2', 'melonBird4', 'melonBird5'], 'the birds you’ve shooed stay away (the save’s shooed)');
});

test('give the big monkey the seeds: 种子！太好了！, you finish 这是西瓜的种子, and the troop plants them in the garden as you watch', async () => {
  const g = game({place: 'homeGround', x: 10, y: 13, dir: 'left'}, {garden: 1, melonSeeds: 'asked', holding: {melonSeeds: '种子'}, shooed: ['melonBird1', 'melonBird2', 'melonBird3', 'melonBird4', 'melonBird5']});
  g.run("rec('西瓜').lv = 1; rec('种子').lv = 1");
  assert.equal(bubble(g, 'big'), '?');
  await press(g, 10, 13, 'left');
  assert.deepEqual(get(g, '__said'), ['big: 种子！太好了！', 'gap: 这是西瓜的种子 (西瓜)', 'big: 谢谢你！', 'player: 不客气'], 'Seeds! Wonderful!, then These are watermelon seeds, its fruit missing');
  assert.deepEqual(get(g, '[here().melonSeeds, here().melonPlanted]'), ['done', 1]);
  for (const [x, y] of [[11, 14], [12, 14], [11, 15], [12, 15], [11, 17], [12, 17]]) assert.equal(g.run(`tileAt(${x}, ${y}).look`), 'gardenVines', `melon vines at ${x},${y}`);
  assert.equal(g.run('tileAt(3, 16).look'), 'gardenBed', 'the rest of the garden waits for other seeds');
  assert.ok(get(g, '__sounds').filter(s => s === 'sprout').length >= 6, 'each square comes up out of the ground in turn');
  assert.match(get(g, '__notes').join(' '), /The troop plants the 西瓜 \(watermelon\) seeds in the garden, and waters them from the stream\. Little vines come up at once: on Flower Fruit Mountain, everything grows fast!/);
  assert.deepEqual(tasks(g), []);
  assert.deepEqual(get(g, "areaChecklist().find(([t]) => /wild melons/.test(t))"), ['Bring the big monkey 种子 (seeds) from wild melons, for the garden', true, false, true]);
});

// Version 2: the cliffs (山崖), west off the hillside's second terrace, where wild grapes hang down a cliff over a ledge:
// out of reach from the top; hop down the right bank and pick them (葡萄); the big monkey's trellis for them.
const grapeTasks = g => get(g, "getTasks().filter(t => /^grape/.test(t.id)).map(t => t.text)");
test('once the garden begins, the troop clears the bushes west off the hillside’s second terrace: the cliffs (山崖)', async () => {
  const before = game({place: 'hillside', x: 2, y: 26, dir: 'left'});
  assert.deepEqual([before.run('tileAt(1, 26).look'), before.run('walkable(1, 26)')], ['bush', false], 'thick bushes, till the garden begins');
  const g = game({place: 'hillside', x: 2, y: 26, dir: 'left'}, {garden: 1, melonSeeds: 'asked', grapeSeeds: 'asked'});
  assert.deepEqual([g.run('tileAt(1, 26).look'), g.run('tileAt(0, 27).look')], ['path', 'path'], 'cleared');
  assert.deepEqual(grapeTasks(g), ['Wild grapes grow on the cliffs west off the hillside, halfway up: find a way down to them'], 'grapes in plain English, till you know them');
  g.run("S.pos = {place: PLACE, x: 1, y: 26, dir: 'left'}; placePlayer()");
  await play(g, 'arrive(0, 26).then(runEvents)');
  assert.deepEqual([g.run('PLACE'), get(g, '[S.pos.x, S.pos.y]')], ['cliffs', [24, 5]]);
  assert.deepEqual(get(g, 'PLACES.cliffs.name'), {zh: '山崖', py: 'shānyá', en: 'The cliffs'});
  assert.match(get(g, '__notes').join(' '), /Steep cliffs, one ledge below another\. Somewhere down here, wild grapes grow!/, 'the first time');
  assert.equal(get(g, 'here().cliffsSeen'), 1);
  assert.deepEqual(npc(g, 'cliffGoat'), ['cliffs', 16, 6], 'a goat at the top');
  await play(g, 'arrive(25, 5).then(runEvents)');
  assert.deepEqual([g.run('PLACE'), get(g, '[S.pos.x, S.pos.y]')], ['hillside', [1, 26]], 'and back');
});

test('the grapes hang down the cliff, out of reach from the top; hop down the bank beside them, and pick them: 葡萄', async () => {
  const g = game({place: 'cliffs', x: 15, y: 8, dir: 'down'}, {garden: 1, melonSeeds: 'asked', grapeSeeds: 'asked', cliffsSeen: 1});
  g.run("rec('种子').lv = 1");   // (the big monkey taught it as he asked)
  assert.deepEqual([g.run('tileAt(15, 9).look'), g.run('walkable(15, 9)'), g.run('promptFor(15, 9)')], ['grapeCliff', false, 'Look']);
  await press(g, 15, 8, 'down');
  assert.deepEqual(get(g, '__notes'), ['Grapes! They hang down the cliff below you, out of reach. Find a way down to them.'], 'no card: you can’t reach them');
  assert.equal(g.run("lvl('葡萄')"), 0);
  // two banks to hop down from the top (they can't be climbed): the one beside the grapes lands you under them; the other, on
  // a ledge with a boulder; rock between the ledges
  for (const x of [3, 4, 5, 11, 12]) assert.equal(g.run(`!!tileAt(${x}, 9).ledge && !!tileAt(${x}, 10).ledge`), true, `a bank at ${x}`);
  for (const y of [11, 16]) assert.equal(g.run(`walkable(9, ${y}) || walkable(18, ${y})`), false, 'rock between the ledges');
  assert.equal(g.run("tileAt(2, 13).look"), 'boulder');
  assert.equal(g.run('promptFor(15, 10)'), 'Pick');
  assert.ok(get(g, "tileAt(15, 10).onLook.find(p => !p.if || matches(p.if)).sparkle"), 'they sparkle');
  reset(g);
  await press(g, 15, 11, 'up');
  assert.deepEqual(get(g, '__notes'), ['card: 葡萄, said', 'You pick a bunch of 葡萄 (grapes) and eat some: sweet! You keep their little 种子 (seeds) for the big monkey’s garden.'],
    '葡萄, said straight away: you found them');
  assert.equal(get(g, 'here().holding.grapeSeeds'), '种子');
  assert.deepEqual(grapeTasks(g), ['Take the 种子 (seeds) from the wild 葡萄 (grapes) to the big monkey, at the garden by the stream']);
  reset(g);
  await press(g, 15, 11, 'up');
  assert.deepEqual(get(g, '__notes'), ['Wild 葡萄 (grapes), hanging down the cliff.'], 'once you have them');
});

test('the goat at the top of the cliffs: 你好！, then 水果在下面！', async () => {
  const g = game({place: 'cliffs', x: 17, y: 6, dir: 'left'}, {garden: 1, melonSeeds: 'asked', grapeSeeds: 'asked', cliffsSeen: 1});
  await press(g, 17, 6, 'left');
  assert.deepEqual(get(g, '__said'), ['cliffGoat: 你好！', 'player: 你好', 'cliffGoat: 水果在下面！'], 'The fruit is down below!');
  assert.match(get(g, '__notes').join(' '), /look before you hop!/);
});

test('give the big monkey the grape seeds: 这是葡萄的种子, and the troop sets up a trellis for them as you watch', async () => {
  const g = game({place: 'homeGround', x: 10, y: 13, dir: 'left'}, {garden: 1, melonSeeds: 'done', melonPlanted: 1, grapeSeeds: 'asked', holding: {grapeSeeds: '种子'}});
  g.run("rec('葡萄').lv = 1; rec('种子').lv = 1; rec('西瓜').lv = 1");
  assert.equal(bubble(g, 'big'), '?');
  for (const [x, y] of [[7, 14], [10, 15]]) assert.equal(g.run(`tileAt(${x}, ${y}).look`), 'gardenBed');
  await press(g, 10, 13, 'left');
  assert.deepEqual(get(g, '__said'), ['big: 种子！太好了！', 'gap: 这是葡萄的种子 (葡萄)', 'big: 谢谢你！', 'player: 不客气'], 'These are grape seeds, the grapes missing');
  assert.deepEqual(get(g, '[here().grapeSeeds, here().grapePlanted]'), ['done', 1]);
  for (const [x, y] of [[7, 14], [10, 14], [7, 15], [10, 15]]) assert.equal(g.run(`tileAt(${x}, ${y}).look`), 'trellis', `the trellis at ${x},${y}`);
  assert.deepEqual(get(g, "mapObjects().filter(o => o.look === 'trellis').map(o => [o.x, o.y, o.w, o.h])"), [[7, 14, 4, 2]], 'one trellis, four squares by two');
  assert.ok(get(g, '__sounds').filter(s => s === 'tock').length >= 3, 'set up a piece at a time');
  assert.match(get(g, '__notes').join(' '), /The troop plants the 葡萄 \(grapes\) seeds in the garden, with a trellis for them to climb\. Vines come up at once, and climb all over it!/);
  assert.equal(g.run('walkable(8, 14)'), false);
  assert.deepEqual(grapeTasks(g), []);
  assert.deepEqual(get(g, "areaChecklist().find(([t]) => /wild grapes/.test(t))"), ['Bring the big monkey 种子 (seeds) from wild grapes, for the garden', true, false, true]);
});

// Version 3: the hot spring valley (温泉谷), up the brook from the riverside: steam puffing across the narrow way between
// its big pools, two monkeys of the troop bathing in a warm one, and wild bananas (香蕉) in the warm corner at the top.
const bananaTasks = g => get(g, "getTasks().filter(t => /^banana/.test(t.id)).map(t => t.text)");
const SPRINGS = {garden: 1, melonSeeds: 'asked', grapeSeeds: 'asked', bananaSeeds: 'asked', springsSeen: 1};
test('once the garden begins, the troop clears the bushes beside the riverside’s brook: the way up it to the hot spring valley (温泉谷)', async () => {
  const before = game({place: 'riverside', x: 25, y: 2, dir: 'up'});
  assert.deepEqual([before.run('tileAt(25, 1).look'), before.run('walkable(25, 1)')], ['bush', false], 'thick bushes, till the garden begins');
  const g = game({place: 'riverside', x: 25, y: 2, dir: 'up'}, {...SPRINGS, springsSeen: 0});
  assert.deepEqual([g.run('tileAt(25, 0).look'), g.run('tileAt(26, 1).look')], ['path', 'path'], 'cleared');
  assert.deepEqual(bananaTasks(g), ['Wild bananas grow in a valley of hot springs, up the brook from the riverside']);
  g.run("S.pos = {place: PLACE, x: 25, y: 1, dir: 'up'}; placePlayer()");
  await play(g, 'arrive(25, 0).then(runEvents)');
  assert.deepEqual([g.run('PLACE'), get(g, '[S.pos.x, S.pos.y]')], ['hotSprings', [13, 22]]);
  assert.deepEqual(get(g, 'PLACES.hotSprings.name'), {zh: '温泉谷', py: 'wēnquán gǔ', en: 'The hot spring valley'});
  assert.match(get(g, '__notes').join(' '), /A warm, sheltered valley, full of steaming hot springs! Wild bananas grow at the top, past the steam\./, 'the first time');
  assert.deepEqual([npc(g, 'bather1'), npc(g, 'bather2')], [['hotSprings', 5, 17], ['hotSprings', 7, 17]], 'two monkeys bathing');
  assert.deepEqual([g.run('tileAt(6, 16).look'), g.run('walkable(6, 16)')], ['hotPool', false], 'in a warm pool');
  await play(g, 'arrive(13, 23).then(runEvents)');
  assert.deepEqual([g.run('PLACE'), get(g, '[S.pos.x, S.pos.y]')], ['riverside', [25, 1]], 'and back');
});

test('steam puffs out of the narrow way between the big pools, one row and then the other: too hot to step on, and it pushes you off', async () => {
  const g = game({place: 'hotSprings', x: 13, y: 10, dir: 'up'}, SPRINGS);
  for (const [x, y] of [[12, 10], [15, 10], [13, 8], [6, 15]]) assert.equal(g.run(`walkable(${x}, ${y})`), x === 13, `${x},${y}`);   // (pools either side)
  assert.deepEqual(get(g, '[0, 1000, 1400, 2900].map(t => puffing(13, 9, 300000 + t))'), [true, true, false, false], 'the first row: a second and a bit, every 3 seconds');
  assert.deepEqual(get(g, '[0, 1000, 1500, 2700].map(t => puffing(14, 11, 300000 + t))'), [false, false, true, true], 'the second, half a turn later');
  g.run("tryStep('up', 300000)");
  assert.deepEqual([get(g, 'pl.mv'), get(g, '__notes')], [null, ['Too hot! Wait for the steam to stop.']], 'too hot to step onto');
  g.run("tryStep('up', 301500)");
  assert.deepEqual(get(g, '[pl.mv.tx, pl.mv.ty]'), [13, 9], 'once it stops, on you go');
  const h = game({place: 'hotSprings', x: 13, y: 9, dir: 'up'}, SPRINGS);
  h.run("pl.from = {x: 13, y: 10}; update(300000)");
  assert.deepEqual([get(h, '[pl.mv.tx, pl.mv.ty]'), get(h, 'pl.dir'), get(h, '__notes')], [[13, 10], 'up', ['Too hot! The steam pushes you back.']], 'standing on it as it puffs: pushed back the way you came');
});

test('the monkeys bathing: 你好！; and the wild bananas at the top: 香蕉', async () => {
  const g = game({place: 'hotSprings', x: 5, y: 18, dir: 'up'}, SPRINGS);
  g.run("rec('种子').lv = 1");
  await press(g, 5, 18, 'up');
  assert.deepEqual(get(g, '__said'), ['bather1: 你好！', 'player: 你好']);
  assert.match(get(g, '__notes').join(' '), /soaking in the warm water up to its shoulders, eyes shut\. Bliss!/);
  assert.deepEqual(get(g, "mapObjects().filter(o => o.look === 'bananaPlant').map(o => [o.x, o.y, o.w, o.h])"),
    [[3, 3, 2, 2], [9, 3, 2, 2], [21, 3, 2, 2], [5, 6, 2, 2], [16, 6, 2, 2], [23, 6, 2, 2]], 'six banana plants, each two squares by two');
  assert.equal(g.run('promptFor(9, 4)'), 'Pick');
  reset(g);
  await press(g, 9, 5, 'up');
  assert.deepEqual(get(g, '__notes'), ['card: 香蕉, said', 'You climb up and pick a 香蕉 (banana). Wild ones are full of hard black 种子 (seeds): you eat round them, and keep them for the big monkey’s garden.'],
    '香蕉, said straight away: you found it');
  assert.equal(get(g, 'here().holding.bananaSeeds'), '种子');
  assert.deepEqual(bananaTasks(g), ['Take the 种子 (seeds) from the wild 香蕉 (banana) to the big monkey, at the garden by the stream']);
});

test('give the big monkey the banana seeds: 这是香蕉的种子, and two banana plants come up in the garden as you watch', async () => {
  const g = game({place: 'homeGround', x: 10, y: 13, dir: 'left'}, {...SPRINGS, melonSeeds: 'done', melonPlanted: 1, grapeSeeds: 'done', grapePlanted: 1, holding: {bananaSeeds: '种子'}});
  g.run("rec('香蕉').lv = 1; rec('种子').lv = 1");
  assert.equal(bubble(g, 'big'), '?');
  await press(g, 10, 13, 'left');
  assert.deepEqual(get(g, '__said'), ['big: 种子！太好了！', 'gap: 这是香蕉的种子 (香蕉)', 'big: 谢谢你！', 'player: 不客气'], 'These are banana seeds, the banana missing');
  assert.deepEqual(get(g, '[here().bananaSeeds, here().bananaPlanted]'), ['done', 1]);
  assert.deepEqual(get(g, "mapObjects().filter(o => o.look === 'bananaHome').map(o => [o.x, o.y, o.w, o.h])"), [[3, 14, 2, 2], [5, 14, 2, 2]], 'two banana plants, each two squares by two');
  assert.ok(get(g, '__sounds').filter(s => s === 'tock').length >= 6, 'each comes up in three steps');
  assert.match(get(g, '__notes').join(' '), /Two banana plants shoot up at once, their big leaves unfolding!/);
  assert.equal(g.run('tileAt(3, 16).look'), 'gardenBed', 'the bottom of the garden stays dug, waiting');
  assert.deepEqual(get(g, "areaChecklist().filter(([t]) => /from wild/.test(t)).map(([, done]) => done)"), [true, true, true], 'all three fruit, planted');
});
