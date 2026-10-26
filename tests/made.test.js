// How a word is made (Chinese is logical, step 2, 23 October 2026): its parts, each with its pinyin and English (green if
// it's a word you know), and the word they make, with its English (since 25 October 2026: what it means, goat, not what
// the parts add up to, a mountain sheep); or the clue inside a character, or the picture it was drawn from; and
// where you've met a part before, in another word you know. Since 24 October 2026 on a card of its own: a new word's card
// goes on to it (How it's made ▸); seen again, and in the Word Scroll, the English button shows the English, then opens it.
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
    if (m.parts) assert.ok(!('why' in m), `${w}: its card shows the word’s own English, what it means, not what its parts add up to`);
    else assert.ok(typeof m.why === 'string' && m.why.length > 3, `${w} says why: its clue, the picture it was drawn from, or the character it shares`);
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
    } else if (m.same){
      assert.ok(isPart(m.same) && m.same.length === 3, `${w}: the character it shares is [Chinese, pinyin, English]`);
      assert.ok(words[m.as] && m.as !== w && w.includes(m.same[0]) && m.as.includes(m.same[0]), `${w}: it shares ${m.same[0]} with ${m.as}, another word here`);
      assert.ok(plain(words[w].py).includes(plain(m.same[1])) && plain(words[m.as].py).includes(plain(m.same[1])), `${w}: ${m.same[0]} is said ${m.same[1]} in both`);
    } else assert.equal([...w].length, 1, `${w}: a picture is what one character was drawn from`);
  }
  // decided 23 October 2026: only where it genuinely helps, never characters that just say the meaning again
  for (const w of ['朋友', '睡觉', '谢谢', '学校', '老师']) assert.ok(!made[w], `${w} has nothing that helps`);
  // decided 24 October 2026, after playing it: only what's simple, useful and memorable, that you can picture (the 艹 of
  // 花 and 草, plants, meant nothing; 苹 means nothing on its own; the rest needed explaining)
  for (const w of ['花', '草', '桥', '床', '路', '跳', '碗', '家', '瀑布', '没关系', '不客气']) assert.ok(!made[w], `${w}: nothing simple enough`);
  assert.ok(!made['再见'], '再见: again + to see was no help (decided 26 October 2026, after playing it)');
});

test('a new word with a story: its card is just the word, then How it’s made ▸ opens a card of its own; Back goes back, Got it catches it', () => {
  const {g, sheet} = card(['石头'], '山');
  g.run("globalThis.__said = []; say = w => __said.push(w); globalThis.__toast = []; toast = t => __toast.push(t)");
  assert.equal(sheet.querySelector('.madestage'), null, 'the word’s card has no box');
  assert.ok(!sheet.querySelector('.word .en').hidden, 'its English, the first time');
  const how = sheet.querySelector('.actions .primary');
  assert.equal(how.dataset.a, 'made', 'A is How it’s made');
  assert.equal(text(how), 'How it’s made ▸');
  assert.equal(sheet.querySelector('[data-a=ok]'), null, 'no Got it yet');
  g.run('pressA()');
  assert.equal(text(sheet.querySelector('.label')), 'How 山 is made');
  assert.equal(text(sheet.querySelector('.mwhy')), 'Drawn like three mountain peaks.');
  g.run('pressB()');
  assert.equal(text(sheet.querySelector('.big')), '山', 'B: back to the word’s card');
  assert.deepEqual(get(g, '__said'), [], 'not said again');
  g.run('pressA()');
  assert.equal(text(sheet.querySelector('.actions .primary')), 'Got it');
  assert.equal(g.run('lvl("山")'), 0, 'not caught till Got it');
  g.run('pressA()');
  assert.equal(g.run('modal.hidden'), true);
  assert.equal(g.run('lvl("山")'), 1, 'Got it: caught');
  assert.match(get(g, '__toast')[0], /added to your Word Scroll/);
  const none = card(['石头'], '猴子');
  assert.equal(none.sheet.querySelector('[data-a=made]'), null, 'a word with nothing that helps: no How it’s made');
  assert.equal(text(none.sheet.querySelector('.actions .primary')), 'Got it', 'just Got it, as before');
});

test('seen again: English shows the English, then becomes How it’s made; its card has Back and OK', async () => {
  const {g, sheet} = card(['石头', '山'], '山');
  g.run("globalThis.__done = false; showNotice('山').then(() => { __done = true; })");
  assert.ok(sheet.querySelector('.word .en').hidden, 'the English waits');
  assert.equal(sheet.querySelector('[data-a=made]'), null);
  sheet.querySelector('[data-a=en]').click();
  assert.ok(!sheet.querySelector('.word .en').hidden, 'English: the English');
  assert.equal(sheet.querySelector('[data-a=en]'), null);
  assert.equal(text(sheet.querySelector('[data-a=made]')), 'How it’s made', 'and the button becomes How it’s made');
  sheet.querySelector('[data-a=made]').click();
  assert.equal(text(sheet.querySelector('.actions .primary')), 'OK');
  g.run('pressB()');
  assert.ok(!sheet.querySelector('.word .en').hidden && sheet.querySelector('[data-a=made]'), 'Back: the English still showing, and How it’s made');
  sheet.querySelector('[data-a=made]').click();
  g.run('pressA()');
  await new Promise(r => setImmediate(r));
  assert.ok(g.run('modal.hidden') && g.run('__done'), 'OK: done with it');
  const none = card(['石头', '猴子'], '猴子');
  none.sheet.querySelector('[data-a=en]').click();
  assert.equal(none.sheet.querySelector('[data-a=made]'), null, 'nothing more for a word without a story');
});

// A word's How it's made card (madeCard), opened on its own
function made(words, w){
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(words)}});
  g.run(`madeCard('${w}', () => {}, () => {}, 'Got it')`);
  return g.el('#sheet');
}
const cols = sheet => sheet.querySelectorAll('.mcol').filter(c => !c.classList.contains('mop')).map(c => [text(c), c.className.replace('mcol', '').trim()]);

test('each part has its pinyin and English, a part you know as a word is green, then = the word, with its English; a clue shows what’s inside', () => {
  const goat = made(['石头', '山'], '山羊');
  assert.deepEqual(cols(goat), [['shān 山 mountain', 'mpart known'], ['yáng 羊 sheep', 'mpart'], ['shānyáng 山羊 goat', 'mword']], '山 is a word you know; 羊 isn’t yet');
  assert.deepEqual(goat.querySelectorAll('.mop').map(text), ['+', '='], 'with + and = between them');
  assert.ok(goat.querySelectorAll('.mcol')[0].querySelector('.mcpic .pix') && goat.querySelectorAll('.mcol')[2].querySelector('.mcpic .pix'), 'a part that’s a word with a picture shows it, and so does the word');
  const dontWant = made(['石头'], '我不要');
  assert.ok(!dontWant.querySelectorAll('.mcol')[2].querySelector('.mcpic .pix'), '不 isn’t a word here: no picture');
  const eat = made(['石头'], '吃');
  assert.deepEqual(cols(eat), [['chī 吃 to eat', 'mword big'], ['kǒu 口 mouth', 'mpart']], 'a clue: the character, and the clue beside it');
  assert.equal(text(eat.querySelector('.mwhy')), '口 on its left: you eat with your mouth');
  const hill = made(['石头'], '山');
  assert.ok(hill.querySelector('.madestage.drawn .mcpic .pix'), 'a picture: what it was drawn from, beside it');
  assert.equal(text(hill.querySelector('.mwhy')), 'Drawn like three mountain peaks.');
});

// decided 25 October 2026 by the game's owner, after playing it: the goat's card said 山 mountain + 羊 sheep = 山羊 a
// mountain sheep, which isn't what 山羊 means
test('on every card of a word made of parts, the word itself has its own English, what it means: 山 mountain + 羊 sheep = 山羊 goat', () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(['石头'])}});
  const words = get(g, 'WORDS');
  const right = w => { g.run(`madeCard('${w}', () => {}, () => {}, 'Got it')`); return text(g.el('#sheet').querySelector('.mword .mcen')); };
  for (const [w, m] of Object.entries(get(g, 'MADE'))) if (m.parts) assert.equal(right(w), words[w].en.split(',')[0], `${w}: its English`);
  assert.equal(right('山羊'), 'goat', 'not a mountain sheep');
  assert.equal(right('蜂王'), 'queen bee', 'not the bees’ king');
  assert.equal(right('你好'), 'hello', 'just hello (not wishing you well)');
});

test('the card says where you’ve met a part before, in another word you know (whichever of the two you meet second), or that you know every part', () => {
  const note = (words, w) => { const n = made(words, w).querySelector('.mnote'); return n && text(n); };
  const from = (words, w) => { const n = made(words, w).querySelector('.mfrom'); return n && text(n); };   // (a part of a word made of parts: in its column)
  assert.equal(note(['石头', '山羊'], '羊'), '羊 is also in 山羊shānyáng (goat), a word you know.', 'meet the goat before the sheep, and the sheep says so');
  assert.equal(note(['石头', '吃'], '喝'), '口 is also in 吃chī (to eat), a word you know.', 'a clue: the mouth in eat and drink');
  assert.equal(note(['石头', '树'], '木头'), '木 is also in 树shù (tree), a word you know.', 'the 木 (tree) of 木头 (wood)');
  assert.equal(from(['石头', '学校'], '同学'), 'as in 学校 (school)', 'a word with nothing here, named by the part');
  assert.ok(!note(['石头'], '喝') && !from(['石头'], '蜜蜂'), 'nothing, when you know no other word with its parts');
  assert.equal(note(['石头', '山', '羊'], '山羊'), 'You know both parts already!', 'its parts are words you know: they’re green, and it says so');
  assert.equal(from(['石头', '我', '不客气', '要'], '我不要'), 'as in 不客气 (you’re welcome)', 'three parts, not all of them words');
});

test('a word made of parts comes together as you watch: the parts one by one, then each flies into the word, whose picture and meaning come last', () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(['石头', '山'])}});
  g.run("madeCard('山羊', () => {}, () => { globalThis.__done = true; }, 'Got it')");
  const sheet = g.el('#sheet'), stage = sheet.querySelector('.madestage'), inn = sel => stage.querySelectorAll(sel).map(x => x.classList.contains('in'));
  assert.ok(stage.classList.contains('anim'), 'it plays');
  assert.deepEqual(inn('.mpart'), [false, false], 'the parts come in one by one');
  assert.deepEqual(inn('.mch'), [false, false], 'the word waits for its characters');
  assert.equal(stage.querySelector('.mword').classList.contains('in'), false, 'and its picture and meaning');
  g.flush();
  assert.ok(!stage.classList.contains('anim'), 'then it’s all there');
  assert.deepEqual(inn('.mch'), [true, true], 'each character flew in');
  assert.equal(text(sheet.querySelector('[data-a=again]')), '↻ Watch again');
  sheet.querySelector('[data-a=again]').click();
  assert.ok(stage.classList.contains('anim') && !inn('.mch').some(Boolean), 'Watch again plays it again');
  g.run('pressA()');
  assert.ok(!stage.classList.contains('anim') && !g.run('modal.hidden'), 'A while it’s moving shows the end at once, and the card stays');
  assert.ok(!g.run('globalThis.__done'), 'not Got it yet');
  g.run('pressA()');
  assert.ok(g.run('globalThis.__done'), 'then A is Got it');
  assert.equal(made(['石头'], '吃').querySelector('[data-a=again]'), null, 'a clue or a picture stays still: nothing to watch again');
});

test('a part you know from another word: that word shows first, with its picture, and the part lifts out of it', () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(['石头', '学校'])}});
  g.run("madeCard('同学', () => {}, () => {}, 'Got it')");
  const sheet = g.el('#sheet'), col = sheet.querySelector('.mpart.from');
  assert.equal(col.dataset.i, '1', 'the 学 of 同学');
  assert.equal(text(col.querySelector('.mpyword')), 'xuéxiào', 'first, 学校, with its pinyin');
  assert.deepEqual(col.querySelectorAll('.mchz span').map(x => [text(x), x.className]), [['学', 'mpartch'], ['校', 'mfade']], 'the rest of it fades as 学 lifts out');
  assert.equal(text(col.querySelector('.mpypart')), 'xué', 'then the part’s own pinyin');
  assert.ok(col.querySelector('.mcpic .pix'), 'with the picture of 学校');
  assert.ok(!col.classList.contains('lifted'));
  g.flush();
  assert.ok(col.classList.contains('lifted'), 'lifted out');
});


test('in the Word Scroll, a word’s page: English shows the English, then How it’s made opens its card, whose Back comes back', () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(['石头', '山', '山羊'])}});
  g.run("globalThis.__said = []; say = w => __said.push(w); wordPage('山羊', () => { globalThis.__back = true; })");
  const sheet = g.el('#sheet');
  assert.ok(sheet.querySelector('.word .en').hidden && !sheet.querySelector('[data-a=made]'), 'behind English');
  sheet.querySelector('[data-a=en]').click();
  sheet.querySelector('[data-a=made]').click();
  assert.equal(text(sheet.querySelector('.label')), 'How 山羊 is made');
  assert.deepEqual(cols(sheet).map(c => c[1]), ['mpart known', 'mpart', 'mword'], '山, a word you know, green');
  const back = sheet.querySelector('.actions .primary');
  assert.ok(back.hasAttribute('data-b') && text(back) === '◂ Back', 'Back, for A and B');
  g.run('pressA()');
  assert.equal(text(sheet.querySelector('.big')), '山羊', 'back on the word’s page');
  assert.ok(!sheet.querySelector('.word .en').hidden && sheet.querySelector('[data-a=made]'), 'with the English, and How it’s made');
  assert.deepEqual(get(g, '__said'), ['山羊'], 'not said again');
  g.run("wordPage('石头', () => {})");
  g.el('#sheet').querySelector('[data-a=en]').click();
  assert.equal(g.el('#sheet').querySelector('[data-a=made]'), null, 'nothing for a word without it');
});

test('its parts aren’t new words: a card teaches just its own word', () => {
  const {g, sheet} = card(['石头'], '山羊');
  sheet.querySelector('[data-a=made]').click();
  g.flush();   // (it has come together)
  sheet.querySelector('[data-a=ok]').click();
  assert.deepEqual(get(g, "Object.keys(WORDS).filter(w => lvl(w) >= 1)").sort(), ['山羊', '石头'].sort(), '山 and 羊 aren’t caught by seeing them');
});

test('a word that shares a character with a word you know, and has nothing simpler: the two side by side, once you know the other (苹果 and 水果)', () => {
  const first = card(['石头'], '苹果');
  assert.equal(first.sheet.querySelector('[data-a=made]'), null, 'before you know 水果: nothing (苹 means nothing on its own)');
  assert.equal(text(first.sheet.querySelector('.actions .primary')), 'Got it');
  const {g, sheet} = card(['石头', '水果'], '苹果');
  assert.equal(text(sheet.querySelector('.actions .primary')), 'How it’s made ▸', 'once you know 水果');
  g.run('pressA()');
  assert.equal(text(sheet.querySelector('.label')), '苹果 and 水果');
  assert.deepEqual(cols(sheet), [['píngguǒ 苹果 apple', 'mword'], ['shuǐguǒ 水果 fruit', 'mword known']], 'the new word, then the one you know, green');
  assert.deepEqual(sheet.querySelectorAll('.madestage .msame').map(text), ['果', '果'], 'the character they share, lit in each');
  assert.equal(text(sheet.querySelector('.mwhy')), 'Both have 果 guǒ (fruit): an apple is a fruit.');
  assert.ok(sheet.querySelector('.mwhy .msame'), 'lit there too');
  assert.equal(sheet.querySelector('[data-a=again]'), null, 'nothing to watch come together');
  g.run('pressA()');
  assert.equal(g.run('lvl("苹果")'), 1, 'Got it: caught');
  const page = loadGame({dom: true, save: {version: 29, started: true, w: knowing(['石头', '苹果'])}});
  page.run("say = () => {}; wordPage('苹果', () => {})");
  page.el('#sheet').querySelector('[data-a=en]').click();
  assert.equal(page.el('#sheet').querySelector('[data-a=made]'), null, 'its page, before you know 水果: just the English');
  page.run("setSeen('水果'); wordPage('苹果', () => {})");
  page.el('#sheet').querySelector('[data-a=en]').click();
  assert.ok(page.el('#sheet').querySelector('[data-a=made]'), 'and once you do, How it’s made');
});
