// The teacher's mountain's look (Area 2, chapter 1, decided 4 November 2026 after three drafts, the plan's mock-ups): above
// the forest at its foot, the mountain has its own look, nothing like home's: pale grey limestone with cracks, bare mossy
// stone, flat-topped pines growing out of the rock, a sea of clouds below everything; a walkway of planks bolted up the
// cliff over the clouds, gusts of wind across it, loose planks hung by chains, a chain up a sheer face; and the cave's
// stone door in a great cliff, its name carved over it. And the mist that rolls in over the stone pillars, and the wisps
// of cloud drifting past. (Loaded after js/human.js: it adds to LOOKS, OBJECT_ART and HANZI.)

Object.assign(HANZI, {   // the tablets' characters: 灵台方寸山 and 斜月三星洞 (三 and 洞 are drawn already)
  '山': [".....#.....", ".....#.....", ".....#.....", "#....#....#", "#....#....#", "#....#....#", "#....#....#", "#....#....#", "#....#....#", "###########", "..........."],
  '月': ["..#######..", "..#.....#..", "..#.....#..", "..#######..", "..#.....#..", "..#.....#..", "..#######..", "..#.....#..", ".#......#..", ".#......#..", "#.....###.."],
  '星': ["..#######..", "..#.....#..", "..#######..", "..#.....#..", "..#######..", "..#..#.....", ".#######...", "#....#.....", "..######...", ".....#.....", "###########"],
  '方': [".....#.....", "......#....", "###########", "...#.......", "...######..", "...#....#..", "..#.....#..", "..#.....#..", ".#......#..", ".#....#.#..", "#......##.."],
  '寸': ["........#..", "........#..", "###########", "........#..", "..#.....#..", "...#....#..", "....#...#..", "........#..", "........#..", "........#..", "......###.."],
  '台': ["....#......", "...#.......", "..#....#...", ".#......#..", "##########.", "...........", ".#######...", ".#.....#...", ".#.....#...", ".#.....#...", ".#######..."],
  '灵': ["..#######..", "........#..", "..#######..", "........#..", "..#######..", ".....#.....", "..#..#..#..", ".#...#.#...", ".....#.....", "....#.#....", "..##...##.."],
  '斜': ["...#....#.#", "..#.#....#.", ".#...#..#..", "#######.#.#", "...#.....#.", "#######.#..", "...#....###", ".#.#.#..#.#", "#..#..#.#..", "...#....#..", "..##....#.."]
});

/* ---- the ground ---- */
const KARST = {top:'#B9C2C6', topDk:'#A3ADB2', topLt:'#D3DADC', face:'#9AA5AB', faceDk:'#7C878E', faceLt:'#C2CBCF', moss:'#6F8F5E', shade:'#5E676D'};
const ROCKY = ['karstTop', 'karstFace', 'chainFace', 'stoneDoor', 'twistedPine'];
const FACES = ['karstFace', 'chainFace', 'stoneDoor'];
// A sea of clouds, seen from above, where the mountain falls away: long soft wisps drifting across, as below a mountain in a
// Chinese painting, running on from square to square (the art review, decided 6 November 2026: round puffs looked like
// bubble wrap). Each wisp belongs to a band of the sea, not a square, so it carries on into the next; each square draws
// its own part of them.
function cloudSea(g, X, Y, x, y){
  g.save(); g.beginPath(); g.rect(X, Y, T, T); g.clip();
  R(g, X, Y, T, T, '#D8E2EB');
  for (let r = Math.floor(Y / 5) - 1; r <= Math.floor((Y + T) / 5); r++){   // a band every five pixels down
    const ry = r * 5 + (r % 2);
    for (let s = Math.floor((X - 40) / 26); s <= Math.floor((X + T) / 26); s++){   // and in it, a wisp every 26 pixels or so, some missing
      if (rnd(s, r, 901) < .35) continue;
      const sx = s * 26 + Math.floor(rnd(s, r, 902) * 10), len = 12 + Math.floor(rnd(s, r, 903) * 22);
      R(g, sx + 1, ry + 2, len - 2, 1, '#C3CFDB'); R(g, sx, ry + 1, len, 1, '#EAF0F5'); R(g, sx + 2, ry, len - 4, 1, '#F7F9FB');
    }
  }
  g.restore();
}
// The top of the limestone, seen from above: pale grey, cracked, a little moss; its edges lit where they meet the clouds.
function karstTop(g, X, Y, x, y){
  R(g, X, Y, T, T, KARST.top);
  for (let i = 0; i < 7; i++){ const px = Math.floor(rnd(x, y, 800 + i) * 14), py = Math.floor(rnd(x, y, 810 + i) * 15); R(g, X + px, Y + py, 3, 1, i % 2 ? KARST.topDk : KARST.topLt); }
  if (rnd(x, y, 823) < .35){   // a crack wandering across it
    let cx = X + 2 + Math.floor(rnd(x, y, 824) * 10);
    for (let i = 0; i < 12; i++){ R(g, cx, Y + 2 + i, 1, 1, KARST.shade); R(g, cx + 1, Y + 2 + i, 1, 1, KARST.topLt); if (rnd(x, y, 825 + i) < .4) cx += rnd(x, y, 840 + i) < .5 ? -1 : 1; }
  }
  if (rnd(x, y, 820) < .3) oval(g, X + 4 + Math.floor(rnd(x, y, 821) * 8), Y + 4 + Math.floor(rnd(x, y, 822) * 8), 3, 2, KARST.moss);
  const open = (dx, dy) => !ROCKY.includes(tileAt(x + dx, y + dy).look) && tileAt(x + dx, y + dy).look !== 'karstTop';
  if (open(-1, 0)) R(g, X, Y, 1, T, KARST.topLt); if (open(1, 0)) R(g, X + T - 2, Y, 2, T, KARST.faceDk); if (open(0, -1)) R(g, X, Y, T, 1, KARST.topLt);
}
// A sheer face of the limestone, fluted from top to bottom, moss along its top, in shadow at its foot. Two squares high, as
// every cliff is.
function karstFace(g, X, Y, x, y){
  R(g, X, Y, T, T, KARST.face);
  const above = FACES.includes(tileAt(x, y - 1).look), below = FACES.includes(tileAt(x, y + 1).look);
  for (let c = 0; c < 16; c += 3){
    const off = above ? 0 : Math.floor(rnd(x * 7 + c, 0, 830) * 6);
    R(g, X + c, Y + off, 1, T - off, KARST.faceDk); R(g, X + c + 1, Y, 1, 4 + Math.floor(rnd(x * 7 + c, y, 831) * 9), KARST.faceLt);
  }
  if (!above){ R(g, X, Y, T, 2, KARST.topLt); for (let i = 0; i < 16; i += 2) if (rnd(x * 16 + i, y, 832) < .5) R(g, X + i, Y + 2, 1, 2 + Math.floor(rnd(x * 16 + i, y, 833) * 3), KARST.moss); }
  if (!below) R(g, X, Y + T - 2, T, 2, KARST.shade);
}
// A chain hung down a sheer face, to climb (its links, catching the light).
function chainFace(g, X, Y, x, y){
  karstFace(g, X, Y, x, y);
  R(g, X + 4, Y, 8, T, KARST.faceDk);   // (worn smooth by hands and feet, darker behind the chain)
  if (!FACES.includes(tileAt(x, y - 1).look) || tileAt(x, y - 1).look !== 'chainFace'){ R(g, X + 5, Y, 6, 3, '#2E2E30'); R(g, X + 6, Y + 1, 4, 1, '#8A8A8A'); }   // its iron ring, at the top
  for (let r = 0; r < 16; r += 4){   // links, one across, one edge on, iron catching the light
    R(g, X + 6, Y + r, 4, 3, '#222224'); R(g, X + 7, Y + r + 1, 2, 1, KARST.faceDk); R(g, X + 6, Y + r, 1, 1, '#C8C8C8');
    R(g, X + 7, Y + r + 3, 2, 1, '#3A3A3C'); R(g, X + 7, Y + r + 3, 1, 1, '#9A9A9A');
  }
}
// The mountain's ground: bare grey stone, mossy, with a tuft of grass here and there.
function mossStone(g, X, Y, x, y){
  R(g, X, Y, T, T, '#A3AC9C');
  for (let i = 0; i < 12; i++){ const px = Math.floor(rnd(x, y, 840 + i) * 15), py = Math.floor(rnd(x, y, 850 + i) * 15); R(g, X + px, Y + py, 2, 1, ['#8F9A88', '#B9C1B2', '#7A9A62'][i % 3]); }
  if (rnd(x, y, 860) < .25){ R(g, X + 5, Y + 9, 1, 3, '#5E8F3A'); R(g, X + 6, Y + 8, 1, 4, '#6FA544'); R(g, X + 7, Y + 10, 1, 2, '#5E8F3A'); }
}
// A walkway of planks over the clouds, on posts, a chain along each side (down: it runs up and down, else across).
function planks(g, X, Y, x, y, down){
  cloudSea(g, X, Y, x, y);
  const side = (dx, dy) => ['plankV', 'plankH', 'windPlank', 'loosePlank'].includes(tileAt(x + dx, y + dy).look);
  if (down){
    R(g, X + 2, Y, 12, T, '#4E3420');
    for (let r = 0; r < 16; r += 4){ R(g, X + 3, Y + r, 10, 3, (r / 4 + y) % 2 ? '#A8743E' : '#B98A55'); R(g, X + 3, Y + r + 3, 10, 1, '#6B4A2A'); }
    for (const [cx, dx] of [[X + 1, -1], [X + 14, 1]]) if (!side(dx, 0)){ R(g, cx, Y, 1, T, '#555555'); for (let r = 2; r < 16; r += 8) R(g, cx - 1, Y + r, 3, 3, '#3A2A1E'); }
  } else {
    R(g, X, Y + 2, T, 12, '#4E3420');
    for (let c = 0; c < 16; c += 4){ R(g, X + c, Y + 3, 3, 10, (c / 4 + x) % 2 ? '#A8743E' : '#B98A55'); R(g, X + c + 3, Y + 3, 1, 10, '#6B4A2A'); }
    for (const [cy, dy] of [[Y + 1, -1], [Y + 14, 1]]) if (!side(0, dy)){ R(g, X, cy, T, 1, '#555555'); for (let c = 2; c < 16; c += 8) R(g, X + c, cy - 1, 3, 3, '#3A2A1E'); }
  }
}
// A loose plank, hung over the clouds by a chain from each corner: hop onto the one with the word's picture (a legend's hop).
function loosePlank(g, X, Y, x, y){
  cloudSea(g, X, Y, x, y);
  R(g, X + 2, Y + 1, 1, 3, '#555555'); R(g, X + 13, Y + 1, 1, 3, '#555555');
  R(g, X + 3, Y + 4, 10, 8, '#4E3420'); R(g, X + 4, Y + 5, 8, 6, '#B98A55'); R(g, X + 4, Y + 7, 8, 1, '#8A5E36'); R(g, X + 4, Y + 5, 8, 1, '#D2A46A');
}
// The ground under a pine growing out of the rock: the rock's, if that's what's round it, or else the mossy stone.
const pineGround = (g, X, Y, x, y) => ([[0, 1], [-1, 0], [1, 0], [0, -1]].filter(([dx, dy]) => tileAt(x + dx, y + dy).look === 'karstTop').length >= 2 ? karstTop : mossStone)(g, X, Y, x, y);
Object.assign(LOOKS, {
  cloudSea, karstTop, karstFace, chainFace, mossStone,
  plankV: (g, X, Y, x, y) => planks(g, X, Y, x, y, true), plankH: (g, X, Y, x, y) => planks(g, X, Y, x, y, false),
  windPlank: (g, X, Y, x, y) => planks(g, X, Y, x, y, true),   // (its gusts are drawn as they blow: drawSteam, js/draw.js)
  loosePlank, twistedPine: pineGround, stoneDoor: karstFace
});

/* ---- big objects ---- */
// A pine growing out of the rock, its trunk bent, its crown in flat layers, as on the mountains in old paintings.
OBJECT_ART.twistedPine = (g, o) => {
  const X = o.x * T, Y = o.y * T, s = rnd(o.x, o.y, 870) < .5 ? -1 : 1;
  for (let i = 0; i < 16; i++) R(g, X + 7 + Math.round(s * Math.sin(i / 5) * 4), Y + 14 - i, 3, 2, i % 4 ? '#5A4630' : '#4A3622');
  for (const [dx, dy, w] of [[s * 3, -2, 9], [s * 7, -6, 7], [-s * 2, -9, 8], [s * 3, -13, 5]]){
    const cx = X + 8 + dx, cy = Y + dy;
    oval(g, cx, cy + 2, w + 1, 2, '#173023'); oval(g, cx, cy, w, 2, '#2C5236'); R(g, cx - w + 2, cy - 1, w, 1, '#4E7C4C');
  }
};
// The cave's door: a dark arch in the cliff, two stone doors shut in it (or open, open: the boy has opened them), its name
// carved on a board over it (斜月三星洞, its sign).
OBJECT_ART.stoneDoor = (g, o) => {
  const X = o.x * T, Y = o.y * T, W = o.w * T, H = o.h * T, m = X + W / 2, t = tileAt(o.x, o.y);
  oval(g, m, Y + 8, W / 2 - 6, 8, '#2A2E30'); R(g, X + 6, Y + 8, W - 12, H - 8, '#2A2E30');
  if (!t.open){
    R(g, X + 9, Y + 8, W / 2 - 10, H - 8, '#8E989D'); R(g, m + 1, Y + 8, W / 2 - 10, H - 8, '#8E989D'); R(g, m, Y + 8, 1, H - 8, '#2A2E30');
    R(g, X + 9, Y + 8, W / 2 - 10, 1, '#B3BCC0'); R(g, m + 1, Y + 8, W / 2 - 10, 1, '#B3BCC0');
    for (const dx of [-5, 4]) R(g, m + dx, Y + 18, 2, 2, '#C9A43E');
  } else for (const dx of [-W / 2 + 7, W / 2 - 10]) R(g, m + dx, Y + 8, 3, H - 8, '#8E989D');   // (the doors folded back)
  const sign = t.sign && t.sign.says.zh;
  if (sign){ const n = [...sign].length * 12 + 4; R(g, m - n / 2 - 1, Y - 15, n + 2, 15, '#5E3B22'); R(g, m - n / 2, Y - 14, n, 13, '#2E3A44'); write(g, sign, m - n / 2 + 2, Y - 12, '#E8D27A'); }
};
BLOCK_OBJECTS.push('stoneDoor');

/* ---- clouds drifting past, and mist ---- */
// In a place with clouds (its clouds), wisps of cloud drift slowly across, low over everything; with mist (its mist), now
// and then the mist rolls in, thick enough to hide the way for a few seconds, then thins again (MIST_EVERY, MIST_MS).
const MIST_EVERY = 16000, MIST_MS = 6000;
function mistNow(now){ const k = (now % MIST_EVERY) / MIST_MS; return k >= 1 ? 0 : Math.sin(k * Math.PI); }   // 0 clear, 1 thickest
function drawMist(cx, cy, sh, now){
  const p = PLACES[PLACE]; if (!p.clouds && !p.mist) return;
  const thick = p.mist ? mistNow(now) : 0, W = VW*T, H = sh;
  if (thick > 0){ b.globalAlpha = .75 * thick; R(b, 0, 0, W, H, '#E8EEF2'); b.globalAlpha = 1; }
  for (let i = 0; i < 7; i++){   // wisps, each drifting at its own speed, wrapping round the place
    const span = COLS * T + 120, x = ((rnd(i, 1, 900) * span + now / (60 + i * 25)) % span) - 60 - cx, y = rnd(i, 2, 901) * ROWS * T - cy;
    if (x < -60 || x > W + 60 || y < -20 || y > H + 20) continue;
    b.globalAlpha = .35 + .4 * thick;
    for (let k = 0; k < 4; k++) oval(b, Math.round(x + k * 9), Math.round(y + (k % 2) * 3), 10 - k, 4, '#FFFFFF');
    b.globalAlpha = 1;
  }
}

/* ---- the mountain's tablet ---- */
// The mountain's stone tablet, standing on the mossy stone, its name carved down it (灵台方寸山, its sign), as the cave's is
// at home (stoneTablet, js/art.js).
LOOKS.mountainTablet = mossStone;
OBJECT_ART.mountainTablet = (g, o) => stoneTablet(g, o.x * T, (o.y + o.h - 1) * T, tileAt(o.x, o.y).sign.says.zh);
BLOCK_OBJECTS.push('mountainTablet');

/* ---- the cave behind the stone door (chapter 1) ---- */
// A doorway into the rock, with a wooden frame and a dark room behind it (the pupils' rooms, yours, and the master's
// back door), in the cliff's face.
function rockDoor(g, X, Y, x, y){
  karstFace(g, X, Y, x, y);
  R(g, X + 3, Y + 3, 10, 13, '#3A2A1E'); R(g, X + 4, Y + 4, 8, 12, '#1E1A18'); R(g, X + 5, Y + 2, 6, 2, '#3A2A1E');
  R(g, X + 3, Y + 3, 1, 13, '#7A5634'); R(g, X + 12, Y + 3, 1, 13, '#7A5634'); R(g, X + 3, Y + 3, 10, 1, '#8E6A42');
}
// A heap of fallen leaves on the flagstones, red, orange and gold, to sweep up.
function leafPile(g, X, Y, x, y){
  LOOKS.paving(g, X, Y, x, y);
  oval(g, X + 8, Y + 11, 7, 3, '#6E4A22');
  for (let i = 0; i < 18; i++){ const lx = X + 2 + Math.floor(rnd(x, y, 900 + i) * 12), ly = Y + 6 + Math.floor(rnd(x, y, 920 + i) * 7); R(g, lx, ly, 2, 1, ['#C2552E', '#D8923A', '#E6B04A', '#9A6A2A'][i % 4]); }
}
// A young peach tree, newly planted: a thin stem and a few leaves (in seven years, a tree: becomes).
function sapling(g, X, Y, x, y){
  mossStone(g, X, Y, x, y);
  oval(g, X + 8, Y + 14, 4, 1, '#6E7A62'); R(g, X + 7, Y + 6, 2, 8, '#6B4A2A');
  for (const [dx, dy] of [[-3, 0], [3, -1], [-2, -3], [2, -4], [0, -5]]) oval(g, X + 8 + dx, Y + 7 + dy, 2, 1, '#5E9E44');
}
// The pool, at night: the slanting moon shining in it.
function moonWater(g, X, Y, x, y){
  LOOKS.water(g, X, Y, x, y);
  disc(g, X + 8, Y + 8, 4, '#F2EBC2'); disc(g, X + 10, Y + 7, 4, '#2E5A86');
}
Object.assign(LOOKS, {rockDoor, leafPile, sapling, moonWater, rockPeach: mossStone});
OBJECT_ART.rockPeach = (g, o) => OBJECT_ART.peachTree(g, o);   // (a peach tree, on the mountain's mossy stone, not grass)

/* ---- night ---- */
// A place at night (its night: the cave, the night you go to the master's back door): dark blue over everything, a
// slanting moon and three bright stars in the sky above, and a few fainter ones.
function drawNight(cx, cy, sh, now){
  if (!PLACES[PLACE].night) return;
  const W = VW*T;
  b.globalAlpha = .55; R(b, 0, 0, W, sh, '#0A1030'); b.globalAlpha = 1;
  disc(b, W - 34, 18, 7, '#F2EBC2'); disc(b, W - 30, 15, 7, '#1A2448');   // the slanting moon
  for (const [x, y] of [[W - 56, 12], [W - 48, 26], [W - 62, 30]]){ const tw = (now / 400 + x) % 6 < 1 ? 1 : 0; R(b, x - 1, y, 3, 1, '#FFF6C8'); R(b, x, y - 1, 1, 3, '#FFF6C8'); if (tw) R(b, x - 2, y, 5, 1, '#FFFFFF'); }
  for (let i = 0; i < 16; i++) R(b, Math.floor(rnd(i, 7, 930) * W), Math.floor(rnd(i, 8, 931) * sh * .4), 1, 1, '#C8D0F0');
}

/* ---- scenes ---- */
// Seven years in the cave (the caveYears scene, after the chores): the courtyard, the hall, a peach tree growing up
// through the seasons, blossom, green, autumn leaves falling, snow, over and over, and you sweeping.
function drawCaveYears(t, now){
  const W = VW*T, H = VH*T, season = Math.floor(t / 1.6) % 4, grow = Math.min(1, t / 10);
  R(b, 0, 0, W, 40, ['#9CC8E8', '#7FB8E6', '#C8B898', '#D8DEE4'][season]);
  for (let x = 0; x < W; x += T){ karstFace(b, x, 40, 3, 1); karstFace(b, x, 56, 3, 2); }
  R(b, 0, 72, W, H - 72, season === 3 ? '#E8ECEE' : '#B3ADA2');
  for (let y = 72; y < H; y += 8) for (let x = (y / 8) % 2 * 8; x < W; x += 16) R(b, x, y, 15, 7, season === 3 ? '#F4F6F8' : '#C0BAAF');
  jHouse(b, {x:5, y:2, w:5, h:3});
  const tx = 52, ty = 110, h = Math.round(10 + grow * 26);   // the peach tree
  R(b, tx - 1, ty - h, 3, h, '#6B4A2A');
  const crown = ['#F4B6C8', '#5E9E44', '#D8923A', '#F4F6F8'][season];
  for (const [dx, dy, r] of [[0, -h, 6 + grow * 8], [-7 * grow, -h + 6, 4 + grow * 6], [7 * grow, -h + 6, 4 + grow * 6]]) disc(b, Math.round(tx + dx), Math.round(ty + dy), Math.round(r), crown);
  if (season === 2 || season === 3) for (let i = 0; i < 14; i++){ const fx = (rnd(i, 3) * W + now / 50 * (1 + i % 3)) % W, fy = (rnd(i, 4) * H + now / 18) % H; R(b, Math.round(fx), Math.round(fy), 2, season === 3 ? 2 : 1, season === 3 ? '#FFFFFF' : '#C25A2A'); }
  const mx = 150 + Math.round(Math.sin(now / 300) * 6);   // you, sweeping
  b.drawImage(monkeySprite('player', 'left', false), mx, 118, 16, 16);
  R(b, mx - 6, 128 + Math.round(Math.sin(now / 150)), 9, 2, '#C9A060'); R(b, mx - 2, 120, 1, 9, '#7A5634');
}
// Flying on a cloud (the somersault and flyHome scenes: def.home, flying home over the sea, Flower Fruit Mountain coming
// up ahead): the sky, clouds racing by, and you on yours, somersaulting now and then.
function drawCloudFlight(t, now, def){
  const W = VW*T, H = VH*T, home = def && def.home;
  for (let y = 0; y < H; y += 2) R(b, 0, y, W, 2, mix('#5FA2E0', '#CFE6F6', y / H));
  if (home){ R(b, 0, H - 30, W, 30, '#3A78B8'); for (let x = 0; x < W; x += 12) R(b, (x + now / 20) % W, H - 26 + (x % 3) * 6, 6, 1, '#8FC0E8'); }
  if (home && t > 6){   // Flower Fruit Mountain, coming up ahead
    const mx = W - Math.min(140, (t - 6) * 60);
    for (let i = 0; i < 50; i++){ const w = (50 - i) * 2.4; R(b, Math.round(mx + 60 - w / 2), H - 30 - i, Math.round(w), 1, i > 42 ? '#8A8A7A' : i % 9 === 0 ? '#3F8A3A' : '#4F9A44'); }   // (wide at the foot, a peak at the top)
    R(b, Math.round(mx + 58), H - 62, 3, 30, '#CFE6F6'); R(b, Math.round(mx + 55), H - 33, 9, 3, '#FFFFFF');   // its waterfall
  }
  for (let i = 0; i < 9; i++){ const x = W - ((now / (8 + i % 3 * 4) + rnd(i, 1) * W * 2) % (W + 80)) , y = rnd(i, 2) * (H - 40); for (let k = 0; k < 4; k++) oval(b, Math.round(x + k * 10), Math.round(y + (k % 2) * 3), 9 - k, 5, '#FFFFFF'); }
  const bob = Math.round(Math.sin(now / 200) * 3), cx = 80, cy = 80 + bob;
  for (let k = 0; k < 5; k++) oval(b, cx - 12 + k * 6, cy + 12 + (k % 2), 7, 4, '#F4F7FA');   // your cloud
  for (let k = 0; k < 6; k++) R(b, cx - 30 - k * 8, cy + 10 + (k % 3) * 3, 6, 1, '#FFFFFF');   // speed lines
  const flip = (now / 1200) % 3 < .35;   // a somersault now and then
  b.save(); b.translate(cx + 8, cy + 6); if (flip) b.rotate(((now / 1200) % 3) / .35 * Math.PI * 2);
  b.drawImage(monkeySprite('player', 'right', false), -8, -10, 16, 16); b.restore();
}
Object.assign(SCENE_ART, {caveYears: drawCaveYears, cloudFlight: drawCloudFlight});
