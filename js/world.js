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
  + Object.entries(here().changed).filter(([k]) => k.startsWith(PLACE + ':')).join() + '|' + Object.entries(paintedParts()).join();
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
const walkable = (x, y) => !!tileAt(x, y).walk && !npcAt(x, y) && !animalAt(x, y);   // (an animal standing on open ground, such as a deer, is in the way)
// Steam vents (a legend's vent: {every, puff, at}, in ms, such as the hot spring valley's): every so often, steam puffs out
// of one for a moment (puff ms of every, at: where in the cycle it starts), and while it does, you can't step onto it (its
// hot), and standing on it, it pushes you back off it (its pushed): the hot spring valley's twist, timing your way between
// its pools (decided 27 October 2026).
const puffing = (x, y, now = performance.now()) => { const v = tileAt(x, y).vent; return !!v && (now + (v.at || 0)) % v.every < v.puff; };
const lookWord = t => (t.learnFirst && lvl(t.learnFirst) === 0 ? t.learnFirst : t.word);   // the word a tile teaches right now
const canGather = g => here()[g.for] === 'asked' && here().holding[g.for] !== g.item;   // asked for, and not already holding it
// Somewhere you collect something else (water, from the river or the pond) whose own word you don't know yet: A looks
// first, teaching its word, and collects after that (decided 22 October 2026: you got the water, and never the word). The
// same when a tile fills your bag (pick). (A fruit tree's word was 水果 from 23 to 24 October 2026; now it's its fruit.)
const looksFirst = t => !!t.word && lvl(t.word) === 0 && t.word !== (t.gather || t.pick || {}).item;
const DV = {up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]};
const OPP = {up:'down', down:'up', left:'right', right:'left'};
const dirOf = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');   // the way towards dx, dy

const learnedCount = () => ORDER.filter(w => lvl(w) >= 1).length;
// The animals in a chapter of the story (each animal's chapter, 0 if not given), or just those of one place in it (place,
// such as the fox on the hillside), and how many of them you've met: the prologue's animals are counted on their own, so a
// new chapter's animals never stand in the way of the prologue's story.
const chapterAnimals = (ch = 0, place) => ANIMALS.filter(a => a.chapter === ch && (!place || a.place === place));
const metCount = (ch = 0, place) => chapterAnimals(ch, place).filter(a => S.met.includes(a.id)).length;
// The story's chapters in this area (AREA.chapters), and the one you're in (counting from 0). Each item on the
// area's checklist belongs to a chapter (chapter, 0 if not given); the checklist shows the chapter you're in.
const chapterNow = () => here().chapter || 0;
const chapterItems = () => AREA.checklist.filter(c => (c.chapter || 0) === chapterNow());
// [text, done, is it the exit test, found yet]: an item with show is found once show matches, or it's done
const areaChecklist = () => chapterItems().map(c => { const done = matches(c.done); return [fill(c.text, false, true), done, !!c.exitTest, !c.show || done || matches(c.show)]; });
const chapterDone = () => chapterItems().filter(c => !c.exitTest).every(c => matches(c.done));       // everything in this chapter done (apart from a test)
function getTasks(){   // the tasks to show now: the area's tasks whose if matches
  return AREA.tasks.filter(t => matches(t.if)).map(t => {
    if (t.arrow && t.arrow.sparkle) return {id:fill(t.id, true), text:fill(t.text, false, true), target:sparkleToFind(), arrow:true};   // or {sparkle}: the nearest thing that sparkles
    const c = typeof t.arrow === 'string' && ALL_NPCS.find(n => n.id === t.arrow);   // an arrow to a character
    const toPlace = t.arrow && t.arrow.place;   // or {place}: the way to a place, and none once you're there
    const at = c ? [c.x, c.y, c.place] : toPlace ? null : t.arrow || null, there = toPlace || (at && placeOf(at));
    const target = toPlace ? (there === PLACE ? null : wayTo(there)) : !at ? null : there === PLACE ? [at[0], at[1]] : wayTo(there);   // in another place, the arrow points the way there
    return {id:fill(t.id, true), text:fill(t.text, false, true), target, arrow:!!t.arrow, ...(c && there === PLACE ? {npc:true} : {}),
      ...(t.clue && hiding() ? {clue:hideSpot(hideState().spot)} : {})};   // clue: hide and seek's, to hear again (js/hide.js)
  });
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
  if (n) return n.label || 'Talk';
  if (animalAt(x, y)) return 'Meet';
  if (BIRD_WORD && birdAt(x, y)) return 'Look';
  const way = exitAt(x, y);
  if (way && way.by === 'A' && isOpen(way)) return way.label || 'Go';   // a way you go through by pressing A, such as jumping through the waterfall
  if (hideSpotAt(x, y)) return 'Look';   // where a little monkey playing hide and seek might be (js/hide.js)
  const spot = spotLook(x, y);
  if (spot) return spot.label || 'Look';
  const t = tileAt(x, y);
  if (t.hop) return hopAhead() ? 'Hop' : '';   // stepping stones, up or down in front of you
  const look = t.onLook && t.onLook.find(p => !p.if || matches(p.if));
  if (look && look.label) return look.label;   // the tile's own steps say what A does, such as Sleep in a bed
  if (t.gather && canGather(t.gather) && !looksFirst(t)) return t.gather.label;
  if (canPick(t) && !looksFirst(t)) return t.pick.label || 'Pick';
  if (t.fishing && canFish() && !looksFirst(t)) return 'Fish';
  if (t.landmark) return t.label || 'Look';
  const w = lookWord(t);
  return w && (lvl(w) === 0 || (w === t.word && t.colour && lvl(t.colour) >= 1)) ? 'Look' : '';   // (something new, or something of a colour you know: lookAt)
}
const COUNTS = {   // what a counter in the content can count
  progress: c => here()[c.key] || 0,   // a number the area remembers (key), such as how many bee friends you've made
  shooed: () => here().shooed.length,   // how many birds you've shooed off (shooAway), such as from the wild melons
  wordsLearned: () => learnedCount(),
  animalsFound: c => metCount(c.chapter || 0, c.place),   // (a chapter's animals: chapter, 0 if not given; or one place's in it)
  animals: c => chapterAnimals(c.chapter || 0, c.place).length,
  animalsLeft: c => chapterAnimals(c.chapter || 0, c.place).length - metCount(c.chapter || 0, c.place),
  shells: () => S.shells,
  picked: c => (here().picked[c.request] || []).length,
  practised: () => ((AREA.lessonGap || {}).questions || 0) - practiceLeft(),   // questions you've answered since your last lesson that taught a new word (up to its lessonGap)
  since: c => Math.max(0, (S.turn || 0) - (here()[c.key] || 0)),   // questions you've answered anywhere since the countFrom step started counting them (key), such as the thirsty monkey's 8 making yoghurt
  known: c => c.words.filter(w => lvl(w) >= 1).length   // how many of these words you've caught
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
    if (k === 'canBuy') return canBuy() === v;   // there's something in the shop you could buy now, that you don't have (the 老板's ?)
    if (k === 'ready') return chapterDone() === v;
    if (k === 'place') return PLACE === v;   // the place you're in
    if (k === 'hurt') return hurt() === v;   // you've lost health in a battle
    if (k === 'practice') return trainingCalls() === v;   // some of your words need practice (the practice post's !)
    if (k === 'lesson') return !!lessonNow() === v;       // a lesson series at school has a new word ready for you
    if (k === 'lessonWaits') return (!lessonNow() && !!lessonNow(false)) === v;   // it has, but it waits till you've practised (lessonGap)
    if (k === 'near'){ const n = NPCS.find(c => c.id === v); return !!n && Math.abs(n.x - pl.x) + Math.abs(n.y - pl.y) === 1; }   // you're right beside this character
    if (k === 'at') return placeOf(v) === PLACE && pl.x === v[0] && pl.y === v[1];   // you're standing here: [x, y], or [x, y, 'place']
    if (k === 'hiding') return hiding() === v;   // a little monkey is hiding, playing hide and seek with you (js/hide.js)
    if (k === 'hidesFound') return compare(here().hide.won, v);   // how many times you've found it
    if (k === 'around'){ const d = v[3] ?? AROUND; return placeOf(v) === PLACE && Math.abs(pl.x - v[0]) <= d && Math.abs(pl.y - v[1]) <= d; }   // you're near here, as you come up to it (within so many squares: [x, y, 'place', squares])
    if (k === 'following') return Object.entries(v).every(([id, want]) => S.following.includes(id) === want);   // who's following you (the follow step), such as {cow:true}
    if (k === 'any') return v.some(matches);   // any of these, such as the way south: for the cow, or the garden's melon field
    if (AREA.counters[k]) return compare(counter(k), v);
    return compare(here()[k], v);
  });
}
const CALL_MS = 900;   // how long a character's ! shows before they talk to you, when they stop you (the stopsYou step)
const LEAP_MS = 450;   // how long a leap takes, when someone stops following you and goes to their place (the follow step)
const FLY_MS = 1500;   // how long those flying off together take, one a little after another (the fly step)
let flyers = null;     // those flying off now: {a, from: their squares, to, t0} (drawFlyers, js/draw.js)
const STEP_OPTIONS = {say:['teach','hint','showTasks','ok','by'], newWord:['note','met'], leap:['from','to'], fly:['to'], card:['note'], give:['note'], battle:['win','out','meet','boss'], bag:['note'], shells:['note'], match:['stop','notYet'], reply:['about','pic'],
  change:['at'], collect:['for','count','note','each','full'], leadTo:['you'], hold:['for'], lesson:['by'], grab:['label','missed']};   // extra settings a step can have
const COUNTING = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];   // counting aloud as you collect things (the collect step), and in number lessons
const COUNT_GAME = 3;   // counting questions in a counting game (the countGame step)
// How many things you could count with the numbers you know: never two (NOT_HOW_MANY, js/quiz.js).
const countable = () => COUNTING.map((w, i) => i + 1).filter(n => !NOT_HOW_MANY.includes(COUNTING[n - 1]) && WORDS[COUNTING[n - 1]] && lvl(COUNTING[n - 1]) >= 1);
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
function towerAt(now){
  const lens = TOWER.heights.map(h => h * TOWER.place + TOWER.wobble + TOWER.fall + TOWER.rest);
  let t = now % lens.reduce((a, b) => a + b, 0), i = 0;
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
  async shop(s, who){ await shop(speaker(who)); },
  // win: what happens if you win, such as a present; lost: if you don't; practice: a game for nothing but practice. A big
  // game, such as the queen bee's, can have more questions (questions), end at so many wrong answers (misses), have
  // sentences with a word missing among them (gaps), and say what happens if you don't win (lose: a message).
  async wordGame(s, who, last){
    const g = s.wordGame;
    if (!canEncounter()){ toast(g.notYet); return; }
    if (!(await confirmBox(speaker(who), fill(g.ask), 'Play', 'Not now'))) return;
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
  // are 两), its notYet message instead.
  async countGame(s, who, last){
    const g = AREA.countGames[s.countGame], nums = countable();
    if (nums.length < 3){ if (who) await showNarration(fill(g.notYet), last); else toast(fill(g.notYet)); return; }
    if (!await confirmBox(speaker(who), fill(g.start), 'Count', 'Not now')) return STOP;
    const asks = shuffle(nums).sort((a, c) => needsPractice(COUNTING[c - 1]) - needsPractice(COUNTING[a - 1])).slice(0, COUNT_GAME);
    let right = 0, shells = 0;
    for (const n of asks){
      const need = needsPractice(COUNTING[n - 1]);
      if (await countQ({who, thing:g.thing, n})){ right++; if (need) shells++; }
    }
    S.shells += shells; save();
    const all = right === asks.length;
    if (all){ SFX.fanfare(); if (g.win) await runSteps(g.win, who); }
    const text = `You counted ${all ? `all ${right}` : `${right} of ${asks.length}`} right.${shells ? ` +${shells} 🐚` : ''}`;
    if (who) await showNarration(text, last); else toast(text);
  },
  async hideSeek(s, who, last){ return hideSeek(who, last); },   // hide and seek with the one you're talking to (js/hide.js)
  async talkTo(s){ const n = NPCS.find(c => c.id === s.talkTo); if (n) await talk(n); },   // talking to someone, such as A at the little monkeys' tower talking to them
  // Match the words you've learned (with pictures) to their pictures, as at the practice post (title: its heading;
  // stop: the button to stop). Stopping ends the conversation there, with notYet as a message.
  async match(s){
    const words = shuffle(ORDER.filter(w => WORDS[w].pic && lvl(w) >= 1));
    const missed = await matchWords(words, s.match, s.stop || 'Not now');
    if (!missed){ if (s.notYet) toast(fill(s.notYet)); return STOP; }
    closeCard(); SFX.fanfare();   // all matched: on with the conversation
  },
  async shells(s, who, last){   // shells for you, such as a present (in a conversation, the message waits in the speech box)
    S.shells += s.shells; save(); SFX.right();
    const text = fill(s.note || `You get ${s.shells} 🐚.`);
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
  sound(s){ if (SFX[s.sound]) SFX[s.sound](); },   // a sound (one of SFX in js/sound.js), such as a wolf howling far off
  async feastList(){ await feastCard(); },   // the feast's list, such as at its big table: what the troop has, and what it still needs (js/cards.js)
  // You swing your stick at the square you're facing, like Cut and Rock Smash in Pokémon: a whack, and chips fly off it
  // (hit: what it's made of, 'wood' or 'stone').
  async hit(s){
    const [x, y] = facing();
    swing = {t0:performance.now(), x, y}; SFX.swish();
    await sleep(SWING_MS * SWING_CONTACT); SFX.thwack(); burst(x, y, s.hit); shakeT = performance.now() - 400;   // (a little shake)
    await sleep(SWING_MS * (1 - SWING_CONTACT));
  },
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
    if (lvl(item) === 0) await showNotice(item, s.note ? {note:fill(s.note)} : {});
    SFX.right();
    const counted = !!num && lvl(num) >= 1;
    if (counted) say(num);
    // full: what it says once you have them all, or a list of {if, text}, the first that matches (such as the wood: take
    // it back once you have the stones too, or else find them first, so you don't make two trips)
    const full = [].concat(s.full).find(f => typeof f === 'string' || !f.if || matches(f.if));
    toast((counted ? `${wz(num)}! ` : '') + fill(all ? full.text || full : s.each, false, true));
  },
  rest(){ S.health = maxHealth(); save(); SFX.chime(); },   // your health is full again
  // A class with the character you're talking to (the teacher at school), or with by (from the chart on the classroom
  // wall): the timetable, where you choose a lesson, new or again, or practice (js/timetable.js). If you close it without
  // doing anything, the conversation ends there.
  async lesson(s, who){ if (!await timetable(s.by || who)) return STOP; },
  // Sleep in the bed you're facing: you hop up onto it and lie down under the blanket, the cave goes dim and Zs float
  // up, then you hop down again, sparkling, with your health full (its text: the message then).
  async sleep(s){
    const [bx, by] = facing(), from = [pl.px, pl.py];
    await hop(bx * T, by * T - 3);   // up onto the bed
    sleepAt = {x:bx, y:by}; pl.py = by * T; sleepT = performance.now();
    await sleep(SLEEP_MS / 2); S.health = maxHealth(); save();
    await sleep(SLEEP_MS / 2);
    sleepAt = null; pl.py = by * T - 3; pl.dir = 'down';
    await hop(...from);   // and down again, facing the room
    S.pos.dir = 'down'; save(); wakeT = performance.now(); SFX.chime();
    if (typeof s.sleep === 'string') toast(fill(s.sleep));
  },
  // A battle with an enemy (battle: its id), and steps if you win (win). out: it jumps out at you first, as a wild one does
  // from long grass, such as the wolf at the rocks as you lead the cow home; meet: what's said as it begins, instead of
  // its own. (What happens if you lose: the area's battles' afterLoss.)
  async battle(s, who){
    const opts = {...(s.meet ? {meet:s.meet} : {}), ...(s.boss ? {boss:true} : {})};   // (boss: one you can't run from, such as the one at the pasture's rocks)
    if (await (s.out ? wildBattle(s.battle, undefined, opts) : battle(s.battle, opts)) === 'won' && s.win) await runSteps(s.win, who);
  },
  // Characters follow you (follow: their ids, in line, the first right behind you), like Pikachu in Pokémon Yellow; with
  // none, they stop, and each goes to its own place (where its moves say), with a leap if that's here, one after another.
  async follow(s){
    const was = FOLLOWERS, from = was.map(n => [n.x, n.y]);
    S.following = [...s.follow]; save();
    placeCharacters();
    trail.length = 0;   // those standing here fall in behind you as you walk; anyone elsewhere comes to you
    for (const n of FOLLOWERS) if (n.place !== PLACE) Object.assign(n, {place:PLACE, x:pl.x, y:pl.y, mv:null});
    const now = performance.now(), going = was.filter(n => !FOLLOWERS.includes(n) && n.place === PLACE);
    going.forEach((n, i) => { const [fx, fy] = from[was.indexOf(n)]; n.mv = {fx, fy, t0:now + i * 150, dur:LEAP_MS, far:true}; });
    if (going.length){ SFX.turn(); await sleep(LEAP_MS + 150 * (going.length - 1)); }
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
  // you turn to face them, and they talk to you.
  async stopsYou(s){
    const n = NPCS.find(c => c.id === s.stopsYou);
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
    missed.forEach(w => reviewed(w, false)); save();
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
      <div class="stats"><span>${wordsCaught()} of ${ORDER.length} words caught</span><span>${S.friends.length} friends</span><span>🐚 ${S.shells}</span></div>
      ${AREA.areaEnd.text.map(t => `<p>${esc(fill(t))}</p>`).join('')}`);
  },
  // The creature you're talking to scuttles off, out of reach: to somewhere else on the ground it lives on, well away from
  // you, such as a crab you've caught and let go, or one that pinched you.
  scuttle(s, who){
    const n = NPCS.find(c => c.id === who);
    if (!n) return;
    const look = tileAt(n.x, n.y).look, spots = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++)
      if (tileAt(x, y).look === look && Math.abs(x - pl.x) + Math.abs(y - pl.y) >= 5 && !npcAt(x, y) && !exitAt(x, y)) spots.push([x, y]);
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
  if (NAMES[id]) return 'the ' + NAMES[id].en.toLowerCase();
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
// Steps that show nothing you'd press A for: the story changing, a sound, things moving about on the map.
const QUIET_STEPS = ['set', 'sound', 'change', 'give', 'rumble', 'rest', 'follow', 'hit', 'markOut', 'plant', 'sleep', 'leap', 'fly'];
// Whether anything after step i in a list shows something you'd press A for. If it can't be sure, it says yes, so a line
// says Done only when it's the last (a step whose if doesn't match yet might, once a step before it changes the story).
function showsMore(steps, i){
  let changed = false;
  for (const s of steps.slice(i + 1)){
    const k = stepKind(s);
    if (QUIET_STEPS.includes(k)){ changed = changed || k !== 'sound'; continue; }
    if (s.if && !changed && !matches(s.if)) continue;
    if (k === 'newWord' && lvl(s.newWord) >= 1) continue;   // (a word you know isn't taught again)
    return true;
  }
  return false;
}
// The area's events: each happens by itself when its if matches (checked after anything you do).
async function runEvents(){ for (const e of AREA.events) if (matches(e.if)) await runSteps(e.do); placeCharacters(); refreshMap(); }
// Where each character stands: their first move whose if matches (such as gathering at the waterfall), or
// where the content first puts them. Someone following you is wherever you've been instead (FOLLOWERS, below).
const inClass = new Set();   // characters out of their places for a lesson, such as PE's (js/pe.js): left where it puts them
function placeCharacters(){
  for (const n of ALL_NPCS){
    if (S.following.includes(n.id) || inClass.has(n.id)) continue;
    if (here().shooed.includes(n.id)){ n.place = 'gone'; continue; }   // (a bird you've shooed off: shooAway)
    const m = (HIDE && n.id === HIDE.by && hiderAt()) || (n.moves || []).find(m => matches(m.if)) || n.home;   // (off hiding, or where you found it: hide and seek, js/hide.js)
    const place = placeOf(m);
    if (n.place !== place || n.move !== m || (!n.scuttles && (n.x !== m.x || n.y !== m.y))){ n.place = place; n.x = m.x; n.y = m.y; n.dir = m.facing || n.dir; n.move = m; }   // (a move to the same square can turn them, such as the thirsty monkey watching for you to bring the cow home; a crab stays wherever it has scuttled to)
  }
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
const talkPart = n => (AREA.talk[n.id] || []).find(p => !p.if || matches(p.if));
let lastTalk = null;   // {id, part}
// A character with something new for you: a ! or ? over them, and not what they've just said.
const hasNews = n => !!keptFor(n) || (!!(AREA.bubbles[n.id] || []).find(b => matches(b.if)) && !!talkPart(n) && !(lastTalk && lastTalk.id === n.id && lastTalk.part === talkPart(n)));
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
  const w = here().kept[n.id], part = w ? {do:keptSteps(n.id, w)} : talkPart(n);   // (something they kept for you comes first)
  if (!part) return;
  lastTalk = {id:n.id, part};
  const outer = caughtBefore, was = talkingTo;   // (a character can stop you during another conversation)
  caughtBefore = caughtCount(); lastLine = null; talkingTo = n.id;   // (nothing said yet to reply to)
  try { await runSteps(part.do, n.id, true); } finally { caughtBefore = outer; talkingTo = was; }
}
// A character asking you to bring something (the area's requests). A request with choices (such as the
// hungry monkey's fruit) is fussy: whichever you bring first, they want the other (remembered in wanted),
// and each choice has its own lines and sentence. (last: the request ends the conversation, so its last line says
// Done, where nothing can come after it.)
async function request(r, face, last = false){
  const p = here(), has = p.holding[r.id];
  const want = r.choices ? (p.wanted || {})[r.id] : r.wants;
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
    p[r.id] = 'done'; delete p.holding[r.id]; S.shells += r.reward; save(); SFX.fanfare();
    await showDialog(face, L[r.thanks]);
    if (r.thanksReply) await replyWith(r.thanksReply);
    toast(`+${r.reward} 🐚. Task complete!`);
    await runEvents();
  } else if (p[r.id] !== 'done'){                      // they ask (or ask again)
    const nw = [r.teach, r.verb].find(w => w && lvl(w) === 0);   // a new word to teach, if there is one: what they want, or the verb
    await showDialog(face, L[r.ask], {teach:nw, last:last && !nw});
    if (nw) await showNotice(nw, {quiet:true});
    if (p[r.id] === 'not asked'){ p[r.id] = 'asked'; save(); toast(fill(r.asked)); }
  } else await showDialog(face, L[r.thanks], {last});
}
// What the shop sells now: each thing whose if matches (such as bait, once you have a fishing rod), and something that
// comes in colours (inColours, js/data.js) in each colour you know, such as a blue headband once you know 蓝色 (and in
// its own colour, as it is, till you know that); food can be bought again and again, other things once.
const forSale = () => AREA.shop.items.filter(i => !i.if || matches(i.if)).flatMap(inColours)
  .filter(i => (i.item === i.word || lvl(i.colour) >= 1) && (i.eat || i.bag || !here().bought.includes(i.item)));
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
const COLOUR_SENTENCES = () => [...(AREA.shop ? AREA.shop.items : []), ...(AREA.wardrobe || [])].filter(i => i.colours && i.colourSentence)
  .flatMap(i => i.colours.map(c => ({zh:i.colourSentence.replace('{colour}', c), en:i.colourSentenceEn.replace(/\{colour\}/g, WORDS[c].en)})));
// Is there something in the shop you could buy now, that you don't have (not food or for your bag)? (The 老板's ?.)
const canBuy = () => !!AREA.shop && forSale().some(i => !toBag(i) && S.shells >= i.price);
async function shop(face){   // the area's shop: what it sells, and buying it by asking for it with 我要…
  const sh = AREA.shop, items = forSale();
  await showDialog(face, L[sh.ask]);
  if (!items.length){ toast(fill(sh.soldOut)); return; }
  const food = sh.items.filter(i => toBag(i) && S.bag[i.item]).map(i => `${S.bag[i.item]} ${esc(wz(i.item))}`);
  // 我不要, as a reply choice shows it: Chinese, pinyin and English (unless it's switched off). (It had no pinyin till 22
  // October 2026.)
  const no = sh.no ? `<span class="nzh">${sh.no}</span><span class="npy">${WORDS[sh.no].py}</span>${S.replyEn ? `<span class="nen">· ${esc(WORDS[sh.no].en.split(',')[0])}</span>` : ''}` : 'Not now';
  const i = await new Promise(res => {   // a card for each thing for sale: its picture, Chinese, pinyin, English and price
    openCard(`<div class="qhead">${face}<p class="prompt">You have 🐚 ${S.shells}${food.length ? ' and ' + food.join(', ') : ''}.</p></div>
      <div class="menu shopgrid">${items.map((it, n) => { const a = asSaid(it); return `<button class="shopitem${S.shells < it.price ? ' dear' : ''}" data-n="${n}" data-label="Choose">
        <span class="spic" aria-hidden="true">${picHTML(a.pic)}</span><span class="szh">${a.zh}</span><span class="spy">${a.py}</span>
        <span class="sen">${esc(a.en)}</span><span class="sprice">🐚 ${it.price}</span></button>`; }).join('')}</div>
      <div class="actions"><button class="btn" data-a="no" data-b data-label="${sh.no || 'Not now'}">${no}</button></div>`);
    const first = sheet.querySelector('.shopitem'); if (first) first.focus();
    on('[data-a=no]', () => { closeCard(); res(null); });
    sheet.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { closeCard(); res(items[+b.dataset.n]); });
  });
  if (i) await buy(i, face);
  else if (sh.no){ if (lvl(sh.no) === 0) await showNotice(sh.no, {quiet:true}); await iSay(sh.no); }   // you say 我不要
}
// Putting something on (an item of CLOTHES, js/data.js): anything else on with the same word comes off first, such as
// another headband (one at a time).
function putOn(item){
  const c = CLOTHES.find(x => x.item === item), w = S.wardrobe.wearing;
  if (c) for (const o of CLOTHES) if (o.word === c.word && o.item !== item && w.includes(o.item)) w.splice(w.indexOf(o.item), 1);
  if (!w.includes(item)) w.push(item);
}
async function buy(i, face){   // buying something from the shop by asking for it (forSale's, or the content's own). Gives true if you bought it.
  if (!i.word) i = {...i, word:i.item};
  const sh = AREA.shop, a = asSaid(i);
  if (lvl(i.word) === 0) await showNotice(i.word, {note:fill(a.note), quiet:true, ...(a.pic !== i.word ? {pic:a.pic} : {})});
  if (toBag(i) && bagFull(i.item)){ await infoBox(face, `<p>You can carry ${(FOOD[i.item] || i).carry || 3} ${esc(wz(i.item))}, and your bag is full. ${i.eat ? 'Eat one first.' : 'Use one first.'}</p>`); return false; }
  if (S.shells < i.price){ await infoBox(face, `<p>The ${esc(i.item === i.word ? wz(i.item) : `${a.zh} (${a.en})`)} costs ${i.price} 🐚, and you have ${S.shells}. ${esc(fill(sh.earnMore))}</p>`); return false; }
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
        await showDialog(face, L[sh.ask]);
      } while (!await gapQ({...q, options:reshuffled(seen.options || [a.gap], a.gap), again:true, seen}));
    } finally { if (who) delete who.puzzled; }
  }
  sentence.filter(w => lvl(w) >= 1).forEach(useWord);
  S.shells -= i.price;
  if (toBag(i)) intoBag(i.item);   // food (or bait) goes in your bag: you can buy it again and again
  else here().bought.push(i.item);
  if (i.wear && !S.wardrobe.owned.includes(i.item)){ S.wardrobe.owned.push(i.item); putOn(i.item); }   // you put it on
  save(); SFX.fanfare();
  if (i.wear) redress();   // redraw your monkey wearing it
  // it's handed to you: you say thank you, and they say you're welcome (decided 22 October 2026: they thanked you, and
  // you thanked them, which made it a puzzle why a monkey's thanks wanted 不客气)
  if (sh.reply && await replyWith(sh.reply, {about:sh.given.replace('{item}', a.given), pic:a.pic, who:sh.who}) && sh.welcome) await showDialog(face, L[sh.welcome]);
  toast(fill(a.bought));
  await runEvents();
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
  ...((AREA.birds || {}).colours || []).map(colour => ({word:AREA.birds.word, colour}))].map(t => [coloured(t).zh, coloured(t)])).values()];   // every one there is, such as 粉色的花 and 黄色的鸟 (for the voices and CHINESE.md)
const colourPic = t => PICTURES[coloured(t).zh] ? coloured(t).zh : t.word;
const stepCard = t => ({...(t.stepNote ? {note:t.stepNote} : {}), ...(t.colour ? {pic:colourPic(t)} : {})});   // (stepping on it first, such as onto a red flower)
async function gather(t, x, y){   // pick up something for a request, such as fruit or water
  const g = t.gather;
  // the request comes first: collecting water is where 水 is introduced
  if (lvl(g.item) === 0) await showNotice(g.item, {note:g.note, ...(t.colour && g.item === t.word ? {pic:colourPic(t)} : {})});
  if (g.count){   // one at each patch (or one of each kind, such as a colour), until you have enough
    const p = here().picked[g.for] = here().picked[g.for] || [];
    const key = g.kind || `${x},${y}`;
    if (p.includes(key)){ SFX.bump(); toast(fill(g.again)); return; }
    if (g.kind && WORDS[g.kind] && lvl(g.kind) === 0) await showNotice(g.kind, g.kindNote ? {note:fill(g.kindNote)} : {});   // the first of its kind teaches its word, such as 红
    p.push(key); SFX.right();
    if (p.length >= g.count) here().holding[g.for] = g.item;
    save();
    const text = fill(p.length >= g.count ? g.full : g.message);
    if (g.picked) await showPicked(g.picked, text); else toast(text);   // what you've picked, such as 红色的花 (a red flower), with the message on its card
    return;
  }
  here().holding[g.for] = g.item; save(); SFX.right(); toast(fill(g.message));
}
// A fruit tree, once the content says (the legend's pick), gives you a fruit for your bag: one each time you come to
// the place (it has no more ripe ones until then), up to as many as you can carry. So does anything else whose pick says,
// such as the bees' hive, honey (label: what A says; took: what you do; none: what it says when it has no more for now),
// one for the whole of it, however many squares it covers.
const canPick = t => !!t.pick && matches(t.pick.if || {});
const pickedHere = new Set();   // the trees you've picked from since you came into the place you're in
function pick(t, x, y){
  const w = t.pick.item, o = mapObjects().find(o => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h), key = o ? o.x + ',' + o.y : x + ',' + y;
  if (pickedHere.has(key)){ SFX.bump(); toast(fill(t.pick.none || 'No more ripe ones. Come back another time.')); return; }
  if (!intoBag(w)){ SFX.bump(); toast(`Your bag has ${FOOD[w].carry} ${wz(w)} already.`); return; }
  pickedHere.add(key); SFX.right();
  toast(`${t.pick.took ? fill(t.pick.took) : `You pick a ${wz(w)}`} for your bag (${S.bag[w]} of ${FOOD[w].carry}). ${FOOD[w].does}.`);
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
  if (n) return n.shoo ? shooAway(n) : talk(n);
  const way = exitAt(x, y);
  if (way && way.by === 'A' && isOpen(way)) return goThrough(way);
  const a = animalAt(x, y);
  if (a) return wildAppears(a, {x, y, d:pl.dir});
  const bd = birdAt(x, y);
  if (bd && BIRD_WORD){ await lookAt({word:BIRD_WORD, colour:bd.colour, note:AREA.birds.note}); shooBird(bd); return; }   // (such as 黄色的鸟, once you know its colour)
  const h = hiddenAt(x, y);
  if (h) return findHidden(h);
  const hs = hideSpotAt(x, y);
  if (hs) return lookForHider(hs);
  const spot = spotLook(x, y);
  if (spot) return runSteps(spot.do);
  const t = tileAt(x, y);
  if (t.hop){ const row = hopAhead(); return row ? hopAcross(row) : SFX.bump(); }   // stepping stones: hop onto the row in front of you
  if (t.onLook){ const p = t.onLook.find(p => !p.if || matches(p.if)); if (p) return runSteps(p.do); }   // the tile's own steps, while the story says
  if (t.gather && canGather(t.gather) && !looksFirst(t)) return gather(t, x, y);
  if (canPick(t) && !looksFirst(t)) return pick(t, x, y);
  if (t.fishing && canFish() && !looksFirst(t)) return goFishing(x, y);   // water where fish live, once you have a rod (js/fishing.js)
  if (t.action) return ACTIONS[t.action](t);
  if (t.word) return lookAt(t);
  SFX.bump();
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
  if (h.shells) S.shells += h.shells;
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
  if (id === PLACE) return;
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
  enterPlace(e.to);
  S.pos = {place:e.to, x:e.arrive[0], y:e.arrive[1], dir:e.facing || pl.dir}; placePlayer(); stepClear(); save();
  if (water) dripUntil = performance.now() + 1500;   // you come through dripping
  showPlaceName();
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
  splashes.push({x:tx * T + 8, y:ty * T + 10, t0:performance.now()}); SFX.splash(); dunkT = performance.now();   // it tips: in you go
  await sleep(DUNK_MS);
  const bank = hopBank && hopBank.place === PLACE ? hopBank : from;
  await hop(bank.x * T, bank.y * T, HOP_MS);   // and you climb out, back where you started
  pl.px = bank.x * T; pl.py = bank.y * T; pl.x = bank.x; pl.y = bank.y; S.pos = {...S.pos, x:bank.x, y:bank.y}; save();
  dripUntil = performance.now() + 1500;
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
function showPlaceName(){
  const n = PLACES[PLACE].name, el = $('#placeName');
  el.innerHTML = `<span class="pzh">${n.zh}</span> <span class="ppy">${n.py}</span><span class="pen">${esc(n.en)}</span>`;
  el.hidden = false; clearTimeout(placeNameT); placeNameT = setTimeout(() => { el.hidden = true; }, 2600);
}
// A grass animal hides in tall grass at least 3 steps from you: one that lives in one place, hides, only there; and where
// the grass says which hide in it (animals: their ids), only those, such as the bees in their valley's tall flowers. Not
// one of several of a kind whose rest are all out already, waiting for you to play again (such as a bee you didn't win
// over: no more hide till you have), nor where one is out.
const allOut = a => { const n = here()[a.counts] || 0; return !!a.stays && n < a.many && n + outOf(a).filter(o => !o[2]).length >= a.many; };
function hideAnimal(){
  const hiding = GRASS_ANIMALS.filter(a => (!a.hides || a.hides === PLACE) && !allOut(a));
  if (rustle || !canWild() || !hiding.length || stepsSince < HIDE_AFTER) return;
  const far = GRASS_TILES.filter(([x, y]) => Math.abs(x - pl.x) + Math.abs(y - pl.y) >= 3 && !animalAt(x, y));
  if (!far.length) return;
  const [x, y] = far[Math.floor(Math.random() * far.length)], only = tileAt(x, y).animals;
  const pool = Array.isArray(only) ? hiding.filter(a => only.includes(a.id)) : hiding;
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
  foe = {a, x:spot.x, y:spot.y, t0:performance.now(), state:'in', spot:!!a.at || !!was};   // (spot: one at its own spot, or out, stays there)
  alertUntil = performance.now() + 1000;
  SFX.encounter();
  await sleep(1100);
  const firstMeet = !S.met.includes(a.id);
  if (firstMeet){ S.met.push(a.id); save(); }
  const justTaught = lvl(a.hz) === 0, play = AREA.animalsPlay;
  if (justTaught) await showNotice(a.hz, {note:a.meetNote ? fill(a.meetNote) : `A wild ${a.name} jumped out of the ${wz(HIDING_WORD)}! Answer its questions to make friends.`});
  else { say(a.hz); await sleep(900); }
  // one of several of its kind to make friends with, such as the bees in their valley (many: how many; counts: what the area
  // remembers, how many so far): this one is one more, unless it's a friend already (one out, that you've won over). With
  // stays, it stays out where it is (if that never shuts a way), so you can tell it from the next: another, the hint before
  // a new one's questions, after the first; again, before playing again with one you didn't win over; lost, if you don't.
  const more = a.many && (here()[a.counts] || 0) < a.many && !(was && was.friend), another = more && S.friends.includes(a.id);
  const stay = !!a.stays && more && (!!was || keepsClear(spot.x, spot.y));
  const hint = justTaught ? '' : was && more ? a.stays.again : another && a.stays ? a.stays.another : S.friends.includes(a.id) ? play && play.friendHint : play && play.hint;
  if (play) await showDialog(speaker(a.id), L[play.say], {ok:'Play', hint:hint ? fill(hint) : ''});   // it says it wants to play, so its questions never just start
  const all = chapterAnimals(a.chapter, a.place).length;   // (counted with its chapter's animals in the same place: one on its own, such as the deer, needs no count)
  if (firstMeet && all > 1) toast(`Animals found: ${metCount(a.chapter, a.place)}/${all}`);
  const won = await encounter({id:a.id, hz:a.hz, img:portrait(a.id), wild:true, justTaught, home:a.home, another, ...(stay ? {lose:a.stays.lost} : {})});
  if (stay){ stayOut(a, spot.x, spot.y, won); foe.spot = true; }   // (drawn where it stays, from now on)
  foe.state = won ? 'happy' : 'flee'; foe.t1 = performance.now();
  await sleep(won ? 1000 : 650);
  foe = null;
  if (won && more){ const n = here()[a.counts] = (here()[a.counts] || 0) + 1; save(); await runSteps(a.counted[n - 1] || []); }   // counted aloud, one more friend
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
