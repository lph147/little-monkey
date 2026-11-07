// The Demon of Havoc's look (Area 2, chapter 2, decided 5 November 2026 from the plan's mock-ups): his mountain far to the
// north, gloomy as the dark pines, nothing like home's: ashy ground, dry grass where little demons hide, dead pines, a black
// pool, torches, the cages the troop's little ones are locked in, the cart his little demons piled the troop's things on,
// and his cave's mouth in the cliff, its name over it (水脏洞); and at home, the feast's tables, bare once they took
// everything off them, filling again as you unload the cart, and your cloud, waiting to fly you north. And the chapter's
// scenes: the hair trick (毛, 变！), flying north on your cloud, and the wind that carries everyone home, the cart too.
// (Loaded after js/mountain.js: it adds to LOOKS, OBJECT_ART, HANZI and SCENE_ART.)

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
// hanging open and nobody in it (open). As you unlock it (the unlock step: ACTS, js/draw.js), its door swings open from 0
// to 1 (door), the little monkey still inside, and its lock is off once the key has turned (locked).
function cage(g, X, Y, x, y, open, door = open ? 1 : 0, locked = !open){
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
  for (const bx of [1, 14]) R(g, X + bx, Y + 2, 1, 12, '#9A6A3A');   // its bars: at its sides,
  const sw = Math.round(door * 6);
  for (const bx of [4, 7, 10]) R(g, X + bx - sw, Y + (door ? 3 : 2), 1, door ? 10 : 12, '#9A6A3A');   // and its door's, swinging open to the left
  if (locked){ R(g, X + 7, Y + 7, 3, 3, '#3A3A40'); R(g, X + 8, Y + 8, 1, 1, '#8A8A90'); }   // the lock
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
  cloudGrass: cloudOver(LOOKS.grass), cloudAsh: cloudOver(ash),
  // on the demon's mountain, a dead pine (a big object, as in the pine wood) and a boulder stand on its ash
  ashPine: ash,
  ashBoulder: (g, X, Y, x, y) => { ash(g, X, Y, x, y); boulder(g, X + 8, Y + 15, 6, 6, (x + y) % 2 === 0); },
  demonDoor: (g, X, Y, x, y) => cliffFace(g, X, Y, x, y),
  // at home, the feast's tables bare: the little demons took everything off them (big objects, on the grass); and as you
  // unload the cart, the troop's things going back on them
  feastTableRobbed: (g, X, Y, x, y) => LOOKS.grass(g, X, Y, x, y), tableBlock: (g, X, Y, x, y) => LOOKS.grass(g, X, Y, x, y),
  tableBack1: (g, X, Y, x, y) => LOOKS.grass(g, X, Y, x, y), tableBack2: (g, X, Y, x, y) => LOOKS.grass(g, X, Y, x, y),
  tableBack3: (g, X, Y, x, y) => LOOKS.grass(g, X, Y, x, y), tableBack4: (g, X, Y, x, y) => LOOKS.grass(g, X, Y, x, y),
  milkTableJug: (g, X, Y, x, y) => LOOKS.grass(g, X, Y, x, y)
});

Object.assign(GROUNDS, {ash, trampled, deadGrass});   // (so anything from Flower Fruit Mountain here stands on the ash: onGround, js/art.js)

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
// The big table as the troop's things go back on it, off the cart (the unload step): its bowls (has 1, going on one at a
// time: stage), the peaches in the first (2), the apples in the second (3), the honey in the third (4), each going on as
// you watch (stage 0, then 1); and the second table, the jug of milk at its end.
function feastTableBack(g, X, Y, w, has, stage){
  slabTable(g, X, Y, w, 2);
  const on = k => has > k || (has === k && stage >= 1), pile = [[-3, -6], [1, -6], [-1, -9]];
  TABLE_BOWLS.forEach((b, i) => { if (has > 1 || stage > i) tableBowl(g, X + b, Y + 5); });
  if (on(2)) pile.forEach(([dx, dy]) => bigFruit(g, X + TABLE_BOWLS[0] + dx, Y + 5 + dy, PEACHES));
  if (on(3)) pile.forEach(([dx, dy]) => bigFruit(g, X + TABLE_BOWLS[1] + dx, Y + 5 + dy, APPLES));
  if (on(4)) bowlFull(g, X + TABLE_BOWLS[2], Y + 5, '#E8A93A', '#F7C95A', '#FFE9A8');
}
[1, 2, 3, 4].forEach(k => { OBJECT_ART['tableBack' + k] = (g, o) => feastTableBack(g, o.x * T, o.y * T, o.w * T, k, o.stage ?? (k === 1 ? 3 : 1)); });
OBJECT_ART.milkTableJug = (g, o) => { slabTable(g, o.x * T, o.y * T, o.w * T, 2); if ((o.stage ?? 1) >= 1) milkJug(g, o.x * T + 6, o.y * T + 5); };
Object.assign(OBJECT_STAGES, {tableBack1:3, tableBack2:1, tableBack3:1, tableBack4:1, milkTableJug:1});
ROW_OBJECTS.push('feastTableRobbed', 'tableBack1', 'tableBack2', 'tableBack3', 'tableBack4', 'milkTableJug');
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

/* ---- the cart ---- */
// The little demons' handcart, the troop's things piled on it (decided 7 November 2026, after playing it: you fight the
// little demon guarding it, then pull it back to the little monkeys, and home): wooden, with two shafts out in front to pull
// it by, towards you as you do. Side on, one big spoked wheel, which turns as it rolls, and a leg under its front that it
// stands on, tucked up as you pull it; from the front or the back, its two wheels edge on at its sides, their treads
// moving. What's on it (load: their words, cartLoad) is each in its own place on it, so it empties as you unload it.
const CART_CANVAS = {};
const CART_ITEMS = {   // each of the troop's things, small, on the cart: (g, x, y), its bottom's middle
  '碗': (g, x, y) => { R(g, x - 4, y - 6, 9, 7, INK); for (let k = 0; k < 3; k++){ R(g, x - 3, y - 2 * k - 1, 7, 1, '#F4F1EA'); R(g, x - 2, y - 2 * k, 5, 1, '#4F82B0'); } },   // three bowls, stacked
  '桃子': (g, x, y) => { for (const [dx, dy] of [[-2, 0], [2, 0], [0, -3]]){ R(g, x + dx - 2, y + dy - 4, 5, 5, INK); R(g, x + dx - 1, y + dy - 3, 3, 3, PEACHES[0]); R(g, x + dx - 1, y + dy - 3, 1, 1, PEACHES[1]); } R(g, x, y - 8, 2, 1, '#5E9A3C'); },
  '苹果': (g, x, y) => { for (const [dx, dy] of [[-2, 0], [2, 0], [0, -3]]){ R(g, x + dx - 2, y + dy - 4, 5, 5, INK); R(g, x + dx - 1, y + dy - 3, 3, 3, APPLES[0]); R(g, x + dx - 1, y + dy - 3, 1, 1, APPLES[1]); } R(g, x, y - 8, 1, 2, '#5E3A1E'); },
  '蜂蜜': (g, x, y) => { R(g, x - 3, y - 6, 7, 7, INK); R(g, x - 2, y - 4, 5, 4, '#B9762A'); R(g, x - 2, y - 5, 5, 1, '#F7C95A'); R(g, x - 1, y - 3, 1, 2, '#E8A93A'); },   // a pot of honey
  '牛奶': (g, x, y) => { R(g, x - 3, y - 8, 7, 9, INK); R(g, x - 2, y - 7, 5, 7, '#F4F1EA'); R(g, x - 2, y - 7, 5, 1, MILK); R(g, x - 2, y - 4, 5, 1, '#4F7FBF'); R(g, x - 4, y - 8, 1, 1, INK); R(g, x + 4, y - 6, 1, 3, INK); }   // the jug of milk
};
// Where each goes, from the side (its front to the right) and from the front: the jug and the bowls at the back, the fruit
// on top, the honey in front.
const CART_SLOTS = {side:{'牛奶':[2, 5], '碗':[6, 5], '蜂蜜':[11, 5], '桃子':[5, 1], '苹果':[9, 1]}, end:{'碗':[4, 5], '牛奶':[8, 5], '蜂蜜':[12, 5], '桃子':[6, 1], '苹果':[10, 1]}};
function cartLoadPic(g, X, Y, load, slots){ for (const w of Object.keys(slots)) if (load.includes(w) && CART_ITEMS[w]) CART_ITEMS[w](g, X + slots[w][0], Y + slots[w][1]); }
// The cart into g, its square's top left at X, Y, going dir (its shafts that way), with what's on it (load), having rolled
// so far (roll, in pixels: its wheels turn with it), and pulled (its leg tucked up) or standing.
function cartPic(g, X, Y, dir, load, roll = 0, pulled = false){
  if (shadows) blob(g, X + 8, Y + 15, 9, 1, 'rgba(0,0,0,.22)');
  const [W1, W2, W3, W4, W5] = WOODS;
  if (dir === 'left' || dir === 'right'){   // side on: drawn facing right, into a canvas of its own, and turned round to face left
    const c = CART_CANVAS.side || (CART_CANVAS.side = document.createElement('canvas'));
    c.width = 32; c.height = 28;
    const t = c.getContext('2d'), ox = 6, oy = 9, r = (x, y, w, h, col) => R(t, ox + x, oy + y, w, h, col);
    r(13, pulled ? 9 : 10, 3, pulled ? 4 : 6, INK); r(14, pulled ? 9 : 10, 1, pulled ? 3 : 5, W2);   // its leg, under its front
    r(-2, 4, 18, 7, INK); r(-1, 5, 16, 5, W3); r(-1, 5, 16, 1, W5); r(-1, 9, 16, 1, W2);             // its bed, of planks
    for (const x of [3, 7, 11]) r(x, 6, 1, 3, W2);
    r(15, 5, 8, 3, INK); r(15, 6, 7, 1, W4); r(22, 5, 1, 3, W1);                                       // its shafts, out in front
    cartLoadPic(t, ox, oy, load, CART_SLOTS.side);
    const cx = ox + 5, cy = oy + 11, a = roll / 4;                                                     // the wheel, turning as it rolls
    blob(t, cx, cy, 5, 5, INK); blob(t, cx, cy, 4, 4, W2); blob(t, cx, cy, 3, 3, '#4A3424');
    for (let k = 0; k < 3; k++){ const ang = a + k * Math.PI / 3; for (let d = -3; d <= 3; d++) R(t, Math.round(cx + Math.cos(ang) * d), Math.round(cy + Math.sin(ang) * d), 1, 1, W4); }
    R(t, cx, cy, 1, 1, W5);
    if (dir === 'right') g.drawImage(c, X - ox, Y - oy);
    else { g.save(); g.translate(X + T, 0); g.scale(-1, 1); g.drawImage(c, -ox, Y - oy); g.restore(); }
    return;
  }
  // from the front (going down, its shafts towards you) or the back (going up, its shafts away, behind what's on it)
  const tread = Math.floor(Math.abs(roll) / 2) % 3, wheel = x => { R(g, X + x - 1, Y + 6, 4, 10, INK); R(g, X + x, Y + 7, 2, 8, W2); for (let k = tread; k < 8; k += 3) R(g, X + x, Y + 7 + k, 2, 1, W4); };
  const shafts = (y0, y1) => { for (const x of [3, 12]){ R(g, X + x - 1, Y + Math.min(y0, y1), 3, Math.abs(y1 - y0) + 1, INK); R(g, X + x, Y + Math.min(y0, y1), 1, Math.abs(y1 - y0) + 1, W4); } };
  const bed = () => { R(g, X, Y + 3, 16, 8, INK); R(g, X + 1, Y + 4, 14, 6, W3); R(g, X + 1, Y + 4, 14, 1, W5); R(g, X + 1, Y + 9, 14, 1, W2); for (const x of [5, 10]) R(g, X + x, Y + 5, 1, 4, W2); };   // its bed, an end on
  if (dir === 'up'){   // from behind, as you pull it up: its back board over the bottom of what's on it, so it doesn't hide you
    shafts(-2, 6); wheel(-1); wheel(15);
    cartLoadPic(g, X, Y + 2, load, CART_SLOTS.end); bed();
    return;
  }
  wheel(-1); wheel(15); bed();
  cartLoadPic(g, X, Y, load, CART_SLOTS.end);
  shafts(10, 19); R(g, X + 2, Y + 18, 12, 3, INK); R(g, X + 3, Y + 19, 10, 1, W4);   // its shafts towards you, a bar across their ends
}
// What's on the cart now: the troop's things, but those you've taken off it at home (the area's unloading), and the one
// you're carrying; nothing once it's all back.
function cartLoad(n){
  const u = AREA.unloading;
  if (!u || n.id !== u.cart || (u.over && matches(u.over))) return [];
  const k = here()[u.key] || 0;
  return u.asks.filter((a, i) => (!k || i >= k - 1) && a.word !== here().lifted).map(a => a.word);
}
// A cart on the map (a character that's a cart), facing the way it last went, its wheels turning as it goes (c: where
// it's drawn, charPos in js/draw.js), its leg tucked up while you pull it.
function drawCart(n, X, Y, c){
  const dir = n.dir || 'down', side = dir === 'left' || dir === 'right';
  cartPic(b, X, Y, dir, cartLoad(n), side ? c.x : c.y, FOLLOWERS.includes(n));
}

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
// The wind that carries everyone home, as in the book (驾阵狂风, decided 7 November 2026, so the troop's things come home
// too): gusts swirling round you all, open hooks like the wind's picture, the cart rocking in the middle of them with the
// troop's things on it, and you and the little monkeys tumbling round it, over the sea to Flower Fruit Mountain.
function drawWindHome(t, now){
  drawCloudFlight(t, now, {home:true, alone:true});
  const cx = 96, cy = 66 + Math.round(Math.sin(now / 260) * 4), sh = shadows;
  const gust = (i, front) => {   // a gust, swirling round, thick, its front curling in at its end: front ones over everyone, back ones behind
    const a = now / 380 + i * 1.1, rx = 46 + (i % 3) * 7, ry = 20 + (i % 2) * 6, at = (q, r) => [Math.round(cx + Math.cos(q) * rx * r), Math.round(cy + Math.sin(q) * ry * r)];
    for (let k = 0; k < 14; k++){ const q = a + k * .07; if ((Math.sin(q) > 0) !== front) continue; const [x, y] = at(q, 1); R(b, x, y, 2, 2, k < 4 ? 'rgba(255,255,255,.4)' : '#FFFFFF'); }
    const q = a + 13 * .07; if ((Math.sin(q) > 0) === front) for (let k = 1; k <= 4; k++){ const [x, y] = at(q + k * .05, 1 - k * .07); R(b, x, y, 2, 2, '#FFFFFF'); }   // (the curl)
  };
  for (let i = 0; i < 6; i++) gust(i, false);
  shadows = false;   // (no ground under the cart, up here)
  b.save(); b.translate(cx, cy); b.rotate(Math.sin(now / 340) * .22); cartPic(b, -8, -9, 'right', ['碗', '桃子', '苹果', '蜂蜜', '牛奶'], now / 25, true); b.restore();
  shadows = sh;
  ['player', 'baby1', 'baby2', 'baby3', 'baby4', 'baby5'].forEach((id, i) => {   // round it, tumbling: you the biggest
    const a = now / 700 + i * Math.PI / 3, x = cx + Math.cos(a) * 40, y = cy + 2 + Math.sin(a) * 16, s = id === 'player' ? 16 : 11;
    b.save(); b.translate(Math.round(x), Math.round(y)); b.rotate(Math.sin(now / 250 + i) * .5);
    b.drawImage(monkeySprite(PALS[id] ? id : 'player', ['right', 'down', 'left', 'up'][Math.floor(now / 400 + i) % 4], false), -s / 2, -s / 2, s, s); b.restore();
  });
  for (let i = 0; i < 6; i++) gust(i, true);
  for (let k = 0; k < 6; k++) R(b, cx - 70 - k * 9, cy - 12 + (k % 3) * 11, 7, 1, '#FFFFFF');   // speed lines
}
Object.assign(SCENE_ART, {hairTrick: drawHairTrick, flyNorth: drawFlyNorth, windHome: drawWindHome});
