// The bag (包) and fruit (18 October 2026): a peach brings back 10 health, an apple takes away a wrong answer. Fruit trees
// fill your bag once the hungry monkey has eaten, and friends give fruit when you win their word games.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knows = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
const WORDS = knows(['石头', '山', '花', '草', '树', '水果', '桃子', '苹果', '河', '水', '松鼠', '山羊', '棍子']);
function game(save = {}){
  const g = loadGame({dom: true, save: {version: 25, started: true, w: WORDS, areas: {1: {elder: 2, hungry: 'done', thirsty: 'asked', gate: true, climb: 1}}, ...save}});
  g.run("mode = 'play'; placePlayer(); say = () => {}; toast = m => { globalThis.__said = m; }");
  return {g, run: code => g.run(code), sheet: g.el('#sheet'), get: expr => JSON.parse(g.run(`JSON.stringify(${expr})`))};
}

test('the bag shows your food (how many, and what it does), your stick, and what you’re carrying for someone', () => {
  const {run, sheet} = game({bag: {'桃子': 2, '苹果': 1}, areas: {1: {elder: 2, hungry: 'done', thirsty: 'asked', gate: true, climb: 1, holding: {thirsty: '水'}}}});
  run('openMenu()');
  sheet.querySelector('[data-m="bag"]').click();
  assert.deepEqual(sheet.querySelectorAll('.bagitem').map(b => b.dataset.w), ['桃子', '苹果', '棍子', '水']);
  const text = sheet.textContent;
  for (const s of ['×2', '×1', 'Brings back 10 health', 'Takes away a wrong answer', 'To fight with', 'For the thirsty monkey']) assert.ok(text.includes(s), `it says ${s}`);
  assert.equal(sheet.querySelector('.bagitem').dataset.label, 'Eat', 'A eats a peach');
});

test('tapping a peach when you’re hurt eats it, and 10 health comes back; with your health full it stays in the bag', () => {
  const {run, sheet, get} = game({health: 30, bag: {'桃子': 2}});
  run('bagPage(() => {})');
  assert.equal(sheet.querySelector('.stats .hpnum').textContent, '30/50', 'your health in the bag, with its number');
  run('bagPage(() => {})');
  sheet.querySelector('.bagitem[data-w="桃子"]').click();
  assert.equal(get('S.health'), 40);
  assert.equal(get("S.bag['桃子']"), 1);
  assert.match(sheet.textContent, /You eat a 桃子 \(peach\): \+10 health\./);
  assert.equal(sheet.querySelector('.stats .hpnum').textContent, '40/50');
  const full = game({health: 50, bag: {'桃子': 2}});
  full.run('bagPage(() => {})');
  full.sheet.querySelector('.bagitem[data-w="桃子"]').click();
  assert.equal(full.get("S.bag['桃子']"), 2, 'not eaten');
  assert.match(full.sheet.textContent, /Your health is full/);
});

test('an empty bag says where things come from', () => {
  const {run, sheet} = game({areas: {1: {elder: 2, hungry: 'asked', gate: false, climb: 0}}, w: knows(['石头'])});
  run('bagPage(() => {})');
  assert.equal(sheet.querySelectorAll('.bagitem').length, 0);
  assert.match(sheet.textContent, /Nothing in your bag yet/);
});

test('once the hungry monkey has eaten, a fruit tree gives you one for your bag each time you come, up to 3', () => {
  const {run, get} = game({pos: {place: 'meadow', x: 2, y: 6, dir: 'left'}});
  assert.equal(get('tileAt(1, 6).look'), 'peachTree');
  assert.equal(get('promptFor(1, 6)'), 'Pick');
  run('interact(1, 6)');
  assert.equal(get("S.bag['桃子']"), 1);
  run('interact(1, 6)');
  assert.equal(get("S.bag['桃子']"), 1, 'no more ripe ones on that tree, for now');
  assert.match(get('__said'), /Come back another time/);
  run("enterPlace('path'); enterPlace('meadow'); interact(1, 6); interact(1, 8)");
  assert.equal(get("S.bag['桃子']"), 3, 'come back, and they’re ripe again');
  run("enterPlace('path'); enterPlace('meadow'); interact(1, 6)");
  assert.equal(get("S.bag['桃子']"), 3, 'you can carry 3');
  assert.match(get('__said'), /Your bag has 3 桃子/);
});

test('a game that never learned 水果 (fruit), such as one past the meadow on 23 October 2026: A at a fruit tree just picks (its word is its fruit, since 24 October 2026; the hungry monkey teaches 水果)', async () => {
  const {run, get} = game({w: knows(['石头', '山', '花', '草', '树', '桃子', '苹果', '河', '水']), pos: {place: 'meadow', x: 2, y: 6, dir: 'left'}});
  run("globalThis.__cards = []; showNotice = async w => { __cards.push(w); setSeen(w); }");
  assert.equal(get('promptFor(1, 6)'), 'Pick');
  await run('interact(1, 6)');
  assert.deepEqual(get('__cards'), [], 'no card: you know 桃子');
  assert.equal(get("S.bag['桃子']"), 1, 'it fills your bag');
});

test('before the hungry monkey has eaten, the fruit trees are for him, not your bag', async () => {
  const {run, get} = game({pos: {place: 'meadow', x: 2, y: 6, dir: 'left'}, areas: {1: {elder: 2, hungry: 'not asked'}}});
  run('showNotice = async () => {}');
  assert.notEqual(get('promptFor(1, 6)'), 'Pick');
  await run('interact(1, 6)');
  assert.equal(get("S.bag['桃子'] || 0"), 0);
});

test('win a word game with the squirrel and it gives you a peach; the goat gives an apple; lose, and nothing', async () => {
  for (const [who, fruit] of [['squirrel', '桃子'], ['goat', '苹果']]) for (const won of [true, false]){
    const {run, get} = game();
    run(`showDialog = showNarration = async () => {}; confirmBox = async () => true; encounter = async () => ${won}; globalThis.__replied = null; replyWith = async w => { __replied = w; }`);
    await run(`runSteps(AREA.talk.${who}[0].do, '${who}')`);
    assert.equal(get(`S.bag['${fruit}'] || 0`), won ? 1 : 0, `${who}, ${won ? 'won' : 'lost'}`);
    assert.equal(get('__replied'), won ? '谢谢' : null, 'you say thank you for a present');
  }
});

test('a present for your bag when it’s full: they keep it for you, and your thanks waits till you come back with room (24 October 2026)', async () => {
  const {run, get} = game({bag: {'桃子': 3}, areas: {1: {elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, chapter: 1, trainee2: 1}}});
  run("globalThis.__narr = []; globalThis.__replied = []; globalThis.__games = 0; showDialog = async () => {}; showNarration = async (t, last) => { __narr.push([t, !!last]); }");
  run("confirmBox = async () => true; encounter = async () => { __games++; return true; }; replyWith = async w => { __replied.push(w); return true; }");
  const monkey = "ALL_NPCS.find(n => n.id === 'trainee2')";
  await run(`talk(${monkey})`);
  assert.deepEqual(get('__narr'), [['The monkey offers you a 桃子 (peach), but your bag is full. Come back for it when you have room.', true]], 'it offers you its peach, and that’s the end (Done)');
  assert.deepEqual(get('[__replied, S.bag, here().kept]'), [[], {'桃子': 3}, {trainee2: '桃子'}], 'no thanks yet: it keeps the peach for you');
  assert.equal(get(`keptFor(${monkey})`), null, 'no ! for it while there’s still no room');
  run('__narr = []');
  await run(`talk(${monkey})`);
  assert.deepEqual(get('[__narr, __replied, __games]'), [[['The monkey still has a 桃子 (peach) for you, but your bag is full. Come back for it when you have room.', true]], [], 1],
    'come back with no room: it still has it for you (and no new word game)');
  run("S.bag['桃子'] = 2; __narr = []");
  assert.ok(run(`hasNews(${monkey})`) && get(`keptFor(${monkey})`) === '桃子', 'eat one, and it has a ! for you');
  await run(`talk(${monkey})`);
  assert.deepEqual(get('[__narr, __replied, S.bag, here().kept, __games]'), [[['The monkey gives you a 桃子 (peach) for your bag.', false]], ['谢谢'], {'桃子': 3}, {}, 1],
    'it gives it to you now, and you thank it');
  assert.equal(get(`keptFor(${monkey})`), null);
  await run(`talk(${monkey})`);
  assert.equal(get('__games'), 2, 'then it plays a word game again');
});

test('a squirrel or goat’s present the same way, and a game saved before 24 October 2026 has no one keeping anything', async () => {
  const {run, get} = game({bag: {'苹果': 3}});
  run("globalThis.__narr = []; showDialog = async () => {}; showNarration = async t => { __narr.push(t); }; confirmBox = async () => true; encounter = async () => true; replyWith = async () => true");
  await run("talk(ALL_NPCS.find(n => n.id === 'goat'))");
  assert.deepEqual(get('[__narr, here().kept]'), [['The 山羊 (goat) offers you a 苹果 (apple), but your bag is full. Come back for it when you have room.'], {goat: '苹果'}]);
  const old = game();
  assert.deepEqual(old.get('here().kept'), {}, 'filled in for an old save');
});

test('the squirrel and the goat give their fruit the first time you win, then their games are just for practice, earning nothing (24 October 2026)', async () => {
  for (const [who, fruit, flag] of [['squirrel', '桃子', 'squirrelPlayed'], ['goat', '苹果', 'goatPlayed']]){
    const {run, get} = game();
    run("globalThis.__asks = []; globalThis.__games = []; globalThis.__win = false; showDialog = showNarration = async () => {}; replyWith = async () => true");
    run("confirmBox = async (who, text) => { __asks.push(text); return true; }; encounter = async foe => { __games.push(!!foe.practice); return __win; }");
    const npc = `ALL_NPCS.find(n => n.id === '${who}')`, bubble = () => get(`((AREA.bubbles.${who} || []).find(b => matches(b.if)) || {}).show || ''`);
    assert.equal(bubble(), '!', `${who}: a ! till it has played with you`);
    await run(`talk(${npc})`);
    assert.deepEqual([get(`here().${flag}`), get(`S.bag['${fruit}'] || 0`), bubble()], [1, 0, ''], `${who}: lost, no fruit, and its ! gone`);
    run('__win = true'); await run(`talk(${npc})`);
    assert.deepEqual([get(`here().${flag}`), get(`S.bag['${fruit}'] || 0`)], [2, 1], `${who}: won, its fruit`);
    await run(`talk(${npc})`);
    assert.deepEqual([get(`S.bag['${fruit}'] || 0`), get('__games'), bubble()], [1, [false, false, true], ''], `${who}: then just for practice`);
    assert.match(get('__asks.at(-1)'), /just for practice\?$/);
  }
});
