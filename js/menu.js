// The menu: big tiles for your words, tasks and friends, and a Settings page.

/* ================= MENU ================= */
// The menu's tiles, with Chinese, pinyin and English (the Chinese is on the review sheet, CHINESE.md).
const MENU_TILES = [
  {m:'words', icon:'📜', zh:'词', py:'cí', en:'Words'},   // each tile's English is what its Chinese means
  {m:'tasks', icon:'📋', zh:'任务', py:'rènwu', en:'Tasks'},
  {m:'bag', icon:'👝', zh:'包', py:'bāo', en:'Bag'},
  {m:'friends', icon:'🐾', zh:'朋友', py:'péngyou', en:'Friends'},
  {m:'wardrobe', icon:'👕', zh:'衣服', py:'yīfu', en:'Clothes'},
  {m:'save', icon:'💾', zh:'保存', py:'bǎocún', en:'Save'}   // it saves by itself anyway: this says so
];
function openMenu(focusId){
  openCard(`<p class="label">Menu</p>${statsHTML()}
    <div class="menu">
      <div class="tiles">${MENU_TILES.map(t => `<button class="mtile" data-m="${t.m}" data-label="${t.en}"><span class="micon" aria-hidden="true">${t.icon}</span><span class="mzh">${t.zh}</span><span class="mpy">${t.py}</span><span class="men">${t.en}</span></button>`).join('')}</div>
      <button class="btn" data-m="settings">⚙ Settings</button>
    </div>
    <div class="actions"><button class="btn" data-a="close" data-b>Close</button></div>`);
  const f = sheet.querySelector(`[data-m="${focusId || MENU_TILES[0].m}"]`); if (f) f.focus();
  on('[data-a=close]', () => closeCard());
  const act = {
    tasks: () => tasksPage(() => openMenu('tasks')),
    wardrobe: () => wardrobePage(() => openMenu('wardrobe')),
    bag: () => bagPage(() => openMenu('bag')),
    save: () => { save(); closeCard(); toast(`💾 Saved: Game ${SLOT}, just now. It also saves by itself as you play.`); },
    words: () => openScroll(() => openMenu('words')),
    friends: () => friendsPage(() => openMenu('friends')),
    settings: () => openSettings()
  };
  sheet.querySelectorAll('[data-m]').forEach(bt => bt.onclick = () => { SFX.blip(); act[bt.dataset.m](); });
}

// 朋友 Friends: the animals (and monkeys) you've made friends with. Tap one whose name is a word you know, and its page
// opens, as in the Word Scroll, with its English and how it's made behind the English button (decided 24 October 2026: it
// only said its name); a monkey's name isn't a word, so tapping it says the name. focus: the friend to come back to.
function friendsPage(back, focus){
  const page = w => !!WORDS[w] && lvl(w) > 0;
  openCard(`<p class="label">Friends</p>${S.friends.length ? `<div class="friends" data-nav>${S.friends.map(id => { const hz = FRIEND_NAMES[id] || id; return `<button data-w="${hz}" data-label="${page(hz) ? 'Open' : 'Hear it'}">${portrait(id)}<span style="font-size:1.2rem">${hz}</span><span class="small">${WORDS[hz] ? WORDS[hz].py : (NAMES[id] || {}).py || ''}</span></button>`; }).join('')}</div>` : '<p class="hint">No friends yet. Answer the questions of animals in the tall grass to make friends.</p>'}
    <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
  sheet.querySelectorAll('.friends button').forEach(bt => bt.onclick = () => { const w = bt.dataset.w; if (page(w)){ SFX.blip(); wordPage(w, () => friendsPage(back, w), 'Friends'); } else say(w); });
  on('[data-a=ok]', back);
  const f = focus && sheet.querySelector(`.friends [data-w="${focus}"]`); if (f) f.focus();
}
// 衣服 Wardrobe: the clothes you own. Tap one to put it on (your monkey says so, such as 我戴头带, which
// teaches 戴 the first time and counts as using the words) or to take it off.
// 包 Bag: what you carry, in tabs (decided 27 October 2026, so it stays tidy as it fills up): Food, how many of each
// and what it does (tap food that brings health back to eat it, if you're hurt, or food that gives you energy, such as
// honey, to walk faster for a while, unless you're full of energy already); For someone, what you're carrying for
// someone, and who for; and To fight with, your weapon and how hard it hits. Only tabs with something in them show
// (none at all for just one), each its things as tiles; it opens on Food (tab: another), what you open it for, and left
// and right on the D-pad switch tabs, as in the Word Scroll. Tapping anything but food says its word. note: what just
// happened. Later areas can add a tab here, for other kinds of thing.
const BAG_TABS = [
  {id:'food', name:'Food', things:() => Object.keys(FOOD).filter(w => S.bag[w] > 0)
    .map(w => ({w, does:FOOD[w].does, label:FOOD[w].heal || FOOD[w].fast ? 'Eat' : 'Hear', count:S.bag[w]}))},
  {id:'someone', name:'For someone', things:() => Object.entries(here().holding).filter(([, w]) => w && WORDS[w])
    .map(([id, w]) => ({w, does:`The ${((NAMES[(AREA.requests[id] || {}).from] || {}).en || 'troop').toLowerCase()}`, label:'Hear'}))},
  {id:'fight', name:'To fight with', things:() => canBattle() && BATTLES.weapon ? [{w:BATTLES.weapon, does:`Hits for ${BATTLES.hits}`, label:'Hear'}] : []},
  {id:'fishing', name:'For fishing', things:() => !canFish() ? [] : [{w:FISH.rod, does:'A at water with fish in it', label:'Hear'},   // (js/fishing.js)
    ...(FISH.bait && S.bag[FISH.bait] > 0 ? [{w:FISH.bait, does:'A big fish bites next', label:'Hear', count:S.bag[FISH.bait]}] : [])]}
];
function bagPage(back, focus, note, tab){
  const card = ({w, does, label, count}) => `<button class="card bagitem" data-w="${w}" data-label="${label}"><div class="c" aria-hidden="true">${picHTML(w)}</div>`
    + `${count ? `<span class="count">×${count}</span>` : ''}<div class="hz">${w}</div><div class="p">${WORDS[w].py}</div><div class="small">${esc(does)}</div></button>`;
  const tabs = BAG_TABS.map(t => ({...t, list:t.things()})).filter(t => t.list.length), now = tabs.find(t => t.id === tab) || tabs[0];
  openCard(`<div class="bag"><div class="baghead"><p class="label">包 bāo · Bag</p>
    <div class="stats">${healthHTML(health(), maxHealth(), true)}<span>🐚 ${S.shells}</span></div>${note ? `<p class="note">${esc(note)}</p>` : ''}</div>
    ${tabs.length > 1 ? `<div class="scrolltabs bagtabs" role="tablist">${tabs.map(t => `<button class="tab" role="tab" data-tab="${t.id}" aria-selected="${t === now}">${t.name}</button>`).join('')}</div>` : ''}
    ${now ? `<div class="menu grid" data-nav>${now.list.map(card).join('')}</div>` : '<p class="hint">Nothing in your bag yet. Fruit trees, friends and the shop have things to put in it.</p>'}</div>
    <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div>`);   // (outside the bag, so Back stays at the card's bottom however full it is)
  const f = sheet.querySelector(`.bagitem[data-w="${focus}"]`) || sheet.querySelector('.bagitem'); if (f) f.focus();
  sheet.querySelectorAll('.bagtabs .tab').forEach(b => b.onclick = () => { if (b.dataset.tab !== now.id){ SFX.turn(); bagPage(back, null, null, b.dataset.tab); } });
  on('[data-a=ok]', back);
  sheet.querySelectorAll('.bagitem').forEach(b => b.onclick = () => {
    const w = b.dataset.w, food = FOOD[w];
    if (food && food.fast){
      if (isFast()){ SFX.bump(); bagPage(back, w, 'You’re full of energy already: keep it for later.'); return; }
      S.bag[w]--; energise(w, food.fast); useWord(w); save(); SFX.right();
      bagPage(back, w, `You eat some ${wz(w)}: you’re full of energy! You walk faster for a while.`);
      return;
    }
    if (!food || !food.heal){ say(w); return; }
    if (!hurt()){ SFX.bump(); bagPage(back, w, 'Your health is full: keep it for when you’re hurt.'); return; }
    S.bag[w]--; S.health = Math.min(maxHealth(), health() + food.heal); useWord(w); save(); SFX.right();
    bagPage(back, w, `You eat a ${wz(w)}: +${food.heal} health.`);
  });
}
function wardrobePage(back, focus){
  // what you own, in each colour you have it (CLOTHES, js/data.js); still to find: what the shop could sell you now
  const own = CLOTHES.filter(c => S.wardrobe.owned.includes(c.item)), more = CLOTHES.filter(c => !S.wardrobe.owned.includes(c.item) && (c.item === c.word || lvl(c.colour) >= 1)).length;
  openCard(`<p class="label">衣服 yīfu · Clothes</p>
    ${own.length ? `<p class="small">Tap something to put it on or take it off.</p><div class="menu grid">${own.map(c => { const on = wearing(c.item), a = asSaid(c);
      return `<button class="card wear${on ? ' on' : ''}" data-w="${c.item}" data-label="${on ? 'Take off' : 'Put on'}"><div class="c" aria-hidden="true">${picHTML(a.pic)}</div><div class="hz">${a.zh}</div><div class="p">${a.py}</div><div class="small">${on ? 'Wearing' : 'Put on'}</div></button>`; }).join('')}</div>`
      : '<p class="hint">Nothing to wear yet. Clothes come from the shop and from friends.</p>'}
    ${more ? `<p class="small">${more} more to find.</p>` : ''}
    <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
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
const statsHTML = () => `<div class="stats"><span>${wordsCaught()} ${wordsCaught() === 1 ? 'word' : 'words'} caught</span><span>${S.friends.length} ${S.friends.length === 1 ? 'friend' : 'friends'}</span><span>🐚 ${S.shells}</span></div>`;
// 任务 Tasks (Select, or the menu's tile): what to do now, full width, with how much of the chapter you've done; its
// checklist is a page of its own (Checklist ▸, and ◂ Tasks back), so the two lists are never side by side, saying the
// same thing twice (decided 25 October 2026: they were). back: what Back does. page: 'list' for the checklist.
// Opening it counts as looking at your tasks, so Select's red dot goes. The yellow arrow shows the way for one task, marked
// with an arrow here: the newest, or the one you tap (one with somewhere to show you), which it follows instead (aimedTask(),
// js/world.js).
function tasksPage(back, page = 'now', focus = null){
  const tasks = getTasks();
  tasks.forEach(t => { S.tasksRead[t.id] = 1; }); save();
  const ch = AREA.chapters[chapterNow()], found = areaChecklist().filter(([, , , f]) => f);
  const aimed = aimedTask(tasks), choose = tasks.filter(t => t.arrow).length > 1;   // (a choice only with two or more to show the way for)
  const taskHTML = t => `<li${t === aimed ? ' class="aim"' : ''}>${choose && t.arrow ? `<button class="taskbtn" data-t="${esc(t.id)}">${esc(t.text)}</button>` : `<span>${esc(t.text)}</span>`}${t.clue ? clueTaskHTML(t.clue) : ''}</li>`;
  const chapter = `${esc(ch.name)}: ${esc(ch.title)}`, progress = `${found.filter(([, done]) => done).length} of ${found.length} done so far`;
  if (page === 'list'){
    openCard(`<div class="cardtop"><p class="label taskslabel">${chapter}</p><span class="taskprog">${progress}</span></div>
      <div class="checkpage">${checklistHTML(false)}</div>
      <div class="actions"><button class="btn grow" data-a="now">◂ Tasks</button><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
    on('[data-a=now]', () => tasksPage(back));
    on('[data-a=ok]', back);
    return;
  }
  openCard(`<div class="cardtop"><p class="label taskslabel">Tasks</p>${statsHTML()}</div>
    <div class="nowpage"><p class="label">Now${choose ? ' <span class="aimhint">Tap a task for the yellow arrow to show its way</span>' : ''}</p>${tasks.length ? `<ul class="tasks"${choose ? ' data-nav' : ''}>${tasks.map(taskHTML).join('')}</ul>` : `<p class="hint">${esc(tasksHint() || 'Nothing to do right now.')}</p>`}
    <p class="taskprog">${chapter} · ${progress}</p></div>
    <div class="actions"><button class="btn grow" data-a="list">Checklist ▸</button><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
  on('[data-a=list]', () => tasksPage(back, 'list'));
  on('[data-a=ok]', back);
  sheet.querySelectorAll('.taskbtn').forEach(b => b.onclick = () => { followTask(b.dataset.t); SFX.blip(); tasksPage(back, 'now', b.dataset.t); });
  if (focus){ const f = [...sheet.querySelectorAll('.taskbtn')].find(b => b.dataset.t === focus); if (f) f.focus(); }
  const clue = tasks.find(t => t.clue);
  if (clue){ bindTokens(sheet.querySelector('.taskclue')); on('[data-a=clue]', () => say(L[clue.clue.say].t.join(''), null, HIDE.by)); }
}

/* ================= SETTINGS ================= */
// Sound, pinyin, English on reply choices (for players who know some Chinese already), How to play, the opening (and the area's
// other scenes, such as becoming king, once you've seen them) and the title screen
// (where your games are: to switch, start a new one, copy one to a file or delete one). The game saves by itself.
function openSettings(focusId){
  openCard(`<p class="label">Settings</p>
    <div class="menu twocol">
      <button class="btn" data-m="music" data-label="Music">Music <span class="val">${S.music ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="sound" data-label="Sound">Sound effects <span class="val">${S.sound ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="pinyin" data-label="Pinyin">Pinyin over words <span class="val">${S.pinyin ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="replyEn" data-label="English">English on replies <span class="val">${S.replyEn ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="fps" data-label="FPS">Frames a second <span class="val">${S.fps ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="howto">How to play</button>
      <button class="btn" data-m="opening">Watch the opening</button>
      ${Object.entries(AREA.scenes || {}).filter(([, sc]) => sc.watch && matches(sc.when)).map(([id, sc]) => `<button class="btn" data-m="scene" data-scene="${id}">${esc(sc.watch)}</button>`).join('')}
      <button class="btn" data-m="title" data-label="Your games">Title screen: your games</button>
    </div>
    <div class="actions"><button class="btn" data-a="back" data-b>Back</button></div>`);
  const f = sheet.querySelector(`[data-m="${focusId || 'music'}"]`); if (f) f.focus();
  on('[data-a=back]', () => openMenu('settings'));
  const act = {
    music: () => { S.music = !S.music; save(); if (S.music) musicStart(); else musicStop(); openSettings('music'); },
    sound: () => { S.sound = !S.sound; save(); if (S.sound) SFX.blip(); openSettings('sound'); },
    pinyin: () => { S.pinyin = !S.pinyin; save(); openSettings('pinyin'); },
    replyEn: () => { S.replyEn = !S.replyEn; save(); openSettings('replyEn'); },
    fps: () => { S.fps = !S.fps; save(); openSettings('fps'); },
    howto: () => howToPlay().then(() => openSettings('howto')),
    opening: () => { closeCard(); playIntro(); },
    scene: bt => { closeCard(); storyScene(bt.dataset.scene); },
    title: () => { closeCard(); toTitle(); }
  };
  sheet.querySelectorAll('[data-m]').forEach(bt => bt.onclick = () => { SFX.blip(); act[bt.dataset.m](bt); });
}
