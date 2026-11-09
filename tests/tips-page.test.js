// The menu's Tips page (decided 9 November 2026, the four ideas plan): every tip you've had, to read again. About Chinese
// first, each opening its card again (the goat's drum, 二 or 两?, the words that sound alike), then How to play: each
// button tip you've had, its button drawn, and How to play ▸, the whole guide, which was in Settings. Only what you've had.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knowing = words => Object.fromEntries(words.map(w => [w, {lv: 1, due: 0, ok: 0}]));
function game(save){
  const g = loadGame({dom: true, save: {version: 42, started: true, ...save}});
  g.run("mode = 'play'; placePlayer(); globalThis.__said = []; say = w => { __said.push(w); }");
  return {g, sheet: g.el('#sheet'), run: code => g.run(code)};
}
const rows = sheet => sheet.querySelectorAll('.tipsrow').map(r => r.querySelector('.tipstxt').textContent.replace(/\s+/g, ' ').trim());

test('the menu’s Tips button, between Settings and Save, opens the Tips page; Back comes back to it', () => {
  const {sheet, run} = game({tips: {walk: 1}});
  run('openMenu()');
  const row = sheet.querySelector('.menurow').querySelectorAll('[data-m]').map(b => b.dataset.m);
  assert.deepEqual(row, ['settings', 'tips', 'save']);
  sheet.querySelector('[data-m="tips"]').click();
  assert.match(sheet.querySelector('.label').textContent, /Tips/);
  run('pressB()');
  assert.equal(run('document.activeElement && document.activeElement.dataset.m'), 'tips', 'Back: the menu, on Tips');
});

test('only the tips you’ve had: a new player has just the first, and the page says more come as you play', () => {
  const {sheet, run} = game({tips: {walk: 1}});
  run('tipsPage(() => {})');
  assert.match(sheet.textContent, /Every tip you’ve had, to read again\. More come as you play\./);
  assert.equal(sheet.querySelector('.tipsrow[data-tip]'), null, 'no tips about Chinese yet');
  assert.deepEqual(rows(sheet), ['Hold an arrow to walk. Tap it to turn on the spot.']);
  assert.ok(sheet.querySelector('.tipsrow .tkey.pad'), 'with the D-pad drawn');
});

test('the tips about Chinese: the drum card once you’ve had it, 二 or 两? once you know both, each pair of words that sound alike', () => {
  const {sheet, run} = game({tips: {walk: 1, talk: 1, syllables: 1, run: 1}, w: knowing(['山', '羊', '山羊', '二', '两', '河', '喝'])});
  run('tipsPage(() => {})');
  const chinese = sheet.querySelectorAll('.tipsrow[data-tip]').map(r => [r.querySelector('.tipskey').textContent, r.querySelector('b').textContent]);
  assert.deepEqual(chinese, [['山羊shānyáng', 'One character, one syllable'], ['二 两èr · liǎng', '二 or 两?'], ['河 喝hé · hē', 'Sounds like: 河 and 喝']]);
  assert.deepEqual(rows(sheet).slice(3), ['Hold an arrow to walk. Tap it to turn on the spot.', 'Press A to talk to someone, or to look at what you’re facing.', 'Hold B as you walk, to run.'], 'then the button tips you’ve had');
});

test('each tip about Chinese opens its card again, and Back comes back to it', async () => {
  const {sheet, run} = game({tips: {walk: 1, syllables: 1}, w: knowing(['山', '羊', '山羊', '二', '两', '河', '喝'])});
  run('tipsPage(() => {})');
  sheet.querySelector('.tipsrow[data-tip="tip-syllables"]').click();
  assert.ok(sheet.querySelector('.drum'), 'the drum card: tap it to hear each syllable again');
  sheet.querySelector('.drum').click(); sheet.querySelector('.drum').click();
  assert.deepEqual(JSON.parse(run('JSON.stringify(__said)')), ['山', '羊']);
  sheet.querySelector('[data-a=ok]').click();
  await new Promise(r => setImmediate(r));
  assert.match(sheet.querySelector('.label').textContent, /Tips/, 'OK: the Tips page again');
  assert.equal(run('document.activeElement.dataset.tip'), 'tip-syllables', 'on the tip you opened');
  sheet.querySelector('.tipsrow[data-tip="side-二两"]').click();
  assert.equal(sheet.querySelector('.label').textContent, '二 or 两?', 'the side by side card');
  run('pressB()');
  assert.match(sheet.querySelector('.label').textContent, /Tips/);
  sheet.querySelector('.tipsrow[data-tip="sounds-河喝"]').click();
  assert.ok(sheet.querySelector('.sa-side[data-w="河"]') && sheet.querySelector('.sa-side[data-w="喝"]'), 'the sounds alike card');
  run('pressB()');
  assert.match(sheet.querySelector('.label').textContent, /Tips/);
});

test('How to play ▸ opens the whole guide (no longer in Settings), and its last page comes back to Tips', () => {
  const {sheet, run} = game({tips: {walk: 1}});
  run('tipsPage(() => {})');
  sheet.querySelector('[data-a=howto]').click();
  assert.equal(sheet.querySelector('.label').textContent, 'How to play · 1 of 3');
  sheet.querySelector('[data-a=next]').click(); sheet.querySelector('[data-a=next]').click(); sheet.querySelector('[data-a=next]').click();
  return new Promise(r => setImmediate(r)).then(() => {
    assert.match(sheet.querySelector('.label').textContent, /Tips/);
    run('openSettings()');
    assert.equal(sheet.querySelector('[data-m="howto"]'), null, 'not in Settings');
  });
});

test('every tip about the buttons is on the page once had, and each one the game shows is in its list', () => {
  const {run} = game({});
  const ids = JSON.parse(run('JSON.stringify(TIP_PAGE.flatMap(t => t.ids))'));
  for (const id of JSON.parse(run('JSON.stringify(Object.keys(TIPS))'))) assert.ok(ids.includes(id), `${id} is listed on the Tips page`);
});
