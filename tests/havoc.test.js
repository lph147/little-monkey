// Area 2, chapter 2, home to the Demon of Havoc (built 5 November 2026, from the plan): home to Flower Fruit Mountain,
// twenty years on, as you left it (its places borrowed from Area 1); the troop hiding (哭 回来 好久不见 老); the little demons
// on the home ground (妖怪); the demon's mountain far to the north, its torches (火), the little ones locked in cages (救命
// 笼子), the key (钥匙) from the guard, as a little demon; the cart (车) of the troop's things, fought for and pulled back to
// the little ones; the Demon of Havoc, walking out of his cave, his hair trick (毛) and his broadsword (刀); and a wind home,
// with the little ones and the cart, to unload it, to the end of Area 2.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const FROM_BEFORE = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水', '吃', '喝', '要', '我', '猴子', '河', '鱼', '羊', '朋友', '家', '有', '鸟', '小', '大',
  '谢谢', '再见', '不客气', '木头', '三', '四', '人', '是', '不', '什么', '钱', '风', '歌', '洞', '门', '房子', '狗', '猫', '鸡', '牛', '船', '云', '鹤', '天', '王', '棍子',
  '师父', '名字', '叶子', '扫', '桶', '斧头', '头', '晚上', '月亮', '星星', '变', '飞', '松树', '回家', '碗', '蜂蜜', '牛奶'];
const CHAPTER = ['哭', '回来', '好久不见', '老', '妖怪', '火', '救命', '笼子', '钥匙', '车', '毛', '刀'];
const CHAPTER_ONE = {landed: 1, dressed: 2, back: 1, child: 3, years: 1, boat: 2, song: 1, chapter: 2, woodFetch: 4, sky: 1, door: 2, teacher: 1, named: 1, spyGame: 1,
  grown: 1, riddle: 3, tests: 1, fly: 1, pine: 1, sentHome: 1};
function game(pos, area = {}){
  const w = Object.fromEntries(FROM_BEFORE.map(x => [x, {lv: 2, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, shells: 0, coins: 5, met: [], friends: [],
    areas: {1: {chapter: 1, raft: 3, done: true}, 2: {...CHAPTER_ONE, ...area}}, pos, w}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__asked = 0; globalThis.__scenes = []; globalThis.__battles = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }; pictureQ = async o => { __asked++; if (o.onAnswer) o.onAnswer(true, o.answerIdx); return true; }; gapQ = async () => { __asked++; return true; }; closeCard = () => {}");
  g.run("globalThis.__said = []; showDialog = async (who, line, o = {}) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('') + (o.noEn ? ' (no English)' : '')); }");
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; storyScene = async id => { __scenes.push(id); }; practiseFirst = async () => true");
  g.run("STEPS.chapter = async s => { here().chapter = s.chapter; __notes.push('chapter: ' + s.chapter); }; battle = async id => { __battles.push(id); return 'won'; }");
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 2000 && !done; i++){ await tick(); g.flush(); } await p; }
const press = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)'); };
const stand = (g, x, y, dir) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`); return play(g, 'runEvents()'); };
const walkTo = (g, x, y, dir) => {   // a step onto the square next to you, anyone following you stepping after you (as tests/cow.test.js)
  g.run(`followersStep(performance.now()); Object.assign(pl, {x: ${x}, y: ${y}, px: ${x} * T, py: ${y} * T, dir: '${dir}', mv: null})`);
  return play(g, `arrive(${x}, ${y}).then(runEvents)`);
};
const goTo = (g, place, x, y, dir) => play(g, `goThrough({to: '${place}', arrive: [${x}, ${y}], facing: '${dir}'}).then(runEvents)`);
const ready = g => g.run('S.turn = (S.turn || 0) + 10');   // (a little practice since the last new word)
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const knows = (g, w) => g.run(`lvl('${w}')`) >= 1;
const p = (g, k) => get(g, `here().${k}`);
const besideWord = (g, w) => get(g, `(() => { for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (tileAt(x, y).word === '${w}')
  for (const [dx, dy, d] of [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']]) if (walkable(x + dx, y + dy) && !npcAt(x + dx, y + dy)) return [x + dx, y + dy, d]; return null; })()`);

test('home, as you left it: Flower Fruit Mountain’s places, the school and garden built, the feast’s tables bare, little demons in the long grass', () => {
  const g = game({place: 'ffmHomeGround', x: 13, y: 9, dir: 'down'});
  assert.equal(get(g, 'Object.keys(PLACES).filter(id => PLACES[id].borrowed).length'), 19, 'all of home’s places');
  assert.equal(g.run('PLACES.ffmHomeGround.name.en'), 'Home ground');
  assert.equal(g.run('tileAt(9, 4).look'), 'school', 'the school, as you left it');
  assert.equal(g.run('tileAt(16, 7).look'), 'feastTableRobbed', 'the feast’s table, bare: the little demons took everything');
  assert.equal(g.run('tileAt(21, 7).look'), 'milkTableBare');
  assert.ok(get(g, 'PLACES.ffmHomeGround.exits.map(e => e.to)').includes('ffmFalls'), 'its ways go to home’s other places');
  assert.deepEqual(get(g, 'PLACES.ffmMeadow.legend.G.wild'), ['demon'], 'little demons, where animals hid in the long grass');
  assert.deepEqual(get(g, 'PLACES.ffmMeadow.legend.P.pick'), {item: '桃子'}, 'fruit to pick, as at the end');
  assert.match(g.run('PLACES.ffmMeadow.noMap'), /across the sea/, 'your map is of the lands across the sea');
  // what A did there that only looked at something is kept (decided 7 November 2026, after playing it: the hillside's
  // lookout said Look, and nothing happened): the views from the lookouts, the signs; and nowhere says Look, then nothing
  assert.deepEqual(get(g, 'PLACES.ffmHillside.legend.R.onLook'), [{do: [{scene: 'lookout'}]}], 'the hillside’s lookout: its view');
  assert.deepEqual(get(g, 'PLACES.ffmSouthSlope.legend.R.onLook'), [{label: 'Look', do: [{scene: 'southView'}]}], 'the south slope’s: just the view, the cow long home');
  assert.ok(get(g, 'AREA.scenes.lookout && AREA.scenes.southView && true'), 'their scenes, borrowed with them');
  assert.equal(get(g, 'PLACES.ffmHomeGround.legend["ω"].onLook[0].label'), 'Read', 'a sign still reads');
  const dead = get(g, `Object.entries(PLACES).filter(([, p]) => p.borrowed).flatMap(([id, p]) => [...new Set(p.map.join(''))].filter(ch => {
    const t = p.legend[ch] || AREA.legend[ch]; return t && t.landmark && !(t.word || t.onLook || t.action || t.pick || t.fishing || t.hop); }).map(ch => id + ' ' + ch))`);
  assert.deepEqual(dead, ['ffmHomeGround Δ', 'ffmHomeGround @', 'ffmPineWood x', 'ffmSchool k'], 'only these do nothing there now (the shop, the tower, the rock, the timetable: story, not looking)');
  for (const d of dead){ const [id, ch] = d.split(' '); g.run(`enterPlace('${id}')`); assert.equal(get(g, `(() => { for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (MAP[y][x] === '${ch}') return promptFor(x, y); })()`), '', `${d}: no Look, where A does nothing`); }
  g.run("enterPlace('ffmHillside')");
  const [rx, ry] = get(g, '(() => { for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (MAP[y][x] === "R") return [x, y]; })()');
  g.run(`S.pos = {place: 'ffmHillside', x: ${rx}, y: ${ry - 1}, dir: 'down'}; placePlayer()`);
  assert.equal(g.run(`promptFor(${rx}, ${ry})`), 'Look');
  g.run("enterPlace('ffmHomeGround')");
  g.run('Object.assign(here(), {homeAgain: 1}); refreshMap()');
  assert.equal(g.run('tileAt(16, 7).look'), 'feastTableRobbed', 'home with the little ones, the tables still bare…');
  g.run('Object.assign(here(), {unload: 3}); refreshMap()');
  assert.deepEqual([g.run('tileAt(16, 7).look'), g.run('tileAt(21, 7).look')], ['tableBack2', 'milkTableBare'], '…till the troop’s things go back on them, off the cart: the bowls and peaches so far');
  g.run('Object.assign(here(), {unload: 6}); refreshMap()');
  assert.deepEqual([g.run('tileAt(16, 7).look'), g.run('tileAt(21, 7).look')], ['tableBack4', 'milkTableJug'], 'all five');
  g.run('Object.assign(here(), {party: 1}); refreshMap()');
  assert.equal(g.run('tileAt(16, 7).look'), 'feastTableHoney', 'and once the troop celebrates, everything’s back on them');
  assert.equal(g.run('tileAt(12, 7).look'), 'fruitTableMelon');
});

test('the troop twenty years on: greyer, the old monkey with a walking stick, and the little ones drawn small', () => {
  const g = game({place: 'ffmCave', x: 7, y: 11, dir: 'up'});
  assert.equal(get(g, 'HOLDS.elder'), '棍子', 'the old monkey leans on a stick');
  assert.ok(get(g, '["baby1", "baby5", "calf"].every(id => ALL_NPCS.find(n => n.id === id).small)'), 'little ones, and the cow’s calf');
  assert.equal(get(g, 'ALL_NPCS.find(n => n.id === "elder").small'), false);
});

test('a game saved at the end of chapter 1, sent home before chapter 2 was built: it begins now, by your stone', async () => {
  const g = game({place: 'cave', x: 14, y: 10, dir: 'down'}, {chapter: 1});
  await play(g, 'runEvents()');
  assert.ok(notes(g).includes('chapter: 2'));
  assert.deepEqual([g.run('PLACE'), g.run('pl.x'), g.run('pl.y')], ['ffmMeadow', 9, 2]);
});

test('chapter 2, from landing by your stone to the end of Area 2', async () => {
  const g = game({place: 'ffmMeadow', x: 9, y: 2, dir: 'down'});
  // Part 1, home again: quiet; someone crying (哭); the troop hiding (回来, 好久不见); the old monkey (老), and the news
  await play(g, 'runEvents()');
  assert.ok(notes(g).some(n => /very quiet/.test(n)));
  assert.equal(get(g, 'partNow().id'), 'homeAgain');
  await press(g, 12, 4, 'down');
  assert.deepEqual(said(g), ['player: 小猴子在哭。', 'mother: 我的孩子……']);
  assert.ok(notes(g).includes('card: 哭'));
  assert.ok(get(g, 'getTasks().map(t => t.id)').includes('c2big'), 'the troop is hiding: find them');
  ready(g);
  await press(g, 3, 10, 'left');
  assert.deepEqual(said(g), ['big: 你回来了！']);
  assert.ok(notes(g).includes('card: 回来'));
  assert.equal(get(g, 'ALL_NPCS.find(n => n.id === "big").place'), 'ffmMeadow', 'out from behind the bush');
  await goTo(g, 'ffmHomeGround', 1, 9, 'right');
  ready(g);
  await press(g, 2, 12, 'right');
  assert.deepEqual(said(g), ['hungry: 好久不见！', 'player: 好久不见']);
  assert.ok(notes(g).includes('card: 好久不见'));
  await goTo(g, 'ffmCave', 7, 12, 'up');
  ready(g);
  await press(g, 7, 10, 'up');
  assert.deepEqual(said(g), ['elder: 好久不见！', 'player: 好久不见', 'elder: 我老了。']);
  assert.ok(notes(g).includes('card: 老'));
  assert.equal(p(g, 'news'), 1);
  assert.deepEqual(get(g, 'S.following'), ['elder'], 'the old monkey comes with you, out of the cave (decided 7 November 2026: he just appeared at the home ground)');
  // Part 2, the little demons: one stops you on the home ground (妖怪); chase off all three
  await goTo(g, 'ffmHomeGround', 1, 9, 'right');
  assert.deepEqual(get(g, 'FOLLOWERS.map(n => [n.id, n.place])'), [['elder', 'ffmHomeGround']], 'still with you, at the home ground');
  assert.equal(get(g, 'partNow().id'), 'demons');
  ready(g); notes(g);
  await stand(g, 2, 9, 'right');
  assert.ok(notes(g).includes('card: 妖怪'), 'the first little demon stops you');
  assert.deepEqual(get(g, '__battles'), ['demon']);
  assert.equal(p(g, 'd1'), 1);
  await press(g, 13, 10, 'right');
  notes(g);
  await stand(g, 16, 9, 'right');
  assert.deepEqual(get(g, 'S.following'), [], 'coming past the big table, he stops following you…');
  assert.deepEqual(get(g, '(n => [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === "elder"))'), ['ffmHomeGround', 16, 8], '…and sits on his stool by it');
  assert.ok(notes(g).some(n => /sits down on his stool/.test(n)));
  await press(g, 23, 9, 'right');
  assert.deepEqual([p(g, 'd2'), p(g, 'd3'), g.run('counter("demonsChased")')], [1, 1, 3]);
  assert.equal(g.run('canBattle()'), true, 'little demons in the long grass now, and your stick in your hand');
  // the old monkey sends you north, on your cloud
  said(g);
  await press(g, 16, 9, 'up');
  assert.deepEqual(said(g), ['elder: 混世魔王在北边。']);
  assert.ok(get(g, '__scenes').includes('flyNorth'));
  assert.equal(g.run('PLACE'), 'lair');
  // Part 3, the demon's mountain: the torches (火), the little ones calling (救命), the cages (笼子), the guard's key (钥匙)
  assert.ok(notes(g).some(n => /black rock/.test(n)));
  ready(g);
  await press(g, 12, 5, 'up');
  assert.ok(notes(g).includes('card: 火'));
  ready(g);
  await stand(g, 6, 8, 'up');
  assert.deepEqual(said(g), ['baby1: 救命！救命！']);
  assert.ok(notes(g).includes('card: 救命'));
  ready(g);
  await press(g, 6, 6, 'up');
  assert.ok(notes(g).includes('card: 笼子'));
  await press(g, 6, 6, 'up');
  assert.ok(notes(g).some(n => /locked/.test(n)), 'locked');
  ready(g);
  await press(g, 13, 5, 'up');
  assert.deepEqual(said(g), ['guard: 钥匙在这里。', 'guard: 你是猴子！走吧！']);
  assert.ok(notes(g).includes('card: 钥匙'));
  // change into a little demon (变), behind a boulder, and the guard gives you the key
  await press(g, 13, 11, 'left');
  assert.equal(get(g, 'pl.form'), '妖怪', 'you look just like a little demon');
  await press(g, 13, 5, 'up');
  assert.deepEqual([p(g, 'key'), get(g, 'pl.form')], [1, null]);
  // open the five cages, a question each
  const asked = get(g, '__asked');
  for (const [x, y] of [[4, 6], [6, 6], [8, 6], [5, 8], [7, 8]]) await press(g, x, y, 'up');
  assert.equal(g.run('counter("freed")'), 5);
  assert.equal(get(g, '__asked'), asked + 5, 'a question a cage');
  assert.equal(g.run('tileAt(4, 5).look'), 'cageOpen');
  assert.equal(get(g, 'ALL_NPCS.find(n => n.id === "baby1").place'), 'lair', 'out of its cage');
  // the little ones point the way: the troop's things are on a cart, over on the right, and a little demon guards it
  said(g); notes(g);
  await press(g, 3, 4, 'right');
  assert.deepEqual(said(g), ['baby1: 谢谢！']);
  assert.ok(notes(g).some(n => /on a cart, over on the right/.test(n)));
  assert.ok(get(g, 'getTasks().map(t => t.id)').includes('c2cart'));
  // it stops you as you come up to the cart, and fights you for it (none to run from); beaten, it runs off into the cave
  await stand(g, 22, 8, 'right');
  assert.deepEqual(said(g), ['cartGuard: 这是我们的！']);
  assert.deepEqual(get(g, '__battles').slice(-1), ['cartGuard']);
  assert.equal(get(g, 'AREA.enemies.cartGuard.boss'), true, 'no running from it');
  assert.deepEqual([p(g, 'cartWon'), get(g, 'ALL_NPCS.find(n => n.id === "cartGuard").place')], [1, 'hut'], 'it runs off into the cave');
  // the cart: 车, the first time you look at it; then you pull it, and it rolls along behind you (your cloud won't carry it)
  assert.equal(g.run('promptFor(24, 5)'), 'Pull', 'A at it says Pull');
  await press(g, 24, 6, 'up');
  assert.ok(notes(g).includes('card: 车'));
  assert.deepEqual(get(g, 'S.following'), ['cart']);
  for (let x = 23; x >= 11; x--) await walkTo(g, x, 6, 'left');
  assert.deepEqual(get(g, 'FOLLOWERS.map(n => [n.id, n.x, n.y])'), [['cart', 12, 6]], 'behind you as you go');
  assert.equal(p(g, 'loot'), 0);
  // back to the little monkeys with it: they jump for joy, the ground shakes, the little demons run into the cave, and out
  // comes the Demon of Havoc, down towards you a step at a time (decided 7 November 2026: he appeared off the screen)
  await walkTo(g, 10, 6, 'left');   // (and all that follows, to home again, the hungry monkey asking for the first of the troop's things)
  const heard = said(g), told = notes(g);
  assert.equal(p(g, 'loot'), 1);
  assert.deepEqual(get(g, 'here().parked.cart'), {place: 'lair', x: 11, y: 6, facing: 'left'}, 'the cart, left just behind you');
  assert.ok(heard.includes('baby2: 我们很快乐！'));
  assert.ok(told.some(n => /ground shakes/.test(n)));
  const king = get(g, 'here().parked.king');
  assert.equal(Math.abs(king.x - 10) + Math.abs(king.y - 6), 1, 'he walked right up to you');
  assert.deepEqual(get(g, '["guard", "guard2"].map(id => ALL_NPCS.find(n => n.id === id).place)'), ['hut', 'hut'], 'his little demons ran inside');
  // Part 4, the Demon of Havoc: who are you? I'm the king of Flower Fruit Mountain! (the fight itself: below)
  assert.ok(get(g, '__battles').includes('king'));
  assert.equal(p(g, 'king'), 2);
  // Part 5, home: a wind carries everyone home, the cart too, as in the book; the hungry monkey wants the troop's things
  // off it, each only in Chinese, to go back on the feast's tables (the unload step)
  assert.ok(get(g, '__scenes').includes('windHome'));
  assert.deepEqual([g.run('PLACE'), g.run('pl.x'), g.run('pl.y')], ['ffmHomeGround', 19, 9]);
  assert.deepEqual(get(g, '(n => [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === "cart"))'), ['ffmHomeGround', 19, 8], 'the cart, by the feast’s tables');
  assert.ok(told.some(n => /run to their mothers/.test(n)));
  assert.equal(get(g, 'partNow().id'), 'home2');
  assert.deepEqual(heard.slice(heard.indexOf('king: 你是谁？')), ['king: 你是谁？', 'player: 我们回家吧！', 'hungry: 我要碗。 (no English)'], 'who are you? the fight, home, and the first thing she wants');
  g.run("globalThis.__pick = null; takeCard = async words => { __choices = words; return __pick; }");
  g.run("__pick = '苹果'");   // (the wrong one: she says so, and asks again)
  await press(g, 19, 9, 'up');
  assert.deepEqual(said(g), ['hungry: 不对。', 'hungry: 我要碗。 (no English)']);
  assert.equal(get(g, 'here().lifted || null'), null, 'you didn’t take it');
  assert.deepEqual(get(g, '__choices').sort(), ['桃子', '牛奶', '碗', '苹果', '蜂蜜'].sort(), 'everything on the cart, to choose from');
  for (const [w, x] of [['碗', 17], ['桃子', 17], ['苹果', 17], ['蜂蜜', 17], ['牛奶', 22]]){
    g.run(`__pick = '${w}'`);
    await press(g, 19, 9, 'up');
    assert.equal(p(g, 'lifted'), w, `you lift the ${w} off the cart`);
    if (w === '牛奶') assert.equal(get(g, '__choices'), null, 'the last thing on the cart: no card');
    if (w === '桃子'){ await press(g, 22, 8, 'up'); assert.equal(p(g, 'lifted'), '桃子', 'not on the milk’s table'); }
    await press(g, x, 8, 'up');
    assert.equal(get(g, 'here().lifted || null'), null, `and put it down on its table`);
    g.run('__choices = null');
  }
  assert.deepEqual(said(g).filter(l => /要/.test(l)), ['hungry: 我要桃子。 (no English)', 'hungry: 我要苹果。 (no English)', 'hungry: 我要蜂蜜。 (no English)', 'hungry: 我要牛奶。 (no English)'],
    'she asks for each in turn, only in Chinese');
  assert.deepEqual([p(g, 'unload'), p(g, 'party')], [6, 1]);
  assert.ok(notes(g).some(n => /everyone celebrates/.test(n)));
  assert.equal(g.run('tileAt(16, 7).look'), 'feastTableHoney', 'everything back on the tables');
  assert.deepEqual(get(g, 'NPCS.find(n => n.id === "cart") && cartLoad(NPCS.find(n => n.id === "cart"))'), [], 'and the cart empty');
  assert.equal(get(g, 'ALL_NPCS.find(n => n.id === "baby1").place'), 'ffmHomeGround');
  said(g);
  await press(g, 3, 11, 'left');
  assert.deepEqual(said(g), ['player: 给你！', 'traineeStick: 谢谢！', 'player: 不客气']);
  assert.equal(get(g, 'NPCS.some(n => n.id === "traineeStick")'), true, 'your stick in its hands now');
  await press(g, 16, 9, 'up');
  assert.deepEqual(said(g), ['elder: 海下面有龙王。']);
  assert.ok(notes(g).some(n => /box: The end of Area 2/.test(n)), 'the end card');
  assert.deepEqual(CHAPTER.filter(w => !knows(g, w)), ['毛', '刀'], 'the chapter’s words (the fight’s two: below)');
  assert.ok(get(g, 'AREA.checklist.filter(c => c.chapter === 2).every(c => matches(c.done))'), 'the chapter’s checklist done');
});

// The fight itself, as the bear's (tests/boss.test.js): a right answer every time.
function fighting(){
  const w = Object.fromEntries([...FROM_BEFORE, '妖怪', '火'].map(x => [x, {lv: 1, due: 0, ok: 0}]));
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, w, areas: {1: {raft: 3}, 2: {...CHAPTER_ONE, news: 1, d3: 1, north: 1, freed1: 1, loot: 1, king: 1}},
    pos: {place: 'lair', x: 14, y: 9, dir: 'up'}}});
  g.run("mode = 'play'; globalThis.__q = null; const q = pictureQ; pictureQ = o => { __q = o; return q(o); }; say = () => {}");
  g.run("globalThis.__cards = []; globalThis.__scenes = []; showNotice = async w => { __cards.push(w); setSeen(w); }; storyScene = async id => { __scenes.push(id); }");
  const sheet = g.el('#sheet');
  const flush = async () => { for (let i = 0; i < 30; i++){ await tick(); g.flush(); } };
  return {g, sheet, flush};
}
test('the Demon of Havoc: a boss fight; at under half his health, the hair trick (毛); then his broadsword (刀), yours, hitting for 15', async () => {
  const {g, sheet, flush} = fighting();
  g.run("globalThis.__r = null; battle('king').then(r => __r = r)"); await flush();
  const hits = [];
  for (let i = 0; i < 80 && get(g, '__r') === null; i++){
    const hit = sheet.querySelector('.act[data-act="hit"]'), opt = sheet.querySelector('.opt'), ok = sheet.querySelector('[data-a=ok]');
    if (hit){ hit.click(); await flush(); }
    else if (opt){
      const fighting = /swing your/.test(sheet.querySelector('.label').textContent), before = get(g, 'here().weapon || null');
      sheet.querySelector(`.opt[data-i="${g.run('__q.answerIdx')}"]`).click();
      if (fighting) hits.push([before, sheet.querySelector('.plate .hp').getAttribute('aria-label')]);
      sheet.querySelector('[data-a=next]').click(); await flush();
    } else if (ok){ ok.click(); await flush(); }
    else await flush();
  }
  assert.equal(get(g, '__r'), 'won');
  assert.deepEqual(get(g, '__cards'), ['毛', '刀'], 'the hair trick first, then his broadsword: one new word at a time');
  assert.deepEqual(get(g, '__scenes'), ['hairTrick']);
  assert.equal(get(g, 'here().weapon'), '刀', 'the broadsword is yours from now on');
  assert.ok(hits.some(([w]) => w === '刀'), 'and you fought on with it');
  assert.equal(get(g, 'weaponHits()'), 15, 'hitting for 15, not 10');
  assert.deepEqual(get(g, 'BAG_TABS.find(t => t.id === "fight").things().map(t => [t.w, t.does])'), [['刀', 'Hits for 15']], 'and in your bag, To fight with');
});
