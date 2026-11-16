// Area 3, the Eastern Sea, step 3 (15 November 2026): the seaweed forest. Once the starfish are found, the way east opens
// and the sea turtle swims ahead; coming in, it warns you (小心！有鲨鱼！) and your first shark shoots out of the seaweed
// (鲨鱼). Tall seaweed hides sharks and jellyfish (水母, more at night) and parts round you as you walk through; the octopus
// among the rocks squirts ink as you meet it (章鱼), then teaches 脚 and 几 and counts its feet with you.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '水', '草', '鱼', '海', '海龟', '星星', '猴子', '钱', '地图', '妖怪', '刀', '动物', '朋友', '好久不见', '红色', '我', '是',
  '一', '二', '三', '四', '五', '六', '七', '八', '两', '泡泡', '沙子', '贝壳', '水草', '游', '海星', '东边'];
const SEABED_DONE = {chapter: 0, landed: 1, part: 1, weapon: '刀', turtle: 3, starFriends: 5};
function game(area = {}, {pos = {place: 'forest', x: 1, y: 7, dir: 'right'}, friends = ['starfish']} = {}){
  const g = loadGame({dom: true, save: {version: 42, started: true, area: 3, shells: 7, coins: 9, met: ['starfish'], friends,
    w: Object.fromEntries(KNOWN.map(x => [x, {lv: 2, ok: 2}])), areas: {1: {chapter: 1, raft: 3, done: true}, 2: {ch2: 1}, 3: {...SEABED_DONE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__battles = []; globalThis.__counted = 0");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; encounter = async f => { if (!S.friends.includes(f.id)) S.friends.push(f.id); return true; }; sayFully = async () => {}");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }");
  g.run("wildBattle = async (id, x, o = {}) => { __battles.push([id, !!o.retry]); setSeen(ENEMIES[id].word); return 'won'; }");
  g.run("confirmBox = async () => true; countQ = async () => { __counted++; return true; }");
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 3000 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const stand = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`); return play(g, 'runEvents()'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const p = (g, k) => get(g, `here().${k}`);

test('the way east from the seabed opens once the starfish are found, and the sea turtle swims ahead into the seaweed forest', () => {
  const before = game({turtle: 2, starFriends: 4}, {pos: {place: 'seabed', x: 22, y: 6, dir: 'right'}});
  const way = 'PLACES.seabed.exits.find(e => e.to === "forest")';
  assert.equal(before.run(`isOpen(${way})`), false, 'not yet');
  assert.match(before.run(`${way}.closed`), /show you round the seabed first/);
  const g = game({}, {pos: {place: 'seabed', x: 22, y: 6, dir: 'right'}});
  assert.equal(g.run(`isOpen(${way})`), true);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['toForest']);
  assert.deepEqual(get(g, 'ALL_NPCS.find(n => n.id === "turtle").moves.find(m => m.place === "forest")'), {if: {turtle: {atLeast: 3}}, place: 'forest', x: 3, y: 6, facing: 'right'});   // (after the later steps' places)
  assert.equal(get(g, '(() => { placeCharacters(); return ALL_NPCS.find(n => n.id === "turtle").place; })()'), 'forest', 'into the forest');
  assert.equal(get(g, 'PLACES.forest.name.zh'), '水草林');
});

test('into the forest: the turtle’s 小心！有鲨鱼！ and your first shark, out of the seaweed (you can try again)', async () => {
  const g = game();
  await stand(g, 1, 7, 'right');
  assert.deepEqual(get(g, '__battles'), [], 'not right at the edge');
  await stand(g, 2, 7, 'right');
  assert.deepEqual(said(g), ['turtle: 小心！有鲨鱼！']);
  assert.deepEqual(get(g, '__battles'), [['shark', true]], 'a shark, and Try again if it beats you');
  assert.ok(notes(g).includes('card: 小心'), 'its own card, as a phrase');
  assert.equal(get(g, 'WORDS["小心"].phrase'), true);
  assert.equal(p(g, 'forest'), 1);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['octopus'], 'something among the rocks');
  await stand(g, 3, 7, 'right');
  assert.equal(get(g, '__battles').length, 1, 'only the once');
});

test('tall seaweed: sharks and jellyfish hide in it (jellyfish more at night), and it parts round you as grass does', () => {
  const g = game({forest: 1}, {pos: {place: 'forest', x: 9, y: 7, dir: 'right'}});
  const t = 'tileAt(10, 7)';
  assert.deepEqual(get(g, `[${t}.look, ${t}.walk, ${t}.wild]`), ['tallSeaweed', true, ['shark', 'jelly']]);
  assert.equal(g.run('grassy(10, 7)'), true, 'it parts as you walk through');
  assert.equal(g.run('typeof STIR_DRAWS.tallSeaweed'), 'function', 'drawn as seaweed, not grass');
  g.run('S.clock.t = DAY_MS * .3');
  const day = get(g, '[foeWeight("shark"), foeWeight("jelly")]');
  g.run('S.clock.t = DAY_MS * .9');
  const night = get(g, '[foeWeight("shark"), foeWeight("jelly")]');
  assert.ok(night[1] > day[1] && night[1] > night[0], `more jellyfish at night (${day} by day, ${night} at night)`);
  assert.equal(get(g, 'PLACES.forest.backdrop'), 'sea');
  assert.equal(g.run('typeof BACKDROPS.sea'), 'function', 'fights under the sea have their own backdrop');
  g.run('stirGrass(1000); drawWorld(1000); pl.px = 10 * T; stirGrass(1100); drawWorld(1100)');   // (walking into it)
  assert.ok(get(g, '[...stirred.keys()]').length > 0, 'parted round you');
});

test('the octopus among the rocks: ink as you meet it, then 脚 and 几, and counting its feet', async () => {
  const g = game({forest: 1}, {pos: {place: 'forest', x: 13, y: 3, dir: 'up'}});
  assert.equal(get(g, 'animalAt(13, 2).id'), 'octopus');
  assert.equal(get(g, 'animalAt(13, 2).inks'), true);
  await press(g, 13, 3, 'up');
  assert.ok(notes(g).includes('card: 章鱼'), 'its name, as you meet it');
  assert.deepEqual(said(g), ['octopus: 我们玩吧！'], 'it wants to play');
  assert.ok(get(g, 'S.friends').includes('octopus'));
  assert.equal(get(g, 'npcAt(13, 2) && npcAt(13, 2).id'), 'octopus', 'it stays there to talk to');
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['octopus2']);
  g.run('lastTalk = null');
  await press(g, 13, 3, 'up');
  assert.deepEqual(said(g), ['octopus: 我有八只脚！', 'octopus: 我有几只脚？', 'octopus: 太好了！'], 'its feet, how many, and all counted right');
  const told = notes(g);
  assert.ok(told.includes('card: 脚') && told.includes('card: 几'), 'one word, then the next');
  assert.ok(get(g, '__counted') >= 3, 'counting its feet');
  assert.equal(p(g, 'octopus'), 1);
  assert.ok(told.some(n => /swims on east, to the coral reef/.test(n)), 'and the turtle swims on (step 4: tests/reef.test.js)');
});

test('the forest drawn, by day and at night: tall seaweed, jellyfish drifting (glowing at night), the octopus’s ink', () => {
  const g = game({forest: 1}, {pos: {place: 'forest', x: 12, y: 3, dir: 'right'}});
  assert.equal(get(g, 'PLACES.forest.jellies.length'), 4);
  for (const t of [0, 800, 5000]) g.run(`drawWorld(${t})`);
  g.run('S.clock.t = DAY_MS * .9; drawWorld(6000)');
  g.run('foe = {a: ANIMALS.find(a => a.id === "octopus"), x: 13, y: 2, t0: performance.now(), state: "in", spot: true}; drawWorld(performance.now() + 300); foe = null');
  for (const w of ['鲨鱼', '水母', '章鱼']) assert.ok(get(g, `MAP_SPRITES['${w}'].rows.length`) === 16, `${w} has its map sprite`);
});
