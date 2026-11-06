// Your monkey doing things (decided 6 November 2026, after playing it: the broom seemed to come out of its stomach, with no
// arms, and what you used floated in front of you). A pose for each moment of what you're doing, drawn as the sprites are,
// from letters: 48 by 48 pixels with your own square in the middle (16 to 31), your arms reaching out and your paws
// holding what you use, your body leaning, stretching or stepping up to what you're doing, in what you're wearing (your
// coat's sleeves on your arms). From the front (facing down), from behind (facing up) and from the side (facing right;
// facing left is the same the other way round). poseSprite(name, dir, ...) gives one's picture, and ACTS in js/draw.js
// shows them in turn as you do each thing.
const POSES = (() => {
  const W = 48, O = 16, N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  // the colours of what you hold, and of you: F a darker fur where an arm crosses you, h your paws, K your coat's sleeves
  const PAL = {F:'#A8732A', h:'#E9B98A', K:'#B0A088',
    j:'#C9A85E', J:'#4A3618', n:'#6B4A2A', v:'#B08A40', V:'#DCC07A', N:'#8A6A30',   // the broom: its handle, the handle's edge, its band, its twigs (and their tips, and the darker ones)
    l:'#9A6A3A', k:'#3E2010', u:'#7E8690', U:'#DCE2E8',                              // the axe: its handle, its dark edge, its steel head, its bright edge
    p:'#8A5A32', P:'#4A2C17', i:'#3E3E44', z:'#7FC4EE', r:'#C9A85E'};                // the bucket: its staves, its inside, its iron bands, water, its rope handle
  const ARMLESS = r => '...o' + r.slice(4, 12) + 'o...';   // (from the front or behind: your arms at your sides taken off; they're drawn as each pose has them)
  const FRONT = MONKEY.map((r, y) => y === 5 ? r.slice(0, 6) + 'e' + r.slice(7, 9) + 'e' + r.slice(10) : y >= 10 && y <= 12 ? ARMLESS(r) : r);
  const BEHIND = BACK.map((r, y) => y >= 10 && y <= 12 ? ARMLESS(r) : r);
  // your body in a pose: its rows (the first at y0), the row its head starts (top), where your coat covers you (coat, its
  // belt on belt) and your headband goes (band)
  const shift = (r, dx) => dx > 0 ? ('.'.repeat(dx) + r).slice(0, 16) : r;
  const BODIES = {
    front:{rows:FRONT, y0:0, top:1, coat:[8, 13], belt:11, band:3},
    frontLean:{rows:['................', '................', ...FRONT.slice(1, 9), FRONT[9], FRONT[11], FRONT[12], FRONT[13], FRONT[14], FRONT[15]], y0:0, top:2, coat:[9, 13], belt:11, band:4},
    frontTiptoe:{rows:[...FRONT.slice(1, 13), FRONT[13], '....offffffo....', '....ofo..ofo....', '....oo....oo....'], y0:0, top:0, coat:[7, 13], belt:10, band:2},
    back:{rows:BEHIND, y0:0, top:1, coat:[8, 13], belt:11, band:3, tail:true},
    backLean:{rows:[...BEHIND.slice(1, 8), BEHIND[8], BEHIND[9], BEHIND[10], BEHIND[10], BEHIND[11], BEHIND[11], BEHIND[12], BEHIND[13], BEHIND[14], BEHIND[15]], y0:-1, top:-1, coat:[6, 13], belt:11, band:1, tail:true},
    backTiptoe:{rows:[...BEHIND.slice(1, 13), '....offffffo....', '....offffffo....', '....ofo..ofo....', '....oo....oo....'], y0:0, top:0, coat:[7, 13], belt:10, band:2, tail:true},
    side:{rows:SIDE, y0:0, top:1, coat:[8, 13], belt:11, band:3},
    sideLean:{rows:SIDE.map((r, y) => y >= 1 && y <= 7 ? shift(r, 1) : r), y0:0, top:1, coat:[8, 13], belt:11, band:3},
    sideTiptoe:{rows:[...SIDE.slice(1, 14), '....offffo......', '.....ofofo......', '.....oo.oo......'], y0:0, top:0, coat:[7, 13], belt:10, band:2}
  };
  const blank = () => Array.from({length:W}, () => Array(W).fill('.'));
  const put = (g, x, y, c) => { if (g[y] && x >= 0 && x < W) g[y][x] = c; };
  const get = (g, x, y) => (g[y] && g[y][x]) || '.';
  function line(x0, y0, x1, y1){
    const out = []; let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, e = dx + dy;
    for (;;){ out.push([x0, y0]); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy){ e += dy; x0 += sx; } if (e2 <= dx){ e += dx; y0 += sy; } }
    return out;
  }
  // cells in a colour (c: a letter, or one for each cell), outlined (e) where they meet nothing, or these letters (over)
  function shape(g, cells, c, e = 'o', over = ''){
    const own = new Set(cells.map(([x, y]) => x + ',' + y));
    cells.forEach(([x, y], i) => put(g, x, y, typeof c === 'function' ? c(x, y, i) : c));
    for (const [x, y] of cells) for (const [dx, dy] of N4){ const nx = x + dx, ny = y + dy; if (own.has(nx + ',' + ny)) continue; const n = get(g, nx, ny); if (n === '.' || over.includes(n)) put(g, nx, ny, e); }
  }
  // what you're wearing (your clothes and headband, as monkeySprite draws them)
  const wear = () => ({coat:wornOn('body'), hat:wornOn('head'), shoes:wornOn('feet'), band:!!headband()});
  // you: a body (BODIES' name), moved by (dx, dy): your clothes on it, and from behind, your tail curled up beside you
  function you(g, name, w, dx = 0, dy = 0){
    const bd = BODIES[name];
    g.step = [dx, dy];   // (how far you've stepped or leant from your square: your shadow goes with you)
    if (bd.tail) shape(g, [[2, 11], [1, 10], [1, 9], [2, 8]].map(([x, y]) => [x + O + dx, y + bd.top - 1 + O + dy]), 'f');
    bd.rows.forEach((r, i) => {
      const y = bd.y0 + i;
      [...r].forEach((c, x) => {
        if (c === '.') return;
        if (w.band && y === bd.band && x >= 3 && x <= 12 && c === 'f') c = 'b';
        if (w.coat && y >= bd.coat[0] && y <= bd.coat[1] && 'fsb'.includes(c)) c = y === bd.belt ? 'D' : 'C';
        if (w.shoes && y >= 14 && c === 'f') c = 'S';
        put(g, O + x + dx, O + y + dy, c);
      });
    });
    if (w.hat) HAT.forEach((r, j) => [...r].forEach((c, x) => { if (c !== '.') put(g, O + x + dx, O + bd.top - 1 + j + dy, c); }));
  }
  // an arm, through these points (your own pixels), its paw at the end: a sleeve (in your coat) or fur, with a darker fur
  // edge where it crosses you, outlined where it meets nothing; it gives back where its paw is, in the frame's pixels
  function arm(g, pts, w, dx = 0, dy = 0){
    const cells = [];
    for (let i = 1; i < pts.length; i++) for (const p of line(...pts[i - 1], ...pts[i])) if (!cells.some(c => c[0] === p[0] && c[1] === p[1])) cells.push(p);
    const fr = cells.map(([x, y]) => [x + O + dx, y + O + dy]), own = new Set(fr.map(([x, y]) => x + ',' + y));
    fr.forEach(([x, y], i) => put(g, x, y, i === fr.length - 1 ? 'h' : w.coat ? 'K' : 'f'));
    for (const [x, y] of fr) for (const [ex, ey] of N4){ const nx = x + ex, ny = y + ey; if (own.has(nx + ',' + ny)) continue; const n = get(g, nx, ny);
      if (n === '.' || 'aJk'.includes(n)) put(g, nx, ny, 'o'); else if (!w.coat && 'fs'.includes(n)) put(g, nx, ny, 'F'); }   // (never over a handle: your paw holds it)
    return fr[fr.length - 1];
  }
  const at = (x, y, dx = 0, dy = 0) => [x + O + dx, y + O + dy];
  // the broom: its handle from a to z (frame pixels), and its head of twigs at z, fanning out on the ground away from you
  // (dir: [1, 0] forward from the side, [0, 1] down the screen, [0, -1] up it), leaning a little (tilt)
  function broom(g, a, z, dir, tilt = 0){
    shape(g, line(...a, ...z), 'j', 'J');
    const [bx, by] = z, cells = [], col = {};
    const add = (x, y, c) => { if (!(x + ',' + y in col)){ cells.push([x, y]); col[x + ',' + y] = c; } };
    if (dir[1]){
      const s = dir[1];
      for (const x of [-1, 0, 1]) add(bx + x, by, 'n');
      for (const [y, a2, z2] of [[1, -2, 2], [2, -3, 3], [3, -3, 4], [4, -4, 3]]) for (let x = a2; x <= z2; x++)
        add(bx + x + Math.round(tilt * y / 4), by + s * y, y === 4 || (y === 3 && (x === a2 || x === z2)) ? 'V' : (x % 2 ? 'v' : 'N'));
    } else {
      const s = dir[0];
      for (const y of [0, 1]) add(bx, by + y, 'n');
      for (const [y, a2, z2] of [[-1, 2, 4], [0, 1, 5], [1, 1, 6], [2, 2, 5]]) for (let x = a2; x <= z2; x++) add(bx + s * x, by + y, x === z2 ? 'V' : (y % 2 ? 'v' : 'N'));
    }
    shape(g, cells, (x, y) => col[x + ',' + y], 'J');
  }
  // the axe: its handle from your paws (a) to its head (z), the head across the end, its edge (blade: which way it faces) bright
  function axe(g, a, z, blade){
    shape(g, line(...a, ...z), 'l', 'k');
    const [x, y] = z, [ex, ey] = blade, px = -ey, py = ex, cells = [], col = {};
    for (let k = -1; k <= 2; k++) for (let j = 0; j <= 2; j++){ const cx = x + px * k + ex * j, cy = y + py * k + ey * j; cells.push([cx, cy]); col[cx + ',' + cy] = j === 2 ? 'U' : 'u'; }
    shape(g, cells, (cx, cy) => col[cx + ',' + cy], 'k', 'lj');
  }
  // a bucket, seen from above: its rim (x, y: its top left, frame pixels), full of water or not, and as many of its six rows
  // as show (the rest under the water)
  function bucket(g, x, y, {rows = 6, full = false} = {}){
    const cells = [], col = {};
    const add = (cx, cy, c) => { cells.push([cx, cy]); col[cx + ',' + cy] = c; };
    for (let i = 0; i < 6; i++) add(x + i, y, i === 0 || i === 5 ? 'p' : full ? 'z' : 'P');
    for (let r = 1; r < rows; r++) for (let i = 0; i < 6; i++) add(x + i, y + r, r === 2 || r === 4 ? 'i' : 'p');
    shape(g, cells, (cx, cy) => col[cx + ',' + cy]);
    for (const [dx, dy] of [[1, -1], [2, -2], [3, -2], [4, -1]]) if (get(g, x + dx, y + dy) === '.') put(g, x + dx, y + dy, 'r');
    g.bucket = [x + 3, y + 1];   // (its middle, for the splash and the drips)
  }
  // ---- the poses: each draws you doing it, in a view, at one of its moments (m), and gives back anything the drawing
  // needs to know, such as where your paw is with what you've picked ----
  const DRAW = {
    // sweeping (m: where the broom is in its stroke, -1 drawn back or to one side, 0 the middle, 1 pushed out or to the other)
    sweep: {
      side(g, m, w){
        const dx = m > 0 ? 1 : 0, top = m > 0 ? [12, 7] : m < 0 ? [10, 6] : [11, 7], end = m > 0 ? [19, 14] : m < 0 ? [15, 14] : [17, 14];
        you(g, 'side', w, dx);
        arm(g, m > 0 ? [[8, 10], [11, 11], [12, 11]] : m < 0 ? [[8, 10], [9, 11], [10, 11]] : [[8, 10], [10, 11], [11, 11]], w, dx);   // your far arm, behind it
        broom(g, at(...top, dx), at(...end, dx), [1, 0]);
        arm(g, m > 0 ? [[8, 9], [10, 9], [11, 8]] : m < 0 ? [[8, 9], [9, 8], [9, 7]] : [[8, 9], [10, 9], [10, 8]], w, dx);           // your near arm, over it
      },
      front(g, m, w){
        const top = at(12 + m, 8), z = at(8 + m * 4, 18);
        you(g, 'front', w, m);
        broom(g, top, z, [0, 1], m * 2);
        const on = hy => Math.round(top[0] + (z[0] - top[0]) * (hy + O - top[1]) / (z[1] - top[1])) - O - m;          // (where the handle is, on a row)
        arm(g, [[12, 9], [on(10), 10]], w, m);                                                                            // one paw high on the handle,
        arm(g, [[3, 9], [5, 11], [on(13) - 1, 12], [on(13), 13]], w, m);                                                  // the other across you, low on it
      },
      back(g, m, w){
        broom(g, at(14 + m, 8), at(8 + m * 4, -4), [0, -1], m * 2);   // out in front of you, over your head, its twigs on the ground ahead
        you(g, 'back', w, m);
        arm(g, [[12, 9], [13, 8], [14, 7]], w, m);
      }
    },
    // chopping with the axe (m: 'up', raised over your head, or 'down', on the block)
    chop: {
      side(g, m, w){
        if (m === 'up'){ you(g, 'side', w, -1); axe(g, at(7, 1), at(3, -3), [-1, 0]); arm(g, [[8, 9], [9, 6], [9, 2]], w, -1); return; }
        you(g, 'side', w, 1); arm(g, [[8, 10], [11, 10], [13, 9]], w, 1); axe(g, at(15, 9), at(20, 5), [0, 1]); arm(g, [[8, 9], [11, 9], [14, 9]], w, 1);
      },
      front(g, m, w){
        if (m === 'up'){ axe(g, at(7, -1), at(7, -6), [0, -1]); you(g, 'front', w); arm(g, [[3, 9], [2, 6], [3, 2], [6, -1]], w); arm(g, [[12, 9], [13, 6], [12, 2], [9, -1]], w); return; }
        you(g, 'frontLean', w);
        axe(g, at(7, 13), at(7, 18), [0, 1]);
        arm(g, [[3, 10], [5, 12], [6, 13]], w); arm(g, [[12, 10], [10, 12], [8, 13]], w);
      },
      back(g, m, w){
        if (m === 'up'){ axe(g, at(8, -3), at(13, 3), [1, 0]); you(g, 'back', w, 0, -3); arm(g, [[3, 9], [2, 6], [4, 1], [7, -2]], w, 0, -3); arm(g, [[12, 9], [13, 6], [11, 1], [9, -2]], w, 0, -3); return; }
        axe(g, at(8, -4), at(8, -10), [0, -1]); you(g, 'backLean', w, 0, -3); arm(g, [[3, 8], [2, 5], [4, 0], [7, -3]], w, 0, -3); arm(g, [[12, 8], [13, 5], [11, 0], [9, -3]], w, 0, -3);
      }
    },
    // filling the bucket (m: 'out', stepped up to the water's edge holding it out; 'in', down in the water; 'full', lifted
    // out again; 'back', stepped back, carrying it at your side)
    dip: {
      back(g, m, w){
        if (m === 'back'){ you(g, 'back', w); bucket(g, ...at(14, 10), {full:true}); arm(g, [[12, 9], [13, 10], [14, 11]], w); arm(g, [[3, 9], [2, 10], [2, 11]], w); return; }
        you(g, 'backLean', w, 0, -6);
        bucket(g, ...at(9, m === 'in' ? -12 : m === 'full' ? -14 : -13), {rows:m === 'in' ? 2 : 6, full:m === 'full'});   // (over the water you face, past your hat)
        arm(g, [[12, 8], [14, 4], [13, m === 'in' ? -1 : m === 'full' ? -2 : -1]], w, 0, -6); arm(g, [[3, 8], [2, 9], [2, 10]], w, 0, -6);
      },
      side(g, m, w){
        if (m === 'back'){ you(g, 'side', w); arm(g, [[8, 10], [9, 11], [10, 12]], w); bucket(g, ...at(8, 13), {full:true}); arm(g, [[8, 9], [10, 11], [11, 12]], w); return; }
        you(g, 'sideLean', w, 4);
        arm(g, [[8, 10], [11, 11], [13, 11]], w, 4);
        bucket(g, ...at(17, m === 'in' ? 11 : m === 'full' ? 7 : 9, 4), {rows:m === 'in' ? 2 : 6, full:m === 'full'});
        arm(g, [[8, 9], [11, 9], [14, m === 'full' ? 8 : 10]], w, 4);
      },
      front(g, m, w){
        if (m === 'back'){ you(g, 'front', w); bucket(g, ...at(13, 11), {full:true}); arm(g, [[12, 9], [13, 10], [14, 11]], w); arm(g, [[3, 9], [2, 10], [2, 11]], w); return; }
        you(g, 'frontLean', w, 0, 4);
        bucket(g, ...at(5, m === 'in' ? 19 : m === 'full' ? 15 : 17, 0, 4), {rows:m === 'in' ? 2 : 6, full:m === 'full'});
        arm(g, [[3, 10], [4, 13], [5, m === 'full' ? 15 : 16]], w, 0, 4); arm(g, [[12, 10], [11, 13], [10, m === 'full' ? 15 : 16]], w, 0, 4);
      }
    },
    // reaching up into a tree for its fruit (m: 'reach', up on tiptoe, an arm up into its leaves; 'hold', holding up what
    // you've picked): gives back where your paw is
    reach: {
      back(g, m, w){
        if (m === 'hold'){ you(g, 'back', w); const p = arm(g, [[12, 9], [13, 6], [13, 2]], w); arm(g, [[3, 9], [2, 10], [2, 11]], w); return {paw:p}; }
        you(g, 'backTiptoe', w, 0, -5); const p = arm(g, [[12, 8], [14, 5], [15, 2]], w, 0, -5); arm(g, [[3, 8], [2, 9], [2, 10]], w, 0, -5); return {paw:p};
      },
      side(g, m, w){
        if (m === 'hold'){ you(g, 'side', w); arm(g, [[8, 10], [10, 11], [11, 11]], w); const p = arm(g, [[8, 9], [10, 6], [11, 2]], w); return {paw:p}; }
        you(g, 'sideTiptoe', w, 3); arm(g, [[8, 9], [10, 10], [11, 10]], w, 3); const p = arm(g, [[8, 8], [11, 5], [13, 1]], w, 3); return {paw:p};
      },
      front(g, m, w){
        if (m === 'hold'){ you(g, 'front', w); arm(g, [[3, 9], [2, 10], [2, 11]], w); const p = arm(g, [[12, 9], [13, 6], [12, 2]], w); return {paw:p}; }
        you(g, 'frontLean', w, 0, 3); arm(g, [[3, 10], [3, 13], [4, 15]], w, 0, 3); const p = arm(g, [[12, 10], [12, 13], [11, 15]], w, 0, 3); return {paw:p};
      }
    }
  };
  // a pose's letters (name: what you're doing; dir: which way you face; m: its moment; w: what you're wearing), and
  // anything else it gives back (such as your paw)
  function grid(name, dir, m, w = wear()){
    const g = blank(), view = dir === 'up' ? 'back' : dir === 'down' ? 'front' : 'side';
    const info = {...DRAW[name][view](g, m, w), step:g.step || [0, 0], ...(g.bucket ? {bucket:g.bucket} : {})};
    let rows = g.map(r => r.join(''));
    if (dir === 'left'){
      rows = rows.map(r => [...r].reverse().join(''));
      for (const k of ['paw', 'bucket']) if (info[k]) info[k] = [W - 1 - info[k][0], info[k][1]];
      info.step = [-info.step[0], info.step[1]];
    }
    return {rows, ...info};
  }
  const cache = new Map();
  // its picture, drawn once for each moment and what you're wearing (and its paw, in your own square's pixels)
  function picture(name, dir, m){
    const w = wear(), key = [name, dir, m, w.coat, w.hat, w.shoes, headband()].join('|');
    if (!cache.has(key)){
      const g = grid(name, dir, m, w), mine = p => p && [p[0] - O, p[1] - O];
      cache.set(key, {canvas:sprite(g.rows, {...PALS.player, ...CLOTHES_PAL, ...(headband() ? {b:headband()} : {}), ...PAL}), paw:mine(g.paw), bucket:mine(g.bucket), step:g.step});
    }
    return cache.get(key);
  }
  return {grid, picture, O, W, PAL, BODIES, clear:() => cache.clear()};
})();
// The picture of you doing something (name, facing dir, at its moment m): a canvas 48 pixels square, your own square in
// its middle, so drawn 16 pixels up and to the left of where you stand; how far you've stepped from your square (step),
// and where your paw is (paw) and the bucket (bucket), in your square's pixels
const poseSprite = (name, dir, m) => POSES.picture(name, dir, m);
