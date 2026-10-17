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
// phone held sideways), and sizes for pictures (--pic-face and so on) that give each of their 16 art pixels
// a whole number of the screen's real pixels, so they stay sharp.
function screenSizes(h, dpr = 1){
  const fs = clamp(h / 20, 13, 18);
  const art = k => Math.max(16, Math.round(fs * k * dpr / 16) * 16) / dpr;
  return {fs: +fs.toFixed(1), face: art(1.7), small: art(2), mid: art(3), scene: art(4), big: art(6)};
}
function sizeText(h){
  const root = document.documentElement, s = screenSizes(h, window.devicePixelRatio || 1);
  if (!root) return;   // (the tests' pretend page has none)
  root.style.fontSize = s.fs + 'px';
  for (const k of ['face', 'small', 'mid', 'scene', 'big']) root.style.setProperty('--pic-' + k, s[k] + 'px');
}
let introClock = 0, introLast = 0, capIdx = -1, capShownAt = 0, introEvents = {}, advancedTo = 0;
function frame(now){
  if (mode === 'title') drawScene(0, now);
  else if (mode === 'intro'){
    // The scene waits at each sentence until the player presses Next.
    const dt = Math.min(.05, (now - introLast) / 1000); introLast = now;
    let nt = introClock + dt;
    const next = CAPS[capIdx + 1];
    if (next && nt >= next.t && advancedTo < capIdx + 1) nt = Math.max(introClock, next.t - .001);
    introClock = nt;
    const t = introClock;
    drawScene(t, now);
    const ci = CAPS.reduce((a, c, i) => t >= c.t ? i : a, 0);
    if (ci !== capIdx){ capIdx = ci; capShownAt = now; showCaption(CAPS[ci], ci === CAPS.length - 1); }
    const ev = (k, at, fn) => { if (t >= at && !introEvents[k]){ introEvents[k] = 1; fn(); } };
    ev('r', 7.2, SFX.rumble); ev('c', 8.7, SFX.chime); ev('s', 10.6, SFX.shimmer);
  } else { update(now); drawWorld(now); }
  updateCtx(now); updateTips(now);
  sc.imageSmoothingEnabled = false;
  sc.drawImage(buf, 0, 0, cv.width, cv.height);
  requestAnimationFrame(frame);
}
// A caption of the opening: its English, and its word (if it has one) in Chinese, pinyin and English, said aloud.
function showCaption(c, last){
  const w = c.word, [py, en] = w ? info(w) : [];
  const box = $('#capbox');   // over the sky in the picture, so the page keeps its size
  box.innerHTML = `<div class="cap"><div class="cen">${esc(c.en)}</div>${w ? `<button class="wchip" id="capWord"><span class="wzh">${w}</span>${S.pinyin ? `<span class="wpy">${py}</span>` : ''}<span class="wen">${esc(en.split(',')[0])}</span> 🔊</button>` : ''}</div>
    <div class="caprow"><button class="btn" id="skipBtn">Skip intro</button><span class="spacer"></span>${last ? '<button class="btn primary" id="beginBtn">Begin</button>' : '<button class="btn primary" id="nextBtn">Next</button>'}</div>`;
  box.hidden = false;
  if (w){ say(w); $('#capWord').onclick = () => say(w); }
  $('#skipBtn').onclick = startGame;
  const nx = $('#nextBtn'); if (nx) nx.onclick = () => { advancedTo = capIdx + 1; SFX.blip(); };
  const bb = $('#beginBtn'); if (bb) bb.onclick = startGame;
}
let lastCtx = null;
function currentPrompt(now){
  if (mode !== 'play' || !modal.hidden || busy || pl.mv || held || now - lastMoveEnd < 250) return '';
  const [fx, fy] = facing(); return promptFor(fx, fy);
}
function buttonLabels(now){
  if (!modal.hidden){
    const f = document.activeElement, primary = [...sheet.querySelectorAll('.primary')].find(x => !x.hidden && !x.disabled);
    const focused = sheet.querySelector('.menu') && f && sheet.contains(f) && f.matches(NAV_SEL) ? f : primary;
    const bb = sheet.querySelector('[data-b]');
    return [btnLabel(focused), bb && bb.offsetParent !== null ? btnLabel(bb) : ''];
  }
  if (talkNext){ const ok = talkBox.querySelector('[data-a=ok]'); return [ok ? btnLabel(ok) : 'Say it', '']; }
  if (mode === 'title') return [S.started ? 'Continue' : 'Start', ''];
  if (mode === 'intro') return [$('#beginBtn') ? 'Begin' : 'Next', 'Skip'];
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
  if (mode !== 'play') return;
  const tasks = getTasks();
  $('#selectDot').hidden = !tasks.some(t => !S.tasksRead[t.id]);
  const fresh = tasks.filter(t => !S.tasksSeen[t.id]);
  if (!fresh.length) return;
  if (!canAct() || !$('#saybox').hidden) return;
  fresh.forEach(t => { S.tasksSeen[t.id] = 1; });
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e) {}
  if (S.started){ SFX.chime(); toast('New task: ' + fresh[0].text + (fresh.length > 1 ? ` (and ${fresh.length - 1} more)` : '')); }
}
function titleText(){   // the title screen's words, under its buttons, with a short warning if there's no Chinese voice (and how to fix it on a card)
  const problem = voiceProblem();
  const due = dueWords().length;
  $('#titleText').innerHTML = `<p id="goal">${S.started ? 'Welcome back, little monkey.' + (due ? ` ${due} ${due === 1 ? 'word is' : 'words are'} due for review: practise at the practice post, or meet animals in the tall grass.` : '') : 'Turn your sound on. Every word is spoken aloud using your device’s Chinese voice.'}</p>`
    + (problem ? `<p class="small warn">${VOICE_SHORT[problem]} <button class="linkbtn" id="voiceHelp">How to fix it</button></p>` : '');
  const vh = $('#voiceHelp');
  if (vh) vh.onclick = () => { openCard(`<p class="label">Hearing Chinese</p><p>${VOICE_HELP[problem]}</p><div class="actions"><button class="btn primary" data-a="ok" data-b>OK</button></div>`); on('[data-a=ok]', closeCard); };
}
try { speechSynthesis.addEventListener('voiceschanged', () => { if (mode === 'title') titleText(); }); } catch(e) {}   // voices can arrive late
function toTitle(){
  mode = 'title'; musicStop(); $('#capbox').hidden = true;
  $('#titlecard').hidden = false;
  $('#areaName').textContent = AREA.name.en;
  const tbn = $('#titleButtons');
  tbn.innerHTML = S.started
    ? '<button class="btn primary" id="contBtn">Continue</button><button class="btn" id="watchBtn">Watch the opening</button>'
    : '<button class="btn primary" id="newBtn">Start</button>';
  titleText();
  const go = fn => () => { getAC(); unlockSpeech(); musicStart(); fn(); };
  if ($('#newBtn')) $('#newBtn').onclick = go(playIntro);
  if ($('#watchBtn')) $('#watchBtn').onclick = go(playIntro);
  if ($('#contBtn')) $('#contBtn').onclick = go(() => {
    $('#titlecard').hidden = true; placePlayer(); mode = 'play'; updateHUD();
  });
}
function playIntro(){
  $('#titlecard').hidden = true;
  mode = 'intro'; introClock = 0; introLast = performance.now(); capIdx = -1; introEvents = {}; advancedTo = 0;
}
function howToPlay(){
  return new Promise(res => {
    const pages = [
      `<p class="label">How to play · 1 of 2</p>
       <ul class="howto">
         <li><span class="kbd pad">✚</span><span><b>Walk</b> by holding a direction. Tap it to turn on the spot. You can slide your thumb between directions.</span></li>
         <li><span class="kbd a">A</span><span><b>Talk, look and choose.</b> When someone talks, A moves on. On cards, A presses the button with the red A badge.</span></li>
         <li><span class="kbd b">B</span><span><b>Back.</b> Closes a card or message, pressing the button with the blue B badge.</span></li>
         <li><span class="kbd menu">☰</span><span><b>Start</b> opens the menu: the Word Scroll, friends and settings. <b>Select</b> shows your tasks.</span></li>
       </ul>
       <p class="small">Answers and words in sentences are simply tapped.</p>`,
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
  $('#titlecard').hidden = true; $('#capbox').hidden = true;
  if (firstTime){ S.started = true; S.pos = {place:START.place, x:START.x, y:START.y, dir:START.facing || 'down'}; }
  placePlayer(); mode = 'play'; save(); musicStart();
  if (firstTime){
    busy = true;
    try {
      await runSteps(AREA.begin);   // the area's first steps, such as being born from the stone (tips explain the controls as you need them: js/tips.js)
    } finally { busy = false; updateHUD(); }
  }
}

window.addEventListener('resize', fit);
if (!PLACES[S.pos.place]) S.pos.place = FIRST_PLACE;   // a place that's gone
placeCharacters();   // where the story has put everyone
enterPlace(S.pos.place);
if (!walkable(S.pos.x, S.pos.y)) S.pos = {place:START.place, x:START.x, y:START.y, dir:START.facing || 'down'};   // the map changed under your saved spot
buildMap(); placePlayer(); fit(); updateHUD(); toTitle();
requestAnimationFrame(frame);
// The app (sw.js): lets the game be installed on a phone's home screen, full screen, and played offline.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
