// The end of chapter 1 (decided 29 October 2026). With the shrimp on the feast's table, the hungry monkey wants a crab
// (我要吃螃蟹！, 螃蟹 just for listening), and the troop clears the bushes at the bottom of the meadow: a path down beside the
// river to the shore (海边), where it runs into the sea (海, as you first see it: 海很大！). Crabs scuttle about on the
// sand, only sideways: come up beside one and it runs, so you catch one from in front or behind (a question on a word you
// know, as in reeling in a fish; wrong, and it pinches you and gets away). He takes it (这是螃蟹), on a stone table of its
// own. With every food on the tables, the teacher has an exam for you (我们考试吧！): 30 words, 24 right first time to
// pass, and a certificate on the classroom wall. Then the feast, told like the opening (快乐), and the big monkey: 我们来做
// 木筏吧！ The old, big and little monkeys follow you down to the shore, where the troop builds your raft (木筏) and says
// goodbye; A at it sails away, and chapter 1 is complete.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const SHRIMP_IN = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, shop: 3, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  homeName: 2, count: 3, home: 2, build: 2, wood: 'done', stones: 'done', woodIn: 1, school: 2, feast: 3, bees: 11, beeFriends: 6, queenOut: true, honey: 'done',
  bowls: 'done', tableware: 2, cow: 9, cowSeen: 1, cowWolf: 1, milk: 'done', milkTable: 3, dairy: 5, spoons: 2, garden: 1, melonSeeds: 'done', grapeSeeds: 'done',
  bananaSeeds: 'done', springsSeen: 1, melonPlanted: 4, grapePlanted: 4, bananaPlanted: 4, fruitTable: 1, fish: 'done', fishing: 1, fishTable: 1, shrimp: 'done', shrimpTable: 1};
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '水果', '桃子', '苹果', '动物', '兔子', '水', '吃', '喝', '要', '我', '猴子', '老板', '河', '鱼', '头带', '瀑布', '羊',
  '松鼠', '山羊', '朋友', '洞', '跳', '床', '碗', '桌子', '家', '王', '一', '二', '三', '木头', '学校', '老师', '同学', '四', '五', '六', '七', '八', '九', '十', '红色', '黄色',
  '白色', '有', '没关系', '没有', '筷子', '蝴蝶', '蜜蜂', '蜂王', '蜂蜜', '牛', '牛奶', '酸奶', '奶酪', '勺子', '鸟', '蓝色', '黑色', '种子', '香蕉', '西瓜', '葡萄', '鱼竿',
  '小', '大', '鱼饵', '虾', '谢谢', '不客气', '再见'];
// A game with the shrimp on the feast's table (area: more progress; more: more of the save), standing at pos
function game(pos, area = {}, more = {}){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, met: ['rabbit', 'sheep', 'squirrel', 'goat', 'bee'], friends: ['rabbit', 'bee', 'queen', 'cow'],
    shells: 6, areas: {1: {...SHRIMP_IN, ...area}}, pos, ...more, w: {...w, ...more.w}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__sounds = []; globalThis.__scenes = []; globalThis.__right = true; globalThis.__asked = 0");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w + (o.quiet ? ', quiet' : ', said')); rec(w).lv = Math.max(rec(w).lv || 0, 1); }");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + who + ' ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }; pictureQ = async () => { __asked++; return __right; }; closeCard = () => {}");
  g.run("storyScene = async id => { __scenes.push(id); }");   // (the scenes play by themselves, with their pictures: the gallery shows them)
  g.run("for (const k of ['fanfare', 'wrong', 'tock', 'right', 'bump', 'chime']) SFX[k] = () => { __sounds.push(k); }");
  g.run("globalThis.__said = []; showDialog = async (who, line) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");   // (who says what)
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; gapQ = async o => { __said.push('gap: ' + o.t.join('') + ' (' + o.gap + ')'); return true; }");
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code, click = null){   // runs code in the game and waits for it, letting its timers run (click: a button to press on any card it opens)
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){
    await tick(); g.flush();
    if (click && g.run(`!modal.hidden && !!sheet.querySelector('${click}')`)) g.run(`sheet.querySelector('${click}').click()`);
  }
  await p;
}
const face = (g, x, y, dir) => g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`);
const press = (g, x, y, dir, click) => { face(g, x, y, dir); return play(g, 'interact(...facing()).then(runEvents)', click); };
const goTo = (g, place, x, y, dir) => g.run(`S.pos = {place: '${place}', x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`);
const bubble = (g, id) => g.run(`(AREA.bubbles['${id}'].find(b => matches(b.if)) || {show: null}).show`);
const item = (g, re) => get(g, `(areaChecklist().find(([t]) => ${re}.test(t)) || []).slice(0, 2)`);
const npc = (g, id) => get(g, `(n => n && [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === '${id}'))`);
const crab = (g, id) => get(g, `(n => [n.x, n.y])(NPCS.find(n => n.id === '${id}'))`);
const putCrab = (g, id, x, y) => g.run(`(n => { n.x = ${x}; n.y = ${y}; n.mv = null; n.wander = 0; })(NPCS.find(n => n.id === '${id}'))`);

test('with the shrimp on the table, the hungry monkey wants a crab: 我要吃螃蟹！, and the troop clears the way down from the meadow to the shore', async () => {
  const g = game({place: 'homeGround', x: 20, y: 7, dir: 'left'}, {crab: 'not asked'});
  assert.equal(bubble(g, 'hungry'), '!', 'a ! over him');
  goTo(g, 'meadow', 17, 20, 'down');
  assert.equal(g.run('tileAt(17, 21).look'), 'bush', 'thick bushes at the bottom of the meadow, till then');
  await play(g, 'arrive(17, 21).then(runEvents)');
  assert.equal(g.run('PLACE'), 'meadow', 'you can’t get through them');
  goTo(g, 'homeGround', 20, 7, 'left');
  await press(g, 20, 7, 'left');
  assert.ok(get(g, '__said').includes('hungry: 我要吃螃蟹！'), 'I want to eat crab!');
  assert.equal(get(g, 'here().crab'), 'asked');
  assert.equal(get(g, "lvl('螃蟹')"), 0, '螃蟹: just for listening, till you catch one');
  assert.match(get(g, '__notes').join(' '), /The troop has cleared a way down\./);
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Catch a crab on the shore, below the meadow: come at one from the front or behind'], 'crab: just its English, till you catch one');
  assert.deepEqual(item(g, /crab/), ['Catch a crab for the feast', false]);
  goTo(g, 'meadow', 17, 20, 'down');
  assert.equal(g.run('tileAt(17, 21).look'), 'path', 'the bushes are cleared: a path down beside the river');
  g.run('__notes.length = 0; __said.length = 0');
  await play(g, 'arrive(17, 21).then(runEvents)');
  assert.equal(g.run('PLACE'), 'shore', 'down on the shore (海边)');
  assert.deepEqual(get(g, '[S.pos.x, S.pos.y]'), [18, 1]);
  assert.deepEqual(get(g, 'PLACES.shore.name'), {zh: '海边', py: 'hǎibiān', en: 'The shore'});
  assert.equal(get(g, '__notes')[0], 'card: 海, said', 'the sea (海): you found it, so it’s said straight away');
  assert.deepEqual(get(g, '__said'), ['player: 海很大！'], 'the sea is so big!');
  assert.match(get(g, '__notes').join(' '), /A crab can only walk sideways: come at one from the front or behind to catch it!/);
  assert.equal(get(g, 'here().seaSeen'), 1, 'only the first time');
  assert.equal(g.run('tileAt(10, 15).word'), '海', 'A at the sea: 海');
  assert.deepEqual(get(g, "ALL_NPCS.filter(n => n.scuttles).map(n => [n.id, n.place, tileAt(n.x, n.y).look])"),
    [['crab1', 'shore', 'sand'], ['crab2', 'shore', 'sand'], ['crab3', 'shore', 'sand']], 'three crabs on the sand');
  goTo(g, 'shore', 18, 1, 'up');
  await play(g, 'arrive(18, 0).then(runEvents)');
  assert.equal(g.run('PLACE'), 'meadow', 'and back up to the meadow');
});

test('a crab scuttles sideways, away from you as you come up beside it, but never from in front or behind; and only over the sand', async () => {
  const g = game({place: 'shore', x: 7, y: 7, dir: 'down'}, {crab: 'asked', seaSeen: 1});
  for (const id of ['crab2', 'crab3']) putCrab(g, id, 25, id === 'crab2' ? 6 : 11);   // (out of the way)
  putCrab(g, 'crab1', 7, 9);
  face(g, 5, 9, 'right');
  g.run('scuttle(1e9)');
  assert.deepEqual(crab(g, 'crab1'), [8, 9], 'beside it, two squares off: it scuttles a square away');
  assert.ok(get(g, "NPCS.find(n => n.id === 'crab1').mv.dur") > 0, 'scuttling, not jumping');
  g.run("NPCS.find(n => n.id === 'crab1').wander = Infinity; scuttle(2e9)");
  assert.deepEqual(crab(g, 'crab1'), [8, 9], 'a square at a time: three away, out of reach, it stays');
  face(g, 8, 8, 'down'); g.run("NPCS.find(n => n.id === 'crab1').wander = 0");
  for (let i = 0; i < 20; i++) g.run(`scuttle(3e9 + ${i} * 1e7)`);
  assert.deepEqual(crab(g, 'crab1'), [8, 9], 'from in front, it can’t run: it stays put for you to catch');
  face(g, 2, 2, 'down');
  g.run('Math.random = () => 0');
  for (let i = 0; i < 40; i++) g.run(`scuttle(4e9 + ${i} * 1e7)`);
  assert.deepEqual(crab(g, 'crab1'), [1, 9], 'on its own, it wanders, sideways, as far as the sand goes');
  assert.notEqual(g.run('tileAt(0, 9).look'), 'sand', '(not off it)');
  await play(g, 'runEvents()');
  assert.deepEqual(crab(g, 'crab1'), [1, 9], 'it stays where it has scuttled to');
  putCrab(g, 'crab1', 18, 9);
  face(g, 17, 9, 'right');
  g.run('scuttle(5e9)');
  assert.deepEqual(crab(g, 'crab1'), [18, 9], 'never into the river (cornered against it, you can catch it from beside)');
  g.run("busy = true");
  putCrab(g, 'crab1', 8, 9); face(g, 7, 9, 'right');
  g.run('scuttle(6e9)');
  assert.deepEqual(crab(g, 'crab1'), [8, 9], 'and not while you’re busy (talking, say)');
});

test('A at a crab from in front picks it up: a question on a word you know, then 螃蟹, said straight away; wrong, and it pinches you and scuttles off', async () => {
  const g = game({place: 'shore', x: 7, y: 9, dir: 'down'}, {crab: 'asked', seaSeen: 1});
  putCrab(g, 'crab1', 7, 10);
  assert.equal(g.run('promptFor(7, 10)'), 'Catch');
  g.run('__right = false');
  await press(g, 7, 9, 'down');
  assert.equal(get(g, '__asked'), 1, 'one question, as in reeling in a little fish');
  assert.deepEqual(get(g, '__sounds'), ['wrong']);
  assert.match(get(g, '__notes').join(' '), /Ouch! The crab pinched you, and scuttled off\. Try another: come at it from the front or behind\./);
  assert.equal(get(g, "lvl('螃蟹')"), 0, 'it got away: no 螃蟹 yet');
  assert.equal(get(g, 'here().holding.crab || null'), null);
  const [x, y] = crab(g, 'crab1');
  assert.ok(Math.abs(x - 7) + Math.abs(y - 9) >= 5 && g.run(`tileAt(${x}, ${y}).look`) === 'sand', 'off to somewhere else on the sand, well away from you');
  g.run('__notes.length = 0; __right = true; finishedAt = null');
  putCrab(g, 'crab1', 7, 8);
  await press(g, 7, 9, 'up');
  assert.equal(get(g, '__asked'), 2, 'from behind, too');
  assert.equal(get(g, '__notes')[0], 'card: 螃蟹, said', 'a crab (螃蟹): you met it, so it’s said straight away');
  assert.equal(get(g, 'here().holding.crab'), '螃蟹');
  assert.match(get(g, '__notes').join(' '), /You caught a 螃蟹 \(crab\)! Take it to the hungry monkey, at the feast’s tables\./);
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Take the 螃蟹 (crab) to the hungry monkey']);
  assert.equal(bubble(g, 'hungry'), '?');
});

test('the hungry monkey takes the crab (这是螃蟹), on a stone table of its own; then each crab asks which it is, and you let it go', async () => {
  const g = game({place: 'homeGround', x: 20, y: 8, dir: 'up'}, {crab: 'asked', seaSeen: 1, holding: {crab: '螃蟹'}}, {w: {'螃蟹': {lv: 1, ok: 0}, '海': {lv: 1, ok: 0}}});
  assert.equal(g.run('tileAt(15, 7).look'), 'grass', 'its table’s spot: grass, till then');
  const shells = g.run('S.shells');
  await press(g, 20, 7, 'left');
  assert.deepEqual(get(g, '__said'), ['hungry: 螃蟹！太好了！', 'gap: 这是螃蟹 (螃蟹)', 'hungry: 谢谢你！', 'player: 不客气', 'hungry: 我们有螃蟹了！'],
    'A crab! Wonderful!, your gap to fill, his thanks, your reply, and: we have crab now!');
  assert.deepEqual(get(g, '[here().crab, here().crabTable, here().holding.crab || null]'), ['done', 1, null]);
  assert.equal(g.run('S.shells'), shells + 3);
  assert.equal(g.run('tileAt(15, 7).look'), 'crabTable', 'a stone table of its own, between the fruit and the big table');
  assert.ok(get(g, "mapObjects().some(o => o.look === 'crabTable' && o.x === 15 && o.y === 7)"), 'one big object');
  assert.equal(g.run('OBJECT_STAGES.crabTable'), 2, 'set up in two pieces: its stone, then the crab on a plate');
  assert.match(get(g, '__notes').join(' '), /A big red 螃蟹 \(crab\) on a plate, for the feast!/);
  assert.deepEqual(item(g, /crab/), ['Catch a 螃蟹 (crab) for the feast', true]);
  assert.deepEqual(get(g, "AREA.feastList.foods.filter(f => f.word === '螃蟹').map(f => [matches(f.show), matches(f.have), f.yes.zh])"), [[true, true, '我们 有 螃蟹 。']], 'ticked on the feast’s list');
  g.run('__said.length = 0; __notes.length = 0');
  goTo(g, 'shore', 7, 9, 'down');
  putCrab(g, 'crab1', 7, 10);
  await press(g, 7, 9, 'down');
  assert.deepEqual(get(g, '__said'), ['gap: 这是螃蟹 (螃蟹)'], 'after that, which is it? 这是螃蟹');
  assert.match(get(g, '__notes').join(' '), /You let the 螃蟹 \(crab\) go, and it scuttles off\./);
  assert.notDeepEqual(crab(g, 'crab1'), [7, 10]);
});

test('A at a crab before you’re asked for one just meets it (螃蟹), and lets it go', async () => {
  const g = game({place: 'shore', x: 7, y: 9, dir: 'down'}, {crab: 'not asked', seaSeen: 1});
  putCrab(g, 'crab1', 7, 10);
  await press(g, 7, 9, 'down');
  assert.equal(get(g, '__notes')[0], 'card: 螃蟹, said');
  assert.equal(get(g, 'here().holding.crab || null'), null, 'not for the feast yet');
  assert.match(get(g, '__notes').join(' '), /You let the 螃蟹 \(crab\) go, and it scuttles off\./);
});

test('with every food on the tables, the teacher has an exam for you (我们考试吧！): 30 words, 24 right first time to pass; a certificate on the wall', async () => {
  const g = game({place: 'school', x: 7, y: 3, dir: 'up'}, {crab: 'done', crabTable: 1, seaSeen: 1}, {w: {'螃蟹': {lv: 1, ok: 0}, '海': {lv: 1, ok: 0}}});
  assert.equal(bubble(g, 'elder'), '!', 'a ! over him');
  assert.deepEqual(get(g, 'getTasks().map(t => [t.text, t.target])'), [['Every food is on the feast’s 桌子 (tables)! Your 老师 (teacher) has an exam for you at school', [7, 2]]]);
  assert.deepEqual(item(g, /exam/), ['Pass your 老师 (teacher)’s exam at the 学校 (school)', false]);
  assert.equal(g.run('tileAt(3, 1).look'), 'wallFace', 'a bare wall, till you pass');
  // Not now: nothing happens, and he asks again next time
  await press(g, 7, 3, 'up', '[data-a=no]');
  assert.deepEqual(get(g, '__said'), ['elder: 我们考试吧！'], 'let’s have an exam!');
  assert.equal(get(g, 'here().exam'), 0);
  // Missing seven: not quite yet
  g.run("globalThis.__words = null; matchWords = async (words, title) => { __words = words; __notes.push('match: ' + title); return new Set(words.slice(0, 7)); }");
  g.run('__said.length = 0; finishedAt = null');
  await press(g, 7, 3, 'up', '[data-a=yes], [data-a=ok]');
  assert.equal(get(g, '__words.length'), 30, '30 words');
  assert.equal(new Set(get(g, '__words')).size, 30, 'all different');
  assert.ok(get(g, '__words.every(w => lvl(w) >= 1)'), 'all words you know');
  assert.equal(get(g, 'here().exam'), 0, '23 of 30: not quite yet');
  assert.deepEqual(get(g, '__said'), ['elder: 我们考试吧！'], 'and that’s the end of it');
  assert.ok(get(g, '__sounds').includes('wrong'));
  assert.equal(g.run('tileAt(3, 1).look'), 'wallFace');
  // Missing six: passed
  g.run("matchWords = async words => { __words = words; return new Set(words.slice(0, 6)); }");
  g.run('__said.length = 0; __notes.length = 0; finishedAt = null');
  const shells = g.run('S.shells'), turn = g.run('S.turn || 0');
  await press(g, 7, 3, 'up', '[data-a=yes], [data-a=ok]');
  assert.equal(get(g, 'here().exam'), 1, '24 of 30: passed');
  assert.equal(g.run('S.turn') - turn, 30, 'every word in the exam counts as a question answered (it counted only the ones you missed)');
  assert.ok(get(g, 'rec(__words[6]).ok >= 1 && rec(__words[0]).ok === 0'), 'matched first time: counted right; missed: back to none');
  assert.deepEqual(get(g, '__said'), ['elder: 我们考试吧！', 'elder: 很好！'], 'very good!');
  assert.equal(g.run('S.shells'), shells + 10);
  assert.equal(g.run('tileAt(3, 1).look'), 'certificate', 'your certificate on the classroom wall');
  assert.equal(g.run('promptFor(3, 1)'), 'Look');
  assert.deepEqual(item(g, /exam/), ['Pass your 老师 (teacher)’s exam at the 学校 (school)', true]);
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['The troop is ready for the feast: go to the big 树 (tree) in the middle of the home ground']);
  assert.deepEqual([npc(g, 'elder'), npc(g, 'playful')].map(n => n[0]), ['school', 'school'], 'the teacher you’re talking to, and your classmate, stay in the classroom (the teacher vanished as you passed)');
  goTo(g, 'homeGround', 17, 12, 'up');
  assert.deepEqual([npc(g, 'elder'), npc(g, 'big'), npc(g, 'playful')], [['homeGround', 16, 8], ['homeGround', 18, 8], ['homeGround', 14, 8]], 'at the home ground, the troop is at the feast’s tables');
});

test('the exam’s result card: how many you matched, how many you needed, and the words you missed', async () => {
  const g = game({place: 'school', x: 7, y: 3, dir: 'up'}, {crab: 'done', crabTable: 1, seaSeen: 1});
  g.run("confirmBox = async () => true; matchWords = async words => new Set(words.slice(0, 7))");
  let text = '';
  face(g, 7, 3, 'up');
  g.run("globalThis.__r = null; STEPS.exam({exam: true}, 'elder').then(r => { __r = r; })");
  for (let i = 0; i < 50 && g.run('__r === null'); i++){
    await tick(); g.flush();
    if (g.run('!modal.hidden && !!sheet.querySelector("[data-a=ok]")')){ text = g.run('sheet.textContent').replace(/\s+/g, ' '); g.run('sheet.querySelector("[data-a=ok]").click()'); }
  }
  assert.match(text, /Not quite yet/);
  assert.match(text, /You matched 23 of 30 words right first time\. You needed 24\./);
  assert.match(text, /Practise the words you missed/);
  assert.equal(g.run('__r === STOP'), true, 'and that’s the end of it');
});

test('the feast: the troop sits down round the tables, it’s told like the opening (快乐), and they’ll build you a raft; the old, big and little monkeys follow you', async () => {
  const g = game({place: 'homeGround', x: 17, y: 10, dir: 'up'}, {crab: 'done', crabTable: 1, seaSeen: 1, exam: 1}, {w: {'螃蟹': {lv: 1, ok: 0}, '海': {lv: 1, ok: 0}}});
  assert.deepEqual(item(g, /feast with the troop/), ['Sit down to the great feast with the troop', false]);
  g.run('rec("红色").ok = 0');   // (a word that needs practice)
  assert.equal(bubble(g, 'elder'), null, 'no lesson or practice at the feast’s tables');
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__scenes'), ['feast'], 'the feast, told like the opening');
  assert.ok(get(g, '__notes').includes('card: 快乐, said'), 'happy (快乐), as the little monkey was');
  assert.deepEqual(get(g, '[here().feastHeld, here().raft]'), [1, 1]);
  assert.deepEqual(get(g, '__said'), ['big: 我们来做木筏吧！'], 'let’s make a raft!');
  assert.deepEqual(get(g, 'S.following'), ['elder', 'big', 'playful'], 'the old, big and little monkeys come with you');
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Lead the troop down to the shore, below the meadow, to the edge of the 海 (sea)']);
  assert.deepEqual(item(g, /feast with the troop/), ['Sit down to the great feast with the troop', true]);
  assert.deepEqual(get(g, "AREA.scenes.feast.captions.map(c => c.zh.replace(/ /g, ''))").slice(-6),
    ['小猴子很快乐！', '可是美猴王不快乐。', '我们会老……', '海那边有神仙。', '神仙不会老！', '我要去找神仙！'], 'happy, then sad: you’ll grow old; but immortals never do');
  assert.equal(get(g, "AREA.scenes.feast.watch"), 'Watch the feast', 'to watch again from Settings');
  g.run('__scenes.length = 0');
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__scenes'), [], 'only once');
});

test('at the water’s edge, the troop builds your raft (木筏) and says goodbye; A at it sails away, and chapter 1 is complete', async () => {
  const g = game({place: 'shore', x: 11, y: 6, dir: 'down'}, {crab: 'done', crabTable: 1, seaSeen: 1, exam: 1, feastHeld: 1, raft: 1},
    {following: ['elder', 'big', 'playful'], w: {'螃蟹': {lv: 1, ok: 0}, '海': {lv: 1, ok: 0}, '快乐': {lv: 1, ok: 0}}});
  assert.deepEqual(['elder', 'big', 'playful', 'hungry', 'thirsty', 'boss'].map(id => npc(g, id)[0]), ['shore', 'shore', 'shore', 'shore', 'shore', 'shore'], 'the troop, down on the shore to see you off');
  assert.equal(g.run('tileAt(10, 13).look'), 'sea');
  assert.equal(bubble(g, 'elder'), null, 'no lessons on the shore');
  await play(g, 'runEvents()');
  assert.equal(get(g, 'here().raft'), 1, 'it waits till you come to the water’s edge');
  face(g, 11, 11, 'down');
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, 'S.following'), [], 'the troop stops following you');
  assert.equal(get(g, 'here().raft'), 2);
  assert.ok(get(g, "mapObjects().some(o => o.look === 'raft' && o.x === 10 && o.y === 13 && o.w === 2)"), 'your raft: one big object, two squares wide, on the water');
  assert.equal(g.run('OBJECT_STAGES.raft'), 3, 'built in three: its logs, the rope, the pole');
  assert.ok(get(g, '__notes').includes('card: 木筏, said'), 'raft (木筏): you watched it built');
  assert.deepEqual(get(g, '__said'), ['hungry: 再见！', 'thirsty: 再见！', 'playful: 再见！', 'big: 再见！', 'elder: 我们等你！', 'player: 再见'], 'goodbye, and: we’ll wait for you!');
  assert.deepEqual(get(g, 'getTasks().map(t => [t.text, t.target])'), [['Your 木筏 (raft) is ready at the edge of the 海 (sea): press A at it when you’re ready to go', [11, 13]]]);
  g.run('__said.length = 0; finishedAt = null');
  await press(g, 13, 12, 'left');
  assert.deepEqual(get(g, '__said'), ['elder: 我们等你！'], 'the old monkey, by your raft');
  g.run('__notes.length = 0; finishedAt = null');
  assert.equal(g.run('promptFor(11, 13)'), 'Board');
  await press(g, 11, 12, 'down');
  assert.deepEqual(get(g, '__scenes'), ['sailAway'], 'sailing away, the troop waving from the shore');
  assert.deepEqual(get(g, '[here().raft, here().done]'), [3, true], 'chapter 1 is complete');
  assert.match(get(g, '__notes').join(' '), /box: ⛰️ Chapter 1 complete! \d+ of \d+ words caught \d+ friends 🐚 \d+ You sailed away from Flower Fruit Mountain on your 木筏 \(raft\)/);
  assert.deepEqual(item(g, /Sail away/), ['Sail away on your 木筏 (raft)', true]);
  assert.deepEqual(get(g, 'getTasks()'), [], 'no tasks');
  assert.match(g.run('tasksHint()'), /Chapter 1 is complete! The next part of the journey is still to come/);
  // back on the shore: the troop goes home, and A at your raft watches it again
  assert.deepEqual(['elder', 'hungry'].map(id => npc(g, id)[0]), ['school', 'homeGround'], 'the troop, back home');
  g.run('__scenes.length = 0; __notes.length = 0; finishedAt = null');
  await press(g, 11, 12, 'down');
  assert.deepEqual(get(g, '__scenes'), ['sailAway']);
  assert.match(get(g, '__notes').join(' '), /The next part of the journey is still to come!/);
  assert.equal(get(g, 'here().raft'), 3);
});
