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
  openCard(`<p class="label">Menu</p>${statsHTML()}
    <div class="menu">
      <div class="tiles">${MENU_TILES.map(t => `<button class="mtile" data-m="${t.m}" data-label="${t.en}">${t.m === 'words' && fresh ? `<span class="mnew" aria-label="${fresh} new words">${fresh}<span class="w"> new</span></span>` : ''}<span class="micon" aria-hidden="true">${t.icon}</span><span class="mzh">${t.zh}</span><span class="mpy">${t.py}</span><span class="men">${t.en}</span></button>`).join('')}</div>
      <div class="menurow"><button class="btn" data-m="settings">⚙ Settings</button><button class="btn" data-m="tips">💡 Tips</button><button class="btn" data-m="save">💾 Save</button></div>
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
    practice: () => quickPractice(() => openMenu('practice')),
    friends: () => friendsPage(() => openMenu('friends')),
    settings: () => openSettings(),
    tips: () => tipsPage(() => openMenu('tips'))
  };
  sheet.querySelectorAll('[data-m]').forEach(bt => bt.onclick = () => { SFX.blip(); act[bt.dataset.m](); });
}

/* ================= TIPS ================= */
// 💡 Tips (the menu's button beside Settings; decided 9 November 2026, the four ideas plan): every tip you've had, to read
// again. About Chinese first: the areas' tips you've had (the goat's drum card: tap it to play it again), each pair of
// words shown side by side once you know both (二 or 两?, SIDE_BY_SIDE) and each pair you know that sounds alike (河 and
// 喝, soundsLike), each opening its card again; then How to play: each button tip you've had (TIP_PAGE, js/tips.js), its
// button drawn, and How to play ▸, the whole guide (it was in Settings). Only what you've had, so it gives nothing away:
// More come as you play. back: what Back does; focus: the tip to come back to.
function chineseTips(){
  const rows = [];
  for (const a of AREAS.filter(a => a.number <= AREA.number)) for (const [id, t] of Object.entries(a.tips || {})) if (S.tips[id] && WORDS[t.word])
    rows.push({id:'tip-' + id, zh:t.word, py:WORDS[t.word].py, title:cap(t.title.replace(/^Tip:\s*/, '')), text:`${t.heard}. Tap to try the drum again.`, card:back => tipCard(t, picHTML(t.word)).then(back)});
  for (const p of SIDE_BY_SIDE) if (p.words.every(w => WORDS[w] && lvl(w) > 0))
    rows.push({id:'side-' + p.words.join(''), zh:p.words.join(' '), py:p.words.map(w => WORDS[w].py).join(' · '), title:p.title, text:p.remember, card:back => sideCard(p.words.at(-1), back)});
  const seen = new Set(), known = Object.keys(WORDS).filter(w => lvl(w) > 0);
  for (const w of known){
    const o = soundsLike(w); if (!o) continue;
    const [x, y] = [o, w].sort((m, n) => known.indexOf(m) - known.indexOf(n)), key = x + y;   // (each pair once, the word you'd have met first on the left)
    if (seen.has(key)) continue; seen.add(key);
    rows.push({id:'sounds-' + key, zh:`${x} ${y}`, py:`${WORDS[x].py} · ${WORDS[y].py}`, title:`Sounds like: ${x} and ${y}`, text:'The same sound in pinyin: hear both, and how their tones differ.', card:back => soundsCard(y, back)});
  }
  return rows;
}
function tipsPage(back, focus){
  const chinese = chineseTips(), buttons = TIP_PAGE.filter(t => t.ids.some(id => S.tips[id]));
  const row = r => `<button class="tipsrow" data-tip="${esc(r.id)}" data-label="Open"><span class="tipskey zh">${esc(r.zh)}<small>${esc(r.py)}</small></span><span class="tipstxt"><b>${esc(r.title)}</b><span>${esc(r.text)}</span></span><span class="tipsgo" aria-hidden="true">▸</span></button>`;
  openCard(`<p class="label">💡 Tips</p><p class="small tipsintro">Every tip you’ve had, to read again. More come as you play.</p>
    ${chinese.length ? `<p class="tipsec">About Chinese</p><div class="tipslist" data-nav>${chinese.map(row).join('')}</div>` : ''}
    <p class="tipsec">How to play</p><div class="tipslist">${buttons.length ? buttons.map(t => `<div class="tipsrow plain"><span class="tipskey">${t.key}</span><span class="tipstxt"><span>${t.text}</span></span></div>`).join('') : '<p class="hint">None yet.</p>'}</div>
    <div class="actions"><button class="btn" data-a="howto">How to play ▸</button><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
  sheet.querySelectorAll('.tipsrow[data-tip]').forEach(b => b.onclick = () => { SFX.blip(); chinese.find(r => r.id === b.dataset.tip).card(() => tipsPage(back, b.dataset.tip)); });
  on('[data-a=howto]', () => howToPlay().then(() => tipsPage(back, 'howto')));
  on('[data-a=ok]', back);
  const f = focus && (sheet.querySelector(`.tipsrow[data-tip="${focus}"]`) || sheet.querySelector(`[data-a="${focus}"]`)); if (f) f.focus();
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
  const named = (a, note = '') => `<button data-w="${a.hz}" data-label="${page(a.hz) ? 'Open' : 'Hear it'}"${note ? ' class="fmet"' : ''}>${portrait(a.id)}<span class="fz">${a.hz}</span><span class="small">${WORDS[a.hz].py}</span>${note ? `<span class="fnote">${note}</span>` : ''}</button>`;
  const card = a => isFriend(a) ? named(a)
    : S.met.includes(a.id) ? named(a, a.many ? `<b>${here()[a.counts] || 0}/${a.many}</b>` : 'Not a friend yet')
    : `<button class="fshadow" data-clue="${a.id}" data-label="Where?"><span class="sil">${portrait(a.id)}</span><span class="fz">？</span><span class="fnote">${esc(a.clue)}${WHEN[a.time] ? ' ' + WHEN[a.time].icon : ''}</span></button>`;   // (a sun or a moon: only out by day, or after dark)
  const isPerson = id => AREA.characters.some(c => c.id === id && c.person), others = S.friends.filter(id => !ANIMALS.some(a => a.id === id) && !isPerson(id)), people = S.friends.filter(isPerson);   // (people you've helped: their own section)
  openCard(`<p class="label">Friends <span class="fcount">${animals.filter(isFriend).length} of ${animals.length} animals</span></p>
    <div class="friends" data-nav>${animals.map(card).join('')}</div>
    ${others.length ? `<p class="label fsub">The troop and others</p><div class="friends" data-nav>${others.map(id => { const hz = FRIEND_NAMES[id] || id; return `<button data-w="${hz}" data-label="${page(hz) ? 'Open' : 'Hear it'}">${portrait(id)}<span class="fz">${hz}</span><span class="small">${WORDS[hz] ? WORDS[hz].py : (NAMES[id] || {}).py || ''}</span></button>`; }).join('')}</div>` : ''}
    ${people.length ? `<p class="label fsub">People</p><div class="friends" data-nav>${people.map(id => `<button data-w="${(NAMES[id] || {}).zh || id}" data-label="Hear it">${portrait(id)}<span class="fz">${(NAMES[id] || {}).zh || id}</span><span class="small">${esc((NAMES[id] || {}).en || '')}</span></button>`).join('')}</div>` : ''}
    <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
  sheet.querySelectorAll('.friends button[data-w]').forEach(bt => bt.onclick = () => { const w = bt.dataset.w; if (page(w)){ SFX.blip(); wordPage(w, () => friendsPage(back, w), 'Friends'); } else say(w); });
  sheet.querySelectorAll('.friends button[data-clue]').forEach(bt => bt.onclick = () => { SFX.blip(); friendClue(ANIMALS.find(a => a.id === bt.dataset.clue), () => friendsPage(back, bt.dataset.clue)); });
  on('[data-a=ok]', back);
  const f = focus && sheet.querySelector(`.friends [data-w="${focus}"], .friends [data-clue="${focus}"]`); if (f) f.focus();
}
// When an animal's about, if only by day or after dark (its time: js/art.js's awakeNow), with a sun or a moon.
const WHEN = {day:{icon:'☀️', text:'by day'}, night:{icon:'🌙', text:'after dark'}};
// A friend still to find: its shadow, bigger, and where it lives.
function friendClue(a, back){
  openCard(`<p class="label">A friend to find</p><div class="fclue"><span class="sil">${portrait(a.id)}</span><div><p class="fz">？</p><p>${esc(a.clue)}${WHEN[a.time] ? `, ${WHEN[a.time].text}` : ''}.${WHEN[a.time] ? ' ' + WHEN[a.time].icon : ''}</p><p class="small">Find it, and answer its questions to make friends.</p></div></div>
    <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
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
    .map(w => ({w, does:FOOD[w].does, label:FOOD[w].heal || FOOD[w].fast || FOOD[w].stink ? 'Eat' : 'Hear', count:S.bag[w]}))},
  {id:'someone', name:'For someone', things:() => Object.entries(here().holding).filter(([id, w]) => w && (WORDS[w] || GLOSS[w]) && (AREA.requests[id] || (AREA.holdingFor || {})[id]))   // (who for: the request's, or the area's holdingFor, such as the lingzhi for the master, a word you only hear; not what you collected where it stays, such as sacks put on a boat)
    .map(([id, w]) => ({w, does:`The ${((NAMES[(AREA.requests[id] || {}).from || (AREA.holdingFor || {})[id]] || {}).en || 'troop').replace(/^(the|an?) /i, '').toLowerCase()}`, label:'Hear'}))},   // (The master, not The the master)
  {id:'fight', name:'To fight with', things:() => canBattle() && weaponNow() ? [{w:weaponNow(), does:`Hits for ${weaponHits()}`, label:'Hear'}] : []},   // (your weapon now, such as the Demon of Havoc's broadsword)
  {id:'fishing', name:'For fishing', things:() => !canFish() ? [] : [{w:FISH.rod, does:'A at water with fish in it', label:'Hear'},   // (js/fishing.js)
    ...(FISH.bait && S.bag[FISH.bait] > 0 ? [{w:FISH.bait, does:'A big fish bites next', label:'Hear', count:S.bag[FISH.bait]}] : [])]},
  // the treasures you've found, for the 老板 to buy (js/trade.js: decided 9 November 2026, the trade plan), and the tools
  // you've bought from him
  {id:'treasures', name:'Treasures', zh:'宝贝', py:'bǎobèi', things:() => TREASURE_WORDS.filter(w => S.bag[w] > 0).map(w => ({w, does:`Sells for ${priceOf(w)} ${MONEY()}`, label:'Hear', count:S.bag[w]}))},
  {id:'tools', name:'Tools', things:() => (S.tools || []).filter(w => WORDS[w]).map(w => ({w, does:TOOL_DOES[w] || '', label:'Hear'}))}
];
const TOOL_DOES = {'篮子':'Carry two more of every snack', '灯笼':'A light round you at night', '铲子':'Dig up roots'};   // (what each tool does, in your bag)
function bagPage(back, focus, note, tab){
  const card = ({w, does, label, count}) => `<button class="card bagitem" data-w="${w}" data-label="${label}"><div class="c" aria-hidden="true">${picHTML(w)}</div>`
    + `${count ? `<span class="count">×${count}</span>` : ''}<div class="hz">${w}</div><div class="p">${WORDS[w] ? WORDS[w].py : GLOSS[w][0]}</div><div class="small">${esc(does)}</div></button>`;
  const tabs = BAG_TABS.map(t => ({...t, list:t.things()})).filter(t => t.list.length), now = tabs.find(t => t.id === tab) || tabs[0];
  openCard(`<div class="bag"><div class="baghead"><p class="label">包 bāo · Bag</p>
    <div class="stats">${healthHTML(health(), maxHealth(), true)}${moneyHTML()}</div>${note ? `<p class="note">${esc(note)}</p>` : ''}</div>
    ${tabs.length > 1 ? `<div class="scrolltabs bagtabs" role="tablist">${tabs.map(t => `<button class="tab" role="tab" data-tab="${t.id}" aria-selected="${t === now}">${t.zh ? `${t.zh} <span class="tpy">${t.py}</span> ` : ''}${t.name}</button>`).join('')}</div>` : ''}
    ${now ? `<div class="menu grid" data-nav>${now.list.map(card).join('')}</div>` : '<p class="hint">Nothing in your bag yet. Fruit trees, friends and the shop have things to put in it.</p>'}</div>
    <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div>`);   // (outside the bag, so Back stays at the card's bottom however full it is)
  const f = sheet.querySelector(`.bagitem[data-w="${focus}"]`) || sheet.querySelector('.bagitem'); if (f) f.focus();
  sheet.querySelectorAll('.bagtabs .tab').forEach(b => b.onclick = () => { if (b.dataset.tab !== now.id){ SFX.turn(); bagPage(back, null, null, b.dataset.tab); } });
  on('[data-a=ok]', back);
  sheet.querySelectorAll('.bagitem').forEach(b => b.onclick = () => {
    const w = b.dataset.w, food = FOOD[w];
    if (food && food.stink){   // smelly food, such as a durian: you eat it out on the map (eatSmelly, js/world.js)
      if (isStinky()){ SFX.bump(); bagPage(back, w, `You still smell of the ${wz(stinkFood || w)}: keep it for later.`); return; }
      closeCard(); eatSmelly(w, food);
      return;
    }
    if (food && food.fast){
      if (isFast()){ SFX.bump(); bagPage(back, w, 'You’re full of energy already: keep it for later.'); return; }
      S.bag[w]--; energise(w, food.fast); useWord(w); save(); SFX.right();
      bagPage(back, w, `You eat some ${wz(w)}: you’re full of energy! You walk faster for a while.`);
      return;
    }
    if (!food || !food.heal){ say(w); return; }
    if (!hurt()){ SFX.bump(); bagPage(back, w, 'Your health is full: keep it for when you’re hurt.'); return; }
    S.bag[w]--; S.health = Math.min(maxHealth(), health() + food.heal); useWord(w); save(); SFX.right();
    bagPage(back, w, `You eat a ${wz(w)}: ${healText(w)}.`);
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
const statsHTML = () => `<div class="stats"><span>${wordsCaught()} ${wordsCaught() === 1 ? 'word' : 'words'} caught</span><span>${S.friends.length} ${S.friends.length === 1 ? 'friend' : 'friends'}</span>${moneyHTML()}</div>`;
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
  const whereHTML = t => t.where ? `<span class="where">${hlText(t.where)}</span>` : '';   // (where it's done, when that's not where you are)
  // (each task's names standing out, hlText in js/helpers.js: a word you know green, to tap and hear; people gold; places blue)
  const taskHTML = t => `<li class="${[t === aimed ? 'aim' : '', t.main ? 'main' : ''].join(' ').trim()}">${t.main ? '<span class="star" aria-hidden="true"></span>' : ''}${choose && t.arrow ? `<button class="taskbtn" data-t="${esc(t.id)}">${hlText(t.text)}${whereHTML(t)}</button>` : `<span>${hlText(t.text)}${whereHTML(t)}</span>`}${t.clue ? clueTaskHTML(t.clue) : ''}</li>`;
  const chapter = `${esc(ch.name)}: ${esc(ch.title)}`, progress = `${found.filter(([, done]) => done).length} of ${found.length} done so far`;
  if (page === 'list'){
    openCard(`<div class="cardtop"><p class="label taskslabel">${chapter}</p><span class="taskprog">${progress}</span></div>
      <div class="checkpage">${checklistHTML(false)}</div>
      <div class="actions"><button class="btn grow" data-a="now">◂ Tasks</button><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
    on('[data-a=now]', () => tasksPage(back));
    on('[data-a=ok]', back);
    bindSay(sheet);
    return;
  }
  // the journey: the area's goal, and the part of the story you're in, with what you're doing in it (partNow, js/world.js),
  // unless the main task below says so; and Story so far ▸, every part you've reached (storyPage, below)
  const part = partNow(), goal = textNow(AREA.goal), story = `<button class="storybtn" data-a="story" data-label="Story">📖 Story so far ▸</button>`;
  const journey = goal ? `<div class="journey">${story}<p><span class="jlabel">Your journey</span> ${hlText(goal)}</p>${part ? `<p class="jpart"><b>${esc(part.name)}: ${esc(part.title)}.</b>${tasks.some(t => t.main) ? '' : ' ' + hlText(textNow(part.now))}</p>` : ''}${whoKnowsHTML()}</div>` : '';
  const also = tasks.some(t => t.main) && tasks.some(t => !t.main);
  openCard(`<div class="cardtop"><p class="label taskslabel">Tasks</p>${statsHTML()}</div>
    <div class="nowpage">${journey}<p class="label">Now${choose ? ' <span class="aimhint">Tap a task for the yellow arrow to show its way</span>' : ''}</p>${tasks.length ? `<ul class="tasks${also ? ' withalso' : ''}"${choose ? ' data-nav' : ''}>${tasks.map((t, i) => (also && !t.main && tasks[i - 1] && tasks[i - 1].main ? '<li class="alsolabel" aria-hidden="true">Also</li>' : '') + taskHTML(t)).join('')}</ul>` : `<p class="hint">${hlText(tasksHint() || 'Nothing to do right now.')}</p>`}
    <p class="taskprog">${chapter} · ${progress}</p></div>
    <div class="actions"><button class="btn grow" data-a="list">Checklist ▸</button>${goal ? '' : story}<button class="btn primary" data-a="ok" data-b>Back</button></div>`);
  on('[data-a=list]', () => tasksPage(back, 'list'));
  on('[data-a=story]', () => { SFX.blip(); storyPage(back); });
  on('[data-a=ok]', back);
  bindSay(sheet);
  sheet.querySelectorAll('.taskbtn').forEach(b => b.onclick = () => { followTask(b.dataset.t); SFX.blip(); tasksPage(back, 'now', b.dataset.t); });
  if (focus){ const f = [...sheet.querySelectorAll('.taskbtn')].find(b => b.dataset.t === focus); if (f) f.focus(); }
  const clue = tasks.find(t => t.clue);
  if (clue){ bindTokens(sheet.querySelector('.taskclue')); on('[data-a=clue]', () => say(L[clue.clue.say].t.join(''), null, HIDE.by)); }
  sheet.querySelectorAll('.whoknows .face').forEach(b => b.onclick = () => { SFX.blip(); sheet.querySelector('.whoinfo').textContent = b.dataset.info; });
}
// Who knows? (the area's askList, decided 5 November 2026: the human world's purpose, asking everyone where the immortals
// are): under your journey, while its show matches, the faces of the people to ask, each ticked once you've asked them
// (asked: the key that says so), a shadow till then, and the one who knows, a ? till they've told you (done). Tap a face
// to see who it is, where, and whether you've asked them.
function whoKnowsHTML(){
  const k = AREA.askList;
  if (!k || !matches(k.show)) return '';
  const where = id => { const n = ALL_NPCS.find(c => c.id === id), p = n && PLACES[n.home.place]; return p ? p.name.en : ''; };
  const who = id => { const n = NAMES[id] || {}; return `${n.zh || ''} ${n.py || ''} · ${n.en || ''}`; };
  const asked = k.people.filter(p => here()[p.asked]).length, done = matches(k.done);
  const face = p => { const yes = !!here()[p.asked]; return `<button class="face${yes ? ' asked' : ''}" data-info="${esc(`${who(p.who)} · ${where(p.who)} · ${yes ? 'Asked: they don’t know' : 'Not asked yet: help them first'}`)}">${portrait(p.who)}</button>`; };
  const last = done ? `<button class="face knows" data-info="${esc(`${who(k.knows)} · ${where(k.knows)} · They knew!`)}">${portrait(k.knows)}</button>`
    : `<button class="face who" data-info="${esc('Someone who knows. Who can it be?')}"><span>?</span></button>`;
  return `<div class="whoknows"><p><span class="jlabel">${esc(k.title)}</span> <b>${asked} of ${k.people.length}</b> asked</p><div class="faces">${k.people.map(face).join('')}${last}</div><p class="whoinfo small">Tap a face to see who it is.</p></div>`;
}

/* ================= STORY SO FAR ================= */
// 📖 Story so far (Story so far ▸ in the Tasks page's journey box; decided 9 November 2026, the four ideas plan): every
// part of the story you've reached, chapter by chapter, each with the card you read as it began (or its story, for a part
// that begins with its chapter's own card), its names standing out (hlText, js/helpers.js), and under it the scenes you
// can watch again (each scene's part; the area's opening under its first part; they were in Settings); the part you're in
// at the end, marked Now, with what you're doing in it. An area before this one is folded into one line at the top, its
// storyFold: tap it to read it all (open: its number). Parts not reached yet aren't there, so nothing is given away.
// back: what Back does; ◂ Tasks goes back to the Tasks page; focus: the button to come back to.
function storyPartsHTML(area, upTo, current){
  const parts = (area.parts || []).slice(0, upTo + 1), now = current ? partNow() : null;
  const scenes = Object.entries(area.scenes || {}).filter(([, sc]) => sc.watch && sc.part && (!current || matches(sc.when)));   // (an area before this one: all its scenes, as its story's done)
  let out = '', ch = -1;
  parts.forEach((p, i) => {
    if (p.chapter !== ch){ ch = p.chapter; const c = area.chapters[ch]; if (c) out += `<p class="storych">${esc(c.name)}: ${esc(c.title)}</p>`; }
    const watch = [...(i === 0 && (area.intro || []).length ? [['opening', 'Watch the opening']] : []), ...scenes.filter(([, sc]) => sc.part === p.id).map(([id, sc]) => [id, sc.watch])];
    out += `<div class="storypart${p === now ? ' now' : ''}"><p class="sp-name">${esc(p.title)} <small>· ${esc(p.name)}</small>${p === now ? '<span class="nowtag">Now</span>' : ''}</p>
      <p>${hlText(fill(p.text || p.story || '', false, true))}</p>${p === now && p.now ? `<p class="sp-now"><b>Now:</b> ${hlText(textNow(p.now))}</p>` : ''}${watch.length ? `<div class="watchrow">${watch.map(([id, label]) => `<button class="watch" data-watch="${id}" data-area="${area.number}" data-label="Watch">▸ ${esc(label)}</button>`).join('')}</div>` : ''}</div>`;
  });
  return out;
}
function storyPage(back, focus, open){
  const html = AREAS.filter(a => a.number < AREA.number).map(a => {
    const shown = open === a.number;
    return `<button class="storyfold" data-fold="${a.number}" aria-expanded="${shown}" data-label="${shown ? 'Fold' : 'Read'}"><b>${shown ? '▾' : '▸'} ${esc(a.name.en)}</b><span>${esc(a.storyFold || '')} Tap to read it.</span></button>${shown ? storyPartsHTML(a, (a.parts || []).length - 1, false) : ''}`;
  });
  const here_ = storyPartsHTML(AREA, here().part ?? -1, true);
  openCard(`<div class="cardtop"><p class="label">📖 Story so far</p><span class="taskprog">${esc(AREA.name.en)}</span></div>
    <div class="storypage" data-nav>${html.join('')}${here_ || '<p class="hint">Your story here is just beginning.</p>'}</div>
    <div class="actions"><button class="btn grow" data-a="tasks">◂ Tasks</button><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
  bindSay(sheet);
  on('[data-a=tasks]', () => tasksPage(back));
  on('[data-a=ok]', back);
  sheet.querySelectorAll('.storyfold').forEach(b => b.onclick = () => { SFX.blip(); const n = +b.dataset.fold; storyPage(back, 'fold' + n, open === n ? null : n); });
  sheet.querySelectorAll('.watch').forEach(b => b.onclick = () => {   // the scene, and back here once it ends
    const area = AREAS.find(a => a.number === +b.dataset.area), id = b.dataset.watch;
    SFX.blip(); closeCard();
    (id === 'opening' ? watchOpening(area) : storyScene(id, area)).then(() => storyPage(back, id, open));
  });
  const f = focus && (focus.startsWith('fold') ? sheet.querySelector(`.storyfold[data-fold="${focus.slice(4)}"]`) : sheet.querySelector(`.watch[data-watch="${focus}"]`));
  if (f) f.focus();
  else if (sheet.querySelector('.storypart.now')) sheet.scrollTop = sheet.scrollHeight;   // (opening at the part you're in, the last: never hidden under the buttons)
}

/* ================= SETTINGS ================= */
// Sound, pinyin, English on reply choices (for players who know some Chinese already), typed lines (js/cards.js), and the
// title screen (where your games are: to switch, start a new one, copy one to a file or delete one). The game saves by
// itself. (How to play is on the Tips page, and the scenes to watch again are in Story so far, each under its part:
// decided 9 November 2026, the four ideas plan.)
const SPEED_SAMPLE = '你好';   // (what's said as you change the voice speed)
function openSettings(focusId){
  openCard(`<p class="label">Settings</p>
    <div class="menu twocol">
      <button class="btn" data-m="music" data-label="Music">Music <span class="val">${S.music ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="sound" data-label="Sound">Sound effects <span class="val">${S.sound ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="pinyin" data-label="Pinyin">Pinyin over words <span class="val">${S.pinyin ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="replyEn" data-label="English">English on replies <span class="val">${S.replyEn ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="typed" data-label="Typed">Typed lines <span class="val">${typedLines() ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="fps" data-label="FPS">Frames a second <span class="val">${S.fps ? 'On' : 'Off'}</span></button>
      <button class="btn" data-m="title" data-label="Your games">Title screen: your games</button>
    </div>
    <div class="actions"><span class="speedrow"><span class="slabel">Voice speed</span><span class="qpcount"><button class="btn" data-a="slower" aria-label="Slower"${voiceSpeed() <= VOICE_SPEEDS.at(-1) ? ' disabled' : ''}>−</button><b class="qpn">${Math.round(voiceSpeed() * 100)}%</b><button class="btn" data-a="faster" aria-label="Faster"${voiceSpeed() >= 1 ? ' disabled' : ''}>+</button></span></span><button class="btn" data-a="back" data-b>Back</button></div>`);
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
    replyEn: () => { S.replyEn = !S.replyEn; save(); openSettings('replyEn'); },
    typed: () => { S.typed = !typedLines(); save(); openSettings('typed'); },
    fps: () => { S.fps = !S.fps; save(); openSettings('fps'); },
    title: () => { closeCard(); toTitle(); }
  };
  sheet.querySelectorAll('[data-m]').forEach(bt => bt.onclick = () => { SFX.blip(); act[bt.dataset.m](bt); });
}
