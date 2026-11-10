// The new look's art, made ahead of time (on trial: DESIGN.md's Next steps). Run it with:  npm run art
// It reads each place's map from its area's file, draws its ground at double detail (ground.js) and writes it as a
// picture file in art/, and the things that stand on the ground on one sheet (sheet.js), with content/art.js to tell
// the game what there is. A test checks both are up to date
// (tests/new-look.test.js): after changing a drawing here, run it again. No packages needed.
'use strict';
const fs = require('node:fs'), path = require('node:path');
const {ground, COVERS} = require('./ground.js');
const {sheet} = require('./sheet.js');

const ROOT = path.resolve(__dirname, '..', '..');
const PLACES = [[1, 'meadow']];   // the places with art at double detail: the area's number, and the place's id
// each area's file and what it's called there (read on its own, not through the game's page, which lists content/art.js:
// what this makes)
const AREA_FILES = {1: ['content/flower-fruit-mountain.js', 'FLOWER_FRUIT_MOUNTAIN']};
const areaOf = n => new Function(fs.readFileSync(path.join(ROOT, AREA_FILES[n][0]), 'utf8') + `
return ${AREA_FILES[n][1]};`)();
// a number worked out from a picture's pixels, to tell two pictures apart
const check = img => { let h = 0x811C9DC5; for (let i = 0; i < img.d.length; i++){ h ^= img.d[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };

// Everything the tools make: pictures (each file's name and its picture) and text (content/art.js).
function make(){
  const pictures = {}, lines = [];
  for (const [area, id] of PLACES){
    const A = areaOf(area), place = A.places[id], rows = place.map, legend = {...A.legend, ...(place.legend || {})};
    // each letter's look, and the letter it turns into for good as the story goes on (its first becomes)
    const looks = Object.fromEntries([...new Set(rows.join(''))].map(c => [c, {look: (legend[c] || {}).look, becomes: (((legend[c] || {}).becomes || [])[0] || {}).to || ''}]));
    const img = ground(rows, looks), file = `art/${id}-ground.png`;
    pictures[file] = img;
    lines.push(`    '${area}:${id}': {file:'${file}', w:${img.w}, h:${img.h}, covers:[${COVERS.map(c => `'${c}'`).join(', ')}], check:'${check(img)}'}`);
  }
  const things = sheet(); pictures['art/things.png'] = things.img;
  const text = `// The new look's art, made ahead of time (on trial: DESIGN.md's Next steps). Made by  npm run art  (tools/art/build.js):
// never change this file by hand. grounds: for each place whose ground is drawn at double detail (its area's number and
// its id), the picture's file and size, the looks the picture has in it (covers: anything else on the map keeps today's
// drawing, over it), and a number worked out from its pixels (check), so a test can tell the picture is the one made.
// things: the sheet of what stands on the ground, and where each is on it (where: its left, top, width and height, then
// where its square's top left corner is in it); a thing's shadow is beside it, as nameShadow, drawn only on the ground.
const ART = {
  scale: 2,
  grounds: {
${lines.join(',\n')}
  },
  things: {file:'art/things.png', w:${things.img.w}, h:${things.img.h}, check:'${check(things.img)}', where: {
${Object.entries(things.where).map(([n, v]) => `    ${n}: [${v.join(', ')}]`).join(',\n')}
  }}
};
`;
  return {pictures, text};
}
module.exports = {make, check};
if (require.main === module){
  const {pictures, text} = make();
  fs.mkdirSync(path.join(ROOT, 'art'), {recursive: true});
  for (const [file, img] of Object.entries(pictures)){ img.save(path.join(ROOT, file)); console.log(`${file}: ${img.w} x ${img.h}`); }
  fs.writeFileSync(path.join(ROOT, 'content', 'art.js'), text);
  console.log('content/art.js written');
}
