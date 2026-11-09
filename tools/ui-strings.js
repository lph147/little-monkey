// The game's own words (Both ways, decided 9 November 2026): every piece of text the game shows in your own language,
// as written in English, with where it's from. Learning English, each is shown in Chinese, looked up by its English in
// ZH_UI (content/chinese-ui.js): tests/chinese-ui.test.js checks every one has its Chinese, and none is left over, and
// the playthrough learning English (tests/playthrough.test.js) checks nothing else on the screen is in English.
//
// What it finds:
// - the engine's own text (js/): what's given to ui() as written ('Not now', or 'Lesson {n}' with its {n} filled in as
//   it's shown), both sides of a ? :, and what's given as written to the things that say something in your own words
//   (toast, showNarration, confirmBox's question and buttons, infoBox, fill), and the engine's tables of text (MASTERY,
//   PRACTICE, FOE_SAYS, TIPS, BAG_TABS, TOOL_DOES, VOICE_SHORT, VOICE_HELP, AB_WORDS, and the page's own, PAGE_TEXT and
//   PAGE_LABELS);
// - the content's text: each area's (a task, a message, a note, a label…), every phrase's use, cue and situation in the
//   word bank, and the word bank's categories. Not what's said in Chinese and its English (each line's zh and en, a
//   sentence and sentenceEn), names ({zh, py, en}: shown in both), ids, maps, or the story's conditions.
'use strict';
const fs = require('fs');
const path = require('path');
const {loadGame, ROOT} = require('../tests/fake-browser');

/* ---------- the engine ---------- */
// The pieces of a JavaScript file: strings ('…', "…", `…` with whether it has ${}), names, and everything else, one
// character at a time; comments and regular expressions left out.
function tokens(src){
  const out = []; let i = 0;
  const prevSig = () => { for (let k = out.length - 1; k >= 0; k--) return out[k]; return null; };
  const regexCanStart = () => { const p = prevSig(); return !p || (p.type === 'punct' && !/[)\]}]/.test(p.v)) || (p.type === 'name' && /^(return|typeof|case|in|of|new|delete|void|throw|else|do)$/.test(p.v)); };
  while (i < src.length){
    const c = src[i];
    if (/\s/.test(c)){ i++; continue; }
    if (c === '/' && src[i + 1] === '/'){ while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*'){ i = src.indexOf('*/', i + 2) + 2; if (i < 2) break; continue; }
    if (c === '\'' || c === '"'){
      let j = i + 1, v = '';
      while (j < src.length && src[j] !== c){ if (src[j] === '\\'){ v += src[j + 1] === 'n' ? '\n' : src[j + 1]; j += 2; } else v += src[j++]; }
      out.push({type:'str', v, at:i}); i = j + 1; continue;
    }
    if (c === '`'){   // a template: its text, and whether it has ${…} (whose insides are read as code, and kept apart)
      let j = i + 1, v = '', subs = false, depth = 0;
      while (j < src.length){
        if (src[j] === '\\'){ v += src[j + 1]; j += 2; continue; }
        if (src[j] === '`') break;
        if (src[j] === '$' && src[j + 1] === '{'){   // skip to its matching }, minding strings and templates inside
          subs = true; j += 2; depth = 1;
          const inner = j;
          while (j < src.length && depth){
            const d = src[j];
            if (d === '\'' || d === '"'){ const q = d; j++; while (j < src.length && src[j] !== q){ if (src[j] === '\\') j++; j++; } j++; continue; }
            if (d === '`'){ let k = j + 1, dd = 0; while (k < src.length && !(src[k] === '`' && dd === 0)){ if (src[k] === '\\') k++; else if (src[k] === '$' && src[k + 1] === '{'){ dd++; k++; } else if (src[k] === '}' && dd) dd--; k++; } j = k + 1; continue; }
            if (d === '{') depth++; else if (d === '}') depth--;
            j++;
          }
          out.push({type:'sub', code:src.slice(inner, j - 1), at:inner});
          v += '\u0000'; continue;
        }
        v += src[j++];
      }
      out.push({type:'tpl', v, subs, at:i}); i = j + 1; continue;
    }
    if (c === '/' && regexCanStart()){   // a regular expression: skipped
      let j = i + 1, cls = false;
      while (j < src.length && (cls || src[j] !== '/')){ if (src[j] === '\\') j++; else if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; j++; }
      j++; while (/[a-z]/i.test(src[j] || '')) j++;
      out.push({type:'re', at:i}); i = j; continue;
    }
    if (/[A-Za-z_$]/.test(c)){ let j = i; while (/[\w$]/.test(src[j] || '')) j++; out.push({type:'name', v:src.slice(i, j), at:i}); i = j; continue; }
    if (/[0-9]/.test(c)){ let j = i; while (/[\w.]/.test(src[j] || '')) j++; out.push({type:'num', at:i}); i = j; continue; }
    const three = src.slice(i, i + 3), two = src.slice(i, i + 2);
    const op = ['===', '!=='].includes(three) ? three : ['==', '!=', '=>', '&&', '||', '??', '?.'].includes(two) ? two : c;
    out.push({type:'punct', v:op, at:i}); i += op.length;
  }
  return out;
}
// The calls whose text is in your own words, and which of their arguments (counting from 0) are.
const SAYS = {ui:[0], toast:[0], showNarration:[0], confirmBox:[1, 2, 3], infoBox:[1], fill:[0]};
function engineStrings(file){
  const src = fs.readFileSync(file, 'utf8'), all = [], found = [];
  const scan = (code, base) => { for (const t of tokens(code)){ if (t.type === 'sub'){ scan(t.code, base + t.at); continue; } all.push({...t, at:base + t.at}); } };
  scan(src, 0);
  const line = at => src.slice(0, at).split('\n').length;
  for (let k = 0; k < all.length; k++){
    const t = all[k];
    if (t.type !== 'name' || !SAYS[t.v] || !all[k + 1] || all[k + 1].v !== '(') continue;
    const before = all[k - 1];
    if (before && (before.v === 'function' || before.v === '.' )) continue;   // (its definition, or a method of something else)
    // its arguments: from ( to its ), split at commas outside brackets
    let depth = 0, arg = 0, j = k + 1;
    for (; j < all.length; j++){
      const u = all[j];
      if (u.type === 'punct' && u.v === '(' && depth >= 1 && all[j - 1].type === 'name'){   // (a call inside it: its own, read on its own if it's one of these)
        let d = 0; for (; j < all.length; j++){ if (all[j].v === '(') d++; else if (all[j].v === ')' && !--d) break; }
        continue;
      }
      if (u.type === 'punct' && /[([{]/.test(u.v)){ depth++; continue; }
      if (u.type === 'punct' && /[)\]}]/.test(u.v)){ depth--; if (!depth) break; continue; }
      if (u.type === 'punct' && u.v === ',' && depth === 1){ arg++; continue; }
      if (depth < 1 || !SAYS[t.v].includes(arg)) continue;
      const text = u.type === 'str' ? u.v : u.type === 'tpl' && !u.subs ? u.v : null;
      if (text === null || !/[A-Za-z]/.test(text)) continue;
      const prev = all[j - 1], next = all[j + 1];
      if (prev && /^[!=]==?$/.test(prev.v) || next && /^[!=]==?$/.test(next.v)) continue;   // (compared, not shown: LEARN === 'en')
      if (next && next.v === ':' && prev && /[{,]/.test(prev.v)) continue;   // (an object's key)
      found.push({text, where:`${path.relative(ROOT, file).replace(/\\/g, '/')}:${line(u.at)}`});
    }
  }
  return found;
}

/* ---------- the content ---------- */
const looksLikeText = s => /[A-Za-z]/.test(s) && (/\s/.test(s.trim()) || /^[A-Z]/.test(s.trim()) || /[.!?…:)]$/.test(s.trim()) || /^[^\x00-\x7F]/.test(s.trim()));
// What's never your own words: what's said in the language you learn and its meaning, names (shown in both), pictures,
// maps, ids, the story's conditions (an object under if, when, done…: done can also be steps, a list), and what's only
// shown learning Chinese (the area's tips about Chinese, and how its home's name is made).
const NOT_TEXT = new Set(['zh', 'en', 'py', 'sentence', 'sentenceEn', 'colourSentence', 'colourSentenceEn', 'sell', 'sellEn', 'map', 'palette', 'id', 'look', 'art',
  'any', 'around', 'put', 'moves', 'rows', 'keys', 'pic', 'icon', 'emoji', 'tips', 'made', 'at']);
const CONDITIONS = new Set(['if', 'when', 'show', 'done', 'have', 'set', 'following', 'away', 'left']);
function contentStrings(obj, from, all = false){
  const found = [], seen = new Set();
  (function walk(o, at){
    if (typeof o === 'string'){ if (all ? /[A-Za-z]/.test(o) : looksLikeText(o)) found.push({text:o, where:at.join('.')}); return; }
    if (!o || typeof o !== 'object' || seen.has(o)) return;
    seen.add(o);
    for (const [k, v] of Object.entries(o)) if (all || (!NOT_TEXT.has(k) && !(CONDITIONS.has(k) && v && typeof v === 'object' && !Array.isArray(v)))) walk(v, [...at, k]);
  })(obj, [from]);
  return found;
}

/* ---------- all of it ---------- */
// Every piece of text, as a Map of its English to where it's first found.
function uiStrings(){
  const game = loadGame();
  const get = expr => JSON.parse(game.run(`JSON.stringify(${expr})`));
  const list = [];
  for (const f of fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js')).sort()) list.push(...engineStrings(path.join(ROOT, 'js', f)));
  list.push(...contentStrings(get('{MASTERY, PRACTICE, FOE_SAYS, TIPS, BAG_TABS, TOOL_DOES, VOICE_SHORT, VOICE_HELP, AB_WORDS, PAGE_TEXT, PAGE_LABELS}'), 'js'));
  get('AREAS.map(a => a.number)').forEach((n, i) => list.push(...contentStrings(get(`AREAS[${i}]`), `area${n}`)));
  const phrases = get("Object.fromEntries(Object.entries(WORD_BANK).filter(([w, d]) => d.use || d.cue || d.situation).map(([w, d]) => [w, {use:d.use, cue:d.cue, situation:d.situation}]))");
  list.push(...contentStrings(phrases, 'words'));
  list.push(...contentStrings(get('Object.fromEntries(Object.entries(CATEGORIES).map(([k, c]) => [k, {name:c.name, tab:c.tab}]))'), 'categories'));
  const map = new Map();
  for (const {text, where} of list) if (!map.has(text)) map.set(text, where);
  return map;
}

module.exports = {uiStrings, engineStrings, contentStrings, tokens};

if (require.main === module){
  const map = uiStrings(), zh = (() => { const g = loadGame(); return JSON.parse(g.run('JSON.stringify(ZH_UI)')); })();
  const missing = [...map].filter(([t]) => !Object.hasOwn(zh, t));
  if (process.argv[2] === '--missing') for (const [t, w] of missing) console.log(`${w}\t${t}`);
  console.log(`${map.size} pieces of text; ${map.size - missing.length} have their Chinese, ${missing.length} still to do.`);
}
