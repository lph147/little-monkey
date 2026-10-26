// While someone talks, the speech box is at the bottom of the screen, unless it would cover you or whoever you're
// talking to: then it's at the top instead, for the whole conversation, through cards. The map never moves for it.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

function scene({x, y, dir}){
  const game = loadGame({dom: true, save: {version: 16, started: true}});
  game.run(`mode = 'play'; S.pos = {x:${x}, y:${y}, dir:'${dir}'}; placePlayer(); cv.clientHeight = 320; talkBox.offsetHeight = 150;`);
  return {game, top: () => game.run(`placeTalk(); talkBox.classList.contains('top')`), run: c => game.run(c)};
}

test('if you and the character are both above the speech box, it stays at the bottom', () => {
  const t = scene({x: 9, y: 2, dir: 'left'});   // at the top of the map, by the stone
  t.run('talkBox.hidden = false; busy = true');
  assert.equal(t.top(), false);
});

test('if one of you would be covered, the box is at the top, and stays there through cards until the conversation ends', () => {
  const t = scene({x: 11, y: 15, dir: 'down'});   // facing the shop owner, low on the map
  t.run('talkBox.hidden = false; busy = true');
  assert.equal(t.top(), true, 'the box goes to the top, so you can both be seen');
  t.run('talkBox.hidden = true');   // a card opens between lines (the shop, a gap question)
  assert.equal(t.top(), true, 'it stays at the top while the conversation goes on');
  t.run('talkBox.hidden = false; talkBox.offsetHeight = 60');   // the next line, in a shorter box that wouldn't cover you
  assert.equal(t.top(), true, 'a shorter box does not make it jump back');
  t.run('talkBox.hidden = true; busy = false');   // the conversation is over
  assert.equal(t.top(), false, 'then the next conversation starts at the bottom again');
});

test('whoever’s speaking from further off is not under it either (the thirsty monkey as you bring the cow home), unless at the top it would cover you', () => {
  const t = scene({x: 11, y: 9, dir: 'left'});
  t.run('talkBox.offsetHeight = 100');   // (a box that covers you neither at the bottom nor at the top)
  const [cy, x, y] = JSON.parse(t.run('JSON.stringify([camY(), pl.x, pl.y])'));
  assert.ok(cy > 0, 'the view has you in the middle');
  t.run(`Object.assign(NPCS.find(n => n.id === 'elder'), {x: ${x + 2}, y: ${y + 2}}); busy = true; showDialog(speaker('elder'), L.hi)`);
  assert.equal(t.run(`talkBox.classList.contains('top')`), true, 'he’s two squares below you: the box goes to the top');
  t.run('talkBox.hidden = true; busy = false; placeTalk()');
  t.run(`Object.assign(NPCS.find(n => n.id === 'elder'), {x: ${x + 2}, y: ${y - 2}}); busy = true; showDialog(speaker('elder'), L.hi)`);
  assert.equal(t.run(`talkBox.classList.contains('top')`), false, 'above you, he’s clear of it at the bottom');
  t.run('talkBox.hidden = true; busy = false; placeTalk()');
  const top = scene({x: 9, y: 2, dir: 'left'});   // at the top of the map: a box at the top would cover you
  top.run('talkBox.offsetHeight = 100');
  top.run(`Object.assign(NPCS.find(n => n.id === 'elder'), {x: 10, y: 8}); busy = true; showDialog(speaker('elder'), L.hi)`);
  assert.equal(top.run(`talkBox.classList.contains('top')`), false, 'you come first');
});

test('the box is at the top from the moment a line shows, before the screen is drawn again', () => {
  const t = scene({x: 11, y: 15, dir: 'down'});
  t.run(`busy = true; showDialog(speaker('elder'), L.hi)`);
  assert.equal(t.run(`talkBox.hidden`), false);
  assert.equal(t.run(`talkBox.classList.contains('top')`), true, 'showing the line puts it at the top');
});
