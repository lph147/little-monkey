// Tips instead of How to play: a new game goes straight to being born from the stone, and a bubble points
// at a control the first time you need it. Each tip shows once.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
const showing = game => game.run('tip ? tip.id : null');
function playing(save){   // walking about on the mountain, nothing open
  const game = loadGame({dom: true, save});
  game.run("mode = 'play'; placePlayer();");
  return game;
}

test('a new game starts with being born from the stone, not a page of How to play', () => {
  const game = loadGame({dom: true});
  game.run('startGame()');
  const html = game.el('#sheet').innerHTML;
  assert.ok(!/How to play/.test(html), 'no How to play');
  assert.match(html, /石头/, 'the stone’s new-word card comes first');
});

test('the first tip points at the D-pad, and goes once you take a step', () => {
  const game = playing();
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'walk');
  game.run("pl.mv = {fx:9, fy:2, tx:9, ty:3, t0:1000}; updateTips(1100)");
  assert.equal(showing(game), null);
  assert.equal(get(game, 'S.tips.walk'), 1, 'it won’t show again');
});

test('facing someone for the first time, a tip says to press A to talk; pressing A is enough', () => {
  const game = playing({version: 17, started: true, tips: {walk: 1}, pos: {x: 7, y: 2, dir: 'up'}});   // facing the old monkey
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'talk');
  assert.match(game.run("$('#tip').innerHTML"), /Press <b>A<\/b> to talk/);
  game.run("tipPressed('#btnA')");
  assert.equal(get(game, 'S.tips.talk'), 1);
  assert.equal(showing(game), null);
});

test('facing something to look at, the tip says to press A to look', () => {
  const game = playing({version: 17, started: true, tips: {walk: 1, talk: 1}, pos: {x: 12, y: 7, dir: 'down'}});   // facing the tree, a new word
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'look');
});

test('Tasks and Menu have no tips: the old monkey tells you about them instead', () => {
  const w = Object.fromEntries(['石头', '山', '花'].map(hz => [hz, {lv: 1, due: 0, ok: 0}]));
  const game = playing({version: 21, started: true, w, tips: {walk: 1, talk: 1, look: 1, grey: 1}, pos: {x: 9, y: 5, dir: 'down'}});
  game.run('updateTips(1000)');
  assert.equal(showing(game), null, 'no tip, though there is a task and you know 3 words');
  const said = JSON.stringify(get(game, 'AREA.talk.elder'));
  assert.match(said, /press TASKS/, 'the old monkey mentions TASKS');
  assert.match(said, /MENU shows the words/, 'and MENU');
});

test('your very first line, 你好 with its English right under it: no tip to tap a word, nothing to find out', () => {
  const game = playing({version: 17, started: true, tips: {walk: 1, talk: 1, look: 1}});
  game.run("showDialog(speaker('elder'), L.hi, {teach: '你好'})");
  game.run('updateTips(1000)');
  assert.equal(showing(game), null);
});

test('the grey-words tip shows during a line, once; A then lights one grey word to tap, before moving on', () => {
  const game = playing({version: 17, started: true, tips: {walk: 1, talk: 1, look: 1}});
  game.run("showDialog(speaker('elder'), L.go)");
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'grey');
  assert.equal(get(game, 'S.tips.grey'), 1, 'it counts as seen straight away');
  const grey = game.el('#talk').querySelectorAll('.tok.listen');
  assert.ok(grey.length > 1 && grey.every(t => t.classList.contains('tipglow')), 'every grey word lit, not just the first');
  game.run('pressA()');
  assert.equal(showing(game), 'tap', 'A: the tip to tap a word, not the next line');
  assert.equal(game.run("$('#tip').innerHTML"), 'Tap a word to see what it means');
  assert.ok(!game.el('#talk').hidden, 'the line is still there');
  const lit = game.el('#talk').querySelectorAll('.tipglow');
  assert.equal(lit.length, 1, 'just one word lit');
  assert.ok(lit[0].classList.contains('listen'), 'a grey one, a word worth finding out');
  assert.equal(get(game, 'S.tips.tap'), 1);
  game.run(`talkBox.querySelector('.tok.tipglow').click()`);
  assert.equal(showing(game), null, 'tapping it: the tip goes');
  assert.match(game.run("talkBox.querySelector('.talkline .gloss').textContent"), /去 qù/, 'and its meaning shows beside the line');
  game.run('pressA()');
  assert.equal(game.run('talkNext'), null, 'A again moves on');
});

test('the tip to tap a word only comes after the grey-words tip', () => {
  const game = playing({version: 17, started: true, tips: {walk: 1, talk: 1, look: 1, grey: 1}});
  game.run("showDialog(speaker('elder'), L.go)");
  game.run('updateTips(1000)');
  assert.equal(showing(game), null);
  game.run('pressA()');
  assert.ok(game.el('#talk').hidden || !game.run('talkNext'), 'A moves on as usual');
});

test('the first line you hear again, without its English: a tip points at the English button, once', () => {
  const tips = {walk: 1, talk: 1, look: 1, grey: 1, tap: 1};
  const game = playing({version: 17, started: true, tips, lines: {'去看看！': 1}});
  game.run("showDialog(speaker('elder'), L.go)");
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'english');
  assert.match(game.run("$('#tip').innerHTML"), /shows the first time you hear it\. Tap <b>English<\/b> to see it again/);
  assert.ok(game.el('#talk').querySelector('[data-a=en]').classList.contains('tipglow'), 'pointing at the English button');
  assert.equal(get(game, 'S.tips.english'), 1, 'it counts as seen straight away');
  const first = playing({version: 17, started: true, tips});
  first.run("showDialog(speaker('elder'), L.go)");
  first.run('updateTips(1000)');
  assert.equal(showing(first), null, 'not while a line still shows its English');
});

test('no tips on the title screen or in the opening', () => {
  const game = loadGame({dom: true});
  game.run('updateTips(1000)');
  assert.equal(showing(game), null);
});

test('with honey in your bag the first time, a tip by MENU says to eat it to walk faster, and how; pressing MENU is enough', () => {
  // (decided 26 October 2026: honey made you faster, but nothing said so where you'd see it)
  const all = {walk: 1, talk: 1, look: 1, grey: 1, tap: 1, english: 1};
  const none = playing({version: 30, started: true, tips: all, bag: {'桃子': 1}, pos: {x: 9, y: 4, dir: 'down'}});
  none.run('updateTips(1000)');
  assert.equal(showing(none), null, 'a peach is for fights: no tip');
  const game = playing({version: 30, started: true, tips: all, bag: {'蜂蜜': 1}, pos: {x: 9, y: 4, dir: 'down'}});
  game.run('updateTips(1000)');
  assert.equal(showing(game), 'eat');
  assert.match(game.run("$('#tip').innerHTML"), /Eat the 蜂蜜 \(honey\) in your bag to walk faster for a minute: press <b>X<\/b> for your bag, and tap it\./);
  assert.equal(game.run("tip.target === $('#btnX')"), true, 'pointing at X, your bag');
  game.run("tipPressed('#btnX')");
  assert.equal(get(game, 'S.tips.eat'), 1, 'it won’t show again');
});
