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

test('the Word Scroll shows caught words, shadows of heard words, and ？ for the rest', () => {
  const game = loadGame({save: {version: 5, started: true, w: {'石头': {lv: 1, due: 0, ok: 0}}, heard: {'猴子': 3, '石头': 2, '有': 9}}});
  game.run('openScroll()');
  const html = game.el('#sheet').innerHTML, total = game.run('ORDER.length');
  assert.match(html, /<button class="card" data-w="石头"><div class="c">石头<\/div><div class="p">shítou<\/div>/, 'a caught word shows its characters and pinyin');
  const monkey = game.run("picHTML('猴子')");   // its pixel sprite
  assert.ok(html.includes(`<div class="card heard" aria-label="Heard 3 times, not caught yet"><div class="c sil" aria-hidden="true">${monkey}</div><div class="p">heard 3×</div>`), 'a heard word shows its shadow and count');
  assert.ok(!html.includes('猴子') && !html.includes('hóuzi'), 'a heard word is not given away');
  assert.equal(count(html, 'class="pix"'), 1, 'only the heard word shows a picture (its shadow)');
  assert.equal(count(html, 'class="card unseen"'), total - 2, 'every other word shows ？');
});

test('the Word Scroll groups words by category, with how many of each you have caught', () => {
  const game = loadGame({save: {version: 5, started: true, w: {'石头': {lv: 1, due: 0, ok: 0}, '猴子': {lv: 2, due: 0, ok: 1}}}});
  const CATEGORIES = JSON.parse(game.run('JSON.stringify(CATEGORIES)')), WORDS = JSON.parse(game.run('JSON.stringify(WORDS)'));
  game.run('openScroll()');
  const sections = game.el('#sheet').innerHTML.split('<p class="label cathead">').slice(1);
  const used = Object.entries(CATEGORIES).filter(([id]) => Object.values(WORDS).some(d => d.category === id));
  assert.equal(sections.length, used.length, 'one heading for each category the area has words in (and no Heard list yet)');
  used.forEach(([id, name], i) => {
    const words = Object.keys(WORDS).filter(w => WORDS[w].category === id), caught = words.filter(w => ['石头', '猴子'].includes(w));
    assert.ok(sections[i].startsWith(`${name} <span class="catn">${caught.length}/${words.length}</span>`), `heading ${i + 1} should be ${name} ${caught.length}/${words.length}`);
    assert.equal(count(sections[i], 'class="card'), words.length, `${name} should show all its words`);
    for (const w of caught) assert.ok(sections[i].includes(`data-w="${w}"`), `${w} should be under ${name}`);
  });
});

test('the Heard list shows words this area doesn\'t teach, most heard first', () => {
  const game = loadGame({save: {version: 5, started: true, heard: {'是': 4, '有': 9, '猴子': 3, '里': 5}}});
  game.run('openScroll()');
  const html = game.el('#sheet').innerHTML, list = html.slice(html.indexOf('>Heard<'));
  assert.deepEqual([...list.matchAll(/data-h="([^"]+)">\1 <span class="small">(\d+)×/g)].map(m => m[1] + m[2]), ['有9', '里5', '是4']);
  assert.ok(!list.includes('猴子'), 'a word you can collect here goes in its category, not the Heard list');
  const fresh = loadGame();
  fresh.run('openScroll()');
  assert.ok(!fresh.el('#sheet').innerHTML.includes('>Heard<'), 'no Heard list until you have heard something');
});

test('a caught word has a page: picture, pinyin, level, where you found it and an example', () => {
  const game = loadGame({save: {version: 5, started: true, w: {'猴子': {lv: 2, due: 0, ok: 1}}, lines: {'你好！去找老猴子吧！': 1}}});
  game.run("wordPage('猴子', () => {})");
  const html = game.el('#sheet').innerHTML;
  for (const part of [game.run("picHTML('猴子')"), '<div class="big">猴子</div>', '<div class="py">hóuzi</div>', '<div class="en" hidden>monkey</div>',
    'Recognised', 'Found: The little monkey at the bottom of the meadow.'])
    assert.ok(html.includes(part), `the page should include ${part}`);
  // the example is the line you've seen, with this word in bold and its English behind the English button
  assert.match(html, /class="tok learn teach" data-t="猴子"/);
  assert.ok(html.includes('data-t="老"') && html.includes('<div class="sentence-en" hidden>Hello! Go and find the old monkey!</div>'));
});

test('a word\'s example is the first line with it if you haven\'t seen one, and some words have none', () => {
  const game = loadGame({save: {version: 5, started: true, w: {'猴子': {lv: 1, due: 0, ok: 0}, '兔子': {lv: 1, due: 0, ok: 0}}}});
  game.run("wordPage('猴子', () => {})");
  assert.ok(game.el('#sheet').innerHTML.includes('I am a monkey. You are a monkey too!'));
  assert.ok(game.el('#sheet').innerHTML.includes('Caught'));
  game.run("wordPage('兔子', () => {})");
  assert.ok(!game.el('#sheet').innerHTML.includes('Example'), 'no sentence in the area has 兔子');
});
