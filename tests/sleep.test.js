// Sleeping in the cave's beds (19 October 2026): once you know 床 (bed), A at a bed sleeps in it, and you wake with
// your health full. A monkey just inside the cave's entrance tells you so once the troop has moved in, teaching 睡觉.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
const knows = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
// In the cave, just below the bed at the top left, facing it.
function byBed(save = {}){
  const game = loadGame({dom: true, save: {version: 27, started: true, areas: {1: {gate: true, climb: 3, story: true, cave: 2}}, pos: {place: 'cave', x: 1, y: 2, dir: 'up'}, ...save}});
  game.run("mode = 'play'; placePlayer(); globalThis.__cards = []; globalThis.__toasts = []; showNotice = async w => { __cards.push(w); }; showNarration = showDialog = async () => {}; toast = t => { __toasts.push(t); }");
  return game;
}
async function finish(game, code){   // run code that waits on timers (sleeping takes a moment)
  let done = false;
  game.run(code).then(() => { done = true; });
  for (let i = 0; i < 500 && !done; i++){ await new Promise(r => setImmediate(r)); game.flush(); }
  assert.ok(done, `${code} finishes`);
}

test('a bed: A looks at it until you know 床, then sleeps in it, and you wake with your health full', async () => {
  const before = byBed({health: 20});
  assert.equal(before.run('promptFor(1, 1)'), 'Look', 'before you know 床, A looks at the bed');
  await finish(before, 'interact(1, 1)');
  assert.deepEqual(get(before, '__cards'), ['床'], 'and teaches 床');
  assert.equal(before.run('S.health'), 20, 'no sleeping yet');

  const game = byBed({health: 20, w: knows(['床'])});
  assert.equal(game.run('promptFor(1, 1)'), 'Sleep', 'once you know 床, A says Sleep');
  const at = [game.run('pl.px'), game.run('pl.py')];
  game.run("globalThis.__beds = []; globalThis.__tops = []; (() => { let v = pl.py; Object.defineProperty(pl, 'py', {get: () => v, set: n => { v = n; __tops.push(n); if (sleepAt) __beds.push(sleepAt.x + ',' + sleepAt.y); }, configurable: true}); })()");
  await finish(game, 'interact(1, 1)');
  assert.ok(Math.min(...get(game, '__tops')) <= 16 - 3, 'you hop up onto the bed');
  assert.deepEqual([...new Set(get(game, '__beds'))], ['1,1'], 'and lie in it while you sleep');
  assert.equal(game.run('sleepAt'), null, 'then you get up again');
  assert.deepEqual([game.run('pl.px'), game.run('pl.py')], at, 'back where you stood');
  assert.equal(game.run('pl.dir'), 'down', 'facing the room');
  assert.ok(game.run('wakeT') > 0, 'sparkling');
  assert.deepEqual(get(game, '__cards'), ['睡觉'], 'the first time, a card teaches 睡觉 (sleep)');
  assert.ok(game.run('sleepT') > 0, 'the screen goes dark while you sleep');
  assert.equal(game.run('S.health'), 50, 'you wake with your health full');
  assert.equal(JSON.parse(game.run('localStorage.getItem(KEY)')).health, 50, 'saved');
  assert.match(get(game, '__toasts').join(' '), /your health full/);

  const again = byBed({health: 10, w: knows(['床', '睡觉'])});
  await finish(again, 'interact(1, 1)');
  assert.deepEqual(get(again, '__cards'), [], 'after that, no card: you just sleep');
  assert.equal(again.run('S.health'), 50);
});

test('a monkey just inside the cave’s entrance, once the troop has moved in, tells you to sleep in a bed (teaching 睡觉)', async () => {
  const at = cave => { const g = byBed({areas: {1: {gate: true, climb: 3, story: true, cave}}}); g.run('placeCharacters()'); return [g, get(g, "(n => [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === 'doorway'))")]; };
  assert.notEqual(at(2)[1][0], 'cave', 'not while you explore the cave alone');
  const [game, spot] = at(4);
  assert.deepEqual(spot, ['cave', 9, 12], 'just inside the entrance, once the troop is in');
  assert.ok(get(game, "AREA.bubbles.doorway.some(b => matches(b.if) && b.show === '!')"), 'with a ! until it has told you');
  game.run("globalThis.__said = []; showDialog = async (who, line, o) => { __said.push([line.t.join(''), o && o.teach]); }");
  await finish(game, "talk(ALL_NPCS.find(n => n.id === 'doorway'))");
  assert.deepEqual(get(game, '__said')[0], ['累了吗？去床上睡觉吧！', '睡觉'], 'Tired? Go and sleep in a bed! (睡觉 in bold)');
  assert.deepEqual(get(game, '__cards'), ['睡觉'], 'then a card teaches 睡觉');
});
