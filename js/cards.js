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
    if (tip && tip.id === 'tap') tipDone('tap');   // (you've found out)
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
const TAP_TIP_LINES = 5;      // "Tap any word": a tip on your very first line (TIPS.tap), only for a new player
// A line someone says (opts: teach, the word being taught, in bold green; hint, a note under it; ok, what A does, such
// as Give it; last, the conversation's last line: its button says Done, not ▼ Next, so you can tell it's ending).
function showDialog(who, line, opts = {}){
  return new Promise(res => {
    const key = line.t.join(''), firstTime = !S.lines[key];
    S.lines[key] = 1; hear(line.t); save();
    const again = !talkBox.hidden;   // again: the box is still up from the last line
    talkBox.innerHTML = pixelIcons(`<div class="talkhead">${who}<span class="spacer"></span><button class="tbtn" data-a="say" aria-label="Hear it again">🔊</button>${firstTime ? '' : '<button class="tbtn" data-a="en">English</button>'}</div>
      <div class="talkline">${lineHTML(line.t, opts.teach)}<div class="gloss"></div></div><div class="sentence-en" ${firstTime ? '' : 'hidden'}>${esc(line.en)}</div>${opts.hint ? `<p class="small hintline">${esc(opts.hint)}</p>` : ''}
      <button class="btn primary next" data-a="ok" data-label="${esc(opts.ok || (opts.last ? 'Done' : 'Next'))}">${opts.ok ? esc(opts.ok) + ' ▼' : opts.last ? 'Done' : '▼'}</button>`);
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
// you've met a part before, in another word you know (just one, so the card stays small). (Decided 23 October 2026:
// Chinese is logical.) A name can have its own, such as your home's on the sign (nameCard).
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
// How a word is made, on a card of its own (decided 24 October 2026: under the word, its English and a note, the box crowded
// the card): the second step of a new word's card (How it's made ▸), and seen again, from the English button. A word made of
// parts shows each in turn, with its picture if it's a word with one, its pinyin and English (green if it's a word you know),
// then = the word itself, with its picture, and what they add up to. A clue shows the character big, with the clue beside
// it and why; a picture shows what the character was drawn from, beside it. Under it, where you've met a part before, or
// that you know every part already.
const partPic = zh => PICTURES[zh] && WORDS[zh] ? picHTML(zh) : '';
function madeStage(w){
  const m = MADE[w], d = WORDS[w];
  const col = (zh, py, en, cls = '', pic = '') => `<div class="mcol ${cls}"><div class="mcpic" aria-hidden="true">${pic}</div><span class="mcpy">${esc(py)}</span> <span class="mchz">${zh}</span> <span class="mcen">${esc(en)}</span></div>`;
  const op = c => `<div class="mcol mop" aria-hidden="true"><div class="mcpic"></div><span class="mcpy"></span><span class="mchz">${c}</span></div>`;   // + and =, in line with the characters
  const links = madeLinks(m, w).map(([zh, o]) => `<p class="mnote">${zh} is also in <ruby class="known">${o}<rt>${WORDS[o].py}</rt></ruby> (${esc(WORDS[o].en.split(',')[0])}), a word you know.</p>`).join('');
  if (m.parts){
    // A part you've met inside another word you know shows that word, with its picture, until the part lifts out of it
    // (madeAnim): "as in 水果 (fruit)" says where it's from.
    const [link] = madeLinks(m, w);
    const parts = m.parts.map(([zh, py, en], i) => {
      const known = knownWord(zh, w), from = !known && link && link[0] === zh ? link[1] : null;
      if (!from) return col(zh, py, en, `mpart${known ? ' known' : ''}`, partPic(zh)).replace('<div class="mcol', `<div data-i="${i}" class="mcol`);
      const at = from.indexOf(zh), fade = t => t ? `<span class="mfade">${t}</span>` : '';
      return `<div data-i="${i}" class="mcol mpart from"><div class="mcpic" aria-hidden="true">${PICTURES[from] ? picHTML(from) : ''}</div>`
        + `<span class="mcpy"><span class="mpyword">${esc(WORDS[from].py)}</span><span class="mpypart">${esc(py)}</span></span> `
        + `<span class="mchz">${fade(from.slice(0, at))}<span class="mpartch">${zh}</span>${fade(from.slice(at + zh.length))}</span> `
        + `<span class="mcen">${esc(en)}</span> <span class="mfrom">as in ${esc(wz(from))}</span></div>`;
    });
    const word = `<div class="mcol mword"><div class="mcpic" aria-hidden="true">${PICTURES[w] ? picHTML(w) : ''}</div><span class="mcpy">${esc(d.py)}</span> `
      + `<span class="mchz">${m.parts.map(([zh], i) => `<span class="mch" data-i="${i}">${zh}</span>`).join('')}</span> <span class="mcen">${esc(m.why)}</span></div>`;
    const all = m.parts.every(([zh]) => knownWord(zh, w)), pics = !!PICTURES[w] || m.parts.some(([zh]) => partPic(zh)) || !!(link && PICTURES[link[1]]);
    return `<div class="madestage parts${pics ? '' : ' nopic'}">${parts.join(op('+'))}${op('=')}${word}</div>`
      + (all ? `<p class="mnote known">You know ${m.parts.length === 2 ? 'both' : 'all ' + m.parts.length} parts already!</p>` : '');
  }
  if (m.clue){
    const [zh, py, en] = m.clue;
    return `<div class="madestage clue nopic">${col(w, d.py, d.en.split(',')[0], 'mword big')}${op('◂')}${col(zh, py, en, 'mpart')}</div>`
      + `<p class="mwhy">${zh} ${esc(m.why)}</p>${links}`;
  }
  return `<div class="madestage drawn"><div class="mcol mdrawn"><div class="mcpic" aria-hidden="true">${PICTURES[w] ? picHTML(w) : ''}</div></div><div class="mcol mop" aria-hidden="true"><span class="mchz">▸</span></div>${col(w, d.py, d.en.split(',')[0], 'mword big')}</div>`
    + `<p class="mwhy">${esc(m.why)}</p>${links}`;
}
// Watching a word made of parts come together (decided 24 October 2026): the parts come in one by one, with + between
// them; a part you know from another word lifts out of it; then each flies into the word, whose picture and meaning come
// last. Playing: the stage has anim, and each thing shows as it gets in. Stopping shows it all at once.
function madeAnim(stage){
  const parts = [...stage.querySelectorAll('.mpart')], ops = [...stage.querySelectorAll('.mop')], word = stage.querySelector('.mword');
  let timers = [], playing = false;
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; stage.querySelectorAll('.mfly').forEach(f => f.remove()); };
  const fly = (p, i) => {   // a copy of the part's character, from its column into the word
    const src = p.querySelector('.mpartch') || p.querySelector('.mchz'), dst = word.querySelector(`.mch[data-i="${i}"]`);
    const land = () => dst.classList.add('in');
    const sr = src.getBoundingClientRect(), dr = dst.getBoundingClientRect(), base = stage.getBoundingClientRect();
    if (!sr.width || !document.body.animate) return land();
    const f = document.createElement('span'), size = parseFloat(getComputedStyle(src).fontSize);
    f.className = 'mfly'; f.textContent = src.textContent; f.style.fontSize = size + 'px';
    f.style.left = (sr.left - base.left) + 'px'; f.style.top = (sr.top - base.top) + 'px';
    stage.append(f);
    const k = parseFloat(getComputedStyle(dst).fontSize) / size, dx = dr.left - sr.left, dy = dr.top - sr.top;
    f.animate([{transform:'none'}, {transform:`translate(${dx * .5}px, ${dy * .5 - 22}px) scale(${(1 + k) / 2})`}, {transform:`translate(${dx}px, ${dy}px) scale(${k})`}],
      {duration:650, easing:'ease-in-out', fill:'forwards'}).onfinish = () => { f.remove(); land(); };
  };
  return {
    playing: () => playing,
    play(){
      stop(); playing = true;
      stage.classList.add('anim');
      ['.in', '.lifted'].forEach(c => stage.querySelectorAll(c).forEach(x => x.classList.remove('in', 'lifted')));
      let t = 150;
      parts.forEach((p, i) => {
        at(t, () => { p.classList.add('in'); if (i) ops[i - 1].classList.add('in'); }); t += 350;
        if (p.classList.contains('from')){ at(t + 300, () => p.classList.add('lifted')); t += 900; }   // out of the word you know
      });
      at(t, () => ops[ops.length - 1].classList.add('in')); t += 300;   // =
      parts.forEach((p, i) => { at(t, () => fly(p, i)); t += 300; });
      at(t += 400, () => word.classList.add('in'));
      at(t + 500, () => this.finish());
    },
    finish(){ stop(); playing = false; stage.classList.remove('anim'); stage.querySelectorAll('.from').forEach(p => p.classList.add('lifted')); }
  };
}
// The card: Back (B) goes back to the word's card; done is A's (Got it, for a new word; OK, seen again), or none, when
// Back is A's too (from a word's page). A word made of parts comes together as you watch (Watch again plays it again);
// A while it's moving shows the end at once, and a moment later it's Got it.
function madeCard(w, back, done, doneLabel){
  const parts = !!MADE[w].parts;
  openCard(`<p class="label">How <span class="mhzlabel">${w}</span> is made</p>${madeStage(w)}
    <div class="actions"><button class="btn${done ? '' : ' primary'}" data-a="back" data-b>◂ Back</button>${parts ? '<button class="btn" data-a="again">↻ Watch again</button>' : ''}${done ? `<button class="btn primary" data-a="ok">${doneLabel}</button>` : ''}</div>`);
  const anim = parts ? madeAnim(sheet.querySelector('.madestage')) : null;
  if (anim && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) anim.play();
  on('[data-a=back]', () => { if (anim) anim.finish(); back(); });
  on('[data-a=again]', () => anim.play());
  if (done) on('[data-a=ok]', () => { if (anim && anim.playing()){ anim.finish(); shown(); return; } done(); });
}
// A name you can read now, such as your home's on the sign (says: its Chinese and English; m: how it's made, with its
// title, parts and what they add up to). A name isn't a word to learn, so nothing is caught. Its characters are tiles to
// find out about (decided 24 October 2026: the box was crowded): each with a ? until you tap it, or press A (Next part,
// left to right), when the box under it shows its picture and English: a part that's no word, such as 果, has the picture
// of a word you know with it (fruit, as in 水果). The next to find pulses, its box saying Tap 花 ▲. Once you've found them
// all, what they add up to, and A is OK.
function nameCard(says, m){
  return new Promise(res => {
    const zh = says.zh, seen = new Set();
    const parts = m.parts.map(([c, py, en]) => {
      const from = PICTURES[c] && WORDS[c] ? null : (PART_IN[c] || []).find(o => knownWord(o, zh) && PICTURES[o]);
      return {c, py, en, from, pic:from ? picHTML(from) : partPic(c)};
    });
    SFX.word();
    openCard(`<div class="namehead"><p class="label">${esc(m.title)}</p><span class="namechip">${info(zh)[0]} · ${esc(says.en)}</span></div>
      <div class="namerow"><div class="pic" aria-hidden="true">${picHTML(zh)}</div><div class="ntiles">${parts.map((p, i) =>
        `<div class="ncol"><button class="ntile" data-i="${i}" aria-label="What does ${p.c} mean?"><span class="npy">${p.py}</span> <span class="nhz">${p.c}</span> <span class="nmark" aria-hidden="true"></span></button><div class="nbox"></div></div>`).join('')}</div></div>
      <p class="nsum"></p>
      <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button><button class="btn primary" data-a="ok"></button></div>`);
    const tiles = [...sheet.querySelectorAll('.ntile')], boxes = [...sheet.querySelectorAll('.nbox')], ok = sheet.querySelector('[data-a=ok]');
    const show = () => {
      const next = parts.findIndex((p, i) => !seen.has(i));
      parts.forEach((p, i) => {
        const found = seen.has(i);
        tiles[i].classList.toggle('found', found); tiles[i].classList.toggle('next', i === next);
        tiles[i].querySelector('.nmark').textContent = found ? '✓' : '?';
        boxes[i].classList.toggle('found', found);
        boxes[i].innerHTML = found ? `<div class="npic" aria-hidden="true">${p.pic}</div><span class="nen">${esc(p.en)}${p.from ? `,</span> <span class="nfrom">as in ${p.from}</span>` : '</span>'}`
          : i === next ? `<span class="ntap">▲ Tap <span class="nhzs">${p.c}</span></span>` : '<span class="nq" aria-hidden="true">?</span>';
      });
      const all = next < 0, sum = sheet.querySelector('.nsum');
      sum.classList.toggle('all', all);
      sum.textContent = all ? `= ${m.why}` : 'Each character means something. Tap one, or press A.';
      ok.textContent = all ? 'OK' : 'Next part';
      return next;
    };
    const find = i => { if (seen.has(i)) return; seen.add(i); if (show() < 0) shown(); };   // (all found: A is OK, a moment later)
    show();
    say(zh);
    tiles.forEach((t, i) => t.onclick = () => find(i));
    on('[data-a=say]', () => say(zh));
    ok.onclick = () => { const next = parts.findIndex((p, i) => !seen.has(i)); if (next >= 0) return find(next); closeCard(); res(); };
  });
}
// A word's card. It says the word straight away when you discover it yourself; in a conversation
// (opts.quiet) it doesn't, so the conversation isn't broken up by the word again: 🔊 Hear it is there. How the word is made
// goes with its English (madeCard): the first time, its own card comes next (How it's made ▸, then Got it); seen again,
// the English button shows the English, then becomes How it's made.
function showNotice(w, opts = {}){
  return new Promise(res => {
    const d = WORDS[w], isNew = lvl(w) === 0, made = !!MADE[w];
    if (isNew) SFX.word(); else SFX.blip();
    const done = () => { closeCard(); if (isNew){ setSeen(w); toast(`${wz(w)} added to your Word Scroll`); } res(); };
    let en = isNew;   // the English shows (seen again: once you've pressed English)
    const front = () => {   // the word's card: a new word with how it's made goes on to it (How it's made ▸), not Got it
      const howFirst = isNew && made, howBtn = '<button class="btn" data-a="made">How it’s made</button>';
      openCard(`${isNew ? '<p class="label">⭐ New word to learn</p>' : `<p class="label">Word ${pips(w)}</p>`}

        <div class="word side"><div class="pic" aria-hidden="true">${picHTML(w)}</div><div class="big">${w}</div><div class="py">${d.py}</div>
        <div class="en" ${en ? '' : 'hidden'}>${esc(d.en)}</div>${opts.note ? `<p class="note">${esc(opts.note)}</p>` : ''}</div>
        <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button>${howFirst ? '<button class="btn primary" data-a="made">How it’s made ▸</button>'
          : `${isNew ? '' : en ? (made ? howBtn : '') : '<button class="btn" data-a="en">English</button>'}<button class="btn primary" data-a="ok">${isNew ? 'Got it' : 'OK'}</button>`}</div>`);
      on('[data-a=say]', () => say(w));
      on('[data-a=en]', e => {   // the English, and then how it's made from the same place
        en = true; sheet.querySelector('.word .en').hidden = false;
        const b = e.currentTarget; if (made){ b.setAttribute('data-a', 'made'); b.textContent = 'How it’s made'; b.onclick = how; } else b.remove();
        const p = sheet.querySelector('.primary'); if (p) p.focus({preventScroll:true});
      });
      on('[data-a=made]', how);
      on('[data-a=ok]', done);
    };
    const how = () => madeCard(w, front, done, isNew ? 'Got it' : 'OK');
    front();
    if (!opts.quiet) say(w);
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
