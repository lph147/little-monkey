// The screens gallery (tools/screens.html): every screen of the game, each in its own frame.
//
// Each screen is the real game (index.html) with a pretend save, a pretend browser storage (so your
// own saved game is never touched) and no sound. Once the game has loaded, the screen's run() is
// played inside it, using the game's own functions, to get to that screen. A few helpers are there
// for run(): wait(ms), click(selector), next() (A in the speech box), npc(id) (a character) and
// play() (Continue from the title screen).
//
// Add a screen whenever the game gets a new one. tests/screens.test.js checks that every game
// function a screen uses still exists.

// Pretend saves. Words are {lv, due, ok}: lv 1 Caught, 2 Recognised, 3 Read, 4 Used.
const knows = (lv, words) => Object.fromEntries(words.map(w => [w, {lv, due: 0, ok: 0}]));
const MIDDLE_WORDS = ['石头', '你好', '山', '路', '花', '草', '树', '桃子', '苹果', '动物', '兔子', '水', '吃', '喝', '要', '我', '猴子', '老板', '河', '鱼', '头带'];
const QUIET = {sound: false, music: false};
const ALL_TIPS = {walk: 1, talk: 1, look: 1, grey: 1, menu: 1};   // tips already had (js/tips.js)
const SAVES = {
  // just born, with the old monkey waiting: no tips had yet
  born: {version: 17, started: true, tips: {}, ...QUIET, w: knows(1, ['石头']), pos: {x: 9, y: 2, dir: 'up'}},
  // halfway through Flower Fruit Mountain, holding a peach for the hungry monkey
  middle: {version: 17, started: true, tips: ALL_TIPS, ...QUIET, shells: 6, xp: 260, w: knows(1, MIDDLE_WORDS),
    met: ['rabbit'], friends: ['rabbit'], pos: {x: 13, y: 6, dir: 'up'},
    wardrobe: {owned: ['头带'], wearing: []},
    areas: {1: {elder: 2, hungry: 'asked', thirsty: 'asked', flowers: 'not asked', holding: {hungry: '桃子'}, gate: true, story: false}}},
};
SAVES.knowsWell = {...SAVES.middle, w: knows(2, MIDDLE_WORDS)};   // every word Recognised: animals ask you to read
SAVES.facing = {...SAVES.born, tips: {walk: 1}, pos: {x: 7, y: 2, dir: 'up'}};   // facing the old monkey, having walked
SAVES.noMenuTip = {...SAVES.middle, tips: {...ALL_TIPS, menu: 0}};

// The screens, in the order you meet them. save: one of SAVES (none: a brand-new game). voices: 'zh'
// (a Chinese voice, the usual), or 'missing' (only English voices). why: what to look out for.
const SCREENS = [
  {id: 'title', title: 'Title screen', why: 'A new game.'},
  {id: 'title-novoice', title: 'Title, no Chinese voice', voices: 'missing', why: 'The warning must not push the buttons off screen.'},
  {id: 'title-back', title: 'Title, coming back', save: 'middle'},
  {id: 'intro-sea', title: 'Opening: the mountain', run: async () => { click('#newBtn'); introClock = 2.85; advancedTo = 1; await wait(400); }},
  {id: 'intro-eyes', title: 'Opening: light in its eyes', run: async () => { click('#newBtn'); introClock = 10.65; advancedTo = 5; await wait(400); }},
  {id: 'stone', title: 'Born from the stone', why: 'Straight after Start: a word you discover yourself.', run: async () => { startGame(); await wait(1500); }},
  {id: 'first-steps', title: 'First steps', why: 'The message, the task box, the arrow and the first tip.', run: async () => {
    startGame(); await wait(1500); click('[data-a=ok]'); await wait(500); }},
  {id: 'tip-talk', title: 'Tip: press A to talk', save: 'facing', run: async () => { play(); await wait(500); }},
  {id: 'tip-menu', title: 'Tip: the Menu', save: 'noMenuTip', why: 'Once you know 3 words, for 8 seconds.', run: async () => { play(); await wait(500); }},
  {id: 'hello', title: 'The old monkey says hello', save: 'born', why: 'The speech box, teaching a word.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(600); }},
  {id: 'hello-card', title: 'A new word in a conversation', save: 'born', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(400); }},
  {id: 'first-reply', title: 'Your first reply', save: 'born', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); click('[data-a=ok]'); await wait(400); }},
  {id: 'welcome', title: 'The old monkey’s welcome', save: 'born', why: 'A line of story, waiting in the speech box.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); click('[data-a=ok]'); await wait(200);
    next(); await wait(200); next(); await wait(500); }},
  {id: 'go-look', title: 'Off you go', save: 'born', why: 'His hint, and the tip about grey words.', run: async () => {
    play(); await wait(100); talk(npc('elder')); await wait(200); next(); await wait(200); click('[data-a=ok]'); await wait(200);
    next(); await wait(200); next(); await wait(200); next(); await wait(500); }},
  {id: 'playing', title: 'Playing', save: 'middle', why: 'The map, the task box, the header.', run: async () => { play(); await wait(600); }},
  {id: 'gap-picture', title: 'Fill the gap (pictures)', save: 'middle', why: 'Giving the peach: the word is new, so the choices are pictures.', run: async () => {
    play(); await wait(100); gapQ({who: speaker('hungry'), t: toks('我 要 吃 桃子'), en: 'I want to eat a peach.', gap: '桃子'}); await wait(400); }},
  {id: 'gap-words', title: 'Fill the gap (words)', save: 'knowsWell', why: 'Once a word is recognised, the choices are Chinese and pinyin.', run: async () => {
    play(); await wait(100); gapQ({who: speaker('thirsty'), t: toks('我 要 喝 水'), en: 'I want to drink some water.', gap: '喝'}); await wait(400); }},
  {id: 'shop', title: 'The shop', save: 'middle', run: async () => { play(); await wait(100); shop(speaker('boss')); await wait(200); next(); await wait(400); }},
  {id: 'animal-card', title: 'Meeting an animal', save: 'middle', why: 'The first time: its name on a new-word card.', run: async () => {
    play(); await wait(100); showNotice('狐狸', {note: 'A wild fox jumped out of the 草 (grass)! Answer its questions to make friends.'}); await wait(400); }},
  {id: 'encounter-listen', title: 'Animal: listen', save: 'middle', why: 'The question must never be about the animal itself.', run: async () => {
    play(); await wait(100); encounter({id: 'rabbit', hz: '兔子', img: portrait('rabbit'), wild: true}); await wait(500); }},
  {id: 'encounter-read', title: 'Animal: read', save: 'knowsWell', run: async () => {
    play(); await wait(100); encounter({id: 'rabbit', hz: '兔子', img: portrait('rabbit'), wild: true}); await wait(500); }},
  {id: 'encounter-answered', title: 'Animal: answered', save: 'middle', why: 'After choosing an answer.', run: async () => {
    play(); await wait(100); encounter({id: 'rabbit', hz: '兔子', img: portrait('rabbit'), wild: true}); await wait(300);
    click('.opt'); await wait(400); }},
  {id: 'menu', title: 'Menu', save: 'middle', run: async () => { play(); await wait(100); openMenu(); await wait(300); }},
  {id: 'tasks', title: 'Tasks', save: 'middle', run: async () => { play(); await wait(100); tasksPage(() => closeCard()); await wait(300); }},
  {id: 'scroll', title: 'Word Scroll', save: 'middle', run: async () => { play(); await wait(100); openScroll(() => closeCard()); await wait(300); }},
  {id: 'word-page', title: 'A word’s page', save: 'middle', run: async () => { play(); await wait(100); wordPage('桃子', () => closeCard()); await wait(300); }},
  {id: 'wardrobe', title: 'Wardrobe', save: 'middle', run: async () => { play(); await wait(100); wardrobePage(() => closeCard()); await wait(300); }},
  {id: 'settings', title: 'Settings', save: 'middle', run: async () => { play(); await wait(100); openSettings(); await wait(300); }},
  {id: 'howto-1', title: 'How to play, 1 of 2', save: 'middle', why: 'Now only in Settings.', run: async () => { play(); await wait(100); howToPlay(); await wait(300); }},
  {id: 'howto-2', title: 'How to play, 2 of 2', save: 'middle', run: async () => { play(); await wait(100); howToPlay(); await wait(100); click('[data-a=next]'); await wait(300); }},
  {id: 'story', title: 'The Story Scroll', save: 'middle', run: async () => { play(); await wait(100); storyScroll(); await wait(400); }},
  {id: 'cave-door', title: 'The cave door, not ready', save: 'middle', run: async () => { play(); await wait(100); ACTIONS.caveDoor(tileAt(3, 3)); await wait(400); }}
];

// What goes at the top of each frame, before the game's own scripts: pretend storage holding the
// save, a pretend Chinese voice that says nothing, no sound effects or music, the helpers, and a
// list of any errors.
function prepare(save, voices){
  const mem = {};
  if (save) mem['xiaohouzi-v2'] = JSON.stringify(save);
  const storage = {getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; },
    clear: () => { for (const k in mem) delete mem[k]; }, key: i => Object.keys(mem)[i] || null, get length(){ return Object.keys(mem).length; }};
  Object.defineProperty(window, 'localStorage', {value: storage, configurable: true});
  const list = voices === 'missing' ? [{lang: 'en-GB', name: 'English'}] : [{lang: 'zh-CN', name: 'Chinese'}];
  const speech = {speaking: false, pending: false, speak: u => setTimeout(() => u.onend && u.onend(), 200), cancel(){}, pause(){}, resume(){},
    getVoices: () => list, addEventListener(){}, removeEventListener(){}};
  Object.defineProperty(window, 'speechSynthesis', {value: speech, configurable: true});
  window.SpeechSynthesisUtterance = function(text){ this.text = text; };
  window.AudioContext = window.webkitAudioContext = undefined;
  const still = document.createElement('style');   // no animations, so every screen is seen as it settles
  still.textContent = '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}';
  document.head.append(still);
  window.__errors = [];
  window.addEventListener('error', e => window.__errors.push(e.message));
  window.addEventListener('unhandledrejection', e => window.__errors.push(String(e.reason && e.reason.message || e.reason)));
  window.wait = ms => new Promise(r => setTimeout(r, ms));
  window.click = sel => { const el = document.querySelector(sel); if (el) el.click(); return !!el; };
  window.next = () => { if (talkNext) talkNext(); };
  window.npc = id => NPCS.find(n => n.id === id);
  window.play = () => click('#contBtn');
}

/* ================= THE PAGE ================= */
let gamePage = null;
async function load(fig, s, [w, h], zoom){
  if (!gamePage) gamePage = await (await fetch('../index.html', {cache: 'no-store'})).text();
  const box = fig.querySelector('.frame'), note = fig.querySelector('.state');
  box.style.width = w * zoom + 'px'; box.style.height = h * zoom + 'px';
  const f = document.createElement('iframe');
  f.width = w; f.height = h; f.style.transform = `scale(${zoom})`; f.title = s.title;
  const top = `<base href="${new URL('../', location.href)}"><script>(${prepare})(${JSON.stringify(s.save ? SAVES[s.save] : null)}, ${JSON.stringify(s.voices || 'zh')})<\/script>`;
  f.srcdoc = gamePage.replace(/<head>/i, '<head>' + top);
  box.replaceChildren(f);
  note.textContent = 'Loading…';
  await new Promise(r => f.addEventListener('load', r, {once: true}));
  try {
    if (s.run) await f.contentWindow.eval(`(${s.run})()`);
    const errs = f.contentWindow.__errors;
    note.className = 'state' + (errs.length ? ' err' : '');
    note.textContent = errs.length ? 'Error: ' + errs.join('; ') : '';
  } catch(e){ note.className = 'state err'; note.textContent = 'Error: ' + e.message; }
}
function build(){
  const [w, h] = $('#size').value.split('x').map(Number), zoom = +$('#zoom').value;
  const only = new URLSearchParams(location.search).get('only');
  const shown = only ? SCREENS.filter(s => only.split(',').includes(s.id)) : SCREENS;
  const grid = $('#grid');
  grid.replaceChildren();
  for (const s of shown){
    const fig = document.createElement('figure');
    fig.style.width = w * zoom + 'px';
    fig.innerHTML = `<div class="frame"></div><figcaption><b>${s.title}</b>${s.why ? `<span class="why">${s.why}</span> ` : ''}<span class="state"></span> <a href="?only=${s.id}">alone</a></figcaption>`;
    grid.append(fig);
    load(fig, s, [w, h], zoom);
  }
}
const $ = sel => document.querySelector(sel);
if (typeof module !== 'undefined') module.exports = {SCREENS, SAVES};   // for the tests
else {
  const q = new URLSearchParams(location.search);
  if (q.get('size')) $('#size').value = q.get('size');
  if (q.get('zoom')) $('#zoom').value = q.get('zoom');
  $('#size').onchange = $('#zoom').onchange = $('#reload').onclick = build;
  build();
}
