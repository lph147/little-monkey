// The games to start at each part of the story from, for testing (Start at…, js/starts.js; decided 17 November 2026): as a
// playthrough plays the story, the game just before each part of it begins, that is, as the act that began it started
// (where you stood to do it; off the square, facing it, if it began as you stepped onto one), kept as tools/starts/a2p5.json
// (Area 2's part 5, counting from 0) and written there when the playthroughs are run by npm run starts (STARTS set). An
// area's first part begins in the area before it (sailing, diving): the playthrough says so (nextIs). The very first part
// of all is a new game.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const DIR = path.join(__dirname, '..', 'tools', 'starts');
// The square before one you step onto (the way you came, or else beside it), facing it
const OFF = `(([x, y]) => {
  const ways = [[0, -1, 'down'], [0, 1, 'up'], [1, 0, 'left'], [-1, 0, 'right']], came = ways.find(w => w[2] === S.pos.dir) || ways[0];
  for (const [dx, dy, dir] of [came, ...ways.filter(w => w !== came)]) if (walkable(x + dx, y + dy) && !npcAt(x + dx, y + dy) && !exitAt(x + dx, y + dy)) return {...S.pos, x:x + dx, y:y + dy, dir};
  return S.pos;
})`;
// The days in a game, as if it had been played on an earlier day (a line's English shows again the first time, as it does
// coming back to a game), so a start only changes when the story does, not with the day it was made
const PLAYED = '2026-01-01';
const undated = s => ({...s, lineDay: Object.fromEntries(Object.keys(s.lineDay || {}).map(k => [k, PLAYED])), ...(s.today ? {today: {...s.today, d: PLAYED}} : {})});
function startsKeeper(game){
  const kept = {}, labels = {}, get = expr => JSON.parse(game.run(`JSON.stringify(${expr})`));
  // (the game as each part is about to begin, in the middle of what began it: for a part begun by the same thing as the one
  // before it, such as the Demon of Havoc coming out as you bring the cart back, then his fight and home)
  game.run('globalThis.__partGames = {}; (() => { const p = partsCheck; partsCheck = async () => { const was = here().part, game = JSON.stringify(S); await p(); if (here().part !== was) __partGames[AREA.number + ":" + here().part] = game; }; })()');
  let snap = null, was = null, next = null, doing = '';
  return {
    kept, labels,   // (and what began each)
    before(code, what = code){   // as an act begins
      // (the first tips, about walking, A and a line's words, had, and How to play, as a player has by then: the playthrough
      // never pressed them; not those the story brings, such as running once you can)
      const s = get('({...S, tips: {...S.tips, ...Object.fromEntries(["walk", "talk", "look", "grey", "tap", "english"].map(k => [k, 1]))}, howto: true})'), m = /arrive\((\d+), (\d+)\)/.exec(code);
      if (m && s.pos.x === +m[1] && s.pos.y === +m[2]) s.pos = get(`${OFF}([${m[1]}, ${m[2]}])`);
      snap = s; doing = what; was = get('[AREA.number, here().part]');
    },
    after(){   // once it's finished: the parts it began
      const [area, part] = get('[AREA.number, here().part]');
      if (next && get('S.area') !== was[0]){ kept[next] = snap; labels[next] = doing; next = null; }   // (the act that took you on to the next area)
      const mid = get('__partGames'); game.run('__partGames = {}');
      if (area === was[0]) for (let p = Math.max(1, was[1] + 1), first = true; p <= part; p++, first = false){
        const k = `a${area}p${p}`, inMid = mid[`${area}:${p}`];
        if (!kept[k]){ kept[k] = first || !inMid ? snap : {...JSON.parse(inMid), tips: snap.tips, howto: true}; labels[k] = doing + (first ? '' : ' (as it began)'); }
      }
    },
    nextIs(key){ next = key; },   // the act that takes you on to the next area (sailing, diving) begins this part there
    write(){
      if (process.env.STARTS_SHOW) console.log(labels);
      if (!process.env.STARTS) return;
      fs.mkdirSync(DIR, {recursive: true});
      for (const [k, s] of Object.entries(kept)) fs.writeFileSync(path.join(DIR, k + '.json'), JSON.stringify(undated(s)) + '\n');
    }
  };
}
module.exports = {startsKeeper, DIR};
