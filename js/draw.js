// Drawing each frame: the world, characters, sparkles and task arrows, and the opening scene.

/* ---- per-frame drawing ---- */
let bigSparkles = false;   // a twinkle that grows bigger, while the area's bigSparkles matches, such as while you learn your first words (set each frame)
// A sparkle on something whose word you don't know yet (ph: its own timing, so they don't all twinkle together): a twinkle
// now and then, out for most of the time (decided 25 October 2026: on for two thirds of the time, a little over a second
// and a half apart, was too much). Bigger while bigSparkles matches, such as till you know your first 4 words, and a
// little more often.
const SPARKLE = {every:3400, on:.28}, BIG_SPARKLE = {every:2600, on:.4};
function sparkle(X, Y, now, ph){
  const c = bigSparkles ? BIG_SPARKLE : SPARKLE, p = ((now + ph * 613) % c.every) / c.every;
  if (p >= c.on) return;
  const k = Math.sin(p / c.on * Math.PI);   // (in, then out again)
  if (bigSparkles){   // growing to arms of 3, with a faint glow, just at its brightest
    const n = k > .8 ? 3 : k > .45 ? 2 : 1;
    if (n === 3) R(b, X-1, Y-1, 3, 3, 'rgba(255,226,122,.3)');
    for (let i = 1; i <= n; i++){ R(b, X-i, Y, 1, 1, '#FFE27A'); R(b, X+i, Y, 1, 1, '#FFE27A'); R(b, X, Y-i, 1, 1, '#FFE27A'); R(b, X, Y+i, 1, 1, '#FFE27A'); }
    R(b, X, Y, 1, 1, '#FFFFFF');
    return;
  }
  R(b, X, Y, 1, 1, '#FFFFFF');
  if (k < .3) return;
  R(b, X-1, Y, 1, 1, '#FFE27A'); R(b, X+1, Y, 1, 1, '#FFE27A'); R(b, X, Y-1, 1, 1, '#FFE27A'); R(b, X, Y+1, 1, 1, '#FFE27A');
  if (k > .8){ R(b, X-2, Y, 1, 1, '#FFE27A'); R(b, X+2, Y, 1, 1, '#FFE27A'); R(b, X, Y-2, 1, 1, '#FFE27A'); R(b, X, Y+2, 1, 1, '#FFE27A'); }
}
// Who's speaking to you (decided 6 November 2026, after mock-ups: it wasn't always clear who was talking, in a crowd): the
// one whose line is in the speech box (talkWho, js/draw.js; none once it closes), with a small gold arrow over their
// head, bobbing, in place of their ! or ?, and a faint gold ring at their feet.
const SPEAKER_GOLD = '#E3B54E', SPEAKER_INK = '#2A2622', SPEAKER_RING = 'rgba(227,199,126,.85)';   // (the ring: css --plate, the name plate's outline)
const speakingNow = n => !!talkWho && talkWho === n.id && !talkBox.hidden;
function speakerArrow(X, Y){   // pointing down, 9 pixels wide: X, Y its top left
  R(b, X, Y, 9, 1, SPEAKER_INK);
  [[1, 7], [2, 5], [3, 3], [4, 1]].forEach(([dy, w], i) => { const x0 = X + i + 1; R(b, x0 - 1, Y + dy, 1, 1, SPEAKER_INK); R(b, x0, Y + dy, w, 1, i ? SPEAKER_GOLD : '#F2D27A'); R(b, x0 + w, Y + dy, 1, 1, SPEAKER_INK); });
  R(b, X + 4, Y + 5, 1, 1, SPEAKER_INK);
}
function speakerRing(X, Y){   // a flat ring round their feet
  R(b, X + 4, Y + 13, 8, 1, SPEAKER_RING); R(b, X + 4, Y + 17, 8, 1, SPEAKER_RING);
  R(b, X + 2, Y + 14, 2, 1, SPEAKER_RING); R(b, X + 12, Y + 14, 2, 1, SPEAKER_RING); R(b, X + 2, Y + 16, 2, 1, SPEAKER_RING); R(b, X + 12, Y + 16, 2, 1, SPEAKER_RING);
  R(b, X + 1, Y + 15, 1, 1, SPEAKER_RING); R(b, X + 14, Y + 15, 1, 1, SPEAKER_RING);
}
function bubble(X, Y, ch){
  if (ch === 'speaker') return speakerArrow(X, Y);
  R(b, X, Y, 7, 9, '#1E2B26'); R(b, X+1, Y+1, 5, 7, '#FFFFFF'); R(b, X+3, Y+9, 1, 1, '#1E2B26');
  if (ch === '!'){ R(b, X+3, Y+2, 1, 3, '#C0392B'); R(b, X+3, Y+6, 1, 1, '#C0392B'); }
  else if (ch === 'note'){ R(b, X+4, Y+2, 1, 4, '#2E5E9A'); R(b, X+5, Y+2, 1, 1, '#2E5E9A'); R(b, X+2, Y+5, 2, 2, '#2E5E9A'); R(b, X+3, Y+5, 1, 1, '#2E5E9A'); }   // a note: someone calling out, or singing
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
  } else if (look === 'sea'){   // the sea: glints, and where it laps the sand, foam washing up and back
    for (let k = 0; k < 2; k++){
      const ph = rnd(x, y, k+230) * 6.28, s = Math.sin(now/600 + ph);
      if (s > .6){ const px = 2 + Math.floor(rnd(x,y,k+240)*10), py = 3 + Math.floor(rnd(x,y,k+250)*10); R(b, X+px, Y+py, 3, 1, '#9CCDEB'); }
    }
    if (y > 0 && tileAt(x, y-1).look === 'sand'){
      const w = Math.round((Math.sin(now/700 + x * .6) + 1) * 2);   // the wave runs up the sand, and back
      R(b, X, Y - w, T, 2, '#F4FBFF'); R(b, X, Y - w + 2, T, 1, 'rgba(244,251,255,.5)');
    }
  } else if (look === 'shallows'){   // shrimp in clear water, one every other square: drifting over the pebbles, flicking backwards now and then
    if ((x * 7 + y * 3) % 2) return;
    const k = ((now + x * 997 + y * 577) % 4000) / 4000, flick = k > .85 ? (k - .85) / .15 : 0, dir = (x + y) % 2 ? 1 : -1;
    const sx = Math.round(X + 5 + dir * (Math.sin(k * 6.28) * 2 - flick * 5)), sy = Math.round(Y + 6 + Math.cos(k * 6.28) * 2);
    const h = dir > 0 ? sx + 4 : sx - 1, t = dir > 0 ? sx - 1 : sx + 5;   // its head end, and its tail end
    R(b, sx, sy, 5, 2, 'rgba(244,150,130,.9)'); R(b, sx, sy, 5, 1, 'rgba(255,205,190,.9)');   // its body, see-through pink
    R(b, t, sy + 1, 1, 2, 'rgba(220,110,95,.9)');                                            // its tail, curled under
    R(b, h, sy - 1, 1, 1, 'rgba(40,30,30,.8)');                                              // its eye
    R(b, dir > 0 ? h + 1 : h - 3, sy - 2, 3, 1, 'rgba(150,80,70,.55)');                      // its feelers
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
  // with nobody here to build it, such as when the troop is hiding in the human world's chapter 2, its stones just lie
  // where they fell (decided 7 November 2026, after playing it: they stacked themselves up with nobody there)
  if (!NPCS.some(c => PLAYS[c.id] === 'tower')){ TOWER_LANDS.forEach(([dx, dy], i) => towerStone(X + 8 + dx, Y + 12 + dy, TOWER_WIDE[i])); return; }
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
  else if (kind === 'bathe') drawBather(n, X, Y, now);
  else if (!playing(n)) drawEntityMonkey(n.kind, X, Y, n.dir, now, Math.floor(now/700 + n.x) % 2, 0, n.x + n.y);
  else if (kind === 'tower') drawTowerBuilder(n, X, Y, now);
  else if (kind === 'dragonflies') drawChaser(n, X, Y, now);
  else if (kind === 'groom') drawGroomer(n, X, Y, now);
  else if (kind === 'peer') drawPeerer(n, X, Y, now);
  else if (kind === 'fish') drawFisher(n, X, Y, now);
}
// A monkey fishing (plays: 'fish'), such as the fishing monkey by the home ground's stream: facing the water, its rod held
// out over it, the line down to its float in the water in front of it, bobbing.
function drawFisher(n, X, Y, now){
  const d = n.home.facing;
  drawEntityMonkey(n.kind, X, Y, d, now, 0, 0, n.x + n.y);
  drawRod(X, Y, d, now + n.x * 500, false);
}
// A fishing rod held out over the water by a monkey at X, Y facing dir (yours as you fish, js/fishing.js, and the fishing
// monkey's): bamboo from its hand out over the water in front of it, and the line hanging from its tip to the float on the
// water, bobbing gently; or, with a fish biting (bite), pulled under, rings spreading round it.
const ROD = {down:{hand:[12, 10], tip:[15, 19], float:[15, 25]}, up:{hand:[3, 10], tip:[1, -13], float:[1, -6]},
  left:{hand:[3, 10], tip:[-10, 1], float:[-10, 11]}, right:{hand:[12, 10], tip:[25, 1], float:[25, 11]}};   // from the monkey's top-left
function drawRod(X, Y, dir, now, bite){
  const r = ROD[dir], [hx, hy] = [X + r.hand[0], Y + r.hand[1]], [tx, ty] = [X + r.tip[0], Y + r.tip[1]], [fx, fy] = [X + r.float[0], Y + r.float[1]];
  const line = (x0, y0, x1, y1, c, w = 1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) R(b, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), w, w, c); };
  line(hx, hy, tx, ty, '#6E5220', 2); line(hx, hy, tx, ty, '#D8B860');   // the bamboo, with its shine
  const bob = bite ? 0 : Math.round(Math.sin(now / 320));
  line(tx, ty, fx, fy - 3 + bob, 'rgba(244,241,234,.8)');                   // the line
  if (fishing && fishing.nibble && !bite){   // a nibble (a shrimp's, before it bites): the float twitches, tiny rings round it
    const k = (now / 140) % 4, dip = k < 1 ? 1 : 0;
    R(b, fx - 3 - Math.round(k), fy + 1, 7 + Math.round(k) * 2, 1, 'rgba(255,255,255,.6)');
    R(b, fx - 1, fy - 3 + dip, 3, 2, '#E8343C'); R(b, fx - 1, fy - 1 + dip, 3, 1, '#F4F1EA'); return;
  }
  if (bite){
    const k = (now / 90) % 6;   // rings spreading round where it's gone under
    for (const rr of [k, (k + 3) % 6]){ const w = 4 + Math.round(rr) * 2; R(b, fx - w/2, fy, w, 1, 'rgba(255,255,255,.75)'); }
    R(b, fx - 1, fy - 1, 3, 1, '#E8343C');
  } else { R(b, fx - 1, fy - 4 + bob, 3, 2, '#E8343C'); R(b, fx - 1, fy - 2 + bob, 3, 1, '#F4F1EA'); R(b, fx - 2, fy - 1 + bob, 5, 1, 'rgba(255,255,255,.45)'); }
}
// A monkey of the troop looking for mushrooms under the pines (plays: 'peer'), facing them: now and then it crouches to look
// closely, its head and body lower, over its legs, its feet where they were.
function drawPeerer(n, X, Y, now){
  const spr = monkeySprite(n.kind, n.home.facing, (now + n.x * 977) % 3600 < 130);
  R(b, X+4, Y+15, 8, 1, 'rgba(0,0,0,.22)'); R(b, X+3, Y+14, 10, 1, 'rgba(0,0,0,.12)');
  if ((now + n.x * 613) % 2600 >= 1000){ b.drawImage(spr, X, Y); return; }
  b.drawImage(spr, 0, 0, 16, 12, X, Y + 2, 16, 12); b.drawImage(spr, 0, 12, 16, 4, X, Y + 12, 16, 4);   // (crouching)
}
// Grooming the other one, or being groomed, taking turns (groomAt): both sit side-on, facing the same way, one behind the
// other, as monkeys groom. The one in front sits still, eyes shut, enjoying it (a heart rose from it now and then till 30 October 2026, taken out after playing it);
// the one behind shuffles up close, its two hands in the fur of its friend's back, picking through it in turn, its head
// dipping in to look closely, and now and then a hand goes up to its mouth (a flea!: in the book, 捉虱子, they pick out
// each other's fleas). Decided 27 October 2026, from a mock-up: the groomer stood beside its friend, its arm a long thin
// line up to its head, which looked like a stick, and before that its hand was low down by its lap, which could be taken
// for something rude. Its hands are only ever on its friend's back (GROOM_BACK), never in front of it.
const GROOM_CLOSE = 4, GROOM_LEAN = 520, GROOM_PICK = 260;   // how far the groomer shuffles up (pixels); how often its head dips, and its hands pick (ms)
const GROOM_EAT = [4200, 3400];   // every so often (ms), and from when: a flea to its mouth
const GROOM_BACK = [8, 12];   // how far down the friend's back its hands go: from below its ear to the middle of its back
function groomRoles(n, now){   // who's who: the groomer, the one it grooms, and which way they both face
  const friend = NPCS.find(c => c !== n && PLAYS[c.id] === 'groom'), left = !friend || n.x < friend.x, leftGrooms = groomAt(now).who === 0;
  return {friend, left, grooming:left === leftGrooms, dir:leftGrooms ? 'right' : 'left'};
}
function drawGroomer(n, X, Y, now){
  const {friend, grooming, dir} = groomRoles(n, now), both = friend && playing(friend), t = now % GROOM_MS;
  const toward = dir === 'right' ? 1 : -1, dx = !both ? 0 : grooming ? GROOM_CLOSE * toward : -toward;   // the groomer up behind; the other leant back a little
  R(b, X + 3 + dx, Y + 15, 10, 1, 'rgba(0,0,0,.22)');
  b.drawImage(sittingSprite(n.kind, dir, !grooming && both, grooming && both && Math.floor(t / GROOM_LEAN) % 2 === 1), X + dx, Y);   // (eyes shut, or its head dipping)
  if (both && NPCS.indexOf(n) > NPCS.indexOf(friend)) groomingHands(grooming ? n : friend, grooming ? friend : n, X, Y, now, n);   // (by the one drawn last, over both)
}
// The groomer's hands in the fur of its friend's back, and its arms, short, fur, reaching from its chest.
// X, Y: where the one drawing them (me) is.
function groomingHands(g, f, X, Y, now, me){
  const {dir} = groomRoles(g, now), right = dir === 'right', t = now % GROOM_MS, pal = PALS[g.kind] || PALS.player;
  const gX = X + (g.x - me.x) * T + (right ? GROOM_CLOSE : -GROOM_CLOSE), fX = X + (f.x - me.x) * T + (right ? -1 : 1);   // the groomer's sprite, and its friend's
  const back = right ? fX + 4 : fX + 10, chest = right ? gX + 11 : gX + 4;   // its friend's back; where its arms come from
  const pick = Math.floor(now / GROOM_PICK) % 2, eat = t % GROOM_EAT[0] > GROOM_EAT[1];
  const hand = (x, y) => {   // an arm, from its chest, and its fingers (skin) in the fur at x, y
    const [x0, x1] = right ? [chest, x - 1] : [x + 2, chest];
    for (let ax = x0; ax <= x1; ax++){ R(b, ax, y, 1, 2, pal.f); R(b, ax, y + 2, 1, 1, pal.o); }
    R(b, x, y, 2, 2, pal.s);
  };
  if (!eat) hand(back - (right ? 1 : 0), Y + GROOM_BACK[0] + pick);
  hand(back + (right ? 1 : -1), Y + GROOM_BACK[1] - 1 - pick);
  if (eat){ const mx = right ? gX + 12 : gX + 2; R(b, mx, Y + 8, 2, 2, pal.s); }   // the other at its mouth: a flea!
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
// A monkey of the troop bathing in a warm pool (plays: 'bathe'), as monkeys do in hot springs (or a pupil in the cave's
// cool pool on a hot summer's day): in up to its shoulders, its eyes shut, bobbing a little, a ripple spreading round it;
// talking to you, it opens them and looks your way.
function drawBather(n, X, Y, now){
  const at = playing(n), line = 11, sink = 2 + Math.floor(now / 1300 + n.x) % 2;
  const ph = (now / 1700 + n.x * .37) % 1, rx = 6 + Math.round(ph * 4);
  b.globalAlpha = .7 * (1 - ph); R(b, X + 8 - rx, Y + line, 3, 1, '#A8E6DE'); R(b, X + 6 + rx, Y + line, 3, 1, '#A8E6DE'); b.globalAlpha = 1;
  b.drawImage(monkeySprite(n.kind, at ? 'down' : n.dir, at), 0, 0, 16, line - sink, X, Y + sink, 16, line - sink);
  R(b, X + 2, Y + line, 12, 1, '#A8E6DE');   // the water round it
}
// You, in a brook up to your shoulders, as a bather is: off a stepping stone that tipped (hopAcross, js/world.js), sinking
// as the water closes round you.
function drawDunked(PX, PY, now){
  const line = 12, sink = Math.min(3, Math.round((now - dunkT) / 40));   // (in up to its shoulders, its face out of the water)
  b.drawImage(monkeySprite('player', pl.dir, true, 0, true), 0, 0, 16, line - sink, PX, PY + sink, 16, line - sink);   // (eyes shut, as you go in)
  R(b, PX + 2, PY + line, 12, 1, '#D6F2FF');
}
// The pictures over the row of stepping stones you're facing (hopAhead, js/world.js), one over each stone, bobbing a
// little: drawn onto the screen itself, over the map, so they're as sharp as a word's picture on a card. Not while
// you're hopping, or answering its question.
const hopPics = {};
function drawHopPics(now){
  const row = mode === 'play' && !busy && !pl.mv && modal.hidden && hopAhead(), q = row && hopQuestion(row);
  if (!q) return;
  const k = cv.width / (VW*T), size = Math.max(32, Math.round(13 * k / 32) * 32), cx = camX(), cy = camY();   // (each of a picture's pixels a whole number of the screen's)
  sc.imageSmoothingEnabled = false;
  row.forEach(([x, y], i) => {
    const w = q.opts[i], p = PICTURES[w];
    if (!p) return;
    const bob = Math.sin(now / 380 + i * 2.1) * .8;
    sc.drawImage(hopPics[w] || (hopPics[w] = sprite(p.rows, p.palette)), Math.round((x*T - cx + 8) * k - size / 2), Math.round((y*T - cy + 4 + bob) * k - size / 2), size, size);
  });
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
// What your monkey has turned into (the turnInto step, js/world.js), over where you'd be: an animal as it looks on the map,
// anything else its picture, small; and the puff of smoke as you change (PUFF_MS).
const PUFF_MS = 450, FORMS = {};
// Eating a meal (the eat step, js/world.js): what you're eating, its picture small in your hands, bobbing as you munch,
// a little steam rising off it, and hearts as you finish.
function drawEating(e, X, Y, now){
  const t = (now - e.t0) / EAT_MS, pic = PICTURES[e.w], munch = Math.floor(now / 160) % 2;
  const c = pic && (FORMS['eat ' + e.w] || (FORMS['eat ' + e.w] = sprite(pic.rows, pic.palette)));
  if (c) b.drawImage(c, X + 3, Y + 9 - munch, 10, 10);   // (in your hands)
  for (let i = 0; i < 2; i++){ const k = (now / 700 + i / 2) % 1; b.globalAlpha = .6 * (1 - k); R(b, X + 6 + i * 4 + Math.round(Math.sin(now / 200 + i) * 1), Y + 5 - Math.round(k * 8), 1, 2, '#FFFFFF'); }
  b.globalAlpha = 1;
  if (t > .6) for (let i = 0; i < 2; i++){ const y = Y - 4 - Math.round((t - .6) * 20) - i * 4, x = X + 3 + i * 8; R(b, x, y, 2, 1, '#E0443C'); R(b, x + 3, y, 2, 1, '#E0443C'); R(b, x, y + 1, 5, 1, '#E0443C'); R(b, x + 1, y + 2, 3, 1, '#E0443C'); R(b, x + 2, y + 3, 1, 1, '#E0443C'); }
}
function drawForm(w, X, Y, now, step = 0, dir = 'down'){
  const def = MAP_SPRITES[w];
  if (def){   // something with a map picture of its own, such as a little demon or a cat: as the map's own are drawn, turned the way you face, its legs stepping as you walk (decided 7 November 2026, after playing it: it slid along, your monkey poking out under it)
    if (dir === 'left' || dir === 'right') formSide = dir;
    const spr = mapSprite(w), img = def.faces && (formSide || def.faces) !== def.faces ? mirrored(spr) : spr;
    figureShadow(w, X, Y, .2);
    const x0 = X - (img.width - T) / 2, y0 = Y - (img.height - T);
    if (!step){ b.drawImage(img, x0, y0); return; }
    const iw = img.width, ih = img.height, legs = legsFrom(w), half = iw / 2, k = step === 1 ? 1 : -1;
    b.drawImage(img, 0, 0, iw, legs, x0, y0 - 1, iw, legs);   // its body, a pixel up as it steps
    b.drawImage(img, 0, legs, half, ih - legs, x0 - k, y0 - 1 + legs, half, ih - legs);   // its legs, swinging in turn
    b.drawImage(img, half, legs, half, ih - legs, x0 + half + k, y0 - 1 + legs, half, ih - legs);
    return;
  }
  const pic = PICTURES[w], c = pic && (FORMS[w] || (FORMS[w] = sprite(pic.rows, pic.palette)));
  if (!c) return;
  R(b, X + 2, Y + 14, 12, 2, 'rgba(0,0,0,.25)');
  b.drawImage(c, X - 3, Y - 6 - (step ? 1 : 0), 22, 22);   // (something with no legs, such as a pine: a little hop as it goes)
}
let formSide = null;   // (the way a form that faces one way, such as a cat, was last turned: left or right)
function drawPuff(X, Y, p){
  b.globalAlpha = 1 - p;
  for (let i = 0; i < 7; i++){ const a = i / 7 * Math.PI * 2, r = 4 + p * 9; oval(b, Math.round(X + 8 + Math.cos(a) * r), Math.round(Y + 8 + Math.sin(a) * r * .8), 4, 3, i % 2 ? '#F2F2EE' : '#D6D8DC'); }
  b.globalAlpha = 1;
}
// A little one (small, in the area's characters: a baby monkey, born while you were away) is drawn smaller, at the bottom
// of its square (SMALL_PX of a square's 16).
const SMALL_PX = 11, SMALL = new Set(ALL_NPCS.filter(n => n.small).map(n => n.id));
function drawEntityMonkey(kind, X, Y, dir, now, bob, step = 0, seed = 0){
  const blink = (now + seed*977) % 3600 < 130;
  if (SMALL.has(kind)){
    R(b, X+5, Y+15, 6, 1, 'rgba(0,0,0,.22)');
    b.drawImage(monkeySprite(kind, dir, blink, step), X + (T - SMALL_PX) / 2, Y + T - SMALL_PX - bob, SMALL_PX, SMALL_PX); return;
  }
  R(b, X+4, Y+15, 8, 1, 'rgba(0,0,0,.22)'); R(b, X+3, Y+14, 10, 1, 'rgba(0,0,0,.12)');
  b.drawImage(monkeySprite(kind, dir, blink, step), X, Y - bob);
}
// A big object's picture (js/art.js), where it stands, with a little shake that settles while it's rustling.
const RUSTLE = 320;   // how long a rustle lasts (ms)
const shakeOf = (p, now) => { const t = now - p.rustle; return t < RUSTLE ? Math.round(Math.sin(t / 45) * (1 - t / RUSTLE)) : 0; };   // (a pixel at most)
function drawPiece(p, pic, cx, cy, now){
  const X = p.x0 - cx, Y = p.y0 - cy;
  if (X > VW*T || Y > VH*T || X + pic.width < 0 || Y + pic.height < 0) return;
  b.drawImage(pic, X + shakeOf(p, now), Y);
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
// Crawling through a hollow log (OVER_OBJECTS, js/art.js): with each step you take inside it, it gives a little shake, a
// couple of crumbs of bark fall off its sides, and you hear yourself scuffling along (decided 28 October 2026: you just
// vanished into it).
function crawlThrough(now){
  const m = pl.mv;
  if (!m || m.crawled || now - m.t0 < STEP * .3) return;
  const inside = p => [[m.fx, m.fy], [m.tx, m.ty]].some(([x, y]) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
  const p = OBJECT_PIECES.find(p => p.crawl && inside(p));
  if (!p) return;
  m.crawled = true; p.rustle = now; SFX.scuffle();
  for (const side of [-1, 1]) fallingLeaves.push({x: p.x*T + (side < 0 ? 2 : p.w*T - 4), y: m.ty*T + 2 + Math.random()*8, t0: now + (side > 0 ? 70 : 0), s: side, bark: true});
}
// And while you're in it, it's open along its top, so you see yourself in there, crawling through, in its shade (decided 8
// November 2026, after playing it: drawn over you, it looked as if you walked under it, not through it): its inside is
// drawn under you, and the log over you all but its opening (logOpening, js/art.js). It opens as you crawl in and closes
// once you're out, quickly (LOG_OPEN_MS), its bark fading.
const LOG_OPEN_MS = 160, LOG_SHADE = .32;
function logOpen(p, now){   // how open it is, 0 to 1 (once a frame, with its inside)
  const m = pl.mv, inside = (m ? [[m.fx, m.fy], [m.tx, m.ty]] : [[pl.x, pl.y]]).some(([x, y]) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
  const dt = Math.min(100, Math.max(0, now - (p.openT === undefined ? now : p.openT))); p.openT = now;
  return p.open = Math.max(0, Math.min(1, (p.open || 0) + (inside ? dt : -dt) / LOG_OPEN_MS));
}
const logAt = (p, cx, cy, now) => logShape(p.x*T - cx + shakeOf(p, now), p.y*T - cy, p.w*T, p.h*T);   // (where it is on the screen, shaking as it does)
function drawLogInside(p, cx, cy, now){   // under you
  if (!logOpen(p, now)) return;
  b.globalAlpha = p.open; logInside(b, logAt(p, cx, cy, now)); b.globalAlpha = 1;
}
function drawLogOver(p, cx, cy, now){   // over you
  if (!p.open) return drawPiece(p, p.top, cx, cy, now);
  const L = logAt(p, cx, cy, now), {cols, hole} = logOpening(L);
  const opening = () => { b.beginPath(); for (const [x, y0, y1] of cols) b.rect(x, y0, 1, y1 - y0); for (const [x, y, w] of hole) b.rect(x, y, w, 1); };
  b.save(); opening(); b.rect(0, 0, VW*T, VH*T); b.clip('evenodd'); drawPiece(p, p.top, cx, cy, now); b.restore();   // all but its opening
  b.save(); opening(); b.clip();
  b.globalAlpha = LOG_SHADE * p.open; R(b, 0, 0, VW*T, VH*T, '#100904');   // whoever's in it, in its shade
  if (p.open < 1){ b.globalAlpha = 1 - p.open; drawPiece(p, p.top, cx, cy, now); }   // (its bark, going or coming back)
  b.restore();
  b.globalAlpha = p.open; logEdges(b, L); b.globalAlpha = 1;
}
function drawFallingLeaves(cx, cy, now){
  for (let i = fallingLeaves.length - 1; i >= 0; i--){
    const f = fallingLeaves[i], t = (now - f.t0) / 800;
    if (t > 1){ fallingLeaves.splice(i, 1); continue; }
    if (t < 0) continue;
    const X = Math.round(f.x - cx + Math.sin(t*7) * 2 * f.s), Y = Math.round(f.y - cy + t*14);   // drifting from side to side as it falls
    R(b, X, Y, 2, 1, f.bark ? '#835D38' : '#8FC85A'); R(b, X + (f.s > 0 ? 1 : 0), Y + 1, 1, 1, f.bark ? '#45301B' : LEAF[1]);   // (or a crumb of bark)
  }
}
function heart(X, Y){ [[1,0],[3,0],[0,1],[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[2,3]].forEach(([a,c]) => R(b, X+a, Y+c, 1, 1, '#E0446A')); }
// An animal on the map at its size (content/sprites.js): one bigger than a square, such as a deer or a cow, stands up out
// of its square, centred on it, its feet on the square's bottom, as a tree does (decided 30 October 2026). Gives how much
// taller than a square it is, for what goes over its head.
function drawFigure(img, X, Y){ b.drawImage(img, X - (img.width - T) / 2, Y - (img.height - T)); return img.height - T; }
// And its shadow on the ground under its feet, as wide as it is: a bee's small, a cow's big. A small one stands a few
// pixels up its square, in the middle of it (decided 31 October 2026: on its bottom edge, it looked sunk), its shadow with
// it. (w: the word for its map sprite; feet: the row its feet are on, its lowest, counted up from the bottom of its square)
const figureBoxes = {};
const figureBox = w => figureBoxes[w] ?? (figureBoxes[w] = (() => {
  const rows = MAP_SPRITES[w].rows; let x0 = 99, x1 = -1, y1 = -1;
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.'){ x0 = Math.min(x0, x); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } }));
  return {shadow:Math.max(5, Math.round((x1 - x0 + 1) * .65)), up:rows.length - 1 - y1};
})());
function figureShadow(w, X, Y, alpha = .2){
  const {shadow:s, up} = figureBox(w);
  R(b, X + 8 - Math.floor(s / 2), Y + 14 - (up >= 2 ? up - 1 : 0), s, 2, `rgba(0,0,0,${alpha})`);   // (one a pixel up, such as the fox, as it always was)
}
// An animal at its own spot that you're meeting (it's drawn there, not as one jumping out): how far it hops up now. It hops
// when it sees you; and if you make friends, it hops for joy, with a heart rising over it (at X, Y); if not, it stays put.
function meetHop(a, X, Y, now, sq = a.at){   // (sq: its square, as there can be several of a kind out, such as bees)
  if (!foe || foe.a !== a || (sq && (foe.x !== sq[0] || foe.y !== sq[1]))) return 0;
  const e = now - foe.t0;
  if (foe.state === 'in') return e > 280 && e < 520 ? Math.round(Math.sin((e - 280) / 240 * Math.PI) * 4) : 0;
  if (foe.state !== 'happy') return 0;
  const e1 = now - foe.t1;
  heart(X + 6, Y - 6 - Math.round(e1 / 120));
  return Math.round(Math.abs(Math.sin(e1 / 130)) * 4);
}
// An animal that flutters over its spot, such as the butterfly over the riverside's flowers: hovering, bobbing gently, its
// wings beating (narrow every third moment, as they close), its shadow small on the ground below. (sq: its square, such as a character's that looks like it)
function drawFlutter(a, X, Y, now, sq = a.at){
  const hover = 5 + Math.round(Math.sin(now / 420 + sq[0]) * 2) + meetHop(a, X, Y, now, sq), shut = Math.floor(now / 170) % 3 === 0;
  const spr = a.spr, s = spr.width, x = X + (16 - s) / 2, y = Y + 16 - s - 2 - hover;
  R(b, X + 5, Y + 14, 6, 1, 'rgba(0,0,0,.16)');
  if (shut) b.drawImage(spr, 0, 0, s, s, x + s / 4, y, s / 2, s); else b.drawImage(spr, x, y);
}
// An animal that swims on the water at its spot (swims), such as the duck on the home ground's stream: floating, bobbing
// gently up and down, ripples spreading either side of it now and then; hopping as you meet it, and for joy (meetHop).
function drawSwimmer(a, X, Y, now){
  const bob = Math.floor(now / 520 + a.at[0]) % 2, up = meetHop(a, X, Y, now), k = Math.floor(now / 260) % 4;
  const wy = Y + 15 - figureBox(a.hz).up;   // (at its waterline)
  if (k < 3){ const w = 2 + k * 2; R(b, X + 5 - w, wy, w, 1, 'rgba(255,255,255,.55)'); R(b, X + 12, wy, w, 1, 'rgba(255,255,255,.55)'); }
  drawFigure(towardsYou(a, a.at[0]), X, Y + bob - up);
}
// One of several of a kind out where it came out (stays), such as a bee over the flowers in their valley: hovering, bobbing,
// looking your way, its wings a blur as they beat, its shadow on the ground below; hopping as you meet it, and for joy, with
// a heart, as it becomes your friend (meetHop). Gives how high it hovers.
function drawHover(a, x, y, X, Y, now){
  const hover = 5 + Math.round(Math.sin(now / 300 + x * 1.7 + y) * 2) + meetHop(a, X, Y, now, [x, y]);
  R(b, X + 5, Y + 14, 6, 1, 'rgba(0,0,0,.16)');
  b.drawImage(towardsYou(a, x), X, Y - hover);
  if (Math.floor(now / 90 + x) % 2) R(b, X + 4, Y - hover + 3, 8, 1, 'rgba(255,255,255,.7)');   // the wings' blur
  return hover;
}
// Those flying off together (the fly step, js/world.js), such as the six bees to join the swarm: each from where it was
// to the square they're going to, one a little after another, in an arc, wobbling as bees do, and gone as it gets there.
function drawFlyers(cx, cy, now){
  if (!flyers) return;
  const {a, from, to, t0} = flyers, each = FLY_MS - 120 * (from.length - 1);
  from.forEach(([x, y], i) => {
    const p = clamp((now - t0 - i * 120) / each, 0, 1);
    if (p >= 1) return;
    const X = Math.round((x + (to[0] - x) * p) * T - cx + Math.sin(now / 70 + i) * 1.5);
    const Y = Math.round((y + (to[1] - y) * p) * T - cy - 6 - Math.sin(p * Math.PI) * 12);
    b.globalAlpha = clamp((1 - p) / .25, 0, 1);   // (fading into the swarm)
    b.drawImage(a.faces && (a.faces === 'left') !== (to[0] < x) ? mirrored(a.spr) : a.spr, X, Y);   // (facing the way it flies)
    b.globalAlpha = 1;
  });
}
// A swarm of bees, buzzing round where it hangs in the way (a square that looks like a swarm, such as across the way to the
// queen's old tree in the bees' valley): tiny bees looping about it, each its own way. And a few about the bees' hive at the
// home ground, over its top, once they live there.
function drawSwarms(cx, cy, now){
  const x0 = Math.max(0, Math.floor(cx / T)), y0 = Math.max(0, Math.floor(cy / T));
  for (let y = y0; y <= Math.min(ROWS - 1, y0 + VH); y++) for (let x = x0; x <= Math.min(COLS - 1, x0 + VW); x++){
    const look = tileAt(x, y).look;
    if (look === 'swarm') drawSwarm(x*T - cx, y*T - cy, now, x);
    else if (look === 'hive' && tileAt(x, y - 1).look !== 'hive') drawSwarm(x*T - cx, y*T - cy - 9, now, x, 3);   // (its top row)
  }
}
function drawSwarm(X, Y, now, k, n = 9){   // (the square's top left corner on screen; k: so swarms side by side loop each their own way; n bees)
  for (let i = 0; i < n; i++){
    const t = now / 260 + i * 1.7 + k * 3.1;
    const bx = Math.round(X + 7 + Math.sin(t * (1 + i % 3 * .3) + i) * 8 + Math.cos(i * 2.3) * 3), by = Math.round(Y + 6 + Math.cos(t * .9 + i * .7) * 6 + Math.sin(i) * 2);
    R(b, bx, by, 3, 2, '#F2C14E'); R(b, bx + 1, by, 1, 2, '#2A2018'); R(b, bx, by - 1, 2, 1, i % 2 ? '#FFFFFF' : '#DDEFF8');
  }
}
// Smelling of durian (isStinky, js/input.js): a faint green haze on the ground round you (stinkHaze, under your monkey),
// and wavy stink lines rising off your head, swaying as they go and fading at the top, as in a cartoon: dark and two
// pixels wide, so you see them on grass and on the path alike.
const stinkHaze = (X, Y) => { b.globalAlpha = .22; oval(b, X + 8, Y + 13, 10, 4, '#7FAF34'); b.globalAlpha = 1; };
function drawStink(X, Y, now){
  for (let i = 0; i < 3; i++){
    const k = (now / 1200 + i / 3) % 1, x = X + 2 + i * 5, y = Y + 1 - Math.round(k * 9);
    for (let j = 0; j < 6; j++){
      b.globalAlpha = (1 - k * .85) * (1 - j / 8);
      R(b, x + Math.round(Math.sin(j * 1.1 + now / 140 + i * 2) * 1.5), y - j, 2, 1, j % 2 ? '#5E8C20' : '#46701A');
    }
  }
  b.globalAlpha = 1;
}
// Full of energy, from honey (isFast, js/input.js): golden sparks fly off behind you as you walk, and one twinkles over
// your head, most of the time.
// Running (holding B, or racing): puffs of dust kicked up behind, and speed lines.
function drawRunDust(X, Y, now, dir){
  const [dx, dy] = DV[dir], bx = X + 8 - dx * 9, by = Y + 13 - dy * 4;
  for (let i = 0; i < 3; i++){ const k = (now / 260 + i / 3) % 1; b.globalAlpha = .75 * (1 - k); oval(b, Math.round(bx - dx * k * 7 + (i - 1) * 2 * dy), Math.round(by - k * 3), 2 + Math.round(k * 2), 1 + Math.round(k), '#E6D8BC'); }
  b.globalAlpha = 1;
  if (dx) for (let i = 0; i < 3; i++) R(b, X + 8 - dx * (11 + i % 2 * 2), Y + 5 + i * 3, 3, 1, 'rgba(255,255,255,.75)');
}
function drawEnergy(X, Y, now, moving, dir){
  const [dx, dy] = DV[dir];
  if (moving) for (let i = 0; i < 3; i++){
    const k = (now / 90 + i * 1.3) % 3, bx = X + 7 - dx * (5 + k * 3) + (i - 1) * 3 * Math.abs(dy), by = Y + 12 - dy * (5 + k * 3) + (i - 1) * 2 * Math.abs(dx);
    R(b, Math.round(bx), Math.round(by), 2, 2, i % 2 ? '#FFE27A' : '#F2C14E');
  }
  if (Math.floor(now / 400) % 3 !== 2){ const tw = (now / 120) % 2 < 1; R(b, X + 13, Y - 3, 1, 3, '#FFE27A'); R(b, X + 12, Y - 2, 3, 1, tw ? '#FFFFFF' : '#FFE27A'); }
}
// A character that looks like an animal, such as the cow following you home: facing the way it last went sideways (its
// picture mirrored if that faces the other way), and as it steps, a pixel up, its front and back legs swinging in turn;
// standing, a gentle bob (decided 27 October 2026: the cow slid along backwards when it walked right).
function drawAnimal(n, X, Y, now, c){
  const def = MAP_SPRITES[n.look], spr = mapSprite(n.look);
  if (n.dir === 'left' || n.dir === 'right') n.side = n.dir;
  const side = n.side || def.faces, img = def.faces && side !== def.faces ? mirrored(spr) : spr;
  if (n.small){ const k = SMALL_PX / T, w = Math.round(img.width * k), h = Math.round(img.height * k); b.drawImage(img, X + (T - w) / 2, Y + T - h - 1, w, h); return; }   // (a little one, such as a calf)
  figureShadow(n.look, X, Y, .18);
  X -= (img.width - T) / 2; Y -= img.height - T;   // (one bigger than a square standing up out of it: drawFigure)
  if (!c.mid){ b.drawImage(img, X, Y - Math.floor(Math.abs(Math.sin(now/400)) * 1)); return; }
  const w = img.width, h = img.height, legs = legsFrom(n.look), half = w / 2, k = n.parity ? 1 : -1;
  b.drawImage(img, 0, 0, w, legs, X, Y - 1, w, legs);   // its body
  b.drawImage(img, 0, legs, half, h - legs, X - k, Y - 1 + legs, half, h - legs);   // its legs: front and back swinging in turn
  b.drawImage(img, half, legs, half, h - legs, X + half + k, Y - 1 + legs, half, h - legs);
}
// The row an animal's legs start at, in its map picture: the three rows above the bottom of what's drawn.
const legRows = {};
const legsFrom = look => legRows[look] ?? (legRows[look] = Math.max(0, MAP_SPRITES[look].rows.reduce((last, r, i) => /[^.]/.test(r) ? i : last, 0) - 2));
// A character that flies (flies, such as the queen bee and her swarm, coming home with you): hovering over its square,
// bobbing, its wings a blur as they beat, its shadow small on the ground below; or, for a swarm, a cloud of tiny bees.
// Long grass and tall flowers never hide it, as it's above them. (k: so two side by side bob each their own way)
function drawFlying(n, X, Y, now, k){
  const like = animalOf(n.id);
  if (like && like.flutters && like.hz === n.look){ drawFlutter(like, X, Y, now, [n.x, n.y]); return; }   // (one that looks like a butterfly flutters, as the butterfly does)
  const hover = 6 + Math.round(Math.sin(now / 300 + k) * 2);
  R(b, X + 5, Y + 14, 6, 1, 'rgba(0,0,0,.16)');
  if (n.look === 'swarm'){ drawSwarm(X, Y - hover + 4, now, k); return; }
  const spr = mapSprite(n.look), faces = MAP_SPRITES[n.look].faces, side = n.dir === 'left' || n.dir === 'right';
  b.drawImage(faces && side && n.dir !== faces ? mirrored(spr) : spr, X, Y - hover);   // (facing the way it's going, or you)
  if (Math.floor(now / 90) % 2) R(b, X + 5, Y - hover + 2, 6, 1, 'rgba(255,255,255,.7)');   // the wings' blur
}
const TALL_LOOKS = ['tallGrass', 'woodGrass'];   // tall grass animals hide in (the meadow's, or on the pine wood's floor)
function drawFoe(cx, cy, now){
  if (!foe || foe.spot) return;   // (one met at its own spot is drawn there: meetHop)
  const X = foe.x*T - cx, Y = foe.y*T - cy, e = now - foe.t0, spr = towardsYou(foe.a, foe.x);   // (looking at you)
  if (foe.state === 'in'){
    const rise = foe.big ? RISE_MS : 280;   // (a big one rears up slowly, twice your size)
    const k = clamp(e / rise, 0, 1), h = Math.max(1, Math.round(spr.height * k)), jump = e > rise && e < rise + 240 ? Math.round(Math.sin((e - rise) / 240 * Math.PI) * (foe.big ? 2 : 4)) : 0;
    figureShadow(foe.a.hz, X, Y, .18);
    b.drawImage(spr, 0, 0, spr.width, h, X - (spr.width - T) / 2, Y + 16 - h - jump, spr.width, h);   // (rising out of the grass, at its size: drawFigure)
    if (foe.sniff && e > 350) bubble(X + 10, Y + 8 - spr.height, '?');   // (sniffing the air: you smell of durian, sniffAndFlee in js/battle.js)
    if (e < 600 && TALL_LOOKS.includes(tileAt(foe.x, foe.y).look)){ for (let i = 0; i < 5; i++){ const gx = X + 1 + i*3 + Math.round(Math.sin(e/40 + i)*1); R(b, gx, Y + 11 - (i % 2), 1, 4, '#2F6E38'); R(b, gx, Y + 10 - (i % 2), 1, 1, '#94D883'); } }
  } else {
    const e1 = now - foe.t1;
    if (foe.state === 'hide'){   // ducking back down into the grass where it came from (you ran away from it)
      const h = Math.round(spr.height * clamp(1 - e1 / 450, 0, 1));
      if (h > 0){ figureShadow(foe.a.hz, X, Y, .18); b.drawImage(spr, 0, 0, spr.width, h, X - (spr.width - T) / 2, Y + 16 - h, spr.width, h); }
      if (e1 < 600 && TALL_LOOKS.includes(tileAt(foe.x, foe.y).look)){ for (let i = 0; i < 5; i++){ const gx = X + 1 + i*3 + Math.round(Math.sin(e1/40 + i)*1); R(b, gx, Y + 11 - (i % 2), 1, 4, '#2F6E38'); R(b, gx, Y + 10 - (i % 2), 1, 1, '#94D883'); } }
    } else if (foe.state === 'happy'){
      const hop = Math.round(Math.abs(Math.sin(e1 / 130)) * 4);
      b.globalAlpha = clamp(1 - (e1 - 700) / 300, 0, 1);
      const tall = drawFigure(spr, X, Y - hop); heart(X + 6, Y - 6 - tall - Math.round(e1 / 120));
      b.globalAlpha = 1;
    } else {
      const [dx, dy] = DV[OPP[pl.dir]] ? DV[pl.dir] : [0, 1];
      const ms = foe.big ? LUMBER_MS : 650, d = e1 / ms * (foe.big ? 32 : 20);   // (a big one lumbers off, slowly and heavily)
      b.globalAlpha = clamp(1 - Math.max(0, e1 - ms * .4) / (ms * .6), 0, 1);
      drawFigure(towardsYou(foe.a, foe.x, true), Math.round(X + dx * d), Math.round(Y + dy * d - Math.abs(Math.sin(e1 / (foe.big ? 160 : 70))) * 2));   // (running off, away from you)
      b.globalAlpha = 1;
    }
  }
}
// The speech box covers the bottom of the screen. If you, or the square you face (whoever you're talking to), would
// be under it, it goes at the top of the screen instead, and stays there for the whole conversation, through every
// line, card and reply, so it doesn't jump about; the map never moves for it. So it does when whoever's speaking is
// further off, on the screen, and would be under it (such as the thirsty monkey as you bring the cow home), if at the top
// it would cover neither of you. Checked as each line shows (before it's drawn: placeTalk() in js/cards.js) and on
// every frame, in case the box grows, such as when its English is shown.
let talkTop = false, talkCover = 0, talkWho = null;   // whether the box is at the top; how much of the view it covers, in map pixels (the most this conversation); who's speaking (sayLine() in js/cards.js)
let talkTopEnd = -1e9;   // when a conversation last ended with the box at the top: a message straight after it shows there too (messageTop())
// Where the view is on the map, along one side: you in its middle, as far as the map goes; a place smaller than the view,
// such as the master's room, in the middle of it, with dark round it (the art review, decided 6 November 2026: it was in
// the top left corner of the screen).
const camAlong = (at, size, view) => size < view ? -Math.round((view - size) / 2) : Math.round(clamp(at, 0, size - view));
const camX = () => camAlong(pl.px + 8 - VW*T/2, COLS*T, VW*T);   // the left of the view
const camY = () => camAlong((pl.mv && pl.mv.slip ? pl.mv.fy*T : pl.py) + 8 - VH*T/2, ROWS*T, VH*T);   // the top of the view (still while you slip down a bank, so you can see yourself slip)
function drawLayer(c, cx, cy){   // one of the map's layers (mapCanvas, baseCanvas, topCanvas), as much of it as the view shows, where it shows
  const x = Math.max(0, cx), y = Math.max(0, cy), w = Math.min(c.width, cx + VW*T) - x, h = Math.min(c.height, cy + VH*T) - y;
  if (w > 0 && h > 0) b.drawImage(c, x, y, w, h, x - cx, y - cy, w, h);   // (never asking for anything off its edges, which some browsers won't draw)
}
function placeTalk(cy = camY()){
  if (talkBox.hidden){
    if (!busy && (talkTop || talkCover)){ if (talkTop) talkTopEnd = performance.now(); talkTop = false; talkCover = 0; talkBox.classList.remove('top'); }   // the conversation is over
    return;
  }
  if (talkTop) return;
  const h = +cv.clientHeight || 0, bh = +talkBox.offsetHeight || 0;
  if (h > 0) talkCover = Math.max(talkCover, Math.min(VH*T, bh * VH*T / h));
  const [, fy] = facing(), top = Math.min(pl.py, fy*T) - cy, low = Math.max(pl.py, fy*T) + T - cy;   // you and the square you face, on screen
  const under = low - (VH*T - talkCover), over = talkCover - top;   // how far you'd be under the box at the bottom, and at the top
  const who = talkWho && NPCS.find(n => n.id === talkWho), wx = who ? who.x*T - camX() : -T, wy = who ? who.y*T - cy : -T;   // whoever's speaking, on screen
  const whoUnder = wx >= 0 && wx + T <= VW*T && wy >= talkCover && wy + T > VH*T - talkCover && wy + T <= VH*T;   // on the screen, under the box at the bottom, and not under it at the top
  if ((under > 0 && over < under) || (under <= 0 && over <= 0 && whoUnder)){ talkTop = true; talkBox.classList.add('top'); $('#placeName').hidden = true; }   // (the place's name would cover its buttons)
}
// A message (toast(), js/helpers.js) goes where the speech box was: at the top while it's there, or straight after a
// conversation that had it there, till you move or turn, so the two never jump from top to bottom (decided 27 October 2026,
// after playing it: a speech box at the top, then a new task's message at the bottom).
const messageTop = () => talkTop || talkTopEnd > Math.max(lastMoveEnd, pl.turnT);
// Whether a message bh pixels high (on the page), at the bottom of the screen, would cover you or the square you face
// (decided 4 November 2026: fishing off the pier, near the bottom of the map, a bite's message hid you and your float).
function underMessage(bh){
  const h = +cv.clientHeight || 0; if (!h || !bh || typeof pl === 'undefined') return false;
  const cover = bh * VH*T / h, [, fy] = facing(), low = Math.max(pl.py, fy*T) + T - camY();
  return low > VH*T - cover;
}
// Standing in tall or long grass hides your feet, as in Pokémon: the map where your feet are (the bottom FEET pixels of
// your square, wherever you are, between two squares as you walk) is drawn again over you, where it's grass. Gives
// those parts, each [x, y, w, h] in map pixels.
const HIDES_FEET = ['tallGrass', 'woodGrass', 'longGrass', 'tallFlowers'], FEET = 4;
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
// Walking through tall or long grass, it parts round you (decided 6 November 2026: players missed the old grass, and liked
// it moving as you walk through, a little gentler than in the mock-up): the square you step into, its tufts bending away
// from its middle (or on ahead, as you walk sideways), with a little shake as you push in and a few bits of grass flung up,
// their tips catching the light, so your path shows; the squares either side leaning away a little as you pass; and once
// you've gone, each stays flattened a moment, then springs back, wobbling, and settles. Only the squares near you, so it
// costs a phone nothing. Each is drawn onto its own little canvas (pic) as the map has it but bent, with what the map's
// squares after it reach into it, such as the top edge of a cliff below it (overGrass: drawTiles in js/art.js draws them
// after it), and only when it moves; then put over the map in its place, under the big objects as the map is
// (drawStirredGrass), and over your feet (coverFeet).
const STIR_LOOKS = {tallGrass:TALL, longGrass:LONG, woodGrass:WOOD_TALL};
const STIR = {in:150, shake:240, wobble:.25, hold:260, back:1100, settle:240, swing:80, side:.45, bits:450};   // (ms, and how far: wobble, a square beside you)
const stirred = new Map();   // 'x,y' -> {t0, dir, out: when you left it (null while you're in it), side: a square beside you, away: which way it leans, pal, pic, k}
const overGrassAt = new Map(), spareStirPics = [];   // (what reaches into each square, kept while the map's the same; little canvases to use again)
// (those little canvases are used again too, the oldest once there are OVER_GRASS_KEPT, so walking about never makes more
// and more of them: a phone stops making canvases for a page that's made too many, decided 7 November 2026)
const OVER_GRASS_KEPT = 48, spareOverGrass = [];
function dropOverGrass(all){
  for (const [key, c] of overGrassAt){ if (!all && overGrassAt.size <= OVER_GRASS_KEPT) break; overGrassAt.delete(key); spareOverGrass.push(c); }
}
let stirAt = null, stirPlace = null, stirMap = null;
const grassy = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS && !!STIR_LOOKS[tileAt(x, y).look];
function parted(s, now){   // how far it's parted: 0 standing up, 1 wide apart (below 0, swinging back past upright); null once it's still
  if (s.out === null){ const t = Math.max(0, now - s.t0); return Math.min(1, t / STIR.in) + (t < STIR.shake ? Math.sin(t / 30) * STIR.wobble * (1 - t / STIR.shake) : 0); }
  const full = s.side ? STIR.side : 1, t = Math.max(0, now - s.out);
  if (t < STIR.hold) return s.side ? full * Math.min(1, t / STIR.in) : full;   // (your track stays flattened a moment)
  const u = t - STIR.hold;
  return u > STIR.back ? null : full * Math.exp(-u / STIR.settle) * Math.cos(u / STIR.swing);
}
function stirBend(s, k){   // how far a tuft leans at its tip, by where it is across its square (px)
  const along = s.dir === 'left' ? -1 : s.dir === 'right' ? 1 : 0;
  if (s.side) return () => k * (s.away || along) * 3.5;   // (beside you: leaning away from you, or on with you as you walk sideways)
  return px => { const side = (px - 7.5) / 7.5; return k * (along ? along * 3 + side * 2 : side * 5); };
}
function overGrass(x, y){   // what the squares drawn after it on the map reach into it, on a canvas of its own
  const key = x + ',' + y; if (overGrassAt.has(key)) return overGrassAt.get(key);
  dropOverGrass(false);
  const c = spareOverGrass.pop() || document.createElement('canvas'); c.width = c.height = T; overGrassAt.set(key, c);   // (setting its size clears one used before)
  const g = c.getContext('2d');
  for (const [dx, dy] of [[1, 0], [-1, 1], [0, 1], [1, 1], [-1, 2], [0, 2], [1, 2]]){
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < COLS && ny < ROWS){ LOOKS[tileAt(nx, ny).look](g, dx*T, dy*T, nx, ny); castShadow(g, dx*T, dy*T, nx, ny); }
  }
  return c;
}
function drawStirred(s, x, y, k){   // the square, parted k, on its little canvas: as the map draws it, but bent
  const lit = Math.abs(k) > .3;   // (pushed aside, its tips catch the light)
  if (s.pic && s.k === k && s.lit === lit) return;   // (as it was: standing in it, or flattened a moment)
  if (!s.pic){ s.pic = spareStirPics.pop() || document.createElement('canvas'); s.pic.width = s.pic.height = T; }
  const g = s.pic.getContext('2d');
  tall(g, 0, 0, x, y, s.pal, k ? stirBend(s, k) : null, lit); castShadow(g, 0, 0, x, y); g.drawImage(overGrass(x, y), 0, 0);
  s.k = k; s.lit = lit;
}
function unstir(key){ const s = stirred.get(key); if (s.pic && spareStirPics.length < 24) spareStirPics.push(s.pic); stirred.delete(key); }
function stirGrass(now){   // the grass you're walking through, and what it's doing (each frame, before the map's squares are drawn)
  if (stirPlace !== PLACE){ for (const key of [...stirred.keys()]) unstir(key); stirAt = null; stirPlace = PLACE; stirMap = null; }
  if (stirMap !== drawnFor){ dropOverGrass(true); stirMap = drawnFor; for (const s of stirred.values()) s.k = null; }   // (somewhere else, or the map drawn again: what reaches into each square may have changed)
  const x = Math.floor((pl.px + 8) / T), y = Math.floor((pl.py + 12) / T), key = x + ',' + y;   // (the square your feet are in)
  if (key !== stirAt){
    const left = stirred.get(stirAt); if (left && left.out === null) left.out = now;
    if (grassy(x, y)){
      const s = stirred.get(key), k = s ? Math.min(1, Math.abs(parted(s, now) || 0)) : 0;   // (back into a square still springing back: on from there)
      stirred.set(key, {pic:s && s.pic, t0:now - k * STIR.in, dir:pl.dir, out:null, side:false, away:0, pal:STIR_LOOKS[tileAt(x, y).look], k:null});
      for (const [dx, dy] of pl.dir === 'up' || pl.dir === 'down' ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]]){
        const k2 = (x + dx) + ',' + (y + dy);
        if (grassy(x + dx, y + dy) && !stirred.has(k2)) stirred.set(k2, {t0:now, dir:pl.dir, out:now, side:true, away:dx, pal:STIR_LOOKS[tileAt(x + dx, y + dy).look]});
      }
    }
    stirAt = key;
  }
  for (const [k2, s] of stirred){
    const k = parted(s, now), [sx, sy] = k2.split(',').map(Number);
    if (k === null || !grassy(sx, sy)) unstir(k2);   // (still again: the map's own square)
    else drawStirred(s, sx, sy, Math.round(k * 20) / 20);   // (in twentieths: drawn again only when that changes)
  }
}
function drawStirredGrass(cx, cy){   // the grass you're walking through, parted round you, over the map's own
  for (const [k2, s] of stirred) if (s.pic){ const [sx, sy] = k2.split(',').map(Number); b.drawImage(s.pic, sx*T - cx, sy*T - cy); }
}
function drawGrassBits(cx, cy, now){   // bits of grass flung up as you push into it, falling back
  for (const [k2, s] of stirred){
    const t = now - s.t0;
    if (s.side || s.out !== null || t >= STIR.bits) continue;
    const [sx, sy] = k2.split(',').map(Number), X = sx*T - cx + 8, Y = sy*T - cy + 8, q = t / 1000;
    for (let i = 0; i < 4; i++){
      const a = (i / 3 - .5) * 2.2, v = 24 + (i % 3) * 7;
      R(b, Math.round(X + Math.sin(a) * v * q), Math.round(Y - Math.cos(a) * v * q * 1.9 + 90 * q * q), 2, 1, i % 2 ? s.pal[2] : mix(s.pal[2], '#FFFFFF', .3));
    }
  }
}
function coverFeet(x, y, w, h, cx, cy){   // the grass over someone's feet, [x, y, w, h] in map pixels (feetInGrass): parted, if it is
  const tx = Math.floor(x / T), ty = Math.floor(y / T), s = stirred.get(tx + ',' + ty);
  if (s && s.pic) b.drawImage(s.pic, x - tx*T, y - ty*T, w, h, x - cx, y - cy, w, h);
  else b.drawImage(mapCanvas, x, y, w, h, x - cx, y - cy, w, h);
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
    const n = s.small ? 6 : 12, sc = s.small ? .55 : 1;   // (small: a bucket dipped in, not you falling in)
    for (let k = 0; k < n; k++){
      const a = Math.PI * (.1 + .8 * k / (n - 1)), v = (40 + (k % 4) * 14) * sc;
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
// Swinging a stick (yours, in the hit step, js/world.js; or a little monkey's in training, as it practises; or your sword
// once you have one): raised over your head in both paws, then struck down onto the square in front (dir), from t0 (the
// swing pose, js/poses.js; decided 6 November 2026, after playing it: things done with no arms), with a faint swoosh from
// the side as it comes down; it stays there a moment after it strikes.
const SWING_HAND = {right:[12, 9], left:[3, 9], down:[13, 10], up:[2, 9]};   // (where a monkey's paw is, in its sprite, each way it faces: as the little monkeys splash and carry stones)
function drawSwing(kind, dir, PX, PY, t0, now, held = heldBy(kind) || '棍子'){   // (held: what's swung, HELD's, js/art.js)
  const t = Math.max(0, (now - t0) / SWING_MS), o = {kind, held};
  const p = drawPose('swing', dir, t < SWING_CONTACT ? 'up' : 'down', PX, PY, o);
  if (t >= SWING_CONTACT && t < SWING_CONTACT + .25 && (dir === 'left' || dir === 'right')){   // (the swoosh, round where it's held, down to where it struck)
    const [gx, gy] = p.grip, [tx, ty] = p.tip, r = Math.hypot(tx - gx, ty - gy), a1 = Math.atan2(ty - gy, tx - gx), back = dir === 'right' ? -1 : 1;
    b.globalAlpha = .5;
    for (let i = 1; i <= 8; i++){ const a = a1 + back * 1.3 * i / 8; R(b, Math.round(PX + gx + Math.cos(a) * r), Math.round(PY + gy + Math.sin(a) * r), 1, 1, '#FFFFFF'); }
    b.globalAlpha = 1;
  }
}
// You, doing something in a pose (js/poses.js: name, which way you face, its moment m; o: another monkey, and what it
// swings), your shadow where you've stepped to; it gives back the pose (where your paw is, and the bucket, in your
// square's pixels).
function drawPose(name, dir, m, PX, PY, o){
  const p = poseSprite(name, dir, m, o), [sx, sy] = p.step;
  R(b, PX+4+sx, PY+15+sy, 8, 1, 'rgba(0,0,0,.22)'); R(b, PX+3+sx, PY+14+sy, 10, 1, 'rgba(0,0,0,.12)');
  b.drawImage(p.canvas, PX - POSES.O, PY - POSES.O);
  return p;
}
// Sweeping with a broom (the sweep step, js/world.js; and in the scene of the years in the cave): you holding it in both
// paws, leaning into it, its twigs on the ground in front of you, pushed out and drawn back (from the side), or from side
// to side (from the front or behind), a stroke at a time (decided 6 November 2026, after playing it: the broom seemed to
// come out of your stomach, with no arms).
const sweepMoment = (t0, now) => { const t = Math.max(0, now - t0) / SWEEP.stroke, i = Math.floor(t), f = t - i, m = f < 1/3 ? -1 : f < 2/3 ? 0 : 1; return i % 2 ? -m : m; };
const drawSweep = (dir, PX, PY, t0, now) => drawPose('sweep', dir, sweepMoment(t0, now), PX, PY);
// Chopping with an axe (the hit step with 斧头, at the cave's chopping blocks): raised over your head, then down onto the block.
const drawChop = (dir, PX, PY, t0, now) => drawPose('chop', dir, (now - t0) / SWING_MS < SWING_CONTACT ? 'up' : 'down', PX, PY);
// Doing something (acting, js/world.js), drawn in your place as you do it: each is given where you are on the screen
// (PX, PY), the time, and what you're doing (a: its kind, when it began, t0, the square it's done to, x and y, and the
// rest); it draws you, empty-handed but for what you're using. What flies off somewhere else, over everything, such as a
// sack you toss or a fruit falling from a tree: drawActFx.
const actMonkey = (PX, PY, dir, lift = 0) => { R(b, PX+4, PY+15, 8, 1, 'rgba(0,0,0,.22)'); R(b, PX+3, PY+14, 10, 1, 'rgba(0,0,0,.12)'); b.drawImage(monkeySprite('player', dir, false, 0, true), PX, PY - lift); };
const lerp = (a, z, k) => a + (z - a) * k, ease = k => 1 - (1 - k) * (1 - k);
const itemPic = w => { const pic = PICTURES[w]; return pic && (FORMS['eat ' + w] || (FORMS['eat ' + w] = sprite(pic.rows, pic.palette))); };
let SACK_HELD = null;   // (drawn once, the first time you lift one)
function sackPic(X, Y){   // a sack of rice, tied at its neck, its two corners sticking up: as on the pile (sack, js/human.js), with its dark outline
  if (!SACK_HELD){
    const c = document.createElement('canvas'); c.width = 13; c.height = 17; sack(c.getContext('2d'), 2, 6, 9, 9);
    const ink = document.createElement('canvas'); ink.width = 13; ink.height = 17; const ig = ink.getContext('2d');
    ig.drawImage(c, 0, 0); ig.globalCompositeOperation = 'source-in'; ig.fillStyle = INK; ig.fillRect(0, 0, 13, 17);
    const s = document.createElement('canvas'); s.width = 13; s.height = 17; const sg = s.getContext('2d');
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) sg.drawImage(ink, dx, dy);
    sg.drawImage(c, 0, 0); SACK_HELD = s;
  }
  b.drawImage(SACK_HELD, Math.round(X) - 2, Math.round(Y) - 4);
}
function keyPic(fx, fy, tx, ty, turned){   // a key, its bow in your paw (f), its shaft into the lock (t); turned: a quarter turn, its bow edge on
  const n = Math.max(Math.abs(tx - fx), Math.abs(ty - fy)) || 1, along = Math.abs(tx - fx) >= Math.abs(ty - fy);
  for (let i = 1; i <= n; i++) R(b, Math.round(fx + (tx - fx) * i / n), Math.round(fy + (ty - fy) * i / n), 1, 1, '#E8C040');   // its shaft
  if (turned){ if (along) R(b, fx, fy - 1, 1, 3, '#5A4010'); else R(b, fx - 1, fy, 3, 1, '#5A4010'); return; }   // its bow, edge on
  R(b, fx - 1, fy - 1, 3, 3, '#5A4010'); R(b, fx, fy, 1, 1, '#3A2A20'); R(b, fx - 1, fy - 1, 1, 1, '#F6DC7A');   // its bow, a ring
}
const ACTS = {
  sweep: (PX, PY, now, a) => drawSweep(a.dir, PX, PY, a.t0, now),
  // filling a bucket: you step up to the water's edge holding it out, dip it in (ripples round it), lift it out full and
  // dripping, and step back with it at your side (the dip pose, js/poses.js)
  dip(PX, PY, now, a){
    const t = now - a.t0, m = t < DIP.down ? 'out' : t < DIP.up ? 'in' : t < DIP.back ? 'full' : 'back', bk = poseSprite('dip', a.dir, m).bucket;
    if (m === 'in' && bk){ b.globalAlpha = .7; oval(b, PX + bk[0], PY + bk[1] + 1, 5 + Math.floor((t - DIP.down) / 90) % 3, 2, '#BFE8FA'); b.globalAlpha = 1; }   // (ripples round it)
    drawPose('dip', a.dir, m, PX, PY);
    if (m === 'full' && bk) for (let i = 0; i < 2; i++){ const k = ((t - DIP.up) / 260 + i / 2) % 1; R(b, PX + bk[0] - 1 + i * 3, Math.round(PY + bk[1] + 5 + k * 6), 1, 1, '#7FC4EE'); }   // drips
  },
  // pouring a bucket of water over what's in front of you, such as your own little peach tree: held out over it, full, then
  // tipped up, the water pouring out of its mouth onto the ground at its foot, splashing, a dark wet patch spreading there
  // (the pour pose, js/poses.js; the pour step, js/year.js)
  pour(PX, PY, now, a){
    const t = now - a.t0, tip = t >= POUR.tip, p = drawPose('pour', a.dir, tip ? 'tip' : 'out', PX, PY);
    if (!tip || !p.mouth) return;
    const [mx, my] = p.mouth, bx = (a.x - pl.x) * T + 8, by = (a.y - pl.y) * T + 13, k = Math.min(1, (t - POUR.tip) / 160), left = t < POUR.ms - 200;
    const X0 = PX + mx, Y0 = PY + my, X1 = PX + bx, Y1 = PY + by, n = Math.max(1, Math.round(Math.hypot(X1 - X0, Y1 - Y0) * k));
    b.globalAlpha = .45; oval(b, X1, Y1 + 1, 3 + Math.min(3, Math.floor((t - POUR.tip) / 220)), 1, '#3F2A18'); b.globalAlpha = 1;   // (the wet ground, spreading)
    if (!left) return;
    for (let i = 0; i <= n; i++){ const f = i / n, x = Math.round(X0 + (X1 - X0) * f + Math.sin(now / 60 + i) * .6), y = Math.round(Y0 + (Y1 - Y0) * f); R(b, x, y, 2, 1, i % 3 ? '#7FC4EE' : '#BFE8FA'); }   // the stream
    if (k >= 1) for (let i = 0; i < 4; i++){ const ph = ((now / 260) + i / 4) % 1, dx = (i % 2 ? 1 : -1) * Math.round(2 + ph * 3); R(b, X1 + dx, Math.round(Y1 - 3 * Math.sin(ph * Math.PI)), 1, 1, '#BFE8FA'); }   // splashing
  },
  // crouching down at what you face, your paws on the ground, such as planting your little tree (the kneel step, js/year.js)
  kneel: (PX, PY, now, a) => drawPose('pick', a.dir, 'down', PX, PY),
  // lifting something heavy, such as a sack of rice: you crouch, your paws on it in front of you, and heave it up over your
  // head (the lift pose, js/poses.js); then you carry it about (drawCarrying)
  lift(PX, PY, now, a){
    const m = now - a.t0 < LIFT.up * .45 ? 'low' : 'high', [x, y] = poseSprite('lift', a.dir, m).load;
    (liftedPic(a.what) || LIFTED.sack)(PX + x, PY + y);   // (it first: your paws and your head over its edges)
    drawPose('lift', a.dir, m, PX, PY);
  },
  // putting it down: lowered from over your head as you lean to set it down in front of you, such as on the boat's deck,
  // where it'll stay (putDownAt)
  putDown(PX, PY, now, a){
    const k = Math.min(1, (now - a.t0) / PUT.down), [hx, hy] = poseSprite('lift', a.dir, 'high').load, [x, y] = a.to || putDownAt(a), tx = x - pl.px + PX, ty = y - pl.py + PY;
    (liftedPic(a.what) || LIFTED.sack)(Math.round(lerp(PX + hx, tx, ease(k))), Math.round(lerp(PY + hy, ty, ease(k))));
    drawPose('lift', a.dir, k < .5 ? 'high' : 'set', PX, PY);
  },
  // turning a key in a lock: you step up to it and reach out, the key in your paw, into the lock (the key pose, js/poses.js);
  // it turns, click, the lock comes off, and you step back as the door swings open, creaking. (Facing down, the cage is
  // in front of you: your arm goes behind it.)
  unlock(PX, PY, now, a){
    const t = now - a.t0, cx = pl.px - PX, cy = pl.py - PY, X = a.x*T - cx, Y = a.y*T - cy, holding = t < UNLOCK.open + 120;
    const door = t < UNLOCK.open ? 0 : Math.min(1, ease((t - UNLOCK.open) / (UNLOCK.opened - UNLOCK.open)));
    const me = () => holding ? drawPose('key', a.dir, 'reach', PX, PY) : actMonkey(PX, PY, a.dir), lock = () => { if (typeof cage === 'function') cage(b, X, Y, a.x, a.y, false, door, t < UNLOCK.open); };   // (the cage, its door swinging open: js/havoc.js)
    if (a.dir === 'down'){ me(); lock(); } else { lock(); me(); }
    if (holding){ const [px, py] = poseSprite('key', a.dir, 'reach').paw; keyPic(PX + px, PY + py, X + 8, Y + 8, t >= UNLOCK.turn); }
  },
  // picking something up: up on tiptoe into a tree, an arm up into its leaves; crouching for what's on the ground, or in
  // the water; or leaning into what it's in, such as the hive (the pick pose, js/poses.js): it's under your paws as you
  // take it (from a tree, it drops into your paw: drawActFx), and you hold it up over your head
  pick(PX, PY, now, a){
    const t = now - a.t0, c = itemPic(a.pic || a.w);
    if (t >= PICK.caught){
      const [x, y] = drawPose('pick', a.dir, 'hold', PX, PY).item, bob = Math.round(Math.sin((t - PICK.caught) / 120));
      if (c) b.drawImage(c, PX + x - 5, PY + y - 5 - bob, 10, 10);
      if ((t - PICK.caught) % 300 < 160){ R(b, PX + x + 5, PY + y - 6, 1, 3, '#FFE27A'); R(b, PX + x + 4, PY + y - 5, 3, 1, '#FFE27A'); }   // (a twinkle)
      return;
    }
    if (c && (a.reach === 'down' || (a.reach === 'in' && t >= PICK.fall))){   // (lying there, or coming out of what it's in, lifted a little as you take it)
      const [x, y] = poseSprite('pick', a.dir, a.reach).item, lift = t < PICK.fall ? 0 : Math.round(2 * (t - PICK.fall) / (PICK.caught - PICK.fall));
      b.drawImage(c, PX + x - 5, PY + y - 5 - lift, 10, 10);
    }
    drawPose('pick', a.dir, a.reach, PX, PY);
  }
};
// What flies off somewhere as you do something, over everything: what you pick from a tree, dropping from its leaves
// into your paw.
function drawActFx(cx, cy, now){
  const a = acting; if (!a) return;
  const t = now - a.t0;
  if (a.kind === 'pick' && a.reach === 'up' && t >= PICK.fall && t < PICK.caught){   // (dropping, faster and faster, into your paw up in the tree)
    const k = (t - PICK.fall) / (PICK.caught - PICK.fall), c = itemPic(a.pic || a.w), [fx, fy] = a.from, [x, y] = poseSprite('pick', a.dir, 'up').item;
    if (c) b.drawImage(c, Math.round(lerp(fx - 5, pl.px + x - 5, k) - cx), Math.round(lerp(fy - 5, pl.py + y - 5, k * k) - cy), 10, 10);
  }
}
// What you can carry over your head (the lift step), each drawn by the middle of its bottom (x, y), on the screen: a sack,
// or anything with a word's picture, such as the troop's bowls, taken off the cart at home (the unload step).
const LIFTED = {sack:(x, y) => sackPic(x - 4, y - 11)};
const liftedPic = what => LIFTED[what] || (what && PICTURES[what] ? (x, y) => b.drawImage(itemPic(what), x - 6, y - 12, 12, 12) : null);
// Where you put down what you carry (the putDown step: a, its act, the square you face), the middle of its bottom, on the
// map: on a big object with a deck, such as the docker's boat, its next place there (DECKS, js/human.js), where it'll
// stay; anywhere else, in front of you, as you set it down.
function putDownAt(a){
  const o = mapObjects().find(o => a.x >= o.x && a.x < o.x + o.w && a.y >= o.y && a.y < o.y + o.h);
  const slot = o && typeof DECKS !== 'undefined' && DECKS[o.look] && DECKS[o.look][o.deck || 0];
  if (slot) return [o.x*T + slot[0], o.y*T + slot[1]];
  const [x, y] = poseSprite('lift', a.dir, 'set').load; return [pl.px + x, pl.py + y];
}
// Carrying something over your head (here().lifted, the lift step) as you walk about, your arms up holding it, your legs
// stepping (the carry pose, js/poses.js: step, 1 or 2 mid-step, when you're bobbing up, bob).
function drawCarrying(what, PX, PY, dir, step, bob){
  const p = poseSprite('carry', dir, step), [x, y] = p.load;
  R(b, PX+4, PY+15, 8, 1, 'rgba(0,0,0,.22)'); R(b, PX+3, PY+14, 10, 1, 'rgba(0,0,0,.12)');
  liftedPic(what)(PX + x, PY + y - bob);
  b.drawImage(p.canvas, PX - POSES.O, PY - POSES.O - bob);
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
// Something being set up as you watch (the setUp step), such as the feast's big table: its pieces that are up so far,
// drawn on the ground under the characters till it's all up and goes into the map.
function drawSettingUp(cx, cy){
  b.save(); b.translate(-cx, -cy);
  for (const o of settingUp.objects) OBJECT_ART[o.look](b, o);   // (each as far as it's up: stage)
  b.restore();
}
// Chips flying off what you hit (burst, at the moment your stick strikes): wood or stone, falling as they fly.
const chips = [];
const CHIP_COLOURS = {wood:['#D2A46A', '#8A5A32', '#B98A55', '#6B4A2A'], stone:['#E6E2D6', '#A9A598', '#7C786D', '#D6D2C5'], leaves:['#C2552E', '#D8923A', '#E6B04A', '#9A6A2A']};
function burst(x, y, kind){
  const now = performance.now(), cols = CHIP_COLOURS[kind] || CHIP_COLOURS.wood;
  for (let i = 0; i < 10; i++){ const a = Math.PI * (1.1 + .8 * Math.random()), v = 30 + Math.random() * 45; chips.push({x:x*T + 8, y:y*T + 7, vx:Math.cos(a) * v * (Math.random() < .5 ? -1 : 1), vy:Math.sin(a) * v, c:cols[i % cols.length], t0:now}); }
}
// Leaves (or whatever's swept) flying off what you sweep (scatter, as each stroke of the broom goes through it): tossed
// away from you, light, fluttering and tumbling as they drift down, and fading.
function scatter(x, y, kind, dir, n = 4){
  const now = performance.now(), cols = CHIP_COLOURS[kind] || CHIP_COLOURS.leaves, [dx, dy] = DV[dir];
  for (let i = 0; i < n; i++){
    const along = 10 + Math.random() * 14, across = (Math.random() - .5) * 40;
    chips.push({x:x*T + 8 + (Math.random() - .5) * 8, y:y*T + 9 + (Math.random() - .5) * 4, vx:dx * along + dy * across, vy:dy * along + dx * across - 12, c:cols[i % cols.length], t0:now, float:true, ph:Math.random() * 6});
  }
}
function drawChips(cx, cy, now){
  for (let i = chips.length - 1; i >= 0; i--){
    const p = chips[i], t = (now - p.t0) / 1000, life = p.float ? .9 : .6;
    if (t > life){ chips.splice(i, 1); continue; }
    if (p.float){   // a leaf
      b.globalAlpha = Math.min(1, (life - t) / .3);
      R(b, Math.round(p.x + p.vx * t + Math.sin(t * 14 + p.ph) * 1.5 - cx), Math.round(p.y + p.vy * t + 20 * t * t - cy), (t * 10 + p.ph) % 2 < 1 ? 2 : 1, 1, p.c);
      b.globalAlpha = 1; continue;
    }
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
  let cx = camX();
  let cy = camY(); placeTalk(cy);
  bigSparkles = !!AREA.bigSparkles && matches(AREA.bigSparkles);
  if (now - shakeT < 600){ cx += Math.round((Math.random()-.5)*3); cy += Math.round((Math.random()-.5)*3); }
  stirGrass(now);   // (the grass you're walking through, parting round you)
  const sh = Math.min(VH*T, ROWS*T - cy);   // the part of the view the map reaches down to (for the gloom, mist and night)
  R(b, 0, 0, VW*T, VH*T, '#1E2B26');   // dark where the map doesn't reach (and the frame cleared, so nothing ever smears)
  drawLayer(mapCanvas, cx, cy);
  drawStirredGrass(cx, cy);   // (the grass you're walking through, parted round you)
  drawFootprints(cx, cy, now);   // (your footprints in the snow, in winter: js/seasons.js)
  drawPlaques(cx, cy); drawLanterns(cx, cy, now);   // (a plaque over a door, such as your name over your room; red lanterns for New Year: js/year.js)
  drawLayer(baseCanvas, cx, cy);   // big objects, under the characters: those that never move, all at once
  touchLeaves(now); crawlThrough(now);
  for (const p of OBJECT_PIECES) if (!p.baked){ drawPiece(p, p.base, cx, cy, now); if (p.crawl) drawLogInside(p, cx, cy, now); }   // and the fruit trees, which rustle (and a hollow log, open while you're in it)
  const x0 = Math.floor(cx/T), y0 = Math.floor(cy/T);
  for (let y = y0; y <= y0 + VH; y++) for (let x = x0; x <= x0 + VW; x++) animTile(x, y, x*T - cx, y*T - cy, now);
  drawGrassBits(cx, cy, now);
  drawGlimpse(cx, cy, now);
  if (marking) drawMarking(cx, cy, now);   // ground being marked out (the markOut step)
  if (settingUp) drawSettingUp(cx, cy);    // something being set up, a piece at a time (the setUp step)
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
  const spotAnimals = canWild() ? ANIMALS.filter(atSpot) : [];
  const inTree = a => tileAt(a.at[0], a.at[1]).look === 'tree' || a.perch;   // (up a tree, or perched up on something: over its top)
  for (const a of spotAnimals.filter(a => !inTree(a))){
    const X = a.at[0]*T - cx, Y = a.at[1]*T - cy, ground = !!tileAt(a.at[0], a.at[1]).walk;
    if (X < -T || Y < -T || X > VW*T || Y > VH*T) continue;
    if (asleepNow(a)){ figureShadow(a.hz, X, Y); drawFigure(towardsYou(a, a.at[0]), X, Y - (ground || a.swims || a.flutters ? 0 : 3)); sleepZs(X + 10, Y - (a.spr.height - T) - 2, now, a.at[0] * 731); continue; }   // asleep: still, little Zs (a day animal at night, a night one by day: js/art.js)
    if (a.flutters){ drawFlutter(a, X, Y, now); continue; }
    if (a.swims){ drawSwimmer(a, X, Y, now); continue; }
    const up = (ground ? 0 : 3 + Math.floor(now/600 + a.at[0]) % 2) + meetHop(a, X, Y - (a.spr.height - T), now);   // (its heart over its head)
    figureShadow(a.hz, X, Y); drawFigure(towardsYou(a, a.at[0]), X, Y - up);   // (looking your way)
  }
  // several of a kind out where each came out (stays), such as the bees over the flowers in their valley, each hovering,
  // looking your way, and one that still wants to play (not your friend yet) with a ! over it; and those flying off
  const bubbles = [];
  for (const o of outHere()){
    const X = o.x*T - cx, Y = o.y*T - cy;
    if (X < -T || Y < -T || X > VW*T || Y > VH*T) continue;
    const hover = drawHover(o.a, o.x, o.y, X, Y, now);
    if (!o.friend && !(foe && foe.x === o.x && foe.y === o.y)) bubbles.push([X + 10, Y - 8 - hover, '!']);
  }
  drawFlyers(cx, cy, now);
  // tall grass rustling where an animal hides; tall flowers shaking, their blossoms tossing, with little lines either side
  if (rustle && canWild() && Math.floor(now / 160) % 6 < 3){
    const X = rustle.x*T - cx, Y = rustle.y*T - cy;
    if (tileAt(rustle.x, rustle.y).look === 'tallFlowers'){
      for (let i = 0; i < 4; i++){ const sx = X + 2 + i*4 + Math.round(Math.sin(now/45 + i*1.7) * 2), sy = Y + 3 + (i % 2) * 3;
        R(b, sx, sy + 2, 1, 6, '#2B6A33'); R(b, sx - 1, sy, 3, 3, '#1E4A24'); R(b, sx - 1, sy, 3, 2, TALL_BLOOMS[i % TALL_BLOOMS.length][0]); R(b, sx, sy + 1, 1, 1, '#D9962B'); }
      const k = Math.floor(now / 160) % 2;
      for (const [dx, dy] of [[-3, 3], [-4, 7], [18, 3], [19, 7]]) R(b, X + dx + (dx < 0 ? -k : k), Y + dy, 2, 1, '#FFFFFF');
    } else for (let i = 0; i < 5; i++){ const gx = X + 1 + i*3 + Math.round(Math.sin(now/45 + i)*1.5); R(b, gx, Y + 9 - (i % 2), 1, 5, '#2F6E38'); R(b, gx, Y + 8 - (i % 2), 1, 1, '#94D883'); }
  }
  drawBirds(cx, cy, now);
  // entities sorted by row (their ! and ? bubbles wait until after the over-layer)
  const ents = [...NPCS, ...FOLLOWERS].map(n => { const c = charPos(n, now); return {n, c, y:c.ground}; })   // (on your square, they're behind you)
    .concat([{p:true, y:pl.py}]).concat(foe ? [{f:true, y:foe.y*T}] : []).sort((a,c) => a.y - c.y);
  for (const e of ents){
    if (e.f){ drawFoe(cx, cy, now); continue; }
    if (e.p){
      if (sleepAt){ if (!sleepAt.room) drawAsleep(sleepAt.x*T - cx, sleepAt.y*T - cy); continue; }   // asleep in a bed (or in your room, out of sight)
      const moving = !!pl.mv, p = moving ? (now - pl.mv.t0) / (pl.mv.dur || STEP) : 0;
      const mid = moving && p > .15 && p < .85;
      const PX = Math.round(pl.px - cx), PY = Math.round(pl.py - cy);
      if (now - dunkT < DUNK_MS){ drawDunked(PX, PY, now); continue; }   // in the brook, off a stepping stone
      if (isStinky()) stinkHaze(PX, PY);   // (smelling of durian: a faint green haze under you, the lines rising off you after)
      if (pl.form) drawForm(pl.form, PX, PY, now, mid ? 1 + pl.parity : 0, pl.dir);   // turned into something (the turnInto step): only it, in your place, walking as you go, never your monkey under it
      else if (acting && ACTS[acting.kind]) ACTS[acting.kind](PX, PY, now, acting);   // doing something: sweeping, filling a bucket, lifting a sack, turning a key, picking fruit
      else if (swing && now - swing.t0 < SWING_MS){ if (swing.with === '斧头') drawChop(pl.dir, PX, PY, swing.t0, now); else drawSwing('player', pl.dir, PX, PY, swing.t0, now, HELD[swing.with] ? swing.with : undefined); }   // chopping with the axe, or swinging your stick (the hit step)
      else {
        if (moving && pl.mv.run) drawRunDust(PX, PY, now, pl.dir);
        if (liftedPic(here().lifted)) drawCarrying(here().lifted, PX, PY, pl.dir, mid ? 1 + pl.parity : 0, mid ? 1 : 0);   // (carrying something over your head)
        else drawEntityMonkey('player', PX, PY, pl.dir, now, mid ? 1 : 0, mid ? 1 + pl.parity : 0, 1);
      }
      if (pl.eating) drawEating(pl.eating, PX, PY, now);   // eating a meal (the eat step)
      if (now - puffAt < PUFF_MS) drawPuff(PX, PY, (now - puffAt) / PUFF_MS);
      if (fishing){   // your line in the water (js/fishing.js), and a ! when a fish bites
        drawRod(PX, PY, pl.dir, now, !!fishing.bite && !fishing.hooked);
        if (fishing.bite && !fishing.hooked) bubbles.push([PX + 5, PY - 10, '!']);
      }
      for (const [x, y, w, h] of feetInGrass()) coverFeet(x, y, w, h, cx, cy);   // the grass over your feet (parted round you, as the square you're in is)
      if (isFast(now)) drawEnergy(PX, PY, now, moving, pl.dir);
      if (isStinky()) drawStink(PX, PY, now);   // (smelling of durian: a green cloud round you)
      if (now < alertUntil) bubbles.push([PX + 5, PY - 10, '!']);
      if (now - wakeT < 1000) [[-3, 2], [17, 4], [-1, -4], [15, -3], [7, -7]].forEach(([dx, dy], i) => {   // waking up with all your hearts: sparkles
        const tw = (now / 200 + i) % 2 < 1; R(b, PX + dx, PY + dy, 1, 3, '#FFE27A'); R(b, PX + dx - 1, PY + dy + 1, 3, 1, tw ? '#FFFFFF' : '#FFE27A'); });
      continue;
    }
    const n = e.n, scared = !!(foe && foe.big) && FOLLOWERS.includes(n);   // (whoever's following you, trembling, as a big one rears up: wildBattle, js/battle.js)
    const X = Math.round(e.c.x) - cx + (scared && Math.floor(now / 70) % 2 ? 1 : 0), Y = Math.round(e.c.y) - cy;
    if (X < -T || Y < -T || X > VW*T || Y > VH*T) continue;
    if (n.asleep){ b.globalAlpha = fadeOf(n, now); drawSleeper(n, X, Y, now, n.bed); b.globalAlpha = 1; continue; }   // asleep for the night (js/daynight.js)
    const fade = fadeOf(n, now); if (fade < 1) b.globalAlpha = fade;   // (fading in, up for the day)
    const talking = speakingNow(n);   // (who's speaking to you now: a ring at their feet, and the gold arrow over them, not their !)
    if (talking) speakerRing(X, Y);
    if (n.mv && n.mv.run && now - n.mv.t0 < n.mv.dur) drawRunDust(X, Y, now, n.dir);   // (racing you)
    if (n.flies){   // one that flies, such as the queen bee
      drawFlying(n, X, Y, now, n.id.charCodeAt(0));
    } else if (n.cart){   // a cart, such as the one with the troop's things on it, its wheels turning as you pull it (js/havoc.js)
      drawCart(n, X, Y, e.c);
    } else if (n.look && MAP_SPRITES[n.look]){   // a character that looks like an animal, such as the wild boar on the path
      drawAnimal(n, X, Y, now, e.c);
    } else if (n.look === 'bird' && n.pecks){   // a bird pecking at what's on its square, such as a wild melon: its head down now and then
      const peck = Math.floor(now / 220 + n.x * 5 + n.y) % 7 < 2;
      b.drawImage(birdSprite(n.colour), X+4, Y+1 + (peck ? 1 : 0));
    } else if (n.look === 'bird'){   // a little bird (its colour: colour), hopping
      const hop = Math.floor(Math.abs(Math.sin(now/300)) * 3);
      R(b, X+5, Y+14, 6, 1, 'rgba(0,0,0,.2)'); b.drawImage(birdSprite(n.colour), X+4, Y+6 - hop);
      if (n.word && lvl(n.word) === 0) sparkle(X+13, Y+3, now, 3);
    } else if (PLAYS[n.id]){   // a monkey of the troop at play, such as building a tower of stones (or stopped to talk to you)
      drawPlaying(n, X, Y, now);
    } else if (inDrill(n)){   // training with you, in the master's cave: striking with a staff, in time with you (js/year.js)
      drawDrill(n, X, Y, now);
    } else if (practising(n)){   // a little monkey in training, facing its own way, swinging its stick now and then
      const t0 = swingStart(n, now);
      if (t0 !== null) drawSwing(n.kind, n.home.facing, X, Y, t0, now);
      else drawEntityMonkey(n.kind, X, Y, n.home.facing, now, 0, 0, n.x + n.y);
    } else {
      const idle = Math.floor(now/700 + n.x) % 2;
      drawEntityMonkey(n.kind, X, Y, n.dir, now, e.c.mid ? 1 : idle, e.c.mid ? 1 + (n.parity || 0) : 0, n.x + n.y);
    }
    if (FOLLOWERS.includes(n) && !n.flies) for (const [x, y, w, h] of feetInGrass(e.c.x, e.c.y)) coverFeet(x, y, w, h, cx, cy);   // the grass over their feet
    b.globalAlpha = 1;
    // a ! while they're stopping you (the stopsYou step), a ? while they're puzzled (the shop's, when you've asked for something
    // you didn't point at: buy, in js/world.js), or a ! or ? from the area's bubbles
    const bub = inClass.has(n.id) ? null : talking ? {show:'speaker'} : scared ? {show:'!'} : n.puzzled ? {show:'?'} : now < (n.calls || 0) || keptFor(n) ? {show:'!'} : now < (n.callingT || 0) ? {show:'note'} : (AREA.bubbles[n.id] || []).find(x => matches(x.if));   // (a note: calling out what they sell, callOut in js/world.js)   // (and something they kept for you; none in a lesson, such as PE's)
    if (bub) bubbles.push([bub.show === 'speaker' ? X+4 : X+10, Y - (bub.show === 'speaker' ? 6 + Math.round(Math.sin(now / 220)) : 8) - (n.look && MAP_SPRITES[n.look] ? MAP_SPRITES[n.look].rows.length - T : 0), bub.show]);   // (over a big one's head, such as the cow's)
  }
  drawGhosts(cx, cy, now);   // (anyone fading out, going to bed or getting up: js/daynight.js)
  drawDragonflies(cx, cy, now);
  drawSwarms(cx, cy, now);
  drawFires(cx, cy, now);   // (a fire's flames, such as in the brazier in the courtyard, winter: js/year.js)
  // the tops of big objects (a tree's leaves, the stall's awning), over anyone walking behind them
  drawLayer(topCanvas, cx, cy);
  for (const p of OBJECT_PIECES) if (!p.baked){ if (p.crawl) drawLogOver(p, cx, cy, now); else drawPiece(p, p.top, cx, cy, now); }
  drawFallingLeaves(cx, cy, now);
  drawSteam(cx, cy, now);
  drawHideTail(cx, cy, now);   // a little monkey's tail, poking out of where it's hiding (js/hide.js)
  for (const a of spotAnimals.filter(inTree)){   // the squirrel, small, up in its tree's leaves
    const X = a.at[0]*T - cx, Y = a.at[1]*T - cy, bob = Math.floor(now/600 + a.at[0]) % 2;
    if (X < -T || Y < -T || X > VW*T || Y > VH*T) continue;
    if (a.perch){ b.drawImage(towardsYou(a, a.at[0]), X, Y - a.perch - meetHop(a, X, Y - a.perch, now)); if (asleepNow(a)) sleepZs(X + 10, Y - a.perch - 4, now, a.at[0] * 731); continue; }   // perched up on something, still, such as the owl on its dead pine (asleep by day: Zs)
    if (asleepNow(a)){ b.drawImage(towardsYou(a, a.at[0]), 0, 0, 16, 16, X + 4, Y - 5, 10, 10); sleepZs(X + 11, Y - 9, now, a.at[0] * 731); continue; }   // (asleep up its tree, at night)
    b.drawImage(towardsYou(a, a.at[0]), 0, 0, 16, 16, X + 4, Y - 5 - bob - meetHop(a, X, Y - 8, now), 10, 10);
  }
  if (GLOOM){ drawGloom(cx, cy, sh, now); drawSparkles(cx, cy, now); }   // a gloomy place, such as the pine wood
  drawMist(cx, cy, sh, now);   // wisps of cloud drifting past, and mist rolling in (a place's clouds and mist: js/mountain.js)
  drawWeather(cx, cy, sh, now);   // the season's weather, petals, leaves or snow falling, and the evening (js/seasons.js)
  drawRain(cx, cy, sh, now);   // rain, every so often (js/daynight.js)
  drawDaylight(cx, cy, sh, now);   // the evening, the night and dawn, as the day goes round (js/daynight.js)
  drawNight(cx, cy, sh, now);   // a place at night (its night: js/mountain.js)
  for (const a of spotAnimals.filter(a => a.glints && GLOOM && awakeNow(a))) glinting(a, a.at[0]*T - cx, a.at[1]*T - cy - a.perch, now);   // (an owl's eyes, in the gloom, while it's awake)
  for (const [x, y, k] of glintsNow(now)) glint(x*T - cx + 8, y*T - cy + 11, k);   // things hidden off the path
  for (const [x, y, show] of bubbles) bubble(x, y, show);
  if (trainingCalls()) for (const [x, y] of TRAINING_TILES) if (tileAt(x, y).action === 'training') bubble(x*T - cx + 10, y*T - cy - 8, '!');   // words need practice (while the post stands)
  drawSplashes(cx, cy, now);
  drawChips(cx, cy, now);
  drawActFx(cx, cy, now);
  drawMarkers(cx, cy, now);
  const wk = (now - waterT) / 600;   // going through falling water: a rush of water covers the screen, then clears
  if (wk >= 0 && wk < 2){
    b.globalAlpha = (wk < 1 ? wk : 2 - wk) * .96; R(b, 0, 0, VW*T, VH*T, '#8FD0EE');
    for (let i = 0; i < 80; i++){ const x = (i * 37) % (VW*T), y = Math.floor(i * 53 + now * (.25 + (i % 3) * .1)) % (VH*T); R(b, x, y, 1, 7 + i % 9, i % 3 ? '#FFFFFF' : '#BFE8FA'); }
    b.globalAlpha = 1;
  }
  drawDim(now);   // counting with your eyes covered (js/hide.js)
  const sk = (now - sleepT) / sleepLen;   // sleeping in a bed: the cave goes dim and Zs float up from you, then it's light again
  if (sk >= 0 && sk < 1){
    const a = Math.min(1, sk / .2, (1 - sk) / .2), PX = Math.round(pl.px - cx), PY = Math.round(pl.py - cy);
    b.globalAlpha = a * .55; R(b, 0, 0, VW*T, VH*T, '#0B1024');   // (not too dark: you can still see yourself asleep)
    for (let k = 0; k < 3; k++){
      const ph = (sk * 2.5 + k / 3) % 1;
      b.globalAlpha = a * (1 - ph * .8); zee(PX + 10 + Math.round(ph * 14), PY - Math.round(ph * 26), 4 + k * 2, '#CFE8F7');
    }
    b.globalAlpha = 1;
  }
  const dark = fadeDark(now);   // (going through a way to another place: js/world.js)
  if (dark > 0){ b.globalAlpha = dark; R(b, 0, 0, VW*T, VH*T, '#000000'); b.globalAlpha = 1; }
}
// Steam: puffing out of a vent (puffing, js/world.js), a column of it billowing up over the way, with a hiss as it starts
// (a wisp or two just before, so you can see it coming); and over the hot pools, now and then a wisp drifting up.
const ventCycle = {};   // (the last puff of each vent you heard: one hiss a puff)
function steamCloud(x, y, r, a){ b.globalAlpha = a; oval(b, Math.round(x), Math.round(y), r + 1, Math.max(1, r - 1), '#E4EEF0'); oval(b, Math.round(x) - 1, Math.round(y) - 1, r, Math.max(1, r - 2), '#FFFFFF'); b.globalAlpha = 1; }
function drawSteam(cx, cy, now){
  const x0 = Math.floor(cx/T), y0 = Math.floor(cy/T);
  for (let y = y0; y <= y0 + VH; y++) for (let x = x0; x <= x0 + VW; x++){
    const t = tileAt(x, y), X = x*T - cx, Y = y*T - cy;
    if (t.vent){
      const v = t.vent, vt = ventTime(v, now), k = ((vt % v.every) + v.every) % v.every, cyc = Math.floor(vt / v.every);
      if (k < v.puff && v.wind){   // a gust of wind (a vent with wind, such as on the cliff road's walkway): streaks blowing across
        if (ventCycle[x + ',' + y] !== cyc){ ventCycle[x + ',' + y] = cyc; if (Math.abs(x - pl.x) + Math.abs(y - pl.y) <= 5) SFX.swish(); }
        const p = k / v.puff, fade = p < .8 ? 1 : (1 - p) / .2;
        b.globalAlpha = .85 * fade;
        for (let i = 0; i < 4; i++){ const wx = X - 8 + ((p * 40 + i * 9) % 32), wy = Y + 2 + i * 4; R(b, Math.round(wx), wy, 7, 1, '#FFFFFF'); R(b, Math.round(wx) + 7, wy - 1, 2, 1, '#FFFFFF'); }
        b.globalAlpha = 1;
      } else if (k < v.puff){
        if (ventCycle[x + ',' + y] !== cyc){ ventCycle[x + ',' + y] = cyc; if (Math.abs(x - pl.x) + Math.abs(y - pl.y) <= 5) SFX.hiss(.05); }
        const p = k / v.puff, fade = p < .8 ? 1 : (1 - p) / .2;
        for (let i = 0; i < 6; i++){
          const rise = ((p * 1.6 + i / 6) % 1), r = 3 + Math.round(rise * 5);
          steamCloud(X + 8 + Math.sin(i * 2.1 + now / 300) * 3, Y + 10 - rise * 20, r, (.85 - rise * .5) * fade);
        }
      } else if (v.every - k < 450 && !v.wind){ const p = 1 - (v.every - k) / 450; steamCloud(X + 8, Y + 9 - p * 4, 2, .5 * p); }
    } else if (t.look === 'hotPool' && rnd(x, y, 640) < .3){
      const ph = (now / 2800 + rnd(x, y, 641)) % 1;
      steamCloud(X + 4 + rnd(x, y, 642) * 8 + Math.sin(now / 700 + x) * 2, Y + 8 - ph * 16, 2 + Math.round(ph * 2), .45 * (1 - ph));
    }
  }
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
// An animal's eyes (glints: [x, y, w] each, in its sprite) glinting in the gloom over it, such as the owl's on its dead
// pine: the same yellow as the eyes that look out from deep in the trees, blinking now and then.
function glinting(a, X, Y, now){
  if ((now + a.at[0] * 431) % 3900 < 150 || X < -T || Y < -T || X > VW*T || Y > VH*T) return;
  for (const [gx, gy, w] of a.glints) R(b, X + gx, Y + gy, w || 1, 1, '#F5E36A');
}
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
// Little Zs drifting up from something asleep (an animal asleep at its spot: js/art.js's asleepNow), now and then.
function sleepZs(X, Y, now, seed = 0){ const ph = ((now + seed) % 2600) / 2600; b.globalAlpha *= 1 - ph; zee(X + Math.round(ph * 6), Y - Math.round(ph * 12), 3 + Math.round(ph * 2), '#CFE8F7'); b.globalAlpha = 1; }
function zee(x, y, s, c){ R(b, x, y, s, 1, c); R(b, x, y + s - 1, s, 1, c); for (let i = 1; i < s - 1; i++) R(b, x + s - 1 - i, y + i, 1, 1, c); }   // a little Z, s pixels across
// Little birds that land near you now and then and hop about for most of a minute. Walk up and face
// one to look at it (A); it flies off then, or if you step right onto it. Each is one colour, one of the area's birds'
// colours, once you know the word for a bird (decided 27 October 2026, as the flowers are): till then they're all blue, as
// 鸟's own picture, so you learn the word from it.
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
      if (t.look === 'grass' && !npcAt(x, y) && !animalAt(x, y) && Math.abs(x - pl.x) + Math.abs(y - pl.y) >= 3) spots.push([x, y]);   // (never under an animal, such as a bee out over the grass)
    }
    const colours = BIRD_WORD && lvl(BIRD_WORD) >= 1 ? AREA.birds.colours || [] : [];
    if (spots.length){ const [x, y] = spots[Math.floor(Math.random() * spots.length)]; birds.push({tx:x, ty:y, x:x*T + 4, y:y*T + 6, t0:now, until:now + 40000 + Math.random() * 30000, from:Math.random() < .5 ? -1 : 1,
      colour:colours[Math.floor(Math.random() * colours.length)]}); }
  }
  for (let i = birds.length - 1; i >= 0; i--){
    const bd = birds[i], near = pl.x === bd.tx && pl.y === bd.ty;   // you stepped right onto it
    if (!bd.off && (near || now > bd.until)) bd.off = now;
    const k = bd.off ? (now - bd.off) / 900 : 1 - Math.min(1, (now - bd.t0) / 1200);   // 0 on the ground, up to 1 in the air
    if (bd.off && k > 1){ birds.splice(i, 1); continue; }
    const X = Math.round(bd.x - cx + bd.from * k * 60), Y = Math.round(bd.y - cy - k * 70 - (k ? Math.abs(Math.sin(now/60)) * 2 : Math.floor(Math.abs(Math.sin(now/300 + i)) * 2)));
    if (!k) R(b, X+1, Y+7, 6, 1, 'rgba(0,0,0,.2)');
    b.drawImage(birdSprite(bd.colour), X, Y);
    if (!k && BIRD_WORD && lvl(BIRD_WORD) === 0) sparkle(X + 9, Y - 2, now, i);   // it sparkles until you know its word
  }
}
const ARROW = ["ooooooo","oyyyyyo",".oyyyo.","..oyo..","...o..."];
function pix(rows, X, Y, pal){ rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) R(b, X + x, Y + y, 1, 1, pal[ch]); })); }
function taskArrow(t, seen, cx, cy, now, pal){
  const W = VW*T, H = VH*T;
  if (seen(t.target)){ if (!t.npc) pix(ARROW, t.target[0]*T - cx + 4, t.target[1]*T - cy - 7 + Math.round(Math.sin(now/180) * 2), pal); return; }
  // off-screen: a small arrow at the screen edge, where the way there leaves it (arrowAim, js/world.js)
  const [ax, ay] = arrowAim(t.target, seen), X = ax*T - cx, Y = ay*T - cy;
  const mx = clamp(X + 8, 6, W - 6), my = clamp(Y + 8, 6, H - 6), pulse = (Math.sin(now/200) + 1) / 2 > .25;
  if (!pulse) return;
  let rows;
  if (X + 8 < 6) rows = ["...oo","..oyo",".oyyo","oyyyo",".oyyo","..oyo","...oo"];
  else if (X + 8 > W - 6) rows = ["oo...","oyo..","oyyo.","oyyyo","oyyo.","oyo..","oo..."];
  else if (Y + 8 < 6) rows = ["...o...","..oyo..",".oyyyo.","oyyyyyo","ooooooo"];
  else rows = ARROW;
  pix(rows, Math.round(mx - rows[0].length / 2), Math.round(my - rows.length / 2), pal);
}
// No task arrow while you fish, nor over the square you're facing: you're there, and it would hide what's there, such as
// your float (decided 29 October 2026, after playing it: it hid the float in the riverside brook's shallows).
const arrowHidden = t => !!fishing || (Array.isArray(t.target) && String(t.target.slice(0, 2)) === String(facing()));   // (its target: a square in the place you're in)
function drawMarkers(cx, cy, now){
  const W = VW*T, H = VH*T, pal = {o:'#1E2B26', y:'#F2C14E'};
  const seen = ([x, y]) => { const X = x*T - cx, Y = y*T - cy; return X > -8 && X < W - 8 && Y > -4 && Y < H - 8; };
  const t = aimedTask();   // one arrow, for the newest task, or the one you chose to follow
  if (t && t.target && !arrowHidden(t)) taskArrow(t, seen, cx, cy, now, pal);
  const lab = currentPrompt(now);
  if (lab && lab !== 'OK' && !(lab === 'Hop' && hopQuestion(hopAhead()))){   // (not over stepping stones with their pictures)
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
// so it's all above them. In the season the place is in (VIEW_SEASONS).
function drawLookout(t, now){
  const W = VW*T, hz = 46, v = viewSeason();
  for (let y = 0; y < hz; y += 2) R(b, 0, y, W, 2, mix(v.sky[0], v.sky[1], y / hz));   // the sky
  const cloud = cloudPuff, drift = t * 1.2;   // (the clouds drift slowly to the right)
  cloud(18 + drift, 12, 1); cloud(140 + drift * .7, 8, 1.3); cloud(204 + drift * .5, 26, .7);
  for (const [k, by] of [[0, 20], [.12, 25]]){   // two birds flying past
    const bx = Math.round(-10 + ((t * 22 + k * 260) % 280)), flap = Math.sin(now / 90 + k * 9) > 0;
    R(b, bx - 2, by + (flap ? 0 : 1), 2, 1, '#3A4A5A'); R(b, bx, by + 1, 1, 1, '#3A4A5A'); R(b, bx + 1, by + (flap ? 0 : 1), 2, 1, '#3A4A5A');
  }
  for (let x = 0; x < W; x++){   // islands, far off on the horizon
    const isle = (c, w, h) => Math.max(0, Math.round(h * (1 - ((x - c) / w) ** 2)));
    const hh = Math.max(isle(178, 20, 6), isle(198, 9, 3), isle(62, 11, 3));
    if (hh) R(b, x, hz - hh, 1, hh, v.isles);
  }
  for (let y = hz; y < 80; y += 2) R(b, 0, y, W, 2, mix(v.sea[0], v.sea[1], (y - hz) / 34));   // the sea
  R(b, 0, hz, W, 1, '#A9D7F0');
  for (let i = 0; i < 22; i++){ const sx = Math.floor(rnd(i, 31) * W), sy = hz + 3 + Math.floor(rnd(i, 32) * 14); if (Math.sin(now / 420 + i) > .2) R(b, sx, sy, 3, 1, '#D6F2FF'); }   // sun on the sea
  for (let x = 0; x < W; x += 2){ const h = Math.round(60 + Math.sin(x / 19) * 2 + Math.sin(x / 7)); R(b, x, h, 2, 100 - h, v.shore); }   // the land along the shore
  for (let y = 62; y < 100; y++){   // the river, winding out to the sea
    const rx = Math.round(118 + Math.sin(y / 7) * 8 + (y - 62) * .4), w = 2 + Math.floor((y - 62) / 13);
    R(b, rx, y, w, 1, '#5FA6D6'); if (y === 62) R(b, rx - 1, y - 1, w + 2, 1, '#5FA6D6');
  }
  const slope = (from, to, top, bot, col, seed) => {   // the hillside going down, one side of the view
    for (let x = from; x !== to; x += Math.sign(to - from) * 2){
      const k = Math.abs(x - from) / Math.abs(to - from), h = Math.round(top + (bot - top) * Math.pow(k, .8) + rnd(x >> 1, seed) * 2);
      R(b, Math.min(x, x - 1), h, 2, 120 - h, col); R(b, Math.min(x, x - 1), h, 2, 1, mix(col, v.lip, .5));
    }
    for (let i = 0; i < 22; i++){   // its trees
      const k = rnd(i, seed) * .9, x = Math.round(from + (to - from) * k), y = Math.round(top + (bot - top) * Math.pow(k, .8)) + 4 + Math.floor(rnd(i, seed + 1) * 24), [leaf, lit] = v.trees[i % v.trees.length];
      if (y < 110){ disc(b, x, y, 3, leaf); disc(b, x - 1, y - 1, 1, lit); }
    }
  };
  slope(0, 104, 54, 120, v.slopes[0], 51); slope(W, 150, 58, 120, v.slopes[1], 61);
  lookoutRail(v, now);
}
// The lookout's flat rock and its railing, with you at it, looking out, in front of a view (v: its season's colours);
// what's falling in the season (petals, leaves or snow) drifting down over it all.
function lookoutRail(v, now){
  const W = VW*T;
  R(b, 0, 100, W, 60, v.rock[0]); R(b, 0, 100, W, 1, v.rock[1]);   // the lookout's flat rock
  for (let i = 0; i < 30; i++) R(b, Math.floor(rnd(i, 71) * W), 102 + Math.floor(rnd(i, 72) * 20), 2, 1, i % 3 ? v.rock[2] : v.rock[3]);
  if (v.fallen) for (let i = 0; i < 14; i++) R(b, Math.floor(rnd(i, 73) * W), 103 + Math.floor(rnd(i, 74) * 18), 2, 1, v.fallen[i % v.fallen.length]);   // (leaves, blown onto it)
  b.drawImage(monkeySprite('player', 'up', false), 104, 74, 32, 32);   // you, looking out
  for (const px of [4, 46, 88, 147, 189, 231]){ R(b, px, 88, 5, 40, WOOD[0]); R(b, px, 88, 4, 40, WOOD[2]); R(b, px, 88, 1, 40, WOOD[3]); R(b, px, 88, 5, 1, WOOD[4]); }   // the railing
  for (const ry of [92, 101]){ R(b, 0, ry, W, 4, WOOD[0]); R(b, 0, ry, W, 3, WOOD[2]); R(b, 0, ry, W, 1, WOOD[3]); }
  if (v.snow){ for (const ry of [92, 101]) R(b, 0, ry - 1, W, 2, v.snow); for (const px of [4, 46, 88, 147, 189, 231]) R(b, px, 87, 5, 2, v.snow); }   // (snow along its rails)
  const f = FALLING[v.season];
  if (f) fallOver(f, f.n, 0, 0, VH*T, now);
}
// Each colour of the views from the lookouts, by season (decided 7 November 2026, after playing it: home in autumn, the
// view was still summer's): summer's are the view as it was drawn; autumn's slopes and pasture golden, the trees red,
// orange and gold, the far land and hills dun, a hazy sky, leaves on the rock; winter's under snow, bare trees and
// snowy pines; spring's fresh, with blossom.
const VIEW_SEASONS = {
  summer: {sky:['#6AB4E2', '#D6EEF7'], isles:'#93B6C8', sea:['#68B0DE', '#2F78B4'], shore:'#6FA889', slopes:['#4F9A55', '#468F4D'], lip:'#A9E08F',
    trees:[['#2F7A3E', '#4E9A55']], hills:'#8FB7A4', pasture:['#7FC46A', '#6CB85A'], pastureTrees:[['#3F8A44', '#5FAE58']],
    flowers:['#F2F2EC', '#F2A6C8', '#F2F2EC', '#6FA3E8', '#F2F2EC'], pines:['#1F4A35', '#15382A'], rock:['#B9B3A5', '#D6D1C4', '#A7A193', '#CFCABD']},
  autumn: {sky:['#74A9D6', '#EEDCC0'], isles:'#A8B4B8', sea:['#64A4D0', '#2E6EA6'], shore:'#B3A372', slopes:['#C0913E', '#AE8236'], lip:'#F0D58A',
    trees:[['#C8502A', '#E8804A'], ['#D98A2A', '#F2B054'], ['#B8862E', '#E8C462'], ['#A4461E', '#D06A2A']], hills:'#B9AC8C', pasture:['#D6B666', '#C8A658'],
    pastureTrees:[['#C8502A', '#E8804A'], ['#D98A2A', '#F2B054'], ['#C09038', '#EAC662']],
    flowers:['#F2F2EC', '#F2C14E', '#F2F2EC', '#E8883A', '#F2F2EC'], pines:['#21432F', '#163325'], rock:['#B9B3A5', '#D6D1C4', '#A7A193', '#CFCABD'],
    fallen:['#E08A3A', '#C8502A', '#F0C050']},
  winter: {sky:['#A3B9CB', '#E6ECF0'], isles:'#B9C6CF', sea:['#7FA0B8', '#41698C'], shore:'#E4EAEE', slopes:['#E6ECF0', '#D9E1E8'], lip:'#FFFFFF',
    trees:[['#6A5A4A', '#8B7966'], ['#2E5444', '#F2F6FA']], hills:'#CBD5DC', pasture:['#EEF2F5', '#E3E9EE'], pastureTrees:[['#6A5A4A', '#8B7966'], ['#2E5444', '#F2F6FA']],
    flowers:[], pines:['#2B4A3E', '#1F3A31'], rock:['#D9DEE3', '#F4F7FA', '#C6CDD4', '#E9EDF1'], snow:'#F4F8FC'},
  spring: {sky:['#7CC0EA', '#E4F3F8'], isles:'#A0C0D0', sea:['#6CB4E0', '#3480BC'], shore:'#7DB894', slopes:['#5DAA58', '#539F50'], lip:'#C2EEA4',
    trees:[['#E58FB0', '#F9CFDD'], ['#3F8E48', '#6CC066'], ['#F2A9C2', '#FFE3EC']], hills:'#9CC4AE', pasture:['#8CD274', '#79C664'],
    pastureTrees:[['#E58FB0', '#F9CFDD'], ['#4A9A4E', '#76C66C']], flowers:['#FFFFFF', '#F2A6C8', '#F7D23E', '#6FA3E8', '#F48FB1'], pines:['#21503A', '#16402E'],
    rock:['#B9B3A5', '#D6D1C4', '#A7A193', '#CFCABD']}
};
for (const [season, v] of Object.entries(VIEW_SEASONS)) v.season = season;
const viewSeason = () => VIEW_SEASONS[seasonNow() || 'summer'] || VIEW_SEASONS.summer;   // (the season the place you're looking out from is in)
/* ---- the view from the south slope's lookout ---- */
// What you see from the lookout on the south slope (chapter 1, decided 27 October 2026: you see where you're going): hills far
// off; below, a sunny pasture with trees and flowers, and a spring with a little stream out of it; between, the dark pines,
// a stream glinting through them; the slope going down either side; and you, at the railing, looking out. While the cow is
// lost (till it's home: the scene's def.home says it's just the view), it's there, by its spring, small and far off, with an
// arrow over it, so you see it.
function drawCowView(t, now, def = {}){
  const W = VW*T, v = viewSeason();
  for (let y = 0; y < 40; y += 2) R(b, 0, y, W, 2, mix(v.sky[0], v.sky[1], y / 40));   // the sky
  cloudPuff(20 + t * 1.2, 10, 1); cloudPuff(150 + t * .8, 6, 1.2);
  for (let x = 0; x < W; x += 2){ const h = Math.round(30 + Math.sin(x / 23) * 4 + Math.sin(x / 9) * 2); R(b, x, h, 2, 60 - h, v.hills); }   // hills far off
  for (let y = 36; y < 70; y += 2) R(b, 0, y, W, 2, mix(v.pasture[0], v.pasture[1], (y - 36) / 34));   // the pasture
  [[24, 46], [60, 40], [196, 44], [222, 52], [104, 42], [168, 38]].forEach(([tx, ty], i) => { const [leaf, lit] = v.pastureTrees[i % v.pastureTrees.length]; disc(b, tx, ty, 3, leaf); disc(b, tx - 1, ty - 1, 1, lit); });   // its trees
  [[40, 54], [44, 56], [140, 60], [146, 58], [80, 62]].forEach(([fx, fy], i) => { if (v.flowers[i]) R(b, fx, fy, 2, 1, v.flowers[i]); });   // flowers
  disc(b, 128, 52, 5, '#4F9BD8'); R(b, 123, 50, 10, 4, '#4F9BD8'); R(b, 125, 50, 4, 1, '#A9D7F0');   // the spring
  for (let x = 132; x < 200; x++) R(b, x, 53 + Math.round(Math.sin(x / 8) * 2), 1, 1, '#4F9BD8');   // and its little stream
  if (!def.home && here().cow < 4){   // the cow, by its spring, and an arrow over it
    ["......bb", ".wwwwbwo", "wbbwwwww", "wwwwbbw.", ".w.w.w.w"].forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') R(b, 110 + x, 47 + y, 1, 1, {w:'#FFFFFF', b:'#5A3A22', o:'#E8A0A0'}[c]); }));
    pix(ARROW, 111, 37 + Math.round(Math.sin(now / 180) * 1.5), {o:'#1E2B26', y:'#F2C14E'});
  }
  for (let x = 0; x < W; x += 2){ const top = Math.round(66 + Math.sin(x / 13) * 2 + rnd(x >> 1, 41) * 3); R(b, x, top, 2, 40, v.pines[0]); }   // the dark pines
  for (let i = 0; i < 70; i++){ const px = Math.floor(rnd(i, 43) * W), py = 66 + Math.floor(rnd(i, 44) * 28); R(b, px, py, 1, 3, v.pines[1]); R(b, px - 1, py + 2, 3, 2, v.pines[1]); if (v.snow) R(b, px, py, 1, 1, v.snow); }
  for (let x = 0; x < W; x++) if (Math.sin(x / 5) > -.2) R(b, x, 80 + Math.round(Math.sin(x / 20) * 1.5), 1, 1, '#4F86A8');   // a stream glinting through them
  const side = (from, to, top, bot, col, seed) => {   // the slope going down, either side of the view
    for (let x = from; x !== to; x += Math.sign(to - from) * 2){
      const k = Math.abs(x - from) / Math.abs(to - from), h = Math.round(top + (bot - top) * Math.pow(k, .8) + rnd(x >> 1, seed) * 2);
      R(b, Math.min(x, x - 1), h, 2, 120 - h, col); R(b, Math.min(x, x - 1), h, 2, 1, mix(col, v.lip, .5));
    }
  };
  side(0, 70, 70, 112, v.slopes[0], 51); side(W, 170, 74, 112, v.slopes[1], 61);
  lookoutRail(v, now);
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
/* ---- the feast, and sailing away (the end of chapter 1) ---- */
// The feast (told like the opening; its captions in the area's scenes): the troop round the feast's tables at the home
// ground, close up, drawn as on the map at twice the size, eating; from 3, the old monkey stands at the end of the table,
// telling the story of your first days, and at 21 (小猴子很快乐！) the troop jumps for joy. At 24 (可是美猴王不快乐。),
// dusk, and you, sitting alone on a rock, a tear falling: you'll grow old. At 30 (海那边有神仙。), the old monkey shows
// you the sea, and far across it a mountain in the clouds, glowing gold, where the immortals live. From 36 (我要去找神仙！),
// sunrise, and you, standing on the rock, looking out to sea.
const feastCv = document.createElement('canvas');
function drawFeast(t, now){
  const W = VW*T, H = VH*T, blink = now % 3200 < 130;
  if (t < 24){
    feastCv.width = 120; feastCv.height = 80;
    const g = feastCv.getContext('2d'); g.imageSmoothingEnabled = false;
    g.save(); g.translate(-4, 3);
    for (let y = -1; y < 6; y++) for (let x = 0; x < 9; x++) LOOKS.grass(g, x*T, y*T, x, y + 40);
    const joy = t >= 21, hop = (i) => joy ? Math.round(Math.abs(Math.sin(now / 160 + i)) * 4) : 0;
    [['troop2', 0], ['hungry', 1], ['thirsty', 2], ['big', 4], ['boss', 5], ['fisher', 6]].forEach(([id, x], i) =>   // behind the tables, facing you
      g.drawImage(monkeySprite(id, 'down', blink && i % 2 === 0), x*T, T - 6 - hop(i)));   // (their faces over the food)
    OBJECT_ART.fruitTableMelon(g, {x:0, y:2, stage:1}); OBJECT_ART.fruitTableGrapes(g, {x:1, y:2, stage:1}); OBJECT_ART.fruitTableBananas(g, {x:2, y:2, stage:1});
    OBJECT_ART.crabTable(g, {x:3, y:2, stage:2}); OBJECT_ART.feastTableHoney(g, {x:4, y:2, w:3});
    OBJECT_ART.stoneStool(g, {x:1, y:3}); OBJECT_ART.stoneStool(g, {x:5, y:3});
    [['playful', 1], ['player', 3], ['hider', 5]].forEach(([id, x], i) =>   // in front, on the stools, facing the table
      g.drawImage(monkeySprite(id, 'up', false), x*T, 3*T - 3 - hop(i + 3)));
    const tell = t >= 3, bob = tell && !joy ? Math.round(Math.sin(now / 260)) : 0;   // the old monkey, at the end, telling your story
    g.drawImage(monkeySprite('elder', tell ? 'left' : 'down', blink), 7*T - 10, 2*T + 2 + bob - hop(7));
    g.restore();
    b.drawImage(feastCv, 0, 0, 120, 80, 0, 0, W, H);
    return;
  }
  if (t < 30){   // dusk: you, alone on a rock, sad
    for (let y = 0; y < H; y += 2) R(b, 0, y, W, 2, mix('#3B3160', '#E0946E', y / H));
    for (let i = 0; i < 12; i++) if (Math.sin(now / 500 + i) > .3) R(b, Math.floor(rnd(i, 91) * W), Math.floor(rnd(i, 92) * 50), 1, 1, '#FFF4C8');   // the first stars
    for (let x = 0; x < W; x += 2){ const h = Math.round(88 + Math.sin(x / 23) * 3); R(b, x, h, 2, H - h, '#3E5A3C'); }   // the hill, dark
    disc(b, 120, 98, 22, '#6E685C'); R(b, 98, 98, 45, 62, '#6E685C'); disc(b, 116, 92, 10, '#857E70');   // your rock
    b.drawImage(monkeySprite('player', 'down', true), 104, 52, 32, 32);   // (eyes down)
    const k = (now % 1500) / 1500; R(b, 114, Math.round(68 + k * 16), 1, 2, '#9CD3F5'); R(b, 114, Math.round(68 + k * 16) + 2, 1, 1, '#D6EEFA');   // a tear
    return;
  }
  // the sea, by day: far across it, a mountain in the clouds, glowing gold (from 36, sunrise: you, standing, looking out)
  const hz = 70, rise = clamp((t - 36) / 2, 0, 1);
  for (let y = 0; y < hz; y += 2) R(b, 0, y, W, 2, t < 36 ? mix('#6AB4E2', '#D6EEF7', y / hz) : mix(mix('#F2A866', '#6AB4E2', rise), '#FFE8B8', y / hz));
  if (t >= 36){ disc(b, 40, hz - 4 - Math.round(rise * 10), 9, '#FFD27A'); }   // the sun coming up
  const glow = .55 + .25 * Math.sin(now / 500), gl = b.createRadialGradient(186, 44, 2, 186, 44, 34);
  gl.addColorStop(0, `rgba(255,224,130,${glow})`); gl.addColorStop(1, 'rgba(255,224,130,0)'); b.fillStyle = gl; b.fillRect(140, 8, 92, 70);
  for (let x = 160; x < 214; x++){ const h = Math.max(0, Math.round(30 * (1 - Math.abs(x - 187) / 27) ** 1.3)); if (h) R(b, x, hz - h, 1, h, '#8FA9C4'); }   // the immortals' mountain
  cloudPuff(176 + Math.sin(now / 900) * 3, 50, 1); cloudPuff(198 - Math.sin(now / 1100) * 3, 46, .8); cloudPuff(187, 36, .7);
  for (let y = hz; y < H; y += 2) R(b, 0, y, W, 2, mix('#68B0DE', '#2F78B4', (y - hz) / (H - hz)));   // the sea
  R(b, 0, hz, W, 1, '#A9D7F0');
  for (let i = 0; i < 18; i++){ const sx = Math.floor(rnd(i, 93) * W), sy = hz + 4 + Math.floor(rnd(i, 94) * 30); if (Math.sin(now / 420 + i) > .3) R(b, sx, sy, 3, 1, '#D6F2FF'); }
  disc(b, 52, 130, 40, '#7D7668'); R(b, 0, 104, 92, 56, '#7D7668'); R(b, 0, 104, 92, 1, '#9A9384');   // the rock you stand on, by the sea
  if (t < 36){
    b.drawImage(monkeySprite('elder', 'right', blink), 18, 74, 32, 32);   // the old monkey, showing you
    b.drawImage(monkeySprite('player', 'right', blink), 54, 74, 32, 32);
  } else {
    b.drawImage(monkeySprite('player', 'right', false), 40, 72, 32, 32);   // you, standing, looking out to sea
    for (let i = 0; i < 6; i++){ const a = now / 700 + i, r = 22; if (Math.sin(now / 200 + i * 2) > .4) R(b, Math.round(56 + Math.cos(a) * r), Math.round(86 + Math.sin(a) * r * .6), 1, 1, '#FFE27A'); }
  }
}
// Sailing away: the troop on the shore, waving, at the foot of Flower Fruit Mountain, and you on your raft, sailing out
// across the sea, getting smaller.
function drawSailAway(t, now){
  const W = VW*T, H = VH*T, hz = 56, blink = now % 3200 < 130;
  for (let y = 0; y < hz; y += 2) R(b, 0, y, W, 2, mix('#6AB4E2', '#D6EEF7', y / hz));
  cloudPuff(60 + t * 1.5, 16, 1); cloudPuff(170 + t, 24, .8);
  for (let y = hz; y < H; y += 2) R(b, 0, y, W, 2, mix('#68B0DE', '#2F78B4', (y - hz) / (H - hz)));
  R(b, 0, hz, W, 1, '#A9D7F0');
  for (let i = 0; i < 20; i++){ const sx = Math.floor(rnd(i, 95) * W), sy = hz + 4 + Math.floor(rnd(i, 96) * 90); if (Math.sin(now / 420 + i) > .4) R(b, sx, sy, 3, 1, '#D6F2FF'); }
  for (let x = 0; x < 120; x++){ const h = Math.max(0, Math.round(70 * (1 - (x / 120) ** 1.6))); R(b, x, hz + 40 - h, 1, h, x % 7 ? '#4F9A55' : '#468F4D'); }   // Flower Fruit Mountain, behind the shore
  for (let i = 0; i < 14; i++) disc(b, Math.floor(rnd(i, 97) * 90), hz + 40 - Math.floor(rnd(i, 98) * 50), 3, '#2F7A3E');   // its trees
  R(b, 0, hz + 40, 130, 14, '#EAD49C'); for (let x = 0; x < 130; x += 2) R(b, x, hz + 53 + Math.round(Math.sin(now / 500 + x / 9)), 2, 2, '#F4FBFF');   // the shore, foam along it
  [['elder', 10], ['big', 30], ['playful', 50], ['hungry', 70], ['thirsty', 90]].forEach(([id, x], i) => {   // the troop, waving
    const hop = Math.round(Math.abs(Math.sin(now / 200 + i)) * 3);
    b.drawImage(monkeySprite(id, 'right', blink && i % 2 === 0), x, hz + 26 - hop, 16, 16);
  });
  const k = clamp(t / 9, 0, 1), s = 1 - k * .6, rx = Math.round(120 + k * 90), ry = Math.round(hz + 70 - k * 52);   // the raft, sailing out
  const rw = Math.round(30 * s), rh = Math.round(9 * s), bobY = Math.round(Math.sin(now / 400) * 1.5);
  R(b, rx - rw/2, ry + bobY, rw, rh, '#6E4A28'); for (let i = 0; i < 4; i++) R(b, rx - rw/2, ry + bobY + Math.round(i * rh / 4), rw, 1, '#9C6A3C');
  b.drawImage(monkeySprite('player', 'right', false), Math.round(rx - 12 * s), Math.round(ry + bobY - 22 * s), Math.round(24 * s), Math.round(24 * s));
  R(b, rx - rw/2 - 3, ry + bobY + rh, rw + 6, 1, 'rgba(255,255,255,.6)');   // its wake
}
const SCENE_ART = {feast: drawFeast, sailAway: drawSailAway, becomingKing: drawBecomingKing, buildingSchool: drawBuildingSchool, paintingSchool: drawPaintingSchool, lookout: drawLookout, cowView: drawCowView};
