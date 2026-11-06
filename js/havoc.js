// The Demon of Havoc's look (Area 2, chapter 2, decided 5 November 2026 from the plan's mock-ups): his mountain far to the
// north, gloomy as the dark pines, nothing like home's: ashy ground, dry grass where little demons hide, dead pines, a black
// pool, torches, the cages the troop's little ones are locked in, the heap of things his little demons took, and his cave's
// mouth in the cliff, its name over it (水脏洞); and at home, the feast's tables, bare once they took everything off them,
// and your cloud, waiting to fly you north. And the chapter's scenes: the hair trick (毛, 变！), and flying north and home
// on your cloud. (Loaded after js/mountain.js: it adds to LOOKS, OBJECT_ART, HANZI and SCENE_ART.)

Object.assign(HANZI, {   // the cave's name: 水脏洞 (水 and 洞 are drawn already)
  '脏': ["###....#..", "#.#.######", "###.#.....", "#.#.#..#..", "###.#.###.", "#.#.#..#..", "#.#.#..#..", "#.#.#..#..", "#.#.#.####"]
});

/* ---- the ground ---- */
// Dry, dark, ashy grass: the demon's mountain's ground.
function ash(g, X, Y, x, y){
  R(g, X, Y, T, T, '#5A5E44');
  for (let i = 0; i < 10; i++) R(g, X + Math.floor(rnd(x, y, 930 + i) * 15), Y + Math.floor(rnd(x, y, 940 + i) * 15), i % 3 ? 1 : 2, i % 2 ? 2 : 1, ['#4A4E36', '#6A6C4E', '#3E3A30'][i % 3]);
}
// Bare earth, trodden hard by the little demons: the way up to the cave, and in front of it.
function trampled(g, X, Y, x, y){
  R(g, X, Y, T, T, '#6E5A48');
  for (let i = 0; i < 8; i++) R(g, X + Math.floor(rnd(x, y, 900 + i) * 15), Y + Math.floor(rnd(x, y, 910 + i) * 15), 2, 1, i % 2 ? '#5E4A3A' : '#7E6A56');
}
// Long, dry grass, where little demons hide (its legend's wild).
function deadGrass(g, X, Y, x, y){
  ash(g, X, Y, x, y);
  for (let i = 0; i < 7; i++){
    const px = X + 1 + ((i * 5 + x * 3) % 13), py = Y + 3 + ((i * 7 + y * 5) % 10);
    R(g, px, py, 1, 5, '#7E7A48'); R(g, px + 1, py + 1, 1, 4, '#9A9460'); R(g, px - 1, py + 2, 1, 3, '#5E5A36');
  }
}
// A black pool.
function murk(g, X, Y, x, y){
  R(g, X, Y, T, T, '#1E2A26');
  for (let i = 0; i < 3; i++) R(g, X + 2 + ((i * 6 + x * 4) % 11), Y + 3 + ((i * 5 + y * 3) % 10), 3, 1, '#3A4A42');
}
// A torch on a pole, burning (火), in front of the cave.
function torch(g, X, Y, x, y){
  trampled(g, X, Y, x, y);
  oval(g, X + 8, Y + 15, 3, 1, '#4A3A2C');
  R(g, X + 7, Y + 6, 2, 9, '#4A2E18'); R(g, X + 7, Y + 6, 1, 9, '#6A4428'); R(g, X + 6, Y + 6, 4, 1, '#2E1C10');
  R(g, X + 5, Y + 2, 6, 4, '#E8662A'); R(g, X + 6, Y, 4, 4, '#F6A23A'); R(g, X + 7, Y + 1, 2, 3, '#FCE07A');
}
// A wooden cage on the trodden earth: a little monkey sitting inside, looking out through the bars (locked), or its door
// hanging open and nobody in it (open).
function cage(g, X, Y, x, y, open){
  trampled(g, X, Y, x, y);
  R(g, X + 1, Y + 14, 14, 2, 'rgba(0,0,0,.35)');
  R(g, X + 2, Y + 3, 12, 11, '#3A2A20');   // dark inside
  if (!open){   // a little monkey, sitting, looking out
    const F = '#C8843E', S = '#F6D2A8', O = '#4A2C17';
    R(g, X + 4, Y + 4, 8, 7, O); R(g, X + 5, Y + 5, 6, 5, F); R(g, X + 6, Y + 6, 4, 4, S); R(g, X + 3, Y + 6, 2, 2, F); R(g, X + 11, Y + 6, 2, 2, F);
    R(g, X + 6, Y + 7, 1, 1, '#24160C'); R(g, X + 9, Y + 7, 1, 1, '#24160C'); R(g, X + 7, Y + 9, 2, 1, '#C98E6A');
    R(g, X + 4, Y + 11, 8, 3, F); R(g, X + 5, Y + 12, 6, 1, S);
  }
  R(g, X + 1, Y + 1, 14, 2, '#5A3A1E'); R(g, X + 1, Y + 1, 14, 1, '#8A5A30'); R(g, X + 1, Y + 13, 14, 2, '#5A3A1E');   // its roof and floor
  for (const bx of open ? [1, 14] : [1, 4, 7, 10, 14]) R(g, X + bx, Y + 2, 1, 12, '#9A6A3A');   // its bars
  if (open) for (const bx of [-2, 1, 4]) R(g, X + bx, Y + 3, 1, 10, '#9A6A3A');   // (its door, swung open to the left)
  else { R(g, X + 7, Y + 7, 3, 3, '#3A3A40'); R(g, X + 8, Y + 8, 1, 1, '#8A8A90'); }   // the lock
}
// The things the little demons took from the feast's tables, in a heap on the earth (each square one of them: what), for
// I spy with a little monkey: bowls, peaches, apples, honey, milk.
function loot(g, X, Y, x, y, what){
  trampled(g, X, Y, x, y);
  oval(g, X + 8, Y + 12, 7, 3, '#5E4A3A');
  if (what === 'bowls'){ tableBowl(g, X + 5, Y + 13); tableBowl(g, X + 11, Y + 13); tableBowl(g, X + 8, Y + 9); }
  if (what === 'peaches') [[-3, 0], [3, 0], [0, -4]].forEach(([dx, dy]) => bigFruit(g, X + 8 + dx, Y + 10 + dy, PEACHES));
  if (what === 'apples') [[-3, 0], [3, 0], [0, -4]].forEach(([dx, dy]) => bigFruit(g, X + 8 + dx, Y + 10 + dy, APPLES));
  if (what === 'honey'){ tableBowl(g, X + 8, Y + 13); bowlFull(g, X + 8, Y + 13, '#E8A93A', '#F7C95A', '#FFE9A8'); }
  if (what === 'milk') milkJug(g, X + 8, Y + 14);
}
// Your cloud, waiting just over the ground (on grass at home, on ash on the demon's mountain): A at it flies you off.
function cloudOver(ground){
  return (g, X, Y, x, y) => {
    ground(g, X, Y, x, y);
    oval(g, X + 8, Y + 14, 6, 1, 'rgba(0,0,0,.18)');
    for (let k = 0; k < 4; k++) oval(g, X + 3 + k * 3, Y + 9 - (k % 2) * 2, 4, 3, '#DCE6EE');
    for (let k = 0; k < 4; k++) oval(g, X + 3 + k * 3, Y + 8 - (k % 2) * 2, 3, 2, '#FFFFFF');
  };
}
Object.assign(LOOKS, {
  ash, trampled, deadGrass, murk, torch,
  cage: (g, X, Y, x, y) => cage(g, X, Y, x, y, false), cageOpen: (g, X, Y, x, y) => cage(g, X, Y, x, y, true),
  lootBowls: (g, X, Y, x, y) => loot(g, X, Y, x, y, 'bowls'), lootPeaches: (g, X, Y, x, y) => loot(g, X, Y, x, y, 'peaches'),
  lootApples: (g, X, Y, x, y) => loot(g, X, Y, x, y, 'apples'), lootHoney: (g, X, Y, x, y) => loot(g, X, Y, x, y, 'honey'),
  lootMilk: (g, X, Y, x, y) => loot(g, X, Y, x, y, 'milk'),
  cloudGrass: cloudOver(LOOKS.grass), cloudAsh: cloudOver(ash),
  // on the demon's mountain, a dead pine (a big object, as in the pine wood) and a boulder stand on its ash
  ashPine: ash,
  ashBoulder: (g, X, Y, x, y) => { ash(g, X, Y, x, y); boulder(g, X + 8, Y + 15, 6, 6, (x + y) % 2 === 0); },
  demonDoor: (g, X, Y, x, y) => cliffFace(g, X, Y, x, y),
  // at home, the feast's tables bare: the little demons took everything off them (big objects, on the grass)
  feastTableRobbed: (g, X, Y, x, y) => LOOKS.grass(g, X, Y, x, y), tableBlock: (g, X, Y, x, y) => LOOKS.grass(g, X, Y, x, y)
});

/* ---- big objects ---- */
// A dead tree on the demon's mountain, gnarled and burnt black (the art review, decided 6 November 2026: the pine wood's
// dead pine, a thin grey pole, didn't look evil): roots clawing the ash, a trunk twisting up, lit down one side, and bare
// branches forking up like claws.
const BURNT = ['#141110', '#2E2622', '#4A3E36', '#6A5A4C'];   // darkest to lightest
OBJECT_ART.ashPine = (g, o) => {
  const X = o.x * T, Y = o.y * T;
  if (shadows) blob(g, X + 9, Y + 15, 7, 2, ROCK_SHADOW);
  const twig = (pts, w) => { for (let i = 1; i < pts.length; i++){ const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let k = 0; k <= n; k++) R(g, X + Math.round(x0 + (x1 - x0) * k / n), Y + Math.round(y0 + (y1 - y0) * k / n), w, w, BURNT[1]); } };
  R(g, X + 3, Y + 13, 11, 2, BURNT[0]); R(g, X + 5, Y + 12, 7, 2, BURNT[1]);                                         // its roots, clawing the ash
  twig([[8, 13], [7, 6], [9, 0], [8, -6]], 3); twig([[9, 13], [8, 6], [10, 0]], 1);                                 // the trunk, twisting up
  R(g, X + 8, Y + 4, 1, 6, BURNT[3]); R(g, X + 9, Y - 2, 1, 4, BURNT[2]);                                             // lit down one side
  twig([[8, 2], [4, -2], [2, -7], [0, -9]], 2); twig([[4, -2], [5, -7]], 1); twig([[2, -7], [3, -11]], 1);          // branches up to the left, forking
  twig([[9, -1], [13, -5], [15, -10]], 2); twig([[13, -5], [16, -5]], 1); twig([[15, -10], [13, -13]], 1);          // and to the right
  twig([[8, -6], [7, -12], [8, -15]], 1); twig([[7, 8], [3, 6]], 1);                                                // the top, and a broken stub
  dot(g, X + 9, Y + 9, BURNT[0]); dot(g, X + 8, Y + 3, BURNT[0]);                                                   // knots
};
OBJECT_ART.feastTableRobbed = (g, o) => feastTable(g, o.x * T, o.y * T, o.w * T, 2);   // (just the stone table: nothing on it)
OBJECT_ART.tableBlock = (g, o) => fishTable(g, o.x * T, o.y * T, 1);                  // (a little stone table, its plate gone)
ROW_OBJECTS.push('feastTableRobbed');
// The demon's cave: a dark mouth in the cliff, jagged rock round it like teeth, a red glow deep inside, and its name over
// it on a black board (水脏洞, its sign).
OBJECT_ART.demonDoor = (g, o) => {
  const X = o.x * T, Y = o.y * T, W = o.w * T, H = o.h * T, m = X + W / 2, t = tileAt(o.x, o.y);
  oval(g, m, Y + 9, W / 2 - 3, 9, '#120C10'); R(g, X + 3, Y + 9, W - 6, H - 9, '#120C10');
  oval(g, m, Y + H - 6, W / 2 - 8, 5, '#3A1212'); oval(g, m, Y + H - 6, W / 2 - 12, 3, '#5A1A14');   // (a red glow, deep inside)
  for (let i = 0; i < 5; i++){ const tx = X + 5 + i * (W - 10) / 4; R(g, Math.round(tx) - 1, Y + 2, 3, 3 + (i % 2) * 2, '#5A5650'); R(g, Math.round(tx), Y + 4 + (i % 2) * 2, 1, 2, '#3A3632'); }   // teeth of rock
  R(g, X + 2, Y + 9, 2, H - 9, '#4A4640'); R(g, X + W - 4, Y + 9, 2, H - 9, '#4A4640');
  const sign = t.sign && t.sign.says.zh;
  if (sign){ const n = [...sign].length * 11 + 4; R(g, m - n / 2 - 1, Y - 15, n + 2, 15, '#2A1A14'); R(g, m - n / 2, Y - 14, n, 13, '#4A2A1E'); write(g, sign, m - n / 2 + 2, Y - 12, '#E8C060'); }
};
BLOCK_OBJECTS.push('demonDoor');

/* ---- scenes ---- */
const babyPal = () => PALS.player;
// The hair trick (毛, in the fight with the Demon of Havoc, as in the book): you pull out a handful of hairs, blow on them
// and say 变！, and they turn into little monkeys, who swarm all over him till he drops his broadsword.
function drawHairTrick(t, now){
  const W = VW*T, H = VH*T;
  for (let y = 0; y < H; y += 2) R(b, 0, y, W, 2, mix('#2A2430', '#4A3A34', y / H));
  for (let x = 0; x < W; x += 4) R(b, x, 112 + Math.round(Math.sin(x / 9) * 2), 4, H - 112, '#5A5E44');   // the ash
  const king = PICTURES['混世魔王'], kx = 140, ky = 52, shake = t > 3.5 ? Math.round(Math.sin(now / 40) * 2) : 0;
  if (king) b.drawImage(sprite(king.rows, king.palette), kx + shake, ky, 64, 64);
  if (t > 6.5){   // he drops his broadsword
    const k = Math.min(1, (t - 6.5) / .6), sw = PICTURES['刀'];
    if (sw){ b.save(); b.translate(150, 96 + k * 18); b.rotate(k * 1.4); b.drawImage(sprite(sw.rows, sw.palette), -12, -12, 24, 24); b.restore(); }
  }
  b.drawImage(monkeySprite('player', 'right', false), 40, 92, 20, 20);   // you
  if (t < 2) for (let i = 0; i < 6; i++) R(b, 58 + i, 96 - i % 3, 1, 3, '#D49A3A');   // a handful of hairs
  else if (t < 3.6){   // blown over towards him, a puff of smoke
    const k = (t - 2) / 1.6;
    for (let i = 0; i < 12; i++){ const hx = 60 + k * (70 + i * 4), hy = 90 - Math.sin(k * Math.PI) * 20 + (i % 4) * 4; R(b, Math.round(hx), Math.round(hy), 1, 3, '#D49A3A'); }
    if (k > .7) for (let i = 0; i < 7; i++){ const a = i / 7 * Math.PI * 2; oval(b, Math.round(150 + Math.cos(a) * 18), Math.round(84 + Math.sin(a) * 12), 6, 4, '#E8E8E4'); }
  } else for (let i = 0; i < 14; i++){   // little monkeys, swarming all over him
    const a = i / 14 * Math.PI * 2 + now / (300 + i * 20), r = 20 + (i % 3) * 8;
    const mx = 166 + Math.cos(a) * r, my = 80 + Math.sin(a) * r * .8;
    b.drawImage(monkeySprite('player', ['down', 'left', 'right', 'up'][i % 4], false, Math.floor(now / 150 + i) % 2), Math.round(mx - 5), Math.round(my - 5), 10, 10);
  }
}
// Flying north on your cloud, to the demon's mountain: as the cloud somersault, then a dark mountain ahead.
function drawFlyNorth(t, now, def){
  drawCloudFlight(t, now, {});
  const W = VW*T, H = VH*T;
  if (t > 5){
    const mx = W - Math.min(130, (t - 5) * 55);
    for (let i = 0; i < 46; i++){ const w = (46 - i) * 2.6; R(b, Math.round(mx + 60 - w / 2), H - i, Math.round(w), 1, i > 38 ? '#3A3632' : i % 7 === 0 ? '#2E2A28' : '#3E3A34'); }
    R(b, Math.round(mx + 55), H - 26, 10, 7, '#120C10');   // its cave
  }
}
// Flying home on your cloud with the little monkeys you set free (the flyHome scene's picture, Flower Fruit Mountain
// coming up ahead), crowded round you on it.
function drawFlyHomeAll(t, now, def){
  drawCloudFlight(t, now, {home:true});
  const bob = Math.round(Math.sin(now / 200) * 3);
  for (let k = 0; k < 6; k++) oval(b, 54 + k * 10, 93 + bob + (k % 2), 8, 4, '#F4F7FA');   // a bigger cloud, for everyone
  ['baby1', 'baby2', 'baby3', 'baby4', 'baby5'].forEach((id, i) => {
    const x = 50 + i * 11 + (i > 1 ? 18 : 0), y = 82 + bob - (Math.floor(now / 260 + i) % 2);
    b.drawImage(monkeySprite(PALS[id] ? id : 'player', 'right', false), x, y, 11, 11);
  });
}
Object.assign(SCENE_ART, {hairTrick: drawHairTrick, flyNorth: drawFlyNorth, flyHomeAll: drawFlyHomeAll});
