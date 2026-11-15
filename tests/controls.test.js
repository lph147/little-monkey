// Your screen (Settings' Screen, decided 15 November 2026; each player chooses, on a card the first time on a phone or
// tablet): the console, a Game Boy Advance held sideways, as it always was; or edge to edge, the map filling the phone with
// the same buttons over it, in the game's colours or as glass. Kept for the device, not for each game.
// Edge to edge, the map shows as many squares as fill the phone; the title screen and the scenes, drawn for 15 by 10, are
// as big as fits between the buttons (fit and fitFull in js/main.js).
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

// The screen card, opened on a pretend phone (touch) or computer: tile(c) is its picture of c, and chosen() what it's on.
const tile = (g, c) => g.el('#sheet').querySelector(`.scrtile[data-scr="${c}"]`);
const chosen = g => g.el('#sheet').querySelector('.scrtile.sel').dataset.scr;
const cardOpen = g => !g.run('modal.hidden') && /Choose your screen/.test(g.el('#sheet').textContent);

test('the first time the game opens on a phone or tablet, a card over the title screen asks which screen', () => {
  const g = loadGame({html: true, dom: true, touch: true});
  assert.equal(g.run('mode'), 'title');
  assert.ok(cardOpen(g), 'Choose your screen');
  assert.equal(chosen(g), 'console', 'the console chosen to start with');
  assert.deepEqual(['console', 'overlay', 'glass'].map(c => tile(g, c).querySelector('b').textContent), ['Console', 'Edge to edge', 'Glass']);
  assert.match(g.el('#sheet').textContent, /change it any time: MENU ▸ Settings ▸ Screen/, 'and where to change it');
  assert.equal(g.el('#sheet').querySelector('[data-a=back]'), null, 'nothing to go back to: you choose one');
  assert.equal(g.run('document.activeElement.dataset.scr'), 'console', 'the D-pad starts on the one chosen');
});

test('the screen card isn’t there on a computer, once one’s chosen, or when the page loads again to play', () => {
  assert.ok(!cardOpen(loadGame({html: true, dom: true})), 'a computer: the console, and Settings has it');
  assert.ok(!cardOpen(loadGame({html: true, dom: true, touch: true, storage: {[KEY]: 'console'}})), 'chosen already, even the console');
  const g = loadGame({html: true, dom: true, touch: true, save: AREA1, session: {'xiaohouzi-v2-go': JSON.stringify({area: 1, slot: 1, action: 'continue'})}});
  assert.equal(g.run('mode'), 'play');
  assert.ok(!cardOpen(g), 'going on with a game: never in the way');
});

test('tapping a screen tries it behind the card, without keeping it, and Play like this keeps it', () => {
  const g = loadGame({html: true, dom: true, touch: true});
  g.run('innerWidth = 852; innerHeight = 393; fit()');
  tile(g, 'overlay').click();
  assert.equal(chosen(g), 'overlay');
  assert.ok(classes(g).includes('overlay'), 'the buttons over the screen straight away');
  assert.match(g.el('#sheet').textContent, /The map fills your phone, so you see more of it/);
  assert.equal(g.storage.get(KEY), undefined, 'only trying it: loaded again, it would ask again');
  assert.equal(g.run('document.activeElement.dataset.scr'), 'overlay', 'and it stays chosen, for the D-pad');
  tile(g, 'glass').click();
  assert.ok(classes(g).includes('glass'));
  g.el('#sheet').querySelector('[data-a=keep]').click();
  assert.equal(g.storage.get(KEY), 'glass', 'kept for this device');
  assert.equal(g.run('modal.hidden'), true);
  assert.equal(g.run('mode'), 'title', 'back to the title screen, in it');
  assert.ok(!/glass|overlay/.test(g.run('JSON.stringify(S)')), 'nothing about it in the game’s save');
});

test('on a phone or tablet, the title screen says your screen, and tapping it opens the card again, with Back', () => {
  const g = loadGame({html: true, dom: true, touch: true, storage: {[KEY]: 'overlay'}});
  assert.match(g.el('#titleText').innerHTML, /Screen: Edge to edge ▸/);
  g.el('#screenBtn').onclick();
  assert.ok(cardOpen(g));
  assert.equal(chosen(g), 'overlay');
  tile(g, 'console').click();
  assert.ok(!classes(g).includes('overlay'), 'trying the console');
  g.el('#sheet').querySelector('[data-a=back]').click();
  assert.ok(classes(g).includes('overlay'), 'Back puts back the one you had');
  assert.equal(g.storage.get(KEY), 'overlay');
  assert.match(g.el('#titleText').innerHTML, /Screen: Edge to edge/);
  assert.doesNotMatch(loadGame({html: true, dom: true}).el('#titleText').innerHTML, /Screen:/, 'not on a computer');
});

test('Settings’ Screen opens the same card, and Done keeps what you chose, back in Settings', () => {
  const g = phone(null, {dom: true, save: {version: 8, started: true}});
  const sheet = g.el('#sheet'), button = () => sheet.querySelector('[data-m="screen"]');
  g.run('openSettings()');
  assert.match(button().textContent, /Screen\s*Console/);
  button().click();
  assert.ok(cardOpen(g));
  tile(g, 'overlay').click();
  assert.equal(g.run('VW'), 347 / 16, 'the screen changes straight away');
  sheet.querySelector('[data-a=keep]').click();
  assert.equal(g.storage.get(KEY), 'overlay');
  assert.match(button().textContent, /Screen\s*Edge to edge/, 'back in Settings');
  assert.equal(g.run('document.activeElement.dataset.m'), 'screen', 'and the button stays chosen');
  button().click(); tile(g, 'console').click(); sheet.querySelector('[data-a=keep]').click();
  assert.deepEqual(view(g), [15, 10, 240, 160], 'back to the console');
  assert.ok(!classes(g).includes('overlay'));
  assert.deepEqual(['left', 'top', 'width', 'height'].map(k => g.el('#screenWrap').style[k]), ['', '', '', ''], 'the console’s own layout places the screen again');
});

test('the Tips page always says where to choose your screen', () => {
  const g = phone(null, {dom: true, save: {version: 8, started: true}});
  g.run('tipsPage(() => {})');
  assert.match(g.el('#sheet').textContent, /Your screen: the console[^]*Settings, Screen/);
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
