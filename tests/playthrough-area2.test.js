// Plays the human world (Area 2: Chapters 2, 3 and 4) from the phone's test save, a game at the end of Chapter 1 on the
// shore beside your raft (tools/area2-start.json), sailing in, to the iron bridge at the end of Chapter 4, the way a player
// would. Written 17 November 2026, for the starts (tests/starts.js): Area 2 had no playthrough. Rather than a script of
// every move, as tests/playthrough.test.js has for Flower Fruit Mountain, it follows your tasks as a player does: the main
// task's arrow (to someone, something or the way to another place), going there, pressing A at it and answering every
// card, or else someone with a ! or ? over them; and does by hand what an arrow can't show, such as fishing for the
// fisherman or finding the child in hide and seek. It catches a change that makes the area impossible to finish, a task
// whose arrow leads nowhere, a card that can't be closed or a way that never opens; and keeps the game just before each
// part begins.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {loadGame} = require('./fake-browser');
const {watchBeside, besideTasks} = require('./beside');
const {startsKeeper} = require('./starts');   // (the game just before each part begins: Start at…, js/starts.js)
const SHOW = !!process.env.SHOW_PLAY;   // (each thing done, as it's done: to see where it gets stuck)

test('the human world can be played from sailing in to the end of Area 2', async () => {
  const start = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tools', 'area2-start.json'), 'utf8'));
  const game = loadGame({dom: true, save: {...start, area: 2}});   // (as the sail leaves it: the page loads again in Area 2)
  watchBeside(game);
  const starts = startsKeeper(game);
  const run = code => game.run(code);
  const get = expr => JSON.parse(run(`JSON.stringify(${expr})`));
  const sheet = game.el('#sheet'), talkBox = game.el('#talk');
  const talking = () => run('!!talkNext');
  const open = () => !run('modal.hidden') || talking();
  const cardText = () => (talking() ? talkBox : sheet).textContent.replace(/\s+/g, ' ').trim();
  const area = () => get('here()');

  run('Math.random = () => 0');
  run(`(() => { const pq = pictureQ; pictureQ = q => { globalThis.__q = q; return pq(q); }; })()`);
  run(`globalThis.__said = []; (() => { const s = say; say = (text, end) => { __said.push(text); return s(text, end); }; })()`);
  run("globalThis.__parts = []; (() => { const p = partsCheck; partsCheck = async () => { const was = here().part; await p(); if (here().part !== was && partNow()) __parts.push(partNow().name + ': ' + partNow().title); }; })()");
  run("globalThis.__scenes = []; storyScene = async id => { __scenes.push(id); }");   // (each scene plays by itself: its own test draws it)
  run("globalThis.__wrote = []; writeCard = async text => { __wrote.push(text); }");   // (writing with the brush: its card draws on canvases, tests/cave.test.js and year's)
  run("(() => { const s = shop; shop = (face, sh, asked) => { globalThis.__shop = sh || Object.values(SHOPS)[0]; return s(face, sh, asked); }; })()");   // (the shop that's open)
  run("globalThis.__told = []; (() => { const t = toast; toast = msg => { __told.push(msg); return t(msg); }; })()");   // (messages, to show what happened)

  const tick = () => new Promise(r => setImmediate(r));
  async function settle(){
    for (let i = 0; i < 1000; i++){
      if (run('!!race && !busy')) run('bHeld = true; pl.x = race.to; bHeld = false');
      const bites = () => { if (run('!!fishing && !!fishing.bite && !fishing.hooked')) run("fishPress('a')"); };
      await tick(); bites();
      if (game.flush()) continue;
      await tick(); bites();
      if (!game.flush()) return;
    }
    throw new Error('the game kept setting timers');
  }
  const plan = {buy: null, count: 1};   // what to buy in the next shop; how many to pick up
  function answer(){   // do what a player would on the card that's open
    if (talking()){ run('pressA()'); return; }
    if (sheet.querySelector('.howmany')){ sheet.querySelector(`.opt[data-i="${(plan.count || 1) - 1}"]`).click(); return; }   // how many to pick up: as many as they asked for
    const opts = sheet.querySelectorAll('.opt').filter(o => !o.hidden && !o.disabled);
    const wanted = opts.length && get('(u => u && (here()[u.key] || 0) >= 1 && here()[u.key] <= u.asks.length ? u.asks[here()[u.key] - 1].word : null)(AREA.unloading)');   // (taking the troop's things off the cart: what she asked for)
    const take = wanted && opts.find(o => (o.querySelector('.cap') || {}).textContent === wanted);
    if (take){ take.click(); return; }
    if (opts.length){ (sheet.querySelector(`.opt[data-i="${run('__q && __q.answerIdx')}"]`) || opts[0]).click(); return; }
    const word = sheet.querySelectorAll('.mw').find(b => !b.classList.contains('done'));
    if (word){ word.click(); sheet.querySelector(`.mp[data-w="${word.dataset.w}"]`).click(); return; }
    const items = sheet.querySelectorAll('[data-n]');
    if (items.length){   // a shop: what you've come for, or something new (its word, which buying it teaches: some of the story waits for them), or nothing
      const it = n => get(`(i => ({word: i.word || i.item, price: i.price, for: i.for && !here().holding[i.for]}))(forSale(__shop)[${n}])`), can = b => it(b.dataset.n).price <= get('money()');
      const pick = items.find(b => plan.buy && it(b.dataset.n).word === plan.buy && can(b)) || items.find(b => it(b.dataset.n).for && can(b))   // (something to buy for someone, such as the senior pupil's rice)
        || items.find(b => get(`lvl(${JSON.stringify(it(b.dataset.n).word)})`) < 1 && can(b));
      if (pick && plan.buy === it(pick.dataset.n).word) plan.buy = null;
      (pick || sheet.querySelector('[data-a=no]')).click(); return;
    }
    run('pressA()');
  }
  const deadEnds = [], log = [];
  let saidSeen = 0;
  async function act(code, what, quiet){   // start something, then answer its cards until it's finished (outside school, someone can go on from one new word to the next: decided 7 November 2026)
    if (SHOW && !quiet) console.log(`${get('PLACE')} ${get('[pl.x, pl.y, pl.dir].join()')}: ${what}`);
    if (!quiet) log.push(what);
    let done = false, failed = null, last = '', same = 0;
    starts.before(code, what);
    Promise.resolve(run(code)).then(() => { done = true; }, e => { failed = e; done = true; });
    for (let i = 0; i < 3000 && !done; i++){
      await settle();
      if (done || !open()) continue;
      const now = cardText() + sheet.querySelectorAll('.done, [disabled], [hidden]').length;
      same = now === last ? same + 1 : 0; last = now;
      if (same > 20) break;
      answer();
    }
    if (failed) throw failed;
    assert.ok(done, `stuck while ${what}: ${open() ? cardText() : 'no card open'}`);
    await settle();
    assert.ok(!open(), `a card was left open after ${what}: ${cardText()}`);
    starts.after();
    if (SHOW){ const said = get(`__said.slice(${saidSeen})`), told = get('__told.splice(0)'); saidSeen += said.length; if (said.length || told.length) console.log('   ' + [...said, ...told.map(m => '[' + m + ']')].join(' ').slice(0, 300)); }
    if (!get('getTasks().length') && /coming soon/.test(get('tasksHint()'))) deadEnds.push(what);
  }
  const stand = (x, y, dir) => run(`S.pos = {place:PLACE, x:${x}, y:${y}, dir:'${dir}'}; placePlayer();`);
  const DIRS = [[0, -1, 'up'], [0, 1, 'down'], [-1, 0, 'left'], [1, 0, 'right']];
  // Where to stand to do something at (x, y) in this place: the end of the way you'd walk there (routeTo), or else a square
  // beside it you can stand on; and which way you'd face it from there
  function besideOf(x, y){
    const route = get(`routeTo([${x}, ${y}])`);
    const end = route && route.length ? route[route.length - 1] : DIRS.map(([dx, dy]) => [x - dx, y - dy]).find(([bx, by]) => get(`walkable(${bx}, ${by}) && !npcAt(${bx}, ${by}) && !exitAt(${bx}, ${by})`));
    assert.ok(end, `somewhere to stand by ${x}, ${y} in ${get('PLACE')}`);
    const d = DIRS.find(([dx, dy]) => end[0] + dx === x && end[1] + dy === y);
    return [end[0], end[1], d ? d[2] : get('pl.dir')];
  }
  // Walking to (x, y) in this place, a square at a time, as a player walks, with whatever happens as you arrive on each
  // (someone calling you over, a wild creature jumping out, the stone doors opening as you come up to them): the way you'd
  // walk (routeTo), to beside it, and onto it (onto). Stops as soon as anything changes. With no way to walk there, you're
  // put beside it, and it's noted (noWay).
  const noWay = [];
  const dirTo = ([fx, fy], [tx, ty]) => tx > fx ? 'right' : tx < fx ? 'left' : ty > fy ? 'down' : 'up';
  async function walkTo(x, y, onto, what){
    const route = get(`routeTo([${x}, ${y}])`), place = get('PLACE'), story = () => JSON.stringify([get('here()'), get('PLACE'), get('S.friends.length')]);
    if (!route && get(`(() => { const near = walkableFromYou(); for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (promptFor(x, y) === 'Climb' && Object.values(DV).some(([dx, dy]) => near.has((x + dx) + ',' + (y + dy)))) return true; return false; })()`)) return doPrompt('Climb', `${what}: the way there is up (or down) a chain`);   // (the cliff road's chain)
    if (!route){ noWay.push(`${place} ${x}, ${y}: ${what}`); const [bx, by, dir] = besideOf(x, y); stand(bx, by, dir); if (onto) stand(x, y, dir); return act(`arrive(${onto ? x : bx}, ${onto ? y : by}).then(runEvents)`, `${what}: (no way to walk there) ${onto ? 'onto' : 'beside'} it`); }
    const squares = route.slice(1).concat(onto ? [[x, y]] : []), was = story();
    let from = route[0];
    for (const sq of squares){
      stand(sq[0], sq[1], dirTo(from, sq)); from = sq;
      await act(`arrive(${sq[0]}, ${sq[1]}).then(runEvents)`, `${what}: walking, ${sq[0]}, ${sq[1]}`, true);
      if (story() !== was || get('busy')) return;
    }
  }
  // Up to (x, y) in this place and A at it: walking up to it, then A; or, for a way you go through by stepping onto it, or a
  // square with nothing to press A at, walking onto it
  async function doAt(x, y, what){
    const way = get(`exitAt(${x}, ${y}) || null`), tile = get(`(t => ({walk: !!t.walk, look: t.look}))(tileAt(${x}, ${y}))`);
    const something = get(`!!npcAt(${x}, ${y}) || !!animalAt(${x}, ${y}) || !!promptFor(${x}, ${y})`);
    if (way && !way.by){ if (SHOW) console.log(`  ${what}: to the way to ${way.to}`); return walkTo(x, y, true, `${what}: the way to ${way.to}`); }
    if (!something && tile.walk && !way){
      if (get('pl.x') === x && get('pl.y') === y){   // there already: A at what's beside it, such as the water to fish in off the pier
        const d = DIRS.find(([dx, dy]) => get(`!!promptFor(${x + dx}, ${y + dy})`));
        assert.ok(d, `something to do at ${x}, ${y} in ${get('PLACE')}: ${what}`);
        stand(x, y, d[2]); return act('finishedAt = null; pressA()', `${what}: A at ${x + d[0]}, ${y + d[1]} (${get(`promptFor(${x + d[0]}, ${y + d[1]})`)})`);
      }
      if (SHOW) console.log(`  ${what}: to ${x}, ${y}`);
      return walkTo(x, y, true, what);
    }
    const asleep = get(`(a => a && asleepNow(a) ? a.time : null)(animalAt(${x}, ${y}))`);
    if (asleep){ wantNight = asleep === 'night'; return passTime(asleep, `${what}: it's asleep, so waiting till it's ${asleep}`); }   // (a night animal by day, such as the cat: as a player waits for dark)
    const [bx, by, dir] = besideOf(x, y);
    if (get('pl.x') !== bx || get('pl.y') !== by){ if (SHOW) console.log(`  ${what}: up to it`); return walkTo(x, y, false, what); }
    stand(bx, by, dir);
    await act('finishedAt = null; pressA()', `${what}: A at ${x}, ${y}`);
  }

  // Time going by on the map, as a player plays on: till night (night) or the next morning, and what happens then
  let wantNight = false;   // (waiting for dark to meet a night animal: otherwise it's the next morning, as a player sleeps or plays on)
  const passTime = (to, what) => act(`S.clock.t = ${to === 'night' ? 'NIGHT * DAY_MS + 1000' : '1000'}; ${to === 'night' ? '' : 'S.clock.n++; '}clockNews(); placeCharacters(); runEvents()`, what);
  // Someone with something new for you: a ! or ? over them (here first, then anywhere in this area)
  // (one who just says hello again, with nothing changing, is passed over till the story moves on)
  let passed = new Set(), story = '';
  const notPassed = () => { const now = JSON.stringify(get('here()')); if (now !== story){ story = now; passed = new Set(); } return JSON.stringify([...passed]); };
  const newsHere = () => get(`(n => n ? [n.id, n.x, n.y] : null)(NPCS.find(n => n.place === PLACE && hasNews(n) && !${notPassed()}.includes(n.id)))`);
  const newsAnywhere = () => get(`(n => n ? [n.id, n.place] : null)(ALL_NPCS.find(n => PLACES[n.place] && n.place !== PLACE && wayTo(n.place) && hasNews(n) && !${notPassed()}.includes(n.id)))`);   // (somewhere you can get to)
  // A at the nearest thing in this place whose A does this (its label: Fish, say), from somewhere you can walk to
  async function doPrompt(label, what){
    const spot = get(`(() => { const near = walkableFromYou(), found = [];
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (promptFor(x, y) === ${JSON.stringify(label)})
        for (const [dx, dy, dir] of [[0, 1, 'up'], [0, -1, 'down'], [1, 0, 'left'], [-1, 0, 'right']]) if (near.has((x + dx) + ',' + (y + dy))) found.push([x + dx, y + dy, dir, Math.abs(x + dx - pl.x) + Math.abs(y + dy - pl.y)]);
      return found.sort((a, b) => a[3] - b[3])[0] || null; })()`);
    assert.ok(spot, `somewhere to ${label} in ${get('PLACE')}: ${what}`);
    stand(spot[0], spot[1], spot[2]);
    return act('finishedAt = null; pressA()', `${what}: ${label}`);
  }

  async function goPlace(place, what){ const way = get(`wayTo('${place}')`); assert.ok(way, `a way to ${place}: ${what}`); return doAt(way[0], way[1], what); }
  // Fetching what someone asked for (the fetch step: their asks, said only in Chinese): what they want now, from where it
  // is here (a square whose A picks it up, the carry step), as many as they asked for, then back to them
  const FETCH = `(() => { const p = here(), found = [];
    const scan = (steps, who) => { for (const s of steps || []){ if (s.fetch && s.asks) found.push({who, s}); for (const k of ['win', 'lose', 'then', 'done']) if (Array.isArray(s[k])) scan(s[k], who); } };
    for (const [who, parts] of Object.entries(AREA.talk)) for (const part of parts) scan(part.do, who);
    const f = found.find(({s}) => (p[s.fetch] || 0) >= 1 && p[s.fetch] <= s.asks.length);
    if (!f) return null;
    const a = f.s.asks[p[f.s.fetch] - 1];
    return {who: f.who, word: a.word, count: a.count || 1, carrying: p.carrying || null}; })()`;
  async function doFetch(){
    const f = get(FETCH);
    if (!f) return false;
    if (f.carrying && f.carrying.word === f.word && f.carrying.n === f.count){
      const n = someone(`n.id === '${f.who}'`);
      if (!n) return goPlace(get(`ALL_NPCS.find(n => n.id === '${f.who}').place`), `taking ${f.word} to ${f.who}`);
      return doAt(n[1], n[2], `bringing ${f.who} ${f.count} ${f.word}`);
    }
    const src = get(`(() => { const near = walkableFromYou(); for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){ const p = (tileAt(x, y).onLook || []).find(p => !p.if || matches(p.if));
      if (p && (p.do || []).some(s => s.carry === ${JSON.stringify(f.word)}) && Object.values(DV).some(([dx, dy]) => near.has((x + dx) + ',' + (y + dy)))) return [x, y]; } return null; })()`);   // (one you can walk up to)
    assert.ok(src, `somewhere to pick up ${f.word} for ${f.who}, in ${get('PLACE')}`);
    plan.count = f.count;
    return doAt(src[0], src[1], `picking up ${f.count} ${f.word} for ${f.who}`);
  }
  const someone = test => get(`(n => n ? [n.id, n.x, n.y] : null)(NPCS.find(n => n.place === PLACE && (${test})))`);
  // What to do by hand, for tasks an arrow can't show (by task id): false to go on as usual
  const BY_HAND = {
    a2fishAsk: () => doPrompt('Fish', 'a fish for the fisherman'),
    c1fetch: doFetch, c1chore: doFetch,
    a2birds: () => { if (get('PLACE') !== 'fields') return goPlace('fields', 'to the farmer’s birds'); const b = someone("n.look === 'bird' && n.shoo"); assert.ok(b, 'a bird on the rice'); return doAt(b[1], b[2], 'shooing a bird off the rice'); },
    a2hide: () => {   // hide and seek: where the child said
      if (get('PLACE') !== get('HIDE.place')) return goPlace(get('HIDE.place'), 'back to hide and seek');
      const [x, y] = get('hideSpot(hideState().spot).at[0]');
      return doAt(x, y, `hide and seek: ${get('hideSpot(hideState().spot).id')}`);
    }
  };

  async function next(){
    if (get('isNight()') && !wantNight) return passTime('day', 'the night goes by');
    wantNight = false;
    const tasks = get('getTasks()');
    for (const t of tasks) if (BY_HAND[t.id]){ const r = BY_HAND[t.id](t); if (r !== false) return r; }   // (false: nothing to do by hand just now)
    const t = tasks.find(t => t.main && t.target);
    if (t) return doAt(t.target[0], t.target[1], `${t.id} (${t.text})`);
    const shine = tasks.some(t => t.main) && get('sparkleToFind()');   // (a main task with no arrow where you are, such as the troop hiding by the waterfall: what sparkles here)
    if (shine) return doAt(shine[0], shine[1], `something sparkles, for ${tasks.find(t => t.main).id}`);
    const o = tasks.find(t => t.target && !t.main);
    if (o) return doAt(o.target[0], o.target[1], `${o.id} (${o.text})`);
    const n = newsHere();
    if (n){
      const there = besideOf(n[1], n[2]), at = get('pl.x') === there[0] && get('pl.y') === there[1];   // (beside them already: this is A at them)
      const was = JSON.stringify([get('here()'), get('Object.values(S.w).filter(w => w.lv > 0).length'), get('S.bag'), get('S.friends')]);
      await doAt(n[1], n[2], `${n[0]} has a ! or ?`);
      if (at && JSON.stringify([get('here()'), get('Object.values(S.w).filter(w => w.lv > 0).length'), get('S.bag'), get('S.friends')]) === was) passed.add(n[0]);
      return;
    }
    const far = newsAnywhere();
    if (far){ const way = get(`wayTo('${far[1]}')`); assert.ok(way, `a way to ${far[1]}, for ${far[0]}`); return doAt(way[0], way[1], `on the way to ${far[0]} in ${far[1]}`); }
    throw new Error(`nothing to do: ${JSON.stringify(tasks.map(t => t.id))}; ${get('tasksHint()')}`);
  }

  await act('arriveInArea()', 'sailing in to the human world');
  // (the same thing done again and again, with nothing changing: stuck)
  const state = () => JSON.stringify([get('here()'), get('PLACE'), get('[pl.x, pl.y]'), get('Object.keys(S.w).length'), get('S.friends.length'), get('S.bag'), get('S.met.length')]);
  let was = '', same = 0;
  for (let i = 0; i < 3000 && !get('here().ch2'); i++){
    await next();
    const now = state();
    same = now === was ? same + 1 : 0; was = now;
    assert.ok(same < 4, `stuck: ${log.slice(-4).join('; ')}`);
  }
  assert.equal(area().ch2, 1, 'the end of Chapter 4');
  // The dive from the iron bridge, to the Eastern Sea (Area 3): Chapter 5 begins there
  starts.nextIs('a3p0');
  const bridge = get("getTasks().find(t => t.id === 'c2dive')");
  for (let i = 0; i < 40 && get('S.area') !== 3; i++){ const t = get("getTasks().find(t => t.id === 'c2dive')"); await doAt(t.target[0], t.target[1], 'to the iron bridge, and dive'); }
  assert.ok(bridge && get('S.area') === 3 && game.reloads.count === 1, 'diving: on to Area 3, the page loading again for it');

  assert.deepEqual(get('__parts'), ['Part 1: Dressing like a person', 'Part 2: Learning to talk', 'Part 3: The road east', 'Part 4: The market town', 'Part 5: Across the western sea',
    'Part 1: The climb', 'Part 2: Spring', 'Part 3: Summer', 'Part 4: Autumn', 'Part 5: Winter', 'Part 6: The master’s secret', 'Part 7: Changing into things', 'Part 8: Showing off',
    'Part 1: Home again', 'Part 2: The little demons', 'Part 3: The demon’s mountain', 'Part 4: The Demon of Havoc', 'Part 5: Home'], 'the story, part by part, each with its card');
  assert.ok(get('areaChecklist()').every(([, done]) => done), 'every job on the checklist done');
  assert.deepEqual(deadEnds, [], 'your tasks were never empty');
  assert.deepEqual(noWay, [], 'every task’s arrow led somewhere you can walk to');
  assert.deepEqual(besideTasks(game), [], 'no task ever sends you to someone you’re standing with, just as you finish talking to them');
  // The game just before each part begins, to start at for testing (npm run starts writes them to tools/starts/; Area 2's
  // first is Area 1's, beside your raft)
  assert.deepEqual(Object.keys(starts.kept).sort(), [...Array.from({length: 17}, (_, i) => 'a2p' + (i + 1)), 'a3p0'].sort(), 'a start for every part, and for Chapter 5');
  starts.write();
  // Everything said on the way has a voice clip
  const clips = require('../tools/make-voices').plan().clips, said = get('__said');
  assert.ok(said.length > 200, 'the game should say plenty aloud');
  assert.deepEqual([...new Set(said)].filter(t => !Object.values(clips).some(c => c[t])), [], 'these are said but have no voice clip');
});
