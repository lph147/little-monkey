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

// Three shrimp for the feast (29 October 2026): with the fish on its table, the hungry monkey wants shrimp: 我要吃虾！ (虾
// just for listening). They live in the clear shallows of the riverside's brook, above the bridge (a legend's fishing names
// what lives there): a shrimp nibbles first, the float twitching once or twice; pull on a twitch, and it lets go. Then it
// bites, and one question reels it in. The first teaches 虾, each is counted, and he takes the three (这是虾, 虾 or 鱼);
// a bowl of them goes on the fish's table, and the feast's list has them.
const FISH_IN = {fish: 'done', fishing: 1, fishTable: 1};
// Fishing in the riverside's clear shallows, from the path beside them at (26, 4): press A at once on a nibble (too soon),
// or wait (hook: press A as soon as it bites)
async function shrimp(g, {tooSoon = false} = {}){
  face(g, 26, 4, 'right');
  let done = false; const p = Promise.resolve(g.run('interact(...facing()).then(runEvents)')).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){
    await tick();
    if (tooSoon && g.run('!!fishing && fishing.nibble')) g.run("fishPress('a')");
    if (g.run('!!fishing && !!fishing.bite && !fishing.hooked')) g.run("fishPress('a')");
    g.flush();
  }
  await p;
}

test('with the fish on its table, the hungry monkey wants shrimp: 我要吃虾！, 虾 just for listening', async () => {
  const g = game({place: 'homeGround', x: 20, y: 7, dir: 'left'}, FISH_IN);
  assert.equal(bubble(g, 'hungry'), '!', 'a ! over him');
  assert.match(g.run('goalText()'), /The hungry monkey has something to ask you/);
  await press(g, 20, 7, 'left');
  assert.deepEqual(get(g, '__said'), ['hungry: 我要吃虾！'], 'I want to eat shrimp!');
  assert.equal(get(g, 'here().shrimp'), 'asked');
  assert.equal(g.run("lvl('虾')"), 0, '虾 just for listening');
  assert.ok(get(g, '__notes').some(n => /wants three 虾 \(shrimp\) for the feast! Shrimp live in the clear shallows of the brook on the riverside/.test(n)));
  const task = get(g, "getTasks().find(t => /riverside/.test(t.text))");
  assert.equal(task.text, 'Catch three shrimp in the clear brook on the riverside, above the bridge (0/3)', 'a task (虾 in plain English till you catch one)');
  assert.ok(item(g, /shrimp/), 'on the checklist');
  const list = get(g, "AREA.feastList.foods.filter(f => !f.show || matches(f.show)).map(f => f.word)");
  assert.equal(list[list.indexOf('鱼') + 1], '虾', 'and on the feast’s list, after the fish: 我们没有虾');
  assert.ok(get(g, "AREA.feastList.foods.filter(f => !f.show || matches(f.show)).map(f => f.word)").includes('鱼'), 'the fish stays on it once it’s on the table');
});

test('shrimp live only in the riverside brook’s clear shallows: a shrimp nibbles first, and pulling on a twitch is too soon', async () => {
  const g = game({place: 'riverside', x: 26, y: 4, dir: 'right'}, {...FISH_IN, shrimp: 'asked'});
  assert.deepEqual(get(g, '[2, 3, 4, 5, 6].map(y => tileAt(27, y).look + tileAt(28, y).look)'), Array(5).fill('shallowsshallows'), 'the brook above the bridge');
  assert.equal(get(g, 'tileAt(27, 4).fishing'), 'shrimp', 'what lives in it');
  assert.equal(g.run('promptFor(27, 4)'), 'Fish');
  g.run('Math.random = () => .99');   // (two nibbles)
  await shrimp(g, {tooSoon: true});
  assert.ok(get(g, '__notes').includes('A nibble! Wait for the float to go right under…'), 'a nibble: the float twitches');
  assert.ok(get(g, '__notes').includes('Too soon! The shrimp let go. Wait for the float to go right under.'), 'pull on a twitch, and it lets go');
  assert.equal(get(g, '__asked'), 0, 'nothing to reel in');
  assert.equal(g.run("lvl('虾')"), 0);
  await shrimp(g);
  assert.equal(get(g, '__asked'), 1, 'wait for the bite: one question reels it in');
  assert.ok(get(g, '__notes').some(n => /You caught a shrimp!/.test(n)), 'a shrimp, never a fish, in the shallows');
  assert.ok(get(g, '__notes').includes('card: 虾 (A shrimp, from the clear shallows of the brook.)'), 'the first teaches 虾');
  assert.deepEqual(get(g, 'here().picked.shrimp.length'), 1);
  const big = game({place: 'homeGround', x: 23, y: 17, dir: 'down'}, {...FISH_IN, shrimp: 'asked'}, {w: {'小': {lv: 1, ok: 2}}});
  big.run('Math.random = () => .99');
  await fish(big);
  assert.ok(get(big, '__notes').some(n => /You caught a fish!/.test(n)) && !get(big, '__notes').some(n => /nibble/.test(n)), 'in the stream, fish, which don’t nibble');
});

test('three shrimp, counted; the hungry monkey takes them (这是虾, 虾 or 鱼), and a bowl of them goes on the fish’s table: 我们有虾了！', async () => {
  const g = game({place: 'riverside', x: 26, y: 4, dir: 'right'}, {...FISH_IN, shrimp: 'asked'}, {w: {'一': {lv: 1}, '二': {lv: 1}, '三': {lv: 1}}});
  g.run('Math.random = () => 0');
  for (let n = 0; n < 3; n++) await shrimp(g);
  assert.equal(get(g, 'here().holding.shrimp'), '虾', 'three: for the feast');
  assert.ok(get(g, '__notes').some(n => /^二 \(two\)! A 虾 \(shrimp\) for the feast \(2\/3\)\. Cast again!/.test(n)), 'each counted');
  assert.ok(get(g, '__notes').some(n => /^三 \(three\)! Three 虾 \(shrimp\)! Take them to the hungry monkey\./.test(n)));
  assert.equal(get(g, "getTasks().map(t => t.text).find(t => /hungry monkey/.test(t))"), 'Take the 虾 (shrimp) to the hungry monkey');
  g.run("enterPlace('homeGround')");
  assert.equal(bubble(g, 'hungry'), '?');
  await press(g, 20, 7, 'left');
  assert.deepEqual(get(g, '__said'), ['hungry: 虾！太好了！', 'gap: 这是虾 (虾 or 鱼)', 'hungry: 谢谢你！', 'player: 不客气', 'hungry: 我们有虾了！']);
  assert.deepEqual([get(g, 'here().shrimp'), get(g, 'here().shrimpTable'), g.run('tileAt(24, 7).look')], ['done', 1, 'fishTableShrimp'], 'a bowl of shrimp in front of the fish');
  assert.ok(item(g, /shrimp/)[1], 'ticked off');
  // and after that, each one you catch asks which it is, and you let it go
  g.run("enterPlace('riverside')"); g.run('__said.length = 0');
  await shrimp(g);
  assert.deepEqual(get(g, '__said'), ['gap: 这是虾 (虾 or 鱼)'], 'this is a shrimp');
  assert.ok(get(g, '__notes').includes('You let the 虾 (shrimp) go back into the water.'));
});

// After fishing, you can cast again at once (decided 29 October 2026, after playing it: A at the water rested for 2 seconds,
// as anything just finished with does, and pressing it seemed to do nothing); and no task arrow while you fish, nor over
// the water you're facing, where it hid the float.
test('cast after cast: the water you fish in doesn’t rest; and no arrow over your float', async () => {
  const g = game({place: 'riverside', x: 26, y: 4, dir: 'right'}, {...FISH_IN, shrimp: 'asked'});
  g.run('finished()');
  assert.equal(g.run('justFinished(27, 4)'), false, 'A at the water casts again straight away');
  g.run("S.pos = {place: PLACE, x: 26, y: 8, dir: 'right'}; placePlayer(); finished()");
  assert.equal(g.run('justFinished(27, 8)'), true, 'the bridge, beside it, rests as ever');
  face(g, 26, 4, 'right');
  const t = 'aimedTask()';
  assert.deepEqual(get(g, `${t}.target`).slice(0, 2), [27, 4], 'the task’s arrow is for the shallows');
  assert.equal(g.run(`arrowHidden(${t})`), true, 'not while you’re facing them');
  face(g, 26, 6, 'down');
  assert.equal(g.run(`arrowHidden(${t})`), false, 'turned away, it shows');
  g.run('fishing = {x: 27, y: 6, t0: 0, bite: null, nibble: false, hooked: false, press: null}');
  assert.equal(g.run(`arrowHidden(${t})`), true, 'and none while you fish');
});
