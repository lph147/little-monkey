// Writes CHINESE.md: every piece of Chinese in the game, with pinyin and English, for a native
// speaker to check. Run it with:  npm run chinese   (or: node tools/chinese-sheet.js)
// It reads the content files, so run it again after changing any Chinese (a test reminds you).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {loadGame, ROOT} = require('../tests/fake-browser');

// New sentences waiting to be checked, as {zh, en, where}: ones not in the game yet, and new ones already
// in it. Once checked (and corrected), put any corrections into the content and delete them from here.
const DRAFTS = [
  ...[['石头 里 有 猴子 。', 'There is a monkey inside the stone.'], ['我 是 猴子 。', 'I am a monkey.'], ['我 有 朋友 。', 'I have friends.'],
    ['我 吃 桃子 ， 喝 水 。', 'I eat peaches and drink water.'], ['草 里 有 动物 。', 'There are animals in the grass.'],
    ['树 上 有 鸟 。', 'There are birds in the trees.'], ['河 里 有 鱼 。', 'There are fish in the river.'],
    ['山 上 有 瀑布 ！', 'There is a waterfall on the mountain!']]
    .map(([zh, en]) => ({zh, en, where:'The new, shorter story at the waterfall (in the game)'})),
  {zh:'我 要 花 ！', en:'I want flowers!', where:'The big monkey (大猴子 dà hóuzi: please check this name too, in Names) asking for flowers'},
  {zh:'你 有 花 吗 ？', en:'Do you have flowers?', where:'The big monkey, when you bring the flowers'},
  ...[['瀑布 后面 有 什么 ？', 'What’s behind the waterfall?', 'The old monkey, as the troop gathers at the waterfall'],
    ['谁 跳 进去 ， 谁 就 是 王 ！', 'Whoever jumps in will be king!', 'The big monkey, daring the troop'],
    ['我 怕 ！', 'I’m scared!', 'The little monkey'],
    ['里面 有 什么 ？', 'What’s inside?', 'The old monkey, when you come back out of the cave'],
    ['里面 有 床 。', 'There are beds inside.', 'Your answer (you choose 床 to fill the gap)'],
    ['太 好 了 ！ 我们 去 看看 ！', 'Wonderful! Let’s go and see!', 'The old monkey'],
    ['河 上 有 桥 。', 'There is a bridge over the river.', 'The example on 桥 (bridge)’s page in the Word Scroll'],
    ['桌子 上 有 碗 。', 'There are bowls on the table.', 'The example on 碗 (bowl)’s page'],
    ['洞 里 有 桌子 。', 'There is a table in the cave.', 'The example on 桌子 (table)’s page'],
    ['洞 里 有 床 。', 'There are beds in the cave.', 'The example on 床 (bed)’s page'],
    ['水帘洞', 'Water Curtain Cave', 'What the stone tablet (石碑 shíbēi: please check this name too) in the cave says']]
    .map(([zh, en, where]) => ({zh, en, where:'Chapter 1, part A (in the game): ' + where})),
  ...[['这 是 我们 的 家 ！', 'This is our home!', 'The old monkey, when the troop moves into the cave'],
    ['你 是 我们 的 王 ！', 'You are our king!', 'The big monkey, for the troop (then you’re called 美猴王 Měi Hóuwáng: please check this name too)'],
    ['一 只 猴子 。', 'One monkey.', 'The old monkey, counting the troop into the cave (teaching 一)'],
    ['两 只 猴子 。', 'Two monkeys.', 'The old monkey, counting (the card teaches 二: see the question below)'],
    ['三 只 猴子 。', 'Three monkeys.', 'The old monkey, counting (teaching 三)'],
    ['一 ， 二 ， 三 ！', 'One, two, three!', 'The example on 二 (two)’s page in the Word Scroll']]
    .map(([zh, en, where]) => ({zh, en, where:'Chapter 1, part B (in the game): ' + where}))
];

// Chapter 1, written but not built yet (the script was agreed on 17 October 2026). Its words aren't in the
// word bank yet, so each line gives its own pinyin. When it's built, these move into the area file.
// Questions for the native speaker about the game's Chinese.
const QUESTIONS = ['When the troop is counted into the cave, the number cards teach 一, 二 and 三, but the old monkey says 两只猴子 for two monkeys. Is that right, and how would you explain 二 and 两 to a beginner in one short line? (The card for 二 says: "When you count things, two is 两 (liǎng): 两只猴子 (two monkeys).")'];
const PUNCT = {'。':'.', '！':'!', '，':',', '？':'?'};
function sheet(){
  const game = loadGame();
  const get = expr => JSON.parse(game.run(`JSON.stringify(${expr})`));
  const AREA = get('AREA'), BANK = get('WORD_BANK'), MENU = get('MENU_TILES');
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
  for (const r of Object.values(AREA.requests)) if (r.wrongAnswer) add(r.wrongAnswer, name(r.from));

  const collect = Object.keys(BANK).filter(w => BANK[w].area === AREA.number), heard = Object.keys(BANK).filter(w => !BANK[w].area);
  const names = [...AREA.characters.filter(c => c.name).map(c => c.name), AREA.sign.name, AREA.name, ...Object.values(AREA.places).map(p => p.name)];   // characters, the sign, the area and its places
  const builds = [...Object.values(AREA.requests).map(r => [r.sentence, r.sentenceEn, name(r.from)]), ...(AREA.shop ? AREA.shop.items.map(i => [i.sentence, i.sentenceEn, name(AREA.shop.who)]) : []), ...(AREA.wardrobe || []).map(c => [c.sentence, c.sentenceEn, 'You, in the wardrobe'])];
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

### Sentences the player completes (one word missing)

${table(['Chinese', 'Pinyin', 'English', 'Said to', 'Notes'], builds.map(([b, en, who]) => [chars(b), py(b), en || '', who, notes]))}

### The sign

${table(['Chinese', 'Pinyin', 'English', 'Notes'], [[chars(AREA.sign.says.zh), py(AREA.sign.says.zh), AREA.sign.says.en, notes]])}

### The story at the waterfall

${table(['Chinese', 'Pinyin', 'English', 'Notes'], AREA.story.map(s => [chars(s.zh), py(s.zh), s.en, notes]))}

### Example sentences on word pages

For words that no line or story sentence uses, shown on the word's page in the Word Scroll.

${table(['Chinese', 'Pinyin', 'English', 'For the word', 'Notes'], Object.entries(AREA.examples).map(([w, e]) => [chars(e.zh), py(e.zh), e.en, w, notes]))}

### Questions after the story

${table(['Chinese', 'Pinyin', 'English', 'Answer', 'Notes'], AREA.storyQuestions.map(q => [chars(q.zh), py(q.zh), q.en || '', q.answer, notes]))}

### The opening scene

The opening is told in English. These captions each show one word, said aloud.

${table(['Word', 'Pinyin', 'Caption', 'Notes'], AREA.intro.filter(c => c.word).map(c => [c.word, BANK[c.word].py, c.en, notes]))}

### Names

${table(['Chinese', 'Pinyin', 'English', 'Notes'], names.map(n => [n.zh, n.py, n.en, notes]))}

### Words to collect

${table(['Chinese', 'Pinyin', 'English', 'Notes'], collect.map(w => [w, BANK[w].py, BANK[w].en, notes]))}

### Words only heard in sentences

${table(['Chinese', 'Pinyin', 'English', 'Notes'], heard.map(w => [w, BANK[w].py, BANK[w].en, notes]))}

## The menu

The names of the menu's tiles, shown with pinyin and English.

${table(['Chinese', 'Pinyin', 'English', 'Notes'], MENU.map(t => [t.zh, t.py, t.en, notes]))}

## New sentences to check

Sentences that haven't been checked yet: new ones waiting to go into the game, and new ones already in it.

${DRAFTS.length ? table(['Chinese', 'Pinyin', 'English', 'Where', 'Notes'], DRAFTS.map(d => [chars(d.zh), py(d.zh), d.en, d.where, notes])) : 'None at the moment.'}

## Questions

${QUESTIONS.map(q => '- ' + q).join('\n')}
`;
}

module.exports = {sheet, DRAFTS, QUESTIONS, FILE: path.join(ROOT, 'CHINESE.md')};
if (require.main === module){
  fs.writeFileSync(module.exports.FILE, sheet());
  console.log('Wrote CHINESE.md');
}
