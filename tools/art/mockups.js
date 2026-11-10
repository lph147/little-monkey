// The drawing tools behind the look review of 10 November 2026 (DESIGN.md's Next steps: the new look, on trial).
// Run it with:  node tools/art/mockups.js
// It draws the review's mock-up pictures again into tools/art/out/ (which git ignores), at three times the game's
// pixels: the meadow redrawn from its own map (morning, evening, night, and as you're born), the title's picture, the
// scene beside an animal's questions and a fight, the monkey's sheet, and the cards' frames and buttons. Nothing here
// is part of the game: these are where the trial's art build (npm run art, to come) starts from. No packages needed.
//
//   png.js     reading and writing picture files, and a simple picture to draw pixels on
//   core.js    the palette (every ramp warm in the light, cool in the shade), noise, sprites from letter grids
//   things.js  what stands on the map: boulders, trees, the sign, the post, flowers, long grass
//   world.js   the meadow, from its map rows: grass, paths, water below its banks, cliffs, shadows
//   monkey.js  the monkey at 16 x 16, shaded, from the front, behind and the side
//   title.js   Flower Fruit Mountain at dawn, from a height map
//   battle.js  the painted meadow behind a creature, and the monkey from behind, large
//   logo.js    brush lettering cut down to pixels (it needs a big picture of the lettering, which isn't kept here)
//   ui.js      the cards' frames, buttons and icons, each cut in nine to stretch
'use strict';
const fs = require('node:fs'), path = require('node:path');
const {Img, sprite} = require('./core.js');
const {meadow} = require('./world.js');
const {title} = require('./title.js');
const {scene, heroBack} = require('./battle.js');
const {monkey} = require('./monkey.js');

const out = path.join(__dirname, 'out');
fs.mkdirSync(out, {recursive: true});
const save = (img, name, n = 3) => { img.scale(n).save(path.join(out, name + '.png')); return img; };
// the game's own word pictures (content/pictures.js), for the creature in a scene
const {PICTURES} = new Function(fs.readFileSync(path.join(__dirname, '..', '..', 'content', 'pictures.js'), 'utf8') + '\nreturn {PICTURES};')();
const picture = word => sprite(PICTURES[word].rows, PICTURES[word].palette);

save(meadow({}), 'meadow');
save(meadow({mood: 'dusk', marks: false}), 'meadow-dusk');
save(meadow({mood: 'night', marks: false}), 'meadow-night');
save(meadow({ox: 32, oy: 0, gate: false, hint: null, cast: [['elder', 7, 2, 'right'], ['player', 9, 2, 'left'], ['little', 16, 5, 'down']], over: []}), 'meadow-talk');
save(title(), 'title');
save(scene(picture('兔子')), 'scene-rabbit');
save(scene(picture('蛇'), {stick: true}), 'scene-snake');
save(heroBack({stick: true}), 'hero-back', 5);
const strip = (pics, gap = 6) => { const img = new Img(pics.reduce((a, p) => a + p.w + gap, -gap), Math.max(...pics.map(p => p.h))); let x = 0; for (const p of pics){ img.blit(p, x, img.h - p.h); x += p.w + gap; } return img; };
save(strip(['down', 'up', 'right', 'left'].map(d => monkey('player', d, {band: true}))), 'monkey', 8);
save(strip([monkey('elder', 'down'), monkey('elder', 'right'), monkey('hungry', 'down'), monkey('little', 'right'), monkey('big', 'up')]), 'troop', 6);
require('./ui.js');   // (the frames, buttons and icons, into out/ui/)
console.log(`${fs.readdirSync(out).length} pictures in tools/art/out`);
