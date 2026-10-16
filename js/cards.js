// Pop-up cards: sentences with pinyin and tappable words, new-word cards and yes/no questions.

/* ================= TOKENS (English on first sight, tap after) ================= */
let markGloss = [];
function info(t){ if (WORDS[t]) return [WORDS[t].py, WORDS[t].en]; if (GLOSS[t]) return GLOSS[t]; return ['','']; }
let teachWord = null;
function tokHTML(t){
  if (PUNCT.has(t)) return `<span class="punct">${t}</span>`;
  const [py] = info(t);
  const cls = t === teachWord ? 'learn teach' : (WORDS[t] && lvl(t) >= 1 ? 'learn' : 'listen');
  return `<button class="tok ${cls}" data-t="${esc(t)}"><ruby>${esc(t)}<rt class="${S.pinyin ? '' : 'hid'}">${esc(py)}</rt></ruby></button>`;
}
const lineHTML = (toks, teach) => { teachWord = teach || null; const h = `<div class="line">${toks.map(tokHTML).join('')}</div>`; teachWord = null; return h; };
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
  sheet.innerHTML = html; modal.hidden = false; sheet.scrollTop = 0;
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
  if (!sheet.querySelector('.menu')) return;          // the D-pad only moves through menus; on cards A is always the main button
  const items = navItems(); if (!items.length) return;
  let i = items.indexOf(document.activeElement);
  if (i < 0) i = Math.max(0, items.findIndex(b => b.classList.contains('primary')));
  else i = (i + ((d === 'left' || d === 'up') ? -1 : 1) + items.length) % items.length;
  items[i].focus({preventScroll:false}); SFX.turn();
}
function btnLabel(f){
  if (!f) return '';
  if (f.dataset.label) return f.dataset.label;
  if (f.classList.contains('opt')) return 'Choose';
  if (f.classList.contains('tile')) return 'Pick';
  if (f.classList.contains('card') || f.classList.contains('chip')) return 'Hear';
  return f.textContent.replace(/[^\p{L}\p{N}' ]/gu, '').trim().slice(0, 12);
}
function closeCard(){ modal.hidden = true; sheet.innerHTML = ''; }
const on = (sel, fn) => { const el = sheet.querySelector(sel); if (el) el.onclick = fn; };

function showDialog(who, line, opts = {}){
  return new Promise(res => {
    const key = line.t.join(''), firstTime = !S.lines[key];
    S.lines[key] = 1; hear(line.t); save();
    openCard(`<div class="who" aria-hidden="true">${who}</div>${lineHTML(line.t, opts.teach)}<div class="sentence-en" ${firstTime ? '' : 'hidden'}>${esc(line.en)}</div><div class="gloss">Tap any word to see what it means.</div>${opts.hint ? `<p class="small">${esc(opts.hint)}</p>` : ''}
      <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button>${firstTime ? '' : '<button class="btn" data-a="en">English</button>'}<button class="btn primary" data-a="ok">${opts.ok || 'OK'}</button></div>`);
    bindTokens(sheet);
    const text = line.t.join('');
    say(text);
    on('[data-a=say]', () => say(text));
    on('[data-a=en]', e => { sheet.querySelector('.sentence-en').hidden = false; e.currentTarget.remove(); const p = sheet.querySelector('.primary'); if (p) p.focus(); });
    on('[data-a=ok]', () => { SFX.blip(); closeCard(); res(); });
  });
}
function showNotice(w, opts = {}){
  return new Promise(res => {
    const d = WORDS[w], isNew = lvl(w) === 0;
    if (isNew) SFX.word(); else SFX.blip();
    openCard(`${isNew ? '<p class="label">⭐ New word to learn</p>' : `<p class="label">Word ${pips(w)}</p>`}

      <div class="word"><div class="pic" aria-hidden="true">${picHTML(w)}</div><div class="big">${w}</div><div class="py">${d.py}</div>
      <div class="en" ${isNew ? '' : 'hidden'}>${esc(d.en)}</div>${opts.note ? `<p class="note">${esc(opts.note)}</p>` : ''}</div>
      <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button>${isNew ? '' : '<button class="btn" data-a="en">English</button>'}<button class="btn primary" data-a="ok">${isNew ? 'Got it' : 'OK'}</button></div>`);
    say(w);
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
