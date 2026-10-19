// The Word Scroll: words you hear in sentences are counted, and words you've heard but not
// caught show as shadows of their picture with the count, without giving the word away.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const heardIn = game => JSON.parse(game.run('JSON.stringify(S.heard)'));
const count = (text, part) => text.split(part).length - 1;

test('showing a line counts each word in it as heard, every time', () => {
  const game = loadGame();
  game.run("showDialog('🐒', L.iam)");   // 我 是 猴子 。 你 也 是 猴子 ！
  assert.deepEqual(heardIn(game), {'我': 1, '是': 2, '猴子': 2, '你': 1, '也': 1});
  game.run("showDialog('🐒', L.iam)");
  assert.deepEqual(heardIn(game), {'我': 2, '是': 4, '猴子': 4, '你': 2, '也': 2});
  assert.equal(JSON.parse(game.storage.get('xiaohouzi-v2')).heard['猴子'], 4, 'the counts should be saved');
});

test('opening the Story Scroll counts every word in the story once', () => {
  const game = loadGame();
  const story = JSON.parse(game.run('JSON.stringify(STORY)'));
  game.run('storyScroll()');
  const want = {};
  for (const s of story) for (const w of s.t) if (!'。，！？'.includes(w)) want[w] = (want[w] || 0) + 1;
  assert.deepEqual(heardIn(game), want);
});

// Every category's page of the Word Scroll, one after another.
const allCategories = game => game.run("scrollTabs().filter(([id]) => CATEGORIES[id]).map(([id]) => scrollPage(id)).join('')");

test('the Word Scroll shows caught words, shadows of heard words, and ？ for the rest', () => {
  const game = loadGame({save: {version: 5, started: true, w: {'石头': {lv: 1, due: 0, ok: 0}}, heard: {'猴子': 3, '石头': 2, '有': 9}}});
  const html = allCategories(game), total = game.run('ORDER.length + PHRASES.length');   // words and phrases
  const stone = game.run("picHTML('石头')"), monkey = game.run("picHTML('猴子')");   // their pixel sprites
  assert.ok(html.includes(`<button class="card" data-w="石头" data-label="Open"><div class="c" aria-hidden="true">${stone}</div><div class="hz">石头</div><div class="p">shítou</div>`), 'a caught word shows its picture, characters and pinyin');
  assert.ok(html.includes(`<div class="card heard" aria-label="Heard 3 times, not caught yet"><div class="c sil" aria-hidden="true">${monkey}</div><div class="p">heard 3×</div>`), 'a heard word shows its shadow and count');
  assert.ok(!html.includes('猴子') && !html.includes('hóuzi'), 'a heard word is not given away');
  assert.equal(count(html, 'class="pix"'), 2, 'only the caught word and the heard word (its shadow) show a picture');
  assert.equal(count(html, 'class="card unseen"'), total - 2, 'every other word shows ？');
});

test('a caught word without a picture shows its characters in the grid', () => {
  const game = loadGame({save: {version: 8, started: true, w: {'我': {lv: 1, due: 0, ok: 0}}}});
  assert.ok(allCategories(game).includes('<button class="card" data-w="我" data-label="Open"><div class="c hz">我</div><div class="p">wǒ</div>'));
});

test('the Word Scroll has a tab for each category, with how many of its words you have caught', () => {
  const game = loadGame({save: {version: 5, started: true, w: {'石头': {lv: 1, due: 0, ok: 0}, '猴子': {lv: 2, due: 0, ok: 1}}}});
  const CATEGORIES = JSON.parse(game.run('JSON.stringify(CATEGORIES)')), WORDS = JSON.parse(game.run('JSON.stringify(WORDS)'));
  const used = Object.entries(CATEGORIES).filter(([id]) => Object.values(WORDS).some(d => d.category === id));
  assert.deepEqual(JSON.parse(game.run('JSON.stringify(scrollTabs())')), [...used.map(([id, c]) => [id, c.tab]), ['today', 'Today']],
    'one tab for each category the area has words in, then Today (and no Heard tab yet)');
  game.run('openScroll()');
  assert.ok(game.el('#sheet').innerHTML.includes(`data-tab="${used[0][0]}" aria-selected="true"`), 'it opens at the first tab');
  for (const [id, c] of used){
    game.run(`openScroll(null, 0, '${id}')`);
    const html = game.el('#sheet').innerHTML, page = html.slice(html.indexOf('<p class="label cathead">'));
    const words = Object.keys(WORDS).filter(w => WORDS[w].category === id), caught = words.filter(w => ['石头', '猴子'].includes(w));
    assert.ok(html.includes(`data-tab="${id}" aria-selected="true"`), `the ${c.tab} tab is chosen`);
    assert.ok(page.startsWith(`<p class="label cathead">${c.name} <span class="catn">${caught.length}/${words.length}</span>`), `${c.tab} should be headed ${c.name} ${caught.length}/${words.length}`);
    assert.equal(count(page, 'class="card'), words.length, `${c.tab} should show all its words`);
  }
});

test('the Word Scroll opens again at the tab you left it on; left and right switch tabs', () => {
  const game = loadGame({dom: true, save: {version: 8, started: true}});
  const sheet = game.el('#sheet'), chosen = () => sheet.querySelector('.tab[aria-selected="true"]').dataset.tab;
  game.run("openScroll(null, 0, 'food')");
  game.run('closeCard(); openScroll()');
  assert.equal(chosen(), 'food');
  game.run("navFocus('right')");
  assert.equal(chosen(), 'nature');
  game.run("navFocus('left'); navFocus('left')");
  assert.equal(chosen(), 'animals');
  sheet.querySelector('.tab[data-tab="today"]').click();
  assert.equal(chosen(), 'today', 'tapping a tab opens it');
});

test('the Today tab shows the words you met today, and how many are due', () => {
  const game = loadGame({save: {version: 8, started: true, w: {'石头': {lv: 1, due: 0, ok: 0}, '我': {lv: 2, due: 9e15, ok: 1}}}});
  game.run("S.today = {d: todayKey(), ids: ['石头', '我']}");
  game.run("openScroll(null, 0, 'today')");
  const html = game.el('#sheet').innerHTML;
  assert.ok(html.includes('Today’s words <span class="catn">2</span>'));
  assert.ok(html.includes('data-w="石头"') && html.includes('data-w="我"'), 'both words are shown');
  assert.ok(html.includes('1 word is due for review within a day'), '石头 is due; 我 is not');
  game.run("S.today = {d: 'long ago', ids: ['石头']}; openScroll(null, 0, 'today')");
  assert.ok(game.el('#sheet').innerHTML.includes('You haven’t met any words yet today.'));
});

test('the Heard tab shows words this area doesn\'t teach, most heard first', () => {
  const game = loadGame({save: {version: 5, started: true, heard: {'是': 4, '有': 9, '猴子': 3, '里': 5}}});
  game.run("openScroll(null, 0, 'heard')");
  const html = game.el('#sheet').innerHTML, list = html.slice(html.indexOf('>Heard<'));
  assert.deepEqual([...list.matchAll(/data-h="([^"]+)" data-label="Hear it"><ruby>\1<rt[^>]*>([^<]+)<\/rt><\/ruby> <span class="small">(\d+)×/g)].map(m => m[1] + m[2] + m[3]),
    ['有yǒu9', '里lǐ5', '是shì4'], 'with pinyin, most heard first');
  assert.ok(!list.includes('猴子'), 'a word you can collect here goes in its category, not the Heard list');
  const fresh = loadGame();
  fresh.run('openScroll()');
  assert.ok(!fresh.el('#sheet').innerHTML.includes('data-tab="heard"'), 'no Heard tab until you have heard something');
});

test('a caught word has a page: picture, pinyin, level, where you found it and an example', () => {
  const game = loadGame({save: {version: 5, started: true, w: {'猴子': {lv: 2, due: 0, ok: 1}}, lines: {'你好！去找老猴子吧！': 1}}});
  game.run("wordPage('猴子', () => {})");
  const html = game.el('#sheet').innerHTML;
  for (const part of [game.run("picHTML('猴子')"), '<div class="big">猴子</div>', '<div class="py">hóuzi</div>', '<div class="en" hidden>monkey</div>',
    'Recognised', 'Found: The little monkey, playing in the south meadow.'])
    assert.ok(html.includes(part), `the page should include ${part}`);
  // the example is the line you've seen, with this word in bold and its English behind the English button
  assert.match(html, /class="tok learn teach" data-t="猴子"/);
  assert.ok(html.includes('data-t="老"') && html.includes('<div class="sentence-en" hidden>Hello! Go and find the old monkey!</div>'));
});

test('a word\'s example is the first line with it if you haven\'t seen one, or one written for it, or a sentence you complete', () => {
  const game = loadGame({save: {version: 5, started: true, w: {'猴子': {lv: 1, due: 0, ok: 0}, '兔子': {lv: 1, due: 0, ok: 0}}}});
  game.run("wordPage('猴子', () => {})");
  assert.ok(game.el('#sheet').innerHTML.includes('I am a monkey. You are a monkey too!'));
  assert.ok(game.el('#sheet').innerHTML.includes('Caught'));
  game.run("wordPage('兔子', () => {})");
  assert.ok(game.el('#sheet').innerHTML.includes('There is a rabbit in the grass.'), 'no line has 兔子, so its page shows the example written for it');
  game.run("S.w['头带'] = {lv: 1, due: 0, ok: 0}; wordPage('头带', () => {})");
  assert.ok(game.el('#sheet').innerHTML.includes('I want the headband.'), '头带 is only in a sentence you complete, so that is its example');
});

test('in the Word Scroll, up and down step through the words one by one, A opens the chosen one, and Back returns to it', () => {
  const game = loadGame({dom: true, save: {version: 27, started: true, w: Object.fromEntries(['石头', '山', '花'].map(w => [w, {lv: 1, due: 0, ok: 0}]))}});
  const sheet = game.el('#sheet'), chosen = () => game.run('(c => c && (c.dataset.w || c.dataset.a))(chosenBtn())');
  game.run("mode = 'play'; openScroll(null, 0, 'nature')");
  assert.equal(chosen(), 'ok', 'Back to start with');
  game.run("navFocus('down')"); assert.equal(chosen(), '石头', 'down: the first word');
  assert.equal(game.run('buttonLabels(0)[0]'), 'Open', 'and A says Open');
  game.run("navFocus('up')"); assert.equal(chosen(), '石头', 'up from the first word stays put');
  game.run("navFocus('down')"); assert.equal(chosen(), '山', 'down: the next word');
  game.run('pressA()');
  assert.match(sheet.textContent, /shān/, 'A opens its page');
  sheet.querySelector('[data-a=ok]').click();
  assert.equal(chosen(), '山', 'Back from its page: still on 山');
  assert.ok(sheet.querySelector('.tab[aria-selected="true"][data-tab="nature"]'), 'on the same tab');
  for (let i = 0; i < 20; i++) game.run("navFocus('down')");
  assert.equal(chosen(), 'ok', 'past the last word: Back');
  game.run("navFocus('up')"); assert.equal(chosen(), '花', 'up from Back: the last word you’ve caught');
});

test('the word being taught has green pinyin too, like its characters', () => {
  const css = require('node:fs').readFileSync(require('node:path').join(__dirname, '../css/game.css'), 'utf8');
  assert.match(css, /\.tok\.teach rt\{color:var\(--jade\)/);
  const game = loadGame();
  assert.match(game.run("lineHTML(['我', '是', '猴子', '。'], '猴子')"), /class="tok learn teach" data-t="猴子"><ruby>猴子<rt/);
});
