// The map (地图; decided 31 October 2026, from mockups): MAP opens it once you have it (the area's areaMap: has). It's the
// whole area on one screen, drawn on paper: each place you've been as a little picture of it, roughly where it lies on
// the mountain (the place's onMap, in the area file), joined by dotted paths, and a ? on a way that's open but leads
// somewhere you haven't been yet, so it never gives away what's there. It opens on the place you're in, with your pin
// over it; the D-pad (or a tap) chooses another, and the box in the corner says which.
// A place's little picture is one pixel a square, each the colour of what's there, worked out once from the game's own
// pictures (lookColour), so the map opens at once: drawing a place's whole map takes up to two seconds on a phone.

const MAP_W = 240, MAP_H = 160;   // the map's size, in pixels, as the screen is
const MAP_PAPER = '#EEDFB6', MAP_PAPER2 = '#E5D3A3', MAP_EDGE = '#CDB27A', MAP_INK = '#5A4126', MAP_SHADOW = '#C9B07A';
const hasMap = () => !!AREA.areaMap && matches(AREA.areaMap.has);
const placesBeen = () => (here().visited || []).filter(id => PLACES[id] && PLACES[id].onMap);
// Where a place's little picture goes on the map: [x, y, w, h], its top-left corner and its size.
function onMapAt(id){
  const p = PLACES[id], [cx, cy, w0, h0] = p.onMap, small = p.map[0].length * p.map.length < 300;
  const w = w0 || (small ? 16 : 24), h = h0 || (small ? 12 : 17);
  return [Math.round(cx - w / 2), Math.round(cy - h / 2), w, h];
}
// The paths to draw between places you've been (lines, each pair once), and the open ways from them to places you
// haven't (ends), each [from, to]. A way that's shut, or isn't there yet, isn't drawn at all.
function mapPaths(been = placesBeen()){
  const lines = [], ends = [], has = (list, a, b) => list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  for (const a of been) for (const e of PLACES[a].exits || []){
    const b = e.to;
    if (!PLACES[b] || !PLACES[b].onMap || has(lines, a, b) || has(ends, a, b)) continue;
    if (been.includes(b)) lines.push([a, b]);
    else if (isOpen(e)) ends.push([a, b]);
  }
  return {lines, ends};
}
// What each look is like from far off: the average colour of its square (and the one above, where a tree's leaves are),
// drawn once by the game's own pictures. [red, green, blue].
const LOOK_COLOUR = {};
function lookColour(look){
  if (LOOK_COLOUR[look]) return LOOK_COLOUR[look];
  const c = document.createElement('canvas'); c.width = 3*T; c.height = 3*T;
  const g = c.getContext('2d');
  let rgb = [124, 196, 107];   // (grass, if it can't be drawn here)
  try {
    if (OBJECT_ART[look]){ if (LOOKS.grass) LOOKS.grass(g, T, 2*T, 1, 2); OBJECT_ART[look](g, {look, x:1, y:2, w:1, h:1}); }
    else if (LOOKS[look]) LOOKS[look](g, T, 2*T, 1, 2);
    const d = g.getImageData(T, T, T, 2*T).data;
    let r = 0, gr = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128){ r += d[i]; gr += d[i + 1]; b += d[i + 2]; n++; }
    if (n) rgb = [r, gr, b].map(v => Math.round(v / n));
  } catch (e){ /* a look that needs more than a square to draw: grass will do */ }
  return LOOK_COLOUR[look] = rgb;
}
// A place as it is now (rocks that have rolled away, and so on), one pixel a square.
function placePicture(id){
  const map = PLACES[id].map, legend = PLACES[id].legend ? {...AREA.legend, ...PLACES[id].legend} : AREA.legend;
  const c = document.createElement('canvas'); c.width = map[0].length; c.height = map.length;
  const g = c.getContext('2d'), img = g.createImageData(c.width, c.height);
  map.forEach((row, y) => [...row].forEach((ch, x) => {
    let t = legend[ch] || {};
    if (t.becomes){ const to = becomesNow(t); if (to && legend[to]) t = legend[to]; }
    const [r, gr, b] = lookColour(t.look), i = (y * c.width + x) * 4;
    img.data[i] = r; img.data[i + 1] = gr; img.data[i + 2] = b; img.data[i + 3] = 255;
  }));
  g.putImageData(img, 0, 0);
  return c;
}
// The paper, with a few fibres, and its edges (g: a MAP_W x MAP_H canvas's).
function drawPaper(g){
  const img = g.createImageData(MAP_W, MAP_H);
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++){
    const col = x < 2 || x > MAP_W - 3 ? MAP_EDGE : rnd(x, y, 2) < .1 ? MAP_PAPER2 : MAP_PAPER, i = (y * MAP_W + x) * 4;
    img.data[i] = parseInt(col.slice(1, 3), 16); img.data[i + 1] = parseInt(col.slice(3, 5), 16); img.data[i + 2] = parseInt(col.slice(5, 7), 16); img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
}
// Draws the map into canvas c (MAP_W x MAP_H): the paper, the paths, the places you've been and your pin.
function drawMap(c){
  const g = c.getContext && c.getContext('2d'); if (!g) return;
  const dot = (x, y, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  drawPaper(g);
  const been = placesBeen(), {lines, ends} = mapPaths(been), mid = id => PLACES[id].onMap;
  const dotted = (a, b, part = 1) => {   // a dotted line between two places' middles (part of the way)
    const [ax, ay] = mid(a), [bx, by] = mid(b), n = Math.hypot(bx - ax, by - ay);
    for (let s = 0; s <= n * part; s += 3){ const x = ax + (bx - ax) * s / n, y = ay + (by - ay) * s / n; dot(x, y, MAP_INK); dot(x + 1, y, MAP_INK); }
  };
  lines.forEach(([a, b]) => dotted(a, b));
  const Q = ['.oo.', 'o..o', '...o', '..o.', '.o..', '....', '.o..'];   // a ? where a way leads on
  for (const [a, b] of ends){
    dotted(a, b, .5);
    const [ax, ay] = mid(a), [bx, by] = mid(b), qx = Math.round(ax + (bx - ax) * .62) - 2, qy = Math.round(ay + (by - ay) * .62) - 4;
    g.fillStyle = MAP_PAPER; g.fillRect(qx - 1, qy - 1, 6, 9);
    Q.forEach((row, ry) => [...row].forEach((ch, rx) => { if (ch === 'o') dot(qx + rx, qy + ry, MAP_INK); }));
  }
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  for (const id of been){   // each place, cut to its frame from the middle, with a shadow under it
    const [x, y, w, h] = onMapAt(id), pic = placePicture(id), s = Math.max(w / pic.width, h / pic.height), sw = w / s, sh = h / s;
    g.fillStyle = MAP_SHADOW; g.fillRect(x - 1, y, w + 2, h + 2);
    g.fillStyle = MAP_INK; g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.drawImage(pic, (pic.width - sw) / 2, (pic.height - sh) / 2, sw, sh, x, y, w, h);
  }
  if (been.includes(PLACE)){   // your pin, over the place you're in
    const [x, y, w] = onMapAt(PLACE), PIN = ['.ooo.', 'orrro', 'orwro', 'orrro', '.ooo.', '..o..'], cols = {o:'#2A1A10', r:'#E0443C', w:'#FFFFFF'};
    PIN.forEach((row, ry) => [...row].forEach((ch, rx) => { if (ch !== '.'){ g.fillStyle = cols[ch]; g.fillRect(x + Math.round(w / 2) - 5 + rx * 2, y - 8 + ry * 2, 2, 2); } }));
  }
}
const PIN_SVG = '<svg class="mappin" viewBox="0 0 10 12" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="#E0443C" stroke="#2A1A10" stroke-width="1"/><circle cx="5" cy="5" r="1.4" fill="#FFFFFF"/><path d="M5 9v3" stroke="#2A1A10" stroke-width="1.4"/></svg>';
// The map's page. chosen: the place it opens on (the one you're in), or the one you've just looked at closely.
function openMap(chosen = PLACE){
  const been = placesBeen(), pct = (v, of) => `${(v / of * 100).toFixed(2)}%`;
  if (!been.includes(chosen)) chosen = been[0];
  openCard(`<div class="mapview"><div class="maparea">
      <canvas class="mapart" width="${MAP_W}" height="${MAP_H}" aria-hidden="true"></canvas>
      <p class="maptitle">地图 <span class="mappy">dìtú</span> · Map <span class="mappy">${AREA.name.zh} ${AREA.name.py}</span></p>
      <div class="mapplaces" data-nav>${been.map(id => { const [x, y, w, h] = onMapAt(id);
        return `<button class="mapplace" data-place="${id}" data-label="Look" aria-label="${esc(PLACES[id].name.en)}" style="left:${pct(x, MAP_W)};top:${pct(y, MAP_H)};width:${pct(w, MAP_W)};height:${pct(h, MAP_H)}"></button>`; }).join('')}</div>
      <div class="mapbox"><div class="mapname"></div><div class="actions"><button class="btn" data-a="back" data-b>Back</button></div></div>
    </div></div>`);
  drawMap(sheet.querySelector('.mapart'));
  const show = id => {   // the chosen place's name in the corner (a name: Chinese, pinyin and English together)
    const n = PLACES[id].name, box = sheet.querySelector('.mapname');
    if (!box) return;   // (gone: a close-up, or the map closed)
    box.innerHTML = `<div><span class="mapzh">${n.zh}</span> <span class="mappy">${n.py}</span></div>
      <div class="mapen">${esc(n.en)}</div>${id === PLACE ? `<div class="maphere">${PIN_SVG}You are here</div>` : ''}`;
  };
  sheet.querySelectorAll('.mapplace').forEach(b => { b.onclick = () => closeUp(b.dataset.place); });   // (A, or a tap: a closer look)
  // The D-pad moves the gold outline (navsel, js/cards.js) from place to place: the box follows it (not the keyboard's
  // focus, which an iPhone drops).
  const places = sheet.querySelector('.mapplaces');
  if (typeof MutationObserver === 'function') new MutationObserver(() => { const b = places.querySelector('.navsel'); if (b) show(b.dataset.place); })
    .observe(places, {subtree:true, attributes:true, attributeFilter:['class']});
  on('[data-a=back]', () => closeCard());
  const start = sheet.querySelector(`.mapplace[data-place="${chosen}"]`);
  if (start){ markNav(start); start.focus({preventScroll:true}); }
  show(chosen);
}

/* ---- a place's close-up: A on it, on the map ---- */
// The game's own picture of the place, shrunk to fit, as you last saw it, with the words you know from there as stickers
// to tap and hear. Drawing a place takes too long to do as you look (up to two seconds on a phone), so its picture is
// kept as you leave it (keepPicture), for each game, in the browser's IndexedDB (a store for files: there's no room for
// pictures where the game is saved). A place whose picture isn't kept, such as one you'd been to before the map could
// keep pictures, is shown one dot a square, as on the map, till you next go there.
// The room for the picture on the paper: x, y, width, height (of MAP_W x MAP_H); less on a small phone's screen
// (data-screen, set by fit() in js/main.js), so the words beside it have room.
const CLOSE = [8, 22, 140, 130], CLOSE_SMALL = [6, 22, 112, 130];
// The words you know that you found in a place: the words of what's there (its squares, as they are now, the wild
// creatures in its long grass and the fish in its water), the animals that live there and the characters there who are
// a word, such as the cow. In the order you'd come across them, each once.
function placeWords(id){
  const p = PLACES[id], legend = p.legend ? {...AREA.legend, ...p.legend} : AREA.legend, found = [];
  const add = w => { if (w && WORDS[w] && lvl(w) > 0 && !found.includes(w)) found.push(w); };
  for (const ch of new Set(p.map.join(''))){
    let t = legend[ch]; if (!t) continue;
    if (t.becomes){ const to = becomesNow(t); if (to && legend[to]) t = legend[to]; }
    add(t.word);
    for (const e of t.wild || []) add((AREA.enemies[e] || {}).word);
    if (t.fishing && AREA.fishing) for (const k of t.fishing === true ? ['small', 'big'] : [t.fishing]) add((AREA.fishing[k] || {pic:''}).pic.split(' ').pop());
  }
  for (const a of ANIMALS) if (a.place === id && inChapter(a)) add(a.hz);
  for (const n of ALL_NPCS) if (n.place === id) add(n.look);
  return found;
}
// The place you're in, as it's drawn now: its ground and big objects, and its shade if it's gloomy, with no one on it.
function drawPlaceNow(){
  const c = document.createElement('canvas'); c.width = COLS*T; c.height = ROWS*T;
  const g = c.getContext && c.getContext('2d'); if (!g || !drawnFor || drawnFor.place !== PLACE) return null;
  g.drawImage(mapCanvas, 0, 0); g.drawImage(baseCanvas, 0, 0);
  for (const p of OBJECT_PIECES) if (p.base) g.drawImage(p.base, p.x0, p.y0);
  g.drawImage(topCanvas, 0, 0);
  for (const p of OBJECT_PIECES) if (p.top) g.drawImage(p.top, p.x0, p.y0);
  if (GLOOM){ g.imageSmoothingEnabled = true; g.drawImage(gloomCanvas, 0, 0, COLS, ROWS, 0, 0, COLS*T, ROWS*T); g.globalAlpha = .85; g.drawImage(beamCanvas, 0, 0); g.globalAlpha = 1; }
  return c;
}
// The kept pictures: in IndexedDB, each place's under its game's name and the place's (pictureKey), and this time round
// in KEPT too. keptAs: what each looked like when it was kept, so it's only kept again once it has changed.
const KEPT = {}, keptAs = {};
const pictureKey = (id, n = SLOT) => `${slotKey(n)}/${id}`;
let pictureStore = null;
function pictures(){   // the store, opened once (a promise of it, which fails where there's none)
  return pictureStore || (pictureStore = new Promise((ok, no) => {
    if (typeof indexedDB === 'undefined') return no(new Error('no IndexedDB'));
    const r = indexedDB.open('xiaohouzi-map', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('pictures');
    r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error);
  }));
}
function keepPicture(){   // the place you're in, as you leave it
  const key = pictureKey(PLACE), as = drawnFor && drawnFor.place === PLACE ? `${paintNow()}|${tilesNow().flat().map(t => t.look).join()}` : null;
  if (!as || keptAs[key] === as) return;
  const c = drawPlaceNow(); if (!c || !c.toBlob) return;
  keptAs[key] = as;
  c.toBlob(blob => {
    if (!blob) return;
    KEPT[key] = blob;
    pictures().then(db => db.transaction('pictures', 'readwrite').objectStore('pictures').put(blob, key)).catch(() => {});
  });
}
function keptPicture(id){   // a promise of a place's kept picture (a blob), or null
  const key = pictureKey(id);
  if (KEPT[key]) return Promise.resolve(KEPT[key]);
  return pictures().then(db => new Promise(ok => {
    const r = db.transaction('pictures').objectStore('pictures').get(key);
    r.onsuccess = () => ok(KEPT[key] = r.result || null); r.onerror = () => ok(null);
  })).catch(() => null);
}
function forgetPictures(n){   // game n's pictures, as it's deleted, or a new game or a loaded one starts there
  const from = pictureKey('', n);
  for (const k in KEPT) if (k.startsWith(from)) delete KEPT[k];
  for (const k in keptAs) if (k.startsWith(from)) delete keptAs[k];
  pictures().then(db => db.transaction('pictures', 'readwrite').objectStore('pictures').delete(IDBKeyRange.bound(from, from + '￿'))).catch(() => {});
}
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'play') keepPicture(); });   // (in case the game is closed here)
// The close-up's page: the place's picture, its name, and the words you found there. Back goes back to the map.
function closeUp(id){
  const n = PLACES[id].name, words = placeWords(id), pct = (v, of) => `${(v / of * 100).toFixed(2)}%`;
  const cols = PLACES[id].map[0].length, rows = PLACES[id].map.length, [bx, by, bw, bh] = ['small', 'tiny'].includes(((document.documentElement || {}).dataset || {}).screen) ? CLOSE_SMALL : CLOSE, s = Math.min(bw / cols, bh / rows);
  const w = cols * s, h = rows * s, x = bx + (bw - w) / 2, y = by + (bh - h) / 2;
  openCard(`<div class="mapview closeup"><div class="maparea">
      <canvas class="mapart" width="${MAP_W}" height="${MAP_H}" aria-hidden="true"></canvas>
      <div class="closepic" style="left:${pct(x, MAP_W)};top:${pct(y, MAP_H)};width:${pct(w, MAP_W)};height:${pct(h, MAP_H)}" aria-hidden="true"></div>
      <p class="maptitle closename"><span class="mapzh">${n.zh}</span> <span class="mappy">${n.py}</span> <span class="mapen">${esc(n.en)}</span>${id === PLACE ? `<span class="maphere">${PIN_SVG}You are here</span>` : ''}</p>
      <div class="mapwords"><div class="gloss">${words.length ? 'Found here: tap a word to hear it.' : 'No words found here yet.'}</div>
        <div class="stickers" data-nav>${words.map(w => `<button class="sticker" data-w="${w}" data-label="Hear">${WORDS[w].pic ? `<span class="c" aria-hidden="true">${picHTML(w)}</span>` : ''}<span class="hz">${w}</span>${S.pinyin ? `<span class="p">${WORDS[w].py}</span>` : ''}</button>`).join('')}</div></div>
      <div class="mapback actions"><button class="btn" data-a="back" data-b>Back</button></div>
    </div></div>`);
  const paper = sheet.querySelector('.mapart'), g = paper.getContext && paper.getContext('2d');
  if (g) drawPaper(g);
  const frame = sheet.querySelector('.closepic'), put = (pic, blocky) => {   // the picture, into its frame
    if (!frame.isConnected) return;
    pic.classList.add('closeart'); if (blocky) pic.classList.add('blocky');
    frame.replaceChildren(pic);
  };
  const now = id === PLACE && drawPlaceNow();
  if (now) put(now);
  else if (g){
    put(placePicture(id), true);   // (one dot a square, while its picture comes, or if it isn't kept)
    keptPicture(id).then(blob => {
      if (!blob) return;
      const img = new Image(), url = URL.createObjectURL(blob);
      img.onload = () => { put(img); URL.revokeObjectURL(url); }; img.onerror = () => URL.revokeObjectURL(url);
      img.alt = ''; img.src = url;
    });
  }
  sheet.querySelectorAll('.sticker').forEach(b => { b.onclick = () => {   // tapped: you hear it, with what it means
    const w = b.dataset.w; markNav(b); say(w);
    sheet.querySelector('.gloss').innerHTML = `<b>${w}</b> ${WORDS[w].py} · ${esc(WORDS[w].en)}`;
  }; });
  on('[data-a=back]', () => openMap(id));
  const first = sheet.querySelector('.sticker') || sheet.querySelector('[data-a=back]');
  markNav(first); first.focus({preventScroll:true});
}
