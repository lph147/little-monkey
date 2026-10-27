// The little birds that land near you (decided 27 October 2026, as the flowers are): once you know the word for a bird
// (鸟), each one is a colour, and A at it shows it, such as 黄色的鸟 (a yellow bird), once you know the colour too; till
// then, 鸟's card with a picture of that colour. Before you know 鸟, they're all blue, as 鸟's own picture.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const COLOURS = ['红色', '黄色', '蓝色', '白色', '黑色', '绿色', '棕色', '橙色', '粉色'];
function game(words = []){
  const w = Object.fromEntries(['石头', ...words].map(x => [x, {lv: 1, ok: 2}]));
  const g = loadGame({dom: true, save: {version: 31, started: true, w, areas: {1: {chapter: 1, elder: 2, home: 2, cave: 6, story: true}}, pos: {place: 'homeGround', x: 9, y: 13, dir: 'down'}}});
  g.run("mode = 'play'; save = () => {}; globalThis.__cards = []; placePlayer()");
  g.run("showNotice = async (w, o = {}) => { __cards.push(['notice', w, o.pic || null]); }; showPicked = async (f, note, o = {}) => { __cards.push(['picked', f.zh, f.en, o.label, o.pic]); }");
  return g;
}
const land = g => get(g, "(() => { birds.length = 0; nextBird = 0; drawBirds(camX(), Math.max(0, pl.y*T - 4*T), 1000); return birds.map(bd => bd.colour || null); })()");

test('before you know 鸟, the birds that land are all blue, 鸟’s own picture; after, each is one of the area’s colours', () => {
  const before = game();
  for (let i = 0; i < 5; i++) assert.deepEqual(land(before), [null], 'no colour: drawn as the blue bird');
  const after = game(['鸟']);
  const seen = new Set();
  for (let i = 0; i < 60; i++) seen.add(land(after)[0]);
  assert.ok([...seen].every(c => COLOURS.includes(c)), 'one of the nine colours');
  assert.ok(seen.size >= 5, 'and not always the same one');
  assert.deepEqual(get(after, 'AREA.birds.colours'), COLOURS, 'every colour the school teaches');
});

test('A at a bird: 鸟 till you know its colour, with a picture of that colour; then, such as 黄色的鸟 (a yellow bird)', async () => {
  const look = async (g, colour) => { g.run(`__cards.length = 0; birds.length = 0; birds.push({tx: 9, ty: 14, x: 9*T + 4, y: 14*T + 6, t0: 0, until: 1e9, from: 1, colour: ${colour ? `'${colour}'` : 'undefined'}})`);
    await g.run('interact(9, 14)'); assert.ok(get(g, 'birds[0].off'), 'it flies off after'); return get(g, '__cards')[0]; };
  assert.deepEqual(await look(game(), null), ['notice', '鸟', null], 'a blue bird, before you know 鸟: the word’s own card');
  assert.deepEqual(await look(game(['鸟']), '黄色'), ['notice', '鸟', '黄色 的 鸟'], 'before you know yellow');
  assert.deepEqual(await look(game(['鸟', '黄色']), '黄色'), ['picked', '黄色 的 鸟', 'A yellow bird', 'You see', '黄色 的 鸟']);
  assert.deepEqual(await look(game(['鸟', '橙色']), '橙色'), ['picked', '橙色 的 鸟', 'An orange bird', 'You see', '橙色 的 鸟']);
  assert.deepEqual(await look(game(['鸟', '蓝色']), '蓝色'), ['picked', '蓝色 的 鸟', 'A blue bird', 'You see', '鸟'], 'a blue one has 鸟’s own picture');
});

test('each colour of bird has its own picture and its own look on the map, and is said (voices, CHINESE.md)', () => {
  const g = game();
  for (const c of COLOURS.filter(c => c !== '蓝色')){
    assert.ok(get(g, `!!PICTURES['${c} 的 鸟']`), `${c} 的 鸟 has a picture`);
    assert.ok(get(g, `birdSprite('${c}') !== SPR.bird`), `and a bird of its colour on the map`);
  }
  assert.ok(get(g, "birdSprite('蓝色') === SPR.bird && birdSprite(undefined) === SPR.bird"), 'blue is the bird as it always was');
  const said = get(g, 'COLOURED().map(c => c.zh)');
  for (const c of COLOURS) assert.ok(said.includes(`${c} 的 鸟`), `${c} 的 鸟 is said`);
});
