// The screen size, the main loop, the text box, the title screen, the intro, How to play, and starting the game.

/* ================= SCREEN, LOOP, MODES ================= */
function fit(){
  const shell = $('.console');
  const innerW = shell.clientWidth - 24 - 16;
  const reserve = 365;
  const byH = (window.innerHeight - reserve) * (VW / VH);
  const w = Math.floor(clamp(Math.min(innerW, byH), 220, 640));
  const h = Math.round(w * VH / VW);
  const dpr = window.devicePixelRatio || 1;
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  sc.imageSmoothingEnabled = false;
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
  updateCtx(now);
  sc.imageSmoothingEnabled = false;
  sc.drawImage(buf, 0, 0, cv.width, cv.height);
  requestAnimationFrame(frame);
}
const tb = $('#textbox');
function showCaption(c, last){
  tb.innerHTML = `<div class="cap"><div class="cpy">${esc(c.py)}</div><div class="czh">${esc(c.zh)}</div><div class="cen">${esc(c.en)}</div></div>
    <div class="caprow"><button class="btn" id="skipBtn">Skip intro</button><span class="spacer"></span><button class="btn" id="againBtn">🔊 Again</button>${last ? '<button class="btn primary" id="beginBtn">Begin</button>' : '<button class="btn primary" id="nextBtn">Next</button>'}</div>`;
  say(c.zh);
  $('#skipBtn').onclick = startGame;
  $('#againBtn').onclick = () => say(c.zh);
  const nx = $('#nextBtn'); if (nx) nx.onclick = () => { advancedTo = capIdx + 1; SFX.blip(); };
  const bb = $('#beginBtn'); if (bb) bb.onclick = startGame;
}
let lastTB = '', lastCtx = null;
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
  if (talkNext) return [btnLabel(talkBox.querySelector('[data-a=ok]')), ''];
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
function updateHUD(){
  $('#level').textContent = 'Lv ' + level();
  $('#peaches').textContent = '🍑 ' + S.peaches;
  $('#count').textContent = ORDER.filter(w => lvl(w) > 0).length + '/' + ORDER.length;
  if (mode !== 'play') return;
  const now = performance.now(), tasks = getTasks();
  if (!S.tasksSeen) S.tasksSeen = {};
  tasks.forEach(t => {
    if (!S.tasksSeen[t.id]){
      S.tasksSeen[t.id] = 1; newTaskUntil[t.id] = now + 7000; setTimeout(updateHUD, 7100);
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e) {}
      if (S.started) setTimeout(() => SFX.chime(), 200);
    }
  });
  const hint = tasksHint();
  const html = `<p class="tbhead">${tasks.length ? 'Tasks' : 'Explore'}</p>` +
    (tasks.length ? `<ul class="tasks">${tasks.map(t => `<li class="${newTaskUntil[t.id] > now ? 'new' : ''}">${esc(t.text)}</li>`).join('')}</ul>` : '') +
    (!tasks.length && hint ? `<p class="hint">${esc(hint)}</p>` : '');
  if (html !== lastTB || !tb.querySelector('.tbhead')){ lastTB = html; tb.innerHTML = html; }
}
function titleText(){   // the text box on the title screen, with a warning if there's no Chinese voice
  const problem = voiceProblem();
  const due = dueWords().length;
  tb.innerHTML = `<p id="goal">${S.started ? 'Welcome back, little monkey.' + (due ? ` ${due} ${due === 1 ? 'word is' : 'words are'} due for review: practise at the practice post, or meet animals in the tall grass.` : '') : 'Turn your sound on. Every word is spoken aloud using your device’s Chinese voice.'}</p>`
    + (problem ? `<p class="small warn">${VOICE_HELP[problem]}</p>` : '');
}
try { speechSynthesis.addEventListener('voiceschanged', () => { if (mode === 'title') titleText(); }); } catch(e) {}   // voices can arrive late
function toTitle(){
  mode = 'title'; musicStop();
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
  if ($('#contBtn')) $('#contBtn').onclick = go(() => { $('#titlecard').hidden = true; placePlayer(); mode = 'play'; lastTB = ''; updateHUD(); });
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
         <li><span class="kbd menu">☰</span><span><b>Menu</b> at the top: your tasks, Word Scroll, friends and settings.</span></li>
       </ul>
       <p class="small">Answers, word tiles and words in sentences are simply tapped.</p>`,
      `<p class="label">How to play · 2 of 2</p>
       <p>You’ll hear lots of Chinese, like a baby monkey listening to the forest. <b>You don’t need to understand or remember all of it.</b></p>
       <div class="example"><div class="line">${[['我','learn'],['渴','listen'],['了','listen'],['。',''],['我','learn'],['要','learn'],['喝','learn teach'],['水','listen'],['！','']].map(([t,c]) => c ? `<button class="tok ${c}" data-t="${t}"><ruby>${t}<rt class="${S.pinyin ? '' : 'hid'}">${info(t)[0]}</rt></ruby></button>` : `<span class="punct">${t}</span>`).join('')}</div></div>
       <ul class="howto">
         <li><span class="dot learn"></span><span><b>Green words</b> are ones you’ve already learned.</span></li>
         <li><span class="dot teach"></span><span>A <b>bold green word</b> is the new one you’re learning right now.</span></li>
         <li><span class="dot listen"></span><span><b>Grey words</b> are just for listening. Tap one if you’re curious, then let it go.</span></li>
         <li><span class="dot star">⭐</span><span>Only words on a <b>New word to learn</b> card go into your Word Scroll.</span></li>
       </ul>
       <p class="small">The first time you see a sentence, its English is shown underneath. After that, tap English if you need it.</p>`
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
  $('#titlecard').hidden = true;
  if (firstTime){ S.started = true; S.pos = {x:START.x, y:START.y, dir:START.facing || 'down'}; }
  placePlayer(); mode = 'play'; lastTB = ''; save(); musicStart();
  if (firstTime){
    busy = true;
    try {
      await howToPlay();
      await runSteps(AREA.begin);   // the area's first steps, such as being born from the stone
    } finally { busy = false; updateHUD(); }
  }
}

window.addEventListener('resize', fit);
buildMap(); placePlayer(); fit(); updateHUD(); toTitle();
requestAnimationFrame(frame);
