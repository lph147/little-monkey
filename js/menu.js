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
    friends: () => {
      openCard(`<p class="label">Friends</p>${S.friends.length ? `<div class="friends">${S.friends.map(id => { const hz = FRIEND_NAMES[id] || id; return `<button data-w="${hz}">${portrait(id)}<span style="font-size:1.2rem">${hz}</span><span class="small">${WORDS[hz] ? WORDS[hz].py : (NAMES[id] || {}).py || ''}</span></button>`; }).join('')}</div>` : '<p class="hint">No friends yet. Answer the questions of animals in the tall grass to make friends.</p>'}
        <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
      sheet.querySelectorAll('.friends button').forEach(bt => bt.onclick = () => say(bt.dataset.w));
      on('[data-a=ok]', () => openMenu('friends'));
    },
    settings: () => openSettings()
  };
  sheet.querySelectorAll('[data-m]').forEach(bt => bt.onclick = () => { SFX.blip(); act[bt.dataset.m](); });
}

// 衣服 Wardrobe: the clothes you own. Tap one to put it on (your monkey says so, such as 我戴头带, which
// teaches 戴 the first time and counts as using the words) or to take it off.
// 包 Bag: what you carry. Food, how many and what it does (tap food that brings a heart back to eat it, if you're hurt),
// your stick, and things you're carrying for someone. Tapping anything else says its word. note: what just happened.
function bagPage(back, focus, note){
  const card = (w, does, label, count) => `<button class="card bagitem" data-w="${w}" data-label="${label}"><div class="c" aria-hidden="true">${picHTML(w)}</div>`
    + `${count ? `<span class="count">×${count}</span>` : ''}<div class="hz">${w}</div><div class="p">${WORDS[w].py}</div><div class="small">${esc(does)}</div></button>`;
  const forWhom = id => `For the ${((NAMES[(AREA.requests[id] || {}).from] || {}).en || 'troop').toLowerCase()}`;
  const items = [
    ...Object.keys(FOOD).filter(w => S.bag[w] > 0).map(w => card(w, FOOD[w].does, FOOD[w].heal ? 'Eat' : 'Hear', S.bag[w])),
    ...(canBattle() && BATTLES.weapon ? [card(BATTLES.weapon, 'To fight with', 'Hear')] : []),
    ...Object.entries(here().holding).filter(([, w]) => w && WORDS[w]).map(([id, w]) => card(w, forWhom(id), 'Hear'))];
  openCard(`<div class="bag"><div class="baghead"><p class="label">包 bāo · Bag</p>
    <div class="stats"><span class="hearts" aria-label="Your hearts: ${hearts()} of ${HEARTS}">${heartsHTML(hearts(), HEARTS)}</span><span>🐚 ${S.shells}</span>${note ? `<span class="note">${esc(note)}</span>` : ''}</div></div>
    ${items.length ? `<div class="menu grid">${items.join('')}</div>` : '<p class="hint">Nothing in your bag yet. Fruit trees, friends and the shop have things to put in it.</p>'}
    <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div></div>`);
  const f = sheet.querySelector(`.bagitem[data-w="${focus}"]`) || sheet.querySelector('.bagitem'); if (f) f.focus();
  on('[data-a=ok]', back);
  sheet.querySelectorAll('.bagitem').forEach(b => b.onclick = () => {
    const w = b.dataset.w, food = FOOD[w];
    if (!food || !food.heal){ say(w); return; }
    if (hearts() >= HEARTS){ SFX.bump(); bagPage(back, w, 'Your hearts are full: keep it for when you’re hurt.'); return; }
    S.bag[w]--; S.hearts = Math.min(HEARTS, hearts() + food.heal); useWord(w); save(); SFX.right();
    bagPage(back, w, `You eat a ${wz(w)}: a heart comes back.`);
  });
}
function wardrobePage(back, focus){
  const own = (AREA.wardrobe || []).filter(c => S.wardrobe.owned.includes(c.item)), more = (AREA.wardrobe || []).length - own.length;
  openCard(`<p class="label">衣服 yīfu · Clothes</p>
    ${own.length ? `<p class="small">Tap something to put it on or take it off.</p><div class="menu grid">${own.map(c => { const on = wearing(c.item);
      return `<button class="card wear${on ? ' on' : ''}" data-w="${c.item}" data-label="${on ? 'Take off' : 'Put on'}"><div class="c" aria-hidden="true">${picHTML(c.item)}</div><div class="hz">${c.item}</div><div class="p">${WORDS[c.item].py}</div><div class="small">${on ? 'Wearing' : 'Put on'}</div></button>`; }).join('')}</div>`
      : '<p class="hint">Nothing to wear yet. Clothes come from the shop and from friends.</p>'}
    ${more ? `<p class="small">${more} more to find.</p>` : ''}
    <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
  if (focus){ const f = sheet.querySelector(`.wear[data-w="${focus}"]`); if (f) f.focus(); }
  on('[data-a=ok]', back);
  sheet.querySelectorAll('.wear').forEach(b => b.onclick = async () => {
    const c = AREA.wardrobe.find(x => x.item === b.dataset.w), w = S.wardrobe.wearing;
    if (wearing(c.item)){ w.splice(w.indexOf(c.item), 1); save(); redress(); SFX.blip(); wardrobePage(back, c.item); return; }
    w.push(c.item); save(); redress(); closeCard();
    if (c.teach && lvl(c.teach) === 0) await showNotice(c.teach, {...(c.note ? {note:fill(c.note)} : {}), quiet:true});   // such as 戴, the first time
    toks(c.sentence).forEach(t => { if (WORDS[t]) useWord(t); });
    await showDialog(speaker('player'), {t:[...toks(c.sentence), '。'], en:c.sentenceEn}, {teach:c.teach || c.item});
  });
}
// Your words, friends and shells: at the top of the menu and your tasks.
const statsHTML = () => `<div class="stats"><span>${ORDER.filter(w => lvl(w) > 0).length}/${ORDER.length} words</span><span>${S.friends.length} ${S.friends.length === 1 ? 'friend' : 'friends'}</span><span>🐚 ${S.shells}</span></div>`;
// 任务 Tasks (Select, or the menu's tile): what to do now, then the chapter's checklist. back: what Back does.
// Opening it counts as looking at your tasks, so Select's red dot goes.
function tasksPage(back){
  const tasks = getTasks();
  tasks.forEach(t => { S.tasksRead[t.id] = 1; }); save();
  openCard(`<p class="label taskslabel">Tasks</p>${statsHTML()}
    <div class="twocol"><div><p class="label">Now</p>${tasks.length ? `<ul class="tasks">${tasks.map(t => `<li>${esc(t.text)}</li>`).join('')}</ul>` : `<p class="hint">${esc(tasksHint() || 'Nothing to do right now.')}</p>`}</div>
    <div><p class="label">${AREA.name.en} · ${esc(AREA.chapters[chapterNow()].name)}: ${esc(AREA.chapters[chapterNow()].title)}</p>${checklistHTML(false)}</div></div>
    <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
  on('[data-a=ok]', back);
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
      <button class="btn" data-m="howto">How to play</button>
      <button class="btn" data-m="opening">Watch the opening</button>
      ${Object.entries(AREA.scenes || {}).filter(([, sc]) => sc.watch && matches(sc.when)).map(([id, sc]) => `<button class="btn" data-m="scene" data-scene="${id}">${esc(sc.watch)}</button>`).join('')}
      <button class="btn" data-m="title">Title screen: your games</button>
    </div>
    <div class="actions"><button class="btn" data-a="back" data-b>Back</button></div>`);
  const f = sheet.querySelector(`[data-m="${focusId || 'music'}"]`); if (f) f.focus();
  on('[data-a=back]', () => openMenu('settings'));
  const act = {
    music: () => { S.music = !S.music; save(); if (S.music) musicStart(); else musicStop(); openSettings('music'); },
    sound: () => { S.sound = !S.sound; save(); if (S.sound) SFX.blip(); openSettings('sound'); },
    pinyin: () => { S.pinyin = !S.pinyin; save(); openSettings('pinyin'); },
    replyEn: () => { S.replyEn = !S.replyEn; save(); openSettings('replyEn'); },
    howto: () => howToPlay().then(() => openSettings('howto')),
    opening: () => { closeCard(); playIntro(); },
    scene: bt => { closeCard(); storyScene(bt.dataset.scene); },
    title: () => { closeCard(); toTitle(); }
  };
  sheet.querySelectorAll('[data-m]').forEach(bt => bt.onclick = () => { SFX.blip(); act[bt.dataset.m](bt); });
}
