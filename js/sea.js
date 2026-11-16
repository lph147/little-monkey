// The Eastern Sea (Area 3, Chapters 5 and 6): its look under water (decided 15 November 2026, from the mock-ups drawn by the
// game: the plan, https://claude.ai/artifact/2n34PHv9xZA8WeJof6G4Tx). Loaded after js/trade.js.
//
// A place under the sea (its `underwater`) has the sea's own ground (sand, seaweed swaying up out of it) and things (rocks,
// coral, shells: MAP_ART in content/pictures.js, drawn with the shape kit by tools/draw-pictures.js), and over everything
// the water (drawSea, from drawWorld in js/draw.js): a light blue haze, a little deeper towards the bottom of the screen,
// light rippling over the seabed (drawn once, eight frames of a square that repeats, so a cheap phone stays smooth: the
// mock-up worked it out pixel by pixel every frame), brighter at the top, shafts of light from above and bubbles rising;
// and you in your bubble of air, the water's tint kept off you inside it. No rain falls down here (rainingHere, js/daynight.js).

const underwater = (id = PLACE) => !!(PLACES[id] || {}).underwater;
const ART_KEPT = {};   // each bigger map drawing as a picture, made once
const mapArtPic = name => ART_KEPT[name] || (ART_KEPT[name] = sprite(MAP_ART[name].rows, MAP_ART[name].palette));

/* ================= THE SEA'S GROUND ================= */
const SAND = '#EADCB2', SAND_DOT = '#D8C79A', SAND_LIGHT = '#F6ECCE', SAND_RIPPLE = '#DCCB9E';
const seaLookAt = (x, y) => (x < 0 || y < 0 || x >= COLS || y >= ROWS ? null : tileAt(x, y).look);
// Sand on the seabed: specks, now and then a ripple left by the water, and where the seabed drops away into the deep, its edge.
function seaSand(g, X, Y, x, y){
  R(g, X, Y, T, T, SAND);
  for (let i = 0; i < 7; i++) R(g, X + Math.floor(rnd(x, y, i + 500) * 16), Y + Math.floor(rnd(x, y, i + 510) * 16), 1, 1, i % 3 ? SAND_DOT : SAND_LIGHT);
  if (rnd(x, y, 520) < .5){ const ry = Y + 3 + Math.floor(rnd(x, y, 521) * 9), rx = X + Math.floor(rnd(x, y, 522) * 4); for (let k = 0; k < 11; k++) R(g, rx + k, ry + (k % 6 < 3 ? 0 : 1), 1, 1, SAND_RIPPLE); }
  if (seaLookAt(x, y + 1) === 'deepSea'){ R(g, X, Y + 11, T, 5, '#A89670'); R(g, X, Y + 11, T, 1, '#F4E8C6'); R(g, X, Y + 14, T, 2, '#74684C'); }
}
// Seaweed growing up out of the sand, three ribbons a square, each its own height and sway, green or olive.
function seaweedRibbons(g, X, Y, x, y){
  for (let k = 0; k < 3; k++){
    const x0 = X + 1 + k * 5 + Math.floor(rnd(x, y, 530 + k) * 2), top = Y - 5 - Math.floor(rnd(x, y, 540 + k) * 7), ph = rnd(x, y, 550 + k) * 20;
    const c = (x + y + k) % 3 === 1 ? ['#7E8A34', '#A8B44E', '#4E5620'] : ['#3E7A34', '#69A84A', '#244C22'];
    for (let yy = Y + 15; yy >= top; yy--){ const xx = x0 + Math.round(Math.sin((yy + ph) / 3.6) * 1.4); R(g, xx, yy, 2, 1, c[0]); R(g, xx, yy, 1, 1, c[1]); R(g, xx + 2, yy, 1, 1, c[2]); }
    R(g, x0 + Math.round(Math.sin((top + ph) / 3.6) * 1.4), top - 1, 1, 1, c[1]);
  }
}
function seaweed(g, X, Y, x, y){ seaSand(g, X, Y, x, y); for (let i = 0; i < 5; i++) R(g, X + Math.floor(rnd(x, y, i + 600) * 16), Y + Math.floor(rnd(x, y, i + 610) * 16), 1, 1, '#C8B486'); seaweedRibbons(g, X, Y, x, y); }
// A shell lying on the sand (a square of sand with one of the seabed's shells on it, as you'd find them all over).
const sandWith = name => (g, X, Y, x, y) => { seaSand(g, X, Y, x, y); const p = mapArtPic(name); g.drawImage(p, X + 3 + Math.floor(rnd(x, y, 640) * (13 - p.width)), Y + 4 + Math.floor(rnd(x, y, 641) * (11 - p.height))); };
// Deep water, where the seabed drops away: darker the further down, a speck or two, and the edge's shadow under the sand.
function deepSea(g, X, Y, x, y){
  const d = Math.min(1, Math.max(0, (y - 6) / 3)); R(g, X, Y, T, T, mix('#2C5870', '#0C1E30', d));
  for (let i = 0; i < 3; i++) R(g, X + Math.floor(rnd(x, y, i + 700) * 16), Y + Math.floor(rnd(x, y, i + 710) * 16), 1, 1, mix('#4A7C96', '#1E3E58', d));
  if (seaLookAt(x, y - 1) && seaLookAt(x, y - 1) !== 'deepSea') R(g, X, Y, T, 3, 'rgba(8,20,30,.45)');
}
Object.assign(LOOKS, {seaSand, seaweed, deepSea, sandShell: sandWith('shell'), sandShellPink: sandWith('shellPink'), sandConch: sandWith('conch')});
// Tall seaweed, where sharks and jellyfish hide (the sea's long grass, step 3): the sand shaded under it and four tall
// ribbons filling the square, swaying; walking through, they part round you as grass does (bend: how far one leans at its
// tip, by where it is across the square; lit: pushed aside, its tips catching the light). Each stays in its own square, so
// the parted copy (js/draw.js) is just what the map has there.
const TALL_WEED = [['#2E6A2E', '#4E9A44', '#1C4420'], ['#3A7A34', '#62AA4E', '#22501F'], ['#6E7A2C', '#96A246', '#46501A']];
function tallSeaweed(g, X, Y, x, y, bend = null, lit = false){
  seaSand(g, X, Y, x, y);
  for (let i = 0; i < 6; i++) R(g, X + Math.floor(rnd(x, y, i + 800) * 15), Y + 8 + Math.floor(rnd(x, y, i + 810) * 8), 2, 1, '#B8A878');   // (the sand in its shade)
  for (let k = 0; k < 5; k++){
    const x0 = X + k * 3 + Math.floor(rnd(x, y, 820 + k) * 2), top = Y + Math.floor(rnd(x, y, 830 + k) * 6), ph = rnd(x, y, 840 + k) * 20;
    const c = TALL_WEED[(x * 3 + y + k) % 3], lean = bend ? bend(x0 - X + 1) : 0;
    for (let yy = Y + 15; yy >= top; yy--){
      const up = (Y + 15 - yy) / 15, xx = x0 + Math.round(Math.sin((yy + ph) / 3.2) * 1.2 + lean * up * up);
      R(g, xx, yy, 2, 1, c[0]); R(g, xx, yy, 1, 1, c[1]); R(g, xx + 2, yy, 1, 1, c[2]);
    }
    R(g, x0 + Math.round(Math.sin((top + ph) / 3.2) * 1.2 + lean), top, 1, 1, lit ? '#C8E89A' : c[1]);
  }
}
LOOKS.tallSeaweed = (g, X, Y, x, y) => tallSeaweed(g, X, Y, x, y);
// The dolphin's race track on the coral reef (step 4): its start, a line of grey pebbles across the sand, and its finish, a
// line of white and pink shells.
function raceStart(g, X, Y, x, y){ seaSand(g, X, Y, x, y); for (let yy = 1; yy < T; yy += 3) R(g, X + 7, Y + yy, 2, 2, yy % 2 ? '#8E949A' : '#A8AEB4'); }
function raceFinish(g, X, Y, x, y){ seaSand(g, X, Y, x, y); for (let yy = 0; yy < T; yy += 4){ R(g, X + 6, Y + yy, 4, 3, (yy / 4 + y) % 2 ? '#F7C8D4' : '#FFF6EC'); R(g, X + 7, Y + yy + 2, 2, 1, '#D8A8B4'); } }
Object.assign(LOOKS, {raceStart, raceFinish});
// The trench (step 5): where a current runs across (its sand combed into faint lines along its row, so you can see it even
// while it's calm), and the glow at the very bottom, light shining up out of the dark from the Dragon King's palace below.
function currentSand(g, X, Y, x, y){
  seaSand(g, X, Y, x, y); R(g, X, Y, T, T, 'rgba(60,120,160,.16)');   // (a little bluer, where the water runs)
  for (let i = 0; i < 2; i++){ const yy = Y + 4 + i * 7, xx = X + (x % 2 ? 2 : 7) + i * 3 - (i ? 6 : 0);   // flow marks, pointing the way it runs (east)
    R(g, xx, yy, 6, 1, '#C4B286'); R(g, xx + 6, yy - 1, 1, 1, '#C4B286'); R(g, xx + 6, yy + 1, 1, 1, '#C4B286'); R(g, xx + 7, yy, 1, 1, '#C4B286'); }
}
function trenchGlow(g, X, Y, x, y){
  R(g, X, Y, T, T, '#0C1E30');
  for (let i = 0; i < 4; i++) R(g, X + 2 + i * 4, Y + 4 + (i % 2) * 3, 1, T, 'rgba(242,193,78,.35)');
  R(g, X, Y + T - 5, T, 5, '#E8B848'); R(g, X + 3, Y + T - 3, T - 6, 3, '#FFF2B0');
}
Object.assign(LOOKS, {currentSand, trenchGlow});
// The Dragon King's palace (step 6): jade flagstones, pale green-white with fine joints and a fleck of gold here and there;
// its red wall, under green tiles with a gold edge; its gate, the plaque over the door saying 龙宫 in pixel characters;
// and red pillars with gold dragons coiled round them.
function jadeFloor(g, X, Y, x, y){
  R(g, X, Y, T, T, (x + y) % 2 ? '#D6E8E2' : '#DCEEE8');
  R(g, X, Y, T, 1, '#B8D2CA'); R(g, X, Y, 1, T, '#B8D2CA');
  if (rnd(x, y, 950) < .35) R(g, X + 3 + Math.floor(rnd(x, y, 951) * 9), Y + 3 + Math.floor(rnd(x, y, 952) * 9), 1, 1, '#D8B048');
}
function palaceWall(g, X, Y, x, y){
  const top = seaLookAt(x, y - 1) !== 'palaceWall';
  R(g, X, Y, T, T, '#B8322A'); R(g, X, Y + T - 2, T, 2, '#8E2620');
  R(g, X + 3, Y + (top ? 7 : 3), 10, 6, '#A42A24'); R(g, X + 3, Y + (top ? 7 : 3), 10, 1, '#C8483C');   // a panel
  if (top){ R(g, X, Y, T, 4, '#2E8A72'); for (let i = 0; i < T; i += 3) R(g, X + i, Y, 1, 4, '#1F6A56'); R(g, X, Y + 4, T, 1, '#E2B23A'); }   // green tiles, a gold edge
}
Object.assign(LOOKS, {jadeFloor, palaceWall, palaceGate: jadeFloor, dragonPillar: jadeFloor});
OBJECT_ART.palaceGate = (g, o) => {
  const p = mapArtPic('palaceGate'), X = o.x * T + Math.round((o.w * T - p.width) / 2), Y = o.y * T + o.h * T - p.height;
  g.drawImage(p, X, Y);
  write(g, '龙宫', X + 30, Y + 9, '#F2C14E');   // (its plaque: real Chinese, 龙宫, the Dragon Palace)
};
OBJECT_ART.dragonPillar = (g, o) => seaThing('dragonPillar')(g, o);   // (seaThing comes further down)
// The throne hall's (step 7): the Dragon King's throne on its dais, and the palace's great scale.
Object.assign(LOOKS, {throne: jadeFloor, greatScale: jadeFloor});
OBJECT_ART.throne = (g, o) => seaThing('throne')(g, o);
OBJECT_ART.greatScale = (g, o) => seaThing('greatScale')(g, o);
BLOCK_OBJECTS.push('palaceGate', 'dragonPillar', 'throne', 'greatScale');   // (each a block of its letters, one object: the gate 5 × 4, a pillar 1 × 2, the throne 3 × 2, the scale 2 × 2)
STIR_LOOKS.tallSeaweed = ['#D8C79A', '#2E6A2E', '#8FCB6A']; STIR_DRAWS.tallSeaweed = tallSeaweed; TALL_LOOKS.push('tallSeaweed');   // (parting round you, and what flies up: js/draw.js)
const UNLIT = new Set(['deepSea', 'trenchGlow']);   // where the light doesn't ripple: down in the deep

/* ================= THE SEA'S THINGS ================= */
// Each drawn standing at the bottom of its squares, in the middle, with a soft shadow on the sand under it.
const seaThing = (name, dy = 0) => (g, o) => {
  const p = mapArtPic(name), W = o.w * T, X = o.x * T + Math.round((W - p.width) / 2), Y = o.y * T + o.h * T - p.height + dy;
  groundShadow(g, o.x * T + W / 2, o.y * T + o.h * T - 2, Math.max(4, Math.round(p.width * .38)), 2);
  g.drawImage(p, X, Y);
};
Object.assign(LOOKS, {seaRock: seaSand, seaRockBig: seaSand, coral: seaSand, coralOrange: seaSand, seaFan: seaSand, brainCoral: seaSand, clam: seaSand});   // (sand under each)
Object.assign(OBJECT_ART, {seaRock: seaThing('rock', -1), seaRockBig: seaThing('rockBig', -1), coral: seaThing('coral'), coralOrange: seaThing('coralOrange'),
  seaFan: seaThing('fan'), brainCoral: seaThing('brain', -2), clam: seaThing('clam', -2)});

/* ================= THE WATER ================= */
let seaLight = null;   // the light rippling over the seabed: eight frames of a 64-pixel square, side by side, made the first time it's needed
function makeSeaLight(){
  const c = document.createElement('canvas'); c.width = 64 * 8; c.height = 64;
  const g = c.getContext('2d'); g.fillStyle = 'rgba(214,250,255,.32)';
  for (let f = 0; f < 8; f++){
    const k = f / 8 * Math.PI * 2;   // (every part of it repeats every 64 pixels, so the squares join up wherever they're drawn)
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++){
      const v = Math.sin(x * Math.PI / 16 + Math.sin(y * Math.PI / 16 + k) * 2.2) + Math.sin(y * Math.PI / 16 + Math.sin(x * Math.PI / 32 - k) * 2.4);
      if (Math.abs(v) < .12) g.fillRect(f * 64 + x, y, 1, 1);
    }
  }
  return c;
}
let bubbleKeep = null;   // what's round you, as it was before the water's tint, for inside your bubble
const RING = (() => { const out = new Set(); for (let t = 0; t < 96; t++){ const a = t / 96 * Math.PI * 2; out.add(Math.round(Math.cos(a) * 12) + ',' + Math.round(Math.sin(a) * 12)); } return [...out].map(s => s.split(',').map(Number)); })();
const SEA_BEAMS = [[18, 14], [92, 9], [150, 18], [206, 8]];   // shafts of light from above: where each starts, and how wide
// Little fish swimming over the seabed in schools (a place's schools: each [its row, how many, its map drawing, squares a
// second, which way: -1 left, 1 right]), one after another a little apart, up and down a little, round and round the place,
// in front of everything but you in your bubble (decided 15 November 2026: the Eastern Sea's plan, fish that swim over the
// sea floor, instead of leaping out of water).
function drawSchools(cx, cy, now){
  for (const [row, n, art, speed, way] of PLACES[PLACE].schools || []){
    const spr = mapArtPic(art), span = COLS * T + 120, lead = (now * speed * T / 1000 + row * 97) % span;
    for (let i = 0; i < n; i++){
      const along = (lead - i * 10 - (i % 2) * 3 + span) % span - 60, x = way > 0 ? along : COLS * T - along;
      const X = Math.round(x - cx), Y = Math.round(row * T + 3 + (i % 3) * 4 + Math.sin(now / 420 + i * 1.3) * 1.5 - cy);
      if (X < -16 || X > VW * T + 16 || Y < -16 || Y > VH * T + 16) continue;
      b.drawImage(way > 0 ? mirrored(spr) : spr, X, Y);   // (each drawn heading left: turned round to swim right)
    }
  }
}
const COLOUR_ART = {coral:'coral', coralOrange:'coralOrange'};   // the sea's things that can be a colour you're told, drawn again over the water's blue (drawSea)
function drawSea(cx, cy, sh, now){
  if (!underwater()) return;
  const W = VW * T, H = VH * T, PX = Math.round(pl.px - cx), PY = Math.round(pl.py - cy);
  if (!bubbleKeep){ bubbleKeep = document.createElement('canvas'); bubbleKeep.width = 32; bubbleKeep.height = 32; }
  const kg = bubbleKeep.getContext('2d'); kg.clearRect(0, 0, 32, 32); kg.drawImage(buf, PX - 8, PY - 9, 32, 32, 0, 0, 32, 32);
  drawSchools(cx, cy, now);   // little fish swimming over the seabed, under the water's blue
  // the light rippling over the seabed, square by square (not down in the deep)
  if (!seaLight) seaLight = makeSeaLight();
  const f = Math.floor(now / 160) % 8, x0 = Math.floor(cx / T), y0 = Math.floor(cy / T);
  b.save(); b.globalCompositeOperation = 'screen';
  for (let y = y0; y <= y0 + VH; y++) for (let x = x0; x <= x0 + VW; x++){
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS || UNLIT.has(tileAt(x, y).look)) continue;
    b.drawImage(seaLight, f * 64 + (x * T) % 64, (y * T) % 64, T, T, x * T - cx, y * T - cy, T, T);
  }
  b.restore();
  // the water's blue, deeper towards the bottom, and lighter at the top, where the light comes from
  b.globalAlpha = .28; R(b, 0, 0, W, H, '#2C8CC8'); b.globalAlpha = 1;
  const deep = b.createLinearGradient(0, 0, 0, H); deep.addColorStop(0, 'rgba(16,64,96,0)'); deep.addColorStop(1, 'rgba(16,64,96,.24)'); b.fillStyle = deep; b.fillRect(0, 0, W, H);
  b.save(); b.globalCompositeOperation = 'screen';
  const top = b.createLinearGradient(0, 0, 0, 70); top.addColorStop(0, 'rgba(210,246,255,.26)'); top.addColorStop(1, 'rgba(210,246,255,0)'); b.fillStyle = top; b.fillRect(0, 0, W, 70);
  b.globalAlpha = PLACES[PLACE].dim ? 0 : .09; b.fillStyle = '#E6FBFF';   // shafts of light, drifting a little as you move (not in the dim treasury)
  for (const [sx, w] of SEA_BEAMS){ const x = ((sx - cx * .25) % (W + 60) + W + 60) % (W + 60) - 30; b.beginPath(); b.moveTo(x, -2); b.lineTo(x + w, -2); b.lineTo(x + w + 46, H + 2); b.lineTo(x + 46, H + 2); b.closePath(); b.fill(); }
  b.restore();
  if (PLACES[PLACE].dim){   // a dim place, such as the treasury: darker, its gold glinting through
    R(b, 0, 0, W, H, 'rgba(6,14,26,.42)');
    b.globalAlpha = .55;
    for (const p of OBJECT_PIECES){ if (p.look !== 'goldHeap') continue; const pic = mapArtPic('goldHeap'), X = p.x * T + Math.round((p.w * T - pic.width) / 2) - cx, Y = p.y * T + p.h * T - pic.height - 2 - cy; b.drawImage(pic, X, Y); }
    b.globalAlpha = 1;
  }
  // what comes in colours, such as the starfish on the sand, drawn again over the water's blue, so each is the colour it's
  // called (decided 15 November 2026, after looking at it: under the haze the yellow one was green, the red one maroon)
  for (const o of outHere()) if (o.colour && o.a.lies) drawLying(o.a, o.x, o.y, o.x * T - cx, o.y * T - cy, now, o.colour);
  for (const p of OBJECT_PIECES){   // (and coral of a colour, such as the reef's pink and orange: 粉色的珊瑚)
    const name = COLOUR_ART[p.look]; if (!name || !tileAt(p.x, p.y).colour) continue;
    const pic = mapArtPic(name), X = p.x * T + Math.round((p.w * T - pic.width) / 2) - cx, Y = p.y * T + p.h * T - pic.height - cy;
    if (X < VW * T && Y < VH * T && X + pic.width > 0 && Y + pic.height > 0) b.drawImage(pic, X, Y);
  }
  if (foe && foe.colour) drawFoe(cx, cy, now);
  drawJellies(cx, cy, now); drawInk(cx, cy, now);
  for (let y = Math.floor(cy / T); y <= Math.floor(cy / T) + VH; y++) for (let x = Math.floor(cx / T); x <= Math.floor(cx / T) + VW; x++){   // (the palace's glow, far below, shining up through the water)
    if (tileAt(x, y).look !== 'trenchGlow') continue;
    const X = x * T - cx + 8, Y = y * T - cy + T, k = .75 + Math.sin(now / 700 + x) * .25;
    b.save(); b.globalCompositeOperation = 'screen';
    const glow = b.createRadialGradient(X, Y, 2, X, Y, 40); glow.addColorStop(0, `rgba(255,226,140,${.9 * k})`); glow.addColorStop(.5, `rgba(255,214,120,${.35 * k})`); glow.addColorStop(1, 'rgba(255,226,140,0)'); b.fillStyle = glow; b.fillRect(X - 40, Y - 40, 80, 48);
    b.globalAlpha = .3 * k; b.fillStyle = '#FFF2B0';
    for (const dx of [-14, -4, 6, 15]){ b.beginPath(); b.moveTo(X + dx - 2, Y); b.lineTo(X + dx + 2, Y); b.lineTo(X + dx * 2 + 4, Y - 60); b.lineTo(X + dx * 2 - 4, Y - 60); b.closePath(); b.fill(); }
    b.restore();
  }   // (jellyfish drifting, glowing at night; the octopus's ink)
  drawPillar(cx, cy, now);   // (the treasury's iron pillar, glowing)
  // bubbles rising
  for (let i = 0; i < 7; i++){
    const bx = Math.round((i * 61 + 23 - cx * .5) % W + W) % W, by = Math.round(H - ((now * .018 + i * 47) % (H + 24)));
    if (i % 2){ R(b, bx, by, 1, 1, 'rgba(232,250,255,.9)'); continue; }
    R(b, bx - 1, by, 1, 1, 'rgba(232,250,255,.75)'); R(b, bx + 1, by, 1, 1, 'rgba(232,250,255,.75)'); R(b, bx, by - 1, 1, 1, '#FFFFFF'); R(b, bx, by + 1, 1, 1, 'rgba(232,250,255,.75)');
  }
  // you, in your bubble of air
  const bx = PX + 8, by = PY + 7;
  b.save(); b.beginPath(); b.arc(bx, by, 11.5, 0, Math.PI * 2); b.clip(); b.drawImage(bubbleKeep, PX - 8, PY - 9); b.globalAlpha = .12; R(b, bx - 12, by - 12, 24, 24, '#DFF8FF'); b.restore();
  b.globalAlpha = .75; for (const [dx, dy] of RING) R(b, bx + dx, by + dy, 1, 1, '#E9FBFF');
  b.globalAlpha = .35; for (const [dx, dy] of RING) R(b, bx + dx + Math.sign(dx), by + dy + Math.sign(dy), 1, 1, '#5FA6BC');
  b.globalAlpha = 1;
  for (const [dx, dy] of [[-8, -6], [-7, -8], [-5, -9], [-3, -10]]) R(b, bx + dx, by + dy, 1, 1, '#FFFFFF');
  const rise = (now / 900) % 1; R(b, bx + 6, by - 14 - Math.round(rise * 18), 1, 1, 'rgba(255,255,255,.85)');
}

/* ================= SCENES ================= */
// Diving from the iron bridge (the dive scene, Area 3's begin): down through the water in your bubble of air, past fish,
// light falling from above, until the seabed comes up out of the blue, sand, seaweed and coral.
function drawDive(t, now){
  const W = VW * T, H = VH * T, depth = clamp(t / 8, 0, 1);
  for (let y = 0; y < H; y += 2) R(b, 0, y, W, 2, mix(mix('#8FD4EE', '#3A8CBC', depth), mix('#3A8CBC', '#1E5A86', depth), y / H));
  b.save(); b.globalCompositeOperation = 'screen'; b.globalAlpha = .1; b.fillStyle = '#E6FBFF';
  for (const [sx, w] of SEA_BEAMS){ b.beginPath(); b.moveTo(sx, -2); b.lineTo(sx + w, -2); b.lineTo(sx + w + 46, H + 2); b.lineTo(sx + 46, H + 2); b.closePath(); b.fill(); }
  b.restore();
  if (t < 1.4){ const k = t / 1.4; R(b, 0, 0, W, Math.round(26 * (1 - k)), '#BFE8FA'); for (let i = 0; i < 30; i++) R(b, (i * 37) % W, Math.round(30 * (1 - k)) - (i % 5), 3, 1, '#FFFFFF'); }   // the splash, going in
  for (let i = 0; i < 9; i++){   // fish swimming past, the further you go the more there are
    if (t < 1.5 + i * .5) continue;
    const dir = i % 2 ? 1 : -1, sx = dir > 0 ? -12 + ((now / 30 + i * 70) % (W + 24)) : W + 12 - ((now / 34 + i * 55) % (W + 24)), sy = 20 + (i * 37) % 100;
    const fish = mapArtPic(i % 3 ? 'fishYellow' : 'fishBlue');
    if (dir > 0){ b.save(); b.translate(Math.round(sx) + fish.width, sy); b.scale(-1, 1); b.drawImage(fish, 0, 0); b.restore(); } else b.drawImage(fish, Math.round(sx), sy);
  }
  const ground = Math.round(H + 10 - clamp((t - 5) / 3, 0, 1) * 52);   // the seabed coming up
  if (ground < H){
    R(b, 0, ground, W, H - ground, SAND); for (let x = 0; x < W; x += 3) R(b, x, ground + (x % 7 === 0 ? 1 : 0), 2, 1, SAND_LIGHT);
    for (const [name, x] of [['coral', 18], ['seaweed', 60], ['rockBig', 150], ['coralOrange', 200], ['seaweed', 116]]){
      if (name === 'seaweed'){ seaweedRibbons(b, x, ground - 12, x, 3); seaweedRibbons(b, x + 14, ground - 12, x + 1, 4); continue; }
      const p = mapArtPic(name); b.drawImage(p, x, ground - p.height + 6);
    }
  }
  const my = Math.round(clamp(t / 6, 0, 1) * (H - 70) + 20 + Math.sin(now / 500) * 2), mx = 112;   // you, sinking, in your bubble
  b.drawImage(monkeySprite('player', 'down', false), mx, my);
  if (t > 1.2){ const a = clamp((t - 1.2) / .8, 0, 1); b.globalAlpha = .75 * a; for (const [dx, dy] of RING) R(b, mx + 8 + dx, my + 7 + dy, 1, 1, '#E9FBFF'); b.globalAlpha = 1; }
  for (let i = 0; i < 6; i++){ const by = Math.round(my - ((now * .03 + i * 13) % 60)); R(b, mx + 6 + (i % 3) * 3, by, 1, 1, 'rgba(255,255,255,.85)'); }
}
Object.assign(SCENE_ART, {dive: drawDive});

/* ================= COUNTING BY TENS ================= */
// Counting the shrimp soldiers with the crab general (the countTens step: its lines, one for each ten, the last 一 百),
// as the master's class counted on from ten (decided 15 November 2026, the Eastern Sea's plan): a row of ten soldiers
// marches in at a time, and he says how many now, 十, 二十, 三十… till ten rows, a hundred. The tens are heard and counted,
// made of words you know; the last line teaches 百.
function countTens(who, keys){
  return new Promise(res => {
    const soldier = mapSprite('虾兵').toDataURL(), face = speaker(who);
    let n = 1;
    const show = () => {
      const line = L[keys[n - 1]], last = n === keys.length;
      const rows = Array.from({length: n}, () => `<div class="tenrow">${`<img alt="" src="${soldier}">`.repeat(10)}</div>`).join('');
      openCard(`${face}<p class="label">Counting the soldiers, ten at a time</p>
        <div class="tens">${rows}</div>
        <div class="talkline">${lineHTML(line.t, last ? '百' : null)}</div><p class="sentence-en">${esc(line.en)}</p>
        <p class="note">${last ? 'Ten rows of ten: a hundred soldiers!' : `${n === 1 ? 'One row' : `${n} rows`} of ten.`}</p>
        <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button><button class="btn primary" data-a="next">${last ? 'Got it' : 'Another row ▸'}</button></div>`);
      on('[data-a=say]', () => say(line.t.join(''), null, who));
      on('[data-a=next]', next);
    };
    const next = () => {
      if (n === keys.length){ closeCard(); res(); return; }
      n++; SFX.tock(); show(); say(L[keys[n - 1]].t.join(''), null, who);
    };
    show(); say(L[keys[0]].t.join(''), null, who);
  });
}
STEPS.countTens = async (s, who) => { await countTens(who, s.countTens); };

/* ================= TOO LIGHT: THE WEIGHING ================= */
// The Dragon King's weapons on the palace's great scale (the weigh step: one of the area's weighing, by its id), a card
// (decided 15 November 2026, the Eastern Sea's plan, from its mock-up): the weapon on one pan, weights on the other, big ones
// (千, a thousand jin each) and small ones (百, a hundred), the beam tipping the weapon's way till it balances. One that's
// shown (show) is weighed already, its weights on; otherwise you put them on, big ones first, then small ones (so each
// number on the way is one the game can say, and A always puts on the one that's next), each total said as it grows (the
// area's lines jin and the total), its last line, with 斤, as it balances; then Lift it.
function drawScale(c, pic, big, small, balanced){
  const g = c.getContext('2d'), cx = 48, top = 12, a = balanced ? 0 : .2;   // (not balanced yet: the weapon's side, the right, down)
  g.clearRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false;
  R(g, 46, top, 4, 42, '#B07A3A'); R(g, 47, top, 1, 42, '#D8A060'); R(g, 38, 53, 20, 5, '#8A5A2A');   // the post and its foot
  g.save(); g.translate(cx, top); g.rotate(a); R(g, -36, -1, 72, 3, '#B07A3A'); R(g, -36, -1, 72, 1, '#D8A060'); g.restore();
  R(g, cx - 2, top - 2, 4, 4, '#E2B23A');
  const end = k => [Math.round(cx + k * 34 * Math.cos(a)), Math.round(top + k * 34 * Math.sin(a))], [lx, ly] = end(-1), [rx, ry] = end(1);
  g.strokeStyle = '#5A3A1A'; g.lineWidth = 1;
  for (const [x, y] of [[lx, ly], [rx, ry]]){ g.beginPath(); g.moveTo(x + .5, y); g.lineTo(x - 7.5, y + 16); g.moveTo(x + .5, y); g.lineTo(x + 8.5, y + 16); g.stroke(); R(g, x - 10, y + 16, 21, 3, '#C08A40'); R(g, x - 10, y + 16, 21, 1, '#E0B060'); }
  for (let i = 0; i < big; i++){ const X = lx - 9 + (i % 3) * 6, Y = ly + 10 - Math.floor(i / 3) * 6; R(g, X, Y, 6, 6, '#3E444C'); R(g, X + 1, Y + 1, 2, 4, '#6A727E'); }   // the big weights (千)
  const up = ly + 10 - Math.ceil(big / 3) * 6;
  for (let i = 0; i < small; i++){ const X = lx - 9 + (i % 4) * 5, Y = up + 2 - Math.floor(i / 4) * 4; R(g, X, Y, 4, 4, '#5A626E'); R(g, X + 1, Y + 1, 1, 2, '#8A929E'); }   // and the small ones (百)
  const p = mapArtPic(pic), w = 24, h = Math.max(1, Math.round(p.height * w / p.width));
  g.drawImage(p, rx - 12, ry + 16 - h, w, h);   // the weapon, lying across its pan
}
function weighCard(id, who){
  const wg = AREA.weighing[id];
  return new Promise(res => {
    let big = wg.show ? Math.floor(wg.target / 1000) : 0, small = wg.show ? Math.round(wg.target % 1000 / 100) : 0;
    const total = () => big * 1000 + small * 100, done = () => total() === wg.target;
    const canBig = () => !wg.show && total() + 1000 <= wg.target, canSmall = () => !wg.show && !canBig() && total() + 100 <= wg.target;
    const show = () => {
      const t = total(), line = t ? L['jin' + t] : null;
      openCard(`${speaker(who)}<p class="label">${esc(wg.label)}</p>
        <div class="weigh"><canvas class="scalepic" width="96" height="60"></canvas>
          <div class="wnum">${line ? `<div class="talkline">${lineHTML(line.t, wg.teach)}</div><p class="sentence-en">${t.toLocaleString('en')} jin${done() ? ': it balances!' : ''}</p>` : '<p class="note">Big weights first, then small ones.</p>'}</div></div>
        ${wg.show ? '' : `<div class="wbtns">
          <button class="btn${canBig() ? ' primary' : ''}" data-a="big" ${canBig() ? '' : 'disabled'}><span class="wzh">千</span><small>qiān · 1,000</small><small>${big} on the scale</small></button>
          <button class="btn${canSmall() ? ' primary' : ''}" data-a="small" ${canSmall() ? '' : 'disabled'}><span class="wzh">百</span><small>bǎi · 100</small><small>${small} on the scale</small></button></div>`}
        <div class="actions"><button class="btn${done() ? ' primary' : ''}" data-a="lift" ${done() ? '' : 'disabled'}>Lift it</button></div>`);
      drawScale($('#sheet .scalepic'), wg.pic, big, small, done());
      on('[data-a=big]', () => add(true)); on('[data-a=small]', () => add(false)); on('[data-a=lift]', () => { if (done()){ closeCard(); res(); } });
    };
    const add = isBig => {
      if (isBig ? !canBig() : !canSmall()) return;
      if (isBig) big++; else small++;
      SFX.tock(); show(); say(L['jin' + total()].t.join(''), null, who);
    };
    show(); if (wg.show) say(L['jin' + total()].t.join(''), null, who);
  });
}
STEPS.weigh = async (s, who) => { await weighCard(s.weigh, who); };
// Lifting a weapon off the scale, up over your head (the heave step: the weapon), to see how heavy it is: the pick-up you
// already have, reaching into the scale's pan (decided 15 November 2026: every action is animated), then put back.
STEPS.heave = async s => { await pickUpAct(s.heave, {reach:'in'}); };
for (const n of ['broadsword', 'fork', 'halberd']) LIFTED[n] = (x, y) => { const p = mapArtPic(n); b.drawImage(p, Math.round(x - p.width / 2), Math.round(y - p.height)); };

/* ================= THE TREASURY, AND THE IRON PILLAR ================= */
// The treasury's dark stone floor (step 8: dim, a gold heap glinting here and there), its chests, gold and pearls; and the
// throne hall's door into it, at the back of the hall: shut, red double doors with gold studs, till the Dragon Queen
// opens it; then open, warm light inside.
function treasuryFloor(g, X, Y, x, y){
  R(g, X, Y, T, T, (x + y) % 2 ? '#3E5A60' : '#43616A');
  R(g, X, Y, T, 1, '#2E464C'); R(g, X, Y, 1, T, '#2E464C');
  if (rnd(x, y, 960) < .3) R(g, X + 2 + Math.floor(rnd(x, y, 961) * 11), Y + 2 + Math.floor(rnd(x, y, 962) * 11), 2, 1, '#4E6E76');
}
function treasuryDoor(g, X, Y, x, y, open = false){
  palaceWall(g, X, Y, x, y);
  R(g, X + 2, Y + 5, 12, 11, '#E2B23A');   // its gold frame
  if (open){ R(g, X + 3, Y + 6, 10, 10, '#2A1C10'); R(g, X + 3, Y + 12, 10, 4, '#6A4A1A'); R(g, X + 4, Y + 14, 8, 2, '#C89A3A'); return; }   // (the light inside)
  R(g, X + 3, Y + 6, 5, 10, '#8E2620'); R(g, X + 8, Y + 6, 5, 10, '#8E2620'); R(g, X + 8, Y + 6, 1, 10, '#5E1812');
  for (const dx of [4, 6, 9, 11]) for (const dy of [8, 11, 14]) R(g, X + dx, Y + dy, 1, 1, '#E2B23A');   // gold studs
}
Object.assign(LOOKS, {treasuryFloor, treasuryDoor:(g, X, Y, x, y) => treasuryDoor(g, X, Y, x, y), treasuryDoorOpen:(g, X, Y, x, y) => treasuryDoor(g, X, Y, x, y, true),
  ironPillar:treasuryFloor, chest:treasuryFloor, goldHeap:treasuryFloor, pearlClam:treasuryFloor});
Object.assign(OBJECT_ART, {chest:seaThing('chest', -1), goldHeap:seaThing('goldHeap', -2), pearlClam:seaThing('pearlClam', -2)});
for (const k of ['treasuryFloor', 'ironPillar', 'chest', 'goldHeap', 'pearlClam']) UNLIT.add(k);   // (indoors and dim: no light rippling)
// The iron pillar (a place's pillar: the square at its foot), taller than the palace, glowing gold, drawn over the water's
// blue (so it glows) in the dim treasury, up through the roof and off the top of the screen, however near it you are. It
// shrinks as you tell it to (the tell step, pillarTo): short (变短), then small (变小), a staff standing at its foot; once
// you've picked it up, gone. What you tell it wrongly, you see it do too: straining to grow longer, the treasury shaking
// (变长), or growing fatter (变大), and staying so till you tell it again.
const PILLAR = {tall:{w:18, h:400}, longer:{w:22, h:400}, short:{w:18, h:46}, wide:{w:30, h:56}, small:{w:3, h:15}, gone:{w:0, h:0}};
const pillarState = () => ['tall', 'short', 'small', 'gone'][Math.min(3, (here() && here().staff) || 0)];
let pillarAnim = null, pillarHeld = null;   // (pillarAnim: its sizes, one after another, as it changes, from t0 for ms; pillarHeld: the size it's been told into, in this place)
function pillarSize(now){
  if (pillarHeld && pillarHeld.place !== PLACE) pillarHeld = pillarAnim = null;
  if (!pillarAnim) return pillarHeld && pillarHeld.state === pillarState() ? pillarHeld.size : PILLAR[pillarState()];
  const fr = pillarAnim.frames, k = Math.min(1, (now - pillarAnim.t0) / pillarAnim.ms) * (fr.length - 1), i = Math.min(fr.length - 2, Math.floor(k)), e = k - i, ease = e < .5 ? 2 * e * e : 1 - (-2 * e + 2) ** 2 / 2;
  return {w:fr[i].w + (fr[i + 1].w - fr[i].w) * ease, h:fr[i].h + (fr[i + 1].h - fr[i].h) * ease};
}
async function pillarTo(shape){
  const now = performance.now(), from = pillarSize(now), to = PILLAR[shape === 'longer' ? 'tall' : shape];
  const frames = shape === 'longer' ? [from, PILLAR.longer, PILLAR.tall] : [from, to], ms = shape === 'longer' ? 1400 : 1700;
  pillarAnim = {frames, t0:now, ms, place:PLACE}; SFX.rumble(); shakeT = now;
  await sleep(ms + 150);
  pillarAnim = null; pillarHeld = {place:PLACE, size:to, state:shape === 'wide' || shape === 'longer' ? pillarState() : null};   // (a size it was told into wrongly stays till you tell it again; a right one is its state's)
}
function drawPillar(cx, cy, now){
  const at = PLACES[PLACE].pillar; if (!at) return;
  const sz = pillarSize(now); if (sz.w < 1) return;
  const w = Math.max(2, Math.round(sz.w)), h = Math.round(sz.h), X = at[0] * T + 8 - cx, Y = at[1] * T + T - 2 - cy, L = Math.round(X - w / 2), k = .8 + Math.sin(now / 600) * .2;
  b.save(); b.globalCompositeOperation = 'screen';   // its glow, gold, round it
  const mid = Y - Math.min(h, 70) / 2, r = 22 + w, glow = b.createRadialGradient(X, mid, 2, X, mid, r + 26);
  glow.addColorStop(0, `rgba(255,226,140,${.55 * k})`); glow.addColorStop(.5, `rgba(255,214,120,${.2 * k})`); glow.addColorStop(1, 'rgba(255,226,140,0)');
  b.fillStyle = glow; b.fillRect(X - r - 26, mid - r - 26, (r + 26) * 2, (r + 26) * 2);
  if (h > 80){ b.globalAlpha = .18 * k; b.fillStyle = '#FFE6A0'; b.fillRect(L - 6, Y - h, w + 12, h); }   // (and all up it)
  b.restore();
  b.globalAlpha = .35; b.fillStyle = '#0A1418'; b.beginPath(); b.ellipse(X, Y + 1, w / 2 + 3, 2.5, 0, 0, Math.PI * 2); b.fill(); b.globalAlpha = 1;   // its shadow
  R(b, L, Y - h, w, h, '#5A606A');                                                 // the iron
  R(b, L + 1, Y - h, Math.max(1, Math.round(w * .25)), h, '#8A929C');
  if (w >= 4) R(b, L + w - 2, Y - h, 2, h, '#30343A');
  if (w >= 8) for (let y = Y - 12; y > Y - h + 8; y -= 12) R(b, L, y, w, 1, '#4A5058');
  const bh = Math.max(2, Math.round(w * .4));                                     // a gold band at each end
  for (const y of [Y - bh, Y - h]){ R(b, L - 1, y, w + 2, bh, '#E2B23A'); R(b, L - 1, y, w + 2, 1, '#F8DC80'); }
  for (let i = 0; i < 6; i++){   // sparkles drifting up round it
    const t = (now / 1800 + i / 6) % 1, sx = Math.round(X + (i % 2 ? 1 : -1) * (w / 2 + 5 + (i % 3) * 4)), sy = Math.round(Y - t * Math.min(h + 20, 90));
    b.globalAlpha = Math.sin(t * Math.PI); R(b, sx, sy - 1, 1, 3, '#FFF2B0'); R(b, sx - 1, sy, 3, 1, '#FFF2B0');
  }
  b.globalAlpha = 1;
}
// Your staff, held up over your head as you pick it up: iron, a gold band at each end
LIFTED['金箍棒'] = (x, y) => { x = Math.round(x); y = Math.round(y); R(b, x - 11, y - 3, 22, 3, '#5A606A'); R(b, x - 11, y - 3, 22, 1, '#8A929C'); for (const e of [x - 11, x + 8]) R(b, e, y - 3, 3, 3, '#E2B23A'); };

/* ================= TELLING IT WHAT TO DO ================= */
// What you tell the pillar (the tell step: one of the area's telling, by its id), a card (decided 15 November 2026, the
// Eastern Sea's plan, from its mock-up): a picture of it, what's wrong, in plain English (ask), and what you could tell it,
// 变 and a word (choices), each with its pinyin, and its English unless that's switched off in Settings, as your replies
// are. You say the one you chose (its line, says), and see it do just that (morph: what the pillar turns into): the right
// one (right, its line teaching teach), and on you go; any other, what happens (wrong, waiting for A), and you choose
// again. Not now ends the conversation, to come back to. (The staff around the mountain, Chapter 6, will be told the same way.)
const TELL_EN = {'变长':'Get longer', '变短':'Get shorter', '变大':'Get bigger', '变小':'Get smaller'};
const pyOfWord = w => (WORDS[w] || {}).py || (GLOSS[w] || [])[0] || '';
function drawTellPic(c){
  if (!c) return;
  const g = c.getContext('2d'), sz = pillarSize(performance.now()), w = Math.max(2, Math.round(Math.min(sz.w, 30) * .7)), h = Math.min(36, Math.round(sz.h * .7)), X = 24, Y = 38, L = Math.round(X - w / 2);
  g.clearRect(0, 0, c.width, c.height);
  const glow = g.createRadialGradient(X, Y - h / 2, 1, X, Y - h / 2, 22); glow.addColorStop(0, 'rgba(255,214,120,.7)'); glow.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = glow; g.fillRect(0, 0, c.width, c.height);
  R(g, L, Y - h, w, h, '#5A606A'); R(g, L + 1, Y - h, Math.max(1, Math.round(w * .25)), h, '#8A929C'); if (w >= 4) R(g, L + w - 1, Y - h, 1, h, '#30343A');
  const bh = Math.max(2, Math.round(w * .4)); R(g, L - 1, Y - bh, w + 2, bh, '#E2B23A'); if (h < 36) R(g, L - 1, Y - h, w + 2, bh, '#E2B23A');
}
function tellCard(id){
  const t = AREA.telling[id];
  return new Promise(res => {
    openCard(`<div class="tell"><canvas class="tellpic" width="48" height="40"></canvas><p class="label">${esc(fill(t.ask))}</p></div>
      <div class="opts tells" data-nav>${t.choices.map((c, i) => `<button class="opt" data-i="${i}" aria-label="${esc(TELL_EN[c] || c)}"><span class="hz">${c}</span>${S.pinyin ? `<span class="cap">${[...c].map(pyOfWord).join(' ')}</span>` : ''}${S.replyEn ? `<span class="ren">${esc(TELL_EN[c] || '')}</span>` : ''}</button>`).join('')}</div>
      <div class="actions"><button class="btn" data-a="no" data-b>Not now</button></div>`);
    drawTellPic($('#sheet .tellpic'));
    sheet.querySelectorAll('.tells .opt').forEach(b => b.onclick = () => { closeCard(); res(t.choices[+b.dataset.i]); });
    on('[data-a=no]', () => { closeCard(); res(null); });
  });
}
STEPS.tell = async (s, who) => {
  const t = AREA.telling[s.tell];
  for (;;){
    const c = await tellCard(s.tell);
    if (!c) return STOP;
    await STEPS.say({say:t.says[c], by:'player', ...(c === t.right && t.teach ? {teach:t.teach} : {})}, who);
    await pillarTo(t.morph[c]);
    if (c === t.right) return;
    await showNarration(fill(t.wrong[c]));
  }
};

/* ================= THE STAFF'S WRITING ================= */
// Its writing (the writing step: one of the area's writing, by its id), on a card: the staff close up, the writing as it's
// written on it, in pixel characters (real Chinese: HANZI in js/art.js), and under it what it says: a name, with its pinyin
// and English, as names always are; then each character, its pinyin under it once you know it, ？ till then (万, which you
// can't read yet: the Dragon King reads it out for you, the say step after it).
function drawWriting(c, lines){
  if (!c) return;
  const g = c.getContext('2d'), W = c.width;
  g.clearRect(0, 0, W, c.height);
  R(g, 0, 3, W, 28, '#5A606A'); R(g, 0, 4, W, 3, '#8A929C'); R(g, 0, 29, W, 2, '#30343A');   // the iron
  for (const x of [0, W - 9]){ R(g, x, 2, 9, 30, '#E2B23A'); R(g, x, 3, 9, 2, '#F8DC80'); R(g, x, 29, 9, 2, '#A87A1A'); }   // its gold bands
  let y = 7;
  for (const l of lines){ const text = l.zh.replace(/ /g, ''), [w, h] = writtenSize(text); write(g, text, Math.round((W - w) / 2), y, '#F2C14E'); y += h + 2; }
}
function writingCard(id){
  const wr = AREA.writing[id];
  return new Promise(res => {
    const line = l => l.name ? `<p class="wname"><span class="zh">${l.zh}</span> <span class="py">${pyOfWord(l.zh)}</span> <span class="en">· ${esc(GLOSS[l.zh] ? GLOSS[l.zh][1] : '')}</span></p>`
      : `<p class="wchars">${toks(l.zh).map(ch => `<span class="wch"><b>${ch}</b><small>${lvl(ch) >= 1 ? WORDS[ch].py : '？'}</small></span>`).join('')}</p>`;
    openCard(`<p class="label">${esc(fill(wr.label))}</p><canvas class="writpic" width="120" height="34"></canvas>
      <div class="writ">${wr.lines.map(line).join('')}</div><p class="note">${esc(fill(wr.note))}</p>
      <div class="actions"><button class="btn primary" data-a="ok">${esc(wr.go || 'Next')}</button></div>`);
    drawWriting($('#sheet .writpic'), wr.lines);
    on('[data-a=ok]', () => { closeCard(); res(); });
  });
}
STEPS.writing = async s => { await writingCard(s.writing); };

/* ================= FIGHTS UNDER THE SEA ================= */
// The backdrop for battles and animals' questions under the sea (a place's backdrop, 'sea'): blue water, lighter above,
// shafts of light, seaweed at the sides and the sandy floor (css/game.css: --backdrop-sea).
function seaBackdrop(){
  const W = 72, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), water = g.createLinearGradient(0, 0, 0, 64);
  water.addColorStop(0, '#7CC8E8'); water.addColorStop(1, '#3E8CBC'); g.fillStyle = water; g.fillRect(0, 0, W, 64);
  for (const [x, w] of [[10, 6], [38, 4], [56, 7]]){ g.fillStyle = 'rgba(230,250,255,.16)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w, 0); g.lineTo(x + w + 16, 64); g.lineTo(x + 16, 64); g.closePath(); g.fill(); }
  R(g, 0, 58, W, H - 58, '#E2D2A2');                                             // the sand
  for (let i = 0; i < 70; i++) R(g, Math.floor(rnd(i, 3, 11) * W), 60 + Math.floor(rnd(i, 4, 12) * (H - 60)), 2, 1, ['#CDBB88', '#EFE2BC', '#D8C79A'][i % 3]);
  for (const [x, top] of [[2, 30], [6, 38], [62, 34], [67, 26]]) for (let y = 60; y >= top; y--) R(g, x + Math.round(Math.sin(y / 3.4) * 1.3), y, 2, 1, y % 5 ? '#3E7A34' : '#69A84A');   // seaweed
  for (let i = 0; i < 8; i++) R(g, Math.floor(rnd(i, 6, 13) * W), Math.floor(rnd(i, 7, 14) * 56), 1, 1, '#E8FAFF');   // bubbles
  return c;
}
BACKDROPS.sea = seaBackdrop;
if (document.documentElement) document.documentElement.style.setProperty('--backdrop-sea', `url(${seaBackdrop().toDataURL()})`);
// Jellyfish drifting over a place (its jellies: [x, y] each), bobbing slowly up and down, over the water's blue so they
// keep their colour, and glowing at night (step 3: the seaweed forest; the plan: more at night, glowing).
function drawJellies(cx, cy, now){
  const list = PLACES[PLACE].jellies; if (!list) return;
  const spr = mapSprite('水母'), night = typeof isNight === 'function' && isNight();
  list.forEach(([x, y], i) => {
    const X = Math.round(x * T - cx + Math.sin(now / 2600 + i * 2) * 4), Y = Math.round(y * T - cy - 6 + Math.sin(now / 900 + i * 1.7) * 5);
    if (X < -T || Y < -T || X > VW * T || Y > VH * T) return;
    if (night){ const glow = b.createRadialGradient(X + 8, Y + 7, 1, X + 8, Y + 7, 12); glow.addColorStop(0, 'rgba(255,190,240,.55)'); glow.addColorStop(1, 'rgba(255,190,240,0)'); b.fillStyle = glow; b.fillRect(X - 6, Y - 6, 28, 28); }
    b.globalAlpha = night ? 1 : .85; b.drawImage(spr, X, Y); b.globalAlpha = 1;
  });
}
// The octopus squirting ink as you meet it (an animal that inks): a dark cloud billowing out round it, then thinning away.
function drawInk(cx, cy, now){
  if (!foe || !foe.a.inks) return;
  const e = now - foe.t0; if (e > 1500) return;
  const X = foe.x * T - cx + 8, Y = foe.y * T - cy + 8, k = e / 1500;
  b.globalAlpha = .7 * (1 - k);
  for (let i = 0; i < 7; i++){ const a = i * .9, r = 3 + k * 14; R(b, Math.round(X + Math.cos(a) * r * (.6 + (i % 3) * .2) - 3), Math.round(Y + Math.sin(a) * r * .7 - 3), 6 + (i % 2) * 2, 5, i % 2 ? '#2A1E34' : '#3E3050'); }
  b.globalAlpha = 1;
}
