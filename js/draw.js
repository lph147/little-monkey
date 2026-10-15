// Drawing each frame: the world, characters, sparkles and task arrows, and the opening scene.

/* ---- per-frame drawing ---- */
function sparkle(X, Y, now, ph){
  const s = (Math.sin(now/260 + ph) + 1) / 2; if (s < .25) return;
  R(b, X, Y, 1, 1, '#FFFFFF');
  R(b, X-1, Y, 1, 1, '#FFE27A'); R(b, X+1, Y, 1, 1, '#FFE27A'); R(b, X, Y-1, 1, 1, '#FFE27A'); R(b, X, Y+1, 1, 1, '#FFE27A');
  if (s > .7){ R(b, X-2, Y, 1, 1, '#FFE27A'); R(b, X+2, Y, 1, 1, '#FFE27A'); R(b, X, Y-2, 1, 1, '#FFE27A'); R(b, X, Y+2, 1, 1, '#FFE27A'); }
}
function bubble(X, Y, ch){
  R(b, X, Y, 7, 9, '#1E2B26'); R(b, X+1, Y+1, 5, 7, '#FFFFFF'); R(b, X+3, Y+9, 1, 1, '#1E2B26');
  if (ch === '!'){ R(b, X+3, Y+2, 1, 3, '#C0392B'); R(b, X+3, Y+6, 1, 1, '#C0392B'); }
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
  } else if (look === 'waterfall'){
    R(b, X, Y, T, T, '#8FD0EE');
    for (let i = 0; i < 5; i++){ const xx = X + 1 + i*3, off = (now/18 + i*7) % 22 - 6; R(b, xx, Y + Math.max(0, off), 1, Math.min(7, 16 - Math.max(0, off)), '#FFFFFF'); R(b, xx+1, Y, 1, T, '#B9E4F7'); }
  }
}
function drawEntityMonkey(kind, X, Y, dir, now, bob, step = 0, seed = 0){
  R(b, X+4, Y+15, 8, 1, 'rgba(0,0,0,.22)'); R(b, X+3, Y+14, 10, 1, 'rgba(0,0,0,.12)');
  const blink = (now + seed*977) % 3600 < 130;
  b.drawImage(monkeySprite(kind, dir, blink, step), X, Y - bob);
}
function heart(X, Y){ [[1,0],[3,0],[0,1],[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[2,3]].forEach(([a,c]) => R(b, X+a, Y+c, 1, 1, '#E0446A')); }
function drawFoe(cx, cy, now){
  if (!foe) return;
  const X = foe.x*T - cx, Y = foe.y*T - cy, e = now - foe.t0, spr = foe.a.spr;
  if (foe.state === 'in'){
    const k = clamp(e / 280, 0, 1), h = Math.max(1, Math.round(16 * k)), jump = e > 280 && e < 520 ? Math.round(Math.sin((e - 280) / 240 * Math.PI) * 4) : 0;
    R(b, X+3, Y+14, 10, 2, 'rgba(0,0,0,.18)');
    b.drawImage(spr, 0, 0, 16, h, X, Y + 16 - h - jump, 16, h);
    if (e < 600 && tileAt(foe.x, foe.y).look === 'tallGrass'){ for (let i = 0; i < 5; i++){ const gx = X + 1 + i*3 + Math.round(Math.sin(e/40 + i)*1); R(b, gx, Y + 11 - (i % 2), 1, 4, '#2F6E38'); R(b, gx, Y + 10 - (i % 2), 1, 1, '#94D883'); } }
  } else {
    const e1 = now - foe.t1;
    if (foe.state === 'happy'){
      const hop = Math.round(Math.abs(Math.sin(e1 / 130)) * 4);
      b.globalAlpha = clamp(1 - (e1 - 700) / 300, 0, 1);
      b.drawImage(spr, X, Y - hop); heart(X + 6, Y - 6 - Math.round(e1 / 120));
      b.globalAlpha = 1;
    } else {
      const [dx, dy] = DV[OPP[pl.dir]] ? DV[pl.dir] : [0, 1];
      const d = e1 / 650 * 20;
      b.globalAlpha = clamp(1 - e1 / 650, 0, 1);
      b.drawImage(spr, Math.round(X + dx * d), Math.round(Y + dy * d - Math.abs(Math.sin(e1 / 70)) * 2));
      b.globalAlpha = 1;
    }
  }
}
function drawWorld(now){
  let cx = Math.round(clamp(pl.px + 8 - VW*T/2, 0, COLS*T - VW*T));
  let cy = Math.round(clamp(pl.py + 8 - VH*T/2, 0, ROWS*T - VH*T));
  if (now - shakeT < 600){ cx += Math.round((Math.random()-.5)*3); cy += Math.round((Math.random()-.5)*3); }
  b.drawImage(mapCanvas, cx, cy, VW*T, VH*T, 0, 0, VW*T, VH*T);
  const x0 = Math.floor(cx/T), y0 = Math.floor(cy/T);
  for (let y = y0; y <= y0 + VH; y++) for (let x = x0; x <= x0 + VW; x++) animTile(x, y, x*T - cx, y*T - cy, now);
  // fish jumping in the pond
  const fp = (now % 5200) / 900;
  if (fp < 1){ const fx = 11*T - cx + 2 + fp*10, fy = 10*T - cy + 6 - Math.sin(fp*Math.PI)*8; R(b, Math.round(fx), Math.round(fy), 3, 2, '#F28C38'); R(b, Math.round(fx)-1, Math.round(fy), 1, 2, '#D96A1E'); }
  // sparkles on things whose word is not yet known
  if (areaDone() && !here().done) sparkle(3*T - cx + 8, 3*T - cy + 6, now, 1);
  for (const [w,[x,y]] of Object.entries(HOT)){
    if (lvl(w) > 0) continue;
    if (w === '瀑布' && !here().gate) continue;
    const t = tileAt(x, y);
    if (t.learnFirst && lvl(t.learnFirst) === 0) continue;   // e.g. the forest only sparkles once you know 树
    sparkle(x*T - cx + (t.walk ? 8 : 12), y*T - cy + (t.walk ? 8 : 3), now, x + y);
  }
  // entities sorted by row
  const ents = NPCS.map(n => ({n, y:n.y*T})).concat([{p:true, y:pl.py}]).concat(foe ? [{f:true, y:foe.y*T}] : []).sort((a,c) => a.y - c.y);
  for (const e of ents){
    if (e.f){ drawFoe(cx, cy, now); continue; }
    if (e.p){
      const moving = !!pl.mv, p = moving ? (now - pl.mv.t0) / STEP : 0;
      const mid = moving && p > .15 && p < .85;
      const PX = Math.round(pl.px - cx), PY = Math.round(pl.py - cy);
      drawEntityMonkey('player', PX, PY, pl.dir, now, mid ? 1 : 0, mid ? 1 + pl.parity : 0, 1);
      if (now < alertUntil) bubble(PX + 5, PY - 10, '!');
      continue;
    }
    const n = e.n, X = n.x*T - cx, Y = n.y*T - cy;
    if (X < -T || Y < -T || X > VW*T || Y > VH*T) continue;
    if (n.kind === 'bird'){
      const hop = Math.floor(Math.abs(Math.sin(now/300)) * 3);
      R(b, X+5, Y+14, 6, 1, 'rgba(0,0,0,.2)'); b.drawImage(SPR.bird, X+4, Y+6 - hop);
      if (lvl('鸟') === 0) sparkle(X+13, Y+3, now, 3);
      continue;
    }
    const idle = Math.floor(now/700 + n.x) % 2;
    drawEntityMonkey(n.kind, X, Y, n.dir, now, idle, 0, n.x + n.y);
    const q = here()[n.id];
    if (n.kind === 'elder' && q === 0) bubble(X+10, Y-8, '!');
    if (n.kind === 'elder' && q === 1 && elderReady()) bubble(X+10, Y-8, '!');
    const r = requestFrom(n.id), rq = r && here()[r.id];   // ! when they have a request for you, ? when you're holding something for it
    if (r && here().elder >= 1 && (rq === 'not asked' || (rq === 'asked' && here().holding[r.id]))) bubble(X+10, Y-8, rq === 'not asked' ? '!' : '?');
  }
  drawMarkers(cx, cy, now);
  const fk = (now - fadeT) / 700;
  if (fk >= 0 && fk < 2){ b.globalAlpha = fk < 1 ? fk : 2 - fk; R(b, 0, 0, VW*T, VH*T, '#000000'); b.globalAlpha = 1; }
}
const ARROW = ["ooooooo","oyyyyyo",".oyyyo.","..oyo..","...o..."];
function pix(rows, X, Y, pal){ rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) R(b, X + x, Y + y, 1, 1, pal[ch]); })); }
function drawMarkers(cx, cy, now){
  const W = VW*T, H = VH*T, pal = {o:'#1E2B26', y:'#F2C14E'};
  for (const t of getTasks()){
    if (!t.target) continue;
    const [tx, ty] = t.target, X = tx*T - cx, Y = ty*T - cy;
    const onScreen = X > -8 && X < W - 8 && Y > -4 && Y < H - 8;
    if (onScreen){ if (!t.npc) pix(ARROW, X + 4, Y - 7 + Math.round(Math.sin(now/180) * 2), pal); continue; }
    // off-screen: a small arrow at the screen edge pointing towards the task
    const mx = clamp(X + 8, 6, W - 6), my = clamp(Y + 8, 6, H - 6), pulse = (Math.sin(now/200) + 1) / 2 > .25;
    if (!pulse) continue;
    let rows;
    if (X + 8 < 6) rows = ["...oo","..oyo",".oyyo","oyyyo",".oyyo","..oyo","...oo"];
    else if (X + 8 > W - 6) rows = ["oo...","oyo..","oyyo.","oyyyo","oyyo.","oyo..","oo..."];
    else if (Y + 8 < 6) rows = ["...o...","..oyo..",".oyyyo.","oyyyyyo","ooooooo"];
    else rows = ARROW;
    pix(rows, Math.round(mx - rows[0].length / 2), Math.round(my - rows.length / 2), pal);
  }
  const lab = currentPrompt(now);
  if (lab && lab !== 'OK'){
    const [fx, fy] = facing(), X = fx*T - cx, Y = fy*T - cy;
    const bx = X + 12, by = Y + 2 + Math.round(Math.sin(now/220));
    pix(["..ooooo..",".orrrrro.","orrwwwrro","orwrrrwro","orwwwwwro","orwrrrwro","orwrrrwro",".orrrrro.","..ooooo.."], bx, by, {o:'#3A0F12', r:'#C0303A', w:'#FFFFFF'});
  }
}

/* ---- opening scene ---- */
function disc(g, cx, cy, r, col){ for (let dy = -r; dy <= r; dy++){ const w = Math.floor(Math.sqrt(r*r - dy*dy)); R(g, cx - w, cy + dy, w*2 + 1, 1, col); } }
function drawScene(t, now){
  const W = VW*T, H = VH*T;
  const dawn = clamp((t - 2.8) / 2.6, 0, 1);
  const skyTop = mix('#0E1A33','#79BFE6',dawn), skyBot = mix('#26385F','#F6C69C',dawn);
  for (let y = 0; y < H; y += 4) R(b, 0, y, W, 4, mix(skyTop, skyBot, y / H));
  if (dawn < 1){
    for (let i = 0; i < 36; i++){
      const sx = Math.floor(rnd(i,1)*W), sy = Math.floor(rnd(i,2)*H*.55), tw = (Math.sin(now/420 + i*1.7) + 1) / 2;
      if (tw < .3) continue;
      b.globalAlpha = (1 - dawn) * (.45 + .55*tw);
      R(b, sx, sy, 1, 1, '#FFF6D8'); if (tw > .9 && i % 3 === 0){ R(b, sx-1, sy, 3, 1, '#FFF6D8'); R(b, sx, sy-1, 1, 3, '#FFF6D8'); }
      b.globalAlpha = 1;
    }
  }
  if (dawn > 0){ disc(b, 34, Math.round(116 - dawn*28), 9, '#FFD27A'); }
  for (let x = 0; x < W; x += 2){ const h = Math.round(98 - Math.abs(Math.sin(x/23))*14 - rnd(x>>2,7)*4); R(b, x, h, 2, 126 - h, mix('#22334F','#7FA79A',dawn)); }
  R(b, 0, 124, W, H - 124, mix('#13284A','#3F8FCB',dawn));
  for (let i = 0; i < 14; i++){ const sx = Math.floor(rnd(i,5)*W), sy = 128 + Math.floor(rnd(i,6)*30); if (Math.sin(now/500 + i) > .3) R(b, sx, sy, 3, 1, mix('#3C5A86','#BFE8FA',dawn)); }
  for (let x = 24; x < 152; x += 2){
    const top = Math.round(70 + Math.pow(Math.abs(x - 88)/64, 1.25)*56 + Math.floor(rnd(x>>1,9)*3));
    R(b, x, top, 2, 126 - top, mix('#1D3A30','#3F7D55',dawn)); R(b, x, top, 2, 2, mix('#2B5242','#6CC066',dawn));
  }
  for (let i = 0; i < 18; i++){ const tx = 36 + Math.floor(rnd(i,11)*104), ty0 = Math.round(70 + Math.pow(Math.abs(tx - 88)/64, 1.25)*56) + 4 + Math.floor(rnd(i,12)*20); if (ty0 < 122 && Math.abs(tx-88) > 10) disc(b, tx, ty0, 2, mix('#16302A','#2F7A3E',dawn)); }
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
    const hop = t > 13 ? Math.round(Math.abs(Math.sin((t - 13) * 5)) * 4) : 0;
    b.drawImage(monkeySprite('player', 'down', blink), 72, 38 - hop, 32, 32);
    if (t > 10.6 && t < 13){
      const k = clamp((t - 10.6) / .4, 0, 1) * (t > 12.5 ? (13 - t) / .5 : 1);
      b.globalAlpha = k;
      for (const [ex, dir] of [[85,-1],[91,1]]){
        for (let y = 0; y < 49; y++){ const xx = ex + Math.round(dir * (49 - y) * .18); R(b, xx, y, 2, 1, '#FFE27A'); if (y % 3 === 0) R(b, xx - 1, y, 4, 1, 'rgba(255,246,216,.7)'); }
      }
      b.globalAlpha = 1;
    }
  }
  if (t > 8.6 && t < 9.4){ b.globalAlpha = clamp(1 - Math.abs(t - 8.8) / .6, 0, 1); R(b, 0, 0, W, H, '#FFFDF0'); b.globalAlpha = 1; }
}
