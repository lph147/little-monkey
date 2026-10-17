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
function openCard(html){
  sheet.innerHTML = money(html); modal.hidden = false; sheet.scrollTop = 0;
  if (markGloss.length){ markGloss.forEach(t => S.gloss[t] = 1); markGloss = []; save(); }
  held = null; queued = null; document.querySelectorAll('.held').forEach(b => b.classList.remove('held'));
  // A always starts on the card's main button. If a card has none (a quiz waiting for an answer), A does nothing until you tap.
  const f = [...sheet.querySelectorAll('.primary')].find(x => !x.hidden && !x.disabled);
  if (f) f.focus({preventScroll:true}); else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
}
const NAV_SEL = '.actions button, .menu button';
function navItems(){ return [...sheet.querySelectorAll(NAV_SEL)].filter(b => !b.disabled && !b.hidden && b.offsetParent !== null); }
sheet.addEventListener('focusin', e => { sheet.querySelectorAll('.navsel').forEach(x => x.classList.remove('navsel')); if (e.target.matches(NAV_SEL)) e.target.classList.add('navsel'); });
function navFocus(d){
  const tabs = [...sheet.querySelectorAll('.scrolltabs .tab')];
  if (tabs.length && (d === 'left' || d === 'right')){   // left and right switch the Word Scroll's tabs
    const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    tabs[(i + (d === 'left' ? -1 : 1) + tabs.length) % tabs.length].click();
    return;
  }
  if (!sheet.querySelector('.menu')) return;          // otherwise the D-pad only moves through menus; on cards A is always the main button
  const items = navItems(); if (!items.length) return;
  const cur = items.indexOf(document.activeElement);
  const go = i => { items[i].focus({preventScroll:false}); SFX.turn(); };
  if (cur < 0) return go(Math.max(0, items.findIndex(b => b.classList.contains('primary'))));
  const inOrder = () => go((cur + ((d === 'left' || d === 'up') ? -1 : 1) + items.length) % items.length);
  if (!items.some(b => b.getBoundingClientRect().width)) return inOrder();   // no layout to go by: step through in order
  const next = nearestIn(d, items[cur], items);
  if (next) return go(items.indexOf(next));
  // Nothing that way: left and right step through in reading order (to the next row, in a grid); up
  // and down stay put at the top and bottom.
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
  if (f.classList.contains('opt')) return 'Choose';
  if (f.classList.contains('card') || f.classList.contains('chip')) return 'Hear';
  return f.textContent.replace(/[^\p{L}\p{N}' ]/gu, '').trim().slice(0, 12);
}
function closeCard(){ modal.hidden = true; sheet.innerHTML = ''; }
const on = (sel, fn) => { const el = sheet.querySelector(sel); if (el) el.onclick = fn; };

/* ================= SPEECH BOX (what characters say, over the bottom of the map) ================= */
const talkBox = $('#talk');
let talkNext = null;          // moves on to what comes after the line, while the speech box is showing one
let talkMove = null;          // moves between reply choices with the D-pad, while the box shows them
const TAP_TIP_LINES = 5;      // "Tap any word" shows under your first few lines, then only a word's meaning when you tap it
function showDialog(who, line, opts = {}){
  return new Promise(res => {
    const key = line.t.join(''), firstTime = !S.lines[key];
    S.lines[key] = 1; hear(line.t); save();
    const tip = Object.keys(S.lines).length <= TAP_TIP_LINES, again = !talkBox.hidden;   // again: the box is still up from the last line
    talkBox.innerHTML = `<div class="talkhead">${who}<span class="spacer"></span><button class="tbtn" data-a="say" aria-label="Hear it again">🔊</button>${firstTime ? '' : '<button class="tbtn" data-a="en">English</button>'}</div>
      ${lineHTML(line.t, opts.teach)}<div class="sentence-en" ${firstTime ? '' : 'hidden'}>${esc(line.en)}</div>${opts.hint ? `<p class="small hintline">${esc(opts.hint)}</p>` : ''}
      <div class="talkfoot${tip ? ' tip' : ''}"><div class="gloss">${tip ? 'Tap any word to see what it means.' : ''}</div><button class="btn primary next" data-a="ok" data-label="${esc(opts.ok || 'Next')}">${opts.ok ? esc(opts.ok) + ' ' : ''}▼</button></div>`;
    talkBox.classList.toggle('again', again);
    talkBox.hidden = false; talkBox.scrollTop = 0;
    $('#saybox').hidden = true;   // the box covers the message spot
    held = null; queued = null; document.querySelectorAll('.held').forEach(b => b.classList.remove('held'));
    bindTokens(talkBox);
    const text = line.t.join(''), q = sel => talkBox.querySelector(sel);
    say(text);
    q('[data-a=say]').onclick = () => say(text);
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
  return new Promise(res => {
    talkBox.innerHTML = `<p class="narration">${money(esc(text))}</p>
      <div class="talkfoot"><span class="spacer"></span><button class="btn primary next" data-a="ok" data-label="Next">▼</button></div>`;
    talkBox.classList.toggle('again', !talkBox.hidden);
    talkBox.hidden = false; talkBox.scrollTop = 0;
    $('#saybox').hidden = true;
    held = null; queued = null;
    const next = () => { talkNext = null; talkMove = null; SFX.blip(); closeTalk(); res(); };
    talkBox.querySelector('[data-a=ok]').onclick = next;
    talkNext = next;
  });
}
// Your reply: the phrases you could say, each with pinyin, and English unless it's switched off in
// Settings. Tapping one says it; on a keyboard or the D-pad, move between them and press A. Gives the
// phrase you chose. The box stays up for your line, which comes next. With only one phrase to say (your
// very first reply), it isn't a choice: you're asked to say it.
function chooseReply(who, choices){
  return new Promise(res => {
    let sel = 0;
    talkBox.innerHTML = `<div class="talkhead">${who}</div><p class="label">${choices.length > 1 ? 'Your reply' : 'Now you say it'}</p>
      <div class="replies">${choices.map((p, i) => `<button class="reply" data-i="${i}"><span class="rzh">${p}</span><span class="rpy">${WORDS[p].py}</span>${S.replyEn ? `<span class="ren">${esc(WORDS[p].en)}</span>` : ''}</button>`).join('')}</div>`;
    talkBox.classList.toggle('again', !talkBox.hidden);
    talkBox.hidden = false; talkBox.scrollTop = 0;
    $('#saybox').hidden = true;
    held = null; queued = null;
    const btns = [...talkBox.querySelectorAll('.reply')];
    const mark = () => btns.forEach((b, i) => b.classList.toggle('sel', i === sel));
    const pick = i => { talkNext = null; talkMove = null; SFX.blip(); res(choices[i]); };
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
