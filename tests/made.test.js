// How a word is made (Chinese is logical, step 2, 23 October 2026): on a new word's card, with its English, a box shows
// its parts, each with its pinyin and English (green if it's a word you know), and what they add up to; or the clue inside
// a character, or the picture it was drawn from; and where you've met a part before, in another word you know. Seen again,
// and in the Word Scroll, it waits behind the English button.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knowing = words => Object.fromEntries(words.map(hz => [hz, {lv: 1, due: 0, ok: 0}]));
const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const text = el => el.textContent.replace(/\s+/g, ' ').trim();
// A game that knows these words, with a word's card open (save: more of the save)
function card(words, w, save = {}){
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(words), ...save}});
  g.run(`showNotice('${w}')`);
  return {g, sheet: g.el('#sheet')};
}

test('every entry is a word here: its parts make the word, and their pinyin is the word’s own (catching a typing mistake)', () => {
  const g = loadGame();
  const made = get(g, 'MADE'), words = get(g, 'WORDS'), plain = py => py.replace(/\s+/g, '').toLowerCase();
  for (const [w, m] of Object.entries(made)){
    assert.ok(words[w], `${w} is one of this area's words`);
    assert.ok(typeof m.why === 'string' && m.why.length > 3, `${w} says what it adds up to, or the picture it was drawn from`);
    // [Chinese, pinyin, English], and maybe other words with it that have nothing here (words of this area, each with it)
    const isPart = p => Array.isArray(p) && (p.length === 3 || p.length === 4) && p.slice(0, 3).every(x => typeof x === 'string' && x)
      && [].concat(p[3] || []).every(o => words[o] && !made[o] && o.includes(p[0]));
    if (m.parts){
      assert.ok(m.parts.length >= 2 && m.parts.every(isPart), `${w}: each part is [Chinese, pinyin, English] (and maybe words with it)`);
      assert.equal(m.parts.map(p => p[0]).join(''), w, `${w}: its parts, in order, make the word`);
      assert.equal(plain(m.parts.map(p => p[1]).join('')), plain(words[w].py), `${w}: its parts’ pinyin is the word’s own`);
      assert.ok(!m.clue, `${w}: parts or a clue, not both`);
    } else if (m.clue){
      assert.ok(isPart(m.clue), `${w}: its clue is [Chinese, pinyin, English] (and maybe words with it)`);
      assert.ok([...w].length === 1 || [...w].includes(m.clue[0]), `${w}: a clue is inside a word of one character, or one of a word’s characters`);
    } else assert.equal([...w].length, 1, `${w}: a picture is what one character was drawn from`);
  }
  // decided 23 October 2026: only where it genuinely helps, never characters that just say the meaning again
  for (const w of ['朋友', '睡觉', '谢谢', '学校', '老师']) assert.ok(!made[w], `${w} has nothing that helps`);
});

test('on a new word’s first card it shows with the English; seen again, it waits behind the English button, with the English', () => {
  const first = card(['石头'], '山');
  const box = first.sheet.querySelector('.made');
  assert.ok(box && !box.hidden, 'with the English, the first time');
  assert.equal(text(box), 'Drawn like three mountain peaks.');
  const again = card(['石头', '山'], '山');
  assert.ok(again.sheet.querySelector('.made').hidden && again.sheet.querySelector('.word .en').hidden, 'seen again: behind the English button');
  again.sheet.querySelector('[data-a=en]').click();
  assert.ok(!again.sheet.querySelector('.made').hidden && !again.sheet.querySelector('.word .en').hidden, 'English shows them both');
  const none = card(['石头'], '猴子');
  assert.equal(none.sheet.querySelector('.made'), null, 'a word with nothing that helps shows nothing');
});

test('each part has its pinyin and English, a part you know as a word is green, and a clue shows what’s inside', () => {
  const {sheet} = card(['石头', '山'], '山羊');
  const rubies = sheet.querySelectorAll('.made ruby');
  assert.deepEqual(rubies.map(r => [text(r), r.className]), [['山shān', 'known'], ['羊yáng', '']], '山 is a word you know; 羊 isn’t yet');
  assert.equal(text(sheet.querySelector('.made')), '山shān mountain + 羊yáng sheep = a mountain sheep');
  const eat = card(['石头'], '吃').sheet.querySelector('.made');
  assert.equal(text(eat), '口kǒu mouth on its left: you eat with your mouth');
});

test('a card says where you’ve met a part before, in another word you know (whichever of the two you meet second)', () => {
  const link = (words, w) => { const l = card(words, w).sheet.querySelector('.mlink'); return l && text(l); };
  assert.equal(link(['石头', '水果'], '苹果'), '果 is also in 水果shuǐguǒ (fruit), a word you know.', 'the 果 (fruit) of 苹果');
  assert.equal(link(['石头', '苹果'], '水果'), '果 is also in 苹果píngguǒ (apple), a word you know.', 'and the other way round');
  assert.equal(link(['石头', '山羊'], '羊'), '羊 is also in 山羊shānyáng (goat), a word you know.', 'meet the goat before the sheep, and the sheep says so');
  assert.equal(link(['石头', '吃'], '喝'), '口 is also in 吃chī (to eat), a word you know.', 'a clue: the mouth in eat and drink');
  assert.equal(link(['石头', '草'], '花'), '艹 is also in 草cǎo (grass), a word you know.', 'the plants on top of flower and grass');
  assert.equal(link(['石头', '树'], '木头'), '木 is also in 树shù (tree), a word you know.', 'the 木 (tree) of 木头 (wood)');
  assert.equal(link(['石头', '学校'], '同学'), '学 is also in 学校xuéxiào (school), a word you know.', 'a word with nothing here, named by the part');
  assert.equal(link(['石头'], '碗'), '石 is also in 石头shítou (stone), a word you know.', 'the 石 (stone) of 碗 (bowl): your very first word');
  assert.equal(link(['石头'], '苹果'), null, 'nothing, when you know no other word with its parts');
  assert.equal(link(['石头', '山', '羊'], '山羊'), null, 'its parts are words you know: they’re green instead');
});

test('in the Word Scroll, how it’s made is on a word’s page, behind the English button', () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(['石头', '水', '水果'])}});
  g.run("wordPage('水果', () => {})");
  const sheet = g.el('#sheet'), about = sheet.querySelector('.madeabout');
  assert.ok(about && about.hidden, 'there, behind English');
  sheet.querySelector('[data-a=en]').click();
  assert.ok(!about.hidden && !sheet.querySelector('.word .en').hidden, 'English shows it, with the English');
  assert.equal(text(about.querySelector('.label')), 'How it’s made');
  assert.equal(text(about.querySelector('.made')), '水shuǐ water + 果guǒ fruit = fresh, juicy fruit');
  assert.deepEqual(about.querySelectorAll('ruby').map(r => r.className), ['known', ''], '水, a word you know, green');
  g.run("wordPage('石头', () => {})");
  assert.equal(g.el('#sheet').querySelector('.madeabout'), null, 'nothing for a word without it');
});

test('its parts aren’t new words: a card teaches just its own word', () => {
  const {g, sheet} = card(['石头'], '山羊');
  sheet.querySelector('[data-a=ok]').click();
  assert.deepEqual(get(g, "Object.keys(WORDS).filter(w => lvl(w) >= 1)").sort(), ['山羊', '石头'].sort(), '山 and 羊 aren’t caught by seeing them');
});
