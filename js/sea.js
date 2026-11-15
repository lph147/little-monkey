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
STIR_LOOKS.tallSeaweed = ['#D8C79A', '#2E6A2E', '#8FCB6A']; STIR_DRAWS.tallSeaweed = tallSeaweed; TALL_LOOKS.push('tallSeaweed');   // (parting round you, and what flies up: js/draw.js)
const UNLIT = new Set(['deepSea']);   // where the light doesn't ripple: down in the deep

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
  b.globalAlpha = .09; b.fillStyle = '#E6FBFF';   // shafts of light, drifting a little as you move
  for (const [sx, w] of SEA_BEAMS){ const x = ((sx - cx * .25) % (W + 60) + W + 60) % (W + 60) - 30; b.beginPath(); b.moveTo(x, -2); b.lineTo(x + w, -2); b.lineTo(x + w + 46, H + 2); b.lineTo(x + 46, H + 2); b.closePath(); b.fill(); }
  b.restore();
  // what comes in colours, such as the starfish on the sand, drawn again over the water's blue, so each is the colour it's
  // called (decided 15 November 2026, after looking at it: under the haze the yellow one was green, the red one maroon)
  for (const o of outHere()) if (o.colour && o.a.lies) drawLying(o.a, o.x, o.y, o.x * T - cx, o.y * T - cy, now, o.colour);
  if (foe && foe.colour) drawFoe(cx, cy, now);
  drawJellies(cx, cy, now); drawInk(cx, cy, now);   // (jellyfish drifting, glowing at night; the octopus's ink)
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
