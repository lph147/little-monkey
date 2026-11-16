'use strict';
// Nowhere to get stuck (the stuck-point audit, 6 November 2026): what tests/stuck.test.js (Area 2) and tests/stuck-area3.test.js
// (Area 3) check in every place, run in the game.
//
// From every way into a place: the squares you can walk to (over stepping stones and loose planks, down banks, up and down
// chains), and what you can't get to: a way out, someone standing there, or a kind of thing with something to do there.
const stuckCode = (extra = {}) => `(() => {
  const report = {}, arrivals = {}, SIDES = [[1,0],[-1,0],[0,1],[0,-1]];
  for (const [id, p] of Object.entries(PLACES)) for (const e of p.exits || []) if (e.arrive && PLACES[e.to]) (arrivals[e.to] = arrivals[e.to] || []).push(e.arrive);
  for (const [id, list] of Object.entries(${JSON.stringify(extra)})) for (const a of list) (arrivals[id] = arrivals[id] || []).push(a);   // (where you arrive with no way in: the area's start, a dream, waking up)
  for (const id of Object.keys(PLACES)){
    enterPlace(id); placeCharacters();
    const P = PLACES[id], H = P.map.length, W = P.map[0].length, issues = [];
    const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H, t = (x, y) => inside(x, y) ? tileAt(x, y) : {};
    const stand = (x, y) => inside(x, y) && (t(x, y).walk || t(x, y).hop) && !t(x, y).ledge && !npcAt(x, y) && !animalAt(x, y);
    const climbs = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (const o of t(x, y).onLook || []) for (const s of o.do || []) if (s.climb) climbs.push(s.climb);
    const next = (x, y) => {
      const r = [];
      for (const [dx, dy] of SIDES){ const nx = x + dx, ny = y + dy;
        if (t(nx, ny).ledge){ if (dy === 1){ let ly = ny + 1; while (t(nx, ly).ledge) ly++; if (stand(nx, ly)) r.push([nx, ly]); } continue; }
        if (stand(nx, ny)) r.push([nx, ny]); }
      for (const c of climbs) for (const [a, b] of [[c[0], c[1]], [c[1], c[0]]]) if (Math.abs(a[0] - x) + Math.abs(a[1] - y) <= 1 && stand(...b)) r.push(b);
      return r; };
    const reach = (sx, sy) => { const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]; for (let i = 0; i < q.length; i++) for (const [nx, ny] of next(...q[i])){ const k = nx + ',' + ny; if (!seen.has(k)){ seen.add(k); q.push([nx, ny]); } } return seen; };
    const by = (x, y, all) => all.has(x + ',' + y) || SIDES.some(([dx, dy]) => all.has((x + dx) + ',' + (y + dy)));
    const starts = arrivals[id] || [], open = (P.exits || []).filter(e => !e.when || matches(e.when)), all = new Set();
    for (const s of starts){
      const r = reach(...s); r.forEach(k => all.add(k));
      if (open.length && !open.some(e => by(e.at[0], e.at[1], r))) issues.push('trapped arriving at ' + s);
    }
    if (starts.length){
      const outs = {}; for (const e of open) outs[e.to] = outs[e.to] || by(e.at[0], e.at[1], all);
      for (const [to, ok] of Object.entries(outs)) if (!ok) issues.push('the way to ' + to);
      for (const n of ALL_NPCS.filter(n => n.place === id)) if (!by(n.x, n.y, all)) issues.push(n.id);
      const things = {};
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ const tt = t(x, y);
        if (!((tt.onLook && tt.onLook.some(o => !o.if || matches(o.if))) || tt.pick)) continue;
        const k = P.map[y][x]; things[k] = things[k] || by(x, y, all); }
      for (const [k, ok] of Object.entries(things)) if (!ok) issues.push('the ' + k + ' (' + (tileAt(...(() => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (P.map[y][x] === k) return [x, y]; })()).look) + ')');
    }
    if (issues.length) report[id] = issues;
  }
  return report;
})()`;

module.exports = {stuckCode};
