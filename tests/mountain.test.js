// Area 2, chapter 1: the teacher's mountain (decided 4 November 2026, from the plan's third draft), its first part: the
// woodcutter's hut at the foot of the mountain, where he asks for things only in Chinese and you fetch them by their word;
// the cliff road over a sea of clouds (云), with gusts of wind, loose planks to hop and a chain to climb, and a crane (鹤)
// by its pool; the stone pillars at the top, the open sky (天), the mountain's tablet and the cave's stone door, where a
// boy asks who you are. Then the end card: to be continued.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const FROM_BEFORE = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水', '吃', '喝', '要', '我', '猴子', '河', '鱼', '羊', '朋友', '家', '有', '鸟', '小', '大',
  '谢谢', '再见', '木头', '三', '四', '人', '是', '不', '什么', '钱', '风', '歌', '洞'];
const SONG = {landed: 1, dressed: 2, back: 1, child: 3, years: 1, boat: 2, song: 1, chapter: 1};
// A game in chapter 1 (area: more of its progress; more: more of the save), standing at pos
function game(pos, area = {}, more = {}){
  const w = Object.fromEntries(FROM_BEFORE.map(x => [x, {lv: 2, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, shells: 0, coins: 5, met: [], friends: [],
    areas: {1: {chapter: 1, raft: 3, done: true}, 2: {...SONG, ...area}}, pos, ...more, w: {...w, ...more.w}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__asked = 0");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }; pictureQ = async () => { __asked++; return true; }; closeCard = () => {}");
  g.run("globalThis.__said = []; showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('') + (o.noEn ? ' (no English)' : '')); }");
  g.run("gapQ = async o => { __said.push('gap: ' + o.t.join('') + ' (' + o.gap + ')'); return true; }; practiseFirst = async () => true");
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 400 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };

test('the way up: the stone steps on the far shore lead to the foot of the mountain, then the cliff road, then the stone pillars', () => {
  const g = game({place: 'farShore', x: 15, y: 1, dir: 'up'});
  const ways = get(g, 'Object.fromEntries(["farShore", "mountainFoot", "cliffRoad", "pillars"].map(id => [id, [...new Set(PLACES[id].exits.map(e => e.to))]]))');
  assert.deepEqual(ways, {farShore: ['harbour', 'mountainFoot'], mountainFoot: ['farShore', 'cliffRoad'], cliffRoad: ['mountainFoot', 'pillars'], pillars: ['cliffRoad', 'cave']});
  assert.deepEqual(get(g, '["cliffRoad", "pillars"].map(id => [!!PLACES[id].clouds, !!PLACES[id].mist])'), [[true, false], [true, true]], 'clouds drift past up there, and mist rolls in over the pillars');
});

test('the woodcutter’s hut: he asks for things only in Chinese, and you bring what he says, as many as he says', async () => {
  const g = game({place: 'mountainFoot', x: 11, y: 4, dir: 'left'});
  assert.deepEqual(get(g, '(n => [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === "woodcutter"))'), ['mountainFoot', 10, 4]);
  await press(g, 11, 4, 'left');
  assert.deepEqual(said(g), ['woodcutter: 我累了。', 'woodcutter: 我要三块木头。 (no English)'], 'asked in Chinese, its English hidden');
  assert.equal(get(g, 'here().woodFetch'), 1);
  // the wrong thing: water
  await press(g, 9, 11, 'down');
  assert.deepEqual(get(g, 'here().carrying'), {word: '水', n: 1});
  await press(g, 11, 4, 'left');
  assert.deepEqual(said(g), ['woodcutter: 不对。', 'woodcutter: 我要三块木头。 (no English)']);
  assert.ok(notes(g).some(n => /not what he asked for/.test(n)));
  // two pieces of wood is too few; three, counted aloud, is right
  for (let i = 0; i < 2; i++) await press(g, 8, 4, 'up');
  await press(g, 11, 4, 'left');
  assert.equal(said(g)[0], 'woodcutter: 不对。', 'two isn’t three');
  notes(g);
  for (let i = 0; i < 3; i++) await press(g, 8, 4, 'up');
  assert.ok(notes(g).some(n => /三.*You’re carrying 3 木头/.test(n)), 'counted aloud as you pick them up');
  await press(g, 11, 4, 'left');
  assert.deepEqual(said(g), ['woodcutter: 对！谢谢！', 'woodcutter: 我要水。 (no English)']);
  await press(g, 9, 11, 'down');
  await press(g, 11, 4, 'left');
  assert.deepEqual(said(g), ['woodcutter: 对！谢谢！', 'woodcutter: 我要四块石头。 (no English)']);
  for (const [x, y, d] of [[4, 10, 'down'], [4, 10, 'down'], [22, 10, 'down'], [22, 10, 'down']]) await press(g, x, y, d);
  const coins = get(g, 'S.coins');
  await press(g, 11, 4, 'left');
  assert.deepEqual(said(g), ['woodcutter: 对！谢谢！', 'woodcutter: 你去山上吧！']);
  assert.deepEqual([get(g, 'here().woodFetch'), get(g, 'S.coins')], [4, coins + 3], 'all brought: he pays you');
  assert.equal(get(g, 'areaChecklist()[0][1]'), true);
  // after that, what you pick up is just looked at
  assert.equal(g.run('promptFor(8, 3)'), '', 'nothing to do there now');
});

test('the cliff road: gusts of wind blow across the walkway, one row after another, so you go up between them', () => {
  const g = game({place: 'cliffRoad', x: 10, y: 26, dir: 'up'});
  const rows = get(g, '[25, 24, 23, 22].map(y => tileAt(10, y).vent)');
  assert.ok(rows.every(v => v.wind && v.every === 3200 && v.puff === 1400), 'each row a gust');
  assert.deepEqual(rows.map(v => v.at), [0, 800, 1600, 2400], 'each a little after the one below');
  assert.deepEqual(get(g, '[0, 2000].map(t => puffing(10, 25, t))'), [true, false], 'blowing, then calm');
  assert.match(get(g, 'tileAt(10, 25).vent.hot'), /wind/);
});

test('loose planks: hop onto the one with the word’s picture; a wrong one swings away, and you grab the chain (no splash)', async () => {
  const g = game({place: 'cliffRoad', x: 10, y: 18, dir: 'up'});
  assert.equal(g.run('promptFor(10, 17)'), 'Hop');
  g.run('pictureQ = async o => { __asked++; return false; }');
  g.run('globalThis.__swish = 0; SFX.swish = () => { __swish++; }; globalThis.__splash = 0; SFX.splash = () => { __splash++; }');
  await press(g, 10, 18, 'up');
  assert.deepEqual(get(g, '[pl.x, pl.y, __swish, __splash, dripUntil > performance.now()]'), [10, 18, 1, 0, false], 'back where you were, with no splash');
  assert.ok(notes(g).some(n => /swings away/.test(n)));
  g.run('pictureQ = async o => { __asked++; return true; }');
  await press(g, 10, 18, 'up');
  assert.equal(get(g, 'pl.y'), 17, 'onto the plank');
});

test('the chain up the sheer face: A to climb it, a question a pull, up to the top; and back down the same way', async () => {
  const g = game({place: 'cliffRoad', x: 12, y: 11, dir: 'up'});
  assert.equal(g.run('promptFor(12, 10)'), 'Climb');
  await press(g, 12, 11, 'up');
  assert.deepEqual(get(g, '[pl.x, pl.y, __asked]'), [12, 8, 3], 'three pulls, three questions, and you’re at the top');
  await press(g, 12, 8, 'down');
  assert.deepEqual(get(g, '[pl.x, pl.y, __asked]'), [12, 11, 6], 'and down again');
  assert.equal(get(g, 'walkable(12, 9) || walkable(12, 10)'), false, 'no walking up the face');
});

test('云: the sea of clouds under the walkway, a word that waits for a little practice; the crane (鹤) by its pool', async () => {
  const g = game({place: 'cliffRoad', x: 15, y: 31, dir: 'right'});
  const legend = get(g, 'PLACES.cliffRoad.legend.c');
  assert.equal(legend.onLook[0].waits, true);
  await press(g, 15, 31, 'right');
  assert.ok(notes(g).includes('card: 云'));
  const crane = get(g, 'AREA.animals.find(a => a.id === "crane")');
  assert.deepEqual([crane.word, crane.at, crane.chapter, crane.waits], ['鹤', [14, 12, 'cliffRoad'], 1, true]);
});

test('the stone pillars: the sky (天) once you’re ready for a new word; the boy at the door asks who you are, and lets you in', async () => {
  const g = game({place: 'pillars', x: 14, y: 22, dir: 'up'}, {}, {w: {'云': {lv: 1, ok: 0}, '鹤': {lv: 1, ok: 0}}});
  assert.deepEqual(get(g, '(n => [n.place])(ALL_NPCS.find(n => n.id === "doorBoy"))'), ['hut'], 'behind the shut door');
  g.run('S.turn = (S.turn || 0) + 10');
  await play(g, 'runEvents()');
  assert.ok(notes(g).includes('card: 天'));
  assert.equal(get(g, 'here().sky'), 1);
  assert.deepEqual(get(g, 'tileAt(12, 12).sign.says.zh'), '灵台方寸山', 'the mountain’s tablet');
  assert.equal(get(g, 'tileAt(14, 5).open || false'), false, 'the door, shut');
  // up to the door: it opens, and the boy comes out
  g.run('S.pos = {place: "pillars", x: 15, y: 8, dir: "up"}; placePlayer()');
  await play(g, 'runEvents()');
  assert.deepEqual(said(g), ['doorBoy: 你是谁？', 'gap: 我是猴子 (猴子)', 'doorBoy: 师父在等你。']);
  assert.equal(get(g, 'here().door'), 2);
  assert.equal(get(g, 'tileAt(14, 5).open'), true, 'the stone doors stand open');
  assert.equal(get(g, 'tileAt(14, 4).sign.says.zh'), '斜月三星洞');
  const after = notes(g);
  assert.ok(after.some(n => /Follow him/.test(n)));
  assert.deepEqual(get(g, 'areaChecklist().filter(c => c[3]).map(([t, done]) => [t, done])'), [['Find out your new name', false]], 'the next part of the story: the cave');
  assert.equal(get(g, 'partNow().title'), 'The immortal’s cave');
  assert.ok(after.some(n => /box: Part 2 The immortal’s cave/.test(n)), 'its card');
  assert.equal(g.run('promptFor(14, 5)'), 'Go in', 'in through the open doors');
  assert.deepEqual(get(g, '(n => [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === "doorBoy"))'), ['cave', 13, 16], 'he’s gone in');
});

test('a game saved at the end of the prologue, before chapter 1 was built, goes on into chapter 1', async () => {
  const g = game({place: 'farShore', x: 10, y: 11, dir: 'up'}, {chapter: 0, done: true});
  g.run('AREA.chapters[1] && (STEPS.chapter = async s => { here().chapter = s.chapter; })');
  await play(g, 'runEvents()');
  assert.equal(get(g, 'here().chapter'), 1);
  assert.equal(g.run('isOpen(PLACES.farShore.exits[2])'), true, 'up the stone steps');
});
