// Small helpers used everywhere, and the message box at the bottom of the game screen.

/* ================= HELPERS ================= */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const enOf = hz => (WORDS[hz] || {en: (GLOSS[hz] || ['', ''])[1]}).en;
// A word in English text: its Chinese, then what it means, the first of its meanings (石头 (stone), not 石头 (stone, rock)),
// or en, the English that fits the sentence (three small 石头 (stones)).
const wz = (hz, en) => `${hz} (${en || enOf(hz).split(',')[0]})`;
const cap = s => s && s[0].toUpperCase() + s.slice(1);   // (a sentence's first letter)
// Fills in content text: a counter such as '{animals}' becomes its number, a word such as '{水}'
// becomes '水 (water)' (and '{石头|stones}' '石头 (stones)', with the English that fits the sentence), '{holding:hungry}'
// the word for what you're holding for that request, '{wanted:hungry}' the word for what a fussy request wants now, and
// '{left:meadowWords}' what a counter of words you know still waits for, such as 'the river and a bird' (stillToFind,
// js/world.js).
// With raw, words are left as they are (for task ids). With plain (your tasks), a word you haven't caught
// yet is just its English: 'Find the apple', not 'Find the 苹果 (apple)'.
const fill = (text, raw, plain) => String(text).replace(/\{([^}|]+)(?:\|([^}]+))?\}/g, (m, k, en) => {
  if (AREA.counters[k]) return counter(k);
  if (k.startsWith('left:')) return stillToFind(k.slice(5));
  if (k.startsWith('lessons:')) return lessonsText(k.slice(8));   // the lessons at school ready now, or waiting (js/timetable.js)
  const w = k.startsWith('holding:') ? here().holding[k.slice(8)] : k.startsWith('wanted:') ? (here().wanted || {})[k.slice(7)] : k;
  return raw ? w : plain && lvl(w) < 1 ? en || enOf(w).split(',')[0] : wz(w, en);
});
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function rnd(x, y, k = 0){ let h = Math.imul(x|0, 374761393) ^ Math.imul(y|0, 668265263) ^ Math.imul(k|0, 1442695041); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function hex(c){ const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
// Two colours mixed, k of the way from a to b. Each mix is remembered, as the same few are made again and again (a cliff's,
// a pixel at a time: decided 6 November 2026, to draw a place quicker as you walk into it), up to a few thousand at once.
const MIX_MEMO = new Map();
function mix(a, b, k){
  const key = a + '|' + b + '|' + k; let c = MIX_MEMO.get(key);
  if (c === undefined){
    const A = hex(a), B = hex(b); c = '#' + A.map((v,i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2,'0')).join('');
    if (MIX_MEMO.size >= 4096) MIX_MEMO.clear();
    MIX_MEMO.set(key, c);
  }
  return c;
}
// Names that stand out in English text (decided 9 November 2026, the four ideas plan, as in Dredge): a Chinese word
// (as fill writes one you know, 水 (water), or on its own in a note, 两) green, as in sentences; people gold; places
// blue; each bold too, so they stand out without the colour. Only names, found by the game's own lists of who's who
// (NAMES: the hungry monkey, the farmer, the master) and where's where (PLACES: the pine wood, the riverside), longest
// first, so no text needs rewriting: "the village" or "the troop" stay plain. In messages, notes, tasks, the checklist,
// part cards and Story so far, never in a Chinese line's English, which is a translation. Gives HTML (the rest of the
// text escaped): spans hl-zh (with data-say, a word to tap and hear where the page lets you: the Tasks page), hl-who
// and hl-where.
const HL_NOT_NAMES = new Set(['monkey', 'sign', 'cart', 'little monkey (you)']);   // (anyone, or no one in particular)
const hlPlural = s => /man$/.test(s) ? s.slice(0, -3) + 'men' : /child$/.test(s) ? s + 'ren' : /[^aeiou]y$/.test(s) ? s.slice(0, -1) + 'ies' : /(s|x|ch|sh)$/.test(s) ? s + 'es' : s + 's';
let hlNamesFor = null;
function hlNames(){
  if (hlNamesFor && hlNamesFor.area === AREA) return hlNamesFor;
  const plain = s => s.toLowerCase().replace(/^(the|an?) /, ''), who = new Set(), where = new Set();
  for (const n of Object.values(NAMES)) if (n && n.en && !HL_NOT_NAMES.has(n.en.toLowerCase())){ const s = plain(n.en); who.add(s); who.add(hlPlural(s)); }
  for (const p of Object.values(PLACES)) if (p.name && p.name.en) where.add(plain(p.name.en));
  for (const a of AREAS) if (a.number <= AREA.number && /^(\p{Lu}\S*\s?)+$/u.test(a.name.en)) where.add(plain(a.name.en));   // (an area whose English is a name, Flower Fruit Mountain: not Across the sea)
  const re = set => new RegExp(`(?<![\\p{L}])(?:${[...set].sort((a, b) => b.length - a.length).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\p{L}])`, 'giu');
  return hlNamesFor = {area:AREA, who:re(who), where:re(where)};
}
const HL_ZH = /(\p{Script=Han}+(?:[，、]?\p{Script=Han}+)*)( \([^()]*\))?/gu;   // (a Chinese word, and its English in brackets after it, which isn't looked at for names)
function hlText(text){
  text = String(text ?? '');
  if (!text) return '';
  const {who, where} = hlNames(), marks = [];   // each [start, end, class, word, end of what it takes up]
  for (const m of text.matchAll(HL_ZH)) marks.push([m.index, m.index + m[1].length, 'hl-zh', m[1], m.index + m[0].length]);
  const found = [...[...text.matchAll(who)].map(m => [m, 'hl-who']), ...[...text.matchAll(where)].map(m => [m, 'hl-where'])]
    .sort((a, b) => b[0][0].length - a[0][0].length || a[0].index - b[0].index);   // (the longest first: the master’s room is a place, not the master)
  for (const [m, cls] of found){
    const s = m.index, e = s + m[0].length;
    if (!marks.some(([a, , , , b]) => s < b && e > a)) marks.push([s, e, cls, null, e]);
  }
  let out = '', at = 0;
  for (const [s, e, cls, w] of marks.sort((a, b) => a[0] - b[0])){
    out += esc(text.slice(at, s)) + `<span class="${cls}"${w && WORDS[w] ? ` data-say="${esc(w)}"` : ''}>${esc(text.slice(s, e))}</span>`;
    at = e;
  }
  return out + esc(text.slice(at));
}
// Tapping a Chinese word in English text, where a page lets you (the Tasks page, the checklist, Story so far), says it.
function bindSay(root){
  root.querySelectorAll('.hl-zh[data-say]').forEach(el => el.onclick = e => { if (e && e.stopPropagation) e.stopPropagation(); say(el.dataset.say); });
}
// A message, in a box at the bottom of the game screen, for a few seconds (msgAt: when the one showing came up).
let msgT, msgAt = -1e9;
function toast(msg){
  const el = $('#saybox'); let top = messageTop(); el.innerHTML = pixelIcons(hlText(msg)); el.hidden = false; el.onclick = closeMessage; msgAt = performance.now();
  el.classList.toggle('top', top);   // where the speech box was (messageTop(), js/draw.js)
  if (!top && underMessage(+el.offsetHeight || 0)){ top = true; el.classList.add('top'); }   // or at the top if at the bottom it would cover you, or the square you face (fishing off the pier, it hid you and your float)
  if (top) $('#placeName').hidden = true;
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(msgT); msgT = setTimeout(closeMessage, Math.max(3200, msg.length * 70));
}
function closeMessage(){ $('#saybox').hidden = true; updateHUD(); }   // (tapped, B, A just after it came up, or in time: a new task waiting can be announced then)
function clearMessage(){ const el = $('#saybox'); if (el) el.hidden = true; }   // a message cleared to make way for what comes next, such as a question (a new task waiting is announced once it's all over, never in the middle)
