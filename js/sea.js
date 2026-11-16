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
  const plumes = plumesAt; plumesAt = null;   // (where the golden hat's feathers were drawn over you: drawn again, clear, over the water)
  drawHomeThings(cx, cy, sh, now);   // (Chapter 6: the dream's dusk and lamps; your staff out of your ear, peaches falling, the rope, a glint)
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
  drawSeaRings(cx, cy, now);   // (the throne hall's drum and bell, struck: rings of sound)
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
  if (plumes) drawPlumes(b, ...plumes);   // (the golden hat's feathers, poking up out of your bubble)
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
// again. Not now ends the conversation, to come back to. The staff around the mountain (Chapter 6) is told the same way, out
// of your ear in your paws, where no iron pillar stands (each telling's staff: the size it turns into for each choice; up:
// held upright whichever way you face, such as up into the tallest peach tree).
const TELL_EN = {'变长':'Get longer', '变短':'Get shorter', '变大':'Get bigger', '变小':'Get smaller'};
const pyOfWord = w => (WORDS[w] || {}).py || (GLOSS[w] || [])[0] || '';
function drawTellPic(c){
  if (!c) return;
  const out = !PLACES[PLACE].pillar && staffNow();   // (at home, Chapter 6: your staff, out of your ear, as it is now)
  const g = c.getContext('2d'), sz = out ? {w:out.w * 3, h:out.len * 1.3} : pillarSize(performance.now()), w =Math.max(2, Math.round(Math.min(sz.w, 30) * .7)), h = Math.min(36, Math.round(sz.h * .7)), X = 24, Y = 38, L = Math.round(X - w / 2);
  g.clearRect(0, 0, c.width, c.height);
  const glow = g.createRadialGradient(X, Y - h / 2, 1, X, Y - h / 2, 22); glow.addColorStop(0, 'rgba(255,214,120,.7)'); glow.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = glow; g.fillRect(0, 0, c.width, c.height);
  R(g, L, Y - h, w, h, '#5A606A'); R(g, L + 1, Y - h, Math.max(1, Math.round(w * .25)), h, '#8A929C'); if (w >= 4) R(g, L + w - 1, Y - h, 1, h, '#30343A');
  const bh = Math.max(2, Math.round(w * .4)); R(g, L - 1, Y - bh, w + 2, bh, '#E2B23A'); if (h < 36) R(g, L - 1, Y - h, w + 2, bh, '#E2B23A');
}
// With more than two choices (the staff around the mountain: all four, 变长 变短 变大 变小, decided 16 November 2026 after the
// owner's review: two were a coin toss), only those whose word you know, the right one always, in a new order each time.
const tellChoices = t => {
  if (t.choices.length <= 2) return t.choices;   // (the iron pillar's two, as they are)
  const known = t.choices.filter(c => c === t.right || [...c].slice(1).every(ch => lvl(ch) >= 1));
  return known.length > 2 ? shuffle(known) : known;
};
function tellCard(id){
  const t = AREA.telling[id], choices = tellChoices(t);
  return new Promise(res => {
    openCard(`<div class="tell"><canvas class="tellpic" width="48" height="40"></canvas><p class="label">${esc(fill(t.ask))}</p></div>
      <div class="opts tells${choices.length > 2 ? ' four' : ''}" data-nav>${choices.map((c, i) => `<button class="opt" data-i="${i}" aria-label="${esc(TELL_EN[c] || c)}"><span class="hz">${c}</span>${S.pinyin ? `<span class="cap">${[...c].map(pyOfWord).join(' ')}</span>` : ''}${S.replyEn ? `<span class="ren">${esc(TELL_EN[c] || '')}</span>` : ''}</button>`).join('')}</div>
      <div class="actions"><button class="btn" data-a="no" data-b>Not now</button></div>`);
    drawTellPic($('#sheet .tellpic'));
    sheet.querySelectorAll('.tells .opt').forEach(b => b.onclick = () => { closeCard(); res(choices[+b.dataset.i]); });
    on('[data-a=no]', () => { closeCard(); res(null); });
  });
}
STEPS.tell = async (s, who) => {
  const t = AREA.telling[s.tell], atHome = !PLACES[PLACE].pillar;
  if (atHome && !staffOut) await staffTo(STAFF_OUT.normal, 600, t.up);   // (out of your ear, or your paw, the size it usually is)
  for (;;){
    const c = await tellCard(s.tell);
    if (!c){ if (atHome) await staffAway(); return STOP; }
    await STEPS.say({say:t.says[c], by:'player', ...(c === t.right && t.teach ? {teach:t.teach} : {})}, who);
    if (atHome) await staffTo(t.staff[c]); else await pillarTo(t.morph[c]);
    if (c === t.right) return;
    await showNarration(fill(t.wrong[c]));
    if (atHome) await staffTo(STAFF_OUT.normal, 600);   // (back as it was, to tell it again)
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

/* ================= THE DRUM AND THE BELL, AND THE DRAGON KINGS' GIFTS ================= */
// The throne hall's (step 9): the Dragon King's drum and bell, either side of his throne (each one big object, two squares
// by two), struck with your staff to call his brothers: rings of sound spreading out through the water from each blow
// (seaRings), a BOOM or a DONG, and the thing shaking.
Object.assign(LOOKS, {palaceDrum: jadeFloor, palaceBell: jadeFloor});
OBJECT_ART.palaceDrum = (g, o) => seaThing('palaceDrum')(g, o);
OBJECT_ART.palaceBell = (g, o) => seaThing('palaceBell')(g, o);
BLOCK_OBJECTS.push('palaceDrum', 'palaceBell');
const seaRings = [], RING_MS = 1500;
const ringPixels = (g, X, Y, rx, ry, c) => { const n = Math.max(12, Math.round((rx + ry) * 2)); for (let i = 0; i < n; i++){ const a = i / n * Math.PI * 2; R(g, Math.round(X + rx * Math.cos(a)), Math.round(Y + ry * Math.sin(a)), 1, 1, c); } };
function drawSeaRings(cx, cy, now){
  for (let i = seaRings.length - 1; i >= 0; i--){
    const r = seaRings[i], k = (now - r.t0) / (RING_MS * (r.bell ? 1.6 : 1));
    if (k >= 1){ seaRings.splice(i, 1); continue; }
    for (const d of [0, .16, .32]){ const kk = k - d; if (kk <= 0) continue;
      b.globalAlpha = Math.max(0, (1 - kk) * .75); ringPixels(b, r.x - cx, r.y - cy, 6 + kk * 64, 4 + kk * 42, r.bell ? '#FFF0B0' : '#FFFFFF'); }
    b.globalAlpha = 1;
  }
}
// Striking something with your staff (strike: 'drum' or 'bell'), so many times (times): your staff swung as in the hit step,
// then a BOOM, or a DONG that rings on, the thing shaking, and rings of sound spreading out through the water from it.
STEPS.strike = async s => {
  const [x, y] = facing(), bell = s.strike === 'bell';
  const o = mapObjects().find(o => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h), piece = o && OBJECT_PIECES.find(p => p.key === objectKey(o));
  const mid = o ? [(o.x + o.w / 2) * T, (o.y + o.h / 2) * T] : [(x + .5) * T, (y + .5) * T];
  for (let i = 0; i < (s.times || 1); i++){
    swing = {t0:performance.now(), x, y, with:weaponNow()}; SFX.swish();
    await sleep(SWING_MS * SWING_CONTACT);
    (bell ? SFX.bigBell : SFX.drum)(); seaRings.push({x:mid[0], y:mid[1], t0:performance.now(), bell});
    if (piece) piece.rustle = performance.now(); shakeT = performance.now() - 400;
    await sleep(SWING_MS * (1 - SWING_CONTACT) + (bell ? 700 : 200));
  }
};
// A gift to wear, given you and put on at once (gift: its item in the wardrobe, such as the dragon kings' 金色 的 帽子, a
// golden hat): on your monkey as you watch, then its card, its picture and what it's called, with what you're told (note);
// then what your monkey says as it wears it, the wardrobe's sentence (我戴金色的帽子), as when you put something on there,
// and as its voice clip says it (tests/playthrough-area3.test.js found it said with a full stop, which has no clip).
// Walking in the cloud shoes (the Dragon King of the North Sea's gift): little wisps of cloud puffing up at your heels, drifting
// back the way you came and fading (and each step a little quicker: CLOUD_STEP, js/input.js).
function drawCloudSteps(PX, PY, now, dir){
  const [dx, dy] = DV[dir];
  for (let i = 0; i < 3; i++){
    const k = ((now / 420) + i / 3) % 1, X = Math.round(PX + 8 - dx * (3 + k * 7) + (i - 1) * 3), Y = Math.round(PY + 14 - dy * (2 + k * 5) - k * 2);
    b.globalAlpha = (1 - k) * .8; R(b, X - 2, Y, 4, 2, '#FFFFFF'); R(b, X - 1, Y - 1, 2, 1, '#FFFFFF'); R(b, X - 2, Y + 1, 4, 1, '#C8DCEE');
  }
  b.globalAlpha = 1;
}
STEPS.gift = async (s, who, last) => {
  const c = CLOTHES.find(x => x.item === s.gift), a = asSaid(c);
  if (!S.wardrobe.owned.includes(c.item)) S.wardrobe.owned.push(c.item);
  putOn(c.item); save(); redress(); SFX.right();
  await showPicked({zh:c.item, en:a.en}, fill(s.note), {label:s.label || 'A gift for you', pic:a.pic});
  toks(a.sentence).forEach(t => { if (WORDS[t]) useWord(t); });
  await showDialog(speaker('player'), {t:toks(a.sentence), en:a.sentenceEn}, last ? {last:true} : {});
};
Object.assign(STEP_OPTIONS, {strike:['times'], gift:['note', 'label']});

// The Dragon King's brothers coming, as you ring his bell (the brothers scene): rings of sound spreading out from the palace
// through the deep blue, and three dragons swimming in to it, the South Sea's up from the south, red, the West Sea's in from
// the west, white, and the North Sea's down from the north, black.
const DRAGONS = [
  {from:[-30, 210], to:[66, 92], body:'#D8483A', belly:'#F6C08A', mane:'#F2C84A', dark:'#6A1A14', delay:.3},
  {from:[-80, 40], to:[60, 50], body:'#E6EEF2', belly:'#B4C4D0', mane:'#7AA4D0', dark:'#4A5A68', delay:.8},
  {from:[260, -70], to:[176, 54], body:'#3A3E46', belly:'#7A808A', mane:'#7070C0', dark:'#101216', delay:1.3}
];
const seaDisc = (X, Y, r, c) => { for (let dy = -Math.floor(r); dy <= Math.floor(r); dy++){ const w = Math.floor(Math.sqrt(r * r - dy * dy)); R(b, Math.round(X) - w, Math.round(Y) + dy, 2 * w + 1, 1, c); } };
function drawDragon(d, t, now){
  const u = (t - d.delay) / 3.6; if (u <= 0) return;
  const [fx, fy] = d.from, [tx, ty] = d.to, dx = tx - fx, dy = ty - fy, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  const at = k => { const e = k >= 1 ? 1 : k <= 0 ? k : 1 - (1 - k) * (1 - k); return [fx + dx * e, fy + dy * e]; };   // (along its way in, slowing as it comes)
  const N = 24, pts = [];
  for (let i = 0; i < N; i++){
    const [px, py] = at(Math.min(u, 1) - i * .045), wig = Math.sin(i * .6 - now / 170) * (2 + i * .1) * (i ? 1 : 0);
    pts.push([px + nx * wig, py + ny * wig, i]);
  }
  for (let j = pts.length - 1; j >= 0; j--){   // (from its tail to its head)
    const [x, y, i] = pts[j], r = 1.8 + 3.2 * (1 - i / N);
    seaDisc(x, y, r + 1, d.dark); seaDisc(x, y, r, d.body); R(b, Math.round(x + nx * -r * .5), Math.round(y + ny * -r * .5), 1, 1, d.belly);
    if (i % 3 === 1) R(b, Math.round(x + nx * (r + 1)), Math.round(y + ny * (r + 1)), 1, 1, d.mane);   // its mane, along its back
  }
  const [hx, hy] = pts[0], ux = dx / len, uy = dy / len;   // its head, looking the way it's going
  seaDisc(hx, hy, 6, d.dark); seaDisc(hx, hy, 5, d.body); seaDisc(hx + ux * 5, hy + uy * 5, 3.2, d.dark); seaDisc(hx + ux * 5, hy + uy * 5, 2.4, d.body);   // (and its snout)
  for (const s of [1, -1]){   // its horns, and its whiskers trailing behind
    for (let k = 1; k <= 5; k++) R(b, Math.round(hx - ux * k + nx * s * (2 + k * .6)), Math.round(hy - uy * k + ny * s * (2 + k * .6)), 1, 1, '#E8D8A0');
    for (let k = 1; k <= 9; k++) R(b, Math.round(hx + ux * 5 - ux * k * 1.4 + nx * s * (3 + Math.sin(now / 200 + k * .7 + s) * 1.5)), Math.round(hy + uy * 5 - uy * k * 1.4 + ny * s * (3 + Math.sin(now / 200 + k * .7 + s) * 1.5)), 1, 1, d.mane);
  }
  R(b, Math.round(hx + ux * 1.5 + nx * 2), Math.round(hy + uy * 1.5 + ny * 2), 1, 1, '#FFFFFF'); R(b, Math.round(hx + ux * 1.5 - nx * 2), Math.round(hy + uy * 1.5 - ny * 2), 1, 1, '#FFFFFF');   // its eyes
}
function drawBrothers(t, now){
  const W = VW * T, H = VH * T;
  for (let y = 0; y < H; y += 2) R(b, 0, y, W, 2, mix('#123A5E', '#071A2E', y / H));   // the deep
  for (const s of [0, 1]) for (let y = 0; y < H; y += 2){ const w = 26 + Math.round(Math.sin(y / 13 + s * 2) * 6) + Math.round(y / 6); R(b, s ? W - w : 0, y, w, 2, s ? '#0A1E30' : '#0C2234'); }   // the trench's sides
  const gate = mapArtPic('palaceGate'), gx = Math.round(W / 2 - gate.width / 2), gy = 104 - gate.height;
  const glow = b.createRadialGradient(W / 2, gy + gate.height / 2, 4, W / 2, gy + gate.height / 2, 90);
  glow.addColorStop(0, 'rgba(255,220,140,.4)'); glow.addColorStop(1, 'rgba(255,220,140,0)'); b.fillStyle = glow; b.fillRect(0, 0, W, H);
  b.drawImage(gate, gx, gy);
  for (const [at, bell] of [[.3, false], [.9, false], [1.7, true]]){   // the drum's BOOMs and the bell's DONG, spreading out through the sea
    const k = (t - at) / (bell ? 2.6 : 1.6); if (k <= 0 || k >= 1) continue;
    for (const d of [0, .14]){ const kk = k - d; if (kk <= 0) continue; b.globalAlpha = (1 - kk) * .8; ringPixels(b, W / 2, gy + 22, 10 + kk * 150, 6 + kk * 90, bell ? '#FFF0B0' : '#FFFFFF'); }
    b.globalAlpha = 1;
  }
  for (const d of DRAGONS) drawDragon(d, t, now);
  for (let i = 0; i < 8; i++){ const bx = (i * 37 + 11) % W, by = Math.round(H - ((now * .02 + i * 29) % (H + 10))); R(b, bx, by, 1, 1, 'rgba(232,250,255,.7)'); }   // bubbles rising
}
// Home with the staff (the swimHome scene, from the seabed with the sea turtle): up through the water in your bubble,
// in the dragon kings' gifts, the turtle swimming beside you, the blue growing lighter and lighter; then out of the water
// under the iron bridge in the Water Curtain Cave, the waterfall's curtain of light behind it.
function drawSwimHome(t, now){
  const W = VW * T, H = VH * T, turtle = sprite(PICTURES['海龟'].rows, PICTURES['海龟'].palette);
  if (t < 5){
    const up = clamp(t / 5, 0, 1);
    for (let y = 0; y < H; y += 2) R(b, 0, y, W, 2, mix(mix('#1E5A86', '#8FD4EE', up), mix('#123A5E', '#3A8CBC', up), y / H));
    b.save(); b.globalCompositeOperation = 'screen'; b.globalAlpha = .06 + up * .1; b.fillStyle = '#E6FBFF';
    for (const [sx, w] of SEA_BEAMS){ b.beginPath(); b.moveTo(sx, -2); b.lineTo(sx + w, -2); b.lineTo(sx + w + 46, H + 2); b.lineTo(sx + 46, H + 2); b.closePath(); b.fill(); }
    b.restore();
    for (let i = 0; i < 7; i++){   // fish going by, down past you as you rise
      const fish = mapArtPic(i % 3 ? 'fishYellow' : 'fishBlue'), fx = 20 + (i * 53) % (W - 40), fy = Math.round(((now / 22 + i * 41) % (H + 30)) - 15);
      b.drawImage(fish, fx, fy);
    }
    if (t > 3.6){ const k = clamp((t - 3.6) / 1.4, 0, 1), sy = Math.round(-20 + k * 46); for (let x = 0; x < W; x += 3) R(b, x, sy + Math.round(Math.sin(x / 9 + now / 200) * 2), 3, 2, 'rgba(240,252,255,.9)'); }   // the surface, coming down to meet you
    const my = Math.round(78 + Math.sin(now / 420) * 2), mx = 112;
    b.drawImage(turtle, 70, Math.round(84 + Math.sin(now / 380) * 3), 24, 24);
    b.drawImage(monkeySprite('player', 'up', false), mx, my); drawPlumes(b, mx, my, 'up');
    b.globalAlpha = .75; for (const [dx, dy] of RING) R(b, mx + 8 + dx, my + 7 + dy, 1, 1, '#E9FBFF'); b.globalAlpha = 1;
    for (let i = 0; i < 6; i++){ const by = Math.round(my - ((now * .03 + i * 13) % 60)); R(b, mx + 6 + (i % 3) * 3, by, 1, 1, 'rgba(255,255,255,.85)'); }
    if (t > 4.6){ b.globalAlpha = clamp((t - 4.6) / .4, 0, 1); R(b, 0, 0, W, H, '#F4FCFF'); b.globalAlpha = 1; }   // bursting out into the light
    return;
  }
  // the Water Curtain Cave: its rock, the waterfall's curtain of light at the back, the iron bridge, and the pool under it
  for (let y = 0; y < H; y += 4) R(b, 0, y, W, 4, mix('#2A231E', '#4A3E33', y / H));
  for (let i = 0; i < 60; i++) R(b, Math.floor(rnd(i, 41) * W), Math.floor(rnd(i, 42) * 60), 2 + Math.floor(rnd(i, 43) * 5), 2, i % 2 ? '#3A312A' : '#55483C');
  R(b, 30, 0, W - 60, 26, '#BFE8F4');
  for (let i = 0; i < 40; i++){ const x = 30 + (i * 23) % (W - 60), y = Math.round((now / 6 + i * 17) % 30) - 4; R(b, x, y, 1, 4, '#FFFFFF'); }   // the waterfall, seen from behind
  R(b, 30, 24, W - 60, 2, '#7AAFC4');
  R(b, 0, 86, W, H - 86, '#2E6E96'); for (let x = 0; x < W; x += 4) R(b, x, 86 + (x % 8 ? 0 : 1), 3, 1, '#7EC0E0');   // the pool
  for (const x of [20, 214]){ R(b, x, 34, 6, 38, '#3A3E46'); R(b, x, 34, 2, 38, '#5A606A'); }   // the iron bridge's posts
  R(b, 0, 40, W, 6, '#4A4E58'); R(b, 0, 40, W, 1, '#7A808A'); R(b, 0, 46, W, 2, '#26282E');   // its deck
  R(b, 0, 30, W, 1, '#5A606A'); for (let x = 4; x < W; x += 12) R(b, x, 30, 1, 10, '#5A606A');   // its railing
  const k = clamp((t - 5) / .7, 0, 1), my = Math.round(84 - k * 10), mx = 112;   // you, coming up out of the water
  const you = monkeySprite('player', 'down', now % 3200 < 130);
  b.drawImage(you, 0, 0, 16, 12, mx, my, 16, 12); drawPlumes(b, mx, my, 'down');
  b.drawImage(turtle, 0, 0, 32, 20, 78, 72, 24, 15);
  for (const [x, w] of [[mx - 2, 20], [76, 28]]) R(b, x, 86 - 2, w, 1, '#D6F2FF');
  const ring = ((now - 0) / 900) % 1; b.globalAlpha = 1 - ring; ringPixels(b, mx + 8, 85, 10 + ring * 18, 2 + ring * 3, '#BFE8F4'); b.globalAlpha = 1;
  if (t < 5.4){ b.globalAlpha = 1 - clamp((t - 5) / .4, 0, 1); R(b, 0, 0, W, H, '#F4FCFF'); b.globalAlpha = 1; }
}
Object.assign(SCENE_ART, {brothers: drawBrothers, swimHome: drawSwimHome});

/* ================= CHAPTER 6: HOME WITH THE STAFF ================= */
// Home with the staff (Chapter 6, built 16 November 2026 from the Area 3 plan). At a spot at home you tell your staff what
// to do (the tell step, where no iron pillar stands): it comes out of your ear into your paws, out the way you face, and
// grows or shrinks as you watch (each telling's staff: its length and thickness in pixels, for each thing you could tell
// it), till you put it back in your ear, a needle again (the stow step). While it's out, or once it's in your ear (the
// area's inEar), the staff in your paw isn't drawn (staffInEar, for inHand in js/art.js).
const STAFF_OUT = {needle:{len:2, w:1}, normal:{len:20, w:3}};
let staffOut = null;   // {from, to, t0, ms}: your staff out of your ear, changing from one size to the other (staffNow)
function staffNow(now = performance.now()){
  if (!staffOut) return null;
  const k = Math.min(1, (now - staffOut.t0) / staffOut.ms), e = k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2, f = staffOut.from, t = staffOut.to;
  return {len:f.len + (t.len - f.len) * e, w:f.w + (t.w - f.w) * e, moving:k < 1};
}
function staffInEar(){ return !!staffOut || !!staffLying || !!(AREA.inEar && S && S.areas && here() && matches(AREA.inEar)); }   // (out, lying on the ground, or in your ear)
async function staffTo(size, ms = 900, up = staffOut && staffOut.up){   // (up: held upright whichever way you face, such as up into the tallest peach tree)
  const now = performance.now(), from = staffNow(now) || STAFF_OUT.needle, grows = size.len > from.len + 4 || size.w > from.w + 1;
  staffOut = {from:{len:from.len, w:from.w}, to:size, t0:now, ms, up:!!up}; redress();
  if (grows){ SFX.rumble(); shakeT = now - 250; } else SFX.shimmer();
  await sleep(ms + 120);
}
async function staffAway(){ if (!staffOut) return; await staffTo(STAFF_OUT.needle, 450); staffOut = null; redress(); }
// In your paws, from your paws out the way you face: iron, a gold band at each end, glowing as it changes.
function drawStaffOut(cx, cy, now){
  const sz = staffNow(now); if (!sz) return;
  const len = Math.max(1, Math.round(sz.len)), w = Math.max(1, Math.round(sz.w)), PX = Math.round(pl.px - cx), PY = Math.round(pl.py - cy), d = staffOut.up ? 'up' : pl.dir, up = d === 'up' || d === 'down';
  const side = staffOut.up ? {left:-3, right:4}[pl.dir] || 0 : 0;   // (held upright, on the side you face)
  const x = up ? PX + 8 + side - Math.floor(w / 2) : d === 'left' ? PX + 4 - len : PX + 12, y = up ? (d === 'up' ? PY + 9 - len : PY + 9) : PY + 10 - Math.floor(w / 2);
  const W = up ? w : len, H = up ? len : w, rim = w > 2 ? 1 : 0, bh = Math.max(1, Math.min(3, Math.round(len / 7)));
  if (sz.moving){ b.save(); b.globalCompositeOperation = 'screen'; b.globalAlpha = .45; R(b, x - 2, y - 2, W + 4, H + 4, '#FFD878'); b.restore(); }
  R(b, x, y, W, H, '#5A606A');
  if (up) R(b, x, y, Math.max(1, Math.round(W * .34)), H, '#8A929C'); else R(b, x, y, W, Math.max(1, Math.round(H * .34)), '#8A929C');
  if (up){ R(b, x - rim, y, W + 2 * rim, bh, '#E2B23A'); R(b, x - rim, y + H - bh, W + 2 * rim, bh, '#E2B23A'); }
  else { R(b, x, y - rim, bh, H + 2 * rim, '#E2B23A'); R(b, x + W - bh, y - rim, bh, H + 2 * rim, '#E2B23A'); }
}
// Back in your ear, a needle again (stow); or just gone from your paws, where it's become something (stow: 'left'), such as
// a bridge across the meadow's pond.
STEPS.stow = async s => { if (s.stow === 'left'){ staffOut = null; redress(); return; } await staffAway(); };
// Out of your ear, big, and back (flourish), such as to scare off the officers of the underworld in the dream.
STEPS.flourish = async () => { await staffTo({len:30, w:6}, 700); await sleep(400); await staffAway(); };
// Fruit falling from the top of the tree you face (drop: its word; n: how many), into your paws as you catch them.
const drops = [];
STEPS.drop = async s => {
  const [x, y] = facing(), now = performance.now(), n = s.n || 3;
  for (let i = 0; i < n; i++) drops.push({w:s.drop, x0:x * T + 2 + i * 4, y0:y * T - 22 + (i % 2) * 4, x1:pl.px + 1 + i * 4, y1:pl.py + 4, t0:now + i * 260});
  await sleep(650 + n * 260); SFX.bump();
};
function drawDrops(cx, cy, now){
  for (let i = drops.length - 1; i >= 0; i--){
    const d = drops[i], k = (now - d.t0) / 650;
    if (k < 0) continue;
    if (k > 1.5){ drops.splice(i, 1); continue; }
    const kk = Math.min(1, k), X = d.x0 + (d.x1 - d.x0) * kk, Y = d.y0 + (d.y1 - d.y0) * kk * kk - (k > 1 ? Math.sin((k - 1) / .5 * Math.PI) * 3 : 0);
    b.globalAlpha = k > 1.3 ? (1.5 - k) / .2 : 1; b.drawImage(itemPic(d.w), Math.round(X - cx), Math.round(Y - cy), 9, 9); b.globalAlpha = 1;
  }
}
// A boulder you're facing, levered aside with your staff (roll), and rolling away as you watch, two squares to one side
// (whichever side it can roll), bumping and tumbling, earth flying where it was, then out of sight into the long grass
// (decided 16 November 2026, after the owner's review: it just vanished in a puff of dust). It's drawn as the map draws a
// boulder, its crack turning over as it rolls. The square it was on changes as it starts to roll (the content's set).
const rolling = [];   // {x, y, dx, dy, t0}: boulders rolling away
const ROLL_MS = 1300;
STEPS.roll = async () => {
  const [x, y] = facing(), [fx, fy] = DV[pl.dir], sides = [[fy, fx], [-fy, -fx], [fx, fy]];   // (to either side, or else away from you)
  const [dx, dy] = sides.find(([a, c]) => walkable(x + a, y + c) && walkable(x + 2 * a, y + 2 * c)) || sides[0];
  SFX.rumble(); shakeT = performance.now(); burst(x, y, 'earth');
  rolling.push({x, y, dx, dy, t0:performance.now()});
  for (let i = 0; i < 3; i++){ await sleep(ROLL_MS / 3); SFX.bump(); }
};
function drawRolling(cx, cy, now){
  for (let i = rolling.length - 1; i >= 0; i--){
    const r = rolling[i], k = (now - r.t0) / ROLL_MS;
    if (k >= 1){ rolling.splice(i, 1); continue; }
    const e = 1 - (1 - k) ** 2, X = Math.round((r.x + r.dx * 2 * e) * T - cx), Y = Math.round((r.y + r.dy * 2 * e) * T - cy - Math.abs(Math.sin(k * Math.PI * 3)) * 3);
    b.globalAlpha = k > .7 ? (1 - k) / .3 : 1;
    boulder(b, X + 8, Y + 15, 6, 6, Math.floor(k * 8) % 2 === 0);   // (its crack turning over as it rolls)
    if (Math.floor(now / 90) % 2) R(b, X + 2 - r.dx * 6, Y + 14, 3, 1, '#C8B898');   // dust kicked up behind it
    b.globalAlpha = 1;
  }
}
// The little monkeys trying to lift your staff, at home (tryLift: who), as you show it them (decided 16 November 2026, after
// the owner's review: it was only a message): you lay it down on the ground beside you, they come up to it, one either
// side, and heave at it, straining, shaking, sweat flying, the staff hardly stirring; then you pick it up with one paw
// (liftStaff), and it's back in your paws.
let staffLying = null;   // {x, y, place, t0}: your staff lying on the ground
STEPS.tryLift = async s => {
  const free = (x, y) => walkable(x, y) && !npcAt(x, y) && !animalAt(x, y) && !(x === pl.x && y === pl.y);
  const spot = Object.entries(DV).map(([d, [dx, dy]]) => [pl.x + dx, pl.y + dy, d]).find(([x, y]) => free(x, y)) || [...facing(), pl.dir];
  pl.dir = spot[2]; pl.turnT = performance.now(); S.pos = {...S.pos, dir:pl.dir};
  staffLying = {x:spot[0], y:spot[1], place:PLACE, t0:performance.now()}; redress(); SFX.bump();
  await sleep(350);
  const taken = [[pl.x, pl.y]];
  for (const id of s.tryLift){
    const n = NPCS.find(c => c.id === id); if (!n) continue;
    const by = Object.values(DV).map(([dx, dy]) => [spot[0] + dx, spot[1] + dy]).filter(([x, y]) => free(x, y) && !taken.some(([a, c]) => a === x && c === y))
      .sort((a, c) => Math.hypot(a[0] - n.x, a[1] - n.y) - Math.hypot(c[0] - n.x, c[1] - n.y))[0];
    if (!by) continue;
    taken.push(by);
    await STEPS.walk({walk:id, to:by, ms:200});
    n.dir = dirOf(spot[0] - n.x, spot[1] - n.y) || n.dir;
  }
  const now = performance.now(), strain = 1700;
  for (const id of s.tryLift){ const n = NPCS.find(c => c.id === id); if (n) n.strainUntil = now + strain; }
  staffLying.wobble = now;
  for (let i = 0; i < 4; i++){ SFX.scuffle(); await sleep(strain / 4); }
};
STEPS.liftStaff = async () => {
  if (!staffLying) return;
  pl.dir = dirOf(staffLying.x - pl.x, staffLying.y - pl.y) || pl.dir;
  staffLying = null;
  await pickUpAct('金箍棒');   // (with one paw, up over your head)
  redress();
};
function drawStaffLying(cx, cy, now){
  const s = staffLying; if (!s || s.place !== PLACE) return;
  const X = s.x * T - cx, Y = s.y * T - cy, lift = s.wobble && now - s.wobble < 1700 && Math.floor((now - s.wobble) / 110) % 3 === 0 ? 1 : 0;
  R(b, X + 1, Y + 12, 14, 1, 'rgba(0,0,0,.25)');                                                   // its shadow
  R(b, X + 1, Y + 9 - lift, 14, 3, '#5A606A'); R(b, X + 1, Y + 9 - lift, 14, 1, '#8A929C'); R(b, X + 1, Y + 11 - lift, 14, 1, '#30343A');
  for (const ex of [X, X + 13]) R(b, ex, Y + 8 - lift, 3, 5, '#E2B23A');                           // a gold band at each end
}
// Straining (a character's strainUntil): shaking on the spot, a drop of sweat flying now and then (drawn in js/draw.js's
// characters, through strainShake and drawStrain).
// Someone straining or shaking (strain: who; ms: how long), such as the old monkey, shaking you awake.
STEPS.strain = async s => { const now = performance.now(); for (const id of s.strain){ const n = NPCS.find(c => c.id === id); if (n) n.strainUntil = now + (s.ms || 900); } SFX.scuffle(); await sleep(s.ms || 900); };
const strainShake = (n, now) => now < (n.strainUntil || 0) ? (Math.floor(now / 60) % 2 ? 1 : -1) : 0;
function drawStrain(n, X, Y, now){
  if (now >= (n.strainUntil || 0)) return;
  const k = (now % 500) / 500;
  R(b, Math.round(X + 13 + k * 3), Math.round(Y - 1 + k * k * 6), 1, 2, '#9CD3F5');   // sweat flying off
  if (Math.floor(now / 120) % 2) for (const [dx, dy] of [[-2, 3], [17, 3]]) R(b, X + dx, Y + dy, 1, 3, '#FFFFFF');   // effort lines
}
// Lending your staff to someone (lend: who; ms: for how long), such as the little monkey in training: in their paws, made
// small enough (the tell step first), swung round and round, as they swing their own stick; then back to you (drawn in
// js/draw.js's characters, through lentNow).
STEPS.lend = async s => {
  const n = NPCS.find(c => c.id === s.lend); if (!n) return;
  n.lend = {what:'金箍棒', t0:performance.now(), until:performance.now() + (s.ms || 2600)};
  staffOut = null; redress();
  for (let i = 0; i < 3; i++){ await sleep((s.ms || 2600) / 3); SFX.swish(); }
  n.lend = null;
};
const lentNow = (n, now) => n.lend && now < n.lend.until ? n.lend : null;
// Asleep in the bed you face (asleep), as you wake from the dream: lying in it, under its blanket, till you wake (wake),
// sit up and hop down beside it again, as after sleeping there.
STEPS.asleep = async () => { const [bx, by] = facing(); sleepAt = {x:bx, y:by, room:false}; pl.py = by * T; sleepT = -9999; };
STEPS.wake = async () => {
  if (!sleepAt) return;
  const {x, y} = sleepAt; sleepAt = null; pl.py = y * T - 3;
  pl.dir = 'down'; await hop(pl.x * T, pl.y * T);
  S.pos.dir = pl.dir; save(); wakeT = performance.now(); SFX.chime();
};
// The staff back from where it lay across the pond (staffBack): out from your paws to the far bank, shrinking back to a
// needle, into your ear, as the troop's planks stay under it.
STEPS.staffBack = async () => { staffOut = {from:{len:34, w:4}, to:{len:34, w:4}, t0:0, ms:1, up:false}; redress(); await sleep(250); await staffAway(); };
// Planks laid across the water, one after another (plank: [x, y] each), as the big monkey lays them, with a knock each:
// the square becomes what its legend's becomes says once the content sets it (the planks under your staff).
STEPS.plank = async s => { for (const [x, y] of s.plank){ burst(x, y, 'wood'); SFX.clack(); await sleep(420); } };
// Lines that come round in turn (chat: the lines, said one each time you talk to them, from where they left off), so
// everyone has a few things to say, using the words you've learned (decided 16 November 2026, after the owner's review:
// the sea's words were hardly ever heard again). Who's said what is kept for the session, not in the save.
const chatTurn = {};
STEPS.chat = async (s, who, last) => {
  const id = typeof who === 'string' ? who : who && who.id, i = chatTurn[id] = ((chatTurn[id] ?? (id ? id.length : 0) % s.chat.length - 1) + 1) % s.chat.length;
  await STEPS.say({say:s.chat[i]}, who, last);
};
CHAT_STEPS.push('chat');
Object.assign(STEP_OPTIONS, {drop:['n'], lend:['ms'], strain:['ms']});
// The rope round you in the dream (the area's rope: while its if matches, in its place), tied by the officers of the
// underworld, its end in the hand of the one leading you (by).
function drawRope(cx, cy, now){
  const r = AREA.rope; if (!r || r.place !== PLACE || !matches(r.if)) return;
  const X = Math.round(pl.px - cx) + 8, Y = Math.round(pl.py - cy) + 10;
  for (let i = 0; i < 20; i++){ const a = i / 20 * Math.PI * 2; R(b, Math.round(X + Math.cos(a) * 6), Math.round(Y + Math.sin(a) * 2), 1, 1, i % 3 ? '#B8925A' : '#7A5A32'); }
  const n = NPCS.find(c => c.id === r.by); if (!n) return;
  const k = n.mv ? clamp((now - n.mv.t0) / n.mv.dur, 0, 1) : 1, nx = ((n.mv ? n.mv.fx + (n.x - n.mv.fx) * k : n.x) * T) - cx + 8, ny = ((n.mv ? n.mv.fy + (n.y - n.mv.fy) * k : n.y) * T) - cy + 10;
  const steps = Math.max(4, Math.round(Math.hypot(nx - X, ny - Y) / 2));
  for (let i = 1; i < steps; i++){ const f = i / steps; R(b, Math.round(X + (nx - X) * f), Math.round(Y + (ny - Y) * f + Math.sin(f * Math.PI) * 3), 1, 1, '#A8824A'); }
}
// Something glinting where there's something to find, while the story says (the area's glimmers: {at, if}), such as the
// jade on the little island in the meadow's pond.
function drawGlimmers(cx, cy, now){
  for (const g of AREA.glimmers || []){
    if (placeOf(g.at) !== PLACE || (g.if && !matches(g.if))) continue;
    const t = (now + g.at[0] * 977) % 1500;
    if (t < 700) glint(g.at[0] * T - cx + 8, g.at[1] * T - cy + 9, Math.sin(t / 700 * Math.PI));
  }
}
function drawHomeThings(cx, cy, sh, now){
  drawDream(cx, cy, sh, now);
  drawGlimmers(cx, cy, now);
  drawRope(cx, cy, now);
  drawRolling(cx, cy, now);
  drawDrops(cx, cy, now);
  drawStaffOut(cx, cy, now);
}
// The staff lying across the meadow's pond, a bridge to the little island in it (the bridge's two squares: the island's end,
// L, and the shore's, R), the water under it, a gold band at each end.
function staffBridge(g, X, Y, x, y, end){
  waterBase(g, X, Y, x, y);
  R(g, X, Y + 11, T, 1, '#2C6B9E');                                          // its shadow on the water
  R(g, X, Y + 6, T, 4, '#5A606A'); R(g, X, Y + 6, T, 1, '#8A929C'); R(g, X, Y + 9, T, 1, '#30343A');
  if (end === 'L') R(g, X, Y + 5, 3, 6, '#E2B23A'); else R(g, X + 13, Y + 5, 3, 6, '#E2B23A');
}
Object.assign(LOOKS, {staffBridgeL:(g, X, Y, x, y) => staffBridge(g, X, Y, x, y, 'L'), staffBridgeR:(g, X, Y, x, y) => staffBridge(g, X, Y, x, y, 'R')});
WATERY.push('staffBridgeL', 'staffBridgeR');
// The troop's planks laid across beside it (Chapter 6, after the owner's review: your staff was a bridge for good, and in your
// ear too): planks across the water, your staff still lying on them (L and R, its ends) till you call it back.
function plankStaff(g, X, Y, x, y, end){
  LOOKS.bridge(g, X, Y, x, y);
  R(g, X, Y + 6, T, 3, '#5A606A'); R(g, X, Y + 6, T, 1, '#8A929C'); R(g, X, Y + 8, T, 1, '#30343A');
  if (end === 'L') R(g, X, Y + 5, 3, 5, '#E2B23A'); else R(g, X + 13, Y + 5, 3, 5, '#E2B23A');
}
Object.assign(LOOKS, {plankStaffL:(g, X, Y, x, y) => plankStaff(g, X, Y, x, y, 'L'), plankStaffR:(g, X, Y, x, y) => plankStaff(g, X, Y, x, y, 'R')});
WATERY.push('plankStaffL', 'plankStaffR');
// A thin crack in the Water Curtain Cave's wall, low down, where a little monkey's pearl has rolled
LOOKS.caveCrack = (g, X, Y, x, y) => {
  caveWall(g, X, Y, x, y);
  for (const [px, py] of [[8, 1], [7, 3], [9, 5], [8, 7], [10, 9], [9, 11]]){ R(g, X + px, Y + py, 1, 2, '#0E0C0A'); R(g, X + px + 1, Y + py, 1, 1, '#5A5248'); }
};

/* ---- the dream: the underworld ---- */
// A misty road of pale stone, lamps glowing beside it, up to a dim hall where the ten kings sit behind their long table;
// all round, the dark mist of a dream. Over it all a violet dusk, the lamps' light glowing through it (drawDream: a place
// that's a dream).
function dreamFloor(g, X, Y, x, y){
  R(g, X, Y, T, T, (x + y) % 2 ? '#3A3550' : '#3F3A57'); R(g, X, Y, T, 1, '#2C283E'); R(g, X, Y, 1, T, '#2C283E');
  if (rnd(x, y, 970) < .25) R(g, X + 3 + Math.floor(rnd(x, y, 971) * 9), Y + 4 + Math.floor(rnd(x, y, 972) * 8), 3, 1, '#4A4566');
}
function dreamRoad(g, X, Y, x, y){
  R(g, X, Y, T, T, '#7C7892');
  for (const [ox, oy] of [[0, 0], [8, 0], [0, 8], [8, 8]]){ R(g, X + ox, Y + oy, 8, 8, (x * 2 + ox / 8 + y * 3 + oy / 8) % 3 ? '#8A86A0' : '#827E98'); R(g, X + ox, Y + oy + 7, 8, 1, '#615D78'); R(g, X + ox + 7, Y + oy, 1, 8, '#615D78'); }
}
function dreamVoid(g, X, Y, x, y){
  R(g, X, Y, T, T, '#1C1830');
  for (let i = 0; i < 3; i++) if (rnd(x, y, 980 + i) < .5) R(g, X + Math.floor(rnd(x, y, 983 + i) * 12), Y + Math.floor(rnd(x, y, 986 + i) * 14), 4 + Math.floor(rnd(x, y, 989 + i) * 4), 1, '#2A2544');
}
function dreamWall(g, X, Y, x, y){
  R(g, X, Y, T, T, '#2A2638');
  for (let r = 0; r < 4; r++){ R(g, X, Y + r * 4 + 3, T, 1, '#1E1B2A'); R(g, X + (r % 2 ? 4 : 11), Y + r * 4, 1, 3, '#1E1B2A'); }
  R(g, X, Y, T, 1, '#3E3A52');
}
Object.assign(LOOKS, {dreamFloor, dreamRoad, dreamVoid, dreamWall, dreamLamp:dreamRoad, kingTable:dreamFloor});
// a stone lamp beside the road, its little window lit (its light glows over the dream's dusk: drawDream)
OBJECT_ART.dreamLamp = (g, o) => {
  const X = o.x * T, Y = o.y * T;
  groundShadow(g, X + 8, Y + 14, 5, 2);
  R(g, X + 4, Y + 11, 8, 4, '#5A566A'); R(g, X + 4, Y + 11, 8, 1, '#7A768E');                                     // its base
  R(g, X + 6, Y + 2, 4, 9, '#5A566A'); R(g, X + 6, Y + 2, 1, 9, '#7A768E');                                       // its post
  R(g, X + 3, Y - 6, 10, 8, '#4A4660'); R(g, X + 5, Y - 4, 6, 4, '#FFD27A'); R(g, X + 6, Y - 3, 4, 2, '#FFF2C0');   // its lamp, lit
  R(g, X + 2, Y - 8, 12, 2, '#3A3650'); R(g, X + 5, Y - 10, 6, 2, '#3A3650');                                     // its little roof
};
// the ten kings' long table, dark red lacquer, the book of names lying shut on it, bound with string, and a brush beside it
OBJECT_ART.kingTable = (g, o) => {
  const X = o.x * T, Y = o.y * T, W = o.w * T;
  groundShadow(g, X + W / 2, Y + 15, Math.round(W * .45), 2);
  R(g, X + 1, Y + 3, W - 2, 6, '#7A2A22'); R(g, X + 1, Y + 3, W - 2, 1, '#A84A3A'); R(g, X + 1, Y + 8, W - 2, 1, '#4A1812');   // its top
  for (const lx of [X + 2, X + W - 5]) R(g, lx, Y + 9, 3, 6, '#5A1E18');                                                       // its legs
  const bx = X + Math.round(W / 2) - 8;
  R(g, bx, Y - 1, 16, 6, '#2E3E6A'); R(g, bx, Y - 1, 16, 1, '#4A5C8E'); R(g, bx + 1, Y + 4, 15, 1, '#E8DCC0');                   // the book, shut: its blue cover, its pages' edge
  for (const sx of [bx + 2, bx + 6]) R(g, sx, Y - 1, 1, 6, '#E8DCC0');                                                         // its binding string
  R(g, bx + 20, Y + 2, 6, 1, '#6A4A2A'); R(g, bx + 26, Y + 1, 2, 3, '#1A1210');                                                // a brush
};
BLOCK_OBJECTS.push('kingTable');
// The hall's own things (Chapter 6, after the owner's review: for the ten kings' I spy): its lamps, as the road's (灯); its
// pillars, dark stone, a red band near the top and a gold capital, standing taller than their square (柱子); and its
// doors, red, studded with gold, standing open against the wall either side of the way in (门).
Object.assign(LOOKS, {hallLamp:dreamFloor, hallPillar:dreamFloor, hallDoor:(g, X, Y, x, y) => {
  dreamWall(g, X, Y, x, y);
  R(g, X + 3, Y + 1, 10, 15, '#2A1210'); R(g, X + 4, Y + 2, 8, 14, '#8E2A22'); R(g, X + 4, Y + 2, 2, 14, '#B04034'); R(g, X + 11, Y + 2, 1, 14, '#5A1814');   // a door, open, its red planks
  for (const dy of [4, 8, 12]) for (const dx of [6, 9]) R(g, X + dx, Y + dy, 1, 1, '#E2B23A');                                                  // its gold studs
  R(g, X + 2, Y + 15, 12, 1, '#1E1B2A');
}});
OBJECT_ART.hallLamp = OBJECT_ART.dreamLamp;
OBJECT_ART.hallPillar = (g, o) => {
  const X = o.x * T, Y = o.y * T;
  groundShadow(g, X + 8, Y + 14, 6, 2);
  R(g, X + 3, Y + 13, 10, 3, '#4A4660'); R(g, X + 3, Y + 13, 10, 1, '#6A667E');                 // its foot
  R(g, X + 4, Y - 18, 8, 31, '#3E3A52'); R(g, X + 4, Y - 18, 2, 31, '#56526C'); R(g, X + 11, Y - 18, 1, 31, '#2A2638');   // the stone
  R(g, X + 4, Y - 12, 8, 2, '#8E2A22'); R(g, X + 4, Y - 12, 8, 1, '#B04034');                   // a red band
  R(g, X + 2, Y - 21, 12, 3, '#C8A04A'); R(g, X + 2, Y - 21, 12, 1, '#F2D27A');                 // its gold capital
};

function drawDream(cx, cy, sh, now){
  if (!PLACES[PLACE].dream) return;
  const W = VW * T;
  b.globalAlpha = .2; R(b, 0, 0, W, sh, '#3A2A6A'); b.globalAlpha = 1;   // a violet dusk over everything
  b.save(); b.globalCompositeOperation = 'screen';
  const x0 = Math.max(0, Math.floor(cx / T) - 2), x1 = Math.min(COLS - 1, Math.ceil((cx + W) / T) + 2), y0 = Math.max(0, Math.floor(cy / T) - 2), y1 = Math.min(ROWS - 1, Math.ceil((cy + sh) / T) + 2);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++){
    if (tileAt(x, y).look !== 'dreamLamp' && tileAt(x, y).look !== 'hallLamp') continue;
    const X = x * T + 8 - cx, Y = y * T - 2 - cy, k = .82 + Math.sin(now / 300 + x * 1.7 + y) * .12, r = 26;
    const gl = b.createRadialGradient(X, Y, 1, X, Y, r); gl.addColorStop(0, `rgba(255,214,130,${.5 * k})`); gl.addColorStop(1, 'rgba(255,214,130,0)');
    b.fillStyle = gl; b.fillRect(X - r, Y - r, r * 2, r * 2);
  }
  b.restore();
}

/* ---- the book of names ---- */
// The book of names (the book step: one of the area's books), a card (decided 16 November 2026, the Area 3 plan: gentle,
// with no word for death): everyone's name in it, written with a brush, three to a row (each with its pinyin; its English
// once crossed out). Find yours and cross it out (you: the one that's yours), a stroke of the brush through it; then the
// troop's, every name with 猴 in it (monkey), one by one, till they're all crossed out. One that isn't shakes, and the card
// says why. A, with nothing chosen, shows the first name and never chooses it for you (its names are a question's answers).
function bookCard(id){
  const bk = AREA.books[id], names = bk.names, crossed = new Set();
  return new Promise(res => {
    let phase = 0;
    openCard(`<p class="label">${esc(fill(bk.label))}</p><p class="note bookask">${esc(fill(bk.find))}</p>
      <div class="opts bookpage" data-nav>${names.map((n, i) => `<button class="opt bname" data-i="${i}" data-label="Cross out"><span class="bz">${n.zh}</span>${S.pinyin ? `<span class="cap">${esc(n.py)}</span>` : ''}<span class="ben">${esc(n.en)}</span></button>`).join('')}</div>
      <div class="actions"><button class="btn primary" data-a="ok" hidden>Done</button></div>`);
    const ask = sheet.querySelector('.bookask'), ok = sheet.querySelector('[data-a=ok]');
    const monkeysLeft = () => names.filter((n, i) => n.monkey && !crossed.has(i)).length;
    sheet.querySelectorAll('.bname').forEach(btn => btn.onclick = () => {
      const i = +btn.dataset.i, n = names[i];
      if (crossed.has(i) || !ok.hidden) return;
      if (!(phase === 0 ? n.you : n.monkey)){
        SFX.wrong(); btn.classList.remove('nope'); void btn.offsetWidth; btn.classList.add('nope');
        ask.textContent = fill(phase === 0 ? bk.notYours : bk.noMonkey); return;
      }
      crossed.add(i); btn.classList.add('crossed'); SFX.sweep();
      if (phase === 0){ phase = 1; ask.textContent = fill(bk.troop); }
      else if (monkeysLeft()) ask.textContent = fill(bk.more.replace('{n}', monkeysLeft()));
      else { ask.textContent = fill(bk.done); ok.hidden = false; }
    });
    on('[data-a=ok]', () => { closeCard(); res(); });
  });
}
STEPS.book = async s => { await bookCard(s.book); };

/* ---- Chapter 6's scenes ---- */
// Drawn the way the game's other scenes are (the feast, the party, becoming king): on a canvas half the screen's size, with
// the map's own pictures (the golden grass of home in autumn, the cave's floor and stone beds, the dream's road and lamps)
// and everyone as they look on the map, then doubled, so they're all twice the size they are on the map (decided 16
// November 2026, after the owner's review: they'd been drawn at the map's size, in shapes of their own). The captions cover
// the bottom, so it all happens above them. Each scene waits just before its next caption until you press Next, so each
// moment looks right there.
const ch6Cv = document.createElement('canvas'), ch6Cv2 = document.createElement('canvas');
function halfCanvas(cv = ch6Cv){ cv.width = 120; cv.height = 80; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; return g; }
const showHalf = () => b.drawImage(ch6Cv, 0, 0, 120, 80, 0, 0, VW * T, VH * T);
// Home in autumn, as Chapter 4 left it: a pale autumn sky, Flower Fruit Mountain's peaks far off, the golden grass (the
// party's, js/havoc.js); its horizon, how far down the grass begins
function homeInAutumn(g, horizon){
  for (let y = 0; y < horizon; y++) R(g, 0, y, 120, 1, mix('#8FC4EA', '#F2E2B8', y / horizon));
  for (let x = 0; x < 120; x++){ const h = Math.round(horizon - 5 - Math.abs(Math.sin(x / 14 + 1)) * 8 - Math.sin(x / 5) * 1.2); R(g, x, h, 1, horizon - h, x % 11 ? '#A9BDC9' : '#9AB0BC'); }
  for (let y = horizon; y < 80; y += T) for (let x = 0; x < 120; x += T) LOOKS.grass(g, x, y, x / T, y / T + 50);
  g.fillStyle = 'rgba(214,158,64,.38)'; g.fillRect(0, horizon, 120, 80 - horizon);   // (the grass gold, in autumn)
}
// A cloud on the half-size canvas: white puffs on a flat bottom, a little blue-grey under it (as the opening's, cloudPuff)
function cloudOn(g, cx, cy, s){
  const r = k => Math.max(1, Math.round(k * s));
  disc(g, cx - r(7), cy, r(4), '#FFFFFF'); disc(g, cx, cy - r(2), r(6), '#FFFFFF'); disc(g, cx + r(7), cy, r(4), '#FFFFFF');
  R(g, cx - r(11), cy, r(22), r(4), '#FFFFFF'); R(g, cx - r(10), cy + r(4), r(20), 1, '#C9DFEC');
}
// Your staff, upright, from its foot (bottom) up (top), so wide (w), glowing as it changes (glow); a gold band at each end
function staffUpright(g, x, top, bottom, w, glow){
  if (glow){ g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .5; R(g, x - 2, top - 2, w + 4, bottom - top + 4, '#FFD878'); g.restore(); }
  R(g, x, top, w, bottom - top, '#5A606A'); R(g, x, top, 1, bottom - top, '#8A929C'); if (w > 2) R(g, x + w - 1, top, 1, bottom - top, '#30343A');
  const rim = w > 1 ? 1 : 0, bh = w > 1 ? 2 : 1;
  R(g, x - rim, bottom - bh, w + 2 * rim, bh, '#E2B23A'); if (top > -bh) R(g, x - rim, top, w + 2 * rim, bh, '#E2B23A');
}
const bang = (g, x, y) => { R(g, x, y, 1, 3, '#E2343A'); R(g, x, y + 4, 1, 1, '#E2343A'); };   // a little red !
// The staff up to the sky, at the home ground (staffSky; its captions at 0, 4.4 and 7.6): you in the middle of the troop,
// holding it up, and it grows, up and up out of sight, the troop jumping and gasping (!); then you look up after it: blue
// sky, clouds rushing down past it, birds scattering, the sun glinting off its top. Back on the ground it comes down,
// shorter and shorter, then thinner, a needle, and you tuck it into your ear, where it twinkles.
function drawStaffSky(t, now){
  const g = halfCanvas(), blink = now % 3200 < 130;
  if (t >= 2.8 && t < 4.6){   // looking up after it
    const k = (t - 2.8) / 1.8;
    for (let y = 0; y < 80; y++) R(g, 0, y, 120, 1, mix('#2E62B8', '#A8D4F2', y / 80));
    for (let i = 0; i < 9; i++){ const x = Math.round(rnd(i, 1, 940) * 130) - 6, y = Math.round((rnd(i, 2, 941) * 110 + k * 170) % 110) - 15; cloudOn(g, x, y, .7 + rnd(i, 3, 942) * .5); }   // clouds rushing down past it
    staffUpright(g, 58, -4, 84, 4, true);
    for (let i = 0; i < 4; i++){ const y = Math.round((now / 6 + i * 22) % 88) - 4; g.globalAlpha = .7; R(g, 57, 84 - y, 6, 1, '#FFF2B0'); g.globalAlpha = 1; }   // light running up it
    for (let i = 0; i < 5; i++){ const side = i % 2 ? 1 : -1, d = (k * 1.4 + i * .2) % 1, x = Math.round(60 + side * (8 + d * 50)), y = Math.round(20 + i * 9 - d * 14), f = Math.floor(now / 120 + i) % 2;   // birds scattering
      R(g, x - 2, y + f, 2, 1, '#2A2A34'); R(g, x, y + 1 - f, 1, 1, '#2A2A34'); R(g, x + 1, y + f, 2, 1, '#2A2A34'); }
    if (k > .6){ g.globalAlpha = (k - .6) / .4; disc(g, 60, 2, 6, '#FFF6C8'); disc(g, 60, 2, 3, '#FFFFFF'); g.globalAlpha = 1; }   // the sun glinting off its top
    showHalf(); return;
  }
  homeInAutumn(g, 28);
  const grow = clamp((t - .5) / 2, 0, 1), down = clamp((t - 4.6) / 1.1, 0, 1), thin = clamp((t - 5.8) / .6, 0, 1), tuck = clamp((t - 6.6) / .7, 0, 1);
  const wow = grow > .3 && down < .6;   // (the troop amazed)
  [['troopA', 30, 18, 'right'], ['troopB', 74, 18, 'left'], ['elder', 14, 28, 'right'], ['hungry', 90, 28, 'left'], ['big', 22, 40, 'right'], ['mother', 82, 40, 'left']].forEach(([id, x, y, d], i) => {
    const hop = wow ? Math.round(Math.abs(Math.sin(now / 160 + i * 1.3)) * 2) : 0;
    g.drawImage(monkeySprite(id, d, blink && i % 2 === 0), x, y - hop);
    if (wow && i % 2 === 0) bang(g, x + 7, y - 6 - hop);
  });
  const X = 52, Y = 32;   // you
  g.drawImage(monkeySprite('player', 'down', blink, 0, true), X, Y); drawPlumes(g, X, Y, 'down');
  for (const [id, x] of [['baby1', 36], ['baby3', 70]]) g.drawImage(monkeySprite(id, 'up', false), x, 42, SMALL_PX, SMALL_PX);   // the little ones in front, staring up
  if (tuck < 1){
    const len = thin > 0 ? Math.round(12 - thin * 9) : Math.round(12 + grow * 50 - down * 50), w = thin > 0 ? (thin < .5 ? 2 : 1) : grow > .5 && down < .5 ? 3 : 2;
    const sx = Math.round(X + 7 + tuck * 4), foot = Math.round(Y + 11 - tuck * 7);
    staffUpright(g, sx, foot - len, foot, w, (grow > 0 && grow < 1) || (down > 0 && down < 1) || (thin > 0 && thin < 1) || (tuck > 0));
  }
  showHalf();
  fallOver(FALLING.autumn, 5, 0, 0, VH * T, now);
  if (tuck >= 1){ const k = (now % 1400) / 1400; glint((X + 13) * 2, (Y + 4) * 2, Math.sin(k * Math.PI)); }   // (in your ear: a twinkle now and then)
}
// The troop's feast for your staff is the party's picture (staffFeast's art: js/havoc.js).
// Falling asleep after the feast (dreamIn; its captions at 0 and 3.4): the Water Curtain Cave at night, the troop asleep in
// the stone beds and you in yours, Zs drifting up; mist swirls in, and you're somewhere else, on a misty road of pale stone,
// lamps glowing along it in the dusk, up to a dark hall, and two officers coming down it towards you with a rope.
function caveAtNight(g, now){
  for (let y = 16; y < 80; y += T) for (let x = 0; x < 120; x += T) caveFloor(g, x, y, x / T, y / T + 20);
  for (let x = 0; x < 120; x += T) caveWall(g, x, 0, x / T, 0);
  const beds = [[4, 'elder'], [28, 'troopA'], [52, null], [76, 'hungry'], [100, 'big']];
  for (const [x, kind] of beds){
    stoneBed(g, x, 16, x / T, 1);
    if (kind){ g.drawImage(asleepSpriteOf(kind), x + 2, 15); R(g, x + 1, 22, 14, 7, '#2E2A26'); R(g, x + 2, 22, 12, 6, '#8A6A9E'); R(g, x + 2, 22, 12, 1, '#B49AC4'); R(g, x + 2, 27, 12, 1, '#5E4A70'); }
    else { g.drawImage(asleepSprite(), x + 2, 15); R(g, x + 1, 22, 14, 7, '#2E2A26'); R(g, x + 2, 22, 12, 6, '#5E9A3E'); R(g, x + 2, 22, 12, 1, '#8CC45A'); R(g, x + 2, 27, 12, 1, '#3F6E2A'); }   // you, under your leaf blanket
  }
  g.globalAlpha = .5; R(g, 0, 0, 120, 80, '#0B1024'); g.globalAlpha = 1;   // night
  for (let i = 0; i < 3; i++){ const z = (now / 1300 + i / 3) % 1, zx = Math.round(62 + z * 8), zy = Math.round(12 - z * 12), s = 2 + Math.round(z * 2);   // Zs, from you
    g.globalAlpha = 1 - z; R(g, zx, zy, s, 1, '#CFE8F7'); R(g, zx, zy + s - 1, s, 1, '#CFE8F7'); for (let j = 1; j < s - 1; j++) R(g, zx + s - 1 - j, zy + j, 1, 1, '#CFE8F7'); }
  g.globalAlpha = 1;
}
function dreamRoadView(g, t, now){
  for (let y = 0; y < 80; y += T) for (let x = 0; x < 120; x += T) dreamVoid(g, x, y, x / T + 3, y / T);
  for (let x = 0; x < 120; x += T) dreamWall(g, x, 0, x / T, 0);
  R(g, 48, 4, 24, 12, '#120E1C'); R(g, 50, 6, 20, 10, '#3A2A4A');   // the hall's doorway, at the top of the road
  for (let y = 16; y < 80; y += T) for (const x of [44, 60]) dreamRoad(g, x, y, x / T, y / T);
  for (const [x, y] of [[28, 26], [76, 26], [28, 50], [76, 50]]){ g.save(); g.translate(x - 2 * T, y - 2 * T); OBJECT_ART.dreamLamp(g, {x:2, y:2}); g.restore(); }   // lamps along it
  const k = clamp((t - 3) / 1.6, 0, 1), oy = Math.round(4 + k * 18), f = Math.floor(now / 200) % 2;   // the two officers, coming down the road
  for (const x of [46, 58]) g.drawImage(mapSprite('差人'), x, oy + (k < 1 ? f : 0));
  g.drawImage(monkeySprite('player', 'up', false, 0, true), 52, 50); drawPlumes(g, 52, 50, 'up');   // you, looking up the road
  g.globalAlpha = .22; R(g, 0, 0, 120, 80, '#3A2A6A'); g.globalAlpha = 1;   // the dream's violet dusk
  g.save(); g.globalCompositeOperation = 'screen';
  for (const [x, y] of [[28, 26], [76, 26], [28, 50], [76, 50]]){ const gl = g.createRadialGradient(x + 8, y - 2, 1, x + 8, y - 2, 18); gl.addColorStop(0, 'rgba(255,214,130,.55)'); gl.addColorStop(1, 'rgba(255,214,130,0)'); g.fillStyle = gl; g.fillRect(x - 10, y - 20, 36, 36); }
  g.restore();
}
function drawDreamIn(t, now){
  const g = halfCanvas(), k = clamp((t - 2.4) / 1.2, 0, 1);   // (the dream coming in)
  caveAtNight(g, now);
  if (k > 0){ const g2 = halfCanvas(ch6Cv2); dreamRoadView(g2, t, now); g.globalAlpha = k; g.drawImage(ch6Cv2, 0, 0); g.globalAlpha = 1; }
  showHalf();
  const m = Math.sin(clamp((t - 1.8) / 2.4, 0, 1) * Math.PI);   // mist swirling in, then thinning away
  if (m > 0){ const W = VW * T, H = VH * T;
    for (let i = 0; i < 14; i++){ const x = Math.round((rnd(i, 1, 990) * (W + 60) + now / (24 + i * 5)) % (W + 60)) - 30, y = Math.round(rnd(i, 2, 991) * H);
      b.globalAlpha = .6 * m; oval(b, x, y, 22 + (i % 3) * 8, 6, i % 2 ? '#E8E4F4' : '#D8D0EC'); }
    b.globalAlpha = 1; }
}
// Trouble in Heaven (heaven; its captions at 0, 3.2 and 6.4): the Jade Emperor on his throne in his golden hall, high above
// the clouds; the Dragon King comes up out of the clouds to complain about you, then one of the ten kings; the Jade Emperor
// is cross (!); and the Great White Planet, with his long white beard, comes forward with an idea.
function drawTroubleInHeaven(t, now){
  const g = halfCanvas(), gold = '#E2B23A', goldL = '#F8DC80', red = '#B8322A', redD = '#7E1F18';
  for (let y = 0; y < 80; y++) R(g, 0, y, 120, 1, mix('#FBEBC0', '#F2CCB8', y / 80));   // the light of Heaven
  R(g, 20, 4, 80, 40, '#8E2A22'); for (let x = 22; x < 100; x += 6) R(g, x, 4, 1, 40, '#B07A2A'); for (let y = 8; y < 44; y += 6) R(g, 20, y, 80, 1, '#B07A2A');   // the hall's back wall, its red lattice
  for (let y = 0; y < 4; y++){ const w = 104 - (3 - y) * 4; R(g, 60 - w / 2, y, w, 1, y % 2 ? gold : goldL); }   // its golden eaves
  for (const px of [10, 104]){ R(g, px, 4, 6, 50, red); R(g, px, 4, 2, 50, '#E05A48'); R(g, px + 5, 4, 1, 50, redD); R(g, px - 1, 10, 8, 2, gold); R(g, px - 1, 44, 8, 2, gold); }   // red pillars, gold bands
  R(g, 42, 6, 36, 30, gold); R(g, 44, 8, 32, 26, goldL); disc(g, 60, 18, 8, '#FFF4C8'); disc(g, 60, 18, 5, '#FFFBE8');   // the golden screen behind the throne
  R(g, 46, 30, 28, 6, red); R(g, 46, 30, 28, 1, '#E05A48'); R(g, 38, 36, 44, 3, gold); R(g, 34, 39, 52, 3, '#C8962A');   // the throne's seat and its steps
  g.drawImage(mapSprite('玉皇大帝'), 49, 14);
  if (t > 2.2 && t < 3.4) bang(g, 73, 10);   // (cross!)
  for (let i = 0; i < 8; i++) cloudOn(g, i * 17 - 4, 54 + (i % 2) * 3, 1.2);   // the clouds, all round below
  const rise = (t0, t1) => 1 - (1 - clamp((t - t0) / (t1 - t0), 0, 1)) ** 3;
  const dy = Math.round(78 - rise(0, 2.2) * 46 + Math.sin(now / 400));   // the Dragon King, up out of the clouds on the left
  g.drawImage(mapSprite('龙王'), 14, dy); cloudOn(g, 25, dy + 22, .85);
  if (t > 3){ const ky = Math.round(78 - rise(3, 5.2) * 46 + Math.sin(now / 450)); g.drawImage(mapSprite('十王'), 86, ky); cloudOn(g, 97, ky + 22, .85); }   // then one of the ten kings, on the right
  if (t > 6){ const k = rise(6, 7), px = Math.round(76 - k * 12);   // the Great White Planet, coming forward
    g.globalAlpha = clamp((t - 6) / .5, 0, 1); g.drawImage(mapSprite('太白金星'), px, 30); cloudOn(g, px + 11, 52, .7); g.globalAlpha = 1;
    if (t > 6.9){ const tw = Math.floor(now / 200) % 2; R(g, px + 11, 24 - tw, 1, 3, '#FFF6B0'); R(g, px + 10, 25 - tw, 3, 1, '#FFF6B0'); }   // (an idea!)
  }
  showHalf();
}
// The Great White Planet coming down on his cloud to the home ground (planetCloud; its captions at 0 and 3.8), a golden light
// round him, the troop and you looking up at him, the leaves falling.
function drawPlanetCloud(t, now){
  const g = halfCanvas();
  homeInAutumn(g, 30);
  const k = clamp(t / 3.4, 0, 1), e = 1 - (1 - k) ** 3, px = 49, py = Math.round(-26 + e * 36 + (k < 1 ? Math.sin(now / 300) : Math.sin(now / 700) * .6));
  g.save(); g.globalCompositeOperation = 'screen';
  const gl = g.createRadialGradient(px + 11, py + 11, 2, px + 11, py + 11, 28); gl.addColorStop(0, 'rgba(255,240,190,.6)'); gl.addColorStop(1, 'rgba(255,240,190,0)');
  g.fillStyle = gl; g.fillRect(px - 20, py - 18, 62, 58); g.restore();
  g.drawImage(mapSprite('太白金星'), px, py); cloudOn(g, px + 11, py + 22, 1);   // him, on his cloud
  const look = k > .5;
  [['elder', 22, 40], ['troopA', 34, 46], ['hungry', 72, 46], ['big', 84, 40]].forEach(([id, x, y], i) => { g.drawImage(monkeySprite(id, 'up', false), x, y); if (look && i % 2) bang(g, x + 7, y - 6); });
  for (const [id, x] of [['baby1', 14], ['baby3', 96]]) g.drawImage(monkeySprite(id, 'up', false), x, 50, SMALL_PX, SMALL_PX);
  g.drawImage(monkeySprite('player', 'up', false, 0, true), 52, 44); drawPlumes(g, 52, 44, 'up');
  showHalf();
  fallOver(FALLING.autumn, 5, 0, 0, VH * T, now);
}
Object.assign(SCENE_ART, {staffSky: drawStaffSky, dreamIn: drawDreamIn, heaven: drawTroubleInHeaven, planetCloud: drawPlanetCloud});
