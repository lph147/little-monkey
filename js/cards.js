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
    if (g) g.innerHTML = `<b>${esc(t)}</b> ${esc(py)} · ${esc(en)}${b.classList.contains('listen') ? ' <span class="small">(just listen)</span>' : ''}`;
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
function tooSoon(at){   // at: when the press was made, if known (not in the tests or the screens gallery)
  if (at === undefined) return false;
  const now = performance.now();
  if (!(at > now - 5000 && at <= now + 50)) at = now;   // (a time that can't be right, from an odd browser: as if pressed now, so A never stops working)
  return at < shownAt + READ_MS;
}
function openCard(html){
  sheet.innerHTML = pixelIcons(html); modal.hidden = false; sheet.scrollTop = 0; shown();
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
  if (!sheet.querySelector(NAVIGABLE)) return;        // otherwise the D-pad only moves through menus (and cards whose buttons are a choice, data-nav); on other cards A is always the main button
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
function btnLabel(f){
  if (!f) return '';
  if (f.dataset.label) return f.dataset.label;
  if (f.classList.contains('opt') || f.classList.contains('mw') || f.classList.contains('mp')) return 'Choose';
  if (f.classList.contains('sayBig')) return 'Hear it';
  if (f.classList.contains('card') || f.classList.contains('chip')) return 'Hear';
  return f.textContent.replace(/[^\p{L}\p{N}' ]/gu, '').trim().slice(0, 12);
}
function closeCard(){ modal.hidden = true; sheet.innerHTML = ''; }
const on = (sel, fn) => { const el = sheet.querySelector(sel); if (el) el.onclick = fn; };

/* ================= SPEECH BOX (what characters say, over the bottom of the map) ================= */
const talkBox = $('#talk');
let talkNext = null;          // moves on to what comes after the line, while the speech box is showing one
let talkMove = null;          // moves between reply choices with the D-pad, while the box shows them
let lastLine = null;          // the line someone else said last ({id, line}), until the story moves on: what a reply answers
const TAP_TIP_LINES = 5;      // "Tap any word" shows under your first few lines, then only a word's meaning when you tap it
function showDialog(who, line, opts = {}){
  return new Promise(res => {
    const key = line.t.join(''), firstTime = !S.lines[key];
    S.lines[key] = 1; hear(line.t); save();
    const tip = Object.keys(S.lines).length <= TAP_TIP_LINES, again = !talkBox.hidden;   // again: the box is still up from the last line
    talkBox.innerHTML = pixelIcons(`<div class="talkhead">${who}<span class="spacer"></span><button class="tbtn" data-a="say" aria-label="Hear it again">🔊</button>${firstTime ? '' : '<button class="tbtn" data-a="en">English</button>'}</div>
      ${lineHTML(line.t, opts.teach)}<div class="sentence-en" ${firstTime ? '' : 'hidden'}>${esc(line.en)}</div>${opts.hint ? `<p class="small hintline">${esc(opts.hint)}</p>` : ''}
      <div class="talkfoot${tip ? ' tip' : ''}"><div class="gloss">${tip ? 'Tap any word to see what it means.' : ''}</div><button class="btn primary next" data-a="ok" data-label="${esc(opts.ok || 'Next')}">${opts.ok ? esc(opts.ok) + ' ' : ''}▼</button></div>`);
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
// the old monkey does for baby monkeys. A moves on, so the next line can't cover it.
function showNarration(text){
  lastLine = null;   // (the story has moved on)
  return new Promise(res => {
    talkBox.innerHTML = `<p class="narration">${pixelIcons(esc(text))}</p>
      <div class="talkfoot"><span class="spacer"></span><button class="btn primary next" data-a="ok" data-label="Next">▼</button></div>`;
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
// A word's card. It says the word straight away when you discover it yourself; in a conversation
// (opts.quiet) it doesn't, so the conversation isn't broken up by the word again: 🔊 Hear it is there.
function showNotice(w, opts = {}){
  return new Promise(res => {
    const d = WORDS[w], isNew = lvl(w) === 0;
    if (isNew) SFX.word(); else SFX.blip();
    openCard(`${isNew ? '<p class="label">⭐ New word to learn</p>' : `<p class="label">Word ${pips(w)}</p>`}

      <div class="word side"><div class="pic" aria-hidden="true">${picHTML(w)}</div><div class="big">${w}</div><div class="py">${d.py}</div>
      <div class="en" ${isNew ? '' : 'hidden'}>${esc(d.en)}</div>${opts.note ? `<p class="note">${esc(opts.note)}</p>` : ''}</div>
      <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button>${isNew ? '' : '<button class="btn" data-a="en">English</button>'}<button class="btn primary" data-a="ok">${isNew ? 'Got it' : 'OK'}</button></div>`);
    if (!opts.quiet) say(w);
    on('[data-a=say]', () => say(w));
    on('[data-a=en]', () => { sheet.querySelector('.word .en').hidden = false; });
    on('[data-a=ok]', () => { closeCard(); if (isNew){ setSeen(w); toast(`${wz(w)} added to your Word Scroll`); } res(); });
  });
}
function confirmBox(who, html, yes, no){
  return new Promise(res => {
    openCard(`<div class="who" aria-hidden="true">${who}</div><p>${html}</p><div class="actions"><button class="btn" data-a="no" data-b>${no}</button><button class="btn primary" data-a="yes">${yes}</button></div>`);
    on('[data-a=no]', () => { closeCard(); res(false); });
    on('[data-a=yes]', () => { closeCard(); res(true); });
  });
}
