// The durian (榴莲), a stinky snack (the polish plan, agreed 8 November 2026): one to pick from the tree in the hot spring
// valley's warm corner each time you come, and the 老板 sells them once you've found it. Eat one from your bag, and for two
// minutes out on the map no wild creature jumps out: the first that would have sniffs the air and runs off. The first time,
// your monkey says 太臭了！, teaching 臭 (smelly). Friends and story battles aren't affected.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knows = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
const WORDS = knows(['石头', '山', '花', '草', '树', '水果', '桃子', '苹果', '河', '水', '鱼', '棍子', '蛇', '香蕉']);
const SPRINGS = {place: 'hotSprings', x: 13, y: 4, dir: 'up'};   // on the path below the durian tree, facing it
function game(save = {}, area = 1){
  const g = loadGame({dom: true, save: {version: 37, started: true, w: WORDS, areas: {1: {elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, chapter: 1, shop: 3, garden: 3, springsSeen: 1}}, ...save}});
  g.run("mode = 'play'; placePlayer(); say = () => {}; globalThis.__said = []; toast = m => { __said.push(m); }");
  g.run("globalThis.__lines = []; showDialog = async (who, line) => { __lines.push(line.t.join('')); }; showNotice = async w => { setSeen(w); }");
  const play = async code => {   // runs code in the game and waits for it, letting its timers run (such as munching)
    let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
    for (let i = 0; i < 600 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
    await p;
  };
  return {g, run: code => g.run(code), play, sheet: g.el('#sheet'), get: expr => JSON.parse(g.run(`JSON.stringify(${expr})`))};
}

test('the durian tree in the hot spring valley: A looks first, teaching 榴莲, then picks one for your bag, one each time you come, up to 2', async () => {
  const {run, play, get} = game({pos: SPRINGS});
  assert.equal(get('tileAt(13, 3).look'), 'durianTree');
  assert.equal(get('promptFor(13, 3)'), 'Look', 'its word first');
  run('interact(13, 3)');
  assert.ok(get("lvl('榴莲')") >= 1, 'looking at it teaches 榴莲');
  assert.equal(get("S.bag['榴莲'] || 0"), 0, 'and picks nothing yet');
  assert.equal(get('promptFor(13, 3)'), 'Pick');
  await play('interact(13, 3)');
  assert.equal(get("S.bag['榴莲']"), 1);
  assert.ok(get('__said').some(m => /twist a 榴莲 \(durian\) off its branch/.test(m)), 'you reach up and pick it');
  await play('interact(13, 3)');
  assert.equal(get("S.bag['榴莲']"), 1, 'one each time you come');
  assert.ok(get('__said').some(m => /picked its ripe one/.test(m)));
  await play("enterPlace('riverside'); enterPlace('hotSprings'); interact(13, 3)");
  await play("enterPlace('riverside'); enterPlace('hotSprings'); interact(13, 3)");
  assert.equal(get("S.bag['榴莲']"), 2, 'you can carry 2');
  assert.ok(get('__said').some(m => /Your bag has 2 榴莲/.test(m)));
});

test('eating one from your bag: you munch it on the map; the first time, 太臭了！ teaches 臭; then the durian and the time left by your health', async () => {
  const {run, play, get, sheet, g} = game({bag: {'榴莲': 2}, w: {...WORDS, ...knows(['榴莲'])}});
  run('bagPage(() => {})');
  const item = sheet.querySelector('.bagitem[data-w="榴莲"]');
  assert.equal(item.dataset.label, 'Eat');
  assert.match(sheet.textContent, /Keeps wild creatures away for 2 minutes/);
  run("globalThis.__munch = false; SFX.scuffle = () => { if (pl.eating && pl.eating.w === '榴莲') __munch = true; }");
  sheet.querySelector('.bagitem[data-w="榴莲"]').click();
  await play('0'); for (let i = 0; i < 50 && run('busy'); i++) await play('0');
  assert.equal(get('__munch'), true, 'you munch it, as a meal');
  assert.ok(run('!!modal.hidden'), 'the bag closes: you eat it out on the map');
  assert.deepEqual(get('__lines'), ['太臭了！'], 'your monkey says how smelly it is');
  assert.ok(get("lvl('臭')") >= 1, 'teaching 臭');
  assert.equal(get("S.bag['榴莲']"), 1);
  assert.equal(get('isStinky()'), true);
  assert.ok(get('__said').some(m => /keep away from the smell for two minutes/.test(m)));
  const hud = g.el('#hud');
  assert.equal(hud.hidden, false, 'shown even with your health full');
  assert.match(hud.innerHTML, /class="smell"/);
  assert.match(hud.innerHTML, /2:00/);
  assert.doesNotMatch(hud.innerHTML, /hpbar/, 'no health bar while you’re not hurt');
  run('bagPage(() => {})');
  sheet.querySelector('.bagitem[data-w="榴莲"]').click();
  assert.match(sheet.textContent, /You still smell of the 榴莲/, 'one at a time');
  assert.equal(get("S.bag['榴莲']"), 1);
});

test('the second time, no line and no new word: just the smell', async () => {
  const {run, play, get, sheet} = game({bag: {'榴莲': 1}, w: {...WORDS, ...knows(['榴莲', '臭'])}});
  run('bagPage(() => {})');
  sheet.querySelector('.bagitem[data-w="榴莲"]').click();
  await play('0'); for (let i = 0; i < 50 && run('busy'); i++) await play('0');
  assert.deepEqual(get('__lines'), []);
  assert.equal(get('isStinky()'), true);
});

test('while you smell of it, no wild creature jumps out: the first that would have sniffs the air and runs off, then none', async () => {
  const {run, play, get} = game();
  run("globalThis.__fights = 0; wildBattle = async () => { __fights++; return 'ran'; }; Math.random = () => 0");
  run("globalThis.__flee = []; const sf = sniffAndFlee; sniffAndFlee = async id => { __flee.push(id); return sf(id); }");
  run("stinkUp('榴莲', 120)");
  for (let i = 0; i < 20; i++) await play('wildStep(AREA.legend.n)');
  assert.equal(get('__fights'), 0, 'no battles');
  assert.deepEqual(get('__flee'), ['snake'], 'one sniffs and runs off, the first time');
  assert.match(get('__said').find(m => /sniffs the air/.test(m)), /The 蛇 \(snake\) sniffs the air, and slithers off!/);
  assert.equal(get('foe'), null, 'and it’s gone');
  run('stinkLeft = 0');
  for (let i = 0; i < 6; i++) await play('wildStep(AREA.legend.n)');
  assert.equal(get('__fights'), 1, 'once it’s worn off, they jump out again');
});

test('a story battle still happens, and friends still come out to play', async () => {
  const {run, get} = game();
  run("stinkUp('榴莲', 120); globalThis.__fought = null; battle = async id => { __fought = id; return 'won'; }");
  await run("STEPS.battle({battle: 'bear'})");
  assert.equal(get('__fought'), 'bear', 'the battle step isn’t a wild creature');
  assert.equal(get("typeof rustleAhead"), 'function');   // (friends in the grass: rustleAhead in js/world.js, which the smell doesn't touch)
});

test('the time counts down only while you’re free on the map, and it wears off with a message', () => {
  const {run, get, g} = game();
  run("stinkUp('榴莲', 120)");
  const tick = (ms, n = 1) => { for (let i = 0; i < n; i++) run(`tickStink(__t += ${ms})`); };
  run('globalThis.__t = 1000; tickStink(__t)');
  tick(250, 40);
  assert.equal(get('Math.round(stinkLeft / 1000)'), 110, 'ten seconds on the map');
  run('modal.hidden = false');
  tick(250, 40);
  assert.equal(get('Math.round(stinkLeft / 1000)'), 110, 'none while a card is open (such as a battle)');
  run('modal.hidden = true');
  assert.match(g.el('#hud').innerHTML, /1:50/);
  tick(250, 440);
  assert.equal(get('isStinky()'), false);
  assert.ok(get('__said').some(m => /The smell of the 榴莲 \(durian\) wears off/.test(m)));
  assert.equal(g.el('#hud').hidden, true, 'and the durian goes from the top of the screen');
});

test('a green cloud of smell round you on the map while it lasts', () => {
  const {run} = game();
  run("globalThis.__stink = 0; const ds = drawStink; drawStink = (...a) => { __stink++; return ds(...a); }");
  run('drawWorld(performance.now())');
  assert.equal(run('__stink'), 0);
  run("stinkUp('榴莲', 120); drawWorld(performance.now())");
  assert.equal(run('__stink'), 1);
});

test('the 老板 sells durians, 3 shells, once you’ve found the tree', () => {
  const sells = w => { const {get} = game({w}); return get("forSale().map(i => i.item + ' ' + i.price)").filter(s => s.startsWith('榴莲')); };
  assert.deepEqual(sells(WORDS), [], 'not before you know 榴莲');
  assert.deepEqual(sells({...WORDS, ...knows(['榴莲'])}), ['榴莲 3']);
});

test('one you brought to the human world works the same there', () => {
  const g = loadGame({save: {version: 37, started: true, area: 2, w: WORDS}});
  assert.deepEqual(JSON.parse(g.run("JSON.stringify([FOOD['榴莲'].stink, FOOD['榴莲'].carry])")), [120, 2]);
  assert.equal(g.run("AREA.lines.tooSmelly.zh"), '太 臭 了 ！');
});

test('the night market: at night the bun stall sells stinky tofu, 臭豆腐, and calls it out; by day, just buns; it does what a durian does', () => {
  const g = loadGame({save: {version: 37, started: true, area: 2, w: {...WORDS, ...knows(['买', '多少钱', '包子'])}}});   // (多少钱: the bun stall's ! waits for it, since 9 November 2026)
  const sells = () => JSON.parse(g.run("JSON.stringify(forSale(SHOPS.buns).map(i => i.item + ' ' + i.price))"));
  g.run('S.clock.t = DAY_MS * .3');
  assert.deepEqual(sells(), ['包子 2'], 'by day, just buns');
  assert.equal(g.run("callLine(AREA.characters.find(n => n.id === 'bunSeller'))"), 'callBuns');
  g.run('S.clock.t = DAY_MS * NIGHT + 1');
  assert.deepEqual(sells(), ['包子 2', '臭豆腐 2'], 'at night, stinky tofu too');
  assert.equal(g.run("callLine(AREA.characters.find(n => n.id === 'bunSeller'))"), 'callTofu', 'and the stallholder calls it out');
  assert.equal(g.run("AREA.lines.callTofu.zh"), '臭豆腐 ！ 臭豆腐 ！');
  assert.equal(g.run("JSON.stringify(AREA.bubbles.bunSeller.find(b => matches(b.if)))"), JSON.stringify({if: {night: true, knows: '多少钱', new: '臭豆腐'}, show: '!'}), 'a ! over the stall, while it’s new');
  assert.deepEqual(JSON.parse(g.run("JSON.stringify([FOOD['臭豆腐'].stink, FOOD['臭豆腐'].carry, FOOD['臭豆腐'].eaten.length])")), [120, 2, 2], 'two minutes, two in your bag, and 太臭了！ the first time you eat something smelly');
  assert.ok(g.run("!!PICTURES['臭豆腐'] && MADE['臭豆腐'].parts.length === 2"), 'its picture, and how it’s made: 臭 smelly + 豆腐 tofu');
});
