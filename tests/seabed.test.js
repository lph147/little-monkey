// Area 3, the Eastern Sea, step 2 (15 November 2026): the seabed. The sea turtle from your shore swims up (好久不见, or
// 你好 if it isn't your friend) and teaches your bubble (泡泡); the sand, a shell and the seaweed sparkle till you look
// (沙子 贝壳 水草), and once you know 贝壳 your shells say so; it swims ahead to the seaweed (游), where five starfish hide
// (海星), each staying out on the sand in its own colour, A at one showing it (红色的海星); then shells from the turtle, and
// To be continued. Little fish swim over the sand.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '水', '草', '鱼', '海', '海龟', '星星', '珍珠', '猴子', '钱', '地图', '妖怪', '刀', '动物', '朋友', '好久不见',
  '红色', '橙色', '黄色', '粉色', '蓝色', '我', '是', '一', '二', '三', '四', '五', '桃子', '苹果', '花', '树'];
const END_OF_4 = {landed: 1, dressed: 2, chapter: 2, king: 2, homeAgain: 1, unload: 6, party: 1, stickGiven: 1, ch2: 1, weapon: '刀'};
function game(area = {}, {friends = ['seaTurtle'], pos = {place: 'seabed', x: 11, y: 6, dir: 'down'}} = {}){
  const g = loadGame({dom: true, save: {version: 42, started: true, area: 3, shells: 7, coins: 9, met: [], friends,
    w: Object.fromEntries(KNOWN.map(x => [x, {lv: 2, ok: 2}])), areas: {1: {chapter: 1, raft: 3, done: true}, 2: END_OF_4, 3: {chapter: 0, landed: 1, weapon: '刀', ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__picked = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; encounter = async () => true; sayFully = async () => {}");
  g.run("showPicked = async (f, note, o = {}) => { __picked.push(f.zh + ' | ' + f.en); }");
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 3000 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const p = (g, k) => get(g, `here().${k}`);

test('the sea turtle from your shore greets you as you land: 好久不见！, and your bubble, 泡泡', async () => {
  const g = game();
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['turtle'], 'a task says to talk to it');
  assert.equal(get(g, '(AREA.bubbles.turtle.find(b => matches(b.if)) || {}).show'), '!');
  assert.equal(get(g, 'NPCS.find(n => n.id === "turtle").swims'), true, 'swimming, over the sand');
  await press(g, 13, 6, 'right');
  assert.deepEqual(said(g).slice(0, 3), ['turtle: 好久不见！', 'player: 好久不见', 'turtle: 你在泡泡里！'], 'an old friend: long time no see');
  assert.ok(notes(g).includes('card: 泡泡'), 'your first word of the sea');
  assert.equal(p(g, 'turtle'), 1);
  assert.equal(g.run('VOICE_OF.turtle'), 'xiaorui', 'in its own voice, Xiaorui’s');
  assert.equal(get(g, 'bustHTML("turtle").length') > 20, true, 'its face on the speech box’s name plate');
});

test('a sea turtle that was never your friend says 你好！ instead', async () => {
  const g = game({}, {friends: []});
  await press(g, 13, 6, 'right');
  assert.deepEqual(said(g).slice(0, 2), ['turtle: 你好！', 'player: 你好']);
});

test('the sand, a shell and the seaweed sparkle till you look; then 贝壳 names your shells, and the turtle swims ahead to the seaweed: 游', async () => {
  const g = game({turtle: 1});
  assert.deepEqual(get(g, 'SPARKLES.filter(sparkling).map(s => s.word)').sort(), ['水草', '沙子', '贝壳'].sort(), 'three things sparkle');
  assert.doesNotMatch(g.run('moneyHTML()'), /贝壳/, 'your shells have no name yet');
  assert.equal(get(g, 'GRASS_TILES.length'), 0, 'nothing hides in the seaweed yet');
  await press(g, 10, 6, 'up');   // the shell
  assert.ok(notes(g).includes('card: 贝壳'));
  assert.match(g.run('moneyHTML()'), /🐚 7 <b class="hl-zh" data-say="贝壳">贝壳<\/b>/, 'and now they say so');
  assert.equal(g.run('coinsNow()'), false, 'under the sea, what you’re given is shells');
  await press(g, 9, 7, 'down');   // the sand
  await press(g, 2, 4, 'left');   // the seaweed
  assert.deepEqual(['沙子', '水草'].map(w => g.run(`lvl('${w}')`) >= 1), [true, true]);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['turtle2'], 'back to the turtle');
  await press(g, 13, 6, 'right');
  assert.deepEqual(said(g), ['turtle: 我游，你走。']);
  assert.ok(notes(g).includes('card: 游'));
  assert.deepEqual(get(g, '(() => { const n = NPCS.find(n => n.id === "turtle"); return [n.x, n.y]; })()'), [5, 12], 'it swims ahead to the seaweed');
  assert.deepEqual(get(g, '[pl.x, pl.y]'), [6, 12], 'you walking after it');
  assert.equal(p(g, 'turtle'), 2);
  assert.equal(g.run('tileAt(0, 6).look'), 'seaweed');
  assert.ok(get(g, 'GRASS_TILES.length') > 20, 'the starfish hide in the seaweed now');
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['starfish']);
});

test('five starfish, each staying out on the sand in its own colour; A at a friend shows it, 红色的海星; then shells from the turtle', async () => {
  const g = game({turtle: 2}, {pos: {place: 'seabed', x: 6, y: 8, dir: 'down'}});
  const star = 'ANIMALS.find(a => a.id === "starfish")';
  const spots = [[6, 9], [8, 9], [10, 9], [12, 9], [14, 9]];
  for (const [i, [x, y]] of spots.entries()){
    g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y - 1}, dir: 'down'}; placePlayer()`);
    await play(g, `wildAppears(${star}, {x: ${x}, y: ${y}, d: 'down'})`);
    assert.equal(p(g, 'starFriends'), i + 1, `starfish ${i + 1} counted`);
  }
  assert.ok(notes(g).some(n => /card: 海星/.test(n)), 'the first teaches 海星');
  assert.deepEqual(get(g, 'outHere().map(o => [o.x, o.y, o.friend, o.colour])'),
    spots.map(([x, y], i) => [x, y, true, ['红色', '橙色', '黄色', '粉色', '蓝色'][i]]), 'each out where it came out, in its own colour');
  assert.ok(said(g).filter(s => /^player: [一二三四五]！$/.test(s)).length === 5, 'counted aloud');
  g.run('S.pos = {place: PLACE, x: 8, y: 8, dir: "down"}; placePlayer()');
  assert.equal(g.run('promptFor(8, 9)'), 'Look');
  await press(g, 8, 8, 'down');
  assert.deepEqual(get(g, '__picked'), ['橙色 的 海星 | An orange starfish'], 'what it is, in its colour');
  assert.ok(get(g, 'COLOURED().map(c => c.zh)').includes('蓝色 的 海星'), 'each colour has its voice clip and its line in CHINESE.md');
  assert.equal(get(g, '(AREA.bubbles.turtle.find(b => matches(b.if)) || {}).show'), '!', 'the turtle has something for you');
  g.run('NPCS.find(n => n.id === "turtle").x = 5; NPCS.find(n => n.id === "turtle").y = 12');
  await press(g, 6, 12, 'left');
  assert.deepEqual(said(g), ['turtle: 你有五个海星朋友了！']);
  assert.equal(g.run('S.shells'), 12, 'five shells, 贝壳');
  assert.equal(p(g, 'turtle'), 3);
  assert.ok(notes(g).some(n => /To be continued/.test(n)));
});

test('the seabed drawn: the starfish in their colours, the turtle swimming, and schools of little fish', () => {
  const g = game({turtle: 2, starFriends: 2, out: {starfish: [[6, 9, 1], [8, 9, 1], [10, 9, 0]]}});
  const star = 'ANIMALS.find(a => a.id === "starfish")';
  assert.equal(g.run(`tinted(${star}, '红色') !== tinted(${star}, '蓝色')`), true, 'a blue starfish isn’t red');
  assert.equal(g.run(`tinted(${star}, '红色') === tinted(${star}, '红色')`), true, 'each colour made once');
  assert.equal(g.run(`tinted(ANIMALS.find(a => a.id === "starfish"), '紫色') === ${star}.spr`), true, 'a colour it has no paint for: as drawn');
  assert.deepEqual(get(g, 'outHere().map(o => o.colour)'), ['红色', '橙色', '黄色']);
  assert.equal(get(g, 'PLACES.seabed.schools.length'), 2);
  for (const t of [0, 500, 4000, 9000]) g.run(`drawWorld(${t})`);
  g.run('S.clock.t = DAY_MS * .9; drawWorld(12000)');   // at night too
});
