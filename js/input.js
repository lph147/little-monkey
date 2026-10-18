// The player's position and movement, and the controls: keyboard, D-pad, A, B and Menu.

/* ================= PLAYER & INPUT ================= */
const pl = {x:START.x, y:START.y, px:START.x*T, py:START.y*T, dir:'down', mv:null, parity:0, turnT:0};
function placePlayer(){ enterPlace(S.pos.place || FIRST_PLACE); pl.x = S.pos.x; pl.y = S.pos.y; pl.dir = S.pos.dir || 'down'; pl.px = pl.x*T; pl.py = pl.y*T; pl.mv = null; }
let held = null, queued = null, busy = false, mode = 'title', lastBump = 0, shakeT = -9999, lastMoveEnd = 0, fadeT = -9999, waterT = -9999, dripUntil = 0, sleepT = -9999;
const splashes = [];   // splashes of water, each where (x, y, in the map) and when (t0)
const canAct = () => mode === 'play' && !busy && modal.hidden && !talkNext && !pl.mv;
function tryStep(d, now){
  if (d !== pl.dir){ pl.dir = d; pl.turnT = now; SFX.turn(); return; }   // first turn to face the new way
  if (now - pl.turnT < TURN_DELAY) return;                                 // short pause so the turn is visible
  const [dx,dy] = DV[d], nx = pl.x + dx, ny = pl.y + dy, way = exitAt(nx, ny);
  if (way && !way.by && !isOpen(way)){ if (now - lastBump > 300){ lastBump = now; SFX.bump(); toast(fill(way.closed || 'The way is shut.')); } return; }   // a way the story hasn't opened yet
  if (tileAt(nx, ny).ledge){   // a ledge: you hop down it, landing just below, but can never climb it
    if (d === 'down' && walkable(nx, ny + 1)){ pl.mv = {fx:pl.x, fy:pl.y, tx:nx, ty:ny + 1, t0:now, hop:true}; pl.parity ^= 1; SFX.turn(); }
    else if (now - lastBump > 300){ lastBump = now; SFX.bump(); }
    return;
  }
  if (walkable(nx, ny)){ pl.mv = {fx:pl.x, fy:pl.y, tx:nx, ty:ny, t0:now}; pl.parity ^= 1; }
  else if (now - lastBump > 300){ lastBump = now; SFX.bump(); }
}
function update(now){
  if (mode !== 'play') return;
  if (pl.mv){
    const m = pl.mv, p = Math.min(1, (now - m.t0) / (m.hop ? STEP * 1.6 : STEP));   // a hop down a ledge takes a little longer
    pl.px = (m.fx + (m.tx - m.fx) * p) * T; pl.py = (m.fy + (m.ty - m.fy) * p) * T - (m.hop ? Math.sin(p * Math.PI) * 7 : 0);
    if (p >= 1){
      pl.x = m.tx; pl.y = m.ty; pl.mv = null; busy = true; lastMoveEnd = now;
      Promise.resolve(arrive(pl.x, pl.y)).then(runEvents).finally(() => { busy = false; updateHUD(); });
    }
    return;
  }
  if (!canAct()) return;
  const tapped = queued; queued = null;
  if (tapped && tapped !== pl.dir){ tryStep(tapped, now); return; }
  const d = held || tapped;
  if (d) tryStep(d, now);
}
async function pressA(){
  tipPressed('#btnA');
  if (mode === 'title' && modal.hidden){ const t = $('#titleButtons').querySelector('.sel'); if (t) t.click(); return; }   // the chosen button on the title screen (Continue, New game or Save files)
  if (mode === 'intro'){ const bb = $('#beginBtn') || $('#nextBtn'); if (bb) bb.click(); return; }
  if (!modal.hidden){
    const f = chosenBtn(), inMenu = !!sheet.querySelector(NAVIGABLE);
    if (inMenu && f) f.click();
    else { const p = [...sheet.querySelectorAll('.primary')].find(x => !x.hidden && !x.disabled); if (p) p.click(); else if (inMenu){ const first = navItems()[0]; if (first) first.click(); } }
    return;
  }
  if (talkNext){ talkNext(); return; }   // the speech box: on to what comes next
  if (!canAct()) return;
  const [fx, fy] = facing();
  busy = true;
  try { await interact(fx, fy); await runEvents(); } finally { busy = false; updateHUD(); }
}
function pressB(){
  if (!modal.hidden){ const b = sheet.querySelector('[data-b]'); if (b && !b.disabled && b.offsetParent !== null) b.click(); return; }
  if (talkNext && !talkMove){ talkNext(); return; }   // B moves talk on too (but doesn't choose a reply)
  if (mode === 'intro'){ const sk = $('#skipBtn'); if (sk) sk.click(); return; }
  const sb = $('#saybox'); if (!sb.hidden){ sb.hidden = true; updateHUD(); return; }
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
  if (!modal.hidden){
    const d = KEYS[e.key];
    if (d && !e.key.match(/^[wasdWASD]$/)){ e.preventDefault(); navFocus(d); }
    else if (isB){ e.preventDefault(); pressB(); }
    else if (isMenu){ e.preventDefault(); pressMenu(); }
    else if (isSelect){ e.preventDefault(); pressSelect(); }
    return;
  }
  if (isB){ e.preventDefault(); pressB(); return; }
  if (isMenu){ e.preventDefault(); pressMenu(); return; }
  if (isSelect){ e.preventDefault(); pressSelect(); return; }
  const isA = e.key === ' ' || e.key === 'Enter';
  if (mode === 'title' && KEYS[e.key] && !e.key.match(/^[wasdWASD]$/)){ e.preventDefault(); if (!e.repeat) moveTitle(KEYS[e.key]); return; }   // the arrows move between the title's buttons
  if (mode !== 'play'){
    // The title screen and the intro: A chooses the game, or presses Next or Begin, unless you've moved to another button with Tab.
    if (isA && !e.target.matches('button:focus-visible')){ e.preventDefault(); if (!e.repeat) pressA(); }
    return;
  }
  if (talkNext){   // while someone's talking, only A and B do anything, and the arrows move between replies
    const d = KEYS[e.key];
    if (isA){ e.preventDefault(); if (!e.repeat) pressA(); }
    else if (d && talkMove){ e.preventDefault(); if (!e.repeat) talkMove(d); }
    return;
  }
  const d = KEYS[e.key];
  if (d){ e.preventDefault(); if (!e.repeat) queued = d; held = d; return; }
  if (isA){ e.preventDefault(); pressA(); }
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
  el.addEventListener('pointerdown', e => { e.preventDefault(); getAC(); el.classList.add('held'); fn(); });
  ['pointerup','pointercancel','pointerleave'].forEach(t => el.addEventListener(t, () => el.classList.remove('held')));
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
  el.addEventListener('click', e => { if (e.detail === 0) fn(); });
  el.addEventListener('contextmenu', e => e.preventDefault());
});
