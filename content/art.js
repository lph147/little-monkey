// The new look's art, made ahead of time (on trial: DESIGN.md's Next steps). Made by  npm run art  (tools/art/build.js):
// never change this file by hand. grounds: for each place whose ground is drawn at double detail (its area's number and
// its id), the picture's file and size, the looks the picture has in it (covers: anything else on the map keeps today's
// drawing, over it), and a number worked out from its pixels (check), so a test can tell the picture is the one made.
// things: the sheet of what stands on the ground, and where each is on it (where: its left, top, width and height, then
// where its square's top left corner is in it); a thing's shadow is beside it, as nameShadow, drawn only on the ground.
const ART = {
  scale: 2,
  grounds: {
    '1:meadow': {file:'art/meadow-ground.png', w:768, h:704, covers:['grass', 'path', 'water', 'bridge', 'heights', 'cliffFace', 'redFlowers', 'yellowFlowers', 'whiteFlowers'], check:'e25a4ee3'}
  },
  things: {file:'art/things.png', w:512, h:119, check:'2d10bdd1', where: {
    treeBig1: [1, 1, 69, 76, 2, 16],
    treeBig0: [71, 1, 69, 74, 2, 14],
    treeBig2: [141, 1, 69, 72, 2, 12],
    peachTree: [211, 1, 49, 52, 8, 22],
    appleTree: [261, 1, 49, 52, 8, 22],
    tree0: [311, 1, 35, 44, 2, 14],
    tree1: [347, 1, 35, 44, 0, 14],
    tree2: [383, 1, 33, 44, 0, 14],
    stone: [417, 1, 43, 38, 5, 7],
    tallGrass: [461, 1, 32, 32, 0, 0],
    rocks2: [1, 78, 66, 30, 4, -1],
    bush: [68, 78, 33, 27, 0, -6],
    post: [102, 78, 28, 27, -2, -5],
    sign: [131, 78, 28, 25, -2, -7],
    boulderCracked: [160, 78, 24, 24, -4, -7],
    boulder: [185, 78, 24, 22, -3, -8],
    treeBig0Shadow: [210, 78, 57, 13, -8, -52],
    treeBig1Shadow: [268, 78, 57, 13, -8, -52],
    treeBig2Shadow: [326, 78, 57, 13, -8, -52],
    tree0Shadow: [384, 78, 31, 9, -4, -24],
    tree1Shadow: [416, 78, 31, 9, -4, -24],
    tree2Shadow: [448, 78, 31, 9, -4, -24],
    peachTreeShadow: [1, 109, 43, 9, 1, -24],
    appleTreeShadow: [45, 109, 43, 9, 1, -24],
    bushShadow: [89, 109, 31, 9, -3, -24],
    stoneShadow: [121, 109, 51, 9, 5, -25],
    rocks2Shadow: [173, 109, 69, 9, -4, -25],
    boulderShadow: [243, 109, 31, 9, -5, -25],
    boulderCrackedShadow: [275, 109, 31, 9, -5, -25],
    signShadow: [307, 109, 23, 7, -7, -26],
    postShadow: [331, 109, 25, 7, -5, -26]
  }}
};
