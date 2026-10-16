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
  t.box.querySelector('.tok[data-t="去"]').click();
  assert.match(t.box.querySelector('.gloss').textContent, /去 qù · to go/);
  const lines = Object.fromEntries(['a', 'b', 'c', 'd', 'e'].map(k => [k, 1]));   // five lines seen already
  const later = talkGame({version: 8, started: true, lines});
  later.say('go');
  assert.equal(later.box.querySelector('.gloss').textContent, '', 'no tip once you\'ve seen a few lines');
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
