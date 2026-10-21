// Chapter 1's home ground (家园), beside the waterfall: the troop's settlement, where each plot is marked out for something
// they want to build. The way there opens once the old monkey has told you about it (a map letter that changes with the
// story: becomes, in the legend), and he follows you there.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
// A game at the start of chapter 1: the prologue done, the troop home in the cave, you king.
function chapterOne(area = {}, pos = {place: 'cave', x: 6, y: 10, dir: 'up'}){
  const g = loadGame({dom: true, save: {version: 29, started: true, w: {'石头': {lv: 1, ok: 0}, '家': {lv: 1, ok: 0}, '王': {lv: 1, ok: 0}}, met: ['rabbit', 'fox', 'squirrel', 'goat'],
    areas: {1: {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }");
  g.run('placePlayer()');
  return g;
}
const where = (g, id) => get(g, `(({place, x, y}) => [place, x, y])(ALL_NPCS.find(n => n.id === '${id}'))`);
// Runs code in the game and waits for it, letting its timers run (such as the old monkey's leap to his place).
async function play(g, code){
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 100 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}

test('the way to the home ground: bushes beside the waterfall, until the old monkey has told you; then a path', () => {
  const g = chapterOne({}, {place: 'falls', x: 10, y: 2, dir: 'right'});
  assert.equal(g.run('tileAt(15, 2).look'), 'bush');
  assert.ok(!g.run('tileAt(19, 2).walk'), 'shut: you can’t walk through the bushes');
  g.run('STEPS.set({set: {home: 1}})');
  assert.equal(g.run('tileAt(15, 2).look'), 'path', 'the troop has cleared a way');
  assert.ok(g.run('tileAt(19, 2).walk') && g.run('isOpen(exitAt(19, 2))'), 'it leads to the home ground');
  assert.equal(g.run('exitAt(19, 2).to'), 'homeGround');
  assert.equal(g.run('mapStory'), g.run('mapStoryNow()'), 'and the map has been drawn again');
});

test('the rocks still roll away (the first map letter that changed with the story)', () => {
  const g = loadGame({save: {version: 29, started: true, areas: {1: {gate: false}}, pos: {place: 'meadow', x: 15, y: 6, dir: 'up'}}});
  g.run("mode = 'play'; placePlayer()");
  assert.equal(g.run('tileAt(15, 4).look'), 'rocks');
  g.run('here().gate = true');
  assert.equal(g.run('tileAt(15, 4).look'), 'path');
});

test('the home ground: five plots, each with a sign saying what the troop wants to build there, and ways out shut by bushes', async () => {
  const g = chapterOne({home: 2}, {place: 'homeGround', x: 1, y: 9, dir: 'right'});
  assert.deepEqual(get(g, 'PLACES.homeGround.name'), {zh: '家园', py: 'jiāyuán', en: 'Home ground'});
  const map = get(g, 'MAP'), count = ch => map.join('').split(ch).length - 1;
  for (const ch of ['s', 'd', 'h', 'e', 'c']) assert.ok(count(ch) >= 6, `the plot "${ch}" is marked out`);
  assert.equal(g.run("tileAt(8, 2).look"), 'plot');
  const signs = {1: /school/, 2: /shop/, 3: /hive/, 4: /garden/, 5: /pen/};
  for (const [ch, says] of Object.entries(signs)){
    const y = map.findIndex(r => r.includes(ch)), x = map[y].indexOf(ch);
    assert.equal(g.run(`promptFor(${x}, ${y})`), 'Read');
    g.run('__notes.length = 0');
    await g.run(`interact(${x}, ${y})`);
    assert.match(get(g, '__notes').join(), says, `the sign "${ch}" says what the plot is for`);
  }
  g.run('__notes.length = 0');
  await g.run('interact(31, 9)');
  assert.match(get(g, '__notes').join(), /clear a way through here when it’s needed/, 'the ways out are shut by thick bushes for now');
  assert.deepEqual(where(g, 'elder'), ['homeGround', 10, 6], 'the old monkey is there');
  assert.deepEqual(where(g, 'big'), ['homeGround', 15, 4], 'and the big monkey');
  assert.deepEqual(where(g, 'playful'), ['homeGround', 5, 8], 'and the little monkey');
  assert.equal(get(g, "ALL_NPCS.filter(n => n.id.startsWith('troop')).map(n => n.place).join()"), 'cave,cave,cave', 'the others are at home in the cave');
  const stream = map.findIndex(r => r.includes('k'));   // the row with the bridge over the stream
  assert.deepEqual([g.run(`tileAt(0, ${stream}).look`), g.run(`tileAt(${map[0].length - 1}, ${stream}).look`)], ['water', 'water'], 'the stream flows in from the west and out through the trees to the east, never stopping short at them');
});

test('chapter 1 begins with the old monkey: we have a home now; he follows you to the home ground, where he says it’s big', async () => {
  const g = chapterOne();
  assert.equal(get(g, "((AREA.bubbles.elder || []).find(b => matches(b.if)) || {}).show"), '!', 'he has a ! for you');
  assert.match(get(g, 'getTasks()[0].text'), /Talk to the old monkey/);
  await play(g, "talk(ALL_NPCS.find(n => n.id === 'elder'))");
  assert.deepEqual(get(g, '__said'), ['我们有家了！']);
  assert.match(get(g, '__notes').join(' '), /cleared a way beside the waterfall/);
  assert.equal(g.run('here().home'), 1);
  assert.deepEqual(get(g, 'S.following'), ['elder'], 'he follows you');
  assert.match(get(g, 'getTasks()[0].text'), /Lead the old monkey to the troop’s new home ground/);
  assert.deepEqual(where(g, 'big')[0], 'homeGround', 'the big monkey is already there: he cleared the way');
  g.run("__said.length = 0; S.pos = {place: 'homeGround', x: 1, y: 9, dir: 'right'}; placePlayer()");
  await play(g, 'runEvents()');
  assert.equal(g.run('here().home'), 2, 'you’re there together');
  assert.deepEqual(get(g, 'S.following'), [], 'he stops following you');
  assert.deepEqual(where(g, 'elder'), ['homeGround', 10, 6], 'and goes to his place, by the school’s plot');
  assert.deepEqual(get(g, '__said'), ['这里很大！']);
  assert.match(get(g, '__notes').join(' '), /a school, a new shop, a hive, a garden and a pen/);
  assert.ok(get(g, "areaChecklist()[0][1]"), 'chapter 1’s first step is ticked off');
  assert.match(g.run('tasksHint()'), /school first/);
});
