// Sorry, it doesn't matter, and What do you say? (decided 4 November 2026, after measuring the game's pacing: 对不起 and 没关系
// were the hungry monkey's, in the prologue's busiest moment, and met just once all game; 再见 twice). The hungry monkey no
// longer says sorry, and plays a quick word game before he says which fruit he wants. In chapter 1, the little monkey chasing
// a dragonfly on the hillside bumps into you (对不起, and you reply 没关系), and later your tail knocks over the little
// monkeys' tower of stones (you say 对不起, they say 没关系), each once, as you come right up beside them, and only once
// you've practised since your last new word. The 老板 hears 对不起 when you ask for the wrong thing, and says 没关系; the
// teacher says 再见 after class. And questions on phrases: a moment in plain English, and What do you say?, in monkeys' word
// games and in quick practice.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const VERSION = loadGame().run('SAVE_VERSION');
const CHAPTER_ONE = {chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', flowers: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2,
  build: 1, wood: 'asked', stones: 'asked', woodIn: 1, lookTip: 1, trainee1: 1, trainee2: 1, tower: 2};
const KNOWS = ['石头', '山', '花', '草', '树', '水', '河', '猴子', '朋友', '桃子', '苹果', '水果', '吃', '你好', '谢谢', '不客气'];
const known = (ws, ok = 3) => Object.fromEntries(ws.map(w => [w, {lv: 1, ok, next: 100}]));
function game(area = {}, pos = {place: 'hillside', x: 10, y: 34, dir: 'right'}, more = {}){
  const g = loadGame({dom: true, save: {version: VERSION, started: true, turn: 50, w: known(KNOWS), areas: {1: {...CHAPTER_ONE, ...area}}, pos, ...more}});
  g.run("mode = 'play'; save = () => {}; globalThis.__said = []; globalThis.__notes = []; globalThis.__replies = []; globalThis.__games = []; globalThis.__sounds = []");
  g.run("showDialog = async (who, line) => { __said.push(line.t.join('')); }; showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async w => { __notes.push('card: ' + w); }; infoBox = async () => {}");
  g.run("replyWith = async (best, o = {}) => { __replies.push(best + (o.about ? ' (' + fill(o.about) + ')' : '')); if (lvl(best) === 0) rec(best).lv = 1; return true; }");
  g.run("STEPS.wordGame = async s => { __games.push(s.wordGame.practice ? 'practice' : 'game'); S.turn += s.wordGame.questions || 3; }");
  g.run("for (const k of ['bump', 'clatter']) SFX[k] = () => { __sounds.push(k); }; placePlayer()");
  return g;
}
async function settle(g, code){ let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; }); for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); } await p; }
const npc = id => `NPCS.find(n => n.id === '${id}')`;

// (since 8 November 2026, the gentler prologue, any fruit will do the first time: the wrong one is his second wish's)
const SECOND_WISH = {chapter: 0, gate: false, hungry: 'done', thirsty: 'done', hungryGame: 2, hungry2: 'asked', holding: {hungry2: '桃子'}, wanted: {hungry: '桃子', hungry2: '苹果'}};
test('the hungry monkey: no sorry; bring the fruit he doesn’t want, even just after a new word, and he says which he wants (no quick word game first since 7 November 2026)', async () => {
  const g = game({...SECOND_WISH, wordTurn: 50}, {place: 'meadow', x: 13, y: 7, dir: 'up'});
  assert.ok(!get(g, '!!(AREA.requests.hungry2.wrongReply || AREA.requests.hungry2.wrongAnswer)'), 'no 对不起, and no 没关系');
  await settle(g, `talk(${npc('hungry')})`);
  assert.deepEqual(get(g, '__games'), [], 'no quick word game first, though you’ve just learned 桃子');
  assert.deepEqual(get(g, 'here().wanted'), {hungry: '桃子', hungry2: '苹果'}, 'he wants the apple still');
  assert.deepEqual(get(g, '__said'), ['这是桃子。我要吃苹果！']);
  assert.deepEqual(get(g, '__replies'), [], 'and you don’t say sorry');
  assert.equal(get(g, 'here().holding.hungry2 || null'), null, 'he gives the peach back');
  const later = game({...SECOND_WISH, wordTurn: 40}, {place: 'meadow', x: 13, y: 7, dir: 'up'});
  await settle(later, `talk(${npc('hungry')})`);
  assert.deepEqual(get(later, '__games'), [], 'practised since your last new word: straight on');
});

test('the big monkey’s chopsticks, spoons and seeds never wait for practice (since 7 November 2026: only the school’s new words do)', () => {
  const g = game();
  const waits = get(g, "AREA.talk.big.filter(p => p.waits).map(p => p.do.map(s => s.newWord).filter(Boolean)[0])");
  assert.deepEqual(waits, []);
});

test('on the hillside, the little monkey chasing a dragonfly bumps into you: it says 对不起, and you reply 没关系, the once', async () => {
  const g = game();
  assert.equal(get(g, 'matches({wordReady: true})'), true, 'practised enough since your last new word');
  await settle(g, 'runEvents()');
  assert.deepEqual([get(g, '__sounds'), get(g, '__said'), get(g, '__replies')], [['bump'], ['对不起！'], ['没关系']]);
  assert.match(get(g, '__notes[0]'), /bumps right into you/);
  assert.equal(get(g, 'here().bumped'), 1);
  assert.equal(get(g, "lvl('没关系')"), 1, 'caught');
  g.run('__said.length = 0');
  await settle(g, 'runEvents()');
  assert.deepEqual(get(g, '__said'), [], 'once');
  await settle(g, `talk(${npc('chaser')})`);
  assert.deepEqual(get(g, '__said'), ['你好！'], 'after that, it says hello as before');
  const soon = game({wordTurn: 49});
  await settle(soon, 'runEvents()');
  assert.deepEqual([get(soon, '__said'), get(soon, 'here().bumped')], [['对不起！'], 1], 'even just after a new word: it never waits for practice (since 7 November 2026)');
  const away = game({}, {place: 'hillside', x: 10, y: 30, dir: 'down'});
  await settle(away, 'runEvents()');
  assert.equal(get(away, 'here().bumped'), 0, 'only right beside it');
  const prologue = game({chapter: 0});
  await settle(prologue, 'runEvents()');
  assert.equal(get(prologue, 'here().bumped'), 0, 'not in the prologue');
});

test('at the home ground, your tail knocks over the little monkeys’ tower: you say 对不起, and they say 没关系, the once', async () => {
  const pos = {place: 'homeGround', x: 27, y: 9, dir: 'right'};
  const first = game({}, pos);
  await settle(first, 'runEvents()');
  assert.equal(get(first, 'here().knocked'), 0, 'not before the chaser has bumped into you');
  const g = game({bumped: 1}, pos);
  g.run("globalThis.__toppled = 0; const tp = topple; topple = (...a) => { __toppled++; return tp(...a); }");
  await settle(g, 'runEvents()');
  assert.equal(get(g, '__toppled'), 1, 'down it comes');
  assert.deepEqual(get(g, '__sounds'), ['clatter']);
  assert.deepEqual(get(g, '__replies'), ['对不起 (You’ve knocked over the little monkeys’ tower.)'], 'you say sorry');
  assert.deepEqual(get(g, '__said'), ['没关系！'], 'and they say it doesn’t matter');
  assert.equal(get(g, "lvl('对不起')"), 1, '对不起 caught');
  assert.equal(get(g, 'here().knocked'), 1);
  g.run('__replies.length = 0');
  await settle(g, 'runEvents()');
  assert.deepEqual(get(g, '__replies'), [], 'once');
});

test('topple: the tower’s cycle moves on to its fall, now', () => {
  const g = game();
  const now = 123456;
  g.run(`topple(${now})`);
  assert.equal(get(g, `towerAt(${now}).phase`), 'fall');
  assert.equal(get(g, `towerAt(${now} + TOWER.fall + 10).phase`), 'rest', 'then the stones lie there, and it’s built up again');
});

test('the 老板: once you know 对不起, asking for the wrong thing, you say it, and he says 没关系 before asking again', async () => {
  const shop = {shop: 3, home: 2};
  const knows = more => known([...KNOWS, '老板', '头带', '我', '要', ...more], 2);
  const run = async words => {
    const g = game(shop, {place: 'homeGround', x: 7, y: 9, dir: 'up'}, {shells: 10, w: knows(words)});
    g.run("globalThis.__tries = [false, true]; gapQ = async o => { if (o.seen) o.seen.options = o.options || ['苹果', '桃子', '我']; return __tries.shift(); }");
    await settle(g, "buy(AREA.shop.items.find(i => i.item === '苹果'), speaker('boss'))");
    return g;
  };
  const g = await run(['对不起']);
  assert.deepEqual(get(g, '__replies'), ['对不起 (You asked the 老板 (shop owner) for the wrong thing.)', '谢谢 (The 老板 (shop owner) gives you the 苹果 (apple).)']);
  assert.deepEqual(get(g, '__said'), ['没关系！', '你要什么？', '不客气！'], 'he says it doesn’t matter, then asks again (and, at the end, you’re welcome)');
  const before = await run([]);
  assert.deepEqual(get(before, '__replies').filter(r => /对不起/.test(r)), [], 'not before you know it');
  assert.deepEqual(get(before, '__said'), ['你要什么？', '不客气！']);
});

test('the teacher says 再见 after class, and you reply 再见 (his news first, if he has some now: decided 6 November 2026)', () => {
  const g = game();
  const part = get(g, "AREA.talk.elder.find(p => p.do.some(s => s.lesson))");
  assert.deepEqual(part.do.slice(-4), [{say: 'classEnd'}, {goOn: true}, {say: 'bye'}, {reply: '再见'}]);
});

test('What do you say?: a moment in plain English, three phrases you know in Chinese and pinyin, their English once you’ve answered; it counts', async () => {
  const g = game();
  g.run('closeCard = () => {}');
  assert.equal(get(g, 'askablePhrases().length'), 3, '你好, 谢谢 and 不客气');
  assert.ok(get(g, "PHRASES.every(p => WORDS[p].situation)"), 'every phrase has a moment you’d say it in');
  const p = g.run("phraseQ({phrase: '不客气'}).then(ok => { globalThis.__ok = ok; })");
  for (let i = 0; i < 5; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  const text = g.run('sheet.textContent').replace(/\s+/g, ' ');
  assert.match(text, /What do you say\?\s*You help a friend, and they thank you\./);
  assert.deepEqual(get(g, "[...sheet.querySelectorAll('.opt')].map(o => o.firstChild.textContent).sort()"), ['不客气', '你好', '谢谢'].sort());
  assert.match(text, /bú kèqi/, 'with pinyin');
  const turn = g.run('S.turn');
  g.run("[...sheet.querySelectorAll('.opt')].find(o => o.textContent.startsWith('不客气')).click(); sheet.querySelector('[data-a=next]').click()");
  await p;
  assert.equal(g.run('__ok'), true);
  assert.equal(g.run('S.turn') - turn, 1, 'it counts as practice');
  assert.equal(get(g, "rec('不客气').ok"), 4);
  const few = game({}, undefined, {w: known(['石头', '山', '花', '草', '你好', '谢谢'])});
  assert.equal(get(few, 'phraseToAsk()'), null, 'not till you know three phrases');
});

test('a monkey’s word game asks What do you say? near its end while a phrase needs practice; an animal’s never does', async () => {
  const g = game({}, undefined, {w: {...known(KNOWS), '谢谢': {lv: 4, ok: 0, next: 100}}});
  g.run("globalThis.__qs = []; phraseQ = async o => { __qs.push('phrase: ' + o.phrase); return true; }; pictureQ = async o => { __qs.push(o.word); return true; }; closeCard = () => {}");
  await settle(g, "encounter({id: 'hungry', hz: '猴子', img: '', wild: false, name: NAMES.hungry, practice: true, questions: 4})");
  const qs = get(g, '__qs');
  assert.equal(qs.length, 4);
  assert.equal(qs[2], 'phrase: 谢谢', 'the third of four: the phrase that needs practice');
  const animal = game({}, undefined, {w: {...known(KNOWS), '谢谢': {lv: 4, ok: 0, next: 100}}});
  animal.run("globalThis.__qs = []; phraseQ = async o => { __qs.push('phrase: ' + o.phrase); return true; }; pictureQ = async o => { __qs.push(o.word); return true; }; closeCard = () => {}");
  await settle(animal, "encounter({id: 'rabbit', hz: '兔子', img: '', wild: true, questions: 3})");
  assert.ok(!get(animal, '__qs').some(q => /phrase/.test(q)), 'animals don’t talk about manners');
});
