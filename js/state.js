// The saved game: what you have learned and done, kept in the browser, and when each word is next due for review.

/* ================= STATE ================= */
const KEY = 'xiaohouzi-v2';   // where the save is kept in the browser (an old name; the version is inside the save)
const SAVE_VERSION = 11;
// XP, earned only by learning, never by walking about. Every XP_PER_LEVEL is a new level.
const XP = {word:10, right:2, rightDue:5, task:20, story:20, exitTest:50}, XP_PER_LEVEL = 100;
function areaStart(){   // a new game's progress in the area: the area's own list, each request not asked yet, holding nothing
  const p = {...AREA.progress};
  for (const r of REQUESTS) p[r.id] = 'not asked';
  return Object.assign(p, {holding:{}, bought:[], done:false});
}
function fresh(){ return {version:SAVE_VERSION, w:{}, gloss:{}, peaches:0, friends:[], area:AREA.number, pos:{x:START.x,y:START.y,dir:'down'}, areas:{[AREA.number]:areaStart()}, started:false, sound:true, music:true, tasksSeen:{}, pinyin:true, replyEn:true, lines:{}, heard:{}, xp:0, howto:false, met:[], encounters:0, today:{d:'',ids:[]}, bag:{}, day:1, lastDay:'', firsts:{}}; }

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
  if (s.version === 5){   // version 5: there was no XP, so work it out from what you've done
    const a = (s.areas || {})[AREA.number] || {};
    s.xp = Object.values(s.w || {}).filter(r => r && r.lv >= 1).length * XP.word
      + REQUESTS.filter(r => a[r.id] === 'done').length * XP.task + (a.story ? XP.story : 0) + (a.done ? XP.exitTest : 0);
    s.version = 6;
  }
  if (s.version === 6){   // version 6: there was no shop. What you've bought starts empty (filled in below).
    s.version = 7;
  }
  if (s.version === 7){   // version 7: there was no bag for food from the shop. It starts empty (filled in below).
    s.version = 8;
  }
  if (s.version === 8){   // version 8: building a sentence moved its words straight up to Used. Now a word is Used once
                          // you've used it and can read it, so words already at Used are marked as used (and stay Used).
    for (const r of Object.values(s.w || {})) if (r && r.lv === 4) r.used = 1;
    s.version = 9;
  }
  if (s.version === 9){   // version 9: there was no setting for English on reply choices. It starts on (filled in below).
    s.version = 10;
  }
  if (s.version === 10){   // version 10: there were no days or book of firsts. You're on day 1, and the firsts
                           // you've already had go in the book, as on day 1.
    const a = (s.areas || {})[AREA.number] || {}, w = s.w || {};
    s.firsts = {};
    const had = (id, yes) => { if (yes) s.firsts[id] = {day:1}; };
    had('word', Object.values(w).some(r => r && r.lv >= 1));
    had('reply', Object.entries(w).some(([k, r]) => WORDS[k] && WORDS[k].phrase && r && r.used));
    had('animal', (s.met || []).length);
    had('friend', (s.friends || []).length);
    had('want', REQUESTS.some(r => a[r.id] === 'done'));
    had('buy', (a.bought || []).length);
    had('story', a.story);
    s.day = 1;
    s.version = 11;
  }
  const f = fresh(), start = f.areas[AREA.number];
  s = Object.assign(f, s);
  s.areas = Object.assign({}, s.areas);
  s.areas[AREA.number] = Object.assign({}, start, s.areas[AREA.number]);
  s.areas[AREA.number].holding = Object.assign({}, s.areas[AREA.number].holding);
  if (!Array.isArray(s.areas[AREA.number].bought)) s.areas[AREA.number].bought = [];
  if (!Array.isArray(s.met)) s.met = [];
  if (!s.bag || typeof s.bag !== 'object' || Array.isArray(s.bag)) s.bag = {};
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
// Your save as a file to download (Menu, Settings, Save file), so a cleared browser can't lose it.
function saveFile(){
  const d = new Date(), two = n => String(n).padStart(2, '0');
  return {name:`little-monkey-save-${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}.json`, text:JSON.stringify(S)};
}
// A downloaded save, brought up to date: {save}, or {error} saying what's wrong with the file.
function readSaveFile(text){
  let data = null;
  try { data = JSON.parse(text); } catch(e) {}
  if (!data || typeof data !== 'object' || Array.isArray(data) || !data.w || typeof data.w !== 'object') return {error:"That file isn't a Little Monkey save."};
  if ((data.version || 2) > SAVE_VERSION) return {error:'That save is from a newer version of the game. Reload the page to get the newest version, then try again.'};
  return {save:upgradeSave(data)};
}
// Plays on from a loaded save, keeping a copy of the game it replaces in the browser.
function useSave(s){
  try { const raw = localStorage.getItem(KEY); if (raw) keepBackup('before-load-' + Date.now(), raw); } catch(e) {}
  S = s; save();
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
const level = (xp = S.xp) => Math.floor((xp || 0) / XP_PER_LEVEL) + 1;
function gainXP(n){   // a new level is announced just after whatever message earned it
  const before = level(); S.xp = (S.xp || 0) + n;
  if (level() > before) setTimeout(() => { SFX.chime(); toast(`Level up! You're now level ${level()}.`); }, 1400);
}
function setSeen(w){ const r = rec(w); if (r.lv < 1){ r.lv = 1; r.due = Date.now(); gainXP(XP.word); first('word', w); } addToday(w); save(); }
// The book of firsts: each first, the day it happened and what it was (w), shown on the 任务 page and at the end of the day.
const FIRSTS = {word:'First word', reply:'First reply in Chinese', animal:'First animal met', friend:'First friend',
  want:'First 我要 sentence', buy:'First thing bought', story:'First story read', sleep:'First night in your nest'};
function first(id, w){
  if (S.firsts[id]) return;
  S.firsts[id] = {day:S.day, ...(w ? {w} : {})}; save();
  setTimeout(() => { SFX.chime(); toast(`📖 ${FIRSTS[id]}! It's in your book of firsts.`); }, 2500);
}
// You used w in a sentence (a request or a shop order). It's Used once you can read it as well.
function useWord(w){ const r = rec(w); r.used = 1; if (r.lv === 3) r.lv = 4; addToday(w); save(); }
// Questions get harder slowly. A word moves up from Caught to Recognised after STEP_UP right answers in a
// row picking it by sound (listen), then to Read after STEP_UP more picking it from its characters (read).
// A word without a picture (我 要) moves up the same way by building sentences with it right first time (build).
// A wrong answer moves it back down a level. In each word's record: lv its level, n right answers in a
// row at that level, ok right answers in a row (for when it's due again), used once you've used it.
const STEP_UP = 2;
function answer(w, ok, type){
  const r = rec(w);
  if (ok) gainXP(r.due <= Date.now() ? XP.rightDue : XP.right);
  if (ok){
    r.n = (r.n || 0) + 1;
    const up = type === 'build' ? !WORDS[w].pic && r.lv < 3 : (type === 'listen' && r.lv === 1) || (type === 'read' && r.lv === 2);
    if (r.n >= STEP_UP && up){ r.lv++; r.n = 0; }
    if (r.lv === 3 && r.used) r.lv = 4;
    r.ok = (r.ok || 0) + 1;
    r.due = Date.now() + INTERVALS[Math.min(r.ok - 1, 3)] * DAY;
  } else { r.lv = Math.max(1, r.lv - 1); r.n = 0; r.ok = 0; r.due = Date.now(); }
  addToday(w); save();
}
