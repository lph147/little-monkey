// Writes CHINESE.md: every piece of Chinese in the game, with pinyin and English, for a native
// speaker to check. Run it with:  npm run chinese   (or: node tools/chinese-sheet.js)
// It reads the content files, so run it again after changing any Chinese (a test reminds you).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {loadGame, ROOT} = require('../tests/fake-browser');

// New sentences waiting to be checked before they go into the game. Once checked (and corrected),
// move each one into the content and delete it from here.
const DRAFTS = [
  {zh:'小 猴子 在 路 上 。', en:'The little monkey is on the path.', word:'路'},
  {zh:'山 上 有 很多 花 。', en:'There are lots of flowers on the mountain.', word:'花'},
  {zh:'草 里 有 一只 兔子 。', en:'There is a rabbit in the grass.', word:'兔子'},
  {zh:'狐狸 在 草 里 玩 。', en:'The fox is playing in the grass.', word:'狐狸'},
  {zh:'松鼠 在 树 上 。', en:'The squirrel is in the tree.', word:'松鼠'},
  {zh:'山羊 在 山 上 吃 草 。', en:'The goat is eating grass on the mountain.', word:'山羊'},
  {zh:'山 里 有 一个 洞 。', en:'There is a cave in the mountain.', word:'洞'}
];

const PUNCT = {'。':'.', '！':'!', '，':',', '？':'?'};
function sheet(){
  const game = loadGame();
  const get = expr => JSON.parse(game.run(`JSON.stringify(${expr})`));
  const AREA = get('AREA'), BANK = get('WORD_BANK');
  // Pinyin for a sentence written with spaces between words, from the word bank.
  const py = zh => zh.split(' ').reduce((out, t) => PUNCT[t] ? out + PUNCT[t] : (out ? out + ' ' : '') + ((BANK[t] || {}).py || '??'), '');
  const chars = zh => zh.split(' ').join('');
  const row = cells => `| ${cells.join(' | ')} |`;
  const table = (head, rows) => [row(head), row(head.map(() => '---')), ...rows.map(row)].join('\n');
  const name = id => { const c = AREA.characters.find(x => x.id === id); return c && c.name ? `${c.name.zh} (${c.name.en})` : id; };

  // Who says each line
  const saidBy = {};
  const add = (key, who) => { (saidBy[key] = saidBy[key] || new Set()).add(who); };
  for (const [who, parts] of Object.entries(AREA.talk)) for (const p of parts) for (const s of p.do) if (s.say) add(s.say, name(who));
  for (const r of Object.values(AREA.requests)) for (const k of [r.ask, r.offer, r.thanks, r.wrong]) if (k) add(k, name(r.from));
  if (AREA.shop) for (const k of [AREA.shop.ask, AREA.shop.thanks]) add(k, name(AREA.shop.who));

  const collect = Object.keys(BANK).filter(w => BANK[w].area === AREA.number), heard = Object.keys(BANK).filter(w => !BANK[w].area);
  const names = [...AREA.characters.filter(c => c.name).map(c => c.name), AREA.sign.name, AREA.name];
  const builds = [...Object.values(AREA.requests).map(r => [r.build, r.buildEn, name(r.from)]), ...(AREA.shop ? AREA.shop.items.map(i => [i.build, i.buildEn, name(AREA.shop.who)]) : [])];
  const notes = '';

  return `# Chinese in Little Monkey: for checking

Everything the player reads or hears in Chinese, with pinyin and English. Please check that each
piece is natural, simple Mandarin that a child or beginner might hear, that the pinyin and tones are
right, and that the English means the same. Write anything to change in the last column.

This file is made from the game's content by \`npm run chinese\`; don't edit it by hand.
The pinyin of sentences is put together word by word, so tone changes (such as 一 and 不) are only
shown where the word list has them.

## ${AREA.name.zh} ${AREA.name.en}

### Lines characters say

${table(['Chinese', 'Pinyin', 'English', 'Said by', 'Notes'], Object.entries(AREA.lines).map(([k, l]) => [chars(l.zh), py(l.zh), l.en, [...(saidBy[k] || [])].join(', '), notes]))}

### Sentences the player builds from word tiles

${table(['Chinese', 'Pinyin', 'English', 'Said to', 'Notes'], builds.map(([b, en, who]) => [chars(b), py(b), en || '', who, notes]))}

### The sign

${table(['Chinese', 'Pinyin', 'English', 'Notes'], [[chars(AREA.sign.says.zh), py(AREA.sign.says.zh), AREA.sign.says.en, notes]])}

### The story at the waterfall

${table(['Chinese', 'Pinyin', 'English', 'Notes'], AREA.story.map(s => [chars(s.zh), py(s.zh), s.en, notes]))}

### Questions after the story

${table(['Chinese', 'Pinyin', 'English', 'Answer', 'Notes'], AREA.storyQuestions.map(q => [chars(q.zh), py(q.zh), q.en || '', q.answer, notes]))}

### The opening scene

${table(['Chinese', 'Pinyin', 'English', 'Notes'], AREA.intro.map(c => [c.zh, c.py, c.en, notes]))}

### Names

${table(['Chinese', 'Pinyin', 'English', 'Notes'], names.map(n => [n.zh, n.py, n.en, notes]))}

### Words to collect

${table(['Chinese', 'Pinyin', 'English', 'Notes'], collect.map(w => [w, BANK[w].py, BANK[w].en, notes]))}

### Words only heard in sentences

${table(['Chinese', 'Pinyin', 'English', 'Notes'], heard.map(w => [w, BANK[w].py, BANK[w].en, notes]))}

## New sentences, not in the game yet

Example sentences for words that aren't in any sentence yet. They'll go into the game once checked.

${table(['Chinese', 'Pinyin', 'English', 'For the word', 'Notes'], DRAFTS.map(d => [chars(d.zh), py(d.zh), d.en, d.word, notes]))}
`;
}

module.exports = {sheet, DRAFTS, FILE: path.join(ROOT, 'CHINESE.md')};
if (require.main === module){
  fs.writeFileSync(module.exports.FILE, sheet());
  console.log('Wrote CHINESE.md');
}
