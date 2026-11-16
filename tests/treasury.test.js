// Area 3, the Eastern Sea, step 8 (16 November 2026): the staff. The Dragon Queen's whisper (宝库里有一根铁柱子，它有光！)
// opens the treasury behind the throne hall; the iron pillar glows there, up through the roof: 太长了！ (长). You tell it
// what to do on a card: 变短！ (短), then 变小！, and it shrinks as you watch, a staff in a flash of golden light (金色的光！
// 金色); you pick it up, its writing on a card (如意金箍棒 一万三千五百斤), read out by the Dragon King (万); his 给你！ (给).
// The staff is your weapon from then on: twice as strong as the broadsword, in your paws on the map and in every pose.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '水', '草', '鱼', '海', '海龟', '马', '虾', '王', '门', '刀', '猴子', '钱', '地图', '妖怪', '动物', '朋友', '我', '是', '要', '什么', '看', '没有',
  '一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十', '大', '小', '变', '泡泡', '沙子', '贝壳', '水草', '游', '海星', '几', '鲸鱼', '光', '龙', '兵', '百', '龙虾',
  '柱子', '欢迎', '重', '斤', '轻', '千', '多少'];
const HALL_DONE = {chapter: 0, landed: 1, part: 5, weapon: '刀', turtle: 3, starFriends: 5, forest: 1, octopus: 1, dolphin: 2, trench: 2, palace: 3, hall: 2};
function game(area = {}, {pos = {place: 'treasury', x: 7, y: 6, dir: 'up'}, known = KNOWN} = {}){
  const g = loadGame({dom: true, save: {version: 42, started: true, area: 3, shells: 7, coins: 9, met: ['starfish', 'octopus', 'seahorse', 'whale', 'lobster'], friends: ['starfish', 'octopus', 'seahorse', 'whale', 'lobster'],
    w: Object.fromEntries(known.map(x => [x, {lv: 2, ok: 2}])), areas: {1: {chapter: 1, raft: 3, done: true}, 2: {ch2: 1}, 3: {...HALL_DONE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__morphs = []; globalThis.__picked = []; globalThis.__writ = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }");
  g.run('placePlayer()');
  return g;
}
// what you choose on each telling card, in turn (null: Not now); the pillar's changes, the pick-up and the writing card noted
function choose(g, picks){
  g.run(`globalThis.__picks = ${JSON.stringify(picks)}; tellCard = async id => __picks.shift(); pillarTo = async shape => { __morphs.push(shape); pillarHeld = null; };
    pickUpAct = async w => { __picked.push(w); }; writingCard = async id => { __writ.push(id); }`);
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 4000 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const p = (g, k) => get(g, `here().${k}`);
const at = (g, id) => get(g, `(() => { const n = NPCS.find(n => n.id === "${id}"); return n ? [n.place || PLACE, n.x, n.y] : null; })()`);

test('the Dragon Queen’s idea: the iron pillar in the treasury, glowing; she leads you to its door and opens it (Part 7)', async () => {
  const g = game({}, {pos: {place: 'hall', x: 11, y: 4, dir: 'up'}});
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['queen']);
  const way = 'PLACES.hall.exits.find(e => e.to === "treasury")';
  assert.equal(g.run(`isOpen(${way})`), false, 'shut till then');
  assert.equal(get(g, 'tileAt(12, 0).look'), 'treasuryDoor');
  await press(g, 11, 4, 'up');
  assert.deepEqual(said(g), ['dragonQueen: 宝库里有一根铁柱子，它有光！']);
  assert.deepEqual(get(g, '[pl.x, pl.y, pl.dir]'), [12, 2, 'up'], 'led to the door at the back of the hall');
  assert.equal(p(g, 'hall'), 3);
  assert.equal(g.run(`isOpen(${way})`), true);
  assert.equal(get(g, 'tileAt(12, 0).look'), 'treasuryDoorOpen');
  assert.ok(notes(g).some(n => /opens the 门 \(door\)/.test(n)));
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['toTreasury']);
  assert.deepEqual(get(g, '[PARTS[6].title, PLACES.treasury.name.zh]'), ['The iron pillar', '海藏']);
});

test('the treasury: dim, the iron pillar glowing up through the roof, the Dragon King and Queen beside it', () => {
  const g = game({hall: 3});
  assert.deepEqual(at(g, 'dragonKing'), ['treasury', 5, 7]);
  assert.deepEqual(at(g, 'dragonQueen'), ['treasury', 9, 7]);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['pillar']);
  assert.ok(get(g, 'pillarSize(0).h') > 300, 'taller than the screen: up through the roof, wherever you stand');
  for (const y of [1, 3, 5]) assert.equal(get(g, `tileAt(7, ${y}).walk || false`), false);
  for (const t of [0, 900]) g.run(`drawWorld(${t})`);
  g.run('S.clock.t = DAY_MS * .9; drawWorld(3000)');
});

test('A at the pillar: 太长了！ (长); tell it what to do, wrong and right: 变短！ (短), 变小！; 金色的光！ (金色); its writing (万); 给你！ (给)', async () => {
  const g = game({hall: 3});
  choose(g, ['变长', '变短', '变大', '变小']);
  await press(g, 7, 6, 'up');
  assert.deepEqual(said(g), ['player: 太长了！', 'player: 变长！', 'player: 变短！', 'player: 变大！', 'player: 变小！', 'player: 金色的光！',
    'dragonKing: 一万三千五百斤！', 'dragonKing: 给你！', 'dragonQueen: 金箍棒是你的了！']);
  const told = notes(g);
  assert.deepEqual(told.filter(n => /^card:/.test(n)), ['card: 长', 'card: 短', 'card: 金色', 'card: 万', 'card: 给'], 'one new word at a time');
  assert.ok(told.some(n => /grow even 长 \(longer\)/.test(n)) && told.some(n => /even thicker/.test(n)), 'what you told it wrongly, you see it do');
  assert.deepEqual(get(g, '__morphs'), ['longer', 'short', 'wide', 'small']);
  assert.deepEqual(get(g, '[__picked, __writ]'), [['金箍棒'], ['staff']]);
  assert.equal(p(g, 'staff'), 4);
  assert.equal(get(g, 'weaponNow()'), '金箍棒');
  for (const y of [1, 3, 5]) assert.equal(get(g, `tileAt(7, ${y}).walk`), true, 'the pillar’s gone from where it stood');
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['staff']);
});

test('Not now, and coming back: the pillar keeps what you’ve told it, and A carries on from there', async () => {
  const g = game({hall: 3});
  choose(g, [null]);
  await press(g, 7, 6, 'up');
  assert.deepEqual(said(g), ['player: 太长了！']);
  assert.equal(p(g, 'staff'), 0);
  choose(g, ['变短', null]);
  await press(g, 7, 6, 'up');
  assert.deepEqual(said(g), ['player: 太长了！', 'player: 变短！']);
  assert.equal(p(g, 'staff'), 1);
  assert.equal(get(g, 'tileAt(7, 1).walk'), true, 'short now: the roof’s clear of it');
  assert.equal(get(g, 'promptFor(...facing())'), 'Tell');
  choose(g, ['变小']);
  await press(g, 7, 6, 'up');
  assert.deepEqual(said(g).slice(0, 2), ['player: 变小！', 'player: 金色的光！']);
  assert.equal(p(g, 'staff'), 4);
});

test('picked up but not given yet (staff 3): the Dragon King has more for you, and gives it you', async () => {
  const g = game({hall: 3, staff: 3, weapon: '金箍棒'}, {known: [...KNOWN, '长', '短', '金色'], pos: {place: 'treasury', x: 6, y: 7, dir: 'left'}});
  choose(g, []);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['given']);
  await press(g, 6, 7, 'left');
  assert.deepEqual(said(g), ['dragonKing: 一万三千五百斤！', 'dragonKing: 给你！', 'dragonQueen: 金箍棒是你的了！']);
  assert.equal(p(g, 'staff'), 4);
});

test('the telling card: what you could tell it, each with pinyin and English; Not now', async () => {
  const g = game({hall: 3});
  const sheet = g.el('#sheet');
  g.run('S.replyEn = true; S.pinyin = true');
  let got;
  const pr = Promise.resolve(g.run("tellCard('shorter')")).then(v => { got = v; });
  await tick();
  const opts = [...sheet.querySelectorAll('.tells .opt')];
  assert.deepEqual(opts.map(o => o.textContent), ['变长biàn chángGet longer', '变短biàn duǎnGet shorter']);
  assert.match(sheet.textContent, /The 柱子 \(pillar\) is far too 长 \(long\) to hold/);
  opts[1].click(); await pr;
  assert.equal(got, '变短');
  const pr2 = Promise.resolve(g.run("tellCard('smaller')")).then(v => { got = v; });
  await tick();
  sheet.querySelector('[data-a=no]').click(); await pr2;
  assert.equal(got, null);
});

test('the staff’s writing: in pixel characters, its name with pinyin and English, and 万 a ？ till the Dragon King reads it', async () => {
  const g = game({hall: 3, staff: 3});
  const sheet = g.el('#sheet');
  const pr = Promise.resolve(g.run("writingCard('staff')"));
  await tick();
  assert.match(sheet.querySelector('.wname').textContent, /如意金箍棒 Rúyì Jīngū Bàng · the As-You-Will Gold-Banded Staff/);
  assert.deepEqual([...sheet.querySelectorAll('.wch')].map(c => c.textContent), ['一yī', '万？', '三sān', '千qiān', '五wǔ', '百bǎi', '斤jīn']);
  assert.ok(sheet.querySelector('canvas.writpic'));
  sheet.querySelector('[data-a=ok]').click(); await pr;
  for (const c of '如意金箍棒一万三千五百斤') assert.ok(get(g, `!!HANZI["${c}"]`), `${c} can be written in pixels`);
});

test('the staff, your weapon: twice as strong as the broadsword, gold bands at each end, on the map, in every pose and in battles', () => {
  const g = game({hall: 3, staff: 4, weapon: '金箍棒'}, {known: [...KNOWN, '长', '短', '金色', '万', '给']});
  assert.deepEqual(get(g, '[weaponHits(), BATTLES.weapons["刀"]]'), [30, 15]);
  const rows = get(g, 'monkeyRows("player", "down", false, 0)');
  assert.deepEqual([1, 2, 12, 13].map(y => rows[y][14]), ['u', 'u', 'u', 'u'], 'its gold bands, at each end');
  assert.equal(rows[6][14], 'l', 'iron between them');
  const pose = get(g, 'POSES.grid("swing", "right", "up", undefined, HELD["金箍棒"]).rows.join("")');
  assert.ok(pose.includes('y') && pose.includes('g'), 'in a pose: iron, and gold at its ends');
  assert.equal(g.run('weaponPic("金箍棒") ? "yes" : "no"'), 'yes', 'its own picture, held up in a battle');
  g.run('drawWorld(1000)');
});

test('picking up something with a bigger drawing of its own, the staff or a weapon off the scale: drawn in your paws', () => {
  const g = game({hall: 3, staff: 2});
  g.run("globalThis.__drew = []; LIFTED['金箍棒'] = () => __drew.push('staff'); LIFTED.broadsword = () => __drew.push('broadsword')");
  g.run("ACTS.pick(100, 100, 50, {kind:'pick', t0:0, dir:'up', reach:'down', w:'金箍棒', x:7, y:5})");   // (lying there, as you crouch for it)
  g.run("ACTS.pick(100, 100, PICK.caught + 50, {kind:'pick', t0:0, dir:'up', reach:'down', w:'金箍棒', x:7, y:5})");   // (held up over your head)
  g.run("ACTS.pick(100, 100, PICK.caught + 50, {kind:'pick', t0:0, dir:'up', reach:'in', w:'broadsword', x:13, y:8})");
  assert.deepEqual(get(g, '__drew'), ['staff', 'staff', 'broadsword']);
});
