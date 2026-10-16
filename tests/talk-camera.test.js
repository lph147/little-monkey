// While someone talks, the map only slides up if you or they would be hidden by the speech box, and
// then stays put for the whole conversation, through cards, instead of shifting back and forth.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

function scene({x, y, dir}){
  const game = loadGame({dom: true, save: {version: 16, started: true}});
  game.run(`mode = 'play'; S.pos = {x:${x}, y:${y}, dir:'${dir}'}; placePlayer(); cv.clientHeight = 320; talkBox.offsetHeight = 150;`);
  const base = () => game.run(`Math.round(clamp(pl.py + 8 - VH*T/2, 0, ROWS*T - VH*T))`);
  const frame = () => game.run(`talkCamera(${base()})`);
  const frames = n => { let v; for (let i = 0; i < n; i++) v = frame(); return v; };
  return {game, base, frame, frames, run: c => game.run(c)};
}

test('if you and the character are both above the speech box, the map does not move', () => {
  const t = scene({x: 9, y: 2, dir: 'left'});   // at the top of the map, by the stone
  t.run('talkBox.hidden = false; busy = true');
  assert.equal(t.frames(10), t.base());
});

test('if one of you would be covered, the map slides up, and stays put through cards until the conversation ends', () => {
  const t = scene({x: 11, y: 15, dir: 'down'});   // facing the shop owner, low on the map
  t.run('talkBox.hidden = false; busy = true');
  const up = t.frames(10);
  assert.notEqual(up, t.base(), 'the map moves so you can both be seen');
  t.run('talkBox.hidden = true');   // a card opens between lines (the shop, a gap question)
  assert.equal(t.frames(10), up, 'it stays put while the conversation goes on');
  t.run('talkBox.hidden = false; talkBox.offsetHeight = 120');   // the next line, in a shorter box
  assert.equal(t.frames(10), up, 'a shorter box does not make it shift back');
  t.run('talkBox.hidden = true; busy = false');   // the conversation is over
  assert.equal(t.frames(10), t.base(), 'then it slides back');
});
