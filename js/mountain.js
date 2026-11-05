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
// A sea of clouds, seen from above, where the mountain falls away: pale, its puffs each kept inside its own square.
function cloudSea(g, X, Y, x, y){
  g.save(); g.beginPath(); g.rect(X, Y, T, T); g.clip();
  R(g, X, Y, T, T, '#DCE6EE');
  for (let i = 0; i < 4; i++){
    const cx = X + Math.floor(rnd(x, y, 700 + i) * 16), cy = Y + Math.floor(rnd(x, y, 710 + i) * 16), r = 3 + Math.floor(rnd(x, y, 720 + i) * 4);
    oval(g, cx, cy + 1, r + 1, Math.max(2, r - 1), '#C3D0DC'); oval(g, cx, cy, r, Math.max(2, r - 1), '#F4F7FA');
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
