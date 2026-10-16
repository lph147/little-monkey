// A new word taught in a conversation isn't said again on its card (the character has just said it;
// 🔊 Hear it is there), but one you discover yourself is said straight away.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

function heard(code){
  const game = loadGame({dom: true, save: {version: 16, started: true}});
  game.run(`mode = 'play'; globalThis.__said = []; say = t => { __said.push(t); }; ${code}`);
  return JSON.parse(game.run('JSON.stringify(__said)'));
}

test('a word a character teaches is not said again on its card', () => {
  assert.deepEqual(heard("STEPS.newWord({newWord: '你好'}, 'elder')"), [], 'the old monkey has just said 你好');
  assert.deepEqual(heard("replyWith('谢谢')"), [], 'a phrase taught for a reply');
});

test('a word you discover yourself is said on its card', () => {
  assert.deepEqual(heard("lookAt({word: '树', look: 'tree'})"), ['树'], 'looking at a tree');
  assert.deepEqual(heard("STEPS.card({card: '石头'})"), ['石头'], 'the stone you were born from, at the start');
});

test('the card still has 🔊 Hear it, to hear the word any time', () => {
  const game = loadGame({dom: true, save: {version: 16, started: true}});
  game.run("globalThis.__said = []; say = t => { __said.push(t); }; showNotice('你好', {quiet: true})");
  game.el('#sheet').querySelector('[data-a=say]').click();
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(__said)')), ['你好']);
});
