// Your first words: the old monkey sends you off to learn 4, and a playtester got stuck finding them (24 October 2026).
// So the task says what to look for (things that sparkle: walk up to one and press A), its arrow bobs over the nearest
// one, and the sparkles are bigger and never go out until you've learned the 4.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const knowing = words => Object.fromEntries(words.map(hz => [hz, {lv: 1, due: 0, ok: 0}]));
// Just sent off by the old monkey, standing below him by your stone (or knowing more words, or elsewhere)
function game(words = [], pos = {place: 'meadow', x: 9, y: 3, dir: 'down'}, area = {elder: 1}){
  const g = loadGame({save: {version: 30, started: true, w: knowing(['石头', '你好', ...words]), areas: {1: area}, pos}});
  g.run('placePlayer()');
  return g;
}
const task = g => get(g, 'getTasks().find(t => t.id === "learn4") || null');

test('the task says what to look for: things that sparkle, walk up to one and press A', () => {
  const t = task(game());
  assert.equal(t.text, 'Learn 4 words: walk up to things that sparkle ✨ and press A (0/4)');
  const g = loadGame({dom: true, save: {version: 30, started: true, w: knowing(['石头', '你好']), areas: {1: {elder: 1}}}});
  g.run('placePlayer(); tasksPage(() => closeCard())');
  assert.match(g.el('#sheet').innerHTML, /things that sparkle <img class="icon"[^>]*> and press A/, 'with the pixel sparkle, as on the map');
});

test('the old monkey says it too, when he sends you off and if you come back too soon, in a message after his line with the sparkle beside it', () => {
  const g = game([], undefined, {elder: 0});
  const hints = get(g, "AREA.talk.elder.slice(0, 2).map(p => p.do.find(s => s.say === 'go').hint)");
  assert.deepEqual(hints, ['✨ Things that sparkle have words. Walk up to one and press A. Learn 4, then come back to the old monkey.',
    '✨ Learn 4 words first, then come back ({newWords}/4). Things that sparkle have words: walk up to one and press A.']);
});

test('the arrow bobs over the nearest thing that sparkles, stays on it as you walk, and moves on once you know its word', () => {
  const g = game();
  assert.deepEqual(task(g).target, [12, 3], 'the cliff beside the old monkey (山)');
  g.run("S.pos = {place: 'meadow', x: 5, y: 9, dir: 'up'}; placePlayer()");
  assert.deepEqual(task(g).target, [12, 3], 'still the cliff, though the long grass is nearer now: it doesn’t jump about as you walk');
  g.run("setSeen('山')");
  assert.deepEqual(task(g).target, [5, 7], 'then the nearest from where you are: the long grass (草)');
  g.run("setSeen('草')");
  assert.deepEqual(task(g).target, [11, 9], 'then the fish in the pond (鱼)');
});

test('it never points at something that isn’t sparkling: a word you know, or one that waits for another', () => {
  const g = game(['山', '花', '草']);
  const sparkling = get(g, 'SPARKLES.filter(s => s.word && sparkling(s)).map(s => s.word)');
  assert.ok(!sparkling.includes('山') && !sparkling.includes('石头'), 'not the words you know');
  const at = task(g).target, aimed = get(g, `SPARKLES.find(s => s.at[0] === ${at[0]} && s.at[1] === ${at[1]}).word`);
  assert.ok(sparkling.includes(aimed), `the arrow is over ${aimed}, which sparkles`);
});

test('once you know 4 words, the task and its arrow give way to going back to the old monkey', () => {
  const g = game(['山', '花', '草', '树']);
  assert.equal(task(g), null);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['elder2']);
});

test('the sparkles are bigger only while you learn your first words: not before the old monkey sends you, nor after', () => {
  const big = g => g.run('matches(AREA.bigSparkles)');
  assert.equal(big(game([], undefined, {elder: 0})), false, 'before he sends you off: your eyes are on him');
  assert.equal(big(game()), true, 'sent off, knowing none yet');
  assert.equal(big(game(['山', '花', '草'])), true, 'three of the four');
  assert.equal(big(game(['山', '花', '草', '树'])), false, 'all four: back to the usual sparkles');
  assert.equal(big(game(['山', '花', '草', '树'], undefined, {elder: 2})), false, 'and for the rest of the game');
});
