// The saved game: what you have learned and done, kept in the browser, and when each word is next due for review.

/* ================= STATE ================= */
const KEY = 'xiaohouzi-v2';
function fresh(){ return {w:{}, gloss:{}, peaches:0, q:{elder:0,hungry:0,thirsty:0}, gate:false, story:false, friends:[], pos:{x:START.x,y:START.y,dir:'down'}, started:false, sound:true, music:true, tasksSeen:{}, area1Done:false, pinyin:true, lines:{}, howto:false, carry:null, met:[], encounters:0, today:{d:'',ids:[]}}; }
let S = fresh();
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(fresh(), JSON.parse(raw)); } catch(e) {}
if (S.q.hungry === 2){ S.q.hungry = 1; S.carry = '桃子'; }   // older saves carried the peach as a quest step
if (!Array.isArray(S.met)) S.met = [];
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e) {} updateHUD(); }
const lvl = w => (S.w[w] && S.w[w].lv) || 0;
function rec(w){ if (!S.w[w]) S.w[w] = {lv:0,due:0,ok:0}; return S.w[w]; }
function todayKey(){ const d = new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function addToday(w){ const k = todayKey(); if (S.today.d !== k) S.today = {d:k, ids:[]}; if (!S.today.ids.includes(w)) S.today.ids.push(w); }
function setSeen(w){ const r = rec(w); if (r.lv < 1){ r.lv = 1; r.due = Date.now(); } addToday(w); save(); }
function setLevel(w, n){ const r = rec(w); if (r.lv < n) r.lv = n; r.due = Date.now() + DAY; addToday(w); save(); }
function answer(w, ok, type){
  const r = rec(w);
  if (ok){
    if (type === 'listen' && r.lv === 1) r.lv = 2;
    if (type === 'read' && r.lv === 2) r.lv = 3;
    r.ok = (r.ok || 0) + 1;
    r.due = Date.now() + INTERVALS[Math.min(r.ok - 1, 3)] * DAY;
  } else { r.lv = Math.max(1, r.lv - 1); r.ok = 0; r.due = Date.now(); }
  addToday(w); save();
}
