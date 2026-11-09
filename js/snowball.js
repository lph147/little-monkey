'use strict';
// Snowball fights (decided 7 November 2026, from the owner's idea: "you throw the snowball and a correct answer it hits
// and wrong is a miss, same with the other person throwing at you"): in winter, someone challenges you to a snowball
// fight, on a card in the snow, first to three hits (the snowball step). You throw: a word question, as a battle's hit
// (js/battle.js); right, and your snowball hits them; wrong, and it flies past. Then they throw: hear a word and pick it
// to duck, as a battle's dodge; right, and it whizzes past you; wrong, and it hits you. Every answer counts as practice,
// and there's nothing to lose but the game: lose, and you can play again whenever you like.
const SNOWBALL = {to:3, fly:620};   // hits to win; how long a snowball takes to fly, in ms (css .snowfight, the same)
// Someone, as they look on the map from the front, standing (the snowball fight's picture of them).
const plainPicCache = {};
function plainPic(kind){
  if (!plainPicCache[kind]) plainPicCache[kind] = monkeySprite(kind, 'down', false).toDataURL();
  return plainPicCache[kind];
}
// Behind a snowball fight away from the cave: a winter sky, far hills, two village houses under snow, a bare willow, and
// the snow, trodden (the backdrop snowVillage; in the cave's courtyard, courtyardSnow, js/year.js). Its horizon is half way
// down, so it stays there however the card crops it.
function snowVillageBackdrop(){
  const W = 72, H = 128, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), sky = g.createLinearGradient(0, 0, 0, 64);
  sky.addColorStop(0, '#B2C1D2'); sky.addColorStop(1, '#E6ECF2'); g.fillStyle = sky; g.fillRect(0, 0, W, 64);
  for (let x = 0; x < W; x++){   // far hills, white on top
    const h = 14 + Math.round(5 * Math.sin(x / 9) + 3 * Math.sin(x / 4 + 1));
    R(g, x, 64 - h, 1, h, '#C6D0DB'); R(g, x, 64 - h, 1, 2, '#F2F6FA');
  }
  const house = (x, w, top) => {
    R(g, x + 2, top + 7, w - 4, 64 - top - 7, '#EDE5D3'); R(g, x + 2, top + 7, w - 4, 1, '#C9C0AC');   // white walls
    R(g, x + (w >> 1) - 3, 54, 6, 10, '#7A4A2A'); R(g, x + (w >> 1), 55, 1, 9, '#5E3820');   // the door
    for (const wx of [x + 4, x + w - 8]){ R(g, wx, top + 11, 4, 4, '#7A5232'); R(g, wx + 1, top + 12, 2, 2, '#C9A06A'); }   // windows
    for (let i = 0; i < 7; i++) R(g, x + 3 - (i >> 1), top + i, w - 6 + 2 * (i >> 1), 1, i < 2 ? '#F4F8FC' : '#4A4E56');   // the roof, snow on it
    R(g, x - 1, top + 6, w + 2, 1, '#353940');   // its eaves
    for (let i = 0; i < w; i += 4) R(g, x + i, top + 2, 2, 1 + (i % 3), '#F4F8FC');   // snow lying on the tiles
  };
  house(2, 28, 40); house(38, 24, 44);
  R(g, 64, 38, 2, 26, '#5A4632'); R(g, 63, 60, 4, 4, '#5A4632');   // a bare willow
  for (const [bx, by, len] of [[65, 39, 12], [64, 41, 14], [66, 43, 10], [63, 45, 12]]) for (let i = 0; i < len; i++) R(g, bx + (bx > 64 ? i >> 2 : -(i >> 2)), by + i, 1, 1, i % 5 ? '#6E5A44' : '#F4F8FC');
  R(g, 0, 64, W, H - 64, '#EEF3F7'); R(g, 0, 64, W, 2, '#DCE5EC');   // the snow
  for (let y = 70; y < H; y += 7) for (let x = (y % 14 ? 3 : 10); x < W; x += 16) R(g, x, y, 7, 1, '#DFE7EE');
  for (let i = 0; i < 9; i++){ const fx = 8 + Math.floor(rnd(i, 3, 5) * 56), fy = 72 + i * 6; R(g, fx, fy, 2, 1, '#C8D4DE'); R(g, fx + 3, fy + 2, 2, 1, '#C8D4DE'); }   // footprints
  for (let i = 0; i < 40; i++) R(g, Math.floor(rnd(i, 7, 6) * W), Math.floor(rnd(i, 8, 7) * H), 1, 1, '#FFFFFF');   // snow falling and glinting
  return c;
}
BACKDROPS.snowVillage = snowVillageBackdrop;
if (document.documentElement) document.documentElement.style.setProperty('--backdrop-snowVillage', `url(${snowVillageBackdrop().toDataURL()})`);
// The fight's scene: them, across the snow, their name and the snowballs that have hit them; you, from behind, near; a
// snowball flying, and its splat (sc, its classes: throwYou or throwThem, then hitThem, hitYou or a miss, missed), in the
// cave's snowy courtyard or out in the snow.
function snowScene(who, hits, sc = ''){
  const n = nameShown(NAMES[who] || {}), dots = k => Array.from({length:hits.to || SNOWBALL.to}, (_, i) => `<i class="sb${i < k ? ' on' : ''}"></i>`).join('');
  const where = S.pos && S.pos.place === 'cave' ? 'courtyardSnow' : 'snowVillage';
  return `<div class="scene snowfight ${where} ${sc}">
    <div class="sfplate them"><span class="zh"${n.lang ? LANG : ''}>${esc(n.zh || '')}</span> <span class="py">${esc(n.py || (n.lang ? n.en : '') || '')}</span><div class="sbs" aria-label="${ui('Snowballs that hit them: {n}', {n:hits.them})}">${dots(hits.them)}</div></div>
    <img class="sfthem" alt="" src="${plainPic(who)}"><img class="sfyou" alt="" src="${monkeySprite('player', 'up', false).toDataURL()}">
    <div class="sfplate you">${ui('You')}<div class="sbs" aria-label="${ui('Snowballs that hit you: {n}', {n:hits.you})}">${dots(hits.you)}</div></div>
    <i class="sfball"></i><i class="sfsplat"></i><div class="fx"></div></div>`;
}
// One snowball fight with who (opts: to, hits to win). Gives true if you win.
async function snowballFight(who, {to = SNOWBALL.to} = {}){
  const hits = {you:0, them:0, to}, known = w => lvl(w) >= 1 && WORDS[w] && WORDS[w].pic;
  const fly = (sc, cls, label) => { sc.classList.add(...cls); sc.querySelector('.fx').textContent = label; SFX.swish(.15); };
  while (hits.you < to && hits.them < to){
    // your throw: a word, as a battle's hit
    const w = toAsk(null, 1)[0], q = wordQuestion(w, null);
    await pictureQ({head:snowScene(who, hits), body:`<p class="label">${ui('Your throw! Get it right, and your snowball hits.')}</p>` + q.body, word:w, type:q.type,
      options:q.options, text:q.text, answerIdx:q.answerIdx, helper:helperHTML(),
      onShow:() => { if (q.type !== 'read') setTimeout(() => say(w), 300); wireHelper(q.options.length, q.answerIdx); },
      onAnswer:ok => {
        const sc = sheet.querySelector('.scene'), fb = sheet.querySelector('.feedback');
        if (ok) hits.them++;
        fly(sc, ['throwYou', ok ? 'hitThem' : 'missed'], ui(ok ? 'Splat!' : 'Missed!'));
        if (ok) setTimeout(() => SFX.thwack(.12), SNOWBALL.fly);
        const d = sc.querySelector('.sfplate.them .sbs'); if (d && ok) setTimeout(() => { d.children[hits.them - 1] && d.children[hits.them - 1].classList.add('on'); }, SNOWBALL.fly);
        fb.innerHTML += ok ? `<br><b>${ui('Your snowball hits!')}</b>` : `<br>${ui('It flies past.')}`;
      }});
    if (hits.them >= to) break;
    // their throw: hear a word and pick it to duck, as a battle's dodge (with words of yours to choose from)
    const pool = shuffle(picWords().filter(known));
    if (pool.length < 2) continue;
    const a = pool[0], others = soundApart(a, pool.slice(1), 2), opts = shuffle([a, ...others]);
    await pictureQ({head:snowScene(who, hits), body:`<p class="label">${ui('They throw a snowball at you!')}</p>`
        + `<div class="askrow"><p class="prompt">${ui('Listen. Which is it? Pick it to duck.')}</p><button class="sayBig" data-a="say" aria-label="${ui('Play the word again')}">🔊</button></div>`,
      word:a, type:'listen', options:opts.map(o => `<span class="ico">${picHTML(o)}</span><span class="cap"${LANG}>${wd(o)}</span>${laterPy(o)}`), answerIdx:opts.indexOf(a),
      helper:helperHTML(), onShow:() => { setTimeout(() => say(a), 300); wireHelper(opts.length, opts.indexOf(a)); },
      onAnswer:ok => {
        const sc = sheet.querySelector('.scene'), fb = sheet.querySelector('.feedback');
        if (!ok) hits.you++;
        fly(sc, ['throwThem', ok ? 'missed' : 'hitYou'], ui(ok ? 'Ducked!' : 'Splat!'));
        if (!ok) setTimeout(() => SFX.thwack(.12), SNOWBALL.fly);
        const d = sc.querySelector('.sfplate.you .sbs'); if (d && !ok) setTimeout(() => { d.children[hits.you - 1] && d.children[hits.you - 1].classList.add('on'); }, SNOWBALL.fly);
        fb.innerHTML += `<br><b>${ui(ok ? 'You duck!' : 'It hits you!')}</b>`;
      }});
  }
  const won = hits.them >= to;
  (won ? SFX.fanfare : SFX.bump)();
  await infoBox(snowScene(who, hits, won ? 'won' : 'lost'), `<p class="label center">${ui(won ? 'You win!' : 'They win!')}</p><p class="endmsg">${won ? ui('{hits}! They’re covered in snow.', {hits:[null, ui('One hit'), ui('Two hits'), ui('Three hits'), ui('Four hits'), ui('Five hits')][to] || to + ui(' hits')}) : ui('Covered in snow! You can play again whenever you like.')}</p>`);
  return won;
}
// The snowball step: a snowball fight with who you're talking to (snowball: the id it's kept under, how many times you've
// won; to: hits to win; prize: coins, the first time you win; win: steps when you win, lose: when you don't, such as what
// they say: 你赢了！ or 我赢了！).
Object.assign(STEP_OPTIONS, {snowball:['to', 'prize', 'win', 'lose']});
Object.assign(STEPS, {
  async snowball(s, who){
    const won = await snowballFight(who, {to:s.to || SNOWBALL.to}), first = won && !here()[s.snowball];
    if (won){ here()[s.snowball] = (here()[s.snowball] || 0) + 1; save(); }
    if (won && s.win) await runSteps(s.win, who);
    if (!won && s.lose) await runSteps(s.lose, who);
    if (first && s.prize){ earn(s.prize); save(); SFX.coin && SFX.coin(); toast(ui('+{n} {money} for winning your first snowball fight with them!', {n:s.prize, money:MONEY()})); }
  }
});
