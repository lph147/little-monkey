// The saved game: what you have learned and done, kept in the browser, and where each word is in the review list.

/* ================= STATE ================= */
const KEY = 'xiaohouzi-v2';   // where the save is kept in the browser (an old name; the version is inside the save)
const SAVE_VERSION = 31;
const HEALTH = 50;   // your health in battles at the start, and the most you can have (the save's maxHealth: the story can raise it)
function areaStart(){   // a new game's progress in the area: the area's own list, each request not asked yet, holding nothing,
  const p = {...AREA.progress};   // no square of the map changed yet (changed: 'place:x,y' to the letter it's become), and
  for (const r of REQUESTS) p[r.id] = 'not asked';   // nothing hidden found yet (finds: the ids of AREA.hidden you've found),
  return Object.assign(p, {holding:{}, wanted:{}, picked:{}, bought:[], changed:{}, finds:{}, kept:{}, done:false,   // and no one keeping food for you (kept: who has what, the bag step),
    hide:{spot:null, wrong:0, won:0, last:null}, out:{}});   // and no one hiding (hide and seek, js/hide.js), nor out (out: animals that stay out once met, js/art.js)
}
function fresh(){ return {version:SAVE_VERSION, w:{}, gloss:{}, shells:0, friends:[], area:AREA.number, pos:{place:START.place,x:START.x,y:START.y,dir:'down'}, areas:{[AREA.number]:areaStart()}, started:false, sound:true, music:true, tasksSeen:{}, tasksRead:{}, tips:{}, pinyin:true, replyEn:true, fps:false, lines:{}, heard:{}, health:HEALTH, maxHealth:HEALTH, howto:false, met:[], encounters:0, today:{d:'',ids:[]}, bag:{}, wardrobe:{owned:[], wearing:[]}, following:[], turn:0}; }

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
  if (s.version === 5) s.version = 6;   // version 6 worked out XP from what you'd done (XP went in version 22)
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
  if (s.version === 21){   // version 21 had XP and levels, which did nothing: progress is the words you know
    delete s.xp;
    s.version = 22;
  }
  if (s.version === 22){   // version 22: the waterfall was in the meadow. It's at the top of the mountain path now, and a
    const a = (s.areas || {})[AREA.number];   // game that has read the story there has been up the path with the troop
    if (a && (a.story || (a.chapter || 0) >= 1)) a.climb = 3;
    s.version = 23;
  }
  if (s.version === 23){   // version 23: there were no battles. Your hearts start full.
    if (typeof s.hearts !== 'number') s.hearts = 5;
    s.version = 24;
  }
  if (s.version === 24){   // version 24: the way up the stream was one place, the path, with the waterfall at its top. It's three
    const a = (s.areas || {})[AREA.number] || {}, p = s.pos || {};   // places now: a game by the waterfall (past the boar) is put
    if (p.place === 'path'){                                         // in front of it again, any other at the bottom of the path
      const top = p.y <= 3 && (a.boar || (a.climb || 0) >= 2);
      s.pos = top ? {place:'falls', x:5, y:1, dir:'left'} : {place:'path', x:16, y:18, dir:'up'};
    }
    s.version = 25;
  }
  if (s.version === 25){   // version 25: the colours were 红, 黄 and 白. They're 红色, 黄色 and 白色 now: what you knew of them carries over
    const renamed = {'红':'红色', '黄':'黄色', '白':'白色'};
    for (const k of ['w', 'gloss', 'heard']) for (const [from, to] of Object.entries(renamed)){
      const o = s[k]; if (!o || !(from in o)) continue;
      if (!(to in o)) o[to] = o[from];
      delete o[from];
    }
    if (s.today && Array.isArray(s.today.ids)) s.today.ids = s.today.ids.map(w => renamed[w] || w);
    for (const a of Object.values(s.areas || {})) for (const [r, p] of Object.entries((a && a.picked) || {})) if (Array.isArray(p)) a.picked[r] = p.map(w => renamed[w] || w);
    s.version = 26;
  }
  if (s.version === 26){   // version 26: there was a prologue (chapter 0) before chapter 1. Now it's all chapter 1 (0, counting from 0)
    for (const a of Object.values(s.areas || {})) if (a && typeof a === 'object') a.chapter = 0;
    s.version = 27;
  }
  if (s.version === 27){   // version 27: bringing the troop up to the waterfall was climb 3, and they were there at once. Now they
    const a = (s.areas || {})[AREA.number];   // follow you up (climb 3, and following, filled in below), and 4 is when they've got there
    if (a && a.climb === 3) a.climb = 4;
    s.version = 28;
  }
  if (s.version === 28){   // version 28: a word came back for review after days (due). Now there are no days: the words are in one
    const caught = Object.values(s.w || {}).filter(r => r && r.lv >= 1).sort((a, b) => (a.due || 0) - (b.due || 0));   // list, worked
    caught.forEach((r, i) => { r.next = i; });   // through in turns: they go into it in the order they were due, the most overdue first
    for (const r of Object.values(s.w || {})) if (r) delete r.due;
    s.turn = 0;
    s.version = 29;
  }
  if (s.version === 29){   // version 29: the big monkey wanted flowers in the prologue. Now he wants them in chapter 1, to plant in front
    const a = (s.areas || {})[AREA.number];   // of the school once you've learned the colours there, so a game that has picked them,
    if (a){                                   // or brought them, is asked again then (the shells it had for them stay)
      a.flowers = 'not asked';
      if (a.holding) delete a.holding.flowers;
      if (a.picked) delete a.picked.flowers;
    }
    s.version = 30;
  }
  if (s.version === 30){   // version 30: you had hearts in battles, 5 at most. Now you have health, 10 for each heart, 50 at
    if (typeof s.health !== 'number') s.health = (typeof s.hearts === 'number' ? s.hearts : 5) * 10;   // most (decided 27 October 2026, so weapons, food and the
    s.maxHealth = 50;                                                  // story can make finer differences)
    delete s.hearts;
    s.version = 31;
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
  s.areas[AREA.number].changed = Object.assign({}, s.areas[AREA.number].changed);
  s.areas[AREA.number].finds = Object.assign({}, s.areas[AREA.number].finds);
  s.areas[AREA.number].kept = Object.assign({}, s.areas[AREA.number].kept);
  s.areas[AREA.number].out = Object.assign({}, s.areas[AREA.number].out);
  s.areas[AREA.number].hide = Object.assign({spot:null, wrong:0, won:0, last:null}, s.areas[AREA.number].hide);
  if (typeof s.maxHealth !== 'number' || !(s.maxHealth > 0)) s.maxHealth = HEALTH;
  s.health = typeof s.health === 'number' ? Math.max(0, Math.min(s.maxHealth, s.health)) : s.maxHealth;
  if (!Array.isArray(s.met)) s.met = [];
  if (!s.bag || typeof s.bag !== 'object' || Array.isArray(s.bag)) s.bag = {};
  s.following = Array.isArray(s.following) ? s.following.filter(id => AREA.characters.some(c => c.id === id)) : [];   // who's following you (characters still here)
  const clothes = w => [...(w || [])].filter(i => (AREA.wardrobe || []).some(c => c.item === i));   // only what the wardrobe has now
  s.wardrobe = {owned:clothes((s.wardrobe || {}).owned), wearing:clothes((s.wardrobe || {}).wearing)};
  return s;
}
// Keeps a copy of an old or unreadable save in the browser, in case anything goes wrong. Never overwritten.
function keepBackup(label, raw){
  try { const k = KEY + '-backup-' + label; if (localStorage.getItem(k) === null) localStorage.setItem(k, raw); } catch(e) {}
}
// Three games (save slots), so two people can share a phone. Each is kept in the browser under its own name:
// Game 1 under KEY, where the one game always was, and Games 2 and 3 beside it. KEY-slots remembers which game
// you're playing and when each was last played.
const SLOTS = [1, 2, 3];
const slotKey = n => n === 1 ? KEY : `${KEY}-game${n}`;
function slotsInfo(){ try { const d = JSON.parse(localStorage.getItem(KEY + '-slots')); if (d && typeof d === 'object') return {active:1, played:{}, ...d}; } catch(e) {} return {active:1, played:{}}; }
function setSlotsInfo(change){ try { localStorage.setItem(KEY + '-slots', JSON.stringify(change(slotsInfo()))); } catch(e) {} }
// A game from the browser, brought up to date (keeping a copy of an old or unreadable one first).
function loadSave(n = 1){
  let raw = null;
  try { raw = localStorage.getItem(slotKey(n)); } catch(e) {}
  if (!raw) return fresh();
  const tag = n === 1 ? '' : `game${n}-`;
  let data = null;
  try { data = JSON.parse(raw); } catch(e) {}
  if (!data || typeof data !== 'object' || Array.isArray(data)){ keepBackup(tag + 'unreadable', raw); return fresh(); }
  if (data.version === SAVE_VERSION) return upgradeSave(data);
  keepBackup(tag + 'v' + (data.version || 2), raw);   // the old save, exactly as it was, before converting it
  const s = upgradeSave(data);
  try { localStorage.setItem(slotKey(n), JSON.stringify(s)); } catch(e) {}
  return s;
}
// What the title screen shows about game n: null if it's empty (never started).
function slotSummary(n){
  if (n === SLOT) return S.started ? summaryOf(S, n) : null;
  let data = null;
  try { data = JSON.parse(localStorage.getItem(slotKey(n))); } catch(e) {}
  if (!data || typeof data !== 'object' || Array.isArray(data) || !data.started || (data.version || 2) > SAVE_VERSION) return null;
  return summaryOf(upgradeSave(data), n);
}
function summaryOf(s, n){
  const area = s.areas[AREA.number] || {}, chapter = AREA.chapters[area.chapter || 0] || AREA.chapters[0];
  return {n, shells:s.shells || 0, friends:s.friends.length,
    words:Object.values(s.w).filter(x => x && x.lv > 0).length, chapter, played:slotsInfo().played[n] || 0,
    ...(() => { const keep = S; S = s; try { return {practise:practiceWords().length, where:practiseWhere()}; } finally { S = keep; } })()};   // (they read S)
}
// Plays game n from now on: it's remembered as the game you're playing.
function useSlot(n){ SLOT = n; S = loadSave(n); setSlotsInfo(d => ({...d, active:n})); }
// A new game in slot n, keeping your sound and reading settings.
function newGameIn(n){
  const keep = {sound:S.sound, music:S.music, pinyin:S.pinyin, replyEn:S.replyEn, fps:S.fps};
  SLOT = n; S = Object.assign(fresh(), keep); setSlotsInfo(d => ({...d, active:n}));
}
// Deletes game n, keeping a copy in the browser just in case. Deleting the game you're playing leaves a new one.
function deleteSlot(n){
  try { const raw = localStorage.getItem(slotKey(n)); if (raw) keepBackup(`deleted-game${n}-${Date.now()}`, raw); localStorage.removeItem(slotKey(n)); } catch(e) {}
  setSlotsInfo(d => { const played = {...d.played}; delete played[n]; return {...d, played}; });
  if (n === SLOT){ const keep = {sound:S.sound, music:S.music, pinyin:S.pinyin, replyEn:S.replyEn, fps:S.fps}; S = Object.assign(fresh(), keep); }
}
// Game n as a file to download (Copy to a file), to keep it safe or carry it to another device.
function saveFile(n = SLOT){
  const d = new Date(), two = x => String(x).padStart(2, '0');
  let text = n === SLOT ? JSON.stringify(S) : null;
  if (text === null) try { text = localStorage.getItem(slotKey(n)); } catch(e) {}
  return {name:`little-monkey-game${n}-${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}.json`, text};
}
// A downloaded save, brought up to date: {save}, or {error} saying what's wrong with the file.
function readSaveFile(text){
  let data = null;
  try { data = JSON.parse(text); } catch(e) {}
  if (!data || typeof data !== 'object' || Array.isArray(data) || !data.w || typeof data.w !== 'object') return {error:"That file isn't a Little Monkey save."};
  if ((data.version || 2) > SAVE_VERSION) return {error:'That save is from a newer version of the game. Reload the page to get the newest version, then try again.'};
  return {save:upgradeSave(data)};
}
// Plays on from a loaded save in game n (an empty slot), keeping a copy of anything that was there.
function useSave(s, n = SLOT){
  try { const raw = localStorage.getItem(slotKey(n)); if (raw) keepBackup(`before-load-${n === 1 ? '' : 'game' + n + '-'}${Date.now()}`, raw); } catch(e) {}
  SLOT = n; S = s; setSlotsInfo(d => ({...d, active:n})); save();
}
let SLOT = SLOTS.includes(slotsInfo().active) ? slotsInfo().active : 1;   // the game you're playing
let S = loadSave(SLOT);
const here = () => S.areas[AREA.number];   // your progress in the area you're in
function save(){
  try { localStorage.setItem(slotKey(SLOT), JSON.stringify(S)); } catch(e) {}
  if (S.started) setSlotsInfo(d => ({...d, active:SLOT, played:{...d.played, [SLOT]:Date.now()}}));
  updateHUD();
}
const lvl = w => (S.w[w] && S.w[w].lv) || 0;
function rec(w){ if (!S.w[w]) S.w[w] = {lv:0, ok:0}; return S.w[w]; }
function todayKey(){ const d = new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function addToday(w){ const k = todayKey(); if (S.today.d !== k) S.today = {d:k, ids:[]}; if (!S.today.ids.includes(w)) S.today.ids.push(w); }
// A sentence was shown: each word in it (not punctuation) counts as heard once more.
function hear(words, heard = S.heard){ for (const t of words) if (WORDS[t] || GLOSS[t]) heard[t] = (heard[t] || 0) + 1; }
function setSeen(w){ const r = rec(w); if (r.lv < 1){ r.lv = 1; r.ok = 0; slotIn(w, NEW_PLACE); } addToday(w); save(); }   // a new word goes near the front of the review list
// You used w in a sentence (a request or a shop order). It's Used once you can read it as well.
function useWord(w){ const r = rec(w); r.used = 1; if (r.lv === 3) r.lv = 4; addToday(w); save(); }
// Questions get harder slowly. A word moves up from Caught to Recognised after STEP_UP right answers in a
// row picking it by sound (listen), then to Read after STEP_UP more picking it from its characters (read).
// A word without a picture (我 要) moves up the same way when you fill the gap in a sentence with it (fill).
// A wrong answer moves it back down a level. In each word's record: lv its level, n right answers in a
// row at that level, ok right answers in a row (for the review list, below), used once you've used it.
const STEP_UP = 2;
function answer(w, ok, type){
  const r = rec(w);
  if (ok){
    r.n = (r.n || 0) + 1;
    const up = type === 'fill' ? !WORDS[w].pic && r.lv < 3 : (type === 'listen' && r.lv === 1) || (type === 'read' && r.lv === 2);
    if (r.n >= STEP_UP && up){ r.lv++; r.n = 0; }
    if (r.lv === 3 && r.used) r.lv = 4;
  } else { r.lv = Math.max(1, r.lv - 1); r.n = 0; }
  reviewed(w, ok);
  addToday(w); save();
}

// The review list (decided 20 October 2026: no days). Every word you've caught is in one list, worked through in
// turns: S.turn counts every question you answer, and each word's place is its turn number (next), lowest first.
// A new word goes in behind the first NEW_PLACE words you got right last time, and a word you get wrong behind the
// first WRONG_PLACE, so they come back within a few questions, however many words are waiting. (Only behind words
// you got right: words you keep missing never fill the front between them, keeping every other word waiting.)
// A word you get right comes back RIGHT_GAPS questions later, more the more times in a row you've got it right.
// Because the count only goes up, every word's turn comes round: nothing gets stuck at the back. Questions pick at random from the first few that
// suit them (nextWords), so you can't tell what's coming. A word needs practice until you've got it right twice
// in a row (new, or missed since): the practice post's !, its shells and the title screen count those.
const NEW_PLACE = 3, WRONG_PLACE = 2, RIGHT_GAPS = [4, 8, 16, 32, 64], PICK_FROM = 3;
const reviewKey = w => { const n = (S.w[w] || {}).next; return typeof n === 'number' ? n : -1e9; };
const reviewOrder = words => [...words].sort((a, b) => (reviewKey(a) - reviewKey(b)) || (lvl(a) - lvl(b)));   // (the least known first, if level)
const nextWords = (words, n = 1) => shuffle(reviewOrder(words).slice(0, n + PICK_FROM - 1)).slice(0, n);   // n of them, from near the front
const needsPractice = w => (rec(w).ok || 0) < 2;
function slotIn(w, place){   // w goes into the review list behind the first place words you got right last time (or at the end)
  const others = ORDER.filter(x => x !== w && lvl(x) >= 1), right = others.filter(x => rec(x).ok > 0).map(reviewKey).sort((a, b) => a - b);
  rec(w).next = right.length > place ? (right[place - 1] + right[place]) / 2 : others.length ? Math.max(...others.map(reviewKey)) + 1 : S.turn || 0;
}
function reviewed(w, ok){   // you answered a question about w: a turn goes by, and it moves in the review list
  if (lvl(w) < 1) return;
  const r = rec(w);
  S.turn = (S.turn || 0) + 1;
  if (ok){ r.ok = (r.ok || 0) + 1; r.next = S.turn + RIGHT_GAPS[Math.min(r.ok, RIGHT_GAPS.length) - 1]; }
  else { r.ok = 0; slotIn(w, WRONG_PLACE); }
}
