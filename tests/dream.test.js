// Area 3, the Eastern Sea: Chapter 6 (16 November 2026), parts 3 and 4. After the feast for your staff you go to bed, and
// dream: two officers of the underworld lead you off with a rope (绳子), up a misty road lit by lamps (灯), till your staff
// scares them off; the ten kings are scared of you (怕), and give you the book of names: find yours (找) and cross it out
// with a brush (毛笔), then the troop's. Woken by the old monkey (醒醒！ 醒): it was a dream (梦), but the troop will never
// grow old. In Heaven the Dragon King and the ten kings complain, and the Great White Planet flies down to the home ground
// to invite you (玉皇大帝请你去天宫。 请): the end of Area 3.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '水', '草', '鱼', '海', '海龟', '马', '虾', '王', '门', '刀', '猴子', '钱', '地图', '妖怪', '动物', '朋友', '我', '是', '要', '什么', '看', '没有',
  '一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十', '大', '小', '变', '白色', '帽子', '衣服', '鞋', '回家', '回来', '桃子', '床', '谢谢', '名字', '书', '写', '毛',
  '泡泡', '沙子', '贝壳', '水草', '游', '海星', '几', '鲸鱼', '光', '龙', '兵', '百', '龙虾', '柱子', '欢迎', '重', '斤', '轻', '千', '多少', '长', '短', '金色', '万', '给', '钟', '鼓',
  '针', '耳朵', '在', '高'];
const SPOTS_DONE = {chapter: 1, landed: 1, part: 10, weapon: '金箍棒', turtle: 3, starFriends: 5, forest: 1, octopus: 1, dolphin: 2, trench: 2, palace: 3, hall: 3, staff: 4,
  gifts: 4, south: 1, west: 1, north: 1, home: 3, ear: 1, spotTree: 1, spotBoulder: 1, bridge: 1, spotIslet: 1, spotCrack: 1, spotTrainee: 1, feast: 1};
function game(area = {}, {pos = {place: 'ffmCave', x: 1, y: 2, dir: 'up'}, known = KNOWN} = {}){
  const g = loadGame({dom: true, save: {version: 42, started: true, area: 3, shells: 7, coins: 9, met: ['starfish', 'octopus', 'seahorse', 'whale', 'lobster'], friends: ['starfish', 'octopus', 'seahorse', 'whale', 'lobster'],
    w: Object.fromEntries(known.map(x => [x, {lv: 2, ok: 2}])), areas: {1: {chapter: 1, raft: 3, done: true}, 2: {ch2: 1}, 3: {...SPOTS_DONE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__scenes = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }; storyScene = async id => { __scenes.push(id); }");
  g.run("globalThis.__bookCard = bookCard; bookCard = async id => { __notes.push('book: ' + id); }; replyWith = async (w, o = {}) => { __said.push('reply: ' + w); }");
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 8000 && !done; i++){ await tick(); g.flush(); } await p; }
const goTo = (g, place, x, y, dir) => g.run(`S.pos = {place: '${place}', x: ${x}, y: ${y}, dir: '${dir}'}; setPlace('${place}'); placeCharacters(); placePlayer(); lastTalk = null`);
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const p = (g, k) => get(g, `here().${k}`);
const at = (g, id) => get(g, `(() => { const n = ALL_NPCS.find(n => n.id === "${id}"); return [n.place, n.x, n.y]; })()`);
const tasks = g => get(g, 'getTasks().map(t => t.id)');

test('after the feast, a stone bed in the Water Curtain Cave: you fall asleep, and dream', async () => {
  const g = game();
  assert.deepEqual(tasks(g), ['bed']);
  assert.equal(get(g, 'promptFor(1, 1)'), 'Sleep');
  await press(g, 1, 2, 'up');
  assert.deepEqual(get(g, '__scenes'), ['dreamIn']);
  assert.equal(get(g, 'PLACE'), 'underworld');
  assert.ok(get(g, 'PLACES.underworld.dream && PLACES.underworld.noMap && !PLACES.underworld.onMap'), 'a dream, not on any map');
});

test('the dream: two officers and their rope (绳子), up the misty road, till your staff scares them off; the lamps (灯)', async () => {
  const g = game({dream: 1}, {pos: {place: 'underworld', x: 7, y: 12, dir: 'up'}});
  assert.equal(get(g, 'tileAt(4, 9).word'), '灯');
  await play(g, 'runEvents()');
  assert.deepEqual(said(g), ['official1: 你是孙悟空吗？', 'player: 我是孙悟空！', 'official1: 走吧！', 'player: 变大！']);
  assert.deepEqual(notes(g).filter(n => /^card:/.test(n)), ['card: 绳子']);
  assert.equal(p(g, 'dream'), 3);
  assert.deepEqual(get(g, '[pl.x, pl.y]'), [7, 6], 'led up the road to the hall’s door');
  assert.deepEqual([at(g, 'official1')[0], at(g, 'official2')[0]], ['gone', 'gone'], 'they’ve run');
  assert.deepEqual(tasks(g), ['hall']);
  g.run('here().dream = 2');
  assert.equal(get(g, 'matches(AREA.rope.if)'), true, 'the rope round you while they lead you');
  g.run('here().dream = 3');
  await press(g, 5, 7, 'left');   // (a lamp)
  assert.ok(notes(g).includes('card: 灯') || get(g, 'lvl("灯")') >= 1, 'press A at a lamp: 灯');
});

test('the ten kings, scared of you (怕): the book of names (找, 毛笔); then you wake up at home (醒, 梦), and the troop won’t grow old', async () => {
  const g = game({dream: 3}, {pos: {place: 'underworld', x: 7, y: 5, dir: 'up'}});
  assert.equal(get(g, 'ALL_NPCS.filter(n => /^king/.test(n.id) && n.place === "underworld").length'), 10, 'ten kings');
  await play(g, 'runEvents()');
  assert.deepEqual(said(g), ['king1: 我们怕你！', 'king1: 找你的名字！', 'elder: 醒醒！', 'player: 是梦！', 'troopA: 我们不会老了！']);
  const n = notes(g);
  assert.deepEqual(n.filter(x => /^card:/.test(x)), ['card: 怕', 'card: 找', 'card: 毛笔', 'card: 醒', 'card: 梦']);
  assert.ok(n.includes('book: names'));
  assert.equal(get(g, 'PLACE'), 'ffmCave', 'woken at home');
  assert.deepEqual(at(g, 'elder'), ['ffmHomeGround', 16, 8], 'and the old monkey back by the big table');
  assert.equal(p(g, 'dream'), 5);
  assert.deepEqual(get(g, '__scenes'), ['heaven'], 'trouble in Heaven');
  assert.equal(p(g, 'invite'), 1);
  assert.deepEqual(tasks(g), ['planet']);
});

test('the Great White Planet comes down to the home ground: 欢迎！, and his invitation (请); the end of Area 3', async () => {
  const g = game({dream: 5, invite: 1}, {pos: {place: 'ffmHomeGround', x: 2, y: 9, dir: 'right'}});
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__scenes'), ['planetCloud']);
  assert.deepEqual(said(g), ['reply: 欢迎', 'planet: 玉皇大帝请你去天宫。', 'player: 好！我去！']);
  const n = notes(g);
  assert.deepEqual(n.filter(x => /^card:/.test(x)), ['card: 请']);
  assert.ok(n.some(x => /^box: .*The end of Area 3/.test(x)));
  assert.equal(p(g, 'invite'), 3);
  assert.deepEqual(tasks(g), ['continued']);
});

test('the book of names: find yours and cross it out, then every name with 猴 in it', async () => {
  const g = game({dream: 3}, {pos: {place: 'underworld', x: 7, y: 5, dir: 'up'}});
  g.run("globalThis.__done = false; (async () => { await __bookCard('names'); __done = true; })()");
  const sheet = g.el('#sheet'), btns = () => sheet.querySelectorAll('.bname');
  const names = btns().map(b => b.querySelector('.bz').textContent);
  assert.equal(names.length, 12);
  const click = zh => btns().find(b => b.querySelector('.bz').textContent === zh).click();
  const crossed = () => btns().filter(b => b.classList.contains('crossed')).map(b => b.querySelector('.bz').textContent);
  const ask = () => sheet.querySelector('.bookask').textContent;
  click('老猴子');
  assert.deepEqual(crossed(), [], 'your own name first');
  assert.match(ask(), /isn’t your name/);
  click('孙悟空');
  assert.deepEqual(crossed(), ['孙悟空']);
  click('小狗');
  assert.match(ask(), /no 猴/);
  for (const n of ['老猴子', '大猴子', '饿猴子']) click(n);
  assert.match(ask(), /1 more/);
  assert.equal(sheet.querySelector('[data-a=ok]').hidden, true);
  click('小猴子');
  assert.equal(sheet.querySelector('[data-a=ok]').hidden, false, 'all crossed out: Done');
  sheet.querySelector('[data-a=ok]').click();
  await play(g, 'Promise.resolve()');
  assert.equal(get(g, '__done'), true);
});

test('the dream, Heaven and the Great White Planet drawn', () => {
  const g = game({dream: 2}, {pos: {place: 'underworld', x: 7, y: 9, dir: 'up'}});
  g.run('drawWorld(1000)');
  for (const t of [0, 1, 2.6, 3.4, 4.5, 6, 7, 9]){
    for (const s of ['dreamIn', 'heaven', 'planetCloud']) g.run(`SCENE_ART.${s}(${t}, ${t * 1000})`);
  }
  assert.ok(get(g, 'AREA.scenes.heaven.watch && AREA.scenes.planetCloud.watch'), 'watched again from Story so far');
  assert.ok(get(g, '!AREA.scenes.dreamIn.watch'), 'played from a bed: not watched again');
});
