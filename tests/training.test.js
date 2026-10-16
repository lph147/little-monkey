// The training ground: practise matching words to pictures. Words due for review come first, and
// only due words earn peaches, so easy words can't be farmed.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const DAY = 86400000, LATER = Date.now() + 5 * DAY;
const DUE = ['石头', '路', '花'];                                   // due for review now
const NOT_DUE = ['山', '草', '树', '桃子', '苹果', '河', '水'];    // not due for days
const save = () => ({version: 5, started: true, peaches: 0, w: {
  ...Object.fromEntries(DUE.map(w => [w, {lv: 2, due: 0, ok: 1}])),
  ...Object.fromEntries(NOT_DUE.map(w => [w, {lv: 3, due: LATER, ok: 2}])),
  '我': {lv: 4, due: 0, ok: 0}   // caught, but has no picture, so it can't be matched
}});
const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));

test('training picks 8 words, every due one first, and never one without a picture', () => {
  for (let i = 0; i < 20; i++){
    const words = get(loadGame({save: save()}), 'trainingWords()');
    assert.equal(words.length, 8);
    for (const w of DUE) assert.ok(words.includes(w), `${w} is due, so it should be practised`);
    assert.ok(!words.includes('我'));
  }
});

test('a due word matched first time earns a peach and comes back later; a missed one comes back now', () => {
  const game = loadGame({save: save()});
  const words = ['石头', '路', '花', '山'];   // three due, one not
  const peaches = game.run(`trained(${JSON.stringify(words)}, new Set(['路']))`);
  assert.equal(peaches, 2, 'one peach each for 石头 and 花; 路 was missed and 山 wasn\'t due');
  const s = get(game, 'S');
  assert.equal(s.peaches, 2);
  assert.ok(s.w['石头'].due > Date.now() + 2 * DAY, '石头 comes back in a few days');
  assert.equal(s.w['路'].ok, 0);
  assert.ok(s.w['路'].due <= Date.now(), '路 comes back straight away');
  assert.ok(s.w['山'].due > LATER, '山 comes back even later');
  assert.deepEqual([s.w['石头'].lv, s.w['路'].lv, s.w['山'].lv], [2, 2, 3], 'the gold squares stay the same');
});

test('training again straight away earns nothing', () => {
  const game = loadGame({save: save()});
  const words = get(game, 'trainingWords()');
  assert.equal(game.run(`trained(${JSON.stringify(words)}, new Set())`), 3);
  const again = get(game, 'trainingWords()');
  assert.equal(game.run(`trained(${JSON.stringify(again)}, new Set())`), 0);
});

test('the practice post stands on the map, and needs 4 words with pictures', () => {
  const game = loadGame();
  const posts = get(game, "[...MAP.join('')].filter(ch => LEGEND[ch].action === 'training').length");
  assert.equal(posts, 1, 'there should be one practice post');
  assert.equal(game.run('TRAINING_MIN'), 4);
  assert.equal(game.run('trainable().length'), 0);
});

// Words without pictures (我 要 瀑布 老板 头带) are practised by listening: hear it, pick its characters.
const listenSave = () => ({version: 5, started: true, peaches: 0, w: {
  ...save().w,
  '要': {lv: 1, due: 0, ok: 0},            // due now
  '瀑布': {lv: 1, due: LATER, ok: 1},      // not due for days
  '老板': {lv: 2, due: 0, ok: 1},          // due now
  '头带': {lv: 1, due: LATER + DAY, ok: 1}  // due last of all
}});

test('listening practice picks up to 3 caught words without pictures, due ones first', () => {
  for (let i = 0; i < 20; i++){
    const words = get(loadGame({save: listenSave()}), 'listenWords()');
    assert.equal(words.length, 3);
    for (const w of ['我', '要', '老板']) assert.ok(words.includes(w), `${w} is due, so it should be practised`);
  }
});

test('when listening, the choices are the word and 2 other caught words, all different', () => {
  const game = loadGame({save: listenSave()});
  for (let i = 0; i < 20; i++){
    const opts = get(game, "listenOptions('要')");
    assert.equal(opts.length, 3);
    assert.ok(opts.includes('要'));
    assert.equal(new Set(opts).size, 3);
    for (const w of opts) assert.ok(game.run(`lvl(${JSON.stringify(w)})`) >= 1, `${w} hasn't been caught`);
  }
});

test('a word heard right twice moves up to Recognised, and earns a peach only if it was due', async () => {
  const game = loadGame({save: listenSave()});
  // answer every question right (the real question card waits for a tap)
  game.run('globalThis.__asked = []; pictureQ = async q => { __asked.push(q); answer(q.word, true, q.type); return true; }');
  const round = async () => JSON.parse(await game.run("listenRound(['要', '瀑布']).then(r => JSON.stringify(r))"));
  assert.deepEqual(await round(), {right: 2, peaches: 1}, 'a peach for 要, which was due; 瀑布 wasn\'t');
  assert.deepEqual(get(game, '__asked.map(q => [q.word, q.type, q.text, q.options.includes(q.word)])'),
    [['要', 'listen', true, true], ['瀑布', 'listen', true, true]], 'heard, with the characters to choose from');
  const s = get(game, 'S');
  assert.equal(s.w['要'].lv, 1, 'one right answer is not enough to move 要 up');
  assert.equal(s.peaches, 1);
  assert.deepEqual(await round(), {right: 2, peaches: 0}, 'straight away again earns nothing: neither word is due any more');
  assert.equal(get(game, 'S').w['要'].lv, 2, 'a second right answer makes 要 Recognised');
});

test('words without pictures that are due count on the title screen', () => {
  const game = loadGame({save: listenSave()});
  assert.ok(get(game, 'dueWords()').includes('要'));
  assert.ok(!get(game, 'dueWords()').includes('瀑布'));
});
