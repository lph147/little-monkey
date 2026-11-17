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
function startsKeeper(game){
  const kept = {}, labels = {}, get = expr => JSON.parse(game.run(`JSON.stringify(${expr})`));
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
      if (next){ kept[next] = snap; labels[next] = doing; next = null; }
      if (area === was[0]) for (let p = Math.max(1, was[1] + 1); p <= part; p++) if (!kept[`a${area}p${p}`]){ kept[`a${area}p${p}`] = snap; labels[`a${area}p${p}`] = doing; }
    },
    nextIs(key){ next = key; },   // the next act begins this part, in the next area
    write(){
      if (process.env.STARTS_SHOW) console.log(labels);
      if (!process.env.STARTS) return;
      fs.mkdirSync(DIR, {recursive: true});
      for (const [k, s] of Object.entries(kept)) fs.writeFileSync(path.join(DIR, k + '.json'), JSON.stringify(s) + '\n');
    }
  };
}
module.exports = {startsKeeper, DIR};
