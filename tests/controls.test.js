// Controls (Settings' Controls, decided 15 November 2026, to try it): the console, a Game Boy Advance held sideways, as it
// always was; or full screen, the map edge to edge with the same buttons over it, in the game's colours or as glass. Kept
// for the device, not for each game. Full screen, the map shows as many squares as fill the phone; the title screen and
// the scenes, drawn for 15 by 10, are as big as fits between the buttons (fit and fitFull in js/main.js).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');
const {pixelCanvas} = require('./pixel-canvas');

const KEY = 'xiaohouzi-v2-controls';
const get = (g, expr) => JSON.parse(g.run(`JSON.stringify(${expr})`));
const view = g => get(g, '[VW, VH, buf.width, buf.height]');
const classes = g => String(g.el('html').getAttribute('class') || '').split(/\s+/).filter(Boolean);
const AREA1 = {version: 37, started: true, pos: {place: 'meadow', x: 8, y: 6, dir: 'up'}};
// A game on a phone of this size (an iPhone 16 held sideways: 852 by 393), with these controls, walking about.
function phone(controls, {w = 852, h = 393, save = AREA1, canvas = null, dom = false} = {}){
  const g = loadGame({html: true, dom, save, canvas, storage: controls ? {[KEY]: controls} : {}});
  g.run(`innerWidth = ${w}; innerHeight = ${h}; mode = 'play'; save = () => {}; placePlayer(); fit()`);
  return g;
}

test('the console is the default: 15 columns by 10 rows, as always, and no buttons over the map', () => {
  const g = phone(null);
  assert.equal(g.run('controlsNow'), 'console');
  assert.deepEqual(view(g), [15, 10, 240, 160]);
  assert.ok(!classes(g).includes('overlay') && !classes(g).includes('glass'));
});

test('full screen on a phone held sideways: 10 rows and as many columns as fill it, the screen the window’s size', () => {
  const g = phone('overlay');
  assert.deepEqual(view(g), [347 / 16, 10, 347, 160], 'about 22 columns (852 / 393 × 10), in whole pixels');
  assert.equal(g.el('#screen').style.width, '852px');
  assert.equal(g.el('#screen').style.height, '393px');
  assert.ok(classes(g).includes('overlay'), 'the buttons over the map (css/game.css)');
  assert.ok(!classes(g).includes('glass'), 'in the game’s colours');
  assert.deepEqual(['left', 'top', 'width', 'height'].map(k => g.el('#screenWrap').style[k]), ['0px', '0px', '852px', '393px']);
});

test('full screen, the title screen and the scenes are 15 by 10, as big as fits between the two sets of buttons', () => {
  const g = phone('overlay');
  g.run("mode = 'title'; fit()");
  assert.deepEqual(view(g), [15, 10, 240, 160]);
  // 852 less two buttons' room (150 each) leaves 552 across, so 368 tall (393 is room enough), in the middle
  assert.deepEqual(['left', 'top', 'width', 'height'].map(k => g.el('#screenWrap').style[k]), ['150px', '13px', '552px', '368px']);
  assert.equal(g.el('#screen').style.width, '552px');
  const text = g.run("document.documentElement.style.fontSize");
  g.run("mode = 'play'; fit()");
  assert.deepEqual(view(g), [347 / 16, 10, 347, 160], 'and the map, wide again, once it ends');
  assert.equal(g.run("document.documentElement.style.fontSize"), text, 'the text the same size on the map, so it never jumps as a scene ends');
});

test('each frame checks the shape: a scene starting full screen makes it 15 by 10, and ending makes it wide again', () => {
  const g = phone('overlay');
  g.run("mode = 'intro'"); g.runFrame();
  assert.deepEqual(view(g), [15, 10, 240, 160]);
  g.run("mode = 'play'"); g.runFrame();
  assert.equal(g.run('VW'), 347 / 16);
});

test('a nearly square screen (a folding phone opened out) keeps 15 columns and shows more rows', () => {
  const g = phone('overlay', {w: 832, h: 748});
  assert.deepEqual(view(g), [15, 13.5, 240, 216]);
});

test('a very wide window shows at most 24 columns, with dark either side', () => {
  const g = phone('overlay', {w: 2000, h: 500});
  assert.deepEqual(view(g), [24, 10, 384, 160]);
  assert.equal(g.el('#screen').style.width, '1200px');
  assert.equal(g.el('#screen').style.height, '500px');
});

test('glass: full screen too, with see-through white buttons', () => {
  const g = phone('glass');
  assert.equal(g.run('VW'), 347 / 16);
  assert.ok(classes(g).includes('overlay') && classes(g).includes('glass'));
});

test('Settings’ Controls goes round the console, full screen and glass, kept for this device, not in the game’s save', () => {
  const g = phone(null, {dom: true, save: {version: 8, started: true}});
  const sheet = g.el('#sheet'), button = () => sheet.querySelector('[data-m="controls"]');
  g.run('openSettings()');
  assert.match(button().textContent, /Controls\s*Console/);
  button().click();
  assert.match(button().textContent, /Full screen/);
  assert.equal(g.storage.get(KEY), 'overlay');
  assert.equal(g.run('VW'), 347 / 16, 'the screen changes straight away');
  assert.equal(g.run('document.activeElement.dataset.m'), 'controls', 'and the button stays chosen');
  button().click();
  assert.match(button().textContent, /Glass/);
  assert.ok(classes(g).includes('glass'));
  button().click();
  assert.match(button().textContent, /Console/);
  assert.deepEqual(view(g), [15, 10, 240, 160], 'back to the console');
  assert.ok(!classes(g).includes('overlay'));
  assert.deepEqual(['left', 'top', 'width', 'height'].map(k => g.el('#screenWrap').style[k]), ['', '', '', ''], 'the console’s own layout places the screen again');
  assert.ok(!/controls/i.test(g.run('JSON.stringify(S)')), 'nothing about it in the game’s save');
});

test('full screen, the map is drawn right across the screen, to its far edge', () => {
  const g = phone('overlay', {canvas: pixelCanvas});
  g.run('drawWorld(performance.now())');
  const far = get(g, '[...b.getImageData(346, 80, 1, 1).data]'), void_ = [0x1E, 0x2B, 0x26, 255];
  assert.equal(far[3], 255, 'its last column drawn');
  assert.notDeepEqual(far, void_, 'and it’s the meadow there, not the dark round a place');
});

test('full screen, every place in both areas is drawn without trouble, wide or tall, by day and by night', () => {
  for (const [w, h] of [[852, 393], [832, 748]]){
    for (const save of [AREA1, {version: 37, started: true, area: 2, areas: {2: {chapter: 2, home2: 1}}, pos: {place: 'ffmMeadow', x: 8, y: 6, dir: 'up'}}]){
      const g = phone('overlay', {w, h, save});
      g.run(`(() => { for (const id of Object.keys(PLACES).filter(id => PLACES[id].map)){
        enterPlace(id); placePlayer();
        for (const f of [.3, .9]){ if (S.clock) S.clock.t = DAY_MS * f; drawWorld(performance.now()); }
      } })()`);
    }
  }
});
