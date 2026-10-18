// Battles: with wild creatures from the end of the prologue, and (later) demons. A battle looks like an animal
// encounter, but both sides have hearts. On your turn you hit (a question: right hits, wrong misses), eat something
// (food that brings a heart back) or run away; on the enemy's turn it attacks from somewhere you hear (草！ 石头！) and you pick it to jump aside
// (wrong: you lose a heart). Every hit or miss depends on whether you know the word: no levels, no luck, no timers.
// The enemies are content (AREA.enemies); wild ones jump out of ground whose legend says wild (AREA.battles).

/* ================= BATTLES ================= */
const ENEMIES = AREA.enemies || {};
const BATTLES = AREA.battles || {};
const canBattle = () => !!BATTLES.when && matches(BATTLES.when);   // you can fight (you have the stick)
const WILD_AFTER = 5, WILD_CHANCE = .2;   // at least this many steps on wild ground between battles, then this chance a step
let wildSteps = 0;
const hearts = () => S.hearts ?? HEARTS;
const heartsHTML = (n, of) => [...Array(of)].map((_, i) => heartHTML(i < n)).join('');
const mapSpriteCache = {};
const mapSprite = w => mapSpriteCache[w] || (mapSpriteCache[w] = sprite(MAP_SPRITES[w].rows, MAP_SPRITES[w].palette));

// A step on ground where wild creatures live: now and then one jumps out. Gives true if a battle happened.
async function wildStep(t){
  if (!t.wild || !canBattle()) return false;
  if (++wildSteps < WILD_AFTER || Math.random() >= WILD_CHANCE) return false;
  wildSteps = 0; held = null; queued = null;
  const id = t.wild[Math.floor(Math.random() * t.wild.length)];
  await wildBattle(id);
  return true;
}
// It jumps out of the grass beside you, with a !, then the battle.
async function wildBattle(id, spot = findSpot()){
  const f = ENEMIES[id];
  pl.dir = spot.d;
  foe = {a:{spr:mapSprite(f.word)}, x:spot.x, y:spot.y, t0:performance.now(), state:'in'};
  alertUntil = performance.now() + 1000;
  SFX.encounter();
  await sleep(1100);
  const r = await battle(id);
  if (foe){ foe.state = 'flee'; foe.t1 = performance.now(); await sleep(650); foe = null; }
  return r;
}

// The battle itself, with its own music (the place's comes back afterwards). Gives 'won', 'lost' or 'ran'.
async function battle(id){
  playSong('battle');
  try { return await fight(id); } finally { playSong(placeSong()); }
}
async function fight(id){
  const f = ENEMIES[id], img = `<img class="portrait" alt="" src="${sprite(PICTURES[f.word].rows, PICTURES[f.word].palette).toDataURL()}">`;
  if (lvl(f.word) === 0) await showNotice(f.word, f.meetNote ? {note:fill(f.meetNote)} : {});   // the first meeting teaches its name
  else { say(f.word); await sleep(700); }
  const me = monkeySprite('player', 'up', false, 0).toDataURL();
  let left = f.hearts, note = fill(f.meet || `A {${f.word}} blocks your way!`);
  // The scene: the enemy on its mound, you from behind with your stick, and what the animations use (js below, css
  // .scene.swing and .scene.strike): where it strikes from, the enemy leaping out, a burst, and a word (Hit! Miss!).
  // look: the enemy's (gone, when it runs off); act: what's happening (hiding, on its turn).
  const stick = BATTLES.weapon && PICTURES[BATTLES.weapon] ? `<img class="stick" alt="" src="${sprite(PICTURES[BATTLES.weapon].rows, PICTURES[BATTLES.weapon].palette).toDataURL()}">` : '';
  const scene = (look = '', act = '') => `<div class="scene${f.home === '山' ? ' cliff' : ''}${act ? ' ' + act : ''}"><div class="mound foem"></div><div class="foe ${look}">${img}</div>`
    + `<div class="mound mem"></div><img class="me" alt="" src="${me}">${stick}`
    + `<div class="from" aria-hidden="true"></div><div class="striker" aria-hidden="true">${img}</div><div class="pow" aria-hidden="true"></div><div class="fx" aria-hidden="true"></div>`
    + `<div class="plate"><div class="name"><div class="spk-zh">${f.word} <span class="spk-py">${WORDS[f.word].py}</span></div></div>`
    + `<div class="hearts" aria-label="Its hearts: ${left} of ${f.hearts}">${heartsHTML(left, f.hearts)}</div></div>`
    + `<div class="plate mine"><div class="name">You</div><div class="hearts" aria-label="Your hearts: ${hearts()} of ${HEARTS}">${heartsHTML(hearts(), HEARTS)}</div></div></div>`;
  while (left > 0 && hearts() > 0){
    const act = await battleTurn(f, scene(), note);
    note = '';
    if (act === 'run'){ closeCard(); toast(fill(f.ran || `You run away from the {${f.word}}.`)); return 'ran'; }
    if (act === 'eat'){
      const w = foodThat('heal');
      S.bag[w]--; S.hearts = Math.min(HEARTS, hearts() + FOOD[w].heal); useWord(w); save(); SFX.right();
      note = `You eat a ${wz(w)}: a heart comes back.`;
    } else {
      const w = shuffle(dueFirst(f.word).slice(0, 5))[0], q = wordQuestion(w, f.word);
      const ok = await pictureQ({head:scene(), body:`<p class="label">You swing your ${wz(BATTLES.weapon || '棍子')}!</p>` + q.body, word:w, type:q.type,
        options:q.options, text:q.text, answerIdx:q.answerIdx, helper:helperHTML(),
        onShow:() => { if (q.type !== 'read') setTimeout(() => say(w), 300); wireHelper(q.options.length, q.answerIdx); },
        onAnswer:ok => {   // you swing: a hit knocks it back, or it hops aside
          const fb = sheet.querySelector('.feedback'), sc = sheet.querySelector('.scene');
          sc.classList.add('swing'); sc.classList.add(ok ? 'hit' : 'miss'); sc.querySelector('.fx').textContent = ok ? 'Hit!' : 'Miss!';
          if (ok){ left--; sc.querySelector('.plate .hearts').innerHTML = heartsHTML(left, f.hearts); SFX.thwack(.2); } else SFX.swish(.1);
          fb.innerHTML += ok ? ' <b>A hit!</b>' : ' You miss.';
        }});
      if (!ok) note = `The ${wz(f.word)} dodges.`;
    }
    if (left <= 0) break;
    await dodge(f, scene('', 'hiding'), note);
    note = '';
  }
  closeCard(); playSong(placeSong());
  if (left <= 0){
    S.shells += f.reward || 0; save(); SFX.fanfare();
    await infoBox(scene('gone'), `<p class="label center">You win!</p><p class="endmsg">${esc(fill(f.away || `The {${f.word}} runs away.`))}${f.reward ? ` +${f.reward} 🐚` : ''}</p>`);
    return 'won';
  }
  // Lost: no game over. You're carried back to rest, with full hearts; the words you missed come back sooner.
  S.hearts = HEARTS;
  const at = BATTLES.restAt || {};
  if (at.at){ S.pos = {place:placeOf(at.at), x:at.at[0], y:at.at[1], dir:at.facing || 'down'}; }
  save();
  await infoBox(scene(), `<p class="label center">Ouch!</p><p class="endmsg">${esc(fill(BATTLES.lost || 'You’re worn out, and go back to rest.'))}</p>`);
  if (at.at){ foe = null; placePlayer(); showPlaceName(); }
  return 'lost';
}
// Your turn: hit, eat something (food that brings a heart back, if you're hurt) or run away (not from a big enemy).
// Gives 'hit', 'eat' or 'run'.
function battleTurn(f, head, note){
  return new Promise(res => {
    const food = hearts() < HEARTS && foodThat('heal');
    const acts = [['hit', '打', 'dǎ', 'Hit'],
      food && ['eat', '吃', 'chī', `Eat: ${wz(food)} ×${S.bag[food]}`],
      !f.boss && ['run', '跑', 'pǎo', 'Run away']].filter(Boolean);
    openCard(`${head}<p class="label">${note ? esc(note) : 'Your turn'}</p><p class="prompt">What will you do?</p>
      <div class="menu acts">${acts.map(([id, zh, py, en]) => `<button class="act" data-act="${id}" data-label="${en.split(':')[0]}"><span class="z">${zh}</span><span class="p">${py}</span><span class="e">${esc(en)}</span></button>`).join('')}</div>`);
    const first = sheet.querySelector('.act'); if (first) first.focus();
    sheet.querySelectorAll('.act').forEach(b => b.onclick = () => { SFX.blip(); res(b.dataset.act); });
  });
}
// The enemy's turn: it hides (head: the scene, with it hiding), then attacks from somewhere (one of its attacks you've
// caught); hear it and pick it to jump aside. Then it leaps out of there: you jump aside, or it hits you.
async function dodge(f, head, note){
  const known = w => lvl(w) >= 1 && WORDS[w] && WORDS[w].pic && w !== f.word;
  const mine = shuffle((f.attacks || []).filter(known)), any = shuffle(picWords().filter(known));
  const a = mine[0] || any[0];
  const others = [...mine.slice(1), ...any.filter(w => w !== a && !mine.includes(w))].slice(0, 2);
  const opts = shuffle([a, ...others]);
  const strikes = fill(f.attack || `The {${f.word}} attacks!`);
  return pictureQ({head, body:`<p class="label">${esc(note ? note + ' ' : '')}${esc(fill(f.hide || `The {${f.word}} hides!`))}</p>`
      + `<div class="askrow"><p class="prompt">${esc(f.dodge || 'Listen. Where is it coming from? Pick it to jump aside.')}</p><button class="sayBig" data-a="say" aria-label="Play the word again">🔊</button></div>`,
    word:a, type:'listen', options:opts.map(o => `<span class="ico">${picHTML(o)}</span><span class="cap">${o}</span>${laterPy(o)}`), answerIdx:opts.indexOf(a),
    helper:helperHTML(), onShow:() => { setTimeout(() => say(a), 300); wireHelper(opts.length, opts.indexOf(a)); },
    onAnswer:ok => {   // it leaps out of where it was: you jump aside, or it hits you
      const fb = sheet.querySelector('.feedback'), sc = sheet.querySelector('.scene');
      sc.querySelector('.from').innerHTML = picHTML(a);
      sc.classList.add('strike'); sc.classList.add(ok ? 'dodged' : 'struck'); sc.querySelector('.fx').textContent = ok ? 'Missed you!' : 'Ouch!';
      SFX.swish(.25); sheet.querySelector('.label').textContent = strikes;   // it strikes!
      if (ok) fb.innerHTML += ' <b>You jump aside!</b>';
      else {
        S.hearts = Math.max(0, hearts() - 1); save(); SFX.thwack(.5);
        sc.querySelector('.plate.mine .hearts').innerHTML = heartsHTML(hearts(), HEARTS);
        fb.innerHTML += ' <b>Ouch!</b>';
      }
    }});
}
