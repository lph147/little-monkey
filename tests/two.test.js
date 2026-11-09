// 二 and 两 (decided 9 November 2026): 二 (èr) is for counting, 一，二，三; 两 (liǎng) for two of something, 两个桃子. 两 is the
// second maths lesson at school, after 四 五 六: the teacher counts two peaches onto his table with 二, then says how many
// there are with 两, and its card goes on to 二 or 两?, the two side by side (SIDE_BY_SIDE in content/words.js, sideCard in
// js/cards.js), seen again from either word's page in the Word Scroll. From then on, how many there are is 两 (number
// questions, counting games and the How many card: HOW_MANY_WORDS in js/world.js), and counting aloud stays 二. A game from
// before it learns 两 where it first meets it: the How many card, the woodcutter's two stones (tests/mountain.test.js), or
// a stall's price, two coins, 两文钱 (the town's fruit seller, and the 老板 at home).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const text = el => el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
const knowing = words => Object.fromEntries(words.map(w => [w, {lv: 1, ok: 2}]));
const click = (s, sel) => s.querySelector(sel).click();
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 400 && !done; i++){ await tick(); g.flush(); } await p; }
// A word's card, as it comes, in a game knowing these words (what's said aloud: __said)
function card(words, w){
  const g = loadGame({dom: true, save: {version: 32, started: true, w: knowing(words)}});
  g.run("globalThis.__said = []; say = (w, end) => { __said.push(w); if (end) end(); }; globalThis.__done = false");
  g.run(`showNotice('${w}', {quiet: true}).then(() => { __done = true; })`);
  return {g, sheet: g.el('#sheet')};
}

test('两 is a word of its own: two of something, with the numbers, its picture two peaches, never an answer beside 二, 桃子 or 水果', () => {
  const g = loadGame();
  const two = get(g, "WORD_BANK['两']");
  assert.deepEqual([two.py, two.en, two.area, two.category], ['liǎng', 'two (of something)', 1, 'numbers']);
  assert.ok(get(g, "!!PICTURES['两'] && !!WORDS['两'].pic"), 'a picture of its own, so it’s caught and practised like any word (not a gloss)');
  assert.deepEqual(get(g, "[...ALIKE['两']].sort()"), ['二', '桃子', '水果'].sort(), 'its look-alikes: 二, two too, and the peach and fruit its picture shows');
  assert.ok(get(g, "alike('二', '两') && alike('桃子', '两')"), 'both ways');
  assert.deepEqual(get(g, 'HOW_MANY_WORDS'), ['一', '两', '三', '四', '五', '六', '七', '八', '九', '十'], 'how many there are: two is 两');
  assert.deepEqual(get(g, 'COUNTING').slice(0, 3), ['一', '二', '三'], 'counting is 二');
  assert.deepEqual(get(g, "AREA.lessons.find(s => s.id === 'numbers').words.slice(0, 5)"), ['四', '五', '六', '两', '七'], 'the second maths lesson, after the first three');
});

test('the first time, 两’s card goes on to 二 or 两?: the two side by side, what each is for, examples to tap and hear, and a line to remember', async () => {
  const {g, sheet} = card(['一', '二', '三'], '两');
  assert.equal(text(sheet.querySelector('.primary')), '二 or 两? ▸', 'not Got it: the card that explains it comes next');
  click(sheet, '.primary');
  assert.equal(text(sheet.querySelector('.label')), '二 or 两?');
  assert.deepEqual(sheet.querySelectorAll('.sa-side').map(s => s.dataset.w), ['二', '两'], '二 on the left, 两 on the right');
  assert.deepEqual(sheet.querySelectorAll('.sbs-for').map(text), ['For counting', 'For two of something']);
  assert.deepEqual(sheet.querySelectorAll('.sbs-ex').map(b => [b.dataset.zh, text(b.querySelector('.sbs-en'))]),
    [['一，二，三！', 'One, two, three!'], ['两个桃子', 'two peaches'], ['两只猴子', 'two monkeys']]);
  assert.ok(sheet.querySelectorAll('.sbs-ex rt').length >= 7, 'pinyin over every word of the examples');
  assert.equal(text(sheet.querySelector('.sbs-remember')), 'Counting? 二. How many? 两.');
  assert.match(text(sheet.querySelector('.sa-side[data-w="两"]')), /两.*liǎng.*two \(of something\)/, 'each with its characters, pinyin and English');
  click(sheet, '[data-a=both]');
  g.flush();
  assert.deepEqual(get(g, '__said'), ['二', '两'], 'Hear both: one, then the other');
  click(sheet, '.sbs-ex[data-zh="两个桃子"]');
  assert.deepEqual(get(g, '__said').slice(-1), ['两个桃子'], 'tap an example to hear it');
  click(sheet, '.sbs-word[data-w="二"]');
  assert.deepEqual(get(g, '__said').slice(-1), ['二'], 'tap a word to hear just it');
  click(sheet, '[data-a=back]');
  assert.equal(text(sheet.querySelector('.primary')), '二 or 两? ▸', 'Back: the word’s card again');
  click(sheet, '.primary');
  assert.equal(text(sheet.querySelector('[data-a=ok]')), 'Got it');
  click(sheet, '[data-a=ok]');
  await tick();
  assert.deepEqual(get(g, '[__done, lvl("两")]'), [true, 1], 'Got it: caught');
});

test('only once you know 二: before that, 两’s card is just Got it, and 二’s page has nothing beside it', () => {
  const {g, sheet} = card(['一', '三'], '两');
  assert.equal(text(sheet.querySelector('.primary')), 'Got it');
  assert.equal(get(g, "sideBySide('两')"), null, 'never a word you haven’t caught');
  const two = loadGame({dom: true, save: {version: 32, started: true, w: knowing(['一', '二'])}});
  two.run("say = () => {}; wordPage('二', () => {})");
  const page = two.el('#sheet');
  click(page, '[data-a=en]');
  assert.equal(text(page.querySelector('[data-a=made]')), 'How it’s made', 'English, then how it’s made (two lines, for two)');
  click(page, '[data-a=made]');
  assert.equal(text(page.querySelector('.primary')), '◂ Back', 'and nothing after it: 两 isn’t caught yet');
});

test('in the Word Scroll: from either word’s English, 二 or 两?, and Back to its page', () => {
  const g = loadGame({dom: true, save: {version: 32, started: true, w: knowing(['一', '二', '三', '两'])}});
  g.run("say = () => {}; wordPage('两', () => {})");
  const sheet = g.el('#sheet');
  click(sheet, '[data-a=en]');
  assert.equal(text(sheet.querySelector('[data-a=made]')), '二 or 两?', '两’s English becomes 二 or 两? (it has no How it’s made)');
  click(sheet, '[data-a=made]');
  assert.deepEqual(sheet.querySelectorAll('.sa-side').map(s => s.dataset.w), ['二', '两']);
  assert.equal(text(sheet.querySelector('.primary')), '◂ Back', 'nothing after it: Back is A’s');
  click(sheet, '.primary');
  assert.ok(sheet.querySelector('.word .big'), 'back on the word’s page');
  g.run("wordPage('二', () => {})");
  click(sheet, '[data-a=en]');
  assert.equal(text(sheet.querySelector('[data-a=made]')), 'How it’s made', '二: how it’s made first');
  click(sheet, '[data-a=made]');
  assert.equal(text(sheet.querySelector('.primary')), '二 or 两? ▸', 'then 二 or 两?');
  click(sheet, '.primary');
  assert.equal(text(sheet.querySelector('.label')), '二 or 两?');
  click(sheet, '[data-a=back]');
  assert.equal(text(sheet.querySelector('.primary')), '二 or 两? ▸', 'Back: how it’s made again');
});

test('how many there are: two things once you know 两, answered 两, and 二 is never an answer', async () => {
  const numbers = ['一', '二', '三', '四', '五', '六'];
  const g = loadGame({dom: true, save: {version: 32, started: true, w: knowing([...numbers, '桃子', '桌子'])}});
  assert.deepEqual(get(g, 'countable()'), [1, 3, 4, 5, 6], 'before 两: never two things to count');
  g.run("rec('两').lv = 2; rec('两').ok = 2");
  assert.deepEqual(get(g, 'countable()'), [1, 2, 3, 4, 5, 6], 'with 两: two things too');
  g.run("globalThis.__qs = []; say = () => {}; pictureQ = async q => { __qs.push({word: q.word, options: q.options}); return true; }");
  for (const n of [2, 1, 3]) await play(g, `countQ({who: 'elder', thing: AREA.lessons[0].things[0], n: ${n}})`);
  const qs = get(g, '__qs'), first = o => (o.match(/^([^<]+)/) || o.match(/<span class="under"><span class="cap">([^<]+)</))[1];   // (the number an answer shows: on its own, or under its things while it's new)
  assert.equal(qs[0].word, '两', 'two peaches: 两');
  assert.ok(qs[0].options.map(first).includes('两'));
  assert.ok(qs.every(q => q.options.every(o => !/^二|>二</.test(o))), '二 is never among the answers');
  assert.ok(qs.slice(1).some(q => q.options.map(first).includes('两')), '两 is an answer beside one and three, the nearest');
});

test('the 两 lesson: he counts two peaches with 二, then says how many with 两, its card with its own note; the questions mix in 一 and three', async () => {
  const g = loadGame({dom: true, save: {version: 32, started: true, w: knowing(['一', '二', '三', '四', '五', '六', '桃子', '苹果', '碗', '猴子', '兔子', '桌子'])}});
  g.run("globalThis.__said = []; globalThis.__cards = []; globalThis.__qs = []; say = () => {}");
  g.run("showDialog = async (who, line, o = {}) => { __said.push(line.t.join('') + (o.teach ? ' [' + o.teach + ']' : '')); }");
  g.run("showNotice = async (w, o = {}) => { __cards.push([w, o.note || null]); rec(w).lv = 1; }; pictureQ = async q => { __qs.push(q.word); return true; }");
  await play(g, "countLesson(AREA.lessons.find(s => s.id === 'numbers'), ['两'], 'elder')");
  assert.deepEqual(get(g, '__said'), ['一，二。两个桃子！ [两]'], 'counting with 二, then how many with 两, bold');
  assert.deepEqual(get(g, '__cards'), [['两', 'For two of something, such as two peaches: 两个桃子. Counting is still 二: 一，二，三！']]);
  const qs = get(g, '__qs');
  assert.equal(qs.filter(w => w === '两').length, 3, 'three questions on 两');
  assert.ok(qs.filter(w => w !== '两').every(w => ['一', '三'].includes(w)), `and two on numbers you know beside it (${qs})`);
});

// The human world
const FROM_AREA_1 = ['石头', '山', '树', '桃子', '苹果', '水', '吃', '要', '我', '猴子', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '谢谢', '不客气', '我不要', '钱', '买', '木头'];
function area2(pos, area = {}, w = []){
  const g = loadGame({dom: true, save: {version: 39, started: true, area: 2, coins: 20, w: knowing([...FROM_AREA_1, ...w]), areas: {1: {chapter: 1, raft: 3, done: true}, 2: area}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__cards = []; toast = () => {}; showNarration = async () => {}");
  g.run("showDialog = async (who, line, o = {}) => { __said.push(line.t.join('') + (o.teach ? ' [' + o.teach + ']' : '')); }");
  g.run("showNotice = async (w, o = {}) => { __cards.push([w, !!o.quiet, o.note || null]); setSeen(w); }");
  g.run("replyWith = async best => { __said.push('you: ' + best); if (lvl(best) === 0) setSeen(best); return true; }; STEPS.shop = async s => { __said.push('shop: ' + s.shop); }");
  g.run('placePlayer()');
  return g;
}
const bubble = (g, id) => g.run(`((AREA.bubbles['${id}'] || []).find(b => matches(b.if)) || {}).show || ''`);

test('the How many card: two is 两, so a game that doesn’t know it learns it first; then the card', async () => {
  const g = area2({place: 'mountainFoot', x: 8, y: 5, dir: 'up'});
  g.run("globalThis.__howMany = 0; howManyCard = async () => { __howMany++; return 2; }; pickUpAct = async () => {}");
  await play(g, "STEPS.carry({carry: '石头', howMany: true})");
  assert.deepEqual(get(g, '__cards'), [['两', false, get(g, 'TWO_NOTE')]], 'its card, said aloud (you’ve found it yourself), with what it’s for');
  assert.match(get(g, 'TWO_NOTE'), /Two of something is 两.*Counting is still 二/);
  assert.equal(get(g, '__howMany'), 1, 'then how many');
  await play(g, "STEPS.carry({carry: '石头', howMany: true})");
  assert.equal(get(g, '__cards').length, 1, 'known: just the card');
});

test('the town’s fruit seller: you ask how much, she says 两文钱, and 两 is taught to a game that doesn’t know it, whenever you come to her', async () => {
  const g = area2({place: 'town', x: 5, y: 14, dir: 'left'}, {exchanged: 1}, ['多少钱']);
  assert.equal(bubble(g, 'fruitSeller'), '!', 'a ! over her stall');
  await play(g, "talk(ALL_NPCS.find(n => n.id === 'fruitSeller'))");
  assert.deepEqual(get(g, '__said'), ['you: 多少钱', '两文钱。 [两]', 'shop: fruit'], 'you ask, and she tells you: 两 bold, the word being taught');
  assert.deepEqual(get(g, '__cards'), [['两', true, 'Two of something is 两, two coins: 两文钱. Counting is still 二: 一，二，三！']], 'its card after her line, not said again');
  assert.equal(bubble(g, 'fruitSeller'), '', 'and no more !');
  g.run('__said.length = 0');
  await play(g, "talk(ALL_NPCS.find(n => n.id === 'fruitSeller'))");
  assert.deepEqual(get(g, '__said'), ['shop: fruit'], 'after that, just her stall');
  const fresh = area2({place: 'town', x: 5, y: 14, dir: 'left'}, {exchanged: 1}, ['两']);   // (a game from the school, asking how much for the first time)
  await play(fresh, "talk(ALL_NPCS.find(n => n.id === 'fruitSeller'))");
  assert.deepEqual(get(fresh, '__said'), ['you: 多少钱', '两文钱。', 'shop: fruit'], '两 known: just green, and no card');
  assert.deepEqual(get(fresh, '__cards'), []);
});

test('the 老板 at home, for a game in chapter 2 that doesn’t know 两: how much are his peaches? Two coins, 两文钱', async () => {
  const g = area2({place: 'ffmHomeGround', x: 7, y: 9, dir: 'up'}, {chapter: 2, homeAgain: 1, unload: 9, party: 1});
  assert.deepEqual(get(g, '(n => [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === "boss"))'), ['ffmHomeGround', 7, 8]);
  assert.equal(bubble(g, 'boss'), '!');
  await play(g, "talk(ALL_NPCS.find(n => n.id === 'boss'))");
  assert.deepEqual(get(g, '__said'), ['you: 多少钱', '两文钱。 [两]', 'shop: home'], 'you ask how much (teaching 多少钱, if you don’t know it), and 两 in his answer');
  assert.deepEqual(get(g, '__cards').map(c => c[0]), ['两']);
  assert.equal(get(g, "lvl('多少钱') >= 1 && lvl('两') >= 1"), true);
  g.run('__said.length = 0');
  await play(g, "talk(ALL_NPCS.find(n => n.id === 'boss'))");
  assert.deepEqual(get(g, '__said'), ['shop: home'], 'then just his shop');
});
