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
const TREE = ["....oooooooo....","..oolllhhhlloo..",".olllhhhhlllldo.","olllhhhllllllddo","ollhhllllllllddo","ollllllllllldddo","odlllllllllddddo","oddllllllldddddo",".oddddlldddddo..","..oodddddddoo...","....ooottooo....","......otko......","......otko......","......otko......",".....ootkoo.....","................"];
const TREE_PAL = {o:'#1F4D2A',d:'#2F7A3E',l:'#3F9A4C',h:'#6CC066',t:'#8A5A32',k:'#5E3B1F',p:'#F7A08F',q:'#D9665B',r:'#FFE0CF'};
const PEACH_TREE = TREE.map(r => [...r]);
const APPLE_TREE = TREE.map(r => [...r]);
[[3,3],[9,2],[11,5],[6,6],[7,3]].forEach(([x,y]) => { APPLE_TREE[y][x] = 'a'; APPLE_TREE[y][x+1] = 'a'; APPLE_TREE[y+1][x] = 'A'; APPLE_TREE[y+1][x+1] = 'A'; });
TREE_PAL.a = '#E8343C'; TREE_PAL.A = '#A8161E';
[[4,3],[10,2],[11,6],[5,6],[8,4]].forEach(([x,y]) => { PEACH_TREE[y][x] = 'r'; PEACH_TREE[y][x+1] = 'p'; PEACH_TREE[y+1][x] = 'p'; PEACH_TREE[y+1][x+1] = 'q'; });
const ROCK = ["................","................",".....ooooo......","...oolllmmoo....","..ollllmmmmdo...",".olllmmmmmmddo..",".ollmmmmmmmddo..","olmmmmmmmmmdddo.","ommmmmmmmmddddo.","ommmmmmmmdddddo.",".ommmmmmdddddo..","..ooddddddddo...","....oooooooo....","................","................","................"];
const ROCK_PAL = {o:'#4A463F',l:'#D6D2C5',m:'#A9A598',d:'#7C786D',k:'#3A352E',g:'#FFE27A'};
const CRACK = [[8,3],[8,4],[7,5],[8,6],[9,7],[8,8],[7,9],[8,10],[9,5],[10,4],[6,7],[5,8],[10,8],[11,9]];
const STONE = ROCK.map(r => [...r]); CRACK.forEach(([x,y]) => { if (STONE[y][x] !== '.') STONE[y][x] = 'k'; });
const SIGN = ["................","................","................","..oooooooooooo..","..owwwwwwwwwwo..","..owWWWwwWWWwo..","..owwwwwwwwwwo..","..owWWwwWWWwwo..","..oooooooooooo..","......oWWo......","......oWWo......","......oWWo......","......oWWo......",".....oooooo.....","................","................"];
const POST = ["......oooo......",".....owwwwo.....",".....owWWwo.....","..ooooowwooooo..","..owwwwwwwwwwo..","..ooooowwooooo..",".....owWWwo.....",".....owwwwo.....","...ooowWWwooo...","...owwwwwwwwo...","...ooowwwwooo...",".....owWWwo.....",".....owwwwo.....",".....owWWwo.....","....oooooooo....","................"];   // a wooden practice post
const STALL = ["rwrwrwrwrwrwrwrw","rwrwrwrwrwrwrwrw","oooooooooooooooo",".k............k.",".k............k.",".k............k.",".k............k.",".k..pq...aA...k.",".kooooooooooooook",".kwwwwwwwwwwwwwk",".kWWWWWWWWWWWWWk",".kwwwwwwwwwwwwwk",".kWWWWWWWWWWWWWk",".kooooooooooooook",".k............k.","................"];   // a market stall with a striped awning
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
  return spriteCache[k] = sprite(out, PALS[kind]);
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
  tree: sprite(TREE, TREE_PAL), peach: sprite(PEACH_TREE.map(r => r.join('')), TREE_PAL), apple: sprite(APPLE_TREE.map(r => r.join('')), TREE_PAL),
  rock: sprite(ROCK, ROCK_PAL), stone: sprite(STONE.map(r => r.join('')), ROCK_PAL),
  sign: sprite(SIGN, {o:'#4A2C17',w:'#D2A46A',W:'#9E6F3C'}),
  post: sprite(POST, {o:'#4A2C17',w:'#B98A55',W:'#8A5A32'}),
  stall: sprite(STALL, {r:'#C0392B',w:'#F4F1EA',o:'#4A2C17',k:'#6B4A2A',W:'#8A5A32',p:'#F7A08F',q:'#D9665B',a:'#E8343C',A:'#A8161E'}),
  bird: sprite(BIRD, {o:'#2B3F66',b:'#5AA0E6',w:'#9CCBF5',e:'#111111',y:'#F2A33A'})
};

/* ---- terrain tiles, pre-rendered once into a map canvas ---- */
const mapCanvas = document.createElement('canvas'); mapCanvas.width = COLS*T; mapCanvas.height = ROWS*T;
const mg = mapCanvas.getContext('2d');
const GRASSY = ['grass','tallGrass','flowers','tree','peachTree','appleTree','stone','sign','post','stall'];   // looks with grass underneath
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
  tree:      (g,X,Y,x,y) => { grass(g,X,Y,x,y); R(g,X+3,Y+14,10,2,'#5DA651'); g.drawImage(SPR.tree,X,Y); },
  peachTree: (g,X,Y,x,y) => { grass(g,X,Y,x,y); R(g,X+3,Y+14,10,2,'#5DA651'); g.drawImage(SPR.peach,X,Y); },
  appleTree: (g,X,Y,x,y) => { grass(g,X,Y,x,y); R(g,X+3,Y+14,10,2,'#5DA651'); g.drawImage(SPR.apple,X,Y); },
  rocks:     (g,X,Y,x,y) => { path(g,X,Y,x,y); g.drawImage(SPR.rock,X,Y+2); },
  stone:     (g,X,Y,x,y) => { grass(g,X,Y,x,y); R(g,X+2,Y+13,12,2,'#5DA651'); g.drawImage(SPR.stone,X,Y+1); },
  sign:      (g,X,Y,x,y) => { grass(g,X,Y,x,y); g.drawImage(SPR.sign,X,Y); },
  stall:     (g,X,Y,x,y) => { grass(g,X,Y,x,y); g.drawImage(SPR.stall,X,Y); },
  post:      (g,X,Y,x,y) => { grass(g,X,Y,x,y); R(g,X+4,Y+14,8,2,'#5DA651'); g.drawImage(SPR.post,X,Y); },
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
function buildMap(){   // the place you're in
  if (mapCanvas.width !== COLS*T || mapCanvas.height !== ROWS*T){ mapCanvas.width = COLS*T; mapCanvas.height = ROWS*T; }   // a place of another size
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) LOOKS[tileAt(x, y).look](mg, x*T, y*T, x, y);
}
