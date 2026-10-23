// The player's position and movement, and the controls: keyboard, D-pad, A, B and Menu.

/* ================= PLAYER & INPUT ================= */
const pl = {x:START.x, y:START.y, px:START.x*T, py:START.y*T, dir:'down', mv:null, parity:0, turnT:0};
function placePlayer(){ enterPlace(S.pos.place || FIRST_PLACE); pl.x = S.pos.x; pl.y = S.pos.y; pl.dir = S.pos.dir || 'down'; pl.px = pl.x*T; pl.py = pl.y*T; pl.mv = null; lineUp(); }   // (anyone following you waits on your square)
let held = null, queued = null, busy = false, mode = 'title', lastBump = 0, shakeT = -9999, lastMoveEnd = 0, fadeT = -9999, waterT = -9999, dripUntil = 0, sleepT = -9999, sleepAt = null, wakeT = -9999;   // (sleepAt: the bed you're asleep in)
const splashes = [];   // splashes of water, each where (x, y, in the map) and when (t0)
const canAct = () => mode === 'play' && !busy && modal.hidden && !talkNext && !pl.mv;
// Trying to climb a ledge or a bank (decided 23 October 2026, after playing the hillside: a bump didn't show why you
// couldn't): you scramble up a little, then slip back down, in SLIP_MS, SLIP_UP pixels at most.
const SLIP_MS = 520, SLIP_UP = 7;
const slipLift = p => p < .4 ? SLIP_UP * Math.sin(p / .4 * Math.PI / 2) : SLIP_UP * (1 - ((p - .4) / .6) ** 2);
// What you've just finished with (a conversation, a lesson, the story, an animal you've met…) rests: A at it does nothing
// until you turn, take a step or REST_MS go by, with A's label blank meanwhile, so an A meant for the last of it never
// starts it all over again (decided 22 October 2026: 21 October's half a second was too short). But not someone with
// something new for you, a ! or ? over them, and not what they've just said: A talks to them at once (decided 23 October
// 2026, after playing it: the old monkey taught 家 and went straight on to counting the troop in, but A, after closing
// each message, did nothing, as if you couldn't talk to him).
const REST_MS = 2000;
let finishedAt = null;   // {place, x, y, t}: the square you were facing when something ended
function finished(){ const [x, y] = facing(); finishedAt = {place:PLACE, x, y, t:performance.now()}; }
const justFinished = (x, y) => !!finishedAt && finishedAt.place === PLACE && finishedAt.x === x && finishedAt.y === y
  && performance.now() - finishedAt.t < REST_MS && lastMoveEnd < finishedAt.t && pl.turnT < finishedAt.t
  && !(n => n && hasNews(n))(npcAt(x, y) || followerAt(x, y));
// A message that has come up (toast, js/helpers.js) since you last moved or turned: A closes it, as B does, never
// reaching past it to whoever you're facing (decided 22 October 2026: it's where the speech box was, and looks like it,
// and A, pressed to clear it, started the conversation you'd just had all over again). Once you've moved on, A is as ever.
const newMessage = () => !$('#saybox').hidden && msgAt > Math.max(lastMoveEnd, pl.turnT);
const aActs = () => canAct() && !newMessage() && !justFinished(...facing());   // A, pressed now, would do something with what you're facing (the tips to talk and look wait for it)
function tryStep(d, now){
  if (d !== pl.dir){ pl.dir = d; pl.turnT = now; SFX.turn(); return; }   // first turn to face the new way
  if (now - pl.turnT < TURN_DELAY) return;                                 // short pause so the turn is visible
  const [dx,dy] = DV[d], nx = pl.x + dx, ny = pl.y + dy, way = exitAt(nx, ny);
  if (way && !way.by && !isOpen(way)){ if (now - lastBump > 300){ lastBump = now; SFX.bump(); toast(fill(way.closed || 'The way is shut.')); } return; }   // a way the story hasn't opened yet
  if (tileAt(nx, ny).ledge){   // a ledge: you hop down it, landing just below (below the whole of a bank two squares high), but can never climb it
    let ly = ny + 1; while (tileAt(nx, ly).ledge) ly++;
    if (d === 'down' && walkable(nx, ly)){ followersStep(now, true); pl.mv = {fx:pl.x, fy:pl.y, tx:nx, ty:ly, t0:now, hop:true}; pl.parity ^= 1; SFX.turn(); }
    else if (d === 'up' && now - lastBump > 300){ lastBump = now + SLIP_MS; pl.mv = {fx:pl.x, fy:pl.y, tx:pl.x, ty:pl.y, t0:now, slip:true}; pl.parity ^= 1; SFX.slip(); }   // up it: you slip back down
    else if (now - lastBump > 300){ lastBump = now; SFX.bump(); }
    return;
  }
  if (walkable(nx, ny) || (way && !way.by && isOpen(way) && !npcAt(nx, ny))){ followersStep(now); pl.mv = {fx:pl.x, fy:pl.y, tx:nx, ty:ny, t0:now}; pl.parity ^= 1; }   // (an open way you can always walk into, such as a building's door)
  else if (now - lastBump > 300){ lastBump = now; SFX.bump(); }
}
function update(now){
  if (mode !== 'play') return;
  if (pl.mv && pl.mv.slip){   // trying to climb a ledge: up a little, and sliding back down where you were (not a step: nothing happens there)
    const m = pl.mv, p = Math.min(1, (now - m.t0) / SLIP_MS);
    pl.px = m.fx * T; pl.py = m.fy * T - slipLift(p);
    if (p >= 1){ pl.py = m.fy * T; pl.mv = null; }
    return;
  }
  if (pl.mv){
    const m = pl.mv, p = Math.min(1, (now - m.t0) / (m.hop ? STEP * 1.6 : STEP));   // a hop down a ledge takes a little longer
    pl.px = (m.fx + (m.tx - m.fx) * p) * T; pl.py = (m.fy + (m.ty - m.fy) * p) * T - (m.hop ? Math.sin(p * Math.PI) * 7 : 0);
    if (p >= 1){
      pl.x = m.tx; pl.y = m.ty; pl.mv = null; busy = true; lastMoveEnd = now;
      const was = shownAt;   // (if arriving showed you something, such as someone stopping you to talk, it rests when it ends)
      Promise.resolve(arrive(pl.x, pl.y)).then(runEvents).finally(() => { busy = false; if (shownAt !== was) finished(); updateHUD(); });
    }
    return;
  }
  if (!canAct()) return;
  const tapped = queued; queued = null;
  if (tapped && tapped !== pl.dir){ tryStep(tapped, now); return; }
  const d = held || tapped;
  if (d) tryStep(d, now);
}
async function pressA(at){   // at: when it was pressed, if known (tooSoon, js/cards.js)
  tipPressed('#btnA');
  if (mode === 'title' && modal.hidden){ const t = $('#titleButtons').querySelector('.sel'); if (t) t.click(); return; }   // the chosen button on the title screen (Continue, New game or Save files)
  if (mode === 'intro'){ const bb = $('#beginBtn') || $('#nextBtn'); if (bb) bb.click(); return; }
  if (!modal.hidden){
    if (tooSoon(at)) return;   // (pressed before this card appeared, or just as it did)
    const f = chosenBtn(), inMenu = !!sheet.querySelector(NAVIGABLE);
    if (inMenu && f) f.click();
    else {
      const p = [...sheet.querySelectorAll('.primary')].find(x => !x.hidden && !x.disabled);
      if (p) p.click();
      else if (sheet.querySelector(ANSWERS)) navFocus('down');   // a question: A shows where you are (its first answer), never answers it for you
      else if (inMenu){ const first = navItems()[0]; if (first) first.click(); }
    }
    return;
  }
  if (talkNext){ if (!tooSoon(at)) talkNext(); return; }   // the speech box: on to what comes next
  if (!canAct()) return;
  if (newMessage()){ if (!tooSoon(at, msgAt)){ closeMessage(); finished(); } return; }   // (not if pressed just as it came up; and then what you're facing rests, as after anything A does)
  const [fx, fy] = facing();
  if (justFinished(fx, fy)) return;
  busy = true;
  try { await interact(fx, fy); await runEvents(); } finally { busy = false; finished(); updateHUD(); }
}
function pressB(at){
  if (!modal.hidden){ const b = sheet.querySelector('[data-b]'); if (b && !b.disabled && b.offsetParent !== null && !tooSoon(at)) b.click(); return; }
  if (talkNext && !talkMove){ if (!tooSoon(at)) talkNext(); return; }   // B moves talk on too (but doesn't choose a reply)
  if (mode === 'intro'){ const sk = $('#skipBtn'); if (sk) sk.click(); return; }
  if (!$('#saybox').hidden){ closeMessage(); return; }
}
// Start: the menu (pressing it again closes it). Select: your tasks (again closes them).
function pressMenu(){
  tipPressed('#startBtn');
  if (!modal.hidden){ if (sheet.querySelector('[data-m]')) closeCard(); return; }
  if (mode === 'play' && canAct()) openMenu();
}
function pressSelect(){
  tipPressed('#selectBtn');
  if (!modal.hidden){ if (sheet.querySelector('.taskslabel')) closeCard(); return; }
  if (mode === 'play' && canAct()) tasksPage(() => closeCard());
}
$('#startBtn').addEventListener('click', () => { getAC(); pressMenu(); });
$('#selectBtn').addEventListener('click', () => { getAC(); pressSelect(); });
const KEYS = {ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'};
document.addEventListener('keydown', e => {
  if (upright) return;   // the phone is upright: the game waits until it's turned
  const isB = e.key === 'x' || e.key === 'X' || (e.key === 'Escape' && (!modal.hidden || !!talkNext));
  const isMenu = e.key === 'm' || e.key === 'M' || (e.key === 'Escape' && modal.hidden && !talkNext);   // Start
  const isSelect = e.key === 't' || e.key === 'T';
  const isA = e.key === ' ' || e.key === 'Enter';
  if (!modal.hidden){
    const d = KEYS[e.key];
    if ((isA || isB) && tooSoon(e.timeStamp)){ e.preventDefault(); return; }   // (not even pressing the card's chosen button)
    if (d && !e.key.match(/^[wasdWASD]$/)){ e.preventDefault(); navFocus(d); }
    else if (isB){ e.preventDefault(); pressB(e.timeStamp); }
    else if (isMenu){ e.preventDefault(); pressMenu(); }
    else if (isSelect){ e.preventDefault(); pressSelect(); }
    else if (isA && !(e.target.matches && e.target.matches('button:focus-visible'))){ e.preventDefault(); if (!e.repeat) pressA(e.timeStamp); }   // (a button chosen with Tab or the arrows is pressed by the browser; one clicked with the mouse isn't: what A would press is, decided 22 October 2026)
    return;
  }
  if (isB){ e.preventDefault(); pressB(e.timeStamp); return; }
  if (isMenu){ e.preventDefault(); pressMenu(); return; }
  if (isSelect){ e.preventDefault(); pressSelect(); return; }
  if (mode === 'title' && KEYS[e.key] && !e.key.match(/^[wasdWASD]$/)){ e.preventDefault(); if (!e.repeat) moveTitle(KEYS[e.key]); return; }   // the arrows move between the title's buttons
  if (mode !== 'play'){
    // The title screen and the intro: A chooses the game, or presses Next or Begin, unless you've moved to another button with Tab.
    if (isA && !e.target.matches('button:focus-visible')){ e.preventDefault(); if (!e.repeat) pressA(); }
    return;
  }
  if (talkNext){   // while someone's talking, only A and B do anything, and the arrows move between replies
    const d = KEYS[e.key];
    if (isA){ e.preventDefault(); if (!e.repeat) pressA(e.timeStamp); }
    else if (d && talkMove){ e.preventDefault(); if (!e.repeat) talkMove(d); }
    return;
  }
  const d = KEYS[e.key];
  if (d){ e.preventDefault(); if (!e.repeat) queued = d; held = d; return; }
  if (isA){ e.preventDefault(); pressA(e.timeStamp); }
});
document.addEventListener('keyup', e => { const d = KEYS[e.key]; if (d && held === d) held = null; });
window.addEventListener('blur', () => { held = null; });
const dpad = $('.dpad');
let dpadPointer = null, padDir = null;
function dirFromPoint(e){
  const r = dpad.getBoundingClientRect(), x = e.clientX - (r.left + r.width/2), y = e.clientY - (r.top + r.height/2);
  if (Math.hypot(x, y) < r.width * .1) return null;           // small dead zone in the middle
  return Math.abs(x) > Math.abs(y) ? (x < 0 ? 'left' : 'right') : (y < 0 ? 'up' : 'down');
}
function setPad(d){
  if (d === padDir) return;
  padDir = d;
  document.querySelectorAll('.dpad button').forEach(b => b.classList.toggle('held', b.dataset.dir === d));
  if (!modal.hidden){ held = null; if (d) navFocus(d); return; }
  if (mode === 'title'){ held = null; if (d) moveTitle(d); return; }   // the D-pad moves between the title's buttons
  if (talkNext){ held = null; if (d && talkMove) talkMove(d); return; }   // no walking off while someone's talking
  held = d; if (d) queued = d;
}
dpad.addEventListener('pointerdown', e => { e.preventDefault(); getAC(); dpadPointer = e.pointerId; try { dpad.setPointerCapture(e.pointerId); } catch(_) {} setPad(dirFromPoint(e)); });
dpad.addEventListener('pointermove', e => { if (e.pointerId === dpadPointer) setPad(dirFromPoint(e)); });
const padEnd = e => { if (e.pointerId !== dpadPointer) return; dpadPointer = null; setPad(null); held = null; };
['pointerup','pointercancel','lostpointercapture'].forEach(t => dpad.addEventListener(t, padEnd));
dpad.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => { if (dpadPointer !== null) e.preventDefault(); });
['btnA','btnB'].forEach(id => {
  const el = $('#' + id), fn = id === 'btnA' ? pressA : pressB;
  el.addEventListener('pointerdown', e => { e.preventDefault(); getAC(); el.classList.add('held'); fn(e.timeStamp); });
  ['pointerup','pointercancel','pointerleave'].forEach(t => el.addEventListener(t, () => el.classList.remove('held')));
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
  el.addEventListener('click', e => { if (e.detail === 0) fn(e.timeStamp); });
  el.addEventListener('contextmenu', e => e.preventDefault());
});
