// Area 3 after the owner's review (16 November 2026): everyone with a few things to say in turn, using the words you've
// learned; a question between new words that came one straight after another; all four things you could tell your staff;
// the little monkeys straining to lift it, the little monkey in training swinging it, the boulder rolling away, waking in
// your bed; the troop's planks to the little island, and your staff back in your ear; goodbyes; the cloud shoes; the sea
// turtle not on the shore too; the dragon kings' own voices; and the new characters' own drawings.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '水', '草', '鱼', '海', '海龟', '马', '虾', '王', '门', '书', '刀', '猴子', '钱', '地图', '妖怪', '动物', '朋友', '我', '是', '要', '什么', '看', '没有',
  '一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十', '大', '小', '变', '白色', '帽子', '衣服', '鞋', '回家', '回来', '桃子', '床', '谢谢', '再见', '金子', '玉', '珍珠',
  '泡泡', '沙子', '贝壳', '水草', '游', '海星', '几', '鲸鱼', '光', '龙', '兵', '百', '龙虾', '柱子', '欢迎', '重', '斤', '轻', '千', '多少', '长', '短', '金色', '万', '给', '钟', '鼓',
  '针', '耳朵', '在', '高'];
const CH6 = {chapter: 1, landed: 1, part: 9, weapon: '金箍棒', turtle: 3, starFriends: 5, forest: 1, octopus: 1, dolphin: 2, trench: 2, palace: 3, hall: 3, staff: 4,
  gifts: 4, south: 1, west: 1, north: 1, home: 3, ear: 1};
function game(area = {}, {pos = {place: 'ffmHomeGround', x: 2, y: 9, dir: 'right'}, known = KNOWN, wardrobe} = {}){
  const g = loadGame({dom: true, save: {version: 42, started: true, area: 3, shells: 7, coins: 9, met: [], friends: [],
    w: Object.fromEntries(known.map(x => [x, {lv: 2, ok: 2}])), areas: {1: {chapter: 1, raft: 3, done: true}, 2: {ch2: 1}, 3: {...CH6, ...area}}, pos, ...(wardrobe ? {wardrobe} : {})}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__scenes = []; globalThis.__tell = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");
  g.run("infoBox = async () => {}; storyScene = async id => { __scenes.push(id); }; tellCard = async id => __tell.shift() || null; replyWith = async w => { __said.push('reply: ' + w); }");
  g.run("catchQ = async w => { __notes.push('quiz: ' + w); return true; }; gapQ = async q => { __notes.push('gap: ' + q.gap); return true; }");
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 6000 && !done; i++){ await tick(); g.flush(); } await p; }
const goTo = (g, place, x, y, dir) => g.run(`S.pos = {place: '${place}', x: ${x}, y: ${y}, dir: '${dir}'}; setPlace('${place}'); placeCharacters(); placePlayer(); lastTalk = null`);
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const p = (g, k) => get(g, `here().${k}`);
const tell = (g, ...choices) => g.run(`__tell.push(...${JSON.stringify(choices)})`);
const npc = (g, id) => get(g, `(n => [n.x, n.y])(NPCS.find(n => n.id === '${id}'))`);

test('everyone has a few things to say, in turn, with the words you’ve learned, so you hear them again and again', async () => {
  const g = game({}, {pos: {place: 'palace', x: 8, y: 7, dir: 'down'}});
  const heard = [];
  for (let i = 0; i < 4; i++){ await press(g, 8, 7, 'down'); heard.push(...said(g)); }
  assert.equal(new Set(heard).size, 4, 'a shrimp soldier says four different things, one each time you talk to him');
  assert.ok(heard.includes('soldier1: 金箍棒很重！'), 'and, once it’s yours, about your staff');
  // how often the sea's words are said: the lines everyone has, all together
  const lines = get(g, 'Object.values(AREA.lines).map(l => l.zh)'), words = get(g, 'Object.keys(WORD_BANK).filter(w => WORD_BANK[w].area === 3 && !WORD_BANK[w].phrase)');
  const often = words.filter(w => lines.filter(z => z.split(' ').includes(w)).length >= 2);
  assert.deepEqual(words.filter(w => !often.includes(w)), [], 'every word of the sea comes in two lines or more (13 of 47 did, before the review)');
});

test('a question on a new word before the next one, where they came one straight after another', () => {
  const g = game();
  const steps = get(g, `[...AREA.talk.dragonKing[0].do, ...AREA.talk.baby1[0].do, ...AREA.talk.king1[0].do].filter(s => s.quiz || s.gap).map(s => s.quiz || s.gap.word)`);
  assert.deepEqual(steps, ['重', '轻', '针', '耳朵', '怕']);
  assert.ok(get(g, 'JSON.stringify(AREA.events).includes(\'"quiz":"醒"\')'), 'and on 醒, waking, before 梦');
});

test('all four things you could tell your staff at home, those you know, in a new order each time', async () => {
  const g = game({}, {pos: {place: 'ffmMeadow', x: 14, y: 5, dir: 'up'}});
  const sets = new Set();
  for (let i = 0; i < 12; i++) sets.add(get(g, 'tellChoices(AREA.telling.boulder).join(" ")'));
  assert.ok(sets.size > 1, 'shuffled');
  assert.deepEqual(get(g, 'tellChoices(AREA.telling.boulder)').sort(), ['变短', '变大', '变小', '变长'].sort());
  assert.deepEqual(get(g, 'tellChoices(AREA.telling.shorter)'), ['变长', '变短'], 'the iron pillar’s two, as they were');
  g.run("WORDS['长'] && (S.w['长'] = {lv: 0, ok: 0})");
  assert.ok(!get(g, 'tellChoices(AREA.telling.boulder)').includes('变长'), 'not one whose word you don’t know');
  // a wrong one at a spot shows it, and you choose again
  tell(g, '变长', '变短', '变大');
  await press(g, 14, 5, 'up');
  const n = notes(g);
  assert.ok(n.some(x => /still too thin/.test(x)) && n.some(x => /little stub/.test(x)), 'each wrong one, and why');
  assert.equal(p(g, 'spotBoulder'), 1);
});

test('the little monkeys try to lift your staff: it lies on the ground, they come up to it and strain at it; you pick it up with one paw', async () => {
  const g = game({ear: 0, part: 8}, {pos: {place: 'ffmHomeGround', x: 7, y: 10, dir: 'right'}});
  g.run('__strained = []; const was = STEPS.tryLift; STEPS.tryLift = async s => { await was(s); __strained.push(...s.tryLift.map(id => [id, NPCS.find(n => n.id === id).strainUntil > 0, !!staffLying, inHand()])); }; globalThis.__strained = __strained');
  tell(g, '变长');
  await play(g, 'runEvents()');
  const st = get(g, '__strained');
  assert.deepEqual(st.map(([id, strained, lying, held]) => [id, strained, lying, held]), [['baby1', true, true, null], ['baby3', true, true, null]], 'both strain at it, lying on the ground, not in your paw');
  assert.equal(get(g, 'staffLying'), null, 'you picked it up again');
  assert.deepEqual(said(g).slice(0, 2), ['baby1: 我看看！', 'baby1: 太重了！']);
  assert.deepEqual(get(g, '[!!parkedAt(ALL_NPCS.find(n => n.id === "baby1")), !!parkedAt(ALL_NPCS.find(n => n.id === "baby3"))]'), [true, true], 'and they stay where they tried');
  assert.ok(notes(g).includes('quiz: 针') && get(g, '__notes').length === 0);
});

test('the boulder rolls away as you watch; the little monkey in training swings your staff', async () => {
  const g = game({}, {pos: {place: 'ffmMeadow', x: 14, y: 5, dir: 'up'}});
  tell(g, '变大');
  let sawRolling = false;
  const pr = play(g, 'interact(...facing()).then(runEvents)');
  for (let i = 0; i < 400 && !sawRolling; i++){ await tick(); g.flush(); sawRolling = get(g, 'rolling.length') > 0; }
  await pr;
  assert.ok(sawRolling, 'the boulder rolling away');
  goTo(g, 'ffmHomeGround', 3, 12, 'left');
  tell(g, '变短');
  let lent = false;
  const pr2 = play(g, 'interact(...facing()).then(runEvents)');
  for (let i = 0; i < 2000 && !lent; i++){ await tick(); g.flush(); lent = get(g, '!!lentNow(NPCS.find(n => n.id === "traineeStick"), performance.now())'); }
  await pr2;
  assert.ok(lent, 'your staff, in the little monkey’s paws');
  assert.equal(p(g, 'spotTrainee'), 1);
});

test('the little island: the big monkey lays planks beside your staff, and it comes back to your ear', async () => {
  const g = game({spotBoulder: 1}, {pos: {place: 'ffmMeadow', x: 13, y: 10, dir: 'left'}});
  tell(g, '变长');
  await press(g, 13, 10, 'left');
  assert.deepEqual(get(g, '[tileAt(12, 10).look, tileAt(11, 10).look]'), ['staffBridgeR', 'staffBridgeL']);
  said(g);
  goTo(g, 'ffmMeadow', 10, 10, 'left');
  await play(g, 'runEvents()');
  assert.deepEqual(said(g), ['big: 我来！', 'player: 变小！']);
  assert.deepEqual([p(g, 'planks'), p(g, 'spotIslet')], [2, 1]);
  assert.deepEqual(get(g, '[tileAt(12, 10).look, tileAt(11, 10).look, !!tileAt(11, 10).walk]'), ['bridge', 'bridge', true], 'the troop’s planks, and your staff back in your ear');
  assert.equal(get(g, 'staffOut'), null);
  assert.deepEqual(npc(g, 'big'), [13, 11], 'the big monkey stays by his bridge');
});

test('goodbye to the Dragon King; the troop’s goodbye, and the Great White Planet waits for you', () => {
  const g = game();
  assert.ok(get(g, 'JSON.stringify(AREA.events).includes("goodbye")'), 'the Dragon King: 再见！');
  const planet = get(g, 'AREA.talk.planet[0].do.map(s => s.say || s.reply || s.walk || Object.keys(s)[0])');
  for (const x of ['takeCare', 'weWillWait', 'iWillWait']) assert.ok(planet.includes(x), x);
  assert.match(get(g, 'AREA.areaEnd.text.join(" ")'), /waits at the home ground/);
});

test('the cloud shoes: a little quicker, wisps of cloud at your heels', () => {
  const g = game({}, {wardrobe: {owned: ['白色 的 鞋'], wearing: []}});
  const plain = get(g, 'walkMs()');
  g.run('putOn("白色 的 鞋"); redress()');
  assert.equal(get(g, 'inCloudShoes()'), true);
  assert.ok(get(g, 'walkMs()') < plain, 'a step takes less time');
  g.run('pl.mv = {fx: pl.x, fy: pl.y, t0: performance.now(), dur: 200}; drawWorld(performance.now())');
});

test('the sea turtle isn’t on the shore at home: it’s under the sea with you; the dragon kings each with his own voice', () => {
  const g = game();
  assert.ok(!get(g, 'PAST_ANIMALS.map(a => a.id)').includes('seaTurtle'));
  const v = get(g, 'AREA.voices');
  const names = ['dragonKing', 'southKing', 'westKing', 'northKing'].map(k => v[k].name);
  assert.equal(new Set(names).size, 4, 'four dragon kings, four voices');
});

test('the officers, the ten kings, the Great White Planet and the Jade Emperor in drawings of their own', () => {
  const g = game();
  for (const [id, look] of [['official1', '差人'], ['king1', '十王'], ['king7', '十王'], ['planet', '太白金星']]) assert.equal(get(g, `ALL_NPCS.find(n => n.id === '${id}').look`), look, id);
  assert.deepEqual(get(g, '["差人", "十王", "太白金星", "玉皇大帝"].map(w => MAP_SPRITES[w].rows.length)'), [16, 22, 22, 22]);
  for (const w of ['差人', '十王', '太白金星', '玉皇大帝']) assert.ok(get(g, `!!WORD_BANK['${w}']`), `${w}: a name in the word bank`);
});

test('the dream’s hall: lamps, pillars and doors to find, as well as the book; drawn', () => {
  const g = game({feast: 1, dream: 3}, {pos: {place: 'underworld', x: 7, y: 5, dir: 'up'}});
  const words = get(g, '[...new Set(MAP.join("").split("").map(ch => LEGEND[ch].word).filter(Boolean))].sort()');
  assert.deepEqual(words, ['书', '柱子', '灯', '门'].sort());
  for (const l of ['hallLamp', 'hallPillar', 'hallDoor']) assert.equal(get(g, `typeof LOOKS.${l}`), 'function');
  g.run('drawWorld(1000)');
  for (const t of [0, 1, 2.5, 3, 4, 5, 6.5, 7, 8]){ g.run(`SCENE_ART.staffSky(${t}, ${t * 1000})`); g.run(`SCENE_ART.dreamIn(${t}, ${t * 1000})`); g.run(`SCENE_ART.heaven(${t}, ${t * 1000})`); g.run(`SCENE_ART.planetCloud(${t}, ${t * 1000})`); }
});
