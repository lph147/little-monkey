// Drawing each frame: the world, characters, sparkles and task arrows, and the opening scene.

/* ---- per-frame drawing ---- */
let bigSparkles = false;   // a twinkle that grows bigger, while the area's bigSparkles matches, such as while you learn your first words (set each frame)
function sparkle(X, Y, now, ph){
  const s = (Math.sin(now/260 + ph) + 1) / 2;
  if (bigSparkles){   // a twinkle (decided 24 October 2026: twice as big and never out was too much): out for over half the
    if (s < .55) return;   // time, it grows to arms of 3, with a faint glow, just at its brightest
    const k = (s - .55) / .45, n = k > .66 ? 3 : k > .33 ? 2 : 1;
    if (n === 3) R(b, X-1, Y-1, 3, 3, 'rgba(255,226,122,.3)');
    for (let i = 1; i <= n; i++){ R(b, X-i, Y, 1, 1, '#FFE27A'); R(b, X+i, Y, 1, 1, '#FFE27A'); R(b, X, Y-i, 1, 1, '#FFE27A'); R(b, X, Y+i, 1, 1, '#FFE27A'); }
    R(b, X, Y, 1, 1, '#FFFFFF');
    return;
  }
  if (s < .25) return;
  R(b, X, Y, 1, 1, '#FFFFFF');
  R(b, X-1, Y, 1, 1, '#FFE27A'); R(b, X+1, Y, 1, 1, '#FFE27A'); R(b, X, Y-1, 1, 1, '#FFE27A'); R(b, X, Y+1, 1, 1, '#FFE27A');
  if (s > .7){ R(b, X-2, Y, 1, 1, '#FFE27A'); R(b, X+2, Y, 1, 1, '#FFE27A'); R(b, X, Y-2, 1, 1, '#FFE27A'); R(b, X, Y+2, 1, 1, '#FFE27A'); }
}
function bubble(X, Y, ch){
  R(b, X, Y, 7, 9, '#1E2B26'); R(b, X+1, Y+1, 5, 7, '#FFFFFF'); R(b, X+3, Y+9, 1, 1, '#1E2B26');
  if (ch === '!'){ R(b, X+3, Y+2, 1, 3, '#C0392B'); R(b, X+3, Y+6, 1, 1, '#C0392B'); }
  else { R(b, X+2, Y+2, 3, 1, '#2E7A57'); R(b, X+4, Y+3, 1, 1, '#2E7A57'); R(b, X+3, Y+4, 1, 1, '#2E7A57'); R(b, X+3, Y+6, 1, 1, '#2E7A57'); }
}
function animTile(x, y, X, Y, now){
  const look = tileAt(x, y).look;
  if (look === 'water'){
    for (let k = 0; k < 2; k++){
      const ph = rnd(x, y, k+200) * 6.28, s = Math.sin(now/500 + ph);
      if (s > .55){ const px = 2 + Math.floor(rnd(x,y,k+210)*10), py = 3 + Math.floor(rnd(x,y,k+220)*10); R(b, X+px, Y+py, 3, 1, '#BFE8FA'); }
    }
    if (tileAt(x, y-1).look === 'waterfall'){ for (let i = 0; i < 6; i++){ const px = Math.floor(rnd(x, i, Math.floor(now/120))*15); R(b, X+px, Y+1+(i%3), 2, 1, '#FFFFFF'); } }
  } else if (look === 'waterfall' || look === 'curtain'){
    R(b, X, Y, T, T, '#8FD0EE');
    for (let i = 0; i < 5; i++){ const xx = X + 1 + i*3, off = (now/18 + i*7) % 22 - 6; R(b, xx, Y + Math.max(0, off), 1, Math.min(7, 16 - Math.max(0, off)), '#FFFFFF'); R(b, xx+1, Y, 1, T, '#B9E4F7'); }
  } else if (look === 'stoneTower') drawTower(X, Y, now);
}
// The little monkeys' tower of stones (towerAt, js/world.js) on its square at X, Y: the stones piled up, a little
// crooked, smaller to the top; swaying before it falls, then tumbling down round it and lying where they fell, till the
// monkeys gather them up to start again. (The stone on its way up is drawn with the monkey carrying it: drawPlaying.)
// Each stone's lean from the middle, how wide it is, and where it lands when the tower falls (from the tower's foot).
const TOWER_LEAN = [0, 1, -1, 1, 0, -1], TOWER_WIDE = [11, 10, 9, 8, 7, 6], TOWER_LANDS = [[-2, 0], [10, 1], [-11, 2], [13, -1], [-14, 1], [5, 2]];
const towerStoneAt = (X, Y, i) => ({x:X + 8 + TOWER_LEAN[i], y:Y + 11 - 4 * i, w:TOWER_WIDE[i]});   // stone i (0 at the bottom) on the tower: its middle, top and width
function towerStone(x, y, w){   // a stone w wide, its middle at x, its top at y: lit on top, darker underneath
  const l = Math.round(x - w / 2);
  R(b, l + 1, y, w - 2, 1, GREY[4]); R(b, l, y + 1, w, 1, GREY[3]); R(b, l, y + 2, w, 1, GREY[2]); R(b, l + 1, y + 3, w - 2, 1, GREY[1]);
  R(b, l + 1, y + 1, 1, 1, GREY[4]);   // (a glint)
}
function drawTower(X, Y, now){
  const t = towerAt(now);
  if (t.phase === 'build' || t.phase === 'wobble'){
    if (t.stones) R(b, X + 3, Y + 15, 10, 1, 'rgba(0,0,0,.2)');   // its shadow
    for (let i = 0; i < t.stones; i++){
      const s = towerStoneAt(X, Y, i), sway = t.phase === 'wobble' ? Math.round(Math.sin(now / 70) * 1.6 * i / (t.h - 1)) : 0;   // (the top sways most)
      towerStone(s.x + sway, s.y, s.w);
    }
    return;
  }
  b.globalAlpha = t.phase === 'rest' ? clamp((1 - t.k) / .25, 0, 1) : 1;   // (gathered up at the end)
  for (let i = 0; i < t.h; i++){
    const s = towerStoneAt(X, Y, i), [dx, dy] = TOWER_LANDS[i];
    const k = t.phase === 'rest' ? 1 : clamp((t.k - (t.h - 1 - i) * .08) / .6, 0, 1);   // (the top ones first)
    const x = s.x + (X + 8 + dx - s.x) * k, y = s.y + (Y + 12 + dy - s.y) * k - Math.sin(k * Math.PI) * (3 + i);
    towerStone(Math.round(x), Math.round(y), s.w);
  }
  b.globalAlpha = 1;
}
// A monkey of the troop at play (PLAYS, js/world.js), at X, Y; or stopped to talk to you, facing you (one in the water stays
// in it).
function drawPlaying(n, X, Y, now){
  const kind = PLAYS[n.id];
  if (kind === 'splash') drawSplasher(n, X, Y, now);
  else if (!playing(n)) drawEntityMonkey(n.kind, X, Y, n.dir, now, Math.floor(now/700 + n.x) % 2, 0, n.x + n.y);
  else if (kind === 'tower') drawTowerBuilder(n, X, Y, now);
  else if (kind === 'dragonflies') drawChaser(n, X, Y, now);
  else if (kind === 'groom') drawGroomer(n, X, Y, now);
}
// Grooming the other one, or being groomed, taking turns: the groomer sits facing its friend, nodding as it picks through
// its fur; the one being groomed sits facing you, eyes shut, enjoying it, its friend's hand moving over its shoulder.
function drawGroomer(n, X, Y, now){
  const friend = NPCS.find(c => c !== n && PLAYS[c.id] === 'groom'), left = !friend || n.x < friend.x;
  if (groomAt(now).who === (left ? 0 : 1)){ drawEntityMonkey(n.kind, X + (left ? 2 : -2), Y, left ? 'right' : 'left', now, Math.round(Math.abs(Math.sin(now / 260))), 0, n.x + n.y); return; }   // (sitting close)
  R(b, X+4, Y+15, 8, 1, 'rgba(0,0,0,.22)'); R(b, X+3, Y+14, 10, 1, 'rgba(0,0,0,.12)');
  b.drawImage(monkeySprite(n.kind, 'down', true), X, Y);
  if (friend && playing(friend)) R(b, X + (left ? 12 : 2) + Math.round(Math.sin(now / 180)), Y + 10 + (Math.sin(now / 260) > 0 ? 1 : 0), 2, 2, (PALS[friend.kind] || PALS.player).s);
}
// Chasing a dragonfly: it leaps up at it now and then, turning to face it, and the dragonfly darts off just out of reach
// (drawn with the others: drawDragonflies).
function drawChaser(n, X, Y, now){
  const bob = Math.round(chaseLeap(now) * 6);
  drawEntityMonkey(n.kind, X, Y, chasedAt(n, now).x < n.x*T + 8 ? 'left' : 'right', now, bob, bob ? 1 : 0, n.x + n.y);
}
// Splashing in the water with the other one: in the water up to its chin, with ripples round it; when it's its turn, it
// rises a little and throws water from its hands over the other, who ducks as it lands.
function drawSplasher(n, X, Y, now){
  const at = playing(n), dir = at ? n.home.facing : n.dir, s = splashAt(now), mine = s.by === (n.home.facing === 'right' ? 0 : 1), other = NPCS.find(c => c !== n && PLAYS[c.id] === 'splash');
  const throwing = at && s.k !== null && mine, ducking = s.k !== null && !mine && s.k > .7;
  const sink = 3 + (ducking ? 2 : 0) - (throwing ? Math.round(Math.sin(s.k * Math.PI) * 2) : 0), line = 13;   // how far down it is; the water's surface
  const ph = (now / 1100 + n.x * .37) % 1, rx = 6 + Math.round(ph * 4);   // a ripple spreading round it
  b.globalAlpha = .8 * (1 - ph); R(b, X + 8 - rx, Y + line, 3, 1, '#BFE8FA'); R(b, X + 6 + rx, Y + line, 3, 1, '#BFE8FA'); b.globalAlpha = 1;
  b.drawImage(monkeySprite(n.kind, dir, (now + (n.x + n.y) * 977) % 3600 < 130), 0, 0, 16, line - sink, X, Y + sink, 16, line - sink);
  R(b, X + 3, Y + line, 10, 1, '#D6F2FF');   // the water round it
  if (!throwing || !other) return;
  const [hx, hy] = SWING_HAND[dir], x0 = X + hx, y0 = Y + sink + hy - 2, x1 = X + (other.x - n.x) * T + 8, y1 = Y + 6;
  for (let j = 0; j < 10; j++){   // the water it throws, in a spray
    const k = clamp(s.k * 1.3 - (j % 5) * .05, 0, 1), sz = j % 2 ? 1 : 2;
    if (k <= 0 || k >= 1) continue;
    R(b, Math.round(x0 + (x1 - x0) * k + (j - 4.5) * 2 * k), Math.round(y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * (6 + (j % 4) * 3)), sz, sz, j % 3 ? '#FFFFFF' : '#BFE8FA');
  }
}
// The dragonflies (the area's, and those the little monkeys chase), little and bright, their wings a flicker.
const DRAGONFLY = [['#E0483A', '#9E2C24'], ['#F2A33A', '#A8641C'], ['#E0483A', '#9E2C24']];   // body, head: red and orange, bright over the water
function dragonfly(X, Y, left, now, i){
  X = Math.round(X); Y = Math.round(Y);
  const [body, head] = DRAGONFLY[i % DRAGONFLY.length], at = dx => X + (left ? -dx : dx);
  b.globalAlpha = .85;   // its four wings, spread out either side, a flicker as they beat
  const beat = Math.floor(now / 40 + i) % 2;
  for (const dy of beat ? [-1, 1] : [-2, -1, 1, 2]) for (const dx of [-2, -1, 0]) if (Math.abs(dy) < 2 || dx !== -1) R(b, at(dx), Y + dy, 1, 1, '#EAF6FF');
  b.globalAlpha = 1;
  for (let dx = -5; dx <= 0; dx++) R(b, at(dx), Y, 1, 1, dx === -5 ? head : body);   // its long body, darker at the tip
  R(b, at(1), Y, 1, 1, head);
}
function drawDragonflies(cx, cy, now){
  (AREA.dragonflies || []).forEach((d, i) => { if (placeOf(d.at) === PLACE){ const a = dragonflyAt(dragonflyBox(d), i + 11, now); dragonfly(a.x - cx, a.y - cy, a.left, now, i + 1); } });
  for (const n of NPCS) if (PLAYS[n.id] === 'dragonflies'){ const a = chasedAt(n, now); dragonfly(a.x - cx, a.y - cy, a.left, now, 0); }
}
// Building the tower of stones, facing it: when it's its turn (or the other one's talking to you), it hops up to put a
// stone on top, the stone going up from its hands; as the tower falls they jump back, and then they jump about laughing.
function drawTowerBuilder(n, X, Y, now){
  const dir = n.home.facing, t = towerAt(now), partner = NPCS.find(c => c !== n && PLAYS[c.id] === 'tower');
  const turn = t.phase === 'build' && t.carried !== null && (t.by === (dir === 'right' ? 0 : 1) || !partner || !playing(partner));
  const bob = turn ? Math.round(Math.sin(t.lift * Math.PI) * 2) : t.phase === 'fall' ? Math.round(Math.sin(t.k * Math.PI) * 3)
    : t.phase === 'rest' && t.k < .7 ? Math.round(Math.abs(Math.sin(t.k * Math.PI * 5)) * 2) : 0;
  drawEntityMonkey(n.kind, X, Y, dir, now, bob, 0, n.x + n.y);
  if (!turn) return;
  const [hx, hy] = SWING_HAND[dir], s = towerStoneAt(X + (dir === 'right' ? T : -T), Y, t.carried), k = t.lift;
  towerStone(Math.round(X + hx + (s.x - X - hx) * k), Math.round(Y - bob + hy + (s.y - Y - hy) * k - Math.sin(k * Math.PI) * 6), s.w);
}
function drawEntityMonkey(kind, X, Y, dir, now, bob, step = 0, seed = 0){
  R(b, X+4, Y+15, 8, 1, 'rgba(0,0,0,.22)'); R(b, X+3, Y+14, 10, 1, 'rgba(0,0,0,.12)');
  const blink = (now + seed*977) % 3600 < 130;
  b.drawImage(monkeySprite(kind, dir, blink, step), X, Y - bob);
}
// A big object's picture (js/art.js), where it stands, with a little shake that settles while it's rustling.
const RUSTLE = 320;   // how long a rustle lasts (ms)
function drawPiece(p, pic, cx, cy, now){
  const X = p.x0 - cx, Y = p.y0 - cy;
  if (X > VW*T || Y > VH*T || X + pic.width < 0 || Y + pic.height < 0) return;
  const t = now - p.rustle, dx = t < RUSTLE ? Math.round(Math.sin(t / 45) * (1 - t / RUSTLE)) : 0;   // a pixel at most
  b.drawImage(pic, X + dx, Y);
}
// Walking through a peach or apple tree's wide branches, into a square right beside it (its leafy squares, js/art.js),
// makes it rustle once, gently, as you reach them, and a couple of leaves fall. Walking behind a tree, into a corner by
// it, out of its branches, turning and standing still don't.
const fallingLeaves = [];
function touchLeaves(now){
  const m = pl.mv;
  if (!m || m.rustled || now - m.t0 < STEP * .35) return;   // once a step, as you reach the leaves
  m.rustled = true;
  const covers = (p, x, y) => p.leafy.some(([a, c]) => a === x && c === y);
  for (const p of OBJECT_PIECES){
    if (!p.leafy || !covers(p, m.tx, m.ty) || covers(p, m.fx, m.fy)) continue;   // stepping into its leaves, not along or out of them
    p.rustle = now;
    for (let i = 0; i < 2; i++) fallingLeaves.push({x: m.tx*T + 2 + Math.random()*12, y: m.ty*T - 4 + Math.random()*6, t0: now + i*90, s: Math.random() < .5 ? -1 : 1});
  }
}
function drawFallingLeaves(cx, cy, now){
  for (let i = fallingLeaves.length - 1; i >= 0; i--){
    const f = fallingLeaves[i], t = (now - f.t0) / 800;
    if (t > 1){ fallingLeaves.splice(i, 1); continue; }
    if (t < 0) continue;
    const X = Math.round(f.x - cx + Math.sin(t*7) * 2 * f.s), Y = Math.round(f.y - cy + t*14);   // drifting from side to side as it falls
    R(b, X, Y, 2, 1, '#8FC85A'); R(b, X + (f.s > 0 ? 1 : 0), Y + 1, 1, 1, LEAF[1]);
  }
}
function heart(X, Y){ [[1,0],[3,0],[0,1],[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[2,3]].forEach(([a,c]) => R(b, X+a, Y+c, 1, 1, '#E0446A')); }
// An animal at its own spot that you're meeting (it's drawn there, not as one jumping out): how far it hops up now. It hops
// when it sees you; and if you make friends, it hops for joy, with a heart rising over it (at X, Y); if not, it stays put.
function meetHop(a, X, Y, now){
  if (!foe || foe.a !== a) return 0;
  const e = now - foe.t0;
  if (foe.state === 'in') return e > 280 && e < 520 ? Math.round(Math.sin((e - 280) / 240 * Math.PI) * 4) : 0;
  if (foe.state !== 'happy') return 0;
  const e1 = now - foe.t1;
  heart(X + 6, Y - 6 - Math.round(e1 / 120));
  return Math.round(Math.abs(Math.sin(e1 / 130)) * 4);
}
function drawFoe(cx, cy, now){
  if (!foe || foe.spot) return;   // (one met at its own spot is drawn there: meetHop)
  const X = foe.x*T - cx, Y = foe.y*T - cy, e = now - foe.t0, spr = towardsYou(foe.a, foe.x);   // (looking at you)
  if (foe.state === 'in'){
    const k = clamp(e / 280, 0, 1), h = Math.max(1, Math.round(16 * k)), jump = e > 280 && e < 520 ? Math.round(Math.sin((e - 280) / 240 * Math.PI) * 4) : 0;
    R(b, X+3, Y+14, 10, 2, 'rgba(0,0,0,.18)');
    b.drawImage(spr, 0, 0, 16, h, X, Y + 16 - h - jump, 16, h);
    if (e < 600 && tileAt(foe.x, foe.y).look === 'tallGrass'){ for (let i = 0; i < 5; i++){ const gx = X + 1 + i*3 + Math.round(Math.sin(e/40 + i)*1); R(b, gx, Y + 11 - (i % 2), 1, 4, '#2F6E38'); R(b, gx, Y + 10 - (i % 2), 1, 1, '#94D883'); } }
  } else {
    const e1 = now - foe.t1;
    if (foe.state === 'hide'){   // ducking back down into the grass where it came from (you ran away from it)
      const h = Math.round(16 * clamp(1 - e1 / 450, 0, 1));
      if (h > 0){ R(b, X+3, Y+14, 10, 2, 'rgba(0,0,0,.18)'); b.drawImage(spr, 0, 0, 16, h, X, Y + 16 - h, 16, h); }
      if (e1 < 600 && tileAt(foe.x, foe.y).look === 'tallGrass'){ for (let i = 0; i < 5; i++){ const gx = X + 1 + i*3 + Math.round(Math.sin(e1/40 + i)*1); R(b, gx, Y + 11 - (i % 2), 1, 4, '#2F6E38'); R(b, gx, Y + 10 - (i % 2), 1, 1, '#94D883'); } }
    } else if (foe.state === 'happy'){
      const hop = Math.round(Math.abs(Math.sin(e1 / 130)) * 4);
      b.globalAlpha = clamp(1 - (e1 - 700) / 300, 0, 1);
      b.drawImage(spr, X, Y - hop); heart(X + 6, Y - 6 - Math.round(e1 / 120));
      b.globalAlpha = 1;
    } else {
      const [dx, dy] = DV[OPP[pl.dir]] ? DV[pl.dir] : [0, 1];
      const d = e1 / 650 * 20;
      b.globalAlpha = clamp(1 - e1 / 650, 0, 1);
      b.drawImage(towardsYou(foe.a, foe.x, true), Math.round(X + dx * d), Math.round(Y + dy * d - Math.abs(Math.sin(e1 / 70)) * 2));   // (running off, away from you)
      b.globalAlpha = 1;
    }
  }
}
// The speech box covers the bottom of the screen. If you, or the square you face (whoever you're talking to), would
// be under it, it goes at the top of the screen instead, and stays there for the whole conversation, through every
// line, card and reply, so it doesn't jump about; the map never moves for it. Checked as each line shows (before it's
// drawn: placeTalk() in js/cards.js) and on every frame, in case the box grows, such as when its English is shown.
let talkTop = false, talkCover = 0;   // whether the box is at the top; how much of the view it covers, in map pixels (the most this conversation)
const camY = () => Math.round(clamp((pl.mv && pl.mv.slip ? pl.mv.fy*T : pl.py) + 8 - VH*T/2, 0, ROWS*T - VH*T));   // the top of the view: you in the middle, as far as the map goes (still while you slip down a bank, so you can see yourself slip)
function placeTalk(cy = camY()){
  if (talkBox.hidden){
    if (!busy && (talkTop || talkCover)){ talkTop = false; talkCover = 0; talkBox.classList.remove('top'); }   // the conversation is over
    return;
  }
  if (talkTop) return;
  const h = +cv.clientHeight || 0, bh = +talkBox.offsetHeight || 0;
  if (h > 0) talkCover = Math.max(talkCover, Math.min(VH*T, bh * VH*T / h));
  const [, fy] = facing(), top = Math.min(pl.py, fy*T) - cy, low = Math.max(pl.py, fy*T) + T - cy;   // you and the square you face, on screen
  const under = low - (VH*T - talkCover), over = talkCover - top;   // how far you'd be under the box at the bottom, and at the top
  if (under > 0 && over < under){ talkTop = true; talkBox.classList.add('top'); $('#placeName').hidden = true; }   // (the place's name would cover its buttons)
}
// Standing in tall or long grass hides your feet, as in Pokémon: the map where your feet are (the bottom FEET pixels of
// your square, wherever you are, between two squares as you walk) is drawn again over you, where it's grass. Gives
// those parts, each [x, y, w, h] in map pixels.
const HIDES_FEET = ['tallGrass', 'longGrass'], FEET = 4;
function feetInGrass(px = pl.px, py = pl.py){   // (anyone following you too: where they are, px and py)
  const left = Math.round(px), top = Math.round(py) + T - FEET, out = [];
  for (let ty = Math.floor(top / T); ty <= Math.floor((top + FEET - 1) / T); ty++)
    for (let tx = Math.floor(left / T); tx <= Math.floor((left + T - 1) / T); tx++){
      if (!HIDES_FEET.includes(tileAt(tx, ty).look)) continue;
      const x0 = Math.max(left, tx*T), x1 = Math.min(left + T, (tx+1)*T), y0 = Math.max(top, ty*T), y1 = Math.min(top + FEET, (ty+1)*T);
      out.push([x0, y0, x1 - x0, y1 - y0]);
    }
  return out;
}
// The cave just visible behind a waterfall (the place's glimpse): its dark mouth, a glint inside, and the water falling
// in front of it.
function drawGlimpse(cx, cy, now){
  const g = PLACES[PLACE].glimpse; if (!g) return;
  const X = g[0]*T - cx, Y = g[1]*T - cy, W = g[2]*T, H = g[3]*T, top = Y + Math.round(H * .56);
  b.globalAlpha = .5; R(b, X + Math.round(W * .12), top, Math.round(W * .76), Y + H - top, '#1E2830'); oval(b, X + W/2, top, Math.round(W * .38), Math.round(H * .19), '#1E2830');
  b.globalAlpha = .3; R(b, X + Math.round(W * .3), top + 6, 3, 2, '#C9A66B'); R(b, X + Math.round(W * .62), top + 8, 2, 2, '#C9A66B');
  b.globalAlpha = .55;
  for (let i = 0; i < 9; i++){ const off = (now / 22 + i * 7) % (H * .5); R(b, X + 3 + i * Math.floor(W / 10), Y + Math.round(H * .45) + Math.floor(off), 1, Math.min(6, Y + H - (Y + Math.round(H * .45) + Math.floor(off))), '#FFFFFF'); }
  b.globalAlpha = 1;
}
// Splashes of water (going into a waterfall), and drops falling from you after you come through one.
function drawSplashes(cx, cy, now){
  for (let i = splashes.length - 1; i >= 0; i--){
    const s = splashes[i], t = (now - s.t0) / 1000;
    if (t > .7){ splashes.splice(i, 1); continue; }
    for (let k = 0; k < 12; k++){
      const a = Math.PI * (.1 + .8 * k / 11), v = 40 + (k % 4) * 14;
      const x = s.x + Math.cos(a) * v * t * (k % 2 ? 1 : -1), y = s.y - Math.sin(a) * v * t + 90 * t * t;
      R(b, Math.round(x - cx), Math.round(y - cy), 2, 2, k % 3 ? '#FFFFFF' : '#BFE8FA');
    }
  }
  if (now < dripUntil){
    const PX = Math.round(pl.px - cx), PY = Math.round(pl.py - cy), left = (dripUntil - now) / 1500;
    b.globalAlpha = .45 * left; oval(b, PX + 8, PY + 15, 8, 2, '#3F8FCB'); b.globalAlpha = 1;   // a little puddle
    for (let k = 0; k < 6; k++){ const ph = ((now / 600) + k / 6) % 1; R(b, PX + 2 + (k * 5) % 13, PY + 4 + Math.round(ph * 12), 1, 2, '#BFE8FA'); }   // drops falling from your fur
  }
}
// Swinging a stick (yours, in the hit step, js/world.js; or a little monkey's in training, as it practises): the monkey
// (kind) with nothing in its hands, and the stick sweeping from up high down onto the square it faces (dir), with a faint
// swoosh behind it, from t0; it stays there a moment after it strikes. Each way it faces: where the stick turns from and
// to (degrees: 0 is to the right, 90 down), and the hand holding it (in the sprite). Facing away, the stick is beyond the
// monkey, so it's drawn first.
const SWING_ARC = {right:[-115, 5], left:[295, 175], down:[-70, 95], up:[150, 268]};
const SWING_HAND = {right:[12, 9], left:[3, 9], down:[13, 10], up:[2, 9]};
function drawSwing(kind, dir, PX, PY, t0, now){
  const t = Math.max(0, (now - t0) / SWING_MS), k = Math.min(1, t / SWING_CONTACT), eased = 1 - (1 - k) * (1 - k);
  const held = HELD[heldBy(kind) || '棍子'], [a0, a1] = SWING_ARC[dir], [hx, hy] = SWING_HAND[dir], len = held.len + 2, pal = held.pal;   // (a little longer as it swings)
  const angle = a0 + (a1 - a0) * eased - (t > SWING_CONTACT ? (a1 - a0) * .08 * Math.sin((t - SWING_CONTACT) / (1 - SWING_CONTACT) * Math.PI) : 0);   // (a little bounce back)
  const along = (deg, r) => [PX + hx + Math.cos(deg * Math.PI / 180) * r, PY + hy + Math.sin(deg * Math.PI / 180) * r];
  const stick = () => {
    if (k < 1){ b.globalAlpha = .45; for (let i = 0; i <= 8; i++){ const [x, y] = along(a0 + (angle - a0) * i / 8, len - 1); R(b, Math.round(x), Math.round(y), 1, 1, '#FFFFFF'); } b.globalAlpha = 1; }   // the swoosh
    for (let r = -1; r <= len; r++){ const [x, y] = along(angle, r); R(b, Math.round(x) - 1, Math.round(y) - 1, 2, 2, pal.k); }   // its dark edge
    for (let r = 0; r < len; r++){ const [x, y] = along(angle, r); R(b, Math.round(x), Math.round(y), 1, 1, pal.l); }           // the wood
  };
  if (dir === 'up') stick();
  R(b, PX+4, PY+15, 8, 1, 'rgba(0,0,0,.22)'); R(b, PX+3, PY+14, 10, 1, 'rgba(0,0,0,.12)');
  b.drawImage(monkeySprite(kind, dir, false, 0, true), PX, PY);
  if (dir !== 'up') stick();
}
// Ground being marked out (the markOut step): a stake hammered in at each corner of the plot, one by one, as plot() in
// js/art.js has them; the string pulled tight round them, from the top-left, round to the right, along the bottom and back
// up; then the new ground fading in, with its sign and its path (and anything else that's changed). Or something being
// planted (the plant step), such as flowers.
function drawMarking(cx, cy, now){
  const m = marking, e = m.hold ?? now - m.t0, k = (from, to) => clamp((e - from) / (to - from), 0, 1);
  if (m.grow){   // being planted (the plant step): each square grows up out of the ground, one after another
    m.changed.forEach(([x, y], i) => {
      const h = Math.round(k(i * PLANT.each, i * PLANT.each + PLANT.grow) * T);
      if (h) b.drawImage(m.fresh, x*T, y*T + T - h, T, h, x*T - cx, y*T + T - h - cy, T, h);
    });
    return;
  }
  const fade = k(...MARK.ground);
  if (fade > 0){ b.globalAlpha = fade; for (const [x, y] of m.changed) b.drawImage(m.fresh, x*T, y*T, T, T, x*T - cx, y*T - cy, T, T); b.globalAlpha = 1; }
  if (!m.box) return;
  const X0 = m.box.x0*T - cx, Y0 = m.box.y0*T - cy, X1 = m.box.x1*T - cx, Y1 = m.box.y1*T - cy, w = X1 + T - X0, h = Y1 + T - Y0;
  let left = Math.round(k(...MARK.string) * 2 * (w + h));   // how much string is out
  for (const [x, y, dx, dy, n] of [[X0, Y0 + 1, 1, 0, w], [X1 + 14, Y0, 0, 1, h], [X1 + T, Y1 + 14, -1, 0, w], [X0 + 1, Y1 + T, 0, -1, h]]){
    const d = Math.min(n, left); left -= d;
    if (d > 0) R(b, dx < 0 ? x - d : x, dy < 0 ? y - d : y, dx ? d : 1, dy ? d : 1, '#EFE6CF');
  }
  [[X0, Y0 + 1], [X1 + 14, Y0 + 1], [X1 + 14, Y1 + 12], [X0, Y1 + 12]].forEach(([sx, sy], i) => {
    if (e < MARK.stakes[i]) return;
    const y = sy - 2 - Math.max(0, 3 - Math.floor((e - MARK.stakes[i]) / 40));   // (dropping into place as it's hammered in)
    R(b, sx, y, 2, 5, WOOD[1]); R(b, sx, y, 1, 5, WOOD[3]); R(b, sx, y, 2, 1, WOOD[0]);
  });
}
// Chips flying off what you hit (burst, at the moment your stick strikes): wood or stone, falling as they fly.
const chips = [];
const CHIP_COLOURS = {wood:['#D2A46A', '#8A5A32', '#B98A55', '#6B4A2A'], stone:['#E6E2D6', '#A9A598', '#7C786D', '#D6D2C5']};
function burst(x, y, kind){
  const now = performance.now(), cols = CHIP_COLOURS[kind] || CHIP_COLOURS.wood;
  for (let i = 0; i < 10; i++){ const a = Math.PI * (1.1 + .8 * Math.random()), v = 30 + Math.random() * 45; chips.push({x:x*T + 8, y:y*T + 7, vx:Math.cos(a) * v * (Math.random() < .5 ? -1 : 1), vy:Math.sin(a) * v, c:cols[i % cols.length], t0:now}); }
}
function drawChips(cx, cy, now){
  for (let i = chips.length - 1; i >= 0; i--){
    const p = chips[i], t = (now - p.t0) / 1000;
    if (t > .6){ chips.splice(i, 1); continue; }
    R(b, Math.round(p.x + p.vx * t - cx), Math.round(p.y + p.vy * t + 160 * t * t - cy), 2, 1, p.c);
  }
}
// Where a character is drawn (x and y in map pixels; ground, its y without a leap's lift), and whether it's mid-step:
// stepping or leaping from square to square (mv: someone following you, or going to their place), or on its square.
function charPos(n, now){
  const m = n.mv, p = m ? clamp((now - m.t0) / m.dur, 0, 1) : 1;
  if (p >= 1) return {x:n.x*T, y:n.y*T, ground:n.y*T, mid:false};
  const far = Math.abs(n.x - m.fx) + Math.abs(n.y - m.fy), ground = (m.fy + (n.y - m.fy) * p) * T;
  const lift = m.far ? Math.sin(p * Math.PI) * (4 + 2 * far) : 0;
  return {x:(m.fx + (n.x - m.fx) * p) * T, y:ground - lift, ground, mid:p > .15 && p < .85};
}
function drawWorld(now){
  let cx = Math.round(clamp(pl.px + 8 - VW*T/2, 0, COLS*T - VW*T));
  let cy = camY(); placeTalk(cy);
  bigSparkles = !!AREA.bigSparkles && matches(AREA.bigSparkles);
  if (now - shakeT < 600){ cx += Math.round((Math.random()-.5)*3); cy += Math.round((Math.random()-.5)*3); }
  const sh = Math.min(VH*T, ROWS*T - cy);   // the part of the view the map reaches down to
  if (sh < VH*T) R(b, 0, 0, VW*T, VH*T, '#1E2B26');
  b.drawImage(mapCanvas, cx, cy, VW*T, sh, 0, 0, VW*T, sh);
  b.drawImage(baseCanvas, cx, cy, VW*T, sh, 0, 0, VW*T, sh);   // big objects, under the characters: those that never move, all at once
  touchLeaves(now);
  for (const p of OBJECT_PIECES) if (!p.baked) drawPiece(p, p.base, cx, cy, now);   // and the fruit trees, which rustle
  const x0 = Math.floor(cx/T), y0 = Math.floor(cy/T);
  for (let y = y0; y <= y0 + VH; y++) for (let x = x0; x <= x0 + VW; x++) animTile(x, y, x*T - cx, y*T - cy, now);
  drawGlimpse(cx, cy, now);
  if (marking) drawMarking(cx, cy, now);   // ground being marked out (the markOut step)
  // fish jumping out of the water (the area's fish), one after another, every other one the other way
  AREA.fish.forEach((f, i) => {
    const fp = ((now + i * 2300) % (5200 + i * 700)) / 900;
    if (fp >= 1 || placeOf(f) !== PLACE) return;
    const way = i % 2 ? -1 : 1, fx = f[0]*T - cx + 8 + way * (fp*10 - 6), fy = f[1]*T - cy + 6 - Math.sin(fp*Math.PI)*8;
    R(b, Math.round(fx), Math.round(fy), 3, 2, '#F28C38'); R(b, Math.round(fx) + (way > 0 ? -1 : 3), Math.round(fy), 1, 2, '#D96A1E');
  });
  if (!GLOOM) drawSparkles(cx, cy, now);   // (in a gloomy place, over its shade instead, so they shine)
  // animals at their own spots, once animals appear: standing on open ground (the deer), or a little up a cliff, bobbing;
  // those up a tree come after the leaves. While you're meeting one, it stays where it is (meetHop).
  const spotAnimals = canWild() ? ANIMALS.filter(a => a.at && a.place === PLACE) : [];
  const inTree = a => tileAt(a.at[0], a.at[1]).look === 'tree';
  for (const a of spotAnimals.filter(a => !inTree(a))){
    const X = a.at[0]*T - cx, Y = a.at[1]*T - cy, ground = !!tileAt(a.at[0], a.at[1]).walk;
    if (X < -T || Y < -T || X > VW*T || Y > VH*T) continue;
    const up = (ground ? 0 : 3 + Math.floor(now/600 + a.at[0]) % 2) + meetHop(a, X, Y, now);
    R(b, X+3, Y+14, 10, 2, 'rgba(0,0,0,.2)'); b.drawImage(towardsYou(a, a.at[0]), X, Y - up);   // (looking your way)
  }
  // tall grass rustling where an animal hides
  if (rustle && canWild() && Math.floor(now / 160) % 6 < 3){
    const X = rustle.x*T - cx, Y = rustle.y*T - cy;
    for (let i = 0; i < 5; i++){ const gx = X + 1 + i*3 + Math.round(Math.sin(now/45 + i)*1.5); R(b, gx, Y + 9 - (i % 2), 1, 5, '#2F6E38'); R(b, gx, Y + 8 - (i % 2), 1, 1, '#94D883'); }
  }
  drawBirds(cx, cy, now);
  // entities sorted by row (their ! and ? bubbles wait until after the over-layer)
  const bubbles = [];
  const ents = [...NPCS, ...FOLLOWERS].map(n => { const c = charPos(n, now); return {n, c, y:c.ground}; })   // (on your square, they're behind you)
    .concat([{p:true, y:pl.py}]).concat(foe ? [{f:true, y:foe.y*T}] : []).sort((a,c) => a.y - c.y);
  for (const e of ents){
    if (e.f){ drawFoe(cx, cy, now); continue; }
    if (e.p){
      if (sleepAt){ drawAsleep(sleepAt.x*T - cx, sleepAt.y*T - cy); continue; }   // asleep in a bed
      const moving = !!pl.mv, p = moving ? (now - pl.mv.t0) / STEP : 0;
      const mid = moving && p > .15 && p < .85;
      const PX = Math.round(pl.px - cx), PY = Math.round(pl.py - cy);
      if (swing && now - swing.t0 < SWING_MS) drawSwing('player', pl.dir, PX, PY, swing.t0, now);   // swinging your stick (the hit step)
      else drawEntityMonkey('player', PX, PY, pl.dir, now, mid ? 1 : 0, mid ? 1 + pl.parity : 0, 1);
      for (const [x, y, w, h] of feetInGrass()) b.drawImage(mapCanvas, x, y, w, h, x - cx, y - cy, w, h);   // the grass over your feet
      if (now < alertUntil) bubbles.push([PX + 5, PY - 10, '!']);
      if (now - wakeT < 1000) [[-3, 2], [17, 4], [-1, -4], [15, -3], [7, -7]].forEach(([dx, dy], i) => {   // waking up with all your hearts: sparkles
        const tw = (now / 200 + i) % 2 < 1; R(b, PX + dx, PY + dy, 1, 3, '#FFE27A'); R(b, PX + dx - 1, PY + dy + 1, 3, 1, tw ? '#FFFFFF' : '#FFE27A'); });
      continue;
    }
    const n = e.n, X = Math.round(e.c.x) - cx, Y = Math.round(e.c.y) - cy;
    if (X < -T || Y < -T || X > VW*T || Y > VH*T) continue;
    if (n.look && MAP_SPRITES[n.look]){   // a character that looks like an animal, such as the wild boar on the path
      R(b, X+3, Y+14, 10, 2, 'rgba(0,0,0,.18)'); b.drawImage(mapSprite(n.look), X, Y - Math.floor(Math.abs(Math.sin(now/400)) * 1));
    } else if (n.look === 'bird'){
      const hop = Math.floor(Math.abs(Math.sin(now/300)) * 3);
      R(b, X+5, Y+14, 6, 1, 'rgba(0,0,0,.2)'); b.drawImage(SPR.bird, X+4, Y+6 - hop);
      if (n.word && lvl(n.word) === 0) sparkle(X+13, Y+3, now, 3);
    } else if (PLAYS[n.id]){   // a monkey of the troop at play, such as building a tower of stones (or stopped to talk to you)
      drawPlaying(n, X, Y, now);
    } else if (practising(n)){   // a little monkey in training, facing its own way, swinging its stick now and then
      const t0 = swingStart(n, now);
      if (t0 !== null) drawSwing(n.kind, n.home.facing, X, Y, t0, now);
      else drawEntityMonkey(n.kind, X, Y, n.home.facing, now, 0, 0, n.x + n.y);
    } else {
      const idle = Math.floor(now/700 + n.x) % 2;
      drawEntityMonkey(n.kind, X, Y, n.dir, now, e.c.mid ? 1 : idle, e.c.mid ? 1 + (n.parity || 0) : 0, n.x + n.y);
    }
    if (FOLLOWERS.includes(n)) for (const [x, y, w, h] of feetInGrass(e.c.x, e.c.y)) b.drawImage(mapCanvas, x, y, w, h, x - cx, y - cy, w, h);   // the grass over their feet
    // a ! while they're stopping you (the stopsYou step), or a ! or ? from the area's bubbles
    const bub = now < (n.calls || 0) || keptFor(n) ? {show:'!'} : (AREA.bubbles[n.id] || []).find(x => matches(x.if));   // (and something they kept for you)
    if (bub) bubbles.push([X+10, Y-8, bub.show]);
  }
  drawDragonflies(cx, cy, now);
  // the tops of big objects (a tree's leaves, the stall's awning), over anyone walking behind them
  b.drawImage(topCanvas, cx, cy, VW*T, sh, 0, 0, VW*T, sh);
  for (const p of OBJECT_PIECES) if (!p.baked) drawPiece(p, p.top, cx, cy, now);
  drawFallingLeaves(cx, cy, now);
  for (const a of spotAnimals.filter(inTree)){   // the squirrel, small, up in its tree's leaves
    const X = a.at[0]*T - cx, Y = a.at[1]*T - cy, bob = Math.floor(now/600 + a.at[0]) % 2;
    if (X < -T || Y < -T || X > VW*T || Y > VH*T) continue;
    b.drawImage(towardsYou(a, a.at[0]), 0, 0, 16, 16, X + 4, Y - 5 - bob - meetHop(a, X, Y - 8, now), 10, 10);
  }
  if (GLOOM){ drawGloom(cx, cy, sh, now); drawSparkles(cx, cy, now); }   // a gloomy place, such as the pine wood
  for (const [x, y, k] of glintsNow(now)) glint(x*T - cx + 8, y*T - cy + 11, k);   // things hidden off the path
  for (const [x, y, show] of bubbles) bubble(x, y, show);
  if (trainingCalls()) for (const [x, y] of TRAINING_TILES) if (tileAt(x, y).action === 'training') bubble(x*T - cx + 10, y*T - cy - 8, '!');   // words need practice (while the post stands)
  drawSplashes(cx, cy, now);
  drawChips(cx, cy, now);
  drawMarkers(cx, cy, now);
  const wk = (now - waterT) / 600;   // going through falling water: a rush of water covers the screen, then clears
  if (wk >= 0 && wk < 2){
    b.globalAlpha = (wk < 1 ? wk : 2 - wk) * .96; R(b, 0, 0, VW*T, VH*T, '#8FD0EE');
    for (let i = 0; i < 80; i++){ const x = (i * 37) % (VW*T), y = Math.floor(i * 53 + now * (.25 + (i % 3) * .1)) % (VH*T); R(b, x, y, 1, 7 + i % 9, i % 3 ? '#FFFFFF' : '#BFE8FA'); }
    b.globalAlpha = 1;
  }
  const sk = (now - sleepT) / SLEEP_MS;   // sleeping in a bed: the cave goes dim and Zs float up from you, then it's light again
  if (sk >= 0 && sk < 1){
    const a = Math.min(1, sk / .2, (1 - sk) / .2), PX = Math.round(pl.px - cx), PY = Math.round(pl.py - cy);
    b.globalAlpha = a * .55; R(b, 0, 0, VW*T, VH*T, '#0B1024');   // (not too dark: you can still see yourself asleep)
    for (let k = 0; k < 3; k++){
      const ph = (sk * 2.5 + k / 3) % 1;
      b.globalAlpha = a * (1 - ph * .8); zee(PX + 10 + Math.round(ph * 14), PY - Math.round(ph * 26), 4 + k * 2, '#CFE8F7');
    }
    b.globalAlpha = 1;
  }
  const fk = (now - fadeT) / 700;
  if (fk >= 0 && fk < 2){ b.globalAlpha = fk < 1 ? fk : 2 - fk; R(b, 0, 0, VW*T, VH*T, '#000000'); b.globalAlpha = 1; }
}
// Things hidden off the path (the area's hidden) give themselves away with a tiny glint now and then, easy to miss: each
// of them in the place you're in, not found yet, glinting now ([x, y, how bright, 0 to 1]), every GLINT_EVERY ms for
// GLINT_MS, each at its own time; and the glint, a little cross of light, at X, Y.
const GLINT_EVERY = 3400, GLINT_MS = 420;
function glintsNow(now){
  const out = [];
  for (const h of AREA.hidden || []){
    if (placeOf(h.at) !== PLACE || here().finds[h.id]) continue;
    const [x, y] = h.at, t = (now + x * 977 + y * 613) % GLINT_EVERY;
    if (t < GLINT_MS) out.push([x, y, Math.sin(t / GLINT_MS * Math.PI)]);
  }
  return out;
}
function glint(X, Y, k){
  const r = Math.round(1 + k * 2);
  b.globalAlpha = .4 + k * .6;
  R(b, X - r, Y, 2*r + 1, 1, '#FFFFFF'); R(b, X, Y - r, 1, 2*r + 1, '#FFFFFF'); R(b, X, Y, 1, 1, '#FFF3B0');
  b.globalAlpha = 1;
}
// Sparkles on things whose word you don't know yet, and on things you can collect right now (their onLook part with
// sparkle matches). One with no word, such as on the sign, sparkles while its if matches.
function drawSparkles(cx, cy, now){
  for (const s of SPARKLES){
    if (!sparkling(s)) continue;
    const [x, y] = s.at, t = tileAt(x, y);
    sparkle(x*T - cx + (t.walk ? 8 : 12), y*T - cy + (t.walk ? 8 : 3), now, x + y);
  }
  for (const [x, y] of COLLECTABLE){
    const t = tileAt(x, y), p = (t.onLook || []).find(p => !p.if || matches(p.if));
    if (p && p.sparkle) sparkle(x*T - cx + (t.walk ? 8 : 12), y*T - cy + (t.walk ? 8 : 3), now, x + y);
  }
}
// A gloomy place, such as the pine wood (its gloom, made ready in buildGloom, js/art.js), over everything on the map but
// the bubbles and sparkles: its shade, soft (one pixel a square, smoothed as it's drawn bigger), sunbeams shimmering,
// mist drifting low, and now and then a pair of eyes glinting deep in the shade. Gloomy, but always the daytime.
function drawGloom(cx, cy, sh, now){
  b.imageSmoothingEnabled = true; b.drawImage(gloomCanvas, cx / T, cy / T, VW, sh / T, 0, 0, VW*T, sh); b.imageSmoothingEnabled = false;
  b.globalAlpha = .75 + .25 * Math.sin(now / 1700); b.drawImage(beamCanvas, cx, cy, VW*T, sh, 0, 0, VW*T, sh); b.globalAlpha = 1;
  if (GLOOM.mist){ const off = (now / 90) % (2*VW*T); b.drawImage(mistStrip(), -off, 0); b.drawImage(mistStrip(), 2*VW*T - off, 0); }
  if (GLOOM.eyes) drawEyes(cx, cy, now);
}
let mistCanvas = null;
function mistStrip(){   // soft wisps of mist, in a strip twice the screen's width, to drift across it
  if (mistCanvas) return mistCanvas;
  const W = 2*VW*T, H = VH*T; mistCanvas = document.createElement('canvas'); mistCanvas.width = W; mistCanvas.height = H;
  const g = mistCanvas.getContext('2d');
  for (let k = 0; k < 24; k++){
    const mx = (k * 97) % W, my = (k * 53) % H, rx = 30 + (k * 13) % 40, ry = 6 + (k * 7) % 8;
    const gr = g.createRadialGradient(mx, my, 1, mx, my, rx); gr.addColorStop(0, 'rgba(225,232,222,.15)'); gr.addColorStop(1, 'rgba(225,232,222,0)');
    g.save(); g.translate(mx, my); g.scale(1, ry / rx); g.translate(-mx, -my); g.fillStyle = gr; g.beginPath(); g.arc(mx, my, rx, 0, 7); g.fill(); g.restore();
  }
  return mistCanvas;
}
// Eyes glinting between the trees, deep in the shade and well away from you: they blink twice and are gone, and after a
// while another pair glints somewhere else. Gone at once if you come near.
const EYES_MS = 2600;
let eyes = null, eyesNext = 0;
function drawEyes(cx, cy, now){
  if (eyes && (now - eyes.t0 > EYES_MS || Math.abs(eyes.x - pl.x) + Math.abs(eyes.y - pl.y) < 4)){ eyes = null; eyesNext = now + 3000 + Math.random() * 5000; }
  if (!eyes && now >= eyesNext){
    for (let k = 0; k < 20 && !eyes; k++){   // somewhere in view, deep in the trees
      const x = Math.floor(cx / T) + 1 + Math.floor(Math.random() * (VW - 2)), y = Math.floor(cy / T) + 1 + Math.floor(Math.random() * (VH - 2));
      if (y < ROWS && x < COLS && GLOOM.open[y][x] < .3 && !tileAt(x, y).walk && Math.abs(x - pl.x) + Math.abs(y - pl.y) >= 5) eyes = {x, y, t0:now};
    }
    if (!eyes) eyesNext = now + 1000;
  }
  if (!eyes || (now - eyes.t0) % 1300 < 140) return;   // (blinking)
  const X = eyes.x*T - cx + 5, Y = eyes.y*T - cy + 3;
  R(b, X, Y, 2, 1, '#F5E36A'); R(b, X + 4, Y, 2, 1, '#F5E36A');
}
// You, asleep in the bed whose square is at X, Y on the screen: your head on the stone pillow, and the leaf blanket
// pulled up over you, with a hand on top.
function drawAsleep(X, Y){
  b.drawImage(asleepSprite(), X + 2, Y - 1);
  R(b, X + 1, Y + 6, 14, 7, '#2E2A26'); R(b, X + 2, Y + 6, 12, 6, '#5E9A3E'); R(b, X + 2, Y + 6, 12, 1, '#8CC45A');
  R(b, X + 4, Y + 5, 8, 2, '#5E9A3E'); R(b, X + 4, Y + 5, 8, 1, '#8CC45A');   // the shape of you under it
  R(b, X + 2, Y + 11, 12, 1, '#3F6E2A'); [4, 8, 11].forEach(i => R(b, X + i, Y + 8, 1, 1, '#A8D877'));
  R(b, X + 11, Y + 6, 3, 2, PALS.player.f);
}
function zee(x, y, s, c){ R(b, x, y, s, 1, c); R(b, x, y + s - 1, s, 1, c); for (let i = 1; i < s - 1; i++) R(b, x + s - 1 - i, y + i, 1, 1, c); }   // a little Z, s pixels across
// Little birds that land near you now and then and hop about for most of a minute. Walk up and face
// one to look at it (A); it flies off then, or if you step right onto it.
const birds = [];
const birdAt = (x, y) => birds.find(bd => !bd.off && bd.tx === x && bd.ty === y);
function shooBird(bd){ if (bd && !bd.off) bd.off = performance.now(); }
let nextBird = 0;
function drawBirds(cx, cy, now){
  if (now > nextBird && birds.length < 2){
    nextBird = now + 6000 + Math.random() * 6000;
    const spots = [];
    for (let y = Math.floor(cy/T); y < Math.floor(cy/T) + VH; y++) for (let x = Math.floor(cx/T); x < Math.floor(cx/T) + VW; x++){
      const t = tileAt(x, y);
      if (t.look === 'grass' && !npcAt(x, y) && Math.abs(x - pl.x) + Math.abs(y - pl.y) >= 3) spots.push([x, y]);
    }
    if (spots.length){ const [x, y] = spots[Math.floor(Math.random() * spots.length)]; birds.push({tx:x, ty:y, x:x*T + 4, y:y*T + 6, t0:now, until:now + 40000 + Math.random() * 30000, from:Math.random() < .5 ? -1 : 1}); }
  }
  for (let i = birds.length - 1; i >= 0; i--){
    const bd = birds[i], near = pl.x === bd.tx && pl.y === bd.ty;   // you stepped right onto it
    if (!bd.off && (near || now > bd.until)) bd.off = now;
    const k = bd.off ? (now - bd.off) / 900 : 1 - Math.min(1, (now - bd.t0) / 1200);   // 0 on the ground, up to 1 in the air
    if (bd.off && k > 1){ birds.splice(i, 1); continue; }
    const X = Math.round(bd.x - cx + bd.from * k * 60), Y = Math.round(bd.y - cy - k * 70 - (k ? Math.abs(Math.sin(now/60)) * 2 : Math.floor(Math.abs(Math.sin(now/300 + i)) * 2)));
    if (!k) R(b, X+1, Y+7, 6, 1, 'rgba(0,0,0,.2)');
    b.drawImage(SPR.bird, X, Y);
    if (!k && BIRD_WORD && lvl(BIRD_WORD) === 0) sparkle(X + 9, Y - 2, now, i);   // it sparkles until you know its word
  }
}
const ARROW = ["ooooooo","oyyyyyo",".oyyyo.","..oyo..","...o..."];
function pix(rows, X, Y, pal){ rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) R(b, X + x, Y + y, 1, 1, pal[ch]); })); }
function drawMarkers(cx, cy, now){
  const W = VW*T, H = VH*T, pal = {o:'#1E2B26', y:'#F2C14E'};
  for (const t of getTasks()){
    if (!t.target) continue;
    const [tx, ty] = t.target, X = tx*T - cx, Y = ty*T - cy;
    const onScreen = X > -8 && X < W - 8 && Y > -4 && Y < H - 8;
    if (onScreen){ if (!t.npc) pix(ARROW, X + 4, Y - 7 + Math.round(Math.sin(now/180) * 2), pal); continue; }
    // off-screen: a small arrow at the screen edge pointing towards the task
    const mx = clamp(X + 8, 6, W - 6), my = clamp(Y + 8, 6, H - 6), pulse = (Math.sin(now/200) + 1) / 2 > .25;
    if (!pulse) continue;
    let rows;
    if (X + 8 < 6) rows = ["...oo","..oyo",".oyyo","oyyyo",".oyyo","..oyo","...oo"];
    else if (X + 8 > W - 6) rows = ["oo...","oyo..","oyyo.","oyyyo","oyyo.","oyo..","oo..."];
    else if (Y + 8 < 6) rows = ["...o...","..oyo..",".oyyyo.","oyyyyyo","ooooooo"];
    else rows = ARROW;
    pix(rows, Math.round(mx - rows[0].length / 2), Math.round(my - rows.length / 2), pal);
  }
  const lab = currentPrompt(now);
  if (lab && lab !== 'OK'){
    const [fx, fy] = facing(), X = fx*T - cx, Y = fy*T - cy;
    const bx = X + 12, by = Y + 2 + Math.round(Math.sin(now/220));
    pix(["..ooooo..",".orrrrro.","orrwwwrro","orwrrrwro","orwwwwwro","orwrrrwro","orwrrrwro",".orrrrro.","..ooooo.."], bx, by, {o:'#3A0F12', r:'#C0303A', w:'#FFFFFF'});
  }
}

/* ---- opening scene ---- */
// The sky, the sea and Flower Fruit Mountain, from night (light 0) to day (1), with the mountain moved dx to the right.
// The mountain is drawn for a screen 176 pixels wide (11 columns); the hills and the sea go all the way across. The
// opening (at dawn) and the end of the prologue (at dusk) share it.
function drawMountain(light, now, dx){
  const W = VW*T, H = VH*T;
  const skyTop = mix('#0E1A33','#79BFE6',light), skyBot = mix('#26385F','#F6C69C',light);
  for (let y = 0; y < H; y += 4) R(b, 0, y, W, 4, mix(skyTop, skyBot, y / H));
  if (light < 1){
    for (let i = 0; i < 36; i++){
      const sx = Math.floor(rnd(i,1)*W), sy = Math.floor(rnd(i,2)*H*.55), tw = (Math.sin(now/420 + i*1.7) + 1) / 2;
      if (tw < .3) continue;
      b.globalAlpha = (1 - light) * (.45 + .55*tw);
      R(b, sx, sy, 1, 1, '#FFF6D8'); if (tw > .9 && i % 3 === 0){ R(b, sx-1, sy, 3, 1, '#FFF6D8'); R(b, sx, sy-1, 1, 3, '#FFF6D8'); }
      b.globalAlpha = 1;
    }
  }
  b.save(); b.translate(dx, 0);
  const dawn = light;
  if (dawn > 0){ disc(b, 34, Math.round(116 - dawn*28), 9, '#FFD27A'); }
  for (let x = -dx; x < W - dx; x += 2){ const h = Math.round(98 - Math.abs(Math.sin(x/23))*14 - rnd(x>>2,7)*4); R(b, x, h, 2, 126 - h, mix('#22334F','#7FA79A',dawn)); }
  R(b, -dx, 124, W, H - 124, mix('#13284A','#3F8FCB',dawn));
  for (let i = 0; i < 14; i++){ const sx = Math.floor(rnd(i,5)*W) - dx, sy = 128 + Math.floor(rnd(i,6)*30); if (Math.sin(now/500 + i) > .3) R(b, sx, sy, 3, 1, mix('#3C5A86','#BFE8FA',dawn)); }
  for (let x = 24; x < 152; x += 2){
    const top = Math.round(70 + Math.pow(Math.abs(x - 88)/64, 1.25)*56 + Math.floor(rnd(x>>1,9)*3));
    R(b, x, top, 2, 126 - top, mix('#1D3A30','#3F7D55',dawn)); R(b, x, top, 2, 2, mix('#2B5242','#6CC066',dawn));
  }
  for (let i = 0; i < 18; i++){ const tx = 36 + Math.floor(rnd(i,11)*104), ty0 = Math.round(70 + Math.pow(Math.abs(tx - 88)/64, 1.25)*56) + 4 + Math.floor(rnd(i,12)*20); if (ty0 < 122 && Math.abs(tx-88) > 10) disc(b, tx, ty0, 2, mix('#16302A','#2F7A3E',dawn)); }
  b.restore();
}
function drawScene(t, now, mid = 0){   // mid: from 0 (the mountain on the right, for the title screen) to 1 (in the middle)
  const W = VW*T, H = VH*T;
  const dawn = clamp((t - 2.8) / 2.6, 0, 1);
  // On the title screen the mountain and the stone are moved to the right, leaving the sky on the left for the title's
  // words; in the opening they're in the middle, with the story along the bottom.
  const dx = Math.round(W * (.68 - .18 * mid) - 88), up = heavenUp(t);
  if (up >= 1){ drawHeaven(t, now, dx); return; }
  b.save(); b.translate(0, Math.round(up * H));   // (following the light up into the sky: heavenUp, below)
  drawMountain(dawn, now, dx);
  b.save(); b.translate(dx, 0);
  // stone, glow, cracks, birth
  const glow = clamp((t - 5.4) / 3.2, 0, 1);
  const pulse = glow > 0 && t < 9.4 ? glow * (.6 + .4*Math.sin(now/120)) : 0;
  if (pulse > 0){ const gr = b.createRadialGradient(88, 56, 2, 88, 56, 14 + glow*30); gr.addColorStop(0, `rgba(255,226,122,${.75*pulse})`); gr.addColorStop(1, 'rgba(255,226,122,0)'); b.fillStyle = gr; b.fillRect(40, 10, 96, 90); }
  if (t < 8.9){
    const sh = t > 7.2 ? Math.round((Math.random() - .5) * 2) : 0;
    b.drawImage(SPR.rock, 72 + sh, 46, 32, 32);
    const n = Math.floor(clamp((t - 6.6) / 2, 0, 1) * CRACK.length);
    for (let i = 0; i < n; i++){ const [x,y] = CRACK[i]; R(b, 72 + sh + x*2, 46 + y*2, 2, 2, '#FFE27A'); }
  } else {
    const off = Math.min(8, (t - 8.9) * 20);
    b.drawImage(SPR.rock, 0, 0, 8, 16, 72 - off, 46, 16, 32);
    b.drawImage(SPR.rock, 8, 0, 8, 16, 88 + off, 46, 16, 32);
    const blink = t > 9.6 && t < 9.8;
    const hop = t > HEAVEN.hello - .2 ? Math.round(Math.abs(Math.sin((t - HEAVEN.hello + .2) * 5)) * 4) : 0;
    b.drawImage(monkeySprite('player', 'down', blink), 72, 38 - hop, 32, 32);
    const k = eyeLight(t);   // the light from its eyes, shooting up into the sky
    if (k > 0){ b.globalAlpha = k; for (let y = 0; y < 49; y++) eyeBeams(0, y, 49 - y); b.globalAlpha = 1; }
  }
  b.restore();
  b.restore();
  if (up > 0){ b.save(); b.translate(0, Math.round((up - 1) * H)); drawHeaven(t, now, dx); b.restore(); }
  if (t > 8.6 && t < 9.4){ b.globalAlpha = clamp(1 - Math.abs(t - 8.8) / .6, 0, 1); R(b, 0, 0, W, H, '#FFFDF0'); b.globalAlpha = 1; }
}
// The light from the little monkey's eyes (it's born at 10.6, as the caption 它的眼睛里有光。 shows): two beams shooting up
// into the sky. In the book, they reach heaven, and the Jade Emperor sends Thousand-Mile Eye and Wind-Following Ear out of
// the Southern Gate of Heaven to look and listen (moved here from the lookout's view on 23 October 2026: the view is better
// on its own, and this is when it happens). So the view follows the light up into the sky (up), the gods step out to look
// (out), the view comes back down to the little monkey (down) and the light fades (fade); then you hear 你好，小猴子！
// (hello: the opening's last caption, in the area's intro).
const HEAVEN = {up:[11.3, 12.1], out:[12.4, 12.8], down:[14.8, 15.6], fade:[15.2, 15.9], hello:16.4};
const smooth = k => k * k * (3 - 2 * k);
function heavenUp(t){   // how far the view has gone up, following the light (0: the mountain, 1: heaven)
  const [u0, u1] = HEAVEN.up, [d0, d1] = HEAVEN.down;
  return t <= u0 || t >= d1 ? 0 : t < u1 ? smooth((t - u0) / (u1 - u0)) : t <= d0 ? 1 : smooth((d1 - t) / (d1 - d0));
}
const eyeLight = t => t <= 10.6 || t >= HEAVEN.fade[1] ? 0 : clamp((t - 10.6) / .4, 0, 1) * clamp((HEAVEN.fade[1] - t) / (HEAVEN.fade[1] - HEAVEN.fade[0]), 0, 1);
function eyeBeams(X, y, h){   // a row of both beams, at y, h pixels above the little monkey's eyes (X: where the mountain's drawn from)
  for (const [ex, dir] of [[85, -1], [91, 1]]){ const xx = X + ex + Math.round(dir * h * .18); R(b, xx, y, 2, 1, '#FFE27A'); if (y % 3 === 0) R(b, xx - 1, y, 4, 1, 'rgba(255,246,216,.7)'); }
}
// Heaven, high above the mountain, in the opening: the gate of heaven standing on the clouds, 南天门 on its plaque; the light
// from below bursting up through the clouds in front of it, lighting them gold; and the two gods stepping out from behind
// its pillars to look down at it (godsOut). Drawn twice as big as in a far-off view, so you can see them.
const godsOut = t => clamp((t - HEAVEN.out[0]) / (HEAVEN.out[1] - HEAVEN.out[0]), 0, 1);
function drawHeaven(t, now, dx){
  const W = VW*T, H = VH*T, k = eyeLight(t), sea = 92;   // (sea: the top of the clouds the gate stands on)
  for (let y = 0; y < H; y += 2) R(b, 0, y, W, 2, mix('#4F86CF', '#CFE9F6', y / sea));   // the sky, high above
  cloudPuff(6 + t * 2, 18, .8); cloudPuff(196 - t * 1.5, 30, .7);   // far-off clouds, drifting
  b.save(); b.scale(2, 2); heavenGate(godsOut(t), 35); b.restore();
  for (let i = 0; i < 9; i++) cloudPuff(-14 + i * 30 + (i % 2) * 6, sea + 4 + (i % 3) * 5, 1.2);   // the sea of clouds below
  for (let y = sea + 14; y < H; y += 2) R(b, 0, y, W, 2, mix('#FFFFFF', '#79BFE6', (y - sea - 14) / (H - sea - 14)));   // under them, thinning out to the morning sky below
  if (k <= 0) return;
  b.globalAlpha = k * .55; disc(b, dx + 88, sea + 6, 22, '#FFF1B8'); b.globalAlpha = 1;   // the clouds lit gold where it bursts through
  b.globalAlpha = k;
  for (let y = sea - 6; y < H; y++){ b.globalAlpha = k * clamp((y - sea + 6) / 14, 0, 1); eyeBeams(dx, y, 49 + H - y); }   // the light, from far below
  b.globalAlpha = 1;
}

/* ---- the end of the prologue: becoming king ---- */
// As in the book: in the Water Curtain Cave the troop gathers round you by the high stone seat and looks at you; they
// bow, one after another, and call you their king; then you climb up onto the high seat (高登王位), and take the name
// 美猴王 (no crown: he doesn't get one). Then, outside, the sun sets on Flower Fruit Mountain, with the troop at home on
// top. Its times match the becoming-king scene's captions (scenes.becomingKing in the area): 0 home, 3 brave, 5.5 king (they
// bow), 8 美猴王 (up onto the seat), 11 happy ever after. The scene waits just before each caption's time until you
// press Next, so each moment looks right there (the cave fades out only once the last caption has begun). The captions
// cover the bottom, so it all happens above them.
const CROWD = [['big', 66, 46, 'right'], ['playful', 38, 54, 'right'], ['troop2', 10, 62, 'right'],   // [who, x, y, facing you]
  ['elder', 142, 46, 'left'], ['troop1', 170, 54, 'left'], ['troop3', 198, 62, 'left']];
function drawBecomingKing(t, now){
  const W = VW*T, H = VH*T, blink = now % 3200 < 130;
  if (t < 11.3){
    for (let y = 0; y < H; y += 4) R(b, 0, y, W, 4, mix('#2A231E', '#4A3E33', y / H));   // the cave's rock
    for (let i = 0; i < 70; i++) R(b, Math.floor(rnd(i, 21) * W), Math.floor(rnd(i, 22) * H), 2 + Math.floor(rnd(i, 23) * 5), 2, i % 2 ? '#3A312A' : '#55483C');
    const warm = clamp(t / 1.2, 0, 1) * (t >= 8 ? 1 : .7);   // a warm glow round the seat, brighter once you're up on it
    const gl = b.createRadialGradient(120, 40, 4, 120, 40, 90); gl.addColorStop(0, `rgba(255,214,140,${.45 * warm})`); gl.addColorStop(1, 'rgba(255,214,140,0)');
    b.fillStyle = gl; b.fillRect(0, 0, W, H);
    R(b, 100, 14, 40, 34, '#7C786E'); R(b, 100, 14, 40, 2, '#9A968C'); R(b, 100, 14, 2, 34, '#6A665D'); R(b, 138, 14, 2, 34, '#6A665D');   // the high stone seat's back
    const seatFront = () => { R(b, 96, 46, 48, 14, '#8E8A80'); R(b, 96, 46, 48, 2, '#ABA79C'); R(b, 96, 58, 48, 2, '#5E5A52'); };
    const up = clamp((t - 8) / .6, 0, 1);   // from 8 you climb up onto the seat: from the floor in front of it, in a little arc
    const you = monkeySprite('player', 'down', blink), y = Math.round(54 - up * 32 - Math.sin(up * Math.PI) * 10);
    if (up < 1){ seatFront(); b.drawImage(you, 104, y, 32, 32); }   // standing in front of it (and on your way up)
    else { b.drawImage(you, 104, y, 32, 32); seatFront(); }          // sitting on it: its front hides your legs
    if (t >= 8){   // sparkles round you, up on the seat
      for (let i = 0; i < 10; i++){
        const a = i / 10 * Math.PI * 2 + now / 1600, r = 22 + 4 * Math.sin(now / 300 + i), tw = Math.sin(now / 180 + i * 2);
        if (tw < 0 || up < 1) continue;
        const sx = Math.round(120 + Math.cos(a) * r), sy = Math.round(38 + Math.sin(a) * r * .8);
        R(b, sx, sy, 1, 1, '#FFF6D8'); if (tw > .7){ R(b, sx - 1, sy, 3, 1, '#FFE27A'); R(b, sx, sy - 1, 1, 3, '#FFE27A'); }
      }
    }
    CROWD.forEach(([id, x, y, dir], i) => {   // the troop: looking at you from 3 on, bowing one by one from 5.5
      const bow = t >= 5.5 + i * .25, d = t >= 3 ? dir : 'down';
      if (bow){   // bowing: leaning forward towards you, from the feet, and a little lower
        b.save(); b.translate(x + 16, y + 32); b.rotate(dir === 'right' ? .45 : -.45);
        b.drawImage(monkeySprite(id, d, true), -16, -28, 32, 28); b.restore();
      } else b.drawImage(monkeySprite(id, d, blink && i % 2 === 0), x, y, 32, 32);
    });
    if (t > 11){ b.globalAlpha = clamp((t - 11) / .3, 0, 1); R(b, 0, 0, W, H, '#0B0907'); b.globalAlpha = 1; }   // fading out of the cave
    return;
  }
  const light = 1 - clamp((t - 11.8) / 3.5, 0, 1);   // outside: the sun sets
  drawMountain(light, now, Math.round(W * .5 - 88));
  [['troop2', 96, 60], ['playful', 104, 56], ['player', 112, 53], ['big', 120, 56], ['elder', 128, 60]].forEach(([id, x, y]) =>   // the troop, at home on top
    b.drawImage(monkeySprite(id, 'down', blink), x, y, 16, 16));
  for (let i = 0; i < 8; i++){   // fireflies, once it's dark
    const k = (1 - light) * Math.max(0, Math.sin(now / 400 + i * 1.3));
    if (k > .2){ b.globalAlpha = k; R(b, 84 + Math.floor(rnd(i, 31) * 72) + Math.round(Math.sin(now / 900 + i) * 3), 50 + Math.floor(rnd(i, 32) * 26), 1, 1, '#FFF2A0'); b.globalAlpha = 1; }
  }
  if (t < 11.9){ b.globalAlpha = 1 - clamp((t - 11.3) / .6, 0, 1); R(b, 0, 0, W, H, '#0B0907'); b.globalAlpha = 1; }   // fading in
}
// The troop building the school (chapter 1), at the home ground, close up: on the bare plot, two monkeys carry in wood,
// and the frame goes up, the footing first, then post by post (to 3); the walls go up, plank by plank, with the troop
// hammering (3 to 6); then the grey tiled roof, row by row (6 to 9); then the sign and the lanterns go up, sparkling, and
// the troop turns round and jumps for joy (from 9).
// The building is drawn as on the map, a little narrower, at twice the size.
const BUILDERS = [['big', 8, 66, 'right'], ['troop1', 38, 70, 'right'], ['player', 146, 72, 'left'], ['playful', 172, 70, 'left'], ['elder', 200, 66, 'left']];   // [who, x, y, facing the school]
let siteCanvas = null;
function drawBuildingSchool(t, now){
  const W = VW*T, H = VH*T, blink = now % 3200 < 130;
  for (let y = 0; y < 44; y += 4) R(b, 0, y, W, 4, mix('#8FCBEF', '#CFE9F7', y / 44));   // the sky
  R(b, 0, 30, W, 16, '#8E8A7E'); R(b, 0, 30, W, 2, '#B5B1A4'); R(b, 0, 44, W, 2, '#6A665C');   // the cliff behind the home ground
  R(b, 0, 46, W, H - 46, '#7CC46B');
  for (let i = 0; i < 60; i++) R(b, Math.floor(rnd(i, 41) * W), 46 + Math.floor(rnd(i, 42) * (H - 46)), 1, 1, i % 3 ? '#6CB35C' : '#93D67F');
  const k = (a, d) => clamp((t - a) / d, 0, 1);
  const built = {walls: k(3.2, 2.6), roof: k(6.2, 2.6), sign: t >= 9};
  if (!siteCanvas){ siteCanvas = document.createElement('canvas'); siteCanvas.width = 120; siteCanvas.height = 64; }
  const g = siteCanvas.getContext('2d'); g.clearRect(0, 0, 120, 64);
  schoolFrame(g, {x: 10 / T, y: 14 / T, w: 100 / T, h: 3}, k(.6, 2.4));   // (in the site's own pixels: the school's base is 4 up from its bottom)
  schoolHouse(g, 10, 14, 100, 48, built);
  b.drawImage(siteCanvas, 0, 0, 120, 64, 0, -8, 240, 128);
  if (t < 6.5){   // the pile of wood and stones, getting smaller as it's used
    const left = 3 - Math.floor(k(3.2, 3.2) * 3);
    for (let i = 0; i < left; i++){ R(b, 214, 92 - i * 7, 22, 6, '#6B4A2A'); R(b, 215, 93 - i * 7, 20, 4, '#B98A55'); R(b, 214, 93 - i * 7, 4, 4, '#E2C08E'); }
  }
  BUILDERS.forEach(([id, x, y, dir], i) => {
    const carrying = i < 2 && t < 2.4, walkIn = carrying ? 1 - k(0, 2.2) : 0, X = Math.round(x - walkIn * 90);
    const working = t >= 2.4 && t < 9 && i < 2 && Math.floor(now / 260 + i) % 2 === 0, cheer = t >= 9;
    const hop = cheer ? Math.round(Math.abs(Math.sin(now / 180 + i)) * 6) : working ? 2 : 0;
    const step = carrying && walkIn > 0 ? 1 + Math.floor(now / 160) % 2 : 0;
    b.drawImage(monkeySprite(id, cheer ? 'down' : dir, blink && i % 2 === 0, step, true), X, y - hop, 32, 32);
    if (carrying){ R(b, X + 2, y - 7, 28, 6, '#6B4A2A'); R(b, X + 3, y - 6, 26, 4, '#B98A55'); R(b, X + 25, y - 6, 4, 4, '#E2C08E'); }   // a log, carried over their head
  });
  if (t >= .6 && t < 9){ for (let i = 0; i < 4; i++){ const ph = (now / 500 + i / 4) % 1; b.globalAlpha = 1 - ph; R(b, 70 + i * 30 + Math.round(ph * 6), 90 - Math.round(ph * 14), 2, 2, '#E6DCC8'); } b.globalAlpha = 1; }   // dust
  if (t >= 9) for (let i = 0; i < 10; i++){   // sparkles round the sign
    const a = i / 10 * Math.PI * 2 + now / 1500, tw = Math.sin(now / 170 + i * 2);
    if (tw < 0) continue;
    const sx = Math.round(120 + Math.cos(a) * 36), sy = Math.round(53 + Math.sin(a) * 20);   // (round its sign: 学校)
    R(b, sx, sy, 1, 1, '#FFF6D8'); if (tw > .7){ R(b, sx - 1, sy, 3, 1, '#FFE27A'); R(b, sx, sy - 1, 1, 3, '#FFE27A'); }
  }
}
// The class painting a part of the school with a new colour (after a colour lesson; def.paints: the colour, and its
// lesson series says which part it paints), at the home ground, close up as in the building scene: two monkeys with
// long brushes paint it from left to right, dripping paint, beside a pot of it (from .6 to 3.6); then they turn round,
// and once you press Next, the troop jumps for joy, and the part sparkles.
const PAINTERS = [['big', 0, 64, 84, 166], ['troop1', -62, 68, 30, 112]], WATCHERS = [['elder', 4, 70, 'right'], ['playful', 180, 72, 'left'], ['player', 206, 69, 'left']];   // painters: [who, behind the brushes' edge by, y, from x, to x]
const PAINT_AT = {door:[120, 86, 12, 14], windows:[116, 76, 56, 8], walls:[120, 78, 84, 18], pillars:[120, 78, 84, 18], roof:[120, 30, 84, 14], blossom:[116, 98, 56, 4],
  lanterns:[120, 66, 86, 6], sign:[120, 50, 22, 9], steps:[120, 113, 18, 3]};   // [x, y] the brushes reach to, and the sparkles' spread
function drawPaintingSchool(t, now, def){
  const W = VW*T, H = VH*T, blink = now % 3200 < 130;
  for (let y = 0; y < 44; y += 4) R(b, 0, y, W, 4, mix('#8FCBEF', '#CFE9F7', y / 44));   // the sky
  R(b, 0, 30, W, 16, '#8E8A7E'); R(b, 0, 30, W, 2, '#B5B1A4'); R(b, 0, 44, W, 2, '#6A665C');   // the cliff behind the home ground
  R(b, 0, 46, W, H - 46, '#7CC46B');
  for (let i = 0; i < 60; i++) R(b, Math.floor(rnd(i, 41) * W), 46 + Math.floor(rnd(i, 42) * (H - 46)), 1, 1, i % 3 ? '#6CB35C' : '#93D67F');
  const part = paintsPart(def.paints), colour = PAINT[def.paints] || '#888888', k = clamp((t - .6) / 3, 0, 1);
  const [ax, ay, sx, sy] = PAINT_AT[part] || [120, 80, 60, 10];
  if (!siteCanvas){ siteCanvas = document.createElement('canvas'); siteCanvas.width = 120; siteCanvas.height = 64; }
  const g = siteCanvas.getContext('2d'); g.clearRect(0, 0, 120, 64);
  schoolHouse(g, 10, 14, 100, 48, {walls:1, roof:1, sign:true, paint:{...paintedParts(), [part]:def.paints}, wipe:{part, k}});
  b.drawImage(siteCanvas, 0, 0, 120, 64, 0, -8, 240, 128);
  R(b, 216, 96, 14, 11, '#6B6B6B'); R(b, 217, 97, 12, 9, '#9A9A9A'); R(b, 216, 95, 14, 2, '#4E4E4E'); R(b, 217, 95, 12, 1, colour); R(b, 218, 98, 2, 6, colour);   // the pot of paint, a drip down its side
  const edge = -28 + 296 * k, done = t >= 3.7, cheer = t >= 4.4;
  WATCHERS.forEach(([id, x, y, dir], i) => {
    const hop = cheer ? Math.round(Math.abs(Math.sin(now / 180 + i)) * 6) : 0;
    b.drawImage(monkeySprite(id, cheer ? 'down' : dir, blink && i % 2 === 0, 0, true), x, y - hop, 32, 32);
  });
  PAINTERS.forEach(([id, off, y, from, to], i) => {
    const tx = clamp(edge + off, ax - 110, ax + 110), x = Math.round(clamp(tx - 16, from, to));   // (each along their own stretch of the wall, reaching with the brush)
    const hop = cheer ? Math.round(Math.abs(Math.sin(now / 180 + i + 2)) * 6) : 0, step = !done && k > 0 && k < 1 ? 1 + Math.floor(now / 160 + i) % 2 : 0;
    b.drawImage(monkeySprite(id, done ? 'down' : 'up', blink && i, step, true), x, y - hop, 32, 32);
    if (done) return;
    const hx = x + 16, hy = y + 14, by = Math.round(ay + Math.sin(now / 90 + i * 2) * 3), bx = Math.round(clamp(tx, 4, 236));   // the brush, on a long handle, brushing up and down
    const n = Math.max(Math.abs(bx - hx), Math.abs(by - hy)) || 1;
    for (let j = 0; j <= n; j++) R(b, Math.round(hx + (bx - hx) * j / n) - 1, Math.round(hy + (by - hy) * j / n) - 1, 3, 3, '#4A2C17');   // (dark edges, light wood: it shows up on any paint)
    for (let j = 0; j <= n; j++) R(b, Math.round(hx + (bx - hx) * j / n), Math.round(hy + (by - hy) * j / n), 1, 1, '#E2C08E');
    R(b, bx - 3, by - 2, 7, 5, '#C9A26B'); R(b, bx - 3, by + 1, 7, 3, colour);
    if (k > 0 && k < 1) for (let d = 0; d < 3; d++){   // drips of paint, falling
      const ph = (now / 420 + d / 3 + i * .17) % 1; b.globalAlpha = 1 - ph;
      R(b, bx - 2 + d * 2, by + 4 + Math.round(ph * 16), 2, 2, colour); b.globalAlpha = 1;
    }
  });
  if (cheer) for (let i = 0; i < 12; i++){   // sparkles over the newly painted part
    const a = i / 12 * Math.PI * 2 + now / 1500, tw = Math.sin(now / 170 + i * 2);
    if (tw < 0) continue;
    const px = Math.round(ax + Math.cos(a) * sx), py = Math.round(ay + Math.sin(a) * sy);
    R(b, px, py, 1, 1, '#FFF6D8'); if (tw > .7){ R(b, px - 1, py, 3, 1, '#FFE27A'); R(b, px, py - 1, 1, 3, '#FFE27A'); }
  }
}

/* ---- the view from the hillside's lookout ---- */
// What you see from the lookout on the hillside, told like the opening (decided 23 October 2026: a far view is a
// picture, never part of the map, where the sea looked out of place): the sky, with clouds drifting by and two birds
// flying past; the sea out to the horizon, with islands far off; the hillside going down to it either side, its trees,
// and the river winding out to the sea; and you, at the lookout's railing, looking out. The captions cover the bottom,
// so it's all above them.
function drawLookout(t, now){
  const W = VW*T, hz = 46;
  for (let y = 0; y < hz; y += 2) R(b, 0, y, W, 2, mix('#6AB4E2', '#D6EEF7', y / hz));   // the sky
  const cloud = cloudPuff, drift = t * 1.2;   // (the clouds drift slowly to the right)
  cloud(18 + drift, 12, 1); cloud(140 + drift * .7, 8, 1.3); cloud(204 + drift * .5, 26, .7);
  for (const [k, by] of [[0, 20], [.12, 25]]){   // two birds flying past
    const bx = Math.round(-10 + ((t * 22 + k * 260) % 280)), flap = Math.sin(now / 90 + k * 9) > 0;
    R(b, bx - 2, by + (flap ? 0 : 1), 2, 1, '#3A4A5A'); R(b, bx, by + 1, 1, 1, '#3A4A5A'); R(b, bx + 1, by + (flap ? 0 : 1), 2, 1, '#3A4A5A');
  }
  for (let x = 0; x < W; x++){   // islands, far off on the horizon
    const isle = (c, w, h) => Math.max(0, Math.round(h * (1 - ((x - c) / w) ** 2)));
    const hh = Math.max(isle(178, 20, 6), isle(198, 9, 3), isle(62, 11, 3));
    if (hh) R(b, x, hz - hh, 1, hh, '#93B6C8');
  }
  for (let y = hz; y < 80; y += 2) R(b, 0, y, W, 2, mix('#68B0DE', '#2F78B4', (y - hz) / 34));   // the sea
  R(b, 0, hz, W, 1, '#A9D7F0');
  for (let i = 0; i < 22; i++){ const sx = Math.floor(rnd(i, 31) * W), sy = hz + 3 + Math.floor(rnd(i, 32) * 14); if (Math.sin(now / 420 + i) > .2) R(b, sx, sy, 3, 1, '#D6F2FF'); }   // sun on the sea
  for (let x = 0; x < W; x += 2){ const h = Math.round(60 + Math.sin(x / 19) * 2 + Math.sin(x / 7)); R(b, x, h, 2, 100 - h, '#6FA889'); }   // the land along the shore
  for (let y = 62; y < 100; y++){   // the river, winding out to the sea
    const rx = Math.round(118 + Math.sin(y / 7) * 8 + (y - 62) * .4), w = 2 + Math.floor((y - 62) / 13);
    R(b, rx, y, w, 1, '#5FA6D6'); if (y === 62) R(b, rx - 1, y - 1, w + 2, 1, '#5FA6D6');
  }
  const slope = (from, to, top, bot, col, seed) => {   // the hillside going down, one side of the view
    for (let x = from; x !== to; x += Math.sign(to - from) * 2){
      const k = Math.abs(x - from) / Math.abs(to - from), h = Math.round(top + (bot - top) * Math.pow(k, .8) + rnd(x >> 1, seed) * 2);
      R(b, Math.min(x, x - 1), h, 2, 120 - h, col); R(b, Math.min(x, x - 1), h, 2, 1, mix(col, '#A9E08F', .5));
    }
    for (let i = 0; i < 22; i++){   // its trees
      const k = rnd(i, seed) * .9, x = Math.round(from + (to - from) * k), y = Math.round(top + (bot - top) * Math.pow(k, .8)) + 4 + Math.floor(rnd(i, seed + 1) * 24);
      if (y < 110){ disc(b, x, y, 3, '#2F7A3E'); disc(b, x - 1, y - 1, 1, '#4E9A55'); }
    }
  };
  slope(0, 104, 54, 120, '#4F9A55', 51); slope(W, 150, 58, 120, '#468F4D', 61);
  R(b, 0, 100, W, 60, '#B9B3A5'); R(b, 0, 100, W, 1, '#D6D1C4');   // the lookout's flat rock
  for (let i = 0; i < 30; i++) R(b, Math.floor(rnd(i, 71) * W), 102 + Math.floor(rnd(i, 72) * 20), 2, 1, i % 3 ? '#A7A193' : '#CFCABD');
  b.drawImage(monkeySprite('player', 'up', false), 104, 74, 32, 32);   // you, looking out
  for (const px of [4, 46, 88, 147, 189, 231]){ R(b, px, 88, 5, 40, WOOD[0]); R(b, px, 88, 4, 40, WOOD[2]); R(b, px, 88, 1, 40, WOOD[3]); R(b, px, 88, 5, 1, WOOD[4]); }   // the railing
  for (const ry of [92, 101]){ R(b, 0, ry, W, 4, WOOD[0]); R(b, 0, ry, W, 3, WOOD[2]); R(b, 0, ry, W, 1, WOOD[3]); }
}
// A puffy white cloud in a scene's sky: its left end at cx, cy; s, its size.
function cloudPuff(cx, cy, s){
  cx = Math.round(cx); const r = k => Math.round(k * s);
  disc(b, cx, cy, r(5), '#FFFFFF'); disc(b, cx + r(7), cy - r(3), r(7), '#FFFFFF'); disc(b, cx + r(15), cy, r(5), '#FFFFFF');
  R(b, cx - r(4), cy, r(24), r(5), '#FFFFFF'); R(b, cx - r(4), cy + r(5), r(24), 1, '#C9DFEC');
}
// The gate of heaven in the clouds, 南天门 (the Southern Gate of Heaven), in the opening (drawHeaven), and the two gods who
// step out from behind its pillars (k: how far out they are, 0 to 1; x0: where it's drawn from). In the book, when you were
// born and light shone from your eyes, the Jade Emperor sent these two out of this gate to see and hear what it was:
// Thousand-Mile Eye (千里眼) and Wind-Following Ear (顺风耳). The book doesn't say how they look, so they're drawn as temples
// show them (decided 23 October 2026), in armour, each with a horned helmet: Thousand-Mile Eye red-faced, his eyes wide and
// his mouth shut, a hand held flat over his brow to see far; Wind-Following Ear green-faced, his mouth open, cupping a huge
// ear (temples pair one red face with one green; which is which varies from place to place).
const GODS = {
  eye: sprite(["......Hh...hH.", "......hh...hH.", ".....ooooooooo", ".....ogggggggo", "oooooooooooRro", "opppppppppoRro", "ooooooooooorro",
    "orRo.orwkrwkro", "orRo.orwwrwwro", "orRo.orrrrrrro", ".orRoorbbbbbro", ".orRooRrrrrRo.", "..oaaaoyyyyyo.", "..oaAaaaaaAaao", "..oaaaaaaaaaao"],
    {o:'#2A1A14', h:'#F2E6C4', H:'#C9B98E', g:'#E8B83E', p:'#F08A70', r:'#D9503F', R:'#B23A2E', w:'#FFFFFF', k:'#141414', b:'#4A1E14', y:'#E8B83E', a:'#3B5FA0', A:'#6C8FD0'}),
  ear: sprite(["....hH..........", "....hh..........", "ooooooooo.......", "ogggggggo.......", "offfffffo.ooo...", "ofwkffwkfoeeeo.c", "ofwwffwwfoeEeocc",
    "offfffffoeEEeocc", "ofnnnnnffoeEeocc", "oftnnntfooeeeoc.", ".offffffo.oooc..", "..oyyyyyo..cc...", ".ommmmmmmo......", "ommmmymmmmo....."],
    {o:'#1E2A1A', h:'#F2E6C4', H:'#C9B98E', g:'#E8B83E', f:'#4FA65A', e:'#5FBB6A', E:'#2F6E38', c:'#8FD88F', w:'#FFFFFF', k:'#141414', n:'#3A1010', t:'#FFFFFF', y:'#E8B83E', m:'#B8322A'})
};
function heavenGate(k, x0){
  const red = '#B8322A', redD = '#7E1F18', gold = '#E8B83E', goldD = '#A8771E', goldL = '#F8DC80', jade = '#5FB49C';
  b.save(); b.translate(0, 4);
  disc(b, x0 + 25, 25, 14, '#FFF3C8'); disc(b, x0 + 25, 25, 9, '#FFFBEA');   // the light of heaven, through the gateway
  const L = x0 + 6, Rx = x0 + 44, hide = Math.round((1 - k) * 15);   // the pillars' outer edges; how far in the gods still are
  b.save(); b.beginPath(); b.rect(0, 0, L, 60); b.clip(); b.drawImage(GODS.eye, L - 13 + hide, 13); b.restore();   // Thousand-Mile Eye, out from behind the left pillar
  b.save(); b.beginPath(); b.rect(Rx, 0, 240, 60); b.clip(); b.drawImage(GODS.ear, Rx - 2 - hide, 13); b.restore();   // Wind-Following Ear, out from behind the right
  for (const px of [L, Rx - 4]){ R(b, px, 13, 4, 23, red); R(b, px + 3, 13, 1, 23, redD); R(b, px - 1, 13, 6, 2, gold); R(b, px - 1, 33, 6, 2, gold); }   // its pillars, gold at top and foot
  R(b, x0 + 2, 10, 46, 3, red); R(b, x0 + 2, 12, 46, 1, redD);   // the beam across
  R(b, x0 + 4, 8, 42, 2, jade); for (let i = x0 + 5; i < x0 + 45; i += 4) R(b, i, 8, 2, 1, goldL);   // its painted brackets
  for (let y = 4; y < 8; y++){ const w = 52 - (7 - y) * 2; R(b, x0 + 25 - w / 2, y, w, 1, y % 2 ? gold : goldL); }   // the lower roof, golden tiles
  R(b, x0 - 2, 3, 2, 1, gold); R(b, x0 + 50, 3, 2, 1, gold);   // its eaves, turned up
  for (let y = 0; y < 3; y++){ const w = 30 - (2 - y) * 2; R(b, x0 + 25 - w / 2, y, w, 1, y % 2 ? goldL : gold); }   // the upper roof
  R(b, x0 + 9, 0, 2, 1, goldD); R(b, x0 + 39, 0, 2, 1, goldD);
  R(b, x0 + 11, 15, 28, 13, gold); R(b, x0 + 12, 16, 26, 11, '#24365F');   // the plaque, hung under the beam
  write(b, '南天门', x0 + 14, 17, goldL);   // its name, the Southern Gate of Heaven
  cloudPuff(x0 - 8, 36, 1); cloudPuff(x0 + 14, 38, .9); cloudPuff(x0 + 36, 36, 1);   // the clouds it stands on
  b.restore();
}
// The pictures for the area's scenes (AREA.scenes), by name (a scene's art, or else its id); the opening's are drawScene, above.
const SCENE_ART = {becomingKing: drawBecomingKing, buildingSchool: drawBuildingSchool, paintingSchool: drawPaintingSchool, lookout: drawLookout};
