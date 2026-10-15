// Small helpers used everywhere, and the message box at the bottom of the game screen.

/* ================= HELPERS ================= */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const wz = hz => `${hz} (${(WORDS[hz] || {en: (GLOSS[hz] || ['', ''])[1]}).en})`;
// Fills in content text: a counter such as '{animals}' becomes its number, a word such as '{水}'
// becomes '水 (water)', and '{holding:hungry}' the word for what you're holding for that request.
// With raw, words are left as they are (for task ids).
const fill = (text, raw) => String(text).replace(/\{([^}]+)\}/g, (m, k) => {
  if (AREA.counters[k]) return counter(k);
  const w = k.startsWith('holding:') ? here().holding[k.slice(8)] : k;
  return raw ? w : wz(w);
});
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function rnd(x, y, k = 0){ let h = Math.imul(x|0, 374761393) ^ Math.imul(y|0, 668265263) ^ Math.imul(k|0, 1442695041); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function hex(c){ const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function mix(a, b, k){ const A = hex(a), B = hex(b); return '#' + A.map((v,i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2,'0')).join(''); }
let msgT;
function toast(msg){
  const el = $('#saybox'); el.textContent = msg; el.hidden = false; el.onclick = () => { el.hidden = true; };
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(msgT); msgT = setTimeout(() => el.hidden = true, Math.max(3200, msg.length * 70));
}
