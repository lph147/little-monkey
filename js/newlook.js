// The new look, on trial (decided 10 November 2026; DESIGN.md's Next steps; the switch is in js/data.js): places whose
// art is made ahead of time at double detail, 32 x 32 pixels a square, as picture files (content/art.js, made by
// npm run art), drawn from those pictures while the switch is on. Off, or till the pictures have loaded, or anywhere
// without them, a place is drawn exactly as it always was: nothing here is used.
//
// A place's ground (ART.grounds) is drawn from its picture, in place of the map's own ground layer (mapCanvas). The
// picture has only what never moves (its covers: grass, paths, water, cliffs, flowers, a bridge). What stands on the
// ground is drawn from one sheet (ART.things): the big objects (trees, your stone, the rocks) into their own layers, as
// ever, and what takes a single square of the ground (the sign, a boulder, the long grass's tufts) onto a layer of its
// own, thingCanvas. Anything with no picture yet keeps today's drawing, each pixel two by two; on the ground, cut out of
// its square to lie over the new ground (cutOutThings). So a place can be converted a thing at a time.
const HI_PICTURES = {};   // each picture file, once it has loaded
const hiFiles = () => NEW_LOOK && typeof ART !== 'undefined' ? [...Object.values(ART.grounds).map(a => a.file), ART.things.file] : [];   // (also the files to keep for playing offline, with the game's own: js/main.js)
const hiArt = () => {     // the art of the place you're in, if the switch is on and the pictures have loaded
  if (!NEW_LOOK || typeof ART === 'undefined') return null;
  const a = ART.grounds[AREA.number + ':' + PLACE];
  return a && HI_PICTURES[a.file] && HI_PICTURES[ART.things.file] ? a : null;
};
const hiScale = () => hiArt() ? ART.scale : 1;   // how many of the screen's pixels one of today's is, where you are
if (typeof Image !== 'undefined') for (const file of hiFiles()){
  const img = new Image();
  img.onload = () => { HI_PICTURES[file] = img; if (drawnFor && hiArt()) buildMap(); };   // (if you're there already: drawn again, from the pictures)
  img.src = file;
}

// Which picture on the sheet a thing is: a tree's, by its size and which of the three shapes it is (as OBJECT_ART.tree
// chooses, js/art.js); rocks, by how many squares wide; a boulder, cracked or not (as LOOKS.boulder).
const hiName = (look, o) => look === 'tree' ? (o.w === 2 ? 'treeBig' : 'tree') + (o.x*7 + o.y*3) % 3 : look === 'rocks' ? 'rocks' + o.w
  : look === 'boulder' ? ((o.x + o.y) % 2 === 0 ? 'boulderCracked' : 'boulder') : look;
// A thing from the sheet, onto a layer drawn on in today's pixels (js/art.js: sizeLayer), where it stands: its shadow
// first, unless it's the part that goes over the characters (shadows stay on the ground). False if it has no picture.
function drawHiThing(g, look, o, over){
  const name = hiName(look, o), t = ART.things.where[name]; if (!t) return false;
  const pic = HI_PICTURES[ART.things.file], s = ART.scale;
  const put = ([sx, sy, w, h, ax, ay]) => g.drawImage(pic, sx, sy, w, h, o.x*T - ax/s, o.y*T - ay/s, w/s, h/s);
  const shade = ART.things.where[name + 'Shadow']; if (shade && !over) put(shade);
  put(t);
  return true;
}
const drawHiObject = (g, p, over) => !!hiArt() && drawHiThing(g, p.look, p, over);   // a big object (drawObject, js/art.js)

// What takes a square of the ground, onto thingCanvas: from the sheet, or, with no picture yet, cut out of today's
// square: the square is drawn as it is, and as each kind of bare ground; the ground most like it is what it stands on,
// and wherever the two are the same, that's ground, taken out. What's left is the thing alone. Done as a place is drawn
// and whenever its squares change (afterDrawing, js/art.js).
const thingCanvas = document.createElement('canvas');
function cutOutThings(){
  const art = hiArt(); if (!art) return;
  const tg = sizeLayer(thingCanvas, COLS*T, ROWS*T);   // (which empties it)
  const one = memCanvas(T, T), bare = memCanvas(T, T), og = memContext(one), bg = memContext(bare);
  const drawn = (g, f, x, y) => { g.clearRect(0, 0, T, T); g.save(); g.translate(-x*T, -y*T); f(g, x*T, y*T, x, y); g.restore(); return g.getImageData(0, 0, T, T); };
  const same = (p, q, i) => p[i] === q[i] && p[i+1] === q[i+1] && p[i+2] === q[i+2] && p[i+3] === q[i+3];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){
    const look = tileAt(x, y).look;
    if (art.covers.includes(look) || OBJECT_ART[look] || !LOOKS[look] || drawHiThing(tg, look, {x, y, w:1, h:1}, false)) continue;
    const a = drawn(og, LOOKS[look], x, y);
    let ground = null, most = -1;
    for (const f of Object.values(GROUNDS)){
      const d = drawn(bg, f, x, y).data; let n = 0;
      for (let i = 0; i < d.length; i += 4) if (same(a.data, d, i)) n++;
      if (n > most){ most = n; ground = d; }
    }
    for (let i = 0; i < a.data.length; i += 4) if (same(a.data, ground, i)) a.data[i+3] = 0;
    og.putImageData(a, 0, 0); tg.drawImage(one, x*T, y*T);
  }
}
// The ground of the place you're in, from its picture, then what lies on it: true if it's drawn (drawWorld, js/draw.js,
// draws the map's own ground otherwise). A pixel of the picture is a pixel of the screen.
function drawHiGround(cx, cy){
  const art = hiArt(); if (!art) return false;
  const x = Math.max(0, cx), y = Math.max(0, cy), w = Math.min(COLS*T, cx + VW*T) - x, h = Math.min(ROWS*T, cy + VH*T) - y, s = ART.scale;
  if (w > 0 && h > 0) b.drawImage(HI_PICTURES[art.file], x*s, y*s, w*s, h*s, x - cx, y - cy, w, h);
  drawLayer(thingCanvas, cx, cy);
  return true;
}
// A monkey, at double detail: today's own drawing, never another. Its letter grid (monkeyRows, js/art.js: the same rows,
// with its headband, clothes, beard and whatever it holds) is made twice as big each way, every pixel four, and then only
// tidied: a corner between two pixels that agree becomes theirs, so a staircase turns into a slope (the rule known as
// Scale2x); its fur, coat and hair are lit a little along the top and left and shaded along the bottom and right; its
// skin is shaded the same way; and each eye gets a glint. The same size, the same shape, the same colours: just finer.
// (A first try, 10 November 2026, redrew the monkeys from the 猴子 word picture, 32 by 40: the owner found them too far
// from the game's look, and too big, a fifth taller.)
const LIT = new Set(['f', 'C', 'D', 'c', 'h', 'n']);   // what's lit and shaded: fur, a coat, clothes, hair
function refineRows(rows){
  const at = (x, y) => (rows[y] || [])[x] || '.', out = [];
  for (let y = 0; y < rows.length; y++){
    const top = [], low = [];
    for (let x = 0; x < rows[y].length; x++){
      const p = at(x, y), a = at(x, y - 1), r = at(x + 1, y), l = at(x - 1, y), d = at(x, y + 1);
      top.push(l === a && l !== d && a !== r ? a : p, a === r && a !== l && r !== d ? r : p);
      low.push(d === l && d !== r && l !== a ? l : p, r === d && r !== a && d !== l ? d : p);
    }
    out.push(top, low);
  }
  return out;
}
function hiSprite(rows, pal){   // rows: strings of letters; pal: each letter's colour. A canvas twice as big each way (hi: 2).
  const grid = refineRows(rows.map(r => [...r])), c = document.createElement('canvas'); c.width = grid[0].length; c.height = grid.length; c.hi = 2;
  const g = c.getContext('2d'), at = (x, y) => (grid[y] || [])[x] || '.', open = ch => ch === 'o' || ch === '.';
  grid.forEach((row, y) => row.forEach((ch, x) => {
    let col = pal[ch]; if (!col) return;
    const shade = open(at(x + 1, y)) || open(at(x, y + 1)), light = open(at(x - 1, y)) || open(at(x, y - 1));
    if (LIT.has(ch)) col = shade ? mix(col, '#000000', .2) : light ? mix(col, '#FFFFFF', .3) : col;
    else if (ch === 's' && shade) col = mix(col, '#000000', .1);
    else if (ch === 'e' && at(x - 1, y) !== 'e' && at(x, y - 1) !== 'e') col = mix(col, '#FFFFFF', .75);   // the glint in its eye
    R(g, x, y, 1, 1, col);
  }));
  return c;
}
function hiMonkeySprite(kind, dir, blink, step){   // as monkeySprite (js/art.js), from the same rows and colours, kept the same way
  const stick = heldBy(kind), band = kind === 'player' ? headband() : null, worn = kind === 'player' ? CLOTHES_ON.filter(c => wearing(c)).join('') : '';
  const k = 'hi:' + kind + dir + (blink ? 'b' : '') + step + (stick || '') + (band || '') + worn;
  if (spriteCache[k]) return spriteCache[k];
  const pal = {...(band ? {...PALS[kind], b: band} : PALS[kind]), ...(worn ? CLOTHES_PAL : {})};
  return spriteCache[k] = hiSprite(monkeyRows(kind, dir, blink, step), stick ? {...pal, ...HELD[stick].pal} : pal);
}
// A monkey standing or walking, in a place drawn at double detail: true if it's drawn (drawEntityMonkey, js/draw.js,
// draws today's otherwise: a little one, and a person). Where it always was, the size it always was, on its old shadow.
function drawHiMonkey(kind, X, Y, dir, blink, bob, step){
  if (!hiArt() || SMALL.has(kind) || PEOPLE.has(kind) || !PALS[kind]) return false;
  R(b, X+4, Y+15, 8, 1, 'rgba(0,0,0,.22)'); R(b, X+3, Y+14, 10, 1, 'rgba(0,0,0,.12)');
  b.drawImage(hiMonkeySprite(kind, dir, blink, step), X, Y - bob, T, T);
  return true;
}
// The same, whole, brought down to today's size, for the picture of a place the map keeps (drawPlaceNow, js/map.js).
function hiPlaceNow(g){
  const art = hiArt(); if (!art) return false;
  g.drawImage(HI_PICTURES[art.file], 0, 0, COLS*T, ROWS*T); g.drawImage(thingCanvas, 0, 0, COLS*T, ROWS*T);
  return true;
}
