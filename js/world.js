// What happens in the world: where you can walk, tasks, talking to characters, looking at things and wild animals.

/* ================= WORLD LOGIC ================= */
const EDGE = {look:'cliff'};   // what lies beyond the edge of the map
const BIRD_WORD = (AREA.birds || {}).word;   // the word for the birds that land near you
function tileAt(x, y){         // the legend entry for the map letter at x, y
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return EDGE;
  const t = LEGEND[MAP[y][x]];
  return here().gate && t.whenGateOpens ? LEGEND[t.whenGateOpens] : t;
}
const npcAt = (x, y) => NPCS.find(n => n.x === x && n.y === y);
const exitAt = (x, y) => (PLACES[PLACE].exits || []).find(e => e.at[0] === x && e.at[1] === y);   // a way to another place
const isOpen = e => !e.if || matches(e.if);
const walkable = (x, y) => !!tileAt(x, y).walk && !npcAt(x, y);
const lookWord = t => (t.learnFirst && lvl(t.learnFirst) === 0 ? t.learnFirst : t.word);   // the word a tile teaches right now
const canGather = g => here()[g.for] === 'asked' && here().holding[g.for] !== g.item;   // asked for, and not already holding it
const DV = {up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]};
const OPP = {up:'down', down:'up', left:'right', right:'left'};

const learnedCount = () => ORDER.filter(w => lvl(w) >= 1).length;
const metCount = () => Math.min(S.met.length, ANIMALS.length);
// The story's chapters in this area (AREA.chapters), and the one you're in (counting from 0). Each item on the
// area's checklist belongs to a chapter (chapter, 0 if not given); the checklist shows the chapter you're in.
const chapterNow = () => here().chapter || 0;
const chapterItems = () => AREA.checklist.filter(c => (c.chapter || 0) === chapterNow());
// [text, done, is it the exit test, found yet]: an item with show is found once show matches, or it's done
const areaChecklist = () => chapterItems().map(c => { const done = matches(c.done); return [fill(c.text), done, !!c.exitTest, !c.show || done || matches(c.show)]; });
const chapterDone = () => chapterItems().filter(c => !c.exitTest).every(c => matches(c.done));       // everything in this chapter done (apart from a test)
function getTasks(){   // the tasks to show now: the area's tasks whose if matches
  return AREA.tasks.filter(t => matches(t.if)).map(t => {
    const c = typeof t.arrow === 'string' && ALL_NPCS.find(n => n.id === t.arrow);   // an arrow to a character
    const at = c ? [c.x, c.y, c.place] : t.arrow || null, there = at && placeOf(at);
    const target = !at ? null : there === PLACE ? [at[0], at[1]] : wayTo(there);   // in another place, the arrow points the way there
    return {id:fill(t.id, true), text:fill(t.text), target, ...(c && there === PLACE ? {npc:true} : {})};
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
function tasksHint(){ const h = AREA.hints.find(h => matches(h.if)); return h ? fill(h.text) : ''; }
function goalText(){ const t = getTasks(); return t.length ? t.map(x => x.text).join('. ') + '.' : tasksHint(); }
function facing(){ const [dx,dy] = DV[pl.dir]; return [pl.x + dx, pl.y + dy]; }
function promptFor(x, y){
  const n = npcAt(x, y);
  if (n) return n.label || 'Talk';
  if (animalAt(x, y)) return 'Meet';
  if (BIRD_WORD && birdAt(x, y)) return 'Look';
  const way = exitAt(x, y);
  if (way && way.by === 'A' && isOpen(way)) return way.label || 'Go';   // a way you go through by pressing A, such as jumping through the waterfall
  const t = tileAt(x, y);
  if (t.gather && canGather(t.gather)) return t.gather.label;
  if (t.landmark) return t.label || 'Look';
  const w = lookWord(t);
  return w && lvl(w) === 0 ? 'Look' : '';
}
const COUNTS = {   // what a counter in the content can count
  wordsLearned: () => learnedCount(),
  animalsFound: () => metCount(),
  animals: () => ANIMALS.length,
  animalsLeft: () => ANIMALS.length - metCount(),
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
    if (AREA.counters[k]) return compare(counter(k), v);
    return compare(here()[k], v);
  });
}
const STEP_OPTIONS = {say:['teach','hint','showTasks','ok','by'], newWord:['note'], card:['note'], give:['note']};   // extra settings a step can have
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
  set(s){ Object.assign(here(), s.set); save(); placeCharacters(); },
  async request(s, who){ await request(REQUESTS.find(r => r.id === s.request), speaker(who)); },
  async shop(s, who){ await shop(speaker(who)); },
  async wordGame(s, who){
    const g = s.wordGame;
    if (!canEncounter()){ toast(g.notYet); return; }
    if (await confirmBox(speaker(who), g.ask, 'Play', 'Not now')){ SFX.encounter(); await encounter({id:who, hz:g.word, img:portrait(who), wild:false, name:NAMES[who]}); }
  },
  async reply(s){ await replyWith(s.reply); },
  give(s){ if (!S.wardrobe.owned.includes(s.give)){ S.wardrobe.owned.push(s.give); save(); } if (s.note) toast(fill(s.note)); },
  rumble(){ buildMap(); SFX.rumble(); shakeT = performance.now(); },
  async message(s, who){ if (who) await showNarration(fill(s.message)); else toast(fill(s.message)); }   // in a conversation, it waits in the speech box
};
// You reply: choose what to say from the phrases you know, with best the one that fits (taught on its
// own card the first time). Any choice is fine: you say it, and if another fits better the game says
// so. Replying with the one that fits counts as using it. A phrase you don't know yet isn't offered.
async function replyWith(best){
  if (lvl(best) === 0) await showNotice(best, {quiet:true});
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
async function runSteps(steps, who){ for (const s of steps) await STEPS[Object.keys(s).find(k => STEPS[k])](s, who); }
// The area's events: each happens by itself when its if matches (checked after anything you do).
async function runEvents(){ for (const e of AREA.events) if (matches(e.if)) await runSteps(e.do); placeCharacters(); }
// Where each character stands: their first move whose if matches (such as gathering at the waterfall), or
// where the content first puts them.
function placeCharacters(){
  for (const n of ALL_NPCS){
    const m = (n.moves || []).find(m => matches(m.if)) || n.home;
    const place = placeOf(m);
    if (n.place !== place || n.x !== m.x || n.y !== m.y){ n.place = place; n.x = m.x; n.y = m.y; n.dir = m.facing || n.dir; }
  }
  NPCS = ALL_NPCS.filter(n => n.place === PLACE);
}
async function talk(n){
  n.dir = OPP[pl.dir];
  const part = (AREA.talk[n.id] || []).find(p => !p.if || matches(p.if));
  if (part) await runSteps(part.do, n.id);
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
  if (p[r.id] === 'asked' && has === want){          // you brought what they wanted
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
  if (i.eat && (S.bag[i.item] || 0) >= i.carry){ await infoBox(face, `<p>You can carry ${i.carry} ${esc(wz(i.item))}, and your bag is full. Eat one in an animal encounter first.</p>`); return false; }
  if (S.shells < i.price){ await infoBox(face, `<p>The ${esc(wz(i.item))} costs ${i.price} 🐚, and you have ${S.shells}. ${esc(fill(sh.earnMore))}</p>`); return false; }
  const sentence = toks(i.sentence);
  await gapQ({who:face, t:sentence, en:i.sentenceEn, gap:i.gap || i.item});
  sentence.filter(w => lvl(w) >= 1).forEach(useWord);
  S.shells -= i.price;
  if (i.eat) S.bag[i.item] = (S.bag[i.item] || 0) + 1;   // food goes in your bag: you can buy it again and again
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
  const n = npcAt(x, y);
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
  setPlace(id); placeCharacters(); findGrass(); rustle = null; stepsSince = HIDE_AFTER; foe = null; birds.length = 0; buildMap();
}
// Through a way to another place: a quick fade, and you're there, with its name at the top of the screen.
async function goThrough(e){
  held = null; queued = null; fadeT = performance.now(); SFX.blip();
  await sleep(350);
  enterPlace(e.to);
  S.pos = {place:e.to, x:e.arrive[0], y:e.arrive[1], dir:e.facing || pl.dir}; placePlayer(); save();
  showPlaceName();
  const t = tileAt(e.arrive[0], e.arrive[1]);   // arriving on something you learn by stepping on it, such as the mountain path, counts
  if (t.learnOnStep && lvl(t.word) === 0) await showNotice(t.word, t.stepNote ? {note:t.stepNote} : {});
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
  if (rustle && rustle.x === x && rustle.y === y && canWild()){ const a = rustle.a; rustle = null; stepsSince = 0; held = null; queued = null; return wildAppears(a); }
  hideAnimal();
}

let foe = null, alertUntil = 0;
function findSpot(){
  const order = [pl.dir].concat(['down','left','right','up'].filter(d => d !== pl.dir));
  for (const d of order){ const [dx,dy] = DV[d], x = pl.x + dx, y = pl.y + dy, t = tileAt(x,y); if (t.walk && t.look !== 'bridge' && !npcAt(x,y)) return {x, y, d}; }
  const [dx,dy] = DV[pl.dir]; return {x:pl.x + dx, y:pl.y + dy, d:pl.dir};
}
// Which animal hides: usually one you haven't met yet; otherwise usually one whose name is due for review.
function pickAnimal(animals = ANIMALS){
  const unmet = animals.filter(x => !S.met.includes(x.id));
  const due = animals.filter(x => S.met.includes(x.id) && rec(x.hz).due <= Date.now());
  const pool = unmet.length && Math.random() < .75 ? unmet : due.length && Math.random() < .75 ? due : animals;
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
  if (firstMeet) toast(`Animals found: ${metCount()}/${ANIMALS.length}`);
  const won = await encounter({id:a.id, hz:a.hz, img:portrait(a.id), wild:true, justTaught, home:a.home});
  foe.state = won ? 'happy' : 'flee'; foe.t1 = performance.now();
  await sleep(won ? 1000 : 650);
  foe = null;
}
