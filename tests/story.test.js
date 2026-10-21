// The story questions at the waterfall follow the quiz rules in CLAUDE.md: every picture is a word
// you've caught (the wrong answers too), and the right answer is always there.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

// The questions a player who has caught these words is asked.
function questionsFor(words){
  const w = Object.fromEntries(words.map(x => [x, {lv:1, due:0, ok:0}]));
  const game = loadGame({save: {started: true, w}});
  return JSON.parse(game.run('JSON.stringify(storyQuestions())'));
}
const AREA = JSON.parse(loadGame().run('JSON.stringify(AREA)'));
const BANK = JSON.parse(loadGame().run('JSON.stringify(WORD_BANK)'));
const collectible = Object.keys(BANK).filter(w => BANK[w].area === AREA.number);
// The fewest words you can have at the waterfall: born from the stone, hello from the old monkey,
// then both monkeys' requests, which open the way up.
const FEWEST = ['石头', '你好', '吃', '桃子', '要', '我', '喝', '水', '瀑布'];

test('with the fewest words, only questions whose answer you have caught are asked', () => {
  const qs = questionsFor(FEWEST);
  assert.ok(qs.length >= 1, 'there should be at least one story question');
  for (const q of qs){
    assert.ok(q.options.length >= 2, `${q.t.join('')} needs at least one wrong answer you've caught`);
    for (const w of q.options) assert.ok(FEWEST.includes(w), `${q.t.join('')} shows ${w}, which you haven't caught`);
  }
});

test('with every word, each question has the answer and two wrong answers, the first listed', () => {
  const qs = questionsFor(collectible);
  assert.equal(qs.length, AREA.storyQuestions.length);
  qs.forEach((q, i) => {
    const c = AREA.storyQuestions[i], wrong = c.options.filter(w => w !== c.answer).slice(0, 2);
    assert.deepEqual([...q.options].sort(), [c.answer, ...wrong].sort());
    assert.equal(q.answer, c.answer);
  });
});

test('whatever words you have, story questions only show words you have caught', () => {
  for (let run = 0; run < 100; run++){
    const words = FEWEST.concat(collectible.filter(() => Math.random() < 0.5));
    for (const q of questionsFor(words)){
      assert.ok(q.options.includes(q.answer), `${q.t.join('')}: the answer is missing`);
      assert.equal(new Set(q.options).size, q.options.length, `${q.t.join('')} repeats an option`);
      assert.ok(q.options.length >= 2 && q.options.length <= 3, `${q.t.join('')} has ${q.options.length} options`);
      for (const w of q.options) assert.ok(words.includes(w), `${q.t.join('')} shows ${w}, which you haven't caught (with ${words.join(' ')})`);
    }
  }
});

test('each story question is a story sentence with its answer as the missing word', () => {
  const story = AREA.story.map(s => s.zh);
  AREA.storyQuestions.forEach((q, i) => {
    assert.ok(story.includes(q.zh), `story question ${i + 1} should be a sentence from the story: ${q.zh}`);
    assert.equal(q.zh.split(' ').filter(w => w === q.answer).length, 1, `story question ${i + 1}: ${q.answer} should be in the sentence once`);
    assert.ok(q.en && q.en.includes('…'), `story question ${i + 1} needs its English with … for the gap`);
  });
  for (const s of AREA.story) if (s.pic) assert.ok(collectible.includes(s.pic) && BANK[s.pic].pic, `the story's picture ${s.pic} should be a word with a picture`);
});

test('a story question shows a gap; answering fills it in', async () => {
  const w = Object.fromEntries(collectible.map(x => [x, {lv: 1, due: 0, ok: 0}]));
  const game = loadGame({dom: true, save: {version: 9, started: true, w}});
  const sheet = game.el('#sheet');
  game.run("globalThis.__q = null; const pq = pictureQ; pictureQ = q => { __q = q; return pq(q); }; storyScroll()");
  sheet.querySelector('[data-a=ok]').click();   // Questions
  await new Promise(r => setImmediate(r));
  const answer = AREA.storyQuestions[0].answer;
  assert.ok(sheet.querySelector('.line .gap'), 'the sentence has a gap');
  assert.ok(!sheet.querySelector(`.line .tok[data-t="${answer}"]`), 'and the missing word is not shown');
  sheet.querySelector(`.opt[data-i="${game.run('__q.answerIdx')}"]`).click();
  assert.ok(!sheet.querySelector('.line .gap'), 'the gap is filled');
  assert.ok(sheet.querySelector(`.line .tok.teach[data-t="${answer}"]`), `with ${answer}, in bold`);
});

test('the story shows each sentence\'s English the first time, then behind the English button', () => {
  const game = loadGame({dom: true, save: {version: 9, started: true}});
  const sheet = game.el('#sheet');
  game.run('storyScroll()');
  assert.equal(sheet.querySelectorAll('.sent .sentence-en').filter(e => !e.hidden).length, AREA.story.length, 'all English shown the first time');
  assert.equal(sheet.querySelector('[data-a=en]'), null);
  assert.equal(sheet.querySelectorAll('.sent .spic').length, AREA.story.filter(s => s.pic).length, 'a picture beside each sentence');
  game.run('closeCard(); here().story = true; storyScroll()');
  assert.equal(sheet.querySelectorAll('.sent .sentence-en').filter(e => !e.hidden).length, 0, 'hidden after that');
  sheet.querySelector('[data-a=en]').click();
  assert.equal(sheet.querySelectorAll('.sent .sentence-en').filter(e => !e.hidden).length, AREA.story.length, 'English shows them all');
});

test('the rocks roll away only once the rest of the prologue is done: the three monkeys helped, and every animal found', async () => {
  const gate = async (area, met) => {
    const g = loadGame({save: {version: 24, started: true, met, areas: {1: {elder: 2, ...area}}}});
    g.run("showNarration = showNotice = async () => {}; toast = () => {}; SFX.rumble = () => {}");
    await g.run('runEvents()');
    return g.run('here().gate');
  };
  const all = ['rabbit', 'fox', 'squirrel', 'goat'];
  assert.equal(await gate({hungry: 'done', thirsty: 'done'}, all), false, 'not before the flowers');
  assert.equal(await gate({hungry: 'done', thirsty: 'done', flowers: 'done'}, ['rabbit', 'fox']), false, 'not before every animal is found');
  assert.equal(await gate({hungry: 'done', thirsty: 'done', flowers: 'done'}, all), true);
});

test('the prologue runs from being born to counting the troop in and becoming king; then chapter 1, The Great Feast, begins with its card', async () => {
  const {loadGame} = require('./fake-browser');
  const g = loadGame({dom: true, save: {version: 29, started: true, areas: {1: {cave: 5, count: 2}}}});
  const chapters = JSON.parse(g.run('JSON.stringify(AREA.chapters)'));
  assert.deepEqual(chapters, [{name: 'Prologue', title: 'The Water Curtain Cave'}, {name: 'Chapter 1', title: 'The Great Feast'}]);
  assert.ok(g.run('AREA.checklist.filter(c => !c.chapter).length > 10'), 'the prologue’s checklist');
  g.run("mode = 'play'; save = () => {}");
  await g.run('runEvents()');
  assert.equal(g.run('here().chapter'), 0, 'still the prologue while the troop is coming in');
  g.run("globalThis.__shown = []; storyScene = async id => { __shown.push('scene ' + id); }; showNotice = async w => { __shown.push(w); setSeen(w); }");
  g.run('here().count = 3');
  g.run('runEvents()');
  for (let i = 0; i < 5; i++) await new Promise(r => setImmediate(r));
  assert.deepEqual(JSON.parse(g.run('JSON.stringify(__shown)')), ['scene becomingKing', '王'], 'the whole troop is home: the scene of becoming king, then the card for 王');
  assert.equal(g.run('here().cave'), 6, 'you’re king');
  assert.match(g.el('#sheet').textContent, /Chapter 1\s*The Great Feast/, 'then chapter 1’s card');
  assert.equal(g.run('here().chapter'), 1);
  assert.match(g.run('chapterItems()[0].text'), /old monkey/, 'chapter 1’s checklist begins with going with the old monkey to the new home ground');
});

test('a scene plays like the opening: its pictures, its captions one at a time, and OK or Skip ends it; Settings can play it again', async () => {
  const {loadGame} = require('./fake-browser');
  const g = loadGame({dom: true, save: {version: 29, started: true, areas: {1: {cave: 6, count: 3, chapter: 1}}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__done = false; storyScene('becomingKing').then(() => { __done = true; })");
  assert.equal(g.run('mode'), 'intro', 'it plays over the game, as the opening does');
  for (let t = 0; t <= 16; t += .25) g.run(`SCENE_ART.becomingKing(${t}, ${1000 + t * 1000})`);   // every moment of it can be drawn
  g.run('frame(1050)');
  assert.equal(g.run('capIdx'), 0, 'its first caption');
  assert.equal(g.run("scene.caps.map(c => c.words.join('')).join(' | ')"), '水帘洞是我们的家。 | 你很勇敢！ | 你是我们的王！ | 美猴王！ | 从此，花果山的猴子很快乐。');
  assert.equal(g.run("scene.caps[2].teach"), '王', 'the word it teaches is in bold green');
  assert.equal(g.run('scene.last'), 'OK');
  g.run("document.querySelector('#skipBtn').onclick()");
  await new Promise(r => setImmediate(r));
  assert.equal(g.run('__done'), true, 'Skip ends it');
  assert.equal(g.run('mode'), 'play', 'and you carry on where you were');
  g.run('openSettings()');
  const watch = g.el('#sheet').querySelector('[data-scene="becomingKing"]');
  assert.ok(watch && /Watch becoming king/.test(watch.textContent), 'Settings can play it again');
  watch.click();
  assert.equal(g.run('mode'), 'intro');
  const early = loadGame({dom: true, save: {version: 29, started: true, areas: {1: {cave: 5, count: 2}}}});
  early.run("mode = 'play'; openSettings()");
  assert.ok(!early.el('#sheet').querySelector('[data-scene]'), 'not before you’ve become king');
});
