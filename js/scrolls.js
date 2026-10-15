// The Story Scroll at the waterfall, the area checklist, the word test at the cave door, Today's words and the Word Scroll.

/* ================= STORY, SLEEP, SCROLL ================= */
function storyScroll(){
  return new Promise(res => {
    openCard(`<p class="label">Story Scroll · reading challenge</p><p class="small">Try reading it yourself before you look at the English. Tap any word you're unsure of.</p>
      ${STORY.map((s,i) => `<div class="sent" data-i="${i}">${lineHTML(s.t)}</div>`).join('')}
      <div class="gloss">Tap a word for its meaning.</div><div class="en" hidden>${STORY.map(s => esc(s.en)).join(' ')}</div>
      <div class="actions"><button class="btn grow" data-a="read">🔊 Read it to me</button><button class="btn" data-a="en">English</button><button class="btn primary" data-a="ok">Questions</button></div>`);
    bindTokens(sheet);
    on('[data-a=en]', () => { sheet.querySelector('.en').hidden = false; });
    on('[data-a=read]', () => {
      let i = 0;
      const next = () => {
        sheet.querySelectorAll('.sent').forEach(s => s.classList.remove('reading'));
        if (i >= STORY.length || modal.hidden) return;
        const el = sheet.querySelector(`.sent[data-i="${i}"]`); if (el){ el.classList.add('reading'); el.scrollIntoView({block:'nearest'}); }
        const text = STORY[i].t.join(''); i++;
        say(text, () => setTimeout(next, 250));
      };
      next();
    });
    on('[data-a=ok]', async () => {
      stopSpeech();
      let right = 0;
      const qs = [
        {t:['谁','在','石头','里','？'], opts:['🐒','🐦','🌸'], a:0},
        {t:['猴子','吃','什么','？'], opts:['🪨','🍑','🌿'], a:1},
        {t:['河','里','有','什么','？'], opts:['🌳','🐐','🐟'], a:2}
      ];
      for (const q of qs){
        say(q.t.join(''));
        const ok = await pictureQ({head:'<p class="label">Story question</p>', body: lineHTML(q.t) + '<div class="gloss">Tap a word for its meaning.</div>', options:q.opts, answerIdx:q.a});
        if (ok) right++;
      }
      const first = !S.story;
      S.story = true; if (first) S.peaches += 5; save(); buildMap();
      SFX.fanfare();
      openCard(`<div class="who" aria-hidden="true">📖</div><p class="label">First slice complete</p>
        <p>You got ${right} of 3 story questions.${first ? ' +5 🍑' : ''}</p>
        <p>Every word here comes from the opening of <i>The Rise of the Monkey King</i>. Open your book at page 8 and read to page 18. Count how many words you now recognise without the footnotes.</p>
        <p>You hear a heavy door roll open somewhere in the cliffs. That’s the way onward.</p>
        <div class="actions"><button class="btn primary" data-a="done">Keep playing</button></div>`);
      on('[data-a=done]', () => { closeCard(); if (first){ SFX.rumble(); shakeT = performance.now(); } res(); });
    });
  });
}
function areaChecklist(){
  return [
    ['Say hello to the old monkey', S.q.elder >= 1],
    ['Learn about animals from the old monkey', S.q.elder >= 2],
    [`Find the hidden animals in the grass (${metCount()}/${ANIMALS.length})`, metCount() >= ANIMALS.length],
    ['Bring the hungry monkey the fruit it wants', S.q.hungry === 3],
    ['Bring water to the thirsty monkey', S.q.thirsty === 3],
    ['Read the story at the waterfall', S.story],
    ['Pass the word test at the cave door', !!S.area1Done]
  ];
}
function checklistHTML(onlyLeft){
  const items = areaChecklist().filter(([t, done]) => !onlyLeft || (!done && !t.startsWith('Pass the word test')));
  return `<ul class="checklist">${items.map(([t, done]) => `<li class="${done ? 'done' : ''}">${esc(t)}</li>`).join('')}</ul>`;
}
function infoBox(who, html){
  return new Promise(res => {
    openCard(`<div class="who" aria-hidden="true">${who}</div>${html}<div class="actions"><button class="btn primary" data-a="ok">OK</button></div>`);
    on('[data-a=ok]', () => { closeCard(); res(); });
  });
}
const PASS = 0.8;
function wordTest(){
  return new Promise(res => {
    const words = shuffle(ORDER.filter(w => WORDS[w].pic && lvl(w) >= 1));
    const rounds = []; for (let i = 0; i < words.length; i += 4) rounds.push(words.slice(i, i + 4));
    if (rounds.length > 1 && rounds[rounds.length - 1].length < 3){ const last = rounds.pop(); rounds[rounds.length - 1].push(...last); }
    const missed = new Set();
    let r = 0, picked = null;
    function render(){
      const set = rounds[r], left = shuffle(set), right = shuffle(set);
      openCard(`<p class="label">Word test · ${r + 1} of ${rounds.length}</p>
        <p class="small">Tap a word, then tap its picture.</p>
        <div class="match"><div class="col">${left.map(w => `<button class="mw" data-w="${w}"><ruby>${w}<rt class="${S.pinyin ? '' : 'hid'}">${WORDS[w].py}</rt></ruby></button>`).join('')}</div>
        <div class="col">${right.map(w => `<button class="mp" data-w="${w}">${WORDS[w].pic}</button>`).join('')}</div></div>
        <div class="feedback" aria-live="polite"></div>
        <div class="actions"><button class="btn" data-a="quit" data-b>Stop test</button></div>`);
      picked = null;
      const fb = sheet.querySelector('.feedback');
      sheet.querySelectorAll('.mw').forEach(bt => bt.onclick = () => {
        if (bt.classList.contains('done')) return;
        sheet.querySelectorAll('.mw.sel').forEach(x => x.classList.remove('sel'));
        bt.classList.add('sel'); picked = bt.dataset.w; say(picked); fb.textContent = '';
      });
      sheet.querySelectorAll('.mp').forEach(bt => bt.onclick = () => {
        if (bt.classList.contains('done')) return;
        if (!picked){ fb.textContent = 'Tap a word first.'; return; }
        const wbtn = sheet.querySelector(`.mw[data-w="${picked}"]`);
        if (bt.dataset.w === picked){
          SFX.right(); bt.classList.add('done'); wbtn.classList.remove('sel'); wbtn.classList.add('done'); picked = null;
          if (![...sheet.querySelectorAll('.mw')].some(x => !x.classList.contains('done'))){
            setTimeout(() => { r++; if (r < rounds.length) render(); else finish(); }, 450);
          }
        } else {
          SFX.wrong(); missed.add(picked); bt.classList.add('shake'); setTimeout(() => bt.classList.remove('shake'), 400);
          fb.textContent = 'Not that one. Try again.';
        }
      });
      on('[data-a=quit]', () => { closeCard(); res(false); });
    }
    function finish(){
      const right = words.length - missed.size, need = Math.ceil(words.length * PASS), pass = right >= need;
      missed.forEach(w => { const rr = rec(w); rr.due = Date.now(); });
      save();
      if (pass) SFX.fanfare(); else SFX.wrong();
      openCard(`<div class="who" aria-hidden="true">${pass ? '🎉' : '📜'}</div>
        <p class="label">${pass ? 'Test passed!' : 'Not quite yet'}</p>
        <p>You matched <b>${right} of ${words.length}</b> words right first time. You needed ${need}.</p>
        ${missed.size ? `<p class="small">Words to practise:</p><div class="chips">${[...missed].map(w => `<button class="chip" data-w="${w}">${w}</button>`).join('')}</div><div class="gloss">Tap a word to hear it.</div>` : ''}
        ${pass ? '' : '<p>Walk around the mountain, look at things again and meet animals in the tall grass. Then come back to the door and try again.</p>'}
        <div class="actions"><button class="btn primary" data-a="ok">${pass ? 'Go through the door' : 'Back to the mountain'}</button></div>`);
      sheet.querySelectorAll('.chip').forEach(bt => bt.onclick = () => { const w = bt.dataset.w; say(w); sheet.querySelector('.gloss').innerHTML = `<b>${w}</b> ${WORDS[w].py} · ${esc(WORDS[w].en)}`; });
      on('[data-a=ok]', () => { closeCard(); res(pass); });
    }
    render();
  });
}
async function nextArea(){
  S.area1Done = true; save(); SFX.fanfare(); fadeT = performance.now();
  await sleep(700);
  await infoBox('⛰️', `<p class="label">Flower Fruit Mountain complete!</p>
    <div class="stats"><span>${ORDER.filter(w => lvl(w) > 0).length}/${ORDER.length} words</span><span>${S.friends.length} friends</span><span>🍑 ${S.peaches}</span></div>
    <p>The tunnel leads behind the waterfall to <b>水帘洞</b> (Water Curtain Cave), which is where the story goes next in your book.</p>
    <p class="small">That area isn’t built yet, so you’re back on the mountain for now. Your progress is saved.</p>`);
  pl.x = 3; pl.y = 4; pl.dir = 'down'; pl.px = pl.x*T; pl.py = pl.y*T; S.pos = {x:3, y:4, dir:'down'}; save();
}
function todaysWords(back){
  return new Promise(res => {
    const k = todayKey(), ids = S.today.d === k ? S.today.ids : [];
    const due = ORDER.filter(w => lvl(w) >= 1 && rec(w).due <= Date.now() + DAY).length;
    openCard(`<p class="label">Today’s words</p>
      ${ids.length ? `<div class="chips">${ids.map(w => `<button class="chip" data-w="${w}">${w}</button>`).join('')}</div>` : '<p>You haven’t met any words yet today.</p>'}
      <div class="gloss">Tap a word to hear it.</div>
      <p>${due} ${due === 1 ? 'word is' : 'words are'} due for review in the tall grass within a day.</p>
      <div class="actions"><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
    sheet.querySelectorAll('.chip').forEach(b => b.onclick = () => { const w = b.dataset.w; say(w); sheet.querySelector('.gloss').innerHTML = `<b>${w}</b> ${WORDS[w].py} · ${esc(WORDS[w].en)}`; });
    on('[data-a=ok]', () => { if (back) back(); else closeCard(); res(); });
  });
}
function openScroll(back){
  const seen = ORDER.filter(w => lvl(w) > 0).length;
  openCard(`<p class="label">Word Scroll · ${seen} of ${ORDER.length}</p>
    <p class="small">Gold squares show how well you know a word: seen, heard, read, used.${S.friends.length ? '<br>Friends: ' + S.friends.map(id => FRIEND_NAMES[id] || id).join(', ') : ''}</p>
    <div class="grid">${ORDER.map(w => lvl(w) > 0
      ? `<button class="card" data-w="${w}"><div class="c">${w}</div><div class="p">${WORDS[w].py}</div>${pips(w)}</button>`
      : `<div class="card unseen"><div class="c">？</div><div class="p"></div>${pips(w)}</div>`).join('')}</div>
    <div class="gloss" style="margin-top:10px">Tap a word to hear it and see its meaning.</div>
    <div class="actions"><button class="btn primary" data-a="ok" data-b>${back ? 'Back' : 'Close'}</button></div>`);
  sheet.querySelectorAll('.card[data-w]').forEach(b => b.onclick = () => {
    const w = b.dataset.w; say(w);
    sheet.querySelector('.gloss').innerHTML = `<b>${w}</b> ${WORDS[w].py} · ${esc(WORDS[w].en)}`;
    b.querySelector('.p').textContent = WORDS[w].py;
  });
  on('[data-a=ok]', () => { if (typeof back === 'function') back(); else closeCard(); });
}
