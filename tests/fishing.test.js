// Chapter 1: a big fish for the feast, and fishing (js/fishing.js, decided 29 October 2026). With honey on its table, the
// hungry monkey wants a big fish: 我要吃大鱼！ (大 just for listening). The fishing monkey by the stream gives you a rod
// (鱼竿). A at the water casts your line: wait for a bite, press A, and reel it in by answering questions on words you know
// (one for a little fish, three in a row for a big one); a wrong answer, and it slips off the hook. Your first fish is
// tiny: 太小了！ teaches 小, and you let it go. Then a big one: 鱼很大！ teaches 大, and it's for the feast (这是大鱼), set out
// on a stone table of its own. After that, each catch asks which it is (这是小鱼); bait from the 老板 brings a big one.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const HONEY_IN = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, shop: 3, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bees: 11, beeFriends: 6, queenOut: true, honey: 'done', bowls: 'done', tableware: 2,
  cow: 9, milk: 'done', milkTable: 3, dairy: 5, garden: 1, melonSeeds: 'done', grapeSeeds: 'done', bananaSeeds: 'done', melonPlanted: 4, grapePlanted: 4, bananaPlanted: 4, fruitTable: 1};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '水', '河', '鱼', '鸟', '猴子', '朋友', '桥', '蝴蝶', '同学', '棍子', '蜜蜂', '蜂王', '蜂蜜',
  '有', '没有', '我', '要', '吃', '桌子', '家', '没关系', '谢谢', '不客气', '牛', '牛奶'];
// A game with honey on the feast's table (area: more progress; more: more of the save), standing at pos
function game(pos, area = {}, more = {}){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, areas: {1: {...HONEY_IN, ...area}}, pos, ...more, w: {...w, ...more.w}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__sounds = []; globalThis.__right = true; globalThis.__asked = 0");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w + (o.note ? ' (' + o.note + ')' : '')); rec(w).lv = Math.max(rec(w).lv || 0, 1); }");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + who.replace(/<[^>]*>/g, '') + html.replace(/<[^>]*>/g, '')); }; pictureQ = async () => { __asked++; return __right; }; closeCard = () => {}");
  g.run("for (const k of ['fanfare', 'splash', 'swish', 'tock', 'right', 'bump', 'blip']) SFX[k] = () => { __sounds.push(k); }");
  g.run("globalThis.__said = []; showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('') + (o.teach ? ' [' + o.teach + ']' : '')); }");
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; gapQ = async o => { __said.push('gap: ' + o.t.join('') + ' (' + o.gap + (o.wrong ? ' or ' + o.wrong.join(' ') : '') + ')'); return true; }");
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await tick(); g.flush(); }
  await p;
}
const face = (g, x, y, dir) => g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`);
const press = (g, x, y, dir) => { face(g, x, y, dir); return play(g, 'interact(...facing()).then(runEvents)'); };
// Fishing at the stream, standing on its bank at (23, 17): press A (hook: as soon as a fish bites, as a player does)
async function fish(g, {hook = true, stop = false} = {}){
  face(g, 23, 17, 'down');
  let done = false; const p = Promise.resolve(g.run('interact(...facing()).then(runEvents)')).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){
    await tick();
    if (stop && g.run('!!fishing && !fishing.bite')) g.run("fishPress('b')");
    if (hook && g.run('!!fishing && !!fishing.bite && !fishing.hooked')) g.run("fishPress('a')");
    g.flush();
  }
  await p;
}
const bubble = (g, id) => g.run(`(AREA.bubbles['${id}'].find(b => matches(b.if)) || {show: null}).show`);
const item = (g, re) => get(g, `areaChecklist().find(([t]) => ${re}.test(t)) || null`);

test('with honey on the feast’s table, the hungry monkey wants a big fish: 我要吃大鱼！, 大 just for listening', async () => {
  const g = game({place: 'homeGround', x: 20, y: 7, dir: 'left'}, {fish: 'not asked'});
  assert.equal(bubble(g, 'hungry'), '!', 'a ! over him');
  assert.match(g.run('goalText()'), /The hungry monkey has something to ask you/);
  assert.equal(bubble(g, 'fisher'), null, 'the fishing monkey has nothing for you yet');
  await press(g, 20, 7, 'left');
  assert.deepEqual(get(g, '__said'), ['hungry: 我们有蜂蜜了！', 'hungry: 我要吃大鱼！'], 'we have honey now; I want to eat a big fish!');
  assert.deepEqual([get(g, 'here().fish'), g.run("lvl('大')")], ['asked', 0], '大 isn’t taught: just for listening, till you catch one');
  assert.equal(bubble(g, 'fisher'), '!', 'the fishing monkey by the stream has a ! now');
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Ask the fishing monkey by the stream how to catch a big 鱼 (fish)']);
  assert.deepEqual(item(g, /big 鱼/).slice(0, 2), ['Catch a big 鱼 (fish) for the feast', false], 'on the checklist');
  const before = game({place: 'homeGround', x: 20, y: 7, dir: 'left'}, {bees: 10, honey: 'asked', fish: 'not asked'});
  assert.equal(before.run("AREA.bubbles.hungry.some(b => b.if.fish === 'not asked' && matches(b.if))"), false, 'not before the honey');
});

test('the fishing monkey gives you a rod (鱼竿): A at water where fish live fishes, and the bag has it, For fishing', async () => {
  const g = game({place: 'homeGround', x: 23, y: 17, dir: 'right'}, {fish: 'asked'});
  assert.deepEqual(get(g, "[ALL_NPCS.find(n => n.id === 'fisher')].map(n => [n.place, n.x, n.y])[0]"), ['homeGround', 24, 17], 'by the stream, fishing');
  assert.equal(g.run("PLAYS.fisher"), 'fish');
  face(g, 23, 17, 'down');
  assert.notEqual(g.run('promptFor(23, 18)'), 'Fish', 'no rod, no fishing');
  await press(g, 23, 17, 'right');
  assert.deepEqual(get(g, '__said'), ['fisher: 河里有鱼！', 'fisher: 这是鱼竿。 [鱼竿]'], 'there are fish in the river; this is a fishing rod');
  assert.ok(get(g, '__notes').some(n => /^card: 鱼竿/.test(n)), 'its card');
  assert.deepEqual([get(g, 'here().fishing'), g.run('canFish()')], [1, true]);
  face(g, 23, 17, 'down');
  assert.equal(g.run('promptFor(23, 18)'), 'Fish', 'A at the stream: Fish');
  assert.deepEqual(get(g, "BAG_TABS.find(t => t.id === 'fishing').things().map(t => t.w)"), ['鱼竿'], 'your rod, in the bag');
  assert.equal(bubble(g, 'fisher'), null);
  assert.deepEqual(get(g, 'getTasks().map(t => [t.text, t.target])'), [['Catch a big 鱼 (fish) for the feast: face the stream and press A', [22, 18]]], 'its arrow on the stream, by the fishing monkey');
  assert.ok(get(g, "AREA.legend.W.fishing && AREA.legend.O.fishing"), 'the river and the meadow’s pond have fish');
  assert.ok(!get(g, "!!PLACES.homeGround.legend.O.fishing"), 'not the home ground’s little pool: it has none');
});

test('your first fish is tiny: 太小了！ teaches 小, and you let it go', async () => {
  const g = game({place: 'homeGround', x: 23, y: 17, dir: 'down'}, {fish: 'asked', fishing: 1}, {w: {'鱼竿': {lv: 1, ok: 0}}});
  g.run('Math.random = () => 0');
  await fish(g);
  assert.equal(get(g, '__asked'), 1, 'one question to reel it in');
  assert.ok(get(g, '__notes').includes('box: You caught a fish! It’s tiny.'), 'what you’ve caught, with its picture');
  assert.deepEqual(get(g, '__said'), ['player: 太小了！ [小]'], 'you say it’s too small, teaching 小');
  assert.ok(get(g, '__notes').some(n => /^card: 小/.test(n)) && g.run("lvl('小')") >= 1, '小 (little)');
  assert.match(get(g, '__notes').join(' '), /You let the little fish go\. Cast again, for a bigger one!/);
  assert.deepEqual([g.run("lvl('大')"), get(g, 'here().holding.fish || null')], [0, null], 'nothing kept');
  assert.ok(['swish', 'splash', 'fanfare'].every(s => get(g, '__sounds').includes(s)), 'a swish as you cast, a splash as it bites, a fanfare as you land it');
});

test('a fish bites a little while after you cast: too slow, and it gets away; B stops; a wrong answer, and it slips off the hook', async () => {
  const g = game({place: 'homeGround', x: 23, y: 17, dir: 'down'}, {fish: 'asked', fishing: 1}, {w: {'鱼竿': {lv: 1, ok: 0}}});
  g.run('Math.random = () => 0');
  await fish(g, {hook: false});
  assert.match(get(g, '__notes').join(' '), /A bite! Press A!.*Too slow: it got away! Cast again\./);
  assert.deepEqual([get(g, '__asked'), g.run("lvl('小')"), g.run('fishing')], [0, 0, null], 'nothing caught, and your line is out of the water');
  g.run('__notes.length = 0');
  await fish(g, {hook: false, stop: true});
  assert.ok(get(g, '__notes').includes('You reel in your line.'), 'B reels your line back in');
  assert.ok(!get(g, '__notes').some(n => /bite/.test(n)));
  g.run('__notes.length = 0; __right = false');
  await fish(g);
  assert.match(get(g, '__notes').join(' '), /It slipped off the hook! Cast again\./);
  assert.equal(g.run("lvl('小')"), 0, 'no harm done: cast again');
  assert.equal(g.run('busy'), false);
});

test('once you know 小, a big one: three questions in a row to reel it in; 鱼很大！ teaches 大, and it’s for the feast', async () => {
  const g = game({place: 'homeGround', x: 23, y: 17, dir: 'down'}, {fish: 'asked', fishing: 1}, {w: {'鱼竿': {lv: 1, ok: 0}, '小': {lv: 1, ok: 0}}});
  g.run('Math.random = () => .99');
  await fish(g);
  assert.deepEqual([get(g, '__asked'), g.run("lvl('大')"), get(g, 'here().fishCasts')], [1, 0, 1], 'a little one again (each bite after you know 小, a big one is likelier)');
  g.run('Math.random = () => 0; __said.length = 0; __asked = 0');
  await fish(g);
  assert.equal(get(g, '__asked'), 3, 'three questions to reel it in');
  assert.ok(get(g, '__notes').includes('box: You caught a fish! It’s huge!'));
  assert.deepEqual(get(g, '__said'), ['player: 鱼很大！ [大]'], 'the fish is so big! (大)');
  assert.deepEqual([g.run("lvl('大') >= 1"), get(g, 'here().holding.fish'), get(g, 'here().fishCasts')], [true, '鱼', 0], 'you keep it, for the feast');
  assert.deepEqual(get(g, 'getTasks().map(t => [t.text, t.target])'), [['Take the big 鱼 (fish) to the hungry monkey', [19, 7]]]);
  assert.equal(bubble(g, 'hungry'), '?');
  // a wrong answer part-way through: it slips off the hook
  const h = game({place: 'homeGround', x: 23, y: 17, dir: 'down'}, {fish: 'asked', fishing: 1}, {w: {'鱼竿': {lv: 1, ok: 0}, '小': {lv: 1, ok: 0}}});
  h.run('Math.random = () => 0; pictureQ = async () => ++__asked < 3');
  await fish(h);
  assert.deepEqual([get(h, '__asked'), h.run("lvl('大')"), get(h, 'here().holding.fish || null')], [3, 0, null], 'two right, the third wrong: it got away');
});

test('the hungry monkey takes it (这是大鱼, 大 or 小), and it goes on a stone table of its own, at the end of the feast’s second: 我们有鱼了！', async () => {
  const g = game({place: 'homeGround', x: 20, y: 7, dir: 'left'}, {fish: 'asked', fishing: 1, holding: {fish: '鱼'}}, {w: {'鱼竿': {lv: 1, ok: 0}, '小': {lv: 1, ok: 0}, '大': {lv: 1, ok: 0}}});
  assert.equal(g.run('tileAt(24, 7).look'), 'grass');
  await press(g, 20, 7, 'left');
  assert.deepEqual(get(g, '__said'), ['hungry: 鱼！太好了！', 'gap: 这是大鱼 (大 or 小)', 'hungry: 谢谢你！', 'player: 不客气', 'hungry: 我们有鱼了！'],
    'a fish! you give it him, filling in 大 (小 the other answer); and once it’s on the table, we have fish now!');
  assert.deepEqual([get(g, 'here().fish'), get(g, 'here().fishTable'), g.run('tileAt(24, 7).look')], ['done', 1, 'fishTable']);
  assert.deepEqual(get(g, "mapObjects().filter(o => o.look === 'fishTable').map(o => [o.x, o.y])"), [[24, 7]]);
  assert.ok(get(g, '__sounds').filter(s => s === 'tock').length >= 2, 'set up as you watch: its stone, then the fish on its plate');
  assert.deepEqual(item(g, /big 鱼/).slice(0, 2), ['Catch a big 鱼 (fish) for the feast', true]);
  assert.ok(get(g, "AREA.feastList.foods.some(f => f.word === '鱼' && matches(f.have))"), 'the feast’s list: 我们有鱼。');
});

test('once you know 小 and 大, each catch asks which it is; later big ones are the troop’s supper, with shells', async () => {
  const both = {w: {'鱼竿': {lv: 1, ok: 0}, '小': {lv: 1, ok: 0}, '大': {lv: 1, ok: 0}}};
  const g = game({place: 'homeGround', x: 23, y: 17, dir: 'down'}, {fish: 'done', fishTable: 1, fishing: 1}, both);
  g.run('Math.random = () => .99');
  await fish(g);
  assert.deepEqual(get(g, '__said'), ['gap: 这是小鱼 (小 or 大)'], 'a little one: 这是小鱼, its picture over it');
  assert.match(get(g, '__notes').join(' '), /You let the little fish go\./);
  g.run('Math.random = () => 0; __said.length = 0');
  const shells = get(g, 'S.shells');
  await fish(g);
  assert.deepEqual(get(g, '__said'), ['gap: 这是大鱼 (大 or 小)']);
  assert.ok(get(g, 'S.shells') >= shells + 2 && /The troop has a big 鱼 \(fish\) for supper! \+2 🐚/.test(get(g, '__notes').join(' ')), 'shells for it');
});

test('bait from the 老板, once you have a rod: with some in your bag, a big fish bites next, and one is used', async () => {
  const both = {w: {'鱼竿': {lv: 1, ok: 0}, '小': {lv: 1, ok: 0}, '大': {lv: 1, ok: 0}}};
  const g = game({place: 'homeGround', x: 23, y: 17, dir: 'down'}, {fish: 'done', fishTable: 1, fishing: 1}, {...both, shells: 10});
  assert.ok(get(g, "forSale().some(i => i.item === '鱼饵')"), 'the 老板 sells bait');
  assert.ok(!get(game({place: 'homeGround', x: 7, y: 13, dir: 'left'}, {fish: 'asked', fishing: 0}), "forSale().some(i => i.item === '鱼饵')"), 'not before you have a rod');
  await play(g, "buy(forSale().find(i => i.item === '鱼饵'), '')");
  assert.deepEqual([get(g, "S.bag['鱼饵']"), get(g, 'S.shells')], [1, 8], 'two shells, into your bag');
  assert.ok(get(g, '__said').includes('gap: 我要鱼饵 (鱼饵)'), '我要鱼饵');
  assert.deepEqual(get(g, "BAG_TABS.find(t => t.id === 'fishing').things().map(t => [t.w, t.count || 1])"), [['鱼竿', 1], ['鱼饵', 1]]);
  g.run('Math.random = () => .99; __said.length = 0; __notes.length = 0');
  await fish(g);
  assert.deepEqual([get(g, "S.bag['鱼饵']"), get(g, '__said')], [0, ['gap: 这是大鱼 (大 or 小)']], 'the bait brings a big one, however unlikely');
  assert.match(get(g, '__notes').join(' '), /You put some 鱼饵 \(bait\) on your hook: a big one bites!/);
});
