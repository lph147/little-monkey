// Tips: instead of a page of instructions before you start, a bubble points at a control the first
// time you need it ("Hold an arrow to walk", "Press A to talk"). Each tip shows once; the save remembers
// which you've had (S.tips). How to play is still in Settings. This file loads before js/state.js, which
// marks every tip as had in a game started before tips existed (those players had How to play).

/* ================= TIPS ================= */
// Each tip, in the order they're checked: at, what it points at; text; when, is it time for it (checked
// every frame); lasts, how long it shows before it counts as had (otherwise pressing what it points at
// makes it had, or for walk, taking a step; grey counts as had as soon as it shows).
const TIPS = {
  walk: {at:'.dpad', text:'Hold an arrow to walk.<br>Tap to turn.', when:() => canAct()},
  talk: {at:'#btnA', text:'Press <b>A</b> to talk', when:() => canAct() && !!npcAt(...facing())},
  look: {at:'#btnA', text:'Press <b>A</b> to look', when:() => canAct() && !npcAt(...facing()) && promptFor(...facing()) === 'Look'},
  grey: {at:'#talk .tok.listen', text:'Grey words are just for listening. You don’t need to know them yet.', when:() => !!talkNext && !talkMove},
  menu: {at:'#menuBtn', text:'Your words are in the Menu', when:() => canAct() && learnedCount() >= 3, lasts:8000}
};
let tip = null;   // the tip showing: {id, target, until}
const tipBox = () => $('#tip') || document.body.appendChild(Object.assign(document.createElement('div'), {id:'tip', className:'tipb', hidden:true}));
function hideTip(){
  if (!tip) return;
  tip.target.classList.remove('tipglow'); tipBox().hidden = true; tip = null;
}
function tipDone(id){ if (!S.tips[id]){ S.tips[id] = 1; save(); } if (tip && tip.id === id) hideTip(); }
// You pressed a control (sel: '#btnA' or '#menuBtn'): a tip pointing at it is done.
function tipPressed(sel){ if (tip && TIPS[tip.id].at === sel) tipDone(tip.id); }
function placeTip(){   // the bubble above what it points at (below it, if there's no room above)
  const box = tipBox(), r = tip.target.getBoundingClientRect(), w = box.offsetWidth, h = box.offsetHeight;
  const below = r.top < h + 20, left = clamp(r.left + r.width / 2 - w / 2, 6, window.innerWidth - w - 6);
  box.classList.toggle('below', below);
  box.style.left = left + 'px'; box.style.top = (below ? r.bottom + 14 : r.top - h - 14) + 'px';
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
    if (S.tips[id] || !t.when()) continue;
    const target = $(t.at);
    if (!target || target.offsetParent === null) continue;
    tip = {id, target, until:t.lasts ? now + t.lasts : 0};
    const box = tipBox(); box.innerHTML = t.text; box.hidden = false;
    target.classList.add('tipglow'); placeTip();
    if (id === 'grey'){ S.tips.grey = 1; save(); }
    return;
  }
}
