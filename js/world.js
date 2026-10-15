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
const ELDER_NEED = 4;
const elderReady = () => learnedCount() - 1 >= ELDER_NEED;
const metCount = () => Math.min(S.met.length, ANIMALS.length);
const areaDone = () => here().elder >= 2 && here().hungry === 'done' && here().thirsty === 'done' && metCount() >= ANIMALS.length && here().story;
function getTasks(){
  const q = here(), t = [];
  if (q.elder === 0) t.push({id:'elder', text:'Talk to the old monkey on the path', target:[10,5], npc:true});
  if (q.elder === 1) t.push(elderReady()
    ? {id:'elder2', text:'Talk to the old monkey again', target:[10,5], npc:true}
    : {id:'learn4', text:`Learn ${ELDER_NEED} words, then talk to the old monkey again (${Math.min(learnedCount() - 1, ELDER_NEED)}/${ELDER_NEED})`, target:null});
  if (q.elder >= 2 && metCount() < ANIMALS.length) t.push({id:'animals', text:`Find the hidden animals in the tall grass (${metCount()}/${ANIMALS.length})`, target:null});
  if (q.hungry === 'asked' && !q.holding.hungry) t.push({id:'h1', text:'Find the fruit the hungry monkey asked for', target:[2,7]});
  if (q.hungry === 'asked' && q.holding.hungry) t.push({id:'h2' + q.holding.hungry, text:`Give the ${wz(q.holding.hungry)} to the hungry monkey`, target:[13,5], npc:true});
  if (q.thirsty === 'asked' && !q.holding.thirsty) t.push({id:'t1', text:'Collect water from the river or the pond', target:[11,9]});
  if (q.thirsty === 'asked' && q.holding.thirsty) t.push({id:'t2', text:`Give the ${wz('水')} to the thirsty monkey`, target:[2,12], npc:true});
  if (here().gate && !here().story) t.push({id:'fall', text:'Climb up beside the river to the waterfall', target:[18,1]});
  if (areaDone() && !here().done) t.push({id:'door', text:`Pass the word test at the ${wz('洞')} door`, target:[3,3]});
  return t;
}
function tasksHint(){
  const q = here();
  if (q.elder > 0 && (q.hungry === 'not asked' || q.thirsty === 'not asked')) return 'Monkeys with a ! above them need help. Walk up to one and press A.';
  if (here().done) return `Flower Fruit Mountain is complete. Practise in the ${wz('草')} or visit your friends.`;
  return '';
}
function goalText(){ const t = getTasks(); return t.length ? t.map(x => x.text).join('. ') + '.' : tasksHint(); }
const newTaskUntil = {};
function facing(){ const [dx,dy] = DV[pl.dir]; return [pl.x + dx, pl.y + dy]; }
function promptFor(x, y){
  const n = npcAt(x, y);
  if (n) return n.kind === 'bird' ? 'Look' : 'Talk';
  const t = tileAt(x, y);
  if (t.gather && canGather(t.gather)) return t.gather.label;
  if (t.landmark) return 'Look';
  const w = lookWord(t);
  return w && lvl(w) === 0 ? 'Look' : '';
}
const matches = cond => Object.entries(cond).every(([k, v]) => here()[k] === v);   // does your progress match all of these?
const STEPS = {   // what each step in the content's do-lists does
  set: v => { Object.assign(here(), v); save(); },
  rumble: () => { buildMap(); SFX.rumble(); shakeT = performance.now(); },
  message: v => toast(fill(v))
};
async function runSteps(steps){ for (const step of steps) for (const [k, v] of Object.entries(step)) await STEPS[k](v); }
async function runEvents(){ for (const e of AREA.events) if (matches(e.if)) await runSteps(e.do); }
async function talk(n){
  const q = here();
  n.dir = OPP[pl.dir];
  if (n.kind === 'bird'){ await showNotice('鸟', {note:'A little bird hops about, singing.'}); return; }
  const face = speaker(n.kind);
  if (n.kind === 'elder'){
    if (q.elder === 0){
      await showDialog(face, L.hi, {teach:'你好'});
      if (lvl('你好') === 0) await showNotice('你好');
      await showDialog(face, L.go, {hint:`Things that sparkle have a word to learn. Face them and press A. Learn ${ELDER_NEED} words, then come back and talk to me again.`});
      q.elder = 1; save();
    } else if (q.elder === 1 && !elderReady()){
      await showDialog(face, L.go, {hint:`Learn ${ELDER_NEED} words first, then come back. (${Math.min(learnedCount() - 1, ELDER_NEED)}/${ELDER_NEED})`});
    } else if (q.elder === 1){
      await showDialog(face, L.animals, {teach:'动物', hint:'Walk through the tall grass to find the hidden animals. Answer their questions to make friends.'});
      if (lvl('动物') === 0) await showNotice('动物', {note:`There are ${ANIMALS.length} different animals hiding in the tall grass. Can you find them all?`});
      q.elder = 2; save();
    } else await showDialog(face, L.hi, {hint: goalText() || 'Keep exploring, little monkey.'});
    return;
  }
  if (q.elder === 0){
    await showDialog(face, L.findElder, {hint:'Talk to the old monkey on the path first. He’ll tell you what to do.'});
    return;
  }
  if (n.kind === 'playful'){
    if (lvl('猴子') === 0){ await showDialog(face, L.iam, {teach:'猴子'}); await showNotice('猴子'); return; }
    if (lvl('朋友') === 0){ await showDialog(face, L.weFriends, {teach:'朋友'}); await showNotice('朋友', {note:'Come back and play a word game with me any time.'}); return; }
    await showDialog(face, L.play);
    if (canEncounter()){ if (await confirmBox(face, 'Play a word game with this little monkey?', 'Play', 'Not now')){ SFX.encounter(); await encounter({id:'playful', hz:'猴子', img: portrait('playful'), wild:false, name: NAMES.playful}); } }
    else toast('Learn a few more words first, then come back to play.');
    return;
  }
  const r = requestFrom(n.id);
  if (r) await request(r, face);
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
