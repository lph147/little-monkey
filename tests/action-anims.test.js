// Doing something, you see your monkey do it (decided 6 November 2026, after playing it: the heaps of leaves just vanished,
// and things turned up in your bag): it chops the wood, two blows of the axe; dips the bucket in the pool and lifts it
// out, full; reaches up into a tree as it shakes, the fruit dropping into its paw, or leans into the hive for its honey,
// and holds it up; crouches for a flower, a stone or water; heaves a sack of rice up over its head and throws it all the
// way onto the boat; and turns the key in a cage's lock, its door swinging open. (The broom: tests/cave-fixes.test.js;
// your poses: tests/poses.test.js.)
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 2000 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const AREA2_WORDS = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水', '吃', '喝', '要', '我', '猴子', '河', '鱼', '羊', '朋友', '家', '有', '鸟', '小', '大',
  '谢谢', '再见', '不客气', '木头', '三', '四', '人', '是', '不', '什么', '钱', '风', '歌', '洞', '门', '房子', '狗', '猫', '鸡', '牛', '船', '云', '鹤', '天', '王', '棍子',
  '师父', '名字', '叶子', '扫', '桶', '斧头', '饭'];
const AREA1_WORDS = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '水', '河', '鱼', '猴子', '朋友', '桥', '蝴蝶', '同学', '棍子', '蜜蜂', '蜂王',
  '有', '没有', '我', '要', '吃', '桌子', '家', '木头', '碗', '学校', '老师', '一', '二', '三', '四', '五', '六', '谢谢', '不客气', '没关系',
  '红色', '黄色', '白色', '黑色', '蓝色', '绿色'];
const IN_THE_CAVE = {landed: 1, dressed: 2, back: 1, child: 3, years: 1, boat: 2, song: 1, chapter: 1, woodFetch: 4, sky: 1, door: 2, teacher: 1, named: 1, spyGame: 1, chores: 2};
const HOME_TO_HAVOC = {...IN_THE_CAVE, chapter: 2, chores: 6, grown: 1, riddle: 3, tests: 1, fly: 1, pine: 1, sentHome: 1};
const BEES_HOME = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, shop: 3, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, bees: 7, beeFriends: 6, queenOut: true};
const SCHOOL_BUILT = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 2, wood: 'done', stones: 'done', school: 2, feast: 3, tableware: 0};
// A game (in area 1 or 2, with its progress, at pos), every question answered right, and what you do watched: each act
// as it starts (its kind, what it's with, how you reach, the square, where what you pick comes from, where you throw it,
// and the ground there then), and what you hear
function game(area, progress, pos, words){
  const w = Object.fromEntries(words.map(x => [x, {lv: 2, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 34, started: true, area, shells: 0, coins: 5, met: [], friends: [], bag: {},
    areas: area === 2 ? {1: {chapter: 1, raft: 3, done: true}, 2: progress} : {1: progress}, pos, w}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; toast = t => { __notes.push(t); }; showNarration = async t => { __notes.push(t); }");
  g.run("showNotice = async w => { __notes.push('card: ' + w); setSeen(w); }; showPicked = async f => { __notes.push('picked: ' + f.zh); }");
  g.run("pictureQ = async o => { if (o.onAnswer) o.onAnswer(true, o.answerIdx); return true; }; gapQ = async () => true; closeCard = () => {}");
  g.run("showDialog = async () => {}; replyWith = async () => true; practiseFirst = async () => true; storyScene = async () => {}; infoBox = async () => {}");
  g.run(`globalThis.__acts = []; globalThis.__heard = [];
    { const real = startAct; startAct = (kind, o = {}) => { const a = real(kind, o);
      __acts.push({kind, w: a.w || a.what, reach: a.reach, at: [a.x, a.y], from: a.from, to: a.to, ground: tileAt(a.x, a.y).look}); return a; }; }
    for (const k of ['swish', 'thwack', 'splash', 'bump', 'clack', 'creak', 'scuffle', 'right', 'sweep']) SFX[k] = () => { __heard.push(k); };`);
  g.run('placePlayer()');
  return g;
}
const heard = (g, k) => get(g, '__heard').filter(h => h === k).length;
const objectAt = (g, x, y) => get(g, `mapObjects().find(o => ${x} >= o.x && ${x} < o.x + o.w && ${y} >= o.y && ${y} < o.y + o.h) || null`);

test('chopping the wood: two blows of the axe on the block, chips flying; then you pick the wood up off it', async () => {
  const g = game(2, {...IN_THE_CAVE, chores: 5, axeFetch: 1}, {place: 'cave', x: 24, y: 12, dir: 'left'}, AREA2_WORDS);
  assert.equal(get(g, 'tileAt(23, 12).look'), 'stump', 'the chopping block in front of you');
  await press(g, 24, 12, 'left');
  assert.equal(heard(g, 'thwack'), 2, 'two blows');
  assert.equal(get(g, 'swing.with'), '斧头', 'of the axe');
  assert.ok(get(g, 'chips.length') > 0, 'chips flying');
  assert.deepEqual(get(g, '__acts').map(a => [a.kind, a.w, String(a.at)]), [['pick', '木头', '23,12']], 'then you pick up the wood');
  assert.deepEqual(get(g, 'here().carrying'), {word: '木头', n: 1});
  assert.equal(g.run('acting'), null, 'and done');
});

test('filling the bucket at the pool: into the water with a splash, and up again full, in your hands (nothing more to pick up)', async () => {
  const g = game(2, {...IN_THE_CAVE, chores: 3, waterFetch: 1}, {place: 'cave', x: 23, y: 8, dir: 'up'}, AREA2_WORDS);
  assert.equal(get(g, 'tileAt(23, 7).look'), 'water', 'the pool in front of you');
  await press(g, 23, 8, 'up');
  assert.deepEqual(get(g, '__acts').map(a => [a.kind, a.w]), [['dip', '水']], 'the bucket, in and out');
  assert.ok(get(g, "splashes.some(s => s.small && tileAt(Math.floor(s.x / 16), Math.floor(s.y / 16)).look === 'water' && s.y < 8 * 16)"), 'a little splash, in the pool, where the bucket goes in');
  assert.deepEqual(get(g, '__heard'), ['splash', 'right'], 'and the sound of having it, once');
  assert.deepEqual(get(g, 'here().carrying'), {word: '水', n: 1});
  assert.equal(g.run('acting'), null);
});

test('picking a peach: the tree shakes, the peach drops from its leaves into your hands, and you hold it up', async () => {
  const g = game(2, IN_THE_CAVE, {place: 'cave', x: 3, y: 8, dir: 'up'}, AREA2_WORDS);
  assert.equal(get(g, 'tileAt(3, 7).look'), 'rockPeach', 'the master’s peach tree');
  await press(g, 3, 8, 'up');
  const acts = get(g, '__acts'), o = objectAt(g, 3, 7);
  assert.deepEqual(acts.map(a => [a.kind, a.w, a.reach]), [['pick', '桃子', 'up']], 'reaching up into it');
  assert.ok(acts[0].from[1] < o.y * 16 && Math.abs(acts[0].from[0] - (o.x * 16 + o.w * 8)) <= 4, 'the peach comes from up in its leaves');
  assert.ok(get(g, `OBJECT_PIECES.find(p => p.key === objectKey(mapObjects().find(o => o.look === 'rockPeach'))).rustle`) > 0, 'the tree shakes');
  assert.equal(heard(g, 'scuffle'), 1);
  assert.equal(get(g, "S.bag['桃子']"), 1, 'in your bag');
  assert.ok(get(g, '__notes').some(n => /You pick a 桃子 \(peach\) for your bag \(1 of 3\)/.test(n)), 'and you’re told');
});

test('honey from the hive: you lean into it, your paws in it, with nothing to shake and no hop', async () => {
  const g = game(1, {...BEES_HOME, bees: 11, honey: 'done'}, {place: 'homeGround', x: 28, y: 5, dir: 'up'}, [...AREA1_WORDS, '蜂蜜']);
  assert.equal(get(g, 'tileAt(28, 4).look'), 'hive');
  await press(g, 28, 5, 'up');
  const [a] = get(g, '__acts'), o = objectAt(g, 28, 4);
  assert.deepEqual([a.kind, a.w, a.reach], ['pick', '蜂蜜', 'in']);
  const [x, y] = get(g, "poseSprite('pick', 'up', 'in').item").map((v, i) => v + [28, 5][i] * 16);
  assert.ok(x >= o.x * 16 && x < (o.x + o.w) * 16 && y >= o.y * 16 && y < (o.y + o.h) * 16, `the honey comes out of it, in your paws (${x}, ${y})`);
  assert.equal(heard(g, 'scuffle'), 0, 'a hive doesn’t shake');
  assert.equal(get(g, "S.bag['蜂蜜']"), 1);
});

test('a flower for the big monkey: you crouch for it, and its picture is the flower you picked; one of a colour you have already, and you don’t', async () => {
  const g = game(1, {...SCHOOL_BUILT, flowers: 'asked'}, {place: 'homeGround', x: 26, y: 3, dir: 'up'}, AREA1_WORDS);
  assert.equal(get(g, 'tileAt(26, 2).look'), 'redFlowers');
  await press(g, 26, 3, 'up');
  assert.deepEqual(get(g, '__acts').map(a => [a.kind, a.w, a.reach]), [['pick', '花', 'down']], 'crouching for it');
  assert.equal(get(g, 'acting'), null);
  assert.ok(get(g, '__notes').includes('picked: 红色 的 花'), 'then the card: a red flower');
  assert.deepEqual(get(g, 'here().picked.flowers'), ['红色']);
  assert.equal(get(g, `(() => { let pic; const real = startAct; startAct = (k, o) => { pic = o.pic; startAct = real; return real(k, o); };
    gather(tileAt(26, 2), 26, 2); return pic ?? null; })()`), null, 'another red one: not picked');
  g.run('acting = null');
  assert.match(get(g, '__notes').slice(-1)[0], /You have a red 花 \(flower\) already/);
});

test('water for the thirsty monkey: you crouch at the river’s edge and scoop it up, with a splash where your paws go in', async () => {
  const g = game(1, {chapter: 0, elder: 2, thirsty: 'asked'}, {place: 'meadow', x: 17, y: 1, dir: 'right'}, AREA1_WORDS);
  assert.equal(get(g, 'tileAt(18, 1).look'), 'water', 'the river in front of you');
  await press(g, 17, 1, 'right');
  assert.deepEqual(get(g, '__acts').map(a => [a.kind, a.w, a.reach]), [['pick', '水', 'down']], 'crouching for it');
  assert.ok(get(g, "splashes.some(s => s.small && tileAt(Math.floor(s.x / 16), Math.floor(s.y / 16)).look === 'water')"), 'a little splash, in the river');
  assert.equal(heard(g, 'splash'), 1);
  assert.equal(get(g, 'here().holding.thirsty'), '水', 'and you have it');
});

test('a small stone in the pine wood: it’s gone from the ground as you crouch and pick it up', async () => {
  const g = game(1, {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
    build: 1, wood: 'asked', stones: 'asked', woodIn: 1}, {place: 'pineWood', x: 16, y: 26, dir: 'up'}, AREA1_WORDS);
  const [sx, sy, dir, x, y] = get(g, `(() => { for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (tileAt(x, y).look === 'pebble')
    for (const [dx, dy, d] of [[0, 1, 'up'], [1, 0, 'left'], [-1, 0, 'right'], [0, -1, 'down']]) if (walkable(x + dx, y + dy)) return [x + dx, y + dy, d, x, y]; })()`);
  await press(g, sx, sy, dir);
  const acts = get(g, '__acts');
  assert.deepEqual(acts.map(a => [a.kind, a.w, a.reach, String(a.at)]), [['pick', '石头', 'down', `${x},${y}`]], 'picking it up');
  assert.notEqual(acts[0].ground, 'pebble', 'off the ground: it isn’t still lying there');
  assert.equal(get(g, 'here().picked.stones.length'), 1, 'one stone');
});

test('a sack of rice: heaved up off the pile, over your head, and thrown in a high arc all the way down onto the boat', async () => {
  const g = game(2, {child: 3, dressed: 2, landed: 1, back: 1, years: 1, cargo: 1}, {place: 'harbour', x: 8, y: 5, dir: 'up'}, AREA2_WORDS);
  assert.equal(get(g, 'tileAt(8, 4).look'), 'sacks', 'the sacks in front of you');
  g.run("globalThis.__turned = []; SFX.swish = () => { __turned.push(pl.dir); }");
  await press(g, 8, 5, 'up');
  const [a] = get(g, '__acts');
  assert.deepEqual([a.kind, a.w, a.to], ['lift', 'sack', [19, 15]], 'heaving one up, to throw onto the boat');
  assert.notEqual(a.ground, 'sacks', 'one fewer on the pile as you lift it');
  assert.deepEqual(get(g, '__turned'), ['right'], 'turning to the boat to throw it');
  assert.equal(get(g, 'pl.dir'), 'up', 'and back again');
  assert.equal(heard(g, 'bump'), 2, 'up it goes, and down it lands');
  assert.equal(g.run('counter("cargoCarried")'), 1, 'one on the boat');
  const path = get(g, '[...Array(51).keys()].map(i => tossedTo({to: [19, 15]}, LIFT.toss + i * (LIFT.ms - LIFT.toss) / 50))');
  assert.deepEqual(path[0], [8 * 16 + 3, 5 * 16 - 10], 'from over your head');
  assert.deepEqual(path[50], [19 * 16 + 3, 15 * 16 + 2], 'onto the boat');
  const top = Math.min(...path.map(([, y]) => y));
  assert.ok(Math.abs(top - (5 * 16 - 10 - get(g, 'LIFT.rise'))) <= 1, `up first, its top LIFT.rise above where it began (${top.toFixed(1)})`);
  assert.ok(path.every(([x], i) => i === 0 || x > path[i - 1][0]), 'and on, all the way, towards the boat');
});

test('opening a cage: the key in the lock and turned, click, and the door creaks open, then the little monkey jumps out', async () => {
  const w = [...AREA2_WORDS, '回家', '妖怪', '火', '救命', '笼子', '钥匙'];
  const g = game(2, {...HOME_TO_HAVOC, news: 1, d3: 1, north: 1, key: 1}, {place: 'lair', x: 6, y: 6, dir: 'up'}, w);
  assert.equal(get(g, 'tileAt(6, 5).look'), 'cage', 'a locked cage in front of you');
  g.run("{ const real = STEPS.set; STEPS.set = s => { __heard.push('set'); return real(s); }; }");
  await press(g, 6, 6, 'up');
  assert.deepEqual(get(g, '__acts').map(a => [a.kind, a.w, String(a.at)]), [['unlock', '钥匙', '6,5']]);
  const h = get(g, '__heard');
  assert.ok(h.indexOf('clack') >= 0 && h.indexOf('clack') < h.indexOf('creak') && h.indexOf('creak') < h.indexOf('set'), `click, creak, then it’s open (${h})`);
  assert.equal(get(g, 'here().freed2'), 1);
  assert.equal(get(g, 'tileAt(6, 5).look'), 'cageOpen');
});

test('what each looks like as you do it: the bucket, full; the sack over your head; the key, turned; the door, swinging; the axe’s head; crouching', () => {
  const g = game(2, IN_THE_CAVE, {place: 'cave', x: 12, y: 9, dir: 'down'}, AREA2_WORDS);
  const PX = 64, PY = 64;
  const drawn = code => get(g, `(() => { const out = [];
    b.fillRect = function(x, y, w, h){ out.push(['rect', this.fillStyle, x, y, w, h]); };
    b.drawImage = function(img, x, y, w, h){ out.push(['image', img === SACK_HELD ? 'sack' : '', x, y, w ?? null, h ?? null]); };
    ${code}; return out; })()`);
  const colours = out => out.filter(([k]) => k === 'rect').map(([, c]) => c);
  // the bucket: in the water, ripples round it; then out, full
  const act = (kind, more = '') => `({kind: '${kind}', t0: 0, x: 12, y: 10, dir: 'down'${more}})`;
  assert.ok(colours(drawn(`ACTS.dip(${PX}, ${PY}, DIP.down + 60, ${act('dip')})`)).includes('#BFE8FA'), 'in the water, ripples round it');
  assert.ok(colours(drawn(`ACTS.dip(${PX}, ${PY}, DIP.up + 60, ${act('dip')})`)).includes('#7FC4EE'), 'out again, full of water');
  // the sack, over your head
  const sack = drawn(`ACTS.lift(${PX}, ${PY}, LIFT.up + 120, ${act('lift', ", to: [19, 15]")})`).filter(([k, what]) => k === 'image' && what === 'sack');
  assert.equal(sack.length, 1, 'the sack, as on the pile');
  assert.ok(sack[0][3] < PY - 8, 'held up over your head');
  // the key: going in, flat; then turned, upright; the lock off and the door swinging open, to the left
  const key = t => drawn(`ACTS.unlock(${PX}, ${PY}, ${t}, ${act('unlock')})`).filter(([k, c]) => k === 'rect' && c === '#E8C040').map(([, , , , w, h]) => [w, h]);
  assert.deepEqual(key(300), [[4, 1]], 'the key, going in');
  assert.deepEqual(key(500), [[1, 4]], 'turned');
  const bars = t => drawn(`ACTS.unlock(${PX}, ${PY}, ${t}, ${act('unlock')})`).filter(([k, c, , , w, h]) => k === 'rect' && c === '#9A6A3A' && w === 1 && h >= 10)
    .map(([, , x]) => x - (12 * 16 - (get(g, 'pl.px') - PX))).sort((p, q) => p - q);
  assert.deepEqual(bars(0), [1, 4, 7, 10, 14], 'shut: its door’s three bars between its sides');
  assert.deepEqual(bars(get(g, 'UNLOCK.opened')), [-2, 1, 1, 4, 14], 'open: swung away to the left');
  // the axe: raised over your head, then down, its steel head with its bright edge on the block in front of you, whichever
  // way you face (the chop pose: js/poses.js)
  const inFront = {down: ([x, y]) => y >= 32, up: ([x, y]) => y < 16, right: ([x, y]) => x >= 32, left: ([x, y]) => x < 16};
  for (const dir of ['down', 'up', 'right', 'left']){
    const where = (m, letters) => get(g, `POSES.grid('chop', '${dir}', '${m}').rows`).flatMap((r, y) => [...r].map((c, x) => letters.includes(c) ? [x, y] : null)).filter(Boolean);
    const head = where('down', 'uU');
    assert.ok(head.length >= 8 && where('down', 'U').length >= 2, `${dir}: the axe's head, its edge bright`);
    const mid = head.reduce(([a, b], [x, y]) => [a + x / head.length, b + y / head.length], [0, 0]);
    assert.ok(inFront[dir](mid), `${dir}: down on the block in front of you (${mid.map(v => v.toFixed(1))})`);
    assert.ok(where('up', 'h').length >= 1 && where('down', 'h').length >= 1, `${dir}: in your paws`);   // (from the side, your near paw over the other)
  }
  // your stick: raised over your head, then down (the swing pose), a swoosh from the side as it strikes
  const swung = t => drawn(`drawSwing('player', 'right', ${PX}, ${PY}, 0, ${t})`);
  assert.deepEqual(swung('SWING_MS * .2').filter(([k]) => k === 'image').map(([, , x, y, w]) => [x, y, w]), [[PX - 16, PY - 16, null]], 'you, swinging it');
  assert.equal(colours(swung('SWING_MS * .2')).filter(c => c === '#FFFFFF').length, 0, 'no swoosh while it’s raised');
  assert.equal(colours(swung('SWING_MS * (SWING_CONTACT + .1)')).filter(c => c === '#FFFFFF').length, 8, 'a swoosh as it comes down');
  // crouching for something: the stone on the ground in front of you, then you over it, your paws on it (the pick pose:
  // js/poses.js); then holding it up over your head
  const pick = t => drawn(`ACTS.pick(${PX}, ${PY}, ${t}, ${act('pick', ", w: '石头', reach: 'down'")})`).filter(([k]) => k === 'image').map(([, , x, y, w]) => [x, y, w]);
  const [ix, iy] = get(g, "poseSprite('pick', 'down', 'down').item"), [hx, hy] = get(g, "poseSprite('pick', 'down', 'hold').item");
  assert.deepEqual(pick(60), [[PX + ix - 5, PY + iy - 5, 10], [PX - 16, PY - 16, null]], 'the stone in front of you, and you crouching over it');
  assert.deepEqual(pick('PICK.caught + 30'), [[PX - 16, PY - 16, null], [PX + hx - 5, PY + hy - 5, 10]], 'then you, holding it up');
  assert.ok(hy - 5 < 0, 'over your head');
});
