// Both ways (decided 9 November 2026, in DESIGN.md): a game learns Chinese, played in English, as every game always
// has, or English, played in Chinese (LEARN, chosen as the page loads: js/data.js). Learning Chinese, everything here
// gives exactly what the game has always shown.

// What the game says to you in your own language: its English as written, or learning English, its Chinese (ZH_UI, in
// content/chinese-ui.js, looked up by the English as written). vars fill in its {name}s, such as {n} for a number, so
// Chinese can put them in its own order; anything else in braces, such as a word ({水}) or a counter, is left for fill
// (js/helpers.js).
function ui(text, vars){
  let s = LEARN === 'en' && typeof ZH_UI !== 'undefined' && Object.hasOwn(ZH_UI, text) ? ZH_UI[text] : text;
  if (vars) s = String(s).replace(/\{(\w+)\}/g, (m, k) => Object.hasOwn(vars, k) ? String(vars[k]) : m);
  return s;
}

/* ================= LEARNING ENGLISH: THE WORDS ================= */
// Each word keeps its Chinese as its name (WORDS, saves, pictures, the story's steps); learning English, what you see
// and hear of it is its English (EN_WORDS, content/english.js).
const EN = typeof EN_WORDS === 'undefined' ? {} : EN_WORDS;
const enW = w => (EN[w] && EN[w].w) || w;   // a word's English, as it's learned ('stone'), or its name if it has none
const pluralOf = s => /(s|x|z|ch|sh)$/i.test(s) ? s + 'es' : /[^aeiou]y$/i.test(s) ? s.slice(0, -1) + 'ies' : s + 's';
const enPlural = w => (EN[w] && EN[w].pl) || pluralOf(enW(w));
// A verb's -ing and -ed, with the usual spelling changes (running, jogged, making, cried): only to know a word in a
// sentence as one you've learned, so a form no one says does no harm.
function verbForms(s){
  const cvc = /^[^aeiou]*[aeiou][bdgmnprt]$/i.test(s);   // (run, stop, jog: a short word ending in one vowel and a consonant)
  const ing = /ie$/.test(s) ? s.slice(0, -2) + 'ying' : /[^e]e$/.test(s) ? s.slice(0, -1) + 'ing' : cvc ? s + s.slice(-1) + 'ing' : s + 'ing';
  const ed = /e$/.test(s) ? s + 'd' : /[^aeiou]y$/.test(s) ? s.slice(0, -1) + 'ied' : cvc ? s + s.slice(-1) + 'ed' : s + 'ed';
  return [ing, ed];
}
const lc = s => s.toLowerCase().replace(/'/g, '’');
// Every form of every word, in lower case (several words with spaces between, a comma its own), to the word it belongs
// to: 'peaches' to 桃子, 'ran' to 跑, 'thank you' to 谢谢. A word that's the same in English as another (两, two: same)
// leaves it to that one.
const EN_FORMS = new Map();
for (const [w, e] of Object.entries(EN)){
  if (e.same) continue;
  const base = e.w, one = !/\s/.test(base) && base.length > 2;   // (no endings on I: I with -s would make is; no -ing or -ed on a phrase)
  const forms = [base, ...(e.pl ? [e.pl] : base.length > 2 ? [pluralOf(base)] : []), ...(one ? verbForms(base) : []), ...(e.also || [])];
  for (const f of forms) { const k = lc(f).replace(/,/g, ' ,').replace(/\s+/g, ' '); if (!EN_FORMS.has(k)) EN_FORMS.set(k, w); }
}
const EN_LONGEST = Math.max(1, ...[...EN_FORMS.keys()].map(k => k.split(' ').length));
// An English word, as it's written in a sentence, to the word it belongs to (its Chinese), or null: 'Peaches' → 桃子;
// one with an ending added to it, I’m or it’s, as the word before it (I, it).
function idOf(tok){
  if (!tok || !/[A-Za-z]/.test(tok)) return null;
  const k = lc(tok);
  if (EN_FORMS.has(k)) return EN_FORMS.get(k);
  const stem = k.replace(/’(m|s|re|ll|ve|d|t)$/, '');
  return stem !== k && EN_FORMS.has(stem) ? EN_FORMS.get(stem) : null;
}
// An English sentence as its words and punctuation, each word as written: 'I’m hungry.' → ['I’m', 'hungry', '.']. Words
// that are one word together, a phrase (thank you) or two words (queen bee), stay together as one.
function enToks(en){
  const raw = String(en).replace(/'/g, '’').match(/[A-Za-z0-9]+(?:[’-][A-Za-z]+)*|…|\.\.\.|[^\sA-Za-z0-9]/g) || [];
  const out = [];
  for (let i = 0; i < raw.length;){
    let took = 1;
    for (let n = Math.min(EN_LONGEST, raw.length - i); n > 1; n--){
      const k = lc(raw.slice(i, i + n).join(' '));
      if (EN_FORMS.has(k) && /[A-Za-z]/.test(raw[i]) && /[A-Za-z]/.test(raw[i + n - 1])){ out.push(raw.slice(i, i + n).join(' ').replace(/ ,/g, ',')); took = n; break; }
    }
    if (took === 1) out.push(raw[i]);
    i += took;
  }
  return out;
}
const EN_PUNCT = new Set(['.', '!', '?', ',', '…', '...', ':', ';', '“', '”', '‘', '’', '(', ')', '—', '–']);
const isEnWord = t => /[A-Za-z0-9]/.test(t);
// Chinese written as the content writes it, with spaces between its words ('我 饿 了 。'), as it's read: '我饿了。'
const zhText = zh => String(zh).replace(/ /g, '');

/* ================= WHAT A WORD SHOWS ================= */
// Learning Chinese, each of these gives just what the game always showed; learning English, its English side.
const LANG = LEARN === 'en' ? ' lang="en"' : '';   // on what shows the language being learned, learning English (so it's told apart from the rest)
const enIpa = w => (EN[w] && EN[w].ipa) || '';
const enZh = w => (EN[w] && EN[w].zh) || w;
const wd = w => LEARN === 'en' ? enW(w) : w;   // a word as you learn it: its characters, or its English
const wpy = w => LEARN === 'en' ? (S.ipa ? enIpa(w) : '') : WORDS[w].py;   // what's over it: its pinyin, or its 音标 if Settings shows them
const wmean = w => LEARN === 'en' ? enZh(w) : WORDS[w].en;   // what it means: its English, or its Chinese
const wmean1 = w => LEARN === 'en' ? enZh(w) : WORDS[w].en.split(',')[0];   // (the first of its meanings)
const showPy = () => LEARN === 'en' ? !!S.ipa : S.pinyin;   // is what goes over words shown? (Settings)
// A sentence the content writes as Chinese (with spaces between its words) and English, as the engine shows it: its words,
// t, what it means, en, and (learning English) what's said, say.
const sent = (zh, en) => LEARN === 'en' ? {t:enToks(en), en:zhText(zh), say:en} : {t:toks(zh), en};
const isPunct = t => LEARN === 'en' ? !isEnWord(t) : PUNCT.has(t);
// Learning English, what sounds the same to anyone just hearing it (as toneless does for Chinese, js/quiz.js): a word in a
// pair that sounds alike (EN_SOUNDS), or two words that are the same in English (二 and 两, two).
const enSoundKey = w => { const i = EN_SOUNDS.findIndex(p => p.words.includes(w)); return i >= 0 ? 'pair' + i : lc(enW(w)); };
// Learning English, a sentence with a word missing (gapQ, js/quiz.js): the English sentence's words (toks), with the gap's
// own word as a gap (gapped), what it means (zh), and each choice in the form the sentence needs (form): peaches, not
// peach, if it says I have two ＿. (Never a grammar test: every choice has the same ending.)
function enGap(t, en, gap){
  const toks = enToks(en), at = toks.findIndex(x => idOf(x) === gap), said = at >= 0 ? toks[at] : enW(gap), base = enW(gap);
  const ending = lc(said) === lc(base) ? '' : lc(said) === lc(enPlural(gap)) ? 'pl' : /ing$/i.test(said) ? 'ing' : /ed$/i.test(said) ? 'ed' : '';
  const capital = at === 0 || (at > 0 && /^[.!?]$/.test(toks[at - 1]));
  const form = w => { const b = enW(w), [ing, ed] = /\s/.test(b) ? [b, b] : verbForms(b), f = ending === 'pl' ? enPlural(w) : ending === 'ing' ? ing : ending === 'ed' ? ed : b; return capital ? cap(f) : f; };
  return {toks, gapped:at >= 0 ? toks.map((x, i) => i === at ? GAP : x) : [...toks, GAP], zh:zhText(t.join(' ')), form};
}
// Learning English, the child's game's question about w (Is this a peach? Are these grapes? Is this water?).
const enIsIt = w => { const e = EN[w] || {}, x = enW(w); return e.many ? `Are these ${x}?` : e.mass ? `Is this ${x}?` : ['海', '河'].includes(w) ? `Is this the ${x}?` : `Is this ${/^[aeiou]/i.test(x) ? 'an' : 'a'} ${x}?`; };
// A scene's captions, as the engine shows them (sceneCaps, js/data.js): learning English, in English, with their Chinese.
const capsOf = list => LEARN === 'en' ? list.map(c => ({t:c.at, words:enToks(c.en), en:zhText(c.zh), say:c.en, teach:c.teach})) : sceneCaps(list);
// How wide some words are, counting a Chinese character as two letters (a button's label, on one line or two).
const wide = s => [...String(s)].reduce((n, c) => n + (/[⺀-鿿＀-￯]/.test(c) ? 2 : 1), 0);
// A name as names are shown (a place's, the game's): its Chinese, pinyin and English; learning English, its English, then
// its Chinese (names aren't words to learn, so both are always there).
const placeNameHTML = n => LEARN === 'en' ? `<span class="pzh"${LANG}>${esc(n.en)}</span> <span class="ppy"></span><span class="pen">${n.zh}</span>`
  : `<span class="pzh">${n.zh}</span> <span class="ppy">${n.py}</span><span class="pen">${esc(n.en)}</span>`;
// A character's name, for the speech box's name plate (speaker, js/art.js): {zh, py, en}, or learning English, its English
// first (or the word's, for an animal), then its Chinese.
const nameShown = n => LEARN !== 'en' || !n ? n : / \(you\)$/.test(n.en || '') ? {zh:n.en.replace(/ \(you\)$/, ''), py:'', en:`${n.zh}（你）`, lang:true}
  : {zh:n.en || enW(n.zh), py:'', en:n.en ? n.zh : '', lang:true};
// Learning English, the English words in Chinese text written for the game, such as a tip (rabbit 有两拍), marked as English
// (text already made safe for a page: its &amp;s left alone).
const enMark = s => LEARN === 'en' ? String(s).replace(/&[a-z]+;|[A-Za-z][A-Za-z’'-]*/g, m => m[0] === '&' ? m : `<span lang="en">${m}</span>`) : s;
// (learning English, a word that's the same in English as another, such as 两, kept as that one: js/data.js)
const SAME = LEARN === 'en' ? Object.fromEntries(Object.entries(EN).filter(([w, e]) => e.same).map(([w, e]) => [w, e.same])) : {};
const tokId = t => LEARN === 'en' ? idOf(t) : t;   // the word a word in a sentence is
const lineHas = (line, w) => line.t.some(x => tokId(x) === w);
// A line the engine has made from the content's Chinese ({t: its words, en: its English}), as it's shown: learning English,
// turned round, as every line is (its English words, its Chinese, and the English to hear); one already in English (say)
// as it is. Learning Chinese, just as it was.
const asLine = line => LEARN === 'en' && line && !line.say ? sent(line.t.join(' '), line.en) : line;

// Learning English, what the characters say is their English (each line's en), and what it means is its Chinese, so
// every line the engine shows (L, the story's sentences and the opening's captions, js/data.js) is turned round:
// t, its English words; en, its Chinese; say, the English to hear.
// (a line's English can have the word it's about in braces, as hide and seek's do, I’m under the {桌子}!: said and shown
// as English, under the table; and its Chinese, what it means, with that word left in English, 我在 table 下面！, so finding
// it tests the English word, as learning Chinese its English leaves the word in Chinese)
const BRACED = /\{([^}|]+)(?:\|([^}]+))?\}/g;
const plainEn = s => String(s).replace(BRACED, (m, w, e) => e || enW(w));
const zhWithEn = (zh, en) => { let t = zh.split(' '); for (const [, w, e] of String(en).matchAll(BRACED)) t = t.map(x => x === w ? ` ${e || enW(w)} ` : x); return t.join('').replace(/^ | $/g, '').replace(/ (?=[，。！？])/g, ''); };
if (LEARN === 'en'){
  for (const [k, line] of Object.entries(AREA.lines)){
    const en = (typeof EN_LINES !== 'undefined' && EN_LINES[k]) || line.en;   // (content/english.js: where the content's English doesn't have the word a line teaches)
    L[k] = {t:enToks(plainEn(en)), en:/[{]/.test(en) ? zhWithEn(line.zh, en) : zhText(line.zh), say:plainEn(en)};
  }
  STORY.forEach((s, i) => Object.assign(s, {t:enToks(AREA.story[i].en), en:zhText(AREA.story[i].zh), say:AREA.story[i].en}));
  CAPS.forEach((c, i) => Object.assign(c, {words:enToks(AREA.intro[i].en), en:zhText(AREA.intro[i].zh), say:AREA.intro[i].en}));
}
// The page's own words (index.html), learning English: in Chinese, as the page loads (the start-up screen's, the labels
// under the small buttons, what the buttons are called, the keys on a computer and the card asking to turn the phone),
// and the page itself in Chinese (its lang), the English you learn marked as English where it's shown (LANG).
const PAGE_TEXT = {'.boot .slow':'Slow connection, still loading…', '#skipBtn':'Skip', '#selectBtn + .sslabel':'TASKS', '#startBtn + .sslabel':'MENU',
  '#bagBtn + .sslabel':'BAG', '#mapBtn + .sslabel':'MAP', '.keys':'Arrow keys or WASD to move · Space or Enter for A · X for B (back) · M or Esc for the menu · T for your tasks · I for your bag · P for the map',
  '#turn p':'Turn your phone sideways to play', '#turn p.small':'On a computer, make the window wider.'};
const PAGE_LABELS = {'.boot':'Loading', '#screen':'Game screen', '#hud':'Your health', '.dpad':'Direction pad', '.dpad .u':'Walk up', '.dpad .l':'Walk left',
  '.dpad .r':'Walk right', '.dpad .d':'Walk down', '#selectBtn':'Your tasks', '#startBtn':'The menu', '#btnB':'Back or menu', '#btnA':'Talk or look',
  '#bagBtn':'Your bag', '#mapBtn':'The map'};
if (LEARN === 'en'){
  try {
    if (document.documentElement && document.documentElement.setAttribute) document.documentElement.setAttribute('lang', 'zh-CN');
    const one = sel => { const [a, b] = sel.split(' + '); if (!b) return document.querySelector(a); const el = document.querySelector(a); return el && el.parentElement ? el.parentElement.querySelector(b) : null; };
    for (const [sel, text] of Object.entries(PAGE_TEXT)){ const el = one(sel); if (el) el.textContent = ui(text); }
    for (const [sel, text] of Object.entries(PAGE_LABELS)){ const el = one(sel); if (el && el.setAttribute) el.setAttribute('aria-label', ui(text)); }
  } catch(e) {}
}
/* ================= TRADITIONAL CHINESE ================= */
// Learning English, a game can show its Chinese in traditional characters (Settings: S.script 'tw'; till it's chosen, as the
// device is set, Taiwan's or Hong Kong's Chinese): toTraditional turns some text round (TRADITIONAL, content/traditional.js),
// and writeChinese keeps the page in it as it changes, all but the English you learn (lang="en") and the world's own
// writing, drawn in pixels.
const TW = (() => { const t = typeof TRADITIONAL === 'undefined' ? {chars:''} : TRADITIONAL, m = new Map(), c = [...t.chars]; for (let i = 0; i + 1 < c.length; i += 2) m.set(c[i], c[i + 1]); return {...t, map:m}; })();
function toTraditional(s){
  let out = String(s);
  if (!/[\u4e00-\u9fff]/.test(out)) return out;
  for (const [a, b] of TW.words || []) out = out.split(a).join(b);
  if (TW.measure) out = out.replace(new RegExp(`([${TW.measure[0]}])只(?![${TW.measure[1]}])`, 'g'), '$1隻');
  return [...out].map(c => TW.map.get(c) || c).join('');
}
const deviceTW = () => { try { return /^zh-(tw|hk|mo)|hant/i.test(navigator.language || ''); } catch(e) { return false; } };
const traditionalNow = () => LEARN === 'en' && (S.script ? S.script === 'tw' : deviceTW());
let twWatch = null;
function writeChinese(){
  if (typeof MutationObserver === 'undefined' || typeof document.createTreeWalker !== 'function' || !document.body) return;
  if (!traditionalNow()){ if (twWatch){ twWatch.disconnect(); twWatch = null; } return; }
  if (twWatch) return;
  const cjk = /[\u4e00-\u9fff]/, english = el => !!(el && el.closest && el.closest('[lang="en"]'));
  const text = n => { if (cjk.test(n.nodeValue) && !english(n.parentElement)){ const t = toTraditional(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; } };
  const attrs = el => { for (const a of ['aria-label', 'data-label', 'title']){ const v = el.getAttribute(a); if (v && cjk.test(v)){ const t = toTraditional(v); if (t !== v) el.setAttribute(a, t); } } };
  const all = root => {
    if (root.nodeType === 3) return text(root);
    if (root.nodeType !== 1) return;
    attrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = w.nextNode(); n; n = w.nextNode()) if (n.nodeType === 3) text(n); else attrs(n);
  };
  all(document.body);
  twWatch = new MutationObserver(list => { for (const m of list){ if (m.type === 'characterData') text(m.target); else if (m.type === 'attributes') attrs(m.target); else m.addedNodes.forEach(all); } });
  twWatch.observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['aria-label', 'data-label', 'title']});
}
// The words of a line, as said aloud: its English learning English, or its characters run together.
const lineSay = line => line.say || line.t.join('');
// How a line you've heard is kept in the save (S.lines): its words run together, or learning English, with spaces between.
const lineKey = t => LEARN === 'en' ? t.join(' ') : t.join('');
