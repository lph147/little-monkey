// What happens in the world: where you can walk, tasks, talking to characters, looking at things and wild animals.

/* ================= WORLD LOGIC ================= */
const EDGE = {look:'heights'};   // what lies beyond the edge of the map: rock (so a cliff or the top of the rock carries on past it)
const BIRD_WORD = (AREA.birds || {}).word;   // the word for the birds that land near you
function tileAt(x, y){         // the legend entry for the map letter at x, y (or what it has become, as the story goes on)
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return EDGE;
  const t = LEGEND[changedTo(x, y) || MAP[y][x]];
  return t.becomes ? LEGEND[becomesNow(t)] || t : t;
}
// A map letter that changes with the story (becomes, in the legend), such as the rocks rolling away: the letter it is now.
// A single square can change for good too (the change step, kept in the save's changed), such as a dry tree you've knocked
// down. The map is drawn again when either changes (refreshMap).
const becomesNow = t => (t.becomes.find(b => matches(b.if)) || {}).to;
const squareKey = (x, y, place = PLACE) => `${place}:${x},${y}`;
// A square changed for good counts only while the map still has there a letter that can change into it (a change step in
// that letter's onLook, in the place's legend), or a step changes that very square (at). So a place's map can be drawn
// anew without an old change turning up in the wrong place, such as a stump in the middle of a new path (decided
// 21 October 2026, when the pine wood was laid out again).
const CHANGES = (() => {
  const can = new Set();
  for (const [id, p] of Object.entries(PLACES)) for (const [c, t] of Object.entries({...AREA.legend, ...(p.legend || {})}))
    for (const part of t.onLook || []) for (const s of part.do) if (s.change) can.add(`${id}:${c}>${s.change}`);
  (function walk(o){   // steps that change a square of their own (at), anywhere in the content
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object'){ if (o.change && o.at) can.add(`${squareKey(o.at[0], o.at[1], placeOf(o.at))}>${o.change}`); Object.values(o).forEach(walk); }
  })(AREA);
  return can;
})();
const changedTo = (x, y) => {
  const k = squareKey(x, y), to = here().changed[k];
  return to && (CHANGES.has(`${PLACE}:${MAP[y][x]}>${to}`) || CHANGES.has(`${k}>${to}`)) ? to : null;
};
const mapStoryNow = () => Object.values(LEGEND).filter(t => t.becomes).map(becomesNow).join() + '|'
  + Object.entries(here().changed).filter(([k]) => k.startsWith(PLACE + ':')).join() + '|' + Object.entries(paintedParts()).join() + '|' + seasonLook();   // (and the season: js/seasons.js)
let mapStory = null;   // what they were when the map was last drawn (buildMap)
function refreshMap(){ if (mapStoryNow() !== mapStory){ if (!patchMap()) buildMap(); findGrass(); stepClear(); } }   // (just the squares that change, if it can: patchMap, js/art.js)
// If the map changes under you (such as the school's frame going up on the plot you're standing on), or you arrive where
// someone stands (decided 22 October 2026: coming down the mountain path put you on the big monkey), you step out onto
// the nearest square you can walk on.
function stepClear(){
  if (tileAt(pl.x, pl.y).walk && !npcAt(pl.x, pl.y)) return;
  const seen = new Set([pl.x + ',' + pl.y]), queue = [[pl.x, pl.y]];
  while (queue.length){
    const [x, y] = queue.shift();
    for (const [dx, dy] of Object.values(DV)){
      const nx = x + dx, ny = y + dy;
      if (seen.has(nx + ',' + ny) || nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      seen.add(nx + ',' + ny);
      if (walkable(nx, ny) && !exitAt(nx, ny)){ pl.x = nx; pl.y = ny; pl.px = nx*T; pl.py = ny*T; S.pos = {...S.pos, x:nx, y:ny}; save(); lineUp(); return; }
      queue.push([nx, ny]);
    }
  }
}
const npcAt = (x, y) => NPCS.find(n => n.x === x && n.y === y);
const exitAt = (x, y) => (PLACES[PLACE].exits || []).find(e => e.at[0] === x && e.at[1] === y && (!e.when || matches(e.when)));   // a way to another place (when: only there once the story says)
const isOpen = e => (!e.when || matches(e.when)) && (!e.if || matches(e.if));   // (a way that isn't there yet isn't open either)
const walkable = (x, y) => !!tileAt(x, y).walk && !npcAt(x, y) && !animalAt(x, y) && !(typeof thingBlocks === 'function' && thingBlocks(x, y));   // (an animal standing on open ground, such as a deer, is in the way; and a thing, such as a rock with jade in it or the cave's drum: js/trade.js)
// Steam vents (a legend's vent: {every, puff, at}, in ms, such as the hot spring valley's): every so often, steam puffs out
// of one for a moment (puff ms of every, at: how long after the cycle starts it starts), and while it does, you can't step
// onto it (its hot), and standing on it, it pushes you back off it (its pushed): the hot spring valley's twist, timing your
// way between its pools (decided 27 October 2026). A bigger at is later (decided 5 November 2026, after playing it: it was
// earlier, so the cliff road's gusts, meant to go up the walkway a row after another, came down it, and going up you'd
// have needed two steps in a fifth of a second).
const ventTime = (v, now) => now - (v.at || 0);   // (where in its cycles a vent is: % every, and how many, / every)
const puffing = (x, y, now = performance.now()) => { const v = tileAt(x, y).vent; return !!v && ((ventTime(v, now) % v.every) + v.every) % v.every < v.puff; };
const lookWord = t => (t.learnFirst && lvl(t.learnFirst) === 0 ? t.learnFirst : t.word);   // the word a tile teaches right now
const gatherFor = g => [].concat(g.for).find(id => here()[id] === 'asked') || [].concat(g.for)[0];   // (for can be a list of requests: the first asked, such as the hungry monkey's two wishes)
const canGather = g => { const f = gatherFor(g); return here()[f] === 'asked' && here().holding[f] !== g.item; };   // asked for, and not already holding it
// Somewhere you collect something else (water, from the river or the pond) whose own word you don't know yet: A looks
// first, teaching its word, and collects after that (decided 22 October 2026: you got the water, and never the word). The
// same when a tile fills your bag (pick). (A fruit tree's word was 水果 from 23 to 24 October 2026; now it's its fruit.)
const looksFirst = t => !!t.word && lvl(t.word) === 0 && t.word !== (t.gather || t.pick || {}).item;
const DV = {up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]};
const OPP = {up:'down', down:'up', left:'right', right:'left'};
const dirOf = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');   // the way towards dx, dy

// How many to pick up (the carry step's howMany): a picture of the thing, and the numbers 一 to 五, each with its pinyin (no
// English: what he said is the question). Gives how many you chose, or 0 for Not now.
const HOW_MANY = 5;
function howManyCard(w, ask){   // (ask: its question, if not how many of it you want to pick up)
  return new Promise(res => {
    const nums = HOW_MANY_WORDS.slice(0, HOW_MANY);   // (how many: two is 两, never 二)
    openCard(`<div class="howmany"><div class="hmpic" aria-hidden="true">${picHTML(w)}</div><p class="label">${esc(ask ? fill(ask) : `How many ${wz(w)} do you want to pick up?`)}</p></div>
      <div class="opts five" data-nav>${nums.map((x, i) => `<button class="opt hz" data-i="${i}" aria-label="${i + 1}">${x}${S.pinyin ? `<span class="cap">${WORDS[x].py}</span>` : ''}</button>`).join('')}</div>
      <div class="actions"><button class="btn" data-a="no" data-b>Not now</button></div>`);
    sheet.querySelectorAll('.opt').forEach(b => b.onclick = () => { closeCard(); res(+b.dataset.i + 1); });
    on('[data-a=no]', () => { closeCard(); res(0); });
  });
}

// What to take off a cart (the unload step): a picture of each thing still on it, with its characters under it, as in a
// listening question (what they asked for, said only in Chinese, is the question). Gives what you chose, or null for
// Not now.
function takeCard(words, ask){
  return new Promise(res => {
    openCard(`<p class="label">${esc(fill(ask))}</p>
      <div class="opts" data-nav>${words.map((w, i) => `<button class="opt" data-i="${i}" aria-label="${esc(WORDS[w].en)}"><span class="ico">${picHTML(w)}</span><span class="cap">${w}</span></button>`).join('')}</div>
      <div class="actions"><button class="btn" data-a="no" data-b>Not now</button></div>`);
    sheet.querySelectorAll('.opt').forEach(b => b.onclick = () => { closeCard(); res(words[+b.dataset.i]); });
    on('[data-a=no]', () => { closeCard(); res(null); });
  });
}

const learnedCount = () => ORDER.filter(w => lvl(w) >= 1).length;
// The animals in a chapter of the story (each animal's chapter, 0 if not given), or just those of one place in it (place,
// such as the fox on the hillside), and how many of them you've met: the prologue's animals are counted on their own, so a
// new chapter's animals never stand in the way of the prologue's story.
// A chapter's animals (or one place's in it), and how many you've met: those in a group of their own, such as the night
// animals, counted only with their group (group), never with the place's (decided 8 November 2026: the hillside's animal
// was the fox, and stayed so once the cricket came).
const chapterAnimals = (ch = 0, place, group = null) => ANIMALS.filter(a => a.chapter === ch && (!place || a.place === place) && a.group === group);
const metCount = (ch = 0, place, group) => chapterAnimals(ch, place, group).filter(a => S.met.includes(a.id)).length;
// The story's chapters in this area (AREA.chapters), and the one you're in (counting from 0). Each item on the
// area's checklist belongs to a chapter (chapter, 0 if not given); the checklist shows the chapter you're in.
const chapterNow = () => here().chapter || 0;
const chapterItems = () => AREA.checklist.filter(c => (c.chapter || 0) === chapterNow());
// What the checklist shows of it: in a chapter with parts, the part you're in, and anything from an earlier part that's still
// to do (decided 5 November 2026: in Flower Fruit Mountain, the hillside's animal or the colours can still be waiting as the
// feast begins), never what's to come.
const shownItems = () => chapterItems().filter(c => !c.part || !partNow() || c.part === partNow().id ||
  (PARTS.findIndex(p => p.id === c.part) < here().part && !matches(c.done)));
// The story's parts within a chapter (the area's parts; decided 5 November 2026, after playing it: the human world felt
// aimless): the furthest one you've reached (here().part, its index), each with its title card as it begins (once its
// when matches; card:false for one that begins with its chapter's own card), and what you're doing in it (now: a text,
// or a list of {if, text}, the first that matches), at the top of the Tasks page under the journey's goal (the area's
// goal, the same). Checklist items with a part show only while you're in it.
const PARTS = AREA.parts || [];
const partNow = () => { const p = PARTS[here().part]; return p && p.chapter === chapterNow() ? p : null; };
const textNow = v => !v ? '' : typeof v === 'string' ? fill(v, false, true) : fill((v.find(x => !x.if || matches(x.if)) || {}).text || '', false, true);
async function partsCheck(){
  const quiet = here().part == null;   // (a game from before the story had parts starts at the part it's reached, with no card)
  for (let i = PARTS.length - 1; i > (here().part ?? -1); i--){
    const p = PARTS[i];
    if (p.chapter !== chapterNow() || !matches(p.when)) continue;
    here().part = i; save();
    if (p.card !== false && !quiet){ SFX.chime(); await infoBox('', `<div class="chaptercard partcard"><p class="label">${esc(p.name)}</p><h2>${esc(p.title)}</h2>${p.text ? `<p class="parttext">${hlText(fill(p.text, false, true))}</p>` : ''}</div>`, 'OK'); }
    return;
  }
  if (quiet && PARTS.length) here().part = -1;   // (not into a part yet: each one's card shows as it begins)
}
// [text, done, is it the exit test, found yet]: an item with show is found once show matches, or it's done
const areaChecklist = () => shownItems().map(c => { const done = matches(c.done); return [fill(c.text, false, true), done, !!c.exitTest, !c.show || done || matches(c.show)]; });
const chapterDone = () => chapterItems().filter(c => !c.exitTest).every(c => matches(c.done));       // everything in this chapter done (apart from a test)
function getTasks(){   // the tasks to show now: the area's tasks whose if matches
  return AREA.tasks.filter(t => matches(t.if)).map(t => {
    if (t.arrow && t.arrow.sparkle) return {id:fill(t.id, true), text:fill(t.text, false, true), target:sparkleToFind(), arrow:true, main:!!t.main, where:whereText(t.where)};   // or {sparkle}: the nearest thing that sparkles
    const c = typeof t.arrow === 'string' ? ALL_NPCS.find(n => n.id === t.arrow) : t.arrow && t.arrow.nearest ? nearestOf(t.arrow.nearest) : null;   // an arrow to a character (or the nearest of several)
    const toPlace = t.arrow && t.arrow.place;   // or {place}: the way to a place, and none once you're there
    const at = c ? [c.x, c.y, c.place] : toPlace || (t.arrow && t.arrow.nearest) ? null : t.arrow || null, there = toPlace || (at && placeOf(at));
    const target = toPlace ? (there === PLACE ? null : wayTo(there)) : !at ? null : there === PLACE ? [at[0], at[1]] : wayTo(there);   // in another place, the arrow points the way there
    return {id:fill(t.id, true), text:fill(t.text, false, true), target, arrow:!!t.arrow, main:!!t.main, ...(c && there === PLACE ? {npc:true} : {}),
      where:whereText(t.where || there),
      ...(t.clue && hiding() ? {clue:hideSpot(hideState().spot)} : {})};   // clue: hide and seek's, to hear again (js/hide.js)
  });
}
// Where a task is done, under it on the Tasks page (decided 5 November 2026: the hens to catch were somewhere, but where?):
// the place its arrow points at, or its own where (a place's id, or a few words, such as the sea or the village's stream);
// a place only while you're somewhere else.
function whereText(w){
  if (!w || w === 'hut') return null;
  if (!PLACES[w]) return fill(w, false, true);
  return w === PLACE ? null : PLACES[w].name.en;
}
// The nearest of several characters (nearest: each {who, if}, those whose if matches), such as the hens still loose about
// the village: here, the closest; or else the first, wherever they are.
function nearestOf(list){
  const ns = list.filter(e => !e.if || matches(e.if)).map(e => ALL_NPCS.find(n => n.id === e.who)).filter(n => n && n.place !== 'hut' && n.place !== 'gone');
  const here_ = ns.filter(n => n.place === PLACE).sort((a, b) => (Math.abs(a.x - pl.x) + Math.abs(a.y - pl.y)) - (Math.abs(b.x - pl.x) + Math.abs(b.y - pl.y)));
  return here_[0] || ns[0] || null;
}
// The one task the yellow arrow shows the way for: the newest, the last to come up (S.tasksSeen keeps the order they came
// up in), or the one you chose on the Tasks page instead (followTask(): it counts as newest, till another comes up). None
// if that one has no arrow, such as hide and seek, so an arrow never points somewhere else as if it were the way there
// (decided 27 October 2026: playing hide and seek, a player followed the cow's arrow, thinking it was where the little
// monkey had gone). (Tasks that came up together, or in a game saved before this: the first with an arrow.)
function aimedTask(tasks = getTasks()){
  const order = t => S.tasksSeen[t.id] || Infinity;   // (one not announced yet: the newest of all)
  let best = null;
  for (const t of tasks) if (!best || order(t) > order(best) || (order(t) === order(best) && !best.arrow && t.arrow)) best = t;
  return best && best.arrow ? best : null;
}
const newestSeen = () => Math.max(1, ...Object.values(S.tasksSeen).map(Number).filter(n => n > 0));
function followTask(id){ S.tasksSeen[id] = newestSeen() + 1; save(); }   // the arrow shows the way for this task now
// Does a sparkle (AREA.sparkles) sparkle now? Until you know its word, while its if matches, and not on a square that
// teaches another word first (such as the forest, which only sparkles once you know 树).
const sparkling = s => !(s.word && lvl(s.word) > 0) && (!s.if || matches(s.if)) && !(tileAt(...s.at).learnFirst && lvl(tileAt(...s.at).learnFirst) === 0);
// For a task's arrow {sparkle}, such as your first words: the nearest thing in this place that sparkles for a word you
// don't know yet, or null if there's none. It stays on that one until you learn it, so it doesn't jump about as you walk.
let sparkleAimed = null;
function sparkleToFind(){
  const left = SPARKLES.filter(s => s.word && sparkling(s)), far = s => Math.abs(s.at[0] - pl.x) + Math.abs(s.at[1] - pl.y);
  if (!left.includes(sparkleAimed)) sparkleAimed = left.sort((a, b) => far(a) - far(b))[0] || null;
  return sparkleAimed && [sparkleAimed.at[0], sparkleAimed.at[1]];
}
// The way out of the place you're in towards another place: the exit to take first on the shortest
// route (through ways that are open), or null if there's none.
function wayTo(place){
  const seen = new Set([PLACE]), queue = (PLACES[PLACE].exits || []).filter(isOpen).map(e => ({first:e, to:e.to}));
  while (queue.length){
    const {first, to} = queue.shift();
    if (to === place) return [first.at[0], first.at[1]];
    if (seen.has(to)) continue;
    seen.add(to);
    for (const e of (PLACES[to].exits || []).filter(isOpen)) queue.push({first, to:e.to});
  }
  return null;
}
// The squares of the way you'd walk from where you stand to a task's target in this place, until you're beside it: round
// water and rock, down a bank but never up one, and through no other way out of the place; or null if there's none. Worked
// out again only when you've moved, or the target or the map has changed.
let routeMemo = {key:null, path:null};
// Every square you could walk to from where you stand (as routeTo walks: down banks, over stepping stones, round
// everyone standing about), as 'x,y'.
function walkableFromYou(){
  const seen = new Set([pl.x + ',' + pl.y]), queue = [[pl.x, pl.y]];
  for (let i = 0; i < queue.length; i++){
    const [x, y] = queue[i];
    for (const [d, [dx, dy]] of Object.entries(DV)){
      let nx = x + dx, ny = y + dy;
      if (tileAt(nx, ny).ledge){ if (d !== 'down') continue; while (tileAt(nx, ny).ledge) ny++; }
      if (!(tileAt(nx, ny).walk || tileAt(nx, ny).hop) || exitAt(nx, ny) || npcAt(nx, ny) || seen.has(nx + ',' + ny)) continue;
      seen.add(nx + ',' + ny); queue.push([nx, ny]);
    }
  }
  return seen;
}
function routeTo([tx, ty]){
  const key = `${PLACE}|${pl.x},${pl.y}|${tx},${ty}|${mapStory}`;
  if (routeMemo.key === key) return routeMemo.path;
  const back = new Map([[pl.x + ',' + pl.y, null]]), queue = [[pl.x, pl.y]];
  let end = null;
  for (let i = 0; i < queue.length && !end; i++){
    const [x, y] = queue[i];
    if (Math.abs(x - tx) + Math.abs(y - ty) <= 1){ end = [x, y]; break; }
    for (const [d, [dx, dy]] of Object.entries(DV)){
      let nx = x + dx, ny = y + dy;
      if (tileAt(nx, ny).ledge){ if (d !== 'down') continue; while (tileAt(nx, ny).ledge) ny++; }   // down a bank in one hop
      if (!(tileAt(nx, ny).walk || tileAt(nx, ny).hop) || exitAt(nx, ny) || back.has(nx + ',' + ny)) continue;   // (over stepping stones, hopping)
      back.set(nx + ',' + ny, [x, y]); queue.push([nx, ny]);
    }
  }
  const path = [];
  for (let p = end; p; p = back.get(p[0] + ',' + p[1])) path.unshift(p);
  routeMemo = {key, path:end ? path : null};
  return routeMemo.path;
}
// Where a task's arrow points (seen: whether a square is on the screen): at the target, if it's on the screen; if not, where
// the way you'd walk there leaves the screen (decided 26 October 2026: on the mountain path it pointed straight at the
// way out, up the grassy banks you can't climb, when the way round is up the stone steps), or straight at it if there's
// no way from here.
function arrowAim(target, seen){
  if (seen(target)) return target;
  const path = routeTo(target);
  return (path && path.find(p => !seen(p))) || target;
}
function tasksHint(){ const h = AREA.hints.find(h => matches(h.if)); return h ? fill(h.text, false, true) : ''; }
// Where you practise your words now (the area's practiseAt: the first whose if matches), such as at the practice post.
const practiseWhere = () => ((AREA.practiseAt || []).find(p => !p.if || matches(p.if)) || {}).text || '';
function goalText(){ const t = getTasks(); return t.length ? t.map(x => x.text).join('. ') + '.' : tasksHint(); }
function facing(){ const [dx,dy] = DV[pl.dir]; return [pl.x + dx, pl.y + dy]; }
function promptFor(x, y){
  const n = npcAt(x, y) || followerAt(x, y);
  if (n && n.asleep) return 'Look';   // (asleep for the night: js/daynight.js)
  if (n){ const p = talkPart(n); return (p && p.label) || n.label || 'Talk'; }   // (what their talk says A does, such as Pull at a cart)
  if (animalAt(x, y)) return asleepNow(animalAt(x, y)) ? 'Look' : 'Meet';   // (one asleep, for the night or the day: animalAsleep)
  if (BIRD_WORD && birdAt(x, y)) return 'Look';
  const way = exitAt(x, y);
  if (way && way.by === 'A' && isOpen(way)) return way.label || 'Go';   // a way you go through by pressing A, such as jumping through the waterfall
  if (hideSpotAt(x, y)) return 'Look';   // where a little monkey playing hide and seek might be (js/hide.js)
  const thing = thingLabel(x, y); if (thing) return thing;   // a treasure, or something for the cave (js/trade.js)
  const spot = spotLook(x, y);
  if (spot) return spot.label || 'Look';
  const t = tileAt(x, y);
  if (t.hop) return hopAhead() ? 'Hop' : '';   // stepping stones, up or down in front of you
  if (t.ask && lvl(t.word) === 0) return AREA.asking && matches({knows:AREA.asking.word}) && nearestPerson() ? AREA.asking.label : 'Look';   // (something to ask about)
  const look = t.onLook && t.onLook.find(p => !p.if || matches(p.if));
  if (look && look.label) return look.label;   // the tile's own steps say what A does, such as Sleep in a bed
  if (t.gather && canGather(t.gather) && !looksFirst(t)) return t.gather.label;
  if (canPick(t) && !looksFirst(t)) return t.pick.label || 'Pick';
  if (t.fishing && canFish() && !looksFirst(t)) return 'Fish';
  if (t.landmark && (look || t.word || t.action)) return t.label || 'Look';   // (only where A does something: never Look, then nothing)
  const w = lookWord(t);
  return w && (lvl(w) === 0 || (w === t.word && t.colour && lvl(t.colour) >= 1)) ? 'Look' : '';   // (something new, or something of a colour you know: lookAt)
}
const COUNTS = {   // what a counter in the content can count
  progress: c => here()[c.key] || 0,   // a number the area remembers (key), such as how many bee friends you've made
  shooed: () => here().shooed.length,   // how many birds you've shooed off (shooAway), such as from the wild melons
  wordsLearned: () => learnedCount(),
  animalsFound: c => metCount(c.chapter || 0, c.place, c.group),   // (a chapter's animals: chapter, 0 if not given; or one place's in it; or a group's, such as the night animals)
  animals: c => chapterAnimals(c.chapter || 0, c.place, c.group).length,
  animalsLeft: c => chapterAnimals(c.chapter || 0, c.place, c.group).length - metCount(c.chapter || 0, c.place, c.group),
  shells: () => S.shells,
  coins: () => S.coins || 0,
  picked: c => (here().picked[c.request] || []).length,
  practised: () => ((AREA.lessonGap || {}).questions || 0) - practiceLeft(),   // questions you've answered since your last lesson that taught a new word (up to its lessonGap)
  since: c => Math.max(0, (S.turn || 0) - (here()[c.key] || 0)),   // questions you've answered anywhere since the countFrom step started counting them (key), such as the thirsty monkey's 8 making yoghurt
  known: c => c.words.filter(w => lvl(w) >= 1).length,   // how many of these words you've caught
  flags: c => c.keys.filter(k => !!here()[k]).length   // how many of these things the area remembers have happened (keys), such as the hens you've carried back to their yard
};
function counter(name){ const c = AREA.counters[name], n = COUNTS[c.count](c) - (c.minus || 0); return c.max === undefined ? n : Math.min(n, c.max); }
// What a counter of words you know (count: known) still waits for: those you haven't caught, as the counter calls them in
// English (called, such as 'the fish in the pond'; or else the word's English), such as 'the river, the fish in the pond
// and a bird'.
function stillToFind(name){
  const c = AREA.counters[name], left = c.words.filter(w => lvl(w) < 1).map(w => (c.called || {})[w] || enOf(w));
  return left.length < 2 ? left.join('') : left.slice(0, -1).join(', ') + ' and ' + left[left.length - 1];
}
const compare = (have, want) => (want !== null && typeof want === 'object'
  ? (want.atLeast === undefined || have >= want.atLeast) && (want.below === undefined || have < want.below)
  : have === want);
function matches(cond){   // does the game match everything in an if?
  return Object.entries(cond).every(([k, v]) => {
    if (k === 'new') return lvl(v) === 0;
    if (k === 'knows') return lvl(v) >= 1;
    if (k === 'holding') return Object.entries(v).every(([id, want]) => { const h = here().holding[id]; return want === true ? !!h : want === false ? !h : h === want; });
    if (k === 'wanted') return Object.entries(v).every(([id, want]) => { const h = (here().wanted || {})[id]; return want === true ? !!h : want === false ? !h : h === want; });
    if (k === 'bought') return Object.entries(v).every(([item, want]) => here().bought.includes(item) === want);
    if (k === 'canBuy') return typeof v === 'string' ? canBuy(SHOPS[v]) : canBuy() === v;   // there's something in the shop you could buy now, that you don't have (the 老板's ?), or in one shop, by its id, such as 'home'
    if (k === 'inBag') return Object.entries(v).every(([w, want]) => ((S.bag[w] || 0) > 0) === want);   // what's in your bag, such as {'米饭':true}
    if (k === 'ready') return chapterDone() === v;
    if (k === 'place') return PLACE === v;   // the place you're in
    if (k === 'away') return ![].concat(v).includes(PLACE);   // anywhere but this place (or these), such as a task that leads you back there (decided 6 November 2026)
    if (k === 'hurt') return hurt() === v;   // you've lost health in a battle
    if (k === 'practice') return trainingCalls() === v;   // some of your words need practice (the practice post's !)
    if (k === 'lesson') return !!lessonNow() === v;       // a lesson series at school has a new word ready for you
    if (k === 'wordReady') return !wordLeft() === v;   // you've answered the area's wordGap questions since your last new word (as a talk part's waits), so an event can teach one
    if (k === 'lessonWaits') return (!lessonNow() && !!lessonNow(false)) === v;   // it has, but it waits till you've practised (lessonGap)
    if (k === 'near'){ const n = NPCS.find(c => c.id === v); return !!n && Math.abs(n.x - pl.x) + Math.abs(n.y - pl.y) === 1; }   // you're right beside this character
    if (k === 'at') return placeOf(v) === PLACE && pl.x === v[0] && pl.y === v[1];   // you're standing here: [x, y], or [x, y, 'place']
    if (k === 'hiding') return hiding() === v;   // a little monkey is hiding, playing hide and seek with you (js/hide.js)
    if (k === 'hidesFound') return compare(here().hide.won, v);   // how many times you've found it
    if (k === 'around'){ const d = v[3] ?? AROUND; return placeOf(v) === PLACE && Math.abs(pl.x - v[0]) <= d && Math.abs(pl.y - v[1]) <= d; }   // you're near here, as you come up to it (within so many squares: [x, y, 'place', squares])
    if (k === 'friends') return Object.entries(v).every(([id, want]) => S.friends.includes(id) === want);   // who's your friend, such as {goat:true}
    if (k === 'following') return Object.entries(v).every(([id, want]) => S.following.includes(id) === want);   // who's following you (the follow step), such as {cow:true}
    if (k === 'carrying') return (here().carrying ? here().carrying.word : false) === v;   // what you're carrying for someone (the carry step), such as 水, or false
    if (k === 'lifted') return (here().lifted || false) === v;   // what you're carrying over your head (the lift step), such as 'sack', or false
    if (k === 'form') return (pl.form || null) === v;   // what you've changed into just now (turnInto with keep), such as a little demon
    if (k === 'any') return v.some(matches);   // any of these, such as the way south: for the cow, or the garden's melon field
    if (k === 'sealsWaiting') return (sealsWaiting().length > 0) === v;   // a page of your scroll is full, and not sealed yet (js/scrolls.js)
    if (k === 'hasScroll') return !!S.scroll.has === v;   // the old monkey has given you his scroll
    if (k === 'tool') return (S.tools || []).includes(v);   // a tool you've bought, such as the spade (js/trade.js)
    if (k === 'decor') return (S.decor || []).includes(v);   // something for the cave you've bought, set up there
    if (k === 'decorWaiting') return ((S.decorNew || []).length > 0) === v;   // something for the cave you've bought, still to set up there
    if (k === 'jarFish') return !!S.jarFish === v;   // a little fish lives in your fish jar
    if (k === 'treasures') return TREASURE_WORDS.some(w => (S.bag[w] || 0) > 0) === v;   // you're carrying a treasure to sell
    if (k === 'night') return isNight() === v;   // it's night (js/daynight.js), such as the first night, teaching 晚上
    if (k === 'raining') return typeof v === 'string' ? rainHere() === v : rainingHere() === v;   // it's raining where you are, outdoors, such as the first rain, teaching 下雨; or raining 'heavy' (teaching 大雨) or 'light'
    if (AREA.counters[k]) return compare(counter(k), v);
    return compare(here()[k], v);
  });
}
const CALL_MS = 900;   // how long a character's ! shows before they talk to you, when they stop you (the stopsYou step)
const LEAP_MS = 450;   // how long a leap takes, when someone stops following you and goes to their place (the follow step)
const FLY_MS = 1500;   // how long those flying off together take, one a little after another (the fly step)
let flyers = null;     // those flying off now: {a, from: their squares, to, t0} (drawFlyers, js/draw.js)
const STEP_OPTIONS = {quiz:['label'], tour:['ask','label'], carry:['howMany','inHand','each','ask','took'], hit:['with','times'], eat:['note'], sail:['ask','go'], practise:['label','pic'], climb:['pulls','label','pic'], fetch:['asks','right','wrong','wrongNote','listen','done'], spy:['things','rounds','listen','found','wrong','done','ask','going','stopped'], turnInto:['label','ms','word','keep'], coins:['note'], pay:['note'], goTo:['at','facing'], say:['teach','hint','showTasks','ok','by'], newWord:['note','met'], leap:['from','to'], fly:['to'], card:['note'], give:['note'], battle:['win','out','meet','boss','back','lost','retry'], bag:['note'], shells:['note'], match:['stop','notYet','words'], reply:['about','pic'],
  change:['at'], collect:['for','count','note','each','full','quiet'], leadTo:['you'], hold:['for'], lesson:['by'], grab:['label','missed'], follow:['park'], walk:['from','to','ms','stomp'], sleep:['room'], sell:['first'], decorate:['by', 'line']};   // extra settings a step can have
const COUNTING = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];   // counting aloud as you collect things (the collect step), and in number lessons
const COUNT_GAME = 3;   // counting questions in a counting game (the countGame step)
const COUNT_MS = 900;   // a count said as each one's done, one after another (the carry step's each): how long it has, at least, before the next begins
// How many there are: as when counting, but two things are 两 (liǎng), two of something, never 二, which is for counting
// (decided 21 October 2026; and 9 November 2026, when 两 became the second maths lesson's word, explained beside 二, so
// two things can be counted at last): number questions, counting games and the how-many card.
const HOW_MANY_WORDS = ['一', '两', '三', '四', '五', '六', '七', '八', '九', '十'];
const howManyOf = w => HOW_MANY_WORDS.indexOf(w) + 1;   // (0: not a how-many word, such as 二)
// How many things you could count with the numbers you know (two, once you know 两).
const countable = () => HOW_MANY_WORDS.map((w, i) => i + 1).filter(n => WORDS[HOW_MANY_WORDS[n - 1]] && lvl(HOW_MANY_WORDS[n - 1]) >= 1);
// 两, taught just before a card that shows it, to a game that doesn't know it yet (one from before it was a lesson at
// school): the How many card (the carry step), its card and, as with any new word, 二 or 两? after it.
const TWO_NOTE = 'Two of something is 两: you’ll see it on the next card, How many? Counting is still 二: 一，二，三！';
async function knowTwo(){ const two = HOW_MANY_WORDS[1]; if (WORDS[two] && lvl(two) === 0) await showNotice(two, {note:TWO_NOTE}); }
// The area's lesson series (AREA.lessons) are the school's subjects, chosen on its timetable (js/timetable.js), where
// lessonNow and practiceLeft are.
const LESSON_KINDS = {count:countLesson, paint:paintLesson};   // how each kind of lesson series goes (js/quiz.js)
// The parts of the school painted so far (a lesson series' paint: which part each of its colours paints), each with its
// colour: those of the colours you've learned. (js/art.js draws them.)
function paintedParts(){
  const out = {};
  for (const series of AREA.lessons || []) for (const [w, part] of Object.entries(series.paint || {})) if (lvl(w) >= 1) out[part] = w;
  return out;
}
const paintsPart = w => (AREA.lessons || []).map(series => (series.paint || {})[w]).find(Boolean);   // the part a colour paints
// Swinging your stick (the hit step): how long it takes, how far through it the stick strikes, and the swing now (when it
// began, and the square it strikes), drawn by js/draw.js.
const SWING_MS = 420, SWING_CONTACT = .45;
let swing = null;
// What your monkey is doing right now, drawn as it does it (its picture: ACTS, js/draw.js): sweeping, filling a bucket,
// lifting a sack, turning a key, picking fruit. Doing something always shows: nothing just vanishes, or turns up in your
// bag (decided 6 November 2026, after playing it: the heaps of leaves just vanished). Its kind, when it began (t0), the
// square it's done to (x, y), and whatever else its picture needs.
let acting = null;
function startAct(kind, o = {}){ const [x, y] = facing(); return acting = {kind, t0:performance.now(), x, y, dir:pl.dir, ...o}; }
// How long each takes (ms), and when its moments come: the strokes of a broom; a bucket going down into the water,
// and coming up again; a sack going up over your head, and off; a key turning, and the door opening; a fruit falling
// into your hands.
const SWEEP = {strokes:3, stroke:340};
const DIP = {ms:1300, down:300, up:650, back:1000};
const LIFT = {ms:650, up:380};      // heaving something up over your head: how long, and when it's up
const PUT = {ms:700, down:420};     // putting it down: how long, and when it's down
const UNLOCK = {ms:1050, turn:430, open:520, opened:880};
const PICK = {ms:1150, fall:140, caught:560};
// A little monkey in training (practises, in the area's characters) swings its stick now and then, facing its own way,
// while you're not beside it; beside it, it turns to you, as anyone does to talk. Each begins a swing every PRACTICE_MS,
// at its own time (practiceT), with a soft swish when you're near (practiceSounds).
const PRACTICE_MS = 2300;
const PRACTISES = new Set(AREA.characters.filter(c => c.practises).map(c => c.id));
const practiceT = n => n.x * 397 + n.y * 211;
const practising = n => PRACTISES.has(n.id) && !n.mv && Math.abs(n.x - pl.x) + Math.abs(n.y - pl.y) > 1;
function swingStart(n, now){ const ph = (now + practiceT(n)) % PRACTICE_MS; return ph < SWING_MS ? now - ph : null; }   // when its swing now began, if it's swinging
// Monkeys of the troop at play, as in the book (chapter 1: on a hot day the troop plays under the pines and by the stream):
// what each is doing (plays, in the area's characters), all the time, except while you're talking to it, when it turns
// to you. 'tower': piling stones into a tower with the monkey on the other side of it (a stoneTower square between them).
const PLAYS = Object.fromEntries(AREA.characters.filter(c => c.plays).map(c => [c.id, c.plays]));
let talkingTo = null;   // the character you're talking to (talk), if any
const playing = n => !!PLAYS[n.id] && !n.mv && talkingTo !== n.id;
// The tower of stones: the two monkeys take turns to put a stone on it, as high as it will go (each tower a little
// different: heights), then it wobbles, and falls, the stones tumbling down round it; they jump about laughing, gather the
// stones and start again. Each stone takes place ms, landing on the tower land of the way through. How it is now: its
// height for this time (h), what's happening (phase: build, wobble, fall or rest), how far through that it is (k, 0 to 1),
// how many stones are on it (stones), and while building, the stone on its way up (carried: which, by: whose turn, 0 the
// monkey on the left, 1 the one on the right, and lift: how far it's gone, 0 to 1).
const TOWER = {place:850, land:.6, wobble:1000, fall:650, rest:1500, heights:[4, 6, 5]};
let towerShift = 0;   // moves the tower's cycle on, so it can fall just as the story says (topple)
function towerAt(now){
  const lens = TOWER.heights.map(h => h * TOWER.place + TOWER.wobble + TOWER.fall + TOWER.rest);
  let t = (now + towerShift) % lens.reduce((a, b) => a + b, 0), i = 0;
  while (t >= lens[i]){ t -= lens[i]; i++; }
  const h = TOWER.heights[i], built = h * TOWER.place;
  if (t < built){
    const s = Math.floor(t / TOWER.place), k = (t - s * TOWER.place) / TOWER.place, up = k < TOWER.land;
    return {h, phase:'build', k, stones:s + (up ? 0 : 1), carried:up ? s : null, by:s % 2, lift:up ? k / TOWER.land : 1};
  }
  t -= built;
  for (const phase of ['wobble', 'fall', 'rest']){
    if (t < TOWER[phase]) return {h, phase, k:t / TOWER[phase], stones:h, carried:null};
    t -= TOWER[phase];
  }
}
// The tower falls now (the topple step: knocked over, such as by your tail): its cycle moves on to the start of the fall
// of a tower about as tall as it is (the tallest of its heights no taller, or else the shortest).
function topple(now = performance.now()){
  const t = towerAt(now), have = t.phase === 'build' ? t.stones : t.h;
  if (t.phase === 'fall') return;
  const lens = TOWER.heights.map(h => h * TOWER.place + TOWER.wobble + TOWER.fall + TOWER.rest), total = lens.reduce((a, b) => a + b, 0);
  const fits = TOWER.heights.map((h, i) => [h, i]).sort((a, b) => b[0] - a[0]), fit = fits.find(([h]) => h <= have) || fits.at(-1);
  const i = fit[1];
  const at = lens.slice(0, i).reduce((a, b) => a + b, 0) + TOWER.heights[i] * TOWER.place + TOWER.wobble;   // (the start of its fall)
  towerShift = ((at - now) % total + total) % total;
}
// A dragonfly darting about (the area's dragonflies, each over the water in its own patch, and the one a little monkey
// chases, round it): it hovers a moment, then darts to another spot in its box (x0, y0 to x1, y1, in map pixels), every
// `every` ms, somewhere new each time (seed: which dragonfly). Where it is now, and whether it's heading left.
const DART_MS = 160;
function dragonflyAt(box, seed, now, every = 1400){
  const n = Math.floor(now / every), t = now - n * every;
  const spot = i => [box[0] + rnd(seed, i, 801) * (box[2] - box[0]), box[1] + rnd(seed, i, 802) * (box[3] - box[1])];
  const [ax, ay] = spot(n - 1), [bx, by] = spot(n), k = Math.min(1, t / DART_MS), e = 1 - (1 - k) * (1 - k);
  return {x:ax + (bx - ax) * e, y:ay + (by - ay) * e + (k < 1 ? 0 : Math.sin(now / 120 + seed) * .7), left:bx < ax};
}
const dragonflyBox = d => [d.at[0]*T, d.at[1]*T, (d.to[0] + 1)*T, (d.to[1] + 1)*T];   // one of the area's dragonflies' patch, in map pixels
// 'dragonflies': a little monkey chasing a dragonfly, which darts about round it (chaseBox): every CHASE_MS it leaps at
// it, and the dragonfly darts off just as the leap is highest (CHASE_LEAP: how long a leap takes).
const CHASE_MS = 1600, CHASE_LEAP = 420;
const chaseBox = n => [n.x*T - 20, n.y*T - 16, n.x*T + 36, n.y*T + 4];
function chasedAt(n, now){ return dragonflyAt(chaseBox(n), n.x * 31 + n.y, now - CHASE_LEAP / 2, CHASE_MS); }   // its dragonfly
function chaseLeap(now){ const t = now % CHASE_MS; return t < CHASE_LEAP ? Math.sin(t / CHASE_LEAP * Math.PI) : 0; }   // how high in its leap it is (0 to 1)
// 'splash': two little monkeys in the water, splashing each other, taking turns: every SPLASH_MS one throws water over the
// other (by: 0 the one on the left, 1 the one on the right), flying for SPLASH_FLY ms (k, 0 to 1, as it flies).
const SPLASH_MS = 1900, SPLASH_FLY = 650;
function splashAt(now){ const n = Math.floor(now / SPLASH_MS), t = now - n * SPLASH_MS; return {n, by:n % 2, k:t < SPLASH_FLY ? t / SPLASH_FLY : null}; }
// 'groom': two little monkeys grooming each other, as monkeys do with their friends, taking turns: every GROOM_MS the other
// one has its turn (who: 0, the one on the left grooms the one on the right; 1, the other way round).
const GROOM_MS = 9000;
function groomAt(now){ return {who:Math.floor(now / GROOM_MS) % 2}; }
// The troop marking out ground as you watch (the markOut step): when each stake is hammered in, when the string is pulled
// tight round them, when the new ground fades in (with its sign and path), and when it's done, in ms; and what's being
// marked out: {t0, changed: the squares that change, fresh: their new look, box: the plot's squares, x0 y0 to x1 y1; hold:
// a moment to show it at, still, as the screens gallery does}.
const MARK = {stakes:[150, 420, 690, 960], string:[1150, 1650], ground:[1750, 2300], end:2500};
// Planting as you watch (the plant step), with what's being planted in marking too (grow: true): a square every each ms,
// each growing up out of the ground in grow ms.
const PLANT = {each:380, grow:450};
let marking = null;
// The troop setting something up as you watch (the setUp step): a new piece every each ms, then a moment to see it whole
// (after); and what's going up: {objects: the new big objects, stage: how many of their pieces are up}.
const SET_UP = {each:520, after:600};
let settingUp = null;
const AROUND = 3;   // how near a square you are for around (an if), as you come up to it: this many squares away, or nearer
const mapLooks = () => MAP.map((r, y) => [...r].map((c, x) => tileAt(x, y).look));
function markingOf(was){   // what's being marked out, now the story has changed (was: each square's look before)
  const now = mapLooks(), changed = [];
  now.forEach((row, y) => row.forEach((look, x) => { if (look !== was[y][x]) changed.push([x, y]); }));
  if (!changed.length) return null;
  const fresh = document.createElement('canvas'); fresh.width = COLS*T; fresh.height = ROWS*T;
  const fg = fresh.getContext('2d'); changed.forEach(([x, y]) => LOOKS[now[y][x]](fg, x*T, y*T, x, y));
  const plot = changed.filter(([x, y]) => PLOTS.includes(now[y][x])), xs = plot.map(p => p[0]), ys = plot.map(p => p[1]);
  return {t0:performance.now(), changed, fresh, box:plot.length ? {x0:Math.min(...xs), y0:Math.min(...ys), x1:Math.max(...xs), y1:Math.max(...ys)} : null};
}
// You're standing where something is being set up (setUp): you step aside first, to the nearest square you can stand
// on, and turn to watch it go up (decided 27 October 2026: the little dairy went up around you, and you were moved after).
async function stepAside(objects){
  if (tileAt(pl.x, pl.y).walk) return;
  const seen = new Set([squareKey(pl.x, pl.y)]), queue = [[pl.x, pl.y]];
  let to = null;
  while (queue.length && !to){
    const [x, y] = queue.shift();
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]){   // (the nearest first: up, down, left, right)
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || seen.has(squareKey(nx, ny))) continue;
      seen.add(squareKey(nx, ny));
      if (walkable(nx, ny)){ to = [nx, ny]; break; }
      queue.push([nx, ny]);
    }
  }
  if (!to) return;
  const next = Math.abs(to[0] - pl.x) + Math.abs(to[1] - pl.y) === 1;
  pl.dir = dirOf(to[0] - pl.x, to[1] - pl.y);
  if (next){ pl.mv = {fx:pl.x, fy:pl.y, tx:to[0], ty:to[1], t0:performance.now(), dur:walkMs(), led:true}; await sleep(walkMs() + 40); }
  else { pl.x = to[0]; pl.y = to[1]; pl.px = pl.x * T; pl.py = pl.y * T; }
  const o = objects[0], cx = o.x + ((o.w || 1) - 1) / 2, cy = o.y + ((o.h || 1) - 1) / 2;   // then you turn to watch it
  pl.dir = Math.abs(cx - pl.x) > Math.abs(cy - pl.y) ? (cx < pl.x ? 'left' : 'right') : (cy < pl.y ? 'up' : 'down');
}
const STEPS = {   // what each step in the content's do-lists does; who is the character you're talking to; last, whether it's the last thing in the conversation (runSteps)
  async say(s, who, last){
    const hint = s.showTasks ? goalText() || fill(s.hint) : s.hint && fill(s.hint), opts = {};
    if (s.teach) opts.teach = s.teach;
    if (hint) opts.hint = hint;
    if (s.ok) opts.ok = s.ok;
    if (last) opts.last = true;
    await showDialog(speaker(s.by || who), L[s.say], opts);   // by: someone else says it, during this conversation
  },
  // A sentence to finish by filling the gap, such as your answer to a question: sentence, its English (en),
  // and the missing word (word); others: the wrong answers to choose from (those you know), such as 大 for 小; pic: a
  // picture over it instead of who's talking, such as the fish you've caught. Its words you know count as used.
  async gap(s, who){
    const t = toks(s.gap.sentence);
    await gapQ({who:s.gap.pic ? `<span class="ico">${picHTML(s.gap.pic)}</span>` : speaker(who), t, en:s.gap.en, gap:s.gap.word, ...(s.gap.others ? {wrong:s.gap.others} : {})});
    t.filter(w => lvl(w) >= 1).forEach(useWord);
  },
  // A scene told like the opening (one of the area's scenes): pictures and captions, read aloud; then the game carries on.
  async scene(s){ await storyScene(s.scene); },
  // The story's next part begins now, with its card, if one has (as after anything you do), such as a season of the master's
  // year as you wake to it, before its word.
  async nextPart(){ await partsCheck(); },
  // A new chapter of the story begins: its title card, and its checklist from then on.
  async chapter(s){
    here().chapter = s.chapter; save(); SFX.fanfare();
    const c = AREA.chapters[s.chapter];
    await new Promise(res => {
      openCard(`<div class="chaptercard"><p class="label">${esc(c.name)}</p><h2>${esc(c.title)}</h2></div><div class="actions"><button class="btn primary" data-a="ok">Begin</button></div>`);
      on('[data-a=ok]', () => { closeCard(); res(); });
    });
  },
  // (quiet when a character teaches it; but said straight away when it's theirs, as you meet them, met: such as the queen bee)
  async newWord(s, who){ if (lvl(s.newWord) === 0) await showNotice(s.newWord, {...(s.note ? {note:fill(s.note)} : {}), quiet:!!who && !s.met}); },
  async card(s, who){ await showNotice(s.card, {...(s.note ? {note:fill(s.note)} : {}), quiet:!!who}); },
  set(s){ Object.assign(here(), s.set); save(); placeCharacters(); refreshMap(); },
  // You're given something for a request (for), such as the cow's milk, its thank-you, for the thirsty monkey: you hold it
  // till you take it to them.
  hold(s){ here().holding[s.for] = s.hold; save(); },
  // Starts counting the questions you answer from now on, anywhere (S.turn), kept in the area's progress (countFrom: its
  // key), for a counter that counts them (since), such as the 8 questions the thirsty monkey's yoghurt takes to make.
  countFrom(s){ here()[s.countFrom] = S.turn || 0; save(); },
  async request(s, who, last){ await request(REQUESTS.find(r => r.id === s.request), speaker(who), last); },
  async shop(s, who){ await shop(speaker(who), typeof s.shop === 'string' ? SHOPS[s.shop] : Object.values(SHOPS).find(sh => sh.who === who) || Object.values(SHOPS)[0]); },   // (shop: which, for an area with several)
  // win: what happens if you win, such as a present; lost: if you don't; practice: a game for nothing but practice. A big
  // game, such as the queen bee's, can have more questions (questions), end at so many wrong answers (misses), have
  // sentences with a word missing among them (gaps), and say what happens if you don't win (lose: a message).
  async wordGame(s, who, last){
    const g = s.wordGame;
    if (!canEncounter()){ toast(g.notYet); return; }
    if (!(await confirmBox(speaker(who), fill(g.ask), g.yes || 'Play', 'Not now'))) return;   // (yes: its button, Play unless it says)
    SFX.encounter();
    const justTaught = caughtBefore !== null && caughtCount() > caughtBefore;   // (its name, as you've just met it: no English on its plate)
    const won = await encounter({id:who, hz:g.word, img:portrait(who), wild:false, name:NAMES[who], practice:!!g.practice, justTaught, questions:g.questions, misses:g.misses, gaps:g.gaps, lose:g.lose, asks:g.asks});
    if (won && g.win) await runSteps(g.win, who, last);
    if (!won && g.lost) await runSteps(g.lost, who, last);
  },
  // Counting with the one you're talking to (countGame: one of the area's countGames), such as the stones in the little
  // monkeys' tower on the hillside: COUNT_GAME counting questions, as in a number lesson (js/quiz.js), each about a
  // different number you know (those needing practice first), each right answer earning a 🐚 if that number needed
  // practice; and if you get them all right, its win. Till you know three numbers to count with (二 isn't one: two things
  // are 两, once you know it), its notYet message instead.
  async countGame(s, who, last){
    const g = AREA.countGames[s.countGame], nums = countable();
    if (nums.length < 3){ if (who) await showNarration(fill(g.notYet), last); else toast(fill(g.notYet)); return; }
    if (!await confirmBox(speaker(who), fill(g.start), 'Count', 'Not now')) return STOP;
    const asks = shuffle(nums).sort((a, c) => needsPractice(HOW_MANY_WORDS[c - 1]) - needsPractice(HOW_MANY_WORDS[a - 1])).slice(0, COUNT_GAME);
    let right = 0, shells = 0;
    for (const n of asks){
      const need = needsPractice(HOW_MANY_WORDS[n - 1]);
      if (await countQ({who, thing:g.thing, n})){ right++; if (need) shells++; }
    }
    earn(shells); save();
    const all = right === asks.length;
    if (all){ SFX.fanfare(); if (g.win) await runSteps(g.win, who); }
    const text = `You counted ${all ? `all ${right}` : `${right} of ${asks.length}`} right.${shells ? ` +${shells} ${MONEY()}` : ''}`;
    if (who) await showNarration(text, last); else toast(text);
  },
  async hideSeek(s, who, last){ return hideSeek(who, last); },   // hide and seek with the one you're talking to (js/hide.js)
  async talkTo(s){ const n = NPCS.find(c => c.id === s.talkTo); if (n) await talk(n); },   // talking to someone, such as A at the little monkeys' tower talking to them
  // Going straight on (goOn): the one you're talking to goes on to what they have for you next, if they have something (a
  // ! or ? over them, and a part you haven't just had: hasNews), as you're talking to them already, so no task ever tells
  // you to go and see someone you're standing with (decided 6 November 2026, after playing it: bringing the senior pupil
  // his water, a new task said to go and see him). A part that teaches a new word offers a quick word game first, as ever.
  async goOn(s, who){ const n = typeof who === 'string' ? NPCS.find(c => c.id === who) : who; if (n && hasNews(n)) await talk(n); },
  // Match the words you've learned (with pictures) to their pictures, as at the practice post (title: its heading;
  // stop: the button to stop). Stopping ends the conversation there, with notYet as a message.
  async match(s){
    const words = shuffle((s.words || ORDER).filter(w => WORDS[w] && WORDS[w].pic && lvl(w) >= 1));   // (words: just these, such as the meadow's; only those you know)
    const missed = await matchWords(words, s.match, s.stop || 'Not now');
    if (!missed){ if (s.notYet) toast(fill(s.notYet)); return STOP; }
    for (const w of words){ reviewed(w, !missed.has(w)); addToday(w); } save();   // (each word counts as practice, as in the exam)
    closeCard(); SFX.fanfare();   // all matched: on with the conversation
  },
  async shells(s, who, last){   // shells for you, such as a present (in a conversation, the message waits in the speech box); coins, once they're your money
    earn(s.shells); save(); SFX.right();
    const text = fill(s.note || `You get ${s.shells} ${MONEY()}.`);
    if (who) await showNarration(text, last); else toast(text);
  },
  // Food for your bag, if there's room (in a conversation, the message waits in the speech box). With no room, the one
  // giving it keeps it for you (here().kept), and what comes after it (your thanks) waits until you come back with room
  // (decided 24 October 2026: it said your bag was full, then you thanked them for it anyway). ends: whether the list
  // it's in ends the conversation.
  async bag(s, who, last, ends){
    if (intoBag(s.bag)){
      if (who && here().kept[who]){ delete here().kept[who]; save(); }
      const text = fill(s.note || `A {${s.bag}} for your bag.`);
      if (who) await showNarration(text, last); else toast(text);
      return;
    }
    if (!who){ toast(`Your bag is full of ${wz(s.bag)}.`); return; }
    const again = here().kept[who] === s.bag;
    here().kept = {...here().kept, [who]:s.bag}; save();
    await showNarration(`${cap(theName(who))} ${again ? 'still has' : 'offers you'} a ${wz(s.bag)}${again ? ' for you' : ''}, but your bag is full. Come back for it when you have room.`, ends);
    return STOP;
  },
  async reply(s, who, last){ await replyWith(s.reply, {about:s.about, pic:s.pic, who, last}); },   // (about, pic: what you're answering, if it isn't a line just said)
  give(s){ if (!S.wardrobe.owned.includes(s.give)){ S.wardrobe.owned.push(s.give); save(); } if (s.note) toast(fill(s.note)); },
  // The old monkey gives you his scroll, as he checks your first words, so they're the first pictures you see come back
  // (decided 8 November 2026, the polish plan: scrollGiven, js/scrolls.js); and every full page sealed, each with a present.
  async scroll(s, who){ if (!S.scroll.has) await scrollGiven(who); },
  async seal(s, who){ await sealPages(who); },
  // One question on a word (quiz: the word), as in reeling in a fish (catchQ, js/fishing.js), such as straight after the
  // old monkey asks what the cave's beds are (label: what it says over it).
  async quiz(s){ if (lvl(s.quiz) >= 1) await catchQ(s.quiz, 1, 1, null, fill(s.label || 'What is it?')); },
  // Showing someone round (tour: the things, each {word, note}), such as the old monkey in the Water Curtain Cave: at each
  // thing you don't know yet, they ask what it is (ask: the line), its card, then a question on it before the next (decided
  // 8 November 2026, the gentler prologue: four new words in a row there).
  async tour(s, who){
    for (const t of s.tour) if (lvl(t.word) === 0) await runSteps([{say:s.ask}, {newWord:t.word, ...(t.note ? {note:t.note} : {})}, {quiz:t.word, label:s.label}], who);
  },
  rumble(){ buildMap(); SFX.rumble(); shakeT = performance.now(); },
  // The troop marks out ground for something they'll build, as you watch (markOut: what the story becomes then): a stake
  // hammered in at each corner of the plot, the string pulled tight round them, then the ground cleared, with its sign and
  // the path to it, and anything else the story changes then fading in too (decided 21 October 2026: the home ground had
  // its plots before anyone had planned them, and things that just appear look odd).
  async markOut(s){
    const was = mapLooks();
    Object.assign(here(), s.markOut); save(); placeCharacters();
    marking = markingOf(was);
    if (!marking){ refreshMap(); return; }
    let t = 0;
    if (marking.box) for (const at of MARK.stakes){ await sleep(at - t); t = at; SFX.tock(); }   // (each stake, hammered in)
    await sleep(MARK.end - t);
    marking = null; refreshMap();
  },
  // The troop plants something as you watch (plant: what the story becomes then), such as the flowers you've brought, in
  // front of the school: each square that changes grows up out of the ground, one after another, with a little pop.
  async plant(s){
    const was = mapLooks();
    Object.assign(here(), s.plant); save(); placeCharacters();
    marking = markingOf(was);
    if (!marking){ refreshMap(); return; }
    marking.grow = true;
    for (let i = 0; i < marking.changed.length; i++){ if (i) await sleep(PLANT.each); SFX.sprout(); }
    await sleep(PLANT.grow + 150);
    marking = null; refreshMap();
  },
  // The troop sets something up as you watch (setUp: what the story becomes then), such as the feast's big table: each
  // new big object that goes up in pieces (OBJECT_STAGES, js/art.js) is drawn a piece at a time, each with a knock: the
  // table's legs, its top, then each bowl (decided 24 October 2026: things that just appear look odd).
  async setUp(s){
    const was = new Set(mapObjects().map(objectKey));
    Object.assign(here(), s.setUp); save(); placeCharacters();
    const objects = mapObjects().filter(o => !was.has(objectKey(o)) && OBJECT_STAGES[o.look]);
    if (!objects.length){ refreshMap(); return; }
    await stepAside(objects);
    settingUp = {objects:objects.map(o => ({...o, stage:0})), stage:0};   // (one after another, from the top of the map down: each piece a knock)
    for (const o of settingUp.objects) for (let i = 1; i <= OBJECT_STAGES[o.look]; i++){ o.stage = i; settingUp.stage++; SFX.tock(); await sleep(SET_UP.each); }
    await sleep(SET_UP.after);
    settingUp = null; refreshMap();
  },
  sound(s){ if (SFX[s.sound]) SFX[s.sound](); },
  async topple(){ topple(); SFX.clatter(); await sleep(TOWER.fall + 250); },   // the little monkeys' tower falls, now (such as knocked by your tail)   // a sound (one of SFX in js/sound.js), such as a wolf howling far off
  async feastList(){ await feastCard(); },   // the feast's list, such as at its big table: what the troop has, and what it still needs (js/cards.js)
  // You swing your stick at the square you're facing, like Cut and Rock Smash in Pokémon: a whack, and chips fly off it
  // (hit: what it's made of, 'wood' or 'stone').
  // With something else in your hands (with: its word, such as 斧头, an axe, chopping the cave's logs), so many times (times).
  async hit(s){
    const [x, y] = facing();
    for (let i = 0; i < (s.times || 1); i++){
      swing = {t0:performance.now(), x, y, with:s.with}; SFX.swish();
      await sleep(SWING_MS * SWING_CONTACT); SFX.thwack(); burst(x, y, s.hit); shakeT = performance.now() - 400;   // (a little shake)
      await sleep(SWING_MS * (1 - SWING_CONTACT));
    }
  },
  // You sweep the square you're facing with a broom, such as a heap of fallen leaves in the immortal's cave (sweep: what
  // flies off it, 'leaves'): three strokes from side to side, each with a brush of the broom and leaves flying off it,
  // away from you, the most on the last (decided 6 November 2026, after playing it: the heaps just vanished). Then, as a
  // rule, it changes (the change step): the heap's gone.
  async sweep(s){
    const a = startAct('sweep', {what:s.sweep});
    for (let i = 0; i < SWEEP.strokes; i++){
      await sleep(SWEEP.stroke / 2); SFX.sweep(); scatter(a.x, a.y, s.sweep, pl.dir, i === SWEEP.strokes - 1 ? 10 : 4);
      await sleep(SWEEP.stroke / 2);
    }
    acting = null;
  },
  // You step up to the water you're facing, dip a bucket in, with a splash, lift it out full and step back with it at your
  // side (dip: what fills it, such as 水), as you fill one at the cave's pool for the senior pupil (the dip pose, js/poses.js).
  async dip(s){
    const a = startAct('dip', {what:s.dip});
    await sleep(DIP.down); const bk = poseSprite('dip', a.dir, 'in').bucket; splashes.push({x:pl.px + bk[0], y:pl.py + bk[1] + 1, t0:performance.now(), small:true}); SFX.splash(.12);   // (where the bucket goes in)
    await sleep(DIP.ms - DIP.down);
    acting = null;
  },
  // You heave up what you're facing (lift: what it is, such as a sack of rice off the pile) over your head, crouching for
  // it and up, and carry it about, held up over your head as you walk (here().lifted, drawCarrying in js/draw.js; decided
  // 6 November 2026, after playing it: the sacks were thrown onto the boat), till you put it down (putDown).
  async lift(s){
    startAct('lift', {what:s.lift});
    await sleep(LIFT.up); SFX.bump();
    await sleep(LIFT.ms - LIFT.up);
    acting = null; here().lifted = s.lift; save();
  },
  // You put down what you're carrying over your head (putDown: what it is) onto what you face, such as the docker's
  // boat: lowered in front of you and set down, with a thump.
  async putDown(s){
    const a = startAct('putDown', {what:s.putDown}); a.to = putDownAt(a);   // (where it goes, worked out once)
    await sleep(PUT.down); SFX.bump();
    await sleep(PUT.ms - PUT.down);
    acting = null; delete here().lifted; save();
  },
  // You unlock what you're facing with a key (unlock: the key's word, 钥匙), such as a cage in the demon's lair: the key
  // goes into the lock and turns, click, and the door creaks open.
  async unlock(s){
    startAct('unlock', {what:s.unlock});
    await sleep(UNLOCK.turn); SFX.clack();
    await sleep(UNLOCK.open - UNLOCK.turn); SFX.creak();
    await sleep(UNLOCK.ms - UNLOCK.open);
    acting = null;
  },
  // You pick up what you're facing (pickUp: its word, such as 石头) and hold it up, such as a small stone by the stream
  // (pickUpAct), before you collect it: as carry does by itself.
  pickUp(s){ return pickUpAct(s.pickUp); },
  // The square you're facing (or at: [x, y], or [x, y, 'place']) becomes another letter of the legend, for good, such as
  // a dry tree you've knocked down (a stump), or a stone you've picked up (the ground it lay on).
  change(s){
    const [x, y, place] = s.at ? [s.at[0], s.at[1], placeOf(s.at)] : [...facing(), PLACE];
    here().changed[squareKey(x, y, place)] = s.change; save(); refreshMap();
  },
  // You get one of something for a request (for), from the square you're facing, such as a piece of wood from a dry
  // tree, one at a time until you have count of them. The first teaches its word if it's new (you found it yourself:
  // its card, said aloud, with note). You count them aloud in Chinese as you go (一, 二, 三…, with the numbers you
  // know), with a message each time (each), or full once you have them all. It's kept in the save before its card
  // shows, as the square it came from has changed for good already (decided 22 October 2026: a game closed while the
  // card showed lost that piece of wood for good, with no dead pine left to get it from).
  async collect(s){
    const item = s.collect, p = here().picked[s.for] = here().picked[s.for] || [];
    p.push(squareKey(...facing()));
    const n = p.length, all = n >= (s.count || 1), num = COUNTING[n - 1];
    if (all) here().holding[s.for] = item;
    save();
    if (lvl(item) === 0 && !s.quiet) await showNotice(item, s.note ? {note:fill(s.note)} : {});   // (quiet: something that isn't a word to catch, such as lingzhi)
    SFX.right();
    const counted = !!num && lvl(num) >= 1;
    if (counted) say(num);
    // full: what it says once you have them all, or a list of {if, text}, the first that matches (such as the wood: take
    // it back once you have the stones too, or else find them first, so you don't make two trips)
    const full = [].concat(s.full).find(f => typeof f === 'string' || !f.if || matches(f.if));
    toast((counted ? `${wz(num)}! ` : '') + fill(all ? full.text || full : s.each, false, true));
  },
  rest(){ S.health = maxHealth(); save(); SFX.chime(); },   // your health is full again
  // Eating a meal there and then (decided 5 November 2026, after playing it: a bowl of rice is a meal, too big to carry;
  // snacks, 零食, are what goes in your bag): your monkey sits and eats it, munching, a little steam rising, and your health
  // is full again (eat: what; note: what you're told, after).
  async eat(s){
    pl.eating = {w:s.eat, t0:performance.now()};
    for (let i = 0; i < 4; i++){ SFX.scuffle(); await sleep(EAT_MS / 4); }
    pl.eating = null; S.health = maxHealth(); save(); SFX.chime();
    if (s.note) toast(fill(s.note));
  },
  // A class with the character you're talking to (the teacher at school), or with by (from the chart on the classroom
  // wall): the timetable, where you choose a lesson, new or again, or practice (js/timetable.js). If you close it without
  // doing anything, the conversation ends there.
  async lesson(s, who){ if (!await timetable(s.by || who)) return STOP; },
  // Sleep in the bed you're facing: you hop up onto it and lie down under the blanket, the cave goes dim and Zs float
  // up, then you hop down again, sparkling, with your health full (its text: the message then).
  // Where the day goes round (js/daynight.js), it's bedtime: first a recap of your day, with a quick review if you like
  // (or Not now, and you don't sleep), then the night goes by as you sleep, and you wake the next morning, everyone up for
  // the day. room: in your room, behind its door, the door you're facing (the teacher's cave), not up on a bed.
  async sleep(s){
    const bedtime = clockOn();
    if (bedtime && !await bedtimeCard()) return STOP;
    const [bx, by] = facing(), from = [pl.px, pl.py];
    if (!s.room) await hop(bx * T, by * T - 3);   // up onto the bed
    sleepLen = bedtime ? BEDTIME_MS : SLEEP_MS;
    sleepAt = {x:bx, y:by, room:!!s.room, ...(bedtime ? {from:S.clock.t} : {})}; if (!s.room) pl.py = by * T; sleepT = performance.now();
    await sleep(sleepLen / 2); S.health = maxHealth(); save();
    await sleep(sleepLen / 2);
    sleepAt = null;
    if (bedtime) morning();
    if (!s.room){ pl.py = by * T - 3; pl.dir = 'down'; await hop(...from); }   // and down again, facing the room
    S.pos.dir = pl.dir; save(); wakeT = performance.now(); SFX.chime();
    if (bedtime) toast(goodMorning());
    else if (typeof s.sleep === 'string') toast(fill(s.sleep));
  },
  // The next morning, straight away, such as after the master's year's season turns overnight (NEXT_SEASON): a new day.
  morning(){ if (clockOn()) morning(); },
  // A battle with an enemy (battle: its id), and steps if you win (win). out: it jumps out at you first, as a wild one does
  // from long grass, such as the wolf at the rocks as you lead the cow home; meet: what's said as it begins, instead of
  // its own. (What happens if you lose: the area's battles' afterLoss.) In a boss fight (its enemy's bossFight), or one
  // that says retry (losing it would undo a long walk), you can try again on the spot: lost, what you're told then; back,
  // where Not now puts you ({at, facing}), out of the way.
  async battle(s, who){
    const opts = {...(s.meet ? {meet:s.meet} : {}), ...(s.boss ? {boss:true} : {}), ...(s.back ? {back:s.back} : {}), ...(s.lost ? {lost:s.lost} : {}), ...(s.retry ? {retry:true} : {})};   // (boss: one you can't run from)
    if (await (s.out ? wildBattle(s.battle, undefined, opts) : battle(s.battle, opts)) === 'won' && s.win) await runSteps(s.win, who);
  },
  // Characters follow you (follow: their ids, in line, the first right behind you), like Pikachu in Pokémon Yellow; with
  // none, they stop, and each goes to its own place (where its moves say), with a leap if that's here, one after another.
  // park: those who stop stay just where they are, such as the cart you've pulled back to the little monkeys (for a move
  // that says parked: parkAt).
  async follow(s){
    const was = FOLLOWERS, from = was.map(n => [n.x, n.y]);
    if (s.park) for (const n of was) if (!s.follow.includes(n.id)) parkAt(n);
    S.following = [...s.follow]; save();
    placeCharacters();
    trail.length = 0;   // those standing here fall in behind you as you walk; anyone elsewhere comes to you
    for (const n of FOLLOWERS) if (n.place !== PLACE) Object.assign(n, {place:PLACE, x:pl.x, y:pl.y, mv:null});
    const now = performance.now(), going = was.filter((n, i) => !FOLLOWERS.includes(n) && n.place === PLACE && (n.x !== from[i][0] || n.y !== from[i][1]));   // (one parked where it is doesn't leap)
    going.forEach((n, i) => { const [fx, fy] = from[was.indexOf(n)]; n.mv = {fx, fy, t0:now + i * 150, dur:LEAP_MS, far:true}; });
    if (going.length){ SFX.turn(); await sleep(LEAP_MS + 150 * (going.length - 1)); }
  },
  // A character walks somewhere, a step at a time (walk: their id), such as the Demon of Havoc coming down out of his cave
  // towards you (decided 7 November 2026, after playing it: he just appeared, off the screen): from a square (from: where
  // they come out, if not where they are, such as his cave's mouth), to another (to: [x, y], or 'you': the nearest square
  // beside you, then they turn to face you, and you them), each step so long (ms), each a heavy footstep that shakes the
  // ground (stomp). They stay there (parkAt), for a move that says parked, such as while you fight him.
  async walk(s){
    placeCharacters();
    const n = NPCS.find(c => c.id === s.walk);
    if (!n) return;
    if (s.from){ n.x = s.from[0]; n.y = s.from[1]; n.mv = null; }
    held = null; queued = null;   // (you stop where you are, to watch)
    const path = s.to === 'you' ? pathTo([n.x, n.y], [pl.x, pl.y], {free:n}).slice(0, -1) : s.to ? pathTo([n.x, n.y], s.to, {free:n, blocked:[pl.x, pl.y]}) : [];
    const ms = s.ms || STEP;
    for (const [x, y] of path){
      n.mv = {fx:n.x, fy:n.y, t0:performance.now(), dur:ms}; n.dir = dirOf(x - n.x, y - n.y); n.parity = (n.parity || 0) ^ 1; n.x = x; n.y = y;
      if (s.stomp){ await sleep(ms * .55); SFX.bump(); shakeT = performance.now() - 420; await sleep(ms * .45); }   // (as its foot comes down)
      else await sleep(ms);
    }
    n.mv = null;
    if (s.to === 'you'){ n.dir = dirOf(pl.x - n.x, pl.y - n.y); pl.dir = OPP[n.dir]; pl.turnT = performance.now(); S.pos = {...S.pos, dir:pl.dir}; save(); }
    parkAt(n);
  },
  // A character leaps (or flies, for one that flies) out of a square to where the story has just put them (from), such as
  // the queen bee out of her old tree; or from where they are into a square (to), such as back into it, before the story
  // takes them off the map.
  // Those of a kind that stay out once met (the animal's id: fly), such as the six bees once they're all your friends, fly
  // off together to a square (to), such as to join the swarm by the queen's old tree, and are out no more.
  async fly(s){
    const a = ANIMALS.find(x => x.id === s.fly), from = outOf(a).map(([x, y]) => [x, y]);
    delete here().out[s.fly]; save();
    if (a.place !== PLACE || !from.length) return;
    flyers = {a, from, to:s.to, t0:performance.now()}; SFX.buzz();
    await sleep(FLY_MS); flyers = null;
  },
  async leap(s){
    const n = ALL_NPCS.find(c => c.id === s.leap);
    if (!n || n.place !== PLACE) return;
    const [fx, fy] = s.from || [n.x, n.y];
    if (s.to){ n.x = s.to[0]; n.y = s.to[1]; n.dir = dirOf(n.x - fx, n.y - fy) || n.dir; }
    n.mv = {fx, fy, t0:performance.now(), dur:LEAP_MS, far:true};
    await sleep(LEAP_MS);
  },
  // The character you're talking to leads you somewhere, such as the lookout's goat walking you to its railing to show
  // you the view (decided 24 October 2026: a player it told about the view walked on without seeing it): it walks to its
  // square (leadTo), and you after it to yours (you, and the way you face there, such as at the railing), a step at a
  // time, each the shortest way. Nothing happens on the squares you're led over, as when you walk.
  async leadTo(s, who){
    const n = NPCS.find(c => c.id === who), [yx, yy, dir] = s.you;
    if (!n) return;
    held = null; queued = null;
    const theirs = pathTo([n.x, n.y], s.leadTo, {blocked:[pl.x, pl.y]}), yours = pathTo([pl.x, pl.y], [yx, yy], {free:n});
    const at = (sq, x, y) => sq[0] === x && sq[1] === y;
    while (theirs.length || yours.length){
      const now = performance.now();
      let moved = false;
      if (theirs.length && !at(theirs[0], pl.x, pl.y)){   // it goes first, once you're not in its way
        const [x, y] = theirs.shift();
        n.mv = {fx:n.x, fy:n.y, t0:now, dur:STEP}; n.dir = dirOf(x - n.x, y - n.y); n.parity = (n.parity || 0) ^ 1; n.x = x; n.y = y; moved = true;
      }
      if (yours.length && !at(yours[0], n.x, n.y)){
        const [x, y] = yours.shift();
        pl.dir = dirOf(x - pl.x, y - pl.y); pl.mv = {fx:pl.x, fy:pl.y, tx:x, ty:y, t0:now, led:true}; pl.parity ^= 1; moved = true;
      }
      if (!moved) break;   // (in each other's way: you stop where you are)
      await sleep(STEP);
      if (pl.mv && pl.mv.led){ pl.x = pl.mv.tx; pl.y = pl.mv.ty; pl.px = pl.x * T; pl.py = pl.y * T; pl.mv = null; }   // (there, even if no frame has been drawn)
    }
    pl.dir = n.dir = dir || pl.dir; pl.turnT = performance.now();
    S.pos = {place:PLACE, x:pl.x, y:pl.y, dir:pl.dir}; save();
  },
  // A character stops you as you walk past (in an event, near them), like a trainer in Pokémon: a ! pops up over them,
  // you turn to face them, and they talk to you. Or an animal at its spot calls you over, so you can't miss it, such as
  // the goat beside the river valley's path: you turn to face it, and meet it, as A at it does.
  async stopsYou(s){
    const n = NPCS.find(c => c.id === s.stopsYou);
    const a = !n && ANIMALS.find(x => x.id === s.stopsYou && atSpot(x) && awakeNow(x));
    if (a){ held = null; queued = null; return wildAppears(a, {x:a.at[0], y:a.at[1], d:dirOf(a.at[0] - pl.x, a.at[1] - pl.y)}); }
    if (!n) return;
    held = null; queued = null;
    pl.dir = dirOf(n.x - pl.x, n.y - pl.y); S.pos.dir = pl.dir; save();
    n.calls = performance.now() + CALL_MS; SFX.call();
    await sleep(CALL_MS);
    await talk(n);
  },   // a battle (an enemy in AREA.enemies), and what happens if you win
  async message(s, who, last){ if (who) await showNarration(fill(s.message), last); else toast(fill(s.message)); },   // in a conversation, it waits in the speech box
  // Picking up the creature you're facing, such as a crab (grab: its picture; label: what to do): one question on a word you
  // know, as in reeling in a little fish. Get it wrong (missed: what you're told), and it gets away (the scuttle step), and
  // that's the end of it.
  async grab(s, who){
    const w = nextWords(trainable(), 1)[0];
    if (!w) return;
    if (await catchQ(w, 1, 1, s.grab, fill(s.label))) return;
    SFX.wrong(); toast(fill(s.missed)); STEPS.scuttle({}, who);
    return STOP;
  },
  // Climbing a chain up a sheer face (or down it), such as on the cliff road (decided 4 November 2026): a question a pull
  // (pulls: how many; label: what you're doing), right or wrong, as practice, then you climb, your hands on the chain, to
  // the square beyond the face (climb: the two ends, [x, y] each: you go to the one further from you).
  async climb(s){
    const ends = s.climb, [tx, ty] = ends.reduce((far, e) => Math.abs(e[1] - pl.y) + Math.abs(e[0] - pl.x) > Math.abs(far[1] - pl.y) + Math.abs(far[0] - pl.x) ? e : far);
    for (let i = 1; i <= (s.pulls || 0); i++){ const w = nextWords(trainable(), 1)[0]; if (!w) break; await catchQ(w, i, s.pulls, s.pic, fill(s.label || 'Climbing')); }
    held = null; queued = null;
    const fx = pl.px, fy = pl.py, n = Math.max(1, Math.round((Math.abs(ty - pl.y) + Math.abs(tx - pl.x)) * 260 / 17));
    for (let i = 1; i <= n; i++){ const p = i / n; pl.px = fx + (tx * T - fx) * p + Math.round(Math.sin(p * Math.PI * 8)); pl.py = fy + (ty * T - fy) * p; if (i % 15 === 0) SFX.clack(); await sleep(17); }
    pl.x = tx; pl.y = ty; pl.px = tx * T; pl.py = ty * T; pl.mv = null; pl.turnT = performance.now();
    S.pos = {place:PLACE, x:tx, y:ty, dir:pl.dir}; save();
  },
  // Picking up something someone has asked you for by its word (the fetch step), one at a time, counted aloud: what you're
  // carrying (the area's carrying: {word, n}). Picking up something else, you put down what you had. Or, howMany, as many
  // as you choose, on a card with the numbers 一 to 五 (decided 5 November 2026, after playing it: picking up the
  // woodcutter's wood one at a time, it wasn't clear how many you had, or what to do), such as his wood and stones; with
  // each, what you do for each one, one after another, each counted aloud, such as filling the bucket at the cave's pool
  // or chopping a log at its blocks (decided 6 November 2026, after playing it: filling the senior pupil's three buckets
  // one at a time, it wasn't clear what to do, and the pool rested after each, so the next seemed not to come); ask, the
  // card's question, and took, what you're told after ({n}: how many, {s}: an s if more than one, {them}: them or it).
  async carry(s, who){
    if (s.howMany) await knowTwo();   // (the card's two is 两: taught first, if you don't know it yet)
    const c = here().carrying, w = s.carry, n = s.howMany ? await howManyCard(w, s.ask) : c && c.word === w ? c.n + 1 : 1;
    if (!n) return;   // (Not now)
    here().carrying = {word:w, n}; save();
    // Each one counted aloud as it's done (a number you know), said in full and seen, then cleared, before the next one
    // begins, so a count is never said over the next one's question, nor shown beside it (decided 7 November 2026, after
    // playing it: chopping the senior pupil's logs, 一 was said just as the next log's question came up, two Chinese words
    // at once, with a number among its answers, and the question said 2 of 3 as you heard 一).
    const say1 = async i => { const x = COUNTING[i - 1]; if (!x || lvl(x) < 1) return; toast(`${wz(x)}!`); await sayFully(x, COUNT_MS); clearMessage(); };
    for (let i = 1; s.each && i <= n; i++){ await runSteps(s.each.map(x => x.practise && n > 1 ? {...x, label:`${x.label} (${i} of ${n})`} : x), who); if (i < n) await say1(i); }
    if (s.inHand) SFX.right(); else await pickUpAct(w);   // (you pick it up, unless it's in your hands already, such as a bucket you've just filled)
    const num = COUNTING[n - 1], counted = (n > 1 || s.howMany) && !!num && lvl(num) >= 1;
    if (counted) say(num);
    const took = s.took ? fill(s.took.replace('{n}', n).replace('{s}', n > 1 ? 's' : '').replace('{them}', n > 1 ? 'them' : 'it')) : null;
    toast(`${counted ? wz(num) + '! ' : ''}${took || `You’re carrying ${n > 1 ? n + ' ' : ''}${wz(w)}.${s.howMany ? ' Take it to whoever asked for it.' : ''}`}`);
  },
  // Fetching things by their word (decided 4 November 2026: quieter practice, where what you do is the answer): the one
  // you're talking to asks for something only in Chinese, said aloud, its English hidden (each of its asks: the word, how
  // many, count, and the line that asks for it, ask). You go and pick it up (the carry step, where it is), as many as they
  // asked for, and bring it back. The right thing and they thank you (right) and ask for the next; the wrong thing, or the
  // wrong number, and they say no (wrong) and ask again (wrongNote: what you're told). Where you are is kept in the area's
  // progress (fetch: its key, 0 before they've asked, then which ask, from 1, then one more once it's all brought); done:
  // the steps once you've brought everything; listen: what you're told as they ask.
  async fetch(s, who){
    const p = here(), face = speaker(who), asks = s.asks;
    if ((p[s.fetch] || 0) > asks.length) return;
    if (!p[s.fetch]){ p[s.fetch] = 1; save(); }
    const c = p.carrying;
    if (c){
      const a = asks[p[s.fetch] - 1]; delete p.carrying; save();
      if (c.word === a.word && c.n === (a.count || 1)){
        SFX.right(); p[s.fetch]++; save();
        await showDialog(face, L[s.right]);
        if (p[s.fetch] > asks.length){ await runSteps(s.done || [], who); return; }
      } else { SFX.wrong(); await showDialog(face, L[s.wrong]); toast(fill(s.wrongNote || 'That’s not what they asked for. Listen again!')); }
    }
    const a = asks[p[s.fetch] - 1], nw = a.teach && WORDS[a.teach] && lvl(a.teach) === 0 ? a.teach : null;   // (teach: a word its line teaches, if you don't know it yet: a catch-up, such as 两 for a game past the school)
    await showDialog(face, L[a.ask], nw ? {noEn:true, teach:nw} : {noEn:true});
    if (nw) await showNotice(nw, {quiet:true, ...(a.note ? {note:fill(a.note)} : {})});
    if (s.listen) toast(fill(s.listen));
  },
  // I spy (decided 4 November 2026: quieter practice, where what you do is the answer): the one you're playing with says
  // what they can see, only in Chinese (things: each a word and the line that says it, say), and you walk to it and press
  // A at it, anything here whose word it is (spyFind). So many rounds (rounds), each something you know that's here; each
  // found counts as a question answered right. The game in play is kept in the area's progress (spying); spy: the key
  // that counts the games you've finished; listen: what you're told as they say it; found ({word}: what it was) and wrong:
  // what you're told when you find it, or press A at something else; done: the steps once you've found them all, the
  // first time. ask: a card asks first, Play or Not now; and in the middle of a game (with ask, or going: what it asks
  // then), whether to go on, Keep playing or Stop, Stop ending it (stopped: what you're told), so a game started by
  // accident never holds you (decided 9 November 2026, after playing it: talking to the little monkey again started its
  // game every time).
  async spy(s, who){
    const p = here(), going = !!p.spying && p.spying.place === PLACE;
    if (going && (s.ask || s.going) && !await confirmBox(speaker(who), fill(s.going || 'Keep playing?'), 'Keep playing', 'Stop')){
      delete p.spying; save(); toast(fill(s.stopped || 'You stop playing.')); return STOP;
    }
    if (!going){
      const pick = shuffle(s.things.filter(t => lvl(t.word) >= 1 && wordHere(t.word))).slice(0, s.rounds || 3);
      if (!pick.length) return;
      if (s.ask && !await confirmBox(speaker(who), fill(s.ask), 'Play', 'Not now')) return STOP;
      p.spying = {key:s.spy, by:typeof who === 'string' ? who : who.id, place:PLACE, words:s.things.map(t => t.word), list:pick.map(t => t.word), lines:Object.fromEntries(pick.map(t => [t.word, t.say])), i:0,
        found:s.found, wrong:s.wrong, listen:s.listen, done:p[s.spy] ? [] : (s.done || [])};
      save();
    }
    await spyAsk();
  },
  // Unloading the troop's things off the cart, at home (the area's unloading; decided 7 November 2026, after playing it:
  // they had to come home somehow, so you pull the little demons' cart back, and a wind carries it home with you): the
  // one asking (by) wants each thing only in Chinese, said aloud, its English hidden (asks: each its word, the line that
  // asks for it, ask, and the table it goes on, on); you take it off the cart (A at it: a card of what's still on it, their
  // pictures; the wrong one and they say no, wrong, and ask again), lift it over your head, carry it to its table and put it
  // down there (A at it), and see it go on; then they thank you (right) and ask for the next. Where you are is the area's
  // progress (key: 0 before they've asked, then which ask, from 1, then one more once it's all back); done: the steps once
  // it's all on its tables. unload: who or what this is: 'ask' (the one asking), 'take' (the cart), or a table (an on).
  async unload(s){
    const u = AREA.unloading, p = here();
    if ((p[u.key] || 0) > u.asks.length) return;
    if (!p[u.key]){ p[u.key] = 1; save(); }
    const a = u.asks[p[u.key] - 1], face = speaker(u.by), ask = async () => { await showDialog(face, L[a.ask], {noEn:true}); toast(fill(u.listen)); };
    const carrying = () => toast(fill(u.carry.replace('{item}', `{${a.word}}`)));
    if (s.unload === 'ask'){ if (p.lifted === a.word) carrying(); else await ask(); return; }
    if (s.unload === 'take'){
      if (p.lifted){ carrying(); return; }
      const left = u.asks.slice(p[u.key] - 1).map(x => x.word);   // (what's still on the cart)
      const chosen = left.length > 1 ? await takeCard(shuffle(left), u.take) : left[0];
      if (!chosen) return;   // (Not now)
      reviewed(a.word, chosen === a.word); save();   // (counts as practice, as I spy does)
      if (chosen !== a.word){ SFX.wrong(); await showDialog(face, L[u.wrong]); await ask(); return; }
      await pickUpAct(chosen, {reach:'in'});
      p.lifted = chosen; save(); carrying();
      return;
    }
    if (!p.lifted) return;
    if (a.on !== s.unload){ SFX.bump(); toast(fill(u.otherTable)); return; }
    await STEPS.putDown({putDown:a.word});
    await STEPS.setUp({setUp:{[u.key]:p[u.key] + 1}});   // (and you watch it go on)
    SFX.right();
    await showDialog(face, L[u.right]);
    if (p[u.key] > u.asks.length){ await runSteps(u.done || []); return; }
    await showDialog(face, L[u.asks[p[u.key] - 1].ask], {noEn:true}); toast(fill(u.listen));
  },
  // Changing into something (变, decided 4 November 2026: the chapter's big new idea): you hear what (a listening
  // question, the word one of the area's changes you know, the answers pictures of words you know), and your monkey turns
  // into what you chose, there on the map, in a puff of smoke, and back again (ms: how long), right or wrong.
  // turnInto: how many times; or a word, to turn into just that, with no question (such as a pine tree, showing off to the
  // pupils). label: the question card's.
  // word: what to turn into (one question, that word), such as a little demon, to fool the demon's guard; keep: and stay
  // like that, till the form step changes you back (and if you turn into something else, that's the end of it).
  async turnInto(s){
    if (typeof s.turnInto === 'string'){ await becomeForm(s.turnInto, s.ms); return; }
    const pool = (AREA.changes || []).filter(w => WORDS[w] && WORDS[w].pic && lvl(w) >= 1);
    for (let i = 1; i <= s.turnInto; i++){
      const w = s.word || nextWords(pool, 1)[0]; if (!w) return;
      const q = wordQuestion(w, null, 'listen', 3); let chosen = w;
      const ok = await pictureQ({head:`<p class="label">${esc(fill(s.label || 'Change!'))}${s.turnInto > 1 ? ` (${i} of ${s.turnInto})` : ''}</p>`, body:q.body,
        options:q.options, answerIdx:q.answerIdx, word:w, type:'listen', onShow:() => setTimeout(() => say(w), 300), onAnswer:(right, k) => { chosen = q.opts[k]; }});
      closeCard();
      // what you turned into, told as you change, while you're it, with time to read it before you change back and the next
      // question comes (decided 7 November 2026: told once you'd changed back, the next question covered it at once)
      const said = ok ? `变！ You turned into ${wz(chosen)}!` : `You turned into ${wz(chosen)}… but that’s not what you heard! It was ${wz(w)}.`;
      if (s.keep){ puffAt = performance.now(); SFX.shimmer(); pl.form = chosen; toast(said); await sleep(ok ? 500 : TOLD_MS.wrong); }
      else await becomeForm(chosen, s.ms || TOLD_MS[ok ? 'right' : 'wrong'], said);
      if (s.keep && !ok){ await STEPS.form({form:null}); return STOP; }
    }
  },
  // Back to yourself (form: null), in a puff of smoke, after a turnInto that kept you changed; or into something (form: a
  // word) with no question.
  async form(s){ puffAt = performance.now(); SFX[s.form ? 'shimmer' : 'swish'](); pl.form = s.form || null; await sleep(350); },
  // A weapon of your own from now on (weapon: its word), such as the Demon of Havoc's broadsword: in your hand on the map,
  // and in battles, hitting as hard as the area's battles say (weapons).
  weapon(s){ here().weapon = s.weapon; save(); redress(); },
  // Someone becomes your friend (befriend: their id, or true, the one you're talking to), such as a person you've helped
  // and asked where the immortals are: on your Friends page from then on, under People.
  befriend(s, who){
    const id = s.befriend === true ? (typeof who === 'string' ? who : who && who.id) : s.befriend;
    if (id && !S.friends.includes(id)){ S.friends.push(id); save(); }
  },
  // A question or two on words you know as you do something (practise: how many; label: what you're doing; pic: its
  // picture), such as lifting each sack onto the boat at the harbour: right or wrong, you carry on, as practice.
  async practise(s){
    for (let i = 1; i <= (s.practise || 1); i++){
      const w = nextWords(trainable(), 1)[0];
      if (!w) return;
      await catchQ(w, i, s.practise || 1, s.pic, fill(s.label));
    }
  },
  // The area's exam (AREA.exam), given by the one you're talking to, such as the teacher before the feast (decided 29
  // October 2026): asked first (ask, with start or Not now), then words from the whole area to match to their pictures,
  // those you know least well first (words: how many), so many right first time to pass (pass). Not passed (notYet): the
  // words you missed, to tap and hear, and what to do (tryAgain), and that's the end of it; take it again any time.
  async exam(s, who){
    const e = AREA.exam, face = speaker(who);
    if (!await confirmBox(face, esc(fill(e.ask)), e.start, 'Not now')) return STOP;
    const words = shuffle(nextWords(trainable(), e.words)), need = Math.min(e.pass, words.length);
    const missed = await matchWords(words, e.title, 'Stop');
    if (!missed) return STOP;
    const right = words.length - missed.size, pass = right >= need;
    for (const w of words){ reviewed(w, !missed.has(w)); addToday(w); } save();   // (every word counts as practice: matched first time, it moves back in the review list; missed, near the front)
    if (pass) SFX.fanfare(); else SFX.wrong();
    await new Promise(res => {
      openCard(`<div class="who" aria-hidden="true">${face}</div><p class="label">${esc(pass ? e.passed : e.notYet)}</p>
        <p>You matched <b>${right} of ${words.length}</b> words right first time. You needed ${need}.</p>
        ${missedHTML(missed)}${pass ? '' : `<p>${esc(fill(e.tryAgain))}</p>`}
        <div class="actions"><button class="btn primary" data-a="ok">OK</button></div>`);
      bindMissed(); on('[data-a=ok]', () => { closeCard(); res(); });
    });
    if (!pass) return STOP;
  },
  // The end of the area's story (AREA.areaEnd): its card, with how many words you caught, your friends and your shells,
  // and what comes next.
  async areaEnd(){
    SFX.fanfare();
    await infoBox('⛰️', `<p class="label">${esc(AREA.areaEnd.title)}</p>
      <div class="stats"><span>${wordsCaught()} of ${ORDER.length} words caught</span><span>${S.friends.length} friends</span>${moneyHTML()}</div>
      ${AREA.areaEnd.text.map(t => `<p>${esc(fill(t))}</p>`).join('')}`);
  },
  // Something to wear, put on now (wear: its item in the wardrobe), such as the old fisherman's coat: it's yours, and on.
  wear(s){ if (!S.wardrobe.owned.includes(s.wear)) S.wardrobe.owned.push(s.wear); putOn(s.wear); save(); redress(); },
  // Coins for you (Area 2's money), such as the fisherman paying you for a fish (note: what you're told).
  async coins(s, who, last){
    S.coins = (S.coins || 0) + s.coins; save(); SFX.right();
    const text = fill(s.note || `You get ${s.coins} 🪙.`);
    if (who) await showNarration(text, last); else toast(text);
  },
  // The money changer changes all your shells for coins, one for one (decided 4 November 2026).
  async exchange(s, who, last){
    const n = S.shells;
    S.coins = (S.coins || 0) + n; S.shells = 0; save(); if (n) SFX.right();
    const text = n ? `You give the money changer your ${n} 🐚, and he gives you ${n} 🪙, one for each. You have ${S.coins} 🪙.` : `You have no shells to change. You have ${S.coins || 0} 🪙.`;
    if (who) await showNarration(text, last); else toast(text);
  },
  // Paying someone (pay: how much, in the money you have now), such as the boatman's fare; if you can't, you're told how
  // much you have, and that's the end of it.
  async pay(s, who){
    if (money() < s.pay){ await showNarration(`It costs ${s.pay} ${MONEY()}, and you have ${money()}. Help people, and play with your friends, to earn more.`, true); return STOP; }
    spend(s.pay); save(); SFX.blip();
    await showNarration(fill(s.note || `You pay ${s.pay} ${MONEY()}.`));
  },
  // Off to another place (goTo: its id), arriving at at, facing facing, as through a way there: such as across the sea.
  async goTo(s){ await goThrough({to:s.goTo, arrive:s.at, facing:s.facing}); },
  // The child's game (Area 2), 是不是？: so many questions (isIt), each a picture of something you know and 这是…吗？ about
  // it, which you answer 是 (yes) or 不是 (no). The word asked about is one of the area's isIt you know, half the time the
  // picture's own, otherwise another, never a look-alike of it.
  async isIt(s, who){
    const pool = (AREA.isIt || []).filter(w => WORDS[w] && WORDS[w].pic && lvl(w) >= 1);
    if (pool.length < 3) return;
    for (let i = 0; i < s.isIt; i++){
      const pic = nextWords(pool, 1)[0], others = pool.filter(w => w !== pic && !alike(w, pic) && toneless(w) !== toneless(pic));
      await isItQ({who:speaker(who), pic, said:Math.random() < .5 || !others.length ? pic : shuffle(others)[0]});
    }
  },
  // On to the next area (sail: its number), such as across the sea on your raft at the end of Area 1 (decided 4 November
  // 2026): ask first (ask: what the card says, with Go and Not now), then the game is saved and the page loads again in that
  // area (toArea, js/main.js), where its begin steps run. Your words, friends, shells, bag and clothes come with you.
  async sail(s){
    if (s.ask && !await confirmBox(`<span class="ico">${picHTML(PICTURES['木筏'] ? '木筏' : '海')}</span>`, esc(fill(s.ask)), s.go || 'Go', 'Not now')) return STOP;
    S.area = s.sail; save();
    toArea(s.sail, SLOT, 'arrive');
    return STOP;
  },
  // The creature you're talking to scuttles off, out of reach: to somewhere else on the ground it lives on, well away from
  // you, such as a crab you've caught and let go, or one that pinched you.
  scuttle(s, who){
    const n = NPCS.find(c => c.id === who);
    if (!n) return;
    const look = tileAt(n.x, n.y).look, spots = [], near = walkableFromYou();
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++)   // (somewhere you can walk up to: decided 6 November 2026, as a hen could run off into a corner you couldn't reach)
      if (tileAt(x, y).look === look && Math.abs(x - pl.x) + Math.abs(y - pl.y) >= 5 && !npcAt(x, y) && !exitAt(x, y) && [[0, 0], ...Object.values(DV)].some(([dx, dy]) => near.has((x + dx) + ',' + (y + dy)))) spots.push([x, y]);
    if (!spots.length) return;
    [n.x, n.y] = spots[Math.floor(Math.random() * spots.length)]; n.mv = null;
  }
};
// Characters that scuttle sideways (scuttles), such as the crabs on the shore's sand (decided 29 October 2026): now and then
// one scuttles a square left or right, over the ground it's on; come up beside it in its row, within SCUTTLE_NEAR, and it
// scuttles away from you, out of reach, till it's cornered. From in front or behind, it can't run: A at it, its talk, can
// catch it. Not while you're busy (talking to one, say).
const SCUTTLE_MS = 150, SCUTTLE_NEAR = 2;
function scuttle(now){
  if (busy || !modal.hidden) return;
  for (const n of NPCS){
    if (!n.scuttles || (n.mv && now - n.mv.t0 < n.mv.dur)) continue;
    const look = tileAt(n.x, n.y).look;
    const free = x => tileAt(x, n.y).look === look && !npcAt(x, n.y) && !(pl.x === x && pl.y === n.y) && !exitAt(x, n.y);
    let dx = 0;
    if (pl.y === n.y && Math.abs(pl.x - n.x) <= SCUTTLE_NEAR) dx = Math.sign(n.x - pl.x) || 1;   // you, beside it: away it goes
    else if (now > (n.wander || 0)){
      n.wander = now + 1400 + Math.random() * 2600;
      if (!(pl.x === n.x && Math.abs(pl.y - n.y) === 1)) dx = Math.random() < .5 ? -1 : 1;   // (not while you're right in front of it, or behind)
    }
    if (dx && free(n.x + dx)){ n.mv = {fx:n.x, fy:n.y, t0:now, dur:SCUTTLE_MS}; n.x += dx; }
  }
}
// You reply: choose what to say from the phrases you know, with best the one that fits (taught on its own card the first
// time, saying when you say it). What you're answering stays in sight (chooseReply, js/cards.js): the line someone has
// just said, or else what's happening (about, in English, with who: whose face, and pic: a picture of what they've given
// you), and it's put in plain English: what they've done (the phrase's cue: says hello, thanks you…, or about) and what
// to do, so a reply is never a guess at what you're answering (decided 22 October 2026). One that doesn't fit shows why,
// with the one that does, and your monkey says that one, so the conversation makes sense. Replying with the one that
// fits counts as using it. A phrase you don't know yet isn't offered.
// One new word at a time: if this conversation has already taught one, a phrase that's new too waits for another
// time (such as 要 then 不客气 at your first request), and the character's line stands on its own. Gives whether you
// replied. (last: your line is the last of the conversation.)
async function replyWith(best, {about, pic, who, last} = {}){
  const heard = about ? null : lastLine;   // (now: a card may teach the phrase first)
  if (lvl(best) === 0){
    if (caughtBefore !== null && caughtCount() > caughtBefore) return false;
    await showNotice(best, {quiet:true, note:`Say it ${WORDS[best].use}.`});
  }
  const choices = shuffle([best, ...shuffle(PHRASES.filter(p => p !== best && lvl(p) >= 1)).slice(0, 2)]);
  const id = heard ? heard.id : who, what = about ? fill(about) : `${cap(theName(id))} ${WORDS[best].cue}.`;
  const ask = `${what} ${choices.length < 2 ? 'Now you say it!' : heard ? 'What do you say back?' : 'What do you say?'}`;
  await iSay(best, await chooseReply(choices, {id, line:heard && heard.line, pic, ask, best}) === best, last);
  return true;
}
// Someone, in English text: the old monkey, the shop owner (a character, by their name in English), the 松鼠 (squirrel)
// (an animal, by its word).
function theName(id){
  if (NAMES[id]) return 'the ' + NAMES[id].en.toLowerCase().replace(/^the /, '');   // (a name with its own The, such as The master's, once)
  const a = animalName(id);
  return a ? 'the ' + wz(a.zh) : 'someone';
}
// Your monkey says a phrase. It counts as using it if you chose it yourself (chose), not when the game said which fits.
async function iSay(said, chose = true, last = false){
  if (chose){ const r = rec(said); r.used = 1; r.lv = 4; addToday(said); save(); }
  const en = WORDS[said].en.split(',')[0];
  await showDialog(speaker('player'), {t:[said, '！'], en:en[0].toUpperCase() + en.slice(1) + '!'}, {teach:said, last});
}
// Runs a list of steps, one after another: a step with an if only if it matches (such as the old monkey asking for the
// meadow's words, if there are any you don't know). A step that gives STOP ends the list there (such as a word match you
// stop). A whole conversation (ends) says when it's ending: a line with nothing after it to press A for (showsMore) says
// Done, not ▼ Next (decided 22 October 2026: you couldn't tell, pressed A again, and it all started again).
const STOP = 'stop';
const SLEEP_MS = 2400;   // how long you sleep in a bed (the sleep step)
const stepKind = s => Object.keys(s).find(k => STEPS[k]);
async function runSteps(steps, who, ends){
  for (const [i, s] of steps.entries()) if ((!s.if || matches(s.if)) && await STEPS[stepKind(s)](s, who, !!ends && !showsMore(steps, i), !!ends) === STOP) return STOP;
}
// Steps that show nothing you'd press A for: the story changing, a sound, things moving about on the map, you doing
// something (the last of them, ACT_STEPS, changing nothing in the story, as a sound doesn't; lifting something and
// putting it down do: what you carry).
const ACT_STEPS = ['sweep', 'dip', 'unlock', 'pickUp', 'kneel'];
const QUIET_STEPS = ['wear', 'set', 'sound', 'topple', 'change', 'give', 'rumble', 'rest', 'follow', 'hit', 'markOut', 'plant', 'sleep', 'morning', 'leap', 'fly', 'lift', 'putDown', 'pour', ...ACT_STEPS];
// Whether anything after step i in a list shows something you'd press A for. If it can't be sure, it says yes, so a line
// says Done only when it's the last (a step whose if doesn't match yet might, once a step before it changes the story).
function showsMore(steps, i){
  let changed = false;
  for (const s of steps.slice(i + 1)){
    const k = stepKind(s);
    if (QUIET_STEPS.includes(k)){ changed = changed || !(k === 'sound' || ACT_STEPS.includes(k)); continue; }
    if (s.if && !changed && !matches(s.if)) continue;
    if (k === 'newWord' && lvl(s.newWord) >= 1) continue;   // (a word you know isn't taught again)
    return true;
  }
  return false;
}
// The area's events: each happens by itself when its if matches (checked after anything you do).
async function runEvents(){ for (const e of AREA.events) if (matches(e.if) && !speakerAsleep(e.do)) await runSteps(e.do); await partsCheck(); placeCharacters(); refreshMap(); }
// An event where someone asleep for the night would speak waits till they're up (js/daynight.js), such as the hungry
// monkey saying the fish is on the feast's table.
const speakerAsleep = steps => steps.some(s => typeof s.by === 'string' && (ALL_NPCS.find(n => n.id === s.by) || {}).asleep);
// Where each character stands: their first move whose if matches (such as gathering at the waterfall), or
// where the content first puts them. Someone following you is wherever you've been instead (FOLLOWERS, below).
const inClass = new Set();   // characters out of their places for a lesson, such as PE's (js/pe.js): left where it puts them
// A move that says parked puts them wherever they were last left (parkAt: here().parked), such as the cart you've pulled
// back to the little monkeys, if anywhere (if not, the next move that matches).
const parkedAt = n => (here().parked || {})[n.id];
function parkAt(n){ (here().parked = here().parked || {})[n.id] = {place:n.place, x:n.x, y:n.y, facing:n.dir}; save(); }
function placeCharacters(){
  const plan = nightPlan();   // (who's asleep where, at night: js/daynight.js)
  for (const n of ALL_NPCS){
    if (S.following.includes(n.id) || inClass.has(n.id)){ n.asleep = false; continue; }
    if (here().shooed.includes(n.id)){ n.place = 'gone'; continue; }   // (a bird you've shooed off: shooAway)
    const mv = (n.moves || []).find(m => (!m.if || matches(m.if)) && (!m.parked || parkedAt(n)));
    const spot = nightSpot(n, plan), was = {here:n.place === PLACE && placedIn === PLACE, x:n.x, y:n.y, dir:n.dir, asleep:!!n.asleep, bed:!!n.bed};
    const m = spot || (HIDE && n.id === HIDE.by && hiderAt()) || (mv && mv.parked ? parkedAt(n) : mv) || n.home;   // (asleep for the night; off hiding, or where you found it: hide and seek, js/hide.js)
    const place = placeOf(m);
    if (n.place !== place || n.move !== m || (!n.scuttles && (n.x !== m.x || n.y !== m.y))){ n.place = place; n.x = m.x; n.y = m.y; n.dir = m.facing || n.dir; n.move = m; }   // (a move to the same square can turn them, such as the thirsty monkey watching for you to bring the cow home; a crab stays wherever it has scuttled to)
    if (!!spot !== was.asleep){ n.asleep = !!spot; n.bed = !!(spot && spot.bed); if (placedIn === PLACE) sleptOrWoke(n, was); }   // (going to bed or getting up while you're there: fading)
  }
  placedIn = PLACE;
  NPCS = ALL_NPCS.filter(n => n.place === PLACE && !S.following.includes(n.id));
  FOLLOWERS = S.following.map(id => ALL_NPCS.find(n => n.id === id)).filter(Boolean);
}
// The characters following you (S.following, the follow step), in line: each steps into the square the one ahead of it
// has just left, from the squares you've walked through (trail, the latest first). They don't block your way: turn back,
// and you pass through them. They come with you from place to place, waiting on your square as you arrive, and fall in
// behind you one by one as you walk on. A move further than the next square (over a ledge, or falling in from where
// they stood) is a leap.
let FOLLOWERS = [];
const trail = [];
const followerAt = (x, y) => FOLLOWERS.find(n => n.x === x && n.y === y);
function lineUp(){ trail.length = 0; for (const n of FOLLOWERS) Object.assign(n, {place:PLACE, x:pl.x, y:pl.y, dir:pl.dir, mv:null}); }   // on your square
function followersStep(now, hop){   // you're stepping off your square (hop: down a ledge, which takes a little longer)
  if (!FOLLOWERS.length) return;
  trail.unshift([pl.x, pl.y]); trail.length = Math.min(trail.length, FOLLOWERS.length);
  FOLLOWERS.forEach((n, i) => {
    const to = trail[i];
    if (!to || (to[0] === n.x && to[1] === n.y)) return;
    const dx = to[0] - n.x, dy = to[1] - n.y;
    n.mv = {fx:n.x, fy:n.y, t0:now, dur:walkMs() * (hop ? 1.6 : 1), far:Math.abs(dx) + Math.abs(dy) > 1};   // (as fast as you)
    n.dir = dirOf(dx, dy); n.parity = (n.parity || 0) ^ 1; n.x = to[0]; n.y = to[1];
  });
}
// How many words you'd caught when the conversation you're in began (null outside one), so a reply can tell if it
// has already taught a new word (replyWith).
let caughtBefore = null;
const caughtCount = () => Object.keys(WORDS).filter(w => lvl(w) >= 1).length;
// The part of a character's talk you'd hear now (the first whose if matches), and the one you heard last (lastTalk), so
// A can tell when talking again would say something new (js/input.js).
// What someone says to you: the first part of their talk whose if matches; but someone with nothing for you, only a few
// words to say (their last part, just lines and replies), talks about the weather instead, when the area's smallTalk has
// something for now, such as the cold in winter (decided 7 November 2026, the owner's idea: 今天很冷！).
const CHAT_STEPS = ['say', 'reply', 'message'];
const smallTalkFor = n => (AREA.smallTalk || []).find(t => (PEOPLE.has(n.id) || (t.monkeys && isMonkey(CHARACTER.get(n.id) || {}))) && matches(t.if) && (!t.who || t.who.includes(n.id)) && !(t.not || []).includes(n.id));   // (people's, or the troop's too: monkeys)
const talkPart = n => {
  const p = (AREA.talk[n.id] || []).find(p => !p.if || matches(p.if)), st = p && !p.if && p.do.every(s => CHAT_STEPS.includes(stepKind(s))) && smallTalkFor(n);
  return st ? {do:[{say:st.say}, ...(st.reply ? [{reply:st.reply}] : [])]} : p;
};
// How many more questions you need to answer before a character gives you another new word (the area's wordGap: so many
// after the last new word you caught, anywhere; here().wordTurn, when you caught it). A talk part that teaches one says
// so (waits): till then, the character first offers you a quick word game, just for practice, sized to what's left.
const wordLeft = () => { const n = (AREA.wordGap || {}).questions || 0, t = here().wordTurn; return typeof t === 'number' ? Math.max(0, n - ((S.turn || 0) - t)) : 0; };
let lastTalk = null;   // {id, part}
// Before a new word that waits (a talk part, a square's steps or asking what something is: waits), while you've answered
// fewer than the area's wordGap questions since your last: a quick word game first, just for practice, sized to what's
// left (never while you know too few words to play). Gives whether to carry on to the new word.
// who: the character offering it (or, for an animal you haven't met, or something new with nobody near, your own monkey:
// player, who never becomes your friend for it).
async function practiseFirst(who){
  if (!wordLeft() || !canEncounter()) return true;
  const g = AREA.wordGap, by = AREA.characters.some(c => c.id === who) ? who : 'player', was = S.friends.includes(by);
  await STEPS.wordGame({wordGame:{ask:g.ask.replace('{left}', wordLeft()), yes:g.yes, word:g.word, practice:true, questions:Math.max(2, wordLeft()), notYet:g.notYet}}, by);   // (its ask can say how many questions are left: {left})
  if (by === 'player' && !was) S.friends = S.friends.filter(f => f !== 'player');
  return !wordLeft();
}
// A character with something new for you: a ! or ? over them, and not what they've just said.
// (A full page of your scroll to seal waits while they have something for the story, so it never cuts into a lesson or
// the story: storyNews.)
const storyNews = n => !!(AREA.bubbles[n.id] || []).find(b => matches(b.if)) && !!talkPart(n) && !(lastTalk && lastTalk.id === n.id && lastTalk.part === talkPart(n));
const hasNews = n => !!keptFor(n) || storyNews(n) || sealFor(n);
// Food someone kept for you, when your bag was full (the bag step), now there's room for it: they have a ! for you.
const keptFor = n => { const w = here().kept[n.id]; return w && !bagFull(w) ? w : null; };
// What they do when you come back for it: the steps from where they gave it you (such as winning their word game: the
// present, then your thanks), as the content has them.
function keptSteps(who, w){
  const lists = [], scan = steps => { lists.push(steps); for (const s of steps) for (const win of [s.win, (s.wordGame || {}).win]) if (win) scan(win); };
  (AREA.talk[who] || []).forEach(p => scan(p.do));
  for (const l of lists){ const i = l.findIndex(s => s.bag === w); if (i >= 0) return l.slice(i); }
  return [{bag:w}];
}
async function talk(n){
  n.dir = OPP[pl.dir];
  const w = here().kept[n.id], part = w ? {do:keptSteps(n.id, w)} : sealFor(n) && !storyNews(n) ? sealPart() : talkPart(n);   // (something they kept for you comes first; a full page of your scroll to seal, once they've nothing for the story)
  if (!part) return;
  lastTalk = {id:n.id, part};
  const outer = caughtBefore, was = talkingTo;   // (a character can stop you during another conversation)
  caughtBefore = caughtCount(); lastLine = null; talkingTo = n.id;   // (nothing said yet to reply to)
  try {
    if (part.waits && !await practiseFirst(n.id)) return;
    await runSteps(part.do, n.id, true);
    if (!part.seal && sealFor(n)) await runSteps(sealPart().do, n.id, true);   // (a page of your scroll just filled: they seal it there and then, as you're beside them)
  } finally { caughtBefore = outer; talkingTo = was; }
}
// A character asking you to bring something (the area's requests). A request with choices (such as the
// hungry monkey's fruit) is fussy: whichever you bring first, they want the other (remembered in wanted),
// and each choice has its own lines and sentence. (last: the request ends the conversation, so its last line says
// Done, where nothing can come after it.)
async function request(r, face, last = false){
  const p = here(), has = r.fromBag ? ((S.bag[r.wants] || 0) > 0 ? r.wants : null) : p.holding[r.id];   // (fromBag: what they want is from your bag, such as the granny's rice)
  // with choices: whichever you bring, if any will do (any); the other one than you brought them before (other: that
  // request's id), such as the hungry monkey's second wish (decided 8 November 2026, the gentler prologue); or else fussy,
  // the other one than you brought first
  const want = r.choices ? (r.any ? has : r.other ? Object.keys(r.choices).find(c => c !== (p.wanted || {})[r.other]) : (p.wanted || {})[r.id]) : r.wants;
  const c = has && r.choices ? r.choices[has] : r;   // the lines and sentence for what you've brought
  if (p[r.id] === 'asked' && has && has !== want){   // you brought the wrong thing
    if (r.choices && !want){ p.wanted = {...p.wanted, [r.id]: Object.keys(r.choices).find(x => x !== has)}; save(); }
    await showDialog(face, L[c.wrong], {last:last && !r.wrongReply && !r.wrongAnswer});
    if (r.wrongReply) await replyWith(r.wrongReply, {last:last && !r.wrongAnswer});
    if (r.wrongAnswer) await showDialog(face, L[r.wrongAnswer], {last});
    delete p.holding[r.id]; save(); toast(fill(r.wrongMessage));
    return;
  }
  if (p[r.id] === 'asked' && has && has === want){   // you brought what they wanted (not just nothing, before a fussy one has said which)
    await showDialog(face, L[c.offer], {ok:'Give it'});
    const nw = (r.firstTeach || []).find(f => lvl(f.word) === 0);
    if (nw) await showNotice(nw.word, {note:nw.note, quiet:true});
    const sentence = toks(c.sentence);
    await gapQ({who:face, t:sentence, en:c.sentenceEn, gap:c.gap || has, ...(c.others ? {wrong:c.others} : {})});   // (others: its wrong answers, such as 小 for 大)
    sentence.filter(x => lvl(x) >= 1).forEach(useWord);
    p[r.id] = 'done'; if (r.fromBag) S.bag[r.wants]--; else delete p.holding[r.id]; earn(r.reward);
    if (r.any) p.wanted = {...p.wanted, [r.id]:has};   // (which you brought, for a request that wants the other one next: other)
    save(); SFX.fanfare();
    await showDialog(face, L[r.thanks]);
    if (r.thanksReply) await replyWith(r.thanksReply);
    toast(r.reward ? `+${r.reward} ${MONEY()}. Task complete!` : 'Task complete!');
    if (r.after) await runSteps(r.after, r.from);   // (after: what happens next, such as being paid, in coins)
    if (!talkingTo) await runEvents();   // (in a conversation, what happens next waits till it's over: decided 1 November 2026, when the rocks rolled away unseen while the thirsty monkey thanked you and played his word game)
  } else if (p[r.id] !== 'done'){                      // they ask (or ask again)
    const nw = [r.teach, r.verb].find(w => w && lvl(w) === 0);   // a new word to teach, if there is one: what they want, or the verb
    const ready = r.fromBag && !!has && !r.choices;   // (it's in your bag already: you give it them there and then, decided 6 November 2026)
    if (r.other && want){ p.wanted = {...p.wanted, [r.id]:want}; save(); }   // (what they want, for your tasks)
    await showDialog(face, L[r.other && want ? r.choices[want].ask : r.ask], {teach:nw, last:last && !nw && !ready});
    if (nw) await showNotice(nw, {quiet:true});
    if (p[r.id] === 'not asked'){ p[r.id] = 'asked'; save(); if (!ready) toast(fill(r.asked)); }
    if (ready) return request(r, face, last);
  } else await showDialog(face, L[r.thanks], {last});
}
// What the shop sells now: each thing whose if matches (such as bait, once you have a fishing rod), and something that
// comes in colours (inColours, js/data.js) in each colour you know, such as a blue headband once you know 蓝色 (and in
// its own colour, as it is, till you know that); food can be bought again and again, other things once.
// The area's shops: its one shop (Flower Fruit Mountain's 老板), or several, by their id (Area 2's market stalls: shops), each
// run by its who.
const SHOPS = AREA.shops || (AREA.shop ? {shop:AREA.shop} : {});
const SHOP_ITEMS = () => Object.values(SHOPS).flatMap(sh => sh.items);
const forSale = (sh = Object.values(SHOPS)[0]) => sh.items.filter(i => !i.if || matches(i.if)).flatMap(inColours)
  .filter(i => (i.item === i.word || lvl(i.colour) >= 1) && (i.eat || i.bag || (i.for ? !here().holding[i.for] : !owned(i))));   // (for: bought for someone, carried till you give it them, such as the cave's rice and fish)
// Something bought once that you have: a tool or something for the cave (tool, decor: kept in the save for every area,
// js/trade.js), or anything else this area's shop sells (bought).
const owned = i => i.tool ? (S.tools || []).includes(i.item) : i.decor ? [...(S.decor || []), ...(S.decorNew || [])].includes(i.item) : here().bought.includes(i.item);
const toBag = i => !!(i.eat || i.bag);   // food, or something else for your bag, such as bait
// Something that comes in colours, as it's called and said once you know its colour's word: 蓝色的头带 (a blue headband),
// its picture (its own, or its word's in its own colour), and its sentence with the colour in it, the colour the missing
// word (the content's colourSentence and colourSentenceEn, such as 我 要 {colour} 的 头带; colourNote and colourBought
// too); till then, as it is (头带, 我 要 头带, its word the missing one). Anything else, as it is.
const knowsColour = i => !!i.colour && !!i.colourSentence && lvl(i.colour) >= 1;
function asSaid(i){
  const c = knowsColour(i), en = c ? WORDS[i.colour].en : '', t = toks(c ? `${i.colour} 的 ${i.word}` : i.item), put = s => s.replace(/\{colour\}/g, en);
  return {zh:t.join(''), py:t.map(w => info(w)[0]).join(' '), en:c ? `${en} ${WORDS[i.word].en}` : WORDS[i.word].en, pic:PICTURES[i.item] ? i.item : i.word,
    sentence:c ? i.colourSentence.replace('{colour}', i.colour) : i.sentence, sentenceEn:c ? put(i.colourSentenceEn) : i.sentenceEn, gap:c ? i.colour : i.gap || i.word,
    note:c && i.colourNote ? put(i.colourNote) : i.note, bought:c && i.colourBought ? put(i.colourBought) : i.bought, given:c ? `${en} {${i.word}}` : `{${i.word}}`};
}
// Every sentence said with a colour in it (asSaid), whatever colours you know: for the voices and CHINESE.md.
const COLOUR_SENTENCES = () => [...SHOP_ITEMS(), ...(AREA.wardrobe || [])].filter(i => i.colours && i.colourSentence)
  .flatMap(i => i.colours.map(c => ({zh:i.colourSentence.replace('{colour}', c), en:i.colourSentenceEn.replace(/\{colour\}/g, WORDS[c].en)})));
// Every sentence of the child's game, 是不是 (AREA.isIt: 这是…吗？ about each of its words), for the voices and CHINESE.md.
const IS_IT_SENTENCES = () => (AREA.isIt || []).map(w => ({zh:`这 是 ${w} 吗 ？`, en:`Is this ${aWord(w)}?`}));
// Is there something in the shop you could buy now, that you don't have (not food or for your bag)? (The 老板's ?.) In any shop,
// or in one (the human world's 老板 at home asks only about his own, not the town's stalls).
const canBuy = one => (one ? [one] : Object.values(SHOPS)).some(sh => forSale(sh).some(i => !toBag(i) && money() >= i.price));
async function shop(face, sh = Object.values(SHOPS)[0], asked = false){   // a shop: what it sells, and buying it by asking for it with 我要买… (asked: you've come back to its Buy tab from its Sell tab)
  const items = forSale(sh), nw = sh.teach && lvl(sh.teach) === 0 ? sh.teach : null;   // (its question can teach a word, such as 买)
  if (!asked){
    await showDialog(face, L[sh.ask], nw ? {teach:nw} : {});
    if (nw) await showNotice(nw, {quiet:true});
  }
  if (!items.length && !canSell(sh)){ toast(fill(sh.soldOut)); return; }
  const food = sh.items.filter(i => toBag(i) && S.bag[i.item]).map(i => `${S.bag[i.item]} ${esc(wz(i.item))}`);
  // 我不要, as a reply choice shows it: Chinese, pinyin and English (unless it's switched off). (It had no pinyin till 22
  // October 2026.)
  const no = sh.no ? `<span class="nzh">${sh.no}</span><span class="npy">${WORDS[sh.no].py}</span>${S.replyEn ? `<span class="nen">· ${esc(WORDS[sh.no].en.split(',')[0])}</span>` : ''}` : 'Not now';
  // a card for each thing for sale: its picture, Chinese, pinyin, English and price; under its group's heading, if the shop
  // has groups (such as Snacks, then Tools), in their order (decided 9 November 2026, the trade plan)
  const tile = it => { const a = asSaid(it); return `<button class="shopitem${money() < it.price ? ' dear' : ''}" data-n="${items.indexOf(it)}" data-label="Choose">
        <span class="spic" aria-hidden="true">${picHTML(a.pic)}</span><span class="szh">${a.zh}</span><span class="spy">${a.py}</span>
        <span class="sen">${esc(a.en)}</span><span class="sprice">${MONEY()} ${it.price}</span></button>`; };
  const groups = sh.groups ? Object.keys(sh.groups) : null, inGroup = g => items.filter(it => (it.group || groups[0]) === g);
  const grid = groups ? groups.filter(g => inGroup(g).length).map(g => `<p class="shopgroup">${esc(sh.groups[g])}</p>${inGroup(g).map(tile).join('')}`).join('') : items.map(tile).join('');
  const i = await new Promise(res => {
    openCard(`<div class="qhead">${face}<p class="prompt">You have ${MONEY()} ${money()}${food.length ? ' and ' + food.join(', ') : ''}.</p></div>${shopTabs(sh, 'buy')}
      ${items.length ? `<div class="menu shopgrid">${grid}</div>` : `<p class="hint">${esc(fill(sh.soldOut))}</p>`}
      <div class="actions"><button class="btn" data-a="no" data-b data-label="${sh.no || 'Not now'}">${no}</button></div>`);
    const first = sheet.querySelector('.shopitem'); if (first) first.focus();
    on('[data-a=no]', () => { closeCard(); res(null); });
    sheet.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { closeCard(); res(items[+b.dataset.n]); });
    sheet.querySelectorAll('[data-shoptab=sell]').forEach(b => b.onclick = () => { SFX.turn(); closeCard(); res('sell'); });   // (his Sell tab: js/trade.js)
  });
  if (i === 'sell') return sellCard(face, sh);
  if (i) await buy(i, face, sh);
  else if (sh.no){ if (lvl(sh.no) === 0) await showNotice(sh.no, {quiet:true}); await iSay(sh.no); }   // you say 我不要
}
// Putting something on (an item of CLOTHES, js/data.js): anything else on with the same word comes off first, such as
// another headband (one at a time), or worn in the same place (on), such as a headband when you put on a hat.
function putOn(item){
  const c = CLOTHES.find(x => x.item === item), w = S.wardrobe.wearing;
  if (c) for (const o of CLOTHES) if ((o.word === c.word || (c.on && o.on === c.on)) && o.item !== item && w.includes(o.item)) w.splice(w.indexOf(o.item), 1);
  if (!w.includes(item)) w.push(item);
}
async function buy(i, face, sh = Object.values(SHOPS)[0]){   // buying something from a shop by asking for it (forSale's, or the content's own). Gives true if you bought it.
  if (!i.word) i = {...i, word:i.item};
  const a = asSaid(i), name = lvl(i.word) >= 1 ? (i.item === i.word ? wz(i.item) : `${a.zh} (${a.en})`) : a.en.toLowerCase();   // (a word you haven't caught: its English)
  // (whether you can buy it first, then its card, so a word you catch only by buying it, such as the cave's vase, is caught
  // only as you buy it: decided 9 November 2026, the owner's idea)
  if (toBag(i) && bagFull(i.item)){ await infoBox(face, `<p>You can carry ${FOOD[i.item] ? carryOf(i.item) : i.carry || 3} ${esc(name)}, and your bag is full. ${i.eat ? 'Eat one first.' : 'Use one first.'}</p>`); return false; }
  if (money() < i.price){ await infoBox(face, `<p>The ${esc(name)} costs ${i.price} ${MONEY()}, and you have ${money()}. ${esc(fill(sh.earnMore))}</p>`); return false; }
  if (lvl(i.word) === 0) await showNotice(i.word, {note:fill(a.note), quiet:true, ...(a.pic !== i.word ? {pic:a.pic} : {})});
  const sentence = toks(a.sentence), q = {who:face, t:sentence, en:a.sentenceEn, gap:a.gap, ...(i.colour && a.gap === i.colour ? {wrong:i.colours.filter(c => c !== i.colour)} : {})}, seen = {};   // (the other colours as the wrong answers)
  // Ask for something else, and you've pointed at one thing and asked for another (decided 29 October 2026: he handed it
  // over all the same): he's puzzled, a ? over him (puzzled, in js/draw.js), and asks again (the shop's puzzled, then its
  // ask); the same choices come again, the right one somewhere else, till you've asked for what you pointed at, and only
  // then do you pay. (The right one is shown each time, so you can't get stuck; asking again counts for nothing: gapQ's again.)
  if (!await gapQ({...q, seen}) && sh.puzzled){
    const who = NPCS.find(n => n.id === sh.who);
    if (who) who.puzzled = true;
    try {
      do {
        await showNarration(fill(sh.puzzled.replace('{item}', a.given)));
        // once you know it, you say sorry, and he says it doesn't matter (the shop's sorry and noProblem: decided 4 November
        // 2026, as 对不起 and 没关系 were met just once)
        if (sh.sorry && lvl(sh.sorry) >= 1 && await replyWith(sh.sorry, {about:sh.sorryAbout, who:sh.who}) && sh.noProblem) await showDialog(face, L[sh.noProblem]);
        await showDialog(face, L[sh.ask]);
      } while (!await gapQ({...q, options:reshuffled(seen.options || [a.gap], a.gap), again:true, seen}));
    } finally { if (who) delete who.puzzled; }
  }
  sentence.filter(w => lvl(w) >= 1).forEach(useWord);
  spend(i.price);
  if (toBag(i)) intoBag(i.item);   // food (or bait) goes in your bag: you can buy it again and again
  else if (i.for) here().holding[i.for] = i.item;   // something for someone (for), carried till you give it them, such as the rice and fish for the cave
  else if (i.tool) S.tools.push(i.item);   // a tool, yours from now on, in every area (js/trade.js)
  else if (i.decor) S.decorNew.push(i.item);   // something for the cave, set up there the next time you go in
  else here().bought.push(i.item);
  if (i.wear && !S.wardrobe.owned.includes(i.item)){ S.wardrobe.owned.push(i.item); putOn(i.item); }   // you put it on
  save(); SFX.fanfare();
  if (i.wear) redress();   // redraw your monkey wearing it
  // it's handed to you: you say thank you, and they say you're welcome (decided 22 October 2026: they thanked you, and
  // you thanked them, which made it a puzzle why a monkey's thanks wanted 不客气)
  if (sh.reply && await replyWith(sh.reply, {about:sh.given.replace('{item}', a.given), pic:a.pic, who:sh.who}) && sh.welcome) await showDialog(face, L[sh.welcome]);
  toast(fill(a.bought));
  if (!talkingTo) await runEvents();   // (as for a request: after the conversation)
  return true;
}
async function lookAt(t){   // the card for the word you learn by looking at a tile
  const w = lookWord(t);
  if (w === t.word && t.colour && lvl(w) >= 1 && lvl(t.colour) >= 1){ await showPicked(coloured(t), '', {label:'You see', pic:colourPic(t)}); return; }
  const note = w === t.word ? t.note || (lvl(w) === 0 ? t.newNote : '') : '';
  await showNotice(w, {...(note ? {note:fill(note)} : {}), ...(w === t.word && t.colour ? {pic:colourPic(t)} : {})});
  if (t.message) toast(t.message);
}
// Something of one colour, such as a red flower (colour: its colour's word): once you know its word and its colour, A shows
// the two together, such as 红色的花 (a red flower), on a card like a word's, with its own picture (a picture for a few words,
// such as 红色 的 花, or its word's own if it's that colour already, such as 花's pink flower); till then, its word's card,
// with that picture, so it's the colour you looked at (decided 26 October 2026: after you'd picked the big monkey's three
// flowers, they all went back to being called 花).
const coloured = t => { const c = WORDS[t.colour].en; return {zh:`${t.colour} 的 ${t.word}`, en:`${/^[aeiou]/.test(c) ? 'An' : 'A'} ${c} ${WORDS[t.word].en}`}; };
const COLOURED = () => [...new Map([...[AREA.legend, ...Object.values(AREA.places).map(p => p.legend || {})].flatMap(l => Object.values(l)).filter(t => t.colour && t.word),
  ...((AREA.birds || {}).colours || []).map(colour => ({word:AREA.birds.word, colour})), ...colouredThings()].map(t => [coloured(t).zh, coloured(t)])).values()];   // every one there is, such as 粉色的花 and 黄色的鸟 (for the voices and CHINESE.md)
const colourPic = t => PICTURES[coloured(t).zh] ? coloured(t).zh : t.word;
const stepCard = t => ({...(t.stepNote ? {note:t.stepNote} : {}), ...(t.colour ? {pic:colourPic(t)} : {})});   // (stepping on it first, such as onto a red flower)
async function gather(t, x, y){   // pick up something for a request, such as fruit or water
  const g = t.gather, f = gatherFor(g), p = g.count ? here().picked[f] = here().picked[f] || [] : null, key = g.kind || `${x},${y}`;
  if (p && p.includes(key)){ SFX.bump(); toast(fill(g.again)); return; }   // (one of this kind already)
  await pickUpAct(g.item, {at:[x, y], pic:g.picked && g.picked.zh});
  // the request comes first: collecting water is where 水 is introduced
  if (lvl(g.item) === 0) await showNotice(g.item, {note:g.note, ...(t.colour && g.item === t.word ? {pic:colourPic(t)} : {})});
  if (p){   // one at each patch (or one of each kind, such as a colour), until you have enough
    if (g.kind && WORDS[g.kind] && lvl(g.kind) === 0) await showNotice(g.kind, g.kindNote ? {note:fill(g.kindNote)} : {});   // the first of its kind teaches its word, such as 红
    p.push(key);
    if (p.length >= g.count) here().holding[f] = g.item;
    save();
    const text = fill(p.length >= g.count ? g.full : g.message);
    if (g.picked) await showPicked(g.picked, text); else toast(text);   // what you've picked, such as 红色的花 (a red flower), with the message on its card
    return;
  }
  here().holding[f] = g.item; save(); toast(fill(g.message));
}
// A fruit tree, once the content says (the legend's pick), gives you a fruit for your bag: one each time you come to
// the place (it has no more ripe ones until then), up to as many as you can carry. So does anything else whose pick says,
// such as the bees' hive, honey (label: what A says; took: what you do; none: what it says when it has no more for now),
// one for the whole of it, however many squares it covers.
const canPick = t => !!t.pick && matches(t.pick.if || {});
const pickedHere = new Set();   // the trees you've picked from since you came into the place you're in
// You reach for what you're picking up (w: its word; pic: the name of its picture, if not w's, such as 红色 的 花; at: its
// square, [x, y], if not the one you're facing) and it comes into your hands, and you hold it up (decided 6 November 2026,
// after playing it: things just turned up in your bag): from a tree's leaves, dropping as the tree shakes, you up on
// tiptoe for it; out of what it's in, such as the hive's honey or the woodpile, you leaning into it; or up off the ground,
// or out of the water with a splash, you crouching for it, such as a flower or a stone (the pick act: its picture in ACTS
// and drawActFx, js/draw.js, and your pose, the pick pose in js/poses.js). Picking fruit, gathering for a request,
// carrying and the pickUp step all do it.
async function pickUpAct(w, {pic, at, reach:r} = {}){   // (reach: 'in', leaning into something that isn't one of the map's big objects, such as a cart)
  const [x, y] = at || facing(), o = mapObjects().find(o => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
  const tree = !!o && LEAFY.includes(o.look), piece = o && OBJECT_PIECES.find(p => p.key === objectKey(o)), reach = r || (tree ? 'up' : o ? 'in' : 'down');
  if (piece) piece.rustle = performance.now();   // (a tree shakes, as you reach into it)
  startAct('pick', {x, y, w, pic, reach, ...(tree ? {from:[o.x*T + o.w*T/2 + Math.round((Math.random() - .5) * 8), o.y*T - 12]} : {})});   // (from: where in its leaves it drops from)
  if (!o && WATERY.includes(tileAt(x, y).look)){   // (a splash where your paws go in)
    const [px, py] = poseSprite('pick', pl.dir, reach).item; splashes.push({x:pl.px + px, y:pl.py + py + 1, t0:performance.now(), small:true}); SFX.splash(.12);
  }
  else (tree ? SFX.scuffle : SFX.swish)();
  await sleep(PICK.caught); SFX.right();
  await sleep(PICK.ms - PICK.caught);
  acting = null;
}
async function pick(t, x, y){
  const w = t.pick.item, o = mapObjects().find(o => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h), key = o ? o.x + ',' + o.y : x + ',' + y;
  if (pickedHere.has(key)){ SFX.bump(); toast(fill(t.pick.none || 'No more ripe ones. Come back another time.')); return; }
  if (!intoBag(w)){ SFX.bump(); toast(`Your bag has ${carryOf(w)} ${wz(w)} already.`); return; }
  pickedHere.add(key);
  await pickUpAct(w, {at:[x, y]});
  toast(`${t.pick.took ? fill(t.pick.took) : `You pick a ${wz(w)}`} for your bag (${S.bag[w]} of ${carryOf(w)}). ${FOOD[w].does}.`);
}
const ACTIONS = {   // special things that happen when you press A at some tiles (the legend's action)
  async story(t){ await lookAt(t); await storyScroll(); },
  training(){ return trainingGround(); },
  async sign(t){   // the area's sign, or a tile's own (sign: its name, what it says and a hint)
    const sg = t.sign || AREA.sign, mk = sg.made;
    // once you know each part of what it says (made, with its if), its card shows how it's made, as a word's does
    if (mk && matches(mk.if)){ await nameCard(sg.says, mk); if (mk.set){ Object.assign(here(), mk.set); save(); } return; }
    SFX.blip();
    const face = t.sign ? `<div class="speaker"><div class="spk"><div class="spk-zh">${sg.name.zh} <span class="spk-py">${sg.name.py}</span></div><div class="spk-en">${esc(sg.name.en)}</div></div></div>` : speaker('sign');
    await showDialog(face, {t:toks(sg.says.zh), en:sg.says.en}, sg.hint ? {hint:sg.hint} : {});
  }
};
async function interact(x, y){
  const n = npcAt(x, y) || followerAt(x, y);
  if (n && n.asleep) return toast(asleepNote(n));   // (for the night: js/daynight.js)
  if (n) return n.shoo ? shooAway(n) : talk(n);
  const way = exitAt(x, y);
  if (way && way.by === 'A' && isOpen(way)) return goThrough(way);
  const a = animalAt(x, y);
  if (a && asleepNow(a)) return toast(animalAsleep(a));   // (a day animal at night, or a night one by day: js/art.js)
  if (a && a.waits && lvl(a.hz) === 0 && !await practiseFirst(a.id)) return;   // (an animal whose word is new waits for a little practice: waits)
  if (a) return wildAppears(a, {x, y, d:pl.dir});
  const bd = birdAt(x, y);
  if (bd && BIRD_WORD){ await lookAt({word:BIRD_WORD, colour:bd.colour, note:AREA.birds.note}); shooBird(bd); return; }   // (such as 黄色的鸟, once you know its colour)
  if (thingLabel(x, y)) return thingAct(x, y);   // a treasure, or something for the cave (js/trade.js)
  const h = hiddenAt(x, y);
  if (h) return findHidden(h);
  const hs = hideSpotAt(x, y);
  if (hs) return lookForHider(hs);
  if (here().spying && here().spying.place === PLACE && await spyFind(x, y)) return;   // (I spy: what they see?)
  const spot = spotLook(x, y);
  if (spot) return runSteps(spot.do);
  const t = tileAt(x, y);
  if (t.hop){ const row = hopAhead(); return row ? hopAcross(row) : SFX.bump(); }   // stepping stones: hop onto the row in front of you
  if (t.ask && lvl(t.word) === 0) return askAbout(t);   // something new to ask a person about (这是什么？)
  if (t.onLook){ const p = t.onLook.find(p => !p.if || matches(p.if)); if (p) return p.waits && !await practiseFirst(nearestPerson() ? nearestPerson().id : 'player') ? null : runSteps(p.do); }   // the tile's own steps, while the story says (waits: a new word, after a little practice)
  if (t.gather && canGather(t.gather) && !looksFirst(t)) return gather(t, x, y);
  if (canPick(t) && !looksFirst(t)) return pick(t, x, y);
  if (t.fishing && canFish() && !looksFirst(t)) return goFishing(x, y);   // water where fish live, once you have a rod (js/fishing.js)
  if (t.action) return ACTIONS[t.action](t);
  if (t.word) return lookAt(t);
  SFX.bump();
}
// Whether A at (x, y) would take one more of what you're collecting there, one at a time (a collect step, or a carry step
// that isn't howMany, in what A does there now), such as the bowls from the cave's stack or fresh grass for the cow: then
// A takes the next at once, never resting, and never stopping first to close the message the last one left (justFinished
// and messageFirst, js/input.js; decided 6 November 2026, after playing it: filling the senior pupil's buckets one at a
// time, the pool seemed not to give the next).
function collectsMore(x, y){
  if (npcAt(x, y) || followerAt(x, y) || animalAt(x, y) || hiddenAt(x, y) || spotLook(x, y) || thingLabel(x, y)) return false;   // (A does something else there first: interact)
  const t = tileAt(x, y), p = t.onLook && t.onLook.find(p => !p.if || matches(p.if));
  return !!p && !p.waits && p.do.some(s => (!s.if || matches(s.if)) && (s.collect || (s.carry && !s.howMany)));
}
// I spy (the spy step): is anything here this word? And what they can see, said again (only in Chinese); and A at
// something, while you're playing: what they see, found, or something else (a square with no word: nothing, as ever).
const wordHere = w => { for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (tileAt(x, y).word === w) return true; return false; };
async function spyAsk(){
  const sp = here().spying;
  await showDialog(speaker(sp.by), L[sp.lines[sp.list[sp.i]]], {noEn:true});
  if (sp.listen) toast(fill(sp.listen));
}
async function spyFind(x, y){
  const sp = here().spying, w = tileAt(x, y).word, want = sp.list[sp.i];
  if (!w || !(sp.words || sp.list).includes(w)) return false;   // (anything else: as ever, such as sweeping up leaves)
  if (w !== want){ SFX.wrong(); toast(fill(sp.wrong || 'Not that one. Listen again!')); await sleep(600); await spyAsk(); return true; }
  reviewed(want, true); SFX.right(); sp.i++; save();
  toast(fill((sp.found || 'That’s it: {word}!').replace('{word}', `{${want}}`)));
  if (sp.i < sp.list.length){ await sleep(700); await spyAsk(); return true; }
  delete here().spying; here()[sp.key] = (here()[sp.key] || 0) + 1; save();
  await runSteps(sp.done, sp.by);
  return true;
}
// Your monkey turned into something (the turnInto step), for a moment, in a puff of smoke (pl.form: its word; puffAt: when
// the last puff was, js/draw.js).
let puffAt = -1e9;
const EAT_MS = 1600;   // how long eating a meal takes (the eat step)
// Eating smelly food from your bag (the area's food with stink, such as a durian): you munch it on the map, as a meal (pl.
// eating: drawEating, js/draw.js), and the first time your monkey says how smelly it is (its eaten steps, teaching 臭);
// then no wild creature comes near you for a while (stinkUp, js/input.js), its note says so.
async function eatSmelly(w, food){
  if (busy || !(S.bag[w] > 0)) return;
  busy = true;
  try {
    S.bag[w]--; useWord(w); save();
    pl.eating = {w, t0:performance.now()};
    for (let i = 0; i < 4; i++){ SFX.scuffle(); await sleep(EAT_MS / 4); }
    pl.eating = null;
    stinkUp(w, food.stink);
    if (food.eaten) await runSteps(food.eaten);
    if (food.note) toast(fill(food.note));
  } finally { busy = false; finished(); updateHUD(); }
}
const TOLD_MS = {right:1800, wrong:3000};   // how long you stay changed after a question, as what you turned into is told, right or wrong (the turnInto step)
async function becomeForm(w, hold = 1600, said){   // (said: what you're told as you change, such as what you turned into)
  puffAt = performance.now(); SFX.shimmer(); pl.form = w; if (said) toast(said); await sleep(hold);
  puffAt = performance.now(); SFX.swish(); pl.form = null; await sleep(350);
}
// Flying by cloud (the cloud somersault, once you've learned it: the area's cloudTravel.has): from your map, to any place
// you've been, landing where a way into it leaves you (or its own land).
const canFly = () => !!AREA.cloudTravel && matches(AREA.cloudTravel.has) && !!PLACES[PLACE].onMap;
function landingIn(id){
  if (PLACES[id].land) return PLACES[id].land;
  for (const p of Object.values(PLACES)) for (const e of p.exits || []) if (e.to === id && e.arrive) return e.arrive;
  return null;
}
async function flyTo(id){
  const at = landingIn(id); if (!at) return;
  SFX.swish(); if (AREA.cloudTravel.note) toast(fill(AREA.cloudTravel.note));
  await goThrough({to:id, arrive:at, facing:'down'});
}
// Asking a person what something is (Area 2, decided 4 November 2026: the human world's way of finding words; the area's
// asking): once you know its word (什么), A at something new with a person within ASK_NEAR squares of you has your monkey ask
// 这是什么？, and they turn to you and tell you (its ask: their line), teaching its word, its card quiet, as in a
// conversation, straight away (it waited for a little practice first till 7 November 2026: only the school's new words
// wait now). Till you know how to ask, or with nobody near, a message says so.
const ASK_NEAR = 3;
const nearestPerson = () => NPCS.filter(n => PEOPLE.has(n.id) && Math.max(Math.abs(n.x - pl.x), Math.abs(n.y - pl.y)) <= ASK_NEAR)
  .sort((a, c) => (Math.abs(a.x - pl.x) + Math.abs(a.y - pl.y)) - (Math.abs(c.x - pl.x) + Math.abs(c.y - pl.y)))[0] || null;
async function askAbout(t){
  const A = AREA.asking, who = nearestPerson();
  if (!A || !matches({knows:A.word})){ SFX.bump(); toast(fill((A || {}).cantYet || 'You don’t know what this is yet.')); return; }
  if (!who){ SFX.bump(); toast(fill(A.nobody)); return; }
  const outer = caughtBefore; caughtBefore = caughtCount();
  try {
    await showDialog(speaker('player'), L[A.line]);
    who.dir = dirOf(pl.x - who.x, pl.y - who.y) || who.dir;   // (they turn to you)
    await showDialog(speaker(who.id), L[t.ask], {teach:t.word});
    await showNotice(t.word, {quiet:true, ...(t.note ? {note:fill(t.note)} : {})});
  } finally { caughtBefore = outer; }
  if (!talkingTo) await runEvents();
}
// A bird sitting somewhere (a character that looks like a bird, its colour, colour), such as one pecking at the wild melons:
// A shows it, such as 红色的鸟 (a red bird) once you know its colour, as for a bird that lands near you, and it flies off,
// gone for good (kept in the save's shooed), with what you're told then (shoo).
async function shooAway(n){
  await lookAt({word:BIRD_WORD, colour:n.colour});
  const now = performance.now();
  birds.push({tx:n.x, ty:n.y, x:n.x*T + 4, y:n.y*T + 2, t0:now, until:now, from:n.x*T < pl.px ? -1 : 1, colour:n.colour, off:now});   // (away from you)
  here().shooed.push(n.id); save(); placeCharacters();
  toast(fill(n.shoo));
}
// Part of something bigger that A looks at on its own (the area's spots), here in the place you're in, such as the
// lanterns at the school's front corners: what A does there now (the part of its onLook whose if matches), if anything.
function spotLook(x, y){
  const sp = (AREA.spots || []).find(s => s.at.some(a => placeOf(a) === PLACE && a[0] === x && a[1] === y));
  return sp ? sp.onLook.find(p => !p.if || matches(p.if)) : null;
}
// Something hidden off the path (the area's hidden), not found yet, here in the place you're in; and finding it: shells, or a
// fruit for your bag (with no room, it stays where it is), once.
const hiddenAt = (x, y) => (AREA.hidden || []).find(h => placeOf(h.at) === PLACE && h.at[0] === x && h.at[1] === y && !here().finds[h.id]);
function findHidden(h){
  if (h.fruit && !intoBag(h.fruit)){ SFX.bump(); toast(`There’s a ${wz(h.fruit)} here, but your bag has no room for it. Come back for it.`); return; }
  here().finds[h.id] = 1;
  if (h.shells) earn(h.shells);
  save(); SFX.chime(); toast(fill(h.note));
}
// An animal hiding in the tall grass, which rustles there: face it from beside it, or step in, to meet it. After you meet
// one, another hides a few steps later.
const HIDE_AFTER = 4;   // steps before another animal hides
let rustle = null, stepsSince = HIDE_AFTER;
const GRASS_TILES = [];   // where animals can hide, in the place you're in
function findGrass(){ GRASS_TILES.length = 0; for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (tileAt(x, y).animals) GRASS_TILES.push([x, y]); }
findGrass();
// Going into another place: its map is drawn, and whatever was happening in the last one (an animal
// hiding, birds, a meeting) is left behind.
function enterPlace(id){
  const been = here().visited; if (!been.includes(id)) been.push(id);   // (the places you've been, for the map: js/map.js)
  if (id === PLACE) return;
  keepPicture();   // (the one you're leaving, as you saw it, for its close-up on the map: js/map.js)
  foundAt = null;   // (the little monkey you found at hide and seek is back at its spot when you come back: js/hide.js)
  setPlace(id); placeCharacters(); findGrass(); rustle = null; stepsSince = HIDE_AFTER; foe = null; birds.length = 0; pickedHere.clear(); buildMap();
  for (const k in hopQs) delete hopQs[k];   // (new pictures on the stepping stones each time you come)
  playSong(placeSong());   // its own music, if it has some
}
// Through a way to another place: a quick fade, and you're there, with its name at the top of the screen. The screen
// fades to black in FADE_MS, and you're in the new place just as it's black, as it fades back in (decided 26 October 2026:
// the fade took twice as long as the wait, so you saw the classroom, then black, then the classroom again).
const FADE_MS = 350;
const fadeDark = now => { const k = (now - fadeT) / FADE_MS; return k >= 0 && k < 2 ? (k < 1 ? k : 2 - k) : 0; };   // how dark the fade is now, 0 to 1
async function goThrough(e){
  held = null; queued = null;
  const water = e.how === 'water' || e.how === 'jump';
  if (e.how === 'jump') await leap(e.at);   // a jump into the waterfall, with a splash
  if (water){ waterT = performance.now(); SFX.splash(); } else { fadeT = performance.now(); SFX.blip(); }
  await sleep(water ? 600 : FADE_MS);       // (a rush of water covers the screen, or it fades to black)
  const first = !here().visited.includes(e.to);   // (somewhere new: now on your map, if you have one)
  enterPlace(e.to);
  S.pos = {place:e.to, x:e.arrive[0], y:e.arrive[1], dir:e.facing || pl.dir}; placePlayer(); stepClear(); save();
  if (water) dripUntil = performance.now() + 1500;   // you come through dripping
  showPlaceName(first && hasMap());
  const t = tileAt(pl.x, pl.y);   // arriving on something you learn by stepping on it, such as the mountain path, counts
  if (t.learnOnStep && lvl(t.word) === 0) await showNotice(t.word, stepCard(t));
}
// A little hop, in an arc, to (tx, ty) in the map (pixels), such as onto a bed and off it again.
// The shortest way from one square to another (from and to: [x, y]), through squares you can walk on and not through
// anyone (but free: a character who'll move out of the way), nor blocked (a square to keep off, such as yours, for someone
// leading you): the squares after from, in order, or none if there's no way.
function pathTo(from, to, {free = null, blocked = null} = {}){
  const key = (x, y) => x + ',' + y, back = new Map([[key(...from), null]]), queue = [from];
  const open = (x, y) => !!tileAt(x, y).walk && !(blocked && blocked[0] === x && blocked[1] === y) && !exitAt(x, y)
    && (!npcAt(x, y) || npcAt(x, y) === free) && !animalAt(x, y);
  while (queue.length){
    const [x, y] = queue.shift();
    if (x === to[0] && y === to[1]){ const path = []; for (let k = key(x, y); back.get(k); k = back.get(k)) path.unshift(k.split(',').map(Number)); return path; }
    for (const [dx, dy] of Object.values(DV)){
      const nx = x + dx, ny = y + dy;
      if (!back.has(key(nx, ny)) && open(nx, ny)){ back.set(key(nx, ny), key(x, y)); queue.push([nx, ny]); }
    }
  }
  return [];
}
async function hop(tx, ty, ms = 300){
  const fx = pl.px, fy = pl.py, n = Math.max(1, Math.round(ms / 17));
  for (let i = 1; i <= n; i++){ const p = i / n; pl.px = fx + (tx - fx) * p; pl.py = fy + (ty - fy) * p - Math.sin(p * Math.PI) * 6; await sleep(17); }
  SFX.turn();
}
// Stepping stones across a brook (a legend's hop: the card's label, what it asks, ask, and what you're told when you slip,
// splash), such as the south slope's (decided 28 October 2026, after playtesting: the walk south was longer, with nothing
// to practise on the way): you can't walk onto them, only hop, a row at a time, up or down, pressing A at the row you're
// facing. Over each stone of it floats a picture (drawHopPics, js/draw.js), and you hear a word: hop onto the stone with
// its picture. The right one holds. A wrong one tips, in you go, and you climb out onto the bank you came from, dripping,
// the card having shown you the right one. The pictures are a question about a word you know (from the front of the
// review list), kept for the row till you answer it, so they don't change as you look; a new one each time after that.
const HOP_MS = 380, DUNK_MS = 700;   // how long a hop from stone to stone takes; how long you're in the brook when you slip
const hopQs = {};   // each row's question, by place and row, till you've answered it
let hopBank = null, dunkT = -9999;   // the bank you last hopped from ({place, x, y}); when you last fell in (js/draw.js)
function hopAhead(){   // the row of stones you're facing, up or down ([x, y] each, left to right), if you are
  const [x, y] = facing();
  if ((pl.dir !== 'up' && pl.dir !== 'down') || !tileAt(x, y).hop) return null;
  let x0 = x, x1 = x;
  while (tileAt(x0 - 1, y).hop) x0--;
  while (tileAt(x1 + 1, y).hop) x1++;
  return Array.from({length:x1 - x0 + 1}, (_, i) => [x0 + i, y]);
}
function hopQuestion(row){   // its question: a listening one with an answer for each stone (none if you don't know enough words)
  const key = PLACE + ',' + row[0][1];
  if (hopQs[key] !== undefined) return hopQs[key];
  const w = toAsk(null, 1)[0], q = w && wordQuestion(w, null, 'listen', row.length);
  return hopQs[key] = q && q.opts.length === row.length ? {...q, w} : null;
}
async function hopAcross(row){
  const t = tileAt(...row[0]), hp = typeof t.hop === 'object' ? t.hop : {}, q = hopQuestion(row);
  let at = row.findIndex(([x]) => x === pl.x), ok = true;   // (with no question, onto the stone in front of you)
  if (q){
    ok = await pictureQ({head:`<p class="label">${esc(hp.label || 'Stepping stones')}</p>`,
      body:`<div class="askrow"><p class="prompt">${esc(hp.ask || 'Listen. Which stone has its picture?')}</p><button class="sayBig" data-a="say" aria-label="Play the word again">🔊</button></div>`,
      options:q.options, answerIdx:q.answerIdx, word:q.w, type:'listen', onShow:() => setTimeout(() => say(q.w), 300), onAnswer:(right, i) => { at = i; }});
    closeCard();
    delete hopQs[PLACE + ',' + row[0][1]];
  }
  if (!tileAt(pl.x, pl.y).hop) hopBank = {place:PLACE, x:pl.x, y:pl.y};
  const from = {x:pl.x, y:pl.y}, [tx, ty] = row[at];
  if (ok) followersStep(performance.now(), true);   // (anyone following you hops too, onto where you were)
  await hop(tx * T, ty * T, HOP_MS);
  pl.px = tx * T; pl.py = ty * T;
  if (ok){ pl.x = tx; pl.y = ty; S.pos = {...S.pos, x:tx, y:ty}; save(); SFX.clack(); return; }
  if (hp.swing){ SFX.swish(); await hop(tx * T, ty * T - 4, 260); }   // a loose plank, hung by chains (swing): it swings away, and you grab the chain
  else { splashes.push({x:tx * T + 8, y:ty * T + 10, t0:performance.now()}); SFX.splash(); dunkT = performance.now(); await sleep(DUNK_MS); }   // it tips: in you go
  const bank = hopBank && hopBank.place === PLACE ? hopBank : from;
  await hop(bank.x * T, bank.y * T, HOP_MS);   // and you climb out, back where you started
  pl.px = bank.x * T; pl.py = bank.y * T; pl.x = bank.x; pl.y = bank.y; S.pos = {...S.pos, x:bank.x, y:bank.y}; save();
  if (!hp.swing) dripUntil = performance.now() + 1500;
  if (FOLLOWERS.some(n => tileAt(n.x, n.y).hop)) lineUp();   // (anyone following you, if on a stone, back with you)
  toast(fill(hp.splash || 'Splash! Try again.'));
}
// You leap from where you stand into the square at (the waterfall), in an arc, landing with a splash.
async function leap([tx, ty]){
  const fx = pl.px, fy = pl.py, STEPS_IN = 24;
  for (let i = 1; i <= STEPS_IN; i++){
    const p = i / STEPS_IN;
    pl.px = fx + (tx*T - fx) * p; pl.py = fy + (ty*T - fy) * p - Math.sin(p * Math.PI) * 12;
    await sleep(17);
  }
  splashes.push({x:tx*T + 8, y:ty*T + 10, t0:performance.now()}); SFX.splash();
}
// A place's own sounds (its sounds, such as the pine wood's crows, wind and a far-off howl): one now and then, every 12 to
// 30 seconds while you're there, the first a few seconds after you come in. Never while a card is open.
let ambientAt = 0, ambientIn = null;
const swishedAt = {};   // each monkey in training's last swing you could have heard
function practiceSounds(now){
  for (const n of NPCS){
    if (!practising(n)) continue;
    const k = Math.floor((now + practiceT(n)) / PRACTICE_MS), near = Math.abs(n.x - pl.x) + Math.abs(n.y - pl.y) <= 4;
    if (swishedAt[n.id] !== undefined && swishedAt[n.id] !== k && near && mode === 'play' && modal.hidden) SFX.swish(.12);
    swishedAt[n.id] = k;
  }
}
// The monkeys at play, when you're near: a little clack as each stone goes onto their tower, and a clatter as it falls;
// a splash as one splashes the other.
let towerWas = null, splashWas = null;
const nearYou = n => Math.abs(n.x - pl.x) + Math.abs(n.y - pl.y) <= 5 && mode === 'play' && modal.hidden;
function playSounds(now){
  const n = NPCS.find(c => PLAYS[c.id] === 'tower'), t = n ? towerAt(now) : null;
  if (towerWas && t && nearYou(n) && t.phase === 'build' && t.stones > towerWas.stones) SFX.clack();
  if (towerWas && t && nearYou(n) && t.phase === 'fall' && towerWas.phase !== 'fall') SFX.clatter();
  towerWas = t;
  const sp = NPCS.find(c => PLAYS[c.id] === 'splash'), s = sp ? splashAt(now).n : null;
  if (splashWas !== null && s !== null && s !== splashWas && nearYou(sp)) SFX.splash(.07);
  splashWas = s;
}
// The sounds of the part of the place you're in: the place's own (sounds: some of SFX's names), or, where they change from
// one part of it to another (each part: its rows, from and to, its columns too if it says, cols, its sounds, and an if,
// while the story says), the first part you're in, such as the hillside's as you climb, or the pasture's pines, where a
// lost cow's moo is louder the right way. A sound comes soon after you come into a part, then every so often.
function placeSounds(){
  const sounds = PLACES[PLACE].sounds;
  if (!sounds || typeof sounds[0] === 'string') return sounds;
  const part = sounds.find(p => pl.y >= p.rows[0] && pl.y <= p.rows[1] && (!p.cols || (pl.x >= p.cols[0] && pl.x <= p.cols[1])) && (!p.if || matches(p.if)));   // (and while its if matches)
  return part ? part.sounds : null;
}
function ambience(now){
  const sounds = placeSounds();
  if (!sounds || mode !== 'play' || !modal.hidden){ ambientAt = 0; return; }
  if (!ambientAt || ambientIn !== sounds){ ambientAt = now + (ambientAt ? 1500 + Math.random() * 2500 : 4000 + Math.random() * 6000); ambientIn = sounds; return; }
  if (now < ambientAt) return;
  SFX[sounds[Math.floor(Math.random() * sounds.length)]]();
  ambientAt = now + 12000 + Math.random() * 18000;
}
let placeNameT;
function showPlaceName(newOnMap = false){   // newOnMap: you've never been here, and it's drawn on your map now (js/map.js)
  const n = PLACES[PLACE].name, el = $('#placeName');
  el.innerHTML = `<span class="pzh">${n.zh}</span> <span class="ppy">${n.py}</span><span class="pen">${esc(n.en)}</span>${newOnMap ? `<span class="pnew">${PIN_SVG}New on your map</span>` : ''}`;
  el.hidden = false; clearTimeout(placeNameT); placeNameT = setTimeout(() => { el.hidden = true; }, 2600);
}
// A grass animal hides in tall grass at least 3 steps from you: one that lives in one place, hides, only there; and where
// the grass says which hide in it (animals: their ids), only those, such as the bees in their valley's tall flowers. A
// friend can hide in the tall grass of the places it roams too, never where it lives (decided 30 October 2026: outside
// the hillside and the bees' valley, every rustle was the rabbit), so you never see two of it at once. Not
// one of several of a kind whose rest are all out already, waiting for you to play again (such as a bee you didn't win
// over: no more hide till you have), nor where one is out.
// An animal asleep at its spot: what A says (it's fast asleep), and when to come back.
const animalAsleep = a => fill(`The {${a.hz}} is fast asleep. Shh! ${a.time === 'night' ? 'It comes out after dark.' : 'Come back in the daytime.'}`);
const roamsHere = a => a.roams.includes(PLACE) && a.place !== PLACE && S.friends.includes(a.id);
const allOut = a => { const n = here()[a.counts] || 0; return !!a.stays && n < a.many && n + outOf(a).filter(o => !o[2]).length >= a.many; };
function hideAnimal(){
  const hiding = ANIMALS.filter(a => (!a.at && (!a.hides || a.hides === PLACE) || roamsHere(a)) && inChapter(a) && !allOut(a) && awakeNow(a) && (!a.past || !!PLACES[PLACE].borrowed));   // (only those about now: a rabbit by day, a mouse at night; an earlier area's, only at home, js/data.js)
  if (rustle || !canWild() || !hiding.length || stepsSince < HIDE_AFTER) return;
  const far = GRASS_TILES.filter(([x, y]) => Math.abs(x - pl.x) + Math.abs(y - pl.y) >= 3 && !animalAt(x, y));
  if (!far.length) return;
  const [x, y] = far[Math.floor(Math.random() * far.length)], only = tileAt(x, y).animals;
  const pool = only === 'past' ? hiding.filter(a => a.past) : Array.isArray(only) ? hiding.filter(a => only.includes(a.id)) : hiding;   // ('past': an earlier area's long grass, borrowed: only its animals)
  if (pool.length) rustle = {x, y, a:pickAnimal(pool)};
}
// The grass rustling just ahead of you, as you step up to it or turn to face it: the animal hiding there jumps out of it,
// there (decided 27 October 2026, after playing it: walking up to it and stopping, you had to step in, and it jumped out
// beside you, which looked confusing). Gives what happens then, or null if it isn't ahead of you.
function rustleAhead(){
  const [x, y] = facing();
  if (!rustle || rustle.x !== x || rustle.y !== y || !canWild()) return null;
  const a = rustle.a; rustle = null; stepsSince = 0; held = null; queued = null;
  return wildAppears(a, {x, y, d:pl.dir});
}
async function arrive(x, y){
  S.pos = {place:PLACE, x, y, dir:pl.dir}; save();
  const way = exitAt(x, y);
  if (way && !way.by && isOpen(way)) return goThrough(way);   // a way you go through by stepping onto it
  const t = tileAt(x, y);
  stepsSince++;
  if (t.learnOnStep && lvl(t.word) === 0) return showNotice(t.word, stepCard(t));
  if (rustle && rustle.x === x && rustle.y === y && canWild()){ const a = rustle.a; rustle = null; stepsSince = 0; held = null; queued = null; return wildAppears(a); }   // (and nothing wild jumps out where one was hiding)
  const ahead = rustleAhead();
  if (ahead) return ahead;
  if (t.wild && await wildStep(t)) return;   // a wild creature jumps out of the long grass
  hideAnimal();
  callOut();
}
// Stallholders calling out what they sell as you walk past (a character's calls: one of the area's lines), within
// CALL_NEAR squares, one at a time and not too often: just for listening, nothing to answer, a note over them as they do
// (decided 4 November 2026, so the market feels busy, and you hear its words without being asked about them).
const CALL_NEAR = 4, CALL_EVERY = 14000, CALL_SHOWS = 1800;
let lastCallT = -1e9;
// (At night, what they sell then, nightCalls, such as the night market's stinky tofu at the bun stall.)
const callLine = c => (c.nightCalls && typeof isNight === 'function' && isNight() ? c.nightCalls : c.calls);
function callOut(){
  const now = performance.now();
  if (now - lastCallT < CALL_EVERY || !S.sound) return;
  const n = NPCS.find(c => typeof c.calls === 'string' && L[callLine(c)] && Math.abs(c.x - pl.x) + Math.abs(c.y - pl.y) <= CALL_NEAR);
  if (!n) return;
  lastCallT = now; n.callingT = now + CALL_SHOWS;
  say(L[callLine(n)].t.join(''), null, n.id);
}

let foe = null, alertUntil = 0;
function findSpot(){
  const order = [pl.dir].concat(['down','left','right','up'].filter(d => d !== pl.dir));
  for (const d of order){ const [dx,dy] = DV[d], x = pl.x + dx, y = pl.y + dy, t = tileAt(x,y); if (t.walk && t.look !== 'bridge' && !npcAt(x,y) && !followerAt(x,y) && !animalAt(x,y)) return {x, y, d}; }
  const [dx,dy] = DV[pl.dir]; return {x:pl.x + dx, y:pl.y + dy, d:pl.dir};
}
// Which animal hides: usually one you haven't met yet; otherwise usually one whose name needs practice or is near the
// front of the review list.
function pickAnimal(animals = ANIMALS){
  const unmet = animals.filter(x => !S.met.includes(x.id));
  const front = new Set(reviewOrder(ORDER.filter(w => lvl(w) >= 1)).slice(0, 2 * PICK_FROM));
  const soon = animals.filter(x => S.met.includes(x.id) && (needsPractice(x.hz) || front.has(x.hz)));
  const pool = unmet.length && Math.random() < .75 ? unmet : soon.length && Math.random() < .75 ? soon : animals;
  return pool[Math.floor(Math.random() * pool.length)];
}
// Meeting an animal: it jumps out next to you (from the grass), or at its own spot (spot), or where it's out already (one
// of several of a kind that stays out once met, such as a bee you didn't win over the first time).
async function wildAppears(a, spot = findSpot()){
  pl.dir = spot.d;
  const was = outAt(spot.x, spot.y);
  const atHome = !!a.at && a.place === PLACE && a.at[0] === spot.x && a.at[1] === spot.y;   // (not a friend jumping out of the grass somewhere it roams)
  foe = {a, x:spot.x, y:spot.y, t0:performance.now(), state:'in', spot:atHome || !!was};   // (spot: one at its own spot, or out, stays there)
  alertUntil = performance.now() + 1000;
  SFX.encounter();
  await sleep(1100);
  const firstMeet = !S.met.includes(a.id);
  if (firstMeet){ S.met.push(a.id); save(); }
  const justTaught = lvl(a.hz) === 0, play = AREA.animalsPlay;
  if (justTaught) await showNotice(a.hz, {note:a.meetNote ? fill(a.meetNote) : `A wild ${a.name} jumped out of the ${wz(HIDING_WORD)}! Answer its questions to make friends.`});
  else await sayFully(a.hz, 900);   // (its name, said in full before its line)
  // one of several of its kind to make friends with, such as the bees in their valley (many: how many; counts: what the area
  // remembers, how many so far): this one is one more, unless it's a friend already (one out, that you've won over). With
  // stays, it stays out where it is (if that never shuts a way), so you can tell it from the next: another, the hint before
  // a new one's questions, after the first; again, before playing again with one you didn't win over; lost, if you don't.
  const more = a.many && (here()[a.counts] || 0) < a.many && !(was && was.friend), another = more && S.friends.includes(a.id);
  const stay = !!a.stays && more && (!!was || keepsClear(spot.x, spot.y));
  const hint = justTaught ? '' : was && more ? a.stays.again : another && a.stays ? a.stays.another : S.friends.includes(a.id) ? play && play.friendHint : play && play.hint;
  if (play) await showDialog(speaker(a.id), L[play.say], {ok:'Play', hint:hint ? fill(hint) : ''});   // it says it wants to play, so its questions never just start
  const among = a.group ? [a.chapter, undefined, a.group] : [a.chapter, a.place], all = chapterAnimals(...among).length;   // (counted with its chapter's animals in the same place, or its group's anywhere: one on its own, such as the deer, needs no count)
  const won = await encounter({id:a.id, hz:a.hz, img:portrait(a.id), wild:true, justTaught, home:a.home, another, ...(stay ? {lose:a.stays.lost} : {})});
  if (stay){ stayOut(a, spot.x, spot.y, won); foe.spot = true; }   // (drawn where it stays, from now on)
  foe.state = won ? 'happy' : 'flee'; foe.t1 = performance.now();
  await sleep(won ? 1000 : 650);
  foe = null;
  if (won) placeCharacters();   // (one who takes its place once it's your friend, such as the goat beside the river valley's path)
  if (won && more){ const n = here()[a.counts] = (here()[a.counts] || 0) + 1; save(); await runSteps(a.counted[n - 1] || []); }   // counted aloud, one more friend
  // how many of the animals here you've found, once you've met it (decided 7 November 2026: told as its questions began,
  // they covered it at once), unless you're being told something else just then, such as the bees counted
  if (firstMeet && all > 1 && $('#saybox').hidden) toast(`${a.group && (AREA.animalGroups || {})[a.group] || 'Animals'} found: ${metCount(...among)}/${all}`);   // (a group's own name, such as Night animals)
}
// One of several of a kind stays out at (x, y) (stays), a friend now if you won it over (won).
function stayOut(a, x, y, won){
  const list = here().out[a.id] = here().out[a.id] || [], o = list.find(([ox, oy]) => ox === x && oy === y);
  if (o) o[2] = o[2] || (won ? 1 : 0); else list.push([x, y, won ? 1 : 0]);
  save();
}
// Whether something can stay at (x, y), such as a bee out over the flowers, and leave every square you can walk to now
// still in reach: it never shuts a way.
function keepsClear(x, y){
  if (!walkable(x, y) || exitAt(x, y)) return false;
  const reach = shut => {
    const seen = new Set([pl.x + ',' + pl.y]), todo = [[pl.x, pl.y]];
    while (todo.length){
      const [a, c] = todo.pop();
      for (const [dx, dy] of Object.values(DV)){
        const nx = a + dx, ny = c + dy, k = nx + ',' + ny;
        if (seen.has(k) || (shut && nx === x && ny === y) || !walkable(nx, ny)) continue;
        seen.add(k); todo.push([nx, ny]);
      }
    }
    return seen.size;
  };
  return reach(true) === reach(false) - 1;
}
