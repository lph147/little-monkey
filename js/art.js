// Pixel art: sprites drawn from letter grids, character portraits, and painting the map's tiles.

/* ================= PIXEL ART ================= */
const cv = $('#screen'), sc = cv.getContext('2d');
const buf = document.createElement('canvas'); buf.width = VW*T; buf.height = VH*T;
const b = buf.getContext('2d'); b.imageSmoothingEnabled = false;
const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
function sprite(rows, pal){
  const c = document.createElement('canvas'); c.width = rows[0].length; c.height = rows.length;
  const g = c.getContext('2d');
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) R(g, x, y, 1, 1, pal[ch]); }));
  return c;
}
const TREE_PAL = {o:'#1F4D2A',d:'#2F7A3E',l:'#3F9A4C',h:'#6CC066'};   // the trees' leaves, darkest to lightest (big objects, below)
const ROCK = ["................","................",".....ooooo......","...oolllmmoo....","..ollllmmmmdo...",".olllmmmmmmddo..",".ollmmmmmmmddo..","olmmmmmmmmmdddo.","ommmmmmmmmddddo.","ommmmmmmmdddddo.",".ommmmmmdddddo..","..ooddddddddo...","....oooooooo....","................","................","................"];
const ROCK_PAL = {o:'#4A463F',l:'#D6D2C5',m:'#A9A598',d:'#7C786D',k:'#3A352E',g:'#FFE27A'};
const CRACK = [[8,3],[8,4],[7,5],[8,6],[9,7],[8,8],[7,9],[8,10],[9,5],[10,4],[6,7],[5,8],[10,8],[11,9]];   // the stone cracking in the opening
const SIGN = ["................","................","................","..oooooooooooo..","..owwwwwwwwwwo..","..owWWWwwWWWwo..","..owwwwwwwwwwo..","..owWWwwWWWwwo..","..oooooooooooo..","......oWWo......","......oWWo......","......oWWo......","......oWWo......",".....oooooo.....","................","................"];
const POST = ["......oooo......",".....owwwwo.....",".....owWWwo.....","..ooooowwooooo..","..owwwwwwwwwwo..","..ooooowwooooo..",".....owWWwo.....",".....owwwwo.....","...ooowWWwooo...","...owwwwwwwwo...","...ooowwwwooo...",".....owWWwo.....",".....owwwwo.....",".....owWWwo.....","....oooooooo....","................"];   // a wooden practice post
const MONKEY = ["................",".....oooooo.....","....offffffo....","...offffffffo...",".ooofssssssfooo.","osssfssssssfssso","osssfssssssfssso",".ooofssmmssfooo.","...offssssffo...","...offffffffo...","..offfssssfffo..",".offffssssffffo.",".of.ffssssff.fo.","...offffffffo...","...offo..offo...","...ooo....ooo..."];
const BIRD = ["...ooo..","..obbbo.","yobebbbo",".obbwwbo","..obwwwo","...oooo.","....o.o."];
const PALS = {
  player:{o:'#4A2C17',f:'#D49A3A',s:'#F6D2A8',m:'#C98E6A',e:'#24160C',w:'#F4F1EA',b:'#C0392B'}
};
AREA.characters.forEach(c => { if (c.palette) PALS[c.id] = c.palette; });   // the other monkeys' colours come from the area
const spriteCache = {};
const BACK = ["................",".....oooooo.....","....offffffo....","...offffffffo...",".oooffffffffooo.","offoffffffffoffo","offoffffffffoffo",".oooffffffffooo.","...offffffffo...","...offffffffo...","..offffffffffo..",".offffffffffffo.",".of.ffffffff.fo.","...offffffffo...","...offo..offo...","...ooo....ooo..."];
const SIDE = ["................",".....ooooo......","....offfffo.....","...offfffffo....","..osfffssssso...","..osffssesssso..","..ooffssssssmo..","...offsssssoo...","....offfffo.....","...offfffffo....",".o.offsssffo....","ofooffsssfffo...","offfffssffffo...",".oo.offffffo....","....offo.ofo....","....ooo..oo....."];
const LEGS = {
  front:[["...offo..offo...","...ooo....ooo..."],["...ooo...offo...",".........ooo...."],["...offo...ooo...","...ooo.........."]],
  side:[["....offo.ofo....","....ooo..oo....."],["...ofo....ofo...","..oo.......oo..."],["...ofo....ofo...","..oo.......oo..."]]
};
const BEARDED = new Set(AREA.characters.filter(c => c.beard).map(c => c.id));   // characters drawn with a white beard
const wearing = item => S.wardrobe.wearing.includes(item);   // is your monkey wearing this?
function redress(){ for (const k in spriteCache) delete spriteCache[k]; for (const k in portraitCache) delete portraitCache[k]; }   // draw your monkey again in what it wears
// What your monkey holds in its hand once it can fight (the area's battles: their weapon, once their when matches): a
// small stick (棍子), short, so that the staff (金箍棒, Area 4) can be longer without the stick ever having looked too big.
// Each: how many pixels long it is, and its colours (l the wood, k its dark edge and ends), reddish so it stands out
// against your fur.
const HELD = {'棍子': {len:7, pal:{l:'#B5653A', k:'#3E2010'}}};
const inHand = () => BATTLES.weapon && HELD[BATTLES.weapon] && canBattle() ? BATTLES.weapon : null;
// Where it's held, upright, facing down, up or to the side (the right; the left is the same, the other way round): its
// wood in column x with its dark edge in column edge, its foot at row y, and the hand over it (grip).
const HAND = {
  down:{x:14, edge:15, y:13, grip:[[13, 11], [14, 11], [13, 12]]},
  up:{x:1, edge:0, y:13, grip:[[2, 11], [1, 11], [2, 12]]},
  side:{x:13, edge:14, y:13, grip:[[12, 11], [13, 11], [12, 12]]}
};
// empty: with nothing in its hands (in a battle the scene holds the stick itself; meeting an animal, you hold nothing).
function monkeySprite(kind, dir, blink, step = 0, empty = false){
  const stick = !empty && kind === 'player' && inHand();
  const k = kind + dir + (blink ? 'b' : '') + step + (stick || ''); if (spriteCache[k]) return spriteCache[k];
  return spriteCache[k] = sprite(monkeyRows(kind, dir, blink, step, empty), stick ? {...PALS[kind], ...HELD[stick].pal} : PALS[kind]);
}
// A monkey's pixel rows, as letters (PALS says each letter's colour). The app's icons use them too (tools/make-icons.js).
function monkeyRows(kind, dir, blink, step = 0, empty = false){
  const side = dir === 'left' || dir === 'right';
  const rows = (dir === 'up' ? BACK : side ? SIDE : MONKEY).map(r => [...r]);
  const legs = (side ? LEGS.side : LEGS.front)[step];
  rows[14] = [...legs[0]]; rows[15] = [...legs[1]];
  if (dir === 'down'){
    if (!blink){ rows[5][6] = 'e'; rows[5][9] = 'e'; }
    if (BEARDED.has(kind)){ [6,7,8,9].forEach(x => rows[8][x] = 'w'); rows[9][7] = 'w'; rows[9][8] = 'w'; }
  }
  if (side){
    if (blink) rows[5][8] = 's';
    if (BEARDED.has(kind)){ [9,10,11].forEach(x => rows[7][x] = 'w'); rows[8][8] = 'w'; rows[8][9] = 'w'; }
  }
  if (kind === 'player' && wearing('头带')){ for (let x = 3; x <= 12; x++) if (rows[3][x] === 'f') rows[3][x] = 'b'; }   // the red headband
  const stick = !empty && kind === 'player' && inHand();
  if (stick){   // the stick in your hand
    const h = HAND[side ? 'side' : dir], top = h.y - HELD[stick].len + 1;
    for (let y = top; y <= h.y; y++){ rows[y][h.x] = y === top || y === h.y ? 'k' : 'l'; rows[y][h.edge] = 'k'; }
    for (const [x, y] of h.grip) rows[y][x] = 'f';
  }
  let out = rows.map(r => r.join(''));
  if (dir === 'left') out = out.map(r => [...r].reverse().join(''));
  return out;
}
// Your monkey asleep in a bed: its head on the pillow, eyes shut (the rest is under the blanket: drawAsleep in js/draw.js).
const ASLEEP = ["...oooooo...", "..offffffo..", ".offffffffo.", "oofssssssfoo", "osfmmssmmfso", "osfssssssfso", "oofssmmssfoo", ".offssssffo."];
function asleepSprite(){
  const band = wearing('头带'), k = 'asleep' + (band ? 'b' : ''); if (spriteCache[k]) return spriteCache[k];
  const rows = ASLEEP.map(r => [...r]);
  if (band) for (let x = 1; x <= 10; x++) if (rows[2][x] === 'f') rows[2][x] = 'b';   // the red headband
  return spriteCache[k] = sprite(rows.map(r => r.join('')), PALS.player);
}
// The area's animals: at their own spot (at), or hiding in the tall grass, each in a chapter of the story (0 if not given).
// spr: how they look on the map (content/sprites.js, a square's size); pic: their picture everywhere else, in encounters
// and the Friends list (content/pictures.js).
const ANIMALS = AREA.animals.map(a => ({id:a.id, name:WORD_BANK[a.word].en, hz:a.word, at:a.at || null, place:placeOf(a.at), home:a.home || HIDING_WORD, meetNote:a.meetNote, chapter:a.chapter || 0,
  spr:sprite(MAP_SPRITES[a.word].rows, MAP_SPRITES[a.word].palette), faces:MAP_SPRITES[a.word].faces, pic:sprite(PICTURES[a.word].rows, PICTURES[a.word].palette)}));
// An animal (or a wild creature: spr, its map sprite, and faces, which way it looks) turned to face you, from where it is
// (x): drawn the other way round when it would look away from you, such as a wolf jumping out on your left. Or away from
// you (away), as it runs off.
const mirrors = new Map();
function mirrored(spr){
  if (!mirrors.has(spr)){ const c = document.createElement('canvas'); c.width = spr.width; c.height = spr.height; const g = c.getContext('2d'); g.translate(spr.width, 0); g.scale(-1, 1); g.drawImage(spr, 0, 0); mirrors.set(spr, c); }
  return mirrors.get(spr);
}
const towardsYou = (a, x, away = false) => { const want = pl.x < x ? 'left' : pl.x > x ? 'right' : null; return want && a.faces && (a.faces !== want) !== away ? mirrored(a.spr) : a.spr; };
const GRASS_ANIMALS = ANIMALS.filter(a => !a.at);
const animalAt = (x, y) => canWild() ? ANIMALS.find(a => a.at && a.place === PLACE && a.at[0] === x && a.at[1] === y) : null;   // an animal living at this spot, once animals appear
const FRIEND_NAMES = {};   // what each friend is called in the Friends list
ANIMALS.forEach(a => { FRIEND_NAMES[a.id] = a.hz; });
AREA.characters.forEach(c => { if (c.name) FRIEND_NAMES[c.id] = c.name.zh; });

// Pixel icons in text (pixelIcons), instead of emoji: the money symbol, a shell (the troop trades in shells from the
// shore), small, wherever the text says 🐚.
const SHELL = ["................","......oooo......","....oowrrwoo....","...owrwrrwrwo...","..owrwwrrwwrwo..",".owrwwwrrwwwrwo.",".orwwwwrrwwwwro.",".owrwwwrrwwwrwo.","..owrwwrrwwrwo..","...owrwrrwrwo...","....owrrrrwo....",".....owrrwo.....","....ooowwooo....","....owwoowwo....","....oooooooo....","................"];   // a scallop shell
let shellImg = null;
// The speaker on buttons that say a word again: a little loudspeaker, wherever the text says 🔊.
const SPEAKER = ["................","................","......oo........",".....owo........","....owwo.....b..","oooowwwo..b...b.","owwwwwwo...b..b.","owlwwwwo...b..b.",
  "owlwwwwo...b..b.","owwwwwwo...b..b.","oooowwwo..b...b.","....owwo.....b..",".....owo........","......oo........","................","................"];
let speakerImg = null;
const pixelIcons = html => String(html)
  .replace(/🐚/g, () => shellImg || (shellImg = `<img class="money" alt="shells" src="${sprite(SHELL, {o:'#8A5A3A', w:'#F7E7CF', r:'#D9A77C'}).toDataURL()}">`))
  .replace(/🔊/g, () => speakerImg || (speakerImg = `<img class="speakericon" alt="" src="${sprite(SPEAKER, {o:'#2A2622', w:'#E2DDD2', l:'#FFFFFF', b:'#4F9FDB'}).toDataURL()}">`))
  .replace(ICON_RE, m => { const k = m.replace(/\uFE0F/g, ''); return k === '♥' ? heartHTML(true) : iconHTML(k); });
// The game's other icons (content/pictures.js), wherever the text has their emoji (⭐, 📜 and so on), and ♥ as the pixel heart.
const ICON_KEYS = Object.fromEntries(Object.keys(ICONS).map(k => [k.replace(/\uFE0F/g, ''), k]));
const ICON_RE = new RegExp(`(?:${[...Object.keys(ICON_KEYS), '♥'].join('|')})\uFE0F?`, 'gu');
const iconImg = {};
const iconHTML = k => iconImg[k] || (iconImg[k] = `<img class="icon" alt="" src="${sprite(ICONS[ICON_KEYS[k]].rows, ICONS[ICON_KEYS[k]].palette).toDataURL()}">`);
// A pixel heart for an animal's friendship in an encounter: red once won, grey until then.
const HEART = [".oo...oo.", "ohho.orro", "ohrrrrrro", "orrrrrrro", ".orrrrro.", "..orrro..", "...oro...", "....o...."];
const heartImg = {};
const heartHTML = on => heartImg[on] || (heartImg[on] = `<img class="heart${on ? ' on' : ''}" alt="" src="${sprite(HEART, on
  ? {o:'#6A1C1C', r:'#E0443C', h:'#FFB3AB'} : {o:'#7C7470', r:'#CFC8C2', h:'#ECE7E2'}).toDataURL()}">`);
// A word's picture: its pixel art from content/pictures.js, or its emoji until it has one.
const picCache = {};
function picHTML(w){
  const s = PICTURES[w];
  if (!s) return WORDS[w].pic || '';
  return picCache[w] || (picCache[w] = `<img class="pix" alt="" src="${sprite(s.rows, s.palette).toDataURL()}">`);
}
const portraitCache = {};
const NAMES = {};   // the names shown above what characters say
AREA.characters.forEach(c => { if (c.name) NAMES[c.id] = c.name; });
NAMES.sign = AREA.sign.name;
NAMES.player = {zh:'小猴子', py:'xiǎo hóuzi', en:'You'};   // you, when you reply
// Your name: 小猴子 (You), or the first of the area's names for you (yourNames) whose if matches, such as 美猴王 once you're king.
const yourName = () => (AREA.yourNames || []).find(n => matches(n.if)) || NAMES.player;
// An animal friend met on the way (a character that looks like an animal: the animal itself, such as the goat in the
// valley, or another of its kind, such as the goat below the waterfall) is called by its word, in Chinese and pinyin.
const animalOf = id => ANIMALS.find(x => x.id === id) || ANIMALS.find(x => x.hz === (AREA.characters.find(c => c.id === id) || {}).look);
const animalName = id => { const a = animalOf(id); return a && {zh:a.hz, py:WORD_BANK[a.hz].py}; };
function speaker(id){
  const n = id === 'player' ? yourName() : NAMES[id] || animalName(id);
  return `<div class="speaker" data-id="${esc(id)}">${portrait(id)}${n ? `<div class="spk"><div class="spk-zh">${n.zh} <span class="spk-py">${n.py}</span></div>${n.en ? `<div class="spk-en">${n.en}</div>` : ''}</div>` : ''}</div>`;
}
function portrait(id){
  const key = id + (id === 'player' ? inHand() || '' : '');   // (your monkey holds the stick once it has one)
  if (portraitCache[key]) return portraitCache[key];
  let c;
  if (PALS[id]) c = monkeySprite(id, 'down', false, 0);
  else if (id === 'sign') c = SPR.sign;
  else { const a = animalOf(id); c = a ? a.pic : SPR.rock; }
  return portraitCache[key] = `<img class="portrait" alt="" src="${c.toDataURL()}">`;
}
const SPR = {
  rock: sprite(ROCK, ROCK_PAL),
  sign: sprite(SIGN, {o:'#4A2C17',w:'#D2A46A',W:'#9E6F3C'}),
  post: sprite(POST, {o:'#4A2C17',w:'#B98A55',W:'#8A5A32'}),
  bird: sprite(BIRD, {o:'#2B3F66',b:'#5AA0E6',w:'#9CCBF5',e:'#111111',y:'#F2A33A'})
};

/* ---- terrain tiles, pre-rendered once into a map canvas ---- */
const mapCanvas = document.createElement('canvas'); mapCanvas.width = COLS*T; mapCanvas.height = ROWS*T;
const mg = mapCanvas.getContext('2d');
// The big objects that never move (all but the fruit trees, which rustle), drawn once for the place into two layers:
// their bottoms, under the characters, and their tops, over them (buildMap). So a place full of trees, such as the pine
// wood, is as quick to draw as any other (decided 21 October 2026: it was slow on a phone).
const baseCanvas = document.createElement('canvas'), topCanvas = document.createElement('canvas');
const GRASSY = ['grass','tallGrass','flowers','redFlowers','yellowFlowers','whiteFlowers','tree','peachTree','appleTree','stone','sign','post','stall','ledge','bush','boulder','log',
  'needles','pine','deadPine','crackedRock','stump','pebble','rubble'];   // looks with grass underneath (or the pine wood's floor)
const CLIFFS = ['cliff'];
const WATERY = ['water','waterfall','bridge','bridgeAcross','ironBridge'];
function grass(g, X, Y, x, y){
  R(g, X, Y, T, T, '#7CC46B');
  for (let i = 0; i < 7; i++){ const px = Math.floor(rnd(x,y,i)*16), py = Math.floor(rnd(x,y,i+20)*16); R(g, X+px, Y+py, 1, 1, i % 3 ? '#6CB35C' : '#93D67F'); }
  if (rnd(x,y,99) < .45){ const px = 2 + Math.floor(rnd(x,y,98)*11), py = 3 + Math.floor(rnd(x,y,97)*10); R(g, X+px, Y+py, 1, 2, '#559E4B'); R(g, X+px+2, Y+py+1, 1, 1, '#559E4B'); }
}
function path(g, X, Y, x, y){
  R(g, X, Y, T, T, '#D9BB8A');
  for (let i = 0; i < 9; i++){ const px = Math.floor(rnd(x,y,i+40)*16), py = Math.floor(rnd(x,y,i+60)*16); R(g, X+px, Y+py, 1, 1, i % 2 ? '#C6A473' : '#E8D2A6'); }
  const sides = [[0,-1],[0,1],[-1,0],[1,0]];
  sides.forEach(([dx,dy], s) => {
    if (!GRASSY.includes(tileAt(x+dx, y+dy).look)) return;
    for (let i = 0; i < 16; i++){
      if (rnd(x*3+s, y*5, i) < .55){
        const px = dx === 0 ? i : (dx < 0 ? 0 : 15), py = dy === 0 ? i : (dy < 0 ? 0 : 15);
        R(g, X+px, Y+py, 1, 1, '#7CC46B');
      }
    }
  });
}
const TALL = ['#5BA552', '#2F6E38', '#94D883'], LONG = ['#479147', '#1D4F27', '#7CC46B'];   // the ground, the blades and their tips
function tall(g, X, Y, x, y, [ground, blade, tip] = TALL){   // tufts of tall grass (the meadow's), or long grass (LONG: where wild animals live)
  R(g, X, Y, T, T, ground);
  const tuft = (ox, oy) => {
    [[0,3],[1,2],[2,3],[3,1],[4,3],[5,2],[6,3]].forEach(([a,c]) => R(g, X+ox+a, Y+oy+c, 1, 1, blade));
    [[1,1],[3,0],[5,1]].forEach(([a,c]) => R(g, X+ox+a, Y+oy+c, 1, 1, tip));
    R(g, X+ox, Y+oy+4, 7, 1, blade);
  };
  tuft(0,1); tuft(8,0); tuft(4,6); tuft(9,9); tuft(0,10);
}
function cliff(g, X, Y, x, y){
  R(g, X, Y, T, T, '#8E8A7E');
  for (let i = 0; i < 10; i++){ const px = Math.floor(rnd(x,y,i+80)*16), py = Math.floor(rnd(x,y,i+90)*16); R(g, X+px, Y+py, 2, 1, i % 2 ? '#7E7A6F' : '#A3A094'); }
  if (rnd(x,y,7) < .5){ const px = 3 + Math.floor(rnd(x,y,8)*10); R(g, X+px, Y+4, 1, 6, '#6F6B61'); R(g, X+px+1, Y+9, 1, 3, '#6F6B61'); }
  const up = tileAt(x, y-1).look, dn = tileAt(x, y+1).look;
  if (!CLIFFS.includes(up) && y > 0){ R(g, X, Y, T, 3, '#B5B1A4'); R(g, X, Y, T, 1, '#7CC46B'); }
  if (!CLIFFS.includes(dn)){ R(g, X, Y+12, T, 3, '#6A665C'); R(g, X, Y+15, T, 1, '#4A463F'); }
}
function waterBase(g, X, Y, x, y){
  R(g, X, Y, T, T, '#3F8FCB');
  for (let i = 0; i < 4; i++){ const px = Math.floor(rnd(x,y,i+120)*14), py = Math.floor(rnd(x,y,i+130)*16); R(g, X+px, Y+py, 2, 1, '#367FB8'); }
  [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy]) => {
    if (WATERY.includes(tileAt(x+dx, y+dy).look) || (x+dx < 0 || x+dx >= COLS || y+dy < 0 || y+dy >= ROWS)) return;
    if (dy === -1){ R(g, X, Y, T, 2, '#2C6B9E'); R(g, X, Y+2, T, 1, '#8ACFF0'); }
    if (dy === 1){ R(g, X, Y+14, T, 2, '#2C6B9E'); }
    if (dx === -1){ R(g, X, Y, 2, T, '#2C6B9E'); R(g, X+2, Y, 1, T, '#8ACFF0'); }
    if (dx === 1){ R(g, X+14, Y, 2, T, '#2C6B9E'); }
  });
}
// Writing in the world is real Chinese, never made-up squiggles, so there's more for you to read (decided 21 October
// 2026): the school's sign (学校), the cave's stone tablet (水帘洞) and the numbers on the blackboard. Each character is
// drawn by hand in pixels ('#' is ink); writing something new needs its characters drawn here (a test checks).
const HANZI = {
  '学': [".#..#...#.", "..#..#.#..", "##########", "#........#", "..######..", "......#...", ".....#....", "##########", ".....#....", ".....#....", "...###...."],
  '校': ["..#....#...", "..#.....#..", "####.######", "..#...#..#.", ".###.#....#", ".##.#.#..#.", "#.#....##..", "..#....##..", "..#...#..#.", "..#..#....#", "..#.#......"],
  '水': ["....#....", "....#....", "....#..#.", "###.#.#..", "..#.##...", "..#.##...", ".#..#.#..", "#...#..#.", "...##...#"],
  '帘': ["....#....", "#########", "#..#.#..#", "..#...#..", ".#..#..#.", ".#######.", ".#..#..#.", ".#..#.##.", "....#...."],
  '洞': ["#..#######", ".#.#.....#", "...#.###.#", "#..#.....#", ".#.#.###.#", "...#.#.#.#", ".#.#.###.#", "#..#.....#", "#..#....##"],
  '一': [".......", ".......", ".......", "#######", ".......", ".......", "......."],
  '二': [".......", ".#####.", ".......", ".......", ".......", "#######", "......."],
  '三': [".#####.", ".......", ".......", "..###..", ".......", ".......", "#######"],
  '四': ["#######", "#.#.#.#", "#.#.#.#", "#.#.#.#", "##...##", "#.....#", "#######"],
  '五': ["#######", "..#....", "..#....", ".#####.", ".#...#.", ".#...#.", "#######"],
  '六': ["...#...", "....#..", "#######", ".......", "..#.#..", ".#...#.", "#.....#"],
  '七': ["..#....", "..#..##", "..###..", "###....", "..#....", "..#...#", "..#####"],
  '八': ["..#.#..", "..#.#..", "..#..#.", ".#...#.", ".#....#", "#.....#", "......."],
  '九': ["..#....", "..#....", "#####..", "..#.#..", "..#.#..", ".#..#.#", "#...###"],
  '十': ["...#...", "...#...", "...#...", "#######", "...#...", "...#...", "...#..."],
};
// Writes text in HANZI's characters from X, Y, in ink: across, gap pixels apart, or down (each centred in the column).
function write(g, text, X, Y, ink, {gap = 1, down = false} = {}){
  const col = Math.max(...[...text].map(c => HANZI[c][0].length));
  for (const c of text){
    const rows = HANZI[c], x0 = down ? X + Math.round((col - rows[0].length) / 2) : X;
    rows.forEach((row, r) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') R(g, x0 + i, Y + r, 1, 1, ink); });
    if (down) Y += rows.length + gap; else X += rows[0].length + gap;
  }
}
function writtenSize(text, gap = 1, down = false){   // how wide and tall write() makes it: [w, h]
  const gs = [...text].map(c => HANZI[c]), across = gs.reduce((n, r) => n + r[0].length, 0) + gap * (gs.length - 1);
  const along = gs.reduce((n, r) => n + r.length, 0) + gap * (gs.length - 1);
  return down ? [Math.max(...gs.map(r => r[0].length)), along] : [across, Math.max(...gs.map(r => r.length))];
}
// The Water Curtain Cave: rock walls, a stone floor, and the troop's stone things.
function caveFloor(g, X, Y, x, y){
  R(g, X, Y, T, T, '#7D7262');
  for (let i = 0; i < 7; i++){ const px = Math.floor(rnd(x,y,i+300)*16), py = Math.floor(rnd(x,y,i+310)*16); R(g, X+px, Y+py, 1, 1, i % 2 ? '#8E836F' : '#6C6253'); }
}
function caveWall(g, X, Y, x, y){
  R(g, X, Y, T, T, '#4B4640'); R(g, X, Y+7, T, 1, '#3A3631'); R(g, X, Y+15, T, 1, '#3A3631');
  R(g, X+(y%2 ? 4 : 11), Y, 1, 7, '#3A3631'); R(g, X+(y%2 ? 11 : 4), Y+8, 1, 7, '#3A3631');
  R(g, X+1, Y+1, 5, 1, '#5E5850'); R(g, X+8, Y+9, 5, 1, '#5E5850');
  if (y + 1 < ROWS && tileAt(x, y+1).look !== 'caveWall') R(g, X, Y+13, T, 3, '#2E2B27');   // a shadow where it meets the floor
}
// The troop's stone things, outlined and lit from the top left, with a shadow on the floor.
const CAVE_OUT = '#2E2A26', STONE = '#BDB6A6', STONE_FRONT = '#857E71', STONE_LIGHT = '#DDD6C8', CAVE_SHADOW = '#5E5040';
function stoneBed(g, X, Y, x, y){   // a stone bed against the wall: straw, a leaf blanket and a stone pillow
  caveFloor(g, X, Y, x, y);
  R(g, X+1, Y+14, 14, 2, CAVE_SHADOW);
  R(g, X+2, Y-5, 12, 8, CAVE_OUT); R(g, X+3, Y-4, 10, 6, STONE); R(g, X+3, Y-4, 10, 1, STONE_LIGHT);   // the headboard, up against the wall
  R(g, X+1, Y+1, 14, 14, CAVE_OUT); R(g, X+2, Y+2, 12, 9, '#D6B35A'); R(g, X+2, Y+11, 12, 3, STONE_FRONT); R(g, X+2, Y+11, 12, 1, STONE);   // the frame and the straw
  for (let i = 0; i < 9; i++){ const px = 2 + Math.floor(rnd(x, y, i + 700) * 11), py = 2 + Math.floor(rnd(x, y, i + 710) * 8); R(g, X+px, Y+py, 2, 1, i % 2 ? '#B58F3E' : '#F0D68E'); }
  R(g, X+4, Y+2, 8, 4, CAVE_OUT); R(g, X+5, Y+2, 6, 3, '#EEE7D6'); R(g, X+5, Y+4, 6, 1, '#C9C2B2');            // the pillow
  R(g, X+2, Y+7, 12, 4, '#5E9A3E'); R(g, X+2, Y+7, 12, 1, '#8CC45A'); R(g, X+2, Y+10, 12, 1, '#3F6E2A');  // the leaf blanket
  [3, 7, 11].forEach(i => R(g, X+i, Y+8, 1, 1, '#A8D877'));
}
function stoneTable(g, X, Y, x, y){   // a big stone table, two squares by two, on two legs, with peaches and an apple on it
  caveFloor(g, X, Y, x, y);
  const is = (dx, dy) => tileAt(x+dx, y+dy).look === 'stoneTable';
  const tx = is(-1, 0) ? 16 : 0, ty = is(0, -1) ? 16 : 0;   // where this square is in the 32 x 32 table
  const px = (u, v, c) => { if (u >= tx && u < tx + 16 && v >= ty && v < ty + 16) R(g, X + u - tx, Y + v - ty, 1, 1, c); };
  for (let v = 0; v < 32; v++) for (let u = 0; u < 32; u++){
    const corner = (u < 3 || u > 28) && (v < 4 || (v > 17 && v < 25));
    let c = null;
    if (v >= 29 && v <= 31 && u >= 3 && u <= 28) c = CAVE_SHADOW;
    if (v >= 24 && v <= 29 && ((u >= 5 && u <= 9) || (u >= 22 && u <= 26))) c = u === 5 || u === 26 || v === 29 ? CAVE_OUT : u === 6 || u === 23 ? '#8E877A' : '#6F695E';   // the legs
    if (u >= 1 && u <= 30 && v >= 2 && v <= 24 && !corner) c = (v === 2 || v === 24 || u === 1 || u === 30) ? CAVE_OUT : v >= 20 ? (v === 20 ? STONE : STONE_FRONT) : v <= 4 ? STONE_LIGHT : (u * 7 + v * 3) % 23 === 0 ? '#A9A291' : STONE;
    if (c) px(u, v, c);
  }
  [[9, 9, '#F29B8F'], [13, 8, '#F7B3A5'], [21, 12, '#E8343C']].forEach(([cx, cy, c]) => {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (dx * dx + dy * dy <= 5) px(cx + dx, cy + dy, dx * dx + dy * dy >= 4 ? CAVE_OUT : dx < 0 && dy < 0 ? '#FFFFFF' : c);
    px(cx, cy - 3, '#3E8A3E');
  });
}
function stoneBowl(g, X, Y, x, y){   // a big stone bowl
  caveFloor(g, X, Y, x, y);
  oval(g, X+8, Y+14, 6, 1, CAVE_SHADOW);
  [7, 7, 6, 5, 4].forEach((w, k) => { R(g, X+8-w, Y+8+k, 2*w+1, 1, CAVE_OUT); R(g, X+9-w, Y+8+k, 2*w-1, 1, k < 1 ? STONE : '#A39C8E'); R(g, X+9-w, Y+8+k, 1, 1, STONE_LIGHT); });   // its sides
  R(g, X+5, Y+13, 7, 1, CAVE_OUT);                                                                                      // its foot
  oval(g, X+8, Y+7, 7, 2, CAVE_OUT); oval(g, X+8, Y+7, 6, 1, '#E2DCCF'); R(g, X+4, Y+7, 9, 1, '#4A443B');               // the rim, and inside
}
function stoneTablet(g, X, Y, says){   // a stone tablet on a plinth, with what it says carved down it (the cave's name, 水帘洞): two squares tall, from its bottom square (X, Y)
  const [tw, th] = writtenSize(says, 1, true), w = tw + 6, L = X + 8 - Math.floor(w / 2), top = Y + 11 - (th + 3), h = Y + 11 - top;
  R(g, X-1, Y+15, 18, 1, CAVE_SHADOW);
  R(g, L + 1, top, w - 2, h, CAVE_OUT); R(g, L, top + 1, w, h - 1, CAVE_OUT);   // its outline, its top corners rounded
  R(g, L + 1, top + 1, w - 2, h - 1, STONE); R(g, L + 1, top + 1, 1, h - 1, STONE_LIGHT); R(g, L + w - 2, top + 1, 1, h - 1, STONE_FRONT);
  write(g, says, L + 3, top + 2, '#5E574C', {down: true});
  R(g, X-1, Y+11, 18, 4, CAVE_OUT); R(g, X, Y+12, 16, 2, STONE_FRONT); R(g, X, Y+12, 16, 1, STONE);   // the plinth, a little wider
}
// The mountain path's ground: long grass (the meadow's tall grass, a shade darker: wild animals live in it), ledges
// (you hop down them), bushes and boulders along its edges, and a fallen tree.
// A ledge, as in Pokémon: the grass ends in a rounded lip, with a short grassy bank below it, lit at the top and darker
// down to its foot, and its shadow on the grass below. Where a row of ledges ends, the lip curves down.
const BANK = ['#A9E08F', '#5FA14F', '#4F9445', '#4F9445', '#3F7F38', '#3F7F38'];
function ledge(g, X, Y, x, y){
  grass(g, X, Y, x, y);
  const end = a => tileAt(a, y).look !== 'ledge', left = end(x-1), right = end(x+1);
  for (let i = 0; i < T; i++){
    const e = Math.min(left ? i : 9, right ? 15 - i : 9), top = Y + 6 + ([4, 2, 1][e] || 0);   // how far from the end it is, and where its lip is
    for (let k = 0; top + k < Y + 12; k++) R(g, X+i, top + k, 1, 1, BANK[Math.min(k, BANK.length - 1)]);
    if (i % 2 && e > 0) R(g, X+i, top + 2, 1, i % 4 === 1 ? 2 : 1, '#3F7F38');   // grass hanging over the lip
    if (e === 0) R(g, X+i, top + 1, 1, Y + 12 - top, '#2C5E2A');                // the very end
    R(g, X+i, Y+12, 1, 1, '#2C5E2A'); R(g, X+i, Y+13, 1, 2, '#5FA853');         // its foot, and its shadow
  }
}
function bush(g, X, Y, x, y){   // a round bush, its leaves like the trees'
  grass(g, X, Y, x, y);
  groundShadow(g, X+8, Y+14, 7, 2);
  leaves(g, [[5,9,4],[11,9,4],[8,6,5]], X, Y, x*7 + y*13);
}
function fallenTree(g, X, Y, x, y){
  grass(g, X, Y, x, y);
  R(g, X, Y + 6, T, 7, '#4A2C17'); R(g, X, Y + 7, T, 5, '#8A5A32'); R(g, X, Y + 7, T, 1, '#B98A55');
  for (let i = 2; i < 16; i += 5) R(g, X + i, Y + 9, 3, 1, '#6B4A2A');
  R(g, X + 11, Y + 6, 5, 7, '#4A2C17'); R(g, X + 12, Y + 7, 3, 5, '#D9B07A'); R(g, X + 13, Y + 9, 1, 1, '#8A5A32');   // its broken end
  R(g, X + 4, Y + 3, 1, 3, '#3E8A3E'); R(g, X + 3, Y + 2, 3, 1, '#5FA85A');   // a green shoot
}
// Ground marked out for building (a plot): bare earth, with string along its edges and a wooden stake at each corner.
// (What's built on it stands on the same earth: its edges are where the look changes.)
function plot(g, X, Y, x, y){
  R(g, X, Y, T, T, '#A8794A');
  for (let i = 0; i < 6; i++){ const px = Math.floor(rnd(x,y,i+900)*15), py = Math.floor(rnd(x,y,i+910)*15); R(g, X+px, Y+py, 2, 1, i % 2 ? '#93683F' : '#BD8E5C'); }
  const me = tileAt(x, y).look, edge = (dx, dy) => tileAt(x+dx, y+dy).look !== me, up = edge(0, -1), down = edge(0, 1), left = edge(-1, 0), right = edge(1, 0);
  if (up) R(g, X, Y+1, T, 1, '#EFE6CF'); if (down) R(g, X, Y+14, T, 1, '#EFE6CF');
  if (left) R(g, X+1, Y, 1, T, '#EFE6CF'); if (right) R(g, X+14, Y, 1, T, '#EFE6CF');
  const stake = (sx, sy) => { R(g, X+sx, Y+sy-2, 2, 5, WOOD[1]); R(g, X+sx, Y+sy-2, 1, 5, WOOD[3]); R(g, X+sx, Y+sy-2, 2, 1, WOOD[0]); };
  if (up && left) stake(0, 1); if (up && right) stake(14, 1); if (down && left) stake(0, 12); if (down && right) stake(14, 12);
}
// The pine wood: its floor (grass a shade darker, strewn with fallen pine needles); what's left of a dry tree you've knocked
// down (a stump, its cut top showing the rings, chips round it); a small stone to pick up, by the stream; and what's left
// of a rock you've broken (small stones scattered about, walkable).
// The pine wood's floor under something small, or where something was (a stone picked up, a stump): grass where it's
// grassy round about (in the sunny glade), pine needles otherwise.
const GRASS_FLOOR = ['grass','tallGrass','flowers','redFlowers','yellowFlowers','whiteFlowers'];
function woodFloor(g, X, Y, x, y){
  const grassy = Object.values(DV).filter(([dx, dy]) => GRASS_FLOOR.includes(tileAt(x + dx, y + dy).look)).length;
  (grassy >= 2 ? grass : needles)(g, X, Y, x, y);
}
function needles(g, X, Y, x, y){
  R(g, X, Y, T, T, '#72B262');
  for (let i = 0; i < 9; i++){
    const px = Math.floor(rnd(x,y,i+940)*14), py = Math.floor(rnd(x,y,i+950)*15), c = ['#5E9A4E', '#A57A48', '#C29560'][i % 3];
    if (i % 3 === 0) R(g, X+px, Y+py, 1, 1, c);
    else if (rnd(x,y,i+960) < .5) R(g, X+px, Y+py, 2, 1, c);                    // a needle lying across
    else { R(g, X+px, Y+py, 1, 1, c); R(g, X+px+1, Y+py+1, 1, 1, c); }          // or aslant
  }
}
function stump(g, X, Y, x, y){
  woodFloor(g, X, Y, x, y);
  oval(g, X+8, Y+13, 7, 1, '#5E9A4E');                                                               // its shadow
  R(g, X+2, Y+11, 13, 3, WOOD[0]); R(g, X+3, Y+11, 11, 2, WOOD[1]);                                   // roots, spreading out
  R(g, X+4, Y+7, 9, 6, WOOD[0]); R(g, X+5, Y+7, 7, 5, WOOD[1]); R(g, X+5, Y+7, 2, 5, WOOD[2]);       // the bark, lit on the left
  R(g, X+8, Y+9, 1, 3, WOOD[0]); R(g, X+10, Y+8, 1, 3, WOOD[0]);                                      // its furrows
  R(g, X+5, Y+4, 7, 1, WOOD[0]); R(g, X+4, Y+5, 9, 3, WOOD[0]); R(g, X+3, Y+6, 11, 1, WOOD[0]); R(g, X+5, Y+8, 7, 1, WOOD[0]);   // the cut top: its rim,
  R(g, X+5, Y+5, 7, 3, '#E2C08E'); R(g, X+4, Y+6, 9, 1, '#E2C08E');                                   // pale wood,
  R(g, X+7, Y+5, 3, 1, '#C49461'); R(g, X+7, Y+7, 3, 1, '#C49461'); dot(g, X+6, Y+6, '#C49461'); dot(g, X+10, Y+6, '#C49461'); dot(g, X+8, Y+6, WOOD[1]);   // and its rings
  R(g, X+1, Y+9, 2, 1, WOOD[4]); R(g, X+13, Y+14, 2, 1, WOOD[3]); dot(g, X+14, Y+3, WOOD[4]);         // chips
}
function pebble(g, X, Y, x, y){
  woodFloor(g, X, Y, x, y);
  oval(g, X+8, Y+12, 5, 1, '#5E9A4E');
  oval(g, X+8, Y+9, 5, 3, GREY[0]); oval(g, X+8, Y+9, 4, 2, GREY[2]); R(g, X+5, Y+8, 4, 1, GREY[3]); dot(g, X+6, Y+7, GREY[4]); R(g, X+7, Y+11, 4, 1, GREY[1]);
  R(g, X+1, Y+13, 2, 2, GREY[1]); dot(g, X+1, Y+13, GREY[3]); R(g, X+13, Y+4, 2, 1, GREY[2]);
}
function rubble(g, X, Y, x, y){
  woodFloor(g, X, Y, x, y);
  [[3, 9, 3, 2], [9, 11, 3, 2], [10, 5, 3, 2], [5, 4, 2, 1], [13, 9, 2, 1], [2, 13, 2, 1]].forEach(([px, py, w, h], i) => {
    R(g, X+px, Y+py+h, w, 1, '#5E9A4E'); R(g, X+px, Y+py, w, h, i % 2 ? GREY[1] : GREY[2]); dot(g, X+px, Y+py, GREY[3]);
  });
}
// Inside the school (the classroom): wooden floorboards; its walls (dark wood round the edge, and the back wall's face:
// plaster, with a beam along the top and a wooden rail at the bottom); paper windows in it, and the blackboard, each one
// picture as big as its block (big objects), with chalk writing and a tray; the teacher's table and the pupils' desks
// (each as long as its row: a double desk is two squares), with books on them; and a red mat at the door.
const CLASS = {floor:'#C99A62', board:'#AF7F49', grain:'#D8AE78', wall:'#5C3D24', plaster:'#EDE3CC', chalk:'#2F4A3B'};
function classFloor(g, X, Y, x, y){
  R(g, X, Y, T, T, CLASS.floor);
  for (let r = 0; r < 4; r++){
    R(g, X, Y + r*4 + 3, T, 1, CLASS.board);
    const j = (x*7 + y*11 + r*5) % 16; R(g, X + j, Y + r*4, 1, 3, CLASS.board);   // where one board ends and the next begins
    R(g, X + (j + 9) % 15, Y + r*4 + 1, 2, 1, CLASS.grain);
  }
}
function classWall(g, X, Y, x, y){ R(g, X, Y, T, T, CLASS.wall); R(g, X, Y, T, 1, '#7A5232'); R(g, X, Y+15, T, 1, '#462E1B'); R(g, X+3+(x*5+y*3)%9, Y+4+(x+y)%7, 3, 1, '#4E3320'); }
const BACK_WALL = ['wallFace', 'blackboard', 'classWindow'];   // the back wall's looks: the blackboard and windows are on it
function wallFace(g, X, Y, x, y){   // (a beam along its top, and a rail along its bottom, where the wall ends)
  R(g, X, Y, T, T, CLASS.plaster);
  for (let i = 0; i < 3; i++) R(g, X + Math.floor(rnd(x,y,i+970)*15), Y + 2 + Math.floor(rnd(x,y,i+980)*11), 1, 1, '#E0D3B6');
  if (!BACK_WALL.includes(tileAt(x, y-1).look)){ R(g, X, Y, T, 3, '#6B4A2A'); R(g, X, Y+3, T, 1, '#4A2C17'); }
  if (!BACK_WALL.includes(tileAt(x, y+1).look)){ R(g, X, Y+12, T, 4, '#8A5A32'); R(g, X, Y+12, T, 1, '#A87A45'); }
}
function classWindow(g, o){   // a paper window in the back wall, as tall as its block: the sky through it, and a lattice
  const X = o.x*T + 2, Y = o.y*T + 5, w = o.w*T - 4, h = o.h*T - 12;
  R(g, X, Y, w, h, '#6B4A2A'); R(g, X+1, Y+1, w-2, h-2, '#BFE3F5'); R(g, X+1, Y+1, w-2, Math.round(h / 3), '#DDF1FA');
  for (let i = 4; i < w - 1; i += 4) R(g, X+i, Y+1, 1, h-2, '#8A5A32');
  for (let j = 5; j < h - 1; j += 5) R(g, X+1, Y+j, w-2, 1, '#8A5A32');
  dot(g, X+2, Y+2, '#FFFFFF');
}
function blackboard(g, o){   // the blackboard, as big as its block: a wooden frame, the numbers in chalk, and a tray with chalk
  const X = o.x*T, Y = o.y*T + 4, w = o.w*T, h = o.h*T - 10;
  R(g, X, Y, w, h, '#7A5230'); R(g, X+2, Y+2, w-4, h-4, CLASS.chalk);
  const [nw, nh] = writtenSize('一二三四五六七八九十', 3);
  write(g, '一二三四五六七八九十', X + Math.round((w - nw) / 2), Y + Math.round((h - nh) / 2), '#E8F0E8', {gap: 3});   // the numbers, in the middle
  R(g, X+1, Y+h, w-2, 2, '#5A3A20'); R(g, X + Math.round(w * .7), Y+h-1, 3, 1, '#FFFFFF'); R(g, X + Math.round(w * .3), Y+h-1, 2, 1, '#F4D0D0');   // the tray, with chalk
}
function classTable(g, X, Y, x, y, top, front, book){   // a table as long as its row (the teacher's, or a pupils' desk)
  classFloor(g, X, Y, x, y);
  const me = tileAt(x, y).look, left = tileAt(x-1, y).look !== me, right = tileAt(x+1, y).look !== me;
  const L = X + (left ? 1 : 0), w = T - (left ? 1 : 0) - (right ? 1 : 0);
  R(g, X, Y+14, T, 2, '#9C7246');                                                                        // its shadow
  if (left) R(g, X+2, Y+11, 2, 4, '#5A3A20'); if (right) R(g, X+12, Y+11, 2, 4, '#5A3A20');              // legs
  R(g, L, Y+4, w, 7, '#4A2C17'); R(g, L, Y+5, w, 4, top); R(g, L, Y+5, w, 1, mix(top, '#FFFFFF', .3)); R(g, L, Y+9, w, 2, front);   // its top and front
  if (book) book(g, X, Y, x, y);
}
const teacherTable = (g, X, Y, x, y) => classTable(g, X, Y, x, y, '#A87444', '#7A5230', (g, X, Y, x, y) => {
  if (x % 2){ R(g, X+4, Y+4, 7, 2, '#3F8FCB'); R(g, X+5, Y+3, 6, 1, '#C0392B'); R(g, X+4, Y+2, 6, 1, '#E8E0C8'); }   // a pile of books
  else { R(g, X+6, Y+3, 4, 4, '#E8E0C8'); R(g, X+6, Y+3, 4, 1, '#FFFFFF'); }                                    // a cup
});
const desk = (g, X, Y, x, y) => classTable(g, X, Y, x, y, '#D2A46A', '#9C6E3E', (g, X, Y) => {
  R(g, X+4, Y+5, 8, 3, '#F4F0E4'); R(g, X+8, Y+5, 1, 3, '#B8AE98'); R(g, X+5, Y+6, 2, 1, '#9C9484'); R(g, X+10, Y+6, 1, 1, '#9C9484');   // an open book
});
function doorMat(g, X, Y, x, y){ classFloor(g, X, Y, x, y); R(g, X+1, Y+3, 14, 12, '#7A1F1A'); R(g, X+2, Y+4, 12, 10, '#B0352C'); R(g, X+4, Y+6, 8, 6, '#C9483C'); }
function flower(g, X, Y, col){ R(g, X, Y+3, 1, 2, '#3E8A3E'); R(g, X-1, Y, 3, 1, col); R(g, X, Y-1, 1, 3, col); R(g, X, Y, 1, 1, '#FFE07A'); }
// How each look is painted. Each area's legend picks a look for each map letter.
const LOOKS = {
  grass:     (g,X,Y,x,y) => grass(g,X,Y,x,y),
  path:      (g,X,Y,x,y) => path(g,X,Y,x,y),
  tallGrass: (g,X,Y,x,y) => tall(g,X,Y,x,y),
  flowers:   (g,X,Y,x,y) => { grass(g,X,Y,x,y); flower(g,X+4,Y+4,'#F48FB1'); flower(g,X+11,Y+7,'#FFFFFF'); flower(g,X+6,Y+11,'#F48FB1'); },
  redFlowers:    (g,X,Y,x,y) => { grass(g,X,Y,x,y); flower(g,X+4,Y+4,'#E8343C'); flower(g,X+11,Y+7,'#E8343C'); flower(g,X+6,Y+11,'#E8343C'); },
  yellowFlowers: (g,X,Y,x,y) => { grass(g,X,Y,x,y); flower(g,X+4,Y+4,'#F7D23E'); flower(g,X+11,Y+7,'#F7D23E'); flower(g,X+6,Y+11,'#F7D23E'); },
  whiteFlowers:  (g,X,Y,x,y) => { grass(g,X,Y,x,y); flower(g,X+4,Y+4,'#FFFFFF'); flower(g,X+11,Y+7,'#FFFFFF'); flower(g,X+6,Y+11,'#FFFFFF'); },
  // trees, the fruit trees, your stone, the rocks and the stall: just the ground here; they're big objects (OBJECT_ART, below)
  tree:      (g,X,Y,x,y) => grass(g,X,Y,x,y),
  peachTree: (g,X,Y,x,y) => grass(g,X,Y,x,y),
  appleTree: (g,X,Y,x,y) => grass(g,X,Y,x,y),
  rocks:     (g,X,Y,x,y) => path(g,X,Y,x,y),
  stone:     (g,X,Y,x,y) => grass(g,X,Y,x,y),
  sign:      (g,X,Y,x,y) => { grass(g,X,Y,x,y); g.drawImage(SPR.sign,X,Y); },
  stall:     (g,X,Y,x,y) => grass(g,X,Y,x,y),
  post:      (g,X,Y,x,y) => { grass(g,X,Y,x,y); R(g,X+4,Y+14,8,2,'#5DA651'); g.drawImage(SPR.post,X,Y); },   // the practice post, one square
  cliff:     (g,X,Y,x,y) => cliff(g,X,Y,x,y),
  longGrass: (g,X,Y,x,y) => tall(g,X,Y,x,y,LONG),
  ledge:     (g,X,Y,x,y) => ledge(g,X,Y,x,y),
  bush:      (g,X,Y,x,y) => bush(g,X,Y,x,y),
  plot:      (g,X,Y,x,y) => plot(g,X,Y,x,y),   // ground marked out for building
  frame:     (g,X,Y,x,y) => plot(g,X,Y,x,y),   // the school's frame going up on its plot: a big object (OBJECT_ART), on the plot's earth
  needles:   (g,X,Y,x,y) => woodFloor(g,X,Y,x,y),   // the pine wood's floor (grass in a sunny glade)
  pine:      (g,X,Y,x,y) => woodFloor(g,X,Y,x,y),   // a pine, a dead one and a cracked rock: big objects, on the pine wood's floor
  deadPine:  (g,X,Y,x,y) => woodFloor(g,X,Y,x,y),
  crackedRock:(g,X,Y,x,y) => woodFloor(g,X,Y,x,y),
  stump:     (g,X,Y,x,y) => stump(g,X,Y,x,y),
  pebble:    (g,X,Y,x,y) => pebble(g,X,Y,x,y),
  rubble:    (g,X,Y,x,y) => rubble(g,X,Y,x,y),
  school:    (g,X,Y,x,y) => grass(g,X,Y,x,y),   // the school, built on its plot: a big object (OBJECT_ART), on grass (no string or stakes round it any more)
  classFloor:(g,X,Y,x,y) => classFloor(g,X,Y,x,y),   // inside the school
  classWall: (g,X,Y,x,y) => classWall(g,X,Y,x,y),
  wallFace:  (g,X,Y,x,y) => wallFace(g,X,Y,x,y),
  classWindow:(g,X,Y,x,y) => wallFace(g,X,Y,x,y),   // a window and the blackboard: big objects on the back wall
  blackboard:(g,X,Y,x,y) => wallFace(g,X,Y,x,y),
  teacherTable:(g,X,Y,x,y) => teacherTable(g,X,Y,x,y),
  desk:      (g,X,Y,x,y) => desk(g,X,Y,x,y),
  doorMat:   (g,X,Y,x,y) => doorMat(g,X,Y,x,y),
  boulder:   (g,X,Y,x,y) => { grass(g,X,Y,x,y); boulder(g, X+8, Y+15, 6, 6, (x + y) % 2 === 0); },   // a boulder by the path
  log:       (g,X,Y,x,y) => fallenTree(g,X,Y,x,y),
  caveFloor: (g,X,Y,x,y) => caveFloor(g,X,Y,x,y),
  caveWall:  (g,X,Y,x,y) => caveWall(g,X,Y,x,y),
  stoneBed:  (g,X,Y,x,y) => stoneBed(g,X,Y,x,y),
  stoneTable:(g,X,Y,x,y) => stoneTable(g,X,Y,x,y),
  stoneBowls:(g,X,Y,x,y) => stoneBowl(g,X,Y,x,y),
  tablet:    (g,X,Y,x,y) => caveFloor(g,X,Y,x,y),   // (the stone tablet is a big object, taller than its square: OBJECT_ART)
  curtain:   (g,X,Y,x,y) => { R(g,X,Y,T,T,'#8FD0EE'); },   // the falling water is animated in js/draw.js

  water:     (g,X,Y,x,y) => waterBase(g,X,Y,x,y),   // ripples are animated in js/draw.js
  waterfall: (g,X,Y,x,y) => waterBase(g,X,Y,x,y),   // the falling water is animated in js/draw.js
  ironBridge:(g,X,Y,x,y) => {   // an iron bridge across a stream
    waterBase(g,X,Y,x,y);
    R(g,X+2,Y,12,T,'#5A616B'); for (let i = 0; i < 16; i += 3) R(g,X+2,Y+i,12,1,'#454B54');
    R(g,X+1,Y,1,T,'#2F3338'); R(g,X+14,Y,1,T,'#2F3338');
  },
  bridgeAcross:(g,X,Y,x,y) => {   // a bridge over a river that runs from side to side: its planks go across
    waterBase(g,X,Y,x,y);
    for (let i = 0; i < 16; i += 4){ R(g,X+1,Y+i,14,3,(i/4) % 2 ? '#A0743F' : '#B98A55'); R(g,X+1,Y+i+3,14,1,'#6B4A2A'); }
    R(g,X,Y,2,T,'#6B4A2A'); R(g,X+14,Y,2,T,'#6B4A2A');
  },
  bridge:    (g,X,Y,x,y) => {
    waterBase(g,X,Y,x,y);
    for (let i = 0; i < 16; i += 4){ R(g,X+i,Y+1,3,14,(i/4) % 2 ? '#A0743F' : '#B98A55'); R(g,X+i+3,Y+1,1,14,'#6B4A2A'); }
    R(g,X,Y,T,2,'#6B4A2A'); R(g,X,Y+14,T,2,'#6B4A2A');
  }
};

/* ---- big objects: trees, the fruit trees, your stone, the rocks, the stall and the cave's stone tablet ----
   They're bigger than the squares they stand on: a tree's leaves reach up into the square above, and a block of
   forest two squares by two is one big tree. Each is drawn into two pictures of its own (OBJECT_PIECES, below),
   which js/draw.js puts on the screen every frame, from the top of the map down so nearer ones overlap: its base
   (its squares and below) under the characters, and its top (what reaches up above its squares) over them. Walk
   behind a tree and its leaves cover you; walk through them and it rustles. */
const LEAF = [TREE_PAL.o, TREE_PAL.d, TREE_PAL.l, TREE_PAL.h, '#9BE08A'];   // darkest to lightest
const GREY = [ROCK_PAL.o, ROCK_PAL.d, ROCK_PAL.m, ROCK_PAL.l, '#E6E2D6'];
const WOOD = ['#4A2C17', '#6B4A2A', '#8A5A32', '#B98A55', '#D2A46A'];
const PEACHES = ['#F7A08F', '#FFE0CF'], APPLES = ['#E8343C', '#FF8A80'];
const dot = (g, x, y, c) => R(g, x, y, 1, 1, c);
function disc(g, cx, cy, r, col){ for (let dy = -r; dy <= r; dy++){ const w = Math.floor(Math.sqrt(r*r - dy*dy)); R(g, cx - w, cy + dy, w*2 + 1, 1, col); } }
function oval(g, cx, cy, rx, ry, col){ for (let dy = -ry; dy <= ry; dy++){ const w = Math.round(rx * Math.sqrt(1 - dy*dy / (ry*ry))); R(g, cx - w, cy + dy, w*2 + 1, 1, col); } }
let shadows = true;   // (off while drawing what goes over the characters: shadows stay on the ground)
const groundShadow = (g, cx, cy, rx, ry) => { if (shadows) oval(g, cx, cy, rx, ry, '#5DA651'); };
function leaves(g, blobs, X, Y, seed){   // a tree's leaves, as round clumps [x, y, radius]: an outline, then dark, mid and light, lit from the top left
  blobs.forEach(([cx, cy, r]) => disc(g, X+cx, Y+cy, r+1, LEAF[0]));
  blobs.forEach(([cx, cy, r]) => disc(g, X+cx, Y+cy, r, LEAF[1]));
  blobs.forEach(([cx, cy, r]) => disc(g, X+cx-1, Y+cy-1, r-2, LEAF[2]));
  blobs.forEach(([cx, cy, r]) => disc(g, X+cx-2, Y+cy-3, Math.max(1, r-4), LEAF[3]));
  blobs.forEach(([cx, cy, r], i) => {
    dot(g, X+cx-3, Y+cy-4, LEAF[4]); dot(g, X+cx-2, Y+cy-5, LEAF[4]);
    for (let k = 0; k < r; k++) dot(g, X+cx-r+2+Math.floor(rnd(seed,i,k)*(2*r-3)), Y+cy+Math.floor(rnd(seed,i,k+50)*r*.7), LEAF[0]);
  });
}
function trunk(g, X, Y, w, h){ R(g, X, Y, w, h, WOOD[1]); R(g, X, Y, 1, h, WOOD[3]); R(g, X+w-1, Y, 1, h, WOOD[0]); R(g, X-1, Y+h-1, w+2, 1, WOOD[0]); }
const fruit = (g, spots, X, Y, [col, shine]) => spots.forEach(([cx, cy]) => { R(g, X+cx, Y+cy, 2, 2, col); dot(g, X+cx, Y+cy, shine); });
function boulder(g, cx, by, rx, ry, cracked){   // a rock sitting on the ground at by
  groundShadow(g, cx, by, rx+1, 3);
  oval(g, cx, by-ry, rx+1, ry+1, GREY[0]); oval(g, cx, by-ry, rx, ry, GREY[2]);
  oval(g, cx-2, by-ry-2, rx-3, ry-3, GREY[3]); oval(g, cx-4, by-ry-4, Math.max(1, rx-8), Math.max(1, ry-7), GREY[4]);
  R(g, cx-rx+2, by-3, rx*2-3, 2, GREY[1]);
  if (cracked) [[0,0],[0,2],[-1,4],[0,6],[1,8],[2,5],[3,4],[-2,7],[-3,8]].forEach(([a, c]) => dot(g, cx+a, by-6-ry+c, GREY[0]));
}
// How each big object is drawn, given where it stands {x, y, w, h} (in squares).
const OBJECT_ART = {
  tree: (g, o) => {
    const X = o.x*T, Y = o.y*T, seed = o.x*31 + o.y;
    if (o.w === 2){ groundShadow(g, X+16, Y+29, 13, 3); trunk(g, X+13, Y+21, 6, 9); leaves(g, [[16,6,10],[8,13,8],[24,13,8],[16,15,9]], X, Y, seed); }   // two squares by two
    else { groundShadow(g, X+8, Y+14, 7, 2); trunk(g, X+7, Y+8, 3, 7); leaves(g, [[8,-1,6],[8,5,7]], X, Y, seed); }                                       // tall
  },
  peachTree: (g, o) => fruitTree(g, o, PEACHES),
  appleTree: (g, o) => fruitTree(g, o, APPLES),
  stone: (g, o) => boulder(g, o.x*T + 8, o.y*T + 15, 11, 9, true),
  rocks: (g, o) => { for (let i = 0; i < o.w; i++) boulder(g, o.x*T + 8 + i*14, o.y*T + 15, 10 - i % 2, 8 - i % 2, false); },
  stall: (g, o) => stall(g, o.x*T + 2, o.y*T, o.w*T - 4),
  pine: (g, o) => pine(g, o.x*T, o.y*T, o.x*31 + o.y),
  deadPine: (g, o) => deadPine(g, o.x*T, o.y*T),
  tablet: (g, o) => stoneTablet(g, o.x*T, (o.y + o.h - 1)*T, tileAt(o.x, o.y).sign.says.zh),   // (standing on its bottom square, with what it says carved down it)
  crackedRock: (g, o) => {   // a rock with a deep crack down it, and moss on top: one hit with your stick will break it
    const X = o.x*T, Y = o.y*T;
    boulder(g, X+8, Y+15, 7, 6, false);
    [[8,3],[8,4],[7,5],[7,6],[8,7],[9,8],[8,9],[8,10],[9,11],[9,5],[10,4],[6,7],[5,8]].forEach(([a, c]) => dot(g, X+a, Y+c, GREY[0]));
    [[4,4],[5,3],[6,3],[11,3],[12,4],[3,6]].forEach(([a, c]) => dot(g, X+a, Y+c, '#5E8F3E'));
  },
  frame: (g, o) => schoolFrame(g, o),
  school: (g, o) => schoolHouse(g, o.x*T, o.y*T, o.w*T, o.h*T, {walls:1, roof:1, sign:true, paint:paintedParts()}),   // (painted as you learn colours)
  blackboard: (g, o) => blackboard(g, o),
  classWindow: (g, o) => classWindow(g, o)
};
// A pine (the pine wood's trees): a straight trunk, and three tiers of dark needles narrowing to a point, reaching well
// up above its square.
const PINE = ['#163A28', '#24573A', '#33724A', '#4E9460', '#83C07A'];   // darkest to lightest
function pine(g, X, Y, seed){
  groundShadow(g, X+8, Y+14, 6, 2);
  trunk(g, X+7, Y+8, 3, 7);
  const tier = (top, bottom, half) => {   // a tier of needles: from its point at top, widening to half each side at bottom
    const w = y => Math.round(half * (y - top + 1) / (bottom - top + 1));
    for (let y = top; y <= bottom; y++) R(g, X+7-w(y), Y+y, 2*w(y)+3, 1, PINE[0]);   // its outline
    for (let y = top + 1; y < bottom; y++){
      const k = w(y), lit = Math.max(1, Math.round(k * .7));
      R(g, X+8-k, Y+y, 2*k+1, 1, PINE[2]); R(g, X+8-k, Y+y, lit, 1, PINE[3]); R(g, X+9+Math.round(k * .3), Y+y, Math.max(0, k - Math.round(k * .3)), 1, PINE[1]);
    }
    dot(g, X+6, Y+top+3, PINE[4]); if (rnd(seed, top, 3) < .6) dot(g, X+5, Y+bottom-2, PINE[4]);
  };
  tier(-1, 12, 7); tier(-9, 5, 6); tier(-17, -2, 4);
}
// A dead pine, long dry: a bare grey trunk with a broken top, and a few bare branches, one with its last brown needles.
// One hit with your stick knocks it down (it becomes a stump).
const BARE = ['#3B3128', '#6E6152', '#948573', '#B9AA94'];   // darkest to lightest
function deadPine(g, X, Y){
  groundShadow(g, X+8, Y+14, 5, 2);
  R(g, X+5, Y+12, 7, 3, BARE[0]); R(g, X+6, Y-13, 5, 26, BARE[0]);                                  // its roots, and the trunk's edge
  R(g, X+7, Y-12, 3, 26, BARE[2]); R(g, X+7, Y-12, 1, 26, BARE[3]); R(g, X+9, Y-12, 1, 26, BARE[1]);  // the trunk
  R(g, X+7, Y-16, 3, 4, BARE[0]); R(g, X+8, Y-15, 1, 3, BARE[2]);                                    // its broken top
  [[8, 2], [8, 6], [9, -5], [7, -9]].forEach(([a, c]) => R(g, X+a, Y+c, 1, 2, BARE[1]));            // cracks in the bark
  const branch = pts => { pts.forEach(([a, c]) => R(g, X+a-1, Y+c, 2, 2, BARE[0])); pts.forEach(([a, c]) => dot(g, X+a, Y+c, BARE[2])); };
  branch([[5, -3], [4, -4], [3, -5], [2, -6], [1, -8]]);       // up to the left
  branch([[11, -8], [12, -9], [13, -10], [14, -12]]);          // up to the right
  branch([[5, 5], [4, 4], [3, 3]]);                            // a short one, broken
  branch([[11, 2], [12, 1], [13, 0], [14, 0]]);
  oval(g, X+14, Y-13, 2, 2, '#5A3E22'); oval(g, X+14, Y-13, 1, 1, '#9C6B3A'); dot(g, X+15, Y-12, '#B98A55');   // its last brown needles
}
// The school going up on its plot (once the troop has the wood and stones): a footing of small stones along the front,
// wooden posts and beams, the roof's frame rising to a point in the middle, a brace in each side, and a ladder.
function woodLine(g, x0, y0, x1, y1){   // a beam from (x0, y0) to (x1, y1): dark edges, light wood
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
  for (let i = 0; i <= n; i++){ const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); R(g, x - 1, y - 1, 3, 3, WOOD[0]); }
  for (let i = 0; i <= n; i++){ const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); dot(g, x, y, WOOD[3]); }
}
// The school, once the troop has built it, over its frame: a footing of the small stones, plank walls between wooden
// pillars, paper windows with a lattice, a double door in the middle (over the door square), a grey tiled roof whose eaves
// curl up at the ends, red lanterns, and a sign over the door saying 学校. built: how far it's got (in the scene of the troop building
// it): its walls and roof, from 0 to 1, each going up from the bottom, and whether the sign and lanterns are up. Its
// paint: the parts the troop has painted (the colour lessons), each with its colour word (walls, pillars, windows, door,
// roof, and blossom, peach blossom painted under the windows); and wipe: the part being painted (in the scene of it),
// and how far across the brushes have got, from 0 to 1.
const TILES = ['#3E4852', '#56616C', '#64707C', '#7C8996'];   // the roof's tiles, darkest to lightest
// The paints, by colour word: each part is shaded from its paint (shade: darker below 0, lighter above).
const SCHOOL_PARTS = ['walls', 'pillars', 'windows', 'blossom', 'door', 'roof'];   // the parts of the school that can be painted
const PAINT = {'红色':'#C8322B', '黄色':'#E8B83A', '白色':'#F2EEE4', '黑色':'#2A2626', '蓝色':'#3A6DB5', '绿色':'#2F8F4E', '棕色':'#6E4325', '橙色':'#E0702A', '粉色':'#F4A6C6'};
const shade = (c, k) => k < 0 ? mix(c, '#000000', -k) : mix(c, '#FFFFFF', k);
function schoolHouse(g, X, Y, W, H, built = {walls:1, roof:1, sign:true}){
  const base = Y + H - 4, wallTop = base - 28, ridge = wallTop - 20, mid = X + Math.round(W / 2);
  const reveal = (from, to, k, draw) => { if (k <= 0) return; g.save(); g.beginPath(); g.rect(X - 24, Math.floor(to + (from - to) * (1 - k)), W + 48, Math.ceil((from - to) * k) + 2); g.clip(); draw(); g.restore(); };
  const paint = built.paint || {}, wipe = built.wipe;
  const part = (name, draw) => {   // a part, in its paint (c), if it has one; being painted, bare, then painted as far across as the brushes are
    const c = PAINT[paint[name]];
    if (!wipe || wipe.part !== name){ draw(c); return; }
    draw(null);
    if (c && wipe.k > 0){ g.save(); g.beginPath(); g.rect(X - 24, Y - 40, Math.round((W + 48) * wipe.k), H + 80); g.clip(); draw(c); g.restore(); }
  };
  const ww = mid - 16 - (X + 14) - 4;   // the windows' width
  reveal(base, wallTop, built.walls, () => {   // the walls, from the footing up
    part('walls', c => {
      for (let y = wallTop; y < base; y++) R(g, X + 4, y, W - 8, 1, (y - wallTop) % 4 === 0 ? (c ? shade(c, -.35) : WOOD[2]) : c || WOOD[3]);
      R(g, X + 4, wallTop, 1, base - wallTop, c ? shade(c, .25) : WOOD[4]);
    });
    part('pillars', c => { for (const px of [X + 4, mid - 12, mid + 9, X + W - 7]){ R(g, px, wallTop, 3, base - wallTop, c ? shade(c, -.3) : WOOD[0]); R(g, px + 1, wallTop, 1, base - wallTop, c || WOOD[1]); } });
    part('windows', c => {   // paper windows with a lattice
      for (const wx of [X + 14, mid + 16]){
        R(g, wx, wallTop + 7, ww, 12, c ? shade(c, -.25) : WOOD[0]); R(g, wx + 1, wallTop + 8, ww - 2, 10, '#F3E9D2');
        for (let i = 4; i < ww - 2; i += 4) R(g, wx + i, wallTop + 8, 1, 10, c || WOOD[2]);
        for (let j = 3; j < 10; j += 3) R(g, wx + 1, wallTop + 8 + j, ww - 2, 1, c || WOOD[2]);
      }
    });
    part('blossom', c => {   // a branch of peach blossom painted under each window (only once it's painted)
      if (!c) return;
      for (const wx of [X + 14, mid + 16]){
        const by = wallTop + 23;
        for (let i = 0; i < ww - 2; i++) dot(g, wx + 1 + i, by + Math.round(Math.sin(i / 3) * .8), '#3A2212');
        for (const [dx, dy] of [[3, -2], [8, 1], [12, -2], [17, 1], [21, -2], [25, 1]]){
          if (dx >= ww - 2) continue;
          const fx = wx + dx, fy = by + dy;
          dot(g, fx, fy - 1, c); dot(g, fx - 1, fy, c); dot(g, fx + 1, fy, shade(c, -.15)); dot(g, fx, fy + 1, shade(c, -.15)); dot(g, fx, fy, shade(c, .55));
        }
      }
    });
    part('door', c => {   // the double door, with gold studs once it's painted
      R(g, mid - 6, base - 19, 12, 19, c ? shade(c, -.45) : WOOD[0]); R(g, mid - 5, base - 18, 5, 18, c || WOOD[1]); R(g, mid + 1, base - 18, 4, 18, c || WOOD[1]);
      R(g, mid - 4, base - 16, 3, 6, c ? shade(c, .12) : WOOD[2]); R(g, mid + 2, base - 16, 2, 6, c ? shade(c, .12) : WOOD[2]); dot(g, mid - 2, base - 9, GOLD_DOT); dot(g, mid + 1, base - 9, GOLD_DOT);
      if (c) for (const [sx, sy] of [[-4, -15], [3, -15], [-4, -4], [3, -4]]) dot(g, mid + sx, base + sy, GOLD_DOT);
    });
  });
  for (let sx = X + 2; sx < X + W - 4; sx += 7){ oval(g, sx + 3, base + 1, 3, 2, GREY[0]); oval(g, sx + 3, base + 1, 2, 1, GREY[2]); dot(g, sx + 2, base, GREY[3]); }   // the footing
  R(g, mid - 8, base + 1, 16, 3, GREY[1]); R(g, mid - 8, base + 1, 16, 1, GREY[3]);   // a stone step at the door
  reveal(wallTop + 3, ridge - 3, built.roof, () => part('roof', c => {   // the roof, from the eaves up: its tiles, in their paint once it's painted
    const t = c ? [shade(c, -.45), shade(c, -.2), c, shade(c, .25)] : TILES;
    for (let y = ridge; y <= wallTop + 2; y++){
      const k = (y - ridge) / (wallTop + 2 - ridge), half = Math.round(W / 2 - 14 + k * 20), L = mid - half, w = 2 * half;
      R(g, L - 1, y, w + 2, 1, t[0]);
      R(g, L, y, w, 1, (y - ridge) % 5 < 2 ? t[2] : t[1]);
      for (let tx = L + 2 + (y % 2); tx < L + w - 1; tx += 4) dot(g, tx, y, t[0]);   // the rows of tiles
      if ((y - ridge) % 5 === 0) R(g, L, y, w, 1, t[3]);
    }
    R(g, mid - W / 2 - 6, wallTop + 2, W + 12, 2, t[0]);   // the eaves' edge, and their tips curling up
    for (const [ex, d] of [[mid - W / 2 - 6, -1], [mid + W / 2 + 5, 1]]){ R(g, ex, wallTop, 1, 3, t[0]); R(g, ex + d, wallTop - 2, 1, 3, t[0]); dot(g, ex + d, wallTop - 3, t[2]); }
    R(g, mid - W / 2 + 12, ridge - 2, W - 24, 3, t[0]); R(g, mid - W / 2 + 13, ridge - 2, W - 26, 1, t[2]);   // the ridge, curling up at both ends
    for (const [ex, d] of [[mid - W / 2 + 12, -1], [mid + W / 2 - 13, 1]]){ R(g, ex + d, ridge - 4, 1, 3, t[0]); R(g, ex + 2 * d, ridge - 5, 1, 2, t[0]); }
  }));
  if (built.sign){
    const [tw, th] = writtenSize('学校', 2), pw = tw + 6, ph = th + 5, px = mid - Math.floor(pw / 2), py = wallTop - 7;   // the sign, under the eaves, over the door
    R(g, px, py, pw, ph, '#5A1A14'); R(g, px + 1, py + 1, pw - 2, ph - 2, '#9E2B25'); R(g, px + 1, py + 1, pw - 2, 1, '#E2B84A');
    write(g, '学校', px + 3, py + 3, '#F4E3B0', {gap: 2});
    for (const lx of [X + 6, X + W - 9]){ R(g, lx + 1, wallTop + 3, 1, 2, '#4A2C17'); oval(g, lx + 1, wallTop + 7, 2, 3, '#B0231C'); R(g, lx, wallTop + 6, 3, 1, '#E0443C'); R(g, lx, wallTop + 4, 3, 1, GOLD_DOT); R(g, lx + 1, wallTop + 11, 1, 2, GOLD_DOT); }   // red lanterns
  }
}
const GOLD_DOT = '#E2B84A';
// The school's frame, k of the way up (from 0 to 1: up, on the map; as the troop builds it, in the scene of building the
// school): the footing of small stones laid first, then the posts going up one by one, the beams, the braces, the roof's
// frame and a cross beam, and last a ladder (decided 21 October 2026: it had just popped up on the map).
function schoolFrame(g, o, k = 1){
  const X = o.x*T, Y = o.y*T, W = o.w*T, base = Y + o.h*T - 4, top = base - 28, peak = top - 22, mid = X + Math.round(W / 2);
  const posts = [X + 6, X + Math.round(W / 3), X + Math.round(W * 2 / 3), X + W - 7];
  const up = (from, to) => clamp((k - from) / (to - from), 0, 1);   // how far one part is up, as k goes from its from to its to
  const beam = (x0, y0, x1, y1, f) => { if (f > 0) woodLine(g, x0, y0, Math.round(x0 + (x1 - x0) * f), Math.round(y0 + (y1 - y0) * f)); };   // from (x0, y0), f of the way
  beam(X + 6, top, mid, peak, up(.76, .86)); beam(X + W - 7, top, mid, peak, up(.8, .9)); beam(mid, top, mid, peak, up(.84, .92));   // the roof's frame
  beam(mid - 12, top - 10, mid + 12, top - 10, up(.9, .96));                                                         // a cross beam
  posts.forEach((px, i) => beam(px, base, px, top, up(.16 + i * .08, .3 + i * .08)));                                // the posts
  beam(X + 4, top, X + W - 5, top, up(.52, .62)); beam(X + 4, top + 13, X + W - 5, top + 13, up(.56, .66));          // the beams
  beam(posts[0], top + 13, posts[1], top, up(.66, .72)); beam(posts[3], top + 13, posts[2], top, up(.7, .76));       // braces
  const stones = []; for (let sx = X + 2; sx < X + W - 4; sx += 7) stones.push(sx);
  stones.slice(0, Math.ceil(stones.length * up(0, .16))).forEach(sx => { oval(g, sx + 3, base + 1, 3, 2, GREY[0]); oval(g, sx + 3, base + 1, 2, 1, GREY[2]); dot(g, sx + 2, base, GREY[3]); });   // the footing
  if (k < .97) return;
  const lx = posts[2] + 9;   // a ladder against a post
  woodLine(g, lx, base, lx + 4, top + 2); woodLine(g, lx + 6, base, lx + 10, top + 2);
  for (let r = 1; r <= 4; r++){ const y = base - r * 6, f = (base - y) / (base - top - 2); R(g, Math.round(lx + 4 * f), y, 7, 1, WOOD[3]); }   // its rungs
}
function stall(g, L, Y, w){   // the shop owner's stall, w wide from L, standing on its squares: posts, a striped awning, and a counter with fruit
  const top = Y + 16 - Math.round(w * .66), cy = Y + 16 - Math.round(w * .26);
  groundShadow(g, L + w/2, Y+15, w/2, 2);
  R(g, L+1, top+5, 2, Y+10-top, WOOD[1]); R(g, L+w-3, top+5, 2, Y+10-top, WOOD[1]);   // posts
  for (let i = 0; i < w; i += 4){ const c = (i/4) % 2 ? '#F4F1EA' : '#C0392B'; R(g, L+i, top, Math.min(4, w-i), 5, c); R(g, L+i+1, top+5, 2, 1, c); }   // the awning's stripes and scalloped edge
  R(g, L, top, w, 1, '#8E241D');
  R(g, L+1, cy, w-2, Y+14-cy, WOOD[0]); R(g, L+2, cy+1, w-4, Y+12-cy, WOOD[3]); R(g, L+2, cy+1, w-4, 1, WOOD[4]);   // the counter
  const a = Math.round(w*.25), b2 = Math.round(w*.6);
  fruit(g, [[a,-3],[a+3,-3]], L, cy, PEACHES); fruit(g, [[b2,-3],[b2+3,-3]], L, cy, APPLES);
}
function fruitTree(g, o, colours){   // a square and a half wide, reaching up, full of fruit
  const X = o.x*T, Y = o.y*T;
  groundShadow(g, X+8, Y+14, 10, 2); trunk(g, X+6, Y+6, 4, 9);
  leaves(g, [[8,-4,8],[1,1,6],[15,1,6],[8,3,7]], X, Y, o.x*31 + o.y);
  fruit(g, [[2,-2],[9,-8],[13,-1],[6,3],[14,4],[-1,2]], X, Y, colours);
}
const ROW_OBJECTS = ['rocks', 'stall'];   // side by side, these make one object as wide as the row
const BLOCK_OBJECTS = ['frame', 'school', 'blackboard', 'classWindow', 'tablet'];   // and these one object as big as the block of them (such as the school's frame on its plot)
// The big objects in the place you're in, from its map: {look, x, y, w, h}, (x, y) being the top-left square they
// stand on. A block of the same tree letter two squares by two is one big tree; a row of rocks is one pile, and a row of
// stall letters one stall; a block of frame letters is one frame; anything else stands on its own square. They come from the top of the map down, the order they're drawn in.
function mapObjects(){
  const out = [], taken = new Set(), key = (x, y) => x + ',' + y;
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){
    const t = tileAt(x, y);
    if (!OBJECT_ART[t.look] || taken.has(key(x, y))) continue;
    const same = (a, c) => tileAt(a, c) === t && !taken.has(key(a, c));
    let w = 1, h = 1;
    if (t.look === 'tree' && same(x+1, y) && same(x, y+1) && same(x+1, y+1)){ w = 2; h = 2; }
    else if (ROW_OBJECTS.includes(t.look)) while (same(x+w, y)) w++;
    else if (BLOCK_OBJECTS.includes(t.look)){ while (same(x+w, y)) w++; while ([...Array(w).keys()].every(a => same(x+a, y+h))) h++; }
    for (let a = 0; a < w; a++) for (let c = 0; c < h; c++) taken.add(key(x+a, y+c));
    out.push({look:t.look, x, y, w, h});
  }
  return out.sort((p, q) => (p.y + p.h) - (q.y + q.h));
}
// The big objects in the place you're in, each {look, x, y, w, h} with: x0, y0 (where its pictures go on the map, in
// pixels), base and top (its two pictures), leaves (where its leaves reach, if it rustles) and rustle (when it last did).
let OBJECT_PIECES = [];
const PIECE_UP = 32, PIECE_SIDE = 16;   // room in its pictures above and beside an object's squares, for what reaches out of them
const LEAFY = ['tree', 'peachTree', 'appleTree'];   // what has leaves: they go over the characters beside it too, and rustle
const COLLECTABLE = [];   // the squares in the place you're in with something to collect (a part of their onLook has sparkle)
function buildMap(){   // the place you're in: the ground, then the big objects' pictures
  mapStory = mapStoryNow();   // (what the map letters that change with the story are, as it's drawn)
  if (mapCanvas.width !== COLS*T || mapCanvas.height !== ROWS*T){ mapCanvas.width = COLS*T; mapCanvas.height = ROWS*T; }   // a place of another size
  COLLECTABLE.length = 0;
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){
    const t = tileAt(x, y);
    LOOKS[t.look](mg, x*T, y*T, x, y);
    if ((t.onLook || []).some(p => p.sparkle)) COLLECTABLE.push([x, y]);
  }
  OBJECT_PIECES = mapObjects().map(o => {
    const x0 = o.x*T - PIECE_SIDE, y0 = o.y*T - PIECE_UP, w = o.w*T + 2*PIECE_SIDE, h = PIECE_UP + o.h*T + 4;
    const part = (rects, over) => {   // the object drawn, just inside these parts of its picture, each [x, y, w, h]
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'); g.save(); g.beginPath(); rects.forEach(([rx, ry, rw, rh]) => g.rect(rx, ry, rw, rh)); g.clip(); g.translate(-x0, -y0);
      shadows = !over; OBJECT_ART[o.look](g, o); shadows = true; g.restore();
      return c;
    };
    const leafy = LEAFY.includes(o.look);
    // Over the characters: what reaches up above its squares, and for a tree, its leaves reaching out beside them too (a
    // fruit tree's wide branches), so you go through them as you pass, not over them.
    const right = PIECE_SIDE + o.w*T, beside = [[0, PIECE_UP, PIECE_SIDE, h - PIECE_UP], [right, PIECE_UP, w - right, h - PIECE_UP]];
    return {...o, x0, y0, base: part([[0, PIECE_UP, w, h - PIECE_UP]], false), top: part([[0, 0, w, PIECE_UP], ...(leafy ? beside : [])], true), rustle: -1e9,
      // where walking in makes it rustle: through a wide fruit tree's branches, in the squares right beside it (not behind it, nor its corners)
      leafy: leafy && o.look !== 'tree' ? [[o.x-1, o.y], [o.x+1, o.y]] : null};
  });
  for (const c of [baseCanvas, topCanvas]){ c.width = COLS*T; c.height = ROWS*T; }   // (which clears them)
  const bg = baseCanvas.getContext('2d'), tg = topCanvas.getContext('2d');
  for (const p of OBJECT_PIECES) if (!p.leafy){ bg.drawImage(p.base, p.x0, p.y0); tg.drawImage(p.top, p.x0, p.y0); p.baked = true; }
  buildGloom();
}
// A gloomy place (a place's gloom, such as the pine wood's), made ready once for the place (drawGloom, js/draw.js, draws
// it): its shade, one pixel a square, darkest where the trees are thickest (deep) and lightest where it's open (open),
// worked out from how open each square's surroundings are, with sunshine on grass (a glade); and sunbeams slanting down
// into the open places. Gloomy, but always the daytime, never night, which would look as if night had fallen there
// while the home ground is in sunshine (decided 21 October 2026).
let GLOOM = null;   // the place's gloom; open: how open each square's surroundings are (0 deep in the trees, 1 wide open);
                    // shade: how dark each square is (0 to 1); beams: the squares where sunbeams land
const gloomCanvas = document.createElement('canvas'), beamCanvas = document.createElement('canvas');
function buildGloom(){
  const gl = PLACES[PLACE].gloom;
  GLOOM = null;
  if (!gl) return;
  const clear = (x, y) => { const t = tileAt(x, y); return !!t.walk || WATERY.includes(t.look); };   // (beyond the map: more trees)
  const open = [], shade = [], beams = [];
  gloomCanvas.width = COLS; gloomCanvas.height = ROWS;
  const g = gloomCanvas.getContext('2d');
  for (let y = 0; y < ROWS; y++){ open[y] = []; shade[y] = []; for (let x = 0; x < COLS; x++){
    let n = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) n += clear(x + dx, y + dy);
    const o = open[y][x] = n / 25, sunny = GRASS_FLOOR.includes(tileAt(x, y).look);
    const a = shade[y][x] = sunny ? 0 : +(gl.deep - (gl.deep - gl.open) * Math.min(1, o / .7)).toFixed(3);
    g.fillStyle = `rgba(12,28,22,${a})`; g.fillRect(x, y, 1, 1);
  } }
  beamCanvas.width = COLS*T; beamCanvas.height = ROWS*T;
  const bg = beamCanvas.getContext('2d');
  for (let y = 1; y < ROWS - 1; y += 3) for (let x = 1 + y % 2; x < COLS - 1; x += 3){   // a sunbeam slanting down into each open place
    if (open[y][x] < .62 || !clear(x, y)) continue;
    beams.push([x, y]);
    const bx = x*T + 8, by = y*T + 14, sh = bg.createLinearGradient(bx - 30, by - 60, bx, by);
    sh.addColorStop(0, 'rgba(255,246,200,0)'); sh.addColorStop(1, 'rgba(255,246,200,.3)');
    bg.fillStyle = sh; bg.beginPath(); bg.moveTo(bx - 40, by - 64); bg.lineTo(bx - 26, by - 64); bg.lineTo(bx + 9, by); bg.lineTo(bx - 7, by); bg.closePath(); bg.fill();
    const pool = bg.createRadialGradient(bx, by - 2, 1, bx, by - 2, 12);   // and where it lands
    pool.addColorStop(0, 'rgba(255,248,210,.3)'); pool.addColorStop(1, 'rgba(255,248,210,0)');
    bg.fillStyle = pool; bg.save(); bg.translate(bx, by - 2); bg.scale(1, .5); bg.beginPath(); bg.arc(0, 0, 12, 0, 7); bg.fill(); bg.restore();
  }
  GLOOM = {...gl, open, shade, beams};
}
// Backdrops for battles and animals' questions, where a place has one (its backdrop): pines, a gloomy pine wood (in the
// daytime: sunbeams, never night), drawn once with the map's own pines. Each is a scene's background (css/game.css:
// --backdrop-pines). Otherwise the scene is a meadow, or a cliff if that's where the animal lives (home 山).
const BACKDROPS = {
  pines(){
    const W = 72, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), sky = g.createLinearGradient(0, 0, 0, 62);
    sky.addColorStop(0, '#5E7C6A'); sky.addColorStop(1, '#9DB79F'); g.fillStyle = sky; g.fillRect(0, 0, W, 62);
    for (let i = 0; i < 9; i++) pine(g, i * 9 - 6, 44 + (i % 3) * 2, i + 7);   // the far pines, in a row
    g.fillStyle = 'rgba(157,183,159,.5)'; g.fillRect(0, 0, W, 64);              // (hazy, far off)
    R(g, 0, 60, W, H - 60, '#5B8C50');                                           // the floor, strewn with needles
    for (let i = 0; i < 90; i++) R(g, Math.floor(rnd(i, 3, 1) * W), 60 + Math.floor(rnd(i, 4, 2) * (H - 60)), 2, 1, ['#4C7A43', '#A57A48', '#6E9A5E'][i % 3]);
    pine(g, -9, 46, 3); pine(g, 64, 44, 5);                                       // near pines, at the sides
    for (const [x, w] of [[14, 7], [40, 5]]){                                     // sunbeams
      g.fillStyle = 'rgba(255,246,200,.16)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w, 0); g.lineTo(x + w + 22, 78); g.lineTo(x + 22, 78); g.closePath(); g.fill();
    }
    g.fillStyle = 'rgba(225,232,222,.22)'; g.fillRect(0, 55, W, 9);              // mist, low over the floor
    return c;
  }
};
if (document.documentElement) for (const [name, draw] of Object.entries(BACKDROPS)) document.documentElement.style.setProperty(`--backdrop-${name}`, `url(${draw().toDataURL()})`);
// A battle's or an animal's scene: the place's backdrop if it has one; otherwise a cliff where the animal lives on one.
const sceneLook = home => { const bd = (PLACES[PLACE] || {}).backdrop; return BACKDROPS[bd] ? ' ' + bd : home === '山' ? ' cliff' : ''; };
