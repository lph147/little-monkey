// Area 2, across the sea: the human world's prologue (decided 4 November 2026), played from landing on the shore to the
// woodcutter's song, through every new word: the fishermen running off (人), the coat and hat (衣服, 帽子), the child (不,
// 是 in the 是不是 game, 什么), asking people what things are (井, 房子, 门, 网, 船), knocking at the gate (谁), the granny's
// rice (饭), the fisherman's fish and his coins (钱), the farmer (看) and his lunch, the town's stalls (买, 包子, 鞋), the
// teahouse (茶, 说, 哪里), the school (听, 孩子, 学, 书), the years passing, the boatman (风) and the woodcutter (歌).
// (Animals' friendships are given, as their word games are tested with Flower Fruit Mountain's.)
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const FROM_AREA_1 = ['石头', '你好', '山', '花', '草', '树', '水果', '桃子', '苹果', '动物', '兔子', '水', '吃', '喝', '要', '我', '猴子', '老板', '河', '鱼', '头带', '羊',
  '朋友', '家', '学校', '老师', '有', '没有', '鸟', '牛', '鱼竿', '小', '大', '海', '木筏', '路', '桥', '谢谢', '不客气', '再见', '对不起', '没关系', '我不要', '地图', '动物', '红色'];
// A game in Area 2 (area: its progress; more: more of the save), standing at pos
function game(pos, area = {}, more = {}, {waits = false} = {}){
  const w = Object.fromEntries(FROM_AREA_1.map(x => [x, {lv: 2, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, shells: 12, met: ['rabbit', 'sheep'], friends: ['rabbit', 'sheep'],
    areas: {1: {chapter: 1, raft: 3, done: true, fishing: 1}, 2: area}, pos, ...more, w: {...w, ...more.w}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__scenes = []; globalThis.__asked = 0");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w + (o.quiet ? ', quiet' : ', said')); setSeen(w); }");
  g.run("infoBox = async (who, html) => { __notes.push('box: ' + html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }; pictureQ = async () => { __asked++; return true; }; closeCard = () => {}");
  g.run("storyScene = async id => { __scenes.push(id); }; matchWords = async () => new Set(); confirmBox = async () => true; showPicked = async f => { __notes.push('picked: ' + f.zh); }");
  g.run("globalThis.__said = []; showDialog = async (who, line) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }");
  g.run("replyWith = async best => { __said.push('player: ' + best); return true; }; gapQ = async o => { __said.push('gap: ' + o.t.join('') + ' (' + o.gap + ')'); return true; }");
  if (!waits) g.run("practiseFirst = async () => true");   // (a new word's wait for practice: tested on its own, below)
  g.run('placePlayer()');
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code, click = null){   // runs code in the game and waits for it (click: a button to press on any card it opens)
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){
    await tick(); g.flush();
    if (click && g.run(`!modal.hidden && !!sheet.querySelector('${click}')`)) g.run(`sheet.querySelector('${click}').click()`);
  }
  await p;
}
const goTo = (g, place, x, y, dir) => g.run(`enterPlace('${place}'); S.pos = {place: '${place}', x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer()`);
const press = (g, x, y, dir, click) => { g.run(`S.pos = {place: PLACE, x: ${x}, y: ${y}, dir: '${dir}'}; placePlayer(); lastTalk = null`); return play(g, 'interact(...facing()).then(runEvents)', click); };
const said = g => { const s = get(g, '__said'); g.run('__said.length = 0'); return s; };
const notes = g => { const s = get(g, '__notes'); g.run('__notes.length = 0'); return s; };
const knows = (g, w) => g.run(`lvl('${w}')`) >= 1;
const npc = (g, id) => get(g, `(n => n && [n.place, n.x, n.y])(ALL_NPCS.find(n => n.id === '${id}'))`);

test('the page plays the area of the game you’re playing: a save in Area 2 plays Area 2, with Flower Fruit Mountain’s words', () => {
  const g = game({place: 'shore', x: 13, y: 11, dir: 'up'});
  assert.equal(g.run('AREA.number'), 2);
  assert.equal(g.run('PLACE'), 'shore');
  assert.ok(g.run("!!WORDS['猴子'] && !!WORDS['人']"), 'its words, and those of the area before it');
  assert.ok(g.run("ORDER.includes('猴子') && ORDER.includes('歌')"), 'both in the Word Scroll');
});

test('the whole prologue, from landing on the shore to the woodcutter’s song', async () => {
  const g = game({place: 'shore', x: 11, y: 16, dir: 'up'});
  // landing: the fishermen shout and run off into their hut
  await play(g, 'runSteps(AREA.begin)');
  assert.deepEqual(get(g, '__scenes'), ['drift']);
  assert.deepEqual(said(g), ['fisher1: 猴子！猴子！']);
  assert.ok(notes(g).includes('card: 人, said'), '人, said as you see them');
  assert.deepEqual(['fisher1', 'fisher2', 'oldFisher'].map(id => npc(g, id)[0]), ['hut', 'hut', 'hut'], 'they hide in their hut');
  assert.equal(g.run("isOpen(PLACES.shore.exits[0])"), false, 'the path up to the village is shut: people run from a monkey');
  // the coat, and the hat: dressed like a person, the fishermen come back
  await press(g, 23, 9, 'down');
  assert.ok(notes(g).includes('card: 衣服, said'));
  assert.deepEqual(get(g, 'S.wardrobe.wearing'), ['衣服'], 'you put it on');
  assert.equal(g.run("tileAt(23, 10).look"), 'sand', 'it’s gone from the sand');
  await press(g, 30, 12, 'down');
  assert.ok(notes(g).includes('card: 帽子, said'));
  assert.deepEqual(get(g, 'S.wardrobe.wearing'), ['衣服', '帽子']);
  assert.deepEqual(['fisher1', 'oldFisher'].map(id => npc(g, id)[0]), ['shore', 'shore'], 'the fishermen come out again');
  assert.equal(g.run("isOpen(PLACES.shore.exits[0])"), true, 'and the path up to the village opens');
  await press(g, 24, 15, 'right');
  assert.deepEqual(said(g), ['oldFisher: 这是我的衣服！'], 'the old fisherman sees his clothes on you');
  // fish for the fishermen's basket, beside them off the pier: three, counted as you catch them
  await press(g, 18, 20, 'left');
  assert.equal(get(g, 'here().pierFish'), 'asked');
  for (let i = 0; i < 3; i++) await play(g, 'runSteps(FISH.small.steps.find(p => !p.if || matches(p.if)).do)');
  assert.equal(g.run('counter("pierCaught")'), 3);
  const shells = get(g, 'S.shells');
  await press(g, 18, 20, 'left');
  assert.equal(get(g, 'here().pierFish'), 'done');
  assert.equal(get(g, 'S.shells'), shells + 3, 'three shells for the basket');
  said(g);
  g.run("S.friends.push('goose'); S.met.push('goose'); setSeen('鹅')");   // (the goose's word game)
  // up the path from the shore to the village
  assert.deepEqual(get(g, 'PLACES.shore.exits.map(e => e.to)'), ['shorePath', 'shorePath']);
  assert.deepEqual(get(g, '[...new Set(PLACES.shorePath.exits.map(e => e.to))]'), ['shore', 'village'], 'a path of its own between them');
  // the village: the child (不), its game (是), what's this? (什么)
  goTo(g, 'village', 19, 26, 'up');
  assert.equal(g.run("(AREA.bubbles.child.find(b => matches(b.if)) || {}).show"), '!');
  await press(g, 17, 12, 'left');
  assert.deepEqual(said(g), ['child: 你是谁？', 'gap: 我是人 (人)', 'child: 你不是人！你是猴子！']);
  assert.ok(knows(g, '不'));
  await press(g, 17, 12, 'left');
  assert.ok(knows(g, '是') && get(g, '__asked') === 4, 'the 是不是 game: four questions');
  await press(g, 17, 12, 'left');
  assert.deepEqual(said(g).slice(-1), ['child: 这是什么？']);
  assert.ok(knows(g, '什么'));
  // where are the immortals? (哪里) The child doesn't know, but is your friend now: the first on your list
  await press(g, 17, 12, 'left');
  assert.deepEqual(said(g), ['player: 神仙在哪里？', 'child: 我不知道。']);
  assert.ok(knows(g, '哪里'));
  assert.deepEqual([get(g, 'here().askChild'), get(g, "S.friends.includes('child')")], [1, true], 'asked, and your friend');
  // asking people what things are: the well, a house, the gate in the white wall
  notes(g);
  await press(g, 22, 12, 'up');
  assert.deepEqual(said(g), ['player: 这是什么？', 'granny: 这是井。'], 'the granny, by the well, tells you');
  assert.ok(notes(g).includes('card: 井, quiet'));
  await press(g, 9, 3, 'up');
  assert.deepEqual(said(g), ['player: 这是什么？', 'fisherman: 这是房子。']);
  await press(g, 31, 5, 'up');
  assert.deepEqual(said(g), ['player: 这是什么？', 'villager: 这是门。']);
  // knocking at it: who is it? (谁) Me!
  assert.equal(g.run('promptFor(31, 4)'), 'Knock');
  await press(g, 31, 5, 'up');
  assert.deepEqual(said(g), ['auntie: 谁啊？', 'player: 我！', 'auntie: 你是小猴子！你好！', 'player: 你好']);
  assert.ok(knows(g, '谁'));
  assert.deepEqual(npc(g, 'auntie'), ['village', 32, 5], 'she comes out of her gate');
  g.run("S.friends.push('chicken'); S.met.push('chicken'); setSeen('鸡')");   // (the chicken's word game)
  // the hens out of their yard: catch each (a question) and carry it back
  for (const [x, y, d] of [[13, 8, 'left'], [26, 6, 'left'], [34, 11, 'left'], [8, 21, 'left']]) await press(g, x, y, d);
  assert.equal(g.run('counter("hensBack")'), 4, 'all four caught');
  assert.deepEqual(npc(g, 'hen1'), ['village', 4, 15], 'back in their yard');
  assert.equal(get(g, 'here().hensDone'), 1, 'and the villager thanks you');
  said(g);
  await press(g, 29, 7, 'up');
  assert.deepEqual(said(g), ['player: 神仙在哪里？', 'villager: 我不知道。'], 'helped, so you ask them too');
  assert.ok(knows(g, '知道'), '知道, the second time');
  // the granny's lunch: a bowl of rice (饭), eaten there and then (a meal, not a snack for your bag), your health full
  g.run('S.health = 20');
  await press(g, 22, 12, 'right');
  assert.deepEqual(said(g).slice(-2), ['granny: 你饿吗？吃饭吧！', 'player: 谢谢']);
  assert.deepEqual([get(g, "S.bag['饭'] || 0"), get(g, 'S.health'), get(g, 'S.health === maxHealth()'), get(g, 'pl.eating')], [0, get(g, 'maxHealth()'), true, null], 'eaten, and your health full');
  assert.ok(notes(g).some(n => /eat the whole bowl/.test(n)));
  // the fisherman wants a fish: caught with your rod, he pays you in coins (钱)
  await press(g, 12, 4, 'left');
  assert.equal(get(g, 'here().fish'), 'asked');
  await play(g, 'runSteps(FISH.small.steps.find(p => !p.if || matches(p.if)).do)');
  assert.equal(get(g, 'here().holding.fish'), '鱼', 'a fish for him');
  await press(g, 12, 4, 'left');
  assert.deepEqual(said(g).slice(-5), ['fisherman: 你有鱼吗？', 'gap: 我有鱼 (鱼)', 'fisherman: 谢谢！', 'player: 不客气', 'fisherman: 这是钱。']);
  assert.ok(knows(g, '钱'));
  assert.equal(get(g, 'S.coins'), 3, 'three coins');
  assert.equal(g.run('MONEY()'), '🪙', 'coins are your money now');
  said(g); notes(g);
  await press(g, 12, 4, 'left');
  assert.deepEqual(said(g), ['player: 神仙在哪里？', 'fisherman: 我不知道。']);
  assert.ok(notes(g).some(n => /Nobody in the village knows/.test(n)), 'the village’s three asked: nobody knows');
  // the fishermen's net and boat, on the shore
  goTo(g, 'shore', 17, 1, 'down');
  await press(g, 10, 9, 'up');
  await press(g, 26, 16, 'down');
  assert.deepEqual(said(g), ['player: 这是什么？', 'fisher2: 这是网。', 'player: 这是什么？', 'oldFisher: 这是船。'], 'the fishermen tell you');
  assert.ok(knows(g, '网') && knows(g, '船'));
  assert.equal(g.run('counter("villageWords")'), 12, 'the village’s twelve words');
  goTo(g, 'village', 38, 12, 'right');
  assert.equal(g.run("isOpen(PLACES.village.exits[2])"), true, 'and the lane east opens');
  assert.deepEqual(get(g, '[...new Set(PLACES.villageLane.exits.map(e => e.to))]'), ['village', 'fields'], 'the country lane, to the fields');
  // the fields: look, birds! (看); shoo them off his rice; his lunch, a bowl of rice the granny gives you for him
  goTo(g, 'fields', 1, 8, 'right');
  await press(g, 11, 7, 'up');
  assert.deepEqual(said(g), ['farmer: 你看！鸟！']);
  assert.ok(knows(g, '看'));
  g.run('S.turn += 10');   // (you've played a few word games since 看)
  for (const [x, y, d] of [[6, 7, 'up'], [19, 15, 'down'], [24, 15, 'down'], [6, 15, 'down'], [38, 10, 'down']]) await press(g, x, y, d);
  assert.equal(g.run('counter("birdsShooed")'), 5, 'five birds shooed off, two of them over the stepping stones');
  goTo(g, 'fields', 35, 8, 'right');
  await play(g, 'runEvents()');
  assert.ok(get(g, "S.friends.includes('dog')"), 'on the road, the dog stopped you, and played its word game');
  await press(g, 11, 7, 'up');
  assert.equal(get(g, 'here().lunch'), 'asked');
  goTo(g, 'village', 21, 12, 'right');
  await press(g, 22, 12, 'right');
  assert.equal(get(g, 'here().holding.lunch'), '饭', 'the granny gives you a bowl for him');
  assert.equal(get(g, "S.bag['饭'] || 0"), 0, 'carried for him, not in your snacks');
  goTo(g, 'fields', 11, 8, 'up');
  const before = get(g, 'S.coins');
  await press(g, 11, 7, 'up');
  assert.equal(get(g, 'here().lunch'), 'done', 'he eats your rice');
  assert.equal(get(g, 'S.coins'), before + 3, 'and pays you 3 coins');
  assert.equal(g.run("isOpen(PLACES.fields.exits[2])"), false, 'the high road waits till you’ve asked him');
  said(g);
  await press(g, 11, 7, 'up');
  assert.deepEqual(said(g), ['player: 神仙在哪里？', 'farmer: 我不知道。']);
  said(g);
  await press(g, 22, 5, 'up');
  assert.deepEqual(said(g), ['player: 这是牛吗？', 'farmer: 是！'], 'a water buffalo');
  assert.equal(g.run("isOpen(PLACES.fields.exits[2])"), true, 'the high road on to the town');
  // the high road: a peddler with his cart
  goTo(g, 'highRoad', 16, 9, 'up');
  await press(g, 16, 9, 'up', '.shopitem');
  assert.equal(get(g, "S.bag['苹果']"), 1, 'an apple from the peddler');
  // the town: the money changer changes your shells for coins
  goTo(g, 'town', 1, 13, 'right');
  const had = get(g, 'S.coins'), shellsNow = get(g, 'S.shells');
  await press(g, 11, 14, 'left');
  assert.deepEqual([get(g, 'S.shells'), get(g, 'S.coins')], [0, had + shellsNow], 'a coin for each shell');
  // the stalls: what do you want to buy? (买), buns (包子), shoes (鞋), one ! at a time
  assert.deepEqual(get(g, "['fruitSeller', 'bunSeller', 'shoeSeller', 'teaKeeper'].map(id => ((AREA.bubbles[id] || []).find(b => matches(b.if)) || {}).show || '')"), ['!', '', '', ''], 'one ! at a time');
  await press(g, 5, 14, 'left', '.shopitem');
  assert.ok(knows(g, '买'));
  await press(g, 5, 10, 'left', '.shopitem');
  assert.ok(knows(g, '包子'));
  // the granny's shopping: a bun first
  await press(g, 20, 14, 'right');
  assert.equal(get(g, 'here().grannyBuns'), 'asked');
  await press(g, 20, 14, 'right');
  assert.equal(get(g, 'here().grannyBuns'), 'done', 'the bun from your bag');
  g.run("S.bag['苹果'] = 1; S.bag['桃子'] = 1");   // (bought at the fruit stall)
  for (let i = 0; i < 4; i++) await press(g, 20, 14, 'right');
  assert.equal(get(g, 'here().grannyPeach'), 'done', 'an apple, then a peach');
  said(g);
  await press(g, 20, 14, 'right');
  assert.deepEqual(said(g), ['player: 神仙在哪里？', 'granny2: 我不知道。']);
  await press(g, 11, 10, 'left', '.shopitem');
  assert.ok(knows(g, '鞋') && get(g, 'S.wardrobe.wearing').includes('鞋'), 'shoes, on');
  // the teahouse: tea (茶), and the storyteller (说); neither knows where the immortals are
  said(g);
  await press(g, 3, 5, 'up');
  await press(g, 3, 5, 'up');
  await press(g, 7, 6, 'up');
  await press(g, 7, 6, 'up');
  assert.deepEqual(said(g), ['teaKeeper: 喝茶吧！', 'player: 谢谢', 'player: 神仙在哪里？', 'teaKeeper: 我不知道。', 'teller: 我说，你听。', 'player: 神仙在哪里？', 'teller: 我不知道。']);
  assert.equal(g.run('counter("askedTown")'), 3, 'the town’s three asked');
  // the school: listen! (听), children (孩子), learning (学), and their books (书)
  for (let i = 0; i < 3; i++) await press(g, 13, 5, 'up');
  assert.ok(['茶', '说', '哪里', '听', '孩子', '学'].every(w => knows(g, w)));
  await press(g, 16, 4, 'up');
  assert.ok(knows(g, '书'));
  g.run("S.friends.push('cat'); S.met.push('cat'); setSeen('猫')");   // (the cat's word game)
  // years go by
  g.run('S.turn = (S.turn || 0) + 10');
  await play(g, 'runEvents()');
  assert.ok(get(g, '__scenes').includes('yearsPass'));
  assert.equal(get(g, 'here().years'), 1);
  assert.deepEqual(get(g, '[...new Set(PLACES.canalPath.exits.map(e => e.to))]'), ['town', 'harbour'], 'the canal path, down to the harbour');
  // the harbour: load the boat for the docker, and ask; then the boatman knows: across the sea. No wind today (风); then
  // the wind, the fare and the crossing
  goTo(g, 'harbour', 16, 1, 'down');
  await press(g, 11, 7, 'up');
  assert.equal(get(g, 'here().cargo'), 1);
  for (const [x, y] of [[8, 5], [9, 5], [12, 6], [13, 6]]){   // (lifting each over your head, and down the pier to the boat with it)
    await press(g, x, y, 'up');
    assert.equal(get(g, 'here().lifted'), 'sack', 'a sack over your head');
    await press(g, 17, 15, 'right');
    assert.equal(get(g, 'here().lifted || null'), null, 'put down on the boat');
  }
  assert.equal(g.run('counter("cargoCarried")'), 4, 'four sacks on the boat');
  assert.equal(get(g, 'tileAt(18, 15).deck'), 4, 'all four on its deck');
  const paid = get(g, 'S.coins');
  await press(g, 11, 7, 'up');
  assert.deepEqual([get(g, 'here().cargo'), get(g, 'S.coins')], [2, paid + 3], 'the docker pays you');
  said(g);
  await press(g, 11, 7, 'up');
  assert.deepEqual(said(g), ['player: 神仙在哪里？', 'docker: 我不知道。']);
  assert.equal(g.run('counter("asked")'), 8, 'everyone on your list');
  await press(g, 16, 16, 'right');
  assert.deepEqual(said(g), ['player: 神仙在哪里？', 'boatman: 神仙在海的那边。'], 'at last: across the sea');
  assert.equal(get(g, 'here().toldSea'), 1);
  await press(g, 16, 16, 'right');
  assert.ok(knows(g, '风'));
  const fareFrom = get(g, 'S.coins');
  await press(g, 16, 16, 'right');
  assert.equal(get(g, 'S.coins'), fareFrom - 5, 'the fare');
  assert.ok(get(g, '__scenes').includes('crossSea'));
  assert.equal(g.run('PLACE'), 'farShore', 'across the western sea');
  // the woodcutter's song (歌): the immortal lives up on the mountain. The end of the prologue, and chapter 1 begins
  said(g);
  assert.equal(g.run('isOpen(PLACES.farShore.exits[2])'), false, 'the way up the stone steps waits for him');
  await play(g, 'interact(...(S.pos = {place: PLACE, x: 10, y: 10, dir: "left"}, placePlayer(), facing())).then(runEvents)', '[data-a=ok]');
  assert.deepEqual(said(g), ['woodcutter: 这是神仙的歌。', 'woodcutter: 神仙在山上！']);
  assert.deepEqual(get(g, '[here().song, here().chapter]'), [1, 1], 'chapter 1, the teacher’s mountain');
  assert.equal(g.run('isOpen(PLACES.farShore.exits[2])'), true, 'up the stone steps');
  assert.deepEqual(npc(g, 'woodcutter'), ['mountainFoot', 10, 4], 'he’s gone home to his hut');
  const words = get(g, "Object.keys(WORD_BANK).filter(w => WORD_BANK[w].area === 2)");
  assert.deepEqual(words.filter(w => !knows(g, w)), ['云', '鹤', '天', '师父', '名字', '叶子', '扫', '桶', '斧头', '头', '晚上', '月亮', '星星', '变', '飞', '松树', '回家',
    '回来', '好久不见', '哭', '老', '妖怪', '火', '救命', '笼子', '钥匙', '毛', '刀'], 'all 32 of the prologue’s words (chapter 1’s and 2’s to come)');
  // the checklist is chapter 1's now
  assert.deepEqual(get(g, 'areaChecklist().filter(c => c[3]).map(([t]) => t)'), ['Help the woodcutter at his hut', 'Make 朋友 (friends) with the crane on the cliff road', 'Find the immortal’s cave']);
  // and you can sail back and forth
  assert.equal(g.run('promptFor(17, 21)'), 'Sail');
});

test('asking what something is: only once you know 什么, and with someone near; A says Ask, then they tell you', async () => {
  const g = game({place: 'village', x: 22, y: 12, dir: 'up'}, {landed: 1, dressed: 2, child: 2});
  assert.equal(g.run('promptFor(22, 11)'), 'Look', 'not yet: you can’t ask');
  await press(g, 22, 12, 'up');
  assert.match(notes(g).join(' '), /Maybe someone can tell you, once you know how to ask/);
  assert.ok(!knows(g, '井'), 'looking doesn’t teach it');
  g.run("setSeen('什么')");
  assert.equal(g.run('promptFor(22, 11)'), 'Ask', 'the granny is near');
  g.run("for (const id of ['granny', 'kid2']) ALL_NPCS.find(n => n.id === id).place = 'away'; NPCS = NPCS.filter(n => !['granny', 'kid2'].includes(n.id))");   // (the granny, and the child playing nearby)
  await press(g, 22, 12, 'up');
  assert.match(notes(g).join(' '), /Ask someone: walk up to it with a person nearby/, 'with nobody near, nobody to ask');
  assert.ok(!knows(g, '井'));
});

test('a new word waits for a little practice: asking offers a quick word game first, and an animal you haven’t met too, with no friend made', async () => {
  const g = game({place: 'village', x: 22, y: 12, dir: 'up'}, {landed: 1, dressed: 2, child: 3}, {w: {'什么': {lv: 1, ok: 0}}, turn: 50}, {waits: true});
  g.run("here().wordTurn = S.turn");   // (you've just caught a word)
  g.run("globalThis.__offered = []; STEPS.wordGame = async (s, who) => { __offered.push([who, s.wordGame.questions]); }");
  await press(g, 22, 12, 'up');
  assert.deepEqual(get(g, '__offered'), [['granny', 5]], 'the granny offers five questions first');
  assert.ok(!knows(g, '井'), 'and the word waits');
  goTo(g, 'shore', 8, 11, 'down');
  g.run("__offered.length = 0; S.friends = S.friends.filter(f => f !== 'player')");
  await press(g, 8, 11, 'down');
  assert.deepEqual(get(g, '__offered'), [['player', 5]], 'the goose: a quick game with nobody, first');
  assert.ok(!get(g, "S.friends.includes('player') || S.met.includes('goose')"), 'no friend made, and the goose not met yet');
  g.run('S.turn += 5');
  assert.equal(g.run('wordLeft()'), 0, 'after five more questions, the new word can come');
});

test('the child’s game: a picture and 这是…吗？, answered 是 or 不是, its English once you’ve answered', async () => {
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 2, w: {'鱼': {lv: 1, ok: 0}, '鸟': {lv: 1, ok: 0}}}});
  g.run("mode = 'play'; save = () => {}; say = () => {}");
  let done = false; const p = Promise.resolve(g.run("isItQ({pic:'鱼', said:'鸟'})")).then(() => { done = true; });
  await tick(); g.flush();
  const sheet = g.el('#sheet');
  assert.match(sheet.textContent, /Is it\?/);
  assert.deepEqual([...sheet.querySelectorAll('.opt')].map(b => b.textContent.replace(/\s+/g, '')), ['是shìyes', '不是búshìno'], 'yes and no, with their pinyin and English');
  assert.equal(sheet.querySelector('.sentence-en').textContent, '', 'no English till you’ve answered');
  sheet.querySelectorAll('.opt')[1].click();
  assert.equal(sheet.querySelector('.sentence-en').textContent, 'Is this a bird? No: it’s a fish.');
  sheet.querySelector('[data-a=next]').click();
  for (let i = 0; i < 20 && !done; i++){ await tick(); g.flush(); }
  assert.equal(await p.then(() => g.run('rec("鸟").ok')), 1, 'it counts as practice of 鸟');
  assert.equal(g.run('IS_IT_SENTENCES().length'), g.run('AREA.isIt.length'), 'every word it can ask about has its sentence, for the voices');
});

test('the hat and a headband go on your head one at a time; the coat and shoes on your body and feet', () => {
  const g = game({place: 'shore', x: 13, y: 11, dir: 'up'}, {}, {wardrobe: {owned: ['头带', '衣服', '帽子', '鞋'], wearing: ['头带']}});
  g.run("putOn('帽子')"); assert.deepEqual(get(g, 'S.wardrobe.wearing'), ['帽子'], 'the hat takes the headband’s place');
  g.run("putOn('衣服'); putOn('鞋')"); assert.deepEqual(get(g, 'S.wardrobe.wearing'), ['帽子', '衣服', '鞋']);
  g.run("putOn('头带')"); assert.deepEqual(get(g, 'S.wardrobe.wearing'), ['衣服', '鞋', '头带'], 'and the headband the hat’s');
  const rows = get(g, "monkeyRows('player', 'down', false, 0)");
  assert.ok(rows.slice(8, 14).join('').includes('C') && rows.slice(14).join('').includes('S'), 'the coat and shoes are drawn on your monkey');
  g.run("putOn('帽子')");
  assert.ok(get(g, "monkeyRows('player', 'down', false, 0)").slice(0, 4).join('').includes('a'), 'and the hat');
  assert.ok(g.run("PEOPLE.has('granny') && !PEOPLE.has('hen1')"), 'people are drawn as people');
  assert.ok(get(g, "personRows('granny', 'down', false, 1)")[15] !== get(g, "personRows('granny', 'down', false, 0)")[15], 'their legs step as they walk');
});

test('coins: once you know 钱 they’re your money, earned and spent; the money changer changes your shells for them', async () => {
  const g = game({place: 'town', x: 11, y: 14, dir: 'left'}, {landed: 1, dressed: 2}, {shells: 7, coins: 0});
  assert.equal(g.run('MONEY()'), '🐚', 'shells till you know 钱');
  g.run("earn(2)"); assert.deepEqual(get(g, '[S.shells, S.coins]'), [9, 0]);
  g.run("setSeen('钱'); S.coins = 3");
  assert.equal(g.run('MONEY()'), '🪙');
  assert.match(g.run('moneyHTML()'), /🪙 3.*🐚 9/, 'both, while you still have shells');
  await press(g, 11, 14, 'left');
  assert.deepEqual(get(g, '[S.shells, S.coins]'), [0, 12], 'one coin for each shell');
  assert.match(notes(g).join(' '), /You give the money changer your 9 🐚, and he gives you 9 🪙/);
  assert.equal(g.run('moneyHTML()'), '<span>🪙 12</span>', 'just coins now');
});

test('arriving in Area 2 (the page loaded again to sail in): you’re on the shore by your raft, and the landing plays', async () => {
  const save = {version: 34, started: true, area: 2, w: {'猴子': {lv: 2, ok: 2}}, pos: {place: 'shore', x: 11, y: 12, dir: 'down'}, areas: {1: {raft: 3, done: true}}};
  const g = loadGame({dom: true, save, session: {'xiaohouzi-v2-go': JSON.stringify({area: 2, slot: 1, action: 'arrive'})}});
  for (let i = 0; i < 5; i++){ await tick(); g.flush(); }
  assert.equal(g.run('AREA.number'), 2);
  assert.equal(g.session.get('xiaohouzi-v2-go'), undefined, 'the note is used once');
  assert.deepEqual(get(g, '[S.pos.place, S.pos.x, S.pos.y]'), ['shore', 11, 16], 'where your raft washed up');
  assert.equal(g.run('mode'), 'intro', 'the raft drifting across the sea');
  assert.equal(g.run('scene.id'), 'drift');
});

test('the title screen continues a game in another area by loading the page again for it', () => {
  const two = {version: 34, started: true, area: 2, w: {}, areas: {1: {raft: 3}, 2: {landed: 1}}};
  const g = loadGame({dom: true, save: {version: 34, started: true, area: 1, w: {}}, storage: {'xiaohouzi-v2-game2': JSON.stringify(two), 'xiaohouzi-v2-slots': JSON.stringify({active: 1, played: {1: 1, 2: 2}})}});
  assert.equal(g.run('AREA.number'), 1);
  g.run('continueGame(2)');
  assert.deepEqual(JSON.parse(g.session.get('xiaohouzi-v2-go')), {area: 2, slot: 2, action: 'continue'});
  assert.equal(g.reloads.count, 1);
  assert.equal(JSON.parse(g.storage.get('xiaohouzi-v2-slots')).active, 2, 'game 2 is the one you’re playing now');
});

test('pacing: in Area 2, everything that teaches a new word waits for five questions’ practice first, so no two come back to back', () => {
  const g = game({place: 'shore', x: 13, y: 11, dir: 'up'});
  const A = get(g, 'AREA');
  assert.equal(A.wordGap.questions, 5);
  const teaches = steps => steps.some(s => s.newWord || (s.say && s.teach) || s.shop || s.request || s.isIt);
  for (const [who, parts] of Object.entries(A.talk)) parts.forEach((p, i) => {
    const news = p.do.filter(s => s.newWord).map(s => s.newWord);
    if (news.length) assert.ok(p.waits, `${who}'s talk, part ${i + 1}, teaches ${news.join(' ')}: it waits`);
    assert.ok(news.length <= 1, `${who}'s talk, part ${i + 1}: one new word at a time`);
  });
  for (const [ch, t] of Object.entries(A.legend)) for (const p of t.onLook || []) if (p.do.some(s => s.newWord)) assert.ok(p.waits, `legend "${ch}" teaches a word: it waits`);
  assert.ok(A.animals.every(a => a.waits), 'animals you meet the first time wait too');
  for (const sh of Object.values(A.shops)) assert.ok(A.talk[sh.who].filter(p => teaches(p.do) && p.if && p.if.new).every(p => p.waits), `${sh.who}'s stall waits before a new word`);
  for (const p of Object.values(A.places)) for (const [ch, t] of Object.entries(p.legend || {})) for (const pt of t.onLook || []) if (pt.do.some(s => s.newWord)) assert.ok(pt.waits, `a place's "${ch}" teaches a word: it waits`);
  assert.ok(A.events.filter(e => e.do.some(s => s.newWord) && e.if.landed !== 0).every(e => e.if.wordReady), 'and an event that teaches a word waits till you’re ready (but for the landing, your first)');
  // the words: 32 in the prologue, one after another, and the first (人) as you land; then chapter 1's 17, and chapter 2's 11
  assert.equal(get(g, "Object.keys(WORD_BANK).filter(w => WORD_BANK[w].area === 2).length"), 60);
});

test('the human world has a song of its own, a village tune, in every place (not Flower Fruit Mountain’s)', () => {
  const g = game({place: 'village', x: 11, y: 8, dir: 'down'});
  const MOUNTAIN = ['cliffRoad', 'pillars', 'cave', 'caveNight', 'masterRoom'];   // (chapter 1: up on the teacher's mountain, above the forest at its foot, the cave's song)
  // (chapter 2: home to Flower Fruit Mountain, with its own songs, and the demon's gloomy mountain)
  assert.equal(g.run(`[...new Set(Object.entries(PLACES).filter(([id]) => !${JSON.stringify(MOUNTAIN)}.includes(id) && !PLACES[id].borrowed && id !== 'lair').map(([, p]) => p.music))].join()`), 'village', 'every place');
  assert.equal(g.run(`[PLACES.ffmMeadow.music, PLACES.ffmCave.music, PLACES.lair.music].join()`), ',cave,pineWood', 'home with its own songs (the meadow’s, home’s), and the demon’s mountain gloomy as the pines');
  assert.equal(g.run("Object.keys(PLACES).filter(id => PLACES[id].borrowed || id === 'lair').length"), 20, 'all 19 of home’s places, and the demon’s mountain');
  assert.equal(g.run(`${JSON.stringify(MOUNTAIN)}.map(id => PLACES[id].music).join()`), 'cave,cave,cave,cave,cave', 'and up on the mountain, among the clouds, the cave’s');
  assert.equal(g.run('placeSong()'), 'village');
  assert.equal(g.run('SONGS.village.events.filter(e => e.k === "mel").reduce((s, e) => s + e.d, 0)'), g.run('SONGS.village.beats'), 'its tune fills its loop exactly');
  assert.ok(g.run('SONGS.village.events.filter(e => e.m).every(e => [7, 9, 11, 2, 4].includes(e.m % 12))'), 'every note one of its five (G A B D E), so nothing clashes');
  g.run('S.pos = {place: "shore", x: 11, y: 10, dir: "up"}; PLACE = "shore"');
  assert.equal(g.run('placeSong()'), 'village', 'the shore too');
});
