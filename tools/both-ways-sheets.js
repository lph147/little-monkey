// The sheets for checking the game learning English (Both ways, decided 9 November 2026), as CHINESE.md is for checking
// its Chinese learning Chinese. Run it with  npm run chinese  (after changing any of the game's words: a test checks both
// are up to date).
// - CHINESE-UI.md: everything the game says in Chinese learning English, for a native speaker (a paid professional, as
//   agreed) to check: each piece of the game's own text with its English (content/chinese-ui.js), what each English word
//   means in Chinese (content/english.js), the notes written for learning English, How to play and the language choice.
// - ENGLISH.md: everything the game says in English learning English, for a native speaker of British English to check:
//   each word, with its 音标 (IPA) and its forms, and every line, sentence and caption, as it's said, with its Chinese.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {loadGame, ROOT} = require('../tests/fake-browser');
const {uiStrings} = require('./ui-strings');

const cell = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/<br>/g, ' / ');
const plain = html => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function chineseUI(){
  const g = loadGame({dom: true, save: {version: 41, started: true, area: 1, learn: 'en', w: {}}});
  const get = expr => JSON.parse(g.run(`JSON.stringify(${expr})`));
  const ZH = get('ZH_UI'), EN = get('EN_WORDS'), HEARD = get('EN_HEARD'), MADE = get('EN_MADE'), SOUNDS = get('EN_SOUNDS'), TIPS = get('EN_TIPS');
  const where = uiStrings(), groups = {};
  const group = t => { const w = where.get(t) || ''; return w.startsWith('js/') ? 'The game itself (js/)' : w.startsWith('area1') ? 'Flower Fruit Mountain (content/flower-fruit-mountain.js)'
    : w.startsWith('area2') ? 'Across the sea (content/across-the-sea.js)' : w.startsWith('words') ? 'What each phrase is for (content/words.js)' : w.startsWith('categories') ? 'The Word Scroll’s pages' : 'The game itself (js/)'; };
  for (const t of Object.keys(ZH)) (groups[group(t)] = groups[group(t)] || []).push(t);
  let out = `# The game in Chinese, learning English\n\nEverything the game says in Chinese to a player learning English, for a native speaker to check. Made by\n\`npm run chinese\` (tools/both-ways-sheets.js) from content/chinese-ui.js and content/english.js: don't edit it here.\n\nIn the Chinese, {…} is something put in as it's shown: a number ({n}), a name ({who}), or a word in braces ({水}), which\nshows as the English word being learned with its Chinese, such as water（水）. Keep each one as it is. Written by Claude:\nplease correct anything that isn't natural, simple Chinese for a child.\n`;
  for (const [name, list] of Object.entries(groups)){
    out += `\n## ${name}\n\n| English | 中文 |\n|---|---|\n`;
    for (const t of list) out += `| ${cell(t)} | ${cell(ZH[t])} |\n`;
  }
  out += `\n## What each English word means\n\nEach word's English, as it's learned, and the Chinese shown for it.\n\n| English | 中文 |\n|---|---|\n`;
  for (const [w, e] of Object.entries(EN)) if (!e.same) out += `| ${cell(e.w)} | ${cell(e.zh || w)} |\n`;
  out += `\n## Other English words in sentences (just for listening)\n\n| English | 中文 |\n|---|---|\n`;
  for (const [w, [, zh]] of Object.entries(HEARD)) out += `| ${cell(w)} | ${cell(zh)} |\n`;
  out += `\n## How a word is made\n\n| Word | Parts | 中文 |\n|---|---|---|\n`;
  for (const [w, m] of Object.entries(MADE)) out += `| ${cell(EN[w] ? EN[w].w : w)} | ${cell((m.parts || []).map(p => `${p[0]} ${p[1]}`).join(' + '))} | ${cell(m.why || '')} |\n`;
  out += `\n## Words that sound alike, and the tip about English\n\n`;
  for (const p of SOUNDS) if (p.note) out += `- ${p.words.map(w => EN[w] ? EN[w].w : w).join(' / ')}: ${p.note}\n`;
  for (const t of Object.values(TIPS)) out += `- ${t.title}: ${t.ask} ${t.heard} ${t.text}\n`;
  out += `\n## How to play\n\n`;
  for (const page of get('howToPlayEn()')) out += `- ${plain(page)}\n`;
  g.run('chooseLearn(() => {})');
  out += `\n## Choosing which language a new game learns (in both)\n\n- ${plain(g.el('#sheet').innerHTML)}\n`;
  return out;
}

function english(){
  let out = `# The game in English, learning English\n\nEverything the game says in English to a player learning English (as it's said, in British English), for a native\nspeaker to check. Made by \`npm run chinese\` (tools/both-ways-sheets.js) from the content and content/english.js:\ndon't edit it here. Its Chinese is what it means, shown under it.\n`;
  const g = loadGame({save: {version: 41, started: true, area: 1, learn: 'en', w: {}}});
  const EN = JSON.parse(g.run('JSON.stringify(EN_WORDS)'));
  out += `\n## The words\n\nEach word as it's learned, its 音标 (IPA), and its other forms (a plural, or what else in a sentence counts as it).\n\n| Word | IPA | Other forms | 中文 |\n|---|---|---|---|\n`;
  for (const [w, e] of Object.entries(EN)) if (!e.same) out += `| ${cell(e.w)} | ${cell(e.ipa ? '/' + e.ipa + '/' : '')} | ${cell([e.pl, ...(e.also || [])].filter(Boolean).join(', '))} | ${cell(e.zh || w)} |\n`;
  for (const n of JSON.parse(g.run('JSON.stringify(AREAS.map(a => a.number))'))){
    const a = loadGame({save: {version: 41, started: true, area: n, learn: 'en', w: {}}});
    const lines = JSON.parse(a.run('JSON.stringify(Object.entries(L).map(([k, l]) => [k, lineSay(l), l.en]))'));
    const name = JSON.parse(a.run('JSON.stringify(AREA.name)'));
    out += `\n## ${name.en} (${name.zh}): what's said\n\n| Line | English | 中文 |\n|---|---|---|\n`;
    for (const [k, en, zh] of lines) out += `| ${k} | ${cell(en)} | ${cell(zh)} |\n`;
  }
  return out;
}

const FILES = {[path.join(ROOT, 'CHINESE-UI.md')]: chineseUI, [path.join(ROOT, 'ENGLISH.md')]: english};
module.exports = {FILES, chineseUI, english};
if (require.main === module) for (const [file, make] of Object.entries(FILES)) fs.writeFileSync(file, make());
