// Quick practice (练习, decided 30 October 2026): questions on the words you know, from the title screen (Practise, for the
// game you'd continue) or the menu's 练习 tile, without walking anywhere. You choose how many with − and +, in fives, up to
// 50 or as many as you can be asked about, 10 to start with. The words that need it most come first, each asked about as
// its level calls for, and every fifth a sentence with a word missing; never a new word. Every answer counts in your game,
// as practice anywhere does, but earns no shells. Stop, or B, ends it where you are.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const PICS = ['石头', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '水', '河', '鱼', '鸟', '猴子', '朋友', '桌子', '碗', '家', '床', '洞', '瀑布', '羊', '松鼠', '山羊', '兔子',
  '一', '二', '三', '王', '木头', '学校', '老师', '同学', '四', '五', '六', '七', '八', '九', '十', '红色', '黄色', '白色', '蓝色', '黑色', '蝴蝶', '蜜蜂', '蜂王', '蜂蜜', '牛',
  '牛奶', '酸奶', '奶酪', '勺子', '筷子', '鱼竿', '香蕉', '西瓜', '葡萄', '种子', '虾', '螃蟹', '海'];
const OTHERS = ['我', '要', '吃', '喝', '有', '没有', '你好', '谢谢', '不客气'];
function game(words = [...PICS, ...OTHERS], more = {}){
  const w = Object.fromEntries(words.map((x, i) => [x, {lv: 1 + i % 3, ok: i % 4 === 0 ? 0 : 3}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, turn: 200, shells: 7, areas: {1: {chapter: 1, elder: 2, school: 2}}, w, ...more}});
  g.run("save = () => {}; globalThis.__asked = []; SFX.fanfare = SFX.blip = () => {}");
  g.run("pictureQ = async o => { __asked.push(['pic', o.word, o.type]); if (o.type) answer(o.word, true, o.type); return true; }");
  g.run("gapQ = async o => { __asked.push(['gap', o.gap]); answer(o.gap, true, 'fill'); return true; }");
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function settle(g){ for (let i = 0; i < 200; i++){ await tick(); g.flush(); } }
const click = (g, sel) => g.run(`sheet.querySelector('${sel}').click()`);
const text = g => g.run('sheet.textContent').replace(/\s+/g, ' ');

test('how many: in fives, up to 50 or as many as you can be asked about, 10 to start with', () => {
  assert.deepEqual(get(game(), 'quickSizes()'), [5, 10, 15, 20, 25, 30, 35, 40, 45, 50], 'plenty of words: up to 50');
  const few = game(['石头', '山', '花', '草', '树', '桃子', '苹果']);
  assert.deepEqual(get(few, 'quickSizes()'), [5, 7], 'seven words: 5, then all 7');
  few.run('quickPractice(() => {})');
  assert.match(text(few), /7 questions/, 'fewer than 10: it starts at all of them');
  assert.equal(few.run("sheet.querySelector('[data-a=more]').disabled"), true, 'and + goes no further');
  const four = game(['石头', '山', '花', '草']);
  assert.deepEqual(get(four, 'quickSizes()'), [4], 'four words: just 4');
  const g = game();
  g.run('quickPractice(() => {})');
  assert.match(text(g), /10 questions/);
  assert.equal(g.run("sheet.querySelector('[data-a=less]').disabled"), false);
  click(g, '[data-a=more]'); click(g, '[data-a=more]');
  assert.match(text(g), /20 questions/, '+ adds five');
  click(g, '[data-a=less]');
  assert.match(text(g), /15 questions/, '− takes five away');
  for (let i = 0; i < 20; i++) click(g, '[data-a=less]');
  assert.match(text(g), /5 questions/);
  assert.equal(g.run("sheet.querySelector('[data-a=less]').disabled"), true, 'and no further');
});

test('the card: your words caught, how many need practice, and how many at each level', () => {
  const g = game();
  g.run('quickPractice(() => {})');
  const t = text(g);
  assert.match(t, /练习 liànxí Practice/);
  assert.match(t, new RegExp(`${g.run('wordsCaught()')} words caught`));
  assert.match(t, new RegExp(`${get(g, 'practiceWords().length')} need practice`));
  for (const m of ['Caught', 'Recognised', 'Read', 'Used']) assert.ok(t.includes(m), m);
});

test('fewer than 4 words with pictures: it says to learn some first', () => {
  const g = game(['石头', '山', '你好']);
  g.run('quickPractice(() => {})');
  assert.match(text(g), /Learn 4 words with pictures first \(2\/4\)/);
});

test('a practice: the words that need it most, every fifth a sentence, every answer counted, and no shells', async () => {
  const g = game();
  const turn = g.run('S.turn'), need = get(g, 'reviewOrder(trainable()).slice(0, 10 + PICK_FROM - 1)');
  g.run('quickPractice(() => {})');
  click(g, '[data-a=go]');
  await settle(g);
  const asked = get(g, '__asked');
  assert.equal(asked.length, 10);
  assert.deepEqual(asked.map(a => a[0]), ['pic', 'pic', 'pic', 'pic', 'gap', 'pic', 'pic', 'pic', 'pic', 'gap'], 'every fifth a sentence');
  const pics = asked.filter(a => a[0] === 'pic').map(a => a[1]);
  assert.ok(pics.every(w => need.includes(w)), 'from the front of the review list');
  assert.equal(new Set(pics).size, pics.length, 'each word once');
  assert.ok(get(g, '__asked.every(a => lvl(a[1]) >= 1)'), 'never a new word');
  assert.equal(g.run('S.turn') - turn, 10, 'every answer counts in your game');
  assert.equal(g.run('S.shells'), 7, 'but earns no shells');
  assert.match(text(g), /Practice done! You got 10 of 10 right first time\./);
  assert.equal(g.run("sheet.querySelector('[data-a=again]').textContent"), '10 more');
});

test('Stop ends it where you are, and what you answered still counts', async () => {
  const g = game();
  g.run("pictureQ = async o => { __asked.push(o.word); if (__asked.length === 3){ o.stop(); return new Promise(() => {}); } answer(o.word, false, o.type); return false; }");
  g.run('quickPractice(() => {})');
  click(g, '[data-a=go]');
  await settle(g);
  assert.match(text(g), /Practice stopped You got 0 of 2 right first time\./);
  assert.match(text(g), /Words to practise/, 'the two you missed, to tap and hear');
});

test('a word that moves up a level is on the end card', async () => {
  const g = game(PICS.slice(0, 6));
  g.run("for (const w of trainable()) { rec(w).lv = 1; rec(w).n = 1; rec(w).ok = 0; }");   // (one more right answer moves each up)
  g.run('quickPractice(() => {})');
  click(g, '[data-a=go]');
  await settle(g);
  assert.match(text(g), /Moved up: .*Recognised/);
});

test('on the title screen: Practise beside Continue, for a game that knows 4 words with pictures, and back to the title after', async () => {
  const g = game();
  g.run('toTitle()');
  assert.match(g.run("$('#titleButtons').innerHTML.replace(/<[^>]*>/g, '|')"), new RegExp(`Practise\\|${get(g, 'practiceWords().length')} words need it`), 'a Practise button');
  g.run("$('#titleButtons').querySelector('#pracBtn').click()");
  assert.match(text(g), /练习 liànxí Practice/);
  click(g, '[data-a=back]');
  assert.equal(g.run('mode'), 'title', 'Back: the title screen again');
  const few = game(['石头', '山', '你好']);
  few.run('toTitle()');
  assert.equal(few.run("$('#titleButtons').innerHTML.includes('pracBtn')"), false, 'not for a game that knows too few words');
});

test('in the menu: the 练习 tile, second, opening the same card, and Back returns to the menu', () => {
  const g = game();
  g.run('openMenu()');
  const tiles = [...g.el('#sheet').querySelectorAll('.mtile')].map(t => t.dataset.m);
  assert.equal(tiles[1], 'practice');
  click(g, '[data-m=practice]');
  assert.match(text(g), /练习 liànxí Practice/);
  click(g, '[data-a=back]');
  assert.ok(g.run("!!sheet.querySelector('.tiles')"), 'back in the menu');
  assert.equal(g.run('document.activeElement.dataset.m'), 'practice');
});
