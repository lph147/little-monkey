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
// Draws the map into canvas c (MAP_W x MAP_H): the paper, the paths, the places you've been and your pin.
function drawMap(c){
  const g = c.getContext && c.getContext('2d'); if (!g) return;
  const dot = (x, y, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  const img = g.createImageData(MAP_W, MAP_H);   // the paper, with a few fibres, and its edges
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++){
    const col = x < 2 || x > MAP_W - 3 ? MAP_EDGE : rnd(x, y, 2) < .1 ? MAP_PAPER2 : MAP_PAPER, i = (y * MAP_W + x) * 4;
    img.data[i] = parseInt(col.slice(1, 3), 16); img.data[i + 1] = parseInt(col.slice(3, 5), 16); img.data[i + 2] = parseInt(col.slice(5, 7), 16); img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
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
// The map's page. chosen: the place it opens on (the one you're in).
function openMap(chosen = PLACE){
  const been = placesBeen(), pct = (v, of) => `${(v / of * 100).toFixed(2)}%`;
  if (!been.includes(chosen)) chosen = been[0];
  openCard(`<div class="mapview"><div class="maparea">
      <canvas class="mapart" width="${MAP_W}" height="${MAP_H}" aria-hidden="true"></canvas>
      <p class="maptitle">地图 <span class="mappy">dìtú</span> · Map <span class="mappy">${AREA.name.zh} ${AREA.name.py}</span></p>
      <div class="mapplaces" data-nav>${been.map(id => { const [x, y, w, h] = onMapAt(id);
        return `<button class="mapplace" data-place="${id}" aria-label="${esc(PLACES[id].name.en)}" style="left:${pct(x, MAP_W)};top:${pct(y, MAP_H)};width:${pct(w, MAP_W)};height:${pct(h, MAP_H)}"></button>`; }).join('')}</div>
      <div class="mapbox"><div class="mapname"></div><div class="actions"><button class="btn" data-a="back" data-b>Back</button></div></div>
    </div></div>`);
  drawMap(sheet.querySelector('.mapart'));
  const show = id => {   // the chosen place's name in the corner (a name: Chinese, pinyin and English together)
    const n = PLACES[id].name;
    sheet.querySelector('.mapname').innerHTML = `<div><span class="mapzh">${n.zh}</span> <span class="mappy">${n.py}</span></div>
      <div class="mapen">${esc(n.en)}</div>${id === PLACE ? `<div class="maphere">${PIN_SVG}You are here</div>` : ''}`;
  };
  sheet.querySelectorAll('.mapplace').forEach(b => { b.onclick = () => { markNav(b); b.focus(); show(b.dataset.place); }; });
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
