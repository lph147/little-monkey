// The day going round (js/daynight.js, decided 7 November 2026, the owner's idea): a clock that runs while you're out on
// the map (from chapter 1 on Flower Fruit Mountain, always in the human world), evening, night and dawn; the troop asleep
// in the Water Curtain Cave at night and the human world's streets quieter, anyone you have something to do with staying
// up; sleeping skipping to the next morning, after the day's recap; rain now and then, teaching 雨; and home in autumn in
// Area 2's chapter 2.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const knows = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
const CH1 = {chapter: 1, elder: 2, gate: true, climb: 4, story: true, cave: 6, count: 3, home: 2};
function game(area, progress, pos, save = {}){
  const g = loadGame({dom: true, save: {version: 37, started: true, area, areas: {[area]: progress}, pos, ...save}});
  g.run("mode = 'play'; placePlayer(); globalThis.__notes = []; toast = t => { __notes.push(t); }; showNarration = async t => { __notes.push(t); }");
  return g;
}
const tick = () => new Promise(r => setImmediate(r));
async function play(g, code, click){   // run code, pressing a card's button (click: a selector, or a function choosing one) whenever one's open
  let done = false, failed = null;
  Promise.resolve(g.run(code)).then(() => { done = true; }, e => { failed = e; done = true; });
  for (let i = 0; i < 3000 && !done; i++){
    await tick(); g.flush();
    if (!done && click && !g.run('modal.hidden')){ const sel = typeof click === 'function' ? click(g) : click; if (sel) g.run(`(b => b && b.click())(sheet.querySelector(${JSON.stringify(sel)}))`); }
    if (!done && g.run('!!talkNext')) g.run('talkNext()');
  }
  if (failed) throw failed;
  assert.ok(done, `${code} finishes`);
}
const night = g => { g.run("clockSeen = 'd'; S.clock.t = DAY_MS * NIGHT + 1; clockNews()"); };

test('the clock: off in the prologue, on from chapter 1; it runs only while you’re out on the map, a frame at most a quarter of a second', () => {
  const pro = game(1, {chapter: 0}, {place: 'meadow', x: 7, y: 3, dir: 'up'});
  assert.equal(pro.run('clockOn()'), false, 'the prologue is always day');
  pro.run('tickClock(1000); tickClock(5000)');
  assert.equal(get(pro, 'S.clock.t'), 0);
  const g = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'});
  assert.equal(g.run('clockOn()'), true);
  assert.equal(g.run('dayPart()'), 'day', 'a game starts in the morning');
  g.run('tickClock(1000); tickClock(1100)');
  assert.equal(get(g, 'S.clock.t'), 100, 'a frame goes by');
  g.run('tickClock(9000)');
  assert.equal(get(g, 'S.clock.t'), 350, 'a long pause counts as a quarter of a second, no more');
  g.run("modal.hidden = false; tickClock(9100); modal.hidden = true");
  assert.equal(get(g, 'S.clock.t'), 350, 'never while a card is open');
  for (const [f, part] of [[.5, 'day'], [.7, 'evening'], [.8, 'night'], [.98, 'dawn']]){ g.run(`S.clock.t = DAY_MS * ${f}`); assert.equal(g.run('dayPart()'), part, `${f} of the way through the day: ${part}`); }
  assert.deepEqual(get(g, '[DAY_MS / 60000, DUSK, NIGHT]'), [20, .65, .75], 'a day is 20 minutes: 15 of day, the last 2 of them evening, then 5 of night');
});

test('a day that goes by without sleeping starts today’s record again', () => {
  const g = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'}, {turn: 30, clock: {t: 0, n: 0, turn0: 10, friends0: [], caught: ['山']}});
  g.run('S.clock.t = DAY_MS - 50; clockLast = 1000; tickClock(1200)');
  assert.deepEqual(get(g, '[S.clock.n, S.clock.t, S.clock.turn0, S.clock.caught]'), [1, 150, 30, []]);
});

test('at night the troop sleeps in the Water Curtain Cave, but anyone with a ! or ? stays up; in the morning everyone’s up again', () => {
  const g = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'});
  night(g);
  const asleep = get(g, 'ALL_NPCS.filter(n => n.asleep).map(n => [n.id, n.place, n.x, n.y, n.bed])');
  assert.ok(asleep.length > 10, 'most of the troop goes to bed');
  assert.ok(asleep.every(([, place]) => ['cave', 'gone'].includes(place)), 'in the cave, or further in, out of sight');
  assert.ok(asleep.some(([, place, x, y, bed]) => place === 'cave' && y === 1 && bed), 'some in its stone beds');
  assert.ok(asleep.some(([, place, , , bed]) => place === 'cave' && !bed), 'some curled up on its floor');
  assert.ok(!asleep.some(([, place, x, y]) => place === 'cave' && ((x === 1 && y === 1) || (x === 14 && y === 1))), 'the beds at each end are left for you');
  assert.ok(!get(g, "ALL_NPCS.filter(n => n.asleep).some(n => (AREA.bubbles[n.id] || []).some(b => matches(b.if)))"), 'no-one with a ! or ? is asleep');
  assert.ok(!get(g, "ALL_NPCS.some(n => n.asleep && (n.look || n.flies))"), 'animals stay out');
  g.run('morning()');
  assert.deepEqual(get(g, 'ALL_NPCS.filter(n => n.asleep).map(n => n.id)'), [], 'morning: everyone up');
});

test('someone you’re beside never vanishes in front of you once night has fallen: they go to bed once you’ve gone', () => {
  const g = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'});
  night(g);
  const sleeper = get(g, "ALL_NPCS.find(n => n.asleep && n.home.place === 'homeGround').id");
  g.run(`morning(); placeCharacters(); S.clock.t = DAY_MS * NIGHT + 1; clockSeen = 'n'; placeCharacters()`);   // (night again, but not just falling: re-placed while you're here)
  assert.equal(get(g, `ALL_NPCS.find(n => n.id === '${sleeper}').asleep`), false, 'still up, while you’re in their place');
  g.run("enterPlace('meadow'); enterPlace('homeGround')");
  assert.equal(get(g, `ALL_NPCS.find(n => n.id === '${sleeper}').asleep`), true, 'gone to bed once you’ve left');
});

test('a sleeper is fast asleep; an event where one would speak waits till they’re up', async () => {
  const g = game(1, CH1, {place: 'cave', x: 7, y: 2, dir: 'up'});
  night(g); g.run("enterPlace('cave')");
  const n = get(g, "(n => n && [n.id, n.x, n.y])(NPCS.find(n => n.asleep && n.y === 1))");
  assert.ok(n, 'someone asleep in a bed');
  assert.equal(g.run(`promptFor(${n[1]}, ${n[2]})`), 'Look');
  await play(g, `interact(${n[1]}, ${n[2]})`);
  assert.match(get(g, '__notes').join(' '), /fast asleep/);
  assert.equal(g.run(`speakerAsleep([{say:'hi', by:'${n[0]}'}])`), true);
  assert.equal(g.run("speakerAsleep([{say:'hi', by:'player'}])"), false);
});

test('in the human world people go home at night, but the night market, the teahouse and the boatman stay up; the master’s pupils go indoors', () => {
  const g = game(2, {landed: 1, dressed: 2, back: 1}, {place: 'village', x: 10, y: 10, dir: 'down'});
  night(g);
  const gone = get(g, "ALL_NPCS.filter(n => n.asleep).map(n => n.id)");
  for (const id of ['fruitSeller', 'bunSeller', 'teaKeeper', 'boatman', 'angler']) assert.ok(!gone.includes(id), `${id} stays up`);
  for (const id of ['teller', 'walker2', 'pupil1', 'master', 'senior', 'little1']) assert.ok(gone.includes(id), `${id} goes indoors`);
  assert.ok(get(g, "ALL_NPCS.filter(n => n.asleep).every(n => n.place === 'gone')"), 'out of sight');
  assert.ok(!gone.some(id => ['hungry', 'big', 'elder', 'baby1'].includes(id)), 'the troop at home, hiding, stays where it is till everything’s back on the feast’s tables');
});

test('back home in chapter 2, once everything’s back on the tables, the troop sleeps in the Water Curtain Cave again', () => {
  const g = game(2, {chapter: 2, home2: 1, news: 1, party: 1, homeAgain: 1}, {place: 'ffmHomeGround', x: 13, y: 9, dir: 'down'});
  night(g);
  assert.ok(get(g, "ALL_NPCS.filter(n => n.asleep && n.place === 'ffmCave').length") >= 4);
});

test('the first night teaches 晚上, and the first rain 雨, wherever you are outdoors', async () => {
  const g = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'});
  g.run("globalThis.__cards = []; showNotice = async w => { __cards.push(w); setSeen(w); }; showDialog = async () => {}");
  night(g);
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__cards'), ['晚上']);
  g.run(`morning(); S.clock.t = RAIN_AT(S.clock.n) * DAY_MS + RAIN_FADE`);
  assert.equal(g.run('rainingHere()'), true);
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__cards'), ['晚上', '雨']);
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__cards'), ['晚上', '雨'], 'once each');
});

test('rain: one spell a day, never at night, nor indoors, nor in winter; while it rains, the troop says 下雨了！', () => {
  const g = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'});
  const spells = get(g, `[0, 1, 2, 3, 4, 5].map(n => { S.clock.n = n; const at = RAIN_AT(n); return [at, (S.clock.t = at * DAY_MS + RAIN_MS / 2, rainNow()), (S.clock.t = at * DAY_MS - 1, rainNow())]; })`);
  for (const [at, during, before] of spells){ assert.ok(at > 0 && at + RAIN() < .65, `each day's rain is in the day: at ${at}`); assert.equal(during, 1); assert.equal(before, 0); }
  function RAIN(){ return 100000 / 1200000; }
  g.run('S.clock.n = 0; S.clock.t = RAIN_AT(0) * DAY_MS + RAIN_MS / 2');
  assert.equal(g.run('rainingHere()'), true);
  assert.equal(get(g, "(t => t && t.say)(smallTalkFor(ALL_NPCS.find(n => n.id === 'troop1')))"), 'raining', 'a monkey with nothing new to say: 下雨了！');
  g.run("enterPlace('cave')");
  assert.equal(g.run('rainingHere()'), false, 'never indoors');
  const w = game(2, {chapter: 1, season: 3, teacher: 1}, {place: 'cave', x: 4, y: 4, dir: 'down'});
  w.run('S.clock.t = RAIN_AT(0) * DAY_MS + RAIN_MS / 2');
  assert.equal(w.run('rainNow()'), 0, 'never in winter: it snows');
});

test('bedtime: the day’s recap first (its words, questions and friends), then the night goes by and it’s morning, your health full', async () => {
  const g = game(1, CH1, {place: 'cave', x: 1, y: 2, dir: 'up'}, {w: knows(['床', '睡觉', '山']), health: 20, turn: 30, friends: ['rabbit'],
    clock: {t: 1200000 * .8, n: 3, turn0: 18, friends0: [], caught: ['山']}});
  assert.equal(g.run('promptFor(1, 1)'), 'Sleep');
  let card = '';
  await play(g, 'interact(1, 1)', gg => { card = card || gg.run('sheet.textContent'); return '[data-a=sleep]'; });
  assert.match(card, /Time for bed/);
  assert.match(card, /1 new word/); assert.match(card, /12 questions answered/); assert.match(card, /1 new friend/);
  assert.deepEqual(get(g, '[S.clock.n, S.clock.t, S.health, S.clock.turn0, S.clock.caught, S.clock.friends0]'), [4, 0, 50, 30, [], ['rabbit']], 'the next morning: a new day, your health full');
  assert.match(get(g, '__notes').join(' '), /Good morning/);
  assert.ok(!get(g, 'ALL_NPCS.some(n => n.asleep)'), 'everyone up');
});

test('bedtime: Not now, and you don’t sleep; the quick review asks five questions on today’s words, then you sleep', async () => {
  const g = game(1, CH1, {place: 'cave', x: 1, y: 2, dir: 'up'}, {w: knows(['床', '睡觉', '山', '树', '花', '草', '河', '鱼']), turn: 30,
    clock: {t: 1200000 * .8, n: 3, turn0: 18, friends0: [], caught: ['山', '树']}});
  await play(g, 'interact(1, 1)', '[data-a=no]');
  assert.deepEqual(get(g, '[S.clock.n, S.clock.t > 0]'), [3, true], 'Not now: still the same night');
  g.run('globalThis.__asked = []; pictureQ = async q => { __asked.push(q.word); return true; }');
  g.run('finishedAt = null');
  await play(g, 'interact(1, 1)', gg => gg.run("!!sheet.querySelector('[data-a=review]')") ? '[data-a=review]' : '[data-a=sleep]');
  const asked = get(g, '__asked');
  assert.equal(asked.length, 5, 'five questions');
  assert.ok(asked.includes('山') && asked.includes('树'), 'today’s words among them (and others you know, to make five)');
  assert.deepEqual(get(g, '[S.clock.n, S.clock.t]'), [4, 0], 'then you sleep till morning');
});

test('with nothing done today there’s no recap: you just sleep; before the day goes round (the prologue), it’s a nap', async () => {
  const g = game(1, CH1, {place: 'cave', x: 1, y: 2, dir: 'up'}, {w: knows(['床', '睡觉']), turn: 5, clock: {t: 1200000 * .3, n: 0, turn0: 5, friends0: [], caught: []}});
  let cards = 0;
  await play(g, 'interact(1, 1)', () => { cards++; return '[data-a=sleep]'; });
  assert.equal(cards, 0);
  assert.deepEqual(get(g, '[S.clock.n, S.clock.t]'), [1, 0]);
  const p = game(1, {chapter: 0, gate: true, climb: 3, story: true, cave: 2}, {place: 'cave', x: 1, y: 2, dir: 'up'}, {w: knows(['床', '睡觉']), health: 10});
  await play(p, 'interact(1, 1)');
  assert.deepEqual(get(p, '[S.health, S.clock.n, S.clock.t]'), [50, 0, 0], 'a nap: your health full, and no day goes by');
});

test('sleeping at home in chapter 2 (the borrowed cave’s beds), and the master’s year’s bedtime wakes you in the morning', () => {
  const g = game(2, {chapter: 2, home2: 1}, {place: 'ffmCave', x: 1, y: 2, dir: 'up'}, {w: knows(['床'])});
  assert.equal(g.run('promptFor(1, 1)'), 'Sleep');
  const steps = get(g, "({...AREA.legend, ...PLACES.cave.legend})['Y'].onLook.map(p => p.do.map(s => Object.keys(s).find(k => STEPS[k])))");
  assert.ok(steps.slice(0, 4).every(do_ => do_.includes('morning')), 'each season’s bedtime has its morning');
  assert.deepEqual(steps[steps.length - 1], ['sleep'], 'and once you’re his pupil, your room is to sleep in, any time');
});

test('home in autumn: Flower Fruit Mountain’s places in Area 2’s chapter 2, their leaves red and gold; the master’s year as it was', () => {
  const g = game(2, {chapter: 2, home2: 1}, {place: 'ffmHomeGround', x: 13, y: 9, dir: 'down'});
  assert.equal(g.run('seasonNow()'), 'autumn');
  assert.equal(g.run("(enterPlace('lair'), seasonNow())"), null, 'not the demon’s mountain');
  const y = game(2, {chapter: 1, season: 1, teacher: 1}, {place: 'cave', x: 4, y: 4, dir: 'down'});
  assert.equal(y.run('seasonNow()'), 'summer');
  const one = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'});
  assert.equal(one.run('seasonNow()'), null, 'and Area 1’s own Flower Fruit Mountain is a summer’s day, as ever');
});

test('the light: evening warmth, the dark of night (lighter indoors), and dawn; drawn without trouble day or night, out or in', () => {
  const g = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'});
  for (const f of [.2, .7, .8, .98]) g.run(`S.clock.t = DAY_MS * ${f}; drawWorld(performance.now())`);
  g.run('S.clock.t = DAY_MS * .5');
  assert.equal(g.run('lightNow()'), null, 'by day, as drawn');
  g.run('S.clock.t = DAY_MS * .7');
  const ev = get(g, 'lightNow()');
  assert.ok(ev.warm > 0 && ev.dark < 1, 'evening: warm, and getting darker');
  g.run('S.clock.t = DAY_MS * .8');
  assert.deepEqual(get(g, 'lightNow()'), {dark: 1, warm: 0, rose: 0});
  assert.ok(get(g, 'INDOOR_DARK < NIGHT_DARK && NIGHT_DARK <= .5'), 'night stays readable, and lighter still indoors');
  g.run("enterPlace('cave'); drawWorld(performance.now())");
});
