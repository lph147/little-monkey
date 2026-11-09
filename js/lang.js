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
