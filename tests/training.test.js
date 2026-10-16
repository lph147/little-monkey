// The training ground: practise matching words to pictures, then fill the gap in a sentence for a word
// without a picture. Words due for review come first, and only due words earn peaches, so easy words can't be farmed.
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

// Words without pictures (我 要) are practised by filling the gap in a sentence you know, such as 我＿吃桃子.
const gapSave = () => ({version: 9, started: true, peaches: 0, w: {
  ...save().w,
  '我': {lv: 1, due: LATER, ok: 1},      // not due
  '要': {lv: 1, due: 0, ok: 0},          // due now
  '吃': {lv: 1, due: LATER, ok: 1}       // so 我要吃桃子 is known; 喝 isn't caught, so 我要喝水 isn't
}});

test('the practice sentence is one you know, with a word without a picture missing, a due one first', () => {
  for (let i = 0; i < 20; i++){
    const b = get(loadGame({save: gapSave()}), 'practiceSentence()');
    assert.ok(['我要吃桃子', '我要苹果', '我要花'].includes(b.t.join('')), `${b.t.join('')} has a word you haven't caught`);
    assert.equal(b.gap, '要', '要 is due, so it is the missing word');
    assert.ok(b.en, 'with its English');
  }
  assert.equal(get(loadGame({save: save()}), 'practiceSentence()'), null, 'nothing to practise until you know a whole sentence');
});

test('filling the gap right moves a word without a picture up, and earns a peach if it was due', async () => {
  const game = loadGame({save: gapSave()});
  game.run('gapQ = async () => true');   // chose right
  const round = async () => JSON.parse(await game.run("gapRound({t: toks('我 要 吃 桃子'), en: 'I want to eat a peach.', gap: '要'}, '').then(r => JSON.stringify(r))"));
  assert.deepEqual(await round(), {right: true, peaches: 1}, 'a peach for 要, which was due');
  game.run("answer('要', true, 'fill')");   // what gapQ does for a right choice
  assert.deepEqual(await round(), {right: true, peaches: 0}, 'straight away again earns nothing: it isn\'t due any more');
  game.run('gapQ = async () => false');
  assert.deepEqual(await round(), {right: false, peaches: 0});
});

test('a gap question: Chinese and English, pictures while the word is new, Chinese and pinyin once recognised', async () => {
  const ask = async (lv) => {
    const game = loadGame({dom: true, save: {version: 9, started: true, w: {'桃子': {lv, due: 0, ok: 0}, '石头': {lv: 1, due: 0, ok: 0}, '水': {lv: 2, due: 0, ok: 0}, '我': {lv: 1, due: 0, ok: 0}, '要': {lv: 1, due: 0, ok: 0}, '吃': {lv: 1, due: 0, ok: 0}}}});
    game.run("globalThis.__ok = null; gapQ({t: toks('我 要 吃 桃子'), en: 'I want to eat a peach.', gap: '桃子'}).then(ok => { __ok = ok; })");
    return game;
  };
  const fresh = await ask(1), sheet = fresh.el('#sheet');
  assert.ok(sheet.querySelector('.line .gap'), 'the sentence has a gap');
  assert.equal(sheet.querySelector('.sentence-en').textContent, 'I want to eat a peach.', 'with its English, shown');
  assert.ok(sheet.querySelectorAll('.opt .pix').length >= 2, 'a new word: pictures to choose from');
  for (const o of sheet.querySelectorAll('.opt')) assert.ok(!['我', '要', '吃'].includes(o.querySelector('.cap').textContent), 'never a word that is already in the sentence');
  sheet.querySelectorAll('.opt').find(o => o.textContent.includes('桃子')).click();
  await new Promise(r => setImmediate(r));
  assert.ok(sheet.querySelector('.line .tok.teach[data-t="桃子"]'), 'choosing fills the gap');
  const known = await ask(2), ks = known.el('#sheet');
  assert.equal(ks.querySelectorAll('.opt .pix').length, 0, 'recognised: Chinese and pinyin only');
  assert.ok(ks.querySelector('.opt.hz .cap').textContent, 'with pinyin');
  ks.querySelectorAll('.opt').find(o => !o.textContent.includes('桃子')).click();
  await new Promise(r => setImmediate(r));
  assert.ok(ks.querySelector('.opt.right'), 'a wrong choice shows the right one');
  assert.equal(known.run("rec('桃子').lv"), 2, 'and nothing is taken away');
});

test('words without pictures that are due count on the title screen', () => {
  const game = loadGame({save: gapSave()});
  assert.ok(get(game, 'dueWords()').includes('要'));
  assert.ok(!get(game, 'dueWords()').includes('吃'));
});
