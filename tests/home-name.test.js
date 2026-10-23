// Chinese is logical, step 3 (23 October 2026): once you know every part of your home's name (花, 山, and the 果 of 水果),
// a message says so, and the sign by your stone sparkles till you read it: it shows how the name is made, on a card like a
// word's. And the first time a goat plays with you, a tip, just before its questions: one character, one syllable.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const knowing = words => Object.fromEntries(words.map(hz => [hz, {lv: 1, due: 0, ok: 0}]));
const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const text = el => el.textContent.replace(/\s+/g, ' ').trim();
const MEADOW = ['石头', '你好', '山', '花', '草', '树'];   // a game in the meadow, which knows 花 and 山
// A game in the meadow, by the sign (homeName: how far it's got with the name), with the messages it shows kept in __msgs
function meadow(words, homeName = 0){
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(words), areas: {1: {elder: 2, homeName}}, pos: {place: 'meadow', x: 11, y: 3, dir: 'up'}}});
  g.run('globalThis.__msgs = []; toast = m => __msgs.push(m)');
  return g;
}
// Whether the sign by your stone (11, 2) sparkles on the map now (each sparkle is drawn at its square, plus a little)
const signSparkles = g => g.run(`(() => { const at = [], was = sparkle; sparkle = (px, py) => at.push([Math.floor(px / T), Math.floor(py / T)]);
  drawSparkles(0, 0, 0); sparkle = was; return at.some(([x, y]) => x === 11 && y === 2); })()`);

test('once you know 花, 山 and 水果, a message says you can read your home’s name, and the sign by your stone sparkles', async () => {
  const before = meadow(MEADOW);
  await before.run('runEvents()');
  assert.equal(before.run('here().homeName'), 0, 'not while the 果 of 水果 is still to find');
  assert.ok(!signSparkles(before));
  const g = meadow([...MEADOW, '水果']);
  await g.run('runEvents()');
  assert.equal(g.run('here().homeName'), 1);
  assert.ok(get(g, '__msgs').includes('You know every part of your home’s name now! Read the sign by your stone, in the meadow.'));
  assert.ok(signSparkles(g), 'the sign sparkles');
  g.run('__msgs.length = 0');
  await g.run('runEvents()');
  assert.deepEqual(get(g, '__msgs'), [], 'the message comes once');
});

test('reading the sign then shows how the name is made, on a card like a word’s: 花 and 山 green, and 果 is also in 水果', async () => {
  const g = meadow([...MEADOW, '水果'], 1);
  g.run('globalThis.__said = []; say = w => __said.push(w); globalThis.__read = interact(11, 2)');
  const sheet = g.el('#sheet');
  assert.equal(text(sheet.querySelector('.label')), 'Your home’s name');
  assert.equal(text(sheet.querySelector('.big')), '花果山');
  assert.equal(text(sheet.querySelector('.py')), 'Huāguǒ Shān');
  assert.equal(text(sheet.querySelector('.word .en')), 'Flower Fruit Mountain', 'a name shows its English, always');
  assert.equal(text(sheet.querySelector('.made')), '花huā flower + 果guǒ fruit + 山shān mountain = a mountain of flowers and fruit '
    + '果 is also in 水果shuǐguǒ (fruit), a word you know.');
  assert.deepEqual(sheet.querySelectorAll('.made .mpart ruby').map(r => r.className), ['known', '', 'known'], '花 and 山 are words you know');
  assert.ok(sheet.querySelector('.pic').innerHTML.length > 0, 'with its picture');
  assert.deepEqual(get(g, '__said'), ['花果山'], 'it says the name');
  sheet.querySelector('[data-a=ok]').click();
  await g.run('__read');
  assert.equal(g.run('here().homeName'), 2);
  assert.ok(!signSparkles(g), 'read: it stops sparkling');
  assert.deepEqual(get(g, 'Object.keys(S.w)').sort(), [...MEADOW, '水果'].sort(), 'a name isn’t a word to learn: nothing is caught');
});

test('until you know every part, the sign just says your home’s name, as before; and the cave’s tablet always does', async () => {
  const g = meadow(MEADOW);
  g.run('globalThis.__lines = []; showDialog = async (face, line) => { __lines.push(line.en); }');
  await g.run('interact(11, 2)');
  assert.deepEqual(get(g, '__lines'), ['Flower Fruit Mountain']);
  assert.equal(g.run('here().homeName'), 0);
  const known = meadow([...MEADOW, '水果'], 2);
  known.run('globalThis.__lines = []; showDialog = async (face, line) => { __lines.push(line.en); }');
  await known.run('ACTIONS.sign([AREA.legend, ...Object.values(AREA.places).map(p => p.legend || {})].flatMap(Object.values).find(t => t.sign))');
  assert.deepEqual(get(known, '__lines'), ['Water Curtain Cave'], 'the tablet has nothing to show how it’s made');
});

// Plays with an animal (its id and word), answering every question right: what happened, in order: 'tip' (with the tip's
// card), 'q' (a question) or 'end' (how it went)
async function play(g, id, hz){
  g.run(`globalThis.__log = []; pictureQ = () => { __log.push('q'); return Promise.resolve(true); };
    infoBox = (who, html) => { __log.push(/Tip/.test(html) ? 'tip ' + html : 'end'); return Promise.resolve(); };
    globalThis.__run = encounter({id: '${id}', hz: '${hz}', img: '', wild: true});`);
  await g.run('__run');
  return get(g, '__log');
}
const PLAYING = ['兔子', '山', '花', '草', '树', '山羊'];   // words to ask about

test('the first time a goat plays with you, a tip comes just before its questions: one character, one syllable', async () => {
  const g = loadGame({save: {version: 29, started: true, w: knowing(PLAYING)}});
  const [tip, ...rest] = await play(g, 'goat', '山羊');
  assert.match(tip, /<p class="label">Tip: one character, one syllable<\/p>/);
  assert.ok(tip.includes('<ruby>山<rt>shān</rt></ruby> <span class="tipplus">+</span> <ruby>羊<rt>yáng</rt></ruby>'), 'each character with its syllable');
  assert.match(tip, /Each Chinese character is one syllable\. Shān, yáng: two syllables, two characters\./);
  assert.ok(rest[0] === 'q' && rest[rest.length - 1] === 'end' && !rest.some(x => x.startsWith('tip')), 'then its questions');
  assert.equal(g.run('S.tips.syllables'), 1, 'the save remembers it');
  assert.ok(!(await play(g, 'goat', '山羊')).some(x => x.startsWith('tip')), 'the next goat just plays');
  const friend = loadGame({save: {version: 29, started: true, w: knowing(PLAYING), met: ['goat'], friends: ['goat']}});
  assert.match((await play(friend, 'goat', '山羊'))[0], /^tip /, 'a game that met the goat before the tip gets it next time');
});

test('the tip is the goat’s: other animals just play', async () => {
  const g = loadGame({save: {version: 29, started: true, w: knowing(PLAYING)}});
  assert.ok(!(await play(g, 'rabbit', '兔子')).some(x => x.startsWith('tip')));
  assert.equal(g.run('S.tips.syllables'), undefined);
});

test('the tip’s card shows the goat, and OK goes on to its questions', async () => {
  const g = loadGame({dom: true, save: {version: 29, started: true, w: knowing(PLAYING)}});
  g.run("globalThis.__asked = 0; pictureQ = () => { __asked++; return new Promise(() => {}); }; encounter({id: 'goat', hz: '山羊', img: portrait('goat'), wild: true})");
  await new Promise(r => setImmediate(r));
  const sheet = g.el('#sheet');
  assert.ok(sheet.querySelector('.who .portrait'), 'the goat, by the tip');
  assert.equal(text(sheet.querySelector('.label')), 'Tip: one character, one syllable');
  assert.equal(text(sheet.querySelector('.tipex')), '山shān + 羊yáng');
  assert.equal(g.run('__asked'), 0, 'no question yet');
  sheet.querySelector('[data-a=ok]').click();
  await new Promise(r => setImmediate(r));
  assert.equal(g.run('__asked'), 1, 'OK: the first question');
});
