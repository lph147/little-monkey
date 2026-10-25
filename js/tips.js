// Tips: instead of a page of instructions before you start, a bubble points at a control the first
// time you need it ("Hold an arrow to walk", "Press A to talk"). Each tip shows once; the save remembers
// which you've had (S.tips). How to play is still in Settings. This file loads before js/state.js, which
// marks every tip as had in a game started before tips existed (those players had How to play).

/* ================= TIPS ================= */
// Each tip, in the order they're checked: at, what it points at; text; when, is it time for it (checked
// every frame); lasts, how long it shows before it counts as had (otherwise pressing what it points at
// makes it had, or for walk, taking a step); once, it counts as had as soon as it shows, for that line (tap goes
// when you tap a word); then, the tip A (or B, or ▼) shows next, instead of moving on, while it's showing; after, it only
// shows as the one before's then.
const TIPS = {
  walk: {at:'.dpad', text:'Hold an arrow to walk.<br>Tap to turn.', when:() => canAct()},
  talk: {at:'#btnA', text:'Press <b>A</b> to talk', when:() => aActs() && !!npcAt(...facing())},
  look: {at:'#btnA', text:'Press <b>A</b> to look', when:() => aActs() && !npcAt(...facing()) && promptFor(...facing()) === 'Look'},
  // every grey word in the line lit, not just the first (decided 24 October 2026); the bubble points at the first
  grey: {at:'#talk .tok.listen', all:true, once:true, then:'tap', text:'Grey words are just for listening. You don’t need to know them yet.', when:() => !!talkNext && !talkMove},
  // then A lights one of them, to tap (decided 24 October 2026: it was on your very first line, 你好, with its English
  // right under it, so there was nothing to find out)
  tap: {at:'#talk .tok.listen', once:true, after:true, text:'Tap a word to see what it means', when:() => !!talkNext && !talkMove},
  // the first line you hear again, its English behind the English button
  english: {at:'#talk [data-a=en]', once:true, text:'A line’s English shows the first time you hear it. Tap <b>English</b> to see it again.', when:() => !!talkNext && !talkMove}
  // (Tasks and Menu had tips too; the old monkey tells you about them instead, decided 18 October 2026.)
};
let tip = null;   // the tip showing: {id, target, lit: what glows (target, or with all, every match), until}
let tipThen = null;   // the tip to show next (a tip's then), once A has moved on from the one before
const tipBox = () => $('#tip') || document.body.appendChild(Object.assign(document.createElement('div'), {id:'tip', className:'tipb', hidden:true}));
function hideTip(){
  if (!tip) return;
  tip.lit.forEach(el => el.classList.remove('tipglow')); tipBox().hidden = true; tip = null;
}
function tipDone(id){ if (!S.tips[id]){ S.tips[id] = 1; save(); } if (tip && tip.id === id) hideTip(); }
// You pressed a control (sel: '#btnA', '#startBtn' or '#selectBtn'): a tip pointing at it is done.
function tipPressed(sel){ if (tip && TIPS[tip.id].at === sel) tipDone(tip.id); }
// A, B or ▼ in the speech box, with a tip showing that has a then: the next tip instead of the next line. Gives
// whether it did.
function tipStep(){
  const then = tip && TIPS[tip.id].then;
  if (!then || S.tips[then]) return false;
  hideTip(); tipThen = then; shown(); updateTips(performance.now());   // (shown: A pressed again straight away doesn’t skip it)
  return true;
}
function placeTip(){   // the bubble above what it points at (below it, if there's no room above)
  const box = tipBox(), r = tip.target.getBoundingClientRect(), w = box.offsetWidth, h = box.offsetHeight;
  const talk = tip.target.closest && tip.target.closest('#talk:not(.top)');   // a word in the speech box at the bottom: the bubble above the box, so it never covers who's speaking
  const tr = talk && talk.getBoundingClientRect(), top = talk ? tr.top : r.top;
  const lo = talk ? tr.left : 6, hi = (talk ? tr.right : window.innerWidth - 6) - w;   // (over the box, never over the D-pad beside the screen)
  const below = top < h + 20, left = clamp(r.left + r.width / 2 - w / 2, lo, Math.max(lo, hi));
  box.classList.toggle('below', below);
  box.style.left = left + 'px'; box.style.top = (below ? r.bottom + 14 : top - h - 14) + 'px';
  box.style.setProperty('--ax', clamp(r.left + r.width / 2 - left, 14, w - 14) + 'px');   // the arrow, under the middle of what it points at
}
function updateTips(now){
  if (mode !== 'play'){ hideTip(); return; }
  if (tip){
    const t = TIPS[tip.id], walked = tip.id === 'walk' && pl.mv;
    if (walked || (tip.until && now > tip.until)){ tipDone(tip.id); return; }
    if (!tip.target.isConnected || tip.target.offsetParent === null || !t.when()){ hideTip(); return; }
    placeTip(); return;
  }
  for (const [id, t] of Object.entries(TIPS)){
    if (S.tips[id] || (t.after && tipThen !== id) || !t.when()) continue;
    const [box0, ...inside] = t.at.split(' '), box0el = $(box0);   // (inside what its at starts with, such as #talk)
    const target = inside.length ? box0el && box0el.querySelector(inside.join(' ')) : box0el;
    if (!target || target.offsetParent === null) continue;
    tip = {id, target, lit:t.all ? [...box0el.querySelectorAll(inside.join(' '))] : [target], until:t.lasts ? now + t.lasts : 0};
    const box = tipBox(); box.innerHTML = t.text; box.hidden = false;
    tip.lit.forEach(el => el.classList.add('tipglow')); placeTip();
    if (t.after) tipThen = null;
    if (t.once){ S.tips[id] = 1; save(); }
    return;
  }
}
