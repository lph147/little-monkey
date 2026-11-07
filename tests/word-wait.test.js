// New words, spaced out at school (decided 30 October 2026, after measuring the game's pacing; only at school since 7
// November 2026, after playing it: everywhere else it made the story too slow). After any new word, the next one the
// teacher gives you waits till you've answered 4 more questions, anywhere (the area's wordGap): talk to him sooner, and
// he first offers a quick word game, just for practice, then carries on. In the prologue, the story has practice of
// its own: the thirsty monkey's word game once you've brought him water, the old monkey checking the meadow's five
// words before the rocks roll away, and a word game with him before the troop makes you king.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const KNOWN = ['石头', '你好', '山', '花', '草', '树', '桃子', '苹果', '水果', '动物', '水', '河', '鱼', '鸟', '猴子', '朋友', '我', '要', '吃', '喝', '桌子', '碗', '家',
  '有', '没有', '谢谢', '不客气', '没关系', '木头', '学校', '老师', '同学', '四', '五', '六', '红色', '黄色', '白色'];
function game(area, pos, more = {}){
  const w = Object.fromEntries(KNOWN.map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 32, started: true, turn: 100, areas: {1: area}, pos, ...more, w: {...w, ...more.w}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__notes = []; globalThis.__said = []; globalThis.__games = []; globalThis.__play = true");
  g.run("showNarration = async t => { __notes.push(t); }; toast = t => { __notes.push(t); }; showNotice = async w => { __notes.push('card: ' + w); setSeen(w); }");
  g.run("showDialog = async (who, line) => { __said.push((who.match(/data-id=\"([^\"]*)\"/) || [])[1] + ': ' + line.t.join('')); }; replyWith = async best => { __said.push('player: ' + best); return true; }");
  g.run("confirmBox = async (who, html) => { __notes.push('ask: ' + html.replace(/<[^>]*>/g, '')); return __play; }");
  g.run("encounter = async foe => { __games.push([foe.id, foe.questions || 3, !!foe.practice]); for (let i = 0; i < (foe.questions || 3); i++) reviewed('山', true); return true; }");
  g.run("storyScene = async () => {}; SFX.encounter = SFX.fanfare = SFX.right = SFX.rumble = () => {}");
  g.run("globalThis.__boxes = []; infoBox = async (who, html) => { __boxes.push(html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim()); }");   // (a part of the story's card: tests/parts-area1.test.js)
  g.run('placePlayer()');
  return g;
}
async function play(g, code){   // runs code in the game and waits for it, letting its timers run
  let done = false; const p = Promise.resolve(g.run(code)).then(() => { done = true; });
  for (let i = 0; i < 400 && !done; i++){ await new Promise(r => setImmediate(r)); g.flush(); }
  await p;
}
const talk = (g, id) => play(g, `talk(ALL_NPCS.find(n => n.id === '${id}'))`);

test('at school, a new word waits for 4 questions after the last one: till then, the teacher offers a quick word game first, then carries on', async () => {
  const g = game({chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2, build: 2, school: 1, wordTurn: 99}, {place: 'school', x: 7, y: 3, dir: 'up'}, {w: {'老师': {lv: 0}}});
  assert.equal(get(g, 'wordLeft()'), 3, 'one question answered since your last new word: 3 to go');
  g.run('__play = false');
  await talk(g, 'elder');
  assert.match(get(g, '__notes').join(' '), /ask: Something new is coming! But first, a few words to practise\. Play a quick word game\?/);
  assert.deepEqual(get(g, '[__games, lvl("老师"), here().school]'), [[], 0, 1], 'Not now: nothing new, and the class waits');
  g.run('__play = true; __notes.length = 0');
  await talk(g, 'elder');
  assert.deepEqual(get(g, '__games'), [['elder', 3, true]], 'a word game, just for practice, as long as what’s left');
  assert.ok(get(g, '__notes').includes('card: 老师'), 'then on to the new word: teacher (老师)');
  assert.equal(get(g, 'wordLeft()'), 4, 'and the next new word at school waits 4 questions after this one');
});

test('anywhere but school, a new word never waits: no quick word game first (decided 7 November 2026, after playing it: it made the story too slow)', async () => {
  const g = game({chapter: 1, elder: 2, gate: true, home: 2, build: 2, school: 2, feast: 2, tableware: 1, wordTurn: 99}, {place: 'homeGround', x: 5, y: 9, dir: 'up'});
  assert.equal(get(g, 'wordLeft()'), 3, 'one question answered since your last new word');
  g.run('__play = false');
  await talk(g, 'big');
  assert.ok(!get(g, '__notes').some(n => /^ask: Something new/.test(n)), 'no quick word game offered');
  assert.deepEqual(get(g, '__games'), []);
  assert.ok(get(g, '__notes').includes('card: 筷子'), 'the big monkey goes straight on to his chopsticks (筷子)');
  assert.equal(get(g, 'here().tableware'), 2);
});

test('with 4 questions answered since your last new word, there’s no word game: the character carries straight on', async () => {
  const g = game({chapter: 1, elder: 2, hungry: 'done', thirsty: 'done', gate: true, climb: 4, boar: 1, story: true, cave: 6, count: 3, home: 2, build: 2, school: 1, wordTurn: 96}, {place: 'school', x: 7, y: 3, dir: 'up'}, {w: {'老师': {lv: 0}}});
  assert.equal(get(g, 'wordLeft()'), 0);
  await talk(g, 'elder');
  assert.deepEqual(get(g, '__games'), []);
  assert.ok(get(g, '__notes').includes('card: 老师'));
});

test('a game from before this (no wordTurn yet) never waits; and only the school’s parts wait now, each teaching a new word', async () => {
  const g = game({chapter: 1, elder: 2, gate: true, home: 2, build: 2, school: 1}, {place: 'school', x: 7, y: 3, dir: 'up'});
  assert.equal(get(g, 'wordLeft()'), 0);
  const parts = get(g, "Object.entries(AREA.talk).flatMap(([id, ps]) => ps.filter(p => p.waits).map(p => id))");
  assert.deepEqual(parts.sort(), ['elder', 'elder', 'playful'], 'the parts that wait: the teacher (老师), his news in class (有), and 同学');
  assert.ok(get(g, "Object.values(AREA.talk).flat().filter(p => p.waits).every(p => JSON.stringify(p.if).includes('school') && JSON.stringify(p.do).includes('newWord'))"), 'each at school, teaching a new word');
  assert.ok(!get(g, "AREA.events.some(e => e.if && 'wordReady' in e.if) || Object.values(AREA.talk).flat().some(p => p.if && 'wordReady' in p.if)"), 'and nothing waits for practice before it happens');
});

test('the thirsty monkey: bring him water, and he wants to play a word game, with 2 shells the first time you win', async () => {
  const g = game({elder: 2, hungry: 'done', thirsty: 'asked', holding: {thirsty: '水'}}, {place: 'meadow', x: 2, y: 11, dir: 'down'}, {shells: 0});
  g.run('gapQ = async () => true');
  await talk(g, 'thirsty');
  assert.equal(get(g, 'here().thirsty'), 'done');
  assert.deepEqual(get(g, '__games'), [['thirsty', 3, false]], 'his word game, straight after');
  assert.deepEqual(get(g, '[here().thirstyGame, S.shells > 0]'), [2, true]);
  const g2 = game({elder: 2, hungry: 'done', thirsty: 'done', thirstyGame: 0}, {place: 'meadow', x: 2, y: 11, dir: 'down'});
  assert.equal(g2.run("(AREA.bubbles.thirsty.find(b => matches(b.if)) || {}).show"), '!', 'Not now, and he has a ! till you’ve played');
});

test('the old monkey checks the meadow’s five words once you know them, and the rocks wait for it', async () => {
  const g = game({elder: 2, hungry: 'done', thirsty: 'done'}, {place: 'meadow', x: 7, y: 2, dir: 'up'}, {met: ['rabbit', 'sheep', 'squirrel', 'goat']});
  assert.deepEqual(get(g, 'getTasks().map(t => t.text)'), ['Show the old monkey the words for the meadow']);
  assert.equal(g.run("(AREA.bubbles.elder.find(b => matches(b.if)) || {}).show"), '!');
  await play(g, 'runEvents()');
  assert.equal(get(g, 'here().gate'), false, 'the rocks wait');
  g.run("globalThis.__matched = null; matchWords = async words => { __matched = words; return new Set(); }");
  await talk(g, 'elder');
  assert.deepEqual(get(g, '__matched.slice().sort()'), ['山', '树', '河', '鱼', '鸟'].sort(), 'just the meadow’s five words');
  assert.equal(get(g, 'here().meadowCheck'), 1);
  await play(g, 'runEvents()');
  assert.equal(get(g, 'here().gate'), true, 'and then the rocks roll away');
  assert.match(get(g, '__boxes').join(' '), /^Part 2 Up the river/, 'the story’s next part begins');
  assert.deepEqual(get(g, 'getTasks().map(t => t.id)').filter(t => t === 'meadowCheck'), [], 'a game already past the rocks is never asked');
});

test('counting the troop in: one monkey after another (一, 二, 三), then one matching game on the three; then becoming king needs no word game first (3 November 2026)', async () => {
  const g = game({elder: 2, gate: true, climb: 4, story: true, cave: 5, count: 0}, {place: 'cave', x: 6, y: 10, dir: 'up'});
  g.run("globalThis.__matched = null; matchWords = async words => { __matched = words; for (const w of words) reviewed(w, true); return new Set(); }");
  g.run('STEPS.chapter = async s => { here().chapter = s.chapter; };');   // (its card: tests/story.test.js)
  await talk(g, 'elder');
  assert.equal(get(g, 'here().count'), 3, 'all three in one go');
  assert.deepEqual(['一', '二', '三'].map(w => get(g, `__notes.includes('card: ${w}')`)), [true, true, true], 'each with its own card');
  assert.deepEqual(get(g, '__matched.slice().sort()'), ['一', '三', '二'].sort(), 'then matching just the three numbers');
  assert.deepEqual(get(g, '__games'), [], 'no word games between the monkeys, and none before becoming king');
  assert.ok(get(g, '__notes').includes('card: 王'), 'and he goes straight on: they make you king (decided 6 November 2026: you were talking to him already)');
  assert.deepEqual([get(g, 'here().chapter'), get(g, 'here().home')], [1, 1], 'and on into chapter 1: he wants to see the new home ground with you');
});

test('too early to play a word game (fewer than 4 words with pictures), and nothing waits', async () => {
  const g = game({chapter: 1, elder: 2, gate: true, home: 2, build: 2, school: 2, feast: 2, tableware: 1, wordTurn: 100}, {place: 'homeGround', x: 5, y: 9, dir: 'up'});
  g.run("for (const w of ORDER) if (WORDS[w].pic && !['山', '树', '花'].includes(w)) rec(w).lv = 0");
  assert.equal(g.run('canEncounter()'), false);
  await talk(g, 'big');
  assert.deepEqual(get(g, '__games'), []);
  assert.ok(get(g, '__notes').includes('card: 筷子'));
});
