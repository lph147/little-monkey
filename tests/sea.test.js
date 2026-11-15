// Area 3, the Eastern Sea (Chapters 5 and 6), step 1 (15 November 2026): the way down. At the end of Chapter 4 the iron
// bridge in the Water Curtain Cave offers the dive (Ready to dive?, the raft's card), and you arrive on the seabed: your
// broadsword still in your paw, the dive scene, Chapter 5's card, the place under water (no rain, its own tune), and the
// water drawn over it, its rippling light made once, not every frame (js/sea.js).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 2000 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const KNOWN = ['石头', '你好', '山', '水', '鱼', '海', '猴子', '钱', '地图', '妖怪', '刀', '桃子', '衣服', '帽子', '鞋'];
// A game at the end of Chapter 4 (Area 2 done: ch2), its words, friends, shells and coins, its clothes on
const END_OF_4 = {landed: 1, dressed: 2, chapter: 2, king: 2, homeAgain: 1, unload: 6, party: 1, stickGiven: 1, weapon: '刀'};
function save(area, pos, more = {}){
  return {version: 42, started: true, area, shells: 7, coins: 9, met: [], friends: ['goose', 'crane'], w: Object.fromEntries(KNOWN.map(x => [x, {lv: 2, ok: 2}])),
    wardrobe: {owned: ['衣服', '帽子', '鞋'], wearing: ['衣服', '帽子', '鞋']}, areas: {1: {chapter: 1, raft: 3, done: true}, 2: {...END_OF_4, ...more}}, pos};
}
function stubbed(g){
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__scenes = []; globalThis.__ready = []; globalThis.__went = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }");
  g.run("storyScene = async id => { __scenes.push(id); }; toArea = (area, slot, action) => { __went.push([area, action]); }");
  g.run("STEPS.chapter = async s => { here().chapter = s.chapter; __notes.push('chapter: ' + AREA.chapters[s.chapter].name); }");
  return g;
}

test('at the end of Chapter 4, the iron bridge in the Water Curtain Cave offers the dive: Ready to dive?, and Dive goes on to Area 3', async () => {
  const g = stubbed(loadGame({dom: true, save: save(2, {place: 'ffmCave', x: 7, y: 5, dir: 'down'}, {ch2: 1})}));
  g.run('placePlayer()');
  assert.equal(g.run('tileAt(7, 6).look'), 'ironBridge', 'the iron bridge, across the cave’s stream');
  assert.equal(get(g, 'getTasks().map(t => t.id)').includes('c2dive'), true, 'a task says to dive');
  g.run("readyCard = async (title, go) => { __ready.push([title, go]); return STOP; }");   // Not yet
  await press(g, 7, 5, 'down');
  assert.deepEqual(get(g, '__ready'), [['Ready to dive?', 'Dive']], 'the raft’s card, as Ready to dive?');
  assert.deepEqual(get(g, '__went'), [], 'Not yet: you stay');
  assert.match(get(g, '__notes').join(' '), /Come back whenever you’re ready to dive/);
  g.run("__ready.length = 0; readyCard = async (title, go) => { __ready.push([title, go]); }; lastTalk = null");   // Dive
  await press(g, 7, 5, 'down');
  assert.deepEqual(get(g, '__went'), [[3, 'arrive']], 'on to Area 3, arriving there');
  assert.equal(g.run('S.area'), 3);
  assert.match(get(g, 'AREA.areaEnd.text').join(' '), /dive from the bridge/, 'the end card says where to go');
});

test('the phone’s test save (tools/area3-start.json) is a game at the end of Chapter 4, at the iron bridge, with the dive the one thing to do', () => {
  const s = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'tools', 'area3-start.json'), 'utf8'));
  const g = loadGame({dom: true, save: s});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  assert.deepEqual(get(g, '[S.area, PLACE, S.pos.x, S.pos.y, here().ch2]'), [2, 'ffmCave', 7, 5, 1]);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['c2dive'], 'every earlier job done');
  assert.deepEqual(get(g, 'getTasks().filter(t => !S.tasksSeen[t.id]).map(t => t.id)'), ['c2dive'], 'and only the dive new');
  assert.equal(g.run('hasMap()'), true, 'its map, from Area 1');
  assert.deepEqual(get(g, '[S.sound, S.music]'), [true, true], 'with sound, to hear the sea');
});

test('before the end of Chapter 4, the iron bridge is just a bridge', async () => {
  const g = stubbed(loadGame({dom: true, save: save(2, {place: 'ffmCave', x: 7, y: 5, dir: 'down'}, {ch2: 0})}));
  g.run("placePlayer(); readyCard = async () => { __ready.push('asked'); }");
  await press(g, 7, 5, 'down');
  assert.deepEqual(get(g, '__ready'), [], 'no dive yet');
  assert.equal(g.run('S.area'), 2);
});

test('arriving in the Eastern Sea: your broadsword in your paw, the dive, Chapter 5’s card, and the seabed under water', async () => {
  const s = save(3, {place: 'ffmCave', x: 7, y: 5, dir: 'down'}, {ch2: 1});
  const g = stubbed(loadGame({dom: true, save: s}));
  await play(g, 'arriveInArea()');
  assert.deepEqual(get(g, '__scenes'), ['dive'], 'the dive');
  assert.equal(get(g, 'here().weapon'), '刀', 'your broadsword, from Chapter 4');
  assert.equal(get(g, 'here().landed'), 1);
  assert.ok(get(g, '__notes').includes('chapter: Chapter 5'), 'Chapter 5’s card');
  assert.match(get(g, '__notes').join(' '), /A sea turtle is swimming towards you/, 'and the sea turtle from your shore swims up (step 2: tests/seabed.test.js)');
  assert.deepEqual(get(g, '[PLACE, S.pos.x, S.pos.y, S.area]'), ['seabed', 11, 6, 3], 'on the seabed, where you land');
  assert.equal(g.run('underwater()'), true);
  assert.equal(g.run('placeSong()'), 'sea', 'the sea’s own tune');
  g.run('rainNow = () => 1');
  assert.equal(g.run('rainingHere()'), false, 'no rain under the sea');
  // everything you had comes with you
  assert.deepEqual(get(g, '[S.shells, S.coins, S.friends.length, lvl("海"), S.wardrobe.wearing.length]'), [7, 9, 2, 2, 3]);
  assert.equal(get(g, 'summaryOf(S, 1).area.en'), 'The Eastern Sea', 'your game’s card on the title screen');
  assert.equal(get(g, 'summaryOf(S, 1).chapter.name'), 'Chapter 5');
  assert.ok(get(g, 'summaryOf(S, 1).scroll').every(a => a.of > 0), 'no area shows an empty scroll as full');
  assert.deepEqual(get(g, 'AREAS.filter(a => a.number < AREA.number).map(a => !!a.storyFold)'), [true, true], 'Story so far folds Areas 1 and 2 above it');
});

test('the seabed: sand, seaweed, shells, rocks and coral drawn from the shape kit, and the water over it all, its light made once', () => {
  const g = loadGame({dom: true, save: save(3, {place: 'seabed', x: 11, y: 6, dir: 'down'})});
  g.run("mode = 'play'; save = () => {}; placePlayer()");
  const looks = get(g, '[...new Set(MAP.join("").split(""))].map(ch => LEGEND[ch].look)');
  for (const l of looks) assert.equal(g.run(`typeof LOOKS['${l}']`), 'function', `${l} has a look`);
  for (const l of ['seaRock', 'seaRockBig', 'coral', 'coralOrange', 'seaFan', 'brainCoral', 'clam']) assert.equal(g.run(`typeof OBJECT_ART.${l}`), 'function', `${l} is drawn`);
  for (const n of ['rock', 'rockBig', 'coral', 'coralOrange', 'fan', 'brain', 'clam', 'shell', 'shellPink', 'conch', 'fishYellow', 'fishBlue']) assert.ok(get(g, `MAP_ART['${n}'].rows.length`) > 4, `${n}, drawn with the shape kit`);
  assert.equal(g.run('walkable(11, 6)'), true, 'where you land is sand');
  assert.equal(g.run('walkable(7, 7)'), false, 'a rock is in the way');
  assert.equal(g.run('seaLight'), null, 'the rippling light isn’t made till it’s needed');
  g.run('globalThis.__made = 0; const was = makeSeaLight; makeSeaLight = () => { __made++; return was(); }');
  for (let i = 0; i < 4; i++) g.run(`drawWorld(${1000 + i * 200})`);
  assert.equal(g.run('__made'), 1, 'made once, then the same eight frames drawn again and again');
  assert.deepEqual(get(g, '[seaLight.width, seaLight.height]'), [512, 64]);
  g.run('S.clock.t = DAY_MS * .9; drawWorld(2000)');   // at night too
});

test('the dive scene draws, start to end', () => {
  const g = loadGame({dom: true, save: save(3, {place: 'seabed', x: 11, y: 6, dir: 'down'})});
  for (const t of [0, 1, 2, 4, 6, 8, 9]) g.run(`drawDive(${t}, ${t * 1000})`);
  assert.deepEqual(get(g, 'Object.keys(AREA.scenes)'), ['dive']);
  assert.equal(get(g, 'AREA.scenes.dive.part'), 'seabed', 'watch it again from Story so far');
  assert.equal(g.run("typeof SCENE_ART.dive"), 'function');
});
