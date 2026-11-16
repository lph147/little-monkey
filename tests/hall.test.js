// Area 3, the Eastern Sea, step 7 (16 November 2026): the throne hall. Through the palace door once the lobster is your
// friend; the Dragon King comes to meet you (欢迎！欢迎！), in his own voice, as the Dragon Queen has hers; the pillars (柱子);
// his weapons, each weighed on the palace's great scale and lifted, all too light: the broadsword (太重了！ 重; 八百斤 斤;
// 太轻了！ 轻), the fork you weigh yourself, big weights first (三千六百斤: 千), and the halberd (这个多少斤？ 多少).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '水', '草', '鱼', '海', '海龟', '马', '虾', '王', '门', '刀', '猴子', '钱', '地图', '妖怪', '动物', '朋友', '我', '是', '要', '什么', '看', '没有',
  '一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十', '泡泡', '沙子', '贝壳', '水草', '游', '海星', '几', '鲸鱼', '光', '龙', '兵', '百', '龙虾'];
const PALACE_DONE = {chapter: 0, landed: 1, part: 4, weapon: '刀', turtle: 3, starFriends: 5, forest: 1, octopus: 1, dolphin: 2, trench: 2, palace: 3};
function game(area = {}, {pos = {place: 'hall', x: 8, y: 10, dir: 'up'}} = {}){
  const g = loadGame({dom: true, save: {version: 42, started: true, area: 3, shells: 7, coins: 9, met: ['starfish', 'octopus', 'seahorse', 'whale', 'lobster'], friends: ['starfish', 'octopus', 'seahorse', 'whale', 'lobster'],
    w: Object.fromEntries(KNOWN.map(x => [x, {lv: 2, ok: 2}])), areas: {1: {chapter: 1, raft: 3, done: true}, 2: {ch2: 1}, 3: {...PALACE_DONE, ...area}}, pos}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__weighed = []; globalThis.__heaved = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }");
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 4000 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const p = (g, k) => get(g, `here().${k}`);

test('the palace door opens once the lobster is your friend: face it and press A; the lobster waits beside it', () => {
  const before = game({palace: 2}, {pos: {place: 'palace', x: 12, y: 5, dir: 'up'}});
  const way = 'PLACES.palace.exits.find(e => e.to === "hall")';
  assert.equal(before.run(`isOpen(${way})`), false);
  const g = game({}, {pos: {place: 'palace', x: 12, y: 5, dir: 'up'}});
  assert.deepEqual(get(g, `[isOpen(${way}), ${way}.by]`), [true, 'A']);
  assert.equal(get(g, 'animalAt(11, 5).id'), 'lobster', 'beside the door, out of the way');
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)'), ['toHall']);
  assert.equal(get(g, 'PLACES.hall.name.zh'), '水晶宫');
});

test('into the throne hall: the Dragon King comes to meet you, 欢迎！欢迎！, and you ask for a weapon (Part 6)', async () => {
  const g = game({part: 4});
  await play(g, 'runEvents()');
  assert.deepEqual(said(g), ['dragonKing: 欢迎！欢迎！', 'dragonKing: 你要什么？', 'player: 我要刀！']);
  assert.ok(notes(g).some(n => n === 'card: 欢迎'));
  assert.equal(get(g, 'WORDS["欢迎"].phrase'), true);
  assert.equal(p(g, 'hall'), 1);
  const king = get(g, '(() => { const n = NPCS.find(n => n.id === "dragonKing"); return [n.x, n.y]; })()');
  assert.equal(Math.abs(king[0] - 8) + Math.abs(king[1] - 10), 1, 'he came all the way to you');
  g.run('placeCharacters()');
  assert.deepEqual(get(g, '(() => { const n = NPCS.find(n => n.id === "dragonKing"); return [n.x, n.y]; })()'), king, 'and stays where he met you');
  assert.deepEqual(get(g, '[VOICE_OF.dragonKing, VOICE_OF.dragonQueen]'), ['yunyang', 'xiaohan'], 'the new voices');
});

test('the throne hall’s pillars (柱子)', async () => {
  const g = game({hall: 1});
  assert.deepEqual(get(g, 'SPARKLES.filter(sparkling).map(s => s.word)'), ['柱子']);
  await press(g, 4, 3, 'left');
  assert.ok(notes(g).includes('card: 柱子'));
});

test('the Dragon King’s weapons: too heavy for his soldiers, weighed, lifted, too light for you; one word at a time', async () => {
  const g = game({hall: 1}, {pos: {place: 'hall', x: 8, y: 5, dir: 'up'}});
  g.run("weighCard = async id => { __weighed.push(id); }; pickUpAct = async w => { __heaved.push(w); }");
  g.run('NPCS.find(n => n.id === "dragonKing").y = 4');
  await press(g, 8, 5, 'up');
  assert.deepEqual(said(g), ['carrier1: 太重了！', 'player: 太轻了！', 'dragonKing: 你看这个！', 'player: 太轻了！', 'dragonKing: 这个多少斤？', 'player: 太轻了！', 'dragonKing: 没有了。']);
  const cards = notes(g).filter(n => /^card:/.test(n));
  assert.deepEqual(cards, ['card: 重', 'card: 斤', 'card: 轻', 'card: 千', 'card: 多少']);
  assert.deepEqual(get(g, '__weighed'), ['broadsword', 'fork', 'halberd']);
  assert.deepEqual(get(g, '__heaved'), ['broadsword', 'fork', 'halberd'], 'each lifted, as you see your monkey do it');
  assert.deepEqual(get(g, '[pl.x, pl.y, pl.dir]'), [13, 9, 'up'], 'led to the great scale');
  assert.equal(p(g, 'hall'), 2);
});

test('the weighing card: big weights first, each total said as it grows, till it balances; then Lift it', async () => {
  const g = game({hall: 1});
  g.run("globalThis.__spoke = []; say = (t, end, who) => { __spoke.push(t); if (end) end(); }");
  const sheet = g.el('#sheet');
  let done = false;
  const pr = Promise.resolve(g.run("weighCard('fork', 'dragonKing')")).then(() => { done = true; });
  await tick();
  assert.equal(sheet.querySelector('[data-a=small]').disabled, true, 'small weights wait till no big one fits');
  assert.equal(sheet.querySelector('[data-a=lift]').disabled, true, 'not balanced yet');
  for (let i = 0; i < 9; i++){ sheet.querySelector('.btn.primary').click(); await tick(); }   // (A: whichever weight is next)
  assert.deepEqual(get(g, '__spoke'), ['一千！', '两千！', '三千！', '三千一百！', '三千二百！', '三千三百！', '三千四百！', '三千五百！', '三千六百斤！']);
  assert.match(sheet.querySelector('.wnum').textContent, /3,600 jin: it balances!/);
  sheet.querySelector('[data-a=lift]').click(); await pr;
  assert.ok(done);
  g.run('__spoke.length = 0');
  const pr2 = Promise.resolve(g.run("weighCard('halberd', 'dragonKing')"));
  await tick();
  for (let i = 0; i < 9; i++){ sheet.querySelector('.btn.primary').click(); await tick(); }
  assert.equal(get(g, '__spoke.at(-1)'), '七千二百斤！');
  sheet.querySelector('[data-a=lift]').click(); await pr2;
  g.run('__spoke.length = 0');
  const pr3 = Promise.resolve(g.run("weighCard('broadsword', 'dragonKing')"));
  await tick();
  assert.deepEqual(get(g, '__spoke'), ['八百斤！'], 'the broadsword, weighed already');
  assert.equal(sheet.querySelector('[data-a=big]'), null, 'no weights to put on');
  sheet.querySelector('[data-a=lift]').click(); await pr3;
});

test('几 or 多少?, side by side; and the throne hall drawn', () => {
  const g = game({hall: 2});
  assert.ok(get(g, 'SIDE_BY_SIDE.some(s => s.words.join() === "几,多少")'));
  for (const t of [0, 900]) g.run(`drawWorld(${t})`);
  g.run('S.clock.t = DAY_MS * .9; drawWorld(3000)');
  assert.equal(get(g, 'MAP_SPRITES["龙王"].rows.length'), 22);
  assert.equal(g.run('typeof LIFTED.halberd'), 'function');
});
