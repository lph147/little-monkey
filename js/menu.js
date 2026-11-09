// The menu: big tiles for your words, tasks and friends, and a Settings page.

/* ================= MENU ================= */
// The menu's tiles, with Chinese, pinyin and English (the Chinese is on the review sheet, CHINESE.md).
const MENU_TILES = [
  {m:'words', icon:'📜', zh:'词', py:'cí', en:'Words'},   // each tile's English is what its Chinese means
  {m:'practice', icon:'🎯', zh:'练习', py:'liànxí', en:'Practice'},   // quick practice (js/scrolls.js), beside your words
  {m:'tasks', icon:'📋', zh:'任务', py:'rènwu', en:'Tasks'},
  {m:'bag', icon:'👝', zh:'包', py:'bāo', en:'Bag'},
  {m:'friends', icon:'🐾', zh:'朋友', py:'péngyou', en:'Friends'},
  {m:'wardrobe', icon:'👕', zh:'衣服', py:'yīfu', en:'Clothes'}
];   // (Save is a small button by Settings since 30 October 2026, so the tiles fit one row on a phone: it saves by itself anyway)
function openMenu(focusId){
  const fresh = scrollNew().length;   // (words new in your Word Scroll: the 词 tile says how many, js/scrolls.js)
  openCard(`<p class="label">${ui('Menu')}</p>${statsHTML()}
    <div class="menu">
      <div class="tiles">${MENU_TILES.map(t => `<button class="mtile" data-m="${t.m}" data-label="${LEARN === 'en' ? t.zh : t.en}">${t.m === 'words' && fresh ? `<span class="mnew" aria-label="${ui('{n} new words', {n:fresh})}">${fresh}<span class="w">${ui(' new')}</span></span>` : ''}<span class="micon" aria-hidden="true">${t.icon}</span>${LEARN === 'en' ? `<span class="mzh"${LANG}>${t.en}</span><span class="mpy"></span><span class="men">${t.zh}</span>` : `<span class="mzh">${t.zh}</span><span class="mpy">${t.py}</span><span class="men">${t.en}</span>`}</button>`).join('')}</div>
      <div class="menurow"><button class="btn" data-m="settings">${ui('⚙ Settings')}</button><button class="btn" data-m="save">${ui('💾 Save')}</button></div>
    </div>
    <div class="actions"><button class="btn" data-a="close" data-b>${ui('Close')}</button></div>`);
  const f = sheet.querySelector(`[data-m="${focusId || MENU_TILES[0].m}"]`); if (f) f.focus();
  on('[data-a=close]', () => closeCard());
  const act = {
    tasks: () => tasksPage(() => openMenu('tasks')),
    wardrobe: () => wardrobePage(() => openMenu('wardrobe')),
    bag: () => bagPage(() => openMenu('bag')),
    save: () => { save(); closeCard(); toast(ui('💾 Saved: Game {n}, just now. It also saves by itself as you play.', {n:SLOT})); },
    words: () => openScroll(() => openMenu('words')),
    practice: () => quickPractice(() => openMenu('practice')),
    friends: () => friendsPage(() => openMenu('friends')),
    settings: () => openSettings()
  };
  sheet.querySelectorAll('[data-m]').forEach(bt => bt.onclick = () => { SFX.blip(); act[bt.dataset.m](); });
}

// 朋友 Friends: every animal of the chapters you've reached (decided 30 October 2026, so there's something to look for as you
// explore): your friends in colour, one you've met but not won over in colour too (Not a friend yet; the bees, how many of
// the six are your friends), and the rest as shadows with a clue to where they live; tap one for its clue. Then the troop
// and others, friends you make through the story, only once they're your friends, so the story's never given away. Tap a
// friend whose name is a word you know, and its page opens, as in the Word Scroll, with its English and how it's made
// behind the English button (decided 24 October 2026); a monkey's name isn't a word, so tapping it says the name. focus:
// the friend to come back to.
const isFriend = a => S.friends.includes(a.id) && !(a.many && (here()[a.counts] || 0) < a.many);   // (the bees: all six)
const friendAnimals = () => ANIMALS.filter(inChapter);
function friendsPage(back, focus){
  const page = w => !!WORDS[w] && lvl(w) > 0, animals = friendAnimals();
  const named = (a, note = '') => `<button data-w="${a.hz}" data-label="${ui(page(a.hz) ? 'Open' : 'Hear it')}"${note ? ' class="fmet"' : ''}>${portrait(a.id)}<span class="fz"${LANG}>${wd(a.hz)}</span><span class="small">${wpy(a.hz)}</span>${note ? `<span class="fnote">${note}</span>` : ''}</button>`;
  const card = a => isFriend(a) ? named(a)
    : S.met.includes(a.id) ? named(a, a.many ? `<b>${here()[a.counts] || 0}/${a.many}</b>` : ui('Not a friend yet'))
    : `<button class="fshadow" data-clue="${a.id}" data-label="${ui('Where?')}"><span class="sil">${portrait(a.id)}</span><span class="fz">？</span><span class="fnote">${esc(ui(a.clue))}${WHEN[a.time] ? ' ' + WHEN[a.time].icon : ''}</span></button>`;   // (a sun or a moon: only out by day, or after dark)
  const isPerson = id => AREA.characters.some(c => c.id === id && c.person), others = S.friends.filter(id => !ANIMALS.some(a => a.id === id) && !isPerson(id)), people = S.friends.filter(isPerson);   // (people you've helped: their own section)
  openCard(`<p class="label">${ui('Friends')} <span class="fcount">${ui('{n} of {of} animals', {n:animals.filter(isFriend).length, of:animals.length})}</span></p>
    <div class="friends" data-nav>${animals.map(card).join('')}</div>
    ${others.length ? `<p class="label fsub">${ui('The troop and others')}</p><div class="friends" data-nav>${others.map(id => { const hz = FRIEND_NAMES[id] || id; return `<button data-w="${hz}" data-label="${ui(page(hz) ? 'Open' : 'Hear it')}">${portrait(id)}<span class="fz"${LANG}>${WORDS[hz] ? wd(hz) : LEARN === 'en' && NAMES[id] ? esc(NAMES[id].en) : hz}</span><span class="small">${WORDS[hz] ? wpy(hz) : LEARN === 'en' ? (NAMES[id] || {}).zh || '' : (NAMES[id] || {}).py || ''}</span></button>`; }).join('')}</div>` : ''}
    ${people.length ? `<p class="label fsub">${ui('People')}</p><div class="friends" data-nav>${people.map(id => { const pn = nameShown(NAMES[id] || {zh:id, py:'', en:''}); return `<button data-w="${(NAMES[id] || {}).zh || id}" data-label="${ui('Hear it')}">${portrait(id)}<span class="fz"${pn.lang ? LANG : ''}>${pn.zh || id}</span><span class="small">${esc(pn.en || '')}</span></button>`; }).join('')}</div>` : ''}
    <div class="actions"><button class="btn primary" data-a="ok" data-b>${ui('Back')}</button></div>`);
  sheet.querySelectorAll('.friends button[data-w]').forEach(bt => bt.onclick = () => { const w = bt.dataset.w; if (page(w)){ SFX.blip(); wordPage(w, () => friendsPage(back, w), ui('Friends')); } else say(LEARN === 'en' && !EN[w] ? bt.querySelector('.fz').textContent : w); });
  sheet.querySelectorAll('.friends button[data-clue]').forEach(bt => bt.onclick = () => { SFX.blip(); friendClue(ANIMALS.find(a => a.id === bt.dataset.clue), () => friendsPage(back, bt.dataset.clue)); });
  on('[data-a=ok]', back);
  const f = focus && sheet.querySelector(`.friends [data-w="${focus}"], .friends [data-clue="${focus}"]`); if (f) f.focus();
}
// When an animal's about, if only by day or after dark (its time: js/art.js's awakeNow), with a sun or a moon.
const WHEN = {day:{icon:'☀️', get text(){ return ui('by day'); }}, night:{icon:'🌙', get text(){ return ui('after dark'); }}};
// A friend still to find: its shadow, bigger, and where it lives.
function friendClue(a, back){
  openCard(`<p class="label">${ui('A friend to find')}</p><div class="fclue"><span class="sil">${portrait(a.id)}</span><div><p class="fz">？</p><p>${WHEN[a.time] ? ui('{clue}, {when}.', {clue:esc(ui(a.clue)), when:WHEN[a.time].text}) : ui('{clue}.', {clue:esc(ui(a.clue))})}${WHEN[a.time] ? ' ' + WHEN[a.time].icon : ''}</p><p class="small">${ui('Find it, and answer its questions to make friends.')}</p></div></div>
    <div class="actions"><button class="btn primary" data-a="ok" data-b>${ui('Back')}</button></div>`);
  on('[data-a=ok]', back);
}
// 衣服 Wardrobe: the clothes you own. Tap one to put it on (your monkey says so, such as 我戴头带, which
// teaches 戴 the first time and counts as using the words) or to take it off.
// 包 Bag: what you carry, in tabs (decided 27 October 2026, so it stays tidy as it fills up): 零食 Snacks (the food you can
// carry, decided 5 November 2026; a meal, such as a bowl of rice, you eat there and then: the eat step), how many of each
// and what it does (tap food that brings health back to eat it, if you're hurt, or food that gives you energy, such as
// honey, to walk faster for a while, unless you're full of energy already); For someone, what you're carrying for
// someone, and who for; and To fight with, your weapon and how hard it hits. Only tabs with something in them show
// (none at all for just one), each its things as tiles; it opens on Snacks (tab: another), what you open it for, and left
// and right on the D-pad switch tabs, as in the Word Scroll. Tapping anything but food says its word. note: what just
// happened. Later areas can add a tab here, for other kinds of thing.
const BAG_TABS = [
  {id:'food', name:'Snacks', zh:'零食', py:'língshí', things:() => Object.keys(FOOD).filter(w => S.bag[w] > 0)
    .map(w => ({w, does:ui(FOOD[w].does), label:ui(FOOD[w].heal || FOOD[w].fast || FOOD[w].stink ? 'Eat' : 'Hear'), count:S.bag[w]}))},
  {id:'someone', name:'For someone', things:() => Object.entries(here().holding).filter(([id, w]) => w && (WORDS[w] || GLOSS[w]) && (AREA.requests[id] || (AREA.holdingFor || {})[id]))   // (who for: the request's, or the area's holdingFor, such as the lingzhi for the master, a word you only hear; not what you collected where it stays, such as sacks put on a boat)
    .map(([id, w]) => ({w, does:LEARN === 'en' ? ui('For {who}', {who:((NAMES[(AREA.requests[id] || {}).from || (AREA.holdingFor || {})[id]] || {}).zh || '猴群')}) : `The ${((NAMES[(AREA.requests[id] || {}).from || (AREA.holdingFor || {})[id]] || {}).en || 'troop').replace(/^(the|an?) /i, '').toLowerCase()}`, label:ui('Hear')}))},   // (The master, not The the master)
  {id:'fight', name:'To fight with', things:() => canBattle() && weaponNow() ? [{w:weaponNow(), does:ui('Hits for {n}', {n:weaponHits()}), label:ui('Hear')}] : []},   // (your weapon now, such as the Demon of Havoc's broadsword)
  {id:'fishing', name:'For fishing', things:() => !canFish() ? [] : [{w:FISH.rod, does:ui('A at water with fish in it'), label:ui('Hear')},   // (js/fishing.js)
    ...(FISH.bait && S.bag[FISH.bait] > 0 ? [{w:FISH.bait, does:ui('A big fish bites next'), label:ui('Hear'), count:S.bag[FISH.bait]}] : [])]},
  // the treasures you've found, for the 老板 to buy (js/trade.js: decided 9 November 2026, the trade plan), and the tools
  // you've bought from him
  {id:'treasures', name:'Treasures', zh:'宝贝', py:'bǎobèi', things:() => TREASURE_WORDS.filter(w => S.bag[w] > 0).map(w => ({w, does:ui('Sells for {n} {money}', {n:priceOf(w), money:MONEY()}), label:ui('Hear'), count:S.bag[w]}))},
  {id:'tools', name:'Tools', things:() => (S.tools || []).filter(w => WORDS[w]).map(w => ({w, does:ui(TOOL_DOES[w] || ''), label:ui('Hear')}))}
];
const TOOL_DOES = {'篮子':'Carry two more of every snack', '灯笼':'A light round you at night', '铲子':'Dig up roots'};   // (what each tool does, in your bag)
function bagPage(back, focus, note, tab){
  const card = ({w, does, label, count}) => `<button class="card bagitem" data-w="${w}" data-label="${label}"><div class="c" aria-hidden="true">${picHTML(w)}</div>`
    + `${count ? `<span class="count">×${count}</span>` : ''}<div class="hz"${LANG}>${wd(w)}</div><div class="p">${LEARN === 'en' ? (WORDS[w] ? wpy(w) : '') : WORDS[w] ? WORDS[w].py : GLOSS[w][0]}</div><div class="small">${esc(does)}</div></button>`;
  const tabs = BAG_TABS.map(t => ({...t, list:t.things()})).filter(t => t.list.length), now = tabs.find(t => t.id === tab) || tabs[0];
  openCard(`<div class="bag"><div class="baghead"><p class="label">${LEARN === 'en' ? `<span${LANG}>Bag</span> · 包` : '包 bāo · Bag'}</p>
    <div class="stats">${healthHTML(health(), maxHealth(), true)}${moneyHTML()}</div>${note ? `<p class="note">${esc(ui(note))}</p>` : ''}</div>
    ${tabs.length > 1 ? `<div class="scrolltabs bagtabs" role="tablist">${tabs.map(t => `<button class="tab" role="tab" data-tab="${t.id}" aria-selected="${t === now}">${LEARN === 'en' ? ui(t.name) : `${t.zh ? `${t.zh} <span class="tpy">${t.py}</span> ` : ''}${t.name}`}</button>`).join('')}</div>` : ''}
    ${now ? `<div class="menu grid" data-nav>${now.list.map(card).join('')}</div>` : `<p class="hint">${ui('Nothing in your bag yet. Fruit trees, friends and the shop have things to put in it.')}</p>`}</div>
    <div class="actions"><button class="btn primary" data-a="ok" data-b>${ui('Back')}</button></div>`);   // (outside the bag, so Back stays at the card's bottom however full it is)
  const f = sheet.querySelector(`.bagitem[data-w="${focus}"]`) || sheet.querySelector('.bagitem'); if (f) f.focus();
  sheet.querySelectorAll('.bagtabs .tab').forEach(b => b.onclick = () => { if (b.dataset.tab !== now.id){ SFX.turn(); bagPage(back, null, null, b.dataset.tab); } });
  on('[data-a=ok]', back);
  sheet.querySelectorAll('.bagitem').forEach(b => b.onclick = () => {
    const w = b.dataset.w, food = FOOD[w];
    if (food && food.stink){   // smelly food, such as a durian: you eat it out on the map (eatSmelly, js/world.js)
      if (isStinky()){ SFX.bump(); bagPage(back, w, ui('You still smell of the {w}: keep it for later.', {w:wz(stinkFood || w)})); return; }
      closeCard(); eatSmelly(w, food);
      return;
    }
    if (food && food.fast){
      if (isFast()){ SFX.bump(); bagPage(back, w, 'You’re full of energy already: keep it for later.'); return; }
      S.bag[w]--; energise(w, food.fast); useWord(w); save(); SFX.right();
      bagPage(back, w, ui('You eat some {w}: you’re full of energy! You walk faster for a while.', {w:wz(w)}));
      return;
    }
    if (!food || !food.heal){ say(w); return; }
    if (!hurt()){ SFX.bump(); bagPage(back, w, 'Your health is full: keep it for when you’re hurt.'); return; }
    S.bag[w]--; S.health = Math.min(maxHealth(), health() + food.heal); useWord(w); save(); SFX.right();
    bagPage(back, w, ui('You eat a {w}: {heal}.', {w:wz(w), heal:healText(w)}));
  });
}
function wardrobePage(back, focus){
  // what you own, in each colour you have it (CLOTHES, js/data.js); still to find: what the shop could sell you now
  const own = CLOTHES.filter(c => S.wardrobe.owned.includes(c.item)), more = CLOTHES.filter(c => !S.wardrobe.owned.includes(c.item) && (c.item === c.word || lvl(c.colour) >= 1)).length;
  openCard(`<p class="label">${LEARN === 'en' ? `<span${LANG}>Clothes</span> · 衣服` : '衣服 yīfu · Clothes'}</p>
    ${own.length ? `<p class="small">${ui('Tap something to put it on or take it off.')}</p><div class="menu grid">${own.map(c => { const on = wearing(c.item), a = asSaid(c);
      return `<button class="card wear${on ? ' on' : ''}" data-w="${c.item}" data-label="${ui(on ? 'Take off' : 'Put on')}"><div class="c" aria-hidden="true">${picHTML(a.pic)}</div><div class="hz"${LANG}>${a.zh}</div><div class="p">${a.py}</div><div class="small">${ui(on ? 'Wearing' : 'Put on')}</div></button>`; }).join('')}</div>`
      : `<p class="hint">${ui('Nothing to wear yet. Clothes come from the shop and from friends.')}</p>`}
    ${more ? `<p class="small">${ui('{n} more to find.', {n:more})}</p>` : ''}
    <div class="actions"><button class="btn primary" data-a="ok" data-b>${ui('Back')}</button></div>`);
  if (focus){ const f = sheet.querySelector(`.wear[data-w="${focus}"]`); if (f) f.focus(); }
  on('[data-a=ok]', back);
  sheet.querySelectorAll('.wear').forEach(b => b.onclick = async () => {
    const c = CLOTHES.find(x => x.item === b.dataset.w), w = S.wardrobe.wearing, a = asSaid(c);
    if (wearing(c.item)){ w.splice(w.indexOf(c.item), 1); save(); redress(); SFX.blip(); wardrobePage(back, c.item); return; }
    putOn(c.item); save(); redress(); closeCard();   // (another headband comes off first: one at a time)
    if (c.teach && lvl(c.teach) === 0) await showNotice(c.teach, {...(c.note ? {note:fill(c.note)} : {}), quiet:true});   // such as 戴, the first time
    toks(a.sentence).forEach(t => { if (WORDS[t]) useWord(t); });
    await showDialog(speaker('player'), {t:[...toks(a.sentence), '。'], en:a.sentenceEn}, {teach:c.teach || c.word});
  });
}
// Your words, friends and shells: at the top of the menu and your tasks.
// The words you've caught (decided 27 October 2026: 20/81 words was unclear; the 81, all the area's words, is on the Word Scroll)
const wordsCaught = () => ORDER.filter(w => lvl(w) > 0).length;
const statsHTML = () => `<div class="stats"><span>${ui(wordsCaught() === 1 ? '{n} word caught' : '{n} words caught', {n:wordsCaught()})}</span><span>${ui(S.friends.length === 1 ? '{n} friend' : '{n} friends', {n:S.friends.length})}</span>${moneyHTML()}</div>`;
// 任务 Tasks (Select, or the menu's tile): what to do now, full width, with how much of the chapter you've done; its
// checklist is a page of its own (Checklist ▸, and ◂ Tasks back), so the two lists are never side by side, saying the
// same thing twice (decided 25 October 2026: they were). back: what Back does. page: 'list' for the checklist.
// Opening it counts as looking at your tasks, so Select's red dot goes. The yellow arrow shows the way for one task, marked
// with an arrow here: the newest, or the one you tap (one with somewhere to show you), which it follows instead (aimedTask(),
// js/world.js).
function tasksPage(back, page = 'now', focus = null){
  const tasks = [...getTasks()].sort((a, c) => c.main - a.main);   // (the story's main task first, with a gold star: then the rest, Also)
  tasks.forEach(t => { S.tasksRead[t.id] = 1; }); save();
  const ch = AREA.chapters[chapterNow()], found = areaChecklist().filter(([, , , f]) => f);
  const aimed = aimedTask(tasks), choose = tasks.filter(t => t.arrow).length > 1;   // (a choice only with two or more to show the way for)
  const whereHTML = t => t.where ? `<span class="where">${esc(ui(t.where))}</span>` : '';   // (where it's done, when that's not where you are)
  const taskHTML = t => `<li class="${[t === aimed ? 'aim' : '', t.main ? 'main' : ''].join(' ').trim()}">${t.main ? '<span class="star" aria-hidden="true"></span>' : ''}${choose && t.arrow ? `<button class="taskbtn" data-t="${esc(t.id)}">${esc(t.text)}${whereHTML(t)}</button>` : `<span>${esc(t.text)}${whereHTML(t)}</span>`}${t.clue ? clueTaskHTML(t.clue) : ''}</li>`;
  const chapter = `${esc(ui(ch.name))}${ui(': ')}${esc(ui(ch.title))}`, progress = ui('{n} of {of} done so far', {n:found.filter(([, done]) => done).length, of:found.length});
  if (page === 'list'){
    openCard(`<div class="cardtop"><p class="label taskslabel">${chapter}</p><span class="taskprog">${progress}</span></div>
      <div class="checkpage">${checklistHTML(false)}</div>
      <div class="actions"><button class="btn grow" data-a="now">${ui('◂ Tasks')}</button><button class="btn primary" data-a="ok" data-b>${ui('Back')}</button></div>`);
    on('[data-a=now]', () => tasksPage(back));
    on('[data-a=ok]', back);
    return;
  }
  // the journey: the area's goal, and the part of the story you're in, with what you're doing in it (partNow, js/world.js),
  // unless the main task below says so
  const part = partNow(), goal = textNow(AREA.goal), journey = goal ? `<div class="journey"><p><span class="jlabel">${ui('Your journey')}</span> ${esc(ui(goal))}</p>${part ? `<p class="jpart"><b>${esc(ui(part.name))}${ui(': ')}${esc(ui(part.title))}${ui('.')}</b>${tasks.some(t => t.main) ? '' : ' ' + esc(ui(textNow(part.now)))}</p>` : ''}${whoKnowsHTML()}</div>` : '';
  const also = tasks.some(t => t.main) && tasks.some(t => !t.main);
  openCard(`<div class="cardtop"><p class="label taskslabel">${ui('Tasks')}</p>${statsHTML()}</div>
    <div class="nowpage">${journey}<p class="label">${ui('Now')}${choose ? ` <span class="aimhint">${ui('Tap a task for the yellow arrow to show its way')}</span>` : ''}</p>${tasks.length ? `<ul class="tasks${also ? ' withalso' : ''}"${choose ? ' data-nav' : ''}>${tasks.map((t, i) => (also && !t.main && tasks[i - 1] && tasks[i - 1].main ? `<li class="alsolabel" aria-hidden="true">${ui('Also')}</li>` : '') + taskHTML(t)).join('')}</ul>` : `<p class="hint">${esc(tasksHint() || ui('Nothing to do right now.'))}</p>`}
    <p class="taskprog">${chapter} · ${progress}</p></div>
    <div class="actions"><button class="btn grow" data-a="list">${ui('Checklist ▸')}</button><button class="btn primary" data-a="ok" data-b>${ui('Back')}</button></div>`);
  on('[data-a=list]', () => tasksPage(back, 'list'));
  on('[data-a=ok]', back);
  sheet.querySelectorAll('.taskbtn').forEach(b => b.onclick = () => { followTask(b.dataset.t); SFX.blip(); tasksPage(back, 'now', b.dataset.t); });
  if (focus){ const f = [...sheet.querySelectorAll('.taskbtn')].find(b => b.dataset.t === focus); if (f) f.focus(); }
  const clue = tasks.find(t => t.clue);
  if (clue){ bindTokens(sheet.querySelector('.taskclue')); on('[data-a=clue]', () => say(lineSay(L[clue.clue.say]), null, HIDE.by)); }
  sheet.querySelectorAll('.whoknows .face').forEach(b => b.onclick = () => { SFX.blip(); sheet.querySelector('.whoinfo').textContent = b.dataset.info; });
}
// Who knows? (the area's askList, decided 5 November 2026: the human world's purpose, asking everyone where the immortals
// are): under your journey, while its show matches, the faces of the people to ask, each ticked once you've asked them
// (asked: the key that says so), a shadow till then, and the one who knows, a ? till they've told you (done). Tap a face
// to see who it is, where, and whether you've asked them.
function whoKnowsHTML(){
  const k = AREA.askList;
  if (!k || !matches(k.show)) return '';
  const where = id => { const n = ALL_NPCS.find(c => c.id === id), p = n && PLACES[n.home.place]; return p ? (LEARN === 'en' ? p.name.zh : p.name.en) : ''; };
  const who = id => { const n = NAMES[id] || {}; return LEARN === 'en' ? `${n.en || ''} · ${n.zh || ''}` : `${n.zh || ''} ${n.py || ''} · ${n.en || ''}`; };
  const asked = k.people.filter(p => here()[p.asked]).length, done = matches(k.done);
  const face = p => { const yes = !!here()[p.asked]; return `<button class="face${yes ? ' asked' : ''}" data-info="${esc(`${who(p.who)} · ${where(p.who)} · ${ui(yes ? 'Asked: they don’t know' : 'Not asked yet: help them first')}`)}">${portrait(p.who)}</button>`; };
  const last = done ? `<button class="face knows" data-info="${esc(`${who(k.knows)} · ${where(k.knows)} · ${ui('They knew!')}`)}">${portrait(k.knows)}</button>`
    : `<button class="face who" data-info="${esc(ui('Someone who knows. Who can it be?'))}"><span>?</span></button>`;
  return `<div class="whoknows"><p><span class="jlabel">${esc(ui(k.title))}</span> ${ui('<b>{n} of {of}</b> asked', {n:asked, of:k.people.length})}</p><div class="faces">${k.people.map(face).join('')}${last}</div><p class="whoinfo small">${ui('Tap a face to see who it is.')}</p></div>`;
}

/* ================= SETTINGS ================= */
// Sound, pinyin, English on reply choices (for players who know some Chinese already), How to play, the opening (and the area's
// other scenes, such as becoming king, once you've seen them) and the title screen
// (where your games are: to switch, start a new one, copy one to a file or delete one). The game saves by itself.
const SPEED_SAMPLE = '你好';   // (what's said as you change the voice speed)
function openSettings(focusId){
  const onOff = v => ui(v ? 'On' : 'Off');
  openCard(`<p class="label">${ui('Settings')}</p>
    <div class="menu twocol">
      <button class="btn" data-m="music" data-label="${ui('Music')}">${ui('Music')} <span class="val">${onOff(S.music)}</span></button>
      <button class="btn" data-m="sound" data-label="${ui('Sound')}">${ui('Sound effects')} <span class="val">${onOff(S.sound)}</span></button>
      ${LEARN === 'en' ? `<button class="btn" data-m="ipa" data-label="音标">${ui('IPA over words')} <span class="val">${onOff(S.ipa)}</span></button><button class="btn" data-m="script" data-label="${traditionalNow() ? '简体' : '繁體'}">${ui('Chinese characters')} <span class="val">${traditionalNow() ? '繁體' : '简体'}</span></button>`   // (learning English: the 音标 over each word, off to start with)
        : `<button class="btn" data-m="pinyin" data-label="Pinyin">Pinyin over words <span class="val">${S.pinyin ? 'On' : 'Off'}</span></button>`}
      <button class="btn" data-m="replyEn" data-label="${ui('English')}">${ui('English on replies')} <span class="val">${onOff(S.replyEn)}</span></button>
      <button class="btn" data-m="fps" data-label="FPS">${ui('Frames a second')} <span class="val">${onOff(S.fps)}</span></button>
      <button class="btn" data-m="howto">${ui('How to play')}</button>
      <button class="btn" data-m="opening">${ui('Watch the opening')}</button>
      ${Object.entries(AREA.scenes || {}).filter(([, sc]) => sc.watch && matches(sc.when)).map(([id, sc]) => `<button class="btn" data-m="scene" data-scene="${id}">${esc(ui(sc.watch))}</button>`).join('')}
      <button class="btn" data-m="title" data-label="${ui('Your games')}">${ui('Title screen: your games')}</button>
    </div>
    <div class="actions"><span class="speedrow"><span class="slabel">${ui('Voice speed')}</span><span class="qpcount"><button class="btn" data-a="slower" aria-label="${ui('Slower')}"${voiceSpeed() <= VOICE_SPEEDS.at(-1) ? ' disabled' : ''}>−</button><b class="qpn">${Math.round(voiceSpeed() * 100)}%</b><button class="btn" data-a="faster" aria-label="${ui('Faster')}"${voiceSpeed() >= 1 ? ' disabled' : ''}>+</button></span></span><button class="btn" data-a="back" data-b>${ui('Back')}</button></div>`);
  const f = sheet.querySelector(`[data-m="${focusId || 'music'}"]`); if (f) f.focus();
  on('[data-a=back]', () => openMenu('settings'));
  // Voice speed (sound.js): a step slower or faster, saying something so you hear it
  const speed = (d, focus) => { const i = VOICE_SPEEDS.indexOf(voiceSpeed()) + d; if (i < 0 || i >= VOICE_SPEEDS.length) return; S.voiceSpeed = VOICE_SPEEDS[i]; save(); SFX.blip(); say(SPEED_SAMPLE); openSettings(); const b = sheet.querySelector(`[data-a=${focus}]`); if (b && !b.disabled) b.focus(); };
  on('[data-a=slower]', () => speed(1, 'slower'));
  on('[data-a=faster]', () => speed(-1, 'faster'));
  const act = {
    music: () => { S.music = !S.music; save(); if (S.music) musicStart(); else musicStop(); openSettings('music'); },
    sound: () => { S.sound = !S.sound; save(); if (S.sound) SFX.blip(); openSettings('sound'); },
    pinyin: () => { S.pinyin = !S.pinyin; save(); openSettings('pinyin'); },
    ipa: () => { S.ipa = !S.ipa; save(); openSettings('ipa'); },
    // (learning English: simplified or traditional characters; back to simplified, the page loads again, as it was)
    script: () => { S.script = traditionalNow() ? 'cn' : 'tw'; save(); if (S.script === 'tw'){ writeChinese(); openSettings('script'); } else toArea(AREA.number, SLOT, 'continue'); },
    replyEn: () => { S.replyEn = !S.replyEn; save(); openSettings('replyEn'); },
    fps: () => { S.fps = !S.fps; save(); openSettings('fps'); },
    howto: () => howToPlay().then(() => openSettings('howto')),
    opening: () => { closeCard(); playIntro(); },
    scene: bt => { closeCard(); storyScene(bt.dataset.scene); },
    title: () => { closeCard(); toTitle(); }
  };
  sheet.querySelectorAll('[data-m]').forEach(bt => bt.onclick = () => { SFX.blip(); act[bt.dataset.m](bt); });
}
