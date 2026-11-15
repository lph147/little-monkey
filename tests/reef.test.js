// Area 3, the Eastern Sea, step 4 (15 November 2026): the coral reef. Once you've counted the octopus's feet, the way east
// opens and the turtle swims on (Part 3). Coral in the colours you know (珊瑚), a seahorse among it (海马), and the dolphin
// (海豚), who races you as PE's race does (a race outside a lesson, js/pe.js): far too fast the first time, the turtle last
// (快, 慢); then faster than you walk and slower than you run, and your first win earns shells.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '水', '草', '鱼', '海', '海龟', '星星', '马', '猴子', '钱', '地图', '妖怪', '刀', '动物', '朋友', '好久不见', '红色', '粉色', '橙色', '我', '是',
  '一', '二', '三', '四', '五', '六', '七', '八', '两', '跑', '泡泡', '沙子', '贝壳', '水草', '游', '海星', '东边', '小心', '鲨鱼', '水母', '章鱼', '脚', '几'];
const FOREST_DONE = {chapter: 0, landed: 1, part: 2, weapon: '刀', turtle: 3, starFriends: 5, forest: 1, octopus: 1};
function game(area = {}, {pos = {place: 'reef', x: 4, y: 9, dir: 'up'}, friends = ['starfish', 'octopus'], know = KNOWN} = {}){
  const g = loadGame({dom: true, save: {version: 42, started: true, area: 3, shells: 7, coins: 9, met: ['starfish', 'octopus'], friends,
    w: Object.fromEntries(know.map(x => [x, {lv: 2, ok: 2}])), areas: {1: {chapter: 1, raft: 3, done: true}, 2: {ch2: 1}, 3: {...FOREST_DONE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__picked = []; globalThis.__steps = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; encounter = async f => { if (!S.friends.includes(f.id)) S.friends.push(f.id); return true; }; sayFully = async () => {}");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }; showPicked = async f => { __picked.push(f.zh); }");
  g.run("{ const was = runStep; runStep = (n, x, y, ms) => { __steps.push([n.id, ms]); was(n, x, y, ms); }; }");   // (each racer's speed)
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 4000 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const p = (g, k) => get(g, `here().${k}`);
// You in the race: off to the finish at once (you win), or only once the racers are all there (you lose)
const runAtOnce = g => g.run("globalThis.__go = () => { if (race) pl.x = race.to; else setTimeout(__go, 0); }; setTimeout(__go, 0)");
const runLast = g => g.run("globalThis.__go = () => { if (race && ['dolphin', 'turtle'].every(id => ALL_NPCS.find(n => n.id === id).x >= race.to)) pl.x = race.to; else setTimeout(__go, 0); }; setTimeout(__go, 0)");
const speeds = g => { const s = get(g, '__steps'); g.run('__steps.length = 0'); return Object.fromEntries(s); };

test('the way east from the forest opens once you’ve counted the octopus’s feet, and the turtle swims on to the coral reef', () => {
  const before = game({octopus: 0}, {pos: {place: 'forest', x: 24, y: 7, dir: 'right'}});
  const way = 'PLACES.forest.exits.find(e => e.to === "reef")';
  assert.equal(before.run(`isOpen(${way})`), false);
  assert.ok(before.run(`${way}.closed`));
  const g = game({}, {pos: {place: 'forest', x: 24, y: 7, dir: 'right'}});
  assert.equal(g.run(`isOpen(${way})`), true);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['toReef']);
  assert.deepEqual(get(g, 'ALL_NPCS.find(n => n.id === "turtle").moves[0]'), {if: {octopus: {atLeast: 1}}, place: 'reef', x: 2, y: 6, facing: 'right'});
  assert.deepEqual(get(g, '[PLACES.reef.name.zh, PARTS[2].title]'), ['珊瑚礁', 'The coral reef']);
});

test('coral all over the reef (珊瑚), pink and orange: once you know the word and the colour, A shows them together', async () => {
  const g = game({}, {know: KNOWN.filter(w => w !== '粉色')});
  assert.deepEqual(get(g, 'SPARKLES.filter(sparkling).map(s => s.word)'), ['珊瑚']);
  await press(g, 2, 8, 'left');   // a pink coral
  assert.ok(notes(g).includes('card: 珊瑚'));
  await press(g, 2, 9, 'left');   // an orange one, once you know 珊瑚 and 橙色
  assert.deepEqual(get(g, '__picked'), ['橙色 的 珊瑚']);
  assert.ok(get(g, 'PICTURES["橙色 的 珊瑚"].rows.length') > 0, 'with its own picture');
});

test('the seahorse among the coral to the north: a friend', async () => {
  const g = game({}, {pos: {place: 'reef', x: 13, y: 3, dir: 'up'}});
  assert.equal(get(g, 'animalAt(13, 2).id'), 'seahorse');
  await press(g, 13, 3, 'up');
  assert.ok(notes(g).includes('card: 海马'));
  assert.ok(get(g, 'S.friends').includes('seahorse'));
  assert.ok(get(g, 'MADE["海马"].parts.length') === 2, 'sea + horse');
});

test('the dolphin’s first race: far too fast, the turtle last; then 快 and 慢', async () => {
  const g = game();
  assert.equal(get(g, '(AREA.bubbles.dolphin.find(b => matches(b.if)) || {}).show'), '!');
  runLast(g);
  await press(g, 4, 9, 'up');
  const lines = said(g);
  assert.deepEqual(lines.slice(0, 2), ['dolphin: 我们游吧！', 'dolphin: 一，二，三，游！'], 'it wants a race, and starts it');
  assert.deepEqual(lines.slice(2), ['turtle: 海豚很快！', 'turtle: 我很慢。'], 'the turtle, puffing in last');
  const told = notes(g);
  assert.ok(told.includes('card: 海豚'), 'its name as you meet it');
  assert.ok(told.indexOf('card: 快') < told.indexOf('card: 慢'), 'one word, then the next');
  assert.ok(told.some(n => /The dolphin is there already/.test(n)), 'you lost');
  assert.deepEqual(speeds(g), {dolphin: 120, turtle: 450}, 'far too fast for you, and the turtle slow');
  assert.equal(p(g, 'dolphin'), 1);
  assert.equal(get(g, '[pl.x, pl.y]')[0], 14, 'you at the finish');
  assert.deepEqual(get(g, '(() => { const n = ALL_NPCS.find(n => n.id === "dolphin"); return [n.x, n.y]; })()'), [4, 8], 'and the dolphin back where it was');
});

test('race it again and win: faster than you walk, slower than you run; your first win, 5 shells; then just for fun', async () => {
  const g = game({dolphin: 1});
  runAtOnce(g);
  await press(g, 4, 9, 'up');
  assert.deepEqual(said(g), ['dolphin: 我们游吧！', 'dolphin: 一，二，三，游！']);
  const told = notes(g);
  assert.ok(told.some(n => /You beat the dolphin! \+5/.test(n)), 'you won, and its prize');
  assert.equal(g.run('S.shells'), 12, 'in shells, under the sea');
  assert.equal(p(g, 'dolphin'), 2);
  assert.ok(told.some(n => /To be continued/.test(n)));
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['reef']);
  assert.deepEqual(speeds(g), {dolphin: 230, turtle: 450}, 'faster than you walk (270 ms a step), slower than you run');
  runAtOnce(g); g.run('lastTalk = null');
  await press(g, 4, 9, 'up');
  assert.equal(g.run('S.shells'), 12, 'the prize is only the once');
});

test('if you can’t run yet, the dolphin is slower than you walk, so you can still win', async () => {
  const g = game({dolphin: 1}, {know: KNOWN.filter(w => w !== '跑')});
  runLast(g);
  await press(g, 4, 9, 'up');
  assert.equal(speeds(g).dolphin, 320);
  assert.equal(p(g, 'dolphin'), 1, 'you came last this time');
});

test('the reef drawn: coral, the race track, the dolphin and the turtle', () => {
  const g = game();
  assert.deepEqual(get(g, '[tileAt(3, 10).look, tileAt(14, 10).look]'), ['raceStart', 'raceFinish']);
  for (const t of [0, 900, 4000]) g.run(`drawWorld(${t})`);
  g.run('S.clock.t = DAY_MS * .9; drawWorld(5000)');
  for (const w of ['海马', '海豚']) assert.equal(get(g, `MAP_SPRITES['${w}'].rows.length`), 16);
});
