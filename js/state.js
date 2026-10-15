// The saved game: what you have learned and done, kept in the browser, and when each word is next due for review.

/* ================= STATE ================= */
const KEY = 'xiaohouzi-v2';   // where the save is kept in the browser (an old name; the version is inside the save)
const SAVE_VERSION = 5;
function areaStart(){   // a new game's progress in the area: the area's own list, each request not asked yet, holding nothing
  const p = {...AREA.progress};
  for (const r of REQUESTS) p[r.id] = 'not asked';
  return Object.assign(p, {holding:{}, done:false});
}
function fresh(){ return {version:SAVE_VERSION, w:{}, gloss:{}, peaches:0, friends:[], area:AREA.number, pos:{x:START.x,y:START.y,dir:'down'}, areas:{[AREA.number]:areaStart()}, started:false, sound:true, music:true, tasksSeen:{}, pinyin:true, lines:{}, heard:{}, howto:false, met:[], encounters:0, today:{d:'',ids:[]}}; }

// Brings a save from an older version up to date, and fills in anything missing. Nothing is thrown away.
function upgradeSave(s){
  if (!s.version){   // version 2 (Little Monkey 8 until now): Flower Fruit Mountain's progress was loose at the top
    const q = s.q || {};
    if (q.hungry === 2){ q.hungry = 1; s.carry = '桃子'; }   // even older saves carried the peach as a task step
    s.areas = {1:{elder:q.elder || 0, hungry:q.hungry || 0, thirsty:q.thirsty || 0, gate:!!s.gate, story:!!s.story, done:!!s.area1Done}};
    s.area = 1;
    delete s.q; delete s.gate; delete s.story; delete s.area1Done;
    s.version = 3;
  }
  if (s.version === 3){   // version 3: the monkeys' tasks were numbers, the fruit you carried was loose at the top,
                          // and having the water was task step 2
    const a = (s.areas || {})[1];
    if (a){
      const state = n => (n === 3 ? 'done' : n >= 1 ? 'asked' : 'not asked');
      a.holding = {};
      if (a.thirsty === 2) a.holding.thirsty = '水';
      if (s.carry) a.holding.hungry = s.carry;
      a.hungry = state(a.hungry); a.thirsty = state(a.thirsty);
    }
    delete s.carry;
    s.version = 4;
  }
  if (s.version === 4){   // version 4: words heard in sentences weren't counted, so count the lines you've seen
                          // (and the story and its questions, if you've read it)
    s.heard = {};
    const lines = [...Object.values(L).map(l => l.t), toks(AREA.sign.says.zh)];
    for (const t of lines) if ((s.lines || {})[t.join('')]) hear(t, s.heard);
    if (((s.areas || {})[AREA.number] || {}).story) for (const t of [...STORY.map(x => x.t), ...AREA.storyQuestions.map(q => toks(q.zh))]) hear(t, s.heard);
    s.version = 5;
  }
  const f = fresh(), start = f.areas[AREA.number];
  s = Object.assign(f, s);
  s.areas = Object.assign({}, s.areas);
  s.areas[AREA.number] = Object.assign({}, start, s.areas[AREA.number]);
  s.areas[AREA.number].holding = Object.assign({}, s.areas[AREA.number].holding);
  if (!Array.isArray(s.met)) s.met = [];
  return s;
}
// Keeps a copy of an old or unreadable save in the browser, in case anything goes wrong. Never overwritten.
function keepBackup(label, raw){
  try { const k = KEY + '-backup-' + label; if (localStorage.getItem(k) === null) localStorage.setItem(k, raw); } catch(e) {}
}
function loadSave(){
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch(e) {}
  if (!raw) return fresh();
  let data = null;
  try { data = JSON.parse(raw); } catch(e) {}
  if (!data || typeof data !== 'object' || Array.isArray(data)){ keepBackup('unreadable', raw); return fresh(); }
  if (data.version === SAVE_VERSION) return upgradeSave(data);
  keepBackup('v' + (data.version || 2), raw);   // the old save, exactly as it was, before converting it
  const s = upgradeSave(data);
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e) {}
  return s;
}
let S = loadSave();
const here = () => S.areas[AREA.number];   // your progress in the area you're in
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e) {} updateHUD(); }
const lvl = w => (S.w[w] && S.w[w].lv) || 0;
function rec(w){ if (!S.w[w]) S.w[w] = {lv:0,due:0,ok:0}; return S.w[w]; }
function todayKey(){ const d = new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function addToday(w){ const k = todayKey(); if (S.today.d !== k) S.today = {d:k, ids:[]}; if (!S.today.ids.includes(w)) S.today.ids.push(w); }
// A sentence was shown: each word in it (not punctuation) counts as heard once more.
function hear(words, heard = S.heard){ for (const t of words) if (WORDS[t] || GLOSS[t]) heard[t] = (heard[t] || 0) + 1; }
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
