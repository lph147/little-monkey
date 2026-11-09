// The old monkey's scroll (the polish plan, agreed 8 November 2026): the Word Scroll given a story. The old monkey gives you
// a very old scroll as he checks your first words, so they're the first pictures you see come back: long ago someone drew
// everything on the mountain in it, with its name, but the pictures have faded, and every word you catch brings one back. A
// full page (one area's words of one kind) earns a red seal and a present, from the old monkey, or in the human world the
// master; the map's close-up says how many words are still to find in each place, with a sun or a moon for those out only
// by day or by night; your friends come to the feast and the party; the master says what the game is about; and your
// game's card shows how full your scroll is, with a gold seal for an area that's full.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knows = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
const NUMBERS = ['一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十'];   // (the numbers page: 两, two of something, too, since 9 November 2026)
const CH1 = {elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, story: true, chapter: 1, cave: 6, count: 3, home: 2};
function game(save = {}, area = 1){
  const g = loadGame({dom: true, save: {version: 38, started: true, area, w: knows(['石头', '山']), scroll: {has: true, sealed: []}, ...save}});
  g.run("mode = 'play'; placePlayer(); say = () => {}; globalThis.__said = []; toast = m => { __said.push(m); }");
  g.run("globalThis.__lines = []; showDialog = async (who, line) => { __lines.push(line.t.join('')); }; showNarration = async t => { __said.push(t); }; showNotice = async w => { setSeen(w); }");
  const sheet = g.el('#sheet');
  const play = async code => {   // runs code in the game and waits for it, pressing OK on each card that comes up
    let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
    for (let i = 0; i < 800 && !done; i++){
      await new Promise(r => setImmediate(r)); g.flush();
      const ok = sheet.querySelector('[data-a=ok]'); if (ok && i % 20 === 19) ok.click();
    }
    await p;
  };
  return {g, run: code => g.run(code), play, sheet, get: expr => JSON.parse(g.run(`JSON.stringify(${expr})`))};
}

test('the old monkey gives you his scroll as he checks your first words: they come back first, the rest still faded', async () => {
  const {run, play, get, sheet} = game({w: knows(['石头', '你好', '山', '树', '花', '草']), areas: {1: {elder: 1}}, pos: {place: 'meadow', x: 8, y: 9, dir: 'up'}, scroll: {has: false, sealed: []}});
  run("STEPS.match = async () => {}");   // (you match your words to their pictures: tests/meadow.test.js)
  assert.equal(get('S.scroll.has'), false, 'not yet');
  run("globalThis.__card = null; const givenWas = scrollGiven; scrollGiven = who => { const p = givenWas(who); __card = sheet.innerHTML; return p; }");
  run("talk(NPCS.find(n => n.id === 'elder'))");
  for (let i = 0; i < 100 && !get('__card'); i++){ await new Promise(r => setImmediate(r)); }
  assert.equal(get('S.scroll.has'), true, 'it’s yours, kept in the save');
  assert.match(sheet.textContent, /gives you a very old scroll/);
  assert.match(sheet.textContent, /the pictures have faded\. Every word you catch brings one back!/);
  const back = get("['石头', '你好', '山', '树', '花', '草'].filter(w => WORDS[w].pic).length");
  assert.equal(sheet.querySelectorAll('.oldscroll .card.back').length, back, 'your first words, coming back (those with pictures)');
  assert.ok(sheet.querySelectorAll('.oldscroll .card').length > back, 'among others, still faded');
  assert.equal(sheet.querySelectorAll('.oldscroll .card.back .c.faded').length, back, 'faded at first');
  for (let i = 0; i < 400 && sheet.querySelectorAll('.oldscroll .card.back .c.faded').length; i++){ await new Promise(r => setImmediate(r)); }
  await play('0');
  assert.ok(get('__lines').includes('太好了！'), 'Great!, then the scroll');
});

test('in the Word Scroll, a word you haven’t caught shows its picture faded, once you have the old monkey’s scroll; before, a ？', () => {
  const before = game({areas: {1: {elder: 1}}, scroll: {has: false, sealed: []}});
  before.run("openScroll(null, 0, 'nature')");
  assert.equal(before.sheet.querySelectorAll('.card .c.faded').length, 0);
  const after = game({areas: {1: {elder: 2}}});
  after.run("openScroll(null, 0, 'nature')");
  assert.ok(after.sheet.querySelectorAll('.card.unseen .c.faded').length >= 5, 'faded pictures');
  assert.match(after.sheet.querySelector('.cathead').textContent, /Nature 2\/13/);
});

test('an old game past the first check has the scroll; one still finding its first words gets it from the old monkey', () => {
  const past = loadGame({save: {version: 37, started: true, w: {}, areas: {1: {elder: 2}}}});
  assert.deepEqual(JSON.parse(past.run('JSON.stringify(S.scroll)')), {has: true, sealed: []});
  const early = loadGame({save: {version: 37, started: true, w: {}, areas: {1: {elder: 1}}}});
  assert.deepEqual(JSON.parse(early.run('JSON.stringify(S.scroll)')), {has: false, sealed: []});
  const area2 = loadGame({save: {version: 37, started: true, area: 2, w: {}}});
  assert.equal(area2.run('S.scroll.has'), true, 'a game in the human world has it');
});

test('a full page: the old monkey has a ! and a task; he stamps it with a red seal, and gives you something for it', async () => {
  const {run, play, get, sheet} = game({w: knows(['石头', '山', ...NUMBERS]), areas: {1: CH1}, pos: {place: 'homeGround', x: 10, y: 7, dir: 'up'}});
  assert.deepEqual(get('sealsWaiting().map(pageKey)'), ['1:numbers'], 'the numbers page is full');
  assert.ok(get('getTasks().some(t => t.id === "seal" && /A page of your scroll is full: show it to the old monkey/.test(t.text))'), 'a task says so');
  run("globalThis.__bub = null; const n = NPCS.find(n => n.id === 'elder'); __bub = sealFor(n)");
  assert.equal(get('__bub'), true, 'a ! over him');
  run("openScroll(null, 0, 'numbers')");
  assert.match(sheet.textContent, /Full! Show it to the old monkey, for a red seal\./);
  run("closeCard(); globalThis.__seal = null; const sealWas = sealCard; sealCard = (p, who) => { const r = sealWas(p, who); __seal = sheet.textContent; return r; }");
  run("STEPS.goOn = async () => {}");   // (then he goes on to his news, if he has some)
  await play("talk(NPCS.find(n => n.id === 'elder'))");
  assert.match(get('__seal'), /The numbers page is full! The old monkey stamps it with a red seal: 好 \(hǎo\), good\./);
  assert.deepEqual(get('S.scroll.sealed'), ['1:numbers'], 'sealed, kept in the save');
  assert.ok(get('__lines').includes('太好了！'), 'Great!');
  assert.ok(get('__said').some(m => /And 11 🐚 for you!/.test(m)) && get('S.shells') >= 11, 'a page of eleven (两 too) without a snack you know: shells, one a word');
  assert.deepEqual(get('sealsWaiting()'), []);
  assert.equal(get('sealFor(NPCS.find(n => n.id === "elder"))'), false, 'no more !');
  run("openScroll(null, 0, 'numbers')");
  assert.ok(sheet.querySelector('.cathead .seal'), 'the page shows its red seal');
});

test('what a full page earns: something to wear for a big page, a snack for a middling one, shells for a small one', () => {
  const {get} = game({w: knows(['石头', '山', '红色', '蓝色', '桃子']), areas: {1: CH1}});
  assert.deepEqual(get("scrollGift(scrollPages().find(p => p.cat === 'animals'))[0]"), {give: '红色 的 头带'.replace('红色 的 ', '')}, 'thirty animals: a headband, in a colour you know and haven’t got (the red one, 头带)');
  assert.deepEqual(get("scrollGift(scrollPages().find(p => p.cat === 'numbers'))"), [{bag: '桃子', note: 'And a {桃子} for your bag!'}], 'eleven numbers: a snack you know');
  assert.deepEqual(get("scrollGift(scrollPages().find(p => p.cat === 'places'))"), [{shells: 5, note: 'And 5 🐚 for you!'}], 'five places: shells');
  const owned = game({w: knows(['石头', '山', '红色', '蓝色']), areas: {1: CH1}, wardrobe: {owned: ['头带'], wearing: []}});
  assert.equal(owned.get("scrollGift(scrollPages().find(p => p.cat === 'animals'))[0].give"), '蓝色 的 头带', 'one you haven’t got');
});

test('in the human world the master seals a full page; at home, the old monkey; on the way there, nobody yet', () => {
  const w = knows(['什么', '谁', '哪里']);
  const prologue = game({w, areas: {2: {chapter: 0}}}, 2);
  assert.deepEqual(prologue.get('sealsWaiting().map(pageKey)'), ['2:questions'], 'its asking page is full');
  assert.equal(prologue.get('sealer()'), null, 'nobody to seal it yet');
  assert.ok(!prologue.get('getTasks().some(t => /scroll is full/.test(t.text))'), 'so no task');
  prologue.run("openScroll(null, 0, 'questions')");
  assert.match(prologue.sheet.textContent, /Full! It waits for a red seal\./);
  const cave = game({w, areas: {2: {chapter: 1}}}, 2);
  assert.equal(cave.get('sealer().who'), 'master');
  assert.ok(cave.get('getTasks().some(t => t.id === "seal" && /your 师父|your master/.test(t.text))'));
  const home = game({w, areas: {2: {chapter: 2}}}, 2);
  assert.equal(home.get('sealer().who'), 'elder');
});

test('the map’s close-up: how many words are still to find in a place, with a sun or a moon for those out only by day or by night', () => {
  const {run, get, sheet} = game({w: knows(['石头', '山', '树', '花', '草', '河', '鱼', '桃子', '苹果']), areas: {1: CH1}, pos: {place: 'homeGround', x: 10, y: 7, dir: 'up'}, visited: ['meadow']});
  const left = get("stillHere('meadow')");
  assert.deepEqual(left.filter(x => x.time === 'night').map(x => x.w), ['刺猬'], 'the hedgehog, only at night');
  assert.ok(left.some(x => x.w === '羊' && x.time === 'day'), 'the sheep, only by day');
  run("closeUp('meadow')");
  assert.match(sheet.textContent, new RegExp(`？ ${left.length} more to find here \\(.*only by day, .*1 only at night\\)`));
  assert.equal(get("stillHere('homeGround').some(x => x.w === '蝙蝠')"), true, 'the bat is the home ground’s, where it’s out');
  assert.equal(get("stillHere('cave').some(x => x.w === '蝙蝠')"), false, 'not the cave’s, where it sleeps');
});

test('your friends come to the feast, round the tables; and to the party at home, at the end of the human world', () => {
  const {run, get} = game({w: knows(['石头', '山']), friends: ['rabbit', 'sheep', 'squirrel', 'goat', 'deer', 'bee', 'cow', 'playful'], areas: {1: CH1}});
  assert.equal(get('friendSprites().length'), 7, 'every animal friend (and the cow), not the little monkey');
  run("globalThis.__drawn = 0; const fr = friendsRow; friendsRow = (g, sprs, ...a) => { __drawn += Math.min(22, sprs.length); return fr(g, sprs, ...a); }; drawFeast(5, 1000)");
  assert.equal(get('__drawn'), 7, 'all seven at the feast');
  const a2 = game({w: {}, friends: ['rabbit', 'sheep', 'dog', 'goose', 'child'], areas: {2: {chapter: 2}}}, 2);
  assert.equal(a2.get('friendSprites().length'), 4, 'here and at home long ago, not the people');
  a2.run('SCENE_ART.party(2, 1000)');
  assert.ok(a2.get("AREA.unloading.done.some(s => s.scene === 'party')"), 'the party plays once everything’s back on the tables');
  assert.deepEqual(a2.get("AREA.scenes.party.captions.map(c => c.zh)"), ['我们 有 很多 朋友 ！']);
});

test('the master says what the game is about: to change into something, you have to know its name', () => {
  const g = loadGame({save: {version: 38, started: true, area: 2, w: {}}});
  const steps = JSON.parse(g.run("JSON.stringify(AREA.talk.master.find(p => p.if && p.if.riddle === 2).do)"));
  const i = steps.findIndex(s => s.newWord === '变');
  assert.equal(steps[i + 1].say, 'knowName', 'straight after 变');
  assert.equal(g.run("L.knowName.t.join('')"), '你知道名字，就能变！');
  assert.match(steps[i + 2].message, /To change into something, you have to know its name/);
});

test('your game’s card shows how full your scroll is, with a gold seal for an area that’s full', () => {
  const {g, get} = game({w: knows(['石头', '山', ...NUMBERS])});
  const sum = get('summaryOf(S, 1).scroll');
  assert.equal(sum.length, 1);
  assert.equal(sum[0].found, 13);
  assert.ok(sum[0].of > 100);
  g.run('slotCard(1)');
  assert.ok(g.el('#sheet').querySelector('.scrollfill .sf .bar'), 'a bar for the area');
  assert.ok(!g.el('#sheet').querySelector('.goldseal'), 'no gold seal till it’s full');
  const all = loadGame({dom: true, save: {version: 38, started: true, w: {}}});
  all.run("for (const w of Object.keys(WORD_BANK).filter(w => WORD_BANK[w].area === 1)) S.w[w] = {lv: 1, due: 0, ok: 0}; slotCard(1)");
  assert.ok(all.el('#sheet').querySelector('.scrollfill .goldseal'), 'every word found: a gold seal');
});
