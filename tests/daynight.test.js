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

// Rain light or heavy (decided 7 November 2026, the owner's idea: sometimes just light, sometimes heavy, with a word for
// heavy rain): the day decides, about one in three heavy; never heavy till you know 雨, nor on the day you learnt it.
const HEAVY_DAY = g => g.run('(() => { for (let n = 1; ; n++) if (heavyDay(n)) return n; })()');
const LIGHT_DAY = g => g.run('(() => { for (let n = 1; ; n++) if (!heavyDay(n)) return n; })()');
const rainOn = (g, n) => g.run(`S.clock.n = ${n}; S.clock.t = RAIN_AT(${n}) * DAY_MS + RAIN_MS / 2`);
test('rain is light or heavy, by the day: about a third heavy, heavy as it always was, light fewer and shorter drops; never heavy till you know 雨, nor on the day you learnt it', () => {
  const g = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'}, {w: knows(['雨'])});
  const days = get(g, '[...Array(45).keys()].map(n => heavyDay(n))'), heavy = days.filter(Boolean).length;
  assert.ok(heavy >= 9 && heavy <= 21, `about a third of the days heavy (${heavy} of 45)`);
  assert.ok(days.slice(0, 10).includes(true) && days.slice(0, 10).includes(false), 'both, in the first ten days');
  rainOn(g, HEAVY_DAY(g));
  assert.equal(g.run('rainHere()'), 'heavy');
  assert.deepEqual(get(g, "[matches({raining:'heavy'}), matches({raining:'light'}), matches({raining:true})]"), [true, false, true]);
  const drawn = level => { rainOn(g, level === 'heavy' ? HEAVY_DAY(g) : LIGHT_DAY(g)); return g.run('(() => { let n = 0; const f = b.fillRect; b.fillRect = function(...a){ n++; return f.apply(this, a); }; try { drawRain(0, 0, 160, 1000); } finally { b.fillRect = f; } return n; })()'); };
  const [h, l] = [drawn('heavy'), drawn('light')];
  assert.ok(h > 500 && l > 100 && h > 2.5 * l, `heavy rain many more drops than light (${h} against ${l})`);
  assert.equal(g.run('rainHere()'), 'light');
  assert.deepEqual(get(g, "[matches({raining:'heavy'}), matches({raining:'light'})]"), [false, true]);
  const fresh = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'});
  rainOn(fresh, HEAVY_DAY(fresh));
  assert.equal(fresh.run('rainHere()'), 'light', 'not till you know 雨');
  fresh.run("setSeen('雨')");
  assert.equal(fresh.run('rainHere()'), 'light', 'nor on the day you learnt it');
  fresh.run('newDay()');
  assert.equal(fresh.run('rainHere()'), 'heavy', 'but heavy on a heavy day after');
});

test('the first heavy rain teaches 大雨 (下大雨了！), on both areas’ maps, never on the day you learn 雨; while it pours, the troop says 雨太大了！ (in light rain, 下雨了！)', async () => {
  const g = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'}, {w: knows(['雨'])});
  g.run("globalThis.__cards = []; showNotice = async w => { __cards.push(w); setSeen(w); }; showDialog = async () => {}");
  rainOn(g, LIGHT_DAY(g));
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__cards'), [], 'light rain teaches nothing new');
  assert.equal(get(g, "(t => t && t.say)(smallTalkFor(ALL_NPCS.find(n => n.id === 'troop1')))"), 'raining', 'light rain: 下雨了！');
  rainOn(g, HEAVY_DAY(g));
  assert.equal(get(g, "(t => t && t.say)(smallTalkFor(ALL_NPCS.find(n => n.id === 'troop1')))"), 'rainTooHeavy', 'heavy rain: 雨太大了！');
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__cards'), ['大雨']);
  await play(g, 'runEvents()');
  assert.deepEqual(get(g, '__cards'), ['大雨'], 'once');
  // a new game's first rain: 雨, and that day nothing more, even on a heavy day
  const f = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'});
  f.run("globalThis.__cards = []; showNotice = async w => { __cards.push(w); setSeen(w); }; showDialog = async () => {}");
  rainOn(f, HEAVY_DAY(f));
  await play(f, 'runEvents()'); await play(f, 'runEvents()');
  assert.deepEqual(get(f, '__cards'), ['雨'], 'the first rain is light: 雨 only');
  // the human world: home in autumn, for a game that hasn't had a heavy rain; the troop talks about it too
  const h = game(2, {chapter: 2, home2: 1, news: 1, party: 1, homeAgain: 1, landed: 1}, {place: 'ffmHomeGround', x: 13, y: 9, dir: 'down'}, {w: knows(['雨', '晚上'])});
  h.run("globalThis.__cards = []; showNotice = async w => { __cards.push(w); setSeen(w); }; showDialog = async () => {}");
  rainOn(h, HEAVY_DAY(h));
  assert.equal(get(h, "(t => t && t.say)(smallTalkFor(ALL_NPCS.find(n => n.id === 'big')))"), 'rainTooHeavy', 'the troop at home: 雨太大了！');
  await play(h, 'runEvents()');
  assert.deepEqual(get(h, '__cards'), ['大雨']);
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

// The time of day in the screen's corner, and the night sky in the water (decided 10 November 2026, after playing it: the
// moon and stars were painted over the map, on the trees, though the world is seen from above).
test('the time of day, in the screen’s top right corner: a sun, a low sun in the evening and at dawn, a moon at night; nothing before the day goes round', () => {
  const pro = game(1, {chapter: 0}, {place: 'meadow', x: 7, y: 3, dir: 'up'});
  pro.run('updateHUD()');
  assert.equal(pro.el('#sky').hidden, true, 'the prologue is always day: nothing in the corner');
  const g = game(1, CH1, {place: 'homeGround', x: 11, y: 8, dir: 'down'}), sky = g.el('#sky');
  const at = f => { g.run(`S.clock.t = DAY_MS * ${f}; tickClock(1000)`); return [sky.hidden, g.run('SKY_ICONS[skyShown][1]'), (sky.innerHTML.match(/<img class="icon"/g) || []).length]; };
  const icon = f => { at(f); return g.run('SKY_ICONS[skyShown][0]'); };
  assert.deepEqual(at(.2), [false, 'Daytime', 1], 'by day, the sun');
  assert.deepEqual(at(.7), [false, 'Evening', 1]);
  assert.deepEqual(at(.8), [false, 'Night', 1]);
  assert.deepEqual(at(.98), [false, 'Dawn', 1]);
  assert.notEqual(icon(.2), icon(.8), 'the sun and the moon are different pictures');
  assert.notEqual(icon(.2), icon(.7), 'and so is the low sun');
  assert.equal(icon(.7), icon(.98), 'evening and dawn share it');
  for (const f of [.2, .7, .8]) assert.ok(g.run(`!!ICONS[ICON_KEYS[${JSON.stringify(icon(f).replace(/️/g, ''))}]]`), 'each a pixel icon of the game’s');
  g.run("mode = 'title'; drawHUD()");
  assert.equal(sky.hidden, true, 'only out on the map');
  const css = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'css', 'game.css'), 'utf8');
  assert.match(css, /\.saybox\.top:not\(\[hidden\]\) ~ \.sky\{display:none\}/, 'a message at the top of the screen goes over it');
  assert.match(css, /\.screen:has\(> \.talk\.top:not\(\[hidden\]\)\) > \.sky\{top:auto;bottom:8px\}/, 'and with the speech box at the top, it goes to the bottom corner');
});

test('the night sky is in the water: the moon in the middle of a pond, never in a river, a brook or the sea; stars in open water, in from the banks; nothing over the land', () => {
  const g = game(1, CH1, {place: 'homeGround', x: 21, y: 14, dir: 'down'});
  assert.equal(g.run('typeof nightSky'), 'undefined', 'no moon and stars painted over the map');
  assert.deepEqual(get(g, '[18, 19, 20].map(x => [15, 16].map(y => tileAt(x, y).look).join())'), ['water,water', 'water,water', 'water,water'], 'the home ground’s pond, three squares by two');
  const [mx, my] = get(g, 'moonSpot()');
  assert.deepEqual([mx, my], [19.5 * 16, 16 * 16], 'the moon lies in the very middle of the pond');
  assert.deepEqual(get(g, 'moonSpot()'), [mx, my], 'worked out once for the place');
  // the water in view: each square of the pond in from its banks, so nothing shines on the earth
  const pools = get(g, 'waterInView(camX(), camY(), VH * T)'), cx = g.run('camX()'), cy = g.run('camY()');
  const corner = pools.find(p => p[4] === 18 && p[5] === 15), middle = pools.find(p => p[4] === 19 && p[5] === 16);
  assert.deepEqual(corner.slice(0, 4), [18 * 16 - cx + 4, 15 * 16 - cy + 4, 12, 12], 'the pond’s top left square: four pixels in from its top and its left');
  assert.deepEqual(middle.slice(0, 4), [19 * 16 - cx, 16 * 16 - cy, 16, 12], 'its bottom middle square: in from the bottom only');
  assert.ok(pools.every(p => ['water', 'sea'].includes(g.run(`tileAt(${p[4]}, ${p[5]}).look`))), 'only open water: not the shallows, a bridge or stepping stones');
  // only in still water, a pond or a pool (decided 10 November 2026, after playing it: in a river it didn't feel natural, and
  // one river runs through several places, so you met its moon again and again)
  const moonIn = place => { g.run(`enterPlace('${place}')`); return get(g, 'moonSpot()'); };
  for (const [place, x0, y0, x1, y1] of [['meadow', 9, 9, 12, 11], ['flowerValley', 0, 0, 99, 99], ['pasture', 0, 0, 99, 99]]){
    const m = moonIn(place);
    assert.ok(m && m[0] > x0 * 16 && m[0] < (x1 + 1) * 16 && m[1] > y0 * 16 && m[1] < (y1 + 1) * 16, `a moon in the pond: ${place}`);
    assert.ok(get(g, `[0, 1].every(dx => [0, 1].every(dy => tileAt(Math.ceil(${m[0]} / 16) - 1 + dx, Math.ceil(${m[1]} / 16) - 1 + dy).look === 'water'))`), `with water all round it: ${place}`);
  }
  for (const place of ['path', 'valley', 'falls', 'hillside', 'riverside', 'hotSprings']) assert.equal(moonIn(place), null, `no moon in a river or a brook: ${place}`);
  assert.equal(moonIn('southSlope'), null, 'nor in the south slope’s brook, though the trees shut it in at both ends: it’s far too long for a pond');
  assert.equal(moonIn('shore'), null, 'nor in the sea');
  assert.equal(moonIn('cave'), null, 'nor in the Water Curtain Cave’s stream, one square wide');
  assert.equal(get(g, 'pondSquares().size'), 0, 'that stream is far too long to be a pond');
  g.run("enterPlace('meadow')");
  assert.equal(get(g, 'pondSquares().size'), 12, 'the meadow’s pond is a pond, twelve squares; its river, which runs off the map, isn’t');
  // drawn only where there's water in view, over the dark
  const calls = code => get(g, `(() => { const seen = []; const was = b.drawImage; b.drawImage = (c, ...r) => { seen.push(c === skyCanvas ? 'sky' : 'other'); }; try { ${code}; } finally { b.drawImage = was; } return seen; })()`);
  g.run("enterPlace('homeGround'); pl.x = 21; pl.y = 14; pl.px = pl.x * T; pl.py = pl.y * T");
  assert.deepEqual(calls('skyInWater(camX(), camY(), VH * T, 1000, 1)'), ['sky'], 'with the pond in view, the sky is put on the screen');
  assert.deepEqual(calls('skyInWater(0, 0, 16, 1000, 1)'), [], 'with no water in view, nothing is');
  // the stars are single pale blue dots, never a gold cross that flares: that's the sparkle on something with a word to
  // find (decided 10 November 2026, after playing it: a few bigger stars in the river were taken for it)
  const fills = get(g, `(() => { const out = [], was = skyG.fillRect; skyG.fillRect = function(x, y, w, h){ out.push([this.fillStyle, w, h]); }; try { skyInWater(camX(), camY(), VH * T, 1000, 1); } finally { skyG.fillRect = was; } return out; })()`);
  const stars = fills.filter(([c]) => c === g.run('SKY_STAR'));
  assert.ok(stars.length >= 4 && stars.every(([, w, h]) => w === 1 && h === 1), `stars are single dots: ${stars.length}`);
  assert.ok(!fills.some(([c]) => ['#FFE27A', '#FFF6C8', '#FFFFFF'].includes(c)), 'nothing in the water in the sparkle’s gold or white');
});
