// Replying in Chinese: after some lines you choose what to say from phrases you know, with their pinyin and English
// (unless it's switched off), under what you're answering, put in plain English. One that doesn't fit shows why, with
// the one that does, which your monkey says; the one that fits counts as used when you choose it.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const tick = () => new Promise(r => setImmediate(r));
function replyGame(w, extra = {}){
  const game = loadGame({dom: true, save: {version: 10, started: true, w, ...extra}});
  game.run("mode = 'play'; globalThis.__done = false;");
  const box = game.el('#talk'), sheet = game.el('#sheet');
  const run = code => game.run(code);
  return {
    game, box, sheet, run,
    start: best => run(`replyWith(${JSON.stringify(best)}).then(() => { __done = true; })`),
    choices: () => box.querySelectorAll('.reply').map(b => b.querySelector('.rzh').textContent),
    rec: w => JSON.parse(run(`JSON.stringify(rec(${JSON.stringify(w)}))`))
  };
}
const know = (...ws) => Object.fromEntries(ws.map(w => [w, {lv: 1, due: 0, ok: 0}]));

test('the choices are the phrase that fits and up to 2 others you know, with pinyin and English', async () => {
  const t = replyGame(know('你好', '谢谢', '再见', '对不起'));
  t.start('谢谢');
  await tick();
  const choices = t.choices();
  assert.equal(choices.length, 3);
  assert.ok(choices.includes('谢谢'), 'the one that fits is always there');
  for (const c of choices) assert.ok(['你好', '谢谢', '再见', '对不起'].includes(c), `${c} isn't a phrase you know`);
  const b = t.box.querySelector('.reply');
  assert.ok(b.querySelector('.rpy').textContent && b.querySelector('.ren').textContent, 'each shows pinyin and English');
});

test('with English on replies switched off, the choices show Chinese and pinyin only', async () => {
  const t = replyGame(know('你好', '谢谢'), {replyEn: false});
  t.start('谢谢');
  await tick();
  assert.equal(t.box.querySelectorAll('.ren').length, 0);
  assert.equal(t.box.querySelectorAll('.rpy').length, 2);
});

test('choosing the phrase that fits: you say it, and it counts as used', async () => {
  const t = replyGame(know('你好', '谢谢'));
  t.start('谢谢');
  await tick();
  t.box.querySelectorAll('.reply').find(b => b.querySelector('.rzh').textContent === '谢谢').click();
  await tick();
  assert.match(t.box.querySelector('.spk-zh').textContent, /小猴子/, 'your monkey says it');
  assert.ok(t.box.querySelector('.tok.teach[data-t="谢谢"]'));
  assert.equal(t.box.querySelector('.hintline'), null, 'no note: it fits');
  assert.deepEqual([t.rec('谢谢').lv, t.rec('谢谢').used], [4, 1]);
  t.run('pressA()');
  await tick();
  assert.equal(t.run('__done'), true);
});

test('choosing one that doesn’t fit: it says why, with the one that does, and your monkey says that one (not counted as used)', async () => {
  const t = replyGame(know('你好', '谢谢'));
  t.start('谢谢');
  await tick();
  t.box.querySelectorAll('.reply').find(b => b.querySelector('.rzh').textContent === '你好').click();
  await tick();
  const mark = w => t.box.querySelectorAll('.reply').find(b => b.querySelector('.rzh').textContent === w).className;
  assert.match(mark('你好'), /\bno\b/, 'the one you chose doesn’t fit');
  assert.match(mark('谢谢'), /\byes\b/, 'and this one does');
  assert.equal(t.box.querySelector('.why').textContent, '你好 (hello) is for when you meet someone. When someone gives you something or helps you, you say 谢谢 (thank you).');
  assert.equal(t.box.querySelector('.ask').hidden, true, 'why takes the place of what to do, so the box is no taller (it hid you)');
  assert.equal(t.box.querySelector('.spk-zh'), null, 'nothing said yet: it waits for you to read why');
  t.run('pressA()');
  await tick();
  assert.match(t.box.querySelector('.spk-zh').textContent, /小猴子/, 'then your monkey says…');
  assert.ok(t.box.querySelector('.tok.teach[data-t="谢谢"]'), '…the one that fits');
  assert.equal(t.rec('谢谢').lv, 1, 'it isn’t counted as used: you didn’t choose it');
  t.run('pressA()');
  await tick();
  assert.equal(t.run('__done'), true);
});

test('a phrase you don\'t know yet is taught on its own card first', async () => {
  const t = replyGame(know('你好'));
  t.start('再见');
  await tick();
  assert.equal(t.run('modal.hidden'), false, 'a new-word card');
  assert.match(t.sheet.textContent, /再见/);
  t.run('pressA()');   // Got it
  await tick();
  assert.deepEqual(t.choices().sort(), ['你好', '再见'].sort());
});

test('the arrows move between choices and A chooses; B doesn\'t choose', async () => {
  const t = replyGame(know('你好', '谢谢', '再见'));
  t.start('你好');
  await tick();
  const sel = () => t.box.querySelectorAll('.reply').findIndex(b => b.classList.contains('sel'));
  assert.equal(sel(), 0);
  t.game.key('ArrowRight');
  assert.equal(sel(), 1);
  t.game.key('ArrowLeft'); t.game.key('ArrowLeft');
  assert.equal(sel(), 2, 'round to the last one');
  t.run('pressB()');
  assert.equal(t.run('!!talkMove'), true, 'still choosing');
  const fits = t.choices().indexOf('你好');
  while (sel() !== fits) t.game.key('ArrowRight');
  t.game.key(' ');
  await tick();
  assert.ok(t.box.querySelector('.tok.teach[data-t="你好"]'), 'A said the chosen one');
});

test('at the shop, 我不要 turns everything down: taught the first time, then your monkey says it', async () => {
  const t = replyGame({'老板': {lv: 1, due: 0, ok: 0}}, {areas: {1: {elder: 2}}});
  t.run("showDialog = async () => {}; globalThis.__said = []; iSay = async p => { __said.push(p); }; shop(speaker('boss')).then(() => { __done = true; })");
  await tick();
  const no = t.sheet.querySelector('[data-a=no]');
  assert.deepEqual(['.nzh', '.npy', '.nen'].map(c => no.querySelector(c).textContent), ['我不要', 'wǒ bú yào', '· no thanks'], 'Chinese, pinyin and English, as a reply choice shows it');
  no.click();
  await tick();
  assert.match(t.sheet.textContent, /我不要/, 'a new-word card for 我不要');
  t.run('pressA()');
  await tick();
  assert.deepEqual(JSON.parse(t.run('JSON.stringify(__said)')), ['我不要']);
  assert.equal(t.run('__done'), true);
});

test('with English on replies switched off, the shop’s 我不要 still has its pinyin: never characters alone', async () => {
  const t = replyGame({'老板': {lv: 1, due: 0, ok: 0}}, {areas: {1: {elder: 2}}, replyEn: false});
  t.run("showDialog = async () => {}; shop(speaker('boss'))");
  await tick();
  const no = t.sheet.querySelector('[data-a=no]');
  assert.equal(no.querySelector('.npy').textContent, 'wǒ bú yào');
  assert.equal(no.querySelector('.nen'), null, 'no English');
});

test('an animal\'s last question is sometimes a sentence you know with a word missing', async () => {
  const w = Object.fromEntries(['石头', '山', '树', '花', '我', '要', '吃', '桃子'].map(x => [x, {lv: 1, due: 0, ok: 0}]));
  const t = replyGame(w);
  t.run(`Math.random = () => 0; globalThis.__built = []; gapQ = async ({t}) => { __built.push(t.join('')); return true; };
    pictureQ = async () => true; infoBox = async () => {};
    encounter({id:'fox', hz:'狐狸', img:'', wild:true}).then(won => { globalThis.__won = won; __done = true; })`);
  for (let i = 0; i < 5; i++) await tick();
  const built = JSON.parse(t.run('JSON.stringify(__built)'));
  assert.equal(built.length, 1, 'the last question was a sentence with a gap');
  assert.ok(['我要吃桃子', '我要花'].includes(built[0]), `${built[0]} should be a sentence you know`);
  assert.equal(t.run('__won'), true, 'filled right, it counts as a right answer');
});

test('your very first reply, with only one phrase to say, asks you to say it instead of offering a choice', async () => {
  const t = replyGame(know('你好'));
  t.start('你好');
  await tick();
  assert.deepEqual(t.choices(), ['你好']);
  assert.match(t.box.querySelector('.ask').textContent, /Now you say it!$/);
  const two = replyGame(know('你好', '再见'));
  two.start('再见');
  await tick();
  assert.match(two.box.querySelector('.ask').textContent, /What do you say\?$/);
});

test('what you’re answering stays in sight: the line they’ve just said, with who said it, and what’s happening, in plain English', async () => {
  const t = replyGame(know('你好', '谢谢', '不客气', '再见'));
  t.run(`showDialog(speaker('hungry'), L.thanks).then(() => replyWith('不客气')).then(() => { __done = true; })`);
  await tick();
  t.run('pressA()');   // (on from his line)
  await tick();
  const to = t.box.querySelector('.replyto');
  assert.ok(to.querySelector('.tok[data-t="谢谢"]') && to.querySelector('.tok[data-t="你"]'), 'his line, 谢谢你！, still there');
  assert.equal(t.box.querySelector('.ask').textContent, 'The hungry monkey thanks you. What do you say back?');
  const hi = replyGame(know('你好', '再见'));
  hi.run(`showDialog(speaker('troop1'), L.hi).then(() => replyWith('你好'))`);
  await tick(); hi.run('pressA()'); await tick();
  assert.equal(hi.box.querySelector('.ask').textContent, 'The monkey says hello. What do you say back?');
  const sorry = replyGame(know('你好', '没关系'));
  sorry.run(`showDialog(speaker('hungry'), L.sorry).then(() => replyWith('没关系'))`);
  await tick(); sorry.run('pressA()'); await tick();
  assert.equal(sorry.box.querySelector('.ask').textContent, 'The hungry monkey says sorry. What do you say back?');
});

test('a reply to something that isn’t a line, such as a gift: what’s happening, with a picture of it', async () => {
  const t = replyGame(know('你好', '谢谢', '再见', '松鼠', '桃子'));
  t.run(`STEPS.reply({reply: '谢谢', about: 'The {松鼠} gives you a {桃子}.', pic: '桃子'}, 'squirrel').then(() => { __done = true; })`);
  await tick();
  assert.equal(t.box.querySelector('.ask').textContent, 'The 松鼠 (squirrel) gives you a 桃子 (peach). What do you say?');
  assert.ok(t.box.querySelector('.replyto .gift'), 'the peach');
  assert.equal(t.box.querySelector('.replyto .tok'), null, 'and no line: there wasn’t one');
});

test('a phrase’s card says when you say it', async () => {
  const t = replyGame(know('你好'));
  t.start('不客气');
  await tick();
  assert.match(t.sheet.textContent, /Say it when someone thanks you\./);
});

test('every phrase says when you say it, and what someone does that you answer with it, if it’s a reply', () => {
  const t = replyGame({});
  const phrases = JSON.parse(t.run('JSON.stringify(PHRASES.map(p => [p, WORDS[p].use, WORDS[p].cue]))'));
  for (const [p, use, cue] of phrases) assert.ok(/^when /.test(use || ''), `${p}: use says when you say it ("when …")`);
  const replies = JSON.parse(t.run(`JSON.stringify([...new Set([...Object.values(AREA.requests).flatMap(r => [r.thanksReply, r.wrongReply]),
    ...Object.values(AREA.talk).flat().flatMap(p => p.do).filter(s => s.reply && !s.about).map(s => s.reply)].filter(Boolean))])`));
  for (const p of replies) assert.ok(JSON.parse(t.run(`JSON.stringify(WORDS['${p}'].cue || null)`)), `${p} is a reply to a line: it needs a cue`);
});

test('your name over what you say has English that says what it means, and that it’s you: 小猴子, then 美猴王 once you’re king', async () => {
  const t = replyGame(know('你好'));
  const name = () => { const s = t.run("speaker('player')"); return [s.match(/spk-zh">([^ <]+)/)[1], s.match(/spk-en">([^<]+)/)[1]]; };
  assert.deepEqual(name(), ['小猴子', 'Little monkey (you)'], 'it said just You, which isn’t what 小猴子 means');
  t.run('here().cave = 6');
  assert.deepEqual(name(), ['美猴王', 'Handsome Monkey King (you)'], 'it said You, the king');
  t.run("iSay('你好')");
  await tick();
  assert.match(t.box.textContent, /美猴王[\s\S]*Handsome Monkey King \(you\)[\s\S]*你好/, 'over what you say');
});
