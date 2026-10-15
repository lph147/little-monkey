// What happens in the world: where you can walk, tasks, talking to characters, looking at things and wild animals.

/* ================= WORLD LOGIC ================= */
function tileAt(x, y){ if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return 'M'; let c = MAP[y][x]; if (c === 'R' && S.gate) c = '.'; return c; }
const npcAt = (x, y) => NPCS.find(n => n.x === x && n.y === y);
const walkable = (x, y) => 'gGF.B'.includes(tileAt(x, y)) && !npcAt(x, y);
const DV = {up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]};
const OPP = {up:'down', down:'up', left:'right', right:'left'};

const learnedCount = () => ORDER.filter(w => lvl(w) >= 1).length;
const ELDER_NEED = 4;
const elderReady = () => learnedCount() - 1 >= ELDER_NEED;
const metCount = () => Math.min(S.met.length, ANIMALS.length);
const areaDone = () => S.q.elder >= 2 && S.q.hungry === 3 && S.q.thirsty === 3 && metCount() >= ANIMALS.length && S.story;
function getTasks(){
  const q = S.q, t = [];
  if (q.elder === 0) t.push({id:'elder', text:'Talk to the old monkey on the path', target:[10,5], npc:true});
  if (q.elder === 1) t.push(elderReady()
    ? {id:'elder2', text:'Talk to the old monkey again', target:[10,5], npc:true}
    : {id:'learn4', text:`Learn ${ELDER_NEED} words, then talk to the old monkey again (${Math.min(learnedCount() - 1, ELDER_NEED)}/${ELDER_NEED})`, target:null});
  if (q.elder >= 2 && metCount() < ANIMALS.length) t.push({id:'animals', text:`Find the hidden animals in the tall grass (${metCount()}/${ANIMALS.length})`, target:null});
  if (q.hungry === 1 && !S.carry) t.push({id:'h1', text:'Find the fruit the hungry monkey asked for', target:[2,7]});
  if (q.hungry === 1 && S.carry) t.push({id:'h2' + S.carry, text:`Give the ${wz(S.carry)} to the hungry monkey`, target:[13,5], npc:true});
  if (q.thirsty === 1) t.push({id:'t1', text:'Collect water from the river or the pond', target:[11,9]});
  if (q.thirsty === 2) t.push({id:'t2', text:`Give the ${wz('水')} to the thirsty monkey`, target:[2,12], npc:true});
  if (S.gate && !S.story) t.push({id:'fall', text:'Climb up beside the river to the waterfall', target:[18,1]});
  if (areaDone() && !S.area1Done) t.push({id:'door', text:`Pass the word test at the ${wz('洞')} door`, target:[3,3]});
  return t;
}
function tasksHint(){
  const q = S.q;
  if (q.elder > 0 && (q.hungry === 0 || q.thirsty === 0)) return 'Monkeys with a ! above them need help. Walk up to one and press A.';
  if (S.area1Done) return `Flower Fruit Mountain is complete. Practise in the ${wz('草')} or visit your friends.`;
  return '';
}
function goalText(){ const t = getTasks(); return t.length ? t.map(x => x.text).join('. ') + '.' : tasksHint(); }
const newTaskUntil = {};
function facing(){ const [dx,dy] = DV[pl.dir]; return [pl.x + dx, pl.y + dy]; }
function promptFor(x, y){
  const n = npcAt(x, y);
  if (n) return n.kind === 'bird' ? 'Look' : 'Talk';
  const c = tileAt(x, y);
  if ((c === 'P' || c === 'Q') && S.q.hungry === 1) return 'Pick';
  if ('PQXNCSR'.includes(c)) return 'Look';
  if (c === 'W' || c === 'O') return S.q.thirsty === 1 ? 'Collect' : (lvl(c === 'W' ? '河' : '鱼') === 0 ? 'Look' : '');
  const w = {M:'山', T:'树', '.':'路', G:'草', F:'花'}[c];
  if (w && lvl(w) === 0) return 'Look';
  if (c === 'T' && x >= 20 && lvl('森林') === 0) return 'Look';
  return '';
}
function checkGate(){
  if (!S.gate && S.q.hungry === 3 && S.q.thirsty === 3){
    S.gate = true; save(); buildMap(); SFX.rumble(); shakeT = performance.now();
    toast(`A rumble from the ${wz('山')}! The rocks north of the meadow have rolled away.`);
  }
}
async function talk(n){
  const q = S.q;
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
  const isH = n.kind === 'hungry', key = n.kind;
  const ask = isH ? L.hungry : L.thirsty, verb = isH ? '吃' : '喝', thing = isH ? '桃子' : '水';
  const ready = isH ? (q.hungry === 1 && S.carry === '桃子') : q.thirsty === 2;
  if (isH && q.hungry === 1 && S.carry && S.carry !== '桃子'){
    await showDialog(face, L.notThis);
    S.carry = null; save(); toast('The monkey gives the fruit back. Listen to what it wants, then try another tree.');
    return;
  }
  if (q[key] <= 1 && !ready){
    await showDialog(face, ask, {teach: lvl(verb) === 0 ? verb : null});
    if (lvl(verb) === 0) await showNotice(verb);
    if (q[key] === 0){ q[key] = 1; save(); toast(isH ? 'The hungry monkey wants something to eat. Check your tasks.' : 'The thirsty monkey wants something to drink. Check your tasks.'); }
  } else if (ready){
    await showDialog(face, isH ? L.havePeach : L.haveWater, {ok:'Give it'});
    const nw = ['要','我'].find(w => lvl(w) === 0);
    if (nw) await showNotice(nw, {note: nw === '要' ? 'Use 要 to say what you want.' : '我 means I or me.'});
    await tiles(face, ['我','要',verb,thing], [isH ? '喝' : '吃'], 'Say what the monkey wants. Put the words in order.');
    ['我','要',verb,thing].filter(w => lvl(w) >= 1).forEach(w => setLevel(w, 4));
    q[key] = 3; if (isH) S.carry = null; S.peaches += 3; save(); SFX.fanfare();
    await showDialog(face, L.thanks);
    toast('+3 🍑. Task complete!');
    checkGate();
  } else await showDialog(face, L.thanks);
}
async function interact(x, y){
  const n = npcAt(x, y);
  if (n) return talk(n);
  const c = tileAt(x, y), q = S.q;
  switch (c){
    case 'S': await showNotice('石头', {note:'You were born from this stone.'}); break;
    case 'R': await showNotice('石头'); toast('Big rocks block the way up. Maybe they will move once the monkeys are happy.'); break;
    case 'M': await showNotice('山'); break;
    case '.': await showNotice('路'); break;
    case 'G': await showNotice('草'); break;
    case 'F': await showNotice('花'); break;
    case 'T':
      if (lvl('树') > 0 && (x >= 20 || x === 0 || y === ROWS - 1 || (x === HOT['森林'][0] && y === HOT['森林'][1]))) await showNotice('森林', {note:'So many trees together.'});
      else await showNotice('树');
      break;
    case 'P': case 'Q': {
      const fruit = c === 'P' ? '桃子' : '苹果';
      if (q.hungry === 1){
        if (lvl(fruit) === 0) await showNotice(fruit, {note:'You pick one from the tree.'});
        S.carry = fruit; save(); SFX.right(); toast(`You picked a ${wz(fruit)}. Take it to the hungry monkey.`);
      } else await showNotice(fruit);
      break; }
    case 'W': case 'O':
      if (q.thirsty === 1){
        // the quest comes first: collecting water is where 水 is introduced
        if (lvl('水') === 0) await showNotice('水', {note: c === 'W' ? 'You scoop up some water from the river.' : 'You scoop up some water from the pond.'});
        q.thirsty = 2; save(); SFX.right(); toast(`You collected some ${wz('水')}. Take it to the thirsty monkey.`);
      } else if (c === 'W') await showNotice('河');
      else await showNotice('鱼', {note: lvl('鱼') === 0 ? 'Little fish dart about in the pond.' : ''});
      break;
    case 'C':
      if (lvl('洞') === 0) await showNotice('洞', {note:'A cave in the cliff, closed by a heavy stone door.'});
      if (!areaDone()) await infoBox('🚪', '<p>The door won’t move. Finish everything on Flower Fruit Mountain first:</p>' + checklistHTML(true));
      else if (await confirmBox('🚪', `The door has rolled open. To go through, pass a short word test: match each word you learned here to its picture. You need ${Math.round(PASS*100)}% right first time.`, 'Start the test', 'Not yet')){ if (await wordTest()) await nextArea(); }
      break;
    case 'X':
      await showNotice('瀑布', {note:`Water crashes down the ${wz('山')}. What could be behind it?`});
      await storyScroll();
      break;
    case 'N':
      SFX.blip();
      await showDialog(speaker('sign'), {t:['花果山'], en:'Flower Fruit Mountain'}, {hint:'The name of your home. You will see it often in the book.'});
      break;
    default: SFX.bump();
  }
}
let stepsSince = 0;
async function arrive(x, y){
  S.pos = {x, y, dir:pl.dir}; save();
  const c = tileAt(x, y);
  if (c === '.' && lvl('路') === 0) return showNotice('路', {note:'You are walking along a path.'});
  if (c === 'F' && lvl('花') === 0) return showNotice('花');
  if (c === 'G'){
    stepsSince++;
    if (lvl('草') === 0) return showNotice('草', {note:'Tall grass. Animals hide in here.'});
    if (canWild() && stepsSince >= 3 && Math.random() < 0.22){ stepsSince = 0; held = null; queued = null; return wildAppears(); }
  }
}

let foe = null, alertUntil = 0;
function findSpot(){
  const order = [pl.dir].concat(['down','left','right','up'].filter(d => d !== pl.dir));
  for (const d of order){ const [dx,dy] = DV[d], x = pl.x + dx, y = pl.y + dy; if ('gGF.'.includes(tileAt(x,y)) && !npcAt(x,y)) return {x, y, d}; }
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
