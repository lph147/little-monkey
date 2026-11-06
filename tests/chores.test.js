// The senior pupil's chores in the immortal's cave, after playing it (6 November 2026): filling his three buckets of water
// one at a time, it wasn't clear what to do, and the pool rested after each (as anything does once you've done it), so
// the next seemed not to come; and once you'd brought them, a new task said to go and see him, as you stood talking to
// him. Now at the pool, or a chopping block, you choose how many first, and they're filled, or chopped, one after another,
// counted aloud; and bringing him the water, he goes straight on to his next job.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水', '吃', '喝', '要', '我', '猴子', '河', '鱼', '羊', '朋友', '家', '有', '鸟', '小', '大',
  '谢谢', '再见', '木头', '一', '二', '三', '四', '人', '是', '不', '什么', '钱', '风', '歌', '洞', '门', '房子', '狗', '猫', '鸡', '牛', '船', '云', '鹤', '天',
  '师父', '名字', '叶子', '扫', '桶'];
const CAVE = {landed: 1, dressed: 2, back: 1, child: 3, years: 1, boat: 2, song: 1, chapter: 1, woodFetch: 4, sky: 1, door: 2, caveSeen: 1, teacher: 1, named: 1, spyGame: 1};
function game(area, pos, words = KNOWN){
  const w = Object.fromEntries(words.map(x => [x, {lv: 2, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, shells: 0, coins: 5, met: [], friends: [],
    areas: {1: {chapter: 1, raft: 3, done: true}, 2: {...CAVE, ...area}}, pos, w}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__heard = []; globalThis.__acts = []; globalThis.__asked = []");
  g.run("toast = t => { __notes.push(t); }; showNarration = async t => { __notes.push(t); }; showNotice = async w => { __notes.push('card: ' + w); setSeen(w); }; closeCard = () => {}");
  g.run("pictureQ = async o => { __asked.push(o.head.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); if (o.onAnswer) o.onAnswer(true, o.answerIdx); return true; }");
  g.run("showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('') + (o.noEn ? ' (no English)' : '')); }");
  g.run("say = w => { __heard.push(w); }; practiseFirst = async () => true");
  g.run(`{ const real = startAct; startAct = (kind, o = {}) => { const a = real(kind, o); __acts.push(kind); return a; }; }
    for (const k of ['splash', 'thwack', 'right']) SFX[k] = () => { __heard.push(k); };`);
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 2000 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const POOL = [21, 8, 'up'], BLOCK = [23, 13, 'up'], SENIOR = [17, 9, 'right'];

test('at the pool, you choose how many buckets of water first, and your monkey fills them one after another, counted aloud', async () => {
  const g = game({chores: 3, waterFetch: 1}, {place: 'cave', x: 21, y: 8, dir: 'up'});
  g.run("globalThis.__card = []; howManyCard = async (w, ask) => { __card.push(w, fill(ask)); return 3; }");
  assert.equal(get(g, 'tileAt(21, 7).look'), 'water', 'the pool in front of you');
  await press(g, ...POOL);
  assert.deepEqual(get(g, '__card'), ['水', 'How many 桶 (buckets) of 水 (water) do you want to fill?'], 'how many, on its card');
  assert.deepEqual(get(g, '__acts'), ['dip', 'dip', 'dip'], 'three buckets filled, one after another');
  assert.deepEqual(get(g, '__heard'), ['splash', '一', 'splash', '二', 'splash', 'right', '三'], 'counted aloud as each is filled');
  assert.deepEqual(get(g, 'here().carrying'), {word: '水', n: 3});
  assert.equal(get(g, '__notes').at(-1), '三 (three)! You’re carrying 3 buckets of 水 (water). Take them to the senior pupil.', 'and what to do with them');
  assert.equal(get(g, 'acting'), null);
});

test('at a chopping block, you choose how many logs first, and chop them one after another: a question and two blows each, counted', async () => {
  const g = game({chores: 5, axeFetch: 1}, {place: 'cave', x: 23, y: 13, dir: 'up'}, [...KNOWN, '斧头']);
  g.run("globalThis.__card = []; howManyCard = async (w, ask) => { __card.push(w, fill(ask)); return 4; }");
  assert.equal(get(g, 'tileAt(23, 12).look'), 'stump', 'the chopping block in front of you');
  await press(g, ...BLOCK);
  assert.deepEqual(get(g, '__card'), ['木头', 'How many pieces of 木头 (wood) do you want to chop?']);
  const asked = get(g, '__asked');
  assert.equal(asked.length, 4, 'a question a log');
  assert.ok(asked.every((h, i) => h.includes(`Chopping the wood (${i + 1} of 4)`)), `each saying which log it is (${asked[0]})`);
  assert.equal(get(g, '__heard').filter(h => h === 'thwack').length, 8, 'two blows of the axe a log');
  assert.deepEqual(get(g, '__heard').filter(h => /^[一二三四]$/.test(h)), ['一', '二', '三', '四'], 'counted aloud');
  assert.deepEqual(get(g, '__acts'), ['pick'], 'and the wood picked up once, at the end');
  assert.deepEqual(get(g, 'here().carrying'), {word: '木头', n: 4});
  assert.equal(get(g, '__notes').at(-1), '四 (four)! You’re carrying 4 pieces of 木头 (wood). Take them to the senior pupil.');
});

test('bringing him the water, he thanks you and goes straight on to his next job: you’re talking to him already, so never “go and see him”', async () => {
  const g = game({chores: 3, waterFetch: 1, carrying: {word: '水', n: 3}}, {place: 'cave', x: 17, y: 9, dir: 'right'}, [...KNOWN]);
  g.run('S.tasksSeen = Object.fromEntries(getTasks().map(t => [t.id, 1]))');
  await press(g, ...SENIOR);
  assert.deepEqual(get(g, '__said'), ['senior: 对！谢谢！', 'senior: 这是斧头。', 'senior: 我要四块木头。 (no English)'], 'his thanks, then the axe, and what he wants');
  assert.deepEqual([get(g, 'here().chores'), get(g, 'here().waterFetch'), get(g, 'here().axeFetch')], [5, 2, 1]);
  assert.ok(get(g, '__notes').includes('card: 斧头'), 'the axe’s card');
  const tasks = get(g, 'getTasks().map(t => t.id)');
  assert.ok(!tasks.includes('c1axe') && tasks.includes('c1chore'), `no task to go and see him; the one to bring him what he asks for (${tasks})`);
});

test('the wrong number of buckets: he says no, takes them, and asks again; you choose again at the pool', async () => {
  const g = game({chores: 3, waterFetch: 1, carrying: {word: '水', n: 2}}, {place: 'cave', x: 17, y: 9, dir: 'right'});
  await press(g, ...SENIOR);
  assert.deepEqual(get(g, '__said'), ['senior: 不对。', 'senior: 我要三桶水。 (no English)']);
  assert.ok(get(g, '__notes').some(n => /Listen again/.test(n)));
  assert.deepEqual([get(g, 'here().carrying || null'), get(g, 'here().chores'), get(g, 'here().waterFetch')], [null, 3, 1], 'still to do');
  g.run('__acts.length = 0; howManyCard = async () => 3');
  await press(g, ...POOL);
  assert.deepEqual(get(g, 'here().carrying'), {word: '水', n: 3}, 'three, this time');
});

test('if you practise first another time (Not now, before his next job), his task says to talk to him again, not to go and see him', async () => {
  const g = game({chores: 3, waterFetch: 1, carrying: {word: '水', n: 3}}, {place: 'cave', x: 17, y: 9, dir: 'right'});
  g.run('practiseFirst = async () => false');
  await press(g, ...SENIOR);
  assert.deepEqual(get(g, '__said'), ['senior: 对！谢谢！']);
  assert.equal(get(g, 'here().chores'), 4);
  const t = get(g, "(() => { const t = getTasks().find(t => t.id === 'c1axe'); return t && fill(t.text, false, true); })()");
  assert.equal(t, 'The senior pupil has one more job for you: talk to him again');
});
