// The human world's look (Area 2, decided 4 November 2026, from the plan's mock-ups): ground people have made, packed
// earth in the village and grey flagstones in town, grass only in patches; bamboo groves, white walls and dark tiles,
// mud-brick and thatch; a canal with willows and an arched stone bridge; things people use, water jars, baskets, firewood,
// fish drying, washing, nets, boats, rice paddies and the market's stalls, with real signs (包子). And its scenes: your raft
// drifting across the sea, years passing in the town, and crossing the western sea. (Loaded after js/draw.js: it adds
// to LOOKS, OBJECT_ART and SCENE_ART.)

const HW = {
  earth:['#C8A673', '#B8955F', '#D8B988', '#A98552'], paving:['#B3ADA2', '#9E988C', '#C6C0B5', '#8A847A'], lawn:['#97B26E', '#86A25E', '#A9C281'],
  white:'#F0ECE2', whiteSh:'#D9D3C6', plinth:'#8C877D', tile:'#3C4347', tileLt:'#5B6369', tileDk:'#272C2F', wood:'#5E3B22', woodLt:'#8A5A34',
  mud:'#B07D52', mudDk:'#8E5F3A', thatch:'#CDAA5E', thatchDk:'#A3843E', water:'#4F8E95', waterLt:'#6CA8AC', stone:'#9C978C', red:'#C23A2E', indigo:'#3E5A86', ochre:'#C7902F'
};
const WOODS = ['#3E2410', '#6A4220', '#8A5A30', '#A8743E', '#C89A5A'];
Object.assign(HANZI, {
  '茶': ["..#.....#..", "###########", "..#.....#..", ".....#.....", "....#.#....", "..##...##..", "##.#####.##", ".....#.....", "..#..#..#..", ".#...#...#.", "....##....."],
  '包': ["..#.......", ".#########", "#........#", "..#####..#", "..#...#..#", "..#####..#", "..#.....#.", "..#....##.", "..#......#", "...######."],
  '子': ["#######..", ".....#...", "....#....", "...#.....", "#########", "....#....", "....#....", "....#....", "....#....", "..##....."]
});

/* ---- the ground ---- */
const speck = (g, X, Y, x, y, cols, n, seed) => { for (let i = 0; i < n; i++){ const px = Math.floor(rnd(x, y, i + seed) * 16), py = Math.floor(rnd(x, y, i + seed + 30) * 16); R(g, X + px, Y + py, 1, 1, cols[1 + i % (cols.length - 1)]); } };
function earth(g, X, Y, x, y){   // packed earth, as in the village's lanes
  R(g, X, Y, T, T, HW.earth[0]); speck(g, X, Y, x, y, HW.earth, 10, 300);
  if (rnd(x, y, 333) < .3){ const px = 2 + Math.floor(rnd(x, y, 334) * 11), py = 2 + Math.floor(rnd(x, y, 335) * 11); R(g, X + px, Y + py, 2, 1, HW.earth[3]); R(g, X + px, Y + py - 1, 2, 1, HW.earth[2]); }
}
function lawn(g, X, Y, x, y){ R(g, X, Y, T, T, HW.lawn[0]); speck(g, X, Y, x, y, HW.lawn, 8, 400); }   // a patch of grass, paler than the mountain's
function paving(g, X, Y, x, y){   // grey flagstones, laid in rows, a few darker, with mortar between
  R(g, X, Y, T, T, HW.paving[3]);
  const off = (y % 2) * 4;
  for (let r = 0; r < 2; r++) for (let c = -1; c < 2; c++){
    const sx = X + c * 8 + off + (r ? 4 : 0), sy = Y + r * 8, k = rnd(x * 3 + c, y * 2 + r, 410);
    const x0 = Math.max(X, sx + 1), x1 = Math.min(X + T, sx + 8);
    if (x1 > x0){ R(g, x0, sy + 1, x1 - x0, 7, k < .2 ? HW.paving[1] : k > .85 ? HW.paving[2] : HW.paving[0]); R(g, x0, sy + 1, x1 - x0, 1, HW.paving[2]); }
  }
}
const CANAL_LIKE = ['canal', 'slab', 'archBridge'];
function canal(g, X, Y, x, y){   // a canal's water, greener than the mountain's streams, with stone edges where it meets the ground
  R(g, X, Y, T, T, HW.water);
  for (let i = 0; i < 3; i++){ const px = Math.floor(rnd(x, y, i + 420) * 12), py = 4 + Math.floor(rnd(x, y, i + 430) * 9); R(g, X + px, Y + py, 4, 1, HW.waterLt); }
  for (const [dy, row] of [[-1, 0], [1, 13]]){
    if (CANAL_LIKE.includes(tileAt(x, y + dy).look)) continue;
    R(g, X, Y + row, T, 3, HW.stone); for (let i = 0; i < 16; i += 4) R(g, X + i + (y % 2) * 2, Y + row, 1, 3, HW.plinth); R(g, X, Y + (row ? row : 2), T, 1, HW.plinth);
  }
}
function veg(g, X, Y){   // a vegetable plot: dark soil, rows of greens
  R(g, X, Y, T, T, '#6B4A2E');
  for (let r = 0; r < 3; r++){ R(g, X, Y + 2 + r * 5, T, 1, '#5A3D25'); for (let c = 0; c < 4; c++){ const cx = X + 2 + c * 4, cy = Y + 4 + r * 5; oval(g, cx, cy, 2, 1, '#5E9A3C'); R(g, cx - 1, cy - 1, 2, 1, '#86C25A'); } }
}
function rice(g, X, Y, x, y){   // a paddy: shallow muddy water, and rows of young rice
  R(g, X, Y, T, T, '#7E9C78'); for (let i = 0; i < 6; i++) R(g, X + ((i * 5 + x * 3) % 15), Y + ((i * 7 + y * 5) % 15), 2, 1, '#A9C2A0');
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++){ const px = X + 2 + c * 4, py = Y + 3 + r * 4; R(g, px, py - 2, 1, 3, '#4F8A2E'); R(g, px + 1, py - 3, 1, 4, '#6DB33F'); R(g, px + 2, py - 1, 1, 2, '#9ACD52'); }
  if (tileAt(x, y - 1).look !== 'rice' && tileAt(x, y - 1).look !== 'scarecrow') R(g, X, Y, T, 2, '#8E6F44');   // an earth bank round it
  if (tileAt(x - 1, y).look !== 'rice' && tileAt(x - 1, y).look !== 'scarecrow') R(g, X, Y, 2, T, '#8E6F44');
}
function pier(g, X, Y, x, y){ seaBase(g, X, Y, x, y); R(g, X, Y, 16, 16, '#8A5A30'); for (let i = 0; i < 16; i += 4){ R(g, X, Y + i, 16, 1, '#5E3A1C'); R(g, X, Y + i + 1, 16, 1, '#A8743E'); } }
function slab(g, X, Y, x, y){ canal(g, X, Y, x, y); R(g, X, Y + 2, T, 12, HW.stone); R(g, X, Y + 2, T, 1, '#B8B3A8'); R(g, X, Y + 13, T, 1, HW.plinth); R(g, X + 7, Y + 2, 1, 12, HW.plinth); }   // a flat stone slab across a stream
Object.assign(LOOKS, {
  earth, lawn, paving, canal, veg, rice, pier, slab,
  scarecrow: rice, coatOnSand: sand, hatOnSand: sand, boat: seaBase, bigBoat: seaBase, netRack: sand,
  jHouse: earth, mudHouse: earth, whiteWall: earth, wallGate: earth, bambooFence: lawn, bamboo: lawn, willow: lawn, oldTree: paving, jars: earth, baskets: earth,
  sacks: paving, cart: paving, woodpile: earth, fishRack: earth, archBridge: canal, teahouse: paving, townSchool: paving, stallBuns: paving, stallShoes: paving,
  stallFruit: paving, stallChanger: paving, well: earth, washLine: earth, bookTable: paving
});
// (what's under them, where the map is of other ground: the village's houses and things on earth, the town's on flagstones)
const HUMAN_GROUND = {earth, paving, lawn, sand};
const groundUnder = (look, near) => (g, X, Y, x, y) => (HUMAN_GROUND[tileAt(x, y + 1).look] || HUMAN_GROUND[tileAt(x - 1, y).look] || near)(g, X, Y, x, y);
for (const k of ['jHouse', 'mudHouse', 'whiteWall', 'wallGate', 'jars', 'baskets', 'sacks', 'cart', 'woodpile', 'fishRack', 'teahouse', 'townSchool', 'stallBuns', 'stallShoes', 'stallFruit', 'stallChanger', 'well', 'washLine', 'bookTable', 'oldTree'])
  LOOKS[k] = groundUnder(k, LOOKS[k]);

/* ---- buildings and things ---- */
const roofTiles = (g, x, y, w, h) => {   // dark grey tiles in rows, a ridge along the top, curling up at both ends
  R(g, x, y, w, h, HW.tile);
  for (let r = y + 2; r < y + h; r += 3) R(g, x, r, w, 1, HW.tileDk);
  for (let c = x + 1; c < x + w; c += 3) for (let r = y + 1; r < y + h; r += 3) R(g, c, r, 1, 1, HW.tileLt);
  R(g, x - 2, y - 2, w + 4, 3, HW.tileDk); R(g, x - 2, y - 2, w + 4, 1, HW.tileLt);
  R(g, x - 4, y - 4, 3, 2, HW.tileDk); R(g, x + w + 1, y - 4, 3, 2, HW.tileDk);
  R(g, x - 2, y + h, w + 4, 2, HW.tileDk);
};
const woodDoor = (g, x, y, w = 8, h = 12) => { R(g, x - 1, y - 1, w + 2, h + 1, HW.woodLt); R(g, x, y, w, h, HW.wood); R(g, x + w / 2, y, 1, h, '#3E2614'); R(g, x + 2, y + 6, 1, 1, '#E0B050'); R(g, x + w - 3, y + 6, 1, 1, '#E0B050'); };
const lattice = (g, x, y, w = 8, h = 6) => { R(g, x, y, w, h, '#6E4A2A'); for (let i = 1; i < w; i += 2) R(g, x + i, y + 1, 1, h - 2, '#D9C49A'); R(g, x + 1, y + h / 2, w - 2, 1, '#6E4A2A'); };
const lantern = (g, x, y) => { R(g, x + 1, y - 3, 1, 3, '#3A2A1E'); oval(g, x + 1, y + 3, 3, 4, '#D8342C'); R(g, x - 1, y, 5, 1, '#F2C04A'); R(g, x - 1, y + 6, 5, 1, '#F2C04A'); };
function jHouse(g, o, sign){   // a white-walled house with a dark tiled roof, a wooden door and lattice windows
  const X = o.x * T, Y = o.y * T, W = o.w * T, H = o.h * T, roofH = Math.round(H * .45);
  R(g, X + 1, Y + roofH, W - 2, H - roofH, HW.white); R(g, X + 1, Y + roofH, W - 2, 2, HW.whiteSh);
  R(g, X + 1, Y + H - 3, W - 2, 3, HW.plinth);
  roofTiles(g, X + 1, Y - 6, W - 2, roofH + 4);
  woodDoor(g, X + W / 2 - 4, Y + H - 14);
  if (W >= 48) for (const wx of [X + 5, X + W - 13]) lattice(g, wx, Y + roofH + 6);
  if (sign) sign(g, X, Y, W, H);
}
function mudHouse(g, o){   // a fisherman's house: mud-brick walls under a thick thatched roof
  const X = o.x * T, Y = o.y * T, W = o.w * T, H = o.h * T, roofH = Math.round(H * .5);
  R(g, X + 2, Y + roofH, W - 4, H - roofH, HW.mud);
  for (let r = Y + roofH + 3; r < Y + H; r += 4) for (let c = X + 2 + ((r / 4) % 2) * 4; c < X + W - 2; c += 8) R(g, c, r, 7, 1, HW.mudDk);
  for (let i = 0; i < roofH + 8; i++){ const inset = Math.max(0, 6 - i); R(g, X - 2 + inset, Y - 8 + i, W + 4 - inset * 2, 1, i % 3 ? HW.thatch : HW.thatchDk); }
  for (let c = X; c < X + W; c += 3) R(g, c, Y + roofH - 1, 1, 3, HW.thatchDk);
  woodDoor(g, X + W / 2 - 4, Y + H - 13, 8, 13);
}
function marketStall(g, o, awn, goods, sign){   // a stall: a cloth awning on poles over a counter of goods, a sign hanging at its side
  const X = o.x * T, Y = o.y * T, W = o.w * T;
  R(g, X + 1, Y - 12, 2, 26, HW.wood); R(g, X + W - 3, Y - 12, 2, 26, HW.wood);
  for (let i = 0; i < W; i++) R(g, X + i, Y - 14 + (i % 8 < 4 ? 0 : 1), 1, 5, i % 8 < 4 ? awn : '#F2EEE4');
  R(g, X + 2, Y + 3, W - 4, 10, HW.woodLt); R(g, X + 2, Y + 3, W - 4, 1, '#B07A48'); R(g, X + 2, Y + 12, W - 4, 1, HW.wood);
  goods(g, X + 4, Y - 1, W - 8);
  if (sign) sign(g, X + W - 1, Y - 8);
}
const vSign = text => (g, x, y) => { const n = [...text].length; R(g, x - 1, y - 1, 14, n * 12 + 3, HW.wood); R(g, x, y, 12, n * 12 + 1, '#F2E6C4'); write(g, text, x + 1, y + 1, '#2A1A10', {down: true}); };
Object.assign(OBJECT_ART, {
  jHouse: (g, o) => jHouse(g, o),
  mudHouse,
  townSchool: (g, o) => jHouse(g, o, (g, X, Y, W) => { const sx = X + W / 2 - 13; R(g, sx - 1, Y + 9, 28, 15, HW.wood); R(g, sx, Y + 10, 26, 13, '#1E2A3A'); write(g, '学校', sx + 2, Y + 11, '#F2D27A'); }),
  teahouse: (g, o) => {   // the teahouse: a red flag with 茶 on a pole, two red lanterns and a little balcony
    jHouse(g, o);
    const X = o.x * T, Y = o.y * T, W = o.w * T, H = o.h * T;
    R(g, X + 3, Y + H - 18, W - 6, 2, HW.woodLt); for (let i = X + 4; i < X + W - 4; i += 4) R(g, i, Y + H - 16, 1, 3, HW.woodLt);
    lantern(g, X + 10, Y + H - 26); lantern(g, X + W - 12, Y + H - 26);
    const fx = X + W - 4, fy = Y - 6; R(g, fx, fy, 2, 42, HW.wood); R(g, fx - 16, fy + 2, 16, 20, '#C23A2E'); R(g, fx - 16, fy + 2, 16, 2, '#E8605A'); R(g, fx - 16, fy + 20, 16, 2, '#8E241C');
    write(g, '茶', fx - 14, fy + 6, '#F6E7C4');
  },
  whiteWall: (g, o) => { const X = o.x * T, Y = o.y * T, W = o.w * T; R(g, X, Y + 2, W, 14, HW.white); R(g, X, Y + 13, W, 3, HW.plinth); roofTiles(g, X + 2, Y - 2, W - 4, 3); },
  wallGate: (g, o) => {   // a wooden gate in the white wall, with a little tiled roof over it
    const X = o.x * T, Y = o.y * T;
    R(g, X, Y + 2, T, 14, HW.white); R(g, X, Y + 13, T, 3, HW.plinth); roofTiles(g, X + 1, Y - 4, T - 2, 3);
    R(g, X + 2, Y + 2, 12, 14, HW.woodLt); R(g, X + 3, Y + 3, 10, 13, HW.wood); R(g, X + 8, Y + 3, 1, 13, '#3E2614');
    R(g, X + 6, Y + 9, 1, 1, '#E0B050'); R(g, X + 10, Y + 9, 1, 1, '#E0B050');
  },
  bambooFence: (g, o) => { const X = o.x * T, Y = o.y * T, W = o.w * T; for (let i = X + 1; i < X + W; i += 3){ R(g, i, Y - 2, 2, 15, '#B9A35A'); R(g, i, Y + 3, 2, 1, '#8E7A3A'); } R(g, X, Y + 1, W, 2, '#8E7A3A'); R(g, X, Y + 8, W, 2, '#8E7A3A'); },
  bamboo: (g, o) => {   // a clump of bamboo: tall jointed stalks, sprays of thin leaves
    const X = o.x * T, Y = o.y * T;
    for (const [dx, hgt, c] of [[3, 34, '#5E8F3A'], [7, 40, '#78A848'], [11, 30, '#5E8F3A'], [13, 37, '#86B556']]){
      const h = hgt - Math.floor(rnd(o.x, o.y, dx) * 8);
      R(g, X + dx, Y + 15 - h, 2, h, c); for (let j = Y + 15 - h + 5; j < Y + 15; j += 7) R(g, X + dx, j, 2, 1, '#3E6A26');
      for (let k = 0; k < 3; k++){ const ly = Y + 15 - h + 2 + k * 8; R(g, X + dx - 4, ly, 4, 1, '#4E8A32'); R(g, X + dx + 2, ly + 2, 5, 1, '#6FA544'); }
    }
  },
  willow: (g, o) => {   // a weeping willow by the water: a dark trunk, a crown of pale green, long strands hanging down
    const X = o.x * T, Y = o.y * T;
    R(g, X + 7, Y - 2, 3, 17, '#5A4630'); R(g, X + 6, Y - 6, 2, 5, '#5A4630'); R(g, X + 9, Y - 7, 2, 6, '#5A4630');
    oval(g, X + 8, Y - 13, 11, 5, '#6E9A46'); oval(g, X + 7, Y - 14, 8, 3, '#8DB85A');
    for (let i = -10; i <= 11; i += 3){
      const len = 9 + Math.floor(rnd(o.x + i, o.y, 440) * 12), sx = X + 8 + i;
      for (let k = 0; k < len; k++) R(g, sx + (k > len * .6 ? (i < 0 ? -1 : 1) : 0), Y - 11 + k, 1, 1, k % 3 ? '#9FC765' : '#7FAE4E');
    }
  },
  oldTree: (g, o) => {   // a big old tree, broad and dark, with a ring of stone round it to sit on
    const X = o.x * T, Y = o.y * T, W = o.w * T;
    oval(g, X + W / 2, Y + 25, 15, 6, '#8C877D'); oval(g, X + W / 2, Y + 24, 13, 5, '#B3ADA2'); oval(g, X + W / 2, Y + 24, 9, 3, '#6B4A2E');
    R(g, X + W / 2 - 3, Y + 4, 6, 20, '#4E3624'); R(g, X + W / 2 - 1, Y + 4, 2, 20, '#6B4A30');
    for (const [dx, dy, r, c] of [[-10, -6, 12, '#2F5A2E'], [10, -8, 13, '#2F5A2E'], [0, -16, 15, '#3A6E36'], [-6, -10, 10, '#4A8040'], [8, -14, 9, '#4A8040']]) oval(g, X + W / 2 + dx, Y + dy, r, Math.round(r * .8), c);
  },
  jars: (g, o) => { const X = o.x * T, Y = o.y * T; for (const [dx, s] of [[4, 6], [11, 5]]){ oval(g, X + dx, Y + 10, s, s + 1, '#6A3A22'); oval(g, X + dx, Y + 8, s - 1, s - 1, '#8A4E2C'); oval(g, X + dx, Y + 4, s - 2, 1, '#2A1A10'); R(g, X + dx - 2, Y + 7, 1, 3, '#B07048'); } },
  baskets: (g, o) => { const X = o.x * T, Y = o.y * T; for (const [dx, dy] of [[1, 6], [8, 7], [4, 0]]){ R(g, X + dx, Y + dy, 7, 7, '#B8904A'); for (let i = 0; i < 7; i += 2) R(g, X + dx + i, Y + dy, 1, 7, '#8E6A30'); R(g, X + dx, Y + dy, 7, 1, '#D8B068'); } },
  sacks: (g, o) => { const X = o.x * T, Y = o.y * T; for (const [dx, dy] of [[1, 6], [8, 6], [5, 1]]){ oval(g, X + dx + 3, Y + dy + 4, 4, 4, '#D8C9A0'); R(g, X + dx + 2, Y + dy - 1, 3, 2, '#B8A980'); R(g, X + dx + 1, Y + dy + 4, 5, 1, '#C23A2E'); } },
  cart: (g, o) => { const X = o.x * T, Y = o.y * T; R(g, X - 2, Y + 3, 18, 7, HW.woodLt); R(g, X - 2, Y + 3, 18, 1, '#B07A48'); oval(g, X + 4, Y + 11, 4, 4, '#3E2614'); oval(g, X + 4, Y + 11, 2, 2, HW.woodLt); oval(g, X + 9, Y + 4, 3, 2, '#7FB050'); oval(g, X + 3, Y + 4, 3, 2, '#E0A040'); },
  woodpile: (g, o) => { const X = o.x * T, Y = o.y * T; for (let r = 0; r < 3; r++) for (let c = 0; c < 4 - r; c++){ const cx = X + 3 + c * 4 + r * 2, cy = Y + 12 - r * 4; oval(g, cx, cy, 2, 2, '#8A5A30'); R(g, cx, cy, 1, 1, '#D8B070'); } },
  fishRack: (g, o) => { const X = o.x * T, Y = o.y * T, W = o.w * T; R(g, X + 1, Y - 6, 2, 21, HW.wood); R(g, X + W - 3, Y - 6, 2, 21, HW.wood); R(g, X + 1, Y - 6, W - 2, 2, HW.woodLt); for (let i = X + 4; i < X + W - 3; i += 3){ R(g, i, Y - 4, 1, 3, '#7A6A55'); oval(g, i, Y + 1, 1, 3, '#9AA7B0'); } },
  archBridge: (g, o) => {   // a stone bridge arching over the canal, with low railings
    const X = o.x * T, Y = o.y * T, W = o.w * T, H = o.h * T;
    R(g, X, Y, W, H, '#ADA79C'); for (let r = Y + 2; r < Y + H; r += 4) R(g, X, r, W, 1, '#968F84');
    for (const sx of [X, X + W - 3]){ R(g, sx, Y - 4, 3, H + 4, '#8C877D'); R(g, sx, Y - 4, 3, 1, '#C6C0B5'); for (let r = Y; r < Y + H; r += 8) R(g, sx - 1, r - 6, 5, 3, '#C6C0B5'); }
  },
  well: (g, o) => { const X = o.x * T, Y = o.y * T; oval(g, X + 8, Y + 11, 7, 4, '#8C877D'); oval(g, X + 8, Y + 10, 6, 3, '#B3ADA2'); oval(g, X + 8, Y + 10, 4, 2, '#24363A'); R(g, X + 12, Y + 2, 4, 6, HW.woodLt); R(g, X + 12, Y + 2, 4, 1, '#B07A48'); R(g, X + 13, Y - 1, 1, 3, '#5A4630'); },
  washLine: (g, o) => { const X = o.x * T, Y = o.y * T, W = o.w * T, cols = ['#3E5A86', '#F2EEE4', '#2F4E78', '#C7902F', '#F2EEE4']; R(g, X + 1, Y - 6, 2, 21, '#B9A35A'); R(g, X + W - 3, Y - 6, 2, 21, '#B9A35A'); R(g, X + 2, Y - 5, W - 4, 1, '#E8E0C8'); for (let i = 0, cx = X + 5; cx < X + W - 8; i++, cx += 8) R(g, cx, Y - 4, 6, 7 + (i % 2) * 2, cols[i % cols.length]); },
  bookTable: (g, o) => {   // a little table of books by the school, open and stacked
    const X = o.x * T, Y = o.y * T;
    R(g, X + 1, Y + 6, 14, 3, HW.woodLt); R(g, X + 1, Y + 6, 14, 1, '#B07A48'); R(g, X + 2, Y + 9, 2, 6, HW.wood); R(g, X + 12, Y + 9, 2, 6, HW.wood);
    R(g, X + 2, Y + 4, 6, 2, '#C23A2E'); R(g, X + 2, Y + 2, 6, 2, '#3E5A86'); R(g, X + 3, Y + 0, 5, 2, '#5E8F3A');
    R(g, X + 9, Y + 4, 5, 2, '#F2EEE4'); R(g, X + 11, Y + 4, 1, 2, '#9E988C');   // an open book
  },
  netRack: (g, o) => {   // a fishing net hung up to dry between two poles
    const X = o.x * T, Y = o.y * T;
    R(g, X + 1, Y - 6, 2, 21, WOODS[1]); R(g, X + 13, Y - 6, 2, 21, WOODS[1]); R(g, X + 1, Y - 6, 14, 2, WOODS[2]);
    for (let i = 0; i < 12; i += 3) R(g, X + 3 + i, Y - 4, 1, 14, '#C8BFA0'); for (let j = 0; j < 14; j += 3) R(g, X + 3, Y - 4 + j, 10, 1, '#C8BFA0');
  },
  boat: (g, o) => {   // a little fishing boat with a woven roof
    const X = o.x * T, Y = o.y * T, W = o.w * T;
    for (let i = 0; i < 6; i++) R(g, X + 2 + (i >= 3 ? 3 : i), Y + 8 + i, W - 4 - (i < 3 ? 2 * i : 6), 1, i % 2 ? WOODS[1] : WOODS[2]);
    R(g, X + 1, Y + 8, W - 2, 1, WOODS[3]); R(g, X + 9, Y + 2, 14, 6, '#8C7A50'); for (let k = 0; k < 14; k += 3) R(g, X + 9 + k, Y + 2, 1, 6, '#6A5A38'); R(g, X + 9, Y + 2, 14, 1, '#B8A270');
  },
  bigBoat: (g, o) => {   // a boat to cross the sea: a mast and a battened sail
    const X = o.x * T, Y = o.y * T, W = o.w * T;
    for (let i = 0; i < 7; i++) R(g, X + i, Y + 7 + i, W - 2 * i, 1, i % 2 ? WOODS[1] : WOODS[2]);
    R(g, X, Y + 6, W, 2, WOODS[3]); R(g, X + 21, Y - 30, 2, 37, WOODS[0]);
    for (let r = 0; r < 26; r++) R(g, X + 8 + Math.round(r / 6), Y - 28 + r, 12 - Math.round(r / 8), 1, r % 5 === 0 ? '#6A2A1A' : '#B5462E');
  },
  scarecrow: (g, o) => {   // a scarecrow in the rice, in a patched coat and a straw hat
    const X = o.x * T, Y = o.y * T;
    R(g, X + 7, Y - 8, 2, 22, WOODS[1]); R(g, X + 1, Y - 2, 14, 2, WOODS[1]); R(g, X + 3, Y - 2, 10, 9, '#5A6E8A'); R(g, X + 5, Y + 1, 3, 3, '#C0504D');
    oval(g, X + 8, Y - 7, 3, 3, '#E8D8A0'); R(g, X + 1, Y - 11, 14, 2, '#D9B866'); R(g, X + 4, Y - 13, 8, 2, '#D9B866');
  },
  coatOnSand: (g, o) => { const X = o.x * T, Y = o.y * T; R(g, X + 3, Y + 6, 10, 7, '#7A6A55'); R(g, X + 1, Y + 7, 3, 3, '#7A6A55'); R(g, X + 12, Y + 7, 3, 3, '#7A6A55'); R(g, X + 3, Y + 6, 10, 1, '#9A8A70'); R(g, X + 7, Y + 6, 1, 7, '#5A4C3C'); R(g, X + 3, Y + 10, 10, 1, '#3A2A1E'); },
  hatOnSand: (g, o) => { const X = o.x * T, Y = o.y * T; oval(g, X + 8, Y + 10, 7, 3, '#A88A3E'); oval(g, X + 8, Y + 9, 6, 2, '#D9B866'); oval(g, X + 8, Y + 7, 3, 2, '#D9B866'); R(g, X + 5, Y + 8, 6, 1, '#A88A3E'); },
  stallBuns: (g, o) => marketStall(g, o, HW.indigo, (g, x, y, w) => { for (let i = 0; i + 14 <= w; i += 15){ R(g, x + i, y + 2, 13, 5, '#C9A060'); R(g, x + i, y + 2, 13, 1, '#E0BC78'); for (let k = 0; k < 3; k++) oval(g, x + i + 2 + k * 4, y + 1, 2, 2, '#F6EFE2'); } }, vSign('包子')),
  stallShoes: (g, o) => marketStall(g, o, HW.red, (g, x, y, w) => { for (let i = 0; i + 6 <= w; i += 7){ const c = ['#2A2A2A', '#3E5A86', '#7A3A2A'][i / 7 % 3]; R(g, x + i, y + 3, 3, 3, c); R(g, x + i + 3, y + 3, 3, 3, c); R(g, x + i, y + 3, 6, 1, '#E8E0D0'); } }),
  stallFruit: (g, o) => marketStall(g, o, HW.ochre, (g, x, y, w) => { const c = ['#D8342C', '#F2A0A0', '#5E9A3C', '#E8D27A', '#D8642C']; for (let i = 0; i + 5 <= w; i += 6) oval(g, x + i + 2, y + 4, 3, 2, c[i / 6 % 5]); }),
  stallChanger: (g, o) => marketStall(g, o, '#5E3B22', (g, x, y, w) => { R(g, x + 2, y + 1, 12, 6, HW.wood); for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) R(g, x + 3 + c * 2, y + 2 + r * 3, 1, 1, '#E0C080'); for (let i = 0; i < 3; i++){ oval(g, x + 20 + i * 5, y + 5, 2, 2, '#C89A3E'); R(g, x + 20 + i * 5, y + 5, 1, 1, '#3A2A1E'); } })
});
BLOCK_OBJECTS.push('jHouse', 'mudHouse', 'townSchool', 'teahouse', 'oldTree', 'archBridge', 'boat', 'bigBoat');
ROW_OBJECTS.push('whiteWall', 'bambooFence', 'stallBuns', 'stallShoes', 'stallFruit', 'stallChanger', 'washLine', 'fishRack');
GRASSY.push('lawn', 'bamboo', 'willow', 'bambooFence');

/* ---- scenes ---- */
// Your raft drifting across the sea for days (the drift scene, as you arrive in Area 2): the sun and moon going over, then
// land: mountains, trees, and on the shore, people.
function drawDrift(t, now){
  const W = VW*T, H = VH*T, hz = 70, day = clamp(t / 5, 0, 1), land = clamp((t - 3.5) / 3, 0, 1);
  const sky = t < 4 ? mix('#1A2B4A', '#6AB4E2', Math.abs(Math.sin(t * .8))) : '#6AB4E2';
  for (let y = 0; y < hz; y += 2) R(b, 0, y, W, 2, mix(sky, '#D6EEF7', y / hz));
  if (t < 4){ const a = t * 1.6; disc(b, Math.round(120 + Math.cos(a) * 100), Math.round(hz - Math.sin(a) * 50), 5, Math.sin(a * .5) > 0 ? '#FFE27A' : '#F2F2E6'); }
  cloudPuff(40 + t * 2, 18, .8); cloudPuff(160 + t, 28, .7);
  for (let y = hz; y < H; y += 2) R(b, 0, y, W, 2, mix('#68B0DE', '#2F78B4', (y - hz) / (H - hz)));
  for (let i = 0; i < 20; i++){ const sx = Math.floor(rnd(i, 95) * W), sy = hz + 4 + Math.floor(rnd(i, 96) * 80); if (Math.sin(now / 420 + i) > .4) R(b, sx, sy, 3, 1, '#D6F2FF'); }
  if (land > 0){   // land rising out of the sea on the right: mountains, trees, a beach
    const lx = Math.round(W - land * 120);
    for (let x = 0; x < 130; x++){ const h = Math.max(0, Math.round(46 * Math.sin(x / 130 * Math.PI) + 10 * Math.sin(x / 9))); R(b, lx + x, hz - h + 6, 1, h, x % 6 ? '#5C8C5A' : '#4E7E4E'); }
    for (let i = 0; i < 10; i++) disc(b, lx + 10 + Math.floor(rnd(i, 81) * 110), hz - 2 - Math.floor(rnd(i, 82) * 16), 3, '#2F6A3A');
    R(b, lx, hz + 6, 130, 6, '#EAD49C');
    if (t > 7.5) for (const [dx, c] of [[30, '#4F78A8'], [44, '#6E8F5E']]) { R(b, lx + dx, hz - 6, 4, 6, c); R(b, lx + dx, hz - 9, 4, 3, '#F2C9A0'); R(b, lx + dx - 1, hz - 10, 6, 1, '#D9B866'); }   // people on the shore
  }
  const bob = Math.round(Math.sin(now / 400) * 1.5), rx = 70 + Math.round(day * 10), ry = hz + 40;
  R(b, rx - 15, ry + bob, 30, 9, '#6E4A28'); for (let i = 0; i < 4; i++) R(b, rx - 15, ry + bob + i * 2, 30, 1, '#9C6A3C');
  b.drawImage(monkeySprite('player', 'right', false), rx - 12, ry + bob - 22, 24, 24);
  R(b, rx - 18, ry + bob + 9, 36, 1, 'rgba(255,255,255,.6)');
}
// Years going by in the town (the yearsPass scene): the market street as the seasons turn, people coming and going, and
// you among them, learning to talk.
function drawYearsPass(t, now){
  const W = VW*T, H = VH*T, season = Math.floor(t / 3) % 4;
  const skies = ['#9FD0EE', '#7FC0EA', '#E8C79A', '#C8D4DE'], leaves = ['#8FCB6A', '#3F8A3E', '#D8923A', '#E6ECEF'];
  for (let y = 0; y < 60; y += 2) R(b, 0, y, W, 2, mix(skies[season], '#F2F4F0', y / 60));
  for (let x = 0; x < W; x += 60){ const o = {x:x / T, y:2, w:3, h:2}; jHouse(b, o); }   // houses along the street
  for (let y = 64; y < H; y += 8) for (let x = 0; x < W; x += 8) R(b, x + ((y / 8) % 2) * 4, y, 7, 7, (x + y) % 3 ? '#B3ADA2' : '#9E988C');
  oval(b, 200, 70, 22, 14, leaves[season]); R(b, 197, 72, 6, 30, '#4E3624');   // a tree, through the seasons
  if (season === 3) for (let i = 0; i < 30; i++) R(b, Math.floor(rnd(i, Math.floor(now / 300)) * W), Math.floor(rnd(i, 7) * H), 1, 1, '#FFFFFF');   // snow
  for (let i = 0; i < 4; i++){   // people walking by
    const x = Math.round(((now / 30 + i * 70) % (W + 40)) - 20), y = 100 + (i % 2) * 14;
    b.drawImage(monkeySprite(['walker1', 'walker2', 'porter', 'teacher'][i], 'right', false, Math.floor(now / 200) % 2 + 1), x, y, 16, 16);
  }
  b.drawImage(monkeySprite('player', 'down', now % 3200 < 130), 110, 112, 24, 24);   // you, in your coat and hat
}
// Crossing the western sea in the boatman's big boat (the crossSea scene): wind in the sail, the town falling behind, then
// mountains ahead.
function drawCrossSea(t, now){
  const W = VW*T, H = VH*T, hz = 64, k = clamp(t / 10, 0, 1);
  for (let y = 0; y < hz; y += 2) R(b, 0, y, W, 2, mix('#7FC0EA', '#E2F2F8', y / hz));
  cloudPuff(220 - t * 6, 16, 1); cloudPuff(120 - t * 4, 26, .8);
  for (let y = hz; y < H; y += 2) R(b, 0, y, W, 2, mix('#5FA6D6', '#2A6EA8', (y - hz) / (H - hz)));
  for (let i = 0; i < 24; i++){ const sx = Math.floor((rnd(i, 95) * W + now / 12) % W), sy = hz + 4 + Math.floor(rnd(i, 96) * 90); R(b, W - sx, sy, 4, 1, '#D6F2FF'); }
  if (k < .6) { const tx = Math.round(-k * 120); for (let x = 0; x < 70; x++) R(b, tx + x, hz - 10, 1, 10, x % 8 ? '#B8B2A6' : '#3C4347'); }   // the town, falling behind
  if (t > 6){ const mx = Math.round(W - clamp((t - 6) / 4, 0, 1) * 110); for (let x = 0; x < 130; x++){ const h = Math.max(0, Math.round(60 * Math.sin(x / 130 * Math.PI))); R(b, mx + x, hz - h + 4, 1, h, x % 7 ? '#5A7E78' : '#4A6E68'); } }   // mountains ahead
  const bob = Math.round(Math.sin(now / 380) * 2), bx = 90, by = hz + 34 + bob;
  for (let i = 0; i < 7; i++) R(b, bx + i, by + 7 + i, 56 - 2 * i, 1, i % 2 ? WOODS[1] : WOODS[2]);
  R(b, bx, by + 6, 56, 2, WOODS[3]); R(b, bx + 30, by - 34, 2, 41, WOODS[0]);
  const puff = 1 + Math.sin(now / 300) * .08;
  for (let r = 0; r < 30; r++) R(b, bx + 10 + Math.round(r / 6), by - 32 + r, Math.round((14 - r / 8) * puff), 1, r % 5 === 0 ? '#6A2A1A' : '#B5462E');
  b.drawImage(monkeySprite('player', 'right', false), bx + 34, by - 10, 16, 16);
  b.drawImage(monkeySprite('boatman', 'right', false), bx + 4, by - 10, 16, 16);
}
Object.assign(SCENE_ART, {drift: drawDrift, yearsPass: drawYearsPass, crossSea: drawCrossSea});   // (their sounds: SCENE_SOUNDS, js/main.js)
