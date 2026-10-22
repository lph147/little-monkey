// The Story Scroll at the waterfall, the area checklist, the word test at the cave door, Today's words and the Word Scroll.

/* ================= STORY, SLEEP, SCROLL ================= */
// The story questions to ask now: a story sentence with a word missing, and pictures to fill the gap.
// Quizzes only use words you've caught: a question is left out if you haven't caught its answer, and
// its wrong answers are the first 2 you have caught.
function storyQuestions(){
  return AREA.storyQuestions.filter(q => lvl(q.answer) >= 1).map(q => {
    const wrong = q.options.filter(w => w !== q.answer && lvl(w) >= 1).slice(0, 2);
    return {t:toks(q.zh), en:q.en, options:shuffle([q.answer, ...wrong]), answer:q.answer};
  }).filter(q => q.options.length > 1);
}
function storyScroll(){
  return new Promise(res => {
    const firstRead = !here().story;   // the English shows under each sentence the first time; after that, behind English
    STORY.forEach(s => hear(s.t)); save();
    openCard(`<p class="label">Story Scroll</p><p class="small">Your story so far, in words you've met. Tap any word you're unsure of.</p>
      ${STORY.map((s,i) => `<div class="sent" data-i="${i}">${s.pic ? `<span class="spic" aria-hidden="true">${picHTML(s.pic)}</span>` : ''}<div>${lineHTML(s.t)}<div class="sentence-en" ${firstRead ? '' : 'hidden'}>${esc(s.en)}</div></div></div>`).join('')}
      <div class="gloss">Tap a word for its meaning.</div>
      <div class="actions"><button class="btn grow" data-a="read">🔊 Read it to me</button>${firstRead ? '<button class="btn primary" data-a="ok">Questions</button>'
        : '<button class="btn" data-a="en">English</button><button class="btn" data-a="ok">Questions</button><button class="btn primary" data-a="close" data-b>Close</button>'}</div>`);
    // (read before: A closes it, so the questions never start again by accident; they're on their own button)
    on('[data-a=close]', () => { stopSpeech(); closeCard(); res(); });
    bindTokens(sheet);
    on('[data-a=en]', e => { sheet.querySelectorAll('.sent .sentence-en').forEach(x => x.hidden = false); e.currentTarget.remove(); });
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
      const qs = storyQuestions();
      for (const q of qs) if (await gapQ({label:'Story question', t:q.t, en:q.en, gap:q.answer, options:q.options})) right++;
      const firstTime = !here().story, end = AREA.storyEnd;
      here().story = true; if (firstTime) S.shells += end.reward; save(); buildMap();
      SFX.fanfare();
      openCard(`<div class="who" aria-hidden="true">📖</div><p class="label">${end.title}</p>
        <p>${qs.length ? `You got ${right} of ${qs.length} story questions.` : ''}${firstTime ? ` +${end.reward} 🐚` : ''}</p>
        ${end.text.map(p => `<p>${p}</p>`).join('\n        ')}
        <div class="actions"><button class="btn primary" data-a="done">Keep playing</button></div>`);
      on('[data-a=done]', () => { closeCard(); if (firstTime && end.rumble){ SFX.rumble(); shakeT = performance.now(); } res(); });
    });
  });
}
// The area's checklist (areaChecklist() in js/world.js), just what you've found so far, and a line saying there's
// more if some hasn't been found yet. onlyLeft: just what's left before the exit test.
function checklistHTML(onlyLeft){
  const all = areaChecklist(), items = all.filter(([t, done, exitTest, found]) => found && (!onlyLeft || (!done && !exitTest)));
  const more = all.some(([, , , found]) => !found);
  return `<ul class="checklist">${items.map(([t, done]) => `<li class="${done ? 'done' : ''}"><span>${esc(t)}</span></li>`).join('')}${more ? '<li class="more">More to find as you play</li>' : ''}</ul>`;
}
function infoBox(who, html){   // who: a picture over it, or an animal's or a battle's scene, down its left as in the questions
  return new Promise(res => {
    const top = who.startsWith('<div class="scene') ? who : `<div class="who" aria-hidden="true">${who}</div>`;
    openCard(`${top}${html}<div class="actions"><button class="btn primary" data-a="ok">OK</button></div>`);
    on('[data-a=ok]', () => { closeCard(); res(); });
  });
}
const PASS = 0.8;
// Matching words to their pictures, in rounds of about 4 (the cave door test and the training ground).
// Gives the words you missed first time, or null if you stop.
function matchWords(words, title, stopLabel){
  return new Promise(res => {
    const rounds = []; for (let i = 0; i < words.length; i += 4) rounds.push(words.slice(i, i + 4));
    if (rounds.length > 1 && rounds[rounds.length - 1].length < 3){ const last = rounds.pop(); rounds[rounds.length - 1].push(...last); }
    const missed = new Set();
    let r = 0, picked = null, stopped = false;   // (stopped: the next round never comes, even if a round has just been matched)
    function render(){
      const set = rounds[r], left = shuffle(set), right = shuffle(set);
      openCard(`<p class="label">${title} · ${r + 1} of ${rounds.length}</p>
        <p class="small">Tap a word, then tap its picture.</p>
        <div class="match" data-nav><div class="col">${left.map(w => `<button class="mw" data-w="${w}"><ruby>${w}<rt class="${S.pinyin ? '' : 'hid'}">${WORDS[w].py}</rt></ruby></button>`).join('')}</div>
        <div class="col">${right.map(w => `<button class="mp" data-w="${w}">${picHTML(w)}</button>`).join('')}</div></div>
        <div class="feedback" aria-live="polite"></div>
        <div class="actions"><button class="btn" data-a="quit" data-b>${stopLabel}</button></div>`);
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
            setTimeout(() => { if (stopped) return; r++; if (r < rounds.length) render(); else res(missed); }, 450);
          }
        } else {
          SFX.wrong(); missed.add(picked); bt.classList.add('shake'); setTimeout(() => bt.classList.remove('shake'), 400);
          fb.textContent = 'Not that one. Try again.';
        }
      });
      on('[data-a=quit]', () => { stopped = true; closeCard(); res(null); });
    }
    render();
  });
}
// The words you missed, as chips you can tap to hear.
const missedHTML = missed => missed.size ? `<p class="small">Words to practise:</p><div class="chips">${[...missed].map(w => `<button class="chip" data-w="${w}"><ruby>${w}<rt class="${S.pinyin ? '' : 'hid'}">${WORDS[w].py}</rt></ruby></button>`).join('')}</div><div class="gloss">Tap a word to hear it.</div>` : '';
const bindMissed = () => sheet.querySelectorAll('.chip').forEach(bt => bt.onclick = () => { const w = bt.dataset.w; say(w); sheet.querySelector('.gloss').innerHTML = `<b>${w}</b> ${WORDS[w].py} · ${esc(WORDS[w].en)}`; });
async function wordTest(){   // the exit test at the cave door: every word with a picture you've caught
  const words = shuffle(ORDER.filter(w => WORDS[w].pic && lvl(w) >= 1));
  const missed = await matchWords(words, 'Word test', 'Stop test');
  if (!missed) return false;
  const right = words.length - missed.size, need = Math.ceil(words.length * PASS), pass = right >= need;
  missed.forEach(w => reviewed(w, false));   // missed: near the front of the review list
  save();
  if (pass) SFX.fanfare(); else SFX.wrong();
  return new Promise(res => {
    openCard(`<div class="who" aria-hidden="true">${pass ? '🏆' : '📜'}</div>
      <p class="label">${pass ? 'Test passed!' : 'Not quite yet'}</p>
      <p>You matched <b>${right} of ${words.length}</b> words right first time. You needed ${need}.</p>
      ${missedHTML(missed)}
      ${pass ? '' : `<p>${AREA.exit.tryAgain}</p>`}
      <div class="actions"><button class="btn primary" data-a="ok">${pass ? AREA.exit.passButton : AREA.exit.failButton}</button></div>`);
    bindMissed();
    on('[data-a=ok]', () => { closeCard(); res(pass); });
  });
}

/* ================= TRAINING GROUND ================= */
const TRAINING_WORDS = 8, TRAINING_MIN = 4;   // words to match per session, and how many you need to start
const trainable = () => ORDER.filter(w => WORDS[w].pic && lvl(w) >= 1);   // caught words with a picture
const unpictured = () => ORDER.filter(w => !WORDS[w].pic && lvl(w) >= 1);   // caught words without a picture (我 要), practised by filling gaps in sentences sentences
const practiceWords = () => [...trainable(), ...unpictured()].filter(needsPractice);   // words that need practice (new, or missed since), that you can practise
const trainingCalls = () => trainable().length >= TRAINING_MIN && practiceWords().length > 0;   // the practice post shows a !
// The words to practise: from the front of the review list (js/state.js), in a random order.
const trainingWords = () => shuffle(nextWords(trainable(), TRAINING_WORDS));
const SENTENCES = () => [...REQUESTS.flatMap(r => r.choices ? Object.values(r.choices) : [r]), ...(AREA.shop ? AREA.shop.items : []), ...(AREA.wardrobe || [])];   // the area's sentences you complete
// A sentence for practising a word without a picture (such as 我 or 要): one you've met in a request, the
// shop or the wardrobe, with every word caught, and that word missing (gap): the one nearest the front of the review
// list, preferring a word that needs practice.
function practiceSentence(){
  const all = SENTENCES().map(b => ({t:toks(b.sentence), en:b.sentenceEn})).filter(b => b.t.every(w => lvl(w) >= 1) && b.t.some(w => !WORDS[w].pic))
    .map(b => ({...b, gap:reviewOrder(shuffle(b.t.filter(w => !WORDS[w].pic)))[0]}));
  const need = all.filter(b => needsPractice(b.gap));
  return shuffle(need.length ? need : all)[0] || null;
}
// Fill the gap in a sentence (from practiceSentence). A right choice earns a shell if the word needed practice.
// Gives {right, shells}.
async function gapRound(b, who){
  const need = needsPractice(b.gap), right = await gapQ({who, t:b.t, en:b.en, gap:b.gap});
  const shells = right && need ? 1 : 0;
  S.shells += shells; save();
  return {right, shells};
}
// After a session: a word matched first time moves back in the review list, a missed one goes near the front (the
// gold squares stay the same). Each word that needed practice, matched first time, earns a shell. Gives how many shells.
function trained(words, missed){
  let shells = 0;
  for (const w of words){
    const ok = !missed.has(w);
    if (ok && needsPractice(w)) shells++;
    reviewed(w, ok);
    addToday(w);
  }
  S.shells += shells; save();
  return shells;
}
// A practice session: match words to their pictures, then fill the gap in a sentence. At the practice post, or in a
// lesson at school (the lesson step), with who's face; kind: what it's called. Gives whether you finished it.
const PRACTICE = {
  post:{what:'A practice post.', title:'Training', start:'Start', done:'Training done'},
  lesson:{what:'A lesson.', title:'Lesson', start:'Start', done:'Lesson over'}
};
async function trainingGround(){ await practise(`<img class="portrait" alt="" src="${SPR.post.toDataURL()}">`); }
async function practise(who, kind = PRACTICE.post){
  const have = trainable().length;
  if (have < TRAINING_MIN){ await infoBox(who, `<p>${kind.what} Come back once you've learned ${TRAINING_MIN} words with pictures (${have}/${TRAINING_MIN}).</p>`); return false; }
  const words = trainingWords(), sentence = practiceSentence();
  const need = [...words, ...(sentence ? [sentence.gap] : [])].filter(needsPractice).length;
  const ask = 'Practise matching words to their pictures' + (sentence ? `, then fill the gap in a sentence with ${wz(sentence.gap)}. ` : '. ') + (need
    ? `${need} of them ${need === 1 ? 'needs' : 'need'} practice: each one you get right first time earns a 🐚.`
    : 'None of these words need practice right now, so there are no 🐚 shells this time.');
  if (!await confirmBox(who, ask, kind.start, 'Not now')) return false;
  const missed = await matchWords(words, kind.title, 'Stop');
  if (!missed) return false;
  const right = words.length - missed.size, filled = sentence ? await gapRound(sentence, who) : null, shells = trained(words, missed) + (filled ? filled.shells : 0);
  SFX.fanfare();
  await new Promise(res => {
    openCard(`<div class="who" aria-hidden="true">${who}</div><p class="label">${kind.done}</p>
      <p>You matched <b>${right} of ${words.length}</b> words right first time.${filled ? (filled.right ? ' You filled the gap right.' : ' You filled the gap.') : ''}${shells ? ` +${shells} 🐚` : ''}</p>
      ${missedHTML(missed)}
      <div class="actions"><button class="btn primary" data-a="ok">OK</button></div>`);
    bindMissed();
    on('[data-a=ok]', () => { closeCard(); res(); });
  });
  return true;
}
async function nextArea(){
  here().done = true; save(); SFX.fanfare(); fadeT = performance.now();
  await sleep(700);
  await infoBox('⛰️', `<p class="label">${AREA.name.en} complete!</p>
    <div class="stats"><span>${ORDER.filter(w => lvl(w) > 0).length}/${ORDER.length} words</span><span>${S.friends.length} friends</span><span>🐚 ${S.shells}</span></div>
    <p>${AREA.exit.done}</p>
    <p class="small">${AREA.exit.notBuilt}</p>`);
  const back = AREA.exit.returnTo;   // until the next area is built, you're put back here
  S.pos = {place:placeOf(back), x:back.x, y:back.y, dir:back.facing}; placePlayer(); save();
}
const todaysWords = () => S.today.d === todayKey() ? S.today.ids.filter(w => WORDS[w] && lvl(w) > 0) : [];   // not words since removed from the game
function scrollCard(w){   // a word in the Word Scroll: caught, heard (a shadow of its picture, not giving it away) or not met yet
  if (lvl(w) > 0) return `<button class="card" data-w="${w}" data-label="Open">${WORDS[w].pic ? `<div class="c" aria-hidden="true">${picHTML(w)}</div><div class="hz">${w}</div>` : `<div class="c hz">${w}</div>`}<div class="p">${WORDS[w].py}</div>${pips(w)}</button>`;
  if (S.heard[w]) return `<div class="card heard" aria-label="Heard ${S.heard[w]} times, not caught yet"><div class="c sil" aria-hidden="true">${WORDS[w].pic ? picHTML(w) : '？'}</div><div class="p">heard ${S.heard[w]}×</div></div>`;
  return `<div class="card unseen"><div class="c">？</div><div class="p"></div></div>`;
}
const MASTERY = ['Caught', 'Recognised', 'Read', 'Used'];   // what each gold square means
// An example sentence with the word in it: the first line, then story sentence, that has it, preferring one you've seen.
// If none has it: the example written for it in the area, then a sentence you complete (such as 我要头带).
function exampleFor(w){
  const all = [...Object.values(L).map(l => [l, !!S.lines[l.t.join('')]]), ...STORY.map(s => [s, !!here().story])].filter(([s]) => s.t.includes(w));
  const pick = all.find(([, seen]) => seen) || all[0];
  if (pick) return pick[0];
  const ex = AREA.examples[w];
  if (ex) return {t:toks(ex.zh), en:ex.en};
  const done = SENTENCES().find(b => toks(b.sentence).includes(w));
  return done && {t:[...toks(done.sentence), '。'], en:done.sentenceEn};
}
function wordPage(w, back){   // a caught word's page in the Word Scroll
  const d = WORDS[w], ex = exampleFor(w);
  say(w);
  openCard(`<p class="label">Word Scroll · ${CATEGORIES[d.category].name}</p>
    <div class="word side"><div class="pic" aria-hidden="true">${picHTML(w)}</div><div class="big">${w}</div><div class="py">${d.py}</div><div class="en" hidden>${esc(d.en)}</div>
      <p class="mastery">${pips(w)} ${MASTERY[lvl(w) - 1]}</p><p class="note">Found: ${esc(fill(AREA.found[w] || AREA.name.en))}</p>
      ${ex ? `<p class="label examplehead">Example</p>${lineHTML(ex.t, w)}<div class="sentence-en" hidden>${esc(ex.en)}</div>${Object.keys(S.lines).length <= TAP_TIP_LINES ? '<div class="gloss">Tap any word to see what it means.</div>' : ''}` : ''}</div>
    <div class="actions"><button class="btn grow" data-a="say">🔊 Hear it</button><button class="btn" data-a="en">English</button><button class="btn primary" data-a="ok" data-b>Back</button></div>`);
  bindTokens(sheet);
  on('[data-a=say]', () => say(w));
  on('[data-a=en]', e => { sheet.querySelectorAll('.word .en, .sentence-en').forEach(x => x.hidden = false); e.currentTarget.remove(); const p = sheet.querySelector('.primary'); if (p) p.focus(); });
  on('[data-a=ok]', back);
}
const heardWords = () => Object.keys(GLOSS).filter(w => S.heard[w]).sort((a, b) => S.heard[b] - S.heard[a]);   // words this area doesn't teach, most heard first
const SCROLL_WORDS = () => [...ORDER, ...PHRASES];   // everything in the Word Scroll: the area's words, then its phrases
// The Word Scroll's tabs, as [id, name]: a tab for each category the area has words in (Phrases among them), then Today,
// then Heard once you've heard a word this area doesn't teach.
const scrollTabs = () => [
  ...Object.entries(CATEGORIES).filter(([id]) => SCROLL_WORDS().some(w => WORDS[w].category === id)).map(([id, c]) => [id, c.tab]),
  ['today', 'Today'], ...(heardWords().length ? [['heard', 'Heard']] : [])
];
let scrollTab = null;   // the tab the Word Scroll is open at; it opens there again next time
function scrollPage(tab){   // what a tab of the Word Scroll shows
  if (tab === 'today'){
    const ids = todaysWords(), need = practiceWords().length;
    return `<p class="label cathead">Today’s words <span class="catn">${ids.length}</span></p>
      ${ids.length ? `<div class="grid" data-nav>${ids.map(scrollCard).join('')}</div>` : '<p>You haven’t met any words yet today.</p>'}
      <p class="small">${need} ${need === 1 ? 'word needs' : 'words need'} practice: practise ${esc(practiseWhere())}, or meet animals in the tall grass.</p>`;
  }
  if (tab === 'heard'){
    const heard = heardWords();
    return `<p class="label cathead">Heard</p><p class="small">Words you've heard in sentences. You'll catch them in later areas.</p>
      <div class="chips" data-nav>${heard.map(w => `<button class="chip" data-h="${w}" data-label="Hear it"><ruby>${w}<rt class="${S.pinyin ? '' : 'hid'}">${info(w)[0]}</rt></ruby> <span class="small">${S.heard[w]}×</span></button>`).join('')}</div>`;
  }
  const ws = SCROLL_WORDS().filter(w => WORDS[w].category === tab);
  return `<p class="label cathead">${CATEGORIES[tab].name} <span class="catn">${ws.filter(w => lvl(w) > 0).length}/${ws.length}</span></p>
    <div class="grid" data-nav>${ws.map(scrollCard).join('')}</div>`;
}
function openScroll(back, top, tab){   // top: where to scroll to, to come back to the same place. tab: the tab to open at
  const tabs = scrollTabs();
  if (tab) scrollTab = tab;
  if (!tabs.some(([id]) => id === scrollTab)) scrollTab = tabs[0][0];
  const seen = ORDER.filter(w => lvl(w) > 0).length;
  openCard(`<p class="label">Word Scroll · ${seen} of ${ORDER.length}</p>
    <div class="scrolltabs" role="tablist">${tabs.map(([id, name]) => `<button class="tab" role="tab" data-tab="${id}" aria-selected="${id === scrollTab}">${name}</button>`).join('')}</div>
    ${scrollPage(scrollTab)}
    <div class="gloss">${scrollTab === 'heard' ? 'Tap a word to hear it.' : 'Tap a word to see its page.'}</div>
    <p class="small">Gold squares show how well you know a word: caught, recognised, read, used. Shadows are words you've heard but not caught yet.</p>
    <div class="actions"><button class="btn primary" data-a="ok" data-b>${back ? 'Back' : 'Close'}</button></div>`);
  if (top) sheet.scrollTop = top;
  const chosen = sheet.querySelector('.tab[aria-selected="true"]'), row = sheet.querySelector('.scrolltabs');
  if (chosen && row) row.scrollLeft = Math.max(0, chosen.offsetLeft - row.offsetLeft - 24) || 0;   // the tabs are one row: the chosen one in view
  sheet.querySelectorAll('.tab').forEach(b => b.onclick = () => { if (b.dataset.tab !== scrollTab){ SFX.turn(); openScroll(back, 0, b.dataset.tab); } });
  sheet.querySelectorAll('.card[data-w]').forEach(b => b.onclick = () => {
    const at = sheet.scrollTop;
    SFX.blip(); wordPage(b.dataset.w, () => {   // back from its page, still on the same word
      openScroll(back, at); const c = sheet.querySelector(`.card[data-w="${b.dataset.w}"]`); if (c){ markNav(c); c.focus({preventScroll:true}); }
    });
  });
  sheet.querySelectorAll('.chip[data-h]').forEach(b => b.onclick = () => {
    const w = b.dataset.h, [py, en] = info(w); say(w);
    sheet.querySelector('.gloss').innerHTML = `<b>${w}</b> ${py} · ${esc(en)}`;
  });
  on('[data-a=ok]', () => { if (typeof back === 'function') back(); else closeCard(); });
}
