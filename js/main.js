// The screen size, the main loop, new tasks, the title screen, the intro, How to play, and starting the game.

/* ================= SCREEN, LOOP, MODES ================= */
// The console is a Game Boy Advance held sideways: the screen in the middle, the D-pad, Select and Start on
// the left, A and B on the right. Each side is SIDE_WING wide (as .console is in css/game.css), and the
// screen is as big as fits between them. When the window is taller than it is wide (a phone held
// upright), a card asks you to turn it, and the game waits.
const SIDE_WING = 150;
let upright = false;
function fit(){
  upright = window.innerWidth <= window.innerHeight;
  $('#turn').hidden = !upright;
  $('.app').hidden = upright;
  if (upright) return;
  // The room left for the screen: the window, less the two sides, the edges, the phone's safe areas and
  // the keyboard help (on a computer).
  const style = el => (window.getComputedStyle ? getComputedStyle(el) : {});
  const px = (s, ...sides) => sides.reduce((n, k) => n + (parseFloat(s[k]) || 0), 0);   // (a missing size counts as 0)
  // Measured twice: the text follows the screen's size (sizeText), and on a computer the keyboard help under
  // the console changes height with it.
  let w = 0, h = 0;
  for (let pass = 0; pass < 2; pass++){
    const page = style(document.documentElement), app = style($('.app')), con = style($('.console')), edge = style($('.screen')), keys = $('.keys');
    const roomW = window.innerWidth - px(page, 'paddingLeft', 'paddingRight') - px(app, 'paddingLeft', 'paddingRight')
      - px(con, 'paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth') - 2 * SIDE_WING - px(edge, 'paddingLeft', 'paddingRight');
    const roomH = window.innerHeight - px(page, 'paddingTop', 'paddingBottom') - px(app, 'paddingTop', 'paddingBottom')
      - px(con, 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth') - px(edge, 'paddingTop', 'paddingBottom')
      - (+keys.offsetHeight || 0) - px(style(keys), 'marginTop', 'marginBottom');
    w = Math.floor(clamp(Math.min(roomW, roomH * VW / VH), 220, 720)); h = Math.round(w * VH / VW);
    sizeText(h);
  }
  const dpr = window.devicePixelRatio || 1;
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  sc.imageSmoothingEnabled = false;
}
// Text and pictures follow the screen's height, so the same layout fits a small phone and a computer: the
// page's text size (everything in css/game.css sized in rem), from 13px to 18px (16px on a typical Android
// phone held sideways), and sizes for pictures (--pic-face and so on) that give each of their 32 pixels
// a whole number of the screen's real pixels, so they stay sharp.
function screenSizes(h, dpr = 1){
  const fs = clamp(h / 20, 13, 18);
  const art = (k, px = 32) => Math.max(px, Math.round(fs * k * dpr / px) * px) / dpr;
  return {fs: +fs.toFixed(1), face: art(1.7), small: art(2), mid: art(3), scene: art(4), big: art(6), icon: art(1.15, 16)};   // icon: for the 16-pixel icons, about the text's size
}
function sizeText(h){
  const root = document.documentElement, s = screenSizes(h, window.devicePixelRatio || 1);
  if (!root) return;   // (the tests' pretend page has none)
  root.style.fontSize = s.fs + 'px';
  for (const k of ['face', 'small', 'mid', 'scene', 'big', 'icon']) root.style.setProperty('--pic-' + k, s[k] + 'px');
}
// Scenes told with pictures and captions: the opening, and the area's other scenes (AREA.scenes), such as becoming king.
// Each has its captions, its pictures (drawn by js/draw.js to match the captions' times), its sounds (at those times), the
// label on its last button, and what happens when it ends (Skip, or that last button).
const SCENE_SOUNDS = {opening:[[7.2, 'rumble'], [8.7, 'chime'], [10.6, 'shimmer']], becomingKing:[[5.5, 'chime'], [8, 'fanfare'], [11, 'shimmer']],
  buildingSchool:[[1, 'tock'], [1.3, 'tock'], [1.6, 'tock'], [1.9, 'tock'], [2.3, 'tock'], [2.7, 'tock'], [3.6, 'thwack'], [4.2, 'thwack'], [4.8, 'thwack'], [5.4, 'thwack'], [6.6, 'thwack'], [7.3, 'thwack'], [8, 'thwack'], [9.05, 'fanfare'], [9.6, 'chime']],
  paintingSchool:[[.9, 'swish'], [1.5, 'swish'], [2.1, 'swish'], [2.7, 'swish'], [3.3, 'swish'], [4.4, 'fanfare'], [4.9, 'chime']]};
let scene = {id:'opening', caps:CAPS, last:'Begin', end:() => startGame()};
let introClock = 0, introLast = 0, capIdx = -1, capShownAt = 0, introEvents = {}, advancedTo = 0;
function frame(now){
  if (mode === 'title') drawScene(0, now);
  else if (mode === 'intro'){
    // The scene waits at each sentence until the player presses Next.
    const dt = Math.min(.05, (now - introLast) / 1000); introLast = now;
    let nt = introClock + dt;
    const caps = scene.caps, next = caps[capIdx + 1];
    if (next && nt >= next.t && advancedTo < capIdx + 1) nt = Math.max(introClock, next.t - .001);
    introClock = nt;
    const t = introClock;
    if (scene.id === 'opening') drawScene(t, now, Math.min(1, t / .8));   // the mountain slides to the middle as the story begins
    else SCENE_ART[scene.art || scene.id](t, now, scene.def);
    const ci = caps.reduce((a, c, i) => t >= c.t ? i : a, 0);
    if (ci !== capIdx){ capIdx = ci; capShownAt = now; showCaption(caps[ci], ci === caps.length - 1); }
    for (const [at, sound] of SCENE_SOUNDS[scene.art || scene.id] || []) if (t >= at && !introEvents[at]){ introEvents[at] = 1; SFX[sound](); }
  } else { update(now); drawWorld(now); ambience(now); }
  updateCtx(now); updateTips(now);
  sc.imageSmoothingEnabled = false;
  sc.drawImage(buf, 0, 0, cv.width, cv.height);
  requestAnimationFrame(frame);
}
// A caption of the opening, as subtitles over the bottom of the picture: the story in Chinese, read aloud, with pinyin
// over each word (unless that's switched off; tap a word for its meaning) and its English; 🔊 reads it again. Skip is
// in the top corner.
const capSaid = c => c.words.join('');
function showCaption(c, last){
  const box = $('#capbox');
  box.innerHTML = pixelIcons(`<div class="cap">${lineHTML(c.words, c.teach)}<div class="gloss"></div><div class="cen">${esc(c.en)}</div></div>
    <div class="caprow"><button class="btn" id="againBtn" aria-label="Hear it again">🔊</button>${last ? `<button class="btn primary" id="beginBtn">${esc(scene.last)}</button>` : '<button class="btn primary" id="nextBtn">Next</button>'}</div>`);
  box.hidden = false; $('#skipBtn').hidden = false;
  bindTokens(box);
  say(capSaid(c)); $('#againBtn').onclick = () => say(capSaid(c));
  $('#skipBtn').onclick = scene.end;
  const nx = $('#nextBtn'); if (nx) nx.onclick = () => { advancedTo = capIdx + 1; SFX.blip(); };
  const bb = $('#beginBtn'); if (bb) bb.onclick = scene.end;
}
let lastCtx = null;
function currentPrompt(now){   // (nothing while a new message is up, or what you're facing has just finished: js/input.js)
  if (mode !== 'play' || !modal.hidden || busy || pl.mv || held || now - lastMoveEnd < 250 || newMessage()) return '';
  const [fx, fy] = facing(); return justFinished(fx, fy) ? '' : promptFor(fx, fy);
}
function buttonLabels(now){
  if (!modal.hidden){
    const f = chosenBtn(), primary = [...sheet.querySelectorAll('.primary')].find(x => !x.hidden && !x.disabled);
    const focused = sheet.querySelector(NAVIGABLE) && f ? f : primary;
    const bb = sheet.querySelector('[data-b]');
    return [btnLabel(focused), bb && bb.offsetParent !== null ? btnLabel(bb) : ''];
  }
  if (talkNext){ const ok = talkBox.querySelector('[data-a=ok]'); return [ok ? btnLabel(ok) : 'Say it', '']; }
  if (mode === 'title'){ const s = $('#titleButtons').querySelector('.sel'); return [s ? btnLabel(s) : 'Choose', '']; }
  if (mode === 'intro') return [$('#beginBtn') ? scene.last : 'Next', 'Skip'];
  if (canAct() && newMessage()) return ['OK', 'Close'];   // A closes a message that's just come up
  return [currentPrompt(now), !$('#saybox').hidden ? 'Close' : ''];
}
let lastLabels = '';
function updateCtx(now){
  const [a, bl] = buttonLabels(now), key = a + '|' + bl;
  if (key === lastLabels) return;
  lastLabels = key; $('#aLabel').textContent = a; $('#bLabel').textContent = bl;
  $('#btnA').classList.toggle('ready', mode === 'play' && modal.hidden && !talkNext && !!a);
}
// After anything happens. Select has a red dot while there's a task you haven't looked at in your task
// list, and a new task is announced with a message once you're free and the last message has gone (this
// runs again when it goes: see toast in js/helpers.js).
function updateHUD(){
  const hud = $('#hud');   // your hearts, at the top of the screen while you're hurt
  if (hud){ hud.hidden = mode !== 'play' || (S.hearts ?? HEARTS) >= HEARTS; if (!hud.hidden) hud.innerHTML = heartsHTML(S.hearts, HEARTS); }
  if (mode !== 'play') return;
  const tasks = getTasks();
  $('#selectDot').hidden = !tasks.some(t => !S.tasksRead[t.id]);
  const fresh = tasks.filter(t => !S.tasksSeen[t.id]);
  if (!fresh.length) return;
  if (!canAct() || !$('#saybox').hidden) return;
  fresh.forEach(t => { S.tasksSeen[t.id] = 1; });
  try { localStorage.setItem(slotKey(SLOT), JSON.stringify(S)); } catch(e) {}
  if (S.started){ SFX.chime(); toast('New task: ' + fresh[0].text + (fresh.length > 1 ? ` (and ${fresh.length - 1} more)` : '')); }
}
function titleText(){   // the title screen's words, under its name: for a first game, to turn the sound on, a short warning if there's no Chinese voice (and how to fix it on a card), and on a phone's browser, Play full screen (js/fullscreen.js)
  const problem = voiceProblem(), first = !SLOTS.some(slotSummary);
  $('#titleText').innerHTML = pixelIcons((first && !problem ? '<p id="goal">Turn your sound on: every word is spoken aloud.</p>' : '')
    + (problem ? `<p class="small warn">${VOICE_SHORT[problem]} <button class="linkbtn" id="voiceHelp">How to fix it</button></p>` : '')
    + fullscreenHTML());   // (⛶, as a pixel icon)
  wireFullscreen();
  const vh = $('#voiceHelp');
  if (vh) vh.onclick = () => { openCard(`<p class="label">Hearing Chinese</p><p>${VOICE_HELP[problem]}</p><div class="actions"><button class="btn primary" data-a="ok" data-b>OK</button></div>`); on('[data-a=ok]', closeCard); };
}
try { speechSynthesis.addEventListener('voiceschanged', () => { if (mode === 'title') titleText(); }); } catch(e) {}   // voices can arrive late
// The title screen: Continue (the game you played last), New game (in an empty game) and Save files (your three games;
// each game's card has Continue, Copy to a file and Delete, or New game and Load from a file). The D-pad moves between
// the buttons and A presses the chosen one. The first time, there's New game and Save files.
let titleSel = 0;
const go = fn => () => { getAC(); unlockSpeech(); musicStart(); keepSaves(); fn(); };   // (sound can only start from a tap)
// Asks the browser to keep your saved games for good, rather than clear them to make room, once you play.
const keepSaves = () => { try { navigator.storage.persist().catch(() => {}); } catch(e) {} };
const ago = t => { const d = Math.floor((Date.now() - t) / 86400000); return !t ? '' : d < 1 ? 'today' : d < 2 ? 'yesterday' : `${d} days ago`; };
const faceHTML = () => `<img class="face" alt="" src="${monkeySprite('player', 'down', false, 0).toDataURL()}">`;
const lastPlayed = () => { const p = slotsInfo().played || {}; return SLOTS.filter(slotSummary).sort((a, c) => (p[c] || 0) - (p[a] || 0) || a - c)[0] || null; };
// The game's name, shown as names are in the game: its Chinese, with pinyin over each word (unless it's off), and under
// it its English, which says what the Chinese means. The area's own name has a label of its own in the corner, as a
// place's name shows when you arrive (decided 21 October 2026: under 小猴子 was Flower Fruit Mountain, the area's
// English name, as if that were what 小猴子 meant).
const GAME_NAME = {zh: [['小', 'xiǎo'], ['猴子', 'hóuzi']], en: 'Little Monkey'};
function toTitle(){
  mode = 'title'; musicStop(); $('#capbox').hidden = true; $('#skipBtn').hidden = true;
  $('#titlecard').hidden = false;
  $('#gameName').innerHTML = GAME_NAME.zh.map(([w, py]) => `<ruby>${w}<rt${S.pinyin ? '' : ' class="hid"'}>${py}</rt></ruby>`).join('');
  $('#gameEn').textContent = GAME_NAME.en;
  $('#titleArea').innerHTML = `<span class="pzh">${AREA.name.zh}</span> <span class="ppy">${AREA.name.py}</span><span class="pen">${esc(AREA.name.en)}</span>`;
  $('#version').textContent = 'v' + VERSION;
  const n = lastPlayed(), g = n && slotSummary(n), empty = SLOTS.find(k => !slotSummary(k));
  $('#titleButtons').innerHTML = (g ? `<button class="btn big primary" id="contBtn" data-label="Continue">Continue<span class="sub">Game ${n} · ${g.words} ${g.words === 1 ? 'word' : 'words'}${g.played ? ' · played ' + ago(g.played) : ''}</span></button>` : '')
    + `<button class="btn big${g ? '' : ' primary'}" id="newBtn" data-label="New game">New game<span class="sub">${!g ? 'Start the story' : empty ? 'In an empty game' : 'Your 3 games are in use'}</span></button>`
    + `<button class="btn big" id="filesBtn" data-label="Save files">Save files<span class="sub">${g ? 'Your 3 games' : 'Load a game from a file'}</span></button>`;
  const tb = $('#titleButtons');
  if (g) tb.querySelector('#contBtn').onclick = go(() => continueGame(n));
  tb.querySelector('#newBtn').onclick = () => { SFX.blip(); if (empty) go(() => { newGameIn(empty); setUpGame(); playIntro(); })(); else filesCard('full'); };
  tb.querySelector('#filesBtn').onclick = () => { SFX.blip(); filesCard(); };
  titleSel = 0; markTitle();
  titleText();
}
function markTitle(){ $('#titleButtons').querySelectorAll('.btn').forEach((b, i) => b.classList.toggle('sel', i === titleSel)); }
function moveTitle(d){   // the D-pad on the title screen: between its buttons
  const n = $('#titleButtons').querySelectorAll('.btn').length, i = titleSel + (d === 'left' || d === 'up' ? -1 : 1);
  if (i >= 0 && i < n){ titleSel = i; markTitle(); SFX.blip(); }
}
function continueGame(n){   // play game n from where you left off
  if (n !== SLOT){ useSlot(n); setUpGame(); }
  closeCard(); $('#titlecard').hidden = true; placePlayer(); mode = 'play'; updateHUD();
}
// Save files: your three games, each with its words, friends, chapter and when you last played; choosing one opens its
// card. full: New game found no empty game, so it says how to make room. pick: the game to start on.
function filesCard(full, pick){
  const row = n => { const g = slotSummary(n); return g
    ? `<button class="btn slotrow" data-slot="${n}" data-label="Choose">${faceHTML()}<span class="gt"><b>Game ${n}</b><span>${g.words} ${g.words === 1 ? 'word' : 'words'} · ${g.friends} ${g.friends === 1 ? 'friend' : 'friends'} · ${esc(g.chapter.name)}${g.played ? ' · ' + ago(g.played) : ''}</span></span></button>`
    : `<button class="btn slotrow empty" data-slot="${n}" data-label="Choose"><span class="face"></span><span class="gt"><b>Game ${n}</b><span>Empty: start a new game here, or load one</span></span></button>`; };
  openCard(`<div class="files"><p class="label">Save files</p><p class="small">${full === 'full'
      ? 'All three games are in use. To start a new one, choose a game and delete it (copy it to a file first if you want to keep it).'
      : 'Choose a game to play it, copy it to a file or delete it. An empty one starts a new game, or loads one from a file.'}</p>
    <div class="menu">${SLOTS.map(row).join('')}</div></div><div class="actions"><button class="btn" data-a="back" data-b>Back</button></div>`);
  sheet.querySelectorAll('.slotrow').forEach(b => b.onclick = () => { SFX.blip(); slotCard(+b.dataset.slot); });
  on('[data-a=back]', () => { closeCard(); toTitle(); });
  (sheet.querySelector(`.slotrow[data-slot="${pick}"]`) || sheet.querySelector('.slotrow')).focus();
}
// A game's card: what's in it, then Continue, Copy to a file or Delete; or, for an empty slot, New game or Load from a file.
function slotCard(n){
  const g = slotSummary(n);
  if (!g){
    openCard(`<div class="who" aria-hidden="true">💾</div><p class="label">Game ${n} · empty</p><p>Start a new game here, or load one from a file: a game copied from another phone, or a backup.</p>
      <input type="file" accept=".json,application/json" hidden>
      <div class="actions" data-nav><button class="btn" data-a="back" data-b>Back</button><button class="btn" data-a="load">Load from a file</button><button class="btn primary" id="newBtn">New game</button></div>`);
    on('[data-a=back]', () => filesCard(null, n));
    sheet.querySelector('#newBtn').onclick = go(() => { newGameIn(n); setUpGame(); closeCard(); playIntro(); });
    sheet.querySelector('#newBtn').focus();
    const pick = sheet.querySelector('input[type=file]');
    on('[data-a=load]', () => pick.click());
    pick.onchange = async () => {
      const file = pick.files[0]; if (!file) return;
      const r = readSaveFile(await file.text());
      if (r.error){ infoBox('💾', `<p>${esc(r.error)}</p>`).then(() => slotCard(n)); return; }
      useSave(r.save, n); setUpGame(); toTitle(); filesCard(null, n); toast(`Loaded into Game ${n}.`);
    };
    return;
  }
  const practise = g.practise ? `<p>${g.practise} ${g.practise === 1 ? 'word needs' : 'words need'} practice: practise ${esc(g.where)}, or meet animals in the tall grass.</p>` : '';
  const friends = `${g.friends} ${g.friends === 1 ? 'friend' : 'friends'}`;
  openCard(`<p class="label">Game ${n}</p><div class="slotcard">${faceHTML()}<div><p><b>${g.words} ${g.words === 1 ? 'word' : 'words'}</b> · ${friends} · ${g.shells} 🐚</p>
      <p>${esc(AREA.name.en)} · ${esc(g.chapter.name)}: ${esc(g.chapter.title)}</p>${practise}${g.played ? `<p class="small played">Last played ${ago(g.played)}. It saves by itself as you play.</p>` : ''}</div></div>
    <div class="actions" data-nav><button class="btn danger" data-a="del">Delete</button><button class="btn" data-a="copy">Copy to a file</button><button class="btn" data-a="back" data-b>Back</button><button class="btn primary" id="contBtn">Continue</button></div>`);
  on('[data-a=back]', () => filesCard(null, n));
  sheet.querySelector('#contBtn').focus();   // the arrows move from here
  sheet.querySelector('#contBtn').onclick = go(() => continueGame(n));
  on('[data-a=copy]', () => {
    const f = saveFile(n), a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([f.text], {type:'application/json'})); a.download = f.name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000);   // (an iPhone asks before it downloads: the file waits a minute)
    toast(`Copied Game ${n} to ${f.name}`);
  });
  on('[data-a=del]', () => {
    openCard(`<p class="label">Delete Game ${n}?</p><div class="slotcard">${faceHTML()}<div><p>${g.words} ${g.words === 1 ? 'word' : 'words'} · ${friends}</p><p>${esc(AREA.name.en)} · ${esc(g.chapter.name)}</p>
        <p class="small">Everything in this game is erased from this phone. To keep a copy, copy it to a file first.</p></div></div>
      <div class="actions"><button class="btn danger" data-a="yes">Delete it</button><button class="btn primary" data-a="no" data-b>Keep it</button></div>`);
    on('[data-a=no]', () => slotCard(n));
    on('[data-a=yes]', () => { deleteSlot(n); if (n === SLOT) setUpGame(); toTitle(); filesCard(null, n); toast(`Game ${n} is deleted.`); });
  });
}
function playScene(s){
  scene = s;
  $('#titlecard').hidden = true; $('#saybox').hidden = true;   // (it covers any message that was showing)
  mode = 'intro'; introClock = 0; introLast = performance.now(); capIdx = -1; introEvents = {}; advancedTo = 0;
}
function playIntro(){ playScene({id:'opening', caps:CAPS, last:'Begin', end:() => startGame()}); }
// One of the area's other scenes (AREA.scenes), in the story (the scene step), after a lesson, or watched again from
// Settings: once it ends, you're back where you were. Its pictures are its art, if it has one (several scenes can share
// one, such as painting each part of the school), drawn with the scene's own settings (def).
function storyScene(id){
  return new Promise(res => {
    let ended = false;
    const def = AREA.scenes[id];
    playScene({id, art:def.art || id, def, caps:sceneCaps(def.captions), last:'OK', end:() => {
      if (ended) return; ended = true;
      stopSpeech(); $('#capbox').hidden = true; $('#skipBtn').hidden = true; mode = 'play'; res();
    }});
  });
}
function howToPlay(){
  return new Promise(res => {
    const pages = [
      `<p class="label">How to play · 1 of 2</p>
       <ul class="howto">
         <li><span class="kbd pad">✚</span><span><b>Walk</b> by holding a direction. Tap it to turn on the spot. You can slide your thumb between directions.</span></li>
         <li><span class="kbd a">A</span><span><b>Talk, look and choose.</b> When someone talks, A moves on. On cards, A presses the button with the red A badge.</span></li>
         <li><span class="kbd b">B</span><span><b>Back.</b> Closes a card or message, pressing the button with the blue B badge.</span></li>
         <li><span class="kbd menu">☰</span><span><b>Menu</b> opens the menu: the Word Scroll, friends and settings. <b>Tasks</b> shows your tasks.</span></li>
       </ul>
       <p class="small">Tap an answer, or choose it with the D-pad and A. A keyboard or a game controller works too.</p>`,
      `<p class="label">How to play · 2 of 2</p>
       <p>You’ll hear lots of Chinese, like a baby monkey listening to the forest. <b>You don’t need to understand or remember all of it.</b></p>
       <div class="example">${lineOf(['我','渴','了','。','我','要','喝','水','！'], t => {
         const c = {'我':'learn', '要':'learn', '喝':'learn teach'}[t] || 'listen';
         return PUNCT.has(t) ? `<span class="punct">${t}</span>` : `<button class="tok ${c}" data-t="${t}"><ruby>${t}<rt class="${S.pinyin ? '' : 'hid'}">${info(t)[0]}</rt></ruby></button>`; })}</div>
       <ul class="howto">
         <li><span class="dot learn"></span><span><b>Green words</b> are ones you’ve already learned.</span></li>
         <li><span class="dot teach"></span><span>A <b>bold green word</b> is the new one you’re learning right now.</span></li>
         <li><span class="dot listen"></span><span><b>Grey words</b> are just for listening. Tap one if you’re curious, then let it go.</span></li>
         <li><span class="dot star">⭐</span><span>Only words on a <b>New word to learn</b> card go into your Word Scroll.</span></li>
       </ul>
       <p class="small">The first time you see a sentence, its English is shown underneath. After that, tap English if you need it.</p>
       <p class="small">When someone talks to you, you can reply in Chinese. Each choice shows its English too; if you know some Chinese already, turn that off in Settings, English on replies.</p>`
    ];
    let i = 0;
    const show = () => {
      openCard(`${pages[i]}<div class="gloss"></div><div class="actions">${i > 0 ? '<button class="btn" data-a="back" data-b>Back</button>' : ''}<button class="btn primary" data-a="next">${i < pages.length - 1 ? 'Next' : 'Got it'}</button></div>`);
      bindTokens(sheet);
      on('[data-a=back]', () => { i--; show(); });
      on('[data-a=next]', () => { if (i < pages.length - 1){ i++; show(); } else { S.howto = true; save(); closeCard(); res(); } });
    };
    show();
  });
}
async function startGame(){
  stopSpeech();
  const firstTime = !S.started;
  $('#titlecard').hidden = true; $('#capbox').hidden = true; $('#skipBtn').hidden = true;
  if (firstTime){ S.started = true; S.pos = {place:START.place, x:START.x, y:START.y, dir:START.facing || 'down'}; }
  placePlayer(); mode = 'play'; save(); musicStart();
  if (firstTime){
    busy = true;
    try {
      await runSteps(AREA.begin);   // the area's first steps, such as being born from the stone (tips explain the controls as you need them: js/tips.js)
    } finally { busy = false; updateHUD(); }
  }
}

// The game as S has it (at the start, or after switching games): where everyone is, the place you're in and its map.
function setUpGame(){
  if (!PLACES[S.pos.place]) S.pos.place = FIRST_PLACE;   // a place that's gone
  placeCharacters();   // where the story has put everyone
  enterPlace(S.pos.place);
  if (!walkable(S.pos.x, S.pos.y)) S.pos = (S.pos.place !== START.place && wayInto(S.pos.place)) || {place:START.place, x:START.x, y:START.y, dir:START.facing || 'down'};   // the map changed under your saved spot
  buildMap(); placePlayer(); updateHUD();
}
// Where you come into a place (where the first way into it from another place puts you), such as the pine wood's way in
// from the home ground: if a place's map has changed under your saved spot, you start there, not back at the very start.
function wayInto(place){
  for (const p of Object.values(PLACES)) for (const e of p.exits || []) if (e.to === place) return {place, x:e.arrive[0], y:e.arrive[1], dir:e.facing || 'down'};
  return null;
}
window.addEventListener('resize', fit);
// Then the start-up screen (in index.html) goes, and the console shows, its full size, with the whole title. (It goes even
// if setting up fails, so it never says the connection is slow when it isn't.)
try { setUpGame(); fit(); toTitle(); }
finally { if (document.documentElement) document.documentElement.classList.remove('loading'); }
requestAnimationFrame(frame);
// The app (sw.js): lets the game be installed on a phone's home screen, full screen, and played offline.
// Once it's ready, it's given the game's own files to keep (the first time, the page loaded before it was there to
// keep them), and every voice clip, so all the Chinese can be heard offline too.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(() => {});
  const ownFiles = () => ['./', ...[...document.querySelectorAll('script[src], link[href]')].map(el => el.src || el.href)
    .filter(u => new URL(u, location.href).origin === location.origin)];   // the page, its scripts, styles, icons and app description
  const clips = () => typeof VOICE_CLIPS === 'undefined' ? [] : Object.entries(VOICE_CLIPS).flatMap(([v, c]) => Object.values(c).map(code => `audio/${v}/${code}.mp3`));
  const keep = () => navigator.serviceWorker.ready.then(r => r.active && r.active.postMessage({keepFiles:ownFiles(), keepClips:clips()})).catch(() => {});
  keep(); navigator.serviceWorker.addEventListener('controllerchange', keep);   // and again when a new version takes over
}
