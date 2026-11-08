// Battles: with wild creatures from the end of the prologue, and (later) demons. A battle looks like an animal
// encounter, but both sides have health, a bar on each name plate. On your turn you hit (a question: right hits, wrong
// misses), eat something (food that brings health back) or run away; on the enemy's turn it attacks from somewhere you hear
// (草！ 石头！) and you pick it to jump aside (wrong: it hits you). Every hit or miss depends on whether you know the word: no
// levels, no luck, no timers. Three right answers in a row (hitting or jumping aside) make your stick glow, and your next
// hit counts three times over (decided 2 November 2026). A boss fight (an enemy's bossFight, such as the bear at the
// pasture's rocks) has its health across the top of the scene, asks the words you know least well, and if it beats you, you
// can try again on the spot. How much a hit takes is content: your weapon's (AREA.battles.hits) and each enemy's (hits).
// The enemies are content (AREA.enemies); wild ones jump out of ground whose legend says wild (AREA.battles).

/* ================= BATTLES ================= */
const ENEMIES = AREA.enemies || {};
const BATTLES = AREA.battles || {};
const canBattle = () => !!BATTLES.when && matches(BATTLES.when);   // you can fight (you have the stick)
// Your weapon: the area's (battles.weapon), or one the story has given you since (the weapon step, kept in the area's
// progress), such as the Demon of Havoc's broadsword; and how hard it hits (its own, battles.weapons, or battles.hits).
const weaponNow = () => (S && S.areas && here() && here().weapon) || BATTLES.weapon;
const weaponHits = () => (BATTLES.weapons || {})[weaponNow()] || BATTLES.hits;
// An enemy with a name rather than a word (name: {zh, py, en}; pic: its picture), such as the Demon of Havoc (names aren't
// vocabulary: never a card to catch, decided 5 November 2026), or one with a word, taught as you meet it.
const foeZh = f => f.name ? f.name.zh : sizedZh(f), foePy = f => f.name ? f.name.py : (f.size ? SIZES[f.size].py + ' ' : '') + WORDS[f.word].py;   // (a big or small one: 大蛇 dà shé)
const foePic = f => f.person ? personPic(f.person) : PICTURES[f.pic || f.word], foeThe = f => f.name ? `the ${f.name.en}` : `the ${f.size ? SIZES[f.size].en + ' ' : ''}${wz(f.word)}`;   // (a person, such as a pupil you spar with: as they look on the map, with a staff: js/year.js)
const WILD_AFTER = 5, WILD_CHANCE = .2;   // at least this many steps on wild ground between battles, then this chance a step
let wildSteps = 0;
// Your health (decided 27 October 2026: hearts, 5 at most, were too few to tell weapons, food and enemies apart), and the
// most you can have, which the story can raise.
const maxHealth = () => S.maxHealth || HEALTH;
const health = () => Math.min(S.health ?? maxHealth(), maxHealth());
const hurt = () => health() < maxHealth();
// A health bar: a heart, then the bar, green, yellow under half, red at a fifth or less; with its number (num) for yours.
// In a battle, both bars are drawn to one scale, as long as the most health each can have (--hpk: that, as a share of
// yours to start with), so a snake's (20) is less than half as long as yours (50), and a bear's (50) as long (decided
// 28 October 2026: the enemy's bar filled its wider name plate, so a snake looked twice as strong as you).
// setHealth changes one already there, so the bar slides down (or up) rather than jumping.
const healthCls = (n, max) => n > max / 2 ? 'g' : n > max / 5 ? 'y' : 'r';
const healthHTML = (n, max, num) => `<div class="hp" role="img" aria-label="Health: ${n} of ${max}" style="--hpk:${max / HEALTH}">${heartHTML(true)}`
  + `<span class="hpbar"><i class="${healthCls(n, max)}" style="width:${Math.max(0, n / max * 100)}%"></i></span>${num ? `<span class="hpnum">${n}/${max}</span>` : ''}</div>`;
function setHealth(el, n, max){
  const bar = el.querySelector('.hpbar i'), hp = el.querySelector('.hp'), num = el.querySelector('.hpnum');
  if (bar){ bar.style.width = Math.max(0, n / max * 100) + '%'; bar.className = healthCls(n, max); }
  if (hp) hp.setAttribute('aria-label', `Health: ${n} of ${max}`);
  if (num) num.textContent = `${n}/${max}`;
}
const mapSpriteCache = {};
const mapSprite = w => mapSpriteCache[w] || (mapSpriteCache[w] = sprite(MAP_SPRITES[w].rows, MAP_SPRITES[w].palette));

// A step on ground where wild creatures live: now and then one jumps out. Gives true if a battle happened.
async function wildStep(t){
  if (!t.wild || !canBattle()) return false;
  if (++wildSteps < WILD_AFTER || Math.random() >= WILD_CHANCE) return false;
  wildSteps = 0;
  if (isStinky()){   // (you smell of durian, js/input.js: it keeps away, and the first sniffs the air and runs off)
    const id = pickFoe(t.wild);
    if (id && !stinkFled){ stinkFled = true; held = null; queued = null; await sniffAndFlee(id); }
    return false;
  }
  const id = pickFoe(t.wild);
  if (!id) return false;   // (none of those that live here is about now, such as wasps at night)
  held = null; queued = null;
  await wildBattle(id, findSpot(), {size:pickSize(id)});
  return true;
}
// Big and small creatures (decided 8 November 2026, the polish plan): once you know 大 and 小, one wild creature in four is
// small (half its health and hits, the usual shells) and one in four big (one and a half times its health and hits, and
// twice the shells), big ones twice as likely at night. You see which at once, smaller or bigger on the map (mapK: as the
// little ones are drawn, SMALL_PX, or a big animal's 22 pixels) and in the fight (the scene's size-small or size-big), its
// health bar to scale; and its name says it, on its plate and aloud (大蛇！ 小蜘蛛！). Never a boss (a boss fight, one that
// rears up big, one with a name, a person), nor a story battle: only those that jump out of the long grass (wildStep).
const SIZES = {small:{zh:'小', py:'xiǎo', en:'little', k:.5, mapK:11 / 16}, big:{zh:'大', py:'dà', en:'big', k:1.5, mapK:22 / 16, reward:2}};
const canSize = f => !!f && !!f.word && !f.bossFight && !f.big && !f.name && !f.person;
const sizesKnown = () => lvl('大') >= 1 && lvl('小') >= 1;
function pickSize(id){   // (by day: usual half the time, small a quarter, big a quarter; at night, big half the time)
  if (!canSize(ENEMIES[id]) || !sizesKnown()) return null;
  const r = Math.random(), night = typeof isNight === 'function' && isNight();
  return r < (night ? .25 : .5) ? null : r < (night ? .5 : .75) ? 'small' : 'big';
}
// An enemy at its size: its health, hits and shells, and what it says, a big or little one (A big {蛇} hisses at you!).
const sizedText = (size, text) => text.replace(/\b(A|a|The|the) (little )?\{/g, (m, art) => `${art} ${SIZES[size].en} {`);   // (a little demon already says so: A big {妖怪}…)
function sized(f, size){
  const s = SIZES[size]; if (!s || !canSize(f)) return f;
  const said = {meet:f.meet || `A {${f.word}} blocks your way!`, ran:f.ran || `You run away from the {${f.word}}.`, hide:f.hide || `The {${f.word}} hides!`,
    attack:f.attack || `The {${f.word}} attacks!`, away:f.away || `The {${f.word}} runs away.`};
  for (const k in said) said[k] = sizedText(size, said[k]);
  return {...f, ...said, size, health:Math.round(f.health * s.k), hits:Math.round(f.hits * s.k), reward:(f.reward || 0) * (s.reward || 1)};
}
const sizedZh = f => f.size ? SIZES[f.size].zh + f.word : f.word;
// Every sized name the game can say, for the voices and CHINESE.md: each enemy that comes in sizes, little and big.
const SIZED = () => [...new Map(Object.values(ENEMIES).filter(canSize).flatMap(f => Object.values(SIZES).map(s => [s.zh + f.word, {zh:`${s.zh} ${f.word}`, en:`A ${s.en} ${WORDS[f.word].en.split(',')[0]}!`}]))).values()];
// Its picture on the map at its size (drawn once for each, and kept: few canvases).
const sizedSprites = {};
function sizedSprite(w, size){
  const spr = mapSprite(w); if (!SIZES[size]) return spr;
  const key = w + '|' + size;
  if (!sizedSprites[key]){
    const k = SIZES[size].mapK, c = document.createElement('canvas'); c.width = Math.round(spr.width * k); c.height = Math.round(spr.height * k);
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(spr, 0, 0, c.width, c.height);
    sizedSprites[key] = c;
  }
  return sizedSprites[key];
}
// One that would have jumped out while you smell of durian: it pops up out of the grass beside you, sniffs the air (a ?
// over it: drawFoe, js/draw.js) and runs off, with a message (its enemy's sniff), the first time after each one you eat.
const SNIFF_MS = 1100;
async function sniffAndFlee(id, spot = findSpot()){
  const f = ENEMIES[id], w = f.pic || f.word;
  pl.dir = spot.d; S.pos.dir = pl.dir;
  foe = {a:{spr:mapSprite(w), faces:MAP_SPRITES[w].faces, hz:w}, x:spot.x, y:spot.y, t0:performance.now(), state:'in', sniff:true};
  SFX.swish();
  await sleep(SNIFF_MS);
  foe.state = 'flee'; foe.t1 = performance.now(); SFX.turn();
  toast(fill(f.sniff || `The {${f.word}} sniffs the air, and runs off!`));
  await sleep(650); foe = null;
}
// Which creature jumps out: one of those that live there (wild; one listed twice comes twice as often), at random, but
// never the same three times in a row, unless it's all that lives there (decided 22 October 2026: by chance, a spider
// jumped out six times in a row). lastFoes: the last two that did. And by the time of day (decided 8 November 2026, the
// polish plan): an enemy's day and night say how likely it is then (1 if not said), so wasps are only about by day (night
// 0), snakes mostly by day, wolves and spiders more at night (night 2), and the weasel only after dark (day 0); none
// about now, and nothing jumps out (null).
const lastFoes = [];
const foeWeight = id => { const f = ENEMIES[id] || {}, w = typeof isNight === 'function' && isNight() ? f.night : f.day; return w === undefined ? 1 : w; };
function pickFoe(wild){
  const about = wild.filter(id => foeWeight(id) > 0);
  if (!about.length) return null;
  const twice = lastFoes.length === 2 && lastFoes[0] === lastFoes[1] ? lastFoes[0] : null;
  const pool = about.some(id => id !== twice) ? about.filter(id => id !== twice) : about;
  let r = Math.random() * pool.reduce((n, id) => n + foeWeight(id), 0), id = pool[pool.length - 1];
  for (const x of pool){ r -= foeWeight(x); if (r < 0){ id = x; break; } }
  lastFoes.push(id); if (lastFoes.length > 2) lastFoes.shift();
  return id;
}
// It jumps out of the grass beside you, with a !, then the battle (opts: as for battle). A big one (big, such as the bear)
// rears up out of it twice your size (its picture, not its little map sprite), roaring, the screen shaking as it stands
// up, and whoever is following you takes fright (a ! over them, trembling: js/draw.js); beaten, it lumbers off, slowly.
async function wildBattle(id, spot = findSpot(), opts = {}){
  const f = ENEMIES[id], w = f.pic || f.word, big = !!f.big && !!PICTURES[w];   // (w: its look, a name's picture or its word's)
  pl.dir = spot.d;
  foe = {a:{spr:big ? sprite(PICTURES[w].rows, PICTURES[w].palette) : sizedSprite(w, opts.size), faces:MAP_SPRITES[w].faces, hz:w}, x:spot.x, y:spot.y, t0:performance.now(), state:'in', big, size:opts.size || null};
  alertUntil = performance.now() + 1000;
  if (big){ SFX.roar(); setTimeout(() => { shakeT = performance.now(); SFX.rumble(); }, RISE_MS); } else SFX.encounter();
  await sleep(big ? 1700 : 1100);
  const r = await battle(id, opts);
  if (foe){   // beaten, it runs off; if you ran away (or it beat you), it ducks back down into the grass, and you've turned away
    foe.state = r === 'won' ? 'flee' : 'hide'; foe.t1 = performance.now();
    if (r === 'ran'){ pl.dir = dirOf(pl.x - foe.x, pl.y - foe.y); S.pos.dir = pl.dir; SFX.turn(); }
    await sleep(r === 'won' && big ? LUMBER_MS : 650); foe = null;
  }
  return r;
}
const RISE_MS = 500, LUMBER_MS = 1600;   // how long a big one takes to stand up out of the grass, and to lumber off, beaten

// The battle itself, with its own music (the place's comes back afterwards). Gives 'won', 'lost' or 'ran'. opts.meet: what's
// said as it begins, instead of the enemy's own meet. Lost, and once you've come round where you rest, what the story says
// happens then (the area's battles' afterLoss: the first whose if matches), such as the cow you were leading home
// running back to its spring.
// A boss fight (bossFight), or a battle the story lets you try again (opts.retry), that beats you gives 'again' (Try again:
// it starts over, your health full) or 'back' (Not now: you step back to where opts.back says, the one following you still
// with you, and nothing else happens).
async function battle(id, opts = {}){
  let r;
  try {
    for (;;){
      playSong(ENEMIES[id] && SONGS[ENEMIES[id].song] ? ENEMIES[id].song : battleSong());   // (a boss's own song, or the place's battle song, if it has one)
      r = await fight(id, opts);
      if (r !== 'again') break;
      opts = {...opts, again:true};
    }
  } finally { playSong(placeSong()); }
  if (r === 'back' && opts.back && opts.back.at){
    const at = opts.back.at;
    S.pos = {place:placeOf(at), x:at[0], y:at[1], dir:opts.back.facing || S.pos.dir}; save(); placePlayer();
  }
  const after = r === 'lost' && (BATTLES.afterLoss || []).find(a => !a.if || matches(a.if));
  if (after) await runSteps(after.do);
  return r;
}
async function fight(id, opts = {}){
  const f = sized(opts.boss ? {...ENEMIES[id], boss:true} : ENEMIES[id], opts.size), img = `<img class="portrait" alt="" src="${sprite(foePic(f).rows, foePic(f).palette).toDataURL()}">`;   // (sized: a big or small one)
  if (f.name){}   // (a name: shown on its plate, never caught)
  else if (lvl(f.word) === 0){ await showNotice(f.word, f.meetNote ? {note:fill(f.meetNote)} : {}); if (f.size) await sayFully(sizedZh(f), 700); }   // the first meeting teaches its name (and a big or small one's said: 大狼)
  else await sayFully(sizedZh(f), 700);   // (its name, said in full before the fight goes on: 蛇, or 大蛇)
  const big = !!f.bossFight;   // (a boss fight: its health across the top)
  if (f.nameCard && !opts.again) await bossNameCard(f, img);   // (a big boss: its name across the screen, the first time each fight)
  let angry = false;   // (a boss that gets angry at so much health left, angry.at: from then on, it attacks twice)
  let streak = 0;   // right answers in a row: STREAK of them, and your next hit counts POWER times over
  const charged = () => streak >= STREAK;
  const me = monkeySprite('player', 'up', false, 0, true).toDataURL();   // (the scene's own stick is the one you swing)
  let left = f.health, note = fill((!opts.again && opts.meet) || f.meet || `A {${f.word}} blocks your way!`);
  // The scene: the enemy on its mound, you from behind with your stick, and what the animations use (js below, css
  // .scene.swing and .scene.strike): where it strikes from, the enemy leaping out, a burst, and a word (Hit! Miss!).
  // look: the enemy's (gone, when it runs off); act: what's happening (hiding, on its turn).
  const stickImg = () => weaponNow() && PICTURES[weaponNow()] ? `<img class="stick" alt="" src="${sprite(PICTURES[weaponNow()].rows, PICTURES[weaponNow()].palette).toDataURL()}">` : '';
  let stick = stickImg();
  const stagesDone = new Set();   // (a boss's stages: what happens at so much of its health left, each once)
  const stagesLeft = () => (f.stages || []).some((s, i) => !stagesDone.has(i));
  const scene = (look = '', act = '') => `<div class="scene${sceneLook(f.home)}${f.size ? ' size-' + f.size : ''}${big ? ' boss' : ''}${angry ? ' rage' : ''}${charged() ? ' charged' : ''}${act ? ' ' + act : ''}"><div class="mound foem"></div><div class="foe ${look}">${img}</div>`
    + `<div class="mound mem"></div><img class="me" alt="" src="${me}">${stick}`
    + `<div class="from" aria-hidden="true"></div><div class="striker" aria-hidden="true">${img}</div><div class="pow" aria-hidden="true"></div><div class="fx" aria-hidden="true"></div>`
    + `<div class="plate${big ? ' bossplate' : ''}"><div class="name"><div class="spk-zh">${foeZh(f)} <span class="spk-py">${foePy(f)}</span></div>${angry ? '<span class="tag">Angry!</span>' : ''}</div>`
    + `${big && f.angry ? healthHTML(left, f.health).replace('<span class="hpbar">', `<span class="hpbar"><b class="notch" style="left:${f.angry.at * 100}%"></b>`) : healthHTML(left, f.health)}</div>`
    + `<div class="plate mine"><div class="name"><span>You</span><span class="hpnum">${health()}/${maxHealth()}</span></div>${healthHTML(health(), maxHealth())}${streakHTML(streak)}</div></div>`;   // (your number beside You)
  let first = big && !opts.again;   // (a boss fight begins with it rearing up, a cry and a rumble, and the card shakes as it lands)
  while (left > 0 && health() > 0){
    // A boss's stage (stages: at, a share of its health left; do, steps; note, what you're told on your next turn), such as
    // the Demon of Havoc's: your hairs turn into little monkeys, then you take his sword. One a turn, each once.
    const st = (f.stages || []).find((s, i) => !stagesDone.has(i) && left <= f.health * s.at);
    if (st){ stagesDone.add(f.stages.indexOf(st)); closeCard(); await runSteps(st.do); stick = stickImg(); note = fill(st.note || '');
      playSong(f.song && SONGS[f.song] ? f.song : battleSong()); }   // (its song again, after a scene's)
    const said = first && !opts.again && bossLine(f, 'meet');   // (what a boss says as it begins, instead of the note)
    const turn = battleTurn(f, scene('', first ? 'rear' : ''), said ? '' : note || (charged() ? `Your ${wz(weaponNow() || '棍子')} glows: your next hit counts ×${POWER}!` : ''), said ? bossLineHTML(said, img) : '');
    if (first){ first = false; rears(f); }
    if (said) speakLine(said);
    const act = await turn;
    note = '';
    if (act === 'run'){ closeCard(); toast(fill(f.ran || `You run away from the {${f.word}}.`)); return 'ran'; }
    if (act === 'eat'){
      const w = foodThat('heal');
      S.bag[w]--; S.health = Math.min(maxHealth(), health() + FOOD[w].heal); useWord(w); save(); SFX.right();
      note = `You eat a ${wz(w)}: +${FOOD[w].heal} health.`;
    } else {
      const w = big ? weakest(f.word) : toAsk(f.word, 1)[0], q = wordQuestion(w, f.word), stick = wz(weaponNow() || '棍子');
      const ok = await pictureQ({head:scene(), body:`<p class="label">${charged() ? `Your ${stick} glows! Swing it: ×${POWER}!` : `You swing your ${stick}!`}</p>` + q.body, word:w, type:q.type,
        options:q.options, text:q.text, answerIdx:q.answerIdx, helper:helperHTML(),
        onShow:() => { if (q.type !== 'read') setTimeout(() => say(w), 300); wireHelper(q.options.length, q.answerIdx); },
        onAnswer:ok => {   // you swing: a hit knocks it back, or it hops aside
          const fb = sheet.querySelector('.feedback'), sc = sheet.querySelector('.scene');
          const power = ok && charged();
          sc.classList.add('swing'); sc.classList.add(ok ? 'hit' : 'miss'); if (power) sc.classList.add('powerhit');
          sc.querySelector('.fx').textContent = power ? `Power hit! ×${POWER}` : ok ? 'Hit!' : 'Miss!';
          if (ok){ left = Math.max(stagesLeft() ? 1 : 0, left - weaponHits() * (power ? POWER : 1)); setHealth(sc.querySelector('.plate'), left, f.health); SFX.thwack(power ? .5 : .2); } else SFX.swish(.1);   // (never beaten before its stages have all happened)
          if (power) shake();
          fb.innerHTML += power ? '<br><b>A power hit!</b>' : ok ? '<br><b>A hit!</b>' : '<br>You miss.';   // (on a line of its own, never read on from the word's English: “fur A hit!”, decided 7 November 2026)
          streak = ok && !power ? streak + 1 : 0; showStreak(sc, streak);
        }});
      if (!ok) note = `${cap(foeThe(f))} dodges.`;
    }
    if (left <= 0) break;
    if (f.angry && !angry && left <= f.health * f.angry.at){   // half its health gone: it gets angry
      angry = true;
      const line = bossLine(f, 'angry');
      const open = infoBox(scene('', 'rear'), `${line ? bossLineHTML(line, img) : ''}<p class="label">${esc(fill(f.angry.note || `The {${f.word}} is angry!`))}</p>`
        + `<p class="prompt">${esc(fill(f.angry.then || ''))}</p>`);
      rears(f); if (line) speakLine(line);
      await open; note = '';
    }
    const times = angry && f.angry.twice ? 2 : 1;   // (angry, it attacks twice in a row)
    for (let i = 1; i <= times && health() > 0; i++){
      await dodge(f, scene('', 'hiding'), note, (ok, sc) => { streak = ok ? streak + 1 : 0; showStreak(sc, streak); }, times > 1 ? [i, times] : null);
      note = '';
    }
  }
  closeCard(); playSong(placeSong());
  if (left <= 0){
    earn(f.reward || 0); save(); SFX.fanfare();
    const beaten = bossLine(f, 'beaten');
    const won = infoBox(scene('gone'), `${beaten ? bossLineHTML(beaten, img) : ''}<p class="label center">You win!</p><p class="endmsg">${esc(fill(f.away || `The {${f.word}} runs away.`))}${f.reward ? ` +${f.reward} ${MONEY()}` : ''}</p>`);
    if (beaten) speakLine(beaten);
    await won;
    return 'won';
  }
  // Lost: no game over. You're carried back to rest, with your health full; the words you missed come back sooner. A boss
  // fight beats you, and you can try again on the spot, your health full (or step back, and come back when you're ready).
  S.health = maxHealth();
  if (big || opts.retry){ save(); return await tryAgain(scene(), f, opts) ? 'again' : 'back'; }
  const at = [].concat(BATTLES.restAt || []).find(r => !r.if || matches(r.if)) || {};   // the first place to rest whose if matches
  if (at.at){ S.pos = {place:placeOf(at.at), x:at.at[0], y:at.at[1], dir:at.facing || 'down'}; }
  save();
  await infoBox(scene(), `<p class="label center">Ouch!</p><p class="endmsg">${esc(fill(at.lost || BATTLES.lost || 'You’re worn out, and go back to rest.'))}</p>`);
  if (at.at){ foe = null; placePlayer(); showPlaceName(); }
  return 'lost';
}
// Your turn: hit, eat something (food that brings health back, if you're hurt) or run away (not from a big enemy).
// Gives 'hit', 'eat' or 'run'.
function battleTurn(f, head, note, said = ''){
  return new Promise(res => {
    const food = hurt() && foodThat('heal');
    const acts = [['hit', '打', 'dǎ', 'Hit'],
      food && ['eat', '吃', 'chī', `Eat: ${wz(food)} ×${S.bag[food]}`],
      !f.boss && ['run', '跑', 'pǎo', 'Run away']].filter(Boolean);
    openCard(`${head}${said || `<p class="label">${note ? esc(note) : 'Your turn'}</p><p class="prompt">What will you do?</p>`}
      <div class="menu acts">${acts.map(([id, zh, py, en]) => `<button class="act" data-act="${id}" data-label="${en.split(':')[0]}"><span class="z">${zh}</span><span class="p">${py}</span><span class="e">${esc(en)}</span></button>`).join('')}</div>
      <div class="actions qfoot"><div class="feedback"></div><span class="btn qspace" aria-hidden="true">Next</span></div>`);   // (a question's bottom row, kept empty, so nothing jumps between them)
    const first = sheet.querySelector('.act'); if (first) first.focus();
    sheet.querySelectorAll('.act').forEach(b => b.onclick = () => { SFX.blip(); res(b.dataset.act); });
  });
}
// The enemy's turn: it hides (head: the scene, with it hiding), then attacks from somewhere (one of its attacks you've
// caught); hear it and pick it to jump aside. Then it leaps out of there: you jump aside, or it hits you.
async function dodge(f, head, note, after = () => {}, nth = null){   // (nth: [this attack, of how many], when it attacks more than once a turn)
  const known = w => lvl(w) >= 1 && WORDS[w] && WORDS[w].pic && w !== f.word;
  const mine = shuffle((f.attacks || []).filter(known)), any = shuffle(picWords().filter(known));
  const a = mine[0] || any[0];
  const others = soundApart(a, [...mine.slice(1), ...any.filter(w => w !== a && !mine.includes(w))], 2);   // (you hear it: no look-alikes, and none that sound alike)
  const opts = shuffle([a, ...others]);
  const strikes = fill(f.attack || `The {${f.word}} attacks!`);
  return pictureQ({head, body:`<p class="label">${esc(note ? note + ' ' : '')}${esc(fill(f.hide || `The {${f.word}} hides!`))}${nth ? ` <b class="twice">Attack ${nth[0]} of ${nth[1]}</b>` : ''}</p>`
      + `<div class="askrow"><p class="prompt">${esc(f.dodge || 'Listen. Where is it coming from? Pick it to jump aside.')}</p><button class="sayBig" data-a="say" aria-label="Play the word again">🔊</button></div>`,
    word:a, type:'listen', options:opts.map(o => `<span class="ico">${picHTML(o)}</span><span class="cap">${o}</span>${laterPy(o)}`), answerIdx:opts.indexOf(a),
    helper:helperHTML(), onShow:() => { setTimeout(() => say(a), 300); wireHelper(opts.length, opts.indexOf(a)); },
    onAnswer:ok => {   // it leaps out of where it was: you jump aside, or it hits you
      const fb = sheet.querySelector('.feedback'), sc = sheet.querySelector('.scene');
      sc.querySelector('.from').innerHTML = picHTML(a);
      sc.classList.add('strike'); sc.classList.add(ok ? 'dodged' : 'struck'); sc.querySelector('.fx').textContent = ok ? 'Missed you!' : 'Ouch!';
      SFX.swish(.25);
      const lb = sheet.querySelector('.label'); lb.style.minHeight = lb.offsetHeight + 'px'; lb.textContent = strikes;   // it strikes! (the line kept as tall, so nothing under it moves)
      after(ok, sc);
      if (ok) fb.innerHTML += '<br><b>You jump aside!</b>';
      else {
        S.health = Math.max(0, health() - f.hits); save(); SFX.thwack(.5);
        setHealth(sc.querySelector('.plate.mine'), health(), maxHealth());
        fb.innerHTML += '<br><b>Ouch!</b>';
      }
    }});
}

// Your streak: STREAK dots under your health, one lit for each right answer in a row; all lit, your stick glows (.charged)
// and your next right hit counts POWER times over, then they go out again, as they do with a wrong answer.
const STREAK = 3, POWER = 3;
const streakHTML = n => `<div class="streak" role="img" aria-label="Right in a row: ${Math.min(n, STREAK)} of ${STREAK}">`
  + Array.from({length:STREAK}, (_, i) => `<i class="pip${i < n ? ' on' : ''}"></i>`).join('') + '</div>';
function showStreak(sc, n){
  const el = sc.querySelector('.streak'); if (el) el.outerHTML = streakHTML(n);
  if (n === STREAK){ sc.classList.add('charged'); SFX.chime(); }
  if (n === 0) sc.classList.remove('charged');
}
// The card shakes (a power hit; on the map, a boss rearing up), unless you'd rather things didn't move.
function shake(){
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  sheet.classList.remove('shaking'); void sheet.offsetWidth; sheet.classList.add('shaking');
  setTimeout(() => sheet.classList.remove('shaking'), 500);
}
// A boss asks the words you know least well (the front of the review list), as the school's exam does: not the same
// one twice running.
let lastWeakest = null;
function weakest(avoid){
  const ws = reviewOrder(picWords().filter(w => w !== avoid && lvl(w) >= 1));
  const w = ws.find(x => x !== lastWeakest) || ws[0];
  return lastWeakest = w;
}
// A boss fight has beaten you: Try again (true), straight away, your health full; or Not now (false). What it says: the
// battle's lost (from the story), or the enemy's, and a tip on eating, once you know 吃.
function tryAgain(head, f, opts){
  return new Promise(res => {
    const said = opts.lost || f.lost || `The {${f.word}} is too strong for you this time.`;
    const tip = lvl('吃') >= 1 ? `<p class="prompt">${esc(fill('When your health is low, {吃|eat} something from your bag on your turn.'))}</p>` : '';
    openCard(`${head}<p class="label center">Ouch!</p><p class="endmsg">${esc(fill(said))} Your health is full again.</p>${tip}
      <div class="actions"><button class="btn" data-a="back" data-b>Not now</button><button class="btn primary" data-a="ok">Try again</button></div>`);
    on('[data-a=ok]', () => { closeCard(); res(true); });
    on('[data-a=back]', () => { closeCard(); res(false); });
  });
}

// A boss rears up (the scene's .rear: it leaps up big and lands), with its cry (cry, such as ROAR!) and a rumble, and the
// card shakes as it lands, so the shake goes with something you see (decided 3 November 2026, after playing it: a shake
// on its own, as the battle began, looked odd).
function rears(f){
  const sc = sheet.querySelector('.scene'); if (!sc) return;
  sc.querySelector('.fx').textContent = f.cry || '';
  SFX.rumble(); setTimeout(shake, 380);
}
// What a boss says (its says: meet, angry, beaten, each a line of the area's lines), shown at the top of its card, its
// English as a line's is (heardLine, js/state.js: then behind English), and said aloud; tap 🔊 to hear it again.
const bossLine = (f, when) => f.says && f.says[when] && L[f.says[when]] || null;
function bossLineHTML(line, img){
  const first = heardLine(line.t);   // (its English the first three times, and after a day away)
  return `<div class="bossline">${lineHTML(line.t)}<div class="gloss"></div>`
    + `<div class="blfoot"><div class="sentence-en"${first ? '' : ' hidden'}>${esc(line.en)}</div><button class="tbtn" data-a="sayline" aria-label="Hear it again">🔊</button>${first ? '' : '<button class="tbtn" data-a="blen">English</button>'}</div></div>`;
}
function speakLine(line){
  const text = line.t.join('');
  say(text);
  const b = sheet.querySelector('[data-a=sayline]'); if (b) b.onclick = () => say(text);
  const en = sheet.querySelector('[data-a=blen]'); if (en) en.onclick = () => { sheet.querySelector('.bossline .sentence-en').hidden = false; en.remove(); };
}
// A big boss's name across the screen as the fight begins (nameCard), over the map, as in Pokémon: its picture, and its
// name in Chinese and pinyin (never its English, as at any animal's meeting).
async function bossNameCard(f, img){
  const wrap = document.querySelector('#screenWrap'); if (!wrap || typeof document.createElement !== 'function') return;
  const d = document.createElement('div'); d.className = 'bosstitle';
  d.innerHTML = `<div class="band">${img}<div class="bt"><div class="bk">Boss fight!</div><div class="bz">${foeZh(f)} <span>${foePy(f)}</span></div></div></div>`;
  wrap.appendChild(d); SFX.drum(); setTimeout(() => SFX.drum(), 180);
  await sleep(1700);
  d.classList.add('out'); await sleep(260); d.remove();
}
