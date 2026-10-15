// What happens in the world: where you can walk, tasks, talking to characters, looking at things and wild animals.

/* ================= WORLD LOGIC ================= */
const EDGE = {look:'cliff'};   // what lies beyond the edge of the map
function tileAt(x, y){         // the legend entry for the map letter at x, y
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return EDGE;
  const t = LEGEND[MAP[y][x]];
  return here().gate && t.whenGateOpens ? LEGEND[t.whenGateOpens] : t;
}
const npcAt = (x, y) => NPCS.find(n => n.x === x && n.y === y);
const walkable = (x, y) => !!tileAt(x, y).walk && !npcAt(x, y);
const lookWord = t => (t.learnFirst && lvl(t.learnFirst) === 0 ? t.learnFirst : t.word);   // the word a tile teaches right now
const canGather = g => here()[g.for] === 'asked' && here().holding[g.for] !== g.item;   // asked for, and not already holding it
const DV = {up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]};
const OPP = {up:'down', down:'up', left:'right', right:'left'};

const learnedCount = () => ORDER.filter(w => lvl(w) >= 1).length;
const metCount = () => Math.min(S.met.length, ANIMALS.length);
const areaChecklist = () => AREA.checklist.map(c => [fill(c.text), matches(c.done), !!c.exitTest]);   // [text, done, is it the exit test]
const areaDone = () => AREA.checklist.filter(c => !c.exitTest).every(c => matches(c.done));       // ready for the exit test
function getTasks(){   // the tasks to show now: the area's tasks whose if matches
  return AREA.tasks.filter(t => matches(t.if)).map(t => {
    const c = typeof t.arrow === 'string' && NPCS.find(n => n.id === t.arrow);   // an arrow to a character
    return {id:fill(t.id, true), text:fill(t.text), target:c ? [c.x, c.y] : t.arrow || null, ...(c ? {npc:true} : {})};
  });
}
function tasksHint(){ const h = AREA.hints.find(h => matches(h.if)); return h ? fill(h.text) : ''; }
function goalText(){ const t = getTasks(); return t.length ? t.map(x => x.text).join('. ') + '.' : tasksHint(); }
const newTaskUntil = {};
function facing(){ const [dx,dy] = DV[pl.dir]; return [pl.x + dx, pl.y + dy]; }
function promptFor(x, y){
  const n = npcAt(x, y);
  if (n) return n.label || 'Talk';
  const t = tileAt(x, y);
  if (t.gather && canGather(t.gather)) return t.gather.label;
  if (t.landmark) return 'Look';
  const w = lookWord(t);
  return w && lvl(w) === 0 ? 'Look' : '';
}
const COUNTS = {   // what a counter in the content can count
  wordsLearned: () => learnedCount(),
  animalsFound: () => metCount(),
  animals: () => ANIMALS.length,
  animalsLeft: () => ANIMALS.length - metCount()
};
function counter(name){ const c = AREA.counters[name], n = COUNTS[c.count]() - (c.minus || 0); return c.max === undefined ? n : Math.min(n, c.max); }
const compare = (have, want) => (want !== null && typeof want === 'object'
  ? (want.atLeast === undefined || have >= want.atLeast) && (want.below === undefined || have < want.below)
  : have === want);
function matches(cond){   // does the game match everything in an if?
  return Object.entries(cond).every(([k, v]) => {
    if (k === 'new') return lvl(v) === 0;
    if (k === 'knows') return lvl(v) >= 1;
    if (k === 'holding') return Object.entries(v).every(([id, want]) => { const h = here().holding[id]; return want === true ? !!h : want === false ? !h : h === want; });
    if (k === 'ready') return areaDone() === v;
    if (AREA.counters[k]) return compare(counter(k), v);
    return compare(here()[k], v);
  });
}
const STEP_OPTIONS = {say:['teach','hint','showTasks','ok'], newWord:['note'], card:['note']};   // extra settings a step can have
const STEPS = {   // what each step in the content's do-lists does; who is the character you're talking to
  async say(s, who){
    const hint = s.showTasks ? goalText() || fill(s.hint) : s.hint && fill(s.hint), opts = {};
    if (s.teach) opts.teach = s.teach;
    if (hint) opts.hint = hint;
    if (s.ok) opts.ok = s.ok;
    await showDialog(speaker(who), L[s.say], opts);
  },
  async newWord(s){ if (lvl(s.newWord) === 0) await showNotice(s.newWord, s.note ? {note:fill(s.note)} : {}); },
  async card(s){ await showNotice(s.card, s.note ? {note:fill(s.note)} : {}); },
  set(s){ Object.assign(here(), s.set); save(); },
  async request(s, who){ await request(REQUESTS.find(r => r.id === s.request), speaker(who)); },
  async wordGame(s, who){
    const g = s.wordGame;
    if (!canEncounter()){ toast(g.notYet); return; }
    if (await confirmBox(speaker(who), g.ask, 'Play', 'Not now')){ SFX.encounter(); await encounter({id:who, hz:g.word, img:portrait(who), wild:false, name:NAMES[who]}); }
  },
  rumble(){ buildMap(); SFX.rumble(); shakeT = performance.now(); },
  message(s){ toast(fill(s.message)); }
};
async function runSteps(steps, who){ for (const s of steps) await STEPS[Object.keys(s).find(k => STEPS[k])](s, who); }
async function runEvents(){ for (const e of AREA.events) if (matches(e.if)) await runSteps(e.do); }
async function talk(n){
  n.dir = OPP[pl.dir];
  const part = (AREA.talk[n.id] || []).find(p => !p.if || matches(p.if));
  if (part) await runSteps(part.do, n.id);
}
async function request(r, face){   // a character asking you to bring something (the area's requests)
  const p = here(), has = p.holding[r.id];
  if (p[r.id] === 'asked' && has && has !== r.wants){   // you brought the wrong thing
    await showDialog(face, L[r.wrong]);
    delete p.holding[r.id]; save(); toast(r.wrongMessage);
    return;
  }
  if (p[r.id] === 'asked' && has === r.wants){          // you brought what they asked for
    await showDialog(face, L[r.offer], {ok:'Give it'});
    const nw = r.firstTeach.find(f => lvl(f.word) === 0);
    if (nw) await showNotice(nw.word, {note:nw.note});
    const build = toks(r.build);
    await tiles(face, build, [r.extraTile], r.buildPrompt);
    build.filter(w => lvl(w) >= 1).forEach(w => setLevel(w, 4));
    p[r.id] = 'done'; delete p.holding[r.id]; S.peaches += r.reward; save(); SFX.fanfare();
    await showDialog(face, L[r.thanks]);
    toast(`+${r.reward} 🍑. Task complete!`);
    await runEvents();
  } else if (p[r.id] !== 'done'){                      // they ask (or ask again)
    await showDialog(face, L[r.ask], {teach: lvl(r.verb) === 0 ? r.verb : null});
    if (lvl(r.verb) === 0) await showNotice(r.verb);
    if (p[r.id] === 'not asked'){ p[r.id] = 'asked'; save(); toast(r.asked); }
  } else await showDialog(face, L[r.thanks]);
}
async function lookAt(t){   // the card for the word you learn by looking at a tile
  const w = lookWord(t);
  const note = w === t.word ? t.note || (lvl(w) === 0 ? t.newNote : '') : '';
  await showNotice(w, note ? {note} : {});
  if (t.message) toast(t.message);
}
async function gather(t){   // pick up something for a request, such as fruit or water
  const g = t.gather;
  // the request comes first: collecting water is where 水 is introduced
  if (lvl(g.item) === 0) await showNotice(g.item, {note:g.note});
  here().holding[g.for] = g.item; save(); SFX.right(); toast(fill(g.message));
}
const ACTIONS = {   // special things that happen when you press A at some tiles (the legend's action)
  async caveDoor(t){
    if (lvl(t.word) === 0) await showNotice(t.word, {note:t.note});
    if (!areaDone()) await infoBox('🚪', '<p>The door won’t move. Finish everything on Flower Fruit Mountain first:</p>' + checklistHTML(true));
    else if (await confirmBox('🚪', `The door has rolled open. To go through, pass a short word test: match each word you learned here to its picture. You need ${Math.round(PASS*100)}% right first time.`, 'Start the test', 'Not yet')){ if (await wordTest()) await nextArea(); }
  },
  async story(t){ await lookAt(t); await storyScroll(); },
  async sign(){
    SFX.blip();
    await showDialog(speaker('sign'), {t:toks(AREA.sign.says.zh), en:AREA.sign.says.en}, {hint:AREA.sign.hint});
  }
};
async function interact(x, y){
  const n = npcAt(x, y);
  if (n) return talk(n);
  const t = tileAt(x, y);
  if (t.gather && canGather(t.gather)) return gather(t);
  if (t.action) return ACTIONS[t.action](t);
  if (t.word) return lookAt(t);
  SFX.bump();
}
let stepsSince = 0;
async function arrive(x, y){
  S.pos = {x, y, dir:pl.dir}; save();
  const t = tileAt(x, y);
  if (t.animals) stepsSince++;
  if (t.learnOnStep && lvl(t.word) === 0) return showNotice(t.word, t.stepNote ? {note:t.stepNote} : {});
  if (t.animals && canWild() && stepsSince >= 3 && Math.random() < 0.22){ stepsSince = 0; held = null; queued = null; return wildAppears(); }
}

let foe = null, alertUntil = 0;
function findSpot(){
  const order = [pl.dir].concat(['down','left','right','up'].filter(d => d !== pl.dir));
  for (const d of order){ const [dx,dy] = DV[d], x = pl.x + dx, y = pl.y + dy, t = tileAt(x,y); if (t.walk && t.look !== 'bridge' && !npcAt(x,y)) return {x, y, d}; }
  const [dx,dy] = DV[pl.dir]; return {x:pl.x + dx, y:pl.y + dy, d:pl.dir};
}
async function wildAppears(){
  const unmet = ANIMALS.filter(x => !S.met.includes(x.id));
  const pool = unmet.length && Math.random() < .75 ? unmet : ANIMALS;
  const a = pool[Math.floor(Math.random() * pool.length)];
  const spot = findSpot();
  pl.dir = spot.d;
  foe = {a, x:spot.x, y:spot.y, t0:performance.now(), state:'in'};
  alertUntil = performance.now() + 1000;
  SFX.encounter();
  await sleep(1100);
  const firstMeet = !S.met.includes(a.id);
  if (firstMeet){ S.met.push(a.id); save(); }
  const justTaught = lvl(a.hz) === 0;
  if (justTaught) await showNotice(a.hz, {note:`A wild ${a.name} jumped out of the ${wz('草')}! Answer its questions to make friends.`});
  else { say(a.hz); await sleep(900); }
  if (firstMeet) toast(`Hidden animals found: ${Math.min(S.met.length, 4)}/4`);
  const won = await encounter({id:a.id, hz:a.hz, img:portrait(a.id), wild:true, justTaught});
  foe.state = won ? 'happy' : 'flee'; foe.t1 = performance.now();
  await sleep(won ? 1000 : 650);
  foe = null;
}
