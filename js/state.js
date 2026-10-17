// The saved game: what you have learned and done, kept in the browser, and when each word is next due for review.

/* ================= STATE ================= */
const KEY = 'xiaohouzi-v2';   // where the save is kept in the browser (an old name; the version is inside the save)
const SAVE_VERSION = 21;
// XP, earned only by learning, never by walking about. Every XP_PER_LEVEL is a new level.
const XP = {word:10, right:2, rightDue:5, task:20, story:20, exitTest:50}, XP_PER_LEVEL = 100;
function areaStart(){   // a new game's progress in the area: the area's own list, each request not asked yet, holding nothing
  const p = {...AREA.progress};
  for (const r of REQUESTS) p[r.id] = 'not asked';
  return Object.assign(p, {holding:{}, wanted:{}, picked:{}, bought:[], done:false});
}
function fresh(){ return {version:SAVE_VERSION, w:{}, gloss:{}, shells:0, friends:[], area:AREA.number, pos:{place:START.place,x:START.x,y:START.y,dir:'down'}, areas:{[AREA.number]:areaStart()}, started:false, sound:true, music:true, tasksSeen:{}, tasksRead:{}, tips:{}, pinyin:true, replyEn:true, lines:{}, heard:{}, xp:0, howto:false, met:[], encounters:0, today:{d:'',ids:[]}, bag:{}, wardrobe:{owned:[], wearing:[]}}; }

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
  if (s.version === 11){   // version 11: there was no wardrobe. What you bought to wear is in it, and still on.
                           // Something now given in talk you've already had (a part for a word you've learned) is there too.
    const bought = (((s.areas || {})[AREA.number] || {}).bought || []).filter(i => AREA.wardrobe.some(c => c.item === i));
    s.wardrobe = {owned:[...bought], wearing:[...bought]};
    for (const parts of Object.values(AREA.talk)) for (const p of parts){
      const had = p.if && p.if.new && ((s.w || {})[p.if.new] || {}).lv >= 1;
      for (const st of p.do) if (st.give && had && !s.wardrobe.owned.includes(st.give)) s.wardrobe.owned.push(st.give);
    }
    s.version = 12;
  }
  if (s.version === 12){   // version 12: there was no picking things one by one, such as flowers for the big monkey.
    s.version = 13;        // Nothing picked yet, and its request not asked yet (filled in below).
  }
  if (s.version === 13){   // version 13: there were days and sleeping in a nest. They've gone, so the day count goes
    delete s.day; delete s.lastDay;   // (your words, firsts and everything else stay)
    s.version = 14;
  }
  if (s.version === 14){   // version 14: there was a book of firsts. It's gone (your words and everything else stay).
    delete s.firsts;
    s.version = 15;
  }
  if (s.version === 15){   // version 15: the money was peaches. It's shells now: the same number (just below).
    s.version = 16;
  }
  if (s.version === 16){   // version 16: there were no tips (js/tips.js). A game already started has had How to play
    s.tips = s.started ? Object.fromEntries(Object.keys(TIPS).map(id => [id, 1])) : {};   // instead, so its tips are all had.
    s.version = 17;
  }
  if (s.version === 17){   // version 17: the area was one map. It's places now, and that map is the first (the meadow).
    if (s.pos) s.pos = {...s.pos, place:FIRST_PLACE};
    s.version = 18;
  }
  if (s.version === 18){   // version 18: there were no chapters. You're in the prologue (filled in below); if it's all done,
    s.version = 19;        // chapter 1 begins the next time you do something.
  }
  if (s.version === 19){   // version 19: the hungry monkey asked for a peach, and flowers were picked one per patch.
    const a = (s.areas || {})[AREA.number];
    if (a){
      if (a.hungry === 'asked') a.wanted = {...a.wanted, hungry:'桃子'};   // you were told he wants a peach, so he still does
      const fl = (a.picked || {}).flowers;   // flowers are one of each colour now: if you had all 3, you have one of each
      if (Array.isArray(fl)) a.picked.flowers = fl.length >= 3 ? ['红', '黄', '白'] : [];
    }
    s.version = 20;
  }
  if (s.version === 20){   // version 20: tasks were shown in a box under the screen. They're on Select now, and the
    s.tasksRead = {...(s.tasksSeen || {})};   // ones you'd seen there count as looked at
    s.version = 21;
  }
  if ('peaches' in s){ if (!('shells' in s)) s.shells = s.peaches; delete s.peaches; }   // money was called peaches before version 16
  const f = fresh(), start = f.areas[AREA.number];
  s = Object.assign(f, s);
  s.areas = Object.assign({}, s.areas);
  s.areas[AREA.number] = Object.assign({}, start, s.areas[AREA.number]);
  s.areas[AREA.number].holding = Object.assign({}, s.areas[AREA.number].holding);
  s.areas[AREA.number].wanted = Object.assign({}, s.areas[AREA.number].wanted);
  if (!Array.isArray(s.areas[AREA.number].bought)) s.areas[AREA.number].bought = [];
  s.areas[AREA.number].picked = Object.assign({}, s.areas[AREA.number].picked);
  if (!Array.isArray(s.met)) s.met = [];
  if (!s.bag || typeof s.bag !== 'object' || Array.isArray(s.bag)) s.bag = {};
  const clothes = w => [...(w || [])].filter(i => (AREA.wardrobe || []).some(c => c.item === i));   // only what the wardrobe has now
  s.wardrobe = {owned:clothes((s.wardrobe || {}).owned), wearing:clothes((s.wardrobe || {}).wearing)};
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
function setSeen(w){ const r = rec(w); if (r.lv < 1){ r.lv = 1; r.due = Date.now(); gainXP(XP.word); } addToday(w); save(); }
// You used w in a sentence (a request or a shop order). It's Used once you can read it as well.
function useWord(w){ const r = rec(w); r.used = 1; if (r.lv === 3) r.lv = 4; addToday(w); save(); }
// Questions get harder slowly. A word moves up from Caught to Recognised after STEP_UP right answers in a
// row picking it by sound (listen), then to Read after STEP_UP more picking it from its characters (read).
// A word without a picture (我 要) moves up the same way when you fill the gap in a sentence with it (fill).
// A wrong answer moves it back down a level. In each word's record: lv its level, n right answers in a
// row at that level, ok right answers in a row (for when it's due again), used once you've used it.
const STEP_UP = 2;
function answer(w, ok, type){
  const r = rec(w);
  if (ok) gainXP(r.due <= Date.now() ? XP.rightDue : XP.right);
  if (ok){
    r.n = (r.n || 0) + 1;
    const up = type === 'fill' ? !WORDS[w].pic && r.lv < 3 : (type === 'listen' && r.lv === 1) || (type === 'read' && r.lv === 2);
    if (r.n >= STEP_UP && up){ r.lv++; r.n = 0; }
    if (r.lv === 3 && r.used) r.lv = 4;
    r.ok = (r.ok || 0) + 1;
    r.due = Date.now() + INTERVALS[Math.min(r.ok - 1, 3)] * DAY;
  } else { r.lv = Math.max(1, r.lv - 1); r.n = 0; r.ok = 0; r.due = Date.now(); }
  addToday(w); save();
}
