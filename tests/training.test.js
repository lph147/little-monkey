// The training ground: practise matching words to pictures, then fill the gap in a sentence for a word
// without a picture. Words come from the front of the review list, and only words that need practice (new, or missed
// since, until they've been right twice in a row) earn shells, so easy words can't be farmed.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

// A version 5 save: when it's converted, its words go into the review list in the order they were due (js/state.js).
const LATER = Date.now() + 5 * 86400000;
const DUE = ['石头', '鱼', '花'];                                   // at the front of the list, and they need practice (right once so far)
const NOT_DUE = ['山', '草', '树', '桃子', '苹果', '河', '水'];    // behind them, and known well (right twice in a row or more)
const BACK = ['猴子', '鸟'];                                        // at the back of the list
const save = () => ({version: 5, started: true, shells: 0, w: {
  ...Object.fromEntries(DUE.map(w => [w, {lv: 2, due: 0, ok: 1}])),
  ...Object.fromEntries(NOT_DUE.map(w => [w, {lv: 3, due: LATER, ok: 2}])),
  ...Object.fromEntries(BACK.map(w => [w, {lv: 3, due: LATER + 1, ok: 3}])),
  '我': {lv: 4, due: 0, ok: 0}   // caught, but has no picture, so it can't be matched
}});
const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));

test('training picks 8 words from the front of the review list, at random, and never one without a picture', () => {
  const seen = new Set();
  for (let i = 0; i < 30; i++){
    const words = get(loadGame({save: save()}), 'trainingWords()');
    assert.equal(words.length, 8);
    assert.ok(!words.includes('我'));
    for (const w of BACK) assert.ok(!words.includes(w), `${w} is at the back of the list, so it waits`);
    seen.add(words.join(''));
  }
  assert.ok(seen.size > 1, 'not the same every time: you can’t tell what’s coming');
});

test('a word that needs practice, matched first time, earns a shell and moves back; a missed one goes near the front', () => {
  const game = loadGame({save: save()});
  const words = ['石头', '鱼', '花', '山'];   // three that need practice, one known well
  const shells = game.run(`trained(${JSON.stringify(words)}, new Set(['鱼']))`);
  assert.equal(shells, 2, 'one each for 石头 and 花; 鱼 was missed and 山 didn\'t need practice');
  const s = get(game, 'S');
  assert.equal(s.shells, 2);
  assert.equal(s.turn, 4, 'a turn for each word');
  assert.equal(s.w['鱼'].ok, 0);
  const order = get(game, 'reviewOrder(trainable())');
  assert.ok(order.indexOf('鱼') <= 2, `鱼 comes back within a couple of questions (the list: ${order.join(' ')})`);
  assert.ok(order.indexOf('石头') > order.indexOf('鱼') && order.indexOf('山') > order.indexOf('石头'), '石头 later, and 山, known better, later still');
  assert.deepEqual([s.w['石头'].lv, s.w['鱼'].lv, s.w['山'].lv], [2, 2, 3], 'the gold squares stay the same');
});

test('training again straight away earns nothing', () => {
  const game = loadGame({save: save()});
  assert.equal(game.run('trained(trainable(), new Set())'), 3, 'the three that needed practice');
  assert.equal(game.run('trained(trainable(), new Set())'), 0, 'now right twice in a row, they don’t need it');
});

test('the practice post stands on the map, and needs 4 words with pictures', () => {
  const game = loadGame();
  const posts = get(game, "[...MAP.join('')].filter(ch => LEGEND[ch].action === 'training').length");
  assert.equal(posts, 1, 'there should be one practice post');
  assert.equal(game.run('TRAINING_MIN'), 4);
  assert.equal(game.run('trainable().length'), 0);
});

// Words without pictures (我 要) are practised by filling the gap in a sentence you know, such as 我＿吃桃子.
const gapSave = () => ({version: 9, started: true, shells: 0, w: {
  ...save().w,
  '我': {lv: 1, due: LATER, ok: 2},      // known well
  '要': {lv: 1, due: 0, ok: 0},          // needs practice, and first in the list
  '吃': {lv: 1, due: LATER, ok: 2}       // so 我要吃桃子 is known; 喝 isn't caught, so 我要喝水 isn't
}});

test('the practice sentence is one you know, with a word without a picture missing, one that needs practice first', () => {
  for (let i = 0; i < 20; i++){
    const b = get(loadGame({save: gapSave()}), 'practiceSentence()');
    assert.ok(['我要吃桃子', '我要吃苹果', '我要吃草', '我要苹果', '我要桃子', '我要红花'].includes(b.t.join('')), `${b.t.join('')} has a word you haven't caught`);
    assert.equal(b.gap, '要', '要 needs practice, so it is the missing word');
    assert.ok(b.en, 'with its English');
  }
  assert.equal(get(loadGame({save: save()}), 'practiceSentence()'), null, 'nothing to practise until you know a whole sentence');
});

test('filling the gap right moves a word without a picture up, and earns a shell while it needs practice', async () => {
  const game = loadGame({save: gapSave()});
  game.run('gapQ = async () => true');   // chose right
  const round = async () => JSON.parse(await game.run("gapRound({t: toks('我 要 吃 桃子'), en: 'I want to eat a peach.', gap: '要'}, '').then(r => JSON.stringify(r))"));
  assert.deepEqual(await round(), {right: true, shells: 1}, 'a shell for 要, which needed practice');
  game.run("answer('要', true, 'fill')");   // what gapQ does for a right choice
  assert.deepEqual(await round(), {right: true, shells: 1}, 'right once: it still needs practice');
  game.run("answer('要', true, 'fill')");
  assert.deepEqual(await round(), {right: true, shells: 0}, 'right twice in a row: no more shells for it');
  game.run('gapQ = async () => false');
  assert.deepEqual(await round(), {right: false, shells: 0});
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

test('words without pictures that need practice count on the title screen', () => {
  const game = loadGame({save: gapSave()});
  assert.ok(get(game, 'practiceWords()').includes('要'));
  assert.ok(!get(game, 'practiceWords()').includes('我'), '我 has been right twice in a row');
});
