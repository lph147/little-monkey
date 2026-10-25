// Chapter 1: the queen bee (the bees' step 4, 25 October 2026). Once the six bees in their valley are your friends and the
// swarm has flown aside, A at the old hollow tree brings the queen bee (蜂王) out: her card (said straight away, as you meet
// her), 你要什么？, and you say 我们要蜂蜜！. To win her over you play her big word game: six questions, two of them
// sentences with a word missing; three wrong, and she buzzes back into her tree, to try again. Win, and she and her swarm
// follow you home, where they fly to the wildflowers below the cliff (where their hive will be), and the hungry monkey has a
// ! to see them: 我们有蜜蜂了！
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const SIX_BEES = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bees: 3, beeFriends: 6};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '水', '河', '猴子', '朋友', '桥', '蝴蝶', '同学', '棍子', '蜜蜂', '有', '没有', '我', '要', '没关系'];
// A game where all six bees are your friends (area: more progress; more: more of the save), standing at pos
function game(pos, area = {}, more = {}){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 30, started: true, met: ['butterfly', 'bee'], friends: ['butterfly', 'bee'], areas: {1: {...SIX_BEES, ...area}}, pos, ...more, w: {...w, ...more.w}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__sounds = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w + (o.note ? ' (' + o.note + ')' : '') + (o.quiet ? ', quiet' : ', said')); rec(w).lv = Math.max(rec(w).lv || 0, 1); }");
  g.run("for (const k of ['buzz', 'fanfare']) SFX[k] = () => { __sounds.push(k); }; confirmBox = async (who, text) => { __notes.push('ask: ' + text); return true; }");
  g.run("globalThis.__said = []; showDialog = async (who, line) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");   // (who says what)
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
// Her word game, won or not (the questions themselves: the last tests here): what it was asked to be, in __foe
const herGame = (g, won) => g.run(`encounter = async foe => { globalThis.__foe = {...foe, img: !!foe.img}; if (${won} && !S.friends.includes(foe.id)) S.friends.push(foe.id); return ${won}; }`);
const queen = g => get(g, "(n => n && [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === 'queen'))");

test('once the six bees are your friends, A at the old tree brings the queen bee out: her card, said straight away; 你要什么？; you say 我们要蜂蜜！; then her big word game', async () => {
  const g = game({place: 'flowerValley', x: 26, y: 6, dir: 'up'});
  assert.deepEqual(get(g, 'getTasks().map(t => [t.text, t.target])'), [['Find out who lives in the old hollow 树 (tree), up in the bees’ valley', [25, 5]]], 'the task points at the old tree');
  assert.equal(g.run("NPCS.some(n => n.id === 'queen')"), false, 'she’s inside her tree');
  herGame(g, true);
  await press(g, 26, 6, 'up');
  assert.equal(get(g, '__notes')[0], 'card: 蜂王 (The queen bee buzzes out of her old tree, her little crown glinting!), said', 'her card: met, so her word is said straight away');
  assert.deepEqual(get(g, "MADE['蜂王'].parts.map(p => p[0] + ' ' + p[2])"), ['蜂 bee', '王 king'], 'how it’s made: the bees’ king, their queen');
  assert.deepEqual(get(g, '__said'), ['queen: 你要什么？', 'player: 我们要蜂蜜！', 'queen: 好！我们去你家吧！'], 'what she asks, what you want, and, won over, she’s coming');
  assert.match(get(g, '__notes').join(' '), /ask: Play a word game with the 蜂王 \(queen bee\) to win her over\? Six questions: three wrong, and she flies back into her tree\./);
  assert.deepEqual(get(g, '[__foe.id, __foe.hz, __foe.questions, __foe.misses, __foe.gaps, __foe.justTaught, __foe.img]'), ['queen', '蜂王', 6, 3, 2, true, true],
    'six questions, three wrong ends it, two sentences; and as you’ve just met her, no English on her name plate');
  assert.deepEqual(get(g, 'speaker("queen").match(/spk-zh">([^<]*) <span class="spk-py">([^<]*)/).slice(1)'), ['蜂王', 'fēngwáng'], 'called by her word, as an animal is');
  assert.equal(g.run("creatureWord('queen')"), '蜂王', 'with her picture, her word’s');
  assert.deepEqual(get(g, '[here().bees, S.following]'), [5, ['queen', 'beeSwarm']], 'won over: she and her swarm follow you');
  assert.deepEqual(get(g, 'FOLLOWERS.map(n => [n.id, n.place, n.flies])'), [['queen', 'flowerValley', true], ['beeSwarm', 'flowerValley', true]], 'flying, in line behind you');
  assert.deepEqual(get(g, '__sounds'), ['buzz', 'buzz']);
  assert.match(get(g, '__notes').join(' '), /The queen bee and her swarm follow you! Lead them home, back along the riverside\./);
  assert.ok(get(g, 'S.friends').includes('queen') && g.run("FRIEND_NAMES.queen") === '蜂王', 'and she’s your friend: 蜂王 in your Friends list');
  assert.deepEqual(item(g, /Win over/), ['Win over the 蜂王 (queen bee) with her word game', true, false, true], 'ticked off');
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Lead the 蜂王 (queen bee) and her bees home, back along the riverside']);
  await press(g, 26, 6, 'up');
  assert.match(get(g, '__notes').join(' '), /The old hollow tree is quiet now: the queen bee and her bees have gone with you\./);
});

test('get three wrong in her game and she buzzes back into her tree; A at the tree brings her out again, without her card', async () => {
  const g = game({place: 'flowerValley', x: 26, y: 6, dir: 'up'});
  herGame(g, false);
  await press(g, 26, 6, 'up');
  assert.deepEqual(get(g, '[here().bees, here().queenOut, S.following]'), [4, false, []], 'you’ve met her, but she’s back in her tree');
  assert.equal(queen(g)[0], 'gone');
  assert.equal(g.run("__foe.lose"), 'The {蜂王} buzzes back into her old tree. Press A at the tree to try again!');
  assert.deepEqual(get(g, 'getTasks().map(t => [t.text, t.target])'), [['Win over the 蜂王 (queen bee) with her word game, at her old tree', [25, 5]]]);
  g.run('__notes.length = 0; __said.length = 0');
  await press(g, 26, 6, 'up');
  assert.ok(!get(g, '__notes').some(n => n.startsWith('card:')), 'no card: you know her now');
  assert.deepEqual(get(g, '__said'), ['queen: 你要什么？', 'player: 我们要蜂蜜！'], 'she asks again, and you say it again');
  assert.equal(g.run('__foe.justTaught'), false, 'her English is on her name plate now');
  assert.deepEqual(queen(g), ['gone', 0, 0], 'lost again: back in the tree');
});

test('say Not now to her game, and she waits for you, hovering in front of her tree with a !', async () => {
  const g = game({place: 'flowerValley', x: 26, y: 6, dir: 'up'});
  herGame(g, true);
  g.run("confirmBox = async () => false");
  await press(g, 26, 6, 'up');
  assert.deepEqual(get(g, '[here().bees, here().queenOut]'), [4, true]);
  assert.deepEqual(queen(g), ['flowerValley', 25, 5], 'in front of her old tree');
  assert.ok(g.run("NPCS.some(n => n.id === 'queen')"));
  assert.equal(g.run("AREA.bubbles.queen.find(b => matches(b.if)).show"), '!');
  g.run('confirmBox = async () => true; __said.length = 0');
  await press(g, 25, 6, 'up');   // (A at her, right in front of you)
  assert.deepEqual(get(g, '[__said, here().bees]'), [['queen: 你要什么？', 'player: 我们要蜂蜜！', 'queen: 好！我们去你家吧！'], 5]);
});

test('she and her swarm follow you home: at the home ground they fly to the wildflowers below the cliff, the quest is done, and the hungry monkey has a ! to see them', async () => {
  const g = game({place: 'riverside', x: 1, y: 7, dir: 'left'}, {bees: 5, queenOut: true}, {following: ['queen', 'beeSwarm'], w: {'蜂王': {lv: 1, ok: 0}}});
  assert.deepEqual(get(g, 'FOLLOWERS.map(n => [n.id, n.place])'), [['queen', 'riverside'], ['beeSwarm', 'riverside']], 'still with you after closing the game');
  await play(g, 'arrive(0, 7).then(runEvents)');
  assert.deepEqual(get(g, '[PLACE, here().bees, S.following]'), ['homeGround', 6, []], 'home: they stop following you');
  assert.deepEqual(queen(g), ['homeGround', 27, 6]);
  assert.deepEqual(get(g, "(n => [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === 'beeSwarm'))"), ['homeGround', 28, 6], 'by the wildflowers, where their hive will be');
  assert.deepEqual(get(g, '__sounds'), ['buzz', 'fanfare']);
  assert.match(get(g, '__notes').join(' '), /The queen bee and her swarm fly over to the wildflowers by the cliff\. The bees are home! Go and tell the hungry monkey\./);
  assert.deepEqual(item(g, /Lead the/), ['Lead the 蜂王 (queen bee) and her bees home', true, false, true], 'the quest: done');
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Tell the hungry monkey the 蜜蜂 (bees) are home']);
  assert.equal(g.run("AREA.bubbles.hungry.find(b => matches(b.if)).show"), '!');
  await press(g, 27, 7, 'up');
  assert.deepEqual(get(g, '__said'), ['queen: 这里有花！'], 'the queen likes it here');
  g.run('__notes.length = 0; __said.length = 0');
  await press(g, 20, 7, 'left');   // (he's by the big table)
  assert.deepEqual(get(g, '__said'), ['hungry: 我们有蜜蜂了！']);
  assert.match(get(g, '__notes').join(' '), /The bees need a home: the troop is going to build them a hive, by the wildflowers\. Go and see!/);
  assert.equal(get(g, 'here().bees'), 7);
  assert.equal(g.run("(AREA.bubbles.hungry.find(b => matches(b.if)) || {show: ''}).show"), '', 'his ! has gone');
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Talk to the 蜂王 (queen bee) by the wildflowers'], 'next, the hive (tests/hive.test.js)');
});

test('the queen and her swarm fly: they hover, and tall flowers never hide them as they follow you', () => {
  const g = game({place: 'flowerValley', x: 15, y: 11, dir: 'right'}, {bees: 5, queenOut: true}, {following: ['queen', 'beeSwarm']});
  assert.deepEqual(get(g, "['queen', 'beeSwarm'].map(id => ALL_NPCS.find(n => n.id === id).flies)"), [true, true]);
  assert.equal(g.run('tileAt(15, 11).look'), 'tallFlowers');
  assert.equal(g.run('MAP_SPRITES["蜂王"].faces'), 'left', 'her map sprite, side on, like a bee’s');
  g.run('drawWorld(performance.now())');   // (drawn without trouble, hovering)
});

// Her word game itself (encounter, js/quiz.js), with the questions answered as script says (true: right) and any
// sentences from the area's requests
function bigGame(script){
  const g = game({place: 'flowerValley', x: 25, y: 6, dir: 'up'}, {bees: 4, queenOut: true});
  g.run(`globalThis.__heads = []; globalThis.__asked = []; globalThis.__sentences = []; globalThis.__end = '';
    const answers = ${JSON.stringify(script)};
    pictureQ = o => { __heads.push(o.head); __asked.push('word: ' + o.word); return Promise.resolve(answers[__asked.length - 1]); };
    gapRound = async b => { __asked.push('sentence: ' + b.t.join('')); return {right: answers[__asked.length - 1], shells: 0}; };
    const ps = practiceSentence; practiceSentence = not => { __sentences.push([...not]); return ps(not); };
    infoBox = async (head, html) => { __end = html; };
    globalThis.__won = encounter({id: 'queen', hz: '蜂王', img: '', wild: false, questions: 6, misses: 3, gaps: 2, lose: 'The {蜂王} buzzes back into her old tree.'});`);
  return g;
}

test('her game: six questions, two of them sentences with a word missing (the third and the last, each a different one); a heart for each right answer, and three ✕ for wrong ones', async () => {
  const g = bigGame([true, false, true, true, false, true]);
  assert.equal(await g.run('__won'), true, 'two wrong: you win her over');
  const asked = get(g, '__asked');
  assert.equal(asked.length, 6);
  assert.deepEqual(asked.map(a => a.split(':')[0]), ['word', 'word', 'sentence', 'word', 'word', 'sentence']);
  assert.notEqual(asked[2], asked[5], 'two different sentences');
  assert.deepEqual(get(g, '__sentences.map(s => s.length)'), [0, 1], 'the second leaves out the first');
  assert.ok(!asked.includes('word: 蜂王'), 'never her own name');
  const heads = get(g, '__heads');
  assert.match(heads[0], /Question 1 of 6/);
  assert.equal((heads[0].match(/class="heart( on)?"/g) || []).length, 6, 'six hearts');
  assert.equal((heads[0].match(/class="miss( on)?"/g) || []).length, 3, 'three ✕, grey till used');
  assert.equal((heads[0].match(/class="miss on"/g) || []).length, 0);
  assert.equal((heads[2].match(/class="miss on"/g) || []).length, 1, 'one wrong so far');
  assert.equal((heads[2].match(/class="heart on"/g) || []).length, 2, 'and two right');
  assert.match(get(g, '__end'), /New friend.*The 蜂王 \(queen bee\) is now your 朋友 \(friend\)!/);
});

test('her game ends as soon as you get three wrong: she buzzes back into her tree', async () => {
  const g = bigGame([false, true, false, false, true, true]);
  assert.equal(await g.run('__won'), false);
  assert.deepEqual(get(g, '__asked').map(a => a.split(':')[0]), ['word', 'word', 'sentence', 'word'], 'over at the fourth question: the third wrong answer');
  assert.match(get(g, '__end'), /3 wrong.*The 蜂王 \(queen bee\) buzzes back into her old tree\. Those words will come back soon\./);
});

test('an animal’s questions are still three, two right to make friends, with no ✕', async () => {
  const g = game({place: 'flowerValley', x: 25, y: 6, dir: 'up'}, {bees: 4});
  g.run(`globalThis.__heads = []; pictureQ = o => { __heads.push(o.head); return Promise.resolve(__heads.length !== 1); }; infoBox = async () => {};
    gapRound = async () => ({right: true, shells: 0}); globalThis.__won = encounter({id: 'bee', hz: '蜜蜂', img: '', wild: true});`);
  assert.equal(await g.run('__won'), true, 'one wrong, two right: friends');
  const heads = get(g, '__heads');
  assert.ok(heads.length >= 2 && heads.length <= 3);
  assert.match(heads[0], /Question 1 of 3/);
  assert.equal((heads[0].match(/class="heart( on)?"/g) || []).length, 3);
  assert.ok(!heads[0].includes('class="miss'), 'no ✕: an animal’s game doesn’t end early');
});
