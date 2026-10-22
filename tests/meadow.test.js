// The words for the meadow: besides the words its tasks teach, the old monkey wants you to learn its mountain, its river,
// a tree, the fish in the pond and a bird (山 河 树 鱼 鸟), and the rocks wait for them (story.test.js), so you can't
// leave the meadow without them. At the river and the pond, A looks first, so collecting water never skips the word.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knowing = words => Object.fromEntries(words.map(hz => [hz, {lv: 1, due: 0, ok: 0}]));

test('telling you about animals, the old monkey asks you to learn the meadow’s words too: the ones you don’t know yet', async () => {
  const told = async words => {
    const g = loadGame({dom: true, save: {version: 24, started: true, w: knowing(['石头', '你好', '花', '草', ...words]), areas: {1: {elder: 1}}}});
    g.run('globalThis.__told = []; showDialog = async () => {}; showNotice = async w => setSeen(w); showNarration = async t => { __told.push(t); }; matchWords = async () => new Set()');
    await g.run("runSteps(AREA.talk.elder.find(p => matches(p.if)).do, 'elder')");
    assert.equal(g.run('here().elder'), 2, 'he has told you about animals');
    return JSON.parse(g.run('JSON.stringify(__told)'));
  };
  assert.ok((await told(['山', '树'])).includes('The old monkey wants you to learn the words for the meadow too: the river, the fish in the pond and a bird. Things that sparkle have words.'),
    'he names the three you haven’t found');
  assert.ok(!(await told(['山', '树', '河', '鱼', '鸟'])).some(t => /words for the meadow/.test(t)), 'if you know them all already, he doesn’t ask');
});

test('your tasks say which of the meadow’s words are still to find, until you know all five; then the checklist ticks it off', () => {
  const g = loadGame({save: {version: 24, started: true, w: knowing(['山', '树']), areas: {1: {elder: 2}}}});
  const task = () => JSON.parse(g.run('JSON.stringify((getTasks().find(t => t.id === "meadow") || {}).text || null)'));
  const item = () => JSON.parse(g.run('JSON.stringify(areaChecklist().find(([t]) => t.startsWith("Learn the words for the meadow")).slice(0, 2))'));
  assert.equal(task(), 'Learn the words for the meadow (2/5). Still to find: the river, the fish in the pond and a bird. Things that sparkle have words.');
  g.run("setSeen('河')");
  assert.equal(task(), 'Learn the words for the meadow (3/5). Still to find: the fish in the pond and a bird. Things that sparkle have words.');
  g.run("setSeen('鱼')");
  assert.equal(task(), 'Learn the words for the meadow (4/5). Still to find: a bird. Things that sparkle have words.');
  assert.deepEqual(item(), ['Learn the words for the meadow (4/5)', false]);
  g.run("setSeen('鸟')");
  assert.equal(task(), null, 'all five: the task is done');
  assert.deepEqual(item(), ['Learn the words for the meadow (5/5)', true]);
});

test('the task waits for the old monkey to ask, and stays for the rest of the prologue (a game from before that is past the rocks), but not in chapter 1', () => {
  const tasks = area => JSON.parse(loadGame({save: {version: 29, started: true, areas: {1: area}}}).run('JSON.stringify(getTasks().map(t => t.id))'));
  assert.ok(!tasks({elder: 1}).includes('meadow'), 'not before he asks');
  assert.ok(tasks({elder: 2}).includes('meadow'));
  assert.ok(tasks({elder: 2, gate: true, climb: 1}).includes('meadow'), 'past the rocks, in the prologue still');
  assert.ok(!tasks({elder: 2, gate: true, climb: 4, story: true, cave: 6, count: 3, chapter: 1}).includes('meadow'), 'chapter 1 has begun');
});

test('at the river and the pond, A looks first while you don’t know their word; then it collects the water: one new word each time', async () => {
  const g = loadGame({save: {version: 24, started: true, areas: {1: {elder: 2, thirsty: 'asked'}}}});
  g.run('globalThis.__shown = []; showNotice = async w => { __shown.push(w); setSeen(w); }; toast = () => {}');
  for (const [x, y, word] of [[18, 10, '河'], [11, 9, '鱼']]){
    assert.equal(g.run(`promptFor(${x}, ${y})`), 'Look', `A says Look at the ${word}`);
    await g.run(`interact(${x}, ${y})`);
    assert.equal(g.run(`lvl('${word}')`), 1, `and teaches ${word}`);
    assert.equal(g.run('here().holding.thirsty'), undefined, 'without collecting the water yet');
    assert.equal(g.run(`promptFor(${x}, ${y})`), 'Collect', 'then A collects');
  }
  await g.run('interact(18, 10)');
  assert.equal(g.run('here().holding.thirsty'), '水');
  assert.deepEqual(JSON.parse(g.run('JSON.stringify(__shown)')), ['河', '鱼', '水']);
  assert.equal(g.run("promptFor(15, 9)"), '', 'flowers and fruit trees are what you pick from them: no looking first (by the river, a flower you know)');
});
