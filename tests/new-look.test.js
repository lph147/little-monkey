// The new look, on trial (decided 10 November 2026, after the look review): a hidden switch, kept in the browser, that
// draws the screen at double detail. Off, as it is unless you use the link, the game is drawn exactly as it was: every
// other test runs with it off.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./fake-browser');
const {SCREENS} = require('../tools/screens');

const SAVE = {version: 21, started: true};
const withLook = look => loadGame({save: SAVE, storage: look ? {'xiaohouzi-look': look} : {}});

test('off unless you switch it on: the screen is 240 by 160, and the title says nothing of it', () => {
  const game = withLook(null);
  assert.equal(game.run('LOOK'), 'old');
  assert.equal(game.run('SCALE'), 1);
  assert.equal(game.run('buf.width + "x" + buf.height'), '240x160');
  game.run('toTitle()');
  assert.equal(game.el('#version').textContent, 'v' + game.run('VERSION'));
});

test('switched on, the screen is drawn at double detail, 480 by 320, and the title says so', () => {
  const game = withLook('new');
  assert.equal(game.run('NEW_LOOK'), true);
  assert.equal(game.run('SCALE'), 2);
  assert.equal(game.run('buf.width + "x" + buf.height'), '480x320');
  assert.equal(game.run('VW * T + "x" + VH * T'), '240x160', 'everything is still measured in today’s pixels');
  game.run('toTitle()');
  assert.equal(game.el('#version').textContent, 'v' + game.run('VERSION') + ' · new look');
});

test('the title and the map are drawn with it on, and its sample of word pictures has every picture', () => {
  const game = withLook('new');
  assert.doesNotThrow(() => game.run('drawScene(0, 1000); lookSample(); fitToScreen(); drawWorld(2000); fitToScreen();'));
  assert.equal(game.run('LOOK_SAMPLE.filter(w => !PICTURES[w]).join()'), '');
});

test('fitted the other way: the picture is first made a whole number of times bigger', () => {
  const game = withLook('smooth');
  assert.equal(game.run('FIT_SMOOTH'), true);
  assert.equal(game.run('SCALE'), 2);
  game.run('cv.width = 1230; cv.height = 820; fitToScreen();');   // (an iPhone's screen: 410 by 273, three of its pixels each)
  assert.equal(game.run('fitCanvas.width + "x" + fitCanvas.height'), '1440x960');
  game.run('toTitle()');
  assert.match(game.el('#version').textContent, /new look, smooth$/);
});

test('anything else kept there is the old look', () => {
  const game = withLook('shiny');
  assert.equal(game.run('LOOK'), 'old');
  assert.equal(game.run('SCALE'), 1);
});

test('the screens gallery shows it switched on', () => {
  const looks = SCREENS.filter(s => s.look).map(s => s.look);
  assert.ok(looks.includes('new') && looks.includes('smooth'), 'both ways of fitting it to the screen have a screen');
});

// ---- step 2: a place's ground from a picture made ahead of time at double detail (npm run art, js/newlook.js) ----
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const {make, check} = require('../tools/art/build.js');
const {Img} = require('../tools/art/png.js');

test('the art is up to date with the tools that draw it (if not, run: npm run art)', () => {
  const {pictures, text} = make();
  assert.equal(fs.readFileSync(path.join(ROOT, 'content/art.js'), 'utf8').replace(/\r\n/g, '\n'), text, 'content/art.js is out of date: run  npm run art');
  for (const [file, img] of Object.entries(pictures)){
    const kept = Img.load(path.join(ROOT, file));
    assert.equal(kept.w + 'x' + kept.h, img.w + 'x' + img.h, `${file} is the wrong size: run  npm run art`);
    assert.equal(check(kept), check(img), `${file} is out of date: run  npm run art`);
  }
});

test('each ground picture is for a real place, 32 pixels a square, and says which looks it has in it', () => {
  const game = withLook(null);
  const grounds = JSON.parse(game.run('JSON.stringify(ART.grounds)'));
  assert.ok(Object.keys(grounds).length > 0);
  for (const [key, a] of Object.entries(grounds)){
    const [area, id] = key.split(':');
    const size = game.run(`(() => { const p = AREAS[${area - 1}].places[${JSON.stringify(id)}]; return p ? p.map[0].length * 32 + 'x' + p.map.length * 32 : 'no such place'; })()`);
    assert.equal(a.w + 'x' + a.h, size, `${key}: the picture is ${a.w} x ${a.h}`);
    assert.ok(fs.existsSync(path.join(ROOT, a.file)), `${key}: ${a.file} is there`);
    assert.equal(game.run(`${JSON.stringify(a.covers)}.filter(l => !LOOKS[l]).join()`), '', `${key}: every look it covers is one of the game's`);
  }
});

// what drawWorld draws first, by name: the picture, the map's own ground, or the things cut out of today's squares
const firstDrawn = game => game.run(`(() => { const out = [], was = b.drawImage; b.drawImage = (img, ...a) => { out.push((img === mapCanvas ? 'map' : img === thingCanvas ? 'things' : img === HI_PICTURES['art/meadow-ground.png'] ? 'picture' : 'other') + (out.length ? '' : ' ' + a.join()));  };
  drawWorld(2000); b.drawImage = was; return out.slice(0, 2).join(' | '); })()`);

test('switched off, the meadow is drawn from the map’s own ground, as ever', () => {
  const game = withLook(null);
  game.run("HI_PICTURES['art/meadow-ground.png'] = {width: 768, height: 704};");   // (even if a picture were there)
  assert.match(firstDrawn(game), /^map /);
});

test('switched on, the meadow’s ground comes from its picture, a pixel of it a pixel of the screen, then today’s things over it', () => {
  const game = withLook('new');
  assert.match(firstDrawn(game), /^map /, 'till the picture has loaded, the map’s own ground');
  game.run("HI_PICTURES['art/meadow-ground.png'] = {width: 768, height: 704}; cutOutThings();");
  const [cx, cy] = game.run('camX() + "," + camY()').split(',').map(Number);
  assert.equal(firstDrawn(game), `picture ${cx * 2},${cy * 2},480,320,0,0,240,160 | things`);
});

test('a place with no picture is drawn the old way, switch or no switch', () => {
  const game = loadGame({save: {...SAVE, pos: {place: 'path', x: 15, y: 17, dir: 'up'}}, storage: {'xiaohouzi-look': 'new'}});
  game.run("HI_PICTURES['art/meadow-ground.png'] = {width: 768, height: 704};");
  assert.equal(game.run('PLACE'), 'path');
  assert.match(firstDrawn(game), /^map /);
});
