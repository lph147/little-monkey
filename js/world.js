// What happens in the world: where you can walk, tasks, talking to characters, looking at things and wild animals.

/* ================= WORLD LOGIC ================= */
const EDGE = {look:'cliff'};   // what lies beyond the edge of the map
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
function refreshMap(){ if (mapStoryNow() !== mapStory){ buildMap(); findGrass(); stepClear(); } }
// If the map changes under you (such as the school's frame going up on the plot you're standing on), you step out onto
// the nearest square you can walk on.
function stepClear(){
  if (tileAt(pl.x, pl.y).walk) return;
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
const lookWord = t => (t.learnFirst && lvl(t.learnFirst) === 0 ? t.learnFirst : t.word);   // the word a tile teaches right now
const canGather = g => here()[g.for] === 'asked' && here().holding[g.for] !== g.item;   // asked for, and not already holding it
const DV = {up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]};
const OPP = {up:'down', down:'up', left:'right', right:'left'};
const dirOf = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');   // the way towards dx, dy

const learnedCount = () => ORDER.filter(w => lvl(w) >= 1).length;
// The animals in a chapter of the story (each animal's chapter, 0 if not given), and how many of them you've met: the
// prologue's animals are counted on their own, so a new chapter's animals never stand in the way of the prologue's story.
const chapterAnimals = (ch = 0) => ANIMALS.filter(a => a.chapter === ch);
const metCount = (ch = 0) => chapterAnimals(ch).filter(a => S.met.includes(a.id)).length;
// The story's chapters in this area (AREA.chapters), and the one you're in (counting from 0). Each item on the
// area's checklist belongs to a chapter (chapter, 0 if not given); the checklist shows the chapter you're in.
const chapterNow = () => here().chapter || 0;
const chapterItems = () => AREA.checklist.filter(c => (c.chapter || 0) === chapterNow());
// [text, done, is it the exit test, found yet]: an item with show is found once show matches, or it's done
const areaChecklist = () => chapterItems().map(c => { const done = matches(c.done); return [fill(c.text, false, true), done, !!c.exitTest, !c.show || done || matches(c.show)]; });
const chapterDone = () => chapterItems().filter(c => !c.exitTest).every(c => matches(c.done));       // everything in this chapter done (apart from a test)
function getTasks(){   // the tasks to show now: the area's tasks whose if matches
  return AREA.tasks.filter(t => matches(t.if)).map(t => {
    const c = typeof t.arrow === 'string' && ALL_NPCS.find(n => n.id === t.arrow);   // an arrow to a character
    const toPlace = t.arrow && t.arrow.place;   // or {place}: the way to a place, and none once you're there
    const at = c ? [c.x, c.y, c.place] : toPlace ? null : t.arrow || null, there = toPlace || (at && placeOf(at));
    const target = toPlace ? (there === PLACE ? null : wayTo(there)) : !at ? null : there === PLACE ? [at[0], at[1]] : wayTo(there);   // in another place, the arrow points the way there
    return {id:fill(t.id, true), text:fill(t.text, false, true), target, ...(c && there === PLACE ? {npc:true} : {})};
  });
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
  const t = tileAt(x, y);
  const look = t.onLook && t.onLook.find(p => !p.if || matches(p.if));
  if (look && look.label) return look.label;   // the tile's own steps say what A does, such as Sleep in a bed
  if (t.gather && canGather(t.gather)) return t.gather.label;
  if (canPick(t)) return 'Pick';
  if (t.landmark) return t.label || 'Look';
  const w = lookWord(t);
  return w && lvl(w) === 0 ? 'Look' : '';
}
const COUNTS = {   // what a counter in the content can count
  wordsLearned: () => learnedCount(),
  animalsFound: c => metCount(c.chapter || 0),   // (a chapter's animals: chapter, 0 if not given)
  animals: c => chapterAnimals(c.chapter || 0).length,
  animalsLeft: c => chapterAnimals(c.chapter || 0).length - metCount(c.chapter || 0),
  shells: () => S.shells,
  picked: c => (here().picked[c.request] || []).length,
  known: c => c.words.filter(w => lvl(w) >= 1).length   // how many of these words you've caught
};
function counter(name){ const c = AREA.counters[name], n = COUNTS[c.count](c) - (c.minus || 0); return c.max === undefined ? n : Math.min(n, c.max); }
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
    if (k === 'ready') return chapterDone() === v;
    if (k === 'place') return PLACE === v;   // the place you're in
    if (k === 'hurt') return ((S.hearts ?? HEARTS) < HEARTS) === v;   // you've lost hearts in a battle
    if (k === 'practice') return trainingCalls() === v;   // some of your words need practice (the practice post's !)
    if (k === 'lesson') return !!lessonNow() === v;       // a lesson series at school has a new word ready for you
    if (k === 'near'){ const n = NPCS.find(c => c.id === v); return !!n && Math.abs(n.x - pl.x) + Math.abs(n.y - pl.y) === 1; }   // you're right beside this character
    if (k === 'at') return placeOf(v) === PLACE && pl.x === v[0] && pl.y === v[1];   // you're standing here: [x, y], or [x, y, 'place']
    if (AREA.counters[k]) return compare(counter(k), v);
    return compare(here()[k], v);
  });
}
const CALL_MS = 900;   // how long a character's ! shows before they talk to you, when they stop you (the stopsYou step)
const LEAP_MS = 450;   // how long a leap takes, when someone stops following you and goes to their place (the follow step)
const STEP_OPTIONS = {say:['teach','hint','showTasks','ok','by'], newWord:['note'], card:['note'], give:['note'], battle:['win'], bag:['note'], match:['stop','notYet'],
  change:['at'], collect:['for','count','note','each','full']};   // extra settings a step can have
const COUNTING = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];   // counting aloud as you collect things (the collect step), and in number lessons
// The area's lesson series (AREA.lessons) teach their words one at a time, one a lesson, in order: the next once you've
// got the last one right twice (it no longer needs practice), so they don't all come at once. The series and word ready
// now, if any (of the series whose if matches); when more than one has a word ready, they take turns, so it isn't the
// same kind of lesson every time (here().lastLesson: the series of your last lesson).
function lessonNow(){
  const ready = [];
  for (const series of AREA.lessons || []){
    if (series.if && !matches(series.if)) continue;
    const i = series.words.findIndex(w => lvl(w) === 0);
    if (i >= 0 && (i === 0 || !needsPractice(series.words[i - 1]))) ready.push({series, word:series.words[i]});
  }
  return ready.find(l => l.series.id !== here().lastLesson) || ready[0] || null;
}
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
const STEPS = {   // what each step in the content's do-lists does; who is the character you're talking to
  async say(s, who){
    const hint = s.showTasks ? goalText() || fill(s.hint) : s.hint && fill(s.hint), opts = {};
    if (s.teach) opts.teach = s.teach;
    if (hint) opts.hint = hint;
    if (s.ok) opts.ok = s.ok;
    await showDialog(speaker(s.by || who), L[s.say], opts);   // by: someone else says it, during this conversation
  },
  // A sentence to finish by filling the gap, such as your answer to a question: sentence, its English (en),
  // and the missing word (word). Its words you know count as used.
  async gap(s, who){
    const t = toks(s.gap.sentence);
    await gapQ({who:speaker(who), t, en:s.gap.en, gap:s.gap.word});
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
  async newWord(s, who){ if (lvl(s.newWord) === 0) await showNotice(s.newWord, {...(s.note ? {note:fill(s.note)} : {}), quiet:!!who}); },   // quiet when a character teaches it
  async card(s, who){ await showNotice(s.card, {...(s.note ? {note:fill(s.note)} : {}), quiet:!!who}); },
  set(s){ Object.assign(here(), s.set); save(); placeCharacters(); refreshMap(); },
  async request(s, who){ await request(REQUESTS.find(r => r.id === s.request), speaker(who)); },
  async shop(s, who){ await shop(speaker(who)); },
  async wordGame(s, who){   // win: what happens if you win, such as a present
    const g = s.wordGame;
    if (!canEncounter()){ toast(g.notYet); return; }
    if (!(await confirmBox(speaker(who), fill(g.ask), 'Play', 'Not now'))) return;
    SFX.encounter();
    if (await encounter({id:who, hz:g.word, img:portrait(who), wild:false, name:NAMES[who]}) && g.win) await runSteps(g.win, who);
  },
  // Match the words you've learned (with pictures) to their pictures, as at the practice post (title: its heading;
  // stop: the button to stop). Stopping ends the conversation there, with notYet as a message.
  async match(s){
    const words = shuffle(ORDER.filter(w => WORDS[w].pic && lvl(w) >= 1));
    const missed = await matchWords(words, s.match, s.stop || 'Not now');
    if (!missed){ if (s.notYet) toast(fill(s.notYet)); return STOP; }
    closeCard(); SFX.fanfare();   // all matched: on with the conversation
  },
  async bag(s, who){   // food for your bag, if there's room (in a conversation, the message waits in the speech box)
    const text = intoBag(s.bag) ? fill(s.note || `A {${s.bag}} for your bag.`) : `Your bag is full of ${wz(s.bag)}.`;
    if (who) await showNarration(text); else toast(text);
  },
  async reply(s){ await replyWith(s.reply); },
  give(s){ if (!S.wardrobe.owned.includes(s.give)){ S.wardrobe.owned.push(s.give); save(); } if (s.note) toast(fill(s.note)); },
  rumble(){ buildMap(); SFX.rumble(); shakeT = performance.now(); },
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
  // know), with a message each time (each), or full once you have them all.
  async collect(s){
    const item = s.collect, p = here().picked[s.for] = here().picked[s.for] || [];
    if (lvl(item) === 0) await showNotice(item, s.note ? {note:fill(s.note)} : {});
    p.push(squareKey(...facing())); SFX.right();
    const n = p.length, all = n >= (s.count || 1), num = COUNTING[n - 1], counted = !!num && lvl(num) >= 1;
    if (all) here().holding[s.for] = item;
    save();
    if (counted) say(num);
    toast((counted ? `${wz(num)}! ` : '') + fill(all ? s.full : s.each));
  },
  rest(){ S.hearts = HEARTS; save(); SFX.chime(); },   // your hearts are full again
  // A lesson with the character you're talking to (the teacher at school): a new word from one of the area's lesson
  // series, if one's ready (lessonNow), or else practising your words, as at the practice post. If you stop, or don't
  // start, the conversation ends there.
  async lesson(s, who){
    const l = lessonNow();
    if (!await (l ? LESSON_KINDS[l.series.kind](l.series, l.word, who) : practise(speaker(who), PRACTICE.lesson))) return STOP;
    if (l){ here().lastLesson = l.series.id; save(); }
  },
  // Sleep in the bed you're facing: you hop up onto it and lie down under the blanket, the cave goes dim and Zs float
  // up, then you hop down again, sparkling, with all your hearts (its text: the message then).
  async sleep(s){
    const [bx, by] = facing(), from = [pl.px, pl.py];
    await hop(bx * T, by * T - 3);   // up onto the bed
    sleepAt = {x:bx, y:by}; pl.py = by * T; sleepT = performance.now();
    await sleep(SLEEP_MS / 2); S.hearts = HEARTS; save();
    await sleep(SLEEP_MS / 2);
    sleepAt = null; pl.py = by * T - 3; pl.dir = 'down';
    await hop(...from);   // and down again, facing the room
    S.pos.dir = 'down'; save(); wakeT = performance.now(); SFX.chime();
    if (typeof s.sleep === 'string') toast(fill(s.sleep));
  },
  async battle(s, who){ if (await battle(s.battle) === 'won' && s.win) await runSteps(s.win, who); },
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
  async message(s, who){ if (who) await showNarration(fill(s.message)); else toast(fill(s.message)); }   // in a conversation, it waits in the speech box
};
// You reply: choose what to say from the phrases you know, with best the one that fits (taught on its
// own card the first time). Any choice is fine: you say it, and if another fits better the game says
// so. Replying with the one that fits counts as using it. A phrase you don't know yet isn't offered.
// One new word at a time: if this conversation has already taught one, a phrase that's new too waits for another
// time (such as 要 then 不客气 at your first request), and the character's line stands on its own.
async function replyWith(best){
  if (lvl(best) === 0){
    if (caughtBefore !== null && caughtCount() > caughtBefore) return;
    await showNotice(best, {quiet:true});
  }
  const choices = shuffle([best, ...shuffle(PHRASES.filter(p => p !== best && lvl(p) >= 1)).slice(0, 2)]);
  await iSay(await chooseReply(speaker('player'), choices), best);
}
// Your monkey says a phrase. If it's the one that fits (best), it counts as using it; if not, the game says which fits.
async function iSay(said, best = said){
  const fits = said === best;
  if (fits){ const r = rec(best); r.used = 1; r.lv = 4; addToday(best); save(); }
  const en = WORDS[said].en.split(',')[0];
  await showDialog(speaker('player'), {t:[said, '！'], en:en[0].toUpperCase() + en.slice(1) + '!'}, {teach:said, ...(fits ? {} : {hint:`${wz(best)} fits best here.`})});
}
// Runs a list of steps, one after another. A step that gives STOP ends the list there (such as a word match you stop).
const STOP = 'stop';
const SLEEP_MS = 2400;   // how long you sleep in a bed (the sleep step)
async function runSteps(steps, who){ for (const s of steps) if (await STEPS[Object.keys(s).find(k => STEPS[k])](s, who) === STOP) return STOP; }
// The area's events: each happens by itself when its if matches (checked after anything you do).
async function runEvents(){ for (const e of AREA.events) if (matches(e.if)) await runSteps(e.do); placeCharacters(); refreshMap(); }
// Where each character stands: their first move whose if matches (such as gathering at the waterfall), or
// where the content first puts them. Someone following you is wherever you've been instead (FOLLOWERS, below).
function placeCharacters(){
  for (const n of ALL_NPCS){
    if (S.following.includes(n.id)) continue;
    const m = (n.moves || []).find(m => matches(m.if)) || n.home;
    const place = placeOf(m);
    if (n.place !== place || n.x !== m.x || n.y !== m.y){ n.place = place; n.x = m.x; n.y = m.y; n.dir = m.facing || n.dir; }
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
    n.mv = {fx:n.x, fy:n.y, t0:now, dur:hop ? STEP * 1.6 : STEP, far:Math.abs(dx) + Math.abs(dy) > 1};
    n.dir = dirOf(dx, dy); n.parity = (n.parity || 0) ^ 1; n.x = to[0]; n.y = to[1];
  });
}
// How many words you'd caught when the conversation you're in began (null outside one), so a reply can tell if it
// has already taught a new word (replyWith).
let caughtBefore = null;
const caughtCount = () => Object.keys(WORDS).filter(w => lvl(w) >= 1).length;
async function talk(n){
  n.dir = OPP[pl.dir];
  const part = (AREA.talk[n.id] || []).find(p => !p.if || matches(p.if));
  if (!part) return;
  const outer = caughtBefore;   // (a character can stop you during another conversation)
  caughtBefore = caughtCount();
  try { await runSteps(part.do, n.id); } finally { caughtBefore = outer; }
}
// A character asking you to bring something (the area's requests). A request with choices (such as the
// hungry monkey's fruit) is fussy: whichever you bring first, they want the other (remembered in wanted),
// and each choice has its own lines and sentence.
async function request(r, face){
  const p = here(), has = p.holding[r.id];
  const want = r.choices ? (p.wanted || {})[r.id] : r.wants;
  const c = has && r.choices ? r.choices[has] : r;   // the lines and sentence for what you've brought
  if (p[r.id] === 'asked' && has && has !== want){   // you brought the wrong thing
    if (r.choices && !want){ p.wanted = {...p.wanted, [r.id]: Object.keys(r.choices).find(x => x !== has)}; save(); }
    await showDialog(face, L[c.wrong]);
    if (r.wrongReply) await replyWith(r.wrongReply);
    if (r.wrongAnswer) await showDialog(face, L[r.wrongAnswer]);
    delete p.holding[r.id]; save(); toast(fill(r.wrongMessage));
    return;
  }
  if (p[r.id] === 'asked' && has && has === want){   // you brought what they wanted (not just nothing, before a fussy one has said which)
    await showDialog(face, L[c.offer], {ok:'Give it'});
    const nw = (r.firstTeach || []).find(f => lvl(f.word) === 0);
    if (nw) await showNotice(nw.word, {note:nw.note, quiet:true});
    const sentence = toks(c.sentence);
    await gapQ({who:face, t:sentence, en:c.sentenceEn, gap:c.gap || has});
    sentence.filter(x => lvl(x) >= 1).forEach(useWord);
    p[r.id] = 'done'; delete p.holding[r.id]; S.shells += r.reward; save(); SFX.fanfare();
    await showDialog(face, L[r.thanks]);
    if (r.thanksReply) await replyWith(r.thanksReply);
    toast(`+${r.reward} 🐚. Task complete!`);
    await runEvents();
  } else if (p[r.id] !== 'done'){                      // they ask (or ask again)
    const verb = r.verb && lvl(r.verb) === 0 ? r.verb : null;   // a new word to teach, if there is one
    await showDialog(face, L[r.ask], {teach:verb});
    if (verb) await showNotice(verb, {quiet:true});
    if (p[r.id] === 'not asked'){ p[r.id] = 'asked'; save(); toast(fill(r.asked)); }
  } else await showDialog(face, L[r.thanks]);
}
const forSale = () => AREA.shop.items.filter(i => i.eat || !here().bought.includes(i.item));   // food can be bought again; other things once
async function shop(face){   // the area's shop: what it sells, and buying it by asking for it with 我要…
  const sh = AREA.shop, items = forSale();
  await showDialog(face, L[sh.ask]);
  if (!items.length){ toast(fill(sh.soldOut)); return; }
  const food = sh.items.filter(i => i.eat && S.bag[i.item]).map(i => `${S.bag[i.item]} ${esc(wz(i.item))}`);
  const i = await new Promise(res => {   // a card for each thing for sale: its picture, Chinese, pinyin, English and price
    openCard(`<div class="qhead">${face}<p class="prompt">You have 🐚 ${S.shells}${food.length ? ' and ' + food.join(', ') : ''}.</p></div>
      <div class="menu shopgrid">${items.map((it, n) => `<button class="shopitem${S.shells < it.price ? ' dear' : ''}" data-n="${n}" data-label="Choose">
        <span class="spic" aria-hidden="true">${picHTML(it.item)}</span><span class="szh">${it.item}</span><span class="spy">${WORDS[it.item].py}</span>
        <span class="sen">${esc(WORDS[it.item].en)}</span><span class="sprice">🐚 ${it.price}</span></button>`).join('')}</div>
      <div class="actions"><button class="btn" data-a="no" data-b data-label="${sh.no || 'Not now'}">${sh.no ? sh.no + (S.replyEn ? ' · ' + esc(WORDS[sh.no].en.split(',')[0]) : '') : 'Not now'}</button></div>`);
    const first = sheet.querySelector('.shopitem'); if (first) first.focus();
    on('[data-a=no]', () => { closeCard(); res(null); });
    sheet.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { closeCard(); res(items[+b.dataset.n]); });
  });
  if (i) await buy(i, face);
  else if (sh.no){ if (lvl(sh.no) === 0) await showNotice(sh.no, {quiet:true}); await iSay(sh.no); }   // you say 我不要
}
async function buy(i, face){   // buying something from the shop by asking for it. Gives true if you bought it.
  const sh = AREA.shop;
  if (lvl(i.item) === 0) await showNotice(i.item, {note:fill(i.note), quiet:true});
  if (i.eat && bagFull(i.item)){ await infoBox(face, `<p>You can carry ${FOOD[i.item].carry} ${esc(wz(i.item))}, and your bag is full. Eat one first.</p>`); return false; }
  if (S.shells < i.price){ await infoBox(face, `<p>The ${esc(wz(i.item))} costs ${i.price} 🐚, and you have ${S.shells}. ${esc(fill(sh.earnMore))}</p>`); return false; }
  const sentence = toks(i.sentence);
  await gapQ({who:face, t:sentence, en:i.sentenceEn, gap:i.gap || i.item});
  sentence.filter(w => lvl(w) >= 1).forEach(useWord);
  S.shells -= i.price;
  if (i.eat) intoBag(i.item);   // food goes in your bag: you can buy it again and again
  else here().bought.push(i.item);
  if (i.wear && !S.wardrobe.owned.includes(i.item)){ S.wardrobe.owned.push(i.item); S.wardrobe.wearing.push(i.item); }   // you put it on
  save(); SFX.fanfare();
  if (i.wear) redress();   // redraw your monkey wearing it
  await showDialog(face, L[sh.thanks]);
  if (sh.thanksReply) await replyWith(sh.thanksReply);
  toast(fill(i.bought));
  await runEvents();
  return true;
}
async function lookAt(t){   // the card for the word you learn by looking at a tile
  const w = lookWord(t);
  const note = w === t.word ? t.note || (lvl(w) === 0 ? t.newNote : '') : '';
  await showNotice(w, note ? {note} : {});
  if (t.message) toast(t.message);
}
async function gather(t, x, y){   // pick up something for a request, such as fruit or water
  const g = t.gather;
  // the request comes first: collecting water is where 水 is introduced
  if (lvl(g.item) === 0) await showNotice(g.item, {note:g.note});
  if (g.count){   // one at each patch (or one of each kind, such as a colour), until you have enough
    const p = here().picked[g.for] = here().picked[g.for] || [];
    const key = g.kind || `${x},${y}`;
    if (p.includes(key)){ SFX.bump(); toast(fill(g.again)); return; }
    if (g.kind && WORDS[g.kind] && lvl(g.kind) === 0) await showNotice(g.kind, g.kindNote ? {note:fill(g.kindNote)} : {});   // the first of its kind teaches its word, such as 红
    p.push(key); SFX.right();
    if (p.length >= g.count) here().holding[g.for] = g.item;
    save(); toast(fill(p.length >= g.count ? g.full : g.message));
    return;
  }
  here().holding[g.for] = g.item; save(); SFX.right(); toast(fill(g.message));
}
// A fruit tree, once the content says (the legend's pick), gives you a fruit for your bag: one each time you come to
// the place (it has no more ripe ones until then), up to as many as you can carry.
const canPick = t => !!t.pick && matches(t.pick.if || {});
const pickedHere = new Set();   // the trees you've picked from since you came into the place you're in
function pick(t, x, y){
  const w = t.pick.item;
  if (pickedHere.has(x + ',' + y)){ SFX.bump(); toast('No more ripe ones. Come back another time.'); return; }
  if (!intoBag(w)){ SFX.bump(); toast(`Your bag has ${FOOD[w].carry} ${wz(w)} already.`); return; }
  pickedHere.add(x + ',' + y); SFX.right();
  toast(`You pick a ${wz(w)} for your bag (${S.bag[w]} of ${FOOD[w].carry}). ${FOOD[w].does}.`);
}
const ACTIONS = {   // special things that happen when you press A at some tiles (the legend's action)
  async story(t){ await lookAt(t); await storyScroll(); },
  training(){ return trainingGround(); },
  async sign(t){   // the area's sign, or a tile's own (sign: its name, what it says and a hint)
    SFX.blip();
    const sg = t.sign || AREA.sign, face = t.sign ? `<div class="speaker"><div class="spk"><div class="spk-zh">${sg.name.zh} <span class="spk-py">${sg.name.py}</span></div><div class="spk-en">${esc(sg.name.en)}</div></div></div>` : speaker('sign');
    await showDialog(face, {t:toks(sg.says.zh), en:sg.says.en}, sg.hint ? {hint:sg.hint} : {});
  }
};
async function interact(x, y){
  const n = npcAt(x, y) || followerAt(x, y);
  if (n) return talk(n);
  const way = exitAt(x, y);
  if (way && way.by === 'A' && isOpen(way)) return goThrough(way);
  const a = animalAt(x, y);
  if (a) return wildAppears(a, {x, y, d:pl.dir});
  const bd = birdAt(x, y);
  if (bd && BIRD_WORD){ await showNotice(BIRD_WORD, AREA.birds.note ? {note:fill(AREA.birds.note)} : {}); shooBird(bd); return; }
  const t = tileAt(x, y);
  if (t.onLook){ const p = t.onLook.find(p => !p.if || matches(p.if)); if (p) return runSteps(p.do); }   // the tile's own steps, while the story says
  if (t.gather && canGather(t.gather)) return gather(t, x, y);
  if (canPick(t)) return pick(t, x, y);
  if (t.action) return ACTIONS[t.action](t);
  if (t.word) return lookAt(t);
  SFX.bump();
}
// An animal hiding in the tall grass, which rustles there: step in to meet it. After you meet one,
// another hides a few steps later.
const HIDE_AFTER = 4;   // steps before another animal hides
let rustle = null, stepsSince = HIDE_AFTER;
const GRASS_TILES = [];   // where animals can hide, in the place you're in
function findGrass(){ GRASS_TILES.length = 0; for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (tileAt(x, y).animals) GRASS_TILES.push([x, y]); }
findGrass();
// Going into another place: its map is drawn, and whatever was happening in the last one (an animal
// hiding, birds, a meeting) is left behind.
function enterPlace(id){
  if (id === PLACE) return;
  setPlace(id); placeCharacters(); findGrass(); rustle = null; stepsSince = HIDE_AFTER; foe = null; birds.length = 0; pickedHere.clear(); buildMap();
  playSong(placeSong());   // its own music, if it has some
}
// Through a way to another place: a quick fade, and you're there, with its name at the top of the screen.
async function goThrough(e){
  held = null; queued = null;
  const water = e.how === 'water' || e.how === 'jump';
  if (e.how === 'jump') await leap(e.at);   // a jump into the waterfall, with a splash
  if (water){ waterT = performance.now(); SFX.splash(); } else { fadeT = performance.now(); SFX.blip(); }
  await sleep(water ? 600 : 350);           // (a rush of water covers the screen, or it fades to black)
  enterPlace(e.to);
  S.pos = {place:e.to, x:e.arrive[0], y:e.arrive[1], dir:e.facing || pl.dir}; placePlayer(); save();
  if (water) dripUntil = performance.now() + 1500;   // you come through dripping
  showPlaceName();
  const t = tileAt(e.arrive[0], e.arrive[1]);   // arriving on something you learn by stepping on it, such as the mountain path, counts
  if (t.learnOnStep && lvl(t.word) === 0) await showNotice(t.word, t.stepNote ? {note:t.stepNote} : {});
}
// A little hop, in an arc, to (tx, ty) in the map (pixels), such as onto a bed and off it again.
async function hop(tx, ty, ms = 300){
  const fx = pl.px, fy = pl.py, n = Math.max(1, Math.round(ms / 17));
  for (let i = 1; i <= n; i++){ const p = i / n; pl.px = fx + (tx - fx) * p; pl.py = fy + (ty - fy) * p - Math.sin(p * Math.PI) * 6; await sleep(17); }
  SFX.turn();
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
let placeNameT;
function showPlaceName(){
  const n = PLACES[PLACE].name, el = $('#placeName');
  el.innerHTML = `<span class="pzh">${n.zh}</span> <span class="ppy">${n.py}</span><span class="pen">${esc(n.en)}</span>`;
  el.hidden = false; clearTimeout(placeNameT); placeNameT = setTimeout(() => { el.hidden = true; }, 2600);
}
function hideAnimal(){   // a grass animal hides in tall grass at least 3 steps from you
  if (rustle || !canWild() || !GRASS_ANIMALS.length || stepsSince < HIDE_AFTER) return;
  const far = GRASS_TILES.filter(([x, y]) => Math.abs(x - pl.x) + Math.abs(y - pl.y) >= 3);
  if (!far.length) return;
  const [x, y] = far[Math.floor(Math.random() * far.length)];
  rustle = {x, y, a:pickAnimal(GRASS_ANIMALS)};
}
async function arrive(x, y){
  S.pos = {place:PLACE, x, y, dir:pl.dir}; save();
  const way = exitAt(x, y);
  if (way && !way.by && isOpen(way)) return goThrough(way);   // a way you go through by stepping onto it
  const t = tileAt(x, y);
  stepsSince++;
  if (t.learnOnStep && lvl(t.word) === 0) return showNotice(t.word, t.stepNote ? {note:t.stepNote} : {});
  if (t.wild && await wildStep(t)) return;   // a wild creature jumps out of the long grass
  if (rustle && rustle.x === x && rustle.y === y && canWild()){ const a = rustle.a; rustle = null; stepsSince = 0; held = null; queued = null; return wildAppears(a); }
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
// Meeting an animal: it jumps out next to you (from the grass), or at its own spot (spot).
async function wildAppears(a, spot = findSpot()){
  pl.dir = spot.d;
  foe = {a, x:spot.x, y:spot.y, t0:performance.now(), state:'in'};
  alertUntil = performance.now() + 1000;
  SFX.encounter();
  await sleep(1100);
  const firstMeet = !S.met.includes(a.id);
  if (firstMeet){ S.met.push(a.id); save(); }
  const justTaught = lvl(a.hz) === 0;
  if (justTaught) await showNotice(a.hz, {note:a.meetNote ? fill(a.meetNote) : `A wild ${a.name} jumped out of the ${wz(HIDING_WORD)}! Answer its questions to make friends.`});
  else { say(a.hz); await sleep(900); }
  const all = chapterAnimals(a.chapter).length;
  if (firstMeet && all > 1) toast(`Animals found: ${metCount(a.chapter)}/${all}`);   // (a chapter with one animal, such as the deer, needs no count)
  const won = await encounter({id:a.id, hz:a.hz, img:portrait(a.id), wild:true, justTaught, home:a.home});
  foe.state = won ? 'happy' : 'flee'; foe.t1 = performance.now();
  await sleep(won ? 1000 : 650);
  foe = null;
}
