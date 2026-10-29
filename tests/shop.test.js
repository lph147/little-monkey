// The shop: the 老板 (shop owner) sells a headband, which you can choose to buy, and apples.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadGame, ROOT} = require('./fake-browser');

const base = loadGame();
const get = (game, expr) => JSON.parse(game.run(`JSON.stringify(${expr})`));
const AREA = get(base, 'AREA'), BANK = get(base, 'WORD_BANK'), VERSION = base.run('SAVE_VERSION');
const area = more => ({elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 3, story: true, holding: {}, bought: [], done: false, ...more});
const play = (save = {}) => loadGame({save: {version: VERSION, started: true, ...save}});

test('the shop is run by a character, and sells words you can collect, asked for with a sentence', () => {
  assert.ok(AREA.characters.some(c => c.id === AREA.shop.who), 'the shop needs a character to run it');
  assert.ok(AREA.lines[AREA.shop.ask] && AREA.lines[AREA.shop.welcome]);
  assert.match(AREA.shop.given, /\{item\}/, 'what’s happening when they give you what you’ve bought says what it is');
  for (const i of AREA.shop.items){
    assert.equal(BANK[i.item] && BANK[i.item].area, AREA.number, `${i.item} should be a word you can collect here`);
    assert.ok(i.price > 0 && i.note && i.bought && i.sentenceEn, `${i.item} needs a price, note, bought and sentenceEn`);
    const sentence = i.sentence.split(' ');
    assert.ok(sentence.includes(i.item), `you ask for ${i.item} by saying it`);
    for (const w of sentence) assert.ok(BANK[w], `${w} isn't in the word bank`);
  }
});

test('the headband is something you choose to buy: it isn’t on the checklist, nor a task', () => {
  assert.ok(!AREA.checklist.some(c => /headband/.test(c.text)), 'it isn’t on the checklist');
  assert.ok(!AREA.tasks.some(t => /头带/.test(t.text) && /Buy/.test(t.text)), 'nor a task to do');
});

test('the 老板 shows ! with something to teach, and ? once you can afford the headband', () => {
  const bubble = save => play(save).run("(AREA.bubbles.boss.find(x => matches(x.if)) || {show: ''}).show");
  const seen = w => ({lv: 1, due: 0, ok: 0});
  assert.equal(bubble({areas: {1: area({elder: 0})}}), '', 'not before you have met the old monkey');
  assert.equal(bubble({areas: {1: area()}}), '!', '老板 to teach');
  assert.equal(bubble({areas: {1: area()}, w: {'老板': seen()}}), '!', '头带 to teach');
  assert.equal(bubble({areas: {1: area()}, w: {'老板': seen(), '头带': seen()}, shells: 4}), '', 'not enough peaches yet');
  assert.equal(bubble({areas: {1: area()}, w: {'老板': seen(), '头带': seen()}, shells: 10}), '?', 'you can afford it');
  assert.equal(bubble({areas: {1: area({bought: ['头带']})}, w: {'老板': seen(), '头带': seen()}, shells: 10}), '', 'already bought');
});

test('buying the headband puts it on, and it stays in your wardrobe', async () => {
  const game = play({areas: {1: area()}, shells: 10, w: {'头带': {lv: 1, due: 0, ok: 0}}});
  assert.equal(game.run("wearing('头带')"), false);
  assert.equal(await buyIt(game, 'AREA.shop.items.find(i => i.item === "头带")'), true);
  assert.equal(game.run("wearing('头带')"), true);
  assert.deepEqual(get(game, 'S.wardrobe.owned'), ['头带']);
  const older = loadGame({save: {version: 11, started: true, areas: {1: area({bought: ['头带']})}}});
  assert.equal(older.run("wearing('头带')"), true, 'a save from before the wardrobe still wears it');
});

test('a version 6 save is converted with nothing bought yet', () => {
  const game = loadGame({save: {version: 6, started: true, areas: {1: {elder: 1, hungry: 'asked', thirsty: 'not asked', gate: false, story: false, holding: {}, done: false}}}});
  const s = get(game, 'S');
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.areas[1].bought, []);
  assert.ok(game.storage.get('xiaohouzi-v2-backup-v6'), 'a copy of the version 6 save is kept');
});

// The 老板 also sells 苹果: you can buy them again and again (up to 3 in your bag), and eat one in a
// question (in a battle or with an animal) to take away a wrong answer.
const APPLE = () => 'AREA.shop.items.find(i => i.item === "苹果")';
const buyIt = async (game, what) => {   // buy something, answering every card as a player would
  game.run('showDialog = showNotice = infoBox = replyWith = async () => {}; toast = () => {}; gapQ = async () => true;');
  return game.run(`buy(${what}, '')`);
};

test('the 老板 hands you what you’ve bought: you say 谢谢 (seeing what’s happening, and what it is), and he says 不客气, not the other way round', async () => {
  const know = ws => Object.fromEntries(ws.map(w => [w, {lv: 1, due: 0, ok: 0}]));
  const game = loadGame({dom: true, save: {version: VERSION, started: true, areas: {1: area()}, shells: 5, w: know(['苹果', '谢谢', '你好', '再见'])}});
  const tick = () => new Promise(r => setImmediate(r));
  game.run("mode = 'play'; globalThis.__said = []; globalThis.__done = false; gapQ = async () => true; toast = () => {};");
  game.run("{ const sd = showDialog; showDialog = (who, line, o) => { __said.push(line.t.join('')); return sd(who, line, o); }; }");
  game.run(`buy(${APPLE()}, speaker('boss')).then(() => { __done = true; })`);
  await tick();
  const box = game.el('#talk');
  assert.equal(box.querySelector('.ask').textContent, 'The 老板 (shop owner) gives you the 苹果 (apple). What do you say?');
  assert.ok(box.querySelector('.replyto .portrait'), 'his face');
  assert.ok(box.querySelector('.replyto .gift'), 'and what he gives you');
  box.querySelectorAll('.reply').find(b => b.querySelector('.rzh').textContent === '谢谢').click();
  await tick();
  game.run('pressA()'); await tick();
  assert.deepEqual(get(game, '__said'), ['谢谢！', '不客气！'], 'you thank him, and he says you’re welcome');
  game.run('pressA()'); await tick();
  assert.equal(game.run('__done'), true);
});

test('the 老板 sells 苹果 as food, and keeps selling it after the headband', () => {
  const apple = get(base, APPLE());
  assert.ok(apple && apple.eat && apple.price === 2, '苹果 should be food that costs 2');
  assert.equal(get(base, 'FOOD["苹果"].carry'), 3, 'you can carry 3');
  assert.equal(apple.sentence, '我 要 苹果');
  const game = play({areas: {1: area({bought: ['头带']})}});
  assert.deepEqual(get(game, 'forSale().map(i => i.item)'), ['苹果']);
});

test('buying a 苹果 costs 2 shells and puts it in your bag', async () => {
  const game = play({areas: {1: area()}, shells: 5, w: {'苹果': {lv: 1, due: 0, ok: 0}}});
  assert.equal(await buyIt(game, APPLE()), true);
  const s = get(game, 'S');
  assert.equal(s.shells, 3);
  assert.deepEqual(s.bag, {'苹果': 1});
  assert.deepEqual(s.areas[1].bought, [], 'food isn\'t "bought" for good, so it stays for sale');
  assert.equal(s.w['苹果'].used, 1, 'asking for it with 我要苹果 counts as using the word');
  assert.equal(s.w['苹果'].lv, 1, 'it reaches Used once you can read it too');
});

test('you can carry 3 苹果, and need 2 shells for each', async () => {
  const full = play({areas: {1: area()}, shells: 9, bag: {'苹果': 3}});
  assert.equal(await buyIt(full, APPLE()), false);
  assert.equal(get(full, 'S').shells, 9);
  const poor = play({areas: {1: area()}, shells: 1});
  assert.equal(await buyIt(poor, APPLE()), false);
  assert.deepEqual(get(poor, 'S').bag, {});
});

test('eating takes away one wrong answer, never the right one', () => {
  const game = play({bag: {'苹果': 2}});
  assert.equal(get(game, "foodThat('helps')"), '苹果');
  assert.equal(get(play({bag: {}}), "foodThat('helps') || null"), null, 'nothing to eat with an empty bag');
  for (let i = 0; i < 50; i++){
    const gone = game.run('wrongToEat(3, 1)');
    assert.ok(gone === 0 || gone === 2, `took away option ${gone}`);
  }
});

test('a version 7 save is converted with an empty bag', () => {
  const game = loadGame({save: {version: 7, started: true, shells: 4, areas: {1: area({bought: ['头带']})}}});
  const s = get(game, 'S');
  assert.equal(s.version, VERSION);
  assert.deepEqual(s.bag, {});
  assert.deepEqual(s.areas[1].bought, ['头带']);
  assert.ok(game.storage.get('xiaohouzi-v2-backup-v7'), 'a copy of the version 7 save is kept');
});

test('the shop shows a card for each thing: its picture, Chinese, pinyin, English and price', async () => {
  const game = loadGame({dom: true, save: {version: VERSION, started: true, shells: 5, areas: {1: area()}, w: {'老板': {lv: 1, due: 0, ok: 0}}}});
  game.run("mode = 'play'; showDialog = async () => {}; shop(speaker('boss'))");
  await new Promise(r => setImmediate(r));
  const sheet = game.el('#sheet'), cards = sheet.querySelectorAll('.shopitem');
  assert.equal(cards.length, get(game, 'forSale().length'));
  const apple = cards.find(c => c.querySelector('.szh').textContent === '苹果');
  assert.ok(apple.querySelector('.spic .pix'), 'its pixel picture');
  assert.equal(apple.querySelector('.spy').textContent, 'píngguǒ');
  assert.equal(apple.querySelector('.sen').textContent, 'apple', 'and its English');
  assert.match(apple.querySelector('.sprice').innerHTML, /<img class="money"[^>]*> 2/, 'its price, with the pixel shell');
  assert.ok(!sheet.innerHTML.includes('🐚'), 'no emoji anywhere on the card');
});

test('the money symbol is a pixel shell, in cards and messages', () => {
  const game = loadGame({dom: true});
  game.run("openCard('<p>+3 🐚</p>')");
  assert.match(game.el('#sheet').innerHTML, /<p>\+3 <img class="money"/);
});

test('the speaker on buttons is a pixel loudspeaker, not an emoji', () => {
  const game = loadGame({dom: true});
  game.run("openCard('<button>🔊 Hear it</button>')");
  assert.match(game.el('#sheet').innerHTML, /<button><img class="speakericon"[^>]*> Hear it<\/button>/);
});

test('the game’s icons are pixel art: every emoji the game shows has a pixel icon', () => {
  const game = loadGame({dom: true});
  game.run("openCard('<p class=\"label\">⭐ New word to learn</p><p>♥ ⚙ ⛰️</p>')");
  const html = game.el('#sheet').innerHTML;
  assert.equal((html.match(/<img class="icon"/g) || []).length, 3, 'the star, the cog and the mountains');
  assert.match(html, /<img class="heart on"/, 'and ♥ is the pixel heart');
  assert.doesNotMatch(html, /\p{Extended_Pictographic}/u, 'no emoji left');
  // Every emoji in the game's code and content (not in comments, nor the word bank's, which only mark a word as
  // having a picture) has a pixel icon: the shell, the speaker, the heart or one of ICONS.
  // (The D-pad's arrows are drawn by css/game.css, not ◀ and ▶, which a phone can show as emoji.)
  const known = new Set(['🐚', '🔊', '♥', ...JSON.parse(game.run('JSON.stringify(Object.keys(ICON_KEYS))'))]);
  const files = [...fs.readdirSync(path.join(ROOT, 'js')).map(f => 'js/' + f), 'content/flower-fruit-mountain.js', 'index.html'];
  for (const f of files){
    fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').forEach((line, i) => {
      const code = line.replace(/^\s*\/\/.*$/, '').replace(/\s\/\/\s.*$/, '').replace(/<!--.*?-->/g, '');
      for (const m of code.matchAll(/\p{Extended_Pictographic}/gu))
        assert.ok(known.has(m[0]), `${f}:${i + 1} shows ${m[0]}, which has no pixel icon (draw one in tools/draw-pictures.js)`);
    });
  }
  game.run("fullscreenHTML = () => '<button class=\"linkbtn\">⛶ Play full screen</button>'; titleText()");   // (as on a phone's browser)
  assert.doesNotMatch(game.el('#titleText').innerHTML, /\p{Extended_Pictographic}|⛶/u, 'the title screen’s icons are pixel art too');
});

// The 老板's new shop at the home ground (29 October 2026): with the school's flowers planted (you know three colours by
// then), he comes up from the meadow, by the way in; talk to him, and the troop builds his shop there as you watch. It
// sells headbands in every colour you know (我要蓝色的头带, the colour missing), peaches as well as apples, honey once the
// bees make it, and bait once you can fish. Your monkey wears one headband at a time, in its colour.
const COLOURED = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', schoolFlowers: true, gate: true, climb: 4, boar: 1, story: true, cave: 6,
  count: 3, home: 2, build: 2, wood: 'done', stones: 'done', school: 2, feast: 1, bought: ['头带']};
const seen = ws => Object.fromEntries(ws.map(w => [w, {lv: 1, due: 0, ok: 2}]));
function homeGame(area = {}, more = {}){
  const g = loadGame({dom: true, save: {version: VERSION, started: true, areas: {1: {...COLOURED, ...area}}, pos: {place: 'homeGround', x: 7, y: 13, dir: 'left'},
    wardrobe: {owned: ['头带'], wearing: ['头带']}, ...more, w: {...seen(['老板', '头带', '戴', '红色', '黄色', '白色', '我', '要', '谢谢', '不客气', '桃子', '苹果']), ...more.w}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__sounds = []");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async (w, o = {}) => { __notes.push('card: ' + w); }; infoBox = async () => {}");
  g.run("showDialog = async (who, line) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }; replyWith = async () => true");
  g.run("gapQ = async o => { __said.push('gap: ' + o.t.join('') + ' (' + o.gap + (o.wrong ? ' or ' + o.wrong.join(' ') : '') + ')'); return true; }");
  g.run("for (const k of ['tock', 'fanfare']) SFX[k] = () => { __sounds.push(k); }; placePlayer()");
  return g;
}
async function settle(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); } await p; }

test('with the school’s flowers planted, the 老板 comes up to the home ground, and the troop builds his shop by the way in as you watch', async () => {
  const g = homeGame({shop: 0});
  assert.deepEqual(get(g, "[ALL_NPCS.find(n => n.id === 'boss')].map(n => [n.place, n.x, n.y])[0]"), ['meadow', 11, 16], 'still at his stall in the meadow');
  await settle(g, 'runEvents()');
  assert.equal(get(g, 'here().shop'), 1);
  assert.match(get(g, '__notes').join(' '), /The 老板 \(shop owner\) has come up from the meadow! He wants a new shop at the home ground\./);
  assert.deepEqual(get(g, "[ALL_NPCS.find(n => n.id === 'boss')].map(n => [n.place, n.x, n.y])[0]"), ['homeGround', 7, 8], 'by the way in');
  assert.equal(g.run("(AREA.bubbles.boss.find(b => matches(b.if)) || {}).show"), '!');
  assert.deepEqual(get(g, "getTasks().filter(t => /老板/.test(t.text)).map(t => [t.text, t.target])"), [['The 老板 (shop owner) has come up to the home ground: go and see him, by the way in from the waterfall', [7, 8]]], 'a task, its arrow at him');
  assert.equal(g.run('tileAt(5, 7).look'), 'grass', 'open grass till then');
  await settle(g, 'interact(7, 8).then(runEvents)');
  assert.deepEqual(get(g, '__said'), ['boss: 我来了！', 'boss: 这里很好！', 'boss: 太好了！'], 'here I am! it’s nice here! (and, once it’s built) great!');
  assert.deepEqual([get(g, 'here().shop'), g.run('tileAt(5, 7).look'), g.run('tileAt(7, 7).look')], [3, 'shop', 'sign'], 'his shop, with its sign');
  assert.deepEqual(get(g, "mapObjects().filter(o => o.look === 'shop').map(o => [o.x, o.y, o.w, o.h])"), [[4, 7, 3, 2]], 'one big object, three squares by two');
  assert.equal(g.run('OBJECT_STAGES.shop'), 4, 'set up in four pieces: posts and a woven back, a counter, a striped roof, and what he sells');
  assert.ok(get(g, '__sounds').filter(s => s === 'tock').length >= 8, 'stakes round its plot, then each piece, with a knock');
  assert.ok(get(g, "areaChecklist().find(([t]) => /new shop/.test(t))")[1], 'on the checklist, ticked off');
  g.run("S.pos = {place: 'meadow', x: 9, y: 17, dir: 'up'}; setPlace('meadow')");
  assert.equal(g.run('tileAt(9, 16).look'), 'stallEmpty', 'his old stall in the meadow, empty');
});

test('his shop sells a headband in each colour you know, asked for with its colour missing: 我要蓝色的头带', async () => {
  const g = homeGame({shop: 3}, {shells: 30, w: seen(['蓝色'])});
  const sale = get(g, 'forSale().map(i => [i.item, asSaid(i).zh, asSaid(i).en, asSaid(i).pic])');
  assert.deepEqual(sale.map(([item]) => item), ['苹果', '桃子', '黄色 的 头带', '白色 的 头带', '蓝色 的 头带'],
    'food first; then a headband in each colour you know, but the red one you have (honey and bait come later)');
  assert.deepEqual(sale[4].slice(1), ['蓝色的头带', 'blue headband', '蓝色 的 头带'], 'called by its colour, with its own picture');
  assert.equal(g.run("(AREA.bubbles.boss.find(b => matches(b.if)) || {}).show"), '?', 'a ? over him: you can afford one');
  await settle(g, "buy(forSale().find(i => i.colour === '蓝色'), '')");
  assert.ok(get(g, '__said').includes('gap: 我要蓝色的头带 (蓝色 or 红色 黄色 白色 黑色 绿色 棕色 橙色 粉色)'), 'the colour missing, the other colours the wrong answers (those you know: gapQ)');
  assert.deepEqual([get(g, 'S.shells'), get(g, 'here().bought'), get(g, 'S.wardrobe')], [20, ['头带', '蓝色 的 头带'], {owned: ['头带', '蓝色 的 头带'], wearing: ['蓝色 的 头带']}],
    'ten shells; you take the red one off and tie the blue one on');
  assert.equal(g.run('headband()'), g.run("BAND['蓝色']"), 'your monkey’s headband is blue');
  assert.ok(get(g, '__notes').includes('You tie on the blue 头带 (headband). It suits you!'));
  assert.ok(!get(g, "forSale().some(i => i.item === '蓝色 的 头带')"), 'one of each');
  g.run('putOn("头带")');
  assert.deepEqual(get(g, 'S.wardrobe.wearing'), ['头带'], 'putting the red one back on takes the blue one off: one at a time');
  assert.equal(g.run('headband()'), g.run("BAND['红色']"));
  assert.deepEqual(get(g, "COLOUR_SENTENCES().filter(c => /蓝色/.test(c.zh))"), [{zh: '我 要 蓝色 的 头带', en: 'I want the blue headband.'}, {zh: '我 戴 蓝色 的 头带', en: 'I wear my blue headband.'}],
    'every colour’s sentences, for the voices and CHINESE.md');
  const saved = loadGame({save: {version: VERSION, started: true, wardrobe: {owned: ['头带', '蓝色 的 头带', '紫色 的 头带'], wearing: ['蓝色 的 头带']}}});
  assert.deepEqual(get(saved, 'S.wardrobe'), {owned: ['头带', '蓝色 的 头带'], wearing: ['蓝色 的 头带']}, 'a save keeps its coloured headbands (and only what there is)');
});

test('at the home ground he sells peaches too, and honey once the bees make it', () => {
  const g = homeGame({shop: 3, bees: 11});
  assert.deepEqual(get(g, "forSale().filter(i => i.eat).map(i => [i.item, i.price])"), [['苹果', 2], ['桃子', 2], ['蜂蜜', 4]]);
  assert.deepEqual(get(homeGame({shop: 0}), "forSale().filter(i => i.eat).map(i => i.item)"), ['苹果'], 'just apples at his stall in the meadow');
});
