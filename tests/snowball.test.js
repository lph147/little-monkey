// Snowball fights (decided 7 November 2026, from the owner's idea: "you throw the snowball and a correct answer it hits
// and wrong is a miss, same with the other person throwing at you"): in the winter of the master's year, a pupil, and on
// the trip down to the fishing village, two children, challenge you, first to three hits (js/snowball.js). You throw: a
// word question, right and it hits; they throw: hear a word and pick it to duck, wrong and it hits you. Played here with
// the real question cards, answered as a player would.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const tick = () => new Promise(r => setImmediate(r));
const WORDS = ['石头', '山', '花', '草', '树', '桃子', '水', '鱼', '狗', '猫', '鸡', '船', '门', '房子', '桶', '雪', '钱'];
function fight(pos = {place: 'cave', x: 14, y: 13, dir: 'up'}){
  const game = loadGame({dom: true, save: {version: 36, started: true, area: 2, shells: 0, coins: 0, met: [], friends: [],
    w: Object.fromEntries(WORDS.map(w => [w, {lv: 2, ok: 2}])),
    areas: {1: {chapter: 1, raft: 3, done: true}, 2: {landed: 1, dressed: 2, back: 1, child: 3, years: 1, boat: 2, song: 1, chapter: 1, woodFetch: 4, sky: 1,
      door: 2, caveSeen: 1, teacher: 1, named: 1, season: 3, fire: 2, class4: 1}}, pos}});
  game.run("mode = 'play'; save = () => {}; say = () => {}; globalThis.__qs = []; const q = pictureQ; pictureQ = o => { __qs.push(o); return q(o); }");
  game.run("globalThis.__notes = []; toast = t => { __notes.push(t); }; showNarration = async t => { __notes.push(t); }");
  game.run('placePlayer()');
  const sheet = game.el('#sheet');
  const flush = async () => { for (let i = 0; i < 20; i++){ await tick(); game.flush(); } };
  const last = () => game.run('__qs[__qs.length - 1]');
  // answer the question that's open, rightly or wrongly, and see what happened before pressing Next
  const answer = async right => {
    const i = game.run('__qs[__qs.length - 1].answerIdx'), opts = sheet.querySelectorAll('.opt');
    (right ? sheet.querySelector(`.opt[data-i="${i}"]`) : opts.find(o => +o.dataset.i !== i)).click();
    const seen = {scene: sheet.querySelector('.scene').className, feedback: sheet.querySelector('.feedback').textContent};
    sheet.querySelector('[data-a=next]').click(); await flush();
    return seen;
  };
  return {game, sheet, flush, last, answer, run: code => game.run(code)};
}

test('right answers: every snowball of yours hits, you duck every one of theirs, and you win three to none', async () => {
  const g = fight();
  const turn0 = g.run('S.turn || 0');
  g.run('globalThis.__r = null; snowballFight("pupil4").then(r => { __r = r; })'); await g.flush();
  assert.match(g.sheet.textContent, /Your throw!/);
  assert.match(g.sheet.querySelector('.sfplate.them').textContent, /师弟/, 'who you’re fighting, on their plate');
  const first = await g.answer(true);
  assert.match(first.scene, /throwYou/); assert.match(first.scene, /hitThem/);
  assert.match(first.feedback, /Your snowball hits!/);
  // their throw: hear a word and pick it to duck
  assert.equal(g.last().type, 'listen');
  assert.match(g.sheet.textContent, /They throw a snowball at you!/);
  assert.equal(g.sheet.querySelector('.sfplate.them .sbs').getAttribute('aria-label'), 'Snowballs that hit them: 1', 'one hit so far');
  const duck = await g.answer(true);
  assert.match(duck.scene, /throwThem/); assert.match(duck.scene, /missed/);
  assert.match(duck.feedback, /You duck!/);
  for (const right of [true, true, true]) await g.answer(right);   // yours, theirs, yours: the third hit
  assert.match(g.sheet.textContent, /You win!/);
  assert.match(g.sheet.querySelector('.scene').className, /won/);
  g.sheet.querySelector('[data-a=ok]').click(); await g.flush();
  assert.equal(g.run('__r'), true);
  assert.equal(g.run('__qs.length'), 5, 'three throws of yours and two of theirs');
  assert.equal(g.run('S.turn') - turn0, 5, 'every answer counts as practice');
});

test('wrong answers: your snowballs fly past, theirs hit you, and they win', async () => {
  const g = fight();
  g.run('globalThis.__r = null; snowballFight("pupil4").then(r => { __r = r; })'); await g.flush();
  const miss = await g.answer(false);
  assert.match(miss.scene, /throwYou/); assert.match(miss.scene, /missed/);
  assert.match(miss.feedback, /It flies past/);
  const hit = await g.answer(false);
  assert.match(hit.scene, /hitYou/);
  assert.match(hit.feedback, /It hits you!/);
  for (let i = 0; i < 4; i++) await g.answer(false);
  assert.match(g.sheet.textContent, /They win!/);
  assert.match(g.sheet.textContent, /play again whenever you like/, 'nothing to lose but the game');
  g.sheet.querySelector('[data-a=ok]').click(); await g.flush();
  assert.equal(g.run('__r'), false);
  assert.equal(g.run('__qs.length'), 6);
});

test('ducking: you hear a word you know with a picture, among words that don’t sound alike', async () => {
  const g = fight();
  g.run('snowballFight("pupil4")'); await g.flush();
  await g.answer(true);
  const q = g.last();
  const words = q.options.map(o => o.match(/<span class="cap">([^<]*)<\/span>/)[1]);
  assert.equal(words[q.answerIdx], q.word);
  for (const w of words) assert.ok(g.run(`lvl('${w}') >= 1 && !!WORDS['${w}'].pic`), `${w}: a word you know, with a picture`);
  const bare = new Set(words.map(w => g.run(`toneless('${w}')`)));
  assert.equal(bare.size, words.length, 'no two sound alike');
});

test('in the cave it’s the snowy courtyard; out in the human world, snowy fields and houses', () => {
  const cave = fight();
  assert.match(cave.run('snowScene("pupil4", {you: 0, them: 0})'), /class="scene snowfight courtyardSnow/);
  const town = fight({place: 'town', x: 27, y: 6, dir: 'right'});
  assert.match(town.run('snowScene("snowKid1", {you: 0, them: 0})'), /class="scene snowfight snowVillage/);
  assert.ok(town.run('typeof BACKDROPS.snowVillage === "function"'));
});

test('the snowball step: the first win pays its prize and is kept; after that, just the game', async () => {
  const g = fight();
  g.run("globalThis.__win = true; snowballFight = async () => __win");
  const step = "STEPS.snowball({snowball: 'snowFight', prize: 4, win: [{set: {iWon: 1}}], lose: [{set: {iLost: 1}}]}, 'pupil4')";
  g.run('__w1 = ' + step); await g.flush(); await g.run('__w1');
  assert.deepEqual([g.run('here().snowFight'), g.run('here().iWon'), g.run('S.coins')], [1, 1, 4], 'a win, and coins the first time');
  assert.ok(g.run('__notes').some(n => /\+4 .* for winning your first snowball fight/.test(n)));
  g.run('__w2 = ' + step); await g.flush(); await g.run('__w2');
  assert.deepEqual([g.run('here().snowFight'), g.run('S.coins')], [2, 4], 'won again: counted, no more coins');
  g.run('__win = false; here().iWon = 0');
  g.run('__w3 = ' + step); await g.flush(); await g.run('__w3');
  assert.deepEqual([g.run('here().snowFight'), g.run('here().iLost'), g.run('here().iWon')], [2, 1, 0], 'lost: its lose steps, and nothing counted');
});
