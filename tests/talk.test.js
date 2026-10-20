// The speech box: what characters say appears in a box over the bottom of the map, not on a card.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const tick = () => new Promise(r => setImmediate(r));
function talkGame(save){
  const game = loadGame({dom: true, save: save || {version: 8, started: true}});
  game.run("mode = 'play'");   // walking about, past the title screen
  const box = game.el('#talk');
  return {
    game, box,
    run: code => game.run(code),
    talking: () => game.run('!!talkNext'),
    say(line, opts = {}){   // a character says a line; gives a promise for when it's moved on
      game.run(`globalThis.__said = false; showDialog(speaker('elder'), L.${line}, ${JSON.stringify(opts)}).then(() => { globalThis.__said = true; })`);
    },
    said: async () => { await tick(); return game.run('__said'); }
  };
}

test('talk appears in the speech box, with the map still showing', () => {
  const t = talkGame();
  t.say('hi', {teach: '你好'});
  assert.equal(t.box.hidden, false, 'the speech box should show');
  assert.notEqual(t.run('modal.hidden'), false, 'no card should cover the map');
  assert.ok(t.box.querySelector('.tok.teach[data-t="你好"]'), 'the word being taught is bold');
  assert.equal(t.box.querySelector('.spk-zh').textContent.trim().startsWith('老猴子'), true, 'the speaker\'s name shows');
  assert.equal(t.box.querySelector('[data-a=ok]').dataset.label, 'Next');
});

test('a line\'s English shows the first time, then behind the English button', () => {
  const t = talkGame();
  t.say('go');
  assert.equal(t.box.querySelector('.sentence-en').hidden, false, 'English underneath the first time');
  assert.equal(t.box.querySelector('[data-a=en]'), null, 'no English button the first time');
  t.run('pressA()');
  t.say('go');
  assert.equal(t.box.querySelector('.sentence-en').hidden, true, 'English hidden the second time');
  t.box.querySelector('[data-a=en]').click();
  assert.equal(t.box.querySelector('.sentence-en').hidden, false, 'the English button shows it');
  assert.equal(t.box.querySelector('[data-a=en]'), null, 'and goes away');
});

test('A, B and the ▼ button each move on', async () => {
  const t = talkGame();
  for (const press of ['pressA()', 'pressB()', "talkBox.querySelector('[data-a=ok]').click()"]){
    t.say('go');
    assert.equal(await t.said(), false);
    t.run(press);
    assert.equal(await t.said(), true, `${press} should move on`);
    assert.equal(t.talking(), false);
  }
  t.game.flush();
  assert.equal(t.box.hidden, true, 'the box closes after the last line');
});

test('lines one after another change in place, without the box closing in between', () => {
  const t = talkGame();
  t.say('hi');
  assert.equal(t.box.classList.contains('again'), false, 'the first line rises into view');
  t.run('pressA()');
  t.say('go');   // the next line, straight away
  assert.equal(t.box.classList.contains('again'), true, 'the next line just replaces it');
  t.game.flush();
  assert.equal(t.box.hidden, false, 'the box stays up for the next line');
});

test('tapping a word shows its meaning; the tip about it only shows for your first few lines', () => {
  const t = talkGame();
  t.say('go');
  assert.match(t.box.querySelector('.gloss').textContent, /Tap any word/);
  assert.ok(t.box.querySelector('.talkfoot').classList.contains('tip'), 'with the tip, Next goes on its own row under the English');
  t.box.querySelector('.tok[data-t="去"]').click();
  assert.match(t.box.querySelector('.gloss').textContent, /去 qù · to go/);
  const lines = Object.fromEntries(['a', 'b', 'c', 'd', 'e'].map(k => [k, 1]));   // five lines seen already
  const later = talkGame({version: 8, started: true, lines});
  later.say('go');
  assert.equal(later.box.querySelector('.gloss').textContent, '', 'no tip once you\'ve seen a few lines');
  assert.equal(later.box.querySelector('.talkfoot').classList.contains('tip'), false, 'and Next sits beside the English');
});

test('a hint shows in the box, and a different button text', () => {
  const t = talkGame();
  t.say('go', {hint: 'Learn 4 words first.', ok: 'Give it'});
  assert.equal(t.box.querySelector('.hintline').textContent, 'Learn 4 words first.');
  assert.match(t.box.querySelector('[data-a=ok]').textContent, /Give it/);
  assert.equal(t.box.querySelector('[data-a=ok]').dataset.label, 'Give it');
});

test('while someone is talking you can\'t walk off or open the menu', () => {
  const t = talkGame();
  t.say('go');
  t.game.key('ArrowDown');
  assert.equal(t.run('queued'), null, 'the arrow key should not queue a step');
  t.game.key('m');
  assert.equal(t.run('canAct()'), false);
  assert.equal(t.talking(), true, 'still talking');
  t.game.key(' ');
  assert.equal(t.talking(), false, 'Space moves on');
});

test('a message in a conversation waits in the speech box, so the next line can\'t cover it', async () => {
  const t = talkGame();
  t.run("globalThis.__done = false; runSteps([{message: 'Every baby monkey explores the mountain.'}, {say: 'go'}], 'elder').then(() => { __done = true; })");
  assert.equal(t.box.hidden, false, 'it shows in the speech box');
  assert.match(t.box.querySelector('.narration').textContent, /Every baby monkey explores the mountain/);
  assert.equal(t.game.el('#saybox').hidden, true, 'not as a message that the next line would hide');
  t.run('pressA()');
  await tick();
  assert.ok(t.box.querySelector('.tok'), 'A moves on to the next line');
});

test('a message outside a conversation is a message at the bottom of the screen', () => {
  const t = talkGame();
  t.run("runSteps([{message: 'A rumble from the mountain!'}])");
  assert.equal(t.box.hidden, true);
  assert.match(t.game.el('#saybox').innerHTML, /A rumble/);
});

test('punctuation stays on the same line as the word before it', () => {
  const t = talkGame();
  t.say('hungry');
  const marks = t.box.querySelectorAll('.punct');
  assert.ok(marks.length >= 2);
  for (const p of marks) assert.ok(p.parentElement.classList.contains('nb'), `${p.textContent} is kept with its word`);
});

// The prologue's guide (18 October 2026): the characters say what to do, instead of prompts.
test('the old monkey introduces himself and the mountain, after your first 你好', () => {
  const steps = JSON.parse(loadGame().run('JSON.stringify(AREA.talk.elder[0].do)'));
  const i = steps.findIndex(s => s.reply === '你好');
  assert.equal(steps[i + 1].say, 'iamOld');
  assert.equal(loadGame().run("L.iamOld.t.join('')"), '我是老猴子。这是花果山。');
});

test('the old monkey checks in on what the troop has asked you for, then sends you to whoever still needs help', () => {
  const said = save => { const g = loadGame({save: {version: 22, started: true, ...save}}); return g.run("(AREA.talk.elder.find(p => !p.if || matches(p.if)).do[0] || {}).say"); };
  const area = more => ({areas: {1: {chapter: 0, elder: 2, hungry: 'not asked', thirsty: 'not asked', flowers: 'not asked', ...more}}});
  assert.equal(said(area({hungry: 'asked'})), 'hungryWants');
  assert.equal(said(area({hungry: 'done', thirsty: 'asked'})), 'thirstyWants');
  assert.equal(said(area({hungry: 'done', thirsty: 'done', flowers: 'asked'})), 'bigWants');
  assert.equal(said(area({hungry: 'done'})), 'findMonkeys', 'someone still needs help');
  assert.equal(said(area({hungry: 'done', thirsty: 'done', flowers: 'done'})), 'hi', 'nobody needs help: hello, and your tasks');
});

test('the hungry and thirsty monkeys say where to look, and each of the troop has something to say', () => {
  const g = loadGame();
  const parts = who => JSON.parse(g.run(`JSON.stringify(AREA.talk.${who})`));
  assert.ok(parts('hungry').some(p => p.do.some(s => s.say === 'fruitOnTrees')));
  assert.ok(parts('thirsty').some(p => p.do.some(s => s.say === 'waterInRiver')));
  assert.equal(parts('troop3').at(-1).do.at(-1).say, 'birdsInTrees');
  // the two across the river give advice (19 October 2026): where the animals are, then practising; the shop's apples
  const says = who => parts(who).flatMap(p => p.do.map(s => s.say || (s.message ? 'message' : ''))).filter(Boolean);
  assert.ok(says('troop1').includes('findAnimals') && says('troop1').includes('message'));
  assert.ok(says('troop2').includes('bossHasApples') && says('troop2').includes('message'));
});

test('再见 is taught as you set off up the mountain path: the old monkey says it, and you say it back', () => {
  const g = loadGame();
  const part = cond => JSON.parse(g.run(`JSON.stringify(AREA.talk.elder.find(p => p.if && ${cond}).do.map(s => s.reply || s.newWord || s.say || Object.keys(s)[0]))`));
  const setOff = part('p.if.gate === true && p.if.climb === 0');
  assert.ok(setOff.indexOf('bye') >= 0 && setOff.indexOf('再见') === setOff.indexOf('bye') + 1, 'he says goodbye, and you reply');
  assert.ok(!setOff.includes('棍子'), 'not in the same conversation as the stick: one new word at a time');
  assert.ok(!part('p.if.elder === 1 && !p.if.newWords').includes('再见'), 'not when he tells you about the animals');
  // the big monkey gives you the stick on your way: its own conversation, with nothing else new
  const stick = JSON.parse(g.run(`JSON.stringify(AREA.talk.big.find(p => p.if && p.if.new === '棍子').do.map(s => s.reply || s.newWord || s.say || Object.keys(s)[0]))`));
  assert.deepEqual(stick.filter(s => s !== 'message'), ['stickHere', '棍子']);
});

test('back with your first words, the old monkey checks them: you match them to their pictures, then he tells you about the animals', async () => {
  const g = loadGame({save: {version: 27, started: true, w: Object.fromEntries(['石头', '山', '花', '草', '树'].map(w => [w, {lv: 1, due: 0, ok: 0}])), areas: {1: {elder: 1}}}});
  g.run("mode = 'play'; globalThis.__said = []; showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNotice = async () => {}; showNarration = async () => {}; toast = () => {}");
  g.run("globalThis.__matched = null; matchWords = async words => { __matched = words; return new Set(); }");
  await g.run("talk(ALL_NPCS.find(n => n.id === 'elder'))");
  assert.deepEqual(JSON.parse(g.run('JSON.stringify(__matched)')).sort(), ['山', '石头', '树', '花', '草'].sort(), 'the words you’ve learned');
  const said = JSON.parse(g.run('JSON.stringify(__said)'));
  assert.ok(said.indexOf('太好了！') >= 0 && said.indexOf('太好了！') < said.findIndex(s => s.includes('动物')), 'well done, then the animals');
  assert.equal(g.run('here().elder'), 2);
  const stop = loadGame({save: {version: 27, started: true, w: Object.fromEntries(['石头', '山', '花', '草', '树'].map(w => [w, {lv: 1, due: 0, ok: 0}])), areas: {1: {elder: 1}}}});
  stop.run("mode = 'play'; showDialog = showNotice = showNarration = async () => {}; toast = () => {}; matchWords = async () => null");
  await stop.run("talk(ALL_NPCS.find(n => n.id === 'elder'))");
  assert.equal(stop.run('here().elder'), 1, 'stopped: he waits until you’re ready');
});

test('the big monkey waits in the way up to stop you with the stick, and only until he has given it to you', () => {
  const big = w => { const g = loadGame({save: {version: 29, started: true, w, areas: {1: {elder: 2, gate: true, climb: 1}}}}); g.run('placeCharacters()');
    return JSON.parse(g.run(`JSON.stringify((({place, x, y}) => [place, x, y])(ALL_NPCS.find(n => n.id === 'big')))`)); };
  assert.deepEqual(big({}), ['meadow', 16, 1], 'in the gap where the rocks were: you can’t go up without passing him');
  assert.deepEqual(big({'棍子': {lv: 1, ok: 0}}), ['meadow', 17, 3], 'back beside it once you have the stick');
});
