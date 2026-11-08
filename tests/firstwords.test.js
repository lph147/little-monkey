// Your first words: the old monkey sends you off to learn some, and a playtester got stuck finding them (24 October 2026).
// So the task says what to look for (things that sparkle: walk up to one and press A), its arrow bobs over the nearest
// one, and the sparkles twinkle bigger until you've learned them. Since 8 November 2026 (the gentler prologue), just two
// sparkle, the mountain and a tree, and what to do is in the task, not in notes after his line.
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
  assert.equal(t.text, 'Find the two things that sparkle ✨: walk up to them and press A (0/2)');
  const g = loadGame({dom: true, save: {version: 30, started: true, w: knowing(['石头', '你好']), areas: {1: {elder: 1}}}});
  g.run('placePlayer(); tasksPage(() => closeCard())');
  assert.match(g.el('#sheet').innerHTML, /things that sparkle <img class="icon"[^>]*>: walk up to them and press A/, 'with the pixel sparkle, as on the map');
});

test('the old monkey just says 去看看！, when he sends you off and if you come back too soon: what to do is in your task (less to read)', () => {
  const g = game([], undefined, {elder: 0});
  const parts = get(g, "AREA.talk.elder.slice(0, 2).map(p => p.do.filter(s => s.say === 'go' || s.message).map(s => [s.say || 'message', s.hint || null]))");
  assert.deepEqual(parts, [[['go', null]], [['go', null]]]);
});

test('the arrow bobs over the nearest thing that sparkles, stays on it as you walk, and moves on once you know its word', () => {
  const g = game();
  assert.deepEqual(task(g).target, [12, 3], 'the cliff beside the old monkey (山)');
  g.run("S.pos = {place: 'meadow', x: 5, y: 9, dir: 'up'}; placePlayer()");
  assert.deepEqual(task(g).target, [12, 3], 'still the cliff, though the long grass is nearer now: it doesn’t jump about as you walk');
  g.run("setSeen('山')");
  assert.deepEqual(task(g).target, [12, 8], 'then the other, the tree (树): the flowers and the long grass don’t sparkle yet');
  g.run("setSeen('树')");
  assert.equal(task(g), null, 'both found');
});

test('it never points at something that isn’t sparkling: a word you know, or one that waits for another', () => {
  const g = game(['山', '花', '草']);
  const sparkling = get(g, 'SPARKLES.filter(s => s.word && sparkling(s)).map(s => s.word)');
  assert.ok(!sparkling.includes('山') && !sparkling.includes('石头'), 'not the words you know');
  const at = task(g).target, aimed = get(g, `SPARKLES.find(s => s.at[0] === ${at[0]} && s.at[1] === ${at[1]}).word`);
  assert.ok(sparkling.includes(aimed), `the arrow is over ${aimed}, which sparkles`);
});

test('once you know both, the task and its arrow give way to going back to the old monkey', () => {
  const g = game(['山', '树']);
  assert.equal(task(g), null);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['elder2']);
});

test('the sparkles are bigger only while you learn your first words: not before the old monkey sends you, nor after', () => {
  const big = g => g.run('matches(AREA.bigSparkles)');
  assert.equal(big(game([], undefined, {elder: 0})), false, 'before he sends you off: your eyes are on him');
  assert.equal(big(game()), true, 'sent off, knowing none yet');
  assert.equal(big(game(['山'])), true, 'one of the two');
  assert.equal(big(game(['山', '树'])), false, 'both: back to the usual sparkles');
  assert.equal(big(game(['山', '树'], undefined, {elder: 2})), false, 'and for the rest of the game');
});

test('showing the old monkey your first words counts each one as practice, as the exam does (it counted none)', async () => {
  const g = game(['山', '树', '花', '草']);
  g.run("save = () => {}; closeCard = () => {}; SFX.fanfare = () => {}; matchWords = async words => new Set([words[0]])");
  const before = g.run('S.turn || 0');
  await g.run("STEPS.match({match: 'Show the old monkey your words'})");
  assert.equal(g.run('S.turn') - before, 5, 'all five words with pictures you know: 石头 山 树 花 草 (你好 is a phrase)');
  assert.equal(get(g, "ORDER.filter(w => WORDS[w].pic && lvl(w) >= 1).filter(w => rec(w).ok === 1).length"), 4, 'four matched first time, one missed');
});
