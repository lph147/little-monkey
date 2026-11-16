// Area 3, the Eastern Sea, step 6 (16 November 2026): the palace gate. Down into the light at the bottom of the trench, the
// sea guard stops you (你是谁？ 我是孙悟空！) and steps aside (Part 5); gold dragons coil round the pillars by the gate, its
// plaque saying 龙宫 in pixel characters (龙); the crab general shows you his shrimp soldiers (兵), drilling in time, and
// counts them with you by tens to a hundred (百); and the lobster guards the palace door (龙虾).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '水', '草', '鱼', '海', '海龟', '星星', '马', '虾', '王', '门', '猴子', '钱', '地图', '妖怪', '刀', '动物', '朋友', '我', '是', '跑',
  '一', '二', '三', '四', '五', '十', '二十', '泡泡', '沙子', '贝壳', '水草', '游', '海星', '小心', '鲨鱼', '水母', '章鱼', '脚', '几', '珊瑚', '海马', '海豚', '快', '慢', '深', '鲸鱼', '光'];
const TRENCH_DONE = {chapter: 0, landed: 1, part: 3, weapon: '刀', turtle: 3, starFriends: 5, forest: 1, octopus: 1, dolphin: 2, trench: 2};
function game(area = {}, {pos = {place: 'palace', x: 12, y: 14, dir: 'up'}} = {}){
  const g = loadGame({dom: true, save: {version: 42, started: true, area: 3, shells: 7, coins: 9, met: ['starfish', 'octopus', 'whale'], friends: ['starfish', 'octopus', 'whale'],
    w: Object.fromEntries(KNOWN.map(x => [x, {lv: 2, ok: 2}])), areas: {1: {chapter: 1, raft: 3, done: true}, 2: {ch2: 1}, 3: {...TRENCH_DONE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__tens = null");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");
  g.run("encounter = async f => { if (!S.friends.includes(f.id)) S.friends.push(f.id); return true; }; sayFully = async () => {}");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }");
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

test('the way down into the light at the bottom of the trench opens once you’ve seen it, to the palace gate', () => {
  const before = game({trench: 1}, {pos: {place: 'trench', x: 19, y: 14, dir: 'down'}});
  const way = 'PLACES.trench.exits.find(e => e.to === "palace")';
  assert.equal(before.run(`isOpen(${way})`), false);
  const g = game({}, {pos: {place: 'trench', x: 19, y: 14, dir: 'down'}});
  assert.equal(g.run(`isOpen(${way})`), true);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['toPalace']);
  assert.deepEqual(get(g, `${way}.arrive`), [12, 14]);
  assert.deepEqual(get(g, '[PLACES.palace.name.zh, PARTS[4].title]'), ['龙宫', 'The Dragon King’s palace']);
});

test('the sea guard stops you as you come down: 你是谁？ 我是孙悟空！, and steps aside (Part 5)', async () => {
  const g = game();
  await stand(g, 12, 14, 'up');
  assert.deepEqual(said(g), ['yaksha: 你是谁？', 'player: 我是孙悟空！', 'yaksha: 龙王在里面。']);
  assert.equal(p(g, 'palace'), 1);
  assert.ok(notes(g).some(n => /box: Part 5 The Dragon King’s palace/.test(n)));
  assert.deepEqual(get(g, '(() => { const n = NPCS.find(n => n.id === "yaksha"); return [n.x, n.y]; })()'), [14, 13], 'out of your way');
  assert.equal(get(g, 'bustHTML("yaksha").length') > 20, true, 'his face on the name plate, from his map picture');
  assert.deepEqual(get(g, 'NAMES.yaksha'), {zh: '夜叉', py: 'yèchā', en: 'Sea guard'});
});

test('the gate: 龙宫 on its plaque in pixel characters; gold dragons coiled round its pillars (龙)', async () => {
  const g = game({palace: 1}, {pos: {place: 'palace', x: 8, y: 5, dir: 'up'}});
  assert.ok(get(g, 'HANZI["龙"] && HANZI["宫"]') !== false, 'real Chinese, drawn as pixel characters');
  assert.deepEqual(get(g, 'SPARKLES.filter(sparkling).map(s => s.word)'), ['龙']);
  await press(g, 8, 5, 'up');
  assert.ok(notes(g).includes('card: 龙'));
  g.run('globalThis.__wrote = []; { const was = write; write = (gg, text, ...a) => { __wrote.push(text); return was(gg, text, ...a); }; } buildMap(); drawWorld(1000)');
  assert.ok(get(g, '__wrote').includes('龙宫'), 'on the gate’s plaque');
});

test('the crab general: his soldiers (兵), drilling in time, then counting them with you by tens to a hundred (百)', async () => {
  const g = game({palace: 1}, {pos: {place: 'palace', x: 6, y: 7, dir: 'down'}});
  assert.equal(get(g, 'NPCS.filter(n => n.drills).length'), 20, 'two rows of ten, drilling');
  g.run("countTens = async (who, keys) => { __tens = keys; }");
  await press(g, 6, 7, 'down');
  assert.deepEqual(said(g), ['crab: 他们是我的兵！', 'crab: 一百个兵！']);
  const told = notes(g);
  assert.ok(told.indexOf('card: 兵') >= 0 && told.indexOf('card: 兵') < told.indexOf('card: 百'), '兵, then 百');
  assert.deepEqual(get(g, '__tens.map(k => L[k].t.join(""))'), ['十！', '二十！', '三十！', '四十！', '五十！', '六十！', '七十！', '八十！', '九十！', '一百！']);
  assert.equal(p(g, 'palace'), 2);
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)').sort(), ['dragons', 'lobster'], 'the lobster next (and the pillars, still to look at)');
});

test('the counting card: a row of ten soldiers at a time, each ten said, till ten rows, a hundred, 百 the word being taught', async () => {
  const g = game({palace: 1});
  g.run("globalThis.__spoke = []; say = (t, end, who) => { __spoke.push(t); if (end) end(); }");
  let done = false;
  const p2 = Promise.resolve(g.run("countTens('crab', ['ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred'])")).then(() => { done = true; });
  await tick();
  const sheet = g.el('#sheet');
  for (let n = 1; n <= 10; n++){
    assert.equal(sheet.querySelectorAll('.tenrow').length, n, `${n} rows`);
    if (n === 10) assert.ok(sheet.querySelector('.teach'), '百, bold, as the word being taught');
    sheet.querySelector('[data-a=next]').click(); await tick();
  }
  await p2;
  assert.ok(done);
  assert.deepEqual(get(g, '__spoke'), ['十！', '二十！', '三十！', '四十！', '五十！', '六十！', '七十！', '八十！', '九十！', '一百！']);
});

test('the lobster beside the palace door (龙虾), and then the door opens; the palace drawn', async () => {
  const g = game({palace: 2}, {pos: {place: 'palace', x: 11, y: 6, dir: 'up'}});
  assert.equal(get(g, 'animalAt(11, 5).id'), 'lobster');
  await press(g, 11, 6, 'up');
  const told = notes(g);
  assert.ok(told.includes('card: 龙虾'));
  assert.ok(told.some(n => /the palace door is open now/.test(n)), 'the way in (step 7: tests/hall.test.js)');
  assert.equal(p(g, 'palace'), 3);
  for (const t of [0, 700, 1400]) g.run(`drawWorld(${t})`);
  g.run('S.clock.t = DAY_MS * .9; drawWorld(3000)');
});
