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
const CANAL_LIKE = ['canal', 'slab', 'archBridge', 'hopStone'];
function canal(g, X, Y, x, y){   // a canal's water, greener than the mountain's streams, with stone edges where it meets the ground
  R(g, X, Y, T, T, HW.water);
  for (let i = 0; i < 3; i++){ const px = Math.floor(rnd(x, y, i + 420) * 12), py = 4 + Math.floor(rnd(x, y, i + 430) * 9); R(g, X + px, Y + py, 4, 1, HW.waterLt); }
  for (const [dy, row] of [[-1, 0], [1, 13]]){
    if (CANAL_LIKE.includes(tileAt(x, y + dy).look)) continue;
    R(g, X, Y + row, T, 3, HW.stone); for (let i = 0; i < 16; i += 4) R(g, X + i + (y % 2) * 2, Y + row, 1, 3, HW.plinth); R(g, X, Y + (row ? row : 2), T, 1, HW.plinth);
  }
}
// Stepping stones in a canal or a channel through the fields: the canal's water under them, not the mountain's bright
// blue (decided 4 November 2026: the stones sat in a square of other water). The stone itself as on the mountain.
const mountainHopStone = LOOKS.hopStone;
LOOKS.hopStone = (g, X, Y, x, y) => {
  let k = x; while (tileAt(k, y).look === 'hopStone') k--;
  if (tileAt(k, y).look !== 'canal') return mountainHopStone(g, X, Y, x, y);
  canal(g, X, Y, x, y);
  oval(g, X + 8, Y + 11, 7, 4, '#2F5E63'); oval(g, X + 8, Y + 10, 6, 4, '#6F6B61'); oval(g, X + 8, Y + 9, 5, 3, '#B4AE9F'); oval(g, X + 7, Y + 8, 3, 1, '#D2CCBE');
  R(g, X + 1, Y + 13, 3, 1, HW.waterLt); R(g, X + 12, Y + 13, 3, 1, HW.waterLt);
};
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
// A bridge of flat stone slabs over a stream: its deck right across its squares, with no water between them (decided 4
// November 2026: each square was a slab of its own, and the water between them looked like a gap across the bridge),
// slabs in staggered rows, and a low kerb along each side that has water beside it.
const WET = ['canal', 'hopStone', 'water', 'sea'];
function slab(g, X, Y, x, y){
  R(g, X, Y, T, T, HW.stone);
  for (let r = 0; r < T; r += 8){ R(g, X, Y + r, T, 1, HW.plinth); R(g, X, Y + r + 1, T, 1, '#ADA89D'); R(g, X + ((x + y * 2 + r / 8) % 2 ? 4 : 11), Y + r, 1, 8, HW.plinth); }
  const wet = (dx, dy) => WET.includes(tileAt(x + dx, y + dy).look);
  if (wet(-1, 0)){ R(g, X, Y, 3, T, '#7E796F'); R(g, X, Y, 3, 1, '#B8B3A8'); R(g, X + 1, Y, 1, T, '#B8B3A8'); }
  if (wet(1, 0)){ R(g, X + T - 3, Y, 3, T, '#7E796F'); R(g, X + T - 2, Y, 1, T, '#B8B3A8'); R(g, X + T - 1, Y, 1, T, '#5E5A52'); }
  if (wet(0, -1)){ R(g, X, Y, T, 3, '#7E796F'); R(g, X, Y + 1, T, 1, '#B8B3A8'); }
  if (wet(0, 1)){ R(g, X, Y + T - 3, T, 3, '#7E796F'); R(g, X, Y + T - 2, T, 1, '#B8B3A8'); R(g, X, Y + T - 1, T, 1, '#5E5A52'); }
}
Object.assign(LOOKS, {
  earth, lawn, paving, canal, veg, rice, pier, slab,
  scarecrow: rice, coatOnSand: sand, hatOnSand: sand, boat: seaBase, bigBoat: seaBase, netRack: sand,
  jHouse: earth, mudHouse: earth, whiteWall: earth, wallGate: earth, bambooFence: lawn, bamboo: lawn, willow: lawn, oldTree: paving, jars: earth, baskets: earth,
  sacks: paving, cart: paving, woodpile: earth, fishRack: earth, archBridge: canal, teahouse: paving, townSchool: paving, stallBuns: paving, stallShoes: paving,
  stallFruit: paving, stallChanger: paving, stallKites: paving, well: earth, washLine: earth, bookTable: paving
});
// (what's under them, where the map is of other ground: the village's houses and things on earth, the town's on flagstones)
const HUMAN_GROUND = {earth, paving, lawn, sand};
// (looking past the object's own squares, so every square under a big one has the same ground: the village's old tree, two
// squares by two, had a square of the town's flagstones under it, 4 November 2026)
const groundNear = (x, y, dx, dy) => { const look = tileAt(x, y).look; let k = 1; while (k < 6 && tileAt(x + dx * k, y + dy * k).look === look) k++; return HUMAN_GROUND[tileAt(x + dx * k, y + dy * k).look]; };
const groundUnder = (look, near) => (g, X, Y, x, y) => (groundNear(x, y, 0, 1) || groundNear(x, y, -1, 0) || groundNear(x, y, 1, 0) || near)(g, X, Y, x, y);
for (const k of ['jHouse', 'mudHouse', 'whiteWall', 'wallGate', 'jars', 'baskets', 'sacks', 'cart', 'woodpile', 'fishRack', 'teahouse', 'townSchool', 'stallBuns', 'stallShoes', 'stallFruit', 'stallChanger', 'stallKites', 'well', 'washLine', 'bookTable', 'oldTree'])
  LOOKS[k] = groundUnder(k, LOOKS[k]);

/* ---- buildings and things ---- */
// Each thing is drawn with a dark outline round it (inked), as Area 1's are (decided 4 November 2026, after playing it: the
// rice sacks, the firewood and the mud house couldn't be told from the ground they stood on): drawn on a canvas of its own,
// then its shape a pixel out each way in ink, under it. Thin things (a rope, a washing line, a net) are drawn after, without
// one, and a shadow on the ground before.
const INK = '#2E2218';
function inked(g, o, draw, col = INK){
  const bx = o.x * T - 24, by = o.y * T - 48, w = o.w * T + 48, h = o.h * T + 60;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const t = c.getContext('2d'); t.translate(-bx, -by); draw(t);
  const s = document.createElement('canvas'); s.width = w; s.height = h; const sg = s.getContext('2d');
  sg.drawImage(c, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = col; sg.fillRect(0, 0, w, h);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) g.drawImage(s, bx + dx, by + dy);
  g.drawImage(c, bx, by);
}
const ink = draw => (g, o) => inked(g, o, t => draw(t, o));
const shadowUnder = (g, cx, cy, rx) => { if (shadows) blob(g, cx, cy, rx, 1.5, ROCK_SHADOW); };
const roofTiles = (g, x, y, w, h) => {   // dark grey tiles: rows of half-round tiles running down the roof, a ridge along the top curling up at both ends, and the tiles' round ends along the eave
  R(g, x, y, w, h, HW.tile);
  for (let c = x + 1; c < x + w - 1; c += 3){ R(g, c, y, 1, h, HW.tileLt); R(g, c + 1, y, 1, h, '#4A5257'); }
  for (let r = y + 4; r < y + h; r += 4) R(g, x, r, w, 1, HW.tileDk);
  R(g, x - 2, y - 2, w + 4, 3, HW.tileDk); R(g, x - 2, y - 2, w + 4, 1, HW.tileLt);
  R(g, x - 4, y - 3, 3, 2, HW.tileDk); R(g, x - 5, y - 5, 2, 2, HW.tileDk); R(g, x + w + 1, y - 3, 3, 2, HW.tileDk); R(g, x + w + 3, y - 5, 2, 2, HW.tileDk);
  R(g, x - 2, y + h, w + 4, 2, HW.tileDk); for (let c = x - 1; c < x + w + 2; c += 3) R(g, c, y + h + 1, 2, 1, HW.tileLt);
};
const woodDoor = (g, x, y, w = 8, h = 12) => { R(g, x - 1, y - 1, w + 2, h + 1, HW.woodLt); R(g, x, y, w, h, HW.wood); R(g, x + w / 2, y, 1, h, '#3E2614'); R(g, x + 1, y + 2, w / 2 - 2, 3, '#4E3018'); R(g, x + w / 2 + 2, y + 2, w / 2 - 3, 3, '#4E3018'); R(g, x + 2, y + 7, 1, 1, '#E0B050'); R(g, x + w - 3, y + 7, 1, 1, '#E0B050'); };
const lattice = (g, x, y, w = 8, h = 6) => { R(g, x - 1, y - 1, w + 2, h + 2, HW.woodLt); R(g, x, y, w, h, '#6E4A2A'); for (let i = 1; i < w; i += 2) R(g, x + i, y + 1, 1, h - 2, '#D9C49A'); R(g, x + 1, y + h / 2, w - 2, 1, '#6E4A2A'); };
const lantern = (g, x, y) => { R(g, x + 1, y - 3, 1, 3, '#3A2A1E'); oval(g, x + 1, y + 3, 3, 4, '#D8342C'); R(g, x, y + 1, 1, 4, '#F06A50'); R(g, x - 1, y, 5, 1, '#F2C04A'); R(g, x - 1, y + 6, 5, 1, '#F2C04A'); };
function jHouse(g, o, sign){   // a white-walled house with a dark tiled roof, wooden posts at its corners, a wooden door and lattice windows
  const X = o.x * T, Y = o.y * T, W = o.w * T, H = o.h * T, roofH = Math.round(H * .45);
  R(g, X + 1, Y + roofH, W - 2, H - roofH, HW.white); R(g, X + 1, Y + roofH, W - 2, 3, HW.whiteSh);   // (the eave's shadow)
  for (const px of [X + 1, X + W - 4]){ R(g, px, Y + roofH, 3, H - roofH - 3, HW.woodLt); R(g, px + 2, Y + roofH, 1, H - roofH - 3, HW.wood); }
  R(g, X + 1, Y + H - 3, W - 2, 3, HW.plinth); R(g, X + 1, Y + H - 3, W - 2, 1, '#A8A398'); for (let c = X + 4; c < X + W - 2; c += 7) R(g, c, Y + H - 2, 1, 2, '#6E6A62');
  roofTiles(g, X + 1, Y - 6, W - 2, roofH + 4);
  woodDoor(g, X + W / 2 - 4, Y + H - 15, 8, 12);
  if (W >= 48) for (const wx of [X + 7, X + W - 15, ...(W >= 112 ? [X + Math.round(W / 4) - 4, X + Math.round(W * 3 / 4) - 4] : [])]) lattice(g, wx, Y + roofH + 6);
  if (sign) sign(g, X, Y, W, H);
}
function mudHouse(g, o){   // a fisherman's house: mud-brick walls on a stone footing, under a thick thatched roof tied along its ridge
  const X = o.x * T, Y = o.y * T, W = o.w * T, H = o.h * T, roofH = Math.round(H * .5), L = X - 3, RW = W + 6;
  inked(g, o, t => {
    R(t, X + 2, Y + roofH, W - 4, H - roofH, HW.mud); R(t, X + 2, Y + roofH, W - 4, 4, HW.mudDk);   // (the thatch's shadow)
    for (let r = Y + roofH + 6, k = 0; r < Y + H - 3; r += 4, k++) for (let c = X + 2 - (k % 2) * 4; c < X + W - 2; c += 8){   // the bricks' joints, inside the wall
      const a = Math.max(c, X + 3), b = Math.min(c + 7, X + W - 3); if (b > a) R(t, a, r, b - a, 1, HW.mudDk);
      if (c + 7 > X + 3 && c + 7 < X + W - 3) R(t, c + 7, r - 3, 1, 3, HW.mudDk);
    }
    R(t, X + 2, Y + H - 3, W - 4, 3, '#8C877D'); for (let c = X + 5; c < X + W - 3; c += 6) R(t, c, Y + H - 3, 1, 3, '#6E6A62');   // its footing of stones
    lattice(t, X + 6, Y + roofH + 7, 7, 5);   // a little window
    woodDoor(t, X + W / 2 - 4, Y + H - 14, 8, 11);
    for (let i = 0; i < roofH + 8; i++){ const inset = Math.max(0, Math.round((7 - i) * 1.4)); R(t, L + inset, Y - 8 + i, RW - inset * 2, 1, HW.thatch); }   // the thatch, rounded at its top
    for (let c = L + 1; c < L + RW - 1; c += 2){   // its straw, streaked, hanging in a ragged fringe at the eave
      const top = Y - 8 + Math.max(0, 7 - Math.floor((Math.min(c - L, L + RW - c)) / 1.4)) + 2;
      R(t, c, top + Math.floor(rnd(c, o.y, 510) * 4), 1, 3 + Math.floor(rnd(c, o.y, 511) * 6), (c >> 1) % 3 ? HW.thatchDk : '#E2C47A');
      R(t, c, Y + roofH - 1, 1, 2 + Math.floor(rnd(c, o.y, 512) * 3), c % 4 ? HW.thatchDk : HW.thatch);
    }
    R(t, L + 10, Y - 8, RW - 20, 3, '#9A7A3A'); for (let c = L + 14; c < L + RW - 12; c += 10) R(t, c, Y - 8, 2, 4, '#5E4A2A');   // the ridge, tied down
  });
  for (let k = 0; k < 4; k++) R(g, X + W / 2 + 6, Y + roofH + 4 + k * 2, 2, 2, k % 2 ? '#C23A2E' : '#E0503A');   // a string of red chillies drying by the door
}
function marketStall(g, o, awn, goods, sign){   // a stall: a cloth awning on poles over a counter of goods, a sign hanging at its side
  const X = o.x * T, Y = o.y * T, W = o.w * T;
  shadowUnder(g, X + W / 2, Y + 14, W / 2);
  inked(g, o, t => {
    R(t, X + 1, Y - 12, 2, 26, HW.wood); R(t, X + W - 3, Y - 12, 2, 26, HW.wood);
    for (let i = 0; i < W; i++) R(t, X + i, Y - 14 + (i % 8 < 4 ? 0 : 1), 1, 5, i % 8 < 4 ? awn : '#F2EEE4');
    for (let i = 0; i < W; i += 4) R(t, X + i, Y - 9, 2, 1, i % 8 < 4 ? awn : '#F2EEE4');   // (its scalloped edge)
    R(t, X + 2, Y + 3, W - 4, 10, HW.woodLt); R(t, X + 2, Y + 3, W - 4, 1, '#B07A48'); R(t, X + 2, Y + 12, W - 4, 1, HW.wood);
    for (let c = X + 8; c < X + W - 4; c += 8) R(t, c, Y + 4, 1, 8, HW.wood);   // (its boards)
    goods(t, X + 4, Y - 1, W - 8);
  });
  if (sign) sign(g, X + W - 1, Y - 8);
}
const vSign = text => (g, x, y) => { const n = [...text].length; R(g, x - 1, y - 1, 14, n * 12 + 3, HW.wood); R(g, x, y, 12, n * 12 + 1, '#F2E6C4'); write(g, text, x + 1, y + 1, '#2A1A10', {down: true}); };
// A sack of rice: closed, tied at its neck with its two corners sticking up; or open, its top rolled down, full of rice.
const SACK = ['#E6D6AE', '#CDB98A', '#A8925F', '#BFA977'];
function sack(g, x, y, w, h, open){
  const m = x + (w >> 1);
  R(g, x + 1, y, w - 2, h, SACK[1]); R(g, x, y + 1, w, h - 2, SACK[1]);
  R(g, x + 1, y + 1, 1, h - 2, SACK[0]); R(g, x + w - 2, y + 1, 1, h - 2, SACK[2]); R(g, x + 1, y + h - 2, w - 2, 1, SACK[2]);
  for (let r = y + 3; r < y + h - 2; r += 2) R(g, x + 2, r, w - 4, 1, SACK[3]);   // (the sacking's weave)
  if (open){ R(g, x, y, w, 2, SACK[0]); R(g, x, y + 2, w, 1, SACK[2]); R(g, x + 1, y - 1, w - 2, 2, '#F6F3EA'); R(g, x + 2, y - 2, w - 4, 1, '#F6F3EA'); R(g, x + 3, y - 1, 1, 1, '#D9D3C2'); R(g, x + 5, y, 1, 1, '#D9D3C2'); }
  else { R(g, m - 1, y - 2, 3, 2, SACK[1]); R(g, m - 1, y - 1, 3, 1, '#6E5A3A'); R(g, m - 3, y - 4, 2, 1, SACK[0]); R(g, m - 2, y - 3, 5, 1, SACK[1]); R(g, m + 2, y - 4, 2, 1, SACK[1]); }
}
function basket(g, x, y, w, h, inside){   // a round bamboo basket, from the front and a little above: woven sides, a rim, and what's in it
  R(g, x + 1, y + 1, w - 2, h, '#C9A25A'); R(g, x, y + 1, w, h - 1, '#C9A25A');
  for (let r = y + 3; r < y + h; r++) for (let c = x + 1 + (r % 2); c < x + w - 1; c += 2) R(g, c, r, 1, 1, '#A8823E');
  R(g, x, y, w, 2, '#E8C682'); R(g, x + 1, y + 2, w - 2, 1, '#8E6A30');
  if (inside === 'fish') for (const [dx, dy] of [[1, -2], [3, -3]]){ R(g, x + dx, y + dy, 2, 3, '#AEBBC2'); R(g, x + dx, y + dy, 1, 3, '#7F8E98'); R(g, x + dx + 1, y + dy, 1, 1, '#1E1A16'); }
  else if (inside === 'greens'){ oval(g, x + 2, y - 1, 2, 1, '#5E9A3C'); oval(g, x + w - 3, y - 1, 2, 1, '#86C25A'); }
  else R(g, x + 1, y, w - 2, 1, '#5A3E1E');
}
Object.assign(OBJECT_ART, {
  jHouse: ink((g, o) => jHouse(g, o)),
  mudHouse,
  townSchool: ink((g, o) => jHouse(g, o, (g, X, Y, W) => { const sx = X + W / 2 - 13; R(g, sx - 1, Y + 9, 28, 15, HW.wood); R(g, sx, Y + 10, 26, 13, '#1E2A3A'); write(g, '学校', sx + 2, Y + 11, '#F2D27A'); })),
  teahouse: ink((g, o) => {   // the teahouse: a red flag with 茶 on a pole, two red lanterns and a little balcony
    jHouse(g, o);
    const X = o.x * T, Y = o.y * T, W = o.w * T, H = o.h * T;
    R(g, X + 3, Y + H - 18, W - 6, 2, HW.woodLt); for (let i = X + 4; i < X + W - 4; i += 4) R(g, i, Y + H - 16, 1, 3, HW.woodLt);
    lantern(g, X + 10, Y + H - 26); lantern(g, X + W - 12, Y + H - 26);
    const fx = X + W - 4, fy = Y - 6; R(g, fx, fy, 2, 42, HW.wood); R(g, fx - 16, fy + 2, 16, 20, '#C23A2E'); R(g, fx - 16, fy + 2, 16, 2, '#E8605A'); R(g, fx - 16, fy + 20, 16, 2, '#8E241C');
    write(g, '茶', fx - 14, fy + 6, '#F6E7C4');
  }),
  whiteWall: (g, o) => { const X = o.x * T, Y = o.y * T, W = o.w * T; R(g, X, Y + 2, W, 14, HW.white); R(g, X, Y + 2, W, 2, HW.whiteSh); R(g, X, Y + 13, W, 3, HW.plinth); R(g, X, Y + 13, W, 1, '#A8A398'); roofTiles(g, X + 2, Y - 2, W - 4, 3); },   // (no outline: a wall runs on into the next, and lines between its squares showed)
  wallGate: (g, o) => {   // a wooden gate in the white wall, with a little tiled roof over it
    const X = o.x * T, Y = o.y * T;
    R(g, X, Y + 2, T, 14, HW.white); R(g, X, Y + 13, T, 3, HW.plinth); roofTiles(g, X + 1, Y - 4, T - 2, 3);
    R(g, X + 2, Y + 2, 12, 14, HW.woodLt); R(g, X + 3, Y + 3, 10, 13, HW.wood); R(g, X + 8, Y + 3, 1, 13, '#3E2614');
    for (let r = Y + 5; r < Y + 15; r += 4) R(g, X + 3, r, 10, 1, '#4E3018');
    R(g, X + 6, Y + 9, 1, 1, '#E0B050'); R(g, X + 10, Y + 9, 1, 1, '#E0B050');
  },
  bambooFence: (g, o) => { const X = o.x * T, Y = o.y * T, W = o.w * T; for (let i = X + 1; i < X + W; i += 3){ R(g, i, Y - 2, 2, 15, '#B9A35A'); R(g, i, Y + 3, 2, 1, '#8E7A3A'); } R(g, X, Y + 1, W, 2, '#8E7A3A'); R(g, X, Y + 8, W, 2, '#8E7A3A'); },
  bamboo: (g, o) => {   // a grove of bamboo: long, straight green stalks with dark joints at even steps, lit down one side, in the shade between them, with sprays of thin leaves, and leafy tops along its edge. Each square keeps to itself, its stalks lining up with those above and below it (decided 4 November 2026: stalks rising over the square above hung over paths, so they looked blocked, and a grove of them was a muddle of green)
    const X = o.x * T, Y = o.y * T, inGrove = (dx, dy) => tileAt(o.x + dx, o.y + dy).look === 'bamboo';
    R(g, X, Y, T, T, '#2F5A26');   // the shade among the stalks
    const leaf = (x, y, dir, c) => { for (let i = 0; i < 5; i++){ const lx = x + dir * i; if (lx >= X && lx < X + T) R(g, lx, y + (i >> 1), 1, 1, c); } };
    const STALKS = [[0, '#4E8236', '#6FA444'], [4, '#6FA444', '#A6D068'], [8, '#5E9A3C', '#86B556'], [12, '#6FA444', '#A6D068']];
    STALKS.forEach(([sx, c, lt], k) => {
      const x = X + sx + Math.floor(rnd(o.x, k, 601) * 2), j0 = Math.floor(rnd(o.x, k, 602) * 9);   // (by column only, so it lines up with the squares above and below)
      R(g, x, Y, 3, T, c); R(g, x, Y, 1, T, lt); R(g, x + 2, Y, 1, T, '#3E6A26');
      for (let j = 0; j < T; j++) if ((Y + j + j0) % 9 === 0){ R(g, x - 1, Y + j, 5, 1, '#2A4A20'); R(g, x, Y + j + 1, 3, 1, lt); }   // its joints, a little wider than it
    });
    for (let n = 0; n < 2; n++) if (rnd(o.x, o.y, 610 + n) < .6){   // a spray of leaves or two
      const sx = X + 2 + Math.floor(rnd(o.x, o.y, 612 + n) * 12), sy = Y + 2 + Math.floor(rnd(o.x, o.y, 614 + n) * 10), d = rnd(o.x, o.y, 616 + n) < .5 ? -1 : 1;
      leaf(sx, sy, d, '#3F7A2E'); leaf(sx, sy + 2, d, '#5E9A3C'); leaf(sx, sy + 4, d, '#3F7A2E');
    }
    if (!inGrove(0, -1)){   // its edge: a leafy top
      R(g, X, Y, T, 3, '#3F7A2E');
      for (let i = 0; i < T; i += 3){ leaf(X + i, Y + 1, -1, '#5E9A3C'); leaf(X + i + 1, Y + 2, 1, '#86B556'); }
    }
    if (!inGrove(0, 1)) R(g, X, Y + T - 1, T, 1, '#24451E');   // (its foot, in shadow)
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
    // its trunk, reaching right up into its leaves, with two branches spreading under them (so no gap shows between them)
    R(g, X + W / 2 - 3, Y - 6, 6, 30, '#4E3624'); R(g, X + W / 2 - 1, Y - 6, 2, 30, '#6B4A30'); R(g, X + W / 2 - 4, Y + 20, 8, 4, '#4E3624');   // (wider at its foot)
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) R(g, X + W / 2 + s * (2 + i), Y + 1 - i, 2, 2, '#4E3624');
    for (const [dx, dy, r, c] of [[-10, -6, 12, '#2F5A2E'], [10, -8, 13, '#2F5A2E'], [0, -16, 15, '#3A6E36'], [-6, -10, 10, '#4A8040'], [8, -14, 9, '#4A8040']]) oval(g, X + W / 2 + dx, Y + dy, r, Math.round(r * .8), c);
    for (const dx of [-7, 0, 7]) R(g, X + W / 2 + dx - 1, Y - 1, 3, 1, '#24452A');   // shade under its leaves, where the branches go in
  },
  jars: (g, o) => {   // two big glazed water jars, one with a wooden lid, the other full of water
    const X = o.x * T, Y = o.y * T; shadowUnder(g, X + 8, Y + 15, 8);
    inked(g, o, t => { for (const [cx, s, lid] of [[5, 5, true], [12, 4, false]]){
      const top = Y + 14 - s * 2 - 1;
      blob(t, X + cx, Y + 14 - s, s, s, '#6A3A22'); blob(t, X + cx - 1, Y + 13 - s, s - 1, s - 1, '#8A4E2C'); R(t, X + cx - s + 2, Y + 12 - s, 1, 3, '#C88A60');
      R(t, X + cx - s + 1, top, s * 2 - 1, 2, '#4A2614'); R(t, X + cx - s + 1, top, s * 2 - 1, 1, '#9A5E3A');
      if (lid){ R(t, X + cx - s, top - 2, s * 2 + 1, 2, WOODS[3]); R(t, X + cx - s, top - 2, s * 2 + 1, 1, WOODS[4]); R(t, X + cx - 1, top - 3, 2, 1, WOODS[2]); }
      else R(t, X + cx - s + 2, top + 1, s * 2 - 3, 1, '#4F8E95');
    } });
  },
  baskets: (g, o) => {   // round bamboo baskets: one with fish in it, one with greens, an empty one behind
    const X = o.x * T, Y = o.y * T; shadowUnder(g, X + 8, Y + 15, 8);
    inked(g, o, t => { basket(t, X + 4, Y + 2, 8, 5, 'empty'); basket(t, X + 1, Y + 8, 7, 6, 'fish'); basket(t, X + 9, Y + 9, 7, 5, 'greens'); });
  },
  sacks: (g, o) => {   // sacks of rice: two tied up behind, one open in front, full of rice, a few grains spilt
    const X = o.x * T, Y = o.y * T; shadowUnder(g, X + 8, Y + 15, 8);
    inked(g, o, t => { sack(t, X + 1, Y + 5, 7, 8); sack(t, X + 8, Y + 4, 7, 8); sack(t, X + 4, Y + 9, 8, 6, true); });
    for (const [dx, dy] of [[2, 15], [13, 15], [14, 14]]) R(g, X + dx, Y + dy, 1, 1, '#F6F3EA');
  },
  cart: (g, o) => {   // a wooden handcart, side on: its bed of planks, a big spoked wheel, a handle, and cabbages and a pumpkin on it
    const X = o.x * T, Y = o.y * T; shadowUnder(g, X + 7, Y + 15, 9);
    inked(g, o, t => {
      R(t, X - 6, Y + 6, 8, 2, WOODS[2]); R(t, X - 6, Y + 6, 8, 1, WOODS[3]);   // its handle
      R(t, X + 1, Y + 9, 2, 6, WOODS[1]);   // its leg
      blob(t, X + 4, Y + 3, 2, 2, '#5E9A3C'); R(t, X + 3, Y + 2, 2, 1, '#86C25A'); blob(t, X + 9, Y + 2, 3, 2, '#E0902A'); R(t, X + 8, Y + 1, 2, 1, '#F2B860'); R(t, X + 9, Y - 1, 1, 1, '#5E7A2A'); blob(t, X + 13, Y + 3, 2, 2, '#6FAA48');
      R(t, X, Y + 5, 16, 5, WOODS[2]); R(t, X, Y + 5, 16, 1, WOODS[4]); R(t, X, Y + 9, 16, 1, WOODS[1]); for (let c = X + 4; c < X + 16; c += 4) R(t, c, Y + 6, 1, 3, WOODS[1]);
      blob(t, X + 9, Y + 11, 4, 4, WOODS[0]); blob(t, X + 9, Y + 11, 3, 3, WOODS[3]);   // the wheel
      R(t, X + 9, Y + 8, 1, 7, WOODS[0]); R(t, X + 6, Y + 11, 7, 1, WOODS[0]); for (const [dx, dy] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) R(t, X + 9 + dx, Y + 11 + dy, 1, 1, WOODS[0]);
      R(t, X + 8, Y + 10, 3, 3, WOODS[1]); R(t, X + 9, Y + 11, 1, 1, WOODS[4]);
    });
  },
  woodpile: (g, o) => {   // firewood, stacked: logs seen end on, their bark dark, the cut ends pale with rings, each log's length going back
    const X = o.x * T, Y = o.y * T, logs = [[3, 13], [8, 13], [13, 13], [5, 9], [10, 9], [7, 5]];
    shadowUnder(g, X + 9, Y + 15, 8);
    inked(g, o, t => {
      for (const [cx, cy] of logs) for (let k = 3; k >= 1; k--) blob(t, X + cx + k, Y + cy - k, 2, 2, k === 3 ? '#4E321C' : '#6E4626');
      for (const [cx, cy] of logs) for (let k = 1; k <= 2; k++) R(t, X + cx + k - 1, Y + cy - k - 2, 2, 1, '#8A5E36');   // (the bark lit along the top)
      for (const [cx, cy] of logs){ blob(t, X + cx, Y + cy, 2, 2, '#5A3A1E'); blob(t, X + cx, Y + cy, 1, 1, '#E8C88E'); R(t, X + cx, Y + cy, 1, 1, '#B08850'); }
    });
  },
  fishRack: (g, o) => {   // a rack of fish drying in the sun, hung by their tails from a pole
    const X = o.x * T, Y = o.y * T, W = o.w * T, at = [];
    for (let i = X + 5; i < X + W - 6; i += 5) at.push(i);
    inked(g, o, t => {
      R(t, X + 1, Y - 7, 2, 22, HW.wood); R(t, X + W - 3, Y - 7, 2, 22, HW.wood); R(t, X, Y - 8, W, 2, HW.woodLt); R(t, X, Y - 7, W, 1, HW.wood);
      for (const i of at){
        R(t, i, Y - 3, 1, 1, '#7F8E98'); R(t, i + 2, Y - 3, 1, 1, '#7F8E98'); R(t, i + 1, Y - 2, 1, 1, '#7F8E98');   // its tail, at the top
        R(t, i, Y - 1, 3, 6, '#AEBBC2'); R(t, i, Y - 1, 1, 6, '#7F8E98'); R(t, i + 2, Y - 1, 1, 6, '#D6DEE2'); R(t, i + 1, Y + 5, 1, 1, '#AEBBC2'); R(t, i + 1, Y + 3, 1, 1, '#1E1A16');
      }
    });
    for (const i of at) R(g, i + 1, Y - 6, 1, 3, '#7A6A55');   // (the strings)
  },
  archBridge: (g, o) => {   // a stone bridge arching over the canal, with low railings
    const X = o.x * T, Y = o.y * T, W = o.w * T, H = o.h * T;
    R(g, X, Y, W, H, '#ADA79C'); for (let r = Y + 2; r < Y + H; r += 4) R(g, X, r, W, 1, '#968F84');
    for (const sx of [X, X + W - 3]){ R(g, sx, Y - 4, 3, H + 4, '#8C877D'); R(g, sx, Y - 4, 3, 1, '#C6C0B5'); for (let r = Y; r < Y + H; r += 8) R(g, sx - 1, r - 6, 5, 3, '#C6C0B5'); }
  },
  well: (g, o) => {   // a village well: a round wall of stones, a little tiled roof on two posts over it, a winch with its rope, and the bucket on its rim
    const X = o.x * T, Y = o.y * T; shadowUnder(g, X + 8, Y + 15, 8);
    inked(g, o, t => {
      R(t, X + 1, Y - 9, 2, 20, WOODS[1]); R(t, X + 13, Y - 9, 2, 20, WOODS[1]); R(t, X + 1, Y - 9, 1, 20, WOODS[2]); R(t, X + 13, Y - 9, 1, 20, WOODS[2]);
      for (let i = 0; i < 4; i++) R(t, X + 4 - i, Y - 14 + i, 8 + i * 2, 1, i === 3 ? HW.tileDk : i ? HW.tile : HW.tileLt);   // its little roof
      R(t, X + 1, Y - 6, 14, 2, WOODS[2]); R(t, X + 6, Y - 7, 4, 4, WOODS[3]); R(t, X + 6, Y - 6, 4, 1, '#C8B890'); R(t, X + 6, Y - 4, 4, 1, '#C8B890');   // the winch, the rope wound round it
      blob(t, X + 8, Y + 11, 7, 4, '#8C877D'); blob(t, X + 8, Y + 10, 7, 3, '#B3ADA2'); blob(t, X + 8, Y + 9, 4, 1, '#24363A');
      for (const [dx, dy] of [[-5, 1], [-2, 2], [1, 2], [4, 2], [6, 0], [-6, -1]]) R(t, X + 8 + dx, Y + 11 + dy, 1, 2, '#8C877D');   // (the stones' joints)
      R(t, X + 11, Y + 3, 4, 4, WOODS[3]); R(t, X + 11, Y + 4, 4, 1, WOODS[1]); R(t, X + 11, Y + 3, 4, 1, WOODS[4]);   // the bucket
    });
    R(g, X + 8, Y - 3, 1, 12, '#C8B890');   // (the rope, down into the water)
  },
  washLine: (g, o) => {   // washing on a line between two bamboo poles: shirts and trousers, pegged up
    const X = o.x * T, Y = o.y * T, W = o.w * T, cols = [['#3E5A86', '#2F4570'], ['#F2EEE4', '#CFC8B8'], ['#C7902F', '#9E7024'], ['#5E8F3A', '#47702C'], ['#F2EEE4', '#CFC8B8']], at = [];
    for (let i = 0, cx = X + 5; cx + 8 < X + W - 3; i++, cx += 10) at.push([cx, i]);
    R(g, X + 2, Y - 5, W - 4, 1, '#E8E0C8');   // (the line)
    inked(g, o, t => {
      R(t, X + 1, Y - 7, 2, 22, '#B9A35A'); R(t, X + W - 3, Y - 7, 2, 22, '#B9A35A'); for (let r = Y - 2; r < Y + 15; r += 6){ R(t, X + 1, r, 2, 1, '#8E7A3A'); R(t, X + W - 3, r, 2, 1, '#8E7A3A'); }
      for (const [cx, i] of at){ const [c, dk] = cols[i % cols.length];
        if (i % 2 === 0){ R(t, cx, Y - 4, 8, 3, c); R(t, cx + 2, Y - 1, 4, 6, c); R(t, cx + 3, Y - 4, 2, 1, dk); R(t, cx + 2, Y + 4, 4, 1, dk); }   // a shirt, its sleeves out
        else { R(t, cx + 1, Y - 4, 6, 3, c); R(t, cx + 1, Y - 1, 2, 6, c); R(t, cx + 5, Y - 1, 2, 6, c); R(t, cx + 1, Y - 4, 6, 1, dk); }   // trousers
      }
    });
    for (const [cx] of at){ R(g, cx + 1, Y - 6, 1, 2, '#8E6A30'); R(g, cx + 6, Y - 6, 1, 2, '#8E6A30'); }   // (the pegs)
  },
  bookTable: ink((g, o) => {   // a little table of books by the school, open and stacked
    const X = o.x * T, Y = o.y * T;
    R(g, X + 1, Y + 6, 14, 3, HW.woodLt); R(g, X + 1, Y + 6, 14, 1, '#B07A48'); R(g, X + 2, Y + 9, 2, 6, HW.wood); R(g, X + 12, Y + 9, 2, 6, HW.wood);
    R(g, X + 2, Y + 4, 6, 2, '#C23A2E'); R(g, X + 2, Y + 2, 6, 2, '#3E5A86'); R(g, X + 3, Y + 0, 5, 2, '#5E8F3A');
    R(g, X + 9, Y + 4, 5, 2, '#F2EEE4'); R(g, X + 11, Y + 4, 1, 2, '#9E988C');   // an open book
  }),
  netRack: (g, o) => {   // a fishing net hung up to dry between two poles, red and white floats along its top
    const X = o.x * T, Y = o.y * T;
    inked(g, o, t => { R(t, X + 1, Y - 7, 2, 22, WOODS[1]); R(t, X + 13, Y - 7, 2, 22, WOODS[1]); R(t, X, Y - 8, 16, 2, WOODS[2]); });
    for (let j = 0; j < 14; j += 3) R(g, X + 3, Y - 5 + j + (j > 6 ? 1 : 0), 10, 1, '#C8BFA0');
    for (let i = 0; i < 11; i += 3) R(g, X + 3 + i, Y - 5, 1, 15, '#C8BFA0');
    for (let i = 0; i < 3; i++) R(g, X + 4 + i * 3, Y - 6, 2, 2, i % 2 ? '#F2EEE4' : '#C23A2E');
  },
  boat: (g, o) => {   // a little fishing boat with a roof of dark woven matting, its ends curving up
    const X = o.x * T, Y = o.y * T, W = o.w * T, rx = X + Math.round(W * .3), rw = Math.round(W * .45);
    inked(g, o, t => {
      for (let r = 0; r < 6; r++){ const inset = r < 2 ? 2 - r : 0; R(t, rx + inset, Y + 2 + r, rw - inset * 2, 1, r < 2 ? '#55504A' : '#3A3530'); }
      for (let k = 2; k < rw - 1; k += 3) R(t, rx + k, Y + 3, 1, 5, '#2A2622');
      R(t, X + 1, Y + 7, 3, 2, WOODS[2]); R(t, X + W - 4, Y + 7, 3, 2, WOODS[2]);
      for (let i = 0; i < 5; i++){ const inset = [0, 1, 2, 3, 5][i]; R(t, X + 1 + inset, Y + 8 + i, W - 2 - inset * 2, 1, i === 0 ? WOODS[4] : i % 2 ? WOODS[1] : WOODS[2]); }
    });
  },
  bigBoat: ink((g, o) => {   // a boat to cross the sea: a mast and a battened sail, a cabin at its stern, and an eye on its bow
    const X = o.x * T, Y = o.y * T, W = o.w * T;
    R(g, X + W - 14, Y - 2, 10, 8, WOODS[2]); R(g, X + W - 15, Y - 3, 12, 2, WOODS[1]); R(g, X + W - 11, Y + 1, 3, 3, '#3A2A1E');
    for (let i = 0; i < 7; i++) R(g, X + i, Y + 7 + i, W - 2 * i, 1, i % 2 ? WOODS[1] : WOODS[2]);
    R(g, X, Y + 6, W, 2, WOODS[3]); R(g, X + 3, Y + 8, 3, 3, '#F2EEE4'); R(g, X + 4, Y + 9, 1, 1, '#1E1A16');
    R(g, X + 21, Y - 30, 2, 37, WOODS[0]);
    for (let r = 0; r < 26; r++) R(g, X + 8 + Math.round(r / 6), Y - 28 + r, 12 - Math.round(r / 8), 1, r % 5 === 0 ? '#6A2A1A' : '#B5462E');
  }),
  scarecrow: ink((g, o) => {   // a scarecrow in the rice, in a patched coat and a straw hat
    const X = o.x * T, Y = o.y * T;
    R(g, X + 7, Y - 8, 2, 22, WOODS[1]); R(g, X + 1, Y - 2, 14, 2, WOODS[1]); R(g, X + 3, Y - 2, 10, 9, '#5A6E8A'); R(g, X + 5, Y + 1, 3, 3, '#C0504D');
    oval(g, X + 8, Y - 7, 3, 3, '#E8D8A0'); R(g, X + 6, Y - 8, 1, 1, '#3A2A1E'); R(g, X + 9, Y - 8, 1, 1, '#3A2A1E'); R(g, X + 1, Y - 11, 14, 2, '#D9B866'); R(g, X + 4, Y - 13, 8, 2, '#D9B866');
  }),
  coatOnSand: ink((g, o) => {   // a coat left on the sand, laid out flat: its sleeves spread, a collar, a belt and toggles down its front
    const X = o.x * T, Y = o.y * T, c = '#7A6A55', lt = '#9A8A70', dk = '#5A4C3C';
    R(g, X + 4, Y + 3, 8, 11, c); R(g, X + 3, Y + 11, 10, 3, c); R(g, X + 1, Y + 4, 3, 7, c); R(g, X + 12, Y + 4, 3, 7, c);
    R(g, X + 4, Y + 3, 8, 1, lt); R(g, X + 1, Y + 4, 3, 1, lt); R(g, X + 12, Y + 4, 3, 1, lt); R(g, X + 1, Y + 10, 3, 1, dk); R(g, X + 12, Y + 10, 3, 1, dk);
    R(g, X + 6, Y + 3, 4, 2, dk); R(g, X + 7, Y + 5, 2, 1, dk); R(g, X + 8, Y + 5, 1, 9, dk); R(g, X + 4, Y + 9, 8, 1, '#3A2A1E');
    for (const dy of [6, 8, 11]) R(g, X + 7, Y + dy, 1, 1, '#D8C9A0');
  }),
  hatOnSand: ink((g, o) => {   // a straw hat left on the sand: a wide cone, woven
    const X = o.x * T, Y = o.y * T;
    R(g, X + 7, Y + 3, 2, 1, '#A88A3E');
    for (let r = 0; r < 7; r++){ const w = 3 + r * 2; R(g, X + 8 - (w >> 1), Y + 4 + r, w, 1, r % 2 ? '#C9A452' : '#D9B866'); }
    R(g, X + 1, Y + 11, 14, 1, '#A88A3E');
    for (const [dx, dy] of [[-1, 2], [-3, 4], [-5, 6], [1, 2], [3, 4], [5, 6]]) R(g, X + 8 + dx, Y + 4 + dy, 1, 1, '#B8963E');
  }),
  stallBuns: (g, o) => marketStall(g, o, HW.indigo, (g, x, y, w) => { for (let i = 0; i + 14 <= w; i += 15){ R(g, x + i, y + 2, 13, 5, '#C9A060'); R(g, x + i, y + 2, 13, 1, '#E0BC78'); for (let k = 0; k < 3; k++){ oval(g, x + i + 2 + k * 4, y + 1, 2, 2, '#F6EFE2'); R(g, x + i + 2 + k * 4, y, 1, 1, '#D9CDB8'); } } }, vSign('包子')),
  stallShoes: (g, o) => marketStall(g, o, HW.red, (g, x, y, w) => { for (let i = 0; i + 7 <= w; i += 8){ const c = ['#2A2A2A', '#3E5A86', '#7A3A2A'][i / 8 % 3]; for (const dx of [0, 4]){ R(g, x + i + dx, y + 3, 3, 3, c); R(g, x + i + dx, y + 5, 3, 1, '#E8E0D0'); } } }),
  stallFruit: (g, o) => marketStall(g, o, HW.ochre, (g, x, y, w) => { const c = [['#D8342C', '#FF8A80'], ['#F2A0A0', '#FFE0CF'], ['#5E9A3C', '#9ACD52'], ['#E8D27A', '#FFF2B0'], ['#D8642C', '#F2A060']]; for (let i = 0, k = 0; i + 7 <= w; i += 8, k++){ const [f, s] = c[k % 5]; R(g, x + i, y + 4, 7, 3, '#B8904A'); R(g, x + i, y + 4, 7, 1, '#E0BE78'); for (const [dx, dy] of [[1, 2], [4, 2], [2, 0]]){ R(g, x + i + dx, y + dy, 2, 2, f); R(g, x + i + dx, y + dy, 1, 1, s); } } }),
  stallKites: (g, o) => marketStall(g, o, '#3E7A5E', (g, x, y, w) => { const c = ['#D8342C', '#F2C04A', '#3E5A86', '#5E9A3C']; for (let i = 0, k = 0; i + 6 <= w; i += 8, k++){ const cx = x + i + 3, cy = y - 6 - (k % 2) * 3; for (let r = 0; r < 4; r++){ R(g, cx - r, cy + r, r * 2 + 1, 1, c[k % 4]); R(g, cx - r, cy + 7 - r, r * 2 + 1, 1, c[(k + 1) % 4]); } R(g, cx, cy, 1, 8, '#F6EFE2'); R(g, cx, cy + 8, 1, 4, '#C8B890'); } }),   // (a stall that's new after the years: kites, hung over its counter)
  stallChanger: (g, o) => marketStall(g, o, '#5E3B22', (g, x, y, w) => { R(g, x + 2, y + 1, 12, 6, HW.wood); for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) R(g, x + 3 + c * 2, y + 2 + r * 3, 1, 1, '#E0C080'); for (let i = 0; i < 3; i++){ oval(g, x + 20 + i * 5, y + 5, 2, 2, '#C89A3E'); R(g, x + 20 + i * 5, y + 5, 1, 1, '#3A2A1E'); } })
});
BLOCK_OBJECTS.push('jHouse', 'mudHouse', 'townSchool', 'teahouse', 'oldTree', 'archBridge', 'boat', 'bigBoat');
ROW_OBJECTS.push('whiteWall', 'bambooFence', 'stallBuns', 'stallShoes', 'stallFruit', 'stallChanger', 'stallKites', 'washLine', 'fishRack');
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
// A card for a jump in time (the manyYearsLater scene: 很多年以后……, its caption): the sun and the moon going over and
// over, faster and faster, above a quiet street, the sky turning from day to night and back, leaves falling.
function drawLaterCard(t, now){
  const W = VW*T, H = VH*T, turn = t * (0.6 + t * 0.35), k = (Math.sin(turn) + 1) / 2;   // (1 day, 0 night)
  for (let y = 0; y < H; y += 2) R(b, 0, y, W, 2, mix(mix('#1C2440', '#8FC4E8', k), '#E8EEF2', y / H * .35));
  const a = turn % (Math.PI * 2), sx = W / 2 - Math.cos(a) * W * .45, sy = H * .62 - Math.sin(a) * H * .5;
  if (k > .5) disc(b, Math.round(sx), Math.round(sy), 9, '#F6D86A'); else { disc(b, Math.round(W - sx), Math.round(sy), 7, '#F2F2E6'); disc(b, Math.round(W - sx) + 3, Math.round(sy) - 2, 6, mix('#1C2440', '#8FC4E8', k)); }
  if (k < .5) for (let i = 0; i < 24; i++) R(b, Math.floor(rnd(i, 3) * W), Math.floor(rnd(i, 4) * H * .5), 1, 1, '#F2F2E6');
  for (let x = 0; x < W; x += 60) jHouse(b, {x:x / T, y:7, w:3, h:2});   // the street
  R(b, 0, H - 16, W, 16, mix('#3E4A44', '#9E988C', k));
  for (let i = 0; i < 8; i++){ const fx = (rnd(i, 9) * W + now / 40 * (1 + i % 3)) % W, fy = (rnd(i, 10) * H + now / 25) % (H - 30); R(b, Math.round(fx), Math.round(fy), 2, 1, ['#D8923A', '#C25A2A', '#E6B04A'][i % 3]); }   // leaves falling
}
Object.assign(SCENE_ART, {drift: drawDrift, yearsPass: drawYearsPass, crossSea: drawCrossSea, manyYearsLater: drawLaterCard});   // (their sounds: SCENE_SOUNDS, js/main.js)
