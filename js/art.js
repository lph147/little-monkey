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
function monkeySprite(kind, dir, blink, step = 0){
  const k = kind + dir + (blink ? 'b' : '') + step; if (spriteCache[k]) return spriteCache[k];
  return spriteCache[k] = sprite(monkeyRows(kind, dir, blink, step), PALS[kind]);
}
// A monkey's pixel rows, as letters (PALS says each letter's colour). The app's icons use them too (tools/make-icons.js).
function monkeyRows(kind, dir, blink, step = 0){
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
  let out = rows.map(r => r.join(''));
  if (dir === 'left') out = out.map(r => [...r].reverse().join(''));
  return out;
}
// The area's animals, with their sprites from content/sprites.js: at their own spot (at), or hiding in the tall grass.
const ANIMALS = AREA.animals.map(a => ({id:a.id, name:WORD_BANK[a.word].en, hz:a.word, at:a.at || null, place:placeOf(a.at), home:a.home || HIDING_WORD, meetNote:a.meetNote,
  spr:sprite(SPRITES[a.word].rows, SPRITES[a.word].palette)}));
const GRASS_ANIMALS = ANIMALS.filter(a => !a.at);
const animalAt = (x, y) => canWild() ? ANIMALS.find(a => a.at && a.place === PLACE && a.at[0] === x && a.at[1] === y) : null;   // an animal living at this spot, once animals appear
const FRIEND_NAMES = {};   // what each friend is called in the Friends list
ANIMALS.forEach(a => { FRIEND_NAMES[a.id] = a.hz; });
AREA.characters.forEach(c => { if (c.name) FRIEND_NAMES[c.id] = c.name.zh; });

// The money symbol: a shell (the troop trades in shells from the shore), small, wherever the text says 🐚.
const SHELL = ["................","......oooo......","....oowrrwoo....","...owrwrrwrwo...","..owrwwrrwwrwo..",".owrwwwrrwwwrwo.",".orwwwwrrwwwwro.",".owrwwwrrwwwrwo.","..owrwwrrwwrwo..","...owrwrrwrwo...","....owrrrrwo....",".....owrrwo.....","....ooowwooo....","....owwoowwo....","....oooooooo....","................"];   // a scallop shell
let shellImg = null;
const money = html => String(html).replace(/🐚/g, () => shellImg || (shellImg = `<img class="money" alt="shells" src="${sprite(SHELL, {o:'#8A5A3A', w:'#F7E7CF', r:'#D9A77C'}).toDataURL()}">`));
// A pixel heart for an animal's friendship in an encounter: red once won, grey until then.
const HEART = [".oo...oo.", "ohho.orro", "ohrrrrrro", "orrrrrrro", ".orrrrro.", "..orrro..", "...oro...", "....o...."];
const heartImg = {};
const heartHTML = on => heartImg[on] || (heartImg[on] = `<img class="heart${on ? ' on' : ''}" alt="" src="${sprite(HEART, on
  ? {o:'#6A1C1C', r:'#E0443C', h:'#FFB3AB'} : {o:'#7C7470', r:'#CFC8C2', h:'#ECE7E2'}).toDataURL()}">`);
// A word's picture: its pixel sprite from content/sprites.js, or its emoji until it has one.
const picCache = {};
function picHTML(w){
  const s = SPRITES[w];
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
function speaker(id){
  const n = id === 'player' ? yourName() : NAMES[id];
  return `<div class="speaker">${portrait(id)}${n ? `<div class="spk"><div class="spk-zh">${n.zh} <span class="spk-py">${n.py}</span></div><div class="spk-en">${n.en}</div></div>` : ''}</div>`;
}
function portrait(id){
  if (portraitCache[id]) return portraitCache[id];
  let c;
  if (PALS[id]) c = monkeySprite(id, 'down', false, 0);
  else if (id === 'sign') c = SPR.sign;
  else { const a = ANIMALS.find(x => x.id === id); c = a ? a.spr : SPR.rock; }
  return portraitCache[id] = `<img class="portrait" alt="" src="${c.toDataURL()}">`;
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
const GRASSY = ['grass','tallGrass','flowers','redFlowers','yellowFlowers','whiteFlowers','tree','peachTree','appleTree','stone','sign','post','stall'];   // looks with grass underneath
const CLIFFS = ['cliff'];
const WATERY = ['water','waterfall','bridge','ironBridge'];
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
function tall(g, X, Y, x, y){
  R(g, X, Y, T, T, '#5BA552');
  const tuft = (ox, oy) => {
    [[0,3],[1,2],[2,3],[3,1],[4,3],[5,2],[6,3]].forEach(([a,c]) => R(g, X+ox+a, Y+oy+c, 1, 1, '#2F6E38'));
    [[1,1],[3,0],[5,1]].forEach(([a,c]) => R(g, X+ox+a, Y+oy+c, 1, 1, '#94D883'));
    R(g, X+ox, Y+oy+4, 7, 1, '#2F6E38');
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
function stoneTable(g, X, Y, x, y){   // a big stone table over several tiles: its edges where the next tile isn't table
  caveFloor(g, X, Y, x, y);
  const is = (dx, dy) => tileAt(x+dx, y+dy).look === 'stoneTable';
  const x0 = is(-1,0) ? 0 : 2, x1 = is(1,0) ? 16 : 14, y0 = is(0,-1) ? 0 : 3, y1 = is(0,1) ? 16 : 11;
  R(g, X+x0, Y+y0, x1-x0, y1-y0, '#B4AEA0');
  if (!is(0,-1)) R(g, X+x0, Y+y0, x1-x0, 2, '#CFC9BC');
  if (!is(0,1)) R(g, X+x0, Y+y1, x1-x0, 2, '#5E594F');
}
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
  // trees, the fruit trees, your stone, the rocks, the stall and the practice post: just the ground here; they're big objects (OBJECT_ART, below)
  tree:      (g,X,Y,x,y) => grass(g,X,Y,x,y),
  peachTree: (g,X,Y,x,y) => grass(g,X,Y,x,y),
  appleTree: (g,X,Y,x,y) => grass(g,X,Y,x,y),
  rocks:     (g,X,Y,x,y) => path(g,X,Y,x,y),
  stone:     (g,X,Y,x,y) => grass(g,X,Y,x,y),
  sign:      (g,X,Y,x,y) => { grass(g,X,Y,x,y); g.drawImage(SPR.sign,X,Y); },
  stall:     (g,X,Y,x,y) => grass(g,X,Y,x,y),
  post:      (g,X,Y,x,y) => grass(g,X,Y,x,y),
  cliff:     (g,X,Y,x,y) => cliff(g,X,Y,x,y),
  caveFloor: (g,X,Y,x,y) => caveFloor(g,X,Y,x,y),
  caveWall:  (g,X,Y,x,y) => caveWall(g,X,Y,x,y),
  stoneBed:  (g,X,Y,x,y) => { caveFloor(g,X,Y,x,y); R(g,X+1,Y+3,14,11,'#3E3A35'); R(g,X+2,Y+3,12,9,'#C2BCAE'); R(g,X+2,Y+3,12,2,'#D9D4C8'); R(g,X+3,Y+5,4,3,'#E8E3D8'); },
  stoneTable:(g,X,Y,x,y) => stoneTable(g,X,Y,x,y),
  stoneBowls:(g,X,Y,x,y) => { caveFloor(g,X,Y,x,y); R(g,X+1,Y+10,14,2,'#5E594F'); [[2,5],[9,5]].forEach(([a,c]) => { R(g,X+a,Y+c,5,5,'#3E3A35'); R(g,X+a+1,Y+c,3,4,'#D8D2C4'); R(g,X+a+1,Y+c,3,1,'#9C968A'); }); },
  tablet:    (g,X,Y,x,y) => { caveFloor(g,X,Y,x,y); R(g,X+3,Y+1,10,14,'#3E3A35'); R(g,X+4,Y+2,8,12,'#A9A598'); [3,6,9].forEach(r => R(g,X+7,Y+2+r,2,2,'#3E3A35')); },
  curtain:   (g,X,Y,x,y) => { R(g,X,Y,T,T,'#8FD0EE'); },   // the falling water is animated in js/draw.js

  water:     (g,X,Y,x,y) => waterBase(g,X,Y,x,y),   // ripples are animated in js/draw.js
  waterfall: (g,X,Y,x,y) => waterBase(g,X,Y,x,y),   // the falling water is animated in js/draw.js
  ironBridge:(g,X,Y,x,y) => {   // an iron bridge across a stream
    waterBase(g,X,Y,x,y);
    R(g,X+2,Y,12,T,'#5A616B'); for (let i = 0; i < 16; i += 3) R(g,X+2,Y+i,12,1,'#454B54');
    R(g,X+1,Y,1,T,'#2F3338'); R(g,X+14,Y,1,T,'#2F3338');
  },
  bridge:    (g,X,Y,x,y) => {
    waterBase(g,X,Y,x,y);
    for (let i = 0; i < 16; i += 4){ R(g,X+i,Y+1,3,14,(i/4) % 2 ? '#A0743F' : '#B98A55'); R(g,X+i+3,Y+1,1,14,'#6B4A2A'); }
    R(g,X,Y,T,2,'#6B4A2A'); R(g,X,Y+14,T,2,'#6B4A2A');
  }
};

/* ---- big objects: trees, the fruit trees, your stone, the rocks, the stall and the practice post ----
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
function tallPost(g, X, Y){   // the practice post, a square and a half tall
  const top = Y - 8;
  groundShadow(g, X+8, Y+15, 6, 1); R(g, X+6, top, 4, 23, WOOD[0]); R(g, X+7, top+1, 2, 22, WOOD[3]); dot(g, X+7, top+1, WOOD[4]);
  R(g, X+2, top+5, 12, 3, WOOD[0]); R(g, X+3, top+6, 10, 1, WOOD[3]);
  R(g, X+3, top+17, 10, 3, WOOD[0]); R(g, X+4, top+18, 8, 1, WOOD[2]);
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
  post: (g, o) => tallPost(g, o.x*T, o.y*T),
  stall: (g, o) => stall(g, o.x*T + 2, o.y*T, o.w*T - 4)
};
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
// The big objects in the place you're in, from its map: {look, x, y, w, h}, (x, y) being the top-left square they
// stand on. A block of the same tree letter two squares by two is one big tree; a row of rocks is one pile, and a row of
// stall letters one stall; anything
// else stands on its own square. They come from the top of the map down, the order they're drawn in.
function mapObjects(){
  const out = [], taken = new Set(), key = (x, y) => x + ',' + y;
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){
    const t = tileAt(x, y);
    if (!OBJECT_ART[t.look] || taken.has(key(x, y))) continue;
    const same = (a, c) => tileAt(a, c) === t && !taken.has(key(a, c));
    let w = 1, h = 1;
    if (t.look === 'tree' && same(x+1, y) && same(x, y+1) && same(x+1, y+1)){ w = 2; h = 2; }
    else if (ROW_OBJECTS.includes(t.look)) while (same(x+w, y)) w++;
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
function buildMap(){   // the place you're in: the ground, then the big objects' pictures
  if (mapCanvas.width !== COLS*T || mapCanvas.height !== ROWS*T){ mapCanvas.width = COLS*T; mapCanvas.height = ROWS*T; }   // a place of another size
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) LOOKS[tileAt(x, y).look](mg, x*T, y*T, x, y);
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
}
