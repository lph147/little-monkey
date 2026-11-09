// Treasures and trading (js/trade.js; decided 9 November 2026, the trade plan, built as one batch): the old monkey's tip, the
// treasures and where they are, the 老板 buying them (卖), the shop's tiers, tools and things for the cave (words caught only
// by buying them), the Ready to sail? card, and the human world: 多少钱, the money changer, and home in chapter 2.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const base = loadGame();
const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
const AREA = get(base, 'AREA'), BANK = get(base, 'WORD_BANK'), VERSION = base.run('SAVE_VERSION');
const know = ws => Object.fromEntries(ws.map(w => [w, {lv: 1, due: 0, ok: 0}]));
// chapter 1, the shop open at the home ground, and you've shopped there (买)
const shopOpen = more => ({chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, story: true, home: 2, build: 2, school: 2, shop: 4, holding: {}, bought: [], done: false, ...more});
const play = (save = {}, opts = {}) => loadGame({...opts, save: {version: VERSION, started: true, ...save}});
const quiet = game => game.run("showNotice = async w => { if (lvl(w) === 0) setSeen(w); }; showDialog = showPicked = infoBox = showNarration = async () => {}; replyWith = async () => true; toast = () => {}; gapQ = async () => true; catchQ = async () => true; pickUpAct = async () => {}; STEPS.hit = async () => {}; countMoney = async () => {};");

test('the words: the treasures and the things you can only buy have pages of their own, and 买 is Flower Fruit Mountain’s', () => {
  const treasures = Object.keys(BANK).filter(w => BANK[w].category === 'treasures'), shop = Object.keys(BANK).filter(w => BANK[w].category === 'shop');
  assert.deepEqual(treasures.sort(), ['人参', '松子', '玉', '珍珠', '羽毛', '金子'].sort());
  assert.deepEqual(shop.sort(), ['画', '灯笼', '篮子', '花瓶', '鱼缸', '鼓', '铲子', '风铃'].sort());
  for (const w of [...treasures, ...shop, '买', '卖']) assert.equal(BANK[w].area, 1, `${w} is caught on Flower Fruit Mountain`);
  assert.equal(BANK['多少钱'].area, 2, 'the town’s fruit seller teaches 多少钱 now');
  for (const w of shop) assert.ok(AREA.shop.items.some(i => i.item === w && (i.tool || i.decor)), `${w} is sold by the 老板, the only way to catch it`);
});

test('the old monkey tells you about the treasures once you’ve shopped, before you come across the first', () => {
  const bubble = save => play(save).run("matches(AREA.bubbles.elder.find(x => x.if.trade === 0).if)");   // (his ! for it)
  assert.equal(bubble({areas: {1: shopOpen()}, w: know(['老板', '头带'])}), false, 'not before you know 买');
  assert.equal(bubble({areas: {1: shopOpen()}, w: know(['老板', '头带', '买'])}), true, 'his tip');
  assert.equal(bubble({areas: {1: shopOpen({trade: 1})}, w: know(['老板', '头带', '买'])}), false, 'once told');
  assert.ok(AREA.talk.elder.findIndex(p => p.if && p.if.trade === 0) < AREA.talk.elder.findIndex(p => p.if && p.if.school && p.do.some(s => s.lesson)), 'before his lessons');
  // and till then, no treasure is out
  const game = play({areas: {1: shopOpen()}, w: know(['老板', '头带', '买'])});
  assert.equal(game.run("TREASURE_SPOTS.filter(spotNow).length"), 0, 'no treasure before his tip');
  const told = play({areas: {1: shopOpen({trade: 1})}, w: know(['老板', '头带', '买'])});
  assert.ok(told.run("TREASURE_SPOTS.filter(sp => sp.w === '松子' && spotNow(sp)).length") === 3, 'the pine cones, after it');
});

test('every treasure spot is on ground you can reach, in a place of the area, with its own picture', () => {
  for (const [w, t] of Object.entries(AREA.treasures)){
    assert.ok(t.price > 0 && t.note && t.clue && t.sell && t.sellEn && (t.look || t.spots.every(s => s[3] && s[3].look)), `${w} says its price, note, clue and how you sell it`);
    assert.ok(t.sell.split(' ').every(x => BANK[x]), `${w}: every word of its sell sentence is in the word bank`);
    for (const s of t.spots) assert.ok(AREA.places[s[2]], `${w}: ${s[2]} is a place`);
  }
  const icons = get(base, 'Object.keys(MAP_ICONS)');
  for (const k of ['cone', 'featherRed', 'featherYellow', 'featherBlue', 'clam', 'clamShut', 'jadeRock', 'ginseng', 'goldFleck', 'lantern', 'vase', 'chime', 'drum', 'painting', 'fishJar', 'fishJarFish']) assert.ok(icons.includes(k), `${k} has a picture on the map`);
});

test('a pine cone: pick it up, and its pine nuts go in your bag (the first, a new word); the spot gives one a day', async () => {
  const game = play({areas: {1: shopOpen({trade: 1})}, w: know(['老板', '头带', '买']), clock: {t: 0, n: 3, turn0: 0, friends0: [], caught: []}, pos: {place: 'pineWood', x: 19, y: 21, dir: 'down'}});
  quiet(game);
  assert.equal(game.run('promptFor(19, 22)'), 'Pick up');
  await game.run("thingAct(19, 22)");
  assert.equal(game.run("S.bag['松子']"), 1);
  assert.equal(game.run("lvl('松子') >= 0"), true);
  assert.equal(game.run("promptFor(19, 22)"), '', 'none left there today');
  game.run('S.clock.n = 4');
  assert.equal(game.run('promptFor(19, 22)'), 'Pick up', 'and another the next day');
});

test('the rarer treasures: pearls only at night, ginseng only with a spade, jade in its rock, gold after heavy rain', () => {
  const at = (pos, more = {}) => play({areas: {1: shopOpen({trade: 1})}, w: know(['老板', '头带', '买', '雨']), pos: {dir: 'down', ...pos}, ...more});
  const day = {clock: {t: 0, n: 3, turn0: 0, friends0: [], caught: []}};
  const night = {clock: {t: 20 * 60000 * .8, n: 3, turn0: 0, friends0: [], caught: []}};
  assert.equal(at({place: 'shore', x: 16, y: 11}, day).run('promptFor(16, 12)'), 'Look', 'a clam by day, shut');
  assert.equal(at({place: 'shore', x: 16, y: 11}, night).run('promptFor(16, 12)'), 'Open', 'open at night');
  assert.equal(at({place: 'darkPines', x: 8, y: 10}, day).run('promptFor(8, 9)'), 'Look', 'ginseng, without a spade');
  assert.equal(at({place: 'darkPines', x: 8, y: 10}, {...day, tools: ['铲子']}).run('promptFor(8, 9)'), 'Dig', 'with one');
  const jade = at({place: 'hotSprings', x: 8, y: 13}, day);
  assert.equal(jade.run('promptFor(8, 14)'), 'Hit');
  assert.equal(jade.run('walkable(8, 14)'), false, 'a rock with jade in it is in the way');
  // gold: only on a day of heavy rain, once it's begun
  const n = Number(base.run("[...Array(60).keys()].find(n => n > 0 && heavyDay(n))"));
  const wet = {clock: {t: 20 * 60000 * .7, n, turn0: 0, friends0: [], caught: []}}, dry = {clock: {t: 20 * 60000 * .7, n: Number(base.run("[...Array(60).keys()].find(n => n > 0 && !heavyDay(n))")), turn0: 0, friends0: [], caught: []}};
  assert.equal(at({place: 'hillside', x: 7, y: 36}, wet).run('promptFor(7, 37)'), 'Scoop', 'gold after heavy rain');
  assert.notEqual(at({place: 'hillside', x: 7, y: 36}, dry).run('promptFor(7, 37)'), 'Scoop', 'not on a day without');
});

test('the first sale: the 老板 sees your pine nuts, teaches 卖, buys one and counts the shells into your paw; then his Sell tab', async () => {
  const save = {areas: {1: shopOpen({trade: 1})}, w: know(['老板', '头带', '买', '一', '二', '谢谢']), bag: {'松子': 2}, shells: 0};
  const bubble = play(save).run("(AREA.bubbles.boss.find(x => matches(x.if)) || {show: ''}).show");
  assert.equal(bubble, '!', 'he has a ! for your pine nuts');
  const game = play(save, {dom: true});
  quiet(game);
  game.run("runSteps(AREA.talk.boss.find(p => p.if && p.if.trade === 1 && p.if.inBag).do, 'boss').then(() => { globalThis.__done = true; })");
  for (let i = 0; i < 50 && !game.run('globalThis.__done'); i++){ game.flush(); await new Promise(r => setImmediate(r)); }
  assert.equal(game.run('globalThis.__done'), true);
  assert.equal(game.run("S.areas[1].trade"), 2);
  assert.equal(game.run("S.bag['松子']"), 1, 'one sold');
  assert.equal(game.run('S.shells'), 2, 'for 2 shells');
  assert.equal(game.run("canSell(SHOPS.shop)"), true, 'his shop has a Sell tab now');
  // and the shop sells tools and things for the cave from now on
  const names = get(game, "forSale(SHOPS.shop).map(i => i.item)");
  for (const w of ['篮子', '灯笼', '铲子', '花瓶', '风铃', '鼓', '画', '鱼缸']) assert.ok(names.includes(w), `${w} for sale`);
});

test('a word you can only buy is caught only once you buy it: not when you can’t afford it', async () => {
  const game = play({areas: {1: shopOpen({trade: 2})}, w: know(['老板', '头带', '买', '卖']), shells: 3});
  game.run("showDialog = infoBox = replyWith = async () => {}; toast = () => {}; gapQ = async () => true;");
  const vase = "SHOPS.shop.items.find(i => i.item === '花瓶')";
  assert.equal(await game.run(`buy(${vase}, '')`), false);
  assert.equal(game.run("lvl('花瓶')"), 0, 'not caught: too few shells');
  game.run("S.shells = 20; showNotice = async w => setSeen(w)");
  assert.equal(await game.run(`buy(${vase}, '')`), true);
  assert.ok(game.run("lvl('花瓶')") >= 1, 'caught as you buy it');
  assert.deepEqual(get(game, 'S.decorNew'), ['花瓶'], 'waiting to be set up in the cave');
  assert.equal(game.run("matches({decorWaiting: true})"), true);
});

test('what you buy for the cave is set up there as you watch; the drum and the fish jar are in the way', async () => {
  const game = play({areas: {1: shopOpen({trade: 2})}, w: know(['鼓', '花瓶']), decorNew: ['鼓', '花瓶'], pos: {place: 'cave', x: 11, y: 5, dir: 'right'}}, {dom: true});
  quiet(game);
  game.run("STEPS.decorate({by: 'player', line: 'lovely'}).then(() => { globalThis.__done = true; })");
  for (let i = 0; i < 50 && !game.run('globalThis.__done'); i++){ game.flush(); await new Promise(r => setImmediate(r)); }
  assert.deepEqual(get(game, 'S.decor').sort(), ['花瓶', '鼓'].sort());
  assert.deepEqual(get(game, 'S.decorNew'), []);
  assert.equal(game.run('walkable(12, 4)'), false, 'the drum is in the way');
  assert.equal(game.run('promptFor(12, 4)'), 'Beat');
});

test('snacks in tiers: the best one for what you’ve lost; grapes help three questions; the basket carries two more', () => {
  const game = play({areas: {1: shopOpen()}, bag: {'桃子': 1, '香蕉': 1, '西瓜': 1}, health: 40, maxHealth: 50});
  assert.equal(game.run('healFood()'), '桃子', 'a peach is enough for 10');
  game.run('S.health = 30');
  assert.equal(game.run('healFood()'), '香蕉', 'a banana for 20');
  game.run('S.health = 5');
  assert.equal(game.run('healFood()'), '西瓜', 'the watermelon for the most');
  assert.equal(game.run("carryOf('桃子')"), 3);
  game.run("S.tools.push('篮子')");
  assert.equal(game.run("carryOf('桃子')"), 5, 'two more with the basket');
  assert.equal(get(base, "FOOD['葡萄'].helps"), 3);
});

test('the Ready to sail? card: Not yet, and the raft waits while the troop goes home', async () => {
  const save = {areas: {1: shopOpen({raft: 2, feastHeld: 1, exam: 1})}, pos: {place: 'shore', x: 11, y: 12, dir: 'down'}};
  const where = (game, id) => game.run(`(NPCS.find(n => n.id === '${id}') || {}).place || PLACE`);
  const game = play(save, {dom: true});
  game.run("toast = () => {}; readyCard = async () => STOP;");
  const raft = "PLACES.shore.legend['Ф'].onLook.find(p => p.if.raft === 2).do";
  game.run(`runSteps(${raft}).then(() => { globalThis.__done = true; })`);
  for (let i = 0; i < 20 && !game.run('globalThis.__done'); i++){ game.flush(); await new Promise(r => setImmediate(r)); }
  assert.equal(game.run('S.areas[1].raftWait'), 1);
  assert.equal(game.run('S.areas[1].raft'), 2, 'you haven’t sailed');
  assert.equal(game.run("NPCS.some(n => n.id === 'elder')"), false, 'the old monkey has gone home');
});

test('a version 38 save gets the shop’s tools and things for the cave, empty', () => {
  const game = loadGame({save: {version: 38, started: true, areas: {1: shopOpen()}}});
  const s = get(game, 'S');
  assert.equal(s.version, VERSION);
  assert.deepEqual([s.tools, s.decor, s.decorNew, s.jarFish], [[], [], [], false]);
  assert.ok(game.storage.get('xiaohouzi-v2-backup-v38'), 'a copy of the old save is kept');
});

// The human world
const AREA2 = {version: VERSION, area: 2, started: true};
test('the human world: 多少钱 at the fruit stall; the money changer buys treasures; the 老板 at home', () => {
  const game = loadGame({save: {...AREA2, w: know(['买'])}});
  const A2 = get(game, 'AREA');
  assert.ok(A2.talk.fruitSeller.some(p => p.if && (p.if.new === '多少钱' || (p.if.any || []).some(c => c.new === '多少钱')) && p.do.some(s => s.reply === '多少钱')), 'the fruit seller teaches 多少钱');
  assert.ok(A2.shops.changer.sells && A2.talk.changer.some(p => p.do.some(s => s.sell)), 'the money changer buys treasures');
  assert.ok(A2.shops.home.items.filter(i => i.tool || i.decor).length === 8, 'the 老板 at home sells every word you can only buy');
  assert.ok(A2.characters.some(c => c.id === 'boss' && c.moves.some(m => m.if.homeAgain === 0 && m.place === 'hut')), 'he’s only home once the demon is beaten');
});

test('the 老板 at home has a ? only for what he sells, not for the town’s shoes', () => {
  const save = coins => ({...AREA2, coins, w: know(['买', '钱', '多少钱', '包子', '鞋']), areas: {2: {chapter: 2, homeAgain: 1}}});
  const poor = loadGame({save: save(5)});
  assert.equal(poor.run('canBuy()'), true, 'with 5 coins you could buy shoes in the town');
  assert.equal(poor.run("matches({canBuy:'home'})"), false, 'but nothing of his: his cheapest is the vase, 6');
  assert.equal(loadGame({save: save(6)}).run("matches({canBuy:'home'})"), true, 'with 6, the vase');
  assert.ok(get(poor, 'AREA').bubbles.boss.some(b => b.if.canBuy === 'home' && b.show === '?'), 'his ? asks about his own shop');
});

test('at home in the human world’s chapter 2: Flower Fruit Mountain’s treasure spots, and its animals you missed', () => {
  const game = loadGame({save: {...AREA2, areas: {2: {chapter: 2}, 1: {finds: {'t:玉:0': 1}}}}});
  const spots = get(game, "TREASURE_SPOTS.map(sp => sp.key + '@' + sp.place)");
  assert.ok(spots.includes('t:松子:0@ffmPineWood') && spots.includes('t:玉:1@ffmCliffs'), 'the spots are in the borrowed places');
  assert.equal(game.run("spotNow(TREASURE_SPOTS.find(sp => sp.key === 't:玉:0'))"), null, 'one found on Flower Fruit Mountain stays found');
  const past = get(game, "ANIMALS.filter(a => a.past).map(a => a.id)");
  for (const id of ['squirrel', 'fox', 'deer', 'owl']) assert.ok(past.includes(id), `${id} is at home too`);
  for (const id of ['bee', 'goat', 'bat']) assert.ok(!past.includes(id), `${id} isn’t (many, it leaves its spot, or sleeps somewhere else)`);
  assert.ok(get(game, "ANIMALS.find(a => a.id === 'squirrel').at")[2] === 'ffmMeadow', 'each at its spot, in the place here');
});
