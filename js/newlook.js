// The new look, on trial (decided 10 November 2026; DESIGN.md's Next steps; the switch is in js/data.js): places whose
// art is made ahead of time at double detail, 32 x 32 pixels a square, as picture files (content/art.js, made by
// npm run art), drawn from those pictures while the switch is on. Off, or till a picture has loaded, or anywhere without
// one, a place is drawn exactly as it always was: nothing here is used.
//
// So far: a place's ground (ART.grounds), drawn from its picture in place of the map's own ground layer (mapCanvas).
// The picture has only what never moves and what the tools have drawn (its covers: grass, paths, water, cliffs, flowers,
// a bridge). Anything else that lies on the ground there, such as the sign, a boulder or the long grass's tufts, keeps
// today's drawing, cut out of its square to lie over the new ground (cutOutThings): so a place can be converted a thing
// at a time. Trees and the other big objects are drawn over it from their own layers, as ever.
const HI_PICTURES = {};   // each picture file, once it has loaded
const hiArt = () => {     // the art of the place you're in, if the switch is on and its picture has loaded
  if (!NEW_LOOK || typeof ART === 'undefined') return null;
  const a = ART.grounds[AREA.number + ':' + PLACE];
  return a && HI_PICTURES[a.file] ? a : null;
};
if (NEW_LOOK && typeof ART !== 'undefined' && typeof Image !== 'undefined') for (const a of Object.values(ART.grounds)){
  const img = new Image();
  img.onload = () => { HI_PICTURES[a.file] = img; if (drawnFor && hiArt()) cutOutThings(); };   // (if you're there already: its things cut out now)
  img.src = a.file;
}
// The files to keep for playing offline, with the game's own (js/main.js): only while the switch is on.
const hiFiles = () => NEW_LOOK && typeof ART !== 'undefined' ? Object.values(ART.grounds).map(a => a.file) : [];

// What lies on the ground and hasn't been drawn at double detail yet, cut out of today's squares onto a layer of its
// own, thingCanvas, in today's pixels: each such square is drawn as it is, and as each kind of bare ground; the ground
// most like it is what it stands on, and wherever the two are the same, that's ground, taken out. What's left is the
// thing alone. Done as a place is drawn and whenever its squares change (afterDrawing, js/art.js).
const thingCanvas = document.createElement('canvas');
function cutOutThings(){
  const art = hiArt(); if (!art) return;
  thingCanvas.width = COLS*T; thingCanvas.height = ROWS*T;   // (which empties it)
  const tg = thingCanvas.getContext('2d'), one = memCanvas(T, T), bare = memCanvas(T, T), og = memContext(one), bg = memContext(bare);
  const drawn = (g, f, x, y) => { g.clearRect(0, 0, T, T); g.save(); g.translate(-x*T, -y*T); f(g, x*T, y*T, x, y); g.restore(); return g.getImageData(0, 0, T, T); };
  const same = (p, q, i) => p[i] === q[i] && p[i+1] === q[i+1] && p[i+2] === q[i+2] && p[i+3] === q[i+3];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++){
    const look = tileAt(x, y).look;
    if (art.covers.includes(look) || OBJECT_ART[look] || !LOOKS[look]) continue;
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
// The ground of the place you're in, from its picture, then the things cut out of today's: true if it's drawn (drawWorld,
// js/draw.js, draws the map's own ground otherwise). A pixel of the picture is a pixel of the screen.
function drawHiGround(cx, cy){
  const art = hiArt(); if (!art) return false;
  const x = Math.max(0, cx), y = Math.max(0, cy), w = Math.min(COLS*T, cx + VW*T) - x, h = Math.min(ROWS*T, cy + VH*T) - y, s = ART.scale;
  if (w > 0 && h > 0) b.drawImage(HI_PICTURES[art.file], x*s, y*s, w*s, h*s, x - cx, y - cy, w, h);
  drawLayer(thingCanvas, cx, cy);
  return true;
}
