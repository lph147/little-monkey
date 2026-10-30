// Practice on the way south (decided 28 October 2026, after playtesting: the walk south was longer, with nothing to
// practise on the way): stepping stones over the south slope's brook, hopped onto a row at a time, each onto the stone
// with the picture of the word you hear.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const COW = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bowls: 'done', tableware: 2, bees: 11, cow: 1};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水', '猴子', '朋友', '河', '鱼', '山羊', '有', '我', '要', '在', '下面', '动物'];
function game(pos, area = {}, more = {}){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, w, areas: {1: {...COW, ...area}}, pos, ...more}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__sfx = []");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run("SFX.splash = () => __sfx.push('splash'); SFX.clack = () => __sfx.push('clack')");
  g.run('placePlayer()');
  return g;
}
async function play(g, code){
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
// Answering a question: right (choosing its answer), or wrong (the one after it), as a player taps it
const answering = (g, right) => g.run(`pictureQ = async o => { const i = ${right ? 'o.answerIdx' : '(o.answerIdx + 1) % o.options.length'}; globalThis.__asked = o; o.onAnswer(i === o.answerIdx, i); return i === o.answerIdx; }`);

test('stepping stones over the south slope’s brook: not walked onto but hopped onto, a row at a time, up or down', () => {
  const g = game({place: 'southSlope', x: 13, y: 22, dir: 'down'});
  assert.deepEqual(get(g, '[23, 24].map(y => [11, 12, 13, 14, 15].map(x => tileAt(x, y).look))'),
    [['water', 'hopStone', 'hopStone', 'hopStone', 'water'], ['water', 'hopStone', 'hopStone', 'hopStone', 'water']], 'two rows of three stones');
  assert.deepEqual([g.run('walkable(13, 23)'), g.run('promptFor(13, 23)'), get(g, 'hopAhead()')], [false, 'Hop', [[12, 23], [13, 23], [14, 23]]], 'A: Hop, onto the row in front of you');
  g.run("S.pos = {place: PLACE, x: 13, y: 23, dir: 'left'}; placePlayer()");
  assert.deepEqual([g.run('promptFor(12, 23)'), get(g, 'hopAhead()')], ['', null], 'not along the row, from stone to stone');
  g.run("S.pos = {place: PLACE, x: 13, y: 23, dir: 'down'}; placePlayer()");
  assert.equal(g.run('promptFor(13, 24)'), 'Hop', 'but on, to the next row');
  g.run("S.pos = {place: PLACE, x: 13, y: 25, dir: 'up'}; placePlayer()");
  assert.equal(g.run('promptFor(13, 24)'), 'Hop', 'and back, from the other bank');
  assert.ok(get(g, "(() => { S.pos = {place: PLACE, x: 13, y: 21, dir: 'down'}; placePlayer(); routeMemo = {}; return routeTo([13, 27]); })()"), 'a task’s arrow can point the way over them');
});

test('each row of stones: a picture over each, of a word you know, and you hear one of them; the same till you answer', () => {
  const g = game({place: 'southSlope', x: 13, y: 22, dir: 'down'});
  const q = get(g, '(({w, opts, answerIdx, type}) => ({w, opts, answerIdx, type}))(hopQuestion(hopAhead()))');
  assert.equal(q.opts.length, 3, 'a picture for each stone');
  assert.ok(q.opts.every(w => get(g, `lvl('${w}') >= 1 && !!PICTURES['${w}']`)), 'each a word you know, with its picture');
  assert.deepEqual([q.opts[q.answerIdx], q.type], [q.w, 'listen'], 'you hear one of them, and choose its picture');
  assert.deepEqual(get(g, 'hopQuestion(hopAhead()).opts'), q.opts, 'the same pictures, as you look');
  g.run('drawHopPics(performance.now())');   // (drawn over the stones, onto the screen itself)
});

test('hopping: the right stone holds, and on you go; anyone following you hops after you; A at once at the next row', async () => {
  const g = game({place: 'southSlope', x: 13, y: 22, dir: 'down'}, {cow: 4}, {following: ['cow']});
  answering(g, true);
  const q = get(g, '(({w, opts, answerIdx}) => ({w, opts, answerIdx}))(hopQuestion(hopAhead()))');
  await play(g, 'interact(...facing())');
  assert.equal(get(g, '__asked.word'), q.w, 'the question you saw on the stones');
  assert.deepEqual(get(g, '[pl.x, pl.y, S.pos.x, S.pos.y]'), [12 + q.answerIdx, 23, 12 + q.answerIdx, 23], 'onto the stone with its picture');
  assert.deepEqual(get(g, "FOLLOWERS.map(n => [n.id, n.x, n.y])"), [['cow', 13, 22]], 'the cow hops after you, onto where you were');
  assert.deepEqual(get(g, '__sfx'), ['clack']);
  g.run('finished()');
  assert.equal(g.run('justFinished(...facing())'), false, 'the next row doesn’t wait: a new question, straight away');
  assert.notDeepEqual(get(g, '[hopQuestion(hopAhead()).w, hopAhead()[0][1]]'), [null, 23], 'the next row’s question');
});

test('a wrong stone tips: splash, in you go, and you climb back out onto the bank you came from, dripping', async () => {
  const g = game({place: 'southSlope', x: 14, y: 22, dir: 'down'});
  answering(g, true);
  await play(g, 'interact(...facing())');
  const x = g.run('pl.x');
  const first = get(g, 'hopQuestion(hopAhead()).opts');
  answering(g, false);
  await play(g, 'interact(...facing())');
  assert.deepEqual(get(g, '[pl.x, pl.y, S.pos.x, S.pos.y, pl.px, pl.py]'), [14, 22, 14, 22, 14 * 16, 22 * 16], 'back on the bank you started from');
  assert.ok(x >= 12 && x <= 14);
  assert.deepEqual(get(g, '__sfx'), ['clack', 'splash']);
  assert.match(get(g, '__notes').join(' '), /Splash! The stone tips, and in you go/);
  assert.ok(g.run('dripUntil > performance.now()'), 'dripping');
  g.run("S.pos = {place: PLACE, x: 14, y: 23, dir: 'down'}; placePlayer()");
  assert.ok(get(g, 'hopQuestion(hopAhead())'), 'a new question for the row you slipped off');
  void first;
});

test('the first time you face stepping stones, a tip: press A to hop', () => {
  const g = game({place: 'southSlope', x: 13, y: 22, dir: 'down'}, {}, {tips: {walk: 1, talk: 1, look: 1}});
  assert.ok(get(g, 'TIPS.hop.when()'), 'facing the stones');
  assert.match(get(g, 'TIPS.hop.text'), /hop onto a stepping stone/);
  g.run("S.pos = {place: PLACE, x: 10, y: 22, dir: 'down'}; placePlayer()");
  assert.equal(get(g, 'TIPS.hop.when()'), false, 'not facing the water');
});

// An owl in the dark pines (猫头鹰), up on an old dead pine just inside the way in from the south slope: perched over its
// top, its eyes glinting in the gloom, to make friends with by answering its questions.
test('an owl (猫头鹰) perched on a dead pine in the dark pines, its eyes glinting in the gloom: A meets it', () => {
  const g = game({place: 'darkPines', x: 11, y: 3, dir: 'up'}, {cow: 2});
  assert.deepEqual(get(g, "[tileAt(11, 2).look, !!tileAt(11, 2).walk]"), ['deadPine', false], 'an old dead pine');
  assert.deepEqual(get(g, "(a => [a.hz, a.at, a.perch, a.glints, a.chapter])(animalAt(11, 2))"), ['猫头鹰', [11, 2, 'darkPines'], 9, [[5, 8, 2], [8, 8, 2]], 1]);
  assert.equal(g.run('promptFor(11, 2)'), 'Meet');
  assert.deepEqual(get(g, "[WORDS['猫头鹰'].py, WORDS['猫头鹰'].en, !!PICTURES['猫头鹰'], !!MAP_SPRITES['猫头鹰']]"), ['māotóuyīng', 'owl', true, true]);
  assert.deepEqual(get(g, "MADE['猫头鹰'].parts.map(p => p.slice(0, 3))"), [['猫', 'māo', 'cat'], ['头', 'tóu', 'head'], ['鹰', 'yīng', 'eagle']], 'cat + head + eagle');
  assert.ok(get(g, "alike('猫头鹰', '鸟') && alike('猫头鹰', '动物')"), 'never an answer beside a bird, nor animal');
  assert.equal(get(g, "AREA.checklist.find(c => /dark pines/.test(c.text)).text"), 'Find the {动物} in the dark pines');
  assert.equal(get(g, 'counter("pinesAnimalsLeft")'), 1);
  g.run("S.friends.push('owl'); S.met.push('owl')");
  assert.equal(get(g, 'counter("pinesAnimalsLeft")'), 0, 'met, it’s found');
  g.run('drawWorld(performance.now())');   // (drawn perched, over the pine's top, and its eyes glint)
});

// A little monkey looking for mushrooms at the top of the hillside, beside the way up to the pine wood, from when you
// first go up for wood and small stones: hello, 我在找蘑菇。 (teaching 蘑菇 if the mushrooms haven't yet), and a word game
// with 蘑菇 among its questions: 3 🐚 the first time you win, then just for practice.
test('a little monkey looking for mushrooms on the hillside: 我在找蘑菇。, teaching 蘑菇, and a word game with 蘑菇 in it', async () => {
  const g = game({place: 'hillside', x: 12, y: 4, dir: 'left'}, {build: 1, wood: 'asked', stones: 'asked', woodIn: 1}, {shells: 0});
  g.run("showNotice = async w => { __notes.push('card: ' + w); rec(w).lv = Math.max(rec(w).lv || 0, 1); }; replyWith = async () => true; confirmBox = async () => true");
  g.run("globalThis.__games = []; encounter = async foe => { __games.push({word: foe.hz, asks: foe.asks, practice: foe.practice, targets: withOwn(toAsk(foe.hz, 3), foe.asks, 3)}); return true; }");
  assert.deepEqual(get(g, "[npcAt(11, 4).id, PLAYS.mushroomer, tileAt(10, 4).look]"), ['mushroomer', 'peer', 'mushrooms'], 'crouching to look at the mushrooms beside it');
  assert.equal(get(g, "(AREA.bubbles.mushroomer.find(b => matches(b.if)) || {}).show"), '!');
  await play(g, 'interact(...facing()).then(runEvents)');
  assert.ok(get(g, '__said').includes('我在找蘑菇。'), 'I’m looking for mushrooms');
  assert.ok(get(g, '__notes').includes('card: 蘑菇'), 'it teaches 蘑菇');
  assert.match(get(g, '__notes').join(' '), /not for eating/);
  assert.deepEqual(get(g, '__games.map(x => [x.word, x.asks, !!x.practice])'), [['猴子', '蘑菇', false]]);
  assert.ok(get(g, '__games[0].targets').includes('蘑菇'), '蘑菇 among its questions');
  assert.deepEqual(get(g, '[here().mushroomGame, S.shells]'), [2, 3], 'won: 3 🐚');
  await play(g, 'interact(...facing()).then(runEvents)');
  assert.equal(get(g, '__games[1].practice'), true, 'after that, just for practice');
  assert.equal(get(g, "(AREA.bubbles.mushroomer.find(b => matches(b.if)) || {}).show || null"), null, 'and no !');
});
