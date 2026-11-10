// The new look's art, made ahead of time (on trial: DESIGN.md's Next steps). Made by  npm run art  (tools/art/build.js):
// never change this file by hand. grounds: for each place whose ground is drawn at double detail (its area's number and
// its id), the picture's file and size, the looks the picture has in it (covers: anything else on the map keeps today's
// drawing, over it), and a number worked out from its pixels (check), so a test can tell the picture is the one made.
const ART = {
  scale: 2,
  grounds: {
    '1:meadow': {file:'art/meadow-ground.png', w:768, h:704, covers:['grass', 'path', 'water', 'bridge', 'heights', 'cliffFace', 'redFlowers', 'yellowFlowers', 'whiteFlowers'], check:'e25a4ee3'}
  }
};
