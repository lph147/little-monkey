// The screens gallery (tools/screens.html) plays each screen with the game's own functions. If one
// of them is renamed or removed, its screen would quietly go blank, so these check they still exist.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');
const {SCREENS, SAVES} = require('../tools/screens');

const HELPERS = new Set(['wait', 'click', 'next', 'npc', 'play']);   // the gallery's own, set up in each frame
const NOT_CALLS = new Set(['async', 'await', 'if', 'for', 'while', 'return', 'function']);

test('every screen has its own id and a title', () => {
  const ids = SCREENS.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
  for (const s of SCREENS){
    assert.ok(s.title, `${s.id} has a title`);
    if (s.save) assert.ok(SAVES[s.save], `${s.id}: there's no save called ${s.save}`);
  }
});

test('every game function the screens use still exists', () => {
  const game = loadGame();
  for (const s of SCREENS.filter(s => s.run)){
    const src = s.run.toString();
    const own = new Set([...src.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)].map(m => m[1]));   // names the screen makes itself
    const names = [...src.matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]).filter(n => !HELPERS.has(n) && !NOT_CALLS.has(n) && !own.has(n));
    for (const n of names) assert.equal(game.run(`typeof ${n}`), 'function', `${s.id}: the game has no function called ${n}`);
    for (const [, obj, fn] of src.matchAll(/(?<![\w$.])([A-Z][A-Z_]*)\.([A-Za-z_$][\w$]*)\s*\(/g))   // such as ACTIONS.sign(...)
      assert.equal(game.run(`typeof ${obj}.${fn}`), 'function', `${s.id}: the game has no ${obj}.${fn}`);
    for (const [, id] of src.matchAll(/npc\('(\w+)'\)/g)) assert.ok(game.run(`ALL_NPCS.some(n => n.id === ${JSON.stringify(id)})`), `${s.id}: there's no character ${id}`);   // in any place
  }
});

test('the gallery’s saves load as they are, with the player where they say', () => {
  for (const [name, save] of Object.entries(SAVES)){
    const game = loadGame({save});
    const s = JSON.parse(game.run('JSON.stringify(S)'));
    assert.equal(s.version, game.run('SAVE_VERSION'), `${name} is the current save version`);
    assert.deepEqual([s.pos.x, s.pos.y], [save.pos.x, save.pos.y], `${name}: the player can stand there`);
  }
});
