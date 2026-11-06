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
// A message, in a box at the bottom of the game screen, for a few seconds (msgAt: when the one showing came up).
let msgT, msgAt = -1e9;
function toast(msg){
  const el = $('#saybox'); let top = messageTop(); el.innerHTML = pixelIcons(esc(msg)); el.hidden = false; el.onclick = closeMessage; msgAt = performance.now();
  el.classList.toggle('top', top);   // where the speech box was (messageTop(), js/draw.js)
  if (!top && underMessage(+el.offsetHeight || 0)){ top = true; el.classList.add('top'); }   // or at the top if at the bottom it would cover you, or the square you face (fishing off the pier, it hid you and your float)
  if (top) $('#placeName').hidden = true;
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(msgT); msgT = setTimeout(closeMessage, Math.max(3200, msg.length * 70));
}
function closeMessage(){ $('#saybox').hidden = true; updateHUD(); }   // (tapped, B, A just after it came up, or in time: a new task waiting can be announced then)
function clearMessage(){ const el = $('#saybox'); if (el) el.hidden = true; }   // a message cleared to make way for what comes next, such as a question (a new task waiting is announced once it's all over, never in the middle)
