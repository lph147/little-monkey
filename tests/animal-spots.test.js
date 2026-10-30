// Animals at their own spots (the squirrel up a tree, the goat on a cliff), and tall grass that
// rustles where another animal is hiding.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
const ready = () => loadGame({save: {version: 10, started: true, areas: {1: {elder: 2}},
  w: Object.fromEntries(['动物', '石头', '山', '树', '花', '草'].map(w => [w, {lv: 1, due: 0, ok: 0}]))}});   // animals appear

test('animals with a spot live where you can face them: up a tree, on a cliff, or standing in a clearing, where you can\'t walk through them', () => {
  const game = ready();
  game.run('here().chapter = 1');   // (so chapter 1's are there too)
  for (const a of get(game, 'ANIMALS.filter(a => a.at)')){
    const [x, y] = a.at;
    game.run(`setPlace('${a.place}')`);
    assert.equal(get(game, `walkable(${x}, ${y})`), false, `${a.hz} should be in the way, not somewhere you walk`);
    assert.equal(get(game, `animalAt(${x}, ${y}).id`), a.id);
    assert.ok(get(game, `[[0,1],[0,-1],[1,0],[-1,0]].some(([dx, dy]) => walkable(${x} + dx, ${y} + dy))`), `you should be able to stand next to ${a.hz}`);
  }
});

test('the squirrel and goat only appear once you know about animals; then A meets them', () => {
  assert.equal(get(loadGame(), 'animalAt(13, 18)'), null, 'not before the old monkey tells you about animals');
  const game = ready();
  assert.equal(get(game, 'animalAt(13, 18).hz'), '松鼠');
  game.run("S.pos = {x:13, y:19, dir:'up'}; placePlayer(); mode = 'play'");
  assert.equal(get(game, 'promptFor(13, 18)'), 'Meet');
});

test('an animal hides in tall grass at least 3 steps away, and stepping there meets it', async () => {
  const game = ready();
  game.run("S.pos = {x:9, y:7, dir:'down'}; placePlayer(); hideAnimal()");
  const r = get(game, 'rustle');
  assert.ok(r, 'an animal is hiding');
  assert.equal(get(game, `!!tileAt(${r.x}, ${r.y}).animals`), true, 'in tall grass');
  assert.ok(Math.abs(r.x - 9) + Math.abs(r.y - 7) >= 3, 'not right next to you');
  assert.equal(r.a.at, null, 'one of the grass animals');
  game.run('globalThis.__met = null; wildAppears = async a => { __met = a.hz; }');
  await game.run(`arrive(${r.x}, ${r.y})`);
  assert.equal(get(game, '__met'), r.a.hz);
  assert.equal(get(game, 'rustle'), null);
  for (let i = 0; i < 3; i++) await game.run('arrive(9, 7)');
  assert.equal(get(game, 'rustle'), null, 'the next one waits a few steps');
  await game.run('arrive(9, 7)');
  assert.ok(get(game, 'rustle'), 'then another hides');
});

test('a bird that lands stays for most of a minute; face it and A shows 鸟, then it flies off', async () => {
  const game = ready();
  game.run("birds.push({tx: 9, ty: 8, x: 9*T + 4, y: 8*T + 6, t0: 0, until: 50000, from: 1}); S.pos = {x: 9, y: 7, dir: 'down'}; placePlayer(); globalThis.__shown = null; showNotice = async w => { __shown = w; }");
  assert.equal(get(game, 'promptFor(9, 8)'), 'Look');
  assert.ok(get(game, 'birds[0].until') >= 40000, 'it stays at least 40 seconds');
  await game.run('interact(9, 8)');
  assert.equal(get(game, '__shown'), '鸟');
  assert.ok(get(game, 'birds[0].off'), 'then it flies off');
});

test('if the map changed under your saved spot, you start at the stone', () => {
  const game = loadGame({save: {version: 12, started: true, pos: {x: 10, y: 16, dir: 'down'}}});   // where the stall stands now
  const start = get(game, 'START');
  assert.deepEqual(get(game, '[S.pos.x, S.pos.y]'), [start.x, start.y]);
  const fine = loadGame({save: {version: 12, started: true, pos: {x: 9, y: 7, dir: 'left'}}});
  assert.deepEqual(get(fine, '[S.pos.x, S.pos.y]'), [9, 7], 'a spot you can still stand on is kept');
});

test('an animal says it wants to play before its questions, with what’s happening under it, so they never just start', async () => {
  const meet = async (fox, friends = []) => {
    const game = loadGame({dom: true, save: {version: 10, started: true, areas: {1: {elder: 2}}, friends,
      w: Object.fromEntries(['动物', '石头', '山', '树', '花', '草', ...(fox ? ['狐狸'] : [])].map(w => [w, {lv: 1, due: 0, ok: 0}]))}});
    game.run(`S.pos = {x:9, y:7, dir:'down'}; placePlayer(); mode = 'play'; globalThis.__seen = [];
      showNotice = async (w, o) => { __seen.push('card: ' + w); rec(w).lv = Math.max(rec(w).lv || 0, 1); };
      showDialog = async (who, line, o) => { __seen.push([line.t.join(''), o.hint || '', o.ok, /狐狸/.test(who)]); };
      encounter = async () => { __seen.push('questions'); return true; }; toast = () => {}`);
    let done = false;
    const p = Promise.resolve(game.run("wildAppears(ANIMALS.find(a => a.id === 'fox'))")).then(() => { done = true; });
    for (let i = 0; i < 200 && !done; i++){ await new Promise(r => setImmediate(r)); game.flush(); }   // (letting its pauses go by)
    await p;
    return get(game, '__seen');
  };
  assert.deepEqual(await meet(false), ['card: 狐狸', ['我们玩吧！', '', 'Play', true], 'questions'],
    'the first time: its card teaches its name and says what’s happening, then it says 我们玩吧！ (Let’s play!), over its name, and Play starts its questions');
  assert.deepEqual(await meet(true), [['我们玩吧！', 'It wants to play! Answer its questions to make friends.', 'Play', true], 'questions'], 'later: what’s happening, under its line');
  assert.deepEqual(await meet(true, ['fox']), [['我们玩吧！', 'Your 朋友 (friend) wants to play again! Answer its questions.', 'Play', true], 'questions'], 'and a friend');
});

test('animals on the map at their sizes: tiny, small, medium and big, at the bottom of their square, the big ones standing up out of it', () => {
  // (decided 30 October 2026: a bee as big as a bear, or a frog as a horse, looked odd; pictures on cards stay one size)
  const game = ready();
  const sizes = get(game, `Object.fromEntries(Object.entries(MAP_SPRITES).map(([w, s]) => {
    let x0 = 99, x1 = -1, y0 = 99, y1 = -1;
    s.rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.'){ x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }));
    return [w, [s.rows.length, Math.max(x1 - x0, y1 - y0) + 1, s.rows.length - 1 - y1]];
  }))`);
  const size = ([canvas, px]) => canvas > 16 ? 'big' : px <= 10 ? 'tiny' : px <= 12 ? 'small' : 'medium';
  const by = {}; for (const [w, s] of Object.entries(sizes)) (by[size(s)] = by[size(s)] || []).push(w);
  assert.deepEqual(Object.fromEntries(Object.entries(by).map(([k, ws]) => [k, ws.sort()])), {
    tiny: ['蜘蛛', '蜜蜂', '蝴蝶', '螃蟹', '青蛙', '老鼠'].sort(), small: ['兔子', '猫头鹰', '鸭子'].sort(), big: ['熊', '牛', '野猪', '鹿', '马'].sort(),
    medium: ['松鼠', '山羊', '狐狸', '狼', '羊', '蛇', '蜂王', '黄蜂'].sort()});
  for (const w of [...by.tiny, ...by.small]) assert.ok(sizes[w][2] <= 1, `${w} stands at the bottom of its square`);
  assert.equal(game.run("ANIMALS.find(a => a.id === 'deer').spr.height"), 22, 'the deer, big');
  assert.equal(get(game, "ANIMALS.filter(a => a.small).length"), 0, 'no second, smaller look: the butterfly is tiny anyway');
});

test('a big animal stands up out of its square, centred on it, and its shadow is as wide as it is', () => {
  const game = ready();
  game.run(`globalThis.__drawn = []; { const was = b.drawImage.bind(b); b.drawImage = (img, ...a) => { __drawn.push([img.width, img.height, ...a]); return was(img, ...a); }; }
    globalThis.__rects = []; { const was = b.fillRect.bind(b); b.fillRect = (...a) => { __rects.push(a); return was(...a); }; }`);
  game.run("drawFigure(ANIMALS.find(a => a.id === 'deer').spr, 100, 50)");
  assert.deepEqual(get(game, '__drawn.at(-1)'), [22, 22, 97, 44], 'three pixels to the left and six up: its feet on its square');
  game.run("drawFigure(ANIMALS.find(a => a.id === 'rabbit').spr, 100, 50)");
  assert.deepEqual(get(game, '__drawn.at(-1)'), [16, 16, 100, 50], 'one a square’s size, where it was');
  game.run("__rects = []; figureShadow('牛', 0, 0); figureShadow('蜜蜂', 0, 0); figureShadow('狐狸', 0, 0)");
  const [cow, bee, fox] = get(game, '__rects.map(r => r[2])');
  assert.ok(cow > fox && fox > bee, `a cow’s shadow (${cow}) is bigger than a fox’s (${fox}), and a bee’s (${bee}) smaller`);
  assert.equal(fox, 10, 'a medium one’s, as before');
});
