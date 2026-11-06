// Who's speaking (decided 6 November 2026, after mock-ups: it wasn't always clear who was talking, in a crowd): in the
// speech box, a name plate, their face (head and shoulders) in a circle and their name, in one thin pale-gold outline;
// on the map, a small gold arrow over their head in place of their ! or ?, and a faint ring at their feet, only while
// their line is up.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));

test('the speech box shows the speaker’s name plate: their face in a circle, and their name', () => {
  const g = loadGame({dom: true, save: {version: 34, started: true, w: {}}});
  g.run("mode = 'play'; placePlayer(); sayLine(speaker('elder'), {t: ['你好', '！'], en: 'Hello!'}, {})");
  const head = g.el('#talk').querySelector('.talkhead');
  assert.ok(head.querySelector('.speaker .face img.bust'), 'their face, cropped to head and shoulders, in a circle');
  assert.equal(head.querySelector('.portrait'), null, 'not the little whole figure');
  assert.match(head.querySelector('.speaker').textContent, /老猴子/);
});

test('the gold arrow is over whoever’s speaking only while their line is up, and none once the box closes', async () => {
  const g = loadGame({dom: true, save: {version: 34, started: true, w: {}}});
  g.run("mode = 'play'; placePlayer(); globalThis.__elder = ALL_NPCS.find(n => n.id === 'elder')");
  assert.equal(get(g, 'speakingNow(__elder)'), false, 'nobody yet');
  g.run("sayLine(speaker('elder'), {t: ['你好', '！'], en: 'Hello!'}, {})");
  assert.equal(get(g, 'speakingNow(__elder)'), true, 'the old monkey, while his line is up');
  g.run('talkNext = null; closeTalk()');
  await new Promise(r => setTimeout(r, 5)); g.flush && g.flush();
  assert.equal(get(g, 'speakingNow(__elder)'), false, 'and not once it has closed');
});
