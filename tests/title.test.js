// The title screen's words: the game's name, as names are shown in the game, and the area's own name.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');

test('the title names the game as names are shown: 小猴子, with pinyin over it, and its meaning, Little Monkey; the area has its own label', () => {
  const game = loadGame({save: {version: 24, started: true, pinyin: true}});
  game.run('toTitle()');
  assert.equal(game.el('#gameName').innerHTML, '<ruby>小<rt>xiǎo</rt></ruby><ruby>猴子<rt>hóuzi</rt></ruby>');
  assert.equal(game.el('#gameEn').textContent, 'Little Monkey', 'the English under it says what the Chinese means (it was the area’s name)');
  const little = JSON.parse(game.run("JSON.stringify(AREA.characters.find(c => c.name && c.name.zh === '小猴子').name)"));
  assert.equal(game.run("GAME_NAME.zh.map(w => w[1]).join(' ')"), little.py, 'the same pinyin as the little monkey’s name in the game');
  assert.equal(game.el('#gameEn').textContent.toLowerCase(), little.en.toLowerCase());
  const area = game.el('#titleArea').innerHTML;
  for (const part of ['花果山', 'Huāguǒ Shān', 'Flower Fruit Mountain']) assert.ok(area.includes(part), `the area’s own label: ${part}`);
  game.run('S.pinyin = false; toTitle()');
  assert.equal((game.el('#gameName').innerHTML.match(/<rt class="hid">/g) || []).length, 2, 'with pinyin switched off, as everywhere');
});
