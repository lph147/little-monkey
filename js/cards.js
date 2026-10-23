// Sentences with pinyin and tappable words, the speech box characters talk in, and pop-up cards:
// new-word cards and yes/no questions.

/* ================= TOKENS (English on first sight, tap after) ================= */
let markGloss = [];
function info(t){ if (WORDS[t]) return [WORDS[t].py, WORDS[t].en]; if (GLOSS[t]) return GLOSS[t]; return ['','']; }
let teachWord = null;
const GAP = '＿';   // the missing word in a story question
function tokHTML(t){
  if (PUNCT.has(t)) return `<span class="punct">${t}</span>`;
  if (t === GAP) return '<span class="gap" aria-label="missing word">？</span>';
  const [py] = info(t);
  const cls = t === teachWord ? 'learn teach' : (WORDS[t] && lvl(t) >= 1 ? 'learn' : 'listen');
  return `<button class="tok ${cls}" data-t="${esc(t)}"><ruby>${esc(t)}<rt class="${S.pinyin ? '' : 'hid'}">${esc(py)}</rt></ruby></button>`;
}
// A sentence's words in a row that wraps, with each punctuation mark kept on the same line as the word before it.
function lineOf(toks, html){
  const out = [];
  for (const t of toks){ const h = html(t); if (PUNCT.has(t) && out.length) out.push(`<span class="nb">${out.pop()}${h}</span>`); else out.push(h); }
  return `<div class="line">${out.join('')}</div>`;
}
const lineHTML = (toks, teach) => { teachWord = teach || null; const h = lineOf(toks, tokHTML); teachWord = null; return h; };
function bindTokens(root){
  const g = root.querySelector('.gloss');
  root.querySelectorAll('.tok').forEach(b => b.onclick = () => {
    const t = b.dataset.t, [py, en] = info(t);
    root.querySelectorAll('.tok.on').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); const rt = b.querySelector('rt'); if (rt) rt.classList.remove('hid');
    if (g){ g.classList.remove('tip'); g.innerHTML = `<b>${esc(t)}</b> ${esc(py)} · ${esc(en)}${b.classList.contains('listen') ? ' <span class="small">(just listen)</span>' : ''}`; }   // (no longer a tip: shown on every phone)
    say(t);
  });
}
const pips = w => `<span class="pips" aria-label="Level ${lvl(w)} of 4">${[1,2,3,4].map(i => `<i class="${lvl(w) >= i ? 'on' : ''}"></i>`).join('')}</span>`;

/* ================= MODAL ================= */
const modal = $('#modal'), sheet = $('#sheet');
// When the card, or the line in the speech box, showing now appeared (shown()). For a moment after (READ_MS), A and B
// don't press it, nor do presses made before it appeared, while the game was busy: so A pressed again and again while
// waiting can't skip it unread (decided 22 October 2026).
const READ_MS = 300;
let shownAt = -1e9;
const shown = () => { shownAt = performance.now(); };
function tooSoon(at, since = shownAt){   // at: when the press was made, if known (not in the tests or the screens gallery); since: when what it would press appeared
  if (at === undefined) return false;
  const now = performance.now();
  if (!(at > now - 5000 && at <= now + 50)) at = now;   // (a time that can't be right, from an odd browser: as if pressed now, so A never stops working)
  return at < since + READ_MS;
}
function openCard(html){
  sheet.innerHTML = pixelIcons(html); modal.hidden = false; sheet.scrollTop = 0; shown(); cardsOpened++;
  if (markGloss.length){ markGloss.forEach(t => S.gloss[t] = 1); markGloss = []; save(); }
  held = null; queued = null; document.querySelectorAll('.held').forEach(b => b.classList.remove('held'));
  // A always starts on the card's main button. If a card has none (a quiz waiting for an answer), A does nothing until you tap.
  const f = [...sheet.querySelectorAll('.primary')].find(x => !x.hidden && !x.disabled);
  if (f) f.focus({preventScroll:true}); else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
}
// The buttons the D-pad (or the arrow keys) moves between on a card, and A presses: a card's buttons along the bottom,
// a menu's, and those in a choice (data-nav), such as a question's answers and a matching game's words and pictures,
// with a question's 🔊 (a word you've matched already is skipped).
const NAV_SEL = '.actions button, .menu button, [data-nav] button, .askrow button', NAVIGABLE = '.menu, [data-nav]';
function navItems(){ return [...sheet.querySelectorAll(NAV_SEL)].filter(b => !b.disabled && !b.hidden && !b.classList.contains('done') && b.offsetParent !== null); }
const ANSWERS = '.opts .opt, .match .mw';   // where the D-pad starts on a question: its first answer (or word to match)
const markNav = b => { sheet.querySelectorAll('.navsel').forEach(x => x.classList.remove('navsel')); if (b && b.matches(NAV_SEL)) b.classList.add('navsel'); };
sheet.addEventListener('focusin', e => markNav(e.target));
// The button chosen on a card (with the gold outline): the one A presses. Usually it has the keyboard's focus, but an
// iPhone drops the focus when you touch the D-pad or A, so the outline (navsel) remembers it too.
function chosenBtn(){
  const items = navItems(), f = document.activeElement;
  return items.includes(f) ? f : items.find(b => b.classList.contains('navsel')) || null;
}
function navFocus(d){
  const tabs = [...sheet.querySelectorAll('.scrolltabs .tab')];
  if (tabs.length && (d === 'left' || d === 'right')){   // left and right switch the Word Scroll's tabs
    const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    tabs[(i + (d === 'left' ? -1 : 1) + tabs.length) % tabs.length].click();
    return;
  }
  if (tabs.length){   // up and down step through the Word Scroll's words one by one (A opens the chosen one's page), then Back
    const items = navItems(); if (!items.length) return;
    const last = items.length - 1, list = sheet.querySelector('[data-nav]');   // Back, after the words: where it starts
    let cur = items.indexOf(chosenBtn()); if (cur < 0) cur = last;
    // From Back, down goes to the first word, until you've been through the words (then Back is the end: no going round)
    const i = cur === last && d === 'down' ? (list && list.dataset.went ? cur : 0) : cur + (d === 'down' ? 1 : -1);
    if (i >= 0 && i <= last && i !== cur){ markNav(items[i]); items[i].focus({preventScroll:false}); SFX.turn(); if (list) list.dataset.went = '1'; }
    return;
  }
  if (!sheet.querySelector(NAVIGABLE)){ if (d === 'up' || d === 'down') scrollSheet(d); return; }   // otherwise the D-pad only moves through menus (and cards whose buttons are a choice, data-nav); on other cards A is always the main button, and up and down scroll one with more than it shows
  const items = navItems(); if (!items.length) return;
  const cur = items.indexOf(chosenBtn());
  const go = i => { markNav(items[i]); items[i].focus({preventScroll:false}); SFX.turn(); };
  if (cur < 0){ const a = items.findIndex(b => b.matches(ANSWERS)); return go(a >= 0 ? a : Math.max(0, items.findIndex(b => b.classList.contains('primary')))); }
  const inOrder = () => { const i = cur + ((d === 'left' || d === 'up') ? -1 : 1); if (i >= 0 && i < items.length) go(i); };   // (stopping at the first and last: no wrapping round, so Run away never slips back to Hit)
  if (!items.some(b => b.getBoundingClientRect().width)) return inOrder();   // no layout to go by: step through in order
  const next = nearestIn(d, items[cur], items);
  if (next) return go(items.indexOf(next));
  // Nothing that way: left and right step through in reading order (to the next row, in a grid); up
  // and down stay put at the top and bottom, and nothing wraps round from the last button to the first.
  if (d === 'left' || d === 'right') inOrder();
}
// The button you'd reach by moving from b in direction d (up, down, left or right) on screen: the nearest
// one that way, preferring one in line with b (overlapping its column for up and down, its row for left
// and right, so a wide button such as Settings is in line with every tile above it). Null if there's none.
function nearestIn(d, b, items){
  const gap = (a0, a1, b0, b1) => Math.max(0, b0 - a1, a0 - b1);   // how far apart two spans are (0 if they overlap)
  const r0 = b.getBoundingClientRect(), vertical = d === 'up' || d === 'down';
  let best = null, bestScore = Infinity;
  for (const o of items){
    if (o === b) continue;
    const r = o.getBoundingClientRect();
    // how far beyond b's edge it starts, that way (only buttons wholly that way count)
    const along = {up: r0.top - (r.top + r.height), down: r.top - (r0.top + r0.height), left: r0.left - (r.left + r.width), right: r.left - (r0.left + r0.width)}[d];
    const across = vertical ? gap(r0.left, r0.left + r0.width, r.left, r.left + r.width) : gap(r0.top, r0.top + r0.height, r.top, r.top + r.height);
    if (along < -2) continue;   // not that way
    const score = along + across * 2;
    if (score < bestScore){ bestScore = score; best = o; }
  }
  return best;
}
// What the label under A (or B) says a button does: its own (data-label), or its words, with their apostrophes. One
// longer than LABEL_MAX letters gives just its first word, such as Copy for Copy to a file, so a label always fits on
// one line and is never cut off in the middle of a word.
const LABEL_MAX = 13;
function btnLabel(f){
  if (!f) return '';
  if (f.dataset.label) return f.dataset.label;
  if (f.classList.contains('opt') || f.classList.contains('mw') || f.classList.contains('mp')) return 'Choose';
  if (f.classList.contains('sayBig')) return 'Hear it';
  if (f.classList.contains('card') || f.classList.contains('chip')) return 'Hear';
  const t = f.textContent.replace(/[^\p{L}\p{N}'’ ]/gu, '').replace(/\s+/g, ' ').trim();
  return t.length <= LABEL_MAX ? t : t.split(' ')[0].slice(0, LABEL_MAX);
}
function closeCard(){ modal.hidden = true; sheet.innerHTML = ''; more.hidden = true; }
const on = (sel, fn) => { const el = sheet.querySelector(sel); if (el) el.onclick = fn; };
// A card with more than it shows (the Tasks page or How to play on a short screen, the Story Scroll) has ▼ More by
// its buttons while there's more below (decided 22 October 2026: cut off at the bottom, a card gave no sign of it).
// Tapping it, or the D-pad's down (or the down arrow), scrolls down, and up scrolls back, on any card whose D-pad
// doesn't move between buttons (on one that does, the button you choose comes into sight). Checked every frame.
const more = $('#more');
let cardsOpened = 0, moreAt = '';   // (moreAt: the card, and its size, that ▼ More was last placed for)
function moreCue(){
  const left = modal.hidden ? 0 : (sheet.scrollHeight || 0) - (sheet.clientHeight || 0) - (sheet.scrollTop || 0);
  if (left <= 4){ if (!more.hidden) more.hidden = true; return; }
  if (more.hidden) more.hidden = false;
  const bar = [...sheet.children].find(c => c.classList && c.classList.contains('actions'));
  const key = [cardsOpened, sheet.scrollHeight, sheet.clientHeight, bar ? bar.offsetHeight + '/' + bar.textContent.length : 0].join();
  if (key === moreAt) return;
  moreAt = key;
  // Where it goes: in the row of buttons at the card's bottom, in the first gap with room for it (left of the buttons,
  // or between them), so it covers nothing; else just over the row, at its left (or over the card's bottom edge, on a
  // card whose buttons don't stay there). What's in the row takes the room of its words (an empty message, none), and
  // a button its own, even while hidden (a question's Next, which comes when you answer).
  const m = modal.getBoundingClientRect(), w = more.offsetWidth || 0, h = more.offsetHeight || 0;
  const sticky = bar && (!window.getComputedStyle || getComputedStyle(bar).position === 'sticky');
  let x = null, y;
  if (sticky){
    const r = bar.getBoundingClientRect(), taken = [...bar.children].filter(c => c.getBoundingClientRect).map(c => {
      if (c.matches('button, .btn') || !document.createRange) return c.getBoundingClientRect();
      const words = document.createRange(); words.selectNodeContents(c); return words.getBoundingClientRect();
    }).filter(k => k.width).sort((a, b) => a.left - b.left);
    let from = r.left + 8, first = true;
    for (const k of [...taken, {left: r.right - 8, right: r.right}]){
      if (k.left - from >= w + 12){ x = (first ? from + 6 : (from + k.left - w) / 2) - m.left; break; }
      from = Math.max(from, k.right); first = false;
    }
    if (x !== null) y = (taken.length ? (Math.min(...taken.map(k => k.top)) + Math.max(...taken.map(k => k.bottom))) / 2 : r.top + r.height / 2) - m.top - h / 2;
    else { x = r.left + 14 - m.left; y = r.top - m.top - h - 2; }
  } else y = sheet.getBoundingClientRect().bottom - m.top - h - 10;
  more.classList.toggle('inrow', x !== null);
  more.style.left = x === null ? '' : Math.round(x) + 'px';
  more.style.top = Math.round(y) + 'px';
}
function scrollSheet(d){   // the card, by most of what it shows
  const top = sheet.scrollTop || 0, max = Math.max(0, (sheet.scrollHeight || 0) - (sheet.clientHeight || 0));
  const to = clamp(top + (d === 'down' ? 1 : -1) * Math.round((sheet.clientHeight || 0) * .6), 0, max);
  if (Math.abs(to - top) < 1) return;
  const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sheet.scrollTo) sheet.scrollTo({top: to, behavior: still ? 'auto' : 'smooth'}); else sheet.scrollTop = to;
  SFX.turn();
}
more.onclick = () => scrollSheet('down');

/* ================= SPEECH BOX (what characters say, over the bottom of the map) ================= */
const talkBox = $('#talk');
let talkNext = null;          // moves on to what comes after the line, while the speech box is showing one
let talkMove = null;          // moves between reply choices with the D-pad, while the box shows them
let lastLine = null;          // the line someone else said last ({id, line}), until the story moves on: what a reply answers
const TAP_TIP_LINES = 5;      // "Tap any word" shows under your first few lines, then only a word's meaning when you tap it
// A line someone says (opts: teach, the word being taught, in bold green; hint, a note under it; ok, what A does, such
// as Give it; last, the conversation's last line: its button says Done, not ▼ Next, so you can tell it's ending).
function showDialog(who, line, opts = {}){
  return new Promise(res => {
    const key = line.t.join(''), firstTime = !S.lines[key];
    S.lines[key] = 1; hear(line.t); save();
    const tip = Object.keys(S.lines).length <= TAP_TIP_LINES, again = !talkBox.hidden;   // again: the box is still up from the last line
    talkBox.innerHTML = pixelIcons(`<div class="talkhead">${who}<span class="spacer"></span><button class="tbtn" data-a="say" aria-label="Hear it again">🔊</button>${firstTime ? '' : '<button class="tbtn" data-a="en">English</button>'}</div>
      ${lineHTML(line.t, opts.teach)}<div class="sentence-en" ${firstTime ? '' : 'hidden'}>${esc(line.en)}</div>${opts.hint ? `<p class="small hintline">${esc(opts.hint)}</p>` : ''}
      <div class="talkfoot${tip ? ' tip' : ''}"><div class="gloss${tip ? ' tip' : ''}">${tip ? 'Tap any word to see what it means.' : ''}</div><button class="btn primary next" data-a="ok" data-label="${esc(opts.ok || (opts.last ? 'Done' : 'Next'))}">${opts.ok ? esc(opts.ok) + ' ▼' : opts.last ? 'Done' : '▼'}</button></div>`);
    talkBox.classList.toggle('again', again);
    talkBox.hidden = false; talkBox.scrollTop = 0; placeTalk(); shown();   // at the top of the screen, if at the bottom it would cover you
    $('#saybox').hidden = true;   // the box covers the message spot
    held = null; queued = null; document.querySelectorAll('.held').forEach(b => b.classList.remove('held'));
    bindTokens(talkBox);
    const text = line.t.join(''), q = sel => talkBox.querySelector(sel);
    const id = (who.match(/data-id="([^"]*)"/) || [])[1];   // who's speaking (from speaker()), for their own voice
    lastLine = id && id !== 'player' ? {id, line} : null;
    say(text, null, id);
    q('[data-a=say]').onclick = () => say(text, null, id);
    const en = q('[data-a=en]');
    if (en) en.onclick = () => { q('.sentence-en').hidden = false; en.remove(); };
    const next = () => { talkNext = null; talkMove = null; SFX.blip(); closeTalk(); res(); };
    q('[data-a=ok]').onclick = next;
    talkNext = next;
  });
}
// A line of the story in the speech box during a conversation, in English, said by no one: such as what
// the old monkey does for baby monkeys. A moves on, so the next line can't cover it. The conversation's last (last): Done.
function showNarration(text, last){
  lastLine = null;   // (the story has moved on)
  return new Promise(res => {
    talkBox.innerHTML = `<p class="narration">${pixelIcons(esc(text))}</p>
      <div class="talkfoot"><span class="spacer"></span><button class="btn primary next" data-a="ok" data-label="${last ? 'Done' : 'Next'}">${last ? 'Done' : '▼'}</button></div>`;
    talkBox.classList.toggle('again', !talkBox.hidden);
    talkBox.hidden = false; talkBox.scrollTop = 0; placeTalk(); shown();
    $('#saybox').hidden = true;
    held = null; queued = null;
    const next = () => { talkNext = null; talkMove = null; SFX.blip(); closeTalk(); res(); };
    talkBox.querySelector('[data-a=ok]').onclick = next;
    talkNext = next;
  });
}
// Your reply: the phrases you could say, each with pinyin, and English unless it's switched off in Settings, under what
// you're answering: the face of who you're answering (id), and the line they've just said (line) or a picture of what
// they've given you (pic), with what's happening in plain English and what to do (ask). Tapping one chooses it; on a
// keyboard or the D-pad, move between them and press A. One that doesn't fit (best is the one that does) shows why, and
// the one that fits, until you press A (decided 22 October 2026: it was said anyway, as if it fitted). Gives the phrase
// you chose. The box stays up for your line, which comes next. With only one phrase to say (your very first reply), it
// isn't a choice: you're asked to say it.
function chooseReply(choices, {id, line, pic, ask, best} = {}){
  return new Promise(res => {
    let sel = 0;
    talkBox.innerHTML = `<div class="replyto">${id ? portrait(id) : ''}${line ? lineHTML(line.t) : ''}${pic ? `<span class="gift">${picHTML(pic)}</span>` : ''}</div>
      <p class="ask">${esc(ask || '')}</p>
      <div class="replies">${choices.map((p, i) => `<button class="reply" data-i="${i}"><span class="rzh">${p}</span><span class="rpy">${WORDS[p].py}</span>${S.replyEn ? `<span class="ren">${esc(WORDS[p].en)}</span>` : ''}</button>`).join('')}</div>
      <div class="whyfoot"></div>`;
    talkBox.classList.toggle('again', !talkBox.hidden);
    talkBox.hidden = false; talkBox.scrollTop = 0; placeTalk(); shown();
    $('#saybox').hidden = true;
    held = null; queued = null;
    bindTokens(talkBox);   // (the words they said can be tapped for their meaning, as always)
    const btns = [...talkBox.querySelectorAll('.reply')];
    const mark = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
    const pick = i => {
      talkNext = null; talkMove = null; SFX.blip();
      if (!best || choices[i] === best){ res(choices[i]); return; }
      btns.forEach((b, j) => { b.disabled = true; b.classList.remove('sel'); b.classList.toggle('no', j === i); b.classList.toggle('yes', choices[j] === best); });
      const not = choices[i];
      talkBox.querySelector('.ask').hidden = true;   // (what to do: done; why takes its place, so the box is no taller)
      talkBox.querySelector('.whyfoot').innerHTML = `<p class="why">${esc(`${wz(not)} is for ${WORDS[not].use}. ${cap(WORDS[best].use)}, you say ${wz(best)}.`)}</p>
        <button class="btn primary next" data-a="ok" data-label="Next">▼</button>`;   // (beside why, to keep the box short)
      const next = () => { talkNext = null; SFX.blip(); res(not); };
      talkBox.querySelector('[data-a=ok]').onclick = next;
      talkNext = next; placeTalk(); shown();
    };
    btns.forEach((b, i) => b.onclick = () => pick(i));
    mark();
    talkNext = () => pick(sel);
    talkMove = d => { sel = (sel + (d === 'left' || d === 'up' ? -1 : 1) + choices.length) % choices.length; mark(); SFX.turn(); };
  });
}
// The box stays up for a moment, so lines one after another change in place instead of closing and opening again.
function closeTalk(){ setTimeout(() => { if (!talkNext){ talkBox.hidden = true; talkBox.innerHTML = ''; } }, 0); }
talkBox.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('button')) e.preventDefault(); });   // tapping its buttons doesn't take the keyboard's focus
// How a word is made (MADE, in content/words.js): its parts, each with its pinyin over it and its English (green if it's a
// word you know), and what they add up to; or the clue inside a character; or the picture it was drawn from. Then where
// you've met a part before, in another word you know (just one, so the card stays small). It goes with a word's English:
// on its first card, and behind the English button after that (hide). (Decided 23 October 2026: Chinese is logical.) A
// name can have its own, such as your home's on the sign (nameCard).
const madeParts = m => !m ? [] : m.parts || (m.clue ? [m.clue] : []);
const PART_IN = {};   // each part, such as 果, to the words made with it (水果, 苹果), and others a part names (学: 学校)
for (const [w, m] of Object.entries(MADE)) for (const [zh, , , also] of madeParts(m))
  for (const o of [w, ...[].concat(also || [])]) if (!(PART_IN[zh] = PART_IN[zh] || []).includes(o)) PART_IN[zh].push(o);
const knownWord = (zh, w) => zh !== w && !!WORDS[zh] && lvl(zh) >= 1;   // a part that's a word you know (not the word itself)
function madeLinks(m, w){   // [a part of w (or w itself, one character), a word you know with it too], or none
  for (const zh of m.parts ? m.parts.map(p => p[0]) : [...([...w].length === 1 ? [w] : []), ...madeParts(m).map(p => p[0])]){
    if (knownWord(zh, w)) continue;   // (green in the box already)
    const other = (PART_IN[zh] || []).find(o => knownWord(o, w));
    if (other) return [[zh, other]];
  }
  return [];
}
function madeBox(m, w, hide = false){   // the box for how w is made (m: its entry in MADE, or a name's own)
  const part = ([zh, py, en]) => `<span class="mpart"><ruby${knownWord(zh, w) ? ' class="known"' : ''}>${zh}<rt>${py}</rt></ruby> <span class="mden">${esc(en)}</span></span>`;
  const story = m.parts ? `${m.parts.map(part).join(' <span class="mplus">+</span> ')} <span class="mwhy">= ${esc(m.why)}</span>`   // (spaces: for a screen reader)
    : `${m.clue ? part(m.clue) + ' ' : ''}<span class="mwhy">${esc(m.why)}</span>`;
  const links = madeLinks(m, w).map(([zh, o]) => `<span class="mlink">${zh} is also in <ruby class="known">${o}<rt>${WORDS[o].py}</rt></ruby> (${esc(WORDS[o].en.split(',')[0])}), a word you know.</span>`);
  return `<div class="made"${hide ? ' hidden' : ''}>${story}${links.map(l => ' ' + l).join('')}</div>`;
}
const madeHTML = (w, hide = false) => MADE[w] && WORDS[w] ? madeBox(MADE[w], w, hide) : '';
// A name you can read now, such as your home's on the sign (says: its Chinese and English; m: how it's made, with its
// title): its picture, characters, pinyin and English, and how it's made, as on a word's card. A name isn't a word to
// learn, so nothing is caught.
function nameCard(says, m){
  return new Promise(res => {
    const zh = says.zh;
    SFX.word();
    openCard(`<p class="label">${esc(m.title)}</p>
      <div class="word side"><div class="pic" aria-hidden="true">${picHTML(zh)}</div><div class="big">${zh}</div><div class="py">${info(zh)[0]}</div>
      <div class="en">${esc(says.en)}</div>${madeBox(m, zh)}</div>
      <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button><button class="btn primary" data-a="ok">OK</button></div>`);
    say(zh);
    on('[data-a=say]', () => say(zh));
    on('[data-a=ok]', () => { closeCard(); res(); });
  });
}
// A word's card. It says the word straight away when you discover it yourself; in a conversation
// (opts.quiet) it doesn't, so the conversation isn't broken up by the word again: 🔊 Hear it is there. How the word is made
// goes with its English (madeHTML).
function showNotice(w, opts = {}){
  return new Promise(res => {
    const d = WORDS[w], isNew = lvl(w) === 0;
    if (isNew) SFX.word(); else SFX.blip();
    openCard(`${isNew ? '<p class="label">⭐ New word to learn</p>' : `<p class="label">Word ${pips(w)}</p>`}

      <div class="word side"><div class="pic" aria-hidden="true">${picHTML(w)}</div><div class="big">${w}</div><div class="py">${d.py}</div>
      <div class="en" ${isNew ? '' : 'hidden'}>${esc(d.en)}</div>${opts.note ? `<p class="note">${esc(opts.note)}</p>` : ''}${madeHTML(w, !isNew)}</div>
      <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button>${isNew ? '' : '<button class="btn" data-a="en">English</button>'}<button class="btn primary" data-a="ok">${isNew ? 'Got it' : 'OK'}</button></div>`);
    if (!opts.quiet) say(w);
    on('[data-a=say]', () => say(w));
    on('[data-a=en]', () => { sheet.querySelectorAll('.word .en, .word .made').forEach(x => x.hidden = false); });
    on('[data-a=ok]', () => { closeCard(); if (isNew){ setSeen(w); toast(`${wz(w)} added to your Word Scroll`); } res(); });
  });
}
// What you've picked (f: a few words you know together, such as 红色 的 花, with their English, en), with its own picture,
// on a card like a word's (decided 22 October 2026: picking a red flower showed 花, flower): said straight away, as you
// found it yourself, with a note under it (such as how many you have). (Picking it has its own sound.)
function showPicked(f, note){
  return new Promise(res => {
    const t = toks(f.zh), text = t.join('');
    openCard(`<p class="label">You picked</p>
      <div class="word side"><div class="pic" aria-hidden="true">${picHTML(f.zh)}</div><div class="big">${text}</div><div class="py">${t.map(w => info(w)[0]).join(' ')}</div>
      <div class="en">${esc(f.en)}</div>${note ? `<p class="note">${esc(note)}</p>` : ''}</div>
      <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button><button class="btn primary" data-a="ok">OK</button></div>`);
    say(text);
    on('[data-a=say]', () => say(text));
    on('[data-a=ok]', () => { closeCard(); res(); });
  });
}
function confirmBox(who, html, yes, no){
  return new Promise(res => {
    openCard(`<div class="who" aria-hidden="true">${who}</div><p>${html}</p><div class="actions"><button class="btn" data-a="no" data-b>${no}</button><button class="btn primary" data-a="yes">${yes}</button></div>`);
    on('[data-a=no]', () => { closeCard(); res(false); });
    on('[data-a=yes]', () => { closeCard(); res(true); });
  });
}
